drop table if exists public.payments cascade;
drop table if exists public.commerce_worker_heartbeats cascade;
drop table if exists public.commerce_audit_events cascade;
drop table if exists public.book_reservations cascade;
drop table if exists public.book_inquiries cascade;
drop table if exists public.reviews cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.wishlist_items cascade;
drop table if exists public.wishlists cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.carts cascade;
drop table if exists public.addresses cascade;
drop table if exists public.book_images cascade;
drop table if exists public.book_authors cascade;
drop table if exists public.book_categories cascade;
drop table if exists public.books cascade;
drop table if exists public.categories cascade;
drop table if exists public.authors cascade;
drop table if exists public.merchant_workspaces cascade;
drop table if exists public.customer_preferences cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_updated_at() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.reserve_secondhand_book(uuid, uuid, uuid, text) cascade;
drop function if exists public.release_reserved_book(uuid, uuid, text) cascade;
drop function if exists public.expire_stale_reservations() cascade;
drop function if exists public.checkout_reserved_cart(uuid, text) cascade;

drop type if exists public.review_status cascade;
drop type if exists public.address_type cascade;
drop type if exists public.payment_status cascade;
drop type if exists public.order_status cascade;
drop type if exists public.inventory_object_state cascade;
drop type if exists public.reservation_status cascade;
drop type if exists public.book_status cascade;
drop type if exists public.app_role cascade;

create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'merchant', 'admin');
create type public.book_status as enum ('draft', 'published', 'archived');
create type public.inventory_object_state as enum ('AVAILABLE', 'RESERVED', 'CHECKOUT_PENDING', 'SOLD', 'EXPIRED');
create type public.reservation_status as enum ('ACTIVE', 'CHECKOUT_PENDING', 'COMPLETED', 'EXPIRED', 'RELEASED');
create type public.order_status as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded');
create type public.address_type as enum ('shipping', 'billing');
create type public.review_status as enum ('pending', 'published', 'hidden');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role public.app_role,
  is_onboarded boolean not null default false,
  onboarding_step integer not null default 1 check (onboarding_step between 1 and 4),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customer_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  favorite_genres text[] not null default '{}',
  reading_interests text[] not null default '{}',
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.merchant_workspaces (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  store_name text not null,
  store_slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  support_email text,
  approved boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bio text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.profiles(id) on delete cascade,
  seller_email text not null,
  title text not null,
  slug text unique,
  subtitle text,
  description text not null,
  genre text not null,
  book_condition text not null default 'good',
  isbn text,
  language text default 'English',
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2),
  stock integer not null default 0 check (stock >= 0),
  inventory_state public.inventory_object_state not null default 'AVAILABLE',
  inventory_version integer not null default 0,
  cover_image_url text not null,
  gallery_urls text[] not null default '{}',
  status public.book_status not null default 'draft',
  is_featured boolean not null default false,
  average_rating numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.book_categories (
  book_id uuid not null references public.books(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (book_id, category_id)
);

create table public.book_authors (
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (book_id, author_id)
);

create table public.book_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  image_url text not null,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  recipient_name text not null,
  line_1 text not null,
  line_2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null,
  phone text,
  address_type public.address_type not null default 'shipping',
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (cart_id, book_id)
);

create table public.book_reservations (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  cart_id uuid references public.carts(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  status public.reservation_status not null default 'ACTIVE',
  idempotency_key text,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  released_at timestamptz,
  unique (buyer_id, idempotency_key)
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (wishlist_id, book_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  merchant_id uuid references public.profiles(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  checkout_idempotency_key text,
  subtotal numeric(10,2) not null default 0,
  shipping_total numeric(10,2) not null default 0,
  tax_total numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  placed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  reservation_id uuid references public.book_reservations(id) on delete set null,
  title_snapshot text not null,
  author_snapshot text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, book_id)
);

create table public.book_inquiries (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  seller_email text not null,
  buyer_email text not null,
  buyer_name text,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  amount numeric(10,2) not null check (amount >= 0),
  status public.payment_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.commerce_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.commerce_worker_heartbeats (
  worker_name text primary key,
  status text not null,
  heartbeat_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index profiles_role_idx on public.profiles(role);
create index profiles_onboarded_idx on public.profiles(is_onboarded, onboarding_step);
create index books_status_idx on public.books(status, is_featured, created_at desc);
create index books_merchant_idx on public.books(merchant_id, updated_at desc);
create index books_slug_idx on public.books(slug);
create index books_inventory_state_idx on public.books(inventory_state, status, updated_at desc);
create unique index book_reservations_one_active_book_idx
on public.book_reservations(book_id)
where status in ('ACTIVE', 'CHECKOUT_PENDING');
create index book_reservations_buyer_idx on public.book_reservations(buyer_id, status, expires_at desc);
create index book_reservations_expiry_idx on public.book_reservations(status, expires_at);
create unique index orders_checkout_idempotency_idx
on public.orders(user_id, checkout_idempotency_key)
where checkout_idempotency_key is not null;
create index authors_slug_idx on public.authors(slug);
create index categories_slug_idx on public.categories(slug);
create index orders_user_idx on public.orders(user_id, created_at desc);
create index orders_merchant_idx on public.orders(merchant_id, created_at desc);
create index reviews_book_idx on public.reviews(book_id, created_at desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

create trigger customer_preferences_updated_at
before update on public.customer_preferences
for each row execute procedure public.handle_updated_at();

create trigger merchant_workspaces_updated_at
before update on public.merchant_workspaces
for each row execute procedure public.handle_updated_at();

create trigger authors_updated_at
before update on public.authors
for each row execute procedure public.handle_updated_at();

create trigger categories_updated_at
before update on public.categories
for each row execute procedure public.handle_updated_at();

create trigger books_updated_at
before update on public.books
for each row execute procedure public.handle_updated_at();

create trigger addresses_updated_at
before update on public.addresses
for each row execute procedure public.handle_updated_at();

create trigger carts_updated_at
before update on public.carts
for each row execute procedure public.handle_updated_at();

create trigger cart_items_updated_at
before update on public.cart_items
for each row execute procedure public.handle_updated_at();

create trigger book_reservations_updated_at
before update on public.book_reservations
for each row execute procedure public.handle_updated_at();

create trigger wishlists_updated_at
before update on public.wishlists
for each row execute procedure public.handle_updated_at();

create trigger orders_updated_at
before update on public.orders
for each row execute procedure public.handle_updated_at();

create trigger payments_updated_at
before update on public.payments
for each row execute procedure public.handle_updated_at();

create trigger commerce_worker_heartbeats_updated_at
before update on public.commerce_worker_heartbeats
for each row execute procedure public.handle_updated_at();

create or replace function public.reserve_secondhand_book(
  p_book_id uuid,
  p_buyer_id uuid,
  p_cart_id uuid,
  p_idempotency_key text default null
)
returns table (
  reservation_id uuid,
  book_id uuid,
  expires_at timestamptz,
  state public.inventory_object_state
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_book public.books%rowtype;
  v_existing public.book_reservations%rowtype;
  v_reservation_id uuid;
  v_expires_at timestamptz := timezone('utc', now()) + interval '10 minutes';
begin
  select * into v_existing
  from public.book_reservations
  where book_reservations.book_id = p_book_id
    and book_reservations.buyer_id = p_buyer_id
    and book_reservations.status = 'ACTIVE'
    and book_reservations.expires_at > timezone('utc', now())
  order by book_reservations.created_at desc
  limit 1;

  if found then
    reservation_id := v_existing.id;
    book_id := v_existing.book_id;
    expires_at := v_existing.expires_at;
    state := 'RESERVED';
    return next;
    return;
  end if;

  select * into v_book
  from public.books
  where books.id = p_book_id
  for update;

  if not found then
    raise exception 'Book not found.' using errcode = 'P0002';
  end if;

  if v_book.status <> 'published' or v_book.stock < 1 or v_book.inventory_state not in ('AVAILABLE', 'EXPIRED') then
    raise exception 'Book is not available for reservation.' using errcode = 'P0001';
  end if;

  update public.books
  set inventory_state = 'RESERVED',
      inventory_version = inventory_version + 1,
      stock = 0
  where books.id = p_book_id
    and books.inventory_version = v_book.inventory_version;

  if not found then
    raise exception 'Inventory changed during reservation.' using errcode = '40001';
  end if;

  insert into public.book_reservations (book_id, cart_id, buyer_id, status, idempotency_key, expires_at)
  values (p_book_id, p_cart_id, p_buyer_id, 'ACTIVE', p_idempotency_key, v_expires_at)
  returning id into v_reservation_id;

  insert into public.commerce_audit_events (event_type, payload)
  values (
    'BOOK_RESERVED',
    jsonb_build_object('bookId', p_book_id, 'buyerId', p_buyer_id, 'reservationId', v_reservation_id, 'expiresAt', v_expires_at)
  );

  reservation_id := v_reservation_id;
  book_id := p_book_id;
  expires_at := v_expires_at;
  state := 'RESERVED';
  return next;
end;
$$;

create or replace function public.release_reserved_book(
  p_book_id uuid,
  p_buyer_id uuid,
  p_reason text default 'cart_removed'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.book_reservations%rowtype;
begin
  select * into v_reservation
  from public.book_reservations
  where book_reservations.book_id = p_book_id
    and book_reservations.buyer_id = p_buyer_id
    and book_reservations.status = 'ACTIVE'
  order by created_at desc
  limit 1
  for update;

  if not found then
    return;
  end if;

  update public.book_reservations
  set status = 'RELEASED',
      released_at = timezone('utc', now())
  where id = v_reservation.id;

  update public.books
  set inventory_state = 'AVAILABLE',
      stock = 1,
      inventory_version = inventory_version + 1
  where id = p_book_id
    and inventory_state = 'RESERVED';

  insert into public.commerce_audit_events (event_type, payload)
  values ('INVENTORY_RELEASED', jsonb_build_object('bookId', p_book_id, 'reason', p_reason));
end;
$$;

create or replace function public.expire_stale_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  v_row record;
begin
  for v_row in
    select id, book_id
    from public.book_reservations
    where status = 'ACTIVE'
      and expires_at <= timezone('utc', now())
    for update skip locked
  loop
    update public.book_reservations
    set status = 'EXPIRED',
        released_at = timezone('utc', now())
    where id = v_row.id;

    update public.books
    set inventory_state = 'EXPIRED',
        inventory_version = inventory_version + 1
    where id = v_row.book_id
      and inventory_state = 'RESERVED';

    update public.books
    set inventory_state = 'AVAILABLE',
        stock = 1,
        inventory_version = inventory_version + 1
    where id = v_row.book_id
      and inventory_state = 'EXPIRED';

    delete from public.cart_items
    where book_id = v_row.book_id;

    insert into public.commerce_audit_events (event_type, payload)
    values ('RESERVATION_EXPIRED', jsonb_build_object('bookId', v_row.book_id, 'reservationId', v_row.id));

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.checkout_reserved_cart(
  p_buyer_id uuid,
  p_idempotency_key text
)
returns table (
  order_id uuid,
  total numeric,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_id uuid;
  v_existing_order public.orders%rowtype;
  v_order_id uuid;
  v_subtotal numeric(10,2);
  v_book_count integer;
begin
  select * into v_existing_order
  from public.orders
  where user_id = p_buyer_id
    and checkout_idempotency_key = p_idempotency_key
  limit 1;

  if found then
    order_id := v_existing_order.id;
    total := v_existing_order.total;
    status := v_existing_order.payment_status::text;
    return next;
    return;
  end if;

  select id into v_cart_id
  from public.carts
  where user_id = p_buyer_id
  for update;

  if not found then
    raise exception 'Cart not found.' using errcode = 'P0002';
  end if;

  perform public.expire_stale_reservations();

  select count(*), coalesce(sum(ci.unit_price * ci.quantity), 0)
  into v_book_count, v_subtotal
  from public.cart_items ci
  join public.book_reservations br on br.book_id = ci.book_id
  join public.books b on b.id = ci.book_id
  where ci.cart_id = v_cart_id
    and br.buyer_id = p_buyer_id
    and br.status = 'ACTIVE'
    and br.expires_at > timezone('utc', now())
    and b.inventory_state = 'RESERVED'
    and ci.quantity = 1;

  if v_book_count = 0 then
    raise exception 'No active reservations are available for checkout.' using errcode = 'P0001';
  end if;

  update public.book_reservations
  set status = 'CHECKOUT_PENDING'
  where buyer_id = p_buyer_id
    and status = 'ACTIVE'
    and expires_at > timezone('utc', now())
    and book_id in (select book_id from public.cart_items where cart_id = v_cart_id);

  update public.books
  set inventory_state = 'CHECKOUT_PENDING',
      inventory_version = inventory_version + 1
  where id in (select book_id from public.cart_items where cart_id = v_cart_id)
    and inventory_state = 'RESERVED';

  insert into public.orders (user_id, status, payment_status, checkout_idempotency_key, subtotal, total, placed_at)
  values (p_buyer_id, 'paid', 'paid', p_idempotency_key, v_subtotal, v_subtotal, timezone('utc', now()))
  returning id into v_order_id;

  insert into public.order_items (order_id, book_id, reservation_id, title_snapshot, author_snapshot, quantity, unit_price)
  select v_order_id, b.id, br.id, b.title, b.author, 1, ci.unit_price
  from public.cart_items ci
  join public.books b on b.id = ci.book_id
  join public.book_reservations br on br.book_id = b.id and br.buyer_id = p_buyer_id
  where ci.cart_id = v_cart_id
    and br.status = 'CHECKOUT_PENDING';

  insert into public.payments (order_id, provider, provider_payment_id, amount, status, metadata)
  values (v_order_id, 'manual', p_idempotency_key, v_subtotal, 'paid', jsonb_build_object('idempotencyKey', p_idempotency_key));

  update public.book_reservations
  set status = 'COMPLETED',
      completed_at = timezone('utc', now())
  where buyer_id = p_buyer_id
    and status = 'CHECKOUT_PENDING'
    and book_id in (select book_id from public.cart_items where cart_id = v_cart_id);

  update public.books
  set inventory_state = 'SOLD',
      stock = 0,
      inventory_version = inventory_version + 1
  where id in (select book_id from public.cart_items where cart_id = v_cart_id)
    and inventory_state = 'CHECKOUT_PENDING';

  delete from public.cart_items where cart_id = v_cart_id;

  insert into public.commerce_audit_events (event_type, payload)
  values
    ('CHECKOUT_STARTED', jsonb_build_object('orderId', v_order_id, 'buyerId', p_buyer_id, 'idempotencyKey', p_idempotency_key)),
    ('PAYMENT_SUCCEEDED', jsonb_build_object('orderId', v_order_id, 'amount', v_subtotal, 'provider', 'manual'));

  insert into public.commerce_audit_events (event_type, payload)
  select 'BOOK_MARKED_SOLD', jsonb_build_object('bookId', oi.book_id, 'orderId', v_order_id)
  from public.order_items oi
  where oi.order_id = v_order_id;

  order_id := v_order_id;
  total := v_subtotal;
  status := 'paid';
  return next;
exception
  when others then
    update public.book_reservations
    set status = 'ACTIVE'
    where buyer_id = p_buyer_id
      and status = 'CHECKOUT_PENDING'
      and expires_at > timezone('utc', now());

    update public.books
    set inventory_state = 'RESERVED',
        inventory_version = inventory_version + 1
    where id in (
      select book_id
      from public.book_reservations
      where buyer_id = p_buyer_id and status = 'ACTIVE'
    )
      and inventory_state = 'CHECKOUT_PENDING';
    raise;
end;
$$;

create trigger reviews_updated_at
before update on public.reviews
for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.customer_preferences enable row level security;
alter table public.merchant_workspaces enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.book_categories enable row level security;
alter table public.book_authors enable row level security;
alter table public.book_images enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.book_reservations enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.payments enable row level security;
alter table public.book_inquiries enable row level security;
alter table public.commerce_audit_events enable row level security;
alter table public.commerce_worker_heartbeats enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "customer_preferences_own_all" on public.customer_preferences
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "merchant_workspaces_public_read" on public.merchant_workspaces
for select using (approved = true or auth.uid() = user_id);

create policy "merchant_workspaces_own_all" on public.merchant_workspaces
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "authors_public_read" on public.authors
for select using (true);

create policy "categories_public_read" on public.categories
for select using (true);

create policy "books_public_read_published" on public.books
for select using (status = 'published' or auth.uid() = merchant_id);

create policy "books_merchant_insert" on public.books
for insert with check (auth.uid() = merchant_id);

create policy "books_merchant_update" on public.books
for update using (auth.uid() = merchant_id);

create policy "books_merchant_delete" on public.books
for delete using (auth.uid() = merchant_id);

create policy "book_categories_public_read" on public.book_categories
for select using (true);

create policy "book_authors_public_read" on public.book_authors
for select using (true);

create policy "book_images_public_read" on public.book_images
for select using (true);

create policy "addresses_own_all" on public.addresses
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "carts_own_all" on public.carts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cart_items_via_cart" on public.cart_items
for all using (
  exists (
    select 1 from public.carts
    where public.carts.id = cart_items.cart_id
      and public.carts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.carts
    where public.carts.id = cart_items.cart_id
      and public.carts.user_id = auth.uid()
  )
);

create policy "book_reservations_buyer_read" on public.book_reservations
for select using (auth.uid() = buyer_id);

create policy "book_reservations_seller_read" on public.book_reservations
for select using (
  exists (
    select 1 from public.books
    where public.books.id = book_reservations.book_id
      and public.books.merchant_id = auth.uid()
  )
);

create policy "wishlists_own_all" on public.wishlists
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wishlist_items_via_wishlist" on public.wishlist_items
for all using (
  exists (
    select 1 from public.wishlists
    where public.wishlists.id = wishlist_items.wishlist_id
      and public.wishlists.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.wishlists
    where public.wishlists.id = wishlist_items.wishlist_id
      and public.wishlists.user_id = auth.uid()
  )
);

create policy "orders_customer_read" on public.orders
for select using (auth.uid() = user_id or auth.uid() = merchant_id);

create policy "orders_customer_insert" on public.orders
for insert with check (auth.uid() = user_id);

create policy "orders_customer_update" on public.orders
for update using (auth.uid() = user_id or auth.uid() = merchant_id);

create policy "order_items_related_read" on public.order_items
for select using (
  exists (
    select 1 from public.orders
    where public.orders.id = order_items.order_id
      and (public.orders.user_id = auth.uid() or public.orders.merchant_id = auth.uid())
  )
);

create policy "reviews_public_read_published" on public.reviews
for select using (status = 'published' or auth.uid() = user_id);

create policy "reviews_own_insert" on public.reviews
for insert with check (auth.uid() = user_id);

create policy "reviews_own_update" on public.reviews
for update using (auth.uid() = user_id);

create policy "payments_related_read" on public.payments
for select using (
  exists (
    select 1 from public.orders
    where public.orders.id = payments.order_id
      and (public.orders.user_id = auth.uid() or public.orders.merchant_id = auth.uid())
  )
);

create policy "commerce_audit_none" on public.commerce_audit_events
for select using (false);

create policy "commerce_worker_heartbeats_none" on public.commerce_worker_heartbeats
for select using (false);

create policy "book_inquiries_none" on public.book_inquiries
for select using (false);

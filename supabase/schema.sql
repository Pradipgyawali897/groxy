drop table if exists public.payments cascade;
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

drop type if exists public.review_status cascade;
drop type if exists public.address_type cascade;
drop type if exists public.payment_status cascade;
drop type if exists public.order_status cascade;
drop type if exists public.book_status cascade;
drop type if exists public.app_role cascade;

create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'merchant', 'admin');
create type public.book_status as enum ('draft', 'published', 'archived');
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

create index profiles_role_idx on public.profiles(role);
create index profiles_onboarded_idx on public.profiles(is_onboarded, onboarding_step);
create index books_status_idx on public.books(status, is_featured, created_at desc);
create index books_merchant_idx on public.books(merchant_id, updated_at desc);
create index books_slug_idx on public.books(slug);
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

create trigger wishlists_updated_at
before update on public.wishlists
for each row execute procedure public.handle_updated_at();

create trigger orders_updated_at
before update on public.orders
for each row execute procedure public.handle_updated_at();

create trigger payments_updated_at
before update on public.payments
for each row execute procedure public.handle_updated_at();

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
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.payments enable row level security;
alter table public.book_inquiries enable row level security;

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

create policy "book_inquiries_none" on public.book_inquiries
for select using (false);
-- Run this in Supabase SQL Editor
-- It creates a profile row for each authenticated user and enables strict RLS.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Separate service entities
create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  shipping_city text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchant_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  store_name text not null,
  business_email text not null,
  support_phone text,
  city text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_customer_profiles_updated_at on public.customer_profiles;
create trigger set_customer_profiles_updated_at
  before update on public.customer_profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_merchant_profiles_updated_at on public.merchant_profiles;
create trigger set_merchant_profiles_updated_at
  before update on public.merchant_profiles
  for each row execute procedure public.set_updated_at();

alter table public.customer_profiles enable row level security;
alter table public.merchant_profiles enable row level security;

drop policy if exists "Users can read own customer profile" on public.customer_profiles;
create policy "Users can read own customer profile"
  on public.customer_profiles
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own customer profile" on public.customer_profiles;
create policy "Users can insert own customer profile"
  on public.customer_profiles
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own customer profile" on public.customer_profiles;
create policy "Users can update own customer profile"
  on public.customer_profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own merchant profile" on public.merchant_profiles;
create policy "Users can read own merchant profile"
  on public.merchant_profiles
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own merchant profile" on public.merchant_profiles;
create policy "Users can insert own merchant profile"
  on public.merchant_profiles
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own merchant profile" on public.merchant_profiles;
create policy "Users can update own merchant profile"
  on public.merchant_profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Marketplace books managed by merchants.
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references auth.users(id) on delete cascade,
  seller_email text not null,
  title text not null,
  author text not null,
  description text not null,
  genre text not null,
  book_condition text not null check (book_condition in ('new', 'like_new', 'good', 'fair', 'poor')),
  language text not null default 'English',
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price >= 0),
  stock integer not null default 1 check (stock >= 0),
  cover_image_url text not null,
  gallery_urls text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_books_merchant_id on public.books(merchant_id);
create index if not exists idx_books_status on public.books(status);
create index if not exists idx_books_genre on public.books(genre);
create index if not exists idx_books_created_at on public.books(created_at desc);

drop trigger if exists set_books_updated_at on public.books;
create trigger set_books_updated_at
  before update on public.books
  for each row execute procedure public.set_updated_at();

alter table public.books enable row level security;

drop policy if exists "Anyone can view published books" on public.books;
create policy "Anyone can view published books"
  on public.books
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Merchants can view own books" on public.books;
create policy "Merchants can view own books"
  on public.books
  for select
  to authenticated
  using (auth.uid() = merchant_id);

drop policy if exists "Merchants can insert own books" on public.books;
create policy "Merchants can insert own books"
  on public.books
  for insert
  to authenticated
  with check (auth.uid() = merchant_id);

drop policy if exists "Merchants can update own books" on public.books;
create policy "Merchants can update own books"
  on public.books
  for update
  to authenticated
  using (auth.uid() = merchant_id)
  with check (auth.uid() = merchant_id);

drop policy if exists "Merchants can delete own books" on public.books;
create policy "Merchants can delete own books"
  on public.books
  for delete
  to authenticated
  using (auth.uid() = merchant_id);

-- Inquiry records for webhook and contact tracking.
create table if not exists public.book_inquiries (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  seller_email text not null,
  buyer_email text not null,
  buyer_name text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_book_inquiries_book_id on public.book_inquiries(book_id);
create index if not exists idx_book_inquiries_seller_email on public.book_inquiries(seller_email);

alter table public.book_inquiries enable row level security;

drop policy if exists "Sellers can read own inquiries" on public.book_inquiries;
create policy "Sellers can read own inquiries"
  on public.book_inquiries
  for select
  to authenticated
  using (seller_email = auth.jwt() ->> 'email');

drop policy if exists "Authenticated users can create inquiries" on public.book_inquiries;
create policy "Authenticated users can create inquiries"
  on public.book_inquiries
  for insert
  to authenticated
  with check (buyer_email = auth.jwt() ->> 'email');

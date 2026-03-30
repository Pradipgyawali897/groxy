-- Hybrid recommendation engine primitives for Groxy Books.
-- Run after `supabase/schema.sql`.
-- Safe to re-run (uses IF NOT EXISTS / exception guards where possible).

-- 1) Interaction event stream (views, wishlist, purchases)
do $$
begin
  create type public.book_event_type as enum ('view','wishlist_add','wishlist_remove','purchase');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.book_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  anon_session_id uuid,
  book_id uuid not null references public.books(id) on delete cascade,
  event_type public.book_event_type not null,
  event_weight numeric(6,3) not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  context jsonb not null default '{}'::jsonb,
  constraint book_events_actor_chk check (user_id is not null or anon_session_id is not null)
);

create index if not exists book_events_user_recent_idx on public.book_events(user_id, created_at desc);
create index if not exists book_events_sess_recent_idx on public.book_events(anon_session_id, created_at desc);
create index if not exists book_events_book_recent_idx on public.book_events(book_id, created_at desc);
create index if not exists book_events_type_recent_idx on public.book_events(event_type, created_at desc);

alter table public.book_events enable row level security;

do $$
begin
  create policy book_events_own_read
  on public.book_events
  for select
  using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy book_events_own_insert
  on public.book_events
  for insert
  with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

-- 2) Popularity with time-decay (refresh periodically)
drop materialized view if exists public.mv_book_popularity_14d;
create materialized view public.mv_book_popularity_14d as
select
  be.book_id,
  sum(
    case be.event_type
      when 'purchase' then 4.0
      when 'wishlist_add' then 2.0
      when 'view' then 0.2
      else 0.0
    end
    * exp(-0.15 * extract(epoch from (now() - be.created_at)) / 86400.0)
  ) as pop_score
from public.book_events be
where be.created_at >= now() - interval '14 days'
group by be.book_id;

create index if not exists mv_book_popularity_14d_book_idx on public.mv_book_popularity_14d(book_id);

-- 3) Collaborative filtering (item-item similarity via implicit feedback)
drop materialized view if exists public.mv_book_sim_cf;
create materialized view public.mv_book_sim_cf as
with user_item as (
  select
    coalesce(user_id, anon_session_id::uuid) as actor_id,
    book_id,
    sum(event_weight) as w
  from public.book_events
  where created_at >= now() - interval '180 days'
    and event_type in ('purchase','wishlist_add','view')
  group by 1,2
),
pairs as (
  select
    a.book_id as book_a,
    b.book_id as book_b,
    sum(a.w * b.w) as dot
  from user_item a
  join user_item b
    on a.actor_id = b.actor_id
   and a.book_id < b.book_id
  group by 1,2
),
norms as (
  select book_id, sqrt(sum(w*w)) as norm
  from user_item
  group by 1
)
select
  p.book_a,
  p.book_b,
  (p.dot / nullif(na.norm * nb.norm, 0))::double precision as sim
from pairs p
join norms na on na.book_id = p.book_a
join norms nb on nb.book_id = p.book_b
where p.dot > 0;

create index if not exists mv_book_sim_cf_a_idx on public.mv_book_sim_cf(book_a);
create index if not exists mv_book_sim_cf_b_idx on public.mv_book_sim_cf(book_b);

-- 4) Frequently bought together (co-occurrence in order_items)
drop materialized view if exists public.mv_fbt_pairs_180d;
create materialized view public.mv_fbt_pairs_180d as
with items as (
  select oi.order_id, oi.book_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.created_at >= now() - interval '180 days'
    and oi.book_id is not null
),
pairs as (
  select
    a.book_id as book_a,
    b.book_id as book_b,
    count(*)::int as co_count
  from items a
  join items b on b.order_id = a.order_id and a.book_id < b.book_id
  group by 1,2
)
select * from pairs;

create index if not exists mv_fbt_pairs_180d_a_idx on public.mv_fbt_pairs_180d(book_a);
create index if not exists mv_fbt_pairs_180d_b_idx on public.mv_fbt_pairs_180d(book_b);

-- 5) Recommendation cache (per user)
create table if not exists public.user_reco_cache (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  generated_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  book_ids uuid[] not null,
  scores double precision[] not null
);

create index if not exists user_reco_cache_expires_idx on public.user_reco_cache(expires_at);

alter table public.user_reco_cache enable row level security;

do $$
begin
  create policy user_reco_cache_own_read
  on public.user_reco_cache
  for select
  using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy user_reco_cache_own_write
  on public.user_reco_cache
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

-- 6) RPC: get recommendations (hybrid scoring)
create or replace function public.get_recommendations(
  p_user_id uuid,
  p_session_id uuid,
  p_limit int default 12
)
returns table (book_id uuid, score double precision)
language sql
security definer
set search_path = public
as $$
with
params as (
  select
    -- Never allow a caller to fetch another user's signals by passing a different UUID.
    -- For authed calls, `auth.uid()` is present; for anonymous calls it's NULL.
    auth.uid() as user_id,
    p_session_id as sid,
    greatest(1, least(coalesce(p_limit, 12), 50)) as lim
),
seeds as (
  select be.book_id, sum(be.event_weight) as w
  from public.book_events be, params p
  where p.user_id is not null
    and be.user_id = p.user_id
    and be.created_at >= now() - interval '90 days'
  group by 1

  union all

  select be.book_id, sum(be.event_weight) as w
  from public.book_events be, params p
  where p.sid is not null
    and be.anon_session_id = p.sid
    and be.created_at >= now() - interval '7 days'
  group by 1
),
seed_norm as (
  select book_id, sum(w) as w from seeds group by 1
),
seed_books as (
  select
    s.book_id,
    s.w,
    b.genre,
    b.author
  from seed_norm s
  join public.books b on b.id = s.book_id
),
pref_genre as (
  select genre, sum(w) as w
  from seed_books
  group by 1
),
pref_author as (
  select author, sum(w) as w
  from seed_books
  group by 1
),
cf as (
  select
    case when m.book_a = s.book_id then m.book_b else m.book_a end as book_id,
    sum(m.sim * s.w) as cf_score
  from public.mv_book_sim_cf m
  join seed_norm s on (m.book_a = s.book_id or m.book_b = s.book_id)
  group by 1
),
pop as (
  select book_id, log(1 + pop_score)::double precision as pop_score
  from public.mv_book_popularity_14d
),
seen as (
  select distinct be.book_id
  from public.book_events be, params p
  where (p.user_id is not null and be.user_id = p.user_id)
     or (p.sid is not null and be.anon_session_id = p.sid)
),
base_candidates as (
  -- union CF-driven + popularity-driven to guarantee coverage for cold start
  select book_id from cf
  union
  select book_id from pop
),
scored as (
  select
    b.id as book_id,
    -- popularity (cold start + tie-break)
    coalesce(pop.pop_score, 0) as pop_score,
    -- collaborative filtering
    coalesce(cf.cf_score, 0) as cf_score,
    -- content-based preference (genre + author overlap)
    coalesce((select pg.w from pref_genre pg where pg.genre = b.genre), 0) as genre_pref,
    coalesce((select pa.w from pref_author pa where pa.author = b.author), 0) as author_pref
  from public.books b
  join base_candidates c on c.book_id = b.id
  left join pop on pop.book_id = b.id
  left join cf on cf.book_id = b.id
  where b.status = 'published'
    and not exists (select 1 from seen where seen.book_id = b.id)
),
final as (
  select
    book_id,
    (
      0.20 * pop_score +
      0.45 * cf_score +
      0.20 * coalesce(least(1.0, genre_pref / nullif((select max(w) from pref_genre), 0)), 0) +
      0.15 * coalesce(least(1.0, author_pref / nullif((select max(w) from pref_author), 0)), 0)
    )::double precision as score
  from scored
)
select f.book_id, f.score
from final f
order by f.score desc
limit (select lim from params);
$$;

-- 7) RPC: refresh my cache (called from app routes after high-signal events like wishlist add)
create or replace function public.refresh_my_reco_cache(
  p_limit int default 24,
  p_ttl_seconds int default 600
)
returns table (book_id uuid, score double precision)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit int := greatest(1, least(coalesce(p_limit, 24), 50));
  v_ttl int := greatest(60, least(coalesce(p_ttl_seconds, 600), 86400));
  v_ids uuid[] := '{}'::uuid[];
  v_scores double precision[] := '{}'::double precision[];
begin
  if v_user_id is null then
    return;
  end if;

  for book_id, score in
    select r.book_id, r.score
    from public.get_recommendations(v_user_id, null, v_limit) r
  loop
    v_ids := array_append(v_ids, book_id);
    v_scores := array_append(v_scores, score);
  end loop;

  insert into public.user_reco_cache(user_id, generated_at, expires_at, book_ids, scores)
  values (v_user_id, now(), now() + make_interval(secs => v_ttl), v_ids, v_scores)
  on conflict (user_id) do update
  set generated_at = excluded.generated_at,
      expires_at = excluded.expires_at,
      book_ids = excluded.book_ids,
      scores = excluded.scores;

  return query
  select unnest(v_ids) as book_id, unnest(v_scores) as score;
end;
$$;

-- 8) RPC: frequently bought together for a book
create or replace function public.get_fbt(
  p_book_id uuid,
  p_limit int default 6
)
returns table (book_id uuid, score double precision)
language sql
security definer
set search_path = public
as $$
with params as (
  select p_book_id as bid, greatest(1, least(coalesce(p_limit, 6), 20)) as lim
),
pairs as (
  select
    case when book_a = (select bid from params) then book_b else book_a end as book_id,
    co_count::double precision as score
  from public.mv_fbt_pairs_180d
  where book_a = (select bid from params) or book_b = (select bid from params)
)
select p.book_id, p.score
from pairs p
order by p.score desc
limit (select lim from params);
$$;

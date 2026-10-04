-- Uniform Exchange database schema for Supabase (Postgres).
-- Run this whole file once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It is safe to re-run: it only creates what is missing.
--
-- The Express server talks to these tables with the service_role key, which bypasses
-- Row Level Security. RLS is enabled with no policies so the public anon key cannot
-- read or write these tables directly.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (app-level user data)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

alter table public.profiles add column if not exists email        text;
alter table public.profiles add column if not exists full_name    text not null default '';
alter table public.profiles add column if not exists student_id   text;
alter table public.profiles add column if not exists program      text not null default '';
alter table public.profiles add column if not exists year_level   text not null default '';
alter table public.profiles add column if not exists avatar       text not null default '';
alter table public.profiles add column if not exists role         text not null default 'student';
alter table public.profiles add column if not exists verified     boolean not null default false;
alter table public.profiles add column if not exists banned       boolean not null default false;
alter table public.profiles add column if not exists rating_avg   numeric(2,1) not null default 0;
alter table public.profiles add column if not exists rating_count integer not null default 0;
alter table public.profiles add column if not exists created_at   timestamptz not null default now();
alter table public.profiles add column if not exists updated_at   timestamptz not null default now();

create unique index if not exists profiles_student_id_key on public.profiles (student_id);

do $$ begin
  alter table public.profiles add constraint profiles_role_check check (role in ('student', 'admin'));
exception when duplicate_object then null; end $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically whenever someone signs up (data comes from signUp options.data)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, student_id, program, year_level)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'student_id', ''),
    coalesce(new.raw_user_meta_data ->> 'program', ''),
    coalesce(new.raw_user_meta_data ->> 'year_level', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts that already exist
insert into public.profiles (id, email, full_name, student_id, program, year_level)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'student_id', ''),
  coalesce(u.raw_user_meta_data ->> 'program', ''),
  coalesce(u.raw_user_meta_data ->> 'year_level', '')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- listings: uniforms posted for sale / exchange
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id              uuid primary key default gen_random_uuid(),
  seller          uuid not null references public.profiles (id) on delete cascade,
  title           text not null check (char_length(title) between 1 and 100),
  description     text not null default '' check (char_length(description) <= 1000),
  category        text not null check (category in ('Uniform Shirt', 'Pants / Skirt', 'PE Uniform', 'Accessories')),
  size            text not null,
  condition       text not null check (condition in ('New', 'Like New', 'Good', 'Fair')),
  price           numeric(10,2) not null default 0 check (price >= 0),
  exchange_option text not null default 'Buy Only' check (exchange_option in ('Buy Only', 'Exchange Only', 'Buy or Exchange')),
  quantity        integer not null default 1 check (quantity >= 1),
  images          text[] not null default '{}' check (cardinality(images) <= 5),
  status          text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists listings_seller_idx on public.listings (seller);
create index if not exists listings_status_created_idx on public.listings (status, created_at desc);

drop trigger if exists listings_updated_at on public.listings;
create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- requests: a buyer asking to buy or swap for a listing
-- ---------------------------------------------------------------------------
create table if not exists public.requests (
  id         uuid primary key default gen_random_uuid(),
  listing    uuid not null references public.listings (id) on delete cascade,
  buyer      uuid not null references public.profiles (id) on delete cascade,
  seller     uuid not null references public.profiles (id) on delete cascade,
  option     text not null default 'Buy' check (option in ('Buy', 'Exchange')),
  message    text not null default '' check (char_length(message) <= 500),
  status     text not null default 'pending'
             check (status in ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists requests_buyer_idx on public.requests (buyer);
create index if not exists requests_seller_idx on public.requests (seller);
create index if not exists requests_listing_idx on public.requests (listing);

drop trigger if exists requests_updated_at on public.requests;
create trigger requests_updated_at before update on public.requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- conversations + messages: chat between two users about a listing
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  participants    uuid[] not null,
  listing         uuid references public.listings (id) on delete set null,
  last_message    text not null default '',
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists conversations_participants_idx on public.conversations using gin (participants);

drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  conversation uuid not null references public.conversations (id) on delete cascade,
  sender       uuid not null references public.profiles (id) on delete cascade,
  text         text not null default '',
  image        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation, created_at);

-- ---------------------------------------------------------------------------
-- reviews: rating left after a completed exchange
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  reviewer   uuid not null references public.profiles (id) on delete cascade,
  reviewee   uuid not null references public.profiles (id) on delete cascade,
  request    uuid not null references public.requests (id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text not null default '' check (char_length(comment) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reviewer, request) -- one review per person per exchange
);

create index if not exists reviews_reviewee_idx on public.reviews (reviewee);

-- ---------------------------------------------------------------------------
-- reports: users flagging a user or listing for admins
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter    uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('user', 'listing')),
  target_id   uuid not null,
  reason      text not null check (char_length(reason) between 1 and 500),
  status      text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists reports_updated_at on public.reports;
create trigger reports_updated_at before update on public.reports
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Lock tables down: only the server (service_role) may access them
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.listings      enable row level security;
alter table public.requests      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.reviews       enable row level security;
alter table public.reports       enable row level security;

-- Make sure the server key can reach the tables even if the project was created
-- with "automatically expose new tables" turned off
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

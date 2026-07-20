-- Karuta — Supabase setup
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- on a fresh project. Reconstructed from docs/superpowers/specs/
-- 2026-04-13-anime-collector-shelf-design.md and the columns the app
-- actually reads/writes (src/stores/collection-store.ts, src/lib/types.ts).

-- ============ profiles (extends auth.users) ============
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ collected_anime ============
create type public.anime_category as enum
  ('watching', 'watched', 'plan_to_watch', 'favorite');

create table public.collected_anime (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mal_id integer not null,
  title text not null,
  image_url text,
  score double precision not null default 0,
  rating integer check (rating between 1 and 10),
  category public.anime_category not null default 'plan_to_watch',
  current_episode integer not null default 0,
  total_episodes integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, mal_id)
);

alter table public.collected_anime enable row level security;

create policy "Collection rows are viewable by owner"
  on public.collected_anime for select using (auth.uid() = user_id);

create policy "Collection rows are insertable by owner"
  on public.collected_anime for insert with check (auth.uid() = user_id);

create policy "Collection rows are updatable by owner"
  on public.collected_anime for update using (auth.uid() = user_id);

create policy "Collection rows are deletable by owner"
  on public.collected_anime for delete using (auth.uid() = user_id);

create index collected_anime_user_idx on public.collected_anime (user_id);

-- ============ collected_characters ============
create table public.collected_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mal_id integer not null,
  name text not null,
  image_url text,
  anime_mal_id integer not null,
  created_at timestamptz not null default now()
);

alter table public.collected_characters enable row level security;

create policy "Character rows are viewable by owner"
  on public.collected_characters for select using (auth.uid() = user_id);

create policy "Character rows are insertable by owner"
  on public.collected_characters for insert with check (auth.uid() = user_id);

create policy "Character rows are deletable by owner"
  on public.collected_characters for delete using (auth.uid() = user_id);

create index collected_characters_user_idx on public.collected_characters (user_id);

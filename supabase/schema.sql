-- Run this in the Supabase SQL Editor (https://app.supabase.com → SQL Editor)

create table if not exists public.watchlist (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  film_id     integer not null,
  film_title  text not null,
  poster_path text,
  status      text not null check (status in ('watching', 'to_watch', 'watched')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  unique (user_id, film_id)
);

-- Enable Row Level Security
alter table public.watchlist enable row level security;

-- Users can only see their own rows
create policy "select_own" on public.watchlist
  for select using (auth.uid() = user_id);

-- Users can only insert their own rows
create policy "insert_own" on public.watchlist
  for insert with check (auth.uid() = user_id);

-- Users can only update their own rows
create policy "update_own" on public.watchlist
  for update using (auth.uid() = user_id);

-- Users can only delete their own rows
create policy "delete_own" on public.watchlist
  for delete using (auth.uid() = user_id);

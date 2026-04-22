-- Run this in the Supabase SQL Editor after the main schema.sql

create table if not exists public.user_platforms (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  provider_id  integer not null,
  provider_name text not null,
  logo_path    text not null,
  created_at   timestamptz default now() not null,
  unique (user_id, provider_id)
);

alter table public.user_platforms enable row level security;

create policy "select_own" on public.user_platforms
  for select using (auth.uid() = user_id);

create policy "insert_own" on public.user_platforms
  for insert with check (auth.uid() = user_id);

create policy "delete_own" on public.user_platforms
  for delete using (auth.uid() = user_id);

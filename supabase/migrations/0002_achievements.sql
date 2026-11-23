-- Achievements / certificates for the Deep Dark section.
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Safe to run after 0001_init.sql; it only adds a new table.

create extension if not exists pgcrypto;

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{"en":"","id":""}'::jsonb,
  issuer text not null default '',
  description jsonb not null default '{"en":"","id":""}'::jsonb,
  year text,
  certificate_url text,
  link_url text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists achievements_published_sort_idx
  on public.achievements (published, sort_order);

grant usage on schema public to anon, authenticated;
grant select on public.achievements to anon;
grant all on public.achievements to authenticated;

alter table public.achievements enable row level security;

drop policy if exists "achievements_public_read" on public.achievements;
create policy "achievements_public_read" on public.achievements
  for select using (published = true or auth.role() = 'authenticated');

drop policy if exists "achievements_admin_write" on public.achievements;
create policy "achievements_admin_write" on public.achievements
  for all to authenticated using (true) with check (true);

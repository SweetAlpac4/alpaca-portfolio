-- Portfolio schema, RLS, storage policies, and starter content.
-- Run this once in Supabase → SQL Editor → New query → Run.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{"en":"","id":""}'::jsonb,
  role jsonb not null default '{"en":"","id":""}'::jsonb,
  tagline jsonb not null default '{"en":"","id":""}'::jsonb,
  bio jsonb not null default '{"en":"","id":""}'::jsonb,
  location jsonb not null default '{"en":"","id":""}'::jsonb,
  email text not null default '',
  avatar_url text,
  resume_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title jsonb not null default '{"en":"","id":""}'::jsonb,
  description jsonb not null default '{"en":"","id":""}'::jsonb,
  tech text[] not null default '{}',
  image_url text,
  demo_url text,
  repo_url text,
  year text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  tier text not null default 'coal'
    check (tier in ('coal', 'iron', 'gold', 'diamond', 'netherite')),
  category jsonb not null default '{"en":"","id":""}'::jsonb,
  sort_order integer not null default 0
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'education'
    check (kind in ('education', 'organization', 'work')),
  company text not null default '',
  role jsonb not null default '{"en":"","id":""}'::jsonb,
  period text not null default '',
  description jsonb not null default '{"en":"","id":""}'::jsonb,
  logo_url text,
  sort_order integer not null default 0
);

create table if not exists public.socials (
  id uuid primary key default gen_random_uuid(),
  platform text not null default '',
  url text not null default '',
  label text not null default '',
  icon text not null default 'link',
  sort_order integer not null default 0
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.profile, public.projects, public.skills,
  public.experiences, public.socials, public.settings to anon;
grant all on public.profile, public.projects, public.skills,
  public.experiences, public.socials, public.settings to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.socials enable row level security;
alter table public.settings enable row level security;

drop policy if exists "profile_public_read" on public.profile;
create policy "profile_public_read" on public.profile
  for select using (true);
drop policy if exists "profile_admin_write" on public.profile;
create policy "profile_admin_write" on public.profile
  for all to authenticated using (true) with check (true);

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select using (published = true or auth.role() = 'authenticated');
drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read" on public.skills
  for select using (true);
drop policy if exists "skills_admin_write" on public.skills;
create policy "skills_admin_write" on public.skills
  for all to authenticated using (true) with check (true);

drop policy if exists "experiences_public_read" on public.experiences;
create policy "experiences_public_read" on public.experiences
  for select using (true);
drop policy if exists "experiences_admin_write" on public.experiences;
create policy "experiences_admin_write" on public.experiences
  for all to authenticated using (true) with check (true);

drop policy if exists "socials_public_read" on public.socials;
create policy "socials_public_read" on public.socials
  for select using (true);
drop policy if exists "socials_admin_write" on public.socials;
create policy "socials_admin_write" on public.socials
  for all to authenticated using (true) with check (true);

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings
  for select using (true);
drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage bucket and policies (public read, authenticated write)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- ---------------------------------------------------------------------------
-- Starter content (only inserted when the tables are empty)
-- ---------------------------------------------------------------------------

insert into public.profile (name, role, tagline, bio, location, email)
select
  $json${"en":"Alex","id":"Alex"}$json$::jsonb,
  $json${"en":"Full-stack Developer","id":"Full-stack Developer"}$json$::jsonb,
  $json${"en":"I build calm, durable interfaces — one block at a time.","id":"Saya membangun antarmuka yang rapi dan tahan lama — satu blok demi satu blok."}$json$::jsonb,
  $json${"en":"A developer who likes systems that are simple to read, fast to use, and pleasant to look at. Currently exploring web engineering, networking, and the occasional pixel.","id":"Developer yang menyukai sistem yang mudah dibaca, cepat dipakai, dan enak dilihat. Sedang mendalami web engineering, networking, dan sesekali pixel."}$json$::jsonb,
  $json${"en":"Indonesia","id":"Indonesia"}$json$::jsonb,
  'hello@example.com'
where not exists (select 1 from public.profile);

insert into public.projects
  (title, description, tech, year, published, sort_order)
select *
from (values
  (
    $json${"en":"SimKuliah","id":"SimKuliah"}$json$::jsonb,
    $json${"en":"A campus academic information system for schedules, grades, and course planning.","id":"Sistem informasi akademik kampus untuk jadwal, nilai, dan perencanaan mata kuliah."}$json$::jsonb,
    array['Laravel', 'MySQL', 'Tailwind'],
    '2025', true, 0
  ),
  (
    $json${"en":"IPSec Dashboard","id":"Dashboard IPSec"}$json$::jsonb,
    $json${"en":"Monitoring and configuration panel for site-to-site IPSec tunnels.","id":"Panel monitoring dan konfigurasi untuk tunnel IPSec site-to-site."}$json$::jsonb,
    array['Node.js', 'Vue', 'Linux'],
    '2025', true, 1
  ),
  (
    $json${"en":"Cupid Music Player","id":"Cupid Music Player"}$json$::jsonb,
    $json${"en":"A small desktop music player with playlists, lyrics, and a soft visualizer.","id":"Pemutar musik desktop kecil dengan playlist, lirik, dan visualizer yang lembut."}$json$::jsonb,
    array['Electron', 'React', 'Web Audio'],
    '2024', true, 2
  )
) as v(title, description, tech, year, published, sort_order)
where not exists (select 1 from public.projects);

insert into public.skills (name, tier, category, sort_order)
select *
from (values
  ('TypeScript', 'diamond', $json${"en":"Languages","id":"Bahasa"}$json$::jsonb, 0),
  ('Python', 'gold', $json${"en":"Languages","id":"Bahasa"}$json$::jsonb, 1),
  ('React', 'diamond', $json${"en":"Frontend","id":"Frontend"}$json$::jsonb, 2),
  ('CSS', 'gold', $json${"en":"Frontend","id":"Frontend"}$json$::jsonb, 3),
  ('Node.js', 'iron', $json${"en":"Backend","id":"Backend"}$json$::jsonb, 4),
  ('PostgreSQL', 'iron', $json${"en":"Backend","id":"Backend"}$json$::jsonb, 5),
  ('Linux', 'gold', $json${"en":"Tools","id":"Perkakas"}$json$::jsonb, 6),
  ('Docker', 'coal', $json${"en":"Tools","id":"Perkakas"}$json$::jsonb, 7)
) as v(name, tier, category, sort_order)
where not exists (select 1 from public.skills);

insert into public.experiences
  (kind, company, role, period, description, sort_order)
select *
from (values
  (
    'education',
    'University',
    $json${"en":"Computer Science","id":"Ilmu Komputer"}$json$::jsonb,
    '2022 — Present',
    $json${"en":"Focused on software engineering, computer networks, and distributed systems.","id":"Fokus pada rekayasa perangkat lunak, jaringan komputer, dan sistem terdistribusi."}$json$::jsonb,
    0
  ),
  (
    'organization',
    'Student Association',
    $json${"en":"Technology Division","id":"Divisi Teknologi"}$json$::jsonb,
    '2023 — 2024',
    $json${"en":"Built internal tools and organized workshops for new members.","id":"Membangun tools internal dan mengadakan workshop untuk anggota baru."}$json$::jsonb,
    1
  ),
  (
    'work',
    'Freelance',
    $json${"en":"Web Developer","id":"Web Developer"}$json$::jsonb,
    '2023 — Present',
    $json${"en":"Delivered small business websites and internal dashboards.","id":"Mengerjakan website usaha kecil dan dashboard internal."}$json$::jsonb,
    2
  )
) as v(kind, company, role, period, description, sort_order)
where not exists (select 1 from public.experiences);

insert into public.socials (platform, url, label, icon, sort_order)
select *
from (values
  ('GitHub', 'https://github.com/', '@github', 'github', 0),
  ('LinkedIn', 'https://linkedin.com/', 'in/you', 'linkedin', 1),
  ('Email', 'mailto:hello@example.com', 'hello@example.com', 'mail', 2),
  ('Instagram', 'https://instagram.com/', '@you', 'instagram', 3)
) as v(platform, url, label, icon, sort_order)
where not exists (select 1 from public.socials);

insert into public.settings (key, value)
values
  (
    'credits',
    $json${"en":"Thanks for walking through the world.\nEvery biome here was built with care — and a little redstone.","id":"Terima kasih sudah berjalan menyusuri dunia ini.\nSetiap biome dibangun dengan hati — dan sedikit redstone."}$json$::jsonb
  ),
  (
    'seo_title',
    $json${"en":"Portfolio — A Minecraft Journey","id":"Portofolio — Perjalanan Minecraft"}$json$::jsonb
  ),
  (
    'seo_description',
    $json${"en":"Personal portfolio presented as a journey through Minecraft biomes.","id":"Portofolio pribadi yang disajikan sebagai perjalanan melalui biome Minecraft."}$json$::jsonb
  )
on conflict (key) do nothing;

-- Gilgamesh booking widget — run in Supabase SQL Editor or via CLI migrations.
-- Tighten RLS before production (anon policies below are for prototyping only).

create table if not exists public.reservations (
  id text primary key,
  created_at timestamptz not null default now(),
  guests integer not null check (guests >= 0),
  service text not null,
  date_iso text not null default '',
  time text not null default '',
  name text not null,
  email text not null,
  phone text not null default ''
);

create table if not exists public.dining_customizations (
  reservation_id text primary key references public.reservations (id) on delete cascade,
  updated_at timestamptz not null default now(),
  guest_count integer not null check (guest_count >= 1),
  seats jsonb not null default '[]'::jsonb,
  notes text
);

create index if not exists reservations_created_at_idx on public.reservations (created_at desc);

alter table public.reservations enable row level security;
alter table public.dining_customizations enable row level security;

-- PROTOTYPE: allow anon read/write (replace with auth or Edge Functions for production)
create policy "reservations_select_anon" on public.reservations for select using (true);
create policy "reservations_insert_anon" on public.reservations for insert with check (true);
create policy "reservations_update_anon" on public.reservations for update using (true) with check (true);
create policy "reservations_delete_anon" on public.reservations for delete using (true);

create policy "dining_select_anon" on public.dining_customizations for select using (true);
create policy "dining_insert_anon" on public.dining_customizations for insert with check (true);
create policy "dining_update_anon" on public.dining_customizations for update using (true) with check (true);
create policy "dining_delete_anon" on public.dining_customizations for delete using (true);

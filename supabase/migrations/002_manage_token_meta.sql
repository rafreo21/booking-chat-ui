-- Opaque public link token + JSON meta (menu version, kitchen notes, deposits).
-- Run after 001_reservations_and_dining.sql

alter table public.reservations
  add column if not exists manage_token text;

alter table public.reservations
  add column if not exists meta jsonb not null default '{}'::jsonb;

-- Backfill tokens for existing rows
update public.reservations
set manage_token = substring(
  replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  from 1 for 32
)
where manage_token is null or trim(manage_token) = '';

alter table public.reservations
  alter column manage_token set not null;

create unique index if not exists reservations_manage_token_key on public.reservations (manage_token);

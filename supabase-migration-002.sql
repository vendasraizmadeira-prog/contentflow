-- ContentFlow — Migration 002: Cleanup test data + Storage bucket
-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- ─────────────────────────────────────────
-- 1. STORAGE BUCKET "media" (public)
-- ─────────────────────────────────────────
-- If the bucket already exists this is a no-op (on conflict do nothing).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Allow all authenticated users to upload/read their own files
create policy "Authenticated users can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "Public can read media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Users can update their own media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);


-- ─────────────────────────────────────────
-- 2. IDEAS TABLE
-- ─────────────────────────────────────────
create table if not exists public.ideas (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles(id) on delete cascade,
  type        text not null default 'post',
  text        text not null,
  link        text,
  images      text[] default '{}',
  created_at  timestamptz default now()
);

alter table public.ideas enable row level security;

create policy "Clients manage own ideas"
  on public.ideas for all
  to authenticated
  using (client_id = auth.uid())
  with check (client_id = auth.uid());


-- ─────────────────────────────────────────
-- 3. CLEANUP TEST DATA
-- Deletes all rows from client tables so every
-- account starts completely clean.
-- ─────────────────────────────────────────

-- Notifications (no foreign key deps on these from other tables)
delete from public.notifications;

-- Calendar events
delete from public.calendar_events;

-- Producao items (has no child tables)
delete from public.producao_items;

-- Roteiros (producao_items.roteiro_id → roteiros.id is set null on delete, already cleared above)
delete from public.roteiros;

-- Briefing answers
delete from public.briefing_answers;

-- Reset profile stats to zero for all client accounts
-- (keeps the profile row but clears social media numbers and warmth)
update public.profiles
set
  followers    = 0,
  following    = 0,
  posts        = 0,
  growth       = 0,
  warmth_score = 0
where role = 'client';

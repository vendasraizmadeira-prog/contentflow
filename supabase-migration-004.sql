-- ContentFlow — Migration 004: Fix storage policies
-- Run this in the Supabase SQL Editor
-- Safe to run even if policies already exist (drops and recreates)

-- ─────────────────────────────────────────
-- 1. Ensure bucket exists and is public
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- ─────────────────────────────────────────
-- 2. Drop existing policies (ignore errors if they don't exist)
-- ─────────────────────────────────────────
drop policy if exists "Authenticated users can upload media" on storage.objects;
drop policy if exists "Public can read media" on storage.objects;
drop policy if exists "Users can update their own media" on storage.objects;
drop policy if exists "Users can delete their own media" on storage.objects;
drop policy if exists "Public read media" on storage.objects;
drop policy if exists "Auth users can upload media" on storage.objects;
drop policy if exists "Auth users can update media" on storage.objects;

-- ─────────────────────────────────────────
-- 3. Recreate correct policies
-- ─────────────────────────────────────────

-- Anyone can read (public bucket)
create policy "Public can read media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Authenticated users can upload anything to media bucket
create policy "Authenticated users can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

-- Authenticated users can update any file in media bucket
create policy "Authenticated users can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

-- Authenticated users can delete any file in media bucket
create policy "Authenticated users can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

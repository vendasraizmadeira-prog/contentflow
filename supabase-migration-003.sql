-- ContentFlow — Migration 003
-- Adds video_url to producao_items for Reels support
-- Run this in the Supabase SQL Editor

-- Add video_url column to producao_items
alter table public.producao_items
  add column if not exists video_url text;

-- Add instagram_post_id for tracking when posts are published
alter table public.producao_items
  add column if not exists instagram_post_id text;

-- Add cover_image for reels (thumbnail)
alter table public.producao_items
  add column if not exists cover_image text;

-- Update the producao_items RLS to allow clients to see agendado items
-- (they were already included in the select policy, this just confirms)

-- Create an index for faster client feed queries
create index if not exists idx_producao_items_client_status
  on public.producao_items (client_id, status, created_at desc);

-- Add likes tracking via JSONB (client approval tracking with timestamps)
-- The existing revisions JSONB already handles this via type='approved'
-- but we add a convenience view for the admin dashboard

create or replace view public.content_approval_status as
select
  pi.id,
  pi.client_id,
  pi.type,
  pi.status,
  pi.created_at,
  pi.scheduled_date,
  (
    select count(*)::int
    from jsonb_array_elements(pi.revisions) as r
    where r->>'type' = 'change_request'
    and r->>'status' = 'pending'
  ) as pending_revisions,
  (
    select r->>'timestamp'
    from jsonb_array_elements(pi.revisions) as r
    where r->>'type' = 'approved'
    limit 1
  ) as approved_at,
  p.name as client_name,
  p.instagram as client_instagram
from public.producao_items pi
join public.profiles p on p.id = pi.client_id;

-- Grant access
grant select on public.content_approval_status to authenticated;

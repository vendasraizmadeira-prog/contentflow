-- ContentFlow — Migration 005
-- Push subscriptions (Web Push API) + Notification schedules
-- Run in Supabase SQL Editor

-- ──────────────────────────────────────────
-- 1. PUSH SUBSCRIPTIONS
-- ──────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins read all push subscriptions"
  on public.push_subscriptions for select
  using (public.my_role() = 'admin');

-- ──────────────────────────────────────────
-- 2. PUSH SCHEDULES (cronograma de notificações)
-- ──────────────────────────────────────────
create table if not exists public.push_schedules (
  id           uuid default gen_random_uuid() primary key,
  client_id    uuid references public.profiles(id) on delete cascade not null,
  title        text not null,
  message      text not null,
  scheduled_at timestamptz not null,
  sent         boolean default false,
  sent_at      timestamptz,
  created_by   uuid references public.profiles(id),
  created_at   timestamptz default now()
);

alter table public.push_schedules enable row level security;

create policy "Clients read their own schedules"
  on public.push_schedules for select
  using (auth.uid() = client_id or public.my_role() = 'admin');

create policy "Admins manage all schedules"
  on public.push_schedules for all
  using (public.my_role() = 'admin');

-- Allow service role (cron) to update sent flag
create policy "Service role can update sent flag"
  on public.push_schedules for update
  using (true);

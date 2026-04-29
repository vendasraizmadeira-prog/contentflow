-- ContentFlow — Complete Database Schema
-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- ─────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id                uuid references auth.users(id) on delete cascade primary key,
  role              text not null default 'client' check (role in ('admin', 'client')),
  name              text,
  instagram         text,
  avatar            text,
  bio               text,
  website           text,
  followers         integer default 0,
  following         integer default 0,
  posts             integer default 0,
  growth            float default 0,
  warmth_score      integer default 0,
  briefing_completed boolean default false,
  highlights        jsonb default '[]'::jsonb,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Helper: get current user's role (avoids RLS recursion)
create or replace function public.my_role()
returns text as $$
  select role from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- RLS
alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.my_role() = 'admin');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or public.my_role() = 'admin');

create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (public.my_role() = 'admin');


-- ─────────────────────────────────────────
-- 2. BRIEFING ANSWERS
-- ─────────────────────────────────────────
create table if not exists public.briefing_answers (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  question_id text not null,
  answer      text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, question_id)
);

alter table public.briefing_answers enable row level security;

create policy "Clients read their own answers"
  on public.briefing_answers for select
  using (auth.uid() = user_id or public.my_role() = 'admin');

create policy "Clients write their own answers"
  on public.briefing_answers for insert
  with check (auth.uid() = user_id);

create policy "Clients update their own answers"
  on public.briefing_answers for update
  using (auth.uid() = user_id);

create policy "Admins can upsert any answer"
  on public.briefing_answers for insert
  with check (public.my_role() = 'admin');


-- ─────────────────────────────────────────
-- 3. ROTEIROS (scripts)
-- ─────────────────────────────────────────
create table if not exists public.roteiros (
  id          uuid default gen_random_uuid() primary key,
  client_id   uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  type        text not null check (type in ('post', 'reel', 'carousel', 'story')),
  status      text not null default 'rascunho' check (status in ('rascunho', 'enviado', 'em_revisao', 'aprovado')),
  content     text,
  history     jsonb default '[]'::jsonb,
  producao_id uuid,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.roteiros enable row level security;

create policy "Clients can read their own roteiros"
  on public.roteiros for select
  using (auth.uid() = client_id or public.my_role() = 'admin');

create policy "Admins can manage all roteiros"
  on public.roteiros for all
  using (public.my_role() = 'admin');

create policy "Clients can update roteiro status"
  on public.roteiros for update
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);


-- ─────────────────────────────────────────
-- 4. PRODUCAO ITEMS (content production)
-- ─────────────────────────────────────────
create table if not exists public.producao_items (
  id              uuid default gen_random_uuid() primary key,
  client_id       uuid references public.profiles(id) on delete cascade not null,
  roteiro_id      uuid references public.roteiros(id) on delete set null,
  roteiro_title   text,
  type            text not null check (type in ('post', 'reel', 'carousel', 'story')),
  post_subtype    text check (post_subtype in ('single', 'carousel')),
  status          text not null default 'aguardando' check (status in ('aguardando', 'em_revisao', 'aprovado', 'agendado')),
  images          jsonb default '[]'::jsonb,
  caption         text,
  scheduled_date  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.producao_items enable row level security;

create policy "Clients can read their own producao"
  on public.producao_items for select
  using (auth.uid() = client_id or public.my_role() = 'admin');

create policy "Admins can manage producao"
  on public.producao_items for all
  using (public.my_role() = 'admin');

create policy "Clients can update producao status"
  on public.producao_items for update
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);


-- ─────────────────────────────────────────
-- 5. CALENDAR EVENTS
-- ─────────────────────────────────────────
create table if not exists public.calendar_events (
  id          uuid default gen_random_uuid() primary key,
  client_id   uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  type        text not null check (type in ('recording', 'post', 'reel', 'story')),
  event_date  date not null,
  event_time  text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now()
);

alter table public.calendar_events enable row level security;

create policy "Clients can read their own events"
  on public.calendar_events for select
  using (auth.uid() = client_id or public.my_role() = 'admin');

create policy "Admins can manage all events"
  on public.calendar_events for all
  using (public.my_role() = 'admin');


-- ─────────────────────────────────────────
-- 6. NOTIFICATIONS
-- ─────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  message     text,
  type        text,
  read        boolean default false,
  url         text,
  created_at  timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Admins insert notifications"
  on public.notifications for insert
  with check (public.my_role() = 'admin');


-- ─────────────────────────────────────────
-- 7. AUTO-CREATE PROFILE ON SIGNUP
--    (only for direct signups — admin-created accounts
--     have their profile created by the API route)
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, name)
  values (new.id, 'client', new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

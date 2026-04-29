-- Migration 001: Add revisions column to producao_items
-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

alter table public.producao_items
  add column if not exists revisions jsonb default '[]'::jsonb;

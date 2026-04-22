-- Migration: add media_type column to watchlist
-- Run in the Supabase SQL Editor (https://app.supabase.com → SQL Editor)

ALTER TABLE public.watchlist
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'film'
    CHECK (media_type IN ('film', 'series'));

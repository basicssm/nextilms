-- Add personal rating (1-10) and private notes to watchlist items
ALTER TABLE public.watchlist
  ADD COLUMN IF NOT EXISTS rating SMALLINT CHECK (rating >= 1 AND rating <= 10),
  ADD COLUMN IF NOT EXISTS notes TEXT;

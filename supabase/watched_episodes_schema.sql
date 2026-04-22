-- Table to track which episodes a user has watched for a series
CREATE TABLE IF NOT EXISTS watched_episodes (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid REFERENCES auth.users NOT NULL,
  series_id      integer NOT NULL,
  season_number  integer NOT NULL,
  episode_number integer NOT NULL,
  watched_at     timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, series_id, season_number, episode_number)
);

ALTER TABLE watched_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watched episodes"
  ON watched_episodes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups by user + series
CREATE INDEX IF NOT EXISTS watched_episodes_user_series_idx
  ON watched_episodes (user_id, series_id);

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export type EpisodeRow = {
  series_id: number;
  season_number: number;
  episode_number: number;
  watched_at: string;
};

export function useWatchedEpisodesAll() {
  const { user } = useAuth();
  const [rows, setRows] = useState<EpisodeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("watched_episodes")
      .select("series_id, season_number, episode_number, watched_at")
      .eq("user_id", user.id);
    setRows((data as EpisodeRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { rows, loading };
}

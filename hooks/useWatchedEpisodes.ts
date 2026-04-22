import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type EpisodeKey = string; // `${season_number}-${episode_number}`

function toKey(season: number, episode: number): EpisodeKey {
  return `${season}-${episode}`;
}

export function useWatchedEpisodes(seriesId: number) {
  const { user } = useAuth();
  const [watched, setWatched] = useState<Set<EpisodeKey>>(new Set());

  const fetchWatched = useCallback(async () => {
    if (!user || !seriesId) {
      setWatched(new Set());
      return;
    }
    const { data } = await supabase
      .from("watched_episodes")
      .select("season_number,episode_number")
      .eq("user_id", user.id)
      .eq("series_id", seriesId);
    setWatched(
      new Set(
        (data ?? []).map((r: { season_number: number; episode_number: number }) =>
          toKey(r.season_number, r.episode_number)
        )
      )
    );
  }, [user, seriesId]);

  useEffect(() => {
    fetchWatched();
  }, [fetchWatched]);

  const isWatched = useCallback(
    (season: number, episode: number) => watched.has(toKey(season, episode)),
    [watched]
  );

  const watchedInSeason = useCallback(
    (season: number) => {
      let count = 0;
      for (const key of watched) {
        if (key.startsWith(`${season}-`)) count++;
      }
      return count;
    },
    [watched]
  );

  const toggle = useCallback(
    async (season: number, episode: number) => {
      if (!user) return;
      const k = toKey(season, episode);
      if (watched.has(k)) {
        await supabase
          .from("watched_episodes")
          .delete()
          .eq("user_id", user.id)
          .eq("series_id", seriesId)
          .eq("season_number", season)
          .eq("episode_number", episode);
        setWatched((prev) => {
          const next = new Set(prev);
          next.delete(k);
          return next;
        });
      } else {
        await supabase.from("watched_episodes").insert({
          user_id: user.id,
          series_id: seriesId,
          season_number: season,
          episode_number: episode,
        });
        setWatched((prev) => new Set([...prev, k]));
      }
    },
    [user, seriesId, watched]
  );

  const markSeason = useCallback(
    async (season: number, episodeNumbers: number[]) => {
      if (!user || episodeNumbers.length === 0) return;
      const allWatched = episodeNumbers.every((ep) => watched.has(toKey(season, ep)));
      if (allWatched) {
        await supabase
          .from("watched_episodes")
          .delete()
          .eq("user_id", user.id)
          .eq("series_id", seriesId)
          .eq("season_number", season);
        setWatched((prev) => {
          const next = new Set(prev);
          episodeNumbers.forEach((ep) => next.delete(toKey(season, ep)));
          return next;
        });
      } else {
        const toInsert = episodeNumbers
          .filter((ep) => !watched.has(toKey(season, ep)))
          .map((ep) => ({
            user_id: user.id,
            series_id: seriesId,
            season_number: season,
            episode_number: ep,
          }));
        await supabase
          .from("watched_episodes")
          .upsert(toInsert, { onConflict: "user_id,series_id,season_number,episode_number" });
        setWatched((prev) =>
          new Set([...prev, ...toInsert.map((r) => toKey(r.season_number, r.episode_number))])
        );
      }
    },
    [user, seriesId, watched]
  );

  return { isWatched, watchedInSeason, toggle, markSeason, watchedCount: watched.size };
}

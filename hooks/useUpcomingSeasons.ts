"use client";

import { useState, useEffect } from "react";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { WatchlistItem, WatchlistSeriesWithNext } from "@/types";

function daysFromToday(airDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const premiere = new Date(airDate + "T12:00:00");
  return Math.ceil((premiere.getTime() - today.getTime()) / 86400000);
}

async function fetchNextEpisode(
  item: WatchlistItem
): Promise<WatchlistSeriesWithNext | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/tv/${item.film_id}?api_key=${API_KEY}&language=es-ES`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const next = data.next_episode_to_air;
    if (!next?.air_date) return null;
    return {
      ...item,
      next_episode_to_air: next,
      daysUntil: daysFromToday(next.air_date),
    };
  } catch {
    return null;
  }
}

async function fetchInBatches(
  items: WatchlistItem[],
  batchSize = 5
): Promise<(WatchlistSeriesWithNext | null)[]> {
  const results: (WatchlistSeriesWithNext | null)[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fetchNextEpisode));
    results.push(...batchResults);
  }
  return results;
}

export function useUpcomingSeasons(items: WatchlistItem[]) {
  const [upcoming, setUpcoming] = useState<WatchlistSeriesWithNext[]>([]);
  const [available, setAvailable] = useState<WatchlistSeriesWithNext[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const seriesItems = items.filter(
      (i) =>
        i.media_type === "series" &&
        (i.status === "watched" || i.status === "watching")
    );

    if (seriesItems.length === 0) {
      setUpcoming([]);
      setAvailable([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchInBatches(seriesItems).then((results) => {
      if (cancelled) return;
      const withNext = results.filter(Boolean) as WatchlistSeriesWithNext[];
      setUpcoming(withNext.filter((s) => s.daysUntil !== null && s.daysUntil > 0));
      setAvailable(withNext.filter((s) => s.daysUntil !== null && s.daysUntil <= 0));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  return { upcoming, available, loading };
}

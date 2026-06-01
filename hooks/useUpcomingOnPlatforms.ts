"use client";

import { useState, useEffect } from "react";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { UpcomingPlatformSeries, WatchlistItem } from "@/types";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";

function daysFromToday(airDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const premiere = new Date(airDate + "T12:00:00");
  return Math.ceil((premiere.getTime() - today.getTime()) / 86400000);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function plusDays(n: number) {
  return new Date(Date.now() + n * 86400000).toISOString().split("T")[0];
}

export function useUpcomingOnPlatforms(watchlistItems: WatchlistItem[]) {
  const { platformIds, loading: platformsLoading } = useUserPlatforms();
  const [series, setSeries] = useState<UpcomingPlatformSeries[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (platformsLoading) return;
    if (platformIds.size === 0) {
      setSeries([]);
      return;
    }

    const watchlistIds = new Set(watchlistItems.map((i) => i.film_id));
    const providerParam = [...platformIds].join("|");
    const url =
      `${API_BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES` +
      `&watch_region=ES&with_watch_providers=${providerParam}` +
      `&first_air_date.gte=${todayStr()}&first_air_date.lte=${plusDays(90)}` +
      `&sort_by=first_air_date.asc&page=1`;

    let cancelled = false;
    setLoading(true);

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const results: UpcomingPlatformSeries[] = (data.results ?? [])
          .filter(
            (item: { id: number }) => !watchlistIds.has(item.id)
          )
          .map((item: { id: number; name: string; poster_path: string | null; first_air_date: string }) => ({
            id: item.id,
            title: item.name,
            poster_path: item.poster_path,
            air_date: item.first_air_date,
            daysUntil: daysFromToday(item.first_air_date),
          }))
          .filter((s: UpcomingPlatformSeries) => s.daysUntil >= 0);
        setSeries(results);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [platformIds, platformsLoading, watchlistItems]);

  return { series, loading };
}

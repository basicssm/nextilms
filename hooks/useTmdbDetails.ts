"use client";
import { useEffect, useMemo, useState } from "react";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { WatchlistItem } from "@/types";

export type TmdbEnrichment = {
  film_id: number;
  genres: string[];
  release_date: string | null;
  vote_average: number | null;
  number_of_episodes: number | null;
};

const BATCH_SIZE = 20;

export function useTmdbDetails(items: WatchlistItem[]) {
  const [details, setDetails] = useState<Map<number, TmdbEnrichment>>(new Map());
  const [loading, setLoading] = useState(false);

  const itemsKey = useMemo(() => items.map((i) => i.film_id).join(","), [items]);

  useEffect(() => {
    if (items.length === 0) {
      setDetails(new Map());
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchAll = async () => {
      const map = new Map<number, TmdbEnrichment>();

      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        if (cancelled) break;
        const batch = items.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map(async (item) => {
            const type = item.media_type === "series" ? "tv" : "movie";
            const res = await fetch(
              `${API_BASE_URL}/${type}/${item.film_id}?api_key=${API_KEY}&language=es-ES`
            );
            if (!res.ok) return null;
            const d = await res.json();
            return {
              film_id: item.film_id,
              genres: (d.genres ?? []).map((g: { name: string }) => g.name),
              release_date: d.release_date ?? d.first_air_date ?? null,
              vote_average: d.vote_average ?? null,
              number_of_episodes: d.number_of_episodes ?? null,
            } as TmdbEnrichment;
          })
        );

        for (const result of results) {
          if (result.status === "fulfilled" && result.value) {
            map.set(result.value.film_id, result.value);
          }
        }
      }

      if (!cancelled) {
        setDetails(map);
        setLoading(false);
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  return { details, loading };
}

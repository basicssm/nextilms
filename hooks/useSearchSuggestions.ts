import { useState, useEffect, useRef } from "react";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { Film } from "@/types";
import { normalizeSearchItem, RawTmdbItem } from "@/utils/tmdb";

export function useSearchSuggestions(query: string, mediaType: "film" | "series") {
  const [results, setResults] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const endpoint = mediaType === "series" ? "tv" : "movie";
        const url = `${API_BASE_URL}/search/${endpoint}?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
        const res = await fetch(url, { signal: abortRef.current.signal });
        const data = await res.json();
        if (data.results) {
          const normalized = (data.results as RawTmdbItem[])
            .slice(0, 6)
            .map((item) => normalizeSearchItem(item, mediaType))
            .filter((f): f is Film => f !== null);
          setResults(normalized);
        }
      } catch (err: unknown) {
        if (!(err instanceof Error && err.name === "AbortError")) setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, mediaType]);

  return { results, loading };
}

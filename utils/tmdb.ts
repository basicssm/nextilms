import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { Film } from "@/types";

export function normalizeItem(item: {
  id: string | number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  mediaType?: "film" | "series";
}): Film {
  return {
    id: String(item.id),
    title: item.title ?? item.name ?? "",
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    release_date: item.release_date ?? item.first_air_date,
    mediaType: item.mediaType,
  };
}

// Manual URL building (avoids URLSearchParams encoding | as %7C, which TMDB needs for with_genres/with_watch_providers)
export function buildSectionUrl(
  endpoint: string,
  params: Record<string, string | number>
): string {
  const base = `${API_BASE_URL}${endpoint}`;
  const fixed = `api_key=${API_KEY}&language=es-ES`;
  const extra = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${v}`)
    .join("&");
  return extra ? `${base}?${fixed}&${extra}` : `${base}?${fixed}`;
}

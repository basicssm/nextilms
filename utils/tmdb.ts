import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { Film } from "@/types";

export type RawTmdbItem = {
  id: string | number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  mediaType?: "film" | "series";
};

export function normalizeItem(item: RawTmdbItem): Film {
  return {
    id: String(item.id),
    title: item.title ?? item.name ?? "",
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    release_date: item.release_date ?? item.first_air_date,
    mediaType: item.mediaType,
  };
}

// For search results: drops people and maps TMDB's media_type ("movie"/"tv")
// to the app's mediaType, falling back to the active tab when absent.
export function normalizeSearchItem(
  item: RawTmdbItem,
  fallback: "film" | "series"
): Film | null {
  if (item.media_type === "person") return null;
  const mediaType =
    item.media_type === "tv"
      ? "series"
      : item.media_type === "movie"
      ? "film"
      : fallback;
  return normalizeItem({ ...item, mediaType });
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

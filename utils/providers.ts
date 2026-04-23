import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { WatchProvider } from "@/types";

export async function fetchWatchProviders(
  filmId: number,
  mediaType: "film" | "series"
): Promise<WatchProvider[]> {
  const segment = mediaType === "series" ? "tv" : "movie";
  try {
    const res = await fetch(
      `${API_BASE_URL}/${segment}/${filmId}/watch/providers?api_key=${API_KEY}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const esRegion = data?.results?.ES;
    return esRegion?.flatrate ?? esRegion?.free ?? [];
  } catch {
    return [];
  }
}

export type Film = {
  id: string;
  title: string;
  poster_path: string;
  vote_average?: number;
  release_date?: string;
  mediaType?: "film" | "series";
};

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

export type FilmDetail = Film & {
  overview: string;
  vote_average: number;
  vote_count: number;
  backdrop_path?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
  release_date?: string;
  watch_providers?: WatchProvider[];
};

export type SeriesDetail = {
  id: string;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  backdrop_path?: string;
  genres?: { id: number; name: string }[];
  first_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
};

export type UserPlatform = {
  id: string;
  user_id: string;
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

export type WatchlistStatus = "watching" | "to_watch" | "watched";

export type WatchlistItem = {
  id: string;
  user_id: string;
  film_id: number;
  film_title: string;
  poster_path: string | null;
  status: WatchlistStatus;
  media_type?: "film" | "series";
  created_at: string;
  updated_at: string;
};

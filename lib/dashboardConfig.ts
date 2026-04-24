export type SectionConfig = {
  id: string;
  title: string;
  emoji: string;
  endpoint: (mediaType: "film" | "series") => string;
  buildParams: (
    mediaType: "film" | "series",
    providerIds: number[]
  ) => Record<string, string | number>;
  isUpcoming?: boolean;
};

function withProviders(
  providerIds: number[],
  extra: Record<string, string | number> = {}
): Record<string, string | number> {
  const base: Record<string, string | number> = {
    watch_region: "ES",
    ...extra,
  };
  if (providerIds.length > 0) {
    base.with_watch_providers = providerIds.join("|");
  }
  return base;
}

export const DASHBOARD_SECTIONS: SectionConfig[] = [
  {
    id: "indispensables",
    title: "Indispensables",
    emoji: "⭐",
    endpoint: (mt) => (mt === "film" ? "/discover/movie" : "/discover/tv"),
    buildParams: (_mt, ids) =>
      withProviders(ids, {
        sort_by: "vote_average.desc",
        "vote_average.gte": 8,
        "vote_count.gte": 500,
      }),
  },
  {
    id: "populares",
    title: "Más populares ahora",
    emoji: "🔥",
    endpoint: (mt) => (mt === "film" ? "/movie/popular" : "/tv/popular"),
    buildParams: () => ({}),
  },
  {
    id: "tendencias",
    title: "Tendencias esta semana",
    emoji: "📈",
    endpoint: (mt) =>
      mt === "film" ? "/trending/movie/week" : "/trending/tv/week",
    buildParams: () => ({}),
  },
  {
    id: "para_reir",
    title: "Para reír",
    emoji: "😄",
    endpoint: (mt) => (mt === "film" ? "/discover/movie" : "/discover/tv"),
    buildParams: (_mt, ids) =>
      withProviders(ids, {
        with_genres: "35",
        sort_by: "vote_average.desc",
        "vote_count.gte": 200,
      }),
  },
  {
    id: "con_hijos",
    title: "Con tus hijos",
    emoji: "🧒",
    endpoint: (mt) => (mt === "film" ? "/discover/movie" : "/discover/tv"),
    buildParams: (_mt, ids) =>
      withProviders(ids, {
        with_genres: "16|10751",
        sort_by: "vote_average.desc",
        "vote_count.gte": 100,
      }),
  },
  {
    id: "en_pareja",
    title: "En pareja",
    emoji: "💑",
    endpoint: (mt) => (mt === "film" ? "/discover/movie" : "/discover/tv"),
    buildParams: (_mt, ids) =>
      withProviders(ids, {
        with_genres: "10749|18",
        sort_by: "vote_average.desc",
        "vote_count.gte": 200,
      }),
  },
  {
    id: "para_llorar",
    title: "Para llorar",
    emoji: "😢",
    endpoint: (mt) => (mt === "film" ? "/discover/movie" : "/discover/tv"),
    buildParams: (_mt, ids) =>
      withProviders(ids, {
        with_genres: "18",
        sort_by: "vote_average.desc",
        "vote_count.gte": 300,
        "vote_average.gte": 7.5,
      }),
  },
  {
    id: "para_la_noche",
    title: "Para la noche",
    emoji: "🌙",
    endpoint: (mt) => (mt === "film" ? "/discover/movie" : "/discover/tv"),
    buildParams: (_mt, ids) =>
      withProviders(ids, {
        with_genres: "53|27",
        sort_by: "vote_average.desc",
        "vote_count.gte": 200,
      }),
  },
  {
    id: "accion",
    title: "Acción y aventura",
    emoji: "💥",
    endpoint: (mt) => (mt === "film" ? "/discover/movie" : "/discover/tv"),
    buildParams: (_mt, ids) =>
      withProviders(ids, {
        with_genres: "28|12",
        sort_by: "vote_average.desc",
        "vote_count.gte": 300,
      }),
  },
  {
    id: "proximos_streaming",
    title: "Próximos estrenos en streaming",
    emoji: "📅",
    isUpcoming: true,
    endpoint: () => "/discover/movie",
    buildParams: (_mt, ids) => {
      const today = new Date().toISOString().split("T")[0];
      const in90 = new Date(Date.now() + 90 * 86400000)
        .toISOString()
        .split("T")[0];
      return withProviders(ids, {
        with_release_type: "4",
        "release_date.gte": today,
        "release_date.lte": in90,
        sort_by: "release_date.asc",
      });
    },
  },
];

import { useMemo } from "react";
import { WatchlistItem, GamificationLevel, Achievement, GamificationResult } from "@/types";
import { EpisodeRow } from "@/hooks/useWatchedEpisodesAll";

export const LEVELS: GamificationLevel[] = [
  { level: 1, name: "Espectador",            minPoints: 0,    maxPoints: 99,       unlock: null },
  { level: 2, name: "Aficionado",            minPoints: 100,  maxPoints: 299,      unlock: "genre_stats" },
  { level: 3, name: "Cinéfilo",              minPoints: 300,  maxPoints: 699,      unlock: "accent_picker" },
  { level: 4, name: "Crítico",               minPoints: 700,  maxPoints: 1499,     unlock: "marathon_mode" },
  { level: 5, name: "Maestro del Séptimo Arte", minPoints: 1500, maxPoints: Infinity, unlock: "gold_ring" },
];

type AchievementDef = Omit<Achievement, "earned"> & {
  check: (items: WatchlistItem[], episodes: EpisodeRow[]) => boolean;
};

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "primer_vistazo",
    name: "Primer Vistazo",
    description: "Marca tu primer título como visto",
    icon: "🎬",
    check: (items) => items.some((i) => i.status === "watched"),
  },
  {
    id: "decena",
    name: "La Decena",
    description: "10 títulos marcados como vistos",
    icon: "🏅",
    check: (items) => items.filter((i) => i.status === "watched").length >= 10,
  },
  {
    id: "cinefilo_confirmado",
    name: "Cinéfilo Confirmado",
    description: "25 títulos marcados como vistos",
    icon: "🎭",
    check: (items) => items.filter((i) => i.status === "watched").length >= 25,
  },
  {
    id: "cincuentena",
    name: "La Cincuentena",
    description: "50 títulos marcados como vistos",
    icon: "🥇",
    check: (items) => items.filter((i) => i.status === "watched").length >= 50,
  },
  {
    id: "maratonista",
    name: "Maratonista",
    description: "50 episodios vistos",
    icon: "📺",
    check: (_items, episodes) =>
      episodes.filter((r) => r.season_number !== 0).length >= 50,
  },
  {
    id: "explorador_series",
    name: "Explorador de Series",
    description: "5 series completadas",
    icon: "🗺️",
    check: (items) =>
      items.filter((i) => i.status === "watched" && i.media_type === "series").length >= 5,
  },
  {
    id: "critico_nato",
    name: "Crítico Nato",
    description: "10 títulos valorados",
    icon: "⭐",
    check: (items) => items.filter((i) => i.rating != null).length >= 10,
  },
  {
    id: "cronista",
    name: "El Cronista",
    description: "5 títulos con notas escritas",
    icon: "✍️",
    check: (items) =>
      items.filter((i) => i.notes && i.notes.trim().length > 0).length >= 5,
  },
  {
    id: "coleccionista",
    name: "Coleccionista",
    description: "25 títulos en tu lista",
    icon: "📚",
    check: (items) => items.length >= 25,
  },
  {
    id: "completista",
    name: "El Completista",
    description: "Todos tus títulos vistos tienen valoración",
    icon: "💯",
    check: (items) => {
      const watched = items.filter((i) => i.status === "watched");
      return watched.length > 0 && watched.every((i) => i.rating != null);
    },
  },
];

export function useGamification(
  items: WatchlistItem[],
  episodeRows: EpisodeRow[]
): GamificationResult {
  return useMemo(() => {
    const watchedFilms = items.filter(
      (i) => i.status === "watched" && i.media_type !== "series"
    ).length;
    const watchedSeries = items.filter(
      (i) => i.status === "watched" && i.media_type === "series"
    ).length;
    const episodesWatched = episodeRows.filter((r) => r.season_number !== 0).length;
    const ratedItems = items.filter((i) => i.rating != null).length;
    const notedItems = items.filter((i) => i.notes && i.notes.trim().length > 0).length;

    const points =
      watchedFilms * 50 +
      watchedSeries * 75 +
      episodesWatched * 3 +
      ratedItems * 10 +
      notedItems * 15;

    const currentLevel =
      [...LEVELS].reverse().find((l) => points >= l.minPoints) ?? LEVELS[0];
    const nextLevel = LEVELS[currentLevel.level] ?? null;

    const progressPct = nextLevel
      ? Math.min(
          100,
          Math.round(
            ((points - currentLevel.minPoints) /
              (nextLevel.minPoints - currentLevel.minPoints)) *
              100
          )
        )
      : 100;

    const unlockedLevelNums = LEVELS.filter((l) => points >= l.minPoints).map(
      (l) => l.level
    );
    const unlocks = {
      genreStats: unlockedLevelNums.includes(2),
      accentPicker: unlockedLevelNums.includes(3),
      marathonMode: unlockedLevelNums.includes(4),
      goldRing: unlockedLevelNums.includes(5),
    };

    const achievements: Achievement[] = ACHIEVEMENT_DEFS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      earned: def.check(items, episodeRows),
    }));

    return {
      points,
      currentLevel,
      nextLevel,
      progressPct,
      unlocks,
      achievements,
      breakdown: { watchedFilms, watchedSeries, episodesWatched, ratedItems, notedItems },
    };
  }, [items, episodeRows]);
}

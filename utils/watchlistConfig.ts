import type { WatchlistStatus } from "@/types";

export const WATCHLIST_STATUS_CONFIG: Record<
  WatchlistStatus,
  { label: string; icon: string; colorVar: string; bgVar: string; borderVar: string }
> = {
  watching: {
    label: "Viendo",
    icon: "▶",
    colorVar: "var(--watching)",
    bgVar: "var(--watching-bg)",
    borderVar: "var(--watching-border)",
  },
  to_watch: {
    label: "Por ver",
    icon: "◷",
    colorVar: "var(--to-watch)",
    bgVar: "var(--to-watch-bg)",
    borderVar: "var(--to-watch-border)",
  },
  watched: {
    label: "Vista",
    icon: "✓",
    colorVar: "var(--watched)",
    bgVar: "var(--watched-bg)",
    borderVar: "var(--watched-border)",
  },
};

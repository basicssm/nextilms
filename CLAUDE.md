# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

**WhatWatch** (repo name `nextilms`) is a film & TV series discovery app with watchlist, per-episode tracking, personal ratings/notes, streaming-platform filtering and a gamification layer (points, levels, achievements, unlockable perks). It consumes the [TMDB API](https://developer.themoviedb.org/docs) (Spanish locale, Spain region) and uses [Supabase](https://supabase.com) for auth and persistence. All UI copy is in Spanish.

### Stack
- **Next.js 15.3** App Router — every page is `"use client"`; dynamic route params are Promises unwrapped with `use(params)`
- **React 18**, **TypeScript** strict mode; path alias `@/*` maps to project root
- **SWR** for TMDB data on detail pages and dashboard sections; plain `fetch` in `useEffect` elsewhere
- **Supabase** (`@supabase/supabase-js`) for auth (email, Google, Apple OAuth) and Postgres; client lazily instantiated via Proxy in `lib/supabase.ts`
- **styled-jsx** for component-scoped CSS; design tokens in `styles/globals.css` (there is no `styles/components.css`)
- **next/font/google**: Syne (`--font-display`), Inter (`--font-body`), JetBrains Mono (`--font-mono`)
- **FontAwesome** for icons, **react-youtube** for trailer embeds

### Environment Variables
Credentials live in `.env.local` (gitignored). See `.env.local.example`:
```
NEXT_PUBLIC_TMDB_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

`apiconfig.ts` (project root, imported as `@/apiconfig`) exports the TMDB config: `API_KEY` (read from `NEXT_PUBLIC_TMDB_API_KEY`) and `API_BASE_URL`. TMDB requests append `api_key=${API_KEY}&language=es-ES`. Discover queries use `watch_region=ES`. Image URL bases (w185/w342/w500/w1280/original) are constants in `utils/constants.ts` — use those, don't hardcode.

`utils/tmdb.ts#buildSectionUrl` builds discover URLs **manually** (not `URLSearchParams`) because TMDB needs literal `|` in `with_genres` / `with_watch_providers`.

### Routes & Data Flow
| Route | File | What it does |
|---|---|---|
| `/` | `app/page.tsx` | Netflix-style dashboard: search bar with suggestions, "¿Qué veo esta noche?" modal, film/series tabs, platform filter bar, horizontal sections from `lib/dashboardConfig.ts`, watched-titles section. Scroll positions + platform filter persisted in `sessionStorage`; `mediaType` in URL param |
| `/film/[film_id]` | `app/film/[film_id]/page.tsx` | SWR: movie details + videos + watch providers (ES region) → `Detail`, `CastSection`, `RelatedTitles` |
| `/series/[series_id]` | `app/series/[series_id]/page.tsx` | Same as film plus seasons list → `EpisodeTracker`; passes `marathonModeEnabled` from gamification unlocks |
| `/search/[search_param]` | `app/search/[search_param]/page.tsx` | TMDB `search/multi\|movie\|tv` with infinite scroll (IntersectionObserver sentinel); media-type filter in URL param |
| `/my-list` | `app/my-list/page.tsx` | Kanban board (Viendo / Por ver / Vista) of the user's watchlist; type filter + sort; auth required |
| `/platforms` | `app/platforms/page.tsx` | TMDB provider catalog (featured + full list), toggle into `user_platforms`; "coverage analysis" computing how many watchlist titles each platform serves |
| `/stats` | `app/stats/page.tsx` | Stats dashboard: counts, estimated hours, monthly activity, records, fun facts; TMDB-enriched stats (genres, decades, obscure picks) via `useTmdbDetails`; hosts `GamificationPanel` |

### Dashboard sections (`lib/dashboardConfig.ts`)
`DASHBOARD_SECTIONS: SectionConfig[]` declaratively defines each horizontal row (id, title, endpoint, discover params, `isUpcoming`). `HorizontalSection`:
- lazy-loads via IntersectionObserver (`rootMargin: 200px`) before firing SWR
- deduplicates across sections through a shared `seenIds` ref owned by the home page
- hides titles already `watched`/`watching` (via `useWatchlistMap`) and auto-fetches more pages when fewer than 5 visible items remain
- persists horizontal scroll per section in `sessionStorage`

### Key Types (`types.ts`) — PascalCase
- `Film` — card data (`id: string`, `title`, `poster_path`, `vote_average?`, `release_date?`, `mediaType?`)
- `FilmDetail` — detail page data (overview, votes, backdrop, genres, runtime, `watch_providers`). Series pages normalize the TMDB TV payload into `FilmDetail` too
- `SeriesDetail`, `WatchProvider`, `UserPlatform`
- `WatchlistStatus` — `"watching" | "to_watch" | "watched"`; UI labels/colors centralized in `utils/watchlistConfig.ts` (`WATCHLIST_STATUS_CONFIG`)
- `WatchlistItem` — includes `media_type?`, `rating?` (1–10), `notes?`
- Gamification: `GamificationLevel`, `Achievement`, `GamificationUnlocks`, `GamificationResult`

### Custom Hooks
- **`useAuth()`** — `context/AuthContext.tsx`; `{ user, session, loading, signOut }`
- **`useWatchlist(filmId)`** — `hooks/useWatchlist.ts`; `{ item, loading, error, setStatus, updateRating, updateNotes, refetch }`. `setStatus` toggles off (deletes) when the same status is clicked. Also exports `useWatchlistMap()` (film_id → status Map) and `useFullWatchlist()` (`{ items, loading, error, refetch, removeItem, changeStatus }`)
- **`useUserPlatforms()`** — `{ platforms, platformIds (Set), loading, error, toggle, refetch }`
- **`useWatchedEpisodes(seriesId)`** — per-series episode set; `{ isWatched, watchedInSeason, toggle, markSeason, watchedCount }`
- **`useWatchedEpisodesAll()`** — all episode rows for the user (feeds gamification/stats); returns `{ rows, loading, error }`

Supabase hooks expose an `error: string | null` with a user-facing Spanish message; pages render it with the global `.error-banner` class (defined in `styles/globals.css`). Mutations only update local state after the query succeeds.
- **`useGamification(items, episodeRows)`** — pure client-side computation: points = films×50 + series×75 + episodes×3 + ratings×10 + notes×15; 5 levels (Espectador → Maestro del Séptimo Arte) with unlocks (`genre_stats`, `accent_picker`, `marathon_mode`, `gold_ring`); 10 achievement defs. Season 0 (specials) episodes are excluded everywhere
- **`useTmdbDetails(items)`** — batch-enriches watchlist items with TMDB genres/dates/popularity (batches of 20)
- **`useSearchSuggestions(query, mediaType)`** — debounced (300ms) + aborted TMDB search, min 3 chars, max 6 results

### Component Hierarchy
```
Providers (AuthContext — app/layout.tsx)
NavBar (sticky header)
  ├── optional children (Back button on subpages)
  └── NavUserMenu — LevelBadge + avatar (gold ring at lvl 5), dropdown
      (Inicio / Mi lista / Mis plataformas / Mis estadísticas / Salir),
      PointsToast on point gains; AuthModal when logged out
Home: SearchBar (suggestions dropdown) · TonightModal (recommends from
  watchlist filtered to user's platforms; pending-episode counts for series)
  · PlatformFilterBar · HorizontalSection[] (Film / UpcomingCard cards)
  · WatchedSection
Detail (hero backdrop + poster + metadata + trailers + share button)
  ├── WatchlistButtons (opens AuthModal if unauthenticated)
  ├── RatingNotesPanel (rating 1–10 + private notes; only when item is in list)
  └── EpisodeTracker (series; per-episode & per-season toggles; marathon mode)
CastSection · RelatedTitles (recommendations)
Stats: GamificationPanel (level progress, achievements, AccentColorPicker
  unlocked at lvl 3 — persists --accent override in localStorage
  ("ww-accent-override"), reapplied at startup by an inline script in
  app/layout.tsx)
```

### Database Schema (Supabase)
SQL files in `supabase/` (base schemas + incremental migrations; run in the SQL Editor):

**`watchlist`** — one row per user+film: `film_id`, `film_title`, `poster_path`, `status` (check constraint), `media_type` (`'film'|'series'`, default `'film'`), `rating` (1–10 smallint), `notes` text, timestamps, `UNIQUE (user_id, film_id)`

**`user_platforms`** — `provider_id` (TMDB), `provider_name`, `logo_path`, `UNIQUE (user_id, provider_id)`

**`watched_episodes`** — `series_id`, `season_number`, `episode_number`, `watched_at`, `UNIQUE (user_id, series_id, season_number, episode_number)`, index on `(user_id, series_id)`

All tables have RLS: users can only read/write their own rows.

### Styling Conventions
- Component styles via `<style jsx>` blocks; shared tokens/animations in `styles/globals.css`
- Dark theme only. Key CSS custom properties:
  - `--bg: #0a0a0f`, `--surface: #16162a`, `--surface-elevated`, `--border`
  - `--accent: #6c63ff` (indigo, user-overridable via AccentColorPicker), `--accent-2: #ff6584`, `--accent-gradient`
  - `--gold: #d4af37` reserved for gamification (level 5, gold ring, highlights)
  - Semantic watchlist colors: `--watching` (indigo), `--to-watch` (orange), `--watched` (green), each with `-bg`/`-border` variants
  - `--font-display` / `--font-body` / `--font-mono`, `--radius-sm/md/lg/xl`
- Global `.skeleton` shimmer class + shared keyframes (`fadeInUp`, `goldSpin`, …)
- Mobile breakpoint used throughout: `@media (max-width: 480px)`; scroll arrows hidden on touch (`@media (hover: none)`)

### Next.js Image Domains
`next.config.js` allows `image.tmdb.org` and `picsum.photos` (poster fallback) via `remotePatterns`.

### Gotchas
- TMDB ids are numbers in Supabase (`film_id integer`) but `Film.id` is a string — `Number(...)`/`String(...)` conversions are deliberate at the boundaries
- Season 0 = TMDB "Specials"; excluded from episode counts, points and stats

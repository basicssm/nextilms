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

**NextILMS** is a full-stack film and TV series discovery app with social watchlist features. It consumes the [TMDB API](https://www.themoviedb.org/documentation/api) and uses [Supabase](https://supabase.com) for authentication and data persistence.

### Stack
- **Next.js 13** with experimental App Router (`app/` directory, `"use client"` on all pages)
- **TypeScript** with strict mode; path alias `@/*` maps to project root
- **SWR** for remote data caching (detail pages); plain `fetch` in `useEffect` for list pages
- **styled-jsx** for component-scoped CSS; global styles in `styles/`
- **Supabase** (`@supabase/supabase-js`) for auth (email, Google, Apple OAuth) and Postgres DB
- **FontAwesome** for icons, **react-youtube** for video embeds, **@next/font** for Google Fonts

### Environment Variables
Credentials live in `.env.local` (gitignored). See `.env.local.example`:
```
NEXT_PUBLIC_TMDB_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

`apiconfig.ts` (gitignored) still exports TMDB config used internally:
```ts
export const API_KEY = "<your-key>";
export const API_BASE_URL = "http://api.themoviedb.org/3";
```
All TMDB requests append `?api_key=${API_KEY}&language=es-ES`. Images come from `https://image.tmdb.org/t/p/w500/`.

### Routes & Data Flow
| Route | File | Data fetching |
|---|---|---|
| `/` | `app/page.tsx` | `fetch` discover/movie + TV in `useEffect`; hero search; media tabs; Spain categories |
| `/film/[film_id]` | `app/film/[film_id]/page.tsx` | SWR for movie details + videos |
| `/series/[series_id]` | `app/series/[series_id]/page.tsx` | SWR for TV series details + videos |
| `/search/[search_param]` | `app/search/[search_param]/page.tsx` | `fetch` search/movie in `useEffect` |
| `/my-list` | `app/my-list/page.tsx` | Supabase query for user's watchlist (auth required) |
| `/platforms` | `app/platforms/page.tsx` | TMDB provider list + Supabase user_platforms table |

Active `mediaType` and `category` filters on `/` are persisted via URL search params.

### Key Types (`types.ts`)
- `film` — card data (`id`, `title`, `poster_path`, `vote_average`)
- `filmDetail` — full detail (extends `film` with `overview`, `vote_count`, videos array)
- `seriesDetail` — TV series detail (extends `film` with `seasons`, `episodes`, `runtime`)
- `WatchProvider` — streaming provider (`provider_id`, `provider_name`, `logo_path`)
- `UserPlatform` — user's saved provider (`id`, `user_id`, `provider_id`, `provider_name`, `logo_path`)
- `WatchlistStatus` — `"watching" | "to_watch" | "watched"`
- `WatchlistItem` — full watchlist row (`id`, `user_id`, `film_id`, `film_title`, `poster_path`, `status`, timestamps)

### Component Hierarchy
```
Providers (AuthContext wrapper — used in app/layout.tsx)
NavBar (sticky header)
  ├── Search (expands on focus, routes to /search/[query] on Enter)
  └── NavUserMenu (hamburger dropdown: My List, Platforms, Logout / Login trigger)
      └── AuthModal (email+password + Google/Apple OAuth; portal-rendered)
Films → Film[] (card grid, links to /film/[id] or /series/[id])
Detail (poster + metadata + YouTube videos grid)
  └── WatchlistButtons (Viendo / Por ver / Vista; opens AuthModal if unauthenticated)
Back (calls router.back())
```

### Custom Hooks
- **`useAuth()`** — from `context/AuthContext.tsx`; returns `{ user, session, loading, signOut }`
- **`useWatchlist(filmId)`** — `hooks/useWatchlist.ts`; returns `{ item, loading, setStatus, refetch }`. `useFullWatchlist()` returns the full list for `/my-list`.
- **`useUserPlatforms()`** — `hooks/useUserPlatforms.ts`; returns `{ platforms, platformIds, loading, toggle, refetch }`

### Database Schema (Supabase)
See `supabase/schema.sql` and `supabase/platforms_schema.sql`.

**`watchlist`** — one row per user+film combination:
```sql
user_id     uuid  FK → auth.users
film_id     integer
film_title  text
poster_path text
status      text  ('watching' | 'to_watch' | 'watched')
UNIQUE (user_id, film_id)
```

**`user_platforms`** — user's selected streaming providers:
```sql
user_id       uuid  FK → auth.users
provider_id   integer  (TMDB provider ID)
provider_name text
logo_path     text
UNIQUE (user_id, provider_id)
```

Both tables have Row Level Security (RLS) policies: users can only read/write their own rows.

### Styling Conventions
- Component styles via `<style jsx>` blocks inline in each component
- Global/shared styles in `styles/globals.css` and `styles/components.css`
- Dark theme; CSS custom properties defined in `globals.css`:
  - `--bg: #080810` (page background)
  - `--surface: #12121e` (cards/panels)
  - `--gold: #d4af37` (primary accent)
  - `--text: #e8e8f2` / `--text-muted: #8888aa`
- Mobile breakpoint: 333px–890px (single-column layout in Detail pages)

### Next.js Image Domains
`next.config.js` whitelists `image.tmdb.org` and `picsum.photos` for `next/image`.

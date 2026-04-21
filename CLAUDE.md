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

**NextILMS** is a frontend-only film discovery app that consumes the [TMDB API](https://www.themoviedb.org/documentation/api). There is no backend, database, or authentication layer.

### Stack
- **Next.js 13** with experimental App Router (`app/` directory, `"use client"` on all pages)
- **TypeScript** with strict mode; path alias `@/*` maps to project root
- **SWR** for remote data caching (detail page); plain `fetch` in `useEffect` for list pages
- **styled-jsx** for component-scoped CSS; global styles in `styles/`
- **FontAwesome** for icons, **react-youtube** for video embeds, **@next/font** for Google Fonts

### API Configuration
TMDB credentials live in `apiconfig.ts` (gitignored). The file exports:
```ts
export const API_KEY = "<your-key>";
export const API_BASE_URL = "http://api.themoviedb.org/3";
```
All requests append `?api_key=${API_KEY}&language=es-ES`. Images come from `https://image.tmdb.org/t/p/w500/`.

### Routes & Data Flow
| Route | File | Data fetching |
|---|---|---|
| `/` | `app/page.tsx` | `fetch` discover/movie in `useEffect` |
| `/film/[film_id]` | `app/film/[film_id]/page.tsx` | SWR for movie details + videos |
| `/search/[search_param]` | `app/search/[search_param]/page.tsx` | `fetch` search/movie in `useEffect` |

### Key Types (`types.ts`)
- `film` — card data (id, title, poster_path, vote_average)
- `filmDetail` — full detail (extends film with overview, vote_count, videos array)

### Component Hierarchy
```
NavBar (sticky header, accepts children for search slot)
  └── Search (expands on focus, routes to /search/[query] on Enter)
Films → Film[] (card grid, links to /film/[id])
Detail (poster + metadata + YouTube videos grid)
Back (calls router.back())
```

### Styling Conventions
- Component styles via `<style jsx>` blocks inline in each component
- Global/shared styles in `styles/globals.css` and `styles/components.css`
- Background color throughout: `#ddd`; primary accent: `#3498db`
- Mobile breakpoint: 333px–890px (single-column in Detail)

### Next.js Image Domains
`next.config.js` whitelists `image.tmdb.org` and `picsum.photos` for `next/image`.

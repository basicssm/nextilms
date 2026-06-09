# WhatWatch

**Deja de buscar. Empieza a ver.**

Aplicación web para descubrir y organizar películas y series: lista de seguimiento, registro de episodios vistos, valoraciones y notas personales, filtro por tus plataformas de streaming y un sistema de gamificación con niveles, logros y recompensas desbloqueables.

Consume la [API de TMDB](https://developer.themoviedb.org/docs) (catálogo en español, región España) y usa [Supabase](https://supabase.com) para autenticación y persistencia.

## Funcionalidades

- **Dashboard de descubrimiento** — secciones temáticas horizontales (Indispensables, Tendencias, Para reír, En pareja…), con pestañas Películas/Series y filtro por tus plataformas. Oculta automáticamente lo que ya has visto.
- **Búsqueda** — sugerencias instantáneas y página de resultados con scroll infinito.
- **Mi Lista** — tablero kanban con tres estados: Viendo / Por ver / Vista.
- **Detalle de título** — tráilers, reparto, títulos relacionados, dónde verlo en streaming, botón de compartir.
- **Series** — registro de episodios vistos por temporada, con orden por capítulos pendientes y "modo maratón" (desbloqueable).
- **Valoraciones y notas** — puntúa del 1 al 10 y guarda notas privadas.
- **¿Qué veo esta noche?** — recomendaciones desde tu propia lista filtradas por tus plataformas.
- **Mis plataformas** — selecciona tus servicios de streaming y analiza cuántos títulos de tu lista cubre cada uno.
- **Estadísticas** — horas estimadas, actividad mensual, géneros y décadas favoritas, récords y datos curiosos.
- **Gamificación** — puntos por ver, valorar y anotar; 5 niveles (de *Espectador* a *Maestro del Séptimo Arte*) que desbloquean estadísticas de géneros, selector de color de acento, modo maratón y anillo dorado.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 18 + TypeScript
- [Supabase](https://supabase.com) — auth (email, Google, Apple) y Postgres con RLS
- [SWR](https://swr.vercel.app) para caché de datos remotos
- styled-jsx para estilos por componente; tema oscuro con design tokens en `styles/globals.css`

## Puesta en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea `.env.local` a partir de `.env.local.example`:

   ```
   NEXT_PUBLIC_TMDB_API_KEY=...        # https://www.themoviedb.org/settings/api
   NEXT_PUBLIC_SUPABASE_URL=...        # Supabase → Settings → API
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. Crea las tablas en Supabase ejecutando en el SQL Editor, en este orden:

   1. `supabase/schema.sql` (watchlist)
   2. `supabase/platforms_schema.sql` (user_platforms)
   3. `supabase/watched_episodes_schema.sql` (watched_episodes)
   4. `supabase/add_media_type_migration.sql`
   5. `supabase/add_rating_notes_migration.sql`

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint |

## Estructura

```
app/                Páginas (App Router): /, /film/[id], /series/[id],
                    /search/[query], /my-list, /platforms, /stats
components/         Componentes UI (styled-jsx)
hooks/              Datos: watchlist, plataformas, episodios, gamificación…
context/            AuthContext (sesión de Supabase)
lib/                Cliente de Supabase, configuración del dashboard
utils/              Helpers de TMDB, constantes, configuración de estados
supabase/           Esquemas SQL y migraciones
```

Para una guía detallada de la arquitectura, ver [CLAUDE.md](CLAUDE.md).

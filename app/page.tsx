"use client";

import { Suspense } from "react";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { Film } from "@/types";
import NavBar from "@/components/NavBar";
import Films from "@/components/Films";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/context/AuthContext";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import Link from "next/link";
import TonightModal from "@/components/TonightModal";

type MediaType = "film" | "series";
type FilmCategory = "popular" | "upcoming" | "trending" | "my_platforms" | "discover";
type SeriesCategory = "popular" | "airing" | "trending" | "my_platforms" | "discover";
type Category = FilmCategory | SeriesCategory;

type DiscoverFilters = {
  genreId: number | null;
  minRating: number;
};

const FILM_CATEGORIES: { id: FilmCategory; label: string }[] = [
  { id: "popular",      label: "Populares" },
  { id: "upcoming",     label: "Próximos estrenos" },
  { id: "trending",     label: "Tendencias" },
  { id: "my_platforms", label: "Mis plataformas" },
  { id: "discover",     label: "Explorar" },
];

const SERIES_CATEGORIES: { id: SeriesCategory; label: string }[] = [
  { id: "popular",      label: "Populares" },
  { id: "airing",      label: "En emisión" },
  { id: "trending",    label: "Tendencias" },
  { id: "my_platforms", label: "Mis plataformas" },
  { id: "discover",    label: "Explorar" },
];

const ENDPOINTS: Record<MediaType, Record<string, string>> = {
  film:   { popular: "/movie/popular", upcoming: "/movie/upcoming", trending: "/trending/movie/week", my_platforms: "/discover/movie", discover: "/discover/movie" },
  series: { popular: "/tv/popular",    airing:   "/tv/on_the_air",  trending: "/trending/tv/week",   my_platforms: "/discover/tv",    discover: "/discover/tv"    },
};

const RATING_OPTIONS = [
  { label: "Cualquiera", value: 0 },
  { label: "5+", value: 5 },
  { label: "6+", value: 6 },
  { label: "7+", value: 7 },
  { label: "8+", value: 8 },
];

function buildUrl(
  mediaType: MediaType,
  category: Category,
  page: number,
  providerIds?: number[],
  filters?: DiscoverFilters
): string {
  const auth = `api_key=${API_KEY}&language=es-ES`;
  const path = ENDPOINTS[mediaType][category] ?? ENDPOINTS[mediaType].popular;

  if (category === "my_platforms") {
    const providers = providerIds?.join("|") ?? "";
    return `${API_BASE_URL}${path}?${auth}&with_watch_providers=${providers}&watch_region=ES&page=${page}`;
  }
  if (category === "discover") {
    let url = `${API_BASE_URL}${path}?${auth}&sort_by=vote_average.desc&vote_count.gte=100&watch_region=ES&page=${page}`;
    if (filters?.genreId) url += `&with_genres=${filters.genreId}`;
    if (filters?.minRating) url += `&vote_average.gte=${filters.minRating}`;
    return url;
  }
  const extra = category === "upcoming" ? "&region=ES" : "";
  return `${API_BASE_URL}${path}?${auth}${extra}&page=${page}`;
}

function normalizeItem(item: {
  id: string;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}): Film {
  return {
    id: item.id,
    title: item.title ?? item.name ?? "",
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    release_date: item.release_date ?? item.first_air_date,
  };
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { platformIds, loading: platformsLoading } = useUserPlatforms();

  const initMediaType = (searchParams.get("mediaType") === "series" ? "series" : "film") as MediaType;
  const initCategory = (searchParams.get("category") ?? "popular") as Category;

  const [mediaType, setMediaType] = useState<MediaType>(initMediaType);
  const [category, setCategory] = useState<Category>(initCategory);
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [genreFilter, setGenreFilter] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    if (category !== "discover") return;
    const segment = mediaType === "film" ? "movie" : "tv";
    fetch(`${API_BASE_URL}/genre/${segment}/list?api_key=${API_KEY}&language=es-ES`)
      .then((r) => r.json())
      .then((d) => setGenres(d.genres ?? []));
  }, [mediaType, category]);

  const isMyPlatforms = category === "my_platforms";
  const providerIdsArr = Array.from(platformIds);
  const hasNoPlatforms = isMyPlatforms && !authLoading && !platformsLoading && (
    !user || platformIds.size === 0
  );

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    if (isMyPlatforms && providerIdsArr.length === 0) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const filters: DiscoverFilters = { genreId: genreFilter, minRating };
      const url = buildUrl(mediaType, category, pageRef.current, providerIdsArr, filters);
      const res = await fetch(url);
      const data = await res.json();
      if (data.results) {
        setFilms((prev) => [...prev, ...data.results.map(normalizeItem)]);
        hasMoreRef.current = pageRef.current < (data.total_pages ?? 1);
        pageRef.current += 1;
      }
    } catch (err) {
      console.error("fetch error:", err);
    }
    loadingRef.current = false;
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType, category, providerIdsArr.join(","), genreFilter, minRating]);

  useEffect(() => {
    setFilms([]);
    setLoading(true);
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
  }, [mediaType, category, platformIds]);

  useEffect(() => {
    if (isMyPlatforms && (authLoading || platformsLoading)) return;
    loadMore();
  }, [loadMore, isMyPlatforms, authLoading, platformsLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const categories = mediaType === "film" ? FILM_CATEGORIES : SERIES_CATEGORIES;

  function switchMediaType(type: MediaType) {
    setMediaType(type);
    setCategory("popular");
    setGenreFilter(null);
    setMinRating(0);
    router.replace(`/?mediaType=${type}&category=popular`);
  }

  function switchCategory(cat: Category) {
    setCategory(cat);
    if (cat !== "discover") {
      setGenreFilter(null);
      setMinRating(0);
    }
    router.replace(`/?mediaType=${mediaType}&category=${cat}`);
  }

  function handleSearch() {
    if (searchText.trim()) router.push(`/search/${searchText.trim()}?mediaType=${mediaType}`);
  }

  function handleSearchKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <>
      <NavBar />

      {/* ── Barra de búsqueda + tabs ─────────────── */}
      <div className="controls">
        {/* Search */}
        <div className={`search-bar${searchFocused ? " focused" : ""}`}>
          <span className="search-icon">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            type="text"
            placeholder="Buscar películas y series..."
            value={searchText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            onKeyDown={handleSearchKey}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoComplete="off"
          />
          {searchText && (
            <button className="search-clear" onClick={() => setSearchText("")} aria-label="Limpiar">
              ✕
            </button>
          )}
          <button className="search-submit" onClick={handleSearch} aria-label="Buscar">
            Buscar
          </button>
        </div>

        {/* Tonight recommendations button */}
        <TonightModal />

        {/* Tipo de media — pills */}
        <div className="type-pills">
          <button
            className={`type-pill${mediaType === "film" ? " active" : ""}`}
            onClick={() => switchMediaType("film")}
          >
            Películas
          </button>
          <button
            className={`type-pill${mediaType === "series" ? " active" : ""}`}
            onClick={() => switchMediaType("series")}
          >
            Series
          </button>
        </div>

        {/* Categorías — chips */}
        <div className="cat-chips-wrap">
          <div className="cat-chips">
            {categories.map(({ id, label }) => (
              <button
                key={id}
                className={`cat-chip${category === id ? " active" : ""}${id === "my_platforms" ? " chip-platforms" : ""}${id === "discover" ? " chip-discover" : ""}`}
                onClick={() => switchCategory(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros avanzados — solo en "Explorar" */}
        {category === "discover" && (
          <div className="filter-panel">
            {/* Géneros */}
            {genres.length > 0 && (
              <div className="filter-row">
                <span className="filter-label">Género</span>
                <div className="filter-chips-wrap">
                  <div className="filter-chips">
                    <button
                      className={`filter-chip${genreFilter === null ? " active" : ""}`}
                      onClick={() => { setGenreFilter(null); }}
                    >
                      Todos
                    </button>
                    {genres.map((g) => (
                      <button
                        key={g.id}
                        className={`filter-chip${genreFilter === g.id ? " active" : ""}`}
                        onClick={() => setGenreFilter(genreFilter === g.id ? null : g.id)}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Puntuación mínima */}
            <div className="filter-row">
              <span className="filter-label">Puntuación</span>
              <div className="filter-chips">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`filter-chip${minRating === opt.value ? " active" : ""}`}
                    onClick={() => setMinRating(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(genreFilter !== null || minRating > 0) && (
              <button
                className="filter-clear"
                onClick={() => { setGenreFilter(null); setMinRating(0); }}
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Contenido ───────────────────────────── */}
      {hasNoPlatforms ? (
        <div className="platforms-prompt">
          <div className="prompt-card">
            <div className="prompt-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
                <rect x="4" y="8" width="32" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13 32h14M20 28v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 14l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 22h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2>{!user ? "Empieza a ver lo que tienes" : "¿Qué plataformas tienes?"}</h2>
            <p>
              {!user
                ? "Inicia sesión, añade tus plataformas y descubre qué puedes ver esta noche."
                : "Selecciona las plataformas que tienes y filtra solo lo que puedes ver ahora mismo."}
            </p>
            {!user ? (
              <span className="prompt-hint">Pulsa el menú arriba a la derecha para entrar</span>
            ) : (
              <Link href="/platforms" className="prompt-btn">
                Configurar plataformas
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <Films films={films} loading={loading} mediaType={mediaType} />
          <div ref={sentinelRef} className="sentinel">
            {loading && films.length > 0 && (
              <div className="load-more-indicator">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        /* ── Controls área ──────────────────────── */
        .controls {
          padding: 24px 24px 8px;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Search bar ─────────────────────────── */
        .search-bar {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 560px;
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-lg);
          padding: 10px 12px 10px 16px;
          gap: 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-bar.focused {
          border-color: rgba(108, 99, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
        }

        .search-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          flex-shrink: 0;
          font-size: 14px;
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: var(--font-body);
          font-size: 15px;
          min-width: 0;
        }

        .search-bar input::placeholder {
          color: var(--text-subtle);
        }

        .search-clear {
          background: none;
          border: none;
          color: var(--text-subtle);
          font-size: 12px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          transition: color 0.15s;
          flex-shrink: 0;
        }

        .search-clear:hover {
          color: var(--text-muted);
        }

        .search-submit {
          background: var(--accent-gradient);
          border: none;
          color: #fff;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .search-submit:hover {
          opacity: 0.9;
        }

        .search-submit:active {
          transform: scale(0.97);
        }

        /* ── Type pills ─────────────────────────── */
        .type-pills {
          display: flex;
          gap: 6px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0;
        }

        .type-pill {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          padding: 4px 4px 12px;
          margin-bottom: -1px;
          transition: color 0.18s, border-color 0.18s;
          color: var(--text-muted);
        }

        .type-pill.active {
          color: var(--text);
          border-bottom-color: var(--accent);
        }

        .type-pill:hover:not(.active) {
          color: var(--text);
        }

        /* ── Category chips ─────────────────────── */
        .cat-chips-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          margin: 0 -24px;
          padding: 0 24px;
        }

        .cat-chips-wrap::-webkit-scrollbar {
          display: none;
        }

        .cat-chips {
          display: flex;
          gap: 8px;
          padding-bottom: 4px;
          white-space: nowrap;
          min-width: max-content;
        }

        .cat-chip {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 7px 16px;
          border-radius: 20px;
          transition: all 0.18s;
          white-space: nowrap;
        }

        .cat-chip:hover:not(.active) {
          border-color: var(--border-hover);
          color: var(--text);
          background: var(--surface-hover);
        }

        .cat-chip.active {
          background: rgba(108, 99, 255, 0.12);
          border-color: rgba(108, 99, 255, 0.4);
          color: var(--accent);
        }

        .chip-platforms {
          border-color: rgba(108, 99, 255, 0.2);
        }

        .chip-platforms.active {
          background: rgba(108, 99, 255, 0.15);
          border-color: rgba(108, 99, 255, 0.5);
          color: var(--accent);
        }

        .chip-discover {
          border-color: rgba(212, 175, 55, 0.25);
          color: var(--gold);
        }

        .chip-discover.active {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.5);
          color: var(--gold);
        }

        /* ── Filter panel ───────────────────────── */
        .filter-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: fadeInUp 0.2s ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .filter-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .filter-chips-wrap {
          overflow-x: auto;
          scrollbar-width: none;
          margin: 0 -4px;
          padding: 0 4px;
        }

        .filter-chips-wrap::-webkit-scrollbar { display: none; }

        .filter-chips {
          display: flex;
          gap: 6px;
          flex-wrap: nowrap;
          min-width: max-content;
        }

        .filter-chip {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          padding: 5px 13px;
          border-radius: 20px;
          transition: all 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .filter-chip:hover:not(.active) {
          border-color: var(--border-hover);
          color: var(--text);
        }

        .filter-chip.active {
          background: rgba(212, 175, 55, 0.12);
          border-color: rgba(212, 175, 55, 0.45);
          color: var(--gold);
        }

        .filter-clear {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          font-family: var(--font-body);
          cursor: pointer;
          align-self: flex-start;
          padding: 2px 0;
          transition: color 0.15s;
        }

        .filter-clear:hover {
          color: var(--text);
        }

        /* ── Platforms prompt ───────────────────── */
        .platforms-prompt {
          display: flex;
          justify-content: center;
          padding: 64px 24px;
        }

        .prompt-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          max-width: 360px;
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-xl);
          padding: 48px 32px;
          animation: fadeInUp 0.3s ease;
        }

        .prompt-icon {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .prompt-card h2 {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
        }

        .prompt-card p {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.65;
        }

        .prompt-hint {
          color: var(--text-subtle);
          font-size: 13px;
        }

        :global(.prompt-btn) {
          display: inline-block;
          padding: 11px 24px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: #fff;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
        }

        :global(.prompt-btn:hover) {
          opacity: 0.9;
        }

        :global(.prompt-btn:active) {
          transform: scale(0.98);
        }

        /* ── Sentinel / load more ───────────────── */
        .sentinel {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .load-more-indicator {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          opacity: 0.4;
          animation: dotPulse 1.2s ease-in-out infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1); }
        }

        /* ── Mobile ─────────────────────────────── */
        @media (max-width: 480px) {
          .controls {
            padding: 16px 14px 8px;
            gap: 12px;
          }
          .search-bar {
            padding: 9px 10px 9px 14px;
          }
          .search-submit {
            padding: 6px 12px;
          }
          .type-pill {
            font-size: 16px;
            padding: 4px 2px 10px;
          }
          .cat-chips-wrap {
            margin: 0 -14px;
            padding: 0 14px;
          }
        }
      `}</style>
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

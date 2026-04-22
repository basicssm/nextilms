"use client";

import { Suspense } from "react";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { film } from "@/types";
import NavBar from "@/components/NavBar";
import Films from "@/components/Films";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/context/AuthContext";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import Link from "next/link";

type MediaType = "film" | "series";
type FilmCategory = "popular" | "upcoming" | "trending" | "my_platforms";
type SeriesCategory = "popular" | "airing" | "trending" | "my_platforms";
type Category = FilmCategory | SeriesCategory;

const FILM_CATEGORIES: { id: FilmCategory; label: string }[] = [
  { id: "popular", label: "Populares en España" },
  { id: "upcoming", label: "Próximos estrenos" },
  { id: "trending", label: "Tendencias" },
  { id: "my_platforms", label: "En mis plataformas" },
];

const SERIES_CATEGORIES: { id: SeriesCategory; label: string }[] = [
  { id: "popular", label: "Populares" },
  { id: "airing", label: "En emisión" },
  { id: "trending", label: "Tendencias" },
  { id: "my_platforms", label: "En mis plataformas" },
];

function buildUrl(
  mediaType: MediaType,
  category: Category,
  page: number,
  providerIds?: number[]
): string {
  const base = API_BASE_URL;
  const auth = `api_key=${API_KEY}&language=es-ES`;

  if (category === "my_platforms") {
    const providers = providerIds?.join("|") ?? "";
    if (mediaType === "film") {
      return `${base}/discover/movie?${auth}&with_watch_providers=${providers}&watch_region=ES&page=${page}`;
    }
    return `${base}/discover/tv?${auth}&with_watch_providers=${providers}&watch_region=ES&page=${page}`;
  }

  if (mediaType === "film") {
    if (category === "upcoming") return `${base}/movie/upcoming?${auth}&region=ES&page=${page}`;
    if (category === "trending") return `${base}/trending/movie/week?${auth}&page=${page}`;
    return `${base}/movie/popular?${auth}&region=ES&page=${page}`;
  } else {
    if (category === "airing") return `${base}/tv/on_the_air?${auth}&page=${page}`;
    if (category === "trending") return `${base}/trending/tv/week?${auth}&page=${page}`;
    return `${base}/tv/popular?${auth}&region=ES&page=${page}`;
  }
}

function normalizeItem(item: {
  id: string;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}): film {
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
  const [films, setFilms] = useState<film[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isMyPlatforms = category === "my_platforms";
  const providerIdsArr = Array.from(platformIds);
  const hasNoPlatforms = isMyPlatforms && !authLoading && !platformsLoading && (
    !user || platformIds.size === 0
  );

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    if (isMyPlatforms && (providerIdsArr.length === 0)) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const url = buildUrl(mediaType, category, pageRef.current, providerIdsArr);
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
  }, [mediaType, category, providerIdsArr.join(",")]);

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
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
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
    router.replace(`/?mediaType=${type}&category=popular`);
  }

  function switchCategory(cat: Category) {
    setCategory(cat);
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

      <div className="hero">
        <div className="hero-search">
          <input
            type="text"
            placeholder="Buscar películas y series..."
            value={searchText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            onKeyDown={handleSearchKey}
            autoComplete="off"
          />
          <button onClick={handleSearch} aria-label="Buscar">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>
      </div>

      <div className="tabs-bar">
        <div className="media-tabs">
          <button
            className={`media-tab${mediaType === "film" ? " active" : ""}`}
            onClick={() => switchMediaType("film")}
          >
            Películas
          </button>
          <button
            className={`media-tab${mediaType === "series" ? " active" : ""}`}
            onClick={() => switchMediaType("series")}
          >
            Series
          </button>
        </div>
        <div className="cat-tabs">
          {categories.map(({ id, label }) => (
            <button
              key={id}
              className={`cat-tab${category === id ? " active" : ""}${id === "my_platforms" ? " my-platforms-tab" : ""}`}
              onClick={() => switchCategory(id)}
            >
              {id === "my_platforms" && <span className="tab-icon">▶</span>}
              {label}
            </button>
          ))}
        </div>
      </div>

      {hasNoPlatforms ? (
        <div className="platforms-prompt">
          <div className="prompt-card">
            <div className="prompt-icon">📺</div>
            <h2>{!user ? "Inicia sesión" : "Configura tus plataformas"}</h2>
            <p>
              {!user
                ? "Inicia sesión y elige tus plataformas de streaming para ver el contenido disponible en ellas."
                : "Selecciona las plataformas que tienes contratadas para filtrar el contenido disponible."}
            </p>
            {!user ? (
              <span className="prompt-hint">Pulsa el menú ☰ para iniciar sesión</span>
            ) : (
              <Link href="/platforms" className="prompt-btn">
                Gestionar plataformas
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <Films films={films} loading={loading} mediaType={mediaType} />
          <div ref={sentinelRef} className="sentinel">
            {loading && <span className="spinner" />}
          </div>
        </>
      )}

      <style jsx>{`
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 24px 24px;
        }

        .hero-search {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 560px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 16px;
          gap: 10px;
          transition: border-color 0.2s, background 0.2s;
        }

        .hero-search:focus-within {
          border-color: rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.06);
        }

        .hero-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #e8e8f2;
          font-size: 16px;
          min-width: 0;
        }

        .hero-search input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .hero-search button {
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .hero-search button:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .hero-search button :global(svg) {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        .tabs-bar {
          padding: 20px 24px 4px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .media-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .media-tab {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          padding: 6px 18px 10px;
          margin-bottom: -1px;
          transition: color 0.18s, border-color 0.18s;
          color: #8888aa;
        }

        .media-tab.active {
          color: #f0f0f8;
          border-bottom-color: #d4af37;
        }

        .cat-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding-bottom: 4px;
        }

        .cat-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #8888aa;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 5px 14px;
          border-radius: 20px;
          transition: all 0.18s;
        }

        .cat-tab.active {
          background: rgba(212, 175, 55, 0.14);
          border-color: rgba(212, 175, 55, 0.38);
          color: #d4af37;
        }

        .my-platforms-tab {
          border-color: rgba(99, 179, 237, 0.2);
          color: #7ab8e0;
        }

        .my-platforms-tab.active {
          background: rgba(99, 179, 237, 0.12);
          border-color: rgba(99, 179, 237, 0.45);
          color: #63b3ed;
        }

        .tab-icon {
          font-size: 9px;
        }

        /* Platforms prompt */
        .platforms-prompt {
          display: flex;
          justify-content: center;
          padding: 60px 24px;
        }

        .prompt-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          max-width: 380px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 40px 32px;
        }

        .prompt-icon {
          font-size: 40px;
          line-height: 1;
        }

        .prompt-card h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #e8e8f2;
          margin: 0;
        }

        .prompt-card p {
          color: #8888aa;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .prompt-hint {
          color: #6666888;
          font-size: 13px;
          margin-top: 4px;
        }

        :global(.prompt-btn) {
          display: inline-block;
          margin-top: 4px;
          padding: 10px 24px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 8px;
          color: #d4af37;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.18s, border-color 0.18s;
        }

        :global(.prompt-btn:hover) {
          background: rgba(212, 175, 55, 0.2);
          border-color: rgba(212, 175, 55, 0.55);
        }

        .sentinel {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          display: inline-block;
          width: 28px;
          height: 28px;
          border: 3px solid rgba(212, 175, 55, 0.18);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 20px 12px 16px;
          }
          .hero-search {
            padding: 10px 14px;
          }
          .hero-search input {
            font-size: 15px;
          }
          .tabs-bar {
            padding: 14px 12px 4px;
          }
          .media-tab {
            font-size: 15px;
            padding: 5px 12px 8px;
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

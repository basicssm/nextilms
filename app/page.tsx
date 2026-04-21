"use client";

import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useState, useEffect, useCallback, useRef } from "react";
import { film } from "@/types";
import NavBar from "@/components/NavBar";
import Films from "@/components/Films";
import Search from "@/components/Search";

type MediaType = "film" | "series";
type FilmCategory = "popular" | "upcoming" | "trending";
type SeriesCategory = "popular" | "airing" | "trending";
type Category = FilmCategory | SeriesCategory;

const FILM_CATEGORIES: { id: FilmCategory; label: string }[] = [
  { id: "popular", label: "Populares en España" },
  { id: "upcoming", label: "Próximos estrenos" },
  { id: "trending", label: "Tendencias" },
];

const SERIES_CATEGORIES: { id: SeriesCategory; label: string }[] = [
  { id: "popular", label: "Populares" },
  { id: "airing", label: "En emisión" },
  { id: "trending", label: "Tendencias" },
];

function buildUrl(mediaType: MediaType, category: Category, page: number): string {
  const base = `${API_BASE_URL}`;
  const auth = `api_key=${API_KEY}&language=es-ES`;
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

export default function Home() {
  const [mediaType, setMediaType] = useState<MediaType>("film");
  const [category, setCategory] = useState<Category>("popular");
  const [films, setFilms] = useState<film[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const url = buildUrl(mediaType, category, pageRef.current);
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
  }, [mediaType, category]);

  useEffect(() => {
    setFilms([]);
    setLoading(true);
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
  }, [mediaType, category]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

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
  }

  return (
    <>
      <NavBar>
        <Search />
      </NavBar>

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
              className={`cat-tab${category === id ? " active" : ""}`}
              onClick={() => setCategory(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Films films={films} loading={loading} mediaType={mediaType} />

      <div ref={sentinelRef} className="sentinel">
        {loading && <span className="spinner" />}
      </div>

      <style jsx>{`
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
          color: #6666888;
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

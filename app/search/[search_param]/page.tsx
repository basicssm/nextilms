"use client";

import { Suspense, use } from "react";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useState, useEffect, useCallback, useRef } from "react";
import { film } from "@/types";
import NavBar from "@/components/NavBar";
import Films from "@/components/Films";
import Search from "@/components/Search";
import Back from "@/components/Back";
import { useRouter, useSearchParams } from "next/navigation";

type MediaType = "film" | "series";

function buildSearchUrl(mediaType: MediaType, query: string, page: number): string {
  const auth = `api_key=${API_KEY}&language=es-ES`;
  const endpoint = mediaType === "series" ? "tv" : "movie";
  return `${API_BASE_URL}/search/${endpoint}?${auth}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
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

function SearchContent({ search_param }: { search_param: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initMediaType = (searchParams.get("mediaType") === "series" ? "series" : "film") as MediaType;
  const [mediaType, setMediaType] = useState<MediaType>(initMediaType);
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
      const url = buildSearchUrl(mediaType, search_param, pageRef.current);
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
  }, [search_param, mediaType]);

  useEffect(() => {
    setFilms([]);
    setLoading(true);
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
  }, [search_param, mediaType]);

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

  function switchMediaType(type: MediaType) {
    setMediaType(type);
    router.replace(`/search/${search_param}?mediaType=${type}`);
  }

  return (
    <>
      <NavBar>
        <div className="search-nav">
          <Back />
          <Search />
        </div>
      </NavBar>

      <div className="search-tabs">
        <button
          className={`stab${mediaType === "film" ? " active" : ""}`}
          onClick={() => switchMediaType("film")}
        >
          Películas
        </button>
        <button
          className={`stab${mediaType === "series" ? " active" : ""}`}
          onClick={() => switchMediaType("series")}
        >
          Series
        </button>
      </div>

      <Films films={films} loading={loading} mediaType={mediaType} />

      <div ref={sentinelRef} className="sentinel">
        {loading && <span className="spinner" />}
      </div>

      <style jsx>{`
        .search-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-tabs {
          display: flex;
          gap: 4px;
          padding: 16px 24px 0;
          max-width: 1400px;
          margin: 0 auto;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .stab {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #8888aa;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          padding: 5px 16px 10px;
          margin-bottom: -1px;
          transition: color 0.18s, border-color 0.18s;
        }

        .stab.active {
          color: #f0f0f8;
          border-bottom-color: #d4af37;
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
          .search-tabs {
            padding: 12px 12px 0;
          }
        }
      `}</style>
    </>
  );
}

export default function SearchPage({
  params,
}: {
  params: Promise<{ search_param: string }>;
}) {
  const { search_param } = use(params);
  return (
    <Suspense>
      <SearchContent search_param={search_param} />
    </Suspense>
  );
}

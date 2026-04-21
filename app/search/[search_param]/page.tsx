"use client";

import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useState, useEffect, useCallback, useRef } from "react";
import { film } from "@/types";
import NavBar from "@/components/NavBar";
import Films from "@/components/Films";
import Search from "@/components/Search";
import Back from "@/components/Back";

export default function SearchPage({
  params,
}: {
  params: { search_param: string };
}) {
  const { search_param } = params;
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
      const res = await fetch(
        `${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${search_param}&page=${pageRef.current}&include_adult=false`
      );
      const data = await res.json();
      if (data.results) {
        setFilms((prev) => [
          ...prev,
          ...data.results.map(
            ({ id, title, poster_path, vote_average }: film & { vote_average: number }) => ({
              id,
              title,
              poster_path,
              vote_average,
            })
          ),
        ]);
        hasMoreRef.current = pageRef.current < (data.total_pages ?? 1);
        pageRef.current += 1;
      }
    } catch (err) {
      console.error("fetch error:", err);
    }
    loadingRef.current = false;
    setLoading(false);
  }, [search_param]);

  // Reset state when search query changes (runs before loadMore effect)
  useEffect(() => {
    setFilms([]);
    setLoading(true);
    pageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
  }, [search_param]);

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

  return (
    <>
      <NavBar>
        <div className="search-nav">
          <Back />
          <Search />
        </div>
      </NavBar>
      <Films films={films} loading={loading} />
      <div ref={sentinelRef} className="sentinel">
        {loading && <span className="spinner" />}
      </div>
      <style jsx>{`
        .search-nav {
          display: flex;
          align-items: center;
          gap: 12px;
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
      `}</style>
    </>
  );
}

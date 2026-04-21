"use client";

import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useState, useEffect, useCallback, useRef } from "react";
import { film } from "@/types";
import NavBar from "@/components/NavBar";
import Films from "@/components/Films";
import Search from "@/components/Search";

export default function Home() {
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
        `${API_BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&page=${pageRef.current}`
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
  }, []);

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
        <Search />
      </NavBar>
      <Films films={films} loading={loading} />
      <div ref={sentinelRef} className="sentinel">
        {loading && <span className="spinner" />}
      </div>
      <style jsx>{`
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

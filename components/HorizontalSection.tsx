"use client";

import { useEffect, useRef, useState, MutableRefObject } from "react";
import useSWR from "swr";
import { Film as FilmType, WatchlistStatus } from "@/types";
import { SectionConfig } from "@/lib/dashboardConfig";
import { normalizeItem, buildSectionUrl } from "@/utils/tmdb";
import Film from "@/components/Film";
import UpcomingCard from "@/components/UpcomingCard";

const CARD_WIDTH = 140;
const CARD_GAP = 12;
const SCROLL_CARDS = 3;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type RawItem = {
  id: string | number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
};

type Props = {
  section: SectionConfig;
  mediaType: "film" | "series";
  selectedPlatformIds: number[];
  watchlistMap: Map<number, WatchlistStatus>;
  seenIds: MutableRefObject<Set<string>>;
};

export default function HorizontalSection({
  section,
  mediaType,
  selectedPlatformIds,
  watchlistMap,
  seenIds,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [displayFilms, setDisplayFilms] = useState<FilmType[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [nextPage, setNextPage] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [extraItems, setExtraItems] = useState<FilmType[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const scrollKey = `hscroll-${section.id}-${mediaType}-${selectedPlatformIds.join(",")}`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "200px" }
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const params = section.buildParams(mediaType, selectedPlatformIds);
  const url = visible ? buildSectionUrl(section.endpoint(mediaType), params) : null;

  const { data, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300_000,
  });

  const moreUrl =
    isFetchingMore && url && nextPage <= totalPages
      ? `${url}&page=${nextPage}`
      : null;

  const { data: moreData } = useSWR(moreUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300_000,
  });

  // Deduplicate against already-shown films across sections
  useEffect(() => {
    if (!data) return;
    const all: FilmType[] = (data.results ?? []).map((item: RawItem) =>
      normalizeItem(item)
    );
    const unique = all.filter((f) => !seenIds.current.has(f.id));
    unique.forEach((f) => seenIds.current.add(f.id));
    setDisplayFilms(unique);
    setTotalPages(data.total_pages ?? 1);
    setLoaded(true);
  }, [data, seenIds]);

  useEffect(() => {
    if (!moreData) return;
    const all: FilmType[] = (moreData.results ?? []).map((item: RawItem) =>
      normalizeItem(item)
    );
    const unique = all.filter((f) => !seenIds.current.has(f.id));
    unique.forEach((f) => seenIds.current.add(f.id));
    setExtraItems((prev) => [...prev, ...unique]);
    setNextPage((p) => p + 1);
    setIsFetchingMore(false);
  }, [moreData, seenIds]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    try {
      sessionStorage.setItem(scrollKey, String(el.scrollLeft));
    } catch {}
  }

  useEffect(() => {
    handleScroll();
  }, [displayFilms]);

  // Restore horizontal scroll once films are loaded
  useEffect(() => {
    if (!loaded || !scrollRef.current) return;
    try {
      const saved = sessionStorage.getItem(scrollKey);
      if (saved) {
        const x = parseInt(saved, 10);
        if (x > 0) {
          scrollRef.current.scrollLeft = x;
          handleScroll();
        }
      }
    } catch {}
    // scrollKey is stable within a component instance (remounts when it changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  function doScrollLeft() {
    scrollRef.current?.scrollBy({
      left: -(CARD_WIDTH + CARD_GAP) * SCROLL_CARDS,
      behavior: "smooth",
    });
  }

  function doScrollRight() {
    scrollRef.current?.scrollBy({
      left: (CARD_WIDTH + CARD_GAP) * SCROLL_CARDS,
      behavior: "smooth",
    });
  }

  // Remove titles the user has already watched or is watching
  const allFilms = [...displayFilms, ...extraItems];
  const visibleFilms = allFilms.filter((f) => {
    const status = watchlistMap.get(Number(f.id));
    return status !== "watched" && status !== "watching";
  });

  const showMoreButton = loaded && nextPage <= totalPages && visibleFilms.length > 0;

  // Hide section completely once loaded with no results
  if (loaded && visibleFilms.length === 0) return null;

  const skeletons = Array.from({ length: 8 });

  return (
    <div ref={sectionRef} className="section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="emoji" aria-hidden>
            {section.emoji}
          </span>
          {section.title}
        </h2>
      </div>

      <div className="scroll-container">
        {canScrollLeft && (
          <button
            className="arrow arrow-left"
            onClick={doScrollLeft}
            aria-label="Desplazar izquierda"
          >
            ‹
          </button>
        )}

        <div ref={scrollRef} className="scroll-row" onScroll={handleScroll}>
          {!visible || isLoading
            ? skeletons.map((_, i) => (
                <div key={i} className="card-wrap">
                  <div className="skeleton-card skeleton" />
                </div>
              ))
            : visibleFilms.map((film) =>
                section.isUpcoming ? (
                  <div key={film.id} className="card-wrap card-wrap-upcoming">
                    <UpcomingCard film={film} />
                  </div>
                ) : (
                  <div key={film.id} className="card-wrap">
                    <Film
                      film={film}
                      mediaType={mediaType}
                      watchlistStatus={watchlistMap.get(Number(film.id)) ?? null}
                    />
                  </div>
                )
              )}
        </div>

        {canScrollRight && (
          <button
            className="arrow arrow-right"
            onClick={doScrollRight}
            aria-label="Desplazar derecha"
          >
            ›
          </button>
        )}
      </div>

      {showMoreButton && (
        <div className="show-more-wrap">
          <button
            className="show-more-btn"
            onClick={() => setIsFetchingMore(true)}
            disabled={isFetchingMore}
            aria-label="Cargar más títulos"
          >
            {isFetchingMore ? (
              <span className="show-more-spinner" aria-hidden="true" />
            ) : null}
            {isFetchingMore ? "Cargando…" : "Mostrar más"}
          </button>
        </div>
      )}

      <style jsx>{`
        .section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .section-header {
          padding: 0 32px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .emoji {
          font-size: 1.2rem;
          line-height: 1;
        }

        /* ── Scroll ── */
        .scroll-container {
          position: relative;
        }

        .scroll-row {
          display: flex;
          gap: ${CARD_GAP}px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 4px 32px 12px;
        }

        .scroll-row::-webkit-scrollbar {
          display: none;
        }

        .card-wrap {
          flex-shrink: 0;
          width: ${CARD_WIDTH}px;
          scroll-snap-align: start;
        }

        .card-wrap-upcoming {
          width: 160px;
        }

        .skeleton-card {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 14px;
        }

        /* ── Arrows ── */
        .arrow {
          position: absolute;
          top: 40%;
          transform: translateY(-50%);
          z-index: 10;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border-hover);
          background: var(--surface-elevated);
          color: var(--text);
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.15s;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 0 0 2px;
        }

        .arrow:hover {
          background: var(--surface-hover);
        }

        .arrow:active {
          transform: translateY(-50%) scale(0.94);
        }

        .arrow-left {
          left: 6px;
        }

        .arrow-right {
          right: 6px;
        }

        @media (hover: none) {
          .arrow {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .section-header {
            padding: 0 16px;
          }
          .scroll-row {
            padding: 4px 16px 12px;
          }
          .card-wrap {
            width: 120px;
          }
          .card-wrap-upcoming {
            width: 135px;
          }
          .section-title {
            font-size: 1rem;
          }
        }

        /* ── Mostrar más ── */
        .show-more-wrap {
          padding: 4px 32px 0;
        }

        .show-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          border: 1px solid var(--border-hover);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 6px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: color 0.18s, border-color 0.18s, background 0.18s;
        }

        .show-more-btn:hover:not(:disabled) {
          color: var(--text);
          border-color: var(--gold);
          background: rgba(212, 175, 55, 0.08);
        }

        .show-more-btn:disabled {
          cursor: default;
          opacity: 0.55;
        }

        .show-more-spinner {
          width: 11px;
          height: 11px;
          border: 1.5px solid var(--text-muted);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .show-more-wrap {
            padding: 4px 16px 0;
          }
        }
      `}</style>
    </div>
  );
}

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

  // Deduplicate against already-shown films across sections
  useEffect(() => {
    if (!data) return;
    const all: FilmType[] = (data.results ?? []).map((item: RawItem) =>
      normalizeItem(item)
    );
    const unique = all.filter((f) => !seenIds.current.has(f.id));
    unique.forEach((f) => seenIds.current.add(f.id));
    setDisplayFilms(unique);
    setLoaded(true);
  }, [data, seenIds]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  useEffect(() => {
    handleScroll();
  }, [displayFilms]);

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
  const visibleFilms = displayFilms.filter((f) => {
    const status = watchlistMap.get(Number(f.id));
    return status !== "watched" && status !== "watching";
  });

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
      `}</style>
    </div>
  );
}

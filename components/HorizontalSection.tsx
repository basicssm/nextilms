"use client";

import { useEffect, useRef, useState } from "react";
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

type Props = {
  section: SectionConfig;
  mediaType: "film" | "series";
  selectedPlatformIds: number[];
  watchlistMap: Map<number, WatchlistStatus>;
};

export default function HorizontalSection({
  section,
  mediaType,
  selectedPlatformIds,
  watchlistMap,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const films: FilmType[] = (data?.results ?? []).map(normalizeItem);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  useEffect(() => {
    handleScroll();
  }, [films]);

  function scrollLeft() {
    scrollRef.current?.scrollBy({
      left: -(CARD_WIDTH + CARD_GAP) * SCROLL_CARDS,
      behavior: "smooth",
    });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({
      left: (CARD_WIDTH + CARD_GAP) * SCROLL_CARDS,
      behavior: "smooth",
    });
  }

  const skeletons = Array.from({ length: 8 });
  const isEmpty = !isLoading && visible && films.length === 0;

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
            onClick={scrollLeft}
            aria-label="Desplazar izquierda"
          >
            ‹
          </button>
        )}

        <div
          ref={scrollRef}
          className="scroll-row"
          onScroll={handleScroll}
        >
          {!visible || isLoading
            ? skeletons.map((_, i) => (
                <div key={i} className="card-wrap">
                  <div className="skeleton-card skeleton" />
                </div>
              ))
            : isEmpty
            ? null
            : films.map((film) =>
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
            onClick={scrollRight}
            aria-label="Desplazar derecha"
          >
            ›
          </button>
        )}
      </div>

      {isEmpty && (
        <p className="empty-msg">
          Sin resultados para los filtros actuales
        </p>
      )}

      <style jsx>{`
        .section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
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

        /* ── Scroll container + arrows ── */
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
          padding: 4px 24px 12px;
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

        /* ── Arrow buttons ── */
        .arrow {
          position: absolute;
          top: 50%;
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
          left: 4px;
        }

        .arrow-right {
          right: 4px;
        }

        /* Hide arrows on touch devices */
        @media (hover: none) {
          .arrow {
            display: none;
          }
        }

        .empty-msg {
          padding: 0 24px;
          color: var(--text-subtle);
          font-size: 13px;
          font-family: var(--font-body);
        }

        @media (max-width: 480px) {
          .section-header {
            padding: 0 14px;
          }
          .scroll-row {
            padding: 4px 14px 12px;
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

"use client";

import { useRef, useState, useEffect } from "react";
import { WatchlistItem, Film as FilmType } from "@/types";
import Film from "@/components/Film";

const CARD_WIDTH = 140;
const CARD_GAP = 12;
const SCROLL_CARDS = 3;

type Props = {
  items: WatchlistItem[];
  mediaType: "film" | "series";
};

export default function WatchedSection({ items, mediaType }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const watchedItems = items
    .filter((item) => {
      if (item.status !== "watched") return false;
      if (!item.media_type) return mediaType === "film";
      return item.media_type === mediaType;
    })
    .sort((a, b) => {
      const ra = a.rating ?? -1;
      const rb = b.rating ?? -1;
      if (rb !== ra) return rb - ra;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  useEffect(() => {
    handleScroll();
  }, [watchedItems.length]);

  if (watchedItems.length === 0) return null;

  const films: FilmType[] = watchedItems.map((item) => ({
    id: String(item.film_id),
    title: item.film_title,
    poster_path: item.poster_path ?? "",
    vote_average: item.rating ?? 0,
    mediaType: (item.media_type as "film" | "series" | undefined) ?? mediaType,
  }));

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

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

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="emoji" aria-hidden>🔁</span>
          Volver a ver
        </h2>
      </div>

      <div className="scroll-container">
        {canScrollLeft && (
          <button className="arrow arrow-left" onClick={doScrollLeft} aria-label="Desplazar izquierda">
            ‹
          </button>
        )}

        <div ref={scrollRef} className="scroll-row" onScroll={handleScroll}>
          {films.map((film) => (
            <div key={film.id} className="card-wrap">
              <Film
                film={film}
                mediaType={mediaType}
                watchlistStatus="watched"
              />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button className="arrow arrow-right" onClick={doScrollRight} aria-label="Desplazar derecha">
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

        .arrow:hover { background: var(--surface-hover); }
        .arrow:active { transform: translateY(-50%) scale(0.94); }
        .arrow-left { left: 6px; }
        .arrow-right { right: 6px; }

        @media (hover: none) { .arrow { display: none; } }

        @media (max-width: 480px) {
          .section-header { padding: 0 16px; }
          .scroll-row { padding: 4px 16px 12px; }
          .card-wrap { width: 120px; }
          .section-title { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}

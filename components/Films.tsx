"use client";

import { Film as FilmType } from "@/types";
import Film from "./Film";
import { useWatchlistMap } from "@/hooks/useWatchlist";

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster skeleton" />
      <style jsx>{`
        .skeleton-card {
          width: 100%;
          animation: fadeIn 0.3s ease;
        }
        .skeleton-poster {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 16px;
        }
      `}</style>
    </div>
  );
}

export default function Films({
  films,
  loading,
  mediaType = "film",
}: {
  films: FilmType[];
  loading?: boolean;
  mediaType?: "film" | "series";
}) {
  const watchlistMap = useWatchlistMap();

  if (!films.length && loading) {
    return (
      <section className="grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
        <style jsx>{`
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
            padding: 24px;
            max-width: 1400px;
            margin: 0 auto;
          }
          @media (max-width: 480px) {
            .grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              padding: 16px 12px;
            }
          }
        `}</style>
      </section>
    );
  }

  if (!films.length) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.2" />
          <path d="M20 32 Q32 20 44 32 Q32 44 20 32Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
          <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.2" />
        </svg>
        <p className="empty-title">Nada por aquí</p>
        <p className="empty-sub">Prueba con otra categoría o cambia los filtros</p>
        <style jsx>{`
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 80px 24px;
            color: var(--text-muted);
            text-align: center;
          }
          .empty-title {
            font-family: var(--font-display);
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text-muted);
          }
          .empty-sub {
            font-size: 14px;
            color: var(--text-subtle);
            max-width: 280px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <section className="grid">
      {films.map((film: FilmType) => (
        <Film
          key={film.id}
          film={film}
          mediaType={mediaType}
          watchlistStatus={watchlistMap.get(Number(film.id)) ?? null}
        />
      ))}
      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 480px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 16px 12px;
          }
        }
      `}</style>
    </section>
  );
}

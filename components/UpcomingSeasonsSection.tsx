"use client";

import Link from "next/link";
import Image from "next/image";
import { WatchlistSeriesWithNext } from "@/types";
import { TMDB_POSTER_SM } from "@/utils/constants";

function countdownLabel(daysUntil: number | null): string {
  if (daysUntil === null) return "";
  if (daysUntil === 0) return "¡Hoy!";
  if (daysUntil === 1) return "Mañana";
  return `Faltan ${daysUntil} días`;
}

function SeriesCard({
  series,
  variant,
}: {
  series: WatchlistSeriesWithNext;
  variant: "upcoming" | "available";
}) {
  const poster = series.poster_path
    ? `${TMDB_POSTER_SM}${series.poster_path}`
    : `https://picsum.photos/seed/${series.film_id}/200/300`;

  const { season_number, episode_number } = series.next_episode_to_air;

  return (
    <Link href={`/series/${series.film_id}`} className="series-card">
      <div className="poster-wrap">
        <Image
          src={poster}
          alt={series.film_title}
          fill
          sizes="120px"
          style={{ objectFit: "cover" }}
          className="poster-img"
        />
        <div className="bottom-fade" />
        {variant === "upcoming" && series.daysUntil !== null && (
          <div className="countdown-chip">
            {countdownLabel(series.daysUntil)}
          </div>
        )}
        {variant === "available" && (
          <div className="available-chip">¡Ya disponible!</div>
        )}
      </div>
      <p className="series-title">{series.film_title}</p>
      <p className="season-info">
        {variant === "available"
          ? `T${season_number} · Ep. ${episode_number}`
          : `Temporada ${season_number}`}
      </p>

      <style jsx>{`
        .poster-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 12px;
          overflow: hidden;
          background: var(--surface);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .poster-wrap:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 36px rgba(108, 99, 255, 0.22), 0 6px 20px rgba(0, 0, 0, 0.6);
        }

        .poster-wrap:hover :global(.poster-img) {
          transform: scale(1.04);
          transition: transform 0.3s ease;
        }

        :global(.poster-img) {
          transition: transform 0.3s ease;
        }

        .bottom-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, transparent 40%);
          pointer-events: none;
          z-index: 1;
        }

        .countdown-chip {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          background: rgba(108, 99, 255, 0.88);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 3px 8px;
          border-radius: 20px;
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }

        .available-chip {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          background: rgba(212, 175, 55, 0.9);
          color: #000;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 3px 8px;
          border-radius: 20px;
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }

        .series-title {
          color: var(--text);
          font-size: 12px;
          font-weight: 600;
          line-height: 1.3;
          margin-top: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .season-info {
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 500;
          margin-top: 2px;
        }
      `}</style>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster" />
      <div className="skeleton-title" />
      <div className="skeleton-sub" />
      <style jsx>{`
        .skeleton-card {
          width: 100%;
        }
        .skeleton-poster {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 12px;
          background: var(--surface);
          animation: shimmer 1.4s ease-in-out infinite;
        }
        .skeleton-title {
          height: 12px;
          border-radius: 6px;
          background: var(--surface);
          margin-top: 8px;
          width: 80%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        .skeleton-sub {
          height: 10px;
          border-radius: 6px;
          background: var(--surface);
          margin-top: 5px;
          width: 50%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

function SubSection({
  title,
  accent,
  items,
  variant,
  loading,
}: {
  title: string;
  accent: string;
  items: WatchlistSeriesWithNext[];
  variant: "upcoming" | "available";
  loading: boolean;
}) {
  if (!loading && items.length === 0) return null;

  return (
    <div className="subsection">
      <h2 className="subsection-title">
        <span className="accent-dot" />
        {title}
      </h2>
      <div className="scroll-row">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((s) => (
              <SeriesCard key={s.film_id} series={s} variant={variant} />
            ))}
      </div>

      <style jsx>{`
        .subsection {
          margin-bottom: 32px;
        }

        .subsection-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 14px;
          letter-spacing: -0.01em;
        }

        .accent-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${accent};
          flex-shrink: 0;
        }

        .scroll-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }

        @media (max-width: 600px) {
          .scroll-row {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default function UpcomingSeasonsSection({
  upcoming,
  available,
  loading,
}: {
  upcoming: WatchlistSeriesWithNext[];
  available: WatchlistSeriesWithNext[];
  loading: boolean;
}) {
  if (!loading && upcoming.length === 0 && available.length === 0) return null;

  return (
    <div className="upcoming-seasons">
      <SubSection
        title="Nuevas temporadas disponibles"
        accent="var(--gold)"
        items={available}
        variant="available"
        loading={loading}
      />
      <SubSection
        title="Próximos estrenos"
        accent="#6c63ff"
        items={upcoming}
        variant="upcoming"
        loading={loading}
      />

      <style jsx>{`
        .upcoming-seasons {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}

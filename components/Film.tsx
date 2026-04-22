import Link from "next/link";
import Image from "next/image";
import { film as filmType, WatchlistStatus } from "@/types";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";
const FALLBACK = "https://picsum.photos/id/444/200/300";
const THEATERS_WINDOW_DAYS = 75;

function getStatusBadge(releaseDate: string | undefined, mediaType: "film" | "series") {
  if (!releaseDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = new Date(releaseDate);
  if (release > today) return "upcoming";
  if (mediaType === "film") {
    const days = (today.getTime() - release.getTime()) / 86400000;
    if (days <= THEATERS_WINDOW_DAYS) return "theaters";
  }
  return null;
}

const WATCHLIST_CONFIG: Record<WatchlistStatus, { label: string; cssVar: string }> = {
  watching: { label: "Viendo", cssVar: "var(--watching)" },
  to_watch:  { label: "Por ver", cssVar: "var(--to-watch)" },
  watched:   { label: "Vista",   cssVar: "var(--watched)" },
};

export default function Film({
  film,
  mediaType = "film",
  watchlistStatus,
}: {
  film: filmType;
  mediaType?: "film" | "series";
  watchlistStatus?: WatchlistStatus | null;
}) {
  const { id, title, poster_path, vote_average, release_date } = film;
  const src = poster_path ? `${POSTER_BASE}${poster_path}` : FALLBACK;
  const resolvedType = film.mediaType ?? mediaType;
  const href = resolvedType === "series" ? `/series/${id}` : `/film/${id}`;
  const statusBadge = getStatusBadge(release_date, resolvedType);
  const wlCfg = watchlistStatus ? WATCHLIST_CONFIG[watchlistStatus] : null;

  return (
    <div className="card">
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        <div className="poster-wrap">
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width: 480px) 44vw, (max-width: 768px) 25vw, 170px"
            style={{ objectFit: "cover", transition: "transform 0.35s ease" }}
            className="poster-img"
          />
          <div className="bottom-fade" />

          {/* Hover overlay: título + rating */}
          <div className="hover-overlay">
            <p className="title">{title}</p>
          </div>

          {/* Badges superiores izquierda */}
          {statusBadge === "upcoming" && (
            <span className="badge badge-upcoming">Próximamente</span>
          )}
          {statusBadge === "theaters" && (
            <span className="badge badge-theaters">En cines</span>
          )}
          {wlCfg && !statusBadge && (
            <span
              className="badge badge-watchlist"
              style={{ "--wl-color": wlCfg.cssVar } as React.CSSProperties}
            >
              {wlCfg.label}
            </span>
          )}

          {/* Rating esquina inferior derecha */}
          {vote_average != null && vote_average > 0 && (
            <span className="rating-badge">★ {vote_average.toFixed(1)}</span>
          )}
        </div>
      </Link>

      <style jsx>{`
        .card {
          width: 100%;
          animation: fadeInUp 0.3s ease both;
        }

        .poster-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          background: var(--surface);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .poster-wrap:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(108, 99, 255, 0.2), 0 8px 24px rgba(0, 0, 0, 0.7);
        }

        .poster-wrap:hover :global(.poster-img) {
          transform: scale(1.04);
        }

        .poster-wrap:active {
          transform: translateY(-2px) scale(0.99);
        }

        /* Fade permanente para legibilidad del rating */
        .bottom-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.55) 0%,
            transparent 35%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Overlay en hover con título */
        .hover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(10, 10, 15, 0.95) 0%,
            rgba(10, 10, 15, 0.2) 50%,
            transparent 72%
          );
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 12px;
          opacity: 0;
          transition: opacity 0.25s ease;
          z-index: 2;
          gap: 4px;
        }

        .poster-wrap:hover .hover-overlay {
          opacity: 1;
        }

        /* Touch devices: mostrar siempre */
        @media (hover: none) {
          .hover-overlay {
            opacity: 1;
          }
        }

        .title {
          color: var(--text);
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Rating badge — siempre visible */
        .rating-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(10, 10, 15, 0.75);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 7px;
          border-radius: var(--radius-sm);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 3;
          border: 1px solid rgba(108, 99, 255, 0.2);
        }

        /* Badges superiores */
        .badge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 3;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .badge-upcoming {
          background: rgba(10, 10, 15, 0.75);
          color: #a8b8d8;
          border: 1px solid rgba(168, 184, 216, 0.25);
        }

        .badge-theaters {
          background: rgba(10, 10, 15, 0.75);
          color: var(--to-watch);
          border: 1px solid rgba(255, 159, 67, 0.3);
        }

        .badge-watchlist {
          background: rgba(10, 10, 15, 0.75);
          color: var(--wl-color);
          border: 1px solid color-mix(in srgb, var(--wl-color) 35%, transparent);
        }
      `}</style>
    </div>
  );
}

"use client";

import Image from "next/image";
import YouTube from "react-youtube";
import { filmDetail, WatchProvider } from "@/types";
import WatchlistButtons from "@/components/WatchlistButtons";
import EpisodeTracker, { SeasonInfo } from "@/components/EpisodeTracker";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import { useWatchlist } from "@/hooks/useWatchlist";

const PROVIDER_LOGO_BASE = "https://image.tmdb.org/t/p/original";

const opts = {
  height: "180",
  width: "300",
  playerVars: { autoplay: 0 as const, rel: 0 as const },
};

type VideoResult = { key: string; name?: string };

type SeriesInfo = {
  seasons?: number;
  episodes?: number;
  seasonsList?: SeasonInfo[];
};

export default function Detail({
  film,
  videos,
  seriesInfo,
  mediaType = "film",
}: {
  film: filmDetail;
  videos: VideoResult[];
  seriesInfo?: SeriesInfo;
  mediaType?: "film" | "series";
}) {
  const { platformIds } = useUserPlatforms();
  const filmId = Number(film.id);
  const { item: watchlistItem, loading: watchlistLoading, setStatus } = useWatchlist(filmId);

  const {
    title,
    poster_path,
    backdrop_path,
    overview,
    vote_average,
    vote_count,
    genres,
    runtime,
    watch_providers,
  } = film;

  const poster = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : null;
  const backdrop = backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${backdrop_path}`
    : null;

  const runtimeStr =
    runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : null;

  return (
    <main>
      {/* ── Hero backdrop ───────────────────────── */}
      <div className="hero">
        {backdrop && (
          <>
            <Image
              src={backdrop}
              alt={title}
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              priority
              className="hero-img"
            />
            <div className="hero-overlay" />
          </>
        )}
        {!backdrop && <div className="hero-fallback" />}
      </div>

      {/* ── Contenido principal ──────────────────── */}
      <div className="content">
        {/* Poster flotante */}
        {poster && (
          <div className="poster-col">
            <div className="poster-wrap">
              <Image
                src={poster}
                alt={title}
                width={220}
                height={330}
                className="poster-img"
                priority
              />
            </div>
          </div>
        )}

        {/* Info */}
        <div className="info-col">
          <h1 className="title">{title}</h1>

          {/* Metadata row */}
          <div className="meta-row">
            {runtimeStr && <span className="meta-chip">{runtimeStr}</span>}
            {seriesInfo?.seasons != null && (
              <span className="meta-chip">
                {seriesInfo.seasons} {seriesInfo.seasons === 1 ? "temporada" : "temporadas"}
              </span>
            )}
            {seriesInfo?.episodes != null && (
              <span className="meta-chip">{seriesInfo.episodes} ep.</span>
            )}
            {vote_count > 0 && (
              <span className="meta-chip">{vote_count.toLocaleString()} votos</span>
            )}
          </div>

          {/* Rating destacado */}
          {vote_average > 0 && (
            <div className="rating-block">
              <span className="rating-star">★</span>
              <span className="rating-value">{vote_average.toFixed(1)}</span>
              <span className="rating-max">/10</span>
            </div>
          )}

          {/* Géneros */}
          {genres?.length ? (
            <div className="genres">
              {genres.map((g) => (
                <span key={g.id} className="genre-chip">{g.name}</span>
              ))}
            </div>
          ) : null}

          {/* Botones watchlist */}
          <WatchlistButtons
            filmId={filmId}
            filmTitle={title}
            posterPath={poster_path ?? null}
            mediaType={mediaType}
            item={watchlistItem}
            loading={watchlistLoading}
            setStatus={setStatus}
          />

          {/* Seguimiento de episodios (solo series en estado "viendo") */}
          {mediaType === "series" && seriesInfo?.seasonsList && seriesInfo.seasonsList.length > 0 && (
            <EpisodeTracker
              seriesId={filmId}
              seasons={seriesInfo.seasonsList}
              totalEpisodes={seriesInfo.episodes ?? 0}
              watchlistStatus={watchlistItem?.status ?? null}
            />
          )}

          {/* Plataformas */}
          {watch_providers && watch_providers.length > 0 && (
            <div className="platforms">
              <span className="platforms-label">Disponible en</span>
              <div className="platforms-logos">
                {watch_providers.map((p: WatchProvider) => {
                  const isMine = platformIds.size > 0 && platformIds.has(p.provider_id);
                  return (
                    <div
                      key={p.provider_id}
                      className={`platform-item${isMine ? " mine" : ""}`}
                      title={isMine ? `${p.provider_name} · En tus plataformas` : p.provider_name}
                    >
                      <Image
                        src={`${PROVIDER_LOGO_BASE}${p.logo_path}`}
                        alt={p.provider_name}
                        width={36}
                        height={36}
                        className="platform-logo"
                      />
                      {isMine && <span className="mine-dot" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sinopsis */}
          {overview && <p className="overview">{overview}</p>}
        </div>
      </div>

      {/* ── Vídeos ──────────────────────────────── */}
      {videos?.length > 0 && (
        <div className="videos-section">
          <h2 className="videos-title">Vídeos</h2>
          <div className="videos-carousel">
            {videos.map(({ key, name }) => (
              <div key={key} className="video-item">
                <YouTube videoId={key} opts={opts} />
                {name && <p className="video-name">{name}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        main {
          min-height: 100vh;
          background: var(--bg);
        }

        /* ── Hero ──────────────────────────────── */
        .hero {
          position: relative;
          height: 460px;
          overflow: hidden;
        }

        :global(.hero-img) {
          filter: saturate(0.7);
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(10, 10, 15, 0.15) 0%,
            rgba(10, 10, 15, 0.55) 55%,
            rgba(10, 10, 15, 1) 100%
          );
        }

        .hero-fallback {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%);
        }

        /* ── Layout principal ──────────────────── */
        .content {
          display: flex;
          gap: 40px;
          padding: 0 48px 56px;
          margin-top: -160px;
          position: relative;
          z-index: 1;
          align-items: flex-start;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ── Poster ────────────────────────────── */
        .poster-col {
          flex-shrink: 0;
          padding-top: 0;
        }

        .poster-wrap {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), 0 0 0 1px var(--border);
          animation: fadeInUp 0.4s ease;
        }

        :global(.poster-img) {
          display: block;
        }

        /* ── Info columna ──────────────────────── */
        .info-col {
          padding-top: 100px;
          flex: 1;
          min-width: 0;
        }

        .title {
          font-family: var(--font-display);
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .meta-chip {
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
          background: var(--surface);
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid var(--border);
        }

        /* Rating prominente */
        .rating-block {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 20px;
        }

        .rating-star {
          color: var(--accent);
          font-size: 20px;
          line-height: 1;
        }

        .rating-value {
          font-family: var(--font-mono);
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .rating-max {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--text-muted);
        }

        /* Géneros */
        .genres {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .genre-chip {
          background: rgba(108, 99, 255, 0.08);
          border: 1px solid rgba(108, 99, 255, 0.22);
          color: var(--accent);
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.01em;
        }

        /* Sinopsis */
        .overview {
          color: var(--text-muted);
          font-size: 15px;
          line-height: 1.8;
          max-width: 580px;
          margin-top: 24px;
        }

        /* Plataformas */
        .platforms {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 28px;
        }

        .platforms-label {
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .platforms-logos {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .platform-item {
          position: relative;
          border-radius: var(--radius-sm);
          overflow: visible;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          transition: transform 0.15s ease;
        }

        .platform-item:hover {
          transform: translateY(-2px);
        }

        .platform-item.mine {
          box-shadow: 0 0 0 2px var(--accent), 0 4px 12px rgba(108, 99, 255, 0.3);
          border-radius: var(--radius-sm);
        }

        .mine-dot {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          border: 1.5px solid var(--bg);
        }

        :global(.platform-logo) {
          display: block;
          border-radius: var(--radius-sm);
        }

        /* ── Vídeos ────────────────────────────── */
        .videos-section {
          padding: 0 48px 72px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .videos-title {
          font-family: var(--font-display);
          color: var(--text);
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .videos-carousel {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: var(--surface-elevated) transparent;
        }

        .videos-carousel::-webkit-scrollbar {
          height: 4px;
        }

        .videos-carousel::-webkit-scrollbar-thumb {
          background: var(--surface-elevated);
          border-radius: 2px;
        }

        .video-item {
          flex-shrink: 0;
          scroll-snap-align: start;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .video-name {
          padding: 8px 10px;
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }

        /* ── Mobile ────────────────────────────── */
        @media (max-width: 768px) {
          .hero {
            height: 280px;
          }

          .content {
            flex-direction: column;
            align-items: center;
            padding: 0 20px 40px;
            margin-top: -80px;
            gap: 24px;
          }

          .info-col {
            padding-top: 0;
            width: 100%;
          }

          .title {
            font-size: 1.7rem;
            text-align: center;
          }

          .meta-row {
            justify-content: center;
          }

          .rating-block {
            justify-content: center;
          }

          .genres {
            justify-content: center;
          }

          .overview {
            max-width: 100%;
            font-size: 14px;
          }

          .videos-section {
            padding: 0 16px 48px;
          }
        }

        @media (max-width: 480px) {
          .hero {
            height: 220px;
          }

          .content {
            margin-top: -50px;
            padding: 0 14px 32px;
          }

          :global(.poster-img) {
            width: 150px !important;
            height: 225px !important;
          }

          .title {
            font-size: 1.4rem;
          }

          .rating-value {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </main>
  );
}

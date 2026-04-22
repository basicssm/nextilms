"use client";

import Image from "next/image";
import YouTube from "react-youtube";
import { filmDetail, WatchProvider } from "@/types";
import WatchlistButtons from "@/components/WatchlistButtons";

const PROVIDER_LOGO_BASE = "https://image.tmdb.org/t/p/original";

const opts = {
  height: "195",
  width: "320",
  playerVars: { autoplay: 0 as const, rel: 0 as const },
};

type VideoResult = { key: string; name?: string };

type SeriesInfo = {
  seasons?: number;
  episodes?: number;
};

export default function Detail({
  film,
  videos,
  seriesInfo,
}: {
  film: filmDetail;
  videos: VideoResult[];
  seriesInfo?: SeriesInfo;
}) {
  const {
    id,
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
      {backdrop && (
        <div className="backdrop">
          <Image
            src={backdrop}
            alt={title}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="backdrop-overlay" />
        </div>
      )}

      <div className="content">
        {poster && (
          <div className="poster-col">
            <Image
              src={poster}
              alt={title}
              width={240}
              height={360}
              className="poster-img"
              priority
            />
          </div>
        )}

        <div className="info-col">
          <h1 className="title">{title}</h1>

          <div className="meta">
            {runtimeStr && <span className="meta-chip">{runtimeStr}</span>}
            {seriesInfo?.seasons != null && (
              <span className="meta-chip">
                {seriesInfo.seasons} {seriesInfo.seasons === 1 ? "temporada" : "temporadas"}
              </span>
            )}
            {seriesInfo?.episodes != null && (
              <span className="meta-chip">{seriesInfo.episodes} episodios</span>
            )}
            {vote_average > 0 && (
              <span className="rating">★ {vote_average.toFixed(1)}</span>
            )}
            {vote_count > 0 && (
              <span className="votes">{vote_count.toLocaleString()} votos</span>
            )}
          </div>

          {genres?.length ? (
            <div className="genres">
              {genres.map((g) => (
                <span key={g.id} className="genre-chip">
                  {g.name}
                </span>
              ))}
            </div>
          ) : null}

          <WatchlistButtons
            filmId={Number(id)}
            filmTitle={title}
            posterPath={poster_path ?? null}
          />

          {watch_providers && watch_providers.length > 0 && (
            <div className="platforms">
              <span className="platforms-label">Disponible en</span>
              <div className="platforms-logos">
                {watch_providers.map((p: WatchProvider) => (
                  <div key={p.provider_id} className="platform-item" title={p.provider_name}>
                    <Image
                      src={`${PROVIDER_LOGO_BASE}${p.logo_path}`}
                      alt={p.provider_name}
                      width={40}
                      height={40}
                      className="platform-logo"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {overview && <p className="overview">{overview}</p>}
        </div>
      </div>

      {videos?.length > 0 && (
        <div className="videos-section">
          <h2 className="videos-title">Videos</h2>
          <div className="videos-grid">
            {videos.map(({ key }) => (
              <div key={key} className="video-wrap">
                <YouTube videoId={key} opts={opts} />
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        main {
          min-height: 100vh;
          background: #080810;
        }

        .backdrop {
          position: relative;
          height: 420px;
          overflow: hidden;
        }

        .backdrop-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(8, 8, 16, 0.25) 0%,
            rgba(8, 8, 16, 0.75) 65%,
            rgba(8, 8, 16, 1) 100%
          );
        }

        .content {
          display: flex;
          gap: 36px;
          padding: 0 40px 48px;
          margin-top: -130px;
          position: relative;
          z-index: 1;
          align-items: flex-start;
        }

        .poster-col {
          flex-shrink: 0;
        }

        :global(.poster-img) {
          border-radius: 10px;
          box-shadow: 0 8px 48px rgba(0, 0, 0, 0.9);
          display: block;
        }

        .info-col {
          padding-top: 80px;
          flex: 1;
          min-width: 0;
        }

        .title {
          font-size: 2rem;
          font-weight: 800;
          color: #f0f0f8;
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .meta {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .meta-chip {
          color: #8888aa;
          font-size: 13px;
        }

        .rating {
          color: #d4af37;
          font-size: 15px;
          font-weight: 700;
        }

        .votes {
          color: #8888aa;
          font-size: 13px;
        }

        .genres {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .genre-chip {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.22);
          color: #c9a227;
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .overview {
          color: #a8a8c0;
          font-size: 15px;
          line-height: 1.75;
          max-width: 580px;
          margin-top: 20px;
          margin-bottom: 20px;
        }

        .platforms {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .platforms-label {
          color: #8888aa;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .platforms-logos {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        .platform-item {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .platform-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.7);
        }

        :global(.platform-logo) {
          display: block;
          border-radius: 8px;
        }

        .videos-section {
          padding: 0 40px 64px;
        }

        .videos-title {
          color: #e8e8f2;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.12);
        }

        .videos-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        /* ── Mobile ─────────────────────────────────────── */
        @media (max-width: 768px) {
          .backdrop {
            height: 260px;
          }

          .content {
            flex-direction: column;
            align-items: center;
            padding: 0 20px 40px;
            margin-top: -60px;
            gap: 24px;
          }

          .info-col {
            padding-top: 0;
            width: 100%;
          }

          .title {
            font-size: 1.5rem;
            text-align: center;
          }

          .meta {
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
            padding: 0 16px 40px;
          }

          /* Horizontal scroll row for videos on mobile */
          .videos-grid {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 12px;
            scrollbar-width: thin;
            scrollbar-color: rgba(212, 175, 55, 0.2) transparent;
            gap: 12px;
          }

          .video-wrap {
            flex-shrink: 0;
          }
        }

        @media (max-width: 480px) {
          .backdrop {
            height: 220px;
          }

          .content {
            margin-top: -40px;
            padding: 0 14px 32px;
          }

          :global(.poster-img) {
            width: 160px !important;
            height: 240px !important;
          }

          .title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </main>
  );
}

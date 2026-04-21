import Image from "next/image";
import YouTube from "react-youtube";
import { filmDetail } from "@/types";

const opts = {
  height: "195",
  width: "320",
  playerVars: { autoplay: 0, rel: 0 },
};

type VideoResult = { key: string; name?: string };

export default function Detail({
  film,
  videos,
}: {
  film: filmDetail;
  videos: VideoResult[];
}) {
  const {
    title,
    poster_path,
    backdrop_path,
    overview,
    vote_average,
    vote_count,
    genres,
    runtime,
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

          {overview && <p className="overview">{overview}</p>}
        </div>
      </div>

      {videos?.length > 0 && (
        <div className="videos-section">
          <h2 className="videos-title">Videos</h2>
          <div className="videos-grid">
            {videos.map(({ key }) => (
              <YouTube key={key} videoId={key} opts={opts} />
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
          }

          .title {
            font-size: 1.5rem;
          }

          .videos-section {
            padding: 0 20px 40px;
          }
        }
      `}</style>
    </main>
  );
}

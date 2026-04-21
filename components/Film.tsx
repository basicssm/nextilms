import Link from "next/link";
import Image from "next/image";
import { film as filmType } from "@/types";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";
const FALLBACK = "https://picsum.photos/id/444/200/300";

export default function Film({ film, mediaType = "film" }: { film: filmType; mediaType?: "film" | "series" }) {
  const { id, title, poster_path, vote_average } = film;
  const src = poster_path ? `${POSTER_BASE}${poster_path}` : FALLBACK;
  const href = mediaType === "series" ? `/series/${id}` : `/film/${id}`;

  return (
    <div className="card">
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        <div className="poster-wrap">
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width: 480px) 44vw, (max-width: 768px) 25vw, 170px"
            style={{ objectFit: "cover" }}
          />
          <div className="bottom-fade" />
          <div className="hover-overlay">
            <p className="title">{title}</p>
          </div>
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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .poster-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.65);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .poster-wrap:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.9);
        }

        /* Permanent subtle gradient so rating badge is always readable */
        .bottom-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.62) 0%,
            transparent 38%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Title overlay — visible on hover (desktop) or always on touch devices */
        .hover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.92) 0%,
            rgba(0, 0, 0, 0.18) 55%,
            transparent 75%
          );
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 10px;
          opacity: 0;
          transition: opacity 0.22s ease;
          z-index: 2;
        }

        .poster-wrap:hover .hover-overlay {
          opacity: 1;
        }

        /* On touch devices show title always */
        @media (hover: none) {
          .hover-overlay {
            opacity: 1;
          }
        }

        .title {
          color: #f0f0f5;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rating-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.6);
          color: #d4af37;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 4px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 3;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}

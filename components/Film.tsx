import Link from "next/link";
import Image from "next/image";
import { film as filmType } from "@/types";

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";
const FALLBACK = "https://picsum.photos/id/444/200/300";

export default function Film({ film }: { film: filmType }) {
  const { id, title, poster_path, vote_average } = film;
  const src = poster_path ? `${POSTER_BASE}${poster_path}` : FALLBACK;

  return (
    <div className="card">
      <Link href={`/film/${id}`} style={{ textDecoration: "none", display: "block" }}>
        <div className="poster-wrap">
          <Image
            src={src}
            alt={title}
            width={160}
            height={240}
            style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
          />
          <div className="overlay">
            <p className="title">{title}</p>
            {vote_average != null && vote_average > 0 && (
              <span className="rating">★ {vote_average.toFixed(1)}</span>
            )}
          </div>
        </div>
      </Link>
      <style jsx>{`
        .card {
          width: 160px;
          flex-shrink: 0;
        }

        .poster-wrap {
          position: relative;
          width: 160px;
          height: 240px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .poster-wrap:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.9);
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.95) 0%,
            rgba(0, 0, 0, 0.35) 40%,
            transparent 70%
          );
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 12px 10px;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .poster-wrap:hover .overlay {
          opacity: 1;
        }

        .title {
          color: #f0f0f5;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 4px;
        }

        .rating {
          color: #d4af37;
          font-size: 12px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

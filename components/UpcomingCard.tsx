"use client";

import Link from "next/link";
import Image from "next/image";
import { Film } from "@/types";
import { TMDB_POSTER_SM } from "@/utils/constants";

const FALLBACK = "https://picsum.photos/id/444/200/300";

export default function UpcomingCard({ film }: { film: Film }) {
  const { id, title, poster_path, release_date } = film;
  const src = poster_path ? `${TMDB_POSTER_SM}${poster_path}` : FALLBACK;
  const href = `/film/${id}`;

  let day = "";
  let month = "";
  if (release_date) {
    const d = new Date(release_date + "T12:00:00");
    day = d.toLocaleDateString("es-ES", { day: "numeric" });
    month = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
  }

  return (
    <div className="upcoming-card">
      <Link href={href} style={{ textDecoration: "none" }}>
        <div className="poster-wrap">
          <Image
            src={src}
            alt={title}
            fill
            sizes="160px"
            style={{ objectFit: "cover" }}
            className="poster-img"
          />
          <div className="bottom-fade" />
        </div>
        {release_date && (
          <div className="date-badge">
            <span className="day">{day}</span>
            <span className="month">{month}</span>
          </div>
        )}
        <p className="title">{title}</p>
      </Link>

      <style jsx>{`
        .upcoming-card {
          width: 100%;
        }

        .poster-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 14px;
          overflow: hidden;
          background: var(--surface);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .poster-wrap:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(108, 99, 255, 0.2), 0 8px 24px rgba(0, 0, 0, 0.7);
        }

        .poster-wrap:hover :global(.poster-img) {
          transform: scale(1.04);
          transition: transform 0.35s ease;
        }

        :global(.poster-img) {
          transition: transform 0.35s ease;
        }

        .bottom-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 35%);
          pointer-events: none;
          z-index: 1;
        }

        .date-badge {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 8px;
        }

        .day {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
        }

        .month {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .title {
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          line-height: 1.35;
          margin-top: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

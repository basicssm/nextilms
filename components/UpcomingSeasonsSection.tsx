"use client";

import Link from "next/link";
import Image from "next/image";
import { WatchlistSeriesWithNext, UpcomingPlatformSeries } from "@/types";
import { TMDB_POSTER_SM } from "@/utils/constants";

function countdownLabel(daysUntil: number): string {
  if (daysUntil === 0) return "¡Hoy!";
  if (daysUntil === 1) return "Mañana";
  return `Faltan ${daysUntil} días`;
}

/* ─── Shared poster styles ─── */
const posterStyles = `
  .poster-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 2 / 3;
    border-radius: 12px;
    overflow: hidden;
    background: var(--surface);
    box-shadow: 0 4px 18px rgba(0,0,0,0.5);
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .poster-wrap:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(108,99,255,0.22), 0 6px 20px rgba(0,0,0,0.6);
  }
  .poster-wrap:hover :global(.poster-img) {
    transform: scale(1.04);
    transition: transform 0.3s ease;
  }
  :global(.poster-img) { transition: transform 0.3s ease; }
  .bottom-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%);
    pointer-events: none;
    z-index: 1;
  }
  .chip {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 3px 8px;
    border-radius: 20px;
    white-space: nowrap;
    backdrop-filter: blur(4px);
  }
  .chip-purple { background: rgba(108,99,255,0.88); color: #fff; }
  .chip-gold   { background: rgba(212,175,55,0.9);  color: #000; }
  .chip-date {
    position: absolute;
    bottom: 8px;
    left: 8px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    backdrop-filter: blur(6px);
    background: rgba(0,0,0,0.55);
    border-radius: 8px;
    padding: 4px 7px;
    line-height: 1.1;
  }
  .chip-date .day {
    font-size: 16px;
    font-weight: 800;
    color: var(--gold, #d4af37);
  }
  .chip-date .month {
    font-size: 9px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .card-title {
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
  .card-sub {
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 500;
    margin-top: 2px;
  }
`;

/* ─── Card: series from watchlist ─── */
function WatchlistCard({
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
    <Link href={`/series/${series.film_id}`} className="card-root">
      <div className="poster-wrap">
        <Image src={poster} alt={series.film_title} fill sizes="120px" style={{ objectFit: "cover" }} className="poster-img" />
        <div className="bottom-fade" />
        {variant === "upcoming" && series.daysUntil !== null && (
          <div className="chip chip-purple">{countdownLabel(series.daysUntil)}</div>
        )}
        {variant === "available" && (
          <div className="chip chip-gold">¡Ya disponible!</div>
        )}
      </div>
      <p className="card-title">{series.film_title}</p>
      <p className="card-sub">
        {variant === "available"
          ? `T${season_number} · Ep. ${episode_number}`
          : `Temporada ${season_number}`}
      </p>
      <style jsx>{posterStyles}</style>
    </Link>
  );
}

/* ─── Card: series from user's platforms ─── */
function PlatformCard({ series }: { series: UpcomingPlatformSeries }) {
  const poster = series.poster_path
    ? `${TMDB_POSTER_SM}${series.poster_path}`
    : `https://picsum.photos/seed/${series.id}/200/300`;
  const d = new Date(series.air_date + "T12:00:00");
  const day = d.toLocaleDateString("es-ES", { day: "numeric" });
  const month = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");

  return (
    <Link href={`/series/${series.id}`} className="card-root">
      <div className="poster-wrap">
        <Image src={poster} alt={series.title} fill sizes="120px" style={{ objectFit: "cover" }} className="poster-img" />
        <div className="bottom-fade" />
        <div className="chip-date">
          <span className="day">{day}</span>
          <span className="month">{month}</span>
        </div>
      </div>
      <p className="card-title">{series.title}</p>
      <p className="card-sub">{countdownLabel(series.daysUntil)}</p>
      <style jsx>{posterStyles}</style>
    </Link>
  );
}

/* ─── Skeleton ─── */
function SkeletonCard() {
  return (
    <div className="sk">
      <div className="sk-poster" />
      <div className="sk-line sk-title" />
      <div className="sk-line sk-sub" />
      <style jsx>{`
        .sk-poster { width: 100%; aspect-ratio: 2/3; border-radius: 12px; background: var(--surface); animation: sh 1.4s ease-in-out infinite; }
        .sk-line { border-radius: 6px; background: var(--surface); animation: sh 1.4s ease-in-out infinite; }
        .sk-title { height: 12px; margin-top: 8px; width: 80%; }
        .sk-sub   { height: 10px; margin-top: 5px; width: 50%; }
        @keyframes sh { 0%,100%{opacity:.4} 50%{opacity:.8} }
      `}</style>
    </div>
  );
}

/* ─── Sub-section wrappers ─── */
function WatchlistSubSection({
  title, accent, items, variant, loading,
}: {
  title: string; accent: string;
  items: WatchlistSeriesWithNext[]; variant: "upcoming" | "available"; loading: boolean;
}) {
  if (!loading && items.length === 0) return null;
  return (
    <div className="sub">
      <h2 className="sub-title"><span className="dot" style={{ background: accent }} />{title}</h2>
      <div className="row">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((s) => <WatchlistCard key={s.film_id} series={s} variant={variant} />)}
      </div>
      <style jsx>{rowStyles}</style>
    </div>
  );
}

function PlatformSubSection({
  title, accent, items, loading,
}: {
  title: string; accent: string;
  items: UpcomingPlatformSeries[]; loading: boolean;
}) {
  if (!loading && items.length === 0) return null;
  return (
    <div className="sub">
      <h2 className="sub-title"><span className="dot" style={{ background: accent }} />{title}</h2>
      <div className="row">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((s) => <PlatformCard key={s.id} series={s} />)}
      </div>
      <style jsx>{rowStyles}</style>
    </div>
  );
}

const rowStyles = `
  .sub { margin-bottom: 32px; }
  .sub-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 15px; font-weight: 700; color: var(--text);
    margin-bottom: 14px; letter-spacing: -0.01em;
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  @media (max-width: 600px) {
    .row { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
  }
`;

/* ─── Main export ─── */
export default function UpcomingSeasonsSection({
  upcoming,
  available,
  loading,
  platformSeries,
  platformLoading,
}: {
  upcoming: WatchlistSeriesWithNext[];
  available: WatchlistSeriesWithNext[];
  loading: boolean;
  platformSeries: UpcomingPlatformSeries[];
  platformLoading: boolean;
}) {
  const hasContent =
    loading || upcoming.length > 0 ||
    platformLoading || platformSeries.length > 0 ||
    available.length > 0;

  if (!hasContent) return null;

  return (
    <div className="upcoming-seasons">
      {/* 1. Series I follow with upcoming premiere */}
      <WatchlistSubSection
        title="Próximos estrenos — mis series"
        accent="#6c63ff"
        items={upcoming}
        variant="upcoming"
        loading={loading}
      />

      {/* 2. Upcoming on user's platforms (discover) */}
      <PlatformSubSection
        title="Próximos estrenos en mis plataformas"
        accent="#3da5d9"
        items={platformSeries}
        loading={platformLoading}
      />

      {/* 3. New seasons already airing */}
      <WatchlistSubSection
        title="Nuevas temporadas disponibles"
        accent="var(--gold)"
        items={available}
        variant="available"
        loading={loading}
      />

      <style jsx>{`
        .upcoming-seasons { margin-bottom: 8px; }
      `}</style>
    </div>
  );
}

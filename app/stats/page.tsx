"use client";

import { useMemo } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import { useAuth } from "@/context/AuthContext";
import { useFullWatchlist } from "@/hooks/useWatchlist";
import { useWatchedEpisodesAll } from "@/hooks/useWatchedEpisodesAll";
import { WatchlistItem } from "@/types";

const AVG_MOVIE_RUNTIME = 100;
const AVG_EPISODE_RUNTIME = 42;

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
      <style jsx>{`
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .stat-value {
          font-family: var(--font-mono);
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }
        .stat-sub {
          font-size: 11px;
          color: var(--text-subtle, var(--text-muted));
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="prog-row">
      <span className="prog-label">{label}</span>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="prog-pct">{pct}%</span>
      <style jsx>{`
        .prog-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 12px;
        }
        .prog-label {
          font-size: 13px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .prog-track {
          width: 160px;
          height: 6px;
          background: var(--surface);
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .prog-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: 3px;
          transition: width 0.6s ease;
          min-width: 2px;
        }
        .prog-pct {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          width: 36px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

function MonthlyBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="month-col">
      <span className="month-count">{value}</span>
      <div className="month-track">
        <div className="month-fill" style={{ height: `${Math.max(pct, 4)}%` }} />
      </div>
      <span className="month-label">{label}</span>
      <style jsx>{`
        .month-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        .month-count {
          font-size: 10px;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }
        .month-track {
          width: 100%;
          height: 60px;
          background: var(--surface);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .month-fill {
          width: 100%;
          background: var(--accent-gradient);
          border-radius: 2px;
          transition: height 0.5s ease;
        }
        .month-label {
          font-size: 9px;
          color: var(--text-muted);
          text-align: center;
          letter-spacing: 0.04em;
        }
      `}</style>
    </div>
  );
}

function groupByMonth(items: WatchlistItem[]): { label: string; count: number }[] {
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("es-ES", { month: "short" });
    const count = items.filter((item) => item.updated_at?.startsWith(key)).length;
    months.push({ label, count });
  }
  return months;
}

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading: watchlistLoading } = useFullWatchlist();
  const { rows: episodeRows, loading: episodesLoading } = useWatchedEpisodesAll();

  const loading = authLoading || watchlistLoading || episodesLoading;

  const stats = useMemo(() => {
    const watched = items.filter((i) => i.status === "watched");
    const watching = items.filter((i) => i.status === "watching");
    const toWatch = items.filter((i) => i.status === "to_watch");
    const watchedFilms = watched.filter((i) => i.media_type !== "series");
    const watchedSeries = watched.filter((i) => i.media_type === "series");

    const estHoursFilms = Math.round((watchedFilms.length * AVG_MOVIE_RUNTIME) / 60);
    const estHoursEpisodes = Math.round(
      (episodeRows.filter((r) => r.season_number !== 0).length * AVG_EPISODE_RUNTIME) / 60
    );
    const estHoursTotal = estHoursFilms + estHoursEpisodes;

    const completionRate =
      items.length > 0 ? Math.round((watched.length / items.length) * 100) : 0;

    const ratedItems = items.filter((i) => i.rating != null);
    const avgRating =
      ratedItems.length > 0
        ? (ratedItems.reduce((acc, i) => acc + (i.rating ?? 0), 0) / ratedItems.length).toFixed(1)
        : null;

    const monthlyActivity = groupByMonth(items);
    const maxMonth = Math.max(...monthlyActivity.map((m) => m.count), 1);

    return {
      total: items.length,
      watched: watched.length,
      watching: watching.length,
      toWatch: toWatch.length,
      watchedFilms: watchedFilms.length,
      watchedSeries: watchedSeries.length,
      totalEpisodes: episodeRows.filter((r) => r.season_number !== 0).length,
      estHoursTotal,
      completionRate,
      avgRating,
      ratedCount: ratedItems.length,
      monthlyActivity,
      maxMonth,
    };
  }, [items, episodeRows]);

  if (!authLoading && !user) {
    return (
      <>
        <NavBar><Back /></NavBar>
        <div className="auth-wall">
          <p>Inicia sesión para ver tus estadísticas.</p>
          <style jsx>{`
            .auth-wall {
              display: flex;
              justify-content: center;
              padding: 80px 24px;
              color: var(--text-muted);
              font-size: 15px;
            }
          `}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar><Back /></NavBar>
      <main>
        <div className="page-wrap">
          <div className="page-header">
            <h1 className="page-title">Mis estadísticas</h1>
            <p className="page-sub">Un resumen de tu actividad como espectador</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="dots">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>Todavía no tienes títulos en tu lista.</p>
              <Link href="/" className="cta-link">Empieza a explorar</Link>
            </div>
          ) : (
            <>
              {/* ── Stat cards ── */}
              <section className="section">
                <h2 className="section-title">Resumen</h2>
                <div className="stat-grid">
                  <StatCard label="Títulos en total" value={stats.total} />
                  <StatCard
                    label="Vistos"
                    value={stats.watched}
                    sub={`${stats.watchedFilms} películas · ${stats.watchedSeries} series`}
                  />
                  <StatCard label="Viendo" value={stats.watching} />
                  <StatCard label="Por ver" value={stats.toWatch} />
                  <StatCard label="Episodios vistos" value={stats.totalEpisodes} />
                  <StatCard
                    label="Horas estimadas"
                    value={`${stats.estHoursTotal}h`}
                    sub="Basado en duraciones medias"
                  />
                  {stats.avgRating && (
                    <StatCard
                      label="Valoración media"
                      value={`${stats.avgRating}/10`}
                      sub={`${stats.ratedCount} ${stats.ratedCount === 1 ? "título valorado" : "títulos valorados"}`}
                    />
                  )}
                </div>
              </section>

              {/* ── Completion rate ── */}
              <section className="section">
                <h2 className="section-title">Progreso de tu lista</h2>
                <div className="progress-block">
                  <ProgressBar
                    value={stats.watched}
                    max={stats.total}
                    label="Completado"
                  />
                  <ProgressBar
                    value={stats.watching}
                    max={stats.total}
                    label="En progreso"
                  />
                  <ProgressBar
                    value={stats.toWatch}
                    max={stats.total}
                    label="Pendiente"
                  />
                </div>
              </section>

              {/* ── Monthly activity ── */}
              <section className="section">
                <h2 className="section-title">Actividad mensual</h2>
                <p className="section-sub">Títulos añadidos o actualizados (últimos 12 meses)</p>
                <div className="monthly-chart">
                  {stats.monthlyActivity.map(({ label, count }) => (
                    <MonthlyBar
                      key={label}
                      label={label}
                      value={count}
                      max={stats.maxMonth}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        main {
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .page-wrap {
          max-width: 860px;
          margin: 0 auto;
          padding: 40px 24px 0;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .page-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.03em;
        }

        .page-sub {
          font-size: 14px;
          color: var(--text-muted);
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .section-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: -12px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
        }

        .progress-block {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
        }

        .monthly-chart {
          display: flex;
          gap: 6px;
          align-items: flex-end;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          height: 140px;
        }

        /* ── Loading ── */
        .loading-state {
          display: flex;
          justify-content: center;
          padding: 64px 0;
        }

        .dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          opacity: 0.4;
          animation: dotPulse 1.2s ease-in-out infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 0.8; transform: scale(1.1); }
        }

        /* ── Empty ── */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 64px 0;
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
        }

        :global(.cta-link) {
          display: inline-block;
          padding: 10px 22px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        :global(.cta-link:hover) {
          opacity: 0.9;
        }

        @media (max-width: 480px) {
          .page-wrap {
            padding: 28px 14px 0;
            gap: 36px;
          }

          .stat-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .progress-block {
            padding: 16px;
          }

          .monthly-chart {
            gap: 4px;
            padding: 14px;
            height: 120px;
          }
        }
      `}</style>
    </>
  );
}

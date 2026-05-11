"use client";

import { useMemo } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import { useAuth } from "@/context/AuthContext";
import { useFullWatchlist } from "@/hooks/useWatchlist";
import { useWatchedEpisodesAll } from "@/hooks/useWatchedEpisodesAll";
import { useTmdbDetails } from "@/hooks/useTmdbDetails";
import { WatchlistItem } from "@/types";

const AVG_MOVIE_RUNTIME = 100;
const AVG_EPISODE_RUNTIME = 42;

const DAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

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

function RecordCard({
  icon,
  label,
  title,
  sub,
}: {
  icon: string;
  label: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="record-card">
      <span className="record-icon">{icon}</span>
      <span className="record-label">{label}</span>
      <span className="record-title">{title}</span>
      {sub && <span className="record-sub">{sub}</span>}
      <style jsx>{`
        .record-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .record-icon {
          font-size: 1.2rem;
          line-height: 1;
          margin-bottom: 4px;
        }
        .record-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .record-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }
        .record-sub {
          font-size: 12px;
          color: var(--gold, #d4af37);
          font-family: var(--font-mono);
          margin-top: 1px;
        }
      `}</style>
    </div>
  );
}

function GenreBar({ genre, count, max }: { genre: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="genre-row">
      <span className="genre-name">{genre}</span>
      <div className="genre-track">
        <div className="genre-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="genre-count">{count}</span>
      <style jsx>{`
        .genre-row {
          display: grid;
          grid-template-columns: 120px 1fr 28px;
          align-items: center;
          gap: 12px;
        }
        .genre-name {
          font-size: 13px;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .genre-track {
          height: 6px;
          background: var(--bg);
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .genre-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: 3px;
          transition: width 0.6s ease;
          min-width: 4px;
        }
        .genre-count {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-align: right;
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

  const watchedItems = useMemo(
    () => items.filter((i) => i.status === "watched"),
    [items]
  );

  const { details: tmdbDetails, loading: tmdbLoading } = useTmdbDetails(watchedItems);

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

    // Best / worst rated by user
    const bestRated =
      ratedItems.length > 0
        ? ratedItems.reduce((best, i) => (i.rating! > best.rating! ? i : best))
        : null;
    const worstRated =
      ratedItems.length > 1
        ? ratedItems.reduce((worst, i) => (i.rating! < worst.rating! ? i : worst))
        : null;

    // Series with most episodes watched
    const seriesEpMap: Record<number, number> = {};
    for (const row of episodeRows) {
      if (row.season_number !== 0) {
        seriesEpMap[row.series_id] = (seriesEpMap[row.series_id] ?? 0) + 1;
      }
    }
    const topSeriesEntry = Object.entries(seriesEpMap).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const topSeriesId = topSeriesEntry ? Number(topSeriesEntry[0]) : null;
    const topSeriesItem = topSeriesId ? items.find((i) => i.film_id === topSeriesId) : null;
    const topSeriesEpCount = topSeriesEntry ? Number(topSeriesEntry[1]) : 0;

    // Most active day of week
    const dayCount: Record<number, number> = {};
    for (const item of items) {
      const day = new Date(item.created_at).getDay();
      dayCount[day] = (dayCount[day] ?? 0) + 1;
    }
    const mostActiveDayEntry = Object.entries(dayCount).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const mostActiveDay = mostActiveDayEntry ? DAYS_ES[Number(mostActiveDayEntry[0])] : null;

    // First item added
    const firstAdded =
      items.length > 0
        ? [...items].sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
        : null;

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
      bestRated,
      worstRated,
      topSeriesItem,
      topSeriesEpCount,
      mostActiveDay,
      firstAdded,
    };
  }, [items, episodeRows]);

  const enrichedStats = useMemo(() => {
    if (tmdbDetails.size === 0) return null;

    // Top genres from watched items
    const genreCount = new Map<string, number>();
    for (const item of watchedItems) {
      const enrich = tmdbDetails.get(item.film_id);
      if (!enrich) continue;
      for (const genre of enrich.genres) {
        genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
      }
    }
    const topGenres = [...genreCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre, count]) => ({ genre, count }));
    const maxGenreCount = topGenres[0]?.count ?? 1;

    // Oldest and newest watched film (not series)
    const watchedFilmsWithDate = watchedItems
      .filter((i) => i.media_type !== "series")
      .map((i) => ({ item: i, date: tmdbDetails.get(i.film_id)?.release_date ?? null }))
      .filter((x): x is { item: WatchlistItem; date: string } => x.date !== null && x.date !== "");

    const sortedByDate = [...watchedFilmsWithDate].sort((a, b) => a.date.localeCompare(b.date));
    const oldestFilm = sortedByDate[0] ?? null;
    const newestFilm = sortedByDate[sortedByDate.length - 1] ?? null;

    // Longest series (most total episodes per TMDB)
    const watchedSeriesWithEp = watchedItems
      .filter((i) => i.media_type === "series")
      .map((i) => ({ item: i, episodes: tmdbDetails.get(i.film_id)?.number_of_episodes ?? null }))
      .filter((x): x is { item: WatchlistItem; episodes: number } => x.episodes !== null);

    const longestSeries =
      watchedSeriesWithEp.length > 0
        ? watchedSeriesWithEp.reduce((best, x) => (x.episodes > best.episodes ? x : best))
        : null;

    // Average TMDB score
    const votedItems = watchedItems.filter(
      (i) => tmdbDetails.get(i.film_id)?.vote_average != null
    );
    const avgTmdbScore =
      votedItems.length > 0
        ? (
            votedItems.reduce(
              (sum, i) => sum + (tmdbDetails.get(i.film_id)?.vote_average ?? 0),
              0
            ) / votedItems.length
          ).toFixed(1)
        : null;

    return { topGenres, maxGenreCount, oldestFilm, newestFilm, longestSeries, avgTmdbScore };
  }, [tmdbDetails, watchedItems]);

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
                  {enrichedStats?.avgTmdbScore && (
                    <StatCard
                      label="Puntuación TMDB media"
                      value={`${enrichedStats.avgTmdbScore}/10`}
                      sub="De los títulos vistos"
                    />
                  )}
                  {stats.mostActiveDay && (
                    <StatCard
                      label="Día más activo"
                      value={stats.mostActiveDay}
                      sub="El día que más añades"
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

              {/* ── Records / curiosidades ── */}
              {(stats.bestRated ||
                stats.topSeriesItem ||
                enrichedStats?.oldestFilm ||
                enrichedStats?.newestFilm ||
                enrichedStats?.longestSeries) && (
                <section className="section">
                  <h2 className="section-title">Lo más destacado</h2>
                  {tmdbLoading && !enrichedStats && (
                    <p className="section-sub">Cargando datos de TMDB…</p>
                  )}
                  <div className="record-grid">
                    {stats.bestRated && (
                      <RecordCard
                        icon="🏆"
                        label="Tu mejor valorada"
                        title={stats.bestRated.film_title}
                        sub={`${stats.bestRated.rating}/10`}
                      />
                    )}
                    {stats.worstRated && (
                      <RecordCard
                        icon="😬"
                        label="Tu peor valorada"
                        title={stats.worstRated.film_title}
                        sub={`${stats.worstRated.rating}/10`}
                      />
                    )}
                    {stats.topSeriesItem && stats.topSeriesEpCount > 0 && (
                      <RecordCard
                        icon="📺"
                        label="Serie más vista"
                        title={stats.topSeriesItem.film_title}
                        sub={`${stats.topSeriesEpCount} episodios vistos`}
                      />
                    )}
                    {enrichedStats?.longestSeries && (
                      <RecordCard
                        icon="🎬"
                        label="Serie más larga"
                        title={enrichedStats.longestSeries.item.film_title}
                        sub={`${enrichedStats.longestSeries.episodes} episodios en total`}
                      />
                    )}
                    {enrichedStats?.oldestFilm && (
                      <RecordCard
                        icon="📅"
                        label="Película más antigua"
                        title={enrichedStats.oldestFilm.item.film_title}
                        sub={enrichedStats.oldestFilm.date.slice(0, 4)}
                      />
                    )}
                    {enrichedStats?.newestFilm &&
                      enrichedStats.newestFilm.item.film_id !==
                        enrichedStats.oldestFilm?.item.film_id && (
                        <RecordCard
                          icon="🆕"
                          label="Película más reciente"
                          title={enrichedStats.newestFilm.item.film_title}
                          sub={enrichedStats.newestFilm.date.slice(0, 4)}
                        />
                      )}
                    {stats.firstAdded && (
                      <RecordCard
                        icon="🗓️"
                        label="Primer título añadido"
                        title={stats.firstAdded.film_title}
                        sub={new Date(stats.firstAdded.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                        })}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* ── Top genres ── */}
              {(tmdbLoading || (enrichedStats?.topGenres && enrichedStats.topGenres.length > 0)) && (
                <section className="section">
                  <h2 className="section-title">Tus géneros favoritos</h2>
                  <p className="section-sub">Basado en los títulos que has marcado como vistos</p>
                  {tmdbLoading && !enrichedStats ? (
                    <div className="genre-loading">
                      <div className="dots">
                        <span className="dot" /><span className="dot" /><span className="dot" />
                      </div>
                    </div>
                  ) : (
                    <div className="genre-block">
                      {enrichedStats?.topGenres.map(({ genre, count }) => (
                        <GenreBar
                          key={genre}
                          genre={genre}
                          count={count}
                          max={enrichedStats.maxGenreCount}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
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

        .record-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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

        .genre-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
        }

        .genre-loading {
          display: flex;
          justify-content: center;
          padding: 24px 0;
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

          .record-grid {
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

          .genre-block {
            padding: 16px;
          }

          .genre-row {
            grid-template-columns: 90px 1fr 24px;
          }
        }
      `}</style>
    </>
  );
}

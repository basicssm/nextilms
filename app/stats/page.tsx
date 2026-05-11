"use client";

import { useMemo } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import GamificationPanel from "@/components/GamificationPanel";
import { useAuth } from "@/context/AuthContext";
import { useFullWatchlist } from "@/hooks/useWatchlist";
import { useWatchedEpisodesAll } from "@/hooks/useWatchedEpisodesAll";
import { useTmdbDetails } from "@/hooks/useTmdbDetails";
import { useGamification } from "@/hooks/useGamification";
import { WatchlistItem } from "@/types";

const AVG_MOVIE_RUNTIME = 100;
const AVG_EPISODE_RUNTIME = 42;

const DAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function peakHourLabel(hour: number): string {
  if (hour >= 5 && hour < 12) return "madrugador";
  if (hour >= 12 && hour < 18) return "de tarde";
  if (hour >= 18 && hour < 23) return "nocturno";
  return "trasnochador";
}

function longestStreak(items: WatchlistItem[]): number {
  const dateSet = new Set<string>();
  for (const item of items) {
    dateSet.add(item.created_at.slice(0, 10));
    dateSet.add(item.updated_at.slice(0, 10));
  }
  const sorted = [...dateSet].sort();
  if (sorted.length === 0) return 0;
  let max = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      cur++;
      if (cur > max) max = cur;
    } else if (diff > 1) {
      cur = 1;
    }
  }
  return max;
}

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

function HBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="hbar-row">
      <span className="hbar-name">{label}</span>
      <div className="hbar-track">
        <div className="hbar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="hbar-count">{count}</span>
      <style jsx>{`
        .hbar-row {
          display: grid;
          grid-template-columns: 120px 1fr 28px;
          align-items: center;
          gap: 12px;
        }
        .hbar-name {
          font-size: 13px;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hbar-track {
          height: 6px;
          background: var(--bg);
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .hbar-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: 3px;
          transition: width 0.6s ease;
          min-width: 4px;
        }
        .hbar-count {
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
  const { unlocks } = useGamification(items, episodeRows);

  const stats = useMemo(() => {
    const watched = items.filter((i) => i.status === "watched");
    const watching = items.filter((i) => i.status === "watching");
    const toWatch = items.filter((i) => i.status === "to_watch");
    const watchedFilms = watched.filter((i) => i.media_type !== "series");
    const watchedSeries = watched.filter((i) => i.media_type === "series");
    const watchingSeries = watching.filter((i) => i.media_type === "series");

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

    // ── Datos curiosos ──

    // Peak hour of day
    const hourCount: Record<number, number> = {};
    for (const item of items) {
      const h = new Date(item.created_at).getHours();
      hourCount[h] = (hourCount[h] ?? 0) + 1;
    }
    const peakHourEntry = Object.entries(hourCount).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const peakHour = peakHourEntry ? Number(peakHourEntry[0]) : null;

    // Pila de la vergüenza (oldest to_watch item)
    const shameItem =
      toWatch.length > 0
        ? [...toWatch].sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
        : null;
    const shameMonths = shameItem
      ? Math.floor((Date.now() - new Date(shameItem.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0;

    // Average days from add to watched
    const daysToWatchArr = watched
      .map((i) =>
        Math.round(
          (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime()) / 86400000
        )
      )
      .filter((d) => d >= 0 && d < 3650);
    const avgDaysToWatch =
      daysToWatchArr.length > 0
        ? Math.round(daysToWatchArr.reduce((a, b) => a + b, 0) / daysToWatchArr.length)
        : null;

    // Longest streak
    const streak = items.length > 0 ? longestStreak(items) : 0;

    // Series loyalty: % of series started that were finished
    const totalSeriesStarted = watchedSeries.length + watchingSeries.length;
    const seriesLoyalty =
      totalSeriesStarted > 0
        ? Math.round((watchedSeries.length / totalSeriesStarted) * 100)
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
      peakHour,
      shameItem,
      shameMonths,
      avgDaysToWatch,
      streak,
      seriesLoyalty,
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

    // Most obscure watched item (lowest TMDB popularity)
    const withPopularity = watchedItems
      .map((i) => ({ item: i, pop: tmdbDetails.get(i.film_id)?.popularity ?? null }))
      .filter((x): x is { item: WatchlistItem; pop: number } => x.pop !== null && x.pop > 0);
    const mostObscure =
      withPopularity.length > 0
        ? withPopularity.reduce((min, x) => (x.pop < min.pop ? x : min))
        : null;

    // Favorite release year
    const yearCount = new Map<string, number>();
    for (const item of watchedItems) {
      const year = tmdbDetails.get(item.film_id)?.release_date?.slice(0, 4);
      if (year && year.length === 4) yearCount.set(year, (yearCount.get(year) ?? 0) + 1);
    }
    const favoriteYear =
      yearCount.size > 0
        ? [...yearCount.entries()].sort((a, b) => b[1] - a[1])[0][0]
        : null;

    // Decades distribution
    const decadeCount = new Map<string, number>();
    for (const item of watchedItems) {
      const yearStr = tmdbDetails.get(item.film_id)?.release_date?.slice(0, 4);
      const year = yearStr ? parseInt(yearStr, 10) : NaN;
      if (!isNaN(year) && year > 1900) {
        const decade = `${Math.floor(year / 10) * 10}s`;
        decadeCount.set(decade, (decadeCount.get(decade) ?? 0) + 1);
      }
    }
    const decades = [...decadeCount.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count }));
    const maxDecadeCount = Math.max(...decades.map((d) => d.count), 1);

    // Critic diff: user avg rating vs TMDB avg
    const userAvg = stats.avgRating ? parseFloat(stats.avgRating) : null;
    const tmdbAvg = avgTmdbScore ? parseFloat(avgTmdbScore) : null;
    const criticDiff =
      userAvg !== null && tmdbAvg !== null
        ? (userAvg - tmdbAvg).toFixed(1)
        : null;

    return {
      topGenres,
      maxGenreCount,
      oldestFilm,
      newestFilm,
      longestSeries,
      avgTmdbScore,
      mostObscure,
      favoriteYear,
      decades,
      maxDecadeCount,
      criticDiff,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbDetails, watchedItems, stats.avgRating]);

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
              {/* ── Gamificación ── */}
              <GamificationPanel items={items} episodeRows={episodeRows} />

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
                  <ProgressBar value={stats.watched} max={stats.total} label="Completado" />
                  <ProgressBar value={stats.watching} max={stats.total} label="En progreso" />
                  <ProgressBar value={stats.toWatch} max={stats.total} label="Pendiente" />
                </div>
              </section>

              {/* ── Monthly activity ── */}
              <section className="section">
                <h2 className="section-title">Actividad mensual</h2>
                <p className="section-sub">Títulos añadidos o actualizados (últimos 12 meses)</p>
                <div className="monthly-chart">
                  {stats.monthlyActivity.map(({ label, count }) => (
                    <MonthlyBar key={label} label={label} value={count} max={stats.maxMonth} />
                  ))}
                </div>
              </section>

              {/* ── Records / Lo más destacado ── */}
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

              {/* ── Datos curiosos ── */}
              <section className="section">
                <h2 className="section-title">Datos curiosos</h2>
                {tmdbLoading && !enrichedStats && (
                  <p className="section-sub">Cargando más datos…</p>
                )}
                <div className="record-grid">
                  {/* Noctámbulo */}
                  {stats.peakHour !== null && (
                    <RecordCard
                      icon="🦉"
                      label="¿Noctámbulo o madrugador?"
                      title={peakHourLabel(stats.peakHour)}
                      sub={`Sueles añadir a las ${stats.peakHour}:00`}
                    />
                  )}

                  {/* Pila de la vergüenza */}
                  {stats.shameItem && (
                    <RecordCard
                      icon="😅"
                      label="Tu pila de la vergüenza"
                      title={stats.shameItem.film_title}
                      sub={
                        stats.shameMonths > 0
                          ? `Lleva ${stats.shameMonths} ${stats.shameMonths === 1 ? "mes" : "meses"} esperando`
                          : "Recién añadido — sin excusas"
                      }
                    />
                  )}

                  {/* Velocidad media */}
                  {stats.avgDaysToWatch !== null && stats.watched > 1 && (
                    <RecordCard
                      icon="⚡"
                      label="Velocidad de visionado"
                      title={
                        stats.avgDaysToWatch === 0
                          ? "El mismo día"
                          : `${stats.avgDaysToWatch} días de media`
                      }
                      sub="Entre añadir y marcar como visto"
                    />
                  )}

                  {/* Racha */}
                  {stats.streak > 1 && (
                    <RecordCard
                      icon="🔥"
                      label="Racha más larga"
                      title={`${stats.streak} días seguidos`}
                      sub="Días consecutivos con actividad"
                    />
                  )}

                  {/* Fidelidad a las series */}
                  {stats.seriesLoyalty !== null && (
                    <RecordCard
                      icon="📊"
                      label="Fidelidad a las series"
                      title={`${stats.seriesLoyalty}%`}
                      sub="De las series que empiezas, las terminas"
                    />
                  )}

                  {/* Hallazgo más oculto */}
                  {enrichedStats?.mostObscure && (
                    <RecordCard
                      icon="🔍"
                      label="Tu hallazgo más oculto"
                      title={enrichedStats.mostObscure.item.film_title}
                      sub={`Popularidad TMDB: ${enrichedStats.mostObscure.pop.toFixed(0)}`}
                    />
                  )}

                  {/* Año favorito del cine */}
                  {enrichedStats?.favoriteYear && (
                    <RecordCard
                      icon="📆"
                      label="Tu año favorito del cine"
                      title={enrichedStats.favoriteYear}
                      sub="El año con más títulos en tu lista vista"
                    />
                  )}

                  {/* ¿Más exigente que el público? */}
                  {enrichedStats?.criticDiff && (
                    <RecordCard
                      icon="🔬"
                      label={
                        parseFloat(enrichedStats.criticDiff) >= 0
                          ? "Más generoso que el público"
                          : "Más exigente que el público"
                      }
                      title={
                        parseFloat(enrichedStats.criticDiff) >= 0
                          ? `+${enrichedStats.criticDiff} puntos`
                          : `${enrichedStats.criticDiff} puntos`
                      }
                      sub="Tu nota media vs la nota TMDB"
                    />
                  )}
                </div>
              </section>

              {/* ── Top genres (Nivel 2+) ── */}
              {unlocks.genreStats && (tmdbLoading || (enrichedStats?.topGenres && enrichedStats.topGenres.length > 0)) && (
                <section className="section">
                  <h2 className="section-title">Tus géneros favoritos</h2>
                  <p className="section-sub">Basado en los títulos que has marcado como vistos</p>
                  {tmdbLoading && !enrichedStats ? (
                    <div className="hbar-loading">
                      <div className="dots">
                        <span className="dot" /><span className="dot" /><span className="dot" />
                      </div>
                    </div>
                  ) : (
                    <div className="hbar-block">
                      {enrichedStats?.topGenres.map(({ genre, count }) => (
                        <HBar
                          key={genre}
                          label={genre}
                          count={count}
                          max={enrichedStats.maxGenreCount}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ── Decades (Nivel 2+) ── */}
              {unlocks.genreStats && enrichedStats?.decades && enrichedStats.decades.length > 1 && (
                <section className="section">
                  <h2 className="section-title">Tus décadas de cine</h2>
                  <p className="section-sub">Distribución por década de estreno de lo que has visto</p>
                  <div className="hbar-block">
                    {enrichedStats.decades.map(({ label, count }) => (
                      <HBar
                        key={label}
                        label={label}
                        count={count}
                        max={enrichedStats.maxDecadeCount}
                      />
                    ))}
                  </div>
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

        .hbar-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
        }

        .hbar-loading {
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

          .hbar-block {
            padding: 16px;
          }

          .hbar-row {
            grid-template-columns: 80px 1fr 24px;
          }
        }
      `}</style>
    </>
  );
}

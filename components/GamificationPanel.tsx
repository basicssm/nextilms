"use client";

import { useGamification, LEVELS } from "@/hooks/useGamification";
import AccentColorPicker from "@/components/AccentColorPicker";
import { WatchlistItem, Achievement } from "@/types";
import { EpisodeRow } from "@/hooks/useWatchedEpisodesAll";

const LEVEL_COLORS: Record<number, string> = {
  1: "var(--level-1-color)",
  2: "var(--level-2-color)",
  3: "var(--level-3-color)",
  4: "var(--level-4-color)",
  5: "var(--level-5-color)",
};

const UNLOCK_LABELS: Record<string, string> = {
  genre_stats:    "Estadísticas de géneros y décadas",
  accent_picker:  "Selector de color de acento",
  marathon_mode:  "Modo Maratón en páginas de series",
  gold_ring:      "Anillo de avatar dorado animado",
};

function AchievementCard({ a }: { a: Achievement }) {
  return (
    <div className={`ach-card${a.earned ? " ach-card--earned" : ""}`} title={a.description}>
      <span className="ach-icon">{a.icon}</span>
      <span className="ach-name">{a.name}</span>
      <style jsx>{`
        .ach-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          text-align: center;
          filter: grayscale(1);
          opacity: 0.35;
          transition: transform 0.2s, opacity 0.2s;
          cursor: default;
        }
        .ach-card--earned {
          filter: none;
          opacity: 1;
          border-color: var(--border-hover);
          box-shadow: 0 0 0 1px var(--gold-glow, rgba(212,175,55,0.3));
          animation: achievementPop 0.4s ease;
        }
        .ach-card--earned:hover {
          transform: scale(1.04);
        }
        .ach-icon {
          font-size: 1.5rem;
          line-height: 1;
        }
        .ach-name {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          line-height: 1.3;
        }
        .ach-card--earned .ach-name {
          color: var(--text);
        }
      `}</style>
    </div>
  );
}

export default function GamificationPanel({
  items,
  episodeRows,
}: {
  items: WatchlistItem[];
  episodeRows: EpisodeRow[];
}) {
  const { points, currentLevel, nextLevel, progressPct, unlocks, achievements, breakdown } =
    useGamification(items, episodeRows);

  const levelColor = LEVEL_COLORS[currentLevel.level] ?? "var(--level-1-color)";

  return (
    <section className="section">
      <h2 className="section-title">Tu progreso</h2>

      {/* Level card */}
      <div className="level-card">
        <div className="level-header">
          <span className="level-chip" style={{ "--lvl-color": levelColor } as React.CSSProperties}>
            Nivel {currentLevel.level}
          </span>
          <span className="level-name">{currentLevel.name}</span>
          <span className="pts-total">{points} pts</span>
        </div>

        <div className="prog-track">
          <div
            className="prog-fill"
            style={{
              width: `${progressPct}%`,
              "--fill-color": levelColor,
            } as React.CSSProperties}
          />
        </div>

        {nextLevel ? (
          <p className="prog-hint">
            {nextLevel.minPoints - points} pts para{" "}
            <strong>{nextLevel.name}</strong>
            {nextLevel.unlock ? ` · desbloquea: ${UNLOCK_LABELS[nextLevel.unlock]}` : ""}
          </p>
        ) : (
          <p className="prog-hint">¡Has alcanzado el nivel máximo!</p>
        )}

        <div className="breakdown">
          {breakdown.watchedFilms > 0 && (
            <span className="chip">🎬 {breakdown.watchedFilms} películas</span>
          )}
          {breakdown.watchedSeries > 0 && (
            <span className="chip">📺 {breakdown.watchedSeries} series</span>
          )}
          {breakdown.episodesWatched > 0 && (
            <span className="chip">▶ {breakdown.episodesWatched} episodios</span>
          )}
          {breakdown.ratedItems > 0 && (
            <span className="chip">⭐ {breakdown.ratedItems} valorados</span>
          )}
          {breakdown.notedItems > 0 && (
            <span className="chip">✍ {breakdown.notedItems} con notas</span>
          )}
        </div>
      </div>

      {/* Unlocks list */}
      <div className="unlocks-card">
        <p className="unlocks-title">Mejoras de la app</p>
        <ul className="unlocks-list">
          {LEVELS.filter((l) => l.unlock).map((l) => {
            const isUnlocked = points >= l.minPoints;
            return (
              <li key={l.unlock} className={`unlock-row${isUnlocked ? " unlocked" : ""}`}>
                <span className="unlock-icon">{isUnlocked ? "✓" : "○"}</span>
                <span className="unlock-text">
                  <strong>Nivel {l.level} — {l.name}:</strong>{" "}
                  {UNLOCK_LABELS[l.unlock!]}
                </span>
                {!isUnlocked && (
                  <span className="unlock-pts">{l.minPoints} pts</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Color picker unlock */}
      {unlocks.accentPicker && (
        <div className="accent-section">
          <AccentColorPicker />
        </div>
      )}

      {/* Achievements */}
      <div className="section" style={{ gap: "16px" }}>
        <h3 className="subsection-title">
          Logros{" "}
          <span className="ach-count">
            {achievements.filter((a) => a.earned).length}/{achievements.length}
          </span>
        </h3>
        <div className="ach-grid">
          {achievements.map((a) => (
            <AchievementCard key={a.id} a={a} />
          ))}
        </div>
      </div>

      <style jsx>{`
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
        .subsection-title {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ach-count {
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--text-muted);
          font-weight: 400;
        }

        /* Level card */
        .level-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .level-header {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .level-chip {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--lvl-color);
          background: color-mix(in srgb, var(--lvl-color) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--lvl-color) 35%, transparent);
        }
        .level-name {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          flex: 1;
        }
        .pts-total {
          font-family: var(--font-mono);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.03em;
        }

        /* Progress bar */
        .prog-track {
          height: 8px;
          background: var(--bg);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .prog-fill {
          height: 100%;
          background: var(--fill-color);
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 4px;
        }
        .prog-hint {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .prog-hint strong {
          color: var(--text);
        }

        /* Breakdown chips */
        .breakdown {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .chip {
          font-size: 11px;
          color: var(--text-muted);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2px 8px;
        }

        /* Unlocks */
        .unlocks-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .unlocks-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .unlocks-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .unlock-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 13px;
          color: var(--text-subtle, var(--text-muted));
        }
        .unlock-row.unlocked {
          color: var(--text);
        }
        .unlock-icon {
          font-size: 12px;
          color: var(--text-subtle, var(--text-muted));
          width: 14px;
          flex-shrink: 0;
        }
        .unlock-row.unlocked .unlock-icon {
          color: var(--watched);
        }
        .unlock-text {
          flex: 1;
          line-height: 1.4;
        }
        .unlock-text strong {
          color: var(--text-muted);
          font-weight: 600;
        }
        .unlock-row.unlocked .unlock-text strong {
          color: var(--text);
        }
        .unlock-pts {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-subtle, var(--text-muted));
          white-space: nowrap;
        }

        /* Accent section */
        .accent-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
        }

        /* Achievements grid */
        .ach-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 10px;
        }

        @media (max-width: 480px) {
          .level-card {
            padding: 16px;
          }
          .pts-total {
            font-size: 1.1rem;
          }
          .ach-grid {
            grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
          }
        }
      `}</style>
    </section>
  );
}

"use client";

import { useState } from "react";
import useSWR from "swr";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useAuth } from "@/context/AuthContext";
import { useWatchedEpisodes } from "@/hooks/useWatchedEpisodes";
import { WatchlistStatus } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export type SeasonInfo = {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
};

type Episode = {
  id: number;
  name: string;
  episode_number: number;
  runtime: number | null;
};

function SeasonPanel({
  seriesId,
  season,
  isWatched,
  watchedInSeason,
  toggle,
  markSeason,
}: {
  seriesId: number;
  season: SeasonInfo;
  isWatched: (s: number, e: number) => boolean;
  watchedInSeason: (s: number) => number;
  toggle: (s: number, e: number) => Promise<void>;
  markSeason: (s: number, eps: number[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  const { data } = useSWR<{ episodes: Episode[] }>(
    open
      ? `${API_BASE_URL}/tv/${seriesId}/season/${season.season_number}?api_key=${API_KEY}&language=es-ES`
      : null,
    fetcher
  );

  const episodes: Episode[] = data?.episodes ?? [];
  const watchedCount = watchedInSeason(season.season_number);
  const allWatched = episodes.length > 0 && episodes.every((ep) =>
    isWatched(season.season_number, ep.episode_number)
  );

  return (
    <div className="season-panel">
      <button className="season-header" onClick={() => setOpen((o) => !o)}>
        <span className="season-name">{season.name}</span>
        <span className="season-meta">
          <span className="season-count">
            {watchedCount}/{season.episode_count} ep.
          </span>
          <span className={`chevron${open ? " open" : ""}`}>›</span>
        </span>
      </button>

      {open && (
        <div className="season-body">
          {!data ? (
            <div className="loading-eps">Cargando episodios…</div>
          ) : episodes.length === 0 ? (
            <div className="loading-eps">No hay episodios disponibles.</div>
          ) : (
            <>
              <button
                className="mark-all"
                onClick={() =>
                  markSeason(
                    season.season_number,
                    episodes.map((e) => e.episode_number)
                  )
                }
              >
                {allWatched ? "Desmarcar temporada" : "Marcar temporada completa"}
              </button>
              <ul className="episodes-list">
                {episodes.map((ep) => {
                  const checked = isWatched(season.season_number, ep.episode_number);
                  return (
                    <li key={ep.id} className={`ep-item${checked ? " ep-done" : ""}`}>
                      <label className="ep-label">
                        <input
                          type="checkbox"
                          className="ep-check"
                          checked={checked}
                          onChange={() => toggle(season.season_number, ep.episode_number)}
                        />
                        <span className="ep-num">{ep.episode_number}.</span>
                        <span className="ep-name">{ep.name}</span>
                        {ep.runtime != null && (
                          <span className="ep-runtime">{ep.runtime}m</span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .season-panel {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .season-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--surface);
          border: none;
          cursor: pointer;
          color: var(--text);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          transition: background 0.15s;
          text-align: left;
          gap: 8px;
        }

        .season-header:hover {
          background: var(--surface-elevated);
        }

        .season-name {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .season-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .season-count {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 400;
          font-family: var(--font-mono);
        }

        .chevron {
          color: var(--text-muted);
          font-size: 18px;
          line-height: 1;
          transition: transform 0.2s;
          display: inline-block;
        }

        .chevron.open {
          transform: rotate(90deg);
        }

        .season-body {
          background: var(--bg);
          padding: 12px 16px 8px;
        }

        .loading-eps {
          color: var(--text-muted);
          font-size: 13px;
          padding: 6px 0 8px;
        }

        .mark-all {
          background: none;
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 12px;
          font-family: var(--font-body);
          padding: 5px 12px;
          border-radius: 20px;
          cursor: pointer;
          margin-bottom: 10px;
          transition: all 0.15s;
        }

        .mark-all:hover {
          border-color: var(--watching-border);
          color: var(--watching);
          background: var(--watching-bg);
        }

        .episodes-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }

        .ep-item {
          border-radius: var(--radius-sm);
          transition: background 0.1s;
        }

        .ep-item:hover {
          background: var(--surface);
        }

        .ep-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 6px;
          cursor: pointer;
          width: 100%;
        }

        .ep-check {
          accent-color: var(--watching);
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .ep-num {
          color: var(--text-muted);
          font-size: 12px;
          min-width: 22px;
          flex-shrink: 0;
          font-family: var(--font-mono);
        }

        .ep-name {
          flex: 1;
          font-size: 13px;
          color: var(--text);
          line-height: 1.3;
          transition: color 0.15s;
        }

        .ep-item.ep-done .ep-name {
          color: var(--text-muted);
          text-decoration: line-through;
          text-decoration-color: var(--border-hover);
        }

        .ep-runtime {
          color: var(--text-muted);
          font-size: 11px;
          flex-shrink: 0;
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}

export default function EpisodeTracker({
  seriesId,
  seasons,
  totalEpisodes,
  watchlistStatus,
}: {
  seriesId: number;
  seasons: SeasonInfo[];
  totalEpisodes: number;
  watchlistStatus: WatchlistStatus | null;
}) {
  const { user } = useAuth();
  const { isWatched, watchedInSeason, toggle, markSeason, watchedCount } =
    useWatchedEpisodes(seriesId);

  if (!user || watchlistStatus !== "watching") return null;

  const progress = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

  return (
    <div className="tracker">
      <div className="tracker-header">
        <span className="tracker-title">Seguimiento de episodios</span>
        <span className="tracker-count">
          {watchedCount}/{totalEpisodes} vistos
        </span>
      </div>

      <div className="progress-bar" title={`${progress}% completado`}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="seasons-list">
        {seasons.map((season) => (
          <SeasonPanel
            key={season.id}
            seriesId={seriesId}
            season={season}
            isWatched={isWatched}
            watchedInSeason={watchedInSeason}
            toggle={toggle}
            markSeason={markSeason}
          />
        ))}
      </div>

      <style jsx>{`
        .tracker {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tracker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .tracker-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .tracker-count {
          font-size: 12px;
          color: var(--watching);
          font-weight: 600;
          font-family: var(--font-mono);
          flex-shrink: 0;
        }

        .progress-bar {
          height: 3px;
          background: var(--surface-elevated);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--watching);
          border-radius: 2px;
          transition: width 0.3s ease;
          min-width: ${progress > 0 ? "3px" : "0"};
        }

        .seasons-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      `}</style>
    </div>
  );
}

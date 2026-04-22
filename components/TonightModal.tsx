"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { WatchlistItem, WatchProvider } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import { useFullWatchlist } from "@/hooks/useWatchlist";
import { supabase } from "@/lib/supabase";

const POSTER_BASE = "https://image.tmdb.org/t/p/w185";
const LOGO_BASE = "https://image.tmdb.org/t/p/original";
const FALLBACK_POSTER = "https://picsum.photos/id/444/185/278";

type RecommendedItem = WatchlistItem & { availableOn: WatchProvider[] };

async function fetchWatchProviders(
  filmId: number,
  mediaType: "film" | "series"
): Promise<WatchProvider[]> {
  const segment = mediaType === "series" ? "tv" : "movie";
  try {
    const res = await fetch(
      `${API_BASE_URL}/${segment}/${filmId}/watch/providers?api_key=${API_KEY}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const esRegion = data?.results?.ES;
    return esRegion?.flatrate ?? esRegion?.free ?? [];
  } catch {
    return [];
  }
}

async function fetchAiredEpisodeCount(filmId: number): Promise<number> {
  try {
    const res = await fetch(`${API_BASE_URL}/tv/${filmId}?api_key=${API_KEY}`);
    if (!res.ok) return 0;
    const data = await res.json();
    const last = data.last_episode_to_air;
    if (!last) return 0;
    const lastAiredSeason: number = last.season_number;
    const lastAiredEpisode: number = last.episode_number;
    const seasons: Array<{ season_number: number; episode_count: number }> = data.seasons ?? [];
    let total = 0;
    for (const season of seasons) {
      if (season.season_number === 0) continue;
      if (season.season_number < lastAiredSeason) {
        total += season.episode_count;
      } else if (season.season_number === lastAiredSeason) {
        total += lastAiredEpisode;
        break;
      }
    }
    return total;
  } catch {
    return 0;
  }
}

async function filterByPlatform(
  candidates: WatchlistItem[],
  mediaType: "film" | "series",
  platformIds: Set<number>
): Promise<RecommendedItem[]> {
  const results = await Promise.all(
    candidates.map(async (item) => {
      const providers = await fetchWatchProviders(item.film_id, mediaType);
      const availableOn = providers.filter((p) => platformIds.has(p.provider_id));
      return availableOn.length > 0 ? { ...item, availableOn } : null;
    })
  );
  return results.filter((r): r is RecommendedItem => r !== null);
}

function PlatformLogos({ providers }: { providers: WatchProvider[] }) {
  return (
    <div className="logos">
      {providers.slice(0, 3).map((p) => (
        <Image
          key={p.provider_id}
          src={`${LOGO_BASE}${p.logo_path}`}
          alt={p.provider_name}
          width={18}
          height={18}
          title={p.provider_name}
          style={{ borderRadius: 4, objectFit: "cover" }}
        />
      ))}
      <style jsx>{`
        .logos {
          display: flex;
          gap: 4px;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

function RecCard({ item, onClose }: { item: RecommendedItem; onClose: () => void }) {
  const href =
    item.media_type === "series" ? `/series/${item.film_id}` : `/film/${item.film_id}`;
  const src = item.poster_path ? `${POSTER_BASE}${item.poster_path}` : FALLBACK_POSTER;

  return (
    <div className="rec-card">
      <Link href={href} style={{ textDecoration: "none" }} onClick={onClose}>
        <div className="poster-wrap">
          <Image
            src={src}
            alt={item.film_title}
            fill
            sizes="120px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="info">
          <p className="title">{item.film_title}</p>
          <PlatformLogos providers={item.availableOn} />
        </div>
      </Link>
      <style jsx>{`
        .rec-card {
          flex-shrink: 0;
          width: 120px;
        }
        .poster-wrap {
          position: relative;
          width: 120px;
          height: 180px;
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg);
          transition: transform 0.2s;
        }
        .rec-card:hover .poster-wrap {
          transform: translateY(-3px);
        }
        .info {
          margin-top: 7px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .title {
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function Section({
  title,
  items,
  onClose,
}: {
  title: string;
  items: RecommendedItem[];
  onClose: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      <div className="row">
        {items.map((item) => (
          <RecCard key={item.id} item={item} onClose={onClose} />
        ))}
      </div>
      <style jsx>{`
        .section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
        }
        .row::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default function TonightModal() {
  const { user } = useAuth();
  const { platformIds } = useUserPlatforms();
  const { items } = useFullWatchlist();
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [movies, setMovies] = useState<RecommendedItem[]>([]);
  const [seriesWatching, setSeriesWatching] = useState<RecommendedItem[]>([]);
  const [seriesToWatch, setSeriesToWatch] = useState<RecommendedItem[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleOpen = useCallback(async () => {
    setOpen(true);
    setProcessing(true);
    setMovies([]);
    setSeriesWatching([]);
    setSeriesToWatch([]);

    const movieCandidates = items.filter(
      (item) => item.media_type !== "series" && item.status === "to_watch"
    );
    const watchingCandidates = items.filter(
      (item) => item.media_type === "series" && item.status === "watching"
    );
    const seriesToWatchCandidates = items.filter(
      (item) => item.media_type === "series" && item.status === "to_watch"
    );

    let activeWatchingCandidates = watchingCandidates;
    if (watchingCandidates.length > 0) {
      const seriesIds = watchingCandidates.map((item) => item.film_id);
      const [airedCounts, { data: watchedRows }] = await Promise.all([
        Promise.all(seriesIds.map(fetchAiredEpisodeCount)),
        supabase
          .from("watched_episodes")
          .select("series_id,season_number,episode_number")
          .eq("user_id", user!.id)
          .in("series_id", seriesIds),
      ]);

      const watchedCountBySeries = new Map<number, number>();
      for (const row of watchedRows ?? []) {
        if (row.season_number === 0) continue;
        watchedCountBySeries.set(
          row.series_id,
          (watchedCountBySeries.get(row.series_id) ?? 0) + 1
        );
      }

      activeWatchingCandidates = watchingCandidates.filter((item, i) => {
        const aired = airedCounts[i];
        if (aired === 0) return true;
        const watched = watchedCountBySeries.get(item.film_id) ?? 0;
        return watched < aired;
      });
    }

    const [filteredMovies, filteredWatching, filteredSeriesQueue] = await Promise.all([
      filterByPlatform(movieCandidates, "film", platformIds),
      filterByPlatform(activeWatchingCandidates, "series", platformIds),
      filterByPlatform(seriesToWatchCandidates, "series", platformIds),
    ]);

    setMovies(filteredMovies);
    setSeriesWatching(filteredWatching);
    setSeriesToWatch(filteredSeriesQueue);
    setProcessing(false);
  }, [items, platformIds, user]);

  const handleClose = useCallback(() => setOpen(false), []);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) handleClose();
  }

  const hasNoPlatforms = platformIds.size === 0;
  const hasResults =
    movies.length + seriesWatching.length + seriesToWatch.length > 0;

  if (!user) return null;

  return (
    <>
      <button className="tonight-btn" onClick={handleOpen}>
        <span className="star" aria-hidden>✦</span>
        ¿Que puedo ver ahora?
      </button>

      {open && (
        <div
          className="overlay"
          ref={overlayRef}
          onClick={handleOverlayClick}
          role="presentation"
        >
          <div className="modal" role="dialog" aria-modal="true" aria-label="¿Que puedo ver ahora?">
            <div className="modal-head">
              <h2 className="modal-title">
                <span className="star-title" aria-hidden>✦</span>
                ¿Que puedo ver ahora?
              </h2>
              <button className="close-btn" onClick={handleClose} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {processing ? (
                <div className="state-center">
                  <div className="dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                  <p className="state-text">Buscando lo que puedes ver...</p>
                </div>
              ) : hasNoPlatforms ? (
                <div className="state-center">
                  <p className="state-text">
                    No tienes plataformas configuradas.{" "}
                    <Link href="/platforms" className="state-link" onClick={handleClose}>
                      Añade tus plataformas
                    </Link>{" "}
                    para ver recomendaciones.
                  </p>
                </div>
              ) : !hasResults ? (
                <div className="state-center">
                  <p className="state-text">
                    Ningún título de tu lista está disponible en tus plataformas esta noche.
                  </p>
                  <p className="state-subtext">
                    Añade más películas o series a <strong>Por ver</strong> o <strong>Viendo</strong>.
                  </p>
                </div>
              ) : (
                <div className="sections">
                  <Section
                    title="Películas por ver"
                    items={movies}
                    onClose={handleClose}
                  />
                  <Section
                    title="Series que estás viendo"
                    items={seriesWatching}
                    onClose={handleClose}
                  />
                  <Section
                    title="Series pendientes"
                    items={seriesToWatch}
                    onClose={handleClose}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .tonight-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(
            135deg,
            rgba(212, 175, 55, 0.12),
            rgba(108, 99, 255, 0.1)
          );
          border: 1px solid rgba(212, 175, 55, 0.32);
          color: var(--gold);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
          white-space: nowrap;
        }

        .tonight-btn:hover {
          background: linear-gradient(
            135deg,
            rgba(212, 175, 55, 0.2),
            rgba(108, 99, 255, 0.16)
          );
          border-color: rgba(212, 175, 55, 0.52);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.12);
        }

        .tonight-btn:active {
          transform: translateY(0);
        }

        .star {
          font-size: 11px;
          display: inline-block;
          animation: spin 6s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ── Overlay ──────────────────────────────── */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 8, 16, 0.82);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.18s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── Modal ────────────────────────────────── */
        .modal {
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 700px;
          max-height: 82vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.22s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px 18px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .modal-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .star-title {
          color: var(--gold);
          font-size: 12px;
          display: inline-block;
          animation: spin 6s linear infinite;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 15px;
          cursor: pointer;
          padding: 5px 9px;
          border-radius: var(--radius-sm);
          transition: color 0.15s, background 0.15s;
          line-height: 1;
        }

        .close-btn:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.06);
        }

        /* ── Body ─────────────────────────────────── */
        .modal-body {
          overflow-y: auto;
          padding: 24px;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: var(--border-hover) transparent;
        }

        .sections {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* ── States ───────────────────────────────── */
        .state-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 44px 16px;
          text-align: center;
        }

        .state-text {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .state-subtext {
          color: var(--text-subtle);
          font-size: 13px;
          line-height: 1.6;
        }

        :global(.state-link) {
          color: var(--accent);
          text-decoration: none;
        }

        :global(.state-link:hover) {
          text-decoration: underline;
        }

        /* ── Loading dots ─────────────────────────── */
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

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        /* ── Mobile ───────────────────────────────── */
        @media (max-width: 480px) {
          .tonight-btn {
            font-size: 13px;
            padding: 9px 16px;
          }
          .modal-head {
            padding: 18px 16px 14px;
          }
          .modal-body {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
}

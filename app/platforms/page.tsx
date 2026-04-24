"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import { useAuth } from "@/context/AuthContext";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import { useFullWatchlist } from "@/hooks/useWatchlist";
import { fetchWatchProviders } from "@/utils/providers";
import { API_KEY, API_BASE_URL } from "@/apiconfig";

const LOGO_BASE = "https://image.tmdb.org/t/p/original";

// Featured platform names (partial match, case-insensitive)
const FEATURED_NAMES = [
  "netflix",
  "disney plus",
  "disney+",
  "hbo max",
  "apple tv",
  "hulu",
  "movistar",
  "atresplayer",
  "rtve",
  "showtime",
  "skytime",
];

type TmdbProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
};

function isFeatured(name: string) {
  const lower = name.toLowerCase();
  return FEATURED_NAMES.some((f) => lower.includes(f));
}

type PlatformCoverage = {
  providerId: number;
  providerName: string;
  logoPath: string;
  count: number;
  pct: number;
};

export default function PlatformsPage() {
  const { user, loading: authLoading } = useAuth();
  const { platformIds, platforms, toggle, loading: platformsLoading } = useUserPlatforms();
  const { items: watchlistItems } = useFullWatchlist();
  const [providers, setProviders] = useState<TmdbProvider[]>([]);
  const [fetching, setFetching] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [coverage, setCoverage] = useState<PlatformCoverage[] | null>(null);

  const runAnalysis = useCallback(async () => {
    if (platformIds.size === 0 || watchlistItems.length === 0) return;
    setAnalyzing(true);
    setCoverage(null);

    const candidates = watchlistItems.filter(
      (item) => item.status === "to_watch" || item.status === "watching"
    );

    const counts = new Map<number, number>();
    await Promise.all(
      candidates.map(async (item) => {
        const itemProviders = await fetchWatchProviders(
          item.film_id,
          item.media_type ?? "film"
        );
        for (const p of itemProviders) {
          if (platformIds.has(p.provider_id)) {
            counts.set(p.provider_id, (counts.get(p.provider_id) ?? 0) + 1);
          }
        }
      })
    );

    const total = candidates.length || 1;
    const result: PlatformCoverage[] = platforms
      .map((p) => ({
        providerId: p.provider_id,
        providerName: p.provider_name,
        logoPath: p.logo_path,
        count: counts.get(p.provider_id) ?? 0,
        pct: Math.round(((counts.get(p.provider_id) ?? 0) / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    setCoverage(result);
    setAnalyzing(false);
  }, [platformIds, platforms, watchlistItems]);

  useEffect(() => {
    async function loadProviders() {
      setFetching(true);
      try {
        const [movRes, tvRes] = await Promise.all([
          fetch(`${API_BASE_URL}/watch/providers/movie?api_key=${API_KEY}&watch_region=ES&language=es-ES`),
          fetch(`${API_BASE_URL}/watch/providers/tv?api_key=${API_KEY}&watch_region=ES&language=es-ES`),
        ]);
        const movData = await movRes.json();
        const tvData = await tvRes.json();

        const allMap = new Map<number, TmdbProvider>();
        for (const p of [...(movData.results ?? []), ...(tvData.results ?? [])]) {
          if (!allMap.has(p.provider_id)) allMap.set(p.provider_id, p);
        }
        const sorted = Array.from(allMap.values()).sort(
          (a, b) => a.display_priority - b.display_priority
        );
        setProviders(sorted);
      } catch (e) {
        console.error("Error fetching providers:", e);
      }
      setFetching(false);
    }
    loadProviders();
  }, []);

  async function handleToggle(provider: TmdbProvider) {
    if (!user || toggling.has(provider.provider_id)) return;
    setToggling((prev) => new Set([...prev, provider.provider_id]));
    await toggle({
      provider_id: provider.provider_id,
      provider_name: provider.provider_name,
      logo_path: provider.logo_path,
    });
    setToggling((prev) => {
      const next = new Set(prev);
      next.delete(provider.provider_id);
      return next;
    });
  }

  const isLoading = fetching || authLoading || platformsLoading;
  const featured = providers.filter((p) => isFeatured(p.provider_name));
  const others = providers.filter((p) => !isFeatured(p.provider_name));
  const selectedCount = platformIds.size;

  function ProviderCard({ p }: { p: TmdbProvider }) {
    const selected = platformIds.has(p.provider_id);
    const busy = toggling.has(p.provider_id);
    const disabled = !user || busy;
    return (
      <div
        className={`card${selected ? " selected" : ""}${disabled ? " disabled" : ""}`}
        onClick={() => !disabled && handleToggle(p)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleToggle(p);
          }
        }}
        title={user ? p.provider_name : "Inicia sesión para seleccionar"}
        aria-pressed={selected}
        aria-disabled={disabled}
      >
        <div className="logo-wrap">
          <Image
            src={`${LOGO_BASE}${p.logo_path}`}
            alt={p.provider_name}
            width={56}
            height={56}
            style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
          />
          {busy && <div className="busy-overlay"><span className="spin" /></div>}
        </div>
        <span className="card-name">{p.provider_name}</span>
        {selected && (
          <span className="check" aria-hidden>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.8 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        <style jsx>{`
          .card {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            height: 120px;
            padding: 12px 10px;
            background: var(--surface);
            border: 2px solid var(--border);
            border-radius: var(--radius-md);
            color: var(--text);
            cursor: pointer;
            text-align: center;
            user-select: none;
            transition: border-color 0.2s, background 0.2s;
          }

          .card:hover:not(.disabled):not(.selected) {
            border-color: var(--border-hover);
            background: var(--surface-hover);
          }

          .card.selected {
            border-color: var(--accent);
            background: var(--watching-bg);
            color: var(--accent);
            box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.3);
          }

          .card.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .logo-wrap {
            position: relative;
            width: 56px;
            height: 56px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .busy-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.55);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .spin {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-top-color: white;
            border-radius: 50%;
            animation: rotate 0.7s linear infinite;
          }

          @keyframes rotate {
            to { transform: rotate(360deg); }
          }

          .card-name {
            font-size: 11px;
            font-weight: 500;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .check {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 18px;
            height: 18px;
            background: var(--accent);
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <NavBar>
        <Back />
      </NavBar>

      <main>
        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-text">
              <h1>Mis plataformas</h1>
              <p>Elige las plataformas que tienes contratadas y filtra el contenido disponible para ti.</p>
            </div>
            {selectedCount > 0 && (
              <div className="counter-pill">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L8.8 5.2L13.5 5.6L10.1 8.5L11.1 13L7 10.5L2.9 13L3.9 8.5L0.5 5.6L5.2 5.2L7 1Z" fill="currentColor" />
                </svg>
                <span>{selectedCount} {selectedCount === 1 ? "seleccionada" : "seleccionadas"}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── Auth notice ── */}
        {!user && !authLoading && (
          <div className="notice">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Inicia sesión para guardar tus plataformas
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="loading-area">
            <div className="skeleton-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {!isLoading && providers.length > 0 && (
          <div className="content">
            {/* Featured */}
            <section className="section">
              <div className="section-header">
                <h2>Plataformas principales</h2>
                <span className="section-pill">{featured.length}</span>
              </div>
              <div className="grid grid-featured">
                {featured.map((p) => (
                  <ProviderCard key={p.provider_id} p={p} />
                ))}
              </div>
            </section>

            {/* More */}
            {others.length > 0 && (
              <section className="section">
                <button
                  className="show-more-btn"
                  onClick={() => setShowAll((v) => !v)}
                  aria-expanded={showAll}
                >
                  <span>{showAll ? "Mostrar menos" : `Mostrar más (${others.length})`}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {showAll && (
                  <div className="grid grid-others">
                    {others.map((p) => (
                      <ProviderCard key={p.provider_id} p={p} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Platform Value Analyzer ── */}
            {user && platformIds.size > 0 && watchlistItems.length > 0 && (
              <section className="section analyzer-section">
                <div className="section-header">
                  <div className="analyzer-title-wrap">
                    <h2>Análisis de valor</h2>
                    <p className="analyzer-subtitle">
                      ¿Cuánto de tu lista está disponible en cada plataforma?
                    </p>
                  </div>
                  <button
                    className="analyze-btn"
                    onClick={runAnalysis}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <><span className="spin-sm" /> Analizando...</>
                    ) : (
                      coverage ? "Actualizar análisis" : "Analizar mis plataformas"
                    )}
                  </button>
                </div>

                {analyzing && (
                  <div className="analyzer-loading">
                    <span className="spin-sm" />
                    <span className="analyzer-load-text">
                      Consultando disponibilidad de {watchlistItems.filter((i) => i.status !== "watched").length} títulos...
                    </span>
                  </div>
                )}

                {coverage && !analyzing && (
                  <div className="coverage-list">
                    {coverage.map((item) => (
                      <div key={item.providerId} className="coverage-row">
                        <div className="coverage-platform">
                          <Image
                            src={`${LOGO_BASE}${item.logoPath}`}
                            alt={item.providerName}
                            width={28}
                            height={28}
                            style={{ borderRadius: 6, objectFit: "cover" }}
                          />
                          <span className="coverage-name">{item.providerName}</span>
                        </div>
                        <div className="coverage-bar-wrap">
                          <div
                            className="coverage-bar-fill"
                            style={{ width: `${Math.max(item.pct, 2)}%` }}
                          />
                        </div>
                        <span className="coverage-stat">
                          {item.count} {item.count === 1 ? "título" : "títulos"}
                          <span className="coverage-pct"> · {item.pct}%</span>
                        </span>
                      </div>
                    ))}

                    {coverage.length > 1 && (
                      <div className="analyzer-insight">
                        {coverage[0].pct >= 50 ? (
                          <p>
                            <strong>{coverage[0].providerName}</strong> cubre el{" "}
                            <strong>{coverage[0].pct}%</strong> de tu lista pendiente. Es tu plataforma más rentable.
                          </p>
                        ) : (
                          <p>
                            Tu contenido está distribuido entre varias plataformas. La mayor cobertura la tiene{" "}
                            <strong>{coverage[0].providerName}</strong> con un {coverage[0].pct}%.
                          </p>
                        )}
                        {coverage[coverage.length - 1].count === 0 && (
                          <p className="insight-warn">
                            <strong>{coverage[coverage.length - 1].providerName}</strong> no tiene ningún
                            título de tu lista pendiente.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        main {
          min-height: 100vh;
          padding-bottom: 80px;
        }

        /* ── Hero ── */
        .hero {
          background: linear-gradient(160deg, rgba(108, 99, 255, 0.12) 0%, rgba(255, 101, 132, 0.06) 60%, transparent 100%);
          border-bottom: 1px solid var(--border);
          padding: 48px 24px 40px;
        }

        .hero-inner {
          max-width: 960px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .hero-text h1 {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          margin-bottom: 10px;
        }

        .hero-text p {
          color: var(--text-muted);
          font-size: 0.95rem;
          max-width: 440px;
          line-height: 1.6;
        }

        .counter-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(108, 99, 255, 0.15);
          border: 1px solid rgba(108, 99, 255, 0.35);
          color: var(--accent);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Auth notice ── */
        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 960px;
          margin: 20px auto 0;
          padding: 14px 20px;
          background: rgba(255, 159, 67, 0.08);
          border: 1px solid rgba(255, 159, 67, 0.25);
          border-radius: var(--radius-md);
          color: #ff9f43;
          font-size: 0.88rem;
        }

        /* ── Loading ── */
        .loading-area {
          max-width: 960px;
          margin: 40px auto;
          padding: 0 24px;
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }

        .skeleton {
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          background: linear-gradient(90deg, var(--surface) 25%, var(--surface-hover) 50%, var(--surface) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Content ── */
        .content {
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px 0;
        }

        .section {
          margin-bottom: 48px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.01em;
        }

        .section-pill {
          background: var(--surface-elevated);
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 100px;
          border: 1px solid var(--border);
        }

        /* ── Grids ── */
        .grid-featured {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }

        .grid-others {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
          margin-top: 20px;
          animation: fadeDown 0.3s ease;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Show more ── */
        .show-more-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          padding: 12px 20px;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          width: 100%;
          justify-content: center;
        }

        .show-more-btn:hover {
          border-color: var(--border-hover);
          color: var(--text);
          background: var(--surface-hover);
        }

        /* ── Analyzer ── */
        .analyzer-section {
          border-top: 1px solid var(--border);
          padding-top: 32px;
          margin-top: 8px;
        }

        .analyzer-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .analyzer-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .analyze-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-gradient);
          border: none;
          color: #fff;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }

        .analyze-btn:hover:not(:disabled) {
          opacity: 0.88;
        }

        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .spin-sm {
          display: inline-block;
          width: 13px;
          height: 13px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rotate 0.7s linear infinite;
          flex-shrink: 0;
        }

        .analyzer-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        .coverage-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 4px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .coverage-row {
          display: grid;
          grid-template-columns: 180px 1fr auto;
          align-items: center;
          gap: 14px;
        }

        .coverage-platform {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .coverage-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .coverage-bar-wrap {
          background: var(--surface);
          border-radius: 4px;
          height: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .coverage-bar-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .coverage-stat {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          font-family: var(--font-mono);
        }

        .coverage-pct {
          color: var(--text-muted);
          font-weight: 400;
        }

        .analyzer-insight {
          margin-top: 8px;
          padding: 14px 16px;
          background: rgba(108, 99, 255, 0.06);
          border: 1px solid rgba(108, 99, 255, 0.18);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .analyzer-insight p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0;
        }

        .insight-warn {
          color: rgba(255, 180, 50, 0.9) !important;
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .hero {
            padding: 36px 16px 32px;
          }

          .content {
            padding: 28px 16px 0;
          }

          .grid-featured {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
          }

          .grid-others {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 10px;
          }

          .hero-text h1 {
            font-size: 1.8rem;
          }

          .notice {
            margin: 16px 16px 0;
          }

          .coverage-row {
            grid-template-columns: 1fr auto;
            grid-template-rows: auto auto;
          }

          .coverage-platform {
            grid-column: 1;
            grid-row: 1;
          }

          .coverage-stat {
            grid-column: 2;
            grid-row: 1;
          }

          .coverage-bar-wrap {
            grid-column: 1 / -1;
            grid-row: 2;
          }

          .analyze-btn {
            font-size: 12px;
            padding: 9px 14px;
          }
        }
      `}</style>
    </>
  );
}

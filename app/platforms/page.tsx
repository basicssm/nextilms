"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import { useAuth } from "@/context/AuthContext";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
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

export default function PlatformsPage() {
  const { user, loading: authLoading } = useAuth();
  const { platformIds, toggle, loading: platformsLoading } = useUserPlatforms();
  const [providers, setProviders] = useState<TmdbProvider[]>([]);
  const [fetching, setFetching] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

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
    return (
      <button
        className={`card${selected ? " selected" : ""}`}
        onClick={() => handleToggle(p)}
        disabled={!user || busy}
        title={user ? p.provider_name : "Inicia sesión para seleccionar"}
        aria-pressed={selected}
      >
        <div className="logo-wrap">
          <Image
            src={`${LOGO_BASE}${p.logo_path}`}
            alt={p.provider_name}
            fill
            sizes="56px"
            style={{ objectFit: "contain" }}
          />
          {busy && <div className="busy-overlay"><span className="spin" /></div>}
        </div>
        <span className="card-name">{p.provider_name}</span>
        {selected && (
          <span className="check" aria-hidden>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.8 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </button>
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

        /* ── Cards ── */
        .card {
          position: relative;
          appearance: none;
          -webkit-appearance: none;
          font: inherit;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 120px;
          padding: 12px 10px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text);
          cursor: pointer;
          text-align: center;
          transition: border-color 0.2s, background 0.2s;
        }

        .card:hover:not(:disabled):not(.selected) {
          border-color: var(--border-hover);
          background: var(--surface-hover);
        }

        .card.selected {
          border-color: var(--accent);
          background: var(--watching-bg);
          color: var(--accent);
        }

        .card:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .logo-wrap {
          position: relative;
          width: 56px;
          height: 56px;
          flex-shrink: 0;
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
        }
      `}</style>
    </>
  );
}

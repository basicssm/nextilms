"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import { useAuth } from "@/context/AuthContext";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import { API_KEY, API_BASE_URL } from "@/apiconfig";

const LOGO_BASE = "https://image.tmdb.org/t/p/original";

type TmdbProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
};

export default function PlatformsPage() {
  const { user, loading: authLoading } = useAuth();
  const { platformIds, toggle, loading: platformsLoading } = useUserPlatforms();
  const [providers, setProviders] = useState<TmdbProvider[]>([]);
  const [fetching, setFetching] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

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

  return (
    <>
      <NavBar>
        <Back />
      </NavBar>

      <main>
        <div className="header">
          <h1>Mis plataformas</h1>
          <p className="subtitle">
            Selecciona las plataformas de streaming que tienes contratadas.
            Podrás filtrar el contenido disponible en ellas.
          </p>
        </div>

        {!user && !authLoading && (
          <div className="auth-prompt">
            <span className="auth-icon">🔒</span>
            <p>Inicia sesión para guardar tus plataformas</p>
          </div>
        )}

        {isLoading && (
          <div className="loading-wrap">
            <span className="spinner" />
          </div>
        )}

        {!isLoading && providers.length > 0 && (
          <>
            {platformIds.size > 0 && (
              <p className="selected-count">
                {platformIds.size} {platformIds.size === 1 ? "plataforma seleccionada" : "plataformas seleccionadas"}
              </p>
            )}
            <div className="grid">
              {providers.map((p) => {
                const selected = platformIds.has(p.provider_id);
                const busy = toggling.has(p.provider_id);
                return (
                  <button
                    key={p.provider_id}
                    className={`card${selected ? " selected" : ""}${!user ? " disabled" : ""}`}
                    onClick={() => handleToggle(p)}
                    disabled={!user || busy}
                    title={user ? p.provider_name : "Inicia sesión para seleccionar"}
                    aria-pressed={selected}
                  >
                    <div className="logo-wrap">
                      <Image
                        src={`${LOGO_BASE}${p.logo_path}`}
                        alt={p.provider_name}
                        width={56}
                        height={56}
                        className="logo"
                      />
                      {busy && <div className="busy-overlay"><span className="mini-spinner" /></div>}
                    </div>
                    <span className="name">{p.provider_name}</span>
                    {selected && <span className="check">✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>

      <style jsx>{`
        main {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 64px;
          animation: fadeInUp 0.3s ease both;
        }

        .header {
          margin-bottom: 32px;
        }

        h1 {
          font-size: 1.8rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--text);
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.6;
          max-width: 520px;
        }

        .auth-prompt {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(108, 99, 255, 0.07);
          border: 1px solid rgba(108, 99, 255, 0.2);
          border-radius: var(--radius-md);
          padding: 18px 22px;
          margin-bottom: 28px;
          color: var(--accent);
          font-size: 14px;
        }

        .auth-icon {
          font-size: 20px;
        }

        .selected-count {
          color: var(--text-muted);
          font-size: 13px;
          margin-bottom: 20px;
          font-family: var(--font-mono);
        }

        .loading-wrap {
          display: flex;
          justify-content: center;
          padding: 60px 0;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 14px;
        }

        .card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 16px 10px 14px;
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.18s ease;
          text-align: center;
        }

        .card:hover:not(.disabled) {
          background: var(--surface-hover);
          border-color: var(--border-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .card.selected {
          background: rgba(212, 175, 55, 0.08);
          border-color: rgba(212, 175, 55, 0.55);
          box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.15), 0 8px 24px rgba(212, 175, 55, 0.1);
        }

        .card.selected:hover {
          background: rgba(212, 175, 55, 0.13);
          border-color: rgba(212, 175, 55, 0.75);
        }

        .card.disabled {
          cursor: default;
          opacity: 0.5;
        }

        .logo-wrap {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
        }

        :global(.logo) {
          display: block;
          border-radius: var(--radius-sm);
        }

        .busy-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 10, 15, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .name {
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 500;
          line-height: 1.3;
          word-break: break-word;
        }

        .card.selected .name {
          color: #e0c96a;
        }

        .check {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 18px;
          height: 18px;
          background: #d4af37;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 800;
          color: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.5);
        }

        .spinner {
          display: inline-block;
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .mini-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          main {
            padding: 20px 14px 48px;
          }
          h1 {
            font-size: 1.4rem;
          }
          .grid {
            grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
            gap: 10px;
          }
        }
      `}</style>
    </>
  );
}

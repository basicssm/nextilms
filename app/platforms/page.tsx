"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import { useAuth } from "@/context/AuthContext";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import { API_KEY, API_BASE_URL } from "@/apiconfig";

const LOGO_BASE = "https://image.tmdb.org/t/p/original";
const POPULAR_COUNT = 10;

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
  const popularProviders = providers.slice(0, POPULAR_COUNT);
  const otherProviders = providers.slice(POPULAR_COUNT);

  function ProviderCard({ p }: { p: TmdbProvider }) {
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
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <span className="name">{p.provider_name}</span>
        {selected && (
          <span className="check" aria-hidden>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 3.5L3.8 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

            <section className="section">
              <h2 className="section-title">Populares en España</h2>
              <div className="grid">
                {popularProviders.map((p) => <ProviderCard key={p.provider_id} p={p} />)}
              </div>
            </section>

            {otherProviders.length > 0 && (
              <section className="section">
                <h2 className="section-title">Todas las plataformas</h2>
                <div className="grid">
                  {otherProviders.map((p) => <ProviderCard key={p.provider_id} p={p} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        main {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 12px;
          margin-bottom: 40px;
        }

        .card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 10px 8px 12px;
          background: var(--surface);
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
        }

        .card.selected {
          border-color: var(--gold);
        }

        .card.disabled {
          opacity: 0.45;
          cursor: default;
        }

        .logo-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
        }

        .name {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.3;
          word-break: break-word;
        }

        .card.selected .name {
          color: var(--gold);
        }

        .check {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 20px;
          height: 20px;
          background: var(--gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
}

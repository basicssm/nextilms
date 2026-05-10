"use client";

import { Suspense } from "react";
import { useState, useRef, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/context/AuthContext";
import { useUserPlatforms } from "@/hooks/useUserPlatforms";
import { useWatchlistMap, useFullWatchlist } from "@/hooks/useWatchlist";
import TonightModal from "@/components/TonightModal";
import PlatformFilterBar from "@/components/PlatformFilterBar";
import HorizontalSection from "@/components/HorizontalSection";
import WatchedSection from "@/components/WatchedSection";
import { DASHBOARD_SECTIONS } from "@/lib/dashboardConfig";

type MediaType = "film" | "series";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { platforms, loading: platformsLoading } = useUserPlatforms();
  const watchlistMap = useWatchlistMap();
  const { items: watchlistItems } = useFullWatchlist();

  const initMediaType = (
    searchParams.get("mediaType") === "series" ? "series" : "film"
  ) as MediaType;

  const [mediaType, setMediaType] = useState<MediaType>(initMediaType);
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<number[]>([]);
  const selectedPlatforms = platforms.filter((p) =>
    selectedPlatformIds.includes(p.provider_id)
  );
  // Shared seen-IDs ref for cross-section deduplication; reset when filters change
  const seenIds = useRef(new Set<string>());
  useEffect(() => {
    seenIds.current = new Set();
  }, [mediaType, selectedPlatformIds]);

  // Restore selectedPlatformIds from sessionStorage on mount
  const platformIdsRestored = useRef(false);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("dashboard-platform-ids");
      if (saved) {
        const ids = JSON.parse(saved);
        if (Array.isArray(ids)) setSelectedPlatformIds(ids);
      }
    } catch {}
    platformIdsRestored.current = true;
  }, []);

  // Save selectedPlatformIds to sessionStorage on change (skip until restored)
  useEffect(() => {
    if (!platformIdsRestored.current) return;
    try {
      sessionStorage.setItem(
        "dashboard-platform-ids",
        JSON.stringify(selectedPlatformIds)
      );
    } catch {}
  }, [selectedPlatformIds]);

  // Save vertical scroll position on scroll
  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem("dashboard-scroll-y", String(window.scrollY));
      } catch {}
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  // Restore vertical scroll position on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("dashboard-scroll-y");
      if (saved) {
        const y = parseInt(saved, 10);
        if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
      }
    } catch {}
  }, []);

  function switchMediaType(type: MediaType) {
    setMediaType(type);
    router.replace(`/?mediaType=${type}`);
  }

  return (
    <>
      <NavBar />

      {/* ── Controles superiores ── */}
      <div className="controls">
        <SearchBar mediaType={mediaType} />

        <TonightModal />

        <div className="type-pills">
          <button
            className={`type-pill${mediaType === "film" ? " active" : ""}`}
            onClick={() => switchMediaType("film")}
          >
            Películas
          </button>
          <button
            className={`type-pill${mediaType === "series" ? " active" : ""}`}
            onClick={() => switchMediaType("series")}
          >
            Series
          </button>
        </div>
      </div>

      {/* ── Barra de plataformas pegada ── */}
      <PlatformFilterBar
        platforms={platforms}
        platformsLoading={platformsLoading}
        selectedIds={selectedPlatformIds}
        onSelect={setSelectedPlatformIds}
        user={user}
        authLoading={authLoading}
      />

      {/* ── Secciones del dashboard ── */}
      <main className="dashboard">
        {DASHBOARD_SECTIONS.map((section) => (
          <HorizontalSection
            key={`${section.id}-${mediaType}-${selectedPlatformIds.join(",")}`}
            section={section}
            mediaType={mediaType}
            selectedPlatformIds={selectedPlatformIds}
            selectedPlatforms={selectedPlatforms}
            watchlistMap={watchlistMap}
            seenIds={seenIds}
          />
        ))}
        {user && (
          <WatchedSection
            items={watchlistItems}
            mediaType={mediaType}
            selectedPlatformIds={selectedPlatformIds}
          />
        )}
      </main>

      <style jsx>{`
        /* ── Controls ── */
        .controls {
          padding: 24px 24px 12px;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Type pills ── */
        .type-pills {
          display: flex;
          gap: 6px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0;
        }

        .type-pill {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          padding: 4px 4px 12px;
          margin-bottom: -1px;
          transition: color 0.18s, border-color 0.18s;
          color: var(--text-muted);
        }

        .type-pill.active {
          color: var(--text);
          border-bottom-color: var(--accent);
        }

        .type-pill:hover:not(.active) {
          color: var(--text);
        }

        /* ── Dashboard ── */
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding: 28px 0 80px;
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .controls {
            padding: 16px 14px 12px;
            gap: 12px;
          }
          .type-pill {
            font-size: 16px;
            padding: 4px 2px 10px;
          }
          .dashboard {
            gap: 32px;
          }
        }
      `}</style>
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

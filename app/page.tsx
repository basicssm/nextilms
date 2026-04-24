"use client";

import { Suspense } from "react";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import NavBar from "@/components/NavBar";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
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
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Shared seen-IDs ref for cross-section deduplication; reset when filters change
  const seenIds = useRef(new Set<string>());
  useEffect(() => {
    seenIds.current = new Set();
  }, [mediaType, selectedPlatformIds]);

  function switchMediaType(type: MediaType) {
    setMediaType(type);
    router.replace(`/?mediaType=${type}`);
  }

  function handleSearch() {
    if (searchText.trim())
      router.push(`/search/${searchText.trim()}?mediaType=${mediaType}`);
  }

  function handleSearchKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <>
      <NavBar />

      {/* ── Controles superiores ── */}
      <div className="controls">
        <div className={`search-bar${searchFocused ? " focused" : ""}`}>
          <span className="search-icon">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </span>
          <input
            type="text"
            placeholder="Buscar películas y series..."
            value={searchText}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchText(e.target.value)
            }
            onKeyDown={handleSearchKey}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoComplete="off"
          />
          {searchText && (
            <button
              className="search-clear"
              onClick={() => setSearchText("")}
              aria-label="Limpiar"
            >
              ✕
            </button>
          )}
          <button
            className="search-submit"
            onClick={handleSearch}
            aria-label="Buscar"
          >
            Buscar
          </button>
        </div>

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
            watchlistMap={watchlistMap}
            seenIds={seenIds}
          />
        ))}
        {user && (
          <WatchedSection items={watchlistItems} mediaType={mediaType} />
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

        /* ── Search bar ── */
        .search-bar {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 560px;
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-lg);
          padding: 10px 12px 10px 16px;
          gap: 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-bar.focused {
          border-color: rgba(108, 99, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
        }

        .search-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          flex-shrink: 0;
          font-size: 14px;
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: var(--font-body);
          font-size: 15px;
          min-width: 0;
        }

        .search-bar input::placeholder {
          color: var(--text-subtle);
        }

        .search-clear {
          background: none;
          border: none;
          color: var(--text-subtle);
          font-size: 12px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          transition: color 0.15s;
          flex-shrink: 0;
        }

        .search-clear:hover {
          color: var(--text-muted);
        }

        .search-submit {
          background: var(--accent-gradient);
          border: none;
          color: #fff;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .search-submit:hover {
          opacity: 0.9;
        }

        .search-submit:active {
          transform: scale(0.97);
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
          .search-bar {
            padding: 9px 10px 9px 14px;
          }
          .search-submit {
            padding: 6px 12px;
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

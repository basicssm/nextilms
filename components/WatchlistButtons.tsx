"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchlistStatus } from "@/types";
import AuthModal from "@/components/AuthModal";

type Props = {
  filmId: number;
  filmTitle: string;
  posterPath: string | null;
  mediaType?: "film" | "series";
};

const BUTTONS: {
  status: WatchlistStatus;
  label: string;
  shortLabel: string;
  icon: string;
  colorVar: string;
  bgVar: string;
  borderVar: string;
}[] = [
  {
    status: "watching",
    label: "Viendo",
    shortLabel: "Viendo",
    icon: "▶",
    colorVar: "var(--watching)",
    bgVar: "var(--watching-bg)",
    borderVar: "var(--watching-border)",
  },
  {
    status: "to_watch",
    label: "Por ver",
    shortLabel: "Por ver",
    icon: "◷",
    colorVar: "var(--to-watch)",
    bgVar: "var(--to-watch-bg)",
    borderVar: "var(--to-watch-border)",
  },
  {
    status: "watched",
    label: "Vista",
    shortLabel: "Vista",
    icon: "✓",
    colorVar: "var(--watched)",
    bgVar: "var(--watched-bg)",
    borderVar: "var(--watched-border)",
  },
];

export default function WatchlistButtons({
  filmId,
  filmTitle,
  posterPath,
  mediaType = "film",
}: Props) {
  const { user } = useAuth();
  const { item, loading, setStatus } = useWatchlist(filmId);
  const [showAuth, setShowAuth] = useState(false);
  const pendingStatusRef = useRef<WatchlistStatus | null>(null);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!prevUserRef.current && user && pendingStatusRef.current) {
      setStatus(pendingStatusRef.current, filmTitle, posterPath, mediaType);
      pendingStatusRef.current = null;
      setShowAuth(false);
    }
    prevUserRef.current = user;
  }, [user, filmTitle, posterPath, mediaType, setStatus]);

  const handleClick = (status: WatchlistStatus) => {
    if (!user) {
      pendingStatusRef.current = status;
      setShowAuth(true);
      return;
    }
    setStatus(status, filmTitle, posterPath, mediaType);
  };

  return (
    <>
      <div className="watchlist-btns">
        {BUTTONS.map(({ status, label, icon, colorVar, bgVar, borderVar }) => {
          const active = item?.status === status;
          return (
            <button
              key={status}
              className={`wl-btn${active ? " active" : ""}`}
              onClick={() => handleClick(status)}
              disabled={loading}
              title={active ? `Quitar de "${label}"` : `Marcar como "${label}"`}
              style={{
                "--btn-color": colorVar,
                "--btn-bg": bgVar,
                "--btn-border": borderVar,
              } as React.CSSProperties}
            >
              <span className="wl-icon">{icon}</span>
              <span className="wl-label">{label}</span>
            </button>
          );
        })}
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => {
            setShowAuth(false);
            pendingStatusRef.current = null;
          }}
        />
      )}

      <style jsx>{`
        .watchlist-btns {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .wl-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          min-height: 40px;
          border-radius: 20px;
          border: 1px solid var(--border-hover);
          background: var(--surface);
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }

        .wl-btn:hover:not(:disabled) {
          border-color: var(--btn-border);
          color: var(--btn-color);
          background: var(--btn-bg);
        }

        .wl-btn.active {
          border-color: var(--btn-border);
          background: var(--btn-bg);
          color: var(--btn-color);
          animation: pulse-color 0.4s ease;
        }

        .wl-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .wl-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .wl-icon {
          font-size: 12px;
          line-height: 1;
          flex-shrink: 0;
        }

        .wl-label {
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .watchlist-btns {
            gap: 6px;
            flex-wrap: nowrap;
          }
          .wl-btn {
            flex: 1;
            padding: 9px 8px;
            justify-content: center;
          }
          .wl-label {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}

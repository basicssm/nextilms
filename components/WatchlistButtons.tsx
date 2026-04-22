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

const BUTTONS: { status: WatchlistStatus; label: string; icon: string }[] = [
  { status: "watching", label: "Viendo", icon: "▶" },
  { status: "to_watch", label: "Por ver", icon: "🔖" },
  { status: "watched", label: "Vista", icon: "✓" },
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

  // Execute pending action once the user logs in
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
        {BUTTONS.map(({ status, label, icon }) => {
          const active = item?.status === status;
          return (
            <button
              key={status}
              className={`wl-btn${active ? " active" : ""}`}
              onClick={() => handleClick(status)}
              disabled={loading}
              title={
                active ? `Quitar de "${label}"` : `Marcar como "${label}"`
              }
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
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        .wl-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 18px;
          min-height: 44px;
          border-radius: 8px;
          border: 1px solid rgba(212, 175, 55, 0.22);
          background: rgba(212, 175, 55, 0.06);
          color: #8888aa;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s;
        }
        .wl-btn:hover:not(:disabled) {
          border-color: rgba(212, 175, 55, 0.48);
          color: #e8e8f2;
          background: rgba(212, 175, 55, 0.11);
        }
        .wl-btn.active {
          border-color: #d4af37;
          background: rgba(212, 175, 55, 0.16);
          color: #d4af37;
        }
        .wl-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .wl-icon {
          font-size: 14px;
          line-height: 1;
        }
        .wl-label {
          font-size: 13px;
        }

        @media (max-width: 480px) {
          .watchlist-btns {
            gap: 8px;
            flex-wrap: nowrap;
          }
          .wl-btn {
            flex: 1;
            padding: 10px 6px;
            font-size: 13px;
          }
          .wl-label {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
}

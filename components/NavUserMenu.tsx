"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import LevelBadge from "@/components/LevelBadge";
import PointsToast from "@/components/PointsToast";
import { useGamification } from "@/hooks/useGamification";
import { useFullWatchlist } from "@/hooks/useWatchlist";
import { useWatchedEpisodesAll } from "@/hooks/useWatchedEpisodesAll";

function LoggedInMenu({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { items } = useFullWatchlist();
  const { rows: episodeRows } = useWatchedEpisodesAll();
  const { points, currentLevel, unlocks } = useGamification(items, episodeRows);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = user.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <div className="menu-container" ref={menuRef}>
        <button
          className="trigger trigger-user"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          <LevelBadge level={currentLevel.level} />
          <span className={`avatar-ring${unlocks.goldRing ? " avatar-ring--gold" : ""}`}>
            {unlocks.goldRing && <span className="gold-spin" aria-hidden="true" />}
            <span className="avatar">{userInitial}</span>
          </span>
        </button>

        {menuOpen && (
          <div className="dropdown">
            <div className="level-info">
              <span className="level-name-drop">{currentLevel.name}</span>
              <span className="level-pts-drop">{points} pts</span>
            </div>
            <div className="user-email">{user.email}</div>
            <div className="divider" />
            <Link href="/" className="menu-item" onClick={() => setMenuOpen(false)}>
              <span className="item-icon">⌂</span> Inicio
            </Link>
            <div className="divider" />
            <Link href="/my-list" className="menu-item" onClick={() => setMenuOpen(false)}>
              <span className="item-icon">◈</span> Mi lista
            </Link>
            <Link href="/platforms" className="menu-item" onClick={() => setMenuOpen(false)}>
              <span className="item-icon">⊞</span> Mis plataformas
            </Link>
            <Link href="/stats" className="menu-item" onClick={() => setMenuOpen(false)}>
              <span className="item-icon">◎</span> Mis estadísticas
            </Link>
            <div className="divider" />
            <button
              className="menu-item menu-btn danger"
              onClick={() => { onSignOut(); setMenuOpen(false); }}
            >
              <span className="item-icon">→</span> Salir
            </button>
          </div>
        )}
      </div>

      <PointsToast points={points} levelName={currentLevel.name} />

      <style jsx>{`
        .menu-container {
          position: relative;
          flex-shrink: 0;
        }

        .trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .trigger:hover {
          background: none;
          border: none;
        }

        /* ── Avatar ring ─────────────────────────── */
        .avatar-ring {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-gradient);
          padding: 2px;
          flex-shrink: 0;
        }
        .avatar-ring--gold {
          background: transparent;
        }
        .gold-spin {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            var(--gold) 0deg,
            #f5e27a 90deg,
            var(--gold) 180deg,
            #c8960a 270deg,
            var(--gold) 360deg
          );
          animation: goldSpin 3s linear infinite;
          z-index: 0;
        }
        .avatar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: var(--bg);
          border-radius: 50%;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0;
        }

        /* ── Dropdown ─────────────────────────────── */
        .dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 210px;
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-md);
          padding: 8px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border);
          z-index: 50;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .level-info {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 6px 10px 2px;
        }
        .level-name-drop {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }
        .level-pts-drop {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }
        .user-email {
          padding: 2px 10px 8px;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 194px;
        }

        .divider {
          height: 1px;
          background: var(--border);
          margin: 4px 0;
        }

        :global(.menu-item) {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px 10px;
          color: var(--text);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          transition: background 0.12s, color 0.12s;
        }
        :global(.menu-item:hover) {
          background: var(--surface-hover);
          color: var(--text);
        }
        .item-icon {
          font-size: 12px;
          color: var(--text-muted);
          width: 14px;
          text-align: center;
        }
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-body);
        }
        :global(.menu-item.danger) {
          color: var(--text-muted);
        }
        :global(.menu-item.danger:hover) {
          color: #ff6584;
          background: rgba(255, 101, 132, 0.08);
        }
        :global(.menu-item.danger .item-icon) {
          color: inherit;
        }
      `}</style>
    </>
  );
}

function GuestMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="menu-container" ref={menuRef}>
        <button
          className="trigger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          <span className="hamburger-icon">
            <span className={`line${menuOpen ? " open" : ""}`} />
            <span className={`line${menuOpen ? " open" : ""}`} />
            <span className={`line${menuOpen ? " open" : ""}`} />
          </span>
        </button>

        {menuOpen && (
          <div className="dropdown">
            <Link href="/" className="menu-item" onClick={() => setMenuOpen(false)}>
              <span className="item-icon">⌂</span> Inicio
            </Link>
            <div className="divider" />
            <button
              className="menu-item menu-btn login-btn"
              onClick={() => { setShowAuth(true); setMenuOpen(false); }}
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <style jsx>{`
        .menu-container {
          position: relative;
          flex-shrink: 0;
        }
        .trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .trigger:hover {
          border-color: rgba(108, 99, 255, 0.4);
          background: var(--surface-hover);
        }
        .hamburger-icon {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 100%;
          height: 100%;
        }
        .line {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--text-muted);
          border-radius: 2px;
          transition: opacity 0.15s;
        }
        .dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 200px;
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-md);
          padding: 8px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border);
          z-index: 50;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .divider {
          height: 1px;
          background: var(--border);
          margin: 4px 0;
        }
        :global(.menu-item) {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px 10px;
          color: var(--text);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          transition: background 0.12s, color 0.12s;
        }
        :global(.menu-item:hover) {
          background: var(--surface-hover);
          color: var(--text);
        }
        .item-icon {
          font-size: 12px;
          color: var(--text-muted);
          width: 14px;
          text-align: center;
        }
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-body);
        }
        :global(.menu-item.login-btn) {
          background: var(--accent-gradient);
          color: #fff;
          justify-content: center;
          border-radius: var(--radius-md);
          font-weight: 600;
        }
        :global(.menu-item.login-btn:hover) {
          opacity: 0.9;
          color: #fff;
        }
      `}</style>
    </>
  );
}

export default function NavUserMenu() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div className="placeholder" style={{ width: 48, height: 48, flexShrink: 0 }} />;

  if (user) {
    return <LoggedInMenu user={user} onSignOut={signOut} />;
  }

  return <GuestMenu />;
}

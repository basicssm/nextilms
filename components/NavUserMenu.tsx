"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export default function NavUserMenu() {
  const { user, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? "?";

  if (loading) return <div className="placeholder" />;

  return (
    <>
      <div className="menu-container" ref={menuRef}>
        <button
          className={`trigger${user ? " trigger-user" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          {user ? (
            <span className="avatar-ring">
              <span className="avatar">{userInitial}</span>
            </span>
          ) : (
            <span className="hamburger-icon">
              <span className={`line${menuOpen ? " open" : ""}`} />
              <span className={`line${menuOpen ? " open" : ""}`} />
              <span className={`line${menuOpen ? " open" : ""}`} />
            </span>
          )}
        </button>

        {menuOpen && (
          <div className="dropdown">
            {user ? (
              <>
                <Link href="/" className="menu-item" onClick={() => setMenuOpen(false)}>
                  <span className="item-icon">⌂</span> Inicio
                </Link>
                <div className="divider" />
                <div className="user-email">{user.email}</div>
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
                  onClick={() => { signOut(); setMenuOpen(false); }}
                >
                  <span className="item-icon">→</span> Salir
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <style jsx>{`
        .placeholder {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }
        .menu-container {
          position: relative;
          flex-shrink: 0;
        }

        /* ── Trigger button ────────────────────────── */
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
        .trigger-user {
          background: none;
          border: none;
          padding: 0;
        }
        .trigger-user:hover {
          background: none;
          border: none;
        }

        /* ── Avatar con ring en gradiente ─────────── */
        .avatar-ring {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-gradient);
          padding: 2px;
        }
        .avatar {
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

        /* ── Hamburger lines ──────────────────────── */
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

        /* ── Dropdown ─────────────────────────────── */
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

        .user-email {
          padding: 6px 10px 8px;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 184px;
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

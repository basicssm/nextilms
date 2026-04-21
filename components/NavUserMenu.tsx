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

  if (loading) return <div className="placeholder" />;

  return (
    <>
      <div className="menu-container" ref={menuRef}>
        <button
          className="hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          <span className={`line${menuOpen ? " open" : ""}`} />
          <span className={`line${menuOpen ? " open" : ""}`} />
          <span className={`line${menuOpen ? " open" : ""}`} />
        </button>

        {menuOpen && (
          <div className="dropdown">
            {user ? (
              <>
                <Link
                  href="/my-list"
                  className="menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Mi lista
                </Link>
                <button
                  className="menu-item menu-btn"
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="menu-item menu-btn"
                onClick={() => {
                  setShowAuth(true);
                  setMenuOpen(false);
                }}
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <style jsx>{`
        .placeholder {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }
        .menu-container {
          position: relative;
          flex-shrink: 0;
        }
        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          padding: 8px;
          background: none;
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 7px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .hamburger:hover {
          border-color: rgba(212, 175, 55, 0.5);
          background: rgba(212, 175, 55, 0.06);
        }
        .line {
          display: block;
          width: 100%;
          height: 2px;
          background: #d4af37;
          border-radius: 2px;
          transition: opacity 0.15s;
        }
        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 140px;
          background: #1c1c2e;
          border: 1px solid rgba(212, 175, 55, 0.18);
          border-radius: 8px;
          padding: 6px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          z-index: 50;
          animation: fadeIn 0.12s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.menu-item) {
          display: block;
          width: 100%;
          padding: 9px 14px;
          color: #e8e8f2;
          font-size: 14px;
          text-decoration: none;
          border-radius: 5px;
          white-space: nowrap;
          transition: background 0.12s, color 0.12s;
        }
        :global(.menu-item:hover) {
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
        }
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }
      `}</style>
    </>
  );
}

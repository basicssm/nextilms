"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export default function NavUserMenu() {
  const { user, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return <div className="placeholder" />;

  return (
    <>
      <div className="user-menu">
        {user ? (
          <>
            <Link href="/my-list" className="my-list-link">
              Mi lista
            </Link>
            <button className="sign-out-btn" onClick={signOut}>
              Salir
            </button>
          </>
        ) : (
          <button className="sign-in-btn" onClick={() => setShowAuth(true)}>
            Iniciar sesión
          </button>
        )}
      </div>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}

      <style jsx>{`
        .placeholder {
          width: 100px;
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        :global(.my-list-link) {
          color: #a8a8c0;
          font-size: 14px;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        :global(.my-list-link:hover) {
          color: #e8e8f2;
          background: rgba(255, 255, 255, 0.06);
        }
        .sign-out-btn {
          background: none;
          border: 1px solid rgba(212, 175, 55, 0.25);
          color: #8888aa;
          font-size: 13px;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .sign-out-btn:hover {
          border-color: rgba(212, 175, 55, 0.5);
          color: #e8e8f2;
        }
        .sign-in-btn {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #d4af37;
          font-size: 13px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .sign-in-btn:hover {
          background: rgba(212, 175, 55, 0.18);
          border-color: rgba(212, 175, 55, 0.55);
        }
      `}</style>
    </>
  );
}

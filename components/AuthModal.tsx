"use client";

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "register";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function AuthModal({ onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [registered, setRegistered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : error.message);
      } else {
        onSuccess?.();
        onClose();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        onSuccess?.();
        onClose();
      } else {
        setRegistered(true);
      }
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    setOauthLoading(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setRegistered(false);
  };

  if (!mounted) return null;

  const modal = (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">✕</button>

        {/* Branding */}
        <div className="modal-brand">
          <span className="modal-brand-w">W</span>
          <span className="modal-brand-rest">hatWatch</span>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab${mode === "login" ? " tab-active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
          <button
            className={`tab${mode === "register" ? " tab-active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Crear cuenta
          </button>
          <div className={`tab-indicator${mode === "register" ? " tab-indicator-right" : ""}`} />
        </div>

        {registered ? (
          <div className="success-box">
            <span className="success-icon">✓</span>
            <p>¡Cuenta creada! Revisa tu email para confirmarla.</p>
            <button className="btn-outline" onClick={() => switchMode("login")}>
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <>
            {/* OAuth — prominente primero */}
            <div className="social">
              <button
                className="social-btn"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading || loading}
              >
                {oauthLoading === "google" ? <span className="spinner-sm" /> : <GoogleIcon />}
                Continuar con Google
              </button>
              <button
                className="social-btn social-btn-apple"
                onClick={() => handleOAuth("apple")}
                disabled={!!oauthLoading || loading}
              >
                {oauthLoading === "apple" ? <span className="spinner-sm dark" /> : <AppleIcon />}
                Continuar con Apple
              </button>
            </div>

            <div className="divider"><span>o con email</span></div>

            <form onSubmit={handleSubmit}>
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
              <label className="field-label">Contraseña</label>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              {error && <p className="error-msg">{error}</p>}
              <button className="submit-btn" type="submit" disabled={loading || !!oauthLoading}>
                {loading
                  ? <span className="spinner-sm dark" />
                  : mode === "login" ? "Entrar" : "Crear cuenta"}
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: fadeIn 0.18s ease;
        }

        .modal {
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-xl);
          padding: 36px 32px 40px;
          width: 100%;
          max-width: 400px;
          position: relative;
          animation: slideUp 0.22s ease;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* Branding en el modal */
        .modal-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1px;
          margin-bottom: 24px;
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .modal-brand-w {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 24px;
        }
        .modal-brand-rest {
          color: var(--text);
        }

        /* Close */
        .close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: none;
          border: none;
          color: var(--text-subtle);
          font-size: 14px;
          cursor: pointer;
          padding: 7px 10px;
          border-radius: var(--radius-sm);
          transition: color 0.15s, background 0.15s;
          line-height: 1;
        }
        .close-btn:hover {
          color: var(--text);
          background: var(--surface-hover);
        }

        /* Tabs */
        .tabs {
          display: flex;
          position: relative;
          margin-bottom: 28px;
          border-bottom: 1px solid var(--border);
        }
        .tab {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          padding: 0 0 14px;
          cursor: pointer;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }
        .tab-active {
          color: var(--text);
        }
        .tab-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 50%;
          height: 2px;
          background: var(--accent-gradient);
          border-radius: 2px;
          transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-indicator-right {
          left: 50%;
        }

        /* Social */
        .social {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          background: var(--surface-hover);
          border: 1px solid var(--border-hover);
          color: var(--text);
          min-height: 46px;
        }
        .social-btn:hover:not(:disabled) {
          background: var(--surface-elevated);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .social-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .social-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .social-btn-apple {
          background: #f5f5f5;
          border-color: #f5f5f5;
          color: #000;
        }
        .social-btn-apple:hover:not(:disabled) {
          background: #eaeaea;
          border-color: #eaeaea;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          color: var(--text-subtle);
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* Form */
        .field-label {
          display: block;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 6px;
          margin-top: 16px;
        }
        .field-input {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-md);
          color: var(--text);
          padding: 11px 14px;
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .field-input:focus {
          border-color: rgba(108, 99, 255, 0.55);
        }
        .field-input::placeholder {
          color: var(--text-subtle);
        }
        .error-msg {
          color: #ff6584;
          font-size: 13px;
          margin-top: 12px;
          padding: 9px 12px;
          background: rgba(255, 101, 132, 0.08);
          border-radius: var(--radius-sm);
          border-left: 2px solid #ff6584;
        }
        .submit-btn {
          width: 100%;
          margin-top: 20px;
          padding: 13px;
          background: var(--accent-gradient);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          letter-spacing: 0.01em;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Spinners */
        .spinner-sm {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(108, 99, 255, 0.25);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .spinner-sm.dark {
          border-color: rgba(255, 255, 255, 0.2);
          border-top-color: #fff;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Success */
        .success-box {
          text-align: center;
          padding: 24px 0 8px;
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.7;
        }
        .success-icon {
          display: block;
          font-size: 2.5rem;
          color: var(--watched);
          margin-bottom: 14px;
        }
        .btn-outline {
          display: inline-block;
          margin-top: 20px;
          background: none;
          border: 1px solid var(--border-hover);
          color: var(--text);
          padding: 9px 22px;
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-outline:hover {
          background: var(--surface-hover);
          border-color: rgba(108, 99, 255, 0.4);
          color: var(--accent);
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

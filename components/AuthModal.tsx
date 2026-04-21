"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AuthModal({ onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos."
            : error.message
        );
      } else {
        onSuccess?.();
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setRegistered(true);
      }
    }
    setLoading(false);
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError(null);
    setRegistered(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <h2 className="modal-title">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>
        <p className="modal-sub">
          {mode === "login"
            ? "Inicia sesión para llevar el control de tu lista"
            : "Crea una cuenta para guardar tu lista de películas"}
        </p>

        {registered ? (
          <div className="success-box">
            <span className="success-icon">✓</span>
            <p>Revisa tu email para confirmar tu cuenta.</p>
            <button className="toggle-btn" onClick={() => switchMode("login")}>
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
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
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
            {error && <p className="error-msg">{error}</p>}
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading
                ? "Cargando..."
                : mode === "login"
                  ? "Entrar"
                  : "Registrarse"}
            </button>
          </form>
        )}

        {!registered && (
          <p className="toggle-mode">
            {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
              className="toggle-link"
              onClick={() =>
                switchMode(mode === "login" ? "register" : "login")
              }
            >
              {mode === "login" ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        )}

        <style jsx>{`
          .overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.72);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200;
            backdrop-filter: blur(4px);
          }
          .modal {
            background: #12121e;
            border: 1px solid rgba(212, 175, 55, 0.22);
            border-radius: 16px;
            padding: 40px 36px;
            width: 100%;
            max-width: 400px;
            position: relative;
            margin: 16px;
          }
          .close-btn {
            position: absolute;
            top: 14px;
            right: 14px;
            background: none;
            border: none;
            color: #8888aa;
            font-size: 15px;
            cursor: pointer;
            padding: 6px 10px;
            border-radius: 6px;
            transition: color 0.15s, background 0.15s;
          }
          .close-btn:hover {
            color: #e8e8f2;
            background: rgba(255, 255, 255, 0.06);
          }
          .modal-title {
            color: #e8e8f2;
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .modal-sub {
            color: #8888aa;
            font-size: 14px;
            margin-bottom: 28px;
            line-height: 1.5;
          }
          .field-label {
            display: block;
            color: #a8a8c0;
            font-size: 13px;
            margin-bottom: 6px;
            margin-top: 16px;
          }
          .field-input {
            width: 100%;
            background: #1c1c2e;
            border: 1px solid rgba(212, 175, 55, 0.15);
            border-radius: 8px;
            color: #e8e8f2;
            padding: 10px 14px;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.15s;
          }
          .field-input:focus {
            border-color: rgba(212, 175, 55, 0.45);
          }
          .field-input::placeholder {
            color: #44446a;
          }
          .error-msg {
            color: #e05b5b;
            font-size: 13px;
            margin-top: 12px;
          }
          .submit-btn {
            width: 100%;
            margin-top: 22px;
            padding: 12px;
            background: #d4af37;
            color: #080810;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .submit-btn:hover:not(:disabled) {
            opacity: 0.88;
          }
          .submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .toggle-mode {
            color: #8888aa;
            font-size: 13px;
            text-align: center;
            margin-top: 20px;
          }
          .toggle-link {
            background: none;
            border: none;
            color: #d4af37;
            cursor: pointer;
            font-size: 13px;
            padding: 0;
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          .success-box {
            text-align: center;
            padding: 20px 0 8px;
            color: #a8a8c0;
            font-size: 14px;
          }
          .success-icon {
            display: block;
            font-size: 2rem;
            color: #22c55e;
            margin-bottom: 12px;
          }
          .success-box .toggle-btn {
            display: inline-block;
            margin-top: 16px;
            background: none;
            border: 1px solid rgba(212, 175, 55, 0.3);
            color: #d4af37;
            padding: 8px 20px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  );
}

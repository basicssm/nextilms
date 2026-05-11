"use client";

import { useState, useEffect } from "react";

const ACCENTS = [
  { label: "Índigo",    value: "#6c63ff" },
  { label: "Esmeralda", value: "#26de81" },
  { label: "Coral",     value: "#ff6584" },
  { label: "Naranja",   value: "#ff9f43" },
  { label: "Celeste",   value: "#45aaf2" },
];

const LS_KEY = "ww-accent-override";

export default function AccentColorPicker() {
  const [active, setActive] = useState<string>("#6c63ff");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setActive(saved);
      }
    } catch {}
  }, []);

  function apply(value: string) {
    setActive(value);
    document.documentElement.style.setProperty("--accent", value);
    try {
      if (value === "#6c63ff") {
        localStorage.removeItem(LS_KEY);
      } else {
        localStorage.setItem(LS_KEY, value);
      }
    } catch {}
  }

  return (
    <div className="picker">
      <p className="picker-label">Color de acento</p>
      <div className="swatches">
        {ACCENTS.map((a) => (
          <button
            key={a.value}
            className={`swatch${active === a.value ? " swatch--active" : ""}`}
            style={{ "--swatch": a.value } as React.CSSProperties}
            onClick={() => apply(a.value)}
            title={a.label}
            aria-label={a.label}
            aria-pressed={active === a.value}
          />
        ))}
      </div>
      <style jsx>{`
        .picker {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .picker-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .swatches {
          display: flex;
          gap: 8px;
        }
        .swatch {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--swatch);
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .swatch:hover {
          transform: scale(1.15);
        }
        .swatch--active {
          border-color: var(--text);
          box-shadow: 0 0 0 2px var(--swatch);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

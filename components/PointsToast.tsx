"use client";

import { useState, useEffect, useRef } from "react";

export default function PointsToast({
  points,
  levelName,
}: {
  points: number;
  levelName: string;
}) {
  const prevRef = useRef<number | null>(null);
  const [toast, setToast] = useState<{ delta: number; key: number } | null>(null);

  useEffect(() => {
    if (prevRef.current === null) {
      prevRef.current = points;
      return;
    }
    const delta = points - prevRef.current;
    if (delta > 0) {
      setToast({ delta, key: Date.now() });
      const t = setTimeout(() => setToast(null), 2500);
      prevRef.current = points;
      return () => clearTimeout(t);
    }
    prevRef.current = points;
  }, [points]);

  if (!toast) return null;

  return (
    <div key={toast.key} className="toast" role="status" aria-live="polite">
      <span className="star">★</span>
      <span className="delta">+{toast.delta} pts</span>
      <span className="level">{levelName}</span>
      <style jsx>{`
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--surface-elevated);
          border: 1px solid var(--gold-glow, rgba(212,175,55,0.3));
          border-radius: var(--radius-md);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border);
          animation: slideUpFade 2.5s ease forwards;
          pointer-events: none;
        }
        .star {
          color: var(--gold);
          font-size: 14px;
          line-height: 1;
        }
        .delta {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 700;
          color: var(--gold);
        }
        .level {
          font-size: 11px;
          color: var(--text-muted);
          border-left: 1px solid var(--border-hover);
          padding-left: 8px;
          white-space: nowrap;
        }
        @media (max-width: 480px) {
          .toast {
            bottom: 16px;
            right: 16px;
            left: 16px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

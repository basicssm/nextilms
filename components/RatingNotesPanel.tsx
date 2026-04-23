"use client";

import { useState, useEffect, useRef } from "react";
import { WatchlistItem } from "@/types";

type Props = {
  item: WatchlistItem | null;
  updateRating: (rating: number | null) => Promise<void>;
  updateNotes: (notes: string) => Promise<void>;
};

export default function RatingNotesPanel({ item, updateRating, updateNotes }: Props) {
  const [localNotes, setLocalNotes] = useState(item?.notes ?? "");
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalNotes(item?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  if (!item) return null;

  const currentRating = item.rating ?? null;

  function handleStarClick(star: number) {
    if (currentRating === star) {
      updateRating(null);
    } else {
      updateRating(star);
    }
  }

  function handleNotesChange(value: string) {
    setLocalNotes(value);
    setSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await updateNotes(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  }

  return (
    <div className="panel">
      {/* Stars */}
      <div className="stars-row">
        <span className="panel-label">Tu valoración</span>
        <div className="stars">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              className={`star-btn${currentRating !== null && star <= currentRating ? " filled" : ""}`}
              onClick={() => handleStarClick(star)}
              aria-label={`Valorar ${star} de 10`}
              title={`${star}/10`}
            >
              ★
            </button>
          ))}
          {currentRating !== null && (
            <span className="rating-display">{currentRating}/10</span>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="notes-wrap">
        <div className="notes-header">
          <span className="panel-label">Notas privadas</span>
          {saved && <span className="saved-badge">guardado ✓</span>}
        </div>
        <textarea
          className="notes-input"
          value={localNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Apuntes personales sobre esta película o serie..."
          maxLength={500}
          rows={3}
        />
      </div>

      <style jsx>{`
        .panel {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          max-width: 440px;
        }

        .panel-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .stars-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stars {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-wrap: wrap;
        }

        .star-btn {
          background: none;
          border: none;
          font-size: 18px;
          color: var(--border-hover);
          cursor: pointer;
          padding: 0 1px;
          line-height: 1;
          transition: color 0.1s, transform 0.1s;
        }

        .star-btn:hover {
          color: var(--gold);
          transform: scale(1.15);
        }

        .star-btn.filled {
          color: var(--gold);
        }

        .rating-display {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          color: var(--gold);
          margin-left: 6px;
        }

        .notes-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .notes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .saved-badge {
          font-size: 11px;
          color: #4caf7d;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .notes-input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.6;
          padding: 10px 12px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .notes-input::placeholder {
          color: var(--text-subtle);
        }

        .notes-input:focus {
          border-color: rgba(108, 99, 255, 0.4);
        }
      `}</style>
    </div>
  );
}

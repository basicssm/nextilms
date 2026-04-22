"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Back() {
  const router = useRouter();

  return (
    <>
      <button className="back-btn" onClick={() => router.back()}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span className="back-label">Volver</span>
      </button>
      <style jsx>{`
        .back-btn {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          background: none;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 8px 14px;
          min-height: 36px;
          border-radius: 6px;
          font-size: 13px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .back-btn:hover {
          background: var(--surface-hover);
          border-color: var(--border-hover);
          color: var(--text);
        }

        @media (max-width: 480px) {
          .back-label {
            display: none;
          }
          .back-btn {
            padding: 8px 10px;
          }
        }
      `}</style>
    </>
  );
}

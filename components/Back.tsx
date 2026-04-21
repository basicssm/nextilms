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
          border: 1px solid rgba(212, 175, 55, 0.25);
          color: #d4af37;
          padding: 8px 14px;
          min-height: 36px;
          border-radius: 6px;
          font-size: 13px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
        }
        .back-btn:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.55);
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

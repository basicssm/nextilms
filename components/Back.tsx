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
        <span>Volver</span>
      </button>
      <style jsx>{`
        .back-btn {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1px solid rgba(212, 175, 55, 0.25);
          color: #d4af37;
          padding: 6px 14px;
          border-radius: 5px;
          font-size: 13px;
          transition: background 0.2s, border-color 0.2s;
        }
        .back-btn:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.55);
        }
      `}</style>
    </>
  );
}

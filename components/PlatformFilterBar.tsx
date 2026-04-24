"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { UserPlatform } from "@/types";
import { TMDB_LOGO_ORIGINAL } from "@/utils/constants";

type Props = {
  platforms: UserPlatform[];
  platformsLoading: boolean;
  selectedIds: number[];
  onSelect: (ids: number[]) => void;
  user: User | null;
  authLoading: boolean;
};

export default function PlatformFilterBar({
  platforms,
  platformsLoading,
  selectedIds,
  onSelect,
  user,
  authLoading,
}: Props) {
  const isTodas = selectedIds.length === 0;

  function handlePlatformClick(id: number) {
    if (selectedIds.length === 1 && selectedIds[0] === id) {
      onSelect([]);
    } else {
      onSelect([id]);
    }
  }

  return (
    <div className="platform-bar-wrap">
      <div className="platform-bar">
        {authLoading || platformsLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="chip-skeleton skeleton" />
            ))}
          </>
        ) : !user ? (
          <Link href="/platforms" className="chip chip-prompt">
            <span className="prompt-icon">📺</span>
            Configura tus plataformas
          </Link>
        ) : platforms.length === 0 ? (
          <Link href="/platforms" className="chip chip-prompt">
            <span className="prompt-icon">➕</span>
            Añade tus plataformas
          </Link>
        ) : (
          <>
            <button
              className={`chip chip-todas${isTodas ? " active" : ""}`}
              onClick={() => onSelect([])}
            >
              Todas
            </button>
            {platforms.map((p) => {
              const isActive = selectedIds.includes(p.provider_id);
              return (
                <button
                  key={p.provider_id}
                  className={`chip chip-platform${isActive ? " active" : ""}`}
                  onClick={() => handlePlatformClick(p.provider_id)}
                  title={p.provider_name}
                >
                  <Image
                    src={`${TMDB_LOGO_ORIGINAL}${p.logo_path}`}
                    alt={p.provider_name}
                    width={20}
                    height={20}
                    style={{ borderRadius: 4, objectFit: "contain" }}
                  />
                  <span className="platform-name">{p.provider_name}</span>
                </button>
              );
            })}
          </>
        )}
      </div>

      <style jsx>{`
        .platform-bar-wrap {
          position: sticky;
          top: 64px;
          z-index: 20;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          padding: 10px 0;
        }

        .platform-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 2px 24px;
        }

        .platform-bar::-webkit-scrollbar {
          display: none;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          transition: all 0.15s;
          flex-shrink: 0;
          white-space: nowrap;
          text-decoration: none;
        }

        .chip:hover:not(.active) {
          border-color: var(--border-hover);
          color: var(--text);
          background: var(--surface-hover);
        }

        .chip.active {
          background: rgba(108, 99, 255, 0.12);
          border-color: rgba(108, 99, 255, 0.4);
          color: var(--accent);
        }

        .chip-todas {
          min-width: 60px;
          justify-content: center;
        }

        .chip-prompt {
          border-color: rgba(108, 99, 255, 0.2);
          color: var(--text-muted);
        }

        .chip-prompt:hover {
          border-color: rgba(108, 99, 255, 0.5);
          color: var(--accent);
          background: rgba(108, 99, 255, 0.08);
        }

        .prompt-icon {
          font-size: 14px;
        }

        .platform-name {
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chip-skeleton {
          height: 34px;
          width: 100px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .platform-bar {
            padding: 2px 14px;
          }
          .platform-bar-wrap {
            top: 48px;
          }
        }
      `}</style>
    </div>
  );
}

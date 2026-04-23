"use client";

import Image from "next/image";
import useSWR from "swr";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { TMDB_POSTER_XS } from "@/utils/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

type CrewMember = {
  id: number;
  name: string;
  job: string;
};

const CREW_JOBS = ["Director", "Screenplay", "Story", "Music", "Original Music Composer"];
const CREW_LABELS: Record<string, string> = {
  Director: "Dirección",
  Screenplay: "Guion",
  Story: "Historia",
  Music: "Música",
  "Original Music Composer": "Música",
};

function PersonAvatar({ path, name }: { path: string | null; name: string }) {
  if (path) {
    return (
      <Image
        src={`${TMDB_POSTER_XS}${path}`}
        alt={name}
        width={64}
        height={96}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="64" height="96" fill="#1e1e30" />
      <circle cx="32" cy="34" r="14" fill="#2a2a42" />
      <ellipse cx="32" cy="80" rx="22" ry="18" fill="#2a2a42" />
    </svg>
  );
}

function CastSkeleton() {
  return (
    <div className="cast-row">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="cast-card skeleton-card" />
      ))}
      <style jsx>{`
        .cast-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }
        .cast-row::-webkit-scrollbar { display: none; }
        .skeleton-card {
          flex-shrink: 0;
          width: 80px;
          height: 140px;
          border-radius: 8px;
          background: var(--surface);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function CastSection({
  filmId,
  mediaType,
}: {
  filmId: number;
  mediaType: "film" | "series";
}) {
  const segment = mediaType === "film" ? "movie" : "tv";
  const { data } = useSWR(
    `${API_BASE_URL}/${segment}/${filmId}/credits?api_key=${API_KEY}&language=es-ES`,
    fetcher
  );

  const cast: CastMember[] = data?.cast?.slice(0, 12) ?? [];
  const crew: CrewMember[] = (data?.crew ?? []).filter((c: CrewMember) =>
    CREW_JOBS.includes(c.job)
  );

  const keyCrewMap = new Map<string, string>();
  for (const member of crew) {
    const label = CREW_LABELS[member.job];
    if (label && !keyCrewMap.has(label)) keyCrewMap.set(label, member.name);
  }

  if (!data) return <CastSkeleton />;
  if (cast.length === 0 && keyCrewMap.size === 0) return null;

  return (
    <section className="cast-section">
      {cast.length > 0 && (
        <>
          <h2 className="section-title">Reparto</h2>
          <div className="cast-row">
            {cast.map((person) => (
              <div key={person.id} className="cast-card">
                <div className="avatar-wrap">
                  <PersonAvatar path={person.profile_path} name={person.name} />
                </div>
                <p className="person-name">{person.name}</p>
                <p className="person-role">{person.character}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {keyCrewMap.size > 0 && (
        <div className="crew-row">
          {Array.from(keyCrewMap.entries()).map(([label, name]) => (
            <span key={label} className="crew-chip">
              <span className="crew-label">{label}</span>
              <span className="crew-name">{name}</span>
            </span>
          ))}
        </div>
      )}

      <style jsx>{`
        .cast-section {
          padding: 0 48px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-family: var(--font-display);
          color: var(--text);
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .cast-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 12px;
          scrollbar-width: thin;
          scrollbar-color: var(--surface-elevated) transparent;
        }

        .cast-row::-webkit-scrollbar { height: 3px; }
        .cast-row::-webkit-scrollbar-thumb {
          background: var(--surface-elevated);
          border-radius: 2px;
        }

        .cast-card {
          flex-shrink: 0;
          width: 90px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .avatar-wrap {
          width: 90px;
          height: 120px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .person-name {
          font-size: 11px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .person-role {
          font-size: 10px;
          color: var(--text-muted);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .crew-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .crew-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
        }

        .crew-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .crew-name {
          color: var(--text);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .cast-section {
            padding: 0 20px 32px;
          }
        }

        @media (max-width: 480px) {
          .cast-section {
            padding: 0 14px 24px;
          }
        }
      `}</style>
    </section>
  );
}

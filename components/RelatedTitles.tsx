"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { TMDB_POSTER_XS } from "@/utils/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average?: number;
  media_type?: string;
};

function TitleCard({
  item,
  defaultMediaType,
}: {
  item: TmdbItem;
  defaultMediaType: "film" | "series";
}) {
  const isSeriesResult =
    item.media_type === "tv" || (item.media_type === undefined && defaultMediaType === "series");
  const href = isSeriesResult ? `/series/${item.id}` : `/film/${item.id}`;
  const title = item.title ?? item.name ?? "";

  return (
    <Link href={href} className="title-card" style={{ textDecoration: "none" }}>
      <div className="poster-wrap">
        {item.poster_path ? (
          <Image
            src={`${TMDB_POSTER_XS}${item.poster_path}`}
            alt={title}
            fill
            sizes="90px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="poster-fallback" />
        )}
        {item.vote_average && item.vote_average > 0 && (
          <span className="rating-badge">★ {item.vote_average.toFixed(1)}</span>
        )}
      </div>
      <p className="card-title">{title}</p>

      <style jsx>{`
        .title-card {
          flex-shrink: 0;
          width: 90px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .poster-wrap {
          position: relative;
          width: 90px;
          height: 135px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          transition: transform 0.18s;
        }
        .title-card:hover .poster-wrap {
          transform: translateY(-3px);
        }
        .poster-fallback {
          width: 100%;
          height: 100%;
          background: var(--surface-elevated, #1e1e30);
        }
        .rating-badge {
          position: absolute;
          bottom: 5px;
          left: 5px;
          background: rgba(8, 8, 16, 0.82);
          color: var(--gold);
          font-size: 9px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }
        .card-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Link>
  );
}

function ScrollRow({
  title,
  items,
  mediaType,
}: {
  title: string;
  items: TmdbItem[];
  mediaType: "film" | "series";
}) {
  if (items.length === 0) return null;
  return (
    <div className="row-section">
      <h3 className="row-title">{title}</h3>
      <div className="scroll-row">
        {items.map((item) => (
          <TitleCard key={item.id} item={item} defaultMediaType={mediaType} />
        ))}
      </div>
      <style jsx>{`
        .row-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .row-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .scroll-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: thin;
          scrollbar-color: var(--surface-elevated) transparent;
        }
        .scroll-row::-webkit-scrollbar { height: 3px; }
        .scroll-row::-webkit-scrollbar-thumb {
          background: var(--surface-elevated);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}

export default function RelatedTitles({
  filmId,
  mediaType,
}: {
  filmId: number;
  mediaType: "film" | "series";
}) {
  const segment = mediaType === "film" ? "movie" : "tv";

  const { data: simData } = useSWR(
    `${API_BASE_URL}/${segment}/${filmId}/similar?api_key=${API_KEY}&language=es-ES&page=1`,
    fetcher
  );
  const { data: recData } = useSWR(
    `${API_BASE_URL}/${segment}/${filmId}/recommendations?api_key=${API_KEY}&language=es-ES&page=1`,
    fetcher
  );

  const similar: TmdbItem[] = (simData?.results ?? []).slice(0, 12);
  const recommended: TmdbItem[] = (recData?.results ?? []).slice(0, 12);

  if (!simData && !recData) return null;
  if (similar.length === 0 && recommended.length === 0) return null;

  return (
    <section className="related-section">
      <h2 className="section-title">También te puede gustar</h2>
      <div className="rows">
        <ScrollRow title="Recomendados" items={recommended} mediaType={mediaType} />
        <ScrollRow title="Similares" items={similar} mediaType={mediaType} />
      </div>

      <style jsx>{`
        .related-section {
          padding: 0 48px 56px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-family: var(--font-display);
          color: var(--text);
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .rows {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        @media (max-width: 768px) {
          .related-section {
            padding: 0 20px 40px;
          }
        }

        @media (max-width: 480px) {
          .related-section {
            padding: 0 14px 32px;
          }
        }
      `}</style>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import { useAuth } from "@/context/AuthContext";
import { useFullWatchlist } from "@/hooks/useWatchlist";
import { WatchlistItem, WatchlistStatus } from "@/types";

const STATUS_CONFIG: Record<WatchlistStatus, { label: string; icon: string; color: string }> = {
  watching: { label: "Viendo ahora", icon: "▶", color: "#3b82f6" },
  to_watch: { label: "Quiero ver", icon: "🔖", color: "#8b5cf6" },
  watched: { label: "Ya vistas", icon: "✓", color: "#22c55e" },
};

type StatusFilter = "all" | WatchlistStatus;
type TypeFilter = "all" | "film" | "series";
type SortOrder = "recent" | "alpha";

function FilmCard({
  item,
  onRemove,
  onChangeStatus,
}: {
  item: WatchlistItem;
  onRemove: () => void;
  onChangeStatus: (status: WatchlistStatus) => void;
}) {
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : `https://picsum.photos/seed/${item.film_id}/120/180`;

  const otherStatuses = (Object.keys(STATUS_CONFIG) as WatchlistStatus[]).filter(
    (s) => s !== item.status
  );

  const href = item.media_type === "series" ? `/series/${item.film_id}` : `/film/${item.film_id}`;

  return (
    <div className="card">
      <Link href={href} className="card-img-link">
        <Image
          src={poster}
          alt={item.film_title}
          width={120}
          height={180}
          style={{ borderRadius: 8, display: "block" }}
        />
      </Link>
      <p className="card-title">{item.film_title}</p>
      {item.media_type === "series" && (
        <span className="type-chip">Serie</span>
      )}

      <div className="card-actions">
        <div className="status-change">
          {otherStatuses.map((s) => (
            <button
              key={s}
              className="move-btn"
              onClick={() => onChangeStatus(s)}
              title={`Mover a "${STATUS_CONFIG[s].label}"`}
            >
              {STATUS_CONFIG[s].icon}
            </button>
          ))}
        </div>
        <button
          className="remove-btn"
          onClick={onRemove}
          title="Quitar de la lista"
          aria-label="Quitar"
        >
          ✕
        </button>
      </div>

      <style jsx>{`
        .card {
          width: 120px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        :global(.card-img-link) {
          display: block;
          transition: opacity 0.15s;
        }
        :global(.card-img-link:hover) {
          opacity: 0.85;
        }
        .card-title {
          color: #a8a8c0;
          font-size: 11px;
          line-height: 1.3;
          text-align: center;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .type-chip {
          align-self: center;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: #d4af37;
          font-size: 9px;
          font-weight: 600;
          padding: 1px 7px;
          border-radius: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2px;
        }
        .status-change {
          display: flex;
          gap: 4px;
        }
        .move-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #8888aa;
          font-size: 12px;
          width: 30px;
          height: 30px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .move-btn:hover {
          background: rgba(212, 175, 55, 0.12);
          border-color: rgba(212, 175, 55, 0.3);
          color: #d4af37;
        }
        .remove-btn {
          background: none;
          border: none;
          color: #44446a;
          font-size: 13px;
          cursor: pointer;
          padding: 6px 8px;
          min-height: 30px;
          border-radius: 4px;
          transition: all 0.15s;
        }
        .remove-btn:hover {
          color: #e05b5b;
          background: rgba(224, 91, 91, 0.08);
        }
      `}</style>
    </div>
  );
}

function Section({
  status,
  items,
  onRemove,
  onChangeStatus,
}: {
  status: WatchlistStatus;
  items: WatchlistItem[];
  onRemove: (id: string) => void;
  onChangeStatus: (id: string, status: WatchlistStatus) => void;
}) {
  const cfg = STATUS_CONFIG[status];
  if (items.length === 0) return null;

  return (
    <section className="section">
      <h2 className="section-title">
        <span className="section-icon" style={{ color: cfg.color }}>
          {cfg.icon}
        </span>
        {cfg.label}
        <span className="section-count">{items.length}</span>
      </h2>
      <div className="section-grid">
        {items.map((item) => (
          <FilmCard
            key={item.id}
            item={item}
            onRemove={() => onRemove(item.id)}
            onChangeStatus={(s) => onChangeStatus(item.id, s)}
          />
        ))}
      </div>

      <style jsx>{`
        .section {
          margin-bottom: 52px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #e8e8f2;
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }
        .section-icon {
          font-size: 0.95rem;
        }
        .section-count {
          margin-left: auto;
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
          font-size: 12px;
          padding: 2px 10px;
          border-radius: 20px;
          font-weight: 500;
        }
        .section-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .section {
            margin-bottom: 36px;
          }
          .section-grid {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 12px;
            gap: 14px;
            scrollbar-width: thin;
            scrollbar-color: rgba(212, 175, 55, 0.2) transparent;
          }
          .section-grid::-webkit-scrollbar {
            height: 4px;
          }
          .section-grid::-webkit-scrollbar-track {
            background: transparent;
          }
          .section-grid::-webkit-scrollbar-thumb {
            background: rgba(212, 175, 55, 0.2);
            border-radius: 2px;
          }
        }
      `}</style>
    </section>
  );
}

export default function MyListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { items, loading, removeItem, changeStatus } = useFullWatchlist();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="spinner-page">
        <div className="spinner" />
        <style jsx>{`
          .spinner-page {
            min-height: 100vh;
            background: #080810;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(212, 175, 55, 0.15);
            border-top-color: #d4af37;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  const filtered = items
    .filter((i: WatchlistItem) => statusFilter === "all" || i.status === statusFilter)
    .filter((i: WatchlistItem) => {
      if (typeFilter === "all") return true;
      const t = i.media_type ?? "film";
      return t === typeFilter;
    })
    .sort((a: WatchlistItem, b: WatchlistItem) => {
      if (sortOrder === "alpha") return a.film_title.localeCompare(b.film_title, "es");
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const total = items.length;
  const filteredTotal = filtered.length;

  const byStatus = (s: WatchlistStatus) => filtered.filter((i: WatchlistItem) => i.status === s);

  const hasActiveFilter = statusFilter !== "all" || typeFilter !== "all";

  return (
    <>
      <NavBar>
        <Back />
      </NavBar>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Mi Lista</h1>
          {total > 0 && (
            <span className="total-badge">
              {filteredTotal !== total ? `${filteredTotal} / ` : ""}{total}{" "}
              {total === 1 ? "título" : "títulos"}
            </span>
          )}
        </div>

        {total > 0 && (
          <div className="filters-bar">
            <div className="filter-group">
              {(["all", "watching", "to_watch", "watched"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  className={`filter-btn${statusFilter === s ? " active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "all"
                    ? "Todos"
                    : `${STATUS_CONFIG[s as WatchlistStatus].icon} ${STATUS_CONFIG[s as WatchlistStatus].label}`}
                </button>
              ))}
            </div>

            <div className="filter-group">
              {([
                { id: "all", label: "Todo" },
                { id: "film", label: "🎬 Películas" },
                { id: "series", label: "📺 Series" },
              ] as { id: TypeFilter; label: string }[]).map(({ id, label }) => (
                <button
                  key={id}
                  className={`filter-btn type-btn${typeFilter === id ? " active" : ""}`}
                  onClick={() => setTypeFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="filter-group sort-group">
              <button
                className={`filter-btn${sortOrder === "recent" ? " active" : ""}`}
                onClick={() => setSortOrder("recent")}
                title="Ordenar por fecha"
              >
                🕐 Recientes
              </button>
              <button
                className={`filter-btn${sortOrder === "alpha" ? " active" : ""}`}
                onClick={() => setSortOrder("alpha")}
                title="Ordenar alfabéticamente"
              >
                A–Z
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-text">Cargando tu lista...</div>
        ) : total === 0 ? (
          <div className="empty">
            <p>Tu lista está vacía.</p>
            <Link href="/" className="browse-link">
              Explorar películas →
            </Link>
          </div>
        ) : filteredTotal === 0 ? (
          <div className="empty">
            <p>No hay títulos con estos filtros.</p>
            {hasActiveFilter && (
              <button
                className="reset-btn"
                onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}
              >
                Quitar filtros
              </button>
            )}
          </div>
        ) : statusFilter !== "all" ? (
          <Section
            status={statusFilter}
            items={filtered}
            onRemove={removeItem}
            onChangeStatus={changeStatus}
          />
        ) : (
          <>
            <Section
              status="watching"
              items={byStatus("watching")}
              onRemove={removeItem}
              onChangeStatus={changeStatus}
            />
            <Section
              status="to_watch"
              items={byStatus("to_watch")}
              onRemove={removeItem}
              onChangeStatus={changeStatus}
            />
            <Section
              status="watched"
              items={byStatus("watched")}
              onRemove={removeItem}
              onChangeStatus={changeStatus}
            />
          </>
        )}
      </div>

      <style jsx>{`
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          min-height: 100vh;
          background: #080810;
        }
        .page-header {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 28px;
        }
        .page-title {
          color: #e8e8f2;
          font-size: 1.8rem;
          font-weight: 800;
        }
        .total-badge {
          color: #8888aa;
          font-size: 14px;
        }
        .filters-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 36px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .filter-group {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .sort-group {
          margin-left: auto;
        }
        .filter-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #8888aa;
          font-size: 12px;
          font-weight: 500;
          padding: 5px 13px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-btn:hover {
          border-color: rgba(212, 175, 55, 0.25);
          color: #c8c8e0;
        }
        .filter-btn.active {
          background: rgba(212, 175, 55, 0.13);
          border-color: rgba(212, 175, 55, 0.4);
          color: #d4af37;
        }
        .loading-text {
          color: #8888aa;
          font-size: 14px;
          text-align: center;
          padding: 60px 0;
        }
        .empty {
          text-align: center;
          color: #8888aa;
          padding: 80px 0;
          font-size: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        :global(.browse-link) {
          display: inline-block;
          color: #d4af37;
          text-decoration: none;
          font-size: 14px;
        }
        :global(.browse-link:hover) {
          text-decoration: underline;
        }
        .reset-btn {
          background: none;
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #d4af37;
          font-size: 13px;
          padding: 7px 18px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .reset-btn:hover {
          background: rgba(212, 175, 55, 0.1);
        }

        @media (max-width: 480px) {
          .page {
            padding: 24px 14px 60px;
          }
          .page-header {
            margin-bottom: 20px;
          }
          .page-title {
            font-size: 1.4rem;
          }
          .filters-bar {
            gap: 8px;
            margin-bottom: 24px;
          }
          .sort-group {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  );
}

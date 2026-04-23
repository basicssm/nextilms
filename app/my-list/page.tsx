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
import { TMDB_POSTER_SM } from "@/utils/constants";
import { WATCHLIST_STATUS_CONFIG as STATUS_CONFIG } from "@/utils/watchlistConfig";

type TypeFilter = "all" | "film" | "series";
type SortOrder = "recent" | "alpha";

function KanbanCard({
  item,
  onRemove,
  onChangeStatus,
}: {
  item: WatchlistItem;
  onRemove: () => void;
  onChangeStatus: (status: WatchlistStatus) => void;
}) {
  const poster = item.poster_path
    ? `${TMDB_POSTER_SM}${item.poster_path}`
    : `https://picsum.photos/seed/${item.film_id}/200/300`;

  const href = item.media_type === "series"
    ? `/series/${item.film_id}`
    : `/film/${item.film_id}`;

  const otherStatuses = (Object.keys(STATUS_CONFIG) as WatchlistStatus[]).filter(
    (s) => s !== item.status
  );

  return (
    <div className="kcard">
      <Link href={href} className="kcard-poster-link">
        <div className="kcard-poster-wrap">
          <Image
            src={poster}
            alt={item.film_title}
            fill
            sizes="80px"
            style={{ objectFit: "cover" }}
          />
        </div>
      </Link>

      <div className="kcard-body">
        <Link href={href} className="kcard-title-link">
          <p className="kcard-title">{item.film_title}</p>
        </Link>
        {item.media_type === "series" && (
          <span className="kcard-type">Serie</span>
        )}
        <div className="kcard-actions">
          {otherStatuses.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                className="move-btn"
                onClick={() => onChangeStatus(s)}
                title={`Mover a "${cfg.label}"`}
                style={{
                  "--move-color": cfg.colorVar,
                  "--move-bg": cfg.bgVar,
                  "--move-border": cfg.borderVar,
                } as React.CSSProperties}
              >
                <span>{cfg.icon}</span>
                <span className="move-label">{cfg.label}</span>
              </button>
            );
          })}
          <button
            className="remove-btn"
            onClick={onRemove}
            title="Quitar de la lista"
            aria-label="Quitar"
          >
            <span>✕</span>
            <span className="move-label">Quitar</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .kcard {
          display: flex;
          gap: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px;
          align-items: flex-start;
          position: relative;
          transition: border-color 0.15s, background 0.15s;
          animation: fadeInUp 0.25s ease;
        }
        .kcard:hover {
          border-color: var(--border-hover);
          background: var(--surface);
        }
        :global(.kcard-poster-link) {
          flex-shrink: 0;
          display: block;
        }
        .kcard-poster-wrap {
          position: relative;
          width: 52px;
          height: 78px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--surface);
          flex-shrink: 0;
        }
        .kcard-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        :global(.kcard-title-link) {
          text-decoration: none;
        }
        .kcard-title {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        :global(.kcard-title-link:hover) .kcard-title {
          color: var(--accent);
        }
        .kcard-type {
          align-self: flex-start;
          background: rgba(108, 99, 255, 0.08);
          border: 1px solid rgba(108, 99, 255, 0.2);
          color: var(--accent);
          font-size: 9px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .kcard-actions {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          align-items: center;
        }
        .move-btn,
        .remove-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .move-btn:hover {
          background: var(--move-bg);
          border-color: var(--move-border);
          color: var(--move-color);
        }
        .remove-btn:hover {
          background: rgba(255, 101, 132, 0.1);
          border-color: rgba(255, 101, 132, 0.35);
          color: #ff6584;
        }
        .move-label {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}

function KanbanColumn({
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

  return (
    <div
      className="column"
      style={{
        "--col-color": cfg.colorVar,
        "--col-bg": cfg.bgVar,
        "--col-border": cfg.borderVar,
      } as React.CSSProperties}
    >
      <div className="col-header">
        <span className="col-icon">{cfg.icon}</span>
        <span className="col-label">{cfg.label}</span>
        <span className="col-count">{items.length}</span>
      </div>

      <div className="col-body">
        {items.length === 0 ? (
          <div className="col-empty">
            <span>Nada aquí todavía</span>
          </div>
        ) : (
          items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onChangeStatus={(s) => onChangeStatus(item.id, s)}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .column {
          flex: 1;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          gap: 0;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .col-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 16px 14px;
          border-bottom: 1px solid var(--border);
          background: var(--col-bg);
        }

        .col-icon {
          font-size: 13px;
          color: var(--col-color);
        }

        .col-label {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--col-color);
          flex: 1;
        }

        .col-count {
          background: var(--col-bg);
          border: 1px solid var(--col-border);
          color: var(--col-color);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .col-body {
          flex: 1;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          min-height: 120px;
          max-height: calc(100vh - 280px);
        }

        .col-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          color: var(--text-subtle);
          font-size: 13px;
          text-align: center;
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
}

export default function MyListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { items, loading, removeItem, changeStatus } = useFullWatchlist();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [mobileTab, setMobileTab] = useState<WatchlistStatus>("watching");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as TypeFilter;
    const sort = params.get("sort") as SortOrder;
    if (type && (["all", "film", "series"] as string[]).includes(type)) setTypeFilter(type);
    if (sort && (["recent", "alpha"] as string[]).includes(sort)) setSortOrder(sort);
  }, []);

  const handleTypeFilter = (id: TypeFilter) => {
    setTypeFilter(id);
    const params = new URLSearchParams(window.location.search);
    params.set("type", id);
    router.replace(`/my-list?${params.toString()}`, { scroll: false });
  };

  const handleSortOrder = (order: SortOrder) => {
    setSortOrder(order);
    const params = new URLSearchParams(window.location.search);
    params.set("sort", order);
    router.replace(`/my-list?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="loading-page">
        <div className="loading-dots">
          <span className="ld" />
          <span className="ld" />
          <span className="ld" />
        </div>
        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: var(--bg);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-dots {
            display: flex;
            gap: 8px;
          }
          .ld {
            width: 8px;
            height: 8px;
            background: var(--accent);
            border-radius: 50%;
            animation: dotPulse 1.2s ease infinite;
            opacity: 0.3;
          }
          .ld:nth-child(2) { animation-delay: 0.2s; }
          .ld:nth-child(3) { animation-delay: 0.4s; }
          @keyframes dotPulse {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.8; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  const filtered = items
    .filter((i: WatchlistItem) => {
      if (typeFilter === "all") return true;
      return (i.media_type ?? "film") === typeFilter;
    })
    .sort((a: WatchlistItem, b: WatchlistItem) => {
      if (sortOrder === "alpha") return a.film_title.localeCompare(b.film_title, "es");
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const total = items.length;
  const byStatus = (s: WatchlistStatus) => filtered.filter((i: WatchlistItem) => i.status === s);

  return (
    <>
      <NavBar>
        <Back />
      </NavBar>

      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div className="header-top">
            <h1 className="page-title">Mi Lista</h1>
            {total > 0 && (
              <span className="total-badge">{total} {total === 1 ? "título" : "títulos"}</span>
            )}
          </div>

          {/* Filtros */}
          {total > 0 && (
            <div className="filters">
              <div className="filter-group">
                {([
                  { id: "all",    label: "Todo" },
                  { id: "film",   label: "Películas" },
                  { id: "series", label: "Series" },
                ] as { id: TypeFilter; label: string }[]).map(({ id, label }) => (
                  <button
                    key={id}
                    className={`filter-chip${typeFilter === id ? " active" : ""}`}
                    onClick={() => handleTypeFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="filter-group sort-group">
                <button
                  className={`filter-chip${sortOrder === "recent" ? " active" : ""}`}
                  onClick={() => handleSortOrder("recent")}
                >
                  Recientes
                </button>
                <button
                  className={`filter-chip${sortOrder === "alpha" ? " active" : ""}`}
                  onClick={() => handleSortOrder("alpha")}
                >
                  A–Z
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">Cargando tu lista...</div>
        ) : total === 0 ? (
          <div className="empty-state">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.2" />
              <path d="M20 28h16M28 20v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
            </svg>
            <p className="empty-title">Tu lista está más vacía que un lunes</p>
            <p className="empty-sub">Añade películas o series que quieras ver y organízalas aquí</p>
            <Link href="/" className="empty-cta">Explorar contenido →</Link>
          </div>
        ) : (
          <>
            {/* Kanban desktop */}
            <div className="kanban">
              {(["watching", "to_watch", "watched"] as WatchlistStatus[]).map((s) => (
                <KanbanColumn
                  key={s}
                  status={s}
                  items={byStatus(s)}
                  onRemove={removeItem}
                  onChangeStatus={changeStatus}
                />
              ))}
            </div>

            {/* Mobile: tabs + columna activa */}
            <div className="mobile-view">
              <div className="mobile-tabs">
                {(["watching", "to_watch", "watched"] as WatchlistStatus[]).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const count = byStatus(s).length;
                  return (
                    <button
                      key={s}
                      className={`mobile-tab${mobileTab === s ? " active" : ""}`}
                      onClick={() => setMobileTab(s)}
                      style={{
                        "--tab-color": cfg.colorVar,
                        "--tab-bg": cfg.bgVar,
                        "--tab-border": cfg.borderVar,
                      } as React.CSSProperties}
                    >
                      {cfg.icon} {cfg.label}
                      {count > 0 && <span className="tab-count">{count}</span>}
                    </button>
                  );
                })}
              </div>

              <div className="mobile-list">
                {byStatus(mobileTab).length === 0 ? (
                  <div className="mobile-empty">Nada aquí todavía</div>
                ) : (
                  byStatus(mobileTab).map((item) => (
                    <KanbanCard
                      key={item.id}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                      onChangeStatus={(s) => changeStatus(item.id, s)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 32px 96px;
          min-height: 100vh;
        }

        /* Header */
        .page-header {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header-top {
          display: flex;
          align-items: baseline;
          gap: 14px;
        }

        .page-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text);
        }

        .total-badge {
          font-family: var(--font-mono);
          color: var(--text-muted);
          font-size: 13px;
        }

        /* Filtros */
        .filters {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          gap: 6px;
        }

        .sort-group {
          margin-left: auto;
        }

        .filter-chip {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .filter-chip:hover {
          border-color: var(--border-hover);
          color: var(--text);
          background: var(--surface-hover);
        }

        .filter-chip.active {
          background: rgba(108, 99, 255, 0.1);
          border-color: rgba(108, 99, 255, 0.35);
          color: var(--accent);
        }

        /* Kanban (desktop) */
        .kanban {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        /* Mobile view */
        .mobile-view {
          display: none;
        }

        .mobile-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }

        .mobile-tabs::-webkit-scrollbar {
          display: none;
        }

        .mobile-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .mobile-tab.active {
          background: var(--tab-bg);
          border-color: var(--tab-border);
          color: var(--tab-color);
        }

        .tab-count {
          background: currentColor;
          color: var(--bg);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 10px;
          opacity: 0.85;
        }

        .mobile-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-empty {
          text-align: center;
          color: var(--text-subtle);
          font-size: 13px;
          padding: 40px 0;
        }

        /* States */
        .loading-state {
          color: var(--text-muted);
          font-size: 14px;
          text-align: center;
          padding: 80px 0;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 80px 0;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: -0.01em;
          margin-top: 4px;
        }

        .empty-sub {
          font-size: 14px;
          color: var(--text-subtle);
          max-width: 320px;
          line-height: 1.6;
        }

        :global(.empty-cta) {
          display: inline-block;
          margin-top: 8px;
          color: var(--accent);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        :global(.empty-cta:hover) {
          opacity: 0.8;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .kanban {
            display: none;
          }
          .mobile-view {
            display: block;
          }
        }

        @media (max-width: 480px) {
          .page {
            padding: 24px 14px 72px;
          }
          .page-title {
            font-size: 1.6rem;
          }
          .filters {
            gap: 8px;
          }
          .sort-group {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  );
}

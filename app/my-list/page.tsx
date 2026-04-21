"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import NavUserMenu from "@/components/NavUserMenu";
import { useAuth } from "@/context/AuthContext";
import { useFullWatchlist } from "@/hooks/useWatchlist";
import { WatchlistItem, WatchlistStatus } from "@/types";

const STATUS_CONFIG: Record<
  WatchlistStatus,
  { label: string; icon: string; color: string }
> = {
  watching: { label: "Viendo ahora", icon: "▶", color: "#3b82f6" },
  to_watch: { label: "Quiero ver", icon: "🔖", color: "#8b5cf6" },
  watched: { label: "Ya vistas", icon: "✓", color: "#22c55e" },
};

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

  const otherStatuses = (
    Object.keys(STATUS_CONFIG) as WatchlistStatus[]
  ).filter((s) => s !== item.status);

  return (
    <div className="card">
      <Link href={`/film/${item.film_id}`} className="card-img-link">
        <Image
          src={poster}
          alt={item.film_title}
          width={120}
          height={180}
          style={{ borderRadius: 8, display: "block" }}
        />
      </Link>
      <p className="card-title">{item.film_title}</p>

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
          display: flex;
          flex-direction: column;
          gap: 8px;
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

        @media (max-width: 480px) {
          .section {
            margin-bottom: 36px;
          }
          .section-grid {
            gap: 14px;
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

  const byStatus = (s: WatchlistStatus) =>
    items.filter((i) => i.status === s);
  const total = items.length;

  return (
    <>
      <NavBar>
        <NavUserMenu />
      </NavBar>

      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Mi Lista</h1>
          {total > 0 && (
            <span className="total-badge">
              {total} {total === 1 ? "título" : "títulos"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="loading-text">Cargando tu lista...</div>
        ) : total === 0 ? (
          <div className="empty">
            <p>Tu lista está vacía.</p>
            <Link href="/" className="browse-link">
              Explorar películas →
            </Link>
          </div>
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
          margin-bottom: 44px;
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
        }
        :global(.browse-link) {
          display: inline-block;
          margin-top: 16px;
          color: #d4af37;
          text-decoration: none;
          font-size: 14px;
        }
        :global(.browse-link:hover) {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .page {
            padding: 24px 14px 60px;
          }
          .page-header {
            margin-bottom: 28px;
          }
          .page-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </>
  );
}

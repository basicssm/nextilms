"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { Film } from "@/types";

type MediaType = "film" | "series";

export default function SearchBar({ mediaType }: { mediaType: MediaType }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { results, loading } = useSearchSuggestions(searchText, mediaType);

  const showDropdown =
    focused && searchText.length >= 3 && (loading || results.length > 0);

  function navigate() {
    if (searchText.trim())
      router.push(`/search/${searchText.trim()}?mediaType=${mediaType}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") navigate();
    if (e.key === "Escape") setFocused(false);
  }

  function handleResultClick(film: Film) {
    const path = film.mediaType === "series" ? `/series/${film.id}` : `/film/${film.id}`;
    router.push(path);
    setSearchText("");
    setFocused(false);
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setFocused(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <div ref={wrapperRef} className="search-wrapper">
      <div className={`search-bar${focused ? " focused" : ""}`}>
        <span className="search-icon">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
        <input
          type="text"
          placeholder="Buscar películas y series..."
          value={searchText}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchText(e.target.value)
          }
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          autoComplete="off"
        />
        {searchText && (
          <button
            className="search-clear"
            onClick={() => setSearchText("")}
            aria-label="Limpiar"
          >
            ✕
          </button>
        )}
        <button className="search-submit" onClick={navigate} aria-label="Buscar">
          Buscar
        </button>
      </div>

      {showDropdown && (
        <div className="dropdown" role="listbox">
          {loading && results.length === 0 && (
            <div className="dropdown-loading">
              <span className="spinner" />
            </div>
          )}
          {results.map((film) => (
            <button
              key={film.id}
              className="dropdown-item"
              role="option"
              onMouseDown={() => handleResultClick(film)}
            >
              {film.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w92${film.poster_path}`}
                  alt={film.title}
                  width={32}
                  height={48}
                  className="item-poster"
                  unoptimized
                />
              ) : (
                <div className="item-poster-placeholder" />
              )}
              <div className="item-info">
                <span className="item-title">{film.title}</span>
                <span className="item-meta">
                  {film.mediaType === "series" ? "Serie" : "Película"}
                  {film.release_date ? ` · ${film.release_date.slice(0, 4)}` : ""}
                </span>
              </div>
            </button>
          ))}
          {results.length > 0 && (
            <button className="dropdown-all" onMouseDown={navigate}>
              Ver todos los resultados para «{searchText}»
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 560px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-lg);
          padding: 10px 12px 10px 16px;
          gap: 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-bar.focused {
          border-color: rgba(108, 99, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
        }

        .search-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          flex-shrink: 0;
          font-size: 14px;
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: var(--font-body);
          font-size: 15px;
          min-width: 0;
        }

        .search-bar input::placeholder {
          color: var(--text-subtle);
        }

        .search-clear {
          background: none;
          border: none;
          color: var(--text-subtle);
          font-size: 12px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          transition: color 0.15s;
          flex-shrink: 0;
        }

        .search-clear:hover {
          color: var(--text-muted);
        }

        .search-submit {
          background: var(--accent-gradient);
          border: none;
          color: #fff;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .search-submit:hover {
          opacity: 0.9;
        }

        .search-submit:active {
          transform: scale(0.97);
        }

        /* ── Dropdown ── */
        .dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-lg);
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .dropdown-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(212, 175, 55, 0.18);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          background: none;
          border: none;
          border-bottom: 1px solid var(--border);
          padding: 8px 14px;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
          color: var(--text);
        }

        .dropdown-item:last-of-type {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        :global(.item-poster) {
          border-radius: 4px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .item-poster-placeholder {
          width: 32px;
          height: 48px;
          background: var(--border);
          border-radius: 4px;
          flex-shrink: 0;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .item-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-meta {
          font-size: 12px;
          color: var(--text-muted);
        }

        .dropdown-all {
          display: block;
          width: 100%;
          background: none;
          border: none;
          border-top: 1px solid var(--border-hover);
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          padding: 10px 14px;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }

        .dropdown-all:hover {
          background: rgba(108, 99, 255, 0.08);
        }

        @media (max-width: 480px) {
          .search-bar {
            padding: 9px 10px 9px 14px;
          }
          .search-submit {
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
}

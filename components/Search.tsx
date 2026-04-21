"use client";

import { ChangeEvent, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        e.preventDefault();
        if (searchText) router.push(`/search/${searchText}`);
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [searchText, router]);

  return (
    <>
      <div className="search">
        <input
          type="text"
          placeholder="Buscar películas..."
          value={searchText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
        />
        <button
          type="submit"
          onClick={() => searchText && router.push(`/search/${searchText}`)}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
      <style jsx>{`
        .search {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 6px;
          padding: 7px 12px;
          transition: border-color 0.2s, background 0.2s;
        }
        .search:focus-within {
          border-color: rgba(212, 175, 55, 0.45);
          background: rgba(255, 255, 255, 0.07);
        }
        input {
          background: none;
          border: none;
          outline: none;
          color: #e8e8f2;
          font-size: 13px;
          width: 160px;
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.28);
        }
        button {
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          color: rgba(212, 175, 55, 0.55);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        button:hover {
          color: #d4af37;
        }
        button :global(svg) {
          width: 15px;
          height: 15px;
          fill: currentColor;
        }
      `}</style>
    </>
  );
}

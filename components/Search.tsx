import { ChangeEvent, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { faFilm } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        e.preventDefault();
        searchFilms();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  });

  const searchFilms = async () => {
    if (!searchText) return;
    router.push(`/search/${searchText}`);
  };

  const handleInputChange = (e: ChangeEvent) => {
    const element = e.currentTarget as HTMLInputElement;

    setSearchText(element.value);
  };

  return (
    <>
      <div className="growing-search">
        <div className="input">
          <input type="text" onChange={handleInputChange} />
        </div>
        <div className="submit">
          <button type="submit" onClick={searchFilms}>
            <FontAwesomeIcon icon={faFilm} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .growing-search {
          padding: 5px 5px 5px 7px;
          border-radius: 5px;
          background: #fff;
        }

        .growing-search div {
          display: inline-block;
          font-size: 12px;
        }

        .growing-search .input input {
          margin-right: 0;
          border: none;
          font-size: inherit;
          transition: width 200ms;
          padding-top: 5px;
          padding-left: 5px;
          padding-bottom: 5px;
          width: 55px;
          color: #aaa;
          border-bottom: 1px solid #eee;
        }

        .growing-search .input input:focus {
          width: 150px;
        }

        .growing-search .submit button {
          margin-left: 0;
          border: none;
          font-size: 1.15em;
          color: #aaa;
          background-color: #fff;
          padding-top: 2px;
          padding-bottom: 2px;
          transition: color 200ms;
        }

        .growing-search .submit button svg {
          width: 24px;
          height: 24px;
          fill: #aaa;
        }

        .growing-search .input input:hover,
        .growing-search .submit button:hover {
          cursor: pointer;
        }

        .growing-search .input input:focus,
        .growing-search .submit button:focus {
          outline: none;
        }

        .growing-search .submit button:hover {
          color: #3498db;
        }
      `}</style>
    </>
  );
}

"use client";

import Head from "next/head";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useState, useEffect } from "react";
import { film } from "@/types";
import NavBar from "@/components/NavBar";
import Films from "@/components/Films";
import Search from "@/components/Search";
import Back from "@/components/Back";

export default function SearchPage({
  params,
}: {
  params: { search_param: string };
}) {
  const [films, setFilms] = useState<[film] | []>([]);
  const { search_param } = params;

  useEffect(() => {
    try {
      getFilms(search_param);
    } catch (err) {
      console.log("fetch error:", err);
    }
  }, [search_param]);

  const getFilms = async (query: string | string[] | undefined) => {
    const res = await fetch(
      `${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}&page=1&include_adult=false`
    );
    const data = await res.json();
    const films: [film] = data?.results?.map(
      ({ id, title, poster_path }: film) => ({ id, title, poster_path })
    );
    setFilms(films);
  };

  return (
    <>
      <Head>
        <title>Films</title>
        <meta name="description" content="Films" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <NavBar>
        <div className="searchNav">
          <Back />
          <Search />
        </div>
      </NavBar>
      <Films films={films} />
      <style jsx>{`
        .searchNav {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
      `}</style>
    </>
  );
}

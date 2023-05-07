"use client";

import Head from "next/head";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { useState, useEffect } from "react";
import { film } from "@/types";
import NavBar from "@/components/NavBar";
import Films from "@/components/Films";
import Search from "@/components/Search";

export default function Home() {
  const [films, setFilms] = useState<[film] | []>([]);

  useEffect(() => {
    try {
      getFilms();
    } catch (err) {
      console.log("fetch error:", err);
    }
  }, []);

  const getFilms = async () => {
    const res = await fetch(
      `${API_BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES`
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
        <Search />
      </NavBar>
      <Films films={films} />
    </>
  );
}

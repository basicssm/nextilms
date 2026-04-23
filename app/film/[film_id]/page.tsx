"use client";

import { use } from "react";
import useSWR from "swr";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import { WatchProvider } from "@/types";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import Detail from "@/components/Detail";
import CastSection from "@/components/CastSection";
import RelatedTitles from "@/components/RelatedTitles";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DetailPage({
  params,
}: {
  params: Promise<{ film_id: string }>;
}) {
  const { film_id } = use(params);
  const { data, error } = useSWR(
    `${API_BASE_URL}/movie/${film_id}?api_key=${API_KEY}&language=es-ES`,
    fetcher
  );

  const { data: videoData, error: videoError } = useSWR(
    `${API_BASE_URL}/movie/${film_id}/videos?api_key=${API_KEY}&language=es-ES`,
    fetcher
  );

  const { data: providersData } = useSWR(
    `${API_BASE_URL}/movie/${film_id}/watch/providers?api_key=${API_KEY}`,
    fetcher
  );

  if (error)
    return (
      <>
        <NavBar>
          <Back />
        </NavBar>
        <p style={{ color: "#8888aa", textAlign: "center", padding: "80px 20px" }}>
          Error al cargar la película
        </p>
      </>
    );

  if (!data)
    return (
      <>
        <NavBar>
          <Back />
        </NavBar>
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 20px" }}>
          <span className="spinner" />
          <style jsx>{`
            .spinner {
              display: inline-block;
              width: 36px;
              height: 36px;
              border: 3px solid rgba(212, 175, 55, 0.18);
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
      </>
    );

  const videoList = videoError ? [] : (videoData?.results ?? []);
  const esRegion = providersData?.results?.ES;
  const watchProviders: WatchProvider[] = esRegion?.flatrate ?? esRegion?.free ?? [];

  return (
    <>
      <NavBar>
        <Back />
      </NavBar>
      <Detail film={{ ...data, watch_providers: watchProviders }} videos={videoList} mediaType="film" />
      <CastSection filmId={Number(film_id)} mediaType="film" />
      <RelatedTitles filmId={Number(film_id)} mediaType="film" />
    </>
  );
}

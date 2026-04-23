"use client";

import { use } from "react";
import useSWR from "swr";
import { API_KEY, API_BASE_URL } from "@/apiconfig";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import Detail from "@/components/Detail";
import CastSection from "@/components/CastSection";
import RelatedTitles from "@/components/RelatedTitles";
import { FilmDetail, WatchProvider } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ series_id: string }>;
}) {
  const { series_id } = use(params);

  const { data, error } = useSWR(
    `${API_BASE_URL}/tv/${series_id}?api_key=${API_KEY}&language=es-ES`,
    fetcher
  );

  const { data: videoData, error: videoError } = useSWR(
    `${API_BASE_URL}/tv/${series_id}/videos?api_key=${API_KEY}&language=es-ES`,
    fetcher
  );

  const { data: providersData } = useSWR(
    `${API_BASE_URL}/tv/${series_id}/watch/providers?api_key=${API_KEY}`,
    fetcher
  );

  if (error)
    return (
      <>
        <NavBar>
          <Back />
        </NavBar>
        <p style={{ color: "#8888aa", textAlign: "center", padding: "80px 20px" }}>
          Error al cargar la serie
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

  const esRegion = providersData?.results?.ES;
  const watchProviders: WatchProvider[] = esRegion?.flatrate ?? esRegion?.free ?? [];

  const normalized: FilmDetail = {
    id: data.id,
    title: data.name,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    overview: data.overview,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    genres: data.genres,
    runtime: data.episode_run_time?.[0],
    release_date: data.first_air_date,
    watch_providers: watchProviders,
  };

  const seriesInfo = {
    seasons: data.number_of_seasons,
    episodes: data.number_of_episodes,
    seasonsList: (data.seasons ?? []) as {
      id: number;
      name: string;
      season_number: number;
      episode_count: number;
    }[],
  };

  const videoList = videoError ? [] : (videoData?.results ?? []);

  return (
    <>
      <NavBar>
        <Back />
      </NavBar>
      <Detail film={normalized} videos={videoList} seriesInfo={seriesInfo} mediaType="series" />
      <CastSection filmId={Number(series_id)} mediaType="series" />
      <RelatedTitles filmId={Number(series_id)} mediaType="series" />
    </>
  );
}

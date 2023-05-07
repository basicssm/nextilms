import Head from "next/head";
import useSWR from "swr";
import { useRouter } from "next/router";
import { API_KEY, API_BASE_URL } from "../../apiconfig";
import NavBar from "@/components/NavBar";
import Back from "@/components/Back";
import Detail from "@/components/Detail";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DetailPage() {
  const router = useRouter();
  const { film_id } = router.query;
  const { data, error } = useSWR(
    `${API_BASE_URL}/movie/${film_id}?api_key=${API_KEY}&language=es-ES`,
    fetcher
  );

  const { data: videoData, error: videoError } = useSWR(
    `${API_BASE_URL}/movie/${film_id}/videos?api_key=${API_KEY}&language=es-ES`,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
    <>
      <Head>
        <title>Films</title>
        <meta name="description" content="Films page detail example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <NavBar>
        <Back />
      </NavBar>
      <Detail film={data} videos={videoError ? [] : videoData} />
    </>
  );
}

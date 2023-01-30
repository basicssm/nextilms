import Image from "next/image";
import { Inter } from "@next/font/google";
import YouTube from "react-youtube";
import { filmDetail } from "@/types";

const inter = Inter({ subsets: ["latin"] });
const imageDimensions: { width: number; heigth: number } = {
  width: 300,
  heigth: 450,
};
const opts: videoOptions = {
  height: "195",
  width: "320",
  playerVars: {
    autoplay: 0,
    rel: 0,
  },
};

type videoOptions = {
  height: string;
  width: string;
  playerVars: {
    autoplay: number;
    rel: number;
  };
};

export default function Detail(props: { film: filmDetail; videos: [] }) {
  const { film, videos } = props;
  const poster = `https://image.tmdb.org/t/p/w${imageDimensions.width}_and_h${imageDimensions.heigth}_bestv2${film.poster_path}`;

  return (
    <main className={`main ${inter.className}`}>
      <div className="column">
        <Image
          className="poster"
          src={poster}
          alt="data.title"
          width={imageDimensions.width}
          height={imageDimensions.heigth}
        ></Image>
      </div>
      <div className="column">
        <h2>{film.title}</h2>
        <p className="overview">{film.overview}</p>
        <h2>Puntuación: {film.vote_average}</h2>
        <h2>Votos: {film.vote_count}</h2>
      </div>
      <div className="column">
        <h1> VIDEOS </h1>
        {videos?.length
          ? videos?.map(({ key }: { key: string }) => (
              <YouTube key={key} videoId={key} opts={opts} />
            ))
          : ""}
      </div>
      <style jsx>{`
        .main {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
        }

        .column {
          width: 40%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .overview {
          width: 100%;
        }

        @media (min-width: 333px) and (max-width: 890px) {
          .main {
            flex-direction: column;
            align-items: center;
          }

          .poster {
            heigth: auto;
          }

          .column {
            width: 80%;
            align-items: center;
          }
        }
      `}</style>
    </main>
  );
}

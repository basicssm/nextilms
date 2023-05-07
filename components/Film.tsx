import Link from "next/link";
import Image from "next/image";
import { film as filmType } from "@/types";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Film(props: { film: filmType }) {
  const { id, title, poster_path } = props.film;

  const poster = `https://image.tmdb.org/t/p/w150_and_h225_bestv2${poster_path}`;

  return (
    <div className="wrapper">
      <Link href={`/film/${id}`} style={{ textDecoration: "none" }}>
        <div className="film">
          <Image
            className="image"
            src={poster_path ? poster : "https://picsum.photos/id/444/150/225"}
            alt={title}
            width={150}
            height={225}
          ></Image>
          <div className={`title ${inter.className}`}>{title}</div>
        </div>
      </Link>
      <style jsx>{`
        .wrapper {
          padding: 6px;
          width: 150px;
          height: 280px;
        }

        .film {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }

        .image {
          border-radius: 50px;
        }

        .title {
          padding: 5px;
          heigth: 32px;
          text-align: center;
          color: #111;
        }
      `}</style>
    </div>
  );
}

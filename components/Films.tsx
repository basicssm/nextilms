import { film } from "@/types";
import Film from "./Film";

export default function Films(props: { films: [film] | [] }) {
  const { films } = props;

  if (films.length) {
    return (
      <div className="wrapper">
        {films.map((film: film, i: number) => {
          return <Film key={i} film={film} />;
        })}
        <style jsx>
          {`
            .wrapper {
              display: flex;
              flex-direction: row;
              justify-content: space-around;
              flex-wrap: wrap;
              align-items: flex-start;
              padding: 1rem;
            }
          `}
        </style>
      </div>
    );
  }

  return <h1>No se han encontrados peliculas para esta busqueda</h1>;
}

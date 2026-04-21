import { film } from "@/types";
import Film from "./Film";

export default function Films({
  films,
  loading,
  mediaType = "film",
}: {
  films: film[];
  loading?: boolean;
  mediaType?: "film" | "series";
}) {
  if (!films.length) {
    if (loading) return null;
    return (
      <p className="empty">
        No se encontraron resultados
        <style jsx>{`
          .empty {
            color: #8888aa;
            text-align: center;
            padding: 80px 20px;
            font-size: 15px;
          }
        `}</style>
      </p>
    );
  }

  return (
    <section className="grid">
      {films.map((film: film) => (
        <Film key={film.id} film={film} mediaType={mediaType} />
      ))}
      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 480px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 16px 12px;
          }
        }
      `}</style>
    </section>
  );
}

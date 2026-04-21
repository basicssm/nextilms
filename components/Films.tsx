import { film } from "@/types";
import Film from "./Film";

export default function Films({ films, loading }: { films: film[]; loading?: boolean }) {
  if (!films.length) {
    if (loading) return null;
    return (
      <p className="empty">
        No se encontraron películas
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
        <Film key={film.id} film={film} />
      ))}
      <style jsx>{`
        .grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 28px 24px;
          justify-content: center;
        }
      `}</style>
    </section>
  );
}

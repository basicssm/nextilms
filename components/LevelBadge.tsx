"use client";

const LEVEL_COLORS: Record<number, string> = {
  1: "var(--level-1-color)",
  2: "var(--level-2-color)",
  3: "var(--level-3-color)",
  4: "var(--level-4-color)",
  5: "var(--level-5-color)",
};

export default function LevelBadge({ level }: { level: number }) {
  const color = LEVEL_COLORS[level] ?? "var(--level-1-color)";

  return (
    <span className="level-badge" style={{ "--lvl-color": color } as React.CSSProperties}>
      Nv.{level}
      <style jsx>{`
        .level-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          border-radius: 20px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--lvl-color);
          background: color-mix(in srgb, var(--lvl-color) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--lvl-color) 35%, transparent);
          white-space: nowrap;
          line-height: 1.4;
        }
        @media (max-width: 360px) {
          .level-badge {
            display: none;
          }
        }
      `}</style>
    </span>
  );
}

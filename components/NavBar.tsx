import Link from "next/link";
import { ReactNode } from "react";
import NavUserMenu from "@/components/NavUserMenu";

export default function NavBar({ children }: { children?: ReactNode }) {
  return (
    <header>
      <nav className="nav">
        <div className="nav-left">{children}</div>
        <Link href="/" className="brand">whatwatch</Link>
        <div className="nav-right">
          <NavUserMenu />
        </div>
      </nav>
      <style jsx>{`
        header {
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .nav {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 10px 24px;
          background: rgba(8, 8, 16, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.12);
        }
        .nav-left {
          display: flex;
          align-items: center;
        }
        :global(.brand) {
          font-family: var(--font-bebas), sans-serif;
          font-size: 32px;
          font-weight: 400;
          letter-spacing: 0.06em;
          color: #d4af37;
          text-decoration: none;
          text-align: center;
          line-height: 1;
          padding: 2px 0;
          transition: opacity 0.2s;
        }
        :global(.brand:hover) {
          opacity: 0.75;
        }
        .nav-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        @media (max-width: 480px) {
          .nav {
            padding: 10px 12px;
          }
          :global(.brand) {
            font-size: 26px;
          }
        }
      `}</style>
    </header>
  );
}

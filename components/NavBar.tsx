"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import NavUserMenu from "@/components/NavUserMenu";

export default function NavBar({ children }: { children?: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={scrolled ? "scrolled" : ""}>
      <nav className="nav">
        <div className="nav-left">{children}</div>
        <Link href="/" className="brand">
          <span className="brand-w">W</span>
          <span className="brand-rest">hatWatch</span>
        </Link>
        <div className="nav-right">
          <NavUserMenu />
        </div>
      </nav>
      <style jsx>{`
        header {
          position: sticky;
          top: 0;
          z-index: 30;
          padding-top: env(safe-area-inset-top);
          background: rgba(10, 10, 15, 0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        header.scrolled {
          background: rgba(10, 10, 15, 0.92);
          border-bottom-color: var(--border-hover);
        }
        .nav {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 64px;
          padding: 0 24px;
          transition: height 0.25s ease;
        }
        header.scrolled .nav {
          height: 52px;
        }
        .nav-left {
          display: flex;
          align-items: center;
        }
        :global(.brand) {
          font-family: var(--font-syne), sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.01em;
          text-decoration: none;
          text-align: center;
          line-height: 1;
          display: flex;
          align-items: center;
          transition: opacity 0.2s;
        }
        :global(.brand:hover) {
          opacity: 0.8;
        }
        :global(.brand-w) {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 26px;
        }
        :global(.brand-rest) {
          color: var(--text);
        }
        .nav-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        @media (max-width: 480px) {
          .nav {
            padding: 0 14px;
            height: 56px;
          }
          header.scrolled .nav {
            height: 48px;
          }
          :global(.brand) {
            font-size: 18px;
          }
          :global(.brand-w) {
            font-size: 22px;
          }
        }
      `}</style>
    </header>
  );
}

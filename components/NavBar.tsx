import Image from "next/image";
import Link from "next/link";
import { ReactElement } from "react";

export default function NavBar({ children }: { children: ReactElement }) {
  return (
    <header>
      <nav className="nav">
        <Link href="/" className="logo-link">
          <Image src="/logo.png" height={44} width={44} alt="FILMS" />
        </Link>
        {children}
      </nav>
      <style jsx>{`
        header {
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .nav {
          display: flex;
          padding: 12px 24px;
          justify-content: space-between;
          align-items: center;
          background: rgba(8, 8, 16, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.12);
        }
        :global(.logo-link) {
          opacity: 0.85;
          transition: opacity 0.2s;
          display: block;
        }
        :global(.logo-link:hover) {
          opacity: 1;
        }
      `}</style>
    </header>
  );
}

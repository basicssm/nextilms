import Image from "next/image";
import Link from "next/link";
import { ReactElement } from "react";

export default function NavBar({ children }: { children: ReactElement }) {
  return (
    <header>
      <nav className="nav">
        <Link href="/">
          <Image src="/logo.png" height={64} width={64} alt="FILMS" />
        </Link>
        {children}
      </nav>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          outline: none;
          box-sizing: border-box;
          font-family: "Work Sans", sans-serif;
        }
        header {
          position: sticky;
          z-index: 30;
          top: 0;
        }
        nav {
          display: flex;
          padding: 16px;
          justify-content: space-between;
          align-items: center;
          background-color: #ddd;
        }
      `}</style>
    </header>
  );
}

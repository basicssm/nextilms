import type { Metadata } from "next";
import "@/styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

export const metadata: Metadata = {
  title: "Films",
  description: "Descubre películas populares",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head />
      <body>{children}</body>
    </html>
  );
}

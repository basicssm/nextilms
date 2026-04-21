import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Films",
  description: "Descubre películas populares",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

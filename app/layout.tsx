import type { Metadata, Viewport } from "next";
import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Providers from "@/components/Providers";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WhatWatch — Deja de buscar. Empieza a ver.",
  description: "Descubre y organiza tus películas y series favoritas",
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Aplica el color de acento guardado antes del primer render (evita flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=localStorage.getItem("ww-accent-override");if(a)document.documentElement.style.setProperty("--accent",a)}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

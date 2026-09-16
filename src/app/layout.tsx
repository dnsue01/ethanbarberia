import type { Metadata, Viewport } from "next";
import { Oswald, Rye, Caveat_Brush, Geist } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const oswald = Oswald({ subsets: ["latin"], variable: "--f-display" });
const rye = Rye({ weight: "400", subsets: ["latin"], variable: "--f-rotulo" });
const tiza = Caveat_Brush({ weight: "400", subsets: ["latin"], variable: "--f-tiza" });
const geist = Geist({ subsets: ["latin"], variable: "--f-body" });

const FRASE = "La perilla me pone perrilla y el flequillo me pone perrillo.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITIO ?? "https://labarberiadeethan.com"),
  title: "La Barbería de Ethan",
  description: `${FRASE} Camisetas, pomada y aceite de barba de la barbería de Ethan.`,
  openGraph: {
    title: "La Barbería de Ethan",
    description: FRASE,
    images: ["/be-fondo.webp"],
    locale: "es_ES",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0e0d0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${oswald.variable} ${rye.variable} ${tiza.variable} ${geist.variable}`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

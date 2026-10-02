import type { Metadata, Viewport } from "next";
import { Fraunces, Barlow_Condensed, Instrument_Sans } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

/* Serif con carácter para los titulares, condensada para etiquetas y precios,
   y una sans limpia para leer. */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--f-display",
});
const barlow = Barlow_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--f-etiqueta",
});
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--f-body" });

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

export const viewport: Viewport = { themeColor: "#efe8da" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${barlow.variable} ${instrument.variable}`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

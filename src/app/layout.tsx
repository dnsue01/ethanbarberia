import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { BASE, getCatalogo } from "@/lib/shopify";
import Cabecera from "@/components/Cabecera";
import Pie from "@/components/Pie";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";
import "@/components/tienda.css";
import "@/components/paneles.css";

const geist = Geist({ subsets: ["latin"], variable: "--f-body" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--f-mono" });

const FRASE = "La perilla me pone perrilla y el flequillo me pone perrillo.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITIO ?? "https://labarberiadeethan.com"),
  title: { default: "Ethan Barbershop", template: "%s · Ethan Barbershop" },
  description: `${FRASE} Camisetas con aire de barbería.`,
  openGraph: {
    title: "Ethan Barbershop",
    description: FRASE,
    images: [`${BASE}/be-fondo.webp`],
    locale: "es_ES",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { demo, pago } = await getCatalogo();
  return (
    <html lang="es">
      <body className={`${geist.variable} ${mono.variable}`} suppressHydrationWarning>
        <CartProvider>
          <a className="saltar" href="#contenido">
            Saltar al contenido
          </a>
          <Cabecera />
          <main id="contenido">{children}</main>
          <Pie />
          <CartDrawer demo={demo} pago={pago} />
        </CartProvider>
      </body>
    </html>
  );
}

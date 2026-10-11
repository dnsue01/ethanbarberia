import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalogo, sinHtml } from "@/lib/shopify";
import FichaProducto from "@/components/FichaProducto";
import Tarjeta from "@/components/Tarjeta";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return (await getCatalogo()).productos.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const p = (await getCatalogo()).productos.find((x) => x.handle === handle);
  if (!p) return {};
  return { title: p.title, description: sinHtml(p.body_html).slice(0, 160), openGraph: { images: p.images.slice(0, 1) } };
}

export default async function Producto({ params }: Props) {
  const { handle } = await params;
  const catalogo = await getCatalogo();
  const producto = catalogo.productos.find((x) => x.handle === handle);
  if (!producto) notFound();

  const otras = catalogo.productos.filter((x) => x.id !== producto.id).slice(0, 4);

  return (
    <>
      <section className="bloque pagina">
        <FichaProducto key={producto.id} producto={producto} demo={catalogo.demo} />
      </section>
      {otras.length > 0 && (
        <section className="bloque mas">
          <div className="bloque__cab">
            <h2>Más camisetas</h2>
          </div>
          <div className="rejilla">
            {otras.map((p) => (
              <Tarjeta key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

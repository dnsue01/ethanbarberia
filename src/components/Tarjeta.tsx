import Link from "next/link";
import type { Producto } from "@/lib/shopify";
import { euros, foto, fotoSet } from "@/lib/shopify";

/* Tarjeta de producto: la segunda foto (espalda) aparece al pasar el ratón. */
export default function Tarjeta({ producto, prioridad = false }: { producto: Producto; prioridad?: boolean }) {
  const agotado = producto.variants.every((v) => !v.available);
  const atras = producto.images[1];
  return (
    <Link className="tarjeta" href={`/producto/${producto.handle}`}>
      <span className="tarjeta__foto">
        <img
          src={foto(producto.images[0], 540)}
          srcSet={fotoSet(producto.images[0], 540)}
          alt=""
          loading={prioridad ? "eager" : "lazy"}
        />
        {atras && (
          <img className="tarjeta__atras" src={foto(atras, 540)} srcSet={fotoSet(atras, 540)} alt="" loading="lazy" />
        )}
        {agotado && <em>Agotado</em>}
      </span>
      <span className="tarjeta__pie">
        <span>{producto.title}</span>
        <b>{euros(producto.price)}</b>
      </span>
    </Link>
  );
}

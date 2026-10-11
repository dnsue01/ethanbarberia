import Link from "next/link";
import { BASE, getCatalogo } from "@/lib/shopify";
import Tarjeta from "@/components/Tarjeta";

function Cita({ children }: { children: string }) {
  return (
    <blockquote className="cita">
      <p>{children}</p>
    </blockquote>
  );
}


export default async function Inicio() {
  const { productos } = await getCatalogo();

  return (
    <>
      <section className="hero">
        <picture>
          <source media="(orientation: landscape)" srcSet={`${BASE}/ethan-barbershop-horizontal.jpg`} />
          <img
            className="hero__foto"
            src={`${BASE}/ethan-barbershop-vertical.jpg`}
            alt="Un barbero con traje negro y gafas de sol corta el pelo rizado a un cliente en la barbería"
          />
        </picture>
        <div className="hero__cuerpo">
          <p className="etiqueta">Barbershop · Camisetas</p>
          <h1>
            Ethan
            <br />
            Barbershop
          </h1>
          <Link className="boton boton--claro" href="/tienda">
            Ver camisetas
          </Link>
        </div>
      </section>

      <div className="poste" aria-hidden />

      <Cita>La perilla me pone perrilla.</Cita>

      {productos.length > 0 && (
        <section className="bloque">
          <div className="seccion__cab">
            <h2>Destacados</h2>
            <Link href="/tienda">Ver todo</Link>
          </div>
          <div className="rejilla">
            {productos.slice(0, 8).map((p, i) => (
              <Tarjeta key={p.id} producto={p} prioridad={i < 4} />
            ))}
          </div>
        </section>
      )}

      <Cita>El flequillo me pone perrillo.</Cita>
    </>
  );
}

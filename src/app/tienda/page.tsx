import { Suspense } from "react";
import type { Metadata } from "next";
import { getCatalogo } from "@/lib/shopify";
import Listado from "@/components/Listado";

export const metadata: Metadata = { title: "Camisetas" };

export default async function Tienda() {
  const catalogo = await getCatalogo();

  return (
    <section className="bloque pagina">
      <div className="bloque__cab">
        <h1>Camisetas</h1>
        {catalogo.demo && <p className="aviso-demo">Tienda de muestra: todavía no se puede comprar.</p>}
      </div>
      {/* la búsqueda (?q=) se lee en el cliente para que la página sea estática */}
      <Suspense>
        <Listado productos={catalogo.productos} />
      </Suspense>
    </section>
  );
}

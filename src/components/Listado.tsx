"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Producto } from "@/lib/shopify";
import { sinHtml } from "@/lib/shopify";
import Tarjeta from "./Tarjeta";

type Orden = "destacados" | "precio-asc" | "precio-desc" | "nombre";

export default function Listado({ productos }: { productos: Producto[] }) {
  const busqueda = useSearchParams().get("q") ?? "";
  const [orden, setOrden] = useState<Orden>("destacados");
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const lista = useMemo(() => {
    const q = busqueda.toLowerCase();
    let r = productos.filter(
      (p) =>
        (!soloDisponibles || p.variants.some((v) => v.available)) &&
        (!q || `${p.title} ${sinHtml(p.body_html)}`.toLowerCase().includes(q))
    );
    if (orden === "precio-asc") r = [...r].sort((a, b) => Number(a.price) - Number(b.price));
    if (orden === "precio-desc") r = [...r].sort((a, b) => Number(b.price) - Number(a.price));
    if (orden === "nombre") r = [...r].sort((a, b) => a.title.localeCompare(b.title, "es"));
    return r;
  }, [productos, orden, soloDisponibles, busqueda]);

  return (
    <div>
      <div className="listado__barra">
        <p aria-live="polite">
          {lista.length} {lista.length === 1 ? "camiseta" : "camisetas"}
          {busqueda && <> para «{busqueda}»</>}
        </p>
        <div className="listado__controles">
          <label className="filtros__check">
            <input type="checkbox" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} />
            Solo disponibles
          </label>
          <label>
            Ordenar
            <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
              <option value="destacados">Destacadas</option>
              <option value="precio-asc">Precio: de menor a mayor</option>
              <option value="precio-desc">Precio: de mayor a menor</option>
              <option value="nombre">Nombre</option>
            </select>
          </label>
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="vacio">No hay nada con esos filtros. Prueba con otra búsqueda.</p>
      ) : (
        <div className="rejilla">
          {lista.map((p, i) => (
            <Tarjeta key={p.id} producto={p} prioridad={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

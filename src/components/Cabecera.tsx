"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCesta } from "@/lib/cart";
import Perilla from "./Perilla";


export default function Cabecera() {
  const { unidades, abrir } = useCesta();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [buscando, setBuscando] = useState(false);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `/tienda?q=${encodeURIComponent(t)}` : "/tienda");
    setBuscando(false);
  };

  return (
    <>
      <div className="cab">
        <header className="cab__barra">
          <nav className="cab__nav" aria-label="Principal">
            <Link href="/tienda">Tienda</Link>
          </nav>

          <Link className="cab__marca" href="/">
            Ethan Barbershop
          </Link>

          <div className="cab__acciones">
            {buscando ? (
              <form className="cab__buscar" role="search" onSubmit={buscar}>
                <input
                  autoFocus
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar"
                  aria-label="Buscar camisetas"
                />
                <button type="button" onClick={() => setBuscando(false)} aria-label="Cerrar búsqueda">
                  Cerrar
                </button>
              </form>
            ) : (
              <button onClick={() => setBuscando(true)}>Buscar</button>
            )}
            <button
              data-foco-refugio
              onClick={abrir}
              aria-label={`Abrir la bolsa, ${unidades} ${unidades === 1 ? "artículo" : "artículos"}`}
            >
              <Perilla size={20} />
              Bolsa ({unidades})
            </button>
          </div>
        </header>
      </div>
    </>
  );
}

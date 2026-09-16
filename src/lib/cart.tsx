"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Linea = {
  variantId: number;
  producto: string;
  talla: string;
  precio: number;
  imagen: string;
  qty: number;
};

type CartCtx = {
  lineas: Linea[];
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  añadir: (l: Omit<Linea, "qty">) => void;
  cantidad: (variantId: number, qty: number) => void;
  total: number;
  unidades: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem("be_cesta");
      if (guardado) setLineas(JSON.parse(guardado));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("be_cesta", JSON.stringify(lineas));
    } catch {}
  }, [lineas]);

  const añadir = (l: Omit<Linea, "qty">) => {
    setLineas((prev) => {
      const existe = prev.find((x) => x.variantId === l.variantId);
      if (existe) {
        return prev.map((x) => (x.variantId === l.variantId ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...prev, { ...l, qty: 1 }];
    });
    setAbierto(true);
  };

  const cantidad = (variantId: number, qty: number) =>
    setLineas((prev) =>
      qty <= 0
        ? prev.filter((x) => x.variantId !== variantId)
        : prev.map((x) => (x.variantId === variantId ? { ...x, qty } : x))
    );

  const total = lineas.reduce((s, l) => s + l.precio * l.qty, 0);
  const unidades = lineas.reduce((s, l) => s + l.qty, 0);

  return (
    <Ctx.Provider
      value={{
        lineas,
        abierto,
        abrir: () => setAbierto(true),
        cerrar: () => setAbierto(false),
        añadir,
        cantidad,
        total,
        unidades,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCesta() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCesta fuera de CartProvider");
  return ctx;
}

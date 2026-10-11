"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* Pila de paneles abiertos. Si hay más de uno a la vez, todos escuchan el
   keydown del mismo document: sin esta pila, un Escape los cerraba todos de
   golpe y Shift+Tab saltaba al panel de debajo. Solo manda el último. */
const pila: symbol[] = [];

/* Todo panel superpuesto se comporta igual: Escape cierra, el foco entra
   dentro, no se escapa con Tab, y al cerrar vuelve a donde estaba. */
export function useOverlay<T extends HTMLElement>(onCerrar: () => void) {
  const ref = useRef<T>(null);
  // el callback suele ser una lambda nueva en cada render: lo guardamos en una
  // ref para que el efecto se monte una sola vez y no robe el foco continuamente
  const cerrarRef = useRef(onCerrar);
  cerrarRef.current = onCerrar;

  useEffect(() => {
    const yo = Symbol("overlay");
    pila.push(yo);

    const previo = document.activeElement as HTMLElement | null;
    const nodo = ref.current;

    const enfocables = () =>
      Array.from(nodo?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        // motion pone tabindex="0" también en botones desactivados: no cuentan
        (el) => el.offsetParent !== null && !el.matches(":disabled")
      );
    const primero = enfocables()[0];
    (primero ?? nodo)?.focus({ preventScroll: true });

    const encima = () => pila[pila.length - 1] === yo;

    const tecla = (e: KeyboardEvent) => {
      if (!encima()) return; // hay otro panel por delante: no es asunto mío

      if (e.key === "Escape") {
        e.stopPropagation();
        cerrarRef.current();
        return;
      }
      if (e.key !== "Tab" || !nodo) return;
      const focos = enfocables();
      if (focos.length === 0) return;
      const inicio = focos[0];
      const fin = focos[focos.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && (activo === inicio || !nodo.contains(activo))) {
        e.preventDefault();
        fin.focus();
      } else if (!e.shiftKey && activo === fin) {
        e.preventDefault();
        inicio.focus();
      }
    };

    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("keydown", tecla);
      const eraArriba = encima();
      const i = pila.indexOf(yo);
      if (i >= 0) pila.splice(i, 1);
      // si otro panel se abrió encima (la bolsa tras añadir), el foco es suyo
      if (!eraArriba) return;
      // el elemento de origen puede haber desaparecido: entonces el foco cae al
      // body y se pierde el hilo, así que hay un refugio marcado en la cabecera
      if (previo?.isConnected) previo.focus({ preventScroll: true });
      else document.querySelector<HTMLElement>("[data-foco-refugio]")?.focus({ preventScroll: true });
    };
  }, []);

  return ref;
}

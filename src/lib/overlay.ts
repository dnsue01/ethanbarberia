"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* Pila de paneles abiertos. La carta no se cierra al abrir una prenda, así que
   puede haber carta + ficha + cesta a la vez, y todos escuchan el keydown del
   mismo document: sin esta pila, un Escape los cerraba todos de golpe y
   Shift+Tab saltaba al panel de debajo. Solo manda el último. */
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

    const primero = nodo?.querySelector<HTMLElement>(FOCUSABLE);
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
      const focos = Array.from(nodo.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
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
      const i = pila.indexOf(yo);
      if (i >= 0) pila.splice(i, 1);
      // el elemento de origen puede haber desaparecido (la ficha se desmonta al
      // añadir y es ella quien abre la cesta): entonces el foco cae al body y se
      // pierde el hilo, así que hay un refugio marcado en la escena
      if (previo?.isConnected) previo.focus({ preventScroll: true });
      else document.querySelector<HTMLElement>("[data-foco-refugio]")?.focus({ preventScroll: true });
    };
  }, []);

  return ref;
}

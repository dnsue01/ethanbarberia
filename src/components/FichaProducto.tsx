"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { motion, useAnimationControls } from "motion/react";
import { Check } from "@phosphor-icons/react";
import type { Producto } from "@/lib/shopify";
import { euros, foto, fotoSet, sinHtml } from "@/lib/shopify";
import { useCesta } from "@/lib/cart";

export default function FichaProducto({ producto, demo }: { producto: Producto; demo: boolean }) {
  const { añadir, abrir } = useCesta();
  const [vista, setVista] = useState(0);
  const [avisoTalla, setAvisoTalla] = useState(false);
  const [anadido, setAnadido] = useState(false);
  const sacudida = useAnimationControls();
  const tallasRef = useRef<HTMLDivElement>(null);

  const sinTallas = producto.variants.length === 1 && producto.variants[0].title === "Default Title";
  const unaDisponible = producto.variants.length === 1 && producto.variants[0].available;
  const [talla, setTalla] = useState(unaDisponible ? producto.variants[0] : null);
  const agotada = producto.variants.every((v) => !v.available);
  const desc = sinHtml(producto.body_html);

  const pedir = () => {
    if (!talla) {
      setAvisoTalla(true);
      sacudida.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      tallasRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
      return;
    }
    añadir({
      variantId: talla.id,
      producto: producto.title,
      talla: talla.title,
      precio: Number(producto.price),
      imagen: producto.images[0],
    });
    setAnadido(true);
    setTimeout(() => setAnadido(false), 1800);
    abrir();
  };

  /* grupo de radio de verdad: un solo Tab y flechas para moverse */
  const disponibles = producto.variants.filter((v) => v.available);
  const conFoco = talla ?? disponibles[0];
  const flechas = (e: KeyboardEvent) => {
    const paso =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!paso || disponibles.length === 0) return;
    e.preventDefault();
    const i = disponibles.findIndex((v) => v.id === conFoco?.id);
    const sig = disponibles[(i + paso + disponibles.length) % disponibles.length];
    setTalla(sig);
    setAvisoTalla(false);
    tallasRef.current?.querySelector<HTMLButtonElement>(`[data-talla="${sig.id}"]`)?.focus();
  };

  return (
    <div className="ficha">
      <div className="ficha__galeria">
        <div className="ficha__lienzo">
          <img
            key={producto.images[vista]}
            src={foto(producto.images[vista], 900)}
            srcSet={fotoSet(producto.images[vista], 900)}
            alt={producto.title}
          />
        </div>
        {producto.images.length > 1 && (
          <div className="ficha__vistas">
            {producto.images.map((img, i) => (
              <button
                key={img}
                className={i === vista ? "is-activa" : ""}
                onClick={() => setVista(i)}
                aria-label={i === 0 ? "Ver por delante" : `Ver foto ${i + 1}`}
                aria-pressed={i === vista}
              >
                <img src={foto(img, 120)} srcSet={fotoSet(img, 120)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ficha__info">
        <nav className="ficha__migas" aria-label="Ruta">
          <Link href="/tienda">Tienda</Link> / <span>{producto.title}</span>
        </nav>
        <h1>{producto.title}</h1>
        <p className="ficha__precio">
          {euros(producto.price)} <small>IVA incluido</small>
        </p>
        {desc && <p className="ficha__desc">{desc}</p>}

        {sinTallas ? (
          <span className="ficha__unatalla">{agotada ? "Sin existencias" : "Formato único"}</span>
        ) : (
          <>
            <p className="ficha__etiqueta" id="etq-talla">
              Talla
            </p>
            <motion.div
              ref={tallasRef}
              animate={sacudida}
              className={`ficha__tallas${avisoTalla ? " is-aviso" : ""}`}
              role="radiogroup"
              aria-labelledby="etq-talla"
              aria-describedby="aviso-talla"
              onKeyDown={flechas}
            >
              {producto.variants.map((v) => (
                <button
                  key={v.id}
                  data-talla={v.id}
                  role="radio"
                  aria-checked={talla?.id === v.id}
                  aria-label={v.available ? `Talla ${v.title}` : `Talla ${v.title}, agotada`}
                  tabIndex={v.id === conFoco?.id ? 0 : -1}
                  className={`ficha__talla${talla?.id === v.id ? " is-elegida" : ""}`}
                  disabled={!v.available}
                  onClick={() => {
                    setTalla(v);
                    setAvisoTalla(false);
                  }}
                >
                  {v.title}
                </button>
              ))}
            </motion.div>
          </>
        )}

        <p id="aviso-talla" className="ficha__aviso-talla" aria-live="polite">
          {avisoTalla ? "Elige una talla para añadirla a la bolsa." : ""}
        </p>

        <motion.button
          className={`ficha__pedir${anadido ? " is-servido" : ""}`}
          disabled={agotada}
          onClick={pedir}
          whileTap={{ scale: 0.97 }}
        >
          {anadido && <Check size={18} weight="bold" aria-hidden />}
          {agotada ? "Agotado" : anadido ? "En la bolsa" : "Añadir a la bolsa"}
        </motion.button>
        <p className="ficha__envio">
          {demo ? "Tienda de muestra: todavía no se puede comprar." : "Envío e impuestos se calculan al pagar en Shopify."}
        </p>
      </div>
    </div>
  );
}

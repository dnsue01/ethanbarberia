"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useDragControls } from "motion/react";
import { X, Check } from "@phosphor-icons/react";
import type { Producto } from "@/lib/shopify";
import { euros, foto, fotoSet } from "@/lib/shopify";
import { useCesta } from "@/lib/cart";
import { useOverlay } from "@/lib/overlay";

export default function ProductModal({
  producto,
  onCerrar,
}: {
  producto: Producto;
  onCerrar: () => void;
}) {
  const { añadir } = useCesta();
  const [vista, setVista] = useState(0);
  const sinTallas = producto.variants.length === 1 && producto.variants[0].title === "Default Title";
  const unaDisponible = producto.variants.length === 1 && producto.variants[0].available;
  const [talla, setTalla] = useState(unaDisponible ? producto.variants[0] : null);
  const [pedido, setPedido] = useState(false);
  const fichaRef = useOverlay<HTMLDivElement>(onCerrar);
  const cierre = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrastre = useDragControls();
  useEffect(() => () => { if (cierre.current) clearTimeout(cierre.current); }, []);

  const agotada = producto.variants.every((v) => !v.available);

  const desc = producto.body_html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);

  const pedir = () => {
    if (!talla) return;
    añadir({
      variantId: talla.id,
      producto: producto.title,
      talla: talla.title,
      precio: Number(producto.price),
      imagen: producto.images[0],
    });
    setPedido(true);
    cierre.current = setTimeout(onCerrar, 1000); // ver el "en la bolsa" antes de irse
  };

  const textoBoton = pedido
    ? "En la bolsa"
    : agotada
      ? "Agotado"
      : talla
        ? "Añadir a la bolsa"
        : "Elige tu talla";

  return (
    <motion.div
      className="velo velo--producto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <motion.article
        ref={fichaRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-titulo"
        className="ficha"
        initial={{ y: 60, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 40, scale: 0.97, opacity: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 20 }}
        /* solo se arrastra desde el tirador: escuchando toda la hoja chocaría
           con el scroll del contenido */
        drag="y"
        dragListener={false}
        dragControls={arrastre}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onCerrar();
        }}
      >
        <span className="ficha__tirador" aria-hidden onPointerDown={(e) => arrastre.start(e)} />
        <button className="panel__cerrar ficha__cerrar" onClick={onCerrar} aria-label="Cerrar">
          <X size={20} weight="bold" />
        </button>

        <div className="ficha__foto">
          <FotoFicha key={producto.images[vista]} src={producto.images[vista]} alt={producto.title} />
          {producto.images.length > 1 && (
            <div className="ficha__vistas">
              {producto.images.map((img, i) => (
                <button
                  key={img}
                  className={i === vista ? "is-activa" : ""}
                  onClick={() => setVista(i)}
                  aria-label={i === 0 ? "Ver por delante" : "Ver por detrás"}
                  aria-pressed={i === vista}
                >
                  <img src={foto(img, 120)} srcSet={fotoSet(img, 120)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ficha__info">
          <h3 id="ficha-titulo">{producto.title}</h3>
          <p className="ficha__precio">
            {euros(producto.price)} <small>IVA incluido</small>
          </p>
          {desc && <p className="ficha__desc">{desc}</p>}

          {sinTallas ? (
            <span className="ficha__unatalla">{agotada ? "sin existencias" : "formato único"}</span>
          ) : (
            <div className="ficha__tallas" role="radiogroup" aria-label="Talla">
              {producto.variants.map((v) => (
                <motion.button
                  key={v.id}
                  role="radio"
                  aria-checked={talla?.id === v.id}
                  aria-label={v.available ? `Talla ${v.title}` : `Talla ${v.title}, agotada`}
                  className={`ficha__talla ${talla?.id === v.id ? "is-elegida" : ""}`}
                  disabled={!v.available}
                  onClick={() => setTalla(v)}
                  whileTap={{ scale: 0.92 }}
                >
                  {v.title}
                  {!v.available && <i aria-hidden>agotada</i>}
                </motion.button>
              ))}
            </div>
          )}

          <motion.button
            className={`ficha__pedir ${pedido ? "is-servido" : ""}`}
            disabled={!talla || pedido}
            onClick={pedir}
            whileTap={{ scale: 0.97 }}
          >
            {pedido && <Check size={18} weight="bold" aria-hidden />}
            {textoBoton}
          </motion.button>
          <p className="ficha__envio">Pago seguro con Shopify</p>
        </div>
      </motion.article>
    </motion.div>
  );
}

/* Base pequeña (ya en caché desde la carta) debajo y la grande encima cuando llega:
   la ficha nunca abre en blanco. */
function FotoFicha({ src, alt }: { src: string; alt: string }) {
  const grande = foto(src, 900);
  const [lista, setLista] = useState(false);
  const [fallo, setFallo] = useState(false);
  const nitidaRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = nitidaRef.current;
    if (img?.complete && img.naturalWidth > 0) setLista(true);
  }, []);

  return (
    <span className="ficha__lienzo">
      <img
        className={`ficha__img ficha__img--base${fallo ? " is-sola" : ""}${lista && !fallo ? " is-tapada" : ""}`}
        src={foto(src, 540)}
        alt={fallo ? alt : ""}
        aria-hidden={!fallo}
      />
      <img
        ref={nitidaRef}
        className={`ficha__img ficha__img--nitida${lista ? " is-lista" : ""}`}
        src={grande}
        alt={alt}
        onLoad={() => setLista(true)}
        onError={() => setFallo(true)}
      />
    </span>
  );
}

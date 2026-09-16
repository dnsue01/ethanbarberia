"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { X, ArrowsClockwise } from "@phosphor-icons/react";
import type { Catalogo, Producto } from "@/lib/shopify";
import { euros, foto, fotoSet } from "@/lib/shopify";
import { useOverlay } from "@/lib/overlay";

export type Seccion = "camisetas" | "cuidado";

/* La carta de la barbería: un panel sobre la escena, sin cambiar de página.
   Tocar una prenda abre su ficha. */
export default function Carta({
  catalogo,
  seccion = "camisetas",
  onCerrar,
  onElegir,
}: {
  catalogo: Catalogo;
  seccion?: Seccion;
  onCerrar: () => void;
  onElegir: (p: Producto) => void;
}) {
  const cuidadoRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useOverlay<HTMLElement>(onCerrar);
  const { camisetas, cuidado, demo } = catalogo;

  useEffect(() => {
    if (seccion !== "cuidado") return;
    const t = setTimeout(
      () => cuidadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      450
    );
    return () => clearTimeout(t);
  }, [seccion]);

  const stagger: Variants = {
    oculto: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 + Math.min(i, 8) * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    }),
  };
  let fila = 0;

  return (
    <motion.div
      className="velo"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <motion.section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="carta-titulo"
        className="carta"
        initial={{ y: 80, rotate: -1.5, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 17 }}
      >
        <button className="panel__cerrar carta__cerrar" onClick={onCerrar} aria-label="Cerrar la carta">
          <X size={20} weight="bold" />
        </button>

        <div className="carta__hoja">
          <motion.header custom={fila++} variants={stagger} initial="oculto" animate="visible">
            <span className="carta__franja" aria-hidden />
            <h2 id="carta-titulo" className="carta__titulo">
              La Barbería de Ethan
            </h2>
            <p className="carta__sub">la perilla me pone perrilla y el flequillo me pone perrillo</p>
            {demo && (
              <p className="carta__demo">
                Catálogo de muestra con fotos de stock. Se cambia solo al conectar Shopify.
              </p>
            )}
          </motion.header>

          <motion.h3
            className="carta__seccion"
            custom={fila++}
            variants={stagger}
            initial="oculto"
            animate="visible"
          >
            Camisetas
          </motion.h3>

          {camisetas.length === 0 && (
            <p className="carta__vacio">Ahora mismo no hay camisetas colgadas. Vuelve en un rato.</p>
          )}

          <div className="carta__rejilla">
            {camisetas.map((prod) => (
              <Prenda
                key={prod.id}
                producto={prod}
                fila={fila++}
                stagger={stagger}
                onElegir={() => onElegir(prod)}
              />
            ))}
          </div>

          <motion.h3
            ref={cuidadoRef}
            className="carta__seccion"
            custom={fila++}
            variants={stagger}
            initial="oculto"
            animate="visible"
          >
            Pomada y aceite
          </motion.h3>

          {cuidado.length === 0 && (
            <p className="carta__vacio">No queda pomada en la estantería. Ethan repone pronto.</p>
          )}

          <div className="carta__estante">
            {cuidado.map((prod) => (
              <motion.button
                key={prod.id}
                className="bote"
                custom={fila++}
                variants={stagger}
                initial="oculto"
                animate="visible"
                whileTap={{ scale: 0.98 }}
                onClick={() => onElegir(prod)}
              >
                <img
                  className="bote__foto"
                  src={foto(prod.images[0], 340)}
                  srcSet={fotoSet(prod.images[0], 340)}
                  alt=""
                  loading="lazy"
                />
                <span className="bote__texto">
                  <span className="bote__nombre">{prod.title}</span>
                  <span className="bote__precio">{euros(prod.price)}</span>
                </span>
              </motion.button>
            ))}
          </div>

          <motion.div
            className="carta__silla"
            custom={fila++}
            variants={stagger}
            initial="oculto"
            animate="visible"
          >
            <h3 className="carta__seccion carta__seccion--out">De la silla</h3>
            <div className="carta__servicios">
              <div>
                <h4>Cortes</h4>
                <p>
                  <s>Degradado</s>
                  <s>Tijera clásica</s>
                  <s>Rapado al cero</s>
                </p>
              </div>
              <div>
                <h4>Barba</h4>
                <p>
                  <s>Perfilado</s>
                  <s>Afeitado a navaja</s>
                  <s>Arreglo de perilla</s>
                </p>
              </div>
            </div>
            <motion.span
              className="sello"
              initial={{ opacity: 0, scale: 2.2, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 14 }}
            >
              Agenda llena
            </motion.span>
            <p className="carta__nota">La silla está llena. Las camisetas no se acaban nunca.</p>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}

/* Una camiseta de la carta. El botón grande abre la ficha; "ver espalda" vive
   fuera de él porque un botón no admite otro dentro. */
function Prenda({
  producto,
  fila,
  stagger,
  onElegir,
}: {
  producto: Producto;
  fila: number;
  stagger: Variants;
  onElegir: () => void;
}) {
  const tieneEspalda = producto.images.length > 1;
  const [girada, setGirada] = useState(false);
  const [hover, setHover] = useState(false);
  const atras = tieneEspalda && (hover || girada);
  const agotada = producto.variants.every((v) => !v.available);

  return (
    <motion.div
      className="prenda"
      custom={fila}
      variants={stagger}
      initial="oculto"
      animate="visible"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <motion.button className="prenda__boton" whileTap={{ scale: 0.98 }} onClick={onElegir}>
        <span className={`prenda__flip${atras ? " is-atras" : ""}`}>
          <span className="prenda__flip-inner">
            <img
              className="prenda__cara"
              src={foto(producto.images[0], 540)}
              srcSet={fotoSet(producto.images[0], 540)}
              alt=""
              loading="lazy"
            />
            {tieneEspalda && (
              <img
                className="prenda__cara prenda__cara--atras"
                src={foto(producto.images[1], 540)}
                srcSet={fotoSet(producto.images[1], 540)}
                alt=""
                loading="lazy"
              />
            )}
          </span>
        </span>
        <span className="prenda__pie">
          <span className="prenda__nombre">{producto.title}</span>
          <span className="prenda__precio">{agotada ? "agotada" : euros(producto.price)}</span>
        </span>
      </motion.button>

      {tieneEspalda && (
        <button
          className="prenda__girar"
          onClick={() => setGirada((v) => !v)}
          aria-pressed={girada}
          aria-label={girada ? `Ver ${producto.title} por delante` : `Ver ${producto.title} por detrás`}
        >
          <ArrowsClockwise size={14} weight="bold" aria-hidden />
          {girada ? "delante" : "detrás"}
        </button>
      )}
    </motion.div>
  );
}

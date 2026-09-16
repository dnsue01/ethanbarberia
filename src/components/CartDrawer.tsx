"use client";

import { motion, AnimatePresence, useDragControls } from "motion/react";
import { X, Minus, Plus, ArrowRight } from "@phosphor-icons/react";
import { useCesta } from "@/lib/cart";
import { euros, urlCheckout, foto, fotoSet } from "@/lib/shopify";
import { useOverlay } from "@/lib/overlay";

type Props = { demo: boolean; pago: string };

/* Bolsa lateral: panel deslizante desde la derecha. */
export default function CartDrawer(props: Props) {
  const { abierto } = useCesta();
  return <AnimatePresence>{abierto && <Panel key="bolsa" {...props} />}</AnimatePresence>;
}

/* Componente aparte para que el foco se capture al montar y vuelva al desmontar. */
function Panel({ demo, pago }: Props) {
  const { lineas, cerrar, cantidad, total, unidades } = useCesta();
  const panelRef = useOverlay<HTMLElement>(cerrar);
  const arrastre = useDragControls();

  return (
    <motion.div
      className="velo velo--cesta"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && cerrar()}
    >
      <motion.aside
        ref={panelRef}
        tabIndex={-1}
        className="cesta"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cesta-titulo"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        drag="x"
        dragListener={false}
        dragControls={arrastre}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 110 || info.velocity.x > 550) cerrar();
        }}
      >
        <header className="cesta__cabecera" onPointerDown={(e) => arrastre.start(e)}>
          <h3 id="cesta-titulo">Tu bolsa</h3>
          <button className="panel__cerrar" onClick={cerrar} aria-label="Cerrar bolsa">
            <X size={20} weight="bold" />
          </button>
        </header>

        {lineas.length === 0 ? (
          <div className="cesta__vacia">
            <p>La bolsa está vacía.</p>
            <p>Abre las tarifas de la pizarra y elige camiseta.</p>
            <button onClick={cerrar}>Volver a la barbería</button>
          </div>
        ) : (
          <ul className="cesta__lineas">
            <AnimatePresence initial={false}>
              {lineas.map((l) => (
                <motion.li
                  key={l.variantId}
                  layout
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                >
                  <img src={foto(l.imagen, 112)} srcSet={fotoSet(l.imagen, 112)} alt="" width={64} height={64} loading="lazy" />
                  <div>
                    <b>{l.producto}</b>
                    <span>{l.talla !== "Default Title" ? `talla ${l.talla}` : "formato único"}</span>
                    <div className="cesta__qty">
                      <button
                        onClick={() => cantidad(l.variantId, l.qty - 1)}
                        aria-label={`Quitar una unidad de ${l.producto}`}
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <span aria-live="polite" aria-label={`${l.qty} unidades`}>
                        {l.qty}
                      </span>
                      <button
                        onClick={() => cantidad(l.variantId, l.qty + 1)}
                        aria-label={`Añadir una unidad de ${l.producto}`}
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                  </div>
                  <div className="cesta__precio">
                    <em>{euros(l.precio * l.qty)}</em>
                    <button
                      className="cesta__quitar"
                      onClick={() => cantidad(l.variantId, 0)}
                      aria-label={`Quitar ${l.producto} de la bolsa`}
                    >
                      quitar
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {lineas.length > 0 && (
          <footer className="cesta__pie">
            <div className="cesta__total">
              <span>
                Total, {unidades} {unidades === 1 ? "artículo" : "artículos"}
              </span>
              <b>{euros(total)}</b>
            </div>
            {demo ? (
              <>
                <button className="cesta__pagar" disabled>
                  Pagar
                </button>
                <small>Tienda en modo muestra: el pago se activa al conectar Shopify.</small>
              </>
            ) : (
              <>
                <motion.a
                  className="cesta__pagar"
                  href={urlCheckout(pago, lineas.map((l) => ({ variantId: l.variantId, qty: l.qty })))}
                  whileTap={{ scale: 0.97 }}
                >
                  Pagar <ArrowRight size={18} weight="bold" aria-hidden />
                </motion.a>
                <small>Pago seguro con Shopify. IVA incluido.</small>
              </>
            )}
          </footer>
        )}
      </motion.aside>
    </motion.div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HandbagSimple } from "@phosphor-icons/react";
import type { Catalogo, Producto } from "@/lib/shopify";
import { useCesta } from "@/lib/cart";
import { useOverlay } from "@/lib/overlay";
import { pausa, simCuerdas } from "@/lib/cuerdas";
import Carta, { type Seccion } from "./Carta";
import ProductModal from "./ProductModal";
import CartDrawer from "./CartDrawer";
import "./escena.css";

type Aviso = { titulo: string; texto: string } | null;

export default function Escena({ catalogo }: { catalogo: Catalogo }) {
  const rm = useReducedMotion();
  const { unidades, abrir, abierto: cestaAbierta } = useCesta();
  const [cartaAbierta, setCartaAbierta] = useState(false);
  const [seccionCarta, setSeccionCarta] = useState<Seccion>("camisetas");
  const [producto, setProducto] = useState<Producto | null>(null);
  const [aviso, setAviso] = useState<Aviso>(null);

  /* loader: el poste gira un momento y se levanta. Cualquier gesto lo salta. */
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setCargando(false), rm ? 150 : 1300);
    const saltar = () => setCargando(false);
    addEventListener("pointerdown", saltar);
    addEventListener("keydown", saltar);
    return () => {
      clearTimeout(t);
      removeEventListener("pointerdown", saltar);
      removeEventListener("keydown", saltar);
    };
  }, [rm]);

  const hayPanel = cartaAbierta || !!producto || !!aviso || cestaAbierta;
  useEffect(() => {
    pausa.valor = hayPanel;
    return () => {
      pausa.valor = false;
    };
  }, [hayPanel]);

  /* pelos cortados cayendo despacio delante del local */
  const pelos = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: `${(i * 37 + 11) % 100}%`,
        dur: 10 + ((i * 7) % 12),
        delay: -((i * 13) % 22),
        giro: `${((i * 53) % 180) - 90}deg`,
        largo: 6 + ((i * 11) % 7),
      })),
    []
  );

  const abrirCarta = (seccion: Seccion) => {
    setSeccionCarta(seccion);
    setCartaAbierta(true);
  };

  return (
    <main className="local">
      <AnimatePresence>
        {cargando && (
          <motion.div
            className="loader"
            key="loader"
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.55 }}
            aria-hidden
          >
            <span className="loader__poste">
              <i className="loader__tapa" />
              <span className="loader__cristal">
                <i className="loader__rayas" />
              </span>
              <i className="loader__tapa loader__tapa--baja" />
            </span>
            <b className="loader__texto">La Barbería de Ethan</b>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.picture
        className="local__fondo"
        initial={rm ? false : { scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 0.9, 0.3, 1] }}
      >
        <source media="(max-width: 700px)" srcSet="/be-fondo-movil.webp" />
        <img src="/be-fondo.webp" alt="" fetchPriority="high" />
      </motion.picture>
      <div className="local__viñeta" aria-hidden />
      <div className="local__grano" aria-hidden />

      {!rm &&
        pelos.map((p, i) => (
          <span
            key={i}
            className="pelo"
            style={
              {
                left: p.left,
                height: `${p.largo}px`,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                "--giro": p.giro,
              } as React.CSSProperties
            }
            aria-hidden
          />
        ))}

      <h1 className="visualmente-oculto">La Barbería de Ethan</h1>

      <Placa
        lado="izquierda"
        nombre="Degradado"
        rm={rm}
        onClick={() =>
          setAviso({
            titulo: "Degradado",
            texto: "Ethan tiene la agenda llena hasta nuevo aviso. Mientras tanto, la camiseta te la llevas hoy.",
          })
        }
      />
      <Placa
        lado="derecha"
        nombre="Afeitado"
        rm={rm}
        onClick={() =>
          setAviso({
            titulo: "Afeitado a navaja",
            texto: "La navaja está de vacaciones. La perilla, de momento, te la cuidas tú con el aceite.",
          })
        }
      />

      <Rotulo rm={rm} />

      <motion.nav
        className="pizarra"
        aria-label="Tarifas"
        initial={rm ? false : { y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          y: { type: "spring", stiffness: 70, damping: 13, delay: 1.7 },
          opacity: { duration: 0.5, delay: 1.7 },
        }}
      >
        <b className="pizarra__titulo">Tarifas</b>
        <span className="pizarra__linea" />
        <button
          className="pizarra__item pizarra__item--link"
          onClick={() => abrirCarta("camisetas")}
          aria-haspopup="dialog"
        >
          Camisetas
        </button>
        <button
          className="pizarra__item pizarra__item--link"
          onClick={() => abrirCarta("cuidado")}
          aria-haspopup="dialog"
        >
          Pomada y aceite
        </button>
        <span className="pizarra__item pizarra__item--out">
          Corte degradado <span className="visualmente-oculto">(agenda llena)</span>
        </span>
        <span className="pizarra__item pizarra__item--out">
          Arreglo de barba <span className="visualmente-oculto">(agenda llena)</span>
        </span>
        <em className="pizarra__nota">toca y elige</em>
      </motion.nav>

      <motion.button
        className="cesta-btn"
        data-foco-refugio
        onClick={abrir}
        initial={rm ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.1 }}
        whileTap={{ scale: 0.94 }}
      >
        <span className="visualmente-oculto" aria-live="polite">
          {unidades === 0 ? "bolsa vacía" : unidades + " en la bolsa"}
        </span>
        <HandbagSimple size={20} weight="bold" aria-hidden />
        <span aria-hidden>bolsa</span>
        <AnimatePresence>
          {unidades > 0 && (
            <motion.i
              key={unidades}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              aria-hidden
            >
              {unidades}
            </motion.i>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {cartaAbierta && (
          <Carta
            key="carta"
            catalogo={catalogo}
            seccion={seccionCarta}
            onCerrar={() => setCartaAbierta(false)}
            onElegir={setProducto}
          />
        )}
        {producto && (
          <ProductModal key="producto" producto={producto} onCerrar={() => setProducto(null)} />
        )}
        {aviso && <AvisoAgenda key="aviso" aviso={aviso} onCerrar={() => setAviso(null)} />}
      </AnimatePresence>

      <CartDrawer demo={catalogo.demo} pago={catalogo.pago} />
    </main>
  );
}

/* Rótulo de la barbería colgado de cuerdas: pesado, se mece menos que las placas. */
function Rotulo({ rm }: { rm: boolean | null }) {
  const contRef = useRef<HTMLDivElement>(null);
  const tablaRef = useRef<HTMLDivElement>(null);
  const cuerda1Ref = useRef<SVGPolylineElement>(null);
  const cuerda2Ref = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    if (rm) return;
    const cont = contRef.current, tabla = tablaRef.current;
    const c1 = cuerda1Ref.current, c2 = cuerda2Ref.current;
    if (!cont || !tabla || !c1 || !c2) return;
    // el alto del rótulo depende de las fuentes: medir cuando estén cargadas
    let limpiar: (() => void) | undefined;
    let vivo = true;
    document.fonts.ready.then(() => {
      if (vivo) limpiar = simCuerdas(cont, tabla, c1, c2, { fuerza: 0.28 });
    });
    return () => {
      vivo = false;
      limpiar?.();
    };
  }, [rm]);

  return (
    <motion.div
      ref={contRef}
      className="rotulo"
      initial={rm ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, delay: 1.3 }}
    >
      <svg className="placa__cuerdas" aria-hidden>
        <polyline ref={cuerda1Ref} />
        <polyline ref={cuerda2Ref} />
      </svg>
      <div ref={tablaRef} className="rotulo__tabla">
        <span className="rotulo__franja" aria-hidden />
        <span className="rotulo__la">La Barbería de</span>
        <span className="rotulo__nombre">Ethan</span>
        <span className="rotulo__raya" aria-hidden />
        <p className="rotulo__frase">
          la perilla me pone perrilla
          <br />y el flequillo me pone perrillo
        </p>
        <span className="rotulo__franja rotulo__franja--baja" aria-hidden />
      </div>
    </motion.div>
  );
}

/* Placa colgante con cuerdas Verlet. */
function Placa({
  lado,
  nombre,
  rm,
  onClick,
}: {
  lado: "izquierda" | "derecha";
  nombre: string;
  rm: boolean | null;
  onClick: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const tablaRef = useRef<HTMLSpanElement>(null);
  const cuerda1Ref = useRef<SVGPolylineElement>(null);
  const cuerda2Ref = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    if (rm) return;
    const btn = btnRef.current, tabla = tablaRef.current;
    const c1 = cuerda1Ref.current, c2 = cuerda2Ref.current;
    if (!btn || !tabla || !c1 || !c2) return;
    return simCuerdas(btn, tabla, c1, c2, { fuerza: 1 });
  }, [rm, lado]);

  return (
    <motion.button
      ref={btnRef}
      className={`placa placa--${lado} placa--fisica`}
      initial={rm ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: lado === "izquierda" ? 1.5 : 1.65 }}
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={`${nombre}: agenda llena`}
    >
      <svg className="placa__cuerdas" aria-hidden>
        <polyline ref={cuerda1Ref} />
        <polyline ref={cuerda2Ref} />
      </svg>
      <span ref={tablaRef} className="placa__tabla">
        <span className="placa__nombre">{nombre}</span>
        <span className="placa__raya" />
        <span className="placa__estado">Agenda llena</span>
      </span>
    </motion.button>
  );
}

/* Aviso de las placas: mismo trato que los demás paneles. */
function AvisoAgenda({
  aviso,
  onCerrar,
}: {
  aviso: NonNullable<Aviso>;
  onCerrar: () => void;
}) {
  const ref = useOverlay<HTMLDivElement>(onCerrar);

  return (
    <motion.div
      className="velo velo--aviso"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCerrar}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="aviso-titulo"
        className="aviso"
        initial={{ scale: 0.7, rotate: -4, y: 30 }}
        animate={{ scale: 1, rotate: -1.5, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <b id="aviso-titulo">{aviso.titulo}</b>
        <p>{aviso.texto}</p>
        <button onClick={onCerrar}>Vale, a la tienda</button>
      </motion.div>
    </motion.div>
  );
}

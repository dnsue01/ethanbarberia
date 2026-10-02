"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HandbagSimple, ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react";
import type { Catalogo, Producto } from "@/lib/shopify";
import { euros, foto, fotoSet } from "@/lib/shopify";
import { useCesta } from "@/lib/cart";
import ProductModal from "./ProductModal";
import CartDrawer from "./CartDrawer";
import "./sitio.css";

const LEMA = ["la perilla me pone perrilla", "y el flequillo me pone perrillo"];

const SERVICIOS = [
  { grupo: "Cortes", items: ["Degradado", "Tijera clásica", "Rapado al cero"] },
  { grupo: "Barba", items: ["Perfilado", "Afeitado a navaja", "Arreglo de perilla"] },
];

export default function Sitio({ catalogo }: { catalogo: Catalogo }) {
  const { unidades, abrir, abierto: cestaAbierta } = useCesta();
  const [producto, setProducto] = useState<Producto | null>(null);

  /* con un panel abierto la página de detrás no se mueve */
  const hayPanel = !!producto || cestaAbierta;
  useEffect(() => {
    document.body.style.overflow = hayPanel ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hayPanel]);

  return (
    <>
      <a className="saltar" href="#tienda">
        Ir a la tienda
      </a>
      <Cabecera unidades={unidades} onBolsa={abrir} />

      <main>
        <Portada />
        <Cinta />
        <Silla />
        <Tienda catalogo={catalogo} onElegir={setProducto} />
        <Casa />
      </main>

      <Pie />

      <AnimatePresence>
        {producto && (
          <ProductModal key="producto" producto={producto} onCerrar={() => setProducto(null)} />
        )}
      </AnimatePresence>
      <CartDrawer demo={catalogo.demo} pago={catalogo.pago} />
    </>
  );
}

/* Aparece al entrar en pantalla. Sin movimiento si el sistema lo pide. */
function Aparece({
  children,
  retraso = 0,
  className,
}: {
  children: ReactNode;
  retraso?: number;
  className?: string;
}) {
  const rm = useReducedMotion();
  if (rm) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ───────── Cabecera ───────── */

function Cabecera({ unidades, onBolsa }: { unidades: number; onBolsa: () => void }) {
  return (
    <header className="cab">
      <div className="cab__fila">
        <a className="cab__marca" href="#inicio" aria-label="La Barbería de Ethan, inicio">
          <span className="cab__poste" aria-hidden />
          <span className="cab__nombre">
            <b>Ethan</b>
            <i>barbería</i>
          </span>
        </a>

        <nav className="cab__nav" aria-label="Secciones">
          <a href="#silla">La silla</a>
          <a href="#tienda">Camisetas</a>
          <a href="#cuidado">Pomada y aceite</a>
          <a href="#casa">La casa</a>
        </nav>

        <button className="cab__bolsa" data-foco-refugio onClick={onBolsa}>
          <span className="visualmente-oculto" aria-live="polite">
            {unidades === 0 ? "bolsa vacía" : unidades + " en la bolsa"}
          </span>
          <HandbagSimple size={20} weight="bold" aria-hidden />
          <span aria-hidden>Bolsa</span>
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
        </button>
      </div>
      <span className="poste" aria-hidden />
    </header>
  );
}

/* ───────── Portada ───────── */

function Portada() {
  const rm = useReducedMotion();
  return (
    <section className="portada" id="inicio" aria-labelledby="titulo-portada">
      <div className="portada__texto">
        <motion.p
          className="etiqueta"
          initial={rm ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Barbería y tienda · desde la silla a la calle
        </motion.p>

        <h1 id="titulo-portada" className="portada__titulo">
          <motion.span
            className="portada__pre"
            initial={rm ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            La Barbería de
          </motion.span>
          <motion.span
            className="portada__ethan"
            initial={rm ? false : { opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Ethan<em aria-hidden>.</em>
          </motion.span>
        </h1>

        <motion.p
          className="portada__lema"
          initial={rm ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          {LEMA[0]}
          <br />
          {LEMA[1]}
        </motion.p>

        <motion.div
          className="portada__acciones"
          initial={rm ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <a className="boton boton--rojo" href="#tienda">
            Ver las camisetas <ArrowDownRight size={18} weight="bold" aria-hidden />
          </a>
          <a className="boton boton--linea" href="#silla">
            La silla
          </a>
        </motion.div>
      </div>

      <motion.div
        className="portada__espejo"
        initial={rm ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="arco">
          <picture>
            <source media="(max-width: 700px)" srcSet="/be-fondo-movil.webp" />
            <img src="/be-fondo.webp" alt="Interior de la barbería: sillones de cuero, estantes y espejos con marco dorado" fetchPriority="high" />
          </picture>
        </div>
        <svg className="sello-giro" viewBox="0 0 120 120" aria-hidden>
          <defs>
            <path id="circulo" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
          </defs>
          <circle cx="60" cy="60" r="58" className="sello-giro__fondo" />
          <text>
            <textPath href="#circulo" startOffset="0">
              CORTE · BARBA · CAMISETA · POMADA ·
            </textPath>
          </text>
          <circle cx="60" cy="60" r="5" className="sello-giro__centro" />
        </svg>
      </motion.div>
    </section>
  );
}

/* Cinta con el lema, como el rótulo de una tienda de barrio. */
function Cinta() {
  const tira = Array.from({ length: 6 }, (_, i) => (
    <span key={i}>
      {LEMA[0]} <i aria-hidden>✂</i> {LEMA[1]} <i aria-hidden>✂</i>
    </span>
  ));
  return (
    <div className="cinta" aria-hidden>
      <div className="cinta__pista">
        <div className="cinta__tira">{tira}</div>
        <div className="cinta__tira">{tira}</div>
      </div>
    </div>
  );
}

/* ───────── La silla (tarifa) ───────── */

function Silla() {
  return (
    <section className="silla" id="silla" aria-labelledby="titulo-silla">
      <Aparece className="silla__cabecera">
        <p className="etiqueta">01 · La silla</p>
        <h2 id="titulo-silla" className="titular">
          Ethan tiene la <em>agenda llena.</em>
        </h2>
        <p className="silla__texto">
          Los cortes y la barba esperan a que haya hueco. Mientras tanto, la camiseta te la llevas hoy y la
          perilla te la cuidas tú con el aceite.
        </p>
      </Aparece>

      <div className="tarifa">
        {SERVICIOS.map((g, gi) => (
          <Aparece key={g.grupo} retraso={0.1 + gi * 0.1} className="tarifa__grupo">
            <h3 className="tarifa__grupo-titulo">{g.grupo}</h3>
            <ul>
              {g.items.map((it, i) => (
                <li key={it} className="tarifa__fila">
                  <span className="tarifa__num" aria-hidden>
                    {String(gi * 3 + i + 1).padStart(2, "0")}
                  </span>
                  <span className="tarifa__nombre">{it}</span>
                  <span className="tarifa__puntos" aria-hidden />
                  <span className="tarifa__estado">Agenda llena</span>
                </li>
              ))}
            </ul>
          </Aparece>
        ))}
        <span className="sello-agenda" aria-hidden>
          Agenda
          <br />
          llena
        </span>
      </div>
    </section>
  );
}

/* ───────── Tienda ───────── */

function Tienda({
  catalogo,
  onElegir,
}: {
  catalogo: Catalogo;
  onElegir: (p: Producto) => void;
}) {
  const { camisetas, cuidado, demo } = catalogo;
  return (
    <>
      <section className="tienda" id="tienda" aria-labelledby="titulo-tienda">
        <Aparece className="tienda__cabecera">
          <p className="etiqueta">02 · La tienda</p>
          <h2 id="titulo-tienda" className="titular">
            Camisetas <em>de la casa.</em>
          </h2>
          <p className="tienda__texto">
            Algodón grueso para salir de la silla igual de bien.
            {demo && " Catálogo de muestra con fotos de stock: se cambia solo al conectar Shopify."}
          </p>
        </Aparece>

        {camisetas.length === 0 ? (
          <p className="vacio">Ahora mismo no hay camisetas colgadas. Vuelve en un rato.</p>
        ) : (
          <ul className="rejilla">
            {camisetas.map((p, i) => (
              <li key={p.id}>
                <Aparece retraso={(i % 4) * 0.07}>
                  <Prenda producto={p} onElegir={() => onElegir(p)} />
                </Aparece>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cuidado" id="cuidado" aria-labelledby="titulo-cuidado">
        <div className="cuidado__dentro">
          <Aparece className="cuidado__cabecera">
            <p className="etiqueta etiqueta--clara">03 · Para la silla de tu casa</p>
            <h2 id="titulo-cuidado" className="titular titular--claro">
              Pomada <em>y aceite.</em>
            </h2>
            <p className="cuidado__texto">Lo que usa Ethan para dejarte peinado al terminar.</p>
          </Aparece>

          {cuidado.length === 0 ? (
            <p className="vacio vacio--claro">No queda pomada en la estantería. Ethan repone pronto.</p>
          ) : (
            <ul className="estante">
              {cuidado.map((p, i) => (
                <li key={p.id}>
                  <Aparece retraso={i * 0.1}>
                    <Bote producto={p} onElegir={() => onElegir(p)} />
                  </Aparece>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

/* Camiseta: etiqueta de percha. Pasar el ratón enseña la espalda. */
function Prenda({ producto, onElegir }: { producto: Producto; onElegir: () => void }) {
  const tieneEspalda = producto.images.length > 1;
  const agotada = producto.variants.every((v) => !v.available);
  const tallas = producto.variants.filter((v) => v.title !== "Default Title");

  return (
    <button className="prenda" onClick={onElegir} aria-label={`${producto.title}, ${agotada ? "agotada" : euros(producto.price)}. Ver ficha`}>
      <span className="prenda__foto">
        <img
          className="prenda__img"
          src={foto(producto.images[0], 540)}
          srcSet={fotoSet(producto.images[0], 540)}
          alt=""
          loading="lazy"
        />
        {tieneEspalda && (
          <img
            className="prenda__img prenda__img--atras"
            src={foto(producto.images[1], 540)}
            srcSet={fotoSet(producto.images[1], 540)}
            alt=""
            loading="lazy"
          />
        )}
        {agotada && <span className="prenda__agotada">Agotada</span>}
        <span className="prenda__ver" aria-hidden>
          Ver ficha <ArrowUpRight size={14} weight="bold" />
        </span>
      </span>
      <span className="prenda__pie">
        <span className="prenda__nombre">{producto.title}</span>
        <span className="prenda__precio">{agotada ? "—" : euros(producto.price)}</span>
        {tallas.length > 0 && (
          <span className="prenda__tallas" aria-hidden>
            {tallas.map((v) => (
              <i key={v.id} className={v.available ? "" : "is-agotada"}>
                {v.title}
              </i>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}

function Bote({ producto, onElegir }: { producto: Producto; onElegir: () => void }) {
  const desc = producto.body_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 110);
  const agotado = producto.variants.every((v) => !v.available);
  return (
    <button className="bote" onClick={onElegir} aria-label={`${producto.title}, ${agotado ? "agotado" : euros(producto.price)}. Ver ficha`}>
      <span className="bote__foto">
        <img
          src={foto(producto.images[0], 560)}
          srcSet={fotoSet(producto.images[0], 560)}
          alt=""
          loading="lazy"
        />
      </span>
      <span className="bote__texto">
        <span className="bote__nombre">{producto.title}</span>
        {desc && <span className="bote__desc">{desc}</span>}
        <span className="bote__precio">{agotado ? "Agotado" : euros(producto.price)}</span>
      </span>
    </button>
  );
}

/* ───────── La casa ───────── */

function Casa() {
  return (
    <section className="casa" id="casa" aria-labelledby="titulo-casa">
      <div className="casa__foto" aria-hidden>
        <picture>
          <source media="(max-width: 700px)" srcSet="/be-fondo-movil.webp" />
          <img src="/be-fondo.webp" alt="" loading="lazy" />
        </picture>
      </div>
      <Aparece className="casa__texto">
        <p className="etiqueta etiqueta--clara">04 · La casa</p>
        <h2 id="titulo-casa" className="casa__cita">
          Ladrillo, cuero, madera y un espejo <em>con marco dorado.</em>
        </h2>
        <p>
          Una barbería de las de antes con la ropa que se te queda cuando sales por la puerta. Vienes por el
          corte, te llevas la camiseta.
        </p>
      </Aparece>
    </section>
  );
}

/* ───────── Pie ───────── */

function Pie() {
  return (
    <footer className="pie">
      <span className="poste" aria-hidden />
      <div className="pie__fila">
        <p className="pie__marca">
          La Barbería de <em>Ethan</em>
        </p>
        <p className="pie__lema">
          {LEMA[0]}
          <br />
          {LEMA[1]}
        </p>
        <nav className="pie__nav" aria-label="Pie de página">
          <a href="#silla">La silla</a>
          <a href="#tienda">Camisetas</a>
          <a href="#cuidado">Pomada y aceite</a>
          <a href="#inicio">Volver arriba</a>
        </nav>
      </div>
      <p className="pie__legal">Pago seguro con Shopify · IVA incluido · Fotos de stock: Pexels</p>
    </footer>
  );
}

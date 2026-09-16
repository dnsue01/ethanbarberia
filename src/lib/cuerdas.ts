/* Física de carteles colgados (Verlet), heredada de Prendas Payas. */

/* Un único rastreador de puntero para las tres simulaciones: antes cada cartel
   registraba su propio listener global. */
const puntero = { x: -9999, y: -9999, vx: 0, vy: 0 };
let punteroUsos = 0;
let punteroUX = 0,
  punteroUY = 0,
  punteroUT = 0;

const punteroMover = (e: PointerEvent) => {
  const dt = Math.max((e.timeStamp - punteroUT) / 1000, 0.004);
  puntero.vx = (e.clientX - punteroUX) / dt;
  puntero.vy = (e.clientY - punteroUY) / dt;
  punteroUX = e.clientX;
  punteroUY = e.clientY;
  punteroUT = e.timeStamp;
  puntero.x = e.clientX;
  puntero.y = e.clientY;
};

/* al levantar el dedo el puntero desaparece: si se quedara en la última
   posición del toque, el cartel seguiría apartado de ese punto para siempre */
const punteroSoltar = (e: PointerEvent) => {
  if (e.pointerType === "mouse") return;
  puntero.x = puntero.y = -9999;
  puntero.vx = puntero.vy = 0;
};

/* Aceleración del móvil (sin gravedad), en px/s² de pantalla. Solo cuenta si es
   reciente: sin eventos nuevos el cartel no recibe nada. */
const movil = { ax: 0, ay: 0, t: -1 };
const MOVIL_PX = 450; // px por m/s²
const movilMover = (e: DeviceMotionEvent) => {
  const a = e.acceleration;
  if (!a || a.x == null || a.y == null) return;
  // por debajo de esto es ruido del sensor con el móvil quieto en la mano
  const limpia = (v: number) => (Math.abs(v) < 0.35 ? 0 : v);
  movil.ax = limpia(a.x) * MOVIL_PX;
  movil.ay = -limpia(a.y) * MOVIL_PX; // eje y del sensor apunta arriba; la pantalla, abajo
  movil.t = e.timeStamp;
};

/* iOS solo entrega devicemotion tras pedir permiso dentro de un gesto */
type DMConPermiso = typeof DeviceMotionEvent & { requestPermission?: () => Promise<string> };
const pedirMovil = () => {
  const DM = (typeof DeviceMotionEvent !== "undefined" ? DeviceMotionEvent : undefined) as
    | DMConPermiso
    | undefined;
  DM?.requestPermission?.().catch(() => {});
};

function usarPuntero() {
  if (punteroUsos++ === 0) {
    addEventListener("pointermove", punteroMover, { passive: true });
    addEventListener("pointerup", punteroSoltar, { passive: true });
    addEventListener("pointercancel", punteroSoltar, { passive: true });
    addEventListener("devicemotion", movilMover);
    addEventListener("pointerup", pedirMovil, { once: true });
  }
  return () => {
    if (--punteroUsos === 0) {
      removeEventListener("pointermove", punteroMover);
      removeEventListener("pointerup", punteroSoltar);
      removeEventListener("pointercancel", punteroSoltar);
      removeEventListener("devicemotion", movilMover);
      removeEventListener("pointerup", pedirMovil);
    }
  };
}

/* Con un panel abierto la escena queda detrás de un velo desenfocado: no tiene
   sentido seguir integrando física ni repintando SVG. */
export const pausa = { valor: false };

/* En táctil nadie empuja los carteles con el puntero: las cuerdas siguen
   dibujándose (las pinta este mismo bucle), pero a mitad de coste. */
const hayPuntero = () =>
  typeof matchMedia === "function" && matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ============ FÍSICA: cartel colgado de cuerdas de verdad (Verlet) ============
   Cada cuerda son 5 puntos con constraint de distancia solo a tracción (una
   cuerda no empuja); el cuerpo es rígido colgado de las dos cuerdas con
   gravedad. Solo se mueve si algo lo empuja: el puntero al pasar o el móvil al
   moverse. Sin viento ni balanceo propio. Las cuerdas se dibujan en SVG punto a
   punto. Devuelve el cleanup. */
export function simCuerdas(
  cont: HTMLElement,
  cuerpo: HTMLElement,
  poly1: SVGPolylineElement,
  poly2: SVGPolylineElement,
  { fuerza = 1 }: { fuerza?: number }
) {
  /* ---- geometría en coords locales del contenedor ---- */
  const medir = () => {
    const w = cont.clientWidth;
    const L = cuerpo.offsetTop; // largo de cuerda = margen superior del cuerpo
    const h = cuerpo.offsetHeight;
    return { w, L, h };
  };
  let { w, L, h } = medir();

  type P = { x: number; y: number; px: number; py: number; fija: boolean };
  const punto = (x: number, y: number, fija = false): P => ({ x, y, px: x, py: y, fija });

  const SEG = 4; // segmentos por cuerda
  let puntos: P[] = [];
  let cuerda1: P[] = [];
  let cuerda2: P[] = [];
  let a1: P, a2: P, fondo: P;
  let restEdge = 0, restLado = 0;

  const construir = () => {
    ({ w, L, h } = medir());
    const x1 = w * 0.3, x2 = w * 0.7; // anclajes arriba
    cuerda1 = Array.from({ length: SEG + 1 }, (_, i) => punto(x1, (L / SEG) * i, i === 0));
    cuerda2 = Array.from({ length: SEG + 1 }, (_, i) => punto(x2, (L / SEG) * i, i === 0));
    a1 = cuerda1[SEG]; // ataduras del cuerpo
    a2 = cuerda2[SEG];
    fondo = punto(w * 0.5, L + h); // masa del borde inferior
    puntos = [...cuerda1, ...cuerda2, fondo];
    restEdge = x2 - x1;
    restLado = Math.hypot(w * 0.2, h);
  };
  construir();

  /* constraint de distancia; soloTira=true => cuerda (no resiste compresión) */
  const enlaza = (a: P, b: P, rest: number, soloTira = false) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 0.0001;
    if (soloTira && d < rest) return;
    const dif = ((d - rest) / d) * 0.5;
    const ox = dx * dif, oy = dy * dif;
    if (!a.fija) { a.x += ox; a.y += oy; }
    if (!b.fija) { b.x -= ox; b.y -= oy; }
  };

  const resize = () => construir();
  const soltarPuntero = usarPuntero();
  addEventListener("resize", resize);

  /* ---- bucle ---- */
  const fino = hayPuntero();
  const G = 2400; // px/s²
  const DT = fino ? 1 / 120 : 1 / 60; // en táctil, mitad de substeps
  const VMAX = 7 * (0.5 + 0.5 * fuerza); // cuerpo pesado = menos brusco
  let acumulado = 0;
  let ultimoT = performance.now();
  let raf = 0;

  const paso = (t: number) => {
    acumulado += Math.min(t - ultimoT, 50);
    ultimoT = t;

    // panel abierto o pestaña oculta: nada que integrar ni repintar
    if (pausa.valor || document.hidden) {
      acumulado = 0;
      raf = requestAnimationFrame(paso);
      return;
    }

    const r = cont.getBoundingClientRect();
    const lx = puntero.x - r.left, ly = puntero.y - r.top; // puntero en coords locales
    // timeStamp de los eventos y t de rAF comparten reloj (performance.now)
    const punteroFresco = t - punteroUT < 60;
    const movilFresco = movil.t >= 0 && t - movil.t < 100;

    while (acumulado >= 1000 * DT) {
      acumulado -= 1000 * DT;

      // integración verlet (velocidad acotada: no puede dar la vuelta)
      for (const p of puntos) {
        if (p.fija) continue;
        let vx = (p.x - p.px) * 0.996;
        let vy = (p.y - p.py) * 0.996;
        const vm = Math.hypot(vx, vy);
        if (vm > VMAX) { vx = (vx / vm) * VMAX; vy = (vy / vm) * VMAX; }
        p.px = p.x; p.py = p.y;
        p.x += vx;
        p.y += vy + G * DT * DT;
      }

      // inercia al mover el móvil: el cartel se queda atrás respecto a la
      // pantalla, así que va en sentido contrario a la aceleración
      if (movilFresco) {
        for (const p of puntos) {
          if (p.fija) continue;
          const k = DT * DT * fuerza * (p.y / (L + h));
          p.x -= movil.ax * k;
          p.y -= movil.ay * k;
        }
      }

      // colisión con el puntero: el cuerpo es grande (radio lo cubre entero),
      // la cuerda fina; arrastra con la velocidad del ratón. Con el ratón
      // parado la última velocidad ya no vale: seguiría empujando sin moverse
      const vXc = punteroFresco ? Math.max(-3200, Math.min(3200, puntero.vx)) : 0;
      const vYc = punteroFresco ? Math.max(-3200, Math.min(3200, puntero.vy)) : 0;
      const Rcuerpo = Math.max(w, h) * 0.62;
      for (const p of puntos) {
        if (p.fija) continue;
        const esCuerpo = p === a1 || p === a2 || p === fondo;
        const R = esCuerpo ? Rcuerpo : 34;
        const dx = p.x - lx, dy = p.y - ly;
        const d = Math.hypot(dx, dy);
        if (d < R && d > 0.001) {
          const empuje = (R - d) / R;
          p.x += (dx / d) * empuje * 3 * fuerza;
          p.y += (dy / d) * empuje * 1.2 * fuerza;
          p.px -= vXc * DT * empuje * 0.35 * fuerza;
          p.py -= vYc * DT * empuje * 0.15 * fuerza;
        }
      }

      // constraints (varias pasadas para rigidez estable)
      for (let it = 0; it < (fino ? 6 : 3); it++) {
        for (let i = 0; i < SEG; i++) enlaza(cuerda1[i], cuerda1[i + 1], L / SEG, true);
        for (let i = 0; i < SEG; i++) enlaza(cuerda2[i], cuerda2[i + 1], L / SEG, true);
        enlaza(a1, a2, restEdge); // borde superior rígido
        enlaza(a1, fondo, restLado);
        enlaza(a2, fondo, restLado);
      }
    }

    // pintar cuerpo: posición y ángulo del borde de atadura
    const mx = (a1.x + a2.x) / 2, my = (a1.y + a2.y) / 2;
    const ang = Math.atan2(a2.y - a1.y, a2.x - a1.x);
    cuerpo.style.transform = `translate(${mx - w * 0.5}px, ${my - L}px) rotate(${ang}rad)`;

    // pintar cuerdas punto a punto
    poly1.setAttribute("points", cuerda1.map((p) => `${p.x},${p.y}`).join(" "));
    poly2.setAttribute("points", cuerda2.map((p) => `${p.x},${p.y}`).join(" "));

    raf = requestAnimationFrame(paso);
  };
  raf = requestAnimationFrame(paso);

  return () => {
    soltarPuntero();
    removeEventListener("resize", resize);
    cancelAnimationFrame(raf);
  };
}


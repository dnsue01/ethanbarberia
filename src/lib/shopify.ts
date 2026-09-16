/* Catálogo desde el JSON público de colecciones de Shopify (no hace falta token)
   y pago por cart permalink. Mientras no haya tienda configurada, la web enseña
   un catálogo de demostración con fotos de stock. */

const TIENDA = process.env.SHOPIFY_TIENDA?.replace(/\/$/, ""); // https://xxx.myshopify.com
/* Dominio donde vive el checkout. Si la tienda tiene dominio propio para el
   pago (tienda.labarberiadeethan.com) va aquí; si no, el myshopify. */
const PAGO = (process.env.NEXT_PUBLIC_SHOPIFY_PAGO ?? TIENDA ?? "").replace(/\/$/, "");

export type Variante = {
  id: number;
  title: string;
  available: boolean;
};

export type Producto = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  price: string;
  images: string[];
  variants: Variante[];
};

export type Catalogo = {
  camisetas: Producto[];
  cuidado: Producto[];
  demo: boolean;
  pago: string;
};

type RawProduct = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  images: { src: string }[];
  variants: { id: number; title: string; available: boolean; price: string }[];
};

async function coleccion(handle: string): Promise<Producto[] | null> {
  if (!TIENDA) return null;
  try {
    const res = await fetch(`${TIENDA}/collections/${handle}/products.json?limit=50`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { products: RawProduct[] };
    return data.products.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      body_html: p.body_html,
      price: p.variants[0]?.price ?? "0",
      images: p.images.map((i) => i.src),
      variants: p.variants.map((v) => ({ id: v.id, title: v.title, available: v.available })),
    }));
  } catch {
    return null;
  }
}

const tallas = (base: number, agotadas: string[] = []): Variante[] =>
  ["S", "M", "L", "XL"].map((t, i) => ({ id: base + i, title: t, available: !agotadas.includes(t) }));

const unica = (id: number): Variante[] => [{ id, title: "Default Title", available: true }];

/* Catálogo de demostración: se sustituye solo en cuanto hay tienda. */
const DEMO: Omit<Catalogo, "demo" | "pago"> = {
  camisetas: [
    {
      id: 1,
      title: "Me Pone Perrilla",
      handle: "me-pone-perrilla",
      body_html: "Camiseta negra de algodón grueso. Para los de la perilla bien perfilada.",
      price: "24.90",
      images: ["/stock/perrilla-front.webp", "/stock/perrilla-back.webp"],
      variants: tallas(101, ["XL"]),
    },
    {
      id: 2,
      title: "Me Pone Perrillo",
      handle: "me-pone-perrillo",
      body_html: "Para los del flequillo. Corte recto, algodón grueso y cuello que no se da de sí.",
      price: "24.90",
      images: ["/stock/perrillo-front.webp", "/stock/perrillo-back.webp"],
      variants: tallas(201),
    },
    {
      id: 3,
      title: "Degradado Blanco",
      handle: "degradado-blanco",
      body_html: "La básica blanca de la casa. Sale limpia como un degradado recién hecho.",
      price: "22.00",
      images: ["/stock/blanca-front.webp"],
      variants: tallas(301, ["S"]),
    },
    {
      id: 4,
      title: "Navaja y Tijera",
      handle: "navaja-y-tijera",
      body_html: "Negra y de algodón grueso. Para salir de la silla igual de bien.",
      price: "24.90",
      images: ["/stock/navaja-front.webp"],
      variants: tallas(401),
    },
  ],
  cuidado: [
    {
      id: 5,
      title: "Pomada Mate",
      handle: "pomada-mate",
      body_html: "Fijación media y acabado sin brillo. La que usa Ethan para peinar al terminar.",
      price: "14.50",
      images: ["/stock/balsamo.webp"],
      variants: unica(501),
    },
    {
      id: 6,
      title: "Aceite de Barba",
      handle: "aceite-de-barba",
      body_html: "Suaviza la barba y la perilla. Tres gotas por la mañana y listo.",
      price: "16.00",
      images: ["/stock/aceite.webp"],
      variants: unica(601),
    },
  ],
};

export async function getCatalogo(): Promise<Catalogo> {
  const [camisetas, cuidado] = await Promise.all([coleccion("camisetas"), coleccion("cuidado")]);
  // sin tienda, o tienda que no responde y sin nada publicado: catálogo demo
  if (!camisetas && !cuidado) return { ...DEMO, demo: true, pago: "" };
  return { camisetas: camisetas ?? [], cuidado: cuidado ?? [], demo: false, pago: PAGO };
}

export function euros(precio: string | number) {
  return Number(precio).toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €";
}

/** Checkout sin token: cart permalink de Shopify */
export function urlCheckout(pago: string, lineas: { variantId: number; qty: number }[]) {
  const partes = lineas.map((l) => `${l.variantId}:${l.qty}`).join(",");
  return `${pago}/cart/${partes}`;
}

/** Miniatura del CDN de Shopify al ancho pedido. Las fotos locales se dejan tal cual. */
export function foto(src: string, ancho: number) {
  if (!src || !src.includes("cdn.shopify.com")) return src;
  const [base, query] = src.split("?");
  const ext = base.lastIndexOf(".");
  if (ext < 0) return src;
  const conAncho = `${base.slice(0, ext)}_${ancho}x${base.slice(ext)}`;
  return query ? `${conAncho}?${query}` : conAncho;
}

/** srcset 1x/2x para pantallas densas. */
export function fotoSet(src: string, ancho: number) {
  if (!src || !src.includes("cdn.shopify.com")) return undefined;
  return `${foto(src, ancho)} 1x, ${foto(src, ancho * 2)} 2x`;
}

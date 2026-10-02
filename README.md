# La Barbería de Ethan

> la perilla me pone perrilla y el flequillo me pone perrillo

Tienda headless de Shopify hecha con Next.js 16. Web de scroll con identidad propia: portada con el espejo de latón, la tarifa de la silla (agenda llena), camisetas, pomada y aceite, la casa y el pie. La ficha de producto y la bolsa lateral se abren encima sin cambiar de página.

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Conectar Shopify

1. Copia `.env.example` a `.env.local` y pon la URL `*.myshopify.com` de la tienda.
2. En Shopify crea dos colecciones con estos handles:
   - `camisetas`
   - `cuidado` (pomada, aceite de barba...)
3. Listo. El catálogo se lee del JSON público de cada colección (`/collections/<handle>/products.json`, se refresca cada 5 min) y el pago va por cart permalink de Shopify (`/cart/<variante>:<cantidad>`), así que no hace falta token.

Sin `SHOPIFY_TIENDA` la web enseña un catálogo de muestra con fotos de stock (Pexels) y el botón de pagar queda desactivado.

## Estructura

- `src/components/Sitio.tsx`: cabecera, portada, cinta, tarifa de la silla, tienda, la casa y pie.
- `src/components/sitio.css`: todos los estilos (papel, tinta, rojo de poste y latón).
- `src/components/ProductModal.tsx`: ficha con tallas y fotos delante/detrás.
- `src/components/CartDrawer.tsx`: bolsa y pago.
- `src/lib/shopify.ts`: catálogo, demo y URL de pago.
- `src/lib/cart.tsx`: estado de la bolsa (se guarda en localStorage).

Fotos de stock: Pexels (licencia libre).

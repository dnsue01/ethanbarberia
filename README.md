# Ethan Barbershop

> la perilla me pone perrilla y el flequillo me pone perrillo

Tienda de camisetas headless de Shopify hecha con Next.js 16. Web de ecommerce convencional (inicio, listado con búsqueda y orden, ficha de producto y bolsa lateral) con estética de barbería.

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Conectar Shopify

1. Copia `.env.example` a `.env.local` y pon la URL `*.myshopify.com` de la tienda.
2. En Shopify crea una colección con este handle:
   - `camisetas`
3. Listo. El catálogo se lee del JSON público de cada colección (`/collections/<handle>/products.json`, se refresca cada 5 min) y el pago va por cart permalink de Shopify (`/cart/<variante>:<cantidad>`), así que no hace falta token.

Sin `SHOPIFY_TIENDA` la web enseña un catálogo de muestra con fotos de stock (Pexels) y el botón de pagar queda desactivado.

## Estructura

- `src/app/page.tsx`: inicio. `src/app/tienda`: listado. `src/app/producto/[handle]`: ficha.
- `src/components/Cabecera.tsx`, `Pie.tsx`, `Tarjeta.tsx`, `Listado.tsx`, `FichaProducto.tsx`.
- `src/components/CartDrawer.tsx`: bolsa y pago.
- `src/lib/shopify.ts`: catálogo, demo y URL de pago.
- `src/lib/cart.tsx`: estado de la bolsa (se guarda en localStorage).

Fotos de stock: Pexels (licencia libre).

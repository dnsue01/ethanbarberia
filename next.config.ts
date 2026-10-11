import type { NextConfig } from "next";

const dev = process.env.NODE_ENV === "development";

const seguridad = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  ...(dev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://cdn.shopify.com",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

/* Vista previa en GitHub Pages: export estático bajo /ethanbarberia.
   Solo se activa con GITHUB_PAGES=true; Vercel y local siguen igual. */
const pages = process.env.GITHUB_PAGES === "true";
const base = pages ? "/ethanbarberia" : "";

const nextConfig: NextConfig = pages
  ? { output: "export", basePath: base, trailingSlash: true, env: { NEXT_PUBLIC_BASE: base } }
  : { headers: async () => [{ source: "/(.*)", headers: seguridad }] };

export default nextConfig;

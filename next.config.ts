import type { NextConfig } from "next";

// Static export (ADR-001): Netlify sirve /out, sin servidor Node.
const nextConfig: NextConfig = {
  output: "export",
  // /catalogo -> /catalogo/index.html: resuelve en cualquier server estático (Netlify, python http.server)
  trailingSlash: true,
  // next/image sin optimizador de servidor; decisión CDN abierta en F026
  images: { unoptimized: true },
};

export default nextConfig;

# Log de progreso entre sesiones

> Este archivo es un log append-only, no un feature tracker (eso es `feature-list.json`). Cada sesión agrega una entrada al final. No lo reescribas ni borres entradas anteriores -- es la única memoria real que tiene la siguiente sesión sobre por qué se tomó una decisión, no solo qué archivo cambió.

## Formato de cada entrada

```
## <YYYY-MM-DD HH:MM> — Sesión <N>
**Feature(s) trabajada(s):** F00X — <título>
**Qué se hizo:** (2-4 líneas, enfocado en decisiones y por qué, no en "edité archivo X")
**Verificación realizada:** (qué corriste para confirmar que funciona -- incluye si probaste un checkout en sandbox)
**Estado al cerrar:** passing / failing / bloqueado — por qué
**Pendiente para la próxima sesión:** (explícito, no lo dejes implícito en el código)
**Commit:** <hash o mensaje>
```

---

## 2026-09-25 — Sesión 0 (setup inicial)
**Feature(s) trabajada(s):** ninguna (inicialización)
**Qué se hizo:** `solutions-architect` resolvió las contradicciones del brief (Snipcart + tarjeta vs. cobro por Pago Móvil/Transferencia; PostgreSQL vs. catálogo JSON) en `docs/adr/ADR-001-plataforma.md`: frontend estático custom (Next.js export en Netlify), catálogo en `data/products.json`, carrito en localStorage, checkout con Netlify Forms, pago manual con comprobante por WhatsApp, sin DB ni Snipcart. `ecommerce-product-owner` descompuso el alcance en 28 features (`feature-list.json`, todas `failing`; 17 P0). `AGENTS.md` llenado con las decisiones reales. `scripts/init.sh` adaptado: lint + build estático + Playwright e2e sobre `/out` servido con `python3 -m http.server`.
**Verificación realizada:** `feature-list.json` validado (JSON, IDs únicos, todas failing). `init.sh` corrido: falla a propósito con mensaje claro porque aún no existe `package.json` (lo crea F001). No hay sandbox de pago que probar (no hay pasarela).
**Estado al cerrar:** N/A — solo setup
**Pendiente para la próxima sesión:** F001 (scaffold Next.js + `.nvmrc` + `playwright.config.ts` con webServer `python3 -m http.server 3000 -d out` + `trailingSlash: true` para que las rutas exportadas resuelvan en ese server). Datos del cliente pendientes, no inventarlos: catálogo real (nombres, precios USD, medidas, disponibilidad), fotos (3+ ángulos + ambiente), datos de Pago Móvil/cuenta bancaria, número WhatsApp, tarifa/umbral de envío Miranda/Caracas, si factura (cédula/RIF), paleta/tipografía del Instagram, textos de "Quiénes somos" y política de devoluciones. Mientras tanto usar placeholders marcados como tales.
**Commit:** commit inicial (ver `git log`)

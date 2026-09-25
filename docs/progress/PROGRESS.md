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

## 2026-09-25 — Sesión 1
**Feature(s) trabajada(s):** F001 — Scaffold del proyecto Next.js + script de arranque + smoke test
**Qué se hizo:** Next.js 16.3 (App Router, TS, ESLint, sin Tailwind: CSS plano hasta que F002 defina la identidad) con `output: 'export'`, `trailingSlash: true` e `images.unoptimized` (F026 sigue abierta). Home placeholder en español. Playwright con `webServer` = `python3 -m http.server 3100 -d out` (prueba el build estático real, no `next dev`), proyectos mobile + desktop. `.nvmrc` = Node 26.3.0. `CLAUDE.md` = `@AGENTS.md`. Next 16 inyecta al inicio de `AGENTS.md` un bloque "This is NOT the Next.js you know": se commitea tal cual (si se borra, `next dev` lo recrea) — leer `node_modules/next/dist/docs/` antes de usar APIs de Next.
**Bug encontrado y corregido:** `.claude/settings.json` fijaba `env.NODE_ENV=development` para todos los comandos de Claude; `next build` con NODE_ENV no estándar falla al prerenderizar `/_global-error` (`Cannot read properties of null (reading 'useContext')`). Se quitó el bloque `env`. Las sesiones que arrancaron antes del cambio siguen teniendo la variable: usar `env -u NODE_ENV ./scripts/init.sh`.
**Verificación realizada:** `env -u NODE_ENV ./scripts/init.sh --no-dev` → lint OK, build genera `out/index.html`, 2/2 tests Playwright OK. `next dev` responde y renderiza el home. No se tocó checkout/pagos.
**Estado al cerrar:** F001 passing.
**Pendiente para la próxima sesión:** siguiente P0 en orden: F002 (identidad visual y home). Necesita paleta y tipografía del Instagram de Deconova (dato del cliente pendiente; si no llega, proponer y marcar como provisional). Falta `netlify.toml` (build `npm run build`, publish `out`) cuando se haga el primer deploy. `npm` avisa de un postinstall sin aprobar en `unrs-resolver` (dependencia de eslint-config-next); lint funciona igual.
**Commit:** F001: scaffold Next.js static export + smoke e2e

## 2026-09-25 — Sesión 2
**Feature(s) trabajada(s):** F003 — Catálogo de productos desde /data/products.json
**Qué se hizo:** Se eligió F003 antes que F002 porque F002 está bloqueada por datos de marca del cliente (paleta/tipografía/fotos; su nota pide no inventarlos) y F003 no. `data/products.json` con 3 productos `[DEMO]` y una imagen placeholder SVG ("Foto pendiente"). `src/lib/products.ts` tipa y valida el JSON en build time (slug, name, priceUsd > 0, images no vacío, slugs únicos): un dato roto rompe el build en vez de publicarse. Esquema mínimo a propósito (slug, name, priceUsd, images) — F004/F005/F006 agregan campos (galería, medidas, disponibilidad). `/catalogo/` es server component → HTML estático; precio con `Intl` es-VE ("USD 1.250,00"). Tarjetas sin link a detalle todavía (la ruta de producto es F004). Home con link provisional "Ver catálogo" (F002 lo rediseña).
**Verificación realizada:** `env -u NODE_ENV ./scripts/init.sh --no-dev` → 8/8 Playwright (mobile+desktop). Manual: agregar un producto al JSON + `npm run build` → aparece en `out/catalogo/index.html`; `priceUsd` inválido → build exit 1. JSON restaurado después.
**Estado al cerrar:** F003 passing (con data demo).
**Pendiente para la próxima sesión:** F004 (página de producto con galería), que habilita el link desde las tarjetas del catálogo. F002 sigue esperando paleta/tipografía/fotos del cliente. Nota operativa: la shell es zsh — usar `$?` o `$pipestatus`, no `${PIPESTATUS[0]}`.
**Commit:** F003: catálogo estático desde data/products.json

## 2026-09-25 — Sesión 3
**Feature(s) trabajada(s):** F004 — Página de producto con galería multi-imagen
**Qué se hizo:** `/productos/[slug]/` estática vía `generateStaticParams` + `dynamicParams = false` (slug fuera del JSON = 404). Galería client component (`src/components/Gallery.tsx`): imagen principal + flechas anterior/siguiente (circulares) + miniaturas como `<button>` con `aria-current`; con 1 sola foto no renderiza controles (degradación del criterio 3). Tarjetas del catálogo ahora enlazan al detalle. Placeholders por ángulo (frente/lateral/detalle/ambiente); demo con 4, 3 y 1 foto a propósito para cubrir la degradación. Next 16: `priority` está deprecado → se usa `preload` en la imagen principal.
**Bug encontrado y corregido:** en mobile, 4 miniaturas ensanchaban la columna del grid (`min-width: auto` de los grid items) y la flecha "siguiente" quedaba fuera del viewport, inalcanzable. Fix: `.main > * { min-width: 0 }` en `producto.module.css`. Lo detectó el e2e mobile, no una revisión visual.
**Verificación realizada:** `env -u NODE_ENV ./scripts/init.sh --no-dev` → 18/18 Playwright (mobile+desktop): navegación con flechas/miniaturas/vuelta circular, producto de 1 foto sin controles, link catálogo→detalle, slug inexistente 404. HTML generado: principal con `<link rel="preload">`, miniaturas `loading="lazy"`.
**Estado al cerrar:** F004 passing, con un límite: no hay `srcset`/tamaños por ancho porque `images.unoptimized` no genera variantes; eso queda en F026 (decisión de CDN/loader).
**Pendiente para la próxima sesión:** F005 (medidas) y F006 (disponibilidad): ambas agregan campos al JSON y se muestran en la página de producto recién creada. F002 sigue bloqueada por datos de marca del cliente.
**Commit:** F004: página de producto con galería

## 2026-09-25 — Sesión 4
**Feature(s) trabajada(s):** F002 — Identidad visual y home
**Qué se hizo:** El cliente entregó el design system (paleta oscura + dorado, Fraunces/Italiana/Jost/Work Sans, reglas anti-template) → guardado en `docs/design-system.md` y referenciado desde AGENTS.md. Se ignoró su mención a Snipcart (obsoleta por ADR-001). Tokens en `globals.css`; fuentes con `next/font/google` (auto-hospedadas en el build). Header (marca + nav Catálogo/Contacto) y footer `#contacto` (Instagram real @deconova.ve; WhatsApp aún sin número, no se muestra) movidos al layout: presentes en todas las páginas. Home: hero asimétrico 7fr/5fr con una sola CTA "Ver catálogo" y foto desplazada; "Del catálogo" con 1 pieza grande + 2 apiladas; "Cómo comprar" en 4 pasos que describen el flujo real de ADR-001. Catálogo, producto y galería re-estilizados (cards rectas, borde dorado en hover). Placeholders re-hechos en tono oscuro + `public/home/hero-placeholder.svg`.
**Verificación realizada:** `env -u NODE_ENV ./scripts/init.sh --no-dev` → 26/26 Playwright. Nuevo `e2e/home.spec.ts`: fuentes computadas (Fraunces/Italiana/Jost/Work Sans, nunca Inter), links a catálogo y contacto, destacados → detalle, 0 gradientes, sin copy genérico, hero con un solo link. Revisión visual con capturas mobile/desktop: corregidos hueco bajo la pieza grande de destacados, precio fuera de la card en catálogo y alturas desiguales de cards.
**Estado al cerrar:** F002 passing (con fotos placeholder).
**Pendiente para la próxima sesión:** F005 (medidas) y F006 (disponibilidad) — el home ya promete "medidas y disponibilidad en cada ficha", así que son las siguientes. Fotos reales y número de WhatsApp siguen pendientes del cliente. Nota: `pkill -f <patrón>` en un comando compuesto mata su propia shell (exit 144) — usar `pgrep` para buscar el PID y `kill` por separado.
**Commit:** F002: identidad visual y home con design system del cliente

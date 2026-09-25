# AGENTS.md — Deconova eCommerce (deconova_ec)

> Formato estándar cross-tool (Codex, Cursor, Claude Code y otros lo leen). En Claude Code, este archivo se usa automáticamente **solo si no existe un `CLAUDE.md`** en la misma carpeta -- si necesitas algo específico de Claude Code que este formato no cubre, agrega un `CLAUDE.md` corto adicional (ver nota al final).
>
> Estructura basada en ["Effective harnesses for long-running agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (Anthropic, ingeniería) -- el problema que resuelve: un agente que trabaja en sesiones sucesivas no tiene memoria compartida entre una sesión y la siguiente. Este archivo, más `docs/progress/feature-list.json` y `docs/progress/PROGRESS.md`, son el puente entre sesiones.

## Qué es este proyecto

Deconova es un fabricante y comercializador de muebles ubicado en Miranda, Venezuela que comercializa muebles de gama media y alta para el hogar. Esta es su red social y medio de venta de momento https://www.instagram.com/deconova.ve/?hl=en (usa como referencia estetica los colores, estilo y fuente de las publicaciones). Requiere una pagina elegante y llamativa que incorpore funcionalidad de ecommerce para expandir sus canales de ventas. De momento no se requiere conexion a pasarelas de pago como stripe o algo por el estilo. Los cobros se harian por Pago Movil o Transferencia.

## Decisión de plataforma (la más cara de revertir -- ver `.claude/agents/solutions-architect.md`)

- **Modelo:** custom — frontend estático sin backend de comercio (ni monolítica ni headless con motor de comercio).
- **Justificación:** no hay pasarela de pago que integrar (Stripe no opera en Venezuela; cobro manual por Pago Móvil/Transferencia), el catálogo es casi inmutable (<20 SKUs) y el volumen de pedidos es mínimo. Shopify/WooCommerce/Snipcart cobrarían por resolver un checkout con tarjeta que este negocio no tiene. Ver `docs/adr/ADR-001-plataforma.md`.

## Stack

- Frontend: Next.js (App Router, TypeScript) con `output: 'export'` → `/out`, deploy a Netlify vía Git.
- Backend: ninguno propio. Catálogo en `data/products.json` tipado en TS e importado en build time (edición = commit). Carrito en `localStorage` (React Context). Checkout = formulario **Netlify Forms** (honeypot activo) con el carrito serializado en un input oculto. Sin Snipcart, sin Netlify Functions en v1.
- Base de datos: ninguna en v1. Netlify Forms es el registro de pedidos (dashboard + email + CSV). Si crece el volumen: Google Sheets/Airtable antes que Postgres.
- Motor de búsqueda/facetas: ninguno — `.filter()` sobre el JSON alcanza para <20 SKUs.
- Pasarela(s) de pago: ninguna. Pago Móvil / Transferencia mostrados en la confirmación; pedido "pendiente de confirmación"; comprobante por WhatsApp (`wa.me` pre-llenado con nº de pedido); conciliación manual del vendedor. No existe sandbox de pago — la verificación e2e termina en la pantalla de confirmación con instrucciones de pago.
- Hosting/CDN: Netlify (plan free).
- Precios: USD. Sin conversión a Bs/tasa BCV en v1 (decisión abierta).
- Inventario: booleano editorial `disponible` / bajo pedido, sin decremento atómico (desviación deliberada documentada en ADR-001).

## Contexto de negocio relevante para las decisiones técnicas

- Volumen de catálogo esperado: <20 SKUs, ~5 nuevos por año.
- Jurisdicción(es) de venta: Venezuela (una sola). Envío: Miranda/Caracas con flete propio; resto del país a coordinar por WhatsApp.
- Marco de privacidad aplicable: no determinado aún (Venezuela no tiene ley integral de protección de datos; aplicar minimización: nombre, teléfono, dirección, email — no pedir cédula salvo factura).
- Picos de tráfico esperados: bajos; campañas puntuales desde Instagram. El CDN estático de Netlify los absorbe sin configuración.

## Flujo end-to-end -- ver guía en `.claude/agents/conversion-ux-designer.md`:

- Usuario navega catálogo estático (Next.js/Netlify).
- "Agregar al carrito" → carrito en `localStorage`, visible en todo el sitio.
- Checkout → formulario (datos de contacto, dirección, zona de envío) enviado a Netlify Forms.
- Confirmación → número de pedido, resumen, datos de Pago Móvil/Transferencia copiables, botón WhatsApp para enviar comprobante. Si el envío del form falla: error inline + fallback `wa.me` con el pedido.

## Protocolo de inicio de sesión (léelo primero, cada vez)

Si estás retomando este proyecto sin contexto de una sesión anterior, sigue este orden -- no lo saltes ni empieces a escribir código antes de completarlo:

1. `pwd` -- confirma el directorio de trabajo real, no asumas.
2. Lee `git log --oneline -20` y `docs/progress/PROGRESS.md` para entender qué se hizo en la sesión anterior y por qué (no solo qué archivos cambiaron).
3. Lee `docs/progress/feature-list.json` y elige la feature de mayor prioridad con `"status": "failing"`. No trabajes en varias features a la vez -- una por sesión, terminada y verificada, es mejor que tres a medias.
4. Corre `./scripts/init.sh` para levantar el entorno -- no asumas que el entorno ya está corriendo de la sesión anterior.
5. Corre una verificación básica end-to-end (no solo tests unitarios) antes de tocar código, incluyendo un checkout de prueba en sandbox si tocaste algo del flujo de pago. Si algo está roto y no está en `PROGRESS.md`, documéntalo antes de seguir.
6. Implementa la feature elegida. Al terminar: corre los tests, marca `"status": "passing"` en `feature-list.json` **solo si la verificaste tú mismo, no porque "debería funcionar"**, actualiza `PROGRESS.md` con qué se hizo y qué queda pendiente, y haz commit con mensaje descriptivo.

## Reglas no negociables sobre `feature-list.json`

- Es JSON, no Markdown, a propósito -- el modelo tiende a editarlo con más cuidado en JSON que en texto libre.
- **Nunca borres ni edites un test para que una feature pase.** Si un test está mal escrito, dilo explícitamente y pide confirmación antes de tocarlo.
- Solo se edita el campo `status` (y `notes` si aplica) de una feature existente.
- Una feature nueva que descubras durante el trabajo se agrega con `"status": "failing"`, no se implementa "de paso" sin registrarla.

## Reglas no negociables de eCommerce

> En este proyecto (ADR-001) no hay tarjetas, webhooks ni servidor: las reglas de PAN y webhooks quedan latentes hasta que se integre una pasarela; inventario es editorial (sin decremento atómico); "recalcular en servidor" se cumple porque el vendedor recalcula el total del pedido al confirmarlo manualmente — el total que envía el formulario es informativo, nunca vinculante.

- Datos de tarjeta (PAN): nunca tocan el backend propio -- solo campos tokenizados de la pasarela.
- Precios y totales: se recalculan siempre en el servidor, nunca se confía en el total que envía el cliente.
- Inventario: decremento atómico, consciente de condiciones de carrera (dos compras simultáneas del último stock es un caso real).
- Checkout/órdenes: idempotentes ante reintentos -- un timeout de red nunca debe duplicar un cobro o una orden.
- Webhooks de pago: verificación de firma obligatoria, procesamiento idempotente.
- SEO: páginas de producto/categoría con contenido en el HTML inicial (SSR/SSG), no dependientes de JS para indexar.
- Secrets/credenciales de pasarela: nunca en código ni logs; producción y sandbox con credenciales separadas.

## Comandos de proyecto

```bash
./scripts/init.sh        # instala, build estático, sirve /out y corre el smoke e2e
npm run dev              # dev server en :3000
npm run build            # static export → /out
npm run lint
npx playwright test      # e2e (catálogo → carrito → checkout → confirmación)
netlify deploy --build   # preview real: Netlify Forms solo funciona desplegado
```

## Equipo de subagentes especializados

Ver `.claude/agents/` y `docs/AGENT_TEAM.md` para el razonamiento completo (incluyendo por qué son 10 en vez de los 8 de otras versiones del harness). Estos son revisores/especialistas que invocas *dentro* de una sesión de trabajo -- el agente principal sigue siendo quien lee `feature-list.json` y `PROGRESS.md` y decide qué hacer.

| Cuándo | Agente |
|---|---|
| Definir qué construir | `ecommerce-product-owner` |
| Headless vs. plataforma vs. custom, contratos, motor de búsqueda | `solutions-architect` |
| Implementación de storefront (theme o frontend custom) | `frontend-engineer` |
| Catálogo, carrito, órdenes, inventario | `backend-engineer` |
| Pasarela de pago, PCI scope, webhooks, impuestos/envío | `payments-integration-engineer` |
| SEO técnico y Core Web Vitals | `seo-performance-engineer` |
| Flujo de checkout, fricción de carrito, mobile/accesibilidad | `conversion-ux-designer` |
| Antes de release / revisión adversarial de tests | `qa-test-engineer` |
| Antes de mergear algo que toca pagos/datos de cliente | `security-compliance-reviewer` |
| Infra/despliegue, picos de tráfico | `devops-sre` |

**Nota honesta del artículo de Anthropic:** ellos mismos dejan esto como pregunta abierta, no como respuesta resuelta -- "*whether specialized sub-agents... might outperform a single general-purpose agent across contexts*". Este equipo de 10 es una apuesta razonada para un dominio con costos de error muy dispares (un bug de SEO no es lo mismo que una fuga de datos de tarjeta), no una recomendación validada de Anthropic.

## Qué NO hacer

- Evita utilizar:
  - Layout y estructura

        Hero centrado con headline genérica + subtexto + 2 botones (uno filled, uno outline) — el patrón más reconocible de todos
        Grid de 3 columnas con ícono + título + párrafo, repetido para "features"
        Todo con border-radius uniforme de 8-12px en cada card, sin variación
        Espaciado perfectamente simétrico en todas direcciones (padding idéntico arriba/abajo/lados en cada sección)

  - Color y tipografía

        Paleta de "gradiente violeta-a-azul" o "índigo-a-rosa" — el gradiente default que generan la mayoría de modelos
        Una sola familia tipográfica (Inter o system-ui) sin jerarquía real de peso/tamaño más allá de h1/h2/p
        Contraste "seguro" — todo en escala de grises + un solo color de acento, sin decisiones de color con intención

  - Componentes

        Cards con box-shadow sutil + hover que las levanta 2px — literalmente todos los templates lo hacen
        Iconos de Lucide/Heroicons sin curar, uno por feature, sin relación visual entre ellos
        Badges/pills redondeados para "categorías" o "tags" sin razón de negocio clara
        Testimonials en carousel de 3 tarjetas con avatar circular + estrellas

  - Copy

        Headlines tipo "Transform your [industry] with [product]" o "The future of X"
        CTAs genéricos: "Get Started", "Learn More", "Try it Free" sin especificidad
        Social proof falso o vacío: "Trusted by 10,000+ businesses" sin logos reales

  - Movimiento

        Fade-in + slide-up al hacer scroll en cada sección, mismo timing, sin variación (Framer Motion default)
        Micro-interacciones que existen porque "se ven bien" sin comunicar estado real
---

## Si este proyecto necesita algo Claude-específico

Si necesitas hooks, permisos granulares (`.claude/settings.json` ya los trae), o cualquier capacidad que no sea portable a otras herramientas, no lo metas aquí -- crea un `CLAUDE.md` corto en la misma carpeta que solo cubra eso. Claude Code prioriza `CLAUDE.md` sobre `AGENTS.md` cuando ambos existen.

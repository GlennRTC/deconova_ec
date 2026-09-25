# ADR-001: Plataforma para el ecommerce de Deconova
**Fecha:** 2026-09-25
**Estado:** aceptado

**Contexto:**
Deconova fabrica y vende muebles de gama media/alta, hoy solo por Instagram. Quiere un sitio propio con ecommerce. Catálogo: <20 SKUs, ~5 nuevos/año (prácticamente estático). Una sola jurisdicción (Venezuela). No existe pasarela de tarjeta operativa en el país para este negocio (Stripe no opera en Venezuela) -- los cobros reales son Pago Móvil o Transferencia bancaria, conciliados a mano por el vendedor contra un comprobante/captura de pantalla. El usuario propuso Next.js estático + Netlify + Snipcart + "PostgreSQL", pero esa combinación es contradictoria: Snipcart está diseñado alrededor de pasarelas de tarjeta y cobra fee mensual + 2% por transacción sobre un flujo de pago que aquí no existe; y Postgres no tiene ningún dato transaccional real que justifique su operación (backups, migraciones, un servidor que mantener) para 20 SKUs casi inmutables y un puñado de pedidos al mes.

**Decisión:**
- **Modelo:** ninguno de los tres canónicos aplica limpio; se opta por un **frontend estático custom sin backend de comercio**, justificado por una razón de negocio concreta (no por preferencia técnica): no hay pasarela de pago que integrar, el catálogo es casi inmutable, y el volumen de pedidos es mínimo. Una plataforma monolítica (Shopify/WooCommerce) cobraría una cuota mensual por resolver un problema -- checkout con tarjeta -- que este negocio no tiene. Headless con un motor de comercio (Medusa/Saleor/commercetools) sería sobre-ingeniería para 20 SKUs sin gestión de inventario en tiempo real.
- **Stack:**
  - Frontend: Next.js (App Router) con `output: 'export'` (static export), deploy a Netlify vía Git.
  - Catálogo: `/data/products.json` en el repo, tipado en TS, importado en build time. Edición = PR/commit, no CMS ni panel admin en v1.
  - Carrito: estado en `localStorage` (React Context), sin backend de carrito, sin Snipcart.
  - Checkout/orden: formulario nativo con **Netlify Forms** (`data-netlify="true"`, honeypot activado) -- el contenido del carrito viaja serializado en un input oculto. Sin Netlify Function en v1 (no hay lógica de servidor que justifique escribirla: Netlify Forms ya guarda el envío, notifica por email y permite exportar CSV).
  - Pago: se muestran en pantalla de confirmación los datos de Pago Móvil (teléfono, cédula/RIF, banco) y de Transferencia (cuenta), en texto copiable. El pedido queda en estado "pendiente de confirmación". El comprador envía el comprobante por WhatsApp (link `wa.me` pre-llenado con número de pedido) o responde al correo de confirmación. La confirmación de pago es 100% manual por el vendedor -- no hay webhook de pago porque no hay pasarela.
  - Precio: solo en USD en v1. No se muestra referencia en Bs/tasa BCV automatizada (evita el riesgo de una tasa desactualizada mostrada como si fuera oficial); la conversión se resuelve manualmente al confirmar por WhatsApp.
  - Inventario: campo `disponible: boolean` (o `"bajo pedido"`) por SKU en el JSON, editorial. **No hay decremento atómico de stock** -- desviación deliberada de la regla genérica de AGENTS.md sobre inventario, porque no hay captura de pago en tiempo real que dispare una carrera de stock: la verificación de disponibilidad ocurre en la confirmación manual del vendedor, no en código.
  - Envío: dos opciones fijas en el formulario -- "Miranda/Caracas (flete propio)" con tarifa fija o umbral de envío gratis (definir monto con el cliente) y "Resto del país: a coordinar por WhatsApp" (sin tarifario de encomiendas automatizado).
  - Fail-hard vs. degradar: si el envío del formulario (Netlify Forms) falla, la UI muestra error inline + un link `wa.me` con el pedido pre-llenado como fallback -- el comprador nunca queda bloqueado, porque el canal de venta actual (WhatsApp/Instagram DM) sigue siendo válido.
  - Base de datos: **ninguna en v1.** Netlify Forms es el registro de pedidos. Se documenta como decisión abierta migrar a una hoja de cálculo (Airtable/Google Sheets) o recién ahí a Postgres si el volumen de pedidos o la necesidad de estados (pagado/enviado) lo justifica.
  - Motor de búsqueda/facetas: ninguno. 20 SKUs con crecimiento de ~5/año no necesita ni un filtro client-side sofisticado; un `.filter()` sobre el array del JSON alcanza. Revisar solo si `ecommerce-product-owner` reporta un salto real en el volumen de catálogo.
  - Hosting/CDN: Netlify (build está + Netlify Forms + CDN incluidos, sin infra que operar).

**Alternativas consideradas:**
- Shopify/WooCommerce (monolítico) -- descartado: cuota mensual y complejidad de plataforma para resolver checkout con tarjeta/gestión de inventario en tiempo real, ninguno de los cuales es un problema real de este negocio.
- Snipcart con "custom payment gateway" API (mostrar Pago Móvil vía una Netlify Function que Snipcart invoca) -- descartado: sigue cobrando el fee mensual/2% de Snipcart por una UI de carrito que un `localStorage` + formulario resuelve gratis, y agrega una dependencia externa (disponibilidad de Snipcart, cambios de API) sin beneficio proporcional al volumen del negocio.
- Headless con motor de comercio (Medusa/Saleor) -- descartado: valor real de un motor de comercio es inventario/precios/impuestos multi-canal a escala; aquí no hay ninguno de esos tres en juego.
- PostgreSQL para catálogo/pedidos -- descartado en v1: no hay ninguna consulta relacional real (joins, transacciones concurrentes) que un JSON de 20 filas y un dashboard de formularios no resuelvan; postergar hasta que haya evidencia de necesitarlo.

**Consecuencias:**
- Mejora: costo operativo ~$0 más allá de hosting de Netlify (plan free cubre holgadamente <100 envíos/mes); sin dependencia de terceros de pago; sin PCI scope real (nunca se toca un dato de tarjeta); despliegue y mantenimiento triviales para un equipo pequeño.
- Se vuelve más difícil: no hay panel de administración -- actualizar el catálogo requiere un commit/PR (aceptable dado ~5 SKUs/año, pero hay que ser explícito con el cliente sobre ese flujo); no hay trazabilidad de estado de pedido más allá del dashboard/email de Netlify Forms (si el negocio crece, migrar de "leer el email" a un sistema de estados es trabajo no trivial); no hay reserva de stock automática, así que hay una ventana (corta, dado el volumen) donde dos compradores pueden pedir el mismo mueble "bajo pedido" antes de que el vendedor lo note -- aceptable al volumen actual, no a escala.
- Riesgo aceptado conscientemente: Netlify Forms cambia límites/comportamiento de vez en cuando (rung de riesgo señalado por `solutions-architect`) -- verificar cuota y comportamiento de honeypot/spam contra la documentación vigente antes de depender de él en producción, no asumir lo que se sabía en 2024.
- Riesgo aceptado: si el negocio decide en el futuro aceptar tarjetas o expandirse a otro país, este ADR queda obsoleto y debe reemplazarse explícitamente (no parchear Snipcart encima después).

**Referencias:** AGENTS.md (sección "Qué es este proyecto", "Stack", "Contexto de negocio"), Instagram @deconova.ve.

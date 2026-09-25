# Design system — Deconova (v2, claro, estructura tipo catálogo)

Aprobado por el cliente (sesión 7, 2026-09-25); reemplaza la v1 oscura/boutique de la sesión 4.
Referencia: estructura de ikea.com (fondo claro, grid denso, tipografía funcional, precio prominente), **no** sus colores (#0058A3/#FFDA1A, riesgo de marca).
Tokens en `src/app/globals.css`; fuentes vía `next/font/google` en `src/app/layout.tsx`.

## Paleta (70% blanco/gris claro / 20% neutros cálidos / 10% dorado)

| Token | Valor | Uso |
|---|---|---|
| `--bg-primary` | #FFFFFF | fondo dominante |
| `--bg-surface` | #F5F3F0 | fondo de foto, secciones alternas, resumen de carrito |
| `--bg-dark-section` | #141210 | **máximo 2 secciones**: hero del home y footer |
| `--accent-gold` | #B8935A | fondo de botones (texto `--text-primary` encima, 6.2:1) |
| `--accent-gold-dark` | #8F6F3F | **precios** y hover de botones (texto blanco, 4.65:1) |
| `--text-primary` | #1A1815 | texto |
| `--text-muted` | #6B6459 | secundario, labels (5.85:1) |
| `--border-subtle` | #E5E1DB | separadores de cards (en vez de sombra) |
| `--material-walnut` / `--material-marble` | #4A3327 / #5C5A57 | solo texturas en fotografía |

**Desviación deliberada del documento del cliente:** el documento pide precios en `--accent-gold`, pero #B8935A sobre blanco da 2.85:1 y falla WCAG AA incluso para texto grande en negrita (mínimo 3:1). Los precios usan `--accent-gold-dark` (4.65:1): mismo tono, legible.

## Tipografía

| Rol | Fuente |
|---|---|
| Títulos, precios, marca | Manrope 800 |
| Cuerpo, UI, navegación | Work Sans (400 cuerpo, 500–600 nav/botones), sin tracking amplio |

Prohibido: Inter. Se abandonaron Fraunces, Italiana y Jost de la v1.

## Composición

- Fondo blanco dominante; foto de producto sobre `--bg-surface`, nunca sobre fondo oscuro.
- Grid denso: 2 columnas en mobile, hasta 5 en desktop (`minmax(min(15rem, 45%), 1fr)`).
- Precio siempre visible y grande en cada card, con "Agregar al carrito" directo en la card.
- Separación con línea fina (`--border-subtle`), sin box-shadow ni "levantar 2px".
- Botones en píldora (radio 999px); fotos y cards rectas.
- Iconografía lineal simple (SVG inline, trazo 1.6).
- Sin gradientes decorativos; al menos una sección asimétrica ("Cómo comprar" 1fr/2fr); copy específico del negocio.
- Fotos: placeholders claros "Foto pendiente" hasta recibir fotografía real.

`e2e/home.spec.ts` verifica fuentes, máximo 2 secciones charcoal, fondo blanco, ausencia de gradientes y de copy genérico.

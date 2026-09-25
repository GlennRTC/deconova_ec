# Design system — Deconova

Aprobado por el cliente (sesión 4, 2026-09-25). Tokens implementados en `src/app/globals.css`; fuentes vía `next/font/google` en `src/app/layout.tsx`.
Colores extraídos por inspección visual de material de marca (aproximados) — validar contra brand guidelines reales si aparecen.

## Paleta (60% base oscura / 30% neutros cálidos / 10% dorado)

| Token | Valor | Uso |
|---|---|---|
| `--bg-primary` | #141210 | fondo dominante |
| `--bg-surface` | #1F1C19 | cards, header, footer |
| `--accent-gold` | #B8935A | solo acentos: CTA, bordes activos, logo, numerales |
| `--accent-gold-light` | #D4B483 | highlights, hover, links |
| `--text-primary` | #EDE6D8 | texto |
| `--text-muted` | #A89684 | secundario, labels |
| `--material-walnut` | #4A3327 | separadores, texturas de madera |
| `--material-marble` | #5C5A57 | texturas puntuales |
| `--contrast-hard` | #0D0C0B | bordes duros |

- El dorado no debe superar ~10% de la superficie visual.
- Texturas (mármol/madera): solo fondos de sección puntuales o separadores, nunca color plano de UI.
- Contraste medido sobre `--bg-primary`/`--bg-surface`: todo texto ≥ 5.9:1 (WCAG AA).

## Tipografía

| Rol | Fuente | Clase/uso |
|---|---|---|
| Títulos H1–H3 | Fraunces | `h1, h2, h3` |
| Acento emocional | Italiana | `.accent` — puntual, nunca bloques largos |
| Label / caps | Jost 300, tracking 0.15em | `.label` |
| Cuerpo / UI | Work Sans | `body` |

Prohibido: Inter, Playfair Display.

## Composición

- Sin gradientes, salvo overlay sutil sobre foto para legibilidad.
- Al menos una sección asimétrica por página; nada de grid simétrico de 3 columnas en todo.
- Radios variables por jerarquía: cards rectas (0), botones suaves (3px).
- Interacción de cards: borde dorado en hover/focus, sin sombra ni "levantar 2px".
- Sin animaciones de scroll.
- Copy específico del negocio (muebles, medidas, Pago Móvil, Miranda); prohibido "Transform your…", "Get Started", social proof sin datos reales.
- Fotos: placeholders oscuros "Foto pendiente" hasta recibir fotografía real (`public/productos/`, `public/home/`).

`e2e/home.spec.ts` verifica automáticamente fuentes, ausencia de gradientes y de copy genérico.

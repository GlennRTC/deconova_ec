#!/usr/bin/env bash
# init.sh -- entorno de Deconova: Next.js static export + catálogo JSON + carrito localStorage
# + checkout Netlify Forms (ver docs/adr/ADR-001-plataforma.md).
# No hay pasarela de pago ni sandbox: el pago es Pago Móvil/Transferencia manual, así que
# la verificación e2e termina en la pantalla de confirmación con instrucciones de pago.
# Linux/macOS/WSL. Uso: ./scripts/init.sh [--no-dev]

set -euo pipefail
cd "$(dirname "$0")/.."

echo "== init.sh: preparando entorno =="

# --- 0. ¿Existe el proyecto Next.js? (lo crea la feature de scaffold en feature-list.json) ---
if [ ! -f package.json ]; then
  echo "Falta package.json: el scaffold Next.js aún no existe." >&2
  echo "Es la primera feature de docs/progress/feature-list.json. Comando sugerido:" >&2
  echo "  npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias '@/*'" >&2
  exit 1
fi

# --- 1. Node (versión fijada en .nvmrc) ---
if [ -f .nvmrc ] && [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  # nvm es una función de shell: hay que cargarla dentro del script
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm use || nvm install
fi
echo "node $(node -v)"

# --- 2. Dependencias + navegador de Playwright ---
npm ci || npm install
npx playwright install chromium

# --- 3. Variables de entorno ---
# Sin secrets: los datos de Pago Móvil/Transferencia y el WhatsApp son públicos por diseño
# y viven en el código/config, no en .env. Netlify Forms no requiere API key.

# --- 4. Base de datos: N/A (catálogo en data/products.json, pedidos en Netlify Forms) ---

# --- 5. Build estático (falla si algo no es exportable como estático) ---
npm run lint
npm run build
test -f out/index.html || { echo "build no generó out/index.html (¿falta output: 'export'?)" >&2; exit 1; }

# --- 6. Verificación end-to-end real ---
# playwright.config.ts levanta `python3 -m http.server 3000 -d out` (webServer) y recorre:
# catálogo -> producto -> agregar al carrito -> checkout -> confirmación con datos de pago
# y link wa.me con el nº de pedido. El POST a Netlify Forms se intercepta en el test
# (solo existe desplegado); para probarlo de verdad: `netlify deploy --build` (preview).
npx playwright test

echo "== e2e OK =="

# --- 7. Dev server para trabajar ---
if [ "${1:-}" != "--no-dev" ]; then
  npm run dev &
  echo "== dev server: http://localhost:3000 (PID $!) =="
fi

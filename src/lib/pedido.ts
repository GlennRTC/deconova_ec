import { useSyncExternalStore } from "react";
import type { CartItem } from "./cart";
import { metodos, zonas, type Metodo, type Zona } from "./negocio";
import { formatUsd, products } from "./products";

// Lo único que se guarda del pedido en el navegador: sin nombre, teléfono, email ni dirección.
export type Pedido = { id: string; items: CartItem[]; zona: Zona; metodo: Metodo };

const KEY = "deconova:pedido:v1";
const bySlug = new Map(products.map((p) => [p.slug, p]));

// DN-AAMMDD-XXXX; sin 0/O/1/I para que se pueda dictar por teléfono
export function nuevoId(fecha = new Date()): string {
  const abc = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const rnd = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => abc[b % abc.length]).join("");
  const ymd = fecha.toISOString().slice(2, 10).replaceAll("-", "");
  return `DN-${ymd}-${rnd}`;
}

export const lineas = (items: CartItem[]) =>
  items.flatMap((i) => {
    const p = bySlug.get(i.slug);
    return p ? [{ ...i, p, subtotal: p.priceUsd * i.qty }] : [];
  });

// el total se recalcula siempre desde el catálogo, nunca se lee de lo guardado
export const total = (items: CartItem[]) => lineas(items).reduce((s, l) => s + l.subtotal, 0);

export const resumen = (items: CartItem[]) =>
  lineas(items)
    .map((l) => `${l.qty} × ${l.p.name} (${l.p.slug}) — ${formatUsd(l.subtotal)}`)
    .join("\n");

// texto para WhatsApp: pedido y total, sin datos personales en la URL
export const mensajeWhatsapp = (p: Pedido, intro: string) =>
  [
    intro,
    `Pedido ${p.id}`,
    resumen(p.items),
    `Total referencial: ${formatUsd(total(p.items))}`,
    `Envío: ${zonas.find((z) => z.value === p.zona)?.label}`,
    `Pago: ${metodos.find((m) => m.value === p.metodo)?.label}`,
  ].join("\n");

export function guardarPedido(p: Pedido) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

// localStorage es editable: se valida todo al leer
function parse(raw: string | null): Pedido | null {
  try {
    const d = JSON.parse(raw ?? "null");
    if (!/^DN-\d{6}-[2-9A-HJ-NP-Z]{4}$/.test(d?.id)) return null;
    if (!zonas.some((z) => z.value === d.zona) || !metodos.some((m) => m.value === d.metodo)) return null;
    const items: CartItem[] = (Array.isArray(d.items) ? d.items : []).filter(
      (i: CartItem) => bySlug.has(i?.slug) && Number.isInteger(i?.qty) && i.qty > 0,
    );
    return items.length ? { id: d.id, items, zona: d.zona, metodo: d.metodo } : null;
  } catch {
    return null;
  }
}

// undefined en el render estático (aún no se leyó el navegador), null si no hay pedido válido
let lastRaw: string | null | undefined;
let last: Pedido | null = null;
function leer(): Pedido | null {
  const raw = localStorage.getItem(KEY);
  if (raw !== lastRaw) [lastRaw, last] = [raw, parse(raw)];
  return last;
}

export function usePedido(): Pedido | null | undefined {
  return useSyncExternalStore(() => () => {}, leer, () => undefined);
}

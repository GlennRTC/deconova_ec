"use client";

import { useSyncExternalStore } from "react";
import { products } from "./products";

// Solo slug + cantidad: ningún dato personal vive en el carrito (F010).
// Variante se agrega cuando exista F009.
export type CartItem = { slug: string; qty: number };

const KEY = "deconova:cart:v1";
const EVENT = "deconova:cart";
export const MAX_QTY = 10; // ponytail: tope fijo por ítem; muebles, no consumibles
const known = new Set(products.map((p) => p.slug));
const EMPTY: CartItem[] = [];

// localStorage es editable por el usuario: se filtra todo lo que no sea un ítem válido del catálogo actual.
function parse(raw: string | null): CartItem[] {
  try {
    const data: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(data)) return EMPTY;
    return data
      .filter((i) => known.has(i?.slug) && Number.isInteger(i?.qty) && i.qty > 0)
      .map((i) => ({ slug: i.slug, qty: Math.min(i.qty, MAX_QTY) }));
  } catch {
    return EMPTY;
  }
}

// useSyncExternalStore exige el mismo objeto mientras el dato no cambie
let lastRaw: string | null | undefined;
let lastItems = EMPTY;
function read(): CartItem[] {
  const raw = localStorage.getItem(KEY);
  if (raw !== lastRaw) [lastRaw, lastItems] = [raw, parse(raw)];
  return lastItems;
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // otras pestañas
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addToCart(slug: string) {
  const items = read();
  const found = items.find((i) => i.slug === slug);
  write(
    found
      ? items.map((i) => (i.slug === slug ? { ...i, qty: Math.min(i.qty + 1, MAX_QTY) } : i))
      : [...items, { slug, qty: 1 }],
  );
}

export function setQty(slug: string, qty: number) {
  const q = Math.max(1, Math.min(Math.trunc(qty), MAX_QTY));
  write(read().map((i) => (i.slug === slug ? { ...i, qty: q } : i)));
}

export function removeFromCart(slug: string) {
  write(read().filter((i) => i.slug !== slug));
}

export function clearCart() {
  write([]);
}

"use client";

import { useCart } from "@/lib/cart";

// Solo contador; se vuelve link cuando exista la vista de carrito (F011).
export default function CartCount() {
  const n = useCart().reduce((sum, i) => sum + i.qty, 0);
  return (
    <span data-testid="cart-count" aria-live="polite">
      Carrito ({n})
    </span>
  );
}

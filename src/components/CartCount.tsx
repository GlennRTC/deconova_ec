"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartCount() {
  const n = useCart().reduce((sum, i) => sum + i.qty, 0);
  return (
    <Link href="/carrito/" className="cart-link" aria-label={`Carrito, ${n} ${n === 1 ? "pieza" : "piezas"}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M5 8h14l-1.2 12H6.2L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span data-testid="cart-count" aria-live="polite">
        Carrito ({n})
      </span>
    </Link>
  );
}

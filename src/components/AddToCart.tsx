"use client";

import { addToCart, MAX_QTY, useCart } from "@/lib/cart";
import styles from "./AddToCart.module.css";

export default function AddToCart({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const qty = useCart().find((i) => i.slug === slug)?.qty ?? 0;
  return (
    <div className={compact ? `${styles.wrap} ${styles.compact}` : styles.wrap}>
      <button type="button" className="btn" onClick={() => addToCart(slug)} disabled={qty >= MAX_QTY}>
        Agregar al carrito
      </button>
      <p className="muted" aria-live="polite" data-testid="en-carrito">
        {qty > 0 && (qty >= MAX_QTY ? `Máximo ${MAX_QTY} por pieza en tu carrito.` : `${qty} en tu carrito.`)}
      </p>
    </div>
  );
}

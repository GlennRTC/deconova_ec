"use client";

import Image from "next/image";
import Link from "next/link";
import { MAX_QTY, removeFromCart, setQty, useCart } from "@/lib/cart";
import { formatUsd, products } from "@/lib/products";
import styles from "./CartView.module.css";

const bySlug = new Map(products.map((p) => [p.slug, p]));

export default function CartView() {
  // cart.ts ya descarta slugs fuera del catálogo, así que el lookup siempre existe
  const lines = useCart().map((i) => ({ ...i, p: bySlug.get(i.slug)! }));
  const total = lines.reduce((sum, l) => sum + l.p.priceUsd * l.qty, 0);

  if (!lines.length)
    return (
      <main className={styles.main}>
        <h1>Tu carrito está vacío</h1>
        <p className="muted">Agrega piezas desde el catálogo; quedan guardadas en este navegador.</p>
        <Link href="/catalogo/" className="btn">Ir al catálogo</Link>
      </main>
    );

  return (
    <main className={styles.main}>
      <h1>Carrito</h1>
      <div className={styles.layout}>
        <ul className={styles.lines}>
          {lines.map(({ p, qty }) => (
            <li key={p.slug} className={styles.line} data-testid="cart-line" data-slug={p.slug}>
              <Image src={p.images[0]} alt="" width={160} height={120} className={styles.thumb} />
              <div className={styles.info}>
                <Link href={`/productos/${p.slug}/`} className={styles.name}>{p.name}</Link>
                <p className="muted">{formatUsd(p.priceUsd)} c/u · {p.disponible ? "Disponible" : "Bajo pedido"}</p>
                <div className={styles.controls}>
                  <div className={styles.qty} role="group" aria-label={`Cantidad de ${p.name}`}>
                    <button type="button" onClick={() => setQty(p.slug, qty - 1)} disabled={qty <= 1} aria-label="Restar una">−</button>
                    <output data-testid="qty">{qty}</output>
                    <button type="button" onClick={() => setQty(p.slug, qty + 1)} disabled={qty >= MAX_QTY} aria-label="Sumar una">+</button>
                  </div>
                  <button type="button" className={styles.remove} onClick={() => removeFromCart(p.slug)}>
                    Eliminar
                  </button>
                </div>
              </div>
              <p className={`price ${styles.subtotal}`} data-testid="line-total">{formatUsd(p.priceUsd * qty)}</p>
            </li>
          ))}
        </ul>
        <aside className={styles.summary} aria-label="Resumen">
          <p className={styles.row}>
            <span>Envío</span>
            <span className="muted">Se define en el pedido</span>
          </p>
          <p className={`${styles.row} ${styles.total}`}>
            <span>Total</span>
            <span className="price" data-testid="cart-total">{formatUsd(total)}</span>
          </p>
          <p className="muted">
            Total referencial en USD. Confirmamos el monto final contigo al revisar tu pedido.
          </p>
        </aside>
      </div>
    </main>
  );
}

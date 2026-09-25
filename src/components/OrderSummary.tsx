import type { CartItem } from "@/lib/cart";
import { lineas, total } from "@/lib/pedido";
import { formatUsd } from "@/lib/products";
import styles from "./Checkout.module.css";

export default function OrderSummary({ items, children }: { items: CartItem[]; children?: React.ReactNode }) {
  return (
    <aside className={styles.summary} aria-label="Resumen del pedido">
      <ul className={styles.summaryLines}>
        {lineas(items).map((l) => (
          <li key={l.slug} data-testid="resumen-linea">
            <span>
              {l.qty} × {l.p.name}
            </span>
            <span>{formatUsd(l.subtotal)}</span>
          </li>
        ))}
      </ul>
      <p className={styles.summaryTotal}>
        <span>Total referencial</span>
        <span className="price" data-testid="resumen-total">{formatUsd(total(items))}</span>
      </p>
      {children}
    </aside>
  );
}

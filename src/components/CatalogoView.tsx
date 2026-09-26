import Link from "next/link";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";
import styles from "./CatalogoView.module.css";

export default function CatalogoView({ titulo, activo, items }: { titulo: string; activo: string; items: Product[] }) {
  return (
    <main className={styles.main}>
      <CategoryNav activo={activo} />
      <h1>{titulo}</h1>
      {items.length ? (
        <>
          <p className="muted">
            {items.length} {items.length === 1 ? "pieza" : "piezas"} · fabricadas en Miranda · precios en Ref.
          </p>
          <ul className={styles.grid}>
            {items.map((p) => (
              <li key={p.slug}>
                <ProductCard p={p} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="muted" data-testid="categoria-vacia">
          Estamos preparando esta categoría. Mientras tanto, <Link href="/catalogo/">mira todo el catálogo</Link>.
        </p>
      )}
    </main>
  );
}

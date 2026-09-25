import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import styles from "./catalogo.module.css";

export const metadata: Metadata = { title: "Catálogo — Deconova" };

export default function Catalogo() {
  return (
    <main className={styles.main}>
      <h1>Catálogo</h1>
      <p className="muted">{products.length} piezas · precios en USD</p>
      <ul className={styles.grid}>
        {products.map((p) => (
          <li key={p.slug}>
            <ProductCard p={p} />
          </li>
        ))}
      </ul>
    </main>
  );
}

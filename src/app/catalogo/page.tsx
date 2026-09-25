import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Disponibilidad from "@/components/Disponibilidad";
import { formatUsd, products } from "@/lib/products";
import styles from "./catalogo.module.css";

export const metadata: Metadata = { title: "Catálogo — Deconova" };

export default function Catalogo() {
  return (
    <main className={styles.main}>
      <h1>Catálogo</h1>
      <ul className={styles.grid}>
        {products.map((p) => (
          <li key={p.slug} data-testid="product" data-slug={p.slug}>
            <Link href={`/productos/${p.slug}/`}>
              <Image src={p.images[0]} alt={p.name} width={800} height={600} className={styles.img} />
              <h2 className={styles.name}>{p.name}</h2>
              <p className={styles.price}>{formatUsd(p.priceUsd)}</p>
              <Disponibilidad disponible={p.disponible} />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

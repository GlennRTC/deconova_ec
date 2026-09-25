import Image from "next/image";
import Link from "next/link";
import AddToCart from "@/components/AddToCart";
import Disponibilidad from "@/components/Disponibilidad";
import { formatUsd, type Product } from "@/lib/products";
import styles from "./ProductCard.module.css";

// Link solo en foto + nombre: el botón no puede ir dentro de un <a>.
export default function ProductCard({ p }: { p: Product }) {
  return (
    <article className={styles.card} data-testid="product" data-slug={p.slug}>
      <Link href={`/productos/${p.slug}/`} className={styles.link}>
        <Image src={p.images[0]} alt={p.name} width={800} height={600} className={styles.img} />
        <h2 className={styles.name}>{p.name}</h2>
      </Link>
      <p className="price">{formatUsd(p.priceUsd)}</p>
      <Disponibilidad disponible={p.disponible} />
      <AddToCart slug={p.slug} compact />
    </article>
  );
}

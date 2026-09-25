import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import { formatUsd, products } from "@/lib/products";
import styles from "./producto.module.css";

export const dynamicParams = false; // solo los slugs del JSON; el resto es 404

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => products.find((p) => p.slug === slug) ?? notFound();

export async function generateMetadata({ params }: PageProps<"/productos/[slug]">): Promise<Metadata> {
  return { title: `${find((await params).slug).name} — Deconova` };
}

export default async function Producto({ params }: PageProps<"/productos/[slug]">) {
  const p = find((await params).slug);
  return (
    <main className={styles.main}>
      <Gallery images={p.images} alt={p.name} />
      <div>
        <h1>{p.name}</h1>
        <p className={styles.price}>{formatUsd(p.priceUsd)}</p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import Disponibilidad from "@/components/Disponibilidad";
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
        {p.dimensionesCm ? (
          <dl className={styles.medidas} data-testid="medidas" aria-label="Medidas">
            <div>
              <dt>Alto</dt>
              <dd>{p.dimensionesCm.alto} cm</dd>
            </div>
            <div>
              <dt>Ancho</dt>
              <dd>{p.dimensionesCm.ancho} cm</dd>
            </div>
            <div>
              <dt>Profundidad</dt>
              <dd>{p.dimensionesCm.profundidad} cm</dd>
            </div>
          </dl>
        ) : (
          <p className={`muted ${styles.medidas}`} data-testid="medidas">
            Medidas a confirmar. Escríbenos y te las enviamos.
          </p>
        )}
        <Disponibilidad disponible={p.disponible} />
        <p className="muted" data-testid="entrega">
          {p.disponible
            ? "Listo para entrega."
            : "Se fabrica al confirmar tu pedido; el tiempo de entrega se coordina contigo."}
        </p>
        <AddToCart slug={p.slug} />
      </div>
    </main>
  );
}

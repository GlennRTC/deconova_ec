import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogoView from "@/components/CatalogoView";
import { categories } from "@/lib/categories";
import { products } from "@/lib/products";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ categoria: c.slug }));
}

const find = (slug: string) => categories.find((c) => c.slug === slug) ?? notFound();

export async function generateMetadata({ params }: PageProps<"/catalogo/[categoria]">): Promise<Metadata> {
  const c = find((await params).categoria);
  return { title: `${c.nombre} — Deconova`, description: `${c.nombre} fabricados en Miranda, Venezuela.` };
}

export default async function Categoria({ params }: PageProps<"/catalogo/[categoria]">) {
  const c = find((await params).categoria);
  return <CatalogoView titulo={c.nombre} activo={c.slug} items={products.filter((p) => p.categoria === c.slug)} />;
}

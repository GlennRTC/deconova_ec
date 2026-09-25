import type { Metadata } from "next";
import CatalogoView from "@/components/CatalogoView";
import { products } from "@/lib/products";

export const metadata: Metadata = { title: "Catálogo — Deconova" };

export default function Catalogo() {
  return <CatalogoView titulo="Catálogo" activo="todas" items={products} />;
}

import raw from "../../data/products.json";
import { categorySlugs, type CategorySlug } from "./categories";

export type Product = {
  slug: string;
  name: string;
  priceUsd: number;
  images: string[]; // images[0] = imagen principal
  categoria: CategorySlug;
  disponible: boolean; // editorial, sin stock en tiempo real (ADR-001)
  dimensionesCm?: { alto: number; ancho: number; profundidad: number }; // ausente = "medidas a confirmar"
};

// data/products.json se edita a mano: un dato roto debe romper el build, no publicarse.
function validate(p: Product, i: number): Product {
  const where = `data/products.json[${i}]`;
  if (!/^[a-z0-9-]+$/.test(p.slug ?? "")) throw new Error(`${where}: slug inválido "${p.slug}"`);
  if (!p.name?.trim()) throw new Error(`${where}: falta name`);
  if (typeof p.priceUsd !== "number" || !(p.priceUsd > 0)) throw new Error(`${where}: priceUsd debe ser número > 0`);
  if (!Array.isArray(p.images) || !p.images.length) throw new Error(`${where}: images vacío`);
  if (!categorySlugs.includes(p.categoria))
    throw new Error(`${where}: categoria "${p.categoria}" no es una de ${categorySlugs.join(", ")}`);
  if (typeof p.disponible !== "boolean") throw new Error(`${where}: disponible debe ser true o false`);
  const d = p.dimensionesCm;
  if (d && ![d.alto, d.ancho, d.profundidad].every((n) => typeof n === "number" && n > 0))
    throw new Error(`${where}: dimensionesCm requiere alto, ancho y profundidad > 0`);
  return p;
}

export const products: Product[] = (raw as unknown as Product[]).map(validate);

const slugs = new Set(products.map((p) => p.slug));
if (slugs.size !== products.length) throw new Error("data/products.json: slugs duplicados");

const usd = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" });
export const formatUsd = (n: number) => usd.format(n);

import raw from "../../data/products.json";

export type Product = {
  slug: string;
  name: string;
  priceUsd: number;
  images: string[]; // images[0] = imagen principal
};

// data/products.json se edita a mano: un dato roto debe romper el build, no publicarse.
function validate(p: Product, i: number): Product {
  const where = `data/products.json[${i}]`;
  if (!/^[a-z0-9-]+$/.test(p.slug ?? "")) throw new Error(`${where}: slug inválido "${p.slug}"`);
  if (!p.name?.trim()) throw new Error(`${where}: falta name`);
  if (typeof p.priceUsd !== "number" || !(p.priceUsd > 0)) throw new Error(`${where}: priceUsd debe ser número > 0`);
  if (!Array.isArray(p.images) || !p.images.length) throw new Error(`${where}: images vacío`);
  return p;
}

export const products: Product[] = (raw as Product[]).map(validate);

const slugs = new Set(products.map((p) => p.slug));
if (slugs.size !== products.length) throw new Error("data/products.json: slugs duplicados");

const usd = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" });
export const formatUsd = (n: number) => usd.format(n);

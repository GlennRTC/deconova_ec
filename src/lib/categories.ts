// Fijas en código (no derivadas del JSON): una categoría sin productos igual tiene su página y estado vacío.
export const categories = [
  { slug: "sofas-y-sillones", nombre: "Sofás y sillones", label: "Sofás y sillones" },
  { slug: "sillas-y-mesas", nombre: "Sillas y mesas", label: "Sillas y mesas" },
  { slug: "escritorios", nombre: "Escritorios y sillas de escritorio", label: "Escritorios" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];
export const categorySlugs: readonly string[] = categories.map((c) => c.slug);

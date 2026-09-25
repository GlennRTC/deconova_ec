import Link from "next/link";
import type { ReactNode } from "react";
import { categories } from "@/lib/categories";
import { products } from "@/lib/products";
import styles from "./CategoryNav.module.css";

// Íconos lineales, viewBox 24, trazo 1.6 (design system v2).
const icons: Record<string, ReactNode> = {
  "sofas-y-sillones": (
    <>
      <path d="M5 9V7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5V9" />
      <rect x="2" y="9" width="3" height="6" rx="1" />
      <rect x="19" y="9" width="3" height="6" rx="1" />
      <path d="M5 12h14v3H5zM4 15v3M20 15v3" />
    </>
  ),
  "sillas-y-mesas": (
    <>
      <path d="M3 8h13M5 8l-1 11M14 8l1 11" />
      <path d="M18 5v14M18 12h3v7" />
    </>
  ),
  escritorios: (
    <>
      <rect x="6" y="3" width="12" height="9" rx="1" />
      <path d="M12 12v3M9 15h6M2 18h20M4 18v3M20 18v3" />
    </>
  ),
};

const piezas = (n: number) => `${n} ${n === 1 ? "pieza" : "piezas"}`;

// activo: slug de la categoría actual, "todas" en /catalogo/, undefined en el home (sin estado activo).
export default function CategoryNav({ activo, todas = true }: { activo?: string; todas?: boolean }) {
  const tiles = [
    ...(todas ? [{ slug: "todas", label: "Todas", href: "/catalogo/", n: products.length }] : []),
    ...categories.map((c) => ({
      slug: c.slug,
      label: c.label,
      href: `/catalogo/${c.slug}/`,
      n: products.filter((p) => p.categoria === c.slug).length,
    })),
  ];
  return (
    <nav aria-label="Categorías" className={styles.nav}>
      <ul className={styles.row}>
        {tiles.map((t) => (
          <li key={t.slug}>
            <Link
              href={t.href}
              className={styles.tile}
              aria-current={t.slug === activo ? "page" : undefined}
              data-testid="categoria"
              data-slug={t.slug}
            >
              {icons[t.slug] && (
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={styles.icon}>
                  {icons[t.slug]}
                </svg>
              )}
              <span className={styles.label}>{t.label}</span>
              <span className={styles.count} data-testid="conteo">{piezas(t.n)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

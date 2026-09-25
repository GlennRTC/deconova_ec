import Link from "next/link";
import CategoryNav from "@/components/CategoryNav";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/categories";
import { products } from "@/lib/products";
import styles from "./home.module.css";

const pasos = [
  ["Elige tus piezas", "Cada ficha muestra medidas y si el mueble está disponible o se fabrica bajo pedido."],
  ["Envía tu pedido", "Solo te pedimos lo necesario para entregarlo: nombre, teléfono y dirección."],
  ["Paga por Pago Móvil o transferencia", "Los datos aparecen al confirmar el pedido. Nos envías el comprobante por WhatsApp."],
  ["Coordinamos la entrega", "Flete propio en Miranda y Caracas. Al resto del país, lo acordamos contigo."],
];

const ambientes = [
  { src: "/home/hero-sala.svg", alt: "Foto de ambiente pendiente: sala", caption: "Sala" },
  { src: "/home/hero-comedor.svg", alt: "Foto de ambiente pendiente: comedor", caption: "Comedor" },
  { src: "/home/hero-estudio.svg", alt: "Foto de ambiente pendiente: estudio", caption: "Estudio" },
];

// una pieza por categoría
const destacados = categories.flatMap((c) => products.find((p) => p.categoria === c.slug) ?? []);

export default function Home() {
  return (
    <main>
      {/* sección oscura #1: conserva el ADN charcoal de la marca */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>Fabricamos en Miranda, Venezuela</p>
          <h1>Muebles de gama media y alta para tu hogar</h1>
          <p className={styles.lead}>
            Cada pieza la fabricamos nosotros. Pides en línea, pagas por Pago Móvil o transferencia y coordinamos la
            entrega contigo.
          </p>
          <Link href="/catalogo/" className="btn">Ver catálogo</Link>
        </div>
        <HeroCarousel slides={ambientes} />
      </section>

      <section className={styles.destacados} aria-labelledby="ambientes">
        <h2 id="ambientes">Explora por ambiente</h2>
        <div className={styles.ambientes}>
          <CategoryNav todas={false} />
        </div>
      </section>

      <section className={styles.destacados} aria-labelledby="destacados">
        <h2 id="destacados">Del catálogo</h2>
        <ul className={styles.grid}>
          {destacados.map((p) => (
            <li key={p.slug}>
              <ProductCard p={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.comoComprar} aria-labelledby="como-comprar">
        <div>
          <h2 id="como-comprar">Cómo comprar</h2>
          <p className="muted">Sin pasarela de pago y sin costos escondidos.</p>
        </div>
        <ol className={styles.pasos}>
          {pasos.map(([t, d]) => (
            <li key={t}>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

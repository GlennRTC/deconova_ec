import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import styles from "./home.module.css";

const pasos = [
  ["Elige tus piezas", "Cada ficha muestra medidas y si el mueble está disponible o se fabrica bajo pedido."],
  ["Envía tu pedido", "Solo te pedimos lo necesario para entregarlo: nombre, teléfono y dirección."],
  ["Paga por Pago Móvil o transferencia", "Los datos aparecen al confirmar el pedido. Nos envías el comprobante por WhatsApp."],
  ["Coordinamos la entrega", "Flete propio en Miranda y Caracas. Al resto del país, lo acordamos contigo."],
];

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
        <Image
          src="/home/hero-placeholder.svg"
          alt="Foto de ambiente pendiente"
          width={1200}
          height={800}
          preload
          className={styles.heroImg}
        />
      </section>

      <section className={styles.destacados} aria-labelledby="destacados">
        <h2 id="destacados">Del catálogo</h2>
        <ul className={styles.grid}>
          {products.slice(0, 4).map((p) => (
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

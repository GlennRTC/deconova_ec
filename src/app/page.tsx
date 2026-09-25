import Image from "next/image";
import Link from "next/link";
import { formatUsd, products } from "@/lib/products";
import styles from "./home.module.css";

const pasos = [
  ["Elige tus piezas", "Cada ficha muestra medidas y si el mueble está disponible o se fabrica bajo pedido."],
  ["Envía tu pedido", "Solo te pedimos lo necesario para entregarlo: nombre, teléfono y dirección."],
  ["Paga por Pago Móvil o transferencia", "Los datos aparecen al confirmar el pedido. Nos envías el comprobante por WhatsApp."],
  ["Coordinamos la entrega", "Flete propio en Miranda y Caracas. Al resto del país, lo acordamos contigo."],
];

export default function Home() {
  const [principal, ...resto] = products.slice(0, 3);
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className="label">Fabricamos en Miranda, Venezuela</p>
          <h1>
            Muebles de gama media y alta, <span className="accent">para tu hogar soñado</span>
          </h1>
          <p className={styles.lead}>
            Cada pieza la fabricamos nosotros. Pides en línea, pagas por Pago Móvil o transferencia y coordinamos la
            entrega contigo.
          </p>
          <Link href="/catalogo/" className={styles.cta}>Ver catálogo</Link>
        </div>
        <Image
          src="/home/hero-placeholder.svg"
          alt="Foto de ambiente pendiente"
          width={800}
          height={1000}
          preload
          className={styles.heroImg}
        />
      </section>

      <section className={styles.destacados} aria-labelledby="destacados">
        <h2 id="destacados">Del catálogo</h2>
        <ul className={styles.destacadosGrid}>
          {[principal, ...resto].map((p, i) => (
            <li key={p.slug} className={i === 0 ? styles.grande : undefined}>
              <Link href={`/productos/${p.slug}/`} className={styles.pieza}>
                <Image src={p.images[0]} alt={p.name} width={800} height={600} />
                <span className={styles.piezaNombre}>{p.name}</span>
                <span className="muted">{formatUsd(p.priceUsd)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.comoComprar} aria-labelledby="como-comprar">
        <div>
          <p className="label">Sin pasarela, sin sorpresas</p>
          <h2 id="como-comprar">Cómo comprar</h2>
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

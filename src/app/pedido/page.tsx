import type { Metadata } from "next";
import Confirmacion from "@/components/Confirmacion";
import styles from "@/components/CartView.module.css";

export const metadata: Metadata = { title: "Pedido recibido — Deconova", robots: { index: false } };

export default function PedidoPage() {
  return (
    <main className={styles.main}>
      <Confirmacion />
    </main>
  );
}

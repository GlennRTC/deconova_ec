import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";
import styles from "@/components/CartView.module.css";

export const metadata: Metadata = { title: "Tu pedido — Deconova", robots: { index: false } };

export default function Checkout() {
  return (
    <main className={styles.main}>
      <CheckoutForm />
    </main>
  );
}

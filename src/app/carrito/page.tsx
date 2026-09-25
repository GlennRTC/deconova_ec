import type { Metadata } from "next";
import CartView from "@/components/CartView";

export const metadata: Metadata = { title: "Carrito — Deconova" };

export default function Carrito() {
  return <CartView />;
}

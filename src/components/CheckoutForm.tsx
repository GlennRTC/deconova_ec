"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OrderSummary from "@/components/OrderSummary";
import { clearCart, useCart } from "@/lib/cart";
import { metodos, waLink, zonas, type Metodo, type Zona } from "@/lib/negocio";
import { guardarPedido, mensajeWhatsapp, nuevoId, resumen, total, type Pedido } from "@/lib/pedido";
import { formatUsd } from "@/lib/products";
import styles from "./Checkout.module.css";

// Netlify Forms: POST urlencoded a "/" (docs vigentes, sesión 9). Names sincronizados con public/__forms.html.
async function enviar(data: FormData) {
  // ponytail: en `next dev` no existe Netlify; se simula el éxito para poder recorrer el flujo localmente
  if (process.env.NODE_ENV === "development") return;
  const res = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
  });
  if (!res.ok) throw new Error(`Netlify Forms respondió ${res.status}`);
}

export default function CheckoutForm() {
  const items = useCart();
  const router = useRouter();
  const [id] = useState(nuevoId); // mismo id en reintentos: el vendedor detecta duplicados
  const [estado, setEstado] = useState<"idle" | "enviando" | "error">("idle");
  const [zona, setZona] = useState<Zona | null>(null);
  const [metodo, setMetodo] = useState<Metodo>("pago-movil");

  if (!items.length)
    return (
      <div>
        <h1>No hay piezas en tu carrito</h1>
        <p className="muted">Agrega piezas desde el catálogo para hacer tu pedido.</p>
        <Link href="/catalogo/" className="btn">Ir al catálogo</Link>
      </div>
    );

  const pedido: Pedido = { id, items, zona: zona ?? "miranda-caracas", metodo };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    try {
      await enviar(new FormData(e.currentTarget));
      guardarPedido(pedido);
      clearCart();
      router.push("/pedido/");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className={styles.layout}>
      <form name="pedido" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit} className={styles.form}>
        <h1>Tu pedido</h1>
        <p className="muted">Sin crear cuenta. Te pedimos solo lo necesario para entregar.</p>

        <input type="hidden" name="form-name" value="pedido" />
        <input type="hidden" name="pedido-id" value={id} />
        <input type="hidden" name="pedido" value={resumen(items)} />
        <input type="hidden" name="total" value={formatUsd(total(items))} />
        <p className={styles.honeypot} aria-hidden="true">
          <label>
            No completes este campo: <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <fieldset className={styles.fieldset}>
          <legend>Datos de contacto</legend>
          <label className={styles.field}>
            Nombre y apellido
            <input name="nombre" required maxLength={80} autoComplete="name" />
          </label>
          <label className={styles.field}>
            Teléfono (WhatsApp)
            <input name="telefono" type="tel" required maxLength={20} pattern="[0-9+()\s\-]{7,20}" autoComplete="tel" inputMode="tel" placeholder="0412 000 0000" />
          </label>
          <label className={styles.field}>
            Email
            <input name="email" type="email" required maxLength={120} autoComplete="email" />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Entrega</legend>
          {zonas.map((z) => (
            <label key={z.value} className={styles.option}>
              <input type="radio" name="zona" value={z.value} required checked={zona === z.value} onChange={() => setZona(z.value)} />
              <span>
                <strong>{z.label}</strong>
                <span className="muted">{z.detalle}</span>
              </span>
            </label>
          ))}
          <label className={styles.field}>
            Dirección de entrega
            <textarea name="direccion" required maxLength={300} rows={3} autoComplete="street-address" placeholder="Urbanización, calle, casa o edificio, punto de referencia" />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Método de pago</legend>
          {metodos.map((m) => (
            <label key={m.value} className={styles.option}>
              <input type="radio" name="metodo" value={m.value} required checked={metodo === m.value} onChange={() => setMetodo(m.value)} />
              <span>
                <strong>{m.label}</strong>
              </span>
            </label>
          ))}
          <p className="muted">
            Al enviar el pedido te mostramos los datos para pagar. Tu pedido queda pendiente hasta que confirmemos el
            pago.
          </p>
        </fieldset>

        {estado === "error" && (
          <div role="alert" className={styles.error} data-testid="error-envio">
            <p>
              <strong>No pudimos enviar tu pedido.</strong> Revisa tu conexión e inténtalo de nuevo, o envíanoslo por
              WhatsApp:
            </p>
            <a className="btn" href={waLink(mensajeWhatsapp(pedido, "Hola Deconova, quiero hacer este pedido:"))} target="_blank" rel="noopener noreferrer">
              Enviar pedido por WhatsApp
            </a>
          </div>
        )}

        <button type="submit" className="btn" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviar pedido"}
        </button>
      </form>
      <OrderSummary items={items} />
    </div>
  );
}

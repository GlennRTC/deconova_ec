"use client";

import Link from "next/link";
import { useState } from "react";
import OrderSummary from "@/components/OrderSummary";
import { DEMO_DATOS, metodos, pagoMovil, transferencia, waLink, zonas } from "@/lib/negocio";
import { mensajeWhatsapp, usePedido } from "@/lib/pedido";
import styles from "./Checkout.module.css";

function Copiable({ label, valor }: { label: string; valor: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className={styles.dato}>
      <dt>{label}</dt>
      <dd>
        <span data-testid="dato-pago">{valor}</span>
        <button
          type="button"
          className={styles.copiar}
          onClick={() => navigator.clipboard.writeText(valor).then(() => setOk(true))}
          aria-label={`Copiar ${label}`}
        >
          {ok ? "Copiado" : "Copiar"}
        </button>
      </dd>
    </div>
  );
}

const PagoMovil = () => (
  <dl>
    <Copiable label="Banco" valor={pagoMovil.banco} />
    <Copiable label="Teléfono" valor={pagoMovil.telefono} />
    <Copiable label="Cédula/RIF" valor={pagoMovil.documento} />
  </dl>
);

const Transferencia = () => (
  <dl>
    <Copiable label="Banco" valor={transferencia.banco} />
    <Copiable label="Titular" valor={transferencia.titular} />
    <Copiable label="Cédula/RIF" valor={transferencia.documento} />
    <Copiable label="Cuenta" valor={transferencia.cuenta} />
  </dl>
);

export default function Confirmacion() {
  const pedido = usePedido();

  if (pedido === undefined) return null;
  if (!pedido)
    return (
      <div>
        <h1>No encontramos un pedido reciente</h1>
        <p className="muted">Los pedidos se muestran en el mismo navegador donde se hicieron.</p>
        <Link href="/catalogo/" className="btn">Ir al catálogo</Link>
      </div>
    );

  const esPagoMovil = pedido.metodo === "pago-movil";
  return (
    <div className={styles.layout}>
      <div>
        <p className={styles.estado} data-testid="estado-pedido">Pendiente de confirmación</p>
        <h1>Recibimos tu pedido</h1>
        <p>
          Número de pedido: <strong data-testid="pedido-id">{pedido.id}</strong>
        </p>
        <p className="muted">
          Envío: {zonas.find((z) => z.value === pedido.zona)?.label}. {zonas.find((z) => z.value === pedido.zona)?.detalle}
        </p>

        <section className={styles.pago} aria-labelledby="pagar">
          <h2 id="pagar">Paga por {metodos.find((m) => m.value === pedido.metodo)?.label}</h2>
          {DEMO_DATOS && <p className={styles.demo}>[DEMO] Datos bancarios de ejemplo, pendientes del cliente.</p>}
          {esPagoMovil ? <PagoMovil /> : <Transferencia />}
          <details className={styles.otro}>
            <summary>Prefiero pagar por {esPagoMovil ? "transferencia" : "Pago Móvil"}</summary>
            {esPagoMovil ? <Transferencia /> : <PagoMovil />}
          </details>
        </section>

        <section aria-labelledby="comprobante">
          <h2 id="comprobante">Envíanos el comprobante</h2>
          <p className="muted">
            Cuando pagues, mándanos la captura por WhatsApp con tu número de pedido. Confirmamos el pago, el monto final
            del envío y la fecha de entrega.
          </p>
          <a
            className="btn"
            href={waLink(mensajeWhatsapp(pedido, "Hola Deconova, envío el comprobante de pago de mi pedido:"))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enviar comprobante por WhatsApp
          </a>
        </section>
      </div>
      <OrderSummary items={pedido.items} />
    </div>
  );
}

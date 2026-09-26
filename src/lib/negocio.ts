// PENDIENTE: reemplazar con datos reales del negocio antes del lanzamiento final.
export const WHATSAPP = "584121234567"; // formato wa.me: código de país + número, sin "+" ni espacios
export const DEMO_DATOS = false;

// Freno de publicación: Netlify define CONTEXT=production al construir producción (previews sí se permiten).
// Corre durante el prerender del build; en el navegador CONTEXT no existe.
if (DEMO_DATOS && process.env.CONTEXT === "production")
  throw new Error("negocio.ts tiene datos [DEMO] (DEMO_DATOS = true): reemplázalos antes de publicar a producción.");

export const pagoMovil = {
  banco: "Banco Mercantil",
  telefono: "0412-1234567",
  documento: "J-12345678-9",
};

export const transferencia = {
  banco: "Banco Mercantil",
  titular: "Deconova C.A.",
  documento: "J-12345678-9",
  cuenta: "0105-0123-45-1234567890",
};

export const zonas = [
  { value: "miranda-caracas", label: "Miranda o Caracas", detalle: "Flete propio. Te confirmamos el monto por WhatsApp." },
  { value: "resto-pais", label: "Resto del país", detalle: "El envío se coordina por WhatsApp y no se cobra en este pedido." },
] as const;

export const metodos = [
  { value: "pago-movil", label: "Pago Móvil" },
  { value: "transferencia", label: "Transferencia bancaria" },
] as const;

export type Zona = (typeof zonas)[number]["value"];
export type Metodo = (typeof metodos)[number]["value"];

export const waLink = (texto: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

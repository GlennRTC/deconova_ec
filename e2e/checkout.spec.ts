import { expect, test, type Page } from "@playwright/test";
import products from "../data/products.json";

const CART = "deconova:cart:v1";
const PEDIDO = "deconova:pedido:v1";
const comprador = {
  nombre: "María Pérez",
  telefono: "0414 123 4567",
  email: "maria@example.com",
  direccion: "Urb. Los Palos Grandes, Calle 3, Qta. Ana",
};
const PII = Object.values(comprador);
const [a, b] = products;

async function conCarrito(page: Page) {
  await page.goto("/");
  await page.evaluate(
    ([k, v]) => localStorage.setItem(k, v),
    [CART, JSON.stringify([{ slug: a.slug, qty: 2 }, { slug: b.slug, qty: 1 }])],
  );
}

// python http.server no acepta POST: se intercepta el envío a Netlify Forms (POST /)
async function netlify(page: Page, respuesta: "ok" | "500" | "abort") {
  const cuerpos: string[] = [];
  await page.route("**/*", (route) => {
    const req = route.request();
    if (req.method() !== "POST") return route.fallback();
    cuerpos.push(req.postData() ?? "");
    if (respuesta === "abort") return route.abort("failed");
    return route.fulfill({ status: respuesta === "ok" ? 200 : 500, body: "" });
  });
  return cuerpos;
}

async function llenar(page: Page, zona = "Miranda o Caracas", metodo = "Pago Móvil") {
  await page.getByLabel("Nombre y apellido").fill(comprador.nombre);
  await page.getByLabel("Teléfono (WhatsApp)").fill(comprador.telefono);
  await page.getByLabel("Email").fill(comprador.email);
  await page.getByLabel(zona).check();
  await page.getByLabel("Dirección de entrega").fill(comprador.direccion);
  await page.getByLabel(metodo).check();
}

test("pedido completo: carrito → formulario → Netlify Forms → confirmación", async ({ page }) => {
  await conCarrito(page);
  const cuerpos = await netlify(page, "ok");
  await page.goto("/carrito/");
  await page.getByRole("link", { name: "Continuar con el pedido" }).click();
  await expect(page).toHaveURL(/\/checkout\/$/);
  await expect(page.getByTestId("resumen-linea")).toHaveCount(2);

  // validación nativa: vacío no se envía
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page).toHaveURL(/\/checkout\/$/);
  expect(cuerpos).toHaveLength(0);

  await llenar(page);
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page).toHaveURL(/\/pedido\/$/);

  expect(cuerpos).toHaveLength(1);
  const enviado = new URLSearchParams(cuerpos[0]);
  expect(enviado.get("form-name")).toBe("pedido");
  expect(enviado.get("bot-field")).toBe("");
  expect(enviado.get("nombre")).toBe(comprador.nombre);
  expect(enviado.get("direccion")).toBe(comprador.direccion);
  expect(enviado.get("zona")).toBe("miranda-caracas");
  expect(enviado.get("metodo")).toBe("pago-movil");
  expect(enviado.get("pedido")).toContain(`2 × ${a.name} (${a.slug})`);
  expect(enviado.get("total")).toContain("USD");
  const id = enviado.get("pedido-id")!;
  expect(id).toMatch(/^DN-\d{6}-[2-9A-HJ-NP-Z]{4}$/);

  // confirmación
  await expect(page.getByTestId("estado-pedido")).toHaveText("Pendiente de confirmación");
  await expect(page.getByTestId("pedido-id")).toHaveText(id);
  await expect(page.getByTestId("resumen-linea")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Paga por Pago Móvil" })).toBeVisible();
  await expect(page.getByTestId("dato-pago").first()).toBeVisible();
  const wa = page.getByRole("link", { name: "Enviar comprobante por WhatsApp" });
  const href = decodeURIComponent((await wa.getAttribute("href"))!);
  expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  expect(href).toContain(`Pedido ${id}`);
  for (const dato of PII) expect(href).not.toContain(dato);

  // carrito vaciado; pedido guardado sin datos personales; sobrevive a recargar
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (0)");
  const guardado = (await page.evaluate((k) => localStorage.getItem(k), PEDIDO))!;
  for (const dato of PII) expect(guardado).not.toContain(dato);
  await page.reload();
  await expect(page.getByTestId("pedido-id")).toHaveText(id);
});

test("'Resto del país' aclara que el envío se coordina y no se cobra", async ({ page }) => {
  await conCarrito(page);
  await page.goto("/checkout/");
  await expect(page.getByText("El envío se coordina por WhatsApp y no se cobra en este pedido.")).toBeVisible();
});

test("transferencia: se muestran sus datos y Pago Móvil como alternativa", async ({ page }) => {
  await conCarrito(page);
  await netlify(page, "ok");
  await page.goto("/checkout/");
  await llenar(page, "Resto del país", "Transferencia bancaria");
  await page.getByRole("button", { name: "Enviar pedido" }).click();
  await expect(page.getByRole("heading", { name: "Paga por Transferencia bancaria" })).toBeVisible();
  await expect(page.getByText("Cuenta", { exact: true })).toBeVisible();
  await page.getByText("Prefiero pagar por Pago Móvil").click();
  await expect(page.getByRole("button", { name: "Copiar Teléfono" })).toBeVisible();
});

for (const falla of ["500", "abort"] as const) {
  test(`si Netlify falla (${falla}): error inline + pedido por WhatsApp, sin datos personales`, async ({ page }) => {
    await conCarrito(page);
    await netlify(page, falla);
    await page.goto("/checkout/");
    await llenar(page);
    await page.getByRole("button", { name: "Enviar pedido" }).click();

    const alerta = page.getByTestId("error-envio"); // Next inyecta otro role=alert (anunciador de rutas)
    await expect(alerta).toHaveAttribute("role", "alert");
    await expect(alerta).toContainText("No pudimos enviar tu pedido");
    await expect(page).toHaveURL(/\/checkout\/$/);
    const href = decodeURIComponent((await alerta.getByRole("link", { name: "Enviar pedido por WhatsApp" }).getAttribute("href"))!);
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(href).toContain(`2 × ${a.name}`);
    expect(href).toMatch(/Pedido DN-\d{6}-/);
    for (const dato of PII) expect(href).not.toContain(dato);
    // puede reintentar; el carrito sigue intacto
    await expect(page.getByRole("button", { name: "Enviar pedido" })).toBeEnabled();
    await expect(page.getByTestId("cart-count")).toHaveText("Carrito (3)");
  });
}

test("checkout y confirmación sin carrito/pedido muestran estados explícitos", async ({ page }) => {
  await page.goto("/checkout/");
  await expect(page.getByRole("heading", { name: "No hay piezas en tu carrito" })).toBeVisible();
  await page.goto("/pedido/");
  await expect(page.getByRole("heading", { name: "No encontramos un pedido reciente" })).toBeVisible();
});

test("no se pide ningún dato de tarjeta", async ({ page }) => {
  await conCarrito(page);
  await page.goto("/checkout/");
  const campos = await page.locator("form input, form textarea, form select").evaluateAll((els) =>
    els.map((e) => `${e.getAttribute("name")} ${e.getAttribute("autocomplete") ?? ""}`),
  );
  expect(campos.join(" ")).not.toMatch(/cc-|card|tarjeta|cvv|cvc/i);
});

test("el esqueleto public/__forms.html tiene los mismos campos que el formulario real", async ({ page, request }) => {
  const esqueleto = await request.get("/__forms.html").then((r) => r.text());
  const enEsqueleto = new Set([...esqueleto.matchAll(/name="([^"]+)"/g)].map((m) => m[1]));
  await conCarrito(page);
  await page.goto("/checkout/");
  const enForm = await page.locator('form[name="pedido"] [name]').evaluateAll((els) => els.map((e) => e.getAttribute("name")!));
  for (const n of new Set(enForm)) if (n !== "form-name") expect(enEsqueleto, n).toContain(n);
  expect(esqueleto).toContain('netlify-honeypot="bot-field"');
  expect(esqueleto).toContain('data-netlify="true"');
});

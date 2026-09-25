import { expect, test } from "@playwright/test";
import products from "../data/products.json";

const KEY = "deconova:cart:v1";
const bajoPedido = products.find((p) => !p.disponible)!;
const disponible = products.find((p) => p.disponible)!;

test("el carrito persiste al navegar y al recargar", async ({ page }) => {
  await page.goto(`/productos/${disponible.slug}/`);
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (0)");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByTestId("en-carrito")).toHaveText("2 en tu carrito.");
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (2)");

  await page.getByRole("link", { name: "Catálogo", exact: true }).click();
  await expect(page).toHaveURL(/\/catalogo\/$/);
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (2)");

  await page.reload();
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (2)");
});

test("un producto bajo pedido se puede agregar (F006)", async ({ page }) => {
  await page.goto(`/productos/${bajoPedido.slug}/`);
  await expect(page.getByTestId("disponibilidad")).toHaveText("Bajo pedido");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (1)");
});

test("localStorage solo guarda slug y cantidad", async ({ page }) => {
  await page.goto(`/productos/${disponible.slug}/`);
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (1)");
  const stored = JSON.parse((await page.evaluate((k) => localStorage.getItem(k), KEY))!);
  expect(stored).toEqual([{ slug: disponible.slug, qty: 1 }]);
  const todo = await page.evaluate(() => Object.keys(localStorage));
  expect(todo).toEqual([KEY]);
});

test("datos corruptos o manipulados en localStorage no rompen la página", async ({ page }) => {
  await page.goto("/");
  const casos = [
    "{no es json",
    JSON.stringify({ slug: disponible.slug }),
    JSON.stringify([
      { slug: "no-existe", qty: 3 },
      { slug: disponible.slug, qty: -1 },
      { slug: disponible.slug, qty: 1.5 },
      { slug: bajoPedido.slug, qty: 999 },
    ]),
  ];
  const esperado = ["Carrito (0)", "Carrito (0)", "Carrito (10)"];
  for (const [i, raw] of casos.entries()) {
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, raw]);
    await page.reload();
    await expect(page.getByTestId("cart-count")).toHaveText(esperado[i]);
  }
});

test("el tope por pieza deshabilita el botón", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(([k, slug]) => localStorage.setItem(k, JSON.stringify([{ slug, qty: 9 }])), [KEY, disponible.slug]);
  await page.goto(`/productos/${disponible.slug}/`);
  const btn = page.getByRole("button", { name: "Agregar al carrito" });
  await btn.click();
  await expect(btn).toBeDisabled();
  await expect(page.getByTestId("en-carrito")).toHaveText("Máximo 10 por pieza en tu carrito.");
});

test("sin errores de consola (hidratación del contador con carrito lleno)", async ({ page }) => {
  const errores: string[] = [];
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  page.on("pageerror", (e) => errores.push(e.message));
  await page.goto("/");
  await page.evaluate(([k, slug]) => localStorage.setItem(k, JSON.stringify([{ slug, qty: 3 }])), [KEY, disponible.slug]);
  for (const path of ["/", "/catalogo/", `/productos/${disponible.slug}/`]) {
    await page.goto(path);
    await expect(page.getByTestId("cart-count")).toHaveText("Carrito (3)");
  }
  expect(errores).toEqual([]);
});

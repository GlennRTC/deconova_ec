import { expect, test } from "@playwright/test";
import products from "../data/products.json";

const usd = (n: number) => new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(n);
const [a, b] = products;

test("agregar desde el catálogo y editar el carrito recalcula el total", async ({ page }) => {
  await page.goto("/catalogo/");
  await page.locator(`[data-slug="${a.slug}"]`).getByRole("button", { name: "Agregar al carrito" }).click();
  await page.locator(`[data-slug="${b.slug}"]`).getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (2)");

  await page.getByRole("link", { name: /^Carrito/ }).click();
  await expect(page).toHaveURL(/\/carrito\/$/);
  await expect(page.getByTestId("cart-line")).toHaveCount(2);
  const total = page.getByTestId("cart-total");
  await expect(total).toHaveText(usd(a.priceUsd + b.priceUsd));

  const lineaA = page.locator(`[data-slug="${a.slug}"]`);
  await expect(lineaA.getByRole("button", { name: "Restar una" })).toBeDisabled();
  await lineaA.getByRole("button", { name: "Sumar una" }).click();
  await expect(lineaA.getByTestId("qty")).toHaveText("2");
  await expect(lineaA.getByTestId("line-total")).toHaveText(usd(a.priceUsd * 2));
  await expect(total).toHaveText(usd(a.priceUsd * 2 + b.priceUsd));
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (3)");

  await lineaA.getByRole("button", { name: "Restar una" }).click();
  await expect(total).toHaveText(usd(a.priceUsd + b.priceUsd));

  await lineaA.getByRole("button", { name: "Eliminar" }).click();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(total).toHaveText(usd(b.priceUsd));

  // persiste la edición
  await page.reload();
  await expect(total).toHaveText(usd(b.priceUsd));

  await page.locator(`[data-slug="${b.slug}"]`).getByRole("button", { name: "Eliminar" }).click();
  await expect(page.getByRole("heading", { name: "Tu carrito está vacío" })).toBeVisible();
});

test("carrito vacío: estado explícito con link al catálogo, sin tabla", async ({ page }) => {
  await page.goto("/carrito/");
  await expect(page.getByRole("heading", { name: "Tu carrito está vacío" })).toBeVisible();
  await expect(page.getByTestId("cart-line")).toHaveCount(0);
  await page.getByRole("link", { name: "Ir al catálogo" }).click();
  await expect(page).toHaveURL(/\/catalogo\/$/);
});

test("el home también permite agregar al carrito", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("region", { name: "Del catálogo" }).getByRole("button", { name: "Agregar al carrito" }).first().click();
  await expect(page.getByTestId("cart-count")).toHaveText("Carrito (1)");
});

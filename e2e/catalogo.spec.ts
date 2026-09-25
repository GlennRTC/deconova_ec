import { expect, test } from "@playwright/test";
import products from "../data/products.json";

// Iterar sobre el JSON (no sobre una lista fija) es lo que prueba que agregar
// un producto y re-buildear lo publica sin cambios de código.
test("el HTML estático del catálogo trae cada producto del JSON, sin JS", async ({ request }) => {
  const res = await request.get("/catalogo/");
  expect(res.status()).toBe(200);
  const html = await res.text();
  for (const p of products) {
    expect(html).toContain(p.name);
    expect(html).toContain(p.images[0]);
  }
});

test("cada producto muestra nombre, precio USD e imagen principal", async ({ page }) => {
  await page.goto("/catalogo/");
  const cards = page.getByTestId("product");
  await expect(cards).toHaveCount(products.length);
  for (const p of products) {
    const card = page.locator(`[data-slug="${p.slug}"]`);
    await expect(card.getByRole("heading", { name: p.name })).toBeVisible();
    await expect(card).toContainText("USD");
    await expect(card).toContainText(p.priceUsd.toLocaleString("es-VE"));
    const img = card.getByRole("img", { name: p.name });
    await expect(img).toBeVisible();
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
});

test("el home enlaza al catálogo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ver catálogo" }).click();
  await expect(page).toHaveURL(/\/catalogo\/$/);
});

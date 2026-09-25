import { expect, test } from "@playwright/test";
import products from "../data/products.json";

const categorias = [
  { slug: "sofas-y-sillones", nombre: "Sofás y sillones" },
  { slug: "sillas-y-mesas", nombre: "Sillas y mesas" },
  { slug: "escritorios", nombre: "Escritorios y sillas de escritorio" },
];
const de = (slug: string) => products.filter((p) => p.categoria === slug);

for (const c of categorias) {
  test(`${c.slug}: HTML estático con H1 y solo sus productos`, async ({ request }) => {
    const res = await request.get(`/catalogo/${c.slug}/`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain(`<h1>${c.nombre}</h1>`);
    for (const p of products) {
      const enGrid = html.includes(`data-slug="${p.slug}"`);
      expect(enGrid, p.slug).toBe(p.categoria === c.slug);
    }
  });

  test(`${c.slug}: tile activo con aria-current y línea dorada`, async ({ page }) => {
    await page.goto(`/catalogo/${c.slug}/`);
    const activo = page.locator('[data-testid="categoria"][aria-current="page"]');
    await expect(activo).toHaveCount(1);
    await expect(activo).toHaveAttribute("data-slug", c.slug);
    await expect(activo).toHaveCSS("border-bottom-color", "rgb(143, 111, 63)");
    await expect(page.getByTestId("product")).toHaveCount(de(c.slug).length);
  });
}

test("conteos de cada tile coinciden con el JSON; 'Todas' activo en /catalogo/", async ({ page }) => {
  await page.goto("/catalogo/");
  const tiles = page.getByTestId("categoria");
  await expect(tiles).toHaveCount(4);
  await expect(page.locator('[data-slug="todas"]')).toHaveAttribute("aria-current", "page");
  const n = (k: number) => `${k} ${k === 1 ? "pieza" : "piezas"}`;
  await expect(page.locator('[data-slug="todas"]').getByTestId("conteo")).toHaveText(n(products.length));
  for (const c of categorias)
    await expect(page.locator(`[data-testid="categoria"][data-slug="${c.slug}"]`).getByTestId("conteo")).toHaveText(n(de(c.slug).length));
});

test("cambiar de categoría por teclado", async ({ page }) => {
  await page.goto("/catalogo/");
  await page.locator('[data-testid="categoria"][data-slug="escritorios"]').focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/catalogo\/escritorios\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Escritorios y sillas de escritorio");
});

test("mobile: tiles ≥44px, no son pills, y la página no desborda horizontalmente", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/catalogo/");
  for (const tile of await page.getByTestId("categoria").all()) {
    expect((await tile.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await tile.evaluate((el) => getComputedStyle(el).borderRadius)).not.toMatch(/999/);
  }
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(desborde).toBeLessThanOrEqual(0);
});

test("home: 'Explora por ambiente' enlaza a las 3 categorías", async ({ page }) => {
  await page.goto("/");
  const seccion = page.getByRole("region", { name: "Explora por ambiente" });
  const links = seccion.getByTestId("categoria");
  await expect(links).toHaveCount(3);
  for (const [i, c] of categorias.entries()) await expect(links.nth(i)).toHaveAttribute("href", `/catalogo/${c.slug}/`);
  await expect(seccion.locator('[aria-current="page"]')).toHaveCount(0);
});

test("mobile: la categoría activa siempre queda visible (sin scroll horizontal oculto)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const c of categorias) {
    await page.goto(`/catalogo/${c.slug}/`);
    await expect(page.locator('[data-testid="categoria"][aria-current="page"]')).toBeInViewport({ ratio: 1 });
  }
});

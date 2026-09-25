import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// Design system v2 (sesión 7): Manrope en títulos y precios, Work Sans en cuerpo; nunca Inter.
test("tipografía con jerarquía: Manrope en títulos y precios, Work Sans en cuerpo, nunca Inter", async ({ page }) => {
  const style = (sel: string) =>
    page.locator(sel).first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { family: s.fontFamily, weight: Number(s.fontWeight) };
    });
  const h1 = await style("h1");
  expect(h1.family).toMatch(/Manrope/i);
  expect(h1.weight).toBeGreaterThanOrEqual(700);
  expect((await style(".price")).family).toMatch(/Manrope/i);
  expect((await style("main p")).family).toMatch(/Work Sans/i);
  for (const sel of ["h1", "body", ".price"]) expect((await style(sel)).family).not.toMatch(/\bInter\b/);
});

test("charcoal solo en 1-2 secciones (hero y footer), fondo claro dominante", async ({ page }) => {
  const oscuras = await page.evaluate(
    () => [...document.querySelectorAll("*")].filter((el) => getComputedStyle(el).backgroundColor === "rgb(20, 18, 16)").length,
  );
  expect(oscuras).toBeGreaterThanOrEqual(1);
  expect(oscuras).toBeLessThanOrEqual(2);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(255, 255, 255)");
});

test("enlaza a catálogo y a contacto (Instagram real)", async ({ page }) => {
  await expect(page.getByRole("link", { name: "Ver catálogo" })).toHaveAttribute("href", "/catalogo/");
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Contacto" }).click();
  const contacto = page.locator("#contacto");
  await expect(contacto).toBeInViewport();
  await expect(contacto.getByRole("link", { name: "@deconova.ve" })).toHaveAttribute(
    "href",
    "https://www.instagram.com/deconova.ve/",
  );
});

test("destacados llevan al detalle del producto", async ({ page }) => {
  const destacados = page.getByRole("region", { name: "Del catálogo" }).getByRole("link");
  await expect(destacados).toHaveCount(3);
  await destacados.first().click();
  await expect(page).toHaveURL(/\/productos\/[a-z0-9-]+\/$/);
});

test("sin anti-patrones: gradientes, copy genérico, social proof, hero de 2 botones", async ({ page }) => {
  const gradientes = await page.evaluate(() =>
    [...document.querySelectorAll("*")].filter((el) => getComputedStyle(el).backgroundImage.includes("gradient")).length,
  );
  expect(gradientes).toBe(0);
  const texto = await page.locator("body").innerText();
  expect(texto).not.toMatch(/get started|learn more|try it free|transform your|the future of|trusted by|\+\s?clientes/i);
  // el hero tiene una sola llamada a la acción, no el par filled/outline
  await expect(page.locator("main section").first().getByRole("link")).toHaveCount(1);
});

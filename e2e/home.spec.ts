import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("tipografía con jerarquía: serif en títulos, sans en cuerpo, nunca Inter", async ({ page }) => {
  const font = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(await font("h1")).toMatch(/Fraunces/i);
  expect(await font("h1 .accent")).toMatch(/Italiana/i);
  expect(await font(".label")).toMatch(/Jost/i);
  expect(await font("main p:not(.label)")).toMatch(/Work Sans/i);
  for (const sel of ["h1", "body", ".label"]) expect(await font(sel)).not.toMatch(/\bInter\b/);
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

import { expect, test } from "@playwright/test";
import products from "../data/products.json";

for (const p of products) {
  test(`producto ${p.slug}: galería navegable con ${p.images.length} foto(s)`, async ({ page }) => {
    const res = await page.goto(`/productos/${p.slug}/`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: p.name })).toBeVisible();

    const main = page.getByRole("img", { name: new RegExp(`foto \\d+ de ${p.images.length}$`) });
    const src = async () => decodeURIComponent((await main.getAttribute("src")) ?? "");
    expect(await src()).toContain(p.images[0]);

    if (p.images.length < 2) {
      // degrada: sin controles, sin error
      await expect(page.getByRole("button", { name: /Foto (siguiente|anterior)/ })).toHaveCount(0);
      return;
    }
    await expect(page.getByRole("button", { name: /^Ver foto/ })).toHaveCount(p.images.length);
    await page.getByRole("button", { name: "Foto siguiente" }).click();
    expect(await src()).toContain(p.images[1]);
    await page.getByRole("button", { name: "Foto anterior" }).click();
    await page.getByRole("button", { name: "Foto anterior" }).click(); // da la vuelta
    expect(await src()).toContain(p.images.at(-1)!);
    await page.getByRole("button", { name: "Ver foto 1" }).click();
    expect(await src()).toContain(p.images[0]);
  });
}

test("las tarjetas del catálogo llevan al detalle", async ({ page }) => {
  await page.goto("/catalogo/");
  await page.getByRole("link", { name: products[0].name }).click();
  await expect(page).toHaveURL(new RegExp(`/productos/${products[0].slug}/$`));
});

test("slug inexistente no se genera", async ({ request }) => {
  expect((await request.get("/productos/no-existe/")).status()).toBe(404);
});

import { expect, test } from "@playwright/test";
import raw from "../data/products.json";

type P = (typeof raw)[number] & { dimensionesCm?: { alto: number; ancho: number; profundidad: number } };
const products = raw as P[];

for (const p of products) {
  test.describe(`ficha ${p.slug}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/productos/${p.slug}/`);
    });

    test("medidas visibles junto al precio, sin scroll", async ({ page }) => {
      const medidas = page.getByTestId("medidas");
      await expect(medidas).toBeInViewport();
      if (p.dimensionesCm) {
        const { alto, ancho, profundidad } = p.dimensionesCm;
        await expect(medidas).toContainText(`Alto${alto} cm`);
        await expect(medidas).toContainText(`Ancho${ancho} cm`);
        await expect(medidas).toContainText(`Profundidad${profundidad} cm`);
      } else {
        await expect(medidas).toContainText("Medidas a confirmar");
      }
    });

    test("disponibilidad según el JSON", async ({ page }) => {
      await expect(page.getByTestId("disponibilidad")).toHaveText(p.disponible ? "Disponible" : "Bajo pedido");
      if (!p.disponible) await expect(page.getByTestId("entrega")).toContainText("tiempo de entrega");
    });
  });
}

test("el catálogo muestra la disponibilidad de cada producto", async ({ page }) => {
  await page.goto("/catalogo/");
  for (const p of products) {
    await expect(page.locator(`[data-slug="${p.slug}"]`).getByTestId("disponibilidad")).toHaveText(
      p.disponible ? "Disponible" : "Bajo pedido",
    );
  }
});

test("los datos demo cubren ambos casos de cada feature", () => {
  expect(new Set(products.map((p) => p.disponible)).size).toBe(2);
  expect(products.some((p) => p.dimensionesCm) && products.some((p) => !p.dimensionesCm)).toBe(true);
});

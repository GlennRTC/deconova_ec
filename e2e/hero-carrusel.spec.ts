import { expect, test } from "@playwright/test";

test("carrusel del hero: flechas, puntos y vuelta circular", async ({ page }) => {
  await page.goto("/");
  const carrusel = page.getByRole("region", { name: "Ambientes Deconova" });
  // las no visibles llevan aria-hidden (no se anuncian): se buscan por atributo, no por rol
  const slides = carrusel.locator('[aria-roledescription="diapositiva"]');
  await expect(slides).toHaveCount(3);
  const puntos = carrusel.getByRole("button", { name: /^Ver ambiente/ });
  const activo = () => carrusel.locator('button[aria-current="true"]');

  await expect(activo()).toHaveAccessibleName("Ver ambiente 1: Sala");
  await carrusel.getByRole("button", { name: "Ambiente siguiente" }).click();
  await expect(activo()).toHaveAccessibleName("Ver ambiente 2: Comedor");
  await expect(slides.nth(1)).toBeInViewport({ ratio: 0.9 });

  await puntos.nth(2).click();
  await expect(activo()).toHaveAccessibleName("Ver ambiente 3: Estudio");
  await carrusel.getByRole("button", { name: "Ambiente siguiente" }).click(); // vuelta
  await expect(activo()).toHaveAccessibleName("Ver ambiente 1: Sala");
  await carrusel.getByRole("button", { name: "Ambiente anterior" }).click(); // vuelta inversa
  await expect(activo()).toHaveAccessibleName("Ver ambiente 3: Estudio");
});

test("carrusel: swipe/scroll nativo actualiza el punto activo", async ({ page }) => {
  await page.goto("/");
  const carrusel = page.getByRole("region", { name: "Ambientes Deconova" });
  await carrusel.locator("div").first().evaluate((el) => el.scrollTo({ left: el.clientWidth, behavior: "instant" }));
  await expect(carrusel.locator('button[aria-current="true"]')).toHaveAccessibleName("Ver ambiente 2: Comedor");
});

test("carrusel: diapositivas anunciadas 'N de M' y sin autoplay", async ({ page }) => {
  await page.goto("/");
  const carrusel = page.getByRole("region", { name: "Ambientes Deconova" });
  await expect(carrusel.locator('[aria-roledescription="diapositiva"]').first()).toHaveAttribute("aria-label", "1 de 3: Sala");
  await page.waitForTimeout(3000);
  await expect(carrusel.locator('button[aria-current="true"]')).toHaveAccessibleName("Ver ambiente 1: Sala");
});

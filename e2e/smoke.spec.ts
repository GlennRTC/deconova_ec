import { expect, test } from "@playwright/test";

test("home carga desde el build estático", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId("brand")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

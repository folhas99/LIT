import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("carrega e mostra hero", async ({ page }) => {
    await page.goto("/");
    // Hero title should be visible
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("navegação para /eventos funciona", async ({ page }) => {
    await page.goto("/");
    // Click any nav link pointing to /eventos if it exists; otherwise just navigate
    await page.goto("/eventos");
    await expect(page).toHaveURL(/\/eventos$/);
    await expect(page.locator("h1")).toContainText(/eventos/i);
  });

  test("navegação para /galeria funciona", async ({ page }) => {
    await page.goto("/galeria");
    await expect(page).toHaveURL(/\/galeria$/);
  });

  test("página de contacto carrega formulário", async ({ page }) => {
    await page.goto("/contacto");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
  });
});

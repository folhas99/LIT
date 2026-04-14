import { test, expect } from "@playwright/test";

test.describe("Admin login", () => {
  test("página de login carrega", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("rejeita credenciais inválidas", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator('input[type="email"], input[name="email"]').first().fill("nonexistent@example.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: /entrar|login|sign in/i }).click();
    // Should stay on login page or show error
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/\/admin\/login/);
  });

  test("rotas admin redirecionam para login quando não autenticado", async ({ page }) => {
    await page.goto("/admin/eventos");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

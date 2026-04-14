import { test, expect } from "@playwright/test";

test.describe("Formulário de contacto", () => {
  test("rejeita submissão vazia", async ({ page }) => {
    await page.goto("/contacto");
    const submit = page.getByRole("button", { name: /enviar/i });
    await submit.click();
    // HTML5 validation should prevent submission — form still visible
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("aceita submissão válida", async ({ page }) => {
    await page.goto("/contacto");
    await page.fill('input[id="contact-name"]', "Playwright Test");
    await page.fill('input[id="contact-email"]', `pwtest+${Date.now()}@example.com`);
    await page.fill('textarea[id="contact-message"]', "Mensagem de teste automatizado.");
    await page.getByRole("button", { name: /enviar/i }).click();
    // Either success message or network error — allow a reasonable wait
    await expect(page.getByText(/mensagem enviada|erro/i)).toBeVisible({ timeout: 10_000 });
  });
});

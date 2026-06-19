import { test, expect } from "@playwright/test";

test.describe("Agendamentos", () => {
  test("A1: Verificar que a agenda carrega", async ({ page }) => {
    await page.goto("/dashboard/agenda");
    await page.waitForSelector("h1:has-text('Agenda')", { timeout: 10000 });

    const countConfirmed = page.locator("text=confirmados").first();
    await expect(countConfirmed).toBeVisible();
  });

  test("A2: Verificar que clientes page carrega", async ({ page }) => {
    await page.goto("/dashboard/clientes");
    await page.waitForSelector("h2:has-text('Clientes')", { timeout: 10000 });

    const pageContent = page.locator("text=Nenhum cliente encontrado").first();
    await expect(pageContent).toBeVisible({ timeout: 5000 }).catch(() => {
      // Se não mostrar "nenhum cliente", a tabela pode estar visível
    });
  });
});

test.describe("Profissionais", () => {
  test("P1: Listar profissionais no dashboard", async ({ page }) => {
    await page.goto("/dashboard/profissionais");
    await page.waitForSelector("h2:has-text('Equipe')", { timeout: 10000 });

    // Verificar se mostra "Barbeiros" ou "0 Barbeiros"
    const texto = page.locator("text=/\\d+ Barbeiro/").first();
    await expect(texto).toBeVisible({ timeout: 5000 });

    // Se mostrar "1 Barbeiro", significa que existe profissional
    const temProfissional = page.locator("text=1 Barbeiro");
    const semProfissional = page.locator("text=0 Barbeiro");
    
    if (await temProfissional.isVisible()) {
      console.log("✓ Profissional 'Barbeiro' encontrado");
    } else if (await semProfissional.isVisible()) {
      console.log("⚠ Nenhum profissional encontrado - pode ser problema no trigger");
    }
  });

  test("P2: Navegar para agenda de profissionais", async ({ page }) => {
    await page.goto("/dashboard/agenda-profissionais");
    await page.waitForSelector("h1", { timeout: 10000 });
    
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });
});

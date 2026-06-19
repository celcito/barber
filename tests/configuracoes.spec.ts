import { test, expect } from "@playwright/test";

test.describe("Configurações", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/configuracoes");
    await page.waitForSelector('h2:has-text("Configurações")');
  });

  test("C1: Alterar nome e slug persistem após reload", async ({ page }) => {
    const nomeInput = page.locator('input[name="nome"]');
    const slugInput = page.locator('input[name="slug"]');

    await nomeInput.fill("Barbearia Teste E2E");
    await slugInput.fill("barbearia-teste-e2e");

    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForSelector('h2:has-text("Configurações")');

    await expect(nomeInput).toHaveValue("Barbearia Teste E2E");
    await expect(slugInput).toHaveValue("barbearia-teste-e2e");

    await nomeInput.fill("Barbearia Teste");
    await slugInput.fill("barbearia-teste");
    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });
  });

  test("C2: Alterar slug persiste após reload", async ({ page }) => {
    const slugInput = page.locator('input[name="slug"]');

    await slugInput.fill("barbearia-e2e");
    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForSelector('h2:has-text("Configurações")');
    await expect(slugInput).toHaveValue("barbearia-e2e");

    await slugInput.fill("barbearia-teste");
    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });
  });

  test("C3: Marcar Aberto no domingo persiste após reload", async ({ page }) => {
    const checkbox = page.locator('input[name="horario_domingo_aberto"]');
    await checkbox.check({ force: true });

    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForSelector('h2:has-text("Configurações")');

    await expect(checkbox).toBeChecked();
  });

  test("C4: Desmarcar Aberto na segunda persiste após reload", async ({ page }) => {
    const checkbox = page.locator('input[name="horario_segunda-feira_aberto"]');
    await checkbox.uncheck({ force: true });

    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForSelector('h2:has-text("Configurações")');

    await expect(checkbox).not.toBeChecked();

    await checkbox.check({ force: true });
    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });
  });

  test("C5: Endereço completo persiste após reload", async ({ page }) => {
    const fields = {
      endereco_logradouro: "Av. Paulista",
      endereco_numero: "1000",
      endereco_complemento: "Sala 42",
      endereco_bairro: "Bela Vista",
      endereco_cidade: "São Paulo",
      endereco_estado: "SP",
      endereco_cep: "01310-100",
    };

    for (const [name, value] of Object.entries(fields)) {
      await page.locator(`input[name="${name}"]`).fill(value);
    }

    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForSelector('h2:has-text("Configurações")');

    for (const [name, value] of Object.entries(fields)) {
      await expect(page.locator(`input[name="${name}"]`)).toHaveValue(value);
    }

    for (const [name] of Object.entries(fields)) {
      await page.locator(`input[name="${name}"]`).fill("");
    }
    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });
  });

  test("C6: Redes sociais persistem após reload", async ({ page }) => {
    await page.locator('input[name="rede_instagram"]').fill("@barbearia-e2e");
    await page.locator('input[name="rede_facebook"]').fill("fb.com/barbearia-e2e");

    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForSelector('h2:has-text("Configurações")');

    await expect(page.locator('input[name="rede_instagram"]')).toHaveValue("@barbearia-e2e");
    await expect(page.locator('input[name="rede_facebook"]')).toHaveValue("fb.com/barbearia-e2e");

    await page.locator('input[name="rede_instagram"]').fill("");
    await page.locator('input[name="rede_facebook"]').fill("");
    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });
  });

  test("C7: Notificar dono e lembretes persistem após reload", async ({ page }) => {
    const notificarDono = page.locator('input[name="notificar_dono"]');
    const lembretesAtivos = page.locator('input[name="lembretes_ativos"]');

    await notificarDono.check({ force: true });
    await lembretesAtivos.check({ force: true });

    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForSelector('h2:has-text("Configurações")');

    await expect(notificarDono).toBeChecked();
    await expect(lembretesAtivos).toBeChecked();
  });

  test("C8: Intervalo de 45min persiste após reload", async ({ page }) => {
    await page.locator('select[name="intervalo"]').selectOption("45");

    await page.click("button[type='submit']");
    await expect(page.locator("text=Configurações salvas com sucesso!")).toBeVisible({ timeout: 10000 });

    await page.reload();
    await page.waitForSelector('h2:has-text("Configurações")');

    await expect(page.locator('select[name="intervalo"]')).toHaveValue("45");
  });
});

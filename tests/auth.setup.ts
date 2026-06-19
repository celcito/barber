import { test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", "teste@barbearia.com");
  await page.fill("#password", "123456");
  await page.click("button[type='submit']");
  await page.waitForURL("/dashboard");
  await page.context().storageState({ path: authFile });
});

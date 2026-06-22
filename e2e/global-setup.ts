import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(_: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to your app and log in
  await page.goto(process.env.BASE_URL ?? 'http://localhost:5173/login');

  await page
    .getByLabel(/email/i)
    .fill(process.env.TEST_USER_EMAIL ?? 'minh@gmail.com');

  await page
    .getByLabel(/password/i)
    .first()
    .fill(process.env.TEST_USER_PASSWORD ?? 'Netngo2007!');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for the dashboard to ensure the backend responded and token is set
  await page.waitForURL('**/dashboard');

  // Save the browser state (cookies, localStorage, etc.) to a local JSON file
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
  await browser.close();
}

export default globalSetup;

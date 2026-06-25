import { test, expect, type Page } from '@playwright/test';

// Wipe the storage state so the user starts logged out
test.use({ storageState: { cookies: [], origins: [] } });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reliably fill a single input, retrying if React drops the event */
async function fillInput(
  page: Page,
  locator: ReturnType<Page['locator']>,
  value: string
) {
  await locator.waitFor({ state: 'visible' });
  await locator.click();
  await locator.fill(value);
  // Verify React actually registered the value — if not, try pressSequentially
  const actual = await locator.inputValue();
  if (actual !== value) {
    await locator.clear();
    await locator.pressSequentially(value, { delay: 30 });
  }
}

async function submitLoginForm(page: Page, email: string, password: string) {
  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/password/i).first();

  await fillInput(page, emailInput, email);
  await fillInput(page, passwordInput, password);

  // Verify both fields before submitting
  await expect(emailInput).toHaveValue(email);
  await expect(passwordInput).toHaveValue(password);

  await page.getByRole('button', { name: /sign in/i }).click();
}

async function submitSignUpForm(page: Page, email: string, password: string) {
  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/^password$/i);
  const confirmInput = page.getByLabel(/confirm password/i);

  await fillInput(page, emailInput, email);
  await fillInput(page, passwordInput, password);
  await fillInput(page, confirmInput, password);

  await expect(emailInput).toHaveValue(email);
  await expect(passwordInput).toHaveValue(password);
  await expect(confirmInput).toHaveValue(password);

  await page.getByRole('button', { name: /create account/i }).click();
}

/** Inject a JWT token directly into localStorage to simulate a logged-in session. */
async function injectAuthToken(page: Page, token = 'fake-valid-jwt') {
  await page.addInitScript((t) => {
    localStorage.setItem('token', t);
  }, token);
}

/** Remove the token from localStorage to simulate a logged-out session. */
async function clearAuthToken(page: Page) {
  await page.evaluate(() => localStorage.removeItem('token'));
}

// ---------------------------------------------------------------------------
// Test accounts
// Swap these for environment variables in CI:
//   process.env.TEST_USER_EMAIL / TEST_USER_PASSWORD
// ---------------------------------------------------------------------------
const EXISTING_USER = {
  email: process.env.TEST_USER_EMAIL ?? 'testuser@codestep.dev',
  password: process.env.TEST_USER_PASSWORD ?? 'Password123!',
};

const NEW_USER = {
  // Timestamp suffix keeps the email unique across test runs
  email: `e2e+${Date.now()}@codestep.dev`,
  password: 'NewPass123!',
};

// ---------------------------------------------------------------------------
// Suite 1 — Login page
// ---------------------------------------------------------------------------
test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/login');
    // Confirm the form is interactive before each test runs
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('renders the login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows a link to the sign-up page', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await expect(page).toHaveURL('/signup');
  });

  test('existing user can log in and lands on dashboard or language selection', async ({
    page,
  }) => {
    await submitLoginForm(page, EXISTING_USER.email, EXISTING_USER.password);

    // A user who has already selected a language goes to /dashboard;
    // a brand-new account goes to /language-selection first.
    await expect(page).toHaveURL(/\/(dashboard|language-selection)/, {
      timeout: 10_000,
    });
  });

  test('wrong password shows an inline error message', async ({ page }) => {
    await submitLoginForm(page, EXISTING_USER.email, 'wrong-password');

    // The LoginForm renders an aria-live alert on failure
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    // URL must NOT have changed — user stays on /login
    await expect(page).toHaveURL('/login');
  });

  test('non-existent email shows an error and stays on login', async ({
    page,
  }) => {
    await submitLoginForm(page, 'nobody@nowhere.dev', 'irrelevant');

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('submit button is visible but form requires filled fields (HTML validation)', async ({
    page,
  }) => {
    // Click submit without filling anything — browser native validation
    // prevents submission; we should still be on /login
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/login');
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Sign-up page
// ---------------------------------------------------------------------------
test.describe('Sign-up page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/signup');
    await expect(
      page.getByRole('button', { name: /create account/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('renders the sign-up form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /create your account/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /create account/i })
    ).toBeVisible();
  });

  test('shows a link back to the login page', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await expect(page).toHaveURL('/login');
  });

  test('new user can sign up and is redirected to language selection', async ({
    page,
  }) => {
    // Tạo một email ngẫu nhiên hoàn toàn mới cho riêng lượt chạy này
    const localNewUser = {
      email: `e2e+${Math.random().toString(36).substring(2, 11)}@codestep.dev`,
      password: 'NewPass123!',
    };

    // 1. Thực hiện đăng ký tài khoản mới tinh
    await submitSignUpForm(page, localNewUser.email, localNewUser.password);

    // 2. Chờ hệ thống chuyển hướng về trang login
    await expect(page).toHaveURL('/login', { timeout: 10_000 });

    // 3. Tiến hành đăng nhập bằng tài khoản vừa tạo thành công
    await submitLoginForm(page, localNewUser.email, localNewUser.password);

    // 4. Kiểm tra xem có vào đúng trang chọn ngôn ngữ không
    await expect(page).toHaveURL('/language-selection', { timeout: 10_000 });
  });

  test('mismatched passwords prevent submission', async ({ page }) => {
    await page.getByLabel(/email/i).fill(NEW_USER.email);
    await page.getByLabel(/^password$/i).fill('Password123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPass999!');
    await page.getByRole('button', { name: /create account/i }).click();

    // SignUpForm guards this with an early return — page should NOT navigate
    await expect(page).toHaveURL('/signup');
  });

  test('duplicate email shows an error message', async ({ page }) => {
    // EXISTING_USER is already registered
    await submitSignUpForm(page, EXISTING_USER.email, EXISTING_USER.password);

    await expect(page.locator('p.text-red-600')).toBeVisible({
      timeout: 8_000,
    });
    await expect(page).toHaveURL('/signup');
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Auth redirect guards
// ---------------------------------------------------------------------------
test.describe('Auth redirect guards', () => {
  test('unauthenticated user visiting /dashboard is redirected to /login', async ({
    page,
  }) => {
    // Ensure no stale token exists
    await page.goto('/login');
    await clearAuthToken(page);

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login', { timeout: 8_000 });
  });

  test('unauthenticated user visiting /practice is redirected to /login', async ({
    page,
  }) => {
    await page.goto('/login');
    await clearAuthToken(page);

    await page.goto('/practice');
    await expect(page).toHaveURL('/login', { timeout: 8_000 });
  });

  test('authenticated user visiting /login is redirected away', async ({
    page,
  }) => {
    await page.route('**/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@test.com',
          selectedLanguage: ['en'],
        }),
      });
    });

    await injectAuthToken(page);
    await page.goto('/login');

    await expect(page).toHaveURL(/\/(language-selection|dashboard)/, {
      timeout: 8_000,
    });
  });
  test('authenticated user visiting /signup is redirected away', async ({
    page,
  }) => {
    await page.route('**/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@test.com',
          selectedLanguage: ['en'],
        }),
      });
    });

    await injectAuthToken(page);
    await page.goto('/signup');

    await expect(page).toHaveURL(/\/(language-selection|dashboard)/, {
      timeout: 8_000,
    });
  });
});

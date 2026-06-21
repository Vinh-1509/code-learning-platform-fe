import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigate to /languageselection as a freshly-registered user:
 * has a valid token but no selectedLanguage yet.
 *
 * In CI, point TEST_FRESH_TOKEN at a token seeded for an account
 * with no language selected. Locally the fallback runs a quick
 * signup to get a real token.
 */
async function gotoAsFirstTimeUser(page: Page) {
  const token = process.env.TEST_FRESH_TOKEN;

  if (token) {
    await page.addInitScript((t) => localStorage.setItem('token', t), token);
    await page.goto('/languageselection');
  } else {
    // Fall back: register a throwaway account → lands on /languageselection
    await page.goto('/signup');
    const email = `lang-select-${Date.now()}@codestep.dev`;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password$/i).fill('Password123!');
    await page.getByLabel(/confirm password/i).fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL('/languageselection', { timeout: 10_000 });
  }
}

/**
 * Inject a token for an existing user who already has a language saved.
 * Used to verify the checkLanguageSelection redirect guard.
 */
async function gotoAsReturningUser(page: Page) {
  const token = process.env.TEST_USER_TOKEN;
  if (!token) {
    // Sign in with the seeded test account
    await page.goto('/login');
    await page
      .getByLabel(/email/i)
      .fill(process.env.TEST_USER_EMAIL ?? 'testuser@codestep.dev');
    await page
      .getByLabel(/password/i)
      .first()
      .fill(process.env.TEST_USER_PASSWORD ?? 'Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|languageselection)/, {
      timeout: 10_000,
    });
  } else {
    await page.addInitScript((t) => localStorage.setItem('token', t), token);
    await page.goto('/languageselection');
  }
}

// ---------------------------------------------------------------------------
// Suite 1 — Page rendering
// ---------------------------------------------------------------------------
test.describe('Language selection page — rendering', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAsFirstTimeUser(page);
  });

  test('renders the page heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /choose your language/i })
    ).toBeVisible();
  });

  test('renders the sub-heading copy', async ({ page }) => {
    await expect(
      page.getByText(
        /select the language you want to build your custom journey/i
      )
    ).toBeVisible();
  });

  test('renders both language cards — C++ and Java', async ({ page }) => {
    await expect(page.getByText('C++').first()).toBeVisible();
    await expect(page.getByText('Java').first()).toBeVisible();
  });

  test('each card shows Strengths, Challenges, and Use Cases sections', async ({
    page,
  }) => {
    // There are two cards so there will be two of each label
    const strengthsLabels = page.getByText(/strengths/i);
    const challengesLabels = page.getByText(/challenges/i);
    const useCasesLabels = page.getByText(/use cases/i);

    await expect(strengthsLabels).toHaveCount(2);
    await expect(challengesLabels).toHaveCount(2);
    await expect(useCasesLabels).toHaveCount(2);
  });

  test('the Continue button is disabled before any selection', async ({
    page,
  }) => {
    const continueBtn = page.getByRole('button', { name: /continue/i });
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toBeDisabled();
  });

  test('shows the "saved to your profile" notice', async ({ page }) => {
    await expect(
      page.getByText(/selection will be saved to your profile/i)
    ).toBeVisible();
  });

  test('skeleton cards are not visible once data has loaded', async ({
    page,
  }) => {
    // Skeleton cards use animate-pulse; they should be gone after load
    await expect(page.locator('.animate-pulse')).toHaveCount(0, {
      timeout: 8_000,
    });
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Selecting a language
// ---------------------------------------------------------------------------
test.describe('Language selection page — card interaction', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAsFirstTimeUser(page);
    // Wait for real cards to appear (skeleton gone)
    await expect(page.locator('.animate-pulse')).toHaveCount(0, {
      timeout: 8_000,
    });
  });

  test('clicking the C++ card marks it as selected', async ({ page }) => {
    const cppCard = page
      .locator('div')
      .filter({ hasText: /^C\+\+/ })
      .first();

    await cppCard.click();

    // The selected card shows "✓ Selected" on its button
    await expect(
      page.getByRole('button', { name: /✓ selected/i }).first()
    ).toBeVisible();
  });

  test('clicking the Java card marks it as selected', async ({ page }) => {
    const javaCard = page.locator('div').filter({ hasText: /^Java/ }).first();

    await javaCard.click();

    await expect(
      page.getByRole('button', { name: /✓ selected/i }).first()
    ).toBeVisible();
  });

  test('only one card can be selected at a time', async ({ page }) => {
    // Select C++ first
    await page.getByRole('button', { name: /select c\+\+/i }).click();
    await expect(page.getByRole('button', { name: /✓ selected/i })).toHaveCount(
      1
    );

    // Switch to Java
    await page.getByRole('button', { name: /select java/i }).click();
    await expect(page.getByRole('button', { name: /✓ selected/i })).toHaveCount(
      1
    );

    // C++ button should be back to its unselected label
    await expect(
      page.getByRole('button', { name: /select c\+\+/i })
    ).toBeVisible();
  });

  test('Continue button becomes enabled after selecting a language', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /continue/i })
    ).toBeDisabled();

    await page.getByRole('button', { name: /select c\+\+/i }).click();

    await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled();
  });

  test('selecting via the card body (not the button) also works', async ({
    page,
  }) => {
    // LanguageCard has an onClick on the outer div as well
    const cppHeader = page.locator('div').filter({ hasText: 'C++' }).first();
    await cppHeader.click();

    await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled();
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Confirming a selection
// ---------------------------------------------------------------------------
test.describe('Language selection page — confirming', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAsFirstTimeUser(page);
    await expect(page.locator('.animate-pulse')).toHaveCount(0, {
      timeout: 8_000,
    });
  });

  test('confirming C++ redirects to /dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /select c\+\+/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
  });

  test('confirming Java redirects to /dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /select java/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
  });

  test('Continue button shows "Saving…" while the request is in flight', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /select c\+\+/i }).click();

    // Slow down the API call so we can catch the intermediate state
    await page.route('**/api/languages/select', async (route) => {
      await new Promise((r) => setTimeout(r, 1_500));
      await route.continue();
    });

    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByRole('button', { name: /saving/i })).toBeVisible();
  });

  test('Continue button is not clickable while saving', async ({ page }) => {
    await page.getByRole('button', { name: /select c\+\+/i }).click();

    await page.route('**/api/languages/select', async (route) => {
      await new Promise((r) => setTimeout(r, 1_500));
      await route.continue();
    });

    const continueBtn = page.getByRole('button', { name: /continue|saving/i });
    await continueBtn.click();

    // Should be disabled while saving to prevent double-submit
    await expect(continueBtn).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — checkLanguageSelection redirect guard
// ---------------------------------------------------------------------------
test.describe('Language selection page — redirect guard', () => {
  test('returning user with a saved language is redirected to /dashboard', async ({
    page,
  }) => {
    await gotoAsReturningUser(page);

    // checkLanguageSelection fires in beforeLoad:
    // if selectedLanguage.length > 0 → redirect to /dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
  });

  test('unauthenticated user visiting /languageselection is redirected to /login', async ({
    page,
  }) => {
    // Clear any existing token
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('token'));

    await page.goto('/languageselection');

    // requireAuth fires first → /login
    await expect(page).toHaveURL('/login', { timeout: 8_000 });
  });
});

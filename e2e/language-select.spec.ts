import { test, expect, type Page } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@codestep.dev`;
}

async function submitLoginForm(page: Page, email: string, password: string) {
  await page.getByLabel(/email/i).fill(email);
  await page
    .getByLabel(/password/i)
    .first()
    .fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

/** Fill and submit the sign-up form. */
async function submitSignUpForm(page: Page, email: string, password: string) {
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole('button', { name: /create account/i }).click();
}

/**
 * Sign up a brand-new throwaway account via the real UI, then log in
 * with the same credentials.
 */
async function signUpNewUser(page: Page, emailPrefix = 'lang-select') {
  const email = uniqueEmail(emailPrefix);
  const password = 'Password123!';

  await page.goto('/signup');
  await submitSignUpForm(page, email, password);

  // Dynamically handle auto-login vs manual login
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // Give the app a brief window to auto-redirect to the destination
      await page.waitForURL('**/languageselection', { timeout: 5_000 });
      break; // Successfully reached the target page, exit loop
    } catch {
      if (page.url().includes('/login')) {
        await submitLoginForm(page, email, password);
      }
    }
  }

  await expect(page).toHaveURL('/languageselection', { timeout: 5_000 });
  return { email, password };
}

/**
 * Navigate to /languageselection as a freshly-registered user:
 * has a valid token but no selectedLanguage yet.
 */
async function gotoAsFirstTimeUser(page: Page) {
  await signUpNewUser(page);
}

/**
 * Produce a "returning user" — i.e. an account that already has a
 * selectedLanguage saved — entirely through real UI flows:
 *   1. Sign up a fresh account (lands on /languageselection)
 *   2. Pick a language and confirm (redirects to /dashboard)
 *   3. Re-visit /languageselection to exercise the redirect guard
 */
async function gotoAsReturningUser(page: Page) {
  await page.goto('/login');
  await submitLoginForm(
    page,
    process.env.TEST_USER_EMAIL ?? 'testuser@codestep.dev',
    process.env.TEST_USER_PASSWORD ?? 'Password123!'
  );

  // After login, AuthContextProvider navigates to /languageselection,
  // then checkLanguageSelection sees selectedLanguage is set → /dashboard
  await expect(page).toHaveURL('/dashboard', { timeout: 15_000 });

  await page.evaluate(() => {
    window.history.pushState({}, '', '/languageselection');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
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
    // Click the actual button rather than the vague outer div
    await page.getByRole('button', { name: /select c\+\+/i }).click();

    await expect(
      page.getByRole('button', { name: /✓ selected/i }).first()
    ).toBeVisible();
  });

  test('clicking the Java card marks it as selected', async ({ page }) => {
    // Click the actual button
    await page.getByRole('button', { name: /select java/i }).click();

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
    // Target the specific heading to ensure we click the header section,
    // bypassing the stopPropagation zone in the body
    const cppTitle = page.getByRole('heading', { name: 'C++' });
    await cppTitle.click();

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

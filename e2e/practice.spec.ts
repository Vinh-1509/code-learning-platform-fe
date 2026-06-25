import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function gotoPractice(page: Page) {
  // Navigate directly to the destination path to avoid root-level auth guard redirects
  await page.goto('/practice');

  // Confirm the application recognizes the state by verifying an auth element is visible
  await expect(
    page.getByRole('heading', { name: /practice library/i })
  ).toBeVisible({
    timeout: 10_000,
  });
}

/** Scope all card-related locators to the main content area, never the whole document. */
function getMain(page: Page): Locator {
  return page.locator('main');
}

/** Exercise cards are identified by their action button, scoped within main. */
function getCards(page: Page): Locator {
  return getMain(page).getByTestId('exercise-card');
}

/**
 * Waits for the practice list to settle into one of its final, user-visible states:
 * either at least one card is visible, or the empty-state message is visible.
 * This replaces waiting on the spinner's class directly.
 */
async function waitForLibrarySettled(page: Page) {
  const firstCard = getCards(page).first();
  const emptyState = page.getByText(
    /no challenges matches the selected filter/i
  );
  await expect(firstCard.or(emptyState)).toBeVisible({ timeout: 10_000 });
}

// ---------------------------------------------------------------------------
// Suite 1 — Page structure
// ---------------------------------------------------------------------------
test.describe('Practice page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPractice(page);
  });

  test('renders the Practice Library heading and description', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: /practice library/i })
    ).toBeVisible();
    await expect(
      page.getByText(/master concepts through interactive coding challenges/i)
    ).toBeVisible();
  });

  test('renders the difficulty filter dropdown', async ({ page }) => {
    const select = getMain(page).locator('select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('All Levels');
  });

  test('difficulty dropdown has all four options', async ({ page }) => {
    const select = getMain(page).locator('select');
    await expect(select.locator('option')).toHaveCount(4);
    for (const label of ['All Levels', 'Easy', 'Medium', 'Hard']) {
      await expect(
        select.locator(`option:has-text("${label}")`)
      ).toBeAttached();
    }
  });

  test('renders the search input', async ({ page }) => {
    await expect(
      getMain(page).getByPlaceholder(/search exercises/i)
    ).toBeVisible();
  });

  test('renders the "Recommended for You" section', async ({ page }) => {
    await expect(getMain(page).getByText(/recommended for you/i)).toBeVisible();
  });

  test('renders at least one exercise card after loading', async ({ page }) => {
    await waitForLibrarySettled(page);
    await expect(getCards(page).first()).toBeVisible();
  });

  test('renders the sidebar with Practice tab active', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const sidebar = page.locator('aside');
    const practiceBtn = sidebar.getByRole('button', { name: /practice/i });
    await expect(practiceBtn).toHaveClass(/bg-primary-second/);
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Difficulty filter
// ---------------------------------------------------------------------------
test.describe('Practice page — difficulty filter', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPractice(page);
    await waitForLibrarySettled(page);
  });

  test('selecting Easy filters cards to easy difficulty only', async ({
    page,
  }) => {
    await getMain(page).locator('select').selectOption('Easy');
    await waitForLibrarySettled(page);

    const cards = getCards(page);
    if ((await cards.count()) === 0) return; // no easy exercises for this account

    const badges = getMain(page)
      .locator('span')
      .filter({ hasText: /^easy$/i });
    await expect(badges.first()).toBeVisible();
  });

  test('selecting Medium shows medium difficulty badges', async ({ page }) => {
    await getMain(page).locator('select').selectOption('Medium');
    await waitForLibrarySettled(page);

    const cards = getCards(page);
    if ((await cards.count()) === 0) return;

    const badges = getMain(page)
      .locator('span')
      .filter({ hasText: /^medium$/i });
    await expect(badges.first()).toBeVisible();
  });

  test('selecting Hard shows hard difficulty badges', async ({ page }) => {
    await getMain(page).locator('select').selectOption('Hard');
    await waitForLibrarySettled(page);

    const cards = getCards(page);
    if ((await cards.count()) === 0) return;

    const badges = getMain(page)
      .locator('span')
      .filter({ hasText: /^hard$/i });
    await expect(badges.first()).toBeVisible();
  });

  test('switching back to All Levels restores full list', async ({ page }) => {
    await getMain(page).locator('select').selectOption('Easy');
    await waitForLibrarySettled(page);
    const easyCount = await getCards(page).count();

    await getMain(page).locator('select').selectOption('All Levels');
    await waitForLibrarySettled(page);
    const allCount = await getCards(page).count();

    expect(allCount).toBeGreaterThanOrEqual(easyCount);
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Search
// ---------------------------------------------------------------------------
test.describe('Practice page — search', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPractice(page);
    await waitForLibrarySettled(page);
  });

  test('typing in the search box filters the exercise list', async ({
    page,
  }) => {
    await getMain(page)
      .getByPlaceholder(/search exercises/i)
      .fill('variable');

    // Wait for the filtered result set to settle: an unrelated exercise should disappear,
    // and a matching one should remain — instead of comparing transient counts.
    await expect(
      getMain(page).getByRole('heading', { name: /install vs code for c\+\+/i })
    ).toBeHidden({ timeout: 10_000 });

    await expect(
      getCards(page).getByRole('heading', {
        level: 4,
        name: /declare student variables/i,
      })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('search with no matches shows the empty state message', async ({
    page,
  }) => {
    await getMain(page)
      .getByPlaceholder(/search exercises/i)
      .fill('xyzzy_no_match_ever_12345');

    await expect(
      page.getByText(/no challenges matches the selected filter/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test('clearing the search restores the full list', async ({ page }) => {
    const searchInput = getMain(page).getByPlaceholder(/search exercises/i);

    await searchInput.fill('xyzzy_no_match_ever_12345');
    await expect(
      page.getByText(/no challenges matches the selected filter/i)
    ).toBeVisible({ timeout: 10_000 });

    await searchInput.clear();

    // Cards should reappear.
    await expect(getCards(page).first()).toBeVisible({ timeout: 10_000 });
  });

  test('search and difficulty filter work together', async ({ page }) => {
    await getMain(page).locator('select').selectOption('Easy');
    await getMain(page)
      .getByPlaceholder(/search exercises/i)
      .fill('loop');

    // Either results are shown with easy badges, or the empty state — both are valid final states.
    const firstCard = getCards(page).first();
    const emptyState = page.getByText(
      /no challenges matches the selected filter/i
    );
    await expect(firstCard.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Exercise cards
// ---------------------------------------------------------------------------
test.describe('Practice page — exercise cards', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPractice(page);
    await waitForLibrarySettled(page);
  });

  test('each card shows a title', async ({ page }) => {
    const firstCard = getCards(page).first();
    await expect(firstCard.locator('h4')).not.toBeEmpty();
  });

  test('each card shows a difficulty badge', async ({ page }) => {
    const firstCard = getCards(page).first();
    const badge = firstCard
      .locator('span')
      .filter({ hasText: /easy|medium|hard/i });
    await expect(badge).toBeVisible();
  });

  test('completed cards show a checkmark icon and "Completed" label', async ({
    page,
  }) => {
    const completedCard = getCards(page)
      .filter({ has: page.locator('span:has-text("Completed")') })
      .first();

    if ((await completedCard.count()) === 0) return test.skip();

    await expect(completedCard.getByText(/completed/i)).toBeVisible();
    await expect(completedCard.locator('svg').first()).toBeVisible();
  });

  test('locked cards show a "Locked" button that is disabled', async ({
    page,
  }) => {
    const lockedBtn = getMain(page)
      .getByRole('button', { name: /locked/i })
      .first();

    if ((await lockedBtn.count()) === 0) return test.skip();

    await expect(lockedBtn).toBeDisabled();
  });

  test('locked cards have reduced opacity', async ({ page }) => {
    const lockedCard = getCards(page)
      .filter({ has: page.getByRole('button', { name: /locked/i }) })
      .first();

    if ((await lockedCard.count()) === 0) return test.skip();

    await expect(lockedCard).toHaveClass(/opacity-50/);
  });

  test('"Review Needed" badge appears on weak-tag exercises', async ({
    page,
  }) => {
    const weakBadge = getMain(page)
      .getByText(/review needed/i)
      .first();

    if ((await weakBadge.count()) === 0) return test.skip();

    await expect(weakBadge).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — Exercise card → dedicated page
// ---------------------------------------------------------------------------
test.describe('Practice page — navigating to dedicated page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPractice(page);
    await waitForLibrarySettled(page);
  });

  test('clicking Start on an unlocked card navigates to /practice-dedicated/:id', async ({
    page,
  }) => {
    const startLink = getMain(page)
      .getByRole('link', { name: /start/i })
      .first();
    await expect(startLink).toBeVisible();

    await startLink.click();

    await expect(page).toHaveURL(/\/practice-dedicated\//, {
      timeout: 10_000,
    });
  });

  test('browser back button returns to /practice', async ({ page }) => {
    await getMain(page).getByRole('link', { name: /start/i }).first().click();
    await expect(page).toHaveURL(/\/practice-dedicated\//, {
      timeout: 10_000,
    });

    await page.goBack();
    await expect(page).toHaveURL('/practice', { timeout: 10_000 });
  });

  test('clicking Start Practice in the hero navigates to dedicated page', async ({
    page,
  }) => {
    const heroLink = getMain(page).getByRole('link', {
      name: /start practice/i,
    });

    if ((await heroLink.count()) === 0) return test.skip();

    await heroLink.click();
    await expect(page).toHaveURL(/\/practice-dedicated\//, {
      timeout: 10_000,
    });
  });

  test('locked card click does not navigate away from /practice', async ({
    page,
  }) => {
    const lockedBtn = getMain(page)
      .getByRole('button', { name: /locked/i })
      .first();

    if ((await lockedBtn.count()) === 0) return test.skip();

    await lockedBtn.click({ force: true });

    await expect(page).toHaveURL('/practice');
  });
});

// ---------------------------------------------------------------------------
// Suite 6 — Sidebar navigation from practice page
// ---------------------------------------------------------------------------
test.describe('Practice page — sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoPractice(page);
  });

  test('clicking Dashboard in sidebar navigates to /dashboard', async ({
    page,
  }) => {
    const sidebar = page.locator('aside');
    await sidebar.getByRole('button', { name: /dashboard/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
  });

  test('sidebar progress label shows "Exercises Solved"', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText(/exercises solved/i)).toBeVisible();
  });
});

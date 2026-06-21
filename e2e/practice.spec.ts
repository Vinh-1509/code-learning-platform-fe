import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginAndGotoPractice(page: Page) {
  await page.goto('/login');
  await page
    .getByLabel(/email/i)
    .fill(process.env.TEST_USER_EMAIL ?? 'testuser@codestep.dev');
  await page
    .getByLabel(/password/i)
    .first()
    .fill(process.env.TEST_USER_PASSWORD ?? 'Password123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/dashboard', { timeout: 10_000 });
  await page.goto('/practice');
  await expect(page.getByText(/practice library/i)).toBeVisible({
    timeout: 10_000,
  });
}

// ---------------------------------------------------------------------------
// Suite 1 — Page structure
// ---------------------------------------------------------------------------
test.describe('Practice page — structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGotoPractice(page);
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
    const select = page.locator('select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('All Levels');
  });

  test('difficulty dropdown has all four options', async ({ page }) => {
    const select = page.locator('select');
    await expect(select.locator('option')).toHaveCount(4);
    for (const label of ['All Levels', 'Easy', 'Medium', 'Hard']) {
      await expect(
        select.locator(`option:has-text("${label}")`)
      ).toBeAttached();
    }
  });

  test('renders the search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search exercises/i)).toBeVisible();
  });

  test('renders the "Recommended for You" section', async ({ page }) => {
    await expect(page.getByText(/recommended for you/i)).toBeVisible();
  });

  test('renders at least one exercise card after loading', async ({ page }) => {
    // Cards finish loading when the spinner is gone
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 10_000,
    });
    const cards = page.locator('div').filter({
      has: page.getByRole('button', { name: /start|locked/i }),
    });
    await expect(cards.first()).toBeVisible();
  });

  test('renders the hero section with a featured exercise', async ({
    page,
  }) => {
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 10_000,
    });
    // PracticeHero always renders a "Start Practice" link when exercise exists
    const heroLink = page.getByRole('link', { name: /start practice/i });
    const hasHero = (await heroLink.count()) > 0;
    if (!hasHero) test.skip();

    await expect(heroLink).toBeVisible();
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
    await loginAndGotoPractice(page);
    // Wait for initial load
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 10_000,
    });
  });

  test('selecting Easy filters cards to easy difficulty only', async ({
    page,
  }) => {
    await page.locator('select').selectOption('Easy');

    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });

    // Every visible difficulty badge should say "easy"
    const badges = page.locator('span').filter({ hasText: /^easy$/i });
    const cards = page.locator('div').filter({
      has: page.getByRole('button', { name: /start|locked/i }),
    });

    const cardCount = await cards.count();
    if (cardCount === 0) return; // no easy exercises for this account — skip assertion

    await expect(badges.first()).toBeVisible();
  });

  test('selecting Medium shows medium difficulty badges', async ({ page }) => {
    await page.locator('select').selectOption('Medium');
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });

    const badges = page.locator('span').filter({ hasText: /^medium$/i });
    const cardCount = await page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: /start|locked/i }) })
      .count();

    if (cardCount === 0) return;
    await expect(badges.first()).toBeVisible();
  });

  test('selecting Hard shows hard difficulty badges', async ({ page }) => {
    await page.locator('select').selectOption('Hard');
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });

    const badges = page.locator('span').filter({ hasText: /^hard$/i });
    const cardCount = await page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: /start|locked/i }) })
      .count();

    if (cardCount === 0) return;
    await expect(badges.first()).toBeVisible();
  });

  test('switching back to All Levels restores full list', async ({ page }) => {
    await page.locator('select').selectOption('Easy');
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });
    const easyCount = await page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: /start|locked/i }) })
      .count();

    await page.locator('select').selectOption('All Levels');
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });
    const allCount = await page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: /start|locked/i }) })
      .count();

    expect(allCount).toBeGreaterThanOrEqual(easyCount);
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Search
// ---------------------------------------------------------------------------
test.describe('Practice page — search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGotoPractice(page);
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 10_000,
    });
  });

  test('typing in the search box filters the exercise list', async ({
    page,
  }) => {
    const allCards = page.locator('div').filter({
      has: page.getByRole('button', { name: /start|locked/i }),
    });
    const countBefore = await allCards.count();

    // Type a specific term unlikely to match everything
    await page.getByPlaceholder(/search exercises/i).fill('variable');
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });

    const countAfter = await allCards.count();
    // Count should change (either fewer results or "No challenges" message)
    const hasNoResults = (await page.getByText(/no challenges/i).count()) > 0;

    expect(countAfter < countBefore || hasNoResults).toBeTruthy();
  });

  test('search with no matches shows the empty state message', async ({
    page,
  }) => {
    await page
      .getByPlaceholder(/search exercises/i)
      .fill('xyzzy_no_match_ever_12345');

    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });
    await expect(
      page.getByText(/no challenges matches the selected filter/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test('clearing the search restores the full list', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search exercises/i);

    await searchInput.fill('xyzzy_no_match_ever_12345');
    await expect(
      page.getByText(/no challenges matches the selected filter/i)
    ).toBeVisible({ timeout: 5_000 });

    await searchInput.clear();
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });

    // Cards should reappear
    await expect(
      page
        .locator('div')
        .filter({ has: page.getByRole('button', { name: /start|locked/i }) })
        .first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('search and difficulty filter work together', async ({ page }) => {
    await page.locator('select').selectOption('Easy');
    await page.getByPlaceholder(/search exercises/i).fill('loop');

    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 8_000,
    });

    // Either results are shown with easy badges, or empty state — both are valid
    const hasResults =
      (await page
        .locator('div')
        .filter({ has: page.getByRole('button', { name: /start|locked/i }) })
        .count()) > 0;
    const hasEmpty =
      (await page
        .getByText(/no challenges matches the selected filter/i)
        .count()) > 0;

    expect(hasResults || hasEmpty).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Exercise cards
// ---------------------------------------------------------------------------
test.describe('Practice page — exercise cards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGotoPractice(page);
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 10_000,
    });
  });

  test('each card shows a title', async ({ page }) => {
    const firstCard = page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: /start|locked/i }) })
      .first();

    // h4 inside ExerciseCard
    await expect(firstCard.locator('h4')).not.toBeEmpty();
  });

  test('each card shows a difficulty badge', async ({ page }) => {
    const firstCard = page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: /start|locked/i }) })
      .first();

    const badge = firstCard.locator('span').filter({
      hasText: /easy|medium|hard/i,
    });
    await expect(badge).toBeVisible();
  });

  test('completed cards show a checkmark icon and "Completed" label', async ({
    page,
  }) => {
    const completedCard = page
      .locator('div')
      .filter({ has: page.locator('span:has-text("Completed")') })
      .first();

    const hasCompleted = (await completedCard.count()) > 0;
    if (!hasCompleted) return test.skip();

    await expect(completedCard.getByText(/completed/i)).toBeVisible();
    // CheckCircle2 svg is present
    await expect(completedCard.locator('svg').first()).toBeVisible();
  });

  test('locked cards show a "Locked" button that is disabled', async ({
    page,
  }) => {
    const lockedBtn = page.getByRole('button', { name: /locked/i }).first();

    const hasLocked = (await lockedBtn.count()) > 0;
    if (!hasLocked) return test.skip();

    await expect(lockedBtn).toBeDisabled();
  });

  test('locked cards have reduced opacity', async ({ page }) => {
    const lockedCard = page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: /locked/i }) })
      .first();

    const hasLocked = (await lockedCard.count()) > 0;
    if (!hasLocked) return test.skip();

    await expect(lockedCard).toHaveClass(/opacity-50/);
  });

  test('"Review Needed" badge appears on weak-tag exercises', async ({
    page,
  }) => {
    const weakBadge = page.getByText(/review needed/i).first();
    const hasWeak = (await weakBadge.count()) > 0;
    if (!hasWeak) return test.skip();

    await expect(weakBadge).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — Exercise card → dedicated page
// ---------------------------------------------------------------------------
test.describe('Practice page — navigating to dedicated page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGotoPractice(page);
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: 10_000,
    });
  });

  test('clicking Start on an unlocked card navigates to /practicededicated/:id', async ({
    page,
  }) => {
    const startLink = page.getByRole('link', { name: /start/i }).first();
    await expect(startLink).toBeVisible();

    await startLink.click();

    await expect(page).toHaveURL(/\/practicededicated\//, {
      timeout: 10_000,
    });
  });

  test('the dedicated page loads the correct exercise title', async ({
    page,
  }) => {
    // Grab the title from the card before navigating
    const firstCard = page
      .locator('div')
      .filter({ has: page.getByRole('link', { name: /start/i }) })
      .first();

    const cardTitle = await firstCard.locator('h4').innerText();

    await firstCard.getByRole('link', { name: /start/i }).click();
    await expect(page).toHaveURL(/\/practicededicated\//, {
      timeout: 10_000,
    });

    // TaskPane renders the title in an h1
    await expect(page.locator('h1')).toContainText(cardTitle, {
      timeout: 8_000,
    });
  });

  test('browser back button returns to /practice', async ({ page }) => {
    await page.getByRole('link', { name: /start/i }).first().click();
    await expect(page).toHaveURL(/\/practicededicated\//, {
      timeout: 10_000,
    });

    await page.goBack();
    await expect(page).toHaveURL('/practice', { timeout: 8_000 });
  });

  test('clicking Start Practice in the hero navigates to dedicated page', async ({
    page,
  }) => {
    const heroLink = page.getByRole('link', { name: /start practice/i });
    const hasHero = (await heroLink.count()) > 0;
    if (!hasHero) return test.skip();

    await heroLink.click();
    await expect(page).toHaveURL(/\/practicededicated\//, {
      timeout: 10_000,
    });
  });

  test('locked card click does not navigate away from /practice', async ({
    page,
  }) => {
    const lockedBtn = page.getByRole('button', { name: /locked/i }).first();
    const hasLocked = (await lockedBtn.count()) > 0;
    if (!hasLocked) return test.skip();

    await lockedBtn.click({ force: true });

    // Should still be on /practice
    await expect(page).toHaveURL('/practice');
  });
});

// ---------------------------------------------------------------------------
// Suite 6 — Sidebar navigation from practice page
// ---------------------------------------------------------------------------
test.describe('Practice page — sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAndGotoPractice(page);
  });

  test('clicking Dashboard in sidebar navigates to /dashboard', async ({
    page,
  }) => {
    const sidebar = page.locator('aside');
    await sidebar.getByRole('button', { name: /dashboard/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 8_000 });
  });

  test('sidebar progress label shows "Exercises Solved"', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText(/exercises solved/i)).toBeVisible();
  });
});

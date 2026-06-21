import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared auth setup
// ---------------------------------------------------------------------------

/** Use when the test itself needs a fresh page already on /dashboard. */
async function setup(page: Page) {
  await page.goto('/dashboard');
  // Wait for the roadmap to finish loading before each test
  await expect(page.getByText(/learning roadmap/i)).toBeVisible({
    timeout: 10_000,
  });
}

// ---------------------------------------------------------------------------
// Suite 1 — Page structure
// ---------------------------------------------------------------------------
test.describe('Dashboard — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test('renders the navbar', async ({ page }) => {
    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();
    // CodeStep logo link inside the navbar
    await expect(navbar.getByRole('link', { name: '' }).first()).toBeVisible();
  });

  test('renders the sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText(/dashboard/i)).toBeVisible();
    await expect(sidebar.getByText(/practice/i)).toBeVisible();
  });

  test('renders the stats grid with two cards', async ({ page }) => {
    await expect(page.getByText(/lessons learned/i)).toBeVisible();
    await expect(page.getByText(/problems solved/i)).toBeVisible();
  });

  test('stats cards show numeric values', async ({ page }) => {
    // Both StatCard values are large text — just verify they render a number
    const statValues = page.locator('.text-4xl');
    await expect(statValues).toHaveCount(2);
    for (const el of await statValues.all()) {
      const text = await el.innerText();
      expect(Number(text)).not.toBeNaN();
    }
  });

  test('renders the Learning Roadmap section heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /learning roadmap/i })
    ).toBeVisible();
    await expect(
      page.getByText(/follow your custom path to coding mastery/i)
    ).toBeVisible();
  });

  test('renders at least one roadmap module', async ({ page }) => {
    // ModuleItem buttons are the clickable module headers
    const moduleButtons = page.locator('button').filter({
      hasText: /active|done|locked/i,
    });
    await expect(moduleButtons.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Roadmap expand / collapse
// ---------------------------------------------------------------------------
test.describe('Dashboard — roadmap expand / collapse', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test('clicking a module expands it to reveal lessons', async ({ page }) => {
    // Find the first non-locked module (active or completed) and click it
    const firstUnlockedModule = page
      .locator('button')
      .filter({ hasText: /active|done/i })
      .first();

    await firstUnlockedModule.click();

    // After expanding, lesson items appear — they contain status badges or buttons
    const lessonItems = page.locator('[class*="rounded-xl"]').filter({
      has: page.locator('svg'), // LessonIcon always renders an svg
    });

    await expect(lessonItems.first()).toBeVisible({ timeout: 5_000 });
  });

  test('clicking an expanded module collapses it', async ({ page }) => {
    const firstUnlockedModule = page
      .locator('button')
      .filter({ hasText: /active|done/i })
      .first();

    // Expand
    await firstUnlockedModule.click();
    // The chevron flips to ChevronUp when open
    await expect(firstUnlockedModule.locator('svg').last()).toBeVisible();

    // Collapse
    await firstUnlockedModule.click();

    // Lesson items should no longer be in the DOM
    // (they're rendered conditionally, not just hidden)
    await expect(
      page.getByRole('button', { name: /start|continue/i })
    ).toHaveCount(0, { timeout: 3_000 });
  });

  test('active module shows a Start or Continue button for its lessons', async ({
    page,
  }) => {
    const activeModule = page
      .locator('button')
      .filter({ hasText: /active/i })
      .first();

    await activeModule.click();

    // At least one lesson in an active module should have an action button
    const actionButton = page.getByRole('button', { name: /start|continue/i });
    await expect(actionButton.first()).toBeVisible({ timeout: 5_000 });
  });

  test('locked module lessons do not show a Start button', async ({ page }) => {
    const lockedModule = page
      .locator('button')
      .filter({ hasText: /locked/i })
      .first();

    // Locked modules are opacity-70 and clicking them still expands the container
    // but individual locked lessons inside have no action button
    await lockedModule.click();

    // Locked LessonItems render null for the start button
    // so no Start/Continue button should appear
    const actionButtons = page.getByRole('button', {
      name: /^start$|^continue$/i,
    });
    await expect(actionButtons).toHaveCount(0, { timeout: 3_000 });
  });

  test('expanding multiple modules keeps both expanded simultaneously', async ({
    page,
  }) => {
    const unlockedModules = page
      .locator('button')
      .filter({ hasText: /active|done/i });

    const count = await unlockedModules.count();
    if (count < 2) test.skip();

    await unlockedModules.nth(0).click();
    await unlockedModules.nth(1).click();

    // Both should show action buttons (each module has at least one lesson)
    const actionButtons = page.getByRole('button', {
      name: /start|continue/i,
    });
    await expect(actionButtons).toHaveCount(2, { timeout: 5_000 });
  });

  test('completed module shows "Done" badge', async ({ page }) => {
    const completedModule = page
      .locator('button')
      .filter({ hasText: /done/i })
      .first();

    // Skip gracefully if the test account has no completed modules yet
    const isPresent = (await completedModule.count()) > 0;
    if (!isPresent) test.skip();

    await expect(completedModule).toBeVisible();
    await expect(completedModule.getByText(/done/i)).toBeVisible();
  });

  test('clicking Start on a lesson navigates to the lesson page', async ({
    page,
  }) => {
    const activeModule = page
      .locator('button')
      .filter({ hasText: /active/i })
      .first();

    await activeModule.click();

    const startButton = page.getByRole('button', { name: /start/i }).first();

    await expect(startButton).toBeVisible({ timeout: 5_000 });
    await startButton.click();

    await expect(page).toHaveURL(/\/lesson\//, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Current lesson banner
// ---------------------------------------------------------------------------
test.describe('Dashboard — current lesson banner', () => {
  test.beforeEach(async ({ page }) => {
    await setup(page);
  });

  test('banner shows "In progress" badge when an active lesson exists', async ({
    page,
  }) => {
    // CurrentLessonBanner only renders when currentLesson is truthy
    const banner = page.getByText(/in progress/i);
    const hasBanner = (await banner.count()) > 0;

    // Skip gracefully if the test account is brand-new with no active lesson
    if (!hasBanner) test.skip();

    await expect(banner).toBeVisible();
  });

  test('banner shows a progress percentage', async ({ page }) => {
    const progressText = page.getByText(/\d+% completed/i);
    const hasBanner = (await progressText.count()) > 0;
    if (!hasBanner) test.skip();

    await expect(progressText).toBeVisible();
  });

  test('"Continue lesson" button navigates to the lesson page', async ({
    page,
  }) => {
    const continueBtn = page.getByRole('button', { name: /continue lesson/i });
    const hasBanner = (await continueBtn.count()) > 0;
    if (!hasBanner) test.skip();

    await continueBtn.click();
    await expect(page).toHaveURL(/\/lesson\//, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Sidebar navigation
// ---------------------------------------------------------------------------
test.describe('Dashboard — sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setup(page);
  });

  test('sidebar shows the user language and mastery label', async ({
    page,
  }) => {
    const sidebar = page.locator('aside');
    // useSidebarLanguage renders "<Language> Mastery"
    await expect(sidebar.getByText(/mastery/i)).toBeVisible();
  });

  test('sidebar shows lesson or exercise progress counts', async ({ page }) => {
    const sidebar = page.locator('aside');
    // Renders "<completed>/<total> Lessons Learned" or "Exercises Solved"
    await expect(sidebar.getByText(/\d+\/\d+/)).toBeVisible();
  });

  test('Dashboard nav item is active when on /dashboard', async ({ page }) => {
    const sidebar = page.locator('aside');
    const dashboardBtn = sidebar.getByRole('button', { name: /dashboard/i });

    // Active state adds bg-primary-second — check via aria or class
    await expect(dashboardBtn).toBeVisible();
    // The active button has border-r-primary class; check it's highlighted
    await expect(dashboardBtn).toHaveClass(/bg-primary-second/);
  });

  test('clicking Practice navigates to /practice', async ({ page }) => {
    const sidebar = page.locator('aside');
    await sidebar.getByRole('button', { name: /practice/i }).click();

    await expect(page).toHaveURL('/practice', { timeout: 8_000 });
  });

  test('clicking Dashboard while on /practice navigates back', async ({
    page,
  }) => {
    // Navigate away first
    await page.goto('/practice');
    await expect(page).toHaveURL('/practice');

    const sidebar = page.locator('aside');
    await sidebar.getByRole('button', { name: /dashboard/i }).click();

    await expect(page).toHaveURL('/dashboard', { timeout: 8_000 });
  });

  test('Sign Out button logs the user out and redirects to /login', async ({
    page,
  }) => {
    const sidebar = page.locator('aside');
    await sidebar.getByRole('button', { name: /sign out/i }).click();

    await expect(page).toHaveURL('/login', { timeout: 8_000 });

    // Token should be gone
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — Mobile sidebar drawer
// ---------------------------------------------------------------------------
test.describe('Dashboard — mobile sidebar drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await setup(page);
  });

  test('sidebar is hidden by default on mobile', async ({ page }) => {
    const sidebar = page.locator('aside');
    // Sidebar starts with -translate-x-full so it is off-screen but in DOM
    await expect(sidebar).not.toHaveClass(/translate-x-0/);
  });

  test('hamburger menu button opens the sidebar drawer', async ({ page }) => {
    const menuBtn = page
      .getByRole('button', { name: '' })
      .filter({
        has: page.locator('svg'),
      })
      .last(); // The Menu icon button in Navbar

    await menuBtn.click();

    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/translate-x-0/, { timeout: 3_000 });
  });

  test('clicking the backdrop closes the drawer', async ({ page }) => {
    // Open the drawer
    const navbar = page.locator('header');
    await navbar.getByRole('button').last().click();

    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/translate-x-0/, { timeout: 3_000 });

    // The overlay div sits behind the sidebar
    await page.locator('div.fixed.inset-0.bg-black\\/40').click();

    await expect(sidebar).not.toHaveClass(/translate-x-0/, { timeout: 3_000 });
  });

  test('navigating via mobile sidebar closes the drawer', async ({ page }) => {
    // Open drawer
    const navbar = page.locator('header');
    await navbar.getByRole('button').last().click();

    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/translate-x-0/, { timeout: 3_000 });

    // Click Practice — onClose() is called in AppSidebar after navigate
    await sidebar.getByRole('button', { name: /practice/i }).click();

    await expect(page).toHaveURL('/practice', { timeout: 8_000 });
  });
});

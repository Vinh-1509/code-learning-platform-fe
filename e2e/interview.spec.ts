import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Config & Mocks
// ---------------------------------------------------------------------------
const DEFAULT_QUESTION = 'Explain this concept in your own words.';
const DEFAULT_REPLY = 'Good explanation! You got it.';

interface FeynmanMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Inject an authentication token to simulate a logged-in session */
async function injectAuthToken(page: Page, token = 'fake-valid-jwt') {
  await page.addInitScript((t) => {
    localStorage.setItem('token', t);
  }, token);
}

/** Set up network route interceptors once we know the current block ID */
async function setupFeynmanRouteMocks(
  page: Page,
  blockId: string,
  options: { passed: boolean; history?: FeynmanMessage[] }
) {
  await page.route(`**/api/feynman/block/${blockId}/history`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        blockId,
        chatHistory: options.history || [],
      },
    });
  });

  await page.route(`**/api/feynman/block/${blockId}/stats`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { blockId, isFeynmanPassed: options.passed },
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// Suite — Feynman Panel E2E (Dynamic Flow)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Feynman Interview Pane', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Inject auth token so we bypass redirect guards safely
    await injectAuthToken(page);

    // 2. Head to a static route first
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // 3. Click the first lesson action available to navigate into the module
    // Note: Adjust the locator if your dashboard layout uses a specific button or card structure
    const lessonAction = page
      .getByRole('button', { name: /continue|start/i })
      .first();
    await lessonAction.click();

    // 4. Wait for the browser to hit the lesson view route and grab the ID directly from the URL path
    await page.waitForURL(/\/lesson\/[a-f0-9]+/);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. PANE LOADS
  // ───────────────────────────────────────────────────────────────────────────
  test('renders the AI intro message and first question for a fresh session', async ({
    page,
  }) => {
    const currentUrl = page.url();
    const blockId = currentUrl.split('/').pop() || '';

    // Mock an empty history state dynamically
    await setupFeynmanRouteMocks(page, blockId, { passed: false, history: [] });

    // Reload or advance into the panel container view context
    await page.reload();
    await expect(page.getByText(/loading session/i)).not.toBeVisible();

    // Assert presentation strings render successfully
    await expect(page.getByText(/completed all the exercises/i)).toBeVisible();
    await expect(page.getByText(DEFAULT_QUESTION)).toBeVisible();
    await expect(page.getByText('✓ All exercises complete!')).toBeVisible();
  });

  test('restores prior chat messages when history already exists', async ({
    page,
  }) => {
    const currentUrl = page.url();
    const blockId = currentUrl.split('/').pop() || '';

    // Populate the mock history array
    await setupFeynmanRouteMocks(page, blockId, {
      passed: false,
      history: [
        { role: 'assistant', content: 'What is a pointer?' },
        { role: 'user', content: 'A variable that stores an address.' },
      ],
    });

    await page.reload();
    await expect(page.getByText(/loading session/i)).not.toBeVisible();

    // Verify history layers render accurately
    await expect(page.getByText('What is a pointer?')).toBeVisible();
    await expect(
      page.getByText('A variable that stores an address.')
    ).toBeVisible();
  });

  test('shows the completion banner immediately when the session was already passed', async ({
    page,
  }) => {
    const currentUrl = page.url();
    const blockId = currentUrl.split('/').pop() || '';

    await setupFeynmanRouteMocks(page, blockId, {
      passed: true,
      history: [{ role: 'assistant', content: 'Well done, you passed!' }],
    });

    await page.reload();
    await expect(page.getByText(/loading session/i)).not.toBeVisible();

    // Verify locked success elements appear immediately
    await expect(page.getByText('🎉 Block Complete!')).toBeVisible();
    await expect(page.getByText('✓ Passed')).toBeVisible();
    await expect(
      page.getByPlaceholder(/type your explanation/i)
    ).not.toBeVisible();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. USER RESPONDS & 3. BLOCK COMPLETES
  // ───────────────────────────────────────────────────────────────────────────
  test('handles an interactive message round-trip and locks on pass completion', async ({
    page,
  }) => {
    const currentUrl = page.url();
    const blockId = currentUrl.split('/').pop() || '';

    await setupFeynmanRouteMocks(page, blockId, { passed: false, history: [] });

    // Establish intermediate dynamic interception tracking variable
    let networkCycles = 0;

    // Handle interactive responses across multiple message exchanges
    await page.route(`**/api/feynman/block/${blockId}/chat`, async (route) => {
      networkCycles += 1;

      if (networkCycles === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: { blockId, reply: 'Tell me more.', isPassed: false },
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: { blockId, reply: DEFAULT_REPLY, isPassed: true },
        });
      }
    });

    await page.reload();
    await expect(page.getByText(/loading session/i)).not.toBeVisible();

    const input = page.getByPlaceholder(/type your explanation/i);
    const sendBtn = page.getByRole('button', { name: /send/i });

    // --- Exchange 1 (Partial Answer) ---
    await expect(sendBtn).toBeDisabled();
    await input.fill('Partial explanation.');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // Verify loading/thinking state toggles
    await expect(page.getByText(/AI is thinking/i)).toBeVisible();
    await expect(input).toBeDisabled();

    // Wait for the first conversational turn to resolve
    await expect(page.getByText('Tell me more.')).toBeVisible();
    await expect(input).toBeEmpty();
    await expect(input).toBeEnabled();

    // --- Exchange 2 (Passing Answer via Keyboard Enter Event) ---
    await input.fill('Comprehensive final explanation.');
    await page.keyboard.press('Enter');

    // Verify terminal completion blocks engage
    await expect(page.getByText('🎉 Block Complete!')).toBeVisible();
    await expect(page.getByText('✓ Passed')).toBeVisible();
    await expect(page.getByText(DEFAULT_REPLY)).toBeVisible();

    // Confirm navigation nodes change contextually
    await expect(input).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: /next block/i })
    ).toBeVisible();
  });
});

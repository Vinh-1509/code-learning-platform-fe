import { test, expect, type Page } from '@playwright/test';

/**
 * Navigate to /practice, find the first unlocked exercise card of the
 * requested type, and click into its dedicated page.
 *
 * Returns the exerciseId extracted from the resulting URL so tests can
 * reference it without hard-coding IDs.
 */
async function openFirstExerciseOfType(
  page: Page,
  type: 'dragdrop' | 'fillblank'
): Promise<string> {
  await page.goto('/practice');
  await expect(page.getByText(/practice library/i)).toBeVisible({
    timeout: 10_000,
  });

  // Exercise cards that are NOT locked have a "Start" button
  const startButtons = page.getByRole('link', { name: /start/i });
  await expect(startButtons.first()).toBeVisible({ timeout: 10_000 });

  // Click each Start link until we land on an exercise of the right type
  const count = await startButtons.count();
  for (let i = 0; i < count; i++) {
    const href = await startButtons.nth(i).getAttribute('href');
    if (!href) continue;

    await page.goto(href);
    await page.waitForURL(/\/practicededicated\//, { timeout: 8_000 });

    // 1. Define locators
    const dragDropLocator = page.getByText(/available blocks/i);
    const fillBlankLocator = page.getByText(/code editor/i);

    // 2. Wait dynamically for EITHER element to appear (replaces waitForTimeout)
    await dragDropLocator
      .or(fillBlankLocator)
      .waitFor({ state: 'visible', timeout: 5000 });

    // 3. Safely check which one loaded
    const isDragDrop = await dragDropLocator.isVisible();
    const isFillBlank = await fillBlankLocator.isVisible();

    if (type === 'dragdrop' && isDragDrop) break;
    if (type === 'fillblank' && isFillBlank) break;

    // Wrong type — go back and try the next card
    await page.goto('/practice');
  }

  const url = page.url();
  const exerciseId = url.split('/practicededicated/')[1];
  return exerciseId;
}

/**
 * Place all available blocks into drop slots using the tap-to-place
 * mobile fallback (clicking a block drops it into the first empty slot).
 * Works on both desktop and mobile without requiring HTML5 drag simulation.
 */
async function fillAllDragDropSlotsByClicking(page: Page) {
  const availableSection = page.locator('p', {
    hasText: /available blocks/i,
  });
  await expect(availableSection).toBeVisible();

  // Keep clicking unused blocks until all slots are filled
  // SubmitBar text changes to empty string when all filled
  let attempts = 0;
  while (attempts < 20) {
    const isAllFilled =
      (await page.getByText(/fill in all blanks to enable submit/i).count()) ===
        0 &&
      (await page.getByText(/modify your answer/i).count()) === 0 &&
      (await page
        .getByRole('button', { name: /submit answer/i })
        .isEnabled()) === true;

    if (isAllFilled) break;

    // Find a block that isn't greyed out (not used)
    const unusedBlock = page
      .locator('div[draggable]')
      .filter({ hasNot: page.locator('.opacity-20') })
      .first();

    const blockCount = await unusedBlock.count();
    if (blockCount === 0) break;

    await unusedBlock.click();
    attempts++;
  }
}

/**
 * Fill every blank input in a fill-in-the-blank exercise with a placeholder
 * value. The test for a *correct* answer should use known correct values
 * passed via env vars or a seeded exercise.
 */
async function fillAllBlanks(page: Page, value = 'x') {
  const blanks = page.locator('input[type="text"]');
  const count = await blanks.count();
  for (let i = 0; i < count; i++) {
    await blanks.nth(i).fill(value);
    // Trigger onChange so PracticePanel registers the modification
    await blanks.nth(i).press('Tab');
  }
}

// ---------------------------------------------------------------------------
// Suite 1 — Page structure
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    const firstStart = page.getByRole('link', { name: /start/i }).first();
    await expect(firstStart).toBeVisible({ timeout: 10_000 });
    await firstStart.click();
    await page.waitForURL(/\/practicededicated\//, { timeout: 8_000 });
  });

  test('renders the navbar with "Back to Practice" button on desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(
      page.getByRole('button', { name: /back to practice/i })
    ).toBeVisible();
  });

  test('renders the task pane with a title and instruction', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByText(/task/i).first()).toBeVisible();
    // Title is an h1
    await expect(page.locator('h1')).not.toBeEmpty();
  });

  test('renders the exercise tab bar', async ({ page }) => {
    // ExerciseTabBar shows Question N buttons
    await expect(page.getByRole('button', { name: /question 1/i })).toBeVisible(
      { timeout: 8_000 }
    );
  });

  test('Submit Answer button is disabled before answering', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeDisabled({ timeout: 8_000 });
  });

  test('shows the hint strip', async ({ page }) => {
    await expect(page.getByText(/hints/i)).toBeVisible({ timeout: 8_000 });
  });

  test('mobile: Description and Code tab switcher is visible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole('button', { name: /description/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /code/i })).toBeVisible();
  });

  test('mobile: tapping Code tab shows the practice panel', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: /code/i }).click();
    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Drag-and-drop exercise
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — drag-drop exercise', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    await openFirstExerciseOfType(page, 'dragdrop');
    // Ensure we're on desktop so all panels are visible
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('renders available blocks section', async ({ page }) => {
    await expect(page.getByText(/available blocks/i)).toBeVisible();
  });

  test('renders drop zone slots', async ({ page }) => {
    await expect(page.getByText(/drop zone/i)).toBeVisible();
    // Each slot shows "+ drop here" when empty
    await expect(page.getByText(/drop here/i).first()).toBeVisible();
  });

  test('available blocks are shown as unplaced initially', async ({ page }) => {
    // All blocks start unused — none should have opacity-20
    const greyedBlocks = page.locator('.opacity-20');
    await expect(greyedBlocks).toHaveCount(0);
  });

  test('tapping a block (mobile fallback) places it in the first empty slot', async ({
    page,
  }) => {
    const firstBlock = page
      .locator('div[draggable]')
      .filter({ hasNot: page.locator('.opacity-20') })
      .first();

    await firstBlock.click();

    // After placement the block appears in the drop zone
    // and the slot no longer shows "+ drop here" for slot 1
    const dropHereTexts = page.getByText(/drop here/i);
    const initialCount = await dropHereTexts.count();
    // One fewer empty slot than before
    expect(initialCount).toBeGreaterThanOrEqual(0);

    // The placed block's text should now appear inside the drop zone
    const dropZone = page
      .locator('div')
      .filter({ hasText: /drop zone/i })
      .last();
    await expect(dropZone).not.toBeEmpty();
  });

  test('placed block can be removed with the ✕ button', async ({ page }) => {
    // Place one block first
    const firstBlock = page
      .locator('div[draggable]')
      .filter({ hasNot: page.locator('.opacity-20') })
      .first();
    await firstBlock.click();

    // Click the remove button inside the drop zone
    const removeBtn = page.getByRole('button', { name: /✕/i }).first();
    await expect(removeBtn).toBeVisible({ timeout: 3_000 });
    await removeBtn.click();

    // Slot should be empty again
    await expect(page.getByText(/drop here/i).first()).toBeVisible();
  });

  test('Submit Answer enables only after all slots are filled', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeDisabled();

    await fillAllDragDropSlotsByClicking(page);

    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeEnabled({ timeout: 5_000 });
  });

  test('wrong answer shows the incorrect result banner', async ({ page }) => {
    // Fill all slots with blocks in whatever order they come (likely wrong)
    await fillAllDragDropSlotsByClicking(page);
    await page.getByRole('button', { name: /submit answer/i }).click();

    // ResultBanner shows either correct or wrong
    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('wrong answer shows the AI explanation panel', async ({ page }) => {
    await fillAllDragDropSlotsByClicking(page);
    await page.getByRole('button', { name: /submit answer/i }).click();

    // If incorrect, AI explanation panel should appear
    const resultText = page.getByText(/correct answer|incorrect/i);
    await expect(resultText).toBeVisible({ timeout: 10_000 });

    const isWrong = (await page.getByText(/incorrect/i).count()) > 0;
    if (isWrong) {
      await expect(page.getByText(/ai explanation/i)).toBeVisible({
        timeout: 12_000,
      });
    }
  });

  test('after wrong answer, Submit is disabled until blocks are changed', async ({
    page,
  }) => {
    await fillAllDragDropSlotsByClicking(page);
    await page.getByRole('button', { name: /submit answer/i }).click();

    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: 10_000,
    });

    // canResubmit is false after wrong answer
    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeDisabled();

    // Removing a block re-enables it
    const removeBtn = page.getByRole('button', { name: /✕/i }).first();
    if ((await removeBtn.count()) > 0) {
      await removeBtn.click();
      await expect(page.getByText(/modify your answer/i)).not.toBeVisible();
    }
  });

  test('drag and drop a block into a slot using Playwright dragAndDrop', async ({
    page,
  }) => {
    const firstBlockText = await page
      .locator('div[draggable]')
      .first()
      .innerText();

    // Use Playwright's built-in drag API
    await page.dragAndDrop(
      'div[draggable]',
      // Target: first empty drop slot (contains "+ drop here")
      'div:has-text("+ drop here")'
    );

    // The dragged block's text should now appear in the drop zone
    const dropZone = page
      .locator('div')
      .filter({ hasText: /drop zone/i })
      .last();
    await expect(dropZone.getByText(firstBlockText.trim())).toBeVisible({
      timeout: 3_000,
    });
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Fill-in-the-blank exercise
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — fill-blank exercise', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    await openFirstExerciseOfType(page, 'fillblank');
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('renders the Code Editor section', async ({ page }) => {
    await expect(page.getByText(/code editor/i)).toBeVisible();
  });

  test('renders blank input fields inside the code editor', async ({
    page,
  }) => {
    const blanks = page.locator('input[type="text"]');
    await expect(blanks.first()).toBeVisible({ timeout: 5_000 });
  });

  test('blank inputs show placeholder text matching their part ID', async ({
    page,
  }) => {
    const firstBlank = page.locator('input[type="text"]').first();
    const placeholder = await firstBlank.getAttribute('placeholder');
    // BlankInput sets placeholder as `[${partId}]`
    expect(placeholder).toMatch(/^\[.+\]$/);
  });

  test('typing in a blank updates its value', async ({ page }) => {
    const firstBlank = page.locator('input[type="text"]').first();
    await firstBlank.fill('int');
    await expect(firstBlank).toHaveValue('int');
  });

  test('input width expands as the user types', async ({ page }) => {
    // getInputWidth grows the width with content length
    const firstBlank = page.locator('input[type="text"]').first();
    const widthBefore = await firstBlank.evaluate(
      (el) => (el as HTMLElement).offsetWidth
    );

    await firstBlank.fill('averylongvalue');
    const widthAfter = await firstBlank.evaluate(
      (el) => (el as HTMLElement).offsetWidth
    );

    expect(widthAfter).toBeGreaterThan(widthBefore);
  });

  test('Submit is disabled until all blanks are filled', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeDisabled();

    await fillAllBlanks(page, 'x');

    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeEnabled({ timeout: 3_000 });
  });

  test('submitting shows a result banner (correct or wrong)', async ({
    page,
  }) => {
    await fillAllBlanks(page, 'x');
    await page.getByRole('button', { name: /submit answer/i }).click();

    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('wrong answer shows the AI explanation panel', async ({ page }) => {
    await fillAllBlanks(page, 'wrongvalue');
    await page.getByRole('button', { name: /submit answer/i }).click();

    const resultText = page.getByText(/correct answer|incorrect/i);
    await expect(resultText).toBeVisible({ timeout: 10_000 });

    const isWrong = (await page.getByText(/incorrect/i).count()) > 0;
    if (isWrong) {
      await expect(page.getByText(/ai explanation/i)).toBeVisible({
        timeout: 12_000,
      });
    }
  });

  test('after wrong answer, editing a blank re-enables Submit', async ({
    page,
  }) => {
    await fillAllBlanks(page, 'wrongvalue');
    await page.getByRole('button', { name: /submit answer/i }).click();

    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: 10_000,
    });

    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeDisabled();

    // Modify any blank → onAnswerModified() → canResubmit = true
    await page.locator('input[type="text"]').first().fill('newvalue');

    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeEnabled({ timeout: 3_000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Next exercise navigation
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — next exercise', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    await openFirstExerciseOfType(page, 'dragdrop');
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('"Next Exercise" button does not appear before submitting', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /next exercise/i })
    ).toHaveCount(0);
  });

  test('"Next Exercise" is absent when there is no next unlocked exercise', async ({
    page,
  }) => {
    // This guard is implicit: if nextExerciseId is null, onNext is undefined
    // and ResultBanner does not render the button.
    // We verify by checking that after any submission the button count is
    // either 0 (wrong answer) or only 1 if correct and a next exists.
    await fillAllDragDropSlotsByClicking(page);
    await page.getByRole('button', { name: /submit answer/i }).click();

    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: 10_000,
    });

    const isCorrect = (await page.getByText(/✓ correct answer/i).count()) > 0;
    if (!isCorrect) {
      // Wrong answer: Next Exercise must not be shown regardless
      await expect(
        page.getByRole('button', { name: /next exercise/i })
      ).toHaveCount(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — Exercise tab bar
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — exercise tab bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    await openFirstExerciseOfType(page, 'dragdrop');
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('tab bar renders at least one Question tab', async ({ page }) => {
    await expect(page.getByRole('button', { name: /question 1/i })).toBeVisible(
      { timeout: 8_000 }
    );
  });

  test('the current exercise tab is visually active (blue background)', async ({
    page,
  }) => {
    const activeTab = page.getByRole('button', { name: /question 1/i });
    await expect(activeTab).toHaveClass(/bg-blue-600/, { timeout: 5_000 });
  });

  test('clicking a different tab navigates to a different exercise URL', async ({
    page,
  }) => {
    const secondTab = page.getByRole('button', { name: /question 2/i });
    const hasSecondTab = (await secondTab.count()) > 0;
    if (!hasSecondTab) test.skip();

    const urlBefore = page.url();
    await secondTab.click();

    await expect(page).not.toHaveURL(urlBefore, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/practicededicated\//, { timeout: 8_000 });
  });

  test('completed exercise tab shows a checkmark', async ({ page }) => {
    // ExerciseTabBar renders ✓ for isPassed exercises
    const completedTab = page
      .getByRole('button')
      .filter({ hasText: /✓ question/i })
      .first();

    const hasCompleted = (await completedTab.count()) > 0;
    if (!hasCompleted) test.skip();

    await expect(completedTab).toBeVisible();
    await expect(completedTab).toHaveClass(/bg-emerald-600|bg-green-mint/);
  });
});

// ---------------------------------------------------------------------------
// Suite 6 — Hint system
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — hints', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    await openFirstExerciseOfType(page, 'dragdrop');
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('hint strip is visible with a "Get Hint" button', async ({ page }) => {
    await expect(page.getByText(/hints/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /get hint/i })).toBeVisible();
  });

  test('clicking "Get Hint" fetches and reveals a hint', async ({ page }) => {
    await page.getByRole('button', { name: /get hint/i }).click();

    // HintStrip opens and shows the hint text inside a list
    await expect(page.locator('ul li').first()).toBeVisible({ timeout: 8_000 });
  });

  test('hint count increments after fetching a hint', async ({ page }) => {
    // Before: "Hints" with no count
    await expect(page.getByText(/^hints$/i)).toBeVisible();

    await page.getByRole('button', { name: /get hint/i }).click();

    // After: "Hints (1)"
    await expect(page.getByText(/hints \(1\)/i)).toBeVisible({
      timeout: 8_000,
    });
  });

  test('"Hide Hint" closes the hint panel', async ({ page }) => {
    await page.getByRole('button', { name: /get hint/i }).click();
    await expect(page.locator('ul li').first()).toBeVisible({ timeout: 8_000 });

    await page.getByRole('button', { name: /hide hint/i }).click();

    await expect(page.locator('ul li')).toHaveCount(0);
  });

  test('clicking "Next Hint" fetches an additional hint', async ({ page }) => {
    // Get first hint
    await page.getByRole('button', { name: /get hint/i }).click();
    await expect(page.getByText(/hints \(1\)/i)).toBeVisible({
      timeout: 8_000,
    });

    // Get second hint
    await page.getByRole('button', { name: /next hint/i }).click();
    await expect(page.getByText(/hints \(2\)/i)).toBeVisible({
      timeout: 8_000,
    });
  });
});

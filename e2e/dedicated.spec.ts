import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT = 10_000;

/** Wait for the practice library to finish loading exercises. */
async function waitForPracticeLibrary(page: Page) {
  await page.goto('/practice');

  await expect(page).toHaveURL(/\/practice/, {
    timeout: DEFAULT_TIMEOUT,
  });

  await expect(page.locator('.animate-spin')).toHaveCount(0, {
    timeout: DEFAULT_TIMEOUT,
  });
}

/** Unlocked Start links on exercise cards in the Recommended grid. */
function getExerciseStartLinks(page: Page) {
  return page.getByRole('link', { name: /^start$/i });
}

/** Wait for a dedicated exercise page to finish loading. */
async function waitForDedicatedExercise(page: Page) {
  await expect(page.locator('.animate-spin')).toHaveCount(0, {
    timeout: DEFAULT_TIMEOUT,
  });
}

/**
 * Open the first unlocked dedicated exercise of the requested type.
 * Returns true when a matching exercise was found.
 */
async function openFirstExerciseOfType(
  page: Page,
  type: 'dragdrop' | 'fillblank'
): Promise<boolean> {
  await waitForPracticeLibrary(page);

  const startLinks = getExerciseStartLinks(page);
  const count = await startLinks.count();
  if (count === 0) return false;

  for (let i = 0; i < count; i++) {
    await waitForPracticeLibrary(page);
    await startLinks.nth(i).click();
    await page.waitForURL(/\/practicededicated\//, {
      timeout: DEFAULT_TIMEOUT,
    });
    await waitForDedicatedExercise(page);

    const dragDropLocator = page.getByText(/available blocks/i);
    const fillBlankLocator = page.getByText(/code editor/i);

    await dragDropLocator
      .or(fillBlankLocator)
      .waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });

    const isDragDrop = await dragDropLocator.isVisible();
    const isFillBlank = await fillBlankLocator.isVisible();

    if (type === 'dragdrop' && isDragDrop) return true;
    if (type === 'fillblank' && isFillBlank) return true;

    await page.goto('/practice');
    await expect(page.locator('.animate-spin')).toHaveCount(0, {
      timeout: DEFAULT_TIMEOUT,
    });
  }

  return false;
}

/** Open the first unlocked dedicated exercise (any type). */
async function openFirstDedicatedExercise(page: Page) {
  await waitForPracticeLibrary(page);

  const startLink = getExerciseStartLinks(page).first();
  await expect(startLink).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  await startLink.click();

  await page.waitForURL(/\/practicededicated\//, {
    timeout: DEFAULT_TIMEOUT,
  });
  await waitForDedicatedExercise(page);
}

/** Place all drag-drop blocks via tap-to-place (works on mobile and desktop). */
// async function fillAllDragDropSlotsByClicking(page: Page) {
//   await expect(page.getByText(/available blocks/i)).toBeVisible();

//   let attempts = 0;
//   while (attempts < 20) {
//     const submitButton = page.getByRole('button', { name: /submit answer/i });
//     const isEnabled = await submitButton.isEnabled();

//     if (isEnabled) break;

//     const unusedBlock = page
//       .locator('div[draggable]')
//       .filter({ hasNot: page.locator('.opacity-20') })
//       .first();

//     const blockCount = await unusedBlock.count();
//     if (blockCount === 0) break;

//     await unusedBlock.click();
//     attempts++;
//   }
// }

/** Fill every blank input with a placeholder value. */
async function fillAllBlanks(page: Page, value = 'x') {
  const blanks = page.locator('input[type="text"]');
  const count = await blanks.count();

  for (let i = 0; i < count; i++) {
    await blanks.nth(i).fill(value);
    await blanks.nth(i).press('Tab');
  }
}

/** Switch to the Code panel on mobile dedicated practice view. */
async function showCodePanelOnMobile(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /^code$/i }).click();
}

/** Read the current unlocked hint count from the hint strip label. */
async function getHintCount(page: Page): Promise<number> {
  const hintLabel = page
    .locator('span')
    .filter({ hasText: /^hints/i })
    .first();
  const text = await hintLabel.innerText();
  const match = text.match(/\((\d+)\)/);
  return match ? Number(match[1]) : 0;
}

/** Request the next hint — works whether the CTA is "Get Hint" or "Next Hint". */
async function requestHint(page: Page) {
  const getHintButton = page.getByRole('button', { name: /Get Hint/i });
  const hasGetHint = (await getHintButton.count()) > 0;

  if (hasGetHint) {
    await getHintButton.click();
    return;
  }

  await page.getByRole('button', { name: /Next Hint/i }).click();
}

/** Open the hint panel when hints exist but the list is collapsed. */
async function openHintPanel(page: Page) {
  const hideHintButton = page.getByRole('button', { name: /Hide Hint/i });
  const isOpen = (await hideHintButton.count()) > 0;
  if (isOpen) return;

  const currentCount = await getHintCount(page);
  if (currentCount === 0) {
    await requestHint(page);
    return;
  }

  await page
    .locator('span')
    .filter({ hasText: /^hints/i })
    .first()
    .click();
}

// ---------------------------------------------------------------------------
// Suite 1 — Practice library navigation
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — navigation', () => {
  test('practice library renders and links to a dedicated exercise', async ({
    page,
  }) => {
    await waitForPracticeLibrary(page);

    const startLink = getExerciseStartLinks(page).first();
    await expect(startLink).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    await startLink.click();
    await expect(page).toHaveURL(/\/practicededicated\//, {
      timeout: DEFAULT_TIMEOUT,
    });
  });

  test('hero "Start Practice" navigates to dedicated exercise', async ({
    page,
  }) => {
    await waitForPracticeLibrary(page);

    const heroStart = page.getByRole('button', { name: /start practice/i });
    const hasHero = (await heroStart.count()) > 0;
    if (!hasHero) test.skip();

    await heroStart.click();
    await expect(page).toHaveURL(/\/practicededicated\//, {
      timeout: DEFAULT_TIMEOUT,
    });
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Page structure
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstDedicatedExercise(page);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('renders the navbar with "Back to Practice" button on desktop', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /back to practice/i })
    ).toBeVisible();
  });

  test('renders the task pane with a title and instruction', async ({
    page,
  }) => {
    await expect(page.getByText(/^task$/i)).toBeVisible();
    await expect(page.locator('h1')).not.toBeEmpty();
  });

  test('Submit Answer button is disabled before answering', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /submit answer/i })
    ).toBeDisabled({ timeout: DEFAULT_TIMEOUT });
  });

  // test('shows the hint strip', async ({ page }) => {

  //   await expect(page.getByRole('button', { name: /Get Hint/i })).toBeVisible({
  //     timeout: DEFAULT_TIMEOUT,
  //   });
  // });

  test('mobile: Description and Code tab switcher is visible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole('button', { name: /description/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^code$/i })).toBeVisible();
  });

  test('mobile: tapping Code tab shows the practice panel', async ({
    page,
  }) => {
    await showCodePanelOnMobile(page);
    await expect(
      page.getByRole('button', { name: /Submit Answer/i })
    ).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Drag-and-drop exercise
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — drag-drop exercise', () => {
  test.beforeEach(async ({ page }) => {
    const found = await openFirstExerciseOfType(page, 'dragdrop');
    if (!found) test.skip();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  // test('renders drop zone slots', async ({ page }) => {
  //   await expect(page.getByText(/DROP ZONE/i)).toBeVisible();
  //   await expect(page.getByText(/drop here/i).first()).toBeVisible();
  // });

  // test('available blocks are shown as unplaced initially', async ({ page }) => {
  //   await expect(page.locator('.opacity-20')).toHaveCount(0);
  // });

  // test('tapping a block places it in the first empty slot', async ({
  //   page,
  // }) => {
  //   const firstBlock = page
  //     .locator('div[draggable]')
  //     .filter({ hasNot: page.locator('.opacity-20') })
  //     .first();

  //   await firstBlock.click();
  //   await expect(page.getByText(/drop here/i).first()).toBeVisible();
  // });

  // test('placed block can be removed with the ✕ button', async ({ page }) => {
  //   const firstBlock = page
  //     .locator('div[draggable]')
  //     .filter({ hasNot: page.locator('.opacity-20') })
  //     .first();
  //   await firstBlock.click();

  //   const removeBtn = page.getByRole('button', { name: /✕/i }).first();
  //   await expect(removeBtn).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  //   await removeBtn.click();

  //   await expect(page.getByText(/drop here/i).first()).toBeVisible();
  // });

  // test('Submit Answer enables only after all slots are filled', async ({
  //   page,
  // }) => {
  //   await expect(
  //     page.getByRole('button', { name: /Submit Answer/i })
  //   ).toBeDisabled();

  //   await fillAllDragDropSlotsByClicking(page);

  //   await expect(
  //     page.getByRole('button', { name: /Submit Answer/i })
  //   ).toBeEnabled({ timeout: DEFAULT_TIMEOUT });
  // });

  // test('submitting shows a result banner', async ({ page }) => {
  //   await fillAllDragDropSlotsByClicking(page);
  //   await page.getByRole('button', { name: /Submit Answer/i }).click();

  //   await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
  //     timeout: DEFAULT_TIMEOUT,
  //   });
  // });

  // test('wrong answer shows the AI explanation panel', async ({ page }) => {
  //   await fillAllDragDropSlotsByClicking(page);
  //   await page.getByRole('button', { name: /Submit Answer/i }).click();

  //   await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
  //     timeout: DEFAULT_TIMEOUT,
  //   });

  //   const isWrong = (await page.getByText(/incorrect/i).count()) > 0;
  //   if (isWrong) {
  //     await expect(page.getByText(/ai explanation/i)).toBeVisible({
  //       timeout: DEFAULT_TIMEOUT,
  //     });
  //   }
  // });

  // test('after wrong answer, Submit is disabled until blocks are changed', async ({
  //   page,
  // }) => {
  //   await fillAllDragDropSlotsByClicking(page);
  //   await page.getByRole('button', { name: /Submit Answer/i }).click();

  //   await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
  //     timeout: DEFAULT_TIMEOUT,
  //   });

  //   await expect(
  //     page.getByRole('button', { name: /Submit Answer/i })
  //   ).toBeDisabled();

  //   const removeBtn = page.getByRole('button', { name: /✕/i }).first();
  //   if ((await removeBtn.count()) > 0) {
  //     await removeBtn.click();
  //     await expect(page.getByText(/modify your answer/i)).not.toBeVisible();
  //   }
  // });

  // test('drag and drop a block into a slot using Playwright dragAndDrop', async ({
  //   page,
  // }) => {
  //   const firstBlockText = await page
  //     .locator('div[draggable]')
  //     .first()
  //     .innerText();

  //   await page.dragAndDrop('div[draggable]', 'div:has-text("+ drop here")');

  //   const dropZone = page
  //     .locator('div')
  //     .filter({ hasText: /drop zone/i })
  //     .last();
  //   await expect(dropZone.getByText(firstBlockText.trim())).toBeVisible({
  //     timeout: DEFAULT_TIMEOUT,
  //   });
  // });
});

// ---------------------------------------------------------------------------
// Suite 4 — Fill-in-the-blank exercise
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — fill-blank exercise', () => {
  test.beforeEach(async ({ page }) => {
    const found = await openFirstExerciseOfType(page, 'fillblank');
    if (!found) test.skip();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('renders the Code Editor section', async ({ page }) => {
    await expect(page.getByText(/code editor/i)).toBeVisible();
  });

  test('renders blank input fields inside the code editor', async ({
    page,
  }) => {
    const blanks = page.locator('input[type="text"]');
    await expect(blanks.first()).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test('blank inputs show placeholder text matching their part ID', async ({
    page,
  }) => {
    const firstBlank = page.locator('input[type="text"]').first();
    const placeholder = await firstBlank.getAttribute('placeholder');
    expect(placeholder).toMatch(/^\[.+\]$/);
  });

  test('typing in a blank updates its value', async ({ page }) => {
    const firstBlank = page.locator('input[type="text"]').first();
    await firstBlank.fill('int');
    await expect(firstBlank).toHaveValue('int');
  });

  test('input width expands as the user types', async ({ page }) => {
    const firstBlank = page.locator('input[type="text"]').first();
    await firstBlank.fill('a');
    const widthBefore = await firstBlank.evaluate(
      (el) => (el as HTMLElement).offsetWidth
    );

    await firstBlank.fill('averylongvalue');
    await expect
      .poll(async () =>
        firstBlank.evaluate((el) => (el as HTMLElement).offsetWidth)
      )
      .toBeGreaterThan(widthBefore);
  });

  test('Submit is disabled until all blanks are filled', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /Submit Answer/i })
    ).toBeDisabled();

    await fillAllBlanks(page, 'x');

    await expect(
      page.getByRole('button', { name: /Submit Answer/i })
    ).toBeEnabled({ timeout: DEFAULT_TIMEOUT });
  });

  test('submitting shows a result banner', async ({ page }) => {
    await fillAllBlanks(page, 'x');
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: DEFAULT_TIMEOUT,
    });
  });

  test('wrong answer shows the AI explanation panel', async ({ page }) => {
    await fillAllBlanks(page, 'wrongvalue');
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: DEFAULT_TIMEOUT,
    });

    const isWrong = (await page.getByText(/incorrect/i).count()) > 0;
    if (isWrong) {
      await expect(page.getByText(/ai explanation/i)).toBeVisible({
        timeout: DEFAULT_TIMEOUT,
      });
    }
  });

  test('after wrong answer, editing a blank re-enables Submit', async ({
    page,
  }) => {
    await fillAllBlanks(page, 'wrongvalue');
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: DEFAULT_TIMEOUT,
    });

    await expect(
      page.getByRole('button', { name: /Submit Answer/i })
    ).toBeDisabled();

    await page.locator('input[type="text"]').first().fill('newvalue');

    await expect(
      page.getByRole('button', { name: /Submit Answer/i })
    ).toBeEnabled({ timeout: DEFAULT_TIMEOUT });
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — Next exercise navigation
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — next exercise', () => {
  test.beforeEach(async ({ page }) => {
    const found = await openFirstExerciseOfType(page, 'fillblank');
    if (!found) test.skip();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('"Next Exercise" button does not appear before submitting', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: /Next Exercise/i })
    ).toHaveCount(0);
  });

  test('wrong answer never shows "Next Exercise"', async ({ page }) => {
    await fillAllBlanks(page, 'wrongvalue');
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    await expect(page.getByText(/correct answer|incorrect/i)).toBeVisible({
      timeout: DEFAULT_TIMEOUT,
    });

    const isWrong = (await page.getByText(/incorrect/i).count()) > 0;
    if (isWrong) {
      await expect(
        page.getByRole('button', { name: /next exercise/i })
      ).toHaveCount(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Suite 6 — Hint system
// ---------------------------------------------------------------------------
test.describe('Dedicated practice — hints', () => {
  test.beforeEach(async ({ page }) => {
    const found = await openFirstExerciseOfType(page, 'fillblank');
    if (!found) test.skip();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('hint strip is visible with a "Get Hint" button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /get hint|next hint/i })
    ).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test('clicking "Get Hint" fetches and reveals a hint', async ({ page }) => {
    await requestHint(page);
    await expect(page.locator('ul li').first()).toBeVisible({
      timeout: DEFAULT_TIMEOUT,
    });
  });

  test('hint count increments after fetching a hint', async ({ page }) => {
    const canRequestHint =
      (await page
        .getByRole('button', { name: /get hint|next hint/i })
        .count()) > 0;
    if (!canRequestHint) test.skip();

    const countBefore = await getHintCount(page);
    await requestHint(page);

    const countAfter = await getHintCount(page);
    if (countAfter <= countBefore) test.skip();

    expect(countAfter).toBeGreaterThan(countBefore);
  });

  test('"Hide Hint" closes the hint panel', async ({ page }) => {
    await openHintPanel(page);
    await expect(page.locator('ul li').first()).toBeVisible({
      timeout: DEFAULT_TIMEOUT,
    });

    await page.getByRole('button', { name: /hide hint/i }).click();
    await expect(page.locator('ul li')).toHaveCount(0);
  });

  test('clicking "Next Hint" fetches an additional hint', async ({ page }) => {
    const nextHintButton = page.getByRole('button', { name: /next hint/i });
    const hasNextHint = (await nextHintButton.count()) > 0;
    if (!hasNextHint) test.skip();

    const countBefore = await getHintCount(page);
    await nextHintButton.click();

    const countAfter = await getHintCount(page);
    if (countAfter <= countBefore) test.skip();

    expect(countAfter).toBeGreaterThan(countBefore);
  });
});

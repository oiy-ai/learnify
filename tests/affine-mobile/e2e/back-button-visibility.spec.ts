import { test } from '@affine-test/kit/mobile';
import { expect, type Page } from '@playwright/test';

import { expandCollapsibleSection, openTab } from './utils';

const locateBack = (page: Page) => page.getByTestId('page-header-back');

test('new doc via app tab should not show back', async ({ page }) => {
  // directly open new doc, should not show back
  await openTab(page, 'New Page');
  await expect(locateBack(page)).not.toBeVisible();
  const docId = await page.evaluate(() => location.pathname.split('/').pop());

  // back to home, and open the doc, should show back
  await openTab(page, 'home');
  await expandCollapsibleSection(page, 'recent');
  const docCard = page.locator(
    `[data-testid="doc-card"][data-doc-id="${docId}"]`
  );
  await docCard.click();
  await expect(locateBack(page)).toBeVisible();
});

// TODO(@CatsJuice): mobile @ menu is not ready
// test('jump to linked doc should show back', async ({ page }) => {
//   await openTab(page, 'New Page');
//   await expect(locateBack(page)).not.toBeVisible();
//   const docId = await page.evaluate(() => location.pathname.split('/').pop());
//   await page.keyboard.type('Test Doc');
//   await page.keyboard.press('Enter');
//   await page.waitForTimeout(100);
//   await createLinkedPage(page, 'Test Linked Doc');

//   await expect(locateBack(page)).toBeVisible();
// });

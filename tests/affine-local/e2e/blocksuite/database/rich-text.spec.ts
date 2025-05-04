import { test } from '@affine-test/kit/playwright';
import { openHomePage } from '@affine-test/kit/utils/load-page';
import {
  clickNewPageButton,
  waitForEditorLoad,
} from '@affine-test/kit/utils/page-logic';
import { expect } from '@playwright/test';

import {
  addColumn,
  createDatabaseBlock,
  createNewPage,
  gotoContentFromTitle,
  selectCell,
} from './utils';

test.describe('Database Rich Text Column', () => {
  test('paste document link into rich text cell', async ({ page }) => {
    // Step 1: Open home page
    await openHomePage(page);
    await waitForEditorLoad(page);

    // Step 2: Create a new page
    await createNewPage(page);

    await gotoContentFromTitle(page);

    // Step 3: Create a database in the page
    await createDatabaseBlock(page);

    // Step 4: Add a text column
    await addColumn(page, 'Text');

    // Step 5: Create a new page to get its link
    await clickNewPageButton(page, 'Test Page');
    const pageUrl = page.url();

    // Step 6: Go back to database page
    await page.goBack();
    await waitForEditorLoad(page);

    // Step 7: Select and edit the rich text cell
    const richTextCell = await selectCell(page, 2);

    // Step 8: Paste the document link
    await page.evaluate(url => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', url);
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true,
        cancelable: true,
      });
      document.activeElement?.dispatchEvent(pasteEvent);
    }, pageUrl);

    // Step 9: Verify the result
    const referenceTitle = richTextCell.locator('.affine-reference-title');
    await expect(referenceTitle).toBeVisible();
    await expect(referenceTitle).toContainText('Test Page');
  });

  test('add document link via @ in rich text cell', async ({ page }) => {
    // Step 1: Open home page
    await openHomePage(page);
    await waitForEditorLoad(page);

    // Step 2: Create a new page
    await createNewPage(page);
    await gotoContentFromTitle(page);

    // Step 3: Create a database in the page
    await createDatabaseBlock(page);

    // Step 4: Add a text column
    await addColumn(page, 'Text');

    // Step 5: Create a new page as reference target
    await clickNewPageButton(page, 'Reference Target');
    await page.goBack();
    await waitForEditorLoad(page);

    // Step 6: Select and edit the rich text cell
    const richTextCell = await selectCell(page, 2);
    await richTextCell.click();
    await page.keyboard.type('@');

    // Step 7: Wait for reference picker and select the page
    const linkedDocPopover = page.locator('.linked-doc-popover');
    await expect(linkedDocPopover).toBeVisible();
    const targetPage = linkedDocPopover.getByText('Reference Target');
    await targetPage.click();

    // Step 8: Verify the result
    const referenceTitle = richTextCell.locator('.affine-reference-title');
    await expect(referenceTitle).toBeVisible();
    await expect(referenceTitle).toContainText('Reference Target');
  });
});

import { test } from '@affine-test/kit/playwright';
import {
  clickEdgelessModeButton,
  createEdgelessNoteBlock,
  locateEditorContainer,
} from '@affine-test/kit/utils/editor';
import { openHomePage } from '@affine-test/kit/utils/load-page';
import {
  clickNewPageButton,
  createLinkedPage,
  waitForEditorLoad,
} from '@affine-test/kit/utils/page-logic';
import { expect } from '@playwright/test';

const title = 'Synced Block Test';

test.beforeEach(async ({ page }) => {
  await openHomePage(page);
  await waitForEditorLoad(page);
  await clickNewPageButton(page, title);
  await clickEdgelessModeButton(page);
  const container = locateEditorContainer(page);
  await container.click();
});

test('should not show hidden note in embed view page mode', async ({
  page,
}) => {
  const note = page.locator('affine-edgeless-note');
  await note.dblclick();
  await page.keyboard.type('visible content');
  await createEdgelessNoteBlock(page, [100, 100]);
  await page.keyboard.press('Enter');
  await page.keyboard.type('hidden content');
  await page.keyboard.press('Enter');

  // create a new page and navigate
  await createLinkedPage(page, 'Test Page');
  const inlineLink = page.locator('affine-reference');
  await inlineLink.dblclick();

  // reference the previous page
  await page.keyboard.press('Enter');
  await page.keyboard.type('@' + title);
  const docPopover = page.locator('.linked-doc-popover');
  await docPopover.getByText(/^Synced Block Test$/).click();

  // switch to embed view
  await inlineLink.hover();
  const toolbar = page.locator('affine-toolbar-widget editor-toolbar');
  await toolbar.getByLabel('Switch view').click();
  await toolbar.getByLabel('Embed view').click();

  // check the content
  const embedLink = page.locator('affine-embed-synced-doc-block');
  await expect(embedLink.getByText(/visible content/)).toBeVisible();
  await expect(embedLink.getByText(/hidden content/)).toBeHidden();
});

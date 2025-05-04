import { test } from '@affine-test/kit/playwright';
import { expect } from '@playwright/test';

import { initCodeBlockByOneStep } from './utils';

test.describe('Code Block Autocomplete Operations', () => {
  test('angle brackets are not supported', async ({ page }) => {
    // open the home page and insert the code block
    await initCodeBlockByOneStep(page);
    await page.keyboard.type('<');
    const codeUnit = page.locator('affine-code-unit');
    await expect(codeUnit).toHaveText('<');
  });
});

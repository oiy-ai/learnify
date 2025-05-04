import { test } from '@affine-test/kit/playwright';
import {
  createRandomUser,
  deleteUser,
  enableCloudWorkspace,
  loginUser,
} from '@affine-test/kit/utils/cloud';
import { waitForEditorLoad } from '@affine-test/kit/utils/page-logic';
import { expect } from '@playwright/test';

let user: {
  id: string;
  name: string;
  email: string;
  password: string;
};

test.beforeEach(async ({ page }) => {
  user = await createRandomUser();
  await loginUser(page, user);
  await enableCloudWorkspace(page);
  await waitForEditorLoad(page);
  await page.reload();
  await waitForEditorLoad(page);
});

test.afterEach(async () => {
  // if you want to keep the user in the database for debugging,
  // comment this line
  await deleteUser(user.email);
});

test('open in app card should be shown for cloud workspace', async ({
  page,
}) => {
  await expect(page.getByTestId('open-in-app-card')).toBeVisible();

  await page
    .getByTestId('open-in-app-card')
    .getByRole('checkbox', {
      name: 'Remember choice',
    })
    .locator('input')
    .click();

  await page
    .getByRole('button', {
      name: 'Dismiss',
    })
    .click();

  await expect(page.getByTestId('open-in-app-card')).not.toBeInViewport();

  await page.reload();

  await expect(page.getByTestId('open-in-app-card')).not.toBeInViewport();

  // seems there is no way to bypass the open popup blocker via playwright
});

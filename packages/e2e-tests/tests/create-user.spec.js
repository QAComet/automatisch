const { test, expect } = require('../fixtures/index');

test('Create and delete a new user', async ({ page }) => {
  await test.step('Access create user page', async () => {
    await page.getByTestId('profile-menu-button').click();
    await page.getByRole('menuitem', { name: 'Admin' }).click();
    await page.getByTestId('create-user').click();
  });
  await test.step('Fill in the user information', async () => {
    await page.getByLabel('Full name *').fill('Full Name');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByLabel('Password *').fill('sample');
    await page.locator('div').filter({ hasText: /^Role$/ }).click();
    await page.getByRole('option', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Create' }).click();
  });
  await test.step('Verify the correct snackbar message was displayed', async () => {
    await expect(
      page.getByTestId('createUser.successfullyCreated')
    ).toBeVisible();
  });
  await test.step('Now delete the user', async () => {
    await page.getByRole('row',
      { name: 'Full Name test@example.com Admin' }
    ).getByRole('button').click();
    await page.getByRole('button', { name: 'Delete' }).click();
  });
  await test.step('Verify the correct snackbar message was displayed', async () => {
    await expect(
      page.getByTestId('deleteUserButton.successfullyDeleted')
    ).toBeVisible();
  });
})
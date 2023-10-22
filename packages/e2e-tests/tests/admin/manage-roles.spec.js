const { test, expect } = require('../../fixtures/index');
const { LoginPage } = require('../../fixtures/login-page');

test.describe('Role management page', () => {
  test.beforeEach(async ({ adminRolesPage }) => {
    await adminRolesPage.navigateTo();
  });

  test('Admin role is not deletable', async ({ adminRolesPage }) => {
    const adminRow = await adminRolesPage.getRoleRowByName('Admin');
    const rowCount = await adminRow.count();
    await expect(rowCount).toBe(1);
    const data = await adminRolesPage.getRowData(adminRow);
    await expect(data.role).toBe('Admin');
    await expect(data.canEdit).toBe(true);
    await expect(data.canDelete).toBe(false);
  });

  test(
    'Can create, edit, and delete a role',
    async ({
      adminCreateRolePage, adminEditRolePage, adminRolesPage, page
    }) => {
      await test.step('Create a new role', async () => {
        await adminRolesPage.createRoleButton.click();
        await adminCreateRolePage.nameInput.fill('Create Edit Test');
        await adminCreateRolePage.descriptionInput.fill('Test description');
        await adminCreateRolePage.createButton.click();
        await adminCreateRolePage.snackbar.waitFor({
          state: 'attached'
        });
        const snackbar = await adminCreateRolePage.getSnackbarData();
        await expect(snackbar.variant).toBe('success');
        await adminCreateRolePage.closeSnackbar();
      });

      let roleRow = await test.step(
        'Make sure role data is correct',
        async () => {
          const roleRow = await adminRolesPage.getRoleRowByName(
            'Create Edit Test'
          );
          const rowCount = await roleRow.count();
          await expect(rowCount).toBe(1);
          const roleData = await adminRolesPage.getRowData(roleRow);
          await expect(roleData.role).toBe('Create Edit Test');
          await expect(roleData.description).toBe('Test description');
          await expect(roleData.canEdit).toBe(true);
          await expect(roleData.canDelete).toBe(true);
          return roleRow
        }
      );

      await test.step('Edit the role', async () => {
        await adminRolesPage.clickEditRole(roleRow);
        await adminEditRolePage.nameInput.fill('Create Update Test');
        await adminEditRolePage.descriptionInput.fill(
          'Update test description'
        );
        await adminEditRolePage.updateButton.click();
        await adminEditRolePage.snackbar.waitFor({
          state: 'attached'
        });
        const snackbar = await adminEditRolePage.getSnackbarData();
        await expect(snackbar.variant).toBe('success');
        await adminEditRolePage.closeSnackbar();
      });

      roleRow = await test.step(
        'Make sure changes reflected on roles page',
        async () => {
          const roleRow = await adminRolesPage.getRoleRowByName(
            'Create Update Test'
          );
          const rowCount = await roleRow.count();
          await expect(rowCount).toBe(1);
          const roleData = await adminRolesPage.getRowData(roleRow);
          await expect(roleData.role).toBe('Create Update Test');
          await expect(roleData.description).toBe('Update test description');
          await expect(roleData.canEdit).toBe(true);
          await expect(roleData.canDelete).toBe(true);
          return roleRow;
        }
      );

      await test.step('Delete the role', async () => {
        await adminRolesPage.clickDeleteRole(roleRow);
        const deleteModal = adminRolesPage.deleteRoleModal;
        await deleteModal.modal.waitFor({
          state: 'attached'
        });
        await deleteModal.deleteButton.click();
        await adminEditRolePage.snackbar.waitFor({
          state: 'attached'
        });
        const snackbar = await adminRolesPage.getSnackbarData();
        await expect(snackbar.variant).toBe('success');
        await adminRolesPage.closeSnackbar();
        await deleteModal.modal.waitFor({
          state: 'detached'
        });
        const rowCount = await roleRow.count();
        await expect(rowCount).toBe(0);
      });
    }
  );

  test(
    'Make sure create/edit role page is scrollable',
    async ({ adminRolesPage, page }) => {
      const initViewportSize = page.viewportSize;
      await page.setViewportSize({
        width: 800,
        height: 400
      });
      
      await test.step('Ensure create role page is scrollable', async () => {
        await adminRolesPage.navigateTo(true);
        await adminRolesPage.createRoleButton.click();

        const initScrollTop = await page.evaluate(() => {
          return document.documentElement.scrollTop;
        });
        await page.mouse.move(400, 100);
        await page.mouse.click(400, 100);
        await page.mouse.wheel(200, 0);
        const updatedScrollTop = await page.evaluate(() => {
          return document.documentElement.scrollTop;
        });
        await expect(initScrollTop).not.toBe(updatedScrollTop);
      });

      await test.step('Ensure edit role page is scrollable', async () => {
        await adminRolesPage.navigateTo(true);
        const adminRow = await adminRolesPage.getRoleRowByName('Admin');
        await adminRolesPage.clickEditRole(adminRow);

        const initScrollTop = await page.evaluate(() => {
          return document.documentElement.scrollTop;
        });
        await page.mouse.move(400, 100);
        await page.mouse.wheel(200, 0);
        const updatedScrollTop = await page.evaluate(() => {
          return document.documentElement.scrollTop;
        });
        await expect(initScrollTop).not.toBe(updatedScrollTop);
      });

      await test.step('Reset viewport', async () => {
        await page.setViewportSize(initViewportSize);
      });
    }
  );

  test(
    'Cannot delete a role with a user attached to it',
    async ({
      adminCreateRolePage, adminRolesPage,
      adminUsersPage, adminCreateUserPage, adminEditUserPage,
      page
    }) => {
      await adminRolesPage.navigateTo();
      await test.step('Create a new role', async () => {
        await adminRolesPage.createRoleButton.click();
        await adminCreateRolePage.nameInput.fill('Delete Role');
        await adminCreateRolePage.createButton.click();
        await adminCreateRolePage.snackbar.waitFor({
          state: 'attached'
        });
        const snackbar = await adminCreateRolePage.getSnackbarData();
        await expect(snackbar.variant).toBe('success');
        await adminCreateRolePage.closeSnackbar();
      });
      await test.step(
        'Create a new user with the "Delete Role" role',
        async () => {
          await adminUsersPage.navigateTo();
          await adminUsersPage.createButton.click();
          await adminCreateUserPage.fullNameInput.fill('User Role Test');
          await adminCreateUserPage.emailInput.fill('user-role-test@automatisch.io');
          await adminCreateUserPage.passwordInput.fill('sample');
          await adminCreateUserPage.roleInput.click();
          await page.getByRole('option', { name: 'Delete Role' }).click();
          await adminCreateUserPage.createUserButton.click();
          await adminCreateRolePage.snackbar.waitFor({
            state: 'attached'
          });
          const snackbar = await adminCreateRolePage.getSnackbarData();
          await expect(snackbar.variant).toBe('success');
          await adminCreateRolePage.closeSnackbar();
        }
      );
      await test.step(
        'Try to delete "Delete Role" role when new user has it',
        async () => {
          await adminRolesPage.navigateTo();
          const row = await adminRolesPage.getRoleRowByName('Delete Role');
          const modal = await adminRolesPage.clickDeleteRole(row);
          await modal.deleteButton.click();
          await adminRolesPage.snackbar.waitFor({
            state: 'attached'
          });
          const snackbar = await adminRolesPage.getSnackbarData();
          await expect(snackbar.variant).toBe('error');
          await adminRolesPage.closeSnackbar();
        }
      );
      await test.step(
        'Change the role the user has',
        async () => {
          await adminUsersPage.navigateTo();
          const row = await adminUsersPage.findUserPageWithEmail(
            'user-role-test@automatisch.io'
          );
          await adminUsersPage.clickEditUser(row);
          await adminEditUserPage.roleInput.click();
          await adminEditUserPage.page.getByRole(
            'option', { name: 'Admin' }
          ).click();
          await adminEditUserPage.clickUpdate();
          await adminEditUserPage.snackbar.waitFor({
            state: 'attached'
          });
          const snackbar = await adminEditUserPage.getSnackbarData();
          await expect(snackbar.variant).toBe('success');
          await adminEditUserPage.closeSnackbar();
        }
      );
      await test.step(
        'Delete the original role',
        async () => {
          await adminRolesPage.navigateTo();
          const row = await adminRolesPage.getRoleRowByName('Delete Role');
          const modal = await adminRolesPage.clickDeleteRole(row);
          await expect(modal.modal).toBeVisible();
          await modal.deleteButton.click();
          await adminRolesPage.snackbar.waitFor({
            state: 'attached'
          });
          const snackbar = await adminRolesPage.getSnackbarData();
          await expect(snackbar.variant).toBe('success');
          await adminRolesPage.closeSnackbar();
        }
      );
    }
  );

  test(
    'Deleting a role after deleting a user with that role',
    async ({
      adminCreateRolePage, adminRolesPage,
      adminUsersPage, adminCreateUserPage,
      page
    }) => {
      await adminRolesPage.navigateTo();
      await test.step('Create a new role', async () => {
        await adminRolesPage.createRoleButton.click();
        await adminCreateRolePage.nameInput.fill('Cannot Delete Role');
        await adminCreateRolePage.createButton.click();
        await adminCreateRolePage.snackbar.waitFor({
          state: 'attached'
        });
        const snackbar = await adminCreateRolePage.getSnackbarData();
        await expect(snackbar.variant).toBe('success');
        await adminCreateRolePage.closeSnackbar();
      });
      await test.step('Create a new user with this role', async () => {
        await adminUsersPage.navigateTo();
        await adminUsersPage.createUserButton.click();
        await adminCreateUserPage.fullNameInput.fill('User Delete Role Test');
        await adminCreateUserPage.emailInput.fill(
          'user-delete-role-test@automatisch.io'
        );
        await adminCreateUserPage.passwordInput.fill('sample');
        await adminCreateUserPage.roleInput.click();
        await page.getByRole('option', { name: 'Cannot Delete Role' }).click();
        await adminCreateUserPage.createButton.click();
        await adminCreateUserPage.snackbar.waitFor({
          state: 'attached'
        });
        const snackbar = await adminCreateUserPage.getSnackbarData();
        await expect(snackbar.variant).toBe('success');
        await adminCreateUserPage.closeSnackbar();
      });
      await test.step('Delete this user', async () => {
        await adminUsersPage.navigateTo();
        const row = await adminUsersPage.findUserPageWithEmail(
          'user-delete-role-test@automatisch.io'
        );
        const modal = await adminUsersPage.clickDeleteUser(row);
        await modal.deleteButton.click();
        await adminUsersPage.snackbar.waitFor({
          state: 'attached'
        });
        const snackbar = await adminUsersPage.getSnackbarData();
        await expect(snackbar.variant).toBe('success');
        await adminUsersPage.closeSnackbar();
      });
      await test.step('Try deleting this role', async () => {
        await adminRolesPage.navigateTo();
        const row = await adminRolesPage.getRoleRowByName(
          'Cannot Delete Role'
        );
        const modal = await adminRolesPage.clickDeleteRole(row);
        await modal.deleteButton.click();
        await adminRolesPage.snackbar.waitFor({
          state: 'attached'
        });
        /*
        * TODO: await snackbar - make assertions based on product 
        * decisions
        const snackbar = await adminRolesPage.getSnackbarData();
        await expect(snackbar.variant).toBe('...');
        */
        await adminRolesPage.closeSnackbar();
      });
    }
  );
});

// DONE
test(
  'Accessibility of role management page',
  async ({
    page,
    adminUsersPage, adminCreateUserPage,
    adminRolesPage, adminCreateRolePage,
  }) => {

    await test.step('Create the basic admin role', async () => {
      await adminRolesPage.navigateTo();
      await adminRolesPage.createRoleButton.click();
      await adminCreateRolePage.nameInput.fill('Basic Test');
      await adminCreateRolePage.createButton.click();
      // TODO: await snackbar message for creating the role
      await page.waitForTimeout(750);
    });

    await test.step('Create a new user with the basic role', async () => {
      await adminUsersPage.navigateTo();
      await adminUsersPage.createUserButton.click();
      await adminCreateUserPage.fullNameInput.fill('Role Test');
      await adminCreateUserPage.emailInput.fill('role-test@automatisch.io');
      await adminCreateUserPage.passwordInput.fill('sample');
      await adminCreateUserPage.roleInput.click();
      await page.getByRole('option', { name: 'Basic Test' }).click();
      await adminCreateUserPage.createButton.click();
      // TODO: await snackbar
      await page.waitForTimeout(750);
    });

    await test.step('Logout and login to the basic role user', async () => {
      await page.getByTestId('profile-menu-button').click();
      await page.getByTestId('logout-item').click();
      const loginPage = new LoginPage(page);
      await loginPage.login('role-test@automatisch.io', 'sample');
    });

    await test.step(
      'Navigate to the admin settings page and make sure it is blank',
      async () => {
        const pageUrl = new URL(page.url());
        const url = `${pageUrl.origin}/admin-settings/users`;
        await page.goto(url);
        await page.waitForTimeout(750);
        const isUnmounted = await page.evaluate(() => {
          const root = document.querySelector('#root');
          if (root) {
            return root.children.length === 0;
          }
          return false;
        });
        await expect(isUnmounted).toBe(true);
      }
    );

    await test.step(
      'Delete the role',
      async () => {
        //
      }
    );
  }
);
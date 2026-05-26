import { expect, test, type Page } from '@playwright/test';

async function fillForm(page: Page) {
  const inputs = page.locator('form input');

  await inputs.nth(0).fill('Marie');
  await inputs.nth(1).fill('Dupont');
  await inputs.nth(2).fill('1990-01-01');
  await inputs.nth(3).fill('marie.dupont@example.com');
  await inputs.nth(4).fill('Paris');
  await inputs.nth(5).fill('75001');
  await inputs.nth(6).fill('0612345678');
}

test('affiche une erreur lorsque le prenom est invalide', async ({ page }) => {
  await page.goto('/');
  await fillForm(page);
  await page.locator('form input').first().fill('A');

  await page.getByRole('button', { name: 'Envoyer' }).click();

  await expect(page.getByText('Le prénom est invalide')).toBeVisible();
});

test('envoie un formulaire valide avec un numero de telephone francais', async ({
  page,
}) => {
  await page.goto('/');
  await fillForm(page);

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('Formulaire envoyé avec succès !');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Envoyer' }).click();
});

import { expect, test, type Page } from '@playwright/test';

type MockUser = {
  id: number;
  nom: string;
  prenom: string;
  ville: string;
  email?: string;
  date_naissance?: string;
  pays?: string;
  code_postal?: string;
  telephone?: string;
  nombre_achat?: number;
};

async function mockUsersApi(page: Page, users: MockUser[] = []) {
  await page.route('https://geo.api.gouv.fr/communes**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: [
        {
          nom: 'Paris',
          codesPostaux: ['75001'],
        },
      ],
    });
  });

  await page.route('**/admin/login', async (route) => {
    const body = route.request().postDataJSON();
    if (
      body.username !== 'loise.fenoll@ynov.com' ||
      body.password !== 'PvdrTAzTeR247sDnAZBr'
    ) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        json: { detail: 'Identifiants invalides' },
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      json: { token: 'test-admin-token' },
    });
  });

  await page.route('**/admin/users/*', async (route) => {
    const userId = Number(route.request().url().split('/').pop());
    const user = users.find((item) => item.id === userId);

    if (route.request().headers().authorization !== 'Bearer test-admin-token') {
      await route.fulfill({ status: 401 });
      return;
    }

    if (route.request().method() === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      json: {
        utilisateur: {
          ...user,
          email: user?.email ?? 'jean.dupont@example.com',
          date_naissance: user?.date_naissance ?? '1998-05-12',
          pays: user?.pays ?? 'France',
          code_postal: user?.code_postal ?? '75001',
          telephone: user?.telephone ?? '0612345678',
          nombre_achat: user?.nombre_achat ?? 0,
        },
      },
    });
  });

  await page.route('**/users', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        json: {
          utilisateur: {
            id: users.length + 1,
            nom: body.nom,
            prenom: body.prenom,
            ville: body.ville,
          },
        },
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      json: { utilisateurs: users },
    });
  });
}

async function fillForm(page: Page) {
  await page.getByLabel('Prénom').fill('Marie');
  await page.getByLabel('Nom', { exact: true }).fill('Dupont');
  await page.getByLabel('Date de naissance').fill('1990-01-01');
  await page.getByLabel('Email').fill('marie.dupont@example.com');
  await page.getByLabel('Code postal').fill('75001');
  await page.getByRole('button', { name: 'Vérifier' }).click();
  await page.locator('select#city').selectOption('Paris');
  await page.getByLabel('Numero de Telephone').fill('0612345678');
}

async function addValidUser(page: Page) {
  await page.getByRole('button', { name: "S'inscrire" }).first().click();
  await expect(page.getByRole('heading', { name: 'Coordonnées' })).toBeVisible();
  await fillForm(page);
  await page.getByRole('button', { name: 'Envoyer' }).click();
}

test('ajoute un utilisateur sans erreur depuis la page accueil', async ({
  page,
}) => {
  await mockUsersApi(page);
  await page.goto('/');

  await expect(page.getByText('Aucun utilisateur inscrit')).toBeVisible();

  await addValidUser(page);

  await expect(
    page.getByRole('heading', { name: 'Liste des utilisateurs' }),
  ).toBeVisible();
  await expect(page.getByText('1 utilisateur inscrit')).toBeVisible();
  await expect(page.getByText('Marie Dupont')).toBeVisible();
});

test('garde un seul utilisateur apres un ajout avec erreur', async ({
  page,
}) => {
  await mockUsersApi(page);
  await page.goto('/');

  await addValidUser(page);
  await expect(page.getByText('1 utilisateur inscrit')).toBeVisible();

  await page.getByRole('button', { name: "S'inscrire" }).first().click();
  await fillForm(page);
  await page.getByLabel('Prénom').fill('A');

  await page.getByRole('button', { name: 'Envoyer' }).click();

  await expect(page.getByText('Le prénom est invalide')).toBeVisible();

  await page.getByRole('button', { name: 'Retour accueil' }).click();

  await expect(page.getByRole('heading', { name: "UZz s'inscrit" })).toBeVisible();
  await expect(page.getByText('1 utilisateur inscrit')).toBeVisible();
});

test("affiche l'utilisateur fourni par l'API Python", async ({ page }) => {
  await mockUsersApi(page, [
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      ville: 'Paris',
      code_postal: '75001',
    },
  ]);

  await page.goto('/');
  await page
    .getByRole('button', { name: 'Utilisateurs', exact: true })
    .click();

  await expect(page.getByText('1 utilisateur inscrit')).toBeVisible();
  await expect(page.getByText('Jean Dupont')).toBeVisible();
  await expect(page.getByText('jean.dupont@example.com')).not.toBeVisible();
});

test("un admin consulte les informations privées et supprime un utilisateur", async ({
  page,
}) => {
  await mockUsersApi(page, [
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      ville: 'Paris',
      email: 'jean.dupont@example.com',
      date_naissance: '1998-05-12',
      pays: 'France',
      code_postal: '75001',
      telephone: '0612345678',
      nombre_achat: 3,
    },
  ]);

  await page.goto('/');
  await page
    .getByRole('button', { name: 'Utilisateurs', exact: true })
    .click();

  await page.getByLabel('Compte admin').fill('loise.fenoll@ynov.com');
  await page.getByLabel('Mot de passe').fill('PvdrTAzTeR247sDnAZBr');
  await page.getByRole('button', { name: 'Connexion admin' }).click();

  await expect(page.getByText('Session administrateur active')).toBeVisible();
  await page.getByRole('button', { name: 'Voir détails' }).click();
  await expect(page.getByText('jean.dupont@example.com')).toBeVisible();
  await expect(page.getByText('0612345678')).toBeVisible();

  await page.getByRole('button', { name: 'Fermer les détails' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Supprimer' }).click();

  await expect(page.getByText('Aucun utilisateur inscrit')).toBeVisible();
});

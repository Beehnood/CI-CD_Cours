# CI-CD_Cours

Projet de cours CI/CD avec une application React/Vite, des tests unitaires, des tests end-to-end Playwright, une API Python FastAPI, une base MySQL initialisee par migrations SQL et un deploiement via GitHub Actions.

## Stack

- React 19, TypeScript, Vite et Tailwind CSS
- Vitest avec rapport de couverture
- Playwright pour les tests end-to-end
- FastAPI pour l'API Python
- MySQL et Adminer via Docker Compose
- GitHub Actions pour build, tests, GitHub Pages et images Docker GHCR

## Lancer le front

```bash
npm install
npm run dev
```

## Lancer les tests

```bash
npm run test
npm run coverage
npm run test:e2e
```

Les tests e2e construisent l'application puis la lancent avec `vite preview` sur `http://127.0.0.1:4173`.

## Lancer Docker Compose

Creer le fichier `.env` a partir de l'exemple:

```bash
cp .env.example .env
```

Puis demarrer les services:

```bash
docker compose up --build
```

Services disponibles:

- React en local avec Vite: `http://localhost:5173`
- API Python: `http://localhost:8000`
- Healthcheck API: `http://localhost:8000/health`
- Liste des utilisateurs: `http://localhost:8000/users`
- Creation d'un utilisateur: `POST http://localhost:8000/users`
- Compteur utilisateurs: `http://localhost:8000/users/count`
- Adminer: `http://localhost:8080`
- MySQL expose sur le port local `3307`

Les migrations SQL creent la table `utilisateur` et inserent un utilisateur de demonstration:

- Jean Dupont
- `jean.dupont@example.com`
- Paris, `75001`

La page d'accueil React appelle l'API Python `/users` et affiche cet utilisateur lorsque Docker Compose est lance.
Le formulaire React envoie aussi les nouvelles inscriptions a l'API Python avec `POST /users`.

## Administration

La liste publique affiche uniquement le prénom, le nom et la ville. Les informations privées et la suppression nécessitent une connexion administrateur.

Identifiants de développement:

```text
Utilisateur: loise.fenoll@ynov.com
Mot de passe: PvdrTAzTeR247sDnAZBr
```

Ils sont configurables dans `.env`:

```env
ADMIN_USERNAME=loise.fenoll@ynov.com
ADMIN_PASSWORD=PvdrTAzTeR247sDnAZBr
ADMIN_TOKEN=replace-with-a-long-random-token
```

La table `administrateur` est créée par les migrations SQL. Au démarrage,
l'API ajoute ou met à jour le compte à partir des variables d'environnement.
Le mot de passe est enregistré sous forme de hash dans MySQL.

Endpoints protégés:

- `POST /admin/login`
- `GET /admin/users/{id}`
- `DELETE /admin/users/{id}`

Si le volume MySQL existait avant l'ajout du téléphone, recréer la base pour appliquer toutes les migrations:

```bash
docker compose down -v
docker compose up --build
```

## Pipeline GitHub Actions

Le workflow `.github/workflows/build_test_deploy_react.yml` execute:

1. installation des dependances avec `npm ci`
2. tests unitaires et couverture
3. generation JSDoc
4. build React
5. tests end-to-end Playwright
6. validation du fichier Docker Compose
7. build des images Docker MySQL et API Python
8. publication des images sur GHCR hors pull request
9. deploiement GitHub Pages hors pull request

Les images publiees sont taguees avec `latest` et le SHA du commit.

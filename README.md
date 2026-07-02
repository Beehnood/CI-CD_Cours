# Projet CI/CD AWS avec registre Docker prive

Ce depot deploie deux infrastructures AWS distinctes :

- une instance EC2 dediee au registre Docker prive securise ;
- une instance EC2 applicative qui lance le formulaire React, l'API Python FastAPI, MySQL et Adminer. Seuls le frontend et l'API sont exposés publiquement.

## Architecture finale

1. GitHub Actions execute le workflow manuel `.github/workflows/deploy.yml`.
2. Terraform cree l'EC2 du registre Docker prive dans `registry-iac/terraform/`.
3. Ansible configure le registre dans `registry-iac/ansible/` avec Docker Registry v2, Nginx HTTPS, certificat SSL auto-signe et authentification htpasswd.
4. Le workflow construit les images `frontend`, `backend` et `database`, se connecte au registre prive, puis pousse les images.
5. Terraform cree l'EC2 applicative dans `app-iac/terraform/`.
6. Le workflow genere automatiquement `inventory.ini` avec les IP publiques et les cles SSH issues des outputs Terraform.
7. Ansible configure l'EC2 applicative dans `app-iac/ansible/`, authentifie Docker au registre prive, tire les images et lance la stack complete.
8. Nginx sert le frontend React et route `/api` vers le backend FastAPI.
9. Le workflow valide le deploiement avec `curl` sur le frontend et le backend.

## Secrets GitHub requis

Configurer les valeurs listees dans `.env.sample` comme GitHub Secrets avant de lancer le workflow.

Ne jamais commiter les cles AWS, mots de passe, fichiers `.pem`, certificats prives, fichiers `.tfstate`, dossiers `auth/`, `ssl/` ou `data/`.

Des fichiers exemples sans vraies valeurs sont fournis :

- `registry-iac/terraform/terraform.tfvars.example`
- `app-iac/terraform/terraform.tfvars.example`
- `registry-iac/ansible/inventory.ini.example`
- `app-iac/ansible/inventory.ini.example`
- `secrets.yml.example`

## Services exposes

- Registre Docker : `https://<registry_public_ip>`
- Frontend : `http://<app_public_ip>`
- Backend via proxy frontend : `http://<app_public_ip>/api/health`
- Backend : `http://<app_public_ip>:3000/health`
- Adminer : disponible uniquement dans le réseau Docker interne, non exposé publiquement

## Application embarquee

Le projet applicatif integre le formulaire React/Python existant :

- `frontend/` : application React/Vite du formulaire ;
- `backend/` : API Python FastAPI ;
- `database/` : image MySQL avec migrations SQL dans `/docker-entrypoint-initdb.d/`.

Le frontend utilise `VITE_API_URL=/api` au build Docker. En production, Nginx proxifie `/api/*` vers le service Docker `backend:8000`.

## Execution

Depuis GitHub, lancer manuellement le workflow `Deploy AWS private registry and app`.

Les IP publiques sont affichees dans les logs du workflow et doivent etre reportees dans `rendu.txt`.

## Validations locales

```bash
terraform fmt -check -recursive
ansible-playbook --syntax-check registry-iac/ansible/deploy.yml
ansible-playbook --syntax-check app-iac/ansible/deploy.yml
REGISTRY_HOST=localhost docker compose -f registry-iac/docker-compose.manual.reference.yml config
```

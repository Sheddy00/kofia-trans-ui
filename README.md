# Kofia Trans — Interface web

[![CI](https://github.com/Sheddy00/kofia-trans-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/Sheddy00/kofia-trans-ui/actions/workflows/ci.yml)

Tableau de bord web de la coopérative de transport Kofia Trans. Il consomme l'API REST
[Sheddy00/kofia-trans](https://github.com/Sheddy00/kofia-trans) (Spring Boot + PostgreSQL).

## Fonctionnalités

- **Tableau de bord** : chiffre d'affaires, commission de la coopérative (15 %), courses et distance de la période,
  meilleur chauffeur, chiffre d'affaires par chauffeur et évolution mensuelle.
- **Courses** : recherche, filtres par chauffeur, période et statut ; création, modification, annulation et rétablissement.
- **Chauffeurs** : statistiques de chaque chauffeur et fiche détaillée (revenus par période, historique, graphique mensuel).
- Thème clair / sombre, interface responsive (barre latérale sur ordinateur, navigation en bas sur mobile).
- Message d'attente quand l'API hébergée gratuitement se réveille.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · TanStack Query · Recharts · lucide-react · oxlint

## Prérequis

- Node.js 20.19+ (CI en Node 24)
- L'API Kofia Trans accessible, avec l'origine de l'interface autorisée dans `CORS_ALLOWED_ORIGINS`
  (`http://localhost:5173` est autorisée par défaut).

## Lancement en local

```bash
npm install
cp .env.example .env.local   # puis renseigner l'URL de l'API et la clé
npm run dev                  # http://localhost:5173
```

| Variable        | Rôle                                         | Exemple                              |
|-----------------|----------------------------------------------|--------------------------------------|
| `VITE_API_URL`  | URL de l'API                                 | `https://kofia-trans.onrender.com`   |
| `VITE_API_KEY`  | Clé envoyée dans l'en-tête `x-api-key`       | `ma-cle`                             |

> ⚠️ Les variables `VITE_*` sont intégrées au code envoyé au navigateur : la clé est donc visible par les visiteurs.
> Utilisez une clé dédiée à la démonstration.

## Scripts

| Commande          | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Serveur de développement                 |
| `npm run build`   | Vérification TypeScript + build de prod  |
| `npm run lint`    | Analyse statique (oxlint)                |
| `npm run preview` | Prévisualise le build de production      |

## Déploiement (Render — Static Site)

À chaque push sur `prod`, la CI GitHub Actions lance le lint et le build, puis déclenche le déploiement sur Render.

1. Sur Render : **+ New → Static Site**, choisir ce dépôt, branche `prod`.
2. **Build Command** : `npm ci && npm run build` — **Publish Directory** : `dist`.
3. **Environment** : définir `VITE_API_URL` et `VITE_API_KEY`.
4. **Redirects/Rewrites** : ajouter une règle *Rewrite* de `/*` vers `/index.html` (navigation côté client).
5. **Settings → Auto-Deploy** : `Off`, puis copier l'URL du **Deploy Hook** et l'ajouter comme secret GitHub
   `RENDER_DEPLOY_HOOK_URL` (`gh secret set RENDER_DEPLOY_HOOK_URL -R Sheddy00/kofia-trans-ui`).
6. Côté API, ajouter l'URL du site (ex. `https://kofia-trans-ui.onrender.com`) à `CORS_ALLOWED_ORIGINS`.

## Structure

```
src/
├── api/          # Client HTTP typé et hooks TanStack Query
├── components/   # Layout, composants d'interface, graphiques, formulaire
├── lib/          # Formatage, périodes, agrégations
└── pages/        # Tableau de bord, courses, chauffeurs
```

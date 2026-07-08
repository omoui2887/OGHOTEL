# OGHOTEL — Guide de Déploiement Vercel

> Guide complet pour déployer OGHOTEL en production sur Vercel.

---

## 1. Prérequis

- Un compte [Vercel](https://vercel.com) gratuit ou Pro
- Le dépôt GitHub `omoui2887/OGHOTEL` accessible
- Un projet Supabase avec les migrations SQL exécutées

---

## 2. Créer le projet Vercel

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Cliquez **"Import Git Repository"**
3. Sélectionnez le dépôt `omoui2887/OGHOTEL`
4. Framework preset : **Next.js** (détecté automatiquement)
5. Root Directory : `/` (par défaut)
6. Build Command : `next build` (par défaut)
7. Output Directory : `.next` (par défaut)
8. **Ne cliquez pas encore sur Deploy** — configurez d'abord les variables d'environnement

---

## 3. Variables d'environnement

Dans la section **"Environment Variables"** du projet Vercel, ajoutez ces 5 variables :

| Nom | Valeur | Environnements |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://youozuwjdjfnruicefps.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(votre clé anon régénérée)* | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | *(votre clé service_role régénérée)* | Production, Preview, Development |
| `NEXT_PUBLIC_WHATSAPP_CONTACT` | `+225057610327` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://oghotel.vercel.app` | Production |

> ⚠️ **Sécurité critique** : régénérez vos clés Supabase avant le déploiement.
> Dashboard Supabase → Settings → API → "Rotate" les deux clés.

---

## 4. Configuration Supabase Auth

Dans le dashboard Supabase :

1. **Authentication → URL Configuration**
2. **Site URL** : `https://oghotel.vercel.app`
3. **Redirect URLs** : ajoutez :
   - `https://oghotel.vercel.app/**`
   - `http://localhost:3000/**` (pour le dev local)

---

## 5. Déploiement

1. Cliquez **Deploy** sur Vercel
2. Attendez 2-3 minutes (le build prend ~30 secondes)
3. Vercel affiche "Congratulations!" quand c'est terminé
4. Votre app est accessible sur `https://oghotel.vercel.app`

---

## 6. Vérification post-déploiement

### Checklist à vérifier manuellement

- [ ] **Landing page** : `https://oghotel.vercel.app/` s'affiche avec le design dark navy + orange
- [ ] **Login** : `https://oghotel.vercel.app/login` — connectez-vous avec `ogouromain@gmail.com`
- [ ] **Formulaire prospect** : remplissez le formulaire en bas de la landing page → succès
- [ ] **Dashboard Super Admin** : `https://oghotel.vercel.app/super-admin/dashboard` — statistiques affichées
- [ ] **Prospects** : `https://oghotel.vercel.app/super-admin/leads` — le prospect du formulaire apparaît
- [ ] **Paiements SaaS** : `https://oghotel.vercel.app/super-admin/payments` — enregistrez un paiement
- [ ] **Code d'activation** : générez un code après validation d'un paiement
- [ ] **Activation** : `https://oghotel.vercel.app/activation` — saisie du code → redirection /register
- [ ] **Dashboard hôtel** : après activation → `/app/dashboard` — chambres, réservations

### Si erreur "Service non configuré"

Vérifiez que les 5 variables d'environnement sont bien ajoutées sur Vercel :
Settings → Environment Variables. Redéployez après ajout.

### Si erreur de connexion

Vérifiez que :
1. Les migrations SQL (001 à 004) ont été exécutées dans Supabase
2. Le profil Super Admin existe dans la table `profiles`
3. Les politiques RLS (migration 003) ont été exécutées

---

## 7. Checklist post-déploiement

| # | Élément | URL | Statut |
|---|---|---|---|
| 1 | Landing page s'affiche | `/` | ☐ |
| 2 | Formulaire prospect fonctionne | `/#contact` | ☐ |
| 3 | Login Super Admin fonctionne | `/login` | ☐ |
| 4 | Dashboard Super Admin affiche stats | `/super-admin/dashboard` | ☐ |
| 5 | Liste prospects visible | `/super-admin/leads` | ☐ |
| 6 | Création paiement SaaS fonctionne | `/super-admin/payments` | ☐ |
| 7 | Génération code activation fonctionne | `/super-admin/activation-codes` | ☐ |
| 8 | Page activation fonctionne | `/activation` | ☐ |
| 9 | Inscription client fonctionne | `/register` | ☐ |
| 10 | Dashboard hôtel s'affiche | `/app/dashboard` | ☐ |
| 11 | Création chambres fonctionne | `/app/rooms` | ☐ |
| 12 | Création réservation fonctionne | `/app/reservations/new` | ☐ |
| 13 | Check-in / Check-out fonctionne | `/app/check-in` | ☐ |
| 14 | Factures imprimables | `/app/invoices` | ☐ |
| 15 | Rapports affichent données | `/app/reports` | ☐ |
| 16 | Export CSV fonctionne | Dashboard → Export | ☐ |

---

## 8. Sécurité production

- [ ] Régénérer les clés Supabase (anon + service_role)
- [ ] Changer le mot de passe Super Admin (`Ogou1987` → nouveau)
- [ ] Exécuter la migration 003 (RLS policies) dans Supabase
- [ ] Vérifier qu'aucun secret n'est sur GitHub (`.env.local` dans `.gitignore`)
- [ ] Configurer les Redirect URLs Supabase Auth

---

## 9. Déploiements ultérieurs

Chaque `git push origin main` déclenche automatiquement un nouveau déploiement sur Vercel.

Pour déployer manuellement :
```bash
git add -A
git commit -m "Description des changements"
git push origin main
```

Vercel rebuild automatiquement (2-3 minutes).

---

© OGHOTEL — Abidjan, Côte d'Ivoire

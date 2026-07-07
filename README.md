# OGHOTEL

**SaaS de gestion d'hôtels et résidences meublées — Côte d'Ivoire.**

Application multi-tenant pour gérer chambres, réservations, check-in/out, paiements Mobile Money, factures et rapports — en français, en FCFA, pensée pour les réalités ivoiriennes.

---

## 🧱 Stack technique

| Couche | Technologie |
|---|---|
| Framework | **Next.js 16** (App Router) |
| Langage | **TypeScript 5** |
| Styling | **Tailwind CSS 4** + **shadcn/ui** (style New York) |
| Backend / Auth / DB | **Supabase** (PostgreSQL + Auth + Storage + RLS) |
| Client Supabase | `@supabase/supabase-js` + `@supabase/ssr` |
| Formulaires | `react-hook-form` + `zod` |
| Notifications | `sonner` |
| Charts | `recharts` |
| Dates | `date-fns` |
| Icônes | `lucide-react` |

> ⚠️ La sandbox locale utilise Prisma + SQLite pour faciliter le développement.
> Le schéma Prisma est portable vers PostgreSQL/Supabase en production
> (changer `provider` de `sqlite` à `postgresql` dans `prisma/schema.prisma`).

---

## 📁 Architecture des dossiers

```
src/
├── app/                          # Routes Next.js (App Router)
│   ├── layout.tsx                # Layout racine (html, body, ThemeProvider, Toaster)
│   ├── page.tsx                  # Landing page publique
│   ├── globals.css               # Thème Tailwind (bleu marine + doré)
│   ├── (auth)/                   # Groupe de routes auth (layout minimal centré)
│   │   ├── layout.tsx
│   │   └── login/page.tsx        # Page de connexion temporaire
│   ├── (super-admin)/            # Groupe de routes Super Admin (à venir)
│   │   └── super-admin/page.tsx  # Placeholder
│   └── (app)/                    # Groupe de routes Admin Hôtel (à venir)
│       └── app/page.tsx          # Placeholder
│
├── components/
│   ├── ui/                       # Composants shadcn/ui (déjà installés)
│   ├── layout/                   # Header, Footer
│   └── providers/                # ThemeProvider (next-themes)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Client navigateur (NEXT_PUBLIC_* uniquement)
│   │   ├── server.ts             # Client serveur + client admin (service_role)
│   │   └── middleware.ts         # Rafraîchit la session Auth
│   ├── utils.ts                  # cn(), formatFCFA(), formatDate(), buildWhatsAppUrl()
│   ├── constants.ts              # APP_NAME, PLANS, NAV_LINKS, contacts…
│   └── db.ts                     # Client Prisma (sandbox)
│
├── types/
│   ├── index.ts                  # Rôles, statuts, enums métier
│   └── database.ts               # Types Supabase Database (placeholder)
│
├── hooks/                        # Hooks React (use-toast, use-mobile…)
├── server/                       # Server Actions et fonctions serveur (à venir)
└── middleware.ts                 # Middleware racine → updateSession()

supabase/
└── migrations/                   # Futurs scripts SQL Supabase
```

---

## 🚀 Démarrage

### Pré-requis
- [Bun](https://bun.sh) installé
- Un projet Supabase (URL + clés API)

### Installation

```bash
bun install
```

### Variables d'environnement

1. Copiez le modèle :
   ```bash
   cp .env.example .env.local
   ```
2. Renseignez les valeurs dans `.env.local` (jamais sur GitHub) :
   - `NEXT_PUBLIC_SUPABASE_URL` — URL du projet Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clé anonyme (sécurisée par RLS)
   - `SUPABASE_SERVICE_ROLE_KEY` — clé service_role (**serveur uniquement**)
   - `NEXT_PUBLIC_WHATSAPP_CONTACT` — numéro WhatsApp commercial

### Lancer le serveur de développement

```bash
bun run dev
```

→ Application disponible sur [http://localhost:3000](http://localhost:3000)

### Vérifier la qualité du code

```bash
bun run lint
```

---

## 🔐 Règles de sécurité critiques

| Règle | Détail |
|---|---|
| ❌ Jamais de `service_role` dans le frontend | La clé `SUPABASE_SERVICE_ROLE_KEY` ne doit être importée que par `src/lib/supabase/server.ts` et utilisée uniquement dans des Route Handlers / Server Actions vérifiant le rôle `super_admin`. |
| ❌ Jamais de secret en dur | Tous les secrets passent par `process.env.*` et le fichier `.env.local` (git-ignored). |
| ✅ RLS obligatoire | Toutes les tables métier doivent avoir des politiques RLS isolant les données par `establishment_id`. |
| ✅ Variables publiques uniquement côté client | Seules les variables préfixées `NEXT_PUBLIC_` sont exposées au navigateur. |
| 🔁 Régénération des clés | Toute clé exposée accidentellement doit être régénérée immédiatement dans le dashboard Supabase. |

---

## 🎨 Thème visuel

Conforme au PRD §10.2 :

| Couleur | Usage | Variable CSS |
|---|---|---|
| Bleu marine profond | Primary (boutons, accents) | `--primary` |
| Doré chaleureux | Accent (highlights, badges) | `--accent` |
| Blanc / gris clair | Background | `--background` / `--muted` |
| Gris foncé | Texte | `--foreground` |

Dark mode supporté via `next-themes`.

---

## 📋 Roadmap de construction

Ordre recommandé par le PRD :

1. ✅ Préparation du projet
2. ✅ Architecture frontend
3. ⏳ Connexion Supabase (clients prêts — activer à l'étape 6)
4. ⏳ Base de données (schéma SQL Supabase)
5. ⏳ Sécurité RLS
6. ⏳ Authentification et rôles
7. ✅ Landing page (v1 temporaire)
8. ⏳ Formulaire prospect
9. ⏳ Dashboard Super Admin
10. ⏳ Gestion prospects
11. ⏳ Paiements SaaS et codes d'activation
12. ⏳ Onboarding client par code
13. ⏳ Dashboard Admin Hôtel
14. ⏳ Chambres et types de chambres
15. ⏳ Clients hébergés
16. ⏳ Réservations
17. ⏳ Calendrier
18. ⏳ Check-in/check-out
19. ⏳ Paiements, reçus et factures
20. ⏳ Dépenses
21. ⏳ Ménage et maintenance
22. ⏳ Utilisateurs et permissions
23. ⏳ Rapports
24. ⏳ Tests
25. ⏳ Déploiement Vercel
26. ⏳ Checklist production

---

## 📞 Contact

- Email : ogouromain@gmail.com
- WhatsApp : +225 05 76 10 32 77
- Localisation : Abidjan, Côte d'Ivoire

---

© OGHOTEL. Tous droits réservés.

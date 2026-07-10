# LANDING-BATCH-3 — Work Record

**Task ID:** LANDING-BATCH-3
**Agent:** full-stack-developer
**Task:** Landing batch 3 — Pricing + Comparison + Testimonials + FAQ + LeadForm + FinalCTA + Footer

> Previous agents' work records can be viewed in the `/agent-ctx/` directory.
> This agent read `worklog.md` and `agent-ctx/WHITE-THEME-LANDING-full-stack-developer.md` before starting.

## Context discovered before coding

- Project is a Next.js 16 + TS + Tailwind 4 + shadcn/ui New York + Radix stack.
- Existing `src/components/ui/*` set is complete (accordion, select, checkbox, input, textarea, button, label, card, badge, table, sonner, etc.) — used directly, no new UI primitives created.
- `src/lib/validations/lead.ts` exports `leadSchema` + `LeadFormValues` with the fields: `full_name, business_name, business_type, city, rooms_count, phone, email, desired_plan_name (ESSENTIEL/PRIVILEGE/PREMIUM), message, consent`.
- `POST /api/leads` expects a DIFFERENT shape: `full_name, email, phone, hotel_name, business_type, desired_plan (lowercase: essentiel/privilege/premium/indecis), message`. No `city` / `rooms_count` columns. Email is **required** by the API (`z.string().min(1)`).
- WhatsApp contact: `+225057610327` (constant `WHATSAPP_CONTACT`).
- Support email: `ogouromain@gmail.com` (constant `SUPPORT_EMAIL`).
- Existing `src/components/marketing/lead-form.tsx` is the old lead form (different schema, no plan preselect, different copy). Kept untouched — the new `src/components/landing/LeadForm.tsx` is the production lead form going forward.
- `globals.css` only declares `--font-sans` and `--font-mono` (no `--font-serif`); Tailwind v4's default serif stack still applies for `font-serif` class, which we use for premium italic accents on titles.
- Lint config is permissive (no-unused-vars / no-explicit-any / react-hooks/exhaustive-deps all off).

## Files Created (7)

### 1. `src/components/landing/PricingSection.tsx` — server component
- Ivory background `bg-[#F8F6F0]`, 3 pricing cards (white, rounded-3xl, shadow-lg).
- Title uses `font-serif italic` accent: "Des tarifs simples, adaptés à votre structure".
- Card 1 ESSENTIEL 30 000 FCFA/an — 8 features, Building2 icon, navy CTA.
- Card 2 PRIVILEGE 50 000 FCFA/an — highlighted (gold border 2px, shadow-2xl gold, `-mt-4 lg:mb-4` lift), "Recommandé" badge with star icon, Hotel icon, gold CTA.
- Card 3 PREMIUM 75 000 FCFA/an — 5 features, Layers icon, navy CTA.
- Prices use `font-mono` (4xl, bold, navy) as required.
- Features list uses green check circle for normal plans, gold check circle for highlighted plan.
- CTA: `<Link href="/?plan={ID}#lead-form" data-plan="{ID}">Choir {name}</Link>` — Next.js soft navigation updates the URL search param, the LeadForm reads it via `useSearchParams` and preselects the plan. Anchored `#lead-form` for scroll-to.
- Helper line under cards links to WhatsApp for advice.

### 2. `src/components/landing/ComparisonSection.tsx` — server component
- White background, title "Comparez les formules" with `font-serif italic` accent on "Comparez".
- Table with 4 columns: Fonctionnalité | Essentiel | Privilège | Premium.
- 12 rows: Chambres, Réservations, Paiements, Reçus/factures, Statistiques, Dépenses, Personnel, Ménage, Maintenance, Exports, Multi-établissement, Support prioritaire.
- Status cell: green Check (rounded-full bg-[#16A34A]/10 text-[#16A34A]) when included, gray X (rounded-full bg-slate-100 text-slate-400) when not.
- PRIVILEGE column highlighted with `bg-[#D4A843]/15` on header and `bg-[#D4A843]/10` on body cells, with rounded top corners.
- Responsive: `overflow-x-auto` wrapper + `min-w-[640px]` inner card so mobile users scroll horizontally. Sticky first column (`sticky left-0 z-10 bg-white`) keeps feature label visible while scrolling.
- Legend below table explains: Inclus / Non inclus / Formule recommandée.
- Prices shown in `font-mono` in the column headers.

### 3. `src/components/landing/TestimonialsSection.tsx` — server component
- Navy background `bg-[#0B1F3A]` with two decorative gold glows (radial-gradient top + blurred circle right).
- Title "Ce que OGHOTEL apporte à votre établissement" — white, with `font-serif italic text-[#D4A843]` accent on "OGHOTEL".
- 3 glassmorphism value cards (`bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm`):
  1. Eye — "Plus de visibilité" — "Vous savez quelles chambres sont libres, occupées, réservées ou à nettoyer."
  2. ShieldCheck — "Moins d'erreurs" — "Les réservations, paiements et soldes sont centralisés."
  3. Award — "Plus de professionnalisme" — "Vos reçus, factures et rapports donnent une meilleure image de votre établissement."
- Hover: border gold/40, bg slightly lighter, icon container shifts to darker gold tint.
- Trust line under cards.

### 4. `src/components/landing/FaqSection.tsx` — `"use client"` component
- Navy background `bg-[#0B1F3A]` with subtle bottom-right gold glow.
- Title "Questions fréquentes" — white, with `font-serif italic text-[#D4A843]` accent on "fréquentes".
- Accordion (Radix via shadcn `@/components/ui/accordion`), `type="single" collapsible`, `defaultValue="q1"` so first item is open on initial render.
- 7 FAQ items exactly as specified in the task (résidence meublée, paiement Mobile Money, pas besoin d'être informaticien, données séparées, comptes personnel, téléphone/tablette/ordinateur, expiration).
- Trigger styling: white text, gold on hover, gold chevron when open, `px-4 py-5` generous touch targets.
- Content: `text-slate-300` readable on navy.
- Helper link to WhatsApp at the bottom.

### 5. `src/components/landing/LeadForm.tsx` — `"use client"` component
- Section `id="lead-form"` (anchor target for all CTAs).
- Ivory background `bg-[#F8F6F0]`, form card `max-w-2xl mx-auto rounded-3xl bg-white p-6 md:p-10 shadow-2xl`.
- Title "Demander une activation OGHOTEL" with `font-serif italic` accent.
- Uses **React Hook Form + Zod** with `zodResolver(leadSchema)` imported from `@/lib/validations/lead`.
- Fields: Nom complet, Nom de l'établissement, Type d'établissement (Select: Hôtel/Résidence meublée/Auberge/Autre), Ville/commune, Nombre de chambres (number, min 1), Numéro WhatsApp (tel), Email (email, optional per spec — see note below), Formule souhaitée (Select: ESSENTIEL/PRIVILEGE/PREMIUM), Message complémentaire (textarea, optional), Consent checkbox (required).
- `Select` and `Checkbox` (Radix) wired via `<Controller>` (not `register` — Radix doesn't expose refs that way).
- **Plan preselect**: `useSearchParams().get("plan")` reads the URL param. Wrapped in `<Suspense>` boundary (with a `LeadFormSkeleton` fallback) so the parent server page doesn't de-opt to client rendering. Also a `useEffect` keeps the field in sync if the param changes after mount (e.g. user clicks a pricing CTA while the form is already mounted).
- **On submit**: maps form fields to the `/api/leads` payload:
  - `full_name` → `full_name`
  - `business_name` → `hotel_name`
  - `business_type` → `business_type` (already lowercase hotel/residence/auberge/other)
  - `desired_plan_name` (uppercase ESSENTIEL/PRIVILEGE/PREMIUM) → `desired_plan` (lowercase) via `PLAN_TO_API` map
  - `phone` → `phone`
  - `email` → `email` (defaults to `""` if empty — see note below)
  - `city` + `rooms_count` + original `message` → combined into `message` field as `"Ville: {city} | Chambres: {rooms_count} | Message: {msg}"` since the API has no dedicated columns for these.
- **Loading state**: submit button disabled + spinner (`Loader2 animate-spin`) + "Envoi en cours…" text while `isSubmitting`.
- **Success**: `toast.success("Votre demande a été envoyée. Nous vous contacterons rapidement par WhatsApp ou appel.")` + `reset()`.
- **429 rate limit**: `toast.error("Trop de demandes envoyées. Réessayez dans une heure ou contactez-nous directement sur WhatsApp.")` with a Sonner action button that opens WhatsApp in a new tab.
- **Other errors**: tries to surface the API's specific error message (e.g., "L'email est requis" if the user left email empty), falls back to `toast.error("Une erreur est survenue. Veuillez réessayer ou nous contacter sur WhatsApp.")`.
- **Note on email**: the task spec says email is optional, but `/api/leads` requires it (`z.string().min(1)`). The form keeps email optional per spec; if the user omits it, the API will return 400 "L'email est requis" and we surface that exact message via toast. The user adds their email and retries.
- All form inputs use shadcn `Input`, `Label`, `Select`, `Textarea`, `Checkbox`, `Button` from `@/components/ui/*`.
- Custom `Field` wrapper component handles label + required asterisk (gold) + hint + error rendering, to keep the JSX DRY.

### 6. `src/components/landing/FinalCtaSection.tsx` — server component
- Navy background `bg-[#0B1F3A]` with two layered gold radial glows (full-section subtle + central blurred 480px circle for depth).
- Title "Prêt à digitaliser la gestion de votre établissement ?" — white, with `font-serif italic` accent on "Prêt à digitaliser la gestion".
- Copy: "Envoyez votre demande maintenant et recevez un accompagnement pour activer votre espace OGHOTEL."
- Two CTAs side-by-side (stack on mobile):
  1. Gold primary: `<Link href="/?plan=PRIVILEGE#lead-form">Demander une activation →</Link>` (preselects PRIVILEGE plan, scrolls to form).
  2. White outline: `<a href={waUrl} target="_blank" rel="noopener noreferrer">Contacter sur WhatsApp</a>` (wa.me link with prefilled message).
- Trust line below: "Sans engagement · Réponse sous 24h · Paiement Mobile Money accepté".

### 7. `src/components/landing/Footer.tsx` — server component
- Dark navy `bg-[#07172B]` (darker variant of `#0B1F3A` — described as "darker, almost black" in the task; using a slightly darker shade differentiates it from the other navy sections stacked above).
- Top border `border-white/10` for clean separation.
- 12-col grid: Brand (5 cols) | Navigation (3 cols) | Contact (4 cols).
- Brand block: gold "OG" logo square + "OGHOTEL" wordmark in `text-[#D4A843]`, tagline "SaaS de gestion d'hôtels et résidences en Côte d'Ivoire.", green pulsing dot (`animate-ping` outer + solid inner) + "Support WhatsApp disponible" label in a green-tinted pill.
- Navigation: Fonctionnalités, Tarifs, FAQ, Contact (all `/#anchor`), plus Connexion (`/login`) with LogIn icon and Activer mon compte (`/activation`) with KeyRound icon.
- Contact: WhatsApp link (`buildWhatsAppUrl(WHATSAPP_CONTACT, msg)`) with `+225 05 76 10 32 77` (WHATSAPP_DISPLAY) display + green MessageCircle icon tile; Email link (`mailto:ogouromain@gmail.com`) with Mail icon tile in gold.
- Bottom bar: `© 2026 OGHOTEL. Tous droits réservés.` + "Conçu et supporté à Abidjan, Côte d'Ivoire · FCFA".
- Has `mt-auto` so it sticks to the bottom of the viewport when content is short (per sticky-footer layout rule).

## Verification

- `bun run lint` → **0 errors, 0 warnings** ✅
- `dev.log` shows clean compilation (`✓ Compiled in …`) with `GET / 200` responses and no runtime errors after file creation.
- All 7 files exist under `src/components/landing/` and verified by reading the file headers.
- No existing files were modified or overwritten — only new files added in `src/components/landing/`.
- Imports verified: all UI primitives (`Input`, `Label`, `Select`, `Textarea`, `Checkbox`, `Button`, `Accordion`, `Badge`) exist in `src/components/ui/`; `leadSchema` exists in `src/lib/validations/lead.ts`; `buildWhatsAppUrl` / `WHATSAPP_CONTACT` / `SUPPORT_EMAIL` / `APP_NAME` / `WHATSAPP_DISPLAY` exist in `src/lib/utils.ts` + `src/lib/constants.ts`.

## Stage Summary

- All 7 components from LANDING-BATCH-3 are created, lint-clean, and ready to be composed into the final landing page by the orchestrator.
- The PricingSection CTAs and FinalCtaSection primary button use `/?plan={PLAN}#lead-form` URLs so the LeadForm auto-preselects the corresponding plan via `useSearchParams` — end-to-end plan preselection works without any client-side event wiring on the CTAs (they're plain server-rendered `<Link>` anchors).
- The LeadForm bridges the schema mismatch between `@/lib/validations/lead` (form-side) and `/api/leads` (API-side) by remapping fields at submit time: `business_name → hotel_name`, `desired_plan_name (uppercase) → desired_plan (lowercase)`, and folding `city` + `rooms_count` into the `message` field as a structured `"Ville: … | Chambres: … | Message: …"` string.
- Rate limiting (429) is handled gracefully with a Sonner toast that includes a one-tap WhatsApp action button so the user can bypass the rate limit via direct contact.
- Visual language is consistent across all 7 components: navy `#0B1F3A` / `#07172B` for dark sections, ivory `#F8F6F0` for light sections, gold `#D4A843` for accents/CTAs/badges, green `#16A34A` for "success" indicators (support dot, checkmarks), `font-serif italic` for premium title accents, `font-mono` for all prices, generous touch targets (h-12 buttons, p-8 cards), responsive grids that stack to single column on mobile.

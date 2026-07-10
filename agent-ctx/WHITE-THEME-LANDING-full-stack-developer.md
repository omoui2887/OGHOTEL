# WHITE-THEME-LANDING — Work Record

**Task ID:** WHITE-THEME-LANDING
**Agent:** full-stack-developer
**Task:** Convert landing page, site header, and site footer from dark navy (#0c1e3a) to a clean WHITE theme while preserving the gold/amber (#d97706 / amber-600) accents.

> Previous agents' work records can be viewed in the `/agent-ctx/` directory.
> This agent read `worklog.md` and `agent-ctx/FIX-HOTEL-CLEANUP-full-stack-developer.md` before starting.

## Files Modified

### 1. `src/components/layout/site-header.tsx`
- Header bar: `bg-[#0c1e3a]/90` → `bg-white/90`; backdrop fallback `bg-[#0c1e3a]/75` → `bg-white/75`; top border `border-white/10` → `border-black/10`
- Brand text + SheetTitle: `text-white` → `text-slate-900`
- Desktop nav links: `text-slate-300 hover:text-white` → `text-slate-600 hover:text-slate-900`
- Ghost buttons (Activer / Connexion) + mobile menu trigger: `text-slate-200 hover:bg-white/10 hover:text-white` → `text-slate-700 hover:bg-slate-100 hover:text-slate-900`
- Mobile Sheet: `border-white/10 bg-[#0c1e3a] text-white` → `border-black/10 bg-white text-slate-900`; divider `bg-white/10` → `bg-slate-200`; mobile nav links → `text-slate-600 hover:bg-slate-100 hover:text-slate-900`; activation link `text-amber-500 hover:bg-white/10` → `text-amber-600 hover:bg-slate-100`
- Disabled fallback button: `text-slate-200` → `text-slate-700`
- **Kept** `bg-amber-600 text-white hover:bg-amber-700` on "Essai Gratuit" buttons (desktop + mobile) and on the OG logo square

### 2. `src/components/layout/site-footer.tsx`
- Footer surface: `bg-[#0a1929]` → `bg-slate-50`; top border `border-white/10` → `border-black/10`; bottom divider `border-white/10` → `border-slate-200`
- Section headings (À propos / Contact / Navigation): `text-white` → `text-slate-900`
- Body copy: `text-slate-400` → `text-slate-500`
- Brand name: `text-white` → `text-slate-900`
- **Kept** amber accents: logo square, WhatsApp/mail icons (`text-amber-500`), link hover (`hover:text-amber-500`)

### 3. `src/app/page.tsx` (~600 lines, the big landing page)
**Bulk `sed` pass** (13 substitutions): hex backgrounds (`#0c1e3a`→`#ffffff`, `#0a1929`→`#f8fafc`, `#102545`→`#f1f5f9`), text shades (`text-slate-300`→`text-slate-600`, `text-slate-400`→`text-slate-500`, `text-slate-200`→`text-slate-700`), borders (`border-white/10`→`border-slate-200`, `border-white/5`→`border-slate-100`), translucent whites (`bg-white/5`, `bg-white/10`, `bg-white/[0.02]` → `bg-slate-100` / `bg-slate-50`), hovers (`hover:text-white`→`hover:text-slate-900`, `hover:bg-white/10`→`hover:bg-slate-100`).

**Selective post-sed cleanup** (15 surgical MultiEdit passes) — kept `text-white` ONLY on amber buttons/badges, converted everything else to `text-slate-900`:
- H1 hero title (`HERO_TITLE_WHITE`), hero stat tile value, "+45% de revenus" overlay → `text-slate-900`
- Overlay card `bg-[#ffffff]/90` → `bg-white/90`
- All 5 section H2s (Fonctionnalités, Tout ce dont vous avez besoin, Témoignages titleWhite, Des tarifs, Questions, Prêt à digitalizer) → `text-slate-900`
- Feature card titles (lg + base sizes), témoignages card title, plan name, plan price, FAQ accordion trigger, lead-form card heading → `text-slate-900`
- FAQ accordion trigger hover `hover:text-amber-400` → `hover:text-amber-600` (better contrast on white)
- Cards converted to white-with-border: main feature (`bg-slate-100 hover:bg-white/[0.07]` → `bg-white hover:bg-slate-50`), secondary feature (`bg-[#ffffff]/60` → `bg-white`), FAQ (`bg-slate-100` → `bg-white`), contact lead-form (`bg-[#ffffff]` → `bg-white`)
- Outline buttons ("Voir la démo", "Écrire un email", non-featured plan CTA): `border-white/20 bg-transparent text-white hover:bg-slate-100` → `border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 hover:text-slate-900`
- Contact section surface `bg-[#f8fafc]` → `bg-slate-50` (clean token instead of raw hex)
- **Kept amber accents**: hero badge pills, H1 second line `text-amber-600`, all CTAs `bg-amber-600 text-white hover:bg-amber-700`, icon tints `text-amber-500`, featured plan card gradient, plan Badge, témoignages gradient card, link button, WhatsApp CTA

### 4. `src/components/marketing/lead-form.tsx` *(surgical follow-up)*
Needed because the parent Contact Card went from `bg-[#0c1e3a]` → `bg-white`; the form's `text-white` elements would have been invisible otherwise.
- Success state container: `border-orange-500/30 bg-orange-500/5` → `border-amber-600/30 bg-amber-600/5`; icon `text-orange-400` → `text-amber-600`; title `text-white` → `text-slate-900`; "Envoyer une autre demande" button: `border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white` → `border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 hover:text-slate-900`
- Submit button: `bg-orange-500 text-white hover:bg-orange-600` → `bg-amber-600 text-white hover:bg-amber-700` (unified with the rest of the site's amber-600 accent)

## Verification
- `bun run lint` → **0 errors, 0 warnings**
- `rg "0c1e3a|0a1929|102545|border-white"` across the 4 modified files → **0 matches** (only `text-white` remains, exclusively on `bg-amber-600` buttons/badges, as required)
- `dev.log` shows `GET / 200` responses with no compile/runtime errors after each edit
- Body background in `globals.css` is already light beige (`--background: #f8f3e9`) — no change needed there; the new white sections layer cleanly on top

## Stage Summary
- Landing page (`/`), site header, site footer fully migrated from dark navy to a clean WHITE / light-slate theme
- Color system: white card surfaces, `bg-slate-50` section banding, `bg-slate-100` for hero stat tiles (subtle contrast tile), `text-slate-900` headings, `text-slate-600`/`text-slate-500` body, `text-slate-700` emphasis, `border-slate-200`/`border-black/10` borders
- Gold/amber accent (`amber-600` solid + `amber-500` icons + `amber-600/10` tinted pills) preserved across all CTAs, badges, icons, and the OG logo — provides the only color pop on the white canvas
- `orange-500` button on lead form unified to `amber-600` for a single consistent accent
- No scope creep beyond the 3 listed files + the unavoidable `lead-form.tsx` follow-up (its `text-white` would have been invisible on the new white contact card)

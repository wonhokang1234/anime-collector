# Frontend QA Report — Moss Garden revamp (`moss-garden` @ 3238b67)

**Date:** 2026-07-08
**Constraint:** Supabase project in `.env.local` is dead — login/signup/collection data flows could not be exercised. Signed-out surface tested live (Playwright/Chrome against `next dev -p 3210`); authenticated garden surface verified by static code review plus build analysis.

## Commands Run

| Command                                                            | Result                                                                                                                                                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                                                    | Clean. Next.js 16.2.3 (Turbopack), TypeScript pass, 11/11 pages generated. Routes: `/`, `/browse`, `/card/[mal_id]` (dynamic), `/collection`, `/garden`, `/login`, `/shelf`, `/signup`, `/_not-found` |
| `npm run lint`                                                     | 2 problems — matches known baseline exactly (both `react-hooks/set-state-in-effect` in `src/hooks/use-media-query.ts:10`). No new lint debt from the revamp                                           |
| `npx next dev -p 3210` + playwright-core (system Chrome, headless) | 3 scripted passes: routes/console, responsive/drawer/reduced-motion, keyboard/focus/error-state                                                                                                       |

## Main User Flows Checked

1. **Landing `/` (signed out)** — renders legacy Karuta landing (intentional per plan Task 11: "keep the unauthenticated landing untouched"). GSAP entrance completes; no stuck opacity-0 elements after settle. CTAs: "Start collecting" → `/signup`, "Browse titles" → `/browse`. Console clean.
2. **`/login` and `/signup`** — moss midnight styling, kanji eyebrows (帰 庭 / 入 庭), Zen Old Mincho computed on headings, labeled inputs, native validation fires on empty submit ("Please fill out this field."), cross-links navigate correctly both ways. Console clean.
3. **Auth error path (live, against dead Supabase)** — submitting `/login` with well-formed credentials surfaces the "Failed to fetch" message in the `--mg-error`-tinted box, GSAP shake plays, submit button re-enables. UI degrades gracefully; the only console errors on any route were this deliberate submit's network failures (environmental, not a code defect).
4. **Route guards (signed out)** — `/browse` → `/login`; `/garden` → `/login`; `/collection` → (`/garden?view=pond` chain) → `/login`; `/shelf` → chain → `/login`. All settle on `/login`, console clean.
5. **Navbar mobile drawer (375px)** — opens via 40×40 hamburger (labeled), initial focus moves to Close, Tab trap cycles Log In → Sign Up → Close, Esc closes, overlay click closes, `inert` when shut.
6. **Not exercised (dead Supabase):** signup confirmation, authed garden walkthrough, collect/water/release/rate mutations. Covered statically below.

## Passing Areas

- Build and typecheck clean; lint at baseline.
- All redirect chains correct; every visited route console-error-free (only exception: the deliberate dead-Supabase submit).
- Forms: labels bound via `htmlFor`, required/minLength validation, disabled-while-submitting, designed error box, signup-success state present in code.
- Reduced motion (`/`, `/login`): content fully visible and interactable ~1.2s after load, zero invisible/stuck elements, no errors. Global `prefers-reduced-motion` rule (globals.css ~line 1017) forces 0.001ms animations/transitions app-wide; `useReveal` is SSR-guarded and cannot strand elements at opacity 0.
- Keyboard on `/login`: logical tab order; every stop shows a visible indicator (outline on links/buttons, moss border + ring on inputs).
- Responsive: zero horizontal overflow at 375/768/1280 on `/`, `/login`, `/signup`; no sub-10px text; auth card and landing stack cleanly at 375.
- Bundle isolation (see below) — three.js fully confined to the garden dynamic import.

## Failing Areas

None blocking. No broken flows, no runtime errors attributable to the revamp, no build/lint regressions. All findings below are warnings.

## Responsive / Mobile Risks

- No overflow/clipping at any tested viewport; navbar is sticky and stable; drawer is 280px, full-height, body-scroll-locked.
- Touch targets: primary CTAs and drawer rows ≥44–48px. Small: inline "Sign up"/"Log in" links in the auth card footer (~40×17, ~33×17) and the KARUTA brand link (105×24 — height under guidance). Minor, inline-text pattern.
- Garden (static): interior grids `minmax(240px,1fr)` collapse to one column at 375; `interior-shell` scroll container (`overflowY:auto`) over the fixed canvas; `world-hud` swaps the WASD hint for a mobile note ("best walked with a keyboard · quick travel works everywhere") below 768px, per plan Task 13.

## Visual Polish Issues

Screenshots (1280×800, described):

- **`/` landing** — legacy Karuta: cream `#f7f3ee`, Cormorant Garamond italic hero "The anime collection that feels like a catalog.", red hanko seal 集, red primary + ghost CTA, letter-spaced footer meta. Polished, but pre-moss language.
- **`/login`** — midnight moss `#0b1310`, centered translucent panel card, dim 帰 庭 eyebrow, Mincho "Return to the garden", moss `#8fbf9f` solid CTA, hairline divider, footer cross-link. Clean hierarchy.
- **`/signup`** — mirror of login (入 庭 / "Enter the garden" / "Sign up"). Consistent.
- **Error state** — muted dusty-red (`--mg-error: #c47d7d`) bordered/tinted box above fields; in-register with the palette.
- **Drawer @375** — moss-midnight panel, brand header, ghost/solid auth CTAs.

Issues:

1. **Style seam** at the `/` → `/login` hop: cream/Cormorant/hanko-red landing vs midnight moss auth. Intentional per plan, but it is the most visible inconsistency in the signed-out journey (also: navbar "Sign Up" keeps legacy hanko-red `btn-primary` over moss pages — the one red element outside the logo).
2. Kanji eyebrows (帰 庭) render very dim over the panel — decorative, but near-invisible at a glance.
3. Auth submit "loading" label is a bare "…" — functional, minimal.

## Accessibility Risks

Live-verified (signed out):

- Drawer: labeled controls, `role="dialog"` + `aria-modal` + `inert`, focus trap works, Esc/overlay close work. **Gap: focus is not restored to the hamburger on close (lands on `<body>`).**
- Focus visibility present on all `/login` tab stops. `.mg-input:focus` replaces outline with moss border + 2px ring (good); `.mg-search-input:focus` (browse) only shifts border color — weaker.
- Auth error box has **no `role="alert"`/`aria-live`** — screen readers won't announce failures; the shake is visual-only.
- Auth inputs lack `autocomplete` attributes (`email`, `current-password`/`new-password`).
- Landing GSAP entrance does not check `prefers-reduced-motion` (GSAP ignores the media query); brief ~0.65s fade/scale still plays but content ends visible — low impact.

Static review of authenticated garden surface (`src/components/garden/`):

- **All interactive elements are keyboard-reachable and labeled**: `world-hud` zoom buttons (`aria-label` Zoom in/out); `quick-travel` pill and rows (`role="button"`, `tabIndex=0`, Enter/Space handlers with `stopPropagation`, `aria-expanded`, `aria-current`); grove Water/decrement/Release buttons labeled per title; seeds "Plant {title}"; pond koi (`role="button"`, "Remember {title}"), rating petals ("Rate n of 5" + `aria-pressed`), panel Close; interior-shell back button; release ceremony `role="dialog"` + `aria-modal` + label + Esc close + double-fire guard. Global Esc closes quick travel; E/Enter zone-entry guarded against transit/ritual/qt states.
- **Gaps found:** (1) Release ceremony has no initial focus move, focus trap, or focus restore. (2) Quick Travel dropdown doesn't move focus on open (rows are next in DOM order, so Tab reaches them — acceptable but unmanaged). (3) Mood row lacks toggle state semantics (`aria-pressed`). (4) Pond koi info panel is not closable with Esc (✕ only).

## Runtime / Console Error Risks

- Every signed-out route loaded with zero console/page errors and zero failed requests; dead Supabase produces **no** noise on plain page loads (session read is local).
- `garden3d.ts` registers `keydown`/`wheel` (`passive:false`) with `preventDefault` — arrow/space page-scroll hijack handled; disposal in the engine-lifecycle effect; SSR-safe (window/document only inside methods); `ssr:false` dynamic import.
- Auth store relies on supabase-js returning `{ error }` (it wraps network failures internally as retryable errors) — confirmed live: no unhandled rejection, message surfaces in UI. Dev overlay shows supabase's internal `console.error` ("Failed to fetch") — environmental.
- `useReveal` cannot strand cards invisible (IO-unsupported guard returns before hiding).
- localStorage caches (`garden-meta`, `garden-colors`, mood) wrapped in try/catch.

## Bundle Findings

- three.js lives in **one async chunk**: `static/chunks/12~lxcf6ubrk5.js` — **776 KB raw / 196 KB gzip**. It is referenced only by the garden loadable wrapper (`00wqithjwcmtx.js`, 4 KB) and `server/app/garden/page/react-loadable-manifest.json`.
- It appears in **no page's initial `<script>` set — including `/garden`'s** (loaded on demand post-hydration via the `dynamic(..., { ssr:false })` import). `/login`, `/`, `/browse` prerendered HTML confirmed free of it.
- Shared chunks paid by all routes: ~950 KB raw total (largest: 224 KB gzip 59 KB, 224 KB gzip 69 KB, 136 KB gzip 36 KB) — framework/app code, no three leak. **No flag.**
- Note: Turbopack `next build` no longer prints per-route first-load JS; numbers above measured from `.next` chunk analysis.

## Recommended Fixes

1. Restore focus to the hamburger button when the mobile drawer closes (`src/components/navbar.tsx` — keep a ref to the trigger, focus it in the close path).
2. Add `role="alert"` (or `aria-live="polite"`) to the auth error box (`src/components/auth-form.tsx:154`).
3. Release ceremony: move focus to the dialog on open, trap Tab, restore on close (`src/components/garden/release-ceremony.tsx`).
4. Add `autocomplete="email"` and `autocomplete="current-password"`/`"new-password"` to auth inputs.
5. Let the pond koi info panel close on Esc; add `aria-pressed` to the Quick Travel mood row.
6. Optional polish: gate the landing GSAP timeline on `matchMedia("(prefers-reduced-motion: reduce)")`; consider harmonizing the navbar "Sign Up" red with the moss palette on moss routes to soften the landing→auth seam.

## Final Status

**Pass with warnings** — build/lint/routing/forms/responsive/reduced-motion all pass; bundle isolation confirmed; findings are low/medium a11y polish items. Authenticated garden flows remain unverified live (dead Supabase) — code review found no blockers there, but a live pass is recommended once a Supabase instance is restored.

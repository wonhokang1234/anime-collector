# Phase 9 QA Report

## Overall Status: PASS WITH NOTES

---

## Build Health

**TypeScript (`npx tsc --noEmit`):** Zero errors. Clean exit.

**Production build (`npm run build`):** Success. All 10 routes compiled and generated correctly (Next.js 16.2.3, Turbopack). No errors or warnings.

**Lint (`npm run lint`):** 3 errors, 1 warning — all pre-existing, none introduced by Phase 9.

| File                                           | Issue                                                        | Status                                    |
| ---------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| `src/app/card/[mal_id]/page.tsx:78`            | `react-hooks/set-state-in-effect` on `setJikanLoading(true)` | Pre-existing (known)                      |
| `src/components/shelf/favorites-scene.tsx:185` | `react-hooks/set-state-in-effect` on `setFeaturedIds`        | Pre-existing (known)                      |
| `src/hooks/use-media-query.ts:10`              | `react-hooks/set-state-in-effect` on `setMatches`            | Pre-existing (known)                      |
| `src/lib/supabase/middleware.ts:18`            | `@typescript-eslint/no-unused-vars` on `options`             | Pre-existing Supabase boilerplate pattern |

No new lint errors introduced by Phase 9.

---

## P1 Issues (must fix before ship)

None.

---

## P2 Issues (should fix)

**P2-1 — `src/lib/supabase/middleware.ts` line 18 — unused `options` destructure.**
The `setAll` implementation's first `forEach` destructures `options` but only calls `request.cookies.set(name, value)` without it. Pre-existing lint warning. Fix: change `{ name, value, options }` to `{ name, value }` to silence cleanly.

**P2-2 — `src/components/shelf/poster-card.tsx` line 446 — raw Tailwind color classes on context menu trigger button.**
The button still uses `bg-zinc-950/80`, `text-zinc-200`, `hover:bg-zinc-900`. Pre-existing from Phase 8; the `h-11 w-11` fix is correctly applied, but color classes remain outside the design token system.

---

## P3 Issues (nice to have)

**P3-1 — Auth pages do not directly render `karuta-mark.svg`.**
`login/page.tsx` and `signup/page.tsx` delegate to `AuthForm`, which renders a `HankoSeal` (Japanese character seal), not the SVG mark. The mark is present in the navbar (desktop + mobile drawer). If the intent is for the SVG mark to appear on auth pages specifically, it is not there. Current behavior may be intentional per design.

---

## Passed Checks

**StatCell component (`src/app/card/[mal_id]/page.tsx`):**

- `mono?: boolean` prop with `mono = false` default — confirmed correct
- `fontFamily: mono ? "var(--font-mono)" : undefined` — falsy branch returns `undefined` (not `""` or `"undefined"`)
- Score call: passes `mono` — confirmed
- Episodes call: passes `mono` — confirmed
- Year call: passes `mono` — confirmed
- Studio call: omits `mono` (intentionally uses default font) — confirmed
- StatCell label `<div>` uses sibling (not nested) layout — not affected by `fontFamily` on value div
- Loading skeleton path renders `skeleton-line` span independently of `mono` prop — unaffected

**User flows:**

- Auth redirect (`if (!authLoading && !user) router.push("/login")`) — present and correct
- Collect button / "In Collection" toggle — calls `useCollectionStore` actions correctly
- Episode stepper `+`/`−` buttons — `aria-label` present, 44×44px, auto-advance logic intact
- Category pills — `aria-pressed`, `minHeight: "44px"`, `watchedPillRef` assigned for GSAP flash
- Remove confirmation pair (Yes/No) — `confirmRemove` state, calls `remove(itemId)` then `router.push("/collection")`
- GSAP animations — all 5 refs present (`cardRef`, `labelRef`, `titleRef`, `glowRef`, `watchedPillRef`), all timelines have `tl.kill()` cleanup

**Responsive layout:**

- Two-zone layout stacks correctly on mobile (`flex-col` default)
- Stat cells: `grid grid-cols-2 gap-4 sm:flex sm:items-center sm:justify-center sm:gap-6`
- Category pills: `grid grid-cols-2 gap-2 sm:flex sm:flex-wrap`
- No overflow risk from Geist Mono font — short numeric strings ("7.42", "24", "2021") in `text-center` container

**Accessibility:**

- `fontFamily` inline style is visual-only — no screen reader impact
- No `aria-*` attributes removed or modified
- Episode stepper `aria-label` on both buttons — confirmed
- Progress bar: `role="progressbar"`, `aria-valuenow/min/max/label` — intact
- Mobile drawer: `role="dialog"`, `aria-modal`, focus trap, Escape handler, `inert` when closed — all present in `navbar.tsx`

**Final success criteria:**

- Zero "ANIME COLLECTOR" text anywhere in `src/` — confirmed
- `manga-spine.tsx` does not exist — confirmed
- `SpineTone` exported from `src/lib/types.ts` — confirmed
- `MotionProvider` in `layout.tsx` — confirmed
- `ErrorBoundary` wrapping `PageTransition` in `layout.tsx` — confirmed
- `Toast` rendered in `layout.tsx` — confirmed
- `karuta-mark.svg` in `navbar.tsx` (desktop + mobile drawer) — confirmed
- All 4 fonts registered in `layout.tsx` as CSS variables — confirmed
- `var(--font-mono)` defined in `globals.css` as `var(--font-geist-mono)` — Phase 9 `fontFamily` resolves correctly at runtime

**Visual polish:**

- Score, Episodes, Year values render in Geist Mono — tabular, numeric, distinct from Studio name
- StatCell label (`text-[8px] uppercase tracking-[0.15em]`) is a sibling element — unaffected by value div's `fontFamily`
- `section-header.tsx` heading uses `.display-title` class → `var(--font-cinzel)` — confirmed Cinzel
- `poster-card.tsx` context menu trigger: `h-11 w-11` (Phase 8 fix) intact; dropdown uses design tokens

---

## Recommended Fixes

1. **P2-1** — `src/lib/supabase/middleware.ts:18`: Remove unused `options` from first `forEach` destructure
2. **P2-2** — `src/components/shelf/poster-card.tsx:446`: Replace raw zinc Tailwind classes on context menu trigger with design token `style` props
3. **P3-1** — Consider adding `<Image src="/karuta-mark.svg" />` to `AuthForm` above the `HankoSeal` if SVG mark on auth pages is a hard requirement

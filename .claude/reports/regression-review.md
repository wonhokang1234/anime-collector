# Regression Review — Task 4: Dealer's Choice (Browse Page ScatterCard + Deal-In Revamp)

## Summary

Task 4 modifies one file: `src/app/browse/page.tsx`. Changes include adding a `washi-surface` texture overlay, replacing the GSAP stagger animation with a directional `forEach` deal-in, and wrapping each `AnimeCard` in a new `ScatterCard` component with a flex-wrap grid replacing the CSS Grid layout.

The build passes cleanly. TypeScript has no errors. No lint errors were introduced in the browse page. The core functionality — API fetching, search, debounce, collect ceremony, auth redirect, error/loading states — is entirely intact. One confirmed visual interaction bug exists between GSAP's `clearProps` and the `scatter-card` CSS transition. One mobile density regression on small screens (375px) is present. Neither is a functionality break, but both are noticeable.

**Overall verdict: Pass with notes.** Task 5 can proceed, but the two issues below should be tracked for a follow-up fix.

---

## Changed Files

| File                      | Purpose                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `src/app/browse/page.tsx` | Browse page — imports, GSAP deal-in animation, grid container class, ScatterCard wrapping |

Supporting files read (not modified in Task 4):

- `src/components/scatter-card.tsx` — new wrapper component added in Task 1
- `src/lib/scatter.ts` — deterministic PRNG for scatter transforms (Task 1)
- `src/lib/motion.ts` — SCATTER and EASE constants (Task 1)
- `src/app/globals.css` — `.washi-surface`, `.scatter-card` CSS rules

---

## Functionality Regression Risks

### GSAP target elements — No regression

`gridRef.current.children` now returns `ScatterCard` wrapper divs instead of bare `AnimeCard` root elements. GSAP animates the wrapper divs using `opacity`, `x`, and `y`. This works correctly because the visual card is fully inside the wrapper. The animation effect on the outer container is visually equivalent to animating the card itself for opacity and positional entrance.

### DURATION removed from import — No regression

`DURATION` was used only in the old `stagger.amount` computation. After Task 4, `DURATION` is not referenced anywhere in `browse/page.tsx`. The import was correctly replaced with `SCATTER`. Confirmed by grep: zero remaining usages.

### SCATTER export exists — Confirmed clean

`src/lib/motion.ts` exports `SCATTER` with `dealIn: 0.35`, `dealInStagger: 0.055`, `dealInMaxDelay: 0.75`. The browse page consumes all three constants correctly.

### forEach vs stagger timing — Behavioral change, not a regression

Old: one `gsap.fromTo(cards, from, {stagger: {each: 0.08, amount: 0.96}})` call, duration 0.3s per card.
New: N individual `gsap.fromTo` calls per card with `delay: Math.min(i * 0.055, 0.75)`, duration 0.35s per card.

The new timing is tighter (stagger cap at card 14 of 25 vs the old system spreading across all 25). The directional from-edge animation is a deliberate design improvement. The timing change is intentional, not accidental.

### collect ceremony / isJustCollected — No regression

`justCollectedId` state and the `isJustCollected` prop are passed directly to `AnimeCard` inside `ScatterCard`. `ScatterCard` is a transparent wrapper with no event or prop interception. The collect ceremony fires correctly.

### Loading/error state gating — No regression

The GSAP effect guard `if (loading || !gridRef.current) return` is unchanged. The effect depends on `[loading]`. The effect fires after React commits the DOM, so `gridRef.current.children` reflects the freshly-rendered `ScatterCard` elements when `loading` transitions to `false`. No stale children risk.

### API/data flow, debounced search, pagination — No regression

The `handleSearch`, `getTopAnime`, `searchAnime` calls, `setResults`, `setLoading`, `setError` wiring is entirely unchanged. The grid container switch from CSS Grid to flex-wrap does not affect data fetching, result count, or the debounce behavior.

---

## Business Logic Risks

None identified. All business logic (collect, auth redirect, toast notification, rarity tier calculation) is untouched.

---

## UI / UX Issues

### Issue 1 — Double animation: deal-in followed by scatter-settle (Confirmed)

**Severity: Medium**

After GSAP animates a `ScatterCard` wrapper with `x`/`y` properties, it sets an inline `transform: translate(...)` on the element. This inline style overrides the `scatter-card` CSS rule's `transform: rotate(var(--scatter-rotation)) translate(var(--scatter-x), var(--scatter-y))`. When the animation completes and `clearProps: "opacity,x,y"` fires, GSAP removes the inline transform. The browser then re-applies the CSS class transform (the scatter rotation and jitter). Because `scatter-card` has `transition: transform 250ms cubic-bezier(0.25, 0, 0.35, 1)`, each card visibly rotates and shifts from `(0deg, 0px, 0px)` into its scatter position after landing.

Result: every page load produces a two-phase motion — the directional fly-in (0.35s), then a secondary settle-into-scatter (250ms). This was not present before Task 4 and produces a stroboscopic effect on large grids.

Possible fixes (pick one):

- During the deal-in `forEach`, temporarily disable the CSS transition by adding an inline `transition: none` to each element before the tween, then restore it in an `onComplete` callback.
- Remove `clearProps` entirely. GSAP's final state `{x:0, y:0}` stays as inline style, suppressing the CSS scatter transform permanently. The hover reset on `.scatter-card:hover` still fires because hover adds `rotate(0deg) translate(0px, 0px)` which already matches the post-animation state.
- Incorporate the scatter rotation into GSAP's `from` state so the full motion (fly-in + settle) is one coordinated tween.

### Issue 2 — Mobile card density: 375px screens show 1 card per row instead of 2

**Severity: Low**

Old layout: `grid grid-cols-2` guaranteed 2 cards per row on all mobile viewports regardless of card width.

New layout: `flex-wrap justify-center` with compact `AnimeCard` at `maxWidth: 180px` and `gap-4 (16px)`. On a 375px viewport with `px-4` (32px total padding), the usable width is 343px. Two 180px cards require 376px (180 + 16 + 180). Result: only 1 card per row on 375px-wide devices (iPhone SE, older iPhones). On 414px+ devices, 2 cards fit.

The scatter aesthetic works better with fixed-width cards than a stretching grid. This is a justified design trade-off. However, the regression from 2 columns to 1 column on small phones should be noted and a decision made.

Possible fix: reduce compact card width from 180 to 160, or use `min-width: 150px; max-width: 180px` on the ScatterCard wrapper.

### Issue 3 — Last-row orphan centering

**Severity: Low (design choice)**

`justify-center` on the flex container means a partial last row (e.g., 1 card if 25 results fill 4 full rows of 6) is centered. The old CSS Grid left-aligned partial rows. For a scatter layout, centered orphans look more natural. This is not a regression — it is a deliberate aesthetic change. No action required unless product decides otherwise.

---

## Accessibility Issues

### Grid semantics removed — Pre-existing gap, not introduced by Task 4

The old CSS Grid container had no explicit ARIA role. The new flex container also has none. Neither version uses `role="grid"` or `role="list"`. This is not a new regression — no semantic list/grid ARIA existed before Task 4.

### ScatterCard wrapper is a plain div — No issue

`ScatterCard` renders a `<div class="scatter-card">` wrapping the `AnimeCard`. No `aria-*` attributes on `AnimeCard` reference the parent by ID, so nesting an extra div does not break any ARIA relationships. `AnimeCard`'s internal buttons and focus management are unaffected.

---

## Performance Issues

### 25 individual GSAP tweens vs 1 staggered tween — Not a concern

GSAP's stagger implementation creates separate tweens internally. 25 individual `gsap.fromTo` calls versus one staggered batch call produces negligible overhead for this card count. GSAP handles thousands of tweens smoothly. No performance risk.

### Flex-wrap layout recalculation vs CSS Grid — Not a concern

`AnimeCard` has a fixed `maxWidth` (180px or 280px) and fixed `aspectRatio`. Cards are fixed-size in the flex context. Flex-wrap with fixed-size items is computationally equivalent to CSS Grid for layout recalculation purposes. No elevated layout thrashing risk.

### washi-surface pseudo-element is `position: fixed` — Not a concern

The `::before` pseudo-element uses `position: fixed` with `pointer-events: none`. It is composited by the browser as a separate layer and does not participate in layout calculations. The SVG noise pattern is small (300x300px, repeated). No paint or compositing cost concern.

---

## Dependency Issues

No new dependencies introduced in Task 4. `gsap` (already present), `@/components/scatter-card` (added in Task 1), and `@/lib/motion` (added in Task 1) are the only additions relative to the prior state.

---

## Code Maintainability Issues

### `malId ?? 0` null guard is dead code

`JikanAnime.mal_id` is typed as `number` (not `number | null | undefined`) in `src/lib/jikan.ts`. The `?? 0` fallback on line 362 is unreachable at runtime. Not harmful, but it signals confusion about the type. Can be simplified to `malId={anime.mal_id}`.

### No tween cleanup on unmount or re-search

When the browse page unmounts or a new search fires while the deal-in animation is still running, the existing tweens continue in the background. This is the same behavior as the old code — not a regression. A `useEffect` return that calls `gsap.killTweensOf(cards)` would be cleaner but is out of scope for this review.

---

## Required Fixes

None that block Task 5. The two issues below are real but both visual and non-breaking.

1. **Double animation (deal-in + scatter-settle)** — should be fixed before final QA. The easiest fix is adding an `onComplete` callback to each tween that restores the scatter CSS transition, suppressed for the duration of the deal-in. Alternatively, remove `clearProps` entirely so GSAP holds `{x:0, y:0}` and the CSS scatter never fires post-animation.

2. **375px mobile density regression** — should be evaluated against product priority. If small-phone support matters, reduce compact card width or add a min-width constraint to the ScatterCard wrapper.

---

## Optional Polish Suggestions

- Remove the dead `?? 0` on `malId={anime.mal_id ?? 0}` for cleaner code.
- Add `gsap.killTweensOf` cleanup in the `useEffect` return to avoid ghost tweens on fast navigation.
- Consider `role="list"` + `role="listitem"` on the grid container and `ScatterCard` wrapper for screen reader card enumeration — this was absent before Task 4 but would be a welcome addition.

---

## Commands Run

```
git diff HEAD~1 -- src/app/browse/page.tsx
npm run build     -> PASS (clean build, all 10 routes compiled)
npm run lint      -> 5 pre-existing errors in other files; 0 errors in browse/page.tsx
npx tsc --noEmit  -> PASS (no type errors)
```

Build output:

```
Route (app)
 /browse  (static)
 /card/[mal_id]  (dynamic)
 /collection  (static)
 /login  (static)
 /shelf  (static)
 /signup  (static)
```

Lint errors are pre-existing in `card/[mal_id]/page.tsx`, `shelf/favorites-scene.tsx`, and `hooks/use-media-query.ts` — none are introduced by Task 4.

---

## Approval Status

**Pass with notes**

Task 5 may proceed. Two visual issues (double animation on deal-in, 375px mobile density) should be tracked and resolved before final QA sign-off.

# Frontend QA Report

## Task 5 — Dealer's Choice Visual Revamp

Date: 2026-05-18
Scope: Search underline draw animation, filter recede effect, activeQuery state, compact card dimensions, SkeletonGrid flex-wrap alignment

---

## Commands Run

| Command                          | Result                                          |
| -------------------------------- | ----------------------------------------------- |
| `npm run build`                  | Pass — all 10 pages compile, no errors          |
| `npx tsc --noEmit`               | Pass — 0 type errors                            |
| `npx eslint src/ --ext .tsx,.ts` | 3 errors (pre-existing, not Task 5), 2 warnings |

---

## Main User Flows Checked

1. Landing page (`/`) — hero animation, CTA routing, auth-aware redirect
2. Auth forms — login/signup, field labels, error shake, redirect on success
3. Browse page — initial load, skeleton display, deal-in animation, search input, filter recede, collect button, toast
4. Collection page — loading skeleton, filter pills, sort dropdown, card grid, empty state
5. Card detail page — loading state, category picker, remove confirm
6. Shelf page — DnD drag-and-drop, scene tabs, favorites reveal
7. Mobile nav drawer — open/close, Escape key, focus trap, sign out

---

## Passing Areas

- **Build and TypeScript**: Zero errors. All 10 routes compile cleanly.
- **Search underline draw animation**: `.search-underline-wrap::after` correctly uses `scaleX(0)` to `scaleX(1)` on `:focus-within`. The fix to move `background` and `border` from inline `style` to `.search-underline-input` is confirmed — the inline `style` prop on the search input contains only layout properties (`paddingBlock`, `paddingInlineStart`, `paddingInlineEnd`, `borderRadius`, `color`, `fontFamily`, `fontSize`), no `background` or `border`. The `.search-underline-input:focus` rule can now override both correctly.
- **Filter recede GSAP**: Both `gsap.to` calls have `overwrite: "auto"`. Logic is correct. `clearProps: "opacity,scale"` on restore is scoped tightly and will not clobber `box-shadow` or other card-edge styles.
- **activeQuery state tracking**: Live (non-debounced) via `setActiveQuery(e.target.value)` in the `onChange` handler alongside `handleSearch`. Confirmed independent of the 500ms debounce. Clear button calls both `handleSearch("")` and `setActiveQuery("")`.
- **GSAP animation sequencing (deal-in vs recede)**: No conflict found. The filter recede effect fires on `activeQuery` change. After a search completes: `loading` transitions to `false`, triggering deal-in on newly mounted cards. At that point `activeQuery` has not changed (it was already set when the user typed), so recede does not re-fire on the fresh cards. New cards enter at full opacity from deal-in.
- **Clear-search path**: When query is cleared, `setLoading(true)` fires immediately (non-debounced), unmounting the grid. `gridRef.current` is null when the recede restore effect fires, so the restore is a no-op. New cards arrive through deal-in at full opacity.
- **Compact card dimensions**: `cardWidth = 155`, `cardHeight = 224` for `isCompact`. SkeletonGrid matches at `w = 155`, `h = 224`. Dimensions are consistent between cards and skeleton.
- **SkeletonGrid flex-wrap alignment**: Uses identical classes to the card grid: `flex flex-wrap gap-4 sm:gap-6 justify-center px-1`. No layout jump risk from dimension mismatch.
- **MotionProvider reduced motion**: Sets `gsap.globalTimeline.timeScale(100)` when `prefers-reduced-motion` is active, effectively skipping all GSAP animations globally. The `@media (prefers-reduced-motion: reduce)` block in globals.css also disables CSS animations/transitions. Dual coverage.
- **Mobile nav drawer**: Escape key closes, Tab key cycles within focus trap, body scroll lock applied. `aria-modal`, `role="dialog"`, `aria-label` all present. `inert` attribute used to suppress background elements.
- **Auth forms**: `htmlFor`/`id` associations correct for email and password. Error state uses red-tinted panel. GSAP shake on error is scoped and cleaned up.
- **Toast system**: `aria-live="polite"` on container, GSAP in/out animations, dismiss button has `aria-label`. Positioned fixed at bottom-right on desktop, full-width on mobile.
- **Empty states**: EmptyState component renders with icon, title, description, optional action button. GSAP fade-in on mount. Used consistently across browse error, browse empty, collection empty, error boundary fallbacks.
- **Error boundary**: Wraps card grid on browse and collection with a designed `EmptyState` fallback instead of a raw crash.
- **Page transitions**: `clipPath` wipe with `clearProps: "all"` and transform cleanup on complete/interrupt prevents stacking context issues with `position: fixed` descendants.

---

## Failing Areas

### 1. `rarity-badge` CSS class naming mismatch — silent visual defect

**File**: `/Users/wonhokang/anime-collector/src/components/card/anime-card.tsx` lines 251 and 322

Pattern used in AnimeCard:

```
rarity-badge rarity-badge-${rarity}   // single hyphen (e.g. rarity-badge-common)
```

Pattern defined in globals.css (lines 863–887):

```css
.rarity-badge--common   /* double hyphen BEM */
.rarity-badge--epic
```

The `RarityBadge` component uses the correct `rarity-badge--${tier}` double-hyphen form. `AnimeCard` uses `rarity-badge-${rarity}` (single hyphen). No CSS rule matches the single-hyphen form. The base `.rarity-badge` styles apply but the per-tier color, background, and glow are all missing on the badge in both the card front-face and back-face info bars.

**Visual impact**: Rarity badges on all flippable browse cards are unstyled — no background tint, no border-color, no tier-specific text color.

---

### 2. `ghost-btn`, `hanko-btn`, `ambient-lantern` — undefined CSS classes

**Files**:

- `/Users/wonhokang/anime-collector/src/components/navbar.tsx` — uses `ghost-btn` and `hanko-btn` on desktop logged-out CTAs (lines 167, 177) and in the mobile drawer (lines 329, 336)
- `/Users/wonhokang/anime-collector/src/app/login/page.tsx` line 9 — uses `ambient-lantern`
- `/Users/wonhokang/anime-collector/src/app/signup/page.tsx` line 9 — uses `ambient-lantern`

None of these classes are defined in any CSS file in the project. The `ghost-btn` and `hanko-btn` login/signup CTAs will render with no border, no padding, and no background — visually broken for all logged-out users. The `ambient-lantern` span is decorative and produces no effect (low severity).

---

### 3. GSAP deal-in animation overwrites scatter transform — scatter layout broken on load

**File**: `/Users/wonhokang/anime-collector/src/app/browse/page.tsx` lines 64–80

The deal-in animation uses `gsap.fromTo(el, { x: ..., y: ... }, { x: 0, y: 0, ... })`. GSAP writes `transform: matrix(...)` as an inline style on each `ScatterCard` element. Inline styles override the `.scatter-card` CSS class rule which sets `transform: rotate(var(--scatter-rotation)) translate(var(--scatter-x), var(--scatter-y))`. After the deal-in completes, GSAP's inline `transform: matrix(1,0,0,1,0,0)` (identity) persists as an inline style and wins over the CSS class. Every card ends up with 0 rotation and 0 offset — the scatter layout is silently overridden to a flat grid after the entrance animation completes.

---

## Responsive / Mobile Risks

### 2-column layout at 375px — passes math

At 375px viewport: page padding `px-4` (32px) + grid padding `px-1` (8px) = 40px total margin. Available width: 335px. Two compact cards (155px) + `gap-4` (16px) = 326px. 9px to spare. At 419px: 48px margin = 379px available, comfortable. No overflow risk.

### SSR/hydration flash on mobile — minor

`useMediaQuery` initializes to `false` (not mobile) on the server. On client mount the hook updates to `true` for mobile viewports. SkeletonGrid initially renders at 280x420 (desktop size), then re-renders at 155x224 (compact). This produces a brief layout reflow during the skeleton phase on mobile devices.

### Clear button touch target — small

The search clear button is `h-5 w-5` (20x20px). WCAG recommends 44px minimum. The button is accessible via keyboard but difficult to tap precisely on touch screens.

### Sticky search bar z-index — passes

`sticky z-40` at `top: var(--navbar-height)` sits below the navbar (`z-50`). No overlap or z-index conflict. Background fills with `var(--bg-page)` to mask scrolling content.

### Scatter layout mobile behavior — no clipping risk

ScatterCard rotations are within ±6deg, translations within ±10px. The grid has no `overflow: hidden`. Cards are not clipped. Scatter resets on hover/focus-within for readability.

---

## Visual Polish Issues

- **Rarity badge tier colors absent on browse cards** (see Failing Areas #1): All cards show plain unstyled badges. Epic cards do not glow purple, rare cards do not show blue tint.
- **Scatter layout lost after deal-in** (see Failing Areas #3): Cards animate in with scatter, then snap to a flat grid. The animated layout does not persist.
- **Navbar dead imports**: `gsap` and `EASE` are imported in `/Users/wonhokang/anime-collector/src/components/navbar.tsx` (lines 8–9) but never used. Signals incomplete prior implementation.
- **`btn-primary` and `btn-ghost` have no `:focus-visible` styles**: Keyboard users tabbing through collect buttons or CTA links see the browser's default focus ring (or none), inconsistent with `destructive-btn` and `icon-btn` which define explicit `focus-visible` outlines.

---

## Accessibility Risks

### Search input has no label

`/Users/wonhokang/anime-collector/src/app/browse/page.tsx` line 279. The `<input type="text">` has no `id`, no `<label>`, and no `aria-label`. The `placeholder` attribute is the only text but it disappears on input and is not consistently exposed to screen readers.

### `btn-primary` and `btn-ghost` missing `:focus-visible` outline

The most-used interactive elements across the app (Collect buttons, CTA buttons, empty state action buttons) have no defined keyboard focus style. WCAG 2.4.11 risk.

### `icon-btn:focus-visible` uses low-contrast cream outline

`globals.css` line 267: `outline: 2px solid var(--washi)` where `--washi = #f4e4c0`. Against `--bg-card: #ffffff` the contrast ratio is approximately 1.5:1. This affects the toast dismiss button. The `--accent` color (`#c41e3a`) provides high contrast.

### Mobile drawer — focus not restored on close

When the drawer closes, focus should return to the hamburger button that opened it. The current implementation does not explicitly restore focus, risking focus loss.

### Reduced motion — GSAP accelerates instead of disabling

`MotionProvider` sets `timeScale(100)`, making animations play 100x faster rather than skipping them. Technically compliant but may still cause brief perceived motion for motion-sensitive users. Fully disabling with `timeScale(0)` and `duration: 0` is more robust.

---

## Runtime / Console Error Risks

- **`ghost-btn`/`hanko-btn`**: No runtime errors, but elements render with no styles. Silent visual failure.
- **`clearProps: "opacity,scale"`** in filter recede restore: Correctly scoped. Will not affect `box-shadow` or `border` styles on cards.
- **`useMediaQuery` hydration mismatch**: Not a hard error under Next.js client component mode, but causes observable layout reflow on mobile.
- **GSAP inline transform vs CSS class conflict**: After deal-in, GSAP leaves `transform: matrix(1,0,0,1,0,0)` inline on ScatterCard wrappers, permanently overriding the CSS scatter rotation. No console error, purely visual.

---

## Recommended Fixes

**Priority 1 — Broken**

1. `/Users/wonhokang/anime-collector/src/components/card/anime-card.tsx` lines 251 and 322: Change `rarity-badge-${rarity}` to `rarity-badge--${rarity}`.

2. `/Users/wonhokang/anime-collector/src/app/globals.css`: Add `.ghost-btn` and `.hanko-btn` definitions, or in `/Users/wonhokang/anime-collector/src/components/navbar.tsx` replace `ghost-btn` with `btn-ghost` and `hanko-btn` with `btn-primary` (already defined). Add `.ambient-lantern` decorative glow if desired.

3. `/Users/wonhokang/anime-collector/src/app/browse/page.tsx` deal-in effect: Add `clearProps: "transform"` in the tween's `onComplete` callback so GSAP's inline transform is removed after animation, allowing the CSS scatter rotation to resume. Example:
   ```js
   gsap.fromTo(el, { opacity: 0, x: ..., y: ... }, {
     opacity: 1, x: 0, y: 0,
     duration: SCATTER.dealIn,
     delay: ...,
     ease: EASE.emphasized,
     onComplete: () => gsap.set(el, { clearProps: "transform" }),
   });
   ```

**Priority 2 — Accessibility**

4. Add `aria-label="Search anime"` to the search `<input>` in `/Users/wonhokang/anime-collector/src/app/browse/page.tsx`.

5. Add `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` to `.btn-primary` and `.btn-ghost` in `/Users/wonhokang/anime-collector/src/app/globals.css`.

6. Increase the clear button touch target in `/Users/wonhokang/anime-collector/src/app/browse/page.tsx` from `h-5 w-5` to `h-8 w-8` (or pad with `p-2`).

7. Replace `var(--washi)` with `var(--accent)` in `.icon-btn:focus-visible` in `/Users/wonhokang/anime-collector/src/app/globals.css` line 267.

8. Add `openButtonRef` in `/Users/wonhokang/anime-collector/src/components/navbar.tsx` and call `.focus()` on it when the drawer closes.

**Priority 3 — Minor**

9. Remove unused `gsap` and `EASE` imports from `/Users/wonhokang/anime-collector/src/components/navbar.tsx` lines 8–9.

10. Replace `useMediaQuery` initialization with `useSyncExternalStore` or read `window.matchMedia` in a single `useEffect` pass to avoid the SSR skeleton size flash on mobile.

---

## Final Status

**Fail**

Build passes and TypeScript is clean. The three Task 5 features that were specifically fixed before this QA run (search underline CSS precedence, `overwrite: "auto"` on GSAP tweens, activeQuery independence from debounce) are all correctly implemented. However three separate defects prevent a pass:

1. `rarity-badge` single-vs-double-hyphen mismatch makes tier styling absent on all browse card badges.
2. `ghost-btn`/`hanko-btn` undefined CSS classes leave the logged-out navbar CTAs visually broken.
3. GSAP deal-in inline transform silently overrides the CSS scatter rotation on every initial browse page load, so the scatter layout dissolves after the entrance animation.

These are concrete, reproducible visual regressions visible to any user. Fix items 1–3 from Recommended Fixes and re-run.

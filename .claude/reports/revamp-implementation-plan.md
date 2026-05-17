# Karuta — Frontend Revamp Implementation Plan (Editorial Redesign)

**Based on:** product-design-research.md, new-visual-direction.md, motion-direction.md, refactor-plan.md
**Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, GSAP 3, Zustand, Supabase, @dnd-kit

---

## How to Use This Plan

- Implement one phase at a time
- After each phase: run regression review → apply fixes → run QA → apply fixes → next phase
- Never touch business logic, stores, API calls, or auth
- All design decisions are in `new-visual-direction.md` — implementation agents follow it exactly
- All motion decisions are in `motion-direction.md`
- All file-level changes are in `refactor-plan.md`

---

## Phase 1 — Token & Font Foundation

**Goal:** Replace the entire dark token system with the light editorial tokens. Switch fonts. Nothing visual should look correct yet — this phase is purely the CSS/font infrastructure.

### Files to Change

**`src/app/globals.css`**

- Delete all `--ink-*`, `--washi*`, `--sumi`, `--hanko-bright`, `--lantern-glow` tokens
- Delete all old `--bg-*`, `--border-*` tokens
- Delete all `--rarity-*-glow`, `--rarity-legendary-holo` tokens
- Delete `@keyframes rarity-pulse`, `@keyframes legendary-shimmer`, any looping rarity keyframes
- Delete `.dark` class references
- Delete `.washi-pill`, `.washi-pill--active`, `.washi-pill--rarity-*`
- Delete `.hanko-btn`, `.ghost-btn` (rebuild fresh)
- Delete `.ambient-lantern`, `.shelf-glow`, `.section-glow`
- Delete `.display-title` (will redefine)
- Delete old skeleton shimmer keyframes
- Add the full new `:root` block from `refactor-plan.md` Phase 1
- Add new utility classes: `.btn-primary`, `.btn-ghost`, `.filter-pill`, `.filter-pill--active`, `.hairline`, `.skeleton-block`, `.skeleton-line`, `@keyframes skeleton-pulse`
- Add `@media (prefers-reduced-motion)` rule for skeleton
- Add **film grain overlay** via `body::after` pseudo-element (SVG `feTurbulence`, `opacity: 0.04`, 200px tiled, `pointer-events: none`, `z-index: 9999`) — exact CSS in `new-visual-direction.md` section 14.1
- Add **hairline glow** to `.hairline`: `box-shadow: 0 0 6px 0px rgba(196, 30, 58, 0.10)`
- Add **legendary foil** `@keyframes foil-rotate` and `.rarity-legendary::after` rule — exact CSS in `new-visual-direction.md` section 14.6
- Add **epic shimmer** `.rarity-epic::after` rule — exact CSS in `new-visual-direction.md` section 14.6

**`src/app/layout.tsx`**

- Remove `Cinzel`, `Noto_Serif_JP`, `Geist` (sans) imports from `next/font/google`
- Add `Cormorant_Garamond` (weights: 300, 500, styles: normal + italic) and `Inter` (weights: 400, 500, 600)
- Keep `Geist_Mono`
- Update `<html>` className: use new font variables, remove `dark` class
- Update `<body>`: `style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}`
- Update `@theme inline` in globals.css: `--font-display: var(--font-cormorant)`, `--font-sans: var(--font-inter)`

**`src/lib/motion.ts`**

- Replace entire file with new DURATION and EASE constants from `motion-direction.md`

### Checks

- `npx tsc --noEmit` — zero errors
- `npm run build` — confirm fonts load, no missing variable errors
- App will look broken (cream bg, no dark surfaces) — that is expected

---

## Phase 2 — Navbar & Shell

**Goal:** Navbar reads cleanly on the new cream background. Remove the GSAP seal animation.

### Files to Change

**`src/components/navbar.tsx`**

- Background: `rgba(247,243,238,0.92)` with `backdrop-filter: blur(8px)`, `border-bottom: 1px solid var(--border-subtle)`
- All `var(--washi)` → `var(--text-primary)`
- All `var(--washi-dim)` → `var(--text-secondary)`
- All `var(--washi-soft)` → `var(--text-muted)`
- All `var(--hanko)` → `var(--accent)`
- Remove the GSAP `sealRef` useEffect entirely (the seal drop animation)
- Drawer background: `var(--bg-raised)`, border: `1px solid var(--border-subtle)`, shadow: `var(--shadow-modal)`
- Active nav link underline: `var(--accent)` (same hex, token rename only)
- Nav link colors: active `var(--text-primary)`, inactive `var(--text-secondary)`
- Sign out button: `color: var(--text-muted)`, hover `var(--text-primary)`
- Mobile drawer active link: `background: var(--accent-tint)`, `color: var(--accent)`
- Remove kanji kicker spans if they use `--font-jp` (Noto removed)

**`src/components/page-transition.tsx`**

- Update DURATION/EASE references to new constants
- Replace opacity fade with **clip-path curtain reveal**: `{ clipPath: "inset(0 0 100% 0)", scale: 1.03 }` → `{ clipPath: "inset(0 0 0% 0)", scale: 1 }` — `clearProps: "all"` in onComplete
- Keep `clearProps: "transform"` logic for FavoritesReveal compatibility (add alongside clip-path clear)

### Checks

- `npx tsc --noEmit`
- Navbar renders on cream background, sign in/out works, mobile drawer opens/closes

---

## Phase 3 — UI Components

**Goal:** All shared UI components match the editorial light aesthetic.

### Files to Change

**`src/components/ui/section-header.tsx`**

- Heading: `fontFamily: "var(--font-display)"`, `fontWeight: 300`, `fontStyle: "italic"`, `color: "var(--text-primary)"`
- Kicker: Inter, `fontSize: "0.6875rem"`, `letterSpacing: "0.2em"`, `textTransform: "uppercase"`, `color: "var(--text-muted)"`
- Remove kanji kicker if present
- Add hairline rule below: `<div className="hairline" style={{ marginTop: "0.75rem" }} />`

**`src/components/ui/empty-state.tsx`**

- Remove dark backgrounds, kanji icon characters
- Title: `fontFamily: "var(--font-display)"`, italic, `color: "var(--text-primary)"`
- Description: Inter, `color: "var(--text-secondary)"`
- Icon: replace kanji with a simple em-dash or leave empty — no heavy illustration
- CTA: use `.btn-ghost` class

**`src/components/ui/skeleton-grid.tsx`**

- Cards: use `.skeleton-block` class (warm pulse)
- Ensure aspect ratio 2:3 is preserved

**`src/components/ui/toast.tsx`**

- Surface: `background: "var(--bg-raised)"`, `border: "1px solid var(--border-default)"`, `boxShadow: "var(--shadow-modal)"`
- Left accent bar: 3px solid, color by type (`--status-success`, `--status-warning`, `--status-error`, `--text-secondary`)
- No colored backgrounds
- Text: `color: "var(--text-primary)"` for message, `color: "var(--text-secondary)"` for sub-text
- Update GSAP enter/exit to new DURATION.base / DURATION.fast constants

**`src/components/ui/status-pip.tsx`**

- Watching: `--accent`
- Completed: `--status-success`
- Plan: `--text-muted`
- Ring: `2px solid var(--bg-card)` (white separation)

**`src/components/ui/rarity-badge.tsx`**

- No glows
- Text color: `var(--rarity-*-border)` token per tier
- Background: transparent or `var(--bg-panel)`

**`src/components/error-boundary.tsx`**

- Update fallback EmptyState to use new light styles

### New File: `src/components/ui/rarity-dots.tsx`

Create: 5-dot cluster component. Props: `tier: RarityTier`. Filled dots use `var(--accent)`, empty dots use `var(--border-strong)`. Dots count: common=1, uncommon=2, rare=3, epic=4, legendary=5.

**`src/components/ui/section-header.tsx`** — add SplitText word reveal

- After applying heading styles, add a GSAP SplitText entrance:
  ```ts
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(SplitText);
    const split = new SplitText(headingRef.current, { type: "words" });
    gsap.from(split.words, {
      yPercent: 110,
      opacity: 0,
      duration: DURATION.slow,
      stagger: 0.06,
      ease: EASE.out,
      onComplete: () => split.revert(),
    });
    return () => split.revert();
  }, []);
  ```
- Heading element must have `overflow: hidden` on its wrapper to create the clip mask
- Attach `headingRef` via `useRef<HTMLElement>(null)` to the heading DOM node
- Import `SplitText` from `gsap/SplitText`, register only inside useEffect

### Checks

- `npx tsc --noEmit`
- Skeleton, empty states, toasts all render on cream background

---

## Phase 4 — Browse Page & AnimeCard

**Goal:** Browse grid looks editorial. Cards are white on cream with elevation hover. Tilt removed entirely.

### Files to Change

**`src/components/card/anime-card.tsx`**

- Delete: `handleMouseMove`, entire `mousemove` perspective tilt logic
- Delete: `isTouchRef`, its `useEffect`, all `.current` references
- Delete: `cardInnerRef` rotation/perspective style assignments
- Delete: `handleMouseEnter` / `handleMouseLeave` GSAP tilt logic
- Keep: flip mechanic, collect button, store interactions, fluid sizing
- Card outer: `background: "var(--bg-card)"`, `border: "1px solid var(--border-default)"`, `borderRadius: 6`, `boxShadow: "var(--shadow-card)"`
- Hover: CSS only via className — add `anime-card` class, define in globals.css with `translateY(-4px)` + `--shadow-hover`
- Info bar: `background: "rgba(247,243,238,0.95)"`, no backdrop blur
- Title: `color: "var(--text-primary)"`, Inter
- Score: `fontFamily: "var(--font-mono)"`, `color: "var(--text-secondary)"`
- Collect button: `.btn-primary` style
- Rarity: left `3px solid var(--rarity-*-border)` on card outer + `<RarityDots>` component
- Add **card spotlight** (desktop hover only, guard with `window.matchMedia("(hover: hover)")`):
  - On mount, attach `mousemove` listener to card element; on leave, reset CSS vars
  - Handler sets `--sx` and `--sy` CSS custom properties on the card element from pointer position
  - Add `anime-card::before` in globals.css: `radial-gradient(circle at var(--sx,50%) var(--sy,50%), rgba(255,255,255,0.55), transparent 65%)` with `mix-blend-mode: soft-light`, `opacity: 0` at rest → `opacity: 1` on hover (CSS transition 200ms), `pointer-events: none`
  - Kill listener in cleanup

**`src/components/card/card.css`**

- Delete entirely. Replace dark-surface card styles with inline styles in `anime-card.tsx` or globals.css additions.

**`src/app/browse/page.tsx`**

- Page background: inherits `var(--bg-page)`
- Section header: editorial zone — Cormorant italic title + hairline
- Search input: `border: "1px solid var(--border-default)"`, `background: "var(--bg-card)"`, focus ring `var(--accent)`
- Filter pills: `.filter-pill` / `.filter-pill--active`
- Grid: keep 2-col mobile / 3-col tablet / 4-col desktop

### Checks

- `npx tsc --noEmit`
- Browse renders, search works, collect button fires, no tilt on hover

---

## Phase 5 — Collection Page

**Goal:** Collection grid is editorial. Rarity reads on light backgrounds.

### Files to Change

**`src/app/collection/page.tsx`**

- Page bg: inherits cream
- Cards: `background: "var(--bg-card)"`, `border: "1px solid var(--border-default)"`, `borderRadius: 6`
- Rarity treatment: `borderLeft: "3px solid var(--rarity-*-border)"` + `<RarityDots>` at bottom
- Remove: rarity glow CSS, dark pip styles
- Status pip: use updated `StatusPip` component
- Filter pills: `.filter-pill` / `.filter-pill--active`
- Sort select: `border: "1px solid var(--border-default)"`, `background: "var(--bg-card)"`
- Section header: editorial
- Empty state: updated `EmptyState` component

### Checks

- `npx tsc --noEmit`
- Collection renders, filter/sort work, rarity tiers visually distinct on cream

---

## Phase 6 — Shelf

**Goal:** Shelf scenes are light panels. Poster cards are white. Context menu uses light tokens.

### Files to Change

**`src/app/shelf/shelf.css`**

- Delete all dark scene backdrop styles
- Keep: `.shelf-scroll` scroll snap rules, `.poster-card-snap`, `.scroll-dots`
- Update: `.scroll-dot` inactive → `var(--border-strong)`, active → `var(--accent)`

**`src/components/shelf/scene-backdrop.tsx`**

- Remove: dark gradient, lantern glow, dark colors
- New: `background: "var(--bg-panel)"`, `border: "1px solid var(--border-subtle)"`, `borderRadius: 8`
- Subtle inset shadow: `boxShadow: "inset 0 1px 3px rgba(26,22,20,0.05)"`

**`src/components/shelf/scene-tabs.tsx`**

- Tab bar: `background: "var(--bg-card)"`, `borderBottom: "1px solid var(--border-subtle)"`
- Active: `color: "var(--accent)"`, `boxShadow: "inset 0 -2px 0 var(--accent)"`
- Inactive: `color: "var(--text-secondary)"`
- Badge: `background: "var(--accent-tint)"`, `color: "var(--accent)"`
- Update GSAP stagger to `each: 0.035`, `EASE.out`, `DURATION.base`

**`src/components/shelf/scene.tsx`**

- Update stagger: `each: 0.035`
- Update EASE/DURATION references to new constants
- Keep `clearProps: "opacity,transform"`

**`src/components/shelf/poster-card.tsx`**

- Card: `background: "var(--bg-card)"`, `border: "1px solid var(--border-default)"`
- Watched overlay: `rgba(247,243,238,0.75)` tint, not dark
- Context menu dropdown: `background: "var(--bg-raised)"`, `border: "1px solid var(--border-default)"`
- Context menu items hover: `background: "var(--bg-panel)"`
- Context menu trigger: `background: "var(--bg-panel)"`, `color: "var(--text-primary)"`
- Stepper buttons: `background: "var(--bg-panel)"`, `color: "var(--text-primary)"`, hover `background: "var(--border-subtle)"`
- Remove all `rgba(0,0,0,*)` backgrounds

**`src/components/shelf/scene-backdrop.tsx`** — see above

**`src/app/shelf/page.tsx`**

- Update GSAP entrance to use new DURATION/EASE constants

**`src/components/shelf/favorites-scene.tsx`** — add ambient shrine float

- After cards mount, iterate each card ref and start a randomized GSAP yoyo tween:
  ```ts
  const tweens = cardRefs.current.map((el) => {
    const duration = 3.5 + Math.random() * 2;
    return gsap.to(el, {
      y: "-=6",
      duration,
      delay: Math.random() * 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  });
  return () => tweens.forEach((t) => t.kill());
  ```
- Store tweens in a ref, kill all in `useEffect` cleanup — no GSAP loops left alive after unmount
- Guard: skip when `prefers-reduced-motion` is active

### Checks — Phase 6

- `npx tsc --noEmit`
- Shelf tabs switch, scroll snap works, context menu opens, episode stepper fires, drag/drop preserved

---

## Phase 7 — Card Detail

**Goal:** Card detail is editorial. Two-zone layout on cream. Cinzel title → Cormorant italic.

### Files to Change

**`src/app/card/[mal_id]/page.tsx`**

- Zone 1 (image): white card `background: "var(--bg-card)"`, `borderRadius: 8`, `boxShadow: "var(--shadow-card)"`
- Title: `fontFamily: "var(--font-display)"`, italic, large, `color: "var(--text-primary)"`
- Stat cells: labels Inter caps `color: "var(--text-muted)"`, values Geist Mono `color: "var(--text-primary)"`
- Stat instrument treatment: numeric stat values (Score, Episodes, Year) rendered at `fontSize: "2rem"`, `fontFamily: "var(--font-mono)"`, `lineHeight: 1`, `letterSpacing: "-0.02em"` — large instrument-style numerals that feel like dashboard gauges; label sits above in `0.625rem` Inter caps
- Category pills: `.filter-pill` + `.filter-pill--active`
- Collect button: `.btn-primary`
- Remove button: `color: "var(--status-error)"`, `border: "1px solid var(--status-error-bg)"`
- Rarity: left-border treatment + `<RarityDots>`
- Synopsis: `color: "var(--text-secondary)"`, Inter, readable line-height
- Update GSAP references: `EASE.emphasized` → `EASE.out`, update DURATION constants
- Zone 1 skeleton: `.skeleton-block` warm style

**`src/app/card/[mal_id]/card-detail.css`**

- Delete entirely. Inline any remaining layout rules into the page component.

### Checks

- `npx tsc --noEmit`
- Episode stepper, category change, collect/remove all work

---

## Phase 8 — Auth, Landing & Favorites

**Goal:** Auth pages and landing are light and editorial. Favorites reveal updated for cream panels.

### Files to Change

**`src/components/auth-form.tsx`**

- Form card: `background: "var(--bg-card)"`, `border: "1px solid var(--border-default)"`, `boxShadow: "var(--shadow-modal)"`
- Remove backdrop-blur from card
- Title: `fontFamily: "var(--font-display)"`, italic, `color: "var(--text-primary)"`
- Inputs: `background: "var(--bg-card)"`, `border: "1px solid var(--border-default)"`, focus ring `var(--accent)`
- Submit: `.btn-primary`
- Link/alternate action: `color: "var(--accent)"`
- `HankoSeal`: keep or use `karuta-mark.svg` at 48px

**`src/app/page.tsx`** (Landing)

- Background: `var(--bg-page)` — cream, not dark
- Remove: dark floating card bg, dark ambient effects, dark watermark kanji
- Hero: large Cormorant italic display text, `color: "var(--text-primary)"`
- Tagline: Inter, `color: "var(--text-secondary)"`
- CTAs: `.btn-primary` and `.btn-ghost`
- Overall layout: editorial — centered type, strong whitespace, no dark overlays

**`src/components/shelf/favorites-reveal.tsx`**

- Keep: entire GSAP fusuma animation logic, DoorMirrorContext, DOM structure
- Change only colors:
  - Fusuma door panels: `background: "var(--bg-card)"` (cream-white), `border: "1px solid var(--border-subtle)"`
  - Slit glow: warm amber `rgba(196,156,80,0.6)` instead of red neon
  - Gallery backdrop: `background: "var(--bg-page)"` (cream)
  - Gallery cards: white card surfaces
  - Close button: `color: "var(--text-secondary)"`, hover `var(--text-primary)`

### Checks

- `npx tsc --noEmit`
- `npm run build` — full clean build
- Auth redirect works, sign up/login flow works
- Landing renders on cream bg
- FavoritesReveal opens/closes, ESC works, DoorMirrorContext intact

---

## Final Success Criteria

1. `npx tsc --noEmit` — zero errors
2. `npm run build` — clean, all routes compile
3. Background is `#f7f3ee` cream on every page — no dark surfaces
4. Cards are white (`#ffffff`) on cream — separated by shadow, not color
5. Cormorant Garamond italic on all page titles and section headers
6. Inter on all UI text, labels, navigation, body
7. Geist Mono on scores, episode counts, years
8. Hanko red (`#c41e3a`) appears only on: primary buttons, active filter pills, active tab underline, rarity legendary tier, error states, toast accent bars
9. No perspective tilt on card hover — elevation only
10. Rarity tiers readable on cream backgrounds (left-border + dot cluster)
11. All user flows work: collect, episode stepper, category change, shelf drag/drop, favorites reveal, auth
12. No dark-mode tokens (`--ink-*`, `--washi*`, `--sumi`) referenced anywhere in src/
13. Mobile responsive at 390px, 768px, 1280px
14. Reduced motion respected

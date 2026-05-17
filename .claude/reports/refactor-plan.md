# Component Refactor Plan — Karuta Editorial Redesign

**Based on:** new-visual-direction.md, motion-direction.md (editorial versions)
**Constraint:** Preserve all business logic, routes, API calls, state management, auth flows.

---

## Overview of What Changes

- **Color system:** Full dark-mode token set replaced with light editorial tokens
- **Fonts:** Cinzel + Noto Serif JP + Geist Sans → Cormorant Garamond + Inter + Geist Mono
- **Backgrounds:** `#0a0604` (near-black) → `#f7f3ee` (warm cream)
- **Cards:** Dark surfaces → white cards on cream
- **Rarity:** Glows/neon on dark → left-border accent + dot cluster on light
- **Hover:** Perspective tilt → elevation (`translateY(-4px)` + shadow)
- **Layout:** Standard grid → editorial header zones + structured column grid

---

## Phase 1 — Token & Font Foundation

### `src/app/globals.css`

**Delete entirely:**

- All `--ink-*` tokens
- All `--washi*` tokens
- All `--sumi`, `--hanko-bright`, `--lantern-glow` tokens
- All `--bg-void`, `--bg-page` (old), `--bg-surface`, `--bg-overlay` (old)
- All `--border-subtle` (old), `--border-default` (old), `--border-strong` (old)
- All `--rarity-*-glow`, `--rarity-legendary-holo` tokens
- `@keyframes rarity-pulse`, `@keyframes legendary-shimmer`, any looping rarity animation
- `.dark` class references
- All `rgba(10,6,4,*)` and `rgba(244,228,192,*)` hardcoded values in utility classes
- `.washi-pill`, `.washi-pill--active`, `.washi-pill--rarity-*` (rebuild for light bg)
- `.hanko-btn` (rebuild for light bg)
- `.ghost-btn` (rebuild for light bg)
- `.ambient-lantern`, `.shelf-glow`, `.section-glow` ambient effects
- `.hairline` (rebuild with new border color)
- `.display-title` class (font changes)
- Old skeleton shimmer animation (replace with new warm pulse)

**Add — new `:root` block:**

```css
:root {
  /* Surfaces */
  --bg-page: #f7f3ee;
  --bg-card: #ffffff;
  --bg-raised: #ffffff;
  --bg-panel: #f0ebe3;
  --bg-overlay: rgba(247, 243, 238, 0.85);

  /* Text */
  --text-primary: #1a1614;
  --text-secondary: #6b6560;
  --text-muted: #a8a29e;
  --text-disabled: #c8c2bc;
  --text-on-accent: #ffffff;

  /* Accent */
  --accent: #c41e3a;
  --accent-hover: #a01830;
  --accent-tint: rgba(196, 30, 58, 0.06);
  --accent-tint-md: rgba(196, 30, 58, 0.12);

  /* Borders */
  --border-subtle: #e8e3dc;
  --border-default: #e4ddd6;
  --border-strong: #d6d0ca;

  /* Shadows */
  --shadow-card: 0 2px 8px rgba(26, 22, 20, 0.08);
  --shadow-hover: 0 6px 16px rgba(26, 22, 20, 0.14);
  --shadow-modal: 0 12px 32px rgba(26, 22, 20, 0.2);

  /* Skeleton */
  --skeleton-base: #e8e3dc;
  --skeleton-shine: #f0ebe3;

  /* Status */
  --status-success: #2d7a4f;
  --status-success-bg: rgba(45, 122, 79, 0.08);
  --status-warning: #a0612a;
  --status-warning-bg: rgba(160, 97, 42, 0.08);
  --status-error: #c41e3a;
  --status-error-bg: rgba(196, 30, 58, 0.08);

  /* Rarity borders (light-bg safe) */
  --rarity-common-border: #c8c2bc;
  --rarity-uncommon-border: #8fa88f;
  --rarity-rare-border: #7a9fc0;
  --rarity-epic-border: #c4a84a;
  --rarity-legendary-border: #c41e3a;

  /* Load-bearing layout constant */
  --navbar-height: 3.5rem;
}
```

**Add — new utility classes:**

```css
/* Typography */
.display-title {
  font-family: var(--font-display);
  font-weight: 300;
  font-style: italic;
}

/* Buttons */
.btn-primary {
  background: var(--accent);
  color: var(--text-on-accent);
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.25rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition:
    background 150ms ease-out,
    transform 80ms ease-out;
}
.btn-primary:hover {
  background: var(--accent-hover);
}
.btn-primary:active {
  transform: scale(0.97);
}

.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--border-default);
  border-radius: 4px;
  padding: 0.6rem 1.25rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition:
    border-color 150ms ease-out,
    background 150ms ease-out;
}
.btn-ghost:hover {
  border-color: var(--border-strong);
  background: var(--bg-panel);
}

/* Filter pills */
.filter-pill {
  background: transparent;
  border: 1.5px solid var(--border-default);
  border-radius: 2px;
  padding: 0.3rem 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition:
    border-color 150ms ease-out,
    color 150ms ease-out,
    background 150ms ease-out;
}
.filter-pill:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
}
.filter-pill--active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-tint);
}

/* Dividers */
.hairline {
  height: 1px;
  background: var(--border-subtle);
}

/* Skeleton */
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
.skeleton-block {
  background: var(--skeleton-base);
  border-radius: 3px;
  animation: skeleton-pulse 1400ms ease-in-out infinite;
}
.skeleton-line {
  background: var(--skeleton-base);
  border-radius: 2px;
  animation: skeleton-pulse 1400ms ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-block,
  .skeleton-line {
    animation: none;
    opacity: 0.7;
  }
}
```

**`<html>` tag:** Remove `className` containing `"dark"`. This is a light-mode app.

---

### `src/app/layout.tsx`

**Font changes:**

- Remove: `Cinzel`, `Noto_Serif_JP`, `Geist` (sans)
- Add: `Cormorant_Garamond` (weights: 300, 300i, 500, 500i), `Inter` (weights: 400, 500, 600)
- Keep: `Geist_Mono`

```tsx
import { Cormorant_Garamond, Inter, Geist_Mono } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
```

In `@theme inline` (globals.css):

```css
--font-display: var(--font-cormorant);
--font-sans: var(--font-inter);
--font-mono: var(--font-geist-mono);
```

`<html>` className: `${cormorant.variable} ${inter.variable} ${geistMono.variable}` — remove dark class, remove old font variables.

`<body>`: `background: var(--bg-page)`, `color: var(--text-primary)`

---

## Phase 2 — Navbar & Shell

### `src/components/navbar.tsx`

**Delete:**

- Backdrop blur + dark gradient background
- `rgba(10,6,4,*)` hardcoded colors
- `--washi*` token references
- `--hanko` (rename to `--accent`)
- Seal drop GSAP animation (`gsap.fromTo` on `sealRef`) — remove the entire useEffect
- Drawer `z-[60]` can stay; dark `rgba(10,6,4,.95)` background → `var(--bg-raised)`

**Keep:** All routing logic, auth state, drawer open/close, keyboard trap, mobile hamburger, sign-out.

**Change:**

- Nav background: `background: rgba(247,243,238,0.92)`, `backdrop-filter: blur(8px)`, `border-bottom: 1px solid var(--border-subtle)`
- Active link underline: keep `--accent` (same hex)
- All `var(--washi)` → `var(--text-primary)`
- All `var(--washi-dim)` → `var(--text-secondary)`
- All `var(--washi-soft)` → `var(--text-muted)`
- Drawer background: `var(--bg-raised)`, border: `var(--border-subtle)`
- `karuta-mark.svg` stays — it already has a light variant if needed
- Remove `--font-jp` kanji kicker references (Noto removed)

---

## Phase 3 — UI Components

### `src/components/ui/section-header.tsx`

**Change:**

- Heading: `font-family: var(--font-display)`, `font-weight: 300`, `font-style: italic`, `color: var(--text-primary)`
- Kicker/sub: `font-family: var(--font-sans)`, `font-size: 0.6875rem`, `letter-spacing: 0.2em`, `text-transform: uppercase`, `color: var(--text-muted)`
- Remove kanji kicker rendering (no `--font-jp`)
- Add horizontal rule below title: `1px solid var(--border-subtle)`, `margin-top: 0.75rem`

### `src/components/ui/empty-state.tsx`

**Change:**

- Background: none (inherits `--bg-page`)
- Icon: replace kanji character with a simple line-art SVG or remove — use large Cormorant numeral or em-dash instead
- Title: `font-family: var(--font-display)`, italic, `color: var(--text-primary)`
- Body: Inter, `color: var(--text-secondary)`
- CTA button: `.btn-ghost` class

### `src/components/ui/skeleton-grid.tsx`

**Change:**

- Cards use `.skeleton-block` class (warm pulse, not cold gray)
- Aspect ratio stays 2:3

### `src/components/ui/toast.tsx`

**Change:**

- Toast surface: `background: var(--bg-raised)`, `border: 1px solid var(--border-default)`, `box-shadow: var(--shadow-modal)`
- Left accent bar: 3px solid, color varies by type (success/warning/error/info)
- Text: `color: var(--text-primary)` for message, `color: var(--text-secondary)` for description
- No colored backgrounds — white card + left bar only
- Positioning: keep bottom-right (desktop), bottom full-width (mobile)

### `src/components/ui/status-pip.tsx`

**Change:**

- Use `--accent` for watching, `--status-success` for completed, `--text-muted` for plan
- Border: `var(--bg-card)` (white ring to separate from card surface)

### `src/components/ui/rarity-badge.tsx`

**Change:**

- Background: `var(--bg-card)` or transparent
- Text: use `--rarity-*-border` token value for color
- No glows

---

## Phase 4 — Browse (AnimeCard)

### `src/components/card/anime-card.tsx`

**Delete:**

- Entire `handleMouseMove` (perspective tilt) function
- `handleMouseEnter` / `handleMouseLeave` GSAP tilt logic
- `isTouchRef` and associated useEffect
- `cardInnerRef` rotation/perspective styles
- All `rotateX`, `rotateY`, `perspective` style assignments

**Keep:** Flip mechanic (front/back), collect button, all store interactions, fluid sizing.

**Change:**

- Card surface: `background: var(--bg-card)`, `border: 1px solid var(--border-default)`, `border-radius: 6px`
- Hover: CSS only — `translateY(-4px)` + `--shadow-hover` (150ms ease-out)
- Info bar at bottom: `background: rgba(247,243,238,0.95)` (light cream, not dark blur)
- Title text: `color: var(--text-primary)`
- Score chip: `font-family: var(--font-mono)`, `color: var(--text-secondary)`
- Collect button: `.btn-primary` style (red fill on white card)
- Rarity indicator: left-border 3px solid `var(--rarity-*-border)` on card

### `src/components/card/card.css`

**Delete entirely** and inline remaining styles into `anime-card.tsx` or `globals.css`. The file was built for dark card surfaces — starting fresh is cleaner.

---

## Phase 5 — Collection Page

### `src/app/collection/page.tsx`

**Change:**

- Page background: inherits `--bg-page` from body
- Grid: keep 2-col mobile / 3-col tablet / 4-col desktop / 5-col xl
- Card: `background: var(--bg-card)`, `border: 1px solid var(--border-default)`, `border-radius: 6px`
- Rarity treatment: 3px left-border in `--rarity-*-border` color + dot cluster at bottom of card
- Remove: rarity border glow, `collection-card__pip` dark glow styles
- Filter pills: `.filter-pill` and `.filter-pill--active` classes
- Sort dropdown: `border: 1px solid var(--border-default)`, `background: var(--bg-card)`
- Section header: editorial zone — large Cormorant italic title + hairline rule

---

## Phase 6 — Shelf

### `src/app/shelf/shelf.css`

**Delete:** All dark scene backdrop styles, dark spine colors, ambient glow effects.
**Keep:** Scroll snap rules, `.shelf-scroll`, `.poster-card-snap`, `.scroll-dots`.
**Change:** Scroll dot colors to `--border-strong` (inactive) and `--accent` (active).

### `src/components/shelf/scene-backdrop.tsx`

**Change:**

- Remove: dark gradient backdrop, warm lantern glow, dark background colors
- New: `background: var(--bg-panel)`, `border: 1px solid var(--border-subtle)`, `border-radius: 8px`
- Subtle inner shadow instead of dark ambient: `box-shadow: inset 0 1px 3px rgba(26,22,20,0.05)`

### `src/components/shelf/scene-tabs.tsx`

**Change:**

- Tab bar background: `var(--bg-card)`, `border-bottom: 1px solid var(--border-subtle)`
- Active tab: `color: var(--accent)`, `box-shadow: inset 0 -2px 0 var(--accent)`
- Inactive tab: `color: var(--text-secondary)`
- Count badge: `background: var(--accent-tint)`, `color: var(--accent)`

### `src/components/shelf/scene.tsx`

**Change:**

- Stagger: update to `each: 0.035` (from 0.08)
- `clearProps` stays
- Remove `EASE.emphasized` → `EASE.out`
- Remove `DURATION.reveal` → `DURATION.base`

### `src/components/shelf/poster-card.tsx`

**Change:**

- Card surface: `background: var(--bg-card)`, `border: 1px solid var(--border-default)`
- Watched overlay: light warm tint (`rgba(247,243,238,0.7)`) instead of dark overlay
- Context menu: `background: var(--bg-raised)`, `border: var(--border-default)`, `color: var(--text-primary)`
- Context menu hover: `background: var(--bg-panel)`
- Remove: button: dark `rgba(0,0,0,*)` backgrounds → `var(--bg-panel)`
- Stepper buttons: `background: var(--bg-panel)`, `color: var(--text-primary)`

### `src/components/shelf/scene-backdrop.tsx`

See above.

---

## Phase 7 — Card Detail

### `src/app/card/[mal_id]/page.tsx`

**Change:**

- Page bg: `var(--bg-page)` (inherits)
- Zone 1 (image area): white card surface, rounded corners, `var(--shadow-card)`
- Zone 2 (info area): `var(--bg-page)` or `var(--bg-card)` depending on layout
- Title: `font-family: var(--font-display)`, italic, large, `color: var(--text-primary)`
- Stat cells: labels in Inter caps `color: var(--text-muted)`, values in Geist Mono `color: var(--text-primary)`
- Category pills: `.filter-pill` + `.filter-pill--active`
- Collect button: `.btn-primary`
- Remove button: destructive — `color: var(--status-error)`, `border: 1px solid var(--status-error-bg)`
- Rarity badge: `--rarity-*-border` left-border treatment
- GSAP: remove `EASE.emphasized` → `EASE.out`, update `DURATION.*` constants

### `src/app/card/[mal_id]/card-detail.css`

**Delete** and inline into the page component. Was built for dark surfaces.

---

## Phase 8 — Auth & Landing

### `src/components/auth-form.tsx`

**Change:**

- Form card: `background: var(--bg-card)`, `border: 1px solid var(--border-default)`, `box-shadow: var(--shadow-modal)`
- Remove `backdrop-blur` from form card
- Title: `font-family: var(--font-display)`, italic, `color: var(--text-primary)`
- Input: `background: var(--bg-card)`, `border: 1px solid var(--border-default)`
- Submit: `.btn-primary`
- `HankoSeal` component: keep or replace with `karuta-mark.svg` at 48px

### `src/app/page.tsx` (Landing)

**Change:**

- Background: `var(--bg-page)` — light cream, not dark
- Hero: large Cormorant italic display text
- Remove: dark floating card background, dark ambient effects, dark watermark kanji
- New hero treatment: editorial — large type, strong typographic hierarchy, clean grid
- CTA buttons: `.btn-primary` and `.btn-ghost`

---

## New Components Needed

### `src/components/ui/rarity-dots.tsx`

Dot cluster (5 dots, filled vs empty) for rarity tier display on light cards. Used in browse card, collection card.

### `src/components/ui/page-header.tsx`

Editorial page header zone: Cormorant italic title + optional kicker in Inter caps + hairline rule. Replaces `SectionHeader` for page-level use (or extend `SectionHeader`).

---

## Files to Delete

- `src/app/card/[mal_id]/card-detail.css` — entirely dark-surface styles, inline what's needed
- `src/components/card/card.css` — entirely dark-surface styles, rebuild inline or in globals

---

## Risk Areas

| Area                              | Risk                                                                              | Notes                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `favorites-reveal.tsx`            | GSAP fusuma animation tightly coupled to visual + DOM structure                   | Keep GSAP logic, only change colors (dark panels → cream panels, red slit glow → warm amber) |
| `anime-card.tsx` flip mechanic    | Flip logic uses 3D CSS transforms — removing perspective tilt must not break flip | Only remove `mousemove` handler; `rotateY` on click stays                                    |
| `poster-card.tsx` episode stepper | Business logic inside visual component                                            | Touch only the style props, never the stepper state/callback logic                           |
| `--navbar-height`                 | Used by `FavoritesReveal` for positioning                                         | Must stay at `3.5rem` — do not rename or remove                                              |
| `collection-store.ts`             | Optimistic update pattern                                                         | Never touch — pure business logic                                                            |
| `auth-provider.tsx`               | Session management                                                                | Never touch                                                                                  |
| `page-transition.tsx`             | GSAP + `clearProps` coupling                                                      | Update duration/ease constants only; keep `clearProps: "transform"`                          |

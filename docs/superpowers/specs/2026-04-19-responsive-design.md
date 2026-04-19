# Responsive Design — Design Spec

**Date:** 2026-04-19
**Status:** Approved

## Overview

Make every page in the Anime Collector app work beautifully from 320px to 1440px+. The app currently targets desktop only — the navbar overflows on small screens, card grids don't adapt, and the shelf layout assumes wide viewports. This spec adds a mobile-first responsive layer using Tailwind breakpoints, a `useMediaQuery` hook for behavior changes, and a slide-in nav drawer for mobile.

## Breakpoints

| Name | Range | Tailwind prefix |
| --- | --- | --- |
| Mobile | < 640px | (default) |
| Tablet | 640px–1023px | `sm:`, `md:` |
| Desktop | 1024px+ | `lg:` |

All styles are written mobile-first. Desktop overrides use `sm:` / `md:` / `lg:` prefixes.

## Shared: `useMediaQuery` Hook

A minimal hook wrapping `window.matchMedia`. Returns a boolean for a given media query string. Used for behavior changes that can't be done with CSS alone (switching card variant, disabling DnD).

### File

Create: `src/hooks/use-media-query.ts`

### API

```typescript
function useMediaQuery(query: string): boolean
```

- SSR-safe: returns `false` during server render, hydrates on mount.
- Listens for `change` events on the `MediaQueryList` and updates state.
- Cleans up listener on unmount.

### Usage

```typescript
const isMobile = useMediaQuery("(max-width: 639px)");
```

## Navbar

### File

Modify: `src/components/navbar.tsx`

### Desktop (≥ 640px)

No change. Horizontal nav links with kanji, label, and underline indicator.

### Mobile (< 640px)

- The nav links and sign-out button are hidden.
- A hamburger button (three horizontal lines) appears at the right side of the navbar header.
- The hanko seal logo and "ANIME COLLECTOR" text remain visible in the header.

#### Drawer

- Tapping the hamburger opens a drawer that slides in from the right edge.
- A semi-transparent dark overlay (`rgba(0,0,0,0.6)`) covers the rest of the screen behind the drawer.
- The drawer has the same dark background as the navbar (`rgba(10,6,4,.95)`), full viewport height, width `280px`.
- Inside the drawer, nav links are stacked vertically with larger touch targets (48px row height). Each link shows the kanji, label, and active indicator (hanko underline on the active link).
- "Sign Out" appears at the bottom of the drawer, separated by a hairline divider.
- The drawer closes on: link click, overlay click, or Escape key press.
- Open/close is a CSS `transform: translateX()` transition (300ms ease-out). No GSAP needed.
- The hamburger icon swaps to an X (close icon) while the drawer is open.
- `aria-expanded` on the hamburger button. `role="dialog"` and `aria-label="Navigation"` on the drawer. Focus trap inside the drawer while open.

## Landing Page

### File

Modify: `src/app/page.tsx`

### Mobile (< 640px)

- Title: add `text-5xl` as the base size, `sm:text-6xl md:text-[5.75rem]` for larger screens (currently `text-6xl sm:text-7xl md:text-[5.75rem]`).
- CTA buttons: add `flex-col sm:flex-row` to the button container so they stack vertically on mobile.
- Footer meta: the three-item row already uses `flex items-center gap-5`. On mobile the items will wrap naturally. Add `flex-wrap justify-center` to ensure clean centering when wrapped.

### Tablet / Desktop

No changes — the layout is already centered and flexible.

## Browse Page

### File

Modify: `src/app/browse/page.tsx`

### Mobile (< 640px)

- **Header:** The title block and collected badge currently use `flex-wrap items-end justify-between`. On mobile, change to `flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between` so they stack.
- **Rarity legend:** Add `gap-1 sm:gap-2` for tighter mobile spacing.
- **Card grid:** Switch to compact variant cards on mobile using `useMediaQuery("(max-width: 639px)")`. Use a CSS grid: `grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6`. Each card container constrains width on mobile so compact cards fill the grid cell.
- **Card variant:** Pass `variant={isMobile ? "compact" : "full"}` to `AnimeCard`.

### Tablet (640–1023px)

Full-size cards in flex-wrap. 2-3 cards per row depending on viewport width.

### Desktop

No changes.

## Collection Page

### File

Modify: `src/app/collection/page.tsx`

### Mobile (< 640px)

- **Controls:** Filter pills and sort dropdown stack vertically. Change the controls container to `flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4`. Remove `ml-auto` from the sort dropdown on mobile — it becomes left-aligned in its own row.
- **Card grid:** Use `grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6`. Compact cards (180px) already fit two-across on 375px. On very narrow screens (320px), the grid cells shrink the cards proportionally. The card Link wrappers should not constrain width on mobile — let the grid handle sizing.

### Tablet / Desktop

No changes.

## Shelf Page

### Files

- Modify: `src/app/shelf/page.tsx`
- Modify: `src/components/shelf/manga-spine.tsx`

### Mobile (< 640px)

- **Header:** Title and stats box stack vertically. Change to `flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6`. Stats box goes full-width below the title.
- **Stats box:** On mobile, make it stretch: `w-full sm:w-auto`. The three stat cells should spread evenly with `flex-1` on each.
- **秘 seal:** Stays in the stats row on desktop. On mobile, position it at the right edge of the stats box row using `absolute right-0 top-1/2 -translate-y-1/2` relative to the stats container, or place it inline after the stats box.
- **Washi tabs:** The three tabs fit on 320px (each ~100px). No change needed. They already flex-wrap.
- **Hero spine episode stepper:** Reduce width from 200px to 160px on mobile. This is done in `manga-spine.tsx` — pass the mobile breakpoint state down, or use a Tailwind responsive class on the stepper container.
- **Drag-and-drop disabled on mobile:** Use `useMediaQuery` in the shelf page to detect mobile. Pass `disabled` to the `PointerSensor` configuration. The `KeyboardSensor` stays active. The move menu on each spine already provides the same functionality.

### Tablet / Desktop

No changes.

### Disabling DnD on Mobile

Conditionally include the `PointerSensor` based on viewport width:

```typescript
const isMobile = useMediaQuery("(max-width: 639px)");

const sensors = useSensors(
  ...(!isMobile
    ? [useSensor(PointerSensor, {
        activationConstraint: { delay: 250, tolerance: 5 },
      })]
    : []),
  useSensor(KeyboardSensor)
);
```

This removes the pointer sensor entirely on mobile rather than trying to disable it. The `KeyboardSensor` stays active for accessibility.

## Card Detail Page

### File

Modify: `src/app/card/[mal_id]/page.tsx`

### Mobile (< 640px)

- **AnimeCard:** The full variant at 280px fits on 320px screens (280 + 32px padding = 312px). No variant change needed.
- **Title:** Drop from `text-[22px]` to `text-[18px] sm:text-[22px]`.
- **Stats bar:** The four stats with dividers overflow on 320px. Switch to a 2×2 grid on mobile:
  - Score and Episodes on the top row.
  - Year and Studio on the bottom row.
  - Remove vertical divider `div` elements on mobile (use `hidden sm:block` on dividers).
  - Add a horizontal divider between the two rows on mobile only (`block sm:hidden`).
  - Container changes from `flex items-center justify-center gap-6` to `grid grid-cols-2 gap-4 sm:flex sm:items-center sm:justify-center sm:gap-6`.
  - Each stat cell gets `text-center` and equal sizing in the grid.
- **Category pills + Remove:** Currently `flex items-center justify-between`. On mobile, stack them: `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`. The pills wrap naturally with `flex-wrap`. The "Remove" button moves below the pills, left-aligned.
- **Synopsis:** No change — full-width text works at any width.
- **Genre pills:** No change — already `flex-wrap`.

### Tablet / Desktop

No changes.

## Auth Pages (Login / Signup)

### Files

- Modify: `src/app/login/page.tsx`
- Modify: `src/app/signup/page.tsx`

### All Breakpoints

Already responsive — the form is `max-w-sm w-full` centered. Only change: ensure the page wrapper has `px-4` for horizontal padding on mobile. Check and add if missing.

## Edge Cases

- **Orientation change on mobile:** The `useMediaQuery` hook listens to `change` events, so layout updates on rotation.
- **Very narrow screens (< 320px):** Not targeted but nothing should break. CSS grid with `grid-cols-2` will shrink cards proportionally.
- **Touch vs. mouse:** Only the DnD sensor is touch-sensitive. All other interactions (taps, menus) work with both input types.
- **Drawer + keyboard navigation:** Focus trap ensures Tab/Shift+Tab stays inside the drawer while open. Escape closes it.
- **SSR hydration:** `useMediaQuery` returns `false` on server, then updates on mount. This means mobile-specific behavior (compact cards, disabled DnD) flashes briefly on first load. For card variant, this is acceptable — the layout shift is minimal. For DnD, the sensors are always present on first render and disable on hydration, which is fine.

## Files Summary

| File | Action | Purpose |
| --- | --- | --- |
| `src/hooks/use-media-query.ts` | Create | Reusable `useMediaQuery` hook |
| `src/components/navbar.tsx` | Modify | Hamburger button + slide-in drawer on mobile |
| `src/app/page.tsx` | Modify | Title size, CTA stacking, footer wrap |
| `src/app/browse/page.tsx` | Modify | Compact cards on mobile, header stacking, grid layout |
| `src/app/collection/page.tsx` | Modify | Controls stacking, grid layout |
| `src/app/shelf/page.tsx` | Modify | Header stacking, disable DnD on mobile |
| `src/components/shelf/manga-spine.tsx` | Modify | Episode stepper width on mobile |
| `src/app/card/[mal_id]/page.tsx` | Modify | Stats bar 2×2, title size, category/remove stacking |
| `src/app/login/page.tsx` | Modify | Ensure `px-4` padding |
| `src/app/signup/page.tsx` | Modify | Ensure `px-4` padding |

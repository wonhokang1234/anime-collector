# Loading & Transitions — Design Spec

**Date:** 2026-04-19
**Status:** Approved

## Overview

Replace all loading spinners with content-shaped skeleton screens, add stagger-in animations when card grids populate, and give every page a smooth GSAP entrance animation. This is the "full choreography" option — every data-loading moment and every route change gets polished treatment.

## Current State

| Page | Auth wait | Data loading | Skeleton? | Spinner color |
|---|---|---|---|---|
| Landing | Blank CTA (`null`) | n/a | No | — |
| Browse | `animate-spin` (hanko themed) | `animate-spin` (hanko themed) | No | Correct |
| Collection | `animate-spin` (hanko themed) | n/a (Zustand instant) | No | Correct |
| Shelf | `animate-spin` (WRONG: zinc/indigo) | n/a (Zustand instant) | No | Wrong |
| Card Detail | `animate-spin` (WRONG: zinc/indigo) | `skeleton-line` (card-detail.css only) | Partial | Wrong |

The existing `skeleton-line` + `skeleton-pulse` keyframe live in `card-detail.css` and are not globally available. The `border-t-indigo-500` spinner on Shelf and Card Detail breaks the washi/hanko visual language.

## Breakdowns

### 1. Global Skeleton CSS

Move `skeleton-line`, `skeleton-pulse`, and add a new `skeleton-block` to `src/app/globals.css`:

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: rgba(244, 228, 192, 0.06);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  display: block;
}

.skeleton-block {
  border-radius: 8px;
  background: rgba(244, 228, 192, 0.04);
  border: 1px solid rgba(244, 228, 192, 0.06);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

`skeleton-block` is used for card-shaped placeholders. Width and height set inline to match the card variant.

Remove the duplicate `skeleton-line` + `@keyframes skeleton-pulse` from `src/app/card/[mal_id]/card-detail.css`.

### 2. Skeleton Screens

#### Browse Page

While `loading` is true (Jikan API in-flight), render a grid of skeleton cards instead of the spinner.

- **Desktop (≥ 640px):** `flex flex-wrap gap-6 justify-start` — 8 skeleton cards at `280×420px` (full variant dimensions)
- **Mobile (< 640px):** `grid grid-cols-2 gap-3` — 8 skeleton cards at `180×260px` (compact variant dimensions)

The skeleton count (8) matches a reasonable first-page load. The Jikan API returns 25 results, but showing 8 skeleton cards avoids a jarring "too many placeholders" effect.

Each skeleton card:
```tsx
<div className="skeleton-block" style={{ width: isMobile ? 180 : 280, height: isMobile ? 260 : 420 }} />
```

#### Collection Page

While `!initialized`, render a grid of 8 skeleton cards (same dimensions as Browse). The count is hardcoded to 8 since the actual collection size is unknown at render time.

#### Shelf Page

While `!initialized`, render a row of 3 skeleton spine placeholders instead of the spinner. Each spine is `48×260px` (matching the manga spine dimensions), spaced in a horizontal flex row.

```tsx
<div className="flex gap-3">
  {[0, 1, 2].map((i) => (
    <div key={i} className="skeleton-block" style={{ width: 48, height: 260 }} />
  ))}
</div>
```

#### Landing Page

While `loading` (auth resolving), show a skeleton button placeholder instead of the blank gap:
```tsx
<div className="skeleton-block" style={{ width: 200, height: 44, borderRadius: 4 }} />
```

#### Card Detail Page

Already has `skeleton-line` for inline fields. No changes to the skeleton content — just ensure the CSS moves to globals.

### 3. Spinner Color Fix

Shelf and Card Detail use `border-zinc-700 border-t-indigo-500` instead of the themed hanko color. Replace with the consistent themed spinner that Browse and Collection use:

```tsx
<div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700"
     style={{ borderTopColor: "var(--hanko)" }} />
```

Note: The `borderTopColor` is set via inline style because the CSS variable `--hanko` isn't available as a Tailwind utility.

### 4. Stagger-In Animations

When card data arrives (loading completes), animate the cards in with a GSAP stagger. This applies to Browse and Collection grid containers.

**Implementation:**
- Use a ref on the card grid container
- In a `useEffect` watching the loading state transition `loading: true → false`, use GSAP `fromTo` with `stagger`
- Animation: `opacity: 0, y: 10` → `opacity: 1, y: 0`, duration `0.35s`, stagger `0.04s`, ease `power2.out`

```tsx
const gridRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (loading || !gridRef.current) return;
  const cards = gridRef.current.children;
  if (cards.length === 0) return;
  gsap.fromTo(
    cards,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
  );
}, [loading]);
```

The effect fires whenever `loading` becomes `false` (initial load + each search). The tween targets direct children of the grid container, so it hits all `AnimeCard` wrappers regardless of DOM structure.

**Browse:** Fires on both initial `getTopAnime()` load and each `searchAnime()` completion.

**Collection:** Fires once when `initialized` transitions from `false` to `true`. The dependency is `initialized` (from the collection store), not a local `loading` flag.

### 5. Page Transitions

A shared `<PageTransition>` client component wraps `{children}` in `layout.tsx`. It uses GSAP to fade-in the page content on every route change.

#### File

Create: `src/components/page-transition.tsx`

#### Implementation

```tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
    return () => { tween.kill(); };
  }, [pathname]);

  return <div ref={ref} style={{ opacity: 0 }}>{children}</div>;
}
```

The `style={{ opacity: 0 }}` prevents FOUC — the div starts invisible and GSAP animates it in. `pathname` changes on every route navigation, which re-runs the effect.

#### Layout Integration

In `src/app/layout.tsx`, replace `{children}` with `<PageTransition>{children}</PageTransition>`:

```tsx
<main className="flex-1">
  <PageTransition>{children}</PageTransition>
</main>
```

#### Card Detail Entrance Interaction

The card detail page has its own GSAP entrance timeline (line 82–108 in `page.tsx`). This runs concurrently with the PageTransition fade. The card detail entrance animates specific elements (`cardRef`, `glowRef`, `labelRef`, `titleRef`) independently from the page wrapper, so there is no conflict — the page wrapper fades in as a whole while the card detail's internal animation plays on top.

## Files Summary

| File | Action | Purpose |
|---|---|---|
| `src/app/globals.css` | Modify | Add `skeleton-block`, promote `skeleton-line` + `skeleton-pulse` |
| `src/app/card/[mal_id]/card-detail.css` | Modify | Remove now-duplicate `skeleton-line` + `skeleton-pulse` |
| `src/components/page-transition.tsx` | Create | GSAP fade-in wrapper for page transitions |
| `src/app/layout.tsx` | Modify | Wrap `{children}` with `<PageTransition>` |
| `src/app/page.tsx` | Modify | Skeleton button placeholder during auth loading |
| `src/app/browse/page.tsx` | Modify | Skeleton card grid + stagger-in |
| `src/app/collection/page.tsx` | Modify | Skeleton card grid + stagger-in |
| `src/app/shelf/page.tsx` | Modify | Skeleton spine row + fix spinner color |
| `src/app/card/[mal_id]/page.tsx` | Modify | Fix spinner color only |

## Edge Cases

- **Empty collection on Collection page:** The skeleton shows 8 placeholders, then transitions to the empty-state panel. The stagger fires on the empty-state's children too, which gives a gentle entrance to the empty-state content.
- **Fast connections:** If Jikan data returns before the skeleton renders, the skeleton may flash for one frame. This is acceptable — the transition is smooth enough at normal speeds.
- **Collection page stagger:** Because `initialized` starts `false` and becomes `true` exactly once per session, the stagger only fires on initial load, not on filter/sort changes (which re-order but don't change `initialized`).
- **PageTransition on Card Detail:** The page wrapper fades in as a whole. The card detail's own GSAP entrance animates from `opacity: 0` on specific elements inside the already-fading page wrapper. This is fine — both run simultaneously and both are fast (0.3s).
- **SSR:** `PageTransition` is a client component (`"use client"`). The `style={{ opacity: 0 }}` is applied client-side, so there is no SSR flash — the page renders at full opacity on the server, then the client hydrates and GSAP immediately takes over. The first frame may briefly show full-opacity content, then the tween kicks in. This is acceptable.

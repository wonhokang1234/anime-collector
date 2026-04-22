# Anime Card Revamp — Design Spec

**Date:** 2026-04-20
**Scope:** `AnimeCard` component (browse + collection pages)
**Status:** Approved — ready for implementation planning

---

## Problem Statement

Three issues with the current `AnimeCard` component:

1. **Hover disconnect** — the collect button sits outside `innerRef` (the element that scales on hover), so card artwork lifts while the button stays fixed. The card visually tears apart on hover.
2. **Button corners** — `hanko-btn` has `border-radius: 2px`, inconsistent with a modern premium feel.
3. **Card aesthetics** — the info panel uses generic `zinc-900` colors that don't fit the washi/hanko/ink visual language. There is no physical-card feel. The "Collected" state is a disabled bar that goes unnoticed.

---

## Architecture: Fixing the Hover Disconnect

### Root Cause

```
perspectiveRef  (y:-6 on hover)
  └─ innerRef  (scale:1.04 on hover)   ← artwork + info bar here
  └─ button    (absolute bottom-3)     ← outside innerRef, stays static
```

The button is positioned absolutely inside `perspectiveRef` but outside `innerRef`. When `innerRef` scales, the artwork grows around the button.

### Fix

Move the button inside `card-face card-front`, into the existing `data-no-flip` info panel:

```
perspectiveRef  (y:-6 on hover)
  └─ innerRef  (scale:1.04 on hover)
       └─ card-face card-front
            ├─ card-image-wrapper   (artwork, flex-1)
            └─ info panel [data-no-flip]
                 ├─ title + rarity badge
                 ├─ score + episodes
                 └─ collect button   ← now participates in scale
```

**Side effects:**
- Remove the `<div className="mt-2 h-8" aria-hidden />` spacer that was reserving space for the external button.
- Remove the external button block (lines 353–401 in current `anime-card.tsx`).
- Flip prevention is unchanged — `cardRef.onClick` already calls `target.closest("[data-no-flip]")` before flipping; the button is inside that zone.
- `isFlipped` opacity/pointer-events logic on the button moves inline with it (no longer an outer wrapper toggle).

---

## Visual Design

### 1. Button Corners

`hanko-btn` in `globals.css`: change `border-radius: 2px` → `border-radius: 6px`.

This applies site-wide but is consistent with the modernization intent.

### 2. Rarity Stripe

A 2px bar pinned to the very top edge of `card-front`. Colored per rarity tier, it gives immediate rarity signal before the badge is read — like a TCG type-color band.

```
card-front (position: relative, overflow: hidden)
  └─ .rarity-stripe  (absolute, top:0, left:0, right:0, height:2px)
```

Colors per tier:
| Tier | Color |
|---|---|
| Common | `#a1a1aa` (zinc-400) |
| Uncommon | `linear-gradient(90deg, #059669, #34d399, #059669)` |
| Rare | `linear-gradient(90deg, #2563eb, #60a5fa, #2563eb)` |
| Epic | `linear-gradient(90deg, #b45309, #fbbf24, #b45309)` |
| Legendary | Rainbow gradient with `card-foil-shimmer` animation (defined in `card.css`) |

CSS:
```css
.rarity-stripe {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  z-index: 3;
  pointer-events: none;
}
.rarity-common  .rarity-stripe { background: #a1a1aa; }
.rarity-uncommon .rarity-stripe { background: linear-gradient(90deg, #059669, #34d399, #059669); }
.rarity-rare    .rarity-stripe { background: linear-gradient(90deg, #2563eb, #60a5fa, #2563eb); }
.rarity-epic    .rarity-stripe { background: linear-gradient(90deg, #b45309, #fbbf24, #b45309); }
.rarity-legendary .rarity-stripe {
  background: linear-gradient(90deg,
    #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444
  );
  background-size: 200% 100%;
  animation: card-foil-shimmer 4s linear infinite;
}

/* foil-shimmer lives in shelf.css (shelf-only scope); define independently here */
@keyframes card-foil-shimmer {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}
```

### 3. Card Inner Border

Add `box-shadow: inset 0 0 0 1px rgba(244,228,192,0.08)` to `.card-face`. Suggests the physical edge of a collectible card. Currently card faces have no border and feel like screenshots rather than objects.

```css
.card-face {
  /* existing rules ... */
  box-shadow: inset 0 0 0 1px rgba(244, 228, 192, 0.08);
}
```

### 4. Info Panel — Ink Palette

Replace `bg-zinc-900/95` (Tailwind class in JSX) with an inline style using project ink colors. The panel transitions from the dark ink base at the bottom to a slightly more transparent layer at the top where it meets the artwork.

```tsx
// Before
<div data-no-flip className="relative z-10 px-3 py-2.5 bg-zinc-900/95 backdrop-blur-sm">

// After
<div
  data-no-flip
  className="relative z-10 px-3 py-2.5"
  style={{
    background: "linear-gradient(to top, rgba(5,7,16,0.98), rgba(10,6,4,0.92))",
    backdropFilter: "blur(4px)",
    borderTop: "1px solid var(--rarity-separator-color, rgba(244,228,192,0.12))",
  }}
>
```

The `--rarity-separator-color` is set per rarity class in CSS (matches the stripe color at reduced opacity):

```css
.rarity-common  { --rarity-separator-color: rgba(161,161,170,0.25); }
.rarity-uncommon { --rarity-separator-color: rgba(52,211,153,0.25); }
.rarity-rare    { --rarity-separator-color: rgba(96,165,250,0.25); }
.rarity-epic    { --rarity-separator-color: rgba(251,191,36,0.25); }
.rarity-legendary { --rarity-separator-color: rgba(232,121,249,0.3); }
```

### 5. Collected State — 集 Hanko Stamp

Remove the "Collected" bar from the info panel bottom. Replace with a vermilion 集 stamp overlaid at the top-right corner of `card-face card-front`. This visually marks the card as owned — like a collector's ownership stamp on a physical card.

Stamp element added inside `card-face card-front` when `collected === true`:

```tsx
{collected && (
  <div
    aria-label="Collected"
    style={{
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 15,
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--hanko)",
      color: "var(--washi)",
      fontFamily: "var(--font-jp)",
      fontSize: 14,
      fontWeight: 900,
      borderRadius: 2,
      transform: "rotate(-5deg)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(244,228,192,0.15)",
      pointerEvents: "none",
    }}
  >
    集
  </div>
)}
```

When `collected` is true in browse mode: nothing renders in the button slot — no button, no bar, no placeholder div. The 集 stamp on the card face is the sole ownership indicator. In collection page, `onCollect` is never passed so the button slot is already absent; only the stamp appears.

### 6. Back Face — Ink Palette

Replace `#18181b` / `#0f0f12` in `.card-back-content` with ink-based values:

```css
.card-back-content {
  background: linear-gradient(180deg, var(--ink-2) 0%, var(--ink-0) 100%);
  /* rest unchanged */
}
```

Genre tags change from pure-white opacity tint to washi-tinted:

```css
.genre-tag {
  background: rgba(244, 228, 192, 0.06);
  color: rgba(244, 228, 192, 0.5);
  border: 1px solid rgba(244, 228, 192, 0.08);
  /* rest unchanged */
}
```

---

## Files Changed

| File | Change |
|---|---|
| `src/components/card/anime-card.tsx` | Move button inside card-front; add rarity stripe div; add 集 stamp; remove h-8 spacer; update info panel style |
| `src/components/card/card.css` | Add `.rarity-stripe` rules; add `--rarity-separator-color` per rarity; update `.card-face` box-shadow; update `.card-back-content` background; update `.genre-tag` |
| `src/app/globals.css` | Change `hanko-btn` border-radius: 2px → 6px |

---

## Out of Scope

- Card dimensions (280×420 full, 180×260 compact) — unchanged
- GSAP tilt, flip, shine, holographic overlay — unchanged
- Rarity border glow ring — unchanged
- Browse / collection page layouts — unchanged
- Compact variant (`variant="compact"`) — gets the stripe and inner border passively; no button changes since compact has no button/flip

---

## Success Criteria

1. Hovering a card on the browse page: artwork and collect button lift and scale as a single unit
2. Button has visibly rounded corners (6px)
3. Rarity is legible at a glance from the stripe before the badge is read
4. Collected cards show a 集 stamp; no disabled "Collected" bar
5. Info panel and back face use the project's ink palette
6. TypeScript check: `npx tsc --noEmit` passes
7. No regressions on the flip interaction or compact variant

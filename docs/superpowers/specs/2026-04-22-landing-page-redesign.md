# Landing Page Redesign — Design Spec

**Date:** 2026-04-22
**Scope:** `src/app/page.tsx`, `src/app/landing.css` (new), `src/app/layout.tsx`
**Status:** Approved — ready for implementation planning

---

## Overview

Two changes in one pass:

1. **Rename to Karuta** — update `<title>`, `<meta description>`, and the visible "Anime Collector" heading text in `page.tsx` to "Karuta".
2. **Floating card background** — 6 anime cards float in the background of the hero, tilted outward from center. No new sections, no feature text. The cards themselves communicate what the product is.

---

## 1. Rename to Karuta

### Files

| File | Change |
|---|---|
| `src/app/layout.tsx` | `metadata.title` → `"Karuta"`, `metadata.description` → `"Collect anime as stylized cards with rarity effects and archive them on your lantern-lit shelf."` |
| `src/app/page.tsx` | `<h1>` text: replace two-line `"ANIME" / "COLLECTOR"` with single-line `"KARUTA"`. "KARU" chars in `--washi` white, "TA" chars in `--lantern-glow` gold — same inline approach, no `<br>`. Char-by-char ripple animation unchanged. Remove the `<br />` and the wrapping gold `<span>`. |

The kanji kicker (`蒐集者の書架`) stays as atmospheric flavor — it is not the product name, it is the subtitle.

---

## 2. Floating Card Background

### Concept

Six static anime cards are absolutely positioned inside the hero `<div>`, behind the existing content. They tilt outward from center (left cards lean left, right cards lean right), float gently on CSS keyframe animations, and are faded by a radial gradient mask that clears the center for text readability. No API call — data is hardcoded.

### Architecture

```
page.tsx (hero div)
  ├── <span class="ambient-lantern" />        ← existing
  ├── <span class="watermark" />              ← existing (kanji 蒐集)
  ├── <div class="landing-cards-layer">       ← NEW — z-index 2
  │     ├── 6× <div class="landing-float-card rarity-{x} lc-{n}">
  │     │         <Image src={...} fill />
  │     └── ::after pseudo — radial gradient mask
  └── <div ref={contentRef} ...>             ← existing content, z-index 10
```

`landing-cards-layer` and all card/animation CSS go in a new `src/app/landing.css` imported at the top of `page.tsx`. This keeps `page.tsx` clean and avoids bloating `globals.css`.

### Card Data (hardcoded)

Six iconic anime, chosen to show visual diversity across rarity tiers:

| Slot | Position | Rarity | Anime | MAL Image URL |
|---|---|---|---|---|
| lc-1 | Far left, top | uncommon | Sword Art Online | `https://cdn.myanimelist.net/images/anime/11/39717.jpg` |
| lc-2 | Left, mid (featured) | epic | Attack on Titan | `https://cdn.myanimelist.net/images/anime/10/47347.jpg` |
| lc-3 | Left-center, low | common | Naruto | `https://cdn.myanimelist.net/images/anime/13/17405.jpg` |
| lc-4 | Far right, top | rare | Death Note | `https://cdn.myanimelist.net/images/anime/9/9453.jpg` |
| lc-5 | Right, mid (featured) | legendary | FMA Brotherhood | `https://cdn.myanimelist.net/images/anime/1223/96541.jpg` |
| lc-6 | Right-center, low | rare | Demon Slayer | `https://cdn.myanimelist.net/images/anime/1286/99889.jpg` |

### Card Visual Treatment

Each card:
- `border-radius: 14px; overflow: hidden`
- `border: 1px solid rgba(244,228,192,.1)` — washi inner border via `box-shadow: inset`
- `::before` — 3px rarity stripe at top (same colors as `card.css`)
- Rarity glow ring on `box-shadow` (legendary purple, epic gold, rare blue — none for common/uncommon)
- `<Image fill sizes="168px" />` rendered with `className` applying `filter: saturate(0.75) brightness(0.65)` — desaturated and dimmed so they read as atmosphere not content. The card div itself must have `position: relative` (in addition to its absolute positioning via CSS) so Next.js `fill` works correctly.

### Positions and Opacities

Left side — tilts lean **left** (negative rotation), farthest from center is most faded:

| Class | left | top | width | height | rotate | opacity |
|---|---|---|---|---|---|---|
| `.lc-1` | 1% | 8% | 130px | 186px | -18deg | 0.28 |
| `.lc-2` | 7% | 30% | 168px | 240px | -12deg | 0.55 |
| `.lc-3` | 19% | 62% | 122px | 174px | -7deg | 0.32 |

Right side — tilts lean **right** (positive rotation):

| Class | right | top | width | height | rotate | opacity |
|---|---|---|---|---|---|---|
| `.lc-4` | 1% | 6% | 130px | 186px | +18deg | 0.28 |
| `.lc-5` | 7% | 28% | 168px | 240px | +12deg | 0.55 |
| `.lc-6` | 19% | 64% | 122px | 174px | +7deg | 0.32 |

### Fade Mask

Applied via `::after` pseudo-element on `.landing-cards-layer`:

```css
.landing-cards-layer::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    ellipse 50% 65% at 50% 50%,
    rgba(5, 7, 16, 0.96) 20%,
    rgba(5, 7, 16, 0.70) 50%,
    transparent 80%
  );
}
```

### Float Animation

Each card has its own `@keyframes` that preserves the rotation while adding a gentle Y-translate. Durations are staggered 7–9.5 s with `animation-delay` offsets so all six never peak at the same moment.

```css
@keyframes lc-float-1 {
  0%, 100% { transform: rotate(-18deg) translateY(0);    }
  50%       { transform: rotate(-18deg) translateY(-14px); }
}
/* ...repeat for lc-float-2 through lc-float-6, matching each card's rotate value */
```

Assigned:

| Card | keyframe | duration | delay |
|---|---|---|---|
| lc-1 | lc-float-1 | 8s | 0s |
| lc-2 | lc-float-2 | 9s | 0.7s |
| lc-3 | lc-float-3 | 7s | 1.4s |
| lc-4 | lc-float-4 | 8.5s | 0.3s |
| lc-5 | lc-float-5 | 9.5s | 1.0s |
| lc-6 | lc-float-6 | 7.5s | 0.5s |

All animations use `ease-in-out infinite`.

### Responsive Behavior

- **≥ 1024px** — all 6 cards visible
- **640–1023px** — hide `lc-1`, `lc-3`, `lc-4`, `lc-6` (far/low cards); show only the two featured mid cards (`lc-2`, `lc-5`)
- **< 640px** — hide all cards (hero text needs full width, cards would crowd it)

---

## Files Changed

| File | Action |
|---|---|
| `src/app/layout.tsx` | Update `metadata` title + description |
| `src/app/page.tsx` | Update h1 text to "KARU"/"TA"; import `landing.css`; add cards layer |
| `src/app/landing.css` | New file — all card layer CSS (positions, rarity stripes, float keyframes, mask, responsive) |

---

## Out of Scope

- Fetching live card data from Jikan or Supabase on the landing page
- Adding feature text, pills, or callouts
- Changing layout beyond the hero (no new sections)
- Parallax scrolling or GSAP animation on the cards (CSS keyframe float only)

# Favorites Flip — Design Spec

**Date:** 2026-04-17
**Status:** Approved

## Overview

A hidden fourth shelf section — Favorites — revealed by a full-page 3D flip animation. Items marked as "favorite" via the existing manga-spine move menu appear in a moonlit gallery with a cool indigo/silver palette, visually distinct from the warm washi shelf.

## Trigger

A small hanko seal bearing the kanji 秘 (secret), positioned in the shelf header on the right side. At rest it sits at ~0.4 opacity. On hover it rotates slightly (±4deg) and brightens to full opacity. A tooltip reads "秘蔵 — Hidden Collection".

Clicking the seal initiates the flip animation to reveal the Favorites view.

## Flip Animation

GSAP-driven double-axis flip with zoom, ~1.0s total:

1. A wrapper div around the entire shelf page content provides `perspective: 1200px`.
2. On trigger, the inner container:
   - Scales to 0.92
   - Rotates 180° on the Y axis
   - Duration: ~1.0s, ease: `power2.inOut`
3. Both the shelf (front face) and favorites (back face) use `backface-visibility: hidden`.
4. The favorites view is pre-rendered on the back face so the flip reveals it seamlessly.
5. On landing, the container is at scale 1.0, rotateY 180°.

Reverse flip (back to shelf): same animation in reverse (rotateY 180° → 0°, with the scale dip).

## Favorites View — Moonlit Gallery

### Palette

The warm shelf palette shifts to a cool moonlit tone:

| Token | Value | Purpose |
|---|---|---|
| `--moon-ink-0` | `#060818` | Deep background |
| `--moon-ink-1` | `#0a0614` | Background end |
| `--moon-silver` | `#c8d0e0` | Primary text (replaces washi) |
| `--moon-silver-dim` | `rgba(200, 208, 224, 0.5)` | Secondary text |
| `--moon-silver-border` | `rgba(200, 208, 224, 0.18)` | Borders |
| `--moon-indigo` | `#1a2a5a` | Accent surfaces |
| `--moon-glow` | `rgba(180, 200, 240, 0.12)` | Ambient light |

### Layout

- **Background:** Linear gradient from `--moon-ink-0` to `--moon-ink-1`, with a radial glow (top-right) simulating moonlight using `--moon-glow`.
- **Watermark:** Large 秘蔵 kanji pair at ~0.04 opacity, centered behind the spines.
- **Header:** "秘蔵 · HIDDEN COLLECTION" in Cinzel, `--moon-silver` color. A count badge shows the number of favorites in a silver-bordered pill.
- **Spines:** Standard `MangaSpine` components rendered in a horizontal scroll, same as the regular scene. No hero mode — all spines are equal in the favorites view.
- **Spine overrides:** Within the moonlit gallery context, spines receive a CSS class that shifts their foil stripe to silver, desaturates cover images slightly (`saturate(0.85)`), and adds a cool shimmer on hover.

### Empty State

- A silver circle containing the kanji 月 (moon)
- Title: "Your hidden collection awaits"
- Subtitle: "Mark any title as a favorite from its spine menu"
- Uses `--moon-silver` / `--moon-silver-dim` for text colors

## Flip Back

Two methods to return to the regular shelf:

1. **Escape key:** A `keydown` listener for Escape, registered when favorites are showing, cleaned up on unmount or flip-back.
2. **秘 seal:** The same seal appears on the favorites side, now rendered in `--moon-silver` with a faint glow. Clicking it triggers the reverse flip.

A subtle hint at the bottom: "ESC to return" in small silver text, fading in after 1.5s.

## Data Layer

No changes needed:

- `"favorite"` is already a valid `AnimeCategory` value.
- The manga-spine move menu already offers "favorite" as a destination.
- `updateCategory(id, "favorite")` works today.
- The shelf page just needs to filter `items.filter(i => i.category === "favorite")` for the favorites view.

## Files

| File | Action | Purpose |
|---|---|---|
| `src/components/shelf/favorites-flip.tsx` | Create | Wrapper component: flip state, GSAP animation, perspective container, Escape listener |
| `src/components/shelf/favorites-scene.tsx` | Create | Moonlit gallery: backdrop, header, spine list, empty state |
| `src/app/shelf/page.tsx` | Modify | Wrap shelf content in `FavoritesFlip`, add 秘 trigger seal to header, pass favorites items |
| `src/app/shelf/shelf.css` | Modify | Add moonlit gallery tokens and styles (`.moon-*` classes) |

## Interactions

- Flip trigger is disabled while the flip animation is in progress (prevent double-fire).
- When flipped to favorites, the regular shelf tabs/scenes are hidden via `backface-visibility` — no pointer events leak through.
- The flip state is local (`useState`) — navigating away and back resets to the regular shelf view.

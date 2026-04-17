# Favorites Reveal — Design Spec

**Date:** 2026-04-17
**Status:** Approved

## Overview

A hidden fourth shelf section — Favorites — revealed by a fusuma sliding-door animation with a moonlight pool atmosphere. Clicking a secret 秘 seal cracks a slit of moonlight down the center of the shelf, then the shelf splits apart like traditional Japanese sliding doors, revealing a starry moonlit gallery beneath. The favorites content rises up from below as the doors open.

## Trigger

A small hanko seal bearing the kanji 秘 (secret), positioned in the shelf header on the right side. At rest it sits at ~0.4 opacity. On hover it rotates slightly (±4deg) and brightens to full opacity. A tooltip reads "秘蔵 — Hidden Collection".

Clicking the seal initiates the reveal animation.

## Reveal Animation

GSAP-driven three-phase fusuma reveal:

1. **Moonlight slit** (~300ms): A bright white-core slit of light appears vertically down the center of the shelf. Intense glow with bloom (`box-shadow` halo).
2. **Doors slide open** (~1.1s, `cubic-bezier(0.4, 0, 0.2, 1)`): The shelf content splits in half — left half slides left, right half slides right — like fusuma doors opening. The slit widens briefly then fades as the gap grows.
3. **Favorites rise** (simultaneous with doors, ~1.0s, `cubic-bezier(0.22, 1, 0.36, 1)`): The moonlit gallery content translates up from `translateY(40px)` to `translateY(0)` and fades in, emerging from below.

Behind the doors: twinkling stars, a moonlight pool radial glow from above, and a ground glow reflection.

**Implementation:** The shelf page is rendered twice inside two door containers (left clips left 50%, right clips right 50%) that sit on top of the favorites layer. When closed, the two halves align seamlessly — no visible seam or doors. The favorites layer with stars/moonlight sits behind at a lower z-index.

### Close Animation

- Favorites sink back down (`translateY(40px)`, opacity 0)
- Doors slide shut simultaneously
- No slit drama on close — clean reverse

## Favorites View — Moonlit Gallery

### Palette

The warm shelf palette shifts to a cool moonlit tone:

| Token              | Value                        | Purpose                       |
| ------------------ | ---------------------------- | ----------------------------- |
| `--moon-ink-0`     | `#060818`                    | Deep background               |
| `--moon-ink-1`     | `#0a0614`                    | Background end                |
| `--moon-silver`    | `#c8d0e0`                    | Primary text (replaces washi) |
| `--moon-silver-dim`| `rgba(200, 208, 224, 0.5)`   | Secondary text                |
| `--moon-silver-border` | `rgba(200, 208, 224, 0.18)` | Borders                    |
| `--moon-indigo`    | `#1a2a5a`                    | Accent surfaces               |
| `--moon-glow`      | `rgba(180, 200, 240, 0.12)`  | Ambient light                 |

### Layout

- **Background:** Linear gradient from `--moon-ink-0` to `--moon-ink-1`.
- **Stars:** ~100 small white dots with random positions and a `twinkle` animation (opacity oscillates 0.15–0.75, staggered delays).
- **Moonlight pool:** Large radial gradient from top-center, simulating moonlight pouring down.
- **Ground glow:** Subtle radial at the bottom reflecting the moonlight.
- **Watermark:** Large 秘蔵 kanji pair at ~0.03 opacity, centered behind the spines.
- **Header:** "Hidden Collection" in Cinzel + 秘蔵 kicker in Noto Serif JP, `--moon-silver` color. A count badge shows the number of favorites in a silver-bordered pill.
- **Spines:** Standard `MangaSpine` components rendered in a horizontal scroll, same as the regular scene. No hero mode — all spines are equal in the favorites view.
- **Spine overrides:** Within the moonlit gallery context, spines receive a CSS class that shifts their foil stripe to silver, desaturates cover images slightly (`saturate(0.85)`), and adds a cool shimmer on hover.

### Empty State

- A silver circle containing the kanji 月 (moon)
- Title: "Your hidden collection awaits"
- Subtitle: "Mark any title as a favorite from its spine menu"
- Uses `--moon-silver` / `--moon-silver-dim` for text colors

## Return to Shelf

Two methods to close the reveal:

1. **Escape key:** A `keydown` listener for Escape, registered when favorites are showing, cleaned up on unmount or close.
2. **秘 seal:** The same seal appears on the favorites side, rendered in `--moon-silver` with a faint glow. Clicking it triggers the close.

A subtle hint at the bottom: "ESC to return" in small silver text, fading in after the doors finish opening.

## Data Layer

No changes needed:

- `"favorite"` is already a valid `AnimeCategory` value.
- The manga-spine move menu already offers "favorite" as a destination.
- `updateCategory(id, "favorite")` works today.
- The shelf page just needs to filter `items.filter(i => i.category === "favorite")` for the favorites view.

## Files

| File                                       | Action | Purpose                                                                        |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------------ |
| `src/components/shelf/favorites-reveal.tsx` | Create | Wrapper component: door halves, slit, GSAP animation, Escape listener          |
| `src/components/shelf/favorites-scene.tsx`  | Create | Moonlit gallery: stars, moonlight pool, header, spine list, empty state        |
| `src/app/shelf/page.tsx`                    | Modify | Wrap shelf content in `FavoritesReveal`, add 秘 trigger seal, pass favorites   |
| `src/app/shelf/shelf.css`                   | Modify | Add moonlit gallery tokens and styles (`.moon-*` classes, stars, slit, doors)  |

## Interactions

- Reveal trigger is disabled while animation is in progress (prevent double-fire).
- When revealed, the doors are off-screen (`translateX(±100%)`) so no pointer events from the shelf leak through.
- The reveal state is local (`useState`) — navigating away and back resets to the regular shelf view.

## Reference Mockup

`mockup-favorites-flip.html` in the project root contains the approved interactive mockup with the exact animation timing, colors, and layout.

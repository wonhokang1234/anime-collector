# Dealer's Choice — Visual Revamp Design Spec

**Date:** 2026-05-17
**Scope:** Browse page, Collection page, card component, page transitions, supporting states
**Goal:** Replace generic grid layouts and weak interactions with a scattered/physical + spatial/cinematic design that feels like a real card-game product

---

## Problem

The current frontend reads as a styled CRUD app:

- Browse and Collection use standard CSS Grid — indistinguishable from any anime listing site
- Page transitions are plain route changes with no sense of scene or movement
- Cards are visually flat with weak hover/collect interactions that have no physical weight or personality

---

## Section 1: Layout & Composition

### Browse Page

**Replace CSS Grid with a custom scattered layout.**

Each card receives:

- A deterministic rotation between **±6°**, seeded from the card's `mal_id` (consistent across renders, not random on each mount)
- A positional jitter of **±10px** from its natural flow position, also seeded deterministically

This creates a "spread on a table" feel without visual chaos. The background surface gets a subtle **washi/paper SVG grain texture** baked into the design system (not a CSS filter overlay — an actual SVG `feTurbulence` pattern at low opacity).

**Deal-in animation on load:**
Cards enter from off-screen in a staggered GSAP sequence. Direction is edge-aware — cards near the top-left deal from the top; cards near the bottom-right deal from the right. They land at their scattered resting positions with slight overshoot (back easing). Total stagger: ~800ms across all cards.

**Search/filter behavior:**

- Non-matching cards: scale to 0.85, desaturate, opacity 0.3 — they recede but don't disappear
- Matching cards: scatter jitter intensifies slightly (they "surge forward")
- Reflow on filter change uses Framer Motion `layout` with spring physics

### Collection Page

Same scattered surface treatment, warmer and more intimate in mood.

**Special case — navigating immediately after collecting:**
The card just collected flies from its Browse screen position directly into its Collection resting spot (Framer Motion `layoutId`). All other cards do the standard staggered deal-in. This is the defining UX moment that ties the two pages together.

**Standard navigation (via navbar):**
Browse cards scatter outward in a radial burst (~300ms), then Collection cards deal in from the edges (~400ms). Total transition: ~600ms. Communicates "scene change," not "page load."

### Technical Notes

- Scatter is CSS transforms layered on top of existing flex/flow — minimal markup restructuring needed
- Per-card `--rotation` and `--jitter-x/y` CSS custom properties, set via inline style from a seeded PRNG (using `mal_id` as seed)
- Framer Motion `motion.div` wraps each card; `layout` prop handles physics reflow on filter
- `layoutId={`card-${mal_id}`}` on every card enables shared element transitions

---

## Section 2: Card Redesign

Cards are rebuilt as physical objects with three layers: structure, material, and interaction.

### Structure & Edge

Cards get visible **card thickness** via a layered `box-shadow` stack:

```
box-shadow:
  0 1px 0 1px #c8b89a,   /* bottom edge */
  0 2px 0 2px #b8a88a,   /* second layer */
  0 3px 0 3px #a8987a;   /* deepest layer */
```

This simulates the edge you see when holding a real card at an angle.

### Rarity Material System

Rarity determines the card's surface treatment:

| Rarity    | Surface                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| Common    | Matte paper — subtle SVG grain, no sheen                                                                      |
| Uncommon  | Soft satin — gentle gradient that shifts with tilt                                                            |
| Rare      | Color satin — tinted satin with stronger shift                                                                |
| Epic      | Foil — color-tinted reflective layer, more pronounced gradient                                                |
| Legendary | Holographic — full rainbow gradient that rotates based on cursor position (like a real holo card under light) |

Holographic implementation: CSS `background` with `hsl(calc(var(--hue-offset) + 0deg), 80%, 60%)` gradient where `--hue-offset` is updated via `pointermove`. Background-size and position shift relative to tilt.

### Cursor-Tracking Tilt

Every card responds to cursor position with 3D tilt:

- Tilt range: **±15°** (X and Y axes)
- Implementation: `pointermove` → update `--rx` and `--ry` CSS custom properties → `transform: rotateX(var(--rx)) rotateY(var(--ry))`
- Spring easing via Framer Motion `useSpring` on the raw values — slight lag makes it feel weighted, not instant
- **Specular highlight**: white radial gradient, 30% opacity, positioned _opposite_ to tilt direction — when card tilts away, light catches the near edge. This is the key detail that reads as physical.

### Hover State

1. `translateZ(20px)` + scale(1.04) — card lifts off the surface
2. Shadow deepens and spreads (blur 40px, spread 8px)
3. Scatter rotation resets to 0° — card straightens as you pick it up
4. Transition in: 80ms. Transition out: 200ms. Asymmetric — fast to pick up, slow to set down.

### Collect Animation

Total duration: ~1.2s. Sequence:

1. **Freeze** (0–100ms): card holds position
2. **Stamp** (100–400ms): hanko seal scales in from 2x to 1x with squash/stretch; red ink bleeds outward via `clip-path` radial animation
3. **Flip** (400–800ms): card rotates 180° on Y-axis; back face shows during flip
4. **Arc to navbar** (800–1200ms): card scales to ~20% while following a bezier arc toward the navbar collection icon (GSAP `motionPath` or manual cubic bezier via keyframes)
5. **Navbar pulse** (1200ms): collection counter icon scales briefly; counter rolls up (slot machine: outgoing number exits upward, incoming enters from below)

---

## Section 3: Page Transitions

### Core Mechanism

Framer Motion `AnimatePresence` at the layout level + `layoutId` on all cards.

### Browse → Card Detail

Clicking a card:

1. Card expands in-place from its scattered position to fill the screen (`layoutId` morph)
2. Surrounding cards scatter outward (radial, 200ms)
3. Background blurs and darkens beneath the expanding card
4. Detail content fades in on top once card reaches full size

Navigating back: reverse. Card shrinks back to its Browse position; scatter reforms around it.

### Browse ↔ Collection (navbar)

- **Exit**: cards scatter outward in a radial burst, 300ms
- **Gap**: 50ms
- **Enter**: new page cards deal in from edges, 400ms staggered

### All Other Transitions (Login, Signup, Shelf, Landing)

Consistent cinematic exit/enter:

- **Exit**: content fades + translates -12px Y (lifts slightly), 250ms
- **Enter**: content fades + translates from +12px Y to 0, 250ms, after 50ms gap

Feels like turning a page.

### Technical Note

`AnimatePresence mode="wait"` at `layout.tsx` level. All page components wrapped in a `motion.div` with consistent `initial/animate/exit` props. Cards use stable `layoutId={`card-${mal_id}`}` to enable cross-page morphing.

---

## Section 4: Supporting Interactions & States

### Search Bar

- Focus state: thin vermilion underline draws from left to right (CSS `scaleX` transform on a pseudo-element), 200ms
- No generic box-shadow or glow

### Loading States

Cards deal in **face-down** — card back (Japanese wave/pattern on existing warm palette) shows first, then flips to reveal content when data arrives. Staggered so it reads as cards being dealt one by one. This replaces skeleton screens entirely and ties loading into the card-game identity.

### Empty States

- **Browse (no results)**: one oversized card back, face-down, centered on the surface. Single serif line below it. No icons or illustrations.
- **Collection (empty)**: faint outlined card shape in scattered position — where a card _would_ be. Communicates absence through the design language itself.

### Navbar Collection Counter

On every collection change: slot-machine roll animation.

- Current number exits upward (translateY -100%, opacity 0), 150ms
- New number enters from below (translateY 100% → 0, opacity 0 → 1), 150ms

---

## What Is Not Changing

- All routing, API calls, state management, auth behavior
- The Shelf page (drag-and-drop book spines — already distinctive)
- The Landing page (separate concern, not in scope)
- Supabase queries, collection store, error handling logic
- Accessibility structure (aria labels, keyboard navigation)

---

## Implementation Phases

1. **Design system additions** — washi texture, card edge shadows, rarity material CSS variables, seeded scatter PRNG utility
2. **Card component rebuild** — tilt physics, specular highlight, rarity materials, hover lift
3. **Collect animation** — GSAP sequence, navbar counter roll
4. **Browse page layout** — scatter layout, deal-in animation, filter spring physics
5. **Collection page layout** — same scatter system, special post-collect fly-in
6. **Page transitions** — `AnimatePresence` at layout level, `layoutId` on cards, Browse↔Collection burst/deal
7. **Loading & empty states** — face-down deal-in, empty state card outlines
8. **Search bar** — underline focus animation, filter surge/recede behavior

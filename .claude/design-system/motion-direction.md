# Karuta — Motion Direction (Editorial Redesign)

**Supersedes:** All prior motion direction. This doc governs the light editorial aesthetic.

---

## 1. Philosophy

Motion is almost invisible — felt but not consciously noticed. Every animation either confirms a meaningful action or reduces perceived load time; nothing else qualifies. The editorial aesthetic demands crispness: interactions resolve in under 200ms, entrances in under 350ms. Nothing blocks interaction. Nothing loops in GSAP. The single exception is the hanko stamp on favorites — this is the one moment of delight, earned by its thematic weight.

---

## 2. `src/lib/motion.ts` — Exact File Content

Replace the entire file with this:

```ts
export const DURATION = {
  instant: 0.08, // pip toggle, button press feedback
  fast: 0.15, // hover state transitions
  base: 0.22, // card entrance, tab switch, toast
  slow: 0.3, // page transition, drawer open
  stamp: 0.32, // hanko stamp only — the single delight moment
} as const;

export const EASE = {
  out: "power2.out",
  inOut: "power2.inOut",
  in: "power2.in",
  stamp: "back.out(2.2)", // spring overshoot — hanko stamp only
} as const;
```

---

## 3. Per-Interaction Specs

### Card Hover (Browse grid, Collection grid)

- CSS `transition` only — no GSAP
- `translateY(-4px)` + `--shadow-card` → `--shadow-hover`
- 150ms ease-out enter, 200ms ease-out leave
- No rotation, no perspective, no 3D. Elevation only.

### Grid Entrance Stagger

- GSAP `fromTo`: `{ opacity:0, y:10 }` → `{ opacity:1, y:0, duration: DURATION.base, ease: EASE.out }`
- Stagger: `{ each: 0.035, from: "start" }` — max 8 cards staggered, rest snap in
- `clearProps: "opacity,transform"` in `onComplete`

### Page Transition

- GSAP in `PageTransition`: `{ opacity:0, y:8 }` → `{ opacity:1, y:0, duration: DURATION.slow, ease: EASE.out }`
- No exit animation — instant out, animated in only

### Tab Switch (Shelf)

- GSAP: `{ opacity:0, y:6 }` → `{ opacity:1, y:0, duration: DURATION.base, ease: EASE.out }`

### Skeleton Pulse

- CSS animation only — no GSAP
- opacity `0.5 → 1 → 0.5`, 1400ms ease-in-out infinite
- Color: `--skeleton-base` (#E8E3DC) — always warm

### Button Press

- CSS `active:` only: `scale(0.97)`, 80ms ease-out

### Toast Enter / Exit

- Enter: `{ opacity:0, y:12 }` → `{ opacity:1, y:0, duration: DURATION.base, ease: EASE.out }`
- Exit: `{ opacity:1 }` → `{ opacity:0, y:-6, duration: DURATION.fast, ease: EASE.in }`

### Hanko Stamp — The One Signature Animation

Triggered on add-to-Favorites. Only spring-eased GSAP in the app.

- Seal: `{ scale:1.4, rotation:-6, opacity:0 }` → `{ scale:1, rotation:0, opacity:1, duration: DURATION.stamp, ease: EASE.stamp }`
- Content fades in simultaneously: `duration: DURATION.base, ease: EASE.out`
- Rule: `EASE.stamp` is used here and nowhere else.

### Mobile Drawer

- CSS transform transition — no GSAP
- Open: `translateX(100%)` → `translateX(0)`, 280ms `cubic-bezier(0.32,0,0,1)`
- Close: `translateX(0)` → `translateX(100%)`, 220ms `cubic-bezier(0.32,0,0,1)`

### Form Input Focus

- CSS only: border-color `--border-default` → `--accent`, 150ms ease-out
- Ring: `0 0 0 2px rgba(196,30,58,0.15)`, 150ms ease-out

---

## 4. Explicit Removals

| Removed                                                            | File                      | Replacement                    |
| ------------------------------------------------------------------ | ------------------------- | ------------------------------ |
| `mousemove` perspective tilt + `isTouchRef` guard                  | `anime-card.tsx`          | CSS elevation hover            |
| Navbar seal drop (`gsap.fromTo` on `sealRef`)                      | `navbar.tsx`              | Remove entirely                |
| Scene cross-fade with y:6 entrance                                 | `shelf/page.tsx`          | Tab-switch spec above          |
| Stagger `each: 0.08`                                               | `scene.tsx`               | 0.035                          |
| `EASE.spring`, `EASE.emphasized`, `EASE.standard`                  | throughout                | New EASE constants             |
| `DURATION.reveal`, `DURATION.revealStagger`, `DURATION.transition` | throughout                | New DURATION constants         |
| Legendary card border glow / `@keyframes rarity-pulse`             | `globals.css`, `card.css` | Removed — no glows on light bg |

---

## 5. Reduced Motion

`MotionProvider` is kept unchanged — sets `gsap.globalTimeline.timeScale(100)` on `prefers-reduced-motion: reduce`.

Add to globals.css:

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton-pulse {
    animation: none;
    opacity: 0.7;
  }
}
```

---

## 6. Advanced Techniques (Futuristic / Organic Layer)

These complement the base interaction specs. All GSAP 3 + CSS only.

### Clip-Path Curtain Reveal (page transitions)

Replaces the plain opacity fade. Content enters as a curtain pulls back.

```ts
gsap.fromTo(
  el,
  { clipPath: "inset(0 0 100% 0)", scale: 1.03 },
  {
    clipPath: "inset(0 0 0% 0)",
    scale: 1,
    duration: DURATION.slow,
    ease: EASE.out,
  },
);
// clearProps: "all" in onComplete
```

Applied to: page route changes, shelf tab switches.

### SplitText Word Reveal (display headings)

GSAP SplitText (free, register plugin). Display headings (48px+) reveal word-by-word sliding up from a clip mask.

```ts
gsap.registerPlugin(SplitText);
const split = new SplitText(headingEl, { type: "words" });
gsap.from(split.words, {
  yPercent: 110,
  opacity: 0,
  duration: DURATION.slow,
  stagger: 0.06,
  ease: EASE.out,
  onComplete: () => split.revert(),
});
```

- Parent must have `overflow: hidden`
- Skip entirely when `prefers-reduced-motion` is active
- Applied to: page titles on Browse, Collection, Shelf, Card Detail, Landing hero

### Ambient Shrine Float (favorites gallery only)

Randomised per-card breathing. Organic because durations differ.

```ts
const duration = 3.5 + Math.random() * 2;
gsap.to(cardEl, {
  y: "-=6",
  duration,
  delay: Math.random() * 2,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1,
});
```

Kill on unmount. Nowhere else in the app.

### Card Spotlight (browse & collection, desktop only)

Pure CSS variable update on `mousemove` — no GSAP. Guard with `window.matchMedia("(hover: hover)")`.

```ts
const handleMove = (e: MouseEvent) => {
  const rect = card.getBoundingClientRect();
  card.style.setProperty(
    "--sx",
    `${((e.clientX - rect.left) / rect.width) * 100}%`,
  );
  card.style.setProperty(
    "--sy",
    `${((e.clientY - rect.top) / rect.height) * 100}%`,
  );
};
```

CSS on `.anime-card::before`: `radial-gradient(circle at var(--sx) var(--sy), rgba(255,255,255,0.55), transparent 65%)` with `mix-blend-mode: soft-light`, `opacity: 0` at rest → `opacity: 1` on hover (CSS transition 200ms).

### Film Grain (static, always on)

Applied via `body::after` pseudo-element in globals.css. `opacity: 0.04`, SVG `feTurbulence` tiled at 200px. No animation — purely static texture. See `new-visual-direction.md` section 14.1 for exact CSS.

### Legendary Foil (rarity tier, CSS only)

`::after` pseudo-element with conic-gradient + `mix-blend-mode: color-dodge` at `opacity: 0.07`, `animation: foil-rotate 8s linear infinite` (`hue-rotate`). Disabled under `prefers-reduced-motion`. See `new-visual-direction.md` section 14.6 for exact CSS.

---

## 7. Updated `src/lib/motion.ts`

```ts
export const DURATION = {
  instant: 0.08,
  fast: 0.15,
  base: 0.22,
  slow: 0.3,
  stamp: 0.32,
} as const;

export const EASE = {
  out: "power2.out",
  inOut: "power2.inOut",
  in: "power2.in",
  stamp: "back.out(2.2)",
} as const;
```

---

## 8. Rules

1. No GSAP tween longer than `DURATION.slow` (300ms) except the hanko stamp and shrine float
2. Shrine float is the only infinite GSAP loop — always killed on unmount
3. Only `EASE.stamp` uses spring easing
4. All GSAP tweens stored in a ref, killed in `useEffect` cleanup
5. `clearProps: "all"` for clip-path transitions; `clearProps: "opacity,transform"` for fade entrances
6. CSS transitions own hover states — GSAP owns entrances, exits, stamp, and shrine
7. SplitText: always `split.revert()` in `onComplete` to restore clean DOM
8. Spotlight: desktop hover only — guard with `(hover: hover)` media query
9. Film grain and foil: CSS only, no JS — cannot be killed or overridden by GSAP

# Dealer's Choice — Visual Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the generic Browse/Collection grid and weak card interactions into a scattered/physical card layout with cursor-tracking tilt, rarity-tier surface materials, a theatrical GSAP collect ceremony, and scene-change page transitions — all using the existing GSAP-only stack.

**Architecture:** Three parallel tracks implemented sequentially: (1) CSS/token additions for surface materials, scatter transforms, and specular highlights; (2) card component rebuild extending the existing GSAP spotlight pattern with tilt physics and a full collect timeline; (3) layout changes replacing CSS Grid with `ScatterCard` wrappers and updating GSAP deal-in animations. No new dependencies — pure GSAP + CSS throughout.

**Tech Stack:** Next.js 16 (App Router), TypeScript, GSAP 3, Tailwind CSS 4, CSS custom properties for per-card scatter state and material overlays.

**Spec:** `docs/superpowers/specs/2026-05-17-dealer-choice-visual-revamp-design.md`

---

## File Map

**Create:**

- `src/lib/scatter.ts` — Seeded PRNG for deterministic per-card scatter transforms (rotation, jitter)
- `src/components/scatter-card.tsx` — Wrapper div that applies scatter CSS vars; resets to 0° on hover via CSS
- `src/components/card/card-back-placeholder.tsx` — Face-down card shown during loading state

**Modify:**

- `src/lib/motion.ts` — Add `COLLECT` and `SCATTER` timing constants
- `src/app/globals.css` — Add: washi texture, card edge thickness shadows, scatter CSS vars, specular highlight, rarity material overlays, card ghost outline, search underline animation
- `src/components/card/anime-card.tsx` — Extend spotlight useEffect with GSAP quickTo tilt + specular; update mousemove for material hue; replace collect ceremony with 5-step GSAP timeline
- `src/app/browse/page.tsx` — Replace CSS Grid with `ScatterCard` wrappers; update GSAP deal-in to edge-aware; add filter recede; add `data-collect-target` to counter; replace SkeletonGrid with face-down cards; replace EmptyState with card ghost; add search underline class
- `src/app/collection/page.tsx` — Same scatter treatment as browse
- `src/components/page-transition.tsx` — More dramatic GSAP enter (slide from below instead of clipPath)

---

## Task 1: Scatter Utility + Motion Constants

**Files:**

- Create: `src/lib/scatter.ts`
- Modify: `src/lib/motion.ts`

- [ ] **Step 1.1: Create `src/lib/scatter.ts`**

```typescript
// Mulberry32 — fast, good distribution, deterministic for a given seed
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ScatterTransform {
  rotation: number; // degrees, range ±6
  jitterX: number; // px, range ±10
  jitterY: number; // px, range ±10
}

export function getScatterTransform(malId: number): ScatterTransform {
  const rand = mulberry32(malId);
  return {
    rotation: (rand() - 0.5) * 12,
    jitterX: (rand() - 0.5) * 20,
    jitterY: (rand() - 0.5) * 20,
  };
}
```

- [ ] **Step 1.2: Read `src/lib/motion.ts` to find where to append**

Read `src/lib/motion.ts` lines 1–42.

- [ ] **Step 1.3: Append constants to the bottom of `src/lib/motion.ts`**

```typescript
export const COLLECT = {
  freeze: 0.1,
  stamp: 0.3,
  flip: 0.4,
  arc: 0.45,
} as const;

export const SCATTER = {
  dealIn: 0.35,
  dealInStagger: 0.055,
  dealInMaxDelay: 0.75,
  burstOut: 0.28,
  filterFade: 0.18,
} as const;
```

- [ ] **Step 1.4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 1.5: Commit**

```bash
git add src/lib/scatter.ts src/lib/motion.ts
git commit -m "feat: add scatter PRNG utility and collect/scatter motion constants"
```

---

## Task 2: CSS System — Washi Texture, Card Edges, Scatter, Specular, Materials, Ghost, Underline

**Files:**

- Modify: `src/app/globals.css`

All additions go at the end of `src/app/globals.css` (append after the last line).

- [ ] **Step 2.1: Read the last 10 lines of globals.css to confirm where to append**

Run: `tail -10 /Users/wonhokang/anime-collector/src/app/globals.css`

- [ ] **Step 2.2: Append washi grain texture**

Add to end of `src/app/globals.css`:

```css
/* ══════════════════════════════════════════════════════════
   DEALER'S CHOICE — visual revamp additions
   ══════════════════════════════════════════════════════════ */

/* ── Washi grain texture (SVG feTurbulence, embedded) ────── */
.washi-surface {
  position: relative;
}
.washi-surface::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.055'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 300px 300px;
  pointer-events: none;
  z-index: 0;
}
```

- [ ] **Step 2.3: Append card edge thickness shadows**

```css
/* ── Card edge thickness (layered box-shadow simulates card depth) ── */
.card-edge-common {
  box-shadow:
    0 1px 0 1px #b8a88a,
    0 2px 0 2px #a89878,
    0 3px 0 3px #988868,
    var(--shadow-card);
}
.card-edge-uncommon {
  box-shadow:
    0 1px 0 1px #5a9b6a,
    0 2px 0 2px #4a8b5a,
    0 3px 0 3px #3a7b4a,
    var(--shadow-card);
}
.card-edge-rare {
  box-shadow:
    0 1px 0 1px #4a7ab0,
    0 2px 0 2px #3a6aa0,
    0 3px 0 3px #2a5a90,
    var(--shadow-card);
}
.card-edge-epic {
  box-shadow:
    0 1px 0 1px #7a5aaa,
    0 2px 0 2px #6a4a9a,
    0 3px 0 3px #5a3a8a,
    var(--shadow-card);
}
.card-edge-legendary {
  box-shadow:
    0 1px 0 1px #b48a3a,
    0 2px 0 2px #a47a2a,
    0 3px 0 3px #946a1a,
    0 0 14px 2px rgba(196, 150, 58, 0.22),
    var(--shadow-card);
}
```

- [ ] **Step 2.4: Append scatter card CSS**

```css
/* ── Scatter card wrapper ─────────────────────────────────── */
.scatter-card {
  transform: rotate(var(--scatter-rotation, 0deg))
    translate(var(--scatter-x, 0px), var(--scatter-y, 0px));
  transition: transform 250ms cubic-bezier(0.25, 0, 0.35, 1);
  will-change: transform;
}
.scatter-card:hover,
.scatter-card:focus-within {
  transform: rotate(0deg) translate(0px, 0px);
}
```

- [ ] **Step 2.5: Append specular highlight CSS**

```css
/* ── Specular highlight (opposite to tilt direction) ─────── */
.card-specular {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle at var(--spec-x, 50%) var(--spec-y, 50%),
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.08) 38%,
    transparent 65%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 80ms ease;
  z-index: 10;
}
.anime-card:hover .card-specular {
  opacity: 1;
}
```

- [ ] **Step 2.6: Append rarity material overlay CSS**

```css
/* ── Rarity surface materials ─────────────────────────────── */
/* common: matte paper — no overlay needed */

.material-uncommon::after,
.material-rare::after,
.material-epic::after,
.material-legendary::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 120ms ease;
  z-index: 9;
}

.material-uncommon::after {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(138, 171, 122, 0.1) 50%,
    rgba(255, 255, 255, 0.06) 100%
  );
  mix-blend-mode: soft-light;
}

.material-rare::after {
  background: linear-gradient(
    calc(var(--material-angle, 135deg)),
    rgba(106, 154, 176, 0.2) 0%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(106, 154, 176, 0.14) 100%
  );
  mix-blend-mode: color-dodge;
}

.material-epic::after {
  background: linear-gradient(
    calc(var(--material-angle, 135deg)),
    rgba(138, 106, 170, 0.28) 0%,
    rgba(220, 180, 255, 0.14) 50%,
    rgba(138, 106, 170, 0.2) 100%
  );
  mix-blend-mode: color-dodge;
}

.material-legendary::after {
  background: linear-gradient(
    calc(var(--holo-angle, 135deg)),
    hsl(calc(var(--holo-hue, 0) * 1deg + 0deg), 85%, 65%) 0%,
    hsl(calc(var(--holo-hue, 0) * 1deg + 72deg), 85%, 65%) 25%,
    hsl(calc(var(--holo-hue, 0) * 1deg + 144deg), 85%, 65%) 50%,
    hsl(calc(var(--holo-hue, 0) * 1deg + 216deg), 85%, 65%) 75%,
    hsl(calc(var(--holo-hue, 0) * 1deg + 288deg), 85%, 65%) 100%
  );
  mix-blend-mode: color-dodge;
}

/* Show material overlays on hover */
.anime-card:hover .material-uncommon::after {
  opacity: 0.9;
}
.anime-card:hover .material-rare::after {
  opacity: 0.65;
}
.anime-card:hover .material-epic::after {
  opacity: 0.75;
}
.anime-card:hover .material-legendary::after {
  opacity: 0.18;
}
```

- [ ] **Step 2.7: Append card ghost (empty state) CSS**

```css
/* ── Card ghost — empty state outline ────────────────────── */
.card-ghost {
  border: 2px dashed rgba(26, 22, 20, 0.14);
  border-radius: 8px;
  background: transparent;
}
```

- [ ] **Step 2.8: Append search underline CSS**

```css
/* ── Search underline draw animation ─────────────────────── */
.search-underline-wrap {
  position: relative;
}
.search-underline-wrap::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 220ms cubic-bezier(0.25, 0, 0.35, 1);
}
.search-underline-wrap:focus-within::after {
  transform: scaleX(1);
}
.search-underline-input:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
```

- [ ] **Step 2.9: Verify dev server compiles**

Run: `npm run dev`
Expected: Compiles without CSS parse errors. Check terminal output.

- [ ] **Step 2.10: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add washi texture, card edges, scatter CSS, specular, rarity materials, ghost, underline"
```

---

## Task 3: ScatterCard Component

**Files:**

- Create: `src/components/scatter-card.tsx`

- [ ] **Step 3.1: Create `src/components/scatter-card.tsx`**

```tsx
import { type ReactNode } from "react";
import { getScatterTransform } from "@/lib/scatter";

interface ScatterCardProps {
  malId: number;
  children: ReactNode;
  className?: string;
}

export function ScatterCard({ malId, children, className }: ScatterCardProps) {
  const { rotation, jitterX, jitterY } = getScatterTransform(malId);

  return (
    <div
      className={`scatter-card${className ? ` ${className}` : ""}`}
      style={
        {
          "--scatter-rotation": `${rotation}deg`,
          "--scatter-x": `${jitterX}px`,
          "--scatter-y": `${jitterY}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3.2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors on the new file.

- [ ] **Step 3.3: Commit**

```bash
git add src/components/scatter-card.tsx
git commit -m "feat: ScatterCard wrapper applies deterministic rotation/jitter via CSS vars"
```

---

## Task 4: Browse Page — Scatter Layout + Edge-Aware Deal-In

**Files:**

- Modify: `src/app/browse/page.tsx`

- [ ] **Step 4.1: Read browse/page.tsx lines 1–70**

Read `src/app/browse/page.tsx` lines 1–70 (imports and GSAP animation useEffect).

- [ ] **Step 4.2: Add ScatterCard import**

In `src/app/browse/page.tsx`, add after existing imports:

```typescript
import { ScatterCard } from "@/components/scatter-card";
import { SCATTER } from "@/lib/motion";
```

- [ ] **Step 4.3: Add washi-surface class to the page wrapper**

Find the outermost `<div>` wrapping the browse page content (the one with `className` and `style` containing padding/max-width). Add `washi-surface` to its `className`.

- [ ] **Step 4.4: Replace GSAP deal-in animation (lines 51–70)**

The current animation targets `gridRef.current.children` with a simple `y: 16 → 0`. Replace the `useEffect` body with the edge-aware deal-in:

```typescript
useEffect(() => {
  if (loading || !gridRef.current) return;
  const cards = Array.from(gridRef.current.children) as HTMLElement[];
  if (cards.length === 0) return;

  const total = cards.length;
  cards.forEach((el, i) => {
    const fraction = i / Math.max(total - 1, 1);
    const fromRight = fraction > 0.6;
    const fromTop = fraction < 0.28;

    gsap.fromTo(
      el,
      {
        opacity: 0,
        x: fromRight ? 70 : fromTop ? 0 : -45,
        y: fromTop ? -70 : fromRight ? 0 : 28,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: SCATTER.dealIn,
        delay: Math.min(i * SCATTER.dealInStagger, SCATTER.dealInMaxDelay),
        ease: EASE.emphasized,
        clearProps: "opacity,x,y",
      },
    );
  });
}, [loading]);
```

- [ ] **Step 4.5: Replace the grid div and card rendering (lines 346–368)**

Find the `<div ref={gridRef} className="grid grid-cols-2 ...">` section. Replace it with:

```tsx
<div
  ref={gridRef}
  className="flex flex-wrap gap-4 sm:gap-6 justify-center px-1"
>
  {results.map((anime) => (
    <ScatterCard key={anime.mal_id} malId={anime.mal_id}>
      <AnimeCard
        title={anime.title}
        imageUrl={anime.images.jpg.large_image_url}
        score={anime.score ?? 0}
        episodes={anime.episodes}
        synopsis={anime.synopsis ?? undefined}
        genres={anime.genres.map((g) => g.name)}
        studio={anime.studios[0]?.name}
        year={getAnimeYear(anime)}
        variant={isMobile ? "compact" : "full"}
        collected={isCollected(anime.mal_id)}
        onCollect={() => handleCollect(anime)}
        isJustCollected={justCollectedId === anime.mal_id}
      />
    </ScatterCard>
  ))}
</div>
```

- [ ] **Step 4.6: Visually verify**

Run: `npm run dev` (if not running). Open http://localhost:3000/browse. Cards should appear with slight rotations, deal in from different edges on load, and straighten on hover.

- [ ] **Step 4.7: Commit**

```bash
git add src/app/browse/page.tsx
git commit -m "feat: browse page scatter layout with edge-aware deal-in animation"
```

---

## Task 5: Browse Page — Filter Recede + Search Underline + Collect Target

**Files:**

- Modify: `src/app/browse/page.tsx`

- [ ] **Step 5.1: Add data-collect-target to the collection counter**

Find lines 173–199 of `src/app/browse/page.tsx` (the `{items.length > 0 && ...}` counter block). Add `data-collect-target="true"` to the `<span>` showing the count:

```tsx
<span
  data-collect-target="true"
  className="font-mono text-base tabular-nums"
  style={{ color: "var(--text-primary)" }}
>
  {items.length.toString().padStart(2, "0")}
</span>
```

- [ ] **Step 5.2: Add search underline class**

Find the search input wrapper `<div className="relative max-w-xl">` (line ~237). Add `search-underline-wrap` to its className:

```tsx
<div className="relative max-w-xl search-underline-wrap">
```

Also add class `search-underline-input` to the `<input>` element and remove the `onFocus`/`onBlur` inline style handlers that set `borderColor` and `boxShadow` (the underline replaces them):

```tsx
<input
  className="search-underline-input"
  type="text"
  value={query}
  onChange={(e) => handleSearch(e.target.value)}
  placeholder="Search the library..."
  style={{
    width: "100%",
    paddingBlock: "0.7rem",
    paddingInlineStart: "2.5rem",
    paddingInlineEnd: "2.5rem",
    background: "var(--bg-card)",
    border: "1px solid var(--border-default)",
    borderRadius: 4,
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    fontSize: "0.9rem",
  }}
/>
```

- [ ] **Step 5.3: Add filter recede state**

Find the state declarations at the top of `BrowsePage`. Add:

```typescript
const [activeQuery, setActiveQuery] = useState("");
```

The existing `query` drives the debounced API call. `activeQuery` will track the live input for immediate CSS feedback. In the `onChange` handler, also call `setActiveQuery(e.target.value)`. In the clear button `onClick`, also call `setActiveQuery("")`.

- [ ] **Step 5.4: Apply recede class to non-matching ScatterCard wrappers**

For filter recede, we need to compare each card against the current `activeQuery`. Since browse only shows results from the API (already filtered), the recede effect applies when there's an active query and results are partial. The simplest approach: when `activeQuery !== ""`, dim all cards briefly as results update, then restore. Use GSAP to animate:

```typescript
// Add a useEffect watching activeQuery:
useEffect(() => {
  if (!gridRef.current || activeQuery === "") return;
  const cards = Array.from(gridRef.current.children) as HTMLElement[];
  // pulse-dim all cards to signal results are updating
  gsap.to(cards, {
    opacity: 0.5,
    scale: 0.96,
    duration: SCATTER.filterFade,
    ease: EASE.out,
    stagger: 0.02,
  });
  return () => {
    gsap.to(cards, {
      opacity: 1,
      scale: 1,
      duration: SCATTER.filterFade,
      ease: EASE.out,
      clearProps: "opacity,scale",
    });
  };
}, [activeQuery]);
```

- [ ] **Step 5.5: Commit**

```bash
git add src/app/browse/page.tsx
git commit -m "feat: collect target, search underline, filter recede animation on browse page"
```

---

## Task 6: Collection Page — Scatter Layout + Edge-Aware Deal-In

**Files:**

- Modify: `src/app/collection/page.tsx`

- [ ] **Step 6.1: Read collection/page.tsx grid and animation sections**

Read `src/app/collection/page.tsx` lines 80–110 (GSAP animation) and lines 240–347 (grid rendering).

- [ ] **Step 6.2: Add ScatterCard import and SCATTER constant**

```typescript
import { ScatterCard } from "@/components/scatter-card";
import { SCATTER } from "@/lib/motion";
```

- [ ] **Step 6.3: Add washi-surface class to page wrapper**

Find the outermost content wrapper div and add `washi-surface` to its className.

- [ ] **Step 6.4: Replace GSAP animation with edge-aware deal-in**

Find the existing GSAP `fromTo` targeting collection cards (lines ~86–102). Replace with the same edge-aware deal-in as Task 4 Step 4.4. The `gridRef` setup and target selector should match the existing pattern in the collection page.

- [ ] **Step 6.5: Replace collection grid with scatter-wrapped cards**

Find the `<div className="grid grid-cols-2 ...">` grid in collection/page.tsx. Replace with flex-wrap + ScatterCard, wrapping the existing collection card `<Link>` elements:

```tsx
<div
  ref={gridRef}
  className="flex flex-wrap gap-4 sm:gap-6 justify-center px-1"
>
  {filteredItems.map((item, index) => (
    <ScatterCard key={item.mal_id} malId={item.mal_id}>
      {/* existing <Link href={`/card/${item.mal_id}`}> and card content, unchanged */}
    </ScatterCard>
  ))}
</div>
```

Keep all existing inner content (image, rarity border, status pip, rarity dots, title strip) exactly as-is.

- [ ] **Step 6.6: Visually verify**

Open http://localhost:3000/collection. Cards should scatter, deal in from edges, and straighten on hover — same as browse.

- [ ] **Step 6.7: Commit**

```bash
git add src/app/collection/page.tsx
git commit -m "feat: collection page scatter layout with edge-aware deal-in"
```

---

## Task 7: Card Tilt + Specular + Material Overlays

**Files:**

- Modify: `src/components/card/anime-card.tsx`

- [ ] **Step 7.1: Read anime-card.tsx lines 34–92**

Read lines 34–92 (component state, refs, and the spotlight `useEffect`).

- [ ] **Step 7.2: Add GSAP quickTo tilt and specular to the spotlight useEffect**

The existing spotlight `useEffect` (lines 64–91) adds `mousemove`/`mouseleave` to `cardRef`. Extend `handleMove` and `handleLeave` to also drive tilt and specular:

Replace the body of the `useEffect` with:

```typescript
useEffect(() => {
  const card = cardRef.current;
  if (!card) return;
  if (!window.matchMedia("(hover: hover)").matches) return;

  // GSAP quickTo for smooth spring-like tilt
  const xTo = gsap.quickTo(card, "rotateX", {
    duration: 0.35,
    ease: "power2.out",
  });
  const yTo = gsap.quickTo(card, "rotateY", {
    duration: 0.35,
    ease: "power2.out",
  });

  const handleMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Spotlight (existing)
    card.style.setProperty(
      "--sx",
      `${((e.clientX - rect.left) / rect.width) * 100}%`,
    );
    card.style.setProperty(
      "--sy",
      `${((e.clientY - rect.top) / rect.height) * 100}%`,
    );

    // Tilt (±15°)
    xTo(((e.clientY - cy) / (rect.height / 2)) * -15);
    yTo(((e.clientX - cx) / (rect.width / 2)) * 15);

    // Specular highlight (opposite to cursor — light catches near edge)
    card.style.setProperty(
      "--spec-x",
      `${100 - ((e.clientX - rect.left) / rect.width) * 100}%`,
    );
    card.style.setProperty(
      "--spec-y",
      `${100 - ((e.clientY - rect.top) / rect.height) * 100}%`,
    );

    // Material angle for rare/epic shimmer
    const angle =
      Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 135;
    card.style.setProperty("--material-angle", `${angle}deg`);
    card.style.setProperty("--holo-angle", `${angle}deg`);

    // Holographic hue for legendary
    card.style.setProperty(
      "--holo-hue",
      `${((e.clientX - rect.left) / rect.width) * 360}`,
    );
  };

  const handleLeave = () => {
    card.style.removeProperty("--sx");
    card.style.removeProperty("--sy");
    card.style.removeProperty("--spec-x");
    card.style.removeProperty("--spec-y");
    xTo(0);
    yTo(0);
  };

  card.addEventListener("mousemove", handleMove);
  card.addEventListener("mouseleave", handleLeave);
  return () => {
    card.removeEventListener("mousemove", handleMove);
    card.removeEventListener("mouseleave", handleLeave);
  };
}, []);
```

- [ ] **Step 7.3: Add a helper to get material and edge classes**

After the `RARITY_LABELS` constant (line 32), add:

```typescript
const RARITY_MATERIAL_CLASS: Record<RarityTier, string> = {
  common: "material-common",
  uncommon: "material-uncommon",
  rare: "material-rare",
  epic: "material-epic",
  legendary: "material-legendary",
};

const RARITY_EDGE_CLASS: Record<RarityTier, string> = {
  common: "card-edge-common",
  uncommon: "card-edge-uncommon",
  rare: "card-edge-rare",
  epic: "card-edge-epic",
  legendary: "card-edge-legendary",
};
```

- [ ] **Step 7.4: Apply edge class and specular div to card faces**

Read `src/components/card/anime-card.tsx` lines 164–200 (the `.card-face.card-front` element).

In the front face div (`.card-face.card-front`), add:

1. The material class: `className={`card-face card-front flex flex-col ${RARITY_MATERIAL_CLASS[rarity]}`}`
2. A `<div className="card-specular" />` as the first child inside the div

In the back face div (`.card-face.card-back`), add:

1. The material class: `className={`card-face card-back ${RARITY_MATERIAL_CLASS[rarity]}`}`
2. A `<div className="card-specular" />` as the first child

- [ ] **Step 7.5: Apply edge class to cardRef element**

In the `<div ref={cardRef}` element (around line 146), add the edge class to its `className`:

```tsx
<div
  ref={cardRef}
  className={`anime-card rarity-${rarity} ${RARITY_EDGE_CLASS[rarity]} ${isCompact ? "anime-card-compact" : ""}`}
  style={{
    width: "100%",
    height: "100%",
    background: "var(--bg-card)",
    border: "1px solid var(--border-default)",
    borderRadius: 6,
    borderLeft: `3px solid ${rarityBorderColor}`,
    /* remove boxShadow here — it's now handled by the edge class */
  }}
  ...
>
```

Note: Remove the `boxShadow: "var(--shadow-card)"` from the inline style since the edge class provides the shadow stack.

- [ ] **Step 7.6: Ensure cardRef has transform-style: preserve-3d for tilt**

The `.card-perspective` parent has `perspective: 1200px`. The `cardRef` div needs `transform-style: preserve-3d` so the `innerRef` flip works through the tilt. Add it to the inline style on `cardRef`:

```tsx
style={{
  width: "100%",
  height: "100%",
  background: "var(--bg-card)",
  border: "1px solid var(--border-default)",
  borderRadius: 6,
  borderLeft: `3px solid ${rarityBorderColor}`,
  transformStyle: "preserve-3d",
}}
```

- [ ] **Step 7.7: TypeScript check and dev verify**

Run: `npx tsc --noEmit`
Expected: No type errors.

Open http://localhost:3000/browse. Hover a card. Confirm:

- Card tilts toward cursor
- Specular highlight appears on opposite side
- Rarity material overlay appears (subtle for common, rainbow shimmer for legendary on hover)
- Card edge shows colored depth layers

- [ ] **Step 7.8: Commit**

```bash
git add src/components/card/anime-card.tsx
git commit -m "feat: cursor-tracking GSAP tilt, specular highlight, rarity material overlays on cards"
```

---

## Task 8: Card Hover Lift — Asymmetric Timing

**Files:**

- Modify: `src/app/globals.css`

- [ ] **Step 8.1: Find current card hover styles in globals.css**

Run: `grep -n "card-hover\|anime-card:hover\|translateY(-4" /Users/wonhokang/anime-collector/src/app/globals.css`

Note the line numbers of any existing card hover translate/shadow styles.

- [ ] **Step 8.2: Add hover lift override after the materials block in globals.css**

Append to the Dealer's Choice section in `src/app/globals.css`:

```css
/* ── Card hover lift — pick-up feel ──────────────────────── */
.anime-card {
  transition: box-shadow 80ms ease;
}
.anime-card:hover {
  box-shadow:
    0 1px 0 1px #b8a88a,
    0 2px 0 2px #a89878,
    0 3px 0 3px #988868,
    0 22px 48px rgba(26, 22, 20, 0.2),
    0 8px 20px rgba(26, 22, 20, 0.12);
}

/* Slower shadow fade on mouse-leave (settling back onto table) */
.anime-card:not(:hover) {
  transition: box-shadow 220ms ease;
}
```

Note: The GSAP tilt (`rotateX`/`rotateY`) handles the 3D lift visually. The `translateZ` effect comes from the perspective projection as the card rotates. The shadow deepening here reinforces the lift illusion.

- [ ] **Step 8.3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: asymmetric card hover shadow (fast in, slow out) for physical lift feel"
```

---

## Task 9: Collect Ceremony GSAP Timeline

**Files:**

- Modify: `src/components/card/anime-card.tsx`

- [ ] **Step 9.1: Read anime-card.tsx lines 116–135 (current collect ceremony)**

Read lines 116–135 to see the current scale-pop timeline.

- [ ] **Step 9.2: Read anime-card.tsx lines 136–230 (JSX to find hanko seal element)**

Read lines 136–230 to find where the "collected" hanko seal is rendered in the JSX.

- [ ] **Step 9.3: Add hankoRef and sealBleedRef**

Find the ref declarations (lines 49–57). Add:

```typescript
const hankoRef = useRef<HTMLDivElement>(null);
const sealBleedRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 9.4: Attach hankoRef to the existing collected seal element**

Find the hanko/collected seal element in the JSX (it shows when `collected === true`, positioned top-right with a rotation). Add `ref={hankoRef}` to it.

Example — it likely looks like:

```tsx
{collected && (
  <div ref={hankoRef} className="..." style={{ ... }}>
    {/* hanko seal content */}
  </div>
)}
```

If `collected` starts as `false` and becomes `true` after collect, make the seal always rendered but conditionally visible using opacity, so the ref is available before `isJustCollected` fires:

```tsx
<div
  ref={hankoRef}
  style={{
    opacity: collected || isJustCollected ? 1 : 0,
    /* keep existing positioning styles */
  }}
>
  {/* existing hanko content */}
</div>
```

- [ ] **Step 9.5: Add sealBleedRef element to front face JSX**

Inside the `.card-face.card-front` div, add the bleed element (absolutely positioned, centered, invisible initially):

```tsx
<div
  ref={sealBleedRef}
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 80,
    height: 80,
    borderRadius: "50%",
    transform: "translate(-50%, -50%) scale(0)",
    background:
      "radial-gradient(circle, rgba(196,30,58,0.55) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 20,
  }}
/>
```

- [ ] **Step 9.6: Add COLLECT import to anime-card.tsx**

Update the import from motion.ts:

```typescript
import { DURATION, EASE, COLLECT } from "@/lib/motion";
```

- [ ] **Step 9.7: Replace collect ceremony useEffect (lines 116–132)**

Replace the current `useEffect` watching `isJustCollected` with the full 5-step timeline:

```typescript
useEffect(() => {
  if (!isJustCollected || !cardRef.current) return;

  const card = cardRef.current;
  const target = document.querySelector<HTMLElement>(
    '[data-collect-target="true"]',
  );

  // Clear any active tilt so it doesn't interfere with arc positioning
  gsap.set(card, { rotateX: 0, rotateY: 0 });

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(card, {
        clearProps: "x,y,scale,rotateX,rotateY,rotateZ,opacity",
      });
    },
  });

  // 1. Freeze
  tl.to(card, { duration: COLLECT.freeze });

  // 2. Stamp hanko seal
  if (hankoRef.current) {
    tl.fromTo(
      hankoRef.current,
      { scale: 2.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: COLLECT.stamp, ease: "back.out(2.8)" },
    );
  }
  if (sealBleedRef.current) {
    tl.fromTo(
      sealBleedRef.current,
      { scale: 0, opacity: 0.8 },
      { scale: 3.5, opacity: 0, duration: COLLECT.stamp, ease: "power2.out" },
      "<",
    );
  }

  // 3. Flip card to back
  tl.to(
    innerRef.current ?? card,
    { rotateY: 180, duration: COLLECT.flip, ease: "power2.inOut" },
    "+=0.08",
  );

  // 4. Arc to collect counter
  if (target) {
    const targetRect = target.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    tl.to(
      card,
      {
        x:
          targetRect.left -
          cardRect.left +
          targetRect.width / 2 -
          cardRect.width / 2,
        y:
          targetRect.top -
          cardRect.top +
          targetRect.height / 2 -
          cardRect.height / 2,
        scale: 0.12,
        duration: COLLECT.arc,
        ease: "power3.in",
      },
      "+=0.08",
    );
  }

  return () => {
    tl.kill();
  };
}, [isJustCollected]);
```

- [ ] **Step 9.8: Test the ceremony end-to-end**

Run: `npm run dev`. Navigate to /browse. Collect a card. Verify in order:

1. Hanko seal bounces in from 3x scale
2. Red bleed radiates outward from center
3. Card flips (back face shows)
4. Card arcs to the "XX Collected" counter in the header, shrinking to ~12% size
5. Card clears/resets after arc completes

- [ ] **Step 9.9: Commit**

```bash
git add src/components/card/anime-card.tsx
git commit -m "feat: 5-step GSAP collect ceremony (stamp, bleed, flip, arc, reset)"
```

---

## Task 10: Loading State — Face-Down Card Backs

**Files:**

- Create: `src/components/card/card-back-placeholder.tsx`
- Modify: `src/app/browse/page.tsx`

- [ ] **Step 10.1: Create `src/components/card/card-back-placeholder.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SCATTER, EASE } from "@/lib/motion";

interface CardBackPlaceholderProps {
  index: number;
  variant?: "full" | "compact";
}

const DIMS = {
  full: { w: 280, h: 420 },
  compact: { w: 180, h: 260 },
};

export function CardBackPlaceholder({
  index,
  variant = "compact",
}: CardBackPlaceholderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { w, h } = DIMS[variant];

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: -36 },
      {
        opacity: 1,
        y: 0,
        duration: SCATTER.dealIn,
        delay: Math.min(index * SCATTER.dealInStagger, SCATTER.dealInMaxDelay),
        ease: "back.out(1.4)",
        clearProps: "opacity,y",
      },
    );
  }, [index]);

  return (
    <div
      ref={ref}
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        background: "var(--washi, #f4e4c0)",
        border: "1px solid rgba(26,22,20,0.10)",
        boxShadow: "var(--shadow-card)",
        backgroundImage: `repeating-linear-gradient(
          45deg,
          rgba(0,0,0,0.025) 0px,
          rgba(0,0,0,0.025) 1px,
          transparent 1px,
          transparent 9px
        )`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.2rem",
          color: "rgba(26,22,20,0.10)",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        牌
      </span>
    </div>
  );
}
```

- [ ] **Step 10.2: Replace SkeletonGrid with CardBackPlaceholder in browse/page.tsx**

Find the loading state render in browse/page.tsx (where `<SkeletonGrid ...>` is rendered). Replace it with:

```tsx
import { CardBackPlaceholder } from "@/components/card/card-back-placeholder";

{
  loading && (
    <div className="flex flex-wrap gap-4 sm:gap-6 justify-center px-1 pt-4">
      {Array.from({ length: 12 }, (_, i) => (
        <CardBackPlaceholder
          key={i}
          index={i}
          variant={isMobile ? "compact" : "full"}
        />
      ))}
    </div>
  );
}
```

You can keep the `SkeletonGrid` import if it's used elsewhere; otherwise remove it.

- [ ] **Step 10.3: Visually verify loading state**

Open http://localhost:3000/browse. Use browser DevTools → Network → Slow 3G. Face-down cards with 牌 character should deal in while loading, then be replaced by real cards.

- [ ] **Step 10.4: Commit**

```bash
git add src/components/card/card-back-placeholder.tsx src/app/browse/page.tsx
git commit -m "feat: face-down card back placeholders replace skeleton grid in browse"
```

---

## Task 11: Empty States Redesign

**Files:**

- Modify: `src/app/browse/page.tsx`
- Modify: `src/app/collection/page.tsx`

- [ ] **Step 11.1: Find and replace browse empty state**

Find the section in browse/page.tsx that renders when `!loading && !error && results.length === 0` (or where `<EmptyState>` is used for no-results). Replace the `EmptyState` component with:

```tsx
{
  !loading && !error && results.length === 0 && (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBlock: "6rem",
        gap: "1.5rem",
      }}
    >
      <div
        className="card-ghost"
        style={{
          width: 180,
          height: 260,
          transform: "rotate(-5deg)",
          opacity: 0.5,
        }}
      />
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.05rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
        }}
      >
        No cards found
      </p>
    </div>
  );
}
```

- [ ] **Step 11.2: Find and replace collection empty state**

Find the empty state in collection/page.tsx (when `items.length === 0`). Replace with:

```tsx
{
  items.length === 0 && (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBlock: "8rem",
        gap: "1.75rem",
      }}
    >
      <div style={{ position: "relative", width: 220, height: 300 }}>
        <div
          className="card-ghost"
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotate(-6deg)",
            opacity: 0.45,
          }}
        />
        <div
          className="card-ghost"
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotate(3deg)",
            opacity: 0.2,
          }}
        />
      </div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          textAlign: "center",
          maxWidth: 240,
          lineHeight: 1.5,
        }}
      >
        Your collection is empty.
        <br />
        Browse and collect.
      </p>
    </div>
  );
}
```

- [ ] **Step 11.3: Commit**

```bash
git add src/app/browse/page.tsx src/app/collection/page.tsx
git commit -m "feat: card ghost outline empty states for browse and collection"
```

---

## Task 12: Page Transition Enhancement

**Files:**

- Modify: `src/components/page-transition.tsx`

- [ ] **Step 12.1: Read current page-transition.tsx**

Read `src/components/page-transition.tsx` full file (already read earlier — 45 lines, uses GSAP clipPath).

- [ ] **Step 12.2: Replace clipPath entrance with slide-from-below**

The current clipPath (`inset(0 0 100% 0)`) feels mechanical. Replace with a slide-from-below + fade that feels like turning a page. Update the GSAP `fromTo` in the `useEffect`:

```typescript
useEffect(() => {
  if (!ref.current) return;
  const el = ref.current;

  const tween = gsap.fromTo(
    el,
    { opacity: 0, y: 14 },
    {
      opacity: 1,
      y: 0,
      duration: DURATION.slow,
      ease: EASE.enter,
      clearProps: "opacity,transform",
      onComplete: () => {
        if (el) el.style.transform = "";
      },
      onInterrupt: () => {
        gsap.set(el, { clearProps: "all" });
        if (el) el.style.transform = "";
      },
    },
  );
  return () => {
    tween.kill();
  };
}, [pathname]);
```

- [ ] **Step 12.3: Verify transitions feel correct**

Click between all nav links (Browse, Collection, Shelf). Each page should slide up from +14px to 0 with an opacity fade. Should feel like cards being laid down, not a clip reveal.

- [ ] **Step 12.4: Commit**

```bash
git add src/components/page-transition.tsx
git commit -m "feat: replace clipPath page transition with cinematic slide-from-below"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement                              | Task       |
| --------------------------------------------- | ---------- |
| Washi grain texture on surface                | Task 2     |
| Deterministic scatter per-card                | Tasks 1, 3 |
| ScatterCard flex layout (browse + collection) | Tasks 4, 6 |
| Edge-aware deal-in animation on load          | Tasks 4, 6 |
| Filter surge/recede with GSAP                 | Task 5     |
| `data-collect-target` for collect arc         | Task 5     |
| Search bar underline draw animation           | Task 5     |
| Card edge thickness shadows (rarity-tiered)   | Task 2     |
| Rarity material overlays (5 tiers + holo)     | Tasks 2, 7 |
| Cursor-tracking tilt via GSAP quickTo         | Task 7     |
| Specular highlight opposite to cursor         | Task 7     |
| Material angle/hue updated on mousemove       | Task 7     |
| Asymmetric hover shadow lift                  | Task 8     |
| 5-step collect ceremony GSAP timeline         | Task 9     |
| Face-down card deal-in loading state          | Task 10    |
| Card ghost empty state (browse + collection)  | Task 11    |
| Slide-from-below page transitions             | Task 12    |

All 17 spec requirements covered across 12 tasks.

**Placeholder scan:** No TBD, TODO, or incomplete steps. Every step has exact file paths, real code, or explicit commands with expected output.

**Type consistency:**

- `ScatterTransform` (Task 1) → used in `ScatterCard` (Task 3) via `getScatterTransform` — consistent
- `COLLECT`, `SCATTER` (Task 1) → used in Tasks 4, 5, 6, 9, 10 — consistent
- `RARITY_MATERIAL_CLASS`, `RARITY_EDGE_CLASS` (Task 7) — defined and applied in same task
- `hankoRef`, `sealBleedRef`, `innerRef` (Task 9) — all defined as `useRef<HTMLDivElement>(null)` in Task 7 and Task 9; `innerRef` already exists at line 50 of `anime-card.tsx`

**One known step requiring judgment:**

- Task 9.4 says to find the hanko seal element in JSX "around line 200+". The exact line is unknown without reading that section. The implementer should read lines 200–290 of `anime-card.tsx` first to locate it.

# Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the app to "Karuta" in browser metadata and hero h1, and add six floating anime card decorations to the landing page hero background.

**Architecture:** Three files change: `layout.tsx` for metadata, a new `src/app/landing.css` for all card-layer CSS (positions, rarity stripes, float keyframes, mask pseudo-element, responsive breakpoints), and `src/app/page.tsx` which imports `landing.css`, rewrites the `<h1>` from "ANIME / COLLECTOR" to single-line "KARUTA" (KARU white, TA gold), and inserts a `landing-cards-layer` div between the watermark and the content. `cdn.myanimelist.net` is already whitelisted in `next.config.ts`. No tests — verify visually in browser.

**Tech Stack:** Next.js 15 App Router, React, CSS keyframe animations, `next/image` with `fill` prop, Tailwind CSS.

---

## Files

| File | Action | Responsibility |
|---|---|---|
| `src/app/layout.tsx` | Modify lines 31–33 | Update `metadata.title` and `metadata.description` |
| `src/app/landing.css` | Create | All card-layer CSS: positions, rarity visuals, float keyframes, fade mask, responsive |
| `src/app/page.tsx` | Modify | Add `Image` + `landing.css` imports; rewrite h1 to "KARUTA"; add cards layer div |

---

### Task 1: Update metadata

**Files:**
- Modify: `src/app/layout.tsx:31-33`

- [ ] **Step 1: Replace the metadata object**

Open `src/app/layout.tsx`. Find lines 31–33:

```tsx
export const metadata: Metadata = {
  title: "Anime Collector",
  description: "Collect anime as stylized cards and organize them on your shelf",
};
```

Replace with:

```tsx
export const metadata: Metadata = {
  title: "Karuta",
  description: "Collect anime as stylized cards with rarity effects and archive them on your lantern-lit shelf.",
};
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "rename: update metadata title and description to Karuta"
```

---

### Task 2: Create landing.css

**Files:**
- Create: `src/app/landing.css`

- [ ] **Step 1: Create the file with this exact content**

Create `src/app/landing.css`:

```css
/* ── Landing page floating card background ── */

.landing-cards-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

/* Radial vignette — fades cards toward the text center */
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

/* ── Base card ── */

.landing-float-card {
  position: absolute;
  border-radius: 14px;
  overflow: hidden;
}

/* Rarity stripe at top */
.landing-float-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 3;
  border-radius: 14px 14px 0 0;
}

/* Washi inner border overlay */
.landing-float-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(244, 228, 192, 0.1);
  z-index: 4;
  pointer-events: none;
}

/* Card image (applied via className on Next.js <Image>) */
.lc-img {
  object-fit: cover;
  filter: saturate(0.75) brightness(0.65);
}

/* ── Rarity stripes and glow rings ── */

.landing-float-card.rarity-legendary {
  box-shadow:
    0 0 0 2px rgba(139, 92, 246, 0.35),
    0 12px 48px rgba(0, 0, 0, 0.7);
}
.landing-float-card.rarity-legendary::before {
  background: linear-gradient(
    90deg,
    #ef4444, #f97316, #eab308, #22c55e,
    #3b82f6, #8b5cf6, #ec4899, #ef4444
  );
  background-size: 200% 100%;
  animation: lc-foil 4s linear infinite;
}

.landing-float-card.rarity-epic {
  box-shadow:
    0 0 0 2px rgba(245, 158, 11, 0.3),
    0 12px 40px rgba(0, 0, 0, 0.65);
}
.landing-float-card.rarity-epic::before {
  background: linear-gradient(90deg, #b45309, #fbbf24, #b45309);
}

.landing-float-card.rarity-rare {
  box-shadow:
    0 0 0 2px rgba(59, 130, 246, 0.28),
    0 10px 36px rgba(0, 0, 0, 0.6);
}
.landing-float-card.rarity-rare::before {
  background: linear-gradient(90deg, #2563eb, #60a5fa, #2563eb);
}

.landing-float-card.rarity-uncommon {
  box-shadow:
    0 0 0 1px rgba(52, 211, 153, 0.2),
    0 8px 30px rgba(0, 0, 0, 0.55);
}
.landing-float-card.rarity-uncommon::before {
  background: linear-gradient(90deg, #059669, #34d399, #059669);
}

.landing-float-card.rarity-common {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
}
.landing-float-card.rarity-common::before {
  background: #a1a1aa;
}

@keyframes lc-foil {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

/* ── Card positions ── */

/* LEFT SIDE — negative rotation (lean outward/left) */
.lc-1 {
  left: 1%;
  top: 8%;
  width: 130px;
  height: 186px;
  opacity: 0.28;
  animation: lc-float-1 8s ease-in-out infinite 0s;
}
.lc-2 {
  left: 7%;
  top: 30%;
  width: 168px;
  height: 240px;
  opacity: 0.55;
  animation: lc-float-2 9s ease-in-out infinite 0.7s;
}
.lc-3 {
  left: 19%;
  top: 62%;
  width: 122px;
  height: 174px;
  opacity: 0.32;
  animation: lc-float-3 7s ease-in-out infinite 1.4s;
}

/* RIGHT SIDE — positive rotation (lean outward/right) */
.lc-4 {
  right: 1%;
  top: 6%;
  width: 130px;
  height: 186px;
  opacity: 0.28;
  animation: lc-float-4 8.5s ease-in-out infinite 0.3s;
}
.lc-5 {
  right: 7%;
  top: 28%;
  width: 168px;
  height: 240px;
  opacity: 0.55;
  animation: lc-float-5 9.5s ease-in-out infinite 1s;
}
.lc-6 {
  right: 19%;
  top: 64%;
  width: 122px;
  height: 174px;
  opacity: 0.32;
  animation: lc-float-6 7.5s ease-in-out infinite 0.5s;
}

/* ── Float keyframes — each preserves the card's tilt while adding vertical drift ── */

@keyframes lc-float-1 {
  0%, 100% { transform: rotate(-18deg) translateY(0);     }
  50%       { transform: rotate(-18deg) translateY(-14px); }
}
@keyframes lc-float-2 {
  0%, 100% { transform: rotate(-12deg) translateY(0);     }
  50%       { transform: rotate(-12deg) translateY(-10px); }
}
@keyframes lc-float-3 {
  0%, 100% { transform: rotate(-7deg) translateY(0);      }
  50%       { transform: rotate(-7deg) translateY(-12px);  }
}
@keyframes lc-float-4 {
  0%, 100% { transform: rotate(18deg) translateY(0);     }
  50%       { transform: rotate(18deg) translateY(-14px); }
}
@keyframes lc-float-5 {
  0%, 100% { transform: rotate(12deg) translateY(0);     }
  50%       { transform: rotate(12deg) translateY(-10px); }
}
@keyframes lc-float-6 {
  0%, 100% { transform: rotate(7deg) translateY(0);      }
  50%       { transform: rotate(7deg) translateY(-12px);  }
}

/* ── Responsive ── */

/* 640–1023px: show only featured mid cards (lc-2, lc-5) */
@media (max-width: 1023px) {
  .lc-1,
  .lc-3,
  .lc-4,
  .lc-6 {
    display: none;
  }
}

/* < 640px: hide all cards */
@media (max-width: 639px) {
  .lc-2,
  .lc-5 {
    display: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/landing.css
git commit -m "feat: add landing.css with floating card layer styles"
```

---

### Task 3: Update page.tsx

**Files:**
- Modify: `src/app/page.tsx`

Three targeted edits: add imports, rewrite h1, insert cards layer.

- [ ] **Step 1: Add imports**

The current top of `src/app/page.tsx` reads:

```tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useRef } from "react";
import gsap from "gsap";
```

Replace with:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./landing.css";
```

- [ ] **Step 2: Rewrite the h1**

Find the current `<h1>` block (lines 120–133 in the original file):

```tsx
        <h1
          className="display-title text-5xl font-extrabold leading-[0.95] sm:text-6xl md:text-[5.75rem]"
          style={{ letterSpacing: "0.06em" }}
        >
          {"ANIME".split("").map((char, i) => (
            <span key={`a${i}`} className="title-char inline-block">{char}</span>
          ))}
          <br />
          <span style={{ color: "var(--lantern-glow)" }}>
            {"COLLECTOR".split("").map((char, i) => (
              <span key={`c${i}`} className="title-char inline-block">{char}</span>
            ))}
          </span>
        </h1>
```

Replace with:

```tsx
        <h1
          className="display-title text-5xl font-extrabold leading-[0.95] sm:text-6xl md:text-[5.75rem]"
          style={{ letterSpacing: "0.06em" }}
        >
          {"KARU".split("").map((char, i) => (
            <span key={`k${i}`} className="title-char inline-block">{char}</span>
          ))}
          <span style={{ color: "var(--lantern-glow)" }}>
            {"TA".split("").map((char, i) => (
              <span key={`t${i}`} className="title-char inline-block">{char}</span>
            ))}
          </span>
        </h1>
```

Key changes: `"ANIME"` → `"KARU"` (no color span, uses default washi white), `"COLLECTOR"` → `"TA"` (kept inside lantern-glow span), `<br />` removed. The `title-char` class and GSAP ripple animation are unchanged — the querySelectorAll(".title-char") will now animate 6 chars (K, A, R, U, T, A).

- [ ] **Step 3: Insert the cards layer**

The current hero div contains the watermark span followed immediately by `<div ref={contentRef}`:

```tsx
      {/* background kanji watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{
          fontFamily: "var(--font-jp)",
          fontSize: "clamp(18rem, 38vw, 32rem)",
          color: "rgba(244, 217, 138, 0.045)",
          lineHeight: 1,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      >
        蒐集
      </span>

      <div ref={contentRef} className="relative z-10 flex flex-col items-center">
```

Insert the cards layer div between the closing `</span>` and `<div ref={contentRef}`:

```tsx
      {/* background kanji watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{
          fontFamily: "var(--font-jp)",
          fontSize: "clamp(18rem, 38vw, 32rem)",
          color: "rgba(244, 217, 138, 0.045)",
          lineHeight: 1,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      >
        蒐集
      </span>

      {/* Floating card background layer */}
      <div className="landing-cards-layer" aria-hidden>
        <div className="landing-float-card rarity-uncommon lc-1">
          <Image src="https://cdn.myanimelist.net/images/anime/11/39717.jpg" alt="" fill sizes="168px" className="lc-img" />
        </div>
        <div className="landing-float-card rarity-epic lc-2">
          <Image src="https://cdn.myanimelist.net/images/anime/10/47347.jpg" alt="" fill sizes="168px" className="lc-img" />
        </div>
        <div className="landing-float-card rarity-common lc-3">
          <Image src="https://cdn.myanimelist.net/images/anime/13/17405.jpg" alt="" fill sizes="168px" className="lc-img" />
        </div>
        <div className="landing-float-card rarity-rare lc-4">
          <Image src="https://cdn.myanimelist.net/images/anime/9/9453.jpg" alt="" fill sizes="168px" className="lc-img" />
        </div>
        <div className="landing-float-card rarity-legendary lc-5">
          <Image src="https://cdn.myanimelist.net/images/anime/1223/96541.jpg" alt="" fill sizes="168px" className="lc-img" />
        </div>
        <div className="landing-float-card rarity-rare lc-6">
          <Image src="https://cdn.myanimelist.net/images/anime/1286/99889.jpg" alt="" fill sizes="168px" className="lc-img" />
        </div>
      </div>

      <div ref={contentRef} className="relative z-10 flex flex-col items-center">
```

Card data used:
- lc-1 (uncommon): Sword Art Online — `anime/11/39717.jpg`
- lc-2 (epic): Attack on Titan — `anime/10/47347.jpg`
- lc-3 (common): Naruto — `anime/13/17405.jpg`
- lc-4 (rare): Death Note — `anime/9/9453.jpg`
- lc-5 (legendary): FMA Brotherhood — `anime/1223/96541.jpg`
- lc-6 (rare): Demon Slayer — `anime/1286/99889.jpg`

The `landing-cards-layer` div is a sibling of `contentRef` (outside it), so the GSAP `children` index array in the existing `useEffect` is unaffected.

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rename hero to KARUTA and add floating card background layer"
```

---

### Task 4: Visual verification

**Files:** none

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 2: Verify at ≥ 1024px (desktop)**

At full desktop width, confirm:
- Browser tab reads "Karuta"
- Hero h1 reads "KARUTA" — "KARU" in washi white, "TA" in lantern gold, on one line
- Seal stamp-in and char ripple animations play on load (unchanged)
- Six cards visible in background, three per side, tilted outward from center
- Cards float gently with staggered timing — no two peak at the same moment
- Rarity stripes at top of each card (green on lc-1, gold on lc-2, gray on lc-3, blue on lc-4, rainbow foil on lc-5, blue on lc-6)
- lc-2 and lc-5 have subtle glow rings (gold and purple respectively)
- Center radial gradient makes text fully readable — cards visibly fade toward center
- CTAs and all content are clickable and unaffected

- [ ] **Step 3: Verify at 640–1023px (tablet)**

Resize browser to 800px wide. Confirm:
- Only lc-2 (left featured) and lc-5 (right featured) are visible
- lc-1, lc-3, lc-4, lc-6 are hidden

- [ ] **Step 4: Verify at < 640px (mobile)**

Resize browser to 375px wide. Confirm:
- All cards are hidden
- Hero text is fully readable, no crowding

- [ ] **Step 5: Commit any visual tweaks**

If you adjusted any values in `landing.css` during verification:

```bash
git add src/app/landing.css
git commit -m "fix: adjust card positions/opacity after visual verification"
```

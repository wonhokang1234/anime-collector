# Favorites Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hidden Favorites section to the shelf page, revealed by a fusuma sliding-door animation with moonlight pool atmosphere.

**Architecture:** The shelf page content is rendered inside two door containers (left clips left 50%, right clips right 50%). Behind them sits a favorites layer with stars, moonlight, and the gallery content. Clicking a 秘 seal triggers a GSAP timeline: moonlight slit → doors slide → favorites rise. The data layer already supports `"favorite"` as an `AnimeCategory`.

**Tech Stack:** React 19, GSAP 3, Next.js 16, TypeScript, Tailwind CSS 4

**Reference mockup:** `mockup-favorites-flip.html` in project root has approved animation timing and colors.

---

### Task 1: Add moonlit gallery CSS tokens and styles to shelf.css

**Files:**
- Modify: `src/app/shelf/shelf.css`

- [ ] **Step 1: Add moonlit gallery tokens and star animation**

Append to the end of `src/app/shelf/shelf.css`:

```css
/* ── Moonlit gallery (favorites) ── */
.moon-gallery {
  --moon-ink-0: #060818;
  --moon-ink-1: #0a0614;
  --moon-silver: #c8d0e0;
  --moon-silver-dim: rgba(200, 208, 224, 0.5);
  --moon-silver-border: rgba(200, 208, 224, 0.18);
  --moon-indigo: #1a2a5a;
}

/* Stars */
.moon-star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.75; }
}

/* Moonlight pool from above */
.moon-pool {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 130%;
  height: 75%;
  background: radial-gradient(
    ellipse at 50% -5%,
    rgba(180, 200, 240, 0.2) 0%,
    rgba(180, 200, 240, 0.08) 30%,
    rgba(140, 170, 220, 0.03) 55%,
    transparent 75%
  );
  pointer-events: none;
}

/* Ground reflection */
.moon-ground {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 25%;
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(180, 200, 240, 0.07) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* Spine overrides inside moonlit gallery */
.moon-gallery .spine-foil-common,
.moon-gallery .spine-foil-uncommon,
.moon-gallery .spine-foil-rare,
.moon-gallery .spine-foil-epic {
  background: linear-gradient(90deg, #8a9ab0, #c8d0e0, #8a9ab0);
}
.moon-gallery .spine-foil-legendary {
  background: linear-gradient(90deg, #8a9ab0, #c8d0e0, #e8eaf0, #c8d0e0, #8a9ab0);
  background-size: 200% 100%;
  animation: foil-shimmer 6s linear infinite;
  box-shadow: 0 0 6px rgba(180, 200, 240, 0.4);
}

/* ── Fusuma door system ── */
.fusuma-door {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  overflow: hidden;
  z-index: 10;
  will-change: transform;
}
.fusuma-door-left { left: 0; }
.fusuma-door-right { right: 0; }

.fusuma-content {
  position: absolute;
  top: 0;
  width: 200%;
  height: 100%;
}
.fusuma-door-left .fusuma-content { left: 0; }
.fusuma-door-right .fusuma-content { left: -100%; }

/* Moon slit */
.moon-slit {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  z-index: 9;
  pointer-events: none;
}
```

- [ ] **Step 2: Verify CSS parses correctly**

Run: `npx tsc --noEmit`
Expected: No errors (CSS is not type-checked, but this confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add src/app/shelf/shelf.css
git commit -m "Add moonlit gallery and fusuma door CSS to shelf styles"
```

---

### Task 2: Create FavoritesScene component

**Files:**
- Create: `src/components/shelf/favorites-scene.tsx`

This component renders the moonlit gallery behind the fusuma doors: stars, moonlight pool, header, spines, and empty state.

- [ ] **Step 1: Create the favorites-scene component**

Create `src/components/shelf/favorites-scene.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import { MangaSpine } from "./manga-spine";

interface FavoritesSceneProps {
  items: CollectedAnime[];
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

export function FavoritesScene({
  items,
  onMove,
  onEpisodeChange,
  onRemove,
}: FavoritesSceneProps) {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = starsRef.current;
    if (!container || container.childElementCount > 0) return;
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("span");
      star.className = "moon-star";
      const size = Math.random() * 2 + 0.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      star.style.animationDuration = `${2 + Math.random() * 4}s`;
      container.appendChild(star);
    }
  }, []);

  return (
    <div
      className="moon-gallery absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, var(--moon-ink-0), var(--moon-ink-1))",
      }}
    >
      {/* Stars */}
      <div ref={starsRef} className="absolute inset-0 pointer-events-none" />

      {/* Moonlight */}
      <span className="moon-pool" aria-hidden />
      <span className="moon-ground" aria-hidden />

      {/* Watermark */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{
          fontFamily: "var(--font-jp)",
          fontSize: "14rem",
          fontWeight: 900,
          color: "rgba(200, 208, 224, 0.03)",
          letterSpacing: "0.1em",
        }}
      >
        秘蔵
      </div>

      {/* Content */}
      <div className="relative z-10 h-full px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <h2
              className="text-xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--moon-silver)",
                letterSpacing: "0.04em",
              }}
            >
              Hidden Collection
            </h2>
            <span
              style={{
                fontFamily: "var(--font-jp)",
                fontSize: "0.65rem",
                color: "var(--moon-silver-dim)",
                letterSpacing: "0.3em",
              }}
            >
              秘蔵
            </span>
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded"
            style={{
              border: "1px solid var(--moon-silver-border)",
              background: "rgba(26, 42, 90, 0.4)",
              color: "var(--moon-silver)",
              fontFamily: "var(--font-display)",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span
              aria-hidden
              className="inline-block w-1.5 h-1.5 rounded-sm"
              style={{
                background: "var(--moon-silver)",
                boxShadow: "0 0 4px rgba(200,208,224,0.4)",
              }}
            />
            {items.length} {items.length === 1 ? "Title" : "Titles"}
          </div>
        </div>

        {/* Spines or empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full"
              style={{
                border: "1px solid var(--moon-silver-border)",
                fontFamily: "var(--font-jp)",
                fontSize: "1.8rem",
                fontWeight: 900,
                color: "var(--moon-silver-dim)",
              }}
            >
              月
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                letterSpacing: "0.08em",
                color: "var(--moon-silver)",
              }}
            >
              Your hidden collection awaits
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--moon-silver-dim)",
                letterSpacing: "0.05em",
              }}
            >
              Mark any title as a favorite from its spine menu
            </p>
          </div>
        ) : (
          <div
            className="shelf-scroll flex gap-3 overflow-x-auto pb-6"
            style={{ paddingTop: 28, alignItems: "flex-end", minHeight: 320 }}
          >
            {items.map((item) => (
              <MangaSpine
                key={item.id}
                item={item}
                tone="watched"
                onMove={onMove}
                onEpisodeChange={onEpisodeChange}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

Note: We pass `tone="watched"` to `MangaSpine` because favorites don't have hero mode or episode stepping. The CSS class `.moon-gallery` overrides the foil colors to silver.

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/favorites-scene.tsx
git commit -m "Add FavoritesScene moonlit gallery component"
```

---

### Task 3: Create FavoritesReveal wrapper component

**Files:**
- Create: `src/components/shelf/favorites-reveal.tsx`

This wraps the shelf content, managing the fusuma door system, moonlight slit, GSAP animation timeline, and Escape key listener.

- [ ] **Step 1: Create the favorites-reveal component**

Create `src/components/shelf/favorites-reveal.tsx`:

```tsx
"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import { FavoritesScene } from "./favorites-scene";

interface FavoritesRevealProps {
  children: ReactNode;
  favorites: CollectedAnime[];
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

export function FavoritesReveal({
  children,
  favorites,
  onMove,
  onEpisodeChange,
  onRemove,
}: FavoritesRevealProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animating = useRef(false);
  const doorLeftRef = useRef<HTMLDivElement>(null);
  const doorRightRef = useRef<HTMLDivElement>(null);
  const slitRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const open = useCallback(() => {
    if (animating.current) return;
    animating.current = true;

    const tl = gsap.timeline({
      onComplete: () => { animating.current = false; },
    });

    // Phase 1: moonlight slit glows bright (300ms)
    tl.to(slitRef.current, {
      width: 8,
      boxShadow: "0 0 40px 12px rgba(200,220,255,0.3), 0 0 80px 30px rgba(180,200,240,0.15)",
      background: "linear-gradient(90deg, transparent 0%, rgba(210,225,255,0.7) 25%, rgba(255,255,255,0.95) 50%, rgba(210,225,255,0.7) 75%, transparent 100%)",
      duration: 0.3,
      ease: "power2.in",
    });

    // Phase 2: slit widens + doors slide open + gallery rises
    tl.to(slitRef.current, {
      width: 20,
      background: "linear-gradient(90deg, transparent 0%, rgba(180,200,240,0.3) 20%, rgba(220,230,255,0.6) 50%, rgba(180,200,240,0.3) 80%, transparent 100%)",
      boxShadow: "0 0 50px 15px rgba(180,200,240,0.12), 0 0 100px 40px rgba(180,200,240,0.06)",
      duration: 0.4,
      ease: "power1.out",
    }, "+=0");
    tl.to(doorLeftRef.current, {
      x: "-100%",
      duration: 1.1,
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    }, "<");
    tl.to(doorRightRef.current, {
      x: "100%",
      duration: 1.1,
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    }, "<");
    tl.fromTo(galleryRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
      "<"
    );

    // Phase 3: slit fades out
    tl.to(slitRef.current, {
      width: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power1.out",
    }, "-=0.6");

    // ESC hint fades in
    tl.to(hintRef.current, {
      opacity: 1,
      duration: 0.4,
    }, "-=0.2");

    tlRef.current = tl;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (animating.current) return;
    animating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        animating.current = false;
        // Reset slit
        gsap.set(slitRef.current, { width: 0, opacity: 1, boxShadow: "none", background: "none" });
      },
    });

    tl.to(hintRef.current, { opacity: 0, duration: 0.2 });
    tl.to(galleryRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    }, "<");
    tl.to(doorLeftRef.current, {
      x: "0%",
      duration: 1.0,
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    }, "-=0.3");
    tl.to(doorRightRef.current, {
      x: "0%",
      duration: 1.0,
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    }, "<");

    tlRef.current = tl;
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Cleanup GSAP on unmount
  useEffect(() => {
    return () => { tlRef.current?.kill(); };
  }, []);

  return (
    <div className="relative" style={{ minHeight: 400 }}>
      {/* Back layer: favorites gallery */}
      <div
        ref={galleryRef}
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ opacity: 0, transform: "translateY(40px)" }}
      >
        <FavoritesScene
          items={favorites}
          onMove={onMove}
          onEpisodeChange={onEpisodeChange}
          onRemove={onRemove}
        />
      </div>

      {/* Moon slit */}
      <div
        ref={slitRef}
        className="moon-slit rounded-2xl"
        aria-hidden
      />

      {/* Left door */}
      <div ref={doorLeftRef} className="fusuma-door fusuma-door-left rounded-l-2xl">
        <div className="fusuma-content">{children}</div>
      </div>

      {/* Right door */}
      <div ref={doorRightRef} className="fusuma-door fusuma-door-right rounded-r-2xl">
        <div className="fusuma-content">{children}</div>
      </div>

      {/* ESC hint */}
      <div
        ref={hintRef}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        style={{
          opacity: 0,
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--moon-silver-dim, rgba(200,208,224,0.5))",
          fontFamily: "var(--font-display)",
        }}
      >
        ESC to return
      </div>

      {/* 秘 seal trigger — positioned by the shelf page, but we expose toggle */}
      {/* The shelf page will call toggle via a ref or by rendering the seal itself */}

      {/* Expose toggle function via a hidden element for the parent to access */}
      <HiddenToggle onToggle={toggle} isOpen={isOpen} />
    </div>
  );
}

// We use a ref-forwarding pattern instead. Let's use a context or imperative handle.
// Actually, simplest: export a hook-style approach. The parent passes an onToggle setter.

// Revised approach: use useImperativeHandle
import { forwardRef, useImperativeHandle } from "react";

export interface FavoritesRevealHandle {
  toggle: () => void;
  isOpen: boolean;
}

// Remove the HiddenToggle and re-export FavoritesReveal as a forwardRef component.
```

Wait — let me reconsider the API. Using `forwardRef` + `useImperativeHandle` is the cleanest way for the parent to trigger the toggle. Let me rewrite this properly as a single component:

Create `src/components/shelf/favorites-reveal.tsx`:

```tsx
"use client";

import {
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import { FavoritesScene } from "./favorites-scene";

interface FavoritesRevealProps {
  children: ReactNode;
  favorites: CollectedAnime[];
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

export interface FavoritesRevealHandle {
  toggle: () => void;
  isOpen: boolean;
}

export const FavoritesReveal = forwardRef<
  FavoritesRevealHandle,
  FavoritesRevealProps
>(function FavoritesReveal(
  { children, favorites, onMove, onEpisodeChange, onRemove },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const animating = useRef(false);
  const doorLeftRef = useRef<HTMLDivElement>(null);
  const doorRightRef = useRef<HTMLDivElement>(null);
  const slitRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const open = useCallback(() => {
    if (animating.current) return;
    animating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        animating.current = false;
      },
    });

    tl.to(slitRef.current, {
      width: 8,
      boxShadow:
        "0 0 40px 12px rgba(200,220,255,0.3), 0 0 80px 30px rgba(180,200,240,0.15)",
      background:
        "linear-gradient(90deg, transparent 0%, rgba(210,225,255,0.7) 25%, rgba(255,255,255,0.95) 50%, rgba(210,225,255,0.7) 75%, transparent 100%)",
      duration: 0.3,
      ease: "power2.in",
    });

    tl.to(slitRef.current, {
      width: 20,
      background:
        "linear-gradient(90deg, transparent 0%, rgba(180,200,240,0.3) 20%, rgba(220,230,255,0.6) 50%, rgba(180,200,240,0.3) 80%, transparent 100%)",
      boxShadow:
        "0 0 50px 15px rgba(180,200,240,0.12), 0 0 100px 40px rgba(180,200,240,0.06)",
      duration: 0.4,
      ease: "power1.out",
    });
    tl.to(
      doorLeftRef.current,
      { x: "-100%", duration: 1.1, ease: "power3.inOut" },
      "<"
    );
    tl.to(
      doorRightRef.current,
      { x: "100%", duration: 1.1, ease: "power3.inOut" },
      "<"
    );
    tl.fromTo(
      galleryRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: "power3.out" },
      "<"
    );

    tl.to(slitRef.current, {
      width: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power1.out",
    }, "-=0.6");

    tl.to(hintRef.current, { opacity: 1, duration: 0.4 }, "-=0.2");

    tlRef.current = tl;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (animating.current) return;
    animating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        animating.current = false;
        gsap.set(slitRef.current, {
          width: 0,
          opacity: 1,
          boxShadow: "none",
          background: "none",
        });
      },
    });

    tl.to(hintRef.current, { opacity: 0, duration: 0.2 });
    tl.to(
      galleryRef.current,
      { y: 40, opacity: 0, duration: 0.5, ease: "power2.in" },
      "<"
    );
    tl.to(
      doorLeftRef.current,
      { x: "0%", duration: 1.0, ease: "power3.inOut" },
      "-=0.3"
    );
    tl.to(
      doorRightRef.current,
      { x: "0%", duration: 1.0, ease: "power3.inOut" },
      "<"
    );

    tlRef.current = tl;
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  useImperativeHandle(ref, () => ({ toggle, isOpen }), [toggle, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  return (
    <div className="relative" style={{ minHeight: 400 }}>
      <div
        ref={galleryRef}
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ opacity: 0, transform: "translateY(40px)" }}
      >
        <FavoritesScene
          items={favorites}
          onMove={onMove}
          onEpisodeChange={onEpisodeChange}
          onRemove={onRemove}
        />
      </div>

      <div ref={slitRef} className="moon-slit rounded-2xl" aria-hidden />

      <div
        ref={doorLeftRef}
        className="fusuma-door fusuma-door-left rounded-l-2xl"
      >
        <div className="fusuma-content">{children}</div>
      </div>

      <div
        ref={doorRightRef}
        className="fusuma-door fusuma-door-right rounded-r-2xl"
      >
        <div className="fusuma-content">{children}</div>
      </div>

      <div
        ref={hintRef}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        style={{
          opacity: 0,
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          color: "rgba(200, 208, 224, 0.5)",
          fontFamily: "var(--font-display)",
        }}
      >
        ESC to return
      </div>
    </div>
  );
});
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/favorites-reveal.tsx
git commit -m "Add FavoritesReveal fusuma door wrapper component"
```

---

### Task 4: Integrate FavoritesReveal into the shelf page

**Files:**
- Modify: `src/app/shelf/page.tsx`

Wire everything together: wrap the shelf content in `FavoritesReveal`, add the 秘 seal trigger to the header, filter favorites from items.

- [ ] **Step 1: Update the shelf page imports and add favorites filtering**

At the top of `src/app/shelf/page.tsx`, add imports:

```tsx
import { useRef } from "react";
import {
  FavoritesReveal,
  type FavoritesRevealHandle,
} from "@/components/shelf/favorites-reveal";
```

Update the existing `import` from React to include `useRef`:

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
```

- [ ] **Step 2: Add favorites data and reveal ref inside ShelfPage**

After the `const [tone, setTone]` line, add:

```tsx
const revealRef = useRef<FavoritesRevealHandle>(null);

const favorites = useMemo(
  () => items.filter((i) => i.category === "favorite"),
  [items]
);
```

- [ ] **Step 3: Add the 秘 seal to the header**

In the header `<div>` that currently contains the `<h1>My Shelf</h1>` and the stats bar, add the 秘 seal next to the stats bar. Replace the header section (the `<div className="mb-8 flex ...">` block) with:

```tsx
<div className="mb-8 flex flex-wrap items-end justify-between gap-6">
  <div>
    <h1
      className="text-3xl font-extrabold tracking-tight"
      style={{
        fontFamily: "var(--font-display)",
        color: "var(--washi)",
      }}
    >
      My Shelf
    </h1>
    <p className="mt-2 text-sm text-zinc-400">
      Tracking {total} {total === 1 ? "entry" : "entries"} across three
      shelves.
    </p>
  </div>

  <div className="flex items-center gap-4">
    <div
      className="flex items-stretch gap-2 rounded-xl border p-1.5"
      style={{
        borderColor: "rgba(244,228,192,.2)",
        background: "rgba(10,6,4,.6)",
      }}
    >
      <Stat label="Watching" value={counts.watching} />
      <div className="w-px" style={{ background: "rgba(244,228,192,.1)" }} />
      <Stat label="Plan" value={counts.plan} />
      <div className="w-px" style={{ background: "rgba(244,228,192,.1)" }} />
      <Stat label="Watched" value={counts.watched} />
    </div>

    <button
      type="button"
      onClick={() => revealRef.current?.toggle()}
      title="秘蔵 — Hidden Collection"
      className="flex items-center justify-center transition-all"
      style={{
        width: 32,
        height: 32,
        borderRadius: 2,
        background: "var(--hanko)",
        color: "var(--washi)",
        fontFamily: "var(--font-jp)",
        fontSize: 14,
        fontWeight: 900,
        opacity: 0.35,
        transform: "rotate(-4deg)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "rotate(2deg)";
        e.currentTarget.style.boxShadow = "0 0 12px rgba(196,30,58,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.35";
        e.currentTarget.style.transform = "rotate(-4deg)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      秘
    </button>
  </div>
</div>
```

- [ ] **Step 4: Wrap SceneTabs + Scene in FavoritesReveal**

Replace the `<SceneTabs>` and `<Scene>` at the bottom of the return with:

```tsx
<FavoritesReveal
  ref={revealRef}
  favorites={favorites}
  onMove={updateCategory}
  onEpisodeChange={updateEpisode}
  onRemove={remove}
>
  <div>
    <SceneTabs active={tone} counts={counts} onChange={setTone} />
    <Scene
      tone={tone}
      items={grouped[tone]}
      onMove={updateCategory}
      onEpisodeChange={updateEpisode}
      onRemove={remove}
    />
  </div>
</FavoritesReveal>
```

Note: The shelf content is wrapped in a single `<div>` so it renders as one block inside each door half.

- [ ] **Step 5: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/shelf/page.tsx
git commit -m "Integrate FavoritesReveal into shelf page with secret seal trigger"
```

---

### Task 5: Visual verification and polish

**Files:**
- Possibly modify: `src/components/shelf/favorites-reveal.tsx`, `src/components/shelf/favorites-scene.tsx`, `src/app/shelf/shelf.css`

- [ ] **Step 1: Run the dev server and navigate to /shelf**

Run: `npm run dev` (if not already running)
Navigate to `http://localhost:3000/shelf`

Verify:
1. The shelf looks exactly as before — no visible seams, doors, or slit
2. The 秘 seal appears faintly in the header, right of the stats bar
3. Hovering the seal brightens it and rotates it

- [ ] **Step 2: Test the reveal animation**

Click the 秘 seal. Verify:
1. A bright moonlight slit appears down the center (~300ms)
2. The shelf splits apart as fusuma doors slide open
3. The moonlit gallery rises up from below simultaneously
4. Stars twinkle, moonlight pool glows from above
5. "ESC to return" hint appears at the bottom
6. The 秘蔵 watermark is faintly visible behind the content

- [ ] **Step 3: Test the close animation**

Press Escape. Verify:
1. Gallery sinks back down
2. Doors slide back together seamlessly
3. Returns to normal shelf view with no artifacts

- [ ] **Step 4: Test with favorites**

Use the spine menu on a few items and select "Favorite". Then click the 秘 seal. Verify the favorited items appear as silver-toned spines in the moonlit gallery.

- [ ] **Step 5: Test empty state**

Remove all favorites. Open the reveal. Verify the 月 empty state shows.

- [ ] **Step 6: Fix any visual issues found during verification**

Adjust CSS values, GSAP timing, or layout as needed.

- [ ] **Step 7: Run typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: Clean (0 errors, pre-existing middleware warning only).

- [ ] **Step 8: Commit any polish changes**

```bash
git add -A src/
git commit -m "Polish favorites reveal animation and gallery layout"
```

---

### Task 6: Update STATUS.md

**Files:**
- Modify: `docs/superpowers/specs/STATUS.md`

- [ ] **Step 1: Update the status document**

In `docs/superpowers/specs/STATUS.md`:

1. Add to the "What's Done" list:
```
- [x] Favorites reveal: hidden 秘蔵 section with fusuma door animation, moonlit gallery, star field
```

2. Remove "Build the hidden Favorites flip" from "What's Next" and renumber.

3. Update the project structure to include the new files:
```
│   ├── shelf/
│   │   ├── favorites-reveal.tsx  — fusuma door wrapper with GSAP slit/slide/rise animation
│   │   ├── favorites-scene.tsx   — moonlit gallery with stars, silver spines, empty state
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/STATUS.md
git commit -m "Update STATUS: favorites reveal complete"
```

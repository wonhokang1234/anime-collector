# Shelf Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic dark-theme shelf UI with a manga-library aesthetic — three per-category *scenes* (Watching / Plan / Watched) behind a washi-tab navigator, each entry rendered as a stylized manga-volume spine.

**Architecture:** Tab-driven single-scene page. `ShelfPage` owns the active tab in state, renders `<SceneTabs>` above a `<Scene>` that mounts the matching backdrop + spine layout. Each spine is a reusable `<MangaSpine>` component that carries the existing collection-item interactions (menu, episode stepper). The retired `ShelfSection` / `ShelfCard` components are deleted.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, GSAP 3, `next/font/google` (Cinzel + Noto Serif JP). No test framework — validation is manual per spec.

**Spec:** `docs/superpowers/specs/2026-04-16-shelf-visual-redesign-design.md`

**Verification commands used throughout:**

- `npx tsc --noEmit` — typecheck
- `npx eslint src/app/shelf src/components/shelf` — lint the touched surface
- `npm run build` — full Next.js build (run at the end of each task that touches route files)
- `npm run dev` then browse `http://localhost:3000/shelf` logged in — manual visual check

---

## File Structure

### New files

| Path | Responsibility |
| --- | --- |
| `src/components/shelf/manga-spine.tsx` | Single manga-volume spine component. Renders cover art panel, washi title band, rarity medallion, rarity top foil. Carries the move menu + (for hero/watching) episode stepper. Props: `item`, `tone`, `hero?`, `onMove`, `onEpisodeChange`, `onRemove`. |
| `src/components/shelf/scene-backdrop.tsx` | Decorative wrapper. Props: `tone: "watching" \| "plan" \| "watched"`. Renders lantern glow / indigo shoji / archival wash background. |
| `src/components/shelf/scene-tabs.tsx` | Tab bar navigator. Props: `active`, `counts`, `onChange`. Three washi tabs with kanji subtitles + vermilion hanko count badges. |
| `src/components/shelf/scene.tsx` | Active-scene container. Props: `active`, `items`, callbacks. Renders `<SceneBackdrop>` + spine layout for the active tab. Runs a GSAP cross-fade on tab change. |

### Modified files

| Path | Change |
| --- | --- |
| `src/app/layout.tsx` | Load `Cinzel` and `Noto_Serif_JP` via `next/font/google`, expose CSS vars. |
| `src/app/shelf/shelf.css` | Rewrite: visual-language tokens, per-tone scene backdrops, lantern glow, shoji stripes, archival wash, hanko stamp, floor-plank, ribbon. |
| `src/app/shelf/page.tsx` | Replace stacked `<ShelfSection>` layout with `<SceneTabs>` + `<Scene>`. Header/stats restyle (washi pill, hanko dots, Cinzel typography). |

### Deleted files

| Path | Reason |
| --- | --- |
| `src/components/shelf/shelf-section.tsx` | Replaced by `<SceneTabs>` + `<Scene>`. |
| `src/components/shelf/shelf-card.tsx` | Replaced by `<MangaSpine>`. Menu + stepper logic migrates into the spine. |

---

## Task 1: Load Cinzel + Noto Serif JP fonts

**Files:**

- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update layout to load both fonts**

Open `src/app/layout.tsx`. Replace the existing font imports and `<html>` className with the snippet below. This keeps Geist as the default body font but exposes two new CSS variables (`--font-cinzel`, `--font-noto-jp`) that the shelf CSS will consume.

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, Noto_Serif_JP } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Anime Collector",
  description: "Collect anime as stylized cards and organize them on your shelf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${notoSerifJp.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Build to confirm fonts resolve**

Run: `npm run build`
Expected: build completes successfully and output mentions the new Google fonts being downloaded.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Load Cinzel and Noto Serif JP fonts for shelf redesign"
```

---

## Task 2: Rewrite shelf.css with visual-language tokens

**Files:**

- Modify: `src/app/shelf/shelf.css`

- [ ] **Step 1: Replace shelf.css contents**

Replace the entire file with the rules below. This installs the palette as CSS custom properties, the three scene backdrops, the lantern glow, shoji stripes, the archival wash, the 完 stamp, the washi ribbon, and small utilities that the new components will compose.

```css
/* Shelf — visual-language tokens */
.shelf-root {
  --ink-0: #050710;
  --ink-1: #0a0604;
  --ink-2: #1a1208;
  --indigo-deep: #0a1a3a;
  --indigo-mid: #1a3a6a;
  --washi: #f4e4c0;
  --washi-aged: #d4bc8a;
  --sumi: #2a1808;
  --hanko: #c41e3a;
  --lantern-glow: #f4d98a;
  --font-display: var(--font-cinzel), Georgia, serif;
  --font-jp: var(--font-noto-jp), "Noto Serif JP", serif;
}

/* Horizontal scroller used inside every scene */
.shelf-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(244, 228, 192, 0.18) transparent;
  scroll-snap-type: x proximity;
}
.shelf-scroll::-webkit-scrollbar {
  height: 6px;
}
.shelf-scroll::-webkit-scrollbar-thumb {
  background: rgba(244, 228, 192, 0.18);
  border-radius: 3px;
}

/* ── Watching — lantern-lit hero ── */
.scene-watching {
  background: radial-gradient(
      ellipse at 50% -10%,
      rgba(244, 217, 138, 0.28) 0%,
      rgba(26, 40, 80, 0.85) 40%,
      var(--ink-1) 80%
    ),
    linear-gradient(180deg, var(--ink-1), var(--ink-0));
}
.scene-watching::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(244, 228, 192, 0.04) 0 2px,
    transparent 2px 12px
  );
  pointer-events: none;
}
.lantern-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 520px;
  height: 320px;
  background: radial-gradient(
    ellipse,
    var(--lantern-glow) 0%,
    rgba(244, 217, 138, 0.25) 30%,
    transparent 70%
  );
  filter: blur(20px);
  pointer-events: none;
}
.stage-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(
      180deg,
      transparent,
      rgba(0, 0, 0, 0.5) 30%,
      rgba(0, 0, 0, 0.9)
    ),
    repeating-linear-gradient(
      90deg,
      rgba(60, 36, 18, 0.6) 0 2px,
      rgba(40, 24, 12, 0.6) 2px 6px
    );
}

/* ── Plan — indigo shoji backdrop ── */
.scene-plan {
  background: linear-gradient(180deg, var(--indigo-deep), var(--ink-0));
}
.scene-plan::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(26, 58, 106, 0.35) 0 6px,
    rgba(10, 26, 58, 0.35) 6px 12px
  );
  pointer-events: none;
}
.washi-frame {
  position: absolute;
  left: 16px;
  right: 16px;
  height: 1px;
  border-top: 1px dashed rgba(244, 228, 192, 0.2);
}

/* ── Watched — archival wash ── */
.scene-watched {
  background: radial-gradient(
      ellipse at 8% 50%,
      rgba(196, 30, 58, 0.18),
      transparent 45%
    ),
    radial-gradient(
      ellipse at 92% 50%,
      rgba(244, 228, 192, 0.1),
      transparent 45%
    ),
    linear-gradient(180deg, var(--ink-2), var(--ink-1));
}
.stamp-kan {
  position: absolute;
  top: 16px;
  left: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 900 22px var(--font-jp);
  color: rgba(244, 228, 192, 0.92);
  background: rgba(196, 30, 58, 0.85);
  transform: rotate(-6deg);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  letter-spacing: 0;
  pointer-events: none;
}

/* Spine helpers */
.spine-foil-common {
  background: linear-gradient(90deg, #2a1808, #5a3818, #2a1808);
}
.spine-foil-uncommon {
  background: linear-gradient(90deg, #166534, #22c55e, #166534);
}
.spine-foil-rare {
  background: linear-gradient(90deg, #1e40af, #3b82f6, #1e40af);
}
.spine-foil-epic {
  background: linear-gradient(90deg, #b45309, #fbbf24, #b45309);
  box-shadow: 0 0 4px rgba(251, 191, 36, 0.6);
}
.spine-foil-legendary {
  background: linear-gradient(
    90deg,
    #ef4444,
    #f97316,
    #eab308,
    #22c55e,
    #3b82f6,
    #8b5cf6,
    #ec4899,
    #ef4444
  );
  background-size: 200% 100%;
  box-shadow: 0 0 6px rgba(236, 72, 153, 0.55);
  animation: foil-shimmer 6s linear infinite;
}
@keyframes foil-shimmer {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}

/* Washi bookmark ribbon (hero only) */
.spine-bookmark {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 58px;
  background: linear-gradient(180deg, var(--washi), var(--washi-aged));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
}
.spine-bookmark::after {
  content: "";
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: var(--hanko);
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Empty-shelf ambient glow (reused from v1) */
.shelf-empty-glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(
      circle at 30% 40%,
      rgba(99, 102, 241, 0.16),
      transparent 50%
    ),
    radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.1), transparent 55%);
  filter: blur(30px);
  pointer-events: none;
}
```

- [ ] **Step 2: Verify CSS parses**

Run: `npm run build`
Expected: no PostCSS / Tailwind errors. (Build will fail later if typescript is broken, but at this point only CSS changed, so it should succeed.)

- [ ] **Step 3: Commit**

```bash
git add src/app/shelf/shelf.css
git commit -m "Add shelf visual-language tokens and per-tone scene backdrops"
```

---

## Task 3: Build `<MangaSpine>` component (base, non-hero)

**Files:**

- Create: `src/components/shelf/manga-spine.tsx`

- [ ] **Step 1: Create the base spine component**

This is the shared unit used in every scene. Base version (no hero mode yet): a fixed-width spine with a cover-art upper panel, washi title band, rarity medallion, rarity top-edge foil. The move menu migrates from `shelf-card.tsx` — same logic, same options.

Create `src/components/shelf/manga-spine.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getRarityTier } from "@/lib/types";
import type { AnimeCategory, CollectedAnime, RarityTier } from "@/lib/types";

export type SpineTone = "watching" | "plan" | "watched";

interface MangaSpineProps {
  item: CollectedAnime;
  tone: SpineTone;
  hero?: boolean;
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

const MOVE_OPTIONS: { category: AnimeCategory; label: string }[] = [
  { category: "watching", label: "Currently Watching" },
  { category: "plan_to_watch", label: "Plan to Watch" },
  { category: "watched", label: "Watched" },
  { category: "favorite", label: "Favorite" },
];

const RARITY_LETTER: Record<RarityTier, string> = {
  common: "C",
  uncommon: "U",
  rare: "R",
  epic: "E",
  legendary: "L",
};

export function MangaSpine({
  item,
  tone,
  hero = false,
  onMove,
  onEpisodeChange: _onEpisodeChange,
  onRemove,
}: MangaSpineProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const rarity = getRarityTier(item.score ?? 0);
  const width = hero ? 170 : 36;
  const height = hero ? 250 : 220;
  const dimmed = tone === "watched";

  return (
    <div
      className="relative shrink-0 group/spine"
      style={{
        width,
        filter: dimmed ? "saturate(.92) brightness(.98)" : undefined,
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width,
          height,
          background: "linear-gradient(180deg,#2a1808,#0a0604)",
          borderRadius: "2px 2px 0 0",
          boxShadow:
            "0 10px 22px rgba(0,0,0,.55), inset 1px 0 0 rgba(0,0,0,.45), inset -1px 0 0 rgba(255,220,160,.12)",
        }}
      >
        {/* Rarity top foil */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] spine-foil-${rarity}`}
        />

        {/* Cover art — upper 55% */}
        <div className="absolute top-[3px] left-0 right-0 h-[55%] overflow-hidden">
          {item.image_url && (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes={`${width}px`}
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Washi title band */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "55%",
            bottom: hero ? 44 : 30,
            background:
              "linear-gradient(180deg, rgba(244,228,192,.95), rgba(212,188,138,.9))",
            boxShadow: "inset 0 0 12px rgba(100,60,20,.2)",
            borderTop: "1px solid rgba(42,24,8,.3)",
          }}
        >
          <div
            className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap overflow-hidden"
            style={{
              writingMode: "vertical-rl",
              font: `700 ${hero ? 14 : 10}px/1 var(--font-jp), var(--font-display)`,
              color: "var(--sumi)",
              letterSpacing: ".18em",
              maxHeight: hero ? 140 : 100,
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </div>
        </div>

        {/* Rarity medallion */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{
            bottom: 6,
            width: hero ? 30 : 22,
            height: hero ? 30 : 22,
            borderRadius: "50%",
            background: "var(--washi)",
            border: "1.5px solid var(--hanko)",
            font: `900 ${hero ? 12 : 10}px var(--font-display)`,
            color: "var(--sumi)",
            boxShadow: "0 1px 3px rgba(0,0,0,.5)",
          }}
          aria-label={`Rarity: ${rarity}`}
        >
          {RARITY_LETTER[rarity]}
        </div>
      </div>

      {/* Menu button — hover reveal */}
      <div
        ref={menuRef}
        className="absolute top-1 right-1 z-40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Spine options"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex h-6 w-6 items-center justify-center rounded bg-zinc-950/80 text-zinc-200 backdrop-blur-sm ring-1 ring-white/10 transition-opacity hover:bg-zinc-900 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover/spine:opacity-100"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 w-44 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-sm">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Move to
            </div>
            {MOVE_OPTIONS.map((opt) => {
              const active = item.category === opt.category;
              return (
                <button
                  key={opt.category}
                  type="button"
                  onClick={() => {
                    if (!active) onMove(item.id, opt.category);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                    active
                      ? "bg-zinc-900/60 text-indigo-300"
                      : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
            <div className="border-t border-zinc-800" />
            <button
              type="button"
              onClick={() => {
                onRemove(item.id);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Run: `npx eslint src/components/shelf/manga-spine.tsx`
Expected: no errors. The `_onEpisodeChange` prefix acknowledges the prop is unused in the base spine (wired up in Task 4) — ESLint's `no-unused-vars` config treats a leading underscore as intentional.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/manga-spine.tsx
git commit -m "Add MangaSpine base component with move menu"
```

---

## Task 4: Add hero mode (bookmark, pedestal, episode stepper) to `<MangaSpine>`

**Files:**

- Modify: `src/components/shelf/manga-spine.tsx`

- [ ] **Step 1: Add the hero-only presentation layer and stepper**

When `hero` is true the spine must lift, light up, show a bookmark ribbon, pedestal glow, and host the episode stepper beneath its base. Edit `manga-spine.tsx` — change the outer wrapper to apply lift/rim-light, add the bookmark and pedestal nodes at the top of the spine body, and append the stepper below the spine when `hero && tone === "watching"`.

Replace the function body (everything from `const RARITY_LETTER` downward) with:

```tsx
const RARITY_LETTER: Record<RarityTier, string> = {
  common: "C",
  uncommon: "U",
  rare: "R",
  epic: "E",
  legendary: "L",
};

export function MangaSpine({
  item,
  tone,
  hero = false,
  onMove,
  onEpisodeChange,
  onRemove,
}: MangaSpineProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const rarity = getRarityTier(item.score ?? 0);
  const width = hero ? 170 : 36;
  const height = hero ? 250 : 220;
  const dimmed = tone === "watched";

  const total = item.total_episodes || 0;
  const current = item.current_episode || 0;
  const stepEpisode = (delta: number) => {
    const next = Math.max(
      0,
      total > 0 ? Math.min(total, current + delta) : current + delta
    );
    if (next === current) return;
    onEpisodeChange(item.id, next);
    if (total > 0 && next === total && item.category !== "watched") {
      onMove(item.id, "watched");
    }
  };

  return (
    <div
      className="relative shrink-0 group/spine"
      style={{
        width,
        transform: hero ? "translateY(-32px)" : undefined,
        filter: dimmed ? "saturate(.92) brightness(.98)" : undefined,
      }}
    >
      {hero && (
        <>
          <span className="spine-bookmark" aria-hidden />
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              bottom: -24,
              width: width * 1.4,
              height: 46,
              background:
                "radial-gradient(ellipse, rgba(244,217,138,.55), transparent 65%)",
              filter: "blur(6px)",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      <div
        className="relative overflow-hidden"
        style={{
          width,
          height,
          background: "linear-gradient(180deg,#2a1808,#0a0604)",
          borderRadius: "2px 2px 0 0",
          boxShadow: hero
            ? "0 16px 40px rgba(0,0,0,.7), 0 0 0 1px rgba(244,228,192,.15), inset 0 1px 0 rgba(244,228,192,.35)"
            : "0 10px 22px rgba(0,0,0,.55), inset 1px 0 0 rgba(0,0,0,.45), inset -1px 0 0 rgba(255,220,160,.12)",
        }}
      >
        {/* Rarity top foil */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] spine-foil-${rarity}`}
        />

        {/* Cover art — upper 55% */}
        <div className="absolute top-[3px] left-0 right-0 h-[55%] overflow-hidden">
          {item.image_url && (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes={`${width}px`}
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Washi title band */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "55%",
            bottom: hero ? 44 : 30,
            background:
              "linear-gradient(180deg, rgba(244,228,192,.95), rgba(212,188,138,.9))",
            boxShadow: "inset 0 0 12px rgba(100,60,20,.2)",
            borderTop: "1px solid rgba(42,24,8,.3)",
          }}
        >
          <div
            className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap overflow-hidden"
            style={{
              writingMode: "vertical-rl",
              font: `700 ${hero ? 14 : 10}px/1 var(--font-jp), var(--font-display)`,
              color: "var(--sumi)",
              letterSpacing: ".18em",
              maxHeight: hero ? 140 : 100,
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </div>
        </div>

        {/* Rarity medallion */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{
            bottom: 6,
            width: hero ? 30 : 22,
            height: hero ? 30 : 22,
            borderRadius: "50%",
            background: "var(--washi)",
            border: "1.5px solid var(--hanko)",
            font: `900 ${hero ? 12 : 10}px var(--font-display)`,
            color: "var(--sumi)",
            boxShadow: "0 1px 3px rgba(0,0,0,.5)",
          }}
          aria-label={`Rarity: ${rarity}`}
        >
          {RARITY_LETTER[rarity]}
        </div>

        {/* ✓ overlay for watched tone (non-hero) */}
        {tone === "watched" && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "rgba(244,228,192,.08)" }}
          />
        )}
      </div>

      {/* Episode stepper — hero + watching only */}
      {hero && tone === "watching" && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: -82, width: 200 }}
        >
          <div className="flex items-center gap-2 rounded-lg border border-washi/20 bg-black/50 px-2 py-1.5 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Previous episode"
              onClick={() => stepEpisode(-1)}
              disabled={current <= 0}
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--washi)] transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <div
                className="text-[9px] uppercase tracking-[.2em]"
                style={{
                  color: "rgba(244,228,192,.55)",
                  fontFamily: "var(--font-display)",
                }}
              >
                Episode
              </div>
              <div
                className="font-mono text-sm tabular-nums"
                style={{ color: "var(--washi)" }}
              >
                {current} / {total || "?"}
              </div>
            </div>
            <button
              type="button"
              aria-label="Next episode"
              onClick={() => stepEpisode(1)}
              disabled={total > 0 && current >= total}
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--washi)] transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          {total > 0 && (
            <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-black/60">
              <div
                className="h-full transition-[width] duration-300"
                style={{
                  width: `${Math.min(100, (current / total) * 100)}%`,
                  background:
                    "linear-gradient(90deg, var(--lantern-glow), var(--hanko))",
                  boxShadow: "0 0 6px rgba(244,217,138,.55)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Menu button — hover reveal */}
      <div
        ref={menuRef}
        className="absolute top-1 right-1 z-40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Spine options"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex h-6 w-6 items-center justify-center rounded bg-zinc-950/80 text-zinc-200 backdrop-blur-sm ring-1 ring-white/10 transition-opacity hover:bg-zinc-900 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover/spine:opacity-100"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 w-44 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-sm">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Move to
            </div>
            {MOVE_OPTIONS.map((opt) => {
              const active = item.category === opt.category;
              return (
                <button
                  key={opt.category}
                  type="button"
                  onClick={() => {
                    if (!active) onMove(item.id, opt.category);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                    active
                      ? "bg-zinc-900/60 text-indigo-300"
                      : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
            <div className="border-t border-zinc-800" />
            <button
              type="button"
              onClick={() => {
                onRemove(item.id);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

Also drop the leading underscore from the destructured prop and remove the `_onEpisodeChange` placeholder — it is now consumed by `stepEpisode`.

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Run: `npx eslint src/components/shelf/manga-spine.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/manga-spine.tsx
git commit -m "Add hero mode to MangaSpine with bookmark, pedestal, and episode stepper"
```

---

## Task 5: Build `<SceneBackdrop>` component

**Files:**

- Create: `src/components/shelf/scene-backdrop.tsx`

- [ ] **Step 1: Create the backdrop component**

A decorative wrapper. Picks the right background class from `shelf.css` based on the tone and emits the tone-specific decorative nodes (lantern, shoji divider, 完 stamp, floor plank).

Create `src/components/shelf/scene-backdrop.tsx`:

```tsx
import type { ReactNode } from "react";
import type { SpineTone } from "./manga-spine";

interface SceneBackdropProps {
  tone: SpineTone;
  children: ReactNode;
}

export function SceneBackdrop({ tone, children }: SceneBackdropProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/5 scene-${tone}`}
      style={{ minHeight: tone === "watching" ? 420 : 320 }}
    >
      {tone === "watching" && (
        <>
          <span className="lantern-glow" aria-hidden />
          <span className="stage-floor" aria-hidden />
        </>
      )}
      {tone === "plan" && (
        <>
          <span className="washi-frame" style={{ top: 14 }} aria-hidden />
          <span className="washi-frame" style={{ bottom: 14 }} aria-hidden />
        </>
      )}
      {tone === "watched" && <span className="stamp-kan" aria-hidden>完</span>}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Run: `npx eslint src/components/shelf/scene-backdrop.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/scene-backdrop.tsx
git commit -m "Add SceneBackdrop component with per-tone decorative nodes"
```

---

## Task 6: Build `<SceneTabs>` component

**Files:**

- Create: `src/components/shelf/scene-tabs.tsx`

- [ ] **Step 1: Create the tab bar**

Washi-tab navigator for switching between the three scenes. Active tab is lit (indigo ground + vermilion underline); inactive tabs are dimmed. Each tab shows its kanji subtitle, English title, and a hanko count badge.

Create `src/components/shelf/scene-tabs.tsx`:

```tsx
"use client";

import type { SpineTone } from "./manga-spine";

interface SceneTabsProps {
  active: SpineTone;
  counts: Record<SpineTone, number>;
  onChange: (tone: SpineTone) => void;
}

const TABS: { tone: SpineTone; kanji: string; label: string }[] = [
  { tone: "watching", kanji: "鑑賞中", label: "Watching" },
  { tone: "plan", kanji: "予定", label: "Plan" },
  { tone: "watched", kanji: "完了", label: "Watched" },
];

export function SceneTabs({ active, counts, onChange }: SceneTabsProps) {
  return (
    <div
      role="tablist"
      className="flex gap-0 rounded-t-2xl border-b-2 border-white/10 bg-black/40 p-2"
    >
      {TABS.map(({ tone, kanji, label }) => {
        const isActive = tone === active;
        return (
          <button
            key={tone}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tone)}
            className={`relative flex-1 px-3 py-3 text-center transition-colors ${
              isActive
                ? "bg-gradient-to-b from-[var(--indigo-mid)] to-[var(--indigo-deep)] text-[var(--washi)]"
                : "text-[var(--washi)]/50 hover:text-[var(--washi)]/80"
            }`}
            style={{
              border: isActive
                ? "1px solid rgba(244,228,192,.4)"
                : "1px solid rgba(244,228,192,.08)",
              borderBottom: isActive
                ? "2px solid var(--hanko)"
                : "1px solid rgba(244,228,192,.08)",
              fontFamily: "var(--font-display)",
            }}
          >
            <div
              className="text-[9px] opacity-70"
              style={{ fontFamily: "var(--font-jp)" }}
            >
              {kanji}
            </div>
            <div className="text-[11px] font-bold tracking-[.2em]">
              {label.toUpperCase()}
            </div>
            {counts[tone] > 0 && (
              <div
                className="absolute -top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background: "var(--hanko)",
                  color: "var(--washi)",
                  fontFamily: "var(--font-display)",
                  transform: "rotate(-4deg)",
                  boxShadow: "0 2px 3px rgba(0,0,0,.4)",
                }}
              >
                {counts[tone]}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Run: `npx eslint src/components/shelf/scene-tabs.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/scene-tabs.tsx
git commit -m "Add SceneTabs washi tab navigator"
```

---

## Task 7: Build `<Scene>` component with cross-fade

**Files:**

- Create: `src/components/shelf/scene.tsx`

- [ ] **Step 1: Create the active-scene container**

`<Scene>` receives the active tone + the full list of items for that tone, mounts the right backdrop, and lays out spines. A `useEffect` tween fades the scene in when the active tone changes.

Create `src/components/shelf/scene.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import { MangaSpine, type SpineTone } from "./manga-spine";
import { SceneBackdrop } from "./scene-backdrop";

interface SceneProps {
  tone: SpineTone;
  items: CollectedAnime[];
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

const EMPTY_COPY: Record<
  SpineTone,
  { kanji: string; title: string; body: string }
> = {
  watching: {
    kanji: "灯",
    title: "Nothing active",
    body: "Pick a book from Plan and bump its first episode to light this shelf.",
  },
  plan: {
    kanji: "未読",
    title: "Nothing planned yet",
    body: "Collect anime on Browse and they land here by default.",
  },
  watched: {
    kanji: "完",
    title: "No completed titles yet",
    body: "Finishing an episode-tracked show archives it here automatically.",
  },
};

export function Scene({
  tone,
  items,
  onMove,
  onEpisodeChange,
  onRemove,
}: SceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.22, ease: "power1.out" }
    );
  }, [tone]);

  if (items.length === 0) {
    const copy = EMPTY_COPY[tone];
    return (
      <div ref={rootRef}>
        <SceneBackdrop tone={tone}>
          <div className="flex h-[320px] flex-col items-center justify-center px-6 text-center">
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "var(--washi)",
                color: "var(--hanko)",
                fontFamily: "var(--font-jp)",
                fontSize: 20,
                fontWeight: 900,
                boxShadow: "0 2px 6px rgba(0,0,0,.5)",
              }}
              aria-hidden
            >
              {copy.kanji}
            </div>
            <h3
              className="text-lg font-semibold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--washi)",
              }}
            >
              {copy.title}
            </h3>
            <p
              className="mt-1 max-w-sm text-sm"
              style={{ color: "rgba(244,228,192,.6)" }}
            >
              {copy.body}
            </p>
          </div>
        </SceneBackdrop>
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      <SceneBackdrop tone={tone}>
        <div
          className="shelf-scroll flex gap-3 overflow-x-auto px-8 pb-6"
          style={{
            paddingTop: tone === "watching" ? 80 : 28,
            alignItems: "flex-end",
            minHeight: tone === "watching" ? 420 : 320,
          }}
        >
          {items.map((item, idx) => (
            <MangaSpine
              key={item.id}
              item={item}
              tone={tone}
              hero={tone === "watching" && idx === 0}
              onMove={onMove}
              onEpisodeChange={onEpisodeChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SceneBackdrop>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Run: `npx eslint src/components/shelf/scene.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/scene.tsx
git commit -m "Add Scene container with cross-fade and per-tone empty states"
```

---

## Task 8: Rewrite `/shelf/page.tsx` to use tabs + scenes

**Files:**

- Modify: `src/app/shelf/page.tsx`

- [ ] **Step 1: Replace the page with the tab-driven layout**

Replace the entire file with the version below. Key changes: adds a `tone` state, swaps `<ShelfSection>` usages for `<SceneTabs>` + `<Scene>`, restyles the header in Cinzel + washi, and re-themes the stats pill (washi border + hanko dots).

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { Scene } from "@/components/shelf/scene";
import { SceneTabs } from "@/components/shelf/scene-tabs";
import type { SpineTone } from "@/components/shelf/manga-spine";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import "./shelf.css";

const TONE_TO_CATEGORY: Record<SpineTone, AnimeCategory> = {
  watching: "watching",
  plan: "plan_to_watch",
  watched: "watched",
};

export default function ShelfPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const items = useCollectionStore((s) => s.items);
  const initialized = useCollectionStore((s) => s.initialized);
  const updateCategory = useCollectionStore((s) => s.updateCategory);
  const updateEpisode = useCollectionStore((s) => s.updateEpisode);
  const remove = useCollectionStore((s) => s.remove);

  const [tone, setTone] = useState<SpineTone>("watching");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const grouped = useMemo(() => {
    const buckets: Record<SpineTone, CollectedAnime[]> = {
      watching: [],
      plan: [],
      watched: [],
    };
    for (const item of items) {
      if (item.category === "watching") buckets.watching.push(item);
      else if (item.category === "plan_to_watch") buckets.plan.push(item);
      else if (item.category === "watched") buckets.watched.push(item);
    }
    return buckets;
  }, [items]);

  const counts: Record<SpineTone, number> = {
    watching: grouped.watching.length,
    plan: grouped.plan.length,
    watched: grouped.watched.length,
  };
  const total = items.length;

  if (authLoading || !user || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="shelf-root mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-12 text-center">
          <div className="shelf-empty-glow" aria-hidden />
          <div className="relative">
            <div
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "var(--washi)",
                color: "var(--hanko)",
                fontFamily: "var(--font-jp)",
                fontSize: 22,
                fontWeight: 900,
                boxShadow: "0 2px 6px rgba(0,0,0,.5)",
              }}
              aria-hidden
            >
              蔵
            </div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--washi)",
              }}
            >
              Your shelf is empty
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Collect a few anime and they&apos;ll land here — filed by what
              you&apos;re watching, what&apos;s planned, and what you&apos;ve
              finished.
            </p>
            <button
              onClick={() => router.push("/browse")}
              className="mt-6 rounded-lg bg-[var(--hanko)] px-6 py-2.5 text-sm font-semibold text-[var(--washi)] transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Browse anime
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shelf-root mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
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
      </div>

      <SceneTabs active={tone} counts={counts} onChange={setTone} />
      <Scene
        tone={tone}
        items={grouped[tone]}
        onMove={(id, category) => {
          updateCategory(id, category);
          // If the active scene no longer contains this item, stay put.
          // Tab still reflects accurate counts via Zustand.
        }}
        onEpisodeChange={updateEpisode}
        onRemove={remove}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[72px] flex-col items-center justify-center px-3 py-1">
      <div
        className="flex items-center gap-1.5 font-mono text-lg font-semibold tabular-nums"
        style={{ color: "var(--washi)" }}
      >
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-sm"
          style={{ background: "var(--hanko)" }}
        />
        {value.toString().padStart(2, "0")}
      </div>
      <div
        className="text-[10px] uppercase tracking-[0.12em]"
        style={{
          color: "rgba(244,228,192,.55)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
```

Note the reference to `TONE_TO_CATEGORY` is kept as a type-level aid — not used in runtime — but included for clarity if a future step maps a tab-click into a category action. If ESLint flags it, prefix with an underscore: `const _TONE_TO_CATEGORY`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. The old imports for `ShelfSection` and `ShelfCard` are gone; their files still exist on disk (we delete them in Task 10).

- [ ] **Step 3: Lint**

Run: `npx eslint src/app/shelf/page.tsx`
Expected: no errors. If `TONE_TO_CATEGORY` is flagged as unused, rename to `_TONE_TO_CATEGORY`.

- [ ] **Step 4: Visual verification**

Run: `npm run dev` in a terminal, sign in, and navigate to `/shelf`.

Verify:
- Header shows "My Shelf" in Cinzel, stats pill has three hanko dots and washi borders.
- Three tabs render above the scene with kanji subtitles (鑑賞中 / 予定 / 完了) and vermilion count badges.
- Default tab = Watching. The first spine is enlarged (~170px wide), lifted, lantern glow above, pedestal below, stepper beneath with progress bar.
- Click the Plan tab — scene cross-fades to indigo backdrop with shoji stripes, spines tightly packed, no hero.
- Click the Watched tab — scene cross-fades to archival wash with a 完 stamp top-left, spines dimmed with ✓ overlay.
- Hover any spine — menu "..." appears top-right; clicking it opens the Move to / Remove menu as before.
- Increment an episode on the hero spine — count updates, progress bar grows, reaching the final episode auto-moves the item to Watched.

Kill the dev server when verification is complete.

- [ ] **Step 5: Commit**

```bash
git add src/app/shelf/page.tsx
git commit -m "Rewrite shelf page with tab-driven scenes"
```

---

## Task 9: Delete retired components

**Files:**

- Delete: `src/components/shelf/shelf-section.tsx`
- Delete: `src/components/shelf/shelf-card.tsx`

- [ ] **Step 1: Confirm nothing imports them**

Run: `npx eslint src/ --rule '{"no-unused-modules":"off"}' 2>&1 | head -20` (sanity output only)
Then explicitly check for import references:

Run (via the agent's Grep tool):

- `Grep pattern="shelf-section" path="src"`
- `Grep pattern="shelf-card" path="src"`
- `Grep pattern="ShelfSection" path="src"`
- `Grep pattern="ShelfCard" path="src"`

Expected: no matches outside of the files themselves. If anything else references them, stop and fix before deletion.

- [ ] **Step 2: Delete the files**

```bash
git rm src/components/shelf/shelf-section.tsx src/components/shelf/shelf-card.tsx
```

- [ ] **Step 3: Typecheck, lint, build**

Run: `npx tsc --noEmit`
Run: `npx eslint src/app/shelf src/components/shelf`
Run: `npm run build`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git commit -m "Remove retired ShelfSection and ShelfCard components"
```

---

## Task 10: Update STATUS.md

**Files:**

- Modify: `docs/superpowers/specs/STATUS.md`

- [ ] **Step 1: Mark the shelf visual redesign complete**

Open `docs/superpowers/specs/STATUS.md`. Under the "Completed" list, add:

```markdown
- Shelf visual redesign: manga-spine UI, per-category scenes (Watching hero / Plan indigo / Watched archive), washi tab navigator, Cinzel + Noto Serif JP typography
```

In the "Next steps" list, remove item #1 (visual redesign) and renumber the remaining items so Favorites flip becomes the new #1.

Update the phase line at the top from "Shelf Shipped, Visual Redesign Pending" to "Shelf Redesign Shipped".
Update the date line to `2026-04-16`.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/STATUS.md
git commit -m "Update STATUS: shelf visual redesign shipped"
```

---

## Self-review notes

Spec coverage confirmed section-by-section:

- Visual language palette → Task 2 (tokens in shelf.css).
- Page structure (tabs + scene) → Tasks 6, 7, 8.
- WatchingScene hero → Task 4 hero mode + Task 7 layout math.
- PlanScene indigo backdrop → Task 2 CSS + Task 5 SceneBackdrop.
- WatchedScene archival wash + 完 stamp → Task 2 CSS + Task 5 SceneBackdrop + Task 4 `tone === "watched"` filter/overlay.
- Spine anatomy → Tasks 3 & 4.
- Header & stats restyle → Task 8.
- Component mapping → Tasks 3, 5, 6, 7, 8.
- Assets & fonts → Task 1.
- Empty states → Task 7 (per-scene) + Task 8 (whole-page).
- Testing & validation → Task 8 step 4.

No placeholders. No TBDs. Type names stay consistent across tasks (`SpineTone`, `MangaSpine`, `SceneBackdrop`, `SceneTabs`, `Scene`).

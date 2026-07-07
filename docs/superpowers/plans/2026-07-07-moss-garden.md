# Moss Garden Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Karuta's presentation layer with the "Moss Garden" design — a walkable 3D zen-garden estate whose Grove/Pond/Seed Store/Records House views drive the existing Zustand + Supabase data layer unchanged.

**Architecture:** A single client experience at `/garden` (authenticated home) built from: a near-verbatim port of `garden3d.js` (module Three.js), a pure adapter from `CollectedAnime` → the design's per-title shape, a Jikan enrichment cache for kanji/genre/synopsis, cover-art color extraction, and a garden view-state store (view/transit/ritual/mood). All mutations route through the existing `collection-store` functions; one additive function (`updateRating`) is introduced. Old routes redirect; auth/browse/card pages are restyled with the moss tokens.

**Tech Stack:** Next.js 16 app router, React 19, Zustand 5, Supabase, Tailwind 4 (tokens as plain CSS custom properties), Three.js (new dep), GSAP stays for peripheral pages.

**Design references (read alongside this plan — they are the fidelity source):**

- `/Users/wonhokang/Downloads/design_handoff_moss_garden/Moss Garden - Garden World 3D.dc.html` — primary: full markup w/ exact inline styles (lines 43–348), state logic (lines 350–650), sample data shape (lines 353–367)
- `/Users/wonhokang/Downloads/design_handoff_moss_garden/garden3d.js` — port target, 942 lines
- `/Users/wonhokang/Downloads/design_handoff_moss_garden/Moss Garden - Garden Map.dc.html` — fireflies (lines 25–26), shoji-open keyframes (lines 32–33)
- `/Users/wonhokang/Downloads/design_handoff_moss_garden/README.md` — copy, timings, tokens table

**Approved decisions:**

1. Dealer's Choice WIP committed to main (`4842618`); work happens on `moss-garden` branch. ✓ done
2. Garden becomes home: authed `/` → `/garden`; `/collection` → `/garden?view=pond`; `/shelf` → `/garden?view=grove`; `/browse`, `/card/[mal_id]`, `/login`, `/signup` remain (restyled).
3. `favorite` category → **golden koi**: rendered in the Pond as completed, with gold rim + stronger glow.

**Verification model:** the repo has no unit-test runner. Every task verifies with `npm run lint && npm run build` plus a concrete dev-server check (stated per task). Do not add a test framework (YAGNI).

---

### Task 1: Dependencies, fonts, design tokens

**Files:**

- Modify: `package.json` (via npm)
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` (append)

- [ ] **Step 1: Install Three.js**

```bash
npm install three && npm install -D @types/three
```

- [ ] **Step 2: Add the three Google fonts to `src/app/layout.tsx`**

Extend the existing `next/font/google` import and add after the `inter` block (keep the existing fonts — peripheral pages still use them until Task 12):

```tsx
import {
  Geist_Mono,
  Cormorant_Garamond,
  Inter,
  Zen_Old_Mincho,
  Zen_Kaku_Gothic_New,
  DotGothic16,
} from "next/font/google";

const zenMincho = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-mincho",
  display: "swap",
});

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-kaku",
  display: "swap",
});

const dotGothic = DotGothic16({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dot",
  display: "swap",
});
```

Add `${zenMincho.variable} ${zenKaku.variable} ${dotGothic.variable}` to the `<html>` className string.

- [ ] **Step 3: Append moss tokens to `src/app/globals.css`**

Scoped under `.moss` so they cannot collide with Karuta's existing `--bg-page`/`--text-primary` system. Values verbatim from the README token table:

```css
/* ===== Moss Garden tokens (scoped) ===== */
.moss[data-mood="midnight"] {
  --bg: #0b1310;
  --panel: #12211b;
  --panel2: #0e1a15;
  --line: #23382f;
  --line2: #2b4a3c;
  --ink: #e8f0e9;
  --mut: #9db3a7;
  --dim: #54695f;
  --moss: #8fbf9f;
  --gold: #e0c98a;
  --blossom: #d9a8c4;
  --pond1: #16332a;
  --pond2: #0d1f19;
  --sandline: rgba(232, 240, 233, 0.045);
  --leaf1: #3f6e52;
  --leaf2: #5c8a6a;
  --leaf3: #2f5940;
  --pot: #22302a;
}
.moss[data-mood="dawn"] {
  --bg: #f0ead9;
  --panel: #faf6ea;
  --panel2: #efe8d6;
  --line: #d5cbb2;
  --line2: #b8ab8c;
  --ink: #2c3830;
  --mut: #5f7060;
  --dim: #8fa091;
  --moss: #4a7a5c;
  --gold: #a8842c;
  --blossom: #c4708f;
  --pond1: #9cc4ac;
  --pond2: #7dab8f;
  --sandline: rgba(44, 56, 48, 0.07);
  --leaf1: #6f9a7c;
  --leaf2: #88ae92;
  --leaf3: #5a8266;
  --pot: #b8ab92;
}
.moss {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-kaku), system-ui, sans-serif;
}
```

Then append every `@keyframes` from the primary reference lines 17–39 **verbatim** (riseIn, swimA/B/C, tailWag, rippleOut, bob, petalDrift, leafSway, growUp, shojiCloseL/R, stepIn, walkFade, fadeOutSoft, promptPulse, blobIn, rippleCover, ringCover, paperT, paperB, inkCover, bubbleUp), plus from the Garden Map reference lines 25–26 and 32–33: `fireflyMove`, `fireflyGlow`, `shojiOpenL`, `shojiOpenR`. Prefix each name with `mg-` (e.g. `mg-riseIn`) to avoid clashing with existing Karuta keyframes; all garden components reference the prefixed names.

`prefers-reduced-motion` fallback (README phase 7, front-loaded so every component inherits it):

```css
@media (prefers-reduced-motion: reduce) {
  .moss *,
  .moss *::before,
  .moss *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build` — expect clean build.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/app/layout.tsx src/app/globals.css
git commit -m "feat(garden): add three.js, Zen fonts, moss design tokens"
```

---

### Task 2: Garden types + data adapter

**Files:**

- Create: `src/lib/garden/types.ts`
- Create: `src/lib/garden/adapter.ts`

- [ ] **Step 1: Create `src/lib/garden/types.ts`**

```ts
export type GardenStatus = "plan" | "watching" | "completed";

/** The design's per-title shape (handoff README §Architecture pt. 1). */
export interface GardenAnime {
  id: string; // CollectedAnime.id (Supabase row id)
  malId: number;
  title: string;
  kanji: string; // native title; falls back to title until enriched
  genre: string; // primary genre; "" until enriched
  syn: string; // one-line synopsis; "" until enriched
  status: GardenStatus;
  favorite: boolean; // golden-koi flag (approved mapping for "favorite")
  progress: number; // current_episode
  eps: number; // total_episodes, min 1 (guard airing/unknown = 0)
  rating: number; // 0–5, null → 0
  c1: string; // accent from cover art (Task 4)
  c2: string;
  imageUrl: string;
}

export type GardenView = "world" | "grove" | "pond" | "seeds" | "stone";
export type TransitKind = "walk" | "leaf" | "ripple" | "paper" | "ink";
export type Mood = "midnight" | "dawn";
```

- [ ] **Step 2: Create `src/lib/garden/adapter.ts`**

```ts
import type { CollectedAnime } from "@/lib/types";
import type { GardenAnime, GardenStatus } from "./types";

const STATUS_MAP: Record<CollectedAnime["category"], GardenStatus> = {
  plan_to_watch: "plan",
  watching: "watching",
  watched: "completed",
  favorite: "completed", // golden koi — favorites live in the Pond
};

export interface GardenMeta {
  kanji?: string;
  genre?: string;
  syn?: string;
}

export function toGardenAnime(
  item: CollectedAnime,
  meta: GardenMeta | undefined,
  colors: { c1: string; c2: string },
): GardenAnime {
  return {
    id: item.id,
    malId: item.mal_id,
    title: item.title,
    kanji: meta?.kanji || item.title,
    genre: meta?.genre ?? "",
    syn: meta?.syn ?? "",
    status: STATUS_MAP[item.category],
    favorite: item.category === "favorite",
    progress: item.current_episode,
    eps: Math.max(1, item.total_episodes),
    rating: item.rating ?? 0,
    c1: colors.c1,
    c2: colors.c2,
    imageUrl: item.image_url,
  };
}

/** Derived data for Garden3D.updateData + Quick Travel stats + Records House. */
export function deriveGarden(all: GardenAnime[]) {
  const growing = all.filter((a) => a.status === "watching");
  const done = all.filter((a) => a.status === "completed");
  const seeds = all.filter((a) => a.status === "plan");
  // hours of tending = Σ episodes watched × 24 min ÷ 60 (README §Garden Record)
  const hours = Math.round(all.reduce((m, a) => m + a.progress * 24, 0) / 60);
  const byGenre: Record<string, number> = {};
  for (const a of all) {
    if (a.genre) byGenre[a.genre] = (byGenre[a.genre] || 0) + a.progress;
  }
  const topGenre =
    Object.keys(byGenre).sort((x, y) => byGenre[y] - byGenre[x])[0] ?? "—";
  return { growing, done, seeds, hours, topGenre };
}
```

- [ ] **Step 3: Verify** — `npm run lint && npm run build` clean.

- [ ] **Step 4: Commit**

```bash
git add src/lib/garden/types.ts src/lib/garden/adapter.ts
git commit -m "feat(garden): garden data model and CollectedAnime adapter"
```

---

### Task 3: Jikan enrichment cache (kanji / genre / synopsis)

Karuta does not store native title, genres, or synopsis. Enrich at runtime from the existing Jikan client (`src/lib/jikan.ts` — `getAnimeById`, line 54), sequentially (Jikan rate limit ≈ 3 req/s), cached in localStorage so each title is fetched once ever.

**Files:**

- Create: `src/stores/garden-meta-store.ts`
- Modify: `src/lib/jikan.ts` (only if `JikanAnime` lacks `title_japanese` — add the optional field to the interface)

- [ ] **Step 1: Ensure `JikanAnime` exposes `title_japanese`**

Open `src/lib/jikan.ts`; if the interface (lines 3–24) lacks it, add:

```ts
  title_japanese?: string | null;
```

(The API returns it on `/anime/{id}`; no fetch change needed.)

- [ ] **Step 2: Create `src/stores/garden-meta-store.ts`**

```ts
import { create } from "zustand";
import { getAnimeById } from "@/lib/jikan";
import type { GardenMeta } from "@/lib/garden/adapter";

const CACHE_KEY = "karuta-garden-meta-v1";
const FETCH_GAP_MS = 400; // stay under Jikan's 3 req/s

function loadCache(): Record<number, GardenMeta> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

interface GardenMetaState {
  meta: Record<number, GardenMeta>;
  /** Queue fetches for any mal_ids not yet cached. Safe to call repeatedly. */
  ensure: (malIds: number[]) => void;
}

let queue: number[] = [];
let pumping = false;

export const useGardenMetaStore = create<GardenMetaState>((set, get) => ({
  meta: loadCache(),

  ensure: (malIds) => {
    const { meta } = get();
    const missing = malIds.filter((id) => !meta[id] && !queue.includes(id));
    if (missing.length === 0) return;
    queue.push(...missing);
    if (pumping) return;
    pumping = true;
    const pump = async () => {
      while (queue.length > 0) {
        const malId = queue.shift()!;
        const anime = await getAnimeById(malId);
        if (anime) {
          const entry: GardenMeta = {
            kanji: anime.title_japanese ?? undefined,
            genre: anime.genres?.[0]?.name,
            syn: anime.synopsis
              ? anime.synopsis.split(/(?<=[.!?])\s/)[0].slice(0, 140)
              : undefined,
          };
          set((s) => {
            const next = { ...s.meta, [malId]: entry };
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(next));
            } catch {}
            return { meta: next };
          });
        }
        await new Promise((r) => setTimeout(r, FETCH_GAP_MS));
      }
      pumping = false;
    };
    void pump();
  },
}));
```

- [ ] **Step 3: Verify** — `npm run lint && npm run build` clean. (Behavioral check happens in Task 8 when the garden page calls `ensure`.)

- [ ] **Step 4: Commit**

```bash
git add src/stores/garden-meta-store.ts src/lib/jikan.ts
git commit -m "feat(garden): Jikan enrichment cache for kanji/genre/synopsis"
```

---

### Task 4: Cover-art accent colors (c1/c2)

README §Fidelity: derive each title's accent pair from its cover instead of hardcoded colors. MAL's CDN sends no CORS headers, so raw `<img>` → canvas would taint. Trick: Next's image optimizer (`/_next/image?url=…`) is **same-origin**, so canvas sampling is safe. Deterministic fallback palette hashes the mal_id (reuse the mulberry32 PRNG already in `src/lib/scatter.ts`).

**Files:**

- Create: `src/lib/garden/colors.ts`

- [ ] **Step 1: Check the PRNG export**

Open `src/lib/scatter.ts` and confirm the seeded-PRNG function name and export (inventory says mulberry32-based). Import it below under its real name; if it is not exported, export it.

- [ ] **Step 2: Create `src/lib/garden/colors.ts`**

```ts
import { create } from "zustand";
import { mulberry32 } from "@/lib/scatter"; // adjust to the real export name

const CACHE_KEY = "karuta-garden-colors-v1";

export interface AccentPair {
  c1: string;
  c2: string;
}

/** Deterministic muted fallback in the reference's palette register. */
export function hashAccent(malId: number): AccentPair {
  const rnd = mulberry32(malId);
  const hue = Math.floor(rnd() * 360);
  return {
    c1: `hsl(${hue} 34% 63%)`,
    c2: `hsl(${hue} 30% 41%)`,
  };
}

function loadCache(): Record<number, AccentPair> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Average color of a 24×24 downsample; c2 = darkened c1. */
async function sampleCover(imageUrl: string): Promise<AccentPair | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 24;
        const g = c.getContext("2d");
        if (!g) return resolve(null);
        g.drawImage(img, 0, 0, 24, 24);
        const d = g.getImageData(0, 0, 24, 24).data;
        let r = 0,
          gr = 0,
          b = 0,
          n = 0;
        for (let i = 0; i < d.length; i += 4) {
          r += d[i];
          gr += d[i + 1];
          b += d[i + 2];
          n++;
        }
        r = Math.round(r / n);
        gr = Math.round(gr / n);
        b = Math.round(b / n);
        const hex = (v: number) => v.toString(16).padStart(2, "0");
        const dk = (v: number) => Math.round(v * 0.62);
        resolve({
          c1: `#${hex(r)}${hex(gr)}${hex(b)}`,
          c2: `#${hex(dk(r))}${hex(dk(gr))}${hex(dk(b))}`,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    // same-origin via Next image optimizer → canvas not tainted
    img.src = `/_next/image?url=${encodeURIComponent(imageUrl)}&w=64&q=50`;
  });
}

interface ColorState {
  colors: Record<number, AccentPair>;
  ensure: (items: { malId: number; imageUrl: string }[]) => void;
}

const inFlight = new Set<number>();

export const useGardenColors = create<ColorState>((set, get) => ({
  colors: loadCache(),

  ensure: (items) => {
    for (const { malId, imageUrl } of items) {
      if (get().colors[malId] || inFlight.has(malId)) continue;
      inFlight.add(malId);
      void sampleCover(imageUrl).then((pair) => {
        const resolved = pair ?? hashAccent(malId);
        set((s) => {
          const next = { ...s.colors, [malId]: resolved };
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(next));
          } catch {}
          return { colors: next };
        });
        inFlight.delete(malId);
      });
    }
  },
}));

/** Synchronous accessor with fallback — components always get a pair. */
export function accentFor(
  colors: Record<number, AccentPair>,
  malId: number,
): AccentPair {
  return colors[malId] ?? hashAccent(malId);
}
```

- [ ] **Step 3: Verify** — `npm run lint && npm run build` clean.

- [ ] **Step 4: Commit**

```bash
git add src/lib/garden/colors.ts src/lib/scatter.ts
git commit -m "feat(garden): cover-art accent extraction with hash fallback"
```

---

### Task 5: `updateRating` in collection-store (only data-layer addition)

**Files:**

- Modify: `src/stores/collection-store.ts`

- [ ] **Step 1: Add to the `CollectionState` interface (after line 25, `updateEpisode`)**

```ts
updateRating: (id: string, rating: number | null) => Promise<void>;
```

- [ ] **Step 2: Add the implementation after `updateEpisode` (after line 148), matching the store's optimistic-update-with-revert pattern exactly**

```ts
  updateRating: async (id, rating) => {
    // Capture original before optimistic update
    const originalItem = get().items.find((i) => i.id === id);

    // Apply optimistic update immediately
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, rating } : item,
      ),
    }));

    const { error } = await supabase
      .from("collected_anime")
      .update({ rating })
      .eq("id", id);

    if (error) {
      console.error("Failed to update rating:", error);
      // Revert optimistic update
      if (originalItem) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? originalItem : item,
          ),
        }));
      }
      useToastStore.getState().addToast({
        message: "Failed to update rating. Please try again.",
        type: "error",
      });
    }
  },
```

- [ ] **Step 3: Verify** — `npm run lint && npm run build` clean.

- [ ] **Step 4: Commit**

```bash
git add src/stores/collection-store.ts
git commit -m "feat: add updateRating mutation to collection store"
```

---

### Task 6: Port `garden3d.js` → `src/lib/garden/garden3d.ts`

**Files:**

- Create: `src/lib/garden/garden3d.ts`

The handoff mandates a near-verbatim port. Copy the whole file (942 lines) and apply ONLY these changes:

- [ ] **Step 1: Copy and convert the shell**

1. Remove the IIFE wrapper `(function () { … })()` and the final `window.Garden3D = Garden3D;`.
2. Top of file: `import * as THREE from "three";` — delete every `const THREE = window.THREE` / `this.THREE = THREE` indirection **or** (lower-risk, preferred) keep `this.THREE = THREE;` assignments and just point them at the module import so the 900 remaining lines stay byte-identical.
3. `export class Garden3D { … }` and `export interface Garden3DOptions`:

```ts
export interface GardenZone {
  x: number;
  z: number;
  r: number;
  prompt?: string;
}
export interface Garden3DOptions {
  mood: "midnight" | "dawn";
  zones: Record<string, GardenZone>;
  onNear: (zone: string | null) => void;
}
export interface Garden3DData {
  trees: { pct: number }[];
  koi: { c1: string; c2: string }[];
  seeds: number;
}
```

Type the constructor `(container: HTMLElement, opts: Garden3DOptions)` and `updateData(data: Garden3DData)`. Class fields may be typed loosely (`private M!: Record<string, THREE.MeshStandardMaterial>` etc. or `// @ts-expect-error`-free `any` where faithful typing would force logic edits — fidelity beats type ceremony here, but no `ts-ignore` on real errors).

- [ ] **Step 2: Modern color-space API (README §Assets anticipates this)**

| r128-era (reference)                                           | module three (installed)                            |
| -------------------------------------------------------------- | --------------------------------------------------- |
| `renderer.outputEncoding = THREE.sRGBEncoding` (line 54)       | `renderer.outputColorSpace = THREE.SRGBColorSpace`  |
| `t.encoding = THREE.sRGBEncoding` in `noiseTexture` (line 28)  | `t.colorSpace = THREE.SRGBColorSpace`               |
| `THREE.ColorManagement.legacyMode = false` guard (lines 37–40) | delete the block — ColorManagement is on by default |

Everything else — `CapsuleGeometry`, `ACESFilmicToneMapping`, `FogExp2`, `PCFSoftShadowMap` — exists unchanged in current three.

- [ ] **Step 3: Keep exactly (do not "improve")**

- The watchdog `setInterval` (lines 128–136) — harmless under React and it protects against dev-mode RAF churn.
- `blocked(x, z)` collision shapes and axis-separated slide (lines 731–756, 789–793).
- `bridgeY`, camera lerp constants, physics constants (78 accel / 0.0035^dt friction / max 17).
- The `_dataSig` JSON signature no-op in `updateData` (lines 852–855).

- [ ] **Step 4: Verify**

`npm run lint && npm run build` clean. (`garden3d.ts` touches `window`/`document` only inside constructor/methods, never at module top level, so it is SSR-import-safe; instantiation happens client-side in Task 8.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/garden/garden3d.ts
git commit -m "feat(garden): port Garden3D engine to module three"
```

---

### Task 7: Garden view-state store

**Files:**

- Create: `src/stores/garden-store.ts`

- [ ] **Step 1: Create the store — timings verbatim from reference `travel()` (lines 472–490): swap at 800 ms, reveal at 1550 ms, clear at 2250 ms**

```ts
import { create } from "zustand";
import type { GardenView, TransitKind, Mood } from "@/lib/garden/types";

export const AREAS: Record<
  GardenView,
  { kanji: string; en: string; verb: string }
> = {
  world: { kanji: "庭", en: "The Garden", verb: "RETURNING TO" },
  grove: { kanji: "盆栽", en: "The Grove", verb: "STEPPING INTO" },
  pond: { kanji: "池", en: "The Pond", verb: "WADING INTO" },
  seeds: { kanji: "種蔵", en: "The Seed Store", verb: "OPENING" },
  stone: { kanji: "記録", en: "The Records House", verb: "ENTERING" },
};

export const KINDS: Record<GardenView, TransitKind> = {
  world: "walk",
  grove: "leaf",
  pond: "ripple",
  seeds: "paper",
  stone: "ink",
};

export const ZONES = {
  grove: { x: -28, z: -20, r: 16, prompt: "ENTER THE GROVE · 盆栽へ" },
  pond: { x: 24, z: -6, r: 21, prompt: "WADE INTO THE POND · 池へ" },
  seeds: { x: -26, z: 22, r: 10.5, prompt: "OPEN THE SEED STORE · 種蔵へ" },
  stone: {
    x: 24,
    z: 24,
    r: 12,
    prompt: "ENTER THE RECORDS HOUSE · 記録の家へ",
  },
} as const;

export const EXITS: Record<string, [number, number]> = {
  grove: [-13, -9],
  pond: [24, 13.5],
  seeds: [-26, 12],
  stone: [14, 15],
};

export interface Transit {
  to: GardenView;
  kind: TransitKind;
  phase: "closing" | "opening";
}

export interface Ritual {
  animeId: string; // CollectedAnime.id
}

interface GardenState {
  view: GardenView;
  transit: Transit | null;
  ritual: Ritual | null;
  selectedKoi: string | null;
  qtOpen: boolean;
  mood: Mood;
  near: string | null;
  /** set by the page when leaving an interior so Garden3D can respawn the player */
  pendingExitFrom: GardenView | null;
  pendingSelect: string | null;

  travel: (to: GardenView) => void;
  setNear: (near: string | null) => void;
  toggleQt: () => void;
  closeQt: () => void;
  setMood: (mood: Mood) => void;
  openRitual: (animeId: string) => void;
  closeRitual: () => void;
  confirmRitualTravel: (animeId: string) => void; // ceremony → pond w/ koi panel open
  selectKoi: (id: string | null) => void;
  clearPendingExit: () => void;
}

const MOOD_KEY = "karuta-garden-mood";
let timers: ReturnType<typeof setTimeout>[] = [];

export const useGardenStore = create<GardenState>((set, get) => ({
  view: "world",
  transit: null,
  ritual: null,
  selectedKoi: null,
  qtOpen: false,
  mood:
    typeof window !== "undefined" && localStorage.getItem(MOOD_KEY) === "dawn"
      ? "dawn"
      : "midnight",
  near: null,
  pendingExitFrom: null,
  pendingSelect: null,

  travel: (to) => {
    const { transit, view, pendingSelect } = get();
    if (transit || to === view) {
      set({ qtOpen: false });
      return;
    }
    timers.forEach(clearTimeout);
    timers = [];
    const kind = KINDS[to];
    set({ transit: { to, kind, phase: "closing" }, qtOpen: false, near: null });
    timers.push(
      setTimeout(() => {
        set({
          view: to,
          selectedKoi: pendingSelect ?? null,
          pendingSelect: null,
          pendingExitFrom: to === "world" && view !== "world" ? view : null,
        });
        window.scrollTo({ top: 0 });
      }, 800),
    );
    timers.push(
      setTimeout(() => set({ transit: { to, kind, phase: "opening" } }), 1550),
    );
    timers.push(setTimeout(() => set({ transit: null }), 2250));
  },

  setNear: (near) => set({ near }),
  toggleQt: () => set((s) => ({ qtOpen: !s.qtOpen })),
  closeQt: () => set({ qtOpen: false }),
  setMood: (mood) => {
    try {
      localStorage.setItem(MOOD_KEY, mood);
    } catch {}
    set({ mood });
  },
  openRitual: (animeId) => set({ ritual: { animeId } }),
  closeRitual: () => set({ ritual: null }),
  confirmRitualTravel: (animeId) => {
    set({ ritual: null, pendingSelect: animeId });
    get().travel("pond");
  },
  selectKoi: (id) => set({ selectedKoi: id }),
  clearPendingExit: () => set({ pendingExitFrom: null }),
}));
```

- [ ] **Step 2: Verify** — `npm run lint && npm run build` clean.

- [ ] **Step 3: Commit**

```bash
git add src/stores/garden-store.ts
git commit -m "feat(garden): view-state store with themed transit timings"
```

---

### Task 8: Garden shell — page, 3D mount, HUD, Quick Travel

**Files:**

- Create: `src/app/garden/page.tsx`
- Create: `src/components/garden/garden-experience.tsx`
- Create: `src/components/garden/world-hud.tsx`
- Create: `src/components/garden/quick-travel.tsx`
- Modify: `src/components/navbar.tsx` (hide on `/garden`)

- [ ] **Step 1: `src/app/garden/page.tsx` — route guard + client-only mount**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const GardenExperience = dynamic(
  () =>
    import("@/components/garden/garden-experience").then(
      (m) => m.GardenExperience,
    ),
  { ssr: false },
);

export default function GardenPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;
  return <GardenExperience />;
}
```

- [ ] **Step 2: `src/components/garden/garden-experience.tsx` — the conductor**

Responsibilities (full component, no page-level logic elsewhere):

```tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCollectionStore } from "@/stores/collection-store";
import { useGardenMetaStore } from "@/stores/garden-meta-store";
import { useGardenColors, accentFor } from "@/lib/garden/colors";
import { useGardenStore, ZONES, EXITS } from "@/stores/garden-store";
import { toGardenAnime, deriveGarden } from "@/lib/garden/adapter";
import { Garden3D } from "@/lib/garden/garden3d";
import { WorldHud } from "./world-hud";
import { QuickTravel } from "./quick-travel";
import { InteriorShell } from "./interior-shell";
import { TransitionOverlay } from "./transition-overlay";
import { ReleaseCeremony } from "./release-ceremony";
import type { GardenView } from "@/lib/garden/types";

export function GardenExperience() {
  const items = useCollectionStore((s) => s.items);
  const meta = useGardenMetaStore((s) => s.meta);
  const ensureMeta = useGardenMetaStore((s) => s.ensure);
  const colors = useGardenColors((s) => s.colors);
  const ensureColors = useGardenColors((s) => s.ensure);
  const g = useGardenStore();
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Garden3D | null>(null);
  const params = useSearchParams();

  // adapted data — single source for all views + 3D reflection
  const garden = useMemo(
    () =>
      items.map((i) =>
        toGardenAnime(i, meta[i.mal_id], accentFor(colors, i.mal_id)),
      ),
    [items, meta, colors],
  );
  const derived = useMemo(() => deriveGarden(garden), [garden]);

  // enrichment kickoff
  useEffect(() => {
    ensureMeta(items.map((i) => i.mal_id));
    ensureColors(
      items.map((i) => ({ malId: i.mal_id, imageUrl: i.image_url })),
    );
  }, [items, ensureMeta, ensureColors]);

  // deep-link: /garden?view=pond|grove|seeds|stone (redirects from old routes)
  useEffect(() => {
    const v = params.get("view") as GardenView | null;
    if (v && ["grove", "pond", "seeds", "stone"].includes(v)) g.travel(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // engine lifecycle
  useEffect(() => {
    if (!mountRef.current || engineRef.current) return;
    const engine = new Garden3D(mountRef.current, {
      mood: useGardenStore.getState().mood,
      zones: ZONES,
      onNear: (near) => useGardenStore.getState().setNear(near),
    });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // live reflection (README §Live data reflection)
  useEffect(() => {
    engineRef.current?.updateData({
      trees: derived.growing.map((a) => ({
        pct: Math.round((a.progress / a.eps) * 100) / 100,
      })),
      koi: derived.done.map((a) => ({ c1: a.c1, c2: a.c2 })),
      seeds: derived.seeds.length,
    });
  }, [derived]);

  // pause 3D while any UI owns the screen; sync mood; spawn-on-exit
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setPaused(g.view !== "world" || !!g.transit || !!g.ritual || g.qtOpen);
    if (e.mood !== g.mood) e.setMood(g.mood);
    if (g.pendingExitFrom && g.view === "world") {
      const exit = EXITS[g.pendingExitFrom];
      if (exit) e.setPlayerPos(exit[0], exit[1]);
      g.clearPendingExit();
    }
  }, [g.view, g.transit, g.ritual, g.qtOpen, g.mood, g.pendingExitFrom, g]);

  // E / Enter to enter near zone; Esc closes quick travel
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const s = useGardenStore.getState();
      if (
        (e.key === "e" || e.key === "E" || e.key === "Enter") &&
        s.view === "world" &&
        !s.transit &&
        !s.ritual &&
        !s.qtOpen &&
        s.near
      ) {
        s.travel(s.near as GardenView);
      }
      if (e.key === "Escape") s.closeQt();
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, []);

  return (
    <div className="moss" data-mood={g.mood} style={{ minHeight: "100vh" }}>
      <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />
      {g.view === "world" && (
        <WorldHud
          near={g.near}
          promptOn={!!g.near && !g.transit && !g.ritual && !g.qtOpen}
          zoomIn={() => engineRef.current?.zoomBy(1 / 1.25)}
          zoomOut={() => engineRef.current?.zoomBy(1.25)}
        />
      )}
      <QuickTravel derived={derived} />
      {g.view !== "world" && (
        <InteriorShell view={g.view} garden={garden} derived={derived} />
      )}
      {g.transit && <TransitionOverlay transit={g.transit} />}
      {g.ritual && <ReleaseCeremony garden={garden} />}
    </div>
  );
}
```

(`InteriorShell`, `TransitionOverlay`, `ReleaseCeremony` are Tasks 9–10; create placeholder components returning `null` in this task so it compiles, then replace.)

- [ ] **Step 3: `world-hud.tsx` — recreate reference lines 50–68 as JSX**

Pixel-fidelity notes (all inline styles or a co-located CSS module — match the reference values exactly):

- Title lockup top-center: `苔 の 庭` 10px/`.6em`/`var(--moss)` over `MOSS GARDEN` `var(--font-mincho)` 900, `clamp(20px,2.6vw,30px)`, `.34em`, text-shadows as in lines 53–54.
- Interact prompt (only when `promptOn`): pill at `bottom:6%`, 26px E key-cap (gold border, `color-mix(in oklab, var(--gold) 12%, transparent)` fill), label = `ZONES[near].prompt` at 13px/`.14em`, `animation: mg-promptPulse 1.6s ease-in-out infinite`.
- Controls hint bottom-left, `庭 を 歩 く` bottom-right, two 38px circular zoom buttons (lines 62–67). `pointer-events: none` on the layer, `auto` on the buttons.

- [ ] **Step 4: `quick-travel.tsx` — reference lines 72–88 + mood toggle row**

- Fixed top-left pill (gold rotated diamond + `早移動 QUICK TRAVEL`), dropdown 256px, rows from `AREAS` with live stats: world "walk with the arrow keys", grove `${growing.length} trees growing`, pond `${done.length} koi at home`, seeds `${seeds.length} seeds waiting`, stone `${hours} hours recorded`; current view marked `◆` gold; row click → `travel(k)`.
- Extra final row (same visual language): mood toggle — kanji `月`/`陽`, label "Midnight / Dawn", click → `setMood(mood === "midnight" ? "dawn" : "midnight")`.

- [ ] **Step 5: Hide navbar on `/garden`**

In `src/components/navbar.tsx` (client component) add at the top of the render:

```tsx
const pathname = usePathname();
if (pathname.startsWith("/garden")) return null;
```

(import `usePathname` from `next/navigation` if not present.)

- [ ] **Step 6: Verify in the running app**

Run `npm run dev`, sign in, visit `/garden`: 3D estate renders, WASD walks with momentum, E-prompt appears near zones, scroll/＋/− zooms, quick travel opens/closes with Esc, mood toggle relights scene AND swaps CSS tokens, trees/koi/crates reflect your collection counts.

- [ ] **Step 7: Commit**

```bash
git add src/app/garden src/components/garden src/components/navbar.tsx
git commit -m "feat(garden): 3D overworld shell with HUD and quick travel"
```

---

### Task 9: Interior views — Grove, Pond, Seed Store, Records House

**Files:**

- Create: `src/components/garden/interior-shell.tsx`
- Create: `src/components/garden/grove-view.tsx`
- Create: `src/components/garden/pond-view.tsx`
- Create: `src/components/garden/seeds-view.tsx`
- Create: `src/components/garden/record-view.tsx`
- Create: `src/components/garden/koi.tsx` (shared koi body/tail renderer)

All markup/values come from the primary reference; recreate as JSX with inline styles (the codebase's garden components use inline styles to stay 1:1 with the reference — deviate only for JSX syntax). Shared pieces:

- [ ] **Step 1: `interior-shell.tsx`** — reference lines 91–99 + 253–260: fixed ambient layer (`repeating-linear-gradient` sandlines, 6 drifting petals with the PET constants from line 526, plus 5 fireflies visible only at midnight — Garden Map keyframes), scrollable `z-index:20` container over the paused canvas, header block per view (kanji eyebrow 10.5px/`.55em` → Mincho title clamp(24px,3vw,34px) → poetic sub 13px/1.9/300 — copy verbatim from reference lines 104–106, 150–152, 206–208, 233–234), footer "⟵ 庭に戻る / Step back into the garden" → `travel("world")`. Entry `mg-riseIn` animations staggered `.8s`+ (reference delays: header `.8s`, content `.9–1s`, footer `1.15s`).

- [ ] **Step 2: `koi.tsx`** — port `koiParts` (reference lines 491–498) as a component:

```tsx
export function Koi({
  c1,
  c2,
  rating,
  glyph,
  scale = 1,
  favorite = false,
}: {
  c1: string;
  c2: string;
  rating: number;
  glyph: string;
  scale?: number;
  favorite?: boolean;
}) {
  /* body: w = (64 + (rating||3)*7)*scale, h = w*0.42, radius 50% 46% 46% 50%,
        gradient 100deg c1→c2, glow 14+rating*5 px of c1;
        favorite: border 1.5px solid var(--gold) and extra 0 0 18px gold glow;
        tail: clip-path polygon(0 50%,100% 0,78% 50%,100% 100%), bg c2,
        animation mg-tailWag 1.6s; glyph = kanji.slice(0,3) centered */
}
```

Write it fully — every value above is exact from the reference; `favorite` is the approved golden-koi addition.

- [ ] **Step 3: `grove-view.tsx`** — reference lines 100–144 + tree math lines 543–574:
  - Grid `repeat(auto-fill, minmax(240px,1fr))` gap 22.
  - CSS bonsai in a 196px stage: pot trapezoid in `a.c2`, trunk `26 + pct*66`px, three clumps at thresholds 0.08/0.38/0.62 with `scale = min(1,(pct-at)/0.3)`, ✿ blossoms at pct ≥ 0.8, crown `mg-leafSway 6s`.
  - Stage label thresholds: `>=1` In full bloom, `>=0.66` Budding, `>=0.33` Leafing, `>0` Sprouting, else Seed in soil.
  - Progress bar 3px `--leaf3 → --moss`.
  - Actions: Water → `updateEpisode(a.id, Math.min(a.eps, a.progress + 1))`; − → `updateEpisode(a.id, Math.max(0, a.progress - 1))`; at `progress >= eps` swap to solid-moss "放流 — Release to the pond" → `openRitual(a.id)`.
  - Empty state line 141 verbatim.

- [ ] **Step 4: `pond-view.tsx`** — reference lines 146–200 + koi placement lines 575–599:
  - Organic water shape, ripple rings, lily pads, stone masses, light-shaft overlay — values verbatim from lines 154–164.
  - One `<Koi>` per completed title at ANCH anchors (line 575), swim variants `mg-swimA/B/C`, duration `16 + (i%5)*4`s, delay `-i*3`s; `favorite` prop from adapter.
  - Click koi → `selectKoi(a.id)`; info panel (lines 178–196): title/kanji/syn, five ✿ BLOOM petals → `updateRating(a.id, a.rating === i+1 ? null : i+1)` (null clears, mirroring the reference's toggle-to-0), meta `${eps} episodes lived`, ✕ closes.
  - `selectedKoi` pre-set arrives via store after ceremony.
  - Empty state line 176 verbatim.

- [ ] **Step 5: `seeds-view.tsx`** — reference lines 202–227:
  - Envelope cards (radius `4px 4px 16px 16px`, dashed flap under 20px header strip), teardrop seed 46×58 gradient c1→c2 with first kanji char, meta `${genre} · ${eps} episodes`.
  - "種を蒔く · Plant" → `updateCategory(a.id, "watching")` then `travel("grove")`.
  - Empty state line 224 verbatim.

- [ ] **Step 6: `record-view.tsx`** — reference lines 229–251:
  - Stone monument card (max 460px, stone gradient, organic top radius, moss shadow ellipse), engraved stats with 40px hairline dividers: `derived.hours` HOURS OF TENDING, `derived.done.length` KOI RELEASED, `derived.growing.length` TREES GROWING, `derived.topGenre` THE SOIL YOU FAVOR.
  - **Karuta addition (README invites richer stats in the same language):** fifth stat — RAREST BLOOM = highest-`score` title's rarity tier via `getRarityTier` from `@/lib/types`, rendered `Mincho 700 22px` like the genre stat.
  - Closing italic line 249 verbatim.

- [ ] **Step 7: Wire into `interior-shell.tsx`** (switch on `view`), delete the Task 8 placeholder.

- [ ] **Step 8: Verify in the running app**

Grove: watering an anime advances `current_episode` in Supabase (check another tab / reload persists) and the bonsai grows; at 100% the Release button appears. Seeds: Plant moves a plan_to_watch title to watching and auto-travels to Grove. Pond: rating petals persist; favorites show gold rims. Record: stats match your collection.

- [ ] **Step 9: Commit**

```bash
git add src/components/garden
git commit -m "feat(garden): grove, pond, seed store, and records house interiors"
```

---

### Task 10: Themed transitions + Release Ceremony

**Files:**

- Create: `src/components/garden/transition-overlay.tsx`
- Create: `src/components/garden/release-ceremony.tsx`

- [ ] **Step 1: `transition-overlay.tsx`** — reference lines 263–318, all five kinds:
  - Overlay: `fixed inset-0 z-[200]`, `pointer-events` none while opening, `mg-fadeOutSoft .65s` on opening phase (line 636).
  - `walk`: shoji panels L/R with lattice gradients + 4 stepping stones `mg-stepIn` at .15/.38/.61/.84s.
  - `leaf`: five organic blobs, `mg-blobIn .5s` staggered .08s (lines 275–279 verbatim positions/radii).
  - `ripple`: expanding water circle + ring + three `mg-bubbleUp` outlines.
  - `paper`: top/bottom panels closing with dashed seam.
  - `ink`: irregular blot `mg-inkCover .7s` with rotation.
  - Centered label during `closing` phase only (lines 299–316): kanji Mincho 900 40px `.3em`, verb line 11px `.45em`, two 44px gold hairlines; content from `AREAS[transit.to]`.

- [ ] **Step 2: `release-ceremony.tsx`** — reference lines 320–344 + confirm logic lines 640–647:
  - Full-screen dim (`--bg` 92% + blur 9px), eyebrow `放 流 の 儀 — THE RELEASE`.
  - 280px pond circle, two `mg-rippleOut 2.4s` rings staggered 1.2s, `<Koi scale={1.3}>` centered.
  - Copy: "_{Title}_ has bloomed." / "Its koi will swim in your garden from tonight on."
  - "Release it 放流" → `updateCategory(id, "watched")`, then if `rating` is falsy `updateRating(id, 3)`, then `confirmRitualTravel(id)` (travels to pond with the koi's panel pre-opened). "Not yet" → `closeRitual()`.
  - Staggered `mg-riseIn` at 0/.7/.9/1.1s.

- [ ] **Step 3: Verify in the running app**

Every navigation plays its destination-themed cover → swap → reveal (~2.25s total); releasing a 100% tree marks it watched in Supabase, defaults rating 3, and lands in the Pond with that koi's panel open; canvas stays paused throughout.

- [ ] **Step 4: Commit**

```bash
git add src/components/garden
git commit -m "feat(garden): themed transitions and release ceremony"
```

---

### Task 11: Routing — garden becomes home

**Files:**

- Modify: `src/app/page.tsx`
- Modify: `src/app/collection/page.tsx`
- Modify: `src/app/shelf/page.tsx`
- Modify: `src/components/navbar.tsx`

- [ ] **Step 1: Authed `/` → `/garden`**

In `src/app/page.tsx` (client component, has `user, loading` at line 11) add before the animation effect:

```tsx
const router = useRouter(); // next/navigation

useEffect(() => {
  if (!loading && user) router.replace("/garden");
}, [user, loading, router]);
```

Keep the unauthenticated landing untouched, but retarget its authed CTA ("Go to Collection") to `/garden` labeled "Enter the garden".

- [ ] **Step 2: Redirect old collection routes (preserve deep links)**

Replace the **page component bodies** of `/collection` and `/shelf` with client redirects — do not delete files (breaking URLs was rejected):

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CollectionPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/garden?view=pond");
  }, [router]);
  return null;
}
```

Same for `/shelf` with `/garden?view=grove`. Leave now-unreferenced shelf/collection components in place this task (dead-code sweep is Task 13 — keeps this diff reviewable and reversible).

- [ ] **Step 3: Navbar** — replace Collection/Shelf links with a single "Garden 庭" link to `/garden`; keep Browse.

- [ ] **Step 4: Verify** — `npm run build` clean; signed-in visit to `/`, `/collection`, `/shelf` all land in the garden (pond/grove views respectively); signed-out `/` shows the landing; `/browse` and `/card/[mal_id]` still work.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/collection/page.tsx src/app/shelf/page.tsx src/components/navbar.tsx
git commit -m "feat(garden): garden becomes authenticated home; legacy routes redirect"
```

---

### Task 12: Peripheral pages restyle (browse, card, login, signup)

**Files:**

- Modify: `src/app/browse/page.tsx`
- Modify: `src/app/card/[mal_id]/page.tsx`
- Modify: `src/app/login/page.tsx`, `src/app/signup/page.tsx` (and `src/components/auth-form.tsx`)

Behavior unchanged — restyle only, using moss tokens (wrap each page root in `className="moss" data-mood={mood from garden store}`):

- [ ] **Step 1: Browse** = "the seed market": Mincho headings, kanji eyebrow (`種 の 市`), panel/line tokens on cards, "Collect" button copy → "Gather seed · 種を集める". Search, debounce, Jikan calls, `collect()` untouched.
- [ ] **Step 2: Card detail**: same token treatment; keep category select, episode stepper, remove, favorite. Add a quiet link "See it in the garden ⟶" → `/garden?view=` (`grove` if watching, `pond` if watched/favorite, `seeds` if plan).
- [ ] **Step 3: Auth pages**: panel card on `--bg`, Mincho heading, moss CTA pill; form logic untouched.
- [ ] **Step 4: Verify** — full flow: signup → login → browse/gather → garden plant → water → release → rate. `npm run build` clean.
- [ ] **Step 5: Commit**

```bash
git add src/app/browse src/app/card src/app/login src/app/signup src/components/auth-form.tsx
git commit -m "feat(garden): restyle browse, card, and auth pages with moss tokens"
```

---

### Task 13: Polish + dead code sweep + QA gates

**Files:** touched as needed.

- [ ] **Step 1: Polish checklist against the reference prototype (open the `.dc.html` in a browser side-by-side):**
  - Transition timings feel identical (cover .8s / reveal 1.55s / clear 2.25s).
  - E-repeat guard: entering a zone while a transit is active is ignored (store already guards; verify by mashing E).
  - Esc closes quick travel; koi panel ✕; ceremony "Not yet".
  - Empty states in all four interiors (test with a filtered account or temporarily empty arrays).
  - `eps = 0` (airing) titles: bonsai renders at Seed-in-soil, no NaN bars.
  - Reduced motion: OS setting on → instant view swaps, garden still fully navigable.
  - Mobile: interiors single-column and scrollable; overworld HUD hint hidden below 768px (walking is keyboard-only — show a gentle "best walked with a keyboard · quick travel works everywhere" note instead).
- [ ] **Step 2: Dead code sweep** — delete now-unreferenced shelf/collection view components (verify with `grep -r` for each import before deleting; keep anything `/card` or `/browse` still uses, e.g. `anime-card`).
- [ ] **Step 3: `npm run lint && npm run build`** — clean.
- [ ] **Step 4: Regression review** — dispatch the `regression-code-reviewer` agent over `git diff main...moss-garden` (CLAUDE.md workflow step 8).
- [ ] **Step 5: Frontend QA** — dispatch the `frontend-qa-agent` (CLAUDE.md workflow step 9): auth flow, collect flow, all garden mutations persisting to Supabase, responsive checks.
- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(garden): polish pass, dead code sweep, QA fixes"
```

---

## Self-review notes

- **Spec coverage:** all seven handoff phases map: 1 → done pre-plan (approved table); 2 → Tasks 1, 7; 3 → Tasks 6, 8; 4 → Tasks 2–5, 9; 5 → Task 10; 6 → Task 8 (reflection effect) + Task 7 (mood persistence, spawn-on-exit); 7 → Tasks 1 (reduced-motion), 13. Quick Travel: Task 8. Golden-koi favorites: Tasks 2, 9. Routing decision: Task 11. Peripheral cohesion: Task 12.
- **Known intentional deviations:** (1) keyframes are `mg-`prefixed; (2) rating clear writes `null` not `0` (column is nullable; adapter normalizes); (3) card page's auto-mark-watched at final episode stays — the garden path uses the ceremony instead; both write the same `updateCategory`.
- **Type consistency check:** `GardenAnime.id` is the Supabase row id everywhere (ritual, selectedKoi, mutations); `malId` used only for Jikan/color caches. `travel`/`openRitual`/`updateRating` signatures match between Tasks 7/5 and their call sites in Tasks 8–10.

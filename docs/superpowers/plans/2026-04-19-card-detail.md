# Card Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a showcase-first card detail page at `/card/[mal_id]` that displays a collected anime card on a rarity-themed stage with info sections below.

**Architecture:** Client component renders instantly from Zustand collection store, then lazy-fetches Jikan data for synopsis/genres/studio/year. Hero section uses the existing `AnimeCard` component on a CSS-animated rarity stage with GSAP entrance animation. Info sections below provide episode tracking, category management, and synopsis.

**Tech Stack:** Next.js 16 (App Router), React, Zustand, GSAP, Jikan API v4, Tailwind CSS 4

---

### Task 1: Add `getAnimeById` to Jikan Client

**Files:**
- Modify: `src/lib/jikan.ts`

- [ ] **Step 1: Add the `getAnimeById` function**

Add this function after the existing `getTopAnime` function (after line 52):

```typescript
export async function getAnimeById(
  malId: number
): Promise<JikanAnime | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/jikan.ts
git commit -m "feat: add getAnimeById to Jikan client"
```

---

### Task 2: Create Card Detail Page — Hero Section

**Files:**
- Create: `src/app/card/[mal_id]/page.tsx`
- Create: `src/app/card/[mal_id]/card-detail.css`

- [ ] **Step 1: Create the CSS file with rarity stage styles**

Create `src/app/card/[mal_id]/card-detail.css`:

```css
.card-detail-root {
  --cd-accent: #8a8a8a;
  --cd-glow: rgba(138, 138, 138, 0.1);
}
.card-detail-root[data-rarity="uncommon"] {
  --cd-accent: #22c55e;
  --cd-glow: rgba(34, 197, 94, 0.12);
}
.card-detail-root[data-rarity="rare"] {
  --cd-accent: #3b82f6;
  --cd-glow: rgba(59, 130, 246, 0.12);
}
.card-detail-root[data-rarity="epic"] {
  --cd-accent: #fbbf24;
  --cd-glow: rgba(251, 191, 36, 0.12);
}
.card-detail-root[data-rarity="legendary"] {
  --cd-accent: #ec4899;
  --cd-glow: rgba(236, 72, 153, 0.1);
}

/* Ambient glow behind card */
.card-stage-glow {
  position: absolute;
  inset: -60px;
  background: radial-gradient(ellipse, var(--cd-glow), transparent 70%);
  filter: blur(20px);
  pointer-events: none;
  z-index: 0;
}

/* Legendary gets hue-rotate animation on its glow */
.card-detail-root[data-rarity="legendary"] .card-stage-glow {
  animation: legendary-hue 6s linear infinite;
}
@keyframes legendary-hue {
  0% { filter: blur(20px) hue-rotate(0deg); }
  100% { filter: blur(20px) hue-rotate(360deg); }
}

/* Ground reflection / pedestal */
.card-stage-pedestal {
  width: 320px;
  height: 40px;
  margin-top: 8px;
  background: radial-gradient(ellipse at 50% 0%, var(--cd-glow), transparent 70%);
  filter: blur(6px);
  pointer-events: none;
}

/* Skeleton pulse for loading states */
.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: rgba(244, 228, 192, 0.06);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
```

- [ ] **Step 2: Create the page component with hero section**

Create `src/app/card/[mal_id]/page.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { AnimeCard } from "@/components/card/anime-card";
import { getAnimeById, type JikanAnime } from "@/lib/jikan";
import { getRarityTier } from "@/lib/types";
import type { AnimeCategory } from "@/lib/types";
import "./card-detail.css";

const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const CATEGORY_OPTIONS: { category: AnimeCategory; label: string }[] = [
  { category: "watching", label: "Currently Watching" },
  { category: "plan_to_watch", label: "Plan" },
  { category: "watched", label: "Watched" },
  { category: "favorite", label: "秘" },
];

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const malId = Number(params.mal_id);

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const items = useCollectionStore((s) => s.items);
  const initialized = useCollectionStore((s) => s.initialized);
  const updateCategory = useCollectionStore((s) => s.updateCategory);
  const updateEpisode = useCollectionStore((s) => s.updateEpisode);
  const remove = useCollectionStore((s) => s.remove);

  const [jikanData, setJikanData] = useState<JikanAnime | null>(null);
  const [jikanLoading, setJikanLoading] = useState(true);
  const [jikanFailed, setJikanFailed] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const item = useMemo(
    () => items.find((i) => i.mal_id === malId),
    [items, malId]
  );

  // Redirect if not authed
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Redirect if not collected
  useEffect(() => {
    if (initialized && !item) router.push("/collection");
  }, [initialized, item, router]);

  // Fetch Jikan data
  useEffect(() => {
    if (!malId) return;
    let cancelled = false;
    setJikanLoading(true);
    getAnimeById(malId).then((data) => {
      if (cancelled) return;
      if (data) {
        setJikanData(data);
      } else {
        setJikanFailed(true);
      }
      setJikanLoading(false);
    });
    return () => { cancelled = true; };
  }, [malId]);

  // Entrance animation
  useEffect(() => {
    if (!item || !cardRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      glowRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "power1.out" }
    );
    tl.fromTo(
      cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      0
    );
    tl.fromTo(
      labelRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      0.2
    );
    tl.fromTo(
      titleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      0.4
    );
    return () => { tl.kill(); };
  }, [item]);

  if (authLoading || !user || !initialized || !item) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
      </div>
    );
  }

  const rarity = getRarityTier(item.score ?? 0);
  const total = item.total_episodes || 0;
  const current = item.current_episode || 0;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  const studio = jikanData?.studios?.[0]?.name ?? null;
  const year =
    jikanData?.year ?? jikanData?.aired?.prop?.from?.year ?? null;
  const genres = jikanData?.genres?.map((g) => g.name) ?? [];
  const synopsis = jikanData?.synopsis ?? null;

  function stepEpisode(delta: number) {
    const next = Math.max(
      0,
      total > 0 ? Math.min(total, current + delta) : current + delta
    );
    if (next === current) return;
    updateEpisode(item.id, next);
    if (total > 0 && next === total && item.category !== "watched") {
      updateCategory(item.id, "watched");
    }
  }

  async function handleRemove() {
    await remove(item.id);
    router.push("/collection");
  }

  return (
    <div
      className="card-detail-root shelf-root min-h-screen"
      data-rarity={rarity}
    >
      {/* Hero */}
      <div
        ref={heroRef}
        className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-16"
        style={{
          background:
            "linear-gradient(180deg, #0a0a10 0%, #0d0d18 100%)",
        }}
      >
        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-5 top-5 text-[11px] uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
          style={{ color: "rgba(244,228,192,0.5)" }}
        >
          ← Back
        </button>

        {/* Rarity label */}
        <div
          ref={labelRef}
          className="mb-5 text-[9px] font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--cd-accent)", opacity: 0 }}
        >
          ✦ {RARITY_LABELS[rarity]} ✦
        </div>

        {/* Card + Stage */}
        <div className="relative">
          <div ref={glowRef} className="card-stage-glow" style={{ opacity: 0 }} />
          <div ref={cardRef} style={{ position: "relative", zIndex: 1, opacity: 0 }}>
            <AnimeCard
              title={item.title}
              imageUrl={item.image_url}
              score={item.score}
              episodes={item.total_episodes || null}
              synopsis={synopsis ?? undefined}
              genres={genres.length > 0 ? genres : undefined}
              studio={studio ?? undefined}
              year={year}
              collected
            />
          </div>
          <div className="card-stage-pedestal mx-auto" />
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="mt-5 max-w-lg text-center text-[22px] font-extrabold tracking-[0.04em]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--washi)",
            opacity: 0,
          }}
        >
          {item.title}
        </h1>
      </div>

      {/* Info Sections */}
      <div className="mx-auto max-w-[640px] px-6 pb-16">
        {/* Stats Bar */}
        <div
          className="flex items-center justify-center gap-6 py-5"
          style={{
            borderTop: "1px solid rgba(244,228,192,0.08)",
            borderBottom: "1px solid rgba(244,228,192,0.08)",
          }}
        >
          <StatCell label="Score" value={item.score ? item.score.toFixed(2) : "—"} />
          <div className="h-8 w-px" style={{ background: "rgba(244,228,192,0.1)" }} />
          <StatCell label="Episodes" value={total > 0 ? String(total) : "—"} />
          <div className="h-8 w-px" style={{ background: "rgba(244,228,192,0.1)" }} />
          <StatCell
            label="Year"
            value={year ? String(year) : null}
            loading={jikanLoading}
            failed={jikanFailed}
          />
          <div className="h-8 w-px" style={{ background: "rgba(244,228,192,0.1)" }} />
          <StatCell
            label="Studio"
            value={studio}
            loading={jikanLoading}
            failed={jikanFailed}
          />
        </div>

        {/* Genre pills */}
        <div className="flex flex-wrap gap-1.5 justify-center py-4">
          {jikanLoading ? (
            <>
              <span className="skeleton-line" style={{ width: 60, height: 22 }} />
              <span className="skeleton-line" style={{ width: 72, height: 22 }} />
              <span className="skeleton-line" style={{ width: 54, height: 22 }} />
            </>
          ) : genres.length > 0 ? (
            genres.map((g) => (
              <span
                key={g}
                className="rounded px-2.5 py-1 text-[10px]"
                style={{
                  background: "rgba(244,228,192,0.06)",
                  border: "1px solid rgba(244,228,192,0.1)",
                  color: "rgba(244,228,192,0.5)",
                }}
              >
                {g}
              </span>
            ))
          ) : null}
        </div>

        {/* Episode Tracker */}
        <div
          className="py-6"
          style={{ borderTop: "1px solid rgba(244,228,192,0.08)" }}
        >
          <div
            className="mb-3 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "rgba(244,228,192,0.5)" }}
          >
            Progress
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => stepEpisode(-1)}
              className="flex h-7 w-7 items-center justify-center rounded text-sm transition-colors"
              style={{
                background: "rgba(244,228,192,0.08)",
                color: "rgba(244,228,192,0.5)",
              }}
            >
              −
            </button>
            <div className="flex-1">
              {total > 0 ? (
                <>
                  <div
                    className="h-1.5 overflow-hidden rounded-full"
                    style={{ background: "rgba(244,228,192,0.08)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        background: "linear-gradient(90deg, var(--hanko), #e84565)",
                      }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between">
                    <span
                      className="text-[11px]"
                      style={{ color: "rgba(244,228,192,0.7)" }}
                    >
                      Episode {current} / {total}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "rgba(244,228,192,0.35)" }}
                    >
                      {percent}%
                    </span>
                  </div>
                </>
              ) : (
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(244,228,192,0.7)" }}
                >
                  Episode {current}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => stepEpisode(1)}
              className="flex h-7 w-7 items-center justify-center rounded text-sm transition-colors"
              style={{
                background: "rgba(244,228,192,0.08)",
                color: "rgba(244,228,192,0.5)",
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Category & Actions */}
        <div
          className="flex items-center justify-between gap-4 py-6"
          style={{ borderTop: "1px solid rgba(244,228,192,0.08)" }}
        >
          <div>
            <div
              className="mb-2 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "rgba(244,228,192,0.5)" }}
            >
              Shelf
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(({ category, label }) => {
                const active = item.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      if (!active) updateCategory(item.id, category);
                    }}
                    className="rounded-md px-3.5 py-1.5 text-[11px] tracking-[0.08em] transition-colors"
                    style={{
                      background: active
                        ? "rgba(196,30,58,0.2)"
                        : "rgba(244,228,192,0.04)",
                      border: active
                        ? "1px solid rgba(196,30,58,0.4)"
                        : "1px solid rgba(244,228,192,0.1)",
                      color: active
                        ? "var(--washi)"
                        : "rgba(244,228,192,0.5)",
                      fontFamily:
                        label === "秘"
                          ? "var(--font-jp)"
                          : "var(--font-display)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            {confirmRemove ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(244,228,192,0.5)" }}
                >
                  Remove?
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-[11px] tracking-[0.08em] transition-opacity hover:opacity-80"
                  style={{ color: "var(--hanko)" }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(false)}
                  className="text-[11px] tracking-[0.08em] transition-opacity hover:opacity-80"
                  style={{ color: "rgba(244,228,192,0.4)" }}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="text-[11px] tracking-[0.08em] transition-opacity hover:opacity-80"
                style={{ color: "rgba(196,30,58,0.6)" }}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Synopsis */}
        <div
          className="py-6"
          style={{ borderTop: "1px solid rgba(244,228,192,0.08)" }}
        >
          <div
            className="mb-3 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "rgba(244,228,192,0.5)" }}
          >
            Synopsis
          </div>
          {jikanLoading ? (
            <div className="flex flex-col gap-2">
              <span className="skeleton-line" style={{ width: "100%" }} />
              <span className="skeleton-line" style={{ width: "90%" }} />
              <span className="skeleton-line" style={{ width: "75%" }} />
            </div>
          ) : synopsis ? (
            <p
              className="text-[13px] leading-[1.7]"
              style={{ color: "rgba(244,228,192,0.65)" }}
            >
              {synopsis}
            </p>
          ) : (
            <p
              className="text-[13px]"
              style={{ color: "rgba(244,228,192,0.3)" }}
            >
              Synopsis unavailable
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  loading = false,
  failed = false,
}: {
  label: string;
  value: string | null;
  loading?: boolean;
  failed?: boolean;
}) {
  return (
    <div className="text-center">
      {loading ? (
        <span className="skeleton-line mx-auto block" style={{ width: 48, height: 18 }} />
      ) : (
        <div
          className="text-base font-bold"
          style={{ color: "var(--washi)" }}
        >
          {value ?? "—"}
        </div>
      )}
      <div
        className="mt-0.5 text-[8px] uppercase tracking-[0.15em]"
        style={{ color: "rgba(244,228,192,0.4)" }}
      >
        {label}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Verify the page renders in the browser**

Navigate to `http://localhost:3000/card/<mal_id>` using a `mal_id` from the user's collection. Verify:
- Hero section renders with card, rarity label, title, ambient glow
- GSAP entrance animation plays
- Stats bar shows score and episodes immediately, year/studio fill in from Jikan
- Episode tracker works (+ and − buttons)
- Category pills update on click
- Remove flow works (shows confirmation, navigates to /collection)
- Synopsis loads from Jikan with skeleton placeholders

- [ ] **Step 5: Commit**

```bash
git add src/app/card/[mal_id]/page.tsx src/app/card/[mal_id]/card-detail.css
git commit -m "feat: add card detail page with hero stage and info sections"
```

---

### Task 3: Add Navigation from Collection Grid

**Files:**
- Modify: `src/app/collection/page.tsx`

- [ ] **Step 1: Wrap collection cards in links**

In `src/app/collection/page.tsx`, add a `Link` import at the top:

```typescript
import Link from "next/link";
```

Then find the card rendering section (the `filtered.map` block) and wrap each `AnimeCard` in a `Link`:

Replace:
```tsx
{filtered.map((item) => (
  <AnimeCard
    key={item.id}
    title={item.title}
    imageUrl={item.image_url}
    score={item.score}
    episodes={item.total_episodes || null}
    collected
  />
))}
```

With:
```tsx
{filtered.map((item) => (
  <Link
    key={item.id}
    href={`/card/${item.mal_id}`}
    className="block transition-transform hover:scale-[1.02]"
  >
    <AnimeCard
      title={item.title}
      imageUrl={item.image_url}
      score={item.score}
      episodes={item.total_episodes || null}
      collected
    />
  </Link>
))}
```

- [ ] **Step 2: Add `variant="compact"` to collection cards**

The collection page should use compact cards. Update each card to include the variant prop:

```tsx
<AnimeCard
  title={item.title}
  imageUrl={item.image_url}
  score={item.score}
  episodes={item.total_episodes || null}
  collected
  variant="compact"
/>
```

Note: Check if `variant="compact"` is already set. If the collection page already renders compact cards, skip this step. If it renders full-size cards, add the prop.

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/collection`. Click a collected card. Verify it navigates to `/card/<mal_id>`. Use browser back button to return.

- [ ] **Step 4: Commit**

```bash
git add src/app/collection/page.tsx
git commit -m "feat: link collection cards to detail page"
```

---

### Task 4: Add Navigation from Shelf Spines

**Files:**
- Modify: `src/components/shelf/manga-spine.tsx`

- [ ] **Step 1: Add router import and cover click handler**

In `src/components/shelf/manga-spine.tsx`, add the router import:

```typescript
import { useRouter } from "next/navigation";
```

Inside the `MangaSpine` component function, add the router hook near the top (after the existing hooks):

```typescript
const router = useRouter();
```

- [ ] **Step 2: Make the cover image area clickable**

Find the cover image wrapper div (the one with `className="absolute top-[3px] left-0 right-0 h-[55%] overflow-hidden"`). Add an `onClick` handler and cursor style to it:

Replace:
```tsx
<div className="absolute top-[3px] left-0 right-0 h-[55%] overflow-hidden">
```

With:
```tsx
<div
  className="absolute top-[3px] left-0 right-0 h-[55%] overflow-hidden cursor-pointer"
  onClick={(e) => {
    e.stopPropagation();
    router.push(`/card/${item.mal_id}`);
  }}
>
```

The `e.stopPropagation()` prevents the click from bubbling to the drag listener on the parent div.

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/shelf`. Click the cover image area of a spine. Verify it navigates to `/card/<mal_id>`. Verify that:
- The move menu button still works (doesn't navigate).
- Dragging a spine still works (250ms delay prevents navigation).
- Episode stepper buttons on hero spines still work.

- [ ] **Step 4: Commit**

```bash
git add src/components/shelf/manga-spine.tsx
git commit -m "feat: link shelf spine covers to detail page"
```

---

### Task 5: Visual Verification and Polish

**Files:**
- Possibly modify: `src/app/card/[mal_id]/page.tsx` and `src/app/card/[mal_id]/card-detail.css`

- [ ] **Step 1: Test all rarity tiers**

If the user only has one rarity tier in their collection, test by temporarily changing the score thresholds or by collecting anime with different scores. Verify:
- Common: gray/silver ambient glow
- Uncommon: green glow
- Rare: blue glow
- Epic: gold glow
- Legendary: pink glow with hue-rotate animation

- [ ] **Step 2: Test edge cases**

1. Navigate directly to `/card/99999` (non-collected ID) → should redirect to `/collection`
2. Navigate to `/card/abc` (invalid ID) → should redirect to `/collection`
3. Test the remove flow: click Remove → Yes → should navigate to `/collection`
4. Test category change: click a different shelf pill → pill should highlight, store syncs
5. Test episode stepper: increment to max → should auto-move to "Watched" category
6. Test with Jikan down (disconnect network briefly) → page should render with stored data, synopsis shows "Synopsis unavailable"

- [ ] **Step 3: Test navigation paths**

1. From collection grid: click card → detail page → back button → collection
2. From shelf: click spine cover → detail page → back button → shelf
3. Verify the "← Back" link at top of detail page works (uses `router.back()`)

- [ ] **Step 4: Fix any visual issues found**

Apply any CSS tweaks needed. Common issues to watch for:
- Card overflow or clipping in the hero section
- Stats bar not centering properly on mobile widths
- Skeleton placeholders not matching the size of actual content
- Genre pills wrapping awkwardly

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish card detail page visual issues"
```

---

### Task 6: Update STATUS.md

**Files:**
- Modify: `docs/superpowers/specs/STATUS.md`

- [ ] **Step 1: Update status**

Update `STATUS.md`:
- Change phase to "Card Detail Page Shipped"
- Add card detail page to the completed items list
- Remove it from "What's Next"
- Add `/card/[mal_id]/page.tsx` and `card-detail.css` to the project structure
- Update resume notes with the spec/plan references

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/STATUS.md
git commit -m "docs: update STATUS for card detail page"
```

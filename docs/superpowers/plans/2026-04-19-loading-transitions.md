# Loading & Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all loading spinners with skeleton screens, add stagger-in animations on card grids, and add a GSAP page-transition fade to every route change.

**Architecture:** Global skeleton CSS in globals.css powers skeleton screens on Browse, Collection, Shelf, and Landing. A `<PageTransition>` client component wraps `{children}` in layout.tsx and triggers a GSAP fade on `pathname` change. Card grid stagger-in uses GSAP `fromTo` with `stagger` on a ref to the grid container, fired when loading resolves.

**Tech Stack:** Next.js 16 App Router, GSAP 3, Tailwind CSS 4, Zustand (collection store)

---

### Task 1: Global skeleton CSS

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/card/[mal_id]/card-detail.css`

Promote skeleton styles to globals so every page can use them. Remove the duplicate from card-detail.css.

- [ ] **Step 1: Add skeleton styles to globals.css**

Open `src/app/globals.css`. Append to the end of the file (after the existing `@keyframes toast-in` block):

```css
/* ── Skeleton loading ──────────────────────────────── */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: rgba(244, 228, 192, 0.06);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  display: block;
}

.skeleton-block {
  border-radius: 8px;
  background: rgba(244, 228, 192, 0.04);
  border: 1px solid rgba(244, 228, 192, 0.06);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  display: block;
}
```

- [ ] **Step 2: Remove duplicate from card-detail.css**

Open `src/app/card/[mal_id]/card-detail.css`. Find and delete the following block (approximately lines 48–57):

```css
.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: rgba(244, 228, 192, 0.06);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}
```

Leave all other rules in card-detail.css untouched.

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

Also start the dev server and open the card detail page at `http://localhost:3000/card/<any_mal_id>` to confirm the inline skeletons (synopsis, stats, genre pills) still animate correctly after the CSS move.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/card/[mal_id]/card-detail.css
git commit -m "feat: promote skeleton CSS to globals"
```

---

### Task 2: PageTransition component

**Files:**
- Create: `src/components/page-transition.tsx`
- Modify: `src/app/layout.tsx`

A client component that wraps `{children}` and GSAP-fades in the page on every route change.

- [ ] **Step 1: Read layout.tsx to understand the current structure**

Read `src/app/layout.tsx`. Confirm the `<main>` element wraps `{children}` (approximately line 40–42):

```tsx
<main className="flex-1">{children}</main>
```

- [ ] **Step 2: Create the PageTransition component**

Create `src/components/page-transition.tsx` with this exact content:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
    return () => { tween.kill(); };
  }, [pathname]);

  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Wire PageTransition into layout.tsx**

In `src/app/layout.tsx`, add the import and wrap `{children}`:

Add import after existing imports:
```tsx
import { PageTransition } from "@/components/page-transition";
```

Change:
```tsx
<main className="flex-1">{children}</main>
```

To:
```tsx
<main className="flex-1">
  <PageTransition>{children}</PageTransition>
</main>
```

- [ ] **Step 4: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Test visually**

Start the dev server. Navigate between `/`, `/browse`, `/collection`, and `/shelf`. Each page should fade in with a subtle upward drift (0.3s). The transition should feel snappy — not slow.

- [ ] **Step 6: Commit**

```bash
git add src/components/page-transition.tsx src/app/layout.tsx
git commit -m "feat: add GSAP page transition fade on route change"
```

---

### Task 3: Browse page — skeleton + stagger-in

**Files:**
- Modify: `src/app/browse/page.tsx`

Replace the data-loading spinner with an 8-card skeleton grid. When results arrive, stagger cards in.

- [ ] **Step 1: Read browse/page.tsx**

Read `src/app/browse/page.tsx` in full. Note:
- The `loading` state (local `useState<boolean>`)
- The `isMobile` hook call
- The `gridRef` (does one exist? If not, you'll add it)
- The card grid container (`<div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">`)
- The data-loading spinner block (the `{loading ? <spinner> : ...}` conditional)

- [ ] **Step 2: Add gsap import**

At the top of `src/app/browse/page.tsx`, add to the existing imports:

```tsx
import gsap from "gsap";
```

- [ ] **Step 3: Add gridRef and stagger effect**

Inside the `BrowsePage` component, after the existing hook calls, add:

```tsx
const gridRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (loading || !gridRef.current) return;
  const cards = Array.from(gridRef.current.children);
  if (cards.length === 0) return;
  gsap.fromTo(
    cards,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
  );
}, [loading]);
```

Also add `useRef` to the existing React import if it's not already there.

- [ ] **Step 4: Replace the data-loading spinner with skeleton grid**

Find the block that currently renders a spinner when `loading` is true. It looks like this (approximately lines 224–234):

```tsx
{loading ? (
  <div className="flex items-center justify-center py-20">
    <div
      className="h-8 w-8 animate-spin rounded-full border-2"
      style={{ borderTopColor: "var(--lantern-glow)" }}
    />
  </div>
) : animeList.length === 0 ? (
  ...empty state...
) : (
  <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
    {animeList.map(...)}
  </div>
)}
```

Replace the spinner branch with a skeleton grid, and attach `gridRef` to the results grid:

```tsx
{loading ? (
  <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="skeleton-block"
        style={{
          width: isMobile ? 180 : 280,
          height: isMobile ? 260 : 420,
        }}
      />
    ))}
  </div>
) : animeList.length === 0 ? (
  ...empty state (unchanged)...
) : (
  <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
    {animeList.map(...unchanged...)}
  </div>
)}
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Test visually**

Navigate to `/browse`. You should see 8 skeleton card placeholders pulsing while Jikan loads. When results arrive, cards should stagger in from bottom (y:10 → y:0). Type a search query — the skeleton should reappear while searching, then the results stagger in.

- [ ] **Step 7: Commit**

```bash
git add src/app/browse/page.tsx
git commit -m "feat: browse page skeleton cards + stagger-in on load"
```

---

### Task 4: Collection page — skeleton + stagger-in

**Files:**
- Modify: `src/app/collection/page.tsx`

Replace the auth/init spinner with an 8-card skeleton grid. When the collection loads, stagger cards in.

- [ ] **Step 1: Read collection/page.tsx**

Read `src/app/collection/page.tsx` in full. Note:
- The `initialized` selector from the collection store
- The auth guard spinner (lines ~70–82)
- The card grid container

- [ ] **Step 2: Add gsap import and ref**

Add to imports:
```tsx
import gsap from "gsap";
```

Add `useRef` to React imports if missing.

Inside the `CollectionPage` component, after the existing hook calls, add:

```tsx
const gridRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!initialized || !gridRef.current) return;
  const cards = Array.from(gridRef.current.children);
  if (cards.length === 0) return;
  gsap.fromTo(
    cards,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
  );
}, [initialized]);
```

- [ ] **Step 3: Replace the auth spinner with skeleton grid**

Find the auth guard block (approximately lines 70–82):

```tsx
if (authLoading || !user || !initialized) {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2"
        style={{ borderTopColor: "var(--lantern-glow)" }}
      />
    </div>
  );
}
```

Replace with:

```tsx
if (authLoading || !user || !initialized) {
  return (
    <div className="px-6 py-10 sm:px-10">
      <div className="mb-8">
        <div className="skeleton-line mb-2" style={{ width: 140, height: 28 }} />
        <div className="skeleton-line" style={{ width: 100, height: 14 }} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-block"
            style={{ width: 280, height: 420 }}
          />
        ))}
      </div>
    </div>
  );
}
```

Note: the skeleton heading (`140×28`) mirrors the "My Collection" h1, and the `100×14` mirrors the entry count line. The cards default to full size (280×420) since the collection page always shows full cards on desktop and the skeleton appears before `isMobile` resolves reliably.

- [ ] **Step 4: Add ref to the live card grid**

Find the live card grid container and attach `gridRef`:

```tsx
<div ref={gridRef} className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Test visually**

Navigate to `/collection` (hard refresh). The skeleton should show briefly, then the cards stagger in. If you have an empty collection, the empty-state panel should also fade in via the stagger (it'll animate as a single element).

- [ ] **Step 7: Commit**

```bash
git add src/app/collection/page.tsx
git commit -m "feat: collection page skeleton + stagger-in on load"
```

---

### Task 5: Shelf page — skeleton spines + spinner color fix

**Files:**
- Modify: `src/app/shelf/page.tsx`

Replace the incorrect `border-t-indigo-500` spinner with skeleton spine placeholders.

- [ ] **Step 1: Read the auth guard in shelf/page.tsx**

Read `src/app/shelf/page.tsx` lines 190–205. The guard looks like:

```tsx
if (authLoading || !user || !initialized) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>
  );
}
```

Note the `border-t-indigo-500` — this is the inconsistency to fix.

- [ ] **Step 2: Replace the spinner with skeleton shelf layout**

Replace the guard return with a skeleton that mirrors the shelf page structure:

```tsx
if (authLoading || !user || !initialized) {
  return (
    <div
      className="shelf-root min-h-screen"
      style={{ background: "var(--shelf-bg, #0a0604)" }}
    >
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-10">
        {/* Header skeleton */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <div className="skeleton-line mb-2" style={{ width: 120, height: 32 }} />
            <div className="skeleton-line" style={{ width: 200, height: 14 }} />
          </div>
          <div className="skeleton-block" style={{ width: 260, height: 52 }} />
        </div>
        {/* Tab skeleton */}
        <div className="mb-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-block" style={{ width: 100, height: 44 }} />
          ))}
        </div>
        {/* Spine skeleton */}
        <div className="flex gap-3 pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-block" style={{ width: 48, height: 260 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Test visually**

Navigate to `/shelf` (hard refresh). The skeleton should show the header outline, tab placeholders, and spine placeholders — all pulsing — until the collection loads.

- [ ] **Step 5: Commit**

```bash
git add src/app/shelf/page.tsx
git commit -m "feat: shelf page skeleton layout + fix spinner color"
```

---

### Task 6: Card detail — fix spinner color

**Files:**
- Modify: `src/app/card/[mal_id]/page.tsx`

One-line fix: replace `border-zinc-700 border-t-indigo-500` with the themed spinner.

- [ ] **Step 1: Find the spinner in card/[mal_id]/page.tsx**

Look for the auth guard spinner (approximately lines 111–117):

```tsx
if (authLoading || !user || !initialized || !item) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
    </div>
  );
}
```

- [ ] **Step 2: Replace with themed spinner**

Change the spinner `<div>` to:

```tsx
<div
  className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700"
  style={{ borderTopColor: "var(--hanko)" }}
/>
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/card/\[mal_id\]/page.tsx
git commit -m "fix: card detail spinner color to use --hanko theme"
```

---

### Task 7: Landing page — skeleton CTA

**Files:**
- Modify: `src/app/page.tsx`

Replace the blank gap (`null`) during auth loading with a skeleton button placeholder.

- [ ] **Step 1: Read page.tsx**

Read `src/app/page.tsx`. Find the CTA section that renders `null` during loading (approximately lines 90–100):

```tsx
{loading ? null : (
  <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
    {user ? (
      <Link href="/browse">...</Link>
    ) : (
      <>
        <Link href="/login">...</Link>
        <Link href="/signup">...</Link>
      </>
    )}
  </div>
)}
```

- [ ] **Step 2: Replace null with skeleton button**

Change:
```tsx
{loading ? null : (
```

To:
```tsx
{loading ? (
  <div className="mt-10 flex justify-center">
    <div className="skeleton-block" style={{ width: 200, height: 44, borderRadius: 4 }} />
  </div>
) : (
```

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Test visually**

Navigate to `/` (landing). The skeleton button should briefly appear while auth resolves, then be replaced by the real CTA button.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: landing page skeleton CTA during auth loading"
```

---

### Task 8: Visual verification

**Files:**
- No code changes — verification only.

Test every page at desktop width (1280px) and mobile width (375px).

- [ ] **Step 1: Test page transitions**

Navigate between all routes: `/`, `/browse`, `/collection`, `/shelf`, `/card/<mal_id>`. Each page should fade in with a 0.3s ease-out animation. The transition should feel smooth, not jarring.

- [ ] **Step 2: Test skeleton screens**

Hard-refresh each page:
- `/browse` — 8 skeleton cards should pulse while Jikan loads (~1–2s on fast connection)
- `/collection` — skeleton heading + 8 skeleton cards on first load
- `/shelf` — skeleton header, 3 tab placeholders, 3 spine placeholders
- `/card/<mal_id>` — themed red spinner, not blue/zinc

Check landing page: the skeleton button placeholder should appear briefly on first load.

- [ ] **Step 3: Test stagger-in**

On `/browse`:
- Initial load: 8 skeleton cards → results stagger in
- Search: type a query → skeleton cards reappear → results stagger in

On `/collection`:
- Hard refresh: skeleton → cards stagger in

- [ ] **Step 4: Test at 375px**

Resize browser to 375px. On `/browse`, skeleton cards should be `180×260` (compact). On `/collection`, skeleton cards can be 280px wide (the grid will scale them).

- [ ] **Step 5: Fix any visual issues and commit**

```bash
git add -A
git commit -m "fix: visual polish from loading/transitions verification pass"
```

---

## Self-Review

**Spec coverage:**
- ✅ Global skeleton CSS (globals.css) — Task 1
- ✅ Skeleton screen on Browse — Task 3
- ✅ Skeleton screen on Collection — Task 4
- ✅ Skeleton screen on Shelf — Task 5
- ✅ Skeleton CTA on Landing — Task 7
- ✅ Stagger-in on Browse — Task 3
- ✅ Stagger-in on Collection — Task 4
- ✅ Spinner color fix on Shelf — Task 5
- ✅ Spinner color fix on Card Detail — Task 6
- ✅ PageTransition component — Task 2
- ✅ Layout integration — Task 2
- ✅ Remove duplicate skeleton CSS from card-detail.css — Task 1
- ✅ Visual verification — Task 8

**Placeholder scan:** No TBDs or vague instructions. All steps have complete code.

**Type consistency:**
- `gridRef` is `useRef<HTMLDivElement>(null)` in both Tasks 3 and 4 — consistent.
- `skeleton-line` and `skeleton-block` CSS classes used consistently throughout.
- `initialized` from `useCollectionStore` — used in Task 4 for the stagger dependency, consistent with how the collection store exposes it.

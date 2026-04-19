# Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page in the Anime Collector app work beautifully from 320px to 1440px+.

**Architecture:** Mobile-first responsive design using Tailwind CSS breakpoint prefixes (`sm:`, `md:`, `lg:`) for layout changes, plus a `useMediaQuery` hook for JS-level behavior changes (card variant switching, DnD disabling). The navbar gets a slide-in drawer on mobile. No new dependencies.

**Tech Stack:** Tailwind CSS 4 responsive prefixes, React hooks, CSS transitions

---

## File Structure

| File | Action | Purpose |
| --- | --- | --- |
| `src/hooks/use-media-query.ts` | Create | SSR-safe `useMediaQuery` hook |
| `src/components/navbar.tsx` | Modify | Hamburger button + slide-in drawer on mobile |
| `src/app/page.tsx` | Modify | Title size, CTA stacking, footer wrap |
| `src/app/browse/page.tsx` | Modify | Compact cards on mobile, header stacking, grid layout |
| `src/app/collection/page.tsx` | Modify | Controls stacking, grid layout |
| `src/app/shelf/page.tsx` | Modify | Header stacking, stats full-width, disable DnD on mobile |
| `src/components/shelf/manga-spine.tsx` | Modify | Episode stepper width on mobile |
| `src/app/card/[mal_id]/page.tsx` | Modify | Stats bar 2×2 grid, title size, category/remove stacking |

---

### Task 1: Create `useMediaQuery` hook

**Files:**
- Create: `src/hooks/use-media-query.ts`

This hook is used by Tasks 4, 6, and 5 — it must be built first.

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/use-media-query.ts
"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-media-query.ts
git commit -m "feat: add useMediaQuery hook for responsive behavior"
```

---

### Task 2: Responsive navbar with mobile drawer

**Files:**
- Modify: `src/components/navbar.tsx`

The current navbar renders horizontal nav links that overflow on mobile. This task adds a hamburger button (visible < 640px) that opens a slide-in drawer with nav links stacked vertically.

- [ ] **Step 1: Rewrite navbar.tsx**

Replace the entire content of `src/components/navbar.tsx` with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const navLinks = [
  { href: "/browse", label: "Browse", kanji: "探" },
  { href: "/collection", label: "Collection", kanji: "集" },
  { href: "/shelf", label: "Shelf", kanji: "蔵" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  if (!user) return null;

  return (
    <>
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,6,4,.92), rgba(10,6,4,.72))",
          borderBottom: "1px solid rgba(244,228,192,.14)",
          boxShadow: "0 1px 0 rgba(196,30,58,.25)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/browse"
            className="group flex items-center gap-2"
            aria-label="Anime Collector home"
          >
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-[2px] text-[13px] font-black"
              style={{
                background: "var(--hanko)",
                color: "var(--washi)",
                fontFamily: "var(--font-jp)",
                transform: "rotate(-4deg)",
                boxShadow: "0 2px 4px rgba(0,0,0,.45)",
              }}
            >
              集
            </span>
            <span
              className="text-[15px] font-bold tracking-[.14em]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--washi)",
              }}
            >
              ANIME COLLECTOR
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 sm:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="group relative flex flex-col items-center py-1 text-xs transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    letterSpacing: ".18em",
                    color: active
                      ? "var(--washi)"
                      : "rgba(244,228,192,.5)",
                  }}
                >
                  <span
                    aria-hidden
                    className="text-[9px] leading-none"
                    style={{
                      fontFamily: "var(--font-jp)",
                      opacity: active ? 0.85 : 0.45,
                    }}
                  >
                    {link.kanji}
                  </span>
                  <span className="mt-0.5 font-semibold">
                    {link.label.toUpperCase()}
                  </span>
                  <span
                    aria-hidden
                    className="mt-1 h-[2px] w-6 rounded-full transition-all duration-200"
                    style={{
                      background: active ? "var(--hanko)" : "transparent",
                      boxShadow: active
                        ? "0 0 6px rgba(196,30,58,.5)"
                        : undefined,
                    }}
                  />
                </Link>
              );
            })}

            <button
              onClick={signOut}
              className="text-[11px] transition-colors"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: ".14em",
                color: "rgba(244,228,192,.4)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--washi)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(244,228,192,.4)")
              }
            >
              SIGN OUT
            </button>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center sm:hidden"
            style={{ color: "var(--washi)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          onClick={() => setDrawerOpen(false)}
          style={{ background: "rgba(0,0,0,0.6)" }}
        />
      )}

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Navigation"
        className="fixed right-0 top-0 z-50 flex h-full w-[280px] flex-col sm:hidden"
        style={{
          background: "rgba(10,6,4,.95)",
          borderLeft: "1px solid rgba(244,228,192,.14)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        {/* Drawer header with close button */}
        <div className="flex h-14 items-center justify-end px-4">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="flex h-10 w-10 items-center justify-center"
            style={{ color: "var(--washi)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-1 flex-col px-2">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className="flex h-12 items-center gap-3 rounded-lg px-4 transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: ".14em",
                  color: active ? "var(--washi)" : "rgba(244,228,192,.5)",
                  background: active ? "rgba(244,228,192,.06)" : "transparent",
                }}
              >
                <span
                  aria-hidden
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-jp)",
                    opacity: active ? 0.85 : 0.45,
                  }}
                >
                  {link.kanji}
                </span>
                <span className="text-sm font-semibold">
                  {link.label.toUpperCase()}
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="ml-auto h-[2px] w-4 rounded-full"
                    style={{
                      background: "var(--hanko)",
                      boxShadow: "0 0 6px rgba(196,30,58,.5)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Sign out at bottom */}
        <div
          className="px-4 py-4"
          style={{ borderTop: "1px solid rgba(244,228,192,.1)" }}
        >
          <button
            onClick={() => {
              signOut();
              setDrawerOpen(false);
            }}
            className="flex h-12 w-full items-center justify-center rounded-lg text-xs font-semibold uppercase tracking-[.14em] transition-colors"
            style={{
              fontFamily: "var(--font-display)",
              color: "rgba(244,228,192,.5)",
              background: "rgba(244,228,192,.04)",
              border: "1px solid rgba(244,228,192,.1)",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Visual verification**

Open the app in the browser. At desktop width (> 640px), confirm the navbar looks identical to before (horizontal links, sign out). Resize below 640px and confirm:
- Hamburger icon appears, nav links hide
- Tapping hamburger opens drawer from right with overlay
- Links are stacked vertically with kanji and active indicator
- Sign out at bottom with hairline divider
- Clicking a link navigates and closes drawer
- Clicking overlay closes drawer
- Pressing Escape closes drawer

- [ ] **Step 4: Commit**

```bash
git add src/components/navbar.tsx
git commit -m "feat: responsive navbar with mobile slide-in drawer"
```

---

### Task 3: Responsive landing page

**Files:**
- Modify: `src/app/page.tsx`

Three small tweaks: title size scales down on mobile, CTA buttons stack vertically, footer meta wraps cleanly.

- [ ] **Step 1: Update the title classes**

In `src/app/page.tsx`, find the `<h1>` element (line 60):

```tsx
className="display-title text-6xl font-extrabold leading-[0.95] sm:text-7xl md:text-[5.75rem]"
```

Replace with:

```tsx
className="display-title text-5xl font-extrabold leading-[0.95] sm:text-6xl md:text-[5.75rem]"
```

- [ ] **Step 2: Update CTA button container**

Find the CTA button container (line 93):

```tsx
<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
```

Replace with:

```tsx
<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
```

- [ ] **Step 3: Update footer meta**

Find the footer meta container (line 112):

```tsx
<div
  className="mt-14 flex items-center gap-5 text-[10px] uppercase tracking-[.3em]"
```

Replace with:

```tsx
<div
  className="mt-14 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[.3em] sm:gap-5"
```

- [ ] **Step 4: Visual verification**

Open the landing page. At desktop, confirm it looks the same. At mobile width (< 640px), confirm:
- Title is smaller (text-5xl)
- Login/Signup buttons stack vertically
- Footer meta wraps and centers

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: responsive landing page — title, CTAs, footer"
```

---

### Task 4: Responsive browse page

**Files:**
- Modify: `src/app/browse/page.tsx`

Header stacks on mobile, card grid switches to compact variant with 2-column CSS grid, rarity legend tightens.

- [ ] **Step 1: Add useMediaQuery import**

At the top of `src/app/browse/page.tsx`, add to the existing imports:

```tsx
import { useMediaQuery } from "@/hooks/use-media-query";
```

- [ ] **Step 2: Add isMobile hook call**

Inside the `BrowsePage` component, after the existing hook calls (after line 17), add:

```tsx
const isMobile = useMediaQuery("(max-width: 639px)");
```

- [ ] **Step 3: Update header container**

Find the header container (line 116):

```tsx
<div className="mb-10 flex flex-wrap items-end justify-between gap-4">
```

Replace with:

```tsx
<div className="mb-10 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
```

- [ ] **Step 4: Update rarity legend spacing**

Find the rarity legend container (line 194):

```tsx
<div className="mb-10 flex flex-wrap items-center gap-2">
```

Replace with:

```tsx
<div className="mb-10 flex flex-wrap items-center gap-1 sm:gap-2">
```

- [ ] **Step 5: Update card grid to responsive layout**

Find the card grid container (line 275):

```tsx
<div className="flex flex-wrap gap-6 justify-start">
```

Replace with:

```tsx
<div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
```

- [ ] **Step 6: Pass variant to AnimeCard**

Find the `AnimeCard` rendering inside the grid (line 277). The current code:

```tsx
<AnimeCard
  key={anime.mal_id}
  title={anime.title}
  imageUrl={anime.images.jpg.large_image_url}
  score={anime.score ?? 0}
  episodes={anime.episodes}
  synopsis={anime.synopsis ?? undefined}
  genres={anime.genres.map((g) => g.name)}
  studio={anime.studios[0]?.name}
  year={getAnimeYear(anime)}
  collected={isCollected(anime.mal_id)}
  onCollect={() => handleCollect(anime)}
/>
```

Add the `variant` prop:

```tsx
<AnimeCard
  key={anime.mal_id}
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
/>
```

- [ ] **Step 7: Visual verification**

Open the browse page. At desktop, confirm it looks identical. At mobile width (< 640px), confirm:
- Header title and collected badge stack vertically
- Cards render in compact variant (180×260)
- Cards are in a 2-column grid with small gaps
- Rarity legend pills have tighter spacing

- [ ] **Step 8: Commit**

```bash
git add src/app/browse/page.tsx
git commit -m "feat: responsive browse page — compact cards on mobile, header stacking"
```

---

### Task 5: Responsive collection page

**Files:**
- Modify: `src/app/collection/page.tsx`

Controls (filter pills + sort dropdown) stack vertically on mobile. Card grid switches to 2-column CSS grid.

- [ ] **Step 1: Update controls container**

In `src/app/collection/page.tsx`, find the controls container (line 148):

```tsx
<div className="mb-8 flex flex-wrap items-center gap-4">
```

Replace with:

```tsx
<div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
```

- [ ] **Step 2: Update sort dropdown wrapper**

Find the sort dropdown wrapper (line 174):

```tsx
<div className="ml-auto flex items-center gap-2">
```

Replace with:

```tsx
<div className="flex items-center gap-2 sm:ml-auto">
```

- [ ] **Step 3: Update card grid**

Find the card grid container (line 214):

```tsx
<div className="flex flex-wrap gap-6 justify-start">
```

Replace with:

```tsx
<div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
```

- [ ] **Step 4: Visual verification**

Open the collection page. At desktop, confirm it looks identical. At mobile (< 640px), confirm:
- Filter pills are on their own row
- Sort dropdown is on a separate row below, left-aligned
- Cards are in a 2-column grid

- [ ] **Step 5: Commit**

```bash
git add src/app/collection/page.tsx
git commit -m "feat: responsive collection page — controls stacking, grid layout"
```

---

### Task 6: Responsive shelf page

**Files:**
- Modify: `src/app/shelf/page.tsx`
- Modify: `src/components/shelf/manga-spine.tsx`

Header stacks vertically on mobile, stats box stretches full-width, DnD pointer sensor disabled on mobile, hero spine episode stepper narrows.

- [ ] **Step 1: Add imports to shelf page**

In `src/app/shelf/page.tsx`, add to the existing imports:

```tsx
import { useMediaQuery } from "@/hooks/use-media-query";
```

- [ ] **Step 2: Add isMobile hook and update sensors**

Inside `ShelfPage`, after the existing hook calls (after line 118 `const revealRef = ...`), add:

```tsx
const isMobile = useMediaQuery("(max-width: 639px)");
```

Then replace the existing `sensors` declaration (lines 120-125):

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  }),
  useSensor(KeyboardSensor)
);
```

With:

```tsx
const sensors = useSensors(
  ...(!isMobile
    ? [
        useSensor(PointerSensor, {
          activationConstraint: { delay: 250, tolerance: 5 },
        }),
      ]
    : []),
  useSensor(KeyboardSensor)
);
```

- [ ] **Step 3: Update header layout**

Find the header container (line 279):

```tsx
<div className="mb-8 flex flex-wrap items-end justify-between gap-6">
```

Replace with:

```tsx
<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
```

- [ ] **Step 4: Update stats box container**

Find the stats box + seal container (line 296):

```tsx
<div className="flex items-center gap-4">
```

Replace with:

```tsx
<div className="relative flex w-full items-center gap-4 sm:w-auto">
```

- [ ] **Step 5: Update stat cell for mobile**

Find the `Stat` component's outer div (line 378):

```tsx
<div className="flex min-w-[72px] flex-col items-center justify-center px-3 py-1">
```

Replace with:

```tsx
<div className="flex min-w-[72px] flex-1 flex-col items-center justify-center px-3 py-1 sm:flex-initial">
```

- [ ] **Step 6: Update MangaSpine episode stepper width**

In `src/components/shelf/manga-spine.tsx`, find the episode stepper container (line 223):

```tsx
style={{ bottom: -82, width: 200 }}
```

Replace with:

```tsx
style={{ bottom: -82, width: "clamp(160px, 50vw, 200px)" }}
```

This uses CSS `clamp()` to shrink the stepper to 160px on narrow viewports while keeping 200px on desktop. No JS hook needed.

- [ ] **Step 7: Visual verification**

Open the shelf page. At desktop, confirm it looks identical. At mobile (< 640px), confirm:
- Title and stats box stack vertically
- Stats box stretches full-width with evenly spaced stat cells
- 秘 seal stays in its position next to the stats
- Episode stepper on hero spine is narrower
- Drag-and-drop does not activate on pointer (move menu still works)

- [ ] **Step 8: Commit**

```bash
git add src/app/shelf/page.tsx src/components/shelf/manga-spine.tsx
git commit -m "feat: responsive shelf — header stacking, DnD disabled on mobile, stepper sizing"
```

---

### Task 7: Responsive card detail page

**Files:**
- Modify: `src/app/card/[mal_id]/page.tsx`

Stats bar switches to 2×2 grid on mobile, title shrinks, category/remove section stacks.

- [ ] **Step 1: Update title size**

In `src/app/card/[mal_id]/page.tsx`, find the title `<h1>` (around line 195):

```tsx
className="mt-5 max-w-lg text-center text-[22px] font-extrabold tracking-[0.04em]"
```

Replace with:

```tsx
className="mt-5 max-w-lg text-center text-[18px] font-extrabold tracking-[0.04em] sm:text-[22px]"
```

- [ ] **Step 2: Update stats bar container**

Find the stats bar container (around line 211):

```tsx
<div
  className="flex items-center justify-center gap-6 py-5"
  style={{
    borderTop: "1px solid rgba(244,228,192,0.08)",
    borderBottom: "1px solid rgba(244,228,192,0.08)",
  }}
>
```

Replace with:

```tsx
<div
  className="grid grid-cols-2 gap-4 py-5 sm:flex sm:items-center sm:justify-center sm:gap-6"
  style={{
    borderTop: "1px solid rgba(244,228,192,0.08)",
    borderBottom: "1px solid rgba(244,228,192,0.08)",
  }}
>
```

- [ ] **Step 3: Hide vertical dividers on mobile**

Find the three vertical divider divs between the StatCells. Each looks like:

```tsx
<div className="h-8 w-px" style={{ background: "rgba(244,228,192,0.1)" }} />
```

Replace each one with:

```tsx
<div className="hidden h-8 w-px sm:block" style={{ background: "rgba(244,228,192,0.1)" }} />
```

There are three of these dividers in the stats bar. Update all three.

- [ ] **Step 4: Update category/remove section**

Find the category/remove container (around line 342):

```tsx
<div
  className="flex items-center justify-between gap-4 py-6"
  style={{ borderTop: "1px solid rgba(244,228,192,0.08)" }}
>
```

Replace with:

```tsx
<div
  className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
  style={{ borderTop: "1px solid rgba(244,228,192,0.08)" }}
>
```

- [ ] **Step 5: Visual verification**

Open a card detail page. At desktop, confirm it looks identical. At mobile (< 640px), confirm:
- Title text is smaller (18px)
- Stats bar shows 2×2 grid: Score/Episodes on top, Year/Studio below
- Vertical dividers between stats are hidden
- Category pills and Remove button stack vertically (pills on top, Remove below)

- [ ] **Step 6: Commit**

```bash
git add src/app/card/\[mal_id\]/page.tsx
git commit -m "feat: responsive card detail — stats grid, title size, category stacking"
```

---

### Task 8: Visual verification across all pages

**Files:**
- No code changes — verification only.

Test every page at three viewport widths: 375px (iPhone), 768px (iPad), 1280px (desktop).

- [ ] **Step 1: Test at 375px width**

Resize the browser to 375px wide. Navigate through each page and verify:

1. **Landing page**: title is `text-5xl`, buttons stacked vertically, footer meta wraps
2. **Login/Signup**: form fits with padding, no overflow
3. **Browse**: header stacked, compact 2-column card grid, rarity legend tight
4. **Collection**: controls stacked (filters then sort), compact 2-column card grid
5. **Shelf**: header stacked, stats full-width, hero stepper narrower, no DnD on pointer
6. **Card detail**: stats in 2×2 grid, title smaller, category/remove stacked
7. **Navbar**: hamburger visible, drawer slides in, links work, overlay closes drawer

- [ ] **Step 2: Test at 768px width**

Resize to 768px. Verify all pages render with desktop layout (horizontal nav, full-size cards, stats in a row).

- [ ] **Step 3: Test at 1280px width**

Verify nothing regressed at desktop width — all pages look identical to before.

- [ ] **Step 4: Commit any fixes**

If any visual issues are found, fix them and commit:

```bash
git add -A
git commit -m "fix: responsive visual polish from verification pass"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `useMediaQuery` hook — Task 1
- ✅ Navbar with mobile drawer — Task 2
- ✅ Landing page responsive tweaks — Task 3
- ✅ Browse page (compact cards, header stack, grid) — Task 4
- ✅ Collection page (controls stack, grid) — Task 5
- ✅ Shelf page (header stack, stats full-width, DnD disabled, stepper sizing) — Task 6
- ✅ Card detail page (stats 2×2, title size, category stack) — Task 7
- ✅ Auth pages — already have `px-4`, no changes needed (verified in plan research)
- ✅ Visual verification across breakpoints — Task 8

**Placeholder scan:** No TBDs, TODOs, or vague instructions found. All steps have complete code.

**Type consistency:** `useMediaQuery` returns `boolean`, used as `isMobile` consistently in Tasks 4 and 6. The `variant` prop on `AnimeCard` accepts `"full" | "compact"` — verified from the component source.

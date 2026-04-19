# Card Detail Page — Design Spec

**Date:** 2026-04-19
**Status:** Approved

## Overview

A showcase-first detail page at `/card/[mal_id]` that celebrates a collected anime card. The hero section displays the full `AnimeCard` component on a rarity-themed stage with ambient lighting and an entrance animation. Below the fold, info sections provide episode tracking, category management, synopsis, and metadata — all styled in the existing washi/hanko visual language.

The page is accessible only for collected items. Users reach it by clicking a card in the collection grid or a spine on the shelf. Browse cards retain their flip-to-collect interaction.

## Route

`/card/[mal_id]/page.tsx` — a client component. The `mal_id` param is a number (Jikan's MyAnimeList ID). If the item isn't in the user's collection, redirect to `/collection`.

## Data Flow

1. **Instant render** from the Zustand collection store: title, image_url, score, total_episodes, current_episode, category. This data is already loaded by `AuthProvider` on sign-in.
2. **Lazy Jikan fetch** on mount: call `getAnimeById(mal_id)` (new function in `lib/jikan.ts`) to get synopsis, genres, studios, year, season, rating. Fill in the info sections when the response arrives.
3. **Skeleton placeholders** for Jikan-dependent fields (synopsis, genres, studio, year) while loading. If Jikan fails, show a subtle "Details unavailable" message — the page still works without it.

### New Jikan Function

```
getAnimeById(mal_id: number): Promise<JikanAnime | null>
```

Calls `https://api.jikan.moe/v4/anime/{mal_id}`. Returns the same `JikanAnime` type used by `searchAnime`. Returns `null` on error.

## Hero Section

### Layout

- Full-width section, vertically centered, minimum height `70vh`.
- Background: dark gradient base (`#0a0a10` → `#0d0d18`) with a radial ambient glow color-matched to the rarity tier.
- Back navigation link at top-left: "← Back" using `router.back()`.
- Rarity label centered above the card: `✦ LEGENDARY ✦` style, uppercase, letter-spaced, in the rarity's accent color.

### Card

Render the existing `AnimeCard` component at `variant="full"` (280×420). The card keeps its 3D parallax tilt on hover, rarity border effects, and holographic overlay for legendary. Pass `collected={true}` and no `onCollect` (the card is already collected — no action button needed).

### Stage / Pedestal

Below the card, a radial gradient "ground reflection" matching the rarity color, blurred, creating the illusion of the card sitting on a lit surface.

Behind the card, a larger radial gradient ambient glow (extends ~60px beyond the card on each side) in the rarity's color at low opacity. This is the "stage lighting."

### Rarity Color Map

| Tier | Accent Color | Glow Color (low opacity) |
| --- | --- | --- |
| Common | `#8a8a8a` | `rgba(138, 138, 138, 0.1)` |
| Uncommon | `#22c55e` | `rgba(34, 197, 94, 0.12)` |
| Rare | `#3b82f6` | `rgba(59, 130, 246, 0.12)` |
| Epic | `#fbbf24` | `rgba(251, 191, 36, 0.12)` |
| Legendary | rainbow cycle | `rgba(236, 72, 153, 0.1)` with hue-rotate animation |

### Title Block

Below the stage:
- Title in Cinzel (`var(--font-display)`), ~22px, bold, washi color.
- No Japanese subtitle needed (the card image is the star).

### Entrance Animation

On page mount, GSAP staggers:
1. Card fades in and translates up from 30px below (0.6s, `power2.out`).
2. Rarity label fades in (0.3s, starts at 0.2s).
3. Title fades in (0.3s, starts at 0.4s).
4. Ambient glow scales from 0.8 to 1.0 (0.8s, `power1.out`, starts at 0s — plays simultaneously with card).

## Info Sections

All sections live in a container below the hero, max-width `640px`, centered. Each section has a top border of `1px solid rgba(244, 228, 192, 0.08)` as a separator. Section labels use 10px uppercase letter-spaced text in dimmed washi.

### Stats Bar

A horizontal row of key metadata, centered:

| Field | Source | Fallback |
| --- | --- | --- |
| Score | Collection store (`item.score`) | "—" |
| Episodes | Collection store (`item.total_episodes`) | "—" |
| Year | Jikan fetch | Skeleton → "—" |
| Studio | Jikan fetch (first studio name) | Skeleton → "—" |

Each stat is a vertical stack: value (16px, bold, washi) over label (8px, uppercase, dimmed). Separated by `1px` vertical dividers.

Genres render as small pill tags below the stats bar (same style as the existing card back). Skeleton placeholders while Jikan loads.

### Episode Tracker

- Section label: "Progress"
- Horizontal layout: `[−]` button, progress bar with fill, `[+]` button.
- Progress bar fill uses `var(--hanko)` color with a gradient.
- Below the bar: "Episode 10 / 64" on the left, "15%" on the right.
- `−` and `+` buttons call `updateEpisode` from the collection store (same as shelf stepper).
- When episodes reach the total, auto-move to "Watched" (same logic as `MangaSpine`).
- If `total_episodes` is 0 or null, show just the current count with no bar/percentage.

### Category & Actions

- Section label: "Shelf"
- Row of pill buttons for each category: "Currently Watching", "Plan", "Watched", "秘" (favorite).
- Active category pill has `var(--hanko)` background with higher opacity. Inactive pills are dimmed with washi border.
- Clicking an inactive pill calls `updateCategory` from the collection store.
- "Remove" text button at the far right, dimmed hanko color. On click, shows a confirmation ("Remove from collection?") with confirm/cancel. On confirm, calls `remove` from collection store and navigates to `/collection`.

### Synopsis

- Section label: "Synopsis"
- Full text from Jikan, 13px, line-height 1.7, dimmed washi color.
- If Jikan hasn't loaded yet: 3 skeleton lines (animated pulse).
- If Jikan failed: "Synopsis unavailable" in dimmed text.
- Below synopsis: genre tags as pills (same skeleton/fallback pattern).

## Navigation Into the Page

### Collection Grid (`/collection`)

The compact cards in the collection grid become clickable links to `/card/[mal_id]`. Wrap each card in a `<Link>` (or use `router.push` on click). The compact card variant doesn't have interactive elements that conflict (no flip, no collect button).

### Shelf Spines

Each `MangaSpine` on the shelf gains a click handler: clicking the spine image/cover navigates to `/card/[mal_id]`. This must not conflict with:
- The existing move menu (triggered by the menu button).
- The drag-and-drop (guarded by 250ms delay).
- The episode stepper buttons on hero spines.

Solution: make the cover image area the click target for navigation. The menu button, stepper buttons, and drag listeners remain on their existing elements.

### Browse Cards

No change. Browse cards keep their flip-to-collect behavior. The detail page is a collection-only feature.

## Files

| File | Action | Purpose |
| --- | --- | --- |
| `src/app/card/[mal_id]/page.tsx` | Create | Card detail page component |
| `src/app/card/[mal_id]/card-detail.css` | Create | Hero stage, rarity glow, entrance animation styles |
| `src/lib/jikan.ts` | Modify | Add `getAnimeById(mal_id)` function |
| `src/app/collection/page.tsx` | Modify | Wrap compact cards in links to `/card/[mal_id]` |
| `src/components/shelf/manga-spine.tsx` | Modify | Add cover click → navigate to `/card/[mal_id]` |

## Edge Cases

- **Item not in collection:** If `mal_id` doesn't match any item in the collection store, redirect to `/collection`.
- **Jikan rate limit / failure:** Page renders fine with stored data. Jikan sections show "unavailable" fallback.
- **Unknown total episodes:** Episode tracker shows current count only, no progress bar or percentage.
- **Remove while on page:** After removal, navigate to `/collection`.
- **Category change on page:** Instant — pill updates, store syncs to Supabase.
- **Direct URL access:** Works if user is logged in and item is collected. Otherwise redirects (to `/login` if not authed, to `/collection` if not collected).

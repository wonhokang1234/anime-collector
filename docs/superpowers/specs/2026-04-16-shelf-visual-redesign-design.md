# Shelf Visual Redesign — Design Spec

## Overview

The shelf page currently ships as functional but visually generic — dark zinc surfaces, indigo/amber/emerald accent dots, standard rounded cards. The goal of this redesign is to give the shelf a **personal library / manga collector** identity: each of the three categories becomes its own atmospheric *scene*, spines replace generic cards, and the page reads as a curated shrine rather than a dashboard.

This spec covers the visual language for `/shelf` only. Related work (book-open modal, favorites flip, drag-and-drop, card detail page) is deferred to later specs.

## Visual Language (locked)

Established during the brainstorm. All three scenes pull from the same palette so they feel like rooms in the same house, not three different apps.

- **Manga volume spines** — each entry is rendered as a manga spine using its cover art on the upper panel, vertical title band below, rarity letter medallion at base. Cover art is already cached per-anime, so every spine is genuinely unique.
- **Indigo + sumi + hanko (印)** — indigo (藍) dye for dominant backgrounds, cream washi paper for labels, sumi (brush-ink) black for typography and rule lines, vermilion hanko seals for focal accents.
- **No brass.** Earlier iterations used brass plaques for tabs; the final language replaces brass with washi/parchment paper tabs with hanko seals where accent is needed.

### Palette

| Token | Hex | Used for |
| --- | --- | --- |
| `ink-0` | `#050710` | Deepest background (Plan scene) |
| `ink-1` | `#0a0604` | Standard dark ground |
| `ink-2` | `#1a1208` | Raised surface (stage plank, shelf board) |
| `indigo-deep` | `#0a1a3a` | Plan backdrop |
| `indigo-mid` | `#1a3a6a` | Plan highlights, tab color |
| `washi` | `#f4e4c0` | Paper labels, lantern paper, titles on dark |
| `washi-aged` | `#d4bc8a` | Watched/archival labels |
| `sumi` | `#2a1808` | Title ink on washi |
| `hanko` | `#c41e3a` | Vermilion seal, focal accent |
| `lantern-glow` | `#f4d98a` | Warm light halo (Watching) |
| `completed-stamp` | `rgba(196,30,58,0.85)` | 完 stamp on Watched |

## Page Structure

```
<ShelfPage>
  ├─ Header: "My Shelf" + stats strip (restyled — washi + hanko dots)
  ├─ <SceneTabs>         washi/sumi tab bar with kanji subtitle + hanko count badge
  │                       ├─ 鑑賞中 · WATCHING  (default active)
  │                       ├─ 予定 · PLAN
  │                       └─ 完了 · WATCHED
  └─ <Scene>             single scene visible at a time, swapped on tab click:
      ├─ WatchingScene   (hero, lantern-lit — shown when tab = watching)
      ├─ PlanScene       (indigo backdrop, tightly packed spines)
      └─ WatchedScene    (archival — cream wash, 完 stamps)
```

Layout is **tabbed** — brainstorm locked option B (single shelf + tab navigator) over stacked shelves. Only one scene is mounted at a time; tab change triggers a short cross-fade (GSAP, ~200ms). The existing `ShelfSection` collapse/expand component is retired in favor of this navigator.

Tab bar visual: sits flush above the scene, active tab has a lit indigo ground + vermilion underline + small hanko badge carrying the count. Inactive tabs sit dark with kanji subtitle and title only.

## Scene Specs

### WatchingScene (hero)

The centerpiece of the page. Gets significantly more vertical real estate and visual weight than the other two.

- **Background:** warm radial — paper lantern glow (`#f4d98a`) bleeding from upper-middle into `ink-1` at edges. Subtle floor-plank horizontal grain.
- **Layout:** horizontal strip of spines centered on the page. The **first (most recently advanced) spine** is the hero:
  - Dimensions: `170 × 250` vs neighbors at `130 × 190` (~30% larger).
  - `translateY(-32px)` lift to break the shelf line.
  - Rim-light highlight along top edge, pedestal glow pooled under the base.
  - Washi bookmark ribbon (`30 × 58`) hanging from the top, vermilion tassel.
- **Progress affordance** (hero only): thick glowing progress bar under the hero's base, `"EPISODE N / TOTAL"` caption in washi-colored Cinzel, "latest · now reading" italic subtitle.
- **Stage:** dark wood plank floor with a soft floor reflection beneath the spines.
- **Empty state:** lantern is dim; copy reads *"Nothing active. Pick a book to begin."*

### PlanScene (backlog)

The stack — compressed, anticipatory. Not a hero; a *shelf you're browsing*.

- **Background:** indigo-deep (`#0a1a3a`) with repeating vertical pinstripes (`indigo-mid` at 30% opacity) suggesting a shoji screen.
- **Spines:** standard manga-volume spines (`36 × 220`), tightly packed with 2–3px gaps. No size variance — they're all "waiting."
- **Detail:** dashed washi border runs the full width of the scene as a section top/bottom frame (matches the hanko tab's dashed inner border).
- **Empty state:** cream washi square, hanko-stamped: *"未読 · nothing planned yet"*.

### WatchedScene (archive)

Not dusty — *archival*. Brighter than v1, intentionally past-tense.

- **Background:** `ink-2` wash with warm crimson and cream side gradients bleeding in from left/right (evoking a lit archive room, not a crypt).
- **Spines:** same manga-volume layout as Plan, but with `filter: saturate(0.92) brightness(0.98)`. A subtle translucent ✓ overlay (`rgba(244,228,192,0.18)`) sits across each spine.
- **Focal accent:** large vermilion **完** stamp (40 × 40, `rgba(196,30,58,0.85)`) at the top-left of the scene, slightly rotated, as if inked over the frame.
- **Empty state:** cream washi, faded sumi stroke reading *"完 — no completed titles yet"*.

## Spine Anatomy (shared component)

The single reusable unit across all three scenes. Built as `<MangaSpine item={} hero={} tone={"watching"|"plan"|"watched"} />`.

```
┌──────────────┐ ← top foil edge (rainbow if Legendary, gold if Epic, else sumi)
│  [cover art] │   55% of spine height — cropped cover image
│              │
├──────────────┤ ← washi paper band
│  フリーレン  │   vertical title (writing-mode: vertical-rl)
│  FRIEREN     │   secondary title beneath in smaller italic Cinzel
├──────────────┤
│     [L]      │ ← rarity medallion (circular washi, hanko-ringed)
└──────────────┘
```

- Rarity letter in medallion: `C / U / R / E / L` (common → legendary).
- Hover: subtle lift (`translateY(-6px)`) + rim-light intensifies. No tilt (tilt is for cards on Collection page).
- Click behavior: **out of scope for this spec.** For now, click dispatches the same action as the existing `ShelfCard` (opens the "..." menu). The book-open modal is deferred.

## Header & Stats

- Title `"My Shelf"` stays, but typography moves to Cinzel (serif, tracking `.02em`).
- Stats strip reskins: `border-zinc-800/60` → washi-bordered pill; each `Stat` component gets its accent dot replaced by a small hanko seal (8×8 vermilion square).
- Layout and logic unchanged.

## Components (mapping to existing code)

| Existing | Change |
| --- | --- |
| `src/app/shelf/page.tsx` | Keep structure (grouping, auth gate, empty state). Update header chrome; swap `<ShelfSection>` calls to use new variants. |
| `src/app/shelf/shelf.css` | Rewritten — new tokens, scene backgrounds, lantern glow, floor-plank grain, stamp overlays. |
| `src/components/shelf/shelf-section.tsx` | **Retired.** Replaced by `<SceneTabs>` + `<Scene>`. |
| `src/components/shelf/shelf-card.tsx` | **Replaced** by `<MangaSpine>`. The episode stepper and "..." menu logic is preserved — now hosted on the spine's hover overlay and the hero spine's pedestal, respectively. |
| — (new) `src/components/shelf/scene-tabs.tsx` | Tab bar navigator. Props: `active`, `counts`, `onChange`. Renders three washi tabs with kanji subtitles + hanko count badges. |
| — (new) `src/components/shelf/scene.tsx` | Active-scene wrapper that renders the appropriate `<SceneBackdrop>` + spine layout for the active tab. Manages cross-fade on tab change. |
| — (new) `src/components/shelf/manga-spine.tsx` | Shared spine component. Props: `item`, `hero?`, `tone`, `onMove`, `onEpisodeChange`, `onRemove`. |
| — (new) `src/components/shelf/scene-backdrop.tsx` | Background wrapper (lantern / indigo shoji / archival wash). Purely decorative — pulls `tone` prop. |

## Assets & fonts

- **Cinzel** serif for titles and category labels. Load via `next/font/google` in `src/app/layout.tsx`.
- **Noto Serif JP** for kanji marks (完, 未読, 伝, 鑑賞中, 予定, 完了). Load via `next/font/google`.
- No new image assets — spines use the already-cached cover image from each `collection.items[i]`.

## Scope (what's in, what's out)

**In scope for this spec / plan:**

1. `/shelf` page visual redesign — all three scenes, manga spines, washi/hanko accent system.
2. Reusable `<MangaSpine>` and `<SceneBackdrop>` components.
3. Updated empty states (both whole-page and per-scene).
4. Header + stats restyle.
5. Font loading (Cinzel + Noto Serif JP).

**Out of scope / deferred:**

- Book-open modal (click a spine → lightbox two-page spread). Reserved for the step that replaces `/card/[id]`.
- Trading-card binder interior. Deferred to book-interior spec.
- Favorites flip (hidden shelf). Separate step.
- Drag-and-drop reordering between scenes. Still deferred — the "..." menu handles moves for now.
- Visual redesign of `/browse`, `/collection`, `/`. Out of this round.

## Testing & validation

- Visual: run dev server, navigate to `/shelf` as a user with ≥3 items in each category, click each tab and confirm each scene renders with the correct tone and cross-fades between tabs. Confirm the hero-spine treatment only applies to the first Watching entry.
- Interaction: confirm episode stepper, "..." menu, and category move behaviors still work (regressions would be the main risk when swapping `ShelfCard` → `MangaSpine`). Confirm tab count badges update when items move between categories.
- Edge cases: zero items (whole-page empty state), zero items in the active category (per-scene empty state), Watching with 1 item (hero = only spine), very long titles (vertical title should ellipsize at the washi band).
- No automated tests for this round; validation is manual via the running dev server.

## Open questions

None at spec-write time. All direction locked via visual companion (vibe A+C, scope #1, transition B-deferred, spines C, layout A stacked, accent C indigo+hanko, scenes v2 approved).

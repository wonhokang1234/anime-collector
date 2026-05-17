# Current Frontend Audit

**App name:** Karuta (codebase still uses "anime-collector" as package name; app is branded as "Karuta" per recent commits and SVG assets)
**Audited:** 2026-04-30
**Status:** Read-only discovery — no source files modified

---

## 1. Tech Stack

| Layer         | Choice                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| Framework     | Next.js 16 (App Router), TypeScript                                      |
| Styling       | Tailwind CSS 4 + hand-written CSS modules per page/component             |
| Animations    | GSAP 3 (used across every interactive component)                         |
| State         | Zustand 5 (auth store + collection store)                                |
| Database/Auth | Supabase (PostgreSQL, built-in auth, RLS)                                |
| Anime data    | Jikan API v4 (free, no API key, ~3 req/sec rate limit)                   |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/utilities                                       |
| Fonts         | Geist Sans, Geist Mono, Cinzel, Noto Serif JP (all via next/font/google) |
| Images        | next/image — remote patterns for cdn.myanimelist.net, myanimelist.net    |

---

## 2. Routes and Pages

| Route            | File                             | Auth required            | Notes                                                                       |
| ---------------- | -------------------------------- | ------------------------ | --------------------------------------------------------------------------- |
| `/`              | `src/app/page.tsx`               | No                       | Landing page. Conditional CTA (Browse if logged in, Login/Signup if not)    |
| `/login`         | `src/app/login/page.tsx`         | No                       | Thin wrapper around `<AuthForm mode="login" />`                             |
| `/signup`        | `src/app/signup/page.tsx`        | No                       | Thin wrapper around `<AuthForm mode="signup" />`                            |
| `/browse`        | `src/app/browse/page.tsx`        | Yes (redirect to /login) | Jikan top/search, anime card grid, collect action, toast                    |
| `/collection`    | `src/app/collection/page.tsx`    | Yes (redirect to /login) | Filterable/sortable grid of user's collected cards, links to /card/[mal_id] |
| `/shelf`         | `src/app/shelf/page.tsx`         | Yes (redirect to /login) | Per-category scenes, drag-and-drop, favorites reveal                        |
| `/card/[mal_id]` | `src/app/card/[mal_id]/page.tsx` | Yes (redirect to /login) | Card detail: rarity stage, stats, progress, category controls, synopsis     |

---

## 3. App Shell and Layout

### `src/app/layout.tsx`

- Root `<html>` has all four font variables and `dark` class applied
- `AuthProvider` wraps everything — initializes auth and loads/resets collection when user changes
- `Navbar` always rendered (hides itself when `user === null`)
- `PageTransition` wraps `<main>` — GSAP fade+slide in on every pathname change; clears transform `onComplete` so fixed-position children (FavoritesReveal gallery) stay viewport-anchored
- `min-h-full flex flex-col` on body, `flex-1` on main

### `src/components/navbar.tsx`

- Sticky top, `z-50`, `backdrop-blur-md`
- Hidden entirely when `user === null`
- Desktop: horizontal nav links with kanji subtitles, hanko active indicator, SIGN OUT button
- Mobile: hamburger opens a right-side drawer (slide-in CSS transition, focus trap, Escape key, `aria-modal`)
- Logo area: branded "ANIME COLLECTOR" (not yet updated to "Karuta" in nav text, but seal kanji present)
- GSAP: seal stamp entrance animation on user change

### `src/components/page-transition.tsx`

- Single `<div ref>` wrapping children; `gsap.fromTo(opacity 0→1, y 8→0)` on pathname change
- `clearProps: "transform"` after complete — critical for FavoritesReveal fixed positioning to work

### `src/components/auth-provider.tsx`

- Pure side-effect component (no rendered markup)
- Calls `initialize()` once, then `loadCollection(user.id)` or `resetCollection()` whenever `user` changes

---

## 4. Design System

### Color Tokens (defined in `globals.css` `:root` and `@theme inline`)

```
--ink-0: #050710          — darkest background
--ink-1: #0a0604          — main background
--ink-2: #1a1208          — slightly lighter bg
--indigo-deep: #0a1a3a    — accent / active tab bg
--indigo-mid: #1a3a6a     — lighter accent
--washi: #f4e4c0          — primary text / light cream
--washi-aged: #d4bc8a     — dimmed washi
--washi-dim: rgba(244,228,192,0.7)
--washi-soft: rgba(244,228,192,0.45)
--sumi: #2a1808           — dark ink brown
--hanko: #c41e3a          — primary accent / vermilion red
--hanko-bright: #e63957   — lighter accent red
--lantern-glow: #f4d98a   — gold/amber highlight
```

Tailwind `@theme inline` maps `--color-background`, `--color-foreground`, `--color-washi`, `--color-hanko`, `--color-ink`, `--font-sans`, `--font-mono`, `--font-display`, `--font-jp`.

### Utility Classes (globals.css)

- `.font-display` — Geist Sans, letter-spacing 0.02em
- `.font-jp` — Noto Serif JP
- `.washi-pill` / `.washi-pill--active` — tag/filter pill
- `.hanko-btn` — primary CTA button (red gradient, glow shadow)
- `.ghost-btn` — secondary/outline button
- `.washi-input` — form input (used by auth forms + browse search)
- `.display-title` — page heading style
- `.hairline` — gradient divider
- `.ambient-lantern` — large radial glow for page tops
- `.shoji-grain::before` — vertical stripe texture
- `.hanko-dot` — small square red accent
- `.skeleton-line` / `.skeleton-block` — pulse loading placeholders
- `@keyframes toast-in` / `.animate-toast-in` — toast entrance
- `::selection` — themed selection color

### Shelf-specific tokens (shelf.css `.shelf-root`)

Redefines all core tokens as scoped custom properties. Also defines scene backgrounds (`.scene-watching`, `.scene-plan`, `.scene-watched`), moonlit gallery (`.moon-gallery`, `.moon-star`, `.moon-pool`), fusuma door system, drag-and-drop states, shrine animations.

### Card-specific styles (card.css)

Rarity border glows with CSS `@property` and `@keyframes`. Shine overlay, holographic overlay (legendary), rarity badge colors, rarity stripe, genre tags, score stars.

### Card detail styles (card-detail.css)

Rarity-scoped `data-rarity` attribute drives `--cd-accent` and `--cd-glow`. Stage glow with legendary hue-rotate animation. Pedestal element.

### Typography

- Display: Cinzel declared via `--font-cinzel` but NOT used in `@theme inline` — `--font-display` maps to Geist Sans, not Cinzel. Cinzel is loaded but underutilized.
- Japanese: Noto Serif JP
- Monospace: Geist Mono (episode counters, score chips, tabular-nums contexts)

---

## 5. Components

### `src/components/card/anime-card.tsx`

Most complex single component. Manages its own complete state:

- `isFlipped` (useState) + `isFlippedRef` (ref sync)
- `isHovering` ref, `flipTween` ref
- Refs: `cardRef`, `innerRef`, `shineRef`, `shineBackRef`, `holoRef`, `perspectiveRef`
- GSAP: 3D tilt (follows cursor), scale on hover, flip animation (Y-axis 180deg), shine track
- Props: `title`, `imageUrl`, `score`, `episodes`, `synopsis`, `genres`, `studio`, `year`, `variant` ("full"|"compact"), `onCollect`, `collected`
- Render: outer perspective wrapper → `anime-card` → `anime-card-inner` (3D preserve-3d) → card-front + card-back
- Collect button is outside `anime-card-inner` (avoids 3D stacking context issues)
- `data-no-flip` prevents info bar clicks from triggering flip

### `src/components/shelf/manga-spine.tsx`

- Older spine component (narrower, vertical writing mode title, rarity medallion)
- Uses `useDraggable` from @dnd-kit, `DoorMirrorContext` to disable in mirror door
- Hero mode: larger, bookmark ribbon, lantern glow blob below
- Episode stepper only on hero + watching tone
- Hover-reveal context menu (move category options + remove)

### `src/components/shelf/poster-card.tsx`

- Newer card for shelf scenes (poster format with image + info strip)
- `seedRotation()` for plan section collage tilt (deterministic from item.id hash)
- GSAP hover: straighten + lift; leave: restore rotation
- Custom event dispatch/listen for cross-door hover sync (`shelf:hover-enter`, `shelf:hover-leave`)
- `useDraggable`, `DoorMirrorContext`
- Featured mode: larger (165x230), episode stepper below
- Context menu identical to manga-spine

### `src/components/shelf/scene.tsx`

- Wraps `SceneBackdrop` + items
- GSAP cross-fade on tone change
- GSAP stagger-in on tone change (clearProps after complete)
- "Watching" renders hero + secondary cards; "Plan" / "Watched" render flat list

### `src/components/shelf/scene-tabs.tsx`

- `role="tablist"`, `role="tab"`, `aria-selected` — accessibility correct
- Each tab is a `useDroppable` target (for drag-and-drop)
- GSAP badge pop when count increases or item dragged over

### `src/components/shelf/scene-backdrop.tsx`

- Pure decorative backdrop switcher — no state
- Renders named CSS-class wrappers + decorative spans per tone

### `src/components/shelf/favorites-reveal.tsx`

- GSAP: three-phase open animation (slit glow → doors slide open → gallery fade in → hint fade in)
- GSAP: two-phase close (gallery fade out → doors close)
- `forwardRef` exposing `{ toggle, isOpen, animating }` handle
- Fixed-position gallery (top: 3.5rem) overlays entire page below navbar
- `DoorMirrorContext.Provider value={true}` on right door — disables draggables in duplicate DOM
- Scroll sync between left and right doors via capture-phase scroll listeners
- Escape key closes

### `src/components/shelf/favorites-scene.tsx`

- `ShrineCard` sub-component: spotlight beam (GSAP managed), poster image, water reflection
- Starfield: 120 DOM spans created imperatively, randomized size/position/animation-delay
- GSAP entrance: beams illuminate → cards drop in → reflections materialize
- `featuredIds` state: manages which favorites are spotlit (up to 3)
- Queue row for overflow favorites with "Feature" button

### `src/components/auth-form.tsx`

- Controlled email + password inputs (`useState`)
- `signIn` / `signUp` from auth store
- Error display, submitting state, success state (signup confirmation)
- No client-side validation beyond `required` and `minLength={6}`

### `src/components/page-transition.tsx`

- GSAP fade + lift on every route change

---

## 6. State Management

### Auth Store (`src/stores/auth-store.ts`)

- Zustand: `{ user, loading, initialize, signUp, signIn, signOut }`
- `initialize()`: gets Supabase session, subscribes to `onAuthStateChange`
- No persistence (session managed by Supabase cookies via proxy)

### Collection Store (`src/stores/collection-store.ts`)

- Zustand: `{ items, loading, initialized, loadCollection, collect, updateCategory, updateEpisode, remove, isCollected, reset }`
- All mutations are optimistic with Supabase persistence (errors logged to console, not surfaced to user for update/remove operations)
- `collect()` does return `{ error }` which browse page displays as toast
- `isCollected(malId)` scans `items` array every call (no Map/Set index)

---

## 7. API and Data

### Jikan API (`src/lib/jikan.ts`)

- `searchAnime(query)` — GET `/anime?q=...&limit=20&sfw=true`
- `getTopAnime()` — GET `/top/anime?limit=25&sfw=true`
- `getAnimeById(malId)` — GET `/anime/${malId}`
- `getAnimeYear(anime)` — helper
- No caching layer — every browse/search is a fresh fetch
- Rate limit: ~3 req/sec — browse has 500ms debounce

### Supabase (`src/lib/supabase.ts`, `src/lib/supabase/`)

- Browser client: `createBrowserClient` (SSR-compatible, cookies-based)
- Server client: `createServerClient` (used by middleware)
- Proxy: `src/proxy.ts` exports `proxy()` — Next.js 16 replaces `middleware.ts`
- Table: `collected_anime` with columns: `id`, `user_id`, `mal_id`, `title`, `image_url`, `score`, `rating`, `category`, `current_episode`, `total_episodes`, `sort_order`, `created_at`
- RLS policies enforced server-side

### Business Logic Must Not Break

- `getRarityTier(score)` in `src/lib/types.ts` — score thresholds for 5 tiers
- Episode auto-advance: when `current_episode === total_episodes`, category is auto-set to "watched"
- `collect()` default category: `plan_to_watch`
- `isCollected(malId)` drives the collect button disabled state in browse
- Auth redirect: all protected pages redirect to `/login` if `!authLoading && !user`
- `initialized` gate: collection page and shelf page guard on `initialized` before rendering real content

---

## 8. Forms

### Auth Form (`src/components/auth-form.tsx`)

- Inputs: `email` (type=email, required), `password` (type=password, required, minLength=6)
- Submit: calls `signIn` or `signUp` from auth store
- Error: shows Supabase error string
- Success (signup only): shows confirmation message card with "Go to login" link
- After login success: `router.push("/browse")`

### Browse Search

- `<input type="text">` with `onChange` → debounced `handleSearch`
- Not a `<form>` element — no submit event

### Episode Stepper (card detail + poster-card + manga-spine)

- `+` / `−` buttons calling `stepEpisode(delta)` with `updateEpisode(id, next)`
- Auto-category-update to "watched" when total reached

### Category Selector (card detail)

- Four buttons styled as pills; `aria-pressed` on active
- `onClick` calls `updateCategory(item.id, category)`

### Remove Confirm (card detail)

- Two-step: "Remove" button shows confirmation pair "Yes" / "No"

---

## 9. Routing and Navigation

- `<Link>` used for inter-page navigation (collection cards → card detail, landing CTA)
- `router.push()` used for programmatic navigation (auth redirects, empty state CTAs, card detail back button, post-collect redirects)
- `router.back()` used for the back button on card detail page
- No `<a>` tags with external hrefs in the app itself

---

## 10. Responsive Behavior

### Breakpoints used

- `sm:` (640px) — primary breakpoint used throughout
- No `md:`, `lg:`, `xl:` breakpoints explicitly used in most pages

### Mobile adaptations

- Browse/Collection: `grid grid-cols-2 gap-3` on mobile, `sm:flex sm:flex-wrap sm:gap-6` on desktop
- `useMediaQuery("(max-width: 639px)")` hook drives `isMobile` in browse page → compact card variant (180x260 vs 280x420)
- Navbar: hamburger + drawer on mobile, horizontal nav on desktop
- Shelf tabs: `flex gap-0` (full-width equal thirds on all sizes)
- DnD: `PointerSensor` disabled on mobile (touch devices), only `KeyboardSensor` active
- Card detail stats: `grid grid-cols-2 gap-4` on mobile, `sm:flex sm:items-center sm:justify-center sm:gap-6` on desktop
- `useMediaQuery` returns `false` on initial SSR render (hydration mismatch potential)

### Known mobile gaps

- Horizontal scroll scenes (shelf) have no swipe affordance / scroll snap only proximity
- AnimeCard parallax tilt on mouse events — no touch equivalent
- FavoritesReveal gallery is full viewport height — may be cramped on short mobile screens
- Compact card variant in browse is hardcoded 180px wide, may overflow on very narrow screens

---

## 11. Loading and Error States

### Loading spinners

- Auth guard: spinning circle with `animate-spin`, lantern-glow border-top color
- Browse page: skeleton card grid while loading (8 `skeleton-block` divs)
- Collection page: skeleton header + skeleton card grid
- Shelf page: skeleton header + tab skeleton + spine skeleton
- Card detail: spinning circle (full page)

### Skeleton elements

- `.skeleton-line` — height 14px, pulse animation
- `.skeleton-block` — border-radius 8px, pulse animation

### Error states

- Browse: red-bordered error div with message text
- Card detail Jikan failure: `failed` prop on `StatCell` shows `—` placeholders; no explicit error UI shown to user

### Empty states

- Browse: kanji circle (`空`) + text
- Collection: dashed-border panel with kanji (`空`) + browse CTA button
- Shelf (empty total): rounded panel with kanji (`蔵`) + browse CTA
- Shelf per-section: kanji in panel + copy text (灯/未読/完)
- Favorites gallery: kanji circle (`月`) + text

### Toast

- Browse collect action: fixed bottom-right toast with hanko seal icon and message
- Auto-dismiss after 2800ms
- No toast system for other actions (category change, episode update, remove are silent)

---

## 12. Animations Inventory

All animations use GSAP. CSS `@keyframes` used only for ambient/continuous effects.

| Animation                        | Component       | Trigger                    |
| -------------------------------- | --------------- | -------------------------- |
| Seal stamp entrance              | Navbar          | User sign-in / user change |
| Page fade+lift                   | PageTransition  | Every route change         |
| Landing title char ripple        | `page.tsx`      | Mount                      |
| Landing seal elastic stamp       | `page.tsx`      | Mount                      |
| Browse card stagger-in           | Browse          | Loading completes          |
| Browse grid stagger-in           | Collection      | initialized                |
| Shelf stat count-up              | Shelf           | initialized                |
| Shelf scene slide-in             | Shelf           | initialized                |
| Shelf tab cross-fade             | Scene           | tone change                |
| Shelf card stagger-in            | Scene           | tone change                |
| Badge pop                        | SceneTab        | count change, drag-over    |
| PosterCard hover lift/straighten | PosterCard      | mouseenter/leave           |
| PosterCard cross-door sync       | PosterCard      | custom event               |
| Fusuma door open                 | FavoritesReveal | toggle (open)              |
| Fusuma door close                | FavoritesReveal | toggle (close)             |
| Favorites shrine entrance        | FavoritesScene  | isOpen true                |
| Card tilt (3D parallax)          | AnimeCard       | mousemove                  |
| Card scale on hover              | AnimeCard       | mouseenter/leave           |
| Card flip                        | AnimeCard       | click (not compact)        |
| Card detail entrance             | CardDetailPage  | item loaded                |
| Rarity border glows              | card.css        | CSS continuous             |
| Legendary holo overlay           | card.css        | hover (CSS)                |
| Spine foil shimmer               | shelf.css       | CSS continuous             |
| Shrine beam pulse                | shelf.css       | CSS continuous             |
| Shrine ring pulse                | shelf.css       | CSS continuous             |
| Water ripple sweep               | shelf.css       | CSS continuous             |
| Star twinkle                     | shelf.css       | CSS continuous             |
| Toast entrance                   | globals.css     | toast state                |
| Skeleton pulse                   | globals.css     | CSS continuous             |

---

## 13. Fragile Areas

1. **FavoritesReveal fixed positioning** — depends on `PageTransition` clearing its transform `onComplete`. If GSAP is killed before completing or another component adds a transform ancestor, fixed children will mis-position.

2. **DoorMirrorContext + DnD** — The fusuma system renders children twice. `DoorMirrorContext` disables draggables in the right door to prevent duplicate IDs crashing @dnd-kit. Any new draggable component added to shelf must respect this context.

3. **`useMediaQuery` SSR mismatch** — returns `false` on first render. On mobile, the wrong card variant might flash briefly. Not currently causing visible errors but is a hydration-risk area.

4. **GSAP tween cleanup** — Most components kill tweens on unmount. `SceneTabs` badge pop does not store a ref and does not kill the tween. If the component unmounts during the brief animation, it logs a harmless GSAP warning.

5. **Collection store optimistic updates with silent errors** — `updateCategory`, `updateEpisode`, and `remove` update local state immediately. If Supabase fails, only a `console.error` is emitted. The UI will show stale data until refresh. This is a reliability risk.

6. **Jikan rate limiting** — If browse search fires faster than 3 req/sec, Jikan returns 429. The error is caught and displayed as a string to the user, but the UX is abrupt.

7. **`getAnimeById` on card detail** — fetches Jikan on every page load for the card detail. If Jikan is down, stats/synopsis show `—` silently. No retry mechanism.

8. **`isCollected()` linear scan** — scans the full `items` array for every card rendered in browse. With large collections this is O(n × m). Acceptable now but would degrade.

9. **`MangaSpine` vs `PosterCard` — two shelf card components** — Both exist. The scene renders `PosterCard`; `MangaSpine` exists in the file system but may not be referenced in any current scene rendering path (scene.tsx uses PosterCard exclusively). This dead code creates confusion.

10. **Hard-coded `3.5rem` for FavoritesReveal** — the gallery's `top: 3.5rem` matches the navbar `h-14` (3.5rem). If navbar height ever changes, the gallery will overlap or gap.

11. **`sort_order` column unused** — `CollectedAnime` type includes `sort_order` but it's always set to 0 on insert and never read. Manual reordering is not implemented.

---

## 14. Reusable Component Opportunities

The following patterns appear repeatedly but are not extracted into shared components:

- **Kanji/hanko seal badge** — appears on landing, auth form, navbar, browse, collection, card detail (each time as inline JSX with different kanji)
- **Rarity badge** — `.rarity-badge-{tier}` is a CSS class but the HTML structure duplicates across browse legend, card front, card back
- **Section header** — kicker text + h1 + description paragraph repeats on browse and collection pages
- **Toast component** — defined inline in browse page; would benefit from a shared `<Toast>` and toast store
- **Context menu** (move-to + remove) — identical in `MangaSpine` and `PosterCard`
- **Episode stepper** — identical logic and near-identical UI in `MangaSpine`, `PosterCard`, and card detail page
- **Stat cell** — `StatCell` is defined locally in card detail, similar pattern in shelf header
- **Empty state panel** — repeated layout (kanji icon + title + body + optional CTA) across browse, collection, shelf, and favorites
- **Skeleton grid** — similar skeleton layout repeated in browse, collection, and shelf loading states
- **Spinner** — inline `<div className="animate-spin ...">` in browse and card detail

---

## 15. Business Logic That Must Not Be Touched

- `getRarityTier(score)` thresholds in `src/lib/types.ts`
- Episode auto-advance to "watched" in `stepEpisode()` (present in MangaSpine, PosterCard, and card detail)
- Auth redirect pattern: `if (!authLoading && !user) router.push("/login")`
- `initialized` gate before rendering protected collection/shelf content
- Supabase `collect()` default category of `plan_to_watch`
- `isCollected(malId)` gating the collect button
- Jikan 500ms debounce in browse search
- `DoorMirrorContext` disabling draggables in mirror door
- FavoritesReveal `animating.current` guard preventing double-trigger during tween
- PageTransition `clearProps: "transform"` on complete

---

## 16. Current UX Weaknesses

1. **App name inconsistency** — navbar still says "ANIME COLLECTOR", landing page says "ANIME COLLECTOR", but the project is being renamed to Karuta. The Karuta SVG mark exists in `/public` but is not used anywhere in the rendered app.

2. **Landing page title** — `"ANIME COLLECTOR"` in large letters; should be "KARUTA" per the rename. The landing page animation animates the letters of "ANIME" and "COLLECTOR" specifically.

3. **Navigation on logged-out state** — navbar is completely hidden for logged-out users, so there is no site-wide navigation visible on the landing, login, or signup pages. No branding in the header when logged out.

4. **No breadcrumbs or back-navigation pattern** — card detail only has `router.back()`. If a user arrives directly via URL, "Back" goes to browser history (could go anywhere).

5. **Silent mutation failures** — updateCategory, updateEpisode, remove — no user feedback on failure.

6. **No pagination** — browse shows up to 25 results (Jikan limit), no "load more" or pagination.

7. **No search in collection** — collection page only has rarity filter and sort; no text search.

8. **Collect action is not reversible from browse** — once collected, the button shows "Collected" state but the user must navigate to shelf or card detail to remove.

9. **Mobile shelf experience** — drag-and-drop disabled on mobile. The only way to reclassify items on mobile is through the context menu (three-dot). The `data-no-nav` / pointer events interaction is complex and may have edge cases on touch.

10. **FavoritesReveal on mobile** — the full-viewport gallery works but the horizontal scroll of the shrine cards and queue row is not scroll-snapped, making it hard to browse on mobile.

11. **No loading indicator between pages** — PageTransition is a fade, but there is no skeleton or loading state shown while auth/collection is initializing on first load of protected pages (just a spinner centered on the page).

12. **Cinzel font loaded but barely used** — Cinzel is declared in the root layout but `--font-display` maps to Geist Sans. The premium serif font is wasted.

13. **Sort select styling** — the `<select>` in collection uses inline styles rather than the design system's `washi-input` class; appears inconsistent.

---

## 17. File Structure Summary

```
src/
├── app/
│   ├── browse/page.tsx              — Live Jikan search + collect
│   ├── card/[mal_id]/
│   │   ├── page.tsx                 — Card detail (rarity stage, stats, progress, category, synopsis)
│   │   └── card-detail.css         — Rarity CSS custom properties + stage glow
│   ├── collection/page.tsx          — Filterable/sortable collection grid
│   ├── login/page.tsx              — Auth form wrapper
│   ├── shelf/
│   │   ├── page.tsx                 — Shelf with DnD, tabs, scenes, favorites reveal
│   │   └── shelf.css               — All shelf visual tokens + scene backdrops + moon gallery
│   ├── signup/page.tsx             — Auth form wrapper
│   ├── globals.css                  — Design system tokens + global utility classes
│   ├── icon.svg
│   ├── favicon.ico
│   ├── layout.tsx                  — Root layout (fonts, AuthProvider, Navbar, PageTransition)
│   └── page.tsx                    — Landing page (GSAP entrance, auth-conditional CTA)
├── components/
│   ├── card/
│   │   ├── anime-card.tsx           — Premium collectible card (3D flip, tilt, rarity effects)
│   │   └── card.css                — All card visual effects
│   ├── shelf/
│   │   ├── favorites-reveal.tsx     — Fusuma door system (GSAP, fixed gallery, scroll sync)
│   │   ├── favorites-scene.tsx      — Moon gallery (shrine cards, starfield, queue row)
│   │   ├── manga-spine.tsx          — Older spine component (may be orphaned)
│   │   ├── poster-card.tsx          — Shelf poster card (collage tilt, hover lift, episode stepper)
│   │   ├── scene-backdrop.tsx       — Decorative backdrop per tone
│   │   ├── scene-tabs.tsx           — Tab navigator with droppable targets
│   │   └── scene.tsx               — Scene container with GSAP transitions
│   ├── auth-form.tsx               — Login/signup form with Supabase integration
│   ├── auth-provider.tsx           — Auth initialization side-effect component
│   ├── navbar.tsx                  — Top nav (desktop + mobile drawer)
│   └── page-transition.tsx         — GSAP page fade
├── hooks/
│   └── use-media-query.ts          — Window matchMedia wrapper (SSR-safe)
├── lib/
│   ├── jikan.ts                    — Jikan API v4 client
│   ├── supabase.ts                 — Browser Supabase client
│   ├── supabase/
│   │   ├── client.ts               — SSR browser client
│   │   ├── middleware.ts           — Session refresh
│   │   └── server.ts              — SSR server client
│   └── types.ts                   — CollectedAnime, AnimeCategory, RarityTier, getRarityTier()
├── stores/
│   ├── auth-store.ts              — Zustand auth (user, loading, signIn/Up/Out, initialize)
│   └── collection-store.ts        — Zustand collection (items, CRUD, isCollected)
└── proxy.ts                       — Next.js 16 session middleware
```

---

## 18. Key Findings Summary for Revamp

**What is already strong:**

- Design language is coherent — washi/hanko/indigo palette, Japanese typography motifs, rarity system
- GSAP animations are thoughtful and well-structured (not random)
- AnimeCard is the most polished component in the codebase — the 3D flip, tilt, and rarity effects are premium
- FavoritesReveal fusuma animation is unique and memorable
- Accessibility on shelf tabs and drag-and-drop is good (aria-selected, aria-modal, keyboard trap)
- Skeleton loading states exist for all major views

**What needs work in a revamp:**

- App is named "Anime Collector" in all visible text — needs to be "Karuta"
- Cinzel font is loaded but wasted — the design language references premium typography but Geist Sans is doing all the work
- Navbar is invisible to logged-out users — no branded header on public pages
- Many inline style objects — design tokens not fully extracted to CSS custom properties
- Repetitive patterns (empty states, section headers, episode steppers, context menus) not componentized
- `MangaSpine` appears orphaned vs `PosterCard` — dead code creating confusion
- No shared toast system — toast is page-local to browse
- Collection sort select is unstyled relative to rest of design system
- Card detail genres are rendered twice (once above and once in synopsis section) — duplication bug
- Mobile experience on shelf is functional but rough — no swipe affordance, DnD disabled
- No error boundary anywhere in the tree

# Anime Collector & Shelf — Project Status

## Current Phase: Card Detail Page Shipped

**Last updated:** 2026-04-19

## What's Done

- [x] Brainstormed and finalized the project concept
- [x] Design spec written and approved (`2026-04-13-anime-collector-shelf-design.md`)
- [x] Git repo initialized with spec committed
- [x] Supabase project created — tables (`profiles`, `collected_anime`, `collected_characters`), RLS policies, auto-profile trigger all set up
- [x] Next.js 16 scaffolded (App Router, TypeScript, Tailwind CSS 4)
- [x] Dependencies installed (GSAP, @supabase/supabase-js, @supabase/ssr, Zustand)
- [x] Supabase client setup — browser client, server client, and proxy (middleware) for session refresh
- [x] Environment variables configured (`.env.local` with Supabase URL + anon key)
- [x] Auth system — Zustand auth store, AuthProvider, login/signup pages wired to Supabase
- [x] App shell — root layout with AuthProvider + Navbar, landing page with login/signup CTAs
- [x] Route structure — `/`, `/login`, `/signup`, `/browse`, `/collection`, `/shelf` all created
- [x] Anime card component with premium collectible aesthetic:
  - GSAP parallax 3D tilt on hover (follows cursor)
  - Light reflection that tracks mouse position
  - GSAP flip animation (0.6s 3D Y-axis rotation) with back face showing synopsis, genres, score
  - 5 rarity tiers with distinct visual effects (Common → Legendary holographic)
  - Full (280×420) and compact (180×260) variants
  - Collect button and collected state
- [x] Jikan API integration — `searchAnime()` and `getTopAnime()` utility functions
- [x] Browse page — live search with debounce, top anime on load, loading/error/empty states
- [x] Next.js image config for `cdn.myanimelist.net` and `myanimelist.net` hostnames
- [x] Zustand collection store (`collection-store.ts`) — load / collect / updateCategory / updateEpisode / remove / isCollected, auto-loaded on sign-in via AuthProvider
- [x] Wired the **Collect** button on Browse to persist to Supabase with toast feedback + collected-state UI
- [x] Collection grid page — filterable (by rarity) + sortable (recent / title / score / rarity) view of all collected cards
- [x] Shelf page v1 — header with stats, three collapsible sections (Currently Watching, Plan to Watch, Watched), horizontal card rows, per-card move menu + episode stepper (auto-moves to Watched when final episode hit), empty states
- [x] Shelf visual redesign: manga-spine UI, per-category scenes (Watching hero / Plan indigo / Watched archive), washi tab navigator, Cinzel + Noto Serif JP typography
- [x] Favorites Reveal: fusuma sliding-door animation with moonlit gallery (秘 seal trigger, GSAP three-phase animation, starfield, moonlight pool, 秘蔵 watermark, full-viewport gallery, Escape + seal close)
- [x] Drag-and-drop between shelf sections: @dnd-kit integration with draggable spines, droppable tabs + 秘 seal, drag overlay, scene desaturation, badge pop animations, full keyboard + screen reader accessibility, DoorMirrorContext to prevent duplicate draggable IDs from fusuma doors
- [x] Card detail page (`/card/[mal_id]`): showcase-first page with AnimeCard on rarity-themed stage (ambient glow, pedestal, hue-rotate for Legendary), GSAP entrance animation, stats bar (score/episodes/year/studio), genre pills, episode tracker with progress bar, category pills, synopsis — lazy Jikan fetch with skeleton placeholders, navigation from collection grid (Link) and shelf spines (cover click)

## What's Next (in order)

1. **Polish** — landing page design, responsive design, loading states, transitions

## Resume Notes

- Card detail page completed across 6 tasks using subagent-driven-development.
- Design spec: `docs/superpowers/specs/2026-04-19-card-detail-design.md`
- Implementation plan: `docs/superpowers/plans/2026-04-19-card-detail.md`
- New Jikan function: `getAnimeById(mal_id)` in `src/lib/jikan.ts`
- Navigation: collection grid cards wrapped in `<Link>`, shelf spine covers have `onClick` → `router.push`

## Project Structure

```
src/
├── app/
│   ├── browse/page.tsx         — live Jikan search + collect action
│   ├── card/[mal_id]/
│   │   ├── page.tsx            — card detail page (hero stage + info sections)
│   │   └── card-detail.css     — rarity stage glow, pedestal, skeleton styles
│   ├── collection/page.tsx     — filterable / sortable grid of all collected cards (links to /card/[mal_id])
│   ├── login/page.tsx          — auth form
│   ├── shelf/
│   │   ├── page.tsx            — header/stats + washi tabs driving per-category scenes
│   │   └── shelf.css           — visual-language tokens + per-tone scene backdrops
│   ├── signup/page.tsx         — auth form
│   ├── globals.css             — dark theme base + toast animation
│   ├── layout.tsx              — AuthProvider + Navbar wrapper
│   └── page.tsx                — landing page
├── components/
│   ├── card/
│   │   ├── anime-card.tsx      — main card component (full + compact)
│   │   └── card.css            — rarity effects, flip, shine, holo
│   ├── shelf/
│   │   ├── favorites-reveal.tsx — fusuma door wrapper with GSAP open/close animation
│   │   ├── favorites-scene.tsx  — moonlit gallery (stars, moonlight pool, header, spines, empty state)
│   │   ├── manga-spine.tsx     — manga-volume spine (base + hero mode, draggable via @dnd-kit)
│   │   ├── scene-backdrop.tsx  — per-tone decorative backdrop (lantern / shoji / archival)
│   │   ├── scene-tabs.tsx      — washi tab navigator with kanji subtitles + hanko count badges + droppable tabs
│   │   └── scene.tsx           — active-scene container with GSAP cross-fade + empty states
│   ├── auth-form.tsx           — login/signup form
│   ├── auth-provider.tsx       — initializes auth + loads collection on sign-in
│   └── navbar.tsx              — top nav (hidden when logged out)
├── lib/
│   ├── jikan.ts                — Jikan API v4 client (search, top anime, getAnimeById)
│   ├── supabase.ts             — browser Supabase client
│   ├── supabase/
│   │   ├── client.ts           — SSR browser client (@supabase/ssr)
│   │   ├── server.ts           — SSR server client
│   │   └── middleware.ts       — session refresh for proxy
│   └── types.ts                — TypeScript types + getRarityTier()
├── stores/
│   ├── auth-store.ts           — Zustand auth state (user, signIn, signUp, signOut)
│   └── collection-store.ts     — Zustand collection state (load/collect/update/remove)
└── proxy.ts                    — Next.js 16 proxy (replaces middleware.ts)
```

## Key Decisions Made

| Decision | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database + Auth | Supabase (PostgreSQL + built-in auth + SSR session refresh) |
| Anime Data Source | Jikan API v4 (free, no key) |
| Animations | GSAP (GreenSock) — 3D tilt, flip, shine effects |
| Styling | Tailwind CSS 4 |
| Client State | Zustand |
| Card rarity | Based on Jikan score (Common through Legendary) |
| Favorites | Hidden shelf revealed by fusuma sliding-door animation with moonlit gallery |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/utilities — PointerSensor (250ms delay) + KeyboardSensor |
| UI Quality | Professional/creative — no generic AI aesthetic |

## Notes

- Next.js 16 renamed `middleware.ts` → `proxy.ts` with `export function proxy` (not `middleware`)
- Jikan API has ~3 req/sec rate limit — browse page uses 500ms debounce
- Two Supabase client patterns exist: simple (`lib/supabase.ts`) for client components, SSR (`lib/supabase/`) for server components and proxy
- `.env.local` contains Supabase credentials (gitignored via `.env*` pattern)
- Full design spec is in `2026-04-13-anime-collector-shelf-design.md`
- Shelf redesign spec/plan are `2026-04-16-shelf-visual-redesign-design.md` + `docs/superpowers/plans/2026-04-16-shelf-visual-redesign.md`
- Favorites reveal spec/plan are `2026-04-17-favorites-flip-design.md` + `docs/superpowers/plans/2026-04-17-favorites-reveal.md`
- Drag-and-drop spec/plan are `2026-04-17-shelf-drag-drop-design.md` + `docs/superpowers/plans/2026-04-17-shelf-drag-drop.md`
- Card detail spec/plan are `2026-04-19-card-detail-design.md` + `docs/superpowers/plans/2026-04-19-card-detail.md`

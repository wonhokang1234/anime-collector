# Anime Collector & Shelf — Project Status

## Current Phase: Shelf Visual Redesign — Task 1 of 10 Complete

**Last updated:** 2026-04-16

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
- [x] Shelf visual redesign: spec + implementation plan written (`2026-04-16-shelf-visual-redesign-design.md`, `2026-04-16-shelf-visual-redesign.md`)
- [x] Redesign Task 1 / 10: Cinzel + Noto Serif JP fonts loaded in `layout.tsx` (exposes `--font-cinzel`, `--font-noto-jp`)

## What's Next (in order)

1. **Shelf visual redesign — tasks 2–10** ← *in progress* (plan at `docs/superpowers/plans/2026-04-16-shelf-visual-redesign.md`)
   - T2: Rewrite `shelf.css` with visual-language tokens
   - T3: Build `MangaSpine` base component
   - T4: Add hero mode to `MangaSpine` (bookmark, pedestal, stepper)
   - T5: Build `SceneBackdrop` component
   - T6: Build `SceneTabs` component
   - T7: Build `Scene` container with cross-fade
   - T8: Rewrite `/shelf/page.tsx` with tabs + scenes
   - T9: Delete retired `shelf-section.tsx` + `shelf-card.tsx`
   - T10: Update this STATUS.md
2. **Build the hidden Favorites flip** — full-shelf 3D flip animation (GSAP) to reveal Favorites
3. **Drag-and-drop between shelf sections** (deferred from v1 — currently uses a move-to menu)
4. **Build the card detail page** (`/card/[id]`) — full card view fetching fresh Jikan data
5. **Polish** — landing page design, responsive design, loading states, transitions

## Resume Notes

- Execution mode chosen: **subagent-driven-development** (one implementer subagent per task, then spec-review + code-quality-review before moving on).
- Task 1 was completed directly (not via subagent) and committed as `480e297`.
- Next session: pick up at Task 2. Either continue dispatching subagents per task, or execute inline.

## Project Structure

```
src/
├── app/
│   ├── browse/page.tsx         — live Jikan search + collect action
│   ├── collection/page.tsx     — filterable / sortable grid of all collected cards
│   ├── login/page.tsx          — auth form
│   ├── shelf/
│   │   ├── page.tsx            — stats header + 3 collapsible sections
│   │   └── shelf.css           — horizontal-scroll styling + empty-state glow
│   ├── signup/page.tsx         — auth form
│   ├── globals.css             — dark theme base + toast animation
│   ├── layout.tsx              — AuthProvider + Navbar wrapper
│   └── page.tsx                — landing page
├── components/
│   ├── card/
│   │   ├── anime-card.tsx      — main card component (full + compact)
│   │   └── card.css            — rarity effects, flip, shine, holo
│   ├── shelf/
│   │   ├── shelf-section.tsx   — collapsible section (GSAP expand/collapse)
│   │   └── shelf-card.tsx      — compact card + episode stepper + move menu
│   ├── auth-form.tsx           — login/signup form
│   ├── auth-provider.tsx       — initializes auth + loads collection on sign-in
│   └── navbar.tsx              — top nav (hidden when logged out)
├── lib/
│   ├── jikan.ts                — Jikan API v4 client (search, top anime)
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
| Favorites | Hidden shelf revealed by full-page flip animation |
| UI Quality | Professional/creative — no generic AI aesthetic |

## Notes

- Next.js 16 renamed `middleware.ts` → `proxy.ts` with `export function proxy` (not `middleware`)
- Jikan API has ~3 req/sec rate limit — browse page uses 500ms debounce
- Two Supabase client patterns exist: simple (`lib/supabase.ts`) for client components, SSR (`lib/supabase/`) for server components and proxy
- `.env.local` contains Supabase credentials (gitignored via `.env*` pattern)
- Full design spec is in `2026-04-13-anime-collector-shelf-design.md`
- Shelf redesign spec/plan are `2026-04-16-shelf-visual-redesign-design.md` + `docs/superpowers/plans/2026-04-16-shelf-visual-redesign.md`

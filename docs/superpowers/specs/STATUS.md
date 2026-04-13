# Anime Collector & Shelf — Project Status

## Current Phase: Core UI In Progress

**Last updated:** 2026-04-13

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

## What's Next (in order)

1. **Wire up collect action** — clicking "Collect" saves anime to Supabase `collected_anime` table
2. **Build the shelf page** — collapsible sections (Currently Watching, Watched, Plan to Watch), drag-and-drop between sections, episode tracking stepper
3. **Build the hidden Favorites flip** — full-shelf 3D flip animation (GSAP) to reveal Favorites
4. **Build the collection grid page** — filterable view of all collected cards
5. **Build the card detail page** (`/card/[id]`) — full card view fetching fresh Jikan data
6. **Polish** — landing page design, empty states, responsive design, loading states, transitions

## Project Structure

```
src/
├── app/
│   ├── browse/page.tsx         — live Jikan search + card grid
│   ├── collection/page.tsx     — stub
│   ├── login/page.tsx          — auth form
│   ├── shelf/page.tsx          — stub
│   ├── signup/page.tsx         — auth form
│   ├── globals.css             — dark theme base
│   ├── layout.tsx              — AuthProvider + Navbar wrapper
│   └── page.tsx                — landing page
├── components/
│   ├── card/
│   │   ├── anime-card.tsx      — main card component (full + compact)
│   │   └── card.css            — rarity effects, flip, shine, holo
│   ├── auth-form.tsx           — login/signup form
│   ├── auth-provider.tsx       — initializes auth on mount
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
│   └── auth-store.ts           — Zustand auth state (user, signIn, signUp, signOut)
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

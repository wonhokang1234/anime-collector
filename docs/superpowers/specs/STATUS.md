# Anime Collector & Shelf — Project Status

## Current Phase: Design Complete, Ready for Implementation

**Last updated:** 2026-04-13

## What's Done

- [x] Brainstormed and finalized the project concept
- [x] Design spec written and approved (`2026-04-13-anime-collector-shelf-design.md`)
- [x] Git repo initialized with spec committed

## What's Next (in order)

1. **Set up Supabase project** — create account, new project, get API keys (requires internet)
2. **Scaffold Next.js project** — `npx create-next-app` with TypeScript + Tailwind
3. **Install dependencies** — GSAP, Supabase client (`@supabase/supabase-js`), Zustand
4. **Set up Supabase schema** — create tables (`profiles`, `collected_anime`, `collected_characters`), enable RLS
5. **Implement auth** — login/signup pages wired to Supabase auth
6. **Build the card component** — rarity tiers, flip animation (GSAP), parallax hover
7. **Build the browse page** — Jikan API search, display results as cards, collect action
8. **Build the shelf page** — collapsible sections, drag-and-drop, episode tracking
9. **Build the hidden Favorites flip** — full-shelf 3D flip animation (GSAP)
10. **Build the collection grid page** — filterable view of all collected cards
11. **Polish** — landing page, empty states, responsive design, loading states

## Key Decisions Made

| Decision | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript |
| Database + Auth | Supabase (PostgreSQL + built-in auth) |
| Anime Data Source | Jikan API v4 (free, no key) |
| Animations | GSAP (GreenSock) — switched from Framer Motion |
| Styling | Tailwind CSS |
| Card rarity | Based on Jikan score (Common through Legendary) |
| Favorites | Hidden shelf revealed by full-page flip animation |
| Social features | None — personal experience only |
| User rating | Personal 1-10 rating field included |

## Notes

- User has frontend experience but is new to Supabase and needs help with setup
- GSAP chosen over Framer Motion for richer animation capabilities
- Internet connection needed for: Supabase project creation, npm installs, Jikan API testing
- Full design spec is in `2026-04-13-anime-collector-shelf-design.md` in this same directory

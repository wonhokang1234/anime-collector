# Regression Review — Moss Garden (main..moss-garden)

Range: `4842618..3238b67` (26 commits). Reviewed on branch `moss-garden` (working tree clean, matches head).

## Summary

The branch replaces Karuta's presentation layer with the Moss Garden 3D experience: a Three.js overworld at `/garden` (authenticated home), four interior views (grove/pond/seeds/records), a release ceremony, themed transitions, Jikan enrichment + cover-accent caches, and moss-token restyles of browse/card/auth pages. Legacy `/collection` and `/shelf` redirect into garden views.

Data-layer integrity is clean: only the sanctioned `updateRating` addition to the collection store and `title_japanese` on the Jikan type; auth store, toast store, supabase clients, and middleware are byte-identical to main. All mutation flows route through the existing store functions. Build, typecheck pass; lint matches the 2-problem baseline; all routes return 200 signed-out.

One high-severity navigation regression blocks approval: **the garden is a dead end** — the navbar is hidden on `/garden` and nothing inside the garden links to `/browse`, `/card`, or sign-out. Since `/garden` is now the authenticated home, a returning signed-in user lands there with no in-app path to gather new titles or sign out. Additionally, the overworld pond koi render black due to a hex-vs-hsl color parse bug.

## Changed Files

| File                                                                                                  | Purpose                                                                                                                   |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/stores/collection-store.ts`                                                                      | + `updateRating` (optimistic, revert + error toast) — sanctioned                                                          |
| `src/lib/jikan.ts`                                                                                    | + `title_japanese?` field — sanctioned; formatting only otherwise                                                         |
| `src/lib/scatter.ts`                                                                                  | exports `mulberry32` (reused by colors.ts); `getScatterTransform` consumer unaffected                                     |
| `src/stores/garden-store.ts`                                                                          | new view/transit/ritual/mood/qt state, travel timers, `abortTransit`                                                      |
| `src/stores/garden-meta-store.ts`                                                                     | new Jikan enrichment cache (localStorage, 400 ms pump)                                                                    |
| `src/lib/garden/{adapter,colors,types,garden3d}.ts`                                                   | new data adapter, accent extraction, 3D engine port                                                                       |
| `src/components/garden/*` (11 files)                                                                  | new experience shell, HUD, quick travel, interiors, ceremony, overlay                                                     |
| `src/app/garden/page.tsx`                                                                             | new route; auth-gated, `dynamic(ssr:false)` engine load                                                                   |
| `src/app/collection/page.tsx`, `src/app/shelf/page.tsx`                                               | reduced to redirects → `/garden?view=pond` / `?view=grove`                                                                |
| `src/app/page.tsx`                                                                                    | signed-in `/` → `/garden`; render gated on auth resolution                                                                |
| `src/app/{browse,login,signup}/page.tsx`, `card/[mal_id]/page.tsx`, `auth-form.tsx`, `anime-card.tsx` | moss-token restyles; logic preserved; card gains "See it in the garden" link                                              |
| `src/components/navbar.tsx`                                                                           | links now Browse + Garden; hidden on `/garden`; focus trap/inert/Esc preserved                                            |
| `src/app/layout.tsx`                                                                                  | + Zen Old Mincho, Zen Kaku Gothic New, DotGothic16 fonts                                                                  |
| `src/app/globals.css`                                                                                 | + `.moss` scoped tokens (midnight/dawn), mg-* keyframes/classes; − search-underline                                       |
| deleted                                                                                               | `shelf.css`, 6 shelf components, `section-header.tsx` — no remaining importers (grep incl. string/dynamic imports: clean) |
| `package.json`                                                                                        | + `three@^0.185.1`, `@types/three`                                                                                        |

## Functionality Regression Risks

**[HIGH] R1 — No exit from `/garden` (navigation dead end).**
`src/components/navbar.tsx:73` hides the navbar on `/garden`; `world-hud.tsx`, `quick-travel.tsx`, and `interior-shell.tsx` contain no link to `/browse`, no sign-out, and no `<Link>`/router usage at all (verified by grep). Because signed-in `/` redirects to `/garden` (`src/app/page.tsx:23`), a returning user's home screen has no in-app path to: gather new titles (`/browse`), open card detail pages, or sign out. The seed-store empty state even instructs "bring something back" with no way to do so. Cross-task gap: Task 11 (garden = home, navbar hidden) × Task 12 ("browse remains") never built the bridge. Fix: add a Browse/gather affordance (e.g., a quick-travel row or HUD link) and a sign-out, or show a minimal navbar on `/garden`.

**[MEDIUM] R2 — Unknown-episode titles are mis-capped in the grove.**
`collect()` stores `total_episodes ?? 0`; `adapter.ts:33` does `eps: Math.max(1, item.total_episodes)`, so airing/unknown shows get `eps = 1`. Grove watering caps at episode 1 (`grove-view.tsx:270`) and immediately shows "Release to the pond", while `/card` (`stepEpisode`, `total > 0 ? min : uncapped`) still allows unlimited increments. The old primary tracking surface never capped these. Consequence: for any show Jikan reports `episodes: null`, the grove pushes a one-water instant release.

**[VERIFIED OK] Mutation paths** — traced end-to-end:

- browse gather → `collect` (guards, toasts, `isCollected` unchanged) ✓
- seeds plant → `updateCategory("watching")` + travel to grove ✓
- grove water/unwater → `updateEpisode` (clamped ≥0, ≤eps) ✓
- ceremony confirm → `updateCategory("watched")` + `updateRating(3)` when unrated + travel to pond with koi panel; double-click guard; orphan-ritual guard; Esc closes ✓
- pond bloom rating → `updateRating` toggle with 300 ms double-tap guard ✓
- `/card` retains category pills (incl. favorite "秘"), remove w/ confirm, auto-watched — matches the accepted-gaps list ✓
- Optimistic revert paths in the store are intact for all mutations ✓

**[VERIFIED OK] Route matrix** (prod server, signed-out): `/`, `/login`, `/signup`, `/browse`, `/garden`, `/shelf`, `/collection`, `/card/1` all 200. Signed-out `/garden` and `/card` gate → `/login`; `/collection` → `/garden?view=pond`; `/shelf` → `/garden?view=grove`; garden deep-link `?view=` is honored (`garden-experience.tsx:74–79`). Old drag-to-recategorize on shelf is fully covered by `/card` pills + seeds/ceremony (old drag only did category moves, no reorder — verified against main's `handleDragEnd`).

**[MEDIUM] R3 — Landing page no longer server-renders.**
`src/app/page.tsx:86` returns `null` while `loading || user`; the prerendered `/` HTML now contains no hero content (confirmed via curl against the prod build — zero matches for the headline). On main, the landing rendered during auth resolution. Impact: blank first paint until hydration + `getSession()` resolve, no-JS/SEO content loss. `getSession()` is local so the delay is small, but the SSR content is gone.

**[LOW] R4 — Error toasts hidden under transition overlays.**
Toasts are `z-50` (`toast.tsx:149`); the transit overlay is `zIndex: 200` and covers the screen for ~2.25 s. Store-error toasts fired by plant→grove or release→pond (toast lifetime 2.8 s, `toast-store.ts:29`) are covered for most of their life. Optimistic reverts still keep state truthful. Fix: raise toast container above 200.

**[LOW] R5 — Garden view persists across client navigations.** `garden-store` is module-level; leaving `/garden` from an interior and returning via the navbar "Garden" link resumes inside that interior, not the overworld. Not a break, but a behavior surprise.

**[LOW] R6 — Failed Jikan enrichments never retry within a session.** `garden-meta-store.ensure` drops a mal_id whose fetch returned null (404/429) and only re-queues when `items` changes. Degrades gracefully (kanji falls back to title, genre "—").

## Business Logic Risks

- **Ceremony auto-rating**: releasing an unrated title silently writes `rating = 3` (`release-ceremony.tsx:52`). Sanctioned by the plan ("default bloom 3 when unrated"), but it is a new unattended DB write the old app never made — worth keeping on the record.
- Hours calc (`progress × 24 min`), rarity tiers, category mapping (`favorite` → completed golden koi) are presentation-side derivations only; no store/business logic edits beyond the sanctioned `updateRating`.
- Auth store, toast store, supabase clients, middleware: **unchanged** (verified via `git diff --stat` — zero hits).

## UI / UX Issues

- **[MEDIUM] U1 — Overworld koi render black.** `garden3d.ts:1480,1485` does `parseInt(k.c1.slice(1), 16)` assuming `#rrggbb`, but accents are always `hsl(…)` strings (`colors.ts` — both `sampleCover` and `hashAccent`). `parseInt` → NaN → `THREE.Color` black. `koi.tsx:24` explicitly notes the hsl migration; the 3D port missed it. Every real koi in the overworld pond loses its cover-derived color — the design's "live data reflection" is visually broken there. Fix: pass a converted hex, or `new THREE.Color()` + `setStyle` with comma-form hsl.
- Mobile overworld has no touch movement (acknowledged in the HUD hint; quick travel covers all destinations) — accepted design, noted.
- `data-mood` hydration mismatch: `readMood()` runs at store creation; SSR HTML is always `midnight`, so dawn users get a React hydration attribute mismatch on `/browse`, `/card`, `/login`, `/signup` (console error, brief theme flash). Low.
- Interior empty states, browse loading/error/empty states (skeleton grid, EmptyState with retry), and `/card` skeletons are all preserved or equivalently replaced. ✓

## Accessibility Issues

- **[MEDIUM] A1 — Release ceremony dialog has no focus management.** `role="dialog" aria-modal="true"` but no initial focus move and no trap; the triggering grove button unmounts, dropping keyboard focus to `<body>` behind an aria-modal overlay. Esc works. Buttons are real `<button>`s.
- **[MEDIUM] A2 — Arrow keys are swallowed across all of `/garden`.** The engine's window keydown (`garden3d.ts:233–235`) `preventDefault`s arrow keys for the life of the page, including scrollable interiors — keyboard users cannot arrow-scroll the grove/seeds/pond lists. `+`/`-` zoom also stays live while paused. Scope the handler to `view === "world"` / unpaused.
- Navbar drawer parity confirmed: focus trap, `inert`, Esc, close-button focus — identical to main. ✓
- Pond koi, bloom ratings, quick-travel rows: `role="button"`, `tabIndex=0`, Enter/Space handlers, sensible `aria-label`s/`aria-pressed` ✓. Quick-travel is a div-button (works, but native buttons would be cleaner).
- **[LOW] A3 — Reduced motion is honored by CSS overlays and compressed transit timers (good), but the 3D canvas itself (petal fall, koi swim, camera bob) ignores `prefers-reduced-motion`.**
- Transition overlay is `aria-hidden` decorative with no live region — acceptable per its documented simple option; destination announces via heading.

## Performance Issues

- **[MEDIUM] P1 — The 3D scene renders full-rate while hidden.** `_tick` (`garden3d.ts:1283–1414`) skips only input/movement when paused; petals, koi orbits, lantern flicker, and `renderer.render` run every frame behind the opaque interior/ceremony overlays for however long the user stays inside. Skip the render (or throttle) when paused.
- Engine lifecycle is otherwise solid: idempotent `dispose()` (raf + watchdog cleared, listeners removed, `forceContextLoss`, DOM removed, renderer nulled), mount-once effect, `abortTransit` on unmount, geometry disposed on `updateData` rebuilds. Per-koi materials leak per rebuild (acknowledged in-code, small). ✓
- `three` is loaded only via `dynamic(ssr:false)` on `/garden` — no bundle impact on other routes. ✓
- localStorage caches (`karuta-garden-meta-v1`, `karuta-garden-colors-v2`) are bounded by collection size, guarded try/catch. ✓
- Jikan pacing: 400 ms pump (2.5 rps) is fine alone; can briefly stack with `/browse`/`/card` fetches — worst case a dropped enrichment (see R6). Low.
- Accent sampling reuses the Next image optimizer at w=64 (allowed size, allowed remote host) — no CORS taint. ✓

## Dependency Issues

- Added: `three` + `@types/three` — sanctioned, versions aligned, dynamically loaded.
- **[LOW] D1 — `@dnd-kit/core` and `@dnd-kit/utilities` are now unused** (their only consumers were the deleted shelf components). Remove.
- **[LOW] D2 — `DotGothic16` font is loaded in `layout.tsx` but `--font-dot` is never consumed** anywhere. Dead font payload on every page.
- No duplicate animation libraries (GSAP retained for existing pages; garden uses CSS keyframes).

## Code Maintainability Issues

- Heavy inline-style objects across the garden components (matches the ported reference; acceptable for this scope but hard to theme later).
- Dead CSS after the sweep: `.hanko-dot`, `.washi-surface` (and their washi-era companions) are defined but unreferenced.
- `@theme inline` self-referential font aliases are correctly documented as layer-order dependent (`globals.css:135–137`) — fragile but intentional.
- `travel()` timer choreography (800/1550/2250 ms) is duplicated as magic numbers between store and CSS keyframe durations — a single constants source would be safer.

## Required Fixes

1. **R1** — Provide an in-garden path to `/browse` (gather) and sign-out (quick-travel row, HUD link, or minimal navbar on `/garden`).
2. **U1** — Fix the overworld koi color parse (`garden3d.ts:1480,1485`) to handle `hsl(…)` accents.

## Optional Polish Suggestions

- R2: treat `total_episodes = 0` as unknown in the adapter (uncapped watering, no instant release) to match `/card`.
- R3: render the signed-out landing during auth resolution (or a static shell) to restore SSR content.
- R4: raise toast z-index above the transit overlay (≥ 210).
- A1/A2: ceremony initial focus + trap; scope engine arrow-key preventDefault to the world view.
- P1: skip `renderer.render` while paused.
- D1/D2: drop `@dnd-kit/*` and DotGothic16.
- Prune dead washi-era CSS; consider resetting garden view to `world` on remount.

## Commands Run

| Command                                                                                       | Result                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `git diff --stat main..moss-garden`                                                           | 45 files, +7046 / −3553                                                                                                 |
| `git diff main..moss-garden -- <stores/lib/pages>`                                            | reviewed in full for all non-garden files                                                                               |
| `npx tsc --noEmit`                                                                            | clean                                                                                                                   |
| `npm run lint`                                                                                | 2 errors — exactly the pre-existing baseline (`card/[mal_id]/page.tsx:80` set-state-in-effect, `use-media-query.ts:10`) |
| `npm run build`                                                                               | ✓ compiled, 11/11 pages generated; all routes present                                                                   |
| `npm test`                                                                                    | no test script defined (`dev/build/start/lint` only)                                                                    |
| `npm run start` + curl all 8 routes                                                           | all 200; garden/`card` client-gate signed-out; `/` prerender confirmed content-empty (R3)                               |
| grep sweep for deleted modules (`section-header`, `shelf/*`, `shelf.css`, `search-underline`) | zero remaining references, incl. dynamic/string imports                                                                 |

## Approval Status

**Needs changes** — two fixes before approval: R1 (garden navigation dead end: no in-app path to Browse/sign-out from the authenticated home) and U1 (overworld koi color parse bug). Everything else is note-level; data layer, mutation flows, route matrix, loading/error states, and the dead-code sweep all check out.

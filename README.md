# Karuta — anime card collector & moss garden

Collect anime as stylized cards (data from the Jikan API), then tend them in
a 3D moss garden. Next.js 16 + Supabase + Three.js + GSAP + Zustand.

## Getting started

### 1. Supabase (one-time)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/setup.sql`](supabase/setup.sql), and run it. This creates the
   `profiles`, `collected_anime`, and `collected_characters` tables, row-level
   security policies, and the auto-profile trigger.
3. (Optional, for local dev convenience) **Authentication → Providers →
   Email**: disable "Confirm email" so sign-ups work without an SMTP setup.

### 2. Environment

Create `.env.local` in the repo root (values from **Project Settings → API**):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-anon-public-key
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and collect
something on **Browse** — the garden grows from your collection. The Jikan
API needs no key (rate-limited ~3 req/s; the browse search debounces).

## Checks

```bash
npx tsc --noEmit   # typecheck
npm run lint       # eslint
npm run build      # production build (downloads Google Fonts on first run)
```

## Docs

- `docs/garden-art-direction.md` — the Moonlit Jade color direction
- `docs/garden-assets-integration.md` — generated art assets & how they wire in
- `docs/superpowers/specs/` — feature design specs

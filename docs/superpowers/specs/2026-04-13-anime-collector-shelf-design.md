# Anime Collector & Shelf — Design Spec

## Overview

A personal anime tracking web app where users collect anime as stylized cards with rarity effects and organize them on an interactive shelf. The core experience combines collectible card interactions (flip animations, parallax hover, rarity borders) with a shelf-based library system for tracking watch progress.

No social features. This is a personal, single-user experience focused on UI/UX delight.

## Tech Stack


| Layer           | Technology                            |
| --------------- | ------------------------------------- |
| Framework       | Next.js 14+ (App Router)              |
| Language        | TypeScript                            |
| Auth + Database | Supabase (PostgreSQL + built-in auth) |
| Anime Data      | Jikan API v4 (free, no key required)  |
| Animations      | GSAP (GreenSock)                      |
| Styling         | Tailwind CSS                          |
| Client State    | Zustand or React Context              |


## Pages & Routes


| Route               | Purpose                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `/`                 | Landing page — hero section with login/signup CTA                               |
| `/login`, `/signup` | Auth pages (email/password + OAuth via Supabase)                                |
| `/browse`           | Search & discover anime via Jikan API, preview cards                            |
| `/collection`       | User's collected cards — filterable grid view                                   |
| `/shelf`            | Organized shelf — Currently Watching, Watched, Plan to Watch + hidden Favorites |
| `/card/[id]`        | Full card detail view with flip animation                                       |


## Card System

### Card Anatomy

- **Front face:** anime cover image, title, episode count, rarity border/effect
- **Back face:** synopsis, score, genres, studio, air dates, top characters list

### Rarity Tiers

Based on Jikan's `score` field:


| Tier      | Score Range | Visual Effect                                  |
| --------- | ----------- | ---------------------------------------------- |
| Common    | 0 - 5.9     | Simple white/gray border                       |
| Uncommon  | 6.0 - 6.9   | Green gradient border                          |
| Rare      | 7.0 - 7.9   | Blue glow border                               |
| Epic      | 8.0 - 8.9   | Gold animated border                           |
| Legendary | 9.0+        | Holographic shimmer effect (animated gradient) |


### Card Interactions

- **Hover:** subtle tilt/parallax effect (like holding a real card)
- **Click:** flip animation reveals the back face (GSAP 3D Y-axis transform)
- **Long press or button:** "Collect" the card, adds it to collection and shelf
- **Character cards:** same system for individual characters, linked to their anime

### Card Sizes

- **Compact:** used in shelf/grid views — image + title + rarity border only
- **Full:** used in `/card/[id]` or modal — full flip interaction with all details

## Shelf System

### Layout

A vertical stack of collapsible sections:


| Section            | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| Currently Watching | Active shows with episode progress indicator (X of Y) |
| Watched            | Completed anime                                       |
| Plan to Watch      | Backlog                                               |
| Favorites          | **Hidden** — revealed by flipping the entire shelf    |


### Section Interactions

- **Expand/collapse:** click section header to toggle, smooth animation
- **Cards inside sections:** compact cards in a horizontal scrollable row
- **Drag and drop:** move cards between sections
- **Click a card:** opens full card view with flip animation
- **Episode tracking:** stepper in "Currently Watching" to increment current episode
- **Sort options:** within each section — sort by title, score, date added, rarity
- **Empty states:** friendly prompt with link to `/browse`

### Shelf Header

Displays stats: total collected, currently watching count, watched count.

### Hidden Favorites Shelf

The Favorites section is not visible on the regular shelf. Instead:

1. A special button is centered at the top of the shelf (thematic icon — star, keyhole, or glowing emblem)
2. Clicking it triggers a **full-page 3D flip animation** (Y-axis rotation of the entire shelf panel)
3. The back side reveals the Favorites collection with a distinct visual style (darker theme, gold accents)
4. Clicking the button again flips back to the regular shelf

This is the signature interaction of the app.

## Database Schema (Supabase / PostgreSQL)

### `profiles`

Extends Supabase `auth.users`:


| Column     | Type          | Notes                 |
| ---------- | ------------- | --------------------- |
| id         | uuid (PK)     | matches auth.users.id |
| username   | text (unique) | display name          |
| avatar_url | text          | profile picture URL   |
| created_at | timestamp     | auto-generated        |


### `collected_anime`


| Column          | Type                     | Notes                                              |
| --------------- | ------------------------ | -------------------------------------------------- |
| id              | uuid (PK)                | auto-generated                                     |
| user_id         | uuid (FK -> profiles.id) | owner                                              |
| mal_id          | integer                  | Jikan/MAL anime ID                                 |
| title           | text                     | cached from Jikan                                  |
| image_url       | text                     | cached cover image                                 |
| score           | float                    | cached Jikan score (determines rarity tier)        |
| rating          | integer (nullable)       | user's personal rating (1-10)                      |
| category        | enum                     | `watching`, `watched`, `plan_to_watch`, `favorite` |
| current_episode | integer                  | episode progress tracking                          |
| total_episodes  | integer                  | cached from Jikan                                  |
| sort_order      | integer                  | custom ordering within sections                    |
| created_at      | timestamp                | auto-generated                                     |


### `collected_characters`


| Column       | Type                     | Notes                 |
| ------------ | ------------------------ | --------------------- |
| id           | uuid (PK)                | auto-generated        |
| user_id      | uuid (FK -> profiles.id) | owner                 |
| mal_id       | integer                  | Jikan character ID    |
| name         | text                     | cached                |
| image_url    | text                     | cached                |
| anime_mal_id | integer                  | linked anime's MAL ID |
| created_at   | timestamp                | auto-generated        |


### Security

All tables use Supabase Row Level Security (RLS). Users can only read and write their own rows.

### Caching Strategy

Key fields (title, image_url, score, total_episodes) are cached in Supabase at collection time so the shelf loads without hitting Jikan. Full card detail views fetch fresh data from Jikan on demand.

## Expandability

The schema supports future features without restructuring:

- Custom tags/labels (new `anime_tags` table)
- Personal notes/reviews (new `anime_notes` table)
- Watch history timeline (new `watch_log` table)
- Card customizations/skins (new `card_customizations` table)
- Achievements (new `achievements` + `user_achievements` tables)
- Social features if ever desired (new `friendships` table)

## Data Flow

1. User searches anime on `/browse` -> Jikan API returns results
2. User "collects" an anime -> card saved to `collected_anime` in Supabase
3. User organizes on `/shelf` -> updates `category` and `sort_order`
4. Cards render with rarity effects based on cached `score`
5. Full card detail fetches fresh data from Jikan
6. Hidden Favorites shelf flips to reveal cards with `category = 'favorite'`


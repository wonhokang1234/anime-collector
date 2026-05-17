# Karuta — New Visual Direction

**Document status:** Authoritative design spec. Replaces all prior dark-mode direction. Implementation agents follow this document exactly.
**Supersedes:** All dark-mode tokens, CSS custom properties, and visual patterns in the existing `globals.css`, `shelf.css`, `card.css`, and `card-detail.css`.
**Stack constraint:** Next.js 16, TypeScript, Tailwind CSS 4, GSAP 3. No new npm dependencies.

---

## 1. Design Philosophy

Karuta should feel like a premium collector's publication that happens to run in a browser — closer to a JAGDA design annual or Christie's auction catalog than to any anime tracking app. The product earns its premium feel through restraint: warm cream paper, one red accent used as punctuation, a classical serif in tension with a rational sans-serif, and elevation-based hover states rather than color changes. Every decision signals curation and intentionality.

The core emotional target is the feeling of opening a beautifully produced catalog for the first time — the weight of good paper, the clarity of strong typography, the sense that someone thought carefully about every object on the page. The anime art is the artifact; the interface is the white gloves that hold it.

Karuta is aggressively light. Every other anime app (Crunchyroll, MAL, AniList) defaults to dark. This is not incidental — it is the brand position. Light backgrounds, warm cream, ink typography, and one bold accent color are immediate visual differentiation signals. A user landing on Karuta for the first time should recognize within two seconds that this is not a standard anime app.

Motion is almost invisible. It should be felt but not consciously noticed. Every animation either confirms a meaningful action or reduces perceived load time — nothing else. Nothing blocks interaction. Nothing exceeds 300ms.

---

## 2. Product Personality

- Editorial
- Restrained
- Elegant
- Curatorial
- Precise

---

## 3. Visual Concept

**Premium collector's catalog — warm paper, ink type, one red seal.**

Direct references:

- Christie's auction catalog: item-first grid, strong serif hierarchy, neutral white/cream field, nothing competes with the lot imagery
- JAGDA Design Annual: editorial structure, large typographic anchors, whitespace as a primary layout element
- Phillips Design section: typographic section numbers and labels treated as layout objects, not decorative elements
- MoMA Design Store: curated selection framing, tight column grid, typography handling all hierarchy without decorative color

The result resembles none of these directly. It is unmistakably a web app for anime — the card art, rarity tiers, and hanko red accent are culturally specific — but the editorial structure lifts it above the category entirely.

---

## 4. Color System

### 4.1 Foundation Palette

Raw hex values. Never use these directly in components — reference semantic tokens from Section 4.2.

```
cream-50:   #F7F3EE   — page background, the primary field
cream-100:  #F0EBE3   — deeper cream for panel surfaces, alternating rows
cream-200:  #E8E3DC   — skeleton loading base
cream-300:  #E4DDD6   — borders and dividers
cream-400:  #D6D0CA   — strong borders, rarity dot unfilled state

ink-900:    #1A1614   — primary text (warm near-black, never cold)
ink-700:    #6B6560   — secondary text, metadata, captions
ink-500:    #A8A29E   — muted text, placeholders, helper text
ink-300:    #C8C2BC   — disabled text

white:      #FFFFFF   — card surfaces, modal surfaces

hanko:      #C41E3A   — primary accent (used sparingly)
hanko-dark: #A01830   — accent hover and pressed state
hanko-tint: rgba(196, 30, 58, 0.06)    — barely-visible red tint for selected backgrounds
hanko-tint-md: rgba(196, 30, 58, 0.12) — stronger tint for active filter pills

shadow-sm:  rgba(26, 22, 20, 0.08)   — resting card shadow
shadow-md:  rgba(26, 22, 20, 0.14)   — hover card shadow
shadow-lg:  rgba(26, 22, 20, 0.20)   — modal and drawer shadow

status-ok:       #2D7A4F   — success (warm green, not garish)
status-ok-bg:    rgba(45, 122, 79, 0.08)
status-warn:     #A0612A   — warning (warm amber)
status-warn-bg:  rgba(160, 97, 42, 0.08)
status-err:      #C41E3A   — error (re-uses hanko — red carries semantic weight here)
status-err-bg:   rgba(196, 30, 58, 0.08)
```

### 4.2 Semantic Tokens

These are the CSS custom properties that go into `globals.css `:root`. Components reference only these tokens — never foundation values directly.

```css
/* Surfaces */
--bg-page: #f7f3ee; /* Warm cream — every page background */
--bg-card: #ffffff; /* White card on cream — separation without border noise */
--bg-raised: #ffffff; /* Modals, drawers, popovers */
--bg-panel: #f0ebe3; /* Section panels, alternating table rows */
--bg-overlay: rgba(247, 243, 238, 0.85); /* Modal backdrop — light, not dark */

/* Text */
--text-primary: #1a1614; /* Headings and body */
--text-secondary: #6b6560; /* Metadata, captions, studio names */
--text-muted: #a8a29e; /* Placeholders, helper text, disabled labels */
--text-disabled: #c8c2bc; /* Disabled input text */
--text-on-accent: #ffffff; /* Text on hanko red fill */

/* Accent */
--accent: #c41e3a; /* Hanko red — primary actions, active states, rarity dots */
--accent-hover: #a01830; /* Hover and pressed */
--accent-tint: rgba(196, 30, 58, 0.06);
--accent-tint-md: rgba(196, 30, 58, 0.12);

/* Borders */
--border-subtle: #e8e3dc; /* Lightest — dividers within panels */
--border-default: #e4ddd6; /* Standard card borders, input borders */
--border-strong: #d6d0ca; /* Rarity dot empty state, focused input accent */

/* Shadows */
--shadow-card: 0 2px 8px rgba(26, 22, 20, 0.08);
--shadow-hover: 0 6px 16px rgba(26, 22, 20, 0.14);
--shadow-modal: 0 12px 32px rgba(26, 22, 20, 0.2);

/* Skeleton */
--skeleton-base: #e8e3dc; /* Always warm — never cold gray */
--skeleton-shine: #f0ebe3; /* Slightly lighter for shimmer sweep */

/* Status */
--status-success: #2d7a4f;
--status-success-bg: rgba(45, 122, 79, 0.08);
--status-warning: #a0612a;
--status-warning-bg: rgba(160, 97, 42, 0.08);
--status-error: #c41e3a;
--status-error-bg: rgba(196, 30, 58, 0.08);

/* Navbar height — load-bearing constant referenced by FavoritesReveal */
--navbar-height: 3.5rem;
```

### 4.3 Rarity Tier Colors

These work on cream (`#F7F3EE`) and white (`#FFFFFF`) surfaces. Old dark-mode rarity glows (neon blues, purples, gold glows on dark) are entirely removed.

The new rarity system uses three visual elements per tier:

1. A horizontal dot cluster on cards (filled = `--accent`, empty = `--border-strong`)
2. A subtle tier label in Inter small-caps
3. A 3px solid left-border accent on the card in the tier color

```
common:
  --rarity-common-border: #C8C2BC
  --rarity-common-text:   #A8A29E
  dots: 1 filled / 4 empty

uncommon:
  --rarity-uncommon-border: #8FA88F
  --rarity-uncommon-text:   #5C8C5C
  dots: 2 filled / 3 empty

rare:
  --rarity-rare-border: #7A9FC0
  --rarity-rare-text:   #4A7FA0
  dots: 3 filled / 2 empty

ultra-rare:
  --rarity-ultrarare-border: #C4A84A
  --rarity-ultrarare-text:   #8A7030
  dots: 4 filled / 1 empty

legendary:
  --rarity-legendary-border: #C41E3A
  --rarity-legendary-text:   #C41E3A
  dots: 5 filled / 0 empty — converges with accent system
```

All old `--rarity-*-glow`, `--rarity-legendary-holo`, and animated glow keyframes are deleted.

### 4.4 Toast / Status Colors

Toasts use white card surfaces with a 3px left accent bar — no colored backgrounds.

```
success: white bg + 3px left bar at --status-success (#2D7A4F)
warning: white bg + 3px left bar at --status-warning (#A0612A)
error:   white bg + 3px left bar at --status-error (#C41E3A)
info:    white bg + 3px left bar at --text-secondary (#6B6560)
```

---

## 5. Typography System

### 5.1 Font Families

**Display: Cormorant Garamond**
Load via `next/font/google`. Weights: 300 (Light), 300 Italic, 500 (Medium), 500 Italic.
Replaces `--font-display` (currently mapped to Geist Sans in `@theme inline`).

```css
--font-display: var(--font-cormorant);
```

**UI / Body: Inter**
Load via `next/font/google`. Weights: 400, 500, 600.
Replaces `--font-sans` (currently Geist Sans).

```css
--font-sans: var(--font-inter);
```

**Mono: Geist Mono** — keep. Used only for scores, episode counters, years, tabular numbers.

```css
--font-mono: var(--font-geist-mono);
```

**Remove from `layout.tsx`:**

- Cinzel (loaded but never properly used)
- Noto Serif JP (kanji empty-state characters use system CJK fallback — no dedicated load needed)
- Geist Sans (replaced by Inter)

**Remove from `<html>`:** the `dark` class. This is a light-mode application.

### 5.2 Type Scale

Base: 16px. Sizes in `rem`. Line heights are unitless. Letter-spacing in `em`.

```
hero
  family:      Cormorant Garamond 300 Italic
  size:        4.5rem (72px)
  line-height: 1.05
  tracking:    -0.01em
  use:         Landing page main headline only. One per page maximum.

display
  family:      Cormorant Garamond 300 Italic
  size:        3rem (48px)
  line-height: 1.1
  tracking:    -0.01em
  use:         Page titles: Browse, Collection, Shelf, Shrine, Card detail title.
               The editorial chapter-opening heading every page requires.

heading-1
  family:      Cormorant Garamond 500
  size:        2rem (32px)
  line-height: 1.2
  tracking:    0em
  use:         Within-page section headers. Shelf section labels. Card name on detail page.

heading-2
  family:      Cormorant Garamond 500
  size:        1.375rem (22px)
  line-height: 1.25
  tracking:    0em
  use:         Sub-section heads. Card title in browse grid info strip.

section-label
  family:      Inter 600
  size:        0.6875rem (11px)
  line-height: 1.4
  tracking:    0.1em
  transform:   uppercase
  use:         Filter labels, form labels, column headers, metadata categories.
               This is the "small caps" substitute — Inter SemiBold + uppercase + tracking.
               Never use Cormorant below 18px.

body
  family:      Inter 400
  size:        0.9375rem (15px)
  line-height: 1.6
  tracking:    0em
  use:         All body copy, synopsis, auth instructions.

body-sm
  family:      Inter 400
  size:        0.8125rem (13px)
  line-height: 1.55
  tracking:    0em
  use:         Secondary body, toast messages, form helper text.

caption
  family:      Inter 400
  size:        0.6875rem (11px)
  line-height: 1.5
  tracking:    0.01em
  use:         Card metadata (studio, year below title). Rarity tier label. Status labels.

ui-label
  family:      Inter 500
  size:        0.875rem (14px)
  line-height: 1.4
  tracking:    0em
  use:         Navigation links, button text, filter pills, tab text, form inputs.

mono
  family:      Geist Mono
  size:        0.875rem (14px)
  line-height: 1.4
  tracking:    0em
  use:         Episode counts ("12 / 24"), MAL scores ("8.72"), years ("2024"),
               item counts ("124 titles"). Any tabular number context.

mono-sm
  family:      Geist Mono
  size:        0.6875rem (11px)
  line-height: 1.4
  tracking:    0em
  use:         Inline stat chips, compact metadata.
```

### 5.3 Usage Rules

- Cormorant Garamond is a display face. Never use it below 18px — it loses legibility.
- Cormorant 300 Italic is exclusively for hero and display scale. At heading-1 / heading-2, use Cormorant 500. Italic at those sizes is deliberate emphasis only, not default.
- Inter handles all UI interaction text. It is never decorative.
- Geist Mono is for numbers in tabular contexts only. Do not use it for UI copy.
- No bold (700+) weights anywhere. Max Inter weight for emphasis: SemiBold (600). Max Cormorant: Medium (500).
- The typographic identity is the contrast between Cormorant's calligraphic classical quality and Inter's rational clarity. Never blur this by using Inter for display headings or Cormorant for captions.

---

## 6. Spacing and Grid

### 6.1 Base Unit

4px. All spacing values are multiples of 4. The Tailwind 4 `--spacing` scale covers this. Define equivalents as CSS custom properties for non-Tailwind contexts.

```
4px / 8px / 12px / 16px / 20px / 24px / 32px / 40px / 48px / 64px / 96px / 128px
```

### 6.2 Page Container

```
max-width:    1280px, centered
side-padding: 48px (desktop >= 1024px)
              24px (tablet 600px–1023px)
              16px (mobile < 600px)
```

Full-bleed content only on the landing page hero section.

### 6.3 Section Spacing

Between major page sections: `96px` desktop, `64px` mobile.
Between page header zone and first content element: `48px`.

### 6.4 Page Header Zone

Every page requires a deliberate header zone. Non-negotiable.

```
top padding:       48px desktop, 32px mobile
display title:     Cormorant 300 Italic, 48px, --text-primary
horizontal rule:   1px solid --border-default, 16px below title
subtitle / count:  Inter 400, 13px, --text-secondary, 8px below rule
bottom padding:    32px to first content

approximate total height: 140–160px desktop, 110–130px mobile
```

No page begins with navbar immediately followed by a content grid. The editorial breathing room is part of the brand.

### 6.5 Card Grid

```
desktop (>= 1280px):   4 columns, 24px gutter
tablet (960–1279px):   3 columns, 20px gutter
tablet-sm (600–959px): 2 columns, 16px gutter
mobile (< 600px):      2 columns, 12px gutter
```

`aspect-ratio: 2/3` enforced on all anime cards via CSS. Never hard-code pixel heights. At 4-col / 1280px / 48px side-padding / 24px gutters: column width ≈ 278px, card height ≈ 417px.

### 6.6 Shelf Horizontal Row

Poster cards: 160px wide, 240px tall (2:3 enforced). Gap: 16px. Matching side-padding to page container. Right edge: fade-out gradient (`transparent → --bg-page`) indicating scrollability.

### 6.7 Component Spacing Reference

```
card internal padding:    12px
card image-to-text gap:   8px
section header margins:   32px top, 16px bottom
filter row margins:       24px top, 16px bottom
button padding:           9px 18px default, 6px 12px compact
input padding:            10px 14px
nav height:               56px (3.5rem, h-14) — load-bearing, referenced by FavoritesReveal
modal padding:            32px
drawer width:             480px desktop
bottom sheet max-height:  85vh mobile
```

---

## 7. Component Visual Specs

### 7.1 Anime Card (Browse Grid)

```
card container
  background:    --bg-card (#FFFFFF)
  border-radius: 4px
  border:        none (white on cream creates separation without visual noise)
  shadow:        var(--shadow-card)
  aspect-ratio:  2/3
  overflow:      hidden
  cursor:        pointer
  position:      relative

image zone (top 72% of card)
  next/image, object-fit: cover, no border-radius
  transition: transform 220ms ease-out

info strip (bottom 28%)
  padding: 10px 12px 12px
  background: --bg-card
  display: flex, flex-direction column, gap 8px

  title
    Cormorant 500, 17px, line-height 1.2, --text-primary
    line-clamp: 2

  meta row
    flex, align-items center, justify-content space-between
    studio: Inter 400, 11px, --text-secondary
    rarity dots: right-aligned

rarity left-border accent
  position: absolute, left 0, top 0, bottom 0, width 3px
  background: var(--rarity-{tier}-border)

hover state
  card: translateY(-4px), shadow var(--shadow-hover), 200ms ease-out
  image: scale(1.03), 220ms ease-out (clipped by card overflow: hidden)

rarity dot cluster
  5 dots, 5px diameter, 3px gap, horizontal row
  filled: --accent (#C41E3A)
  empty:  --border-strong (#D6D0CA)
  common=1, uncommon=2, rare=3, ultra-rare=4, legendary=5

collect button
  outside card's transform context (preserves current architecture)
  icon-button style, bookmark icon
  appears on card hover, hidden when already collected
  collected state: filled bookmark icon, non-interactive indicator
```

### 7.2 Collection Card (Grid View)

Inherits browse card structure with additions:

```
status pip (top-right overlay, absolute on image)
  8px circle
  watching:      --accent, CSS radial pulse (scale 1.0→1.6, opacity 1→0, 2s loop)
  plan_to_watch: --border-strong, static
  watched:       --accent, static, 8px checkmark glyph, no pulse

status pill (info strip, below title)
  border: 1px solid (status-color)
  Inter 500, 10px, uppercase, tracking 0.06em
  padding: 2px 6px, border-radius: 2px
  background: transparent
  hover: background --accent-tint, border-color --accent, 150ms

  watching:      border-color/color --accent
  plan_to_watch: border-color --border-strong, color --text-secondary
  watched:       border-color/color --text-primary

episode counter (below status pill, when total_episodes > 0)
  Geist Mono, 11px, --text-secondary
  format: "12 / 24 ep"
```

### 7.3 Shelf Poster Card (Horizontal Row)

```
poster card
  width: 160px, height: 240px, aspect-ratio: 2/3 enforced
  border-radius: 4px, overflow: hidden
  background: --bg-card
  shadow: var(--shadow-card)
  flex-shrink: 0, position: relative

image: object-fit cover, full card fill

rarity left-border: 3px solid var(--rarity-{tier}-border), same as browse card

hover
  translateY(-6px), shadow var(--shadow-hover), 200ms ease-out

plan-to-watch section only — seedRotation tilt
  max tilt: +-4deg (reduced from old +-8deg)
  hover: straighten 0deg, lift 6px, 200ms ease-out
  (preserve seedRotation() logic from current poster-card.tsx)

bottom hover bar (absolute, bottom 0, full width, on hover)
  background: linear-gradient(transparent, rgba(26,22,20,0.7))
  padding: 8px 10px
  title: Inter 500, 12px, white
  episode stepper: +/- buttons flanking, white text

context menu (three-dot, top-right, appears on hover)
  icon-button, 32px visual, 44px touch target
  popover: --bg-card, 1px --border-default, 4px radius, var(--shadow-modal)
  move-to options: Inter 400, 14px, --text-primary
  remove: --status-error color
```

### 7.4 Card Detail Page

Two-column editorial layout. Replaces the existing rarity stage / pedestal layout entirely.

**Desktop:**

```
back button (above layout, top-left)
  ghost style, Inter 500, 14px, --text-secondary, left-arrow icon

two-column flex container

left column (55%, position: sticky, top: var(--navbar-height) + 24px)
  card art
    border-radius: 4px, shadow: var(--shadow-modal)
    width: 100%, aspect-ratio: 2/3, object-fit: cover

  rarity indicator (16px below art)
    dot cluster: 5 dots, 6px diameter, 4px gap
    tier label: Inter 600, 11px, uppercase, tracked, var(--rarity-{tier}-text)

right column (45%)
  anime title
    Cormorant 500 Italic, 32px, --text-primary

  studio + year
    Inter 400, 13px, --text-secondary
    format: "Studio · Year"

  horizontal rule (--border-default, 24px top/bottom)

  stat row (flex, gap 24px)
    each stat: .stat-value (Geist Mono, 18px, --text-primary) above
                .stat-label (Inter 600, 10px, uppercase, tracked, --text-muted)

  status segmented control: Watching / Plan to Watch / Watched
    active segment: --accent fill, --text-on-accent, 4px radius
    inactive: transparent, 1px --border-default, --text-secondary
    transition: 200ms

  episode stepper (if category = watching, 16px top margin)
    "12 / 24 episodes" Geist Mono, 14px
    +/- buttons flanking, Inter 500

  favorites button (secondary outline style, hanko seal icon)
    on activate: spring stamp GSAP, scale 0.6→1.05→1.0, 300ms
    this is the single "delight" animation — use it only here

  horizontal rule (24px margins)

  synopsis label: Inter 600, 11px, uppercase, tracked
  synopsis body:  Inter 400, 15px, --text-primary, line-height 1.6

  genre chips (below synopsis)
    outline pills, 1px --border-default, Inter 400, 11px, --text-secondary
    border-radius: 2px, padding: 3px 8px

  remove action (bottom, 32px top margin)
    ghost button, --status-error color
    two-step confirm: preserved
```

**Mobile:** Card art full-width at top (max-height 50vh). Content scrollable below. Status segmented control sticky at viewport bottom.

### 7.5 Section Header (Editorial Header Zone)

```html
<header class="page-header">
  <h1 class="page-title">Browse</h1>
  <hr class="page-rule" />
  <p class="page-subtitle">124 titles — sorted by score</p>
</header>
```

```css
.page-header {
  padding: 48px 0 32px;
}
.page-title {
  font: 300 italic 3rem/1.1 var(--font-display);
  color: var(--text-primary);
  letter-spacing: -0.01em;
  margin-bottom: 16px;
}
.page-rule {
  border: none;
  border-top: 1px solid var(--border-default);
  margin: 0 0 12px;
}
.page-subtitle {
  font: 400 0.8125rem/1.55 var(--font-sans);
  color: var(--text-secondary);
  margin: 0;
}
```

Shelf section dividers between status groups:

```css
.shelf-section-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 24px;
}
.shelf-section-title {
  font: 500 1.75rem/1.2 var(--font-display);
  color: var(--text-primary);
}
.shelf-section-count {
  font: 400 0.8125rem var(--font-sans);
  color: var(--text-secondary);
}
.shelf-section-rule {
  flex: 1;
  border-top: 1px solid var(--border-default);
  align-self: center;
}
```

### 7.6 Empty States

Typographic, not illustrative. No heavy SVG art.

```
container
  text-align: center
  padding: 80px 24px desktop, 48px 16px mobile

hanko seal watermark (decorative only)
  Karuta SVG seal, 80px, opacity 0.08, margin 0 auto 24px

headline
  Cormorant 300 Italic, 28px, --text-secondary
  (the italic is the tone — gentle, editorial, not alarming)

body
  Inter 400, 14px, --text-muted
  max-width 280px, centered, margin 0 auto 24px

action button (when resolution path exists)
  primary or ghost per button spec
```

Specific copy per state (italic = Cormorant headline, plain = Inter body):

- Browse no results: _"Nothing matches that search."_ / "Try a different title or clear your filters."
- Collection empty: _"Your shelves are bare."_ / "Start collecting to build your catalog." + "Browse Anime" primary button
- Shelf Watching empty: _"Nothing on the shelf."_ / "Move something here to start tracking."
- Shelf Plan empty: _"An empty queue."_ / "Add something worth watching."
- Shelf Watched empty: _"No completed titles yet."_ / "Mark a title watched when you finish it."
- Shrine empty: _"Nothing sacred yet."_ / "Add titles to your shrine from any card."

### 7.7 Skeleton Loading

```css
.skeleton-card {
  border-radius: 4px;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: var(--skeleton-base);
}
.skeleton-image {
  width: 100%;
  height: 72%;
  position: relative;
  overflow: hidden;
  background: var(--skeleton-base);
}
.skeleton-image::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--skeleton-shine) 50%,
    transparent 100%
  );
  animation: skeleton-sweep 1.6s ease-in-out infinite;
  transform: translateX(-100%);
}
@keyframes skeleton-sweep {
  to {
    transform: translateX(200%);
  }
}

.skeleton-title {
  margin: 10px 12px 4px;
  height: 14px;
  border-radius: 2px;
  background: var(--skeleton-base);
  width: 80%;
}
.skeleton-meta {
  margin: 0 12px;
  height: 10px;
  border-radius: 2px;
  background: var(--skeleton-base);
  width: 50%;
}
```

Rules:

- Skeleton color is always `--skeleton-base` (#E8E3DC). Never cold gray.
- Shapes match final content dimensions exactly — same column layout, same aspect ratio.
- No spinners as primary loading states. Spinners only inside buttons for action loading.

### 7.8 Buttons

**Primary:**

```
background:    --accent (#C41E3A)
color:         --text-on-accent (#FFFFFF)
border:        none
border-radius: 4px
padding:       9px 18px
font:          Inter 500, 14px, tracking 0.01em

hover:  background --accent-hover, shadow 0 2px 8px rgba(196,30,58,0.25), 200ms ease-out
active: scale(0.97), 80ms ease-out
disabled: opacity 0.4, cursor not-allowed, pointer-events none
loading: 10px inline spinner (white), text hidden, pointer-events none
```

**Secondary (outline):**

```
background:    transparent
color:         --accent
border:        1px solid --accent
border-radius: 4px
padding:       8px 18px
font:          Inter 500, 14px

hover:  background --accent-tint, 200ms ease-out
active: scale(0.97), 80ms
disabled: opacity 0.4, cursor not-allowed
```

**Ghost (no border):**

```
background:    transparent
color:         --text-secondary
border:        none
padding:       8px 12px
font:          Inter 500, 14px

hover:  color --text-primary, text-decoration underline offset 2px, 150ms ease-out
active: opacity 0.7
disabled: opacity 0.4, cursor not-allowed
```

**Destructive:**
Same structure as secondary, with:

```
color:       --status-error
border-color: --status-error
hover:        background var(--status-error-bg), 200ms ease-out
```

**Icon button:**

```
width/height:  32px visual, 44px minimum touch target (use padding)
border-radius: 4px
background:    transparent, border: none
color:         --text-secondary

hover:  background --bg-panel, color --text-primary, 150ms
active: scale(0.92)
disabled: opacity 0.4
```

### 7.9 Form / Input Style

**Input:**

```
background:    --bg-card (#FFFFFF)
border:        1px solid --border-default
border-radius: 4px
padding:       10px 14px
font:          Inter 400, 15px, --text-primary
placeholder:   --text-muted

focus:    border-color --accent, box-shadow 0 0 0 3px rgba(196,30,58,0.12), 150ms ease-out
error:    border-color --status-error, same focus ring
disabled: background --bg-panel, border-color --border-subtle, color --text-disabled, cursor not-allowed
```

**Label:** Inter 600, 11px, uppercase, tracking 0.07em, --text-secondary, display block, margin-bottom 6px

**Helper text:** Inter 400, 12px, --text-muted, margin-top 5px

**Error text:** Inter 500, 12px, --status-error, margin-top 5px

**Search input:** Standard input + 16px search glyph left (padding-left: 40px). X clear button appears on right when query is non-empty.

---

## 8. Data / Content Display Style

### 8.1 Filter Pills / Tabs

**Filter pills (rarity, other filters):**

```css
.filter-pill {
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: 2px;
  padding: 5px 12px;
  font: 500 0.8125rem var(--font-sans);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms ease-out;
}
.filter-pill:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
}
.filter-pill[data-active="true"] {
  background: var(--accent-tint-md);
  border-color: var(--accent);
  color: var(--accent);
}
```

**Shelf / page tabs (underline style):**

```css
.tab-row {
  border-bottom: 1px solid var(--border-default);
  display: flex;
}
.tab-item {
  padding: 12px 20px;
  font: 500 0.875rem var(--font-sans);
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition:
    color 150ms,
    border-color 150ms;
  cursor: pointer;
}
.tab-count {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: 8px;
}
.tab-item[aria-selected="true"] {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.tab-item:hover:not([aria-selected="true"]) {
  color: var(--text-primary);
  border-bottom-color: var(--border-strong);
}
```

### 8.2 Status Pills (Collection Cards)

```css
.status-pill {
  border-radius: 2px;
  padding: 2px 7px;
  font: 500 0.625rem/1 var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid;
  background: transparent;
  transition:
    background 150ms,
    border-color 150ms;
}
.status-pill[data-status="watching"] {
  border-color: var(--accent);
  color: var(--accent);
}
.status-pill[data-status="plan_to_watch"] {
  border-color: var(--border-strong);
  color: var(--text-secondary);
}
.status-pill[data-status="watched"] {
  border-color: var(--text-primary);
  color: var(--text-primary);
}
```

### 8.3 Navigation Bar

Light navbar — it belongs to the cream page, not floating above it.

```
.navbar
  position: sticky, top 0, z-index 50
  background: rgba(247, 243, 238, 0.92)
  backdrop-filter: blur(8px)
  border-bottom: 1px solid --border-default
  height: 56px (var(--navbar-height))
  layout: max-width container, flex, align-items center, justify-between

left
  Karuta SVG mark (28px height) + wordmark "Karuta" in Cormorant 500, 18px, --text-primary
  (karuta-mark.svg exists in /public — use it here)

center (desktop)
  Browse / Collection / Shelf / Shrine links
  Inter 500, 14px
  default: --text-secondary
  active:  --text-primary + 2px --accent bottom border
  hover:   --text-primary

right
  logged-in:  sign out ghost button
  logged-out: "Log in" ghost button + "Sign up" primary button

logged-out state
  navbar IS ALWAYS VISIBLE — the current behavior of hiding it when user=null is removed
  logged-out users see logo + auth CTAs

mobile
  center links hidden
  hamburger icon (right) — triggers mobile drawer
```

### 8.4 Stat Chips (Card Detail)

```css
.stat-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 64px;
}
.stat-value {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
.stat-label {
  font: 600 0.625rem var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}
```

### 8.5 Icons

Inline SVG only — do not add an icon library. Required icons for the redesign:

- Bookmark (outline + filled) — collect action
- Check — watched state, success
- ArrowLeft — back navigation
- Search — input glyph
- DotsHorizontal — context menu trigger
- X — close, dismiss
- ChevronDown — sort dropdown
- Menu / X — mobile hamburger toggle
- Hanko seal SVG — already exists at `/public`

---

## 9. Empty / Loading / Error State Style

### 9.1 Skeleton Loading

Warm skeleton color `#E8E3DC` always. Never cold gray. Shapes match final content exactly — same aspect ratio, same column layout. Shimmer sweep: left-to-right, 1.6s loop. No spinners (except button-internal action loading).

### 9.2 Empty States

Per Section 7.6. Editorial voice only. Cormorant italic headline + Inter body + optional hanko watermark (opacity 0.08). CTA when resolution path exists.

### 9.3 Error States

**Browse / data fetch error:**

```
.error-state { padding: 40px 24px; text-align: center; }
.error-title { font: 500 0.875rem var(--font-sans); color: var(--text-secondary); }
  "Couldn't load titles."
.error-body  { font: 400 0.8125rem var(--font-sans); color: var(--text-muted); }
  "Jikan may be rate-limited. Wait a moment and try again."
.retry-btn   { ghost button, --text-secondary }
  "Try again"
```

No red error borders on containers. Calm, informative, actionable.

**Form validation error:**

```css
.form-error-banner {
  background: var(--status-error-bg);
  border-left: 3px solid var(--status-error);
  border-radius: 0 4px 4px 0;
  padding: 10px 14px;
  font: 400 0.875rem var(--font-sans);
  color: var(--status-error);
}
```

### 9.4 Success States

- Collect action: white toast, bottom-center, 3px left bar in --status-success, bookmark icon, "Added to your collection", 3s auto-dismiss.
- Signup: white card, 3px left bar in --status-success, Cormorant italic headline "Check your email", Inter body with instructions.

---

## 10. Mobile Design Rules

### 10.1 Navigation

Replace current hamburger drawer with a **bottom tab bar** on mobile. The hamburger is a desktop pattern forced onto mobile.

```
.mobile-bottom-nav
  position: fixed, bottom 0, left/right 0
  height: 64px + env(safe-area-inset-bottom)
  background: rgba(247, 243, 238, 0.95)
  backdrop-filter: blur(8px)
  border-top: 1px solid --border-default
  display: flex, z-index 50

  .tab-item
    flex: 1, flex-direction column, align-items center, justify-content center
    gap: 4px, color: --text-muted
    font: Inter 500, 10px
    icon: 22px

    &.active: color --accent, filled icon

  tabs: Browse / Collection / Shelf / Shrine (4)
```

Desktop navbar: `hidden sm:flex`. Bottom tab bar: `flex sm:hidden`.

### 10.2 Spacing

16px side-padding throughout. Section spacing: 48px between major sections (from 96px desktop). Card gap: 12px.

### 10.3 Card Layout

2-column grid. `aspect-ratio: 2/3` enforced. Minimum card width: 140px. At 375px phone with 16px side padding and 12px gap: `(375 - 32 - 12) / 2 = 165.5px` — acceptable.

### 10.4 Modals and Bottom Sheets

- Desktop modal → mobile bottom sheet (85vh, spring entrance)
- Desktop right drawer (card detail) → mobile full-screen page
- All backdrops: `--bg-overlay` cream-tinted + backdrop-filter blur, not dark

Bottom sheet entrance: `translateY(100%) → translateY(0)`, spring (stiffness 300, damping 30).
Drag handle: 4px × 32px bar, --border-strong, border-radius 2px, centered at top.

### 10.5 Touch Targets

Minimum 44px × 44px for all interactive elements per WCAG AA. Episode stepper +/- buttons: 44px × 44px minimum. Context menu trigger: 44px × 44px.

### 10.6 Animation on Mobile

- No card tilt / parallax (cursor-based — irrelevant on touch)
- No hover-triggered effects
- All GSAP durations: reduce 20% on mobile
- Shelf stagger: 30ms per card (vs 40ms desktop) — keeps total reveal under 500ms
- `prefers-reduced-motion: reduce`: check via media query and skip all GSAP, use `transition: none`

---

## 11. What Is Explicitly Removed From the Old Direction

Implementation agents must delete these, not restyle them.

### 11.1 CSS Custom Properties — Delete

```
--ink-0, --ink-1, --ink-2
--indigo-deep, --indigo-mid
--washi, --washi-aged, --washi-dim, --washi-soft
--sumi
--hanko-bright           (replaced by --accent-hover)
--lantern-glow
--color-background       (old dark bg mapping)
--color-foreground       (old dark fg mapping)
--color-washi
--color-ink
--font-display → Geist Sans   (now maps to Cormorant Garamond)
--font-jp                     (Noto Serif JP load removed)
```

### 11.2 CSS Utility Classes — Delete

```
.ambient-lantern
.shoji-grain::before
.hanko-dot
.washi-pill / .washi-pill--active  (replaced by .filter-pill spec)
.hanko-btn                          (replaced by primary button spec)
.ghost-btn                          (replaced by ghost button spec)
.washi-input                        (replaced by input spec in 7.9)
.display-title                      (replaced by .page-title)
.hairline                           (replaced by .page-rule)
.font-display utility               (remap to Cormorant)
.font-jp                            (removed)
```

### 11.3 shelf.css — Delete These Patterns

```
.shelf-root scoped dark custom properties
.scene-watching, .scene-plan, .scene-watched    (dark atmospheric backdrops)
.moon-gallery, .moon-star, .moon-pool           (dark moon gallery)
fusuma door visual CSS                          (dark lacquer, slit-glow neon)
                                                 KEEP the GSAP door logic, restyle to light
.spine-foil shimmer
.shrine-beam-pulse
.shrine-ring-pulse
.water-ripple-sweep
.star-twinkle
```

### 11.4 card.css — Delete These Patterns

```
Rarity border glows (CSS @property animated glow on dark)
@keyframes for rarity glow cycling
Holographic overlay animation (legendary)
Rarity badge filled dark-mode backgrounds
.rarity-stripe (old dark version — replaced by left-border spec in 7.1)
Genre tag dark pill styles
Score star CSS display (replaced by Geist Mono score chip)
```

Keep: `.shine` overlay class on the flip card — restyled to subtle warm-white shimmer, not the current cold flash.

### 11.5 card-detail.css — Delete These Patterns

```
--cd-accent, --cd-glow rarity scoped CSS custom properties
.stage, .pedestal
Legendary hue-rotate cycling animation
Rarity-scoped full-page gradient background tinting
```

The two-column catalog layout in Section 7.4 replaces the stage/pedestal system entirely.

### 11.6 layout.tsx — Remove

```
Cinzel font declaration (next/font/google)
Noto Serif JP font declaration (next/font/google)
Geist Sans font declaration (replace with Inter)
`dark` class on root <html> element
```

### 11.7 Visual Patterns — Forbidden Going Forward

- Dark backgrounds as any page or surface. No `bg-black`, `bg-gray-900`, `bg-zinc-900`, no `dark:` Tailwind variants.
- Cold gray skeletons (never `gray-200`, `#e0e0e0`).
- Spinners as primary loading states.
- Neon or colored glow box-shadows.
- Blue accent system.
- Large atmospheric background radial gradients.
- Navbar hidden for logged-out users.
- Cinzel typeface (removed).
- Japanese kanji characters (`空`, `蔵`, `灯`, `月`) as primary empty-state UI elements — replaced by English editorial copy in Cormorant italic per Section 7.6.

---

## 12. Page-by-Page Layout Direction

### 12.1 Landing Page

```
navbar: always visible — logo left, "Log in" ghost + "Sign up" primary right

hero (centered, ~100vh, --bg-page as full field)
  hanko seal SVG: 64px, opacity 0.15, centered above headline
  headline: Cormorant 300 Italic, 72px, --text-primary, centered
    "The anime collection that feels like a catalog."
  subhead: Inter 400, 18px, --text-secondary, max-width 560px, centered, 16px below
    "Collect titles as rarity-tiered cards. Organize your shelves. Build your shrine."
  CTA row (32px below):
    "Start collecting" primary → /signup
    "Browse titles" ghost → /browse

preview section (below fold, scroll-triggered entrance)
  section-label: "WHAT YOUR COLLECTION LOOKS LIKE"
  3-column card preview (static anime card components)

footer
  "Karuta · Collect what you love." centered, --text-muted, Inter 400, 13px
```

Logged-in: primary CTA changes to "Go to Collection" → /collection.

Animation:

- Hanko seal: elastic stamp entrance on mount (restyled, GSAP preserved)
- Headline: y:12→0, opacity 0→1, 300ms on mount
- No character-by-character ripple (removed — too playful for the new direction)

### 12.2 Browse Page

```
page header: title "Browse", rule, subtitle dynamic ("125 titles · top anime")

filter row (below header, above grid)
  left: rarity filter pills (All / Common / Uncommon / Rare / Ultra Rare / Legendary)
  right: search input with glyph

rarity legend strip (above grid)
  "● Common  ●● Uncommon  ●●● Rare  ●●●● Ultra Rare  ●●●●● Legendary"
  Inter 400, 11px, --text-muted, flex row gap-12

card grid: 4-col→3-col→2-col→2-col
  stagger entrance: 40ms per card, y:12→0, opacity 0→1

toast: bottom-center, white card, left accent bar, 3s auto-dismiss
```

### 12.3 Collection Page

```
page header: title "Collection", rule, subtitle "42 titles collected"

filter + sort row
  left: rarity filter pills
  right: sort dropdown (styled per input spec — no native <select>)

card grid: same breakpoints as browse
  status pip top-right of each card image
  status pill in info strip
  episode counter where applicable
  stagger entrance on initialized
```

### 12.4 Shelf Page

```
page header: title "Shelf", rule, summary "4 watching · 18 planned · 20 watched"

shelf tabs: Watching / Plan to Watch / Watched (underline tab style per 8.1)
  droppable targets preserved for desktop DnD

active section
  shelf-section-header: status name Cormorant 500 28px + count + rule (per 7.5)
  horizontal scroll row of poster cards
    right-edge fade gradient: transparent → --bg-page
    scroll-snap: proximity, snap-align start
    no visible scrollbar

empty section: typographic per 7.6

favorites reveal (trigger: "Open Shrine" ghost button + hanko icon, top-right of page)
  fusuma GSAP logic preserved, restyled for light context:
    door panels: warm cream (#F0EBE3), 1px --border-default
    slit glow: warm amber rgba(196, 150, 80, 0.4) replacing red neon
    gallery backdrop: --bg-card (#FFFFFF) replacing dark indigo
    shrine interior: cream surfaces, no dark atmospheric effects
  FavoritesReveal top: var(--navbar-height) — preserved fragile dependency
```

### 12.5 Card Detail Page

Two-column layout per Section 7.4. Key points:

- No rarity stage, no pedestal
- Rarity shown as dot cluster below art + tier label in tier color
- Status as segmented control (not separate pill buttons)
- Favorites as secondary outline button with spring stamp animation
- Synopsis in clean reading column

### 12.6 Auth Pages (Login / Signup)

```
full page: --bg-page (#F7F3EE), navbar visible (logo + opposite auth CTA)

auth card (centered, max-width 420px)
  background: --bg-card
  border: 1px solid --border-default
  border-radius: 4px
  shadow: var(--shadow-modal)
  padding: 40px

  header (centered)
    Karuta hanko seal SVG, 40px
    heading: Cormorant 500, 26px, "Sign in to Karuta" / "Create your account"
    subhead: Inter 400, 14px, --text-secondary, 8px below heading

  form: label + input pairs per spec, error banner per 9.3, full-width primary submit

footer link (below card, centered)
  "Don't have an account? Sign up →"
  Inter 400, 13px, --text-secondary
  link text: --accent, underline on hover
```

---

## 13. Anti-Patterns

These are forbidden. Any implementation resembling these must be revised before shipping.

1. **Dark backgrounds on any surface.** `--bg-page` is `#F7F3EE`. No `bg-black`, `bg-gray-900`, `bg-zinc-900`, no `dark:` variants. Light mode only.

2. **Cold gray skeletons.** Skeleton color is always `#E8E3DC`. Never `#e0e0e0`, `gray-200`, or any cool-toned value.

3. **Spinners as primary loading states.** Skeletons for all grid/list/page loading. Spinners inside buttons for action loading only.

4. **Cormorant Garamond below 18px.** Below that threshold it becomes illegible. Use Inter for all text under 18px.

5. **Bold (700+) font weights.** Max Inter for emphasis: SemiBold (600). Max Cormorant used: Medium (500). Never bold Cinzel — it does not exist in this direction, but the rule applies to Cormorant equally.

6. **Hanko red as fill on large surfaces.** `--accent` is for: primary button fill, active tab underline, rarity dot fills, status pips, focus rings, hanko seal mark. Never a section background, hero fill, or banner color. Red is punctuation, not wallpaper.

7. **Multiple accent colors.** The palette is cream + ink + one red. No blue, green, purple, or teal accent additions. Status green/amber appear in status/toast contexts only — never as decorative accents elsewhere.

8. **Border-radius above 6px on cards or surfaces.** Cards: 4px. Modals: 4–6px. Heavy rounding reads as mobile app or Bootstrap template.

9. **Colored or neon box-shadows.** All shadows use `rgba(26, 22, 20, ...)` warm ink values. No glow-style colored shadows on light-mode surfaces.

10. **Generic empty state copy.** "No items found." "Nothing here." "Empty." are forbidden. Every empty state has a specific Cormorant italic headline and Inter body per Section 7.6.

11. **Navbar hidden for logged-out users.** The navbar is always visible. Karuta's brand must appear on every page including landing, login, and signup.

12. **Mixed card aspect ratios in any grid.** All anime cards are `2/3`. No exceptions in any view.

13. **Animations longer than 300ms that block interaction.** Page transitions: 150ms. Card stagger total: max 600ms. Button feedback: 80ms. Modal entrance: 180ms.

14. **Japanese kanji as decorative UI glyphs.** Cultural references are in the product name, hanko mark SVG, and typographic contrast. Not scattered as interface copy.

15. **Native `<select>` for sort dropdowns.** Style all selects per the input spec. The current collection sort native `<select>` is a known defect that must be corrected.

16. **Glassmorphism as decorative card or panel treatment.** `backdrop-filter: blur()` is used only on the navbar (cream transparency) and modal overlays. Not on cards or content panels.

17. **Neon or glow box-shadows.** No `box-shadow: 0 0 20px #c41e3a` declarations. Warm ink shadows only.

---

## 14. Futuristic & Organic Living Layer

The editorial direction is the structure. This layer makes it breathe. All techniques are GSAP 3 + CSS only — no new dependencies.

### 14.1 Film Grain Overlay (always on)

A subtle paper-stock texture applied globally via a `body::after` pseudo-element. Makes the cream background read as physical paper rather than a glowing screen. Highest quality-per-effort addition in the entire design.

```css
body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  background-repeat: repeat;
}
@media (prefers-reduced-motion: reduce) {
  body::after {
    display: none;
  }
}
```

### 14.2 Card Spotlight (browse & collection grids, desktop only)

On `mousemove` within a card, update CSS custom properties that drive a radial-gradient overlay using `mix-blend-mode: soft-light`. Cards feel like they have a lit physical surface — a collectible held under a lamp.

```tsx
// On the card's mousemove handler:
const rect = card.getBoundingClientRect();
const x = ((e.clientX - rect.left) / rect.width) * 100;
const y = ((e.clientY - rect.top) / rect.height) * 100;
card.style.setProperty("--spotlight-x", `${x}%`);
card.style.setProperty("--spotlight-y", `${y}%`);
```

```css
.anime-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms ease-out;
  background: radial-gradient(
    circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
    rgba(255, 255, 255, 0.55) 0%,
    transparent 65%
  );
  mix-blend-mode: soft-light;
  z-index: 1;
}
.anime-card:hover::before {
  opacity: 1;
}
```

- Desktop only — guard with `window.matchMedia("(hover: hover)")`
- No GSAP needed — pure CSS variable update on mousemove

### 14.3 Clip-Path Curtain Reveal (page transitions & major entrances)

Replaces the plain opacity fade for page transitions. Content enters as if a curtain is pulling back — clip-path `inset(0 0 100% 0)` → `inset(0 0 0% 0)` with simultaneous scale `1.03 → 1.0`. The dual motion prevents the mechanical feel of a pure wipe.

```ts
// In PageTransition component:
gsap.fromTo(
  el,
  { clipPath: "inset(0 0 100% 0)", scale: 1.03 },
  {
    clipPath: "inset(0 0 0% 0)",
    scale: 1,
    duration: DURATION.slow,
    ease: EASE.out,
  },
);
```

- Applied on page route change and on tab switches in the shelf
- Keep `clearProps: "all"` in onComplete

### 14.4 SplitText Word Reveal (display headings)

GSAP SplitText (free as of 2025) reveals display headings word-by-word, each word sliding up from beneath a clip mask. Applied to all Cormorant Garamond display headings on page load/scroll entry. Text surfaces rather than appearing.

```ts
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

const split = new SplitText(headingEl, { type: "words" });
gsap.from(split.words, {
  yPercent: 110,
  opacity: 0,
  duration: DURATION.slow,
  stagger: 0.06,
  ease: EASE.out,
  onComplete: () => split.revert(),
});
```

- Wrap heading in `overflow: hidden` container to create the mask
- Only on headings ≥ `display` size (48px+) — not section headers
- Skip if `prefers-reduced-motion` is active

### 14.5 Ambient Shrine Float (favorites gallery only)

In the favorites gallery (`favorites-scene.tsx`), featured cards float with a subtle organic breathing motion. Randomized duration and delay per card makes it feel living rather than mechanical.

```tsx
// Per card, on mount:
const duration = 3.5 + Math.random() * 2; // 3.5–5.5s
const delay = Math.random() * 2;
gsap.to(cardEl, {
  y: "-=6",
  duration,
  delay,
  ease: "sine.inOut",
  yoyo: true,
  repeat: -1,
});
```

- Favorites gallery only — nowhere else
- Kill on unmount

### 14.6 Rarity Tier — Futuristic Treatments

**Legendary tier:** Subtle conic-gradient foil using `mix-blend-mode: color-dodge` at low opacity, animated with `hue-rotate` on an 8-second loop. Reads as a holographic sheen on the card surface — not neon, not garish.

```css
.rarity-legendary::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: conic-gradient(
    oklch(0.8 0.15 0) 0deg,
    oklch(0.8 0.15 60deg) 60deg,
    oklch(0.8 0.15 120deg) 120deg,
    oklch(0.8 0.15 180deg) 180deg,
    oklch(0.8 0.15 240deg) 240deg,
    oklch(0.8 0.15 300deg) 300deg,
    oklch(0.8 0.15 360deg) 360deg
  );
  mix-blend-mode: color-dodge;
  opacity: 0.07;
  animation: foil-rotate 8s linear infinite;
}
@keyframes foil-rotate {
  to {
    filter: hue-rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .rarity-legendary::after {
    animation: none;
  }
}
```

**Epic tier:** A single warm-gold linear-gradient shimmer at 5% `overlay` blend mode — static, no animation. Subtle warmth that distinguishes epic from rare without the full foil treatment.

```css
.rarity-epic::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(196, 168, 74, 0.12) 0%,
    transparent 60%
  );
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

### 14.7 Hairline Rule Glow

Section divider hairlines carry a very subtle warm red glow — almost invisible, but adds warmth that separates the editorial aesthetic from cold minimalism.

```css
.hairline {
  height: 1px;
  background: var(--border-subtle);
  box-shadow: 0 0 6px 0px rgba(196, 30, 58, 0.1);
}
```

### 14.8 Stat Readout — Instrument Treatment

Score, episode count, and year stat cells in card detail should feel like scientific instruments, not plain numbers. Use Geist Mono at larger sizes with a subtle monospaced tabular feel.

- Score value: Geist Mono, `2rem` (32px), `color: var(--text-primary)`, `letter-spacing: -0.02em`
- Prefix/suffix labels: Inter, `0.6875rem`, `color: var(--text-muted)`, `letter-spacing: 0.15em`, uppercase
- Thin `1px` top border on the stat cell container in `var(--border-subtle)` — like a measurement gauge

### 14.9 Anti-patterns (researched and rejected)

These were considered and rejected for the Karuta editorial context:

- **Blob/organic shape morphing** — wrong aesthetic universe; clashes with editorial grid structure
- **Cursor trails** — visual noise on a scanning/browsing interface
- **Three.js / WebGL particles** — performance risk, no dependency budget
- **Kinetic/animated headline text** — undermines typographic authority (Cormorant Garamond earns its presence by being still)
- **Scrolljacking** — breaks repeat-use utility behavior
- **Mesh gradient backgrounds** — 2023–2024 cliché, clashes with paper aesthetic
- **Magnetic cursor** — gimmicky at scale, performance risk on many cards
- **3D card tilt on hover** — genericized in the anime space; replaced by spotlight

18. **Inter for page title headings.** Page titles use Cormorant Garamond. Using Inter for a display heading is a typography system failure.

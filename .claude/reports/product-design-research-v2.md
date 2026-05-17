# Product Design Research v2: Futuristic-Organic Animation Layer

## Context

This document extends the base product-design-research.md. The established editorial direction (Christie's / MoMA feel, Cormorant Garamond, #F7F3EE cream, #C41E3A hanko red accent) is confirmed and preserved. The goal of this research is to identify specific futuristic-organic animation and visual elements that can be layered into the existing direction without abandoning it. The brief: make Karuta feel like a living, breathing, slightly otherworldly collector's space — not a static catalog.

---

## Top 5 Futuristic-Organic Animation Techniques

### 1. Masked Word/Line Reveal on Scroll (Clip-Path + SplitText)

**What it is:**
Text elements — page titles, section headers, card titles at display sizes — animate in by revealing from behind a clip-path mask rather than fading in. Each word or line lifts up from behind an overflow:hidden boundary. The result looks like text rising from the paper rather than appearing from nothing.

**Where it appears in Karuta:**

- Page titles ("COLLECTION", "SHRINE", "BROWSE") on load
- Section headers within the shelf view ("WATCHING — 14")
- The large serif display text in the empty state ("Your shelves are bare.")
- Landing/hero headline if a landing page exists

**How to implement (GSAP only, SplitText is now free):**

```
gsap.registerPlugin(SplitText, ScrollTrigger);

const split = new SplitText(".display-heading", { type: "lines,words", mask: "lines" });

gsap.from(split.words, {
  yPercent: 100,
  opacity: 0,
  duration: 0.75,
  ease: "power3.out",
  stagger: 0.07,
  scrollTrigger: {
    trigger: ".display-heading",
    start: "top 85%",
  }
});
```

The `mask: "lines"` parameter wraps each line in an overflow:hidden container. Text slides up from below. The clip boundary is invisible. No ghost text appears outside the line box.

**Why it fits the editorial direction:**
High-end editorial print design uses typesetting as a structural event — text occupies space deliberately and arrives with weight. This animation honors that intention. The text doesn't "pop in" — it surfaces. It reads as restrained and typographic, not decorative. It directly mirrors how luxury fashion houses (Bottega Veneta, Loewe) animate headers on their editorial pages. The easing (power3.out) ensures a decelerating, natural landing rather than a mechanical snap.

**Performance note:** SplitText operates on DOM nodes. The animation runs on compositor-friendly properties (transform, opacity). Safe on mid-range devices.

**Reduced-motion:** Wrap in `matchMedia("(prefers-reduced-motion: no-preference)")`. Fallback: text visible immediately, no animation.

---

### 2. Ambient Card Float (CSS Keyframes, per-card randomized offset)

**What it is:**
Cards in the browse grid and shrine gallery breathe — each card has an independent, slow, low-amplitude vertical float. The motion is sinusoidal, looping, 4-8 second cycles, amplitude of 6-10px. Because each card gets a randomized animation-delay and duration, the grid as a whole oscillates organically — no two cards crest at the same time. It looks like the cards are suspended in a very gentle current.

**Where it appears in Karuta:**

- Shrine gallery (hero card + supporting cards) — primary use case. The shrine should feel the most alive.
- Optionally: on the Browse landing hero when a featured/spotlit card is displayed at 2x width.
- NOT on the standard browse grid when all 20+ cards are visible — too much visual noise. Limit to featured/highlighted cards or the shrine.

**How to implement (CSS only, zero dependencies):**

```css
@keyframes card-float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.shrine-card {
  animation: card-float var(--float-duration, 6s) var(--float-delay, 0s)
    ease-in-out infinite;
}
```

In JSX, assign random values at render time:

```jsx
style={{
  "--float-duration": `${5 + Math.random() * 3}s`,
  "--float-delay": `${Math.random() * 4}s`
}}
```

**Why it fits the editorial direction:**
The float is micro-scale and slow. It does not compete with content — it animates the canvas around content. The shrine is specifically framed as the "emotional center" of the app — the place where collected favorites live. A subtle life force in the shrine cards reinforces that these are valued, sacred objects. This is the "Muji meets CERN" register: precise, calm, but undeniably alive. The analog reference is display cases in natural history museums where objects sit under subtle lighting that catches their surface.

The randomized offsets are the critical detail. A uniform float on all cards simultaneously would feel mechanical. Randomized offsets produce the organic field effect.

**Performance note:** Transform animations on individual elements with `will-change: transform` run on the GPU compositor thread. No layout recalculation. Safe for 8-12 simultaneously floating shrine cards.

**Reduced-motion:** Animation paused entirely. Cards static.

---

### 3. Grain/Noise Texture Overlay (SVG feTurbulence, CSS pseudo-element)

**What it is:**
A persistent, very low-opacity film grain texture sits over the cream page background — implemented as a fixed `::after` pseudo-element on the `<body>`. The grain is generated via an inline SVG filter with `feTurbulence` rather than loaded as an image file. At 3-5% opacity, it is subliminal: users cannot consciously see it, but removing it makes the page feel flat and digital. At 8-10%, it reads as a deliberate texture choice.

**Where it appears in Karuta:**

- Persistent on the page background (#F7F3EE cream surface)
- Optionally animated (very slow drift of `baseFrequency` value) for a living paper effect — though static is more stable cross-browser

**How to implement (CSS + inline SVG, no dependency):**

```css
body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

The `stitchTiles='stitch'` parameter ensures the texture tiles seamlessly without visible seams. `pointer-events: none` ensures it does not intercept any interactions.

**Why it fits the editorial direction:**
This is the single most powerful subliminal effect available. Premium print materials — museum catalogs, art books, high-end magazine stock — have tooth: a microscopic surface texture that light catches. Digital cream (#F7F3EE) on a screen is mathematically flat. The grain overlay simulates the paper tooth of quality print stock. The result is a perceptible warmth and depth that cannot be achieved any other way with CSS alone.

Grainient, fffuel's gggrain, and multiple Smashing Magazine references confirm this as the dominant premium texture technique in 2025 editorial web design. It appears on luxury brand sites (Loewe.com, The Row's online presence) and award-winning portfolio sites where the background reads as a physical surface rather than a glowing panel.

For Karuta specifically, this elevates the cream background from "off-white web page" to "aged paper catalog page" — which is the intended reading.

**Performance note:** SVG feTurbulence filters can be GPU-accelerated when rendered to a static tile. Using a small repeat size (200x200px) with `stitchTiles` keeps the tile small and rendering fast. The `position: fixed` with `z-index: 9999` keeps it always above content without causing layout recalculation.

**Cross-browser note:** Safari handles `filter()` on backgrounds differently. Using a pseudo-element with a rendered SVG data URL is more consistent than `backdrop-filter` or inline CSS filter.

---

### 4. Spotlight Hover on Cards (CSS Custom Properties + Mouse Tracking)

**What it is:**
When a user's cursor moves over a card, a soft radial gradient spotlight follows the cursor position within the card bounds, using `mix-blend-mode: soft-light`. The spotlight is a white radial gradient (rgba(255,255,255,0.6) at center, fading to transparent) positioned via CSS variables updated in a `mousemove` handler. At `soft-light` blend mode on the cream card surface, it creates a luminous highlight — as if a museum spotlight is trained on the card.

This is different from a standard hover state. The light moves with the cursor position inside the card. It creates a 3D surface reading: the card has a front face that catches light.

**Where it appears in Karuta:**

- Browse grid cards on desktop (cursor-present environments only)
- Shrine gallery cards (especially the hero card)
- Card detail view (the large card art panel)

**How to implement (JS + CSS, no dependency):**

```js
const cards = document.querySelectorAll(".card");

cards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--spotlight-x", `${x}%`);
    card.style.setProperty("--spotlight-y", `${y}%`);
  });
  card.addEventListener("mouseleave", () => {
    card.style.removeProperty("--spotlight-x");
    card.style.removeProperty("--spotlight-y");
  });
});
```

```css
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  mix-blend-mode: soft-light;
  background: radial-gradient(
    circle farthest-corner at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
    rgba(255, 255, 255, 0.6) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card:hover::before {
  opacity: 1;
}
```

**Why it fits the editorial direction:**
Museum display cases are lit. Christie's catalog photography uses controlled directional light to reveal surface quality. The spotlight hover extends this metaphor into interaction: the user's cursor becomes a curatorial spotlight. It is premium because it is physicalized — the card has a surface that responds to light — and because `soft-light` blend mode on cream produces a warm, luminous result rather than a cold glare.

This technique comes directly from the Pokemon CSS holographic card project (simeydotme) which proved the CSS-only viability of physics-based card lighting. Karuta's implementation is deliberately quieter: soft-light rather than hard-light, warm white rather than iridescent color, no mouse tilt/rotation (which would feel too gimmicky in an editorial context).

**Performance note:** CSS variables updated on mousemove are cheap. The gradient re-renders on GPU. One handler per card. Safe for 20+ cards simultaneously.

**Mobile:** Omit entirely. Touch environments have no cursor; a static slightly illuminated card center is preferable to a touch-triggered version that feels broken.

---

### 5. Clip-Path Curtain Reveal on Page Load (GSAP + CSS clip-path)

**What it is:**
On initial page load and route transitions, the page content is revealed by a clip-path animation rather than a fade. The clip begins as `inset(0 0 100% 0)` (content completely hidden below the bottom edge) and animates to `inset(0 0 0% 0)` over 600ms. Optionally, the clip can use a slightly organic shape — `polygon` rather than `inset` — where the reveal edge has a 1-2px vertical variation that reads as hand-drawn rather than mechanical.

For individual sections as they enter the viewport during scroll, a per-section clip-path reveal can trigger with `ScrollTrigger`, replacing the standard opacity/translateY reveal pattern.

**Where it appears in Karuta:**

- Initial page load (the entire page content zone below the navigation)
- Route transitions replacing the current fade-in pattern
- Section-level reveals for shelf headers during scroll

**How to implement (GSAP + CSS):**

```js
gsap.from(".page-content", {
  clipPath: "inset(0 0 100% 0)",
  duration: 0.65,
  ease: "power3.inOut",
  clearProps: "clipPath",
});
```

For organic edge variation:

```js
gsap.from(".page-content", {
  clipPath: "polygon(0 0, 100% 0, 100% 0%, 0% 2%)",
  duration: 0.65,
  ease: "power3.inOut",
  clearProps: "clipPath",
});
```

The slight asymmetry in the closing edge (0% vs 2%) creates a barely-perceptible tilt on the reveal edge that reads as human rather than programmatic.

**Why it fits the editorial direction:**
This technique directly mirrors how pages are turned, how catalog spreads are unfolded, how a blind is raised on a display window. It is a directional unveiling — content slides into existence from a defined origin rather than materializing from nothing. The Codrops 2026 portfolio research confirms that clip-path wipes combined with scale transforms prevent the visual rigidity of pure fade-in reveals. Scaling the incoming content from 1.03 down to 1.0 simultaneously with the clip-path expansion adds dimensionality: the content breathes out into the viewport rather than simply appearing.

The organic edge variation distinguishes Karuta from sites that use the same `clip-path: inset()` pattern mechanically. It is a 1-2px detail. Users do not notice it consciously. It reads as care.

---

## Visual Element Additions

### A. Iridescent Foil Treatment for Legendary-Tier Cards (CSS only)

**For Legendary rarity cards specifically**, apply a subtle iridescent sheen using layered CSS gradients with `mix-blend-mode`. The effect should be 10-15% visible — perceptible on close inspection, not loud at grid scale.

**Implementation:**

```css
.card[data-rarity="legendary"]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  mix-blend-mode: color-dodge;
  background: conic-gradient(
    in oklch,
    oklch(75% 0.35 0),
    oklch(75% 0.35 60),
    oklch(75% 0.35 120),
    oklch(75% 0.35 180),
    oklch(75% 0.35 240),
    oklch(75% 0.35 300),
    oklch(75% 0.35 360)
  );
  opacity: 0.07;
  animation: foil-shift 8s linear infinite;
}

@keyframes foil-shift {
  from {
    filter: hue-rotate(0deg);
  }
  to {
    filter: hue-rotate(360deg);
  }
}
```

At 7% opacity with `color-dodge` on a warm white card surface, this produces a very subtle rainbow overtone — visible at close range, invisible in thumbnail. The 8-second cycle is slow enough to feel atmospheric rather than garish.

For Epic-tier cards: use `mix-blend-mode: overlay` with a single-axis gold conic gradient at 5% opacity. A cooler, restrained shimmer without the rainbow. Epic feels precious; Legendary feels mythic.

**Why this works on light backgrounds:** `color-dodge` lightens the layer underneath based on the overlay color. On cream/white surfaces, this produces warm luminous tones rather than the neon effect it would create on dark backgrounds. The OKLCH color space ensures perceptually even hue transitions (no muddy desaturated midpoints as occurs with HSL rotation).

---

### B. Hairline Accent Rules with Luminous Glow

**What it is:** Horizontal rules throughout the app (below page headers, between shelf sections) are 1px solid `#E4DDD6` (existing border color) with a very subtle `box-shadow` that gives the line a faint luminous quality:

```css
.editorial-rule {
  border: none;
  height: 1px;
  background: #e4ddd6;
  box-shadow: 0 0 6px 0px rgba(196, 30, 58, 0.12);
}
```

At 12% opacity, the hanko red glow on a hairline rule is barely detectable — it reads as warmth in the line rather than a visible red glow. It connects the structural divider to the brand accent without adding visual weight.

For section dividers adjacent to the hanko red accent (active shelf, featured card), raise the glow to `rgba(196, 30, 58, 0.2)`.

This technique appears in high-end print/web hybrid designs where rules must anchor sections without dominating. The luminous quality makes a 1px line feel more substantial than its pixel count.

---

### C. Topographic Contour Background (SVG, restricted zones)

**What it is:** A subtle topographic contour pattern — concentric irregular closed curves, like elevation contours on a map — used sparingly as a background texture in specific zones:

- The shrine page hero area (behind the featured card)
- The empty state background
- Potentially the landing page

The lines should be very low contrast: `stroke: rgba(196, 30, 58, 0.04)` — nearly invisible, but adding micro-texture to the cream surface in a way that reads scientific and organic simultaneously. This is the "CERN meets Muji" detail: precision cartography as decorative field.

**Why it fits:** Topographic maps are a legitimate scientific visualization aesthetic. They suggest precision, layering, depth — all without color, 3D, or heavy visual processing. On the shrine page, they reinforce the idea that this space has terrain, that it is a place to explore, not just a grid of thumbnails. Japanese design — particularly the craft/research crossover that informs the "Muji meets CERN" brief — frequently uses precision scientific graphics (circuit diagrams, topographic lines, grid overlays) as decorative structural elements.

**Implementation note:** An inline SVG with `<path>` elements using `d` attributes that trace irregular closed curves, set to `position: absolute`, `z-index: 0`, `pointer-events: none`, `opacity: 0.6`, with the strokes at `rgba(196,30,58,0.04)`. The SVG should be 100% width/height of its parent container.

---

### D. Monospaced Score / Stat Readouts as Scientific Instrument Displays

**What it is:** Numerical data in Karuta (item counts, year values, episode counts in detail views) use a monospaced font rendered with CSS properties that evoke precision instrument displays:

```css
.stat-readout {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #6b6560;
  text-transform: uppercase;
}

.stat-readout .value {
  font-size: 32px;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: #1a1614;
  display: block;
  line-height: 1;
}

.stat-readout .unit {
  font-size: 9px;
  letter-spacing: 0.2em;
  opacity: 0.6;
  margin-top: 4px;
}
```

The pattern is: small-caps label above, large monospaced number, small-caps unit below. This is how scientific instruments display readings — the number is primary and given breathing room; the label and unit are subordinate. It reads as data with authority.

Apply this to: collection item counts in section headers ("124 / TITLES"), year on card detail pages, episode count, score on detail view.

**Why it fits:** The "scientific instrument" register signals that Karuta takes collecting seriously. A count of "124" in a small Inter caption is a data point. A 32px monospaced "124" with "TITLES" below it in tracked small caps is a measurement. The difference is entirely typographic. It costs nothing to implement and transforms the perception of the data from incidental to intentional.

---

## Reference Sites and Products

### simeydotme Pokemon Cards CSS (poke-holo.simey.me)

The most technically complete implementation of CSS-only holographic card effects available publicly. The core technique — `mix-blend-mode: hard-light` + `background: repeating-linear-gradient` for the rainbow layer, `mix-blend-mode: screen` for the glare layer, CSS custom properties updated on `mousemove` — is fully documented and open-source. The author has continued updating the project through September 2025 (GIGAZINE coverage confirms ongoing development).

**What works:** Proves that convincing physics-based card surface effects are achievable in pure CSS/JS without WebGL. The rarity differentiation is implemented via `data-rarity` attributes that switch the CSS treatment class. Architecture is directly adaptable to Karuta's rarity tiers.

**What to adapt:** The spotlight and surface-catch techniques. Not the full rainbow iridescence (too loud for editorial). The interaction model (CSS variables on mousemove) and the blend-mode layering system.

**What not to copy:** The high-saturation rainbow gradients, the 3D rotation on mouse move (gimmicky in an editorial context), the dark background context.

---

### Eduard Bodak Portfolio (2025, via Codrops spotlight)

A portfolio site analyzed in detail by Codrops in July 2025. Key techniques: scroll-driven animations via Locomotive Scroll V5's CSS variable `--progress` (0-1), floating card animations with randomized GSAP durations for organic feel, mouse-reactive card rotation using normalized coordinates applied to `rotationY`. The site's premium quality derives from elastic easing functions creating tactile responses, accessibility gating via `prefers-reduced-motion`, and micro-interactions that pause contextually when hovering navigation.

**What works:** The randomized-duration float technique (which directly maps to the ambient float recommendation above). The contextual animation pause — animations respect the site's state rather than running independently.

**What to adapt:** Randomized float durations for the shrine gallery. The accessibility gating pattern. The "animations that know where they are" philosophy — Karuta's floating cards should pause when a drawer is open, should stop when the user is in a form.

**What not to copy:** 3D rotation on cards (Bodak's is a design portfolio, Karuta is a catalog — different context).

---

### Codrops 2025 Year in Review Editorial

The Codrops 2025 roundup identifies organic motion as the dominant aesthetic thread: dissolve effects, metaballs, dithering shaders, particle systems — all emphasizing fluid, biological aesthetics over hard geometry. The editorial note: "moodboards, motion, and meaning aligned with luxury branding, emphasizing restraint and intentional pacing over visual noise."

**What this tells us for Karuta:** The ambient animation layer should never exceed 3-4 simultaneous moving elements visible at once. More than this exits the "living" register and enters "busy." The float, the grain texture, and the spotlight are sufficient. Adding particle systems, morphing blobs, or scrolling background lines simultaneously would tip the balance into noise.

---

### Thibault Maillard Portfolio (Codrops 2026 feature)

The clip-path + scale combination for page transitions: content scales from 1.03 to 1.0 simultaneously with clip-path revealing from `inset(0 0 100% 0)` to `inset(0 0 0% 0)`. The organic quality comes from combining two properties rather than using one in isolation. The dual motion prevents rigidity.

**What to adapt:** The dual transform technique directly. Scale + clip-path for all Karuta page reveals, replacing the current opacity-only fade.

---

### Flesh and Blood TCG (fabtcg.com)

The most thoughtful rarity differentiation in the TCG space. Marvel cards (pinnacle rarity) use extended borders, alternate art, and special foil printing. The website communicates rarity through text description and visual presentation of the physical card treatment rather than arbitrary UI badges or digital effects layered over thumbnails.

**What this tells us for Karuta:** Rarity treatment should be about the card's presentation, not a UI badge stuck on top of it. Legendary cards in Karuta should have the entire card treated differently — the foil overlay, the spotlight response, the float behavior — rather than just a "LEGENDARY" badge.

---

## Updated Rarity Tier Treatment

### Legendary Tier (5 dots, the pinnacle)

**Visual treatment:**

1. The iridescent foil overlay (described above): conic-gradient at 7% `color-dodge` opacity, cycling 8-second hue-rotate.
2. The spotlight hover is enhanced: the spotlight radius is tighter (40% vs 60% coverage) creating a more focused, intense beam. The white at center increases to 0.8 opacity.
3. The card border gets a subtle warm-glow: `box-shadow: 0 0 0 1px rgba(196, 30, 58, 0.3), 0 0 24px rgba(196, 30, 58, 0.08)`. On cream background, this reads as a faint red halo — as if the card has energy.
4. In the shrine gallery, Legendary cards always float. They do not sit static.
5. The rarity dot display: 5 filled red dots, but the 5th dot is slightly larger (6px vs 5px) — a single-pixel difference that signals hierarchy without a different color.

**Typography treatment:** The title of a Legendary card in the detail view renders in Cormorant Garamond Light Italic at the display size (48px+) with letter-spacing at -0.02em — tighter than standard, which at large sizes reads as deliberate typographic refinement.

### Epic Tier (4 dots)

**Visual treatment:**

1. A single-axis gold shimmer using `mix-blend-mode: overlay` at 5% opacity: `linear-gradient(135deg, oklch(85% 0.15 60), transparent 50%, oklch(85% 0.15 90))` — creates a warm diagonal sheen readable only at close range.
2. Standard spotlight hover behavior (same as other cards).
3. Card border: `box-shadow: 0 0 0 1px rgba(196, 30, 58, 0.15)` — barely-perceptible inner ring.
4. No float animation on Epic in browse grid. Float is reserved for Legendary as a differentiator.
5. In shrine gallery, Epic cards get the float animation.

**Why this two-tier approach works:** Legendary feels mythic (multi-color, animated, glowing). Epic feels precious (single-color, static shimmer, structured). The hierarchy is legible without being cartoonish. The effects are additive — Legendary has everything Epic has, plus more.

### Rare Tier (3 dots) and Below

No special surface treatments. The hanko red rarity dots carry the visual weight. Below Legendary and Epic, the editorial restraint is absolute: let the anime artwork speak. This is the correct distribution — treatments that apply to everything are treatments that differentiate nothing.

---

## What to Avoid

### WebGL / Three.js Particle Systems

The research confirms these are performant issues on mid-range devices and introduce framework overhead without proportional editorial value. Codrops 2025 highlights many WebGL implementations — but these are portfolio showcases, not app interfaces users return to daily. A floating particle field on the browse grid page would be both a performance risk and a design collision: it competes with the card art, which is the intended focus.

### Full-Bleed Animated Gradient Backgrounds

The "mesh gradient" trend (animated organic blobs of color flowing behind content) is a 2023-2024 visual cliché now. On a cream background, a flowing gradient immediately reads as "startup landing page template." It would undermine the catalog authority of the editorial direction. The grain texture produces depth without color intrusion.

### Card 3D Tilt on Mouse (CSS perspective-origin)

Every anime card collector app that has tried to feel premium has added 3D card tilt. It is now genericized. The Karuta direction is spotlight, not tilt. Tilt reads as novelty; spotlight reads as curation.

### Blob/Organic Shape Morphing as Background Decoration

Fluid blob shapes — whether CSS border-radius morphing or SVG path morphing — belong to a color-forward, playful aesthetic (Figma's landing pages, fintech app onboarding). On a cream editorial background, they read as imported from a different aesthetic universe. The organic quality in Karuta comes from texture (grain), timing (float randomization), and curvature in easing functions — not from literal organic shapes.

### Scrolljacking (replacing native scroll with JS scroll)

GSAP ScrollSmoother and Lenis are popular in the award-winning portfolio space because portfolios are demonstration pieces. Karuta is a utility users open repeatedly to track their collection. Scrolljacking introduces jank on mid-range devices and breaks expected browser behavior. Scroll-triggered animations (ScrollTrigger) are correct; scroll interception is not.

### Neon Glow Text

The luminous quality in Karuta's editorial direction should come from surface effects on cards (spotlight, foil), not from glowing typography. Text-shadow or box-shadow glow on the page's type turns the editorial register into cyberpunk-adjacent. The one exception is the hairline rule glow, which is so subtle it reads as warmth rather than neon.

### Cursor Trail Effects

Custom cursor trails — where dots or shapes follow the cursor across the page — are appropriate for interactive art experiences and design portfolios. For a catalog app, they are visual clutter that interferes with reading and scanning. The spotlight hover achieves cursor-reactive effect without polluting the canvas.

### Heavy Spring Physics on Browse Grid Cards

The Eduardo Bodak / Framer Motion spring physics approach — where cards bounce elastically on hover — feels tactile and premium in a portfolio context. On a 20-card browse grid where a user is scanning for a title, elastic card bouncing on hover is friction. Karuta's hover is elevation-only (translateY -4px, shadow increase). The stamp animation on favorites is the sole spring-physics element because its thematic weight earns the tactility.

### Animated Page Header Text (Kinetic Typography)

Variable font weight animations cycling on headline text — where "COLLECTION" pulses from thin to bold — is a 2025 kinetic typography trend that is already overused in SaaS landing pages. Karuta's headlines are static and authoritative. They do not move. Their presence is their power. Animating them on scroll or on hover undermines the editorial gravity.

---

## Recommended Design Direction Update

### The Amended Direction: "Living Archive"

The base direction ("Collector's Catalog, Tokyo Edition") is retained in full. The amendment is specifically about depth and aliveness.

The editorial layer is the foundation: cream paper, Cormorant Garamond serifs, hanko red as the sole accent, strong typographic hierarchy, restrained spacing, item-first cards.

The "living" layer is additive and strictly bounded:

**1. The paper has texture.** The grain overlay (opacity: 0.04) is always on. It is the simplest and most impactful change — cost near zero, quality signal very high.

**2. The shrine breathes.** Floating cards with randomized GSAP timing (5-8s cycles, 8px amplitude) are active on shrine cards only. This designates the shrine as a distinct, animated zone within an otherwise static interface.

**3. Rare cards have surfaces.** The spotlight hover makes all browse cards feel physical. Legendary and Epic cards have additional surface treatments (foil, glow ring) that scale with rarity without being gaudy.

**4. Text surfaces on scroll.** Page titles and section headers arrive via word-reveal clip-path masks using GSAP SplitText. This replaces fade-in as the default reveal. It is the editorial equivalent of a chapter title being typeset as you read it.

**5. Transitions are directional.** Clip-path curtain reveals replace cross-fade page transitions. Content is uncovered, not materialized.

**6. Numbers are instruments.** Monospaced readouts for counts and stats make data feel measured rather than incidental.

These six additions are the complete futuristic-organic layer. Anything beyond them tips into excess.

The governing principle: a user who opens Karuta daily should feel the aliveness as warmth and depth, not as spectacle. The animations should be the kind of thing a user notices only when they are gone — not the kind of thing they notice when they are present.

---

## Implementation Priority Order

1. **Grain texture** (body::after pseudo-element, inline SVG filter) — 30 minutes, zero dependency, maximum quality-per-effort ratio
2. **Word reveal animation** (GSAP SplitText, now free) — apply to all page title and section header elements
3. **Spotlight hover** (CSS custom properties + JS mousemove handler) — apply to all card components
4. **Clip-path page transition** — replace current opacity fade in page transition wrapper
5. **Shrine card float** (CSS keyframes, randomized via JSX CSS variables) — shrine page only
6. **Legendary foil overlay** (CSS conic-gradient, `color-dodge`, hue-rotate animation) — rarity system extension
7. **Epic gold shimmer** — rarity system extension
8. **Hairline rule glow** — minor CSS update to existing rule components
9. **Monospaced stat readouts** — typography update to count/year/stat displays
10. **Topographic SVG** — shrine page and empty states only, lowest urgency

Items 1-4 are high-impact and should be implemented first. Items 5-7 extend the rarity and shrine systems. Items 8-10 are refinements.

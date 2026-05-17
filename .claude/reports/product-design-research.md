# Product Design Research

## Product Type Assumption

Karuta is a light-mode, editorial-forward anime collection tracker. Users collect anime titles as stylized "cards" with rarity tiers, organize them across three shelf states (Watching / Plan to Watch / Watched), and maintain a favorites "shrine" gallery. The app is named after the Japanese card game karuta, and the visual identity anchors on a hanko red accent (#c41e3a) on cream/off-white backgrounds.

This is not a typical anime tracking app. Its design goal is to feel like a premium collector's publication — closer to a Christie's catalog or a Japanese design annual than to Crunchyroll, MAL, or AniList. The product is positioned for the discerning collector who cares about presentation, not just tracking.

---

## Comparable Products / Interfaces

### Christie's / Sotheby's Auction Houses

Christie's and Sotheby's present collectibles through an austere, image-first catalog grid with clear lot structure: title, category, attribution, date, and estimate. Each lot is visually foregrounded. Sotheby's lots appear as rectangular cards featuring photography against neutral backgrounds — standardized enough for rapid scanning, premium enough to convey exclusivity through restraint alone.

**What works:**

- Items are the hero. The interface serves the artifact, not itself.
- Neutral warm-white backgrounds prevent color from fighting with item imagery.
- Strong information hierarchy: large image, clean title in serif, supporting metadata in a smaller weight below.
- Filtering lives behind a collapsed header, not a permanent sidebar. The grid breathes.
- Item detail pages use a wide-image + narrow-text column split — catalog layout that predates the web.

**What to adapt:**

- Use the same item-first card philosophy. Anime card artwork dominates; metadata is subordinate.
- Apply the catalog-entry pattern to the browse grid: anime title in a clean serif, rarity tier as a discreet label, not a garish badge.
- Detail page layout: large card art left, metadata right.

**What not to copy:**

- The verbosity of auction metadata (provenance, condition notes, estimate ranges). None of this applies.
- Do not make Karuta feel transactional. It is a personal collection, not a sale.

---

### Phillips Design Auction (phillips.com)

Phillips is the most design-forward of the major auction houses. Their Design department blends editorial essays, video content, and catalog grids — combining curatorial voice with functional browsing. Date numbers and typographic section anchors work as layout elements, not just labels.

**What works:**

- Editorial sections with typographic anchors (section numbers, dates, titles as layout objects).
- A mix of browse and editorial content rather than pure functionality.
- Publication dates used as visual rhythm without decorative flourish.

**What to adapt:**

- Use typographic section dividers for the shelf views: large numbered or labeled section breaks that act as layout anchors, not headings.
- The favorites shrine gallery can have a curatorial editorial dimension.

**What not to copy:**

- Dense textual overlaps from print catalog traditions.
- Dark photography-heavy editorial sections.

---

### MoMA Design Store (store.moma.org)

MoMA's design system is built on a tight 12-column grid, left-aligned type, and white space as a primary structural element. Products are arranged in a clean, scannable card grid where quality speaks for itself. The "curated selection" positioning elevates what would otherwise be a standard e-commerce grid.

**What works:**

- Museum shop as curatorial context: items are selected, not just listed. This is exactly the positioning Karuta should project.
- Multi-column card grid with consistent card sizes and generous whitespace between items.
- Typography handles hierarchy entirely — no reliance on color bands or decorative gradients.
- "Designer attribution" below product names parallels how Karuta could surface the anime studio name.

**What to adapt:**

- Apply the "curated selection" framing to Karuta's browse grid.
- Use typography alone (size, weight, style) to establish card hierarchy — no busy visual decoration.

**What not to copy:**

- MoMA uses humanist sans-serif (Franklin Gothic) as its primary face. Karuta should lead with serif for headings.

---

### Figurama Collectors (figurama-collectors.com)

A boutique premium anime figure collector site. Their stated philosophy "RETAIL IS DETAIL" captures an authentic collector sensibility. Despite being in the same category space, the execution defaults to conventional e-commerce.

**What works:**

- Product imagery dominates. Each item has visual breathing room.
- Sparse use of color outside of imagery.
- Status indicators (LOW STOCK, SOLD OUT) as small overlaid badges — functional without being loud.

**What to adapt:**

- Rarity indicators for Karuta cards should follow the quiet-overlay pattern rather than full-color-fill badge designs.
- Restraint signals premium. Collector sites that feel premium avoid busy promotional elements.

**What not to copy:**

- The standard e-commerce grid. Karuta's browse should feel editorial, not retail.
- "ADD TO CART" button patterns. Karuta is about organizing and owning, not purchasing.

---

### AniList / MyAnimeList (for inversion reference only)

Both AniList and MAL are dark-mode-dominant, data-dense, and visually conventional for the anime tracking space. AniList is the more modern of the two — clean card grid, decent information hierarchy — but it still reads unmistakably as "anime tracker" rather than "collector publication."

**What not to copy:**

- Dark mode as default.
- Dense data rows with five or more metadata fields per card.
- The same cover-art-in-a-grid approach every anime tracker already uses.
- Low-contrast blue accent systems.
- Banner images across profile pages that make views visually noisy.

**What this tells us:**
The opportunity for Karuta is total visual differentiation. Light backgrounds, serif typography, and a restrained single-color accent are immediate departure signals. A user opening Karuta for the first time should recognize in two seconds that this is not a standard anime app.

---

## Current Web Design Patterns That Fit This Project

### Editorial-Grid Layout with Typographic Anchors

Asymmetric grids where type scale acts as a structural element — large display serif headings become layout objects, not just labels. Magazine-style section breaks use oversized numbers or ruled horizontal lines. This pattern appears in design annuals, museum sites, and luxury brand editorial pages. It is the correct pattern for Karuta's shelf view (where three states divide the collection) and for each page's header zone.

### Item-First Card Design on Light Backgrounds

Premium catalog sites treat imagery as primary and suppress UI chrome. Cards have minimal borders, a light shadow on hover, and generous internal whitespace. The card art becomes the visual anchor. All other information is supporting. This is the opposite of data-dense tracking app card design.

### Single Accent Color on Cream

A confirmed 2024-2025 editorial pattern: one bold accent on a cream/warm-white background, with everything else in deep ink or warm neutral. Red on cream is specifically cited across multiple design references — "tomato-red accents that pop against a cream-colored backdrop while remaining restrained." Red is used as punctuation: for the hanko seal mark, rarity indicators, selected states, and interactive highlights — never as a fill color across large surfaces.

### Skeleton Loading Over Spinners

Current standards (2025 NNGroup research confirms 92% of AI-generated dashboards skip proper loading states) establish that skeleton screens outperform spinners by reducing perceived load time up to 40%. For a card-heavy grid, column-shaped skeletons with the correct proportions match the final content layout. The skeleton color must match the warm palette, never default cold gray.

### Progressive Disclosure for Filters

Rather than a permanent sidebar of filter controls, collapse advanced filters behind an "Advanced" toggle. Show the three most important filters (genre, rarity, status) inline above the grid; hide the rest. This keeps the grid clean and lets the catalog breathe.

### Command Palette / Keyboard Search (Cmd+K)

The Cmd+K palette pattern popularized by Linear, Notion, and Vercel fits premium tool-like apps. For Karuta, a global search that lets collectors find any anime title instantly — filtering by shelf status, rarity, or keyword — is both functionally powerful and signals product sophistication without requiring a dedicated search page.

---

## Layout Inspiration

### App Shell

Minimal top-bar navigation: Karuta logo (hanko mark + wordmark) on the left, navigation items center or right (Browse / Collection / Shrine), search icon on the far right. No persistent sidebar. Mobile: navigation collapses to a bottom tab bar with icons and labels.

### Browse Page Layout

Catalog-style grid with a strong editorial header: large display serif page title, a horizontal rule below it, filter controls as a compact row beneath that, then the grid. Optional: a single "featured" hero slot at the top of the grid — one card displayed at 2x width — mimicking the featured lot opening of an auction catalog section.

### Collection (Shelf) Layout

Three shelf sections stacked vertically: Watching / Plan to Watch / Watched. Each section begins with a large typographic label (shelf name in display serif, large and authoritative), a horizontal rule, a count label ("14 titles"), and then the items in a grid or horizontal scroll row. This mirrors how a physical collector organizes shelves.

Toggle between "shelf view" (horizontal scrolling rows per status) and "grid view" (all items in one grid with status visible as a badge).

### Card Art Detail Page

Split-column layout: left side (approximately 55%) shows the large card art. Right side (45%) shows:

- Anime title in large serif
- Studio attribution in small caps or secondary weight
- Rarity tier as a subtle labeled line (not a badge)
- Synopsis excerpt
- Watch status toggle (three options as a segmented control)
- Add to favorites (hanko red mark)
- User notes field (optional)

This mirrors how Christie's and Phillips present individual lots — image-first, text as support.

### Favorites Shrine Gallery

A visually distinct section — the emotional center of the app. Shrine layout uses a featured grid: one hero card at 2x width at the top, then a 3-col or 4-col standard grid below. Alternatively, a masonry grid with varying card sizes based on favorite ranking. The word "SHRINE" in large italic serif as the page header. This section should feel quieter and more reverential than the browse grid.

### Forms

Add-to-collection modal: clean centered modal, anime title pre-filled or with a large search field, status picker as a segmented control, rarity as a horizontal dot selector (five dots, tap to select). One primary action button in hanko red. No unnecessary fields.

### Modals and Drawers

Card detail opens as a right-side drawer on desktop (480px wide, no page navigation required). On mobile, same content as a bottom sheet filling 85% of screen height.

---

## Component Inspiration

### Cards (Browse Grid)

- White or warm-white card background on cream page background — subtle card separation without harsh borders.
- Card art fills the top 65% of the card, aspect ratio 2:3 (standard anime poster ratio, enforced consistently).
- Rarity tier as a small horizontal dot cluster at the card's bottom left — restrained, not a banner.
- Title in serif below the image, 14-15px, medium weight.
- Studio name in sans-serif at 11px, warm gray.
- On hover: card lifts 4px (translateY(-4px)) with a soft shadow increase. Art subtly scales to 1.02 with overflow: hidden on card. No color change on hover — elevation only.

### Rarity Indicator

Five tiers: Common / Uncommon / Rare / Ultra Rare / Legendary. Display as:

- A small horizontal cluster of 1-5 filled/unfilled dots (5px diameter each, 4px gap).
- Filled dots: hanko red (#c41e3a). Unfilled dots: warm light gray (#D6D0CA).
- Tier label appears in a tooltip on hover after a 400ms delay.
- Never use a full-color background badge for rarity — keep it typographically quiet.

### Shelf Status Badges

Three states: Watching / Plan to Watch / Watched.

- Small pill labels: outline style (1px border + matching text, no fill) on collection view cards.
- Watching = hanko red outline and text. Plan = warm gray outline. Watched = ink/dark outline.
- On card hover in collection view, status pill transitions to a filled state over 200ms.

### Buttons

- Primary: solid hanko red (#c41e3a) fill, white text, 4px border-radius, 14px Inter Medium. Subtle shadow on hover, scale(0.97) on press.
- Secondary: transparent fill, 1px hanko red border, hanko red text. Hover: light red tint background (rgba(196,30,58,0.06)).
- Ghost / tertiary: no border, dark ink text. Underline appears on hover.
- Disabled: 40% opacity on any variant. No alternate color. cursor-not-allowed.
- All buttons: 200ms ease-out transition on all interactive properties.

### Tables / List View (Collection Power View)

- Borderless table with alternating very-light row tints (#F7F3EE / #FFFFFF).
- Columns: Cover thumbnail (small square crop), Title (Cormorant Garamond medium), Studio (Inter small), Rarity (dots), Status (pill), Year (monospaced number).
- Row hover: subtle 1px bottom border accent in hanko red.
- Column headers: small caps, Inter, tracked letter-spacing.

### Filters

- Inline filter row above the grid: Genre pills (horizontal scrollable), Rarity filter (dot selectors), Sort dropdown.
- "Advanced Filters" expands a panel below with additional controls.
- Active filters: small dismissible tags below the filter row in accent-light background (rgba(196,30,58,0.06)).

### Search

- Global search: centered overlay (command palette style). Full-width input with magnifying glass glyph. Results as a list with card thumbnail, title, shelf status, and rarity.
- Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux).
- Group results by shelf status: Watching, Watched, Plan, Not in collection.

### Tabs

- Shelf tabs (Watching / Plan / Watched): clean underline tabs.
- Active state: 2px hanko red underline, no background fill. Text in Cormorant Garamond Medium.
- Inactive: Inter Regular, warm gray.

### Status Indicators

- Watching: a small animated pulse dot in hanko red (subtle breathing animation, 2s loop, low amplitude — not jarring).
- Plan to Watch: static warm gray dot.
- Watched: static hanko red check glyph.

### Toasts

- Appear at bottom-center of the viewport (mobile-forward positioning).
- White card with 1px warm gray border. Small semantic icon, short message, 3s auto-dismiss.
- Entrance: slide up from y: 16 to y: 0 with opacity 0 to 1, 200ms.
- No colorful backgrounds — preserves the palette discipline.

### Modals

- Backdrop: white at 60% opacity with blur (not dark overlay — preserve the light mood).
- Modal card: white (#FFFFFF), 1px border (#E4DDD6), 8px border-radius, soft shadow.
- Title in Cormorant Garamond, body in Inter, primary action in hanko red.

### Drawers

- Right-side drawer for card detail on desktop, 480px width, slides in from right.
- Bottom sheet on mobile, 85% screen height, spring entrance.
- Backdrop: semi-transparent white with backdrop-filter blur — not dark.

---

## Motion / Interaction Inspiration

The 2025 design consensus is clear: motion should be brief, purposeful, and invisible when not needed. Heavy animation signals product immaturity. Premium tools (Linear, Vercel, Notion) use motion that users feel but cannot consciously describe.

### Card Hover

- Duration: 200ms ease-out.
- Transform: translateY(-4px) with shadow increase.
- Art scale: transform scale(1.02) on the card image only, with overflow: hidden on card container.
- No color change on hover. Elevation only. This is the mark of restraint.

### Page Transitions

- Route changes: quick fade-in (opacity 0 to 1, y: 8 to y: 0, 150ms ease-out).
- Using Motion (formerly Framer Motion) AnimatePresence wrapping page content.
- No sliding or flipping transitions — they introduce disorientation without purpose.

### Grid / List Reveal

- Staggered entrance when a grid or shelf loads: cards animate from opacity 0 and y: 12 to resting position, with a 40ms stagger between cards.
- Total reveal time for a full grid should not exceed 600ms. Stagger must never make the UI feel slow.

### Modal / Drawer Transitions

- Modal entrance: scale(0.97) + opacity 0 to scale(1) + opacity 1, 180ms ease-out.
- Drawer entrance: translateX(100%) to translateX(0), 220ms ease-out.
- Exits: reverse of entrance, 150ms — slightly faster than entrance. This is a polished detail that users feel without noticing.

### Loading Skeletons

- Pulsing shimmer (left-to-right gradient sweep, CSS animation).
- Skeleton shape matches exact card dimensions — same aspect ratio, same title line, same metadata line.
- Skeleton base color: #E8E3DC (warm gray matching the cream palette — never cold gray).

### Active / Pressed States

- Buttons: scale(0.97) on mousedown, returns to scale(1) on mouseup. 80ms, no delay.
- Cards: no press scale (cards are navigational links, not interactive buttons).

### Status Change Animation

- When shelf status changes (Plan to Watch -> Watching), the status pill text cross-fades in place over 200ms. The pill does not disappear and reappear — the text transitions in-place.
- A brief hanko red pulse on the card border (200ms, fades out) can serve as positive confirmation.

### Hanko Stamp Animation (Favorites)

- When a user adds an anime to the favorites shrine, a small hanko seal SVG stamps onto the card: scale from 0.6 to 1.05 to 1.0 (spring overshoot) over 300ms.
- This is the single "delight" animation in the product. Its thematic resonance with the product name earns it a place. Use it only here.

### Mobile Touch Feedback

- Cards on mobile: instant background lightening on touchstart (no long-press delay).
- Bottom sheet: spring entrance with low damping (bouncy but controlled).

---

## Mobile UX Inspiration

### Navigation

- Bottom tab bar with 4-5 tabs: Browse, Collection, Shrine, Search, Profile.
- Tabs use icons with text labels below. Active tab: hanko red icon and label.
- Safe area insets respected. Tab bar appears above system home indicator.

### Browse Grid

- 2-column card grid. Cards maintain 2:3 aspect ratio.
- Filter controls collapse behind a floating "Filter" button at bottom-right, opening a bottom sheet filter panel.

### Card Detail

- Full-screen on mobile. Card art fills the top 45-50% of the screen. Details below in a scrollable container.
- Watch status toggle as a segmented control positioned at the bottom within thumb reach.

### Shrine Gallery

- Single column on mobile, or 2-col with one featured item at full width at top.

### Collection View

- Horizontal scrolling rows per shelf status work well on mobile (familiar pattern from streaming apps) as long as section headers and item counts are visible at the row top.

### Empty States

- Custom typographic treatments in serif italic — not generic "no items here" icon illustrations.
- "Your shelves are bare. Start collecting." with a faint hanko seal as a watermark behind the text.
- Treated as a designed moment, not an afterthought.

### Gestures

- Left swipe on a collection card: reveals quick actions (Change Status, Remove from collection).
- Standard iOS and Android expectation for list items. Optional but expected in a polished mobile product.

---

## Premium Details Worth Adding

### Skeleton Loading

Every loading view has a skeleton state. The card grid skeleton displays 6-8 skeleton cards in the exact grid layout they will occupy, with pulsing warm-gray shimmer (#E8E3DC). Shelf view skeleton shows three section headers and skeleton card rows below each.

### Designed Empty States

- Browse page with no search results: large serif message, secondary line, and a "Clear filters" action.
- Collection (empty shelf): an invitation framed in editorial language, not a generic empty icon.
- Shrine (no favorites yet): "Nothing sacred yet." — short, editorial tone that matches the product's voice.

### Subtle Card Hover Depth

Elevation-only hover (translateY + shadow increase). This is the difference between a premium product and one that was styled with Tailwind hover defaults.

### Command / Search Palette

A Cmd+K global search overlay. Results grouped by shelf status. Instantly keyboard-navigable (arrow keys, Enter). Closes on Escape. This is a recognizable signal from premium SaaS tools.

### Sticky Section Headers in Collection View

As the user scrolls through a long shelf, a sticky header keeps the shelf label ("WATCHING — 14") visible at the top. Maintains orientation without requiring the user to scroll back up.

### Animated Status Changes

When shelf status changes, animate the pill cross-fade. The card does not refresh or re-render visibly. The transition is in-place and instant-feeling.

### Strong Page Headers

Every page has a deliberate header zone: large display serif title, a horizontal rule, and then page content begins. This is the chapter-opening pattern from editorial design. Never use generic breadcrumbs or pill-badge page titles.

### Consistent Card Proportions

All anime cards use the same 2:3 aspect ratio. This creates visual rhythm across the grid — the rhythm of a real catalog. Mixing aspect ratios breaks the grid's authority.

### Hanko Seal Mark as Favorites Feedback

The single thematically grounded "delight" moment. One purposeful animation. Not gratuitous.

### Polished Disabled States

40% opacity only. No alternate color for disabled elements. cursor-not-allowed. This is the premium approach — subtle, not garish.

### Useful Tooltips

Rarity dot cluster: tooltip shows tier name (Common / Rare / Legendary) after a 400ms hover delay. Status pulse dot: tooltip shows "Currently watching." Never show tooltips instantly — the delay prevents tooltip flicker on mouse movement.

### Table Density Toggle

In list view: toggle between compact (tighter row height) and comfortable (more spacing). Linear's density controls are the reference for this pattern.

### Page-Level Item Count

Below the page header or section header: "124 titles" or "14 watching" in small Inter text. Gives collectors a sense of collection scope without making it the headline.

---

## Things To Avoid

### Dark Mode as Primary Direction

AniList and Crunchyroll already own dark-mode anime aesthetics. A dark Karuta immediately reads as "another anime app." The light editorial direction is the brand differentiator. Build the light mode fully before considering a dark mode variant.

### Neon or Vibrant Color Systems

No blue accent systems. No genre color tags in red/blue/green. No background gradients. The palette is cream + ink + one hanko red. Any additional color erodes the palette's authority.

### Glassmorphism as Decoration

Frosted glass UI on a light cream background becomes muddy and illegible. Use clean white modals with soft borders. Reserve backdrop-filter blur for modal overlays only.

### Generic Sans-Serif Headings

Using Inter or system-ui for headings makes Karuta read as a generic SaaS dashboard. The entire editorial identity lives in serif display headings. This is non-negotiable for the direction.

### Overloaded Cards

Cards that show poster, title, studio, year, genre tags, rarity, and status simultaneously are not cards — they are data rows. Browse cards should show: art + title + rarity dots only. Let the hover state or detail view reveal more.

### Animations Longer Than 300ms That Block Interaction

Any animation that delays a user action is friction. Page transitions over 200ms feel sluggish. Stagger animations with totals over 600ms for a full grid are too slow.

### Rounded Corners Everywhere

Heavy border-radius (16px+) on cards makes the product feel like a mobile app or a generic Bootstrap template. Use 4px border-radius on cards, 6-8px on modals. Restraint signals sophistication.

### Red as Fill Color on Large Surfaces

Hanko red (#c41e3a) on a primary button is correct. Hanko red as a section background, header fill, or large color block breaks the calm editorial mood and reads as aggressive. Red is punctuation, not wallpaper.

### Inconsistent Spacing

Visual rhythm in premium products comes from a strict spacing scale. Use 4px as the base unit. Never eyeball spacing.

### Spinner Loading States

Styled spinners or HTML-default loading indicators are not appropriate for this product level. Skeleton states only.

---

## Recommended Design Direction

### The Direction: "Collector's Catalog, Tokyo Edition"

This direction combines two source references:

1. The visual authority of a Western auction house catalog (Christie's / Phillips): serif typography, item-first grid, restrained palette, editorial structure.
2. The aesthetic precision of Japanese graphic design: whitespace as intentional structure, a single bold accent (hanko red), typographic confidence, cultural authenticity without cliche.

The result should immediately feel unlike both mainstream anime apps (dark, dense, data-heavy) and generic SaaS products (sans-serif, blue accent, shadow-card-everywhere). A user landing on Karuta should recognize it as something different within two seconds of seeing it.

---

### Typography System

**Display / Headings: Cormorant Garamond (Google Fonts — free, no license required)**

Use for: page titles, section headers, card titles at display sizes, the word "KARUTA" wherever used as a display element.

Styles: Cormorant Garamond Light Italic for large display headings (48px+) — this creates the editorial magazine headline feel. Cormorant Garamond Medium for section labels and subheadings (20-32px).

Rationale: Cormorant Garamond's razor-sharp serifs and extreme high-contrast strokes project exactly the refined, expensive quality the direction requires. It reads as premium at display sizes without a licensing fee. It pairs cleanly with Inter for UI text. Its high stroke contrast — extreme difference between thick and thin — has tonal resonance with East Asian calligraphic tradition, connecting the typeface choice to the product's cultural identity without being literal about it.

Do not use Cormorant Garamond below 18px — it is a display face and becomes difficult to read at small sizes.

**Fallback Display: Playfair Display (Google Fonts)**

If Cormorant Garamond feels too delicate at medium heading sizes (20-32px), Playfair Display at Medium weight is the next option. Playfair has larger x-height and wider counters — more legible at smaller heading sizes while maintaining the editorial serif character.

**UI / Body Text: Inter (Google Fonts)**

Use for: navigation labels, card metadata, filter controls, form labels, body text, all UI copy.

Weight usage: Regular (400) for body and captions, Medium (500) for UI labels and subheadings, SemiBold (600) for active navigation items and button text.

Inter is the rational, functional counterpart to Cormorant's expressiveness. The contrast between these two voices — humanist clarity vs. classical elegance — is the typographic identity of the product.

**Optional: JetBrains Mono or similar monospace**

For numerical displays (episode counts, year, item counts in tables). Monospace creates clean vertical alignment in tabular contexts.

---

### Color Palette

**Page Background: `#F7F3EE`**
Warm cream. Not pure white, not yellow. The paper color of a high-quality catalog or museum publication. Warm enough to feel intentional; light enough to ensure readable text contrast.

**Card / Modal Surface: `#FFFFFF`**
Pure white cards on cream background create subtle but legible card definition without needing borders. The contrast separates surfaces without visual noise.

**Section Background / Alternating: `#F0EBE3`**
Slightly darker warm cream for section panels, table row alternation, or sidebar panels.

**Primary Text / Ink: `#1A1614`**
Near-black with a warm (very subtly reddish-brown) undertone, not cold black. Matches the cream paper feel.

**Secondary Text: `#6B6560`**
Warm gray for metadata, captions, secondary labels, studio names.

**Tertiary Text / Placeholder: `#A8A29E`**
Light warm gray for placeholder text, disabled labels, helper text.

**Accent / Hanko Red: `#C41E3A`**
The singular accent. Used for: primary CTA buttons, active tab underlines, rarity dots (filled), selected states, the hanko seal mark, favorites indicator, the "Watching" status pulse dot, and any interactive element that confirms a meaningful action.

**Accent Hover / Pressed: `#A01830`**
Darkened hanko red for button hover and pressed states — signals depth without adding visual noise.

**Accent Background Tint: `rgba(196, 30, 58, 0.06)`**
A barely-perceptible red tint for selected card backgrounds, active filter pill backgrounds, or secondary button hover. Extremely subtle.

**Border / Divider: `#E4DDD6`**
Warm light gray for horizontal rules, card borders when needed, table row dividers, modal borders.

**Skeleton Loading: `#E8E3DC`**
Warm skeleton base color. Never use cold gray (#e0e0e0) — it breaks the warm palette immediately.

**Card Shadow Resting: `rgba(26, 22, 20, 0.08)` at y:2px blur:8px**

**Card Shadow Hover: `rgba(26, 22, 20, 0.14)` at y:6px blur:16px**

---

### Grid and Layout Specifics

**Base unit:** 4px

**Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128px

**Page max-width:** 1280px

**Page side padding:** 48px desktop, 24px tablet, 16px mobile

**Card grid gutter:** 24px desktop, 16px tablet, 12px mobile

**Browse grid columns:** 4 at 1280px, 3 at 960px, 2 at 600px, 1 at 375px

**Card aspect ratio:** 2:3 — standard anime poster / book cover. Enforce this consistently. Mixing aspect ratios destroys catalog rhythm.

**Page header zone:** Every page allocates 120-160px of vertical space at the top for: display serif page title (48-72px), a 1px horizontal rule, optional subtitle or count label in Inter. This is the editorial chapter-opening pattern.

**Section dividers:** Large (48-64px) serif type or typographic anchors (e.g., "01 — WATCHING" or simply "WATCHING" in 48px Cormorant Garamond Light) between shelf sections. Inspired by JAGDA design annual formats and Phillips catalog structure.

---

### Key UI Pattern Decisions by View

**Browse Grid:** Catalog grid, 4-col desktop. Item-first cards. Hover = elevation only. Rarity dots, no badges. Optional featured hero slot at top. Filter row above grid (compact, collapsible advanced filters).

**Collection View:** Three typographic sections stacked. Large labeled header per section. Items in 4-col grid or horizontal scroll row. Status badges as outline pills. Sticky section headers on scroll.

**Card Detail:** Split layout — art left, details right. Clean sans-serif metadata. Status as segmented control. Hanko stamp animation on favorite.

**Shrine Gallery:** Featured grid with hero card. Masonry or uniform grid below. Editorial serif page header. Quieter visual mood than browse.

**Empty States:** Custom serif italic typographic messages. Short, editorial voice. Faint hanko seal watermark as design element.

**Loading:** Skeleton cards in exact grid proportions. Warm-gray shimmer. No spinners.

**Navigation:** Top bar desktop, bottom tab bar mobile. Cmd+K search palette. Nav labels in Inter Medium.

**Motion:** 150-220ms transitions. Elevation-based hover. Stagger grid reveals (40ms offset, max 600ms total). Spring stamp animation for favorites only. Nothing blocks interaction. Nothing exceeds 300ms for UI responses.

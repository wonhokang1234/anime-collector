# Anime Card Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the hover disconnect on the collect button, round button corners, and redesign the card's visual language to match the washi/hanko/ink aesthetic.

**Architecture:** Three files change. `globals.css` gets a one-line button corner fix. `card.css` gets all new CSS rules (stripe, separator, inner border, back face, genre tags, shimmer keyframe). `anime-card.tsx` gets a structural refactor — the collect button moves from outside `innerRef` to inside `card-face card-front`, plus new rarity stripe and 集 stamp elements.

**Tech Stack:** React 19, Next.js (App Router), TypeScript, Tailwind CSS 4, GSAP 3, CSS custom properties. No automated tests for UI components — verify visually in browser.

**Spec:** `docs/superpowers/specs/2026-04-20-anime-card-revamp-design.md`

---

### Task 1: Round the hanko button corners

**Files:**

- Modify: `src/app/globals.css:89-118`

This is a one-line change. `hanko-btn` is used everywhere (browse Collect button, auth forms, empty-collection CTA). Rounding to 6px is intentional and site-wide.

- **Step 1: Open globals.css and find the `.hanko-btn` rule**

```
src/app/globals.css  —  look for `.hanko-btn {`
Currently: border-radius: 2px;
```

- **Step 2: Change border-radius**

In `src/app/globals.css`, inside `.hanko-btn { ... }`:

```css
/* Before */
border-radius: 2px;

/* After */
border-radius: 6px;
```

- **Step 3: TypeScript check**

```bash
cd /Users/wonhokang/anime-collector && npx tsc --noEmit
```

Expected: no output (clean).

- **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "style: round hanko-btn corners to 6px"
```

---

### Task 2: Card CSS — rarity stripe, separator, inner border, back face, genre tags

**Files:**

- Modify: `src/components/card/card.css`

Add everything in one commit so the CSS and JSX land together and the card is never in a half-styled state. No new files — all additions go into the existing `card.css`.

**Context on CSS custom properties:** `--rarity-separator-color` is set on `.rarity-common`, `.rarity-uncommon`, etc. (which live on `.anime-card`). The info panel div is a descendant, so it inherits the variable via `var(--rarity-separator-color)` in its `borderTop` inline style. `--ink-0`, `--ink-1`, `--ink-2` are defined on `:root` in `globals.css` — available everywhere.

- **Step 1: Add rarity separator color custom properties**

Append to `src/components/card/card.css` after the existing `.anime-card { ... }` block (after line ~19):

```css
/* Separator color inherited by info panel border-top */
.rarity-common     { --rarity-separator-color: rgba(161, 161, 170, 0.25); }
.rarity-uncommon   { --rarity-separator-color: rgba(52, 211, 153, 0.25); }
.rarity-rare       { --rarity-separator-color: rgba(96, 165, 250, 0.25); }
.rarity-epic       { --rarity-separator-color: rgba(251, 191, 36, 0.25); }
.rarity-legendary  { --rarity-separator-color: rgba(232, 121, 249, 0.3); }
```

- **Step 2: Add the inner border to .card-face**

Find `.card-face { ... }` (currently has `position: absolute; inset: 0; backface-visibility: hidden; border-radius: 16px; overflow: hidden;`). Add `box-shadow`:

```css
.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(244, 228, 192, 0.08);
}
```

- **Step 3: Add rarity stripe rules and card-foil-shimmer keyframe**

Append after the `.anime-card-compact .card-shine, ...` block (after the existing compact overrides):

```css
/* === Rarity Stripe — 2px color band at top of card-front === */
.rarity-stripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 3;
  pointer-events: none;
}
.rarity-common   .rarity-stripe { background: #a1a1aa; }
.rarity-uncommon .rarity-stripe { background: linear-gradient(90deg, #059669, #34d399, #059669); }
.rarity-rare     .rarity-stripe { background: linear-gradient(90deg, #2563eb, #60a5fa, #2563eb); }
.rarity-epic     .rarity-stripe { background: linear-gradient(90deg, #b45309, #fbbf24, #b45309); }
.rarity-legendary .rarity-stripe {
  background: linear-gradient(
    90deg,
    #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444
  );
  background-size: 200% 100%;
  animation: card-foil-shimmer 4s linear infinite;
}

/* foil-shimmer is defined in shelf.css (shelf-only scope); define independently for card pages */
@keyframes card-foil-shimmer {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}
```

- **Step 4: Update .card-back-content background**

Find `.card-back-content { background: linear-gradient(180deg, #18181b 0%, #0f0f12 100%); ... }` and replace the background line:

```css
.card-back-content {
  background: linear-gradient(180deg, var(--ink-2) 0%, var(--ink-0) 100%);
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
```

- **Step 5: Update .genre-tag palette**

Find `.genre-tag { ... }` and replace the color/background/border values:

```css
.genre-tag {
  font-size: 0.65rem;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(244, 228, 192, 0.06);
  color: rgba(244, 228, 192, 0.5);
  border: 1px solid rgba(244, 228, 192, 0.08);
  white-space: nowrap;
}
```

- **Step 6: TypeScript check**

```bash
cd /Users/wonhokang/anime-collector && npx tsc --noEmit
```

Expected: no output (clean). CSS changes don't affect TS.

- **Step 7: Commit**

```bash
git add src/components/card/card.css
git commit -m "style: add rarity stripe, inner border, ink palette to card CSS"
```

---

### Task 3: anime-card.tsx — structural refactor and new visual elements

**Files:**

- Modify: `src/components/card/anime-card.tsx`

This task has the most changes. Read the full file before starting. Here is every change needed:

**Change A** — Add `<div className="rarity-stripe" aria-hidden />` as the first child of `card-face card-front`.

**Change B** — Add the 集 collected stamp inside `card-face card-front`, after the `card-image-wrapper` div, before the info panel. Absolute positioned, visible only when `collected === true`.

**Change C** — Update the info panel `div`: remove `bg-zinc-900/95 backdrop-blur-sm` from `className`, add inline `style` prop.

**Change D** — Remove the `{!isCompact && <div className="mt-2 h-8" aria-hidden />}` spacer.

**Change E** — Add the collect button inside the info panel with `!isCompact && onCollect && !collected` guard.

**Change F** — Delete the entire external button block outside `innerRef` (the `{!isCompact && onCollect && ( <div className="absolute bottom-3 left-3 right-3 z-50" ... > ... </div> )}` block and its comment).

- **Step 1: Read the current file**

```bash
# Confirm current structure before editing
head -n 405 /Users/wonhokang/anime-collector/src/components/card/anime-card.tsx | tail -n 60
```

Locate the external button block (the comment says "Action button — OUTSIDE the 3D transform entirely") — this entire block gets deleted in Step 6.

- **Step 2: Replace the card-face card-front opening and add the rarity stripe**

Find this opening line of `card-face card-front`:

```tsx
<div
  className="card-face card-front bg-zinc-900 flex flex-col"
  style={{ pointerEvents: isFlipped ? "none" : "auto" }}
>
  {/* Image area */}
  <div className="card-image-wrapper flex-1 relative group/image">
```

Replace with:

```tsx
<div
  className="card-face card-front bg-zinc-900 flex flex-col"
  style={{ pointerEvents: isFlipped ? "none" : "auto" }}
>
  {/* Rarity color stripe — 2px bar at top of card */}
  <div className="rarity-stripe" aria-hidden />

  {/* Image area */}
  <div className="card-image-wrapper flex-1 relative group/image">
```

- **Step 3: Add the 集 collected stamp after the image wrapper closing tag**

Find the closing tag of `card-image-wrapper` followed by the info bar comment:

```tsx
            </div>

            {/* Info bar pinned to bottom — marked no-flip */}
```

Replace with:

```tsx
            </div>

            {/* Collected ownership stamp — hanko seal in top-right corner */}
            {collected && (
              <div
                aria-label="Collected"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 15,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--hanko)",
                  color: "var(--washi)",
                  fontFamily: "var(--font-jp)",
                  fontSize: 14,
                  fontWeight: 900,
                  borderRadius: 2,
                  transform: "rotate(-5deg)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(244,228,192,0.15)",
                  pointerEvents: "none",
                }}
              >
                集
              </div>
            )}

            {/* Info bar pinned to bottom — marked no-flip */}
```

- **Step 4: Update the info panel div (remove Tailwind background classes, add inline style)**

Find:

```tsx
            <div
              data-no-flip
              className="relative z-10 px-3 py-2.5 bg-zinc-900/95 backdrop-blur-sm"
            >
```

Replace with:

```tsx
            <div
              data-no-flip
              className="relative z-10 px-3 py-2.5"
              style={{
                background: "linear-gradient(to top, rgba(5,7,16,0.98), rgba(10,6,4,0.92))",
                backdropFilter: "blur(4px)",
                borderTop: "1px solid var(--rarity-separator-color, rgba(244,228,192,0.12))",
              }}
            >
```

- **Step 5: Remove the h-8 spacer, add the collect button inside the info panel**

Find:

```tsx
              {/* Reserved space where the overlay action button sits */}
              {!isCompact && <div className="mt-2 h-8" aria-hidden />}
```

Replace with:

```tsx
              {/* Collect button — inside 3D transform, moves with card on hover */}
              {!isCompact && onCollect && !collected && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => onCollect()}
                    className="hanko-btn w-full"
                    style={{ padding: "0.5rem 0.9rem", fontSize: "0.7rem" }}
                  >
                    Collect
                  </button>
                </div>
              )}
```

- **Step 6: Delete the external button block**

Find and delete this entire block (comment + JSX, approximately 50 lines):

```tsx
      {/* Action button — OUTSIDE the 3D transform entirely. Sits in normal 2D
          stacking on top of the card, so clicks reliably land here and never
          leak through to the card's flip handler. */}
      {!isCompact && onCollect && (
        <div
          className="absolute bottom-3 left-3 right-3 z-50"
          style={{
            opacity: isFlipped ? 0 : 1,
            pointerEvents: isFlipped ? "none" : "auto",
            transition: "opacity 0.2s ease",
          }}
        >
          {collected ? (
            <div
              className="flex w-full items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-[.22em] backdrop-blur-sm"
              style={{
                border: "1px solid rgba(244,228,192,.35)",
                background: "rgba(10,6,4,.6)",
                color: "var(--washi)",
                fontFamily: "var(--font-display)",
                borderRadius: 2,
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-4 w-4 items-center justify-center"
                style={{
                  background: "var(--hanko)",
                  color: "var(--washi)",
                  fontFamily: "var(--font-jp)",
                  fontSize: 9,
                  fontWeight: 900,
                  borderRadius: 1,
                  transform: "rotate(-4deg)",
                }}
              >
                集
              </span>
              Collected
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onCollect()}
              className="hanko-btn w-full"
              style={{ padding: "0.5rem 0.9rem", fontSize: "0.7rem" }}
            >
              Collect
            </button>
          )}
        </div>
      )}
```

After deletion, the closing of `perspectiveRef` should be the last `</div>` before `);`:

```tsx
        </div>  {/* closes anime-card-inner */}
      </div>    {/* closes cardRef / .anime-card */}
    </div>      {/* closes perspectiveRef — last div in the component */}
  );
}
```

- **Step 7: TypeScript check**

```bash
cd /Users/wonhokang/anime-collector && npx tsc --noEmit
```

Expected: no output (clean). Common error to watch for: `JSX element has no corresponding closing tag` — means a bracket/tag was mismatched during the edits. Count the `<div>` / `</div>` pairs in card-front if this occurs.

- **Step 8: Commit**

```bash
git add src/components/card/anime-card.tsx
git commit -m "feat: move collect button inside 3D transform, add rarity stripe and 集 stamp"
```

---

### Task 4: Visual verification

**Files:** None — browser-only verification.

Start the dev server and open both pages at 1280px width, then at 375px.

- **Step 1: Start the dev server**

```bash
cd /Users/wonhokang/anime-collector && npm run dev
```

Open `http://localho1st:3000/browse` in a browser.

- **Step 2: Verify hover cohesion on browse page**

Hover over any card. Confirm:

- Card artwork, info panel, and Collect button ALL lift and scale together as one unit
- No button stays behind when the card moves
- **Step 3: Verify button corners**

The Collect button should have clearly rounded corners (~6px radius), visibly more rounded than before.

- **Step 4: Verify rarity stripe**

Each rarity tier should show a thin colored bar at the very top of the card:

- Common → gray
- Uncommon → green gradient
- Rare → blue gradient  
- Epic → gold gradient
- Legendary → animated rainbow
- **Step 5: Verify info panel colors**

The info panel at the bottom of each card should use dark ink tones (no more zinc-900 gray). The separator line at the top of the panel should match the rarity color (subtle).

- **Step 6: Verify collected state in browse**

Collect an anime. Confirm:

- A small vermilion 集 stamp appears in the top-right of the card, rotated slightly
- No "Collected" bar at the bottom
- Hovering the collected card: stamp moves WITH the card (it's inside the 3D transform)
- **Step 7: Open collection page**

Navigate to `http://localhost:3000/collection`. Confirm:

- All collected cards show the 集 stamp
- No Collect button visible (correct — collection page never passes `onCollect`)
- Card flip still works: click any card, it rotates to the back face
- Back face uses ink colors (dark brownish-black, not zinc-gray)
- Genre tags on back face have washi-cream tint
- **Step 8: Check compact variant at 375px**

Resize browser to 375px wide. Browse page should show compact cards (180×260). Confirm:

- Rarity stripe appears on compact cards
- Inner border visible on compact cards
- No button, no flip on compact — correct
- No regressions in the grid layout
- **Step 9: Verify flip interaction (non-regression)**

On a non-compact card (1280px): click the card artwork area. It should flip to show the back face. Click again — flips back. The Collect button click should NOT trigger a flip (it's inside `data-no-flip`).
# Shelf Drag-and-Drop — Design Spec

**Date:** 2026-04-17
**Status:** Approved

## Overview

Add drag-and-drop as an alternative to the existing spine move menu. Users can drag a manga spine from any shelf section and drop it onto a tab (Watching / Plan to Watch / Watched) or the 秘 seal (Favorites) to move it between sections. The existing move menu remains as a secondary interaction.

## Library

**@dnd-kit** — `@dnd-kit/core` + `@dnd-kit/utilities`. Modern React DnD library with hook-based API, touch support, keyboard accessibility, and full control over drag overlay rendering.

## Drag Activation

- **Mouse:** `PointerSensor` with `activationConstraint: { delay: 250, tolerance: 5 }`. The 250ms delay distinguishes drag intent from clicks (spine menu, episode stepper). The 5px tolerance allows slight movement during the delay without canceling.
- **Touch:** Same `PointerSensor` handles touch events with the same delay.
- **Keyboard:** `KeyboardSensor` with default coordinate getter. Allows accessible drag via Space/Enter to pick up, arrow keys to move between drop zones, Space/Enter to drop, Escape to cancel.

## Drag Overlay

When a spine is picked up:

- The **original spine** dims to `opacity: 0.3` ("ghost") in the list.
- A **drag overlay** renders near the cursor: the spine's cover art as a thumbnail (80px wide, aspect ratio preserved), at `opacity: 0.7`, rotated `3deg`, with `box-shadow: 0 8px 24px rgba(0,0,0,0.4)`. Uses `border-radius: 4px` and `pointer-events: none`.
- The overlay is rendered via dnd-kit's `<DragOverlay>` component, which portals to the document body for correct stacking.

## Drop Targets

### Scene Tabs (Watching / Plan / Watched)

Each tab in `SceneTabs` becomes a drop zone via `useDroppable`. The droppable `id` maps to the category:

| Tab | Droppable ID | Category |
| --- | --- | --- |
| Watching | `drop-watching` | `"watching"` |
| Plan | `drop-plan` | `"plan_to_watch"` |
| Watched | `drop-watched` | `"watched"` |

**Hover feedback:** When a dragged spine hovers over a tab (`isOver === true`):
- Tab border color transitions to `rgba(244, 228, 192, 0.6)` (bright washi).
- Background gains a subtle glow: `box-shadow: inset 0 0 12px rgba(244, 228, 192, 0.1)`.
- The tab's count badge pulses briefly (scale 1.0 → 1.1, 200ms).

**Same-section drop:** If the spine is dropped on the tab for its current section, no-op — no `updateCategory` call, no animation.

### 秘 Seal (Favorites)

The 秘 seal button becomes a drop zone via `useDroppable` with `id: "drop-favorite"`.

**During any active drag** (`isDragging` from `DndContext`):
- Seal opacity transitions from `0.35` to `0.7` (half-reveal, hinting it's interactive).
- No other visual change at rest-during-drag.

**When hovered** (`isOver === true`):
- Seal opacity goes to `1`.
- `box-shadow: 0 0 12px rgba(196, 30, 58, 0.5)` (warm red glow, same as mouse hover).
- `transform: rotate(2deg)` (same as mouse hover).

**Drop:** Calls `updateCategory(id, "favorite")`.

## Drop Handler

In `page.tsx`, the `DndContext` `onDragEnd` handler:

```
function handleDragEnd(event) {
  const { active, over } = event;
  if (!over) return; // dropped outside any target

  const spineId = active.id;
  const targetMap = {
    "drop-watching": "watching",
    "drop-plan": "plan_to_watch",
    "drop-watched": "watched",
    "drop-favorite": "favorite",
  };
  const newCategory = targetMap[over.id];
  if (!newCategory) return;

  // Find the spine to check if it's already in this category
  const item = items.find(i => i.id === spineId);
  if (!item || item.category === newCategory) return;

  updateCategory(spineId, newCategory);
}
```

This uses the same `updateCategory` from the Zustand store — no new data layer needed.

## Drop Success Feedback

On successful drop (category changed):
- The target tab's count badge does a GSAP scale-pop: `scale: 1 → 1.15 → 1`, duration 200ms, `ease: "power2.out"`.
- The spine disappears from the current scene (Zustand state update triggers re-render) and appears in the new section next time the user switches to that tab.

## Dragging State

While any drag is active:
- `document.body.style.cursor = "grabbing"` (set in `onDragStart`, cleared in `onDragEnd`).
- The active scene container gets `filter: saturate(0.85)` to subtly desaturate, drawing focus to the overlay and drop targets.
- The `FavoritesReveal` animation toggle is disabled during drag (`animating` guard is already in place; this additionally blocks the seal's `onClick` during drag so it only acts as a drop target).

## Cancel

- **Escape key:** dnd-kit handles this natively — cancels the drag, spine snaps back, no state change.
- **Drop outside targets:** `onDragEnd` fires with `over === null` — no-op.
- **Original position restore:** The ghost spine returns to full opacity when drag ends (no animation needed, React re-render handles it).

## Accessibility

- Keyboard users can pick up a spine with Space/Enter, navigate between drop zones with arrow keys, drop with Space/Enter, cancel with Escape.
- Screen reader announcements via dnd-kit's built-in `announcements` prop on `DndContext`:
  - Pick up: "[Title] picked up from [section]"
  - Over target: "Over [target section name]"
  - Drop: "[Title] moved to [target section name]"
  - Cancel: "[Title] dropped, returned to [section]"

## Files

| File | Action | Purpose |
| --- | --- | --- |
| `package.json` | Modify | Add `@dnd-kit/core` and `@dnd-kit/utilities` |
| `src/app/shelf/page.tsx` | Modify | Wrap content in `DndContext`, add `DragOverlay`, `onDragStart`/`onDragEnd` handlers |
| `src/components/shelf/manga-spine.tsx` | Modify | Add `useDraggable` hook, ghost opacity while dragging |
| `src/components/shelf/scene-tabs.tsx` | Modify | Add `useDroppable` to each tab, hover glow feedback |
| `src/app/shelf/shelf.css` | Modify | Add `.tab-drop-hover` and `.spine-dragging` styles |

## Interactions & Edge Cases

- The existing move menu on each spine remains fully functional — drag-and-drop is additive.
- If a spine is in hero mode (first Watching spine), it can still be dragged. If dropped into another section, the next Watching spine becomes the hero.
- The episode stepper buttons on hero spines must not trigger drag — the 250ms delay + 5px tolerance handles this since stepper clicks are quick taps.
- During the favorites fusuma reveal (gallery is open), drag-and-drop is not active — the `DndContext` only wraps the shelf content, not the gallery overlay.
- Dragging is disabled while the fusuma animation is in progress (same `animating` guard).

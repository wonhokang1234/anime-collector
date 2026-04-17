# Shelf Drag-and-Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag-and-drop to the shelf so users can drag manga spines onto tabs (or the 秘 seal) to move them between sections.

**Architecture:** dnd-kit wraps the shelf content in a `DndContext`. Each `MangaSpine` becomes draggable via `useDraggable`. Each tab in `SceneTabs` and the 秘 seal in `page.tsx` become droppable via `useDroppable`. The `onDragEnd` handler calls the existing `updateCategory` from the Zustand store — no new data layer needed.

**Tech Stack:** @dnd-kit/core, @dnd-kit/utilities, GSAP (existing), React/Next.js

---

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| `package.json` | Modify | Add @dnd-kit/core and @dnd-kit/utilities |
| `src/components/shelf/manga-spine.tsx` | Modify | Add `useDraggable`, ghost opacity while dragging, accept `isDragging` prop |
| `src/components/shelf/scene-tabs.tsx` | Modify | Add `useDroppable` to each tab, hover glow feedback, accept `isDragActive` prop |
| `src/app/shelf/page.tsx` | Modify | Wrap in `DndContext`, sensors, `DragOverlay`, handlers, droppable seal |
| `src/app/shelf/shelf.css` | Modify | Add `.tab-drop-hover`, `.spine-ghost`, `.scene-desaturate` styles |

---

### Task 1: Install @dnd-kit dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install @dnd-kit/core @dnd-kit/utilities
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('@dnd-kit/core'); require('@dnd-kit/utilities'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Verify TypeScript can resolve the types**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: No errors (clean compile).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @dnd-kit/core and @dnd-kit/utilities for shelf drag-and-drop"
```

---

### Task 2: Add drag-and-drop CSS styles

**Files:**
- Modify: `src/app/shelf/shelf.css`

- [ ] **Step 1: Add the new styles at the end of shelf.css**

Append after the existing `.moon-slit` block:

```css
/* ── Drag-and-drop ── */
.spine-ghost {
  opacity: 0.3 !important;
  pointer-events: none;
}

.tab-drop-hover {
  border-color: rgba(244, 228, 192, 0.6) !important;
  box-shadow: inset 0 0 12px rgba(244, 228, 192, 0.1);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.scene-desaturate {
  filter: saturate(0.85);
  transition: filter 0.2s;
}

.seal-drag-hint {
  opacity: 0.7 !important;
  transition: opacity 0.2s;
}

.seal-drop-hover {
  opacity: 1 !important;
  box-shadow: 0 0 12px rgba(196, 30, 58, 0.5) !important;
  transform: rotate(2deg) !important;
  transition: opacity 0.15s, box-shadow 0.15s, transform 0.15s;
}
```

- [ ] **Step 2: Verify TypeScript still compiles**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add src/app/shelf/shelf.css
git commit -m "feat: add drag-and-drop CSS styles for shelf"
```

---

### Task 3: Make MangaSpine draggable

**Files:**
- Modify: `src/components/shelf/manga-spine.tsx`

The `MangaSpine` component needs to:
1. Accept an optional `isDragging` prop (controlled by the parent via dnd-kit state).
2. Use `useDraggable` from `@dnd-kit/core` with `id` set to `item.id`.
3. Apply the `spine-ghost` class when this spine is being dragged.
4. Attach dnd-kit's `listeners` and `attributes` to the outer div.
5. Attach `setNodeRef` to the outer div.

- [ ] **Step 1: Update the component**

Add import at the top:

```tsx
import { useDraggable } from "@dnd-kit/core";
```

Add `isDragging` to the props interface:

```tsx
interface MangaSpineProps {
  item: CollectedAnime;
  tone: SpineTone;
  hero?: boolean;
  isDragging?: boolean;
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}
```

Update the function signature to destructure `isDragging`:

```tsx
export function MangaSpine({
  item,
  tone,
  hero = false,
  isDragging = false,
  onMove,
  onEpisodeChange,
  onRemove,
}: MangaSpineProps) {
```

Add the `useDraggable` hook after the existing `useEffect`:

```tsx
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({ id: item.id });
```

Import `CSS` from `@dnd-kit/utilities` at the top:

```tsx
import { CSS } from "@dnd-kit/utilities";
```

Update the outer `<div>` to attach refs, listeners, attributes, and ghost class:

```tsx
    <div
      ref={setNodeRef}
      className={`relative shrink-0 group/spine ${isDragging ? "spine-ghost" : ""}`}
      style={{
        width,
        transform: CSS.Translate.toString(transform) || (hero ? "translateY(-32px)" : undefined),
        filter: dimmed ? "saturate(.92) brightness(.98)" : undefined,
      }}
      {...listeners}
      {...attributes}
    >
```

Note: When `isDragging` is true AND `hero` is true, the ghost still needs the hero transform. But `CSS.Translate.toString(transform)` returns `null` when there's no active drag transform, so we fall back to the hero translate. When there IS a drag transform, dnd-kit handles positioning — but the real spine becomes a ghost and the overlay renders separately, so the transform from dnd-kit on the original is fine.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/manga-spine.tsx
git commit -m "feat: make MangaSpine draggable with useDraggable hook"
```

---

### Task 4: Make SceneTabs droppable

**Files:**
- Modify: `src/components/shelf/scene-tabs.tsx`

Each tab becomes a drop zone. The component needs:
1. `useDroppable` on each tab with IDs `drop-watching`, `drop-plan`, `drop-watched`.
2. A `tab-drop-hover` class applied when a dragged spine hovers over the tab.
3. An `isDragActive` prop so tabs can show they're valid targets during any drag.

- [ ] **Step 1: Update the component**

Replace the entire file with:

```tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import type { SpineTone } from "./manga-spine";

interface SceneTabsProps {
  active: SpineTone;
  counts: Record<SpineTone, number>;
  onChange: (tone: SpineTone) => void;
  isDragActive?: boolean;
}

const TABS: {
  tone: SpineTone;
  kanji: string;
  label: string;
  droppableId: string;
}[] = [
  { tone: "watching", kanji: "鑑賞中", label: "Watching", droppableId: "drop-watching" },
  { tone: "plan", kanji: "予定", label: "Plan", droppableId: "drop-plan" },
  { tone: "watched", kanji: "完了", label: "Watched", droppableId: "drop-watched" },
];

export function SceneTabs({ active, counts, onChange, isDragActive }: SceneTabsProps) {
  return (
    <div
      role="tablist"
      className="flex gap-0 rounded-t-2xl border-b-2 border-white/10 bg-black/40 p-2"
    >
      {TABS.map(({ tone, kanji, label, droppableId }) => (
        <DroppableTab
          key={tone}
          tone={tone}
          kanji={kanji}
          label={label}
          droppableId={droppableId}
          isActive={tone === active}
          count={counts[tone]}
          onChange={onChange}
          isDragActive={isDragActive}
        />
      ))}
    </div>
  );
}

function DroppableTab({
  tone,
  kanji,
  label,
  droppableId,
  isActive,
  count,
  onChange,
  isDragActive,
}: {
  tone: SpineTone;
  kanji: string;
  label: string;
  droppableId: string;
  isActive: boolean;
  count: number;
  onChange: (tone: SpineTone) => void;
  isDragActive?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });

  return (
    <button
      ref={setNodeRef}
      key={tone}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onChange(tone)}
      className={`relative flex-1 px-3 py-3 text-center transition-colors ${
        isActive
          ? "bg-gradient-to-b from-[var(--indigo-mid)] to-[var(--indigo-deep)] text-[var(--washi)]"
          : "text-[var(--washi)]/50 hover:text-[var(--washi)]/80"
      } ${isOver && isDragActive ? "tab-drop-hover" : ""}`}
      style={{
        border: isActive
          ? "1px solid rgba(244,228,192,.4)"
          : "1px solid rgba(244,228,192,.08)",
        borderBottom: isActive
          ? "2px solid var(--hanko)"
          : "1px solid rgba(244,228,192,.08)",
        fontFamily: "var(--font-display)",
      }}
    >
      <div
        className="text-[9px] opacity-70"
        style={{ fontFamily: "var(--font-jp)" }}
      >
        {kanji}
      </div>
      <div className="text-[11px] font-bold tracking-[.2em]">
        {label.toUpperCase()}
      </div>
      {count > 0 && (
        <div
          className="absolute -top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            background: "var(--hanko)",
            color: "var(--washi)",
            fontFamily: "var(--font-display)",
            transform: "rotate(-4deg)",
            boxShadow: "0 2px 3px rgba(0,0,0,.4)",
          }}
        >
          {count}
        </div>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: Clean compile.

- [ ] **Step 3: Commit**

```bash
git add src/components/shelf/scene-tabs.tsx
git commit -m "feat: make SceneTabs droppable with useDroppable hook"
```

---

### Task 5: Wire up DndContext, DragOverlay, and droppable seal in page.tsx

**Files:**
- Modify: `src/app/shelf/page.tsx`

This is the orchestration task. The page needs:
1. `DndContext` wrapping the shelf content (inside FavoritesReveal children).
2. `PointerSensor` and `KeyboardSensor` with the spec'd activation constraints.
3. `onDragStart` — sets `activeDragId` state, sets body cursor to grabbing.
4. `onDragEnd` — maps `over.id` to category, calls `updateCategory`, clears state, restores cursor.
5. `DragOverlay` — renders a cover-art thumbnail for the actively-dragged spine.
6. The 秘 seal becomes droppable via `useDroppable`.
7. The scene container gets `scene-desaturate` class during drag.
8. Pass `isDragging` to the active `MangaSpine` and `isDragActive` to `SceneTabs`.

- [ ] **Step 1: Update page.tsx**

Replace the entire `page.tsx` with the updated version. Key changes from the current file:

Add imports at the top:

```tsx
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import Image from "next/image";
```

Inside `ShelfPage`, add drag state and sensors:

```tsx
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const activeDragItem = activeDragId
    ? items.find((i) => i.id === activeDragId) ?? null
    : null;
```

Add the drag handlers:

```tsx
  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
    document.body.style.cursor = "grabbing";
  }

  function handleDragEnd(event: DragEndEvent) {
    document.body.style.cursor = "";
    setActiveDragId(null);

    const { active, over } = event;
    if (!over) return;

    const targetMap: Record<string, AnimeCategory> = {
      "drop-watching": "watching",
      "drop-plan": "plan_to_watch",
      "drop-watched": "watched",
      "drop-favorite": "favorite",
    };
    const newCategory = targetMap[over.id as string];
    if (!newCategory) return;

    const item = items.find((i) => i.id === active.id);
    if (!item || item.category === newCategory) return;

    updateCategory(item.id, newCategory);
  }
```

Extract the seal button into a `DroppableSeal` component (defined inside the file, after the `Stat` component):

```tsx
function DroppableSeal({
  onToggle,
  isDragActive,
}: {
  onToggle: () => void;
  isDragActive: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "drop-favorite" });

  const sealClass = isOver && isDragActive
    ? "seal-drop-hover"
    : isDragActive
      ? "seal-drag-hint"
      : "";

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => {
        if (!isDragActive) onToggle();
      }}
      title="秘蔵 — Hidden Collection"
      aria-label="Toggle hidden collection"
      className={`flex items-center justify-center transition-all ${sealClass}`}
      style={{
        width: 32,
        height: 32,
        borderRadius: 2,
        background: "var(--hanko)",
        color: "var(--washi)",
        fontFamily: "var(--font-jp)",
        fontSize: 14,
        fontWeight: 900,
        opacity: sealClass ? undefined : 0.35,
        transform: sealClass ? undefined : "rotate(-4deg)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        if (isDragActive) return;
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "rotate(2deg)";
        e.currentTarget.style.boxShadow = "0 0 12px rgba(196,30,58,0.5)";
      }}
      onMouseLeave={(e) => {
        if (isDragActive) return;
        e.currentTarget.style.opacity = "0.35";
        e.currentTarget.style.transform = "rotate(-4deg)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      秘
    </button>
  );
}
```

Update the return JSX to wrap the `FavoritesReveal` children content in `DndContext`:

```tsx
      <FavoritesReveal
        ref={revealRef}
        favorites={favorites}
        onMove={updateCategory}
        onEpisodeChange={updateEpisode}
        onRemove={remove}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SceneTabs
            active={tone}
            counts={counts}
            onChange={setTone}
            isDragActive={!!activeDragId}
          />
          <div className={activeDragId ? "scene-desaturate" : ""}>
            <Scene
              tone={tone}
              items={grouped[tone]}
              activeDragId={activeDragId}
              onMove={updateCategory}
              onEpisodeChange={updateEpisode}
              onRemove={remove}
            />
          </div>
          <DragOverlay dropAnimation={null}>
            {activeDragItem && activeDragItem.image_url ? (
              <div
                style={{
                  width: 80,
                  aspectRatio: "3/4",
                  borderRadius: 4,
                  overflow: "hidden",
                  opacity: 0.7,
                  transform: "rotate(3deg)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}
              >
                <Image
                  src={activeDragItem.image_url}
                  alt={activeDragItem.title}
                  width={80}
                  height={107}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </FavoritesReveal>
```

Replace the old seal `<button>` in the header with:

```tsx
          <DroppableSeal
            onToggle={() => revealRef.current?.toggle()}
            isDragActive={!!activeDragId}
          />
```

Also add the `AnimeCategory` import at the top (it's already imported as a type from `@/lib/types` via the `CollectedAnime` import path, but needs to be explicit for the `targetMap` type annotation):

```tsx
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
```

Remove the now-unused `type CollectedAnime` import from the existing import line if it was standalone, and merge it into the above.

- [ ] **Step 2: Update Scene to pass isDragging to MangaSpine**

In `src/components/shelf/scene.tsx`, add `activeDragId` prop:

```tsx
interface SceneProps {
  tone: SpineTone;
  items: CollectedAnime[];
  activeDragId?: string | null;
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}
```

Update the function signature:

```tsx
export function Scene({
  tone,
  items,
  activeDragId,
  onMove,
  onEpisodeChange,
  onRemove,
}: SceneProps) {
```

Update the `MangaSpine` rendering to pass `isDragging`:

```tsx
            <MangaSpine
              key={item.id}
              item={item}
              tone={tone}
              hero={tone === "watching" && idx === 0}
              isDragging={item.id === activeDragId}
              onMove={onMove}
              onEpisodeChange={onEpisodeChange}
              onRemove={onRemove}
            />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: Clean compile.

- [ ] **Step 4: Manual test**

Open `http://localhost:3000/shelf` in a browser. Test:
1. Click and hold a spine for 250ms — it should become draggable with cover thumbnail overlay.
2. Drag over a different tab — tab should highlight with washi glow.
3. Drop on a tab — spine moves to that section (check by switching tabs).
4. Drag over the 秘 seal — seal should glow red, opacity 1.
5. Drop on seal — spine moves to favorites (check by clicking seal to open gallery).
6. Escape during drag — cancels, spine returns.
7. Click spine menu button — should still work (not intercepted by drag).
8. Click episode stepper — should still work (quick clicks under 250ms).

- [ ] **Step 5: Commit**

```bash
git add src/app/shelf/page.tsx src/components/shelf/scene.tsx
git commit -m "feat: wire DndContext, DragOverlay, and droppable seal for shelf drag-and-drop"
```

---

### Task 6: Add drop success feedback animation

**Files:**
- Modify: `src/components/shelf/scene-tabs.tsx`

On successful drop, the target tab's count badge should do a GSAP scale-pop.

- [ ] **Step 1: Add GSAP badge pop to DroppableTab**

Import `useRef`, `useEffect`, and `gsap`:

```tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
```

In the `DroppableTab` component, add a ref to the count badge and an effect that fires when `count` increases:

```tsx
  const badgeRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1 },
        { scale: 1.15, duration: 0.1, ease: "power2.out", yoyo: true, repeat: 1 }
      );
    }
    prevCount.current = count;
  }, [count]);
```

Add `ref={badgeRef}` to the count badge div:

```tsx
      {count > 0 && (
        <div
          ref={badgeRef}
          className="absolute -top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            background: "var(--hanko)",
            color: "var(--washi)",
            fontFamily: "var(--font-display)",
            transform: "rotate(-4deg)",
            boxShadow: "0 2px 3px rgba(0,0,0,.4)",
          }}
        >
          {count}
        </div>
      )}
```

- [ ] **Step 2: Add accessibility announcements to DndContext in page.tsx**

In `page.tsx`, add the `accessibility` prop to `DndContext`:

```tsx
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements: {
              onDragStart({ active }) {
                const item = items.find((i) => i.id === active.id);
                return item ? `${item.title} picked up` : "Item picked up";
              },
              onDragOver({ active, over }) {
                if (!over) return "Not over a drop target";
                const labels: Record<string, string> = {
                  "drop-watching": "Currently Watching",
                  "drop-plan": "Plan to Watch",
                  "drop-watched": "Watched",
                  "drop-favorite": "Favorites",
                };
                return `Over ${labels[over.id as string] ?? "drop target"}`;
              },
              onDragEnd({ active, over }) {
                const item = items.find((i) => i.id === active.id);
                const title = item?.title ?? "Item";
                if (!over) return `${title} dropped, returned to shelf`;
                const labels: Record<string, string> = {
                  "drop-watching": "Currently Watching",
                  "drop-plan": "Plan to Watch",
                  "drop-watched": "Watched",
                  "drop-favorite": "Favorites",
                };
                const target = labels[over.id as string];
                return target ? `${title} moved to ${target}` : `${title} dropped`;
              },
              onDragCancel({ active }) {
                const item = items.find((i) => i.id === active.id);
                return `${item?.title ?? "Item"} drag cancelled`;
              },
            },
          }}
        >
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: Clean compile.

- [ ] **Step 4: Manual test**

1. Drag a spine to a different tab — the badge should pop (scale 1 → 1.15 → 1).
2. With a screen reader or browser accessibility tools, verify announcements appear in the live region.

- [ ] **Step 5: Commit**

```bash
git add src/components/shelf/scene-tabs.tsx src/app/shelf/page.tsx
git commit -m "feat: add drop success badge animation and accessibility announcements"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Library: @dnd-kit/core + @dnd-kit/utilities → Task 1
- [x] Drag activation: PointerSensor delay 250ms tolerance 5, KeyboardSensor → Task 5
- [x] Drag overlay: 80px cover thumbnail, opacity 0.7, rotate 3deg, shadow → Task 5
- [x] Ghost: original spine opacity 0.3 → Task 2 (CSS) + Task 3 (isDragging prop)
- [x] Tab drop zones: drop-watching/plan/watched → Task 4
- [x] Tab hover feedback: washi glow → Task 2 (CSS) + Task 4
- [x] 秘 seal droppable: drop-favorite, opacity transitions → Task 5
- [x] Drop handler: targetMap, same-section no-op → Task 5
- [x] Body cursor grabbing → Task 5
- [x] Scene desaturate during drag → Task 2 (CSS) + Task 5
- [x] Cancel: Escape native, outside drop no-op → handled by dnd-kit + Task 5
- [x] Badge pop on drop success → Task 6
- [x] Accessibility announcements → Task 6
- [x] Seal onClick disabled during drag → Task 5 (DroppableSeal)
- [x] Existing move menu untouched → no changes to menu code
- [x] Hero spine draggable → Task 3 (all spines get useDraggable)
- [x] Episode stepper not triggering drag → 250ms delay handles quick taps

**Placeholder scan:** No TBD/TODO/placeholders found.

**Type consistency:** `SpineTone`, `AnimeCategory`, `CollectedAnime`, `activeDragId`, `isDragging`, `isDragActive` — all consistent across tasks.

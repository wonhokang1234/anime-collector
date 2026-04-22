"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import type { SpineTone } from "./manga-spine";
import { PosterCard } from "./poster-card";
import { SceneBackdrop } from "./scene-backdrop";

interface SceneProps {
  tone: SpineTone;
  items: CollectedAnime[];
  activeDragId?: string | null;
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

const EMPTY_COPY: Record<SpineTone, { kanji: string; title: string; body: string }> = {
  watching: {
    kanji: "灯",
    title: "Nothing active",
    body: "Pick a title from Plan and bump its first episode to light this shelf.",
  },
  plan: {
    kanji: "未読",
    title: "Nothing planned yet",
    body: "Collect anime on Browse and they land here by default.",
  },
  watched: {
    kanji: "完",
    title: "No completed titles yet",
    body: "Finishing an episode-tracked show archives it here automatically.",
  },
};

export function Scene({
  tone,
  items,
  activeDragId,
  onMove,
  onEpisodeChange,
  onRemove,
}: SceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Cross-fade when the active tab changes
  useEffect(() => {
    if (!rootRef.current) return;
    const tween = gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.22, ease: "power1.out" }
    );
    return () => { tween.kill(); };
  }, [tone]);

  // Stagger-in cards whenever the visible section changes
  useEffect(() => {
    if (!listRef.current || items.length === 0) return;
    const cards = Array.from(listRef.current.children) as HTMLElement[];
    // Capture for onComplete closure in case DOM changes before tween completes
    const tween = gsap.fromTo(
      cards,
      { opacity: 0, y: 32, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        stagger: { each: 0.08, from: "start" },
        ease: "back.out(1.5)",
        // Clean up GSAP-managed inline styles so PosterCard's own
        // hover/rotation transforms aren't fighting residual values.
        onComplete: () => { gsap.set(cards, { clearProps: "y,scale,opacity" }); },
      }
    );
    return () => { tween.kill(); };
  }, [tone]); // re-run when section changes so new tab's cards animate in

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    const copy = EMPTY_COPY[tone];
    return (
      <div ref={rootRef}>
        <SceneBackdrop tone={tone}>
          <div className="flex h-[320px] flex-col items-center justify-center px-6 text-center">
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background:  "var(--washi)",
                color:       "var(--hanko)",
                fontFamily:  "var(--font-jp)",
                fontSize:    20,
                fontWeight:  900,
                boxShadow:   "0 2px 6px rgba(0,0,0,.5)",
              }}
              aria-hidden
            >
              {copy.kanji}
            </div>
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--washi)" }}
            >
              {copy.title}
            </h3>
            <p
              className="mt-1 max-w-sm text-sm"
              style={{ color: "rgba(244,228,192,.6)" }}
            >
              {copy.body}
            </p>
          </div>
        </SceneBackdrop>
      </div>
    );
  }

  // ── Watching: large featured hero + horizontal scroll of secondary cards ───
  if (tone === "watching") {
    const [hero, ...rest] = items;
    return (
      <div ref={rootRef}>
        <SceneBackdrop tone={tone}>
          {/* Watching label — top-left, subtle */}
          <div
            aria-hidden
            className="absolute top-4 left-8 z-20 text-[9px] uppercase tracking-[.3em] pointer-events-none select-none"
            style={{ fontFamily: "var(--font-display)", color: "rgba(244,228,192,.35)" }}
          >
            Now Watching
          </div>

          <div
            ref={listRef}
            className="shelf-scroll flex items-end gap-5 overflow-x-auto px-8 pb-8"
            style={{ paddingTop: 52 }}
          >
            {/* Hero — featured, larger, episode controls attached */}
            <PosterCard
              key={hero.id}
              item={hero}
              tone={tone}
              featured
              isDragging={hero.id === activeDragId}
              onMove={onMove}
              onEpisodeChange={onEpisodeChange}
              onRemove={onRemove}
            />

            {rest.length > 0 && (
              <>
                {/* Visual divider between hero and the queue */}
                <div
                  aria-hidden
                  className="shrink-0 self-stretch"
                  style={{
                    width: 1,
                    marginInline: 4,
                    background: "linear-gradient(180deg, transparent 10%, rgba(244,228,192,.18) 40%, rgba(244,228,192,.18) 60%, transparent 90%)",
                  }}
                />
                {rest.map((item) => (
                  <PosterCard
                    key={item.id}
                    item={item}
                    tone={tone}
                    isDragging={item.id === activeDragId}
                    onMove={onMove}
                    onEpisodeChange={onEpisodeChange}
                    onRemove={onRemove}
                  />
                ))}
              </>
            )}
          </div>
        </SceneBackdrop>
      </div>
    );
  }

  // ── Plan: collage — scattered photos with seeded tilt ─────────────────────
  // ── Watched: archival row — dimmed, completion marks ──────────────────────
  return (
    <div ref={rootRef}>
      <SceneBackdrop tone={tone}>
        <div
          ref={listRef}
          className="shelf-scroll flex items-end gap-5 overflow-x-auto pb-8"
          style={{
            paddingTop:   tone === "plan" ? 44 : 36,
            // Extra horizontal padding for plan so tilted card edges don't clip
            paddingLeft:  tone === "plan" ? 52 : 32,
            paddingRight: tone === "plan" ? 52 : 32,
          }}
        >
          {items.map((item) => (
            <PosterCard
              key={item.id}
              item={item}
              tone={tone}
              isDragging={item.id === activeDragId}
              onMove={onMove}
              onEpisodeChange={onEpisodeChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SceneBackdrop>
    </div>
  );
}

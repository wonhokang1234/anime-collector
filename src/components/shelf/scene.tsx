"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DURATION, EASE } from "@/lib/motion";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import type { SpineTone } from "@/lib/types";
import { PosterCard } from "./poster-card";
import { SceneBackdrop } from "./scene-backdrop";
import { EmptyState } from "@/components/ui/empty-state";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SceneProps {
  tone: SpineTone;
  items: CollectedAnime[];
  activeDragId?: string | null;
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

const EMPTY_COPY: Record<
  SpineTone,
  { kanji: string; title: string; body: string }
> = {
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
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [scrollIndex, setScrollIndex] = useState(0);

  // Track horizontal scroll position for the mobile dots indicator
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const handleScroll = () => {
      const snapChild =
        container.querySelector<HTMLElement>(".poster-card-snap");
      const cardWidth = snapChild
        ? snapChild.offsetWidth
        : container.scrollWidth / Math.max(items.length, 1);
      const index = Math.round(container.scrollLeft / cardWidth);
      setScrollIndex(Math.max(0, Math.min(index, items.length - 1)));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [items.length, tone]);

  // Cross-fade when the active tab changes
  useEffect(() => {
    if (!rootRef.current) return;
    const tween = gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: DURATION.base, ease: EASE.out },
    );
    return () => {
      tween.kill();
    };
  }, [tone]);

  // Stagger-in cards whenever the visible section changes
  useEffect(() => {
    if (!listRef.current || items.length === 0) return;
    const cards = Array.from(listRef.current.children) as HTMLElement[];
    // Capture for onComplete closure in case DOM changes before tween completes
    const tween = gsap.fromTo(
      cards,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: DURATION.base,
        stagger: { each: 0.035, from: "start" },
        ease: EASE.out,
        delay: 0.15,
        // Clean up GSAP-managed inline styles so PosterCard's own
        // hover/rotation transforms aren't fighting residual values.
        onComplete: () => {
          gsap.set(cards, { clearProps: "opacity,transform" });
        },
      },
    );
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: stagger fires on tab switch only, not on every item add
  }, [tone]);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    const copy = EMPTY_COPY[tone];
    return (
      <div ref={rootRef}>
        <SceneBackdrop tone={tone}>
          <EmptyState
            icon={copy.kanji}
            title={copy.title}
            description={copy.body}
            className="h-[320px] py-0"
          />
        </SceneBackdrop>
      </div>
    );
  }

  // ── Watching: large featured hero + horizontal scroll of secondary cards ───
  if (tone === "watching") {
    const [hero, ...rest] = items;
    const dotCount = Math.min(items.length, 10);
    return (
      <div ref={rootRef}>
        <SceneBackdrop tone={tone}>
          {/* Watching label — top-left, subtle */}
          <div
            aria-hidden
            className="absolute top-4 left-8 z-20 text-[9px] uppercase tracking-[.3em] pointer-events-none select-none"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--washi-soft)",
            }}
          >
            Now Watching
          </div>

          <div
            ref={listRef}
            className="shelf-scroll flex items-end gap-5 overflow-x-auto px-8 pb-8"
            style={{ paddingTop: 52 }}
          >
            {/* Hero — featured, larger, episode controls attached */}
            <div className="poster-card-snap shrink-0">
              <PosterCard
                item={hero}
                tone={tone}
                featured
                isDragging={hero.id === activeDragId}
                onMove={onMove}
                onEpisodeChange={onEpisodeChange}
                onRemove={onRemove}
              />
            </div>

            {rest.length > 0 && (
              <>
                {/* Visual divider between hero and the queue */}
                <div
                  aria-hidden
                  className="shrink-0 self-stretch"
                  style={{
                    width: 1,
                    marginInline: 4,
                    background:
                      "linear-gradient(180deg, transparent 10%, var(--border-default) 40%, var(--border-default) 60%, transparent 90%)",
                  }}
                />
                {rest.map((item) => (
                  <div key={item.id} className="poster-card-snap shrink-0">
                    <PosterCard
                      item={item}
                      tone={tone}
                      isDragging={item.id === activeDragId}
                      onMove={onMove}
                      onEpisodeChange={onEpisodeChange}
                      onRemove={onRemove}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </SceneBackdrop>

        {/* Mobile scroll dots indicator */}
        {isMobile && dotCount > 1 && (
          <div className="scroll-dots" aria-hidden>
            {Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                className={`scroll-dot${i === scrollIndex ? " active" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Plan: collage — scattered photos with seeded tilt ─────────────────────
  // ── Watched: archival row — dimmed, completion marks ──────────────────────
  const dotCount = Math.min(items.length, 10);
  return (
    <div ref={rootRef}>
      <SceneBackdrop tone={tone}>
        <div
          ref={listRef}
          className="shelf-scroll flex items-end gap-5 overflow-x-auto pb-8"
          style={{
            paddingTop: tone === "plan" ? 44 : 36,
            // Extra horizontal padding for plan so tilted card edges don't clip
            paddingLeft: tone === "plan" ? 52 : 32,
            paddingRight: tone === "plan" ? 52 : 32,
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="poster-card-snap shrink-0">
              <PosterCard
                item={item}
                tone={tone}
                isDragging={item.id === activeDragId}
                onMove={onMove}
                onEpisodeChange={onEpisodeChange}
                onRemove={onRemove}
              />
            </div>
          ))}
        </div>
      </SceneBackdrop>

      {/* Mobile scroll dots indicator */}
      {isMobile && dotCount > 1 && (
        <div className="scroll-dots" aria-hidden>
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              key={i}
              className={`scroll-dot${i === scrollIndex ? " active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

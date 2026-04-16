"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import { MangaSpine, type SpineTone } from "./manga-spine";
import { SceneBackdrop } from "./scene-backdrop";

interface SceneProps {
  tone: SpineTone;
  items: CollectedAnime[];
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
    body: "Pick a book from Plan and bump its first episode to light this shelf.",
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
  onMove,
  onEpisodeChange,
  onRemove,
}: SceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.22, ease: "power1.out" }
    );
  }, [tone]);

  if (items.length === 0) {
    const copy = EMPTY_COPY[tone];
    return (
      <div ref={rootRef}>
        <SceneBackdrop tone={tone}>
          <div className="flex h-[320px] flex-col items-center justify-center px-6 text-center">
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "var(--washi)",
                color: "var(--hanko)",
                fontFamily: "var(--font-jp)",
                fontSize: 20,
                fontWeight: 900,
                boxShadow: "0 2px 6px rgba(0,0,0,.5)",
              }}
              aria-hidden
            >
              {copy.kanji}
            </div>
            <h3
              className="text-lg font-semibold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--washi)",
              }}
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

  return (
    <div ref={rootRef}>
      <SceneBackdrop tone={tone}>
        <div
          className="shelf-scroll flex gap-3 overflow-x-auto px-8 pb-6"
          style={{
            paddingTop: tone === "watching" ? 80 : 28,
            alignItems: "flex-end",
            minHeight: tone === "watching" ? 420 : 320,
          }}
        >
          {items.map((item, idx) => (
            <MangaSpine
              key={item.id}
              item={item}
              tone={tone}
              hero={tone === "watching" && idx === 0}
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

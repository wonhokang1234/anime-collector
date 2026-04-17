"use client";

import { useEffect, useRef } from "react";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import { MangaSpine } from "./manga-spine";

interface FavoritesSceneProps {
  items: CollectedAnime[];
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

export function FavoritesScene({
  items,
  onMove,
  onEpisodeChange,
  onRemove,
}: FavoritesSceneProps) {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = starsRef.current;
    if (!container || container.childElementCount > 0) return;
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("span");
      star.className = "moon-star";
      const size = Math.random() * 2 + 0.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      star.style.animationDuration = `${2 + Math.random() * 4}s`;
      container.appendChild(star);
    }
  }, []);

  return (
    <div
      className="moon-gallery absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, var(--moon-ink-0), var(--moon-ink-1))",
      }}
    >
      {/* Stars */}
      <div ref={starsRef} className="absolute inset-0 pointer-events-none" />

      {/* Moonlight */}
      <span className="moon-pool" aria-hidden />
      <span className="moon-ground" aria-hidden />

      {/* Watermark */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{
          fontFamily: "var(--font-jp)",
          fontSize: "14rem",
          fontWeight: 900,
          color: "rgba(200, 208, 224, 0.03)",
          letterSpacing: "0.1em",
        }}
      >
        秘蔵
      </div>

      {/* Content */}
      <div className="relative z-10 h-full px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <h2
              className="text-xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--moon-silver)",
                letterSpacing: "0.04em",
              }}
            >
              Hidden Collection
            </h2>
            <span
              style={{
                fontFamily: "var(--font-jp)",
                fontSize: "0.65rem",
                color: "var(--moon-silver-dim)",
                letterSpacing: "0.3em",
              }}
            >
              秘蔵
            </span>
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded"
            style={{
              border: "1px solid var(--moon-silver-border)",
              background: "rgba(26, 42, 90, 0.4)",
              color: "var(--moon-silver)",
              fontFamily: "var(--font-display)",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span
              aria-hidden
              className="inline-block w-1.5 h-1.5 rounded-sm"
              style={{
                background: "var(--moon-silver)",
                boxShadow: "0 0 4px rgba(200,208,224,0.4)",
              }}
            />
            {items.length} {items.length === 1 ? "Title" : "Titles"}
          </div>
        </div>

        {/* Spines or empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full"
              style={{
                border: "1px solid var(--moon-silver-border)",
                fontFamily: "var(--font-jp)",
                fontSize: "1.8rem",
                fontWeight: 900,
                color: "var(--moon-silver-dim)",
              }}
            >
              月
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                letterSpacing: "0.08em",
                color: "var(--moon-silver)",
              }}
            >
              Your hidden collection awaits
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--moon-silver-dim)",
                letterSpacing: "0.05em",
              }}
            >
              Mark any title as a favorite from its spine menu
            </p>
          </div>
        ) : (
          <div
            className="shelf-scroll flex gap-3 overflow-x-auto pb-6"
            style={{ paddingTop: 28, alignItems: "flex-end", minHeight: 320 }}
          >
            {items.map((item) => (
              <MangaSpine
                key={item.id}
                item={item}
                tone="watched"
                onMove={onMove}
                onEpisodeChange={onEpisodeChange}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

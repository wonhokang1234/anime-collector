"use client";

import { useState, useRef, useEffect } from "react";
import { AnimeCard } from "@/components/card/anime-card";
import type { CollectedAnime, AnimeCategory } from "@/lib/types";

interface ShelfCardProps {
  item: CollectedAnime;
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

const MOVE_OPTIONS: { category: AnimeCategory; label: string }[] = [
  { category: "watching", label: "Currently Watching" },
  { category: "plan_to_watch", label: "Plan to Watch" },
  { category: "watched", label: "Watched" },
  { category: "favorite", label: "Favorite" },
];

export function ShelfCard({
  item,
  onMove,
  onEpisodeChange,
  onRemove,
}: ShelfCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dismiss menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isWatching = item.category === "watching";
  const total = item.total_episodes || 0;
  const current = item.current_episode || 0;

  const stepEpisode = (delta: number) => {
    const next = Math.max(0, total > 0 ? Math.min(total, current + delta) : current + delta);
    if (next === current) return;
    onEpisodeChange(item.id, next);
    // If bumping to the final episode, quietly move to watched
    if (total > 0 && next === total && item.category !== "watched") {
      onMove(item.id, "watched");
    }
  };

  return (
    <div className="relative shrink-0 group/shelf">
      <AnimeCard
        title={item.title}
        imageUrl={item.image_url}
        score={item.score}
        episodes={item.total_episodes || null}
        variant="compact"
      />

      {/* Corner menu — positioned at card-perspective level, outside tilt zone.
          Shown on card hover or when open. */}
      <div
        ref={menuRef}
        className="absolute top-1.5 right-1.5 z-40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Card options"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex h-7 w-7 items-center justify-center rounded-md bg-zinc-950/80 text-zinc-300 backdrop-blur-sm ring-1 ring-white/10 transition-opacity hover:bg-zinc-900 hover:text-white ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover/shelf:opacity-100"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 w-44 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/60 backdrop-blur-sm ring-1 ring-white/5">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Move to
            </div>
            {MOVE_OPTIONS.map((opt) => {
              const active = item.category === opt.category;
              return (
                <button
                  key={opt.category}
                  type="button"
                  onClick={() => {
                    if (!active) onMove(item.id, opt.category);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                    active
                      ? "bg-zinc-900/60 text-indigo-300"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
            <div className="border-t border-zinc-800" />
            <button
              type="button"
              onClick={() => {
                onRemove(item.id);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Episode stepper — only shown for Currently Watching */}
      {isWatching && (
        <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-1 py-1">
          <button
            type="button"
            aria-label="Previous episode"
            onClick={() => stepEpisode(-1)}
            disabled={current <= 0}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <div className="flex flex-1 flex-col items-center">
            <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
              Episode
            </div>
            <div className="flex items-baseline gap-1 font-mono text-sm text-white tabular-nums">
              <span className="font-semibold">{current}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-500">{total || "?"}</span>
            </div>
            {total > 0 && (
              <div className="mt-0.5 h-0.5 w-full overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-[width] duration-300"
                  style={{ width: `${Math.min(100, (current / total) * 100)}%` }}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Next episode"
            onClick={() => stepEpisode(1)}
            disabled={total > 0 && current >= total}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

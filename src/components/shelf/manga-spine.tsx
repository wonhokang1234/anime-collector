"use client";

import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { DoorMirrorContext } from "./favorites-reveal";
import { getRarityTier } from "@/lib/types";
import type { AnimeCategory, CollectedAnime, RarityTier } from "@/lib/types";

export type SpineTone = "watching" | "plan" | "watched";

interface MangaSpineProps {
  item: CollectedAnime;
  tone: SpineTone;
  hero?: boolean;
  isDragging?: boolean;
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

const RARITY_LETTER: Record<RarityTier, string> = {
  common: "C",
  uncommon: "U",
  rare: "R",
  epic: "E",
  legendary: "L",
};

export function MangaSpine({
  item,
  tone,
  hero = false,
  isDragging = false,
  onMove,
  onEpisodeChange,
  onRemove,
}: MangaSpineProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMirror = useContext(DoorMirrorContext);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({ id: item.id, disabled: isMirror });

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

  const rarity = getRarityTier(item.score ?? 0);
  const width = hero ? 170 : 36;
  const height = hero ? 250 : 220;
  const dimmed = tone === "watched";

  const total = item.total_episodes || 0;
  const current = item.current_episode || 0;
  const stepEpisode = (delta: number) => {
    const next = Math.max(
      0,
      total > 0 ? Math.min(total, current + delta) : current + delta
    );
    if (next === current) return;
    onEpisodeChange(item.id, next);
    if (total > 0 && next === total && item.category !== "watched") {
      onMove(item.id, "watched");
    }
  };

  const transformStyle = transform
    ? CSS.Translate.toString(transform)
    : hero
    ? "translateY(-32px)"
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative shrink-0 group/spine${isDragging ? " spine-ghost" : ""}`}
      style={{
        width,
        transform: transformStyle,
        filter: dimmed ? "saturate(.92) brightness(.98)" : undefined,
      }}
    >
      {hero && (
        <>
          <span className="spine-bookmark" aria-hidden />
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              bottom: -24,
              width: width * 1.4,
              height: 46,
              background:
                "radial-gradient(ellipse, rgba(244,217,138,.55), transparent 65%)",
              filter: "blur(6px)",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      <div
        className="relative overflow-hidden"
        style={{
          width,
          height,
          background: "linear-gradient(180deg,#2a1808,#0a0604)",
          borderRadius: "2px 2px 0 0",
          boxShadow: hero
            ? "0 16px 40px rgba(0,0,0,.7), 0 0 0 1px rgba(244,228,192,.15), inset 0 1px 0 rgba(244,228,192,.35)"
            : "0 10px 22px rgba(0,0,0,.55), inset 1px 0 0 rgba(0,0,0,.45), inset -1px 0 0 rgba(255,220,160,.12)",
        }}
      >
        {/* Rarity top foil */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] spine-foil-${rarity}`}
        />

        {/* Cover art — upper 55% */}
        <div className="absolute top-[3px] left-0 right-0 h-[55%] overflow-hidden">
          {item.image_url && (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes={`${width}px`}
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Washi title band */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "55%",
            bottom: hero ? 44 : 30,
            background:
              "linear-gradient(180deg, rgba(244,228,192,.95), rgba(212,188,138,.9))",
            boxShadow: "inset 0 0 12px rgba(100,60,20,.2)",
            borderTop: "1px solid rgba(42,24,8,.3)",
          }}
        >
          <div
            className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap overflow-hidden"
            style={{
              writingMode: "vertical-rl",
              font: `700 ${hero ? 14 : 10}px/1 var(--font-jp), var(--font-display)`,
              color: "var(--sumi)",
              letterSpacing: ".18em",
              maxHeight: hero ? 140 : 100,
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </div>
        </div>

        {/* Rarity medallion */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{
            bottom: 6,
            width: hero ? 30 : 22,
            height: hero ? 30 : 22,
            borderRadius: "50%",
            background: "var(--washi)",
            border: "1.5px solid var(--hanko)",
            font: `900 ${hero ? 12 : 10}px var(--font-display)`,
            color: "var(--sumi)",
            boxShadow: "0 1px 3px rgba(0,0,0,.5)",
          }}
          aria-label={`Rarity: ${rarity}`}
        >
          {RARITY_LETTER[rarity]}
        </div>

        {/* ✓ overlay for watched tone (non-hero) */}
        {tone === "watched" && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "rgba(244,228,192,.08)" }}
          />
        )}
      </div>

      {/* Episode stepper — hero + watching only */}
      {hero && tone === "watching" && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: -82, width: 200 }}
        >
          <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/50 px-2 py-1.5 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Previous episode"
              onClick={() => stepEpisode(-1)}
              disabled={current <= 0}
              className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 disabled:opacity-30"
              style={{ color: "var(--washi)" }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <div
                className="text-[9px] uppercase tracking-[.2em]"
                style={{
                  color: "rgba(244,228,192,.55)",
                  fontFamily: "var(--font-display)",
                }}
              >
                Episode
              </div>
              <div
                className="font-mono text-sm tabular-nums"
                style={{ color: "var(--washi)" }}
              >
                {current} / {total || "?"}
              </div>
            </div>
            <button
              type="button"
              aria-label="Next episode"
              onClick={() => stepEpisode(1)}
              disabled={total > 0 && current >= total}
              className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 disabled:opacity-30"
              style={{ color: "var(--washi)" }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          {total > 0 && (
            <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-black/60">
              <div
                className="h-full transition-[width] duration-300"
                style={{
                  width: `${Math.min(100, (current / total) * 100)}%`,
                  background:
                    "linear-gradient(90deg, var(--lantern-glow), var(--hanko))",
                  boxShadow: "0 0 6px rgba(244,217,138,.55)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Menu button — hover reveal */}
      <div
        ref={menuRef}
        className="absolute top-1 right-1 z-40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Spine options"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex h-6 w-6 items-center justify-center rounded bg-zinc-950/80 text-zinc-200 backdrop-blur-sm ring-1 ring-white/10 transition-opacity hover:bg-zinc-900 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover/spine:opacity-100"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 w-44 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-sm">
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
                      : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
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
    </div>
  );
}

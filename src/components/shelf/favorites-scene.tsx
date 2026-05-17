"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import { getRarityTier } from "@/lib/types";
import { PosterCard } from "./poster-card";

interface FavoritesSceneProps {
  items: CollectedAnime[];
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const MAX_FEATURED = 3;
const SHRINE_W = 200;
const SHRINE_H = 280;

// ─────────────────────────────────────────────────────────────────────────────
// ShrineCard — spotlit featured card with beam above + water reflection below
// ─────────────────────────────────────────────────────────────────────────────

function ShrineCard({
  item,
  canSwap,
  onSwap,
  beamRef,
  cardRef,
  reflRef,
}: {
  item: CollectedAnime;
  canSwap: boolean;
  onSwap: () => void;
  beamRef: (el: HTMLDivElement | null) => void;
  cardRef: (el: HTMLDivElement | null) => void;
  reflRef: (el: HTMLDivElement | null) => void;
}) {
  const router = useRouter();
  const rarity = getRarityTier(item.score ?? 0);

  return (
    <div
      className="flex flex-col items-center shrink-0"
      style={{ width: SHRINE_W }}
    >
      {/* Spotlight beam zone — GSAP manages opacity for entrance */}
      <div
        ref={beamRef}
        className="relative w-full"
        style={{ height: 150, flexShrink: 0, opacity: 0 }}
        aria-hidden
      >
        <div className="shrine-beam shrine-beam-animated" />
      </div>

      {/* Poster with glow ring */}
      <div
        ref={cardRef}
        className="shrine-ring relative cursor-pointer"
        style={{
          width: SHRINE_W,
          height: SHRINE_H,
          borderRadius: 6,
          overflow: "hidden",
          flexShrink: 0,
          opacity: 0,
        }}
        onClick={() => router.push(`/card/${item.mal_id}`)}
      >
        {/* Rarity foil strip */}
        <div
          className={`absolute top-0 left-0 right-0 z-10 h-[3px] spine-foil-${rarity}`}
        />

        {item.image_url && (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            sizes={`${SHRINE_W}px`}
            className="object-cover"
            draggable={false}
          />
        )}

        {/* Bottom vignette */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-14 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(247,243,238,0.85), transparent)",
          }}
        />

        {/* Score */}
        <div
          className="absolute bottom-2 left-2 z-20 font-mono text-[10px] tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          ★ {(item.score ?? 0).toFixed(1)}
        </div>

        {/* Swap button — only when queue has items to replace with */}
        {canSwap && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSwap();
            }}
            className="absolute bottom-2 right-2 z-20 rounded px-1.5 py-0.5 text-[8px] uppercase tracking-[.12em] transition-colors hover:bg-white/20"
            style={{
              color: "var(--text-secondary)",
              background: "var(--bg-panel)",
              border: "1px solid var(--border-default)",
            }}
          >
            Swap
          </button>
        )}
      </div>

      {/* Title */}
      <p
        className="mt-2 w-full truncate text-center text-[9px]"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--text-primary)",
          letterSpacing: ".04em",
        }}
      >
        {item.title}
      </p>

      {/* Water reflection — flipped image with shimmer sweep */}
      <div
        ref={reflRef}
        aria-hidden
        className="relative mt-0.5 overflow-hidden"
        style={
          {
            width: SHRINE_W,
            height: 95,
            flexShrink: 0,
            opacity: 0,
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
          } as React.CSSProperties
        }
      >
        {item.image_url && (
          <div
            style={{ position: "absolute", inset: 0, transform: "scaleY(-1)" }}
          >
            <Image
              src={item.image_url}
              alt=""
              fill
              sizes={`${SHRINE_W}px`}
              className="object-cover"
              draggable={false}
              style={{ filter: "saturate(0.4) brightness(0.65) blur(0.5px)" }}
            />
          </div>
        )}
        {/* Sweeping shimmer band */}
        <div className="water-ripple" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FavoritesScene
// ─────────────────────────────────────────────────────────────────────────────

export function FavoritesScene({
  items,
  onMove,
  onEpisodeChange,
  onRemove,
  onClose,
  isOpen,
}: FavoritesSceneProps) {
  // Which items are in the spotlight (up to MAX_FEATURED, defaulting to first 3)
  const [featuredIds, setFeaturedIds] = useState<string[]>(() =>
    items.slice(0, MAX_FEATURED).map((i) => i.id),
  );

  // Keep featuredIds consistent when items list changes (removals, adds)
  useEffect(() => {
    setFeaturedIds((prev) => {
      const valid = prev.filter((id) => items.some((i) => i.id === id));
      const queued = items.filter((i) => !valid.includes(i.id));
      const fill = queued
        .slice(0, MAX_FEATURED - valid.length)
        .map((i) => i.id);
      return [...valid, ...fill];
    });
  }, [items]);

  const featuredItems = featuredIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as CollectedAnime[];
  const queueItems = items.filter((i) => !featuredIds.includes(i.id));

  // Move a queue item into the spotlight (pushes out oldest if full)
  const featureItem = useCallback((id: string) => {
    setFeaturedIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length < MAX_FEATURED) return [...prev, id];
      return [...prev.slice(1), id];
    });
  }, []);

  // Send a spotlight item back to the queue
  const unfeatureItem = useCallback((id: string) => {
    setFeaturedIds((prev) => prev.filter((fid) => fid !== id));
  }, []);

  // Refs for shrine entrance animation
  const beamRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reflRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Reset card elements to pre-entrance state when gallery is closed so that
  // re-opens don't flash the previously-animated state during emergence.
  useEffect(() => {
    if (isOpen) return;
    const beams = beamRefs.current.filter(Boolean) as HTMLDivElement[];
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const refls = reflRefs.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(beams, { opacity: 0 });
    gsap.set(cards, { y: -45, scale: 0.74, opacity: 0 });
    gsap.set(refls, { scaleY: 0, opacity: 0, transformOrigin: "top center" });
  }, [isOpen]);

  // Trigger dramatic entrance when the gallery opens
  useEffect(() => {
    if (!isOpen || featuredItems.length === 0) return;
    const beams = beamRefs.current.filter(Boolean) as HTMLDivElement[];
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const refls = reflRefs.current.filter(Boolean) as HTMLDivElement[];

    tlRef.current?.kill();

    // Reset to pre-animation state
    gsap.set(beams, { opacity: 0 });
    gsap.set(cards, { y: -45, scale: 0.74, opacity: 0 });
    gsap.set(refls, { scaleY: 0, opacity: 0, transformOrigin: "top center" });

    const tl = gsap.timeline();

    // 1. Spotlights illuminate — staggered
    tl.to(
      beams,
      { opacity: 1, stagger: 0.22, duration: 1.1, ease: "power1.out" },
      0.08,
    );

    // 2. Cards drop in from above with bounce
    tl.to(
      cards,
      {
        y: 0,
        scale: 1,
        opacity: 1,
        stagger: 0.22,
        duration: 0.78,
        ease: "back.out(1.8)",
        onComplete: () => {
          gsap.set(cards, { clearProps: "transform" });
        },
      },
      0.22,
    );

    // 3. Water reflections materialise below
    tl.to(
      refls,
      {
        scaleY: 1,
        opacity: 1,
        stagger: 0.22,
        duration: 0.55,
        ease: "power2.out",
      },
      0.68,
    );

    tlRef.current = tl;
    return () => {
      tl.kill();
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    [],
  );

  return (
    <div
      className="moon-gallery relative w-full h-full flex flex-col"
      style={{ background: "var(--bg-page)" }}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-6 py-5">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-baseline gap-3">
            <h2
              className="text-xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
                letterSpacing: "0.04em",
              }}
            >
              Hidden Collection
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded"
              style={{
                border: "1px solid var(--border-default)",
                background: "var(--bg-panel)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {items.length} {items.length === 1 ? "Title" : "Titles"}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Return to shelf"
                className="flex items-center justify-center transition-all"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full"
              style={{
                border: "1px solid var(--border-default)",
                fontSize: "1.8rem",
                color: "var(--text-muted)",
              }}
            >
              —
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                letterSpacing: "0.08em",
                color: "var(--text-primary)",
              }}
            >
              Your hidden collection awaits
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
              }}
            >
              Mark any title as a favorite from its card menu
            </p>
          </div>
        ) : (
          <>
            {/* ── Spotlight shrine ─────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center min-h-0 overflow-x-auto">
              <div className="flex items-end gap-10 px-4 py-2">
                {featuredItems.map((item, i) => (
                  <ShrineCard
                    key={item.id}
                    item={item}
                    canSwap={queueItems.length > 0}
                    onSwap={() => unfeatureItem(item.id)}
                    beamRef={(el) => {
                      beamRefs.current[i] = el;
                    }}
                    cardRef={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    reflRef={(el) => {
                      reflRefs.current[i] = el;
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── Queue row (remaining favorites) ─────────────────────────── */}
            {queueItems.length > 0 && (
              <div className="shrink-0 pt-1 pb-2">
                {/* Hairline separator */}
                <div className="mb-2.5 flex items-center gap-3">
                  <div
                    className="flex-1 h-px"
                    style={{ background: "var(--border-subtle)" }}
                  />
                  <span
                    className="text-[8px] uppercase tracking-[.3em]"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Collection
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "var(--border-subtle)" }}
                  />
                </div>

                <div
                  className="shelf-scroll flex gap-4 overflow-x-auto pb-1"
                  style={{ alignItems: "flex-end" }}
                >
                  {queueItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-center gap-1.5 shrink-0"
                    >
                      <PosterCard
                        item={item}
                        tone="watched"
                        isDragging={false}
                        onMove={onMove}
                        onEpisodeChange={onEpisodeChange}
                        onRemove={onRemove}
                      />
                      <button
                        type="button"
                        onClick={() => featureItem(item.id)}
                        className="rounded px-2 py-1 text-[8px] uppercase tracking-[.15em] transition-colors hover:bg-black/5"
                        style={{
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-default)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        ✦ Feature
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

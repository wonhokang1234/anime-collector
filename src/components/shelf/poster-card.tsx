"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import gsap from "gsap";
import { DoorMirrorContext } from "./favorites-reveal";
import { getRarityTier } from "@/lib/types";
import type { AnimeCategory, CollectedAnime, RarityTier } from "@/lib/types";
import type { SpineTone } from "./manga-spine";

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────

interface PosterCardProps {
  item: CollectedAnime;
  tone: SpineTone;
  featured?: boolean;
  isDragging?: boolean;
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

const RARITY_LABELS: Record<RarityTier, string> = {
  common:    "Common",
  uncommon:  "Uncommon",
  rare:      "Rare",
  epic:      "Epic",
  legendary: "Legendary",
};

const MOVE_OPTIONS: { category: AnimeCategory; label: string }[] = [
  { category: "watching",     label: "Currently Watching" },
  { category: "plan_to_watch", label: "Plan to Watch" },
  { category: "watched",      label: "Watched" },
  { category: "favorite",    label: "Favorite" },
];

/**
 * Derive a stable small rotation angle from an item's id.
 * Used exclusively by the plan section to create the collage/scattered-photo look.
 * Range: −5.5 ° to +5.5 °
 */
function seedRotation(id: string): number {
  const hash = Array.from(id).reduce((a, c) => ((a * 31) + c.charCodeAt(0)) >>> 0, 0);
  return ((hash % 110) - 55) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PosterCard({
  item,
  tone,
  featured = false,
  isDragging = false,
  onMove,
  onEpisodeChange,
  onRemove,
}: PosterCardProps) {
  const router      = useRouter();
  const cardRef     = useRef<HTMLDivElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMirror    = useContext(DoorMirrorContext);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    disabled: isMirror,
  });

  const rarity       = getRarityTier(item.score ?? 0);
  // Plan cards get a collage tilt; all others stay upright
  const baseRotation = tone === "plan" ? seedRotation(item.id) : 0;

  // Card dimensions — featured is the hero "now-watching" card
  const imgW = featured ? 165 : 115;
  const imgH = featured ? 230 : 162;

  // ── Hover: straighten + lift ──────────────────────────────────────────────
  // The fusuma door system renders this component twice (once per door).
  // When a card straddles the 50% door boundary the two DOM instances respond
  // to hover independently, creating a visible seam.  We fix this by
  // dispatching a custom event so the other door's copy can mirror the
  // animation.  The `isMirror` flag prevents feedback loops.
  const hoverEnterAnim = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotation: 0,
      y: featured ? -8 : -10,
      scale: featured ? 1.03 : 1.06,
      duration: 0.22,
      ease: "power2.out",
      overwrite: true,
    });
  }, [featured]);

  const hoverLeaveAnim = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotation: baseRotation,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: "power2.inOut",
      overwrite: true,
    });
  }, [baseRotation]);

  const handleMouseEnter = useCallback(() => {
    hoverEnterAnim();
    document.dispatchEvent(
      new CustomEvent("shelf:hover-enter", { detail: { id: item.id, isMirror } })
    );
  }, [hoverEnterAnim, isMirror, item.id]);

  const handleMouseLeave = useCallback(() => {
    hoverLeaveAnim();
    document.dispatchEvent(
      new CustomEvent("shelf:hover-leave", { detail: { id: item.id, isMirror } })
    );
  }, [hoverLeaveAnim, isMirror, item.id]);

  // Listen for hover events from the OTHER door's copy of this card
  useEffect(() => {
    const onEnter = (e: Event) => {
      const { id, isMirror: src } = (e as CustomEvent<{ id: string; isMirror: boolean }>).detail;
      if (id !== item.id || src === isMirror) return; // not this card, or same door
      hoverEnterAnim();
    };
    const onLeave = (e: Event) => {
      const { id, isMirror: src } = (e as CustomEvent<{ id: string; isMirror: boolean }>).detail;
      if (id !== item.id || src === isMirror) return;
      hoverLeaveAnim();
    };
    document.addEventListener("shelf:hover-enter", onEnter);
    document.addEventListener("shelf:hover-leave", onLeave);
    return () => {
      document.removeEventListener("shelf:hover-enter", onEnter);
      document.removeEventListener("shelf:hover-leave", onLeave);
    };
  }, [item.id, isMirror, hoverEnterAnim, hoverLeaveAnim]);

  // Set initial collage rotation — GSAP owns the transform from here on
  useEffect(() => {
    if (!cardRef.current || baseRotation === 0) return;
    gsap.set(cardRef.current, { rotation: baseRotation, transformOrigin: "bottom center" });
  }, [baseRotation]);

  // Close context menu on outside click
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

  // Episode controls
  const total   = item.total_episodes || 0;
  const current = item.current_episode || 0;

  const stepEpisode = (delta: number) => {
    const next = Math.max(0, total > 0 ? Math.min(total, current + delta) : current + delta);
    if (next === current) return;
    onEpisodeChange(item.id, next);
    if (total > 0 && next === total && item.category !== "watched") {
      onMove(item.id, "watched");
    }
  };

  const dragTransform = transform ? CSS.Translate.toString(transform) : undefined;
  const dimmed        = tone === "watched";

  return (
    // ── Outer wrapper ─────────────────────────────────────────────────────
    // dnd-kit uses this element. Scene's stagger-in animation targets this too.
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative shrink-0 group/poster${isDragging ? " opacity-30 pointer-events-none" : ""}`}
      style={{ width: imgW, transform: dragTransform }}
    >
      {/* ── Inner card ────────────────────────────────────────────────────
          Owns hover + collage-rotation animation via cardRef.
          Navigate on click unless blocked by data-no-nav child.             */}
      <div
        ref={cardRef}
        className="cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-no-nav]")) return;
          router.push(`/card/${item.mal_id}`);
        }}
      >
        {/* ── Poster image ─────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{
            width:  imgW,
            height: imgH,
            borderRadius: 6,
            boxShadow: featured
              ? "0 24px 50px rgba(0,0,0,.82), 0 0 0 1px rgba(244,228,192,.18)"
              : "0 8px 22px rgba(0,0,0,.62)",
            filter: dimmed ? "saturate(0.5) brightness(0.72)" : undefined,
          }}
        >
          {/* Rarity foil strip */}
          <div className={`absolute top-0 left-0 right-0 z-10 h-[3px] spine-foil-${rarity}`} />

          {item.image_url && (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes={`${imgW}px`}
              className="object-cover"
              draggable={false}
            />
          )}

          {/* Bottom vignette so score chip is readable */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,.88), transparent)" }}
          />

          {/* Score chip */}
          <div
            className="absolute bottom-2 left-2 z-10 font-mono text-[10px] tabular-nums"
            style={{ color: "rgba(244,228,192,.85)" }}
          >
            ★ {(item.score ?? 0).toFixed(1)}
          </div>

          {/* Watched ✓ overlay */}
          {dimmed && (
            <div
              aria-hidden
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: "rgba(244,228,192,.1)",
                  border: "1.5px solid rgba(244,228,192,.42)",
                }}
              >
                <svg
                  width="13" height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(244,228,192,.9)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ── Info strip ───────────────────────────────────────────────── */}
        <div className="mt-2 px-0.5">
          <p
            className={`leading-snug truncate ${featured ? "text-[11px]" : "text-[10px]"}`}
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--washi)",
              letterSpacing: ".04em",
            }}
          >
            {item.title}
          </p>
          {featured && (
            <p
              className="mt-0.5 text-[10px] truncate"
              style={{ color: "var(--washi-soft)" }}
            >
              {RARITY_LABELS[rarity]}
            </p>
          )}
        </div>
      </div>

      {/* ── Episode stepper (featured watching only) ───────────────────── */}
      {featured && tone === "watching" && (
        <div className="mt-3" data-no-nav>
          <div
            className="flex items-center gap-2 rounded px-2 py-1.5"
            style={{
              border:          "1px solid rgba(244,228,192,.2)",
              background:      "rgba(0,0,0,.52)",
              backdropFilter:  "blur(6px)",
            }}
          >
            <button
              type="button"
              aria-label="Previous episode"
              onClick={(e) => { e.stopPropagation(); stepEpisode(-1); }}
              disabled={current <= 0}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-white/10 disabled:opacity-25"
              style={{ color: "var(--washi)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div
                className="text-[9px] uppercase tracking-[.18em]"
                style={{ color: "var(--washi-soft)", fontFamily: "var(--font-display)" }}
              >
                Episode
              </div>
              <div className="font-mono text-xs tabular-nums" style={{ color: "var(--washi)" }}>
                {current}
                <span style={{ opacity: 0.45 }}> / {total || "?"}</span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Next episode"
              onClick={(e) => { e.stopPropagation(); stepEpisode(1); }}
              disabled={total > 0 && current >= total}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-white/10 disabled:opacity-25"
              style={{ color: "var(--washi)" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {total > 0 && (
            <div
              className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full"
              style={{ background: "rgba(244,228,192,.1)" }}
            >
              <div
                className="h-full transition-[width] duration-300"
                style={{
                  width:      `${Math.min(100, (current / total) * 100)}%`,
                  background: "linear-gradient(90deg, var(--lantern-glow), var(--hanko))",
                  boxShadow:  "0 0 6px rgba(244,217,138,.5)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Context menu ─────────────────────────────────────────────────── */}
      <div
        ref={menuRef}
        className="absolute top-2 right-2 z-40"
        data-no-nav
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Card options"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex h-6 w-6 items-center justify-center rounded bg-zinc-950/80 text-zinc-200 backdrop-blur-sm ring-1 ring-white/10 transition-opacity hover:bg-zinc-900 ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover/poster:opacity-100"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5"  cy="12" r="1.6" />
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
                  onClick={() => { if (!active) onMove(item.id, opt.category); setMenuOpen(false); }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                    active
                      ? "bg-zinc-900/60 text-indigo-300"
                      : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
            <div className="border-t border-zinc-800" />
            <button
              type="button"
              onClick={() => { onRemove(item.id); setMenuOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

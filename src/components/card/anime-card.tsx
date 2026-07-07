"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { getRarityTier, type RarityTier } from "@/lib/types";
import { DURATION, EASE } from "@/lib/motion";
import { RarityDots } from "@/components/ui/rarity-dots";

interface AnimeCardProps {
  title: string;
  imageUrl: string;
  score: number;
  episodes?: number | null;
  synopsis?: string;
  genres?: string[];
  studio?: string;
  year?: number | null;
  variant?: "full" | "compact";
  onCollect?: () => void;
  collected?: boolean;
  /** Briefly true after a successful collect — triggers the scale-pop ceremony */
  isJustCollected?: boolean;
}

const RARITY_LABELS: Record<RarityTier, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function AnimeCard({
  title,
  imageUrl,
  score,
  episodes,
  synopsis,
  genres,
  studio,
  year,
  variant = "full",
  onCollect,
  collected = false,
  isJustCollected = false,
}: AnimeCardProps) {
  const rarity = getRarityTier(score);
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const shineBackRef = useRef<HTMLDivElement>(null);
  const holoRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  // Ref version of isFlipped so event handlers see latest value without re-registering.
  const isFlippedRef = useRef(false);
  const flipTween = useRef<gsap.core.Tween | null>(null);

  const isCompact = variant === "compact";
  const cardWidth = isCompact ? 155 : 280;
  const cardHeight = isCompact ? 224 : 420;

  // Card spotlight — desktop hover only, sets CSS vars for globals.css ::before pseudo
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty(
        "--sx",
        `${((e.clientX - rect.left) / rect.width) * 100}%`,
      );
      card.style.setProperty(
        "--sy",
        `${((e.clientY - rect.top) / rect.height) * 100}%`,
      );
    };
    const handleLeave = () => {
      card.style.removeProperty("--sx");
      card.style.removeProperty("--sy");
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  // Flip animation
  const handleFlip = useCallback(() => {
    if (!innerRef.current || flipTween.current?.isActive()) return;

    const next = !isFlippedRef.current;
    isFlippedRef.current = next;
    setIsFlipped(next);

    flipTween.current = gsap.to(innerRef.current, {
      rotateX: 0,
      rotateY: next ? 180 : 0,
      duration: 0.6,
      ease: "power2.inOut",
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      flipTween.current?.kill();
    };
  }, []);

  // Collect ceremony — brief scale pop when isJustCollected becomes true
  useEffect(() => {
    if (!isJustCollected || !cardRef.current) return;
    const tl = gsap.timeline();
    tl.to(cardRef.current, {
      scale: 1.04,
      duration: DURATION.micro,
      ease: EASE.micro,
    }).to(cardRef.current, {
      scale: 1.0,
      duration: 0.2,
      ease: EASE.standard,
    });
    return () => {
      tl.kill();
    };
  }, [isJustCollected]);

  const rarityBorderColor = `var(--rarity-${rarity}-border)`;

  return (
    <div
      className="card-perspective inline-block relative"
      style={{
        width: "100%",
        maxWidth: cardWidth,
        aspectRatio: `${cardWidth}/${cardHeight}`,
      }}
    >
      <div
        ref={cardRef}
        className={`anime-card rarity-${rarity} ${isCompact ? "anime-card-compact" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: 6,
          borderLeft: `3px solid ${rarityBorderColor}`,
          boxShadow: "var(--shadow-card)",
        }}
        onClick={(e) => {
          if (isCompact) return;
          const target = e.target as HTMLElement;
          if (target.closest("[data-no-flip]")) return;
          handleFlip();
        }}
      >
        <div ref={innerRef} className="anime-card-inner">
          {/* Front face */}
          <div
            className="card-face card-front flex flex-col"
            style={{
              background: "var(--bg-card)",
              pointerEvents: isFlipped ? "none" : "auto",
            }}
          >
            <div className="rarity-stripe" aria-hidden />

            {/* Image area */}
            <div className="card-image-wrapper flex-1 relative group/image">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover pointer-events-none"
                sizes={`${cardWidth}px`}
              />
              {!isCompact && (
                <div
                  className="absolute top-2 right-2 z-20 rounded-full px-2.5 py-1 text-[10px] font-medium opacity-0 group-hover/image:opacity-100 transition-opacity tracking-wider uppercase pointer-events-none"
                  style={{
                    background: "rgba(247,243,238,0.85)",
                    color: "var(--text-secondary)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  Flip
                </div>
              )}
            </div>

            {/* Collected ownership stamp — hanko seal in top-right corner */}
            {collected && (
              <div
                aria-label="Collected"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 15,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--hanko)",
                  color: "#fff",
                  fontFamily: "var(--font-jp)",
                  fontSize: 14,
                  fontWeight: 900,
                  borderRadius: 2,
                  transform: "rotate(-5deg)",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(196,30,58,0.3)",
                  pointerEvents: "none",
                }}
              >
                集
              </div>
            )}

            {/* Info bar pinned to bottom — marked no-flip */}
            <div
              data-no-flip
              className="relative z-10 px-3 py-2.5"
              style={{
                background: "rgba(247,243,238,0.95)",
                borderTop:
                  "1px solid var(--rarity-separator-color, var(--border-subtle))",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`font-semibold leading-tight line-clamp-2 ${
                    isCompact ? "text-xs" : "text-sm"
                  }`}
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--text-primary)",
                  }}
                >
                  {title}
                </h3>
                <span
                  className={`rarity-badge rarity-badge--${rarity} shrink-0`}
                >
                  {RARITY_LABELS[rarity]}
                </span>
              </div>

              {!isCompact && (
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="score-star text-xs">★</span>
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {score.toFixed(1)}
                    </span>
                  </div>
                  {episodes && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {episodes} ep{episodes !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* RarityDots row */}
              {!isCompact && (
                <div className="mt-1.5">
                  <RarityDots tier={rarity} />
                </div>
              )}

              {/* Reserved space so the image doesn't expand into the button slot */}
              {!isCompact && onCollect && !collected && (
                <div className="mt-2 h-10" aria-hidden />
              )}
            </div>

            {/* Shine overlay — never captures pointer */}
            <div ref={shineRef} className="card-shine pointer-events-none" />

            {/* Holographic overlay (legendary only) */}
            {rarity === "legendary" && (
              <div ref={holoRef} className="holo-overlay pointer-events-none" />
            )}
          </div>

          {/* Back face */}
          {!isCompact && (
            <div
              className="card-face card-back"
              style={{ pointerEvents: isFlipped ? "auto" : "none" }}
            >
              <div className="card-back-content p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className="text-base font-semibold leading-tight pr-2 line-clamp-2"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {title}
                  </h3>
                  <span
                    className={`rarity-badge rarity-badge--${rarity} shrink-0`}
                  >
                    {RARITY_LABELS[rarity]}
                  </span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="score-display">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xs ${
                          star <= Math.round(score / 2) ? "score-star" : ""
                        }`}
                        style={
                          star > Math.round(score / 2)
                            ? { color: "var(--border-strong)" }
                            : undefined
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {score.toFixed(1)}
                  </span>
                </div>

                {/* Meta info */}
                <div
                  className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {studio && <span>{studio}</span>}
                  {year && <span>{year}</span>}
                  {episodes && (
                    <span>
                      {episodes} episode{episodes !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Genres */}
                {genres && genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {genres.slice(0, 4).map((genre) => (
                      <span key={genre} className="genre-tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Synopsis */}
                {synopsis && (
                  <p
                    className="text-xs leading-relaxed line-clamp-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {synopsis}
                  </p>
                )}

                {/* Flip back hint */}
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span
                    className="text-[10px] tracking-wider uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Click to flip back
                  </span>
                </div>
              </div>

              {/* Shine overlay on back too */}
              <div ref={shineBackRef} className="card-shine" />
            </div>
          )}
        </div>

        {/* Collect button — outside anime-card-inner so it's not in the 3D
            preserve-3d stacking context; pointer events work reliably here. */}
        {!isCompact && onCollect && !collected && (
          <div
            data-no-flip
            className="absolute bottom-0 left-0 right-0 z-50 px-3 pb-3"
            style={{
              opacity: isFlipped ? 0 : 1,
              pointerEvents: isFlipped ? "none" : "auto",
              transition: "opacity 0.2s ease",
            }}
          >
            <button
              type="button"
              onClick={() => onCollect()}
              className="mg-moss-btn mg-gather-btn w-full"
              style={{ fontSize: "0.75rem" }}
            >
              Gather a seed · 種を集める
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

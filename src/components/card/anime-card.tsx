"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { getRarityTier, type RarityTier } from "@/lib/types";
import "./card.css";

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
}: AnimeCardProps) {
  const rarity = getRarityTier(score);
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const shineBackRef = useRef<HTMLDivElement>(null);
  const holoRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  // Ref version of isFlipped so mousemove/leave handlers see the latest value
  // without having to re-register as callbacks.
  const isFlippedRef = useRef(false);
  const isHovering = useRef(false);
  const flipTween = useRef<gsap.core.Tween | null>(null);
  const perspectiveRef = useRef<HTMLDivElement>(null);

  const isCompact = variant === "compact";
  const cardWidth = isCompact ? 180 : 280;
  const cardHeight = isCompact ? 260 : 420;

  // Parallax tilt on hover — respects the flip state by basing rotateY
  // on 0 or 180 depending on which face is forward.
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !innerRef.current) return;
      // Skip tilt while the flip tween is running to avoid fighting it.
      if (flipTween.current?.isActive()) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const tiltX = ((y - centerY) / centerY) * -10;
      const tiltY = ((x - centerX) / centerX) * 10;
      const base = isFlippedRef.current ? 180 : 0;

      gsap.to(innerRef.current, {
        rotateX: isFlippedRef.current ? -tiltX : tiltX,
        rotateY: base + tiltY,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Move shine with cursor
      if (shineRef.current) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        shineRef.current.style.setProperty("--shine-x", `${percentX}%`);
        shineRef.current.style.setProperty("--shine-y", `${percentY}%`);
      }

      // Move holo angle with cursor (legendary only)
      if (holoRef.current) {
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        holoRef.current.style.setProperty(
          "--holo-mouse-angle",
          `${angle + 90}deg`
        );
      }
    },
    []
  );

  const handleMouseEnter = useCallback(() => {
    isHovering.current = true;
    if (innerRef.current) {
      gsap.to(innerRef.current, {
        scale: 1.04,
        duration: 0.3,
        ease: "power2.out",
      });
    }
    if (perspectiveRef.current) {
      gsap.to(perspectiveRef.current, {
        y: -6,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    if (innerRef.current) {
      gsap.to(innerRef.current, {
        rotateX: 0,
        rotateY: isFlippedRef.current ? 180 : 0,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      });
    }
    if (perspectiveRef.current) {
      gsap.to(perspectiveRef.current, {
        y: 0,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
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

  return (
    <div
      ref={perspectiveRef}
      className="card-perspective inline-block relative"
      style={{ width: cardWidth, height: cardHeight }}
    >
      <div
        ref={cardRef}
        className={`anime-card rarity-${rarity} ${isCompact ? "anime-card-compact" : ""}`}
        style={{ width: cardWidth, height: cardHeight }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          if (isCompact) return;
          // Don't flip if the click came from within a no-flip zone (info bar, buttons)
          const target = e.target as HTMLElement;
          if (target.closest("[data-no-flip]")) return;
          handleFlip();
        }}
      >
        <div ref={innerRef} className="anime-card-inner">
          {/* Rarity border glow */}
          <div className="rarity-border" />

          {/* Front face */}
          <div
            className="card-face card-front bg-zinc-900 flex flex-col"
            style={{ pointerEvents: isFlipped ? "none" : "auto" }}
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
                <div className="absolute top-2 right-2 z-20 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-white/80 opacity-0 group-hover/image:opacity-100 transition-opacity tracking-wider uppercase pointer-events-none">
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
                  color: "var(--washi)",
                  fontFamily: "var(--font-jp)",
                  fontSize: 14,
                  fontWeight: 900,
                  borderRadius: 2,
                  transform: "rotate(-5deg)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(244,228,192,0.15)",
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
                background: "linear-gradient(to top, rgba(5,7,16,0.98), rgba(10,6,4,0.92))",
                backdropFilter: "blur(4px)",
                borderTop: "1px solid var(--rarity-separator-color, rgba(244,228,192,0.12))",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`font-bold text-white leading-tight line-clamp-2 ${
                    isCompact ? "text-xs" : "text-sm"
                  }`}
                  style={{ fontFamily: "var(--font-geist-sans)" }}
                >
                  {title}
                </h3>
                <span className={`rarity-badge rarity-badge-${rarity} shrink-0`}>
                  {RARITY_LABELS[rarity]}
                </span>
              </div>

              {!isCompact && (
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="score-star text-xs">★</span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {score.toFixed(1)}
                    </span>
                  </div>
                  {episodes && (
                    <span className="text-xs text-zinc-500">
                      {episodes} ep{episodes !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* Collect button — inside 3D transform, moves with card on hover */}
              {!isCompact && onCollect && !collected && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => onCollect()}
                    className="hanko-btn w-full"
                    style={{ padding: "0.5rem 0.9rem", fontSize: "0.7rem" }}
                  >
                    Collect
                  </button>
                </div>
              )}
            </div>

            {/* Shine overlay — never captures pointer */}
            <div ref={shineRef} className="card-shine pointer-events-none" />

            {/* Holographic overlay (legendary only) */}
            {rarity === "legendary" && (
              <div
                ref={holoRef}
                className="holo-overlay pointer-events-none"
              />
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
                  <h3 className="text-base font-bold text-white leading-tight pr-2 line-clamp-2">
                    {title}
                  </h3>
                  <span className={`rarity-badge rarity-badge-${rarity} shrink-0`}>
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
                          star <= Math.round(score / 2)
                            ? "score-star"
                            : "text-zinc-700"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {score.toFixed(1)}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mb-3">
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
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-6">
                    {synopsis}
                  </p>
                )}

                {/* Flip back hint */}
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-[10px] text-zinc-600 tracking-wider uppercase">
                    Click to flip back
                  </span>
                </div>
              </div>

              {/* Shine overlay on back too */}
              <div ref={shineBackRef} className="card-shine" />
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

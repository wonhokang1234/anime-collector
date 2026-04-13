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
  const holoRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const isHovering = useRef(false);
  const flipTween = useRef<gsap.core.Tween | null>(null);

  const isCompact = variant === "compact";
  const cardWidth = isCompact ? 180 : 280;
  const cardHeight = isCompact ? 260 : 420;

  // Parallax tilt on hover
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !innerRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      gsap.to(innerRef.current, {
        rotateX,
        rotateY,
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
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    if (innerRef.current) {
      gsap.to(innerRef.current, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }, []);

  // Flip animation
  const handleFlip = useCallback(() => {
    if (!innerRef.current || flipTween.current?.isActive()) return;

    const target = isFlipped ? 0 : 180;
    setIsFlipped(!isFlipped);

    flipTween.current = gsap.to(innerRef.current, {
      rotateY: target,
      duration: 0.6,
      ease: "power2.inOut",
    });
  }, [isFlipped]);

  // Cleanup
  useEffect(() => {
    return () => {
      flipTween.current?.kill();
    };
  }, []);

  return (
    <div
      className="card-perspective inline-block"
      style={{ width: cardWidth, height: cardHeight }}
    >
      <div
        ref={cardRef}
        className={`anime-card rarity-${rarity} ${isCompact ? "anime-card-compact" : ""}`}
        style={{ width: cardWidth, height: cardHeight }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={isCompact ? undefined : handleFlip}
      >
        <div ref={innerRef} className="anime-card-inner">
          {/* Rarity border glow */}
          <div className="rarity-border" />

          {/* Front face */}
          <div className="card-face card-front bg-zinc-900 flex flex-col">
            {/* Image — fills all available space */}
            <div className="card-image-wrapper flex-1">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes={`${cardWidth}px`}
              />
            </div>

            {/* Info bar pinned to bottom */}
            <div className="relative z-10 px-3 py-2.5 bg-zinc-900/95 backdrop-blur-sm">
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

              {!isCompact && !collected && onCollect && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollect();
                  }}
                  className="mt-2 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.97]"
                >
                  Collect
                </button>
              )}

              {!isCompact && collected && (
                <div className="mt-2 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-center text-xs font-semibold text-emerald-400">
                  Collected
                </div>
              )}
            </div>

            {/* Shine overlay */}
            <div ref={shineRef} className="card-shine" />

            {/* Holographic overlay (legendary only) */}
            {rarity === "legendary" && (
              <div ref={holoRef} className="holo-overlay" />
            )}
          </div>

          {/* Back face */}
          {!isCompact && (
            <div className="card-face card-back">
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
              <div ref={shineRef} className="card-shine" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

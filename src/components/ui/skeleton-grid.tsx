interface SkeletonGridProps {
  count?: number;
  className?: string;
}

/**
 * SkeletonGrid — loading placeholder matching the scatter card grid layout.
 *
 * Uses the same flex-wrap layout as the card grid:
 *   flex flex-wrap gap-4 sm:gap-6 justify-center px-1
 *
 * Each skeleton card has fixed dimensions matching AnimeCard compact/full sizes:
 *   compact: 155px × 224px (mobile)
 *   full:    280px × 420px (desktop)
 *
 * The `isCompact` prop mirrors the browse page isMobile check.
 *
 * No GSAP — skeletons appear immediately and transition out when content loads.
 */
export function SkeletonGrid({
  count = 12,
  className,
  isCompact = false,
}: SkeletonGridProps & { isCompact?: boolean }) {
  const w = isCompact ? 155 : 280;
  const h = isCompact ? 224 : 420;

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`flex flex-wrap gap-4 sm:gap-6 justify-center px-1${className ? ` ${className}` : ""}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-block rounded-lg flex-shrink-0"
          style={{ width: w, height: h }}
        />
      ))}
    </div>
  );
}

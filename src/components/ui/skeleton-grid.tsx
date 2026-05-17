interface SkeletonGridProps {
  count?: number;
  className?: string;
}

/**
 * SkeletonGrid — loading placeholder grid matching the real card grid layout.
 *
 * Uses the same responsive column pattern as the card grid:
 *   2 cols mobile → 3 cols sm → 4 cols lg → 5 cols xl
 *
 * Each skeleton card uses 2:3 aspect ratio via paddingBottom with
 * `skeleton-block` CSS animation from globals.css.
 *
 * No GSAP — skeletons appear immediately and transition out when content loads.
 */
export function SkeletonGrid({ count = 12, className }: SkeletonGridProps) {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6${className ? ` ${className}` : ""}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-block w-full rounded-lg"
          style={{ position: "relative", paddingBottom: "150%" }}
        />
      ))}
    </div>
  );
}

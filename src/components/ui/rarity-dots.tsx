import type { RarityTier } from "@/lib/types";

const TIER_COUNTS: Record<RarityTier, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

interface RarityDotsProps {
  tier: RarityTier;
  className?: string;
}

export function RarityDots({ tier, className }: RarityDotsProps) {
  const filled = TIER_COUNTS[tier] ?? 1;
  return (
    <div
      className={className}
      style={{ display: "flex", gap: "3px", alignItems: "center" }}
      aria-label={`${tier} rarity`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i < filled ? "var(--accent)" : "var(--border-strong)",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

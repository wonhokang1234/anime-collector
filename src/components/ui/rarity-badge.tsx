import type { RarityTier } from "@/lib/types";

interface RarityBadgeProps {
  tier: RarityTier;
  size?: "sm" | "md";
  className?: string;
}

const TIER_LABELS: Record<RarityTier, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const TIER_TEXT_COLOR: Record<RarityTier, string> = {
  common: "var(--rarity-common-border)",
  uncommon: "var(--rarity-uncommon-border)",
  rare: "var(--rarity-rare-border)",
  epic: "var(--rarity-epic-border)",
  legendary: "var(--rarity-legendary-border)",
};

/**
 * RarityBadge — shared rarity tier pill.
 *
 * Renders `<span className="rarity-badge rarity-badge--{tier}">`.
 * CSS lives in globals.css (double-hyphen BEM form).
 * Text color uses the --rarity-*-border tokens for legibility on light surfaces.
 * No glow effects — clean editorial style.
 */
export function RarityBadge({ tier, className }: RarityBadgeProps) {
  return (
    <span
      className={`rarity-badge rarity-badge--${tier}${className ? ` ${className}` : ""}`}
      style={{
        color: TIER_TEXT_COLOR[tier],
        background: "var(--bg-panel)",
        boxShadow: "none",
      }}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}

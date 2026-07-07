"use client";

/**
 * A single koi fish — reference `koiParts` (Garden World 3D lines 491–498).
 * Used in the Pond and in the release ceremony (scale 1.3).
 */
export function Koi({
  c1,
  c2,
  rating,
  glyph,
  scale = 1,
  favorite = false,
}: {
  c1: string;
  c2: string;
  rating: number;
  glyph: string;
  scale?: number;
  favorite?: boolean;
}) {
  const w = Math.round((64 + (rating || 3) * 7) * scale);
  const h = Math.round(w * 0.42);
  // reference used `${c1}55` (hex-only); c1 may be hsl(...) now → use color-mix
  const ratingGlow = `0 0 ${Math.round(14 + rating * 5)}px color-mix(in oklab, ${c1} 33%, transparent)`;
  const boxShadow = favorite
    ? `0 6px 18px rgba(0,0,0,.45), ${ratingGlow}, 0 0 18px color-mix(in oklab, var(--gold) 45%, transparent)`
    : `0 6px 18px rgba(0,0,0,.45), ${ratingGlow}`;

  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: "50% 46% 46% 50%",
        background: `linear-gradient(100deg, ${c1}, ${c2})`,
        display: "grid",
        placeItems: "center",
        boxShadow,
        border: favorite
          ? "1.5px solid var(--gold)"
          : "1px solid rgba(255,255,255,.18)",
      }}
    >
      <span
        style={{
          position: "absolute",
          right: -Math.round(h * 0.55),
          top: "50%",
          width: Math.round(h * 0.8),
          height: Math.round(h * 0.8),
          background: c2,
          clipPath: "polygon(0 50%, 100% 0, 78% 50%, 100% 100%)",
          transformOrigin: "left center",
          animation: "mg-tailWag 1.6s ease-in-out infinite",
          opacity: 0.9,
        }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 2,
          fontFamily: "var(--font-mincho), serif",
          fontSize: scale > 1 ? 15 : 13,
          fontWeight: 700,
          color: "rgba(255,255,255,.92)",
          whiteSpace: "nowrap",
        }}
      >
        {glyph}
      </span>
    </div>
  );
}

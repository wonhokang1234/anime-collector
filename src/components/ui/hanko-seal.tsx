import React from "react";

interface HankoSealProps {
  kanji?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-hidden"?: boolean;
}

const SIZE_MAP = {
  sm: { box: 28, font: 13, radius: 2 },
  md: { box: 48, font: 18, radius: 2 },
  lg: { box: 64, font: 28, radius: 2 },
} as const;

/**
 * HankoSeal — the vermilion stamp kanji element used in navbar, landing, and auth.
 *
 * Uses forwardRef so parent components (e.g. landing page) can attach GSAP refs
 * to the outermost span without coupling to internal DOM structure.
 *
 * Size map:
 *  sm  → 28px  (navbar)
 *  md  → 48px  (auth form)
 *  lg  → 64px  (landing page hero)
 */
export const HankoSeal = React.forwardRef<HTMLSpanElement, HankoSealProps>(
  function HankoSeal(
    { kanji = "集", size = "md", className, "aria-hidden": ariaHidden },
    ref,
  ) {
    const { box, font, radius } = SIZE_MAP[size];

    return (
      <span
        ref={ref}
        aria-hidden={ariaHidden}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: box,
          height: box,
          background: "var(--hanko)",
          color: "var(--washi)",
          fontFamily: "var(--font-jp)",
          fontSize: font,
          fontWeight: 900,
          borderRadius: radius,
          boxShadow:
            "0 2px 4px rgba(0,0,0,.45), inset 0 0 0 1px var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        {kanji}
      </span>
    );
  },
);

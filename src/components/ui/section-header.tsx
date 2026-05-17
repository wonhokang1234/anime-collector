"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

type HeadingLevel = "h1" | "h2" | "h3";

interface SectionHeaderProps {
  kicker?: string;
  /** @deprecated No longer rendered — kept for backward compat with existing callers */
  kickerJp?: string;
  title: string;
  description?: string;
  as?: HeadingLevel;
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  as: Tag = "h2",
  className,
}: SectionHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(SplitText);
    const split = new SplitText(headingRef.current, { type: "words" });
    const tween = gsap.from(split.words, {
      yPercent: 110,
      opacity: 0,
      duration: 0.3,
      stagger: 0.06,
      ease: "power2.out",
    });
    return () => {
      tween.kill();
      split.revert();
    };
  }, []);

  return (
    <div className={className}>
      {kicker && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.6875rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
            marginBottom: "0.375rem",
          }}
        >
          {kicker}
        </p>
      )}
      <div style={{ overflow: "hidden" }}>
        <Tag
          ref={headingRef}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
          className="display-title"
        >
          {title}
        </Tag>
      </div>
      <div className="hairline" style={{ marginTop: "0.75rem" }} />
      {description && (
        <p
          className="mt-3 text-sm"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--text-secondary)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

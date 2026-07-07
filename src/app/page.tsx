"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { DURATION, EASE } from "@/lib/motion";
import { HankoSeal } from "@/components/ui/hanko-seal";

export default function HomePage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/garden");
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || user) return;
    const container = contentRef.current;
    if (!container) return;

    const tl = gsap.timeline();

    // Seal stamps in
    if (sealRef.current) {
      tl.fromTo(
        sealRef.current,
        { scale: 0, rotation: -20, opacity: 0 },
        {
          scale: 1,
          rotation: -5,
          opacity: 1,
          duration: 0.65,
          ease: EASE.emphasized,
        },
        0,
      );
    }

    // Headline fades up
    if (headlineRef.current) {
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.standard },
        0.25,
      );
    }

    // Divider, tagline, CTA, footer cascade in
    const rest = [
      dividerRef.current,
      taglineRef.current,
      ctaRef.current,
      footerRef.current,
    ].filter(Boolean);
    if (rest.length > 0) {
      tl.fromTo(
        rest,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.reveal,
          stagger: DURATION.revealStagger,
          ease: EASE.standard,
        },
        0.5,
      );
    }

    return () => {
      tl.kill();
    };
  }, [loading, user]);

  if (loading || user) return null;

  return (
    <div
      className="relative flex flex-col items-center justify-center px-4 text-center"
      style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
    >
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Hanko seal — stamp entrance via GSAP */}
        <HankoSeal
          ref={sealRef}
          kanji="集"
          size="lg"
          aria-hidden
          className="mb-8"
        />

        {/* Hero headline */}
        <h1
          ref={headlineRef}
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(3rem, 8vw, 5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
            maxWidth: "16ch",
          }}
        >
          The anime collection that feels like a catalog.
        </h1>

        {/* Hairline divider below headline */}
        <div
          ref={dividerRef}
          className="hairline"
          style={{
            maxWidth: "12rem",
            marginTop: "1.5rem",
            marginBottom: "2rem",
          }}
          aria-hidden
        />

        {/* Tagline */}
        <p
          ref={taglineRef}
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--text-secondary)",
            fontSize: "1.0625rem",
            lineHeight: 1.7,
            maxWidth: "36rem",
          }}
        >
          Collect titles as rarity-tiered cards. Organize your shelves. Build
          your shrine.
        </p>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Signed-out CTAs only — the `loading || user` gate above returns
              null before this renders, so those branches were unreachable. */}
          <Link href="/signup" className="btn-primary">
            Start collecting
          </Link>
          <Link href="/browse" className="btn-ghost">
            Browse titles
          </Link>
        </div>

        {/* Footer meta */}
        <div
          ref={footerRef}
          className="mt-16 flex flex-wrap items-center justify-center gap-3 sm:gap-5"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.6875rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <span>Vol. 1</span>
          <span aria-hidden style={{ color: "var(--accent)", opacity: 0.5 }}>
            ·
          </span>
          <span>2026 Edition</span>
          <span aria-hidden style={{ color: "var(--accent)", opacity: 0.5 }}>
            ·
          </span>
          <span>Est. by the Collector</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HomePage() {
  const { user, loading } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    // children[0] = seal, children[1] = kicker, children[2] = h1,
    // children[3] = ribbon, children[4] = description, children[5] = CTA, children[6] = footer

    const chars = container.querySelectorAll<HTMLElement>(".title-char");

    const tl = gsap.timeline();

    // Seal stamps in
    if (sealRef.current) {
      tl.fromTo(
        sealRef.current,
        { scale: 0, rotation: -20, opacity: 0 },
        { scale: 1, rotation: -5, opacity: 1, duration: 0.65, ease: "elastic.out(1.2, 0.45)" },
        0
      );
    }

    // Kicker fades in
    if (children[1]) {
      tl.fromTo(
        children[1],
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        0.2
      );
    }

    // Title chars ripple in
    if (chars.length > 0) {
      tl.fromTo(
        chars,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: "power3.out" },
        0.25
      );
    }

    // Ribbon, description, CTA, footer
    const rest = [children[3], children[4], children[5], children[6]].filter(Boolean);
    if (rest.length > 0) {
      tl.fromTo(
        rest,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.09, ease: "power2.out" },
        0.6
      );
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <span className="ambient-lantern" aria-hidden />

      {/* background kanji watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{
          fontFamily: "var(--font-jp)",
          fontSize: "clamp(18rem, 38vw, 32rem)",
          color: "rgba(244, 217, 138, 0.045)",
          lineHeight: 1,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      >
        蒐集
      </span>

      <div ref={contentRef} className="relative z-10 flex flex-col items-center">
        {/* hanko seal */}
        <div
          ref={sealRef}
          aria-hidden
          className="mb-6 flex h-16 w-16 items-center justify-center text-[28px] font-black"
          style={{
            background: "var(--hanko)",
            color: "var(--washi)",
            fontFamily: "var(--font-jp)",
            borderRadius: "2px",
            boxShadow:
              "0 6px 16px rgba(196,30,58,.4), inset 0 0 0 2px rgba(244,228,192,.15)",
          }}
        >
          集
        </div>

        {/* kanji kicker */}
        <p
          className="mb-3 text-xs tracking-[.5em]"
          style={{
            color: "var(--washi-soft)",
            fontFamily: "var(--font-jp)",
          }}
        >
          蒐 集 者 の 書 架
        </p>

        <h1
          className="display-title text-5xl font-extrabold leading-[0.95] sm:text-6xl md:text-[5.75rem]"
          style={{ letterSpacing: "0.06em" }}
        >
          {"ANIME".split("").map((char, i) => (
            <span key={`a${i}`} className="title-char inline-block">{char}</span>
          ))}
          <br />
          <span style={{ color: "var(--lantern-glow)" }}>
            {"COLLECTOR".split("").map((char, i) => (
              <span key={`c${i}`} className="title-char inline-block">{char}</span>
            ))}
          </span>
        </h1>

        {/* ribbon divider */}
        <div className="mt-8 flex items-center gap-3">
          <span
            className="block h-px w-16"
            style={{ background: "rgba(244,228,192,.35)" }}
            aria-hidden
          />
          <span className="hanko-dot" aria-hidden />
          <span
            className="block h-px w-16"
            style={{ background: "rgba(244,228,192,.35)" }}
            aria-hidden
          />
        </div>

        <p
          className="mt-6 max-w-xl text-base leading-relaxed"
          style={{ color: "rgba(244,228,192,.7)" }}
        >
          Collect anime as stylized cards with rarity effects, and archive them
          across your lantern-lit manga library — three shelves, one
          sanctuary.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {loading ? (
            <div className="mt-10 flex justify-center">
              <div className="skeleton-block" style={{ width: 200, height: 44, borderRadius: 4 }} />
            </div>
          ) : user ? (
            <Link href="/browse" className="hanko-btn">
              Enter the Library →
            </Link>
          ) : (
            <>
              <Link href="/login" className="hanko-btn">
                Log in
              </Link>
              <Link href="/signup" className="ghost-btn">
                Create an Account
              </Link>
            </>
          )}
        </div>

        {/* footer meta */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[.3em] sm:gap-5"
          style={{
            color: "rgba(244,228,192,.4)",
            fontFamily: "var(--font-display)",
          }}
        >
          <span>Vol. 1</span>
          <span aria-hidden className="hanko-dot" />
          <span>2026 Edition</span>
          <span aria-hidden className="hanko-dot" />
          <span>Est. by the Collector</span>
        </div>
      </div>
    </div>
  );
}

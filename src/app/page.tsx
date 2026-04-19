"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const { user, loading } = useAuthStore();

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

      <div className="relative z-10 flex flex-col items-center">
        {/* hanko seal */}
        <div
          aria-hidden
          className="mb-6 flex h-16 w-16 items-center justify-center text-[28px] font-black"
          style={{
            background: "var(--hanko)",
            color: "var(--washi)",
            fontFamily: "var(--font-jp)",
            transform: "rotate(-5deg)",
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
          ANIME
          <br />
          <span style={{ color: "var(--lantern-glow)" }}>COLLECTOR</span>
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
          {loading ? null : user ? (
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

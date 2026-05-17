"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { DURATION, EASE } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const tween = gsap.fromTo(
      el,
      { clipPath: "inset(0 0 100% 0)", scale: 1.03 },
      {
        clipPath: "inset(0 0 0% 0)",
        scale: 1,
        duration: DURATION.slow,
        ease: EASE.out,
        clearProps: "all",
        onComplete: () => {
          // Preserve FavoritesReveal compatibility — clear transform so
          // position:fixed descendants are anchored to the viewport, not
          // to this element. clearProps:"all" above covers this, but we
          // also explicitly clear the style property as a safety guard.
          if (el) el.style.transform = "";
        },
        // Guard against interrupted tweens (fast navigation) — clear all
        // GSAP-set props so fixed-position descendants remain correctly anchored.
        onInterrupt: () => {
          gsap.set(el, { clearProps: "all" });
          if (el) el.style.transform = "";
        },
      },
    );
    return () => {
      tween.kill();
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}

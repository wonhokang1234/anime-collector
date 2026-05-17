"use client";

import { useEffect } from "react";
import gsap from "gsap";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = (reduced: boolean) => {
      gsap.globalTimeline.timeScale(reduced ? 100 : 1);
    };

    apply(mq.matches);

    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return <>{children}</>;
}

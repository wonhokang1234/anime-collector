"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Reveal-on-scroll hook — mirrors the reference `reveal` ref-callback
 * (Garden World 3D lines 396–413). Returns a ref-callback that fades each
 * element in as it scrolls into view, with a staggered delay.
 *
 * The reference reset a per-render counter (`this._revealCount = 0`) each pass;
 * here the counter lives in a ref and simply cycles (mod 5), which yields the
 * same staggered fade without accessing refs during render (lint-safe).
 */
export function useReveal(
  inTransit: boolean,
): (el: HTMLElement | null) => void {
  const obsRef = useRef<IntersectionObserver | null>(null);
  const countRef = useRef(0);

  useEffect(() => {
    return () => {
      obsRef.current?.disconnect();
      obsRef.current = null;
    };
  }, []);

  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      if (obsRef.current === null) {
        if (typeof IntersectionObserver === "undefined") return; // SSR guard
        obsRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                const t = e.target as HTMLElement;
                t.style.opacity = "1";
                t.style.transform = "translateY(0)";
                obsRef.current?.unobserve(t);
              }
            });
          },
          { threshold: 0.12 },
        );
      }
      const base = inTransit ? 0.75 : 0.1;
      const d = (base + (countRef.current++ % 5) * 0.1).toFixed(2);
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      el.style.transition = `opacity .8s ease ${d}s, transform .9s cubic-bezier(.2,.7,.3,1) ${d}s`;
      obsRef.current.observe(el);
    },
    [inTransit],
  );
}

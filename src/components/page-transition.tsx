"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        // Clear the transform after completion so position:fixed descendants
        // (e.g. the favorites-reveal gallery) are anchored to the viewport,
        // not to this element.  A non-zero transform creates a containing block
        // even when translate is 0, which breaks fixed positioning.
        onComplete: () => { gsap.set(el, { clearProps: "transform" }); },
      }
    );
    return () => { tween.kill(); };
  }, [pathname]);

  return (
    <div ref={ref}>
      {children}
    </div>
  );
}

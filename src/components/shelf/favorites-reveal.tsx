"use client";

import {
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import type { AnimeCategory, CollectedAnime } from "@/lib/types";
import { FavoritesScene } from "./favorites-scene";

interface FavoritesRevealProps {
  children: ReactNode;
  favorites: CollectedAnime[];
  onMove: (id: string, category: AnimeCategory) => void;
  onEpisodeChange: (id: string, episode: number) => void;
  onRemove: (id: string) => void;
}

export interface FavoritesRevealHandle {
  toggle: () => void;
  isOpen: boolean;
}

export const FavoritesReveal = forwardRef<
  FavoritesRevealHandle,
  FavoritesRevealProps
>(function FavoritesReveal(
  { children, favorites, onMove, onEpisodeChange, onRemove },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const animating = useRef(false);
  const doorLeftRef = useRef<HTMLDivElement>(null);
  const doorRightRef = useRef<HTMLDivElement>(null);
  const slitRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const openRef = useRef(false);

  const open = useCallback(() => {
    if (animating.current) return;
    if (
      !doorLeftRef.current ||
      !doorRightRef.current ||
      !galleryRef.current ||
      !slitRef.current
    )
      return;
    animating.current = true;
    openRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        animating.current = false;
        setIsOpen(true);
      },
    });

    tl.to(slitRef.current, {
      width: 8,
      boxShadow:
        "0 0 40px 12px rgba(200,220,255,0.3), 0 0 80px 30px rgba(180,200,240,0.15)",
      background:
        "linear-gradient(90deg, transparent 0%, rgba(210,225,255,0.7) 25%, rgba(255,255,255,0.95) 50%, rgba(210,225,255,0.7) 75%, transparent 100%)",
      duration: 0.3,
      ease: "power2.in",
    });

    tl.to(slitRef.current, {
      width: 20,
      background:
        "linear-gradient(90deg, transparent 0%, rgba(180,200,240,0.3) 20%, rgba(220,230,255,0.6) 50%, rgba(180,200,240,0.3) 80%, transparent 100%)",
      boxShadow:
        "0 0 50px 15px rgba(180,200,240,0.12), 0 0 100px 40px rgba(180,200,240,0.06)",
      duration: 0.4,
      ease: "power1.out",
    });
    tl.to(
      doorLeftRef.current,
      { x: "-100%", duration: 1.1, ease: "cubic-bezier(0.4, 0, 0.2, 1)" },
      "<"
    );
    tl.to(
      doorRightRef.current,
      { x: "100%", duration: 1.1, ease: "cubic-bezier(0.4, 0, 0.2, 1)" },
      "<"
    );
    tl.fromTo(
      galleryRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      "<"
    );

    tl.to(
      slitRef.current,
      {
        width: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
      },
      "-=0.6"
    );

    tl.to(hintRef.current, { opacity: 1, duration: 0.4 }, "-=0.2");

    tlRef.current = tl;
  }, []);

  const close = useCallback(() => {
    if (animating.current) return;
    if (!doorLeftRef.current || !doorRightRef.current || !galleryRef.current)
      return;
    animating.current = true;
    openRef.current = false;

    const tl = gsap.timeline({
      onComplete: () => {
        animating.current = false;
        setIsOpen(false);
        gsap.set(slitRef.current, {
          width: 0,
          opacity: 1,
          boxShadow: "none",
          background: "none",
        });
      },
    });

    tl.to(hintRef.current, { opacity: 0, duration: 0.2 });
    tl.to(
      galleryRef.current,
      { y: 40, opacity: 0, duration: 0.5, ease: "power2.in" },
      "<"
    );
    tl.to(
      doorLeftRef.current,
      { x: "0%", duration: 1.0, ease: "cubic-bezier(0.4, 0, 0.2, 1)" },
      "-=0.3"
    );
    tl.to(
      doorRightRef.current,
      { x: "0%", duration: 1.0, ease: "cubic-bezier(0.4, 0, 0.2, 1)" },
      "<"
    );

    tlRef.current = tl;
  }, []);

  const toggle = useCallback(() => {
    if (openRef.current) close();
    else open();
  }, [open, close]);

  useImperativeHandle(ref, () => ({ toggle, isOpen }), [toggle, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  return (
    <div className="relative" style={{ minHeight: 400 }}>
      {/* Gallery — fixed fullscreen below navbar */}
      <div
        ref={galleryRef}
        className="fixed left-0 right-0 bottom-0 overflow-hidden"
        style={{
          top: "3.5rem",
          opacity: 0,
          transform: "translateY(40px)",
          zIndex: 40,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <FavoritesScene
          items={favorites}
          onMove={onMove}
          onEpisodeChange={onEpisodeChange}
          onRemove={onRemove}
          onClose={close}
        />
      </div>

      {/* Slit — absolute within wrapper */}
      <div ref={slitRef} className="moon-slit" aria-hidden />

      {/* Door left — absolute within wrapper */}
      <div ref={doorLeftRef} className="fusuma-door fusuma-door-left">
        <div className="fusuma-content">{children}</div>
      </div>

      {/* Door right — absolute within wrapper */}
      <div ref={doorRightRef} className="fusuma-door fusuma-door-right">
        <div className="fusuma-content">{children}</div>
      </div>

      {/* Hint — fixed at bottom of viewport */}
      <div
        ref={hintRef}
        className="fixed bottom-4 left-1/2 -translate-x-1/2"
        style={{
          opacity: 0,
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase" as const,
          color: "rgba(200, 208, 224, 0.5)",
          fontFamily: "var(--font-display)",
          zIndex: 41,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        ESC to return
      </div>
    </div>
  );
});

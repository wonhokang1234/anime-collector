"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";

interface ShelfSectionProps {
  title: string;
  count: number;
  accent: "indigo" | "emerald" | "amber";
  defaultOpen?: boolean;
  children: React.ReactNode;
  emptyLabel?: string;
}

const ACCENT_STYLES: Record<
  ShelfSectionProps["accent"],
  { dot: string; rail: string; text: string }
> = {
  indigo: {
    dot: "bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.6)]",
    rail: "from-indigo-500/70 via-indigo-500/10 to-transparent",
    text: "text-indigo-300",
  },
  emerald: {
    dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]",
    rail: "from-emerald-500/70 via-emerald-500/10 to-transparent",
    text: "text-emerald-300",
  },
  amber: {
    dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]",
    rail: "from-amber-500/70 via-amber-500/10 to-transparent",
    text: "text-amber-300",
  },
};

export function ShelfSection({
  title,
  count,
  accent,
  defaultOpen = true,
  children,
  emptyLabel = "Nothing here yet.",
}: ShelfSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef<HTMLDivElement>(null);
  const styles = ACCENT_STYLES[accent];

  // Animate expand / collapse using GSAP — measure height, tween max-height.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    if (open) {
      gsap.set(el, { height: "auto" });
      const h = el.offsetHeight;
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        {
          height: h,
          opacity: 1,
          duration: 0.42,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(el, { height: "auto" });
          },
        }
      );
    } else {
      const h = el.offsetHeight;
      gsap.fromTo(
        el,
        { height: h, opacity: 1 },
        {
          height: 0,
          opacity: 0,
          duration: 0.32,
          ease: "power3.inOut",
        }
      );
    }
  }, [open]);

  return (
    <section className="relative">
      {/* Vertical rail accent */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b ${styles.rail}`}
        aria-hidden
      />

      <header
        className="group relative flex items-center justify-between pl-6 pr-2 py-3 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} aria-hidden />
          <h2 className="text-base font-semibold tracking-tight text-white">
            {title}
          </h2>
          <span className={`text-xs font-mono tabular-nums ${styles.text}`}>
            {count.toString().padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          aria-label={open ? "Collapse section" : "Expand section"}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors group-hover:text-zinc-200"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </header>

      <div
        ref={bodyRef}
        className="overflow-hidden"
        style={{ height: defaultOpen ? "auto" : 0 }}
      >
        <div className="pl-6 pr-2 pt-2 pb-8">
          {count === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 py-8 text-center text-xs text-zinc-500">
              {emptyLabel}
            </div>
          ) : (
            <div className="shelf-scroll -mx-2 px-2 pb-3 flex gap-4 overflow-x-auto">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

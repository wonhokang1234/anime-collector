"use client";

import type { SpineTone } from "./manga-spine";

interface SceneTabsProps {
  active: SpineTone;
  counts: Record<SpineTone, number>;
  onChange: (tone: SpineTone) => void;
}

const TABS: { tone: SpineTone; kanji: string; label: string }[] = [
  { tone: "watching", kanji: "鑑賞中", label: "Watching" },
  { tone: "plan", kanji: "予定", label: "Plan" },
  { tone: "watched", kanji: "完了", label: "Watched" },
];

export function SceneTabs({ active, counts, onChange }: SceneTabsProps) {
  return (
    <div
      role="tablist"
      className="flex gap-0 rounded-t-2xl border-b-2 border-white/10 bg-black/40 p-2"
    >
      {TABS.map(({ tone, kanji, label }) => {
        const isActive = tone === active;
        return (
          <button
            key={tone}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tone)}
            className={`relative flex-1 px-3 py-3 text-center transition-colors ${
              isActive
                ? "bg-gradient-to-b from-[var(--indigo-mid)] to-[var(--indigo-deep)] text-[var(--washi)]"
                : "text-[var(--washi)]/50 hover:text-[var(--washi)]/80"
            }`}
            style={{
              border: isActive
                ? "1px solid rgba(244,228,192,.4)"
                : "1px solid rgba(244,228,192,.08)",
              borderBottom: isActive
                ? "2px solid var(--hanko)"
                : "1px solid rgba(244,228,192,.08)",
              fontFamily: "var(--font-display)",
            }}
          >
            <div
              className="text-[9px] opacity-70"
              style={{ fontFamily: "var(--font-jp)" }}
            >
              {kanji}
            </div>
            <div className="text-[11px] font-bold tracking-[.2em]">
              {label.toUpperCase()}
            </div>
            {counts[tone] > 0 && (
              <div
                className="absolute -top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background: "var(--hanko)",
                  color: "var(--washi)",
                  fontFamily: "var(--font-display)",
                  transform: "rotate(-4deg)",
                  boxShadow: "0 2px 3px rgba(0,0,0,.4)",
                }}
              >
                {counts[tone]}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

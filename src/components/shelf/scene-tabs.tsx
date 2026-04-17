"use client";

import { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import gsap from "gsap";
import type { SpineTone } from "./manga-spine";

interface SceneTabsProps {
  active: SpineTone;
  counts: Record<SpineTone, number>;
  onChange: (tone: SpineTone) => void;
  isDragActive?: boolean;
}

const TABS: { tone: SpineTone; kanji: string; label: string; droppableId: string }[] = [
  { tone: "watching", kanji: "鑑賞中", label: "Watching", droppableId: "drop-watching" },
  { tone: "plan", kanji: "予定", label: "Plan", droppableId: "drop-plan" },
  { tone: "watched", kanji: "完了", label: "Watched", droppableId: "drop-watched" },
];

interface DroppableTabProps {
  tone: SpineTone;
  kanji: string;
  label: string;
  droppableId: string;
  isActive: boolean;
  count: number;
  isDragActive: boolean;
  onChange: (tone: SpineTone) => void;
}

function DroppableTab({
  tone,
  kanji,
  label,
  droppableId,
  isActive,
  count,
  isDragActive,
  onChange,
}: DroppableTabProps) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const badgeRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(count);
  const wasOver = useRef(false);

  useEffect(() => {
    if (count > prevCount.current && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1 },
        { scale: 1.15, duration: 0.1, ease: "power2.out", yoyo: true, repeat: 1 }
      );
    }
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    if (isOver && isDragActive && !wasOver.current && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1 },
        { scale: 1.1, duration: 0.1, ease: "power2.out", yoyo: true, repeat: 1 }
      );
    }
    wasOver.current = isOver;
  }, [isOver, isDragActive]);

  return (
    <button
      ref={setNodeRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onChange(tone)}
      className={`relative flex-1 px-3 py-3 text-center transition-colors ${
        isActive
          ? "bg-gradient-to-b from-[var(--indigo-mid)] to-[var(--indigo-deep)] text-[var(--washi)]"
          : "text-[var(--washi)]/50 hover:text-[var(--washi)]/80"
      }${isOver && isDragActive ? " tab-drop-hover" : ""}`}
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
      {count > 0 && (
        <div
          ref={badgeRef}
          className="absolute -top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            background: "var(--hanko)",
            color: "var(--washi)",
            fontFamily: "var(--font-display)",
            transform: "rotate(-4deg)",
            boxShadow: "0 2px 3px rgba(0,0,0,.4)",
          }}
        >
          {count}
        </div>
      )}
    </button>
  );
}

export function SceneTabs({ active, counts, onChange, isDragActive = false }: SceneTabsProps) {
  return (
    <div
      role="tablist"
      className="flex gap-0 rounded-t-2xl border-b-2 border-white/10 bg-black/40 p-2"
    >
      {TABS.map(({ tone, kanji, label, droppableId }) => (
        <DroppableTab
          key={tone}
          tone={tone}
          kanji={kanji}
          label={label}
          droppableId={droppableId}
          isActive={tone === active}
          count={counts[tone]}
          isDragActive={isDragActive}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

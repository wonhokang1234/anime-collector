"use client";

import { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import gsap from "gsap";
import { EASE } from "@/lib/motion";
import type { SpineTone } from "@/lib/types";

interface SceneTabsProps {
  active: SpineTone;
  counts: Record<SpineTone, number>;
  onChange: (tone: SpineTone) => void;
  isDragActive?: boolean;
}

const TABS: {
  tone: SpineTone;
  kanji: string;
  label: string;
  droppableId: string;
}[] = [
  {
    tone: "watching",
    kanji: "鑑賞中",
    label: "Watching",
    droppableId: "drop-watching",
  },
  { tone: "plan", kanji: "予定", label: "Plan", droppableId: "drop-plan" },
  {
    tone: "watched",
    kanji: "完了",
    label: "Watched",
    droppableId: "drop-watched",
  },
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
  const badgeTweenRef = useRef<gsap.core.Tween | null>(null);
  const prevCount = useRef(count);
  const wasOver = useRef(false);

  useEffect(() => {
    if (count > prevCount.current && badgeRef.current) {
      badgeTweenRef.current?.kill();
      badgeTweenRef.current = gsap.fromTo(
        badgeRef.current,
        { scale: 1 },
        {
          scale: 1.3,
          duration: 0.5,
          ease: EASE.spring,
          yoyo: true,
          repeat: 1,
        },
      );
    }
    prevCount.current = count;
    return () => {
      badgeTweenRef.current?.kill();
    };
  }, [count]);

  useEffect(() => {
    if (isOver && isDragActive && !wasOver.current && badgeRef.current) {
      badgeTweenRef.current?.kill();
      badgeTweenRef.current = gsap.fromTo(
        badgeRef.current,
        { scale: 1 },
        {
          scale: 1.3,
          duration: 0.5,
          ease: EASE.spring,
          yoyo: true,
          repeat: 1,
        },
      );
    }
    wasOver.current = isOver;
    return () => {
      badgeTweenRef.current?.kill();
    };
  }, [isOver, isDragActive]);

  return (
    <button
      ref={setNodeRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onChange(tone)}
      className={`relative flex-1 px-3 py-3 text-center transition-colors${
        isOver && isDragActive ? " tab-drop-hover" : ""
      }`}
      style={{
        border: "none",
        boxShadow: isActive ? "inset 0 -2px 0 var(--accent)" : "none",
        background: "transparent",
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
        fontFamily: "var(--font-sans)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--text-secondary)";
        }
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
            background: "var(--accent-tint)",
            color: "var(--accent)",
            fontFamily: "var(--font-sans)",
            transform: "rotate(-4deg)",
          }}
        >
          {count}
        </div>
      )}
    </button>
  );
}

export function SceneTabs({
  active,
  counts,
  onChange,
  isDragActive = false,
}: SceneTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  // Stagger-in tabs on mount
  useEffect(() => {
    if (!tabsRef.current) return;
    const tabs = Array.from(
      tabsRef.current.querySelectorAll("[role=tab]"),
    ) as HTMLElement[];
    const tween = gsap.fromTo(
      tabs,
      { opacity: 0, y: 4 },
      {
        opacity: 1,
        y: 0,
        duration: 0.22,
        stagger: { each: 0.035 },
        ease: "power2.out",
      },
    );
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={tabsRef}
      role="tablist"
      className="flex gap-0 rounded-t-2xl"
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
      }}
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

"use client";

import { AREAS, useGardenStore } from "@/stores/garden-store";
import type { GardenView, Mood } from "@/lib/garden/types";
import type { DerivedGarden } from "@/lib/garden/adapter";

interface QuickTravelProps {
  derived: DerivedGarden;
}

const ORDER: GardenView[] = ["world", "grove", "pond", "seeds", "stone"];

const rowBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 10px",
  borderRadius: 9,
  cursor: "pointer",
};

export function QuickTravel({ derived }: QuickTravelProps) {
  const qtOpen = useGardenStore((s) => s.qtOpen);
  const view = useGardenStore((s) => s.view);
  const mood = useGardenStore((s) => s.mood);
  const travel = useGardenStore((s) => s.travel);
  const toggleQt = useGardenStore((s) => s.toggleQt);
  const setMood = useGardenStore((s) => s.setMood);

  const stats: Record<GardenView, string> = {
    world: "walk with the arrow keys",
    grove: `${derived.growing.length} trees growing`,
    pond: `${derived.done.length} koi at home`,
    seeds: `${derived.seeds.length} seeds waiting`,
    stone: `${derived.hours} hours recorded`,
  };

  return (
    <div style={{ position: "fixed", top: 16, left: 16, zIndex: 90 }}>
      {/* Toggle pill */}
      <div
        onClick={toggleQt}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleQt();
          }
        }}
        aria-expanded={qtOpen}
        aria-label="Quick travel"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          borderRadius: 24,
          background: "rgba(8,14,11,.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid var(--line2)",
          cursor: "pointer",
          boxShadow: "0 8px 26px rgba(0,0,0,.4)",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            transform: "rotate(45deg)",
            background:
              "linear-gradient(135deg,var(--gold),color-mix(in oklab, var(--gold) 55%, #000))",
            boxShadow:
              "0 0 10px color-mix(in oklab, var(--gold) 55%, transparent)",
            borderRadius: 2,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mincho), serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".18em",
            color: "var(--ink)",
          }}
        >
          早移動{" "}
          <span
            style={{
              fontFamily: "var(--font-kaku), sans-serif",
              fontWeight: 500,
              fontSize: 11.5,
              color: "var(--mut)",
              letterSpacing: ".22em",
            }}
          >
            QUICK TRAVEL
          </span>
        </span>
      </div>

      {/* Dropdown */}
      {qtOpen && (
        <div
          style={{
            marginTop: 8,
            width: 256,
            background: "rgba(8,14,11,.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid var(--line2)",
            borderRadius: 14,
            padding: 8,
            boxShadow: "0 18px 46px rgba(0,0,0,.55)",
            animation: "mg-riseIn .25s ease-out both",
          }}
        >
          {ORDER.map((key) => {
            const current = view === key;
            return (
              <div
                key={key}
                onClick={() => travel(key)}
                className="mg-qt-row"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    travel(key);
                  }
                }}
                style={{
                  ...rowBase,
                  background: current
                    ? "color-mix(in oklab, var(--moss) 10%, transparent)"
                    : "transparent",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mincho), serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--moss)",
                    width: 36,
                  }}
                >
                  {AREAS[key].kanji}
                </span>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "var(--ink)",
                    }}
                  >
                    {AREAS[key].en}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 10.5,
                      color: "var(--dim)",
                    }}
                  >
                    {stats[key]}
                  </p>
                </div>
                {current && (
                  <span style={{ fontSize: 11, color: "var(--gold)" }}>◆</span>
                )}
              </div>
            );
          })}

          {/* Mood toggle */}
          <MoodRow mood={mood} setMood={setMood} />
        </div>
      )}
    </div>
  );
}

function MoodRow({
  mood,
  setMood,
}: {
  mood: Mood;
  setMood: (m: Mood) => void;
}) {
  const isMidnight = mood === "midnight";
  const kanji = isMidnight ? "月" : "陽";
  const label = isMidnight ? "Midnight" : "Dawn";
  const stat = isMidnight ? "lanterns lit" : "morning light";
  const other: Mood = isMidnight ? "dawn" : "midnight";

  return (
    <div
      onClick={() => setMood(other)}
      className="mg-qt-row"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setMood(other);
        }
      }}
      style={{
        ...rowBase,
        marginTop: 6,
        paddingTop: 12,
        borderTop: "1px solid var(--line)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mincho), serif",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--moss)",
          width: 36,
        }}
      >
        {kanji}
      </span>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 10.5, color: "var(--dim)" }}>{stat}</p>
      </div>
    </div>
  );
}

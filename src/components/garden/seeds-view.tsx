"use client";

import { useCollectionStore } from "@/stores/collection-store";
import { useGardenStore } from "@/stores/garden-store";
import type { GardenAnime } from "@/lib/garden/types";
import { useReveal } from "./use-reveal";

/** The Seed Store — plan-to-watch titles in paper envelopes (reference lines 202–227). */
export function SeedsView({ garden }: { garden: GardenAnime[] }) {
  const seeds = garden.filter((a) => a.status === "plan");
  const updateCategory = useCollectionStore((s) => s.updateCategory);
  const travel = useGardenStore((s) => s.travel);
  const reveal = useReveal(useGardenStore((s) => !!s.transit));

  if (seeds.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          padding: "40px 20px",
          fontStyle: "italic",
          color: "var(--dim)",
          fontSize: 13.5,
        }}
      >
        The store is empty. Every story you gathered is growing or has bloomed.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
        gap: 16,
      }}
    >
      {seeds.map((a) => (
        <div
          key={a.id}
          ref={reveal}
          className="mg-seed-card"
          style={{
            background: "color-mix(in oklab, var(--panel) 72%, transparent)",
            border: "1px solid var(--line)",
            borderRadius: "4px 4px 16px 16px",
            padding: 18,
            position: "relative",
            transition: "transform .3s, border-color .3s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 20,
              background: "color-mix(in oklab, var(--panel2) 90%, transparent)",
              borderBottom: "1px dashed var(--line2)",
              borderRadius: "4px 4px 0 0",
            }}
          />
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <div
              style={{
                width: 46,
                height: 58,
                margin: "0 auto",
                borderRadius: "50% 50% 50% 50% / 38% 38% 62% 62%",
                background: `linear-gradient(160deg, ${a.c1}, ${a.c2})`,
                display: "grid",
                placeItems: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,.35)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mincho), serif",
                  fontSize: 19,
                  color: "rgba(255,255,255,.9)",
                }}
              >
                {a.kanji.charAt(0)}
              </span>
            </div>
            <p
              style={{
                margin: "12px 0 2px",
                fontFamily: "var(--font-mincho), serif",
                fontSize: 14.5,
                fontWeight: 700,
              }}
            >
              {a.title}
            </p>
            <p
              style={{ margin: "0 0 13px", fontSize: 11, color: "var(--dim)" }}
            >
              {a.genre || "—"} · {a.eps} episodes
            </p>
            <button
              type="button"
              onClick={() => {
                updateCategory(a.id, "watching");
                travel("grove");
              }}
              className="mg-plant-btn"
              aria-label={`Plant ${a.title}`}
              style={{
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: 18,
                border: "1px solid var(--line2)",
                color: "var(--moss)",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "inherit",
                background: "transparent",
                cursor: "pointer",
                transition: "background .3s",
              }}
            >
              種を蒔く · Plant
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

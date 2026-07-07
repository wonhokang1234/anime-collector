"use client";

import { useCollectionStore } from "@/stores/collection-store";
import { useGardenStore } from "@/stores/garden-store";
import { getRarityTier } from "@/lib/types";
import type { DerivedGarden } from "@/lib/garden/adapter";
import { useReveal } from "./use-reveal";

const divider = (
  <div
    style={{
      width: 40,
      height: 1,
      background: "var(--dim)",
      margin: "0 auto",
      opacity: 0.4,
    }}
  />
);

/** The Records House — an engraved monument of the garden's totals (reference lines 229–251). */
export function RecordView({ derived }: { derived: DerivedGarden }) {
  const reveal = useReveal(useGardenStore((s) => !!s.transit));
  const items = useCollectionStore((s) => s.items);

  const rarest = items.length
    ? items.reduce((best, it) => (it.score > best.score ? it : best), items[0])
    : null;
  const rarestTier = rarest
    ? getRarityTier(rarest.score).replace(/^./, (c) => c.toUpperCase())
    : null;

  return (
    <>
      <div
        ref={reveal}
        style={{
          position: "relative",
          maxWidth: 460,
          margin: "0 auto",
          // reference says 115%, clamped to 100% (color-mix > 100% is invalid CSS)
          background:
            "linear-gradient(172deg,color-mix(in oklab, var(--pot) 100%, #fff 4%),color-mix(in oklab, var(--pot) 80%, #000))",
          borderRadius: "46% 54% 8px 8px / 14% 14% 8px 8px",
          padding: "46px 40px 40px",
          boxShadow:
            "0 24px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: "112%",
            height: 22,
            borderRadius: "50%",
            background: "var(--leaf3)",
            opacity: 0.7,
          }}
        />
        <p
          style={{
            margin: "0 0 26px",
            fontFamily: "var(--font-mincho), serif",
            fontSize: 13,
            letterSpacing: ".5em",
            color: "var(--mut)",
          }}
        >
          庭 の 記 録
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Stat value={derived.hours} label="HOURS OF TENDING" />
          {divider}
          <Stat value={derived.done.length} label="KOI RELEASED" />
          {divider}
          <Stat value={derived.growing.length} label="TREES GROWING" />
          {divider}
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mincho), serif",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--ink)",
                letterSpacing: ".1em",
              }}
            >
              {derived.topGenre}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                letterSpacing: ".25em",
                color: "var(--mut)",
              }}
            >
              THE SOIL YOU FAVOR
            </p>
          </div>
          {rarest && rarestTier && (
            <>
              {divider}
              <div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mincho), serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--ink)",
                    letterSpacing: ".1em",
                  }}
                >
                  {rarestTier}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 11,
                    letterSpacing: ".25em",
                    color: "var(--mut)",
                  }}
                >
                  RAREST BLOOM
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 11,
                    color: "var(--dim)",
                  }}
                >
                  {rarest.title}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <p
        style={{
          margin: "38px auto 0",
          maxWidth: 340,
          fontSize: 12.5,
          fontWeight: 300,
          fontStyle: "italic",
          lineHeight: 2,
          color: "var(--dim)",
        }}
      >
        &ldquo;A garden is never finished.
        <br />
        It is only ever tended.&rdquo;
      </p>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-mincho), serif",
          fontSize: 34,
          fontWeight: 900,
          color: "var(--ink)",
        }}
      >
        {value}
      </p>
      <p
        style={{
          margin: "2px 0 0",
          fontSize: 11,
          letterSpacing: ".25em",
          color: "var(--mut)",
        }}
      >
        {label}
      </p>
    </div>
  );
}

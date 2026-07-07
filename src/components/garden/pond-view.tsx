"use client";

import { useRef } from "react";
import { useCollectionStore } from "@/stores/collection-store";
import { useGardenStore } from "@/stores/garden-store";
import type { GardenAnime } from "@/lib/garden/types";
import { Koi } from "./koi";

const ANCH = [
  [16, 22],
  [55, 30],
  [30, 58],
  [66, 62],
  [44, 40],
  [12, 68],
  [72, 18],
  [50, 74],
  [24, 38],
];
const SWIMS = ["mg-swimA", "mg-swimB", "mg-swimC"];

/** The Pond — one koi for every completed story (reference lines 146–200). */
export function PondView({ garden }: { garden: GardenAnime[] }) {
  const done = garden.filter((a) => a.status === "completed");
  const selectedKoi = useGardenStore((s) => s.selectedKoi);
  const selectKoi = useGardenStore((s) => s.selectKoi);
  const updateRating = useCollectionStore((s) => s.updateRating);
  // double-tap guard: ignore rating clicks within 300ms of the last accepted one
  const lastTap = useRef(0);

  const sel = selectedKoi
    ? (done.find((a) => a.id === selectedKoi) ?? null)
    : null;

  return (
    <div
      style={{
        position: "relative",
        padding: 34,
        animation: "mg-riseIn .9s 1s ease-out both",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50% / 42%",
          border: "1px solid var(--sandline)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 12,
          borderRadius: "50% / 42%",
          border: "1px solid var(--sandline)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 24,
          borderRadius: "50% / 42%",
          border: "1px solid var(--sandline)",
        }}
      />
      <div
        style={{
          position: "relative",
          height: 470,
          borderRadius: "46% 54% 52% 48% / 38% 42% 58% 62%",
          overflow: "hidden",
          border: "1px solid var(--line)",
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%,var(--pond1),var(--pond2) 78%)",
        }}
      >
        {/* water striations */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(105deg,transparent 0 34px,color-mix(in oklab, var(--ink) 2.5%, transparent) 34px 36px)",
          }}
        />
        {/* lily pads + petal + rocks */}
        <div
          style={{
            position: "absolute",
            left: "10%",
            top: "13%",
            width: 76,
            height: 52,
            borderRadius: "50%",
            background: "var(--leaf3)",
            boxShadow: "inset 0 3px 8px rgba(0,0,0,.35)",
            animation: "mg-bob 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "15%",
            top: "10%",
            width: 15,
            height: 15,
            borderRadius: "50% 50% 50% 0",
            background: "var(--blossom)",
            transform: "rotate(-40deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "11%",
            bottom: "16%",
            width: 94,
            height: 62,
            borderRadius: "50%",
            background: "var(--leaf1)",
            opacity: 0.75,
            boxShadow: "inset 0 3px 8px rgba(0,0,0,.35)",
            animation: "mg-bob 10s 1s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -36,
            bottom: -44,
            width: 180,
            height: 126,
            borderRadius: "50%",
            background: "var(--pot)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -44,
            top: -36,
            width: 196,
            height: 120,
            borderRadius: "50%",
            background: "color-mix(in oklab, var(--pot) 86%, #000)",
          }}
        />

        {/* koi */}
        {done.map((a, i) => {
          const anchor = ANCH[i % ANCH.length];
          return (
            <div
              key={a.id}
              style={{
                position: "absolute",
                left: `${anchor[0]}%`,
                top: `${anchor[1]}%`,
                animation: `${SWIMS[i % 3]} ${16 + (i % 5) * 4}s ease-in-out ${-i * 3}s infinite`,
                zIndex: 3,
              }}
            >
              <div
                className="mg-koi-hover"
                role="button"
                tabIndex={0}
                aria-label={`Remember ${a.title}`}
                onClick={() => selectKoi(a.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    selectKoi(a.id);
                  }
                }}
                style={{ cursor: "pointer", transition: "filter .3s" }}
              >
                <Koi
                  c1={a.c1}
                  c2={a.c2}
                  rating={a.rating}
                  glyph={a.kanji.slice(0, 3)}
                  favorite={a.favorite}
                />
              </div>
            </div>
          );
        })}

        {done.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mincho), serif",
                fontSize: 15,
                color: "var(--dim)",
                fontStyle: "italic",
              }}
            >
              The water is still. Release a finished story and life begins.
            </p>
          </div>
        )}

        {sel && (
          <div
            style={{
              position: "absolute",
              left: 20,
              bottom: 20,
              right: 20,
              maxWidth: 430,
              background: "color-mix(in oklab, var(--bg) 88%, transparent)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--line2)",
              borderRadius: 16,
              padding: "18px 22px",
              animation: "mg-riseIn .35s ease-out both",
              zIndex: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mincho), serif",
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                {sel.title}
              </p>
              <span style={{ fontSize: 11.5, color: "var(--moss)" }}>
                {sel.kanji}
              </span>
              <button
                type="button"
                className="mg-close"
                aria-label="Close"
                onClick={() => selectKoi(null)}
                style={{
                  marginLeft: "auto",
                  color: "var(--dim)",
                  cursor: "pointer",
                  fontSize: 15,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            <p
              style={{
                margin: "6px 0 10px",
                fontSize: 12.5,
                fontWeight: 300,
                lineHeight: 1.8,
                color: "var(--mut)",
              }}
            >
              {sel.syn}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: ".25em",
                  color: "var(--dim)",
                }}
              >
                BLOOM
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className="mg-bloom"
                    role="button"
                    tabIndex={0}
                    aria-label={`Rate ${i + 1} of 5`}
                    onClick={() => {
                      const now = Date.now();
                      if (now - lastTap.current < 300) return;
                      lastTap.current = now;
                      updateRating(sel.id, sel.rating === i + 1 ? null : i + 1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        const now = Date.now();
                        if (now - lastTap.current < 300) return;
                        lastTap.current = now;
                        updateRating(
                          sel.id,
                          sel.rating === i + 1 ? null : i + 1,
                        );
                      }
                    }}
                    style={{
                      fontSize: 19,
                      cursor: "pointer",
                      color: i < sel.rating ? "var(--blossom)" : "var(--line2)",
                      transition: "transform .15s",
                      display: "inline-block",
                    }}
                  >
                    ✿
                  </span>
                ))}
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11.5,
                  color: "var(--dim)",
                }}
              >
                {sel.eps} episodes lived
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

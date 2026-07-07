"use client";

import type { FC, ReactNode } from "react";
import type { GardenView, GardenAnime } from "@/lib/garden/types";
import type { DerivedGarden } from "@/lib/garden/adapter";
import { useGardenStore } from "@/stores/garden-store";
import { GroveView } from "./grove-view";
import { PondView } from "./pond-view";
import { SeedsView } from "./seeds-view";
import { RecordView } from "./record-view";

// petals: reference line 526 — [left%, size, duration, delay]
const PET = [
  [8, 7, 13, 0],
  [22, 9, 17, 3],
  [38, 8, 15, 6],
  [55, 10, 19, 1.5],
  [70, 7, 14, 8],
  [84, 9, 16, 4.5],
];
// fireflies (midnight only): [left%, top%, duration]
const FIRE = [
  [12, 30, 11],
  [28, 64, 13],
  [55, 42, 17],
  [72, 70, 12],
  [86, 25, 15],
];

interface Header {
  kanji: string;
  title: string;
  sub: string | null;
  maxW: number;
  label: string;
  headerMb: number;
  titleMb: number;
}

/** Shared interior chrome for the four indoor areas (reference lines 91–99, 253–260). */
export const InteriorShell: FC<{
  view: GardenView;
  garden: GardenAnime[];
  derived: DerivedGarden;
}> = ({ view, garden, derived }) => {
  const mood = useGardenStore((s) => s.mood);
  const travel = useGardenStore((s) => s.travel);

  const headers: Record<Exclude<GardenView, "world">, Header> = {
    grove: {
      kanji: "盆 栽 の 段",
      title: "The Grove",
      sub: "Each tree is a story you are living through. Water it, and watch it take shape.",
      maxW: 1060,
      label: "Bonsai grove",
      headerMb: 10,
      titleMb: 0,
    },
    pond: {
      kanji: "池",
      title: "The Pond",
      sub: `${derived.done.length} koi live in this water — one for every story carried to its end. Touch one to remember it.`,
      maxW: 1080,
      label: "Koi pond",
      headerMb: 30,
      titleMb: 0,
    },
    seeds: {
      kanji: "種 蔵",
      title: "The Seed Store",
      sub: "Stories you mean to grow, asleep in their paper envelopes.",
      maxW: 900,
      label: "Seed store",
      headerMb: 30,
      titleMb: 0,
    },
    stone: {
      kanji: "記 録 の 家",
      title: "The Records House",
      sub: null,
      maxW: 760,
      label: "Records house",
      headerMb: 0,
      titleMb: 30,
    },
  };

  const cfg = headers[view as Exclude<GardenView, "world">];

  let body: ReactNode = null;
  if (view === "grove") body = <GroveView garden={garden} />;
  else if (view === "pond") body = <PondView garden={garden} />;
  else if (view === "seeds") body = <SeedsView garden={garden} />;
  else if (view === "stone") body = <RecordView derived={derived} />;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 20,
        background: "var(--bg)",
        minHeight: "100vh",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* ambient layer: sand lines + drifting petals + fireflies */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg,var(--sandline) 0 1px,transparent 1px 26px)",
          }}
        />
        {PET.map((p, i) => (
          <span
            key={`p${i}`}
            style={{
              position: "absolute",
              left: `${p[0]}%`,
              top: "-4vh",
              width: p[1],
              height: p[1],
              borderRadius: "50% 50% 50% 0",
              background:
                i % 2 === 0
                  ? "var(--blossom)"
                  : "color-mix(in oklab, var(--blossom) 75%, var(--bg))",
              animation: `mg-petalDrift ${p[2]}s ${p[3]}s linear infinite`,
              opacity: 0,
            }}
          />
        ))}
        {mood === "midnight" &&
          FIRE.map((f, i) => (
            <div
              key={`f${i}`}
              style={{
                position: "absolute",
                left: `${f[0]}%`,
                top: `${f[1]}%`,
                width: 4,
                height: 4,
                animation: `mg-fireflyMove ${f[2]}s ease-in-out infinite`,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#ffd98a",
                  boxShadow: "0 0 10px 3px rgba(255,217,138,.5)",
                  animation: `mg-fireflyGlow ${f[2]}s linear infinite`,
                  opacity: 0,
                }}
              />
            </div>
          ))}
      </div>

      {/* area container: header + body */}
      <div
        data-screen-label={cfg.label}
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: cfg.maxW,
          margin: "0 auto",
          padding: "70px 24px 30px",
          ...(view === "stone" ? { textAlign: "center" } : {}),
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: cfg.headerMb,
            animation: "mg-riseIn .8s .8s ease-out both",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 10.5,
              letterSpacing: ".55em",
              color: "var(--dim)",
            }}
          >
            {cfg.kanji}
          </p>
          <h2
            style={{
              margin: 0,
              marginBottom: cfg.titleMb,
              fontFamily: "var(--font-mincho), serif",
              fontSize: "clamp(24px,3vw,34px)",
              fontWeight: 700,
              letterSpacing: ".16em",
            }}
          >
            {cfg.title}
          </h2>
          {cfg.sub && (
            <p
              style={{
                margin: "10px auto 0",
                maxWidth: 420,
                fontSize: 13,
                fontWeight: 300,
                lineHeight: 1.9,
                color: "var(--mut)",
              }}
            >
              {cfg.sub}
            </p>
          )}
        </div>
        {body}
      </div>

      {/* footer: walk back */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1080,
          margin: "0 auto",
          padding: "30px 24px 70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "mg-riseIn .8s 1.15s ease-out both",
        }}
      >
        <button
          type="button"
          onClick={() => travel("world")}
          className="mg-back-btn"
          aria-label="Step back into the garden"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 26px",
            borderRadius: 26,
            border: "1px solid var(--line2)",
            background: "transparent",
            cursor: "pointer",
            transition: "background .3s, border-color .3s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mincho), serif",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--moss)",
            }}
          >
            ⟵ 庭に戻る
          </span>
          <span style={{ fontSize: 12.5, color: "var(--mut)" }}>
            Step back into the garden
          </span>
        </button>
      </div>
    </div>
  );
};

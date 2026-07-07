"use client";

import { ZONES } from "@/stores/garden-store";

interface WorldHudProps {
  near: string | null;
  promptOn: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
}

export function WorldHud({ near, promptOn, zoomIn, zoomOut }: WorldHudProps) {
  const nearLabel =
    near && near in ZONES ? ZONES[near as keyof typeof ZONES].prompt : "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {/* Title lockup */}
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 0,
          right: 0,
          textAlign: "center",
          animation: "mg-riseIn .9s .2s ease-out both",
        }}
      >
        <p
          style={{
            margin: "0 0 5px",
            fontSize: 10,
            letterSpacing: ".6em",
            color: "var(--moss)",
            textShadow: "0 1px 8px rgba(0,0,0,.7)",
          }}
        >
          苔 の 庭
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-mincho), serif",
            fontSize: "clamp(20px,2.6vw,30px)",
            fontWeight: 900,
            letterSpacing: ".34em",
            color: "var(--ink)",
            textShadow: "0 2px 18px rgba(0,0,0,.7)",
          }}
        >
          MOSS GARDEN
        </h1>
      </div>

      {/* Interact prompt */}
      {promptOn && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "6%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 22px",
            borderRadius: 28,
            background: "rgba(8,14,11,.78)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid var(--gold)",
            boxShadow:
              "0 0 26px color-mix(in oklab, var(--gold) 25%, transparent)",
            animation: "mg-promptPulse 1.6s ease-in-out infinite",
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              border: "1.5px solid var(--gold)",
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--gold)",
              background: "color-mix(in oklab, var(--gold) 12%, transparent)",
            }}
          >
            E
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: ".14em",
              color: "var(--ink)",
            }}
          >
            {nearLabel}
          </span>
        </div>
      )}

      {/* Bottom-left controls hint (desktop only) */}
      <div
        className="hidden md:block"
        style={{
          position: "absolute",
          left: 22,
          bottom: 18,
          fontSize: 10.5,
          letterSpacing: ".22em",
          color: "var(--mut)",
          textShadow: "0 1px 6px rgba(0,0,0,.8)",
        }}
      >
        ↑↓←→ / WASD — WALK · E — ENTER · SCROLL — ZOOM
      </div>

      {/* Bottom-right zoom buttons */}
      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 52,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          aria-label="Zoom in"
          onClick={zoomIn}
          className="mg-zoom-btn"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(8,14,11,.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid var(--line2)",
            display: "grid",
            placeItems: "center",
            fontSize: 17,
            color: "var(--ink)",
            cursor: "pointer",
            userSelect: "none",
            padding: 0,
          }}
        >
          ＋
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={zoomOut}
          className="mg-zoom-btn"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(8,14,11,.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid var(--line2)",
            display: "grid",
            placeItems: "center",
            fontSize: 17,
            color: "var(--ink)",
            cursor: "pointer",
            userSelect: "none",
            padding: 0,
          }}
        >
          −
        </button>
      </div>

      {/* Bottom-right label */}
      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 18,
          fontSize: 10.5,
          letterSpacing: ".3em",
          color: "var(--dim)",
          textShadow: "0 1px 6px rgba(0,0,0,.8)",
        }}
      >
        庭 を 歩 く
      </div>
    </div>
  );
}

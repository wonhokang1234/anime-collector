"use client";

import type { CSSProperties, FC } from "react";
import { AREAS, type Transit } from "@/stores/garden-store";

/**
 * Themed travel overlay — reference "Garden World 3D" lines 263–318.
 * Five kinds (walk / leaf / ripple / paper / ink) plus a centered label
 * block that shows ONLY during the closing phase. The whole overlay is
 * decorative: the destination view announces itself on arrival, so we keep
 * it aria-hidden and skip a live region (simple option per Task 10 spec).
 */
export const TransitionOverlay: FC<{ transit: Transit }> = ({ transit }) => {
  const { kind, phase, to } = transit;
  const area = AREAS[to];
  const closing = phase === "closing";

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    overflow: "hidden",
    pointerEvents: phase === "opening" ? "none" : "auto",
    animation:
      phase === "opening" ? "mg-fadeOutSoft .65s ease-out both" : "none",
  };

  const latticeStyle: CSSProperties = {
    position: "absolute",
    inset: 14,
    border: "2px solid color-mix(in oklab, var(--line2) 80%, transparent)",
    background:
      "repeating-linear-gradient(90deg,var(--line) 0 2px,transparent 2px 96px),repeating-linear-gradient(0deg,var(--line) 0 2px,transparent 2px 96px)",
  };

  return (
    <div style={overlayStyle} aria-hidden="true">
      {kind === "walk" && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "51.5%",
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--panel) 94%, #fff 3%), var(--panel2))",
              boxShadow: "10px 0 40px rgba(0,0,0,.45)",
              borderRight: "4px solid var(--line2)",
              animation:
                "mg-shojiCloseL .6s cubic-bezier(.55,.06,.28,.99) both",
            }}
          >
            <div style={latticeStyle} />
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: "51.5%",
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--panel) 94%, #fff 3%), var(--panel2))",
              boxShadow: "-10px 0 40px rgba(0,0,0,.45)",
              borderLeft: "4px solid var(--line2)",
              animation:
                "mg-shojiCloseR .6s cubic-bezier(.55,.06,.28,.99) both",
            }}
          >
            <div style={latticeStyle} />
          </div>
        </>
      )}

      {kind === "leaf" && (
        <>
          <div
            style={{
              position: "absolute",
              left: "10%",
              top: "16%",
              width: "56vmax",
              height: "56vmax",
              margin: "-28vmax",
              borderRadius: "58% 42% 55% 45%/55% 60% 40% 45%",
              background: "var(--leaf1)",
              animation: "mg-blobIn .5s 0s cubic-bezier(.3,.7,.4,1) both",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "82%",
              top: "26%",
              width: "52vmax",
              height: "52vmax",
              margin: "-26vmax",
              borderRadius: "45% 55% 48% 52%/60% 45% 55% 40%",
              background: "var(--leaf2)",
              animation: "mg-blobIn .5s .1s cubic-bezier(.3,.7,.4,1) both",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "30%",
              top: "88%",
              width: "58vmax",
              height: "58vmax",
              margin: "-29vmax",
              borderRadius: "52% 48% 60% 40%/45% 55% 45% 55%",
              background: "var(--leaf3)",
              animation: "mg-blobIn .5s .18s cubic-bezier(.3,.7,.4,1) both",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "70%",
              top: "78%",
              width: "48vmax",
              height: "48vmax",
              margin: "-24vmax",
              borderRadius: "48% 52% 45% 55%/55% 48% 52% 45%",
              background: "var(--leaf1)",
              animation: "mg-blobIn .5s .26s cubic-bezier(.3,.7,.4,1) both",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "45%",
              width: "60vmax",
              height: "60vmax",
              margin: "-30vmax",
              borderRadius: "50% 50% 46% 54%/52% 48% 52% 48%",
              background: "var(--leaf2)",
              animation: "mg-blobIn .55s .32s cubic-bezier(.3,.7,.4,1) both",
            }}
          />
        </>
      )}

      {kind === "ripple" && (
        <>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "22vmax",
              height: "22vmax",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,var(--pond1),var(--pond2) 75%)",
              animation:
                "mg-rippleCover .65s .1s cubic-bezier(.4,.6,.4,1) both",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "22vmax",
              height: "22vmax",
              borderRadius: "50%",
              border:
                "3px solid color-mix(in oklab, var(--moss) 70%, transparent)",
              animation: "mg-ringCover .8s cubic-bezier(.3,.7,.4,1) both",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "44%",
              bottom: "20%",
              width: 14,
              height: 14,
              borderRadius: "50%",
              border:
                "2px solid color-mix(in oklab, var(--ink) 40%, transparent)",
              animation: "mg-bubbleUp 1.4s .5s ease-out both",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "55%",
              bottom: "14%",
              width: 10,
              height: 10,
              borderRadius: "50%",
              border:
                "2px solid color-mix(in oklab, var(--ink) 35%, transparent)",
              animation: "mg-bubbleUp 1.5s .7s ease-out both",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "49%",
              bottom: "10%",
              width: 7,
              height: 7,
              borderRadius: "50%",
              border:
                "2px solid color-mix(in oklab, var(--ink) 30%, transparent)",
              animation: "mg-bubbleUp 1.3s .9s ease-out both",
            }}
          />
        </>
      )}

      {kind === "paper" && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: "51%",
              background:
                "linear-gradient(180deg,color-mix(in oklab, var(--panel) 96%, #fff 4%),var(--panel2))",
              borderBottom: "2px dashed var(--line2)",
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              animation: "mg-paperT .55s cubic-bezier(.55,.06,.28,.99) both",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 12,
                border:
                  "1px solid color-mix(in oklab, var(--line2) 60%, transparent)",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "51%",
              background:
                "linear-gradient(0deg,color-mix(in oklab, var(--panel) 96%, #fff 4%),var(--panel2))",
              borderTop: "2px dashed var(--line2)",
              boxShadow: "0 -8px 30px rgba(0,0,0,.4)",
              animation:
                "mg-paperB .55s .06s cubic-bezier(.55,.06,.28,.99) both",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 12,
                border:
                  "1px solid color-mix(in oklab, var(--line2) 60%, transparent)",
              }}
            />
          </div>
        </>
      )}

      {kind === "ink" && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "20vmax",
            height: "20vmax",
            borderRadius: "40% 60% 55% 45%/50% 45% 60% 50%",
            background: "#0d100c",
            animation: "mg-inkCover .7s .05s cubic-bezier(.45,.5,.4,1) both",
          }}
        />
      )}

      {closing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            zIndex: 5,
            animation: "mg-walkFade 1.5s ease-out both",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 44,
                height: 1,
                background: "var(--gold)",
                margin: "0 auto 18px",
                opacity: 0.8,
              }}
            />
            <p
              style={{
                margin: "0 0 12px",
                fontFamily: "var(--font-mincho), serif",
                fontSize: 40,
                fontWeight: 900,
                letterSpacing: ".3em",
                color: "#f2f4ef",
                textShadow: "0 2px 20px rgba(0,0,0,.6)",
              }}
            >
              {area.kanji}
            </p>
            {kind === "walk" && (
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 11,
                    borderRadius: "50%",
                    background: "var(--dim)",
                    animation: "mg-stepIn .5s .15s ease-out both",
                  }}
                />
                <span
                  style={{
                    width: 18,
                    height: 12,
                    borderRadius: "50%",
                    background: "var(--dim)",
                    animation: "mg-stepIn .5s .38s ease-out both",
                  }}
                />
                <span
                  style={{
                    width: 20,
                    height: 13,
                    borderRadius: "50%",
                    background: "var(--mut)",
                    animation: "mg-stepIn .5s .61s ease-out both",
                  }}
                />
                <span
                  style={{
                    width: 22,
                    height: 14,
                    borderRadius: "50%",
                    background: "var(--moss)",
                    animation: "mg-stepIn .5s .84s ease-out both",
                  }}
                />
              </div>
            )}
            <p
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: ".45em",
                color: "#cfd8cf",
                textShadow: "0 1px 10px rgba(0,0,0,.6)",
              }}
            >
              {area.verb} {area.en.toUpperCase()}
            </p>
            <div
              style={{
                width: 44,
                height: 1,
                background: "var(--gold)",
                margin: "18px auto 0",
                opacity: 0.8,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

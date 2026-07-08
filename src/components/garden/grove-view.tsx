"use client";

import { useCollectionStore } from "@/stores/collection-store";
import { useGardenStore } from "@/stores/garden-store";
import type { GardenAnime } from "@/lib/garden/types";
import { growthPct } from "@/lib/garden/adapter";
import { useReveal } from "./use-reveal";

const CLUMP_DEFS = [
  { x: -37, y: -20, base: 62, at: 0.08 },
  { x: -66, y: 8, base: 44, at: 0.38 },
  { x: 2, y: 2, base: 38, at: 0.62 },
];
const LEAF = ["var(--leaf1)", "var(--leaf2)", "var(--leaf3)"];

/** The Grove — bonsai trees for every story in progress (reference lines 100–144). */
export function GroveView({ garden }: { garden: GardenAnime[] }) {
  const growing = garden.filter((a) => a.status === "watching");
  const updateEpisode = useCollectionStore((s) => s.updateEpisode);
  const openRitual = useGardenStore((s) => s.openRitual);
  const reveal = useReveal(useGardenStore((s) => !!s.transit));

  if (growing.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          padding: "50px 20px",
          fontStyle: "italic",
          color: "var(--dim)",
          fontSize: 13.5,
        }}
      >
        The terrace is bare. Walk to the seed store and bring something back.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
        gap: 22,
        marginTop: 34,
      }}
    >
      {growing.map((a) => {
        const pct = growthPct(a);
        const trunkH = Math.round(26 + pct * 66);
        const stage =
          pct >= 1
            ? "In full bloom"
            : pct >= 0.66
              ? "Budding"
              : pct >= 0.33
                ? "Leafing"
                : pct > 0
                  ? "Sprouting"
                  : "Seed in soil";
        const done = a.epsKnown && a.progress >= a.eps;

        return (
          <div
            key={a.id}
            ref={reveal}
            className="mg-grove-card"
            style={{
              background: "color-mix(in oklab, var(--panel) 72%, transparent)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              border: "1px solid var(--line)",
              borderRadius: 18,
              padding: "24px 20px 20px",
              textAlign: "center",
              transition: "border-color .4s",
            }}
          >
            <div style={{ position: "relative", height: 196, marginBottom: 4 }}>
              {/* pot */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 96,
                  height: 30,
                  clipPath: "polygon(6% 0,94% 0,84% 100%,16% 100%)",
                  background: `linear-gradient(180deg, ${a.c2}, color-mix(in oklab, ${a.c2} 55%, #000))`,
                }}
              />
              {/* pot rim */}
              <div
                style={{
                  position: "absolute",
                  bottom: 28,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 108,
                  height: 8,
                  borderRadius: 3,
                  background: a.c2,
                }}
              />
              {/* soil */}
              <div
                style={{
                  position: "absolute",
                  bottom: 33,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 84,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--leaf3)",
                }}
              />
              {/* trunk */}
              <div
                style={{
                  position: "absolute",
                  bottom: 36,
                  left: "50%",
                  width: 9,
                  height: trunkH,
                  borderRadius: "5px 5px 2px 2px",
                  background: "linear-gradient(180deg,#7a6448,#4a3a2c)",
                  transform: "translateX(-50%) rotate(-3deg)",
                  transformOrigin: "bottom center",
                  transition: "height .7s cubic-bezier(.2,.7,.3,1)",
                  animation: "mg-growUp .8s cubic-bezier(.2,.7,.3,1) both",
                }}
              />
              {/* crown */}
              <div
                style={{
                  position: "absolute",
                  bottom: 30 + trunkH,
                  left: "50%",
                  width: 0,
                  height: 0,
                  animation: "mg-leafSway 6s ease-in-out infinite",
                  transformOrigin: "bottom center",
                  transition: "bottom .7s cubic-bezier(.2,.7,.3,1)",
                }}
              >
                {CLUMP_DEFS.map((c, ci) => {
                  const vis = pct > c.at;
                  const scl = vis ? Math.min(1, (pct - c.at) / 0.3) : 0;
                  const leafC = LEAF[ci];
                  return (
                    <div
                      key={ci}
                      style={{
                        position: "absolute",
                        left: c.x,
                        top: c.y,
                        width: c.base,
                        height: Math.round(c.base * 0.72),
                        borderRadius: "58% 42% 55% 45% / 55% 60% 40% 45%",
                        background: `radial-gradient(circle at 38% 32%, color-mix(in oklab, ${leafC} 88%, ${a.c1}), ${leafC})`,
                        transform: `scale(${scl.toFixed(2)})`,
                        opacity: vis ? 1 : 0,
                        transition:
                          "transform .7s cubic-bezier(.2,.7,.3,1), opacity .5s",
                        boxShadow: "inset 0 -5px 10px rgba(0,0,0,.25)",
                      }}
                    />
                  );
                })}
                {pct >= 0.8 && (
                  <>
                    <span
                      style={{
                        position: "absolute",
                        left: -26,
                        top: -30,
                        fontSize: 13,
                        color: "var(--blossom)",
                        animation: "mg-leafSway 4s ease-in-out infinite",
                      }}
                    >
                      ✿
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        left: 16,
                        top: -8,
                        fontSize: 11,
                        color: "var(--blossom)",
                        animation: "mg-leafSway 5s .6s ease-in-out infinite",
                      }}
                    >
                      ✿
                    </span>
                  </>
                )}
              </div>
            </div>

            <p
              style={{
                margin: "0 0 2px",
                fontFamily: "var(--font-mincho), serif",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {a.title}
            </p>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 11,
                color: "var(--dim)",
                letterSpacing: ".12em",
              }}
            >
              {stage} · ep {a.progress} / {a.epsKnown ? a.eps : "?"}
            </p>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: "color-mix(in oklab, var(--ink) 8%, transparent)",
                overflow: "hidden",
                margin: "0 12px 16px",
              }}
            >
              <div
                style={{
                  width: `${Math.round(pct * 100)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,var(--leaf3),var(--moss))",
                  transition: "width .5s cubic-bezier(.2,.7,.3,1)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {done ? (
                <button
                  type="button"
                  onClick={() => openRitual(a.id)}
                  className="mg-release-btn"
                  aria-label={`Release ${a.title} to the pond`}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 22,
                    background: "var(--moss)",
                    color: "var(--bg)",
                    fontWeight: 700,
                    fontSize: 12.5,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    border: "none",
                    boxShadow:
                      "0 0 24px color-mix(in oklab, var(--moss) 40%, transparent)",
                    transition: "transform .3s",
                  }}
                >
                  放流 — Release to the pond
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      updateEpisode(
                        a.id,
                        a.epsKnown
                          ? Math.min(a.eps, a.progress + 1)
                          : a.progress + 1,
                      )
                    }
                    className="mg-water-btn"
                    aria-label={`Water ${a.title}`}
                    style={{
                      padding: "10px 22px",
                      borderRadius: 22,
                      border: "1px solid var(--line2)",
                      color: "var(--moss)",
                      fontWeight: 700,
                      fontSize: 12.5,
                      fontFamily: "inherit",
                      background: "transparent",
                      cursor: "pointer",
                      transition: "background .3s",
                    }}
                  >
                    水やり · Water
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateEpisode(a.id, Math.max(0, a.progress - 1))
                    }
                    className="mg-unwater-btn"
                    aria-label={`Remove an episode from ${a.title}`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 22,
                      border: "1px solid var(--line)",
                      color: "var(--dim)",
                      fontSize: 12.5,
                      fontFamily: "inherit",
                      background: "transparent",
                      cursor: "pointer",
                      transition: "color .3s",
                    }}
                  >
                    −
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

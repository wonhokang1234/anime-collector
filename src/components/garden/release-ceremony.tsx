"use client";

import { useEffect, useRef, type FC } from "react";
import { useGardenStore } from "@/stores/garden-store";
import { useCollectionStore } from "@/stores/collection-store";
import type { GardenAnime } from "@/lib/garden/types";
import { Koi } from "./koi";

/**
 * The Release Ceremony — reference "Garden World 3D" lines 320–344.
 * A modal dialog: confirming marks the title "watched" (default bloom rating
 * 3 when unrated) and travels to the pond with the new koi selected. Both the
 * store writes are optimistic, so we travel immediately (fire-and-forget) as
 * the design does — no awaiting.
 *
 * Additions beyond the reference (noted): dialog a11y semantics + Esc to close.
 */
export const ReleaseCeremony: FC<{ garden: GardenAnime[] }> = ({ garden }) => {
  const ritual = useGardenStore((s) => s.ritual);
  const closeRitual = useGardenStore((s) => s.closeRitual);
  const updateCategory = useCollectionStore((s) => s.updateCategory);
  const updateRating = useCollectionStore((s) => s.updateRating);

  const a = ritual ? garden.find((x) => x.id === ritual.animeId) : undefined;

  // Double-click guard — a ref (not state) so a second click is ignored
  // without triggering a render on a component that's about to unmount.
  const confirmed = useRef(false);

  // Guard: the item disappeared mid-ceremony (deleted / recategorised
  // elsewhere) — clear the orphan ritual so the overlay doesn't hang.
  useEffect(() => {
    if (ritual && !a) closeRitual();
  }, [ritual, a, closeRitual]);

  // Esc closes the ceremony (dialog semantics).
  useEffect(() => {
    if (!a) return;
    const kd = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRitual();
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [a, closeRitual]);

  if (!a) return null;

  const confirm = () => {
    if (confirmed.current) return;
    confirmed.current = true;
    updateCategory(a.id, "watched");
    if (!a.rating) updateRating(a.id, 3); // design: default bloom 3 when unrated
    useGardenStore.getState().confirmRitualTravel(a.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Release ${a.title} to the pond`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "color-mix(in oklab, var(--bg) 92%, #000)",
        backdropFilter: "blur(9px)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ textAlign: "center", padding: 20 }}>
        <p
          style={{
            margin: "0 0 26px",
            fontSize: 11,
            letterSpacing: ".6em",
            color: "var(--moss)",
            animation: "mg-riseIn .5s ease-out both",
          }}
        >
          放 流 の 儀 — THE RELEASE
        </p>
        <div
          style={{
            position: "relative",
            width: 280,
            height: 280,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,var(--pond1),var(--pond2) 75%)",
              border: "1px solid var(--line2)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border:
                "1.5px solid color-mix(in oklab, var(--moss) 60%, transparent)",
              animation: "mg-rippleOut 2.4s ease-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border:
                "1.5px solid color-mix(in oklab, var(--moss) 40%, transparent)",
              animation: "mg-rippleOut 2.4s 1.2s ease-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <Koi
              c1={a.c1}
              c2={a.c2}
              rating={a.rating}
              glyph={a.kanji.slice(0, 3)}
              scale={1.3}
              favorite={a.favorite}
            />
          </div>
        </div>
        <p
          style={{
            margin: "26px 0 4px",
            fontFamily: "var(--font-mincho), serif",
            fontSize: 20,
            fontWeight: 700,
            animation: "mg-riseIn .5s .7s ease-out both",
          }}
        >
          {a.title} has bloomed.
        </p>
        <p
          style={{
            margin: "0 0 24px",
            fontSize: 13,
            fontWeight: 300,
            color: "var(--mut)",
            animation: "mg-riseIn .5s .9s ease-out both",
          }}
        >
          Its koi will swim in your garden from tonight on.
        </p>
        <div
          style={{
            display: "inline-flex",
            gap: 12,
            animation: "mg-riseIn .5s 1.1s ease-out both",
          }}
        >
          <button
            type="button"
            className="mg-release-confirm"
            onClick={confirm}
            style={{
              padding: "12px 28px",
              borderRadius: 24,
              background: "var(--moss)",
              color: "var(--bg)",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              transition: "transform .2s, box-shadow .2s",
            }}
          >
            Release it 放流
          </button>
          <button
            type="button"
            className="mg-ghost-btn"
            onClick={closeRitual}
            style={{
              padding: "12px 24px",
              borderRadius: 24,
              background: "transparent",
              border: "1px solid var(--line2)",
              color: "var(--mut)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Not yet
          </button>
        </div>
      </div>
    </div>
  );
};

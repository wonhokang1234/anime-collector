"use client";

import { useEffect, useMemo, useRef } from "react";
import { useCollectionStore } from "@/stores/collection-store";
import { useGardenMetaStore } from "@/stores/garden-meta-store";
import {
  useGardenColorsStore,
  accentFor,
  accentToHex,
} from "@/lib/garden/colors";
import {
  useGardenStore,
  ZONES,
  EXITS,
  abortTransit,
} from "@/stores/garden-store";
import {
  toGardenAnime,
  deriveGarden,
  growthPct,
  type DerivedGarden,
} from "@/lib/garden/adapter";
import { Garden3D } from "@/lib/garden/garden3d";
import { WorldHud } from "./world-hud";
import { QuickTravel } from "./quick-travel";
import { InteriorShell } from "./interior-shell";
import { TransitionOverlay } from "./transition-overlay";
import { ReleaseCeremony } from "./release-ceremony";
import type { GardenView } from "@/lib/garden/types";

/** Map derived garden data into the engine's shape (README §Live data reflection). */
function pushData(engine: Garden3D, d: DerivedGarden) {
  engine.updateData({
    trees: d.growing.map((a) => ({
      // growthPct keeps pct in [0,1]; unknown-length titles grow toward Budding
      pct: Math.round(growthPct(a) * 100) / 100,
    })),
    // engine parses hex; accents are hsl(...) strings — convert at the boundary
    koi: d.done.map((a) => ({ c1: accentToHex(a.c1), c2: accentToHex(a.c2) })),
    seeds: d.seeds.length,
  });
}

export function GardenExperience() {
  const items = useCollectionStore((s) => s.items);
  const meta = useGardenMetaStore((s) => s.meta);
  const ensureMeta = useGardenMetaStore((s) => s.ensure);
  const colors = useGardenColorsStore((s) => s.colors);
  const ensureColors = useGardenColorsStore((s) => s.ensure);
  const g = useGardenStore();
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Garden3D | null>(null);

  const garden = useMemo(
    () =>
      items.map((i) =>
        toGardenAnime(i, meta[i.mal_id], accentFor(colors, i.mal_id)),
      ),
    [items, meta, colors],
  );
  const derived = useMemo(() => deriveGarden(garden), [garden]);

  // latest derived, readable from the mount-once engine effect regardless of
  // effect declaration/run order (useRef captures the mount-time value; the
  // sync effect keeps it fresh afterwards)
  const derivedRef = useRef(derived);
  useEffect(() => {
    derivedRef.current = derived;
  }, [derived]);

  // enrichment kickoff
  useEffect(() => {
    ensureMeta(items.map((i) => i.mal_id));
    ensureColors(
      items.map((i) => ({ malId: i.mal_id, imageUrl: i.image_url })),
    );
  }, [items, ensureMeta, ensureColors]);

  // deep-link: /garden?view=pond|grove|seeds|stone (redirects from legacy routes)
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    if (v && ["grove", "pond", "seeds", "stone"].includes(v)) {
      useGardenStore.getState().travel(v as GardenView);
    }
  }, []);

  // engine lifecycle — mount-once
  useEffect(() => {
    if (!mountRef.current || engineRef.current) return;
    const engine = new Garden3D(mountRef.current, {
      mood: useGardenStore.getState().mood,
      zones: ZONES,
      onNear: (near) => useGardenStore.getState().setNear(near),
    });
    engineRef.current = engine;
    pushData(engine, derivedRef.current);
    return () => {
      engine.dispose();
      engineRef.current = null;
      // transit timers die with the page — see garden-store.abortTransit
      abortTransit();
    };
  }, []);

  // live reflection (README §Live data reflection)
  useEffect(() => {
    if (engineRef.current) pushData(engineRef.current, derived);
  }, [derived]);

  // pause 3D while any UI owns the screen; sync mood; spawn-on-exit
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setPaused(g.view !== "world" || !!g.transit || !!g.ritual || g.qtOpen);
    // Skip rendering only when an opaque interior fully covers the world;
    // keep drawing during transit and ritual so the scene stays visible.
    e.setHidden(g.view !== "world" && !g.transit);
    if (e.mood !== g.mood) e.setMood(g.mood);
    if (g.pendingExitFrom && g.view === "world") {
      const exit = EXITS[g.pendingExitFrom];
      if (exit) e.setPlayerPos(exit[0], exit[1]);
      useGardenStore.getState().clearPendingExit();
    }
  }, [g.view, g.transit, g.ritual, g.qtOpen, g.mood, g.pendingExitFrom]);

  // E / Enter to enter near zone; Esc closes quick travel — mount-once
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const s = useGardenStore.getState();
      if (
        (e.key === "e" || e.key === "E" || e.key === "Enter") &&
        s.view === "world" &&
        !s.transit &&
        !s.ritual &&
        !s.qtOpen &&
        s.near
      ) {
        s.travel(s.near as GardenView);
      }
      if (e.key === "Escape") s.closeQt();
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, []);

  return (
    <div className="moss" data-mood={g.mood} style={{ minHeight: "100vh" }}>
      <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />
      {g.view === "world" && (
        <WorldHud
          near={g.near}
          promptOn={!!g.near && !g.transit && !g.ritual && !g.qtOpen}
          zoomIn={() => engineRef.current?.zoomBy(1 / 1.25)}
          zoomOut={() => engineRef.current?.zoomBy(1.25)}
        />
      )}
      <QuickTravel derived={derived} />
      {g.view !== "world" && (
        <InteriorShell view={g.view} garden={garden} derived={derived} />
      )}
      {g.transit && <TransitionOverlay transit={g.transit} />}
      {g.ritual && <ReleaseCeremony garden={garden} />}
    </div>
  );
}

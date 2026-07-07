import { create } from "zustand";
import type { GardenView, TransitKind, Mood } from "@/lib/garden/types";

export const AREAS: Record<
  GardenView,
  { kanji: string; en: string; verb: string }
> = {
  world: { kanji: "庭", en: "The Garden", verb: "RETURNING TO" },
  grove: { kanji: "盆栽", en: "The Grove", verb: "STEPPING INTO" },
  pond: { kanji: "池", en: "The Pond", verb: "WADING INTO" },
  seeds: { kanji: "種蔵", en: "The Seed Store", verb: "OPENING" },
  stone: { kanji: "記録", en: "The Records House", verb: "ENTERING" },
};

export const KINDS: Record<GardenView, TransitKind> = {
  world: "walk",
  grove: "leaf",
  pond: "ripple",
  seeds: "paper",
  stone: "ink",
};

export const ZONES = {
  grove: { x: -28, z: -20, r: 16, prompt: "ENTER THE GROVE · 盆栽へ" },
  pond: { x: 24, z: -6, r: 21, prompt: "WADE INTO THE POND · 池へ" },
  seeds: { x: -26, z: 22, r: 10.5, prompt: "OPEN THE SEED STORE · 種蔵へ" },
  stone: {
    x: 24,
    z: 24,
    r: 12,
    prompt: "ENTER THE RECORDS HOUSE · 記録の家へ",
  },
} as const;

export const EXITS: Record<string, [number, number]> = {
  grove: [-13, -9],
  pond: [24, 13.5],
  seeds: [-26, 12],
  stone: [14, 15],
};

export interface Transit {
  to: GardenView;
  kind: TransitKind;
  phase: "closing" | "opening";
}

export interface Ritual {
  animeId: string; // CollectedAnime.id
}

interface GardenState {
  view: GardenView;
  transit: Transit | null;
  ritual: Ritual | null;
  selectedKoi: string | null;
  qtOpen: boolean;
  mood: Mood;
  near: string | null;
  /** set by the page when leaving an interior so Garden3D can respawn the player */
  pendingExitFrom: GardenView | null;
  pendingSelect: string | null;

  travel: (to: GardenView) => void;
  setNear: (near: string | null) => void;
  toggleQt: () => void;
  closeQt: () => void;
  setMood: (mood: Mood) => void;
  openRitual: (animeId: string) => void;
  closeRitual: () => void;
  confirmRitualTravel: (animeId: string) => void; // ceremony → pond w/ koi panel open
  selectKoi: (id: string | null) => void;
  clearPendingExit: () => void;
}

const MOOD_KEY = "karuta-garden-mood";

function readMood(): Mood {
  if (typeof window === "undefined") return "midnight";
  return localStorage.getItem(MOOD_KEY) === "dawn" ? "dawn" : "midnight";
}

// module-level; HMR full re-eval resets these — travel() clears them on each call
let timers: ReturnType<typeof setTimeout>[] = [];

export const useGardenStore = create<GardenState>((set, get) => ({
  view: "world",
  transit: null,
  ritual: null,
  selectedKoi: null,
  qtOpen: false,
  mood: readMood(),
  near: null,
  pendingExitFrom: null,
  pendingSelect: null,

  travel: (to) => {
    const { transit, view, pendingSelect } = get();
    if (transit || to === view) {
      set({ qtOpen: false });
      return;
    }
    timers.forEach(clearTimeout);
    timers = [];
    const kind = KINDS[to];
    // Under reduced motion the overlay's CSS is instant (global 0.001ms rule),
    // so the normal 800/1550/2250ms JS timers would leave a ~2.25s static
    // overlay. Compress the schedule so it clears almost immediately instead.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [tSwap, tOpen, tClear] = reduced ? [50, 100, 150] : [800, 1550, 2250];
    set({ transit: { to, kind, phase: "closing" }, qtOpen: false, near: null });
    timers.push(
      setTimeout(() => {
        set({
          view: to,
          selectedKoi: pendingSelect ?? null,
          pendingSelect: null,
          pendingExitFrom: to === "world" && view !== "world" ? view : null,
        });
        window.scrollTo({ top: 0 });
      }, tSwap),
    );
    timers.push(
      setTimeout(() => set({ transit: { to, kind, phase: "opening" } }), tOpen),
    );
    timers.push(setTimeout(() => set({ transit: null }), tClear));
  },

  setNear: (near) => set({ near }),
  toggleQt: () => set((s) => ({ qtOpen: !s.qtOpen })),
  closeQt: () => set({ qtOpen: false }),
  setMood: (mood) => {
    try {
      localStorage.setItem(MOOD_KEY, mood);
    } catch {}
    set({ mood });
  },
  openRitual: (animeId) => set({ ritual: { animeId } }),
  closeRitual: () => set({ ritual: null }),
  confirmRitualTravel: (animeId) => {
    set({ ritual: null });
    if (get().view === "pond") {
      // already there — open the panel directly
      set({ selectedKoi: animeId });
    } else {
      set({ pendingSelect: animeId });
      get().travel("pond");
    }
  },
  selectKoi: (id) => set({ selectedKoi: id }),
  clearPendingExit: () => set({ pendingExitFrom: null }),
}));

/** Kill in-flight transit timers + overlay; the garden page calls this on unmount. */
export function abortTransit() {
  timers.forEach(clearTimeout);
  timers = [];
  useGardenStore.setState({ transit: null });
}

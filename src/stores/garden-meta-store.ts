import { create } from "zustand";
import { getAnimeById } from "@/lib/jikan";
import type { GardenMeta } from "@/lib/garden/adapter";

const CACHE_KEY = "karuta-garden-meta-v1";
const FETCH_GAP_MS = 400; // stay under Jikan's 3 req/s

function loadCache(): Record<number, GardenMeta> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

interface GardenMetaState {
  meta: Record<number, GardenMeta>;
  /** Queue fetches for any mal_ids not yet cached. Safe to call repeatedly. */
  ensure: (malIds: number[]) => void;
}

const queue: number[] = [];
// module-level; HMR full re-eval resets this — pump guard makes that safe
let pumping = false;

export const useGardenMetaStore = create<GardenMetaState>((set, get) => ({
  meta: loadCache(),

  ensure: (malIds) => {
    const { meta } = get();
    const missing = malIds.filter((id) => !meta[id] && !queue.includes(id));
    if (missing.length === 0) return;
    queue.push(...missing);
    if (pumping) return;
    pumping = true;
    const pump = async () => {
      while (queue.length > 0) {
        const malId = queue.shift()!;
        const anime = await getAnimeById(malId);
        if (anime) {
          const entry: GardenMeta = {
            kanji: anime.title_japanese ?? undefined,
            genre: anime.genres?.[0]?.name,
            syn: anime.synopsis
              ? anime.synopsis.split(/(?<=[.!?])\s/)[0].slice(0, 140)
              : undefined,
          };
          const next = { ...get().meta, [malId]: entry };
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(next));
          } catch {}
          set({ meta: next });
        }
        if (queue.length > 0) {
          await new Promise((r) => setTimeout(r, FETCH_GAP_MS));
        }
      }
      pumping = false;
    };
    void pump();
  },
}));

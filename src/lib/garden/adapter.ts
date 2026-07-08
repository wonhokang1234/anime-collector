import type { CollectedAnime } from "@/lib/types";
import type { GardenAnime, GardenStatus } from "./types";

const STATUS_MAP: Record<CollectedAnime["category"], GardenStatus> = {
  plan_to_watch: "plan",
  watching: "watching",
  watched: "completed",
  favorite: "completed", // golden koi — favorites live in the Pond
};

/** Enrichment data from Jikan; fields optional until populated. */
export interface GardenMeta {
  kanji?: string;
  genre?: string;
  syn?: string;
}

export function toGardenAnime(
  item: CollectedAnime,
  meta: GardenMeta | undefined,
  colors: { c1: string; c2: string },
): GardenAnime {
  return {
    id: item.id,
    malId: item.mal_id,
    title: item.title,
    kanji: meta?.kanji || item.title, // || intentional: "" kanji falls back to title
    genre: meta?.genre ?? "",
    syn: meta?.syn ?? "",
    status: STATUS_MAP[item.category],
    favorite: item.category === "favorite",
    progress: item.current_episode,
    eps: Math.max(1, item.total_episodes),
    epsKnown: item.total_episodes > 0,
    rating: item.rating ?? 0,
    c1: colors.c1,
    c2: colors.c2,
    imageUrl: item.image_url,
  };
}

/**
 * Growth fraction [0,1] for tree height / bloom stage / progress bars.
 * Known-length titles bloom at their episode count; unknown-length (airing,
 * `total_episodes = 0`) titles grow toward — but never fully reach — bloom,
 * so they are never pushed into an instant Release.
 */
export function growthPct(a: GardenAnime): number {
  return a.epsKnown
    ? Math.min(1, a.progress / a.eps)
    : Math.min(0.9, a.progress / 24);
}

export interface DerivedGarden {
  growing: GardenAnime[];
  done: GardenAnime[];
  seeds: GardenAnime[];
  hours: number;
  topGenre: string;
}

/** Derived data for Garden3D.updateData + Quick Travel stats + Records House. */
export function deriveGarden(all: GardenAnime[]): DerivedGarden {
  const growing = all.filter((a) => a.status === "watching");
  const done = all.filter((a) => a.status === "completed");
  const seeds = all.filter((a) => a.status === "plan");
  // hours of tending = Σ episodes watched × 24 min ÷ 60 (README §Garden Record)
  const hours = Math.round(all.reduce((m, a) => m + a.progress * 24, 0) / 60);
  const byGenre: Record<string, number> = {};
  for (const a of all) {
    if (a.genre) byGenre[a.genre] = (byGenre[a.genre] || 0) + a.progress;
  }
  const topGenre =
    Object.keys(byGenre).sort((x, y) => byGenre[y] - byGenre[x])[0] ?? "—";
  return { growing, done, seeds, hours, topGenre };
}

import type { CollectedAnime } from "@/lib/types";
import type { GardenAnime, GardenStatus } from "./types";

const STATUS_MAP: Record<CollectedAnime["category"], GardenStatus> = {
  plan_to_watch: "plan",
  watching: "watching",
  watched: "completed",
  favorite: "completed", // golden koi — favorites live in the Pond
};

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
    kanji: meta?.kanji || item.title,
    genre: meta?.genre ?? "",
    syn: meta?.syn ?? "",
    status: STATUS_MAP[item.category],
    favorite: item.category === "favorite",
    progress: item.current_episode,
    eps: Math.max(1, item.total_episodes),
    rating: item.rating ?? 0,
    c1: colors.c1,
    c2: colors.c2,
    imageUrl: item.image_url,
  };
}

/** Derived data for Garden3D.updateData + Quick Travel stats + Records House. */
export function deriveGarden(all: GardenAnime[]) {
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

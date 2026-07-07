export type GardenStatus = "plan" | "watching" | "completed";

/** The design's per-title shape (handoff README §Architecture pt. 1). */
export interface GardenAnime {
  id: string; // CollectedAnime.id (Supabase row id)
  malId: number;
  title: string;
  kanji: string; // native title; falls back to title until enriched
  genre: string; // primary genre; "" until enriched
  syn: string; // one-line synopsis; "" until enriched
  status: GardenStatus;
  favorite: boolean; // golden-koi flag (approved mapping for "favorite")
  progress: number; // current_episode
  eps: number; // total_episodes, min 1 (guard airing/unknown = 0)
  rating: number; // 0–5, null → 0
  c1: string; // accent from cover art
  c2: string; // secondary accent (darker)
  imageUrl: string;
}

export type GardenView = "world" | "grove" | "pond" | "seeds" | "stone";
export type TransitKind = "walk" | "leaf" | "ripple" | "paper" | "ink";
export type Mood = "midnight" | "dawn";

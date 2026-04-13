export type AnimeCategory = "watching" | "watched" | "plan_to_watch" | "favorite";

export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface CollectedAnime {
  id: string;
  user_id: string;
  mal_id: number;
  title: string;
  image_url: string;
  score: number;
  rating: number | null;
  category: AnimeCategory;
  current_episode: number;
  total_episodes: number;
  sort_order: number;
  created_at: string;
}

export interface CollectedCharacter {
  id: string;
  user_id: string;
  mal_id: number;
  name: string;
  image_url: string;
  anime_mal_id: number;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export function getRarityTier(score: number): RarityTier {
  if (score >= 9.0) return "legendary";
  if (score >= 8.0) return "epic";
  if (score >= 7.0) return "rare";
  if (score >= 6.0) return "uncommon";
  return "common";
}

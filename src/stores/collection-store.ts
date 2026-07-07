import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { CollectedAnime, AnimeCategory } from "@/lib/types";
import { useToastStore } from "@/stores/toast-store";

interface CollectInput {
  mal_id: number;
  title: string;
  image_url: string;
  score: number;
  total_episodes: number | null;
  category?: AnimeCategory;
}

interface CollectionState {
  items: CollectedAnime[];
  loading: boolean;
  initialized: boolean;
  loadCollection: (userId: string) => Promise<void>;
  collect: (
    userId: string,
    input: CollectInput,
  ) => Promise<{ error: string | null }>;
  updateCategory: (id: string, category: AnimeCategory) => Promise<void>;
  updateEpisode: (id: string, episode: number) => Promise<void>;
  updateRating: (id: string, rating: number | null) => Promise<void>;
  remove: (id: string) => Promise<void>;
  isCollected: (malId: number) => boolean;
  reset: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  items: [],
  loading: false,
  initialized: false,

  loadCollection: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("collected_anime")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load collection:", error);
      set({ loading: false, initialized: true });
      return;
    }

    set({
      items: (data ?? []) as CollectedAnime[],
      loading: false,
      initialized: true,
    });
  },

  collect: async (userId, input) => {
    const category = input.category ?? "plan_to_watch";

    const { data, error } = await supabase
      .from("collected_anime")
      .insert({
        user_id: userId,
        mal_id: input.mal_id,
        title: input.title,
        image_url: input.image_url,
        score: input.score,
        total_episodes: input.total_episodes ?? 0,
        current_episode: 0,
        category,
        sort_order: 0,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    set((state) => ({ items: [data as CollectedAnime, ...state.items] }));
    return { error: null };
  },

  updateCategory: async (id, category) => {
    // Capture original before optimistic update
    const originalItem = get().items.find((i) => i.id === id);

    // Apply optimistic update immediately
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, category } : item,
      ),
    }));

    const { error } = await supabase
      .from("collected_anime")
      .update({ category })
      .eq("id", id);

    if (error) {
      console.error("Failed to update category:", error);
      // Revert optimistic update
      if (originalItem) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? originalItem : item,
          ),
        }));
      }
      useToastStore.getState().addToast({
        message: "Failed to update category. Please try again.",
        type: "error",
      });
    }
  },

  updateEpisode: async (id, episode) => {
    // Capture original before optimistic update
    const originalItem = get().items.find((i) => i.id === id);

    // Apply optimistic update immediately
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, current_episode: episode } : item,
      ),
    }));

    const { error } = await supabase
      .from("collected_anime")
      .update({ current_episode: episode })
      .eq("id", id);

    if (error) {
      console.error("Failed to update episode:", error);
      // Revert optimistic update
      if (originalItem) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? originalItem : item,
          ),
        }));
      }
      useToastStore.getState().addToast({
        message: "Failed to update episode. Please try again.",
        type: "error",
      });
    }
  },

  updateRating: async (id, rating) => {
    // Capture original before optimistic update
    const originalItem = get().items.find((i) => i.id === id);

    // Apply optimistic update immediately
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, rating } : item,
      ),
    }));

    const { error } = await supabase
      .from("collected_anime")
      .update({ rating })
      .eq("id", id);

    if (error) {
      console.error("Failed to update rating:", error);
      // Revert optimistic update
      if (originalItem) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? originalItem : item,
          ),
        }));
      }
      useToastStore.getState().addToast({
        message: "Failed to update rating. Please try again.",
        type: "error",
      });
    }
  },

  remove: async (id) => {
    // Capture original items before optimistic removal
    const originalItems = get().items;

    // Apply optimistic removal immediately
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));

    const { error } = await supabase
      .from("collected_anime")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to remove anime:", error);
      // Revert optimistic removal
      set({ items: originalItems });
      useToastStore.getState().addToast({
        message: "Failed to remove anime. Please try again.",
        type: "error",
      });
    }
  },

  isCollected: (malId) => {
    return get().items.some((item) => item.mal_id === malId);
  },

  reset: () => {
    set({ items: [], loading: false, initialized: false });
  },
}));

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimeCard } from "@/components/card/anime-card";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { getRarityTier, type RarityTier } from "@/lib/types";
import "@/components/card/card.css";

type SortKey = "recent" | "title" | "score" | "rarity";
type RarityFilter = RarityTier | "all";

const RARITY_ORDER: Record<RarityTier, number> = {
  legendary: 5,
  epic: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

export default function CollectionPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const items = useCollectionStore((s) => s.items);
  const initialized = useCollectionStore((s) => s.initialized);

  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [filter, setFilter] = useState<RarityFilter>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== "all") {
      list = list.filter((item) => getRarityTier(item.score) === filter);
    }

    const sorted = [...list];
    switch (sortKey) {
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "score":
        sorted.sort((a, b) => b.score - a.score);
        break;
      case "rarity":
        sorted.sort(
          (a, b) =>
            RARITY_ORDER[getRarityTier(b.score)] -
            RARITY_ORDER[getRarityTier(a.score)]
        );
        break;
      case "recent":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
    return sorted;
  }, [items, filter, sortKey]);

  if (authLoading || !user || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          My Collection
        </h1>
        <p className="mt-2 text-zinc-400">
          {items.length === 0
            ? "You haven't collected any anime yet."
            : `${items.length} anime in your collection`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
          <div className="mb-4 text-5xl">✦</div>
          <p className="text-zinc-400 mb-4">
            Your collection is empty. Start by finding an anime you love.
          </p>
          <button
            onClick={() => router.push("/browse")}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Browse Anime
          </button>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "legendary", label: "Legendary" },
                  { key: "epic", label: "Epic" },
                  { key: "rare", label: "Rare" },
                  { key: "uncommon", label: "Uncommon" },
                  { key: "common", label: "Common" },
                ] as { key: RarityFilter; label: string }[]
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === key
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-zinc-500">Sort by</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="recent">Recently added</option>
                <option value="title">Title (A–Z)</option>
                <option value="score">Score (high → low)</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-sm">
              No anime match this filter.
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-start">
              {filtered.map((item) => (
                <AnimeCard
                  key={item.id}
                  title={item.title}
                  imageUrl={item.image_url}
                  score={item.score}
                  episodes={item.total_episodes || null}
                  collected
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

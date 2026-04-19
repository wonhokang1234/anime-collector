"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{
            borderColor: "rgba(244,228,192,.15)",
            borderTopColor: "var(--lantern-glow)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p
          className="mb-1 text-[10px] uppercase tracking-[.4em]"
          style={{
            color: "var(--washi-soft)",
            fontFamily: "var(--font-display)",
          }}
        >
          <span style={{ fontFamily: "var(--font-jp)" }}>集</span> · Archive
        </p>
        <h1 className="display-title text-4xl font-extrabold">
          My Collection
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: "rgba(244,228,192,.6)" }}
        >
          {items.length === 0
            ? "You haven't collected any anime yet."
            : `${items.length} ${items.length === 1 ? "entry" : "entries"} in the archive.`}
        </p>
      </div>

      {items.length === 0 ? (
        <div
          className="relative flex flex-col items-center justify-center py-20 text-center"
          style={{
            border: "1px dashed rgba(244,228,192,.22)",
            background: "rgba(10,6,4,.55)",
            borderRadius: 8,
          }}
        >
          <div
            aria-hidden
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: "var(--washi)",
              color: "var(--hanko)",
              fontFamily: "var(--font-jp)",
              fontSize: 22,
              fontWeight: 900,
              boxShadow: "0 2px 6px rgba(0,0,0,.5)",
            }}
          >
            空
          </div>
          <p
            className="mb-6 max-w-sm text-sm"
            style={{ color: "rgba(244,228,192,.6)" }}
          >
            Your archive is empty. Start by finding an anime you love.
          </p>
          <button
            onClick={() => router.push("/browse")}
            className="hanko-btn"
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
                  className={`washi-pill ${
                    filter === key ? "washi-pill--active" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="ml-auto flex items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-[.3em]"
                style={{
                  color: "var(--washi-soft)",
                  fontFamily: "var(--font-display)",
                }}
              >
                Sort by
              </span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="px-3 py-1.5 text-xs focus:outline-none"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: ".08em",
                  color: "var(--washi)",
                  background: "rgba(10,6,4,.75)",
                  border: "1px solid rgba(244,228,192,.2)",
                  borderRadius: 4,
                }}
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
            <div
              className="py-20 text-center text-sm"
              style={{ color: "var(--washi-soft)" }}
            >
              No anime match this filter.
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-start">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/card/${item.mal_id}`}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <AnimeCard
                    title={item.title}
                    imageUrl={item.image_url}
                    score={item.score}
                    episodes={item.total_episodes || null}
                    collected
                  />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

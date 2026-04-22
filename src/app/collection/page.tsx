"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import gsap from "gsap";
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

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized || !gridRef.current) return;
    const cards = Array.from(gridRef.current.children);
    if (cards.length === 0) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 12, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: { each: 0.05, from: "center" },
        ease: "power2.out",
      }
    );
  }, [initialized]);

  if (authLoading || !user || !initialized) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="skeleton-line mb-2" style={{ width: 140, height: 28 }} />
          <div className="skeleton-line" style={{ width: 200, height: 14 }} />
        </div>
        {/* Card skeleton grid */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-block"
              style={{ width: 280, height: 420, flexShrink: 0 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 relative overflow-hidden">
      {/* Ambient lantern glow */}
      <div className="ambient-lantern" aria-hidden />

      {/* Faded watermark kanji */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute -top-6 right-0 z-0"
        style={{
          fontFamily: "var(--font-jp)",
          fontSize: 300,
          lineHeight: 1,
          color: "rgba(244,228,192,0.04)",
        }}
      >
        集
      </div>

      <div className="relative z-10">
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
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
            <div className="flex items-center gap-2 sm:ml-auto">
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

          {/* Section separator */}
          <div className="hairline mb-8" />

          {/* Grid */}
          {filtered.length === 0 ? (
            <div
              className="py-20 text-center text-sm"
              style={{ color: "var(--washi-soft)" }}
            >
              No anime match this filter.
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
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
      </div>{/* end relative z-10 */}
    </div>
  );
}

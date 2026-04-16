"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { ShelfSection } from "@/components/shelf/shelf-section";
import { ShelfCard } from "@/components/shelf/shelf-card";
import type { AnimeCategory } from "@/lib/types";
import "@/components/card/card.css";
import "./shelf.css";

export default function ShelfPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const items = useCollectionStore((s) => s.items);
  const initialized = useCollectionStore((s) => s.initialized);
  const updateCategory = useCollectionStore((s) => s.updateCategory);
  const updateEpisode = useCollectionStore((s) => s.updateEpisode);
  const remove = useCollectionStore((s) => s.remove);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const grouped = useMemo(() => {
    const buckets: Record<AnimeCategory, typeof items> = {
      watching: [],
      plan_to_watch: [],
      watched: [],
      favorite: [],
    };
    for (const item of items) {
      buckets[item.category].push(item);
    }
    return buckets;
  }, [items]);

  const stats = useMemo(
    () => ({
      total: items.length,
      watching: grouped.watching.length,
      watched: grouped.watched.length,
      plan: grouped.plan_to_watch.length,
      favorites: grouped.favorite.length,
    }),
    [items.length, grouped]
  );

  if (authLoading || !user || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-12 text-center">
          <div className="shelf-empty-glow" aria-hidden />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-white/5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-indigo-300"
              >
                <path d="M4 5h16v14H4z" />
                <path d="M4 10h16" />
                <path d="M9 5v5" />
                <path d="M15 5v5" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Your shelf is empty
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Collect a few anime and they&apos;ll land here — organized by what
              you&apos;re watching now, what&apos;s on your list, and what you&apos;ve finished.
            </p>
            <button
              onClick={() => router.push("/browse")}
              className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Browse anime
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header with stats */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            My Shelf
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Track what you&apos;re watching across {stats.total}{" "}
            {stats.total === 1 ? "entry" : "entries"}.
          </p>
        </div>

        <div className="flex items-stretch gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1.5">
          <Stat label="Watching" value={stats.watching} accent="indigo" />
          <div className="w-px bg-zinc-800/80" />
          <Stat label="Plan" value={stats.plan} accent="amber" />
          <div className="w-px bg-zinc-800/80" />
          <Stat label="Watched" value={stats.watched} accent="emerald" />
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-2">
        <ShelfSection
          title="Currently Watching"
          count={grouped.watching.length}
          accent="indigo"
          emptyLabel="Not actively watching anything. Move an entry here to start tracking episodes."
        >
          {grouped.watching.map((item) => (
            <ShelfCard
              key={item.id}
              item={item}
              onMove={updateCategory}
              onEpisodeChange={updateEpisode}
              onRemove={remove}
            />
          ))}
        </ShelfSection>

        <ShelfSection
          title="Plan to Watch"
          count={grouped.plan_to_watch.length}
          accent="amber"
          emptyLabel="Your backlog is empty. Collect some anime on Browse."
        >
          {grouped.plan_to_watch.map((item) => (
            <ShelfCard
              key={item.id}
              item={item}
              onMove={updateCategory}
              onEpisodeChange={updateEpisode}
              onRemove={remove}
            />
          ))}
        </ShelfSection>

        <ShelfSection
          title="Watched"
          count={grouped.watched.length}
          accent="emerald"
          defaultOpen={false}
          emptyLabel="Nothing completed yet. Finishing an episode-tracked show moves it here automatically."
        >
          {grouped.watched.map((item) => (
            <ShelfCard
              key={item.id}
              item={item}
              onMove={updateCategory}
              onEpisodeChange={updateEpisode}
              onRemove={remove}
            />
          ))}
        </ShelfSection>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "indigo" | "emerald" | "amber";
}) {
  const color =
    accent === "indigo"
      ? "text-indigo-300"
      : accent === "emerald"
      ? "text-emerald-300"
      : "text-amber-300";
  return (
    <div className="flex min-w-[72px] flex-col items-center justify-center px-3 py-1">
      <div className={`font-mono text-lg font-semibold tabular-nums ${color}`}>
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

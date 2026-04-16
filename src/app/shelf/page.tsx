"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { Scene } from "@/components/shelf/scene";
import { SceneTabs } from "@/components/shelf/scene-tabs";
import type { SpineTone } from "@/components/shelf/manga-spine";
import type { CollectedAnime } from "@/lib/types";
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

  const [tone, setTone] = useState<SpineTone>("watching");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const grouped = useMemo(() => {
    const buckets: Record<SpineTone, CollectedAnime[]> = {
      watching: [],
      plan: [],
      watched: [],
    };
    for (const item of items) {
      if (item.category === "watching") buckets.watching.push(item);
      else if (item.category === "plan_to_watch") buckets.plan.push(item);
      else if (item.category === "watched") buckets.watched.push(item);
    }
    return buckets;
  }, [items]);

  const counts: Record<SpineTone, number> = {
    watching: grouped.watching.length,
    plan: grouped.plan.length,
    watched: grouped.watched.length,
  };
  const total = items.length;

  if (authLoading || !user || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="shelf-root mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-12 text-center">
          <div className="shelf-empty-glow" aria-hidden />
          <div className="relative">
            <div
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "var(--washi)",
                color: "var(--hanko)",
                fontFamily: "var(--font-jp)",
                fontSize: 22,
                fontWeight: 900,
                boxShadow: "0 2px 6px rgba(0,0,0,.5)",
              }}
              aria-hidden
            >
              蔵
            </div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--washi)",
              }}
            >
              Your shelf is empty
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Collect a few anime and they&apos;ll land here — filed by what
              you&apos;re watching, what&apos;s planned, and what you&apos;ve
              finished.
            </p>
            <button
              onClick={() => router.push("/browse")}
              className="mt-6 rounded-lg bg-[var(--hanko)] px-6 py-2.5 text-sm font-semibold text-[var(--washi)] transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Browse anime
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shelf-root mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--washi)",
            }}
          >
            My Shelf
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Tracking {total} {total === 1 ? "entry" : "entries"} across three
            shelves.
          </p>
        </div>

        <div
          className="flex items-stretch gap-2 rounded-xl border p-1.5"
          style={{
            borderColor: "rgba(244,228,192,.2)",
            background: "rgba(10,6,4,.6)",
          }}
        >
          <Stat label="Watching" value={counts.watching} />
          <div className="w-px" style={{ background: "rgba(244,228,192,.1)" }} />
          <Stat label="Plan" value={counts.plan} />
          <div className="w-px" style={{ background: "rgba(244,228,192,.1)" }} />
          <Stat label="Watched" value={counts.watched} />
        </div>
      </div>

      <SceneTabs active={tone} counts={counts} onChange={setTone} />
      <Scene
        tone={tone}
        items={grouped[tone]}
        onMove={updateCategory}
        onEpisodeChange={updateEpisode}
        onRemove={remove}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[72px] flex-col items-center justify-center px-3 py-1">
      <div
        className="flex items-center gap-1.5 font-mono text-lg font-semibold tabular-nums"
        style={{ color: "var(--washi)" }}
      >
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-sm"
          style={{ background: "var(--hanko)" }}
        />
        {value.toString().padStart(2, "0")}
      </div>
      <div
        className="text-[10px] uppercase tracking-[0.12em]"
        style={{
          color: "rgba(244,228,192,.55)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

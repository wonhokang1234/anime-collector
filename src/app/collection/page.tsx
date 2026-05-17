"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { getRarityTier, type RarityTier } from "@/lib/types";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonGrid } from "@/components/ui/skeleton-grid";
import { StatusPip } from "@/components/ui/status-pip";
import { RarityDots } from "@/components/ui/rarity-dots";
import { ErrorBoundary } from "@/components/error-boundary";

type SortKey = "recent" | "title" | "score" | "rarity";
type RarityFilter = RarityTier | "all";

const RARITY_ORDER: Record<RarityTier, number> = {
  legendary: 5,
  epic: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

const RARITY_BORDER_VAR: Record<RarityTier, string> = {
  common: "var(--rarity-common-border)",
  uncommon: "var(--rarity-uncommon-border)",
  rare: "var(--rarity-rare-border)",
  epic: "var(--rarity-epic-border)",
  legendary: "var(--rarity-legendary-border)",
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
            RARITY_ORDER[getRarityTier(a.score)],
        );
        break;
      case "recent":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
      },
    );
  }, [initialized]);

  if (authLoading || !user || !initialized) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header skeleton */}
        <div className="mb-8">
          <div
            className="skeleton-line mb-2"
            style={{ width: 140, height: 28 }}
          />
          <div className="skeleton-line" style={{ width: 200, height: 14 }} />
        </div>
        {/* Card skeleton grid */}
        <SkeletonGrid count={10} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="pt-10">
        <div className="mb-6">
          <SectionHeader
            kickerJp="集"
            kicker="Archive"
            title="My Collection"
            as="h1"
            description={
              items.length === 0
                ? "You haven't collected any anime yet."
                : `${items.length} ${items.length === 1 ? "entry" : "entries"} in the archive.`
            }
          />
        </div>
      </div>

      {/* Sticky sub-header — rarity filter pills + sort select */}
      {items.length > 0 && (
        <div
          className="sticky z-40 py-3 -mx-4 px-4"
          style={{
            top: "var(--navbar-height)",
            background: "var(--bg-page)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "legendary", label: "Legendary" },
                  { key: "epic", label: "Epic" },
                  { key: "rare", label: "Rare" },
                  { key: "uncommon", label: "Uncommon" },
                  { key: "common", label: "Common" },
                ] as { key: RarityFilter; label: string }[]
              ).map(({ key, label }) => {
                const isActive = filter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`filter-pill${isActive ? " filter-pill--active" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2 sm:ml-auto">
              <label
                htmlFor="sort-select"
                className="text-[10px] uppercase tracking-[.3em]"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                style={{
                  width: "auto",
                  paddingTop: "0.35rem",
                  paddingBottom: "0.35rem",
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  borderRadius: 4,
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                }}
              >
                <option value="recent">Recently added</option>
                <option value="title">Title (A–Z)</option>
                <option value="score">Score (high → low)</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="pb-10">
        {items.length === 0 ? (
          <div className="pt-10">
            <EmptyState
              icon="空"
              title="Archive Empty"
              description="Your archive is empty. Start by finding an anime you love."
              action={{
                label: "Browse Anime",
                onClick: () => router.push("/browse"),
              }}
            />
          </div>
        ) : (
          <>
            {/* Section separator */}
            <div className="hairline mt-6 mb-8" />

            {/* Grid */}
            {filtered.length === 0 ? (
              <div
                className="py-20 text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                No anime match this filter.
              </div>
            ) : (
              <ErrorBoundary
                fallback={
                  <EmptyState
                    icon="障"
                    title="Failed to load collection"
                    description="Could not render your collection. Please refresh."
                  />
                }
              >
                <div
                  ref={gridRef}
                  className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                >
                  {filtered.map((item) => {
                    const rarity = getRarityTier(item.score);
                    const watchStatus:
                      | "watching"
                      | "completed"
                      | "plan_to_watch" =
                      item.category === "watched"
                        ? "completed"
                        : item.category === "plan_to_watch"
                          ? "plan_to_watch"
                          : "watching";
                    return (
                      <Link
                        key={item.id}
                        href={`/card/${item.mal_id}`}
                        className="anime-card"
                        style={{
                          display: "block",
                          position: "relative",
                          aspectRatio: "2 / 3",
                          borderRadius: 6,
                          overflow: "hidden",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-default)",
                          borderLeft: `3px solid ${RARITY_BORDER_VAR[rarity]}`,
                          textDecoration: "none",
                        }}
                      >
                        {/* Cover image */}
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          style={{ objectFit: "cover" }}
                        />

                        {/* Status pip — top-right */}
                        <div
                          style={{
                            position: "absolute",
                            top: "0.5rem",
                            right: "0.5rem",
                            zIndex: 3,
                          }}
                        >
                          <StatusPip status={watchStatus} />
                        </div>

                        {/* Bottom info strip */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "0.5rem 0.625rem 0.625rem",
                            background:
                              "linear-gradient(to top, rgba(26,22,20,0.78) 0%, transparent 100%)",
                            zIndex: 2,
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.6875rem",
                              fontWeight: 500,
                              color: "#fff",
                              lineHeight: 1.3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              marginBottom: "0.375rem",
                            }}
                          >
                            {item.title}
                          </p>
                          <RarityDots tier={rarity} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </ErrorBoundary>
            )}
          </>
        )}
      </div>
    </div>
  );
}

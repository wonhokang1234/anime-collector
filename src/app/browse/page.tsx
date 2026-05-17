"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { DURATION, EASE } from "@/lib/motion";
import { AnimeCard } from "@/components/card/anime-card";
import {
  searchAnime,
  getTopAnime,
  getAnimeYear,
  type JikanAnime,
} from "@/lib/jikan";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { useToastStore } from "@/stores/toast-store";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonGrid } from "@/components/ui/skeleton-grid";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { ErrorBoundary } from "@/components/error-boundary";
import { getRarityTier, type RarityTier } from "@/lib/types";

const RARITY_RANGES: { tier: RarityTier; range: string }[] = [
  { tier: "common", range: "<6.0" },
  { tier: "uncommon", range: "6.0–6.9" },
  { tier: "rare", range: "7.0–7.9" },
  { tier: "epic", range: "8.0–8.9" },
  { tier: "legendary", range: "9.0+" },
];

export default function BrowsePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const items = useCollectionStore((s) => s.items);
  const isCollected = useCollectionStore((s) => s.isCollected);
  const collect = useCollectionStore((s) => s.collect);
  const addToast = useToastStore((s) => s.addToast);
  const isMobile = useMediaQuery("(max-width: 639px)");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justCollectedId, setJustCollectedId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const cards = Array.from(gridRef.current.children);
    if (cards.length === 0) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: DURATION.reveal,
        stagger: {
          each: DURATION.revealStagger,
          amount: 12 * DURATION.revealStagger,
        },
        ease: EASE.emphasized,
        clearProps: "opacity,transform",
      },
    );
  }, [loading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Load top anime on mount
  useEffect(() => {
    getTopAnime()
      .then(setResults)
      .catch(() => setError("Failed to load anime. Try again."))
      .finally(() => setLoading(false));
  }, []);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setLoading(true);
      getTopAnime()
        .then(setResults)
        .catch(() => setError("Failed to load anime."))
        .finally(() => setLoading(false));
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchAnime(value);
        setResults(data);
      } catch {
        setError(
          "Search failed. Jikan API may be rate-limited — wait a moment and try again.",
        );
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  const handleCollect = useCallback(
    async (anime: JikanAnime) => {
      if (!user) {
        addToast({
          message: "Not signed in — please log in again.",
          type: "info",
        });
        return;
      }

      const result = await collect(user.id, {
        mal_id: anime.mal_id,
        title: anime.title,
        image_url: anime.images.jpg.large_image_url,
        score: anime.score ?? 0,
        total_episodes: anime.episodes,
      });

      if (result.error) {
        addToast({ message: `Error: ${result.error}`, type: "error" });
      } else {
        const tier = getRarityTier(anime.score ?? 0);
        addToast({
          message: `Added "${anime.title}" to your shelf`,
          type: "success",
          rarityTier: tier,
        });
        // Trigger collect ceremony on the card for 300ms
        setJustCollectedId(anime.mal_id);
        setTimeout(() => setJustCollectedId(null), 300);
      }
    },
    [user, collect, addToast],
  );

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="karuta-spinner karuta-spinner--lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 relative">
      <div className="relative z-10 pt-10">
        {/* Page header */}
        <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <SectionHeader
            kickerJp="探"
            kicker="Discover"
            title="Browse Anime"
            description="Search the archive. Cards glow based on rating — the rarer the find, the louder the foil."
            as="h1"
          />

          {items.length > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2"
              style={{
                border: "1px solid var(--border-default)",
                background: "var(--bg-card)",
                borderRadius: 4,
              }}
            >
              <span className="hanko-dot" aria-hidden />
              <span
                className="font-mono text-base tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {items.length.toString().padStart(2, "0")}
              </span>
              <span
                className="text-[10px] uppercase tracking-[.2em]"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Collected
              </span>
            </div>
          )}
        </div>

        {/* Rarity legend */}
        <div className="mb-6 flex flex-wrap items-center gap-1 sm:gap-2">
          <span
            className="mr-1 text-[10px] uppercase tracking-[.3em]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Rarity —
          </span>
          {RARITY_RANGES.map(({ tier, range }) => (
            <span key={tier} className="inline-flex items-center gap-1.5">
              <RarityBadge tier={tier} />
              <span
                className="text-[10px]"
                style={{ color: "var(--text-muted)", opacity: 0.7 }}
              >
                {range}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Sticky sub-header — search */}
      <div
        className="sticky z-40 py-3 -mx-4 px-4"
        style={{
          top: "var(--navbar-height)",
          background: "var(--bg-page)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Search input with icon and clear button */}
        <div className="relative max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search the library..."
            style={{
              width: "100%",
              paddingBlock: "0.7rem",
              paddingInlineStart: "2.5rem",
              paddingInlineEnd: "2.5rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: 4,
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              outline: "none",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-tint)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
            style={{ color: "var(--text-muted)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          {query !== "" && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                handleSearch("");
              }}
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 pb-10">
        {/* Section separator */}
        <div className="hairline mt-6 mb-8" />

        {/* Loading state — skeleton grid */}
        {loading && <SkeletonGrid count={10} />}

        {/* Error state — designed panel instead of raw red div */}
        {error && !loading && (
          <EmptyState
            icon="障"
            title="Could not load anime"
            description={error}
            action={{
              label: "Try again",
              onClick: () => {
                setError(null);
                setLoading(true);
                (query.trim() ? searchAnime(query) : getTopAnime())
                  .then(setResults)
                  .catch(() =>
                    setError("Still unavailable. Please try again later."),
                  )
                  .finally(() => setLoading(false));
              },
            }}
          />
        )}

        {/* Empty state */}
        {!loading && !error && results.length === 0 && (
          <EmptyState
            icon="空"
            title="Nothing found"
            description="No anime found. Try a different search."
          />
        )}

        {/* Card grid */}
        {!loading && !error && results.length > 0 && (
          <ErrorBoundary
            fallback={
              <EmptyState
                icon="障"
                title="Failed to load cards"
                description="Could not render the card grid. Please refresh."
              />
            }
          >
            <div
              ref={gridRef}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6"
            >
              {results.map((anime) => (
                <AnimeCard
                  key={anime.mal_id}
                  title={anime.title}
                  imageUrl={anime.images.jpg.large_image_url}
                  score={anime.score ?? 0}
                  episodes={anime.episodes}
                  synopsis={anime.synopsis ?? undefined}
                  genres={anime.genres.map((g) => g.name)}
                  studio={anime.studios[0]?.name}
                  year={getAnimeYear(anime)}
                  variant={isMobile ? "compact" : "full"}
                  collected={isCollected(anime.mal_id)}
                  onCollect={() => handleCollect(anime)}
                  isJustCollected={justCollectedId === anime.mal_id}
                />
              ))}
            </div>
          </ErrorBoundary>
        )}
      </div>
      {/* end relative z-10 */}

      {/* Toast is now rendered globally via <Toast /> in layout.tsx */}
    </div>
  );
}

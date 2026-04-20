"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { AnimeCard } from "@/components/card/anime-card";
import { searchAnime, getTopAnime, getAnimeYear, type JikanAnime } from "@/lib/jikan";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import "@/components/card/card.css";

export default function BrowsePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const items = useCollectionStore((s) => s.items);
  const isCollected = useCollectionStore((s) => s.isCollected);
  const collect = useCollectionStore((s) => s.collect);
  const isMobile = useMediaQuery("(max-width: 639px)");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; id: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !gridRef.current) return;
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
        setError("Search failed. Jikan API may be rate-limited — wait a moment and try again.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  const handleCollect = useCallback(
    async (anime: JikanAnime) => {
      if (!user) {
        setToast({ title: "Not signed in — please log in again.", id: Date.now() });
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
        setToast({ title: `Error: ${result.error}`, id: Date.now() });
      } else {
        setToast({ title: `Added "${anime.title}" to your shelf`, id: Date.now() });
      }
    },
    [user, collect]
  );

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  if (authLoading || !user) {
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
      <div className="mb-10 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p
            className="mb-1 text-[10px] uppercase tracking-[.4em]"
            style={{
              color: "var(--washi-soft)",
              fontFamily: "var(--font-display)",
            }}
          >
            <span style={{ fontFamily: "var(--font-jp)" }}>探</span> · Discover
          </p>
          <h1 className="display-title text-4xl font-extrabold">
            Browse Anime
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "rgba(244,228,192,.6)" }}
          >
            Search the archive. Cards glow based on rating — the rarer the
            find, the louder the foil.
          </p>
        </div>

        {items.length > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              border: "1px solid rgba(244,228,192,.2)",
              background: "rgba(10,6,4,.6)",
              borderRadius: 4,
            }}
          >
            <span className="hanko-dot" aria-hidden />
            <span
              className="font-mono text-base tabular-nums"
              style={{ color: "var(--washi)" }}
            >
              {items.length.toString().padStart(2, "0")}
            </span>
            <span
              className="text-[10px] uppercase tracking-[.2em]"
              style={{
                color: "var(--washi-soft)",
                fontFamily: "var(--font-display)",
              }}
            >
              Collected
            </span>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="relative mb-6 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search the library..."
          className="washi-input pl-11"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: "var(--washi-soft)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      {/* Rarity legend */}
      <div className="mb-10 flex flex-wrap items-center gap-1 sm:gap-2">
        <span
          className="mr-1 text-[10px] uppercase tracking-[.3em]"
          style={{
            color: "var(--washi-soft)",
            fontFamily: "var(--font-display)",
          }}
        >
          Rarity —
        </span>
        {[
          { tier: "common", label: "Common", range: "<6.0" },
          { tier: "uncommon", label: "Uncommon", range: "6.0–6.9" },
          { tier: "rare", label: "Rare", range: "7.0–7.9" },
          { tier: "epic", label: "Epic", range: "8.0–8.9" },
          { tier: "legendary", label: "Legendary", range: "9.0+" },
        ].map(({ tier, label, range }) => (
          <span
            key={tier}
            className={`rarity-badge rarity-badge-${tier} text-[10px] px-2.5 py-1 flex items-center gap-1.5`}
          >
            <span>{label}</span>
            <span style={{ opacity: 0.55 }}>{range}</span>
          </span>
        ))}
      </div>

      {/* Loading state — skeleton cards */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-block"
              style={{
                width: isMobile ? 180 : 280,
                height: isMobile ? 260 : 420,
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          className="px-5 py-4 text-sm"
          style={{
            border: "1px solid rgba(196,30,58,.35)",
            background: "rgba(196,30,58,.08)",
            color: "#f4a0ae",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && (
        <div className="py-20 text-center">
          <div
            aria-hidden
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "var(--washi)",
              color: "var(--sumi)",
              fontFamily: "var(--font-jp)",
              fontSize: 18,
              fontWeight: 900,
              boxShadow: "0 2px 6px rgba(0,0,0,.5)",
              opacity: 0.85,
            }}
          >
            空
          </div>
          <p style={{ color: "var(--washi-soft)" }}>
            No anime found. Try a different search.
          </p>
        </div>
      )}

      {/* Card grid */}
      {!loading && !error && results.length > 0 && (
        <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
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
            />
          ))}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-6 right-6 z-50 animate-toast-in"
          style={{
            background:
              "linear-gradient(180deg, rgba(26,18,8,.96), rgba(10,6,4,.96))",
            border: "1px solid rgba(244,228,192,.2)",
            borderBottom: "2px solid var(--hanko)",
            padding: "0.85rem 1.1rem",
            boxShadow: "0 14px 34px rgba(0,0,0,.55)",
            backdropFilter: "blur(8px)",
            borderRadius: 4,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-6 w-6 items-center justify-center font-black"
              style={{
                background: "var(--hanko)",
                color: "var(--washi)",
                fontFamily: "var(--font-jp)",
                fontSize: 11,
                transform: "rotate(-4deg)",
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,.5)",
              }}
            >
              集
            </span>
            <span
              className="text-sm"
              style={{ color: "var(--washi)" }}
            >
              {toast.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

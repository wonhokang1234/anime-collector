"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimeCard } from "@/components/card/anime-card";
import { searchAnime, getTopAnime, getAnimeYear, type JikanAnime } from "@/lib/jikan";
import "@/components/card/card.css";

export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Browse Anime
        </h1>
        <p className="mt-2 text-zinc-400">
          Search for anime to collect. Cards glow based on their rating.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search anime..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-5 py-3 pl-11 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      {/* Rarity legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { tier: "common", label: "Common (< 6.0)" },
          { tier: "uncommon", label: "Uncommon (6.0–6.9)" },
          { tier: "rare", label: "Rare (7.0–7.9)" },
          { tier: "epic", label: "Epic (8.0–8.9)" },
          { tier: "legendary", label: "Legendary (9.0+)" },
        ].map(({ tier, label }) => (
          <span
            key={tier}
            className={`rarity-badge rarity-badge-${tier} text-xs px-3 py-1`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-500">No anime found. Try a different search.</p>
        </div>
      )}

      {/* Card grid */}
      {!loading && !error && results.length > 0 && (
        <div className="flex flex-wrap gap-6 justify-start">
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
              onCollect={() => console.log(`Collecting: ${anime.title}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import gsap from "gsap";
import { DURATION, EASE } from "@/lib/motion";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { useGardenStore } from "@/stores/garden-store";
import { AnimeCard } from "@/components/card/anime-card";
import { getAnimeById, type JikanAnime } from "@/lib/jikan";
import { getRarityTier } from "@/lib/types";
import { RarityDots } from "@/components/ui/rarity-dots";
import type { AnimeCategory } from "@/lib/types";

const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const CATEGORY_OPTIONS: { category: AnimeCategory; label: string }[] = [
  { category: "watching", label: "Currently Watching" },
  { category: "plan_to_watch", label: "Plan" },
  { category: "watched", label: "Watched" },
  { category: "favorite", label: "秘" },
];

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawMalId = Number(params.mal_id);
  const malId = Number.isInteger(rawMalId) && rawMalId > 0 ? rawMalId : 0;

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const items = useCollectionStore((s) => s.items);
  const initialized = useCollectionStore((s) => s.initialized);
  const updateCategory = useCollectionStore((s) => s.updateCategory);
  const updateEpisode = useCollectionStore((s) => s.updateEpisode);
  const remove = useCollectionStore((s) => s.remove);
  const mood = useGardenStore((s) => s.mood);

  const [jikanData, setJikanData] = useState<JikanAnime | null>(null);
  const [jikanLoading, setJikanLoading] = useState(true);
  const [jikanFailed, setJikanFailed] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const imageZoneRef = useRef<HTMLDivElement>(null);
  const infoZoneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const watchedPillRef = useRef<HTMLButtonElement>(null);
  const watchedFlashTlRef = useRef<gsap.core.Timeline | null>(null);

  const item = useMemo(
    () => items.find((i) => i.mal_id === malId),
    [items, malId],
  );

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (initialized && !item) router.push("/collection");
  }, [initialized, item, router]);

  useEffect(() => {
    return () => {
      watchedFlashTlRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (!malId) return;
    let cancelled = false;
    setJikanLoading(true);
    getAnimeById(malId).then((data) => {
      if (cancelled) return;
      if (data) {
        setJikanData(data);
      } else {
        setJikanFailed(true);
      }
      setJikanLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [malId]);

  useEffect(() => {
    if (!item || !imageZoneRef.current || !infoZoneRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      imageZoneRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: DURATION.slow, ease: EASE.out },
      0,
    );
    tl.fromTo(
      infoZoneRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: DURATION.slow, ease: EASE.out },
      0.08,
    );
    tl.fromTo(
      titleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: DURATION.base, ease: EASE.out },
      0.2,
    );
    return () => {
      tl.kill();
    };
  }, [item]);

  if (authLoading || !user || !initialized || !item) {
    return (
      <div
        className="moss"
        data-mood={mood}
        suppressHydrationWarning
        style={{ background: "var(--bg)", minHeight: "100vh" }}
      >
        {/* Zone 1 skeleton */}
        <div
          className="card-detail-zone1-skeleton skeleton-block w-full"
          style={{ borderRadius: 0 }}
        />
        {/* Zone 2 skeleton */}
        <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col gap-4">
          <div
            className="skeleton-line"
            style={{ width: "60%", height: "2.25rem" }}
          />
          <div
            className="skeleton-line"
            style={{ width: "40%", height: "1rem" }}
          />
          <div
            className="skeleton-line"
            style={{ width: "90%", height: "5rem" }}
          />
        </div>
      </div>
    );
  }

  const rarity = getRarityTier(item.score ?? 0);
  const total = item.total_episodes || 0;
  const current = item.current_episode || 0;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  const studio = jikanData?.studios?.[0]?.name ?? null;
  const year = jikanData?.year ?? jikanData?.aired?.prop?.from?.year ?? null;
  const genres = jikanData?.genres?.map((g) => g.name) ?? [];
  const synopsis = jikanData?.synopsis ?? null;

  const itemId = item.id;
  const itemCategory = item.category;

  // Where this story lives in the garden — quiet cross-link
  const gardenView =
    itemCategory === "watching"
      ? "grove"
      : itemCategory === "plan_to_watch"
        ? "seeds"
        : "pond";

  function stepEpisode(delta: number) {
    const next = Math.max(
      0,
      total > 0 ? Math.min(total, current + delta) : current + delta,
    );
    if (next === current) return;
    updateEpisode(itemId, next);
    if (total > 0 && next === total && itemCategory !== "watched") {
      updateCategory(itemId, "watched");
      // Flash the "Watched" pill to signal the auto-advance
      if (watchedPillRef.current) {
        watchedFlashTlRef.current?.kill();
        gsap.set(watchedPillRef.current, {
          clearProps: "backgroundColor,borderColor,color",
        });
        const tl = gsap.timeline();
        watchedFlashTlRef.current = tl;
        tl.to(watchedPillRef.current, {
          backgroundColor: "var(--moss)",
          borderColor: "var(--moss)",
          color: "var(--bg)",
          duration: 0.12,
          ease: EASE.out,
        })
          .to(watchedPillRef.current, {
            backgroundColor: "transparent",
            borderColor: "var(--line2)",
            color: "var(--mut)",
            duration: DURATION.base - 0.12,
            ease: EASE.out,
          })
          .set(watchedPillRef.current, {
            clearProps: "backgroundColor,borderColor,color",
          });
      }
    }
  }

  async function handleRemove() {
    await remove(itemId);
    router.push("/collection");
  }

  return (
    <div
      className="moss"
      data-mood={mood}
      suppressHydrationWarning
      style={{ background: "var(--bg)", minHeight: "100vh" }}
    >
      {/* Back navigation */}
      <div className="mx-auto max-w-4xl px-6 pt-6">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="transition-colors"
          style={{
            fontFamily: "var(--font-kaku), system-ui, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--mut)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--mut)";
          }}
        >
          ← Back
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
          {/* Zone 1 — Card image area */}
          <div
            ref={imageZoneRef}
            style={{ opacity: 0, flexShrink: 0 }}
            className="flex flex-col items-center sm:items-start"
          >
            <div
              style={{
                background:
                  "color-mix(in oklab, var(--panel) 72%, transparent)",
                borderRadius: 8,
                boxShadow: "0 18px 40px rgba(0,0,0,.28)",
                borderLeft: `3px solid var(--rarity-${rarity}-border)`,
                overflow: "hidden",
                width: "min(260px, 100%)",
                position: "relative",
              }}
            >
              <AnimeCard
                title={item.title}
                imageUrl={item.image_url}
                score={item.score}
                episodes={item.total_episodes || null}
                synopsis={synopsis ?? undefined}
                genres={genres.length > 0 ? genres : undefined}
                studio={studio ?? undefined}
                year={year}
                collected
              />
            </div>

            {/* Rarity indicator */}
            <div className="mt-3 flex items-center gap-2">
              <RarityDots tier={rarity} />
              <span
                style={{
                  fontFamily: "var(--font-kaku), system-ui, sans-serif",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  color: `var(--rarity-${rarity}-border)`,
                }}
              >
                {RARITY_LABELS[rarity]}
              </span>
            </div>
          </div>

          {/* Zone 2 — Info / text area */}
          <div ref={infoZoneRef} style={{ opacity: 0, flex: 1, minWidth: 0 }}>
            {/* Title */}
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "var(--font-mincho), serif",
                fontSize: 10.5,
                letterSpacing: "0.5em",
                color: "var(--dim)",
              }}
            >
              札 の 記
            </p>
            <h1
              ref={titleRef}
              style={{
                fontFamily: "var(--font-mincho), serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                lineHeight: 1.12,
                color: "var(--ink)",
                margin: "0 0 1.5rem",
                opacity: 0,
              }}
            >
              {item.title}
            </h1>

            {/* Stats row */}
            <div
              style={{
                borderTop: "1px solid var(--line)",
                borderBottom: "1px solid var(--line)",
                padding: "1rem 0",
                marginBottom: "1.5rem",
              }}
            >
              <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-6">
                <StatCell
                  label="Score"
                  value={item.score ? item.score.toFixed(2) : "—"}
                  mono
                />
                <div
                  className="hidden h-8 w-px sm:block"
                  style={{ background: "var(--line2)" }}
                />
                <StatCell
                  label="Episodes"
                  value={total > 0 ? String(total) : "—"}
                  mono
                />
                <div
                  className="hidden h-8 w-px sm:block"
                  style={{ background: "var(--line2)" }}
                />
                <div
                  className="col-span-2 h-px block sm:hidden"
                  style={{ background: "var(--line)" }}
                />
                <StatCell
                  label="Year"
                  value={year ? String(year) : null}
                  loading={jikanLoading}
                  failed={jikanFailed}
                  mono
                />
                <div
                  className="hidden h-8 w-px sm:block"
                  style={{ background: "var(--line2)" }}
                />
                <StatCell
                  label="Studio"
                  value={studio}
                  loading={jikanLoading}
                  failed={jikanFailed}
                />
              </div>
            </div>

            {/* Progress */}
            <div
              className="py-5"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-kaku), system-ui, sans-serif",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  color: "var(--dim)",
                  marginBottom: "0.75rem",
                }}
              >
                Progress
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Previous episode"
                  onClick={() => stepEpisode(-1)}
                  className="flex items-center justify-center rounded text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    background:
                      "color-mix(in oklab, var(--panel) 60%, transparent)",
                    color: "var(--mut)",
                    border: "1px solid var(--line2)",
                    width: "44px",
                    height: "44px",
                    minWidth: "44px",
                    minHeight: "44px",
                    outlineColor: "var(--moss)",
                    cursor: "pointer",
                  }}
                >
                  −
                </button>
                <div className="flex-1">
                  {total > 0 ? (
                    <>
                      <div
                        role="progressbar"
                        aria-valuenow={current}
                        aria-valuemin={0}
                        aria-valuemax={total}
                        aria-label={`Episode progress: ${current} of ${total}`}
                        className="h-1.5 overflow-hidden rounded-full"
                        style={{ background: "var(--line)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            background: "var(--moss)",
                          }}
                        />
                      </div>
                      <div className="mt-1.5 flex justify-between">
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6875rem",
                            color: "var(--mut)",
                          }}
                        >
                          Episode {current} / {total}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6875rem",
                            color: "var(--dim)",
                          }}
                        >
                          {percent}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        color: "var(--mut)",
                      }}
                    >
                      Episode {current}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Next episode"
                  onClick={() => stepEpisode(1)}
                  className="flex items-center justify-center rounded text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    background:
                      "color-mix(in oklab, var(--panel) 60%, transparent)",
                    color: "var(--mut)",
                    border: "1px solid var(--line2)",
                    width: "44px",
                    height: "44px",
                    minWidth: "44px",
                    minHeight: "44px",
                    outlineColor: "var(--moss)",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Shelf / Category */}
            <div
              className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-kaku), system-ui, sans-serif",
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase" as const,
                    color: "var(--dim)",
                    marginBottom: "0.625rem",
                  }}
                >
                  Shelf
                </div>
                {/* 2×2 grid on narrow screens, flex wrap on sm+ for comfortable tap targets */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {CATEGORY_OPTIONS.map(({ category, label }) => {
                    const active = item.category === category;
                    return (
                      <button
                        key={category}
                        ref={
                          category === "watched" ? watchedPillRef : undefined
                        }
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          if (!active) updateCategory(item.id, category);
                        }}
                        className={`filter-pill${active ? " filter-pill--active" : ""}`}
                        style={{
                          fontFamily:
                            label === "秘"
                              ? "var(--font-jp)"
                              : "var(--font-kaku), system-ui, sans-serif",
                          minHeight: "44px",
                          borderRadius: "4px",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                {confirmRemove ? (
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: "var(--font-kaku), system-ui, sans-serif",
                        fontSize: "0.8125rem",
                        color: "var(--dim)",
                      }}
                    >
                      Remove?
                    </span>
                    <button
                      type="button"
                      onClick={handleRemove}
                      style={{
                        fontFamily: "var(--font-kaku), system-ui, sans-serif",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        color: "var(--mg-error)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "0",
                        transition: "opacity 150ms ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(false)}
                      style={{
                        fontFamily: "var(--font-kaku), system-ui, sans-serif",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        color: "var(--dim)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "0",
                        transition: "opacity 150ms ease-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(true)}
                    style={{
                      fontFamily: "var(--font-kaku), system-ui, sans-serif",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "var(--mg-error)",
                      border:
                        "1px solid color-mix(in oklab, var(--mg-error) 15%, transparent)",
                      background: "transparent",
                      borderRadius: "4px",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      transition:
                        "background 150ms ease-out, border-color 150ms ease-out",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "color-mix(in oklab, var(--mg-error) 15%, transparent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Synopsis & genres */}
            <div className="py-5">
              <div
                style={{
                  fontFamily: "var(--font-kaku), system-ui, sans-serif",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  color: "var(--dim)",
                  marginBottom: "0.75rem",
                }}
              >
                Synopsis
              </div>
              {jikanLoading ? (
                <div className="flex flex-col gap-2">
                  <span className="skeleton-line" style={{ width: "100%" }} />
                  <span className="skeleton-line" style={{ width: "90%" }} />
                  <span className="skeleton-line" style={{ width: "75%" }} />
                </div>
              ) : synopsis ? (
                <p
                  style={{
                    fontFamily: "var(--font-kaku), system-ui, sans-serif",
                    fontSize: "0.9375rem",
                    lineHeight: 1.7,
                    color: "var(--mut)",
                    margin: 0,
                  }}
                >
                  {synopsis}
                </p>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-kaku), system-ui, sans-serif",
                    fontSize: "0.9375rem",
                    color: "var(--dim)",
                    margin: 0,
                  }}
                >
                  Synopsis unavailable
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {jikanLoading ? (
                  <>
                    <span
                      className="skeleton-line"
                      style={{ width: 60, height: 22 }}
                    />
                    <span
                      className="skeleton-line"
                      style={{ width: 72, height: 22 }}
                    />
                    <span
                      className="skeleton-line"
                      style={{ width: 54, height: 22 }}
                    />
                  </>
                ) : genres.length > 0 ? (
                  genres.map((g) => (
                    <span
                      key={g}
                      className="filter-pill"
                      style={{
                        fontSize: "0.6875rem",
                        padding: "2px 8px",
                        borderRadius: "2px",
                        cursor: "default",
                      }}
                    >
                      {g}
                    </span>
                  ))
                ) : null}
              </div>
            </div>

            {/* Quiet cross-link into the garden */}
            <div
              style={{
                paddingTop: "0.5rem",
                borderTop: "1px solid var(--line)",
              }}
            >
              <Link
                href={`/garden?view=${gardenView}`}
                className="mg-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "var(--font-mincho), serif",
                  fontSize: "0.8125rem",
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                }}
              >
                See it in the garden ⟶
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  loading = false,
  failed = false,
  mono = false,
}: {
  label: string;
  value: string | null;
  loading?: boolean;
  failed?: boolean;
  mono?: boolean;
}) {
  return (
    <div style={{ textAlign: "center", minWidth: "64px" }}>
      <div
        style={{
          fontFamily: "var(--font-kaku), system-ui, sans-serif",
          fontSize: "0.625rem",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase" as const,
          color: "var(--dim)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      {loading ? (
        <span
          className="skeleton-line mx-auto block"
          style={{ width: 48, height: 18 }}
        />
      ) : (
        <div
          style={{
            fontSize: mono ? "2rem" : "0.875rem",
            fontFamily: mono
              ? "var(--font-mono)"
              : "var(--font-kaku), system-ui, sans-serif",
            lineHeight: mono ? 1 : 1.4,
            letterSpacing: mono ? "-0.02em" : "0",
            color: "var(--ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {failed ? "—" : (value ?? "—")}
        </div>
      )}
    </div>
  );
}

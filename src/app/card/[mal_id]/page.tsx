"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import gsap from "gsap";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";
import { AnimeCard } from "@/components/card/anime-card";
import { getAnimeById, type JikanAnime } from "@/lib/jikan";
import { getRarityTier } from "@/lib/types";
import type { AnimeCategory } from "@/lib/types";
import "./card-detail.css";

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
  const malId = Number(params.mal_id);

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const items = useCollectionStore((s) => s.items);
  const initialized = useCollectionStore((s) => s.initialized);
  const updateCategory = useCollectionStore((s) => s.updateCategory);
  const updateEpisode = useCollectionStore((s) => s.updateEpisode);
  const remove = useCollectionStore((s) => s.remove);

  const [jikanData, setJikanData] = useState<JikanAnime | null>(null);
  const [jikanLoading, setJikanLoading] = useState(true);
  const [jikanFailed, setJikanFailed] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const item = useMemo(
    () => items.find((i) => i.mal_id === malId),
    [items, malId]
  );

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (initialized && !item) router.push("/collection");
  }, [initialized, item, router]);

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
    return () => { cancelled = true; };
  }, [malId]);

  useEffect(() => {
    if (!item || !cardRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      glowRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "power1.out" }
    );
    tl.fromTo(
      cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      0
    );
    tl.fromTo(
      labelRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      0.2
    );
    tl.fromTo(
      titleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      0.4
    );
    return () => { tl.kill(); };
  }, [item]);

  if (authLoading || !user || !initialized || !item) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
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

  function stepEpisode(delta: number) {
    const next = Math.max(
      0,
      total > 0 ? Math.min(total, current + delta) : current + delta
    );
    if (next === current) return;
    updateEpisode(item!.id, next);
    if (total > 0 && next === total && item!.category !== "watched") {
      updateCategory(item!.id, "watched");
    }
  }

  async function handleRemove() {
    await remove(item!.id);
    router.push("/collection");
  }

  return (
    <div
      className="card-detail-root shelf-root min-h-screen"
      data-rarity={rarity}
    >
      <div
        ref={heroRef}
        className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-16"
        style={{
          background: "linear-gradient(180deg, #0a0a10 0%, #0d0d18 100%)",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-5 top-5 text-[11px] uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
          style={{ color: "rgba(244,228,192,0.5)" }}
        >
          ← Back
        </button>

        <div
          ref={labelRef}
          className="mb-5 text-[9px] font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--cd-accent)", opacity: 0 }}
        >
          ✦ {RARITY_LABELS[rarity]} ✦
        </div>

        <div className="relative">
          <div ref={glowRef} className="card-stage-glow" style={{ opacity: 0 }} />
          <div ref={cardRef} style={{ position: "relative", zIndex: 1, opacity: 0 }}>
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
          <div className="card-stage-pedestal mx-auto" />
        </div>

        <h1
          ref={titleRef}
          className="mt-5 max-w-lg text-center text-[22px] font-extrabold tracking-[0.04em]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--washi)",
            opacity: 0,
          }}
        >
          {item.title}
        </h1>
      </div>

      <div className="mx-auto max-w-[640px] px-6 pb-16">
        <div
          className="flex items-center justify-center gap-6 py-5"
          style={{
            borderTop: "1px solid rgba(244,228,192,0.08)",
            borderBottom: "1px solid rgba(244,228,192,0.08)",
          }}
        >
          <StatCell label="Score" value={item.score ? item.score.toFixed(2) : "—"} />
          <div className="h-8 w-px" style={{ background: "rgba(244,228,192,0.1)" }} />
          <StatCell label="Episodes" value={total > 0 ? String(total) : "—"} />
          <div className="h-8 w-px" style={{ background: "rgba(244,228,192,0.1)" }} />
          <StatCell
            label="Year"
            value={year ? String(year) : null}
            loading={jikanLoading}
            failed={jikanFailed}
          />
          <div className="h-8 w-px" style={{ background: "rgba(244,228,192,0.1)" }} />
          <StatCell
            label="Studio"
            value={studio}
            loading={jikanLoading}
            failed={jikanFailed}
          />
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center py-4">
          {jikanLoading ? (
            <>
              <span className="skeleton-line" style={{ width: 60, height: 22 }} />
              <span className="skeleton-line" style={{ width: 72, height: 22 }} />
              <span className="skeleton-line" style={{ width: 54, height: 22 }} />
            </>
          ) : genres.length > 0 ? (
            genres.map((g) => (
              <span
                key={g}
                className="rounded px-2.5 py-1 text-[10px]"
                style={{
                  background: "rgba(244,228,192,0.06)",
                  border: "1px solid rgba(244,228,192,0.1)",
                  color: "rgba(244,228,192,0.5)",
                }}
              >
                {g}
              </span>
            ))
          ) : null}
        </div>

        <div
          className="py-6"
          style={{ borderTop: "1px solid rgba(244,228,192,0.08)" }}
        >
          <div
            className="mb-3 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "rgba(244,228,192,0.5)" }}
          >
            Progress
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => stepEpisode(-1)}
              className="flex h-7 w-7 items-center justify-center rounded text-sm transition-colors"
              style={{
                background: "rgba(244,228,192,0.08)",
                color: "rgba(244,228,192,0.5)",
              }}
            >
              −
            </button>
            <div className="flex-1">
              {total > 0 ? (
                <>
                  <div
                    className="h-1.5 overflow-hidden rounded-full"
                    style={{ background: "rgba(244,228,192,0.08)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        background: "linear-gradient(90deg, var(--hanko), #e84565)",
                      }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between">
                    <span
                      className="text-[11px]"
                      style={{ color: "rgba(244,228,192,0.7)" }}
                    >
                      Episode {current} / {total}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "rgba(244,228,192,0.35)" }}
                    >
                      {percent}%
                    </span>
                  </div>
                </>
              ) : (
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(244,228,192,0.7)" }}
                >
                  Episode {current}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => stepEpisode(1)}
              className="flex h-7 w-7 items-center justify-center rounded text-sm transition-colors"
              style={{
                background: "rgba(244,228,192,0.08)",
                color: "rgba(244,228,192,0.5)",
              }}
            >
              +
            </button>
          </div>
        </div>

        <div
          className="flex items-center justify-between gap-4 py-6"
          style={{ borderTop: "1px solid rgba(244,228,192,0.08)" }}
        >
          <div>
            <div
              className="mb-2 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "rgba(244,228,192,0.5)" }}
            >
              Shelf
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(({ category, label }) => {
                const active = item.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      if (!active) updateCategory(item!.id, category);
                    }}
                    className="rounded-md px-3.5 py-1.5 text-[11px] tracking-[0.08em] transition-colors"
                    style={{
                      background: active
                        ? "rgba(196,30,58,0.2)"
                        : "rgba(244,228,192,0.04)",
                      border: active
                        ? "1px solid rgba(196,30,58,0.4)"
                        : "1px solid rgba(244,228,192,0.1)",
                      color: active
                        ? "var(--washi)"
                        : "rgba(244,228,192,0.5)",
                      fontFamily:
                        label === "秘"
                          ? "var(--font-jp)"
                          : "var(--font-display)",
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
                  className="text-[11px]"
                  style={{ color: "rgba(244,228,192,0.5)" }}
                >
                  Remove?
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-[11px] tracking-[0.08em] transition-opacity hover:opacity-80"
                  style={{ color: "var(--hanko)" }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(false)}
                  className="text-[11px] tracking-[0.08em] transition-opacity hover:opacity-80"
                  style={{ color: "rgba(244,228,192,0.4)" }}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="text-[11px] tracking-[0.08em] transition-opacity hover:opacity-80"
                style={{ color: "rgba(196,30,58,0.6)" }}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div
          className="py-6"
          style={{ borderTop: "1px solid rgba(244,228,192,0.08)" }}
        >
          <div
            className="mb-3 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "rgba(244,228,192,0.5)" }}
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
              className="text-[13px] leading-[1.7]"
              style={{ color: "rgba(244,228,192,0.65)" }}
            >
              {synopsis}
            </p>
          ) : (
            <p
              className="text-[13px]"
              style={{ color: "rgba(244,228,192,0.3)" }}
            >
              Synopsis unavailable
            </p>
          )}
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
}: {
  label: string;
  value: string | null;
  loading?: boolean;
  failed?: boolean;
}) {
  return (
    <div className="text-center">
      {loading ? (
        <span className="skeleton-line mx-auto block" style={{ width: 48, height: 18 }} />
      ) : (
        <div
          className="text-base font-bold"
          style={{ color: "var(--washi)" }}
        >
          {value ?? "—"}
        </div>
      )}
      <div
        className="mt-0.5 text-[8px] uppercase tracking-[0.15em]"
        style={{ color: "rgba(244,228,192,0.4)" }}
      >
        {label}
      </div>
    </div>
  );
}

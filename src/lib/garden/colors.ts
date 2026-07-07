import { create } from "zustand";
import { mulberry32 } from "@/lib/scatter";

const CACHE_KEY = "karuta-garden-colors-v1";

export interface AccentPair {
  c1: string;
  c2: string;
}

/** Deterministic muted fallback in the reference's palette register. */
export function hashAccent(malId: number): AccentPair {
  const rnd = mulberry32(malId);
  const hue = Math.floor(rnd() * 360);
  return {
    c1: `hsl(${hue} 34% 63%)`,
    c2: `hsl(${hue} 30% 41%)`,
  };
}

function loadCache(): Record<number, AccentPair> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Average color of a 24×24 downsample; c2 = darkened c1. */
async function sampleCover(imageUrl: string): Promise<AccentPair | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 24;
        const g = c.getContext("2d");
        if (!g) return resolve(null);
        g.drawImage(img, 0, 0, 24, 24);
        const d = g.getImageData(0, 0, 24, 24).data;
        let r = 0,
          gr = 0,
          b = 0,
          n = 0;
        for (let i = 0; i < d.length; i += 4) {
          r += d[i];
          gr += d[i + 1];
          b += d[i + 2];
          n++;
        }
        r = Math.round(r / n);
        gr = Math.round(gr / n);
        b = Math.round(b / n);
        const hex = (v: number) => v.toString(16).padStart(2, "0");
        const dk = (v: number) => Math.round(v * 0.62);
        resolve({
          c1: `#${hex(r)}${hex(gr)}${hex(b)}`,
          c2: `#${hex(dk(r))}${hex(dk(gr))}${hex(dk(b))}`,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    // same-origin via Next image optimizer → canvas not tainted
    img.src = `/_next/image?url=${encodeURIComponent(imageUrl)}&w=64&q=50`;
  });
}

interface ColorState {
  colors: Record<number, AccentPair>;
  ensure: (items: { malId: number; imageUrl: string }[]) => void;
}

const inFlight = new Set<number>();

export const useGardenColors = create<ColorState>((set, get) => ({
  colors: loadCache(),

  ensure: (items) => {
    for (const { malId, imageUrl } of items) {
      if (get().colors[malId] || inFlight.has(malId)) continue;
      inFlight.add(malId);
      void sampleCover(imageUrl).then((pair) => {
        const resolved = pair ?? hashAccent(malId);
        const next = { ...get().colors, [malId]: resolved };
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {}
        set({ colors: next });
        inFlight.delete(malId);
      });
    }
  },
}));

/** Synchronous accessor with fallback — components always get a pair. */
export function accentFor(
  colors: Record<number, AccentPair>,
  malId: number,
): AccentPair {
  return colors[malId] ?? hashAccent(malId);
}

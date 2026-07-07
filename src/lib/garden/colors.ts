import { create } from "zustand";
import { mulberry32 } from "@/lib/scatter";

const CACHE_KEY = "karuta-garden-colors-v2";

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
        // Convert to HSL and enforce a saturation floor so muddy averages
        // still read as intentional accents (matches hashAccent's palette register).
        const rN = r / 255,
          gN = gr / 255,
          bN = b / 255;
        const max = Math.max(rN, gN, bN),
          min = Math.min(rN, gN, bN);
        const delta = max - min;
        const l = (max + min) / 2;
        let h = 0;
        if (delta > 0) {
          const s0 = delta / (1 - Math.abs(2 * l - 1));
          if (max === rN) h = ((gN - bN) / delta + 6) % 6;
          else if (max === gN) h = (bN - rN) / delta + 2;
          else h = (rN - gN) / delta + 4;
          h = Math.round((h / 6) * 360);
          const s = Math.round(Math.max(s0, 0.28) * 100); // floor at 28%
          const lc = Math.round(Math.min(Math.max(l, 0.45), 0.65) * 100);
          resolve({
            c1: `hsl(${h} ${s}% ${lc}%)`,
            c2: `hsl(${h} ${Math.round(s * 0.85)}% ${Math.round(lc * 0.64)}%)`,
          });
        } else {
          resolve(null); // achromatic → fall through to hashAccent
        }
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

// module-level; HMR full re-eval resets this — inFlight guard makes that safe
const inFlight = new Set<number>();

export const useGardenColorsStore = create<ColorState>((set, get) => ({
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

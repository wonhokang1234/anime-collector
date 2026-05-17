// Mulberry32 — fast, good distribution, deterministic for a given seed
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ScatterTransform {
  rotation: number; // degrees, range ±6
  jitterX: number; // px, range ±10
  jitterY: number; // px, range ±10
}

export function getScatterTransform(malId: number): ScatterTransform {
  const rand = mulberry32(malId);
  return {
    rotation: (rand() - 0.5) * 12,
    jitterX: (rand() - 0.5) * 20,
    jitterY: (rand() - 0.5) * 20,
  };
}

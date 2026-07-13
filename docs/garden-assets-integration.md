# Garden Visual Assets — Integration Guide

Generated 2026-07-13 with Z-Image-Turbo via the Hugging Face MCP. Source
prompts, seeds, and URLs are recorded in `scripts/garden-assets.json`; the
files live under `public/garden/`. This guide maps each asset to the exact
place in the code where it upgrades a flat-color polygon or CSS gradient.

## Why

The Moss Garden overworld (`src/lib/garden/garden3d.ts`) is fully procedural:
every material is a flat-color `MeshStandardMaterial`, and the only textures
are random canvas noise blobs (`noiseTexture()`). The four interiors are pure
CSS gradients. These assets replace that with painted/photographic surfaces
while keeping every mesh, animation, and interaction untouched.

## 1. 3D world textures (`public/garden/textures/`)

Load once in the `Garden3D` constructor with a shared loader:

```ts
const texLoader = new THREE.TextureLoader();
const loadTex = (url: string, rx: number, ry: number) => {
  const t = texLoader.load(url);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(rx, ry);
  t.anisotropy = this.renderer!.capabilities.getMaxAnisotropy();
  return t;
};
```

| Asset | Replaces | Where |
|---|---|---|
| `moss-ground.webp` | `noiseTexture(THREE, 0x16281c, …)` on the 200×200 ground plane | `_buildStatic()` — `this.groundTex` / `this.groundMat` (repeat ~14×14). Also the moss mound's `mossTex` (repeat ~4×4). |
| `gravel-raked.webp` | `noiseTexture(THREE, 0x8a8f7f, …)` on the karesansui plaza | `_buildStatic()` — `this.gravelTex` / `this.gravelMat` (repeat ~3×3). The five procedural rake rings can then be removed or kept as accents. |
| `water-pond.webp` | flat `waterMat` color on the pond circle | `_buildStatic()` — add as `map` on `this.waterMat`, keep the existing color tint + opacity pulse in `_tick()`. Animate `map.offset` slowly (e.g. `t.offset.x = time * 0.008`) for drift. |
| `roof-tiles.webp` | *(not applied)* | Tried on `M.roof` / `M.roofL`, but the stacked 4-sided frustum roofs shear any wrapped texture into noise — the flat charcoal silhouette reads better. Kept for future use (e.g. proper roof geometry or a bump map). |
| `wood-planks.webp` | flat `M.woodD` / `M.woodM` / `M.woodL` | shared materials — add `map` (repeat ~2×2). Deck, engawa, bridge planks, gate posts, crates. Keep the per-material color as tint. |

Notes:
- Keep `setMood()` untouched — it tints `groundMat.color` / `gravelMat.color`,
  which multiplies over the map, so midnight/dawn moods keep working.
- Diffusion output is near-seamless, not guaranteed-seamless. At the listed
  repeat counts any seam reads as natural variation. If a seam bothers you on
  the big ground plane, raise the repeat or mirror-wrap
  (`THREE.MirroredRepeatWrapping`).
- Dispose these textures in `dispose()` alongside the renderer.

## 2. Interior backdrops (`public/garden/interiors/`)

`grove.webp`, `pond.webp`, `seeds.webp`, `records.webp` — one painted
establishing shot per interior, matching each view's identity (moonlit bonsai
rows / koi under a vermilion bridge / lantern-lit seed shop shelves / lamplit
archive desk).

Suggested use in `InteriorShell` (`src/components/garden/interior-shell.tsx`):
a full-bleed background layer *behind* the existing panels, dimmed so the
current glass-panel UI stays readable:

```tsx
<div aria-hidden style={{
  position: "absolute", inset: 0, zIndex: 0,
  backgroundImage: `url(/garden/interiors/${view}.webp)`,
  backgroundSize: "cover", backgroundPosition: "center",
  opacity: mood === "midnight" ? 0.45 : 0.3,
  filter: "saturate(0.85)",
}} />
<div style={{ position: "absolute", inset: 0, zIndex: 0,
  background: "linear-gradient(180deg, color-mix(in oklab, var(--bg) 70%, transparent), var(--bg) 92%)" }} />
```

Existing petals/fireflies layers sit above it; content panels keep their
`backdropFilter` blur, which now has real texture to blur.

## 3. Mood skies (`public/garden/sky/`)

`midnight.webp` and `dawn.webp` — 21:9 painted panoramas matching the two
`MOODS` presets (`0x0a1612` night, `0xdfe8d6` dawn).

Options, in increasing effort:
1. **Landing / auth pages** — hero background behind the existing content.
2. **Transition overlay** (`transition-overlay.tsx`) — reveal the matching sky
   during themed transits between world and interiors.
3. **3D scene backdrop** — a large distant plane (or shallow cylinder segment)
   behind the north wall, `MeshBasicMaterial({ map, fog: false })`, swapped in
   `setMood()`. Keep `scene.fog` as-is; the fog color already matches each
   sky's base tone so the horizon blends.

## Round 2 — painterly art overhaul

A second texture set (see `scripts/garden-assets.json`, seeds 301–315) moved
the world to a hand-painted anime style: painterly moss base + clover/flower
and sakura-petal variation patches, watercolor raked sand, stone paving for
the path ribbons, plaster walls, bark, and rock (sampled from one block of
the generated masonry via UV offset). `garden3d.ts` gained: environment
lighting + bloom (`EffectComposer`), deterministic vertex jitter (`organic()`)
for foliage/rocks/mound, smooth ribbon path geometry, feathered ground
patches, soft-sprite petals/fireflies, lantern halo sprites, and a moonlight
streak on the pond — all mood-aware via extended `MOODS` fields.

## Regeneration

Every asset's prompt + seed is in `scripts/garden-assets.json`. The gradio
file URLs there are temporary; to regenerate, run the same prompt/seed through
the Z-Image-Turbo space (or any newer model) and re-run the
`fetch-garden-assets` workflow with updated URLs.

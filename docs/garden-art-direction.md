# Garden Art Direction — Moonlit Jade (月夜の翡翠)

Chosen 2026-07-14 from four candidate directions (Moonlit Jade, Ukiyo-e
Twilight, Sumi & Vermilion, Sakura Dusk). This document is the source of
truth for the garden's color decisions; the machine-readable palette lives
as `JADE` in `src/lib/garden/garden3d.ts`.

## Philosophy

A serene, bioluminescent night garden. Every surface lives inside **one
jade-teal family**; *light* is the color story — celadon moonlight, amber
lantern pools, blush sakura. Warm accents (shrine vermilion, temple gold)
are reserved for man-made things: the torii, the bridge, the lanterns.
Ghibli-nocturne, painterly, soft.

## Palette

| Role | Hex | Notes |
|---|---|---|
| Ground moss | `#1d3b31` | base of all ground compositing |
| Foliage | `#3f7059` | leaf pads, shrubs, pines |
| Grass tips | `#8fd0ae` | celadon highlights, grass blade tips |
| Water | `#16333c` | pond; blue-leaning teal |
| Sand | `#e6dcc0` | karesansui field, warm paper |
| Wood | `#2e2622` | dark structural wood |
| Roof slate | `#3c4652` | all roofs, wall caps |
| Vermilion | `#c8452c` | torii, bridge — the hero accent |
| Vermilion deep | `#963321` | bridge planks, torii kasagi |
| Lantern gold | `#ffc873` | flames, shoji glow, halos |
| Sakura blush | `#f2c2d4` | canopy, petals, lily blooms |
| Moon celadon | `#cfe8d8` | directional (moon) light color |

## Rules

1. **Ground/foliage** never leave the jade family — compositing bases in
   `_loadArt` derive from `groundMoss`/`foliage`.
2. **Warm colors mark the man-made**: vermilion and gold only on
   architecture and lights, so they read as accents against the jade.
3. **Moods change light, not hue families**: midnight = celadon moon +
   strong lantern gold + fireflies/mist; dawn = warm cream sun, accents
   dimmed, same surfaces.
4. **Sakura pink is the only other saturated note** and stays blush, never
   hot pink.
5. New assets (textures, sprites) must be palette-locked through
   `_softTex`/`_patchTex` with a base color from this table.

## Follow-up

The 2D `.moss` CSS tokens in `globals.css` (interiors, browse/card/auth
pages) should eventually be re-derived from this table so the whole app
shares the direction.

# 民居外立面：加什么、多大概率 · House facades: what ornament, how often

## Sources and colour rules (2026-10-28, these override the older notes below)
The `refs/houses_*.jpg` images that the table below was studied from are **screenshots of a city-building game**.
They gave the city exposed braced half-timbering, washed-beige roofs, pastel and pink walls, and Renaissance stone
balconies. The material and colour evidence is now `refs/arch/` (scans of Herculaneum, Ostia and Rome, sources and
licences in `refs/arch/SOURCES.md`). The ornament percentages below still stand where they do not contradict this.
* 【史】Walls: rubble or tuff (opus incertum, opus reticulatum) with brick quoins, bands and arches; brick facing
  increasingly after AD 64. Upper storeys in lime plaster: off-white, grey-beige, yellow and pale ochre, sometimes a
  red-ochre wash or red dado. No pinks or mauves.
* 【史】Opus craticium (timber frame with infill) was plastered over, as at Herculaneum's Casa a Graticcio. Show the
  frame only where the plaster has fallen, or as corner posts and floor-beam lines (GLB `timber_skin(plastered=True)`).
  The book: "木头搭的，墙上糊着泥".
* 【史】Roofs: fired terracotta tegulae and imbrices, orange-red, low pitch (about 18–24°). Weathering darkens them and
  adds lichen; it does not bleach them beige. Flat terraces are opus signinum: matte brown-red, not shiny pink.
* Albedo: the shader colours are linear and should sit near the GLB values in `romeMat` (plaster ~.5, roof tile
  (.39,.1,.047)). The old .8–.9 plaster made the procedural houses glare white beside the modelled buildings.

Studied: `罗马风格参考/民居参考/` (luxury city houses, noble villa, mid-income, low-income; contact sheets in the
scratchpad) and `refs/houses_*.jpg`. Today's procedural houses (src/world/lots.js + the facade shader driven by
`g.set(part, seed, sty, fl, nSt, gH, band, lit)`) put a thin line at every floor, vertical timber grids on many walls,
a wavy band, and noisy dotted window frames. The author: **fewer plain horizontal/vertical stripes**.

## What the references actually do
Ornament is concentrated around openings, the ground floor and the eaves, not spread as stripes:
* **Luxury:** ivory/cream stucco, ochre-red ground storey; grouped arched windows (two or three under one relieving
  arch), moulded window frames with small hoods; a projecting cornice under the eaves (dentils); one moulded string
  course with a real shadow; a corner or top-floor loggia with columns; stone balconies with balustrades and flower
  boxes; ground-floor arcade or portico with shops and awnings.
* **Mid-income:** cream or ochre walls on a terracotta-red base storey; small arched or square windows with brown
  shutters; a painted red arch "eyebrow" over windows; small painted lozenges or rosettes between windows; a painted
  frieze (wave, meander or garland) under the eaves; brick quoins at corners; wooden balconies; roof terraces with
  arches and pots.
* **Low-income:** rough grey-beige plaster with patches showing brick or stone, stone plinth and corners; one upper
  storey in timber frame with infill (opus craticium: posts with diagonal braces, not a regular grid); small square
  windows with shutters or grilles; wooden galleries, lean-tos, ladders, laundry, pots.

## The table (per building, decided once from its hash; per element where it says so)
| Feature | poor | mid | rich |
|---|---|---|---|
| Plain thin line at every floor (today's default) | 0 % | 0 % | 0 % |
| One band only, at first-floor level (painted, two tones) | 10 % | 35 % | — |
| Moulded string course with shadow (geometry) | — | 10 % | 70 % |
| Eaves: plain / painted frieze / dentil cornice (geometry) | 100/0/0 | 55/30/15 | 10/10/80 |
| Base storey painted ochre/terracotta (or red dado 1.2 m) | 20 % | 70 % | 60 % |
| Exposed stone/brick plinth and corner quoins | 50 % | 35 % | 20 % (travertine) |
| Weathered patches showing brick/stone | 60 % | 25 % | 5 % |
| Timber-frame upper storey with diagonal braces (one storey only) | 35 % | 10 % | 0 % |
| Windows: small square with shutters / arched / grouped under relieving arch | 90/10/0 | 50/42/8 | 15/50/35 |
| Window surround: none / painted red arch / brick relieving arch / moulded frame with hood | 80/0/20/0 | 25/45/20/10 | 5/10/15/70 |
| Shutters (per window: open, half, closed) | 60 % | 50 % | 25 % |
| Small painted motifs between windows (lozenge, rosette, medallion) | 5 % | 25 % | 20 % (relief) |
| Painted shop sign or election notice (red letters on a white panel) by a door | 15 % | 20 % | 5 % |
| Street shrine niche beside a door | 8 % | 8 % | 8 % |
| Wooden balcony along part of the first floor | 35 % | 45 % | 15 % |
| Stone balcony with balustrade and flower box | 0 % | 15 % | 40 % |
| Corner or top-floor loggia (arches or columns) | 0 % | 25 % | 45 % |
| Roof terrace with pergola and pots | 5 % | 25 % | 30 % |
| Ground floor on a street: shops with shutters and counter / arcade or portico | 40/0 | 70/10 | 40/45 |
| Shop awning (linen, saffron, madder; never green) | 15 % | 35 % | 30 % |
| Pots on sills, laundry lines | 10/40 % | 30/25 % | 50/0 % |

Palettes: rich = ivory/cream, ochre-red base, travertine trim, red/purple accents; mid = cream/ochre, terracotta
base, brown shutters, small purple/blue motifs; poor = grey-beige rough plaster, brown timber, faded ochre.
Neighbouring buildings must not repeat the same combination (hash per building, re-roll if equal to the left
neighbour). Remove the dotted/noisy window-frame texture; frames are either clean painted shapes or geometry.

## Phase 4 additions (from `refs/city_street_square.jpg`) — implemented 2026-10-23
Decided once per building from a hash of its lot seed (`hz(seed,k)` in monuments.js, so the city layout does not change), tier = rich (domus lots), mid, poor (dense insula lots).
| Feature | poor | mid | rich | Where |
|---|---|---|---|---|
| Top-floor open loggia with real arches (stone arcade, recessed top storey; needs 2+ storeys for rich, 3+ for mid) | 0 | 10 % | 20 % | `o.loggiaA`, lots.js (`arcade`) |
| Painted garland frieze under the eaves (cream band, green festoons, red ties) | 0 | 15 % | 25 % | fl bit 16384, `wallS` |
| Small blue-ground painted shrine panel (arched, framed, gilt figure) in the bay next to the door | 8 % | 8 % | 8 % | fl bit 32768, `wallS` (front wall only) |
| Stone voussoirs over ground-floor arches + corner quoins | 0 | 20 % | 40 % | fl bit 65536, `wallS` |
| Wooden balcony: plank deck, corbels, railing, terracotta pots with plants | (old awning/balcony kit) | 30 % | 0 | `o.balc`, lots.js |
| Red-painted base storey with a street arcade (front wall only) | 0 | 20 % | 0 | fl bit 131072, `wallS` |
Voussoirs and quoins ignore the blank-wall flag for quoins only; the shrine and garland also draw on blank rich walls.
Squares (not houses): tholos fountain GLB, honorific column (2 m pedestal + plain shaft + abacus + gilt statue, ~12.4 m), statue bases, cypress rows.

## Phase 5 changes (2026-10-23)
* Timber frame: one upper storey only, houses of <= 4 storeys only (dense lots 35 %; shader grid 10 % of mid; rich 0 %). Dense lots with more storeys are plain plaster.
* Wooden balconies carry 3-4 beam ends with diagonal brackets and a fascia board at the slab edge.
* Open loggia (arcade or colonnade): dark flat recess (part 39, ~sRGB 45/38/34) for back wall, returns and soffit; stone parapet with coping across the openings.
* The black stipple near windows was a float32 interpolation jitter of the `seed` attribute fed into `h12`; the shader now rounds `seed` to 1/4096 per fragment.

## Weathering (2026-10-27)
Implemented in `wallS` from a per-building age (hash of the seed), not from the tier, which the shader does not know:
faded and chalky paint on old houses; rising damp .5-1 m with a ragged top and a pale salt line (darker in rain);
run-off streaks under the eaves and under every window sill; plaster loss showing brick on about 40 % of plaster houses,
mostly at corners and near the ground. Doors, shutters, grilles, stone frames and shop signs will come from the trim sheet
(`briefs/rome/facade-trim-sheet.md`).

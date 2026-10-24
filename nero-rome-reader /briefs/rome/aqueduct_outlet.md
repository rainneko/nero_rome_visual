# 水渠出水端 · Aqueduct terminals (rome_castellum v2, rome_claudia_terminal)

Reference: `refs/aqueduct_outlet.jpg` (and `refs/aqueduct_castellum.jpg`). Study how the water leaves the arcade:
the channel does not just stop. The last arches step down, the channel runs into a tall brick settling tower
(round or polygonal, brick courses, a red band and a cornice near the top, small windows, a tile cone roof, a door
with a little tiled porch at its foot); beside the tower an arch carries the channel over a sunken round basin
(a cistern/fountain at ground level, curved wall with a tile coping, a curved stair going down into it, a gate)
where people draw water. Brick (opus latericium) everywhere, travertine for cornices and coping, red bands.

## In the page today
* Aqua Claudia (AD 52) arrives from the east; in AD 56 it ends at the great double gate (Porta Maggiore, page
  x 2545, z 56); everything west of that belongs to Nero's later branch (Arcus Neroniani, after AD 64), which ends in
  `rome_castellum` on the Caelian/Palatine side (monuments.js, aqueduct section).
* So two terminals: the **Claudia terminus by the gate** (distribution castellum, Spes Vetus) and **Nero's branch
  terminus** (rome_castellum).

## Assets (z = 0 = ground at the tower; the channel arrives along −X at the height given)
* **rome_claudia_terminal**: channel arriving at z 11.6 on the last two arches stepping down to the tower; a
  polygonal brick settling tower ~7 m across, 16 m high, tile cone roof, red band + cornice, small windows, door with a
  porch; from the tower three lead pipes (bronze) running down into a distribution house (a small brick block with
  three outlet spouts into three basins: public fountain, baths, private houses — Frontinus' three-way division);
  a sunken round public basin 8 m across with a curved stair down and a coping; paving round it. Budget ≤ 9 000.
* **rome_castellum v2**: rebuild the existing rome_castellum to the same logic and look (keep its footprint, its
  channel height 18 m and its position conventions — read tools/models/rome/rome_castellum.py first), adding the
  sunken round basin with the curved stair, the brick courses, red band and cone roof. Budget ≤ 9 000.
`finish(name, front='-Y')`; render three-quarter, front and a close-up of the basin.

# 梵蒂冈：静室所在的行宫 · The garden villa by Nero's private theatre (rome_nero_theatre, round 2)

The author (2026-11-02): "尼禄的梵蒂冈跑马场的展览室也有点简陋……原因应该是旁边是几个建筑，然后有这个房间，应该是作为行宫
（大概没这么大）旁边的房间". Now the treasure room (静室) is a lone 8 × 8 m red box at the far end of the colonnade, in an
empty meadow. It should be **one room of a small imperial garden villa (行宫)**: a few buildings together, the room
among them, smaller than now. A garden villa, not a palace.

## From the book (quoted exactly; do not change)
* 第26章："他却一把攥住我的手腕，不由分说地拉着我往跑马场侧面那座刚落成的私人剧场回廊里拽"
* 第26章："回廊深处的一间静室里，四面点着熏香，正中央的紫丝绒底座上，端端正正地托着一只只有巴掌大的浅口小酒杯。"

## History 【史】
* The circus stood in the Gardens of Agrippina (Horti Agrippinae) on the Vatican plain; the gardens had a villa near
  the river. Nero rehearsed in a private theatre there (Pliny). A suburban garden villa of the time: one-storey ranges
  round a peristyle, a dining room opening on the garden, a small bath, pergolas, fountains, low garden walls.
* Murrhine cups were treasures (Pliny, NH 37.18–20): a small closed room for one cup is right.

## What to change in `tools/models/rome/rome_nero_theatre.py`
* Keep the theatre (cavea, orchestra, stage) and the colonnade with its statues, euripus and fountains as they are.
* The **treasure room** becomes smaller: about **5 × 5 m, 4.5 m high**, still open toward the colonnade between two
  columns (so it can be seen from the colonnade: the book's "回廊深处"), same furnishings scaled down (purple pedestal,
  gold dish, tiny pale cup, four incense tripods, porphyry dado, red panels). It is now the last room of a villa wing
  that closes the east end of the colonnade, not a free-standing box.
* Around it, the **villa** (east of the colonnade's end and on the side away from the track, i.e. +X and +Y):
  * a peristyle house about 28 × 22 m: one-storey ranges (rooms behind a columned walk) round a garden court with
    a basin; one taller two-storey block with a loggia; red/ochre plaster walls with a white base, tile roofs;
  * a dining pavilion (triclinium) opening on the garden, with a pergola in front;
  * a small bath block (a vaulted or domed roof, a chimney/furnace side);
  * a gate building toward the approach road, low garden walls with a few cypresses and box hedges, gravel walks,
    a fountain, a few statues on pedestals;
  * all of it modest: the whole villa fits in about 60 × 50 m.
* Nothing goes toward the track: keep everything at **y ≥ −12** (the colonnade's open side is at y −9, the track is
  beyond it on −Y). The villa may reach **x ≤ 150** and **y ≤ +45**.
* Budget for the whole asset **≤ 70 000 triangles** (now about 40 000).

## Renders
* `finish('rome_nero_theatre', front='-Y', extra_cams=[...])`: keep the existing treasure close-ups (move their
  cameras to the new room), add an aerial of the villa from +X+Y at about 35°, and one from the colonnade looking
  east into the villa. Look at all of them.

## Checklist
- [ ] Theatre and colonnade unchanged
- [ ] Treasure room ≈ 5 × 5 × 4.5 m, open to the colonnade, furnishings as in the book
- [ ] The room is part of a villa wing; peristyle house, dining pavilion with pergola, small bath, gate, garden walls
- [ ] Modest garden villa, not a palace (≈ 60 × 50 m); warm plaster and tile
- [ ] Nothing at y < −12; ≤ 70 000 triangles

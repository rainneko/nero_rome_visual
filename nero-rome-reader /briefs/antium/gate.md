# 城门 · 城墙塔 · 悬崖工坊 — gatehouse (ant_gate), wall tower (ant_walltower), cliff workshop (ant_workshop)

## ant_gate — the gatehouse at the land neck
Zone: where the headland joins the mainland; the only way in by land. The German guard barracks stand just inside.
References: ref1 bottom left (square towers on the outer wall), ref2 bottom (gate in the outer wall, red coping).

From the book (quote exactly): "调两百个最好的日耳曼人去安齐奥，修铁门，设两道哨卡。"

Shape and size (front = +X, the outside facing the mainland; the passage runs along X):
* Gate block 16 m (y) × 12 m (x) × 12 m high, one main arch 5 m wide × 8 m high through it (use `gate_block` or your
  own), an IRON grille gate in the outer face of the arch (vertical `iron` bars 0.08 m every 0.25 m + 3 cross bars),
  raised two-thirds so the passage stays readable.
* Above the arch on the outer face: an upper gallery of 5 small arched windows; an attic with a marble inscription panel;
  merlons (crenels) along the top.
* Two square towers 10 × 10 m, 20 m high, attached to the north and south sides of the gate block; slit windows,
  a red band, a cornice, pyramid tiled roofs.
* A curtain-wall stub from each tower outward (±Y): 8 m long, 7 m high, 2.4 m thick, crenellated, red tile coping.
* Total width ≈ 52 m. Foundation down to z = −8. Budget ≤ 10 000 triangles.

Checklist:
- [ ] Passage open through the gate (you can see through the arch), iron grille visible
- [ ] Two towers taller than the gate block, pyramid roofs
- [ ] Crenels, inscription panel, wall stubs
- [ ] ≤ 10k triangles

## ant_walltower — the tower module for the curtain walls along the cliffs
* 8 × 8 m, 14 m high, slit windows, red band, cornice, pyramid tiled roof; foundation down to z = −20 (it stands on
  uneven cliff tops). Budget ≤ 2 500 triangles. Front any.

## ant_workshop — 悬崖工坊, the cliff workshop (protagonist's works)
Zone: a lower terrace on the south cliff above the harbour, inside the outer wall. Behind it the lead chamber and the
vine pergola (the scene adds those); below the cliff the water wheel (the scene adds it).

From the book (quote exactly):
* "悬崖上的工坊已经完全变了样。几十个精心挑过的奴隶和希腊工匠满手黑灰"
* "它在工坊深处整整轰鸣了两个星期" (the water-driven boring mill deep inside)
* "那天夜里散工后，我没回房间，一个人坐在工坊大门外的石台阶上吹海风。"

Shape and size (front = +X, the main door):
* Main hall 36 m (x) × 15 m (y), one tall storey, eaves at 8 m, floor raised 1 m on a plinth.
  Rough `stone`/`tuff` walls, `brick` quoins and brick arch heads. High windows (clerestory) along both long sides.
* A big arched doorway 4.5 m × 5.5 m in the middle of the +X end, and in front of it a broad flight of 5 stone steps
  (8 m wide) — the "石台阶".
* Gabled tiled roof (ridge along x) with a raised ventilation lantern along the ridge (a smaller gable, 16 m long).
* Two tall `brick` furnace chimneys (2.2 × 2.2 m, up to 18 m) at the −X end.
* A lower annex on the −Y side (12 × 8 m, 5 m high, lean-to roof) = the mill room where the water-driven shaft comes in
  (closed block, a big shuttered window in `wood`).
* A timber yard by the door: a few stacks of beams (`wood`) and a pile of squared stone blocks.
* Foundation down to z = −6. Budget ≤ 10 000 triangles.

Checklist:
- [ ] Reads as a working hall, not a house: big door, steps, chimneys, ventilation lantern
- [ ] Brick quoins and arch heads, high windows
- [ ] ≤ 10k triangles

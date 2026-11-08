# 剧场舞台楼与正门 · Stage building, stage and main entrances of the Roman theatres (rome_theatre_scaena)

The author (2026-11-03): "看一下参考图里面的剧场 剧场似乎有正门，还有舞台。你都可以继续精修一下。"
In the page the three stone theatres (Pompey, Marcellus, Balbus) have a good procedural cavea (seats and three
arcaded storeys) but the stage building is a plain box with a gable roof: no main entrance, a thin stage.
One model replaces the stage building of all three (the page scales it to each theatre).

References: `罗马风格参考/剧场参考/4791792538207_.pic_hd.jpg` (back of the stage building: a round columned porch
in the middle, two pedimented wings with arched doors and stairs, lions, hip roofs) and `4901792538236_.pic_hd.jpg`
(the stage seen from the cavea: wooden stage floor, a two-storey scaenae frons of coloured columns on projecting
pedestals, red curtains, statues on the roof line). Copied as `refs/theatre_back.jpg`, `refs/theatre_stage.jpg`.
Nero's private theatre (`tools/models/rome/rome_nero_theatre.py`) is a small sibling: same conventions.

【史】 Roman theatres of the period: the stage (pulpitum, about 1.5 m high, wooden floor) has a front wall
(proscaenium) with alternating rectangular and curved niches and small stairs to the orchestra; behind it the
scaenae frons, two or three storeys of columns on projecting pedestals, with three doors (the central royal door
in a curved recess, two guest doors); the side wings (versurae) have doors too; a sloping wooden roof over the
stage. The curtain (aulaeum) dropped into a slot in the stage floor at the front. The main entrances to the
orchestra are the vaulted side passages (aditus maximi) between the ends of the cavea and the stage building, with
boxes (tribunalia) for the magistrates above them. Behind the stage building lay the porticus; its back facade
had doors into it. No glass, no blue cloth (purple or red), nothing later than Nero.

## Frame and sizes (model at the size of the Theatre of Marcellus: cavea radius R = 62, height h = 32)
* Origin = centre of the orchestra, z = 0 = orchestra floor. The **cavea lies toward +Y** (not modelled — the page
  draws it: a half ring from r 18.6 to r 62, its two straight end walls on the line y = 0, outer arcades up to
  z 32). **The stage building lies toward −Y**; its back facade (the main entrance) faces −Y.
* Stage (pulpitum): x ±41, front at y +6.8, back at y −3, top z 1.6. Proscaenium front wall with niches, 2 small
  stairs to the orchestra, aulaeum slot (a dark strip 0.4 m wide along the front).
* Scaenae frons on the line y −3, x ±43: two storeys of columns (lower 8.6 m, upper 6.7 m) on projecting pedestals
  with entablatures, the central door in a curved recess (5 m wide) and two side doors; statues in the
  intercolumniations of the upper storey; red/purple curtains hanging in the doors. Stage roof: a sloping coffered
  wooden roof over the stage, x ±44, from z 21 at y −3 down to z 19 at y +6.6, carried on the scaenae frons.
* Stage building (scaena): x ±58, y −3 … −15, walls to z 28, hip or gable tile roof above. Versurae: the two
  ends (x ±43 … ±58) project toward the cavea as side wings with a door each onto the stage.
* **Aditus maximi (main side entrances):** the gap between the cavea's straight ends (y 0) and the stage building
  (y −3) is a vaulted passage at each side, x ±41 … ±62. At its outer end (x ±62) a monumental gateway: an arch
  4 m wide × 7 m high framed by pilasters and a small pediment, flush with the cavea's outer arcade line. Above
  each passage a tribunal box at z ≈ 9 facing the orchestra (balustrade, two columns, small roof).
* **Back facade (y −15), the main entrance:** three storeys of arcades/pilasters to z 28; in the middle a
  projecting porch (y −15 … −24) — a half-round colonnade of 8 red columns on a stepped podium with a conical
  tile roof (as in the reference) in front of a big double door; on both sides, at x ±30, a pedimented wing with
  three arched doors and a flight of steps; statues of lions or Muses at the porch steps.
* Everything must stay inside x ±63, y +7 … −25. Budget ≤ 30 000 triangles.
* The page scales the model by R/62 across and by h/32 in height for the other theatres (Pompey R 78 h 30,
  Balbus R 44 h 22), so keep details legible at 0.7 × and not grotesque at 1.26 × 0.94.

Materials from the kit (`rk.py` palette): travertine/marble walls, red columns and panels, tile roofs, wood stage,
red curtains, gold/bronze statues, dark door recesses. Export `assets/models/rome/rome_theatre_scaena.glb`, render
the four preview cameras to `renders/rome_theatre_scaena/` plus one view from the cavea side (from +Y, high) and one
of the back facade (from −Y). In the previews, a stand-in half ring (preview only, not exported) for the cavea helps
check the aditus.

## Checklist
- [ ] Frame: orchestra at origin, cavea +Y, stage building −Y; all inside x ±63, y +7 … −25
- [ ] Stage: pulpitum with niched front, stairs, curtain slot; wooden floor
- [ ] Scaenae frons: two column storeys on pedestals, three doors (central in a curved recess), statues, curtains
- [ ] Sloping stage roof; versurae with doors
- [ ] Aditus maximi with monumental gateways at x ±62 and tribunal boxes above
- [ ] Back facade: central half-round columned porch + two pedimented wings with doors and steps
- [ ] ≤ 30 000 triangles; nothing post-Nero

# 尼禄的地下长廊 · 第 1 步 · 截图（2026-11-21, review round 2 on 11-22）

Branch `claude/crypto-interior`, built on origin/main 775b50b. Headless Chrome (Metal), 1280×720. All `in-*` pictures are from the round-2 build; in-01, in-02, in-03, in-05 and in-11 were shot again on 11-22 after the supervisor's finish, on origin/main with PR 48-57: soft skylight instead of sun patches and shafts (the windows face north-north-east and east), lamps that reach further at night, ramp walls in strips so the dado follows the floor, the figures' keep-out hook moved to `fp-people.js`. in-12 and in-13 still show the round-2 light.

## Inside (`in-*`), first person, page without `?test` (shadows and paint filter on)

| File | What it shows |
|---|---|
| in-01-inside-east-run-looking-east-midday | East run from its west part, midday (tod .38). Stucco vault in shallow coffers, lit window embrasures along the north wall, a soft pool of skylight on the floor below each, Pompeian-red dado |
| in-02-inside-east-run-looking-east-night | The same camera at night (tod .98). Niche oil lamps; faint cool sky in the lattices; no sunlight |
| in-03-lane-crossing-from-inside-west | Ramp up (12 %, 6 m) to the lane crossing; the lane beyond is outdoors |
| in-04-lane-crossing-from-lane-south | The lane through the old arch, from the south; unchanged |
| in-05-inside-north-run-looking-north-midday | North run (P1→P2), looking north. Windows on its east wall (right), lamps on the west wall |
| in-06-west-door-from-outside | West door at (71.0, 212.2) from the lane outside |
| in-07-east-door-from-outside | East door at (151.0, 215.6) from outside, looking into corner room P3 |
| in-08-west-end-closed-door | West end wall (room P1): blocked arched doorway toward the Tiberiana (opened in step 2) |
| in-09-east-end-closed-door | East end wall (room P3): blocked arched doorway toward the East palace (opened in step 3) |
| in-10-west-end-closed-door-night | in-08 at night |
| in-11-inside-east-run-looking-west-midday | East run from its middle, looking west, midday |
| in-12-window-close-midday | One window close up: splayed embrasure, lattice, the reveal lit toward the glass |
| in-13-window-close-night | The same window at night |

## Outside before/after, orbit cameras (`ext-*`), `?test`, same camera on both builds

`-before` is origin/main 775b50b and `-after` is this branch. `-pair-diff` shows before | after | difference side by side; white marks pixels whose difference is above 12/255.

| Camera | Changed pixels (of 921 600) | Notes |
|---|---|---|
| 1 saddle, looking north at the gallery | 2 360 | tree sway, edge flicker |
| 2 below the north slope, looking up | 8 514 | tree sway; trees hide the north wall's foot |
| 3 west end | 151 | the gallery takes up little of this frame |
| 4 east end, from the north-east | 6 766 | tree sway, edge pixels on the walkway parapet |

These pairs were shot in round 1. Round 2 changes only the inside (which is hidden when not in first person), one face inside the P3 block, and the figures and grass.

## Outside before/after at eye level (`eye-*`), first person, `?test`

| Camera | Changed pixels | Notes |
|---|---|---|
| a1 south face by the west door, from the lane | 28 010 | only inside the door opening (it is now a real door) |
| a2 the same, closer, looking down at the wall foot | 97 628 | only inside the door opening; the foot is under the deck here |
| b1 north-west end, from the low ground at the Tiberiana's north side | 492 | edge pixels |

The west face of the north run cannot be seen at eye level from anywhere you can walk: west of it the ground is the Tiberiana's terraces, 53–56 m high, so the lowered foot (50.3–51.02 m) is buried there. b1 is the nearest place you can stand.

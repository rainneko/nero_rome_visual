# 尤利亚巴西利卡 · Basilica Julia (rome_basilica_julia)

Site: the south side of the Forum Romanum, between the Temple of Castor and the Temple of Saturn; the long north side
faces the Forum. Asset front = −Y (the Forum side; the page rotates it).
References: `forum_plan_LATE.jpg` (only its plan of the Basilica Julia: many piers in rows — the rest of that map is
later than our date), `temple_checker_plaza.jpg` (marble colours).

## History 【史】
* Begun by Caesar in 54 BC, finished and rebuilt by Augustus (dedicated AD 12): about 101 × 49 m, a central hall
  about 82 × 18 m surrounded by double aisles, two storeys of arcades outside with engaged Tuscan columns on the piers,
  a flight of steps along the Forum side. The Centumviral court sat here; people scratched game boards on its steps.

## Shape and size (101 × 49 m; origin = centre; z = 0 = floor of the basilica)
* Steps along the front (−Y side) and the two short sides: 7 steps from z −1.3 up to 0 (`stairs` or solid blocks).
* Outer arcade, two storeys: 18 bays on the long sides, 8 on the short sides, each storey 8 m high (`arcade`,
  'marble', open arches with 'travertine' imposts), with engaged Tuscan half-columns on the piers (`column` order
  'tuscan', r 0.5). A cornice between the storeys; a balustrade on top of the second storey.
* Behind the outer arcade two aisles (open halls, ceilings at 8 m and 16 m) — you only need the roofs: tiled lean roofs
  from the nave walls down to the outer arcade top.
* Nave: walls rising to 24 m over the central 82 × 18 m with arched clerestory windows (`opening_skin` with 'arch'
  openings, 'plaster'), a gable roof along X (tile).
* On the back (+Y) long side, instead of the open arcade on the ground floor: a row of shops (`taberna_front`) facing
  the street behind (the Vicus Tuscus side).
* Budget ≤ 45 000 triangles. `finish('rome_basilica_julia', front='-Y')`.

## Checklist
- [ ] Two-storey marble arcade all round with half-columns, steps along the Forum side
- [ ] Raised nave with clerestory windows and gable roof; lean roofs over the aisles
- [ ] Shops on the back; ≤ 45k triangles

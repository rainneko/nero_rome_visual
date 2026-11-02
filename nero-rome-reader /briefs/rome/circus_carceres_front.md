# 大竞技场起跑门的城市一面 · The street front of the Circus Maximus carceres (rome_circus_carceres, round 2)

The author (2026-11-02): "参考跑马场里的大跑马场，尤其是正面，进一步精修大跑马场的正面模型，现在的正面模型还是太简陋了".
The arena side (−Y: the twelve stalls, the central gate, the herms, the curved row) is fine: keep it. What the city sees
is the **back (+Y) side**, which is now a plain travertine wall with one arch per side and a plain gate block with one
arch, and the two plain end towers. Rebuild that side as a monumental street front.

## References (game screenshots: take the composition and richness, not the exact building)
* `/Users/Rainy/PycharmProjects/nero_rome_reader/罗马风格参考/跑马场/大跑马场/QQ_1792474637003.png` — the best one:
  the starting-gate end seen from outside.
* `/Users/Rainy/PycharmProjects/nero_rome_reader/罗马风格参考/跑马场/大跑马场/4781792538194_.pic_hd.jpg` — closer, same end.
* `/Users/Rainy/PycharmProjects/nero_rome_reader/罗马风格参考/跑马场/大跑马场/QQ_1792474514609.png` — a corner at street level.
* The current model from outside: `renders/rome_circus_carceres/` after your first run, and the scene shots the lead
  sends.

What the references show, from the street up:
1. A **stepped platform** in front of the whole front: two or three broad steps up to a paved terrace (large square
   panels of a warm stone, marble borders), the terrace about 6–8 m deep.
2. In the middle, a **triumphal-arch block** (Porta Pompae): one big arch (or three: a big one and two small) between
   engaged columns on tall pedestals, round medallions and relief panels in the spandrels and attic, a heavy cornice,
   and a **gilded quadriga** on top. Two narrower **gate towers** flank it, each with its own arch, pilasters, a
   cornice, a bronze chariot group or statue on top.
3. Above and behind the centre, the **magistrate's loggia** seen from outside: an open colonnade (4–6 columns) under
   a big **pedimented tile roof**, with two smaller pedimented roofs at its sides. This is what makes the centre read
   from far away; the present model has nothing above the gate block's flat attic.
4. **Wings** to both sides, two storeys: below, an arcade of arches on piers with engaged half-columns (red-plastered
   piers and spandrels, marble columns, dark openings behind; some arches with red cloth hangings); above, a band of
   **painted relief panels with racing chariots and horsemen** (red ground, gold/ochre figures: simple raised shapes
   are enough), framed by marble cornices; on top a terrace with a **lattice balustrade** (`lattice_rail`), statues,
   and torch tripods.
5. **End towers**: taller blocks with arched windows in two storeys, cornices, tile hip or pyramid roofs, and on the
   street side a **pedimented porch on four columns** (prostyle, steps up to it) — as at both ends of the reference.
6. Colour: white marble and travertine structure, red plaster panels, gold bronze, orange tile roofs. Rich, warm, not grey.

## History 【史】 (keep it within AD 54–58)
* Claudius rebuilt the carceres in marble (Suetonius, Claudius 21). The outer front is not known in detail: an arch
  front with a central gate and towers is a reconstruction. Nothing Flavian (no Arch of Titus: that is at the curved
  east end and dates from AD 81).

## Size, frame, budget
* Same frame and origin as now: width along X (x −84..84), arena side −Y untouched (`front_y`), z = 0 = arena level.
  The street outside is at about the same level.
* The new front may reach out to **y = +22** at most (block back face now about y +8, then the terrace and steps).
* End towers stay at x = ±76 (16 × 16 m); they may grow to 28 m and get the porch on their +Y side.
* Budget **≤ 90 000 triangles** (now about 40 000). One copy in the scene, seen from up close and from far.

## Script and renders
* Edit `tools/models/rome/rome_circus_carceres.py` (and `rome_circus_carceres_gate.py` if the gate block lives there).
  `finish('rome_circus_carceres', front='-Y', extra_cams=[...])` with at least these extra cameras: the street front
  from +Y at about 30° elevation (`('street', Vector((0, 1, 0)), 30)`), a three-quarter from +X+Y, and a low view at
  about 8° from +Y. Look at all of them.

## Checklist
- [ ] Arena side unchanged (stalls, herms, curved row, central gate seen from the arena)
- [ ] Stepped platform and paved terrace along the street front
- [ ] Central arch block with engaged columns, attic reliefs and a gilded quadriga
- [ ] Two flanking gate towers with arches and statue groups
- [ ] Magistrate's loggia with a big pedimented tile roof readable from outside, two small side pediments
- [ ] Two-storey wings: arcade below, red chariot-relief band above, balustraded terrace with statues and torches
- [ ] End towers with arched windows, roofs and a four-column pedimented porch on the street side
- [ ] Warm colours (marble, red, gold, tile), nothing grey and flat; ≤ 90 000 triangles; footprint y ≤ +22

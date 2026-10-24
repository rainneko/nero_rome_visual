# 圆亭泉亭 · Tholos fountain pavilion (rome_tholos_fountain)

A small round fountain house for the city squares (see `refs/tholos_fountain.jpg`, cropped from
`refs/city_street_square.jpg`; low resolution, so read the shapes, not the pixels).

## What the reference shows
* An **octagonal arcaded pavilion**, about 7 m across the flats and 7.5 m to the top of the roof.
* **Eight piers with flat pilasters** on the outer faces carry **eight round arches** (one per face), all open.
* A plain **entablature** runs round above the arches, with a projecting cornice.
* A **low conical/domical roof of red-brown tiles**, ribbed (tile rows running from eaves to top), ending in a **small round
  oculus ring/lantern curb** at the top.
* A **tiered fountain in the middle**: a round basin on the floor, a stem, a smaller bowl, then a top finial, with water.
  The stone is a light warm grey travertine. Two or three blue/teal glazed pots stand nearby, a touch of colour.
* A low **stepped plinth** (two steps) under the whole pavilion.

## Spec
* Units are metres, Z up (Blender) or Y up (three.js). Origin at the centre of the plinth's bottom; the front is −Y.
* Footprint about 8 × 8 m including the plinth. Total height 7.5 m.
* Triangle budget: **≤ 4 000**.
* Colours:
  * travertine #cfc6b4;
  * shadowed stone #a89d8a;
  * roof tile #a5543a;
  * water #4f8fa6;
  * pot glaze #2f7f86.
* Material names (the page maps materials by name): `travertine`, `stone`, `roof_tile`, `water`, `glaze`.

## Checklist
- [ ] Octagon of 8 piers + 8 open arches; pilasters on the outer faces
- [ ] Entablature and cornice; ribbed tile roof with an oculus ring
- [ ] Tiered fountain (floor basin, stem, bowl, finial) with water surfaces
- [ ] Two-step plinth; the base sits flat at z = 0
- [ ] ≤ 4 000 tris; renders three/front/top

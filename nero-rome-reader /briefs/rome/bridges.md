# 台伯河上的桥 · The Tiber bridges of AD 56 (six GLB assets)

Six bridges, one script and one GLB each, built with the Rome kit (`tools/models/rome/rk.py`). They replace the
procedural stand-ins of `bridgeAt` in `src/scenes/rome/monuments.js`. The novel does not describe the bridges, so they
follow the history below. Nothing later than Nero: no Pons Aelius (Hadrian, AD 134), no medieval houses or towers on the
bridges, no Renaissance balustrades.

## History (research, 2026-11-14)
Bridges of the city in AD 56, upstream to downstream (the Pons Mulvius lies 3 km north, off the map):
* **Pons Neronianus** (also called Triumphalis). It joined the Campus Martius to the Vatican plain, which held
  Agrippina's gardens and the circus of Gaius and Nero. Its piers survive in the riverbed by the Ponte Vittorio Emanuele II.
  It is dated to Gaius or Nero; the date is uncertain. Brick-faced concrete with travertine arch rings, the imperial manner.
* **Pons Agrippae**: Agrippa's bridge, just upstream of the Ponte Sisto. Remains were found in 1878–1887. A boundary stone
  of the curators of the banks under Claudius names it (CIL VI 31545). Plain travertine and tuff.
* **Pons Fabricius**, 62 BC, built by the curator of roads L. Fabricius (Dio 37.45). It runs from the Campus Martius to
  the island. Two large arches of about 24.5 m with a small flood arch in the central pier; 62 m long, about 5.5 m wide.
  The builder's inscription is cut over the arches on both faces, and a restoration of 21 BC is recorded beside it.
  The deck has a marked ridge. Tuff and peperino core, travertine arch rings. It still stands.
* **Pons Cestius**: from the island to Trastevere, middle of the 1st century BC. Before its rebuilding in AD 365–370 it had
  one large central arch of about 23.7 m and a small arch on each side; about 48 m long and 8 m wide.
* **Pons Aemilius**: the first stone bridge. The piers date from 179 BC (Livy 40.51.4) and the arches from 142 BC.
  Six or seven arches, with flood openings in the piers (its one surviving arch is the Ponte Rotto).
* **Pons Sublicius**: the oldest bridge, attributed to Ancus Marcius (Livy 1.33.6). It was built of wood without any iron,
  for religious reasons (Pliny, *Natural History* 36.100; Dionysius 3.45), and the pontifices kept it in repair.
  Horatius Cocles held it against Porsenna (Livy 2.10). It stood just downstream of the Pons Aemilius, below the Forum Boarium.

Roman river-bridge features to show:
* Arch rings of travertine voussoirs.
* Spandrels of tuff ashlar, or of brick for the imperial bridge.
* Piers with a pointed cutwater upstream and a rounded one downstream, rising to a little above the water.
* Small round-headed flood openings through the piers (Fabricius, Aemilius).
* A string course under the parapet; a solid stone parapet with a travertine coping.
* A paved roadway (basalt) with a raised footway each side.
* Square bridgehead posts at the four corners.

## Common rules for all six
* **Axes**: the deck runs along X, from x = −L/2 to +L/2; the width is along Y. **Upstream is +Y**, so the pointed
  cutwaters point to +Y and the rounded ones to −Y. `finish(name, front='-Y')`.
* **z = 0 is the deck surface at both ends** (x = ±L/2). The deck profile of each bridge is given below. z_w is the river's
  water level, for reference only; do NOT model water. Call `preview_ground(z_w)` so the renders show the piers.
* **Riverbed** z_b = z_w − 5.5. Piers stand on it, and their footings go down to z_b − 1.
* **Abutments** (the solid ends, over the banks) are solid masonry, battered about 1:10, down to z = −9. They are as wide
  as the deck plus 0.6 each side. At each end, a square post 1.4 × 1.4 m stands at both corners, 2.2 m above the deck,
  with a travertine cap. No wing walls past x = ±L/2: the page's road meets the deck end there.
* **Segmental arch**: the intrados is the circular arc through (x_c ± s/2, z_s) and (x_c, z_s + f), where s is the clear
  span, z_s the springing and f the rise. Below the springing the pier faces are vertical. The arch soffit is a barrel
  vault through the full width. Build the ring (thickness t_r) as 15–25 separate travertine voussoir blocks per face,
  with gaps of 3–4 cm so the joints read.
* **Spandrels and fill**: solid masonry from the arch rings up to the deck, in tuff (Neronianus: brick).
* **String course**: travertine, 0.4 m high, projecting 0.25 m, 0.6 m under the deck line, following the deck profile.
* **Parapet**: solid stone, 1.05 m above the deck, 0.45 m thick, with a travertine coping 0.15 m high projecting 0.05 m.
  It follows the deck profile on both sides.
* **Deck**: a basalt roadway; a travertine footway 1.1 m wide and 0.2 m high inside each parapet.
* **Cutwaters**: from the riverbed up to z_w + 2.5, capped by a sloped stone top (half-pyramid or quarter-cone) that meets
  the pier face.
* Materials only from the kit palette: travertine, tuff, peperino, brick, stone, basalt, wood, gravel, dark.
* Budget ≤ 14 000 triangles (Sublicius ≤ 16 000). The ring blocks can be 6-sided boxes; no smoothing needed.
* Render the four cameras and look at every one before reporting.

## 1 · rome_pons_fabricius — two arches, ridge, flood arch
* L = 66, deck width 6.0 m between the parapets' outer faces; z_w = −5.0.
* Arches: two, clear span 22, centred at x = ±14. Springing z_s = −4.4, rise f = 5.6 (intrados crown +1.2), ring t_r = 1.0.
* Central pier x −3…+3 with cutwaters. Through it (along Y) a round-headed flood arch 2.6 m wide, sill at −1.0.
* Abutments x ±25 … ±33.
* Deck profile: z(x) = 3.4 · (1 − (x/33)²). This is the ridge; the string course and parapet follow it.
* An inscription panel on each face (±Y) above each arch crown: a raised travertine slab 7 × 1.0 m, 0.08 m proud, its
  middle at z(x) − 1.5 over x = ±14. No lettering.
* Spandrels tuff; voussoirs, string course, coping and posts travertine.
* Checklist: two big arches; flood arch in the central pier; visible ridge; panels on both faces; cutwaters pointed +Y;
  nothing floats; ≤ 14k triangles.

## 2 · rome_pons_cestius — one big arch, two small
* L = 74, width 8.0; z_w = −4.0.
* Central arch: clear span 20 centred at x = 0; z_s = −3.4, f = 5.2, t_r = 1.0.
* Piers x ±10 … ±15, with cutwaters.
* Side arches: clear span 5, x ±15 … ±20, semicircular, springing −3.0, t_r = 0.7.
* Abutments x ±20 … ±37.
* Deck profile: z(x) = 3.6 · (1 − (x/37)²).
* Spandrels tuff with peperino bands (one dark course every 1.8 m); travertine rings.
* Checklist: one dominant arch with a small arch each side; ridge; ≤ 14k.

## 3 · rome_pons_aemilius — the old stone bridge, eight arches with flood openings
* L = 196, width 9.0; z_w = −4.5.
* Eight arches: clear span 14, centred at x = −66.5 + 19k (k = 0…7); z_s = −3.8, f = 4.6, t_r = 0.9.
* Seven piers, 5 m wide, centred at 0, ±19, ±38, ±57, each with cutwaters. Through each pier a flood opening 1.6 m wide,
  round-headed, sill −1.6.
* Abutments x ±73.5 … ±98.
* Deck profile: over |x| ≤ 73.5, z = 2.3 + 0.5 · (1 − (x/73.5)²); over the abutments a straight ramp from 2.3 at
  |x| = 73.5 down to 0 at |x| = 98.
* Spandrels tuff (older, darker: use peperino for the lowest 1.5 m of the piers); travertine rings.
* Checklist: eight arches; a flood opening in every pier; ramps at both ends; ≤ 14k.

## 4 · rome_pons_agrippae — eight plain arches
* L = 192, width 9.0; z_w = −4.9.
* Eight arches: clear span 14, centres −66.5 + 19k; z_s = −4.2, f = 4.6, t_r = 0.9.
* Seven piers, 5 m, centred at 0, ±19, ±38, ±57. Cutwaters pointed on BOTH sides (±Y). No flood openings.
* Abutments x ±73.5 … ±96.
* Deck: over |x| ≤ 73.5, z = 1.9 + 0.4 · (1 − (x/73.5)²); a ramp to 0 at |x| = 96.
* All travertine and tuff; plainer than the Aemilius. Instead of the solid parapet, a parapet of travertine slabs
  (upright slabs 1.8 m long with 0.1 m gaps) gives it a different look.
* Checklist: eight arches; no pier openings; double-pointed piers; slab parapet; ≤ 14k.

## 5 · rome_pons_neronianus — the imperial bridge, seven taller arches, brick faced
* L = 172, width 10.0; z_w = −7.6.
* Seven arches: clear span 15, centres −61.5 + 20.5k (k = 0…6: 0, ±20.5, ±41, ±61.5); z_s = −7.0, f = 7.0 (near semicircular), t_r = 1.0.
* Six piers, 5.5 m, centred at ±10.25, ±30.75, ±51.25, with cutwaters.
* Abutments x ±69 … ±86.
* Deck: over |x| ≤ 69, z = 1.5 + 0.3 · (1 − (x/69)²); a ramp to 0 at |x| = 86.
* Spandrels and pier faces brick (opus latericium); travertine rings, string course, coping and posts.
  A travertine cornice runs at the springing level along each face.
* Checklist: seven round arches; brick faces; ≤ 14k.

## 6 · rome_pons_sublicius — the wooden bridge, no iron
* L = 184, width 7.0; z_w = −5.8. Everything is timber (`wood`; the weathered piles below z_w + 1 in `dark`). NO metal
  anywhere, pegged joints only: no stone piers.
* Bents every 8 m, from x = −84 to +84 (22 bents). Each bent:
  * five round piles (radius 0.22, 8 sides) across the width, from z_b − 1 up to −0.75;
  * a cap beam 0.45 × 0.5 across the top;
  * an X brace of two planks 0.1 × 0.3 between the outer piles, on both faces.
* Upstream of each bent in the water (|x| ≤ 70), a fender: three inclined piles meeting in a point at +Y, planked over,
  up to z_w + 2.
* Four longitudinal stringers 0.4 × 0.5 on the caps, deck planks across (one strip of planks is fine, the page adds the
  grain), wheel guards 0.25 high.
* Railings: posts every 2 m, 1.1 m high, with two rails.
* Abutments x ±84 … ±92: log cribwork (stacked squared logs crossing at the corners), filled; top gravel at z = 0;
  down to −6.
* Deck: z = 0.6 · (1 − (x/92)²).
* Checklist: all wood; trestle bents; fenders upstream; railings; crib abutments; ≤ 16k.

## Placement (lead session)
The page places each GLB at the bridge's midpoint, at y = the deck-end level, turned so that +X runs along the bridge
axis and +Y upstream. The deck ends sit where the bank reaches that level, and the city's roads join at x = ±L/2.

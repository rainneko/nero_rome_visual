# 植被与四季 · Vegetation and seasons (AD 56)

The author: spring, summer and autumn look almost the same. Gemini sent a long note (`../../../gemini点评植被.txt`).
Below is what the lead accepted, what was rejected, and the rules to build.

## Why the seasons look alike now (code facts)
* **Trees:** most are evergreen. The Palatine and Aventine use only `broad`, `pine` and `cyp`, and the city-wide
  planting uses `olive`, `broad`, `pine` and `cyp`. Only the outer hills (Capitol, Caelian, Esquiline, Quirinal,
  Viminal) have `broadD` (deciduous, `MAT.foliageD` tint in `builders.js`, line about 108). So autumn barely changes.
* **Grass:** the terrain grass changes little. `sDry` in `builders.js` line 7 peaks at 0.32 in summer, then autumn goes
  0.12 → −0.05. Gardens, irrigated or not, follow the same curve.
* **Flowers:** they are pink/purple shrubs (`'flower'`, colours `FC` in `monuments.js` about line 658; `palatine.js` 112/143/267).
  They show while `SEAS.v<1.8||>3.55` (`app.js` `seasonTick`), so they last from late winter to the end of summer
  in one colour family. These shrubs are the "pink-purple tree crowns" Gemini saw.

## Accepted (sound, standard knowledge)
1. **Rome is summer-dry (Mediterranean).** Unwatered grass turns straw-coloured in July–August and greens again after
   the autumn rains (October–November). It stays green in winter and is brightest in spring.
2. **Watered gardens stay green all year.** Palace gardens, domus peristyles, the Vestals' garden and the Apollo
   precinct were watered from cisterns and pipes, so they keep green in every season.
3. **Evergreen base:**
   * stone pine; cypress; holm oak (our `broad`, dark olive-green);
   * laurel, myrtle, box (low, clipped);
   * olive (grey-green).
4. **Deciduous trees bring the autumn change:**
   * the oriental plane, the luxury shade tree of rich houses and porticoes (Pliny NH 12.3–12);
   * deciduous oaks and elms on the hills;
   * poplars and willows along the Tiber;
   * fig and pomegranate in yards and gardens.
5. **Flowers peak in spring** and are sparse in summer and autumn:
   * spring: violets, irises, narcissus; roses and lilies in late spring;
   * summer: oleander (pink), pomegranate flowers (scarlet), myrtle (white);
   * autumn: a few twice-flowering roses (Virgil *Georgics* 4.119, the roses of Paestum) and crocus;
   * colour in autumn comes mainly from fruit, red pomegranates and yellow quinces.
6. **The pink trees should flower only in spring.** Make them almond trees (white–pale pink, February–March) and
   pomegranates (scarlet flowers May–July; yellow leaves and red fruit in autumn). Both are green in summer.

## Rejected or corrected
* **The exact ratios (65:35, 55:45), hex codes and page numbers.** Gemini presents them as academic results; several
  citations cannot be checked. Use the ratios below as design choices.
* **Bright maple-orange autumn.** Rome's autumn is late (November) and muted: planes go yellow-brown, oaks go
  brown, poplars go yellow, and many trees are still half green. No saturated orange.
* **Judas tree (Cercis).** Its presence in Roman gardens in AD 56 is uncertain. Use almond instead (Greek nut, well known).
* **Roman "lawns" of clover and moss.** Roman gardens were beds, clipped box, ivy, acanthus and gravel paths. Keep
  "watered garden = green"; do not invent lawns.
* **"The Palatine is watered by the Aqua Claudia."** In our world the Neronian branch is post-64. It does not matter
  here: the gardens are watered either way.
* **Ficus Ruminalis by the hut of Romulus.** It stood at the Lupercal/Comitium. Irrelevant here, but do not label it there.

## Who plants what (the author's question: do the gardens of senators, Nero and the temples differ? Yes)
| Owner | Trees | Flowers | Season behaviour |
|---|---|---|---|
| **Imperial palaces** (Tiberiana, Transitoria, House of Augustus/Livia, Apollo precinct) | Planes, laurel (two laurels at Augustus's door; laurel grove at Apollo), clipped box, cypress rows, **one date palm** at the House of Augustus (Suetonius *Aug.* 92) | Most variety and colour: roses, lilies, violets, irises; oleander by the pools in summer | Longest season. Autumn roses; **a few roses even in winter**, forced with warm water, the luxury Seneca mocks (*Ep.* 122.8). Only here |
| **Senatorial domus** (peristyles; Aventine ridge houses) | Laurel, myrtle, box hedges, a plane or a fig, pomegranate | Roses, violets, lilies, ivy and acanthus beds; oleander in summer | Spring peak; summer oleander; autumn sparse; no winter flowers |
| **Temples** | Paved precincts. Sacred trees by god rather than flower beds: laurel at Apollo, myrtle at Venus, oak at Jupiter, olive at Minerva, **pine at Magna Mater** (Attis), planes in porticoes | Almost none in beds. Garlands on doors and altars, festival states only | Trees change, beds do not exist |
| **Plebeian houses** | Fig, vine on a pergola, pomegranate | **Window boxes and pots** (Pliny NH 19.59: the urban poor's "gardens" in their windows), herbs | Pots: spring–summer colour, autumn bare |
| **Public slopes, groves, Tiber banks** | Slopes 55 % evergreen / 45 % deciduous (holm oak, pine, oak, elm). Tiber banks mostly poplar and willow | Wild spring flowers on gentle slopes (poppy red, white, yellow), spring only | Grass follows the dry cycle |

Ratios for the built city (gardens, yards, streets): about 65 % evergreen and 35 % deciduous.

## Season targets (approximate sRGB of sunlit surfaces; probe them)
| | Spring | Summer | Autumn | Winter |
|---|---|---|---|---|
| Unwatered slope grass | fresh green ≈ 105,150,60 | straw ≈ 190,170,105 (strong, clearly different) | early: still straw; by mid-autumn dark green ≈ 75,115,60 | green ≈ 80,115,65 |
| Watered garden green | ≈ 70,135,60 | same | same, slightly darker | same, darker |
| Evergreen crowns | dark green, lighter new-growth tips | darkest | dark | dark, slightly grey |
| Deciduous crowns | yellow-green ≈ 120,150,60 | green | **staggered**: a third green, a third yellow ≈ 200,165,60, a third yellow-brown ≈ 150,100,45 | bare-looking grey-brown, thinner (scale crowns down 30 % or tint) |
| Flowers (per owner, density relative to spring) | 100 %: purple, white, yellow; roses red/pink in imperial and senatorial gardens | 35 %: oleander pink, pomegranate scarlet, myrtle white | 15 %: roses only in palaces and rich houses; red and yellow fruit dots in pomegranate and quince crowns | 0, except a few forced roses in Nero's palace gardens |
| Almond and pomegranate trees | almond white-pink in early spring; pomegranate green | pomegranate scarlet flowers | pomegranate yellow leaves + red fruit | bare |

## Implementation notes (the integrator decides details)
* Add tree kinds or per-instance flags, without new geometry, unless a taller plane crown is cheap:
  * `plane`: broad crown, scale 1.3, deciduous;
  * `poplar`: cypress-like but wider and lighter, deciduous, along the Tiber;
  * `pomegr`, `almond`: small, deciduous, with a seasonal flower or fruit tint;
  * `palm`: one, at the House of Augustus, if cheap.
* Assign by zone and owner:
  * palace and domus gardens (`PAL_ASSETS` gardens, domus pads, peristyle centres);
  * temple precincts (sacred tree by deity, no flower beds);
  * plebeian lots (pots: tiny flower dots on sills or balconies, spring–summer);
  * Tiber banks (poplars);
  * hills (the existing `SP` table, now with deciduous shares).
* **Flowers:** replace the single visibility switch with a per-instance season profile: spring, summer, autumn, winter-forced.
  The vertex or instance colour picks the colour family per season. Keep the instance counts.
* **Grass:** make the dry cycle stronger on unwatered terrain and add a "watered" mask (palace and domus gardens,
  temple groves with water, the Vestals' court) that stays green. The dry cycle must not touch watered gardens or the
  green sports fields.
* **Autumn staggering:** use a per-instance hash, so deciduous trees do not all turn at once.

## Acceptance
* A 4 × 3 contact sheet: rows = spring / summer / autumn; columns = Palatine gardens (a palace garden in view),
  Aventine slope with domus, Tiber bank. Plus one winter frame of Nero's garden showing the forced roses.
  Seasons are set with `__shot(state, view, tod)`, where `tod` 1.x = spring, 2.x = summer, 3.x = autumn, 4.x = winter.
* Probe the table values on slope grass, watered garden green and a deciduous crown, and report the numbers.
* The three seasons must be clearly different at a glance:
  * summer: straw slopes with green gardens;
  * autumn: yellow-brown deciduous trees and green slopes;
  * spring: bright green with many flowers.

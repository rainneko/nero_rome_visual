# 大竞技场起跑门 · Starting gates of the Circus Maximus (rome_circus_carceres)

Site: the straight west end of the Circus Maximus. The arena is in front of it; asset front = −Y (the arena side).
Width along X. References: `circus_2.jpg`, `circus_3.jpg` (an entrance front with a central gate, towers at the corners,
statues and chariot groups on top — note those pictures show the curved end and the outside; take the style),
`circus_1.jpg`, `circus_small.jpg`.

## From the book (quoted exactly)
* "大竞技场在帕拉蒂尼山和阿文提诺山之间的山谷里。"
* "我第一次走进去的时候，在门洞里站住了。"

## History 【史】
* Twelve starting stalls (carceres) on a shallow curve, so every chariot had the same distance to the start line;
  Claudius rebuilt them in marble (Suetonius, Claud. 21). In the middle, the Porta Pompae for the opening procession,
  with the box of the presiding magistrate above it; at both ends towers (the "oppidum").

## Shape and size (168 m wide: x −84..84; 16 m deep: y −8..8; z = 0 = arena level)
* Central gate block 30 × 16 m, 22 m high: a big arch 7 m wide × 12 m high through it (`gate_block` or `arcade`), an
  attic with a gilded `quadriga` on top; over the arch on the arena side, the magistrate's box: an open loggia at
  z 12 with 4 columns, a balustrade and a small pediment.
* Twelve stalls, six on each side of the gate: arched bays 4.4 m wide × 7 m high with double gates of red-painted
  wooden lattice ('red' frame + 'wood' bars; make the lattice with thin beams), separated by marble pilasters with
  herm heads (small spheres). The row is gently curved: the outermost stalls stand 3 m further back (toward +Y) than
  the innermost.
* Above the stalls: a 5 m storey with a balustraded terrace on top and statues every 8 m.
* Towers at both ends: 16 × 16 m, 24 m tall (`square_tower`, pyramid tile roof, arched windows).
* Back (+Y) side: plain 'travertine' wall with three arched openings (entrances for the chariots).
* 'marble' front, 'travertine' back and towers.
* Budget ≤ 40 000 triangles. `finish('rome_circus_carceres', front='-Y')`.

## Checklist
- [ ] Central gate with the magistrate's loggia and a gilded quadriga
- [ ] 12 arched stalls with red lattice gates on a gentle curve
- [ ] End towers; statues on the upper terrace
- [ ] ≤ 40k triangles

## Detail emphasis — 正门 (the author asked for the main gate in detail)
The central gate (Porta Pompae) is the main gate of the Circus; budget raised to ≤ 60 000 triangles. Give it the
richness of a triumphal arch on BOTH faces (arena side and street side):
* the big arch framed by pairs of Corinthian half-columns on tall pedestals, an entablature that breaks forward over
  them, spandrels with flying Victories (flat 'gold' reliefs), a keystone; a coffered barrel vault inside the passage
  (dark ribs on 'marble'); bronze lattice gates standing open;
* an attic with an inscription panel and two relief panels, a gilded `quadriga` on top flanked by two gilded
  Victories on smaller pedestals; trophies (bronze) at the attic corners;
* the magistrate's loggia above the arch on the arena side: 4 columns, balustrade, a purple 'cloth' hanging and a
  small pediment with a gilded disc;
* on the street side, a flight of 5 steps and two statues on pedestals flanking the gate.

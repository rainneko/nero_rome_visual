# 神君尤利乌斯神庙与奥古斯都凯旋门 · Temple of Divus Julius (rome_divus_julius) and the Arch of Augustus (rome_arch_augustus)

Site: the east end of the Forum Romanum; the temple looks west down the length of the Forum. The arch stands beside
the temple, over the road between it and the Temple of Castor. Asset front = −Y for both (the page rotates them).
References: `temple_curved_stair.jpg` (podium with a niche in the middle of the stair front), `temple_checker_plaza.jpg`.

## History 【史】
* Dedicated in 29 BC on the spot where Caesar's body was burned. Hexastyle Corinthian with closely set columns
  (Vitruvius), on a high podium. The front of the podium is the Rostra ad Divi Iulii, a speaker's platform decorated
  with the bronze prows (rostra) of the ships taken at Actium; in its middle a semicircular niche with the round altar
  of Caesar. The comet of Caesar (sidus Iulium) shone in the pediment.
* The Arch of Augustus (19 BC, for the standards recovered from the Parthians): a triple arch, the central passage
  higher, with an attic carrying a gilded four-horse chariot with Augustus; the lower side passages framed by columns
  carrying small pediments, with statues of Parthians giving back the standards on top.

## rome_divus_julius (origin = centre of the podium; z = 0 = ground)
* `podium_temple(F, 0, 0, W=24, L=30, pod_h=5.5, col_h=11, nf=6, kind='prostyle', porch=2, order='corinthian',
  front='-Y', stair='sides', flutes=12)`.
* In the middle of the platform front: a half-round niche 6 m wide, 3 m deep, the full platform height (build a hollow
  half-cylinder recess: 'peperino' inside walls, a 'dark' back), with a round marble altar (lathe, r 1.2, h 1.4)
  standing in it.
* Six bronze ship rams on the platform front, three on each side of the niche: pointed beaks 2.5 m long, 0.8 m high,
  at 2.5 m above the ground ('bronze'; a tapering prism or beams).
* A gilded star in the front pediment tympanum: a 'gold' disc (r 1.1) with 8 short rays.
* Budget ≤ 30 000. `finish('rome_divus_julius', front='-Y')`.

## rome_arch_augustus (origin = centre; z = 0; passages along Y)
* Overall 17.5 m wide (x), 6 m deep (y). Central passage 5 m wide × 9 m high; attic up to 14 m; a gilded
  `quadriga(..., s=1.3, mat='gold')` on top of the attic.
* Side passages 3 m wide × 6.5 m high, each framed front and back by two Corinthian columns carrying a small pediment;
  a 'bronze' statue on each side pediment (kneeling or standing Parthians).
* 'marble' faces, 'travertine' core; inscription panel on the attic (a lighter 'marble' panel).
* Budget ≤ 15 000. `finish('rome_arch_augustus', front='-Y')`.

## Checklist
- [ ] Temple on a platform with the half-round niche and altar, bronze ship rams, side stairs, gilded star
- [ ] Triple arch: higher central passage with gilded quadriga, columned side passages with pediments and statues
- [ ] Budgets respected

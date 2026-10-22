# 卡斯托尔与波吕克斯神庙 · Temple of Castor and Pollux (rome_castor)

Site: the south side of the Forum Romanum, at the foot of the Palatine, beside the spring of Juturna. Faces the Forum;
asset front = −Y. References: `temple_curved_stair.jpg` (podium and stairs), `temple_checker_plaza.jpg`.

## History 【史】
* Vowed in 499 BC after the battle of Lake Regillus; rebuilt by Tiberius in AD 6.
* Octastyle peripteral Corinthian temple: 8 columns in front, 11 on each flank; columns about 12.5 m, fluted;
  podium about 7 m high (about 32 × 50 m).
* Small rooms inside the podium (bankers, the office that checked weights and measures) opened through doors in its
  sides. In front, a speaker's platform with lateral stairs. The Senate sometimes met here.

## Shape and size (origin = centre of the podium; z = 0 = ground)
* `podium_temple(F, 0, 0, W=30, L=46, pod_h=7, col_h=12.5, nf=8, kind='peripteral', porch=2, order='corinthian',
  front='-Y', stair='sides', flutes=12)`.
* In both long sides of the podium, a row of small doors every 4 m (1.6 × 2.4 m, 'dark' panels 0.1 proud with a
  'travertine' frame), starting 6 m from the front.
* Two bronze statues of the twins with their horses on the front platform (statue + a horse made like the quadriga
  horses, 'bronze'), one on each side of the platform.
* Budget ≤ 35 000 triangles. `finish('rome_castor', front='-Y')`.

## Checklist
- [ ] 8 × 11 fluted Corinthian columns all round on a 7 m podium
- [ ] Front speaker's platform with two side flights; small doors in the podium sides
- [ ] Dioscuri statues; ≤ 35k triangles

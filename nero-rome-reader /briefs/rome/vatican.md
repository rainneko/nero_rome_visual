# 尼禄的梵蒂冈跑马场：私人剧场回廊与展厅、皇家马厩、加高的木看台 (rome_nero_theatre, rome_vatican_stables, rome_vatican_stand)

Site: across the Tiber, on the Vatican slope outside the city: the circus of Gaius (Caligula) and Nero. The page already
draws the track (about 500 × 72 m), its low barrier and the obelisk. You build three buildings that go round it.
References: `circus_small.jpg` (a small circus with a long roofed stand and a starting building), `villa_noble.jpg`
(colonnades, statues, fountains), `theatre_1.jpg` (a theatre seen from above: half-round seats, stage building).

## From the book (quoted exactly)
* 第7章："去梵蒂冈坡。卡里古拉在那儿修了一个跑马场，全围起来了，只有我的人。"
* 第7章："跑马场不大，一条椭圆形的土道，中间一道矮石堤，堤上立着一根从埃及运来的方尖碑，很高，很细，像一根黑色的针。四周的土坡上种着一圈柏树，又高又密，把外面的声音全挡住了。"
* 第26章："跑马场外围那圈高密的柏树林外头，果然拴着他的御马。我掀开护栏走进去的时候"
* 第26章："他却一把攥住我的手腕，不由分说地拉着我往跑马场侧面那座刚落成的私人剧场回廊里拽"
* 第26章："回廊深处的一间静室里，四面点着熏香，正中央的紫丝绒底座上，端端正正地托着一只只有巴掌大的浅口小酒杯。"
* 第26章："拿去翻修梵蒂冈坡的皇家马厩与跑马场，要把四周的木看台一口气往上加高三层"

## History 【史】
* Caligula built the circus in the gardens of Agrippina and set up the obelisk from Heliopolis (25.5 m, today in
  St Peter's Square); Nero raced here. Nero also had a private theatre where he rehearsed (Pliny), and he paid a
  fortune for murrhine (fluorspar) cups (Pliny, NH 37.18–20).

## rome_nero_theatre — the private theatre with its colonnade and the treasure room (origin = centre; z = 0; front = −Y)
* A small theatre: half-round seating (cavea) of radius 22 m opening toward −Y, 12 rows of 'marble' seats rising to
  6 m, on a 'brick' curved outer wall with arches; the orchestra (semicircle r 6, 'giallo' and 'porphyry' paving);
  a stage building (scaenae frons) 30 m wide, 10 m high, two storeys of small columns ('porphyry' and 'giallo')
  framing three doors, with statues in niches, a tile roof over the stage.
* The colonnade (回廊): a portico 60 m long, 6 m deep, running from the theatre's east side toward +X: 'marble'
  Corinthian columns 5 m every 3.4 m on the open side, a solid back wall with painted panels ('red' and 'giallo'
  bands), tile lean roof. Statues between some columns, a long water channel (euripus) in front with two fountains.
* The treasure room (静室) at the far (east) end of the colonnade: a small square hall 8 × 8 m, 6 m high, whose front
  toward the colonnade is open between two columns (so the inside can be seen): inside, at the centre, a 'cloth'
  (purple) covered pedestal 1.2 m high with a tiny pale cup ('marble', a lathe bowl r 0.12 m) on it; four bronze
  incense burners (tripods with a small 'flame') in the corners; the walls 'porphyry' dado and 'red' panels; a
  pyramid tile roof. 
* `preview_ground(0)`. Budget ≤ 40 000 triangles. `finish('rome_nero_theatre', front='-Y')`.

## rome_vatican_stables — the royal stables (origin = centre; z = 0; front = −Y toward the track)
* A courtyard building 60 × 36 m: one-storey stall ranges (stone and 'wood', tile roofs) round a sand court, a
  two-storey block on the front with an arched gate, a long water trough in the court, a hay loft (open timber gable)
  on one range; hitching posts outside the gate. Budget ≤ 15 000. `finish('rome_vatican_stables', front='-Y')`.

## rome_vatican_stand — one straight module of the raised wooden stands (after AD 57: three tiers added)
* 30 m long (x −15..15), 16 m deep (y −8..8); arena side = −Y. A low 'stone' podium wall 2 m with a wooden fence
  (护栏) on top; then three tiers of wooden benches ('wood') on a visible timber frame (posts, beams, diagonal braces)
  rising to 11 m; a plank walkway between tiers; a simple tile lean roof on posts over the top tier; open timber back
  (you see the frame from behind). Budget ≤ 8 000 (the page repeats it many times).
  `finish('rome_vatican_stand', front='-Y')`.

## Checklist
- [ ] Private theatre with coloured stage front; the colonnade with statues and a water channel
- [ ] Treasure room open toward the colonnade: purple pedestal, tiny cup, incense tripods
- [ ] Stables courtyard; raised wooden stand module with three tiers on a visible timber frame
- [ ] Budgets respected; nothing later than AD 58

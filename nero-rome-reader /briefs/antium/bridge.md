# 大理石窄桥 + 侧殿 · The narrow marble bridge (ant_bridge) and the side hall (ant_sidehall)

Zone: north of the upper palace, across a deep chasm, a rock with cliffs on three sides carries the side hall that
Nero gave to the narrator (his quarters and the dark room). The only way in is the bridge.
References: ref4 (the single-arch bridge over the chasm, gatehouse at one end), ref5 (bridge close-up, statues on the
bridgeheads, gatehouse with a tiled roof). The references show railings — the book says NO railings: follow the book.

## From the book (quote exactly)
* "安齐奥靠悬崖那一整座侧殿，给你。三面绝壁，只有一座窄桥连着主宫。桥头装一道铁门，再放二十个日耳曼人。"
* "侧殿归我。从主宫过去，要走一座只容两人并行的大理石窄桥。桥头有铁门，门后站着日耳曼人，二十个，轮班，从不说话。"
* "大理石窄桥两侧没有栏杆，下面是几十丈深的黑礁石。"
* "侧殿最里面那间屋子，窗户全用黑羊毛毡钉死了。白天进去，也要点灯。"
* "我把侧殿长廊上的油灯全熄了，只留暗室里那一盏。"

## ant_bridge — IMPORTANT: z = 0 is SEA LEVEL for this asset
* Deck along X from x = −38 to x = +38 (76 m), deck top at z = 50, deck width 2.7 m. NO railings, NO parapets —
  only a thin marble kerb 0.12 m high along each edge.
* One semicircular arch: clear span 48 m, springing at x = ±24, z = 20; crown of the intrados at z = 44.
  Arch ring (voussoirs) 1.8 m deep and 3.4 m wide, built as ~40 separate voussoir blocks alternating `marble` and
  `stone` so they read clearly.
* Spandrel walls of ashlar (`stone`) from the arch up to the deck, 3 m thick; a marble cornice band under the deck edge.
* Abutments x = ±24 … ±38: solid masonry, battered — 3.4 m wide at the deck, 7 m at the base — down to z = −3.
* Main-palace end (+X): a small gatehouse 8 m (x) × 7.5 m (y), floor at z = 50, 7.5 m to the eaves, on a masonry block
  down to z = −3 (it stands on a cliff ledge). An arched passage 2.8 m wide on the bridge axis with a closed IRON gate
  in it (two leaves of vertical `iron` bars), a tiled gable roof (ridge along x), a stone guard bench inside.
  The gatehouse spans x = +38 … +46.
* Two statues on pedestals at each bridgehead, beside the deck ends (four in all), never on the deck itself.
* Front = +X. Budget ≤ 10 000 triangles.

Checklist:
- [ ] Deck 2.7 m wide at z = 50, no railings
- [ ] One clean semicircular arch, voussoirs visible, solid spandrels
- [ ] Gatehouse with a closed iron gate on the +X end, tiled roof
- [ ] Battered abutments reach down to the sea
- [ ] ≤ 10k triangles

## ant_sidehall — 侧殿 on the rock (z = 0 = its ground floor)
* Main block 34 m (x) × 15 m (y), two storeys (5.2 + 4.4 m), white plaster, red band, hipped tiled roof with ribs.
* Along the −Y long side (it faces the bridge and the main palace): a ground-floor gallery (长廊) 4 m deep —
  12 Tuscan columns and a lean-to tiled roof; small `bronze` lamp brackets on the wall between the doors.
* The west end (−X), last 9 m, both floors = the dark room: ALL its windows are black felt panels — use the
  `felt` material (inner='felt' / felt=True in the kit) and add thin `wood` battens across each panel so they read
  as nailed felt, clearly different from ordinary dark windows.
* The entrance door at the east end (+X) faces the bridge landing.
* A paved terrace 34 × 10 m in front of the gallery with a low parapet wall (1 m).
* Foundation down to z = −8. Front = −Y. Budget ≤ 10 000 triangles.

Checklist:
- [ ] Gallery with columns along −Y
- [ ] Dark-room windows read as nailed black felt (battens), the other windows are normal recesses
- [ ] Terrace and parapet; roof closed
- [ ] ≤ 10k triangles

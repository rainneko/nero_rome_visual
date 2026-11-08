# 民居一楼 · The ground floor of the apartment blocks (2026-11-08)

The book: "一楼开着铺子，卖面包的，卖鱼的，卖油的，卖陶罐的。二楼往上住人，阳台上晒着衣服"
(bread, fish, oil and pottery shops on the ground floor, people living above, laundry on the balconies).

## What the evidence says 【史】
* **The shop (taberna).** It is a single room opening on the street through a door as wide as the room. The threshold is
  stone with a long groove: at night vertical wooden boards were slotted into the groove. Beside the groove is a pivot
  hole for one narrow door [1][2]. Shutter casts survive from Pompeii IX.7.10, and charred boards from Herculaneum [2].
* **The loft (pergula).** Many shops have a mezzanine where the shopkeeper lived. Some reach it by a brick stair of four
  or five steps in one corner; others by a wooden stair or ladder from those steps [1][7]. Examples:
  - Ostia, Shop of the Jealous One: a brick stair, about AD 50.
  - Rome, Insula dell'Ara Coeli: wooden steps inside each shop up to the mezzanine. It is 2nd century, so use it for
    the arrangement only.
  - A small window over the lintel lights the loft.
  - The Insula Arriana Polliana rent notice offers "tabernae cum pergulis suis" (shops with their lofts), upper flats
    ("cenacula equestria") and a house. It lists them separately, so the upper flats had their own street doors [6].
* **The counter.**
  - Usually masonry, L- or U-shaped, at the front of the shop. Some are just planks on trestles [1].
  - Food bars (thermopolia, popinae): large jars (dolia) set into the counter, a stepped shelf at one end for jugs,
    the counter front painted. Example: the Regio V counter at Pompeii, with a Nereid, ducks and a cockerel; its jars
    held duck, pork, goat, fish and snails [3].
* **Trades seen from the street.**
  - **Bakery (pistrinum):** hourglass lava millstones (meta and catillus) turned by a mule or slaves, an arched brick
    oven; some bakeries have no shop and sold through others [4].
  - **Fish:** a marble table in the middle and a basin against the back wall. Example: the fishmongers' shops at
    Ostia, with a marine mosaic [11].
  - **Wine and oil:** amphorae on wooden racks. Example: Herculaneum, the shop of the House of Neptune and Amphitrite;
    also the painted price list of Ad Cucumas [8].
  - **Fulling and dyeing (fullonica):** vats, cloth hung to dry [10].
* **Goods in the street.** Before Domitian (about AD 92) shops spilled into the street: barbers, innkeepers, cooks and
  butchers worked in front of their thresholds until an edict pushed them back. Martial calls the old Rome "one huge
  shop" (Epigrams 7.61) [5]. So in AD 56, wares, jars, benches and tables stand outside the shops.
* **Painted walls.**
  - Election notices (programmata): red letters on the whitewashed plaster between doors, about 2,500 at Pompeii,
    mostly from the 50s to AD 79 [9].
  - Shop signs, and gods painted by shop and house doors.
  - Street-corner shrines of the Lares (compita) [9].
* **Upper floors over the street.**
  - Timber balconies (maeniana); closed timber rooms hanging over the street, as at Pompeii's Casa del Balcone Pensile [12].
  - A row of balconies in Regio V, with amphorae standing on them [12].
  - At Herculaneum (Casa a Graticcio, III.13–15) a timber-framed upper floor projects over the pavement on brick
    columns. That is a private projecting storey, not a public portico [13].
* **Before and after AD 64.**
  - Nero's rules after the fire (Tacitus, Annals 15.43): lower storeys in Gabine or Alban stone, limited height,
    porticoes in front of the blocks [14].
  - Before the fire, timber and daub was common, and there were no street porticoes; our date is AD 56.

## What we make
* **Shop fit-outs (helpers in `tools/models/rome/rome_tabernae.py`).**
  - Every shop gets a real room: back wall, side walls, a timber mezzanine over the back half and a brick stair to it,
    the grooved threshold, and some boards in the groove.
  - Trade sets:
    - **bread:** loaves on the counter and on shelves, baskets;
    - **fish:** a marble table with fish, a basin;
    - **oil:** amphorae on a wooden rack, oil jars;
    - **pottery:** stacked jars and dishes, also outside;
    - **food bar:** an L-counter with dolia and a painted front, a jug shelf;
    - **cloth:** cloth hung on a pole over the street.
* **New apartment blocks**, each made to fit an existing placement footprint, so the city layout does not change.
  - **rome_insula_d** (slot a): a row of four shops with lofts (bread, fish, oil, pottery, as in the book), and a
    separate stair door to the upper flats with an election notice and a painted shrine beside it. Timber maenianum,
    four storeys.
  - **rome_insula_e** (slot b): a corner food bar with dolia, open on both streets, and a wine shop with amphora racks.
    A closed timber room hangs over the street (Balcone Pensile). Benches by the door.
  - **rome_insula_f** (slot a): a bakery: two lava mills and a brick oven seen through the wide door, a bread counter,
    a smoke-dark wall over the oven.
  - **rome_insula_g** (slot c): a Herculaneum-type timber house. The upper floor projects over the pavement on two
    brick columns. A pottery shop spills onto the street.
  - **rome_insula_h** (slot c): a tall narrow Subura tenement, six storeys (about 20 m, inside Augustus's limit of
    about 70 feet). A dyer's shop with cloth over the street, a stair door, two timber top floors, a lean-to.
* **Procedural houses (about 28,000).**
  - The shader paints a trade on the back wall of each shop: shelves of jars, amphorae, loaves, hanging cloth, or
    closed boards, or a workshop bench with tools hung above it.
  - Election notices on some piers between shops.
  - Low-poly wares, instanced, stand outside some shop fronts in side streets, never on main roads or in burnt or
    later layers.

## Sources
1. Ostia Antica, "Shops and bars": https://ostia-antica.org/dict/topics/shops/shops-intro.htm
2. Holleran, "Finding commerce: the taberna and the identification of Roman commercial space", PBSR 2017;
   Cambridge blog: https://www.cambridge.org/core/blog/2017/04/27/shopping-in-rome-from-ancient-to-modern
3. Regio V thermopolium: https://the-past.com/news/frescoed-food-shop-unearthed-at-pompeii and
   https://www.sci.news/archaeology/pompeii-thermopolium-09193.html
4. Bakery of Popidius Priscus: https://www.worldhistory.org/image/11294/the-bakery-of-popidius-priscus-in-pompeii/
5. Martial, Epigrams 7.61 (Domitian's edict; check against a Latin text before quoting).
6. Insula Arriana Polliana (CIL IV 138): https://pompeii.iath.virginia.edu/cti/region-vi/pansa/rent.html
7. Ostia shop stairs and mezzanines: https://www.ostia-antica.org/regio1/12/12-10.htm ; Insula dell'Ara Coeli:
   https://en.wikipedia.org/wiki/Insula_dell%27Ara_Coeli
8. Ad Cucumas: https://worldhistory.org/image/9713 ; amphorae on racks: https://www.worldhistory.org/image/11811
9. Election notices and façade paintings: Viitanen and Nissin (De Gruyter); Potts, Greece & Rome 2009:
   https://ora.ox.ac.uk/objects/uuid:0ae03255-41e4-43b4-abb4-f91326d66aed
10. Fullonica of Stephanus: https://www.worldhistory.org/image/11257/the-fullonica-of-stephanus-in-pompeii/
11. Fishmongers' shops, Ostia: https://ostiaantica.cultura.gov.it/en/educational-panels-and-maps/the-market-district/cd-macellum-e-tabernae-dei-pescivendoli/
12. Casa del Balcone Pensile: https://pompeii.pictures/R7/7%2012%2028.htm ; Regio V balconies:
    https://pompeii.pictures/R5/5%2003%20balconi.htm
13. Casa a Graticcio: https://pompeiiinpictures.com/herculaneum/Ins 3/Herculaneum 3 14.htm
14. Tacitus, Annals 15.43: https://sacred-texts.com/cla/tac/a15040.htm

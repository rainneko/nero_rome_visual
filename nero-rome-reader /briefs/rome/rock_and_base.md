# 山体与人造台基 · Rock and built bases (how every hill asset should sit on its hill)

Study: `refs/hill_temple_base.jpg` (whole view), `refs/rock_wall_detail.jpg` (bastions on the rock),
`refs/rock_ledges_detail.jpg` (bare rock, a stair along a wall).

## What the reference shows
**Rock.** Pale limestone (warm light grey, beige and ochre stains). It is not a dome or a cone. It is a cliff of stacked
ledges: big blocky masses, 5–15 m, with rounded lips, split by deep vertical joints (dark slots) and sub-horizontal
bedding planes, all tilted a few degrees the same way. Moss and grass (yellow-green) grow on the flat tops and in
hollows only, never on the vertical faces. Loose boulders sit on the ledges and at the foot. Up top the rock rolls into
soil, grass and dirt paths.
**Built base.** Walls of roughly coursed squared blocks in the same pale stone as the rock, with bigger blocks low down,
a projecting coping band and a parapet. Wide round bastions (about 8 m across, as wide as the wall between them),
slightly taller than the wall, each with its own coping. The lower terraces curve to follow the rock contour instead of
running straight. Every level stands back from the one below, and the top of every wall is a usable terrace. The foot of
a wall is never one straight line: it sits on rock ledges at different heights, rock juts out in front of it, and moss
fills the joint. Stairs run along the wall face, wedged between wall and rock, with their own side wall.

## Rules for our models (my design, in the low-poly style)
1. **Ledge rock, not radial mounds.** `rk.rock_mass` builds 3–6 stacked benches, 2–5 m tall each. Each bench's outline is
   the previous one inset by 0.5–3 m with noise, so the profile steps. The whole stack dips 3–8°. Bench sides: an
   outline with a vertex every 3–4 m, jittered ±1 m, plus a deep notch (joint) every 2–4 vertices; a slight batter; a
   bevelled lip (a second ring 0.3 m down, 0.4 m in). Bench tops are flat with ±0.3 m noise, triangulated with a beauty
   or grid fill — never a fan from the centre, never long thin triangles.
2. **Colour by orientation.** Bench tops 'moss' (yellow-green) inside a 0.6 m rim of rock colour; sides 'rock', with
   about a quarter of the side faces 'rock2' (darker stain). No moss on vertical faces.
3. **Boulders.** Scatter 4–12 separate blocks (irregular bevelled boxes, 2–6 m, slightly rotated and sunk) on ledges
   and at the foot; let some overlap bench edges, to break the outline.
4. **Walls meet rock irregularly.** Wherever a retaining wall stands on rock, put rock blocks and a ledge in front of
   its foot at uneven heights (`foot_rocks`) and a moss strip at the joint, so no straight bottom line shows.
5. **Walls in the rock's stone.** Retaining walls in the same pale stone family ('ashlar'), with a darker coping band
   and a 3–5 % batter. Bastions: D-shaped, 6–9 m across, every 14–20 m, 0.6–1 m taller than the wall, with their own
   coping. No thin pencil half-cylinders.
6. **Curves and set-backs.** Where a terrace faces a slope, the lowest wall follows an arc or a polyline along the rock,
   not the plot rectangle. Each level steps back 3–8 m from the one below.
7. **Stairs along walls.** A stair climbing along a wall face, with a parapet on its open side, between wall and rock.
8. **Budget.** Rock 1.5–4 k triangles per mass; nothing that pokes out flat beyond the asset's plot.

## In the page (integration)
The terrain under a hill asset is cut below the rock's lowest bench, and at the rim it blends to the height of the
rock's outer foot, so you see the modelled rock, not a terrain lip or a floating skirt. Cypress rows and umbrella pines
stand at wall feet and on ledges. Terrain on the steep Palatine slopes is tinted rock and moss in the same palette.

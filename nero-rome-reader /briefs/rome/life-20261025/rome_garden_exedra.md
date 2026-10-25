# rome_garden_exedra — open Ionic resting corner

# Shared production constraints

- Original designs for the AD 56 novel city, not copies of the local game reference screenshots. Concept art is a design proposal, not archaeological proof. Written brief overrides image hallucinations.
- Use the existing rk.py/bl_kit.py geometry kit; do NOT modify either shared kit. One script and one GLB per asset. Blender +X east, +Y north, +Z up; GLB page x east/z south. Front is Blender -Y (page +z). Origin center, floor z=0. All geometry inside declared XY bounds (roof and pole feet included). Simple shallow paving z=-.12..0, no high foundation.
- No room-sized black masks, unsupported geometry, people, animation, lights or cameras in GLB. Warm lit recesses. All merchant/visitor circulation must have real clearance. No tomatoes, maize, peppers, aubergines, potatoes or modern packaging.
- Target <=12 named materials and <=150 KB raw where feasible; hard triangle budgets below. Geometry only, no external textures. Four renders front/side/three/top, save source.blend in ignored renders/asset/ for handoff.
- Use finish() to export, with a script-local wrapper around _preview_scene that switches to CYCLES/CPU, samples 12, denoising false, 800x450, threads=2. This avoids the past EEVEE/GPU stalls. Do not start >1 Blender process per worker. No repeated render probes. Report triangles, bounds, GLB size, paths, deviations.
- Script output tools/models/rome/<asset>.py; GLB assets/models/rome/<asset>.glb; renders renders/<asset>/. We review all four views before city integration. Do not edit source JS, existing models, Git or any other worker files.

Concept: concepts/garden-exedra.png. Priority3. Courtyard furnishing ONLY; permitted alongside fountain/Greekcolumns/garden, not a newdwelling.
- Whole bounds X[-3.6,3.6],Y[-2.1,2.1], top<=3.1m; <=9,000 triangles.
- FourIoniccolumns (~2.65m) atcorners supportingopenwoodpergola; visiblevolutecapitals. Justtwo narrowmadderclothribbons withcombinedroofcoverage<=30%; at least65%roofopen. No tiles/upperfloor/rooms.
- Rearcurvedbench rises0.46m, rearwall max.9m; supportsunderseat, redpanels restrained. Centralrear bronzebuston lowpedestal, smallmarbletable, two terracottamyrtlepots. Maintainfrontwalkwidth>=1.2m.
- Groundflushtofloor, nofountain/pool (existingcitycourtyardhasone). Keep lowcentral furnitureclear of path. No statues too tall underpergola, no palatial tall enclosure.
- Plantfoliage compactlowpoly. Lightivory, mutedred, bronze/stone; no emissiveorblackbackdrops.


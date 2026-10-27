# rome_market_pair — paired produce stalls

# Shared production constraints

- Original designs for the AD 56 novel city, not copies of the local game reference screenshots. Concept art is a design proposal, not archaeological proof. Written brief overrides image hallucinations.
- Use the existing rk.py/bl_kit.py geometry kit; do NOT modify either shared kit. One script and one GLB per asset. Blender +X east, +Y north, +Z up; GLB page x east/z south. Front is Blender -Y (page +z). Origin center, floor z=0. All geometry inside declared XY bounds (roof and pole feet included). Simple shallow paving z=-.12..0, no high foundation.
- No room-sized black masks, unsupported geometry, people, animation, lights or cameras in GLB. Warm lit recesses. All merchant/visitor circulation must have real clearance. No tomatoes, maize, peppers, aubergines, potatoes or modern packaging.
- Target <=12 named materials and <=150 KB raw where feasible; hard triangle budgets below. Geometry only, no external textures. Four renders front/side/three/top, save source.blend in ignored renders/asset/ for handoff.
- Use finish() to export, with a script-local wrapper around _preview_scene that switches to CYCLES/CPU, samples 12, denoising false, 800x450, threads=2. This avoids the past EEVEE/GPU stalls. Do not start >1 Blender process per worker. No repeated render probes. Report triangles, bounds, GLB size, paths, deviations.
- Script output tools/models/rome/<asset>.py; GLB assets/models/rome/<asset>.glb; renders renders/<asset>/. We review all four views before city integration. Do not edit source JS, existing models, Git or any other worker files.

Concept: concepts/market-pair.png. Local visual study: 60101791621695_.pic_hd.jpg (street edges), middle/high-income residential reference shopfronts. Priority 1.
- Whole bounds X [-3.2,3.2], Y [-1.9,1.9], floor0, top<=2.85m; <=7,000 triangles.
- Two independent counters, widths about2.5m, face -Y; counter front y=-1.05,height.85; merchant aisle y=-.35..+.9, clear width>=1.2m. Rear shelf thin.6 supported poles, diagonal bracing, two gently sagging cloth roofs (ochre and linen), canopy cloth needs visible underside (2-sided material or closed thin mesh).
- Four legible basket groups with apples/figs, cabbage/leek bundles; several stock jars and modest crates, small beam balance. No individual fruit mesh explosion; baskets suggest weave with few horizontal bands. No green awning or eggplant (ignore those if image suggests them).
- Ground flush paving only. Front and ends open, no opaque rear mass. Distinct silhouettes readable from city camera. Model ORIGINAL functional arrangement, no labels from generated image.


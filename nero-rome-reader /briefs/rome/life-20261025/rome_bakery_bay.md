# rome_bakery_bay — open baking work bay

# Shared production constraints

- Original designs for the AD 56 novel city, not copies of the local game reference screenshots. Concept art is a design proposal, not archaeological proof. Written brief overrides image hallucinations.
- Use the existing rk.py/bl_kit.py geometry kit; do NOT modify either shared kit. One script and one GLB per asset. Blender +X east, +Y north, +Z up; GLB page x east/z south. Front is Blender -Y (page +z). Origin center, floor z=0. All geometry inside declared XY bounds (roof and pole feet included). Simple shallow paving z=-.12..0, no high foundation.
- No room-sized black masks, unsupported geometry, people, animation, lights or cameras in GLB. Warm lit recesses. All merchant/visitor circulation must have real clearance. No tomatoes, maize, peppers, aubergines, potatoes or modern packaging.
- Target <=12 named materials and <=150 KB raw where feasible; hard triangle budgets below. Geometry only, no external textures. Four renders front/side/three/top, save source.blend in ignored renders/asset/ for handoff.
- Use finish() to export, with a script-local wrapper around _preview_scene that switches to CYCLES/CPU, samples 12, denoising false, 800x450, threads=2. This avoids the past EEVEE/GPU stalls. Do not start >1 Blender process per worker. No repeated render probes. Report triangles, bounds, GLB size, paths, deviations.
- Script output tools/models/rome/<asset>.py; GLB assets/models/rome/<asset>.glb; renders renders/<asset>/. We review all four views before city integration. Do not edit source JS, existing models, Git or any other worker files.

Concept: concepts/bakery-bay.png. Priority2; plausible functional reconstruction, not a specific Pompeian excavation copied to Rome in56.
- Whole bounds X[-3,3],Y[-2.7,2.7], top<=3.5m; <=8,000 triangles.
- Rear domed brick/plaster oven at (+1.2,+1.25), hearth~.9m, outer radius1.15m; real short vaulted mouth/chamber with light clay inner floor, brickarch. Build shell around opening, not black disk pasted on sphere; if boolean needed apply it. No visible flame/light.
- Hourglass volcanic mill at(-1.35,+.6), up to1.55m high, one wooden turningarm; maintain walkingring around it (radius>=.9m) that does not hit oven, wall or table. Kit profile geometry acceptable.
- Workbench near front/right or front/left arranged outside turningring;6scored roundloaves, grainbowls, sacks, waterjar, supportedbreadpaddle.
- Back wall at y~2.55 with warmredlowerplaster, short low side returns≤.8m so work area open. Tilelean-to over rear THIRD only (Y>=.9), supported rafters/posts; min60%flooropentosky.
- Matteusedstoneplasterwood, no medieval chimney, no upperfloor, no servicecounter claiming a specific recovered bakery. Paving slabflush.


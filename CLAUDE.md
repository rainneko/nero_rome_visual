# Project notes for Claude

* Build: `npm run build` → `dist/index.html`. Check: `npm run check`. Headless: `npm run build:test && npm run test:boot`.
* Classic scripts and globals, no modules, three.js r147. Keep `build.config.json` order.
* 1 unit = 1 m, x east, z south. Antium at (-70000, 0), Ostia at (-70000, -80000).
* Label history with 【史】; book content is the novel's. Quote the novel exactly. No post-Nero buildings.
* The novel text is the author's; do not rewrite it.

## Modelling loop (Blender MCP)
1. Pick a brief in `briefs/` and give it to the `blender-modeler` subagent (one asset per worker).
2. The worker builds in Blender, renders the four preview cameras to `renders/<asset>/`, exports `assets/models/<asset>.glb`.
3. Compare the renders with the brief, the references in `briefs/antium/refs/` and the history notes.
   Reply with a numbered fix list. Repeat until every checklist item passes.
4. Wire the GLB into the scene (see `docs/ASSETS.md`), build, render the scene view, check scale and placement.

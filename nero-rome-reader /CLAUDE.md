# Project notes for Claude

* Build: `npm run build` → `dist/index.html`, `dist/antium-assets.js` (Antium GLBs), `dist/book.js` (full text).
  Check: `npm run check`. Headless: `npm run build:test && npm run test:boot`. Serve `dist/` over http to test
  (the page loads book.js and antium-assets.js on demand). Node.js is not installed on the owner's Mac by default.
* Classic scripts and globals, no modules, three.js r147. Keep `build.config.json` order.
* 1 unit = 1 m, x east, z south. Antium at (-70000, 0), Ostia at (-70000, -80000).
* Label history with 【史】; book content is the novel's. Quote the novel exactly. No post-Nero buildings.
* The novel text is the author's; do not rewrite it. `data/book.txt` is the full text (see README).
* Antium is a palace, not a town: zones on terraces (see `src/scenes/antium/fortress.js`); the town is on the mainland.
  The headland ends at the observation tower.

## Modelling loop (Blender 5.2 in background mode, `docs/ASSETS.md`)
1. Pick a brief in `briefs/antium/` and give it to a `blender-modeler` subagent (one brief per worker, in parallel).
2. The worker writes `tools/models/antium/<asset>.py` with `bl_kit.py`, runs Blender headless, renders
   `renders/<asset>/`, exports `assets/models/antium/<asset>.glb`.
3. Compare the renders with the brief, the references in `briefs/antium/refs/` and the book.
   Reply with a numbered fix list. Repeat until every checklist item passes.
4. `sh tools/models/antium/optimize.sh`, place it with `antStand(...)`, build, check the scene views in a browser.

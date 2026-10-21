# 尼禄重工纪元 · 罗马沙盘阅读器 (Nero Rome Reader)

A reading site for the Chinese novel 《尼禄重工纪元》: the text on one side, a living 3D model of Rome
(and Antium, Ostia, the Empire in AD 58) behind it. As the reader scrolls, the city changes with the story:
nine states from AD 54 to after 68, chapter‑gated objects, paragraph triggers that move the camera, a resource bar,
and place names in the text that fly to the right spot.

* Three.js r147 (CDN), plain classic scripts, no bundler. The build makes **one self‑contained HTML file**.
* Rome: ~200 named buildings (history and the book are labelled 【史】/ 书中), city fabric, seasons, night lighting.
* Antium: the headland fortress villa, the islet linked by one bridge, harbour and works. Ostia: harbour and slipways.
* Empire map (AD 58): provinces, cities, legion bases (AWMC data, ODbL).

## Quick start

```bash
npm install            # three (for local tests) and puppeteer
npm run build          # -> dist/index.html (open it in a browser)
npm run serve          # optional: http://localhost:8080
```

## Layout

```
src/shell.html                 page, CSS, HUD/reader/dock markup (the build injects the JS here)
src/core/renderer.js           renderer, sky, weather, seasons, time of day, post effects
src/core/materials.js          city shader (roofs, walls, windows, night lights) and geometry builder
src/world/builders.js          temples, tholoi, courtyard blocks, porticoes, fountains, water
src/world/terrain-roads.js     Rome terrain, roads, bridges, city blocks
src/world/lots.js              house lots, narrow staggered houses, balconies, street porticoes
src/scenes/rome/monuments.js   named monuments, hills, aqueducts, infill, labels, camera views
src/scenes/rome/layers.js      story layers switched by state (and the Ostia scene)
src/scenes/antium/*.js         Antium: terrain, fortress, islet + bridge, harbour + works, entry
src/ui/app.js                  states, resource bar, reader, place-name links, triggers, pages, music
src/ui/empire.js               empire map overlay
data/                          density map, empire map data
assets/models/*.glb            large detailed buildings (Jupiter temple, Domus Tiberiana, Curia)
assets/icons/                  resource icons (source PNGs; the page embeds them)
tools/build.mjs, check.mjs     build and syntax check
tools/test/                    headless boot test and view renderer
tools/models/                  Python generators that wrote the GLB models
docs/                          architecture, content guide, asset pipeline
briefs/antium/                 modelling briefs for the Antium core assets
.claude/agents/                Claude Code subagent for Blender modelling
```

## Tests

```bash
npm run build:test     # dist/test.html loads three.js from node_modules
npm run test:boot      # boots headless, prints the resource bar, fails on page errors
npm run test:shot -- '[[0,"forum",0.3,"forum.png"],[1,"antBridge",0.3,"bridge.png"]]'
```

## Deploy

`.github/workflows/pages.yml` builds on every push to `main` and publishes `dist/` to GitHub Pages
(enable Pages → "GitHub Actions" in the repository settings).

## Licences

* Code: choose a licence before publishing (none is set yet).
* Novel excerpts in `src/ui/app.js` (sample text, quotes): © the author, all rights reserved unless the author decides otherwise.
* Third‑party data: see `NOTICE.md`.

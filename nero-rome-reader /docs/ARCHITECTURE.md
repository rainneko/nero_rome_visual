# Architecture

## Coordinates
1 unit = 1 m. x = east, z = south, y = up. Origin = Forum Romanum.
Antium is drawn at (-70000, 0) and Ostia at (-70000, -80000); the page buttons fly the camera between them.

## How the program is put together
All files in `build.config.json → order` are classic scripts concatenated into one `<script>`.
Top-level `function`s and `const`s are shared globals, so **order matters only for code that runs at load time**.
`tools/build.mjs` also replaces `/*__DMAP__*/null` and `/*__EMPIRE__*/null` with the JSON in `data/`,
and prepends the GLB files as base64 constants (`JOM_GLB`, `DT_GLB`, `CU_GLB`).

## Geometry
* `GB` (materials.js) collects triangles per material part; one merged mesh per group keeps draw calls low.
* Columns are instanced (`W.cols.cor`, `W.cols.simple`) and flushed per group.
* Story content lives in **layers**: `L(name, s0, fn)` in `layers.js` makes a `THREE.Group` per name.

## Story state
* `STATES[0..8]` (app.js): year, title, default camera, weather, quotes, and the layers switched on.
* `XL` gives a state range to each layer. `setState(i)` switches layers, labels (`s0..s1`), HUD (`HUDV`).
* **Chapter gates**: the reader knows the current chapter (`W0.curCh`); `applyGates()` shows objects such as the
  bronze column (from chapter 7) or the chapter 3 festival.
* **Paragraph triggers**: `TRIG` entries match a sentence; when it reaches the reading line the camera flies to a view
  and event flags change (e.g. chapter 3: the Campus Martius balloon, then the Circus Maximus balloon).

## Labels, views, pages
* `W.pois`: `{n, l, x, z, y, s0, s1, ch0?, ch1?, pg?, info}`. `info` text uses 【史】 for history.
* `W.views`: camera presets; `pg:'test'` views are hidden from the menu.
* Pages: Rome / Antium / Ostia / Empire (`setPage`).

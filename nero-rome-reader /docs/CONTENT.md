# Content guide

* **Resource bar** — `HUDV[state][item] = [shortValue, detail]` in `src/ui/app.js`. Only short numbers on the bar,
  the detail shows on hover. Keep numbers the book gives; do not invent figures.
* **Place-name links** — `GZ` entries: `k` (words in the text), `v` (camera view) or `p` (label), `a:1` auto-fly,
  `sc` (scene: rome / antium / ostia).
* **Paragraph triggers** — `TRIG` entries: `m` (a sentence from the text), `v` (view), `ev` (event flags).
* **Chapter-gated objects** — add a layer in `layers.js` and a rule in `applyGates()`.
* **Labels** — push to `W.pois`; use `ch0`/`ch1` for chapter limits and `pg` for Antium/Ostia.
* **Sample text** — shown before a TXT is imported; sections with titles like `第3章 …` drive chapter gates.

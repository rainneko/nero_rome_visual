# Recording the city for the video

`record.mjs` films camera shots of the reader's 3D scene and writes one video file per shot.
It drives the real page (`dist/test.html` at full quality, light crystal filter on, labels and panels hidden)
on a **virtual clock**: every frame advances exactly 1/fps, so camera moves, water, smoke and rising story layers
keep their real speed however long a frame takes to render.

```bash
npm install                 # three and puppeteer
npm run build:test          # dist/test.html
npm run video -- tools/video/shots/smoke.json
```

Footage goes to `~/NeroRome-video/footage/` (outside the repository; `--out DIR` to change it).
Each shot becomes `<name>.mp4`; frames are piped to the encoder, nothing is stored:

* with `ffmpeg` on the PATH: x264, CRF 16 (18 at 4K), converted to BT.709 and tagged so. ffmpeg's defaults
  (BT.601, untagged) come out about 2 levels too red and green in Chrome; with the tags a frame decoded in Chrome is
  within 0.7 levels of the lossless PNG (PSNR 38.7 dB);
* otherwise on macOS: `encode.m`, a small AVFoundation encoder that uses the hardware H.264 encoder (about 40 Mb/s at
  1080p, scaled with the pixel count; tagged BT.709). `record.mjs` compiles it with `clang` into
  `~/Library/Caches/nero-rome-video/encode` on first use. It also encodes a folder of frames:
  `~/Library/Caches/nero-rome-video/encode out.mp4 30 --dir frames/`.
  (Swift cannot compile against the installed Command Line Tools, so the encoder is Objective-C.)

ffmpeg on this Mac (macOS 14, Apple Silicon) comes from conda-forge, not Homebrew: Homebrew's ffmpeg bottles start at
macOS 15 and the Intel Homebrew in `/usr/local` builds it from source and fails. The conda-forge build is native arm64
and has x264, x265, SVT-AV1, VideoToolbox, AudioToolbox AAC, libass (subtitles, Chinese fonts included) and loudnorm:

```bash
CONDA_SUBDIR=osx-arm64 conda create -n ffmpeg --override-channels -c conda-forge "ffmpeg=*=gpl*"
ln -s ~/opt/anaconda3/envs/ffmpeg/bin/ffmpeg ~/opt/anaconda3/envs/ffmpeg/bin/ffprobe ~/.local/bin/
```

To remove it: `conda env remove -n ffmpeg` and delete the two links.

Without either, or with `--keep-frames`, the frames are kept as `<name>/00000.jpg …` with a `<name>.encode.sh` next
to them, and a shot that would not fit on the disk is skipped.

Every shot starts at the same animation time, so rendering a shot again gives the same frames (water, smoke and the
filter grain included; a handful of small moving details can differ). That is what makes same-camera before/after
cuts from older commits possible.

| Option | Effect |
|---|---|
| `--only a,b` | record only these shots |
| `--preview` | 1280×720 at 10 fps, for checking motion quickly |
| `--stills` | three frames per shot (start, middle, end) as JPEG, for checking framing |
| `--png` | lossless frames instead of JPEG (quality 95) |
| `--keep-frames` | store frames even when ffmpeg is available |
| `--list-views` | print every camera preset (`W.views`) with its position and target |
| `--site DIR` | film another checkout instead of this one, built with `build:test` there: an older commit for a before/after cut, or another session's branch. `git archive <commit> "nero-rome-reader /" \| tar -x -C DIR`, link `node_modules`, build, then `--site "DIR/nero-rome-reader "` |

Measured on an M1 Pro (headless Chrome on the GPU through Metal): the city loads in about 20 s and a
1920×1080 frame takes 0.13–0.23 s, so one minute of 30 fps footage records in about 5 minutes. `scale: 2`
renders 3840×2160.

## Shot list

```json
{
  "fps": 30, "width": 1920, "height": 1080, "scale": 1,
  "defaults": {"state": 0, "season": 1, "tod": 0.3, "weather": "clear", "smog": 0},
  "shots": [
    {"name": "forum-seasons", "seconds": 14, "path": [{"view": "forum"}], "orbit": 14, "season": [0, 1, 2, 3]},
    {"name": "story", "seconds": 16, "path": [{"view": "south"}],
     "events": [{"t": 0, "state": 2}, {"t": 4, "state": 3, "rise": true}]}
  ]
}
```

* `path`: camera keyframes, spread evenly over the shot unless a keyframe has `at` (0–1). A keyframe is a preset
  `{"view": "palatine"}` or `{"pos": [x,y,z], "tgt": [x,y,z]}`, with optional `zoom` (distance factor),
  `yaw` and `pitch` (degrees) and `lift` (metres added to the target). The camera moves in the reader's own
  terms (target, distance, yaw, pitch) along a Catmull-Rom curve, eased by `ease`: `inOut` (default), `in`, `out`, `linear`.
* `orbit`: degrees of turn round the target over the shot. `push`: distance factor reached at the end (0.8 = 20 % closer).
  `moveFor`: seconds the camera move takes; after that it holds still (the balloon shot rises for 6.5 s, then holds
  through 3 s of silence). Use it instead of repeating a keyframe: the Catmull-Rom curve overshoots between two
  near-identical keys.
* `season` (0 spring, 1 summer, 2 autumn, 3 winter; fractions blend) and `tod` (time of day 0–1; 0.25 morning,
  0.5 noon, 0.75 dusk, 0.9 night): a number, a list spread evenly over the shot, or `[[seconds, value], …]`.
* `state`: story state 0–8 at the start (`STATES` in `src/ui/app.js`). `events`: `{"t": seconds, "state": n, "rise": true}`
  switches the state during the shot; with `rise` new layers grow out of the ground as they do for readers.
  Without a `tod` track the state's own light change plays.
* `page`: `rome`, `antium` or `ostia`. `weather`: `clear`, `haze`, `overcast`, `rain`, `storm`.
* `sunAz`: sun azimuth in degrees (0 north, 90 east, 180 south, 270 west). The reader keeps the sun at 68° at every
  hour, so afternoon and evening shots set it in the west (`x-C1b-balloon-orbit` uses 250).
* `sky` (0–1, a number or track): pushes the reader's pale clear sky towards a deep blue (the balloon shots use 0.7).
* `fx`: tracks written each frame into `W.fx`, which story layers read. `balloonFill` (0 a hanging drape, 1 full; the
  reader's default), `rig` (1 shows the launch gantry and hides the mooring line), `crowdCheer` (0 seated, 1 the Circus
  crowd stands and jumps). `shots/excerpts.json` `x-C1h-*` use all three.
* `smog` (0–1, the yellow industrial haze): a number, or a track like `season`, e.g. `[[0, 0.05], [8, 0.6]]`.
* `layerY`: per-layer height tracks in metres, e.g. `{"balloon": [[0, -72], [1.5, -72], [6, 0]]}` lifts the balloon
  out of the arena. `hide` / `show`: lists of layers (`--list-layers`) to switch off or on for the shot.
* `stages`: construction stages for buildings that have them (`src/scenes/rome/construction.js`: `furnaceA`, `chem`),
  stepping, not blending: `{"furnaceA": [[0, 0], [2, 1], [4, 2], [6, 3], [8, 4], [9.5, 5]]}`. K0 survey and heaps, K1
  footings, K2 scaffolding, K3 full height with cold chimneys, K4 finished, K5 smoking; each step cross-fades the
  stage models. `shots/construction.json` films them.
* To show the city changing without buildings rising out of the ground, record the same `path` twice, once per story
  state (`x-C4a-south-54` / `x-C4b-south-56` in `shots/excerpts.json`), and dissolve one into the other:
  `ffmpeg -i a.mp4 -i b.mp4 -filter_complex xfade=transition=fade:duration=2:offset=3 out.mp4`.

`shots/smoke.json` is a 17-second test of every feature. `shots/part1-seasons.json` is the draft of the video's
opening (four seasons, the districts, Antium, Ostia, night, the city changing from AD 54 to 68); record it after the
road, square and Claudius-temple fixes are in, so the tour does not show the old bugs. `shots/excerpts.json` holds the
shots under the novel excerpts (slots A–E in `docs/making-of/video-plan.md`).

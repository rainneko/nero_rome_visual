#!/bin/sh
# Quantize the Antium GLBs in place: positions 14-bit, normals 8-bit (KHR_mesh_quantization; three.js reads it natively).
# About 57 % of the raw size, and much smaller again once GitHub Pages gzips antium-assets.js.
# Run after re-exporting a model:  sh tools/models/antium/optimize.sh   (needs Node.js; uses npx)
cd "$(dirname "$0")/../../.." || exit 1
for f in assets/models/antium/*.glb; do
  npx --yes @gltf-transform/cli@4 quantize "$f" "$f.tmp.glb" --quantize-normal 8 --quantize-position 14 >/dev/null && mv "$f.tmp.glb" "$f" && echo "quantized $f"
done

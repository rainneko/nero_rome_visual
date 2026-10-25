import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const context = { Float32Array, Uint8Array, Int32Array, Math, Number, performance: { now: () => 0 }, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/world/streets.js', 'utf8'), context, { filename: 'streets.js' });

// Grade gate and water/land exclusion, at measured slopes on a 1 m rise baseline.
for (const [slope, blocked, expected] of [[0, false, true], [.14, false, true], [.30, false, true], [.30001, false, false], [.8, false, false], [NaN, false, false], [0, true, false]]) {
  assert.equal(context.streetRoadAllowed(slope, blocked), expected, `road admission slope=${slope}, blocked=${blocked}`);
}
for (const [solid, vegetation, water, expected] of [[0, 0, 0, true], [1, 0, 0, false], [0, 1, 0, false], [0, 0, 1, false]]) {
  assert.equal(context.streetTextureVisible(solid, vegetation, water), expected);
}
console.log('street rules: 11 numeric admission and masking assertions passed');

// node scripts/tests/footprint.test.js  — overlap rules of the footprint registry
const path = require('path');
const { FootprintRegistry } = require(path.join(__dirname, '..', 'footprint.js'));
const f = new FootprintRegistry(); f.add(0, 0, 10, 5, 0, 'temple');          // spans x -10..10, z -5..5
const cases = [
  [() => f.hits(13, 0, 4, 4, 0), true, 'overlaps the east end (x 9..17)'],
  [() => f.hits(16, 0, 1, 1, 0), false, 'clear 5 m gap'],
  [() => f.hits(12, 6.5, 3, 3, Math.PI / 4), true, 'rotated square touches the corner'],
  [() => f.hits(13, 7, 3, 3, Math.PI / 4), false, 'rotated square just misses the corner'],
  [() => f.hits(0, 13, 10, 5, 0, 2), false, 'margin 2 m still clear'],
  [() => f.hits(0, 11, 10, 5, 0, 2), true, 'margin 2 m makes it hit'],
];
let fail = 0;
for (const [fn, exp, name] of cases) { const got = !!fn(); console.log(got === exp ? 'PASS' : 'FAIL', name); if (got !== exp) fail++; }
process.exit(fail ? 1 : 0);

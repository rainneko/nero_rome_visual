// Footprint registry: every generator asks before it builds. Reserve landmarks first, then fill houses.
// Rectangles are oriented (rot in radians); circles for round buildings.
class FootprintRegistry {
  constructor(cell = 32) { this.cell = cell; this.grid = new Map(); this.items = []; }
  _keys(x, z, r) { const c = this.cell, ks = []; for (let i = Math.floor((x - r) / c); i <= Math.floor((x + r) / c); i++) for (let j = Math.floor((z - r) / c); j <= Math.floor((z + r) / c); j++) ks.push(i + ',' + j); return ks; }
  add(x, z, hx, hz, rot = 0, tag = '') { const it = { x, z, hx, hz, rot, tag, r: Math.hypot(hx, hz) }; this.items.push(it); for (const k of this._keys(x, z, it.r)) { if (!this.grid.has(k)) this.grid.set(k, []); this.grid.get(k).push(it); } return it; }
  addCircle(x, z, r, tag = '') { return this.add(x, z, r, r, 0, tag + ':circle'); }
  hits(x, z, hx, hz, rot = 0, margin = 0) {
    const r = Math.hypot(hx, hz) + margin, seen = new Set();
    for (const k of this._keys(x, z, r)) for (const it of this.grid.get(k) || []) { if (seen.has(it)) continue; seen.add(it); if (overlap(it, { x, z, hx: hx + margin, hz: hz + margin, rot })) return it; }
    return null;
  }
}
// Separating-axis test for two oriented rectangles.
function overlap(a, b) {
  const axes = [a.rot, a.rot + Math.PI / 2, b.rot, b.rot + Math.PI / 2];
  const corners = q => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => { const c = Math.cos(q.rot), s = Math.sin(q.rot); return [q.x + sx * q.hx * c - sz * q.hz * s, q.z + sx * q.hx * s + sz * q.hz * c]; });
  const A = corners(a), B = corners(b);
  for (const t of axes) { const ax = Math.cos(t), az = Math.sin(t), pa = A.map(p => p[0] * ax + p[1] * az), pb = B.map(p => p[0] * ax + p[1] * az); if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return false; }
  return true;
}
// Usage
// const foot = new FootprintRegistry();
// foot.add(-590, -44, 60, 52, 0, 'Porticus Octaviae');     // landmarks first
// if (!foot.hits(x, z, 5, 6, rot, 1)) { buildHouse(x, z, rot); foot.add(x, z, 5, 6, rot, 'house'); }
if (typeof module !== 'undefined') module.exports = { FootprintRegistry, overlap };

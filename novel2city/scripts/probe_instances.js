// Paste into the browser console (three.js scene in `scene`). Lists instanced objects inside a box,
// with colour and height, to find which code placed them (e.g. a forgotten colonnade).
function probeInstances(scene, x0, x1, z0, z1) {
  const out = [], m = new THREE.Matrix4(), p = new THREE.Vector3(), s = new THREE.Vector3(), q = new THREE.Quaternion(), c = new THREE.Color();
  scene.traverse(o => {
    if (!o.isInstancedMesh) return; const hits = [];
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); m.decompose(p, q, s); if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) { let col = null; if (o.instanceColor) { o.getColorAt(i, c); col = c.toArray().map(v => +v.toFixed(2)); } hits.push({ x: Math.round(p.x), z: Math.round(p.z), h: +s.y.toFixed(1), col }); } }
    if (hits.length) out.push({ mesh: o.name || o.uuid.slice(0, 8), n: hits.length, sample: hits.slice(0, 5) });
  });
  console.table(out); return out;
}
// probeInstances(scene, -575, -440, -140, 10)  -> group by height/colour, then search the code for that height/colour.

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const vector = () => ({ set() {} });
const drawn = [];
const context = {
  Float32Array, Uint8Array, Int32Array, Uint32Array, Math, Number,
  lerp(a,b,t) { return a+(b-a)*t; },
  performance: { now: () => 0 }, console: { log() {} },
  Q: { name: 'high' }, TEST: false,
  drawn,
  MAT: { city: {}, cityDecal: {} },
  RNG: () => () => .25,
  GB: class { set() {} poly(points) { drawn.push(points); } mesh() { return { renderOrder: 0 }; } },
  frame(ox,oy,oz,rot=0) { const c=Math.cos(rot),s=Math.sin(rot); return { p(x,y,z) { return [ox+x*c+z*s,oy+y,oz-x*s+z*c]; } }; },
  box() {},
  THREE: { RGBAFormat: 1, UnsignedByteType: 2, LinearFilter: 3, LinearMipmapLinearFilter: 4,
    ClampToEdgeWrapping: 5, DataTexture: function (data, width, height) { Object.assign(this, { data, width, height }); } },
  U: { uSt: { value: null }, uStA: { value: null }, uStX: { value: vector() }, uStN: { value: vector() } },
  densify(points, step) { const out=[]; for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let k=0;k<n;k++)out.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}out.push(points.at(-1));return out; },
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/world/streets.js', 'utf8'), context, { filename: 'streets.js' });

const footprint = (cx, cz, hw, hd, tag, extra = {}) => ({ cx, cz, hw, hd, r: Math.hypot(hw,hd), c: 1, s: 0, tag, ...extra });
const W = {
  foot: { list: [footprint(0,100,12,12), footprint(5,0,16,16,'open'), footprint(20,0,5,8,'open',{ siteRole: 'authored-courtyard-estate', reservation: {} })] },
  gy(x) { return x > 38 ? (x-38)*.5 : 0; },
};
context.buildStreets(W, {
  roads: [[8,[[-70,0],[70,0]]]], paved: [], feet: [],
  urban: () => 1, zone: () => 2, marble: () => false,
  veg: (x) => x > 30 && x < 36, water: (x) => x < -55,
});
const S = W.street;
const cell = (x,z) => { const i=Math.floor((x-S.x0)/S.cs),j=Math.floor((z-S.z0)/S.cs); return j*S.nx+i; };
const roadAt = (x,z) => S.road[cell(x,z)] > 0;
assert.equal(roadAt(5,0), true, 'main road must rasterize across ordinary reserved open land');
assert.equal(roadAt(-65,0), false, 'road must stop on water');
assert.equal(roadAt(20,0), false, 'road must not cross a reserved courtyard');
assert.equal(roadAt(32,0), false, 'road must stop on natural vegetation');
assert.equal(roadAt(50,0), false, 'road must stop above the 30% grade limit');
assert.ok(S.texture[cell(5,0)*4] > 0, 'road texture must remain visible across generic open land');
assert.equal(S.texture[cell(20,0)*4], 0, 'court mask must suppress the road texture');
assert.equal(S.texture[cell(-65,0)*4], 0, 'water mask must suppress the road texture');
assert.equal(context.streetRoadPointAllowed(S,W,5,0), true);
assert.equal(context.streetRoadPointAllowed(S,W,-65,0), false);
assert.equal(context.streetRoadPointAllowed(S,W,50,0), false);
assert.equal(context.streetStairFootprintAllowed(S,5,0,1,0,12,3,S.cs,true), true, 'stair corridor plus both end joins must fit a connected street');
const broken = { ...S, st: S.st.slice() }; broken.st[cell(5,0)] = 0;
assert.equal(context.streetStairFootprintAllowed(broken,5,0,1,0,12,3,S.cs,true), false, 'stair flight must reject a non-street gap');
const noJoin = { ...S, st: S.st.slice() }; for(const x of[-5,15])for(let z=-4;z<=4;z+=S.cs)noJoin.st[cell(x,z)]=0;
assert.equal(context.streetStairFootprintAllowed(noJoin,5,0,1,0,12,3,S.cs,true), false, 'both stair ends must meet the street network');

const makeFrame=(ox,oy,oz,rot=0)=>{const c=Math.cos(rot),s=Math.sin(rot);return{ox,oy,oz,rot,p(x,y,z){return[ox+x*c+z*s,oy+y,oz-x*s+z*c];},sub(x,y,z,r=0){const q=this.p(x,y,z);return makeFrame(q[0],q[1],q[2],rot+r);}};};
const dianaPlan=context.streetCompactUPlan(makeFrame(-560,10,975,Math.PI/2),(x,z)=>10+.018*x+.009*z,[44,48,52,56,60],[0,Math.PI],1.42,1.84,2.5,[[0,0],[0,2],[0,-2],[2,0],[-2,0],[0,4],[0,-4],[4,0],[-4,0]],[26,44,4]);
assert.ok(dianaPlan,'a complete U plan should be found on this measured gentle terrain');
assert.equal(dianaPlan.span,44,'the smallest complete temple-sized court should win when it passes the footing check');
assert.equal(dianaPlan.wings.length,3,'plan must retain all three complete wings');
assert.ok(dianaPlan.span/2-dianaPlan.wingDepth-Math.abs(dianaPlan.offsetX)>=17-1e-6,'interior width must contain temple plus 4 m clear space');
assert.ok(dianaPlan.depth/2-dianaPlan.wingDepth-Math.abs(dianaPlan.offsetZ)>=26-1e-6,'interior length must contain temple plus 4 m clear space');
assert.ok(dianaPlan.relief+.12<=2,'planned footing height must stay within 2 m');
const dianaWings=[];for(let wi=0;wi<3;wi++){const emitted=context.streetPrecinctWingColumns(dianaPlan,wi,5,(x,z)=>10+.018*x+.009*z,dianaPlan.hi+.12);assert.ok(emitted.columns.length>=4);assert.ok(emitted.supportMax<=2);assert.ok(emitted.supportMin>=0);const row0=emitted.columns.filter(c=>c.row===0),row1=emitted.columns.filter(c=>c.row===1),nearest=Math.min(...row0.flatMap(a=>row1.map(b=>Math.hypot(a.x-b.x,a.z-b.z))));assert.ok(Math.abs(nearest-dianaPlan.wingDepth)<.001,`column rows must be separated by local normal ${dianaPlan.wingDepth}; got ${nearest}, wing ${wi}`);dianaWings.push(emitted.columns);}
const at=(cols,row,station)=>cols.find(c=>c.row===row&&Math.abs(c.station-station)<1e-9);
for(const row of[0,1]){assert.ok(Math.hypot(at(dianaWings[0],row,1).x-at(dianaWings[2],row,0).x,at(dianaWings[0],row,1).z-at(dianaWings[2],row,0).z)<1e-6,'left and back wings must meet at both colonnade rows');assert.ok(Math.hypot(at(dianaWings[1],row,0).x-at(dianaWings[2],row,1).x,at(dianaWings[1],row,0).z-at(dianaWings[2],row,1).z)<1e-6,'right and back wings must meet at both colonnade rows');}
assert.equal(context.streetCompactUPlan(makeFrame(-560,10,975,Math.PI/2),(x,z)=>.5*x+.2*z,[44,48,52,56,60],[0,Math.PI],1.42,1.84,2.5,[[0,0],[0,2],[0,-2],[2,0],[-2,0],[0,4],[0,-4],[4,0],[-4,0]],[26,44,4]),null,'unsupported terrain must return no plan rather than a false complete precinct');

// Exercise the actual kerb and rut emitter on one road crossing synthetic shoreline and cliff masks.
const nX=41,nZ=21,cellSize=1,xOrigin=-20,zOrigin=-10,N=nX*nZ,zeros=new Uint8Array(N),roadCells=new Uint8Array(N).fill(1),water=new Uint8Array(N);
for(let j=0;j<nZ;j++)for(let i=0;i<nX;i++)if(xOrigin+i< -5)water[j*nX+i]=1;
const R={x0:xOrigin,z0:zOrigin,cs:cellSize,nx:nX,nz:nZ,road:roadCells,solid:zeros,water,naturalVeg:zeros,court:zeros,at:()=>2};
const RW={street:R,gy(x){return x>4?(x-4)*.5:0;},scene:{add(){} }};
context.roadKerbs(RW,[[8,[[-10,0],[10,0]]]]);
assert.ok(drawn.length>0,'legal road sections should emit kerbs or ruts');
const emittedX=drawn.flat().map(p=>p[0]);
assert.ok(Math.min(...emittedX)>=-5.001,'kerb/rut geometry must not extend past the water mask');
assert.ok(Math.max(...emittedX)<=4.001,'kerb/rut geometry must stop before the steep grade');

const terrainContext = { Float32Array, Math, THREE: context.THREE, lerp: context.lerp, console: { log() {} } };
vm.createContext(terrainContext);
vm.runInContext(fs.readFileSync('src/world/terrain-roads.js','utf8'),terrainContext,{filename:'terrain-roads.js'});
const footList=[];const foot={list:footList,add(cx,cz,hw,hd,rot,tag){footList.push({cx,cz,hw,hd,rot,tag,r:Math.hypot(hw,hd)});},addCircle(cx,cz,r,tag){footList.push({cx,cz,hw:r,hd:r,tag,r});}};
const reserved={name:'audit',foot,gy:RW.gy};
terrainContext.roads(reserved,[[8,[[-10,0],[10,0]]]],{});
const reservedRoad=reserved.foot.list.filter(f=>f.tag==='road');
assert.ok(reservedRoad.length>0,'grade-valid route section should reserve a corridor');
assert.ok(Math.max(...reservedRoad.map(f=>f.cx+f.r))<=6,'road reservations must not continue across the steep break');
console.log('street generation: integrated terrain, reservation, texture, kerb, rut, road, stair, and Diana U geometry assertions passed');

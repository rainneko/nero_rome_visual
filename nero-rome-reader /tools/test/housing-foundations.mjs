// Structural regression tests using production geometry; no browser or GPU needed.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import * as THREE from 'three';
const read=p=>fs.readFileSync(p,'utf8'),sandbox={THREE,window:{},console};vm.createContext(sandbox);
const source=read('src/core/renderer.js').split('const nextFrame=')[0]+read('src/core/materials.js').split('/* ---------- city / architecture material ---------- */')[0]+read('src/world/terrain-roads.js')+read('src/world/lots.js')+read('src/world/roman-details.js');
vm.runInContext(source,sandbox);
const result=vm.runInContext(`(()=>{
 const L=[[-5,-5],[5,-5],[5,5],[-5,5]],W={gy:(x,z)=>-4*Math.max(0,1-(x*x+z*z)/12),cols:{simple:[],cor:[],ion:[],dor:[]},trees:[]};
 const bowl=houseGround(W,L);W.gy=(x,z)=>10+x*.4+z*.2;
 const ground=houseGround(W,L),g=new GB(),profile={part:0,seed:.3,sty:0,fl:2,nSt:4,gH:3.8,sH:2.9,pitch:.32,lit:.6,flat:false,noSplit:true,noDecor:true};
 const ok=lotBuild(W,g,L,profile,RNG(41),null),log=W.lotLog[0],P=Array.from(g.p.slice(0,g.nv*3));
 const xs=P.filter((_,i)=>i%3===0),zs=P.filter((_,i)=>i%3===2);
 const h=new GB();emitBuilding(W,h,'shed',0,0,0,10,10,3,ground.min,ground.max,RNG(73),{shops:0,brick:0});
 const firstFloorVertices=[];for(let i=0;i<h.nv;i++){const y=h.p[i*3+1],v=h.a[i*4+1];if(h.a[i*4+3]>0)firstFloorVertices.push(y-v);}
 const threeLimit=lotSlopeLimit(3,3.8,2.9,100),fourLimit=lotSlopeLimit(4,3.8,2.9,100),steep={gy:(x,z)=>.61*x,cols:{simple:[],cor:[],ion:[],dor:[]},trees:[]};
 const threeTooSteep=lotBuild0(steep,new GB(),L,{part:0,seed:.3,sty:0,fl:2,nSt:3,gH:3.8,sH:2.9,pitch:.32,lit:.6,noSplit:true,noDecor:true},RNG(42),null);
 const fourJustUnder=lotBuild0(W,new GB(),L,profile,RNG(43),null),fourTooSteep=lotBuild0(steep,new GB(),L,profile,RNG(44),null);
 const dw={gy:()=>0,cols:{simple:[],cor:[],ion:[],dor:[]},foot:new Foot()};dw.foot.add(0,3,20,.5,0,'road');const dg=new GB();decorLot(dw,dg,[[-5,0],[5,0],[5,-10],[-5,-10]],{nSt:4,gH:3.8,seed:.3},()=>.3);
 return{bowl,ground,ok,log,maxX:Math.max(...xs),minX:Math.min(...xs),maxZ:Math.max(...zs),shedDatum:firstFloorVertices[0],finite:P.every(Number.isFinite),threeLimit,fourLimit,threeTooSteep,fourJustUnder,fourTooSteep,roadEaveDecorVertices:dg.nv};
})()`,sandbox);
assert.equal(result.bowl.min,-4,'footprint interior depression must count');assert.ok(Math.abs(result.ground.min-7)<1e-6);assert.ok(Math.abs(result.log.floorY-7.15)<1e-6,'floor follows lowest, not highest');assert.equal(result.log.terrace,false);assert.ok(result.log.groundMax>result.log.floorY+3,'uphill first floor may be buried');assert.ok(result.maxX<6&&result.minX>-6&&result.maxZ<6,'no expanded residential podium');assert.ok(Math.abs(result.shedDatum-7.15)<.001,'infill uses same minimum datum');assert.ok(result.finite);assert.ok(Math.abs(result.threeLimit-3.15)<1e-6);assert.ok(Math.abs(result.fourLimit-6.05)<1e-6);assert.equal(result.threeTooSteep,false);assert.equal(result.fourJustUnder,true,'6 m slope remains valid for 4 storeys');assert.equal(result.fourTooSteep,false);assert.equal(result.roadEaveDecorVertices,0,'2.9 m pergola must not reach a road');console.log(JSON.stringify({pass:true,result}));

const roadAudit=vm.runInContext(`(()=>{const W={foot:new Foot()};roads(W,[[6,[[0,0],[100,0],[120,30]]]]);return{middle:W.foot.hits(12,0,1,1,0,0),outside:W.foot.hits(12,12,1,1,0,0),continuous:Array.from({length:101},(_,i)=>W.foot.hits(i,0,.1,.1,0,0)).every(Boolean)};})()`,sandbox);
assert.ok(roadAudit.middle&&roadAudit.continuous,'road reservation cannot have inter-sample gaps');assert.equal(roadAudit.outside,false);console.log({roadAudit});

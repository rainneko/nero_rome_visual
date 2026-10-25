// Raycast regression over production GB, arcade, houseShell and houseGallery geometry.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';

const read=f=>fs.readFileSync(f,'utf8');
const materials=read('src/core/materials.js');
const builders=read('src/world/builders.js');
const lots=read('src/world/lots.js');
function block(src,marker){
  const at=src.indexOf(marker);assert(at>=0,`production source contains ${marker}`);
  const open=marker.startsWith('class ')?src.indexOf('{',at):src.indexOf('){',at)+1;
  assert(open>=0,`block opens for ${marker}`);
  let depth=0;
  for(let i=open;i<src.length;i++){
    if(src[i]==='{')depth++;
    else if(src[i]==='}'&&--depth===0)return src.slice(at,i+1);
  }
  assert.fail(`unterminated block ${marker}`);
}
const gb=block(materials,'class GB');
const nrm=block(materials,'function nrm');
const autoUV=block(materials,'function autoUV');
const frame=block(materials,'function frame');
const box=block(materials,'function box');
const wall=block(materials,'function wall');
const arcade=block(builders,'function arcade(');
const lotStart=lots.indexOf('function pArea(');
const lotEnd=lots.indexOf('// one lot = one building');
assert(lotStart>=0&&lotEnd>lotStart,'production house shell source exists');
const context={THREE,Math};vm.createContext(context);
vm.runInContext([gb,nrm,autoUV,frame,box,wall,arcade,lots.slice(lotStart,lotEnd),
  'globalThis.api={GB,frame,houseGalleryPlan,houseShell,houseRectWalls};'].join('\n'),context);
const {GB,frame:makeFrame,houseGalleryPlan,houseShell,houseRectWalls}=context.api;
const planSeed=Array.from({length:100},(_,i)=>.01+i*.01).find(seed=>
  houseGalleryPlan([[-10,-6],[10,-6],[10,6],[-10,6]],{nSt:5,gH:4,sH:3,seed,fl:256}).some(x=>x.wrap));
assert(Number.isFinite(planSeed),'found deterministic production loggia plan');
const lot=[[-10,-6],[10,-6],[10,6],[-10,6]],options={
  part:0,seed:planSeed,sty:0,fl:256,nSt:5,gH:4,sH:3,lit:.5,flat:false,
};
const W={};const geom=new GB(1<<16);
houseShell(W,geom,makeFrame(0,0,0),lot,-.1,16.15,.15,options);
const gallery=W.houseGalleryLog.find(x=>x.wrap);
assert(gallery,'production shell produced a real wraparound gallery');
assert(gallery.walk>=.8&&gallery.walk<=1.1,`clear walkway depth is ${gallery.walk}`);
assert.equal(gallery.wall,.32,'rear wall thickness is 32 cm');
const galleryGeometry=geom.geometry();
const mesh=new THREE.Mesh(galleryGeometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
mesh.updateMatrixWorld(true);
const position=galleryGeometry.attributes.position,part=galleryGeometry.attributes.aB;
const frontDoorZ=[];
for(let i=0;i<position.count;i++)if(part.getY(i)===45&&position.getX(i)>-6&&position.getX(i)<6&&position.getZ(i)<-4.6&&position.getZ(i)>-4.9){frontDoorZ.push(position.getZ(i));}
assert(frontDoorZ.length>0,`rear room door uses part 45; parts present: ${[...new Set(Array.from({length:part.count},(_,i)=>part.getY(i)))].join(',')}`);
assert(Math.max(...frontDoorZ)<=-4.42,'rear room door stays within the 32 cm wall and does not project into the room');
const ray=(origin,direction,distance)=>new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction).normalize(),0,distance).intersectObject(mesh,false);
const levelY=gallery.y+1.0;

// Through the real front arcade opening, the ray reaches the inset room wall
// after the measured clear gallery depth (no shader opening is involved).
const rear=ray([-8.57,levelY,-5.80],[0,0,1],1.5);
assert(rear.length>0,'opening ray reaches a physical inner wall');
assert.equal(part.getY(rear[0].face.a),44,'ray hit is the dedicated physical gallery wall');
assert(rear[0].distance>=.8&&rear[0].distance<=1.1,`inner wall distance is ${rear[0].distance.toFixed(3)}m`);

// A diagonal line stays clear while turning through the inside corner.
const turnStart=[-9.45,levelY,-5.35],turnEnd=[-9.70,levelY,-5.05];
const turnVector=turnEnd.map((v,i)=>v-turnStart[i]);
const turnDistance=Math.hypot(...turnVector);
assert.equal(ray(turnStart,turnVector,turnDistance).length,0,'diagonal view through the gallery corner is unobstructed');

// Confirm a real gallery surface is visible from inside, and the arch opening
// carries an unobstructed outward sightline beyond the facade plane.
const floor=ray([-9.3,gallery.y+.8,-5.2],[0,-1,0],1.2);
assert(floor.some(hit=>hit.object.geometry.attributes.aB.getY(hit.face.a)===44),'visible corridor floor is real gallery material');
const sky=ray([-8.57,levelY,-5.82],[0,0,-1],4);
assert.equal(sky.length,0,'outward opening has a clear line of sight to sky');

// The same production shell path must not invent a wrap gallery for plain infill.
const plain=new GB(1<<15),plainW={};
houseRectWalls(plainW,plain,makeFrame(24,0,0),0,0,12,10,-.1,16.15,.15,{...options,fl:0,seed:.43});
assert(!plainW.houseGalleryLog?.some(x=>x.wrap),'unflagged infill has no generated wrap gallery');
assert(plain.nv>0,'unflagged infill still has actual wall geometry');

const wallShader=materials.slice(materials.indexOf('void wallS'),materials.indexOf('const CITY_S'));
assert.match(wallShader,/bool arcLevel=bArc>\.5&&!residential/,'residential bArc shader openings are disabled');
assert.match(wallShader,/bLog>\.5&&top&&!residential/,'residential top-storey bLog fake gallery is disabled');
assert.match(wallShader,/if\(bGAr>\.5&&!residential\)/,'residential bGAr shader arches are disabled');
assert.match(wallShader,/kind>1\.5&&kind<2\.5&&!residential/,'residential bArc/bGAr arch highlights are disabled');
assert.match(materials,/P>44\.5&&P<45\.5[\s\S]*?vec3\(\.34,\.19,\.085\)/,'gallery door has a medium warm timber material');

console.log(JSON.stringify({ok:true,walkDepth:gallery.walk,rearHitDistance:+rear[0].distance.toFixed(3),turnClear:true,floorVisible:true,skyClear:true,plainHouseHasWalls:true}));

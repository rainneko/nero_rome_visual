/* Farmland outside the walls (author, 2026-10-26: olive groves, vineyards, fields that change with the season). One crop map, made once in
   buildRome: the terrain shader colours every field by its crop and the season (uFarm, MAT.terrain in builders.js), and the same map plants
   the olive groves' trees, so the trees and the painted ground agree.
   【史】The Campagna c. AD 60 after Cato, Varro and Columella: grain (wheat, emmer, barley), vineyards on stakes, olive groves, hay meadows and
   pasture, beans and lentils, flax, fallow; near the walls market gardens and rose beds for garlands. No lavender fields: lavender grew wild on
   dry hills, the fields are modern Provence.
   Season (uSeason): 0 spring, 1 summer, 2 autumn, 3 winter. */
const FARM={NONE:0,GRAIN:1,VINE:2,OLIVE:3,MEADOW:4,BEANS:5,FLAX:6,FALLOW:7,GARDEN:8,ROSES:9},FARM_CS=10;
// the field a point belongs to: a 150 m grid warped by noise (organic boundaries), id = the warped cell
function farmCell(x,z){const u=x/150+(fbm(x*.0028+3.1,z*.0028,3)-.5)*1.5,v=z/150+(fbm(x*.0028,z*.0028+8.7,3)-.5)*1.5;return[Math.floor(u),Math.floor(v)];}
// what a field grows: near the walls gardens, roses and vines; on the river flats meadow; on slopes olives and vines; in the open country grain
function farmCrop(W,i,j){const h=hash2(i*7+13,j*11+5),cx=(i+.5)*150,cz=(j+.5)*150,near=1-sstep(1700,2600,Math.hypot(cx-150,(cz-250)*.92));
  const sl=Math.hypot(W.gy(cx+20,cz)-W.gy(cx-20,cz),W.gy(cx,cz+20)-W.gy(cx,cz-20))/40,[rd]=polyDist(cx,cz,TIBER),flat=rd<RTW+260;
  const T=[[FARM.GRAIN,.30],[FARM.VINE,.18],[FARM.OLIVE,.15],[FARM.MEADOW,.12],[FARM.BEANS,.08],[FARM.FLAX,.05],[FARM.FALLOW,.08],[FARM.GARDEN,.03],[FARM.ROSES,.01]].map(([t,p])=>{
    if(near>.3)p*={[FARM.GARDEN]:6,[FARM.ROSES]:5,[FARM.VINE]:1.3,[FARM.GRAIN]:.6,[FARM.FALLOW]:.5}[t]||1;
    if(sl>.12)p*={[FARM.OLIVE]:3,[FARM.VINE]:2,[FARM.GRAIN]:.3,[FARM.MEADOW]:.4,[FARM.GARDEN]:.2,[FARM.FLAX]:.2}[t]||1;
    if(flat)p*={[FARM.MEADOW]:2.5,[FARM.GARDEN]:1.5,[FARM.OLIVE]:.4}[t]||1;return[t,p];});
  const sum=T.reduce((a,b)=>a+b[1],0);let a=0;for(const[t,p]of T){a+=p/sum;if(h<a)return t;}return FARM.GRAIN;}
// RGBA crop map over the Rome terrain grid: R crop, G field hash (row direction, variety), B 255 on a field boundary (a path or hedge)
function buildFarmland(W){const g=W.grid,x0=g.x0,z0=g.z0,nx=Math.ceil((g.x1-g.x0)/FARM_CS),nz=Math.ceil((g.z1-g.z0)/FARM_CS),id=new Int32Array(nx*nz),D=new Uint8Array(nx*nz*4),crop=new Map();
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const[a,b]=farmCell(x0+(i+.5)*FARM_CS,z0+(j+.5)*FARM_CS),k=j*nx+i,key=a*4096+b;id[k]=key;
    let c=crop.get(key);if(c===undefined){c=farmCrop(W,a,b);crop.set(key,c);}D[k*4]=c;D[k*4+1]=Math.floor(hash2(a*3+1,b*5+2)*255);D[k*4+3]=255;}
  for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(id[k]!==id[k+1]||id[k]!==id[k+nx])D[k*4+2]=255;}
  const t=new THREE.DataTexture(D,nx,nz,THREE.RGBAFormat,THREE.UnsignedByteType);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;t.needsUpdate=true;
  U.uFarm.value=t;U.uFarmX.value.set(x0,z0,nx*FARM_CS,nz*FARM_CS);
  W.farm={x0,z0,nx,nz,cs:FARM_CS,D,at:(x,z)=>{const i=Math.floor((x-x0)/FARM_CS),j=Math.floor((z-z0)/FARM_CS);return i<0||j<0||i>=nx||j>=nz?0:D[(j*nx+i)*4];}};
  const n={};for(const c of crop.values())n[c]=(n[c]||0)+1;W.farmStats=n;return W.farm;}
// olive groves get real trees in rows (quincunx, 9 m) where they can be seen: within o.r of the city, clear of roads, buildings and water
function plantOliveGroves(W,o){const F=W.farm;if(!F)return 0;const R=RNG(4711),lim=o.lim;let n=0;
  for(let z=-2700;z<3400&&n<lim;z+=9)for(let x=-3100;x<2700&&n<lim;x+=9){const px=x+((Math.round(z/9)&1)?4.5:0)+(R()-.5)*1.6,pz=z+(R()-.5)*1.6;
    if(F.at(px,pz)!==FARM.OLIVE||Math.hypot(px-150,pz-250)>o.r||romeUrban(px,pz)>.3)continue;
    if(polyDist(px,pz,TIBER)[0]<RTW+10||W.foot.hits(px,pz,2.4,2.4,0,0))continue;
    W.trees.push([px,W.gy(px,pz),pz,'olive',.55+R()*.25,[.12,.13,.095]]);n++;}   // silvery olive leaf
  return n;}

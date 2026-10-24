// Reads the Palatine hill GLBs and writes src/scenes/rome/palrock.js: for every asset whose rock was rebuilt as ledge rock
// (see briefs/rome/rock_and_base.md) the outline of its footprint and the grid of its lowest heights, in the model's own axes.
// palShape() sets the terrain under it to that foot and blends to the slope outside. Run:  node tools/pal_rock.mjs [--all]   (by default every hill GLB with any rock material is included; without rock2/moss only with --all, kept for compatibility)
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'assets/models/rome'),ALL=process.argv.includes('--all');
const NAMES=['rome_tiberiana','rome_transitoria','rome_apollo','rome_domus_augusti','rome_magna_mater','rome_victoria','rome_domus_a','rome_domus_b'];
const mul=(a,b)=>{const o=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)o[j*4+i]+=a[k*4+i]*b[j*4+k];return o;};
const loc=n=>{if(n.matrix)return n.matrix;const t=n.translation||[0,0,0],q=n.rotation||[0,0,0,1],s=n.scale||[1,1,1],[x,y,z,w]=q;
  const m=[1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w),0,2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w),0,2*(x*z+y*w),2*(y*z-x*w),1-2*(x*x+y*y),0,t[0],t[1],t[2],1];
  for(let i=0;i<3;i++){m[i]*=s[0];m[4+i]*=s[1];m[8+i]*=s[2];}return m;};
function modelPts(file){const b=fs.readFileSync(file),jl=b.readUInt32LE(12),j=JSON.parse(b.slice(20,20+jl).toString()),bin=b.slice(20+jl+8),out=[],names=j.materials.map(m=>m.name),has=names.some(n=>/^rock/.test(n));
  const rd=(acc,k,comp)=>{const bv=j.bufferViews[acc.bufferView],off=(bv.byteOffset||0)+(acc.byteOffset||0),sz=acc.componentType===5126?4:acc.componentType===5125?4:2,st=bv.byteStride||sz*comp;
    return (i,c)=>acc.componentType===5126?bin.readFloatLE(off+i*st+c*4):acc.componentType===5125?bin.readUInt32LE(off+i*st):bin.readUInt16LE(off+i*st);};
  const walk=(i,P)=>{const n=j.nodes[i],M=mul(P,loc(n));if(n.mesh!==undefined)for(const p of j.meshes[n.mesh].primitives){const pa=j.accessors[p.attributes.POSITION],pos=rd(pa,0,3),idx=p.indices!==undefined?rd(j.accessors[p.indices],0,1):null,nT=(idx?j.accessors[p.indices].count:pa.count)/3,
      V=k=>{const x=pos(k,0),y=pos(k,1),z=pos(k,2);return[0,1,2].map(r=>M[r]*x+M[4+r]*y+M[8+r]*z+M[12+r]);};
    for(let t=0;t<nT;t++){const a=V(idx?idx(t*3):t*3),b2=V(idx?idx(t*3+1):t*3+1),c=V(idx?idx(t*3+2):t*3+2),L=Math.max(Math.hypot(a[0]-b2[0],a[1]-b2[1],a[2]-b2[2]),Math.hypot(c[0]-b2[0],c[1]-b2[1],c[2]-b2[2]),Math.hypot(a[0]-c[0],a[1]-c[1],a[2]-c[2])),k=Math.min(30,Math.max(1,Math.ceil(L/2)));
      for(let u=0;u<=k;u++)for(let w=0;w<=k-u;w++){const z0=1-u/k-w/k;out.push([a[0]*z0+b2[0]*u/k+c[0]*w/k,a[1]*z0+b2[1]*u/k+c[1]*w/k,a[2]*z0+b2[2]*u/k+c[2]*w/k]);}}}
    (n.children||[]).forEach(c=>walk(c,M));};
  for(const r of j.scenes[j.scene||0].nodes)walk(r,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);return{pts:out,has};}
function hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),L=[],U=[];
  for(const p of P){while(L.length>1&&cr(L[L.length-2],L[L.length-1],p)<=0)L.pop();L.push(p);}for(const p of P.slice().reverse()){while(U.length>1&&cr(U[U.length-2],U[U.length-1],p)<=0)U.pop();U.push(p);}L.pop();U.pop();return L.concat(U);}
function simplify(H,n){while(H.length>n){let bi=0,ba=1e18;for(let i=0;i<H.length;i++){const a=H[(i+H.length-1)%H.length],b=H[i],c=H[(i+1)%H.length],ar=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));if(ar<ba){ba=ar;bi=i;}}H.splice(bi,1);}return H;}
const R={},CS=4;
for(const n of NAMES){const f=path.join(dir,n+'.glb');if(!fs.existsSync(f))continue;const{pts:all,has}=modelPts(f);if(!all.length)continue;
  // model y is up, x/z are the horizontal axes. Surface samples of the whole model: foot grid = lowest y per 4 m cell, only where something reaches down to the floor level
  // (a cell whose lowest surface is an eave or a balcony high above the floor is no support); outline = hull of those supported cells; the grid is dilated outwards so the
  // terrain can follow it beyond the rim. Rock-free assets work too (their walls become the foot).
  let minY=1e9,maxY=-1e9,x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of all){minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);}
  const gx=Math.floor((x0-28)/CS),gz=Math.floor((z0-28)/CS),nx=Math.ceil((x1+28)/CS)-gx+1,nz=Math.ceil((z1+28)/CS)-gz+1,G=new Float32Array(nx*nz).fill(NaN),at=new Array(nx*nz);
  for(const p of all){const i=Math.floor(p[0]/CS)-gx,j=Math.floor(p[2]/CS)-gz,k=j*nx+i;if(!(G[k]<=p[1])){G[k]=p[1];at[k]=p;}}
  const sup=[];for(let k=0;k<G.length;k++){if(!Number.isNaN(G[k])&&G[k]>.5)G[k]=NaN;else if(!Number.isNaN(G[k]))sup.push([at[k][0],at[k][2]]);}
  const H=simplify(hull(sup),24).map(p=>[+p[0].toFixed(1),+p[1].toFixed(1)]);
  for(let it=0;it<60;it++){let left=0;const N=G.slice();for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(!Number.isNaN(G[k]))continue;let s2=0,c=0;
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const v=G[jj*nx+ii];if(!Number.isNaN(v)){s2+=v;c++;}}if(c)N[k]=s2/c;else left++;}G.set(N);if(!left)break;}
  for(let k=0;k<G.length;k++)if(Number.isNaN(G[k]))G[k]=minY;
  {const G0=G.slice();for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let m=-1e9;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;m=Math.max(m,G0[jj*nx+ii]);}
    G[j*nx+i]=Math.min(m,G0[j*nx+i]+2.5);}}   // cliffs: the ledges step by metres between cells, the terrain mesh cannot follow a step, so each cell takes the higher of its neighbours' feet (at most 2.5 m above its own): the rim meets the rock face, nothing hangs
  R[n]={foot:+minY.toFixed(1),top:+maxY.toFixed(1),rock:has,pts:H,g:{x0:gx*CS,z0:gz*CS,cs:CS,nx,nz,h:Array.from(G,v=>Math.round(v*10))}};}
const txt='/* generated by tools/pal_rock.mjs from the hill GLBs: outline (model x,z) of the supported footprint and a grid g of the lowest model height per 4 m cell (dm, model y); do not edit */\nconst PAL_ROCK='+JSON.stringify(R)+';\n';
fs.writeFileSync(path.join(root,'src/scenes/rome/palrock.js'),txt);console.log('palrock.js:',Object.keys(R).map(k=>k.replace('rome_','')+' foot '+R[k].foot+' ('+R[k].g.nx+'x'+R[k].g.nz+')').join('; ')||'(none)',(txt.length/1024).toFixed(0)+' KB');

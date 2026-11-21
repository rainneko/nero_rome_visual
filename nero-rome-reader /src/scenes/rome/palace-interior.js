/* The walkable inside of the East palace (Domus Transitoria): briefs/rome/transitoria-interior.md, built from the plan by
   tools/models/rome/rome_transitoria_interior.py into assets/models/rome/rome_transitoria_interior.glb.
   It is its own pack (dist/transitoria-interior.js, window.TRI_GLB; build.config.json lazy), fetched only when a reader is walking
   (first person) within TRI.NEAR m of the palace: a reader who only reads or flies round never downloads it.
   It shows only while walking. It casts no shadow; like every visible mesh it is drawn into the walker's height picture (fp.js FPM),
   so its floors, stairs and walls are what the walker stands on and runs into.
   While it shows, the shell's own faces where the inside has its walls and doorways (the porticoes' painted back walls, the two terrace
   windows that become doors, the two loggia floors that get stair openings) are taken out of the shell's index: the boxes come with the
   model (node extras `cuts`, model axes x east, y north, z up; a seventh entry names the only material a box takes, as the
   eave tiles of a neighbouring roof that hang inside a room). Leaving the walk puts the shell's own index back; its file is not changed.
   Load near, release far (briefs/rome/transitoria-v3/item1-zone-packs.md): the walls and floors come within TRI.NEAR m and are let go
   (taken out of the scene, geometry and materials disposed, the pack's text dropped, the shell's index put back) beyond TRI.GONE m or
   when the walk ends. The furnishings are zone packs of their own (TRF below), nearer still. */
const TRI={load:0,G:null,cuts:null,rooms:null,shell:[],on:false,NEAR:140,GONE:220,tag:null,gen:0,loads:0,frees:0};
function triInit(W){if(TRI.init)return;TRI.init=1;W.anim.push(triTick);}
function triPlace(){return ROME.GLB.find(p=>p.n==='rome_transitoria');}
function triTick(){if(typeof FP==='undefined')return;const p=triPlace();if(!p||!p.obj)return;
  const d=Math.hypot(FP.x-p.x,FP.z-p.z);
  if(FP.on&&!TRI.load&&d<TRI.NEAR)triLoad(p);
  if(TRI.load&&TRI.load<4&&(!FP.on||d>TRI.GONE)){trfFreeAll();triFree(p);return;}
  const on=!!(FP.on&&TRI.G);
  if(on!==TRI.on){TRI.on=on;TRI.G.visible=on;triCut(p,on);triRedraw();}
  if(on)trfTick(p);}
// the walker's picture: draw it again now (what he stands on and runs into has changed)
function triRedraw(){if(typeof FPM!=='undefined'&&FPM.ready&&FP.on){FPM.sig=-1;if(!FPM.job){FPM.job=FPM.jobAt(FP.x,FP.z,FP.g);FPM.job.moved=FPM.job.force=true;}}}
// everything a loaded model holds on the graphics card. Materials only: the surface patterns' textures are shared with the city.
function triDispose(G){if(G.parent)G.parent.remove(G);const M=new Set();G.traverse(o=>{if(!o.isMesh)return;o.geometry.dispose();for(const m of [].concat(o.material))M.add(m);});for(const m of M)m.dispose();}
function triFree(p){TRI.gen++;if(TRI.on){TRI.on=false;triCut(p,false);}TRI.shell=[];TRI.cutN=0;if(TRI.G)triDispose(TRI.G);TRI.G=null;TRI.cuts=TRI.rooms=null;
  window.TRI_GLB=null;window.triAssetsLoaded=null;if(TRI.tag){TRI.tag.remove();TRI.tag=null;}TRI.load=0;TRI.frees++;triRedraw();}
function triLoad(p){TRI.load=1;TRI.loads++;const gen=TRI.gen;
  const go=async()=>{const D=window.TRI_GLB,n='rome_transitoria_interior';if(!D||!D[n]){TRI.load=4;return;}TRI.load=2;
    try{const raw=b64u8(D[n]),buf=window.TRI_GLB_gz?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw.buffer;
      const gl=await new Promise((ok,bad)=>new THREE.GLTFLoader().parse(buf,'',ok,bad)),G=layTag(gl.scene,'models');
      if(gen!==TRI.gen){triDispose(G);return;}
      G.traverse(o=>{if(o.userData&&o.userData.cuts){TRI.cuts=o.userData.cuts;TRI.rooms=o.userData.rooms||null;}if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;romeMat(o.material);});
      G.name='transitoria_interior';G.position.set(p.x,p.y,p.z);G.rotation.y=p.r;G.visible=false;W0.scene.add(G);TRI.G=G;TRI.load=3;}
    catch(e){console.warn('transitoria interior',e);TRI.load=4;}};
  if(window.TRI_GLB){go();return;}window.triAssetsLoaded=go;const s=TRI.tag=document.createElement('script');s.src='transitoria-interior.js';
  s.onerror=()=>{console.warn('transitoria-interior.js not found: the palace stays a shell');TRI.load=4;};document.head.appendChild(s);}
// the shell's triangles wholly inside a cut box leave its index while the inside shows (and come back after)
function triCut(p,on){if(!TRI.cuts||!TRI.cuts.length)return;
  if(!TRI.shell.length){const inv=new THREE.Matrix4(),M=new THREE.Matrix4(),v=new THREE.Vector3(),B=TRI.cuts;p.obj.updateMatrixWorld(true);inv.copy(p.obj.matrixWorld).invert();
    p.obj.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const g=o.geometry,P=g.attributes.position;if(!P)return;M.multiplyMatrices(inv,o.matrixWorld);
      const n=P.count,inB=new Uint8Array(n*B.length),mn=o.material&&o.material.name;
      for(let i=0;i<n;i++){v.fromBufferAttribute(P,i).applyMatrix4(M);const x=v.x,y=-v.z,z=v.y;   // glTF y up to the model's z up
        for(let b=0;b<B.length;b++){const q=B[b];if(q[6]&&q[6]!==mn)continue;if(x>=q[0]-1e-3&&y>=q[1]-1e-3&&z>=q[2]-1e-3&&x<=q[3]+1e-3&&y<=q[4]+1e-3&&z<=q[5]+1e-3)inB[i*B.length+b]=1;}}
      const I0=g.index?g.index.array:Uint32Array.from({length:n},(_,i)=>i),keep=[];let cut=0;
      for(let t=0;t<I0.length;t+=3){const a=I0[t],b=I0[t+1],c=I0[t+2];let gone=false;for(let k=0;k<B.length&&!gone;k++)gone=inB[a*B.length+k]&&inB[b*B.length+k]&&inB[c*B.length+k];if(gone)cut++;else keep.push(a,b,c);}
      if(cut)TRI.shell.push({g,full:g.index,part:new THREE.BufferAttribute(n>65535?Uint32Array.from(keep):Uint16Array.from(keep),1),cut});});
    TRI.cutN=TRI.shell.reduce((s,e)=>s+e.cut,0);}
  for(const e of TRI.shell)e.g.setIndex(on?e.part:e.full);}
window.__tri=()=>({load:TRI.load,on:TRI.on,loads:TRI.loads,frees:TRI.frees,cuts:TRI.cuts&&TRI.cuts.length,cutTris:TRI.cutN||0,tris:TRI.G?(()=>{let n=0;TRI.G.traverse(o=>{if(o.isMesh)n+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});return n;})():0});
// tests: model (x east, y north, z up) to world [x, y, z]
window.__triW=(x,y,z)=>{const p=triPlace(),c=Math.cos(p.r),s=Math.sin(p.r),gx=x,gz=-y;return[p.x+c*gx+s*gz,p.y+(z||0),p.z-s*gx+c*gz];};

/* ---- The furnishings: zone packs, loaded near and released far (the author, 2026-11-21: more faces are fine as long as they are let
   go at a distance and loaded again near). A zone is a rectangle of the plan (model axes) and a pack (build.config.json lazy, one GLB
   per work order, each a top object `interior` with `room_<id>` under it). On foot, every TRF.EVERY s:
     within TRF.NEAR m of the zone's rectangle   fetch the pack, parse one GLB a frame, add it hidden
     beyond TRF.FAR m, or the walk ends          take it out, dispose it, drop the pack's text and its script tag
   Of what is loaded only the room the reader stands in and the rooms it opens to are shown (the room table comes with the walls'
   model, extras `rooms`), nearest first up to TRF.SHOW faces. The low tier and phones load none: the inside stays light there. */
const TRF={NEAR:45,FAR:90,EVERY:.3,SHOW:45000,t:0,room:'',shown:0,held:0,
  Z:[{k:'s',file:'transitoria-fit-s.js',v:'TRF_S_GLB',box:[-56,-46,56,-24],st:0,G:[],tag:null,gen:0,loads:0,frees:0}]};
function trfOK(){return !(isTouch||small)&&perfMode!=='smooth';}
// the reader's feet in the model's axes (x east, y north, z up)
function triM(p){const c=Math.cos(p.r),s=Math.sin(p.r),dx=FP.x-p.x,dz=FP.z-p.z;return[c*dx-s*dz,-(s*dx+c*dz),FP.g-p.y];}
function trfDist(m,b){return Math.hypot(Math.max(b[0]-m[0],0,m[0]-b[2]),Math.max(b[1]-m[1],0,m[1]-b[3]));}
function trfTick(p){const now=performance.now()/1000;if(now-TRF.t<TRF.EVERY)return;TRF.t=now;const m=triM(p);let ch=false;
  for(const Z of TRF.Z){const d=trfDist(m,Z.box);if(!Z.st&&d<=TRF.NEAR&&trfOK())trfLoad(Z,p);else if(Z.st&&Z.st<4&&d>TRF.FAR){trfFree(Z);ch=true;}}
  if(trfShow(m)||ch)triRedraw();}
function trfLoad(Z,p){Z.st=1;Z.loads++;const gen=Z.gen;
  const go=async()=>{const D=window[Z.v];if(gen!==Z.gen)return;if(!D){Z.st=4;return;}Z.st=2;
    try{for(const n of Object.keys(D)){const raw=b64u8(D[n]),buf=window[Z.v+'_gz']?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw.buffer;
        const gl=await new Promise((ok,bad)=>new THREE.GLTFLoader().parse(buf,'',ok,bad)),G=layTag(gl.scene,'models');
        if(gen!==Z.gen){triDispose(G);return;}
        G.traverse(o=>{if(o.name&&o.name.indexOf('room_')===0&&!(o.parent&&o.parent.userData.room)){   // a room's own meshes are named after it too (room_S09_1): the room is the outer one
          o.visible=false;o.userData.room=o.name.slice(5);let t=0;o.traverse(q=>{if(q.isMesh)t+=(q.geometry.index?q.geometry.index.count:q.geometry.attributes.position.count)/3;});o.userData.tris=t;}
          if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;romeMat(o.material);});
        G.name='transitoria_fit_'+n;G.position.set(p.x,p.y,p.z);G.rotation.y=p.r;W0.scene.add(G);Z.G.push(G);
        await new Promise(requestAnimationFrame);if(gen!==Z.gen)return;}                       // one model a frame
      Z.st=3;TRF.t=0;}
    catch(e){console.warn('transitoria furnishings',Z.k,e);Z.st=4;}};
  const s=Z.tag=document.createElement('script');s.src=Z.file;s.onload=go;s.onerror=()=>{console.warn(Z.file+' not found: the rooms stay bare');Z.st=4;};document.head.appendChild(s);}
function trfFree(Z){Z.gen++;for(const G of Z.G)triDispose(G);Z.G=[];window[Z.v]=null;if(Z.tag){Z.tag.remove();Z.tag=null;}if(Z.st!==4)Z.st=0;Z.frees++;}
function trfFreeAll(){for(const Z of TRF.Z)if(Z.st&&Z.st<4)trfFree(Z);TRF.room='';TRF.shown=TRF.held=0;}
// which rooms' things show: the room the reader is in and those it opens to; outside every room, the rooms within 15 m
function trfShow(m){const R=TRI.rooms;if(!R)return false;const here=[],want=new Map();
  for(const r of R)if(m[0]>=r[1]&&m[0]<=r[3]&&m[1]>=r[2]&&m[1]<=r[4]&&m[2]>=r[5]-.6&&m[2]<r[6]-.6)here.push(r);
  for(const r of here){want.set(r[0],0);for(const id of r[7])if(!want.has(id))want.set(id,1);}
  let held=0,ch=false;const L=[];
  for(const Z of TRF.Z)for(const G of Z.G)G.traverse(o=>{const id=o.userData.room;if(!id)return;held+=o.userData.tris;const r=R.find(q=>q[0]===id),d=r?trfDist(m,r.slice(1,5)):1e9;
    if(want.has(id)||(!here.length&&d<15))L.push([want.get(id)===0?-1:d,o]);else if(o.visible){o.visible=false;ch=true;}});
  L.sort((a,b)=>a[0]-b[0]);let n=0;
  for(const [d,o] of L){const on=d<0||n+o.userData.tris<=TRF.SHOW;if(on)n+=o.userData.tris;if(o.visible!==on){o.visible=on;ch=true;}}
  TRF.room=here.map(r=>r[0]).join(' ');TRF.shown=n;TRF.held=held;return ch;}
window.__trf=()=>({ok:trfOK(),room:TRF.room,shown:TRF.shown,held:TRF.held,zones:TRF.Z.map(Z=>({k:Z.k,st:Z.st,models:Z.G.length,loads:Z.loads,frees:Z.frees,text:!!window[Z.v],tag:!!Z.tag}))});

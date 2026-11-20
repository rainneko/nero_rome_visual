/* The walkable inside of the East palace (Domus Transitoria): briefs/rome/transitoria-interior.md, built from the plan by
   tools/models/rome/rome_transitoria_interior.py into assets/models/rome/rome_transitoria_interior.glb.
   It is its own pack (dist/transitoria-interior.js, window.TRI_GLB; build.config.json lazy), fetched only when a reader is walking
   (first person) within TRI.NEAR m of the palace: a reader who only reads or flies round never downloads it.
   It shows only while walking. It casts no shadow; like every visible mesh it is drawn into the walker's height picture (fp.js FPM),
   so its floors, stairs and walls are what the walker stands on and runs into.
   While it shows, the shell's own faces where the inside has its walls and doorways (the porticoes' painted back walls, the two terrace
   windows that become doors, the two loggia floors that get stair openings) are taken out of the shell's index: the boxes come with the
   model (node extras `cuts`, model axes x east, y north, z up; a seventh entry names the only material a box takes, as the
   eave tiles of a neighbouring roof that hang inside a room). Leaving the walk puts the shell's own index back; its file is not changed. */
const TRI={load:0,G:null,cuts:null,shell:[],on:false,NEAR:140};
function triInit(W){if(TRI.init)return;TRI.init=1;W.anim.push(triTick);}
function triPlace(){return ROME.GLB.find(p=>p.n==='rome_transitoria');}
function triTick(){if(typeof FP==='undefined')return;const p=triPlace();if(!p||!p.obj)return;
  if(FP.on&&!TRI.load&&Math.hypot(FP.x-p.x,FP.z-p.z)<TRI.NEAR)triLoad(p);
  const on=!!(FP.on&&TRI.G);if(on===TRI.on)return;TRI.on=on;TRI.G.visible=on;triCut(p,on);
  if(typeof FPM!=='undefined'&&FPM.ready&&FP.on){FPM.sig=-1;if(!FPM.job){FPM.job=FPM.jobAt(FP.x,FP.z,FP.g);FPM.job.moved=FPM.job.force=true;}}}   // the walker's picture: draw it again now
function triLoad(p){TRI.load=1;
  const go=async()=>{const D=window.TRI_GLB,n='rome_transitoria_interior';if(!D||!D[n]){TRI.load=4;return;}TRI.load=2;
    try{const raw=b64u8(D[n]),buf=window.TRI_GLB_gz?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw.buffer;
      const gl=await new Promise((ok,bad)=>new THREE.GLTFLoader().parse(buf,'',ok,bad)),G=layTag(gl.scene,'models');
      G.traverse(o=>{if(o.userData&&o.userData.cuts)TRI.cuts=o.userData.cuts;if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;romeMat(o.material);});
      G.name='transitoria_interior';G.position.set(p.x,p.y,p.z);G.rotation.y=p.r;G.visible=false;W0.scene.add(G);TRI.G=G;TRI.load=3;}
    catch(e){console.warn('transitoria interior',e);TRI.load=4;}};
  if(window.TRI_GLB){go();return;}window.triAssetsLoaded=go;const s=document.createElement('script');s.src='transitoria-interior.js';
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
window.__tri=()=>({load:TRI.load,on:TRI.on,cuts:TRI.cuts&&TRI.cuts.length,cutTris:TRI.cutN||0,tris:TRI.G?(()=>{let n=0;TRI.G.traverse(o=>{if(o.isMesh)n+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;});return n;})():0});
// tests: model (x east, y north, z up) to world [x, y, z]
window.__triW=(x,y,z)=>{const p=triPlace(),c=Math.cos(p.r),s=Math.sin(p.r),gx=x,gz=-y;return[p.x+c*gx+s*gz,p.y+(z||0),p.z-s*gx+c*gz];};

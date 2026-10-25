/* Construction stages of story layers (briefs/rome/construction/README.md).
   K0–K3 are GLBs in construction-assets.js (assets/models/construction/<id>/K<n>.glb), sharing the industrial-zone frame of layers.js;
   K4 is the finished procedural layer, K5 the same plus its smoke layer. Only one stage shows at a time; stages replace the old 'rise' animation.
   Which stage shows comes from the chapter being read (CONS_T below), or the finished stage when no chapter is known (state browsing).
   Stepping forward plays one stage every CONS_STEP ms with a short fade; going back, or opening a chapter directly, jumps. */
const CONS={ids:{furnaceA:{smoke:'smokeA'},chem:{smoke:'smokeChem'}},load:0,anim:null};
const CONS_STEP=1500,CONS_FADE=700;
// Chapter → stage. ch19: “早些年…烂泥沼” is the mud (K0); “一年前…这片烂泥便全归了公署” plays the year of building (ev.furnTL) up to K4; “最先闯入眼帘的是滚滚的浓烟” lights it (K5).
// chem: the open hearth is “还在吞银子” in ch25, “只规划了一座” in ch27, and built in ch29 (“在南岸足足摸索了四个月”, first steel “直到初秋”, then the smog).
const CONS_T={
  furnaceA:(ch,ev)=>ch<19?0:ch>19?5:ev.furnSmoke?5:ev.furnTL?4:0,
  chem:(ch,ev)=>ch<=24?0:ch<=27?1:ch===28?2:ch>29?5:ev.chemSmoke?5:ev.chemSteel?4:ev.chemBuild?3:2};
function consFrame(){return frB(-1190,2760,230,W0.gy(-1190,2760));}
function consMat(mt){const o=mt.name;   // material aliases from the review tool (tools/test/construction-stages.mjs stageMaterial)
  mt.name=({workbrick:'brick',redbrick:'brick',refractory:'stone',timber:'wood',woodraw:'wood',plank:'wood',mortar:'tuff'})[o]||o;romeMat(mt);
  if(o==='workbrick'||o==='redbrick')mt.color.setRGB(.26,.17,.105);if(o==='tile'||o==='tile2')mt.color.setRGB(.27,.16,.09);if(o==='timber'||o==='woodraw'||o==='plank')mt.color.setRGB(.16,.105,.055);}
function consLoad(){if(CONS.load)return;CONS.load=1;
  const go=async()=>{const D=window.CONS_GLB;if(!D)return;CONS.load=2;const F=consFrame();
    for(const n of Object.keys(D)){const [id,k]=n.split('/');if(!CONS.ids[id])continue;
      try{const raw=Uint8Array.from(atob(D[n]),c=>c.charCodeAt(0)),buf=window.CONS_GLB_gz?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw.buffer;
        const gl=await new Promise((ok,bad)=>new THREE.GLTFLoader().parse(buf,'',ok,bad)),G=gl.scene;
        G.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;for(const mt of[].concat(o.material)){consMat(mt);mt.userData.op=mt.opacity;}});
        G.name=id+'@'+k;G.position.set(F.ox,F.oy,F.oz);G.rotation.y=F.rot;G.visible=false;W0.scene.add(G);(CONS.ids[id].g||(CONS.ids[id].g={}))[+k.slice(1)]=G;}catch(e){console.warn('construction glb',n,e);}}
    CONS.load=3;for(const id in CONS.ids)CONS.ids[id].cur=null;consApply();};
  if(window.CONS_GLB){go();return;}window.consAssetsLoaded=go;const s=document.createElement('script');s.src='construction-assets.js';
  s.onerror=()=>{console.warn('construction-assets.js not found: finished layers only');CONS.load=4;};document.head.appendChild(s);}
function consInState(n){const S=STATES[curS];if(!S)return false;if(S.L.split(' ').includes(n))return true;const r=XL[n];return !!r&&curS>=r[0]&&curS<=r[1];}
// stage n of id becomes visible (k<4: its GLB; 4: native layer; 5: native + smoke); the stage it replaces fades out when it is a GLB
function consShow(id,k,fade){const C=CONS.ids[id],L=W0.layers,g=C.g||{},prev=C.cur;C.cur=k;
  const nat=consInState(id),sm=consInState(C.smoke);
  if(C.fade&&!fade){C.fade.G.visible=false;consOpacity(C.fade.G,1);C.fade=null;}
  for(const s in g)if(+s!==k&&!(fade&&+s===prev))g[s].visible=false;
  if(g[k]){g[k].visible=true;consOpacity(g[k],1);}
  if(L[id])L[id].visible=nat&&(k>=4||CONS.load===4);if(L[C.smoke])L[C.smoke].visible=sm&&k>=5;   // while the stage GLBs load, nothing stands there yet
  if(fade&&g[prev]&&prev!==k){C.fade={G:g[prev],t0:performance.now()};consOpacity(g[prev],1);}}
function consOpacity(G,a){G.traverse(o=>{if(!o.isMesh)return;for(const mt of[].concat(o.material)){const op=mt.userData.op??1;const tr=a<1||op<1;if(mt.transparent!==tr){mt.transparent=tr;mt.needsUpdate=true;}mt.opacity=op*a;mt.depthWrite=a>=1;}});}
// called at the end of applyGates (state or chapter change, paragraph trigger)
function consApply(){if(!W0||!W0.layers)return;const ch=W0.curCh,ev=W0.ev||{},now=performance.now();
  for(const id in CONS.ids){const C=CONS.ids[id],L=W0.layers[id];if(!L)continue;L.userData.rise=0;
    if(!consInState(id)){for(const s in C.g||{})C.g[s].visible=false;C.cur=null;C.goal=null;continue;}
    if(!CONS.load)consLoad();
    const goal=ch==null||ch>=40?5:CONS_T[id](ch,ev),fresh=C.cur==null;C.goal=goal;
    if(fresh&&ch==null&&CONS.load===3&&!CONS.instant){consShow(id,0);C.t=now;}   // state entry without a chapter: the build plays from the start
    else if(fresh||goal<C.cur||CONS.load!==3){consShow(id,goal);}
    else{consShow(id,C.cur);if(C.t==null)C.t=now-CONS_STEP;}}   // setState may have reset the layers: show the current stage again
  CONS.instant=false;if(!CONS.anim){CONS.anim=1;W0.anim.push(consTick);}}
function consTick(){const now=performance.now();
  for(const id in CONS.ids){const C=CONS.ids[id];
    if(C.fade){const a=1-(now-C.fade.t0)/CONS_FADE;if(a<=0){C.fade.G.visible=false;consOpacity(C.fade.G,1);C.fade=null;}else consOpacity(C.fade.G,a);}
    if(C.cur==null||C.goal==null||C.cur>=C.goal){C.t=null;continue;}
    if(now-C.t>=CONS_STEP){C.t=now;consShow(id,C.cur+1,true);}}}

/* ================= Rome hero models: placements, procedural stand-ins, lazy loader (dist/rome-assets.js) ================= */
// Each placement draws a procedural stand-in into its own group (with its own column instances), so the stand-in can be
// hidden when the GLB arrives. If rome-assets.js is missing the stand-ins stay.
const ROME={GLB:[],loadState:0};
// GLB material name -> procedural surface pattern in romeMat (1 ashlar, 2 brick, 3 marble, 4 slabs, 5 basalt polygons,
// 6 plaster, 7 modelled tiles, 8 vegetation, 9 flat roof slopes get tiles from the slope direction)
const ROME_PAT={tuff:1,stone:1,travertine:1,peperino:1,rock:10,rock3:10,rock4:10,brick:2,marble:3,paving:4,basalt:5,plaster:6,plaster2:6,plaster3:6,mud:6,tile:7,tile2:7,roof_tile:7,roof_rib:7,travertine_light:1,grass:8,moss:8,rock2:10,turf:11,hedge:8,ivy:8,gravel:8,roof:9,stucco:6,warmwall:6,warmstone:1,ivory:1,ash:1,panelred:6,courtyard:4,gallery_wall:6,gallery_floor:4};
const GL_ROMEPAT=`
float rpJ(float x,float per,float w){float aa=fwidth(x)*1.5+1e-4;float d=abs(fract(x/per+.5)-.5)*per;return 1.-smoothstep(w,w+aa,d);}
// the hills' wild grass through the year, as the terrain draws it (builders.js): green in winter and spring, straw in summer, with bare earth
// 1 on the Palatine, 0 off it: within 185-205 m of its ridge (HILLS in monuments.js, as hillPal)
float palHill(vec2 p){vec2 d=p-vec2(0.,280.),e=vec2(230.,40.);return 1.-smoothstep(185.,205.,length(d-e*clamp(dot(d,e)/dot(e,e),0.,1.)));}
vec3 hillGrass(vec2 p){float sS=uSeason,dryA=smoothstep(.4,.95,sS)*(1.-smoothstep(1.45,1.95,sS));
 vec3 gSp=vec3(.103,.345,.036),gAu=vec3(.038,.169,.037),gWi=vec3(.047,.169,.044);
 vec3 gS=sS<2.?mix(gSp,gAu,sS*.5):sS<3.?mix(gAu,gWi,sS-2.):mix(gWi,gSp,sS-3.);
 vec3 gr=gS*mix(.82,1.18,fbm2(p*.05));gr=mix(vec3(dot(gr,vec3(.3,.5,.2))),gr,.78);
 vec3 c=mix(gr,vec3(.54,.42,.16)*mix(.85,1.15,fbm2(p*.03+7.)),dryA*(.9+.1*fbm2(p*.02+3.)));
 c=mix(c,vec3(.25,.18,.1)*(.8+.35*fbm2(p*.3)),smoothstep(.62,.8,fbm2(p*.2+7.))*.6);
 return mix(vec3(dot(c,vec3(.3,.5,.2))),c,1.-.4*palHill(p));}   // H0: 40 % duller on the Palatine, as the terrain
vec3 romePat(vec3 c,vec3 wp,float pat){
 vec3 n=normalize(cross(dFdx(wp),dFdy(wp)));vec3 an=abs(n);bool flr=an.y>.7;
 vec2 uv=flr?wp.xz:(an.x>an.z?vec2(wp.z,wp.y):vec2(wp.x,wp.y));
 float far=smoothstep(.05,.22,fwidth(uv.x)+fwidth(uv.y));
 if(pat<1.5){float bh=flr?1.2:.6,bw=1.2;float row=floor(uv.y/bh);float u=uv.x+mod(row,2.)*bw*.5;
  float j=max(rpJ(uv.y,bh,.02),rpJ(u,bw,.02));float t=.86+.24*h12(vec2(floor(u/bw),row)+3.7);
  c*=mix(t*(1.-.32*j),1.,far)*(.9+.14*vn2(uv*.7));c*=1.-.12*smoothstep(.62,.85,fbm2(vec2(uv.x*.6,uv.y*.09)));}
 else if(pat<2.5){float row=floor(uv.y/.075);float u=uv.x+mod(row,2.)*.15;float j=max(rpJ(uv.y,.075,.009),rpJ(u,.3,.009));
  c*=mix((.84+.28*h12(vec2(floor(u/.3),row)))*(1.-.35*j),1.,far)*(.92+.12*vn2(uv*.5));c=mix(c,c*1.15+vec3(.04,.03,.02),rpJ(uv.y,1.2,.04)*(1.-far*.6));}
 else if(pat<3.5){c*=.95+.08*fbm3(wp*.35);c*=1.-.07*max(rpJ(uv.y,flr?1.5:.9,.008),rpJ(uv.x,1.8,.008))*(1.-far);}
 else if(pat<4.5){float row=floor(uv.y/1.4);float u=uv.x+mod(row,2.)*.9;float j=max(rpJ(uv.y,1.4,.014),rpJ(u,1.8,.014));c*=mix((.88+.18*h12(vec2(floor(u/1.8),row)))*(1.-.24*j),1.,far);}
 else if(pat<5.5){vec2 p=uv*1.4;vec2 ip=floor(p),fp=fract(p);float m1=8.,m2=8.;vec2 id=ip;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j);vec2 o=vec2(h12(ip+g),h12(ip+g+17.3));vec2 r=g+o-fp;float d=dot(r,r);if(d<m1){m2=m1;m1=d;id=ip+g;}else if(d<m2)m2=d;}
  c*=mix((.72+.5*h12(id))*mix(.5,1.,smoothstep(0.,.07,sqrt(m2)-sqrt(m1))),.95,far);}
 else if(pat<6.5){c*=(.9+.14*fbm2(uv*vec2(.25,.12)))*mix(1.,.85,smoothstep(.55,.8,fbm2(vec2(uv.x*1.3,uv.y*.15))));}
 else if(pat<7.5){c*=.88+.2*vn2(uv*vec2(2.1,1.));}
 else if(pat<8.5)c*=.8+.35*fbm2(wp.xz*.4);
 else if(pat>10.5){   // 'turf': the hill grass on ledges, soil slopes and scree (the GLB colour is only for the Blender previews). Round 3: the plain grass colour on
  // sunlit tongues read as yellow sheets, so the grass is duller and darker than the open hillside, and bare earth takes most of a steep face and patches of a flat one.
  vec3 g=hillGrass(wp.xz);g=mix(vec3(dot(g,vec3(.3,.5,.2))),g,.75)*vec3(.9,.95,.88)*(.74+.26*vn2(wp.xz*1.3));
  vec3 soil=mix(vec3(.27,.21,.13),vec3(.2,.155,.095),fbm2(wp.xz*.12+5.))*(.88+.24*vn2(wp.xz*2.3+wp.y*.7));   // the hill's earth, darker than its rock in sun
  float e=smoothstep(.42,.72,.55*fbm2(wp.xz*.3+3.1)+.25*vn2(wp.xz*1.7+wp.y)+.55*(1.-smoothstep(.5,.92,n.y)));c=mix(g,soil,e*.9);}
 else if(pat>9.5){   // natural rock (the hills' tufa and limestone)
  // H0 (palatine-masterplan.md M1): on the Palatine the models' rock (rock, rock2; the Tiberiana's darker rock3, rock4) is grade 1 of the hill's stone family:
  // the material's colour duller and its tones drawn together (rock a little darker, the Tiberiana's cliff a little lighter), before the pattern
  {float l=dot(c,vec3(.3,.59,.11)),l2=.222*pow(max(l,1e-4)/.2444,.42);c=mix(c,l2*vec3(1.127,.988,.719),palHill(wp.xz));}
  // wavy beds of uneven thickness (about 1.4-3.4 m), each its own tone, fractures at uneven spacing
  // through a few beds, ochre stains, dark rain streaks, the hill grass on up-facing ledges. (rock and rock2 used the ashlar courses of pattern 1, so the hill bases
  // read as cut stone or concrete: the author, 2026-11-03. Round 3, 2026-11-08: even 2.3 m beds with near-regular joints still read as courses on big faces.)
  // Every field here is a function of the world position alone: a pattern laid out in the face's own uv broke at each polygon edge
  // where the uv axes switch, and the breaks drew a ghost grid of straight lines over the big cliff faces (round 3).
  float st=wp.y+3.6*fbm2(wp.xz*.022)+1.1*fbm3(wp*vec3(.05,.22,.05))+.6*sin((wp.x-wp.z)*.08+wp.y*.07);float sb=st/2.3;sb+=.3*sin(sb*2.1+1.3)+.18*sin(sb*3.7+.4);
  float bed=floor(sb),lay=h12(vec2(bed,7.3));float seam=rpJ(sb,1.,.022+.03*lay)*(.55+.45*smoothstep(.3,.7,fbm2(wp.xz*.06+bed)));
  // joints: vertical fracture planes, the edges of a cell pattern in plan (cells about 7 m) that wander with height; each edge runs on
  // through a group of two to four beds and then stops (a joint per bed, offset bed by bed, read as brick courses)
  float grp=floor(sb*.33+.8*vn2(wp.xz*.02+1.7));
  vec2 fq=wp.xz*.15+.45*vec2(vn2(vec2(wp.y*.16,wp.x*.05)),vn2(vec2(wp.y*.16+5.,wp.z*.05)));vec2 fi=floor(fq),ff=fract(fq);float m1=8.,m2=8.;vec2 c1=fi,c2=fi;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j);vec2 r=g+vec2(h12(fi+g),h12(fi+g+17.3))-ff;float d=dot(r,r);if(d<m1){m2=m1;c2=c1;m1=d;c1=fi+g;}else if(d<m2){m2=d;c2=fi+g;}}
  float jd=sqrt(m2)-sqrt(m1),jw=.016+.022*h12(c1+c2+3.3);float jt=(1.-smoothstep(jw,jw+.03+fwidth(jd),jd))*step(.4,h12(c1+c2+grp*.73));
  c*=(.8+.3*lay)*(.84+.3*fbm3(wp*.19))*mix(1.-.36*seam-.45*jt*(1.-n.y*n.y),1.,far*.7);
  c=mix(c,c*vec3(1.18,.97,.72),smoothstep(.48,.74,fbm2(wp.xz*.045+vec2(wp.y*.05,0.))));c=mix(c,vec3(dot(c,vec3(.33)))*1.05,smoothstep(.62,.82,fbm2(wp.zx*.06+3.7))*.18);
  if(an.y<.6)c*=1.-.2*smoothstep(.58,.85,fbm2(vec2(wp.x*.37+wp.z*.29,wp.y*.035)));   // dark streaks where rain runs down the faces
  vec3 lg=hillGrass(wp.xz);c=mix(c,mix(vec3(dot(lg,vec3(.3,.5,.2))),lg,.75)*(.7+.35*fbm2(wp.xz*.5)),smoothstep(.6,.85,n.y)*smoothstep(.38,.62,fbm2(wp.xz*.22))*.85);}
 else if(n.y>.25&&n.y<.985){vec3 ac=normalize(cross(vec3(0.,1.,0.),n));vec3 dn=normalize(cross(n,ac));float u=dot(wp,ac)/.47,v=dot(wp,dn)/.42;
  float cu=clamp(1.-fwidth(u)*1.1,0.,1.),cv=clamp(1.-fwidth(v)*1.1,0.,1.);       // band-limited: stripes fade only when finer than a pixel
  float rib=.5+.5*cos(6.2832*u),crs=smoothstep(0.,.25,fract(v)),th=h12(vec2(floor(u),floor(v)));
  c*=(1.-.3*cu*(1.-rib))*(1.-.16*cv*(1.-crs))*(1.+.22*cu*cv*(th-.5));c*=.9+.18*fbm2(vec2(u*.47,v*.42)*.05);}
 return c;}`;
function romeMat(mt){if(!mt||mt.userData.rome)return;mt.userData.rome=1;const pat=ROME_PAT[mt.name]||0;
  if(mt.name==='gold'){mt.metalness=.35;mt.roughness=.38;mt.color.setRGB(.9,.62,.22);mt.emissive=new THREE.Color(.17,.1,.02);}
  if(mt.name==='flame'){mt.emissive=new THREE.Color(2.2,.8,.18);mt.color.setRGB(1,.5,.1);}
  if(mt.name==='water'){mt.roughness=.05;mt.color.setRGB(.1,.26,.3);}
  if(mt.name==='dark'||mt.name==='gallery_wall'){mt.color.setRGB(.40,.35,.28);mt.roughness=.92;mt.userData.galleryInterior=true;}
  if(mt.name==='gallery_floor'){mt.color.setRGB(.47,.42,.34);mt.userData.galleryInterior=true;}
  mt.userData.oc=mt.color.clone();{const W={marble:[.5,.45,.385],travertine:[.51,.425,.3],travertine_light:[.56,.49,.37],plaster:[.56,.51,.42],plaster2:[.54,.47,.36],plaster3:[.52,.36,.27],stone:[.43,.365,.26],rock:[.385,.315,.2],rock2:[.295,.24,.15],rock3:[.245,.193,.112],rock4:[.175,.125,.07],tuff:[.37,.33,.275],warmwall:[.54,.47,.37],warmstone:[.47,.4,.3],ivory:[.57,.51,.40]}[mt.name];if(W)mt.color.setRGB(W[0],W[1],W[2]);}   // warm ivory instead of near-white (albedo ~.5 linear)
  if(mt.name==='blue')mt.color.setRGB(.2,.09,.15);                // no blue cloth in AD 56: faded purple
  if(mt.name==='roof')mt.color.setRGB(.39,.1,.047);           // the old Domus Tiberiana roof: terracotta like the kit tiles
  mt.onBeforeCompile=sh=>{for(const k in U)sh.uniforms[k]=U[k];
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPa;varying float vBY;').replace('#include <project_vertex>','#include <project_vertex>\n#ifdef USE_INSTANCING\nvWPa=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\nvWPa=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif\n#ifdef USE_INSTANCING\nvBY=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).y;\n#else\nvBY=(modelMatrix*vec4(0.,0.,0.,1.)).y;\n#endif');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+GL_NOISE+GL_ATMO+GL_ROMEPAT+'\nuniform vec4 uDbg;varying vec3 vWPa;varying float vBY;')
      .replace('#include <color_fragment>','#include <color_fragment>\n'+(mt.name==='moss'?'if(fbm2(vWPa.xz*.9+vWPa.y*.4)<.5)discard;':'')+(pat?'diffuseColor.rgb=romePat(diffuseColor.rgb,vWPa,'+pat+'.);':'')+'\nif(uDbg.z<.5){vec3 wn=normalize(cross(dFdx(vWPa),dFdy(vWPa)));float hy=vWPa.y-vBY;float gr=1.-smoothstep(0.,3.,hy);diffuseColor.rgb*=1.-.28*gr*(.6+.8*fbm2(vWPa.xz*.6));diffuseColor.rgb*=mix(1.,.72,smoothstep(-.3,-.8,wn.y));if(abs(wn.y)<.5)diffuseColor.rgb*=1.-.1*smoothstep(.55,.85,fbm2(vec2((vWPa.x+vWPa.z)*.9,vWPa.y*.07)));}')
      .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+(mt.userData.galleryInterior?'reflectedLight.indirectDiffuse=max(reflectedLight.indirectDiffuse,vec3(.080,.067,.049)*(1.-uNight));':''))
      .replace('#include <fog_fragment>','gl_FragColor.rgb=atmo(gl_FragColor.rgb,vWPa);');};
  mt.customProgramCacheKey=()=>'romeglb'+pat+(mt.name==='moss'?'m':'')+(mt.userData.galleryInterior?'gi':'');mt.needsUpdate=true;}
// register a placement; fn(g,F) draws the stand-in (optional). o: {parent: group, sx, sy, sz: scale}
function romeStand(W,n,x,z,y,rot,fn,o){const G=layTag(new THREE.Group(),'models');G.name='stand_'+n;
  if(fn){const pend=W.cols,G0=W.colGroup;W.cols={};for(const k in pend)W.cols[k]=[];   // the stand-in's own columns only: the ones still waiting (e.g. a peristyle the Golden House takes) go where their builder flushes them
    const g=new GB(1<<14),S0=W.inStand;W.colGroup=G;W.inStand=n;fn(g,frame(x,y,z,rot||0));W.inStand=S0;const m=g.mesh(MAT.city);if(m)G.add(m);flushColumns(W);W.colGroup=G0;W.cols=pend;}   // W.inStand: what is drawn is hidden once the model loads (templeCourt keeps it plain)
  ((o&&o.parent)||W.scene).add(G);ROME.GLB.push({n,x,y:y+((o&&o.dy)||0),z,r:(o&&o.grot!==undefined)?o.grot:(rot||0),stand:G,o:o||{}});return G;}   // o: {dy: GLB height offset, grot: GLB turn if it differs from the stand-in's, hide, parent, sx/sy/sz}
// a GLB without a stand-in; o.inst = true draws many copies as one InstancedMesh per part (street kit)
function romePlace(n,x,y,z,rot,o){ROME.GLB.push({n,x,y,z,r:rot||0,o:o||{}});}
// A model placed three times or more is drawn as one InstancedMesh per part, per parent group and per ROME_INST_CELL square (instTiles/instCull, builders.js):
// a clone per placement cost a draw call per part (170 insulae of 13-18 parts were ~2500 calls a frame). p.ghost() makes that placement's clone on demand (__floatCheck).
const ROME_INST_CELL=1000;
function romePutModels(n,scene){scene.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;romeMat(m.material);}});
  const inst=[],share=ROME.GLB.filter(p=>p.n===n&&!p.o.inst).length>=3,byPar=new Map();
  for(const p of ROME.GLB){if(p.n!==n)continue;if(p.o.inst){inst.push(p);continue;}const par=p.o.parent||(p.o.parentLayer&&W0.preLayers&&W0.preLayers[p.o.parentLayer])||W0.scene;
    const mk=()=>{const o=layTag(scene.clone(true),'models');o.position.set(p.x,p.y,p.z);o.rotation.y=p.r;if(p.o.sx||p.o.sy||p.o.sz)o.scale.set(p.o.sx||1,p.o.sy||1,p.o.sz||p.o.sx||1);return o;};
    if(share){p.ghost=mk;if(!byPar.has(par))byPar.set(par,[]);byPar.get(par).push(p);}else{p.obj=mk();par.add(p.obj);}
    if(p.stand)p.stand.visible=false;if(p.o.hide){ROME.hid=ROME.hid||{};ROME.hid[p.o.hide]=1;W0.scene.traverse(m=>{if(m.name===p.o.hide)m.visible=false;});}}
  if(byPar.size){scene.updateMatrixWorld(true);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),T=new THREE.Vector3(),E=new THREE.Euler();
    for(const[par,L]of byPar)for(const I of instTiles(L.length,i=>[L[i].x,L[i].z],ROME_INST_CELL))scene.traverseVisible(m=>{if(!m.isMesh)return;const im=new THREE.InstancedMesh(m.geometry,m.material,I.length);
      I.forEach((j,i)=>{const p=L[j],sc=p.o.sx||p.o.sy||p.o.sz;S.set(sc?p.o.sx||1:1,sc?p.o.sy||1:1,sc?p.o.sz||p.o.sx||1:1);M.compose(T.set(p.x,p.y,p.z),Q.setFromEuler(E.set(0,p.r,0)),S).multiply(m.matrixWorld);im.setMatrixAt(i,M);});   // the clone's own transform, as mk()
      im.castShadow=im.receiveShadow=true;par.add(layTag(instCull(im),'models'));});}
  if(inst.length){scene.updateMatrixWorld(true);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),T=new THREE.Vector3(),E=new THREE.Euler(),byL={};   // one set of InstancedMeshes per story-state group (o.parentLayer), the rest in the scene
    for(const p of inst)(byL[p.o.parentLayer||'']||(byL[p.o.parentLayer||'']=[])).push(p);
    for(const lk in byL){const inst=byL[lk],par=(lk&&W0.preLayers&&W0.preLayers[lk])||W0.scene;
    scene.traverse(m=>{if(!m.isMesh)return;const tn=m.material.name==='awning'&&inst.some(p=>p.o.tint),RK={rock:[.29,.235,.15],rock2:[.215,.172,.105],moss:[.13,.155,.06]}[m.material.name],mt=(tn||RK)?m.material.clone():m.material;if(tn){mt.color.setRGB(1,1,1);romeMat(mt);}if(RK&&!tn){mt.userData.rome=0;romeMat(mt);mt.color.setRGB(...RK);}/* a clone loses onBeforeCompile: the instanced rocks had no rock pattern or haze */const im=new THREE.InstancedMesh(m.geometry,mt,inst.length),cc=new THREE.Color();inst.forEach((p,i)=>{if(tn){const t=p.o.tint||[.8,.74,.6];im.setColorAt(i,cc.setRGB(t[0],t[1],t[2]));}Q.setFromEuler(E.set(p.o.tilt||0,p.r,0,'YXZ'));S.set(p.o.sx||1,p.o.sy||p.o.sx||1,p.o.sz||p.o.sx||1);T.set(p.x,p.y,p.z);M.compose(T,Q,S).multiply(m.matrixWorld);im.setMatrixAt(i,M);});layTag(im,'models');im.castShadow=false;im.receiveShadow=true;par.add(im);});}}}   // o.hide: name of an older object (e.g. the first Tiberiana GLB 'glb_dt') this model replaces
function romeLoadModels(){if(ROME.loadState||typeof W0==='undefined'||!W0)return;ROME.loadState=1;
  const go=async()=>{const D=window.ROME_GLB;if(!D)return;ROME.loadState=2;let left=0;const fin=()=>{if(--left<=0)window.__romeReady=true;};
    const names=[...new Set(ROME.GLB.map(p=>p.n))].filter(n=>D[n]);left=names.length;
    for(const n of names){try{const raw=b64u8(D[n]),buf=window.ROME_GLB_gz?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw.buffer;   // rome-assets.js holds gzipped, quantized GLBs (tools/glbopt.mjs)
      new THREE.GLTFLoader().parse(buf,'',gl=>{romePutModels(n,gl.scene);fin();},e=>{console.warn('rome glb',n,e);fin();});}catch(e){console.warn(e);fin();}}
    if(!left)window.__romeReady=true;};
  if(window.ROME_GLB){go();return;}window.romeAssetsLoaded=go;const s=document.createElement('script');s.src='rome-assets.js';
  s.onerror=()=>{console.warn('rome-assets.js not found: procedural stand-ins stay');window.__romeReady=true;};document.head.appendChild(s);}

/* TEST tool: window.__floatCheck() after the Rome GLBs are loaded. For every placed model it bins the world-space vertices in 3 m cells, takes the outer cells
   (at most 64 along the rim) and checks the terrain under the lowest geometry of each (within 3 m): more than 0.4 m below it = the base floats; then 16 inner cells: terrain more than
   1 m above the floor level (the model's y) = buried. Returns [{n,x,z,y,floatN,floatMax,at,buriedN,buriedMax}], logs the ones with problems. */
window.__floatCheck=(opt)=>{const W=W0,out=[],CS=3,tolF=opt&&opt.tolF||.4,tolB=opt&&opt.tolB||1,A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(),sup=ROME.supports||[];
  const supported=(x,z)=>sup.some(q=>{const dx=x-q.x,dz=z-q.z,u=q.c*dx-q.s*dz,v=q.s*dx+q.c*dz;return Math.abs(u)<q.hw+1&&Math.abs(v)<q.hd+1;});   // ROME.supports: footprints of hand-built foundations (palBlocks) that carry a model where the ground is far below
  for(const p of ROME.GLB){const o=p.obj||(p.ghost&&p.ghost());if(!o||!o.visible)continue;o.updateMatrixWorld(true);const cells=new Map();
    const put=(x,y,z)=>{const i=Math.floor(x/CS),j=Math.floor(z/CS),k=i+','+j;let c=cells.get(k);if(!c){c={y:1e9,x:0,z:0,i,j};cells.set(k,c);}if(y<c.y){c.y=y;c.x=x;c.z=z;}};
    o.traverse(m=>{if(!m.isMesh||!m.visible)return;const P=m.geometry.attributes.position,I=m.geometry.index,nT=I?I.count/3:P.count/3;
      for(let t=0;t<nT;t++){const a=I?I.getX(t*3):t*3,b=I?I.getX(t*3+1):t*3+1,c=I?I.getX(t*3+2):t*3+2;A.fromBufferAttribute(P,a).applyMatrix4(m.matrixWorld);B.fromBufferAttribute(P,b).applyMatrix4(m.matrixWorld);C.fromBufferAttribute(P,c).applyMatrix4(m.matrixWorld);
        const L=Math.max(A.distanceTo(B),B.distanceTo(C),C.distanceTo(A)),n=Math.min(40,Math.max(1,Math.ceil(L/CS)));   // sample the triangle surface: big flat roofs have few vertices
        for(let i=0;i<=n;i++)for(let j=0;j<=n-i;j++){const u=i/n,w=j/n,z0=1-u-w;put(A.x*z0+B.x*u+C.x*w,A.y*z0+B.y*u+C.y*w,A.z*z0+B.z*u+C.z*w);}}});
    const rim=[],inn=[];for(const c of cells.values()){const e=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>!cells.has((c.i+a)+','+(c.j+b)));(e?rim:inn).push(c);}
    const stR=Math.max(1,Math.ceil(rim.length/64)),stI=Math.max(1,Math.ceil(inn.length/16));let fN=0,fMax=0,at=null,bN=0,bMax=0;const hits=[];
    for(let i=0;i<rim.length;i+=stR){const c=rim[i],g=W.gy(c.x,c.z);let yN=c.y;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const q=cells.get((c.i+a)+','+(c.j+b));if(q&&q.y<yN)yN=q.y;}const d=yN-g;   // lowest geometry within +-3 m (a ledge may overhang its neighbour)
      if(d>tolF&&!supported(c.x,c.z)){fN++;hits.push([Math.round(c.x),Math.round(c.z),+yN.toFixed(1),+g.toFixed(1)]);if(d>fMax){fMax=d;at=[Math.round(c.x),Math.round(c.z)];}}}
    for(let i=0;i<inn.length;i+=stI){const c=inn[i],d=W.gy(c.x+CS/2,c.z+CS/2)-p.y;if(d>tolB){bN++;if(d>bMax)bMax=d;}}
    out.push({n:p.n,x:Math.round(p.x),z:Math.round(p.z),y:+p.y.toFixed(1),floatN:fN,floatMax:+fMax.toFixed(1),at,buriedN:bN,buriedMax:+bMax.toFixed(1),hits});}
  for(const pts of ROME.porticos||[]){if(pts.carried)continue;let fN=0,fMax=0,at=null;   // pts.carried: stands on a building (reason in the string), not on the ground
   for(const[x,y,z]of pts){const d=y-W.gy(x,z);if(d>Math.max(tolF,(pts.fd||12)-.5)&&!supported(x,z)){fN++;if(d>fMax){fMax=d;at=[Math.round(x),Math.round(z)];}}}   // procedural porticoes: every column foot against the ground
    if(fN)out.push({n:'portico',x:Math.round(pts[0][0]),z:Math.round(pts[0][2]),y:+pts[0][1].toFixed(1),floatN:fN,floatMax:+fMax.toFixed(1),at,buriedN:0,buriedMax:0,hits:[]});}
  return out;};

// TEST: window.__temple(false) = the old near-white GLB look (colours and grime off), true = the new ivory/grime shading
/* TEST tool: window.__wallFootCheck() (briefs/rome/podium-stairs-rock.md §5, phase 2). Reads W.wallFeet (terraceEdge, terrace-edge.js): the samples every ~2 m along each
   terrace wall. Where the wall stands 1 m or more out of the ground (not an opening), a stretch with nothing on the line where wall meets ground (a buttress, a pier,
   a stair, an arch bay, a rock, a shrub or a cypress: rec.brk, within 1.5 m) whose foot stays within 0.35 m of the straight line between its ends is a straight seam.
   Where a street runs along the wall foot (q.road, set by terraceFeet) the wall meets a kerb, not the slope: those samples end a run and are counted apart (road).
   Returns {walls, seams: the ones longer than opt.minL (8 m), long: the number longer than 20 m (must be 0), road: samples along a street, band: the thinnest
   edge seen from below (coping + parapet, must be 1.2 m or more), bandEdges}. */
window.__wallFootCheck=(opt)=>{const W=W0,maxL=opt&&opt.maxL||20,minL=opt&&opt.minL||8,seams=[];let long=0,road=0;
  for(const R of W.wallFeet||[]){const S=R.S,brk=R.brk||[],hit=s=>brk.some(b=>Math.abs(b-s)<=1.5);let run=[];
    const flush=()=>{let i=0;while(i<run.length-1){let j=i+1;
        for(;j<run.length;j++){const A=run[i],B=run[j];let ok=true;for(let k=i+1;k<j;k++){const q=run[k],y=A.y+(B.y-A.y)*(q.s-A.s)/(B.s-A.s);if(Math.abs(q.y-y)>.35){ok=false;break;}}if(!ok)break;}
        const A=run[i],B=run[j-1],len=B.s-A.s;if(len>=minL){seams.push({tag:R.tag,s0:+A.s.toFixed(1),s1:+B.s.toFixed(1),len:+len.toFixed(1),x:+A.x.toFixed(1),z:+A.z.toFixed(1)});if(len>maxL)long++;}
        i=Math.max(i+1,j-1);}run=[];};
    for(const q of S){if(q.road&&!q.open&&q.h>=1)road++;if(q.open||q.road||q.h<1||hit(q.s)){flush();continue;}run.push(q);}flush();}
  const E=(W.terraceEdges||[]).filter(e=>e.band!=null),band=E.length?Math.min(...E.map(e=>e.band)):null;
  const r={walls:(W.wallFeet||[]).length,seams:seams.sort((a,b)=>b.len-a.len),long,road,band,bandEdges:E.length};console.log('wall feet',JSON.stringify({walls:r.walls,seams:seams.length,long,road,band}));return r;};
/* TEST tools of the Palatine H1 (briefs/rome/palatine-masterplan.md section 4, the H1 checklist). PAL_PLAN.zones (palatine-plan.js) is the rebuilt ground:
   the east and south-east slopes, and the south; the ravine between them lies outside the foot wall. All four run on the old rings too (the numbers before H1).
   __palOpenEnds(): every run of wall (W.wallFeet, palette 1, samples 1 m or more out of the ground) in the zone, both ends: an end is closed when the wall
     dies into the ground there ('grade'), another wall goes on from it within 1.6 m ('wall'), a full-height pier stands there (W.wallPiers: end piers at
     openings, corner piers) ('pier'), it meets a hero model's rock base or a rock band ('rock'), or a villa model's own wall ('model'). Returns {ends, open, by, list}.
     The west rings (H2, records with west) are checked wherever they are.
   __palBaseCheck(): (R10 exceptions: the palace terrace rings and the south slope's three ranges are listed under recorded, not fail) every building on the east and south slopes (and, for H2, the north villas): its main floor, the level it stands on (the floor of the
     terrace that holds its middle; elsewhere the lowest ground round its whole footprint, so a rock tower counts as its own base), the base between them,
     its eaves height above that floor and whether the base is over half the eaves. Hero models on the summit stand on the summit terrace (its wall is the hill's).
   __palBareSlope(): 1.5 m cells in the zone steeper than 30 degrees that are not a terrace floor, a wall (within 1.6 m of its line), a stair, a building,
     rock (a hero model's rock base, a rock band) or the terrain's own rock shading (sl>.64): their area in m2, and the worst places. H2: the zones and the
     west slope (PAL_PLAN.west.rock). Since the review of 2026-11-13 there is no rock on the west slope: a west ring's floor (its footprint) and planting
     count as cover there (W.palPlants: a plant of palWestSlope within its crown's radius).
   __palReach(): the terraces (W.palPlats; before H1 the old ring floors, grouped by level into connected pieces; since H2 also the west rings kept,
     PAL_PLAN.west.rings) and the stairs between them (W.palStairs, the hill stairs): which can be reached from the street, and the stairs that cross a terrace diagonally (a stretch more than 4 m over its floor
     whose direction is more than 20 degrees off both the normal and the line of every wall within 30 m). */
function palPolyD(lx,lz,P){let d=1e9;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];d=Math.min(d,segD(lx,lz,a[0],a[1],b[0],b[1]));}return d;}
const palInZone=(x,z,m=0)=>{const[lx,lz]=palL(x,z);return PAL_PLAN.zones.some(Z=>inPolyXZ(lx,lz,Z)||(m>0&&palPolyD(lx,lz,Z)<m));};
const palPlatAt=(x,z)=>{const[lx,lz]=palL(x,z);for(const P of W0.palPlats||[])if(inPolyXZ(lx,lz,P.pts))return P;return null;};
window.__palOpenEnds=(opt={})=>{const W=W0,R=W.wallFeet||[],PI=W.wallPiers||[],ends=[],by={};
  const pts=[];R.forEach((r,ri)=>{if(r.pal!==1)return;r.S.forEach((q,k)=>{if(!q.open&&q.h>=1)pts.push([q.x,q.z,ri,k]);});});
  const model=(x,z)=>(W.palFeet||[]).some(f=>{const dx=x-f.cx,dz=z-f.cz;return Math.abs(f.c*dx-f.s*dz)<f.hw+1.5&&Math.abs(f.s*dx+f.c*dz)<f.hd+1.5;});
  const rock=(x,z)=>{const[lx,lz]=palL(x,z);return palRockD(lx,lz)<2.5||(W.palRocks||[]).some(b=>Math.hypot(b[0]-x,b[1]-z)<b[2]+2.5);};
  for(let ri=0;ri<R.length;ri++){const r=R[ri],S=r.S;if(r.pal!==1||r.natural)continue;let k=0;
    while(k<S.length){if(S[k].open||S[k].h<1){k++;continue;}let k1=k;while(k1+1<S.length&&!S[k1+1].open&&S[k1+1].h>=1)k1++;
      for(const[e,nb]of[[k,k-1],[k1,k1+1]]){const q=S[e];if(!r.west&&!palInZone(q.x,q.z,opt.m??3))continue;const N=S[nb];let why=null;
        if(N&&!N.open&&N.h<1)why='grade';
        if(!why&&pts.some(p=>(p[2]!==ri||Math.abs(p[3]-e)>3)&&Math.hypot(p[0]-q.x,p[1]-q.z)<1.6))why='wall';
        if(!why&&PI.some(p=>Math.hypot(p[0]-q.x,p[1]-q.z)<(p[2]||1)+1.6))why='pier';
        if(!why&&rock(q.x,q.z))why='rock';
        if(!why&&model(q.x,q.z))why='model';
        by[why||'open']=(by[why||'open']||0)+1;const[lx,lz]=palL(q.x,q.z);ends.push({tag:r.tag,lx:+lx.toFixed(1),lz:+lz.toFixed(1),h:+q.h.toFixed(1),why});}
      k=k1+1;}}
  const open=ends.filter(e=>!e.why),r={ends:ends.length,open:open.length,by,list:open.slice(0,60)};console.log('pal open ends',JSON.stringify({ends:r.ends,open:r.open,by}));return r;};
window.__palBaseCheck=(opt={})=>{const W=W0,gy=W.gy,rows=[],LIM=.75,FL=.6;
  // the buildings in their model axes (x = u, y = -v; front -Y = the garden / low side), the outline sampled, and the floor along it (model z, 0 = the
  // reference floor y0): from the model scripts (rome_domus_a.py cut variant, rome_pal_blocks.py, rome_transitoria.py)
  const DOM={o:[-15,15,-14.5,23],f:(x,y)=>y>=-2.2?0:-3.4,st:4.5,own:[['garden face (y -2.2)',3.4],['W1 (y -14.5)',2.6]]};   // R10 乙 (round 4, laughing-franklin): T1 3.4 under the floor, W1 2.6 m down to the 36
  const BLK={a:{o:[-18,18,-15,15],f:(x,y)=>y>=0?0:-5,st:4.4,split:['split wall (y 0, z 0 to -5): along the block\'s inner lane',5]},b:{o:[-30,30,-8,8],f:(x,y)=>y>=0?0:-5,st:4.4,split:['split wall (y 0, z 0 to -5): behind the low range',5]},
    c:{o:[-15,15,-15,15],f:(x,y)=>y>=-10?0:-10,st:4.2,own:[['garden drop (y -10, z 0 to -10): open to the lower terrace',10]]},cf:{o:[-15,15,-10,15],f:()=>0,st:4.2},bf:{o:[-30,30,-8,8],f:()=>0,st:4.4},d:{o:[-17,17,-13,13],f:(x,y)=>y>=-3?0:-5,st:4.4,split:['split wall (y -3, z 0 to -5): 12 m of it open beside the archive',5]}};
  const L=[];
  for(const A of PAL_ASSETS){
    if(/^rome_domus_[ab]_belt$/.test(A.n))L.push({n:A.n,kind:'domus',lx:A.lx,lz:A.lz,t:A.turn,y0:A.y,...DOM});
    else if(A.n==='rome_transitoria')L.push({n:A.n,kind:'palace',lx:A.lx,lz:A.lz,t:A.turn,y0:A.y,o:[-68,68,-58,58],f:()=>-5,st:4.5,own:[['terrace A walls (z 0 to -5)',5]],note:'own two-level terrace (A 5 m, B 9 m): the outline is terrace B'});
    else if(A.n==='rome_tiberiana')L.push({n:A.n,kind:'palace',lx:A.lx,lz:A.lz,t:A.turn,y0:A.y,skip:'accepted: the cliff and terrace garden do not change (tiberiana-v2)'});
    else if(A.n==='rome_domus_augusti')L.push({n:A.n,kind:'palace',lx:A.lx,lz:A.lz,t:A.turn,y0:A.y,o:[-36,36,-35,41],f:(x,y)=>y>=0?0:y>=-29?-5:-9,st:4.5,own:[['south wall 1 (y -29, z -5 to -9)',4],['south wall 2 (y -35, z -9 to -14) on a rock foot to -20',5]],note:'outline: x 36, y -35..41 (south wall 2 line); flanks drop 1 m by design'});
    else L.push({n:A.n,kind:'temple',lx:A.lx,lz:A.lz,t:A.turn,y0:A.y,model:true});}
  for(const B of palBL){const k=BLK[B.t],sc=B.t==='c'||B.t==='cf'||B.t==='bf'?1:B.dr/5;   // the low split variants (R10, round 4): the same plan, the split 3.3 m (B.dr) instead of 5
    L.push({n:B.n,kind:'block',type:B.t,lx:B.lx,lz:B.lz,t:B.tn,y0:B.y,o:k.o,f:sc===1?k.f:(x,y)=>k.f(x,y)*sc,st:k.st,own:k.own,split:k.split&&[k.split[0].replace('-5','-'+B.dr),+(k.split[1]*sc).toFixed(2)]});}
  // Jupiter Victor (palatine.js, the plateau strips): temple() W 11 x L 19 at (113.5, 10), floor = the highest ground under 16 x 24 m + 0.3
  {const[x,z]=palW(113.5,10);let m=-1e9;for(let u=-8;u<=8;u+=1)for(let v=-12;v<=12;v+=1){const[a,b]=palW(113.5+u,10+v);m=Math.max(m,gy(a,b));}L.push({n:'Jupiter Victor',kind:'temple',lx:113.5,lz:10,t:0,y0:PAL_PLAN.h51.on?PAL_PLAN.h51.jv.y+.06:m+.3,o:[-5.5,5.5,-9.5,9.5],f:()=>0,st:null});}
  const rect=L.filter(b=>b.o).map(b=>({b,c:Math.cos(b.t*DEG),s:Math.sin(b.t*DEG)}));
  const inOther=(lx,lz,self)=>rect.some(({b,c,s})=>{if(b===self)return false;const dx=lx-b.lx,dz=lz-b.lz,u=c*dx-s*dz,y=-(s*dx+c*dz);return u>b.o[0]&&u<b.o[1]&&y>b.o[2]&&y<b.o[3];});
  const SP=[];for(const s of W.palStairs||[])for(let i=1;i<s.pts.length;i++)SP.push([s.pts[i-1],s.pts[i],s.w/2+.6]);for(const h of W.hillStairs||[])if(h.R)for(let i=1;i<h.R.length;i++)SP.push([h.R[i-1],h.R[i],(h.w||3)/2+.6]);
  const onStair=(x,z)=>SP.some(([a,b,r])=>segD(x,z,a[0],a[1],b[0],b[1])<r);
  // review 34 (11-16): a paved strip registered in W.palPads that the face stands on (0.2 m out: a plinth hugging it, or a solid fill against it, h51's
  // apF) is the level there before the terrace inside: the terrace read 0.3 m inside the face is the floor's level, not what the wall rises from. It corrects
  // the sampling, the limit stays (the reviewer: apF's top 54.3 is the ground at d_low's back; the end walls' plinths 51.97)
  const lev=(xi,zi,x,z,nx,nz)=>{if(nx!=null){const[a,c]=palL(nx,nz);for(const p of W.palPads||[])if(a>p.x0&&a<p.x1&&c>p.z0&&c<p.z1)return[p.y,p.id];}let pl=palPlatAt(xi,zi)||palPlatAt(x,z);if(pl)return[pl.y,pl.id];const[lx,lz]=palL(x,z);
    for(const p of W.palPads||[])if(lx>p.x0&&lx<p.x1&&lz>p.z0&&lz<p.z1)return[p.y,p.id];if(palInBasin(lx,lz,0))return[PAL_DECK,'deck'];return[gy(x,z),'ground'];};   // a paved strip at a building's floor (W.palPads, palBEnd: along block b's ends). The system level at a face: the terrace the building stands on there (0.3 m inside the face), else the terrace just outside, else the paved deck of the saddle basins, else the ground
  for(const b of L){const row={n:b.n,kind:b.kind,type:b.type,at:[b.lx,b.lz],turn:b.t,y0:+b.y0.toFixed(2),storey:b.st,limit:b.st?+(b.st*LIM).toFixed(2):null};
    if(b.skip){row.skip=b.skip;rows.push(row);continue;}
    if(b.model){row.note='the temple stands on the model\'s own terrace floor on all four sides (one level by construction); its terrace walls are exempt';row.pass=true;rows.push(row);continue;}
    const c=Math.cos(b.t*DEG),s=Math.sin(b.t*DEG),toL=(x,y)=>[b.lx+c*x-s*y,b.lz-s*x-c*y];   // model (x, y) -> hill (lx, lz): v = -y
    const[x0,x1,y0,y1]=b.o,F={back:[[x0,y1],[x1,y1],[0,1]],front:[[x1,y0],[x0,y0],[0,-1]],left:[[x0,y0],[x0,y1],[-1,0]],right:[[x1,y1],[x1,y0],[1,0]]};
    row.faces={};
    for(const k in F){const[[ax,ay],[bx,by],[nx,ny]]=F[k],len=Math.hypot(bx-ax,by-ay),n=Math.max(2,Math.round(len));let emax=-1e9,emin=1e9,skipJ=0,skipS=0,cnt=0,on=new Set(),fl=[1e9,-1e9],ol=[1e9,-1e9],worst=null;
      for(let i=0;i<=n;i++){const t=.5/len+(1-1/len)*i/n,px=ax+(bx-ax)*t,py=ay+(by-ay)*t;
        const fy=b.y0+b.f(px-nx*.3,py-ny*.3),[olx,olz]=toL(px+nx*.75,py+ny*.75),[ilx,ilz]=toL(px-nx*.3,py-ny*.3),[iwx,iwz]=palW(ilx,ilz),[nwx,nwz]=palW(...toL(px+nx*.2,py+ny*.2));
        if(inOther(olx,olz,b)){skipJ++;continue;}const[wx,wz]=palW(olx,olz);if(onStair(wx,wz)){skipS++;continue;}
        const[oy,oid]=lev(iwx,iwz,wx,wz,nwx,nwz),e=fy-oy;cnt++;on.add(oid);fl=[Math.min(fl[0],fy),Math.max(fl[1],fy)];ol=[Math.min(ol[0],oy),Math.max(ol[1],oy)];
        if(e>emax){emax=e;worst=[+olx.toFixed(1),+olz.toFixed(1)];}emin=Math.min(emin,e);}
      const f=cnt?{floor:fl.map(v=>+v.toFixed(1)),out:ol.map(v=>+v.toFixed(1)),exp:+emax.toFixed(1),expMin:+emin.toFixed(1),at:worst,on:[...on],n:cnt,joined:skipJ,stair:skipS}:{joined:skipJ,stair:skipS,n:0};
      f.flush=cnt>0&&emax<=FL&&emin>=-FL;row.faces[k]=f;}
    if(b.own)row.own=b.own.map(([w,h])=>({wall:w,h}));if(b.split)row.split={wall:b.split[0],h:b.split[1],over:b.split[1]>row.limit+.05};
    const fs=Object.entries(row.faces);
    if(b.kind==='temple'){const lo=Math.min(...fs.filter(([,f])=>f.n).map(([,f])=>f.out[0])),hi=Math.max(...fs.filter(([,f])=>f.n).map(([,f])=>f.out[1]));row.spread=+(hi-lo).toFixed(1);row.pass=row.spread<=FL;}
    else{row.over=fs.filter(([,f])=>f.n&&f.exp>row.limit+.05).map(([k,f])=>k+' '+f.exp);if(row.own)for(const w of row.own)if(w.h>row.limit+.05)row.over.push(w.wall+' '+w.h);
      row.flush=fs.filter(([,f])=>f.flush).map(([k])=>k);row.pass=!row.over.length&&row.flush.length>0;}
    if(b.note)row.note=b.note;rows.push(row);}
  // the recorded exceptions (the reviewer's R10 decisions of 2026-11-14, palatine-masterplan.md R10): measured and listed (recorded), not failed
  const EXC=[[b=>b.n==='rome_transitoria','palace terrace ring: terraces A and B count as system terraces, under R2 (9 m); B north 9.6-9.8 m recorded, not changed'],
    [b=>b.n==='rome_domus_augusti','palace terrace ring: the two south walls count as system terraces, under R2 (9 m)'],
    [b=>b.kind==='block'&&b.type==='b'&&Math.round(b.at[0])===5&&[148,171,194].includes(Math.round(b.at[1])),'south slope range: accepted as built, recorded only']];
  for(const r of rows){const e=EXC.find(([f])=>f(r));if(e){r.exception=e[1];if(r.pass===false){r.recorded=true;r.pass=null;}}}
  const tag=r=>r.n+'@'+r.at.map(v=>Math.round(v))+(r.over&&r.over.length?' over: '+r.over.join(', '):'')+(r.flush&&!r.flush.length?' no flush face':'')+(r.spread!=null?' spread '+r.spread:'');
  const fail=rows.filter(r=>r.pass===false).map(tag),recorded=rows.filter(r=>r.recorded).map(r=>tag(r)+' ['+r.exception+']');
  const r={list:rows,fail,recorded,checked:rows.filter(r=>r.pass!=null).length};console.log('pal base R10',JSON.stringify({checked:r.checked,fail:fail.length,recorded:recorded.length}));return r;};
window.__palBareSlope=(opt={})=>{const W=W0,gy=W.gy,cs=opt.cs||1.5,lim=Math.tan((opt.deg||30)*DEG),rows=[];let n=0,cells=0;
  const R=(W.wallFeet||[]).filter(r=>r.pal===1),SP=[];for(const r of R)for(const q of r.S)if(q.h>=.5)SP.push([q.x,q.z]);
  for(const h of W.hillStairs||[])for(let i=1;i<h.R.length;i++)SP.push(...[0,.25,.5,.75].map(t=>[lerp(h.R[i-1][0],h.R[i][0],t),lerp(h.R[i-1][1],h.R[i][1],t),h.w/2+1]));
  for(const s of W.palStairs||[])for(const p of s.pts||[])SP.push([p[0],p[1],s.w/2+1]);
  const G=new Map(),gk=(x,z)=>Math.floor(x/8)+','+Math.floor(z/8);for(const p of SP){const k=gk(p[0],p[1]);(G.get(k)||G.set(k,[]).get(k)).push(p);}
  const near=(x,z)=>{for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const L=G.get((Math.floor(x/8)+i)+','+(Math.floor(z/8)+j));if(L)for(const p of L)if(Math.hypot(p[0]-x,p[1]-z)<(p[2]||1.6))return true;}return false;};
  const bld=(x,z)=>W.foot.hits(x,z,.1,.1,0,0,f=>f.tag==='open'||f.tag==='precinct'||f.tag==='road'||f.palTer!=null),ring=(x,z)=>W.foot.hits(x,z,.1,.1,0,0,f=>f.palTer==null);
  const PG=new Map();for(const p of W.palPlants||[]){const k=Math.floor(p[0]/4)+','+Math.floor(p[1]/4);(PG.get(k)||PG.set(k,[]).get(k)).push(p);}
  const plant=(x,z)=>{for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const L=PG.get((Math.floor(x/4)+i)+','+(Math.floor(z/4)+j));if(L)for(const p of L)if(Math.hypot(p[0]-x,p[1]-z)<p[2])return true;}return false;};
  for(const Z of[...PAL_PLAN.zones,...(PAL_PLAN.west?[PAL_PLAN.west.rock]:[])]){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of Z){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
    for(let lz=z0+cs/2;lz<z1;lz+=cs)for(let lx=x0+cs/2;lx<x1;lx+=cs){if(!inPolyXZ(lx,lz,Z))continue;const[x,z]=palW(lx,lz);cells++;
      const sl=Math.hypot(gy(x+.75,z)-gy(x-.75,z),gy(x,z+.75)-gy(x,z-.75))/1.5;if(sl<=lim)continue;
      if(palPlatAt(x,z))continue;if(palRockD(lx,lz)<.5)continue;if(1-1/Math.sqrt(1+sl*sl)>.64)continue;   // a terrace floor; a rock base; the terrain shader draws rock there (builders.js: smoothstep(.5,.78,sl))
      if((W.palRocks||[]).some(b=>Math.hypot(b[0]-x,b[1]-z)<b[2]))continue;if(near(x,z)||bld(x,z)||ring(x,z)||plant(x,z))continue;
      n++;if(rows.length<400)rows.push([+lx.toFixed(0),+lz.toFixed(0),+(Math.atan(sl)/DEG).toFixed(0)]);}}
  const area=+(n*cs*cs).toFixed(0),r={area,cells:n,of:cells,worst:rows.sort((a,b)=>b[2]-a[2]).slice(0,30)};console.log('pal bare slope',JSON.stringify({area,cells:n}));return r;};
// R11 (the review of 2026-11-14): both ends of every stair on the hill are level with the floor they join. The stair's end piece (its landing, or its
// first tread where it has none) may be up to 3 cm lower than the floor, so the paving covers its edge; never higher, never a step. Measured on what is
// drawn, not read from the builders: downward rays on every visible mesh but the instanced ones (trees, shrubs), along a line from the end of the
// stair's route (a point on the floor it joins) towards the first point of the route a riser lower (a head) or higher (a foot); where a parapet or a
// drop is in the way, the line swings up to 60 degrees either side. Along it: the first riser (0.1 m or more the stair's way); the piece just before it is
// the end piece, and the break before that is its joint with the floor (d: the end piece's height over the floor that touches it; none: flush, d 0).
// A first or last riser over 0.25 m is a fault of its own. The built meshes keep their arrays only with ?keepgeo in the address (materials.js).
// The joints part way along a hill stair count as ends too (joints: where a flight leaves a ring's or terrace's floor, or comes down on one; the id
// carries the route point, "(t31)"); a route with no riser is a walk (walks), not checked. The terrain is not read where the ground mask hides it
// (option 甲 of the buried treads, W.groundMask): it is not drawn there.
window.__palStairEnds=(opt={})=>{const W=W0,RAD=5,DS=.1,CK=2,rows=[],ck=(x,z)=>Math.floor(x/CK)+','+Math.floor(z/CK);
  // a route with no riser (mmWalk, the walk along beltMM: an H1 stair record with a level route) is a walk, not a stair: listed apart (walks), not checked
  const S=[],walks=[];for(const s of W.palStairs||[]){const Yv=(s.Y||[]).filter(v=>!isNaN(v));if(Yv.length&&Math.max(...Yv)-Math.min(...Yv)<.15){walks.push(s.id);continue;}S.push({id:s.id,R:s.pts,Y:s.Y,hd:s.hd});}
  const onRing=(x,z)=>W.foot.hits(x,z,3,3,0,0,f=>f.palTer==null);   // as __palReach: the hill stairs (templeLinks) in the zones or over a west ring
  const J=[];   // R11 (the second pass): a hill stair's flight that leaves a floor or comes down on one part way along its route (stairFlight's fA, fB) has an end there too
  for(const h of W.hillStairs||[]){if(h.pal||h.glb||!h.R||h.R.length<2||!h.R.some(p=>palInZone(p[0],p[1],10)||onRing(p[0],p[1])))continue;const id=h.temple?'temple:'+h.temple:'hill@'+h.R[0].map(Math.round);
    S.push({id,R:h.R,Y:hillStairHeights(W,h.R,h.top)});
    const R=h.R,Hg=stairGround(W),ix=stairLandings(W,R);let yT=h.top;for(let l=0;l<ix.length-1;l++){const f=stairFlight(W,Hg,R,ix,l,yT);if(f.skip==='short')continue;if(f.skip){yT=Math.min(yT,f.yB);continue;}
      const{A,B,Ls}=f,ux=(B[0]-A[0])/Ls,uz=(B[1]-A[1])/Ls,at=s=>[A[0]+ux*s,A[1]+uz*s];
      if(f.fA!=null&&l>0){const s=Math.min(f.sE,f.sLo)-.8,p=at(s);J.push({id:id+' (t'+ix[l]+')',head:true,p,y:f.fA,R:[p,B],Y:[f.fA,f.yE],D:f.o0-s+2});}   // D: the head landing can be longer than 8 m (a slant crossing)
      if(f.fB!=null&&l<ix.length-2){const p=at(Ls-f.e1+.8);J.push({id:id+' (t'+ix[l+1]+')',head:false,p,y:f.fB,R:[p,A],Y:[f.fB,yT]});}
      yT=f.yE;}}
  const E=[];for(const s of S)for(const head of[true,false]){const R=head?(s.hd?s.R.slice(s.hd):s.R):s.R.slice().reverse(),Y=head?(s.hd?s.Y.slice(s.hd):s.Y):s.Y.slice().reverse(),y=isNaN(Y[0])?Y.find(v=>!isNaN(v)):Y[0];E.push({id:s.id,head,p:R[0],y,R,Y});}
  E.push(...J);
  // the walking surfaces: every triangle facing up or down (not a wall face) of the visible meshes within RAD of the ends, in 2 m cells
  const need=new Set();let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;
  for(const e of E){const[x,z]=e.p,RD=Math.max(RAD,(e.D||8)+.5);   // as far as the line is read (8 m, or a long head landing's D): the cells past RAD were empty, a fault of their own
    for(let gx=Math.floor((x-RD-.5)/CK);gx<=Math.floor((x+RD+.5)/CK);gx++)for(let gz=Math.floor((z-RD-.5)/CK);gz<=Math.floor((z+RD+.5)/CK);gz++)need.add(gx+','+gz);
    bx0=Math.min(bx0,x-RD-1);bx1=Math.max(bx1,x+RD+1);bz0=Math.min(bz0,z-RD-1);bz1=Math.max(bz1,z+RD+1);}
  const B=new Map(),bb=new THREE.Box3();let tris=0,gone=0;W.scene.updateMatrixWorld(true);
  W.scene.traverseVisible(o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh)return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(m&&m.transparent&&m.opacity<.9)return;
    const G=o.geometry,pos=G&&G.attributes.position;if(!pos)return;if(!G.boundingBox)G.computeBoundingBox();bb.copy(G.boundingBox).applyMatrix4(o.matrixWorld);if(bb.max.x<bx0||bb.min.x>bx1||bb.max.z<bz0||bb.min.z>bz1)return;
    const ter=m===MAT.terrain&&!!(W.groundMask&&W.groundMask.n);   // the ground mask's holes are read as the shader draws them
    if(!pos.array||(G.index&&!G.index.array)){gone++;return;}
    const e=o.matrixWorld.elements,A=pos.array,st=pos.itemSize||3,ix=G.index?G.index.array:null,n=ix?ix.length:pos.count,V=new Float32Array(9);
    const raw=!pos.normalized&&!pos.isInterleavedBufferAttribute;   // a quantized GLB (KHR_mesh_quantization: normalized integers) or an interleaved one is read through getX
    for(let i=0;i+2<n;i+=3){for(let k=0;k<3;k++){const vi=ix?ix[i+k]:i+k,j=vi*st,x=raw?A[j]:pos.getX(vi),y=raw?A[j+1]:pos.getY(vi),z=raw?A[j+2]:pos.getZ(vi);V[k*3]=e[0]*x+e[4]*y+e[8]*z+e[12];V[k*3+1]=e[1]*x+e[5]*y+e[9]*z+e[13];V[k*3+2]=e[2]*x+e[6]*y+e[10]*z+e[14];}
      const x0=Math.min(V[0],V[3],V[6]),x1=Math.max(V[0],V[3],V[6]),z0=Math.min(V[2],V[5],V[8]),z1=Math.max(V[2],V[5],V[8]);if(x1<bx0||x0>bx1||z1<bz0||z0>bz1)continue;
      const ax=V[3]-V[0],ay=V[4]-V[1],az=V[5]-V[2],cx=V[6]-V[0],cy=V[7]-V[1],cz=V[8]-V[2],ny=az*cx-ax*cz,nl=Math.hypot(ay*cz-az*cy,ny,ax*cy-ay*cx);if(nl<1e-9||Math.abs(ny)<.3*nl)continue;
      let T=null;for(let gx=Math.floor(x0/CK);gx<=Math.floor(x1/CK);gx++)for(let gz=Math.floor(z0/CK);gz<=Math.floor(z1/CK);gz++){const k=gx+','+gz;if(!need.has(k))continue;if(!T){T=V.slice();T.up=ny>0;T.ter=ter;}(B.get(k)||B.set(k,[]).get(k)).push(T);tris++;}}});
  const H=(x,z,cap)=>{const L=B.get(ck(x,z));let best=-1e9,bestD=-1e9;   // an up-facing surface first; a down-facing one (an underside: a rail, a lintel) only where none is
if(L)for(const V of L){const d=(V[5]-V[8])*(V[0]-V[6])+(V[6]-V[3])*(V[2]-V[8]);if(Math.abs(d)<1e-12)continue;
      const a=((V[5]-V[8])*(x-V[6])+(V[6]-V[3])*(z-V[8]))/d,b=((V[8]-V[2])*(x-V[6])+(V[0]-V[6])*(z-V[8]))/d,c=1-a-b;if(a<-1e-6||b<-1e-6||c<-1e-6)continue;if(V.ter&&groundMaskAt(W,x,z)>.5)continue;const y=a*V[1]+b*V[4]+c*V[7];if(y<=cap){if(V.up){if(y>best)best=y;}else if(y>bestD)bestD=y;}}return best>-1e9?best:bestD;};
  // the breaks along a profile (points P, heights h): [index, jump, at (m)], each bisected to 5 mm (a step keeps its height, a kink in a slope does not);
  // a slit under 0.2 m wide that the surface comes back from to within 1 cm is dropped
  const breaks=(P,h,cap)=>{let out=[];for(let i=1;i<P.length;i++){if(h[i]<-1e8||h[i-1]<-1e8){out.push([i,NaN,P[i][2]]);continue;}
      const pred=i>1&&h[i-2]>-1e8&&!(out.length&&out[out.length-1][0]===i-1)?2*h[i-1]-h[i-2]:h[i-1];if(Math.abs(h[i]-pred)<.008)continue;
      let a=P[i-1],b=P[i],ha=h[i-1],hb=h[i];for(let k=0;k<5;k++){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],hm=H(m[0],m[1],cap);if(Math.abs(hm-ha)>Math.abs(hb-hm)){b=m;hb=hm;}else{a=m;ha=hm;}}
      if(Math.abs(hb-ha)>=.006)out.push([i,hb-ha,a[2]]);}
    for(let k=0;k<out.length-1;k++){const[i,j,s]=out[k],q=out.findIndex((b,m)=>m>k&&b[2]-s<.2&&!isNaN(b[1])&&Math.abs(b[1]+j)<.01);if(!isNaN(j)&&q>0){out.splice(k,q-k+1);k--;}}
    // a slot: a drop of over 0.6 m (or nothing) that the surface comes back from within 0.6 m, to within 0.3 m of the level before it: one break, its
    // jump the difference of the two levels and its 4th field the slot's width (a fault of its own)
    for(let k=0;k<out.length;k++){const[i,j,s]=out[k];if(!(isNaN(j)||Math.abs(j)>.6)||i<1||h[i-1]<-1e8)continue;const lv=h[i-1];let m=-1;
      for(let t=i;t<h.length-1&&P[t][2]-s<.6;t++)if(h[t]>-1e8&&Math.abs(h[t]-lv)<.3&&Math.abs(h[t+1]-h[t])<.05){m=t;break;}if(m<0)continue;
      let e=k;while(e+1<out.length&&out[e+1][0]<=m)e++;out.splice(k,e-k+1,[m,h[m]-lv,s,+(P[m][2]-s).toFixed(2),i]);}
    return out;};
  const floorOf=(x,z,y)=>{const p=palPlatAt(x,z);if(p&&Math.abs(p.y-y)<.6)return p.id;if(W.foot.hits(x,z,.1,.1,0,0,f=>f.palTer==null))return'ring';if(W.streetAt&&W.streetAt(x,z)&&Math.abs(W.gy(x,z)-y)<.6)return'street';if(Math.abs(W.gy(x,z)-y)<.3)return'ground';return'other';};
  for(const e of E){const[x,z]=e.p,sg=e.head?-1:1,R=e.R,Y=e.Y,row={id:e.id,end:e.head?'head':'foot'},[lx,lz]=palL(x,z);row.at=[+lx.toFixed(1),+lz.toFixed(1)];
    // Q: the first point of the route a riser the stair's way from the end, 0.5 m off it at least; the surfaces read are those up to 0.6 m over the
    // higher of the two (not a parapet's or a cheek's top)
    let Q=null,yQ=e.y;for(let i=1;i<R.length;i++){if(isNaN(Y[i]))continue;if(sg*(Y[i]-e.y)>=.15&&Math.hypot(R[i][0]-x,R[i][1]-z)>=.5){Q=R[i];yQ=Y[i];break;}}
    const cap=Math.max(e.y,yQ)+.6,y0=H(x,z,cap);
    if(!Q){row.kind='the route has no riser';row.d=null;row.floor=+y0.toFixed(2);row.on=floorOf(x,z,y0);row.pass=false;rows.push(row);continue;}
    const th=Math.atan2(Q[1]-z,Q[0]-x),D=Math.min(Math.max(8,e.D||0),Math.hypot(Q[0]-x,Q[1]-z)+.8);let got=null;
    for(const rot of[0,5,-5,10,-10,15,-15,20,-20,25,-25,30,-30,35,-35,40,-40,45,-45,50,-50,55,-55,60,-60]){const t0=th+rot*DEG,ux=Math.cos(t0),uz=Math.sin(t0),P=[],h=[];
      for(let t=0;t<=D+1e-6;t+=DS){P.push([x+ux*t,z+uz*t,t]);h.push(H(x+ux*t,z+uz*t,cap));}if(h[0]<-1e8)continue;
      const Bk=breaks(P,h,cap);if(opt.dbg===e.id+'|'+(e.head?'head':'foot'))(row.dbg||(row.dbg=[])).push([rot,+h[0].toFixed(2),Bk.map(b=>[+b[2].toFixed(2),+(+b[1]).toFixed(3)])]);let ri=-1,bad=false;for(let k=0;k<Bk.length;k++){const j=Bk[k][1];if(isNaN(j)||sg*j<-.3||Math.abs(j)>.6){bad=true;break;}if(sg*j>=.1){ri=k;break;}}
      if(bad||ri<0)continue;const rj=sg*Bk[ri][1],pre=Bk.slice(0,ri),bj=pre.length?pre[pre.length-1]:null,gap=pre.find(b=>b[3]!=null);
      // a riser over 0.25 m right at the end, with no end piece of its own: the floor's paving (or a missing step) makes the first or last riser too tall
      let d,kind;if(!bj){if(rj<=.25){d=0;kind='flush';}else{d=null;kind=(e.head?'first':'last')+' riser '+rj.toFixed(2);}}
      else{d=bj[1];kind=d>.0005?'higher':d>=-.0305?'lower':'step down';if(rj>.25&&kind!=='lower')kind+=' (then a riser of '+rj.toFixed(2)+')';}
      if(gap)kind='slot '+gap[3]+' m, '+kind;
      const fi=bj?Math.max(0,(bj[3]!=null?bj[4]:bj[0])-1):0;got={rot,d,kind,gap:gap?gap[3]:0,len:+((Bk[ri][2])-(bj?bj[2]:0)).toFixed(2),fy:h[fi],q:P[fi],floors:pre.length};break;}
    if(!got){if(row.dbg)row.Q=[...palL(Q[0],Q[1]).map(v=>+v.toFixed(1))];row.kind='no clear line onto the stair';row.d=null;row.floor=+y0.toFixed(2);row.on=floorOf(x,z,y0);row.pass=false;rows.push(row);continue;}
    row.kind=got.kind;row.d=got.d==null?null:+got.d.toFixed(3);row.floor=+got.fy.toFixed(2);row.on=floorOf(got.q[0],got.q[1],got.fy);row.piece=got.len;if(got.rot)row.rot=got.rot;
    if(got.gap)row.slot=got.gap;row.pass=row.d!=null&&row.d<=.0005&&row.d>=-.0305&&!got.gap;rows.push(row);}
  const fail=rows.filter(r=>!r.pass);const r={ends:rows.length,stairs:S.length,joints:J.length,fail:fail.length,tris,walks,list:opt.all?rows:fail};if(gone)r.warn=gone+' meshes near the stairs have let their arrays go: load the page with ?keepgeo';
  console.log('pal stair ends',JSON.stringify({stairs:S.length,ends:rows.length,fail:fail.length}));return r;};
window.__palReach=()=>{const W=W0,units=[],gy=W.gy;
  const planted=[];if(W.palPlats)for(const P of W.palPlats){if(P.walk===false){planted.push(P.id);continue;}units.push({id:P.id,y:P.y,pts:P.pts,poly:true});}   // walk:false: a planted strip, not a floor (v30n, R10 乙)
  if(typeof PAL_SC!=='undefined'){const L=PAL_SC.land,m=.6;units.push({id:'scForecourt',y:PAL_SC.y,pts:[[L[0][0]-m,L[0][1]-m],[L[1][0]+m,L[1][1]-m],[L[2][0]+m,L[2][1]+m],[L[3][0]-m,L[3][1]+m]],poly:true});}   // the Scalae Caci forecourt (图七 east: the walk from the Magna Mater comes onto it)
  // the old ring floors (since H1 the only ones left are the west rings, PAL_PLAN.west.rings)
  {const T=W.foot.list.filter(f=>f.palTer!=null&&(W.palPlats||palInZone(f.cx,f.cz,3)));const par=T.map((f,i)=>i),fd=i=>par[i]===i?i:(par[i]=fd(par[i]));
    for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++)if(T[i].palTer===T[j].palTer&&Math.hypot(T[i].cx-T[j].cx,T[i].cz-T[j].cz)<T[i].r+T[j].r+1)par[fd(i)]=fd(j);
    const G=new Map();T.forEach((f,i)=>{const k=fd(i);(G.get(k)||G.set(k,[]).get(k)).push(f);});for(const[k,L]of G)units.push({id:'ring'+L[0].palTer+'#'+k,y:L[0].palTer,feet:L});}
  const inU=(u,x,z)=>{if(u.poly){const[lx,lz]=palL(x,z);return inPolyXZ(lx,lz,u.pts);}return u.feet.some(f=>{const dx=x-f.cx,dz=z-f.cz;return Math.abs(f.c*dx-f.s*dz)<f.hw&&Math.abs(f.s*dx+f.c*dz)<f.hd;});};
  const S=[];for(const s of W.palStairs||[])S.push({id:s.id,R:s.pts,Y:s.Y,links:s.links||null});
  const onRing=(x,z)=>W.foot.hits(x,z,3,3,0,0,f=>f.palTer==null);
  for(const h of W.hillStairs||[]){if(h.pal||!h.R||!h.R.some(p=>palInZone(p[0],p[1],10)||onRing(p[0],p[1])))continue;S.push({id:h.temple?'temple:'+h.temple:'hill@'+h.R[0].map(Math.round),R:h.R,Y:hillStairHeights(W,h.R,h.top)});}
  const adj=new Map(),link=(a,b)=>{(adj.get(a)||adj.set(a,new Set()).get(a)).add(b);(adj.get(b)||adj.set(b,new Set()).get(b)).add(a);},diag=[];
  // diagonal: more than 4 m of a stair over a terrace's floor (higher than it by 1.6 m) running more than 20 degrees off both the normal and the line of every
  // wall within 30 m: a stair runs along a wall or square to it, never across a terrace on a slant. Each segment is judged by its own direction, so a flight
  // that turns a corner (neC: along beltE's wall, then along footE's) is two straight runs, not one slanting chord.
  const slant=(A,B)=>{const ux=B[0]-A[0],uz=B[1]-A[1],l=Math.hypot(ux,uz);if(l<.05)return 0;const mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2;let best=90;
    for(const r of W.wallFeet||[]){if(!r.S.some(q=>Math.hypot(q.x-mx,q.z-mz)<30+l/2))continue;const a=Math.acos(Math.min(1,Math.abs((ux*r.nx+uz*r.nz)/l)))/DEG;best=Math.min(best,a,90-a);}return best;};
  for(const s of S){const on=new Set(s.links||[]);let over=0,ov=null,worst=0;
    for(let i=0;i<s.R.length;i++){const[x,z]=s.R[i],y=s.Y?s.Y[i]:gy(x,z);if(W.streetAt&&W.streetAt(x,z)&&Math.abs(gy(x,z)-y)<1.6)on.add('street');
      for(const u of units)if(inU(u,x,z)){if(Math.abs(y-u.y)<1.6)on.add(u.id);else if(y>u.y+1.6&&i>0){const b=slant(s.R[i-1],s.R[i]);if(b>20){over+=Math.hypot(x-s.R[i-1][0],z-s.R[i-1][1]);ov=ov||u.id;worst=Math.max(worst,b);}}}}
    for(const[i,j]of[[0,1],[s.R.length-1,s.R.length-2]]){if(j<0||j>=s.R.length||i===j)continue;const[x,z]=s.R[i],[px,pz]=s.R[j],l=Math.hypot(x-px,z-pz)||1,qx=x+(x-px)/l*.5,qz=z+(z-pz)/l*.5,y=s.Y?s.Y[i]:gy(x,z);   // round 4: and where one steps off
      for(const u of units)if(inU(u,qx,qz)&&Math.abs(y-u.y)<1.6)on.add(u.id);if(W.streetAt&&W.streetAt(qx,qz)&&Math.abs(gy(qx,qz)-y)<1.6)on.add('street');}   // either end, 0.5 m on (a head floor that starts at the end of the stair's apron, tlE/tlW)
    if(over>4)diag.push({stair:s.id,over:+over.toFixed(1),unit:ov,angle:+worst.toFixed(0)});
    const L=[...on];for(let a=0;a<L.length;a++)for(let b=a+1;b<L.length;b++)link(L[a],L[b]);s.on=L;}
  for(const P of W.palPlats||[])if(P.walk!==false)for(const id of P.join||[])link(P.id,id);   // P.join: terraces at one level walked into each other across an opened pier face (apE and sumE)
  // terraces at the same level that share an open edge ('s') are one floor (gApS, the filled hollow, and the south belt: 图一)
  if(W.palPlats)for(const P of W.palPlats)for(const e of P.E){if(e.k!=='s')continue;const mx=(e.a[0]+e.b[0])/2,mz=(e.a[1]+e.b[1])/2,l=Math.hypot(e.b[0]-e.a[0],e.b[1]-e.a[1])||1,nx=(e.b[1]-e.a[1])/l,nz=-(e.b[0]-e.a[0])/l;
    for(const Q of W.palPlats)if(Q!==P&&Math.abs(Q.y-P.y)<.3&&[1,-1].some(sg=>inPolyXZ(mx+sg*nx*.6,mz+sg*nz*.6,Q.pts)))link(P.id,Q.id);}
  if(W.palPlats)for(const P of W.palPlats)if(P.plaza)link(P.id,'street');   // round 4: a head floor open on a plaza that meets the streets (tlE, tlW: the plaza in front of block b)
  const seen=new Set(['street']),Q=['street'];while(Q.length){const a=Q.shift();for(const b of adj.get(a)||[])if(!seen.has(b)){seen.add(b);Q.push(b);}}
  const un=units.filter(u=>!seen.has(u.id)).map(u=>u.id);
  const r={units:units.length,reached:units.length-un.length,unreached:un,planted,diagonal:diag,stairs:S.map(s=>({id:s.id,on:s.on}))};console.log('pal reach',JSON.stringify({units:r.units,reached:r.reached,diagonal:diag.length}));return r;};
window.__temple=on=>{U.uDbg.value.z=on?0:1;W0.scene.traverse(m=>{if(m.isMesh&&m.material&&m.material.userData.oc){const W={marble:1,travertine:1,plaster:1,plaster2:1,plaster3:1,stone:1,tuff:1}[m.material.name];if(W){if(!m.material.userData.nc)m.material.userData.nc=m.material.color.clone();m.material.color.copy(on?m.material.userData.nc:m.material.userData.oc);}}});};

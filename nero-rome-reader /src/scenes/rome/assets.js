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
vec3 hillGrass(vec2 p){float sS=uSeason,dryA=smoothstep(.4,.95,sS)*(1.-smoothstep(1.45,1.95,sS));
 vec3 gSp=vec3(.103,.345,.036),gAu=vec3(.038,.169,.037),gWi=vec3(.047,.169,.044);
 vec3 gS=sS<2.?mix(gSp,gAu,sS*.5):sS<3.?mix(gAu,gWi,sS-2.):mix(gWi,gSp,sS-3.);
 vec3 gr=gS*mix(.82,1.18,fbm2(p*.05));gr=mix(vec3(dot(gr,vec3(.3,.5,.2))),gr,.78);
 vec3 c=mix(gr,vec3(.54,.42,.16)*mix(.85,1.15,fbm2(p*.03+7.)),dryA*(.9+.1*fbm2(p*.02+3.)));
 return mix(c,vec3(.25,.18,.1)*(.8+.35*fbm2(p*.3)),smoothstep(.62,.8,fbm2(p*.2+7.))*.6);}
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
 else if(pat>9.5){   // natural rock (the hills' tufa and limestone): wavy beds of uneven thickness (about 1.4-3.4 m), each its own tone, fractures at uneven spacing
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
    for(const n of names){try{const raw=Uint8Array.from(atob(D[n]),c=>c.charCodeAt(0)),buf=window.ROME_GLB_gz?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw.buffer;   // rome-assets.js holds gzipped, quantized GLBs (tools/glbopt.mjs)
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
window.__temple=on=>{U.uDbg.value.z=on?0:1;W0.scene.traverse(m=>{if(m.isMesh&&m.material&&m.material.userData.oc){const W={marble:1,travertine:1,plaster:1,plaster2:1,plaster3:1,stone:1,tuff:1}[m.material.name];if(W){if(!m.material.userData.nc)m.material.userData.nc=m.material.color.clone();m.material.color.copy(on?m.material.userData.nc:m.material.userData.oc);}}});};

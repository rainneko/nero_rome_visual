/* Domus Aurea, the Golden House, and the streets it replaced (novel vols 9-20; copy team's 小说文本/金宫分阶段生图说明_20261026.md, positions checked
   against this terrain in its section 4.6; author's choices 2026-10-26: a headless colossus in 59-68, state 8 shows the grown park only, the fire
   clears the Velia shoulder and the Carinae's south edge only).
   States: 0-6 the Velia and Carinae streets stand, with Lentulus's house and two crossroads shrines (their houses are in the aureaSite group);
   6 the Transitoria tower's loggia is glazed (the "golden house" of the townspeople); 7 (59-68) the half-built Golden House; 8 (68-100) the park, open.
   【史】Suetonius, Nero 31 (vestibule with the 120-foot statue, a triple colonnade a mile long, a lake like a sea, woods, a round dining hall that
   turned day and night); Tacitus, Annals 15.39-43; Pliny, NH 34.45 (Zenodorus' colossus); the Oppian wing with its octagonal hall still stands.
   The vestibule court and the Neronian porticoes of the Via Sacra (states 7-8) follow the MadainProject site plan (the vestibule on the Velia, the
   Via Sacra running straight up to it from the Forum; Van Deman, "The Neronian Sacra Via", AJA 1923). */
const AUREA={vest:[430,140],lent:[585,105],shrines:[[590,124],[448,176]],dine:[330,160],lake:{x:605,z:232,rx:118,rz:68,rot:-.17},
  gate:[681,128],route:[[467.8,157.8],[560,134],[572,116],[600,113],[612,130],[742,126],[752,200],[748,300]]};   // the gilded colonnade: from the vestibule's foot (its east face) along the valley's north edge, round Lentulus's site, then down the east end of the lake
// the ground the fire and the Golden House take: the valley, the Velia shoulder, the Carinae's south edge down to the slope, the dining hall's corner of the Palatine
function AUREA_SITE(x,z){return Math.hypot(x-572,z-200)<150||(x>380&&x<520&&z>20&&z<200)||(x>450&&x<1000&&z>-20&&z<120)||Math.hypot(x-AUREA.dine[0],z-AUREA.dine[1])<38;}
// the vestibule court in the frame of the Via Sacra's last straight (via; +x up the road to the ESE, +z to the SW), centred on the colossus: court x0..x1, -hz..hz
const VEST={x:430,z:140,rot:Math.atan2(-80,89),x0:-50,x1:38,hz:21,via:[[291,12],[380,92]],door:-40};   // door: u of the emperor's door in the south wall
function vestUV(x,z){const c=Math.cos(VEST.rot),s=Math.sin(VEST.rot),dx=x-VEST.x,dz=z-VEST.z;return[dx*c-dz*s,dx*s+dz*c];}
// the ground the vestibule (with its stair) and the porticoes of the Via Sacra take after the fire, 16 m either side of the straight: the houses there are shown in states 0-6 only
function AUREA_VEST_COURT(x,z){const[u,v]=vestUV(x,z);return u>VEST.x0-16&&u<VEST.x1+4&&Math.abs(v)<VEST.hz+4;}   // the court and its stair only
function AUREA_VEST_SITE(x,z){if(AUREA_VEST_COURT(x,z))return true;
  const[a,b]=VEST.via,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),t=((x-a[0])*dx+(z-a[1])*dz)/L;return t>8&&t<L+12&&Math.abs((z-a[1])*dx-(x-a[0])*dz)/L<16;}
// the park's east end, between the valley and its east wall (x 772): the houses there go with the fire too (the colonnade's east leg and the lake's east shore stand on it)
function AUREA_EAST(x,z){return x>660&&x<776&&z>118&&z<326;}
// the Oppian halls, the octagon wing (assets/models/oppian, from renders/domus-aurea/oppian-model-v1): frame frB(850,-40,190) on the Oppian pad
// (monuments.js PADS), floor at the pad's height; u east along the front, v south. The model spans u -187.4..45.8, v -47.5..39.2; its garden terraces
// step down south of the front: floor 0 to v 18.5, -3.06 to v 30.5, -6.19 to v 39.2. The octagon (room 128) is at the origin.
const OPP={x:850,z:-40,rot:Math.PI-190*Math.PI/180,u0:-187.4,u1:45.8,v0:-47.5,v1:39.2,steps:[18.5,30.5]};
function oppUV(x,z){const c=Math.cos(OPP.rot),s=Math.sin(OPP.rot),dx=x-OPP.x,dz=z-OPP.z;return[dx*c-dz*s,dx*s+dz*c];}
// the ground the halls take from 59, with 8-10 m round them: the houses there are shown in states 0-6 only
// the inner court's garden south of the halls (oppian_court.glb): the lawn shelf, and the stairs down the slope to the colonnade's gate
function oppCourtIn(u,v,m=0){return(u>-182-m&&u<43+m&&v>39-m&&v<126+m)||(u>-170-m&&u<-80+m&&v>=118-m&&v<200+m);}
function AUREA_OPPIAN(x,z){const[u,v]=oppUV(x,z);return u>OPP.u0-8&&u<OPP.u1+8&&v>OPP.v0-8&&v<OPP.v1+10||oppCourtIn(u,v,6);}
// romeH: the ground under and round the halls (y0: the pad's height). Under the halls and their upper court it is held 0.3 m under the floor (the
// pad's west end sags 1.5 m). From 2.5 m before the first terrace wall it falls to -8, under both terraces (floors -3.06, -6.19) and on as the lower
// lawn: deep enough that the terrain patch's smoothing (about 9 m) cannot lift it through them, and one level, so the Carinae compounds of states
// 0-6 still find flat ground there. 6 m past the last terrace it falls gently until it meets the hill's own slope. Past the model's ends it eases
// back over 20 m.
function oppGround(x,z,h,y0){const[u,v]=oppUV(x,z);if(u<OPP.u0-36||u>OPP.u1+36||v<OPP.v0-16||v>OPP.v1+90)return h;
  const w=1-sstep(0,20,Math.max(OPP.u0-10-u,u-OPP.u1-10,0));if(w<=0)return h;
  if(v<OPP.steps[0]-2.5)return lerp(h,y0-.3,w*(1-sstep(0,15,OPP.v0-4-v)));
  const s1=OPP.steps[0],t=v<s1-2.5?y0-.3:v<s1?lerp(y0-.3,y0-8,(v-s1+2.5)/2.5):v<OPP.v1+6?y0-8:y0-8-(v-OPP.v1-6)*.08;
  return lerp(h,Math.min(h,t),w);}
// after the terrain patch's smoothing: the inner court's ground as GPT's target gives it (oppian-court-ground.js), 0.12 m under it so the paths and
// treads stay on top; it eases in over 6 m from the target grid's edge
function oppCourtPost(x,z,h,y0){const[u,v]=oppUV(x,z),t=oppCourtH(u,v);if(t===null)return h;const C=OPP_COURT,e=Math.min(u-C.u0,C.u0+(C.nu-1)*C.d-u,v-C.v0,C.v0+(C.nv-1)*C.d-v);
  return lerp(h,y0+t-.12,sstep(0,6,e));}
// everything shown in states 0-6 only (preLayers 'aureaSite'): the Golden House ground, the vestibule and the Via Sacra's porticoes, the park's east end,
// the Oppian halls
// the round dining hall's view (coenatio v3 opens four bays towards the valley, θ -15..60° from its +x towards -z; the dais puts the eye 3.55 m over
// the floor at y 31.33): a house in that fan within 260 m whose roof (taken as 15 m over its ground) rises over the line from the eye down to the
// valley floor 300 m out goes with the fire, so the lake shows from the couches
function AUREA_DINEVIEW(x,z){const dx=x-AUREA.dine[0],dz=z-AUREA.dine[1],d=Math.hypot(dx,dz);if(d<18||d>260)return false;
  const lx=.866*dx+.5*dz,lz=-.5*dx+.866*dz,th=Math.atan2(-lz,lx)*180/Math.PI;if(th<-17||th>62)return false;return romeH(x,z)+15>34.9+(8-34.9)*d/300;}
function AUREA_GONE(x,z){return AUREA_SITE(x,z)||AUREA_VEST_SITE(x,z)||AUREA_EAST(x,z)||AUREA_OPPIAN(x,z)||AUREA_DINEVIEW(x,z);}
function aureaInLake(x,z,m=0){const L=AUREA.lake,dx=x-L.x,dz=z-L.z,c=Math.cos(L.rot),s=Math.sin(L.rot),u=c*dx-s*dz,v=s*dx+c*dz;return(u/(L.rx+m))**2+(v/(L.rz+m))**2<1;}
function aureaNearRoute(x,z,d){const P=AUREA.route;for(let i=1;i<P.length;i++)if(segD(x,z,P[i-1][0],P[i-1][1],P[i][0],P[i][1])<d)return true;return false;}
// dist/aurea-assets.js sets window.AUREA_GLB={coenatio, colossus, colossus_works: base64 GLBs} and calls aureaAssetsLoaded(); dist/oppian-assets.js
// sets window.OPP_GLB={oppian_s1, oppian_s3: gzipped GLBs} and calls oppAssetsLoaded(). Each file is fetched once, by the first layer that needs it.
// Model n goes into its layer G at frame F, S (the stand-in) hides, then cb(model).
const AUREA_PACK={aurea:{v:'AUREA_GLB',cb:'aureaAssetsLoaded',file:'aurea-assets.js',wait:[]},opp:{v:'OPP_GLB',cb:'oppAssetsLoaded',file:'oppian-assets.js',wait:[]}};
function aureaLoad(n,G,F,S,cb,pack='aurea'){const P=AUREA_PACK[pack];
  const go=async()=>{const D=window[P.v];if(!D||!D[n])return;let buf;
    try{const raw=b64u8(D[n]);buf=window[P.v+'_gz']?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw.buffer;}catch(e){console.warn(n+' glb',e);return;}
    new THREE.GLTFLoader().parse(buf,'',gl=>{const o=layTag(gl.scene,'models');o.name=n+'GLB';
      o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;romeMat(m.material);}});o.position.set(F.ox,F.oy,F.oz);o.rotation.y=F.rot;G.add(o);S.visible=false;
      if(cb)cb(o);},e=>console.warn(n+' glb',e));};
  if(window[P.v]){go();return;}P.wait.push(go);if(P.wait.length>1)return;
  window[P.cb]=()=>P.wait.forEach(f=>f());const s=document.createElement('script');s.src=P.file;
  s.onerror=()=>console.warn(P.file+' not found: the procedural stand-ins stay');document.head.appendChild(s);}
function buildDomusAurea(W,L,gy){const LK=AUREA.lake,R0=RNG(6464);
  const lakeRing=(m,n=56,u0=0,u1=1)=>{const c=Math.cos(LK.rot),s=Math.sin(LK.rot),P=[];for(let i=0;i<=n;i++){const a=(u0+(u1-u0)*i/n)*TAU,u=Math.cos(a)*(LK.rx+m),v=Math.sin(a)*(LK.rz+m);P.push([LK.x+c*u+s*v,LK.z-s*u+c*v]);}return P;};
  const yw=gy(LK.x,LK.z)+.25;
  const water=(G,pts)=>{const P=[],I=[];P.push(LK.x,yw,LK.z);for(const p of pts)P.push(p[0],yw,p[1]);for(let i=1;i<pts.length;i++)I.push(0,i,i+1,0,i+1,i);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,0,1,0);const m=new THREE.Mesh(g,MAT.tiber);m.receiveShadow=true;G.add(m);};
  const kerb=(g,pts,y)=>{g.set(2,.42);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],F=frame((a[0]+b[0])/2,Math.min(gy(...a),gy(...b),y)-.4,(a[1]+b[1])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));box(g,F,0,0,0,Math.hypot(b[0]-a[0],b[1]-a[1])/2+.3,y-F.oy+.45,.7,31);}};
  const hut=(g,x,z,r)=>{const F=frame(x,gy(x,z),z,r);g.set(3,.55);box(g,F,0,-.3,0,2.2,2.4,1.8,31);g.set(4,.3);g.poly([F.p(-2.5,2.1,-2.1),F.p(2.5,2.1,-2.1),F.p(2.5,3.1,0),F.p(-2.5,3.1,0)],F.d(0,1,-.5));g.poly([F.p(-2.5,3.1,0),F.p(2.5,3.1,0),F.p(2.5,2.1,2.1),F.p(-2.5,2.1,2.1)],F.d(0,1,.5));};

  /* ---- 0-6: the streets before the fire ---- */
  L('lentulus',0,(g)=>{const[x,z]=AUREA.lent,y=gy(x,z),F=frame(x,y,z,0);   // Lentulus's town house: the one the colonnade later bends round (vol 9 "这块本来…")
    courtBlock(W,g,F,{cx:0,cz:0,w:30,d:24,y0:0,nSt:2,sH:4,gH:5,cw:12,cd:9,part:0,seed:.31,sty:0,fl:8|2,peristyle:false,garden:true});
    W.trees.push([x+2,gy(x+2,z+17),z+17,'plane',1.75]);   // the old plane tree at his door
    for(const[sx,sz]of AUREA.shrines){const S=frame(sx,gy(sx,sz),sz,0);g.set(6,.55);box(g,S,0,0,0,.9,1.1,.7,31);for(const k of[-1,1])box(g,S,k*.6,1.1,.45,.1,1.3,.1,31);g.set(4,.35);g.poly([S.p(-.85,2.4,.6),S.p(.85,2.4,.6),S.p(0,2.95,.6)],[0,0,1]);g.set(2,.5);box(g,S,0,0,1.2,.35,.8,.3,31);   // a crossroads shrine (lararium compitale): niche on a block, small pediment, altar in front
      W.trees.push([sx+1.2,gy(sx+1.2,sz+1.4),sz+1.4,'flower',.35,null,2]);}});

  /* ---- the Transitoria tower's loggia: glazed in 58 (vol 13 露台), burnt in 64, glazed again later ---- */
  const TW=frame(238.33,0,307.01,-Math.PI/6),glaze=(g,gl,burnt)=>{const yb=87.72,yt=90.3,e=5.8,hw=5.3;   // rome_transitoria v2: tower centre model (50, 0), terrace parapet top 31.0, beam 33.6, between the corner piers
    for(let k=0;k<4;k++){const S=TW.sub(0,0,0,k*Math.PI/2);
      if(!burnt){gl.set(0,.5);box(gl,S,0,yb,e,hw,yt-yb,.04,31);}
      g.set(burnt?22:12,burnt?.9:.4);for(const x of[-1.77,1.77])box(g,S,x,yb,e,.06,yt-yb,.07,31);box(g,S,0,yb-.08,e,hw+.1,.1,.09,31);box(g,S,0,yt,e,hw+.1,.1,.09,31);}};
  L('transGlass',0,(g,G,gl)=>{glaze(g,gl,false);const m=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),lampMat(1,.78,.42,22));m.position.set(238.33,89.2,307.01);G.add(m);});   // 58: plate glass in gilded frames, a lamp at night
  L('transBurnt',0,(g)=>{glaze(g,null,true);});   // 64-68: the glass burst in the fire, the frames black
  L('transGlass2',0,(g,G,gl)=>{glaze(g,gl,false);const m=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),lampMat(1,.78,.42,22));m.position.set(238.33,89.2,307.01);G.add(m);});

  /* ---- the gilded colonnade (59-68 in part scaffolded, from 68 whole): three storeys over a podium that follows the valley floor ---- */
  const porticus=(g,scaff)=>{const P=AUREA.route;
    for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.max(2,Math.ceil(len/6));let yt=-1e9,yb=1e9;
      for(let k=0;k<=n;k++){const h=gy(a[0]+dx*k/n,a[1]+dz*k/n);yt=Math.max(yt,h);yb=Math.min(yb,h);}
      const y0=yt+.4,F=frame((a[0]+b[0])/2,y0,(a[1]+b[1])/2,Math.atan2(-dz,dx)),hl=len/2+.4;
      if(scaff&&i%2===0)continue;   // 59-68: every other stretch still a skeleton (porticusScaff)
      // from 68 the inner court's gate (vol 18; the copy team's plan: in the middle of the colonnade): a 6 m bay open from the valley floor (about
      // 5 m under the podium's top here) through the podium and the back wall to the first floor, onto the foot of the court's stairs (oppian_court)
      const G=AUREA.gate,gt=((G[0]-a[0])*dx+(G[1]-a[1])*dz)/len,gn=Math.abs((G[1]-a[1])*dx-(G[0]-a[0])*dz)/len,gx=!scaff&&gt>8&&gt<len-8&&gn<6?gt-len/2:null,gw=3,yf=gx===null?0:gy(...G)-y0;
      const span=(x0,x1,f)=>{if(gx===null||x1<=gx-gw||x0>=gx+gw)return f(x0,x1);if(x0<gx-gw)f(x0,gx-gw);if(x1>gx+gw)f(gx+gw,x1);};
      g.set(2,.45);span(-hl,hl,(x0,x1)=>box(g,F,(x0+x1)/2,yb-y0-.5,0,(x1-x0)/2,y0-yb+.5,4.2,31));   // podium down to the lowest ground
      g.set(24,.86);span(-hl,hl,(x0,x1)=>box(g,F,(x0+x1)/2,0,-3.6,(x1-x0)/2,18.6,.6,31));   // back wall, three storeys
      if(gx!==null){box(g,F,gx,5.2,-3.6,gw,13.4,.6,31);g.set(2,.5);for(const sd of[-1,1])box(g,F,gx+sd*(gw+.35),yf,-3.6,.35,5.2-yf,.8,31);box(g,F,gx,4.4,-3.6,gw+.7,.8,.85,31);   // the wall over the bay, its jambs and lintel
        g.set(11,.3);box(g,F,gx,yf-.25,0,gw,.25,4.4,31);}   // the passage's paving, level with the valley
      for(let lv=0;lv<3;lv++){const yl=lv*6.2;for(let x=-hl+1.5;x<=hl-1;x+=3.6)if(lv||gx===null||Math.abs(x-gx)>gw)W.cols.cor.push([...F.p(x,yl,2.8),F.rot,5.2,[1,.9,.62]]);   // columns with gilded capitals (warm tint)
        g.set(2,.5);box(g,F,0,yl+5.2,0,hl,.9,3.4,31);g.set(12,.4);box(g,F,0,yl+5.55,3.42,hl,.22,.05,31);}   // entablature with a gilded band
      g.set(4,.5);g.poly([F.p(-hl,19,3.6),F.p(hl,19,3.6),F.p(hl,20.8,-3.8),F.p(-hl,20.8,-3.8)],F.d(0,1,.3));}};
  L('porticus7',0,(g)=>porticus(g,true));L('porticus8',0,(g)=>porticus(g,false));
  L('porticusScaff',0,(g)=>{const P=AUREA.route;for(let i=2;i<P.length;i+=2){const a=P[i-1],b=P[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);let yt=-1e9;for(let k=0;k<=8;k++)yt=Math.max(yt,gy(a[0]+dx*k/8,a[1]+dz*k/8));
      const F=frame((a[0]+b[0])/2,yt+.4,(a[1]+b[1])/2,Math.atan2(-dz,dx)),hl=len/2;g.set(2,.45);box(g,F,0,-3,0,hl,3,4.2,31);g.set(24,.86);box(g,F,0,0,-3.6,hl,9,.6,31);   // half-built: podium and the wall to the first floor
      g.set(3,.35);for(let x=-hl;x<=hl;x+=3)for(const z of[3.2,4.8])box(g,F,x,0,z,.08,15,.08,31);for(let y=3;y<15;y+=3)for(const z of[3.2,4.8])box(g,F,0,y,z,hl,.08,.08,31);}});   // timber scaffolding

  /* ---- the lake: half dug 59-68, finished later ---- */
  L('aureaLake7',0,(g,G)=>{const half=lakeRing(0,28,.25,.75);water(G,half);kerb(g,half,yw);   // the west half holds water behind a half-built stone shore
    g.set(21,.3);const mud=lakeRing(0,28,-.25,.25);
    for(let i=1;i<mud.length;i++){const a=mud[i-1],b=mud[i];g.poly([[LK.x+(LK.rx*.05),yw-.1,LK.z],[a[0],gy(...a)+.1,a[1]],[b[0],gy(...b)+.1,b[1]]],[0,1,0]);}   // the east half: wet mud
    const R=RNG(77);g.set(3,.5);for(let i=0;i<70;i++){const u=.1+R()*.85,v=(R()-.5)*1.7,c=Math.cos(LK.rot),s=Math.sin(LK.rot),uu=u*LK.rx,vv=v*LK.rz*.9,x=LK.x+c*uu+s*vv,z=LK.z-s*uu+c*vv;if(!aureaInLake(x,z))continue;box(g,frame(x,yw,z,R()),0,-.5,0,.09,1.2+R(),.09,31);}   // stakes in the mud
    for(const[x,z]of[[690,200],[700,250],[660,290]]){g.set(21,.42);lathe(g,frame(x,gy(x,z),z,0),0,0,0,[[7,0],[4,2.6],[0,3.4]],10);}   // spoil heaps
    scaffold(g,frame(690,gy(690,230),230,0),0,0,7,0,6,false);
    g.set(3,.5);for(const[x,z]of[[675,215],[682,262],[650,300]]){const F=frame(x,gy(x,z),z,R()*3);box(g,F,0,.6,0,1.2,.7,.8,31);for(const s of[-1,1])lathe(g,F.sub(0,.45,s*.85,0),0,0,0,[[.45,0],[.45,.12],[0,.12]],8);}});   // earth carts
  L('aureaLake8',0,(g,G)=>{const ring=lakeRing(0,56);water(G,ring);kerb(g,ring,yw);
    g.set(2,.5);for(const t of[.62,.7,.78]){const p=lakeRing(1.2,1,t,t)[0],F=frame(p[0],yw,p[1],0);for(let k=0;k<4;k++)box(g,F,0,-k*.3,0,3.2,.3,1-k*.25,31);}});   // landing steps on the west shore

  /* ---- the colossus on the Velia, in the vestibule: headless 59-68 (iron in the neck, a nest), then the head of the Sun (c. 70), not Nero's face ---- */
  /* ---- the vestibule: a porticoed court on the Velia round the colossus, on the axis of the Via Sacra (VEST). The floor is just above the highest
     ground under it; the east half stands on arcaded substructures over the valley, the west end meets the road with a gabled porch and a flight
     of steps. Wings on three sides, a wall behind them; the east wing is an open loggia over the valley. 59-68 the platform stands, partly
     rough, with the south wing up, the west wing's columns, the north wall half-high in scaffolding; from 68 finished and paved ---- */
  const VF=(()=>{const F0=frame(VEST.x,0,VEST.z,VEST.rot);let m=-1e9;for(let u=VEST.x0;u<=VEST.x1;u+=4)for(let v=-VEST.hz;v<=VEST.hz;v+=3){const q=F0.p(u,0,v);m=Math.max(m,gy(q[0],q[2]));}return frame(VEST.x,m+.3,VEST.z,VEST.rot);})();
  const inVest=(x,z,m)=>{const[u,v]=vestUV(x,z);return u>VEST.x0-m&&u<VEST.x1+m&&Math.abs(v)<VEST.hz+m;};
  const vest=(g,done)=>{const F=VF,{x0,x1,hz}=VEST,cx=(x0+x1)/2,hx=(x1-x0)/2,D=7,H=7.6,WH=H+2.7,tint=[1,.92,.7],gw=9;
    terraceRect(W,g,F,cx,0,hx,hz,0,done?11:21,done?{}:{unf:{E:{x0:-hz-1,x1:4},S:{x0:12,x1:hx+1}}});
    const N=F.sub(cx,0,-hz,0),Sd=F.sub(cx,0,hz,Math.PI),Wd=F.sub(x0,0,0,Math.PI/2),E=F.sub(x1,0,0,-Math.PI/2);   // the four sides: local x along the side, +z into the court
    const wall=(S,a,b,h)=>{g.set(24,.86);box(g,S,(a+b)/2,0,-.35,(b-a)/2,h,.4,31);if(h>=WH){g.set(2,.5);box(g,S,(a+b)/2,h-.5,-.55,(b-a)/2+.2,.5,.25,31);}};   // the outer wall, with a cornice on the outside once it has its full height
    const wing=(S,L,o={})=>{const n=Math.round((L-2)/3.9),sp=(L-2)/n;   // columns at z=D on a step, entablature with a gilded band, a lean-to roof back to the wall; o.open: a second row on the outer edge instead of the wall
      g.set(2,.5);box(g,S,0,0,D*.5+.1,L/2,.35,D*.5+.9,31);
      for(let i=0;i<=n;i++){const x=-L/2+1+i*sp;if(o.skip&&o.skip(x))continue;W.cols.cor.push([...S.p(x,.35,D),S.rot,H,tint]);if(o.open)W.cols.cor.push([...S.p(x,.35,.3),S.rot,H,tint]);}
      if(o.roof===false)return;
      g.set(2,.5);box(g,S,0,H+.35,D,L/2,.95,.5,31);g.set(12,.4);box(g,S,0,H+.7,D+.52,L/2,.22,.04,31);if(o.open){g.set(2,.5);box(g,S,0,H+.35,.3,L/2,2.3,.5,31);}
      g.set(4,.5);g.poly([S.p(-L/2,H+1.3,D+.7),S.p(L/2,H+1.3,D+.7),S.p(L/2,H+2.65,-.8),S.p(-L/2,H+2.65,-.8)],S.d(0,1,.18));};
    const wl=2*(hz-D-1);   // the west and east wings fit between the long ones
    {const rd=cx-VEST.door,dw=1.7,dh=4.4;wall(Sd,-hx,rd-dw,WH);wall(Sd,rd+dw,hx,WH);g.set(24,.86);box(g,Sd,rd,dh,-.35,dw,WH-dh,.4,31);g.set(2,.5);box(g,Sd,rd,WH-.5,-.55,dw,.5,.25,31);   // the emperor's door, onto his walk from the dining hall
      g.set(6,.5);for(const s of[-1,1])box(g,Sd,rd+s*(dw+.15),0,-.8,.2,dh,.12,31);box(g,Sd,rd,dh,-.8,dw+.35,.35,.12,31);   // its marble frame
      const q=Sd.p(rd,0,-2),r=Math.max(.3,F.oy-gy(q[0],q[2])),n=Math.max(1,Math.ceil(r/.3)),rh=r/n;g.set(2,.5);for(let k=1;k<=n;k++)box(g,Sd,rd,-r-1,-.75-(k-.5)*.42,dw+.3,r+1-k*rh,.21,31);}   // steps down to the ground
    wing(Sd,2*hx);   // the south wing (towards the Palatine) is the first one finished
    wall(N,-hx,hx,done?WH:4);if(done)wing(N,2*hx);
    else{g.set(3,.35);for(let x=-hx;x<=hx;x+=3)for(const z of[-1.3,-2.5])box(g,N,x,-.5,z,.08,9,.08,31);for(let y=2.5;y<9;y+=2.5)for(const z of[-1.3,-2.5])box(g,N,0,y,z,hx,.08,.08,31);   // scaffolding outside the half-high north wall
      g.set(6,.5);for(let k=0;k<7;k++){const x=-30+k*7.5;for(let j=0;j<1+k%3;j++)box(g,N,x+(j%2)*1.6,j*.9,10.5+j*.4,.45,.85,.45,31);}}   // column drums waiting on the floor
    for(const s of[-1,1])wall(Wd,s>0?gw:-hz,s>0?hz:-gw,done?WH:5.5);if(done){g.set(24,.86);box(g,Wd,0,H+1.3,-.35,gw,WH-H-1.3,.4,31);}   // the west wall and its gate (the porch's roof rides over it)
    wing(Wd,wl,{skip:x=>Math.abs(x)<gw-2,roof:done});
    if(done){g.set(2,.5);box(g,E,0,.35,-.25,hz,1.05,.25,31);wing(E,wl,{open:true});}   // the east loggia over the valley, behind a parapet
    // the porch in front of the gate: four columns, a pediment, steps down to the road
    const P=Wd,Hp=9.2,ex=gw+.5;g.set(2,.5);box(g,P,0,0,-4,ex,.35,4,31);
    {let yr=F.oy;for(const v of[-ex,0,ex]){const q=P.p(v,0,-11);yr=Math.min(yr,gy(q[0],q[2]));}const r=F.oy-yr+.35,n=Math.max(1,Math.ceil(r/.3)),rh=r/n;
      for(let k=1;k<=n;k++)box(g,P,0,-r-1,-8-(k-.5)*.45,ex,r+1+.35-k*rh,.23,31);}
    if(!done)return;
    for(const x of[-7.5,-2.5,2.5,7.5])W.cols.cor.push([...P.p(x,.35,-7),P.rot,Hp,tint]);
    const yE=.35+Hp;g.set(2,.5);box(g,P,0,yE,-3.9,ex,1.2,3.6,31);g.set(12,.4);box(g,P,0,yE+.45,-7.52,ex,.25,.04,31);
    g.set(2,.55);g.poly([P.p(ex,yE+1.2,-7.5),P.p(-ex,yE+1.2,-7.5),P.p(0,yE+4,-7.5)],P.d(0,0,-1));   // the pediment
    g.set(4,.5);for(const s of[-1,1])g.poly(s>0?[P.p(0,yE+4.1,.2),P.p(ex+.4,yE+1.1,.2),P.p(ex+.4,yE+1.1,-7.9),P.p(0,yE+4.1,-7.9)]:[P.p(-ex-.4,yE+1.1,.2),P.p(0,yE+4.1,.2),P.p(0,yE+4.1,-7.9),P.p(-ex-.4,yE+1.1,-7.9)],P.d(s*.3,1,0));
    const R=RNG(6802);for(let i=0;i<22;i++){const u=x0+8+R()*(x1-x0-20),v=(R()-.5)*2*(hz-9);if(Math.abs(u)<9&&Math.abs(v)<9)continue;const q=F.p(u,0,v);W.people.push([q[0],F.oy+.06,q[2]]);}};   // people crossing the court
  L('vest7',0,(g)=>vest(g,false));L('vest8',0,(g)=>vest(g,true));

  /* ---- the Via Sacra's last straight, rebuilt after the fire with porticoes and shops on both sides (【史】Tacitus, Annals 15.43: porticoes in front of
     the houses, built at Nero's cost): stepped every two bays up the slope, broken only where an older house still stands. 59-68 the south-west side
     stands, the north-east one is a podium and a low wall in scaffolding ---- */
  const VS=frame(VEST.via[0][0],0,VEST.via[0][1],VEST.rot),vsLen=Math.hypot(VEST.via[1][0]-VEST.via[0][0],VEST.via[1][1]-VEST.via[0][1]);
  const vsKeep=W.foot.list.filter(o=>o.tag!=='road'&&o.tag!=='life-furnishing'&&Math.hypot(o.cx-335,o.cz-52)<o.r+90&&!AUREA_SITE(o.cx,o.cz)&&!AUREA_VEST_SITE(o.cx,o.cz));   // what still stands by the road after 64
  const viaSacra=(g,sd,done)=>{const de=4.6,d0=7.4,d1=11.8,Hc=4.6,c=Math.cos(VEST.rot),s=Math.sin(VEST.rot),z1=d1-d0;   // de: the road's edge; d0..d1: the portico, columns at the front
    for(let t=14;t+7.2<=vsLen+4;t+=7.2){const q=VS.p(t+3.6,0,sd*(d0+d1)/2);if(vsKeep.some(o=>obb(o,{cx:q[0],cz:q[2],hw:3.8,hd:(d1-de)/2+.4,c,s})))continue;
      let yt=-1e9,yb=1e9,yf=1e9;for(const a of[0,3.6,7.2])for(const d of[de,d0,d1]){const p=VS.p(t+a,0,sd*d),h=gy(p[0],p[2]);if(d<d1)yt=Math.max(yt,h);yb=Math.min(yb,h);if(d===de)yf=Math.min(yf,h);}
      const P=VS.sub(t+3.6,yt+.25,sd*d1,sd>0?Math.PI:0);   // floor level with the road's edge and the column line, the back wall retaining the slope behind; wall at z=0, the road towards +z
      g.set(2,.45);box(g,P,0,yb-yt-.65,z1/2-.15,3.6,yt-yb+.65,z1/2+.4,31);
      {const r=yt+.25-yf,n=Math.min(8,Math.ceil(r/.3)),run=(d0-de-.25)/8;if(r>.3)for(let k=1;k<=n;k++)box(g,P,0,-r-.5,z1+.25+(k-.5)*run,3.6,r+.5-k*r/n,run/2,31);}   // steps down to the road
      g.set(9,.42);box(g,P,0,0,-.3,3.6,done?Hc+1.9:2.4,.3,31);
      if(!done){g.set(3,.35);for(const x of[-3.6,0])for(const z of[z1-.3,z1+.9])box(g,P,x,0,z,.08,7,.08,31);for(let y=2;y<7;y+=2.4)box(g,P,0,y,z1+.3,3.6,.08,.08,31);continue;}   // poles and ledgers where the columns will go
      g.set(3,.3);box(g,P,0,0,.02,1.3,3.2,.04,31);   // a shop in each segment, its timber shutters
      for(const x of[-1.8,1.8])W.cols.dor.push([...P.p(x,0,z1-.3),P.rot,Hc,[1,.97,.9]]);
      g.set(2,.5);box(g,P,0,Hc,z1-.3,3.75,.7,.45,31);g.set(4,.5);g.poly([P.p(-3.75,Hc+.7,z1+.3),P.p(3.75,Hc+.7,z1+.3),P.p(3.75,Hc+1.9,-.6),P.p(-3.75,Hc+1.9,-.6)],P.d(0,1,.2));}};
  L('viaSacra7',0,(g)=>{viaSacra(g,1,true);viaSacra(g,-1,false);});L('viaSacra8',0,(g)=>{viaSacra(g,1,true);viaSacra(g,-1,true);});

  const colossus=(g,head)=>{const F=VF.sub(0,0,0,-Math.PI/2),u=3.1;   // on the vestibule's floor, facing down the Via Sacra (+z)
    g.set(2,.5);box(g,F,0,-2,0,6.5,8,6.5,31);g.set(6,.6);box(g,F,0,6,0,7,.8,7,31);   // the base
    const y=6.8;g.set(13,.4);
    lathe(g,F,0,y,0,[[1.45*u,0],[1.5*u,.4*u],[1.15*u,1.5*u],[1.0*u,3.4*u],[1.15*u,4.7*u],[0,4.7*u]],10,13);box(g,F,0,y+4.6*u,0,1.55*u,3.1*u,1.0*u,31);
    box(g,F,-1.95*u,y+4.9*u,0,.38*u,2.7*u,.38*u,31);box(g,F,2.0*u,y+6.5*u,0,.5*u,1.0*u,.38*u,31);box(g,F,2.55*u,y+7.4*u,0,.42*u,1.1*u,.36*u,31);box(g,F,3.0*u,y+8.4*u,0,.38*u,1.2*u,.34*u,31);
    if(head){lathe(g,F,0,y+7.6*u,0,[[.4*u,0],[.75*u,.45*u],[.85*u,1.2*u],[.7*u,2.0*u],[0,2.3*u]],10,13);g.set(12,.4);
      for(let k=0;k<7;k++){const a=(k/6-.5)*2.4,S=F.sub(Math.sin(a)*.8*u,y+8.9*u,-.15*u,0);box(g,S,0,0,0,.09*u,1.6*u,.06*u,31);}}   // the radiate crown of Sol
    else{g.set(22,.9);for(const[ox,oz,h]of[[-.35,0,2.6],[.3,.2,3.2],[0,-.3,2.2],[.5,-.2,1.8]])box(g,F,ox*u,y+7.6*u,oz*u,.06*u,h,.06*u,31);
      g.set(3,.8);lathe(g,F,.3*u,y+7.6*u+3.2,.2*u,[[.9,0],[1,.35],[.6,.45],[0,.35]],8);   // iron bars out of the neck, a bird's nest on the tallest
      g.set(3,.6);for(const s of[-1,1])for(const t of[-1,1])box(g,F.sub(s*8,0,t*8,s*t*.6),0,-1,0,.18,10,.18,31);}};   // casting timbers round the base (the court round it is still bare earth)
  /* the model is assets/models/aurea/colossus.glb (version C, "long legs", of renders/domus-aurea/proportion-20261028, its head put on the chest's
     midline by tools/models/rome/colossus_centre_head.mjs): a 13 m stone base 6.7 m high, the figure to 36.6 m, the crown's rays to 39.4 m, facing down
     the Via Sacra. 59-68 the same body without its head, neck, curls and crown, with colossus_works.glb (tools/models/rome/colossus_works.mjs, from
     Kimi's construction model): iron bars out of the neck, a nest on the tallest, timber props and casting debris round the base. Both come in
     dist/aurea-assets.js with the dining hall; the procedural statue stands in until then, or for good without the file. */
  const COLOSSUS_HEAD=['Sol_Head_Continuous_Neck','Original_A3_Curls_And_Ears','Seven_Ray_Crown'];
  const colossusGLB=(G,head)=>{const F=VF.sub(0,0,0,-Math.PI/2),S=new THREE.Group(),g2=new GB(1<<13);S.name='colossusStand';G.add(S);colossus(g2,head);const m=g2.mesh(MAT.city);if(m)S.add(m);
    W.anim.push(()=>{if(!G.visible||S.userData.asked)return;S.userData.asked=1;
      if(head){aureaLoad('colossus',G,F,S);return;}
      aureaLoad('colossus',G,F,S,o=>{for(const n of COLOSSUS_HEAD){const h=o.getObjectByName(n);if(h)h.removeFromParent();}});aureaLoad('colossus_works',G,F,S);});};
  L('colossus7',0,(g,G)=>colossusGLB(G,false));L('colossus8',0,(g,G)=>colossusGLB(G,true));

  /* ---- the walks: from 68 a gravel ring round the lake, a walk along the colonnade's front (from the vestibule's foot to the east end), links from the
     ring to it, the paved way in from the gate; the emperor's walk from the dining hall's back to a door in the vestibule's south wall, round the two
     houses that outlived the fire (dirt 59-68, paved later); 59-68 the carts' tracks from the spoil heaps in the mud half round the colonnade's south end and out of a gate in the east wall onto the lanes ---- */
  const walk=(g,pts,w,part,seed=.5,dy=.15)=>{const P=densify(pts,3),n=P.length,k=Math.max(1,Math.ceil(w/4));g.set(part,seed);   // a strip on the ground, split across every 4 m
    const N=P.map((p,i)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[-dz/l,dx/l];}),V=(i,s)=>{const x=P[i][0]+N[i][0]*s,z=P[i][1]+N[i][1]*s;return[x,gy(x,z)+dy,z];};
    for(let i=1;i<n;i++)for(let j=0;j<k;j++){const s0=-w/2+w*j/k,s1=-w/2+w*(j+1)/k;g.poly([V(i-1,s0),V(i-1,s1),V(i,s1),V(i,s0)],[0,1,0]);}};
  const offsetLine=(P,d)=>P.map((p,i)=>{const nr=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);return[-dz/l,dx/l];},n0=i>0?nr(P[i-1],p):nr(p,P[i+1]),n1=i<P.length-1?nr(p,P[i+1]):n0,mx=n0[0]+n1[0],mz=n0[1]+n1[1],l=Math.hypot(mx,mz),k=d/Math.max(.5,(mx*n0[0]+mz*n0[1])/l);return[p[0]+mx/l*k,p[1]+mz/l*k];});   // d > 0: the colonnade's open (front) side
  const nearest=(P,q)=>densify(P,2).reduce((b,p)=>Math.hypot(p[0]-q[0],p[1]-q[1])<Math.hypot(b[0]-q[0],b[1]-q[1])?p:b);
  const RDF=(()=>{const cx=(VEST.x0+VEST.x1)/2;return{S:VF.sub(cx,0,VEST.hz,Math.PI),rd:cx-VEST.door};})();   // the south wall's frame (+z into the court) and the door's x in it
  const WALK=(()=>{const ring=lakeRing(6,72),front=offsetLine(AUREA.route,6.6),gp=ring.filter(p=>p[1]>LK.z).reduce((b,p)=>Math.abs(p[0]-620)<Math.abs(b[0]-620)?p:b),
      E=lakeRing(6,1,0,0)[0],N=lakeRing(6,1,.75,.75)[0],Wp=lakeRing(6,1,.5,.5)[0],cF=frame(AUREA.dine[0],0,AUREA.dine[1],-30*DEG),bk=r=>{const a=290*DEG,q=cF.p(Math.cos(a)*r,0,Math.sin(a)*r);return[q[0],q[2]];},df=RDF.S.p(RDF.rd,0,-3.4);
    return{ring,front,links:[[E,nearest(front,E)],[N,nearest(front,N)],[Wp,front[0]]],gate:[[620,318],[620,gp[1]-1]],royal:[bk(18.5),bk(27.5),[381,146.5],[df[0],df[2]]],
      haul:[[[688,212],[712,238],[713,262],[715,292],[740,309],[772,310],[795,309]],[[668,284],[713,276]]]};})();   // from the heaps in the pit, past the colonnade's south end, out of the east gate onto the lanes
  const nearWalk=(x,z,m,state)=>{const L=state===7?[WALK.royal,...WALK.haul]:[WALK.ring,WALK.front,...WALK.links,WALK.gate,WALK.royal];for(const P of L)for(let i=1;i<P.length;i++)if(segD(x,z,P[i-1][0],P[i-1][1],P[i][0],P[i][1])<m)return true;return false;};

  /* ---- the wood: planted thick from the Velia across the valley, no lamp in it; the same trees grown tall by the time the park is open ---- */
  const grovePts=[];{const R=RNG(6401);for(let x=380;x<760;x+=7.5)for(let z=140;z<340;z+=7.5){const px=x+(R()-.5)*5,pz=z+(R()-.5)*5;
      if(!(Math.hypot(px-572,pz-200)<146||(px>385&&px<515&&pz>145&&pz<195)))continue;if(aureaInLake(px,pz,9)||aureaNearRoute(px,pz,11)||Math.hypot(px-AUREA.vest[0],pz-AUREA.vest[1])<20)continue;
      if(Math.hypot(px-455,pz-300)<14)continue;grovePts.push([px,pz,R(),R()]);}}   // (the houses' footprints here are gone by 59: no Foot test)
  const kinds=r=>r<.35?'broad':r<.55?'plane':r<.72?'pine':r<.85?'cyp':'broadD';
  L('grove7',0,()=>{for(const[x,z,r,s]of grovePts){if(inVest(x,z,6)||nearWalk(x,z,4.5,7)||z>318)continue;W.trees.push([x,gy(x,z),z,kinds(r),.5+s*.2]);}});   // (none on the vestibule's platform or against its walls, on the paths or outside the south wall)
  L('grove8',0,()=>{for(const[x,z,r,s]of grovePts){if(s<.3&&aureaInLake(x,z,30)||inVest(x,z,6)||nearWalk(x,z,4.5,8)||z>318||Math.abs(x-620)<33&&z>310)continue;W.trees.push([x,gy(x,z),z,kinds(r),1+s*.35]);}});   // clearings of lawn open on the shore

  /* ---- 59-68: the building site round the wood: a wall with a breach (children outside), refugee huts by the lake ---- */
  L('aureaBuild7',0,(g)=>{const wall=(a,b,gap)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6);for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,m=(t0+t1)/2;if(gap&&m>gap[0]&&m<gap[1])continue;const p=lp(a,b,t0),q=lp(a,b,t1),F=frame((p[0]+q[0])/2,Math.min(gy(...p),gy(...q))-.4,(p[1]+q[1])/2,Math.atan2(-(q[1]-p[1]),q[0]-p[0]));g.set(24,.6);box(g,F,0,0,0,Math.hypot(q[0]-p[0],q[1]-p[1])/2+.2,3.6,.35,31);}};
    wall([470,322],[770,322],[.46,.54]);wall([772,140],[772,322],[.89,.97]);g.set(3,.5);for(const z of[304.4,316.1])box(g,frame(772,gy(772,z),z,0),0,-.3,0,.18,4.6,.18,31);   // the carts' gate in the east wall, south of the colonnade
    for(let i=0;i<5;i++)W.people.push([608+i*3,gy(608+i*3,330),330]);   // children squatting outside the breach
    const R=RNG(31);for(let i=0;i<9;i++){const x=500+R()*30,z=250+R()*45;if(aureaInLake(x,z,3))continue;hut(g,x,z,R()*3);}});

  /* ---- from 68: the park, open: half for everyone, a quarter the inner court, a quarter the emperor's (the Palatine slope, the Claudian water front) ---- */
  L('aureaPark8',0,(g)=>{const wall=(a,b,gap,h=3.6)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6);for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,m=(t0+t1)/2;if(gap&&m>gap[0]&&m<gap[1])continue;const p=lp(a,b,t0),q=lp(a,b,t1),F=frame((p[0]+q[0])/2,Math.min(gy(...p),gy(...q))-.4,(p[1]+q[1])/2,Math.atan2(-(q[1]-p[1]),q[0]-p[0]));g.set(24,.6);box(g,F,0,0,0,Math.hypot(q[0]-p[0],q[1]-p[1])/2+.2,h,.35,31);}};
    wall([470,322],[770,322],[.4,.6]);wall([772,140],[772,322]);   // the breach widened into the gate
    {const F=frame(620,gy(620,322),322,0);g.set(2,.5);for(const s of[-1,1])box(g,F,s*30,-.4,0,1.1,5.4,1.1,31);walk(g,[[620,330],[620,316]],58,11,.5,.1);walk(g,[[591,324.4],[649,324.4]],.2,41,.5,.13);   // gate piers; the paving and the line cut in it
      g.set(6,.6);box(g,F,34,-.2,4,.55,2.4,.25,31);}   // the stone with the garden's rules beside the gate
    wall([395,142],[395,250],[.34,.46],1.3);for(const z of[180,190])W.people.push([398,gy(398,z),z]);   // the royal quarter: a low wall and guards, not a fortress
    {const F=frame(680,gy(680,140),140,0);g.set(3,.5);box(g,F,0,0,0,2.2,1,1,31);for(let i=0;i<14;i++)W.people.push([680-3-i*1.6,gy(677-i*1.6,146),146]);}   // the hearing table under the colonnade and its queue
    const R=RNG(68);for(let i=0;i<160;i++){const x=470+R()*270,z=150+R()*170;if(aureaInLake(x,z,-4)){if(aureaInLake(x,z,-14))continue;}else if(aureaInLake(x,z,6)||aureaNearRoute(x,z,9))continue;W.people.push([x,gy(x,z),z]);}});   // on the grass, under the trees, children in the shallows

  L('aureaWalks8',0,(g)=>{walk(g,WALK.ring,3.2,27,.4);walk(g,WALK.front,4,27,.45);for(const P of WALK.links)walk(g,P,2.6,27,.42);walk(g,WALK.gate,7,11,.5,.12);walk(g,WALK.royal,3,11,.55);
    const B=lakeRing(9.6,44);B.forEach(([x,z],i)=>{if(i%2||WALK.links.concat([WALK.gate]).some(P=>segD(x,z,P[0][0],P[0][1],P[1][0],P[1][1])<6))return;   // not across a path
      const F=frame(x,gy(x,z),z,Math.atan2(LK.x-x,LK.z-z));g.set(6,.5);for(const s of[-1,1])box(g,F,s*1.05,-.2,0,.13,.62,.24,31);box(g,F,0,.42,0,1.3,.09,.3,31);   // marble benches facing the water
      if(i%6===0)W.people.push([...F.p(1.8,.05,.2)]);});   // an old man by every third
    for(const s of[-1,1]){const q=RDF.S.p(RDF.rd+s*2.6,0,-4);W.people.push([q[0],gy(q[0],q[2]),q[2]]);}});   // two guards at the emperor's door
  L('aureaTracks7',0,(g)=>{walk(g,WALK.royal,2.6,21,.5,.12);for(const P of WALK.haul){walk(g,P,4.4,21,.35,.2);for(const s of[-1,1])walk(g,offsetLine(P,s*.8),.28,42,.5,.23);}});   // dirt; wheel ruts on the carts' tracks

  /* ---- the round dining hall on the Palatine's north-east corner (standing from 64; 【史】a round structure found there in 2009) ----
     The hall is K5 (finished) of the six-stage model closed on 2026-10-28 (renders/domus-aurea/coenatio-phase2-fixed-20261028): assets/models/aurea/coenatio.glb,
     in dist/aurea-assets.js, loaded the first time this layer shows; the procedural drum stands in until then, or for good without the file.
     The floor is just above the ground under the drum, so the back (uphill, towards the Golden House) is at grade; the door faces down the slope on
     the Palatine's grid (+z = SSW), and its stair lands on a round terrace that steps down to the hollow (two tiers, buttresses where the drop is tall). */
  L('coenatio',0,(g,G)=>{const[x,z]=AUREA.dine;let yt=-1e9;for(let a=0;a<TAU;a+=TAU/16)for(const r of[0,10,18])yt=Math.max(yt,gy(x+Math.cos(a)*r,z+Math.sin(a)*r));
    const F=frame(x,yt+.3,z,-30*DEG),T=-2.4,at=(r,a)=>{const q=F.p(Math.cos(a)*r,0,Math.sin(a)*r);return gy(q[0],q[2])-F.oy;},seg=(r,a)=>F.sub(Math.cos(a)*r,0,Math.sin(a)*r,Math.atan2(-Math.cos(a),-Math.sin(a)));   // seg: local x along the ring, +z outwards
    const R1=24.8,R2=27.3,yL=T-4;let yb=1e9;for(let a=0;a<TAU;a+=TAU/32)yb=Math.min(yb,at(R2+1,a));
    g.set(2,.42);lathe(g,F,0,0,0,[[R2+.08*(yL-yb+1.5),yb-1.5],[R2,yL],[R1,yL],[R1,T]],48);g.set(11,.32);lathe(g,F,0,0,0,[[R1,T],[0,T]],48);   // terrace of grey ashlar: battered lower tier, ledge, upper tier, paving
    g.set(14,.5);lathe(g,F,0,0,0,[[R2+.25,yL-.35],[R2+.25,yL+.05],[R1,yL+.05]],48);lathe(g,F,0,0,0,[[R1+.25,T-.35],[R1+.25,T+.05],[R1-.35,T+.05]],48);   // copings
    for(let i=0;i<48;i++){const a=(i+.5)/48*TAU;if(at(R1+1,a)<T-.8){g.set(14,.48);box(g,seg(R1-.05,a),0,T,0,R1*Math.PI/48+.03,.95,.22,31);}}   // parapet where the terrace stands above the slope
    for(let i=0;i<32;i++){const a=(i+.5)/32*TAU,y0=at(R2+1.5,a)-1;if(y0<yL-3){g.set(2,.4);box(g,seg(R2+.9,a),0,y0,0,.75,yL-.45-y0,.9,31);}}   // buttresses where the lower tier is tall (their foot is inside the batter)
    for(let k=0;k<5;k++){const a=(160+30*k)*DEG,q=F.p(Math.cos(a)*22.6,0,Math.sin(a)*22.6);W.trees.push([q[0],Math.max(F.oy+T,gy(q[0],q[2])),q[2],'cyp',.9+.2*hash2(k,77)]);}   // cypresses round the terrace, clear of the stair (the door is at 90°) and of the open bays (300-375°)
    const S=new THREE.Group();S.name='coenatioStand';G.add(S);const g2=new GB(1<<13);flushColumns(W);W.colGroup=S;   // the stand-in: drum, dome open at the top, 16 columns
    g2.set(2,.45);lathe(g2,F,0,0,0,[[17.5,T],[17.5,0],[0,0]],24);g2.set(24,.86);lathe(g2,F,0,0,0,[[15,0],[15,11],[0,11]],24,24);g2.set(2,.55);lathe(g2,F,0,11,0,[[15.6,0],[15.6,.8],[13.6,4.5],[9.5,7.5],[4.2,8.8],[3.6,9.1]],24);
    for(let a=0;a<TAU;a+=TAU/16)W.cols.cor.push([...F.p(Math.cos(a)*16.2,0,Math.sin(a)*16.2),a,5.5,[1,.92,.7]]);flushColumns(W);W.colGroup=G;const m=g2.mesh(MAT.city);if(m)S.add(m);
    W.anim.push((t,dt)=>{if(!G.visible)return;if(!S.userData.asked){S.userData.asked=1;aureaLoad('coenatio',G,F,S,o=>AUREA.spin=o.getObjectByName('ROTATING_CEILING'));}if(AUREA.spin&&W.ev&&W.ev.dineSpin)AUREA.spin.rotation.y+=dt*.03;});});   // the starry timber ceiling under the fixed dome (about 3½ minutes a turn) stands still: vol 17 "转了一个月", then one night
  // in 68 ("快到半夜，轴动了" ... "以后再也没有转过"), which the reader's excerpt turns on (W.ev.dineSpin, app.js TRIG)

  /* ---- the Oppian halls (the octagon wing): 59-68 walls and timber centring (oppian_s1), from 68 finished (oppian_s3); a procedural stand-in until
     dist/oppian-assets.js has come, or for good without it: a two-storey block on the model's footprint, a colonnade along its front, the octagon ---- */
  const hallsStand=(g,F,scaff)=>{const cx=(OPP.u0+OPP.u1)/2,hw=(OPP.u1-OPP.u0)/2,zf=12;rectWalls(g,F,cx,(OPP.v0+zf)/2,2*hw,zf-OPP.v0,-6,14,0,{part:24,seed:.86,sty:13,fl:8|32,nSt:2,gH:7,sH:7,lit:1});
    if(scaff)for(let x=OPP.u0+12;x<=OPP.u1-8;x+=26)scaffold(g,F,x,zf-12,6,0,16,false);
    for(let x=OPP.u0+3;x<=OPP.u1-3;x+=5)W.cols.cor.push([...F.p(x,0,zf+1),F.rot,9,[1,.95,.85]]);g.set(2,.5);box(g,F,cx,9,zf+2,hw+1,1.1,2.2,31);g.set(1,.5);g.poly([F.p(OPP.u0-1,10.1,zf+3.6),F.p(OPP.u1+1,10.1,zf+3.6),F.p(OPP.u1+1,12.8,zf-2),F.p(OPP.u0-1,12.8,zf-2)],[0,1,0]);
    g.set(24,.86,0,1);lathe(g,F,0,14,0,[[16,0],[16,6],[0,6]],8);g.set(12,.5);lathe(g,F,0,20,0,scaff?[[16.5,0],[13,6],[7,10],[0,11]]:[[16.5,0],[13,6],[7,10],[3.2,10.8]],16);};   // the octagon; open at the top once finished
  const halls=(g,G,scaff)=>{const y0=PADH[PADS.findIndex(p=>p[0]===OPP.x&&p[1]===OPP.z)],F=frB(OPP.x,OPP.z,190,y0),S=new THREE.Group(),g2=new GB(1<<14);S.name='oppianStand';G.add(S);
    flushColumns(W);W.colGroup=S;hallsStand(g2,F,scaff);flushColumns(W);W.colGroup=G;
    if(!scaff){g2.set(2,.45);box(g2,F,6.2,0,13.4,.7,1.9,.25,31);g2.set(12,.4);box(g2,F,6.2,1.25,13.68,.55,.55,.03,31);}   // the bronze list of names on a stone post by the octagon's porch (from 68): S3 has its own (inner_plaque)
    const m=g2.mesh(MAT.city);if(m)S.add(m);
    W.anim.push(()=>{if(!G.visible||S.userData.asked)return;S.userData.asked=1;aureaLoad(scaff?'oppian_s1':'oppian_s3',G,F,S,null,'opp');
      if(!scaff)aureaLoad('oppian_court',G,F,new THREE.Group(),null,'opp');});};   // from 68 the inner court's garden and stairs, on the ground oppCourtPost cut for them
  L('aureaHalls7',16,(g,G)=>halls(g,G,true));L('aureaHalls8',0,(g,G)=>halls(g,G,false));

  W.views.aurea={n:'金宫谷地',pos:[300,gy(300,380)+150,380],tgt:[620,gy(620,170),170]};   // the copy team's fixed camera: above the Palatine's north-east corner, looking north-east
  // where the reader's Golden House excerpts fly (app.js AUREA_EX, TRIG): the colossus from the Via Sacra, the colonnade's bend at Lentulus's site
  // from over the lake, the lake from the east end, the park gate from inside, the round hall from the valley
  W.views.aureaVest={n:'金宫前庭·铜巨人',pos:[355,62,72],tgt:[430,55,140]};W.views.aureaBend={n:'金柱廊拐弯处',pos:[515,62,235],tgt:[592,14,108]};
  W.views.aureaLake={n:'金宫的湖',pos:[748,55,318],tgt:[600,9,222]};W.views.aureaGate={n:'园门·阿波罗的林子',pos:[660,34,280],tgt:[618,9,330]};
  W.views.aureaDine={n:'旋转圆厅',pos:[392,62,222],tgt:[330,36,160]};
  {const F=frame(AUREA.dine[0],31.33,AUREA.dine[1],-30*DEG),D=DEG;W.views.aureaDineLake={n:'圆厅饭台·看湖',pos:F.p(10.43,3.55,-2.8),tgt:[605,8.5,232]};;}   // the couch on the dais (coenatio v3: r 10.8, θ 15°)
  // the inner court (vol 18): the Oppian halls from their garden, the octagon from its porch, the bronze list by the porch (OPP frame, floor y0)
  {const y0=PADH[PADS.findIndex(p=>p[0]===OPP.x&&p[1]===OPP.z)],c=Math.cos(OPP.rot),sn=Math.sin(OPP.rot),P=(u,y,v)=>[OPP.x+u*c+v*sn,y0+y,OPP.z-u*sn+v*c];
   W.views.aureaInner={n:'金宫内院',pos:P(-30,24,100),tgt:P(-45,2,-2)};W.views.aureaOct={n:'内院·八角厅',pos:P(0,10.5,48),tgt:P(0,5,3)};
   W.views.aureaPlaque={n:'内院门口的铜牌',pos:P(11.5,3.4,23),tgt:P(6.2,1.3,13.5)};}
  /* ---- labels ---- */
  const poi=(n,l,x,z,s0,s1,info,d=1600,h=30)=>W.pois.push({n,l,x,z,y:gy(x,z)+h,s0,s1,d,info});
  poi('伦图卢斯家','【设】',AUREA.lent[0],AUREA.lent[1],0,6,'【书中】第9份：数地契那夜他说"差这几块"，伦图卢斯不卖房，神龛和住户也拆不得。门口一棵老悬铃木。64年大火后，这里成了金柱廊拐弯的地方。',900,18);
  poi('金宫工地','Domus Aurea',600,180,7,7,'【书中】空白期修的金宫是半拉子工程：一里长的金柱廊在伦图卢斯家原址拐了个弯，湖只挖了一半，铜巨人立在韦利亚坡顶，没有头，脖子上露着铁条；林子种得很密，里面没有一盏灯。【史】64年大火后修建（苏埃托尼乌斯《尼禄传》31，塔西佗《编年史》15.42）。',3000,40);
  // the three parts of the park from 68 (vol 18, 草地: "一半" / "四分之一" / "四分之一"; the copy team and the author, 2026-11-09). No walls between them:
  // in the book only the line at the gate and the inner court's bronze list divide them; the ground shader tints the inner court (builders.js)
  poi('金宫园子','Domus Aurea · 开放区（一半）',600,180,8,99,'【书中】第18份《草地》：园子分成一半、四分之一、四分之一。一半给所有人：韦利亚坡顶的园门和门口那道线、铜人、整个山谷（湖、环湖步道、草地、林子，林子到凯利安山坡脚为止）、金柱廊和尼禄圣道两侧的柱廊；听诉处设在柱廊底下。四分之一是内院，奥庇乌斯山翼的八角厅馆舍；四分之一是皇宫，帕拉蒂尼山那一面坡和会转的饭厅。湖后来挖完，巨人补上了太阳神的头。【设】三块之间不画墙，内院只用地面色调和一圈淡边区分。',3000,40);
  poi('金宫内院','奥庇乌斯山翼（四分之一）',OPP.x,OPP.z,8,99,'【书中】第18份：园子的四分之一，“留给讲得最好的那些人”。“他坐在内院的八角厅里”，跟另一个懂法的争一个跨过门口那道线的奴隶。内院门口立铜牌，名单每年换一次。【史】奥庇乌斯山翼的八角厅今天还在。苏埃托尼乌斯说的那间日夜旋转的饭厅是哪一座，史学界有两种说法：一说就是这座八角厅，一说是2009年在帕拉蒂尼山东北角发现的圆形建筑。小说取后一说，八角厅不是那间会转的屋子。61年，城守佩达尼乌斯被自家奴隶杀死，按旧法同宅的四百个奴隶都要处死，元老院为此争过一场，卡西乌斯·隆吉努斯力主照办（塔西佗《编年史》14.42–45）。',1600,26);
  poi('金宫内院','奥庇乌斯山翼（在建）',OPP.x,OPP.z,7,7,'【设】59–68年：墙已立起，门洞是真的，拱顶还架在木拱架上。【史】奥庇乌斯山翼的八角厅今天还在，中间穹顶开一个圆口。',1600,26);
  {const y0=PADH[PADS.findIndex(p=>p[0]===OPP.x&&p[1]===OPP.z)],c=Math.cos(OPP.rot),sn=Math.sin(OPP.rot),q=[OPP.x+6.2*c+13.5*sn,OPP.z-6.2*sn+13.5*c];
   W.pois.push({n:'内院铜牌',l:'【书中】',x:q[0],z:q[1],y:y0+4,s0:8,s1:99,d:300,info:'【书中】第18份：“这回牌子上只写名字。”“为什么上去，为什么下来，都写在牌子上。每年换一次。”第一年刻了十一个名字，第二年换了三个，换上去的里面有一个是释奴。'});}
  poi('皇宫','帕拉蒂尼山那一面坡（四分之一）',300,215,8,99,'【书中】第18份：“那间会转的屋子，在你那一块。帕拉蒂尼山那一面坡，也是你的。”',1800,40);
  if(W.claudEast){const CE=W.claudEast,q=CE.FE.p((CE.fx0+CE.fx1)/2+2,0,CE.zBack+.45);   // the bench behind the water (layers.js claudWater): the palace's one spot outside its part, a point, not an area
   W.pois.push({n:'水后的长凳',l:'皇宫的飞地',x:q[0],z:q[2],y:gy(q[0],q[2])+10,s0:8,s1:99,d:700,info:'【书中】第18份：“这道水，这张凳子，也给你。”凯利安山那道水后面的一张长凳，归皇宫。'});}
  poi('铜巨人','Colossus',AUREA.vest[0],AUREA.vest[1],7,7,'【书中】约35米，没有头，脖子上戳着铁条，上面有鸟窝。【史】策诺多鲁斯铸，原为尼禄像（老普林尼《博物志》34.45）。',1500,45);
  poi('铜巨人','Colossus Solis',AUREA.vest[0],AUREA.vest[1],8,99,'【书中】约70年补上了头：太阳神的脸，头上一圈光芒，不是尼禄的脸。',1500,45);
  poi('金宫前庭','Vestibulum（在建）',...VEST.via[1],7,7,'【史】苏埃托尼乌斯《尼禄传》31：金宫的前庭里立着一座一百二十尺高的尼禄像。【设】前庭在韦利亚坡顶，正对圣道最后一段直路；西头是门廊和台阶，东半边架在拱廊基座上，俯瞰谷地。59–68年：台基已起，南廊先盖好，西廊只立了柱子，北墙搭着脚手架，院里还是土地。',1200,14);
  poi('金宫前庭','Vestibulum',...VEST.via[1],8,99,'【史】苏埃托尼乌斯《尼禄传》31：金宫的前庭里立着一座一百二十尺高的尼禄像。【设】前庭在韦利亚坡顶，正对圣道最后一段直路：三面柱廊，东面是朝谷地敞开的凉廊；西头门廊和台阶下接圣道，东半边架在拱廊基座上。',1200,14);
  poi('圣道','Via Sacra',335,52,7,99,'【史】64年大火后，尼禄把圣道从广场到韦利亚坡顶这一段拉直，两边盖起带柱廊的店铺，一直通到金宫前庭（考古：Van Deman 1923）。塔西佗《编年史》15.43：重建的街区，房前要加柱廊，柱廊由尼禄出钱修。【设】59–68年西南一侧先完工，东北一侧还在搭脚手架；有一座老宅没拆，柱廊在它门前断开。',900,10);
  poi('旋转餐厅','Coenatio rotunda',AUREA.dine[0],AUREA.dine[1],7,99,'【书中】第17份：帕拉蒂尼山这一头的坡上，一座圆厅；深蓝木顶嵌银钉，中心铁轴。【史】苏埃托尼乌斯《尼禄传》31：主饭厅是圆的，日夜像天穹一样转；2009年在帕拉蒂尼山东北角发现疑似其基座的圆形遗构。',1200,22);
  poi('听诉处','【书中】',680,140,8,99,'【书中】柱廊底下一张桌子，前面排着长队。',700,10);
  poi('园门','阿波罗的林子',620,322,8,99,'【书中】第18份《开门》：“门口的石板上刻了一道线。线外面是城。线里面，我让人在门边立了一块石头，上面只刻了几行字：阿波罗的林子。不许打人。不许抓人。不许喧哗。不收钱。”',900,12);}

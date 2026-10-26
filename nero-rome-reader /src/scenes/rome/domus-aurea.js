/* Domus Aurea, the Golden House, and the streets it replaced (novel vols 9-20; copy team's 小说文本/金宫分阶段生图说明_20261026.md, positions checked
   against this terrain in its section 4.6; author's choices 2026-10-26: a headless colossus in 59-68, state 8 shows the grown park only, the fire
   clears the Velia shoulder and the Carinae's south edge only).
   States: 0-6 the Velia and Carinae streets stand, with Lentulus's house and two crossroads shrines (their houses are in the aureaSite group);
   6 the Transitoria tower's loggia is glazed (the "golden house" of the townspeople); 7 (59-68) the half-built Golden House; 8 (68-100) the park, open.
   【史】Suetonius, Nero 31 (vestibule with the 120-foot statue, a triple colonnade a mile long, a lake like a sea, woods, a round dining hall that
   turned day and night); Tacitus, Annals 15.39-43; Pliny, NH 34.45 (Zenodorus' colossus); the Oppian wing with its octagonal hall still stands. */
const AUREA={vest:[430,140],lent:[585,105],shrines:[[590,124],[448,176]],dine:[330,160],lake:{x:605,z:232,rx:118,rz:68,rot:-.17},
  route:[[470,148],[560,134],[572,116],[600,113],[612,130],[742,126],[752,200],[748,300]]};   // the gilded colonnade: from the vestibule's foot along the valley's north edge, round Lentulus's site, then down the east end of the lake
// the ground the fire and the Golden House take: the valley, the Velia shoulder, the Carinae's south edge down to the slope, the dining hall's corner of the Palatine
function AUREA_SITE(x,z){return Math.hypot(x-572,z-200)<150||(x>380&&x<520&&z>20&&z<200)||(x>450&&x<1000&&z>-20&&z<120)||Math.hypot(x-AUREA.dine[0],z-AUREA.dine[1])<38;}
function aureaInLake(x,z,m=0){const L=AUREA.lake,dx=x-L.x,dz=z-L.z,c=Math.cos(L.rot),s=Math.sin(L.rot),u=c*dx-s*dz,v=s*dx+c*dz;return(u/(L.rx+m))**2+(v/(L.rz+m))**2<1;}
function aureaNearRoute(x,z,d){const P=AUREA.route;for(let i=1;i<P.length;i++)if(segD(x,z,P[i-1][0],P[i-1][1],P[i][0],P[i][1])<d)return true;return false;}
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
  const TW=frame(237.9,0,306.8,-Math.PI/6),glaze=(g,gl,burnt)=>{const yb=84,yt=88.4,e=8.25;
    for(let k=0;k<4;k++){const S=TW.sub(0,0,0,k*Math.PI/2);
      if(!burnt){gl.set(0,.5);box(gl,S,0,yb,e,8,yt-yb,.04,31);}
      g.set(burnt?22:12,burnt?.9:.4);for(let x=-8;x<=8.01;x+=2)box(g,S,x,yb,e,.06,yt-yb,.07,31);box(g,S,0,yb-.08,e,8.1,.1,.09,31);box(g,S,0,yt,e,8.1,.1,.09,31);}};
  L('transGlass',0,(g,G,gl)=>{glaze(g,gl,false);const m=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),lampMat(1,.78,.42,22));m.position.set(237.9,85.6,306.8);G.add(m);});   // 58: plate glass in gilded frames, a lamp at night
  L('transBurnt',0,(g)=>{glaze(g,null,true);});   // 64-68: the glass burst in the fire, the frames black
  L('transGlass2',0,(g,G,gl)=>{glaze(g,gl,false);const m=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),lampMat(1,.78,.42,22));m.position.set(237.9,85.6,306.8);G.add(m);});

  /* ---- the gilded colonnade (59-68 in part scaffolded, from 68 whole): three storeys over a podium that follows the valley floor ---- */
  const porticus=(g,scaff)=>{const P=AUREA.route;
    for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.max(2,Math.ceil(len/6));let yt=-1e9,yb=1e9;
      for(let k=0;k<=n;k++){const h=gy(a[0]+dx*k/n,a[1]+dz*k/n);yt=Math.max(yt,h);yb=Math.min(yb,h);}
      const y0=yt+.4,F=frame((a[0]+b[0])/2,y0,(a[1]+b[1])/2,Math.atan2(-dz,dx)),hl=len/2+.4;
      if(scaff&&i%2===0)continue;   // 59-68: every other stretch still a skeleton (porticusScaff)
      g.set(2,.45);box(g,F,0,yb-y0-.5,0,hl,y0-yb+.5,4.2,31);   // podium down to the lowest ground
      g.set(24,.86);box(g,F,0,0,-3.6,hl,18.6,.6,31);   // back wall, three storeys
      for(let lv=0;lv<3;lv++){const yl=lv*6.2;for(let x=-hl+1.5;x<=hl-1;x+=3.6)W.cols.cor.push([...F.p(x,yl,2.8),F.rot,5.2,[1,.9,.62]]);   // columns with gilded capitals (warm tint)
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
  const colossus=(g,head)=>{const[x,z]=AUREA.vest,yb=gy(x,z),F=frame(x,yb,z,-.35),u=3.1;
    g.set(2,.5);box(g,F,0,-2,0,6.5,8,6.5,31);g.set(6,.6);box(g,F,0,6,0,7,.8,7,31);   // the base
    const y=6.8;g.set(13,.4);
    lathe(g,F,0,y,0,[[1.45*u,0],[1.5*u,.4*u],[1.15*u,1.5*u],[1.0*u,3.4*u],[1.15*u,4.7*u],[0,4.7*u]],10,13);box(g,F,0,y+4.6*u,0,1.55*u,3.1*u,1.0*u,31);
    box(g,F,-1.95*u,y+4.9*u,0,.38*u,2.7*u,.38*u,31);box(g,F,2.0*u,y+6.5*u,0,.5*u,1.0*u,.38*u,31);box(g,F,2.55*u,y+7.4*u,0,.42*u,1.1*u,.36*u,31);box(g,F,3.0*u,y+8.4*u,0,.38*u,1.2*u,.34*u,31);
    if(head){lathe(g,F,0,y+7.6*u,0,[[.4*u,0],[.75*u,.45*u],[.85*u,1.2*u],[.7*u,2.0*u],[0,2.3*u]],10,13);g.set(12,.4);
      for(let k=0;k<7;k++){const a=(k/6-.5)*2.4,S=F.sub(Math.sin(a)*.8*u,y+8.9*u,-.15*u,0);box(g,S,0,0,0,.09*u,1.6*u,.06*u,31);}}   // the radiate crown of Sol
    else{g.set(22,.9);for(const[ox,oz,h]of[[-.35,0,2.6],[.3,.2,3.2],[0,-.3,2.2],[.5,-.2,1.8]])box(g,F,ox*u,y+7.6*u,oz*u,.06*u,h,.06*u,31);
      g.set(3,.8);lathe(g,F,.3*u,y+7.6*u+3.2,.2*u,[[.9,0],[1,.35],[.6,.45],[0,.35]],8);   // iron bars out of the neck, a bird's nest on the tallest
      g.set(3,.6);for(const s of[-1,1])for(const t of[-1,1])box(g,F.sub(s*8,0,t*8,s*t*.6),0,-1,0,.18,10,.18,31);g.set(21,.3);g.poly([F.p(-12,.05,-12),F.p(12,.05,-12),F.p(12,.05,12),F.p(-12,.05,12)],[0,1,0]);}};   // casting timbers round the base, trodden earth
  L('colossus7',0,(g)=>colossus(g,false));L('colossus8',0,(g)=>colossus(g,true));

  /* ---- the wood: planted thick from the Velia across the valley, no lamp in it; the same trees grown tall by the time the park is open ---- */
  const grovePts=[];{const R=RNG(6401);for(let x=380;x<760;x+=7.5)for(let z=140;z<340;z+=7.5){const px=x+(R()-.5)*5,pz=z+(R()-.5)*5;
      if(!(Math.hypot(px-572,pz-200)<146||(px>385&&px<515&&pz>145&&pz<195)))continue;if(aureaInLake(px,pz,9)||aureaNearRoute(px,pz,11)||Math.hypot(px-AUREA.vest[0],pz-AUREA.vest[1])<20)continue;
      if(Math.hypot(px-455,pz-300)<14)continue;grovePts.push([px,pz,R(),R()]);}}   // (the houses' footprints here are gone by 59: no Foot test)
  const kinds=r=>r<.35?'broad':r<.55?'plane':r<.72?'pine':r<.85?'cyp':'broadD';
  L('grove7',0,()=>{for(const[x,z,r,s]of grovePts)W.trees.push([x,gy(x,z),z,kinds(r),.5+s*.2]);});
  L('grove8',0,()=>{for(const[x,z,r,s]of grovePts){if(s<.3&&aureaInLake(x,z,30))continue;W.trees.push([x,gy(x,z),z,kinds(r),1+s*.35]);}});   // clearings of lawn open on the shore

  /* ---- 59-68: the building site round the wood: a wall with a breach (children outside), refugee huts by the lake ---- */
  L('aureaBuild7',0,(g)=>{const wall=(a,b,gap)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6);for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,m=(t0+t1)/2;if(gap&&m>gap[0]&&m<gap[1])continue;const p=lp(a,b,t0),q=lp(a,b,t1),F=frame((p[0]+q[0])/2,Math.min(gy(...p),gy(...q))-.4,(p[1]+q[1])/2,Math.atan2(-(q[1]-p[1]),q[0]-p[0]));g.set(24,.6);box(g,F,0,0,0,Math.hypot(q[0]-p[0],q[1]-p[1])/2+.2,3.6,.35,31);}};
    wall([470,322],[770,322],[.46,.54]);wall([772,140],[772,322]);
    for(let i=0;i<5;i++)W.people.push([608+i*3,gy(608+i*3,330),330]);   // children squatting outside the breach
    const R=RNG(31);for(let i=0;i<9;i++){const x=500+R()*30,z=250+R()*45;if(aureaInLake(x,z,3))continue;hut(g,x,z,R()*3);}});

  /* ---- from 68: the park, open: half for everyone, a quarter the inner court, a quarter the emperor's (the Palatine slope, the Claudian water front) ---- */
  L('aureaPark8',0,(g)=>{const wall=(a,b,gap,h=3.6)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6);for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,m=(t0+t1)/2;if(gap&&m>gap[0]&&m<gap[1])continue;const p=lp(a,b,t0),q=lp(a,b,t1),F=frame((p[0]+q[0])/2,Math.min(gy(...p),gy(...q))-.4,(p[1]+q[1])/2,Math.atan2(-(q[1]-p[1]),q[0]-p[0]));g.set(24,.6);box(g,F,0,0,0,Math.hypot(q[0]-p[0],q[1]-p[1])/2+.2,h,.35,31);}};
    wall([470,322],[770,322],[.4,.6]);wall([772,140],[772,322]);   // the breach widened into the gate
    {const F=frame(620,gy(620,322),322,0);g.set(2,.5);for(const s of[-1,1])box(g,F,s*30,-.4,0,1.1,5.4,1.1,31);g.set(22,.9);box(g,F,0,.02,2.4,29,.04,.12,31);   // gate piers; the line cut in the paving
      g.set(6,.6);box(g,F,34,-.2,4,.55,2.4,.25,31);}   // the stone with the garden's rules beside the gate
    wall([395,120],[395,250],[.45,.55],1.3);for(const z of[180,190])W.people.push([398,gy(398,z),z]);   // the royal quarter: a low wall and guards, not a fortress
    {const F=frame(680,gy(680,140),140,0);g.set(3,.5);box(g,F,0,0,0,2.2,1,1,31);for(let i=0;i<14;i++)W.people.push([680-3-i*1.6,gy(677-i*1.6,146),146]);}   // the hearing table under the colonnade and its queue
    const R=RNG(68);for(let i=0;i<160;i++){const x=470+R()*270,z=150+R()*170;if(aureaInLake(x,z,-4)){if(aureaInLake(x,z,-14))continue;}else if(aureaInLake(x,z,6)||aureaNearRoute(x,z,9))continue;W.people.push([x,gy(x,z),z]);}});   // on the grass, under the trees, children in the shallows

  /* ---- the round dining hall on the Palatine's north-east corner (standing from 64; 【史】a round structure found there in 2009) ---- */
  L('coenatio',0,(g)=>{const[x,z]=AUREA.dine;let yt=-1e9,yb=1e9;for(let a=0;a<TAU;a+=TAU/12)for(const r of[0,10,17]){const h=gy(x+Math.cos(a)*r,z+Math.sin(a)*r);yt=Math.max(yt,h);yb=Math.min(yb,h);}
    const F=frame(x,yt+.5,z,0);g.set(2,.45);lathe(g,F,0,yb-yt-1,0,[[17.5,0],[17.5,yt-yb+1],[0,yt-yb+1]],24);
    g.set(24,.86);lathe(g,F,0,0,0,[[15,0],[15,11],[0,11]],24,24);g.set(2,.55);lathe(g,F,0,11,0,[[15.6,0],[15.6,.8],[13.6,4.5],[9.5,7.5],[4.2,8.8],[3.6,9.1]],24);   // drum and a concrete dome open at the top
    for(let a=0;a<TAU;a+=TAU/16)W.cols.cor.push([...F.p(Math.cos(a)*16.2,0,Math.sin(a)*16.2),a,5.5,[1,.92,.7]]);});

  /* ---- the Oppian halls (the inner court, the octagon): half-built in 59-68, finished later; the old placeholder wing ---- */
  const halls=(g,scaff)=>{const F=frB(850,-40,190,gy(850,-40));rectWalls(g,F,0,0,280,40,-6,14,0,{part:24,seed:.86,sty:13,fl:8|32,nSt:2,gH:7,sH:7,lit:1});if(scaff)for(let x=-130;x<=130;x+=26)scaffold(g,F,x,0,6,0,16,false);
    for(let x=-136;x<=136;x+=5)W.cols.cor.push([...F.p(x,0,23),F.rot,9,[1,.95,.85]]);g.set(2,.5);box(g,F,0,9,24,140,1.1,2.2,31);g.set(1,.5);g.poly([F.p(-140,10.1,25.6),F.p(140,10.1,25.6),F.p(140,12.8,20),F.p(-140,12.8,20)],[0,1,0]);g.set(2,.45);box(g,F,0,-6,23,141,6,3.4,31);
    g.set(24,.86,0,1);lathe(g,F,0,14,0,[[16,0],[16,6],[0,6]],8);g.set(12,.5);lathe(g,F,0,20,0,scaff?[[16.5,0],[13,6],[7,10],[0,11]]:[[16.5,0],[13,6],[7,10],[3.2,10.8]],16);   // the octagon; open at the top once finished
    if(!scaff){g.set(12,.4);box(g,F,6,4,25.8,.9,.6,.05,31);}};   // the bronze list of names by the door (from 68)
  L('aureaHalls7',16,(g)=>halls(g,true));L('aureaHalls8',0,(g)=>halls(g,false));

  W.views.aurea={n:'金宫谷地',pos:[300,gy(300,380)+150,380],tgt:[620,gy(620,170),170]};   // the copy team's fixed camera: above the Palatine's north-east corner, looking north-east
  /* ---- labels ---- */
  const poi=(n,l,x,z,s0,s1,info,d=1600,h=30)=>W.pois.push({n,l,x,z,y:gy(x,z)+h,s0,s1,d,info});
  poi('伦图卢斯家','【设】',AUREA.lent[0],AUREA.lent[1],0,6,'【书中】第9份：数地契那夜他说"差这几块"，伦图卢斯不卖房，神龛和住户也拆不得。门口一棵老悬铃木。64年大火后，这里成了金柱廊拐弯的地方。',900,18);
  poi('金宫工地','Domus Aurea',600,180,7,7,'【书中】空白期修的金宫是半拉子工程：一里长的金柱廊在伦图卢斯家原址拐了个弯，湖只挖了一半，铜巨人立在韦利亚坡顶，没有头，脖子上露着铁条；林子种得很密，里面没有一盏灯。【史】64年大火后修建（苏埃托尼乌斯《尼禄传》31，塔西佗《编年史》15.42）。',3000,40);
  poi('金宫园子','Domus Aurea · 开放园区',600,180,8,99,'【书中】回来以后园子开放，按一半、四分之一、四分之一分开：柱廊以南的湖、林子和草地给所有人，门口地上刻一道线，旁边立着写规矩的石头；柱廊以北奥庇乌斯山脚的几座厅和八角厅是内院，门口挂铜牌名单；帕拉蒂尼山那面坡（旋转餐厅）和凯利安山的水景、长凳归皇家，中间只是矮墙和卫兵。湖后来挖完，巨人补上了太阳神的头。',3000,40);
  poi('铜巨人','Colossus',AUREA.vest[0],AUREA.vest[1],7,7,'【书中】约35米，没有头，脖子上戳着铁条，上面有鸟窝。【史】策诺多鲁斯铸，原为尼禄像（老普林尼《博物志》34.45）。',1500,45);
  poi('铜巨人','Colossus Solis',AUREA.vest[0],AUREA.vest[1],8,99,'【书中】约70年补上了头：太阳神的脸，头上一圈光芒，不是尼禄的脸。',1500,45);
  poi('旋转餐厅','Coenatio rotunda',AUREA.dine[0],AUREA.dine[1],7,99,'【书中】第17份：帕拉蒂尼山这一头的坡上，一座圆厅；深蓝木顶嵌银钉，中心铁轴。【史】苏埃托尼乌斯《尼禄传》31：主饭厅是圆的，日夜像天穹一样转；2009年在帕拉蒂尼山东北角发现疑似其基座的圆形遗构。',1200,22);
  poi('听诉处','【书中】',680,140,8,99,'【书中】柱廊底下一张桌子，前面排着长队。',700,10);}

/* Antium · the villa by zones, east -> west, each on its own built terrace:
   gate + German guard barracks · lower garden (avenue, beds, fountain, round colonnade, portico) · workshop yard
   (south-east corner, see harbour.js) · palace tier 1 and tier 2 (two wings each, every wing with its sea gallery) ·
   upper palace (cloister with the bronze altar, the bedchamber) · summit court (observation tower, round shrine).
   Book: "皇家行宫沿着悬崖一层一层往上盖，白墙，红瓦，每一层都有一条朝海的长廊。"
   Core buildings are GLB models (assets/models/antium, see main.js); each has a plain procedural stand-in until it loads. */
ANT.GLB=[];
/* a GLB placement with its stand-in (own mesh so it can be hidden when the model arrives); o = {sc: scale, tint: {material name: [r,g,b] multipliers}} makes a variant of the same model */
function antStand(G,layer,n,x,z,y,rot,fn,o){const g2=new GB(1<<12),F=antF(x,z,rot||0,y);fn(g2,F);const m=g2.mesh(MAT.city);if(m)G.add(m);ANT.GLB.push({n,x,z,y,r:rot||0,layer,stand:m,o:o||{}});return F;}
const ANT_WALL={part:24,seed:.86,sty:13,fl:8|32,lit:1};
function antSqTower(g,F,w,hgt){rectWalls(g,F,0,0,w,w,-20,hgt,0,Object.assign({},ANT_WALL,{nSt:Math.max(1,Math.round(hgt/5)),gH:5.5,sH:5}));roof(g,F,'pyr',0,0,w+1.2,w+1.2,hgt,28*DEG,.6,.82);}
/* outline of a terrace: [[x, zNorth, zSouth], ...] east -> west */
function antOutline(t){const[x0,x1,,name]=t,Y=ANT.YARD,P=[],xs=[];for(let x=x0;x>x1+.01;x-=5)xs.push(x);xs.push(x1);
  if(name==='garden')xs.push(Y.x1+.01,Y.x1-.01);xs.sort((a,b)=>b-a);
  for(const x of xs){const zN=antWallZ(x,-1);let zS=antWallZ(x,1);if(name==='garden'&&x<=Y.x0&&x>=Y.x1)zS=antSpZ(x)+Y.z;if(zS-zN<6)break;P.push([x,zN,zS]);}return P;}
function antYardOutline(){const Y=ANT.YARD,P=[];for(let x=Y.x0;x>Y.x1-.01;x-=4)P.push([x,antSpZ(x)+Y.z,antWallZ(x,1)]);return P;}
/* a terrace podium: lawn or stone-paved top (vertex colours, see antFlats), masonry sides down to the rock */
function antPodium(g,lawn,P,lvl,o={}){const AX=ANT.AX,AZ=ANT.AZ,q=(x,y,z)=>[AX+x,y,AZ+z],gr=(x,z)=>Math.min(lvl-.5,antH(x,z))-1.2;
  for(let i=0;i<P.length-1;i++){const[a,an,as]=P[i],[b,bn,bs]=P[i+1];
    lawn.push([[q(a,lvl,an),q(b,lvl,bn),q(b,lvl,bs),q(a,lvl,as)],o.lawn?'lawn':o.earth?'earth':'pave']);
    g.set(o.part||24,.84,o.sty||0);g.poly([q(a,gr(a,an),an),q(b,gr(b,bn),bn),q(b,lvl,bn),q(a,lvl,an)],[0,0,-1]);g.poly([q(a,gr(a,as),as),q(b,gr(b,bs),bs),q(b,lvl,bs),q(a,lvl,as)],[0,0,1]);}
  for(const[k,dir]of[[0,1],[P.length-1,-1]]){const[x,zn,zs]=P[k];g.set(o.part||24,.84,o.sty||0);const n=Math.max(1,Math.ceil((zs-zn)/6));
    for(let j=0;j<n;j++){const z0=zn+(zs-zn)*j/n,z1=zn+(zs-zn)*(j+1)/n;g.poly([q(x,gr(x,z0),z0),q(x,gr(x,z1),z1),q(x,lvl,z1),q(x,lvl,z0)],[dir,0,0]);}}}
/* parapet along an outline edge: side -1 north, +1 south; crenels on the fortified terraces */
function antParapet(g,P,lvl,side,h,cren,skip){const AX=ANT.AX,AZ=ANT.AZ;
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],za=side<0?a[1]:a[2],zb=side<0?b[1]:b[2],mx=(a[0]+b[0])/2,mz=(za+zb)/2;if(skip&&skip(mx,mz))continue;
    const L=Math.hypot(b[0]-a[0],zb-za),F=frame(AX+mx,lvl,AZ+mz-side*.35,Math.atan2(-(zb-za),b[0]-a[0]));
    g.set(cren?24:2,.84);box(g,F,0,0,0,L/2+.4,h,.35,31);g.set(cren?25:6,.5);box(g,F,0,h,0,L/2+.45,.18,.45,31);
    if(cren)for(let u=-L/2+.8;u<L/2-.4;u+=1.7){g.set(24,.84);box(g,F,u,h+.18,0,.45,.75,.33,31);}}}
/* a flight of marble steps climbing west against a terrace front, from lvl0 (east foot) to lvl1 at xTop */
function antFlight(W,g,xTop,z,lvl0,lvl1,w,o={}){const rise=.17,run=.38,n=Math.round((lvl1-lvl0)/rise),r2=(lvl1-lvl0)/n,land=n>40?Math.floor(n/2):-1,AX=ANT.AX,AZ=ANT.AZ;
  let x=xTop;const steps=[];for(let i=n-1;i>=0;i--){steps.push([x,i]);x+=run;if(i===land)x+=2.4;}
  for(const[xs,i]of steps){const F=frame(AX+xs+run/2,lvl0,AZ+z,0);g.set(6,.9);box(g,F,0,0,0,run/2+(i===land?1.2:0)+.01,(i+1)*r2,w/2,31);}
  const xb=x;for(const sd of[-1,1]){const zc=z+sd*(w/2+.4);g.set(2,.6);for(let k=0;k<steps.length;k++){const[xs,i]=steps[k];box(g,frame(AX+xs+run/2,lvl0,AZ+zc,0),0,0,0,run/2+.02,(i+1)*r2+.9,.4,31);}
    pedestalStatue(g,frame(AX+xb+1.6,lvl0,AZ+zc+sd*.9,0),0,0,0,2.4,{gilt:false});pedestalStatue(g,frame(AX+xTop-1.4,lvl1,AZ+zc+sd*.9,0),0,0,0,2.4,{gilt:false});}
  if(o.cyp)for(const sd of[-1,1])for(let xx=xTop+3;xx<xb-2;xx+=5)W.trees.push([AX+xx,lvl0+(xb-xx)/(xb-xTop)*0,AZ+z+sd*(w/2+2.6),'cyp',.85]);
  return xb;}
/* a balustrade along a straight line at height y */
function antBal(g,x0,z0,x1,z1,y,gap){const AX=ANT.AX,AZ=ANT.AZ,L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/4));
  for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,mx=lerp(x0,x1,(t0+t1)/2),mz=lerp(z0,z1,(t0+t1)/2);if(gap&&gap(mx,mz))continue;const F=frame(AX+mx,y,AZ+mz,Math.atan2(-(z1-z0),x1-x0));
    g.set(6,.85);box(g,F,0,0,0,L/n/2,.2,.3,31);box(g,F,0,.95,0,L/n/2+.02,.14,.34,31);for(let u=-L/n/2+.25;u<L/n/2;u+=.36)box(g,F,u,.2,0,.07,.75,.07,31);}}
/* old-style marble stair along a path over natural ground (cliff stairs) */
function antStairPath(W,g,pts,w0,w1){let y=antH(pts[0][0],pts[0][1])+.3,acc=0;const tot=pts.reduce((s,p,i)=>i?s+Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]):0,0);
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),rot=Math.atan2(-(b[1]-a[1]),b[0]-a[0]),n=Math.max(1,Math.round(L/.42));
    for(let k=0;k<n;k++){const t=k/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t),gr=antH(x,z)+.25,wd=lerp(w0,w1,clamp(acc/tot,0,1));acc+=L/n;if(gr-y>.1)y+=.16;else if(y-gr>.1)y-=.16;
      const F=antF(x,z,rot,y),dn=Math.max(3.2,y-gr+1.8);g.set(2,.86);box(g,F,0,-dn,0,.23,dn,wd/2,31);g.set(2,.7);box(g,F,0,-dn,wd/2+.25,.23,dn+.8,.25,31);}}return y;}

function antFortress(W,g,G){const AX=ANT.AX,AZ=ANT.AZ,lawn=[],T={};for(const t of ANT.TERR)T[t[3]]=t;
  /* the two wing tiers are told apart: tier 1 (second level) = guest and secretariat wings, full size, ochre plaster, lawn court
     with olive trees; tier 2 (third level) = ceremonial wings, a size smaller, white plaster, a paved court with a long pool and
     statues (the palace gets smaller and grander as one climbs) */
  const TW={tier1:{cx:80,dz:18.5,sc:1,len:64,dep:19,tint:{plaster:[1,.87,.62],tile:[.85,.92,1]}},tier2:{cx:-13,dz:17,sc:.86,len:56,dep:17,tint:{plaster:[1.1,1.18,1.36],tile:[1.1,1.18,1.3]}}};
  /* ---- terraces, parapets, cross walls ---- */
  const OL={};for(const t of ANT.TERR){OL[t[3]]=antOutline(t);antPodium(g,lawn,OL[t[3]],t[2],{lawn:t[3]!=='gate'&&t[3]!=='summit'&&t[3]!=='tier2',part:24,sty:13});}
  const YO=antYardOutline();antPodium(g,lawn,YO,ANT.YARD.level,{part:24,sty:13,earth:1});
  /* paved promenade along the spine of every terrace, and paved aprons round the buildings */
  const flat=(x0,z0,x1,z1,y,kind)=>lawn.push([[[AX+x0,y+.04,AZ+z0],[AX+x1,y+.04,AZ+z0],[AX+x1,y+.04,AZ+z1],[AX+x0,y+.04,AZ+z1]],kind]);
  for(const t of ANT.TERR){if(t[3]==='gate'||t[3]==='summit')continue;for(let x=t[0];x>t[1];x-=6){const x1=Math.max(t[1],x-6),z=antSpZ(x-3),hw=t[3]==='garden'?4:5;flat(x,z-hw,x1,z+hw,t[2],t[3]==='garden'?'gravel':'pave');}}
  for(const k of['tier1','tier2']){const w=TW[k],lv=T[k][2];for(const sd of[-1,1]){const z=antSpZ(w.cx)+sd*w.dz;flat(w.cx+w.len/2,z-w.dep/2,w.cx-w.len/2,z+w.dep/2,lv,'pave');}}
  {const pz=antSpZ(-140);flat(-90,pz-36,-185,pz+34,57,'pave');flat(-133,ANT.BR.z+40,-147,pz-36,57,'pave');}
  const rot=W.antRot={},rotunda=[146,antSpZ(146)+38],portico=[141,antSpZ(141)-31];
  const nearRot=(x,z)=>Math.hypot(x-rotunda[0],z-rotunda[1])<46;
  for(const t of ANT.TERR){const P=OL[t[3]],fort=t[3]==='gate'||t[3]==='garden'||t[3]==='summit';
    antParapet(g,P,t[2],-1,fort?2.4:1.15,fort,null);
    antParapet(g,P,t[2],1,fort?2.4:1.15,fort,(x,z)=>(t[3]==='garden'&&(nearRot(x,z)||x>ANT.YARD.x1-1))||(t[3]==='palace'&&false));}
  antParapet(g,YO,ANT.YARD.level,1,2.4,true,null);
  /* a wall between the garden and the workshop yard: along the yard's north side and its west side, 4.5 m above the yard floor, terracotta coping */
  {const Y=ANT.YARD,lv=Y.level,h=4.5,seg=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),F=frame(AX+(x0+x1)/2,lv,AZ+(z0+z1)/2,Math.atan2(-(z1-z0),x1-x0));g.set(2,.84);box(g,F,0,-1.5,0,L/2+.45,h+1.5,.45,31);g.set(25,.5);box(g,F,0,h,0,L/2+.55,.24,.62,31);};
   for(let x=Y.x0;x>Y.x1+.1;x-=6){const x1=Math.max(Y.x1,x-6);seg(x,antSpZ(x)+Y.z,x1,antSpZ(x1)+Y.z);}
   seg(Y.x1,antSpZ(Y.x1)+Y.z,Y.x1,antWallZ(Y.x1,1));}
  /* balustrades on the terrace fronts (cross walls), open where the stairs arrive */
  for(const k of['tier1','tier2','palace','summit']){const P=OL[k],a=P[0],lv=T[k][2],zc=antSpZ(a[0]);antBal(g,a[0]-.3,a[1]+.6,a[0]-.3,a[2]-.6,lv,(x,z)=>Math.abs(z-zc)<(k==='summit'?7:6));}
  /* ---- the grand marble stair: gate -> garden -> tier 1 -> tier 2 -> palace -> summit ---- */
  const zs=x=>antSpZ(x);
  antFlight(W,g,262,zs(262),26,29,10);antFlight(W,g,112,zs(112),29,37,10,{cyp:1});antFlight(W,g,20,zs(20),37,47,9);antFlight(W,g,-66,zs(-66),47,57,8);antFlight(W,g,-188,zs(-188),57,58,12);
  W.antStairTop=[AX-66,57,AZ+zs(-66)];
  /* ---- gate zone: gatehouse (GLB), cross wall at the neck, German guard barracks ---- */
  {const gx=300,gz=zs(300);antStand(G,'antiumBase','ant_gate',gx,gz,26,0,(g2,F)=>{arcade(g2,F,0,0,0,16,12,1,12,24,{span:.33,attic:2.6});for(const sd of[-1,1]){const S=F.sub(0,0,sd*13);antSqTower(g2,S,10,20);}});
    for(const[z0,z1]of[[gz-23,antWallZ(gx,-1)],[gz+29,antWallZ(gx,1)]]){const L=Math.abs(z1-z0),F=frame(AX+gx+2,26,AZ+(z0+z1)/2,Math.PI/2);g.set(24,.84);box(g,F,0,-14,0,L/2,14+7,1.2,31);g.set(25,.5);box(g,F,0,7,0,L/2+.1,.2,1.35,31);for(let u=-L/2+.8;u<L/2-.4;u+=1.7){g.set(24,.84);box(g,F,u,7.2,0,.45,.75,1.1,31);}}
    const bx=278,bz=gz-36;antStand(G,'antiumBase','ant_barracks',bx,bz,26,0,(g2,F)=>courtBlock(W,g2,F,{cx:0,cz:0,w:34,d:22,y0:0,nSt:2,sH:4,gH:4.6,cw:18,cd:8,part:24,seed:.72,sty:0,fl:1}));
    W.antBarracks=[AX+bx,26,AZ+bz];
    for(let k=0;k<10;k++){const x=268+(k%5)*7,z=gz+(k<5?-14:16)+((k*7)%3);W.trees.push([AX+x,26,AZ+z,'olive',.7]);}}
  /* ---- lower garden: avenue, cypress rows, fountain, beds, round colonnade (GLB), portico (GLB) ---- */
  {const gl=29,av=[];for(let x=258;x>132;x-=6){av.push([AX+x,gl+.02,AZ+zs(x)-4],[AX+x-6,gl+.02,AZ+zs(x-6)-4],[AX+x-6,gl+.02,AZ+zs(x-6)+4],[AX+x,gl+.02,AZ+zs(x)+4]);}W.antAvenue=av;
    for(let x=254;x>136;x-=7){if(Math.abs(x-200)<9)continue;for(const sd of[-1,1]){if(sd>0&&Math.abs(x-rotunda[0])<12)continue;W.trees.push([AX+x,gl,AZ+zs(x)+sd*6.5,'cyp',1]);}}
    {const F=antF(200,zs(200),0,gl);g.set(6,.6);lathe(g,F,0,0,0,[[6,0],[6,.6],[5.4,.6],[5.4,0]],28);const pool=new THREE.Mesh(new THREE.CircleGeometry(5.4,28).rotateX(-Math.PI/2),MAT.pool),pp=F.p(0,.45,0);pool.position.set(...pp);G.add(pool);pedestalStatue(g,F,0,0,0,2,{gilt:true});}
    const bed=(x,z,w,d)=>{const F=antF(x,z,0,gl);g.set(23,.35);for(const[cx,cz,hx,hz]of[[0,-d/2,w/2,.35],[0,d/2,w/2,.35],[-w/2,0,.35,d/2],[w/2,0,.35,d/2]])box(g,F,cx,0,cz,hx,.6,hz,31);g.set(21,.4);box(g,F,0,0,0,w/2-.4,.15,d/2-.4,16);
      for(let i=0;i<6;i++)W.trees.push([AX+x-w/2+1.4+(w-2.8)*((i%3)/2),gl+.1,AZ+z+(i<3?-1:1)*d*.2,'flower',.55,null,1]);};
    for(const x of[246,225,204,183]){const z0=zs(x);bed(x,z0-16,14,7);if(x>=225||x===183)bed(x,z0-27,14,7);bed(x,z0+16,12,7);if(x<=204)bed(x,z0+28,12,7);}
    antStand(G,'antiumBase','ant_rotunda',rotunda[0],rotunda[1],gl,0,(g2,F)=>{g2.set(6,.6);lathe(g2,F,0,-1.2,0,[[27,0],[27,1.2],[0,1.2]],32);g2.set(1,.42);lathe(g2,F,0,7,0,[[25,0],[21.5,2.4],[18,0]],32);
      for(let k=0;k<26;k++){const a=k/26*TAU;for(const R of[24,19]){g2.set(6,.8);box(g2,F,Math.cos(a)*R,0,Math.sin(a)*R,.3,6.6,.3,31);}}});
    antStand(G,'antiumBase','ant_portico',portico[0],portico[1],gl,0,(g2,F)=>{g2.set(0,.5);box(g2,F,0,0,-2.9,24,6,.4,31);g2.set(6,.8);for(let k=0;k<17;k++)box(g2,F,-24+k*3,0,2.8,.25,5,.25,31);roof(g2,F,'gable',0,0,48.6,7,5.6,14*DEG,.4,.5);});
    for(let k=0;k<8;k++){const x=150+k*13,z=zs(x)-38+((k*5)%3);if(Math.abs(x-portico[0])<27)continue;W.trees.push([AX+x,gl,AZ+z,'olive',.75]);}}
  /* ---- palace tiers: two wings on each, the stair between them ---- */
  for(const k of['tier1','tier2']){const w=TW[k],lv=T[k][2],cx=w.cx;
    for(const sd of[-1,1]){const z=zs(cx)+sd*w.dz;antStand(G,'antiumBase','ant_wing',cx,z,lv,sd<0?Math.PI:0,(g2,F)=>{rectWalls(g2,F,0,0,60,15,-6,9.4,0,Object.assign({},ANT_WALL,{sty:13,nSt:2,gH:5,sH:4.4}));roof(g2,F,'hip',0,0,60.8,15.8,9.4,22*DEG,.6,.84);},{sc:w.sc,tint:w.tint});}
    if(k==='tier1'){for(let x=cx+28;x>cx-28;x-=9){if(Math.abs(x-cx)<5)continue;for(const sd of[-1,1])W.trees.push([AX+x,lv,AZ+zs(x)+sd*8,'olive',.8]);}}
    else{const a=7,b=-33,L=a-b,xm=(a+b)/2,F=antF(xm,zs(xm),0,lv);
      g.set(6,.6);box(g,F,0,0,-1.9,L/2+.5,.5,.4,31);box(g,F,0,0,1.9,L/2+.5,.5,.4,31);box(g,F,L/2+.1,0,0,.4,.5,2.3,31);box(g,F,-L/2-.1,0,0,.4,.5,2.3,31);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(L,3.4).rotateX(-Math.PI/2),MAT.pool);pl.position.set(AX+xm,lv+.42,AZ+zs(xm));G.add(pl);
      for(const sx of[-1,1]){const xs=xm+sx*(L/2+2.4);pedestalStatue(g,frame(AX+xs,lv,AZ+zs(xs),0),0,0,0,2.2,{gilt:false});}
      for(let x=cx+22;x>cx-24;x-=8)for(const sd of[-1,1])W.trees.push([AX+x,lv,AZ+zs(x)+sd*5.2,'cyp',.9]);}
    for(let x=cx+26;x>cx-30;x-=9)for(const sd of[-1,1]){const z=antWallZ(x,sd)-sd*4;W.trees.push([AX+x,lv,AZ+z,'cyp',1.05]);}}
  /* ---- upper palace (GLB): cloister, bronze altar, bedchamber; north terrace towards the bridge ---- */
  {const px=-140,pz=zs(-140),lv=T.palace[2];antStand(G,'antiumBase','ant_palace',px,pz,lv,0,(g2,F)=>{courtBlock(W,g2,F,{cx:0,cz:0,w:84,d:62,y0:0,nSt:2,sH:4.4,gH:5.2,cw:58,cd:36,part:24,seed:.86,sty:13,fl:8|32});
      for(const[sx,sz]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const S=F.sub(sx*36.5,0,sz*25.5);antSqTower(g2,S,11,16);}});
    W.antPalace=[AX+px,lv,AZ+pz];
    for(let x=-74;x>-184;x-=8){for(const sd of[-1,1]){const z=antWallZ(x,sd)-sd*3.5;if(sd<0&&Math.abs(x-ANT.BR.x)<12)continue;W.trees.push([AX+x,lv,AZ+z,'cyp',1]);}}}
  /* ---- summit court: observation tower (GLB, the highest point), round shrine (GLB) ---- */
  {const lv=T.summit[2],S=ANT.SUM;antStand(G,'antiumBase','ant_tower',S[0],S[1],lv,0,(g2,F)=>{rectWalls(g2,F,0,0,12,12,-12,40,0,Object.assign({},ANT_WALL,{sty:13,nSt:8,gH:5,sH:5}));g2.set(2,.55);box(g2,F,0,40,0,6.4,1.1,6.4,31);});
    W.antTower=[AX+S[0],lv+40,AZ+S[1]];
    antStand(G,'antiumBase','ant_tholos',-205,zs(-205)+20,lv,0,(g2,F)=>{g2.set(6,.6);lathe(g2,F,0,0,0,[[8.5,0],[8.5,1.6],[0,1.6]],24);g2.set(0,.5);lathe(g2,F,0,1.6,0,[[5.4,0],[5.4,8],[0,8]],20);g2.set(1,.42);lathe(g2,F,0,9.4,0,[[8,0],[0,3.6]],24);});
    for(let k=0;k<7;k++){const a=k/7*TAU,x=-205+Math.cos(a)*14,z=zs(-205)+20+Math.sin(a)*13;if(antLevel(x,z)===null)continue;W.trees.push([AX+x,lv,AZ+z,'cyp',.9]);}}
  /* ---- wall towers (GLB module) on the terrace corners ---- */
  for(const[x,sd]of[[262,-1],[198,-1],[112,-1],[20,-1],[-66,-1],[-188,-1],[262,1],[226,1],[134,1],[66,1],[20,1],[-66,1],[-126,1],[-188,1],[-246,1]]){
    const z=antWallZ(x,sd)+sd*1.5,lv=Math.max(antLevel(x-3,z-sd*4)||0,antLevel(x+3,z-sd*4)||0)||antH(x,z);antStand(G,'antiumBase','ant_walltower',x,z,lv-3,0,(g2,F)=>antSqTower(g2,F,8,14));}
  /* ---- the cliff bridle path outside the north wall, the sea-god shrine, the finish platform ---- */
  {const path=[];for(let x=292;x>-38;x-=4)path.push([x,antWallZ(x,-1)-6]);W.antRoadPts=path;
    for(let i=0;i<path.length-1;i++){const[a,az]=path[i],[b,bz]=path[i+1],ya=antH(a,az)+.15,yb=antH(b,bz)+.15;g.set(5,.5);g.poly([[AX+a,ya,AZ+az-2.6],[AX+b,yb,AZ+bz-2.6],[AX+b,yb,AZ+bz+2.6],[AX+a,ya,AZ+az+2.6]],[0,1,0]);}
    const sx=150,sz=antWallZ(150,-1)-1.6,F=antF(sx,sz,Math.PI,antH(sx,sz));g.set(2,.6);box(g,F,0,0,0,.9,1.6,.6,31);g.set(7,.3);box(g,F,0,.4,-.62,.45,.8,.02,31);roof(g,F,'gable',0,0,2.1,1.4,1.6,24*DEG,.15,.5);W.antShrine=[AX+sx,F.oy,AZ+sz];
    const ex=-30,ez=antWallZ(-30,-1)-6,ey=antH(ex,ez),E=antF(ex,ez,0,ey);g.set(2,.6);box(g,E,0,-2,0,3.2,4.2,3.2,31);for(let k=0;k<6;k++)box(g,E,3.6+k*.4,-2,0,.2,4-k*.36,1.3,31);W.antFinish=[AX+ex,ey+2.2,AZ+ez];}
  /* lawns, paving and gravel (vertex colours) */
  {const pos=[],col=[],C={lawn:[.13,.2,.065],pave:[.46,.43,.37],gravel:[.42,.38,.3],earth:[.3,.25,.18]};const put=(Q,c)=>{for(const i of[0,1,2,0,2,3]){pos.push(...Q[i]);col.push(...c);}};
    for(const[Q,k]of lawn){const c=C[k],n=.92+.08*Math.sin(Q[0][0]*.21+Q[0][2]*.17);put(Q,[c[0]*n,c[1]*n,c[2]*n]);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide}));m.receiveShadow=true;G.add(m);}}

/* Street-front relief for the procedural houses (briefs/rome/facades.md, "Relief", 2026-10-28).
   The facade shader (wallS) paints windows, shops and arches on one flat quad. These few pieces of geometry sit on its
   painted openings so the front casts shadows: stone sills, timber lintels and open shutters on the upper windows,
   brick piers with travertine imposts, lintels and counters on the shops, a dark eave soffit with a row of terracotta
   antefixes, a moulded string course. Sizes are the ones wallS computes from the same seed, sty, flags and wall length
   (the window bays are forced on with fl bit 524288, see houseShell); nothing here draws a die, per-house and per-bay
   choices come from hash2 of the place, so the city layout does not change.
   【史】Ostia and Herculaneum street fronts: shops between brick piers under timber or brick flat lintels, travertine
   impost blocks, masonry counters; tile roofs edged with antefixes; wooden shutters (refs/arch/SOURCES.md). */
const RD_GEO_WIN=524288;
const rdF=x=>x-Math.floor(x),rdS=(s,k)=>rdF(Math.fround(s*Math.fround(k)));   // fract(seed*k) as float32, the way the shader computes it
const rdSeed=s=>Math.floor(Math.fround(s)*4096+.5)/4096;                         // wallS rounds the seed attribute to 1/4096
// the upper-floor window wallS draws in every bay of storey si on a geometric-window wall, or null (wallS: kind 0)
function rdUpperWin(P,s,sty,fl,nSt,gH,sH,L,si){
  const res=P<.5||(P>8.5&&P<9.5),bLog=fl&256,bArc=fl&512,bGAr=fl&131072,top=si>nSt-1.5,winT=sty%8;
  if(fl&262144||(bArc&&!res)||(bLog&&top&&!res))return null;
  const bayW=(!res&&bGAr)?4.6:3+rdS(s,5.1),nb=Math.max(1,Math.floor(L/bayW+.3)),bay=L/nb;
  let hw=.36+.12*rdS(s,5.3),oh=1.05+.3*rdS(s,1.9),sill=.95,ar=(winT===1||winT===4||winT===7)?1:0;
  if(winT===3||top){hw=.3;oh=.75;sill=1;ar=0;}
  if(winT===5&&si<1.5){oh=1.8;hw=.48;sill=.55;ar=1;}
  if(nSt>2.5&&si===1&&!(bLog&&top)){hw=Math.max(hw,.5);oh=Math.max(oh,1.55);sill=Math.min(sill,1.05);ar=1;}
  if(rdS(s,3.9)<.18&&P<.5&&(top||si<1.5)){hw=Math.min(bay*.36,1.25);oh=Math.max(oh,1.7);ar=1;sill=Math.min(sill,.8);}
  return{nb,bay,hw,oh,sill,ar};}
// the ground-floor openings wallS draws for an arcade (grT 1) or a row of shops (grT 2), or null
function rdGround(P,s,sty,fl,gH,L){
  const res=P<.5||(P>8.5&&P<9.5),grT=Math.floor(sty/8);
  if(fl&262144||(fl&131072&&!res)||(grT!==1&&grT!==2))return null;
  const nb=Math.max(1,Math.floor(L/(3+rdS(s,5.1))+.3)),bay=L/nb;
  if(grT===1){const hw=Math.min(bay*.34,1.6);return{shop:false,nb,bay,hw,oh:Math.min(gH-.45,2.1+hw),ar:1};}
  return{shop:true,nb,bay,hw:Math.min(bay*.38,1.5),oh:Math.min(gH-.6,2.6),ar:rdS(s,4.1)>=.55?1:0};}
// a row of terracotta antefixes standing on the eave line a→b (world [x,z] at height y), facing cross(up, a→b)
function rdAntefixes(g,a,b,y,seed,bn=0){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<.6)return;
  const ux=dx/l,uz=dz/l,nx=uz*.03,nz=-ux*.03,n=Math.floor(l/.56);g.set(4,seed,0,0,1,4,bn,1);
  for(let k=1;k<n;k++){const t=k*l/n,cx=a[0]+ux*t+nx,cz=a[1]+uz*t+nz;g.poly([[cx-ux*.1,y-.04,cz-uz*.1],[cx+ux*.1,y-.04,cz+uz*.1],[cx,y+.2,cz]],[nx,0,nz]);}}
// a tiled pent roof along x0..x1 of wall frame F (local -z is out): against the wall at y1, d deep, falling by drop;
// a dark underside and fascia, timber beam ends with diagonal struts back to the wall, antefixes along the eave
function rdPentRoof(g,F,x0,x1,y1,d,drop,seed,bn=0,struts=true){const y2=y1-drop,len=x1-x0;
  g.set(1,seed+.2,0,0,1,4,bn,1);g.poly([F.p(x0,y1,.02),F.p(x1,y1,.02),F.p(x1,y2,-d),F.p(x0,y2,-d)],[0,1,0]);
  g.set(3,seed,0,0,1,4,bn,1);g.poly([F.p(x0,y1-.1,0),F.p(x1,y1-.1,0),F.p(x1,y2-.1,-d),F.p(x0,y2-.1,-d)],[0,-1,0]);box(g,F,(x0+x1)/2,y2-.2,-d+.04,len/2,.2,.04,4|32);
  if(struts){const nb=Math.max(2,Math.round(len/2.6));for(let k=0;k<nb;k++){const x=x0+.25+(len-.5)*k/(nb-1);
    box(g,F,x,y2-.2,-d/2,.07,.18,d/2,2|8|32);   // beam end through the wall
    g.poly([F.p(x-.05,y2-.2,-d+.25),F.p(x+.05,y2-.2,-d+.25),F.p(x+.05,y2-1.05,-.02),F.p(x-.05,y2-1.05,-.02)],F.d(0,-1,-1));}}   // diagonal strut back to the wall
  const a=F.p(x0,0,-d-.03),b=F.p(x1,0,-d-.03);rdAntefixes(g,[a[0],a[2]],[b[0],b[2]],y2,seed,bn);}
// one lot's street front L[0]→L[1]; o as in lotBuild0 (after its storey cut), plan = houseGalleryPlan(L,o)
function romanFrontRelief(W,g,L,o,floorY,H,plan,awning){
  if(L.length!==4||(o.fl||0)&262144)return;
  const A=L[0],B=L[1],dx=B[0]-A[0],dz=B[1]-A[1],len=Math.hypot(dx,dz);if(len<5)return;
  const F=frame(A[0],0,A[1],Math.atan2(-dz,dx)),s=rdSeed(o.seed||0),kx=Math.round(A[0]*3),kz=Math.round(A[1]*3),hp=k=>hash2(kx+k*7919,kz-k*104729);
  const two=o.up!==undefined&&o.up!==o.part,gH=o.gH,sH=o.sH,nSt=o.nSt,bn=o.burn||0;
  const sp=pt=>g.set(pt,s,0,0,1,4,bn,1),gap=new Set(plan.map(t=>t.level));   // storeys taken by a gallery on this front
  // ground floor: brick piers between the openings, travertine imposts or a timber lintel, counters in some shops
  const gP=o.part,gSty=o.sty||0,gFl=two?2:(o.fl||0),G=rdGround(gP,s,gSty,gFl,gH,len);
  if(G){const y0=floorY-.35,yTop=floorY+(G.ar?G.oh-G.hw:G.oh),pz=-.08;
    const edges=[0];for(let i=0;i<G.nb;i++)edges.push((i+.5)*G.bay-G.hw,(i+.5)*G.bay+G.hw);edges.push(len);
    for(let k=0;k<edges.length;k+=2){const x0=edges[k],x1=edges[k+1];if(x1-x0<.12)continue;
      g.set(9,.07,0,1,1,gH,bn,1);wall(g,F,x0,pz,x1,pz,y0,yTop,floorY,sH);   // front face only: the 8 cm returns barely show
      if(G.ar){sp(2);box(g,F,(x0+x1)/2,yTop-.02,-.05,(x1-x0)/2+.06,.2,.08,4|32);}}   // travertine impost block at the springing
    for(let i=0;i<G.nb;i++){const c=(i+.5)*G.bay;
      if(!G.ar){sp(3);box(g,F,c,floorY+G.oh,-.06,G.hw+.2,.22,.08,4|32);}   // timber lintel over a square shop opening
      if(G.shop&&hp(i+11)<.5){const w=Math.min(1.25,G.hw*1.05),x=c-G.hw+.04+w/2;sp(2);box(g,F,x,floorY-.1,-.12,w/2,1.02,.3,4|16);}}}   // masonry counter in the opening
  // a tiled pent roof over the shops on timber beams and struts, its eave edged with antefixes (Ostia, Herculaneum);
  // decorLot then leaves this front alone. Not over a cloth awning, not into a road.
  if(G&&G.shop&&!awning&&nSt>=2&&len>=6&&hp(5)<.6&&roadDecorationClear(W,L,1.4)){
    const d=1.25,y1=floorY+gH+.12,x0=.12,x1=len-.12;(W.rdCanopy||(W.rdCanopy=new WeakSet())).add(L);(W.rdLog||(W.rdLog=[])).push({x:A[0]+dx/2,z:A[1]+dz/2,y:floorY,nx:dz/len,nz:-dx/len,ux:dx/len,uz:dz/len,len});
    rdPentRoof(g,F,x0,x1,y1,d,.42,o.seed,bn);}
  // first upper floor (the largest windows): stone sill, timber lintel on square windows, open wooden shutters on some
  // houses. Higher floors keep the painted sill, which holds the triangle budget (+1.2M for the city)
  const uP=two?o.up:o.part,uSty=two?3:(o.sty||0),uFl=two?(o.flUp||16):(o.fl||0),shut=!(uFl&16)&&hp(3)<.4;
  for(let si=1;si<Math.min(nSt,2);si++){if(gap.has(si))continue;
    const w=rdUpperWin(uP,s,uSty,uFl,nSt,gH,sH,len,si);if(!w)continue;const yb=floorY+gH+(si-1)*sH+w.sill;
    for(let i=0;i<w.nb;i++){const c=(i+.5)*w.bay;
      sp(2);box(g,F,c,yb-.14,-.05,w.hw+.14,.14,.07,4|16);
      if(!w.ar){sp(3);box(g,F,c,yb+w.oh,-.03,w.hw+.1,.12,.04,4);
        if(shut){const lw=w.hw;for(const sd of[-1,1]){const x0=c+sd*(w.hw+.03),x1=x0+sd*lw;
          g.poly([F.p(Math.min(x0,x1),yb,-.05),F.p(Math.max(x0,x1),yb,-.05),F.p(Math.max(x0,x1),yb+w.oh,-.05),F.p(Math.min(x0,x1),yb+w.oh,-.05)],F.d(0,0,-1));}}}}}
  // a moulded string course at the first floor where the house has its painted band (wallS bBands, hA < .55)
  if(!two&&nSt>1&&(o.fl||0)&8&&rdS(s,17.31)<.55){sp(2);box(g,F,len/2,floorY+gH-.08,-.04,len/2+.05,.16,.06,4|16|32);}
  // eave: dark soffit and a row of terracotta antefixes on the street edge of a pitched roof; a stone cornice on a flat one
  if(!o.flat){const E=pInset(L,-.55);if(!E)return;const tp=Math.tan(o.pitch),yE=H-.55*tp,P=(p,y)=>[p[0],y,p[1]];
    sp(3);g.poly([P(A,yE-.24),P(B,yE-.24),P(E[1],yE-.24),P(E[0],yE-.24)],[0,-1,0]);
    rdAntefixes(g,E[0],E[1],yE,o.seed,bn);}
  else{sp(2);box(g,F,len/2,H-.12,-.06,len/2+.04,.2,.1,4|16|32);}
}
// A row of tabernae drawn on a closed wall (the noble domus lets out shops either side of its door, as at Pompeii and
// Herculaneum): dark open fronts, brick piers, timber lintels, a counter in every other shop, an optional tiled pent roof.
// F: wall frame with local -z outward and the wall face at z = zw; x0..x1 along the wall; y: floor height in F
function rdShopRow(g,F,zw,x0,x1,y,seed,bn=0,roof=true){const span=x1-x0,n=Math.floor(span/3.2);if(n<1)return false;
  const bay=span/n,hw=Math.min(1.35,bay*.36),oh=2.55,yT=y+oh,z=zw-.015;
  for(let i=0;i<n;i++){const c=x0+(i+.5)*bay;
    g.set(39,seed,0,0,1,4,bn,1);g.poly([F.p(c-hw,y,z),F.p(c+hw,y,z),F.p(c+hw,yT,z),F.p(c-hw,yT,z)],F.d(0,0,-1));   // the dark shop interior
    g.set(3,seed,0,0,1,4,bn,1);box(g,F,c,yT,z-.06,hw+.22,.22,.08,4|16|32);   // timber lintel
    if(i%2===0){g.set(2,seed,0,0,1,4,bn,1);box(g,F,c-hw+.62,y-.1,z-.2,.58,1.02,.2,4|16|2|8);}}   // counter
  for(let i=0;i<=n;i++){const c=x0+i*bay,a=Math.max(x0,c-(bay/2-hw)),b=Math.min(x1,c+(bay/2-hw));if(b-a<.15)continue;
    g.set(9,.07,0,1,1,4,bn,1);wall(g,F,a,z-.08,b,z-.08,y-.3,yT,y,3);
    g.poly([F.p(a,y-.3,z),F.p(a,y-.3,z-.08),F.p(a,yT,z-.08),F.p(a,yT,z)],F.d(-1,0,0));g.poly([F.p(b,y-.3,z-.08),F.p(b,y-.3,z),F.p(b,yT,z),F.p(b,yT,z-.08)],F.d(1,0,0));}
  if(roof){const Fz=F.sub(0,0,zw);rdPentRoof(g,Fz,x0+.1,x1-.1,yT+.55,1.1,.38,seed,bn);}
  return true;}
// The peristyle of a courtyard house: a narrow lean-to tile roof from the wing walls I down to just past the column
// line J, a dark underside, antefixes facing the court. Skipped where the wings are too low to take it.
// 【史】Herculaneum and Pompeii peristyles; the court stays open to the sky in the middle.
function rdPeristyleRoof(g,I,J,y,seed,eaveMin){const C=pCen(J),yC=y+3.25,yW=yC+.8,yK=yC+.03;if(!I||!J||I.length!==J.length||eaveMin<yW+.4)return false;
  const n=I.length,K=J.map((p,i)=>{const dx=p[0]-I[i][0],dz=p[1]-I[i][1],l=Math.hypot(dx,dz)||1;return[p[0]+dx/l*.45,p[1]+dz/l*.45];});
  for(let i=0;i<n;i++){const k=(i+1)%n,Y=(p,h)=>[p[0],h,p[1]];
    g.set(43,seed);g.poly([Y(I[i],yW),Y(I[k],yW),Y(K[k],yK),Y(K[i],yK)],[0,1,0]);
    g.set(3,seed);g.poly([Y(I[i],yW-.12),Y(I[k],yW-.12),Y(K[k],yK-.12),Y(K[i],yK-.12)],[0,-1,0]);
    let a=K[i],b=K[k];const mx=(a[0]+b[0])/2-C[0],mz=(a[1]+b[1])/2-C[1];if((b[1]-a[1])*mx-(b[0]-a[0])*mz>=0)[a,b]=[b,a];   // antefixes face the court
    rdAntefixes(g,a,b,yK,seed);}
  return true;}
// the narrowest reserved road in front of the edge L[0]→L[1] within reach metres (Infinity if none)
function rdStreetWidth(W,L,reach){const A=L[0],B=L[1],dx=B[0]-A[0],dz=B[1]-A[1],len=Math.hypot(dx,dz)||1,c=pCen(L),mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2,
    zo=((mx-c[0])*dz/len+(mz-c[1])*(-dx/len))>0?-1:1,rot=Math.atan2(-dz/len,dx/len),q0=frame(mx,0,mz,rot).p(0,0,zo*reach/2),
    q={cx:q0[0],cz:q0[2],hw:len/2,hd:reach/2,c:Math.cos(rot),s:Math.sin(rot),r:Math.hypot(len/2,reach/2)};let w=Infinity;
  for(const f of W.foot?.list||[])if(f.tag==='road'&&Math.hypot(f.cx-q.cx,f.cz-q.cz)<=f.r+q.r&&obb(f,q))w=Math.min(w,f.hd*2);return w;}

/* ================= 街区生成器：街道网格 → 街区 → 地块 → 建筑（见缝插针） ================= */
const IDF=frame(0,0,0,0);
function pArea(P){let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;}
function pInset(P,d){const n=P.length,Ls=[];for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;Ls.push([a[0]-dz/l*d,a[1]+dx/l*d,dx,dz]);}
  const Q=[];for(let i=0;i<n;i++){const A=Ls[(i+n-1)%n],B=Ls[i],den=A[2]*B[3]-A[3]*B[2];if(Math.abs(den)<1e-6)return null;const t=((B[0]-A[0])*B[3]-(B[1]-A[1])*B[2])/den;Q.push([A[0]+A[2]*t,A[1]+A[3]*t]);}
  if(pArea(Q)<4)return null;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],c=Q[i],e=Q[(i+1)%n];if((b[0]-a[0])*(e[0]-c[0])+(b[1]-a[1])*(e[1]-c[1])<=0)return null;}return Q;}
const lp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const pCen=P=>{let x=0,z=0;for(const p of P){x+=p[0];z+=p[1];}return[x/P.length,z/P.length];};
function lotOBB(L){const a=L[0],b=L[1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l,c=pCen(L);let hw=0,hd=0;
  for(const p of L){const rx=p[0]-c[0],rz=p[1]-c[1];hw=Math.max(hw,Math.abs(rx*ux+rz*uz));hd=Math.max(hd,Math.abs(-rx*uz+rz*ux));}return{cx:c[0],cz:c[1],hw,hd,rot:Math.atan2(-uz,ux),ux,uz};}
// one lot = one building; L[0]→L[1] faces the street
function lotBuild(W,g,L,o,R,smk){if(o.nSt>6||o.sH>3.05||o.gH>4.6)o=Object.assign({},o,{nSt:Math.min(6,o.nSt),sH:Math.min(o.sH,3.05),gH:Math.min(o.gH,4.6)});
  if(L.length===4&&!o.noSplit&&!o.flat&&(o.nSt||1)>=3&&R){const A=L[0],B=L[1],C=L[2],D=L[3],ab=Math.hypot(B[0]-A[0],B[1]-A[1]),ad=Math.hypot(D[0]-A[0],D[1]-A[1]),lg=Math.max(ab,ad);
    if(lg>17){const k=Math.max(2,Math.round(lg/(9.5+R()*2.5)));let ok=false;for(let i=0;i<k;i++){const t0=i/k,t1=(i+1)/k,Q=ab>=ad?[lp(A,B,t0),lp(A,B,t1),lp(D,C,t1),lp(D,C,t0)]:[lp(A,D,t0),lp(B,C,t0),lp(B,C,t1),lp(A,D,t1)];
      const o2=Object.assign({},o,{nSt:Math.max(2,Math.min(6,o.nSt+Math.round((R()-.5)*2.6))),seed:(o.seed+i*.137+R()*.05)%1,noSplit:true,loggia:o.loggia&&R()<.4,loggiaA:o.loggiaA&&R()<.5});if(lotBuild0(W,g,Q,o2,R,smk)){ok=true;decorLot(W,g,Q,o2,R);}}return ok;}}
  const okB=lotBuild0(W,g,L,o,R,smk);if(okB)decorLot(W,g,L,o,R);return okB;}
function decorLot(W,g,L,o,R){if(L.length!==4||(o.nSt||1)<3||!R)return;const A=L[0],B=L[1],len=Math.hypot(B[0]-A[0],B[1]-A[1]);if(len<6)return;let y1=-1e9;for(const p of L)y1=Math.max(y1,W.gy(p[0],p[1]));const fy=y1+.15,ux=(B[0]-A[0])/len,uz=(B[1]-A[1])/len;
  const cx=(L[0][0]+L[1][0]+L[2][0]+L[3][0])/4,cz=(L[0][1]+L[1][1]+L[2][1]+L[3][1])/4,mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2,zo=((mx-cx)*uz+(mz-cz)*(-ux))>0?-1:1,F=frame(mx,fy,mz,Math.atan2(-uz,ux)),r=R(),gH=o.gH||4;
  if(r<.24){g.set(3,.45);box(g,F,0,gH-.2,zo*.5,len/2-.5,.2,.5,31);box(g,F,0,gH,zo*.96,len/2-.5,.95,.04,31);for(let x=-len/2+.9;x<len/2-.5;x+=1.7)box(g,F,x,gH-.62,zo*.3,.07,.42,.3,31);}
  else if(r<.38){const k=Math.max(2,Math.round(len/3.2));for(let i=0;i<=k;i++){const q=F.p(-len/2+.4+(len-.8)*i/k,0,zo*2.5);W.cols.simple.push([q[0],fy,q[2],F.rot,gH-.5,[.96,.92,.86]]);}g.set(1,o.seed);g.poly([F.p(-len/2,gH-.3,0),F.p(len/2,gH-.3,0),F.p(len/2,gH-.8,zo*2.9),F.p(-len/2,gH-.8,zo*2.9)],[0,1,0]);}}
function lotBuild0(W,g,L,o,R,smk){if(o.up===30&&o.nSt>4)o=Object.assign({},o,{up:0});   // timber frame only on houses of <= 4 storeys (facades.md); taller ones are plain plaster
  let y0=1e9,y1=-1e9;for(const p of L){const y=W.gy(p[0],p[1]);if(y<y0)y0=y;if(y>y1)y1=y;}if(y1-y0>16)return false;
  const perim=(Q,d)=>{let m=1e9;for(let e=0;e<Q.length;e++){const a=Q[e],b=Q[(e+1)%Q.length],k=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let i=0;i<k;i++){const t=i/k;m=Math.min(m,W.gy(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t));}}return m;},ym=Math.min(y0,perim(L)),
    floorY=y1+.15,yB=ym-2.5,gH=o.gH,sH=o.sH,H=floorY+gH+(o.nSt-1)*sH,n=L.length,two=o.up!==undefined&&o.up!==o.part,bn=o.burn||0,P=(p,y)=>[p[0],y,p[1]],wp=two?o.up:o.part,lg=!!(o.loggia||o.loggiaA)&&n===4&&o.nSt>=(o.loggiaA?2:3)&&!o.flat,Hw=lg?H-sH:H;
  for(let e=0;e<n;e++){const a=L[e],b=L[(e+1)%n],st=e===0,top=st?Hw:H;
    if(two){g.set(o.part,o.seed,st?o.sty:3,st?(2|(o.shr?32768:0)):0,1,gH,bn,o.lit);wall(g,IDF,a[0],a[1],b[0],b[1],yB,floorY+gH,floorY,sH);g.set(o.up,o.seed,3,o.flUp||16,o.nSt,gH,bn,o.lit);wall(g,IDF,a[0],a[1],b[0],b[1],floorY+gH,top,floorY,sH);}
    else{g.set(o.part,o.seed,st?o.sty:o.sty%8,st?o.fl:(o.fl&~(2|32768|131072)),o.nSt,gH,bn,o.lit);wall(g,IDF,a[0],a[1],b[0],b[1],yB,top,floorY,sH);}}
  // a house on a slope stands on a terrace: a retaining wall 2 m outside the walls up to the floor, paved on top (the old walls stopped 2.5 m below the lowest corner and could hang over a hollow)
  const sl=y1-ym;(W.lotLog=W.lotLog||[]).push({L,yB,floorY,ym,sl});
  if(sl>1.6){const E=pInset(L,-2)||L,yE=Math.min(ym,perim(E))-1.2;g.set(22,.4);for(let e=0;e<E.length;e++){const a=E[e],b=E[(e+1)%E.length];wall(g,IDF,a[0],a[1],b[0],b[1],yE,floorY-.05,floorY,sH);}
    g.set(11,.4);g.poly(E.map(p=>P(p,floorY-.05)),[0,1,0]);g.set(2,.45);for(let e=0;e<E.length;e++){const a=E[e],b=E[(e+1)%E.length];g.poly([P(a,floorY-.05),P(b,floorY-.05),P(b,floorY+.1),P(a,floorY+.1)],[b[1]-a[1],0,-(b[0]-a[0])]);}}
  if(lg){const A=L[0],B=L[1],C=L[2],D=L[3],ta=Math.min(.45,2.4/(Math.hypot(D[0]-A[0],D[1]-A[1])||1)),tb=Math.min(.45,2.4/(Math.hypot(C[0]-B[0],C[1]-B[1])||1)),A2=lp(A,D,ta),B2=lp(B,C,tb),dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1,ix=-dz/l*.4,iz=dx/l*.4,k=Math.max(2,Math.round(l/3.6));
    g.set(5,o.seed);g.poly([P(A,Hw+.03),P(B,Hw+.03),P(B2,Hw+.03),P(A2,Hw+.03)],[0,1,0]);
    // an open arcade has depth: the back wall, the two returns and the soffit are one dark flat recess (sRGB ~45/38/34), the street front is the stone arcade/colonnade
    g.set(39,o.seed,0,1,1,4,0,1);wall(g,IDF,A2[0],A2[1],B2[0],B2[1],Hw,H,floorY,sH);{const ux=dx/l*.05,uz=dz/l*.05,Ai=[A[0]+ux,A[1]+uz],A2i=[A2[0]+ux,A2[1]+uz],Bi=[B[0]-ux,B[1]-uz],B2i=[B2[0]-ux,B2[1]-uz];g.poly([P(Ai,Hw),P(A2i,Hw),P(A2i,H),P(Ai,H)],[dx,0,dz]);g.poly([P(B2i,Hw),P(Bi,Hw),P(Bi,H),P(B2i,H)],[-dx,0,-dz]);}   /* 5 cm inside the real side walls: coplanar they z-fought into a black sliver at the corner */g.poly([P(A,H-.05),P(B,H-.05),P(B2,H-.05),P(A2,H-.05)],[0,-1,0]);
    if(o.loggiaA){(W.loggiaLog=W.loggiaLog||[]).push([Math.round((A[0]+B[0])/2),Math.round(Hw),Math.round((A[1]+B[1])/2),o.nSt,+(dz/l).toFixed(2),+(-dx/l).toFixed(2)]);const kk=Math.max(2,Math.round(l/3.3));arcade(g,frame((A[0]+B[0])/2,0,(A[1]+B[1])/2,Math.atan2(-dz/l,dx/l)),0,Hw,.5,l*.99,sH-.2,kk,.8,2,{span:.3,attic:.55,pilasters:false,cornice:false,seed:o.seed});}   // open top-floor loggia with real arches (stone)
    else for(let t=0;t<=k;t++){const p=lp(A,B,.04+.92*t/k);W.cols.simple.push([p[0]+ix,Hw,p[1]+iz,0,sH*.84,[1,.97,.92]]);}
    g.set(2,o.seed);wall(g,IDF,A[0],A[1],B[0],B[1],H-.5,H,H-30,4);wall(g,IDF,B[0],B[1],A[0],A[1],H-.5,H,H-30,4);
    {const Fp=frame((A[0]+B[0])/2,0,(A[1]+B[1])/2,Math.atan2(-dz/l,dx/l));g.set(2,o.seed);box(g,Fp,0,Hw,o.loggiaA?.22:-.1,l/2*.99,.95,.1,31);box(g,Fp,0,Hw+.95,o.loggiaA?.22:-.1,l/2*.99,.1,.15,31);}}   // parapet line across the openings (balustrade wall with a coping)
  if(n===4&&!o.flat){const E=pInset(L,-.55)||L,A=L[0],B=L[1],C=L[2],D=L[3],m0=lp(D,A,.5),m1=lp(B,C,.5),e0=lp(E[3],E[0],.5),e1=lp(E[1],E[2],.5),
      dep=Math.hypot((A[0]+B[0]-C[0]-D[0])/2,(A[1]+B[1]-C[1]-D[1])/2),tp=Math.tan(o.pitch),yR=H+Math.min(dep*.5*tp,6.5),yE=H-.55*tp;
    g.set(1,o.seed+.2);g.poly([P(E[0],yE),P(E[1],yE),P(e1,yR),P(e0,yR)],[0,1,0]);g.poly([P(e0,yR),P(e1,yR),P(E[2],yE),P(E[3],yE)],[0,1,0]);g.set(4,o.seed);ridgeCap(g,P(e0,yR),P(e1,yR));
    g.set(2,o.seed);for(const[a,b]of[[E[0],E[1]],[E[2],E[3]]])g.poly([P(a,yE-.24),P(b,yE-.24),P(b,yE),P(a,yE)],[b[1]-a[1],0,-(b[0]-a[0])]);
    g.set(wp,o.seed,0,1,o.nSt,gH,bn,1);for(const[a,b,m]of[[B,C,m1],[D,A,m0]])g.poly([P(a,H),P(b,H),P(m,yR)],[b[1]-a[1],0,-(b[0]-a[0])]);
    if(smk&&R()<.03)smk.push([(e0[0]+e1[0])/2,yR+.6,(e0[1]+e1[1])/2]);}
  else{const ar=pArea(L),cy=ar>260&&R()<.55?pInset(L,Math.min(5.5,Math.sqrt(ar)*.27)):null,tp=R()<.6?25:11;
    // flat roof terrace (opus signinum or slabs); big blocks get a real light-well court cut through them
    g.set(tp,o.seed);if(cy){for(let e=0;e<n;e++){const e2=(e+1)%n;g.poly([P(L[e],H+.05),P(L[e2],H+.05),P(cy[e2],H+.05),P(cy[e],H+.05)],[0,1,0]);}}else g.poly(L.map(p=>P(p,H+.05)),[0,1,0]);
    g.set(wp,o.seed,0,1,1,4,bn,1);
    for(let e=0;e<n;e++){const a=L[e],b=L[(e+1)%n];wall(g,IDF,a[0],a[1],b[0],b[1],H,H+.9,H-30,4);wall(g,IDF,b[0],b[1],a[0],a[1],H,H+.9,H-30,4);}
    if(cy){g.set(wp,o.seed,o.sty%8,o.fl&~2,o.nSt,gH,bn,o.lit);for(let e=0;e<n;e++){const a=cy[e],b=cy[(e+1)%n];wall(g,IDF,b[0],b[1],a[0],a[1],floorY,H,floorY,sH);}
      g.set(wp,o.seed,0,1,1,4,bn,1);for(let e=0;e<n;e++){const a=cy[e],b=cy[(e+1)%n];wall(g,IDF,a[0],a[1],b[0],b[1],H,H+.9,H-30,4);}
      g.set(11,o.seed);g.poly(cy.map(p=>P(p,floorY+.05)),[0,1,0]);const cc=pCen(cy);g.set(2,.5);lathe(g,frame(cc[0],floorY,cc[1],0),0,0,0,[[.75,0],[.75,.85],[.55,.85],[.55,.1]],10);}
    if(o.kiosk&&ar>60){const I=pInset(L,Math.min(2.2,Math.sqrt(ar)*.18));if(I){const yk=H+.05,c0=pCen(I),E2=pInset(I,-.5)||I;for(const p of I)W.cols.simple.push([p[0],yk,p[1],0,3.3,[1,.98,.94]]);g.set(2,o.seed);for(let e=0;e<I.length;e++){const a=I[e],b=I[(e+1)%I.length];wall(g,IDF,a[0],a[1],b[0],b[1],yk+3.3,yk+3.8,yk-30,4);wall(g,IDF,b[0],b[1],a[0],a[1],yk+3.3,yk+3.8,yk-30,4);}g.set(1,o.seed+.3);for(let e=0;e<E2.length;e++){const a=E2[e],b=E2[(e+1)%E2.length];g.poly([[a[0],yk+3.75,a[1]],[b[0],yk+3.75,b[1]],[c0[0],yk+5.4,c0[1]]],[0,1,0]);}}}
    else if(!cy&&ar>90&&R()<.45){const I=pInset(L,1.6);if(I&&I.length===4){g.set(3,.4);for(const p of I)box(g,frame(p[0],0,p[1],0),0,H,0,.09,2.5,.09,31);const yp=H+2.55;
      if(R()<.55){// pergola: slats on two beams, vines over part of it
        const A=I[0],B=I[1],C=I[2],D=I[3],nS=Math.max(3,Math.round(Math.hypot(D[0]-A[0],D[1]-A[1])/.7));g.set(3,.35);
        for(const[u0,u1]of[[A,B],[D,C]])g.poly([P(u0,yp),P(u1,yp),P(lp(u1,u0===A?C:B,.04),yp),P(lp(u0,u0===A?D:A,.04),yp)],[0,1,0]);
        for(let k=0;k<=nS;k++){const t=k/nS,a=lp(A,D,t),b=lp(B,C,t),a2=lp(A,D,Math.min(1,t+.05)),b2=lp(B,C,Math.min(1,t+.05));g.poly([P(a,yp+.08),P(b,yp+.08),P(b2,yp+.08),P(a2,yp+.08)],[0,1,0]);}
        g.set(23,R());for(let k=0;k<2;k++){const t0=R()*.6,t1=t0+.15+R()*.25,s0=R()*.5,s1=s0+.2+R()*.3;g.poly([P(lp(lp(A,B,s0),lp(D,C,s0),t0),yp+.16),P(lp(lp(A,B,s1),lp(D,C,s1),t0),yp+.16),P(lp(lp(A,B,s1),lp(D,C,s1),t1),yp+.16),P(lp(lp(A,B,s0),lp(D,C,s0),t1),yp+.16)],[0,1,0]);}}
      else{// awning of linen, saffron or madder-red cloth (no green canopies)
        g.set(8,(.3+R()*.7)/3.3);g.poly(I.map(p=>P(p,yp)),[0,1,0]);g.poly(I.map(p=>P(p,yp-.05)).reverse(),[0,-1,0]);}}}
    if(smk&&R()<.02){const c=pCen(L);smk.push([c[0],H+1.2,c[1]]);}}
  const a=L[0],b=L[1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=dz/l,nz=-dx/l;
  if(o.awn&&R()<o.awn&&l>5){const ay=floorY+gH-.55,t0=.12+R()*.2,p0=lp(a,b,t0),p1=lp(a,b,Math.min(.93,t0+.3+R()*.35));g.set(8,R());
    g.poly([[p0[0],ay,p0[1]],[p1[0],ay,p1[1]],[p1[0]+nx*1.6,ay-.75,p1[1]+nz*1.6],[p0[0]+nx*1.6,ay-.75,p0[1]+nz*1.6]],[nx,1,nz]);g.poly([[p1[0],ay,p1[1]],[p0[0],ay,p0[1]],[p0[0]+nx*1.6,ay-.75,p0[1]+nz*1.6],[p1[0]+nx*1.6,ay-.75,p1[1]+nz*1.6]],[-nx,-1,-nz]);}
  if(o.balc&&o.nSt>=3&&R()<o.balc&&l>5){const hs=k=>((Math.sin(o.seed*12.9898+k*78.233)*43758.5453)%1+1)%1,by=floorY+gH+sH*(1+Math.floor(hs(1)*Math.min(2,o.nSt-2))),t0=.08+hs(2)*.25,t1=Math.min(.92,t0+.35+hs(3)*.35),p0=lp(a,b,t0),p1=lp(a,b,t1),bl=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
    if(bl>2.2){const Fb=frame((p0[0]+p1[0])/2,by,(p0[1]+p1[1])/2,Math.atan2(-dz/l,dx/l)),dp=1.15,zr=-dp+.06;(W.balcLog=W.balcLog||[]).push([Math.round(Fb.ox),+by.toFixed(1),Math.round(Fb.oz),+nx.toFixed(2),+nz.toFixed(2),+bl.toFixed(1)]);   // wooden balcony (local -z = outwards): plank deck, corbels, posts with a top and a mid rail, flower pots along the rail
      g.set(3,o.seed);box(g,Fb,0,-.02,-dp/2+.04,bl/2,.12,dp/2,31);box(g,Fb,0,-.2,-dp+.02,bl/2,.18,.05,31);   // plank deck + the slab edge (a fascia board, proud of the deck)
      {const nb=Math.max(3,Math.min(4,Math.round(bl/1.9))),bx=Math.min(1.1,(bl-.9)/Math.max(1,nb-1));   // 3-4 beam ends through the wall, each with a diagonal bracket back to the wall under the deck
       for(let k=0;k<nb;k++){const x=(k-(nb-1)/2)*bx;box(g,Fb,x,-.2,-dp/2+.04,.06,.18,dp/2,31);box(g,Fb,x,-.2,-dp+.02,.075,.2,.06,31);   // beam, with its end capped at the front
        const st=[Fb.p(x-.05,-.2,-dp+.14),Fb.p(x+.05,-.2,-dp+.14),Fb.p(x+.05,-1.05,-.06),Fb.p(x-.05,-1.05,-.06)];g.poly(st,Fb.d(0,-1,-1));g.poly([Fb.p(x-.05,-.25,-dp+.14),Fb.p(x-.05,-.25,-.06),Fb.p(x-.05,-1.05,-.06)],Fb.d(-1,0,0));g.poly([Fb.p(x+.05,-.25,-dp+.14),Fb.p(x+.05,-1.05,-.06),Fb.p(x+.05,-.25,-.06)],Fb.d(1,0,0));}}
      for(let x=-bl/2+.05;x<=bl/2-.04;x+=.55)box(g,Fb,x,.1,zr,.022,.9,.022,31);box(g,Fb,0,1.0,zr,bl/2,.05,.04,31);box(g,Fb,0,.55,zr,bl/2,.025,.02,31);
      for(const sx of[-1,1]){box(g,Fb,sx*(bl/2-.04),.1,-dp/2+.04,.022,.9,.022,31);box(g,Fb,sx*(bl/2-.04),1.0,-dp/2+.04,.04,.05,dp/2,31);}
      for(let x=-bl/2+.6;x<bl/2-.3;x+=.9+hs(4)*.5){lathe(g,Fb,x,.1,zr+.28,[[.1,0],[.17,.27],[.15,.3],[0,.3]],8,4);lathe(g,Fb,x,.38,zr+.28,[[.02,0],[.2,.14],[.15,.4],[0,.5]],7,23);}}}
  return true;}
// street surface between the block edge (the street centre line) and the lot line: basalt paving in the city
// (packed earth on the edges), a raised travertine sidewalk with a grey kerb on the wider streets
function paveBlock(W,g,P0,B,Z){if(!B||P0.length!==B.length)return;const n=P0.length,c=pCen(P0),dist=Math.hypot(c[0]-17,c[1]+22),
    bas=Z.kind!=='ware'&&dist<1750,side=(Z.kind==='mid'||Z.kind==='domus')&&dist<1600,y=(p,h)=>[p[0],W.gy(p[0],p[1])+h,p[1]];
  for(let e=0;e<n;e++){const a=P0[e],b=P0[(e+1)%n],ia=B[e],ib=B[(e+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;
    const ns=Math.max(1,Math.round(L/10)),nx=(b[1]-a[1])/L,nz=-(b[0]-a[0])/L;
    for(let k=0;k<ns;k++){const o0=lp(a,b,k/ns),o1=lp(a,b,(k+1)/ns),i0=lp(ia,ib,k/ns),i1=lp(ia,ib,(k+1)/ns),
        w=Math.min(Math.hypot(o0[0]-i0[0],o0[1]-i0[1]),Math.hypot(o1[0]-i1[0],o1[1]-i1[1]))||1,sw=side?Math.min(1.1,w*.42):0,
        s0=sw?lp(i0,o0,sw/w):i0,s1=sw?lp(i1,o1,sw/w):i1;
      g.set(bas?10:31,.3);g.poly([y(o0,.14),y(o1,.14),y(s1,.14),y(s0,.14)],[0,1,0]);
      if(sw){g.set(11,.4);g.poly([y(s0,.36),y(s1,.36),y(i1,.36),y(i0,.36)],[0,1,0]);g.set(33,.3);g.poly([y(s0,-.05),y(s1,-.05),y(s1,.36),y(s0,.36)],[nx,0,nz]);}}}}
function genBlocks(W,o){const R=RNG(o.seed||11),mg=o.margin||0,dq=Math.max(.3,Q.dens),sx=o.sx,sz=o.sz,th=o.rot,c=Math.cos(th),s=Math.sin(th),E=o.ext,chunks=new Map(),cs=o.chunk||600,smk=[];let nL=0;
  const G=(x,z,k)=>{const key=k+'|'+Math.floor(x/cs)+'_'+Math.floor(z/cs);let e=chunks.get(key);if(!e){e={k,g:new GB(1<<14)};chunks.set(key,e);}return e.g;};
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const[x,z]of[[E[0],E[1]],[E[2],E[1]],[E[2],E[3]],[E[0],E[3]]]){const u=x*c-z*s,v=x*s+z*c;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
  const i0=Math.floor(u0/sx)-1,i1=Math.ceil(u1/sx)+1,j0=Math.floor(v0/sz)-1,j1=Math.ceil(v1/sz)+1,NJ=j1-j0+1,N=[];
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){let u=i*sx+(hash2(i,j*7+1)-.5)*sx*.26,v=j*sz+(hash2(i*3+5,j)-.5)*sz*.26;const wu=34*(fbm(u*.0015+3,v*.0015,3)-.5)*2,wv=34*(fbm(u*.0015,v*.0015+9,3)-.5)*2;u+=wu;v+=wv;N.push([u*c+v*s,-u*s+v*c]);}
  const nd=(i,j)=>N[(i-i0)*NJ+(j-j0)];
  for(let i=i0;i<i1;i++)for(let j=j0;j<j1;j++){let Qd=[nd(i,j),nd(i+1,j),nd(i+1,j+1),nd(i,j+1)];if(pArea(Qd)<0)Qd=[Qd[0],Qd[3],Qd[2],Qd[1]];
    const cc=pCen(Qd),Z=o.zone(cc[0],cc[1]);if(!Z)continue;if(dq<1&&R()>.6+dq*.4)continue;
    let polys=[Qd];if(R()<Z.tri)polys=R()<.5?[[Qd[0],Qd[1],Qd[2]],[Qd[0],Qd[2],Qd[3]]]:[[Qd[0],Qd[1],Qd[3]],[Qd[1],Qd[2],Qd[3]]];
    for(const P0 of polys){const B=pInset(P0,Z.street*(.8+.4*R())/2);if(!B)continue;
      if(o.pave===true){const pk=o.grp?o.grp(cc[0],cc[1]):'';if(pk!==null&&pk!==undefined)paveBlock(W,G(cc[0],cc[1],pk),P0,B,Z);}const area=pArea(B);if(area<60)continue;const built=[],lw=Z.lotW/Math.sqrt(dq);
      const ring=Z.kind==='domus'||Z.kind==='ware'||B.length===3||(area>Z.ringA&&R()<Z.ringP);let lots=[],court=null;
      if(ring){const dd=Z.kind==='domus'?8.5+R()*2:Z.kind==='ware'?14:Z.depth*(.85+.3*R()),I=pInset(B,dd);
        if(I&&pArea(I)>40){court=I;for(let e=0;e<B.length;e++){const a=B[e],b=B[(e+1)%B.length],ia=I[e],ib=I[(e+1)%B.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nl=Math.max(1,Math.round(len/(lw*(.8+.4*R()))));
          let t0=0;for(let k=1;k<=nl;k++){const t1=k===nl?1:(k+(R()-.5)*.5)/nl;lots.push([lp(a,b,t0),lp(a,b,t1),lp(ia,ib,t1),lp(ia,ib,t0)]);t0=t1;}}}
        else lots.push(B);}
      else{let A=B[0],Bq=B[1],C=B[2],D=B[3];if(Math.hypot(Bq[0]-A[0],Bq[1]-A[1])+Math.hypot(D[0]-C[0],D[1]-C[1])<Math.hypot(C[0]-Bq[0],C[1]-Bq[1])+Math.hypot(A[0]-D[0],A[1]-D[1])){const t=A;A=Bq;Bq=C;C=D;D=t;}
        const M1=lp(D,A,.5),M2=lp(Bq,C,.5),len=Math.hypot(Bq[0]-A[0],Bq[1]-A[1]),nl=Math.max(1,Math.round(len/(lw*(.8+.4*R()))));let t0=0;
        for(let k=1;k<=nl;k++){const t1=k===nl?1:(k+(R()-.5)*.5)/nl;lots.push([lp(A,Bq,t0),lp(A,Bq,t1),lp(M1,M2,t1),lp(M1,M2,t0)]);lots.push([lp(D,C,t1),lp(D,C,t0),lp(M1,M2,t0),lp(M1,M2,t1)]);t0=t1;}}
      if(o.whole&&lots.some(L=>{const ob=lotOBB(L);return W.foot.hits(ob.cx,ob.cz,ob.hw*.9,ob.hd*.9,ob.rot,mg);}))continue;
      for(let L of lots){if(pArea(L)<14)continue;let ob=lotOBB(L);if(o.lotOK&&!o.lotOK(ob.cx,ob.cz))continue;
        if(W.foot.hits(ob.cx,ob.cz,ob.hw*.9,ob.hd*.9,ob.rot,mg)){if(L.length!==4)continue;L=[L[0],L[1],lp(L[1],L[2],.55),lp(L[0],L[3],.55)];ob=lotOBB(L);if(W.foot.hits(ob.cx,ob.cz,ob.hw*.9,ob.hd*.9,ob.rot,mg))continue;}
        const key=o.grp?o.grp(ob.cx,ob.cz):'';if(key===null||key===undefined)continue;
        const p=Z.lot(R);p.burn=Z.burn&&R()<.4?1:0;if(lotBuild(W,G(ob.cx,ob.cz,key),L,p,R,key===''?smk:null)){built.push(ob);nL++;
          if(!o.noPpl&&Z.ppl&&R()<Z.ppl){const a=L[0],b=L[1],m=lp(a,b,.5),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,px=m[0]+dz/l*1.6,pz=m[1]-dx/l*1.6;W.people.push([px,W.gy(px,pz),pz]);}}}
      if(court&&built.length>1&&Z.court){const c2=pCen(court),key=o.grp?o.grp(c2[0],c2[1]):'';if(key!==null&&key!==undefined)Z.court(W,G(c2[0],c2[1],key),court,R,pArea(court));}
      for(const ob of built)W.foot.add(ob.cx,ob.cz,ob.hw,ob.hd,ob.rot);}}
  const groups={};for(const e of chunks.values()){const m=e.g.mesh(MAT.city);if(!m)continue;let G2=groups[e.k];if(!G2){G2=groups[e.k]=new THREE.Group();W.scene.add(G2);if(e.k!==''){G2.name=e.k;G2.userData.rise=0;G2.visible=false;(W.preLayers=W.preLayers||{})[e.k]=G2;}}G2.add(m);}
  if(smk.length)W.scene.add(smokeSys(smk.slice(0,280),{col:[.86,.84,.8],rise:24,size:3,rate:.06,alpha:.3,per:8,drift:[4,0,2]}));return nL;}

/* TEST tool: window.__houseFloat() after the build: for every procedural lot building (W0.lotLog) the lowest ground along its perimeter against the base of its walls, plus how many are on a slope (terraced) */
window.__houseFloat=()=>{const L=W0.lotLog||[];let fl=0,old=0,terr=0,mx=0;const sm=(Q)=>{let m=1e9;for(let e=0;e<Q.length;e++){const a=Q[e],b=Q[(e+1)%Q.length],k=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let i=0;i<k;i++){const t=i/k;m=Math.min(m,W0.gy(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t));}}return m;};
  for(const l of L){const m=sm(l.L);if(l.yB-m>.3){fl++;mx=Math.max(mx,l.yB-m);}let c=1e9;for(const p of l.L)c=Math.min(c,W0.gy(p[0],p[1]));if(c-2.5-m>.3)old++;if(l.sl>1.6)terr++;}
  return{lots:L.length,floating:fl,floatMax:+mx.toFixed(2),wouldFloatWithCornerOnlyBase:old,terraced:terr};};

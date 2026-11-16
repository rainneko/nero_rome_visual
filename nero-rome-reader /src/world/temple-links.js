/* ================= TEMPLE LINKS (author, 2026-10-27): every temple reaches an ordinary street from its front or the sides of its podium =================
   Runs after the street raster (buildStreets). From the foot of the front stair and the middle of each long side it walks out over the temple's own
   precinct (at the temple's level) and open ground, never down a slope steeper than 36 %. The temple is linked when that walk reaches a street of the
   city's network (a street patch a main road runs through) or a hill stair, within 45 m off the streets. A temple that is not linked gets a stair down
   the hill: from the edge of its precinct (where the ground falls away) down to the nearest street below from which one walks on to the network, in
   flights of at most 30 % that turn at landings (hillRoute), built like the Centum Gradus (hillStair). On the Palatine the stair lands on each garden
   terrace it crosses and runs down in front of its wall. W.templeLinks logs every temple: linked / stair / raised / none, and why. */

// a stair that follows the hill along a hillRoute R: flights between landings, turning at each landing, never one straight run.
// (briefs/rome/podium-stairs-rock.md E, 2026-11-04) E2: a landing at most every 15 steps, the flights equal (stairRun), and a parapet on the open sides of a turning landing where the
// ground falls away; E1: where the hill is steeper than 52 % the steps are cut in the rock: treads of the hill's rock (part 61), rock on both sides, no walls.
function hillStair(W,R,w,top){R.w=w;const gy=W.gy,H=stairGround(W),ix=stairLandings(W,R),gS=new GB(1<<15);let yT=top??H(R[0][0],R[0][1]);const y0=yT,st={steps:0,landings:0,rock:0,parapets:0};   // R.w: stairFlight's head landing (and hillStairHeights after this) know the width
  const slope=(x,z)=>Math.hypot(gy(x+2,z)-gy(x-2,z),gy(x,z+2)-gy(x,z-2))/4;
  // option 甲 of the buried treads (the reviewer, 2026-11-14; R.mask, the stairs PAL_PLAN.west.mask lists): where the ground comes within 0.3 m of a tread anywhere
  // across it, the terrain is not drawn over that step (groundMaskQuad: the treads' width + 0.15 m each side, which lies inside the cheek or rock bank), and its cheeks
  // or rock banks rise to 0.2 m over the hill beside them (hm: the highest ground 0.15-0.9 m past the tread's edge), a raised cheek capped like the terraces'
  // copings (trimSet). Turning landings the same, with a wall on each side the hill overtops; the open ends (the head, a foot) closed where the ground beyond
  // is higher than the walk (endCap). The treads stay solid to 2.5 m under the lower of tread and ground.
  const MK=R.mask&&W.groundMask?w/2+.15:0,hm=(F,sa,sb,o0,o1,sg=1)=>{let m=-1e9;const ds=Math.max(.1,(sb-sa)/3);for(let s=sa;s<=sb+1e-6;s+=ds)for(let o=o0;o<=o1+1e-6;o+=.25){const q=F.p(s,0,o);m=Math.max(m,sg*gy(q[0],q[2]));}return m;},
    mq=(F,sa,sb,za,zb)=>groundMaskQuad(W,[F.p(sa,0,za),F.p(sb,0,za),F.p(sb,0,zb),F.p(sa,0,zb)].map(p=>[p[0],p[2]])),
    lo=(F,sa,sb,sd)=>-hm(F,sa,sb,sd>0?w/2:-w/2-1.2,sd>0?w/2+1.2:-w/2,-1),bur=(F,sa,sb,y)=>MK>0&&hm(F,sa,sb,-MK,MK)>y-.3,side=(F,sa,sb,sd)=>sd>0?hm(F,sa,sb,w/2+.15,w/2+.9):hm(F,sa,sb,-w/2-.9,-w/2-.15);
  if(MK)st.masked=0;
  // option 甲: a masked run's open end at sE along F (dir -1: the head, the ground beyond at s < sE; +1: a foot), its walk at yL: on open ground a sill 0.9 m deep
  // across the stair and its cheeks, flush with the ground beyond (yL to yL + 0.05), and on each side where the ground 0.35 m beyond is over yL + 0.05 a return wall from 0.15 m inside where that starts out to
  // the cheek's outer face, 0.6 m deep, 0.2 m over that ground, capped (so the cut in the ground is never seen edge-on). Across the walk itself, behind a sill (open ground), a wall only where
  // the ground ahead is a bank (0.3 m over the walk): where it goes on rising gently past a head (the Magna Mater's, onto the path up to the temple) the walk goes on onto it over the sill
  // (a wall there was a 0.4 m kerb across the head). With no sill (a floor's end, where the walk turns along the floor: flight 3 onto 23) the wall closes the bank ahead as before.
  const endCap=(F,sE,dir,yL,sill,stS,pal)=>{const o=w/2+.6,c0=sE+dir*.3,t=v=>{const q=F.p(sE+dir*.35,0,v);return gy(q[0],q[2]);},q0=F.p(sE,0,0),gbE=Math.min(yL,gy(q0[0],q0[2]))-2.5;
    if(sill){let m=-1e9;for(let v=-o;v<=o+1e-6;v+=.25)m=Math.max(m,t(v));const ys=Math.max(yL,Math.min(yL+.05,m));stS(6,.4,2);box(gS,F,sE+dir*.45,gbE,0,.45,ys-gbE,o,31);   // flush with the ground beyond (at most 5 cm over the walk)
      mq(F,Math.min(sE,sE+dir*.45),Math.max(sE,sE+dir*.45),-MK,MK);}   // the mask goes on 0.45 m over the sill: the end tread's corners are inside it (the filtered mask fell under 0.5 there: ground over the foot tread's corner); the sill reaches 0.9 m, past where the filtered mask's 0.5 line can spill (about a texel's half), so no ground is cut where nothing is under it
    const walk=v=>sill&&v<w/2-.25;
    for(const sd of[1,-1]){let v0=null,h=-1e9;for(let v=0;v<=o+1e-6;v+=.25){const y=t(sd*v);if(y>yL+(walk(v)?.3:.05)){if(v0==null)v0=v;h=Math.max(h,y);}}
      if(v0==null)continue;const vi=walk(v0)||!sill?Math.max(0,v0-.15):Math.max(w/2,v0-.15),c=sd*(vi+o)/2,hz=(o-vi)/2,top=h+.2;stS(6,.55,0);box(gS,F,c0,gbE,c,.3,top-gbE,hz,31);trimSet(gS,pal,.5);box(gS,F,c0,top,c,.34,.12,hz+.04,31);st.ends=(st.ends||0)+1;}};
  const FL=[];
  for(let l=0;l<ix.length-1;l++){const f=stairFlight(W,H,R,ix,l,yT),{A,B,Ls}=f;if(f.skip==='short')continue;if(f.skip){yT=Math.min(yT,f.yB);continue;}
    FL.push(Object.assign([[A[0]+(B[0]-A[0])/Ls*f.s0,A[1]+(B[1]-A[1])/Ls*f.s0],B],{yT,yE:f.yE,l0:f.o0-f.s0,l1:Ls-f.e1-f.s0}));   // the line and its levels: yT to l0 (the steps' start), down to yE at l1
    const yB=f.yB,o0=f.o0,run=f.run,F=frame(A[0],0,A[1],Math.atan2(-(B[1]-A[1]),B[0]-A[0])),pal=hillPal(A[0],A[1]),rks=[],stS=(pt,sd,fl)=>pal===1?gS.set(60,sd,1,fl):gS.set(pt,sd);   // M6 (palatine-masterplan.md, H0): on the Palatine the treads travertine, the cheeks the wall's ashlar, the bases rusticated
    if(f.fA!=null){const s0=f.sLo-.05,c=(s0+o0)/2,yL=f.fA-.015,q=F.p(c,0,0),gb=Math.min(gy(q[0],q[2]),yL)-2.5;   // R11: from under the floor's edge out to the first riser, 1.5 cm under the paving
      stS(6,.4,2);box(gS,F,c,gb,0,(o0-s0)/2+.02,yL-gb,w/2,31);
      for(const k of[0,1]){const sd=k?-1:1,a0=f.sS[k],cc=(a0+o0)/2,hc=(o0-a0)/2;if(hc<.05)continue;   // each cheek from where its own side leaves the floor (none on the paving); its top 1 m over the floor, under the parapet's 1.1
        stS(6,.55,0);box(gS,F,cc,gb,sd*(w/2+.3),hc+.02,yL-gb+.9,.3,31);trimSet(gS,pal,.5);box(gS,F,cc,yL+.9,sd*(w/2+.3),hc+.06,.12,.36,31);}st.landings++;}
    else if(o0>0){const q=F.p(o0/2,0,0),gb=Math.min(gy(q[0],q[2]),yT)-2.5;stS(6,.4,2);box(gS,F,o0/2,gb,0,o0/2+.02,yT-gb,w/2,31);stS(6,.55,0);for(const sd of[1,-1])box(gS,F,o0/2,gb,sd*(w/2+.3),o0/2+.02,yT-gb+.9,.3,31);
      trimSet(gS,pal,.5);for(const sd of[1,-1])box(gS,F,o0/2,yT+.9,sd*(w/2+.3),o0/2+.06,.12,.36,31);st.landings++;}   // podium p3: the landing out to the terrace's edge, where the steps begin
    let mF=null,mL=null;   // option 甲: the first and last masked step of this flight
    for(const p of run.P){const s2=o0+p.s+p.len/2,yS=yT-p.i*run.rise-(p.land?0:run.rise),q=F.p(s2,0,0),gb=Math.min(gy(q[0],q[2]),yS)-2.5,sa=o0+p.s,sb=sa+p.len,mB=bur(F,sa,sb,yS);
      if(mB){mq(F,sa-.02,sb+.02,-MK,MK);st.masked++;if(mF==null)mF=p;mL=p;}
      if(p.land){stS(6,.4,2);box(gS,F,s2,gb,0,p.len/2+.02,yS-gb,w/2,31);
        for(const sd of[1,-1]){const ct=mB?Math.max(yS+.9,side(F,sa,sb,sd)+.2):yS+.9,gc=mB?Math.min(gb,lo(F,sa,sb,sd)-.5):gb;stS(6,.55,0);box(gS,F,s2,gc,sd*(w/2+.3),p.len/2+.02,ct-gc,.3,31);trimSet(gS,pal,.5);box(gS,F,s2,ct,sd*(w/2+.3),p.len/2+.06,.12,.36,31);}
        st.landings++;continue;}   // E2: a landing between two flights, its cheeks a little higher
      const ql=F.p(s2,0,w/2+1),qr=F.p(s2,0,-w/2-1),rk=Math.max(slope(q[0],q[2]),slope(ql[0],ql[2]),slope(qr[0],qr[2]))>.52;st.steps++;
      if(rk){gS.set(61,.35+.3*teH(q[0],q[2],70),pal,0);box(gS,F,s2,gb,0,p.len/2+.02,yS-gb,w/2,31);st.rock++;rks.push({s0:sa,s1:sb,y:yS,m:mB});continue;}   // E1: cut in the rock (the banks on both sides below)
      stS(6,.4,2);box(gS,F,s2,gb,0,p.len/2+.02,yS-gb,w/2,31);const ct=[1,-1].map(sd=>mB?Math.max(yS+.75,side(F,sa,sb,sd)+.2):yS+.75);
      stS(6,.55,0);[1,-1].forEach((sd,k)=>{const gc=mB?Math.min(gb,lo(F,sa,sb,sd)-.5):gb;box(gS,F,s2,gc,sd*(w/2+.3),p.len/2+.02,ct[k]-gc,.3,31);});   // pale treads between low pale cheek walls (option 甲: raised to the hill)
      [1,-1].forEach((sd,k)=>{if(ct[k]>yS+.76){trimSet(gS,pal,.5);box(gS,F,s2,ct[k],sd*(w/2+.3),p.len/2+.03,.12,.36,31);}else if(p.i%3===0){stS(2,.6,2);box(gS,F,s2,yS+.7,sd*(w/2+.3),p.len*1.5+.02,.14,.4,31);}});}   // coping
    // option 甲: a masked run that starts or ends the flight where no masked turning landing takes over: the stair's head and foot on open ground, and a
    // flight's ends on a floor (fA, fB: the ground on the floor's uphill side can stand over its paving there)
    const P0=run.P[0],P1=run.P[run.P.length-1];
    if(MK&&mF===P0&&(l===0||f.fA!=null||o0>.01))endCap(F,o0,-1,yT,f.fA==null&&o0<.01,stS,pal);
    if(MK&&mL===P1&&(l===ix.length-2||f.fB!=null))endCap(F,Ls-f.e1,1,f.yE,f.fB==null,stS,pal);
    // E1: the rock left standing on both sides of the cut steps, in banks about 2.4 m long that follow the slope of the flight, sheer on the stair side
    for(let i=0;i<rks.length;){let j=i;while(j+1<rks.length&&rks[j+1].s0-rks[j].s1<.05&&rks[j].s1-rks[i].s0<2.2)j++;const a0=rks[i],b0=rks[j];
      const mB=rks.slice(i,j+1).some(r=>r.m),mid=(a0.s0+b0.s1)/2;   // option 甲: a masked step's bank up to 0.2 m over the hill beside it, each end from its own half
      for(const sd of[1,-1])rockBank(gS,F,a0.s0-.04,b0.s1+.04,a0.y,b0.y,sd,w,pal,mB?side(F,a0.s0,mid,sd)+.2:null,mB?side(F,mid,b0.s1,sd)+.2:null,mB?lo(F,a0.s0,b0.s1,sd)-.5:null);i=j+1;}
    // R11 2: where the flight comes down on a floor (fB), each cheek ends in a newel 0.25 m over its last stretch, 1 m over the floor: under its parapet's 1.1
    if(f.fB!=null){const se=Ls-f.e1,q=F.p(se-.3,0,0),gb=Math.min(gy(q[0],q[2]),f.yE)-2.5;for(const sd of[1,-1]){stS(6,.55,0);box(gS,F,se-.3,gb,sd*(w/2+.3),.3,f.yE-gb+.88,.36,31);trimSet(gS,pal,.5);box(gS,F,se-.3,f.yE+.88,sd*(w/2+.3),.34,.12,.4,31);}}
    // the turning landing: its slab's top level with the flight's last tread and the next one's head (R11; it stood 0.3 m higher); none where the flight lands on a floor
    if(l<ix.length-2&&f.fB==null){const FL=frame(B[0],0,B[1],F.rot),hw=w/2+.9,gb=Math.min(gy(B[0],B[1]),yB)-2.5;
      // R11: a side that meets a higher terrace (its floor 0.6 m past the side, above the landing: the Magna Mater's turn at the end of 30) runs 1.2 m on
      // into its wall, with no parapet (a slot was left between the two); E: how far each side (+x, +z, -z) reaches past hw
      const E=[[1,0],[0,1],[0,-1]].map(([nx,nz])=>{const o=FL.p(nx*(hw+.6),0,nz*(hw+.6)),y=stairFloorAt(W,o[0],o[2]);return y!=null&&y>yB+.3?1.2:0;}),cx=E[0]/2,cz=(E[1]-E[2])/2,hx=hw+E[0]/2,hz=hw+(E[1]+E[2])/2;
      stS(6,.4,1);box(gS,FL,cx,gb,cz,hx,yB-gb,hz,31);stS(2,.45,2);box(gS,FL,cx,yB-.3,cz,hx+.2,.3,hz+.2,31);
      const WL=[0,0,0];   // option 甲: the sides (+x, +z, -z) walled up to the hill (no parapet there)
      // E2: the turning landing's parapet, on each side that is neither where the flights come in (-x) and go out, where the ground outside is 0.6 m or more below
      const C2=R[ix[l+2]],el=Math.hypot(C2[0]-B[0],C2[1]-B[1])||1,lx=((C2[0]-B[0])*FL.c-(C2[1]-B[1])*FL.s)/el,lz=((C2[0]-B[0])*FL.s+(C2[1]-B[1])*FL.c)/el,ex=Math.abs(lx)>Math.abs(lz)?(lx>0?0:-1):(lz>0?1:2);
      // option 甲: a buried turning landing masked (its slab, and 0.15 m past a walled side), and each side the hill overtops walled (0.6 m thick outside the slab, 0.2 m over the hill
      // 0.15-0.9 m out, capped): the whole side where no flight comes in or goes out, on those two the stretches beside the flight (to 0.45 m into its cheek)
      if(MK&&hm(FL,-hw,hw,-hw,hw)>yB-.3){const WS=[0,0,0,0];st.masked++;
        const ed=[hw+E[0],hw+E[1],hw+E[2],hw],lat=k=>k===0||k===3?[-hw-E[2]-.6,hw+E[1]+.6]:[-hw-.6,hw+E[0]+.6],NR=[[1,0],[0,1],[0,-1],[-1,0]],exK=ex<0?3:ex;
        for(let k=0;k<4;k++){if(k<3&&E[k])continue;const[nx,nz]=NR[k],e=ed[k],[u0,u1]=lat(k),P=(n,u)=>nx?FL.p(nx*n,0,u):FL.p(u,0,nz*n),cuts=k===3?[0]:[];
          if(k===exK){const dn=nx?lx*nx:lz*nz,du=nx?lz:lx;if(Math.abs(dn)>.2)cuts.push(du/dn*e);else continue;}   // where the next flight goes out (no wall across it)
          let segs=[[u0,u1]];for(const c of cuts)segs=segs.flatMap(([a,b])=>[[a,Math.min(b,c-w/2-.45)],[Math.max(a,c+w/2+.45),b]]).filter(([a,b])=>b-a>.3);
          for(const[a,b]of segs){if(b-a<.3)continue;let h=-1e9;for(let u=a;u<=b+1e-6;u+=.25)for(let n=e+.15;n<=e+.9+1e-6;n+=.25){const q=P(n,u);h=Math.max(h,gy(q[0],q[2]));}
            if(h+.2<yB+.3)continue;const top=h+.2,c=(a+b)/2,hl=(b-a)/2;if(k<3)WL[k]=1;WS[k]=1;
            stS(6,.55,0);if(nx)box(gS,FL,nx*(e+.3),gb,c,.3,top-gb,hl,31);else box(gS,FL,c,gb,nz*(e+.3),hl,top-gb,.3,31);
            trimSet(gS,pal,.5);if(nx)box(gS,FL,nx*(e+.3),top,c,.36,.12,hl+.04,31);else box(gS,FL,c,top,nz*(e+.3),hl+.04,.12,.36,31);}}
        const xo=k=>WS[k]?.15:-.1;mq(FL,-hw-xo(3),hw+E[0]+xo(0),-hw-E[2]-xo(2),hw+E[1]+xo(1));}   // the mask: 0.15 m past a walled side, 0.1 m inside the slab's edge elsewhere
      for(const[k,nx,nz]of[[0,1,0],[1,0,1],[2,0,-1]]){if(k===ex||E[k]||WL[k])continue;const o=FL.p(nx*(hw+1),0,nz*(hw+1));if(yB-gy(o[0],o[2])<.6)continue;const px=nx*(hw-.15),pz=nz*(hw-.15),ax=nx?.15:hw,az=nx?hw:.15;
        const ec=nx?(E[1]-E[2])/2:E[0]/2,eh=nx?(E[1]+E[2])/2:E[0]/2;   // a side's parapet runs on along a neighbour's extension (E) up to the wall it meets
        gS.set(60,.5,pal,0);box(gS,FL,px+(nx?0:ec),yB,pz+(nx?ec:0),ax+(nx?0:eh),.9,az+(nx?eh:0),31);trimSet(gS,pal,.5);box(gS,FL,px+(nx?0:ec),yB+.9,pz+(nx?ec:0),ax+.04+(nx?0:eh),.1,az+.06+(nx?eh:0),31);st.parapets++;}}
    yT=f.yE;}
  for(let i=1;i<R.length-1;i+=4){const A=R[i],B=R[i+1],ux=B[0]-A[0],uz=B[1]-A[1],l=Math.hypot(ux,uz)||1,sd=(i>>2)%2?1:-1,off=w/2+2.2+((i*7)%3)*.5;   // cypresses and umbrella pines along both sides: a garden stair, not a cut
    const tx=A[0]-uz/l*off*sd,tz=A[1]+ux/l*off*sd;if(!W.foot.hits(tx,tz,1,1,0,0))W.trees.push([tx,gy(tx,tz),tz,((i>>2)%3)?'cyp':'pine',.8+((i*13)%5)*.07]);}
  {const A=R[R.length-2],B=R[R.length-1],l=Math.hypot(B[0]-A[0],B[1]-A[1])||1;(W.stairFeet=W.stairFeet||[]).push({x:B[0],z:B[1],dx:(B[0]-A[0])/l,dz:(B[1]-A[1])/l});}
  const m=layTag(gS.mesh(MAT.city),'stairs');if(m)W.scene.add(m);for(let i=0;i<R.length;i+=2)W.foot.addCircle(R[i][0],R[i][1],w/2+1.5,'road');
  (W.hillStairs||(W.hillStairs=[])).push(Object.assign({R,w,top:y0,flights:FL},st));return m;}   // flights: the drawn flights' lines [A, B] (the Palatine's ring walls open only where one of them goes through)
// E1: a bank of rock beside cut steps, from sa to sb along flight frame F (local x = walking direction, z = left), on side sd of a stair w wide; its top 0.5-1 m
// above the treads ya..yb, its stair face sheer, its outer face falling away; corners jittered by a die keyed to the place
function rockBank(g,F,sa,sb,ya,yb,sd,w,pal,hA,hB,yF){const c=F.p((sa+sb)/2,0,sd*(w/2+.5)),j=k=>teH(c[0],c[2],80+k),y0=Math.min(Math.min(ya,yb)-2.5,yF??1e9),ha=Math.max(ya+.5+.5*j(0),hA??-1e9),hb=Math.max(yb+.5+.5*j(1),hB??-1e9),zi=sd*(w/2+.02),zo=sd*(w/2+.85+.3*j(2)),zt=sd*(w/2+.5+.15*j(3));
  const P=(x,y,z)=>F.p(x,y,z),B=[P(sa,y0,zi),P(sb,y0,zi),P(sb,y0,zo),P(sa,y0,zo)],T=[P(sa,ha,zi),P(sb,hb,zi),P(sb,hb+.12*j(4),zt),P(sa,ha+.12*j(5),zt)];g.set(61,.3+.4*j(6),pal,0);
  g.poly([B[0],B[1],T[1],T[0]],F.d(0,0,-sd));g.poly([B[3],B[2],T[2],T[3]],F.d(0,.6,sd));g.poly([T[0],T[1],T[2],T[3]],[0,1,0]);g.poly([B[0],B[3],T[3],T[0]],F.d(-1,0,0));g.poly([B[1],B[2],T[2],T[1]],F.d(1,0,0));}
// E2: one flight of a hill stair, Ls long and dh high: risers of about 0.19 m, a landing (0.9-1.5 m) at most every 15 steps, the flights equal; P: the steps and landings along the run
// (i: the number of steps before it), the same for hillStair and hillStairHeights
function stairRun(Ls,dh){const n=Math.max(3,Math.round(dh/.19));let m=Math.max(1,Math.ceil(n/15)),Lw=m>1?Math.max(.9,Math.min(1.5,(Ls-n*.32)/(m-1))):0;if(m>1&&(Ls-(m-1)*Lw)/n<.28){m=1;Lw=0;}
  const tr=(Ls-(m-1)*Lw)/n,P=[];let s=0,i=0;for(let f=0;f<m;f++){const k=Math.round(n*(f+1)/m)-Math.round(n*f/m);for(let j=0;j<k;j++){P.push({s,len:tr,i:i++});s+=tr;}if(f<m-1){P.push({s,len:Lw,i,land:true});s+=Lw;}}
  return{n,P,rise:dh/n};}
// one flight of a hill stair, from landing ix[l] to ix[l+1] (the same for hillStair and hillStairHeights): skip 'short' (under 3 m) or 'flat' (under 0.5 m
// down); o0: where the steps begin (podium p3); R11 (the review of 2026-11-14): fA / fB, the paving of the raised floor the flight leaves or lands on (a
// Palatine ring's or terrace's, stairFloorAt), sE: where it leaves that floor, e1: the length of the floor at its foot; the steps run from o0 to Ls-e1 and
// the last one is 1.5 cm under fB (yE: the flight's last level)
function stairFlight(W,H,R,ix,l,yT){const A=R[ix[l]],B=R[ix[l+1]],Ls=Math.hypot(B[0]-A[0],B[1]-A[1]),f={A,B,Ls,yT};if(Ls<3){f.skip='short';return f;}
  f.yB=H(B[0],B[1]);if(yT-f.yB<.5){f.skip='flat';return f;}const ux=(B[0]-A[0])/Ls,uz=(B[1]-A[1])/Ls,gy=W.gy,
    on=(s,c)=>{const x=A[0]+ux*s,z=A[1]+uz*s,y=stairFloorAt(W,x,z);return y!=null&&y>gy(x,z)+c?y:null;};   // the floor's paving there, where it is drawn (the hill's toe not over it)
  f.fA=on(0,.36);f.fB=on(Ls,.36);f.o0=0;f.e1=0;let eB=0;
  // R11: a landing point just past the floor it comes down on (the line crosses a ring's band and the next flight goes on down: Scalae Caci at ring 23)
  // comes back onto that floor, as fA does at the head; the flight ends at the floor's near edge and the next one's head landing covers the rest
  if(f.fB==null&&f.yB>gy(B[0],B[1])+.5){for(let s=.05;s<4;s+=.05){const y=on(Ls-s,.36);if(y!=null){if(Math.abs(y-f.yB)<.3){f.fB=y;eB=s;}break;}}}
  if(f.fA!=null){for(let s=0;s<Ls-3;s+=.05)if(on(s,.02)==null){f.sE=s;break;}if(f.sE==null)f.fA=null;}
  else if(H(A[0],A[1])>gy(A[0],A[1])+.5){for(let s=-.05;s>-4;s-=.05){const y=on(s,.36);if(y!=null){f.fA=y;f.sE=s+.05;break;}}}   // the landing point just off the floor (stairGround's 1.25 m raster): back onto it
  // R11: where the flight leaves the floor on a slant, one side of it is still over the floor after its line is off (its top steps sank under the paving,
  // an open edge over them): sS, where each side (its cheek's outer face, R.w/2+0.6 off the line; +: F's +z, the left) leaves the same floor; the head
  // landing reaches from the first of them (sLo) to the last (sHi), at most 6 m past the line's, and the steps begin 0.5 m on
  f.sLo=f.sHi=f.sE;f.sS=[f.sE,f.sE];
  if(f.fA!=null&&R.w){const o=R.w/2+.6,got=[null,null];
    for(const k of[0,1]){const sd=k?-1:1,ox=-uz*o*sd,oz=ux*o*sd;let last=null;
      for(let s=f.sE-8;s<Math.min(Ls-3,f.sE+6);s+=.05){const x=A[0]+ux*s+ox,z=A[1]+uz*s+oz,y=stairFloorAt(W,x,z),inF=y!=null&&y>gy(x,z)+.02&&Math.abs(y-f.fA)<.3;if(inF)last=s;else if(last!=null&&s>f.sE)break;}
      if(last!=null){got[k]=last+.05;f.sLo=Math.min(f.sLo,got[k]);f.sHi=Math.max(f.sHi,got[k]);}}
    for(const k of[0,1])f.sS[k]=got[k]??f.sLo-.05;}
  if(f.fA!=null)f.o0=Math.min(f.sHi+.5,Ls-3);else f.o0=stairEdge(W,H,A,B,Ls,yT);
  if(f.fB!=null){for(let s=eB;s<Ls-3-Math.max(0,f.o0);s+=.05){const y=on(Ls-s,.02);if(y==null||Math.abs(y-f.fB)>.3){f.e1=s;break;}}if(!f.e1&&eB>0)f.e1=Math.min(eB+1.5,Ls-3-Math.max(0,f.o0));if(!f.e1)f.fB=null;}   // (a floor at another level further up the line is not this one's; a band the line runs along to its head: the steps end 1.5 m onto it)
  f.s0=Math.min(0,f.fA!=null?f.sLo-.05:0);f.yE=f.fB!=null?f.fB-.015:f.yB;f.run=stairRun(Ls-f.o0-f.e1,yT-f.yE);return f;}
// R11: the paving of the raised floor at (x,z), a Palatine ring's (W.palTerSegs, its band between the outer and inner lines) or an H1 terrace's (W.palPlats), or null
function stairFloorAt(W,x,z){let L=W.stairFloors;if(!L){L=W.stairFloors=[];const add=(Q,y)=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of Q){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}L.push({Q,y,x0,x1,z0,z1});};
    if(typeof palW==='function')for(const sg of W.palTerSegs||[])if(!sg.gap&&sg.oA&&sg.iA)add([sg.oA,sg.oB,sg.iB,sg.iA].map(l=>palW(l[0],l[1])),sg.yk+.06);
    for(const P of W.palPlats||[])if(P.W)add(P.W,P.y+.06);}
  let y=null;for(const f of L)if(x>=f.x0&&x<=f.x1&&z>=f.z0&&z<=f.z1&&inPolyXZ(x,z,f.Q)&&(y==null||f.y>y))y=f.y;return y;}
// podium p3 (2026-11-08): where a flight leaves the floor of a Palatine garden terrace (stairGround above the terrain), the distance along it to the floor's edge,
// plus 0.5 m: the steps begin there, not at the landing point up to 2 m inside the edge (they went down under the floor and met the wall's parapet). 0 elsewhere.
function stairEdge(W,H,A,B,Ls,yT){if(H(A[0],A[1])<W.gy(A[0],A[1])+.5)return 0;const ux=(B[0]-A[0])/Ls,uz=(B[1]-A[1])/Ls;let s=0;
  while(s<Ls-3&&H(A[0]+ux*(s+.25),A[1]+uz*(s+.25))>yT-.3)s+=.25;return s>0?Math.min(s+.5,Ls-3):0;}
// what a hill stair stands on: the terrain, or the floor of a Palatine garden terrace where one lies over it (palatine.js palTerraces, 1.25 m raster)
function stairGround(W){if(W.stairGround)return W.stairGround;const gy=W.gy,T=W.foot.list.filter(f=>f.palTer!=null),PP=W.palPlats||[];if(!T.length&&!PP.length)return W.stairGround=gy;
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const f of T){x0=Math.min(x0,f.cx-f.r);z0=Math.min(z0,f.cz-f.r);x1=Math.max(x1,f.cx+f.r);z1=Math.max(z1,f.cz+f.r);}
  for(const P of PP)for(const q of P.W){x0=Math.min(x0,q[0]-2);z0=Math.min(z0,q[1]-2);x1=Math.max(x1,q[0]+2);z1=Math.max(z1,q[1]+2);}   // H1: the closed terraces (palatine-h1.js), world outlines P.W
  const cs=1.25,nx=Math.ceil((x1-x0)/cs),nz=Math.ceil((z1-z0)/cs),Y=new Float32Array(nx*nz).fill(-1e9);
  for(const f of T)for(let j=Math.max(0,Math.floor((f.cz-f.r-z0)/cs));j<=Math.min(nz-1,Math.floor((f.cz+f.r-z0)/cs));j++)for(let i=Math.max(0,Math.floor((f.cx-f.r-x0)/cs));i<=Math.min(nx-1,Math.floor((f.cx+f.r-x0)/cs));i++){
    const dx=x0+(i+.5)*cs-f.cx,dz=z0+(j+.5)*cs-f.cz;if(Math.abs(f.c*dx-f.s*dz)<=f.hw-1&&Math.abs(f.s*dx+f.c*dz)<=f.hd-1)Y[j*nx+i]=Math.max(Y[j*nx+i],f.palTer);}   // the foot rect less its 1 m margin
  for(const P of PP){let px0=1e9,pz0=1e9,px1=-1e9,pz1=-1e9;for(const q of P.W){px0=Math.min(px0,q[0]);pz0=Math.min(pz0,q[1]);px1=Math.max(px1,q[0]);pz1=Math.max(pz1,q[1]);}
    for(let j=Math.max(0,Math.floor((pz0-z0)/cs));j<=Math.min(nz-1,Math.floor((pz1-z0)/cs));j++)for(let i=Math.max(0,Math.floor((px0-x0)/cs));i<=Math.min(nx-1,Math.floor((px1-x0)/cs));i++){
      const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs;if(!inPolyXZ(x,z,P.W)||nearPoly(x,z,[...P.W,P.W[0]],1))continue;Y[j*nx+i]=Math.max(Y[j*nx+i],P.y);}}   // the outline less 1 m
  return W.stairGround=(x,z)=>{const g=gy(x,z),i=Math.floor((x-x0)/cs),j=Math.floor((z-z0)/cs);return i<0||j<0||i>=nx||j>=nz?g:Math.max(g,Y[j*nx+i]);};}
// the landings of a hill stair: the ends, the turns, and the edge of a terrace where the route steps off it (the next flight runs down in front of its wall)
function stairLandings(W,R){const H=stairGround(W),L=new Set([0,...R.corners,R.length-1]),h=R.map(p=>H(p[0],p[1]));
  for(let i=1;i<R.length-1;i++)if(h[i]-h[i+1]>1.5||h[i]-h[i-1]>1.5)L.add(i);
  // the Palatine's west rings (palTerraces, 2026-11-13): where the route comes onto a ring's floor, a landing there too, so the flight above comes down to
  // the floor and the route crosses it at its level (it went over it on a slant, metres above, to the landing at its outer edge)
  if(W.foot.list.some(f=>f.palTer!=null)){const onR=p=>H(p[0],p[1])>W.gy(p[0],p[1])+.3&&W.foot.hits(p[0],p[1],.1,.1,0,0,f=>f.palTer==null);let prev=onR(R[0]);
    for(let i=1;i<R.length-1;i++){const o=onR(R[i]);if(o&&!prev)L.add(i);prev=o;}}
  // R.fit (a Palatine hill stair, R11 3): a flight is drawn straight between two landings, so where the route bends away from that line (over 1 m) or the
  // hill rises over it (over 0.25 m), a landing there as well (the worst point first, until none is left): the flights stay on the slope, never under it
  if(R.fit)for(let it=0;it<60;it++){const a=[...L].sort((p,q)=>p-q);let add=-1,bv=1;
    for(let k=0;k<a.length-1&&add<0;k++){const i0=a[k],i1=a[k+1],A=R[i0],B=R[i1],Ls=Math.hypot(B[0]-A[0],B[1]-A[1]);if(i1-i0<2||Ls<6)continue;const ux=(B[0]-A[0])/Ls,uz=(B[1]-A[1])/Ls;
      for(let i=i0+1;i<i1;i++){const p=R[i],t=clamp(((p[0]-A[0])*ux+(p[1]-A[1])*uz)/Ls,0,1),v=Math.max(Math.abs((p[0]-A[0])*uz-(p[1]-A[1])*ux),(h[i]-lerp(h[i0],h[i1],t))/.25);if(v>bv){bv=v;add=i;}}}
    if(add<0)break;L.add(add);}
  return[...L].sort((a,b)=>a-b);}

// the network: street cells whose patch a main road runs through; and the cells along hill stairs and the Clivus Palatinus, with the height of the tread there
// reach(k): from street cell k one walks on to the network (its own patch is in it, or a walk of TL_OFF from it gets there; kept per patch)
function templeNet(W){const S=W.street,{nx,nz,grd,road}=S,net=new Uint8Array(nx*nz),stair=new Uint8Array(nx*nz),stairY=new Float32Array(nx*nz),cid=new Int32Array(nx*nz).fill(-1);let nc=0;
  stComps(grd,nx,nz,c=>{let r=false;for(const k of c){cid[k]=nc;if(road[k])r=true;}if(r)for(const k of c)net[k]=1;nc++;});const memo=new Map(),N={net,stair,stairY};
  N.reach=(k,x,z)=>{if(net[k])return true;const c=cid[k];if(c<0)return false;if(!memo.has(c))memo.set(c,!!tlWalk(W,N,x,z,TL_OFF+160,[{k:'end',x,z}],()=>false,0,false));return memo.get(c);};
  for(const h of W.hillStairs||[])if(h.net!==false)templeMark(S,N,h.R,h.w/2+1.5,hillStairHeights(W,h.R,h.top));if(W.palClivus)templeMark(S,N,W.palClivus,3,W.palClivus.map(p=>W.gy(p[0],p[1])));return N;}
// the tread height at each point of a hill stair (the flights of hillStair: straight from landing to landing)
function hillStairHeights(W,R,top){const H=stairGround(W),ix=stairLandings(W,R),Y=new Array(R.length).fill(top);let yT=top;
  for(let l=0;l<ix.length-1;l++){const f=stairFlight(W,H,R,ix,l,yT);if(f.skip==='short'){for(let i=ix[l];i<=ix[l+1];i++)Y[i]=yT;continue;}
    if(f.skip){for(let i=ix[l];i<=ix[l+1];i++)Y[i]=yT;yT=Math.min(yT,f.yB);continue;}const{Ls,o0,e1,run}=f;let d=0;
    for(let i=ix[l];i<=ix[l+1];i++){if(i>ix[l])d+=Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]);const sd=Math.min(Ls-o0-e1,Math.max(0,d-o0));let y=yT;for(const p of run.P){if(p.s>sd)break;y=yT-p.i*run.rise-(p.land?0:run.rise);}if(d>=Ls-e1-1e-6)y=f.yE;Y[i]=y;}yT=f.yE;}
  return Y;}
function templeMark(S,N,R,r,Y){const{x0,z0,cs,nx,nz}=S;
  for(let p=0;p<R.length-1;p++){const a=R[p],b=R[p+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/(cs*.5)));
    for(let s=0;s<=n;s++){const x=a[0]+(b[0]-a[0])*s/n,z=a[1]+(b[1]-a[1])*s/n,y=Y[p]+(Y[p+1]-Y[p])*s/n;
      for(let j=Math.max(0,Math.floor((z-r-z0)/cs));j<=Math.min(nz-1,Math.floor((z+r-z0)/cs));j++)for(let i=Math.max(0,Math.floor((x-r-x0)/cs));i<=Math.min(nx-1,Math.floor((x+r-x0)/cs));i++)
        if(Math.hypot(x0+(i+.5)*cs-x,z0+(j+.5)*cs-z)<=r){const k=j*nx+i;N.stair[k]=1;N.stairY[k]=y;}}}}
// where one goes in or out: the foot of the front stair and the middle of each long side; d points away from the temple
function templeFeet(t){const s=Math.sin(t.rot),c=Math.cos(t.rot),fd=t.L/2+(t.stairs?(t.run!=null?t.run:Math.max(4,Math.round(t.podH/.3))*.4):0)+1.5,sd=t.W/2+2;   // t.run: the stair's length as temple() built it
  return[{k:'front',x:t.x+s*fd,z:t.z+c*fd,dx:s,dz:c},{k:'left',x:t.x-c*sd,z:t.z+s*sd,dx:-c,dz:s},{k:'right',x:t.x+c*sd,z:t.z-s*sd,dx:c,dz:-s}];}
// the temple's own ground: the footprints that hold its centre (the temple, its precinct, the terrace or forum it stands in); on it one walks at the temple's floor
function templeOwn(W,t){const inF=(f,x,z,m)=>{const dx=x-f.cx,dz=z-f.cz;if(f.circ)return Math.hypot(dx,dz)<=f.hw+m;const u=f.c*dx-f.s*dz,v=f.s*dx+f.c*dz;return Math.abs(u)<=f.hw+m&&Math.abs(v)<=f.hd+m;},
    E=W.foot.list.filter(f=>f.tag!=='road'&&f.tag!=='open'&&f.tag!=='court'&&!f.poly&&f.r<400&&inF(f,t.x,t.z,1)),r0=Math.hypot(t.W/2,t.L/2)+3;
  return(x,z)=>Math.hypot(x-t.x,z-t.z)<r0||E.some(f=>inF(f,x,z,.8));}
const TL_OFF=45,TL_STEP=.36,TL_DOOR=2.5;   // 45 m off the streets at most; walkable up to 36 %; the step between the precinct floor and the ground outside it
// the walk out (Dijkstra on the street raster, within Rr of (x,z)): the cheapest reach of the network from any seed, or null; own ground is walked at
// height y0; stairs: a hill stair counts as arrival
const templeWalk=(W,t,N,own)=>tlWalk(W,N,t.x,t.z,Math.hypot(t.W/2,t.L/2)+TL_OFF+160,templeFeet(t),own,t.y,true);
function tlWalk(W,N,x,z,Rr,seeds,own,y0,stairs){const S=W.street,{x0,z0,cs,nx,nz,grd,solid,water}=S,gy=W.gy,
    i0=Math.max(0,Math.floor((x-Rr-x0)/cs)),i1=Math.min(nx-1,Math.floor((x+Rr-x0)/cs)),j0=Math.max(0,Math.floor((z-Rr-z0)/cs)),j1=Math.min(nz-1,Math.floor((z+Rr-z0)/cs)),w=i1-i0+1,h=j1-j0+1;
  if(w<1||h<1)return null;const D=new Float64Array(w*h).fill(1e9),Hc=new Float32Array(w*h).fill(NaN),Fl=new Int8Array(w*h).fill(-1),O=new Int8Array(w*h),Q=[];
  const cx=q=>x0+(q%w+i0+.5)*cs,cz=q=>z0+(Math.floor(q/w)+j0+.5)*cs,K=q=>(Math.floor(q/w)+j0)*nx+(q%w+i0);
  const floor=q=>{if(Fl[q]<0)Fl[q]=solid[K(q)]&&own(cx(q),cz(q))?1:0;return Fl[q];},   // a building cell of the own ground: the precinct floor, at the temple's level
    PF=W.palFloorY,Py=PF?new Float32Array(w*h).fill(NaN):null,pf=q=>{if(!Py)return null;if(Number.isNaN(Py[q])){const y=PF(cx(q),cz(q));Py[q]=y==null?-1e9:y;}return Py[q]>-1e8?Py[q]:null;},   // the Palatine's terrace floors (H1): walked at their level, their reserved ground is solid in the raster
    ht=q=>{if(floor(q))return y0;const p=pf(q);if(p!=null)return p;if(Number.isNaN(Hc[q]))Hc[q]=gy(cx(q),cz(q));return Hc[q];},pass=q=>{const k=K(q);return!water[k]&&(!solid[k]||floor(q)||pf(q)!=null);};
  const push=(q,d)=>{Q.push([d,q]);let i=Q.length-1;while(i>0){const p=(i-1)>>1;if(Q[p][0]<=Q[i][0])break;[Q[p],Q[i]]=[Q[i],Q[p]];i=p;}},
    pop=()=>{const top=Q[0],last=Q.pop();if(Q.length){Q[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<Q.length&&Q[l][0]<Q[m][0])m=l;if(r<Q.length&&Q[r][0]<Q[m][0])m=r;if(m===i)break;[Q[m],Q[i]]=[Q[i],Q[m]];i=m;}}return top;};
  seeds.forEach((f,o)=>{const i=Math.floor((f.x-x0)/cs)-i0,j=Math.floor((f.z-z0)/cs)-j0;if(i<0||j<0||i>=w||j>=h)return;const q=j*w+i;if(D[q]>0){D[q]=0;O[q]=o;push(q,0);}});
  const NB=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]],hit=(via,q,d)=>({via,from:seeds[O[q]].k,off:Math.round(d),at:[Math.round(cx(q)),Math.round(cz(q))]});
  while(Q.length){const[d,q]=pop();if(d>D[q])continue;const k=K(q);if(grd[k]&&N.net[k])return hit('street',q,d);
    const qi=q%w,qj=Math.floor(q/w),hq=ht(q);
    for(const[a,b,l]of NB){const ii=qi+a,jj=qj+b;if(ii<0||jj<0||ii>=w||jj>=h)continue;const n=jj*w+ii,kn=K(n);
      if(stairs&&N.stair[kn]&&(Math.abs(N.stairY[kn]-hq)<=1.5||own(cx(n),cz(n))))return hit('stair',q,d);   // onto a hill stair at the height of its tread, or one that starts on the own ground (Apollo's)
      if(!pass(n))continue;const st=l*cs,dy=Math.abs(ht(n)-hq);if(dy>(floor(n)!==floor(q)?TL_DOOR:TL_STEP*st))continue;
      const nd=d+(floor(n)?0:grd[kn]?.3:1)*st;if(nd>TL_OFF||nd>=D[n]-1e-6)continue;D[n]=nd;O[n]=O[q];push(n,nd);}}   // the own precinct is free to cross; streets of other patches nearly so
  return null;}
// a stair for a temple that is not linked: tried from each foot (front first), off the edge of its own ground, to the nearest streets below that reach the network
function templeStairPlan(W,t,N,own){const S=W.street,{x0,z0,cs,nx,nz,grd,solid,water}=S,gy=W.gy,wS=3.6;
  const cell=(x,z)=>{const i=Math.floor((x-x0)/cs),j=Math.floor((z-z0)/cs);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i;};
  const route=(a,b,half)=>hillRoute(W,a,b,{lim:.3,half,step:2}),join=(A,B)=>{const P=A.slice(0,-1).concat(B);P.corners=[...A.corners,A.length-1,...B.corners.map(c=>c+A.length-1)];return P;};
  let best=null,tries=0;const why={};
  for(const f of templeFeet(t))for(const a of[0,.6,-.6]){if(tries>=60)break;const dx=f.dx*Math.cos(a)-f.dz*Math.sin(a),dz=f.dx*Math.sin(a)+f.dz*Math.cos(a);
    // the edge: walk out over the own ground; where the ground beyond is at the temple's level, on to where it falls away (the stair starts there, at the
    // floor); where the precinct stands on a substructure over the slope, the stair starts at the foot of the substructure (its own stairs are inside)
    let E=null,top=t.y;for(let s=0;s<=90;s++){const x=f.x+dx*s,z=f.z+dz*s,k=cell(x,z);if(k<0||water[k])break;if(own(x,z))continue;if(solid[k])break;const g=gy(x,z);
      if(g<t.y-1.5){const px=x-dx,pz=z-dz;if(!own(px,pz)){E=[px,pz];top=t.y;}else{E=[x,z];top=g;}break;}}
    if(!E){why.noEdge=(why.noEdge||0)+1;continue;}const TR=260,T=[];
    for(let j=Math.max(0,Math.floor((E[1]-TR-z0)/cs));j<=Math.min(nz-1,Math.floor((E[1]+TR-z0)/cs));j++)for(let i=Math.max(0,Math.floor((E[0]-TR-x0)/cs));i<=Math.min(nx-1,Math.floor((E[0]+TR-x0)/cs));i++){
      const k=j*nx+i;if(!grd[k])continue;const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs,d=Math.hypot(x-E[0],z-E[1]);if(d>TR||d<8||own(x,z)||gy(x,z)>top-3||!N.reach(k,x,z))continue;T.push([d,x,z]);}
    T.sort((p,q)=>p[0]-q[0]);const pick=[];for(const p of T){if(pick.length>=6)break;if(pick.every(q=>Math.hypot(q[1]-p[1],q[2]-p[2])>18))pick.push(p);}
    if(!pick.length)why.noTarget=(why.noTarget||0)+1;
    for(const[d,x,z]of pick)for(const half of[16,10]){if(++tries>60)break;let P=templeStairCut(S,route(E,[x,z],half),cell,own,N,wS);
      if(P.fail==='building'){const[bx,bz]=P.at,ux=x-E[0],uz=z-E[1],l=Math.hypot(ux,uz)||1;   // a house or a fountain in the way: round it, with a landing beside it
        for(const o of[10,-10,18,-18]){const V=[bx-uz/l*o,bz+ux/l*o];if(Math.hypot(V[0]-E[0],V[1]-E[1])<6)continue;const P2=templeStairCut(S,join(route(E,V,half),route(V,[x,z],half)),cell,own,N,wS);if(P2.R){P=P2;break;}}}
      if(!P.R){why[P.fail]=(why[P.fail]||0)+1;if(P.at&&!why.at)why.at=P.at.map(Math.round).join('/');continue;}
      const Y=hillStairHeights(W,P.R,top),ix=[0,...P.R.corners,P.R.length-1];let steep=false;   // no flight steeper than 60 %
      for(let l=0;l<ix.length-1;l++){const A=P.R[ix[l]],B=P.R[ix[l+1]],Ls=Math.hypot(B[0]-A[0],B[1]-A[1]);if(Ls>=3&&(Y[ix[l]]-Y[ix[l+1]])/Ls>.6)steep=true;}if(steep){why.steep=(why.steep||0)+1;continue;}
      const len=P.len,score=len+(f.k==='front'?0:25);if(len>d*3+40){why.long=(why.long||0)+1;continue;}
      if(!best||score<best.score)best={R:P.R,len:Math.round(len),drop:+(top-gy(...P.R[P.R.length-1])).toFixed(1),from:f.k,top,score};}}
  return best||{why:Object.entries(why).map(([k,v])=>k+' '+v).join(', ')||'none'};}
// the route up to the first street it reaches off the own ground from which one walks on to the network, or why not: a building, water, the edge of the raster
function templeStairCut(S,R,cell,own,N,wS){let len=0;
  for(let i=1;i<R.length;i++){const[x,z]=R[i],k=cell(x,z);len+=Math.hypot(x-R[i-1][0],z-R[i-1][1]);if(k<0)return{fail:'off'};if(S.water[k])return{fail:'water'};if(own(x,z))continue;
    if(i>2&&S.grd[k]&&N.reach(k,x,z)){const P=R.slice(0,i+1);P.corners=R.corners.filter(c=>c>0&&c<i);return{R:P,len};}
    const ux=x-R[i-1][0],uz=z-R[i-1][1],l=Math.hypot(ux,uz)||1,near=i>=R.length-4;   // the last few metres may squeeze between the houses
    for(const sd of near?[0]:[0,1,-1]){const kk=cell(x-uz/l*sd*(wS/2+.6),z+ux/l*sd*(wS/2+.6));if(kk<0||S.solid[kk])return{fail:'building',at:[x,z]};}}
  return{fail:'unreached'};}
function templeLinks(W){if(!W.street||!W.temples)return;const N=templeNet(W),log=W.templeLinks=[];
  const name=t=>{if(t.name)return t.name;let b='',bd=50;for(const p of W.pois||[]){const d=Math.hypot(p.x-t.x,p.z-t.z);if(d<bd){bd=d;b=p.n;}}return b;};
  const list=W.temples.filter(t=>t.W>6).sort((a,b)=>b.W*b.L-a.W*a.L);   // the big ones first, a small neighbour may then reach their stair (face shrines, W 6, stand on their squares)
  for(const t of list){const e={n:name(t),x:Math.round(t.x),z:Math.round(t.z),y:+t.y.toFixed(1)};
    {const r=Math.hypot(t.W/2,t.L/2)+20;let hi=-1e9;for(let a=0;a<16;a++)hi=Math.max(hi,W.gy(t.x+Math.cos(a*Math.PI/8)*r,t.z+Math.sin(a*Math.PI/8)*r));   // no ground near its level all round: it stands on a building
      if(hi<t.y-6){log.push(Object.assign(e,{status:'raised',why:'on a building'}));continue;}}   // (on top of a theatre or the Circus: one comes up through the building)
    const own=templeOwn(W,t),wk=templeWalk(W,t,N,own);if(wk){log.push(Object.assign(e,{status:'linked'},wk));continue;}
    const p=templeStairPlan(W,t,N,own);if(!p.R){log.push(Object.assign(e,{status:'none',why:p.why}));continue;}
    if(hillPal(p.R[0][0],p.R[0][1])===1)p.R.fit=true;   // R11: its flights follow the route (stairLandings)
    if(typeof PAL_PLAN!=='undefined'&&PAL_PLAN.west&&(PAL_PLAN.west.mask||[]).includes('temple:'+e.n)&&!(typeof location!=='undefined'&&/[?&]nomask\b/.test(location.search)))p.R.mask=true;   // option 甲 pilot: into the ground mask (hillStair); ?nomask: as before, for A/B
    hillStair(W,p.R,3.6,p.top);W.hillStairs[W.hillStairs.length-1].temple=e.n||true;templeMark(W.street,N,p.R,3.6/2+1.5,hillStairHeights(W,p.R,p.top));
    log.push(Object.assign(e,{status:'stair',from:p.from,len:p.len,drop:p.drop,R:p.R}));}
  const c={linked:0,stair:0,raised:0,none:0};for(const e of log)c[e.status]++;W.templeLinkStats=c;console.log('temple links',JSON.stringify(c));}

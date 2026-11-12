/* ================= 帕拉蒂尼 H1：东坡和南坡的封闭台地（palatine-plan.js；briefs/rome/palatine-masterplan.md 第 4 节） =================
   palPlatShape(lx,lz,h)  the terrain held at each terrace's floor (palShape calls it before the office blocks' pads, so their pads win).
   palPlatReserve(W)      in palTerraces, before the roads and the houses: every terrace's ground reserved (terraceReserve), W.palPlats.
   palPlatStairs(W)       before templeLinks: the stairs of the plan (edge stairs along the walls, the axial east stair). They join W.hillStairs, so the
                          temple links and the checks see them; W.palStairs keeps their treads for __palReach.
   palPlatWalls(W)        after palTerraceWalls: floors, the walls of every terrace (terraceEdge: rock under masonry over 9.8 m, M3 trim, 6 x 6 m piers
                          at the turns), cut walls where the ground outside is higher than the floor, the hemicycle garden and its wall fountain.
   Every polygon is in the hill grid (palW); PFR maps it to the world (a rotation, so the polygons keep their orientation). */
const PAL_PL=PAL_PLAN.plats.map(P=>{const n=P.pts.length;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,A=0;
  for(let i=0;i<n;i++){const a=P.pts[i],b=P.pts[(i+1)%n];x0=Math.min(x0,a[0]);x1=Math.max(x1,a[0]);z0=Math.min(z0,a[1]);z1=Math.max(z1,a[1]);A+=a[0]*b[1]-b[0]*a[1];}
  const E=P.pts.map((a,i)=>{const b=P.pts[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;return{i,a,b,L,ux,uz,nx:A>0?uz:-uz,nz:A>0?-ux:ux,k:P.edge[i],foot:P.foot[i]};});   // n: outward
  return Object.assign({},P,{x0,x1,z0,z1,E,W:P.pts.map(p=>palW(p[0],p[1]))});});
const PAL_PL_BB=[Math.min(...PAL_PL.map(P=>P.x0))-8,Math.max(...PAL_PL.map(P=>P.x1))+8,Math.min(...PAL_PL.map(P=>P.z0))-8,Math.max(...PAL_PL.map(P=>P.z1))+8];
const palPlIn=(lx,lz)=>{for(const P of PAL_PL)if(lx>=P.x0&&lx<=P.x1&&lz>=P.z0&&lz<=P.z1&&inPolyXZ(lx,lz,P.pts))return P;return null;};
const palPlById=id=>PAL_PL.find(P=>P.id===id);
const palEdgePt=(id,i,s,off)=>{const e=palPlById(id).E[i];return[e.a[0]+e.ux*s+e.nx*off,e.a[1]+e.uz*s+e.nz*off];};   // s metres along edge i, off metres outside it
const palZoneD=(lx,lz,Z)=>{let d=1e9;for(let i=0;i<Z.length;i++){const a=Z[i],b=Z[(i+1)%Z.length];d=Math.min(d,segD(lx,lz,a[0],a[1],b[0],b[1]));}return d;};
const palInZoneL=(lx,lz,m=0)=>PAL_PLAN.zones.some(Z=>inPolyXZ(lx,lz,Z)||(m>0&&palZoneD(lx,lz,Z)<m));
// the buildings standing on the terraces, as rects in the hill grid [x0,x1,z0,z1] (all turned by multiples of 90 degrees): no floor under them
const palPlBuild=()=>{const R=[],add=(lx,lz,hu,hv,tn,m)=>{const q=((tn%180)+180)%180===0;R.push(q?[lx-hu-m,lx+hu+m,lz-hv-m,lz+hv+m]:[lx-hv-m,lx+hv+m,lz-hu-m,lz+hu+m]);};
  for(const A of PAL_ASSETS)if(/_belt$/.test(A.n))R.push([A.lx-23+.2,A.lx+20.5-.2,A.lz-15+.2,A.lz+15-.2]);   // the cut villa (turn 90): model y -20.5..23 runs to -lx, x -15..15 to -lz
  for(const B of palBL)add(B.lx,B.lz,B.hw,B.hd,B.tn,-.2);return R;};

/* ---- terrain ---- inside a terrace the ground is 0.3 m under its floor; within 3.2 m of a wall down to a lower level it dips inside the line to that level
   (the floor mesh covers the dip: the terrain mesh, 3 m cells, cannot step at the wall line, and nothing pokes out of the wall's face). Outside every terrace:
   where the ground is higher than a walled terrace's floor (a cut) it comes down to that floor at the wall line, under the cut wall's cap; at a grade edge with no
   terrace beyond it eases to the floor over 6 m. */
// the terrain patch's post (monuments.js TPATCH): its smoothing spreads a 13 m wall step over some 9 m, which lifts the ground of the terrace below
// through its floor near the wall above; inside a terrace the smoothed ground is held back under the floor (palPlatShape there)
function palPlatPost(x,z,h){const[lx,lz]=palL(x,z),B=PAL_PL_BB;if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3]||!(palPlIn(lx,lz)||palInSlot(lx,lz)))return h;return Math.min(h,palPlatShape(lx,lz,h));}
// the east stair's slot through the hemicycle (between its cheek walls, in neither the belt nor the foot terrace): the ground under the stair, at the foot
const palInSlot=(lx,lz)=>{const S=PAL_PLAN.hemi.slot;return lx>S[0][0]-.5&&lx<S[1][0]+.5&&lz>S[0][1]-.5&&lz<S[1][1]+.5;};
function palPlatShape(lx,lz,h){const B=PAL_PL_BB;if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3])return h;
  if(palInSlot(lx,lz))return Math.min(h,PAL_PLAN.levels.foot-.3);
  const P=palPlIn(lx,lz);
  if(P){const y=P.y-.3;let o=y;
    for(const e of P.E){if(e.k!=='w'&&e.k!=='st')continue;const d=segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1]);if(d>=3.2)continue;
      const low=e.k==='st'?PAL_PLAN.levels.foot-.3:e.foot!=null?e.foot-.3:Math.min(h,y);o=Math.min(o,lerp(low,y,sstep(.4,3.2,d)));}
    return o;}
  let o=h;
  for(const Q of PAL_PL){if(lx<Q.x0-6||lx>Q.x1+6||lz<Q.z0-6||lz>Q.z1+6)continue;
    for(const e of Q.E){if(e.k==='r'||e.k==='m')continue;const d=segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1]);
      if(e.k==='s'){if(d<6)o=lerp(Q.y+.05,o,sstep(0,6,d));}
      else if(d<3.5&&h>Q.y+.2)o=Math.min(o,lerp(Q.y-.3,h,sstep(1,3.5,d)));}}
  return o;}

/* ---- reserve (palTerraces: before the roads and the houses) ---- */
function palPlatReserve(W){W.palPlats=PAL_PL;const H=palPlBuild();
  // a terrace's floor where one can walk (not under a building on it), or null: the temple links walk the floors at their level (tlWalk), where the
  // street raster has the reserved footprint as solid
  W.palFloorY=(x,z)=>{const[lx,lz]=palL(x,z);if(lx<PAL_PL_BB[0]||lx>PAL_PL_BB[1]||lz<PAL_PL_BB[2]||lz>PAL_PL_BB[3])return null;const P=palPlIn(lx,lz);if(!P)return null;
    for(const r of H)if(lx>r[0]&&lx<r[1]&&lz>r[2]&&lz<r[3])return null;return P.y;};
  for(const P of PAL_PL)terraceReserve(W,PFR,P.pts,{skip:P.E.filter(e=>e.k!=='w').map(e=>e.i)});
  // the east stair's run below the foot wall to the street (eastB, built in palPlatStairs after the houses): its ground reserved here, so no house
  // of the roadside row stands on it (tag road: not a precinct, the districts do not see it)
  {const S=PAL_PLAN.stairs.find(s=>s.id==='eastB'),[a,b]=S.axis,foot=palPlById('footE');let x0=null;
    for(const e of foot.E){if(e.k!=='w')continue;const den=(b[0]-a[0])*e.uz-(b[1]-a[1])*e.ux;if(Math.abs(den)<1e-6)continue;const t=((e.a[0]-a[0])*e.uz-(e.a[1]-a[1])*e.ux)/den,s=((e.a[0]-a[0])*(b[1]-a[1])-(e.a[1]-a[1])*(b[0]-a[0]))/den;
      if(t>0&&t<1&&s>0&&s<e.L){x0=a[0]+(b[0]-a[0])*t;break;}}
    if(x0!=null){const A=palW(x0,a[1]),B=palW(b[0]+4,b[1]),L=Math.hypot(B[0]-A[0],B[1]-A[1]);W.foot.add((A[0]+B[0])/2,(A[1]+B[1])/2,L/2,S.w/2+1.5,Math.atan2(-(B[1]-A[1])/L,(B[0]-A[0])/L),'road');}}
  for(const v of PAL_PLAN.villas){const A=PAL_ASSETS.find(a=>a.n===v.n);if(A)A.plat=v.plat;}}
// the Clivus Palatinus (H1): down the ravine between the south terraces and the east ones, outside the foot walls (palatine-plan.js clivus)
function palClivusRoute(W){const C=PAL_PLAN.clivus,G=W.routeGround||W,R=hillRoute(G,palW(...C.top),palW(...C.bot),{lim:.15,half:C.half,step:2.5});
  const dens=(p,q)=>{const n=Math.max(1,Math.round(Math.hypot(q[0]-p[0],q[1]-p[1])/2.5)),o=[];for(let i=1;i<=n;i++)o.push([p[0]+(q[0]-p[0])*i/n,p[1]+(q[1]-p[1])*i/n]);return o;};
  const h=palW(...C.head),D=dens(h,R[0]),P=[h,...D,...R.slice(1)],o=D.length,nR=P.length-1;let last=P[nR];for(const t of C.tail){const q=palW(...t);P.push(...dens(last,q));last=q;}
  P.corners=[o,...(R.corners||[]).map(c=>c+o),nR].filter((c,i,a)=>c>0&&c<P.length-1&&a.indexOf(c)===i);return P;}   // the turns: where the head joins, the route's own, where the tail leaves

/* ---- stairs ---- */
// a head landing, out of the parapet's opening onto the first tread: from s0 to s1 along a stair's line (world points A, B), w wide, its top at y
function palLanding(W,g,A,B,w,y){const L=Math.hypot(B[0]-A[0],B[1]-A[1])||1,F=frame((A[0]+B[0])/2,0,(A[1]+B[1])/2,Math.atan2(-(B[1]-A[1]),B[0]-A[0]));let yg=1e9;
  for(const a of[-L/2,L/2])for(const b of[-w/2,w/2]){const q=F.p(a,0,b);yg=Math.min(yg,W.gy(q[0],q[2]));}
  g.set(60,.5,1,0);box(g,F,0,yg-.8,0,L/2+.01,y-.12-yg+.8,w/2,31&~32);trimSet(g,1,.45);box(g,F,0,y-.12,0,L/2+.03,.12,w/2+.03,31);return F;}
// a straight flight with a cheek wall on both sides (the axial east stair): from world A towards B, from y0 down until stop(y,x,z) or B; risers 0.2,
// treads 0.38, a 1.5 m landing between equal flights of at most 15 steps; cheek(x,z): false where a wall stands beside it instead (the slot)
function palFlight(W,g,A,B,y0,w,stop,cheek){const L=Math.hypot(B[0]-A[0],B[1]-A[1]),ux=(B[0]-A[0])/L,uz=(B[1]-A[1])/L,F0=frame(A[0],0,A[1],Math.atan2(-uz,ux)),gy=W.gy;
  const run=mk=>{let s=0,y=y0,n=0,inF=0,nL=0;const pts=[];const per=mk||15;
    while(s<L-.4&&n<400){const x=A[0]+ux*s,z=A[1]+uz*s;if(stop(y,x,z))break;
      if(inF>=per){if(mk)blk(s,1.5,y,true,pts);s+=1.5;inF=0;nL++;continue;}
      y-=.2;if(mk)blk(s,.38,y,false,pts);s+=.38;n++;inF++;}
    return{s,y,n,nL,pts};};
  const blk=(s,len,yt,land,pts)=>{const c=s+len/2;let yg=1e9;for(const a of[s,s+len])for(const b of[-w/2,w/2]){const q=F0.p(a,0,b);yg=Math.min(yg,gy(q[0],q[2]));}
    g.set(60,.5,1,0);box(g,F0,c,yg-.8,0,len/2+.01,yt-.12-yg+.8,w/2,31&~32);trimSet(g,1,.45);box(g,F0,c,yt-.12,0,len/2+.03,.12,w/2+.03,31);
    for(const sd of[1,-1]){const q=F0.p(c,0,sd*(w/2+.18));if(cheek&&!cheek(q[0],q[2]))continue;let yc=Math.min(gy(q[0],q[2]),yt)-.8;g.set(60,.5,1,0);box(g,F0,c,yc,sd*(w/2+.18),len/2+.01,yt+(land?1:.95)-yc,.18,31);
      trimSet(g,1,.5);box(g,F0,c,yt+(land?1:.95),sd*(w/2+.18),len/2+.03,.08,.22,31);}
    const q=F0.p(c,0,0);pts.push([q[0],q[2],yt]);};
  const d=run(0),per=Math.max(1,Math.ceil(d.n/Math.max(1,Math.ceil(d.n/15))));return run(per);}
function palPlatStairs(W){const g=new GB(1<<16),SP=W.palStairs=[],gy=W.gy,toW=p=>palW(p[0],p[1]),st={steps:0,landings:0};
  W.palOpen=[];   // [terrace id, edge, s0, s1]: the openings in the parapets at the stair heads
  const reg=(id,pts,w,top)=>{const R=pts.map(p=>[p[0],p[1]]);R.corners=[];SP.push({id,pts:R,Y:pts.map(p=>p[2]),w});(W.hillStairs||(W.hillStairs=[])).push({R,w,top,pal:id,steps:0});};
  for(const S of PAL_PLAN.stairs){if(!S.legs)continue;const pts=[],w=S.w;
    {const[id,i,s0]=S.legs[0],P0=toW(palEdgePt(id,i,S.land?S.land[2]:s0,-1));pts.push([P0[0],P0[1],S.top]);}   // a point 1 m inside the terrace the stair leaves, at its floor (for the reach check)
    let y=S.top,first=true;
    if(S.land&&!W.palLand?.[S.land.join()]){const[id,i,s,len]=S.land,off=S.legs[0][4];palLanding(W,g,toW(palEdgePt(id,i,s-len/2,off)),toW(palEdgePt(id,i,s+len/2,off)),w,y);st.landings++;
      (W.palLand=W.palLand||{})[S.land.join()]=1;W.palOpen.push([id,i,s-len/2-.2,s+len/2+.2]);}
    for(let li=0;li<S.legs.length;li++){let[id,i,s0,s1,off]=S.legs[li];const e=palPlById(id).E[i],dir=Math.sign(s1-s0);
      if(first&&!S.land){const a=toW(palEdgePt(id,i,s0,off)),b=toW(palEdgePt(id,i,s0+dir*1.6,off));palLanding(W,g,a,b,w,y);st.landings++;W.palOpen.push([id,i,Math.min(s0,s0+dir*1.6)-.3,Math.max(s0,s0+dir*1.6)+.3]);s0+=dir*1.6;}
      else if(!first){const a=toW(palEdgePt(id,i,s0,off)),b=toW(palEdgePt(id,i,s0+dir*1.5,off));palLanding(W,g,a,b,w,y);st.landings++;s0+=dir*1.5;}   // the turn between two legs
      first=false;const A=toW(palEdgePt(id,i,s0,off)),B=toW(palEdgePt(id,i,s1,off)),dx=(B[0]-A[0]),dz=(B[1]-A[1]),l=Math.hypot(dx,dz)||1;
      const nw=(()=>{const p=toW([0,0]),q=toW([e.nx,e.nz]);return[q[0]-p[0],q[1]-p[1]];})(),sg=Math.sign(off)||1,side=sg*((-dz/l)*nw[0]+(dx/l)*nw[1])>0?-1:1;   // the parapet on the side away from the wall
      const r=edgeStair(W,g,[A,B],y,{w,side,pal:1,floorY:S.floor??undefined});st.steps+=r.steps;st.landings+=r.landings;
      for(const p of r.pts)pts.push([p[0],p[1],NaN]);y=r.y;pts.push([r.end[0],r.end[1],y]);if(S.floor!=null&&y<=S.floor+.25)break;if(S.floor==null&&y<=gy(r.end[0],r.end[1])+.3)break;}
    // the treads' heights along the stair (edgeStair walks down at 0.2 per 0.38 m with landings; between the known ends linear is close enough for the checks)
    {const k=pts.map((p,j)=>j).filter(j=>!isNaN(pts[j][2]));for(let a=0;a<k.length-1;a++){const j0=k[a],j1=k[a+1];for(let j=j0+1;j<j1;j++)pts[j][2]=lerp(pts[j0][2],pts[j1][2],(j-j0)/(j1-j0));}}
    reg(S.id,pts,w,S.top);}
  // B: the east stair down the hemicycle's axis: through the slot from the belt (42) to the foot terrace (26), a landing, across the foot terrace and
  // through the foot wall, then down to the street; a cheek wall on both sides (in the slot the slot's own walls)
  {const S=PAL_PLAN.stairs.find(s=>s.id==='eastB'),[a,b]=S.axis,w=S.w,slot=PAL_PLAN.hemi.slot,inSlot=(x,z)=>{const[lx,lz]=palL(x,z);return lx>slot[0][0]-.5&&lx<slot[1][0]+.2&&lz>slot[0][1]-.6&&lz<slot[1][1]+.6;};
    const fy=PAL_PLAN.levels.foot,foot=palPlById('footE'),A=toW(a),B=toW(b),pts=[[...toW([a[0]-1.5,a[1]]),PAL_PLAN.levels.belt]];
    const r1=palFlight(W,g,A,B,PAL_PLAN.levels.belt,w,y=>y<=fy+.01,(x,z)=>!inSlot(x,z));pts.push(...r1.pts);st.steps+=r1.n;st.landings+=r1.nL;
    // where the axis crosses the foot wall (footE's outer walls): the opening, the flat walk on the foot terrace to it, and the flight below it
    let cr=null;for(const e of foot.E){if(e.k!=='w')continue;const den=(b[0]-a[0])*e.uz-(b[1]-a[1])*e.ux;if(Math.abs(den)<1e-6)continue;const t=((e.a[0]-a[0])*e.uz-(e.a[1]-a[1])*e.ux)/den,s=((e.a[0]-a[0])*(b[1]-a[1])-(e.a[1]-a[1])*(b[0]-a[0]))/den;
      if(t>0&&t<1&&s>0&&s<e.L){cr={e,s,t,x:a[0]+(b[0]-a[0])*t};break;}}
    if(cr){W.palOpen.push(['footE',cr.e.i,cr.s-w/2-.6,cr.s+w/2+.6]);const s1=r1.s,ax=Math.hypot(B[0]-A[0],B[1]-A[1]),ux=(B[0]-A[0])/ax,uz=(B[1]-A[1])/ax,xW=(cr.x-a[0]);   // xW: hill metres from the head to the wall line (the axis runs along +lx)
      const L0=[A[0]+ux*s1,A[1]+uz*s1],L1=[A[0]+ux*(xW+.8),A[1]+uz*(xW+.8)];palLanding(W,g,L0,L1,w+.72,fy);st.landings++;
      for(const t of[0,.5,1])pts.push([lerp(L0[0],L1[0],t),lerp(L0[1],L1[1],t),fy]);
      const r2=palFlight(W,g,L1,B,fy,w,(y,x,z)=>y<=gy(x,z)+.22||(W.streetAt&&W.streetAt(x,z)&&y<=gy(x,z)+.6));pts.push(...r2.pts);st.steps+=r2.n;st.landings+=r2.nL;st.eastBEnd=[...palL(...(r2.pts.length?r2.pts[r2.pts.length-1]:L1)).map(v=>+v.toFixed(1))];
      // where the flight meets the ground short of a street (the main road's paved edge a few metres on): a walk of low steps on the ground along the
      // axis to the first street cell, at most 12 m, so the stair ends where one can go on (R8)
      {const e=r2.pts.length?r2.pts[r2.pts.length-1]:L1,s0=(e[0]-A[0])*ux+(e[1]-A[1])*uz+(r2.pts.length?.19:0);
        if(W.streetAt&&!W.streetAt(e[0],e[1])){const F=frame(A[0],0,A[1],Math.atan2(-uz,ux)),walk=[];let s=s0,hit=false;
          while(s<s0+12){s+=.5;const x=A[0]+ux*s,z=A[1]+uz*s;walk.push([x,z,gy(x,z)]);if(W.streetAt(x,z)){hit=true;break;}}
          if(hit){for(let k=0;k<walk.length;k++){const sa=s0+k*.5;let lo=1e9,hi=-1e9;for(const t of[sa,sa+.5])for(const v of[-w/2,w/2]){const q=F.p(t,0,v),h=gy(q[0],q[2]);lo=Math.min(lo,h);hi=Math.max(hi,h);}
              const T=hi+.04;g.set(60,.5,1,0);box(g,F,sa+.25,lo-.4,0,.26,T-.08-lo+.4,w/2,31&~32);trimSet(g,1,.45);box(g,F,sa+.25,T-.08,0,.27,.08,w/2+.02,31);}
            pts.push(...walk);st.eastWalk=+(s-s0).toFixed(1);}
          else st.eastWalk='no street within 12 m';}}
      for(let i=0;i<pts.length;i+=2)W.foot.addCircle(pts[i][0],pts[i][1],w/2+1,'road');}
    reg('eastB',pts,w,PAL_PLAN.levels.belt);}
  W.palStairStats=st;const m=layTag(g.mesh(MAT.city),'stairs');if(m){m.name='palPlatStairs';W.scene.add(m);}}

/* ---- walls, floors, the hemicycle ---- */
// Sutherland-Hodgman: polygon P (any, in the hill grid) clipped by the rect [x0,x1]x[z0,z1]
function palClipRect(P,x0,x1,z0,z1){let out=P;for(const[ax,sg,v]of[[0,1,x0],[0,-1,x1],[1,1,z0],[1,-1,z1]]){const inp=out;out=[];if(!inp.length)break;
    for(let i=0;i<inp.length;i++){const a=inp[i],b=inp[(i+1)%inp.length],ia=(a[ax]-v)*sg>=0,ib=(b[ax]-v)*sg>=0;if(ia)out.push(a);if(ia!==ib){const t=(v-a[ax])/(b[ax]-a[ax]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}}
  return out;}
const palRectSub=(c,h)=>{if(h[1]<=c[0]||h[0]>=c[1]||h[3]<=c[2]||h[2]>=c[3])return[c];const o=[],mx0=Math.max(c[0],h[0]),mx1=Math.min(c[1],h[1]);
  if(h[0]>c[0])o.push([c[0],h[0],c[2],c[3]]);if(h[1]<c[1])o.push([h[1],c[1],c[2],c[3]]);if(h[2]>c[2])o.push([mx0,mx1,c[2],h[2]]);if(h[3]<c[3])o.push([mx0,mx1,h[3],c[3]]);return o;};
// the floor of terrace P: gravel (part 60 flag 4) with a band of slabs (flag 3) inside its walls; slabs over the whole summit rim and the hemicycle garden.
// 8 m cells clipped exactly to the outline, less the buildings' rects
function palPlatFloor(g,P,holes){const y=P.y+.06,paveAt=(lx,lz)=>P.id==='sumE'||(P.id==='beltE'&&lz>-42&&lz<6),cs=8,gz0=-42-cs*Math.ceil((-42-P.z0)/cs);let tri=0;
  for(let x=Math.floor(P.x0);x<P.x1;x+=cs)for(let z=gz0;z<P.z1;z+=cs){let R=[[x,x+cs,z,z+cs]];for(const h of holes)R=R.flatMap(c=>palRectSub(c,h));
    for(const c of R){const Q=palClipRect(P.pts,c[0],c[1],c[2],c[3]);if(Q.length<3)continue;let A=0,cx=0,cz=0;for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length];A+=a[0]*b[1]-b[0]*a[1];cx+=a[0];cz+=a[1];}if(Math.abs(A)<.02)continue;
      g.set(60,.4,1,paveAt(cx/Q.length,cz/Q.length)?3:4);const ix=THREE.ShapeUtils.triangulateShape(Q.map(p=>new THREE.Vector2(p[0],p[1])),[]);
      for(const[i,j,k]of ix){g.poly([PFR.p(Q[i][0],y,Q[i][1]),PFR.p(Q[j][0],y,Q[j][1]),PFR.p(Q[k][0],y,Q[k][1])],[0,1,0]);tri++;}}}
  if(P.id!=='sumE')for(const e of P.E){if(e.k!=='w'||e.L<4)continue;const lx0=e.a[0],lz0=e.a[1],Q=(s,d)=>PFR.p(lx0+e.ux*s-e.nx*d,y+.03,lz0+e.uz*s-e.nz*d);
    if(P.id==='beltE'&&e.a[1]>-43&&e.a[1]<7&&e.b[1]>-43&&e.b[1]<7)continue;if(holes.some(h=>{const mx=lx0+e.ux*e.L/2,mz=lz0+e.uz*e.L/2;return mx>h[0]-2&&mx<h[1]+2&&mz>h[2]-2&&mz<h[3]+2;}))continue;
    g.set(60,.4,1,3);g.poly([Q(1.86,.66),Q(e.L-1.86,.66),Q(e.L-1.86,1.86),Q(1.86,1.86)],[0,1,0]);tri+=2;}
  return tri;}
// a cut wall: where the ground outside a walled edge is higher than the floor, a wall facing in from under the floor up to that ground, with a cap 3.8 m
// deep over the dip the terrain makes behind it (palPlatShape) and a slab coping on its inner edge; samples every 2 m, runs where the cut is 0.5 m or more
function palCutWall(W,g,P,e){const n=Math.max(2,Math.round(e.L/2)),S=[],y=P.y;let len=0;
  for(let k=0;k<=n;k++){const s=e.L*k/n,o=[e.a[0]+e.ux*s+e.nx*4,e.a[1]+e.uz*s+e.nz*4],q=palW(...o);S.push({s,gO:W.gy(q[0],q[1])});}
  for(let k=0;k<n;k++){const A=S[k],B=S[k+1];if(A.gO<y+.5&&B.gO<y+.5)continue;const ya=Math.max(A.gO,y+.5)+.12,yb=Math.max(B.gO,y+.5)+.12,Q=(s,d,yy)=>PFR.p(e.a[0]+e.ux*s+e.nx*d,yy,e.a[1]+e.uz*s+e.nz*d),inw=PFR.d(-e.nx,0,-e.nz);
    g.set(60,.3+.4*teH(e.a[0],e.a[1],1),1,0);g.poly([Q(A.s,0,y-.6),Q(B.s,0,y-.6),Q(B.s,0,yb),Q(A.s,0,ya)],inw);
    if(Math.min(ya,yb)-y>2.6){g.set(60,.5,1,1);g.poly([Q(A.s,-.07,y-.6),Q(B.s,-.07,y-.6),Q(B.s,-.07,y+2.4),Q(A.s,-.07,y+2.4)],inw);}
    trimSet(g,1,.5);g.poly([Q(A.s,-.25,ya+.08),Q(B.s,-.25,yb+.08),Q(B.s,.7,yb+.08),Q(A.s,.7,ya+.08)],[0,1,0]);g.poly([Q(A.s,-.25,ya-.37),Q(B.s,-.25,yb-.37),Q(B.s,-.25,yb+.08),Q(A.s,-.25,ya+.08)],inw);
    g.set(60,.4,1,4);g.poly([Q(A.s,.7,ya),Q(B.s,.7,yb),Q(B.s,3.8,yb),Q(A.s,3.8,ya)],[0,1,0]);g.set(60,.5,1,0);g.poly([Q(A.s,3.8,ya),Q(B.s,3.8,yb),Q(B.s,3.8,Math.min(B.gO,yb)-1.2),Q(A.s,3.8,Math.min(A.gO,ya)-1.2)],PFR.d(e.nx,0,e.nz));
    len+=B.s-A.s;}
  return len;}
// the 6 x 6 m piers (palatine-masterplan.md 2.2) of every terrace: at each turn of 20 degrees or more between two walls (the hemicycle's 15-degree facets are
// one curve), and where a wall ends on rock or on a grade or shared edge. Not on a villa (its own wall closes there), not by a stair head or the hemicycle's
// slot, not where a hill stair passes; where two terraces' piers meet, the higher one.
function palPierPlan(W){const C=[],villas=palPlBuild().slice(0,PAL_PLAN.villas.length),ST=(W.palStairs||[]).map(s=>({R:s.pts,r:s.w/2+.6})).concat((W.hillStairs||[]).filter(h=>!h.pal&&h.R).map(h=>({R:h.R,r:h.w/2+.6})));
  for(const P of PAL_PL){const n=P.E.length;for(let v=0;v<n;v++){const e0=P.E[(v+n-1)%n],e1=P.E[v],w0=e0.k==='w',w1=e1.k==='w';if(!w0&&!w1)continue;
      if(w0&&w1){const c=e0.ux*e1.ux+e0.uz*e1.uz;if(Math.acos(clamp(c,-1,1))<20*DEG)continue;}else{const o=w0?e1.k:e0.k;if(o==='m'||o==='st')continue;}
      const[lx,lz]=P.pts[v];if(villas.some(h=>lx>h[0]-1&&lx<h[1]+1&&lz>h[2]-1&&lz<h[3]+1))continue;
      const[x,z]=palW(lx,lz);if(ST.some(h=>nearPoly(x,z,h.R,h.r+4.4)))continue;C.push({P,v,x,z,y:P.y});}}
  return C.filter(c=>!C.some(d=>d!==c&&d.y>c.y&&Math.hypot(d.x-c.x,d.z-c.z)<4));}
function palPlatWalls(W){const g=new GB(1<<17),gF=new GB(1<<16),st=W.palPlatStats={walls:0,wallLen:0,maxH:0,piers:0,openings:0,cutLen:0,floorTri:0,rockRuns:0};
  const holes=palPlBuild(),piers=palPierPlan(W),OP=W.palOpen||[];
  const HS=(W.hillStairs||[]).filter(h=>!h.pal&&h.R&&h.R.length>1).map(h=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of h.R){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return{R:h.R,r:h.w/2+1.2,x0,x1,z0,z1};});
  const nearHS=(x,z)=>HS.some(h=>x>h.x0-h.r&&x<h.x1+h.r&&z>h.z0-h.r&&z<h.z1+h.r&&nearPoly(x,z,h.R,h.r));
  for(const P of PAL_PL){st.floorTri+=palPlatFloor(gF,P,holes);
    const skip=P.E.filter(e=>e.k!=='w').map(e=>e.i),footY={};for(const e of P.E)if(e.k==='w'&&e.foot!=null)footY[e.i]=e.foot;
    const pv=piers.filter(c=>c.P===P).map(c=>c.v);st.piers+=pv.length;
    const open=(x,z,i,s)=>{for(const o of OP)if(o[0]===P.id&&o[1]===i&&s>=o[2]&&s<=o[3])return'stair';return nearHS(x,z)?'stair':false;};
    const out=terraceEdge(W,g,P.pts,P.y,{F:PFR,tag:'pal:'+P.id,pal:1,skip,footY,open,rock:true,m3:true,wing:false,piers:pv});
    for(const e of out.edges){if(e.skip)continue;st.walls++;st.wallLen+=e.L;if(e.runs&&e.runs.length<e.S.length)st.openings+=Math.max(0,e.runs.length-1);for(const q of e.S){st.maxH=Math.max(st.maxH,q.h);if(q.rk!=null)st.rockRuns++;}}
    for(const e of P.E)if(e.k==='w'){st.cutLen+=palCutWall(W,g,P,e);if(e.foot!=null){const r=(W.wallFeet||[]).find(q=>q.tag==='pal:'+P.id+':'+e.i);if(r)r.ledge=true;}}   // a wall standing on a terrace's floor: no rocks or moss at its foot (terraceFeet), shrubs and cypresses only
    st.plants=(st.plants||0)+palPlatPlant(W,g,P,holes);}
  palHemicycle(W,g);
  // the villas' garden terraces (30): their walls carry the model's lower garden where the foot terrace (26) is below, so __floatCheck must not call it floating
  for(const V of PAL_PLAN.villas){const P=palPlById(V.gardens);if(!P)continue;const xs=P.pts.map(p=>p[0]),zs=P.pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs),q=PFR.p((x0+x1)/2,0,(z0+z1)/2);
    (ROME.supports=ROME.supports||[]).push({x:q[0],z:q[2],c:Math.cos(PALF.rot),s:Math.sin(PALF.rot),hw:(x1-x0)/2,hd:(z1-z0)/2});}
  st.wallLen=+st.wallLen.toFixed(0);st.maxH=+st.maxH.toFixed(1);st.cutLen=+st.cutLen.toFixed(0);
  for(const[G,name]of[[g,'palPlatWalls'],[gF,'palPlatFloors']]){const m=G.mesh(MAT.city);if(m){m.name=name;W.scene.add(m);}}}
// planting on a terrace's floor (no lawn: palatine-masterplan.md M5): along its own walls, 3 m in, a kerbed bed with a garden plant every 10 m and a cypress
// or an umbrella pine between every other pair; on the wide floors (more than 7 m from every edge) beds on a 14 m grid. Not on the hemicycle garden (its own),
// a building, a stair or within 2 m of one. Dice keyed to the place.
function palPlatPlant(W,g,P,holes){const y=P.y+.06,ST=[...(W.palStairs||[]).map(s=>({R:s.pts,r:s.w/2+2})),...(W.hillStairs||[]).filter(h=>!h.pal&&h.R).map(h=>({R:h.R,r:h.w/2+2}))];let n=0;
  const free=(lx,lz,m)=>{if(!inPolyXZ(lx,lz,P.pts)||palPolyDl(lx,lz,P.pts)<m)return false;if(holes.some(h=>lx>h[0]-2&&lx<h[1]+2&&lz>h[2]-2&&lz<h[3]+2))return false;
      if(P.id==='beltE'&&lz>-45&&lz<9)return false;const[x,z]=palW(lx,lz);return!ST.some(h=>nearPoly(x,z,h.R,h.r));};
  const bed=(lx,lz,rot)=>{const q=PFR.p(lx,0,lz),F=frame(q[0],0,q[2],PALF.rot+rot),k=teH(q[0],q[2],71);trimSet(g,1,.5);box(g,F,0,y-.06,0,1.3,.26,1,31);g.set(23,.4);
      g.poly([F.p(-1.14,y+.205,-.84),F.p(1.14,y+.205,-.84),F.p(1.14,y+.205,.84),F.p(-1.14,y+.205,.84)],[0,1,0]);W.trees.push([q[0],y+.2,q[2],impGarden(k),.7+.5*teH(q[0],q[2],72),null,1]);n++;};
  const tree=(lx,lz)=>{const q=PFR.p(lx,0,lz),k=teH(q[0],q[2],73);W.trees.push([q[0],y,q[2],k<.62?'cyp':'pine',.8+.3*teH(q[0],q[2],74)]);n++;};
  for(const e of P.E){if(e.k!=='w'||e.L<8)continue;const at=(s,d)=>[e.a[0]+e.ux*s-e.nx*d,e.a[1]+e.uz*s-e.nz*d],rot=-Math.atan2(e.uz,e.ux);
    for(let j=0,s=5;s<e.L-4;s+=10,j++){const p=at(s,3);if(P.id!=='sumE'&&free(p[0],p[1],2.2))bed(p[0],p[1],rot);if(j%2===1){const t=at(s-5,2.4);if(free(t[0],t[1],1.8))tree(t[0],t[1]);}}}
  if(P.id!=='sumE')for(let lx=Math.ceil(P.x0/14)*14+7;lx<P.x1;lx+=14)for(let lz=Math.ceil(P.z0/14)*14+7;lz<P.z1;lz+=14)if(free(lx,lz,7))bed(lx,lz,0);
  return n;}
const palPolyDl=(lx,lz,Q)=>{let d=1e9;for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length];d=Math.min(d,segD(lx,lz,a[0],a[1],b[0],b[1]));}return d;};
// the hemicycle garden between the two villas: slab paving (the floor), the slot's cheek walls, plane trees in a ring and in two rows, box beds,
// the wall fountain under the summit stairs' landing on the axis
function palHemicycle(W,g){const H=PAL_HEMI,y=PAL_PLAN.levels.belt,fy=PAL_PLAN.levels.foot,sl=PAL_PLAN.hemi.slot,P=(lx,yy,lz)=>PFR.p(lx,yy,lz),R=RNG(4207);
  // the slot's cheeks: a wall each side from under the foot floor up to the belt, coping and parapet on the belt side
  for(const zc of[sl[0][1],sl[1][1]]){const sg=zc<H.c[1]?-1:1,x0=sl[0][0],x1=sl[1][0],F=frame(...(()=>{const q=P((x0+x1)/2,0,zc+sg*.3);return[q[0],0,q[2]];})(),PALF.rot);
    g.set(60,.45,1,0);box(g,F,0,fy-.8,0,(x1-x0)/2,y+.1-fy+.8,.3,31);g.set(60,.45,1,1);box(g,F,0,fy-.8,0,(x1-x0)/2+.02,3.2,.37,31&~16);
    trimSet(g,1,.45);box(g,F,0,y+.1-.45,sg*.05,(x1-x0)/2+.05,.45,.45,31);g.set(60,.45,1,0);box(g,F,0,y+.1,sg*.1,(x1-x0)/2,.9,.3,31);trimSet(g,1,.5);box(g,F,0,y+1,sg*.1,(x1-x0)/2+.03,.1,.34,31);}
  // plane trees: a ring 19 m round the centre (not on the axis) and two rows along the villas' sides of the garden
  const T=[];for(let a=-80;a<=80;a+=20){if(Math.abs(a)<15)continue;const t=a*DEG;T.push([H.c[0]+19*Math.cos(t),H.c[1]+19*Math.sin(t)]);}
  for(const lz of[-38.5,2.5])for(let lx=181;lx<=203;lx+=5.5)T.push([lx,lz]);
  for(const[lx,lz]of T){const q=P(lx,0,lz);W.trees.push([q[0],y,q[2],'plane',.95+R()*.15]);const F=frame(q[0],0,q[2],PALF.rot);trimSet(g,1,.5);
    for(const[cx,cz,hx,hz]of[[0,1.1,1.2,.12],[0,-1.1,1.2,.12],[1.1,0,.12,1],[-1.1,0,.12,1]])box(g,F,cx,y,cz,hx,.25,hz,31);}
  // box beds with a travertine kerb either side of the axis walk, clipped box shrubs in them
  for(const[lx,lz,hx,hz]of[[186,-27,5,2.2],[186,-9,5,2.2],[198,-27,4,2.2],[198,-9,4,2.2],[214,-30,3.2,1.8],[214,-6,3.2,1.8]]){const q=P(lx,0,lz),F=frame(q[0],0,q[2],PALF.rot);
    trimSet(g,1,.5);box(g,F,0,y,0,hx,.3,hz,31);g.set(23,.4);g.poly([F.p(-hx+.16,y+.305,-hz+.16),F.p(hx-.16,y+.305,-hz+.16),F.p(hx-.16,y+.305,hz-.16),F.p(-hx+.16,y+.305,hz-.16)],[0,1,0]);
    for(let u=-hx+1.1;u<hx-.6;u+=1.6)for(const v of[-hz+.9,hz-.9]){const p=F.p(u,0,v);W.trees.push([p[0],y+.3,p[2],'shrub',.55+R()*.1,null,1]);}}
  // the wall fountain: a niche in the face of the summit stairs' landing (sumE edge 1 at s 102), a basin in front of it, a statue spouting into it
  {const f=PAL_PLAN.fountains[0],Sn=PAL_PLAN.stairs.find(t=>t.id==='eastPn'),e=palPlById(f.wall).E[1],s=f.at[1]-e.a[1],o=Sn.legs[0][4]+Sn.w/2,
    q=palEdgePt(f.wall,1,s,o),c=PFR.p(q[0],0,q[1]),F=frame(c[0],0,c[2],PALF.rot);   // on the landing's outer face; local x = +lx (out of the face), z = +lz
    g.set(60,.5,1,1);box(g,F,.12,y,0,.12,4.6,2.6,31);g.set(61,.2,1,0);box(g,F,.2,y+.9,0,.06,2.9,1.5,2);trimSet(g,1,.5);box(g,F,.3,y+3.8,0,.32,.25,1.9,31);
    pedestalStatue(g,F,.7,0,y+.55,2.2,{gilt:false});fountain(W,g,c[0]+PFR.d(3.3,0,0)[0],c[2]+PFR.d(3.3,0,0)[2],{y:y+.05,rot:PALF.rot,hx:2.8,hz:3.6,statue:0});}}

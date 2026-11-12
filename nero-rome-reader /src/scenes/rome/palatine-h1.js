/* ================= 帕拉蒂尼 H1：东坡和南坡的封闭台地（palatine-plan.js；briefs/rome/palatine-masterplan.md 第 4 节） =================
   palPlatShape(lx,lz,h)  the terrain held at each terrace's floor (palShape calls it before the office blocks' pads, so their pads win).
   palPlatReserve(W)      in palTerraces, before the roads and the houses: every terrace's ground reserved (terraceReserve), W.palPlats.
   palPlatStairs(W)       before templeLinks: the stairs of the plan (edge stairs along the walls, the axial east stair). They join W.hillStairs, so the
                          temple links and the checks see them; W.palStairs keeps their treads for __palReach.
   palPlatWalls(W)        after palTerraceWalls: floors, the walls of every terrace (terraceEdge: rock under masonry over 9.8 m, M3 trim, 6 x 6 m piers
                          at the turns), cut walls where the ground outside is higher than the floor, the hemicycle garden and its wall fountain.
   Every polygon is in the hill grid (palW); PFR maps it to the world (a rotation, so the polygons keep their orientation).
   H2 (the north slope) uses the same functions: the stairs with an axis (the east and north-east B stairs, the stair lanes between the north houses) are
   straight flights (palAxisStair); a lane's or a slot's ground follows its flight (palLaneAt); the shop arches in the north foot wall (PAL_PLAN.shops). */
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
// a model's rect (its own x0..x1, y0..y1; y north at turn 0) in the hill grid [x0,x1,z0,z1], turned by tn (a multiple of 90 degrees), m metres out
const palModelRect=(lx,lz,tn,x0,x1,y0,y1,m=0)=>{const t=((Math.round(tn/90)%4)+4)%4,P=[[x0,y0],[x1,y1]].map(([x,y])=>t===0?[lx+x,lz-y]:t===1?[lx-y,lz-x]:t===2?[lx-x,lz+y]:[lx+y,lz+x]);
  return[Math.min(P[0][0],P[1][0])-m,Math.max(P[0][0],P[1][0])+m,Math.min(P[0][1],P[1][1])-m,Math.max(P[0][1],P[1][1])+m];};
// the buildings standing on the terraces, as rects in the hill grid [x0,x1,z0,z1] (all turned by multiples of 90 degrees): no floor under them. The cut villas
// first (palPierPlan takes them by PAL_PLAN.villas' order): model x -15..15, y -20.5..23 (house, gardens 36 and 30). The courtyard blocks c on the belt
// (H2): their platform (y -10..15.5) and their own lower terrace's paving (x -15..5, y -15.5..-10); the garden terrace's floor runs round the paving.
const palPlBuild=()=>{const R=[],add=(lx,lz,hu,hv,tn,m)=>{const q=((tn%180)+180)%180===0;R.push(q?[lx-hu-m,lx+hu+m,lz-hv-m,lz+hv+m]:[lx-hv-m,lx+hv+m,lz-hu-m,lz+hu+m]);};
  for(const A of PAL_ASSETS)if(/_belt$/.test(A.n))R.push(palModelRect(A.lx,A.lz,A.turn,-15,15,-20.5,23,-.2));
  for(const B of palBL){if(B.t==='c'&&B.y===PAL_PLAN.levels.belt){R.push(palModelRect(B.lx,B.lz,B.tn,-B.hw,B.hw,-10,B.hd,-.2),palModelRect(B.lx,B.lz,B.tn,-15,5,-B.hd,-10,-.2));continue;}
    add(B.lx,B.lz,B.hw,B.hd,B.tn,-.2);}
  return R;};

/* ---- terrain ---- inside a terrace the ground is 0.3 m under its floor; within 3.2 m of a wall down to a lower level it dips inside the line to that level
   (the floor mesh covers the dip: the terrain mesh, 3 m cells, cannot step at the wall line, and nothing pokes out of the wall's face). Outside every terrace:
   where the ground is higher than a walled terrace's floor (a cut) it comes down to that floor at the wall line, under the cut wall's cap; at a grade edge with no
   terrace beyond it eases to the floor over 6 m. */
// the terrain patch's post (monuments.js TPATCH): its smoothing spreads a 13 m wall step over some 9 m, which lifts the ground of the terrace below
// through its floor near the wall above; inside a terrace the smoothed ground is held back under the floor (palPlatShape there)
function palPlatPost(x,z,h){const[lx,lz]=palL(x,z),B=PAL_PL_BB;if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3]||!(palPlIn(lx,lz)||palInSlot(lx,lz)||palLaneAt(lx,lz,0)))return h;return Math.min(h,palPlatShape(lx,lz,h));}
// the east stair's slot through the hemicycle (between its cheek walls, in neither the belt nor the foot terrace): the ground under the stair, at the foot
const palInSlot=(lx,lz)=>{const S=PAL_PLAN.hemi.slot;return lx>S[0][0]-.5&&lx<S[1][0]+.5&&lz>S[0][1]-.5&&lz<S[1][1]+.5;};
// an axial flight's tread (palFlight: risers 0.2, treads 0.38, a 1.5 m landing between equal flights of at most 15 steps) s metres from its head, from y0 down to y1
function palFlightY(y0,y1,s,pf){const n=Math.round((y0-y1)/.2),per=pf||Math.max(1,Math.ceil(n/Math.max(1,Math.ceil(n/15)))),U=per*.38+1.5;if(s<0)return y0;
  const f=Math.floor(s/U),r=s-f*U,k=r<per*.38?f*per+Math.floor(r/.38)+1:(f+1)*per;return y0-.2*Math.min(k,n);}
// H2: the stair lanes between the north houses and the north-east stair's slot: the ground there follows the flight (its tread less 0.5 m), from the belt
// down to the foot; a cut through the foot terrace (S.cut) follows the lower flight from the foot down (flights of 15, from 0.8 m past the cut's head: palAxisStair).
// palLaneAt(lx,lz,m): the lane, slot or cut within m metres of the point, with y(lx,lz) the flight's tread at the nearest point along its axis
const PAL_LANES=PAL_PLAN.stairs.filter(S=>S.axis&&(S.lane||S.slot||S.cut)).flatMap(S=>{const[a,b]=S.axis,L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,
    y0=PAL_PLAN.levels.belt,y1=PAL_PLAN.levels.foot,t=(lx,lz)=>(lx-a[0])*ux+(lz-a[1])*uz,box=R=>({x0:Math.min(R[0][0],R[1][0]),x1:Math.max(R[0][0],R[1][0]),z0:Math.min(R[0][1],R[1][1]),z1:Math.max(R[0][1],R[1][1])}),o=[];
  if(S.lane||S.slot)o.push({id:S.id,...box(S.lane||S.slot),y:(lx,lz)=>palFlightY(y0,y1,t(lx,lz))});
  if(S.cut){const B=box(S.cut),h0=Math.min(...[[B.x0,B.z0],[B.x1,B.z0],[B.x0,B.z1],[B.x1,B.z1]].map(p=>t(p[0],p[1])))+.8;o.push({id:S.id+':cut',...B,y:(lx,lz)=>palFlightY(y1,y1-14,t(lx,lz)-h0,15)});}
  return o;});
function palLaneAt(lx,lz,m){for(const L of PAL_LANES)if(lx>L.x0-m&&lx<L.x1+m&&lz>L.z0-m&&lz<L.z1+m)return L;return null;}
// the shop arches' edges (PAL_PLAN.shops): the ground in front levelled over 6 m (blending out by 10 m) at the lowest natural ground along the span, 1.5 m out
const PAL_SHOPS=(()=>{const o=[];for(const id in PAL_PLAN.shops||{}){const P=PAL_PL.find(q=>q.id===id);for(const i in PAL_PLAN.shops[id]){const e=P.E[+i],[s0,s1]=PAL_PLAN.shops[id][i];o.push({P,e,s0,s1,y:null});}}return o;})();
const palShopY=A=>{if(A.y==null){let m=1e9;for(let s=A.s0-2;s<=A.s1+2;s+=2){const[x,z]=palW(A.e.a[0]+A.e.ux*s+A.e.nx*1.5,A.e.a[1]+A.e.uz*s+A.e.nz*1.5);m=Math.min(m,romeRaw(x,z));}A.y=Math.min(m,A.P.y-4.6);}return A.y;};
function palPlatShape(lx,lz,h){const B=PAL_PL_BB;if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3])return h;
  if(palInSlot(lx,lz))return Math.min(h,PAL_PLAN.levels.foot-.3);
  {const L=palLaneAt(lx,lz,0);if(L)return L.y(lx,lz)-.5;}   // H2: a stair lane or slot
  const P=palPlIn(lx,lz);
  if(P){const y=P.y-.3;let o=y;
    for(const e of P.E){if(e.k!=='w'&&e.k!=='st')continue;const d=segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1]);if(d>=3.2)continue;
      const low=e.k==='st'?PAL_PLAN.levels.foot-.3:e.foot!=null?e.foot-.3:Math.min(h,y);o=Math.min(o,lerp(low,y,sstep(.4,3.2,d)));}
    {const L=palLaneAt(lx,lz,3.2);if(L)o=Math.min(o,L.y(lx,lz)-.5);}   // by a lane the ground dips to the flight's under the floor, the wall or the model (the 3 m mesh cannot step at its side)
    return o;}
  let o=h;
  for(const A of PAL_SHOPS){const e=A.e,t=(lx-e.a[0])*e.ux+(lz-e.a[1])*e.uz,d=(lx-e.a[0])*e.nx+(lz-e.a[1])*e.nz;if(t<A.s0-3||t>A.s1+3||d<0||d>10)continue;   // the shops' apron
    const w=Math.min(1-sstep(6,10,d),1-sstep(0,3,Math.max(A.s0-t,t-A.s1)));if(w>0)o=lerp(o,palShopY(A),w);}
  for(const Q of PAL_PL){if(lx<Q.x0-6||lx>Q.x1+6||lz<Q.z0-6||lz>Q.z1+6)continue;
    for(const e of Q.E){if(e.k==='r'||e.k==='m'||e.k==='o')continue;const d=segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1]);
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
  // the axial stairs' runs below the foot wall to the street (eastB, neB: built in palPlatStairs after the houses): their ground reserved here, so no house
  // of the roadside row stands on them (tag road: not a precinct, the districts do not see it)
  for(const S of PAL_PLAN.stairs){if(!S.axis||S.to!=='street')continue;const cr=palAxisCross(S);
    if(cr){const[a,b]=S.axis,L0=Math.hypot(b[0]-a[0],b[1]-a[1]),A=palW(a[0]+(b[0]-a[0])*cr.t,a[1]+(b[1]-a[1])*cr.t),B=palW(b[0]+(b[0]-a[0])/L0*4,b[1]+(b[1]-a[1])/L0*4),L=Math.hypot(B[0]-A[0],B[1]-A[1]);
      W.foot.add((A[0]+B[0])/2,(A[1]+B[1])/2,L/2,S.w/2+1.5,Math.atan2(-(B[1]-A[1])/L,(B[0]-A[0])/L),'road');}}
  // the shops' aprons (H2): paved, no house or street on them
  for(const A of PAL_SHOPS){const e=A.e,m=[e.a[0]+e.ux*(A.s0+A.s1)/2+e.nx*3,e.a[1]+e.uz*(A.s0+A.s1)/2+e.nz*3],q=palW(m[0],m[1]),d=PFR.d(e.ux,0,e.uz);W.foot.add(q[0],q[1],(A.s1-A.s0)/2+1,3,Math.atan2(-d[2],d[0]),'road');}
  for(const v of PAL_PLAN.villas){const A=PAL_ASSETS.find(a=>a.n===v.n&&Math.abs(a.lx-v.lx)<.01&&Math.abs(a.lz-v.lz)<.01);if(A)A.plat=v.plat;}}
// where an axial stair's line crosses the 'w' (or open 'o': a cut's head) edges of the terrace it goes on through (via): {e, s along the edge, t along the axis (0..1)}
function palAxisCross(S){const[a,b]=S.axis,P=palPlById(S.via);if(!P)return null;
  for(const e of P.E){if(e.k!=='w'&&e.k!=='o')continue;const den=(b[0]-a[0])*e.uz-(b[1]-a[1])*e.ux;if(Math.abs(den)<1e-6)continue;const t=((e.a[0]-a[0])*e.uz-(e.a[1]-a[1])*e.ux)/den,s=((e.a[0]-a[0])*(b[1]-a[1])-(e.a[1]-a[1])*(b[0]-a[0]))/den;
    if(t>0&&t<1&&s>0&&s<e.L)return{e,s,t};}
  return null;}
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
function palFlight(W,g,A,B,y0,w,stop,cheek,pf){const L=Math.hypot(B[0]-A[0],B[1]-A[1]),ux=(B[0]-A[0])/L,uz=(B[1]-A[1])/L,F0=frame(A[0],0,A[1],Math.atan2(-uz,ux)),gy=W.gy;
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
  if(pf)return run(pf);const d=run(0),per=Math.max(1,Math.ceil(d.n/Math.max(1,Math.ceil(d.n/15))));return run(per);}   // pf: flights of pf steps (a cut's ground follows them)
function palPlatStairs(W){const g=new GB(1<<16),SP=W.palStairs=[],gy=W.gy,toW=p=>palW(p[0],p[1]),st={steps:0,landings:0};
  W.palOpen=[];   // [terrace id, edge, s0, s1]: the openings in the parapets at the stair heads
  const reg=(id,pts,w,top,lane)=>{const R=pts.map(p=>[p[0],p[1]]);R.corners=[];SP.push({id,pts:R,Y:pts.map(p=>p[2]),w,lane:!!lane});(W.hillStairs||(W.hillStairs=[])).push({R,w,top,pal:id,steps:0});};
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
  // the axial stairs (B: the east stair, the north-east stair; C: the stair lanes between the north houses): palAxisStair
  for(const S of PAL_PLAN.stairs)if(S.axis)palAxisStair(W,g,S,st,reg);
  palR8Walk(W,g,st);
  W.palStairStats=st;const m=layTag(g.mesh(MAT.city),'stairs');if(m){m.name='palPlatStairs';W.scene.add(m);}}

// a walk of low steps on the ground (0.5 m each, its top 4 cm over the highest ground under it) from s0 along the line A + u s, w wide, to the first street cell
// within max metres: {len, pts}, or null (nothing built) where no street comes
function palStepWalk(W,g,A,ux,uz,s0,w,max){const gy=W.gy,F=frame(A[0],0,A[1],Math.atan2(-uz,ux)),walk=[];let s=s0,hit=false;
  while(s<s0+max){s+=.5;const x=A[0]+ux*s,z=A[1]+uz*s;walk.push([x,z,gy(x,z)]);if(W.streetAt(x,z)){hit=true;break;}}
  if(!hit)return null;
  for(let k=0;k<walk.length;k++){const sa=s0+k*.5;let lo=1e9,hi=-1e9;for(const t of[sa,sa+.5])for(const v of[-w/2,w/2]){const q=F.p(t,0,v),h=gy(q[0],q[2]);lo=Math.min(lo,h);hi=Math.max(hi,h);}
    const T=hi+.04;g.set(60,.5,1,0);box(g,F,sa+.25,lo-.4,0,.26,T-.08-lo+.4,w/2,31&~32);trimSet(g,1,.45);box(g,F,sa+.25,T-.08,0,.27,.08,w/2+.02,31);}
  return{len:+(s-s0).toFixed(1),pts:walk};}
// R8 (the review of 2026-11-12): the Domus Tiberiana's north-west stair (its model, tiberiana-v2) comes down to the rock's hem at PAL_PLAN.r8.foot, its lowest tread
// at r8.y, facing north; from there a walk of low steps as wide as the stair, north to the Vicus Tuscus' paving
function palR8Walk(W,g,st){const R=PAL_PLAN.r8;if(!R||!W.streetAt)return;const A=palW(R.foot[0],R.foot[1]),B=palW(R.foot[0],R.foot[1]-1),ux=B[0]-A[0],uz=B[1]-A[1];
  const r=palStepWalk(W,g,A,ux,uz,0,R.w,12);(st.walks||(st.walks={})).r8=r?r.len:'no street within 12 m';
  if(r){for(let i=0;i<r.pts.length;i+=2)W.foot.addCircle(r.pts[i][0],r.pts[i][1],R.w/2+.6,'road');st.r8=r.pts.length?{from:R.y,to:+r.pts[r.pts.length-1][2].toFixed(2)}:null;}}
// an axial stair (H1's east stair, generalised for H2): a straight flight along S.axis from the belt (42) down to the foot (26), with a cheek wall on both
// sides except in its slot (S.slot, or the hemicycle's: the slot's walls stand there) and in a lane between houses its own cheeks; for a stair to the street,
// a landing across the foot terrace to its outer wall (an opening), the flight below it to the street, and a walk of low steps to the first street cell
function palAxisStair(W,g,S,st,reg){const[a,b]=S.axis,w=S.w,gy=W.gy,toW=p=>palW(p[0],p[1]),fy=PAL_PLAN.levels.foot,by=PAL_PLAN.levels.belt;
  const La=Math.hypot(b[0]-a[0],b[1]-a[1]),hu=(b[0]-a[0])/La,hz=(b[1]-a[1])/La,A=toW(a),B=toW(b),R=S.slot||(S.id==='eastB'?PAL_PLAN.hemi.slot:null);
  // the slot in the axis' own terms (t along it from the head, c across): no cheeks there
  let inSlot=()=>false;if(R){let t0=1e9,t1=-1e9,c0=1e9,c1=-1e9;for(const x of[R[0][0],R[1][0]])for(const z of[R[0][1],R[1][1]]){const t=(x-a[0])*hu+(z-a[1])*hz,c=-(x-a[0])*hz+(z-a[1])*hu;t0=Math.min(t0,t);t1=Math.max(t1,t);c0=Math.min(c0,c);c1=Math.max(c1,c);}
    inSlot=(x,z)=>{const[lx,lz]=palL(x,z),t=(lx-a[0])*hu+(lz-a[1])*hz,c=-(lx-a[0])*hz+(lz-a[1])*hu;return t>t0-.5&&t<t1+.2&&c>c0-.6&&c<c1+.6;};}
  // the cut through the foot terrace (S.cut): its walls are the foot terrace's, so no cheek within 1 m of them (past their ends the flight has its own)
  const VE=S.cut?palPlById(S.via).E.filter(e=>e.k==='w'):[],byWall=(x,z)=>{const[lx,lz]=palL(x,z);return VE.some(e=>segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1])<1);};
  const pts=[[...toW([a[0]-hu*1.5,a[1]-hz*1.5]),by]];
  const r1=palFlight(W,g,A,B,by,w,y=>y<=fy+.01,(x,z)=>!inSlot(x,z));pts.push(...r1.pts);st.steps+=r1.n;st.landings+=r1.nL;
  const ax=Math.hypot(B[0]-A[0],B[1]-A[1]),ux=(B[0]-A[0])/ax,uz=(B[1]-A[1])/ax;
  if(S.to!=='street'){const e=r1.pts.length?r1.pts[r1.pts.length-1]:A;for(const d of[.6,1.6])pts.push([e[0]+ux*d,e[1]+uz*d,fy]);   // on to the foot terrace's floor
    (st.ends||(st.ends={}))[S.id]=[...palL(e[0],e[1]).map(v=>+v.toFixed(1))];reg(S.id,pts,w,by,!!S.lane);return;}
  // where the axis crosses the foot wall (the via terrace's outer walls): the opening, the flat walk on the foot terrace to it, and the flight below it
  const cr=palAxisCross(S);
  if(cr){W.palOpen.push([S.via,cr.e.i,cr.s-w/2-.6,cr.s+w/2+.6]);const s1=r1.s,xW=cr.t*La;   // xW: hill metres from the head to the wall line
    const L0=[A[0]+ux*s1,A[1]+uz*s1],L1=[A[0]+ux*(xW+.8),A[1]+uz*(xW+.8)];palLanding(W,g,L0,L1,w+.72,fy);st.landings++;
    for(const t of[0,.5,1])pts.push([lerp(L0[0],L1[0],t),lerp(L0[1],L1[1],t),fy]);
    const r2=palFlight(W,g,L1,B,fy,w,(y,x,z)=>y<=gy(x,z)+.22||(W.streetAt&&W.streetAt(x,z)&&y<=gy(x,z)+.6),S.cut?(x,z)=>!byWall(x,z):undefined,S.cut?15:0);pts.push(...r2.pts);st.steps+=r2.n;st.landings+=r2.nL;
    const end=[...palL(...(r2.pts.length?r2.pts[r2.pts.length-1]:L1)).map(v=>+v.toFixed(1))];(st.ends||(st.ends={}))[S.id]=end;if(S.id==='eastB')st.eastBEnd=end;
    // where the flight meets the ground short of a street (the main road's paved edge a few metres on): a walk of low steps on the ground along the
    // axis to the first street cell, at most 12 m, so the stair ends where one can go on (R8)
    {const e=r2.pts.length?r2.pts[r2.pts.length-1]:L1,s0=(e[0]-A[0])*ux+(e[1]-A[1])*uz+(r2.pts.length?.19:0);let walkLen=null;
      if(W.streetAt&&!W.streetAt(e[0],e[1])){const r=palStepWalk(W,g,A,ux,uz,s0,w,12);if(r){pts.push(...r.pts);walkLen=r.len;}else walkLen='no street within 12 m';}
      (st.walks||(st.walks={}))[S.id]=walkLen;if(S.id==='eastB')st.eastWalk=walkLen;}
    for(let i=0;i<pts.length;i+=2)W.foot.addCircle(pts[i][0],pts[i][1],w/2+1,'road');}
  reg(S.id,pts,w,by);}
/* ---- walls, floors, the hemicycle ---- */
// Sutherland-Hodgman: polygon P (any, in the hill grid) clipped by the rect [x0,x1]x[z0,z1]
function palClipRect(P,x0,x1,z0,z1){let out=P;for(const[ax,sg,v]of[[0,1,x0],[0,-1,x1],[1,1,z0],[1,-1,z1]]){const inp=out;out=[];if(!inp.length)break;
    for(let i=0;i<inp.length;i++){const a=inp[i],b=inp[(i+1)%inp.length],ia=(a[ax]-v)*sg>=0,ib=(b[ax]-v)*sg>=0;if(ia)out.push(a);if(ia!==ib){const t=(v-a[ax])/(b[ax]-a[ax]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}}
  return out;}
const palRectSub=(c,h)=>{if(h[1]<=c[0]||h[0]>=c[1]||h[3]<=c[2]||h[2]>=c[3])return[c];const o=[],mx0=Math.max(c[0],h[0]),mx1=Math.min(c[1],h[1]);
  if(h[0]>c[0])o.push([c[0],h[0],c[2],c[3]]);if(h[1]<c[1])o.push([h[1],c[1],c[2],c[3]]);if(h[2]>c[2])o.push([mx0,mx1,c[2],h[2]]);if(h[3]<c[3])o.push([mx0,mx1,h[3],c[3]]);return o;};
// the floor of terrace P: gravel (part 60 flag 4) with a band of slabs (flag 3) inside its walls, 1.2 m wide, on the belts a 4 m walk (the review of
// 2026-11-12); slabs over the whole summit rim and the hemicycle garden. The bands are mitred at the corners (they stay inside the outline).
// 8 m cells clipped exactly to the outline, less the buildings' rects
function palPlatFloor(g,P,holes){const y=P.y+.06,paveAt=(lx,lz)=>/^sum/.test(P.id)||(P.id==='beltE'&&lz>-42&&lz<6)||(P.id==='beltN'&&palInLaneN(lx,lz)),cs=8,gz0=-42-cs*Math.ceil((-42-P.z0)/cs);let tri=0;
  for(let x=Math.floor(P.x0);x<P.x1;x+=cs)for(let z=gz0;z<P.z1;z+=cs){let R=[[x,x+cs,z,z+cs]];for(const h of holes)R=R.flatMap(c=>palRectSub(c,h));
    for(const c of R){const Q=palClipRect(P.pts,c[0],c[1],c[2],c[3]);if(Q.length<3)continue;let A=0,cx=0,cz=0;for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length];A+=a[0]*b[1]-b[0]*a[1];cx+=a[0];cz+=a[1];}if(Math.abs(A)<.02)continue;
      g.set(60,.4,1,paveAt(cx/Q.length,cz/Q.length)?3:4);const ix=THREE.ShapeUtils.triangulateShape(Q.map(p=>new THREE.Vector2(p[0],p[1])),[]);
      for(const[i,j,k]of ix){g.poly([PFR.p(Q[i][0],y,Q[i][1]),PFR.p(Q[j][0],y,Q[j][1]),PFR.p(Q[k][0],y,Q[k][1])],[0,1,0]);tri++;}}}
  if(!/^sum/.test(P.id)){const D=/^belt/.test(P.id)?4.66:1.86,n=P.E.length,
      mit=(v,d)=>{const e0=P.E[(v+n-1)%n],e1=P.E[v],c=1+e0.nx*e1.nx+e0.nz*e1.nz,p=P.pts[v];if(c<.3)return[p[0]-e1.nx*d,p[1]-e1.nz*d];return[p[0]-(e0.nx+e1.nx)*d/c,p[1]-(e0.nz+e1.nz)*d/c];};   // the corner of the band d inside both edges at vertex v
    for(const e of P.E){if(e.k!=='w'||e.L<4)continue;const lx0=e.a[0],lz0=e.a[1];
      if(P.id==='beltE'&&e.a[1]>-43&&e.a[1]<7&&e.b[1]>-43&&e.b[1]<7)continue;if(holes.some(h=>{const mx=lx0+e.ux*e.L/2,mz=lz0+e.uz*e.L/2;return mx>h[0]-2&&mx<h[1]+2&&mz>h[2]-2&&mz<h[3]+2;}))continue;
      const a0=mit(e.i,.66),a1=mit(e.i,D),v1=(e.i+1)%n,b0=mit(v1,.66),b1=mit(v1,D),pr=q=>(q[0]-lx0)*e.ux+(q[1]-lz0)*e.uz;if(pr(a1)>pr(b1)-.5||pr(a0)>pr(b0)-.5)continue;
      g.set(60,.4,1,3);g.poly([a0,b0,b1,a1].map(q=>PFR.p(q[0],y+.03,q[1])),[0,1,0]);tri+=2;}}
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
      if(w0&&w1){const c=e0.ux*e1.ux+e0.uz*e1.uz;if(Math.acos(clamp(c,-1,1))<20*DEG)continue;}else{const o=w0?e1.k:e0.k;if(o==='m'||o==='st'||o==='o')continue;}
      const[lx,lz]=P.pts[v];if(villas.some(h=>lx>h[0]-1&&lx<h[1]+1&&lz>h[2]-1&&lz<h[3]+1))continue;
      const[x,z]=palW(lx,lz);if(ST.some(h=>nearPoly(x,z,h.R,h.r+4.4)))continue;C.push({P,v,x,z,y:P.y});}}
  return C.filter(c=>!C.some(d=>d!==c&&d.y>c.y&&Math.hypot(d.x-c.x,d.z-c.z)<4));}
function palPlatWalls(W){const g=new GB(1<<17),gF=new GB(1<<16),st=W.palPlatStats={walls:0,wallLen:0,maxH:0,piers:0,openings:0,cutLen:0,floorTri:0,rockRuns:0};
  const holes=palPlBuild(),piers=palPierPlan(W),OP=W.palOpen||[];
  const HS=(W.hillStairs||[]).filter(h=>!h.pal&&h.R&&h.R.length>1).map(h=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of h.R){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return{R:h.R,r:h.w/2+1.2,x0,x1,z0,z1};});
  const nearHS=(x,z)=>HS.some(h=>x>h.x0-h.r&&x<h.x1+h.r&&z>h.z0-h.r&&z<h.z1+h.r&&nearPoly(x,z,h.R,h.r));
  // buttresses (the review of 2026-11-12): none on a wall under 4 m, one every 9 m on the higher ones (a curve is one wall), none by a stair along the wall or
  // the wall fountain; on the summit wall out from the fountain's axis both ways
  const SB=[...(W.palStairs||[]).map(t=>({R:t.pts,r:t.w/2+(t.lane?1.8:.9)})),...HS],F0=PAL_PLAN.fountains[0],fq=palW(F0.at[0],F0.at[1]);   // a lane's walls (2.25 m off its axis): none
  const avoid=(x,z)=>Math.hypot(x-fq[0],z-fq[1])<4.6||SB.some(h=>nearPoly(x,z,h.R,h.r));
  for(const P of PAL_PL){st.floorTri+=palPlatFloor(gF,P,holes);
    const skip=P.E.filter(e=>e.k!=='w').map(e=>e.i),footY={};for(const e of P.E)if(e.k==='w'&&e.foot!=null)footY[e.i]=e.foot;
    const pv=piers.filter(c=>c.P===P).map(c=>c.v);st.piers+=pv.length;
    const open=(x,z,i,s)=>{for(const o of OP)if(o[0]===P.id&&o[1]===i&&s>=o[2]&&s<=o[3])return'stair';return nearHS(x,z)?'stair':false;};
    const rooms=PAL_PLAN.shops&&PAL_PLAN.shops[P.id]||null;   // H2: the shop arches in the north foot wall
    const endV=[];for(let v=0;v<P.E.length;v++){const a=P.E[(v+P.E.length-1)%P.E.length].k,b=P.E[v].k;if((a==='w'&&b==='o')||(a==='o'&&b==='w'))endV.push(v);}   // H2: a newel pier where a wall meets an open stair head
    const out=terraceEdge(W,g,P.pts,P.y,{F:PFR,tag:'pal:'+P.id,pal:1,skip,footY,open,rock:true,m3:true,wing:false,piers:pv,endV,rooms,roomOpt:{bay:4.6},
      butt:{min:4,sp:9,turn:20,avoid,sym:P.id===F0.wall?{1:F0.at[1]-palPlById(F0.wall).E[1].a[1]}:null},noLump:(x,z)=>{const[lx,lz]=palL(x,z);return lx<176&&lx>170&&lz>-45&&lz<9;}});   // the paved hemicycle at the summit wall's foot (H2-B)
    for(const e of out.edges){if(e.skip)continue;st.walls++;st.wallLen+=e.L;if(e.runs&&e.runs.length<e.S.length)st.openings+=Math.max(0,e.runs.length-1);for(const q of e.S){st.maxH=Math.max(st.maxH,q.h);if(q.rk!=null)st.rockRuns++;}}
    for(const e of P.E)if(e.k==='w'){st.cutLen+=palCutWall(W,g,P,e);if(e.foot!=null){const r=(W.wallFeet||[]).find(q=>q.tag==='pal:'+P.id+':'+e.i);if(r)r.ledge=true;}}   // a wall standing on a terrace's floor: no rocks or moss at its foot (terraceFeet), shrubs and cypresses only
    st.plants=(st.plants||0)+palPlatPlant(W,g,P,holes);}
  palHemicycle(W,g);st.ledge=palLedge(W,g,SB);st.shops=palShopAprons(W,gF);
  // the villas' garden terraces (30): their walls carry the model's lower garden where the foot terrace (26) is below, so __floatCheck must not call it floating
  for(const V of PAL_PLAN.villas){const P=palPlById(V.gardens);if(!P)continue;const xs=P.pts.map(p=>p[0]),zs=P.pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs),q=PFR.p((x0+x1)/2,0,(z0+z1)/2);
    (ROME.supports=ROME.supports||[]).push({x:q[0],z:q[2],c:Math.cos(PALF.rot),s:Math.sin(PALF.rot),hw:(x1-x0)/2,hd:(z1-z0)/2});}
  st.wallLen=+st.wallLen.toFixed(0);st.maxH=+st.maxH.toFixed(1);st.cutLen=+st.cutLen.toFixed(0);
  for(const[G,name]of[[g,'palPlatWalls'],[gF,'palPlatFloors']]){const m=G.mesh(MAT.city);if(m){m.name=name;W.scene.add(m);}}}
// H2: the shops' aprons in front of the north foot wall: slab paving (grade 5) 4.5 m out from the wall's foot along each span of arches, at the levelled
// ground (palShopY); returns the number of spans and their length
function palShopAprons(W,g){let n=0,len=0;for(const A of PAL_SHOPS){const e=A.e,y=palShopY(A)+.05,Q=(s,d)=>PFR.p(e.a[0]+e.ux*s+e.nx*d,y,e.a[1]+e.uz*s+e.nz*d);
    g.set(60,.4,1,3);for(let s=A.s0;s<A.s1-.01;s+=4){const s1=Math.min(A.s1,s+4);g.poly([Q(s,.3),Q(s1,.3),Q(s1,4.8),Q(s,4.8)],[0,1,0]);}n++;len+=A.s1-A.s0;}
  return{spans:n,len:+len.toFixed(0)};}
// M4 (the review of 2026-11-12): a band of ledge rock (grade 1) between the foot walls (footE, footS, footN: the walls down to the ground) and the street, as in
// H2-B: every 1.9 m along the wall up to three rows of rock lumps down the slope, the first against the wall's foot (its top 1-2.4 m up the wall, at most
// 55 % of the wall's height), the next ones lower, each 1.2-2.4 m deep; a shrub on the band every few metres. Not on a street, a house, a road, an opening or
// a stair. A wall whose foot has rock along 60 % of its length or more gets ledge (terraceFeet then plants shrubs and cypresses beyond the band only).
// Returns {lumps, cover}: cover, the share of the walls' length (where they stand 0.4 m or more out of the ground, not open) with rock at the foot.
function palLedge(W,g,SB){const gy=W.gy,busy=(x,z,r)=>(W.streetAt&&W.streetAt(x,z))||W.foot.hits(x,z,r,r,0,0,f=>f.tag==='open'||f.tag==='precinct')||SB.some(h=>nearPoly(x,z,h.R,h.r+.6));
  let lumps=0,want=0,got=0;
  for(const P of PAL_PL){if(!/^foot/.test(P.id))continue;for(const e of P.E){if(e.k!=='w'||e.foot!=null)continue;const R=(W.wallFeet||[]).find(q=>q.tag==='pal:'+P.id+':'+e.i);if(!R||R.S.length<2)continue;
    const S=R.S,tr=Math.atan2(-R.uz,R.ux),at=s=>{let k=0;while(k<S.length-2&&S[k+1].s<s)k++;const A=S[k],B=S[k+1],t=clamp((s-A.s)/((B.s-A.s)||1),0,1);return{x:lerp(A.x,B.x,t),z:lerp(A.z,B.z,t),gF:Math.min(A.y,B.y),h:Math.min(A.h,B.h),open:A.open||B.open||A.room||B.room};};   // the shops' fronts (H2): paving, not rock
    let w0=0,g0=0;
    for(let s=.95;s<R.L-.9;s+=1.9){const q=at(s);if(q.open||q.h-.1<.4)continue;w0+=1.9;let d0=.25,placed=false;
      for(let row=0;row<3;row++){const j=teH(q.x+row*7,q.z,81),hd=row?.6+.5*j:.7+.5*j;let d=d0+.3;while(d<d0+2*hd+.3&&!busy(q.x+R.nx*d,q.z+R.nz*d,.3))d+=.3;if(d-d0-.3<1.2)break;
        const hh=Math.min(hd,(d-d0-.3)/2),hl=.95+.6*teH(q.z,q.x+row,82),cx=q.x+R.nx*(d0+hh),cz=q.z+R.nz*(d0+hh),C=frame(cx,0,cz,tr+(teH(q.x,q.z+row,83)-.5)*.35);let y0=1e9,yi=1e9;
        for(const a of[-hl,hl])for(const b of[-hh,hh]){const p=C.p(a,0,b),yy=gy(p[0],p[2]);y0=Math.min(y0,yy);if(b<0)yi=Math.min(yi,yy);}
        const top=row?yi+.6+.8*teH(cx,cz,84):q.gF+Math.min(.55*(q.h-.1),1+1.4*teH(q.x,q.z,84)),ht=Math.min(5,top-(y0-.45));if(ht<.6)break;
        rockLump(g,C,hl,hh,y0-.45,ht,1,.2+.5*j,[cx,cz]);(W.palRocks=W.palRocks||[]).push([cx,cz,1.5]);lumps++;placed=true;
        if(row&&teH(cx,cz,85)<.3)W.trees.push([cx,top-.1,cz,'shrub',.6+.5*teH(cx,cz,86),null,3]);
        d0+=2*hh-.25;}
      if(placed){R.brk.push(s);g0+=1.9;}}
    want+=w0;got+=g0;if(w0&&g0/w0>=.6)R.ledge=true;}}
  return{lumps,cover:want?+(got/want).toFixed(3):null};}
// planting on a terrace's floor (no lawn: palatine-masterplan.md M5): along its own walls, 3 m in, a kerbed bed with a garden plant every 10 m and a cypress
// or an umbrella pine between every other pair; on the wide floors (more than 7 m from every edge) beds on a 14 m grid. Not on the hemicycle garden (its own),
// a building, a stair or within 2 m of one. Dice keyed to the place.
// The belts (the review of 2026-11-12): inside the 4 m walk along their walls (palPlatFloor) plane trees in rows 6.5 and 14.5 m in, 7 m apart, each in a
// kerbed square of garden lawn, and a box bed between each pair; the rest gravel, with the beds of the 14 m grid on the wide floors.
function palPlatPlant(W,g,P,holes){const y=P.y+.06,ST=[...(W.palStairs||[]).map(s=>({R:s.pts,r:s.w/2+2})),...(W.hillStairs||[]).filter(h=>!h.pal&&h.R).map(h=>({R:h.R,r:h.w/2+2}))];let n=0;
  const free=(lx,lz,m)=>{if(!inPolyXZ(lx,lz,P.pts)||palPolyDl(lx,lz,P.pts)<m)return false;if(holes.some(h=>lx>h[0]-2&&lx<h[1]+2&&lz>h[2]-2&&lz<h[3]+2))return false;
      if(P.id==='beltE'&&lz>-45&&lz<9)return false;if(P.id==='beltN'&&palInLaneN(lx,lz))return false;const[x,z]=palW(lx,lz);return!ST.some(h=>nearPoly(x,z,h.R,h.r));};
  const bed=(lx,lz,rot)=>{const q=PFR.p(lx,0,lz),F=frame(q[0],0,q[2],PALF.rot+rot),k=teH(q[0],q[2],71);trimSet(g,1,.5);box(g,F,0,y-.06,0,1.3,.26,1,31);g.set(23,.4);
      g.poly([F.p(-1.14,y+.205,-.84),F.p(1.14,y+.205,-.84),F.p(1.14,y+.205,.84),F.p(-1.14,y+.205,.84)],[0,1,0]);W.trees.push([q[0],y+.2,q[2],impGarden(k),.7+.5*teH(q[0],q[2],72),null,1]);n++;};
  const tree=(lx,lz)=>{const q=PFR.p(lx,0,lz),k=teH(q[0],q[2],73);W.trees.push([q[0],y,q[2],k<.62?'cyp':'pine',.8+.3*teH(q[0],q[2],74)]);n++;};
  if(/^belt/.test(P.id)){const T=[],room=(lx,lz,r)=>!T.some(t=>Math.hypot(t[0]-lx,t[1]-lz)<r);
    for(const d of[6.5,14.5])for(const e of P.E){if(e.k!=='w'||e.L<8)continue;const at=s=>[e.a[0]+e.ux*s-e.nx*d,e.a[1]+e.uz*s-e.nz*d],rot=-Math.atan2(e.uz,e.ux),nt=Math.floor((e.L-4)/7);if(nt<1)continue;
      for(let j=0,s0=(e.L-(nt-1)*7)/2;j<nt;j++){const s=s0+j*7,p=at(s);if(free(p[0],p[1],2.6)&&room(p[0],p[1],5.5)){palPlaneSq(W,g,p[0],p[1],y);T.push(p);n++;}
        const q=at(s+3.5);if(j<nt-1&&free(q[0],q[1],2.2)&&room(q[0],q[1],2.6)){palBoxBed(W,g,q[0],q[1],y,rot,1.7,.7);n++;}}}
    for(let lx=Math.ceil(P.x0/14)*14+7;lx<P.x1;lx+=14)for(let lz=Math.ceil(P.z0/14)*14+7;lz<P.z1;lz+=14)if(free(lx,lz,7)&&room(lx,lz,4))bed(lx,lz,0);
    return n;}
  for(const e of P.E){if(e.k!=='w'||e.L<8)continue;const at=(s,d)=>[e.a[0]+e.ux*s-e.nx*d,e.a[1]+e.uz*s-e.nz*d],rot=-Math.atan2(e.uz,e.ux);
    for(let j=0,s=5;s<e.L-4;s+=10,j++){const p=at(s,3);if(!/^sum/.test(P.id)&&free(p[0],p[1],2.2))bed(p[0],p[1],rot);if(j%2===1&&P.id!=='sumN'){const t=at(s-5,2.4);if(free(t[0],t[1],1.8))tree(t[0],t[1]);}}}
  if(!/^sum/.test(P.id))for(let lx=Math.ceil(P.x0/14)*14+7;lx<P.x1;lx+=14)for(let lz=Math.ceil(P.z0/14)*14+7;lz<P.z1;lz+=14)if(free(lx,lz,7))bed(lx,lz,0);
  return n;}
// a plane tree in a kerbed square of garden lawn 2.6 m across (hill grid lx, lz; floor y), as in the hemicycle (H2-B)
function palPlaneSq(W,g,lx,lz,y,sc){const q=PFR.p(lx,0,lz),F=frame(q[0],0,q[2],PALF.rot);trimSet(g,1,.5);
  for(const[cx,cz,hx,hz]of[[0,1.42,1.54,.12],[0,-1.42,1.54,.12],[1.42,0,.12,1.3],[-1.42,0,.12,1.3]])box(g,F,cx,y-.06,cz,hx,.24,hz,31);
  g.set(23,.4);g.poly([F.p(-1.3,y+.1,-1.3),F.p(1.3,y+.1,-1.3),F.p(1.3,y+.1,1.3),F.p(-1.3,y+.1,1.3)],[0,1,0]);W.trees.push([q[0],y,q[2],'plane',sc||.9+.2*teH(q[0],q[2],75),null,1]);}   // owner 1 (imperial): the hill planting keeps the kind
// a box bed (hill grid lx, lz; floor y; turned rot from the grid; hx x hz half): a travertine kerb, lawn, clipped box along its long sides, a flowering shrub
// in the middle
function palBoxBed(W,g,lx,lz,y,rot,hx,hz){const q=PFR.p(lx,0,lz),F=frame(q[0],0,q[2],PALF.rot+rot),k=teH(q[0],q[2],76);trimSet(g,1,.5);box(g,F,0,y-.06,0,hx,.3,hz,31);
  g.set(23,.4);g.poly([F.p(-hx+.14,y+.245,-hz+.14),F.p(hx-.14,y+.245,-hz+.14),F.p(hx-.14,y+.245,hz-.14),F.p(-hx+.14,y+.245,hz-.14)],[0,1,0]);
  for(let u=-hx+.55;u<hx-.3;u+=.9){if(Math.abs(u)<.8)continue;for(const v of hz>1.1?[-hz+.45,hz-.45]:[0]){const p=F.p(u,0,v);W.trees.push([p[0],y+.24,p[2],'shrub',.42+.08*teH(p[0],p[2],77),null,1]);}}
  W.trees.push([q[0],y+.24,q[2],k<.65?'flower':'shrub',.75+.3*teH(q[0],q[2],78),null,1]);}
// H2: the north belt's lane behind the houses (paved, no planting): between the Transitoria's rock and the houses' backs (-130), from the rim's corner to the bastion
const palInLaneN=(lx,lz)=>lz>-131.5&&lx>4&&lx<178;
const palPolyDl=(lx,lz,Q)=>{let d=1e9;for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length];d=Math.min(d,segD(lx,lz,a[0],a[1],b[0],b[1]));}return d;};
// the hemicycle garden between the two villas (as H2-B, the review of 2026-11-12): slab paving (the floor), the slot's cheek walls, four plane trees in
// lawn squares, six box beds in two rows of three either side of the axis walk, the wall fountain on the axis in an aedicula against the summit wall, and
// a string course along that wall between the two summit flights' heads
function palHemicycle(W,g){const H=PAL_HEMI,y=PAL_PLAN.levels.belt,fy=PAL_PLAN.levels.foot,sl=PAL_PLAN.hemi.slot,P=(lx,yy,lz)=>PFR.p(lx,yy,lz),yF=y+.06;
  // the slot's cheeks: a wall each side from under the foot floor up to the belt, coping and parapet on the belt side
  for(const zc of[sl[0][1],sl[1][1]]){const sg=zc<H.c[1]?-1:1,x0=sl[0][0],x1=sl[1][0],F=frame(...(()=>{const q=P((x0+x1)/2,0,zc+sg*.3);return[q[0],0,q[2]];})(),PALF.rot);
    g.set(60,.45,1,0);box(g,F,0,fy-.8,0,(x1-x0)/2,y+.1-fy+.8,.3,31);g.set(60,.45,1,1);box(g,F,0,fy-.8,0,(x1-x0)/2+.02,3.2,.37,31&~16);
    trimSet(g,1,.45);box(g,F,0,y+.1-.45,sg*.05,(x1-x0)/2+.05,.45,.45,31);g.set(60,.45,1,0);box(g,F,0,y+.1,sg*.1,(x1-x0)/2,.9,.3,31);trimSet(g,1,.5);box(g,F,0,y+1,sg*.1,(x1-x0)/2+.03,.1,.34,31);}
  // four plane trees: a pair 10 m in front of the summit wall outside the beds, a pair at the front either side of the curve
  for(const[lx,lz]of[[184,H.c[1]-13],[184,H.c[1]+13],[200,H.c[1]-18],[200,H.c[1]+18]])palPlaneSq(W,g,lx,lz,yF,1.12);
  // six box beds, 4.8 x 4 m, either side of the 7.6 m axis walk
  for(const lx of[184,191,198])for(const sg of[-1,1])palBoxBed(W,g,lx,H.c[1]+sg*6,yF,0,2.4,2);
  // the wall fountain: an aedicula against the summit wall (sumE edge 1) on the axis: a podium, two pilasters, a dark niche with a statue, an entablature
  // and a pediment; a basin in front. Local x = +lx (out of the wall), z = +lz; the wall's face leans out 4 % to its foot (0.58 m out at the belt)
  {const f=PAL_PLAN.fountains[0],e=palPlById(f.wall).E[1],sf=f.at[1]-e.a[1],q=palEdgePt(f.wall,1,sf,0),c=PFR.p(q[0],0,q[1]),F=frame(c[0],0,c[2],PALF.rot),yE=y+4.4;
    trimSet(g,1,.5);box(g,F,.8,yF-.06,0,.55,.9,2.7,31);   // the podium
    for(const z of[-2.05,2.05])box(g,F,.95,yF+.84,z,.35,yE-yF-.84,.38,31&~32);   // the pilasters
    g.set(60,.5,1,1);box(g,F,.62,yF+.84,0,.04,yE-yF-.84,1.7,31&~32);g.set(61,.18,1,0);box(g,F,.68,yF+1.2,0,.04,2.9,1.15,2);   // the panel behind, the niche
    trimSet(g,1,.45);box(g,F,1,yE,0,.42,.62,2.75,31);   // the entablature
    {const yp=yE+.62,yt=yp+1.2,x0=.6,x1=1.42,P3=(x,yy,z)=>F.p(x,yy,z);   // the pediment
      g.poly([P3(x1,yp,-2.8),P3(x1,yp,2.8),P3(x1,yt,0)],PFR.d(1,0,0));for(const sg of[-1,1])g.poly([P3(x1,yp,sg*2.8),P3(x0,yp,sg*2.8),P3(x0,yt,0),P3(x1,yt,0)],PFR.d(0,2.8,sg*1.2));}
    pedestalStatue(g,F,.95,0,yF+.84,2.4,{gilt:false});
    const b=PFR.d(3.05,0,0);fountain(W,g,c[0]+b[0],c[2]+b[2],{y:yF-.01,rot:PALF.rot,hx:1.6,hz:2.7,statue:0});
    // the string course: travertine, 0.45 m high and 0.3 m out of the face, with a drip under it, between the two flights' heads, over the wall's own
    // (terraceEdge: 6 m under the coping) and clear of the pediment
    const Sn=PAL_PLAN.stairs.find(t=>t.id==='eastPn'),Ss=PAL_PLAN.stairs.find(t=>t.id==='eastPs'),s0=Sn.legs[0][2],s1=Ss.legs[0][2],m=palEdgePt(f.wall,1,(s0+s1)/2,0),cm=PFR.p(m[0],0,m[1]),G=frame(cm[0],0,cm[2],PALF.rot),yc=palPlById(f.wall).y-.35-6.1;
    trimSet(g,1,.5);box(g,G,.2,yc,0,.3,.45,(s1-s0)/2-.1,31);box(g,G,.14,yc-.16,0,.2,.16,(s1-s0)/2-.1,31);}}

/* ---- H2: the west and south-west slopes (palatine-masterplan.md 2.2 and 2.5; the author's default of 2026-11-12: rock and grove, few walls) ----
   No terrace wall here: the old rings are gone (PAL_PLAN.rayCut), and the summit edge under the temple courts is the Magna Mater's and the Victoria's own
   base walls (their models, square buttresses since R7). The Tiberiana's cliff and its foot stay as they are (nothing within 3 m of its rock outline).
   palWestSlope(W), after the hill stairs, the temple links and the terrace walls (it keeps off them, the streets, the houses and the models):
   - rock (PAL_PLAN.west.rock): outcrops of grade-1 rock (rockLump, as the ledge at the foot walls), ledges 4.8-8 m long along the contour with their face
     downhill where it is steep, a lone boulder now and then on the gentler slope, and a lump off the lattice on any cell over 27 degrees still bare (R5 says 30); scrub, figs
     and a few stone pines between them;
   - grove (PAL_PLAN.west.grove, the shelf west of the Magna Mater and the south-west slope round the Scalae Caci): holm oaks, laurels and stone pines.
   Dice keyed to the place (teH); the trees keep their kind (owner 3). W.palWest: the counts.
   palWestReserve(W), in palTerraces (before the roads and the houses): the rock and the grove are open land, 8 m squares on the hill grid wherever a square
   is wholly inside the fence (PAL_FENCE: the districts and streets do not see them), so the houses keep off the slope the rings left; and the old rings'
   footprints at the west foot stay as they were at H1 (PAL_PLAN.west.ringLand: the ten outside the fence, and those the house grid west of the hill in
   monuments.js can reach, whose one dice stream would otherwise carry a change on the slope out into the city), so the city outside the fence does not move. */
function palWestReserve(W){const Wd=PAL_PLAN.west;if(!Wd)return;
  for(const[x,z,hw,hd,c,s]of Wd.ringLand||[]){const f=W.foot.add(x,z,hw,hd,Math.atan2(s,c),'open');f.c=c;f.s=s;f.palKeep=1;}   // c, s as H1 had them, to the last bit
  const F=typeof fbFence==='function'?fbFence():null,inF=(lx,lz)=>{const q=palW(lx,lz);return!F||fbInFence(F,q[0],q[1]);};let n=0;
  for(let lz=-40;lz<216;lz+=8)for(let lx=-268;lx<-88;lx+=8){const cx=lx+4,cz=lz+4;if(!inPolyXZ(cx,cz,Wd.rock)&&!inPolyXZ(cx,cz,Wd.grove))continue;
    if(![[0,0],[-4,-4],[4,-4],[4,4],[-4,4],[0,-4],[4,0],[0,4],[-4,0]].every(([a,b])=>inF(cx+a,cz+b)))continue;
    const q=palW(cx,cz);W.foot.add(q[0],q[1],4,4,PALF.rot,'open').palKeep=1;n++;}
  W.palWestKeep=n;}
function palWestSlope(W){const Wd=PAL_PLAN.west;if(!Wd)return;const gy=W.gy,g=new GB(1<<16),st=W.palWest={rocks:0,shrubs:0,grove:0,pines:0};
  const ST=[...(W.hillStairs||[]).filter(h=>h.R&&h.R.length>1).map(h=>({R:h.R,r:h.w/2+1.8})),...(W.palStairs||[]).map(s=>({R:s.pts,r:s.w/2+1.8}))];
  const tib=PAL_ASSETS.find(a=>/tiberiana/.test(a.n)),tibD=(lx,lz)=>{const E=tib&&palRockE[tib.n];if(!E)return 1e9;const t=tib.turn*DEG,c=Math.cos(t),s=Math.sin(t),dx=lx-tib.lx,dz=lz-tib.lz,u=c*dx-s*dz,v=s*dx+c*dz;
    let d=-1e9;for(const[px,pz,nx,nz]of E)d=Math.max(d,(u-px)*nx+(v-pz)*nz);return d;};
  const vn=(x,z,c)=>{const fx=x/c,fz=z/c,i=Math.floor(fx),j=Math.floor(fz),a=sstep(0,1,fx-i),b=sstep(0,1,fz-j),h=(p,q)=>hash2(p*1.31+7.7,q*.77+3.1);return lerp(lerp(h(i,j),h(i+1,j),a),lerp(h(i,j+1),h(i+1,j+1),a),b);};   // value noise, cells of c m
  const busy=(lx,lz,x,z,r,k=1,rd=0)=>palInAsset(lx,lz,.5+k)||palRockD(lx,lz)<.5+k||tibD(lx,lz)<3||(W.streetAt&&(W.streetAt(x,z)||W.streetAt(x+r*.6,z)||W.streetAt(x-r*.6,z)||W.streetAt(x,z+r*.6)||W.streetAt(x,z-r*.6)))||
    W.foot.hits(x,z,r*.5*k,r*.5*k,0,0,f=>f.tag==='open'||(!k&&f.tag==='precinct')||(rd&&f.tag==='road'&&!f.lane&&!f.v2&&!f.v2street))||palNearSC(lx,lz,2)||ST.some(h=>nearPoly(x,z,h.R,h.r-.8+r*.3*k));   // k: 1 for trees, 0 for the rocks (they may lie against a model's base or a footprint's edge, and on a precinct's slope);
    // rd: a main road's corridor counts only where the street raster paves it (the fill below may set a rock on the cut bank of the verge)
  const grad=(x,z)=>{const gx=(gy(x+1.5,z)-gy(x-1.5,z))/3,gz=(gy(x,z+1.5)-gy(x,z-1.5))/3;return[gx,gz,Math.hypot(gx,gz)];};
  const rocks=[],tree=(x,z,kind,s,col)=>{W.trees.push([x,gy(x,z),z,kind,s,col||null,3]);};
  // the rock
  // outcrops, not scree: ledges 4.8-8 m long along the contour on a 4.5 m lattice where it is steep (over 30 degrees, or over 20 where the noise is high),
  // a lone boulder now and then on the gentler slope; where a ledge does not fit, a shorter one
  for(let lz=-40;lz<=216;lz+=4.5)for(let lx=-268;lx<=-90;lx+=4.5){const jx=lx+(teH(lx,lz,91)-.5)*2.4,jz=lz+(teH(lx,lz,92)-.5)*2.4;if(!inPolyXZ(jx,jz,Wd.rock))continue;
    const[x,z]=palW(jx,jz),[gx,gz,sl]=grad(x,z),deg=Math.atan(sl)/DEG,m=vn(x,z,14)*.75+vn(x,z,5)*.25,steep=deg>30||(deg>20&&m>.6);
    if(!(steep||(deg>10&&m>.78&&teH(x,z,93)<.25)))continue;
    const j=teH(x,z,94);let hl=steep?2.4+1.6*j:1.1+.6*j,hd=steep?1.15+.6*teH(x,z,95):.8+.4*teH(x,z,95);
    const tr=Math.atan2(-gx,-gz)+(teH(x,z,96)-.5)*.4,C=frame(x,0,z,tr);let y0=1e9,yu=-1e9;   // tr: the lump's long side (frame x) along the contour, frame z downhill
    const free=(hl,hd)=>[0,-.7,.7].every(f=>{const p=C.p(f*hl,0,0),[ql,qz]=palL(p[0],p[2]);return!busy(ql,qz,p[0],p[2],Math.max(hd,hl*.3),0);});   // the middle and both ends
    if(!free(hl,hd)){if(!steep)continue;hl=1.5;hd=1;if(!free(hl,hd))continue;}
    for(const a of[-hl,hl])for(const b of[-hd,hd]){const p=C.p(a,0,b),yy=gy(p[0],p[2]);y0=Math.min(y0,yy);yu=Math.max(yu,yy);}
    const top=yu+.25+(deg>30?.9:.5)*teH(x,z,97),ht=Math.min(4.5,top-(y0-.45));if(ht<.7)continue;
    rockLump(g,C,hl,hd,y0-.45,ht,1,.2+.5*j,[x,z]);rocks.push([x,z,Math.max(hl,hd)+.3]);st.rocks++;
    if(deg>24&&teH(x,z,98)<.4){const p=C.p((teH(x,z,99)-.5)*hl,0,-hd*1.1),y2=gy(p[0],p[2]);rockLump(g,frame(p[0],0,p[2],tr+(teH(x,z,100)-.5)*.6),hl*.6,hd*.6,y2-.4,Math.min(2.2,.9+.8*teH(x,z,101)),1,.3+.4*j,[p[0],p[2]]);}}   // a second, smaller ledge just uphill of some
  // R5: then every 1.5 m cell over 30 degrees (on __palBareSlope's lattice) that no outcrop covers yet gets a small one
  const cov=(x,z)=>rocks.some(b=>Math.abs(b[0]-x)<b[2]&&Math.abs(b[1]-z)<b[2]&&Math.hypot(b[0]-x,b[1]-z)<b[2]);
  for(let lz=-40.75;lz<=216;lz+=1.5)for(let lx=-268.75;lx<=-90;lx+=1.5){if(!inPolyXZ(lx,lz,Wd.rock))continue;const[x,z]=palW(lx,lz),sl=Math.hypot(gy(x+.75,z)-gy(x-.75,z),gy(x,z+.75)-gy(x,z-.75))/1.5;
    if(sl<=Math.tan(27*DEG)||cov(x,z)||busy(lx,lz,x,z,1.5,0,1))continue;   // 27: 3 degrees below the check (__palBareSlope), a margin; r 1.5: the street raster 0.9 m round
    // a lump 1.2-2 m long along the contour, set off the lattice by up to 0.6 m so the fill makes no rows, and large enough to cover the cells round it;
    // where that does not fit, a small one on the cell itself
    let hl=1.2+.8*teH(x,z,112),hd=.75+.4*teH(x,z,113),px=x+(teH(x,z,114)-.5)*1.2,pz=z+(teH(x,z,115)-.5)*1.2;
    const lump=(px,pz,hl,hd)=>{const[gx,gz]=grad(px,pz);return frame(px,0,pz,Math.atan2(-gx,-gz)+(teH(x,z,116)-.5)*.6);};
    let C=lump(px,pz,hl,hd);
    if(![0,-.8,.8].every(f=>{const p=C.p(f*hl,0,0),[ql,qz]=palL(p[0],p[2]);return inPolyXZ(ql,qz,Wd.rock)&&!busy(ql,qz,p[0],p[2],Math.max(1.5,hd+.9),0,1);})){hl=.85;hd=.6;px=x;pz=z;C=lump(x,z,hl,hd);}
    let y0=1e9,yu=-1e9;for(const a of[-hl,hl])for(const b of[-hd,hd]){const p=C.p(a,0,b),yy=gy(p[0],p[2]);y0=Math.min(y0,yy);yu=Math.max(yu,yy);}
    rockLump(g,C,hl,hd,y0-.45,Math.min(3.2,yu+.3+.5*teH(x,z,110)-(y0-.45)),1,.2+.5*teH(x,z,111),[px,pz]);rocks.push([px,pz,Math.max(1.15,hl+.15)]);st.rocks++;st.fill=(st.fill||0)+1;}
  (W.palRocks=W.palRocks||[]).push(...rocks);
  const nearRock=(x,z,r)=>rocks.some(b=>Math.abs(b[0]-x)<b[2]+r&&Math.abs(b[1]-z)<b[2]+r&&Math.hypot(b[0]-x,b[1]-z)<b[2]+r);
  // scrub between the rocks of the west slope (not in the grove)
  for(let lz=-40;lz<=216;lz+=3.5)for(let lx=-268;lx<=-90;lx+=3.5){const jx=lx+(teH(lx,lz,101)-.5)*2.4,jz=lz+(teH(lx,lz,102)-.5)*2.4;if(!inPolyXZ(jx,jz,Wd.rock)||inPolyXZ(jx,jz,Wd.grove))continue;
    const[x,z]=palW(jx,jz),r=teH(x,z,103);if(r>.42)continue;if(nearRock(x,z,.9)||busy(jx,jz,x,z,1.2,1))continue;
    if(r<.03){tree(x,z,'pine',.8+.3*teH(x,z,104));st.pines++;}else if(r<.07){tree(x,z,'fig',.6+.3*teH(x,z,104));st.shrubs++;}else{tree(x,z,'shrub',.5+.5*teH(x,z,104));st.shrubs++;}}
  // the grove: holm oaks, laurels (smaller, lighter), stone pines (the Magna Mater's: Attis' pine)
  for(let lz=50;lz<=220;lz+=5.5)for(let lx=-250;lx<=-86;lx+=5.5){const jx=lx+(teH(lx,lz,105)-.5)*3.4,jz=lz+(teH(lx,lz,106)-.5)*3.4;if(!inPolyXZ(jx,jz,Wd.grove))continue;
    const[x,z]=palW(jx,jz),r=teH(x,z,107);if(r>.82)continue;if(nearRock(x,z,1.6)||busy(jx,jz,x,z,2.2,1))continue;
    const k=teH(x,z,108);if(k<.45)tree(x,z,'broad',.9+.35*teH(x,z,109),[.035,.07,.028]);else if(k<.72)tree(x,z,'broad',.55+.2*teH(x,z,109),[.045,.088,.032]);else{tree(x,z,'pine',.85+.3*teH(x,z,109));st.pines++;}st.grove++;}
  const m=g.mesh(MAT.city);if(m){m.name='palWestRock';W.scene.add(m);}}

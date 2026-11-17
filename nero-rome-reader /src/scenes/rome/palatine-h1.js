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
  const G=(P.guide||[]).slice(1).map((b,i)=>{const a=P.guide[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;return{i:-1-i,a,b,L,ux,uz,nx:A>0?uz:-uz,nz:A>0?-ux:ux,k:'w',guide:1};});   // planting rows only
  return Object.assign({},P,{x0,x1,z0,z1,E,G,W:P.pts.map(p=>palW(p[0],p[1]))});});
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
// first (palPierPlan takes them by PAL_PLAN.villas' order): model x -15..15, y -14.5..23 (house and its garden T1 to W1's face: R10 乙, round 4; the
// system's 36 runs round it). The flat courtyard blocks cf on the belt (R10 乙): x -15..15, y -10..15 (their garden's balustrade on the belt's edge).
const palPlBuild=()=>{const R=[],add=(lx,lz,hu,hv,tn,m)=>{const q=((tn%180)+180)%180===0;R.push(q?[lx-hu-m,lx+hu+m,lz-hv-m,lz+hv+m]:[lx-hv-m,lx+hv+m,lz-hu-m,lz+hu+m]);};
  for(const A of PAL_ASSETS)if(/_belt$/.test(A.n))R.push(palModelRect(A.lx,A.lz,A.turn,-15,15,-14.5,23,-.2));
  for(const B of palBL){if(B.t==='cf'){R.push(palModelRect(B.lx,B.lz,B.tn,-15,15,-10,15,-.2));continue;}
    if(B.h51){R.push(palModelRect(B.lx,B.lz,B.tn,-15.2,15.2,-14,13,-.2));continue;}   // H5.1: the d_low as it stands (its wing walls' ends at model y -14, its back wall at 13; the porch's steps stand on the paving).
    // Across, its walls' outer faces (x +-15): the roof's eaves reach 18.4, but nothing stands under them, and a hole to 18.4 showed the ground there (51.47) in
    // two 3.4 m strips at each house's ends (review 33, L4: the court's niche)
    add(B.lx,B.lz,B.hw,B.hd,B.tn,-.2);}
  return R;};

/* ---- terrain ---- inside a terrace the ground is 0.3 m under its floor; within 3.2 m of a wall down to a lower level it dips inside the line to that level
   (the floor mesh covers the dip: the terrain mesh, 3 m cells, cannot step at the wall line, and nothing pokes out of the wall's face). Outside every terrace:
   where the ground is higher than a walled terrace's floor (a cut) it comes down to that floor at the wall line, under the cut wall's cap; at a grade edge with no
   terrace beyond it eases to the floor over 6 m. */
// the terrain patch's post (monuments.js TPATCH): its smoothing spreads a 13 m wall step over some 9 m, which lifts the ground of the terrace below
// through its floor near the wall above; inside a terrace the smoothed ground is held back under the floor (palPlatShape there)
function palPlatPost(x,z,h){const[lx,lz]=palL(x,z),B=PAL_PL_BB;h=palSCHold(lx,lz,h);if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3])return h;
  h=palClivGHold(lx,lz,h);   // the Clivus stair's dug landing and lower flight (palClivG)
  {const s=palH51SHold(lx,lz);if(s!=null)h=Math.min(h,s);}   // H5.1, review 33: behind h51's walls up to sumE
  const ht=Math.min(palToeHold(lx,lz),palBfHold(lx,lz));if(palPlIn(lx,lz)||palInSlot(lx,lz)||palLaneAt(lx,lz,0)||palH51Dip(lx,lz))return Math.min(h,palPlatShape(lx,lz,h),ht);return Math.min(h,ht);}
// H5.1: within a dip (PAL_PLAN.dips.h51) outside h51's edges: the smoothing lifted it back (52.5 behind the court's end), so it is held there as inside
const PAL_H51_DIPE=PAL_PLAN.h51.on?(()=>{const P=palPlById('h51'),D=PAL_PLAN.dips.h51||{};return P?P.E.filter(e=>D[e.i]).map(e=>({e,r:D[e.i]+2.5})):[];})():[];
const palH51Dip=(lx,lz)=>PAL_H51_DIPE.some(({e,r})=>segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1])<r)||palH51EndHold(lx,lz)||palH51BStrip(lx,lz)!=null;
// north of the lane (h51's edge lz -5.1, lx 17-139.8): the Transitoria's own paving (51.83) to its colonnade's step (-5.506), then the stylobate (52.04).
// The ground rose through both (52.33 at lx 18: 32's TODO, "h51 北沿要加 dip"): held at 51.6 to 0.5 m past the step, 51.9 under the stylobate to lz -9
const palH51BStrip=(lx,lz)=>!PAL_PLAN.h51.on||lx<17||lx>139.8||lz>-5.1||lz<-9?null:lz>-6?51.6:51.9;
// the lane's east end: behind its end wall c@156's ground (52.5-54) pulled the 3 m mesh up through the lane's last 2.5 m of paving. Held at the lane's under
// the end wall and 3.5 m on under c@156's west edge, between the lane's own lines only (lz -5.1..0.5): hidden in the wall and the block; c@156's corners
// and the middle of its west face, where palBlocks reads the ground for its foundation, are outside it (ROME.supports: the end wall carries it there)
const palH51EndHold=(lx,lz)=>{const E=PAL_PLAN.h51.end;return!!E&&PAL_PLAN.h51.on&&lx>E.x0-.01&&lx<E.x0+3.5&&lz>E.z0-2&&lz<E.z1;};   // 2 m on north of the lane's line: the mesh's cells are the world's, not the hill's
// review 33 (L5, scan): along h51's shared edges with a terrace over a metre higher (sumE: the lane's south wall lx 100-139.8, the pocket's east and south
// walls) the ground under the higher terrace (52-52.8, under its fill and paving at 55) pulled the 3 m mesh up through h51's last metre of paving (up to
// 0.49 over it at lx 119.5). Held at h51's under-floor level for 3.2 m (a mesh diagonal) out from those edges: under the higher fill, behind its wall
const PAL_H51_SE=PAL_PLAN.h51.on?(()=>{const P=palPlById('h51');if(!P)return[];return P.E.filter(e=>{if(e.k!=='s')return false;const mx=(e.a[0]+e.b[0])/2,mz=(e.a[1]+e.b[1])/2,L=Math.hypot(e.b[0]-e.a[0],e.b[1]-e.a[1]),nx=-(e.b[1]-e.a[1])/L,nz=(e.b[0]-e.a[0])/L;
  for(const s of[1,-1]){const qx=mx+nx*s*.5,qz=mz+nz*s*.5;if(inPolyXZ(qx,qz,P.pts))continue;const Q=palPlIn(qx,qz);if(Q&&Q!==P&&Q.y>P.y+1)return true;}return false;}).map(e=>({e,P}));})():[];
// review 35 (11-16): and under the court's niche (its sill 0.6 over the paving, 1 m deep into the cut): the ground there showed a green line at the sill's back
const palH51SHold=(lx,lz)=>{if(PAL_PLAN.h51.on)for(const c of PAL_PLAN.h51.niches||[])if(c.dir===1&&Math.abs(lx-c.x)<c.w/2+.3&&lz>c.z-.1&&lz<c.z+c.d+.6)return c.on+.06+c.sill-.3;
  for(const{e,P}of PAL_H51_SE)if(segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1])<3.2&&!inPolyXZ(lx,lz,P.pts))return P.y-.3;return null;};
// 图三: courtyard block b stands half a metre and more back from the lane's south edge (29.5; its foundation, palBlocks, at 30), and the smoothed patch rose
// 0.1-0.5 m through the floor along its foot: a band of bare ground, then slivers fed by the 3 m cells further back. The lane's paving runs on to the block
// (palTibLane, x between the two end stairs' cheeks, to 31.05) and the ground is held just under the floor from the lane's edge to lz 42, under the block
// (the strip held only to 36 still left slivers at the plinth's foot; nothing under the block shows).
// R8 (round 4): the ground under the Scalae Caci's foot walk (palSCFoot) held 0.1 m under its centre line's natural level, 4.5 m either side of the axis
// (a diagonal of the 3 m mesh past the kerbs), from a cell up the stair (its treads stand 0.3-0.8 m over the ground there): its cross-fall (up to 0.1 m) rose
// through the paving on the uphill side, and through the stair's last tread. From 12.5 m on the 0.1 m comes back to nothing over 2 m, and on to 3 m into the
// street (it starts 14.25 m out) the ground is held at its centre line's own level, so the walk meets a street level across it (the uphill side a few cm lower)
let PAL_SCF=null;
function palSCHold(lx,lz,h){if(typeof PAL_SC==='undefined')return h;
  if(!PAL_SCF){const P=PAL_SC.path,a=P[P.length-2],b=P[P.length-1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);PAL_SCF={x:b[0],z:b[1],ux:(b[0]-a[0])/L,uz:(b[1]-a[1])/L};}
  const F=PAL_SCF,dx=lx-F.x,dz=lz-F.z,s=dx*F.ux+dz*F.uz,c=dz*F.ux-dx*F.uz;if(s<-3||s>17.5||Math.abs(c)>PAL_SC.w/2+4.5)return h;
  const[x,z]=palW(F.x+F.ux*s,F.z+F.uz*s);return Math.min(h,romeH(x,z)-Math.max(0,Math.min(.1,.1-(s-12.5)*.05)));}
const PAL_LANE_TOE={x0:-161.8,x1:-98.2,z0:29.5,z1:31.05,hold:31.05,under:35.5,y:54.7,yL:54.85,ends:[-96.8,-163.2],plateau:{'-96.8':56.75,'-163.2':57.3}};
// Round 4 (the review of 2026-11-14): each of the lane's end stairs (palTibLane) runs from the lane (yL) up to the plateau beside the block's end, to the
// slab paving's level there (palStrips: the ground + 0.13); equal risers of about 0.2, flights of at most 15 with a 1.5 m landing (palFlight). The plateau's
// level is PAL_LANE_TOE.plateau: the smoothed ground (W.gy) 4-6 m out from the block's end and on the axis at lz 45-46 (2026-11-14; romeH, before the
// terrain patch's smoothing, is 0.5 m higher on the west); palTibLane reports it again (plateauNow) so a drift shows. Until then a stair took as many risers
// as the ground at its apron's far end asked, and that ground is the 3 m mesh pulled down by the toe hold 1.4 m away: 4 and 9 risers in round 3, 1 and 7 after
// round 4's terrain work. The toe hold stops at the flat block b's back wall (lz 31: its floor, 56.4, is the plaza's; the back stands
// 1.55 m over the lane, its back stair, model x 0 to 3.3 against the wall, comes down onto this paving): its ends are on the plaza's ground, not on the lane's.
const PAL_LANE_END={};
function palLaneEnd(lx){if(PAL_LANE_END[lx])return PAL_LANE_END[lx];const T=PAL_LANE_TOE,yT=T.plateau[lx]+.13,n=Math.max(1,Math.round((yT-T.yL)/.2)),
  per=Math.max(1,Math.ceil(n/Math.ceil(n/15))),nL=Math.ceil(n/per)-1,run=n*.38+nL*1.5;return PAL_LANE_END[lx]={yT,n,rh:(yT-T.yL)/n,per,nL,run,top:T.z0+run};}
// the rise of an end stair's tread line d metres up from its foot (palFlight lays flights of per risers from the top, the bottom one has the rest)
function palLaneRise(E,d){const fl=[E.n-E.per*E.nL,...Array(E.nL).fill(E.per)];let s=0,y=0;
  for(let i=0;i<fl.length;i++){const L=fl[i]*.38;if(d<=s+L)return y+(d-s)/.38*E.rh;s+=L;y+=fl[i]*E.rh;if(i<fl.length-1){if(d<=s+1.5)return y;s+=1.5;}}return y;}
// R11: under the lane's two end stairs the ground follows their treads, 0.3 m under the lane's paving and up with their tread line (landings included) from
// 1.1 m past the foot (a cell across the flat foot and the first risers rose over them), 4.5 m either side of the axis (a diagonal of the 3 m mesh past
// the cheeks): the mesh rose 4-50 cm over their lowest treads. From 1.1 m past the top it may come up to 0.15 m under the apron's paving, to 9 m past the top
// the flat block b (rome_pal_block_b_flat, the author 2026-11-15): one floor, the plaza's (B.y 56.4). Over its footprint and 4.5 m past its front (the arcade,
// model y -8; then a ramp, below) the ground is held 0.13 m under the floor, so the slab paving (palStrips, 0.13 over the ground) meets the arcade's floor and no foundation shows
// on the front or the ends; within the model's width plus 1 m only (x +-31.4), clear of the lane's end stairs 3 m past its ends. Held after the smoothing
// (the smoothed patch rose 0.1-0.4 m over a pad laid before it); the back, over the lane, is the toe hold's (54.7, to lz 31.05, and under b's back rooms to 35.5).
const palBfHold=(lx,lz)=>{for(const B of palBL){if(B.t!=='bf')continue;const dx=lx-B.lx,dz=lz-B.lz,u=B.c*dx-B.s*dz,v=B.s*dx+B.c*dz;
  if(Math.abs(u)<31.4&&v>-8.5&&v<24)return B.y-.13+Math.max(0,v-12.5)*.15;}return 1e9;};   // in front: level to 4.5 m out (the 3 m mesh, turned 30 degrees to the hill, blended the plaza back over a hold that stopped 3 m out), then up 1 in 6.7 to the plaza's own level
const palToeHold=(lx,lz)=>{const T=PAL_LANE_TOE;let y=1e9;if(lx>T.x0&&lx<T.x1&&lz>T.z0-.5&&lz<T.hold)y=T.y;
  else if(lx>T.x0+1.8&&lx<T.x1-1.8&&lz>=T.hold&&lz<T.under)y=T.y;   // round 4 (no cut wall along b's back, palBBack): on under b's back rooms (inside its walls, to 4.9 m past
  // its back face), so the 3 m mesh does not climb from 54.7 to b's floor hold across the paving strip in front of its back wall (it rose 5-10 cm through it)
  if(lz>26)for(const c of T.ends)if(Math.abs(lx-c)<4.5){const E=palLaneEnd(c);if(lz>E.top+9)continue;let h=T.yL-.3+palLaneRise(E,Math.max(0,lz-T.z0-1.1));
    if(lz>E.top+1.1)h=Math.max(h,E.yT-.15);y=Math.min(y,h);}
  return y;};
// 图一, option 甲 (the review of 2026-11-14): the Clivus stair clivG as a switchback. Flight 1 north along the outside of beltS's east wall (lx 54) from a
// head landing at the belt (42) down to a turning landing dug into the slope (yL: 1-2 m under the ground there), flight 2 back south beside it down to the
// head of the Clivus Palatinus (PAL_PLAN.clivus.head, about 34.6). x1, x2: the flights' axes; zH..zF1: the head landing; the rest follows from the risers
// (palRunLen). The ground under the dug landing and both flights' strips beside flight 2 is held under flight 2's treads (palClivGHold, in palPlatPost):
// 0.5 m under them, ho m on its lower part (past zr) where it runs on to the road's head. Flight 2 comes down on the north half of the road's head (its
// foot 0.2 m over the bed): the road's own flight there (roadStairs, the head's first 7 m, made where the bed climbs more than 30 %) goes, the bed under
// flight 2 being cut (the head 1 m lower, the road the same from 4 m on). North of the road the slope climbs to the Apollo's rock too fast for the turn to
// be anywhere else with a dig of 1-2 m. Landing 37.2: dug 1.2 m at its middle, 1.9 m at its north-west corner.
// Outside the dug landing's uphill walls the ground comes down to it as at a terrace's cut wall (palPlatShape's dips): at the landing's level within d0 m
// of the wall line, back to the ground by d1 m; the retaining wall's top is at the ground beyond that (palClivG).
const PAL_CLIVG={x1:55.6,x2:58.9,w:2.6,yT:42,yL:37.2,yF:34.2,zH:152.96,zF1:151.36,wall:54,d0:1,d1:3,zr:143.6,ho:.2};
function palRunLen(y0,y1){const n=Math.round((y0-y1)/.2),per=Math.max(1,Math.ceil(n/Math.max(1,Math.ceil(n/15))));return n*.38+(Math.ceil(n/per)-1)*1.5;}
function palClivGZ(){const C=PAL_CLIVG,zL1=C.zF1-palRunLen(C.yT,C.yL);return{zL0:zL1-C.w,zL1,zF:zL1+palRunLen(C.yL,C.yF)};}
function palClivGHold(lx,lz,h){const C=PAL_CLIVG,xe=C.x2+C.w/2+.4;if(lx<C.wall-4.5||lx>xe+C.d1||lz<130||lz>C.zF1)return h;
  const{zL0,zL1,zF}=palClivGZ(),y2=z=>palFlightY(C.yL,C.yF,z-zL1),dip=d=>d<C.d1?Math.min(h,lerp(C.yL-.5,h,sstep(C.d0,C.d1,d))):h;
  // under the stair: the landing; where flight 2 runs beside flight 1, both strips at flight 2's treads (flight 1 is solid down to the ground); flight 1 above
  if(lz>=zF+.3)return h;const lev=lz<=zL1?C.yL:y2(lz),off=lz>C.zr?C.ho:.5;
  if(lx<C.wall)return lz>zL0-4.5?Math.min(h,lev-off):h;   // inside the terraces beside it (under their floors): no ridge of the 3 m mesh between
  if(lz<zL0)return dip(lx>xe?Math.hypot(zL0-lz,lx-xe):zL0-lz);   // north of the landing (its retaining wall)
  if(lx>xe)return lz<=zL1?dip(lx-xe):h;   // east of the landing (its retaining wall); east of flight 2: its cheek wall, the ground lower than the treads
  return Math.min(h,lev-off);}
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
// H5.1 (b2): the solid fills (R12 15.5), hill grid boxes [x0,x1,z0,z1] with the level of their top (palH51Works)
const PAL_H51_FILL=PAL_PLAN.h51.on?(PAL_PLAN.h51.pads||[]).filter(p=>p.fill):[];
const palH51FillY=(lx,lz)=>{for(const p of PAL_H51_FILL)if(lx>p.box[0]&&lx<p.box[1]&&lz>p.box[2]&&lz<p.box[3])return p.y;return null;};
function palPlatShape(lx,lz,h){const B=PAL_PL_BB;if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3])return h;
  if(palH51EndHold(lx,lz))return Math.min(h,PAL_PLAN.h51.plats[0].y-.3);   // H5.1: the lane's east end (under its end wall and c@156, whichever terrace it is in)
  {const b=palH51BStrip(lx,lz);if(b!=null)h=Math.min(h,b);}   // H5.1: terrace B's paving and stylobate north of the lane
  if(palInSlot(lx,lz))return Math.min(h,PAL_PLAN.levels.foot-.3);
  {const L=palLaneAt(lx,lz,0);if(L)return L.y(lx,lz)-.5;}   // H2: a stair lane or slot
  const P=palPlIn(lx,lz);
  if(P){const y=P.y-.3;let o=y;
    for(const e of P.E){if(e.k!=='w'&&e.k!=='st')continue;const d=segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1]);if(d>=3.2)continue;
      const low=e.k==='st'?PAL_PLAN.levels.foot-.3:e.foot!=null?e.foot-.3:Math.min(h,y);o=Math.min(o,lerp(low,y,sstep(.4,3.2,d)));}
    {const L=palLaneAt(lx,lz,3.2);if(L)o=Math.min(o,L.y(lx,lz)-.5);}   // by a lane the ground dips to the flight's under the floor, the wall or the model (the 3 m mesh cannot step at its side)
    return o;}
  let o=h;
  for(const p of PAL_H51_FILL)if(lx>p.box[0]-.3&&lx<p.box[1]+.3&&lz>p.box[2]-.3&&lz<p.box[3]+.3)o=Math.min(o,p.y-.2);   // H5.1: a fill's paved top is never under the ground
  for(const A of PAL_SHOPS){const e=A.e,t=(lx-e.a[0])*e.ux+(lz-e.a[1])*e.uz,d=(lx-e.a[0])*e.nx+(lz-e.a[1])*e.nz;if(t<A.s0-3||t>A.s1+3||d<0||d>10)continue;   // the shops' apron
    const w=Math.min(1-sstep(6,10,d),1-sstep(0,3,Math.max(A.s0-t,t-A.s1)));if(w>0)o=lerp(o,palShopY(A),w);}
  for(const Q of PAL_PL){if(lx<Q.x0-7||lx>Q.x1+7||lz<Q.z0-7||lz>Q.z1+7)continue;
    for(const e of Q.E){if(e.k==='r'||(e.k==='m'&&!PAL_PLAN.dips?.[Q.id]?.[e.i])||e.k==='o')continue;const d=segD(lx,lz,e.a[0],e.a[1],e.b[0],e.b[1]);   // a model's edge only where PAL_PLAN.dips asks (H5.1: W17)
      if(e.k==='s'){if(d<6)o=lerp(Q.y+.05,o,sstep(0,6,d));}
      else{const dp=PAL_PLAN.dips?.[Q.id]?.[e.i]||1;if(d<dp+2.5&&h>Q.y+.2)o=Math.min(o,lerp(Q.y-.3,h,sstep(dp,dp+2.5,d)));}}}   // dp: PAL_PLAN.dips
  return o;}

/* ---- reserve (palTerraces: before the roads and the houses) ---- */
function palPlatReserve(W){W.palPlats=PAL_PL;const H=palPlBuild();
  // a terrace's floor where one can walk (not under a building on it), or null: the temple links walk the floors at their level (tlWalk), where the
  // street raster has the reserved footprint as solid
  W.palFloorY=(x,z)=>{const[lx,lz]=palL(x,z);if(lx<PAL_PL_BB[0]||lx>PAL_PL_BB[1]||lz<PAL_PL_BB[2]||lz>PAL_PL_BB[3])return null;const P=palPlIn(lx,lz);if(!P||P.tl===false)return null;   // tl:false: not walked by the temple links (beltMM, 图七 east: the Magna Mater keeps the stair down from its front that templeLinks built before)
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
// a head landing, out of the parapet's opening onto the first tread: from s0 to s1 along a stair's line (world points A, B), w wide, its top at y;
// o.wall (a world direction) and o.ex: R11, it reaches o.ex metres further that way, to the wall line (no slot between the floor's edge and the stair)
function palLanding(W,g,A,B,w,y,o){const L=Math.hypot(B[0]-A[0],B[1]-A[1])||1,F=frame((A[0]+B[0])/2,0,(A[1]+B[1])/2,Math.atan2(-(B[1]-A[1]),B[0]-A[0]));let yg=1e9;
  for(const a of[-L/2,L/2])for(const b of[-w/2,w/2]){const q=F.p(a,0,b);yg=Math.min(yg,W.gy(q[0],q[2]));}
  let zc=0,hz=w/2;if(o&&o.ex>0){const d=F.d(0,0,1),sz=d[0]*o.wall[0]+d[2]*o.wall[1]>0?1:-1;zc=sz*o.ex/2;hz=w/2+o.ex/2;}
  g.set(60,.5,1,0);box(g,F,0,yg-.8,zc,L/2+.01,y-.12-yg+.8,hz,31&~32);trimSet(g,1,.45);box(g,F,0,y-.12,zc,L/2+.03,.12,hz+.03,31);return F;}
// a straight flight with a cheek wall on both sides (the axial east stair): from world A towards B, from y0 down until stop(y,x,z) or B; risers 0.2,
// treads 0.38, a 1.5 m landing between equal flights of at most 15 steps; cheek(x,z): false where a wall stands beside it instead (the slot), a number
// where the cheek retains a floor beside the flight (its top no lower than that, palBEnd)
// pv (R11): every tread (and landing) pv metres over the 0.2 sequence from y0 (stop still reads that sequence); 0.045 where it runs from a paved floor
// (paving at level +0.06) to another: the first riser 0.215, the last tread 1.5 cm under the lower paving, which covers its edge; rh: the riser (0.2)
function palFlight(W,g,A,B,y0,w,stop,cheek,pf,pv,rh){const RH=rh||.2;const L=Math.hypot(B[0]-A[0],B[1]-A[1]),ux=(B[0]-A[0])/L,uz=(B[1]-A[1])/L,F0=frame(A[0],0,A[1],Math.atan2(-uz,ux)),gy=W.gy;
  const run=mk=>{let s=0,y=y0,n=0,inF=0,nL=0;const pts=[];const per=mk||15;
    while(s<L-.4&&n<400){const x=A[0]+ux*s,z=A[1]+uz*s;if(stop(y,x,z))break;
      if(inF>=per){if(mk)blk(s,1.5,y,true,pts);s+=1.5;inF=0;nL++;continue;}
      y-=RH;if(mk)blk(s,.38,y,false,pts);s+=.38;n++;inF++;}
    return{s,y,n,nL,pts};};
  const blk=(s,len,yt,land,pts)=>{yt+=pv||0;const c=s+len/2;let yg=1e9;for(const a of[s,s+len])for(const b of[-w/2,w/2]){const q=F0.p(a,0,b);yg=Math.min(yg,gy(q[0],q[2]));}
    g.set(60,.5,1,0);box(g,F0,c,yg-.8,0,len/2+.01,yt-.12-yg+.8,w/2,31&~32);trimSet(g,1,.45);box(g,F0,c,yt-.12,0,len/2+.03,.12,w/2+.03,31);
    for(const sd of[1,-1]){const q=F0.p(c,0,sd*(w/2+.18)),ck=cheek?cheek(q[0],q[2]):true;if(!ck)continue;const ct=Math.max(yt+(land?1:.95),typeof ck==='number'?ck:-1e9);let yc=Math.min(gy(q[0],q[2]),yt)-.8;g.set(60,.5,1,0);box(g,F0,c,yc,sd*(w/2+.18),len/2+.01,ct-yc,.18,31);
      trimSet(g,1,.5);box(g,F0,c,ct,sd*(w/2+.18),len/2+.03,.08,.22,31);}
    const q=F0.p(c,0,0);pts.push([q[0],q[2],yt]);};
  if(pf)return run(pf);const d=run(0),per=Math.max(1,Math.ceil(d.n/Math.max(1,Math.ceil(d.n/15))));return run(per);}   // pf: flights of pf steps (a cut's ground follows them)
// the flights whose head landing reaches the end pier (round 4's new flights on the east and north slopes); the accepted ones (H1: the hemicycle, the south
// slope, ...) show the same slot by this measure (W.palStairStats.heads) and are left as they were
const PAL_HEAD_FILL=['v36aV','v30aV','v36bV','v30bV','v36pV','v30pV','v36qV','v30qV'];
// the B5 end pier terraceEdge stands where the parapet goes on beside an opening [oa, ob] in edge i of terrace id (sd +1: past ob, -1: before oa): the wall's
// samples are every L/round(L/2) m, those inside an opening (W.palOpen) are open, the pier is 1.4 m square, centred 0.45 m into the run that resumes, and
// stands 0.6 m out from the wall's face. Its face towards the opening (s), or null where no run resumes (the edge's end, another opening right on).
function palPierFace(W,id,i,oa,ob,sd){const e=palPlById(id).E[i];if(!e||e.k!=='w')return null;const ns=Math.max(2,Math.round(e.L/2)),st=e.L/ns,
    open=s=>(s>=oa&&s<=ob)||(W.palOpen||[]).some(o=>o[0]===id&&o[1]===i&&s>=o[2]&&s<=o[3]);
  let k=sd>0?Math.floor(ob/st+1e-9)+1:Math.ceil(oa/st-1e-9)-1;while(k>=0&&k<=ns&&open(k*st))k+=sd;if(k<0||k>ns||k+sd<0||k+sd>ns||open((k+sd)*st))return null;
  return k*st+sd*(.45-.7);}
function palPlatStairs(W){const g=new GB(1<<16),SP=W.palStairs=[],gy=W.gy,toW=p=>palW(p[0],p[1]),st={steps:0,landings:0};
  W.palOpen=[];   // [terrace id, edge, s0, s1]: the openings in the parapets at the stair heads
  const reg=(id,pts,w,top,lane)=>{const R=pts.map(p=>[p[0],p[1]]);R.corners=[];SP.push({id,pts:R,Y:pts.map(p=>p[2]),w,lane:!!lane});(W.hillStairs||(W.hillStairs=[])).push({R,w,top,pal:id,steps:0});};
  for(const S of PAL_PLAN.stairs){if(!S.legs)continue;const pts=[],w=S.w;
    {const[id,i,s0]=S.legs[0],P0=toW(palEdgePt(id,i,S.land?S.land[2]:s0,-1));pts.push([P0[0],P0[1],S.top]);}   // a point 1 m inside the terrace the stair leaves, at its floor (for the reach check)
    let y=S.top+(S.pave!=null?S.pave-.06:0),first=true;
    // R11 (the review of 2026-11-14): a flight along a wall, its inner side off-w/2 out from the wall line, reaches in to the wall (wx: that way and how far);
    // the head landing is 1.5 cm under the floor it leaves (the paving, P.y+.06, covers its edge) and reaches under that floor's edge
    const wx=(id,i,off)=>{const e=palPlById(id).E[i],p=toW([0,0]),q=toW([-e.nx,-e.nz]),gp=off-w/2;return gp>-.01&&gp<.75?{wall:[q[0]-p[0],q[1]-p[1]],ex:gp+.05}:null;};
    const P0=palPlById(S.legs[0][0]),pv=S.pave??.06,yH=P0&&Math.abs(P0.y-S.top)<.01?S.top+pv-.015:S.top;   // S.pave: the paving's height over the floor level at the head (0.08: the gate platform's slabs)
    if(S.land&&!W.palLand?.[S.land.join()]){const[id,i,s,len]=S.land,off=S.legs[0][4];palLanding(W,g,toW(palEdgePt(id,i,s-len/2,off)),toW(palEdgePt(id,i,s+len/2,off)),w,yH,wx(id,i,off));st.landings++;
      (W.palLand=W.palLand||{})[S.land.join()]=1;W.palOpen.push([id,i,s-len/2-.2,s+len/2+.2]);}
    for(let li=0;li<S.legs.length;li++){let[id,i,s0,s1,off]=S.legs[li];const e=palPlById(id).E[i],dir=Math.sign(s1-s0);
      // bridge (gLW, R10 乙): the flight runs off metres out from the wall (along a lower terrace's wall further out); a landing from the wall out to its head
      if(first&&S.bridge){const sm=s0+dir*.8;palLanding(W,g,toW(palEdgePt(id,i,sm,-.05)),toW(palEdgePt(id,i,sm,off-w/2+.05)),1.6,yH);st.landings++;}
      if(first&&!S.land){const oa=Math.min(s0,s0+dir*1.6)-.3,ob=Math.max(s0,s0+dir*1.6)+.3,pf=palPierFace(W,id,i,oa,ob,-dir);let sF=s0;
        if(pf!=null&&(pf-s0)*-dir>.02&&PAL_HEAD_FILL.includes(S.id)){sF=pf-dir*.05;(st.headFill||(st.headFill=[])).push([S.id,+Math.abs(pf-s0).toFixed(2)]);}const pp=palPierFace(W,id,i,oa,ob,dir);(st.heads||(st.heads=[])).push([S.id,id+':'+i,pf==null?null:+((pf-s0)*-dir).toFixed(2),pp==null?null:+((pp-(s0+dir*1.6))*dir).toFixed(2),sF!==s0]);   // per head: the slot to the end pier on the free side (before the fill) and on the flight's side   // the review of 2026-11-15 (the slot by v30aV): on its free side the landing reaches the end pier
        const a=toW(palEdgePt(id,i,sF,off)),b=toW(palEdgePt(id,i,s0+dir*1.6,off));palLanding(W,g,a,b,w,yH,wx(id,i,off));st.landings++;W.palOpen.push([id,i,oa,ob]);s0+=dir*1.6;}
      else if(!first){const a=toW(palEdgePt(id,i,s0,off)),b=toW(palEdgePt(id,i,s0+dir*1.5,off));palLanding(W,g,a,b,w,y,wx(id,i,off));st.landings++;s0+=dir*1.5;}   // the turn between two legs
      first=false;const A=toW(palEdgePt(id,i,s0,off)),B=toW(palEdgePt(id,i,s1,off)),dx=(B[0]-A[0]),dz=(B[1]-A[1]),l=Math.hypot(dx,dz)||1;
      const nw=(()=>{const p=toW([0,0]),q=toW([e.nx,e.nz]);return[q[0]-p[0],q[1]-p[1]];})(),sg=Math.sign(off)||1,side=sg*((-dz/l)*nw[0]+(dx/l)*nw[1])>0?-1:1;   // the parapet on the side away from the wall
      const r=edgeStair(W,g,[A,B],y,{w,side,pal:1,floorY:S.floor??undefined,...(wx(id,i,off)||{})});st.steps+=r.steps;st.landings+=r.landings;
      for(const p of r.pts)pts.push([p[0],p[1],NaN]);y=r.y;pts.push([r.end[0],r.end[1],y]);if(S.floor!=null&&y<=S.floor+.25)break;if(S.floor==null&&y<=gy(r.end[0],r.end[1])+.3)break;}
    // the treads' heights along the stair (edgeStair walks down at 0.2 per 0.38 m with landings; between the known ends linear is close enough for the checks)
    {const k=pts.map((p,j)=>j).filter(j=>!isNaN(pts[j][2]));for(let a=0;a<k.length-1;a++){const j0=k[a],j1=k[a+1];for(let j=j0+1;j<j1;j++)pts[j][2]=lerp(pts[j0][2],pts[j1][2],(j-j0)/(j1-j0));}}
    reg(S.id,pts,w,S.top);}
  // the axial stairs (B: the east stair, the north-east stair; C: the stair lanes between the north houses): palAxisStair
  for(const S of PAL_PLAN.stairs)if(S.axis)palAxisStair(W,g,S,st,reg);
  palWestStairs(W,g,st,reg);   // H2: between the west rings
  palR8Walk(W,g,st);
  palGateN(W,g,st,reg);   // 图四: the east palace's north gate
  palApolloS(W,g,st,reg);palClivG(W,g,st,reg);palMMEast(W,g,st,reg);palTibLane(W,g,st,reg);palSCFoot(W,g,st,reg);palVillaW1(W,g,st,reg);   // 图一 (and its way on down to the Clivus), 图七 east, 图三; R10 乙
  W.palStairStats=st;const m=layTag(g.mesh(MAT.city),'stairs');if(m){m.name='palPlatStairs';W.scene.add(m);}}

// H2 (the review of 2026-11-13): the stairs between the west rings (PAL_PLAN.west.stairs), as H1's stairs along a wall: a landing 1.6 m long at the head in
// front of the upper ring's wall (an opening in its parapet: W.palWestHeads), then one flight along the wall line, off metres out from it, down to the
// lower ring's floor, a cheek wall on the side away from the wall. end: the run's end ('A': its first segment's start, the lowest angle) the head is
// measured from; dir +1: the flight goes on along the wall from the head, -1: back past that end (the upper ring stops there, the flight goes on over the
// lower floor's inner edge). The Scalae Caci and the Magna Mater's stair cross 23 and the south stretch of 30 and land on their floors (stairGround).
function palWestStairs(W,g,st,reg){const L=PAL_PLAN.west&&PAL_PLAN.west.stairs;if(!L)return;const H=W.palWestHeads=[];
  for(const S of L){const segs=(W.palTerSegs||[]).filter(q=>q.west&&!q.gap&&q.yk===S.top&&q.k>=S.k[0]&&q.k<=S.k[1]).sort((a,b)=>a.k-b.k);if(!segs.length)continue;
    const sg=S.end==='A'?segs[0]:segs[segs.length-1],c=S.end==='A'?sg.oA:sg.oB,e=S.end==='A'?1:-1,ux=e*sg.ux,uz=e*sg.uz,nl=Math.hypot(sg.nx,sg.nz),nx=sg.nx/nl,nz=sg.nz/nl;
    const pt=(s,d)=>palW(c[0]+ux*s+nx*d,c[1]+uz*s+nz*d),[h0,h1]=S.head,w=S.w;
    palLanding(W,g,pt(h0,S.off),pt(h1,S.off),w,S.top);st.landings++;H.push({R:[pt(h0-.3,0),pt(h1+.3,0)],r:.4});
    const s0=S.dir>0?h1:h0,A=pt(s0,S.off),B=pt(s0+S.dir*30,S.off),dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz),o0=palW(0,0),o1=palW(nx,nz),nw=[o1[0]-o0[0],o1[1]-o0[1]];
    const side=((-dz/l)*nw[0]+(dx/l)*nw[1])>0?-1:1;   // the cheek on the side away from the wall
    const r=edgeStair(W,g,[A,B],S.top,{w,side,pal:1,floorY:S.floor});st.steps+=r.steps;st.landings+=r.landings;
    // walk: where the lower ring's floor begins further out than the flight's foot (the old rings do not meet: a strip of ground at about its level lies
    // between the upper wall and the lower floor), a landing from the foot out onto that floor
    let tail=[];if(S.walk){const se=S.dir>0?h1+S.dir*(r.pts.length?Math.hypot(r.end[0]-A[0],r.end[1]-A[1]):0):h0-Math.hypot(r.end[0]-A[0],r.end[1]-A[1]),a=pt(se-S.dir*w/2,S.off+w/2),b=pt(se-S.dir*w/2,S.off+S.walk);
      palLanding(W,g,a,b,w,r.y);st.landings++;tail=[[b[0],b[1],r.y]];}
    const hm=(h0+h1)/2,pts=[[...pt(hm,.8),S.top],[...pt(hm,S.off),S.top],...r.pts.map(p=>[p[0],p[1],NaN]),[r.end[0],r.end[1],r.y],...tail];   // the first point: on the upper floor's footprint, at its level
    {const k=pts.map((p,j)=>j).filter(j=>!isNaN(pts[j][2]));for(let a=0;a<k.length-1;a++){const j0=k[a],j1=k[a+1];for(let j=j0+1;j<j1;j++)pts[j][2]=lerp(pts[j0][2],pts[j1][2],(j-j0)/(j1-j0));}}
    reg(S.id,pts,w,S.top);(st.west||(st.west={}))[S.id]={steps:r.steps,to:+r.y.toFixed(2)};}}
// 图四 (the review of 2026-11-13): the east palace's north gate (the Transitoria's gate in its terrace B's north wall, on the palace's axis lx 73.3, B's
// floor 51.82) down to the north belt and on to the foot:
// - the grand stair, 8 m between cheek walls, from the gate (lz -121.1) down to the gate platform (42), 49 risers in four flights; it bridges the lane
//   behind the houses on a segmental vault (the treads' bases stop over it: W.gy is lifted there while palFlight builds); a planting strip 2.2 m wide
//   along each cheek on the platform (cypresses and box), so the stair stands clear of the houses and the belt garden;
// - slab paving over the gate platform and the front of the gate garden; the exedra in the platform's front wall (palatine-plan.js gArc) with a wall
//   fountain as the hemicycle garden's, a size smaller: an aedicula (podium, pilasters, a dark niche with a statue, entablature, pediment), a basin;
// - the central flight, 6 m, in the gate garden's slot from 39 down to the terrace 34 (25 risers, two flights), towards the exedra; a landing at its foot.
// The paired flights (42-39 along the platform's front wall, 34-26 along the garden walls) are PAL_PLAN.stairs gUW, gUE, gLW, gLE. W.palNoButt: no
// buttress on the gate garden's front walls (the walk along their foot to the lower flights is 3.3 m).
function palGateN(W,g,st,reg){const ax=73.3,yB=51.82,yb=PAL_PLAN.levels.belt,toW=p=>palW(p[0],p[1]),gy0=W.gy,w=8,hw=w/2+.36,yF=yb+.06;
  const arcPts=[];for(let a=15;a<=165;a+=15){const t=a*Math.PI/180;arcPts.push([+(ax+4*Math.cos(t)).toFixed(2),+(-155.5+4*Math.sin(t)).toFixed(2)]);}   // as gArc
  // the grand stair; its blocks as palFlight lays them (the vault spans whole treads)
  const A=toW([ax,-121.1]),B=toW([ax,-150]),L=Math.hypot(B[0]-A[0],B[1]-A[1]),ux=(B[0]-A[0])/L,uz=(B[1]-A[1])/L,F0=frame(A[0],0,A[1],Math.atan2(-uz,ux)),stop=y=>y<=yb+.05,blk=[];
  {let y=yB,n=0;while(!stop(y)&&n<200){y-=.2;n++;}const per=Math.max(1,Math.ceil(n/Math.max(1,Math.ceil(n/15))));let s=0,inF=0;y=yB;
    while(!stop(y)&&blk.length<400){if(inF>=per){blk.push([s,1.5]);s+=1.5;inF=0;continue;}y-=.2;blk.push([s,.38]);s+=.38;inF++;}}
  const sN=-121.1+124.67,sS=-121.1+130;let sA=1e9,sB=-1e9;for(const[s,l]of blk)if(s>=sN-1e-6&&s+l<=sS+1e-6){sA=Math.min(sA,s);sB=Math.max(sB,s+l);}   // the lane: the rock's edge to the houses' backs
  const yV=46.8,yC=yV-.8;
  W.gy=(x,z)=>{const dx=x-A[0],dz=z-A[1],s=dx*ux+dz*uz,c=-dx*uz+dz*ux;return s>sA-1e-3&&s<sB+1e-3&&Math.abs(c)<w/2+1?yV:gy0(x,z);};
  let r;try{r=palFlight(W,g,A,B,yB,w,stop);}finally{W.gy=gy0;}
  st.steps+=r.n;st.landings+=r.nL;
  {const P0=toW([ax,-120.1]),pts=[[P0[0],P0[1],yB],...r.pts],e=r.pts[r.pts.length-1];for(const d of[.6,1.6])pts.push([e[0]+ux*d,e[1]+uz*d,yb]);reg('gateN',pts,w,yB);W.hillStairs[W.hillStairs.length-1].net=false;
    (st.ends||(st.ends={})).gateN=[...palL(e[0],e[1]).map(v=>+v.toFixed(1))];}
  // the vault over the lane: a segmental barrel (rise 1.6) across the lane, its crown at the treads' bases, a travertine ring on both faces
  {const f=1.6,a=(sB-sA)/2,sm=(sA+sB)/2,R=(a*a+f*f)/(2*f),yc=yC-R,n=10,S=[];for(let k=0;k<=n;k++){const s=sA+(sB-sA)*k/n;S.push([s,yc+Math.sqrt(Math.max(0,R*R-(s-sm)**2))]);}
    const ac=[-uz,ux],out=(q,k)=>[sm+(q[0]-sm)*k,yc+(q[1]-yc)*k];
    for(let k=0;k<n;k++){const[s0,y0]=S[k],[s1,y1]=S[k+1],ns=-((s0+s1)/2-sm)/R,ny=-((y0+y1)/2-yc)/R;
      g.set(60,.42,1,0);g.poly([F0.p(s0,y0,-hw),F0.p(s1,y1,-hw),F0.p(s1,y1,hw),F0.p(s0,y0,hw)],[ns*ux,ny,ns*uz]);
      for(const sd of[1,-1]){const nn=[sd*ac[0],0,sd*ac[1]];g.set(60,.5,1,0);g.poly([F0.p(s0,y0,sd*hw),F0.p(s1,y1,sd*hw),F0.p(s1,yC,sd*hw),F0.p(s0,yC,sd*hw)],nn);
        const k1=(R+.45)/R,o0=out(S[k],k1),o1=out(S[k+1],k1);trimSet(g,1,.45);g.poly([F0.p(s0,y0,sd*(hw+.03)),F0.p(s1,y1,sd*(hw+.03)),F0.p(o1[0],Math.min(o1[1],yC+.45),sd*(hw+.03)),F0.p(o0[0],Math.min(o0[1],yC+.45),sd*(hw+.03))],nn);}}
    st.gateVault={span:+(sB-sA).toFixed(2),spring:+(yc+Math.sqrt(R*R-a*a)).toFixed(2),crown:yC};}
  // the planting strips along the cheeks on the platform: a travertine kerb, lawn, a cypress every 3 m or so with box between
  {const a0=-121.1+131.8,e=blk[blk.length-1],a1=e[0]+e[1]-.2,cs=(a0+a1)/2,hl=(a1-a0)/2;
    for(const sd of[1,-1]){const bc=sd*(hw+.05+1.1);trimSet(g,1,.5);
      for(const[cx,cz,hx,hz]of[[cs,bc-.98,hl,.12],[cs,bc+.98,hl,.12],[a0+.12,bc,.12,.86],[a1-.12,bc,.12,.86]])box(g,F0,cx,yF-.06,cz,hx,.3,hz,31);
      g.set(23,.4);g.poly([F0.p(a0+.24,yF+.2,bc-.86),F0.p(a1-.24,yF+.2,bc-.86),F0.p(a1-.24,yF+.2,bc+.86),F0.p(a0+.24,yF+.2,bc+.86)],[0,1,0]);
      const nt=Math.max(2,Math.round((a1-a0-1.2)/3.1)),d=(a1-a0-1.2)/nt;
      for(let j=0;j<=nt;j++){const p=F0.p(a0+.6+d*j,0,bc);W.trees.push([p[0],yF+.2,p[2],'cyp',.85+.2*teH(p[0],p[2],91),null,1]);
        if(j<nt){const m=F0.p(a0+.6+d*(j+.5),0,bc);W.trees.push([m[0],yF+.2,m[2],'shrub',.5+.12*teH(m[0],m[2],92),null,1]);}}}
    st.gateStrips=+(2*hl).toFixed(1);}
  // slab paving: the gate platform (61.25-85.35, from the lane to its front wall round the exedra) and the gate garden's front (to -158.6, not the slot)
  {const pave=(Q,y)=>{const ix=THREE.ShapeUtils.triangulateShape(Q.map(p=>new THREE.Vector2(p[0],p[1])),[]);g.set(60,.4,1,3);for(const[i,j,k]of ix)g.poly([PFR.p(Q[i][0],y,Q[i][1]),PFR.p(Q[j][0],y,Q[j][1]),PFR.p(Q[k][0],y,Q[k][1])],[0,1,0]);};
    pave([[61.25,-131.5],[85.35,-131.5],[85.35,-155.5],[77.3,-155.5],...arcPts,[69.3,-155.5],[61.25,-155.5]],yF+.02);
    pave([[61.25,-155.5],[69.3,-155.5],...arcPts.slice().reverse(),[77.3,-155.5],[85.35,-155.5],[85.35,-158.6],[76.3,-158.6],[76.3,-157.3],[70.3,-157.3],[70.3,-158.6],[61.25,-158.6]],39.08);}
  // the exedra's wall fountain: local x out of the wall (towards the slot, -lz), z along it (+lx); the wall's face leans out 4 % to its foot
  {const yG=39.06,F=PFR.sub(ax,0,-151.5,Math.PI/2),yE=yG+2.55;
    trimSet(g,1,.5);box(g,F,.58,yG-.06,0,.46,.7,1.9,31);   // the podium
    for(const z of[-1.45,1.45])box(g,F,.62,yG+.64,z,.26,yE-yG-.64,.27,31&~32);   // the pilasters
    g.set(60,.5,1,1);box(g,F,.36,yG+.64,0,.05,yE-yG-.64,1.2,31&~32);g.set(61,.18,1,0);box(g,F,.42,yG+.9,0,.04,1.75,.8,2);   // the panel behind, the niche
    trimSet(g,1,.45);box(g,F,.64,yE,0,.32,.44,1.95,31);   // the entablature
    {const yp=yE+.44,yt=yp+.8,x0=.32,x1=.96;g.poly([F.p(x1,yp,-1.98),F.p(x1,yp,1.98),F.p(x1,yt,0)],F.d(1,0,0));for(const sg of[-1,1])g.poly([F.p(x1,yp,sg*1.98),F.p(x0,yp,sg*1.98),F.p(x0,yt,0),F.p(x1,yt,0)],F.d(0,1.98,sg*.8));}   // the pediment
    pedestalStatue(g,F,.62,0,yG+.64,1.7,{gilt:false});
    g.set(2,.5);box(g,F,1.08,yG+.56,0,.14,.1,.12,31);   // the spout's lip
    const b=F.p(2.15,0,0);fountain(W,g,b[0],b[2],{y:yG-.01,rot:F.rot,hx:1.1,hz:1.8,statue:0});}
  // the central flight: in the slot (70.3-76.3) from the gate garden's front (39, -157.3) down to 34, then a landing to the terrace 34
  {const C0=toW([ax,-157.3]),C1=toW([ax,-170.3]),rc=palFlight(W,g,C0,C1,39,6,y=>y<=34.05,()=>false,0,.045);st.steps+=rc.n;st.landings+=rc.nL;
    const e=rc.pts[rc.pts.length-1],[elx,elz]=palL(e[0],e[1]),L0=toW([ax,elz-.19]),L1=toW([ax,-170.7]);palLanding(W,g,L0,L1,6,34.045);st.landings++;
    const H=toW([ax,-156.3]),pts=[[H[0],H[1],39],...rc.pts];for(const t of[0,.5,1])pts.push([lerp(L0[0],L1[0],t),lerp(L0[1],L1[1],t),34]);const T=toW([ax,-172]);pts.push([T[0],T[1],34]);
    reg('gateC',pts,6,39);W.hillStairs[W.hillStairs.length-1].net=false;(st.ends||(st.ends={})).gateC=[ax,-170.7];}
  (W.palNoButt=W.palNoButt||[]).push([61.25,85.35,-171,-169.6]);}
// 图一 (the review of 2026-11-13): the planned stair from the opening in the Apollo's lower south terrace (the model: x 7.5-11.5, piers either side, the wall
// top paved at the lower floor's level, its outer edge at lz 128.86) straight down the axis of the opening (lx 46.5), 4 m between cheek walls, to the south belt (42): three flights,
// two landings; through the filled hollow (gApS), which is planted either side of it (a laurel each side of the stair, Apollo's tree, box beds along it).
// On the belt the Clivus stair clivG goes on down. The old route down the slope from the Apollo (grandStair in monuments.js) is gone; its ground stays
// reserved there, so the houses round the foot do not move.
function palApolloS(W,g,st,reg){const ax=46.5,toW=p=>palW(p[0],p[1]),y0=50.61,yb=PAL_PLAN.levels.belt,yE=yb+.045,nR=Math.round((y0-yE)/.2),rh=(y0-yE)/nR;
  // R11 (the review of 2026-11-14): from the opening's paving, level with the lower floor (50.6 + 1 cm; the model's coping stops there, rome_apollo.py
  // lower_south_wall), nR equal risers down to 1.5 cm under the belt's paving
  const A=toW([ax,129]),B=toW([ax,170]),r=palFlight(W,g,A,B,y0,4,y=>y<=yE+.005,undefined,0,0,rh);   // from the lower floor's edge (the model's y -55: its paving reaches over the wall's outer face to there)st.steps+=r.n;st.landings+=r.nL;
  const P0=toW([ax,127.9]),e=r.pts[r.pts.length-1],L=Math.hypot(B[0]-A[0],B[1]-A[1]),ux=(B[0]-A[0])/L,uz=(B[1]-A[1])/L,pts=[[P0[0],P0[1],y0],...r.pts];
  for(const d of[.6,1.6])pts.push([e[0]+ux*d,e[1]+uz*d,yb]);reg('apolloS',pts,4,y0);(st.ends||(st.ends={})).apolloS=[...palL(e[0],e[1]).map(v=>+v.toFixed(1))];
  st.apolloS={risers:r.n,landings:r.nL,foot:st.ends.apolloS};}
// the planting either side of that stair on the fill (palPlatWalls, after the walls: none in a pier's square, palInPier; gApS:3's took the box bed): the
// Apollo model's rock ledge (top about 47) covers the fill up to lz 135.5 west of the stair and 137.5 east of it, so on the open strip in front of it: a
// laurel (dark broad crown) in a stone box each side, and a box bed west of the west one
function palApolloSPlant(W,g){const yF=PAL_PLAN.levels.belt+.06;
  for(const[lx,lz,hb]of[[41.6,138.4,1.5],[51.8,139.0,1.2]]){if(palInPier(W,lx,lz))continue;const q=PFR.p(lx,0,lz),k=teH(q[0],q[2],95),F=frame(q[0],0,q[2],PALF.rot),c=hb-.14;
    trimSet(g,1,.5);box(g,F,0,yF-.06,0,hb,.3,hb,31);g.set(23,.4);g.poly([F.p(-c,yF+.245,-c),F.p(c,yF+.245,-c),F.p(c,yF+.245,c),F.p(-c,yF+.245,c)],[0,1,0]);
    W.trees.push([q[0],yF+.24,q[2],'broad',.56+.1*k,[.035,.07,.028],1]);}
  if(!palInPier(W,38.2,138.4))palBoxBed(W,g,38.2,138.4,yF,0,1.2,.6);}
// the Clivus stair (PAL_CLIVG): head landing out of an opening in beltS's east parapet, flight 1 north (its cheek only on the open side, the belt wall on the
// other), the turning landing across both flights, flight 2 south between cheek walls to the road's head; a retaining wall round the dug landing's two
// uphill sides, its top 0.3 m over the ground behind it (at least a parapet's height over the landing)
function palClivG(W,g,st,reg){const C=PAL_CLIVG,toW=p=>palW(p[0],p[1]),{zL0,zL1}=palClivGZ(),E=palPlById('beltS').E[4],s0=E.a[1];
  const H0=toW([C.x1,C.zH]),H1=toW([C.x1,C.zF1]);palLanding(W,g,H0,H1,C.w,C.yT);st.landings++;W.palOpen.push(['beltS',4,C.zF1-s0-.3,C.zH-s0+.3]);
  {const xo=C.x1+C.w/2;g.set(60,.5,1,0);box(g,PFR,xo-.18,C.yT-.5,(C.zH+C.zF1)/2,.18,1.5,(C.zH-C.zF1)/2,31);box(g,PFR,(C.wall+xo)/2,C.yT-.5,C.zH-.18,(xo-C.wall)/2,1.5,.18,31);
    trimSet(g,1,.5);box(g,PFR,xo-.18,C.yT+1,(C.zH+C.zF1)/2,.22,.08,(C.zH-C.zF1)/2+.04,31);box(g,PFR,(C.wall+xo)/2,C.yT+1,C.zH-.18,(xo-C.wall)/2,.08,.22,31);}   // the head landing's parapets (it stands 12 m over the slope)
  const r1=palFlight(W,g,H1,toW([C.x1,zL0]),C.yT,C.w,y=>y<=C.yL+.01,(x,z)=>palL(x,z)[0]>C.wall+.6);st.steps+=r1.n;st.landings+=r1.nL;
  const zm=(zL0+zL1)/2,La=toW([C.x1-C.w/2,zm]),Lb=toW([C.x2+C.w/2,zm]);palLanding(W,g,La,Lb,zL1-zL0,C.yL);st.landings++;
  const r2=palFlight(W,g,toW([C.x2,zL1]),toW([C.x2,zL1+12]),C.yL,C.w,y=>y<=C.yF+.01);st.steps+=r2.n;st.landings+=r2.nL;
  {const x0=C.x1-C.w/2,x1=x0+1.6;g.set(60,.5,1,0);box(g,PFR,(x0+x1)/2,C.yL-.2,zL0+.25,(x1-x0)/2,.6,.25,31);trimSet(g,1,.5);box(g,PFR,(x0+x1)/2,C.yL+.4,zL0+.28,(x1-x0)/2+.03,.07,.3,31);}   // a stone bench in the landing's corner under the two walls (the 3 m terrain mesh rises 0.2 m there)
  // the retaining wall round the landing's north and east sides (east: on the line of flight 2's east cheek), in 1.2 m pieces
  const xe=C.x2+C.w/2+.36,piece=(cx,cz,hx,hz,ox,oz)=>{const q=PFR.p(cx+ox,0,cz+oz),t=Math.max(C.yL+1,W.gy(q[0],q[2])+.3);g.set(60,.5,1,0);box(g,PFR,cx,C.yL-1,cz,hx,t-C.yL+1,hz,31);trimSet(g,1,.5);box(g,PFR,cx,t,cz,hx+.04,.08,hz+.04,31);return t;};
  const go=C.d1+.6;let cut=0;{const n=Math.ceil((xe-C.wall)/1.2),d=(xe-C.wall)/n;for(let i=0;i<n;i++)cut=Math.max(cut,piece(C.wall+d*(i+.5),zL0-.18,d/2,.18,0,-go)-.3-C.yL);}
  {const n=Math.ceil((zL1-zL0)/1.2),d=(zL1-zL0)/n;for(let i=0;i<n;i++)cut=Math.max(cut,piece(xe-.18,zL0+d*(i+.5),.18,d/2,go,0)-.3-C.yL);}
  const P0=toW([C.wall-1,(C.zH+C.zF1)/2]),Hm=toW([C.x1,(C.zH+C.zF1)/2]),M1=toW([C.x1,zm]),M2=toW([C.x2,zm]),e=r2.pts[r2.pts.length-1],[ex,ez]=palL(e[0],e[1]);
  const tail=[[C.x2,ez+.9],[C.x2+2,ez+1],[C.x2+4,ez+1]].map(p=>{const q=toW(p);return[q[0],q[1],W.gy(q[0],q[1])];});
  reg('clivG',[[P0[0],P0[1],C.yT],[Hm[0],Hm[1],C.yT],...r1.pts,[M1[0],M1[1],C.yL],[M2[0],M2[1],C.yL],...r2.pts,...tail],C.w,C.yT);
  (st.ends||(st.ends={})).clivG=[+ex.toFixed(1),+ez.toFixed(1)];
  st.clivG={risers:[r1.n,r2.n],landing:C.yL,lz:[+zL0.toFixed(2),+zL1.toFixed(2)],cut:+cut.toFixed(2),foot:[+ex.toFixed(1),+ez.toFixed(1),+e[2].toFixed(2)],ground:+W.gy(e[0],e[1]).toFixed(2)};}
// 图七 east, option 甲 (the review of 2026-11-13): from the opening at the east end of the Magna Mater's lower terrace (the model's south balustrade, x 23-27,
// its threshold at 48.6, lz 148.6) a stair straight down (lx -137.5), 4 m between cheek walls, three flights of 11 with two landings, to the walk (beltMM, 42)
// along the foot of the Victoria's rock, which goes on east to the Scalae Caci forecourt. Registered as two stairs for the checks: the flight, and the
// walk on to the forecourt (__palReach counts the forecourt as a floor).
function palMMEast(W,g,st,reg){const toW=p=>palW(p[0],p[1]),ax=-137.5,y0=48.6,yb=42;
  const A=toW([ax,148.6]),B=toW([ax,175]),r=palFlight(W,g,A,B,y0,4,y=>y<=yb+.05,0,0,.045);st.steps+=r.n;st.landings+=r.nL;   // R11: the last tread 1.5 cm under beltMM's paving
  const P0=toW([ax,147.6]),e=r.pts[r.pts.length-1],pts=[[P0[0],P0[1],y0],...r.pts];const F1=toW([ax,165.6]);pts.push([F1[0],F1[1],yb]);reg('mmEast',pts,4,y0);W.hillStairs[W.hillStairs.length-1].net=false;
  const wk=[[ax,166.4],[-130,166.8],[-122,166.9],[-119.5,167.2],[-116,171]].map(p=>{const q=toW(p);return[q[0],q[1],yb];});reg('mmWalk',wk,1,yb);W.hillStairs[W.hillStairs.length-1].net=false;   // net:false: not on the temple network (templeNet), so templeLinks keeps the stair down from the temple's front that it built before
  st.mmEast={risers:r.n,landings:r.nL,foot:[...palL(e[0],e[1]).map(v=>+v.toFixed(1))]};}
// 图三 (the review of 2026-11-13): the stairs at the two ends of the lane south of the Tiberiana (sumL, 54.85): from the lane south up beside the ends of the
// courtyard block b to the paved strips beside it (the palace's south strip, PAL_ZONES[0]), up to the plateau's paving level (palLaneEnd), 2.8 m between
// cheek walls, and a slab apron at the top, 2.5 m long or on until the ground across it comes within 0.25 m of its paving (8 m at most)
function palTibLane(W,g,st,reg){const toW=p=>palW(p[0],p[1]),yL=PAL_LANE_TOE.yL,o=st.tibLane={},Bf=palBL.find(B=>B.t==='bf');
  for(const[k,lx]of[['east',-96.8],['west',-163.2]]){const L=palLaneEnd(lx),yT=L.yT,bs=Math.sign(Bf.lx-lx);   // bs: towards block b
    const T=toW([lx,L.top]),E=toW([lx,20]),r=palFlight(W,g,T,E,yT,2.8,y=>y<=yL+.05,(x,z)=>(palL(x,z)[0]-lx)*bs>0?Bf.y+PAL_BEND.low:true,0,0,L.rh);st.steps+=r.n;st.landings+=r.nL;   // the cheek on b's side: the strip's low wall (palBEnd)
    let aL=2.5;if(!palPlById(k==='east'?'tlE':'tlW'))for(;aL<8;aL+=.5){let lo=1e9;for(const d of[-1.75,0,1.75]){const q=toW([lx+d,L.top+aL]);lo=Math.min(lo,W.gy(q[0],q[1]));}if(lo>=yT-.25)break;}
    const T2=toW([lx,L.top+aL]);palLanding(W,g,T,T2,3.5,yT);st.landings++;   // option 甲 (round 4): with the head's floor (tlE, tlW) the apron stays 2.5 m
    const hf=palPlById(k==='east'?'tlE':'tlW');if(hf)o[k+'Strip']=palBEnd(W,g,lx,bs,Bf,L.top+aL,Math.max(...hf.pts.map(p=>p[1])),hf.y);
    const I=toW([lx,27]),pts=[[T2[0],T2[1],yT],[T[0],T[1],yT],...r.pts,[I[0],I[1],yL]];reg('tibLane'+k[0].toUpperCase(),pts,2.8,yT);W.hillStairs[W.hillStairs.length-1].net=false;
    const out=Math.sign(lx+130),pn=[[lx+5*out,45],[lx,46]].map(p=>{const q=toW(p);return W.gy(q[0],q[1]);});
    o[k]={risers:r.n,rh:+L.rh.toFixed(3),landings:r.nL,top:+yT.toFixed(2),apron:aL,ground:+W.gy(T2[0],T2[1]).toFixed(2),at:[lx,+(L.top+aL).toFixed(1)],plateau:PAL_LANE_TOE.plateau[lx],plateauNow:pn.map(v=>+v.toFixed(2))};}
  {const T=PAL_LANE_TOE,y=yL;g.set(60,.4,1,3);box(g,PFR,(T.x0+T.x1)/2,y-.3,(T.z0+T.z1)/2,(T.x1-T.x0)/2,.3,(T.z1-T.z0)/2,31);}}   // the paving on to block b's house fronts (PAL_LANE_TOE)
// Round 4 (the reviewer, 11-15, item 1: "the ends should not show foundation", option 2): along each end of the flat block b, between its end wall (30 m out
// from its axis) and the lane stair's cheek, the stair's apron and the head floor's wall (tlE, tlW), a strip paved flush with b's floor (B.y, the plaza's
// 56.4) from b's back wall (lz 30.64, a tread line of both stairs) to its front (47.85). A solid block (path rules 15.5), not a ground hold: the ground
// under it is masked (15.1, groundMaskQuad), 0.15 m into b's wall, the cheek, the apron and the wall. Its low wall on the stair's side is the cheek itself
// (palFlight's cheek on b's side kept 0.45 m over the strip, with its coping: low as far up as the treads rise to it, then the cheek as before). Its open
// end over the lane (b's back wall line, 1.55 m over the lane's paving) is closed by a solid stone parapet (path rules 6 and the table: 0.95 m high with its
// coping, 0.35 m thick; the reviewer, 11-15: PAL_BEND.endWall, the cheek stays low), ended at the cheek on a square pier 0.56 m (its faces flush with the
// cheek's face to the stair and the parapet's face to the lane, its cap over the coping), not mitred into it. Past the head floor (its south edge, z2) its wall goes on to
// b's front in the same section (M3 coping 0.9 m deep, its top the head floor's + 0.1), retaining the ground outside, which rises to the plaza. At the strip's
// mouth the plaza's paving (palStrips: the ground + 0.13) comes up to it 0.07-0.4 m over the strip as the plateau rises to the east: a threshold stone at
// the paving's level to the paving's next slab line (PAL_BEND.sill), its face down to the strip. The strips are listed in W.palPads (__palBaseCheck reads them
// as the level outside b's ends); palStrips lays no slab on them, the wall or the threshold (palBEndRect).
const PAL_BEND={back:30.64,front:47.85,sill:48.5,wall:30,low:.45,endWall:.95,endT:.35,pier:.56};
const palBEndRect=(B,c)=>{const bs=Math.sign(B.lx-c),xw=B.lx-bs*PAL_BEND.wall,xo=c+bs*1.4-bs*.7;return[Math.min(xw,xo),Math.max(xw,xo),PAL_BEND.back,PAL_BEND.sill-.01];};   // x to the wall's coping, on the slabs' 0.5 m lines
function palBEnd(W,g,lx,bs,B,z1,z2,yH){const E=PAL_BEND,y=B.y,xw=B.lx-bs*E.wall,xc=lx+bs*1.76,xt=lx+bs*1.4,
    lo=(x0,x1,z0,z1)=>{let m=1e9;for(let x=x0;x<=x1+1e-6;x+=.25)for(let z=z0;z<=z1+1e-6;z+=.5){const q=palW(x,z);m=Math.min(m,W.gy(q[0],q[1]));}return m;},
    rx=(a,b)=>[Math.min(a,b),Math.max(a,b)],
    blk=(a,b,z0,z1)=>{const[x0,x1]=rx(a,b),yb=lo(x0,x1,z0,z1)-.5;g.set(60,.5,1,0);box(g,PFR,(x0+x1)/2,yb,(z0+z1)/2,(x1-x0)/2,y-.12-yb,(z1-z0)/2,31&~32);
      g.set(60,.35,1,3);box(g,PFR,(x0+x1)/2,y-.12,(z0+z1)/2,(x1-x0)/2,.12,(z1-z0)/2,31);(W.palPads=W.palPads||[]).push({id:'bEnd'+(bs<0?'E':'W'),x0,x1,z0,z1,y});},
    mq=(a,b,z0,z1)=>{const[x0,x1]=rx(a,b);groundMaskQuad(W,[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(p=>palW(p[0],p[1])));},
    wallTo=(a,b,z0,z1,top,ov,ct)=>{const[x0,x1]=rx(a,b),yb=lo(x0,x1,z0,z1)-.8,yt=top-ct;g.set(60,.5,1,0);box(g,PFR,(x0+x1)/2,yb,(z0+z1)/2,(x1-x0)/2,yt-yb,(z1-z0)/2,31);
      trimSet(g,1,.5);box(g,PFR,(x0+x1)/2,yt,(z0+z1)/2,(x1-x0)/2+ov,ct,(z1-z0)/2+ov,31);};   // a wall from under the ground to top, its coping ct thick, ov over each face
  blk(xw,xc,E.back,E.front);blk(xc,xt,z1,E.front);   // b's end wall to the cheek and the apron; past the apron on to the head floor's wall
  mq(xw+bs*.15,xc-bs*.15,E.back,E.front);mq(xc,xt-bs*.15,z1,z2);mq(xc,xt,z2,E.front);   // the ground masked under it, 0.15 m on under b's wall, the cheek, the apron and the head floor
  wallTo(xw,xc,E.back,E.back+E.endT,y+E.endWall,.04,.08);   // its open end over the lane: the parapet from b's end wall to the cheek
  wallTo(xt,xt+bs*E.pier,E.back,E.back+E.pier,y+E.endWall+.12,.04,.12);   // the square pier at the cheek, its cap 0.12 over the parapet's coping
  {const yW=yH-.35,[x0,x1]=rx(xt,xt-bs*.65),yb=lo(x0,x1,z2,E.front)-.8,[c0,c1]=rx(xt+bs*.25,xt-bs*.65);   // the head floor's wall on from z2 to b's front
    g.set(60,.5,1,0);box(g,PFR,(x0+x1)/2,yb,(z2+E.front)/2,(x1-x0)/2,yW-yb,(E.front-z2)/2,31);trimSet(g,1,.45);box(g,PFR,(c0+c1)/2,yW,(z2+E.front)/2,(c1-c0)/2,.45,(E.front-z2)/2,31);}
  {const[x0,x1]=rx(xw,xt-bs*.7),n=Math.ceil((x1-x0)/.25),za=E.front,zb=E.sill,P=(x,yy,z)=>PFR.p(x,yy,z),h=(x,z)=>{const q=palW(x,z);return Math.max(y,W.gy(q[0],q[1])+.13);},nz=PFR.d(0,0,-1),nb=PFR.d(0,0,1);
    trimSet(g,1,.45);let hi=0;   // the threshold
    for(let i=0;i<n;i++){const a=x0+(x1-x0)*i/n,b=x0+(x1-x0)*(i+1)/n,ya=h(a,za),yb=h(b,za),ya2=h(a,zb),yb2=h(b,zb);hi=Math.max(hi,ya-y,yb-y);
      g.poly([P(a,ya2,zb),P(b,yb2,zb),P(b,yb,za),P(a,ya,za)],[0,1,0]);g.poly([P(a,y-.12,za),P(b,y-.12,za),P(b,yb,za),P(a,ya,za)],nz);g.poly([P(a,ya2-.3,zb),P(b,yb2-.3,zb),P(b,yb2,zb),P(a,ya2,zb)],nb);}
    for(const[x,s]of[[x0,-1],[x1,1]])g.poly([P(x,y-.12,za),P(x,y-.12,zb),P(x,h(x,zb),zb),P(x,h(x,za),za)],PFR.d(s,0,0));
    E.hi=+hi.toFixed(2);}
  return{y,x:[+xw.toFixed(2),+xc.toFixed(2),+xt.toFixed(2)],z:[E.back,z1,z2,E.front],sillRise:E.hi};}
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
// the Scalae Caci's foot (round 4, the reviewer's queue; R8): the hill stair (W.palSC) ends on the slope's toe short of the valley street; from its last
// tread on along its axis to the first street cell: a paved ramp (the drop left over after the steps, spread evenly: 2-3 %) broken by up to four low
// steps (0.15 m) where the ground falls faster, each placed where the paving after it stays 4 cm over the highest ground inside the kerbs for the next 1.5 m
// (that ground held level across, palSCHold); a travertine kerb 0.15 m high along both sides (a low wall where the ground outside is higher), the stair's width (PAL_SC.w) between them. No footprint: the strip is already open ground (the stair's
// reserve). 【史】The Scalae Caci came down the Palatine's south-west corner into the valley of the Circus Maximus (Plutarch, Romulus 20.4: Romulus lived
// by the "steps of the fair shore", near the way down from the Palatium into the Circus Maximus; Solinus 1.18).
// the ramp's last 2 m (review of 8_scfoot, 2026-11-14: the colour seam where it meets the street): its paving and kerbs fade into the street's dirt colour
// (0 at sE - 2, 1 at the street, smoothstep); palQuadW: a quad with its own A.w per corner (GB.poly gives one to the whole face), which palStone reads as that fade
const palSCFade=(s,sE)=>{const u=Math.min(1,Math.max(0,(s-sE+2)/2));return u*u*(3-2*u);};
function palQuadW(g,pts,want,w4){let n=nrm(pts[0],pts[1],pts[2]);if(n[0]*want[0]+n[1]*want[1]+n[2]*want[2]<0){pts=pts.slice().reverse();w4=w4.slice().reverse();n=[-n[0],-n[1],-n[2]];}
  g.grow(g.nv+4,g.ni+6);const b=g.nv;pts.forEach((p,j)=>{const t=autoUV(p,n);g.vtx(p,n[0],n[1],n[2],t[0],t[1],0,w4[j]);});
  for(const k of[1,2]){g.ix[g.ni++]=b;g.ix[g.ni++]=b+k;g.ix[g.ni++]=b+k+1;}}
function palBoxW(g,F,cx,y0,cz,hx,h,hz,faces,kA,kB){const y1=y0+h,q=(xs,ys,zs,want)=>palQuadW(g,xs.map((x,i)=>F.p(cx+x,ys[i],cz+zs[i])),want,xs.map(x=>-(x<0?kA:kB)));   // box() with the fade: kA at -x, kB at +x
  if(faces&1)q([-hx,hx,hx,-hx],[y0,y0,y1,y1],[hz,hz,hz,hz],F.d(0,0,1));if(faces&2)q([hx,hx,hx,hx],[y0,y0,y1,y1],[hz,-hz,-hz,hz],F.d(1,0,0));
  if(faces&4)q([hx,-hx,-hx,hx],[y0,y0,y1,y1],[-hz,-hz,-hz,-hz],F.d(0,0,-1));if(faces&8)q([-hx,-hx,-hx,-hx],[y0,y0,y1,y1],[-hz,hz,hz,-hz],F.d(-1,0,0));
  if(faces&16)q([-hx,hx,hx,-hx],[y1,y1,y1,y1],[hz,hz,-hz,-hz],[0,1,0]);}
function palSCFoot(W,g,st,reg){const R=W.palSC;if(!R||!W.streetAt||typeof PAL_SC==='undefined')return;const h=(W.hillStairs||[]).find(t=>t.R===R);if(!h)return;
  const n=R.length,A=R[n-1],B=R[n-2],L=Math.hypot(A[0]-B[0],A[1]-B[1]),ux=(A[0]-B[0])/L,uz=(A[1]-B[1])/L,w=PAL_SC.w,gy=W.gy,F=frame(A[0],0,A[1],Math.atan2(-uz,ux)),DS=.25;
  const Y=hillStairHeights(W,R,h.top),y0=Y[Y.length-1];let sE=null;
  for(let s=.5;s<=20;s+=DS){const q=F.p(s,0,0);if(W.streetAt(q[0],q[2])){sE=s;break;}}
  if(sE==null){st.scFoot='no street within 20 m';return;}
  // hi: the highest ground under the paving (inside the kerbs) over a piece; the paving 4 cm over it from 0.5 m on (before that it is the stair's own foot,
  // its ground the last tread's: no lower than 3 cm under it); out: the ground just outside a kerb (a low wall there where it is higher than the kerb)
  const hi=s=>{let m=-1e9;for(const t of[s,s+DS])for(const v of[-w/2+.1,0,w/2-.1]){const q=F.p(t,0,v);m=Math.max(m,gy(q[0],q[2]));}return m;},clr=s=>s<.5?-.03:Math.min(.04,(sE-.5-s)*.04);
  // the end 5 mm under the street's ground where it starts (its paving lies a centimetre or two over it): the walk comes down onto the street, never up a lip; the clearance
  // over the (held, level across) ground tapers over its last metre, to 1 cm under it on the last piece, which lies into the street's paving
  const yE=(()=>{const q=F.p(sE,0,0);return gy(q[0],q[2])-.005;})(),D=y0-yE;let best=null;
  for(let nS=Math.min(4,Math.max(0,Math.floor((D-.02*sE)/.15)));nS>=0&&!best;nS--){const r=.15,a=Math.max(0,(D-nS*r)/sE),steps=[];let y=y0,ok=true,last=-9;const top=[];
    for(let s=0;s<sE-1e-6;s+=DS){if(steps.length<nS&&s-last>=1.2&&s>0){let fit=true;for(let t=s;t<Math.min(sE,s+1.5);t+=DS)if(y-r-a*(t-s)<hi(t)+clr(t)){fit=false;break;}if(fit){y-=r;steps.push(+s.toFixed(2));last=s;}}
      const yt=y-a*DS/2;if(yt<hi(s)+clr(s)-1e-3)ok=false;top.push([s,yt]);y-=a*DS;}
    if(ok&&steps.length===nS)best={nS,a,steps,top};}
  if(!best){const pr=[];for(let s=0;s<=sE;s+=1){const g3=[-w/2-.1,0,w/2+.1].map(v=>{const q=F.p(s,0,v);return+gy(q[0],q[2]).toFixed(2);});pr.push([s,...g3]);}
    st.scFoot={fail:'no fit',y0:+y0.toFixed(2),yE:+yE.toFixed(2),sE,ground:pr};return;}
  let walls=0;for(const[s,yt]of best.top){let lo=1e9;for(const t of[s,s+DS])for(const v of[-w/2-.2,w/2+.2]){const q=F.p(t,0,v);lo=Math.min(lo,gy(q[0],q[2]));}
    const yA=yt+best.a*DS/2,yB=yt-best.a*DS/2,P=(x,z,y)=>F.p(s+DS/2+x,y,z),hx=DS/2+.01,hz=w/2+.01;   // the paving's top slopes with the walk (flat pieces made 8 mm steps)
    g.set(60,.5,1,0);box(g,F,s+DS/2,lo-.4,0,DS/2+.005,yB-.08-lo+.4,w/2,31&~32);trimSet(g,1,.45);box(g,F,s+DS/2,yB-.08,0,hx,.08,hz,15);
    const kA=palSCFade(s,sE),kB=palSCFade(s+DS,sE),Q=[P(-hx,hz,yA+best.a*.01),P(hx,hz,yB-best.a*.01),P(hx,-hz,yB-best.a*.01),P(-hx,-hz,yA+best.a*.01)];
    if(kB>0)palQuadW(g,Q,F.d(best.a,1,0),[-kA,-kB,-kB,-kA]);else g.poly(Q,F.d(best.a,1,0));   // the last 2 m fade into the street's dirt (palStone, A.w < 0)
    for(const sd of[1,-1]){let go=-1e9;for(const t of[s,s+DS]){const q=F.p(t,0,sd*(w/2+.3));go=Math.max(go,gy(q[0],q[2]));}const kt=Math.max(yt+.15,go+.05);if(kt>yt+.151)walls++;
      trimSet(g,1,.5);if(kB>0)palBoxW(g,F,s+DS/2,lo-.3,sd*(w/2+.1),DS/2+.005,kt-lo+.3,.1,31,kA,kB);else box(g,F,s+DS/2,lo-.3,sd*(w/2+.1),DS/2+.005,kt-lo+.3,.1,31);}}   // the kerbs, a low wall where the ground outside is higher
  const pts=[[A[0],A[1],y0]];for(let k=4;k<best.top.length;k+=4){const[s,yt]=best.top[k],q=F.p(s+DS/2,0,0);pts.push([q[0],q[2],yt]);}
  {const q=F.p(sE+.6,0,0);pts.push([q[0],q[2],yE]);}
  reg('scFoot',pts,w,y0);W.hillStairs[W.hillStairs.length-1].net=false;
  st.scFoot={len:+sE.toFixed(2),drop:+D.toFixed(2),steps:best.steps,slope:+(best.a*100).toFixed(1)+' %',from:+y0.toFixed(2),to:+yE.toFixed(2),wallPieces:walls};}
// R10 乙 (round 4, the reviewer's decision of 2026-11-14; the house models of laughing-franklin's claude/domus-r10): from the 3 m opening in each house's
// W1 (model x -1.5..1.5; inside it the model's paved landing, y -14.45..-12.6, on T1 at the house floor - 3.4) down to the system's 36 (PAL_PLAN.villas'
// gardens): a landing in front of the opening (x -1.5..1.5, out to y -16.7, 1.5 cm under T1's paving, reaching 5 cm under the model's landing) and two
// flights along W1's face, west and east (2.2 m wide, 13 risers, treads 0.38; no cheek on W1's side), the last tread 1.5 cm under the 36's paving (R11).
// Registered from the house's middle on the belt (the house's own stair joins the belt to T1: the reach check) with the check's head at the model's landing
function palVillaW1(W,g,st,reg){const toW=p=>palW(p[0],p[1]),out=st.villaW1=[];
  for(const V of PAL_PLAN.villas){const P=palPlById(V.gardens);if(!P)continue;const t=((Math.round(V.turn/90)%4)+4)%4;
    const M=(x,y)=>t===0?[V.lx+x,V.lz-y]:t===1?[V.lx-y,V.lz-x]:t===2?[V.lx-x,V.lz+y]:[V.lx+y,V.lz+x],my=(lx,lz)=>t===0?V.lz-lz:t===1?V.lx-lx:t===2?lz-V.lz:lx-V.lx;
    const yT=V.y-3.4,yL=yT-.015,yB=P.y+.06-.015,w=2.2,yc=-14.5-w/2,RH=(yL-yB)/13;
    palLanding(W,g,toW(M(-1.5,yc+.025)),toW(M(1.5,yc+.025)),w+.05,yL);st.landings++;
    for(const sd of[-1,1]){const A=toW(M(sd*1.5,yc)),B=toW(M(sd*12,yc));
      const r=palFlight(W,g,A,B,yL,w,y=>y<=yB+.005,(x,z)=>{const[lx,lz]=palL(x,z);return my(lx,lz)<-14.6;},0,0,RH);st.steps+=r.n;
      const e=toW(M(sd*(1.5+r.n*.38+1),yc)),h=toW(M(0,0)),m=toW(M(0,-13.5)),l=toW(M(sd*.75,yc));
      reg('w1:'+V.gardens+(sd<0?'W':'E'),[[h[0],h[1],V.y],[m[0],m[1],yT],[l[0],l[1],yL],...r.pts,[e[0],e[1],P.y+.06]],w,V.y);W.palStairs[W.palStairs.length-1].hd=1;
      out.push({id:V.gardens+(sd<0?'W':'E'),steps:r.n,riser:+RH.toFixed(3),to:+(r.y).toFixed(3)});}}}
// 图七 (the review of 2026-11-13): the Magna Mater's lower terrace (its model's z -8) reaches the hill at its ends. West: the model's west stair (three
// flights, rome_magna_mater.py; its base below z -16.5 is built here) comes down to model (-38,-52) at z -16, 6 m over the shelf (33-35 m) between the temple and the viewing
// terrace; from its foot a landing (low walls on its open sides), then one straight flight like the east axial stair (palFlight: flights of at most 15
// steps, a cheek wall on both sides, every tread on a base down to the ground) onto the viewing terrace's floor (30) near its south end, where the
// w30 stair goes on down. Since the temple moved 8.5 m west (图七, option A: it no longer sinks 6 m into the Victoria's terrace) its stair's foot is that
// much nearer the viewing terrace: the landing reaches out west (side: metres from the stair's line to the flight's) and the flight turns there, so it
// leaves the model's stair clear. Model points (x, y) as the model has them (+y north); after templeLinks, so the temple's own hill stair (from the foot
// of its south wall) stays as it was.
const PAL_MM_LINKS={west:{foot:[-38,-52],head:[-29.6,-36],z:-16,w:3,side:4.5,to:[-213.5,132]}};
function palMMLinks(W){const A=PAL_ASSETS.find(a=>a.n==='rome_magna_mater'),L=PAL_MM_LINKS;if(!A||!W.palStairs)return;
  const g=new GB(1<<14),t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),M=(x,y)=>palW(A.lx+c*x-s*y,A.lz-s*x-c*y),SG=stairGround(W),st=W.palMMStats={};
  const reg=(id,pts,w,top)=>{const R=pts.map(p=>[p[0],p[1]]);R.corners=[];W.palStairs.push({id,pts:R,Y:pts.map(p=>p[2]),w,lane:false});(W.hillStairs||(W.hillStairs=[])).push({R,w,top,pal:id,steps:0});};
  const add=(P,u,k)=>[P[0]+u[0]*k,P[1]+u[1]*k],unit=(P,Q)=>{const l=Math.hypot(Q[0]-P[0],Q[1]-P[1])||1;return[(Q[0]-P[0])/l,(Q[1]-P[1])/l];};
  // a low wall (1 m over the floor at y) along a landing's open edge P..Q, set .18 in from it towards the point In
  const wall=(P,Q,In,y)=>{const u=unit(P,Q),l=Math.hypot(Q[0]-P[0],Q[1]-P[1]),m=[(P[0]+Q[0])/2,(P[1]+Q[1])/2],n=unit(m,In),F=frame(m[0]+n[0]*.18,0,m[1]+n[1]*.18,Math.atan2(-u[1],u[0]));
    g.set(60,.5,1,0);box(g,F,0,y-.12,0,l/2,1.12,.18,31);trimSet(g,1,.5);box(g,F,0,y+1,0,l/2+.03,.08,.22,31);};
  {const P=L.west,y0=A.y+P.z,w=P.w,wo=w+1.2,F0=M(...P.foot),d=unit(M(...P.head),F0);   // d: on down the stair's line; wo: out to its cheeks' outer faces
    const Mc=M(0,0),n0=[-d[1],d[0]],sg=Math.sign(n0[0]*(F0[0]-Mc[0])+n0[1]*(F0[1]-Mc[1]))||1,nn=[n0[0]*sg,n0[1]*sg],k=P.side||0;   // nn: across the stair's line, away from the temple
    // the landing: wo deep along the stair's line (F0..B), from the stair's temple side (-wo/2) out past the flight's outer cheek (ko); C: its centre on
    // the stair's line, K: on the flight's line; the flight leaves it across its near edge (the line F0 + nn) towards the viewing terrace (e)
    const ko=k+wo+1,B=add(F0,d,wo),C=add(F0,d,wo/2),K=add(C,nn,k),E=palW(...P.to),e=unit(K,E),Bf=add(B,nn,ko),Ff=add(F0,nn,ko);
    // the model's stair is solid down to its old underside (z -16.5, so tools/pal_rock.mjs shapes the hill as before): under it, in 1 m pieces, a base from the ground up
    let nb=0;{const H0=M(...P.head),Ls=Math.hypot(H0[0]-F0[0],H0[1]-F0[1]),Fs=frame(F0[0],0,F0[1],Math.atan2(-(H0[1]-F0[1]),H0[0]-F0[0])),yb=y0-.5;
      for(let s=0;s<Ls-.01;s+=1){const l=Math.min(1,Ls-s);let yg=1e9;for(const a of[s,s+l])for(const b of[-wo/2,wo/2]){const q=Fs.p(a,0,b);yg=Math.min(yg,W.gy(q[0],q[2]));}
        if(yg-.8<yb-.05){g.set(60,.5,1,0);box(g,Fs,s+l/2,yg-.8,0,l/2+.01,yb-yg+.8,wo/2,31&~32);nb++;}}}
    palLanding(W,g,add(C,nn,-wo/2),add(C,nn,ko),wo,y0);const S=add(K,e,wo/2+.3);palLanding(W,g,K,S,w+.72,y0);
    // low walls on its open edges: the far edge, the temple side, the outer end, and the near edge on either side of the flight (from the model
    // stair's cheek to the flight's inner cheek, from its outer cheek to the corner): a cheek's outer face (w/2 + .6 off the flight's line) meets the
    // near edge where that line crosses F0 + nn
    {const ue=[-e[1],e[0]],ui=(ue[0]*nn[0]+ue[1]*nn[1])>0?[-ue[0],-ue[1]]:ue,den=e[0]*nn[1]-e[1]*nn[0],
        cr=u=>{const Q=add(K,u,w/2+.6);return add(Q,e,((F0[0]-Q[0])*nn[1]-(F0[1]-Q[1])*nn[0])/den);},sOf=p=>(p[0]-F0[0])*nn[0]+(p[1]-F0[1])*nn[1];
      wall(add(B,nn,-wo/2),Bf,K,y0);wall(add(F0,nn,-wo/2),add(B,nn,-wo/2),K,y0);wall(Bf,Ff,K,y0);
      if(Math.abs(den)>.05){const ci=cr(ui),co=cr([-ui[0],-ui[1]]),si=sOf(ci),so=sOf(co);
        if(si>wo/2+.5)wall(add(F0,nn,wo/2+.1),add(F0,nn,Math.min(si,ko)),K,y0);if(so<ko-.4)wall(add(F0,nn,Math.max(so,wo/2+.1)),Ff,K,y0);
        st.westEdge={inner:+si.toFixed(2),outer:+so.toFixed(2),ko};}}
    const r=palFlight(W,g,S,add(S,e,60),y0,w,(y,x,z)=>y<=SG(x,z)+.21);
    const end=r.pts.length?r.pts[r.pts.length-1]:S,pts=[[...M(-27,-37),A.y-8],[...M(...P.head),y0+8],[...F0,y0],[...C,y0],[...K,y0],[...S,y0],...r.pts];
    for(const k of[.6,1.6])pts.push([...add(end,e,k),r.y]);reg('mmWest',pts,w,A.y-8);W.palStairs[W.palStairs.length-1].hd=2;   // hd: the route's first two points are the model's own stair; __palStairEnds checks the head from its foot (F0)
    // a tree planted before (the Magna Mater's stone pines) whose trunk stands on the landing or the flight goes; the west-slope planting after this keeps off it
    const Rw=[F0,B,C,add(C,nn,ko),K,S,...r.pts.map(p=>[p[0],p[1]])].filter((p,j,a)=>!j||Math.hypot(p[0]-a[j-1][0],p[1]-a[j-1][1])>.01);let cut=0;   // (segD: no zero-length segments)
    for(let i=W.trees.length-1;i>=0;i--){const q=W.trees[i];let dm=1e9;for(let j=1;j<Rw.length;j++)dm=Math.min(dm,segD(q[0],q[2],Rw[j-1][0],Rw[j-1][1],Rw[j][0],Rw[j][1]));if(dm<wo/2+.6){W.trees.splice(i,1);cut++;}}
    st.west={steps:r.n,landings:r.nL+2,from:+y0.toFixed(2),to:+r.y.toFixed(2),end:palL(end[0],end[1]).map(v=>+v.toFixed(1)),floor:+SG(end[0],end[1]).toFixed(2),trees:cut,base:nb};}
  const m=layTag(g.mesh(MAT.city),'stairs');if(m){m.name='palMMLinks';W.scene.add(m);}}
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
  const r1=palFlight(W,g,A,B,by,w,y=>y<=fy+.01,(x,z)=>!inSlot(x,z),0,.045);pts.push(...r1.pts);st.steps+=r1.n;st.landings+=r1.nL;
  const ax=Math.hypot(B[0]-A[0],B[1]-A[1]),ux=(B[0]-A[0])/ax,uz=(B[1]-A[1])/ax;
  if(S.to!=='street'){const e=r1.pts.length?r1.pts[r1.pts.length-1]:A;for(const d of[.6,1.6])pts.push([e[0]+ux*d,e[1]+uz*d,fy]);   // on to the foot terrace's floor
    (st.ends||(st.ends={}))[S.id]=[...palL(e[0],e[1]).map(v=>+v.toFixed(1))];reg(S.id,pts,w,by,!!S.lane);return;}
  // where the axis crosses the foot wall (the via terrace's outer walls): the opening, the flat walk on the foot terrace to it, and the flight below it
  const cr=palAxisCross(S);
  if(cr){W.palOpen.push([S.via,cr.e.i,cr.s-w/2-.6,cr.s+w/2+.6]);const s1=r1.s,xW=cr.t*La;   // xW: hill metres from the head to the wall line
    const L0=[A[0]+ux*s1,A[1]+uz*s1],L1=[A[0]+ux*(xW+.8),A[1]+uz*(xW+.8)];palLanding(W,g,L0,L1,w+.72,fy+.045);st.landings++;
    for(const t of[0,.5,1])pts.push([lerp(L0[0],L1[0],t),lerp(L0[1],L1[1],t),fy]);
    const r2=palFlight(W,g,L1,B,fy,w,(y,x,z)=>y<=gy(x,z)+.22||(W.streetAt&&W.streetAt(x,z)&&y<=gy(x,z)+.6),S.cut?(x,z)=>!byWall(x,z):undefined,S.cut?15:0);   // from the landing (fy + 0.045): its first riser 0.245pts.push(...r2.pts);st.steps+=r2.n;st.landings+=r2.nL;
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
function palPlatFloor(g,P,holes){const y=P.y+.06,paveAt=(lx,lz)=>/^sum/.test(P.id)||P.plaza||P.id==='h51'||(P.id==='beltE'&&lz>-42&&lz<6)||(P.id==='beltN'&&palInLaneN(lx,lz)),cs=8,gz0=-42-cs*Math.ceil((-42-P.z0)/cs);let tri=0;
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
// round 4 (b_flat): none along block b's back (sumL's south edge between the lane stairs): b's own back wall is the cut's face, the lane's paving
// (PAL_LANE_TOE) runs on to it, and b's back stair comes down on to that paving (R11); the cut wall stood where the stair's foot is
const palBBack=(P,e)=>P.id==='sumL'&&Math.abs(e.a[1]-PAL_LANE_TOE.z0)<.01&&Math.abs(e.b[1]-PAL_LANE_TOE.z0)<.01;
function palCutWall(W,g,P,e){const n=Math.max(2,Math.round(e.L/2)),S=[],y=P.y;let len=0;
  // H5.1: behind a fill (R12 15.5) the cut is the fill's top: its cap is the fill's paving (palH51Works lays the rest 1 cm lower)
  for(let k=0;k<=n;k++){const s=e.L*k/n,f=palH51FillY(e.a[0]+e.ux*s+e.nx*.8,e.a[1]+e.uz*s+e.nz*.8),q=palW(e.a[0]+e.ux*s+e.nx*4,e.a[1]+e.uz*s+e.nz*4);
    S.push({s,gO:f!=null?f-.12:W.gy(q[0],q[1])});}
  // review 35 (11-16): h51's cut walls (the court's back, lx 51-58) keep one level top, the highest the edge samples (54.3, the fills' line): at lx 58 the
  // sample fell in a buttress gap (terrain 53.5) and the coping sloped down 0.8 into d@75's corner
  if(P.id==='h51'){const m=Math.max(...S.map(q=>q.gO));for(const q of S)q.gO=m;S[0].s-=.1;S[n].s+=.1;}   // and 0.1 on into the d_lows' end walls at both ends: a slit at lx 58 showed the ground in the buttress gap behind
  const NI=P.id==='h51'?(PAL_PLAN.h51.niches||[]).map(c=>({c,s:(c.x-e.a[0])*e.ux+(c.z-e.a[1])*e.uz,d:(c.x-e.a[0])*e.nx+(c.z-e.a[1])*e.nz})).filter(q=>Math.abs(q.d)<.05&&q.s>q.c.w/2&&q.s<e.L-q.c.w/2):[];
  for(let k=0;k<n;k++){const A=S[k],B=S[k+1];if(A.gO<y+.5&&B.gO<y+.5)continue;const ya=Math.max(A.gO,y+.5)+.12,yb=Math.max(B.gO,y+.5)+.12,Q=(s,d,yy)=>PFR.p(e.a[0]+e.ux*s+e.nx*d,yy,e.a[1]+e.uz*s+e.nz*d),inw=PFR.d(-e.nx,0,-e.nz);
    g.set(60,.3+.4*teH(e.a[0],e.a[1],1),1,0);
    {const cut=NI.map(q=>[q.s-q.c.w/2,q.s+q.c.w/2,q.c.on+.06+q.c.sill,q.c.on+.06+q.c.sill+q.c.h]).filter(c=>c[0]<B.s&&c[1]>A.s),yt=s=>lerp(ya,yb,(s-A.s)/(B.s-A.s));
     if(!cut.length)g.poly([Q(A.s,0,y-.6),Q(B.s,0,y-.6),Q(B.s,0,yb),Q(A.s,0,ya)],inw);
     else{const[c0,c1,y0,y1]=cut[0],s0=Math.max(A.s,c0),s1=Math.min(B.s,c1);   // a niche (alt b: the court's end): the face round its opening
       if(s0>A.s)g.poly([Q(A.s,0,y-.6),Q(s0,0,y-.6),Q(s0,0,yt(s0)),Q(A.s,0,ya)],inw);if(s1<B.s)g.poly([Q(s1,0,y-.6),Q(B.s,0,y-.6),Q(B.s,0,yb),Q(s1,0,yt(s1))],inw);
       g.poly([Q(s0,0,y-.6),Q(s1,0,y-.6),Q(s1,0,y0+.01),Q(s0,0,y0+.01)],inw);   /* review 35: up to the sill's top (+.005), no slit under its lip */g.poly([Q(s0,0,y1),Q(s1,0,y1),Q(s1,0,yt(s1)),Q(s0,0,yt(s0))],inw);}}
    if(Math.min(ya,yb)-y>2.6){g.set(60,.5,1,1);g.poly([Q(A.s,-.07,y-.6),Q(B.s,-.07,y-.6),Q(B.s,-.07,y+2.4),Q(A.s,-.07,y+2.4)],inw);}
    trimSet(g,1,.5);g.poly([Q(A.s,-.25,ya+.08),Q(B.s,-.25,yb+.08),Q(B.s,.7,yb+.08),Q(A.s,.7,ya+.08)],[0,1,0]);g.poly([Q(A.s,-.25,ya-.37),Q(B.s,-.25,yb-.37),Q(B.s,-.25,yb+.08),Q(A.s,-.25,ya+.08)],inw);
    g.set(60,.4,1,4);g.poly([Q(A.s,.7,ya),Q(B.s,.7,yb),Q(B.s,3.8,yb),Q(A.s,3.8,ya)],[0,1,0]);g.set(60,.5,1,0);g.poly([Q(A.s,3.8,ya),Q(B.s,3.8,yb),Q(B.s,3.8,Math.min(B.gO,yb)-1.2),Q(A.s,3.8,Math.min(A.gO,ya)-1.2)],PFR.d(e.nx,0,e.nz));
    len+=B.s-A.s;}
  return len;}
// the 6 x 6 m piers (palatine-masterplan.md 2.2) of every terrace: at each turn of 20 degrees or more between two walls (the hemicycle's 15-degree facets are
// one curve), and where a wall ends on rock or on a grade or shared edge. Not on a villa (its own wall closes there), not by a stair head or the hemicycle's
// slot, not where a hill stair passes; where two terraces' piers meet, the higher one; where two at one level meet (two terraces' walls across their shared
// edge: footE and footN at 233.3, -120), one pier, the first (c.mate: the other one, d.mateOf; terraceEdge o.pierX: its outline takes the other's wall
// as its second side, and that wall's coping and parapet stop at it).
// Every pier as the corner-pier pilot of round 4 (v36n's NW corner, lx 27.35, lz -173.6; the author, 2026-11-15: "统一改"): solid up to the coping, its top
// paved flush with the terrace, the parapet round its outer outline, the walls' coping and parapet stopping at it (terraceEdge); no planting whose centre is
// inside its 6 x 6 m square (palInPier); its top paving only, but for the pilot's (top: palPierTop).
// drop: piers to leave out (o.noCorner: no small corner pier either). band: lower terraces' coping levels to carry round a pier as a string course, besides
// those palPlatWalls finds (a lower terrace's wall ending in the pier's square: v30n's at the pilot; the reviewer, 11-15: without it the pilot read as an 11 m
// tower, not as the terrace's corner). top: the pilot's cypress in a kerbed square of lawn, as the strip below has cypresses in its beds
const PAL_PIER_PILOT={band:{'v36n:5':[30]},top:{'v36n:5':'cyp'},drop:PAL_PLAN.h51.on?[...PAL_PLAN.h51.piers.drop,...(PAL_PLAN.h51.piers.abut||[])].map(d=>[d[0],d[1],'small']):[]},palPilotV=(L,id)=>L.filter(f=>f[0]===id).map(f=>f[1]);
// (lx, lz) under a pier terraceEdge drew: inside its 6 x 6 m square about the vertex (W.pierSq: its axes along the sum of its walls' directions)
const palInPier=(W,lx,lz)=>{const[x,z]=palW(lx,lz);return!!inPierSq(W,x,z);};
// the reviewer, 2026-11-15: a concave pier (its outline the triangle between its two walls) whose face stops short of a lower terrace's wall corner, that
// terrace's floor between them (v36n:6 over v30n's corner 7, a 1.24 m slot): the body carried out to the corner along the lines of its two walls; none
// past 2.4 m. Returns the points spliced into the outline between its two ends (hill grid), the corner and the gap, or null
function palPierFill(c){const P=c.P,n=P.E.length,e0=P.E[(c.v+n-1)%n],e1=P.E[c.v];if(e0.k!=='w'||e1.k!=='w')return null;
  let A2=0;for(let i=0;i<n;i++){const a=P.pts[i],b=P.pts[(i+1)%n];A2+=a[0]*b[1]-b[0]*a[1];}if((e0.ux*e1.uz-e0.uz*e1.ux)*(A2>0?1:-1)>=0)return null;   // a convex corner: its pier is the square
  const V=P.pts[c.v],[ux,uz]=palPierAx(c),wx=-uz,wz=ux,ex=d=>3/Math.max(Math.abs(d[0]*ux+d[1]*uz),Math.abs(d[0]*wx+d[1]*wz)),d0=[-e0.ux,-e0.uz],d1=[e1.ux,e1.uz],
    A=[V[0]+d0[0]*ex(d0),V[1]+d0[1]*ex(d0)],B=[V[0]+d1[0]*ex(d1),V[1]+d1[1]*ex(d1)],lab=Math.hypot(B[0]-A[0],B[1]-A[1]),t=[(B[0]-A[0])/lab,(B[1]-A[1])/lab];
  let nn=[t[1],-t[0]];if((A[0]+B[0]-2*V[0])*nn[0]+(A[1]+B[1]-2*V[1])*nn[1]<0)nn=[-nn[0],-nn[1]];
  const hit=(p,u)=>{const cr=u[0]*t[1]-u[1]*t[0];if(Math.abs(cr)<1e-6)return null;const k=((A[0]-p[0])*t[1]-(A[1]-p[1])*t[0])/cr;return[p[0]+u[0]*k,p[1]+u[1]*k];},along=p=>(p[0]-A[0])*t[0]+(p[1]-A[1])*t[1];
  let best=null;for(const P2 of PAL_PL){if(P2.y>P.y-.5)continue;const m=P2.E.length;for(let j=0;j<m;j++){const f0=P2.E[(j+m-1)%m],f1=P2.E[j];if(f0.k!=='w'||f1.k!=='w')continue;const C2=P2.pts[j],
      d=(C2[0]-A[0])*nn[0]+(C2[1]-A[1])*nn[1],s=along(C2);if(d<.05||d>2.4||s<.05||s>lab-.05||(best&&best.d<=d))continue;const X0=hit(C2,[f0.ux,f0.uz]),X1=hit(C2,[f1.ux,f1.uz]);if(!X0||!X1)continue;
      const s0=along(X0),s1=along(X1);if(Math.min(s0,s1)<.05||Math.max(s0,s1)>lab-.05)continue;const mc=[(X0[0]+X1[0]+C2[0])/3,(X0[1]+X1[1]+C2[1])/3];if(!inPolyXZ(mc[0],mc[1],P2.pts))continue;   // the slot is that terrace's floor
      best={pts:s0<s1?[X0,C2,X1]:[X1,C2,X0],to:P2.id+':'+j,d};}}
  return best;}
// the hill's kerbed beds and the plant each one is for (W.palBedLog: kind, the tree entry), to count the ones left with no plant (the pier check, the cap)
const palBedLog=(W,k,t)=>(W.palBedLog=W.palBedLog||[]).push({k,t});
// a pier's axis (hill grid): the sum of its walls' directions, the other terrace's wall standing for a shared side (c.mate, c.mateOf)
function palPierAx(c){const P=c.P,n=P.E.length,e0=P.E[(c.v+n-1)%n],e1=P.E[c.v],m=c.mate||c.mateOf;let ux=0,uz=0;if(e0.k==='w'){ux+=e0.ux;uz+=e0.uz;}if(e1.k==='w'){ux+=e1.ux;uz+=e1.uz;}
  if(m&&(e0.k!=='w'||e1.k!=='w')){const d=palPierWallRay(m),s=e0.k!=='w'?-1:1;ux+=s*d[0];uz+=s*d[1];}const l=Math.hypot(ux,uz)||1;return[ux/l,uz/l];}
// the ray from a one-wall pier's vertex along its wall, and that wall's outward normal (hill grid)
function palPierWallRay(c){const P=c.P,n=P.E.length,e0=P.E[(c.v+n-1)%n],e1=P.E[c.v];return e1.k==='w'?[e1.ux,e1.uz,e1.nx,e1.nz]:[-e0.ux,-e0.uz,e0.nx,e0.nz];}
// the pilot's top: a 2.4 m kerbed square of lawn (the belts' plane-tree squares, palPlaneSq, a size smaller) with a tree, square to the pier's faces, its
// centre 0.9 m out from the terrace's corner along the bisector (the outer kerb 0.3 m inside the parapet, the inner one on the terrace's paving); y: the pier's paving
function palPierTop(W,g,P,v,kind,y){const n=P.pts.length,V=P.pts[v],A=P.pts[(v+n-1)%n],B=P.pts[(v+1)%n],u=(p,q)=>{const dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz);return[dx/L,dz/L];},
    u0=u(A,V),u1=u(V,B);let bx=u0[0]-u1[0],bz=u0[1]-u1[1];const bl=Math.hypot(bx,bz)||1;bx/=bl;bz/=bl;
  const q=PFR.p(V[0]+bx*.9,0,V[1]+bz*.9),F=frame(q[0],0,q[2],PALF.rot+Math.atan2(-bz,bx));trimSet(g,1,.5);
  for(const[cx,cz,hx,hz]of[[0,1.1,1.22,.12],[0,-1.1,1.22,.12],[1.1,0,.12,.98],[-1.1,0,.12,.98]])box(g,F,cx,y-.06,cz,hx,.24,hz,31);
  g.set(23,.4);g.poly([F.p(-.98,y+.1,-.98),F.p(.98,y+.1,-.98),F.p(.98,y+.1,.98),F.p(-.98,y+.1,.98)],[0,1,0]);const t=[q[0],y,q[2],kind,.9+.15*teH(q[0],q[2],75),null,1];t.pierTop=1;W.trees.push(t);palBedLog(W,'pierTop',t);}   // pierTop: it stands on the pier (the planting check in romeCity keeps it)
function palPierPlan(W){const C=[],villas=palPlBuild().slice(0,PAL_PLAN.villas.length),ST=(W.palStairs||[]).map(s=>({R:s.pts,r:s.w/2+.6})).concat((W.hillStairs||[]).filter(h=>!h.pal&&h.R).map(h=>({R:h.R,r:h.w/2+.6})));
  for(const P of PAL_PL){const n=P.E.length;for(let v=0;v<n;v++){const e0=P.E[(v+n-1)%n],e1=P.E[v],w0=e0.k==='w',w1=e1.k==='w';if(!w0&&!w1)continue;
      if(w0&&w1){const c=e0.ux*e1.ux+e0.uz*e1.uz;if(Math.acos(clamp(c,-1,1))<20*DEG)continue;}else{const o=w0?e1.k:e0.k;if(o==='m'||o==='st'||o==='o')continue;}
      const[lx,lz]=P.pts[v];if(villas.some(h=>lx>h[0]-1&&lx<h[1]+1&&lz>h[2]-1&&lz<h[3]+1))continue;
      const[x,z]=palW(lx,lz);if(ST.some(h=>nearPoly(x,z,h.R,h.r+4.4)))continue;C.push({P,v,x,z,y:P.y});}}
  const K=C.filter(c=>!C.some(d=>d!==c&&d.y>c.y&&Math.hypot(d.x-c.x,d.z-c.z)<4)&&!PAL_PIER_PILOT.drop.some(d=>d[0]===c.P.id&&d[1]===c.v));
  for(const c of K){if(c.mate||c.mateOf)continue;for(const d of K)if(d!==c&&!d.mate&&!d.mateOf&&d.y===c.y&&Math.hypot(d.x-c.x,d.z-c.z)<4){c.mate=d;d.mateOf=c;break;}}   // one pier at one point and level
  return K;}
function palPlatWalls(W){const g=new GB(1<<17),gF=new GB(1<<16),st=W.palPlatStats={walls:0,wallLen:0,maxH:0,piers:0,openings:0,cutLen:0,floorTri:0,rockRuns:0};
  const holes=palPlBuild(),piers=palPierPlan(W),OP=W.palOpen||[];
  const HS=(W.hillStairs||[]).filter(h=>!h.pal&&h.R&&h.R.length>1).map(h=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of h.R){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return{R:h.R,r:h.w/2+1.2,x0,x1,z0,z1};});
  const nearHS=(x,z)=>HS.some(h=>x>h.x0-h.r&&x<h.x1+h.r&&z>h.z0-h.r&&z<h.z1+h.r&&nearPoly(x,z,h.R,h.r));
  // buttresses (the review of 2026-11-12): none on a wall under 4 m, one every 9 m on the higher ones (a curve is one wall), none by a stair along the wall or
  // the wall fountain; on the summit wall out from the fountain's axis both ways
  const SB=[...(W.palStairs||[]).map(t=>({R:t.pts,r:t.w/2+(t.lane?1.8:.9)})),...HS],F0=PAL_PLAN.fountains[0],fq=palW(F0.at[0],F0.at[1]);   // a lane's walls (2.25 m off its axis): none
  const NB=W.palNoButt||[],avoid=(x,z)=>{if(Math.hypot(x-fq[0],z-fq[1])<4.6||SB.some(h=>nearPoly(x,z,h.R,h.r)))return true;const[lx,lz]=palL(x,z);return NB.some(r=>lx>r[0]&&lx<r[1]&&lz>r[2]&&lz<r[3]);};
  for(const P of PAL_PL){st.floorTri+=palPlatFloor(gF,P,holes);
    const skip=P.E.filter(e=>e.k!=='w').map(e=>e.i),footY={};for(const e of P.E)if(e.k==='w'&&e.foot!=null)footY[e.i]=e.foot;
    const pv=piers.filter(c=>c.P===P).map(c=>c.v),pX={},band={},shared=P.E.filter(e=>e.k==='s').map(e=>e.i);
    for(const c of piers){if(c.P!==P)continue;const id=P.id+':'+c.v,m=c.mate||c.mateOf;if(!c.mateOf)st.piers++;
      if(m){const r=palPierWallRay(m),d=PFR.d(r[0],0,r[1]),nn=PFR.d(r[2],0,r[3]);pX[c.v]={d:[d[0],d[2]],n:[nn[0],nn[2]],draw:!c.mateOf};}   // the other terrace's wall (palPierPlan)
      if(c.mateOf)continue;const B=new Set(PAL_PIER_PILOT.band[id]||[]),V=P.pts[c.v],[ux,uz]=palPierAx(c),inSq=p=>{const dx=p[0]-V[0],dz=p[1]-V[1];return Math.abs(dx*ux+dz*uz)<3.36&&Math.abs(-dx*uz+dz*ux)<3.36;};
      for(const P2 of PAL_PL)if(P2.y<P.y-.5)for(const e of P2.E)if(e.k==='w'&&(inSq(e.a)||inSq(e.b)))B.add(P2.y);   // a lower terrace's wall ending at the pier: its coping goes on round it
      if(B.size)band[c.v]=[...B].sort((a,b)=>b-a);}
    const open=(x,z,i,s)=>{for(const o of OP)if(o[0]===P.id&&o[1]===i&&s>=o[2]&&s<=o[3])return'stair';return nearHS(x,z)?'stair':false;};
    const rooms=PAL_PLAN.shops&&PAL_PLAN.shops[P.id]||null;   // H2: the shop arches in the north foot wall
    const endV=[];for(let v=0;v<P.E.length;v++){const a=P.E[(v+P.E.length-1)%P.E.length].k,b=P.E[v].k;if((a==='w'&&b==='o')||(a==='o'&&b==='w'))endV.push(v);}   // H2: a newel pier where a wall meets an open stair head
    const rail={};for(const e of P.E)if(e.k==='w')for(const B of palBL){if(B.t!=='cf')continue;const t=((Math.round(B.tn/90)%4)+4)%4,
        mod=(lx,lz)=>t===0?[lx-B.lx,B.lz-lz]:t===1?[B.lz-lz,B.lx-lx]:t===2?[B.lx-lx,lz-B.lz]:[lz-B.lz,lx-B.lx],a=mod(e.a[0],e.a[1]),b=mod(e.b[0],e.b[1]);
      if(Math.abs(a[1]+10)>.3||Math.abs(b[1]+10)>.3)continue;const sx=(e.b[0]-e.a[0])*e.ux+(e.b[1]-e.a[1])*e.uz,du=(b[0]-a[0])/sx,s0=(-15-a[0])/du,s1=(15-a[0])/du;   // R10 乙: the flat block's own balustrade stands on its garden edge, the belt's wall under it
      rail[e.i]={none:[Math.max(0,Math.min(s0,s1)),Math.min(e.L,Math.max(s0,s1))]};}
    const pF={};for(const c of piers){if(c.P!==P||c.mateOf)continue;const f=palPierFill(c);if(!f)continue;pF[c.v]=f.pts.map(p=>{const q=PFR.p(p[0],0,p[1]);return[q[0],q[2]];});
      (W.pierFillLog=W.pierFillLog||[]).push({pier:P.id+':'+c.v,to:f.to,gap:+f.d.toFixed(3),pts:f.pts.map(p=>p.map(v=>+v.toFixed(3)))});}
    const out=terraceEdge(W,g,P.pts,P.y,{F:PFR,tag:'pal:'+P.id,pal:1,skip,shared,footY,open,rock:true,m3:true,wing:false,piers:pv,pierX:pX,pierFill:pF,band,noCorner:palPilotV(PAL_PIER_PILOT.drop.filter(d=>d[2]!=='small'),P.id),endV,rooms,roomOpt:{bay:4.6},rail,
      butt:{min:4,sp:9,turn:20,avoid,sym:P.id===F0.wall?{1:F0.at[1]-palPlById(F0.wall).E[1].a[1]}:null},noLump:(x,z)=>{const[lx,lz]=palL(x,z);return(lx<176&&lx>170&&lz>-45&&lz<9)||SB.some(h=>nearPoly(x,z,h.R,h.r+1.5));}});   // the paved hemicycle at the summit wall's foot (H2-B); R11: none on or by a stair along the wall (two stood on eastPn's last treads)
    for(const v of pv){const k=PAL_PIER_PILOT.top[P.id+':'+v];if(k&&(W.pierSq||[]).some(q=>q.tag==='pal:'+P.id+':'+v))palPierTop(W,g,P,v,k,P.y+.09);}   // the pilot pier's top (its paving: terraceEdge, top + 0.09); the others paving only
    for(const e of out.edges){if(e.skip)continue;st.walls++;st.wallLen+=e.L;if(e.runs&&e.runs.length<e.S.length)st.openings+=Math.max(0,e.runs.length-1);for(const q of e.S){st.maxH=Math.max(st.maxH,q.h);if(q.rk!=null)st.rockRuns++;}}
    for(const e of P.E)if(e.k==='w'){if(!palBBack(P,e))st.cutLen+=palCutWall(W,g,P,e);if(e.foot!=null){const r=(W.wallFeet||[]).find(q=>q.tag==='pal:'+P.id+':'+e.i);if(r){r.ledge=true;if(PAL_PLAN.h51.on&&e.foot===PAL_PLAN.h51.plats[0].y)r.bare=true;}}}   // H5.1: h51 is paved wall to wall (the lane, the court, the pocket): no planting at the rim wall's foot   // a wall standing on a terrace's floor: no rocks or moss at its foot (terraceFeet), shrubs and cypresses only
  }
  for(const P of PAL_PL)if(P.id!=='gApS'&&!P.plaza)st.plants=(st.plants||0)+palPlatPlant(W,g,P,holes);   // after all the walls (no planting in a pier's square: palInPier); a plaza (the lane heads tlE, tlW) is all paving
  palApolloSPlant(W,g);   // gApS: its own planting, on the strip the Apollo's rock leaves open
  st.h51=palH51Works(W,g);   // H5.1 (b2): the fills, W17, the lane's end wall, the niches, the bed
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
        if(row&&teH(cx,cz,85)<.3&&!inPierSq(W,cx,cz))W.trees.push([cx,top-.1,cz,'shrub',.6+.5*teH(cx,cz,86),null,3]);
        d0+=2*hh-.25;}
      if(placed){R.brk.push(s);g0+=1.9;}}
    want+=w0;got+=g0;if(w0&&g0/w0>=.6)R.ledge=true;}}
  return{lumps,cover:want?+(got/want).toFixed(3):null};}
// planting on a terrace's floor (no lawn: palatine-masterplan.md M5): along its own walls, 3 m in, a kerbed bed with a garden plant every 10 m and a cypress
// or an umbrella pine between every other pair; on the wide floors (more than 7 m from every edge) beds on a 14 m grid. Not on the hemicycle garden (its own),
// a building, a stair or within 2 m of one. Dice keyed to the place.
// The belts (the review of 2026-11-12): inside the 4 m walk along their walls (palPlatFloor) plane trees in rows 6.5 and 14.5 m in, 7 m apart, each in a
// kerbed square of garden lawn, and a box bed between each pair; the rest gravel, with the beds of the 14 m grid on the wide floors.
function palPlatPlant(W,g,P,holes){if(P.plant==='strip')return palStripPlant(W,g,P);const y=P.y+.06,ST=[...(W.palStairs||[]).map(s=>({R:s.pts,r:s.w/2+2})),...(W.hillStairs||[]).filter(h=>!h.pal&&h.R).map(h=>({R:h.R,r:h.w/2+2}))];let n=0;
  const free=(lx,lz,m)=>{if(!inPolyXZ(lx,lz,P.pts)||palPolyDl(lx,lz,P.pts)<m)return false;if(holes.some(h=>lx>h[0]-2&&lx<h[1]+2&&lz>h[2]-2&&lz<h[3]+2))return false;
      if(P.id==='beltE'&&lz>-45&&lz<9)return false;if(P.id==='beltN'&&palInLaneN(lx,lz))return false;if(palInPier(W,lx,lz))return false;const[x,z]=palW(lx,lz);return!ST.some(h=>nearPoly(x,z,h.R,h.r));};
  const bed=(lx,lz,rot)=>{const q=PFR.p(lx,0,lz),F=frame(q[0],0,q[2],PALF.rot+rot),k=teH(q[0],q[2],71);trimSet(g,1,.5);box(g,F,0,y-.06,0,1.3,.26,1,31);g.set(23,.4);
      g.poly([F.p(-1.14,y+.205,-.84),F.p(1.14,y+.205,-.84),F.p(1.14,y+.205,.84),F.p(-1.14,y+.205,.84)],[0,1,0]);{const t=[q[0],y+.2,q[2],impGarden(k),.7+.5*teH(q[0],q[2],72),null,1];W.trees.push(t);palBedLog(W,'plat',t);}n++;};
  const tree=(lx,lz)=>{const q=PFR.p(lx,0,lz),k=teH(q[0],q[2],73);W.trees.push([q[0],y,q[2],k<.62?'cyp':'pine',.8+.3*teH(q[0],q[2],74)]);n++;};
  if(/^belt/.test(P.id)){const T=[],room=(lx,lz,r)=>!T.some(t=>Math.hypot(t[0]-lx,t[1]-lz)<r);
    for(const d of[6.5,14.5])for(const e of[...P.G,...P.E]){if(e.k!=='w'||e.L<8)continue;const at=s=>[e.a[0]+e.ux*s-e.nx*d,e.a[1]+e.uz*s-e.nz*d],rot=-Math.atan2(e.uz,e.ux),nt=Math.floor((e.L-4)/7);if(nt<1)continue;
      for(let j=0,s0=(e.L-(nt-1)*7)/2;j<nt;j++){const s=s0+j*7,p=at(s);if(free(p[0],p[1],2.6)&&room(p[0],p[1],5.5)){palPlaneSq(W,g,p[0],p[1],y);T.push(p);n++;}
        const q=at(s+3.5);if(j<nt-1&&free(q[0],q[1],2.2)&&room(q[0],q[1],2.6)){palBoxBed(W,g,q[0],q[1],y,rot,1.7,.7);n++;}}}
    for(let lx=Math.ceil(P.x0/14)*14+7;lx<P.x1;lx+=14)for(let lz=Math.ceil(P.z0/14)*14+7;lz<P.z1;lz+=14)if(free(lx,lz,7)&&room(lx,lz,4))bed(lx,lz,0);
    return n;}
  for(const e of P.E){if(e.k!=='w'||e.L<8)continue;const at=(s,d)=>[e.a[0]+e.ux*s-e.nx*d,e.a[1]+e.uz*s-e.nz*d],rot=-Math.atan2(e.uz,e.ux);
    for(let j=0,s=5;s<e.L-4;s+=10,j++){const p=at(s,3);if(!/^sum/.test(P.id)&&free(p[0],p[1],2.2))bed(p[0],p[1],rot);if(j%2===1&&!/^sum[NL]/.test(P.id)){const t=at(s-5,2.4);if(free(t[0],t[1],1.8))tree(t[0],t[1]);}}}
  if(!/^sum/.test(P.id))for(let lx=Math.ceil(P.x0/14)*14+7;lx<P.x1;lx+=14)for(let lz=Math.ceil(P.z0/14)*14+7;lz<P.z1;lz+=14)if(free(lx,lz,7))bed(lx,lz,0);
  return n;}
// R10 乙: the planted strip in front of the north 36 (v30n, 3 m, no walking): along each of its walls a row of box beds 3.2 m long filling its depth,
// a cypress in every second one. None whose centre is in a pier's square (palInPier; round 4, 11-15: the pilot stands over the strip's corner and a
// cypress of a buried bed came up through its paving); the dice of the others are as they were
function palStripPlant(W,g,P){const y=P.y+.06,T=[];let n=0;
  for(const e of P.E){if(e.k!=='w'||e.L<3)continue;const rot=-Math.atan2(e.uz,e.ux),d=Math.min(1.5,palPolyDl(e.a[0]+e.ux*e.L/2-e.nx*1.5,e.a[1]+e.uz*e.L/2-e.nz*1.5,P.pts));
    for(let s=1.8,j=0;s<e.L-1.6;s+=3.4,j++){const p=[e.a[0]+e.ux*s-e.nx*d,e.a[1]+e.uz*s-e.nz*d];if(!inPolyXZ(p[0],p[1],P.pts)||T.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<3.2)||palInPier(W,p[0],p[1]))continue;
      palBoxBed(W,g,p[0],p[1],y,rot,1.6,1.2);T.push(p);n++;if(j%2===0){const q=PFR.p(p[0],0,p[1]);W.trees.push([q[0],y+.24,q[2],'cyp',.75+.2*teH(q[0],q[2],79),null,1]);n++;}}}
  return n;}
// a plane tree in a kerbed square of garden lawn 2.6 m across (hill grid lx, lz; floor y), as in the hemicycle (H2-B)
function palPlaneSq(W,g,lx,lz,y,sc){const q=PFR.p(lx,0,lz),F=frame(q[0],0,q[2],PALF.rot);trimSet(g,1,.5);
  for(const[cx,cz,hx,hz]of[[0,1.42,1.54,.12],[0,-1.42,1.54,.12],[1.42,0,.12,1.3],[-1.42,0,.12,1.3]])box(g,F,cx,y-.06,cz,hx,.24,hz,31);
  g.set(23,.4);g.poly([F.p(-1.3,y+.1,-1.3),F.p(1.3,y+.1,-1.3),F.p(1.3,y+.1,1.3),F.p(-1.3,y+.1,1.3)],[0,1,0]);{const t=[q[0],y,q[2],'plane',sc||.9+.2*teH(q[0],q[2],75),null,1];W.trees.push(t);palBedLog(W,'plane',t);}}   // owner 1 (imperial): the hill planting keeps the kind
// a box bed (hill grid lx, lz; floor y; turned rot from the grid; hx x hz half): a travertine kerb, lawn, clipped box along its long sides, a flowering shrub
// in the middle
function palBoxBed(W,g,lx,lz,y,rot,hx,hz){const q=PFR.p(lx,0,lz),F=frame(q[0],0,q[2],PALF.rot+rot),k=teH(q[0],q[2],76);trimSet(g,1,.5);box(g,F,0,y-.06,0,hx,.3,hz,31);
  g.set(23,.4);g.poly([F.p(-hx+.14,y+.245,-hz+.14),F.p(hx-.14,y+.245,-hz+.14),F.p(hx-.14,y+.245,hz-.14),F.p(-hx+.14,y+.245,hz-.14)],[0,1,0]);
  for(let u=-hx+.55;u<hx-.3;u+=.9){if(Math.abs(u)<.8)continue;for(const v of hz>1.1?[-hz+.45,hz-.45]:[0]){const p=F.p(u,0,v);W.trees.push([p[0],y+.24,p[2],'shrub',.42+.08*teH(p[0],p[2],77),null,1]);}}
  {const t=[q[0],y+.24,q[2],k<.65?'flower':'shrub',.75+.3*teH(q[0],q[2],78),null,1];W.trees.push(t);palBedLog(W,'box',t);}}
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

/* ---- H2: the west and south-west slopes (palatine-masterplan.md 2.2 and 2.5; the review of 2026-11-13) ----
   The viewing terrace (level 30, its portico towards the Tiber and the Capitoline) and the rings above and below it (37, 23) are the old rings kept
   (PAL_PLAN.west.rings: palTerraces plans them, palTerraceWalls draws them with H1's rules for their ends and buttresses, palWestStairs joins them);
   the rest of the old rings is gone (PAL_PLAN.rayCut). The summit edge under the temple courts is the Magna Mater's and the Victoria's own base walls
   (their models). The Tiberiana's cliff and its foot stay as they are (nothing within 3 m of its rock outline).
   palWestSlope(W), after the hill stairs, the temple links and the terrace walls (it keeps off them, the terrace floors, the streets, the houses and the
   models). No stone on the slope (the review of 2026-11-13: no rock lumps, no cliff bands), planting only:
   - on the slope (PAL_PLAN.west.rock, the name of the area): scrub, figs and a few stone pines;
   - the grove (PAL_PLAN.west.grove, the shelf west of the Magna Mater and the south-west slope round the Scalae Caci): holm oaks, laurels, stone pines;
   - the foot of the lowest ring (23) down to the street, a gentle slope: shrubs within 6 m of its wall line, holm oaks, laurels and a few stone pines beyond;
   - then every cell of __palBareSlope's lattice over 29.5 degrees (R5 says 30) that no plant covers yet gets a thicket (myrtle, lentisk, broom: the
     maquis; one in five a small laurel or holm oak), large enough to cover the cells round it.
   W.palPlants: [x, z, r] of that planting (r: the crown's radius, the smallest the instance can be), which __palBareSlope counts as cover.
   palWestClear(W), after terraceFeet: no tall tree within 6 m of the outer edge of a west ring (the view from the terrace); a shrub stands there instead.
   Dice keyed to the place (teH); the trees keep their kind (owner 3). W.palWest: the counts.
   palWestReserve(W), in palTerraces (before the roads and the houses): the slope and the grove are open land, 8 m squares on the hill grid wherever a square
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
function palWestSlope(W){const Wd=PAL_PLAN.west;if(!Wd)return;const gy=W.gy,st=W.palWest={shrubs:0,grove:0,pines:0,fill:0},WR=Wd.rings;
  const ST=[...(W.hillStairs||[]).filter(h=>h.R&&h.R.length>1).map(h=>({R:h.R,r:h.w/2+1.8})),...(W.palStairs||[]).map(s=>({R:s.pts,r:s.w/2+1.8}))];
  const tib=PAL_ASSETS.find(a=>/tiberiana/.test(a.n)),tibD=(lx,lz)=>{const E=tib&&palRockE[tib.n];if(!E)return 1e9;const t=tib.turn*DEG,c=Math.cos(t),s=Math.sin(t),dx=lx-tib.lx,dz=lz-tib.lz,u=c*dx-s*dz,v=s*dx+c*dz;
    let d=-1e9;for(const[px,pz,nx,nz]of E)d=Math.max(d,(u-px)*nx+(v-pz)*nz);return d;};
  const ter=(x,z,m)=>W.foot.hits(x,z,m,m,0,0,f=>f.palTer==null);   // a west ring's floor (its footprint reaches 1 m past the wall line)
  const busy=(lx,lz,x,z,r,k=1,rd=0,ns=0,nr=0)=>palInAsset(lx,lz,.5+k)||(!nr&&palRockD(lx,lz)<.5+k)||tibD(lx,lz)<3||(!ns&&W.streetAt&&(W.streetAt(x,z)||W.streetAt(x+r*.6,z)||W.streetAt(x-r*.6,z)||W.streetAt(x,z+r*.6)||W.streetAt(x,z-r*.6)))||
    W.foot.hits(x,z,r*.5*k,r*.5*k,0,0,f=>f.tag==='open'||(!k&&f.tag==='precinct')||(rd&&f.tag==='road'&&!f.lane&&!f.v2&&!f.v2street))||ter(x,z,k?.2+r*.3:.1)||palNearSC(lx,lz,2)||ST.some(h=>nearPoly(x,z,h.R,h.r-.8+r*.3*k));   // k: 1 for trees, 0 for the shrubs of the fill (they may stand against a model's base or a footprint's edge, a ring floor's too, and on a precinct's slope);
    // rd: a main road's corridor counts only where the street raster paves it (the fill below may set a shrub on the cut bank of the verge)
  const P=W.palPlants=[],G=new Map(),gk=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);
  const tree=(x,z,kind,s,col,r)=>{W.trees.push([x,gy(x,z),z,kind,s,col||null,3]);const p=[x,z,r];P.push(p);const k=gk(x,z);(G.get(k)||G.set(k,[]).get(k)).push(p);};
  const cov=(x,z)=>{for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const L=G.get((Math.floor(x/4)+i)+','+(Math.floor(z/4)+j));if(L)for(const p of L)if(Math.hypot(p[0]-x,p[1]-z)<p[2])return true;}return false;};
  const SR=s=>1.06*s;   // a shrub's crown radius at scale s (builders.js: 1.25 m at 1, each instance 0.85-1.15 of that)
  // the maquis' greens (a shrub's colour, builders.js TREECOL.shrub .055,.085,.03): dark myrtle, lentisk, grey-green wild olive and broom; by the place
  const MQ=(x,z)=>{const h=teH(x,z,116);return h<.35?[.05,.088,.03]:h<.75?[.068,.104,.034]:[.088,.1,.048];};
  // the west rings' wall lines (palTerraceWalls has drawn them): no small tree of the fill within 6 m of them (palWestClear would make it a shrub)
  const WE=[];for(const q of W.wallFeet||[])if(q.west)for(let i=1;i<q.S.length;i++)WE.push([q.S[i-1].x,q.S[i-1].z,q.S[i].x,q.S[i].z]);
  const byWall=(x,z)=>WE.some(e=>segD(x,z,e[0],e[1],e[2],e[3])<6.5);
  // the slope behind the viewing terrace's north stretch, from the end of 37 to the Tiberiana's rock (Wd.loose; the review of 2026-11-13: the heap of
  // shrubs there read as a mound of earth; then "a strip along the wall and a few clumps"):
  // - a strip of shrubs along the terrace's back wall (the portico's: up to 1.44 m up the slope from the inner edge of 30, palTerraceWalls sb*.6), one
  //   every 1.7 m, far enough up the slope that no crown reaches the wall;
  // - the steep band (over 29.5 degrees: __palBareSlope's) at the foot of the Tiberiana's south-west base, which runs down from its corner: the fill
  //   below covers it with single shrubs, large ones (1.5-2.2), a hedge along the wall foot, not clumps;
  // - a few clumps on the gentler slope between (a 9 m lattice, about half the points, none within 6 m of the back wall or 3 m of the steep band): three
  //   or four shrubs of mixed sizes 1.6-2.8 m round a point, a small laurel in the middle of every other one.
  // No scrub there. W.palWest.loose: the strip's and the clumps' plants
  const LZ=(lx,lz)=>!!Wd.loose&&inPolyXZ(lx,lz,Wd.loose);st.loose=0;
  const slA=(lx,lz)=>{const[x,z]=palW(lx,lz);return Math.hypot(gy(x+.75,z)-gy(x-.75,z),gy(x,z+.75)-gy(x,z-.75))/1.5;},STEEP=Math.tan(29.5*DEG);
  if(Wd.loose){const bx=Wd.loose.reduce((m,p)=>[Math.min(m[0],p[0]),Math.max(m[1],p[0]),Math.min(m[2],p[1]),Math.max(m[3],p[1])],[1e9,-1e9,1e9,-1e9]);
    const I=(W.palTerSegs||[]).filter(s=>s.yk===30&&s.A.i[0]>bx[0]-4&&s.A.i[0]<bx[1]+4&&s.A.i[1]>bx[2]-4&&s.A.i[1]<bx[3]+4).sort((a,b)=>a.A.a-b.A.a).map(s=>s.A.i);
    const dI=(lx,lz)=>{let d=1e9;for(let j=1;j<I.length;j++)d=Math.min(d,segD(lx,lz,I[j-1][0],I[j-1][1],I[j][0],I[j][1]));return d;},WB=1.44;   // WB: the back wall's furthest set-back
    for(let j=1;j<I.length;j++){const a=I[j-1],b=I[j],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.5||L>12)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;let nx=uz,nz=-ux;
      {const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],q=palW(m[0]+nx*3,m[1]+nz*3),q0=palW(m[0]-nx*3,m[1]-nz*3);if(gy(q[0],q[1])<gy(q0[0],q0[1])){nx=-nx;nz=-nz;}}   // up the slope
      for(let t=.85;t<L;t+=1.7){const sc=.8+.35*teH(a[0]+t,a[1],142),o=WB+SR(sc)+.3+.4*teH(a[0]+t,a[1],141),lx=a[0]+ux*t+nx*o,lz=a[1]+uz*t+nz*o;if(!LZ(lx,lz))continue;const[x,z]=palW(lx,lz);
        if(busy(lx,lz,x,z,1.1,0,1))continue;tree(x,z,'shrub',sc,MQ(x,z),SR(sc));st.loose++;}}
    const nearSteep=(lx,lz,r)=>{for(let a=0;a<8;a++)for(const d of[0,r/2,r])if(slA(lx+Math.cos(a*TAU/8)*d,lz+Math.sin(a*TAU/8)*d)>STEEP)return true;return false;};
    for(let lz=-40;lz<=216;lz+=9)for(let lx=-268;lx<=-90;lx+=9){const cx=lx+(teH(lx,lz,143)-.5)*4,cz=lz+(teH(lx,lz,144)-.5)*4;if(!LZ(cx,cz)||teH(cx,cz,145)>.55||dI(cx,cz)<6||nearSteep(cx,cz,3))continue;
      const n=3+Math.floor(2*teH(cx,cz,146)),lau=teH(cx,cz,147)<.5;
      for(let i=0;i<n+(lau?1:0);i++){const c=lau&&i===n,a=TAU*(i/n+teH(cx,cz,148)),rr=c?0:1.6+1.2*teH(cx+i,cz,149),lx2=cx+Math.cos(a)*rr,lz2=cz+Math.sin(a)*rr,[x,z]=palW(lx2,lz2);
        if(c){if(!busy(lx2,lz2,x,z,2,1)){const t2=.5+.15*teH(x,z,150);tree(x,z,'broad',t2,[.045,.088,.032],2.6*t2);st.loose++;}continue;}
        const s=.9+.7*teH(x,z,151);if(dI(lx2,lz2)<WB+SR(s)+.3||busy(lx2,lz2,x,z,1.4,0,1))continue;tree(x,z,'shrub',s,MQ(x,z),SR(s));st.loose++;}}}
  // scrub on the west slope (not in the grove)
  for(let lz=-40;lz<=216;lz+=3.5)for(let lx=-268;lx<=-90;lx+=3.5){const jx=lx+(teH(lx,lz,101)-.5)*2.4,jz=lz+(teH(lx,lz,102)-.5)*2.4;if(!inPolyXZ(jx,jz,Wd.rock)||inPolyXZ(jx,jz,Wd.grove)||LZ(jx,jz))continue;
    const[x,z]=palW(jx,jz),r=teH(x,z,103);if(r>.42)continue;if(busy(jx,jz,x,z,1.2,1))continue;const s=.75+.45*teH(x,z,104);
    if(r<.03){tree(x,z,'pine',.8+.3*teH(x,z,104),null,1.5);st.pines++;}else if(r<.07){tree(x,z,'fig',.6+.3*teH(x,z,104),null,1.5);st.shrubs++;}else{tree(x,z,'shrub',s,MQ(x,z),SR(s));st.shrubs++;}}
  // the grove: holm oaks, laurels (smaller, lighter), stone pines (the Magna Mater's: Attis' pine); r 2: the shade and litter round the trunk.
  // The review of 2026-11-13 (after the redo): a third fewer, mostly where they stood in front of the Tiberiana's base and the Magna Mater's lower walls
  // (within 16 m of either model's outline: three in four go; 16-26 m: one in three; further out one in ten), so the walls show (W.palWest.thinned)
  const mm=PAL_ASSETS.find(a=>/magna_mater/.test(a.n)),mmD=(lx,lz)=>{const E=mm&&palRockE[mm.n];if(!E)return 1e9;const t=mm.turn*DEG,c=Math.cos(t),s=Math.sin(t),dx=lx-mm.lx,dz=lz-mm.lz,u=c*dx-s*dz,v=s*dx+c*dz;
    let d=-1e9;for(const[px,pz,nx,nz]of E)d=Math.max(d,(u-px)*nx+(v-pz)*nz);return d;};st.thinned=0;
  for(let lz=50;lz<=220;lz+=5.5)for(let lx=-250;lx<=-86;lx+=5.5){const jx=lx+(teH(lx,lz,105)-.5)*3.4,jz=lz+(teH(lx,lz,106)-.5)*3.4;if(!inPolyXZ(jx,jz,Wd.grove))continue;
    const[x,z]=palW(jx,jz),r=teH(x,z,107);if(r>.82)continue;if(busy(jx,jz,x,z,2.2,1))continue;
    {const sd=Math.min(tibD(jx,jz),mmD(jx,jz));if(teH(x,z,131)<(sd<16?.75:sd<26?.33:.1)){st.thinned++;continue;}}
    const k=teH(x,z,108);if(k<.45)tree(x,z,'broad',.9+.35*teH(x,z,109),[.035,.07,.028],2);else if(k<.72)tree(x,z,'broad',.55+.2*teH(x,z,109),[.045,.088,.032],2);else{tree(x,z,'pine',.85+.3*teH(x,z,109),null,2);st.pines++;}st.grove++;}
  // the foot of the lowest west ring down to the street (the review of 2026-11-13: a gentle slope, shrubs and trees): shrubs within 6 m of its wall line
  // (the view from the terrace), holm oaks and laurels beyond, now and then a stone pine 14 m out or more (its crown about the floor's height); a lattice
  // 4.5 m along the wall foot and 4 m out, as far as the street (W.palWest.foot)
  const lo=WR?Math.min(...WR.lv):null;st.foot=0;
  for(const q of W.wallFeet||[]){if(!q.west||String(q.tag).split(':')[1]!==String(lo)||q.S.length<2)continue;const S=q.S;
    for(let a=1.5;a<q.L-1;a+=4.5){let k=0;while(k<S.length-2&&S[k+1].s<a)k++;const A=S[k],B=S[k+1],t=clamp((a-A.s)/((B.s-A.s)||1),0,1),x0=lerp(A.x,B.x,t),z0=lerp(A.z,B.z,t);
      let nx=A.nx,nz=A.nz;const nl=Math.hypot(nx,nz)||1;nx/=nl;nz/=nl;if(gy(x0+nx*3,z0+nz*3)>gy(x0-nx*3,z0-nz*3)){nx=-nx;nz=-nz;}   // out: down the slope
      for(let d=3;d<=40;d+=4){const j=teH(x0+d,z0-d,121),x=x0+nx*(d+(j-.5)*1.6)+nz*(teH(x0,z0+d,122)-.5)*2.4,z=z0+nz*(d+(j-.5)*1.6)-nx*(teH(x0,z0+d,122)-.5)*2.4;
        if(W.streetAt&&W.streetAt(x,z))break;const[lx,lz]=palL(x,z),h=teH(x,z,123),dd=d+(j-.5)*1.6;
        if(dd<6.5){if(h<.55&&!busy(lx,lz,x,z,1.4,1)){const sc=.9+.5*teH(x,z,124);tree(x,z,'shrub',sc,MQ(x,z),SR(sc));st.foot++;}continue;}
        if(h>.8||busy(lx,lz,x,z,2.4,1))continue;const kk=teH(x,z,125);
        if(kk<.12&&dd>=14){tree(x,z,'pine',.8+.25*teH(x,z,126),null,2);st.pines++;}
        else if(kk<.55)tree(x,z,'broad',.8+.3*teH(x,z,126),[.035,.07,.028],2);
        else if(kk<.8)tree(x,z,'broad',.55+.2*teH(x,z,126),[.045,.088,.032],2);
        else{const sc=1+.6*teH(x,z,126);tree(x,z,'shrub',sc,MQ(x,z),SR(sc));}st.foot++;}}}
  // R5: then every 1.5 m cell over 29.5 degrees (on __palBareSlope's lattice) that no plant covers yet gets a thicket: a shrub 1.4-2.2 (crown 1.5-2.3 m),
  // or one in five a small laurel or holm oak (away from the rings' walls), off the lattice by up to 0.3 m so the fill makes no rows; where that does not fit,
  // a shrub 1 near it, then a shrub 0.8 on the cell itself (large and mixed: a carpet of small equal shrubs read as a heap of stones)
  // In the loose zone (Wd.loose: its steep band at the Tiberiana's foot) a large shrub only (1.5-2.2, no laurel), so the band is one hedge
  for(let lz=-40.75;lz<=216;lz+=1.5)for(let lx=-268.75;lx<=-90;lx+=1.5){if(!inPolyXZ(lx,lz,Wd.rock))continue;const[x,z]=palW(lx,lz),sl=Math.hypot(gy(x+.75,z)-gy(x-.75,z),gy(x,z+.75)-gy(x,z-.75))/1.5;
    if(sl<=Math.tan(29.5*DEG)||cov(x,z))continue;   // 29.5: the check's (__palBareSlope) lattice and slope, half a degree under its 30
    if(busy(lx,lz,x,z,1.5,0,1)){   // r 1.5: the street raster 0.9 m round. Where the paving is all that is in the way (a street's cut bank at the foot), a shrub 0.9
      // up to 0.8 m off the cell, on the first of eight bearings clear of it: its crown (0.95 m) still covers the cell
      if(!busy(lx,lz,x,z,1.5,0,1,1))for(let i=0;i<8;i++){const a=TAU*(i/8+teH(x,z,157)),px=x+Math.cos(a)*.8,pz=z+Math.sin(a)*.8,[ql,qz]=palL(px,pz);
        if(!busy(ql,qz,px,pz,.9,0,1)){tree(px,pz,'shrub',.9,MQ(px,pz),SR(.9));st.fill++;break;}}
      continue;}
    if(LZ(lx,lz)){let s=1.5+.7*teH(x,z,112),px=x+(teH(x,z,114)-.5)*.6,pz=z+(teH(x,z,115)-.5)*.6;const[ql,qz]=palL(px,pz);   // the loose zone's steep band: a hedge of single large shrubs
      if(busy(ql,qz,px,pz,2*SR(s),0,1)){s=1.1;px=x;pz=z;}tree(px,pz,'shrub',s,MQ(px,pz),SR(s));st.fill++;continue;}
    let s=1.4+.8*teH(x,z,112),px=x+(teH(x,z,114)-.5)*.6,pz=z+(teH(x,z,115)-.5)*.6;const[ql,qz]=palL(px,pz);
    if(teH(x,z,117)<.2&&!byWall(px,pz)&&!busy(ql,qz,px,pz,2.2,1)){const k=teH(x,z,118),t=.5+.2*teH(x,z,119);tree(px,pz,'broad',t,k<.5?[.035,.07,.028]:[.045,.088,.032],2.6*t);st.fill++;continue;}
    if(busy(ql,qz,px,pz,2*SR(s),0,1)){s=1;if(busy(ql,qz,px,pz,2*SR(s),0,1)){s=.8;px=x;pz=z;}}
    tree(px,pz,'shrub',s,MQ(px,pz),SR(s));st.fill++;}
  // R5 by the Magna Mater's stair (the author's circle on m2a, 2026-11-14): the slope its upper flights cross, from the temple's base down to the end of 30
  // and the inner edge of 23, lay bare under 29.5 degrees (the grove there was thinned so the temple's walls show; the fill above is for the steeper cells).
  // Clumps of maquis as in the loose zone: a 6 m lattice within 3.5-14 m of the flights above 23, 85 in a hundred of its points where no plant covers the
  // ground yet and the slope is over 6 degrees; three or four shrubs of mixed sizes 1.6-2.8 m round the point, a small laurel in the middle of every other
  // one (low, so the walls still show). W.palWest.mmSlope: the count
  {const mmS=(W.hillStairs||[]).find(h=>h.temple&&/库柏勒/.test(h.temple)),lo23=WR?Math.min(...WR.lv):23;st.mmSlope=0;
    const FL=mmS&&mmS.flights?mmS.flights.filter(s=>s.yT>lo23+.5):[];
    if(FL.length){const dF=(x,z)=>{let d=1e9;for(const[a,b]of FL)d=Math.min(d,segD(x,z,a[0],a[1],b[0],b[1]));return d;};
      let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;for(const s of FL)for(const q of s){const[lx,lz]=palL(q[0],q[1]);bx0=Math.min(bx0,lx);bx1=Math.max(bx1,lx);bz0=Math.min(bz0,lz);bz1=Math.max(bz1,lz);}
      for(let lz=Math.floor((bz0-14)/6)*6;lz<=bz1+14;lz+=6)for(let lx=Math.floor((bx0-14)/6)*6;lx<=bx1+14;lx+=6){const cx=lx+(teH(lx,lz,161)-.5)*3,cz=lz+(teH(lx,lz,162)-.5)*3,[x,z]=palW(cx,cz),dd=dF(x,z);
        if(dd<3.5||dd>14||teH(cx,cz,163)>.85||slA(cx,cz)<Math.tan(6*DEG)||cov(x,z)||busy(cx,cz,x,z,3,1,0,0,1))continue;   // nr: the temple's convex rock outline reaches 10 m out over the soil here; its model's own footprint still counts
        const n=3+Math.floor(2*teH(cx,cz,164)),lau=teH(cx,cz,165)<.5;
        for(let i=0;i<n+(lau?1:0);i++){const c=lau&&i===n,a=TAU*(i/n+teH(cx,cz,166)),rr=c?0:1.6+1.2*teH(cx+i,cz,167),lx2=cx+Math.cos(a)*rr,lz2=cz+Math.sin(a)*rr,[x2,z2]=palW(lx2,lz2);
          if(c){if(!busy(lx2,lz2,x2,z2,2,1,0,0,1)){const t2=.5+.15*teH(x2,z2,168);tree(x2,z2,'broad',t2,[.045,.088,.032],2.6*t2);st.mmSlope++;}continue;}
          const s2=.9+.7*teH(x2,z2,169);if(dF(x2,z2)<2.8+SR(s2)||busy(lx2,lz2,x2,z2,1.4,0,1,0,1))continue;tree(x2,z2,'shrub',s2,MQ(x2,z2),SR(s2));st.mmSlope++;}}}}}
// after terraceFeet (monuments.js): no tall tree within 6 m of the outer edge of a west ring (the wall line, either side: on the terrace and on the slope or
// the floor below), so the grove does not hide the terrace or its view (the review of 2026-11-13); a shrub instead. Low kinds stay; every tree there keeps
// its kind (owner 3: the hill's species pass would change it)
function palWestClear(W){const R=(W.wallFeet||[]).filter(r=>r.west&&r.S.length>1);if(!R.length)return 0;const E=[];let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const r of R)for(let i=1;i<r.S.length;i++){const a=r.S[i-1],b=r.S[i];E.push([a.x,a.z,b.x,b.z]);x0=Math.min(x0,a.x,b.x);x1=Math.max(x1,a.x,b.x);z0=Math.min(z0,a.z,b.z);z1=Math.max(z1,a.z,b.z);}
  const LOW={shrub:1,flower:1,almond:1,pomegr:1},PP=new Map((W.palPlants||[]).map(p=>[p[0]+','+p[1],p]));let n=0;
  for(const t of W.trees){if(t[0]<x0-6||t[0]>x1+6||t[2]<z0-6||t[2]>z1+6||!E.some(e=>segD(t[0],t[2],e[0],e[1],e[2],e[3])<6))continue;
    if(!t[6])t[6]=3;if(LOW[t[3]])continue;t[3]='shrub';t[4]=.8+.4*teH(t[0],t[2],120);t[5]=null;n++;
    const p=PP.get(t[0]+','+t[2]);if(p)p[2]=Math.min(p[2],1.06*t[4]);}   // a plant of palWestSlope: its crown (W.palPlants, __palBareSlope's cover) is now the shrub's
  if(W.palWest)W.palWest.cleared=n;return n;}
// ---- H5.1 (round 4, built as b2: 32_h51_west_end) ----
// The pieces of h51 that are not a terrace's floor, wall or stair. The solid fills (R12 15.5): W17 under the promenade's east edge (0.4 thick, its top the
// saddle wall's coping 56.45 with the promenade's slab on it; on over d@34's tuff block from the block's top to 10.384, where d@34's own west wall starts),
// the pocket west of d@34 filled to its wing wall's top (55.12, a coping on its face over the lane), apF2..9 between the Apollo's buttresses behind the
// blocks (54.3; where h51's cut wall stands, the court's end, the wall's cap is their top, so theirs is laid 1 cm lower and they have no face of their own
// there). The lane's end wall (end) with its niche; the recess of the court's end niche (niches: the wall's face round its opening is palCutWall's); the
// planting bed at c@156's north foot (bed). Returns the counts.
function palH51Works(W,g){const H=PAL_PLAN.h51;if(!H.on)return null;const st={fills:0,niches:0,bed:0},yH=H.plats[0].y+.06;
  const gMin=(x0,x1,z0,z1)=>{let m=1e9;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){const q=palW(lerp(x0,x1,i/4),lerp(z0,z1,j/4));m=Math.min(m,W.gy(q[0],q[1]));}return m;};
  const blk=(x0,x1,z0,z1,y0,y1,f=31)=>box(g,PFR,(x0+x1)/2,y0,(z0+z1)/2,(x1-x0)/2,y1-y0,(z1-z0)/2,f),stone=()=>g.set(60,.45,1,0),
    flat=(x0,x1,z0,z1,y)=>g.poly([[x0,z1],[x1,z1],[x1,z0],[x0,z0]].map(q=>PFR.p(q[0],y,q[1])),[0,1,0]);
  for(const p of H.pads||[]){if(!p.fill)continue;const[x0,x1,z0,z1]=p.box,yb=Math.min(gMin(x0,x1,z0,z1),yH)-.8;stone();
    if(p.id==='W17'){blk(x0,x1,z0,z1,yb,p.y);blk(x0,x1,z1,10.384,55.3,p.y);st.fills++;continue;}   // its top under the promenade's slab
    if(p.id==='W17s'){blk(x0,x1,z0,z1,yb,p.y);(W.palPads=W.palPads||[]).push({id:p.id,x0,x1,z0,z1,y:p.y});st.fills++;continue;}   // review 34: on south past the tuff block, under the slab (no coping, no paved top); d@34's west face stands against it, as its back against apF (__palBaseCheck)
    if(/^apF/.test(p.id))(W.palPads=W.palPads||[]).push({id:p.id,x0,x1,z0,z1,y:p.y});   // review 34: the fill d_low's back wall stands against (__palBaseCheck)
    const yt=p.y-.01,back=/^apF/.test(p.id);blk(x0,x1,z0,z1,yb,yt,back?31&~16&~4:31&~16);g.set(60,.4,1,3);flat(x0,x1,z0,z1,yt);
    if(!back){trimSet(g,1,.5);blk(x0,x1,z0-.12,z0+.38,yt-.37,yt+.08);}   // over the lane: a coping as the cut walls'
    st.fills++;}
  const niche=(x0,x1,z0,z1,y0,y1,open)=>{stone();const P=(x,y,z)=>PFR.p(x,y,z),q=(a,b,c,d,n)=>g.poly([P(...a),P(...b),P(...c),P(...d)],PFR.d(...n));
    // the recess between (x0,z0) and (x1,z1): open is the side it opens to ('-x' or '-z'); its back, two sides, the sill (with a travertine slab) and the head
    if(open==='-z'){q([x1,y0,z1],[x0,y0,z1],[x0,y1,z1],[x1,y1,z1],[0,0,-1]);q([x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[1,0,0]);q([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],[-1,0,0]);}
    else{q([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],[-1,0,0]);q([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[0,0,1]);q([x1,y0,z1],[x0,y0,z1],[x0,y1,z1],[x1,y1,z1],[0,0,-1]);}
    q([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[0,-1,0]);trimSet(g,1,.5);flat(x0,x1,open==='-z'?z0-.03:z0,z1,y0+.005);st.niches++;};   // review 35: the sill 3 cm out over the face's cut, or the seam showed the ground behind
  if(H.end){const E=H.end,N=E.niche,yb=yH-.66;stone();{const q=PFR.p(E.x0+1.75,0,(E.z0+E.z1)/2);(ROME.supports=ROME.supports||[]).push({x:q[0],z:q[2],c:Math.cos(PALF.rot),s:Math.sin(PALF.rot),hw:1.75,hd:(E.z1-E.z0)/2});}   // palH51EndHold
    if(N){const z0=N.z-N.w/2,z1=N.z+N.w/2,ys=yH+N.sill,yh=ys+N.h;blk(E.x0,E.x1,E.z0,z0,yb,E.top);blk(E.x0,E.x1,z1,E.z1,yb,E.top);blk(E.x0,E.x1,z0,z1,yb,ys);
      blk(E.x0,E.x1,z0,z1,yh,E.top);blk(E.x0+N.d,E.x1,z0,z1,ys,yh,31&~8);niche(E.x0,E.x0+N.d,z0,z1,ys,yh,'-x');}
    else blk(E.x0,E.x1,E.z0,E.z1,yb,E.top);
    trimSet(g,1,.5);blk(E.x0-.25,E.x1,E.z0,E.z1,E.top-.37,E.top+.08);}
  for(const c of H.niches||[]){const ys=c.on+.06+c.sill;if(c.dir===1)niche(c.x-c.w/2,c.x+c.w/2,c.z,c.z+c.d,ys,ys+c.h,'-z');}
  // review 35 (11-16): the Apollo buttresses between the apF fills are solid masonry against d_low's back wall (body 0.05-0.07 off it, caps 56.15-56.5).
  // Registered in W.palPads at the lowest cap top (56.15) so __palBaseCheck reads what really stands behind the wall: a sampling correction, the limit is unchanged
  {const F=(H.pads||[]).filter(p=>/^apF/.test(p.id)).sort((a,b)=>a.box[0]-b.box[0]);for(let i=1;i<F.length;i++){const a=F[i-1].box,b=F[i].box;if(b[0]-a[1]>4)continue;
    (W.palPads=W.palPads||[]).push({id:'apButt',x0:a[1],x1:b[0],z0:a[2],z1:a[3],y:56.15});}}
  // review 34 (11-16): the end walls' upper halves (model y -3..13: the split to the back corner) rise 3.36 from h51's floor; a travertine plinth along each,
  // 0.15 high (top 51.97), 0.40 out from the face (cut where a fill stands closer: W17s at d@34's west, 0.22), from the split to the corner. Registered in
  // W.palPads: the wall stands on it (__palBaseCheck, 3.15 under the limit 3.3). No door in those halves; along the lane it is a 0.15 kerb at the wall's foot
  st.plinth=0;for(const B of palBL){if(!B.h51)continue;for(const sx of[1,-1]){let[x0,x1,z0,z1]=palModelRect(B.lx,B.lz,B.tn,sx>0?17:-17.4,sx>0?17.4:-17,-3,13);
    const yt=yH+.15,put=(a,b,c,d)=>{if(b-a<.01||d-c<.01)return;trimSet(g,1,.5);blk(a,b,c,d,yH-.05,yt);(W.palPads=W.palPads||[]).push({id:'h51plinth',x0:a,x1:b,z0:c,z1:d,y:yt});};
    let cx0=x0,cx1=x1,cz0=z1,cz1=z0;   // the cut applies only along the fill's own z span; north and south of it the plinth keeps its 0.40
    for(const p of H.pads||[]){if(!p.fill||p.box[2]>=z1||p.box[3]<=z0)continue;if(p.box[1]>x0&&p.box[1]<x1)cx0=p.box[1];if(p.box[0]<x1&&p.box[0]>x0)cx1=p.box[0];cz0=Math.min(cz0,Math.max(z0,p.box[2]));cz1=Math.max(cz1,Math.min(z1,p.box[3]));}
    if(cz0>=cz1)put(x0,x1,z0,z1);else{put(x0,x1,z0,cz0);put(cx0,cx1,cz0,cz1);put(x0,x1,cz1,z1);}st.plinth++;}}
    // review 35 (11-16): d@75's back wall east of apF9 (lx 85.41) faces the east pocket's floor (51.82), 3.36 bare. The same plinth runs along it from apF9 to
    // the east end wall's plinth (one ring round the corner); registered in W.palPads
    {const B=palBL.find(b=>b.h51&&Math.abs(b.lx-75)<1),f9=(H.pads||[]).find(p=>p.id==='apF9');if(B&&f9){const E=W.palPads.filter(p=>p.id==='h51plinth'&&p.x0>f9.box[1]&&p.z1>20).sort((a,b)=>b.x1-a.x1)[0];
      if(E){const yt=yH+.15,x0=f9.box[1],x1=E.x1,z0=E.z1,z1=f9.box[2]+.4;trimSet(g,1,.5);blk(x0,x1,z0,z1,yH-.05,yt);W.palPads.push({id:'h51plinth',x0,x1,z0,z1,y:yt});st.plinthBack=[x0,x1,z0,z1];}}}
  if(H.bed){const B=H.bed,y=palPlById(B.on).y+.06,yt=y+B.h;trimSet(g,1,.5);blk(B.x0,B.x1,B.z0,B.z1,y-.3,yt);g.set(23,.4);flat(B.x0+.15,B.x1-.15,B.z0+.15,B.z1-.15,yt+.01);
    for(let x=B.x0+.8;x<B.x1-.4;x+=1.6){const q=PFR.p(x,0,(B.z0+B.z1)/2),k=teH(q[0],q[2],121),t=[q[0],yt,q[2],k<.5?'shrub':impGarden(k),.6+.3*teH(q[0],q[2],122),null,1];W.trees.push(t);palBedLog(W,'h51bed',t);st.bed++;}}
  return st;}

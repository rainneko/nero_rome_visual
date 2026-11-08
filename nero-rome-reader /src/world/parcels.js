/* ================= P3 (briefs/rome/road-first-city.md 4.4, 7, 9, 10): blocks -> lots -> houses, behind ?city=v2 =================
   cityParcelsArea(W,o) sets W.v2At: the districts the fabric cut (fabric.js, P2), less what o.excl leaves to its own generator (the Palatine, the
   valley, the noble core, the Campus). The old generators keep out of it (monuments.js, housing.js). cityParcels(W,o) then builds every block whose
   old zone builds houses (o.zone, bzone in monuments.js), with dice keyed to the block's pole:
   1. the ring is cleaned (the prototype's clean_ring: no vertex within 9° of straight or beside an edge under 3 m, unless the chord would cut into
      the street: a bent street keeps its bends); edges on a main road step back PCL.roadBack from its corridor, which the houses' eaves and lotHits
      keep clear of. An edge on a precinct's ring faces a street only where the ring's band is clear 2 m out (an open reserve may reach the edge);
   2. every edge that faces a street (main road, secondary street, precinct ring, square) gets a strip of lots one lot deep, cut into quads with
      the front on the edge (lotBuild's L[0] -> L[1]). A convex corner between two such edges takes a corner house (its front on the main road
      where it has one, and off a side under 2 m: a jog in the block's edge, where a street ends on a precinct's ring); at a concave one, or a bend
      within 30° of straight, the two strips meet on the bisector. An edge on a cliff or at the district's edge has no strip: the court reaches it,
      and a garden wall closes it. Acute corners: under 55° the corner house is two wedges meeting on the bisector, under 35° the tip (6-10 m) is a
      small square. An edge shorter than its corners take closes in the inset (pcInset, as a straight skeleton): up to 6 m it joins the next lot,
      longer it is a fan of lots that meet at the point it closed to;
   3. what the strips leave inside is the court (an inset by each edge's depth: pcInset). No court at the full depth: .45, then .4 of the block's
      thickness, at least 6.5 m (shallower houses round a light well). Still none: rows across the block's long axis, each lot facing its street.
   4. a block over 1500 m² gets a dead-end lane (angiportus, 2.4-2.6 m) into its court from the middle of its longest edge off the main roads; a
      strip on a main road a passage (2.2-3 m) every 40-56 m (the author, 2026-11-04). Both go into W.laneLog: the street raster paves them.
   5. each lot's front is cut parallel to the street it faces where the block's edge is off it by more than 5° (H14: an edge the snap left on the
      raster's steps, by a main road); a lot that still touches a road's footprint steps its front back, the ends sliding along its sides; a lot on
      a secondary street is dropped (H11). It is built by lotBuild with its zone's house, a shop house on a main road, cut first across its front
      where it is too big for one house (pcFit: lotBuild's own cut would turn some houses from their street); the court is a garden when the ring
      closes, walled where a stretch is missing (the U), or a yard, as in genBlocks. Lots, lanes and court go into W.foot.
   The secondary streets and squares then become road footprints (no tree or prop on them); buildStreets paves them from their polygons instead
   of the 9 m rule (o.v2), and the aprons: the ground before a lot on a ring, or set back from a main road. W.parcels keeps it all for the review
   layer 'parcels' and tools/test/city-audit.mjs (H10, H11, H14). */
const PCL={dim:{dense:{D:[10.5,13],W:[7,10.5]},mid:{D:[12,15],W:[9.5,13.5]},domus:{D:[8.5,10.5],W:[12,16]}},
  front:{road:1,street:1,ring:1,square:1},roadBack:1.1,stepBack:[.8,1.6,2.6],minLot:14,minFront:2,ringClear:2.5,farLine:12,life:{w:11,d:9,at:3.9,flat:.12},
  lane:{area:1500,edge:3.5,w:{dense:2.4,mid:2.6,domus:2.6}},pass:{run:[40,56],w:[2.2,3],end:12},
  acute:{wedge:55,tip:35,len:[6,10]},soft:150,clean:{out:.1,in:.6},align:5,chain:6,fall:[.45,.4],minFall:6.5,court:{area:35,r:2.5},
  cal:{dense:1.1,mid:.9,domus:1},   // P4: the lot widths times this, so each class has as many houses as the old city on the same ground (city-audit.mjs, the ratio)
  glb:{back:.5,deeper:1.5,side:.3,front:.15},   // P4: a GLB insula's lot: the strip deepened to the model's depth + back (at most deeper past the class's), side each side, its front front behind the lot's
  shop:R=>({part:R()<.3?9:0,seed:R(),sty:3+(R()<.4?8:0),fl:2|16,nSt:3+Math.floor(R()*3),gH:3.9,sH:2.9,pitch:20*DEG,lit:.7,flat:false,noSplit:true,awn:.3,balc:.1})};   // fillRoadFrontage's shop house

function pcLen(P,i){const a=P[i],b=P[(i+1)%P.length];return Math.hypot(b[0]-a[0],b[1]-a[1]);}
// the prototype's clean_ring on a fabric ring: drop a vertex within 9° of straight, or beside an edge under 3 m, when the chord that replaces it stays
// within PCL.clean of where it was: .1 m out into the street (a chord across the inside of a bend), .6 m in. The least moved vertex goes first; the merged
// edge keeps the meta of the longer one
function pcClean(P0,E0){const P=P0.map(p=>p.slice()),E=E0.slice();
  while(P.length>3){const n=P.length;let best=-1,bd=Infinity;
    for(let i=0;i<n;i++){const p=P[(i+n-1)%n],v=P[i],q=P[(i+1)%n],a1=Math.atan2(p[1]-v[1],p[0]-v[0]),a2=Math.atan2(q[1]-v[1],q[0]-v[0]),th=((a1-a2)%TAU+TAU)%TAU;
      if(!(Math.abs(th-Math.PI)<9*DEG||Math.hypot(q[0]-v[0],q[1]-v[1])<3||Math.hypot(v[0]-p[0],v[1]-p[1])<3))continue;
      const dev=((q[0]-p[0])*(v[1]-p[1])-(q[1]-p[1])*(v[0]-p[0]))/(Math.hypot(q[0]-p[0],q[1]-p[1])||1);   // > 0: v left of the chord (a concave vertex), which would pass outside the block
      if(dev>PCL.clean.out||-dev>PCL.clean.in||Math.abs(dev)>=bd)continue;best=i;bd=Math.abs(dev);}
    if(best<0)break;const i=best,im=(i+n-1)%n,v=P[i];if(Math.hypot(P[(i+1)%n][0]-v[0],P[(i+1)%n][1]-v[1])>Math.hypot(v[0]-P[im][0],v[1]-P[im][1]))E[im]=E[i];P.splice(i,1);E.splice(i,1);}
  return{P,E};}
// each edge moved in by its own distance d[i] (the prototype's inset_ring, and pInset with one distance per edge): Q[i] is where vertex i goes. An edge
// shorter than its corners take (between two convex turns) shrinks to nothing and its neighbours meet, as in a straight skeleton: Q keeps one point per
// vertex, the ends of such an edge on one point, and Q.dead marks the edge. null when fewer than 3 edges are left, the result is under minA m² or crosses itself
function pcInset(P,d,minA=30){const n=P.length,L=[];
  for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l;L.push([a[0]-uz*d[i],a[1]+ux*d[i],ux,uz]);}
  const X=(i,j)=>{const A=L[i],B=L[j],den=A[2]*B[3]-A[3]*B[2];   // where the lines of edges i and j meet (parallel: the same line, going on)
      if(Math.abs(den)<1e-6)return Math.abs(d[i]-d[j])<1e-6&&A[2]*B[2]+A[3]*B[3]>0?[B[0],B[1]]:null;const t=((B[0]-A[0])*B[3]-(B[1]-A[1])*B[2])/den;return[A[0]+A[2]*t,A[1]+A[3]*t];},
    dead=new Array(n).fill(false),prv=i=>{let j=(i+n-1)%n;while(dead[j])j=(j+n-1)%n;return j;},nxt=i=>{let j=(i+1)%n;while(dead[j])j=(j+1)%n;return j;};
  for(let m=n;;){let w=-1,wl=1e-6;
    for(let i=0;i<n;i++){if(dead[i])continue;const s=X(prv(i),i),e=X(i,nxt(i));if(!s||!e)return null;const len=(e[0]-s[0])*L[i][2]+(e[1]-s[1])*L[i][3];if(len<wl){wl=len;w=i;}}
    if(w<0)break;dead[w]=true;if(--m<3)return null;}
  const Q=[];for(let i=0;i<n;i++){const a=dead[(i+n-1)%n]?prv((i+n-1)%n):(i+n-1)%n,b=dead[i]?nxt(i):i,q=X(a,b);if(!q)return null;Q.push(q);}
  const U=Q.filter((q,i)=>!dead[i]);if(pArea(U)<minA||fbSelfX([U]))return null;Q.dead=dead;return Q;}
function pcOK(L){return L.length>=3&&pArea(L)>=PCL.minLot&&!fbSelfX([L]);}

// the lots of one block (ring P, edge meta E, counter-clockwise: the block on the left of each edge): {lots, court, lanes, gaps, tips, Dp, lw, mode}
function pcLots(P,E,dk,R,area,dq,want){const n=P.length,dim=PCL.dim[dk],front=E.map(e=>!!(e&&PCL.front[e.k]));
  const res={lots:[],court:null,well:null,lanes:[],gaps:[],tips:[],Dp:0,lw:0,mode:'ring',dropped:0};
  if(n<3||!front.some(Boolean)){res.mode='none';return res;}
  let Dp=lerp(dim.D[0],dim.D[1],R());const lw=lerp(dim.W[0],dim.W[1],R())*(PCL.cal[dk]||1)/Math.sqrt(dq);res.lw=lw;   // fewer, wider lots at a lower density (as genBlocks)
  // a GLB insula (want: its models in order of choice): on the longest secondary-street edge, whose strip alone is deepened to take the deepest of them
  let gI=-1,Dg=Dp;if(want){const ok=want.models.filter(m=>m.d+PCL.glb.back<=dim.D[1]+PCL.glb.deeper);let best=0;for(let i=0;i<n;i++){if(!front[i]||E[i].k!=='street')continue;const l=pcLen(P,i);if(l>best){best=l;gI=i;}}
    if(!ok.length){res.glbMiss='deep';want=null;gI=-1;}else if(gI<0){res.glbMiss='edge';want=null;}else{want={models:ok,t:want.t};Dg=Math.max(Dp,...ok.map(m=>m.d+PCL.glb.back));}}
  const Di=i=>i===gI?Dg:Dp;
  const turn=i=>{const p=P[(i+n-1)%n],v=P[i],q=P[(i+1)%n];return(p[0]-v[0])*(q[1]-v[1])-(p[1]-v[1])*(q[0]-v[0]);},reflex=P.map((_,i)=>turn(i)>0);
  const ang=i=>{const p=P[(i+n-1)%n],v=P[i],q=P[(i+1)%n],ax=p[0]-v[0],az=p[1]-v[1],bx=q[0]-v[0],bz=q[1]-v[1];return Math.acos(clamp((ax*bx+az*bz)/((Math.hypot(ax,az)*Math.hypot(bx,bz))||1),-1,1))/DEG;};
  const soft=P.map((_,i)=>reflex[i]||ang(i)>=PCL.soft);   // a concave vertex, or a convex one within 30° of straight (a bend of the street): the strips meet on the bisector
  let Q=pcInset(P,front.map((f,i)=>f?Di(i):0));
  if(!Q&&gI>=0){gI=-1;want=null;res.glbMiss='well';Q=pcInset(P,front.map(f=>f?Dp:0));}   // too thin for the model's depth: the block as without it
  if(!Q){const t=fbThick([{P}]);for(const k of PCL.fall){const d=k*t;if(d<PCL.minFall)continue;Q=pcInset(P,front.map(f=>f?d:0));if(Q){Dp=d;res.mode='well';break;}}}
  res.Dp=Dp;if(!Q)return pcThin(P,E,dim,lw,res);
  const dead=Q.dead,U=Q.filter((q,i)=>!dead[i]),ci=[];for(let i=0,c=0;i<n;i++)ci.push(dead[i]?-1:c++);   // U: the court without the edges the inset closed; ci: a block edge's edge of U
  for(let i=0;i<n;i++)if(dead[i])soft[i]=soft[(i+1)%n]=true;
  if(pArea(U)>=PCL.court.area&&fbPole([{P:U}],PCL.court.r,1).d>PCL.court.r)res.court=U;else res.well=U;   // a court a person can stand in, else a light well
  // the dead-end lane: the longest edge off the main roads, over 3.5 lots long, in a block over 1500 m²
  let laneI=-1;if(area>PCL.lane.area&&res.court){let best=0;for(let i=0;i<n;i++){if(!front[i]||E[i].k==='road'||i===gI)continue;const l=pcLen(P,i);if(l>PCL.lane.edge*lw&&l>best){best=l;laneI=i;}}}
  // the GLB insula's lot on edge gI: the model's width + 2 side (pcGlbCuts), the first model the strip takes (as wide as its lot, as deep as Dg)
  const gw=want&&gI>=0&&!dead[gI]?want:null;if(want)res.glbMiss=gw?'short':'edge';   // cleared when the GLB lot is cut
  const gFit=len=>gw.models.find(m=>m.w+2*PCL.glb.side<=len&&m.d+PCL.glb.back<=Dg+1e-6);
  const add=(L,o)=>{if(pcOK(L))res.lots.push(Object.assign({L},o));else res.dropped++;};
  // a run of edges the inset closed (between two convex turns): up to PCL.chain m long (a corner cut off) it goes to the first lot after it, or the last
  // before it when that one is on a main road and the other is not, or the one after has no strip: its points join that lot's outline. A longer run
  // (the narrow end of a wedge of a block) is a fan: each of its edges on a street cut into lots that meet at the point the inset closed to
  const chain=new Map();for(let e=0;e<n;e++){if(!dead[e]||dead[(e+n-1)%n])continue;const C=[];let j=e,len=0;while(dead[j]){C.push(P[j]);len+=pcLen(P,j);j=(j+1)%n;}const bf=(e+n-1)%n;
    if(len<=PCL.chain){chain.set(front[j]&&!(E[bf].k==='road'&&E[j].k!=='road')||!front[bf]?'a'+j:'b'+bf,{C,end:P[j]});continue;}
    for(let d=e;d!==j;d=(d+1)%n){const l=pcLen(P,d);if(!front[d]||l<PCL.minFront)continue;const a=P[d],b=P[(d+1)%n],k=Math.max(1,Math.round(l/lw));
      for(let t=0;t<k;t++)add([lp(a,b,t/k),lp(a,b,(t+1)/k),Q[d]],{edge:d,k:E[d].k,shop:E[d].k==='road',fan:true});}}
  for(let i=0;i<n;i++){if(!front[i]||dead[i])continue;const i0=(i+n-1)%n,i1=(i+1)%n,a=P[i],b=P[i1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<1e-6)continue;
    const ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,nx=-uz,nz=ux,at=(s,d=0)=>[a[0]+ux*s+nx*d,a[1]+uz*s+nz*d],ft=q=>(q[0]-a[0])*ux+(q[1]-a[1])*uz,s0=ft(Q[i]),s1=ft(Q[i1]),k0=E[i].k;
    // the corner house at a, between this edge and the one before (both on streets, a convex corner)
    if(!soft[i]&&front[i0]){const pa=P[i0],lv=Math.hypot(a[0]-pa[0],a[1]-pa[1])||1,vx=(a[0]-pa[0])/lv,vz=(a[1]-pa[1])/lv,sp=(Q[i][0]-pa[0])*vx+(Q[i][1]-pa[1])*vz,th=ang(i),k1=E[i0].k,shop=k0==='road'||k1==='road',
        // its sides run along both edges to where Q[i] falls on them; past the far end of an edge (a concave vertex there) they go round it to its inset point
        A=s0<=l?[at(Math.max(s0,0))]:[b,Q[i1]],B=sp>=0?[[pa[0]+vx*sp,pa[1]+vz*sp]]:[Q[i0],pa],e0=A[0],fp=B[0],K=[a,...A,Q[i],...B];
      if(th>=PCL.acute.wedge){const fi=A.length>1?l:Math.max(s0,0),f0=B.length>1?lv:lv-sp,fb=k1==='road'&&k0!=='road'||fi<PCL.minFront&&f0>fi;   // its front on the main road where it has one, and on the edge
        if(Math.max(fi,f0)<PCL.minFront)res.dropped++;else add(fb?[K[K.length-1],...K.slice(0,-1)]:K,{edge:fb?i0:i,k:fb?k1:k0,shop,corner:true});}   // before where its side on this one is a stub (a jog: a street's end on a ring)
      else{const tt=th<PCL.acute.tip&&A.length===1&&B.length===1?Math.min(lerp(PCL.acute.len[0],PCL.acute.len[1],R())/Math.cos(th/2*DEG),.7*Math.max(s0,0)):0;
        if(tt>1.5){const pi=at(tt),pm=[a[0]-vx*tt,a[1]-vz*tt],M=[(pi[0]+pm[0])/2,(pi[1]+pm[1])/2];res.tips.push([a,pi,pm]);   // the tip: a small square (a shrine or a basin, P5)
          add([pi,e0,Q[i],M],{edge:i,k:k0,shop:k0==='road',corner:true,wedge:true});add([fp,pm,M,Q[i]],{edge:i0,k:k1,shop:k1==='road',corner:true,wedge:true});}
        else{add([a,...A,Q[i]],{edge:i,k:k0,shop:k0==='road',corner:true,wedge:true});add([B[B.length-1],a,Q[i],...B.slice(0,-1)],{edge:i0,k:k1,shop:k1==='road',corner:true,wedge:true});}}}   // two wedges on the bisector
    // the strip: from the corner house (or the vertex, at a concave corner or beside an edge with no strip) to the next
    const o0=soft[i]||!front[i0]?0:s0,o1=soft[i1]||!front[i1]?l:s1,lo=Math.max(o0,s0),hi=Math.min(o1,s1);if(hi-lo<PCL.minFront)continue;
    let T=null;const gm=i===gI?gFit(hi-lo):null;if(gm){T=pcGlbCuts(lo,hi,gm.w+2*PCL.glb.side,lw,gw.t);T.n=gm.n;res.glbMiss=null;}
    if(!T){const k=Math.max(1,Math.round((hi-lo)/lw));T=[lo];for(let j=1;j<k;j++)T.push(lo+(hi-lo)*(j+(R()-.5)*.44)/k);T.push(hi);}const k=T.length-1;
    const gap=new Map();if(i===laneI&&k>=3)gap.set(k>>1,{w:PCL.lane.w[dk],kind:'lane'});
    if(res.court&&k0==='road'&&k>=3){let last=0,run=lerp(PCL.pass.run[0],PCL.pass.run[1],R());   // a passage through the shop row every 40-56 m, none near its ends
      for(let j=1;j<k;j++){if(gap.has(j)||T[j]-last<run||T[j]<PCL.pass.end||l-T[j]<PCL.pass.end)continue;gap.set(j,{w:lerp(PCL.pass.w[0],PCL.pass.w[1],R()),kind:'passage'});last=T[j];run=lerp(PCL.pass.run[0],PCL.pass.run[1],R());}}
    const ca=chain.get('a'+i),cb=chain.get('b'+i);
    for(let j=0;j<k;j++){let t0=T[j],t1=T[j+1];const g0=gap.get(j),g1=gap.get(j+1);if(g0)t0+=g0.w/2;if(g1)t1-=g1.w/2;if(t1-t0<PCL.minFront)continue;
      const L=[j===0?at(o0):at(t0),j===k-1?at(o1):at(t1),j===k-1?Q[i1]:at(t1,Di(i)),j===0?Q[i]:at(t0,Di(i))];
      if(j===0&&ca)L.push(...ca.C);if(j===k-1&&cb)L.splice(2,0,...cb.C.slice(1),cb.end);   // the closed corner (cb.C[0] is this edge's end, L[1])
      add(L,{edge:i,k:k0,shop:k0==='road',corner:!!(j===0&&ca||j===k-1&&cb)||undefined,glb:j===T.jg?T.n:undefined});}
    for(const[j,g]of gap){const m=T[j],h=g.w/2,den=s1-s0;res.lanes.push({P:[at(m-h),at(m+h),at(m+h,Dp+.3),at(m-h,Dp+.3)],kind:g.kind,edge:i});
      if(Math.abs(den)>1e-6)res.gaps.push({edge:ci[i],from:(m-h-s0)/den,to:(m+h-s0)/den});}}
  // a lot that overlaps one before it (a concave corner too sharp for its depth) is dropped
  const keep=[],ins=L=>pInset(L,.12)||L;for(const o of res.lots){const I=ins(o.L);if(keep.some(q=>residentialOverlap(I,q.I))){res.dropped++;continue;}o.I=I;keep.push(o);}
  for(const o of keep)delete o.I;res.lots=keep;if(want&&!res.glbMiss&&!keep.some(o=>o.glb))res.glbMiss='lost';return res;}
// a block too thin for a court: rows across its long axis every lot width, and a cut down the middle when it is two lots deep; each piece faces the
// longest of its edges on a street (lotBuild's front), a piece with none is left open
function pcThin(P,E,dim,lw,res){res.mode='rows';const H=fbHull(P);let bo=null;
  for(let i=0;i<H.length;i++){const a=H[i],b=H[(i+1)%H.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<1e-9)continue;const ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l;let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
    for(const p of H){const u=p[0]*ux+p[1]*uz,v=-p[0]*uz+p[1]*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}const A=(u1-u0)*(v1-v0);if(!bo||A<bo.A)bo={A,ux,uz,lu:u1-u0,lv:v1-v0};}
  if(!bo)return res;const ux=bo.lu>=bo.lv?bo.ux:-bo.uz,uz=bo.lu>=bo.lv?bo.uz:bo.ux,vx=-uz,vz=ux;let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
  for(const p of P){const u=p[0]*ux+p[1]*uz,v=p[0]*vx+p[1]*vz;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
  const Wp=(u,v)=>[u*ux+v*vx,u*uz+v*vz],Lo=u1-u0,k=Math.max(1,Math.round(Lo/lw)),cuts=[];
  for(let j=1;j<k;j++){const u=u0+Lo*j/k;cuts.push([Wp(u,v0-3),Wp(u,v1+3)]);}
  if(v1-v0>2*dim.D[0]*.9){const v=(v0+v1)/2;cuts.push([Wp(u0-3,v),Wp(u1+3,v)]);}
  let pieces=[[{P,E}]];for(const C of cuts){const nx=[];for(const Y of pieces){const r=fbSplit(Y,C,{k:'cut'});if(r)nx.push(...r.L,...r.R);else nx.push(Y);}pieces=nx;}
  for(const Y of pieces){const r=Y[0];let f=-1,fl=0;for(let i=0;i<r.P.length;i++){const e=r.E[i];if(!e||!PCL.front[e.k])continue;const l=pcLen(r.P,i);if(l>fl){fl=l;f=i;}}
    if(f<0||fl<PCL.minFront){res.dropped++;continue;}const L=r.P.slice(f).concat(r.P.slice(0,f));if(pcOK(L))res.lots.push({L,edge:-1,k:r.E[f].k,shop:r.E[f].k==='road',row:true});else res.dropped++;}
  return res;}

// a lot too big for one house (residentialSolidFits) cut in two until each part fits: across its front at the front's middle, or across its depth when
// it is deeper than wide. Every part keeps its share of the front as L[0] -> L[1] (a back part: the cut), where lotBuild's own split (splitResidentialPolygon,
// along the box's long axis) would turn some houses away from their street
function pcFit(L,lvl=0){if(lvl>4||residentialSolidFits(L))return[L];
  const a=L[0],b=L[1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,U=p=>(p[0]-a[0])*ux+(p[1]-a[1])*uz,V=p=>(p[1]-a[1])*ux-(p[0]-a[0])*uz,
    vs=L.map(V),across=l>=Math.max(...vs)-Math.min(...vs)||l>=16,c=across?l/2:(Math.min(...vs)+Math.max(...vs))/2,f=across?p=>U(p)-c:p=>V(p)-c,out=[];
  for(const sg of[1,-1]){const P=[];for(let i=0;i<L.length;i++){const p=L[i],q=L[(i+1)%L.length],fp=f(p)*sg,fq=f(q)*sg;if(fp<=1e-9)P.push(p);if(fp*fq<0&&Math.abs(fp)>1e-9&&Math.abs(fq)>1e-9)P.push(lp(p,q,fp/(fp-fq)));}
    if(P.length<3||Math.abs(pArea(P))<PCL.minLot)continue;
    let r=-1;for(let i=0;i<P.length&&r<0;i++){const p=P[i],q=P[(i+1)%P.length],on=across||sg>0?x=>Math.abs(V(x))<1e-6:x=>Math.abs(V(x)-c)<1e-6;if(on(p)&&on(q)&&U(q)-U(p)>1e-6)r=i;}   // the front: on the old front's line, or the cut
    if(r<0)continue;out.push(...pcFit(P.slice(r).concat(P.slice(0,r)),lvl+1));}
  return out.length?out:[L];}
// P4, a GLB insula on a lot of its size: the strip lo..hi cut so one lot is wg wide (the model and its sides), the rest into lots of about lw each side of it,
// t (0-1) choosing how many go before it; under 0.6 lw left over, the lot takes the whole strip. Returns the cuts, T.jg the GLB lot's index
function pcGlbCuts(lo,hi,wg,lw,t){const rest=hi-lo-wg;if(rest<.6*lw){const T=[lo,hi];T.jg=0;return T;}
  const m=Math.max(1,Math.round(rest/lw)),u=rest/m,kl=Math.min(m,Math.floor(t*(m+1))),T=[lo];let x=lo;
  for(let j=0;j<kl;j++)T.push(x+=u);T.push(x+=wg);for(let j=kl;j<m;j++)T.push(x+=u);T[T.length-1]=hi;T.jg=kl;return T;}
// the model ([w, d], its front local +z) on lot L: its front on the lot's front L[0] -> L[1] at the middle, front behind it, facing the street; null when
// it does not fit inside the lot (a front cut or stepped back), the ground under it falls more than 4 m (as monuments.js's GLB insulae) or the site is barred
function pcGlb(W,L,wd){const[w,d]=wd,a=L[0],b=L[1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<w+.1)return{fail:'front'};const ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,c=pCen(L);
  let nx=-uz,nz=ux;if((c[0]-a[0])*nx+(c[1]-a[1])*nz<0){nx=-nx;nz=-nz;}const m=lp(a,b,.5),off=d/2+PCL.glb.front,x=m[0]+nx*off,z=m[1]+nz*off,r=Math.atan2(-nx,-nz),F=frame(x,0,z,r);
  const P=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>{const p=F.p(q[0],0,q[1]);return[p[0],p[2]];}),I=pInset(L,-.05)||L;
  if(!P.every(p=>nobleInside(p[0],p[1],I)))return{fail:'fit'};const gr=houseGround(W,P);if(!gr||gr.max-gr.min>4)return{fail:'ground'};if(!residentialSiteAllowed(W,P))return{fail:'site'};return{x,z,r,P,gr};}

/* ---------- what a lot may not touch. A road is reserved as boxes along it and circles at its points (roads, terrain-roads.js); lotHits and
   houseRoadClear take a circle's box, which stands up to 0.41 of its radius past the corridor on a slanting road: v2 tests circles as circles ---------- */
function pcCircleHit(L,x,z,r){if(nobleInside(x,z,L))return true;const r2=r*r;for(let i=0;i<L.length;i++)if(fbSegD2(x,z,L[i],L[(i+1)%L.length])<r2)return true;return false;}
function pcHits(W,L,m){const F=W.foot,ob=lotOBB(L),r=Math.hypot(ob.hw,ob.hd)+m,cs=F.cell,P=pInset(L,-m)||L;   // lotHits, the first footprint hit (or null)
  for(let i=Math.floor((ob.cx-r)/cs);i<=Math.floor((ob.cx+r)/cs);i++)for(let j=Math.floor((ob.cz-r)/cs);j<=Math.floor((ob.cz+r)/cs);j++)for(const f of F.map.get(F.key(i,j))||[]){
    const dx=f.cx-ob.cx,dz=f.cz-ob.cz;if(dx*dx+dz*dz>(f.r+r)**2)continue;if(f.circ?pcCircleHit(L,f.cx,f.cz,f.hw+m):residentialOverlap(P,f.blkLot||f.poly||footBox(f)))return f;}
  return null;}
function pcRoadClear(W,P){const o=lotOBB(P),rad=Math.hypot(o.hw,o.hd),cs=W.foot.cell,seen=new Set();   // houseRoadClear
  for(let i=Math.floor((o.cx-rad)/cs);i<=Math.floor((o.cx+rad)/cs);i++)for(let j=Math.floor((o.cz-rad)/cs);j<=Math.floor((o.cz+rad)/cs);j++)for(const f of W.foot.map.get(W.foot.key(i,j))||[]){
    if(f.tag!=='road'||seen.has(f))continue;seen.add(f);if(f.circ?pcCircleHit(P,f.cx,f.cz,f.hw):nobleOverlap(P,f))return false;}
  return true;}
// a lot on a main road that still touches it (the block's edge is a chord across a bend of the corridor): its front steps back, as fillRoadFrontage's do
function pcStepBack(W,L){for(const e of PCL.stepBack){const Q=pcInset(L,L.map((_,i)=>i?0:e),PCL.minLot);if(!Q||Q.dead.some(Boolean))return null;const L2=Q.slice();if(!pcOK(L2))return null;if(!pcHits(W,L2,.8))return L2;}return null;}   // the front's ends slide along the sides

// nothing but a road reserved at (x,z): a precinct's ring is a street only where its band is clear (an open reserve, a court or a wall may come up to the edge)
function pcFree(W,x,z){const F=W.foot,cs=F.cell;for(const f of F.map.get(F.key(Math.floor(x/cs),Math.floor(z/cs)))||[]){if(f.tag==='road')continue;const dx=x-f.cx,dz=z-f.cz;if(dx*dx+dz*dz>f.r*f.r)continue;
    if(f.circ?dx*dx+dz*dz<f.hw*f.hw:f.poly?nobleInside(x,z,f.poly):Math.abs(dx*f.c-dz*f.s)<=f.hw&&Math.abs(dx*f.s+dz*f.c)<=f.hd)return false;}return true;}
/* ---------- the lines a lot faces: the secondary streets (half their width) and the main roads (their corridor), in a 20 m grid ---------- */
function pcLines(W,F){const segs=[],G=new Map(),gc=20,key=(i,j)=>i*100003+j,reach=PCL.roadBack+PCL.stepBack[PCL.stepBack.length-1]+1.5;
  const add=(S,hw,road)=>{for(let k=1;k<S.length;k++){const a=S[k-1],b=S[k];if(Math.hypot(b[0]-a[0],b[1]-a[1])<1e-6)continue;const id=segs.length,r=hw+reach+2;segs.push({a,b,hw,road,reach:road?reach:1.5});
    for(let i=Math.floor((Math.min(a[0],b[0])-r)/gc);i<=Math.floor((Math.max(a[0],b[0])+r)/gc);i++)for(let j=Math.floor((Math.min(a[1],b[1])-r)/gc);j<=Math.floor((Math.max(a[1],b[1])+r)/gc);j++){const kk=key(i,j);let A=G.get(kk);if(!A)G.set(kk,A=[]);A.push(id);}}};
  for(const t of F.streets)add(t.S,t.w/2,false);for(const[w,S]of W.roadList||[])add(S,w/2+(w>=7?2.6:1.2),true);
  return{segs,near:(x,z)=>G.get(key(Math.floor(x/gc),Math.floor(z/gc)))||[]};}
// the nearest secondary street or main road to m within PCL.farLine of its band: {d (past the band), road} or null (for the paving before a front that faces none)
function pcNearLine(W,LN,m){let best=null;const q=(a,b,hw,road)=>{const d=Math.sqrt(fbSegD2(m[0],m[1],a,b))-hw;if(d<=PCL.farLine&&(!best||d<best.d))best={d:Math.max(0,d),road};};
  for(const id of LN.near(m[0],m[1])){const s=LN.segs[id];if(!s.road)q(s.a,s.b,s.hw,false);}
  for(const[w,S]of W.roadList||[])for(let k=1;k<S.length;k++)q(S[k-1],S[k],w/2+(w>=7?2.6:1.2),true);   // the corridor's half width, as pcLines
  return best;}
// the first 2 m before the front of a lot that faces no line, where its paving out to the nearest line goes: the first footprint there that streets.js
// does not pave over (all but a road and open ground: a fountain, a monument, a house, a court), or null
function pcApronBlocked(W,L){const a=L[0],b=L[1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=(b[1]-a[1])/l,nz=-(b[0]-a[0])/l,S=[a,b,[b[0]+nx*2,b[1]+nz*2],[a[0]+nx*2,a[1]+nz*2]],
    P=pInset(S,.1)||S,F=W.foot,ob=lotOBB(S),r=Math.hypot(ob.hw,ob.hd),cs=F.cell;
  for(let i=Math.floor((ob.cx-r)/cs);i<=Math.floor((ob.cx+r)/cs);i++)for(let j=Math.floor((ob.cz-r)/cs);j<=Math.floor((ob.cz+r)/cs);j++)for(const f of F.map.get(F.key(i,j))||[]){
    if(f.tag==='road'||f.tag==='open'&&!f.siteRole&&!f.reservation)continue;const dx=f.cx-ob.cx,dz=f.cz-ob.cz;if(dx*dx+dz*dz>(f.r+r)**2)continue;
    if(f.circ?pcCircleHit(P,f.cx,f.cz,f.hw):residentialOverlap(P,f.blkLot||f.poly||footBox(f)))return f;}
  return null;}
// the line a lot's front faces: of those whose band (and a road's step back) reaches the middle of the front, the one nearest parallel to it: {s, dA (rad)} or null
function pcFacing(LN,L){const a=L[0],b=L[1];if(Math.hypot(b[0]-a[0],b[1]-a[1])<1e-6)return null;const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],th=Math.atan2(b[1]-a[1],b[0]-a[0]);let best=null;
  for(const id of LN.near(m[0],m[1])){const s=LN.segs[id];if(fbSegD2(m[0],m[1],s.a,s.b)>(s.hw+s.reach)**2)continue;const dA=fbAD(th,Math.atan2(s.b[1]-s.a[1],s.b[0]-s.a[0]));if(!best||dA<best.dA)best={s,dA};}
  return best;}
// a lot whose front is off that line by more than PCL.align: cut back to a front parallel to it, through the front's end farther from it (null: nothing left)
function pcAlign(L,s){const l=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]),c=pCen(L);let nx=-(s.b[1]-s.a[1])/l,nz=(s.b[0]-s.a[0])/l;const sd=p=>(p[0]-s.a[0])*nx+(p[1]-s.a[1])*nz;if(sd(c)<0){nx=-nx;nz=-nz;}
  const s0=Math.max(sd(L[0]),sd(L[1])),out=[];
  for(let i=0;i<L.length;i++){const p=L[i],q=L[(i+1)%L.length],dp=sd(p)-s0,dq=sd(q)-s0,ip=dp>=-1e-9;if(ip)out.push(p);
    if(ip!==(dq>=-1e-9)){const t=dp/(dp-dq);if(t>1e-9&&t<1-1e-9)out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}
  const fx=L[1][0]-L[0][0],fz=L[1][1]-L[0][1];   // the new front: the edge on the cut, the way the old one went
  for(let i=0;i<out.length;i++){const p=out[i],q=out[(i+1)%out.length];if(Math.abs(sd(p)-s0)<1e-6&&Math.abs(sd(q)-s0)<1e-6&&(q[0]-p[0])*fx+(q[1]-p[1])*fz>0)return out.slice(i).concat(out.slice(0,i));}
  return null;}
// the distance from a segment to a polygon (0 when they cross or it is inside)
function pcSegPoly(a,b,L){if(nobleInside(a[0],a[1],L)||nobleInside(b[0],b[1],L))return 0;let m=Infinity;
  for(let i=0;i<L.length;i++){const p=L[i],q=L[(i+1)%L.length];m=Math.min(m,fbSegD2(p[0],p[1],a,b),fbSegD2(a[0],a[1],p,q),fbSegD2(b[0],b[1],p,q));
    const d1=(q[0]-p[0])*(a[1]-p[1])-(q[1]-p[1])*(a[0]-p[0]),d2=(q[0]-p[0])*(b[1]-p[1])-(q[1]-p[1])*(b[0]-p[0]),d3=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]),d4=(b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]);
    if(d1*d2<0&&d3*d4<0)return 0;}
  return Math.sqrt(m);}
// a lot clear of every secondary street (10 cm leeway): the road footprints keep the main roads, these lines the streets
function pcStreetClear(LN,L){const ids=new Set();for(const p of L)for(const id of LN.near(p[0],p[1]))ids.add(id);
  for(const id of ids){const s=LN.segs[id];if(!s.road&&pcSegPoly(s.a,s.b,L)<s.hw-.1)return false;}return true;}

/* ---------- the area v2 owns: the cut districts on a 1 m raster ---------- */
function pcMask(dY,cs=1){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;const E=[];
  for(const d of dY)for(const r of d.Y){const P=r.P;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];E.push(a[0],a[1],b[0],b[1]);x0=Math.min(x0,a[0]);x1=Math.max(x1,a[0]);z0=Math.min(z0,a[1]);z1=Math.max(z1,a[1]);}}
  if(!E.length)return null;x0=Math.floor(x0)-2;z0=Math.floor(z0)-2;const nx=Math.ceil((x1-x0)/cs)+4,nz=Math.ceil((z1-z0)/cs)+4,M=new Uint8Array(nx*nz),rows=Array.from({length:nz},()=>[]);
  for(let e=0;e<E.length;e+=4){const za=E[e+1],zb=E[e+3];if(za===zb)continue;const j0=Math.max(0,Math.ceil((Math.min(za,zb)-z0)/cs-.5)),j1=Math.min(nz-1,Math.floor((Math.max(za,zb)-z0)/cs-.5));for(let j=j0;j<=j1;j++)rows[j].push(e);}
  for(let j=0;j<nz;j++){const z=z0+(j+.5)*cs,X=[];for(const e of rows[j]){const ax=E[e],az=E[e+1],bx=E[e+2],bz=E[e+3];if((az>z)!==(bz>z))X.push(ax+(z-az)/(bz-az)*(bx-ax));}X.sort((a,b)=>a-b);   // even-odd: districts do not overlap, holes are rings
    for(let k=0;k+1<X.length;k+=2){const i0=Math.max(0,Math.ceil((X[k]-x0)/cs-.5)),i1=Math.min(nx-1,Math.floor((X[k+1]-x0)/cs-.5));for(let i=i0;i<=i1;i++)M[j*nx+i]=1;}}
  return{x0,z0,cs,nx,nz,M,box:[x0,z0,x0+nx*cs,z0+nz*cs]};}
function pcMaskAt(m,x,z){if(!m)return false;const i=Math.floor((x-m.x0)/m.cs),j=Math.floor((z-m.z0)/m.cs);return i>=0&&j>=0&&i<m.nx&&j<m.nz&&m.M[j*m.nx+i]===1;}
function cityParcelsArea(W,o={}){const t0=performance.now(),F=cityFabric(W),m=pcMask(F.dY||[],1),ex=o.excl||(()=>false);
  W.v2At=(x,z)=>pcMaskAt(m,x,z)&&!ex(x,z);W.v2Mask=m;W.v2AreaMs=Math.round(performance.now()-t0);return m;}

/* ---------- plots left open for the street life (o.life: [site, x, z, radius, kind, how many], street-life.js LIFE_SITES): v2's streets are too narrow
   for a stall or a bakery bay. Each is PCL.life.w along a secondary street's edge and PCL.life.d in from it, in a v2 block (not the outskirts, the
   depots or the domus), nearest the site's centre: inside the block, flat under the bay, clear of main roads and of temples (their paving is marble).
   Its lots are not built, it is paved (an apron), and W.lifePlots tells populateStreetLife where the bay stands (back to the plot's rear) ---------- */
function pcLifePlots(W,F,o){const by=new Map(),all=[],C=PCL.life;if(!o.life)return{by,all};const temples=W.foot.list.filter(f=>f.t);
  for(const[site,cx,cz,rad,kind,want]of o.life)for(let n=0;n<want;n++){let best=null;
    F.blocks.forEach((b,bi)=>{if(Math.hypot(b.x-cx,b.z-cz)>rad+150||!W.v2At(b.x,b.z))return;const Z=o.zone(b.x,b.z);if(!Z||Z.sparse||Z.kind==='ware'||Z.kind==='domus')return;
      const P=b.Y[0].P,E=b.Y[0].E;for(let i=0;i<P.length;i++){if(!E[i]||E[i].k!=='street')continue;const a=P[i],c=P[(i+1)%P.length],l=Math.hypot(c[0]-a[0],c[1]-a[1]);if(l<C.w+6)continue;
        const ux=(c[0]-a[0])/l,uz=(c[1]-a[1])/l,ox=uz,oz=-ux;   // (ox, oz): out of the block, to the street (the block is on the left of its edges)
        for(let t=C.w/2+3;t<=l-C.w/2-3;t+=2){const p=[a[0]+ux*t,a[1]+uz*t],d=Math.hypot(p[0]-cx,p[1]-cz);if(d>rad||(best&&d>=best.d))continue;
          if(all.some(q=>Math.hypot(q.p[0]-p[0],q.p[1]-p[1])<(q.site===site&&q.kind===kind?20:26)))continue;   // populateStreetLife's spacing
          const R=[[-1,0],[1,0],[1,1],[-1,1]].map(([u,v])=>[p[0]+ux*u*C.w/2-ox*v*C.d,p[1]+uz*u*C.w/2-oz*v*C.d]);if(!R.every(q=>nobleInside(q[0],q[1],P)))continue;
          const x=p[0]-ox*C.at,z=p[1]-oz*C.at,B=[[-3,-2.7],[3,-2.7],[3,2.7],[-3,2.7],[0,0]].map(([u,v])=>[x+ux*u-ox*v,z+uz*u-oz*v]),Y=B.map(q=>W.gy(q[0],q[1]));
          if(Math.max(...Y)-Math.min(...Y)>C.flat)continue;if(temples.some(f=>Math.hypot(f.cx-x,f.cz-z)<f.r+20))continue;
          if(B.some(q=>(W.roadList||[]).some(([w,S])=>polyDist(q[0],q[1],S)[0]<w/2+2.5)))continue;
          best={d,bi,p,R,x,z,rot:Math.atan2(ox,oz),site,kind};}}});
    if(!best)break;all.push(best);if(!by.has(best.bi))by.set(best.bi,[]);by.get(best.bi).push(best);}
  return{by,all};}

/* ---------- the houses ---------- */
function cityParcels(W,o){const t0=performance.now(),F=cityFabric(W);if(!W.v2At)cityParcelsArea(W,o);
  const dq=Math.max(.3,Q.dens),chunks=new Map(),cs=o.chunk||600,smk=[],shop=o.shop||PCL.shop;
  const G=(x,z,k,lay='houses')=>{const key=k+'|'+lay+'|'+Math.floor(x/cs)+'_'+Math.floor(z/cs);let e=chunks.get(key);if(!e){e={k,lay,g:new GB(1<<14)};chunks.set(key,e);}return e.g;};
  const S={blocks:0,built:0,skipped:{},modes:{},lots:0,houses:0,dropped:{},courts:{garden:0,walled:0,yard:0,none:0,well:0},lanes:0,passages:0,tips:0,shops:0,corners:0,aligned:0,stepBack:0,
    glb:0,glbTried:0,glbMiss:{},ware:0,sparse:0,apronFar:0,ringBack:0,life:0},LN=pcLines(W,F),LP=pcLifePlots(W,F,o);W.lifePlots=[];
  const out={lots:[],courts:[],lanes:[],tips:[],houses:[],aprons:[],glb:[],life:[],stats:S},cnt=(o,k)=>{o[k]=(o[k]||0)+1;};
  for(const b of F.blocks){S.blocks++;const LB=LP.by.get(S.blocks-1);   // the street life's plots in this block
    if(!W.v2At(b.x,b.z)){cnt(S.skipped,'excl');continue;}   // its pole in a zone another generator owns
    const Z=o.zone(b.x,b.z);if(!Z){cnt(S.skipped,'zone');continue;}   // gardens (horti), steep ground, the river bank: no houses
    const R=RNG(fbSeed(b.x,b.z,77)),dk=Z.kind==='domus'?'domus':b.cls==='dense'?'dense':'mid';
    let{P,E}=pcClean(b.Y[0].P,b.Y[0].E);
    const rb=[];   // P4: a ring edge nearer its precinct than 4 m (an edge the snap did not place, on the 4 m raster): moved back to the ring's width (FAB.ring), as a road edge by PCL.roadBack
    E=E.map((e,i)=>{if(!e||e.k!=='ring')return e;const a=P[i],c=P[(i+1)%P.length],l=Math.hypot(c[0]-a[0],c[1]-a[1])||1,ux=(c[1]-a[1])/l,uz=-(c[0]-a[0])/l,
        free=d=>[.25,.5,.75].every(t=>pcFree(W,a[0]+(c[0]-a[0])*t+ux*d,a[1]+(c[1]-a[1])*t+uz*d));
      if(!free(PCL.ringClear))return{k:'edge',was:'ring'};let cl=PCL.ringClear;while(cl<FAB.ring&&free(cl+.25))cl+=.25;if(cl<FAB.ring-.5){rb[i]=FAB.ring-cl;S.ringBack++;}return e;});   // the band clear PCL.ringClear out, else no street
    {const d=E.map((e,i)=>e&&e.k==='road'?PCL.roadBack:rb[i]||0);if(d.some(x=>x>0)){const P2=pcInset(P,d);if(P2){P=P2.filter((q,i)=>!P2.dead[i]);E=E.filter((e,i)=>!P2.dead[i]);}}}
    if(Z.kind==='ware'){const key=o.grp?o.grp(b.x,b.z):'';if(key===null||key===undefined){cnt(S.skipped,'grp');continue;}   // P4: a depot block by the river: the old warehouses (lots.js), squared on its longest edge
      const Pw=pArea(P)<0?P.slice().reverse():P;let li=0;for(let i=1;i<Pw.length;i++)if(pcLen(Pw,i)>pcLen(Pw,li))li=i;   // warehouseBlock wants the ring anticlockwise (pArea > 0)
      S.ware+=warehouseBlock(W,G(b.x,b.z,key),Pw.slice(li).concat(Pw.slice(0,li)),R,0);cnt(S.modes,'ware');continue;}
    let want=null;if(o.glb&&!Z.sparse&&dk!=='domus'&&o.glb.at(b.x,b.z)){const RG=RNG(fbSeed(b.x,b.z,78));if(RG()<o.glb.p){const nm=Object.keys(o.glb.spec),f=Math.floor(RG()*nm.length);   // P4: a GLB insula in this block (its own dice):
        want={models:nm.map((_,i)=>nm[(f+i)%nm.length]).map(n=>({n,w:o.glb.spec[n][0],d:o.glb.spec[n][1]})),t:RG()};S.glbTried++;}}   // the model the dice chose, else the next that fits
    const r=pcLots(P,E,dk,R,Math.abs(pArea(P)),dq,want);cnt(S.modes,r.mode);if(r.glbMiss)cnt(S.glbMiss,r.glbMiss);S.dropped.geometry=(S.dropped.geometry||0)+r.dropped;
    const lotStart=(W.lotLog||[]).length,built=[],glbs=[];let court=Z.sparse?null:r.court;   // the outskirts (Z.sparse): houses apart, no court
    if(court&&LB&&LB.some(q=>residentialOverlap(court,q.R)))court=null;   // a street-life plot reaching the court: an open yard
    const courtPlan=court&&Z.kind==='domus'&&typeof courtyardDeckPlan==='function'?courtyardDeckPlan(W,court,ESTATE_TERRACE):null;
    for(const lot of r.lots){let L=lot.L,ob=lotOBB(L);const rec={L,k:lot.k,dk,shop:!!lot.shop,corner:!!lot.corner,row:!!lot.row,wedge:!!lot.wedge,fan:!!lot.fan,block:S.blocks-1,built:false};out.lots.push(rec);S.lots++;
      const drop=k=>{rec.why=k;cnt(S.dropped,k);if(lot.glb)cnt(S.glbMiss,'drop:'+k);};
      if(o.lotOK&&!o.lotOK(ob.cx,ob.cz)){drop('lotOK');continue;}
      if(!W.v2At(ob.cx,ob.cz)){drop('excl');continue;}
      if(Z.keep&&!Z.keep(ob.cx,ob.cz,lot)){rec.why='sparse';S.sparse++;continue;}   // the outskirts: this lot left a garden (no dice drawn)
      if(LB&&LB.some(q=>residentialOverlap(pInset(L,.3)||L,q.R))){rec.why='life';S.life++;if(lot.glb)cnt(S.glbMiss,'life');continue;}   // a plot left open for the street life
      let face=null;if(lot.k==='road'||lot.k==='street'){const f=face=pcFacing(LN,L);if(f&&f.dA>PCL.align*DEG){const L2=f.dA<60*DEG?pcAlign(L,f.s):null;   // H14: the front parallel to its street
        if(!L2||!pcOK(L2)||pcLen(L2,0)<PCL.minFront){drop('align');continue;}
        const f2=pcFacing(LN,L2);if(f2&&f2.dA>PCL.align*DEG){drop('align');continue;}   // the cut front's middle out of that line's reach, and the line it now faces still off
        face=f2;rec.L=L=L2;ob=lotOBB(L);rec.aligned=true;S.aligned++;}}
      if(!pcStreetClear(LN,L)){drop('street');continue;}   // H11: off the secondary streets
      const hit=pcHits(W,L,.8);if(hit){const L2=hit.tag==='road'&&lot.k==='road'?pcStepBack(W,L):null;if(!L2){drop('hit');rec.hit=hit.tag||(hit.blkLot?'lot':'foot');continue;}rec.L=L=L2;ob=lotOBB(L);rec.back=true;S.stepBack++;}
      if(!face&&(lot.k==='road'||lot.k==='street')&&pcApronBlocked(W,L)){drop('apron');continue;}   // a front that faces no line (past a street's end) is paved out to the nearest (below); with a fountain or a monument in its first 2 m that paving cannot be laid, and the house would open onto it (H10): not built
      const key=o.grp?o.grp(ob.cx,ob.cz):'';if(key===null||key===undefined){drop('grp');continue;}
      const p=lot.shop?shop(R):Z.lot(R);p.v2=true;if(courtPlan)p.minRoofY=courtPlan.y+3.9;p.burn=Z.burn&&R()<.4?1:0;const l0=(W.lotLog||[]).length;
      let ok=false;let gq=lot.glb?pcGlb(W,L,o.glb.spec[lot.glb]):null;if(gq&&gq.fail){cnt(S.glbMiss,gq.fail);gq=null;}   // P4: the GLB insula on its lot (o.glb.put places it); else, or where it no longer fits, lotBuild's houses
      if(gq){const n=o.glb.put({n:lot.glb,x:gq.x,y:gq.gr.min-.7,z:gq.z,r:gq.r,key});rec.glb=n;out.glb.push({n,P:gq.P,lot:out.lots.length-1});glbs.push({L:gq.P});S.glb++;ok=true;}
      else for(const Lp of pcFit(L))if(lotBuild(W,G(ob.cx,ob.cz,key),Lp,p,R,key===''?smk:null))ok=true;if(!ok){drop('build');continue;}
      rec.built=true;rec.houses=[l0,W.lotLog.length];for(let h=l0;h<W.lotLog.length;h++)out.houses.push({h,lot:out.lots.length-1});
      {const a=L[0],b=L[1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=(b[1]-a[1])/l,nz=-(b[0]-a[0])/l,m=lp(a,b,.5),f=lot.k==='road'?face:null,   // the paving in front of it: a ring's band, or what lies
         far=(lot.k==='road'||lot.k==='street')&&!face?pcNearLine(W,LN,m):null;   // between it and the road's corridor; a front that faces no line (past a street's end, or well back from a road): out to the nearest
         if(far)S.apronFar++;const d=lot.k==='ring'?FAB.ring+.3:f?clamp(Math.sqrt(fbSegD2(m[0],m[1],f.s.a,f.s.b))-f.s.hw+.5,.5,8):far?clamp(far.d+.5,.5,8):0;if(d>0)out.aprons.push([a,b,[b[0]+nx*d,b[1]+nz*d],[a[0]+nx*d,a[1]+nz*d]]);}
      built.push({ob,L});S.built++;S.houses+=W.lotLog.length-l0;if(lot.shop)S.shops++;if(lot.corner)S.corners++;
      if(!o.noPpl&&Z.ppl&&R()<Z.ppl){const a=L[0],c=L[1],m=lp(a,c,.5),dx=c[0]-a[0],dz=c[1]-a[1],l=Math.hypot(dx,dz)||1,px=m[0]+dz/l*1.6,pz=m[1]-dx/l*1.6;W.people.push([px,W.gy(px,pz),pz]);}}
    for(const q of LB||[]){out.aprons.push(q.R);out.life.push(q.R);W.lifePlots.push({site:q.site,kind:q.kind,x:q.x,z:q.z,rot:q.rot});}   // paved; where the bay stands
    // the court, as genBlocks: a garden inside a closed ring, a garden wall where a stretch is missing (the U), else a yard with a well
    if(court&&footTagHit(W,court,'road'))court=null;
    let closure=court?residentialCourtClosure(court,(W.lotLog||[]).slice(lotStart).concat(glbs)):{closed:false,uncovered:[]};
    if(court&&r.gaps.length&&!closure.closed){const left=closure.uncovered.filter(u=>!r.gaps.some(g=>g.edge===u.edge&&u.from>=g.from-.03&&u.to<=g.to+.03));closure={closed:!left.length,uncovered:left,lanes:r.gaps};}   // a lane's mouth is an opening
    const c2=court?pCen(court):null,ck=court&&o.grp?o.grp(c2[0],c2[1]):'';
    if(court&&!closure.closed){let per=0,gp=0;for(let e=0;e<court.length;e++)per+=pcLen(court,e);for(const u of closure.uncovered)gp+=(u.to-u.from)*pcLen(court,u.edge);
      if(gp>per*.4||built.length<2)court=null;else if(ck!==null&&ck!==undefined&&courtWalls(W,G(c2[0],c2[1],ck),court,closure.uncovered))closure={closed:true,uncovered:[],walled:true};}
    if(court&&built.length>1&&Z.court&&ck!==null&&ck!==undefined){if(closure.closed)Z.court(W,G(c2[0],c2[1],ck),court,R,pArea(court),courtPlan);else residentialCourtYard(W,G(c2[0],c2[1],ck),court);}
    if(court&&built.length){reserveResidentialArea(W,court,Z.kind==='domus'?'senatorial-garden':'residential-courtyard',{closed:closure.closed,uncovered:closure.uncovered,allowed:closure.closed?['garden','fountain','columns','paths']:['paths'],yard:!closure.closed,walled:!!closure.walled,deckY:courtPlan&&courtPlan.y,deckBuilt:built.length>1&&closure.closed,v2:true});
      S.courts[closure.walled?'walled':closure.closed?'garden':'yard']++;out.courts.push({P:court,closed:closure.closed,walled:!!closure.walled});}
    else S.courts[r.well?'well':'none']++;
    for(const q of built){const f=W.foot.add(q.ob.cx,q.ob.cz,q.ob.hw,q.ob.hd,q.ob.rot);f.blkLot=q.L;f.poly=q.L;f.v2=true;}   // poly: the street raster marks the real outline, not the box
    if(built.length&&!Z.sparse)for(const ln of r.lanes){const ob=lotOBB(ln.P),f=W.foot.add(ob.cx,ob.cz,ob.hw,ob.hd,ob.rot,'road');f.lane=true;f.v2=true;(W.laneLog||(W.laneLog=[])).push(ln.P);out.lanes.push(ln);S[ln.kind==='lane'?'lanes':'passages']++;}
    for(const T of r.tips){if(!W.v2At(...pCen(T)))continue;const ob=lotOBB(T),f=W.foot.add(ob.cx,ob.cz,ob.hw,ob.hd,ob.rot,'road');f.v2=true;out.tips.push(T);S.tips++;}}
  // the secondary streets and the squares: road footprints from here on (no tree, prop or later house on them); the raster paves them (buildStreets o.v2)
  for(const t of F.streets){const D=densify(t.S,8);for(let k=1;k<D.length;k++){const a=D[k-1],b=D[k],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<.05||!W.v2At((a[0]+b[0])/2,(a[1]+b[1])/2))continue;
    const f=W.foot.add((a[0]+b[0])/2,(a[1]+b[1])/2,len/2,t.w/2,Math.atan2(-dz,dx),'road');f.v2street=true;}}
  for(const s of F.squares){const P=s.Y[0].P,c=pCen(P);if(!W.v2At(c[0],c[1]))continue;const ob=lotOBB(P),f=W.foot.add(ob.cx,ob.cz,ob.hw,ob.hd,ob.rot,'road');f.v2=true;}
  const groups={};for(const e of chunks.values()){const m=layTag(e.g.mesh(MAT.city),e.lay);if(!m)continue;let G2=groups[e.k];if(!G2){if(e.k!=='')G2=groups[e.k]=preLayerGroup(W,e.k);else{G2=groups[e.k]=new THREE.Group();W.scene.add(G2);}}G2.add(m);}
  if(smk.length)W.scene.add(smokeSys(smk.slice(0,160),{col:[.86,.84,.8],rise:24,size:3,rate:.06,alpha:.3,per:8,drift:[4,0,2]}));
  S.ms=Math.round(performance.now()-t0);W.parcels=out;return out;}
// what buildStreets needs to pave v2 (o.v2): where v2 owns the ground, its streets as [w, centre line] and its squares as polygons
function cityParcelsStreets(W){const F=W.fabric,P=W.parcels;if(!F||!P||!W.v2At)return null;
  return{at:W.v2At,box:W.v2Mask&&W.v2Mask.box,streets:F.streets.map(t=>[t.w,t.S]),squares:F.squares.map(s=>s.Y[0].P).concat(P.tips),aprons:P.aprons,
    front:(W.roadList||[]).map(([w,S])=>[2*(w/2+(w>=7?2.6:1.2)+PCL.roadBack+PCL.stepBack[PCL.stepBack.length-1]+.5),S])};}   // a main road's frontage: its corridor, the step back, the shops' fronts

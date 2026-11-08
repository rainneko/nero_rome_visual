/* ================= P2 (briefs/rome/road-first-city.md 4.3): secondary streets from a direction field and recursive cuts =================
   cityFabric(W) -> W.fabric. It works inside every P1 district (cityDistricts) of FAB.minArea or more (P4; o.area: only those with that much of
   their cells in a window, as P2 did round the Y junction), whole districts. Each district in three steps:
   1. its raster outline goes back onto the lines it was rastered from: the road corridors (half the width plus 2.6 m on roads 7 m and wider,
      else 1.2 m) and the 4.5 m precinct rings, with the corners where two of them meet put back;
   2. its sharp tips at a road junction become small squares (compita);
   3. it is cut, again and again, by streets that follow a direction field, until every piece is a block of the size its class wants: the class of
      the old zone at the piece's pole (W.cityClass through FAB.map; the district's class where that zone is not cut, as gardens and precincts).
   Nothing is built on the blocks yet; that is P3 (`?city=v2`). The review layers 'fabric' and 'dfield' and tools/test/city-audit.mjs read it
   (H13, block areas). Seeds are keyed to place: the pole of each piece and its level, so changing one district leaves the others as they are.
   Polygons are arrays of rings {P:[[x,z],...],E:[meta of the edge P[i] -> P[i+1]]}. The outer ring comes first, with the region on its left
   (pArea > 0, normal (-dz,dx) inwards), then the holes (pArea < 0). Edge meta: {k:'road'|'ring'|'street'|'square'|'cliff'|'water'|'edge', w, lv, id}.
   P4 (4.5.1): the search for each cut is what takes the time (some 57,000 candidates for 2,700 blocks), so a live cut keeps a record of what it
   chose (fbPack: each district's polygon, every street's line and width, the poles of the blocks) and tools/test/bake-roads.mjs writes it into
   src/scenes/rome/street-fabric.js. The district polygons and the chosen lines are rounded to the centimetre before they cut, so fbReplay, which
   makes the same cuts in the same order without the search, gives the same numbers. The page replays the record when its key matches fbKey(W):
   the precincts, the roads, the river and the desktop tier's ground the districts are drawn from, and FAB. Else it cuts live and warns. A change to
   the rules (the zones, this code) does not change the key: bake-roads.mjs --check, in the test suite, finds it. ?fabric=live always cuts live;
   ?h15=<district id> or ?h15=<x>,<z> (the district there) cuts live with other dice in that district (the H15 audit, city-audit.mjs). */
const FAB={v:1,area:[-20,-560,500,-40],minArea:2000,   // v: the bake's version (bump it when the cut changes); area: the Y junction window, for the block areas there
  cls:{dense:{A:[1500,3000],L:95,belt:[26,36],wB:4.8,wC:3.8,minT:15},mid:{A:[2200,4500],L:110,belt:[30,42],wB:5.4,wC:4.2,minT:17}},
  map:{dense:'dense',mid:'mid',domus:'mid',ware:'mid',other:'mid'},   // fixed, horti and campus districts are not cut
  frag:{area:300,thick:11},keep:600,snap:4.5,ring:4.5,fork:{ang:62,near:24,r:[30,21]},ladder:[3,5,7.5,10,12.5,15,19,24,30],
  field:{cs:4,road:75,prec:32,river:80,base:-30},junction:{road:1,street:1,ring:1,square:1}};

/* ---------- geometry kernel (no library): rings, distances, the pole of inaccessibility, the oriented box, splitting by a polyline ---------- */
function fbAD(a,b){const d=((a-b)%Math.PI+Math.PI)%Math.PI;return Math.min(d,Math.PI-d);}   // the angle between two directions, mod 180°
function fbSegD2(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz;let t=l2?((x-a[0])*dx+(z-a[1])*dz)/l2:0;t=t<0?0:t>1?1:t;const ex=a[0]+dx*t-x,ez=a[1]+dz*t-z;return ex*ex+ez*ez;}
function fbArea(Y){let a=0;for(const r of Y)a+=pArea(r.P);return a;}
function fbIn(Y,x,z){let c=false;for(const r of Y){const P=r.P,n=P.length;for(let i=0,j=n-1;i<n;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}}return c;}
function fbDist(Y,x,z){let m=Infinity;for(const r of Y){const P=r.P,n=P.length;for(let i=0;i<n;i++){const d=fbSegD2(x,z,P[i],P[(i+1)%n]);if(d<m)m=d;}}return Math.sqrt(m);}
function fbLen(L){let s=0;for(let i=1;i<L.length;i++)s+=Math.hypot(L[i][0]-L[i-1][0],L[i][1]-L[i-1][1]);return s;}
function fbParam(L,p){let s=0,bs=0,bd=Infinity;for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,l=Math.sqrt(l2),t=l2?clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l2,0,1):0,d=Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]);if(d<bd){bd=d;bs=s+t*l;}s+=l;}return bs;}   // arc length of L's point nearest p
function fbDP(P,tol){if(P.length<3)return P;const keep=new Uint8Array(P.length);keep[0]=keep[P.length-1]=1;const st=[[0,P.length-1]],t2=tol*tol;   // Douglas-Peucker, open polyline
  while(st.length){const[a,b]=st.pop();let m=-1,dm=t2;for(let k=a+1;k<b;k++){const d=fbSegD2(P[k][0],P[k][1],P[a],P[b]);if(d>dm){dm=d;m=k;}}if(m>=0){keep[m]=1;st.push([a,m],[m,b]);}}
  return P.filter((_,k)=>keep[k]);}
// the point of Y farthest from its edges (polylabel: square cells in a queue by the largest distance they could hold). With need: stop at the
// first point farther than need, or as soon as no cell can hold one; else refine until no cell can beat the best by more than prec
function fbPole(Y,need,prec=1){const P=Y[0].P;let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of P){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<z0)z0=p[1];if(p[1]>z1)z1=p[1];}
  const sz=Math.min(x1-x0,z1-z0);if(!(sz>0))return{x:x0,z:z0,d:0};
  const H=[],cell=(x,z,h)=>{const d=(fbIn(Y,x,z)?1:-1)*fbDist(Y,x,z);return{x,z,h,d,m:d+h*Math.SQRT2};},
    push=c=>{H.push(c);let i=H.length-1;while(i){const p=(i-1)>>1;if(H[p].m>=H[i].m)break;const t=H[p];H[p]=H[i];H[i]=t;i=p;}},
    pop=()=>{const top=H[0],l=H.pop();if(H.length){H[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let k=i;if(a<H.length&&H[a].m>H[k].m)k=a;if(b<H.length&&H[b].m>H[k].m)k=b;if(k===i)break;const t=H[k];H[k]=H[i];H[i]=t;i=k;}}return top;};
  const h0=sz/2;for(let x=x0;x<x1;x+=sz)for(let z=z0;z<z1;z+=sz)push(cell(x+h0,z+h0,h0));
  let best=cell((x0+x1)/2,(z0+z1)/2,0);{let a=0,cx=0,cz=0;for(let i=0,n=P.length;i<n;i++){const p=P[i],q=P[(i+1)%n],f=p[0]*q[1]-q[0]*p[1];cx+=(p[0]+q[0])*f;cz+=(p[1]+q[1])*f;a+=f*3;}
    if(a){const c=cell(cx/a,cz/a,0);if(c.d>best.d)best=c;}}
  for(let it=0;H.length&&it<6000;it++){if(need!=null&&best.d>need)break;const c=pop();if(c.d>best.d)best=c;
    if(need!=null){if(best.d>need||c.m<=need)break;if(c.h<.2)continue;}else if(c.m-best.d<=prec)break;
    const h=c.h/2;push(cell(c.x-h,c.z-h,h));push(cell(c.x+h,c.z-h,h));push(cell(c.x-h,c.z+h,h));push(cell(c.x+h,c.z+h,h));}
  return best;}
function fbFat(Y,r){return fbPole(Y,r).d>r;}   // Y.buffer(-r) is not empty
function fbThick(Y){const d=fbPole(Y,null,.25).d;let lo=0;for(const r of FAB.ladder){if(d<=r)break;lo=r;}return 2*lo;}   // the prototype's thick(): 2 x the largest rung that still leaves a core
function fbMinR(T){for(const r of FAB.ladder)if(2*r>=T)return r;return 30;}   // thick(Y) >= T  <=>  fbFat(Y, fbMinR(T))
function fbHull(P){const Q=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
  for(const p of Q){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(let i=Q.length-1;i>=0;i--){const p=Q[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  return lo.slice(0,-1).concat(up.slice(0,-1));}
function fbOBB(P){const H=fbHull(P);let best={A:Infinity,L:0,S:0};   // the smallest rectangle round P (one side on a hull edge)
  for(let i=0;i<H.length;i++){const a=H[i],b=H[(i+1)%H.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<1e-9)continue;const ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l;let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
    for(const p of H){const u=p[0]*ux+p[1]*uz,v=-p[0]*uz+p[1]*ux;if(u<u0)u0=u;if(u>u1)u1=u;if(v<v0)v0=v;if(v>v1)v1=v;}
    const A=(u1-u0)*(v1-v0);if(A<best.A)best={A,L:Math.max(u1-u0,v1-v0),S:Math.min(u1-u0,v1-v0)};}
  return best;}
// where the polyline L crosses the rings of Y, in order along L: {r,i (ring, edge), u (along the edge), j,t (L's segment, along it), s (arc length), x,z}.
// null when L meets a vertex or runs along an edge (the caller drops that candidate)
function fbX(Y,L){const X=[];let s0=0;
  for(let j=0;j<L.length-1;j++){const a=L[j],b=L[j+1],rx=b[0]-a[0],rz=b[1]-a[1],lj=Math.hypot(rx,rz);if(!lj)continue;
    const bx0=Math.min(a[0],b[0]),bx1=Math.max(a[0],b[0]),bz0=Math.min(a[1],b[1]),bz1=Math.max(a[1],b[1]);
    for(let r=0;r<Y.length;r++){const P=Y[r].P,n=P.length;for(let i=0;i<n;i++){const p=P[i],q=P[(i+1)%n];
      if((p[0]<bx0&&q[0]<bx0)||(p[0]>bx1&&q[0]>bx1)||(p[1]<bz0&&q[1]<bz0)||(p[1]>bz1&&q[1]>bz1))continue;
      const sx=q[0]-p[0],sz=q[1]-p[1],den=rx*sz-rz*sx,ls=Math.hypot(sx,sz);if(!ls)continue;
      if(Math.abs(den)<1e-10*lj*ls){if(Math.abs((p[0]-a[0])*rz-(p[1]-a[1])*rx)<1e-6*lj)return null;continue;}
      const t=((p[0]-a[0])*sz-(p[1]-a[1])*sx)/den,u=((p[0]-a[0])*rz-(p[1]-a[1])*rx)/den;
      if(t<-1e-9||t>1+1e-9||u<-1e-9||u>1+1e-9)continue;if(u<1e-7||u>1-1e-7||t<1e-9||t>1-1e-9)return null;
      X.push({r,i,u,j,t,s:s0+t*lj,x:a[0]+rx*t,z:a[1]+rz*t});}}
    s0+=lj;}
  return X.sort((a,b)=>a.s-b.s);}
// Y split by the polyline L (both ends outside Y): the pieces left and right of it (forward along L, left = the side of the normal (-dz,dx));
// holes L does not cross go to the piece round them. The new edges get the meta m. null when L does not split Y or meets a vertex.
// Faces are walked round the ring edges; at every crossing the walk turns onto L (into the region) and comes back at the crossing paired with it.
function fbSplit(Y,L,m){const X=fbX(Y,L);if(!X||X.length<2||X.length%2||fbIn(Y,L[0][0],L[0][1]))return null;
  const by=new Map();X.forEach((c,k)=>{c.k=k;const key=c.r*1048576+c.i;let A=by.get(key);if(!A)by.set(key,A=[]);A.push(c);});
  for(const A of by.values()){A.sort((a,b)=>a.u-b.u);A.forEach((c,q)=>c.q=q);}
  const used=new Set(),faces=[],touched=new Set(X.map(c=>c.r));
  for(const r0 of touched){const n0=Y[r0].P.length;
    for(let i0=0;i0<n0;i0++){const A0=by.get(r0*1048576+i0)||[];
      for(let q0=0;q0<=A0.length;q0++){if(used.has(r0+':'+i0+':'+q0))continue;const P=[],E=[];let r=r0,i=i0,q=q0,side=0,g=0;
        for(;;){if(g++>200000)return null;const key=r+':'+i+':'+q;if(used.has(key))break;used.add(key);const R=Y[r],A=by.get(r*1048576+i)||[];
          P.push(q?[A[q-1].x,A[q-1].z]:R.P[i]);E.push(R.E[i]);   // sub-edge q of edge i: from crossing q-1 (or vertex i) to crossing q (or vertex i+1)
          if(q<A.length){const c=A[q],d=X[c.k^1],fw=d.s>c.s;P.push([c.x,c.z]);E.push(m);if(!side)side=fw?1:-1;
            if(fw)for(let j=c.j+1;j<=d.j;j++){P.push(L[j]);E.push(m);}else for(let j=c.j;j>d.j;j--){P.push(L[j]);E.push(m);}
            r=d.r;i=d.i;q=d.q+1;}
          else{i=(i+1)%R.P.length;q=0;}}
        if(P.length>=3)faces.push({P,E,side});}}}
  const pieces=[];for(const f of faces){const k=[];for(let a=0;a<f.P.length;a++){const p=f.P[a],q=f.P[(a+1)%f.P.length];if(Math.hypot(q[0]-p[0],q[1]-p[1])>1e-6)k.push(a);}   // no zero-length edges
    const P=k.map(a=>f.P[a]),E=k.map(a=>f.E[a]);if(P.length>=3&&pArea(P)>1e-6)pieces.push({Y:[{P,E}],side:f.side});}
  for(let r=1;r<Y.length;r++){if(touched.has(r))continue;const p=Y[r].P[0],o=pieces.find(o=>fbIn([o.Y[0]],p[0],p[1]));if(o)o.Y.push(Y[r]);}
  if(pieces.length<2)return null;
  return{L:pieces.filter(o=>o.side>0).map(o=>o.Y),R:pieces.filter(o=>o.side<0).map(o=>o.Y)};}
function fbOffset(L,s){const n=L.length,N=[];for(let k=0;k<n-1;k++){const a=L[k],b=L[k+1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;N.push([-(b[1]-a[1])/l,(b[0]-a[0])/l]);}   // to the left (normal (-dz,dx)) by s, mitred
  return L.map((p,k)=>{const a=N[Math.max(0,k-1)],b=N[Math.min(n-2,k)],mx=a[0]+b[0],mz=a[1]+b[1],dd=mx*a[0]+mz*a[1];return dd>.2?[p[0]+mx/dd*s,p[1]+mz/dd*s]:[p[0]+a[0]*s,p[1]+a[1]*s];});}
function fbExtOut(Y,L){const out=L.map(p=>p.slice()),n=out.length;   // L with each end pushed on along its direction until it is outside Y (at most 12 m)
  for(const[e,f]of[[0,1],[n-1,n-2]]){const p=out[e],q=out[f],l=Math.hypot(p[0]-q[0],p[1]-q[1])||1,ux=(p[0]-q[0])/l,uz=(p[1]-q[1])/l;let k=0;
    while(fbIn(Y,p[0],p[1])){if(++k>12)return null;p[0]+=ux;p[1]+=uz;}}
  return out;}
// the pieces of L inside Y, in order along L: [{S,a,b}] with S its points and a, b the crossings at its ends. null when L meets a vertex.
function fbRuns(Y,L){const X=fbX(Y,L);if(!X||X.length<2||X.length%2)return null;const out=[];
  for(let k=0;k<X.length;k+=2){const a=X[k],b=X[k+1],S=[[a.x,a.z]];for(let j=a.j+1;j<=b.j;j++)S.push(L[j]);S.push([b.x,b.z]);out.push({S,a,b});}
  return out;}
// the street of width w along the centre line C (both ends outside Y): the pieces on its two sides. Each side is Y split by the line w/2 off C.
function fbCut(Y,C,w,m){const Lp=fbExtOut(Y,fbOffset(C,w/2)),Lm=fbExtOut(Y,fbOffset(C,-w/2));if(!Lp||!Lm)return null;
  const a=fbSplit(Y,Lp,m),b=fbSplit(Y,Lm,m);if(!a||!b)return null;const pieces=[...a.L,...b.R].filter(Q=>fbArea(Q)>1);return pieces.length<2?null:pieces;}
function fbStraight(Y,p0,d){const ux=Math.cos(d),uz=Math.sin(d),L=[[p0[0]-ux*4000,p0[1]-uz*4000],[p0[0]+ux*4000,p0[1]+uz*4000]],X=fbX(Y,L);if(!X||X.length<2||X.length%2)return null;
  let k0=-1,bd=Infinity;for(let k=0;k<X.length;k+=2){const a=X[k],b=X[k+1];if(b.s-a.s<=4)continue;const g=4000<a.s?a.s-4000:4000>b.s?4000-b.s:0;if(g<bd){bd=g;k0=k;}}
  if(k0<0)return null;const m=[(X[k0].x+X[k0+1].x)/2,(X[k0].z+X[k0+1].z)/2];let k1=k0+1;
  while(X[k0].r&&k0>=2)k0-=2;while(X[k1].r&&k1+2<X.length)k1+=2;if(X[k0].r||X[k1].r)return null;   // a run that ends on a hole goes on across it: alone it would not split Y
  const a=X[k0],b=X[k1];return{L:[[a.x-ux*2,a.z-uz*2],[b.x+ux*2,b.z+uz*2]],p0:m};}   // the inside run nearest p0 (its middle is p0), 2 m past both ends
function fbCrossings(rings,max=1e9){const E=[],out=[];rings.forEach((P,r)=>{for(let i=0;i<P.length;i++)E.push([r,i,P[i],P[(i+1)%P.length],P.length]);});   // pairs of edges that cross (not neighbours)
  E.sort((a,b)=>Math.min(a[2][0],a[3][0])-Math.min(b[2][0],b[3][0]));   // sweep along x
  for(let a=0;a<E.length;a++){const[ra,ia,p,q,na]=E[a],x1=Math.max(p[0],q[0]),z0=Math.min(p[1],q[1]),z1=Math.max(p[1],q[1]);
    for(let b=a+1;b<E.length;b++){const[rb,ib,s,t,nb]=E[b];if(Math.min(s[0],t[0])>x1)break;if(ra===rb&&(Math.abs(ib-ia)===1||Math.abs(ib-ia)===na-1))continue;if(Math.max(s[1],t[1])<z0||Math.min(s[1],t[1])>z1)continue;
      const d1=(q[0]-p[0])*(s[1]-p[1])-(q[1]-p[1])*(s[0]-p[0]),d2=(q[0]-p[0])*(t[1]-p[1])-(q[1]-p[1])*(t[0]-p[0]),d3=(t[0]-s[0])*(p[1]-s[1])-(t[1]-s[1])*(p[0]-s[0]),d4=(t[0]-s[0])*(q[1]-s[1])-(t[1]-s[1])*(q[0]-s[0]);
      if(((d1>0)!==(d2>0))&&((d3>0)!==(d4>0))){out.push([ra,ia,rb,ib]);if(out.length>=max)return out;}}}
  return out;}
function fbSelfX(rings){return fbCrossings(rings,1).length>0;}

/* ---------- the direction field (4.3): two perpendicular directions at every point, on a 4 m grid, blended as doubled angles ---------- */
function fbPrecincts(W){return W.foot.list.slice(0,(W.footMark&&W.footMark.houses)||0).map((f,i)=>({f,i})).filter(({f})=>f.tag!=='road');}
function fbRect(f,off){const c=f.c,s=f.s,hw=f.hw+off,hd=f.hd+off;return[[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]].map(([a,b])=>[f.cx+c*a*hw+s*b*hd,f.cz-s*a*hw+c*b*hd]);}   // a footprint's box (u along (c,-s))
function fbField(W,B){const o=FAB.field,cs=o.cs,x0=Math.floor(B[0]/cs)*cs,z0=Math.floor(B[1]/cs)*cs,nx=Math.ceil((B[2]-x0)/cs)+1,nz=Math.ceil((B[3]-z0)/cs)+1,N=nx*nz,
    C=new Float32Array(N),S=new Float32Array(N),Wt=new Float32Array(N);
  const add=(a,b,wt,sig)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz;if(!l2)return;const R=3*sig,R2=R*R,s2=sig*sig,th=Math.atan2(dz,dx),c2=Math.cos(2*th),n2=Math.sin(2*th);
    const i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-R-x0)/cs)),i1=Math.min(nx-1,Math.ceil((Math.max(a[0],b[0])+R-x0)/cs)),j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-R-z0)/cs)),j1=Math.min(nz-1,Math.ceil((Math.max(a[1],b[1])+R-z0)/cs));
    for(let j=j0;j<=j1;j++){const z=z0+j*cs;for(let i=i0;i<=i1;i++){const x=x0+i*cs,d2=fbSegD2(x,z,a,b);if(d2>=R2)continue;const g=wt*Math.exp(-d2/s2),k=j*nx+i;C[k]+=g*c2;S[k]+=g*n2;Wt[k]+=g;}}};
  for(const[w,P]of W.roadList||[]){const Q=fbDP(P,1.5);for(let k=1;k<Q.length;k++)add(Q[k-1],Q[k],w/8,o.road);}   // main roads: their tangent, (w/8)·exp(-(d/75)²)
  for(const{f}of fbPrecincts(W)){if(f.tag==='open'||f.circ)continue;const R=fbRect(f,FAB.ring);if(4*(f.hw+FAB.ring)*(f.hd+FAB.ring)<900)continue;   // precinct rings: their sides, exp(-(d/32)²)
    for(let k=0;k<4;k++)if(Math.hypot(R[k+1][0]-R[k][0],R[k+1][1]-R[k][1])>12)add(R[k],R[k+1],1,o.prec);}
  const rv=W.roadOpts&&W.roadOpts.river;if(rv&&rv.P)for(let k=1;k<rv.P.length;k++)add(rv.P[k-1],rv.P[k],1,o.river);   // the Tiber's banks
  const H=new Float32Array((nx+2)*(nz+2)),G=W.routeGround||W;for(let j=0;j<nz+2;j++)for(let i=0;i<nx+2;i++)H[j*(nx+2)+i]=G.gy(x0+(i-1)*cs,z0+(j-1)*cs);   // the desktop tier's ground at every tier (W.routeGround): one network at every tier
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const h=(a,b)=>H[(j+1+b)*(nx+2)+i+1+a],gx=(h(1,0)-h(-1,0))/(2*cs),gz=(h(0,1)-h(0,-1))/(2*cs),g=clamp((Math.hypot(gx,gz)-.1)/.15,0,1)*2;
    if(g<=0)continue;const th=Math.atan2(gz,gx)+Math.PI/2,k=j*nx+i;C[k]+=g*Math.cos(2*th);S[k]+=g*Math.sin(2*th);Wt[k]+=g;}   // slopes over 10 %: the contours
  const b=o.base*DEG;for(let k=0;k<N;k++){C[k]+=.03*Math.cos(2*b);S[k]+=.03*Math.sin(2*b);Wt[k]+=.03;}   // the old grid's -30°, faintly
  return{x0,z0,cs,nx,nz,C,S,W:Wt};}
function fbFieldAt(F,x,z){const i=(x-F.x0)/F.cs,j=(z-F.z0)/F.cs,i0=clamp(Math.floor(i),0,F.nx-2),j0=clamp(Math.floor(j),0,F.nz-2),fi=clamp(i-i0,0,1),fj=clamp(j-j0,0,1),
    k=j0*F.nx+i0,b=A=>A[k]*(1-fi)*(1-fj)+A[k+1]*fi*(1-fj)+A[k+F.nx]*(1-fi)*fj+A[k+F.nx+1]*fi*fj,c=b(F.C),s=b(F.S);
  return[Math.atan2(s,c)/2,Math.hypot(c,s)/Math.max(b(F.W),1e-9)];}   // [direction, confidence 0-1]
function fbTrace(Y,F,p0,a0){const[th0]=fbFieldAt(F,p0[0],p0[1]),fam=fbAD(a0,th0)<Math.PI/4?0:1,half=[];   // a street that follows the field from p0 both ways until it leaves Y; inertia .78: it bends gently
  for(const sg of[1,-1]){let vx=Math.cos(a0)*sg,vz=Math.sin(a0)*sg,p=p0;const pts=[];
    for(let k=0;k<260;k++){const[th]=fbFieldAt(F,p[0],p[1]),a=th+fam*Math.PI/2;let ux=Math.cos(a),uz=Math.sin(a);if(ux*vx+uz*vz<0){ux=-ux;uz=-uz;}
      const nx=.78*vx+.22*ux,nz=.78*vz+.22*uz,l=Math.hypot(nx,nz)||1;vx=nx/l;vz=nz/l;const q=[p[0]+vx*4,p[1]+vz*4];pts.push(q);p=q;if(!fbIn(Y,q[0],q[1]))break;}
    half.push(pts);}
  return fbDP([...half[1].reverse(),p0,...half[0]],.8);}

/* ---------- a district's polygon: the raster outline moved back onto road corridors and precinct rings ---------- */
function fbCtx(W,D,G,B){const segs=[],grid=new Map(),gc=40,key=(i,j)=>i*100003+j;
  (W.roadList||[]).forEach(([w,P],ri)=>{const half=w/2+(w>=7?2.6:1.2),meta={k:'road',w,id:ri};for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k];if(a[0]===b[0]&&a[1]===b[1])continue;
    const s={a,b,half,ri,key:'r'+ri+':'+k,meta},m=half+FAB.snap+2;segs.push(s);
    for(let i=Math.floor((Math.min(a[0],b[0])-m)/gc);i<=Math.floor((Math.max(a[0],b[0])+m)/gc);i++)for(let j=Math.floor((Math.min(a[1],b[1])-m)/gc);j<=Math.floor((Math.max(a[1],b[1])+m)/gc);j++){const g=key(i,j);let A=grid.get(g);if(!A)grid.set(g,A=[]);A.push(s);}}});
  const rings=fbPrecincts(W).filter(({f})=>f.tag!=='open'&&Math.max(f.hw,f.hd)>=8).filter(({f})=>f.cx>B[0]-200&&f.cx<B[2]+200&&f.cz>B[1]-200&&f.cz<B[3]+200).map(({f,i})=>({f,i,meta:{k:'ring',id:i}}));
  return{W,D,segs,near:(x,z)=>grid.get(key(Math.floor(x/gc),Math.floor(z/gc)))||[],rings,nodes:G.nodes.filter(n=>n.deg>=3)};}
function fbSnapAt(ctx,x,z){let best=null;   // the nearest corridor or ring line within FAB.snap of where the raster put the outline
  for(const s of ctx.near(x,z)){const{a,b}=s,dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,t=((x-a[0])*dx+(z-a[1])*dz)/l2;if(t<-.05||t>1.05)continue;const tt=clamp(t,0,1),fx=a[0]+dx*tt,fz=a[1]+dz*tt,d=Math.hypot(x-fx,z-fz);
    const err=Math.abs(d-s.half);if(err>=FAB.snap||d<1e-6||(best&&err>=best.err))continue;const l=Math.sqrt(l2);best={err,x:fx+(x-fx)/d*s.half,z:fz+(z-fz)/d*s.half,ux:dx/l,uz:dz/l,key:s.key,src:'r'+s.ri,meta:s.meta};}
  for(const R of ctx.rings){const f=R.f,dx=x-f.cx,dz=z-f.cz;if(Math.abs(dx)+Math.abs(dz)>f.hw+f.hd+FAB.ring+FAB.snap+40)continue;
    if(f.circ){const d=Math.hypot(dx,dz),r=f.hw+FAB.ring,err=Math.abs(d-r);if(err<FAB.snap&&d>1e-6&&(!best||err<best.err))best={err,x:f.cx+dx/d*r,z:f.cz+dz/d*r,ux:-dz/d,uz:dx/d,key:'f'+R.i,src:'f'+R.i,meta:R.meta};continue;}
    const u=f.c*dx-f.s*dz,v=f.s*dx+f.c*dz,hu=f.hw+FAB.ring,hv=f.hd+FAB.ring,eu=Math.abs(u)-hu,ev=Math.abs(v)-hv;if(eu>FAB.snap||ev>FAB.snap||(eu<-FAB.snap&&ev<-FAB.snap))continue;
    let U=u,V=v,side;if(eu>ev){U=Math.sign(u)*hu;V=clamp(v,-hv,hv);side=u>0?0:1;}else{V=Math.sign(v)*hv;U=clamp(u,-hu,hu);side=v>0?2:3;}
    const px=f.cx+f.c*U+f.s*V,pz=f.cz-f.s*U+f.c*V,err=Math.hypot(x-px,z-pz);if(err>=FAB.snap||(best&&err>=best.err))continue;
    const ax=side<2?[f.s,f.c]:[f.c,-f.s];best={err,x:px,z:pz,ux:ax[0],uz:ax[1],key:'f'+R.i+':'+side,src:'f'+R.i,meta:R.meta};}
  return best;}
function fbLineX(a,b){const den=a.ux*b.uz-a.uz*b.ux;if(Math.abs(den)<Math.sin(20*DEG))return null;const t=((b.x-a.x)*b.uz-(b.z-a.z)*b.ux)/den;return[a.x+a.ux*t,a.z+a.uz*t];}   // two snap lines' crossing (not near parallel)
function fbEdgeMeta(ctx,P,T,k){const a=T[k],b=T[(k+1)%P.length],src=t=>t?[t.src,t.src2]:[],sa=src(a),sb=src(b);   // both ends on one corridor or ring: that; else what the raster has just outside
  for(const s of sa)if(s&&sb.includes(s))return(a.src===s?a.meta:a.meta2)||b.meta;
  const p=P[k],q=P[(k+1)%P.length],dx=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(dx,dz)||1,D=ctx.D,cls=d=>{const x=(p[0]+q[0])/2+dz/l*d,z=(p[1]+q[1])/2-dx/l*d,i=Math.floor((x-D.x0)/D.cs),j=Math.floor((z-D.z0)/D.cs);return i<0||j<0||i>=D.nx||j>=D.nz?0:D.C[j*D.nx+i];};
  const v=cls(3)===6?cls(6):cls(3);return ctx.cm[v]||ctx.cm[0];}
// Where snapping makes edges cross (near a junction a point can land on the other road's line), the points at the crossing edges go back to
// the raster, a few at a time, until nothing crosses.
function fbDistrictPoly(ctx,d){const L=d.loops.map(L0=>{const raw=L0.map(p=>[p[0],p[1]]).filter((p,k,A)=>{const q=A[(k+1)%A.length];return p[0]!==q[0]||p[1]!==q[1];});   // P1's loops repeat their first point at the end
    return{raw,S:raw.map(p=>fbSnapAt(ctx,p[0],p[1])),bad:new Uint8Array(raw.length)};});
  const build=r=>{const n0=r.raw.length,Q=[],T=[],O0=[];   // O: the raster point each point stands for (an inserted corner: k+.5)
    for(let k=0;k<n0;k++){const a=r.bad[k]?null:r.S[k],k2=(k+1)%n0,b=r.bad[k2]?null:r.S[k2];Q.push(a?[a.x,a.z]:r.raw[k]);T.push(a);O0.push(k);
      if(a&&b&&a.key!==b.key){const X=fbLineX(a,b);   // the corner where two lines meet, if the raster cut it off
        if(X&&Math.hypot(X[0]-a.x,X[1]-a.z)<10&&Math.hypot(X[0]-b.x,X[1]-b.z)<10){Q.push(X);T.push({x:X[0],z:X[1],ux:b.ux,uz:b.uz,key:b.key,src:a.src,src2:b.src,meta:a.meta,meta2:b.meta});O0.push(k+.5);}}}
    let E=Q.map((_,k)=>fbEdgeMeta(ctx,Q,T,k)),P=Q,O=O0;
    for(let pass=0;pass<3;pass++){const keep=[];for(let k=0;k<P.length;k++){const a=P[(k+P.length-1)%P.length],p=P[k],b=P[(k+1)%P.length];   // no points on a straight run of one kind, none closer than 0.6 m
        if(Math.hypot(p[0]-a[0],p[1]-a[1])<.6&&keep.length)continue;if(E[(k+P.length-1)%P.length]===E[k]&&fbSegD2(p[0],p[1],a,b)<.09)continue;keep.push(k);}
      if(keep.length===P.length||keep.length<3)break;P=keep.map(k=>P[k]);E=keep.map(k=>E[k]);O=keep.map(k=>O[k]);}
    return{P,E,O};};
  for(let it=0;it<40;it++){const R=L.map(build),X=fbCrossings(R.map(r=>r.P),400),flip=R.findIndex((r,i)=>i?pArea(r.P)>=0:pArea(r.P)<=0);
    if(!X.length&&flip<0){ctx.snapFixed=(ctx.snapFixed||0)+L.reduce((s,r)=>s+r.bad.reduce((a,b)=>a+b,0),0);return R.map(r=>({P:r.P,E:r.E}));}
    if(flip>=0)L[flip].bad.fill(1);
    const mark=(ri,i)=>{const r=R[ri],n=r.O.length,n0=L[ri].raw.length;for(const j of[i-1,i,i+1,i+2]){const o=r.O[((j%n)+n)%n];L[ri].bad[Math.floor(o)]=1;L[ri].bad[Math.ceil(o)%n0]=1;}};
    for(const[ra,ia,rb,ib]of X){mark(ra,ia);mark(rb,ib);}}
  ctx.unsnapped=(ctx.unsnapped||0)+1;return L.map(r=>{const P=r.raw;return{P,E:P.map((_,k)=>fbEdgeMeta(ctx,P,[],k))};});}   // the raster outline as it was
// compita: a district's sharp tip (< 62°) within 24 m of a road junction becomes a small square, the district minus a disc round the tip
// (r 30 m under 40°, else 21 m). The disc's edge is an arc across the tip, and the polygon is split by it.
function fbForks(ctx,Y,sqMeta){const out={rest:[Y],squares:[]},P=Y[0].P,n=P.length;
  for(let k=0;k<n;k++){const v=P[k],a=P[(k+n-1)%n],b=P[(k+1)%n],u1=[a[0]-v[0],a[1]-v[1]],u2=[b[0]-v[0],b[1]-v[1]],cr=u2[0]*u1[1]-u2[1]*u1[0];if(cr<=0)continue;   // convex corners only
    const ang=Math.atan2(cr,u1[0]*u2[0]+u1[1]*u2[1])/DEG;if(ang>=FAB.fork.ang||!ctx.nodes.some(nd=>Math.hypot(nd.x-v[0],nd.z-v[1])<FAB.fork.near))continue;
    const r=ang<40?FAB.fork.r[0]:FAB.fork.r[1],t0=Math.atan2(u2[1],u2[0])-12*DEG,t1=t0+(ang+24)*DEG,arc=[];for(let s=0;s<=16;s++){const t=t0+(t1-t0)*s/16;arc.push([v[0]+Math.cos(t)*r,v[1]+Math.sin(t)*r]);}
    for(let m=0;m<out.rest.length;m++){const R=out.rest[m];if(!fbIn(R,v[0]+(u1[0]+u2[0])*.01,v[1]+(u1[1]+u2[1])*.01))continue;const sp=fbSplit(R,arc,sqMeta);if(!sp)break;
      const sq=sp.L.filter(Q=>fbIn(Q,v[0]+(u1[0]/Math.hypot(...u1)+u2[0]/Math.hypot(...u2))*2,v[1]+(u1[1]/Math.hypot(...u1)+u2[1]/Math.hypot(...u2))*2));
      if(!sq.length||fbArea(sq[0])<=60)break;out.squares.push({Y:sq[0],ang:+ang.toFixed(1),r,x:v[0],z:v[1]});out.rest.splice(m,1,...sp.R,...sp.L.filter(Q=>Q!==sq[0]));break;}}
  return out;}

/* ---------- recursive cuts (4.3) ---------- */
function fbSeed(x,z,lv){return Math.floor(hash2(Math.round(x*10)+lv*1000003,Math.round(z*10))*4294967296)>>>0;}
function fbWidth(prm,len,lv){return len>170||(lv===0&&len>110)?prm.wB:len>70?prm.wC:prm.wC-.6;}
function fbSub(ctx,Y,lv,cls0,did,out){const pole=fbPole(Y,null,1),cls=FAB.map[ctx.zone(pole.x,pole.z)]||cls0,prm=FAB.cls[cls],R=RNG(fbSeed(pole.x,pole.z,lv)^(did===ctx.h15?0x5bd1e995:0)),   // the old zone at the piece's pole (a district mixes them); the district's class in gardens and precincts. h15: other dice in one district
  A=fbArea(Y),ob=fbOBB(Y[0].P),At=lerp(prm.A[0],prm.A[1],R());
  const block=()=>{const x=fbCm(pole.x),z=fbCm(pole.z);out.blocks.push({Y,cls,district:did,area:A,lv,x,z,L:ob.L,S:ob.S});if(out.tok)out.tok.push(0,Math.round(x*100),Math.round(z*100),cls==='dense'?0:1);};   // its pole to the centimetre: the block's dice (parcels.js)
  if(lv>30||A<1.15*prm.A[0]||(A<=At&&ob.L<=prm.L)){block();return;}
  const[th,conf]=fbFieldAt(ctx.F,pole.x,pole.z),ex=Y[0].P,n=ex.length,ED=ex.map((p,k)=>{const q=ex[(k+1)%n];return{a:p,b:q,l:Math.hypot(q[0]-p[0],q[1]-p[1]),d:Math.atan2(q[1]-p[1],q[0]-p[0]),m:Y[0].E[k]};});
  const dirs=[[th,1],[th+Math.PI/2,1]];for(const e of ED.slice().sort((a,b)=>b.l-a.l).slice(0,3))dirs.push([e.d,0],[e.d+Math.PI/2,0]);
  const uniq=[];for(const[d,f]of dirs)if(uniq.every(([u])=>fbAD(d,u)>5*DEG))uniq.push([d,f]);
  const fl=ED.filter(e=>(e.m.k==='road'||e.m.k==='ring')&&e.l>18),minR=fbMinR(prm.minT),ext={};
  for(const[d]of uniq){const nx=-Math.sin(d),nz=Math.cos(d);let s0=Infinity,s1=-Infinity;for(const p of ex){const s=p[0]*nx+p[1]*nz;if(s<s0)s0=s;if(s>s1)s1=s;}ext[d]=[s0,s1];}
  const emax=Math.max(...uniq.map(([d])=>ext[d][1]-ext[d][0])),cands=[];
  for(const[d,isF]of uniq){const ux=Math.cos(d),uz=Math.sin(d),nx=-uz,nz=ux,[s0,s1]=ext[d],e=s1-s0;if(e<2*prm.minT+4)continue;
    const pos=[.36,.44,.5,.56,.64].map(t=>[s0+t*e,false]);
    for(const f of fl){if(fbAD(f.d,d)>14*DEG)continue;const sf=(f.a[0]+f.b[0])/2*nx+(f.a[1]+f.b[1])/2*nz,dep=lerp(prm.belt[0],prm.belt[1],R());   // the back street of a main road: one block deep
      for(const sp of[sf+dep,sf-dep])if(sp>s0+prm.minT&&sp<s1-prm.minT)pos.push([sp,true]);}
    const cs=pole.x*nx+pole.z*nz;
    for(const[sp,anch]of pos){const q0=[pole.x+(sp-cs)*nx,pole.z+(sp-cs)*nz],st=fbStraight(Y,q0,d);if(!st)continue;const p0=st.p0;if(!fbIn(Y,p0[0],p0[1]))continue;
      const[ft,fc]=fbFieldAt(ctx.F,p0[0],p0[1]);let bend=!!isF&&fc>.25&&Math.min(fbAD(d,ft),fbAD(d,ft+Math.PI/2))<14*DEG,C=st.L;
      if(bend){const T=fbTrace(Y,ctx.F,p0,d);if(fbIn(Y,T[0][0],T[0][1])||fbIn(Y,T[T.length-1][0],T[T.length-1][1]))continue;const X=fbX(Y,T);if(X&&X.every(c=>!c.r))C=T;else bend=false;}   // a bend that runs into a hole goes straight across it
      const w=fbCm(fbWidth(prm,fbLen(C),lv)),m={k:'street',w,lv,id:-1};   // to the centimetre (3.8 - .6 is not 3.2), as fbReplay reads it
      const C2=C.map(p=>p.slice());{const ext2=(i,j)=>{const p=C2[i],q=C2[j],l=Math.hypot(p[0]-q[0],p[1]-q[1])||1;p[0]+=(p[0]-q[0])/l*1.5;p[1]+=(p[1]-q[1])/l*1.5;};ext2(0,1);ext2(C2.length-1,C2.length-2);}
      const pieces=fbCut(Y,C2,w,m);if(!pieces)continue;const runs=fbRuns(Y,C2);if(!runs)continue;const big=pieces.map(Q=>({Q,A:fbArea(Q)})).sort((a,b)=>b.A-a.A);
      if(big[0].A<280||big[1].A<280||!fbFat(big[0].Q,minR)||!fbFat(big[1].Q,minR))continue;
      let sc=0;const ends=[];
      for(const u of runs)for(const[c,o]of[[u.a,u.S[1]],[u.b,u.S[u.S.length-2]]]){const P=Y[c.r].P,e0=P[c.i],e1=P[(c.i+1)%P.length],de=Math.atan2(c.z-o[1],c.x-o[0]),al=fbAD(Math.atan2(e1[1]-e0[1],e1[0]-e0[0]),de);   // every end meets its street square on
        sc+=((Math.PI/2-al)/(Math.PI/4))**2/runs.length;ends.push({k:Y[c.r].E[c.i].k,ang:+(al/DEG).toFixed(1)});}
      if(!bend)sc+=1.6*conf*(Math.min(fbAD(d,th),fbAD(d,th+Math.PI/2))/(15*DEG))**2;
      const a1=big[0].A,a2=big[1].A;sc+=anch?0:2*((a1-a2)/(a1+a2))**2;sc+=2.2*(1-e/emax);
      for(const g of big.slice(0,2)){const o2=fbOBB(g.Q[0].P),comp=o2.A?g.A/o2.A:0;sc+=2.5*Math.max(0,.74-comp);if(!fbFat(g.Q,12.5))sc+=.5;}   // thick < 22 m
      sc+=.7*(pieces.length-2);if(anch&&lv<=3)sc-=.8;sc+=R()*.45;
      cands.push({sc,pieces,w,m,anch,kind:bend?'bend':'straight',runs,ends,C2});}}
  out.tried+=cands.length;if(!cands.length){block();return;}
  let c=cands[0];for(const k of cands)if(k.sc<c.sc)c=k;
  // the chosen street's line to the centimetre, and the cut again with it: fbReplay cuts with the same numbers (the line as it was, flagged, where that fails)
  const Cr=c.C2.map(p=>[fbCm(p[0]),fbCm(p[1])]),pr=fbCut(Y,Cr,c.w,c.m),rr=pr&&fbRuns(Y,Cr),exact=!!(pr&&rr&&pr.length===c.pieces.length&&rr.length===c.runs.length),
    C=exact?Cr:c.C2,pieces=exact?pr:c.pieces,runs=exact?rr:c.runs,ends=exact?fbEnds(Y,runs):c.ends;
  c.m.id=out.streets.length;out.cuts++;   // one street per run: a cut across a hole is two streets
  runs.forEach((u,i)=>out.streets.push({S:u.S,w:c.w,lv,kind:c.kind,anch:c.anch,ends:ends.slice(2*i,2*i+2),district:did,len:+fbLen(u.S).toFixed(1)}));
  let mask=0;const kids=pieces.map((g,gi)=>{const a=fbArea(g),f=a<FAB.frag.area||!fbFat(g,fbMinR(FAB.frag.thick));if(f)mask|=1<<gi;return{g,a,f};});
  if(out.tok){out.tok.push(1|(c.kind==='bend'?2:0)|(c.anch?4:0)|(exact?0:8),Math.round(c.w*100),mask,C.length);let px=0,pz=0;
    for(const p of C)if(exact){const x=Math.round(p[0]*100),z=Math.round(p[1]*100);out.tok.push(x-px,z-pz);px=x;pz=z;}else out.tok.push(p[0],p[1]);}
  for(const{g,a,f}of kids){if(f){out.opens.push({Y:g,area:a,why:'frag',district:did});continue;}fbSub(ctx,g,lv+1,cls0,did,out);}}
// where a street's runs end on the edges of Y: the edge's kind and the angle the street meets it at (H13)
function fbEnds(Y,runs){const ends=[];for(const u of runs)for(const[c,o]of[[u.a,u.S[1]],[u.b,u.S[u.S.length-2]]]){const P=Y[c.r].P,e0=P[c.i],e1=P[(c.i+1)%P.length],de=Math.atan2(c.z-o[1],c.x-o[0]),al=fbAD(Math.atan2(e1[1]-e0[1],e1[0]-e0[0]),de);
    ends.push({k:Y[c.r].E[c.i].k,ang:+(al/DEG).toFixed(1)});}return ends;}
// fbSub again from its record (fbPack): the same cuts in the same order, without the search
function fbReplaySub(Y,lv,did,out,T){const t=T.a[T.i++];
  if(t===0){const x=T.a[T.i++]/100,z=T.a[T.i++]/100,cls=T.a[T.i++]?'mid':'dense',ob=fbOBB(Y[0].P);out.blocks.push({Y,cls,district:did,area:fbArea(Y),lv,x,z,L:ob.L,S:ob.S});return;}
  const w=T.a[T.i++]/100,mask=T.a[T.i++],n=T.a[T.i++],C=[];
  if(t&8)for(let k=0;k<n;k++)C.push([T.a[T.i++],T.a[T.i++]]);else{let x=0,z=0;for(let k=0;k<n;k++){x+=T.a[T.i++];z+=T.a[T.i++];C.push([x/100,z/100]);}}
  const m={k:'street',w,lv,id:out.streets.length},pieces=fbCut(Y,C,w,m),runs=pieces&&fbRuns(Y,C);if(!pieces||!runs)throw Error('a baked street no longer cuts its block (district '+did+')');
  const ends=fbEnds(Y,runs);out.cuts++;runs.forEach((u,i)=>out.streets.push({S:u.S,w,lv,kind:t&2?'bend':'straight',anch:!!(t&4),ends:ends.slice(2*i,2*i+2),district:did,len:+fbLen(u.S).toFixed(1)}));
  pieces.forEach((g,gi)=>{if(mask>>gi&1)out.opens.push({Y:g,area:fbArea(g),why:'frag',district:did});else fbReplaySub(g,lv+1,did,out,T);});}

/* ---------- the bake (P4): the fabric as data, and what it was cut from ---------- */
function fbCm(v){return Math.round(v*100)/100;}
// a hash of what the districts and their streets are drawn from, the zones and this code aside: FAB and CD, the precincts (the footprints before the
// houses), the roads, the join's options (termini, bridges, the island, the river) and the desktop tier's ground every 64 m in the city
function fbKey(W){let h1=0x9e3779b9|0,h2=0x85ebca6b|0;const add=v=>{const x=Math.round(v)|0;h1=Math.imul(h1^x,0x01000193);h2=Math.imul(h2^x,0x5bd1e995);h2^=h2>>>13;},str=s=>{for(let i=0;i<s.length;i++)add(s.charCodeAt(i));};
  str(JSON.stringify(FAB));str(JSON.stringify(typeof CD!=='undefined'?CD:null));
  for(const{f}of fbPrecincts(W)){add(f.cx*100);add(f.cz*100);add(f.hw*100);add(f.hd*100);add(f.c*1e4);add(f.s*1e4);add(f.circ?1:0);str(f.tag||'');if(f.poly)for(const p of f.poly){add(p[0]*100);add(p[1]*100);}}
  for(const[w,P]of W.roadList||[]){add(w*100);for(const p of P){add(p[0]*100);add(p[1]*100);}}
  str(JSON.stringify(W.roadOpts||{}));   // its functions (the country) drop out; the ground below stands for them
  const G=W.routeGround||W,out=W.roadOpts&&W.roadOpts.country||(()=>false);for(let z=-3008;z<=3392;z+=64)for(let x=-3200;x<=3008;x+=64)if(!out(x,z))add(G.gy(x,z)*10);
  return(h1>>>0).toString(36)+'.'+(h2>>>0).toString(36);}
// the record of a live cut (W.fabric.bake) as plain data: per district its polygon (centimetres, each point after the first as a step from the one
// before) and fbSub's record (a block: 0, its pole, its class; a street: its kind, width, which pieces are fragments, its line); a district not cut
// as its raster outline. Edge metas in one table, by index
function fbPack(F){const metas=[],mi=new Map(),M=e=>{let i=mi.get(e);if(i===undefined){i=metas.length;mi.set(e,i);metas.push(e);}return i;},
    enc=P=>{const A=[];let px=0,pz=0;for(const p of P){const x=Math.round(p[0]*100),z=Math.round(p[1]*100);A.push(x-px,z-pz);px=x;pz=z;}return A;},Yp=Y=>Y.map(g=>[enc(g.P),g.E.map(M)]);
  const D=F.bake.map(d=>d.tok?[d.id,d.cls,d.as,d.ha,Yp(d.Y),d.tok]:[d.id,d.cls,d.why,Math.round(d.area*100),Yp(d.Y)]);
  return{v:FAB.v,key:F.key,districts:F.districts,tried:F.tried,snap:[F.stats.unsnapped,F.stats.snapFixed],metas,D};}
// a fabric from fbPack's record: the district polygons, their compita and the same cuts (null, with a warning, when the record does not fit)
function fbReplay(W,B){const metas=B.metas.map(m=>Object.assign({},m)),dec=A=>{const P=[];let x=0,z=0;for(let i=0;i<A.length;i+=2){x+=A[i];z+=A[i+1];P.push([x/100,z/100]);}return P;},
    Yu=Y=>Y.map(([A,E])=>({P:dec(A),E:E.map(i=>metas[i])}));
  const ctx={nodes:roadGraph(W).nodes.filter(n=>n.deg>=3)},out={blocks:[],streets:[],squares:[],opens:[],dY:[],tried:B.tried,cuts:0},per=[],sqMeta={k:'square'};
  try{for(const d of B.D){if(d.length===5){out.opens.push({Y:Yu(d[4]),area:d[3]/100,why:d[2],district:d[0]});per.push({id:d[0],cls:d[1],skipped:true});continue;}
      const[id,cls,as,ha,Yr,tok]=d,Y=Yu(Yr),nb=out.blocks.length,nc=out.cuts,T={a:tok,i:0};out.dY.push({id,Y});const fk=fbForks(ctx,Y,sqMeta);for(const s of fk.squares)out.squares.push({...s,district:id});
      for(const R of fk.rest){const a=fbArea(R);if(a>FAB.keep)fbReplaySub(R,0,id,out,T);else out.opens.push({Y:R,area:a,why:'small',district:id});}
      if(T.i!==tok.length)throw Error('district '+id+' has '+(tok.length-T.i)+' numbers of its record left');
      per.push({id,cls,as,ha,blocks:out.blocks.length-nb,cuts:out.cuts-nc});}}
  catch(e){console.warn('street-fabric.js does not fit the districts ('+e.message+'): cutting the streets live');return null;}
  return{out,per};}
// the fabric and its numbers, live or replayed alike
function fbFinish(W,out,per,A,key,F,districts){let ends=0,bad=0;for(const s of out.streets)for(const e of s.ends)if(FAB.junction[e.k]){ends++;if(e.ang<60)bad++;}   // H13: street ends that meet a road, a street, a ring or a square outside 60-120°
  const pct=(L,q)=>L.length?Math.round(L[Math.min(L.length-1,Math.floor(q*L.length))]):0,ar=L=>{const s=L.map(b=>b.area).sort((a,b)=>a-b);return{n:s.length,p10:pct(s,.1),p50:pct(s,.5),p90:pct(s,.9)};},
    inA=b=>b.x>=A[0]&&b.x<=A[2]&&b.z>=A[1]&&b.z<=A[3];
  const km=out.streets.reduce((s,t)=>s+t.len,0)/1000,byW={};for(const s of out.streets){const k=s.w.toFixed(1);byW[k]=(byW[k]||0)+1;}
  return{area:A,key,districts,F,...out,stats:{districts:per,cuts:out.cuts,streets:out.streets.length,tried:out.tried,blocks:out.blocks.length,squares:out.squares.length,opens:out.opens.length,
    km:+km.toFixed(2),byWidth:byW,blockArea:ar(out.blocks),blockAreaWindow:ar(out.blocks.filter(inA)),H13:ends?+(bad/ends*100).toFixed(1):0,H13ends:ends,H13bad:bad,holes:out.blocks.filter(b=>b.Y.length>1).length}};}
// the direction field of a fabric (a replayed one has none; the review layer 'dfield' draws it)
function fabricField(W,F){if(F.F)return F.F;let B=[1e9,1e9,-1e9,-1e9];for(const d of F.dY)for(const p of d.Y[0].P){B[0]=Math.min(B[0],p[0]);B[1]=Math.min(B[1],p[1]);B[2]=Math.max(B[2],p[0]);B[3]=Math.max(B[3],p[1]);}
  return F.F=fbField(W,[B[0]-8,B[1]-8,B[2]+8,B[3]+8]);}

/* ---------- the run ---------- */
function cityFabric(W,o={}){if(W.fabric&&!o.force)return W.fabric;const t0=performance.now(),q=typeof location!=='undefined'?location.search:'',key=fbKey(W),h15=/[?&]h15=(-?[\d.]+)(?:,(-?[\d.]+))?/.exec(q);W.fabricKey=key;
  if(!o.live&&!h15&&!/[?&]fabric=live/.test(q)&&typeof ROME_FABRIC_BAKED!=='undefined'){const B=ROME_FABRIC_BAKED,r=B&&B.key===key&&B.v===FAB.v?fbReplay(W,B):null;
    if(r){W.fabric=fbFinish(W,r.out,r.per,o.area||FAB.area,key,null,B.districts);W.fabric.baked=true;Object.assign(W.fabric.stats,{unsnapped:B.snap[0],snapFixed:B.snap[1],baked:true,ms:Math.round(performance.now()-t0)});return W.fabric;}
    if(!B||B.key!==key||B.v!==FAB.v)console.warn('street-fabric.js was cut from other roads, precincts or ground: cutting the streets live (npm run build:test && npm run bake:roads)');W.fabricStale=true;}
  const D=cityDistricts(W),G=roadGraph(W),A=o.area||FAB.area,cs=D.cs;
  // every district of FAB.minArea; o.area: those with that much of their cells in the window
  let sel=D.districts.filter(d=>d.area>=FAB.minArea);
  if(o.area){const cnt=new Map();for(let j=Math.max(0,Math.floor((A[1]-D.z0)/cs));j<=Math.min(D.nz-1,Math.floor((A[3]-D.z0)/cs));j++)for(let i=Math.max(0,Math.floor((A[0]-D.x0)/cs));i<=Math.min(D.nx-1,Math.floor((A[2]-D.x0)/cs));i++){const l=D.lab[j*D.nx+i];if(l>=0)cnt.set(l,(cnt.get(l)||0)+1);}
    sel=D.districts.filter(d=>(cnt.get(d.id)||0)*cs*cs>=FAB.minArea);}
  let B=[1e9,1e9,-1e9,-1e9];for(const d of sel)for(const p of d.loops[0]){B[0]=Math.min(B[0],p[0]);B[1]=Math.min(B[1],p[1]);B[2]=Math.max(B[2],p[0]);B[3]=Math.max(B[3],p[1]);}
  const ctx=fbCtx(W,D,G,B);ctx.F=fbField(W,[B[0]-8,B[1]-8,B[2]+8,B[3]+8]);const tF=performance.now();
  if(h15){if(h15[2]===undefined)ctx.h15=+h15[1];else{const i=Math.floor((+h15[1]-D.x0)/cs),j=Math.floor((+h15[2]-D.z0)/cs);ctx.h15=i>=0&&j>=0&&i<D.nx&&j<D.nz?D.lab[j*D.nx+i]:-1;}}   // a district by its id, or the one at x,z
  ctx.zone=(x,z)=>{try{return W.cityClass?W.cityClass(x,z):'other';}catch(e){return'other';}};
  ctx.cm=[{k:'edge'},{k:'water'},{k:'road',w:0,id:-1},{k:'ring',id:-1},{k:'ring',id:-1},{k:'cliff'},{k:'edge'}];   // what lies outside an edge the snap did not place, by raster class
  const out={blocks:[],streets:[],squares:[],opens:[],dY:[],tried:0,cuts:0},per=[],bake=[],sqMeta={k:'square'};   // dY: each district's polygon (P3: the area v2 owns, parcels.js); bake: fbPack's record
  for(const d of sel){const cls=FAB.map[d.cls],t1=performance.now(),nb=out.blocks.length,nc=out.cuts;
    if(!cls||!d.access){const Y=d.loops.map(P=>({P:P.map(p=>[fbCm(p[0]),fbCm(p[1])]),E:P.map(()=>ctx.cm[0])})),why=cls?'noAccess':'class:'+d.cls;
      out.opens.push({Y,area:d.area,why,district:d.id});per.push({id:d.id,cls:d.cls,skipped:true});bake.push({id:d.id,cls:d.cls,why,area:d.area,Y});continue;}
    const Y=fbDistrictPoly(ctx,d).map(g=>({P:g.P.map(p=>[fbCm(p[0]),fbCm(p[1])]),E:g.E})),fk=fbForks(ctx,Y,sqMeta),ha=+(d.area/1e4).toFixed(1);out.dY.push({id:d.id,Y});for(const s of fk.squares)out.squares.push({...s,district:d.id});
    out.tok=[];for(const R of fk.rest){const a=fbArea(R);if(a>FAB.keep)fbSub(ctx,R,0,cls,d.id,out);else out.opens.push({Y:R,area:a,why:'small',district:d.id});}
    bake.push({id:d.id,cls:d.cls,as:cls,ha,Y,tok:out.tok});delete out.tok;
    per.push({id:d.id,cls:d.cls,as:cls,ha,blocks:out.blocks.length-nb,cuts:out.cuts-nc,ms:Math.round(performance.now()-t1)});}
  W.fabric=fbFinish(W,out,per,A,key,ctx.F,sel.map(d=>d.id));W.fabric.bake=bake;
  Object.assign(W.fabric.stats,{unsnapped:ctx.unsnapped||0,snapFixed:ctx.snapFixed||0,msField:Math.round(tF-t0),ms:Math.round(performance.now()-t0),h15:ctx.h15});
  return W.fabric;}

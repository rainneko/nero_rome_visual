/* Faces of the street network (spec 5.2, the author's three kinds of open ground): what stands on a piece of ground that is not a whole block.
   F0 a sliver: left to the street. F1 a small triangle (< 300 m²): paved, with a big tree and an altar, a crossroads shrine or a street basin.
   F2 a larger triangle (< 1200 m²): paved, a small temple facing the longest side (the road), or a tree and an altar.
   F3 two triangles (a block cut by a diagonal lane): both paved as one square, a basin at the lane's middle, a cypress in each sharp corner.
   F4 an awkward piece (< 2500 m², a sharp corner or too narrow for a court): a fountain in the middle, or a small garden, inside paving.
   F5 everything else is a block of houses. Triangles only come from real roads: a block a main road crosses is cut along the road's edge
   (faceRoadCut), and the old random diagonal cut only survives as F3. W.faceStats counts what was placed. */
function faceInfo(P){let A=Math.abs(pArea(P)),per=0,Lmax=0,iL=0;const n=P.length,ang=[];
  for(let i=0;i<n;i++){const a=P[(i+n-1)%n],b=P[i],c=P[(i+1)%n],u=[a[0]-b[0],a[1]-b[1]],v=[c[0]-b[0],c[1]-b[1]],l=Math.hypot(c[0]-b[0],c[1]-b[1]);per+=l;if(l>Lmax){Lmax=l;iL=i;}
    ang.push(Math.acos(clamp((u[0]*v[0]+u[1]*v[1])/((Math.hypot(...u)*Math.hypot(...v))||1),-1,1))*180/Math.PI);}
  const corners=ang.filter(a=>a<170).length;return{A,n:corners,minAng:Math.min(...ang),rho:2*A/(per||1),Lmax,iL,ang};}
function faceClass(P){const f=faceInfo(P);
  f.kind=f.A<80||f.rho<3?'F0':f.n===3&&f.A<300?'F1':f.n===3&&f.A<1200?'F2':f.n>=4&&f.A<2500&&(f.minAng<55||f.rho<10)?'F4':f.n===3?'F2':'F5';return f;}
function faceStat(W,k,P,n=1){const S=W.faceStats||(W.faceStats={});S[k]=(S[k]||0)+n;if(P)(W.faceLog||(W.faceLog=[])).push({kind:k,c:pCen(P).map(Math.round),area:Math.round(Math.abs(pArea(P))),P});}
// the block cut by the widest main road strip that crosses it: the pieces on either side of the road's reserved corridor, or null
function faceRoadCut(W,B){const ob=lotOBB(B),r=Math.hypot(ob.hw,ob.hd);let best=null;
  for(const[w,P]of W.roadList||[]){const half=w/2+(w>=7?2.6:1.2);for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];if(segD(ob.cx,ob.cz,a[0],a[1],b[0],b[1])>r+half)continue;
      const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<1)continue;const tx=dx/l,tz=dz/l,nx=-tz,nz=tx,c=a[0]*nx+a[1]*nz,t0=a[0]*tx+a[1]*tz;
      const sd=B.map(p=>p[0]*nx+p[1]*nz-c),st=B.map(p=>p[0]*tx+p[1]*tz-t0),mn=Math.min(...sd),mx=Math.max(...sd);
      if(mn>half||mx<-half||Math.max(...st)<-2||Math.min(...st)>l+2)continue;const cover=Math.min(mx,half)-Math.max(mn,-half);if(!best||cover>best.cover)best={nx,nz,c,half,cover};}}
  if(!best)return null;const h=best.half+1,out=[];   // 1 m beyond the corridor: the houses' eaves margin
  for(const sg of[1,-1]){const p=clipHalf(B,best.nx,best.nz,best.c+sg*h,sg);if(p&&Math.abs(pArea(p))>20){p.cut={nx:best.nx,nz:best.nz,c:best.c,h,sg};out.push(p);}}return out;}   // .cut: the road's line, for faceFrontage
// Shop houses along the main roads (the author, 2026-11-03: a main road runs between two rows of houses with shops on the ground floor; the cut blocks
// left it between paved squares and the side walls of rings). The strip of a cut piece next to the road, D m deep, becomes a row of lots whose front
// (L[0]->L[1], where lotBuild puts the shop bays) lies on the road's edge, each lw*(.75-1.15) wide. The road bends, the cut line is one straight
// segment of it: a lot that would touch the road's corridor (ok) steps back 0.8-3.8 m, so the row follows the bend in short steps. A lot that does not
// fit inside the piece at D or .72 D is left out (the sharp corners stay pavement). A 2.6 m back lane behind the row; what is left beyond it is
// judged as before (faceClass).
function faceFrontage(W,P,R,lw,D,ok){const k=P.cut;if(!k)return null;const{nx,nz,c,h,sg}=k,tx=nz,tz=-nx,off=c+sg*h,pt=(s,d)=>[s*tx+(c+sg*d)*nx,s*tz+(c+sg*d)*nz];
  const on=P.filter(p=>Math.abs(p[0]*nx+p[1]*nz-off)<.08).map(p=>p[0]*tx+p[1]*tz);if(on.length<2)return null;
  const pin=(x,z)=>{let hit=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
  const fits=L=>{const m=pCen(L);return L.every(p=>{const dx=m[0]-p[0],dz=m[1]-p[1],l=Math.hypot(dx,dz)||1;return pin(p[0]+dx/l*.3,p[1]+dz/l*.3);});};
  const s0=Math.min(...on)+.4,s1=Math.max(...on)-.4,lots=[];let back=0,tried=0;
  for(let s=s0;s1-s>=5;){let w=lw*(.75+.4*R());if(s1-s-w<5)w=s1-s;tried++;
    lot:for(const e of[0,.8,1.6,2.6,3.8])for(const d of[D,D*.72]){let L=[pt(s,h+e),pt(s+w,h+e),pt(s+w,h+e+d),pt(s,h+e+d)];if(pArea(L)<0)L=[L[1],L[0],L[3],L[2]];
      if(fits(L)&&(!ok||ok(L))){lots.push(L);back=Math.max(back,e+d);break lot;}}
    s+=w;}
  const rest=clipHalf(P,nx,nz,c+sg*(h+Math.max(back,D)+2.6),sg);return{lots,tried,rest:rest&&Math.abs(pArea(rest))>20?rest:null};}
// a polygon laid on the ground: clipped to the coarse terrain triangles (the split W.gy and the mesh use), so every piece is flat on its triangle and
// the terrain never pokes through (4 m triangles crossed the terrain's folds, and on road cuts the ground showed through the paving)
function faceDrape(W,g,P,lift){const G=W.grid,xs=P.map(p=>p[0]),zs=P.map(p=>p[1]),cl=(v,n)=>Math.max(0,Math.min(n-1,v)),
    i0=cl(Math.floor((Math.min(...xs)-G.x0)/G.dx),G.n),i1=cl(Math.floor((Math.max(...xs)-G.x0)/G.dx),G.n),j0=cl(Math.floor((Math.min(...zs)-G.z0)/G.dz),G.n),j1=cl(Math.floor((Math.max(...zs)-G.z0)/G.dz),G.n);
  const clip=(Q,T)=>{const sg=Math.sign((T[1][0]-T[0][0])*(T[2][1]-T[0][1])-(T[1][1]-T[0][1])*(T[2][0]-T[0][0]));   // Sutherland-Hodgman against the triangle T
    for(let e=0;e<3&&Q.length>2;e++){const a=T[e],b=T[(e+1)%3],side=p=>sg*((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])),R=[];
      for(let k=0;k<Q.length;k++){const p=Q[k],q=Q[(k+1)%Q.length],sp=side(p),sq=side(q);if(sp>=0)R.push(p);if((sp>=0)!==(sq>=0)){const t=sp/(sp-sq);R.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}Q=R;}return Q;};
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x0=G.x0+i*G.dx,z0=G.z0+j*G.dz,x1=x0+G.dx,z1=z0+G.dz;
    for(const T of[[[x0,z0],[x1,z0],[x0,z1]],[[x1,z1],[x0,z1],[x1,z0]]]){const Q=clip(P,T);if(Q.length>2&&Math.abs(pArea(Q))>.01)g.poly(Q.map(p=>[p[0],W.gy(p[0],p[1])+lift,p[1]]),[0,1,0]);}}}
// paving that follows the ground (the warm slabs of squares, palette 11), the piece reserved as open ground so no house or street paint lands on it
function facePave(W,g,P,role){g.set(11,.42);faceDrape(W,g,P,.1);
  const o=lotOBB(P),f=W.foot.add(o.cx,o.cz,o.hw,o.hd,o.rot,'open');f.poly=P;f.siteRole=role;return f;}
const faceAltar=(g,x,y,z,rot)=>{const F=frame(x,y,z,rot);g.set(6,.5);box(g,F,0,0,0,.7,1,.5,31);g.set(2,.55);box(g,F,0,1,0,.85,.15,.65,31);};
const faceInterior=(P,k)=>{const c=pCen(P);return P.map(p=>lp(p,c,k));};
// a piece the road network left (F1, F2, F4): pave it and put the one thing it is for; kind is the zone type.
// What stands there is drawn from the piece's own place (a hash of its centre), not from the block loop's shared dice R: any edit upstream
// shifted R and swapped a square's big tree for a basin. R is still drawn as the old code drew it, so the houses after the piece keep their dice.
const FACE_SALT=2283;   // keeps the squares in the promo shots as they were (the big tree and altar at -353,-792, the shrine and garden by -331,-729, the fountains by 183,-623) and 72 of the 106 others
// The F4 fountain on sloping ground (2026-11-05). rome_tholos_fountain stands on a flat octagonal plinth (apothem 4.2 m, corners at 22.5 + 45 j degrees
// in its own frame, lower step 0.36 m); set at the ground of the square's centre it hung up to 2.6 m over the draped paving on the downhill side
// (__floatCheck: 13 of the 24 fountains). Now the plinth is level at the uphill ground, sunk at most FOUNT_SINK into the slope (the lower step still
// shows), on an octagonal podium of travertine ashlar (part 48) turned with it: the wall goes down into the ground, a coping 0.1 m proud, and a short
// flight centred on the downhill face where one fits inside the square. A podium taller than FOUNT_DROP would be a bastion (steps all round would run
// 13-16 m across, out of the square): that square gets its garden instead and keeps the fountain's reserved ground, so no house after it moves.
// Nothing here draws from R or Rf. A square whose ground falls less than 0.08 m under the podium's edge is drawn exactly as before.
// A piece whose ground falls more than FACE_CLIFF times the square root of its area (a mean slope near 1:1) lies on a cliff or a hill's rock face:
// its paving hung down the face (-590,913: 27 m in 500 m2). It stays bare ground, counted as 'cliff'. Seven pieces in ?hq, the next steepest is 0.78.
const FACE_CLIFF=.85;
const FOUNT_AP=4.2,FOUNT_DRUM=4.5,FOUNT_CAP=4.6,FOUNT_SINK=.12,FOUNT_DROP=2.8;
// corner j of an octagon of apothem A round the fountain at c, turned by rot like the GLB (a local angle t is the world angle t - rot)
const fountOct=(c,rot,A,j)=>{const a=Math.PI/8+j*Math.PI/4-rot,r=A/Math.cos(Math.PI/8);return[c[0]+r*Math.cos(a),c[1]+r*Math.sin(a)];};
function faceFountainBase(W,c,rot){const gy=W.gy,yc=gy(...c),lo=[],mid=[];let mx=yc;
  for(let j=0;j<8;j++){const p=fountOct(c,rot,FOUNT_AP,j),q=fountOct(c,rot,FOUNT_AP,j+1);   // the ground under the plinth: its edge and two rings inside
    for(const t of[0,.5])for(const k of[1,.7,.35]){const h=gy(c[0]+(p[0]+(q[0]-p[0])*t-c[0])*k,c[1]+(p[1]+(q[1]-p[1])*t-c[1])*k);if(h>mx)mx=h;}}
  const y=Math.max(yc,mx-FOUNT_SINK);
  for(let j=0;j<8;j++){const p=fountOct(c,rot,FOUNT_CAP,j),q=fountOct(c,rot,FOUNT_CAP,j+1);let m=1e9;   // the ground along each face of the podium
    for(const t of[0,.25,.5,.75,1])m=Math.min(m,gy(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t));lo.push(m);mid.push(gy((p[0]+q[0])/2,(p[1]+q[1])/2));}
  return{y,rot,lo,mid,drop:y-Math.min(...lo)};}
// the podium: each face a wall from 0.5 m under its lowest ground up to the coping (0.22 m high, 0.1 m proud), the top under the plinth; faces the
// uphill ground covers are left out
function faceFountainDrum(W,g,c,B){const y=B.y,yC=y-.22,P3=(p,h)=>[p[0],h,p[1]],top=[];g.set(48,.42);
  for(let j=0;j<8;j++){const d0=fountOct(c,B.rot,FOUNT_DRUM,j),d1=fountOct(c,B.rot,FOUNT_DRUM,j+1),k0=fountOct(c,B.rot,FOUNT_CAP,j),k1=fountOct(c,B.rot,FOUNT_CAP,j+1),
      out=[(k0[0]+k1[0])/2-c[0],0,(k0[1]+k1[1])/2-c[1]];top.push(P3(k0,y));if(B.lo[j]>=y+.02)continue;const yb=B.lo[j]-.5;
    if(yC>yb){g.poly([P3(d0,yb),P3(d1,yb),P3(d1,yC),P3(d0,yC)],out);g.poly([P3(d0,yC),P3(d1,yC),P3(k1,yC),P3(k0,yC)],[0,-1,0]);}
    g.poly([P3(k0,Math.max(yC,yb)),P3(k1,Math.max(yC,yb)),P3(k1,y),P3(k0,y)],out);}
  g.poly(top,[0,1,0]);
  (ROME.supports=ROME.supports||[]).push({x:c[0],z:c[1],c:1,s:0,hw:FOUNT_DRUM,hd:FOUNT_DRUM});}   // the podium reaches the ground: __floatCheck must not call the fountain on it floating
// the flight down from the podium, centred on a face: the three lowest faces in turn, the first whose flight fits inside the square P. Risers equal
// and at most 0.27 m, treads 0.36 m, the last riser one step above the ground at the foot. Returns the number of steps (0: none needed or none fits).
function faceFountainStair(W,g,c,B,P){const gy=W.gy,hw=1.3,t=.36;if(B.drop<.32)return 0;
  const pin=(x,z)=>{let hit=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
  for(const j of[0,1,2,3,4,5,6,7].sort((a,b)=>B.mid[a]-B.mid[b]).slice(0,3)){const nu=(j+1)*Math.PI/4-B.rot,F=frame(c[0],0,c[1],Math.atan2(Math.cos(nu),Math.sin(nu))),
      G=(x,z)=>{const q=F.p(x,0,z);return gy(q[0],q[2]);};   // local +z: out through the middle of face j
    if(B.y-G(0,FOUNT_CAP)<.32)continue;let n=0,h=0;
    for(let k=1;k<=16;k++){const d=FOUNT_CAP+k*t,hh=(B.y-Math.min(G(-hw,d),G(0,d),G(hw,d)))/(k+1);if(hh<=.27){n=k;h=hh;break;}}
    if(!n)continue;const L=FOUNT_CAP+n*t+.05;if(![[-hw,FOUNT_CAP],[hw,FOUNT_CAP],[hw,L],[-hw,L],[0,L]].every(([x,z])=>{const q=F.p(x,0,z);return pin(q[0],q[2]);}))continue;
    g.set(48,.55);
    for(let k=1;k<=n;k++){const z0=k===1?FOUNT_DRUM-.4:FOUNT_CAP+(k-1)*t,z1=FOUNT_CAP+k*t,yt=B.y-k*h,yb=Math.min(G(-hw,z0),G(hw,z0),G(-hw,z1),G(hw,z1))-.3;
      if(yt>yb)box(g,F,0,yb,(z0+z1)/2,hw,yt-yb,(z1-z0)/2,27);}   // no face toward the podium: the step above or the podium hides it
    return n;}
  return 0;}
function facePlace(W,g,P,f,R,kind){const c=pCen(P),y=W.gy(...c);if(lotHits(W,P,.5,'road')){faceStat(W,'blocked',P);return 0;}   // something already stands on it (a monument, an earlier house)
  const a=P[f.iL],b=P[(f.iL+1)%P.length],rot=Math.atan2(-(b[1]-a[1]),b[0]-a[0]),mid=lp(a,b,.5);   // the longest side: the road the piece fronts
  const dice=()=>{const r0=R();for(let k=f.kind==='F1'?+(r0<.4):f.kind==='F2'?1:kind==='dense'||r0<.5?0:2*P.length;k>0;k--)R();};
  {const h=houseGround(W,P,2);if(h&&(h.max-h.min)/Math.sqrt(f.A)>FACE_CLIFF){   // a piece on a cliff (2026-11-05): no paving down the rock face and nothing on it
    const o=lotOBB(P),fo=W.foot.add(o.cx,o.cz,o.hw,o.hd,o.rot,'open');fo.poly=P;fo.siteRole='face-cliff';dice();
    if(f.kind==='F4'&&(kind==='dense'||RNG(hash2(Math.round(c[0])+FACE_SALT,Math.round(c[1]))*4294967296)()<.5))W.foot.add(c[0],c[1],5.2,5.2,0);   // the fountain's ground, kept as before
    faceStat(W,'cliff',P);return 0;}}   // still reserved, R drawn as before: no house moves
  facePave(W,g,P,'face-'+f.kind);faceStat(W,f.kind,P);const e=W.faceLog[W.faceLog.length-1];dice();
  const Rf=RNG(hash2(Math.round(c[0])+FACE_SALT,Math.round(c[1]))*4294967296),r=Rf();
  if(f.kind==='F1'){if(r<.4){e.what='tree';W.trees.push([c[0],y,c[1],'plane',1.3+Rf()*.4]);const q=lp(c,mid,.45);faceAltar(g,q[0],W.gy(...q),q[1],rot);}
    else{e.what=r<.7?'compitum':'lacus';romePlace('rome_'+e.what,c[0],y,c[1],rot+Math.PI,{inst:true});}}
  else if(f.kind==='F2'){const q=lp(c,mid,.25);
    if(r<.55&&f.rho>4.5){e.what='temple';temple(W,g,{x:q[0],y:W.gy(...q),z:q[1],rot:rot,W:6,L:8.5,podH:1.3,colH:4.6,nf:4,rows:1,seed:Rf(),sculpt:false,pave:false});}   // a little tetrastyle shrine, its front to the road
    else{e.what='tree';W.trees.push([q[0],W.gy(...q),q[1],'plane',1.5+Rf()*.4]);faceAltar(g,lp(q,mid,.4)[0],W.gy(...q),lp(q,mid,.4)[1],rot);}
    const s=P.reduce((m,p,i)=>f.ang[i]<f.ang[m]?i:m,0),tip=lp(P[s],c,.35);romePlace('rome_lacus',tip[0],W.gy(...tip),tip[1],rot,{inst:true});}   // a basin in the sharp end, never a house
  else{const fB=kind==='dense'||r<.5?faceFountainBase(W,c,rot):null;
    if(fB&&fB.drop<=FOUNT_DROP){e.what='fountain';romePlace('rome_tholos_fountain',c[0],fB.y,c[1],rot,{});W.foot.add(c[0],c[1],5.2,5.2,0);   // a fountain in the middle, level
      if(fB.drop>.08){faceFountainDrum(W,g,c,fB);e.drum=+fB.drop.toFixed(2);e.steps=faceFountainStair(W,g,c,fB,P);}}   // on its podium where the ground falls away
    else{e.what='garden';if(fB){e.steep=+fB.drop.toFixed(1);W.foot.add(c[0],c[1],5.2,5.2,0);}const I=faceInterior(P,.55);g.set(23,.42);faceDrape(W,g,I,.16);   // or a small garden: grass, trees, benches
      for(let k=0;k<I.length;k++){const t=lp(I[k],c,.35);W.trees.push([t[0],W.gy(...t),t[1],Rf()<.5?'broad':'cyp',.8+Rf()*.3]);}g.set(2,.5);
      for(let k=0;k<2;k++){const t=lp(P[k],c,.5),F=frame(t[0],W.gy(...t),t[1],rot),yb=Math.min(0,...[[-1.1,-.3],[1.1,-.3],[1.1,.3],[-1.1,.3]].map(([x,z])=>{const q=F.p(x,0,z);return W.gy(q[0],q[2])-F.oy;}));
        box(g,F,0,yb,0,1.1,.45-yb,.3,31);}}}   // a bench on a slope reaches down to the ground at its low end; its seat stays where it was
  return 1;}
// F3: a block cut by a diagonal lane, both triangles one square: the lane in grey stone, a basin at its middle, a cypress in each sharp corner
function faceDoubleTriangle(W,g,B,diag,R){const i0=diag?0:1,A=B[i0],C=B[i0+2],c=lp(A,C,.5),h=houseGround(W,B);if(!h||h.max-h.min>2.5)return false;
  if(W.foot.hits(...lotOBBArgs(B)))return false;
  facePave(W,g,B,'face-F3');faceStat(W,'F3',B);W.faceLog[W.faceLog.length-1].what='lane';
  const dx=C[0]-A[0],dz=C[1]-A[1],l=Math.hypot(dx,dz),F=frame(c[0],0,c[1],Math.atan2(-dz,dx));g.set(33,.4);
  faceDrape(W,g,[F.p(-l/2,0,-1.3),F.p(l/2,0,-1.3),F.p(l/2,0,1.3),F.p(-l/2,0,1.3)].map(p=>[p[0],p[2]]),.14);   // the lane
  romePlace('rome_lacus',c[0],W.gy(...c),c[1],F.rot,{inst:true});
  for(const p of[A,C]){const q=lp(p,c,.12);W.trees.push([q[0],W.gy(...q),q[1],'cyp',.95+R()*.2]);}return true;}
const lotOBBArgs=P=>{const o=lotOBB(P);return[o.cx,o.cz,o.hw+1,o.hd+1,o.rot,0];};

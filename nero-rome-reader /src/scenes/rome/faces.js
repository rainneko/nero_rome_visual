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
function faceStat(W,k,P){const S=W.faceStats||(W.faceStats={});S[k]=(S[k]||0)+1;if(P)(W.faceLog||(W.faceLog=[])).push({kind:k,c:pCen(P).map(Math.round),area:Math.round(Math.abs(pArea(P)))});}
// the block cut by the widest main road strip that crosses it: the pieces on either side of the road's reserved corridor, or null
function faceRoadCut(W,B){const ob=lotOBB(B),r=Math.hypot(ob.hw,ob.hd);let best=null;
  for(const[w,P]of W.roadList||[]){const half=w/2+(w>=7?2.6:1.2);for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];if(segD(ob.cx,ob.cz,a[0],a[1],b[0],b[1])>r+half)continue;
      const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<1)continue;const tx=dx/l,tz=dz/l,nx=-tz,nz=tx,c=a[0]*nx+a[1]*nz,t0=a[0]*tx+a[1]*tz;
      const sd=B.map(p=>p[0]*nx+p[1]*nz-c),st=B.map(p=>p[0]*tx+p[1]*tz-t0),mn=Math.min(...sd),mx=Math.max(...sd);
      if(mn>half||mx<-half||Math.max(...st)<-2||Math.min(...st)>l+2)continue;const cover=Math.min(mx,half)-Math.max(mn,-half);if(!best||cover>best.cover)best={nx,nz,c,half,cover};}}
  if(!best)return null;const h=best.half+1;return[clipHalf(B,best.nx,best.nz,best.c+h,1),clipHalf(B,best.nx,best.nz,best.c-h,-1)].filter(p=>p&&Math.abs(pArea(p))>20);}   // 1 m beyond the corridor: the houses' eaves margin
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
function facePlace(W,g,P,f,R,kind){const c=pCen(P),y=W.gy(...c);if(lotHits(W,P,.5,'road')){faceStat(W,'blocked');return 0;}   // something already stands on it (a monument, an earlier house)
  const a=P[f.iL],b=P[(f.iL+1)%P.length],rot=Math.atan2(-(b[1]-a[1]),b[0]-a[0]),mid=lp(a,b,.5);   // the longest side: the road the piece fronts
  facePave(W,g,P,'face-'+f.kind);faceStat(W,f.kind,P);const e=W.faceLog[W.faceLog.length-1];
  const r0=R();for(let k=f.kind==='F1'?+(r0<.4):f.kind==='F2'?1:kind==='dense'||r0<.5?0:2*P.length;k>0;k--)R();
  const Rf=RNG(hash2(Math.round(c[0])+FACE_SALT,Math.round(c[1]))*4294967296),r=Rf();
  if(f.kind==='F1'){if(r<.4){e.what='tree';W.trees.push([c[0],y,c[1],'plane',1.3+Rf()*.4]);const q=lp(c,mid,.45);faceAltar(g,q[0],W.gy(...q),q[1],rot);}
    else{e.what=r<.7?'compitum':'lacus';romePlace('rome_'+e.what,c[0],y,c[1],rot+Math.PI,{inst:true});}}
  else if(f.kind==='F2'){const q=lp(c,mid,.25);
    if(r<.55&&f.rho>4.5){e.what='temple';temple(W,g,{x:q[0],y:W.gy(...q),z:q[1],rot:rot,W:6,L:8.5,podH:1.3,colH:4.6,nf:4,rows:1,seed:Rf(),sculpt:false,pave:false});}   // a little tetrastyle shrine, its front to the road
    else{e.what='tree';W.trees.push([q[0],W.gy(...q),q[1],'plane',1.5+Rf()*.4]);faceAltar(g,lp(q,mid,.4)[0],W.gy(...q),lp(q,mid,.4)[1],rot);}
    const s=P.reduce((m,p,i)=>f.ang[i]<f.ang[m]?i:m,0),tip=lp(P[s],c,.35);romePlace('rome_lacus',tip[0],W.gy(...tip),tip[1],rot,{inst:true});}   // a basin in the sharp end, never a house
  else{if(kind==='dense'||r<.5){e.what='fountain';romePlace('rome_tholos_fountain',c[0],y,c[1],rot,{});W.foot.add(c[0],c[1],5.2,5.2,0);}   // a fountain in the middle
    else{e.what='garden';const I=faceInterior(P,.55);g.set(23,.42);faceDrape(W,g,I,.16);   // or a small garden: grass, trees, benches
      for(let k=0;k<I.length;k++){const t=lp(I[k],c,.35);W.trees.push([t[0],W.gy(...t),t[1],Rf()<.5?'broad':'cyp',.8+Rf()*.3]);}g.set(2,.5);for(let k=0;k<2;k++){const t=lp(P[k],c,.5);box(g,frame(t[0],W.gy(...t),t[1],rot),0,0,0,1.1,.45,.3,31);}}}
  return 1;}
// F3: a block cut by a diagonal lane, both triangles one square: the lane in grey stone, a basin at its middle, a cypress in each sharp corner
function faceDoubleTriangle(W,g,B,diag,R){const i0=diag?0:1,A=B[i0],C=B[i0+2],c=lp(A,C,.5),h=houseGround(W,B);if(!h||h.max-h.min>2.5)return false;
  if(W.foot.hits(...lotOBBArgs(B)))return false;
  facePave(W,g,B,'face-F3');faceStat(W,'F3',B);
  const dx=C[0]-A[0],dz=C[1]-A[1],l=Math.hypot(dx,dz),F=frame(c[0],0,c[1],Math.atan2(-dz,dx));g.set(33,.4);
  faceDrape(W,g,[F.p(-l/2,0,-1.3),F.p(l/2,0,-1.3),F.p(l/2,0,1.3),F.p(-l/2,0,1.3)].map(p=>[p[0],p[2]]),.14);   // the lane
  romePlace('rome_lacus',c[0],W.gy(...c),c[1],F.rot,{inst:true});
  for(const p of[A,C]){const q=lp(p,c,.12);W.trees.push([q[0],W.gy(...q),q[1],'cyp',.95+R()*.2]);}return true;}
const lotOBBArgs=P=>{const o=lotOBB(P);return[o.cx,o.cz,o.hw+1,o.hd+1,o.rot,0];};

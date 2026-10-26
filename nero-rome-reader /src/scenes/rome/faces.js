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
// a polygon draped over the ground in triangles about `step` metres across (a fan of whole triangles let the terrain show through on slopes)
function faceDrape(W,g,P,lift,step=4){const c=pCen(P),y=(x,z)=>W.gy(x,z)+lift;
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],n=Math.max(1,Math.ceil(Math.max(Math.hypot(a[0]-c[0],a[1]-c[1]),Math.hypot(b[0]-c[0],b[1]-c[1]),Math.hypot(b[0]-a[0],b[1]-a[1]))/step)),
      Q=(u,v)=>{const x=c[0]+(a[0]-c[0])*u+(b[0]-c[0])*v,z=c[1]+(a[1]-c[1])*u+(b[1]-c[1])*v;return[x,y(x,z),z];};
    for(let r=0;r<n;r++)for(let k=0;k<n-r;k++){const u0=r/n,v0=k/n,d=1/n;g.poly([Q(u0,v0),Q(u0+d,v0),Q(u0,v0+d)],[0,1,0]);if(k<n-r-1)g.poly([Q(u0+d,v0),Q(u0+d,v0+d),Q(u0,v0+d)],[0,1,0]);}}}
// paving that follows the ground (the warm slabs of squares, palette 11), the piece reserved as open ground so no house or street paint lands on it
function facePave(W,g,P,role){g.set(11,.42);faceDrape(W,g,P,.1);
  const o=lotOBB(P),f=W.foot.add(o.cx,o.cz,o.hw,o.hd,o.rot,'open');f.poly=P;f.siteRole=role;return f;}
const faceAltar=(g,x,y,z,rot)=>{const F=frame(x,y,z,rot);g.set(6,.5);box(g,F,0,0,0,.7,1,.5,31);g.set(2,.55);box(g,F,0,1,0,.85,.15,.65,31);};
const faceInterior=(P,k)=>{const c=pCen(P);return P.map(p=>lp(p,c,k));};
// a piece the road network left (F1, F2, F4): pave it and put the one thing it is for; R picks among the choices, kind is the zone type
function facePlace(W,g,P,f,R,kind){const c=pCen(P),y=W.gy(...c);if(lotHits(W,P,.5,'road')){faceStat(W,'blocked');return 0;}   // something already stands on it (a monument, an earlier house)
  const a=P[f.iL],b=P[(f.iL+1)%P.length],rot=Math.atan2(-(b[1]-a[1]),b[0]-a[0]),mid=lp(a,b,.5);   // the longest side: the road the piece fronts
  facePave(W,g,P,'face-'+f.kind);faceStat(W,f.kind,P);const r=R();
  if(f.kind==='F1'){if(r<.4){W.trees.push([c[0],y,c[1],'plane',1.3+R()*.4]);const q=lp(c,mid,.45);faceAltar(g,q[0],W.gy(...q),q[1],rot);}
    else romePlace(r<.7?'rome_compitum':'rome_lacus',c[0],y,c[1],rot+Math.PI,{inst:true});}
  else if(f.kind==='F2'){const q=lp(c,mid,.25);
    if(r<.55&&f.rho>4.5)temple(W,g,{x:q[0],y:W.gy(...q),z:q[1],rot:rot,W:6,L:8.5,podH:1.3,colH:4.6,nf:4,rows:1,seed:R(),sculpt:false,pave:false});   // a little tetrastyle shrine, its front to the road
    else{W.trees.push([q[0],W.gy(...q),q[1],'plane',1.5+R()*.4]);faceAltar(g,lp(q,mid,.4)[0],W.gy(...q),lp(q,mid,.4)[1],rot);}
    const s=P.reduce((m,p,i)=>f.ang[i]<f.ang[m]?i:m,0),tip=lp(P[s],c,.35);romePlace('rome_lacus',tip[0],W.gy(...tip),tip[1],rot,{inst:true});}   // a basin in the sharp end, never a house
  else{if(kind==='dense'||r<.5){romePlace('rome_tholos_fountain',c[0],y,c[1],rot,{});W.foot.add(c[0],c[1],5.2,5.2,0);}   // a fountain in the middle
    else{const I=faceInterior(P,.55);g.set(23,.42);faceDrape(W,g,I,.16);   // or a small garden: grass, trees, benches
      for(let k=0;k<I.length;k++){const t=lp(I[k],c,.35);W.trees.push([t[0],W.gy(...t),t[1],R()<.5?'broad':'cyp',.8+R()*.3]);}g.set(2,.5);for(let k=0;k<2;k++){const t=lp(P[k],c,.5);box(g,frame(t[0],W.gy(...t),t[1],rot),0,0,0,1.1,.45,.3,31);}}}
  return 1;}
// F3: a block cut by a diagonal lane, both triangles one square: the lane in grey stone, a basin at its middle, a cypress in each sharp corner
function faceDoubleTriangle(W,g,B,diag,R){const i0=diag?0:1,A=B[i0],C=B[i0+2],c=lp(A,C,.5),h=houseGround(W,B);if(!h||h.max-h.min>2.5)return false;
  if(W.foot.hits(...lotOBBArgs(B)))return false;
  facePave(W,g,B,'face-F3');faceStat(W,'F3',B);
  const dx=C[0]-A[0],dz=C[1]-A[1],l=Math.hypot(dx,dz),F=frame(c[0],0,c[1],Math.atan2(-dz,dx));g.set(33,.4);
  for(let k=0;k<12;k++){const t0=-l/2+l*k/12,t1=t0+l/12;g.poly([F.p(t0,0,-1.3),F.p(t1,0,-1.3),F.p(t1,0,1.3),F.p(t0,0,1.3)].map(p=>[p[0],W.gy(p[0],p[2])+.14,p[2]]),[0,1,0]);}   // the lane
  romePlace('rome_lacus',c[0],W.gy(...c),c[1],F.rot,{inst:true});
  for(const p of[A,C]){const q=lp(p,c,.12);W.trees.push([q[0],W.gy(...q),q[1],'cyp',.95+R()*.2]);}return true;}
const lotOBBArgs=P=>{const o=lotOBB(P);return[o.cx,o.cz,o.hw+1,o.hd+1,o.rot,0];};

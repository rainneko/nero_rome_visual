/* ---------- world base ---------- */
const VEX=1.45,DATUM=8;
class Foot{constructor(cell=64){this.cell=cell;this.map=new Map();this.list=[];}   // list: every footprint (the street raster reads it); tag 'road' = a road corridor, 'open' = reserved open land, .t = temple
  key(i,j){return i*92821+j*68917;}
  add(cx,cz,hw,hd,rot=0,tag){const o={cx,cz,hw,hd,c:Math.cos(rot),s:Math.sin(rot),r:Math.hypot(hw,hd),tag},cs=this.cell;this.list.push(o);
    for(let i=Math.floor((cx-o.r)/cs);i<=Math.floor((cx+o.r)/cs);i++)for(let j=Math.floor((cz-o.r)/cs);j<=Math.floor((cz+o.r)/cs);j++){const k=this.key(i,j);let a=this.map.get(k);if(!a){a=[];this.map.set(k,a);}a.push(o);}return o;}
  addCircle(cx,cz,r,tag){const o=this.add(cx,cz,r,r,0,tag);o.circ=true;return o;}
  hits(cx,cz,hw,hd,rot,m=0,skip){const q={cx,cz,hw:hw+m,hd:hd+m,c:Math.cos(rot),s:Math.sin(rot),r:Math.hypot(hw,hd)+m},cs=this.cell;   // m defaults to 0 (an undefined m made the search radius NaN: every query answered 'free'); skip: a tag to ignore
    for(let i=Math.floor((cx-q.r)/cs);i<=Math.floor((cx+q.r)/cs);i++)for(let j=Math.floor((cz-q.r)/cs);j<=Math.floor((cz+q.r)/cs);j++){const a=this.map.get(this.key(i,j));if(!a)continue;
      for(const o of a){if(skip&&o.tag===skip)continue;const dx=o.cx-cx,dz=o.cz-cz;if(dx*dx+dz*dz>(o.r+q.r)**2)continue;if(obb(o,q))return true;}}return false;}}
function obb(a,b){const ax=[[a.c,-a.s],[a.s,a.c],[b.c,-b.s],[b.s,b.c]],dx=b.cx-a.cx,dz=b.cz-a.cz;
  for(const[nx,nz]of ax){const ra=a.hw*Math.abs(a.c*nx-a.s*nz)+a.hd*Math.abs(a.s*nx+a.c*nz),rb=b.hw*Math.abs(b.c*nx-b.s*nz)+b.hd*Math.abs(b.s*nx+b.c*nz);
    if(Math.abs(dx*nx+dz*nz)>ra+rb)return false;}return true;}
function makeWorld(name){return{name,scene:new THREE.Scene(),foot:new Foot(),cols:{cor:[],ion:[],dor:[],simple:[]},trees:[],people:[],layers:{},pois:[],views:{},anim:[],grid:null};}
function polyDist(px,pz,pts){let best=1e9,bt=0;for(let i=0;i<pts.length-1;i++){const[ax,az]=pts[i],[bx,bz]=pts[i+1];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
  let t=l2?((px-ax)*dx+(pz-az)*dz)/l2:0;t=clamp(t,0,1);const qx=ax+dx*t-px,qz=az+dz*t-pz,d=qx*qx+qz*qz;if(d<best){best=d;bt=i+t;}}return[Math.sqrt(best),bt];}
function polyAt(pts,t){const i=Math.min(pts.length-2,Math.floor(t)),f=t-i;const a=pts[i],b=pts[i+1];return[lerp(a[0],b[0],f),lerp(a[1],b[1],f),Math.atan2(b[0]-a[0],b[1]-a[1])];}
// heightfield grid
function buildGrid(W,ext,n,hfn){const g={x0:ext[0],z0:ext[1],x1:ext[2],z1:ext[3],n,h:new Float32Array((n+1)*(n+1))};g.dx=(g.x1-g.x0)/n;g.dz=(g.z1-g.z0)/n;
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++)g.h[j*(n+1)+i]=hfn(g.x0+i*g.dx,g.z0+j*g.dz);W.grid=g;
  W.gy=(x,z)=>{const fx=clamp((x-g.x0)/g.dx,0,n-1e-3),fz=clamp((z-g.z0)/g.dz,0,n-1e-3),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,N=n+1;
    const a=g.h[j*N+i],b=g.h[j*N+i+1],c=g.h[(j+1)*N+i],d=g.h[(j+1)*N+i+1];return(u+v<=1)?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);};}
/* finer terrain patch (sub x sub vertices per coarse cell) over a block of whole coarse cells; the coarse mesh gets a hole there.
   The rim follows the coarse grid lines and uses their linear heights (no cracks); inside, heights fade to the exact function. */
function terrainPatchSpec(W,rect,sub){const g=W.grid,n=g.n,i0=Math.max(0,Math.ceil((rect[0]-g.x0)/g.dx)),i1=Math.min(n,Math.floor((rect[2]-g.x0)/g.dx)),j0=Math.max(0,Math.ceil((rect[1]-g.z0)/g.dz)),j1=Math.min(n,Math.floor((rect[3]-g.z0)/g.dz));return{i0,i1,j0,j1,sub};}
function buildPatch(W,sp,hfn,zoneFn){const g=W.grid,{i0,i1,j0,j1,sub}=sp,nx=(i1-i0)*sub,nz=(j1-j0)*sub,NX=nx+1,NZ=nz+1,dx=g.dx/sub,dz=g.dz/sub,x0=g.x0+i0*g.dx,z0=g.z0+j0*g.dz,H=new Float32Array(NX*NZ),gy0=W.gy;
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=x0+i*dx,z=z0+j*dz,hc=gy0(x,z),ed=Math.min(i,nx-i,j,nz-j)/sub,w=sstep(0,1.6,ed);H[j*NX+i]=w>0?lerp(hc,hfn(x,z),w):hc;}
  for(let it=0;it<3;it++){const B=H.slice();for(let j=2;j<NZ-2;j++)for(let i=2;i<NX-2;i++){const k=j*NX+i;let s=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)s+=H[k+b*NX+a];B[k]=lerp(H[k],s/9,sstep(0,1,Math.min(i,j,NX-1-i,NZ-1-j)/(2*sub)));}H.set(B);}   // smooth the interior: the exact height function has steps (min/blend terms), the patch must not zigzag
  const P=new Float32Array(NX*NZ*3),Z=new Float32Array(NX*NZ*4);
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i,x=x0+i*dx,z=z0+j*dz;P[k*3]=x;P[k*3+1]=H[k];P[k*3+2]=z;Z.set(zoneFn(x,z,H[k]),k*4);}
  const I=new Uint32Array(nx*nz*6);let q=0;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*NX+i,b=a+1,c=a+NX,d=c+1;I[q++]=a;I[q++]=c;I[q++]=b;I[q++]=b;I[q++]=c;I[q++]=d;}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('aZ',new THREE.BufferAttribute(Z,4));G.setIndex(new THREE.BufferAttribute(I,1));G.computeVertexNormals();
  const m=new THREE.Mesh(G,MAT.terrain);m.receiveShadow=true;m.castShadow=false;W.scene.add(m);
  const pt=W.patch={x0,z0,dx,dz,nx,nz,h:H,x1:x0+nx*dx,z1:z0+nz*dz};
  W.gy=(x,z)=>{const p=pt;if(x<p.x0||x>=p.x1||z<p.z0||z>=p.z1)return gy0(x,z);const fx=(x-p.x0)/p.dx,fz=(z-p.z0)/p.dz,i=Math.min(p.nx-1,Math.floor(fx)),j=Math.min(p.nz-1,Math.floor(fz)),u=fx-i,v=fz-j,N=p.nx+1,a=p.h[j*N+i],b=p.h[j*N+i+1],c=p.h[(j+1)*N+i],d=p.h[(j+1)*N+i+1];return(u+v<=1)?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);};}
function terrainMesh(W,zoneFn,far,patch){const g=W.grid,n=g.n,N=n+1,P=new Float32Array(N*N*3),Z=new Float32Array(N*N*4);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=g.x0+i*g.dx,z=g.z0+j*g.dz;P[k*3]=x;P[k*3+1]=g.h[k];P[k*3+2]=z;const zz=zoneFn(x,z,g.h[k]);Z.set(zz,k*4);}
  const pl=!patch?[]:Array.isArray(patch)?patch:[patch],sps=pl.map(p=>terrainPatchSpec(W,p.rect,p.sub||4)),I=new Uint32Array(n*n*6);let q=0;for(let j=0;j<n;j++)for(let i=0;i<n;i++){if(sps.some(sp=>i>=sp.i0&&i<sp.i1&&j>=sp.j0&&j<sp.j1))continue;const a=j*N+i,b=a+1,c=a+N,d=c+1;I[q++]=a;I[q++]=c;I[q++]=b;I[q++]=b;I[q++]=c;I[q++]=d;}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('aZ',new THREE.BufferAttribute(Z,4));G.setIndex(new THREE.BufferAttribute(I.slice(0,q),1));G.computeVertexNormals();
  const m=new THREE.Mesh(G,MAT.terrain);m.receiveShadow=true;m.castShadow=false;W.scene.add(m);W.terrainGeo=G;W.patchRects=pl.map(p=>p.rect);pl.forEach((p,i)=>buildPatch(W,sps[i],p.hfn,zoneFn));   // gradeRoads moves coarse vertices later and leaves the patches alone
  if(far){const F=new THREE.PlaneGeometry(120000,120000,140,140);F.rotateX(-Math.PI/2);const p=F.attributes.position,FZ=new Float32Array(p.count*4);
    for(let i=0;i<p.count;i++){const x=p.getX(i)+W.farC[0],z=p.getZ(i)+W.farC[1];p.setX(i,x);p.setZ(i,z);const inside=x>g.x0+60&&x<g.x1-60&&z>g.z0+60&&z<g.z1-60;
      p.setY(i,inside?far(x,z)-40:far(x,z)-1);FZ.set([0,0,.8*sstep(5000,9000,Math.hypot(x-W.farC[0],z-W.farC[1]))*(1-sstep(30000,45000,Math.hypot(x,z))),0],i*4);}
    F.setAttribute('aZ',new THREE.BufferAttribute(FZ,4));F.computeVertexNormals();const fm=new THREE.Mesh(F,MAT.terrain);fm.receiveShadow=false;W.scene.add(fm);}}
function riverMesh(W,pts,half,y,mat){const P=[],I=[];let k=0;
  for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz);tx/=l;tz/=l;
    const hw=typeof half==='function'?half(i):half;P.push(pts[i][0]-tz*hw,y,pts[i][1]+tx*hw,pts[i][0]+tz*hw,y,pts[i][1]-tx*hw);
    if(i>0){I.push(k-2,k,k-1,k-1,k,k+1);}k+=2;}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setIndex(I);G.computeVertexNormals();
  const nn=G.attributes.normal;for(let i=0;i<nn.count;i++)nn.setXYZ(i,0,1,0);const m=new THREE.Mesh(G,mat);m.receiveShadow=true;W.scene.add(m);return m;}
function densify(pts,step){const out=[];for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]];const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
  for(let k=0;k<n;k++)out.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)]);}out.push(pts[pts.length-1]);return out;}
/* main roads: only their corridors are reserved here (no buildings, no trees); the surface, grade and kerbs come from the street raster (streets.js) */
function roads(W,list,g){W.roadList=list;for(const[w,pts]of list){
  // Continuous segment reservations: spaced circles left gaps into which houses could grow.
  const half=w/2+(w>=7?2.6:1.2);
  const dense=densify(pts,6),allowed=()=>true;   // the corridor is reserved on any slope: a steep stretch is still the road (spec H1), never a building plot
  for(let i=1;i<dense.length;i++){const a=dense[i-1],b=dense[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(!len||!allowed(a)||!allowed([(a[0]+b[0])/2,(a[1]+b[1])/2])||!allowed(b))continue;
    W.foot.add((a[0]+b[0])/2,(a[1]+b[1])/2,len/2,half,Math.atan2(-dz,dx),'road');W.foot.addCircle(a[0],a[1],half,'road');}
  if(dense.length&&allowed(dense[dense.length-1]))W.foot.addCircle(dense[dense.length-1][0],dense[dense.length-1][1],half,'road');
}}

/* Road beds (spec 4.3): each main road gets a longitudinal profile, the mean of the tightest upper and lower envelopes of the ground at grade o.lim, kept
   within o.cap of the ground. Coarse terrain vertices inside the bed (half width + 2.5 m) take the profile height; outside it they blend back over a bank
   about as wide as the cut or fill (3-12 m). Left alone: vertices of the finer patches, those where o.keep(x,z) (the river banks and bridgeheads) and those
   within 3 m of anything already in W.foot, so monuments placed before the roads keep their ground. Returns the number of vertices moved. */
function gradeRoads(W,list,o){const g=W.grid,n=g.n,N=n+1,tgt=new Float32Array(N*N),wt=new Float32Array(N*N),lim=o.lim||.15,cap=o.cap||4;
  for(const[w,pts]of list){const D=densify(pts,4),m=D.length,G=D.map(p=>W.gy(p[0],p[1])),U=G.slice(),L=G.slice(),hw=w/2+2.5,reach=hw+14,sp=i=>Math.hypot(D[i][0]-D[i-1][0],D[i][1]-D[i-1][1]);
    for(let i=1;i<m;i++){U[i]=Math.max(U[i],U[i-1]-lim*sp(i));L[i]=Math.min(L[i],L[i-1]+lim*sp(i));}
    for(let i=m-2;i>=0;i--){U[i]=Math.max(U[i],U[i+1]-lim*sp(i+1));L[i]=Math.min(L[i],L[i+1]+lim*sp(i+1));}
    const P=G.map((h,i)=>clamp((U[i]+L[i])/2,h-cap,h+cap));
    for(let i=0;i<m-1;i++){const a=D[i],b=D[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,
        i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-reach-g.x0)/g.dx)),i1=Math.min(n,Math.ceil((Math.max(a[0],b[0])+reach-g.x0)/g.dx)),j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-reach-g.z0)/g.dz)),j1=Math.min(n,Math.ceil((Math.max(a[1],b[1])+reach-g.z0)/g.dz));
      for(let jj=j0;jj<=j1;jj++)for(let ii=i0;ii<=i1;ii++){const x=g.x0+ii*g.dx,z=g.z0+jj*g.dz,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),d=Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z);if(d>reach)continue;
        const k=jj*N+ii,y=lerp(P[i],P[i+1],t),bank=clamp(Math.abs(y-g.h[k])*1.2,3,12),wv=d<=hw?1:1-sstep(hw,hw+bank,d);if(wv>wt[k]){wt[k]=wv;tgt[k]=y;}}}}
  const inPatch=(x,z)=>(W.patchRects||[]).some(r=>x>=r[0]-g.dx&&x<=r[2]+g.dx&&z>=r[1]-g.dz&&z<=r[3]+g.dz),moved=[];
  for(let k=0;k<N*N;k++){if(wt[k]<=0)continue;const ii=k%N,jj=(k-ii)/N,x=g.x0+ii*g.dx,z=g.z0+jj*g.dz;if(inPatch(x,z)||(o.keep&&o.keep(x,z))||roadFoot(W,x,z,3,true))continue;
    const h=lerp(g.h[k],tgt[k],wt[k]);if(Math.abs(h-g.h[k])<.05)continue;g.h[k]=h;moved.push(k);}
  const G=W.terrainGeo;if(G&&moved.length){const p=G.attributes.position;for(const k of moved)p.setY(k,g.h[k]);p.needsUpdate=true;G.computeVertexNormals();}
  return moved.length;}

/* Uphill stretches (author, 2026-10-26: "没有那么宽的上山道路"): where a graded main road climbs more than o.enter over a 2*o.win m window it is an
   ordinary street, o.w m wide (no kerbs, no ruts), until the grade falls below o.exit. Climbs shorter than o.min are left wide, unless they pass 28 %
   over 6 m (a flight of roadStairs goes there: it is a street with 6 m of street before and after it); flat gaps shorter than o.gap are joined. Each road is cut into pieces; a narrowed piece carries {hill:true,w0} as a third entry, so the street raster can pave it by
   district (marble, stone or earth). Run after gradeRoads (it reads the graded bed) and before roads() (the narrow pieces reserve a narrow corridor). */
function roadHillSplit(W,list,o){const out=[],HW=o.w||5,st={pieces:0,metres:0};
  for(const R of list){const[w,P]=R;if(w<=HW+.5){out.push(R);continue;}
    const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=cum[cum.length-1];
    const at=s=>{let i=1;while(i<P.length-1&&cum[i]<s)i++;const t=clamp((s-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]),0,1);return[lerp(P[i-1][0],P[i][0],t),lerp(P[i-1][1],P[i][1],t)];};
    const n=Math.max(1,Math.ceil(L/3)),S=[],Y=[];for(let k=0;k<=n;k++){const p=at(L*k/n);S.push(L*k/n);Y.push(W.gy(p[0],p[1]));}
    const grade=r=>S.map((s,i)=>{let a=i,b=i;while(a>0&&s-S[a-1]<=r)a--;while(b<n&&S[b+1]-s<=r)b++;return Math.abs(Y[b]-Y[a])/Math.max(1,S[b]-S[a]);}),gr=grade(o.win||15),loc=grade(3);
    let on=false,runs=[];for(let i=0;i<=n;i++){const was=on,stp=loc[i]>.28;on=stp||(on?gr[i]>o.exit:gr[i]>o.enter);if(on&&!was)runs.push([S[i],S[i],false]);if(on){const r=runs[runs.length-1];r[1]=S[i];r[2]=r[2]||stp;}}
    for(const r of runs)if(r[2]){r[0]=Math.max(0,r[0]-6);r[1]=Math.min(L,r[1]+6);}
    const M=[];for(const r of runs){const q=M[M.length-1];if(q&&r[0]-q[1]<o.gap){q[1]=Math.max(q[1],r[1]);q[2]=q[2]||r[2];}else M.push(r);}
    runs=M.filter(r=>r[2]||r[1]-r[0]>=o.min);if(runs.length){if(runs[0][0]<o.gap)runs[0][0]=0;if(L-runs[runs.length-1][1]<o.gap)runs[runs.length-1][1]=L;}
    const piece=(a,b,ww,hill)=>{if(b-a<1)return;const pts=[at(a)];for(let i=1;i<P.length-1;i++)if(cum[i]>a+.5&&cum[i]<b-.5)pts.push(P[i].slice());pts.push(at(b));out.push(hill?[ww,pts,{hill:true,w0:w}]:[ww,pts]);};
    let s0=0;for(const[a,b]of runs){piece(s0,a,w,false);piece(a,b,HW,true);st.pieces++;st.metres+=b-a;s0=b;}piece(s0,L,w,false);}
  st.metres=Math.round(st.metres);W.roadHill=st;return out;}

/* ---------- city fabric ---------- */
function genCity(W,o){const R=RNG(o.seed||7),chunks=new Map(),cs=o.chunk||700;let n=0;
  const G=(x,z)=>{const k=Math.floor(x/cs)+'_'+Math.floor(z/cs);let g=chunks.get(k);if(!g){g=new GB(1<<14);chunks.set(k,g);}return g;};
  for(let gz=o.ext[1];gz<o.ext[3];gz+=o.sp)for(let gx=o.ext[0];gx<o.ext[2];gx+=o.sp){
    const x=gx+(R()-.5)*o.sp*.95,z=gz+(R()-.5)*o.sp*.95,Z=o.zone(x,z);if(!Z||R()>Z.d*Q.dens)continue;
    const r=R();let typ='insula';{let acc=0;for(const k in Z.mix){acc+=Z.mix[k];if(r<acc){typ=k;break;}}}
    let w,d,nSt;
    if(typ==='insula'){w=13+R()*12;d=11+R()*9;nSt=Z.st[0]+Math.floor(R()*(Z.st[1]-Z.st[0]+1));}
    else if(typ==='hut'){w=6+R()*4;d=6+R()*4;nSt=1;}
    else if(typ==='slum'){w=9+R()*7;d=10+R()*7;nSt=5+Math.floor(R()*3);}
    else if(typ==='domus'){w=36+R()*20;d=32+R()*18;nSt=1+(R()<.35?1:0);}
    else if(typ==='tower'){w=d=9+R()*4;nSt=4+Math.floor(R()*2);}
    else if(typ==='ware'){w=34+R()*30;d=16+R()*8;nSt=2;}
    else{w=8+R()*6;d=7+R()*5;nSt=1;}
    if(typ!=='domus'&&typ!=='ware'){w=Math.min(w,22);d=Math.min(d,16,260/w);}
    const rot=Z.rot+(R()-.5)*(typ==='slum'?.36:.07);const hw=w/2,hd=d/2;
    if(W.foot.hits(x,z,hw,hd,rot,Z.m+.8))continue;   // reserve roof eaves as part of the residential clearance
    const c=Math.cos(rot),s=Math.sin(rot),res=['insula','tower','domus','shed','hut','slum'].includes(typ),poly=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([lx,lz])=>[x+lx*c+lz*s,z-lx*s+lz*c]),gH=4.1+R()*.9,sH=3.05+R()*.45;let y0=1e9,y1=-1e9;
    if(res&&typeof residentialSiteAllowed==='function'&&!residentialSiteAllowed(W,poly))continue;
    if(res){const q=houseGround(W,poly,2.5);if(!q)continue;y0=q.min;y1=q.max;}else for(const[lx,lz]of[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd],[0,0]]){const y=W.gy(x+lx*c+lz*s,z-lx*s+lz*c);y0=Math.min(y0,y);y1=Math.max(y1,y);}
    const baseH=typ==='slum'?3.5:gH,storeyH=typ==='slum'?2.85:sH,slopeLimit=nSt>=3?baseH+(nSt-3)*storeyH-.65:nSt===2?baseH-.65:1.5;
    if(res?y1-y0>slopeLimit:y1-y0>Z.step)continue;
    W.foot.add(x,z,hw,hd,rot);emitBuilding(W,G(x,z),typ,x,z,rot,w,d,nSt,y0,y1,R,Z,gH,sH);n++;
    if(Z.ppl&&R()<Z.ppl){for(let k=0;k<3;k++){const a=R()*TAU,rr=Math.max(hw,hd)+3;W.people.push([x+Math.cos(a)*rr,W.gy(x+Math.cos(a)*rr,z+Math.sin(a)*rr),z+Math.sin(a)*rr]);}}}
  const grp=new THREE.Group();for(const g of chunks.values()){const m=g.mesh(MAT.city);if(m)grp.add(m);}W.scene.add(grp);W.cityGroup=grp;return n;}
function emitBuilding(W,g,typ,x,z,rot,w,d,nSt,y0,y1,R,Z,gH=4.1+R()*.9,sH=3.05+R()*.45){
  const PF=frame(x,0,z,rot),PP=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>{const p=PF.p(q[0],0,q[1]);return[p[0],p[2]];});if(typ!=='ware'&&typeof residentialSiteAllowed==='function'&&!residentialSiteAllowed(W,PP))return;

  if(['insula','tower','domus','shed','hut','slum'].includes(typ)){
    const E=frame(x,0,z,rot),poly=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>{const p=E.p(q[0],0,q[1]);return[p[0],p[2]];});
    (W.residentialEnvelopes||(W.residentialEnvelopes=[])).push({polygon:poly,type:typ,storeys:nSt});
  }
  const F=frame(x,0,z,rot),seed=R(),res=['insula','tower','domus','shed','hut','slum'].includes(typ),floorY=(res?y0:y1)+.15,winT=Math.floor(R()*8);let grT=0;
  if(typ==='insula'&&R()<Z.shops)grT=R()<.55?1:2;if(typ==='domus')grT=R()<.5?2:0;if(typ==='ware')grT=3;
  let fl=2;if(R()<.7)fl|=8;if(R()<.55)fl|=16;if(R()<.3)fl|=32;if(R()<.22)fl|=64;if(R()<.18)fl|=4;if(typ==='tower'||(typ==='insula'&&R()<.13))fl|=256;
  const part=R()<(Z.brick||0)?9:0,yT=floorY+gH+(nSt-1)*sH,lit=.4+R()*.6;
  const fac={part,seed,sty:winT+8*grT,fl,nSt,gH,sH,lit,shopMask:R()<.5?1:5,doorSide:Math.floor(R()*4),burn:Z.burn?Z.burn(x,z)*(R()<.65?1:0):0};
  const yB=res?y0-.25:y0-2.5;
  if(typ==='hut'){const hp=R()<.6?22:30,hf={part:hp,seed,sty:3,fl:16|2,nSt:1,gH:3,sH:3,lit:.4,burn:0},yT2=floorY+3;rectWalls(g,F,0,0,w,d,yB,yT2,floorY,hf);const t0=g.nv;roof(g,F,'gable',0,0,w,d,yT2,(24+R()*10)*DEG,.35,seed+.2,{part:hp,seed,nSt:1,gH:3,sH:3,floorY});if(R()<.5)retag(g,1,21,t0);return;}
  if(typ==='slum'){const gh=3.5,sh=2.85,n=nSt,j1=.75,j2=1.35,y2=floorY+gh,k2=Math.min(3,n-1),y3=y2+k2*sh,bn=fac.burn;
    rectWalls(g,F,0,0,w,d,yB,y2,floorY,{part:9,seed,sty:3+8*(R()<.65?2:3),fl:2,nSt:1,gH:gh,sH:sh,lit,shopMask:R()<.5?1:5,doorSide:Math.floor(R()*4),burn:bn});
    const fu={part:30,seed,sty:3,fl:16|(R()<.3?32:0),nSt:n,gH:gh,sH:sh,lit,burn:bn};rectWalls(g,F,0,0,w+j1*2,d+j1*2,y2,y3,floorY,fu);g.set(3,seed);box(g,F,0,y2-.3,0,w/2+j1,.3,d/2+j1,48);
    let yT2=y3,J=j1;if(n-1>k2){J=j2;yT2=y3+(n-1-k2)*sh;rectWalls(g,F,0,0,w+j2*2,d+j2*2,y3,yT2,floorY,fu);g.set(3,seed);box(g,F,0,y3-.3,0,w/2+j2,.3,d/2+j2,48);}
    const ww=w+J*2,dd=d+J*2;roof(g,F,R()<.75?'gable':'hip',0,0,ww,dd,yT2,(15+R()*8)*DEG,.45,seed+.2,{part:30,seed,nSt:n,gH:gh,sH:sh,floorY});
    if(R()<.65){const ly=y2+sh*(1+Math.floor(R()*Math.max(1,k2)))-.4,lz=dd/2;g.set(3,.3);box(g,F,0,ly,lz+1.3,ww*.42,.06,.06,31);
      for(let i=-2;i<=2;i++){if(R()<.3)continue;const lx=i*ww*.17;g.set(8,.25+R()*.03);g.poly([F.p(lx-.55,ly,lz+1.3),F.p(lx+.55,ly,lz+1.3),F.p(lx+.55,ly-1.2,lz+1.36),F.p(lx-.55,ly-1.2,lz+1.36)],F.d(0,0,1));g.poly([F.p(lx+.55,ly,lz+1.3),F.p(lx-.55,ly,lz+1.3),F.p(lx-.55,ly-1.2,lz+1.24),F.p(lx+.55,ly-1.2,lz+1.24)],F.d(0,0,-1));}}
    if(R()<.55){g.set(8,R());const aw=w*.36,ay=y2-.7;g.poly([F.p(-aw,ay,d/2+.05),F.p(aw,ay,d/2+.05),F.p(aw,ay-.7,d/2+1.6),F.p(-aw,ay-.7,d/2+1.6)],F.d(0,1,1));g.poly([F.p(aw,ay,d/2+.05),F.p(-aw,ay,d/2+.05),F.p(-aw,ay-.7,d/2+1.6),F.p(aw,ay-.7,d/2+1.6)],F.d(0,-1,-1));}
    return;}
  if(typ==='domus'){const cw=w*.5,cd=d*.46,wf={part:0,seed:.15+R()*.015,sty:0,fl:1|64|8,nSt,gH,sH,lit:.3,burn:fac.burn};
    rectWalls(g,F,0,0,w,d,yB,yT,floorY,wf);rectWalls(g,F,0,0,cw,cd,floorY,yT,floorY,Object.assign({},wf,{fl:8,sty:5}),true);
    roof(g,F,'ring',0,0,w,d,yT,20*DEG,.6,seed+.2,{cw,cd});g.set(23,seed);g.poly([F.p(-cw/2,floorY+.05,cd/2),F.p(cw/2,floorY+.05,cd/2),F.p(cw/2,floorY+.05,-cd/2),F.p(-cw/2,floorY+.05,-cd/2)],[0,1,0]);g.set(5,seed);for(const[hx,hz]of[[cw/2,.9],[.9,cd/2]])g.poly([F.p(-hx,floorY+.09,hz),F.p(hx,floorY+.09,hz),F.p(hx,floorY+.09,-hz),F.p(-hx,floorY+.09,-hz)],[0,1,0]);
    const pw=cw*.42,pd=cd*.34;g.set(2,.5);box(g,F,0,floorY-.2,0,pw/2+.6,.55,pd/2+.6,31);if(W.poolG){W.poolG.set(0,.5);W.poolG.poly([F.p(-pw/2,floorY+.4,pd/2),F.p(pw/2,floorY+.4,pd/2),F.p(pw/2,floorY+.4,-pd/2),F.p(-pw/2,floorY+.4,-pd/2)],[0,1,0]);}
    const ch=Math.min(3.8,gH*.82);for(let i=0;i<=4;i++){const t=i/4-.5;for(const[px,pz]of[[t*(cw-3),cd/2-1.6],[t*(cw-3),-cd/2+1.6],[cw/2-1.6,t*(cd-3)],[-cw/2+1.6,t*(cd-3)]])W.cols.simple.push([...F.p(px,floorY,pz),rot,ch,[1,.98,.94]]);}
    for(let i=0;i<3;i++){const ox=(R()<.5?-1:1)*(pw/2+2+R()*2),oz=(R()-.5)*cd*.5,q=F.p(ox,0,oz);W.trees.push([q[0],floorY,q[2],R()<.45?'cyp':'broad',.5+R()*.2]);}
    return;}
  if(typ==='insula'&&w>25&&d>20&&R()<.55){const cw=w-14,cd=d-13;houseRectWalls(W,g,F,0,0,w,d,yB,yT,floorY,fac);rectWalls(g,F,0,0,cw,cd,floorY,yT,floorY,Object.assign({},fac,{sty:winT,fl:fl&~2,shopMask:0}),true);
    roof(g,F,'ring',0,0,w,d,yT,21*DEG,.7,seed+.2,{cw,cd});g.set(11,seed);g.poly([F.p(-cw/2,floorY+.05,cd/2),F.p(cw/2,floorY+.05,cd/2),F.p(cw/2,floorY+.05,-cd/2),F.p(-cw/2,floorY+.05,-cd/2)],[0,1,0]);g.set(2,.5);lathe(g,F,0,floorY,0,[[.75,0],[.75,.85],[.55,.85],[.55,.1]],10);return;}
  houseRectWalls(W,g,F,0,0,w,d,yB,yT,floorY,fac);
  const rr=R();const rt=typ==='tower'?'pyr':typ==='ware'?'gable':rr<.48?'hip':rr<.86?'gable':'flat';
  const wf=Object.assign({},fac,{floorY});
  roof(g,F,rt,0,0,w,d,yT,(typ==='tower'?24:19+R()*6)*DEG,typ==='tower'?1.2:.75,seed+.2,wf);
  if(typ==='insula'&&R()<.22){const tw=Math.min(w,d)*.45,tx=(R()<.5?-1:1)*(w/2-tw/2),tz=(R()<.5?-1:1)*(d/2-tw/2),tn=nSt+1+(R()<.3?1:0),tY=floorY+gH+(tn-1)*sH;
    houseRectWalls(W,g,F,tx,tz,tw,tw,floorY,tY,floorY,Object.assign({},fac,{nSt:tn,fl:fl|256,shopMask:0}));roof(g,F,'hip',tx,tz,tw,tw,tY,24*DEG,1.,seed+.4);}
  if(typ==='insula'&&nSt>=3&&R()<.28){const by=floorY+gH+sH,bw=w*.7;g.set(3,seed);box(g,F,0,by-.2,d/2+.55,bw/2,.2,.55,31);box(g,F,0,by,d/2+1.05,bw/2,.95,.05,31);
    for(let k=-bw/2;k<=bw/2;k+=1.8)box(g,F,k,by-1.6,d/2+1.05,.06,1.6,.06,15);}
  if(grT>0&&R()<.55){const n=Math.max(1,Math.floor(w/3.4));for(let i=0;i<n;i++){if(R()<.35)continue;const bx=-w/2+(i+.5)*w/n,aw=w/n*.42,ay=floorY+gH-.75;g.set(8,R());
    const A=F.p(bx-aw,ay,d/2+.05),B=F.p(bx+aw,ay,d/2+.05),C=F.p(bx+aw,ay-.8,d/2+1.7),D=F.p(bx-aw,ay-.8,d/2+1.7);g.poly([A,B,C,D],F.d(0,1,1));g.poly([D,C,B,A],F.d(0,-1,-1));}}
}

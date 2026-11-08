/* ---------- geometry builder ---------- */
class GB{
  constructor(cap=8192){this.cap=cap;this.p=new Float32Array(cap*3);this.n=new Float32Array(cap*3);this.a=new Float32Array(cap*4);this.b=new Float32Array(cap*4);this.c=new Float32Array(cap*4);
    this.ix=new Uint32Array(cap*2);this.nv=0;this.ni=0;this.m=[0,.5,0,0,1,4,0,1];}
  grow(nv,ni){if(nv>this.cap){let c=this.cap;while(c<nv)c*=2;const g=(a,k)=>{const x=new Float32Array(c*k);x.set(a);return x;};
      this.p=g(this.p,3);this.n=g(this.n,3);this.a=g(this.a,4);this.b=g(this.b,4);this.c=g(this.c,4);this.cap=c;}
    if(ni>this.ix.length){let c=this.ix.length;while(c<ni)c*=2;const x=new Uint32Array(c);x.set(this.ix);this.ix=x;}}
  set(part,seed=.5,sty=0,fl=0,nSt=1,gH=4,burn=0,lit=1){this.m=[part,seed,sty,fl,nSt,gH,burn,lit];return this;}
  vtx(p,nx,ny,nz,u,v,L,sH){const i=this.nv,m=this.m;
    this.p[i*3]=p[0];this.p[i*3+1]=p[1];this.p[i*3+2]=p[2];this.n[i*3]=nx;this.n[i*3+1]=ny;this.n[i*3+2]=nz;
    this.a[i*4]=u;this.a[i*4+1]=v;this.a[i*4+2]=L;this.a[i*4+3]=sH;
    this.b[i*4]=m[1];this.b[i*4+1]=m[0];this.b[i*4+2]=m[2];this.b[i*4+3]=m[3];
    this.c[i*4]=m[4];this.c[i*4+1]=m[5];this.c[i*4+2]=m[6];this.c[i*4+3]=m[7];this.nv++;return i;}
  // polygon (3 or 4 points, CCW from outside); uv: optional per-vertex [u,v] + L,sH; want: optional direction to fix winding
  poly(pts,want,uv,L=0,sH=0){
    let n=nrm(pts[0],pts[1],pts[2]);
    if(want&&n[0]*want[0]+n[1]*want[1]+n[2]*want[2]<0){pts=pts.slice().reverse();if(uv)uv=uv.slice().reverse();n=[-n[0],-n[1],-n[2]];}
    const k=pts.length;this.grow(this.nv+k,this.ni+(k-2)*3);const b=this.nv;
    for(let j=0;j<k;j++){const p=pts[j];let u,v;if(uv){u=uv[j][0];v=uv[j][1];}else{const t=autoUV(p,n);u=t[0];v=t[1];}this.vtx(p,n[0],n[1],n[2],u,v,L,sH);}
    for(let j=1;j<k-1;j++){this.ix[this.ni++]=b;this.ix[this.ni++]=b+j;this.ix[this.ni++]=b+j+1;}}
  // append a THREE.BufferGeometry transformed by matrix (uses its normals)
  addGeo(geo,mat){const g=geo.index?geo.toNonIndexed():geo;const P=g.attributes.position,N=g.attributes.normal;const nm=new THREE.Matrix3().getNormalMatrix(mat);
    const v=new THREE.Vector3(),nn=new THREE.Vector3();this.grow(this.nv+P.count,this.ni+P.count);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(mat);nn.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();
      const p=[v.x,v.y,v.z],t=autoUV(p,[nn.x,nn.y,nn.z]);this.ix[this.ni++]=this.vtx(p,nn.x,nn.y,nn.z,t[0],t[1],0,0);}}
  geometry(){const G=new THREE.BufferGeometry(),nv=this.nv;
    G.setAttribute('position',new THREE.BufferAttribute(this.p.slice(0,nv*3),3));G.setAttribute('normal',new THREE.BufferAttribute(this.n.slice(0,nv*3),3));
    G.setAttribute('aA',new THREE.BufferAttribute(this.a.slice(0,nv*4),4));G.setAttribute('aB',new THREE.BufferAttribute(this.b.slice(0,nv*4),4));
    G.setAttribute('aC',new THREE.BufferAttribute(this.c.slice(0,nv*4),4));G.setIndex(new THREE.BufferAttribute(this.ix.slice(0,this.ni),1));
    G.computeBoundingSphere();G.computeBoundingBox();return G;}
  // a mesh of its own: once its buffers are on the GPU the JS copies are let go (gbFree; the bounds and counts stay). Nothing reads a built mesh back;
  // geometry() (templates such as COLGEO, read again by addGeo and instancing) keeps its arrays.
  mesh(mat,shadow=true){if(!this.nv)return null;const G=this.geometry();for(const k in G.attributes)G.attributes[k].onUpload(gbFree);G.index.onUpload(gbFree);
    const m=new THREE.Mesh(G,mat);m.castShadow=shadow;m.receiveShadow=true;return m;}
}
function gbFree(){this.array=null;}
function nrm(a,b,c){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;const l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];}
function autoUV(p,n){if(Math.abs(n[1])>.97)return[p[0],p[2]];let tx=-n[2],tz=n[0];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
  const bx=-tz*n[1],by=tz*n[0]-tx*n[2],bz=tx*n[1];return[p[0]*tx+p[2]*tz,p[0]*bx+p[1]*by+p[2]*bz];}
// local frame: origin + rotation about Y (three.js convention)
function frame(ox,oy,oz,rot=0){const c=Math.cos(rot),s=Math.sin(rot);
  return{ox,oy,oz,rot,c,s,p:(x,y,z)=>[ox+x*c+z*s,oy+y,oz-x*s+z*c],d:(x,y,z)=>[x*c+z*s,y,-x*s+z*c],
    sub(x,y,z,r=0){const q=this.p(x,y,z);return frame(q[0],q[1],q[2],rot+r);}};}
// box in frame F: x [cx-hx,cx+hx], y [y0,y0+h], z [cz-hz,cz+hz]; faces bitmask 1:+z 2:+x 4:-z 8:-x 16:top 32:bottom
function box(g,F,cx,y0,cz,hx,h,hz,faces=31){const y1=y0+h,P=(x,y,z)=>F.p(cx+x,y,cz+z);
  if(faces&1)g.poly([P(-hx,y0,hz),P(hx,y0,hz),P(hx,y1,hz),P(-hx,y1,hz)],F.d(0,0,1));
  if(faces&2)g.poly([P(hx,y0,hz),P(hx,y0,-hz),P(hx,y1,-hz),P(hx,y1,hz)],F.d(1,0,0));
  if(faces&4)g.poly([P(hx,y0,-hz),P(-hx,y0,-hz),P(-hx,y1,-hz),P(hx,y1,-hz)],F.d(0,0,-1));
  if(faces&8)g.poly([P(-hx,y0,-hz),P(-hx,y0,hz),P(-hx,y1,hz),P(-hx,y1,-hz)],F.d(-1,0,0));
  if(faces&16)g.poly([P(-hx,y1,hz),P(hx,y1,hz),P(hx,y1,-hz),P(-hx,y1,-hz)],[0,1,0]);
  if(faces&32)g.poly([P(-hx,y0,-hz),P(hx,y0,-hz),P(hx,y0,hz),P(-hx,y0,hz)],[0,-1,0]);}
// Tenement storeys get lower toward the top (the author, 2026-11-02: above the third floor the rooms are low, and lower again on the 5th and 6th).
// Upper storey si (1 = the first above the ground floor) is sH high up to the 2nd, then .86, .76, .7 of it, never under 2.25 m. Walls of such a house
// carry STOREY_TAPER in fl, so wallS finds the same storey lines (stHs there); stUp(k,sH,tap) = the height of the first k upper storeys.
const STOREY_TAPER=1048576;
function stH(si,sH,tap){return tap&&si>2.5?Math.min(sH,Math.max(2.25,sH*(si<3.5?.86:si<4.5?.76:.7))):sH;}
function stUp(k,sH,tap){let s=0;for(let i=1;i<=k;i++)s+=stH(i,sH,tap);return s;}
// facade wall from local A to B (outward = cross(up,AB)), world y0..y1, facade v from floorY
function wall(g,F,ax,az,bx,bz,y0,y1,floorY,sH){const A0=F.p(ax,y0,az),B0=F.p(bx,y0,bz),B1=F.p(bx,y1,bz),A1=F.p(ax,y1,az);
  const L=Math.hypot(bx-ax,bz-az),dx=B0[0]-A0[0],dz=B0[2]-A0[2],va=y0-floorY,vb=y1-floorY;
  {const l2=Math.hypot(dx,dz)||1,o=(((g.m[1]*977.13+g.m[2]*13.71+g.m[3]*3.17+g.m[4]*5.31+g.m[0]*7.9+y0*.37)%1)+1)%1*.035,ox=dz/l2*o,oz=-dx/l2*o;for(const P of[A0,B0,B1,A1]){P[0]+=ox;P[2]+=oz;}}   // coplanar walls of neighbouring/overlapping buildings get different seeds: a per-wall 0-3.5 cm push along the normal settles who wins instead of z-fighting (the speckle on window frames)
  g.poly([A0,B0,B1,A1],[dz,0,-dx],[[0,va],[L,va],[L,vb],[0,vb]],L,sH);}
function wallTri0(g,F,ax,az,bx,bz,y0,yApex,floorY,sH){const A0=F.p(ax,y0,az),B0=F.p(bx,y0,bz),M=F.p((ax+bx)/2,yApex,(az+bz)/2);
  const L=Math.hypot(bx-ax,bz-az),dx=B0[0]-A0[0],dz=B0[2]-A0[2];g.poly([A0,B0,M],[dz,0,-dx],[[0,y0-floorY],[L,y0-floorY],[L/2,yApex-floorY]],L,sH);}
// rectangle walls (4 facades). fac: {part,seed,sty,fl,nSt,gH,sH,lit,shopMask,doorSide,burn}
function rectWalls(g,F,cx,cz,w,d,y0,y1,floorY,fac,inward=false){const hw=w/2,hd=d/2;
  let C=[[cx-hw,cz-hd],[cx+hw,cz-hd],[cx+hw,cz+hd],[cx-hw,cz+hd]];if(inward)C=C.reverse();
  // Direct callers used to bypass the real gallery shell and retain painted black arches.
  if(!inward&&typeof houseShell==='function'&&((fac.fl||0)&(256|512))&&fac.nSt>=2&&Math.min(w,d)>=5.2){
    const owner=g.galleryOwner||(g.galleryOwner={houseGalleryLog:[]});houseShell(owner,g,F,C,y0,y1,floorY,{...fac,sH:fac.sH||3,gH:fac.gH||4,flat:false});return;}

  for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4];let sty=fac.sty,fl=fac.fl;
    if(fac.shopMask!==undefined&&!(fac.shopMask&(1<<i)))sty=sty%8;
    if(fac.doorSide!==undefined&&fac.doorSide!==i)fl&=~2;
    g.set(fac.part,fac.seed,sty,fl,fac.nSt,fac.gH,fac.burn||0,fac.lit??1);wall(g,F,a[0],a[1],b[0],b[1],y0,y1,floorY,fac.sH);}}
/* roofs (local frame, rectangle centered at cx,cz) */
function ridgeCap(g,P,Q){const d=[Q[0]-P[0],Q[1]-P[1],Q[2]-P[2]],L=Math.hypot(...d);if(L<.2)return;
  let s=[d[2],0,-d[0]];const sl=Math.hypot(s[0],s[2])||1;s=[s[0]/sl*.16,0,s[2]/sl*.16];const h=.14;
  const A=[P[0]+s[0],P[1]-.04,P[2]+s[2]],B=[Q[0]+s[0],Q[1]-.04,Q[2]+s[2]],A2=[P[0]-s[0],P[1]-.04,P[2]-s[2]],B2=[Q[0]-s[0],Q[1]-.04,Q[2]-s[2]],T=[P[0],P[1]+h,P[2]],T2=[Q[0],Q[1]+h,Q[2]];
  g.poly([A,B,T2,T],[s[0],1,s[2]]);g.poly([B2,A2,T,T2],[-s[0],1,-s[2]]);}
function wallTri(g,F,ax,az,bx,bz,y0,y1,floorY,sH){wallTri0(g,F,ax,az,bx,bz,y0,y1,floorY,sH);wallTri0(g,F,bx,bz,ax,az,y0,y1,floorY,sH);}
function roof(g,F,type,cx,cz,w,d,yT,pitch,over,seed,wallFac){if(!wallFac&&type.indexOf('gable')===0)wallFac={part:9,seed,nSt:1,gH:4,sH:4,floorY:yT-4};
  const t=Math.tan(pitch),ex=w/2+over,ez=d/2+over,yE=yT-over*t*.55+.06,P=(x,y,z)=>F.p(cx+x,y,cz+z),D=(x,y,z)=>F.d(x,y,z);
  g.set(1,seed);
  if(type==='flat'){g.set(5,seed);g.poly([P(-w/2,yT+.05,d/2),P(w/2,yT+.05,d/2),P(w/2,yT+.05,-d/2),P(-w/2,yT+.05,-d/2)],[0,1,0]);
    if(wallFac){const f=Object.assign({},wallFac,{fl:1});rectWalls(g,F,cx,cz,w,d,yT,yT+.9,yT-50,f);rectWalls(g,F,cx,cz,w,d,yT,yT+.9,yT-50,f,true);}
    g.set(2,seed);box(g,F,cx,yT+.9,cz,w/2+.08,.12,d/2+.08,31);return yT+1;}
  if(type==='hip'||type==='pyr'){
    if(ex>=ez){const r=type==='pyr'?0:ex-ez,yR=yE+ez*t;
      g.poly([P(-ex,yE,ez),P(ex,yE,ez),P(r,yR,0),P(-r,yR,0)].filter((p,i)=>!(r===0&&i===3)),D(0,1,1));
      g.poly([P(ex,yE,-ez),P(-ex,yE,-ez),P(-r,yR,0),P(r,yR,0)].filter((p,i)=>!(r===0&&i===3)),D(0,1,-1));
      g.poly([P(-ex,yE,-ez),P(-ex,yE,ez),P(-r,yR,0)],D(-1,1,0));g.poly([P(ex,yE,ez),P(ex,yE,-ez),P(r,yR,0)],D(1,1,0));
      g.set(4,seed);if(r>0)ridgeCap(g,P(-r,yR,0),P(r,yR,0));
      for(const[sx,sz]of[[1,1],[-1,1],[1,-1],[-1,-1]])ridgeCap(g,P(sx*ex,yE,sz*ez),P(sx*r,yR,0));
    }else{const r=type==='pyr'?0:ez-ex,yR=yE+ex*t;
      g.poly([P(ex,yE,ez),P(ex,yE,-ez),P(0,yR,-r),P(0,yR,r)].filter((p,i)=>!(r===0&&i===3)),D(1,1,0));
      g.poly([P(-ex,yE,-ez),P(-ex,yE,ez),P(0,yR,r),P(0,yR,-r)].filter((p,i)=>!(r===0&&i===3)),D(-1,1,0));
      g.poly([P(-ex,yE,ez),P(ex,yE,ez),P(0,yR,r)],D(0,1,1));g.poly([P(ex,yE,-ez),P(-ex,yE,-ez),P(0,yR,-r)],D(0,1,-1));
      g.set(4,seed);if(r>0)ridgeCap(g,P(0,yR,-r),P(0,yR,r));
      for(const[sx,sz]of[[1,1],[-1,1],[1,-1],[-1,-1]])ridgeCap(g,P(sx*ex,yE,sz*ez),P(0,yR,sz*r));}
  }else if(type==='gable'||type==='gableX'||type==='gableZ'){
    const alongX=type==='gableX'||(type==='gable'&&w>=d);
    if(alongX){const yR=yT+(d/2)*t,gx=w/2+over*.5;
      g.poly([P(-gx,yE,ez),P(gx,yE,ez),P(gx,yR+.1,0),P(-gx,yR+.1,0)],D(0,1,1));g.poly([P(gx,yE,-ez),P(-gx,yE,-ez),P(-gx,yR+.1,0),P(gx,yR+.1,0)],D(0,1,-1));
      g.set(4,seed);ridgeCap(g,P(-gx,yR+.1,0),P(gx,yR+.1,0));
      if(wallFac){g.set(wallFac.part,wallFac.seed,0,1|((wallFac.fl||0)&STOREY_TAPER),wallFac.nSt,wallFac.gH,wallFac.burn||0,1);
        wallTri(g,F,cx+w/2,cz+d/2,cx+w/2,cz-d/2,yT,yR,wallFac.floorY,wallFac.sH);wallTri(g,F,cx-w/2,cz-d/2,cx-w/2,cz+d/2,yT,yR,wallFac.floorY,wallFac.sH);}
    }else{const yR=yT+(w/2)*t,gz=d/2+over*.5;
      g.poly([P(ex,yE,gz),P(ex,yE,-gz),P(0,yR+.1,-gz),P(0,yR+.1,gz)],D(1,1,0));g.poly([P(-ex,yE,-gz),P(-ex,yE,gz),P(0,yR+.1,gz),P(0,yR+.1,-gz)],D(-1,1,0));
      g.set(4,seed);ridgeCap(g,P(0,yR+.1,-gz),P(0,yR+.1,gz));
      if(wallFac){g.set(wallFac.part,wallFac.seed,0,1|((wallFac.fl||0)&STOREY_TAPER),wallFac.nSt,wallFac.gH,wallFac.burn||0,1);
        wallTri(g,F,cx-w/2,cz+d/2,cx+w/2,cz+d/2,yT,yR,wallFac.floorY,wallFac.sH);wallTri(g,F,cx+w/2,cz-d/2,cx-w/2,cz-d/2,yT,yR,wallFac.floorY,wallFac.sH);}}
  }else if(type==='ring'){ // courtyard ring roof: wallFac.cw, cd = court size
    const cw=wallFac.cw/2-over,cd=wallFac.cd/2-over,rx=(w/2+wallFac.cw/2)/2,rz=(d/2+wallFac.cd/2)/2,yR=yE+(w/2-wallFac.cw/2)/2*t;
    const O=[[-ex,ez],[ex,ez],[ex,-ez],[-ex,-ez]],Rr=[[-rx,rz],[rx,rz],[rx,-rz],[-rx,-rz]],I=[[-cw,cd],[cw,cd],[cw,-cd],[-cw,-cd]],dirs=[[0,1],[1,0],[0,-1],[-1,0]];
    for(let i=0;i<4;i++){const j=i===0?0:i,a=(i+3)%4,b=i;const k=[[0,1],[1,2],[2,3],[3,0]][i];const dd=[[0,1],[1,0],[0,-1],[-1,0]][i];
      g.poly([P(O[k[0]][0],yE,O[k[0]][1]),P(O[k[1]][0],yE,O[k[1]][1]),P(Rr[k[1]][0],yR,Rr[k[1]][1]),P(Rr[k[0]][0],yR,Rr[k[0]][1])],D(dd[0],1,dd[1]));
      g.poly([P(Rr[k[0]][0],yR,Rr[k[0]][1]),P(Rr[k[1]][0],yR,Rr[k[1]][1]),P(I[k[1]][0],yE,I[k[1]][1]),P(I[k[0]][0],yE,I[k[0]][1])],D(-dd[0],1,-dd[1]));}
    g.set(4,seed);for(let i=0;i<4;i++)ridgeCap(g,P(Rr[i][0],yR,Rr[i][1]),P(Rr[(i+1)%4][0],yR,Rr[(i+1)%4][1]));
  }
  // eave fascia
  if(type!=='ring'){g.set(2,seed);const yb=yE-.2;
    g.poly([P(-ex,yb,ez),P(ex,yb,ez),P(ex,yE,ez),P(-ex,yE,ez)],D(0,0,1));g.poly([P(ex,yb,-ez),P(-ex,yb,-ez),P(-ex,yE,-ez),P(ex,yE,-ez)],D(0,0,-1));
    if(type!=='gable'||true){g.poly([P(ex,yb,ez),P(ex,yb,-ez),P(ex,yE,-ez),P(ex,yE,ez)],D(1,0,0));g.poly([P(-ex,yb,-ez),P(-ex,yb,ez),P(-ex,yE,ez),P(-ex,yE,-ez)],D(-1,0,0));}}
  return yT+Math.max(w,d)/2*t;
}
/* shared lathe/cylinder into GB */
function lathe(g,F,cx,y0,cz,prof,seg=16,part){if(part!==undefined)g.m[0]=part;
  for(let i=0;i<prof.length-1;i++){const[r0,h0]=prof[i],[r1,h1]=prof[i+1];
    for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
      const A=F.p(cx+c0*r0,y0+h0,cz+s0*r0),B=F.p(cx+c1*r0,y0+h0,cz+s1*r0),C=F.p(cx+c1*r1,y0+h1,cz+s1*r1),D=F.p(cx+c0*r1,y0+h1,cz+s0*r1);
      const am=(a0+a1)/2;const want=F.d(Math.cos(am),(r0-r1)*.5,Math.sin(am));
      if(r1<1e-3)g.poly([A,B,C],want);else if(r0<1e-3)g.poly([A,C,D],want);else g.poly([A,B,C,D],want);}}}

/* ---------- city / architecture material ---------- */
const CITY_F=`
uniform vec4 uDbg;
varying vec4 vA;varying vec4 vB;varying vec4 vC;
// lime plaster as at Herculaneum and Ostia (briefs/rome/facades.md): off-white, grey-beige rough coat, yellow and pale ochre, a rare red-ochre wash; no pinks.
// Linear albedo ~.5 like the GLB plaster (romeMat), not the near-white .8-.9 that made the houses glare beside the monuments.
vec3 plasterCol(float s){float k=fract(s*7.13);vec3 c;
 if(k<.15)c=vec3(.56,.52,.44);else if(k<.33)c=vec3(.48,.44,.36);else if(k<.52)c=vec3(.54,.44,.27);else if(k<.66)c=vec3(.57,.5,.38);
 else if(k<.78)c=vec3(.5,.47,.4);else if(k<.9)c=vec3(.5,.39,.24);else c=vec3(.42,.2,.12);return c*(.94+.1*fract(s*31.7));}
// fired terracotta tegulae. Half the roofs (keyed to the roof's seed) are red like the GLB roofs (.39,.1,.047);
// the other half keep the older, paler sun-bleached tiles (the author: red on about 50 %, not on all of them).
vec3 roofCol(float s){float k=fract(s*5.31);vec3 c;
 if(fract(s*13.7)<.5){
  if(k<.3)c=vec3(.4,.12,.055);else if(k<.55)c=vec3(.36,.11,.05);else if(k<.72)c=vec3(.44,.15,.07);else if(k<.86)c=vec3(.33,.12,.06);else c=vec3(.42,.17,.08);
  return c*(.86+.24*fract(s*17.3));}
 if(k<.3)c=vec3(.55,.21,.09);else if(k<.55)c=vec3(.49,.2,.1);else if(k<.72)c=vec3(.6,.28,.12);else if(k<.86)c=vec3(.44,.22,.13);else c=vec3(.56,.31,.16);
 {vec3 rc_=(c*(.86+.24*fract(s*17.3)));return mix(vec3(dot(rc_,vec3(.3,.59,.11))),rc_,.6)*vec3(1.36,1.3,.96);}}
float openM(vec2 q,float hw,float h,float ar,float aa){
 float m=smoothstep(-aa,aa,q.y)*(1.-smoothstep(hw-aa,hw+aa,abs(q.x)))*(1.-smoothstep(h-aa,h+aa,q.y));   // (smoothstep with edge0>edge1 is undefined in GLSL: it speckled the window frames)
 if(ar>.5&&q.y>h-hw){float d=length(vec2(q.x,q.y-(h-hw)))-hw;m=(1.-smoothstep(-aa,aa,d))*smoothstep(-aa,aa,q.y);}return m;}
float joint(float x,float per,float w,float aa){float d=abs(fract(x/per+.5)-.5)*per;return (1.-smoothstep(w,w+aa+.01,d))*(1.-smoothstep(.04,.12,aa));}
vec3 stoneC(vec2 p,float s,vec3 base,float bw,float bh,float aa){float n=fbm2(p*1.3+s*9.);float row=floor(p.y/bh);
 float j=max(joint(p.y,bh,.01,aa),joint(p.x+fract(row*.5)*bw,bw,.01,aa));vec3 c=base*(.86+.24*n)*(.94+.1*h12(vec2(floor(p.x/bw+fract(row*.5)),row)+s));return c*(1.-.22*j);}
vec3 marbleC(vec3 p,float s){float n=fbm3(p*.3+s*3.);float vv=abs(sin((p.x*.7+p.y*1.1+p.z*.5)*.8+n*7.));vec3 c=vec3(.56,.515,.44)*(.94+.1*n);
 c*=1.-.1*pow(1.-vv,12.);c*=mix(1.,.84,smoothstep(.62,.86,fbm3(p*.07+s)));return c;}
void roofS(inout PS S,vec3 N,float gilt,float aa){vec2 uv=vA.xy;float seed=floor(vB.x*4096.+.5)/4096.;float pt=.47;float col=floor(uv.x/pt);float xr=(fract(uv.x/pt)-.5)*pt;
 float cs=.42;float row=floor(uv.y/cs);float yr=fract(uv.y/cs);float th=h12(vec2(col,row)+seed*17.);
 vec3 base=gilt>.5?vec3(1.,.72,.3):roofCol(seed);float r=.09;float cov=1.-smoothstep(r-aa,r+aa,abs(xr));float det=1.-smoothstep(.05,.16,aa);
 float tilt=cov*clamp(xr/r,-1.,1.)*.95+(1.-cov)*(-sign(xr)*.2);float st=(1.-smoothstep(0.,.2,yr))*.4;
 vec3 T=normalize(vec3(-N.z,0.,N.x)+1e-4);vec3 B=normalize(cross(T,N));float fcx=1.-smoothstep(pt*.25,pt*.62,aa),fry=1.-smoothstep(cs*.25,cs*.62,aa);float sw=sin(uv.x/pt*6.2832),stp=.5+.5*cos(uv.x/pt*6.2832),crs=smoothstep(0.,.3,yr);S.nw=normalize(N+(T*tilt-B*st)*det+(T*sw*.32*fcx-B*(1.-crs)*.22*fry)*(1.-det));S.useN=1.;
 vec3 c=base*(.8+.34*th);float frs=smoothstep(2.3,3.,uSeason)*(1.-smoothstep(3.,3.7,uSeason));c=mix(c,vec3(.86,.88,.92),frs*.56*smoothstep(.35,.9,N.y));c*=mix(1.,.7,(1.-cov)*.55*det);c*=mix(.74,1.,smoothstep(0.,.22,yr)*det+(1.-det));
 // weathering: each roof has an age (as wallS). Old tiles grey and darken, lichen spreads, rain and soot leave streaks down the slope,
 // and old roofs carry a few bright replaced tiles. Gilt roofs stay clean.
 float age=gilt>.5?0.:fract(seed*23.71+.37*fract(seed*3.3));age=age*age*(3.-2.*age);float rsk=1.-.2*smoothstep(.45,.75,fbm2(vec2(uv.x*.7,uv.y*.06)+seed*11.))*(.35+.65*age);
 if(gilt<.5){float li=smoothstep(.7-.14*age,.9-.1*age,fbm2(uv*.8+seed*5.));c=mix(c,vec3(.4,.38,.3),li*(.18+.14*age));}
 c=mix(c,mix(vec3(dot(c,vec3(.3,.59,.11))),c,.72)*.88,age*.3)*rsk;c=mix(c,base*(1.08+.12*th),step(.975-.05*age,h12(vec2(col,row)+seed*31.))*step(.3,age)*.85);
 c*=.9+.2*fbm2(vec2(uv.x*.05,uv.y*.08)+seed*3.);vec3 cf=base*(.84+.26*th)*mix(.78,1.08,stp*fcx+(1.-fcx)*.6)*mix(.82,1.,crs*fry+(1.-fry)*.62);cf*=.86+.28*vn2(uv*vec2(.45,.55)+seed*7.);if(gilt<.5){float li2=smoothstep(.72-.14*age,.9-.1*age,fbm2(uv*.6+seed*5.));cf=mix(cf,vec3(.42,.4,.32),li2*(.15+.12*age));}
 cf=mix(cf,mix(vec3(dot(cf,vec3(.3,.59,.11))),cf,.72)*.88,age*.3)*rsk;S.alb=mix(cf,c,det);
 S.rough=gilt>.5?.3:.74-uWet*.45;S.metal=gilt>.5?1.:0.;S.ao=mix(1.,.82,(1.-cov)*det);}
// The back wall of an open shop seen through its door (briefs/rome/ground-floor.md): qb = point on the back wall
// (x across the door, y up from the floor), tr = which trade. Shared by the house shader and the shop-front quads (part 51).
vec3 shopGoods(vec2 qb,float tr,float seed,float dq){
  vec3 it=vec3(.16,.12,.08)*(.8+.35*smoothstep(-.3,1.8,qb.y));vec3 wd=vec3(.3,.18,.09);
  if(tr<-1.){}
  else if(tr<.3){float sy=mod(qb.y,.6),sh=step(.55,qb.y)*step(qb.y,2.1),jx=fract(qb.x/.3+floor(qb.y/.6)*.41)-.5;   // shelves of jars (potter, oil seller)
   it=mix(it,wd,step(sy,.05)*sh*dq);it=mix(it,vec3(.42,.17,.08)*(.85+.3*h12(vec2(floor(qb.x/.3),floor(qb.y/.6))+seed)),step(length(vec2(jx*3.,(sy-.21)/.16)),1.)*sh*dq);}
  else if(tr<.5){float ax=abs(fract(qb.x/.36)-.5)*.36,y=qb.y,pr=y<.95?.15*sin(3.1416*clamp(y/.95,0.,1.))+.02:.05;it=mix(it,vec3(.4,.17,.08),step(ax,pr)*step(y,1.05)*dq);}   // amphorae along the wall
  else if(tr<.66){float sy=mod(qb.y,.5),sh=step(.6,qb.y)*step(qb.y,2.),lx=fract(qb.x/.26)-.5;   // shelves of loaves
   it=mix(it,wd,step(sy,.04)*sh*dq);it=mix(it,vec3(.55,.36,.14),step(length(vec2(lx*2.6,(sy-.08)/.05)),1.)*sh*dq);}
  else if(tr<.78){float cx=floor(qb.x/.42),cl=h12(vec2(cx,seed*5.));vec3 cc=cl<.3?vec3(.62,.56,.43):cl<.55?vec3(.46,.1,.06):cl<.8?vec3(.5,.34,.07):vec3(.12,.16,.3);   // dyed cloth hung from a rod
   it=mix(it,cc*.8,step(1.25-.6*cl,qb.y)*step(qb.y,2.25)*step(.08,fract(qb.x/.42))*dq);it=mix(it,wd,step(abs(qb.y-2.28),.03)*dq);}
  else{float tx=fract(qb.x/.55)-.5,th=h12(vec2(floor(qb.x/.55),seed*9.));   // a workshop: bench along the back wall, tools and baskets hung above it
   it=mix(it,wd*1.15,step(abs(qb.y-.85),.05)*dq);it=mix(it,wd*.7,step(qb.y,.8)*step(.42,abs(fract(qb.x/.9)-.5))*dq);
   it=mix(it,mix(vec3(.45,.36,.2),vec3(.33,.3,.27),step(.5,th)),step(abs(tx),.06+.08*th)*step(1.35,qb.y)*step(qb.y,1.75+.35*th)*dq);}
  return it;}
float stHs(float si,float sH){return si>2.5?min(sH,max(2.25,sH*(si<3.5?.86:si<4.5?.76:.7))):sH;}   // stH in JS
void wallS(inout PS S,vec3 N,float P,float aa){
 float u=vA.x,v=vA.y,L=max(vA.z,.5),sH=max(vA.w,2.4);float seed=floor(vB.x*4096.+.5)/4096.,sty=floor(vB.z+.5),fl=floor(vB.w+.5);float nSt=max(floor(vC.x+.5),1.),gH=max(vC.y,2.5),litB=vC.w;
 vec3 base;
 if(P<.5)base=plasterCol(seed);
 else if(P<9.5){float far=smoothstep(.012,.035,aa);float row=floor(v/.072);float mo=1.-smoothstep(.0,.004+aa,abs(fract(v/.072)-.5)*.072-.02);
  vec3 bc=vec3(.42,.23,.15)*(.78+.38*h12(vec2(floor(u/.3+fract(row*.5)),row)+seed));base=mix(mix(bc,vec3(.45,.41,.34),mo*.8),vec3(.42,.25,.17),far);   // salmon-orange brick: R:G:B about 1:.6:.4 as sampled from the Ostia and Domus Aurea scans (refs/arch)
  if(fract(seed*11.)<.6&&v>.9&&v<gH+sH*.9){vec2 rq=vec2(u+v,u-v)*1.9;vec2 rf=abs(fract(rq)-.5);float rj=1.-smoothstep(.40,.46+aa*2.,max(rf.x,rf.y));vec3 tf=vec3(.42,.38,.31)*(.85+.25*h12(floor(rq)+seed));base=mix(base,mix(tf*.8,tf,rj*.6),.55*(1.-far));}}   // opus reticulatum: tuff net between brick bands on the lower walls of ~60 % of the brick houses
 else if(P>29.5){vec3 mud=mix(vec3(.46,.39,.29),vec3(.4,.33,.25),fract(seed*5.7))*(.78+.36*fbm2(vec2(u,v)*.6+seed*3.));float pu=u+fract(seed*9.)*1.7,pc=floor(pu/1.7),px=fract(pu/1.7)*1.7,py=fract(v/2.85)*2.85,dir=h12(vec2(pc,floor(v/2.85))+seed)<.5?1.:-1.;float diag=1.-smoothstep(.09,.09+aa*2.,abs((dir>0.?px/1.7:1.-px/1.7)*2.85-py)*.4);float fr=max(joint(pu,1.7,.1,aa),max(joint(v,2.85,.14,aa),diag*step(.45,h12(vec2(pc,floor(v/2.85))+seed*3.))));float tsl=1.+floor(fract(seed*6.1)*max(nSt-1.,1.)),tmb=step(gH+(tsl-1.)*sH-.01,v)*step(v,gH+tsl*sH+.01),fall=smoothstep(.6,.72,fbm2(vec2(u,v)*.35+seed*7.));base=mix(plasterCol(seed),mix(mud,vec3(.3,.19,.1),fr*.95*(1.-smoothstep(.02,.06,aa))),tmb*fall);}   // opus craticium on ONE upper storey, plastered over as at Herculaneum: the frame and infill show only where the plaster has fallen (facades.md)
 else base=stoneC(vec2(u,v),seed,vec3(.81,.725,.58),1.2,.6,aa);
 if(v<0.){S.alb=stoneC(vec2(u,v),seed,vec3(.55,.5,.4),1.,.5,aa);S.rough=.9;return;}
 float big=fbm2(vec2(u,v)*.07+seed*13.),streak=fbm2(vec2(u*1.1,v*.11)+seed*7.);
 vec3 alb=base*(.9+.2*big);alb*=mix(1.,.82,smoothstep(.55,.8,streak)*.6);alb*=mix(.76,1.,smoothstep(0.,1.8,v));
 float bBlank=mod(fl,2.),bDoor=mod(floor(fl/2.),2.),bQuoin=mod(floor(fl/4.),2.),bBands=mod(floor(fl/8.),2.),bShut=mod(floor(fl/16.),2.),bFrame=mod(floor(fl/32.),2.),bRed=mod(floor(fl/64.),2.),bLog=mod(floor(fl/256.),2.),bArc=mod(floor(fl/512.),2.);float bNiche=mod(floor(fl/1024.),2.),bMed=mod(floor(fl/2048.),2.),bRust=mod(floor(fl/4096.),2.),bFriz=mod(floor(fl/8192.),2.);float bGar=mod(floor(fl/16384.),2.),bShr=mod(floor(fl/32768.),2.),bVou=mod(floor(fl/65536.),2.),bGAr=mod(floor(fl/131072.),2.);   // phase 4: painted garland frieze, blue shrine panel by the door, voussoirs+quoins, red base storey with an arcade
 float bTap=mod(floor(fl/1048576.),2.);float si,sv,sHl=sH,topV=gH+(nSt-1.)*sH;   // STOREY_TAPER: the upper storeys of a tenement get lower (stH in JS)
 if(v<gH){si=0.;sv=v;}else if(bTap<.5){si=1.+floor((v-gH)/sH);sv=(v-gH)-(si-1.)*sH;}
 else{float w=v-gH,b=0.;si=1.;for(int k=0;k<8;k++){sHl=stHs(si,sH);if(w<b+sHl||k==7)break;b+=sHl;si+=1.;}sv=w-b;}
 if(bTap>.5){topV=gH;for(int k=1;k<8;k++){if(float(k)>nSt-.5)break;topV+=stHs(float(k),sH);}}
 vec3 bandC=(fract(seed*3.7)<.55)?vec3(.52,.2,.12):vec3(.58,.54,.46);
 float hA=fract(seed*17.31),hB=fract(seed*29.7),hC=fract(seed*41.9);
 if(bBands>.5&&nSt>1.5&&hA<.55){float bm=1.-smoothstep(.2-aa,.2+aa,abs(v-gH-.05));alb=mix(alb,bandC*(.9+.12*big),bm*.9);float top=smoothstep(.0,.05,v-gH-.22)*(1.-smoothstep(.1,.15,v-gH-.22));alb=mix(alb,bandC*1.1,top*.7*step(hB,.4));}
 if(P<.5&&nSt>1.5&&hB<.35){float shd=smoothstep(gH-.05,gH-.4,v)*step(gH-.45,v);float ho=smoothstep(gH-.02,gH+.04,v)*(1.-smoothstep(gH+.08,gH+.14,v));alb*=1.-.28*smoothstep(0.,1.,(v-(gH-.4))/.4)*step(v,gH)*step(gH-.4,v);alb=mix(alb,vec3(.6,.56,.47),ho*.85);}
 if((bRed>.5||bGAr>.5)&&v<gH-.3)alb=mix(alb,vec3(.52,.2,.12)*(.85+.3*big),.85);if(P<.5&&hC<.6&&v>0.&&v<(hA<.5?1.15:gH-.1)){alb=mix(alb,(fract(seed*2.9)<.6?vec3(.58,.24,.15):vec3(.7,.52,.28))*(.9+.15*big),.82);}  

 if(bVou>.5||(bQuoin>.5&&P>23.5&&P<24.5)){float e=min(u,L-u);float qa=clamp(step(e,.55)*step(mod(floor(v/.55),2.),.5)+step(e,.36),0.,1.);alb=mix(alb,vec3(.53,.5,.42)*(.9+.1*big),qa*.85);}
 float tb=smoothstep(topV-.02,topV+.02,v)*(1.-smoothstep(topV+.55-aa,topV+.55+aa,v));alb=mix(alb,vec3(.58,.54,.46),tb*.85);float dfar=1.-smoothstep(.02,.06,aa);float dn=step(.5,fract(u/.32))*smoothstep(topV+.06,topV+.1,v)*(1.-smoothstep(topV+.26,topV+.3,v))*step(hC,.4);alb*=1.-.25*dn*dfar;if(bBands>.5&&P<.5&&v<topV&&hB>.7){float fz=smoothstep(topV-.78,topV-.74,v)*(1.-smoothstep(topV-.1,topV-.06,v));float yy=(v-(topV-.76))/.68;float scw=abs(yy-.5-.3*sin(u*6.2832/.95));float lnw=1.-smoothstep(.07,.07+aa*3.,scw);vec3 fcw=fract(seed*4.3)<.5?vec3(.56,.19,.1):vec3(.18,.3,.28);alb=mix(alb,mix(vec3(.85,.8,.69),fcw,lnw),fz*dfar*.92);}float bPil=mod(floor(fl/128.),2.);if(bPil>.5&&v<topV&&v>0.){float bw2=3.+fract(seed*5.1);float by2=L/max(1.,floor(L/bw2+.3));float pu=abs(fract(u/by2+.5)-.5)*by2;alb=mix(alb,vec3(.83,.78,.67)*(.9+.1*big),(1.-smoothstep(.2,.24+aa,pu))*.85);}if(bRust>.5&&v<topV){float rh=.58;float rr=floor(v/rh);float ru=u+fract(rr*.5)*.6;float jx=abs(fract(ru/1.2)-.5)*1.2,jy=abs(fract(v/rh)-.5)*rh;float e=min(.6-jx,.29-jy);float g1=1.-smoothstep(0.,.035+aa,e),g2=smoothstep(.035,.09+aa,e)*(1.-smoothstep(.09,.13+aa,e));alb*=1.-.35*g1*dfar;alb*=1.+.08*g2*dfar;}if(bFriz>.5&&v<topV){float fz2=smoothstep(topV-.55,topV-.5,v)*(1.-smoothstep(topV-.06,topV-.02,v));alb=mix(alb,vec3(.55,.14,.1),fz2*.9);float md=step(.5,fract(u/.6))*smoothstep(topV-.05,topV,v)*(1.-smoothstep(topV+.06,topV+.12,v));alb=mix(alb,vec3(.9,.87,.8),md*dfar);}if(bGar>.5&&v<topV&&v>topV-1.1){float fz3=smoothstep(topV-.98,topV-.92,v)*(1.-smoothstep(topV-.06,topV-.02,v));float gu=fract(u/1.5)-.5;float yc=topV-.34-.36*(1.-4.*gu*gu);float lw=1.-smoothstep(.065,.065+aa*3.,abs(v-yc));vec3 gl=mix(vec3(.18,.3,.12),vec3(.3,.42,.16),h12(floor(vec2(u,v)*9.)));float rb=step(.46,abs(gu))*step(topV-.62,v)*step(v,topV-.2);
  alb=mix(alb,vec3(.87,.82,.68),fz3*.95);alb=mix(alb,gl,lw*fz3*dfar);alb=mix(alb,vec3(.6,.12,.1),rb*fz3*dfar);}
 if(bShr>.5&&v<gH&&v>.3){float bw0=(bArc>.5||bGAr>.5)?4.6:3.+fract(seed*5.1);float nb0=max(1.,floor(L/bw0+.3));float bay0=L/nb0;float db0=floor(fract(seed*11.3)*nb0);float sb0=db0+1.>nb0-.5?db0-1.:db0+1.;
  if(sb0>-.5&&sb0<nb0-.5){vec2 qs=vec2(u-(sb0+.5)*bay0,v-1.2);float hS=.4;float inS=step(abs(qs.x),hS)*step(0.,qs.y)*clamp(step(qs.y,.95)+step(length(vec2(qs.x,qs.y-.95)),hS),0.,1.);float fmS=step(abs(qs.x),hS+.1)*step(-.1,qs.y)*clamp(step(qs.y,.95)+step(length(vec2(qs.x,qs.y-.95)),hS+.1),0.,1.);
   alb=mix(alb,vec3(.6,.56,.47),fmS*dfar);alb=mix(alb,vec3(.1,.2,.48),inS*dfar);float fgS=clamp(step(abs(qs.x),.09)*step(.15,qs.y)*step(qs.y,.7)+step(length(qs-vec2(0.,.82)),.1),0.,1.);alb=mix(alb,vec3(.92,.72,.32),fgS*inS*dfar);alb=mix(alb,vec3(.6,.15,.1),step(abs(qs.y-.18),.04)*step(abs(qs.x),hS-.06)*inS*dfar);}}
 if((bNiche>.5||bMed>.5)&&nSt>1.5&&v>gH&&v<gH+sH){float bw3=3.+fract(seed*5.1);float by3=L/max(1.,floor(L/bw3+.3));float kb=floor(u/by3+.5);vec2 q2=vec2(u-kb*by3,v-(gH+sH*.48));if(bNiche>.5&&abs(mod(kb,3.)-1.)<.5&&kb>.5){float inA=clamp(step(abs(q2.x),.42)*step(-.72,q2.y)*(step(q2.y,.26)+step(length(vec2(q2.x,q2.y-.26)),.42)),0.,1.);float fr2=clamp(step(abs(q2.x),.52)*step(-.82,q2.y)*(step(q2.y,.26)+step(length(vec2(q2.x,q2.y-.26)),.52)),0.,1.);float fig=clamp(step(abs(q2.x),.1)*step(-.6,q2.y)*step(q2.y,.12)+step(length(q2-vec2(0.,.24)),.09),0.,1.);alb=mix(alb,vec3(.88,.84,.74),fr2*dfar);alb=mix(alb,vec3(.1,.2,.48),inA*dfar);alb=mix(alb,vec3(.92,.72,.32),fig*inA*dfar);}if(bMed>.5&&abs(mod(kb,3.)-2.)<.5){float dd=length(q2);float rays=step(.5,fract(atan(q2.y,q2.x)*2.546));alb=mix(alb,vec3(.9,.86,.76),step(dd,.44)*dfar);alb=mix(alb,vec3(.86,.66,.28),clamp(step(.36,dd)*step(dd,.44)+step(.08,dd)*step(dd,.3)*rays,0.,1.)*dfar);}}
 // weathering: every building has an age from its seed. Old paint fades and chalks, rising damp darkens the foot (.5-1 m, ragged top, a pale salt line),
 // the eaves leave run-off streaks down the top storey, and old plaster falls off in patches that show the brick (facades.md: 60 % poor, 25 % mid, 5 % rich)
 float age=fract(seed*23.71+.37*fract(seed*3.3));age=age*age*(3.-2.*age);
 {float lum=dot(alb,vec3(.3,.59,.11));alb=mix(alb,mix(vec3(lum),alb,.7)*vec3(1.03,1.,.94)+.02,age*.55);alb*=1.-.1*age*smoothstep(.4,.7,big);}
 if(v>0.&&v<1.4){float dh=.45+.5*age+.35*(fbm2(vec2(u*.45,seed*9.))-.5);float dm=1.-smoothstep(dh-.06,dh+.06,v);float tide=(1.-smoothstep(0.,.05+aa,abs(v-dh-.03)))*dfar;
  alb=mix(alb,alb*vec3(.7,.72,.67),dm*(.5+.25*age+.25*uWet));alb=mix(alb,vec3(.86,.84,.78),tide*.22*(.4+age));}
 {float dE=topV-v;if(dE>0.&&dE<5.){float fe=fbm2(vec2(u*1.7+seed*17.,dE*.25+seed*3.));alb*=1.-.26*smoothstep(.42,.7,fe)*(1.-smoothstep(.2,1.6+2.4*age,dE))*(.35+.75*age);}}
 if(P<.5&&v>.2&&v<topV&&age>.6){float pn=fbm2(vec2(u,v)*.7+seed*19.)+.1*(1.-smoothstep(.2,1.2,min(u,L-u)))+.1*(1.-smoothstep(.5,2.5,v));float thr=1.18-.4*age;
  float pm=smoothstep(thr,thr+.02+aa*2.,pn);float rim=smoothstep(thr-.015,thr,pn)*(1.-pm);
  if(pm+rim>.001){float row=floor(v/.072);float mo=1.-smoothstep(.0,.004+aa,abs(fract(v/.072)-.5)*.072-.02);vec3 bc=vec3(.47,.22,.13)*(.78+.38*h12(vec2(floor(u/.3+fract(row*.5)),row)+seed));
   alb=mix(alb,alb*.85,rim);alb=mix(alb,mix(mix(bc,vec3(.6,.55,.46),mo*.8),vec3(.5,.28,.18),smoothstep(.012,.035,aa)),pm);}}
 S.alb=alb;S.rough=.92-uWet*.4;
 if(bBlank>.5||v>topV||si>=nSt)return;
 bool inwardTown=mod(floor(fl/262144.),2.)>.5; // Elite courtyard-house profile, scoped to this district.
 bool residential=P<.5||(P>8.5&&P<9.5);
 bool top=si>nSt-1.5;
 float winT=mod(sty,8.),grT=floor(sty/8.);
 // Residential arcades are generated as real gallery geometry by houseShell.
 // Keep legacy analytic arches for non-residential facades only.
 bool arcLevel=bArc>.5&&!residential;
 float bayW=arcLevel?4.8:(!residential&&bGAr>.5)?4.6:inwardTown?4.5+fract(seed*5.1)*1.5:3.+fract(seed*5.1);float nb=max(1.,floor(L/bayW+.3));float bay=L/nb;float bi=floor(u/bay);float bu=u-(bi+.5)*bay;
 if(!inwardTown&&nSt>2.5&&(P<.5||(P>8.5&&P<9.5))&&v<topV&&v>gH){if(si>nSt-1.5&&nSt<4.5&&fract(seed*3.1)<.1){float fu=joint(u+fract(seed*9.)*1.7,1.6,.07,aa),fv=max(joint(sv,sHl,.1,aa),joint(sv+sHl*.5,sHl,.05,aa));vec3 mud=vec3(.82,.74,.6)*(.88+.2*big);S.alb=mix(mud,vec3(.46,.33,.2),max(fu,fv)*.72);}else if(si<1.5&&fract(seed*7.7)<.45){float bb=1.-step(.95,sv);float bal=step(.5,fract(u/.28));S.alb=mix(S.alb,mix(vec3(.5,.36,.22),vec3(.62,.47,.3),bal),bb*.8);}}
 float hw=0.,oh=0.,sill=0.,ar=0.,dep=.25,kind=-1.,shopHw=0.,shopOh=0.;
 float wsd=h12(vec2(bi+seed*97.,si+seed*31.)),wsdS=wsd;if(mod(floor(fl/524288.),2.)>.5&&si>.5)wsd=1.;   // geometric-window wall (romanFrontRelief): every upper bay has its window
 if(arcLevel){kind=2.;hw=bay*.31;float hh=si<.5?gH:sHl;oh=hh*.8;ar=1.;dep=2.4;}
 else if(si<.5){float doorBay=floor(fract(seed*11.3)*nb);bool isDoor=bDoor>.5&&abs(bi-doorBay)<.5;
  if(bGAr>.5&&!residential){kind=2.;hw=min(bay*.32,1.7);oh=min(gH-.5,2.9);ar=1.;dep=2.2;}
  else if(grT>.5&&grT<1.5){kind=2.;hw=min(bay*.34,1.6);oh=min(gH-.45,2.1+hw);ar=1.;dep=1.4;}
  else if(grT>1.5&&grT<2.5){kind=3.;hw=min(bay*.38,1.5);oh=min(gH-.6,2.6);ar=step(.55,fract(seed*4.1));dep=.6;
   if(ar<.5&&gH-oh>1.3){shopHw=hw;shopOh=oh;if(sv>oh+.3){kind=0.;hw=.3;sill=oh+.45;oh=.55;dep=.3;}}}   // 【史】a small window over the lintel lights the pergula, the shopkeeper's loft (Ostia, Herculaneum, Trajan's Market)
  else if(grT>2.5){if(isDoor){kind=1.;hw=.75;oh=2.7;ar=1.;dep=.5;}}
  else{if(isDoor){kind=1.;hw=.6;oh=2.3;ar=step(.5,fract(seed*8.7));dep=.45;}else if(wsd>.35){kind=0.;hw=.3;oh=.6;sill=gH-1.25;}}}
 else{if(bLog>.5&&top&&!residential){kind=4.;float sb=bay*.5;bu=u-(floor(u/sb)+.5)*sb;hw=min(sb*.36,1.1);sill=.85;oh=sHl-1.2;ar=1.;dep=1.8;}
  else if(wsd>.15){kind=0.;hw=.36+.12*fract(seed*5.3);oh=1.05+.3*fract(seed*1.9);sill=.95;
   ar=((winT>.5&&winT<1.5)||(winT>3.5&&winT<4.5)||winT>6.5)?1.:0.;
   if((winT>2.5&&winT<3.5)||top){hw=.3;oh=.75;sill=1.;ar=0.;}
   if(winT>4.5&&winT<5.5&&si<1.5){oh=1.8;hw=.48;sill=.55;ar=1.;}}}
 if(!inwardTown&&kind>-.5&&kind<.5&&nSt>2.5&&si>.5&&si<1.5&&!(bLog>.5&&top)){hw=max(hw,.5);oh=max(oh,1.55);sill=min(sill,1.05);ar=1.;}
 if(inwardTown&&kind>-.5&&kind<.5){ar=0.;hw=min(hw,.38);oh=min(oh,1.15);if(si>.5&&wsd<.38)kind=-1.;}
 if(kind>-.5&&kind<.5&&si>.5&&fract(seed*3.9)<.18&&P<.5&&(top||si<1.5)){hw=min(bay*.36,1.25);oh=max(oh,1.7);ar=1.;sill=min(sill,.8);}
 if(shopHw>0.){float spz=shopOh+.24,s2=shopHw+.25,Rr=(s2*s2+.7225)/1.7;vec2 ad=vec2(bu,sv-(spz+.85-Rr));float r=length(ad),an=atan(ad.x,ad.y)*Rr/.26;   // brick relieving arch over lintel and loft window
  float ring=smoothstep(Rr-aa,Rr+aa,r)*(1.-smoothstep(Rr+.22-aa,Rr+.22+aa,r))*step(spz,sv);
  S.alb=mix(S.alb,vec3(.42,.23,.15)*(.82+.2*h12(vec2(floor(an),bi)+seed))*(1.-.4*step(.86,fract(an))),ring*.95*dfar);}
 if(kind<0.||(uDbg.w>.5&&uDbg.w<1.5))return;
 if(bTap>.5&&si>2.5&&kind>-.5&&kind<.5){float kh=sHl/sH;sill*=kh;oh=min(oh*kh,sHl-sill-.4);hw*=si<3.5?.88:si<4.5?.78:.7;}   // the low top storeys: smaller, narrower windows
 vec2 q=vec2(bu,sv-sill);float ins=openM(q,hw,oh,ar,aa);
 if(bVou>.5&&ar>.5&&si<.5){float ro=clamp(openM(q+vec2(0.,.03),hw+.3,oh+.3,ar,aa)-openM(q,hw+.015,oh+.015,ar,aa),0.,1.);float an=atan(q.x,q.y-(oh-hw));float vs=step(.5,fract(an*5.7))*.14;float onA=smoothstep(oh-hw-.05,oh-hw+.05,q.y);S.alb=mix(S.alb,vec3(.74,.68,.56)*(1.-vs*onA),ro*.95*dfar);}
 if(kind<.5){if(bFrame>.5||winT>6.5||(winT>1.5&&winT<2.5)){float fr=clamp(openM(q+vec2(0.,.13),hw+.14,oh+.26,ar,aa)-ins,0.,1.);vec3 frc=P<.5?vec3(.66,.38,.25):vec3(.58,.54,.46);S.alb=mix(S.alb,frc*(.9+.1*big),fr*.9);}if(bFrame>.5&&si>.5){float py=q.y-(oh+.16);float pw=(hw+.24)*(1.-py/.4);vec3 frc2=P<.5?vec3(.68,.4,.27):vec3(.85,.8,.7);S.alb=mix(S.alb,frc2,step(0.,py)*step(py,.4)*step(abs(q.x),pw)*.85);}
  float sl=step(abs(q.x),hw+.14)*smoothstep(-.14-aa,-.14+aa,q.y)*(1.-smoothstep(-aa,aa,q.y));S.alb=mix(S.alb,vec3(.78,.73,.63),sl*.85);}
 if(kind>1.5&&kind<2.5&&!residential&&(bArc>.5||bGAr>.5)){float pil=1.-smoothstep(.0,aa+.02,abs(abs(bu)-bay*.5)-.28);S.alb=mix(S.alb,S.alb*1.08,pil);}
 if(kind>-.5&&kind<.5&&ar>.5&&P<.5&&fract(seed*5.7)<.4){float er=clamp(openM(q+vec2(0.,.06),hw+.12,oh+.18,ar,aa)-openM(q,hw+.03,oh+.03,ar,aa),0.,1.);S.alb=mix(S.alb,vec3(.6,.2,.13),er*.9);}
 if(kind>.5&&kind<1.5&&P<.5&&fract(seed*8.1)<.25){float pn=step(abs(q.x),.62)*step(oh+.2,q.y)*step(q.y,oh+.72);float ink=step(.5,fract(q.x*5.))*step(abs(q.y-oh-.46),.08);S.alb=mix(S.alb,mix(vec3(.85,.8,.7),vec3(.55,.12,.08),ink),pn*.95);}
 if(kind<.5){float sy=-q.y-.14;if(sy>0.){float fib=vn2(vec2(q.x*7.+seed*40.,sy*.9+seed*7.));   // rain washes the sill dirt down the wall: streaks under each window, longer on older houses
  S.alb*=1.-.3*(1.-smoothstep(.6,1.05,abs(q.x)/(hw+.1)))*(1.-smoothstep(.15,.7+.6*age,sy))*(.35+.85*smoothstep(.3,.75,fib))*(.45+.7*age);}}
 if(ins<.01||uDbg.w>1.5)return;
 vec3 T=normalize(vec3(-N.z,0.,N.x)+1e-4);vec3 Up=vec3(0.,1.,0.);vec3 V=normalize(vWP-cameraPosition);
 float vt=dot(V,T),vu=dot(V,Up),vnn=min(dot(V,N),-.06);float t=dep/(-vnn);vec2 qb=q+vec2(vt,vu)*t;
 float back=openM(qb,hw,oh,ar,aa*2.+.01);
 float glz=step(h12(vec2(bi*3.1+seed*11.,si*7.7+seed)),uGlass);float rnd=h12(vec2(bi*1.7+seed*5.,si*2.3+seed*3.));float lit=step(rnd,uLit*litB*(si<.5?.55:mix(.07,.55,uGlass)));float flk=.78+.22*sin(uTime*7.+seed*30.+bi*1.7);
 bool archInterior=ar>.5||kind>3.5; if(archInterior)dep=min(dep,.8);
 vec3 inter;vec3 em=vec3(0.);vec3 lamp=vec3(1.,.42,.13);
 if(kind<.5&&!archInterior){float sh=bShut*step(.45,fract(wsdS*7.3))*(1.-glz);vec3 wc=(fract(seed*13.37)<.5)?vec3(.1,.15,.1):vec3(.17,.1,.05);
  inter=mix(vec3(.27,.2,.125)*(.88+.24*smoothstep(-1.,1.2,qb.y)),wc*1.5,sh);S.rough=1.;   // flat dark warm void (sRGB ~40/34/30): one soft vertical gradient, a shutter as a flat shape, no per-pixel hash
  if(glz>.5){float fr=pow(1.-abs(vnn),4.);inter=mix(vec3(.07,.08,.09),uSkyRefl,.3+.6*fr);S.rough=.08;}
  em=lamp*lit*uNight*(glz>.5?2.4:(sh>.5?.14:.5))*flk*back;}
 else if(kind<1.5&&!archInterior){inter=vec3(.15,.08,.04)*(.8+.2*step(.5,fract(qb.x*3.)));em=lamp*lit*uNight*.45*flk*back;}
 else if(archInterior){
  // Analytic shallow gallery: the viewing ray hits a rear wall, a return, the floor or the soffit.
  // Unlike a repeated black arch mask, the rear wall is closed and rectangular.
  float txG=abs(vt)>.0001?max(0.,((vt>0.?hw:-hw)-q.x)/vt):1e5;
  float tyG=abs(vu)>.0001?max(0.,((vu>0.?oh:0.)-q.y)/vu):1e5;
  float hitG=min(t,min(txG,tyG));vec2 hit=q+vec2(vt,vu)*hitG;
  bool rear=t<=min(txG,tyG);bool sideHit=txG<tyG;bool floorHit=!rear&&!sideHit&&vu<0.;
  back=rear?1.:0.;
  vec3 plaster=vec3(.43,.39,.33)*(.94+.08*vn2(hit*3.+seed));
  vec3 corridor=sideHit?vec3(.33,.30,.25):(floorHit?vec3(.40,.35,.28):vec3(.39,.36,.31));
  float floorJoint=max(joint(hit.x,1.,.015,aa),joint(hit.y,.65,.015,aa));
  if(floorHit)corridor*=1.-floorJoint*.16;
  float door=step(.72,fract(seed*31.7))*step(abs(hit.x),.24)*step(.08,hit.y)*step(hit.y,min(2.05,oh-.15));
  float doorFrame=door*(1.-step(abs(hit.x),.18));
  inter=rear?plaster:corridor;
  if(rear){inter=mix(inter,vec3(.20,.14,.09),door);inter=mix(inter,vec3(.52,.46,.36),doorFrame*.75);}
  em=lamp*lit*uNight*.7*flk*back*step(qb.y,2.6);}
 else if(kind<2.5){inter=S.alb*.44;em=lamp*lit*uNight*.7*flk*back*step(qb.y,2.6);}
 else if(kind<3.5){   // a square-headed shop: closed with its boards in the threshold groove, or a trade on the back wall (briefs/rome/ground-floor.md)
  float tr=h12(vec2(bi*5.3+seed*17.,seed*3.7)),tc=h12(vec2(bi*2.9+seed*7.,seed*11.)),dq=1.-smoothstep(.015,.045,aa);bool shut=tc<.14+.55*uNight;
  vec3 it;vec3 wd=vec3(.3,.18,.09);
  if(shut){it=vec3(.16,.12,.08);float pk=(q.x+hw)/.3;it=wd*(.8+.3*h12(vec2(floor(pk),seed)))*(1.-.6*step(.42,abs(fract(pk)-.5))*dq);it*=1.-.45*step(abs(q.y-1.1),.06);back=1.;}
  else it=shopGoods(qb,tr,seed,dq);
  inter=it;em=shut?vec3(0.):lamp*lit*uNight*1.5*flk*back*step(fract(rnd*7.3),.22);}
 else{inter=S.alb*.46;em=lamp*lit*uNight*.8*flk*back;}
 vec3 revN=N;if(back<.5){float tx=((vt>0.?hw:-hw)-q.x)/(abs(vt)>1e-4?vt:1e-4);float ty=((vu>0.?oh:0.)-q.y)/(abs(vu)>1e-4?vu:1e-4);revN=(tx<ty)?(vt>0.?-T:T):(vu>0.?-Up:Up);}
 if(archInterior){S.bounce=.24;S.nw=revN;S.useN=1.;}
 S.alb=mix(S.alb,archInterior?inter:mix(S.alb*.9,inter,back),ins);S.emit=em*ins;
 S.ao=mix(1.,archInterior?mix(.86,.72,back):mix(.6,.32,back),ins);}
`;
const CITY_S=`
float P=vB.y;float seed=floor(vB.x*4096.+.5)/4096.;vec3 N=normalize(vWN);vec2 uv=vA.xy;float aa=max(fwidth(uv.x),fwidth(uv.y))*1.2+.002;
if(P<.5||(P>8.5&&P<9.5)||(P>23.5&&P<24.5)||(P>29.5&&P<30.5))wallS(S,N,P,aa);
else if(P<1.5)roofS(S,N,0.,aa);
else if(P<2.5){S.alb=stoneC(uv,seed,vec3(.62,.54,.42),1.2,.55,aa);S.rough=.86;}
else if(P<3.5){S.alb=vec3(.2,.12,.07)*(.8+.4*fbm2(vec2(uv.x*6.,uv.y*.5)));S.rough=.8;}
else if(P<4.5){S.alb=mix(roofCol(seed)*.85,vec3(.72,.67,.58),.22)*(.85+.2*vn2(uv*3.));S.rough=.8;}
else if(P<5.5){S.alb=vec3(.56,.5,.4)*(.8+.3*fbm2(uv*.7));S.rough=.9;}
else if(P<6.5){S.alb=marbleC(vWP,seed);float j=max(joint(uv.y,.9,.006,aa),joint(uv.x+fract(floor(uv.y/.9)*.5)*1.8,1.8,.006,aa));S.alb*=1.-.1*j;S.rough=.42;}
else if(P<7.5){S.alb=vec3(.15,.13,.11);S.rough=1.;}
else if(P<8.5){float k=fract(seed*3.3);vec3 c=k<.3?vec3(.78,.72,.58):k<.5?vec3(.7,.47,.1):k<.7?vec3(.46,.11,.07):k<.85?vec3(.5,.36,.17):vec3(.36,.19,.3);   // undyed linen, saffron, madder red, ochre, faded purple
 c=mix(c,min(c*1.35+.06,vec3(1.)),step(.5,fract(uv.x/.55))*step(.4,fract(seed*7.)));S.alb=c;S.rough=.9;S.emit=c*max(dot(-N,uSunDir),0.)*.25*uSunCol*(1.-uNight);}
else if(P<10.5){vec2 p=vWP.xz*1.4;vec2 ip=floor(p),fp=fract(p);float m1=8.,m2=8.;vec2 id=ip;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j);vec2 o=vec2(h12(ip+g),h12(ip+g+17.3));vec2 r=g+o-fp;float d=dot(r,r);if(d<m1){m2=m1;m1=d;id=ip+g;}else if(d<m2)m2=d;}
 float e=sqrt(m2)-sqrt(m1);float far=smoothstep(.03,.1,aa);vec3 c=vec3(.2,.19,.18)*(.72+.5*h12(id));
 S.alb=mix(c*mix(.5,1.,smoothstep(0.,.07,e)),vec3(.22,.2,.18),far);S.rough=.72-uWet*.5;}
else if(P<11.5){vec2 p=vWP.xz;float row=floor(p.y/2.);float j=max(joint(p.y,2.,.012,aa),joint(p.x+fract(row*.5)*3.6,3.6,.012,aa));   // paving of squares and forecourts: large warm beige-grey slabs (sRGB ~196/186/168)
 vec3 c=vec3(.55,.49,.395)*(.88+.18*h12(vec2(floor(p.x/3.6+fract(row*.5)),row)))*(.92+.12*fbm2(p*.4));S.alb=c*(1.-.25*j);S.rough=.75-uWet*.5;}
else if(P<12.5)roofS(S,N,1.,aa);
else if(P<13.5){S.alb=mix(vec3(.4,.26,.14),vec3(.2,.4,.32),smoothstep(.45,.75,fbm3(vWP*.5)));S.metal=.8;S.rough=.45;}
else if(P<14.5){vec3 c=vec3(.6,.575,.52)*(.86+.22*fbm2(uv*.3));c*=1.-.12*joint(uv.y,.6,.008,aa);c*=mix(1.,.8,smoothstep(.6,.9,fbm2(vec2(uv.x*.8,uv.y*.1))));S.alb=c;S.rough=.85;}
else if(P<15.5){vec2 q=uv;float r=length(q);float an=atan(q.y,q.x);float seg=floor((an+3.1416)/6.2832*16.);float ring=floor(r/.9);
 vec3 c=vec3(h12(vec2(seg,ring)),h12(vec2(seg,ring)+3.),h12(vec2(seg,ring)+7.));c=mix(vec3(.15,.2,.6),vec3(.8,.15,.1),step(.5,c.x))*.6+c*.4;
 if(r<1.2&&vC.z>.5)c=vec3(.95,.12,.06);float lead=max(1.-smoothstep(0.,.06,abs(fract(r/.9)-.5)*.9-.4),1.-smoothstep(0.,.05,abs(fract((an+3.1416)/6.2832*16.)-.5)-.45));
 c*=1.-.85*lead;S.alb=c*.18;S.rough=.2;S.emit=c*(.12+uNight*3.);}
else if(P<16.5){S.alb=vec3(.33,.34,.35)*(.85+.25*fbm2(uv*.5));S.metal=.3;S.rough=.55;}
else if(P<17.5){S.alb=mix(vec3(.85,.45,.26),vec3(.3,.55,.45),smoothstep(.55,.8,fbm3(vWP*.4))*.6);S.metal=1.;S.rough=.35;}
else if(P<18.5){S.alb=mix(vec3(.12,.11,.1),vec3(.4,.17,.07),uRust*vC.z+smoothstep(.6,.9,fbm3(vWP*.6))*.3);S.metal=.5;S.rough=.6;}
else if(P<19.5){S.alb=vec3(.05);S.emit=vec3(5.,1.6,.4)*(.7+.3*sin(uTime*6.+vWP.x*.3+vWP.z*.2));}
else if(P<20.5){S.alb=vec3(.035,.033,.03)*(.8+.4*vn2(uv*2.));S.rough=.95;}
else if(P<21.5){S.alb=vec3(.3,.24,.16)*(.75+.4*fbm2(uv*1.5));S.rough=.95;}
else if(P<22.5){S.alb=stoneC(uv,seed,vec3(.61,.52,.37),1.4,.62,aa);S.rough=.9;}
else if(P<23.5){vec2 pz=vWP.xz;vec3 g=vec3(.08,.13,.045)*(.7+.5*fbm2(pz*.25));g=mix(vec3(dot(g,vec3(.3,.59,.11))),g,.8);   // a garden, not a lawn: yellow-green patches and a few worn bare spots
  g=mix(g,g*vec3(1.4,1.1,.75),smoothstep(.45,.72,fbm2(pz*.09+7.))*.7);g=mix(g,vec3(.22,.17,.1)*(.85+.3*vn2(pz*2.)),smoothstep(.66,.8,fbm2(pz*.4+3.))*.55);S.alb=g+vec3(.3,.2,.25)*step(.92,vn2(pz*3.))*.3;S.rough=.95;}
else if(P<25.5){S.alb=vec3(.45,.25,.21)*(.85+.25*vn2(uv*20.));S.rough=.4;}
else if(P<26.5){S.alb=vec3(.69,.615,.49)*mix(.7,1.,step(.45,fract(uv.y/.8)))*(.9+.15*fbm2(uv*.5));S.rough=.85;}
else if(P<27.5){S.alb=vec3(.66,.55,.38)*(.85+.2*fbm2(vWP.xz*.3));S.rough=.95;}
else if(P<28.5){S.alb=vec3(1.,.74,.34);S.metal=1.;S.rough=.28;}
else if(P>43.5&&P<44.5){ // Physical residential gallery: subdued plaster, with a slight lift under roofs and at the inner wall.
 float up=max(N.y,0.),side=1.-abs(N.y);vec3 c=mix(vec3(.48,.43,.35),vec3(.56,.51,.43),up*.34+side*.12);
 S.alb=c*(.96+.04*vn2(vWP.xz*1.7+seed));S.rough=.94;S.ao=.9;S.bounce=.24;
}
else if(P>44.5&&P<45.5){ // Gallery room doors: readable medium warm timber, matte and non-emissive.
 S.alb=vec3(.34,.19,.085)*(.94+.06*vn2(vWP.xz*3.+seed));S.rough=.9;S.ao=.9;S.bounce=.18;
}
else if(P>42.5&&P<43.5){roofS(S,N,0.,aa);S.alb*=vec3(1.,.82,.76);} // warm red tile for elite courtyard wings (roofCol is already saturated)
else if(P>38.5&&P<39.5){S.alb=vec3(.43,.38,.30)*(.94+.08*vn2(uv*2.));S.rough=1.;S.ao=.9;S.bounce=.24;}   // open loggia interior: dark recess (sRGB ~45/38/34)
else if(P>40.5&&P<41.5){S.alb=vec3(.1,.088,.07)*(.85+.3*vn2(vWP.xz*2.5));S.rough=.9;}   // drain line on the axis of a main street
else if(P>41.5&&P<42.5){S.alb=vec3(.2,.165,.125)*(.85+.3*vn2(vWP.xz*3.));S.rough=.8;}   // wheel ruts
else if(P>39.5&&P<40.5){S.alb=vec3(.061,.065,.038)*(.88+.24*vn2(vWP.xz*3.+vWP.y*2.));S.metal=.35;S.rough=.6;}   // dark bronze statuary (sRGB ~70/72/55)
else if(P>30.5&&P<31.5){vec2 p=vWP.xz;float n=fbm2(p*.08),pud=smoothstep(.6,.68,fbm2(p*.03+7.)),lime=smoothstep(.74,.8,vn2(p*.11));vec3 c=mix(vec3(.16,.14,.11),vec3(.27,.23,.17),n);c=mix(c,vec3(.6,.58,.52),lime*.45);S.alb=mix(c,vec3(.04,.04,.045),pud*.75);S.rough=mix(.95,.05,pud);}
else if(P>32.5&&P<33.5){S.alb=stoneC(uv,seed,vec3(.51,.455,.36),1.15,.56,aa);S.rough=.9;}
else if(P>33.5&&P<34.5){vec2 g2=floor(uv/1.2);float k=h12(g2+seed);vec3 c1=k<.34?vec3(.86,.84,.8):k<.56?vec3(.74,.63,.42):k<.78?vec3(.84,.8,.79):vec3(.43,.31,.29);   // under porticoes and in porches: low-saturation coloured marble squares (white, giallo antico, pavonazzetto, a dark grey-red)
 c1=mix(c1,vec3(.5,.36,.46),step(.56,k)*step(k,.78)*(1.-smoothstep(.0,.05,abs(sin(uv.x*2.1+uv.y*1.3+fbm2(uv*.8)*5.)))));float jn=max(joint(uv.x,1.2,.01,aa),joint(uv.y,1.2,.01,aa));S.alb=c1*(1.-.25*jn);S.rough=.35;}
else if(P>34.5&&P<35.5){float k=fract(seed*7.7);S.alb=k<.5?vec3(.56,.15,.1):k<.8?vec3(.72,.52,.22):vec3(.13,.12,.11);S.rough=.5;}
else if(P>37.5&&P<38.5){S.alb=stoneC(uv,seed,vec3(.3,.265,.22),1.3,.5,aa)*(.9+.2*vn2(uv*2.));S.rough=.9;}
else if(P>36.5&&P<37.5){S.alb=stoneC(uv,seed,vec3(.38,.33,.26),1.6,.75,aa);S.rough=.8;}
else if(P>35.5&&P<36.5){S.alb=vec3(.427,.389,.31)*(.95+.1*fbm2(vWP.xz*.5));S.rough=.85;}
else if(P>31.5&&P<32.5){S.alb=vec3(.15,.11,.085)*(.8+.3*vn2(uv*2.));S.rough=.95;}
else if(P>49.5&&P<50.5){vec2 p=uv;float pw=vA.z,ph=vA.w,t=ph-p.y;   // 【史】painted election notice (programma): red letters on a whitewashed panel
 vec3 c=vec3(.7,.67,.6)*(.9+.12*vn2(p*5.+seed*9.));float r0=t<.24?0.:floor((t-.24)/.15)+1.,ry=t<.24?(t-.05)/.15:fract((t-.24)/.15)/.7,cw=r0<.5?.075:.055,cx=p.x-.06,fx=fract(cx/cw),hh=h12(vec2(floor(cx/cw),r0)+seed*31.);
 float g=max(step(abs(fx-.3),.1),step(.55,fract(hh*7.))*step(abs(ry-(fract(hh*3.)<.5?.1:.9)),.12)*step(fx,.75));
 float m=step(.14,hh)*step(0.,cx)*step(cx,pw-.12)*step(0.,ry)*step(ry,1.)*step(r0,2.5)*g;c=mix(c,vec3(.5,.08,.05),m*(1.-smoothstep(.01,.03,aa)));c=mix(c,c*vec3(1.,.86,.83),smoothstep(.01,.03,aa)*.5);S.alb=c;S.rough=.85;}
else if(P>50.5&&P<51.5){float w=max(vA.z,.5),h=max(vA.w,1.),hw=w*.5;vec2 q=vec2(uv.x-hw,uv.y);   // 【史】a shop let in a house front (taberna): the room behind the door by parallax, or its night boards
 vec3 T=normalize(vec3(-N.z,0.,N.x)+1e-4),V=normalize(vWP-cameraPosition);float vt=dot(V,T),vu=V.y,vnn=min(dot(V,N),-.06),tb=3.2/(-vnn);vec2 qb=q+vec2(vt,vu)*tb;
 float dq=1.-smoothstep(.015,.045,aa),tr=h12(vec2(seed*41.3,7.1)),tc=h12(vec2(seed*13.1,2.3));bool shut=tc<.14+.55*uNight;vec3 wd=vec3(.3,.18,.09),c;
 if(shut){float pk=(q.x+hw)/.3;c=wd*(.8+.3*h12(vec2(floor(pk),seed)))*(1.-.6*step(.42,abs(fract(pk)-.5))*dq);c*=1.-.45*step(abs(q.y-1.1),.06);S.ao=1.;}
 else if(abs(qb.x)<hw&&qb.y>0.&&qb.y<h){c=shopGoods(qb,tr,seed,dq);S.ao=.8;}
 else{float tx=((vt>0.?hw:-hw)-q.x)/(abs(vt)>1e-4?vt:1e-4),ty=((vu>0.?h:0.)-q.y)/(abs(vu)>1e-4?vu:1e-4),f=clamp(min(tx,ty)/tb,0.,1.);
  c=tx<ty?vec3(.3,.25,.18):(vu>0.?vec3(.16,.11,.07):vec3(.28,.25,.2));c*=1.-.45*f;S.ao=.8;}
 if(!shut){S.nw=-N;S.useN=1.;}   // the room is in shade: no direct sun on what is seen through the door
 S.alb=c;S.rough=.95;S.emit=shut?vec3(0.):c*vec3(1.7,.95,.42)*step(h12(vec2(seed*7.7,1.3)),uLit*.6)*uNight*(.82+.18*sin(uTime*7.+seed*30.));}   // a lamp inside lights the room's own colours
else if(P>45.5&&P<46.5){vec2 p=vWP.xz;S.alb=vec3(.36,.26,.19)*(.82+.3*fbm2(p*.4))*(1.-.12*smoothstep(.6,.8,fbm2(p*.08)));S.rough=.9;}   // roof terrace of opus signinum: matte brick-red crushed-tile concrete
else if(P>46.5&&P<47.5){S.alb=stoneC(uv,seed,vec3(.47,.43,.33),1.2,.6,aa)*(.9+.16*vn2(uv*5.));S.rough=.93;}   // tuff ashlar (opus quadratum): 2 x 4 ft blocks, grey-yellow and porous (old temple podiums)
else if(P>47.5&&P<48.5){S.alb=stoneC(uv,seed,vec3(.66,.61,.5),1.5,.6,aa)*(1.-.13*smoothstep(.55,.8,vn2(vec2(uv.x*1.6,uv.y*13.))));S.rough=.8;}   // travertine ashlar: warm cream with fine horizontal pits
else if(P>48.5&&P<49.5){float row=floor(uv.y/.6);vec2 id=vec2(floor(uv.x/1.2+fract(row*.5)),row);float j=max(joint(uv.y,.6,.008,aa),joint(uv.x+fract(row*.5)*1.2,1.2,.008,aa));   // open courts: white marble / travertine slabs 1.2 x 0.6 m, broken joints
 S.alb=vec3(.7,.675,.61)*(.9+.12*h12(id+seed))*(.94+.08*fbm2(uv*.3))*(1.-.3*j);S.rough=.55-uWet*.3;}
else if(P>59.5&&P<62.5){float k=floor(vB.z+.5);   // hill palette (hillPal in terrace-edge.js; the author, 2026-11-04: one wall stone and one rock per hill), index in sty: 0 Capitoline, 1 Palatine, 2 the rest
 vec3 wc=k<.5?vec3(.307,.293,.266):k<1.5?vec3(.366,.328,.274):vec3(.4,.37,.31),rc=k<.5?vec3(.47,.43,.32):k<1.5?vec3(.355,.305,.228):vec3(.42,.38,.3);
 if(P<60.5){float big=step(.5,vB.w);vec3 c=stoneC(uv,seed,wc,mix(1.2,1.8,big),mix(.6,.9,big),aa);   // 60 terrace wall: opus quadratum, 2 x 4 ft blocks; fl 1 = the plinth course of big blocks
  c*=1.-.16*step(.8,vn2(uv*9.+seed*7.))*step(k,.5);S.alb=c*(.93+.1*fbm2(vWP.xz*.05+vWP.y*.04));S.rough=.9;}   // peperino ('peppered'): dark specks
 else if(P<61.5){vec3 p=vWP;float bed=fract((p.y+p.x*.07+p.z*.05+fbm2(p.xz*.07)*1.1)/1.55),jt=abs(fract((p.x*.6+p.z*.8)/3.8+fbm2(p.xz*.05+3.)*.6)-.5);   // 61 rock: bedding a few degrees off level, joints every 3-5 m
  vec3 c=rc*(.8+.32*fbm2(p.xz*.3+p.y*.25));c*=1.-.3*(1.-smoothstep(0.,.08,bed))-.1*smoothstep(.82,1.,bed);c*=1.-.32*(1.-smoothstep(0.,.035,jt));
  c=mix(c,vec3(.13,.16,.065)*(.8+.4*fbm2(p.xz*.6)),smoothstep(.6,.9,N.y)*.7);S.alb=c;S.rough=.96;}   // moss on the tops
 else{vec2 p=vWP.xz;vec3 m=vec3(.115,.145,.06)*(.75+.5*fbm2(p*.8));S.alb=mix(m,rc*.55,smoothstep(.55,.78,fbm2(p*.35+4.))*.45);S.rough=.97;}}   // 62 moss and grass at the wall foot
else{S.alb=vec3(.86,.87,.85);S.rough=.25;}
S.alb*=1.-.42*uBurn*vC.z;
`;
const MAT={};
// translucent ground decals (wheel ruts): vA.x = 0 at the edge .. 1 on the centre line, vA.y = fade at the run ends
MAT.cityDecal=procMat({key:'cityDecal',vHead:'attribute vec4 aA;varying vec4 vA;',vBody:'vA=aA;',fHead:'varying vec4 vA;',
  fSurf:'float e=smoothstep(0.,1.,vA.x),en=smoothstep(.5,1.,vA.y);S.alb=vec3(.05,.042,.032);S.rough=.95;S.a=.19*e*en*(.75+.5*vn2(vWP.xz*1.7));',
  params:{transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4},env:.4});
MAT.city=procMat({key:'city',vHead:'attribute vec4 aA;attribute vec4 aB;attribute vec4 aC;varying vec4 vA;varying vec4 vB;varying vec4 vC;',
  vBody:'vA=aA;vB=aB;vC=aC;',fHead:CITY_F,fSurf:CITY_S,env:.7});

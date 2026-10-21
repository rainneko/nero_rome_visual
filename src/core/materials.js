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
  mesh(mat,shadow=true){if(!this.nv)return null;const m=new THREE.Mesh(this.geometry(),mat);m.castShadow=shadow;m.receiveShadow=true;return m;}
}
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
// facade wall from local A to B (outward = cross(up,AB)), world y0..y1, facade v from floorY
function wall(g,F,ax,az,bx,bz,y0,y1,floorY,sH){const A0=F.p(ax,y0,az),B0=F.p(bx,y0,bz),B1=F.p(bx,y1,bz),A1=F.p(ax,y1,az);
  const L=Math.hypot(bx-ax,bz-az),dx=B0[0]-A0[0],dz=B0[2]-A0[2],va=y0-floorY,vb=y1-floorY;
  g.poly([A0,B0,B1,A1],[dz,0,-dx],[[0,va],[L,va],[L,vb],[0,vb]],L,sH);}
function wallTri0(g,F,ax,az,bx,bz,y0,yApex,floorY,sH){const A0=F.p(ax,y0,az),B0=F.p(bx,y0,bz),M=F.p((ax+bx)/2,yApex,(az+bz)/2);
  const L=Math.hypot(bx-ax,bz-az),dx=B0[0]-A0[0],dz=B0[2]-A0[2];g.poly([A0,B0,M],[dz,0,-dx],[[0,y0-floorY],[L,y0-floorY],[L/2,yApex-floorY]],L,sH);}
// rectangle walls (4 facades). fac: {part,seed,sty,fl,nSt,gH,sH,lit,shopMask,doorSide,burn}
function rectWalls(g,F,cx,cz,w,d,y0,y1,floorY,fac,inward=false){const hw=w/2,hd=d/2;
  let C=[[cx-hw,cz-hd],[cx+hw,cz-hd],[cx+hw,cz+hd],[cx-hw,cz+hd]];if(inward)C=C.reverse();
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
      if(wallFac){g.set(wallFac.part,wallFac.seed,0,1,wallFac.nSt,wallFac.gH,wallFac.burn||0,1);
        wallTri(g,F,cx+w/2,cz+d/2,cx+w/2,cz-d/2,yT,yR,wallFac.floorY,wallFac.sH);wallTri(g,F,cx-w/2,cz-d/2,cx-w/2,cz+d/2,yT,yR,wallFac.floorY,wallFac.sH);}
    }else{const yR=yT+(w/2)*t,gz=d/2+over*.5;
      g.poly([P(ex,yE,gz),P(ex,yE,-gz),P(0,yR+.1,-gz),P(0,yR+.1,gz)],D(1,1,0));g.poly([P(-ex,yE,-gz),P(-ex,yE,gz),P(0,yR+.1,gz),P(0,yR+.1,-gz)],D(-1,1,0));
      g.set(4,seed);ridgeCap(g,P(0,yR+.1,-gz),P(0,yR+.1,gz));
      if(wallFac){g.set(wallFac.part,wallFac.seed,0,1,wallFac.nSt,wallFac.gH,wallFac.burn||0,1);
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
varying vec4 vA;varying vec4 vB;varying vec4 vC;
vec3 plasterCol(float s){float k=fract(s*7.13);vec3 c;
 if(k<.2)c=vec3(.86,.81,.7);else if(k<.36)c=vec3(.89,.85,.77);else if(k<.5)c=vec3(.83,.74,.58);else if(k<.62)c=vec3(.84,.72,.62);
 else if(k<.72)c=vec3(.8,.66,.5);else if(k<.82)c=vec3(.9,.87,.8);else if(k<.92)c=vec3(.82,.71,.52);else c=vec3(.76,.52,.4);return c*(.94+.1*fract(s*31.7));}
vec3 roofCol(float s){float k=fract(s*5.31);vec3 c;
 if(k<.3)c=vec3(.55,.21,.09);else if(k<.55)c=vec3(.49,.2,.1);else if(k<.72)c=vec3(.6,.28,.12);else if(k<.86)c=vec3(.44,.22,.13);else c=vec3(.56,.31,.16);
 {vec3 rc_=(c*(.86+.24*fract(s*17.3)));return mix(vec3(dot(rc_,vec3(.3,.59,.11))),rc_,.6)*vec3(1.36,1.3,.96);}}
float openM(vec2 q,float hw,float h,float ar,float aa){
 float m=smoothstep(-aa,aa,q.y)*smoothstep(hw+aa,hw-aa,abs(q.x))*smoothstep(h+aa,h-aa,q.y);
 if(ar>.5&&q.y>h-hw){float d=length(vec2(q.x,q.y-(h-hw)))-hw;m=smoothstep(aa,-aa,d)*smoothstep(-aa,aa,q.y);}return m;}
float joint(float x,float per,float w,float aa){float d=abs(fract(x/per+.5)-.5)*per;return (1.-smoothstep(w,w+aa+.01,d))*(1.-smoothstep(.04,.12,aa));}
vec3 stoneC(vec2 p,float s,vec3 base,float bw,float bh,float aa){float n=fbm2(p*1.3+s*9.);float row=floor(p.y/bh);
 float j=max(joint(p.y,bh,.01,aa),joint(p.x+fract(row*.5)*bw,bw,.01,aa));vec3 c=base*(.86+.24*n)*(.94+.1*h12(vec2(floor(p.x/bw+fract(row*.5)),row)+s));return c*(1.-.22*j);}
vec3 marbleC(vec3 p,float s){float n=fbm3(p*.3+s*3.);float vv=abs(sin((p.x*.7+p.y*1.1+p.z*.5)*.8+n*7.));vec3 c=vec3(.8,.765,.70)*(.94+.1*n);
 c*=1.-.1*pow(1.-vv,12.);c*=mix(1.,.84,smoothstep(.62,.86,fbm3(p*.07+s)));return c;}
void roofS(inout PS S,vec3 N,float gilt,float aa){vec2 uv=vA.xy;float seed=vB.x;float pt=.47;float col=floor(uv.x/pt);float xr=(fract(uv.x/pt)-.5)*pt;
 float cs=.42;float row=floor(uv.y/cs);float yr=fract(uv.y/cs);float th=h12(vec2(col,row)+seed*17.);
 vec3 base=gilt>.5?vec3(1.,.72,.3):roofCol(seed);float r=.09;float cov=1.-smoothstep(r-aa,r+aa,abs(xr));float det=1.-smoothstep(.05,.16,aa);
 float tilt=cov*clamp(xr/r,-1.,1.)*.95+(1.-cov)*(-sign(xr)*.2);float st=(1.-smoothstep(0.,.2,yr))*.4;
 vec3 T=normalize(vec3(-N.z,0.,N.x)+1e-4);vec3 B=normalize(cross(T,N));float fcx=1.-smoothstep(pt*.25,pt*.62,aa),fry=1.-smoothstep(cs*.25,cs*.62,aa);float sw=sin(uv.x/pt*6.2832),stp=.5+.5*cos(uv.x/pt*6.2832),crs=smoothstep(0.,.3,yr);S.nw=normalize(N+(T*tilt-B*st)*det+(T*sw*.32*fcx-B*(1.-crs)*.22*fry)*(1.-det));S.useN=1.;
 vec3 c=base*(.8+.34*th);float frs=smoothstep(2.3,3.,uSeason)*(1.-smoothstep(3.,3.7,uSeason));c=mix(c,vec3(.86,.88,.92),frs*.56*smoothstep(.35,.9,N.y));c*=mix(1.,.7,(1.-cov)*.55*det);c*=mix(.74,1.,smoothstep(0.,.22,yr)*det+(1.-det));
 if(gilt<.5){float li=smoothstep(.7,.9,fbm2(uv*.8+seed*5.));c=mix(c,vec3(.4,.38,.3),li*.3);}
 c*=.9+.2*fbm2(vec2(uv.x*.05,uv.y*.08)+seed*3.);vec3 cf=base*(.84+.26*th)*mix(.78,1.08,stp*fcx+(1.-fcx)*.6)*mix(.82,1.,crs*fry+(1.-fry)*.62);cf*=.86+.28*vn2(uv*vec2(.45,.55)+seed*7.);if(gilt<.5){float li2=smoothstep(.72,.9,fbm2(uv*.6+seed*5.));cf=mix(cf,vec3(.42,.4,.32),li2*.25);}S.alb=mix(cf,c,det);
 S.rough=gilt>.5?.3:.74-uWet*.45;S.metal=gilt>.5?1.:0.;S.ao=mix(1.,.82,(1.-cov)*det);}
void wallS(inout PS S,vec3 N,float P,float aa){
 float u=vA.x,v=vA.y,L=max(vA.z,.5),sH=max(vA.w,2.4);float seed=vB.x,sty=vB.z,fl=vB.w;float nSt=max(vC.x,1.),gH=max(vC.y,2.5),litB=vC.w;
 vec3 base;
 if(P<.5)base=plasterCol(seed);
 else if(P<9.5){float far=smoothstep(.012,.035,aa);float row=floor(v/.072);float mo=1.-smoothstep(.0,.004+aa,abs(fract(v/.072)-.5)*.072-.02);
  vec3 bc=vec3(.47,.2,.12)*(.78+.38*h12(vec2(floor(u/.3+fract(row*.5)),row)+seed));base=mix(mix(bc,vec3(.6,.55,.46),mo*.8),vec3(.5,.27,.17),far);
  base=mix(base,vec3(.6,.38,.25),step(fract(v/1.3),.05)*.5);if(fract(seed*11.)<.35&&v>.9){vec2 rq=vec2(u+v,u-v)*1.9;vec2 rf=abs(fract(rq)-.5);float rj=1.-smoothstep(.40,.46+aa*2.,max(rf.x,rf.y));vec3 tf=vec3(.6,.55,.45)*(.85+.25*h12(floor(rq)+seed));base=mix(base,mix(tf*.72,tf,rj),(1.-step(fract(v/1.3),.12))*(1.-far));}}
 else if(P>29.5){vec3 mud=mix(vec3(.66,.56,.42),vec3(.57,.47,.35),fract(seed*5.7))*(.78+.36*fbm2(vec2(u,v)*.6+seed*3.));float fr=max(joint(u+fract(seed*9.)*1.7,1.7,.08,aa),max(joint(v,2.85,.13,aa),joint(v+1.42,2.85,.05,aa)));base=mix(mud,vec3(.15,.1,.06),fr*.92);}
 else base=stoneC(vec2(u,v),seed,vec3(.8,.73,.6),1.2,.6,aa);
 if(v<0.){S.alb=stoneC(vec2(u,v),seed,vec3(.55,.5,.4),1.,.5,aa);S.rough=.9;return;}
 float big=fbm2(vec2(u,v)*.07+seed*13.),streak=fbm2(vec2(u*1.1,v*.11)+seed*7.);
 vec3 alb=base*(.9+.2*big);alb*=mix(1.,.82,smoothstep(.55,.8,streak)*.6);alb*=mix(.76,1.,smoothstep(0.,1.8,v));
 float bBlank=mod(fl,2.),bDoor=mod(floor(fl/2.),2.),bQuoin=mod(floor(fl/4.),2.),bBands=mod(floor(fl/8.),2.),bShut=mod(floor(fl/16.),2.),bFrame=mod(floor(fl/32.),2.),bRed=mod(floor(fl/64.),2.),bLog=mod(floor(fl/256.),2.),bArc=mod(floor(fl/512.),2.);float bNiche=mod(floor(fl/1024.),2.),bMed=mod(floor(fl/2048.),2.),bRust=mod(floor(fl/4096.),2.),bFriz=mod(floor(fl/8192.),2.);
 float si,sv;if(v<gH){si=0.;sv=v;}else{si=1.+floor((v-gH)/sH);sv=(v-gH)-(si-1.)*sH;}
 float topV=gH+(nSt-1.)*sH;
 vec3 bandC=(fract(seed*3.7)<.55)?vec3(.52,.2,.12):vec3(.82,.77,.66);
 if(bBands>.5&&v<topV+.1){float dd=v<gH?gH-v:sv;float bm=1.-smoothstep(.27-aa,.27+aa,dd);if(v<gH-.6)bm=0.;alb=mix(alb,bandC*(.9+.12*big),bm*.92);}
 if(bRed>.5&&v<gH-.3)alb=mix(alb,vec3(.52,.2,.12)*(.85+.3*big),.85);if(P<.5&&v>0.&&v<1.15){alb=mix(alb,(fract(seed*2.9)<.6?vec3(.58,.24,.15):vec3(.7,.52,.28))*(.9+.15*big),.82);}if(P<.5&&abs(v-1.18)<.05)alb*=.8;if(P<.5&&v>gH&&v<topV){float fl2=1.-smoothstep(.05,.05+aa*2.,abs(sv-.03));alb=mix(alb,vec3(.62,.32,.22),fl2*.55);}
 if(bQuoin>.5&&P>23.5&&P<24.5){float e=min(u,L-u);float qa=clamp(step(e,.55)*step(mod(floor(v/.55),2.),.5)+step(e,.36),0.,1.);alb=mix(alb,vec3(.76,.71,.6)*(.9+.1*big),qa*.85);}
 float tb=smoothstep(topV-.02,topV+.02,v)*(1.-smoothstep(topV+.55-aa,topV+.55+aa,v));alb=mix(alb,vec3(.82,.77,.66),tb*.85);float dfar=1.-smoothstep(.02,.06,aa);float dn=step(.5,fract(u/.32))*smoothstep(topV+.06,topV+.1,v)*(1.-smoothstep(topV+.26,topV+.3,v));alb*=1.-.25*dn*dfar;if(bBands>.5&&P<.5&&v<topV){float fz=smoothstep(topV-.78,topV-.74,v)*(1.-smoothstep(topV-.1,topV-.06,v));float yy=(v-(topV-.76))/.68;float scw=abs(yy-.5-.3*sin(u*6.2832/.95));float lnw=1.-smoothstep(.07,.07+aa*3.,scw);vec3 fcw=fract(seed*4.3)<.5?vec3(.56,.19,.1):vec3(.18,.3,.28);alb=mix(alb,mix(vec3(.85,.8,.69),fcw,lnw),fz*dfar*.92);}float bPil=mod(floor(fl/128.),2.);if(bPil>.5&&v<topV&&v>0.){float bw2=3.+fract(seed*5.1);float by2=L/max(1.,floor(L/bw2+.3));float pu=abs(fract(u/by2+.5)-.5)*by2;alb=mix(alb,vec3(.83,.78,.67)*(.9+.1*big),(1.-smoothstep(.2,.24+aa,pu))*.85);}if(bRust>.5&&v<topV){float rh=.58;float rr=floor(v/rh);float ru=u+fract(rr*.5)*.6;float jx=abs(fract(ru/1.2)-.5)*1.2,jy=abs(fract(v/rh)-.5)*rh;float e=min(.6-jx,.29-jy);float g1=1.-smoothstep(0.,.035+aa,e),g2=smoothstep(.035,.09+aa,e)*(1.-smoothstep(.09,.13+aa,e));alb*=1.-.35*g1*dfar;alb*=1.+.08*g2*dfar;}if(bFriz>.5&&v<topV){float fz2=smoothstep(topV-.55,topV-.5,v)*(1.-smoothstep(topV-.06,topV-.02,v));alb=mix(alb,vec3(.55,.14,.1),fz2*.9);float md=step(.5,fract(u/.6))*smoothstep(topV-.05,topV,v)*(1.-smoothstep(topV+.06,topV+.12,v));alb=mix(alb,vec3(.9,.87,.8),md*dfar);}if((bNiche>.5||bMed>.5)&&nSt>1.5&&v>gH&&v<gH+sH){float bw3=3.+fract(seed*5.1);float by3=L/max(1.,floor(L/bw3+.3));float kb=floor(u/by3+.5);vec2 q2=vec2(u-kb*by3,v-(gH+sH*.48));if(bNiche>.5&&abs(mod(kb,3.)-1.)<.5&&kb>.5){float inA=clamp(step(abs(q2.x),.42)*step(-.72,q2.y)*(step(q2.y,.26)+step(length(vec2(q2.x,q2.y-.26)),.42)),0.,1.);float fr2=clamp(step(abs(q2.x),.52)*step(-.82,q2.y)*(step(q2.y,.26)+step(length(vec2(q2.x,q2.y-.26)),.52)),0.,1.);float fig=clamp(step(abs(q2.x),.1)*step(-.6,q2.y)*step(q2.y,.12)+step(length(q2-vec2(0.,.24)),.09),0.,1.);alb=mix(alb,vec3(.88,.84,.74),fr2*dfar);alb=mix(alb,vec3(.1,.2,.48),inA*dfar);alb=mix(alb,vec3(.92,.72,.32),fig*inA*dfar);}if(bMed>.5&&abs(mod(kb,3.)-2.)<.5){float dd=length(q2);float rays=step(.5,fract(atan(q2.y,q2.x)*2.546));alb=mix(alb,vec3(.9,.86,.76),step(dd,.44)*dfar);alb=mix(alb,vec3(.86,.66,.28),clamp(step(.36,dd)*step(dd,.44)+step(.08,dd)*step(dd,.3)*rays,0.,1.)*dfar);}}
 S.alb=alb;S.rough=.92-uWet*.4;
 if(bBlank>.5||v>topV||si>=nSt)return;
 float bayW=bArc>.5?4.8:3.+fract(seed*5.1);float nb=max(1.,floor(L/bayW+.3));float bay=L/nb;float bi=floor(u/bay);float bu=u-(bi+.5)*bay;
 if(nSt>2.5&&(P<.5||(P>8.5&&P<9.5))&&v<topV&&v>gH){if(si>nSt-1.5&&fract(seed*3.1)<.35){float fu=joint(u+fract(seed*9.)*1.7,1.6,.07,aa),fv=max(joint(sv,sH,.1,aa),joint(sv+sH*.5,sH,.05,aa));vec3 mud=vec3(.82,.74,.6)*(.88+.2*big);S.alb=mix(mud,vec3(.46,.33,.2),max(fu,fv)*.72);}else if(si<1.5&&fract(seed*7.7)<.45){float bb=1.-step(.95,sv);float bal=step(.5,fract(u/.28));S.alb=mix(S.alb,mix(vec3(.5,.36,.22),vec3(.62,.47,.3),bal),bb*.8);}}
 float winT=mod(sty,8.),grT=floor(sty/8.);float hw=0.,oh=0.,sill=0.,ar=0.,dep=.25,kind=-1.;
 float wsd=h12(vec2(bi+seed*97.,si+seed*31.));bool top=si>nSt-1.5;
 if(bArc>.5){kind=2.;hw=bay*.31;float hh=si<.5?gH:sH;oh=hh*.8;ar=1.;dep=2.4;}
 else if(si<.5){float doorBay=floor(fract(seed*11.3)*nb);bool isDoor=bDoor>.5&&abs(bi-doorBay)<.5;
  if(grT>.5&&grT<1.5){kind=2.;hw=min(bay*.34,1.6);oh=min(gH-.45,2.1+hw);ar=1.;dep=1.4;}
  else if(grT>1.5&&grT<2.5){kind=3.;hw=min(bay*.38,1.5);oh=min(gH-.6,2.6);ar=step(.55,fract(seed*4.1));dep=.6;}
  else if(grT>2.5){if(isDoor){kind=1.;hw=.75;oh=2.7;ar=1.;dep=.5;}}
  else{if(isDoor){kind=1.;hw=.6;oh=2.3;ar=step(.5,fract(seed*8.7));dep=.45;}else if(wsd>.35){kind=0.;hw=.3;oh=.6;sill=gH-1.25;}}}
 else{if(bLog>.5&&top){kind=4.;float sb=bay*.5;bu=u-(floor(u/sb)+.5)*sb;hw=min(sb*.36,1.1);sill=.85;oh=sH-1.2;ar=1.;dep=1.8;}
  else if(wsd>.15){kind=0.;hw=.36+.12*fract(seed*5.3);oh=1.05+.3*fract(seed*1.9);sill=.95;
   ar=((winT>.5&&winT<1.5)||(winT>3.5&&winT<4.5)||winT>6.5)?1.:0.;
   if((winT>2.5&&winT<3.5)||top){hw=.3;oh=.75;sill=1.;ar=0.;}
   if(winT>4.5&&winT<5.5&&si<1.5){oh=1.8;hw=.48;sill=.55;ar=1.;}}}
 if(kind>-.5&&kind<.5&&nSt>2.5&&si>.5&&si<1.5&&!(bLog>.5&&top)){hw=max(hw,.5);oh=max(oh,1.55);sill=min(sill,1.05);ar=1.;}
 if(kind<0.)return;
 vec2 q=vec2(bu,sv-sill);float ins=openM(q,hw,oh,ar,aa);
 if(kind<.5){if(bFrame>.5||winT>6.5||(winT>1.5&&winT<2.5)){float fr=clamp(openM(q+vec2(0.,.13),hw+.14,oh+.26,ar,aa)-ins,0.,1.);vec3 frc=P<.5?vec3(.66,.38,.25):vec3(.82,.77,.66);S.alb=mix(S.alb,frc*(.9+.1*big),fr*.9);}if(bFrame>.5&&si>.5){float py=q.y-(oh+.16);float pw=(hw+.24)*(1.-py/.4);vec3 frc2=P<.5?vec3(.68,.4,.27):vec3(.85,.8,.7);S.alb=mix(S.alb,frc2,step(0.,py)*step(py,.4)*step(abs(q.x),pw)*.85);}
  float sl=step(abs(q.x),hw+.14)*smoothstep(-.14-aa,-.14+aa,q.y)*(1.-smoothstep(-aa,aa,q.y));S.alb=mix(S.alb,vec3(.78,.73,.63),sl*.85);}
 if(kind>1.5&&kind<2.5&&bArc>.5){float pil=1.-smoothstep(.0,aa+.02,abs(abs(bu)-bay*.5)-.28);S.alb=mix(S.alb,S.alb*1.08,pil);}
 if(ins<.01)return;
 vec3 T=normalize(vec3(-N.z,0.,N.x)+1e-4);vec3 Up=vec3(0.,1.,0.);vec3 V=normalize(vWP-cameraPosition);
 float vt=dot(V,T),vu=dot(V,Up),vnn=min(dot(V,N),-.06);float t=dep/(-vnn);vec2 qb=q+vec2(vt,vu)*t;
 float back=openM(qb,hw,oh,ar,aa*2.+.01);
 float glz=step(h12(vec2(bi*3.1+seed*11.,si*7.7+seed)),uGlass);float rnd=h12(vec2(bi*1.7+seed*5.,si*2.3+seed*3.));float lit=step(rnd,uLit*litB*(si<.5?.55:mix(.07,.55,uGlass)));float flk=.78+.22*sin(uTime*7.+seed*30.+bi*1.7);
 vec3 inter;vec3 em=vec3(0.);vec3 lamp=vec3(1.,.42,.13);
 if(kind<.5){float sh=bShut*step(.45,fract(wsd*7.3))*(1.-glz);vec3 wc=(fract(seed*13.37)<.5)?vec3(.1,.15,.1):vec3(.17,.1,.05);
  inter=mix(vec3(.085,.072,.06)*(.8+.4*smoothstep(-1.,1.2,qb.y)),wc*(.8+.2*step(.5,fract(qb.y*9.))),sh);
  if(glz>.5){float fr=pow(1.-abs(vnn),4.);inter=mix(vec3(.07,.08,.09),uSkyRefl,.3+.6*fr);S.rough=.08;}
  em=lamp*lit*uNight*(glz>.5?2.4:(sh>.5?.14:.5))*flk*back;}
 else if(kind<1.5){inter=vec3(.15,.08,.04)*(.8+.2*step(.5,fract(qb.x*3.)));em=lamp*lit*uNight*.45*flk*back;}
 else if(kind<2.5){inter=S.alb*.44;em=lamp*lit*uNight*.7*flk*back*step(qb.y,2.6);}
 else if(kind<3.5){inter=vec3(.13,.1,.07)*(.8+.4*h12(vec2(bi,si)+seed));em=lamp*lit*uNight*1.5*flk*back*step(fract(rnd*7.3),.22);}
 else{inter=S.alb*.46;em=lamp*lit*uNight*.8*flk*back;}
 vec3 revN=N;if(back<.5){float tx=((vt>0.?hw:-hw)-q.x)/(abs(vt)>1e-4?vt:1e-4);float ty=((vu>0.?oh:0.)-q.y)/(abs(vu)>1e-4?vu:1e-4);revN=(tx<ty)?(vt>0.?-T:T):(vu>0.?-Up:Up);}
 S.alb=mix(S.alb,mix(S.alb*.9,inter,back),ins);S.emit=em*ins;
 if(back<.5&&ins>.5){S.nw=revN;S.useN=1.;}S.ao=mix(1.,mix(.6,.32,back),ins);}
`;
const CITY_S=`
float P=vB.y;float seed=vB.x;vec3 N=normalize(vWN);vec2 uv=vA.xy;float aa=max(fwidth(uv.x),fwidth(uv.y))*1.2+.002;
if(P<.5||(P>8.5&&P<9.5)||(P>23.5&&P<24.5)||(P>29.5&&P<30.5))wallS(S,N,P,aa);
else if(P<1.5)roofS(S,N,0.,aa);
else if(P<2.5){S.alb=stoneC(uv,seed,vec3(.7,.64,.53),1.2,.55,aa);S.rough=.86;}
else if(P<3.5){S.alb=vec3(.2,.12,.07)*(.8+.4*fbm2(vec2(uv.x*6.,uv.y*.5)));S.rough=.8;}
else if(P<4.5){S.alb=mix(roofCol(seed)*.85,vec3(.72,.67,.58),.22)*(.85+.2*vn2(uv*3.));S.rough=.8;}
else if(P<5.5){S.alb=vec3(.56,.5,.4)*(.8+.3*fbm2(uv*.7));S.rough=.9;}
else if(P<6.5){S.alb=marbleC(vWP,seed);float j=max(joint(uv.y,.9,.006,aa),joint(uv.x+fract(floor(uv.y/.9)*.5)*1.8,1.8,.006,aa));S.alb*=1.-.1*j;S.rough=.42;}
else if(P<7.5){S.alb=vec3(.15,.13,.11);S.rough=1.;}
else if(P<8.5){float k=fract(seed*3.3);vec3 c=k<.3?vec3(.09,.33,.35):k<.55?vec3(.6,.37,.11):k<.75?vec3(.46,.11,.07):vec3(.78,.72,.58);
 c=mix(c,min(c*1.35+.06,vec3(1.)),step(.5,fract(uv.x/.55))*step(.4,fract(seed*7.)));S.alb=c;S.rough=.9;S.emit=c*max(dot(-N,uSunDir),0.)*.25*uSunCol*(1.-uNight);}
else if(P<10.5){vec2 p=vWP.xz*1.4;vec2 ip=floor(p),fp=fract(p);float m1=8.,m2=8.;vec2 id=ip;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j);vec2 o=vec2(h12(ip+g),h12(ip+g+17.3));vec2 r=g+o-fp;float d=dot(r,r);if(d<m1){m2=m1;m1=d;id=ip+g;}else if(d<m2)m2=d;}
 float e=sqrt(m2)-sqrt(m1);float far=smoothstep(.03,.1,aa);vec3 c=vec3(.2,.19,.18)*(.72+.5*h12(id));
 S.alb=mix(c*mix(.5,1.,smoothstep(0.,.07,e)),vec3(.22,.2,.18),far);S.rough=.72-uWet*.5;}
else if(P<11.5){vec2 p=vWP.xz;float row=floor(p.y/1.6);float j=max(joint(p.y,1.6,.01,aa),joint(p.x+fract(row*.5)*3.,3.,.01,aa));
 vec3 c=vec3(.72,.67,.56)*(.86+.2*h12(vec2(floor(p.x/3.+fract(row*.5)),row)))*(.9+.15*fbm2(p*.4));S.alb=c*(1.-.25*j);S.rough=.75-uWet*.5;}
else if(P<12.5)roofS(S,N,1.,aa);
else if(P<13.5){S.alb=mix(vec3(.4,.26,.14),vec3(.2,.4,.32),smoothstep(.45,.75,fbm3(vWP*.5)));S.metal=.8;S.rough=.45;}
else if(P<14.5){vec3 c=vec3(.58,.58,.55)*(.86+.22*fbm2(uv*.3));c*=1.-.12*joint(uv.y,.6,.008,aa);c*=mix(1.,.8,smoothstep(.6,.9,fbm2(vec2(uv.x*.8,uv.y*.1))));S.alb=c;S.rough=.85;}
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
else if(P<22.5){S.alb=stoneC(uv,seed,vec3(.6,.53,.39),1.4,.62,aa);S.rough=.9;}
else if(P<23.5){S.alb=vec3(.08,.13,.045)*(.7+.5*fbm2(vWP.xz*.25))+vec3(.3,.2,.25)*step(.92,vn2(vWP.xz*3.))*.3;S.rough=.95;}
else if(P<25.5){S.alb=vec3(.45,.25,.21)*(.85+.25*vn2(uv*20.));S.rough=.4;}
else if(P<26.5){S.alb=vec3(.68,.62,.51)*mix(.7,1.,step(.45,fract(uv.y/.8)))*(.9+.15*fbm2(uv*.5));S.rough=.85;}
else if(P<27.5){S.alb=vec3(.66,.55,.38)*(.85+.2*fbm2(vWP.xz*.3));S.rough=.95;}
else if(P<28.5){S.alb=vec3(1.,.74,.34);S.metal=1.;S.rough=.28;}
else if(P>30.5&&P<31.5){vec2 p=vWP.xz;float n=fbm2(p*.08),pud=smoothstep(.6,.68,fbm2(p*.03+7.)),lime=smoothstep(.74,.8,vn2(p*.11));vec3 c=mix(vec3(.16,.14,.11),vec3(.27,.23,.17),n);c=mix(c,vec3(.6,.58,.52),lime*.45);S.alb=mix(c,vec3(.04,.04,.045),pud*.75);S.rough=mix(.95,.05,pud);}
else if(P>32.5&&P<33.5){S.alb=stoneC(uv,seed,vec3(.5,.46,.38),1.15,.56,aa);S.rough=.9;}
else if(P>33.5&&P<34.5){vec2 g2=floor(uv/1.2);float k=h12(g2+seed);vec3 c1=k<.3?vec3(.9,.88,.84):k<.55?vec3(.55,.6,.68):k<.8?vec3(.82,.6,.58):vec3(.86,.76,.5);float jn=max(joint(uv.x,1.2,.01,aa),joint(uv.y,1.2,.01,aa));S.alb=c1*(1.-.25*jn);S.rough=.35;}
else if(P>34.5&&P<35.5){float k=fract(seed*7.7);S.alb=k<.5?vec3(.56,.15,.1):k<.8?vec3(.72,.52,.22):vec3(.13,.12,.11);S.rough=.5;}
else if(P>33.5&&P<34.5){vec2 p=vWP.xz/1.25;vec2 ip=floor(p),fp=fract(p);float h=h12(ip+seed*13.);vec3 c=h<.24?vec3(.76,.6,.3):h<.42?vec3(.56,.38,.5):h<.56?vec3(.46,.13,.1):h<.72?vec3(.22,.38,.3):vec3(.86,.84,.8);float inr=step(.1,fp.x)*step(fp.x,.9)*step(.1,fp.y)*step(fp.y,.9);float dia=step(abs(fp.x-.5)+abs(fp.y-.5),.36);c=mix(vec3(.86,.84,.8),c,inr);c=mix(c,vec3(.84,.8,.72),dia*inr*step(.5,h));S.alb=c*(.9+.15*vn2(p*.4));S.rough=.38;}
else if(P>31.5&&P<32.5){S.alb=vec3(.15,.11,.085)*(.8+.3*vn2(uv*2.));S.rough=.95;}
else{S.alb=vec3(.86,.87,.85);S.rough=.25;}
S.alb*=1.-.42*uBurn*vC.z;
`;
const MAT={};
MAT.city=procMat({key:'city',vHead:'attribute vec4 aA;attribute vec4 aB;attribute vec4 aC;varying vec4 vA;varying vec4 vB;varying vec4 vC;',
  vBody:'vA=aA;vB=aB;vC=aC;',fHead:CITY_F,fSurf:CITY_S,env:.7});

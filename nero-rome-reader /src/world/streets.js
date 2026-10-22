/* ================= STREETS: they grow from the buildings (the author's rule) =================
   A raster over the city (cs m cells) holds the building footprints (W.foot), vegetation and water. Street cells are the open ground
   inside dense, built-up, non-vegetated areas (box-filtered footprint density) plus the main-road lines; specks are dropped, edges smoothed.
   Each cell gets a grade: 3 white marble/travertine (forum, precincts, palace hill), 2 grey stone (main roads, better districts), 1 dirt (lanes,
   poor districts, edges). The mask goes to the terrain shader as a texture (coverage, grade, distance to the nearest wall) plus a coarse
   direction texture (ruts follow the street); steep stone/marble streets get real stairs of their grade; only main roads get raised kerbs. */
function stChamfer(src,nx,nz){const D=new Float32Array(nx*nz),INF=1e4,a=1,b=1.4142;for(let i=0;i<D.length;i++)D[i]=src[i]?0:INF;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;let d=D[k];if(d===0)continue;if(i>0&&D[k-1]+a<d)d=D[k-1]+a;
    if(j>0){const r=k-nx;if(D[r]+a<d)d=D[r]+a;if(i>0&&D[r-1]+b<d)d=D[r-1]+b;if(i<nx-1&&D[r+1]+b<d)d=D[r+1]+b;}D[k]=d;}
  for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const k=j*nx+i;let d=D[k];if(d===0)continue;if(i<nx-1&&D[k+1]+a<d)d=D[k+1]+a;
    if(j<nz-1){const r=k+nx;if(D[r]+a<d)d=D[r]+a;if(i<nx-1&&D[r+1]+b<d)d=D[r+1]+b;if(i>0&&D[r-1]+b<d)d=D[r-1]+b;}D[k]=d;}
  return D;}
function stBlur(src,nx,nz,r){const t=new Float32Array(nx*nz),o=new Float32Array(nx*nz),w=2*r+1,cl=(v,n)=>v<0?0:v>=n?n-1:v;
  for(let j=0;j<nz;j++){const row=j*nx;let s=0;for(let i=-r;i<=r;i++)s+=src[row+cl(i,nx)];for(let i=0;i<nx;i++){t[row+i]=s/w;s+=src[row+cl(i+r+1,nx)]-src[row+cl(i-r,nx)];}}
  for(let i=0;i<nx;i++){let s=0;for(let j=-r;j<=r;j++)s+=t[cl(j,nz)*nx+i];for(let j=0;j<nz;j++){o[j*nx+i]=s/w;s+=t[cl(j+r+1,nz)*nx+i]-t[cl(j-r,nz)*nx+i];}}
  return o;}
// connected components (4-neighbour) of the nonzero cells of m; calls fn(cellList) for each
function stComps(m,nx,nz,fn,d8){const seen=new Uint8Array(m.length),q=new Int32Array(m.length);
  for(let s=0;s<m.length;s++){if(!m[s]||seen[s])continue;let h=0,t=0;q[t++]=s;seen[s]=1;
    while(h<t){const k=q[h++],i=k%nx,j=(k-i)/nx;if(i>0&&m[k-1]&&!seen[k-1]){seen[k-1]=1;q[t++]=k-1;}if(i<nx-1&&m[k+1]&&!seen[k+1]){seen[k+1]=1;q[t++]=k+1;}
      if(j>0&&m[k-nx]&&!seen[k-nx]){seen[k-nx]=1;q[t++]=k-nx;}if(j<nz-1&&m[k+nx]&&!seen[k+nx]){seen[k+nx]=1;q[t++]=k+nx;}
      if(d8){for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const kk=jj*nx+ii;if(m[kk]&&!seen[kk]){seen[kk]=1;q[t++]=kk;}}}}
    fn(q.subarray(0,t));}}
/* o: {zone(x,z)->1|2|3 grade of ordinary streets, marble(x,z)->bool, veg(x,z)->bool, water(x,z)->bool, roads:[[w,pts],...], urban(x,z)->0..1} */
function buildStreets(W,o){const t0=performance.now(),F=W.foot.list;let bx0=1e9,bz0=1e9,bx1=-1e9,bz1=-1e9;
  for(const f of F){if(f.tag==='road'||f.tag==='open'||f.r>400)continue;bx0=Math.min(bx0,f.cx);bx1=Math.max(bx1,f.cx);bz0=Math.min(bz0,f.cz);bz1=Math.max(bz1,f.cz);}
  const cs=Q.name==='low'&&!TEST?3.5:2.5,x0=Math.max(bx0-160,-3000),z0=Math.max(bz0-160,-2700),nx=Math.ceil((Math.min(bx1+160,3000)-x0)/cs),nz=Math.ceil((Math.min(bz1+160,3500)-z0)/cs),N=nx*nz;
  const solid=new Uint8Array(N),veg=new Uint8Array(N),temple=new Uint8Array(N),K=(i,j)=>j*nx+i;
  for(const f of F){if(f.tag==='road')continue;const open=f.tag==='open',m=open?0:.3,r=f.r+1,i0=Math.max(0,Math.floor((f.cx-r-x0)/cs)),i1=Math.min(nx-1,Math.floor((f.cx+r-x0)/cs)),j0=Math.max(0,Math.floor((f.cz-r-z0)/cs)),j1=Math.min(nz-1,Math.floor((f.cz+r-z0)/cs));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+(i+.5)*cs-f.cx,z=z0+(j+.5)*cs-f.cz,u=f.c*x-f.s*z,v=f.s*x+f.c*z;
      if(Math.abs(u)<=f.hw+m&&Math.abs(v)<=f.hd+m){if(open)veg[K(i,j)]=1;else{solid[K(i,j)]=1;if(f.t)temple[K(i,j)]=1;}}}}
  // vegetation and water on a 10 m lattice, nearest-sampled
  const wat=new Uint8Array(N),lat=Math.max(1,Math.round(10/cs));{const lx=Math.ceil(nx/lat)+1,lz=Math.ceil(nz/lat)+1,V=new Uint8Array(lx*lz),Wt=new Uint8Array(lx*lz);
    for(let j=0;j<lz;j++)for(let i=0;i<lx;i++){const x=x0+(i*lat+lat/2)*cs,z=z0+(j*lat+lat/2)*cs;V[j*lx+i]=o.veg(x,z)?1:0;Wt[j*lx+i]=o.water(x,z)?1:0;}
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=Math.floor(j/lat)*lx+Math.floor(i/lat);if(V[k])veg[K(i,j)]=1;if(Wt[k])wat[K(i,j)]=1;}}
  const dist=stChamfer(solid,nx,nz),dens=stBlur(solid,nx,nz,Math.round(16/cs)),dens2=stBlur(solid,nx,nz,Math.round(30/cs));
  const st=new Uint8Array(N);
  for(let k=0;k<N;k++){if(solid[k]||veg[k]||wat[k])continue;const d=dist[k]*cs;if(dens[k]>=.3||(d<=2.6&&dens2[k]>=.17))st[k]=1;}
  // drop specks, smooth the edge (majority)
  {const min=Math.round(260/(cs*cs));stComps(st,nx,nz,c=>{if(c.length<min)for(let a=0;a<c.length;a++)st[c[a]]=0;},true);}
  for(let it=0;it<2;it++){const s2=st.slice();for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=K(i,j);if(solid[k]||wat[k]||veg[k]){s2[k]=0;continue;}
    const n=st[k-1]+st[k+1]+st[k-nx]+st[k+nx]+st[k-nx-1]+st[k-nx+1]+st[k+nx-1]+st[k+nx+1]+st[k];s2[k]=(st[k]||n>=5)?1:0;}st.set(s2);}   // only fills: thin alleys (one cell wide) must survive
  // main roads: stone inside the city, dirt in the country unless wide; direction field for ruts
  const road=new Uint8Array(N),NC=4,nxc=Math.ceil(nx/NC),nzc=Math.ceil(nz/NC),ax=new Float32Array(nxc*nzc),az=new Float32Array(nxc*nzc),aw=new Float32Array(nxc*nzc);
  for(const[w,pts0]of o.roads){const pts=densify(pts0,cs*.8);for(let p=0;p<pts.length-1;p++){const a=pts[p],b=pts[p+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,tx=dx/l,tz=dz/l,x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,ur=o.urban(x,z),hw=w*(ur>.45?.5:w>=9?.5:.3);
      const i0=Math.max(0,Math.floor((x-hw-x0)/cs)),i1=Math.min(nx-1,Math.floor((x+hw-x0)/cs)),j0=Math.max(0,Math.floor((z-hw-z0)/cs)),j1=Math.min(nz-1,Math.floor((z+hw-z0)/cs));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=K(i,j);if(solid[k]||wat[k])continue;const cx=x0+(i+.5)*cs-x,cz=z0+(j+.5)*cs-z;if(Math.hypot(cx,cz)>hw+cs*.5)continue;
        st[k]=1;road[k]=ur>.45||w>=9?2:1;const kc=Math.floor(j/NC)*nxc+Math.floor(i/NC);ax[kc]+=3*(tx*tx-tz*tz);az[kc]+=3*2*tx*tz;aw[kc]+=3;}}}
  for(const[xa,za,xb,zb]of o.paved||[]){const i0=Math.max(0,Math.floor((xa-x0)/cs)),i1=Math.min(nx-1,Math.floor((xb-x0)/cs)),j0=Math.max(0,Math.floor((za-z0)/cs)),j1=Math.min(nz-1,Math.floor((zb-z0)/cs));   // market squares and the like: an open area with a purpose is paved
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=K(i,j);if(!solid[k]&&!wat[k]){st[k]=1;road[k]=2;}}}
  for(let k=0;k<N;k++)if(solid[k])st[k]=0;
  // width of each street (distance to the nearest non-street, local maximum) -> alleys narrower than ~3 m are dirt
  const nonSt=new Uint8Array(N);for(let k=0;k<N;k++)nonSt[k]=st[k]?0:1;const dN=stChamfer(nonSt,nx,nz),wid=new Float32Array(N);
  {const R=2,m2=new Float32Array(N);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=K(i,j);if(!st[k])continue;let m=0;for(let b=-R;b<=R;b++){const jj=j+b;if(jj<0||jj>=nz)continue;for(let a=-R;a<=R;a++){const ii=i+a;if(ii<0||ii>=nx)continue;const v=dN[K(ii,jj)];if(v>m)m=v;}}m2[k]=m*2*cs;}wid.set(m2);}
  // grades
  const grd=new Uint8Array(N),tdist=stChamfer(temple,nx,nz);let cnt=[0,0,0,0];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=K(i,j);if(!st[k])continue;const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs;let g;
    if(o.marble(x,z)||tdist[k]*cs<=16)g=3;
    else if(road[k])g=road[k];
    else{g=o.zone(x,z);if(wid[k]<3.2)g=1;}
    grd[k]=g;cnt[g]++;}
  // direction field from the wall-distance gradient (doubled angle: continuous across the middle of a street)
  for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=K(i,j);if(!st[k]||road[k])continue;const gx=dist[k+1]-dist[k-1],gz=dist[k+nx]-dist[k-nx],m2=gx*gx+gz*gz;if(m2<.25)continue;
    const kc=Math.floor(j/NC)*nxc+Math.floor(i/NC);ax[kc]-=(gx*gx-gz*gz)/m2;az[kc]-=2*gx*gz/m2;aw[kc]+=1;}
  for(let it=0;it<6;it++){const bx=ax.slice(),bz=az.slice(),bw=aw.slice();for(let j=0;j<nzc;j++)for(let i=0;i<nxc;i++){const k=j*nxc+i;if(aw[k]>0.5)continue;let sx=0,sz=0,sw=0;
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nxc||jj>=nzc)continue;const kk=jj*nxc+ii;if(aw[kk]>0){const l=Math.hypot(ax[kk],az[kk])||1;sx+=ax[kk]/l;sz+=az[kk]/l;sw+=1;}}
    if(sw>0){bx[k]=sx/sw*.5;bz[k]=sz/sw*.5;bw[k]=.5;}}ax.set(bx);az.set(bz);aw.set(bw);}
  // textures
  const sm=stBlur(st,nx,nz,1),T1=new Uint8Array(N*4);
  // grade of cells without a street is the nearest street's (so filtering at the edge does not mix in zero)
  const gg=new Float32Array(N);for(let k=0;k<N;k++)gg[k]=grd[k];for(let it=0;it<3;it++){const g2=gg.slice();for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=K(i,j);if(gg[k]>0)continue;const v=gg[k-1]||gg[k+1]||gg[k-nx]||gg[k+nx];if(v)g2[k]=v;}gg.set(g2);}
  for(let k=0;k<N;k++){T1[k*4]=Math.min(255,sm[k]*255*1.15);T1[k*4+1]=gg[k]===1?64:gg[k]===2?128:gg[k]===3?192:0;T1[k*4+2]=Math.min(255,dist[k]*cs/8*255);T1[k*4+3]=st[k]?255:0;}
  const T2=new Uint8Array(nxc*nzc*4);for(let k=0;k<nxc*nzc;k++){const l=Math.hypot(ax[k],az[k]),vx=l>1e-4?ax[k]/l:0,vz=l>1e-4?az[k]/l:0;T2[k*4]=Math.round((vx*.5+.5)*255);T2[k*4+1]=Math.round((vz*.5+.5)*255);T2[k*4+2]=Math.min(255,aw[k]*40);T2[k*4+3]=255;}
  const mk=(d,w,h,mip)=>{const t=new THREE.DataTexture(d,w,h,THREE.RGBAFormat,THREE.UnsignedByteType);t.magFilter=THREE.LinearFilter;t.minFilter=mip?THREE.LinearMipmapLinearFilter:THREE.LinearFilter;t.generateMipmaps=!!mip;t.flipY=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;return t;};
  U.uSt.value=mk(T1,nx,nz,true);U.uStA.value=mk(T2,nxc,nzc,false);U.uStX.value.set(x0,z0,nx*cs,nz*cs);U.uStN.value.set(nx,nz);
  W.street={x0,z0,cs,nx,nz,st,grd,solid,veg,wid,dist,road,ax,az,nxc,NC,at:(x,z)=>{const i=Math.floor((x-x0)/cs),j=Math.floor((z-z0)/cs);return i<0||j<0||i>=nx||j>=nz?0:grd[j*nx+i];}};
  W.streetAt=(x,z)=>W.street.at(x,z)>0;
  console.log('streets',nx+'x'+nz,'cs',cs,'dirt',cnt[1],'stone',cnt[2],'marble',cnt[3],Math.round(performance.now()-t0)+' ms');}
/* stairs: connected steep stone/marble street cells become flights along the slope (dirt never does) */
function streetStairs(W){const S=W.street,{x0,z0,cs,nx,nz,grd}=S,N=nx*nz,gy=W.gy,steep=new Uint8Array(N),gxA=new Float32Array(N),gzA=new Float32Array(N),g=new GB(1<<16);let nSt=0;
  for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(grd[k]<2||(S.road[k]&&grd[k]<3))continue;const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs,dx=(gy(x+cs,z)-gy(x-cs,z))/(2*cs),dz=(gy(x,z+cs)-gy(x,z-cs))/(2*cs);
    const m2=dx*dx+dz*dz;if(m2>(grd[k]===3?.0121:.0256)){   // marble streets turn to stairs from ~11 %, stone ones from ~16 %
      const kc=Math.floor(j/S.NC)*S.nxc+Math.floor(i/S.NC),l=Math.hypot(S.ax[kc],S.az[kc]);
      // only where the street runs along the slope (street axis within ~30 deg of the gradient; doubled angles): a street across a slope is a terrace, not a climb
      if(l>1e-3&&((dx*dx-dz*dz)*S.ax[kc]+2*dx*dz*S.az[kc])/(m2*l)>.5){steep[k]=1;gxA[k]=dx;gzA[k]=dz;}}}
  const comps=[];stComps(steep,nx,nz,c=>{if(c.length>=7)comps.push(Array.from(c));});comps.sort((a,b)=>b.length-a.length);
  for(const c of comps.slice(0,140)){let sx=0,sz=0,mx=0,mz=0,mar=0;for(const k of c){sx+=gxA[k];sz+=gzA[k];const i=k%nx,j=(k-i)/nx;mx+=x0+(i+.5)*cs;mz+=z0+(j+.5)*cs;if(grd[k]===3)mar++;}
    const l=Math.hypot(sx,sz)||1,dx=-sx/l,dz=-sz/l;mx/=c.length;mz/=c.length;const px=-dz,pz=dx;let t0=1e9,t1=-1e9;const pp=[];
    for(const k of c){const i=k%nx,j=(k-i)/nx,x=x0+(i+.5)*cs-mx,z=z0+(j+.5)*cs-mz,t=x*dx+z*dz;pp.push(x*px+z*pz);t0=Math.min(t0,t);t1=Math.max(t1,t);}
    pp.sort((a,b)=>a-b);const pc=pp[pp.length>>1],span=pp[Math.floor(pp.length*.9)]-pp[Math.floor(pp.length*.1)],marble=mar>c.length*.5,wd=Math.min(marble?9:7,Math.max(3,span+1.5));if(span>12||t1-t0>75)continue;   // wide or very long patches are street networks on a hillside, not one climb: they stay ramps
    t0-=cs*.8;t1+=cs*.8;if(t1-t0<5.5)continue;const cx=mx+px*pc,cz=mz+pz*pc,ax=cx+dx*t0,az=cz+dz*t0,bx=cx+dx*t1,bz=cz+dz*t1,yt=gy(ax,az),yb=gy(bx,bz),drop=yt-yb;if(drop<1.1||drop>40)continue;
    const ri=marble?.16:.19,n=Math.max(4,Math.round(drop/ri)),rr=drop/n,nL=Math.floor((n-1)/12),run=t1-t0,ld=Math.min(2.4,run*.12),td=(run-nL*ld)/n,rot=Math.atan2(dx,dz),F=frame(ax,0,az,rot),hw=wd/2;
    if(td<.25||td>1.5)continue;let z=0;
    for(let s=0;s<n;s++){const yy=yt-(s+1)*rr;g.set(marble?6:38,.4+(s%5)*.05);box(g,F,0,yy-1.3,z+td/2,hw,1.3,td/2+.02,31&~32);z+=td;
      if((s+1)%12===0&&s<n-1){g.set(marble?6:38,.4);box(g,F,0,yy-1.3,z+ld/2,hw,1.3,ld/2+.02,31&~32);z+=ld;}}
    // cheek walls: marble flights on both sides with a coping, stone flights only where the ground falls away
    let zz=0;for(let s=0;s<n;s++){const yy=yt-(s+1)*rr,len=td+((s+1)%12===0&&s<n-1?ld:0);
      for(const sd of[-1,1]){const q=F.p(sd*(hw+.5),0,zz+len/2),lo=gy(q[0],q[2])<yy-.55;if(!marble&&!lo)continue;const wh=marble?.62:.45;g.set(marble?6:38,.5);box(g,F,sd*(hw+.2),yy-1.3,zz+len/2,.2,1.3+wh,len/2+.02,31&~32);
        if(marble){g.set(2,.5);box(g,F,sd*(hw+.2),yy+wh,zz+len/2,.3,.1,len/2+.02,31&~32);}}
      zz+=len;}
    (W.stairList=W.stairList||[]).push({x:ax,z:az,dx,dz,w:wd,run,marble,drop,n});nSt++;}
  const m=g.mesh(MAT.city);if(m)W.scene.add(m);W.nStairs=nSt;console.log('street stairs',nSt,'of',comps.length,'steep street patches');}
// raised kerbs and sidewalks only along the grey-stone main roads (they stop where the road is dirt or a building stands)
function roadKerbs(W,list){const g=new GB(1<<16),S=W.street;
  for(const[w,pts0]of list){if(w<7)continue;const pts=densify(pts0,6);
    for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,tx=dx/l,tz=dz/l,nx=tz,nz=-tx,mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
      if(S.at(mx,mz)!==2)continue;const rich=Math.hypot(mx-17,mz+22)<420,hw=w/2;
      for(const sd of[1,-1]){const o0=hw,o1=hw+(rich?1.9:1.3),P=(p,o,y)=>[p[0]+sd*nx*o,y,p[1]+sd*nz*o],ok=S.at(mx+sd*nx*(o1-.3),mz+sd*nz*(o1-.3))===2||S.at(mx+sd*nx*(o1+1.5),mz+sd*nz*(o1+1.5))===0;if(!ok)continue;
        const ya=W.gy(P(a,o0,0)[0],P(a,o0,0)[2]),yb=W.gy(P(b,o0,0)[0],P(b,o0,0)[2]),h=.34;
        g.set(rich?37:36,.4);g.poly([P(a,o0,ya+h),P(b,o0,yb+h),P(b,o1,yb+h),P(a,o1,ya+h)],[0,1,0]);
        g.set(33,.3);g.poly([P(a,o0,ya-.08),P(b,o0,yb-.08),P(b,o0,yb+h),P(a,o0,ya+h)],[-sd*nx,0,-sd*nz]);
        g.set(33,.5);g.poly([P(a,o0-.14,ya+h*.98),P(b,o0-.14,yb+h*.98),P(b,o0+.1,yb+h*1.02),P(a,o0+.1,ya+h*1.02)],[0,1,0]);}}}
  const m=g.mesh(MAT.city,false);if(m)W.scene.add(m);}
/* street kit (rome_lacus, rome_compitum, rome_stepping, rome_counter, rome_awning, rome_amphorae, rome_cart, rome_laundry): one InstancedMesh per part, placed from the street raster:
   props stand against the walls of dirt and stone streets (back to the wall, found from the wall-distance field), fountains and shrines on the small piazzas, stepping stones where main roads are crossed */
function streetKit(W,o){const S=W.street,{x0,z0,cs,nx,nz,grd,dist,wid}=S,R=RNG(123),put=(n,x,z,rot,opt)=>{ROME.GLB.push({n,x,y:W.gy(x,z)+(opt&&opt.dy||0),z,r:rot,o:Object.assign({inst:1},opt)});},TINT=[[.8,.74,.6],[.74,.5,.1],[.46,.12,.08],[.52,.34,.14],[.36,.17,.28],[.8,.74,.6]];   // undyed linen, saffron, madder, ochre, faded purple
  let nP=0,nS=0,nC=0;const plaza=[];
  for(let j=3;j<nz-3;j+=2)for(let i=3;i<nx-3;i+=2){const k=j*nx+i,g=grd[k];if(!g||g===3)continue;const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs,u=o.urban(x,z);if(u<.25)continue;
    const w=wid[k];
    if(w>=8.5&&g<3&&dist[k]*cs>4.2&&u>.35)plaza.push([x,z,w]);
    const d=dist[k]*cs;if(d<1.2||d>3.8||w<3.4||S.road[k])continue;   // dist is in cells: the first free cell next to a wall is cs away
    const gx=dist[k+1]-dist[k-1],gz=dist[k+nx]-dist[k-nx],l=Math.hypot(gx,gz);if(l<.3)continue;const wx=gx/l,wz=gz/l;   // direction away from the wall
    if(R()>(g===2?.075:.045)*(u>.6?1:.6))continue;if(W.gy(x,z)>o.maxY)continue;
    const r=R(),rot=Math.atan2(-wx,-wz),tint=TINT[Math.floor(R()*TINT.length)];
    if(r<.3)put('rome_awning',x,z,rot,{tint,dy:2.4});
    else if(r<.55)put('rome_counter',x,z,rot);
    else if(r<.75)put('rome_amphorae',x,z,rot);
    else if(r<.85)put('rome_cart',x,z,rot+(R()-.5)*1.2);
    else put('rome_laundry',x-wx*(d-.3),z-wz*(d-.3),rot,{dy:4.4});nP++;}
  plaza.sort(()=>R()-.5);const used=[];
  for(const[x,z,w]of plaza){if(nC>=90)break;if(used.some(p=>Math.hypot(p[0]-x,p[1]-z)<60))continue;used.push([x,z]);
    if(nC%2===0)put('rome_lacus',x,z,R()*TAU);else put('rome_compitum',x,z,R()*TAU);nC++;}
  for(const[w,pts0]of o.roads){if(w<7)continue;const pts=densify(pts0,12);let acc=60;
    for(let p=0;p<pts.length-1;p++){const a=pts[p],b=pts[p+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;acc+=l;if(acc<110)continue;const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;if(S.at(x,z)!==2||o.urban(x,z)<.4)continue;acc=0;
      put('rome_stepping',x,z,Math.atan2(-dx/l,-dz/l),{sx:Math.min(1.6,w/5.3),sy:1,sz:1,dy:.02});nS++;}}   // across the street: the stones' long axis is the road's normal
  console.log('street kit',nP,'props',nC,'fountains/shrines',nS,'stepping stones');}

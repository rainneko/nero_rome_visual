/* ================= STREETS: they grow from the buildings (the author's rule) =================
   A raster over the city (cs m cells) holds the building footprints (W.foot), vegetation and water. Street cells are the open ground
   inside dense, built-up, non-vegetated areas (box-filtered footprint density) plus the main-road lines; specks are dropped, edges smoothed.
   Each cell gets a grade: 3 white marble/travertine (forum, precincts, palace hill), 2 grey stone (main roads, better districts), 1 dirt (lanes,
   poor districts, edges). The mask goes to the terrain shader as a texture (coverage, grade, distance to the nearest wall) plus a coarse
   direction texture (ruts follow the street); steep streets and main roads get real stairs in their district's material; only main roads get raised kerbs. */
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
function streetRoadAllowed(slope,blocked){return !blocked&&Number.isFinite(slope)&&slope<=.30;}
function streetTextureVisible(solid,vegetation,water,naturalVeg,openLand,court,road){return !(solid||water||naturalVeg||court||(vegetation&&!(openLand&&road)));}
function streetGroundAllowed(S,W,x,z){const i=Math.floor((x-S.x0)/S.cs),j=Math.floor((z-S.z0)/S.cs);if(i<0||j<0||i>=S.nx||j>=S.nz)return false;const k=j*S.nx+i;if(S.solid[k]||S.water[k]||S.waterAt?.(x,z)||S.naturalVeg[k]||S.court[k])return false;const sx=(W.gy(x+4,z)-W.gy(x-4,z))/8,sz=(W.gy(x,z+4)-W.gy(x,z-4))/8;return streetRoadAllowed(Math.hypot(sx,sz),false);}
function streetRoadPointAllowed(S,W,x,z){const i=Math.floor((x-S.x0)/S.cs),j=Math.floor((z-S.z0)/S.cs);return i>=0&&j>=0&&i<S.nx&&j<S.nz&&!!S.road[j*S.nx+i]&&streetGroundAllowed(S,W,x,z);}
function streetStairFootprintAllowed(S,x,z,dx,dz,run,width,cs,requireEnds=true){const nx=-dz,nz=dx,steps=Math.max(2,Math.ceil(run/cs)),sideSteps=Math.max(2,Math.ceil(width/cs));
  for(let i=0;i<=steps;i++)for(let si=0;si<=sideSteps;si++){const t=-run/2+run*i/steps,side=-width/2+width*si/sideSteps,px=x+dx*t+nx*side,pz=z+dz*t+nz*side,ix=Math.floor((px-S.x0)/cs),iz=Math.floor((pz-S.z0)/cs);if(ix<0||iz<0||ix>=S.nx||iz>=S.nz)return false;const k=iz*S.nx+ix;if(!S.st[k]||S.solid[k]||S.water[k])return false;}
  if(requireEnds)for(const sign of[-1,1]){let linked=false;for(let a=-1;a<=1;a++){const px=x+dx*(sign*(run/2+cs*1.5))+nx*a*width*.35,pz=z+dz*(sign*(run/2+cs*1.5))+nz*a*width*.35,ix=Math.floor((px-S.x0)/cs),iz=Math.floor((pz-S.z0)/cs);if(ix<0||iz<0||ix>=S.nx||iz>=S.nz)continue;const k=iz*S.nx+ix;if(S.st[k]&&!S.solid[k]&&!S.water[k])linked=true;}if(!linked)return false;}
  return true;}
function streetCompactUPlan(F0,gy,spans,turns,depthRatio=1.42,maxRelief=1.84,sampleStep=2.5,offsets=[[0,0],[0,2],[0,-2],[2,0],[-2,0],[0,4],[0,-4],[4,0],[-4,0]],fit=[26,44,4]){for(const span of spans){for(const turn of turns)for(const[offsetX,offsetZ]of offsets){const F=F0.sub(offsetX,0,offsetZ,turn),depth=span*depthRatio,half=span/2,wingDepth=Math.min(5,span*.12),z0=-depth/2,z1=depth/2;
    const fitX=fit[0]*Math.abs(Math.cos(turn))+fit[1]*Math.abs(Math.sin(turn)),fitZ=fit[0]*Math.abs(Math.sin(turn))+fit[1]*Math.abs(Math.cos(turn));if(half-wingDepth<fitX/2+fit[2]+Math.abs(offsetX)||depth/2-wingDepth<fitZ/2+fit[2]+Math.abs(offsetZ))continue;
    const wings=[{lines:[[-half,z0,-half,z1],[-half+wingDepth,z0,-half+wingDepth,z1-wingDepth]]},{lines:[[half,z1,half,z0],[half-wingDepth,z1-wingDepth,half-wingDepth,z0]]},{lines:[[-half,z1,half,z1],[-half+wingDepth,z1-wingDepth,half-wingDepth,z1-wingDepth]]}],heights=[];
    for(const wing of wings)for(const[ax,az,bx,bz]of wing.lines){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),rot=Math.atan2(-dz,dx),S=F.sub((ax+bx)/2,0,(az+bz)/2,rot),n=Math.ceil(L/sampleStep);for(let i=0;i<=n;i++){const q=S.p(-L/2+L*i/n,0,0);heights.push(gy(q[0],q[2]));}}
    const lo=Math.min(...heights),hi=Math.max(...heights);if(hi-lo<=maxRelief)return{F,span,depth,wingDepth,wings,lo,hi,relief:hi-lo,offsetX,offsetZ};}}return null;}
function streetPrecinctWingColumns(plan,wingIndex,spacing,gy,floorY){const columns=[];let supportMin=Infinity,supportMax=-Infinity,run=0;for(let row=0;row<2;row++){const[ax,az,bx,bz]=plan.wings[wingIndex].lines[row],L=Math.hypot(bx-ax,bz-az),rot=Math.atan2(-(bz-az),bx-ax),S=plan.F.sub((ax+bx)/2,0,(az+bz)/2,rot),n=Math.max(1,Math.ceil(L/spacing));run=Math.max(run,L);
    for(let i=0;i<=n;i++){const t=i/n,q=S.p(-L/2+L*t,0,0),ground=gy(q[0],q[2]),support=floorY-ground;columns.push({x:q[0],y:floorY,z:q[2],ground,support,row,station:i/n});supportMin=Math.min(supportMin,support);supportMax=Math.max(supportMax,support);}}
  return{columns,supportMin,supportMax,run,depth:plan.wingDepth};}
/* o: {zone(x,z)->1|2|3 grade of ordinary streets, marble(x,z)->bool, veg(x,z)->bool, water(x,z)->bool, roads:[[w,pts],...], urban(x,z)->0..1} */
function buildStreets(W,o){const t0=performance.now(),F=W.foot.list;let bx0=1e9,bz0=1e9,bx1=-1e9,bz1=-1e9;
  for(const f of F){if(f.tag==='road'||f.tag==='open'||f.r>400)continue;bx0=Math.min(bx0,f.cx);bx1=Math.max(bx1,f.cx);bz0=Math.min(bz0,f.cz);bz1=Math.max(bz1,f.cz);}
  const cs=Q.name==='low'&&!TEST?3.5:2.5,x0=Math.max(bx0-160,-3000),z0=Math.max(bz0-160,-2700),nx=Math.ceil((Math.min(bx1+160,3000)-x0)/cs),nz=Math.ceil((Math.min(bz1+160,3500)-z0)/cs),N=nx*nz;
  const solid=new Uint8Array(N),veg=new Uint8Array(N),openLand=new Uint8Array(N),court=new Uint8Array(N),temple=new Uint8Array(N),K=(i,j)=>j*nx+i;
  for(const f of F){if(f.tag==='road')continue;const open=f.tag==='open'||f.tag==='court',isCourt=open&&(!!f.siteRole||!!f.reservation||f.tag==='court'),m=open?0:.3,r=f.r+1,i0=Math.max(0,Math.floor((f.cx-r-x0)/cs)),i1=Math.min(nx-1,Math.floor((f.cx+r-x0)/cs)),j0=Math.max(0,Math.floor((f.cz-r-z0)/cs)),j1=Math.min(nz-1,Math.floor((f.cz+r-z0)/cs));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+(i+.5)*cs-f.cx,z=z0+(j+.5)*cs-f.cz,u=f.c*x-f.s*z,v=f.s*x+f.c*z;
      if(f.poly?nobleInside(x+f.cx,z+f.cz,f.poly):(Math.abs(u)<=f.hw+m&&Math.abs(v)<=f.hd+m)){if(open){veg[K(i,j)]=1;openLand[K(i,j)]=1;if(isCourt)court[K(i,j)]=1;}else{solid[K(i,j)]=1;if(f.t)temple[K(i,j)]=1;}}}}
  // vegetation and water on a 10 m lattice, nearest-sampled
  const wat=new Uint8Array(N),naturalVeg=new Uint8Array(N),lat=Math.max(1,Math.round(10/cs));{const lx=Math.ceil(nx/lat)+1,lz=Math.ceil(nz/lat)+1,V=new Uint8Array(lx*lz),Wt=new Uint8Array(lx*lz);
    for(let j=0;j<lz;j++)for(let i=0;i<lx;i++){const x=x0+(i*lat+lat/2)*cs,z=z0+(j*lat+lat/2)*cs;V[j*lx+i]=o.veg(x,z)?1:0;Wt[j*lx+i]=o.water(x,z)?1:0;}
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const kk=K(i,j),k=Math.floor(j/lat)*lx+Math.floor(i/lat);if(V[k]){veg[kk]=1;naturalVeg[kk]=1;}if(Wt[k])wat[kk]=1;}}
  const dist=stChamfer(solid,nx,nz),dens=stBlur(solid,nx,nz,Math.round(16/cs)),dens2=stBlur(solid,nx,nz,Math.round(30/cs));
  const st=new Uint8Array(N);
  for(let k=0;k<N;k++){if(solid[k]||veg[k]||wat[k])continue;const d=dist[k]*cs;if(d<=9&&(dens[k]>=.13||(d<=4&&dens2[k]>=.1)))st[k]=1;}   // streets hug buildings: no street more than 9 m from a wall (no highway rings round hills)
  // drop specks, smooth the edge (majority)
  {const min=Math.round(260/(cs*cs));stComps(st,nx,nz,c=>{if(c.length<min)for(let a=0;a<c.length;a++)st[c[a]]=0;},true);}
  for(let it=0;it<2;it++){const s2=st.slice();for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=K(i,j);if(solid[k]||wat[k]||veg[k]){s2[k]=0;continue;}
    const n=st[k-1]+st[k+1]+st[k-nx]+st[k+nx]+st[k-nx-1]+st[k-nx+1]+st[k+nx-1]+st[k+nx+1]+st[k];s2[k]=(st[k]||n>=5)?1:0;}st.set(s2);}   // only fills: thin alleys (one cell wide) must survive
  // main roads: stone inside the city, dirt in the country unless wide; direction field for ruts. An uphill piece (roadHillSplit, {hill:true}) is an
  // ordinary street paved by its district: marble on the monumental hills and precincts, stone in the city, earth in the country. 【史】Even the climb
  // out of the Subura had stone steps, "numquam sicco sordida saxa gradu" (Martial 5.22); earth steps are for the lanes of poor quarters (streetStairs).
  const region=(x,z,ur=o.urban(x,z))=>o.marble(x,z)?3:ur>.45?2:1;
  const road=new Uint8Array(N),NC=4,nxc=Math.ceil(nx/NC),nzc=Math.ceil(nz/NC),ax=new Float32Array(nxc*nzc),az=new Float32Array(nxc*nzc),aw=new Float32Array(nxc*nzc);
  for(const[w,pts0,meta]of o.roads){const hill=!!meta?.hill,pts=densify(pts0,cs*.8);for(let p=0;p<pts.length-1;p++){const a=pts[p],b=pts[p+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,tx=dx/l,tz=dz/l,x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,ur=o.urban(x,z),hw=w*(ur>.45?.5:(w>=9||w<=6)?.5:.3),rg=hill?region(x,z,ur):ur>.45||w>=9?2:1;
      const i0=Math.max(0,Math.floor((x-hw-x0)/cs)),i1=Math.min(nx-1,Math.floor((x+hw-x0)/cs)),j0=Math.max(0,Math.floor((z-hw-z0)/cs)),j1=Math.min(nz-1,Math.floor((z+hw-z0)/cs));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=K(i,j);if(solid[k]||wat[k])continue;const cx=x0+(i+.5)*cs-x,cz=z0+(j+.5)*cs-z;if(Math.hypot(cx,cz)>hw+cs*.5)continue;
        // A main road runs on its graded bed (gradeRoads): only the grade along it counts, the cross fall belongs to the bank. Steeper than 30 %
        // along a wide road the paint stops; an uphill piece keeps it (roadStairs models a flight on it, the paint is its apron). It crosses gardens and wooded slopes: the road wins there.
        const rx=x0+(i+.5)*cs,rz=z0+(j+.5)*cs;
        if(court[k])continue;const sx=(W.gy(rx+4,rz)-W.gy(rx-4,rz))/8,sz=(W.gy(rx,rz+4)-W.gy(rx,rz-4))/8;if(!hill&&!streetRoadAllowed(Math.abs(sx*tx+sz*tz),false))continue;veg[k]=naturalVeg[k]=0;
        st[k]=1;road[k]=rg;const kc=Math.floor(j/NC)*nxc+Math.floor(i/NC);ax[kc]+=3*(tx*tx-tz*tz);az[kc]+=3*2*tx*tz;aw[kc]+=3;}}}
  const plz=new Uint8Array(N);   // 'plaza' rects (5th entry): paved squares, always grade 3 (warm beige-grey slabs)
  for(const[xa,za,xb,zb,kind]of o.paved||[]){const i0=Math.max(0,Math.floor((xa-x0)/cs)),i1=Math.min(nx-1,Math.floor((xb-x0)/cs)),j0=Math.max(0,Math.floor((za-z0)/cs)),j1=Math.min(nz-1,Math.floor((zb-z0)/cs));   // market squares and the like: an open area with a purpose is paved
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=K(i,j);if(!solid[k]&&!wat[k]&&!naturalVeg[k]&&!court[k]){st[k]=1;road[k]=2;if(kind==='plaza')plz[k]=1;}}}
  // stair feet and hillRoute joins: the mask must not balloon round them (a 30 m paved blob next to the Apollo stair). Within FR m of a foot only a road-width strip
  // (7 m) along the stair's axis and the real road corridors stay; everything else that the building-hugging growth added is dropped.
  for(const f of o.feet||[]){const FR=f.r||40,i0=Math.max(0,Math.floor((f.x-FR-x0)/cs)),i1=Math.min(nx-1,Math.floor((f.x+FR-x0)/cs)),j0=Math.max(0,Math.floor((f.z-FR-z0)/cs)),j1=Math.min(nz-1,Math.floor((f.z+FR-z0)/cs));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=K(i,j);if(!st[k]||road[k])continue;const rx=x0+(i+.5)*cs-f.x,rz=z0+(j+.5)*cs-f.z;if(Math.hypot(rx,rz)>FR)continue;
      const al=rx*f.dx+rz*f.dz,pe=Math.abs(rx*f.dz-rz*f.dx);if(al>=-3&&pe<=3.5)continue;st[k]=0;}}
  // The 10 m coarse water lattice is only a broad phase. Recheck every
  // accepted street cell against the actual shoreline before assigning grades.
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=K(i,j);if(st[k]&&!wat[k]&&o.water(x0+(i+.5)*cs,z0+(j+.5)*cs))wat[k]=1;if(solid[k]||wat[k]||court[k]){st[k]=0;road[k]=0;}}
  // lanes cut through the blocks (genBlocks o.lanes, W.laneLog): a street along each, also where the bounding boxes of slanted lots reach over it
  for(const P of o.lanes||[]){const a=lp(P[0],P[1],.5),b=lp(P[3],P[2],.5),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,hw=Math.hypot(P[1][0]-P[0][0],P[1][1]-P[0][1])/2+.5,
      i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-hw-x0)/cs)),i1=Math.min(nx-1,Math.floor((Math.max(a[0],b[0])+hw-x0)/cs)),j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-hw-z0)/cs)),j1=Math.min(nz-1,Math.floor((Math.max(a[1],b[1])+hw-z0)/cs));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=K(i,j),rx=x0+(i+.5)*cs-a[0],rz=z0+(j+.5)*cs-a[1],t=(rx*dx+rz*dz)/l;if(t<0||t>l||Math.abs(rx*dz-rz*dx)/l>hw||wat[k]||court[k])continue;st[k]=1;solid[k]=0;}}

  // width of each street (distance to the nearest non-street, local maximum) -> alleys narrower than ~3 m are dirt
  const nonSt=new Uint8Array(N);for(let k=0;k<N;k++)nonSt[k]=st[k]?0:1;const dN=stChamfer(nonSt,nx,nz),wid=new Float32Array(N);
  {const R=2,m2=new Float32Array(N);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=K(i,j);if(!st[k])continue;let m=0;for(let b=-R;b<=R;b++){const jj=j+b;if(jj<0||jj>=nz)continue;for(let a=-R;a<=R;a++){const ii=i+a;if(ii<0||ii>=nx)continue;const v=dN[K(ii,jj)];if(v>m)m=v;}}m2[k]=m*2*cs;}wid.set(m2);}
  // grades
  const grd=new Uint8Array(N),tdist=stChamfer(temple,nx,nz);let cnt=[0,0,0,0];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=K(i,j);if(!st[k])continue;const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs;let g;
    if(plz[k]||tdist[k]*cs<=16||(o.marble(x,z)&&dist[k]*cs<=12&&!road[k]))g=3;
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
  for(let k=0;k<N;k++){if(sm[k]>0&&!wat[k]){const i=k%nx,j=(k-i)/nx;if(o.water(x0+(i+.5)*cs,z0+(j+.5)*cs)){wat[k]=1;grd[k]=0;road[k]=0;}}const visible=streetTextureVisible(solid[k],veg[k],wat[k],naturalVeg[k],openLand[k],court[k],road[k]);T1[k*4]=visible?Math.min(255,sm[k]*255*1.15):0;T1[k*4+1]=visible?(gg[k]===1?64:gg[k]===2?128:gg[k]===3?192:0):0;T1[k*4+2]=Math.min(255,dist[k]*cs/8*255);T1[k*4+3]=255;}
  // T2 alpha: where the street centre lies across each coarse cell, measured from the cell centre along the shader's own (quantized) normal, so the
  // dirt ruts run along the street and not in rings around the world origin. dN^4 weights put a two-cell street's centre between its cells.
  // Blue (rut strength) is 0 on squares wider than 14 m.
  const T2=new Uint8Array(nxc*nzc*4);for(let k=0;k<nxc*nzc;k++){const l=Math.hypot(ax[k],az[k]),vx=l>1e-4?ax[k]/l:0,vz=l>1e-4?az[k]/l:0;T2[k*4]=Math.round((vx*.5+.5)*255);T2[k*4+1]=Math.round((vz*.5+.5)*255);
    const ic=k%nxc,jc=(k-ic)/nxc,th=.5*Math.atan2(T2[k*4+1]/255*2-1,T2[k*4]/255*2-1),nvx=-Math.sin(th),nvz=Math.cos(th),tcx=x0+(ic+.5)*NC*cs,tcz=z0+(jc+.5)*NC*cs;let sw=0,sa=0,mx=0;
    for(let j=jc*NC-1;j<=jc*NC+NC;j++)for(let i=ic*NC-1;i<=ic*NC+NC;i++){if(i<0||j<0||i>=nx||j>=nz)continue;const kk=K(i,j);if(!st[kk])continue;const d=dN[kk],w=d*d*d*d;if(d>mx)mx=d;sw+=w;sa+=w*((x0+(i+.5)*cs-tcx)*nvx+(z0+(j+.5)*cs-tcz)*nvz);}
    const off=sw>0?sa/sw:0;T2[k*4+2]=mx*cs>7?0:Math.min(255,aw[k]*40);T2[k*4+3]=Math.round(Math.max(0,Math.min(255,(off/8*.5+.5)*255)));}
  const mk=(d,w,h,mip)=>{const t=new THREE.DataTexture(d,w,h,THREE.RGBAFormat,THREE.UnsignedByteType);t.magFilter=THREE.LinearFilter;t.minFilter=mip?THREE.LinearMipmapLinearFilter:THREE.LinearFilter;t.generateMipmaps=!!mip;t.flipY=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;return t;};
  U.uSt.value=mk(T1,nx,nz,true);U.uStA.value=mk(T2,nxc,nzc,false);U.uStX.value.set(x0,z0,nx*cs,nz*cs);U.uStN.value.set(nx,nz);
  W.street={x0,z0,cs,nx,nz,st,grd,solid,veg,openLand,naturalVeg,court,water:wat,wid,dist,road,ax,az,texture:T1,cen:T2,waterAt:o.water,nxc,NC,region,at:(x,z)=>{const i=Math.floor((x-x0)/cs),j=Math.floor((z-z0)/cs);return i<0||j<0||i>=nx||j>=nz?0:grd[j*nx+i];}};
  W.streetAt=(x,z)=>W.street.at(x,z)>0;
  console.log('streets',nx+'x'+nz,'cs',cs,'dirt',cnt[1],'stone',cnt[2],'marble',cnt[3],Math.round(performance.now()-t0)+' ms');}
/* Stairs by district (author, 2026-10-26: 大理石、砖石、泥巴). 3 white marble, cheek walls on both sides with a coping; 2 grey stone treads, brick
   cheek walls (opus latericium) where the ground falls away; 1 packed earth held by a timber board at each nosing, no cheek walls. ri: the riser. */
const STAIR_MAT={3:{tread:6,cheek:[6],coping:2,both:true,ri:.16},2:{tread:38,cheek:[9,.6,0,1],ri:.18},1:{tread:21,board:3,ri:.2}};
// one step in frame F, centred at local z, tread depth td, half width hw, top at yy (the frame's y is 0)
function stairStep(g,M,F,z,td,hw,yy,s){g.set(M.tread,.4+(s%5)*.05);box(g,F,0,yy-1.3,z,hw,1.3,td/2+.02,27);   // no uphill face: the step above hides it
  if(M.board){g.set(M.board,.45+(s%3)*.1);box(g,F,0,yy-.22,z+td/2-.07,hw,.23,.08,17);}}   // the board at the downhill edge holds the earth, flush with it (proud boards read as railway sleepers)
function stairCheek(W,g,M,F,z,len,hw,yy){if(!M.cheek)return;
  for(const sd of[-1,1]){const q=F.p(sd*(hw+.5),0,z);if(!M.both&&W.gy(q[0],q[2])>=yy-.55)continue;const wh=M.both?.62:.45;g.set(...M.cheek);box(g,F,sd*(hw+.2),yy-1.3,z,.2,1.3+wh,len/2+.02,31);
    if(M.coping){g.set(M.coping,.5);box(g,F,sd*(hw+.2),yy+wh,z,.3,.1,len/2+.02,31);}}}
/* the free stretch of a street across a line: for each station t0..t1 (cs/2 apart) along (dx,dz) through (cx,cz), the clear interval across the street
   nearest the line (street cells, no building, no water); then the longest window of stations where the common interval is at least wmin wide.
   Returns {ta,tb,off,w} (off: the window's centre across the line, w: its clear width) or null. */
function streetStairFit(S,cx,cz,dx,dz,t0,t1,maxW,wmin){const{x0,z0,cs,nx,nz}=S,nX=-dz,nZ=dx,H=maxW/2+2,
    free=(x,z)=>{const i=Math.floor((x-x0)/cs),j=Math.floor((z-z0)/cs);if(i<0||j<0||i>=nx||j>=nz)return false;const k=j*nx+i;return !!S.st[k]&&!S.solid[k]&&!S.water[k];};
  const T=[],LO=[],HI=[];for(let t=t0;t<=t1+1e-6;t+=cs/2){const px=cx+dx*t,pz=cz+dz*t;let best=null,a=null;
    for(let o=-H;o<=H+1e-6;o+=.5){const f=free(px+nX*o,pz+nZ*o);if(f&&a===null)a=o;if((!f||o>H-.25)&&a!==null){const b=f?o:o-.5,d=b<0?-b:a>0?a:0;if(!best||d<best.d)best={a,b,d};a=null;}}
    T.push(t);if(best&&best.d<=2){LO.push(best.a-.25);HI.push(best.b+.25);}else{LO.push(1);HI.push(-1);}}   // a cell is cs wide: half a step either side of the last free sample
  let win=null;for(let a=0;a<T.length;a++){let lo=-1e9,hi=1e9;for(let b=a;b<T.length;b++){lo=Math.max(lo,LO[b]);hi=Math.min(hi,HI[b]);if(hi-lo<wmin)break;if(!win||T[b]-T[a]>win.tb-win.ta)win={ta:T[a],tb:T[b],off:(lo+hi)/2,w:hi-lo};}}
  return win;}
/* stairs: connected steep street cells become flights along the slope, in their district's material (STAIR_MAT, the street grade). Each flight is fitted
   to its street (streetStairFit): the longest straight stretch along the patch's fall line that is at least 2.4 m clear, as wide as it is clear less 0.3 m
   a side (at most 7 m, 9 m in marble), opening onto street at both ends (straight on, or to a side where the street bends). A climb longer than 36 m becomes several flights. Each tread sits on the ground
   under it, at least 5 cm below the one above. Patches wider than 12 m are street networks on a hillside and stay ramps. Main-road cells are left to
   roadStairs, and so is anything within 12 m of one of its flights. S.stair marks the cells the flights cover (no stalls or carts there). */
function streetStairs(W){const S=W.street,{x0,z0,cs,nx,nz,grd}=S,N=nx*nz,gy=W.gy,steep=new Uint8Array(N),gxA=new Float32Array(N),gzA=new Float32Array(N),g=new GB(1<<16),RS=W.roadStairs||[];let nSt=0;const nMat={1:0,2:0,3:0},why={};
  const no=r=>{why[r]=(why[r]||0)+1;};S.stair=new Uint8Array(N);
  for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(!grd[k]||S.road[k])continue;const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs,dx=(gy(x+cs,z)-gy(x-cs,z))/(2*cs),dz=(gy(x,z+cs)-gy(x,z-cs))/(2*cs);
    const m2=dx*dx+dz*dz;if(m2>(grd[k]===3?.0121:grd[k]===2?.0256:.04)){   // marble streets turn to stairs from ~11 %, stone ones from ~16 %, earth lanes from 20 %
      const kc=Math.floor(j/S.NC)*S.nxc+Math.floor(i/S.NC),l=Math.hypot(S.ax[kc],S.az[kc]);
      // only where the street runs along the slope (street axis within ~30 deg of the gradient; doubled angles): a street across a slope is a terrace, not a climb
      if(l>1e-3&&((dx*dx-dz*dz)*S.ax[kc]+2*dx*dz*S.az[kc])/(m2*l)>.5){steep[k]=1;gxA[k]=dx;gzA[k]=dz;}}}
  const comps=[];stComps(steep,nx,nz,c=>{if(c.length>=7)comps.push(Array.from(c));});comps.sort((a,b)=>b.length-a.length);
  // one flight from (ax,az) down along (dx,dz): treads on the ground, a landing every 12 steps when there is room; false if it would be a cliff or a ramp
  const flight=(M,ax,az,dx,dz,run,hw,yb)=>{const F=frame(ax,0,az,Math.atan2(dx,dz)),yt=gy(ax,az),drop=yt-yb;if(drop<1.1)return false;
    let n=Math.max(4,Math.round(drop/M.ri)),nL=Math.floor((n-1)/12),ld=Math.min(2.4,run*.12),td=(run-nL*ld)/n;if(td<.3){nL=0;td=run/n;}if(td<.26){n=Math.floor(run/.26);td=run/n;}
    if(n<4||drop/n>.3||td>1.5)return false;let z=0,yp=yt+.05;
    for(let s=0;s<n;s++){const land=nL>0&&(s+1)%12===0&&s<n-1,len=td+(land?ld:0),q=F.p(0,0,z+td/2),yy=Math.max(yb,Math.min(yp-.05,gy(q[0],q[2])+.04));stairStep(g,M,F,z+td/2,td,hw,yy,s);
      if(land){g.set(M.tread,.4);box(g,F,0,yy-1.3,z+td+ld/2,hw,1.3,ld/2+.02,31);}stairCheek(W,g,M,F,z+len/2,len,hw,yy);z+=len;yp=yy;}
    for(let t=0;t<=run;t+=cs/2)for(let o=-hw;o<=hw+1e-6;o+=cs/2){const q=F.p(o,0,t),i=Math.floor((q[0]-x0)/cs),j=Math.floor((q[2]-z0)/cs);if(i>=0&&j>=0&&i<nx&&j<nz)S.stair[j*nx+i]=1;}
    return n;};
  for(const c of comps){let sx=0,sz=0,mx=0,mz=0;const ng=[0,0,0,0];for(const k of c){sx+=gxA[k];sz+=gzA[k];const i=k%nx,j=(k-i)/nx;mx+=x0+(i+.5)*cs;mz+=z0+(j+.5)*cs;ng[grd[k]]++;}
    const l=Math.hypot(sx,sz)||1,dx=-sx/l,dz=-sz/l;mx/=c.length;mz/=c.length;const px=-dz,pz=dx;let t0=1e9,t1=-1e9;const pp=[];
    for(const k of c){const i=k%nx,j=(k-i)/nx,x=x0+(i+.5)*cs-mx,z=z0+(j+.5)*cs-mz,t=x*dx+z*dz;pp.push(x*px+z*pz);t0=Math.min(t0,t);t1=Math.max(t1,t);}
    const mat=ng[3]>c.length*.5?3:ng[1]>c.length*.5?1:2,M=STAIR_MAT[mat],maxW=mat===3?9:7;
    pp.sort((a,b)=>a-b);const pc=pp[pp.length>>1],span=pp[Math.floor(pp.length*.9)]-pp[Math.floor(pp.length*.1)];if(span>12){no('wide');continue;}   // a street network on a hillside, not one climb: it stays a ramp
    const cx=mx+px*pc,cz=mz+pz*pc,fit=streetStairFit(S,cx,cz,dx,dz,t0-cs*.8,t1+cs*.8,maxW,2.4);if(!fit||fit.tb-fit.ta<4){no('narrow');continue;}
    const ox=cx+px*fit.off,oz=cz+pz*fit.off,run=fit.tb-fit.ta,hw=Math.min(maxW,fit.w-.6)/2,mid=[ox+dx*(fit.ta+fit.tb)/2,oz+dz*(fit.ta+fit.tb)/2];
    if(!streetStairFootprintAllowed(S,mid[0],mid[1],dx,dz,run,hw*2,cs,false)){no('foot');continue;}
    // each end opens onto street: straight on, or to a side where the street bends (the flight then stops at least 1.25 m short of the wall ahead)
    const opens=sg=>{for(let a=.6;a<=4;a+=.7)for(let o=-hw-3;o<=hw+3;o+=1){const x=mid[0]+dx*sg*(run/2+a)+px*o,z=mid[1]+dz*sg*(run/2+a)+pz*o,i=Math.floor((x-x0)/cs),j=Math.floor((z-z0)/cs);if(i<0||j<0||i>=nx||j>=nz)continue;const kk=j*nx+i;if(S.st[kk]&&!S.solid[kk]&&!S.water[kk])return true;}return false;};
    if(!opens(-1)||!opens(1)){no('ends');continue;}
    if(RS.some(r=>Math.hypot(r.x-mid[0],r.z-mid[1])<r.len/2+run/2+12)){no('road');continue;}
    const k=Math.ceil(run/36),seg=run/k;let built=0;
    for(let q=0;q<k;q++){const ta=fit.ta+q*seg,ax=ox+dx*ta,az=oz+dz*ta,bx=ax+dx*seg,bz=az+dz*seg,n=flight(M,ax,az,dx,dz,seg,hw,gy(bx,bz));
      if(n){(W.stairList=W.stairList||[]).push({x:ax,z:az,dx,dz,w:hw*2,run:seg,mat,marble:mat===3,drop:gy(ax,az)-gy(bx,bz),n});nSt++;nMat[mat]++;built++;}}
    if(!built)no('slope');}
  const m=layTag(g.mesh(MAT.city),'stairs');if(m){m.name='streetStairs';W.scene.add(m);}W.nStairs=nSt;W.stairMat=nMat;W.stairWhy=why;console.log('street stairs',nSt,'from',comps.length,'steep street patches',JSON.stringify(nMat),JSON.stringify(why));}
/* main-road stairs: where a road's graded bed still climbs more than 30 % (gradeRoads caps its cut and fill at 4 m) the paint stops and a flight follows
   the road, as wide as the road, in its district's material (S.region). A run is where the signed grade over +-2.5 m passes 30 %, grown while it stays
   above 18 % the same way; same-way runs less than 5 m apart are one flight; a flight needs 1 m of drop and treads of at least 26 cm.
   o.layerAt(x,z): a story-state group for a flight there (the streets the Golden House takes), or null. */
function roadStairs(W,list,o={}){const S=W.street,gy=W.gy,g0=new GB(1<<15),gl={},out=W.roadStairs=[],nMat={1:0,2:0,3:0};
  for(const[w,P]of list){const D=densify(P,1),m=D.length,cum=[0];for(let i=1;i<m;i++)cum.push(cum[i-1]+Math.hypot(D[i][0]-D[i-1][0],D[i][1]-D[i-1][1]));
    const Y=D.map(p=>gy(p[0],p[1])),gs=D.map((p,i)=>{let a=i,b=i;while(a>0&&cum[i]-cum[a]<2.5)a--;while(b<m-1&&cum[b]-cum[i]<2.5)b++;return(Y[b]-Y[a])/Math.max(.5,cum[b]-cum[a]);});
    const runs=[];for(let i=0;i<m;i++){if(Math.abs(gs[i])<=.3)continue;const sg=Math.sign(gs[i]);let a=i,b=i;while(a>0&&gs[a-1]*sg>.18)a--;while(b<m-1&&gs[b+1]*sg>.18)b++;
      const L=runs[runs.length-1];if(L&&L.sg===sg&&cum[a]-cum[L.b]<5)L.b=Math.max(L.b,b);else runs.push({a,b,sg});i=b;}
    for(const{a,b,sg}of runs){const len=cum[b]-cum[a],drop=Math.abs(Y[b]-Y[a]);if(drop<1||len<2)continue;
      const mid=D[(a+b)>>1],mat=S.region(mid[0],mid[1]),M=STAIR_MAT[mat];let n=Math.max(3,Math.round(drop/M.ri));if(len/n<.26)n=Math.floor(len/.26);const rr=drop/n;if(n<3||rr>.32)continue;   // steeper than that is a cliff: no flight
      const td=len/n,yt=Math.max(Y[a],Y[b]),hw=w/2,dir=sg<0?1:-1,lk=o.layerAt&&o.layerAt(mid[0],mid[1]),g=lk?(gl[lk]||(gl[lk]=new GB(1<<12))):g0;
      const at=u=>{const s=sg<0?cum[a]+u:cum[b]-u;let i=a;while(i<b-1&&cum[i+1]<s)i++;const j=i+1,t=clamp((s-cum[i])/Math.max(1e-6,cum[j]-cum[i]),0,1),tx=(D[j][0]-D[i][0])*dir,tz=(D[j][1]-D[i][1])*dir,l=Math.hypot(tx,tz)||1;
        return frame(lerp(D[i][0],D[j][0],t),0,lerp(D[i][1],D[j][1],t),Math.atan2(tx/l,tz/l));};   // the frame's +z points downhill along the road
      // each tread sits on the bed under it (a straight run sank into humps and floated over sags), at least 5 cm below the step above, never below the foot
      let yp=yt+.05;for(let s=0;s<n;s++){const F=at((s+.5)*td),yy=Math.max(yt-drop,Math.min(yp-.05,gy(F.ox,F.oz)+.04));stairStep(g,M,F,0,td,hw,yy,s);stairCheek(W,g,M,F,0,td,hw,yy);yp=yy;}
      out.push({x:mid[0],z:mid[1],w,len:+len.toFixed(1),drop:+drop.toFixed(1),n,mat});nMat[mat]++;}}
  const m=layTag(g0.mesh(MAT.city),'stairs');if(m)W.scene.add(m);for(const k in gl){const mk=layTag(gl[k].mesh(MAT.city),'stairs');if(mk)preLayerGroup(W,k).add(mk);}
  W.roadStairMat=nMat;console.log('road stairs',out.length,JSON.stringify(nMat));return out;}
// raised kerbs and sidewalks only along the grey-stone main roads (they stop where the road is dirt or a building stands)
function roadKerbs(W,list,o={}){const g0=new GB(1<<16),S=W.street,gl={};let g=g0;   // o.layerAt(x,z): a story-state group key for the kerb there (e.g. the streets the Golden House takes), or null
  for(const[w,pts0]of list){if(w<7)continue;const pts=densify(pts0,2);
    for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,tx=dx/l,tz=dz/l,nx=tz,nz=-tx,mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
      if(S.at(mx,mz)!==2||!streetRoadPointAllowed(S,W,mx,mz))continue;const rich=Math.hypot(mx-17,mz+22)<420,hw=w/2,lk=o.layerAt&&o.layerAt(mx,mz);g=lk?(gl[lk]||(gl[lk]=new GB(1<<12))):g0;
      for(const sd of[1,-1]){const o0=hw,o1=hw+(rich?1.9:1.3),P=(p,o,y)=>[p[0]+sd*nx*o,y,p[1]+sd*nz*o];let ok=true;for(const t of[0,.5,1]){const px=lerp(a[0],b[0],t),pz=lerp(a[1],b[1],t);if(!streetRoadPointAllowed(S,W,px,pz)||!streetGroundAllowed(S,W,px+sd*nx*o0,pz+sd*nz*o0)||!streetGroundAllowed(S,W,px+sd*nx*o1,pz+sd*nz*o1)){ok=false;break;}}if(!ok)continue;   // curb strip follows the same land and grade limits as its road
        const ya=W.gy(P(a,o0,0)[0],P(a,o0,0)[2]),yb=W.gy(P(b,o0,0)[0],P(b,o0,0)[2]),h=.34;
        g.set(38,.4);g.poly([P(a,o0,ya+h),P(b,o0,yb+h),P(b,o1,yb+h),P(a,o1,ya+h)],[0,1,0]);   // worn grey kerb top, no pale edge strip (from above two light strips read as rails)
        g.set(38,.3);g.poly([P(a,o0,ya-.08),P(b,o0,yb-.08),P(b,o0,yb+h),P(a,o0,ya+h)],[-sd*nx,0,-sd*nz]);}}}
  {// wheel ruts of the main grey streets (phase 5b: no drain line, no continuous rails). Each rut is a 0.25 m wide translucent darkening (about 12 % at the centre, soft edges and ends)
    // laid in irregular runs with gaps, never within 6 m of a junction. Drawn with MAT.cityDecal (alpha), so the paving's stones show through.
    const gW=new GB(1<<15),glW={};let nW=0,ri=0;const JR=6;
    const segD=(px,pz,A,B)=>{const dx=B[0]-A[0],dz=B[1]-A[1],l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((px-A[0])*dx+(pz-A[1])*dz)/l2));return Math.hypot(px-A[0]-dx*t,pz-A[1]-dz*t);};
    const dense=list.map(([w,p])=>[w,densify(p,10)]);
    const nearJunction=(x,z,self)=>{for(let r=0;r<dense.length;r++){if(r===self)continue;const[w2,q]=dense[r];for(let i=0;i<q.length-1;i++)if(segD(x,z,q[i],q[i+1])<JR+w2*.5)return true;}return false;};
    for(let ro=0;ro<list.length;ro++){const[w,pts0]=list[ro];if(w<7)continue;const pts=densify(pts0,2.5),cum=[0];
      for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
      const Ltot=cum[cum.length-1],R=RNG(9000+ro*131+Math.round(pts[0][0]+pts[0][1]));
      const at=s=>{let i=1;while(i<cum.length-1&&cum[i]<s)i++;const t=(s-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]),a=pts[i-1],b=pts[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return{x:a[0]+dx*t,z:a[1]+dz*t,nx:dz/l,nz:-dx/l};};
      for(const side of[-1,1]){let s0=R()*8;
        while(s0<Ltot-4){const len=5+R()*R()*30,s1=Math.min(Ltot,s0+len);   // run lengths 5-35 m, mostly short; gaps 2.5-12 m
          if(s1-s0>=4){const steps=Math.max(2,Math.round((s1-s0)/1.5)),row=[];let ok=true;
            for(let k=0;k<=steps;k++){const sp=s0+(s1-s0)*k/steps,c=at(sp),off=side*(.78+.07*Math.sin(sp*.11+ro))+(.12*Math.sin(sp*.37+side*2));
              const x=c.x+c.nx*off,z=c.z+c.nz*off;if(S.at(x,z)!==2||!streetRoadPointAllowed(S,W,x,z)||!streetRoadPointAllowed(S,W,c.x,c.z)||!streetGroundAllowed(S,W,x+c.nx*.125,z+c.nz*.125)||!streetGroundAllowed(S,W,x-c.nx*.125,z-c.nz*.125)||nearJunction(x,z,ro)){ok=false;break;}row.push({x,z,nx:c.nx,nz:c.nz,t:k/steps});}
            if(ok){const hw=.125,P=(q,o)=>{const x=q.x+q.nx*o,z=q.z+q.nz*o;return[x,W.gy(x,z)+.17,z];},lk2=o.layerAt&&o.layerAt(row[0].x,row[0].z),gw=lk2?(glW[lk2]||(glW[lk2]=new GB(1<<12))):gW;
              for(let k=0;k<row.length-1;k++){const a=row[k],b=row[k+1],ta=Math.min(1,Math.min(a.t,1-a.t)*(s1-s0)/3),tb=Math.min(1,Math.min(b.t,1-b.t)*(s1-s0)/3),va=.55+.45*Math.min(1,ta),vb=.55+.45*Math.min(1,tb);
                for(const h of[-1,1]){gw.set(42,.4);gw.poly([P(a,h*hw),P(b,h*hw),P(b,0),P(a,0)],[0,1,0],[[0,va],[0,vb],[1,vb],[1,va]]);}}   // u = 0 at the edges, 1 on the centre line; v = fade at the run ends
              nW++;}}
          s0=s1+2.5+R()*R()*12;ri++;}}}
    const mw=layTag(gW.mesh(MAT.cityDecal,false),'roadDetail');if(mw){mw.renderOrder=2;W.scene.add(mw);}for(const k in glW){const mk=layTag(glW[k].mesh(MAT.cityDecal,false),'roadDetail');if(mk){mk.renderOrder=2;preLayerGroup(W,k).add(mk);}}W.nRoadWear=nW;}
  const m=layTag(g0.mesh(MAT.city,false),'roadDetail');if(m)W.scene.add(m);for(const k in gl){const mk=layTag(gl[k].mesh(MAT.city,false),'roadDetail');if(mk)preLayerGroup(W,k).add(mk);}}
/* street kit (rome_lacus, rome_compitum, rome_stepping, rome_counter, rome_awning, rome_amphorae, rome_cart, rome_laundry): one InstancedMesh per part, placed from the street raster:
   props stand against the walls of dirt and stone streets (back to the wall, found from the wall-distance field), fountains and shrines on the small piazzas, stepping stones where main roads are crossed */
function streetKit(W,o){const S=W.street,{x0,z0,cs,nx,nz,grd,dist,wid}=S,R=RNG(123),put=(n,x,z,rot,opt)=>{ROME.GLB.push({n,x,y:W.gy(x,z)+(opt&&opt.dy||0),z,r:rot,o:Object.assign({inst:1},opt)});},TINT=[[.8,.74,.6],[.74,.5,.1],[.46,.12,.08],[.52,.34,.14],[.36,.17,.28],[.8,.74,.6]];   // undyed linen, saffron, madder, ochre, faded purple
  let nP=0,nS=0,nC=0;const plaza=[];
  for(let j=3;j<nz-3;j+=2)for(let i=3;i<nx-3;i+=2){const k=j*nx+i,g=grd[k];if(!g||g===3)continue;const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs,u=o.urban(x,z);if(u<.25)continue;
    const w=wid[k];
    if(w>=8.5&&g<3&&dist[k]*cs>4.2&&u>.35)plaza.push([x,z,w]);
    const d=dist[k]*cs;if(d<1.2||d>3.8||w<3.4||S.road[k]||S.stair?.[k])continue;   // no stalls on a flight of stairs   // dist is in cells: the first free cell next to a wall is cs away
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
/* hillRoute: a road from a to b (world x,z) that never exceeds slope `lim`: where the straight line is too steep it runs along the contour (to one side, then the other,
   turning at the edge of a corridor of half-width `half`), i.e. a zigzag / switchback. Returns points about `step` m apart. */
function hillRoute(W,a,b,o){const lim=o.lim||.14,half=o.half||30,step=o.step||3,gy=W.gy,P=[a.slice()];P.corners=[];const L0=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L0,uz=(b[1]-a[1])/L0,px=-uz,pz=ux;let x=a[0],z=a[1],s=1,lastFlip=-9;
  for(let n=0;n<900;n++){const dx=b[0]-x,dz=b[1]-z,dd=Math.hypot(dx,dz);if(dd<step*1.6)break;const tx=dx/dd,tz=dz/dd,gx=(gy(x+2,z)-gy(x-2,z))/4,gz=(gy(x,z+2)-gy(x,z-2))/4,g=Math.hypot(gx,gz),gt=gx*tx+gz*tz;
    const dir=()=>{if(Math.abs(gt)<=lim)return[tx,tz];const nx=gx/g,nz=gz/g,v=gt>0?1:-1,k=lim/g,c=Math.sqrt(Math.max(0,1-k*k));return[v*k*nx+s*c*-nz,v*k*nz+s*c*nx];};
    let d=dir();const off=(x-a[0])*px+(z-a[1])*pz;if(n-lastFlip>6&&((off>half&&d[0]*px+d[1]*pz>0)||(off<-half&&d[0]*px+d[1]*pz<0))){s=-s;lastFlip=n;d=dir();P.corners.push(P.length-1);}
    x+=d[0]*step;z+=d[1]*step;P.push([x,z]);}
  P.push(b.slice());return P;}

/* Main-road router (spec 3: the network comes first). A straight stretch between two hand-drawn waypoints is kept when it is clear and its grade stays
   under o.keep. Otherwise A* on an o.cs lattice (16 directions) finds the way. Blocked: the river (o.wet), buildings and reserved sites already in W.foot,
   and grades above o.max. Thin linear things (aqueduct arcades, walls) are passable: roads run under them. The cost grows with the grade above 8 %
   and with the drift from the hand line beyond 40 m. A waypoint may sit inside an obstacle (a forum, a gate): the first and last o.free metres are open; a waypoint on the water is a bridge's middle. */
function roadFoot(W,x,z,r,thin){const F=W.foot,cs=F.cell;   // anything (not a road) within r of (x,z)? thin: count the thin linear ones too
  for(let i=Math.floor((x-r)/cs);i<=Math.floor((x+r)/cs);i++)for(let j=Math.floor((z-r)/cs);j<=Math.floor((z+r)/cs);j++){const a=F.map.get(F.key(i,j));if(!a)continue;
    for(const o of a){if(o.tag==='road'||(!thin&&!o.t&&Math.min(o.hw,o.hd)<=4.2))continue;const dx=x-o.cx,dz=z-o.cz;if(dx*dx+dz*dz>(o.r+r)**2)continue;
      if(o.circ){if(Math.hypot(dx,dz)<o.hw+r)return true;continue;}const u=Math.abs(o.c*dx-o.s*dz)-o.hw,v=Math.abs(o.s*dx+o.c*dz)-o.hd;if(Math.hypot(Math.max(u,0),Math.max(v,0))<r)return true;}}
  return false;}
function roadNear(L,x,z,r){for(const o of L){const dx=x-o.cx,dz=z-o.cz;if(o.circ){if(Math.hypot(dx,dz)<o.hw+r)return true;continue;}const u=Math.abs(o.c*dx-o.s*dz)-o.hw,v=Math.abs(o.s*dx+o.c*dz)-o.hd;if(Math.hypot(Math.max(u,0),Math.max(v,0))<r)return true;}return false;}
function routeRoad(W,way,w,o){const r=w/2+1.5,gy=W.gy,out=[way[0].slice()],free=o.free||30,av=o.avoid||[];   // o.avoid: footprints placed after the roads that the roads must still keep off
  const clear=(x,z,m)=>!o.wet(x,z,r+m)&&!roadFoot(W,x,z,r+m)&&!roadNear(av,x,z,r+m),fr=new Map(way.map(p=>[p,clear(p[0],p[1],0)?0:free]));   // only a waypoint that is itself blocked gets the open radius
  const ok=(x,z,A,B,m=0)=>Math.hypot(x-A[0],z-A[1])<fr.get(A)||Math.hypot(x-B[0],z-B[1])<fr.get(B)||clear(x,z,m);
  const segOK=(a,b,A,B,gmax)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.ceil(L/6)),h=[];
    for(let k=0;k<=n;k++){const x=lerp(a[0],b[0],k/n),z=lerp(a[1],b[1],k/n);if(!ok(x,z,A,B))return false;h.push(gy(x,z));if(k>=2&&Math.abs(h[k]-h[k-2])/(2*L/n)>gmax)return false;}return true;};
  for(let s=0;s<way.length-1;s++){const A=way[s],B=way[s+1];
    if(o.wet(A[0],A[1],0)||o.wet(B[0],B[1],0)||segOK(A,B,A,B,o.keep||.2)){out.push(B.slice());continue;}   // a segment that starts or ends on the water is a bridge deck: kept as drawn
    let P=null;for(const gmax of[o.max||.3,.5])if((P=roadAStar(W,A,B,o,ok,gmax)))break;
    if(!P){(W.roadRouteFail||(W.roadRouteFail=[])).push([A,B]);out.push(B.slice());continue;}   // e.g. the Via Sacra across the Forum square: kept as drawn
    // pull the lattice path straight where the shortcut is clear and no steeper than the stretch it replaces (or o.pull, so the lattice's saw-teeth go)
    const gr=P.map((p,i)=>i?Math.abs(gy(p[0],p[1])-gy(P[i-1][0],P[i-1][1]))/(Math.hypot(p[0]-P[i-1][0],p[1]-P[i-1][1])||1):0),Q=[P[0]];
    for(let i=0;i<P.length-1;){let j=Math.min(P.length-1,i+60);for(;j>i+1;j--){let gm=o.lim||.14;for(let k=i+1;k<=j;k++)gm=Math.max(gm,gr[k]);if(segOK(P[i],P[j],A,B,Math.max(gm,o.pull||.2)+.01))break;}Q.push(P[j]);i=j;}
    // round the corners (a quarter of each leg, at most 18 m) where the rounded cut is clear
    for(let i=1;i<Q.length;i++){const c=Q[i];if(i===Q.length-1){out.push(c);break;}const p=Q[i-1],nx=Q[i+1],lp=Math.hypot(p[0]-c[0],p[1]-c[1]),ln=Math.hypot(nx[0]-c[0],nx[1]-c[1]),
        ka=Math.min(.25*lp,18)/lp,kb=Math.min(.25*ln,18)/ln,c1=[lerp(c[0],p[0],ka),lerp(c[1],p[1],ka)],c2=[lerp(c[0],nx[0],kb),lerp(c[1],nx[1],kb)];
      if(segOK(c1,c2,A,B,.3))out.push(c1,[(c1[0]+2*c[0]+c2[0])/4,(c1[1]+2*c[1]+c2[1])/4],c2);else out.push(c);}}
  return out;}
function roadAStar(W,a,b,o,ok,gmax){const cs=o.cs||6,L=Math.hypot(b[0]-a[0],b[1]-a[1]),pad=Math.min(450,Math.max(160,L*.5)),x0=Math.min(a[0],b[0])-pad,z0=Math.min(a[1],b[1])-pad,
    nx=Math.ceil((Math.max(a[0],b[0])+pad-x0)/cs)+1,nz=Math.ceil((Math.max(a[1],b[1])+pad-z0)/cs)+1,N=nx*nz,H=new Float32Array(N),open=new Uint8Array(N);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=x0+i*cs,z=z0+j*cs;H[k]=W.gy(x,z);open[k]=ok(x,z,a,b,3)?1:0;}   // 3 m more berth than the final check, so the pulled chords stay clear
  const node=p=>Math.round((p[1]-z0)/cs)*nx+Math.round((p[0]-x0)/cs),s=node(a),t=node(b);open[s]=open[t]=1;
  const ux=b[0]-a[0],uz=b[1]-a[1],dev=(x,z)=>{const q=clamp(((x-a[0])*ux+(z-a[1])*uz)/(L*L||1),0,1);return Math.hypot(a[0]+ux*q-x,a[1]+uz*q-z);};
  // states are (node, direction it was entered by): a turn costs o.turn metres at a hairpin, so switchbacks get real legs instead of 6 m saw-teeth
  const D=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1],[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],ND=D.length,S=ND+1,TC=new Float32Array(S*ND),turn=o.turn||0;
  for(let d=0;d<ND;d++)for(let m=0;m<ND;m++){const[a1,b1]=D[d],[a2,b2]=D[m],th=Math.acos(clamp((a1*a2+b1*b2)/Math.hypot(a1,b1)/Math.hypot(a2,b2),-1,1));TC[d*ND+m]=turn*(th/Math.PI)**1.5;}
  const g=new Float32Array(N*S).fill(Infinity),from=new Int32Array(N*S).fill(-1),done=new Uint8Array(N*S),hk=[],hf=[];
  const push=(k,f)=>{let i=hk.length;hk.push(k);hf.push(f);while(i){const p=(i-1)>>1;if(hf[p]<=f)break;hk[i]=hk[p];hf[i]=hf[p];i=p;}hk[i]=k;hf[i]=f;};
  const pop=()=>{const k=hk[0],lk=hk.pop(),lf=hf.pop();if(hk.length){let i=0;for(;;){let c=2*i+1;if(c>=hk.length)break;if(c+1<hk.length&&hf[c+1]<hf[c])c++;if(hf[c]>=lf)break;hk[i]=hk[c];hf[i]=hf[c];i=c;}hk[i]=lk;hf[i]=lf;}return k;};
  const s0=s*S+ND;g[s0]=0;push(s0,L);let end=-1;
  while(hk.length){const st=pop();if(done[st])continue;done[st]=1;const k=(st/S)|0,d=st-k*S;if(k===t){end=st;break;}const i=k%nx,j=(k-i)/nx;
    for(let m=0;m<ND;m++){const[di,dj]=D[m],ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const q=jj*nx+ii,qs=q*S+m;if(!open[q]||done[qs])continue;
      if(Math.abs(di)+Math.abs(dj)===3){const mx=i+di/2,mz=j+dj/2;if(!open[Math.floor(mz)*nx+Math.floor(mx)]||!open[Math.ceil(mz)*nx+Math.ceil(mx)])continue;}   // a knight move may not jump a blocked cell
      const len=cs*Math.hypot(di,dj),gr=Math.abs(H[q]-H[k])/len;if(gr>gmax)continue;
      const x=x0+ii*cs,z=z0+jj*cs,dv=Math.max(0,dev(x,z)-40)/(o.drift||250),ng=g[st]+len*(1+(o.kg||80)*Math.max(0,gr-.08)**2)*(1+dv*dv)+(d<ND?TC[d*ND+m]:0);
      if(ng<g[qs]){g[qs]=ng;from[qs]=st;push(qs,ng+Math.hypot(b[0]-x,b[1]-z));}}}
  if(end<0)return null;
  const P=[];for(let st=end;st>=0;st=from[st]){const k=(st/S)|0,i=k%nx;P.push([x0+i*cs,z0+(k-i)/nx*cs]);}P.reverse();P[0]=a.slice();P[P.length-1]=b.slice();return P;}

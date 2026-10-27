/* ================= 街区生成器：街道网格 → 街区 → 地块 → 建筑（见缝插针） ================= */
const IDF=frame(0,0,0,0);
function pArea(P){let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;}
function pInset(P,d){const n=P.length,Ls=[];for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;Ls.push([a[0]-dz/l*d,a[1]+dx/l*d,dx,dz]);}
  const Q=[];for(let i=0;i<n;i++){const A=Ls[(i+n-1)%n],B=Ls[i],den=A[2]*B[3]-A[3]*B[2];if(Math.abs(den)<1e-6)return null;const t=((B[0]-A[0])*B[3]-(B[1]-A[1])*B[2])/den;Q.push([A[0]+A[2]*t,A[1]+A[3]*t]);}
  if(pArea(Q)<4)return null;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],c=Q[i],e=Q[(i+1)%n];if((b[0]-a[0])*(e[0]-c[0])+(b[1]-a[1])*(e[1]-c[1])<=0)return null;}return Q;}
const lp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const pCen=P=>{let x=0,z=0;for(const p of P){x+=p[0];z+=p[1];}return[x/P.length,z/P.length];};
function houseGround(W,polygon,step=2.5){
  if(!Array.isArray(polygon)||polygon.length<2||polygon.some(p=>!p||!Number.isFinite(p[0])||!Number.isFinite(p[1])))return null;
  step=Number.isFinite(step)&&step>0?step:2.5;
  let min=Infinity,max=-Infinity;const add=(x,z)=>{const h=W.gy(x,z);if(Number.isFinite(h)){min=Math.min(min,h);max=Math.max(max,h);}};
  for(let e=0;e<polygon.length;e++){const a=polygon[e],b=polygon[(e+1)%polygon.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let i=0;i<=n;i++){const t=i/n;add(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);}}
  let area=0;for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];area+=a[0]*b[1]-b[0]*a[1];}
  if(Math.abs(area)>1e-9){const xs=polygon.map(p=>p[0]),zs=polygon.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs),inside=(x,z)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
    let cx=0,cz=0;for(const p of polygon){cx+=p[0]/polygon.length;cz+=p[1]/polygon.length;}if(inside(cx,cz))add(cx,cz);
    const sx=Math.min(step,Math.max((x1-x0)/2,1e-6)),sz=Math.min(step,Math.max((z1-z0)/2,1e-6));for(let z=z0+sz/2;z<z1;z+=sz)for(let x=x0+sx/2;x<x1;x+=sx)if(inside(x,z))add(x,z);
  }
  return min===Infinity?null:{min,max};
}
function lotOBB(L){const a=L[0],b=L[1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l,c=pCen(L);let hw=0,hd=0;
  for(const p of L){const rx=p[0]-c[0],rz=p[1]-c[1];hw=Math.max(hw,Math.abs(rx*ux+rz*uz));hd=Math.max(hd,Math.abs(-rx*uz+rz*ux));}return{cx:c[0],cz:c[1],hw,hd,rot:Math.atan2(-uz,ux),ux,uz};}
// A gallery is actual geometry, not a painted opening. The inner room block is inset;
// no wall crosses the corner between neighbouring exterior arcade runs.
function houseGalleryPlan(L,o){
  const flags=(o.fl||0)|(o.flUp||0),ns=o.nSt||1,sd=o.seed||0;
  const lengths=L.map((a,i)=>Math.hypot(L[(i+1)%L.length][0]-a[0],L[(i+1)%L.length][1]-a[1]));
  if(L.length!==4||Math.min(...lengths)<5.2||ns<2)return[];
  const levels=[],wide=lengths[0]>=14.5,hash=k=>((Math.sin(sd*12.9898+k*78.233)*43758.5453)%1+1)%1;
  if(!o.flat&&(o.loggia||o.loggiaA||(flags&(256|512))))levels.push({level:ns-1,wrap:true});
  // A broad facade may have a single three-bay gallery on storey 3 or 4,
  // always below the penultimate storey. Other bays remain load-bearing wall.
  if(wide&&ns>=5&&hash(81)<.38){const level=ns>=6&&hash(82)>.5?3:2;
    if(level<ns-2)levels.push({level,wrap:false,t0:(1-8.7/lengths[0])/2,t1:(1+8.7/lengths[0])/2});}
  return levels;
}
function houseGallery(W,g,F,L,y,h,o,wrap=true){
  const wallT=.32,walk=wrap?Math.max(.8,Math.min(1.1,Math.min(...L.map((a,i)=>Math.hypot(L[(i+1)%4][0]-a[0],L[(i+1)%4][1]-a[1])))*.12)):Math.hypot(L[3][0]-L[0][0],L[3][1]-L[0][1])-wallT/2;
  const I=wrap?pInset(L,walk+wallT/2):L;
  if(!I)return false;
  const p=(q,z)=>F.p(q[0],z,q[1]),sd=o.seed||.4;
  const edges=wrap?[0,1,2,3]:[0];
  for(const e of edges){const a=L[e],b=L[(e+1)%4],a2=wrap?I[e]:L[3],b2=wrap?I[(e+1)%4]:L[2],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),rot=Math.atan2(-dz,dx),S=F.sub((a[0]+b[0])/2,0,(a[1]+b[1])/2,rot);
    const bays=wrap?Math.max(1,Math.round(len/2.9)):3;
    arcade(g,S,0,y,.0,len,h,bays,wallT,44,{span:.36,attic:.28,pilasters:false,cornice:false,seed:sd});
    g.set(44,sd);g.poly([p(a,y+.02),p(b,y+.02),p(b2,y+.02),p(a2,y+.02)],F.d(0,1,0));
    g.set(44,sd);g.poly([p(a,y+h-.04),p(b,y+h-.04),p(b2,y+h-.04),p(a2,y+h-.04)],F.d(0,-1,0));
    // A physical 32 cm rear wall, facing the gallery, with closed room doors.
    const ix=b2[0]-a2[0],iz=b2[1]-a2[1],il=Math.hypot(ix,iz),B=F.sub((a2[0]+b2[0])/2,0,(a2[1]+b2[1])/2,Math.atan2(-iz,ix));
    g.set(44,sd,0,1);box(g,B,0,y,wallT/2,il/2,h,wallT/2,31);
    const count=Math.max(1,Math.floor(il/7));for(let k=0;k<count;k++){
      const x=(k+.5)*il/count-il/2;g.set(45,sd);box(g,B,x,y+.04,-.025,.38,Math.min(2.05,h-.25),.025,31);
      g.set(45,sd);box(g,B,x,y+Math.min(2.1,h-.2),-.04,.46,.1,.065,31);}
    // Low parapet and coping leave the arch springing and diagonal view clear.
    g.set(44,sd,0,1);box(g,S,0,y,-.01,len/2,.62,.11,31);
    g.set(44,sd);box(g,S,0,y+.62,-.01,len/2,.09,.15,31);
  }
  if(!wrap){g.set(44,sd,0,1);for(const[a,b]of[[L[0],L[3]],[L[2],L[1]]]){
    const dx=b[0]-a[0],dz=b[1]-a[1],S=F.sub((a[0]+b[0])/2,0,(a[1]+b[1])/2,Math.atan2(-dz,dx));box(g,S,0,y,0,Math.hypot(dx,dz)/2,h,wallT/2,31);}}
  (W.houseGalleryLog||(W.houseGalleryLog=[])).push({wrap,y:F.oy+y,h,walk,wall:wallT,outer:L.map(q=>p(q,0)),inner:(wrap?I:[L[3],L[2]]).map(q=>p(q,0))});
  return true;
}
function houseShell(W,g,F,L,yB,H,floorY,o){
  const plan=houseGalleryPlan(L,o),gH=o.gH,sH=o.sH,flags=o.fl||0,two=o.up!==undefined&&o.up!==o.part;
  const at=k=>floorY+gH+(k-1)*sH;
  for(let e=0;e<L.length;e++){
    const A=L[e],B=L[(e+1)%L.length],front=e===0;
    const draw=(a,b,lo,hi)=>{if(hi-lo<.001)return;
      const upper=two&&lo>=floorY+gH-.001,pt=upper?o.up:o.part;
      const fl=two?(upper?(o.flUp||16):(front?(2|(o.shr?32768:0)):0)):(front?flags:flags&~(2|32768|131072));
      g.set(pt,o.seed,upper?3:front?o.sty:o.sty%8,fl,upper||!two?o.nSt:1,gH,o.burn||0,o.lit);
      wall(g,F,a[0],a[1],b[0],b[1],lo,hi,floorY,sH);};
    const cuts=[yB,H];if(two)cuts.push(floorY+gH);
    const active=plan.filter(t=>t.wrap||front);
    for(const t of active)cuts.push(at(t.level),at(t.level)+sH);
    const ys=[...new Set(cuts)].sort((a,b)=>a-b);
    for(let j=0;j<ys.length-1;j++){const lo=ys[j],hi=ys[j+1],gap=active.find(t=>lo>=at(t.level)-.001&&hi<=at(t.level)+sH+.001);
      if(!gap)draw(A,B,lo,hi);else if(!gap.wrap){draw(A,lp(A,B,gap.t0),lo,hi);draw(lp(A,B,gap.t1),B,lo,hi);}}
  }
  for(const t of plan){if(t.wrap)houseGallery(W,g,F,L,at(t.level),sH,o,true);else{
    const a=lp(L[0],L[1],t.t0),b=lp(L[0],L[1],t.t1),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),depth=1.1;
    houseGallery(W,g,F,[a,b,[b[0]-dz/len*depth,b[1]+dx/len*depth],[a[0]-dz/len*depth,a[1]+dx/len*depth]],at(t.level),sH,o,false);}}
  return plan;
}

// Existing infill generator shares the same structural gallery rules as parcel houses.
function houseRectWalls(W,g,F,cx,cz,w,d,yB,yT,floorY,fac){
  const L=[[cx-w/2,cz-d/2],[cx+w/2,cz-d/2],[cx+w/2,cz+d/2],[cx-w/2,cz+d/2]];
  houseShell(W,g,F,L,yB,yT,floorY,fac);
}
// one lot = one building; L[0]→L[1] faces the street
function lotSlopeLimit(nSt,gH,sH,area){if(nSt<3)return Infinity;return Math.max(0,gH+(nSt-3)*sH-.65-Math.max(0,Math.sqrt(area)-12)*.045);}
function lotBuild(W,g,L,o,R,smk){if(typeof residentialSolidFits==='function'&&!residentialSolidFits(L)){
    if((o.massDepth||0)>=6)return false;let ok=false;for(const Q of splitResidentialPolygon(L)){const oo=Object.assign({},o,{massDepth:(o.massDepth||0)+1,seed:((o.seed||.4)+.137*(ok?2:1))%1});if(lotBuild(W,g,Q,oo,R,smk))ok=true;}return ok;}
  const cc=pCen(L);if(typeof nobleQuarterAt==='function'&&nobleQuarterAt(...cc)==='core'){
    const ns=o.nSt===3||o.nSt===4?o.nSt:(hash2(cc[0],cc[1])<.82?3:4);o=Object.assign({},o,{nSt:ns,fl:(o.fl||0)|262144});}
  if(o.nSt>6||o.sH>3.05||o.gH>4.6)o=Object.assign({},o,{nSt:Math.min(6,o.nSt),sH:Math.min(o.sH,3.05),gH:Math.min(o.gH,4.6)});
  if(o.minRoofY!==undefined){const h=houseGround(W,L),need=h?1+Math.ceil((o.minRoofY-h.min-.15-o.gH)/o.sH):99;if(need>6)return false;o=Object.assign({},o,{nSt:Math.max(o.nSt,need)});}
  const ground=houseGround(W,L),rise=ground?ground.max-ground.min:Infinity,area=Math.abs(pArea(L)),slopeLimit=lotSlopeLimit(o.nSt||1,o.gH||4,o.sH||3,area);
  const slopeFail=rise>slopeLimit;
  if(L.length===4&&(!o.noSplit||slopeFail)&&!o.flat&&(o.nSt||1)>=3&&R&&(o.splitDepth||0)<4){const A=L[0],B=L[1],C=L[2],D=L[3],ab=Math.hypot(B[0]-A[0],B[1]-A[1]),ad=Math.hypot(D[0]-A[0],D[1]-A[1]),hA=(W.gy(A[0],A[1])+W.gy(B[0],B[1]))/2,hC=(W.gy(C[0],C[1])+W.gy(D[0],D[1]))/2,hD=(W.gy(A[0],A[1])+W.gy(D[0],D[1]))/2,hB=(W.gy(B[0],B[1])+W.gy(C[0],C[1]))/2,alongAB=Math.abs(hA-hC),alongAD=Math.abs(hD-hB),splitAB=slopeFail?alongAB>=alongAD:ab>=ad,lg=splitAB?ab:ad;
    if(lg>8&&(lg>17||slopeFail)){const k=Math.max(2,Math.round(lg/(slopeFail?7.5:9.5+R()*2.5)));let ok=false;for(let i=0;i<k;i++){const t0=i/k,t1=(i+1)/k,Q=splitAB?[lp(A,B,t0),lp(A,B,t1),lp(D,C,t1),lp(D,C,t0)]:[lp(A,D,t0),lp(B,C,t0),lp(B,C,t1),lp(A,D,t1)];
      const o2=Object.assign({},o,{nSt:slopeFail?o.nSt:o.fl&262144?o.nSt:Math.max(2,Math.min(6,o.nSt+Math.round((R()-.5)*2.6))),seed:(o.seed+i*.137+R()*.05)%1,noSplit:false,splitDepth:(o.splitDepth||0)+1,loggia:o.loggia&&R()<.4,loggiaA:o.loggiaA&&R()<.5});if(lotBuild(W,g,Q,o2,R,smk)){ok=true;}}return ok;}}
  const okB=lotBuild0(W,g,L,o,R,smk);if(okB)decorLot(W,g,L,o,R);return okB;}
function roadDecorationClear(W,L,reach){const A=L[0],B=L[1],dx=B[0]-A[0],dz=B[1]-A[1],len=Math.hypot(dx,dz)||1,ux=dx/len,uz=dz/len,cx=(L[0][0]+L[1][0]+L[2][0]+L[3][0])/4,cz=(L[0][1]+L[1][1]+L[2][1]+L[3][1])/4,mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2,zo=((mx-cx)*uz+(mz-cz)*(-ux))>0?-1:1,rot=Math.atan2(-uz,ux),center=frame(mx,0,mz,rot).p(0,0,zo*reach/2),q={cx:center[0],cz:center[2],hw:len/2,hd:reach/2,c:Math.cos(rot),s:Math.sin(rot),r:Math.hypot(len/2,reach/2)};
  for(const road of W.foot.list||[])if(road.tag==='road'&&Math.hypot(road.cx-q.cx,road.cz-q.cz)<=road.r+q.r&&obb(road,q))return false;return true;}
function decorLot(W,g,L,o,R){if(o.noDecor)return;if(o.lux){decorateNobleLot(W,g,L,o);return;}if(L.length!==4||(o.nSt||1)<3||!R)return;const A=L[0],B=L[1],len=Math.hypot(B[0]-A[0],B[1]-A[1]);if(len<6)return;const ground=houseGround(W,L);if(!ground)return;const fy=ground.min+.15,ux=(B[0]-A[0])/len,uz=(B[1]-A[1])/len;
  const cx=(L[0][0]+L[1][0]+L[2][0]+L[3][0])/4,cz=(L[0][1]+L[1][1]+L[2][1]+L[3][1])/4,mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2,zo=((mx-cx)*uz+(mz-cz)*(-ux))>0?-1:1,F=frame(mx,fy,mz,Math.atan2(-uz,ux)),r=R(),gH=o.gH||4;
  if(r<.24){g.set(3,.45);box(g,F,0,gH-.2,zo*.5,len/2-.5,.2,.5,31);box(g,F,0,gH,zo*.96,len/2-.5,.95,.04,31);for(let x=-len/2+.9;x<len/2-.5;x+=1.7)box(g,F,x,gH-.62,zo*.3,.07,.42,.3,31);}
  else if(r<.38&&roadDecorationClear(W,L,2.9)){const k=Math.max(2,Math.round(len/3.2));for(let i=0;i<=k;i++){const q=F.p(-len/2+.4+(len-.8)*i/k,0,zo*2.5);W.cols.simple.push([q[0],fy,q[2],F.rot,gH-.5,[.96,.92,.86]]);}g.set(1,o.seed);g.poly([F.p(-len/2,gH-.3,0),F.p(len/2,gH-.3,0),F.p(len/2,gH-.8,zo*2.9),F.p(-len/2,gH-.8,zo*2.9)],[0,1,0]);}}
// Final road check uses the generated eave polygon, including long mitres at acute corners.
function houseRoadClear(W,P){if(!W.foot)return true;const o=lotOBB(P),rad=Math.hypot(o.hw,o.hd),cs=W.foot.cell,seen=new Set();
  for(let i=Math.floor((o.cx-rad)/cs);i<=Math.floor((o.cx+rad)/cs);i++)for(let j=Math.floor((o.cz-rad)/cs);j<=Math.floor((o.cz+rad)/cs);j++)for(const f of W.foot.map.get(W.foot.key(i,j))||[]){if(f.tag!=='road'||seen.has(f))continue;seen.add(f);
    if(typeof nobleOverlap==='function'?nobleOverlap(P,f):obb({...o,c:Math.cos(o.rot),s:Math.sin(o.rot)},f))return false;}return true;
}
function lotBuild0(W,g,L,o,R,smk){if(o.up===30&&o.nSt>4)o=Object.assign({},o,{up:0});   // timber frame only on houses of <= 4 storeys (facades.md); taller ones are plain plaster
  if(typeof residentialSiteAllowed==='function'&&!residentialSiteAllowed(W,L))return false;
  const eave=L.length===4&&!o.flat?(pInset(L,-.55)||L):L;if(!houseRoadClear(W,eave))return false;
  const ground=houseGround(W,L);if(!ground)return false;const groundMin=ground.min,groundMax=ground.max,floorY=groundMin+.15,gH=o.gH,sH=o.sH,H=floorY+gH+(o.nSt-1)*sH,n=L.length,two=o.up!==undefined&&o.up!==o.part,bn=o.burn||0,P=(p,y)=>[p[0],y,p[1]],wp=two?o.up:o.part;
  const roofRise=n===4?Math.min(Math.hypot(L[2][0]-L[0][0],L[2][1]-L[0][1])*.5*Math.tan(o.pitch),6.5):3;
  if(groundMax>H+roofRise)return false;
  const lotArea=Math.abs(pArea(L)),slopeLimit=lotSlopeLimit(o.nSt||1,gH,sH,lotArea);
  if(groundMax-groundMin>slopeLimit)return false;
  const yB=groundMin-.25;
  houseShell(W,g,IDF,L,yB,H,floorY,o);
  const sl=groundMax-groundMin;(W.lotLog=W.lotLog||[]).push({L,yB,floorY,groundMin,groundMax,embeddedRise:sl,terrace:false,storeys:o.nSt,gH,sH,elite:!!(o.fl&262144)});
  if(n===4&&!o.flat){const E=pInset(L,-.55)||L,A=L[0],B=L[1],C=L[2],D=L[3],m0=lp(D,A,.5),m1=lp(B,C,.5),e0=lp(E[3],E[0],.5),e1=lp(E[1],E[2],.5),
      dep=Math.hypot((A[0]+B[0]-C[0]-D[0])/2,(A[1]+B[1]-C[1]-D[1])/2),tp=Math.tan(o.pitch),yR=H+Math.min(dep*.5*tp,6.5),yE=H-.55*tp;
    g.set(1,o.seed+.2);g.poly([P(E[0],yE),P(E[1],yE),P(e1,yR),P(e0,yR)],[0,1,0]);g.poly([P(e0,yR),P(e1,yR),P(E[2],yE),P(E[3],yE)],[0,1,0]);g.set(4,o.seed);ridgeCap(g,P(e0,yR),P(e1,yR));
    g.set(2,o.seed);for(const[a,b]of[[E[0],E[1]],[E[2],E[3]]])g.poly([P(a,yE-.24),P(b,yE-.24),P(b,yE),P(a,yE)],[b[1]-a[1],0,-(b[0]-a[0])]);
    g.set(wp,o.seed,0,1,o.nSt,gH,bn,1);for(const[a,b,m]of[[B,C,m1],[D,A,m0]])g.poly([P(a,H),P(b,H),P(m,yR)],[b[1]-a[1],0,-(b[0]-a[0])]);
    if(smk&&R()<.03)smk.push([(e0[0]+e1[0])/2,yR+.6,(e0[1]+e1[1])/2]);}
  else{const ar=pArea(L),cy=ar>260&&R()<.55?pInset(L,Math.min(5.5,Math.sqrt(ar)*.27)):null,tp=R()<.6?25:11;
    // flat roof terrace (opus signinum or slabs); big blocks get a real light-well court cut through them
    g.set(tp,o.seed);if(cy){for(let e=0;e<n;e++){const e2=(e+1)%n;g.poly([P(L[e],H+.05),P(L[e2],H+.05),P(cy[e2],H+.05),P(cy[e],H+.05)],[0,1,0]);}}else g.poly(L.map(p=>P(p,H+.05)),[0,1,0]);
    g.set(wp,o.seed,0,1,1,4,bn,1);
    for(let e=0;e<n;e++){const a=L[e],b=L[(e+1)%n];wall(g,IDF,a[0],a[1],b[0],b[1],H,H+.9,H-30,4);wall(g,IDF,b[0],b[1],a[0],a[1],H,H+.9,H-30,4);}
    if(cy){g.set(wp,o.seed,o.sty%8,o.fl&~2,o.nSt,gH,bn,o.lit);for(let e=0;e<n;e++){const a=cy[e],b=cy[(e+1)%n];wall(g,IDF,b[0],b[1],a[0],a[1],floorY,H,floorY,sH);}
      g.set(wp,o.seed,0,1,1,4,bn,1);for(let e=0;e<n;e++){const a=cy[e],b=cy[(e+1)%n];wall(g,IDF,a[0],a[1],b[0],b[1],H,H+.9,H-30,4);}
      g.set(11,o.seed);g.poly(cy.map(p=>P(p,floorY+.05)),[0,1,0]);const cc=pCen(cy);g.set(2,.5);lathe(g,frame(cc[0],floorY,cc[1],0),0,0,0,[[.75,0],[.75,.85],[.55,.85],[.55,.1]],10);}
    if(o.kiosk&&ar>60){const I=pInset(L,Math.min(2.2,Math.sqrt(ar)*.18));if(I){const yk=H+.05,c0=pCen(I),E2=pInset(I,-.5)||I;for(const p of I)W.cols.simple.push([p[0],yk,p[1],0,3.3,[1,.98,.94]]);g.set(2,o.seed);for(let e=0;e<I.length;e++){const a=I[e],b=I[(e+1)%I.length];wall(g,IDF,a[0],a[1],b[0],b[1],yk+3.3,yk+3.8,yk-30,4);wall(g,IDF,b[0],b[1],a[0],a[1],yk+3.3,yk+3.8,yk-30,4);}g.set(1,o.seed+.3);for(let e=0;e<E2.length;e++){const a=E2[e],b=E2[(e+1)%E2.length];g.poly([[a[0],yk+3.75,a[1]],[b[0],yk+3.75,b[1]],[c0[0],yk+5.4,c0[1]]],[0,1,0]);}}}
    else if(!cy&&ar>90&&R()<.45){const I=pInset(L,1.6);if(I&&I.length===4){g.set(3,.4);for(const p of I)box(g,frame(p[0],0,p[1],0),0,H,0,.09,2.5,.09,31);const yp=H+2.55;
      if(R()<.55){// pergola: slats on two beams, vines over part of it
        const A=I[0],B=I[1],C=I[2],D=I[3],nS=Math.max(3,Math.round(Math.hypot(D[0]-A[0],D[1]-A[1])/.7));g.set(3,.35);
        for(const[u0,u1]of[[A,B],[D,C]])g.poly([P(u0,yp),P(u1,yp),P(lp(u1,u0===A?C:B,.04),yp),P(lp(u0,u0===A?D:A,.04),yp)],[0,1,0]);
        for(let k=0;k<=nS;k++){const t=k/nS,a=lp(A,D,t),b=lp(B,C,t),a2=lp(A,D,Math.min(1,t+.05)),b2=lp(B,C,Math.min(1,t+.05));g.poly([P(a,yp+.08),P(b,yp+.08),P(b2,yp+.08),P(a2,yp+.08)],[0,1,0]);}
        g.set(23,R());for(let k=0;k<2;k++){const t0=R()*.6,t1=t0+.15+R()*.25,s0=R()*.5,s1=s0+.2+R()*.3;g.poly([P(lp(lp(A,B,s0),lp(D,C,s0),t0),yp+.16),P(lp(lp(A,B,s1),lp(D,C,s1),t0),yp+.16),P(lp(lp(A,B,s1),lp(D,C,s1),t1),yp+.16),P(lp(lp(A,B,s0),lp(D,C,s0),t1),yp+.16)],[0,1,0]);}}
      else{// awning of linen, saffron or madder-red cloth (no green canopies)
        g.set(8,(.3+R()*.7)/3.3);g.poly(I.map(p=>P(p,yp)),[0,1,0]);g.poly(I.map(p=>P(p,yp-.05)).reverse(),[0,-1,0]);}}}
    if(smk&&R()<.02){const c=pCen(L);smk.push([c[0],H+1.2,c[1]]);}}
  const a=L[0],b=L[1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=dz/l,nz=-dx/l;
  if(o.awn&&R()<o.awn&&l>5){const ay=floorY+gH-.55,t0=.12+R()*.2,p0=lp(a,b,t0),p1=lp(a,b,Math.min(.93,t0+.3+R()*.35));g.set(8,R());
    g.poly([[p0[0],ay,p0[1]],[p1[0],ay,p1[1]],[p1[0]+nx*1.6,ay-.75,p1[1]+nz*1.6],[p0[0]+nx*1.6,ay-.75,p0[1]+nz*1.6]],[nx,1,nz]);g.poly([[p1[0],ay,p1[1]],[p0[0],ay,p0[1]],[p0[0]+nx*1.6,ay-.75,p0[1]+nz*1.6],[p1[0]+nx*1.6,ay-.75,p1[1]+nz*1.6]],[-nx,-1,-nz]);}
  if(o.balc&&o.nSt>=3&&R()<o.balc&&l>5){const hs=k=>((Math.sin(o.seed*12.9898+k*78.233)*43758.5453)%1+1)%1,by=floorY+gH+sH*(1+Math.floor(hs(1)*Math.min(2,o.nSt-2))),t0=.08+hs(2)*.25,t1=Math.min(.92,t0+.35+hs(3)*.35),p0=lp(a,b,t0),p1=lp(a,b,t1),bl=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
    if(bl>2.2){const Fb=frame((p0[0]+p1[0])/2,by,(p0[1]+p1[1])/2,Math.atan2(-dz/l,dx/l)),dp=1.15,zr=-dp+.06;(W.balcLog=W.balcLog||[]).push([Math.round(Fb.ox),+by.toFixed(1),Math.round(Fb.oz),+nx.toFixed(2),+nz.toFixed(2),+bl.toFixed(1)]);   // wooden balcony (local -z = outwards): plank deck, corbels, posts with a top and a mid rail, flower pots along the rail
      g.set(3,o.seed);box(g,Fb,0,-.02,-dp/2+.04,bl/2,.12,dp/2,31);box(g,Fb,0,-.2,-dp+.02,bl/2,.18,.05,31);   // plank deck + the slab edge (a fascia board, proud of the deck)
      {const nb=Math.max(3,Math.min(4,Math.round(bl/1.9))),bx=Math.min(1.1,(bl-.9)/Math.max(1,nb-1));   // 3-4 beam ends through the wall, each with a diagonal bracket back to the wall under the deck
       for(let k=0;k<nb;k++){const x=(k-(nb-1)/2)*bx;box(g,Fb,x,-.2,-dp/2+.04,.06,.18,dp/2,31);box(g,Fb,x,-.2,-dp+.02,.075,.2,.06,31);   // beam, with its end capped at the front
        const st=[Fb.p(x-.05,-.2,-dp+.14),Fb.p(x+.05,-.2,-dp+.14),Fb.p(x+.05,-1.05,-.06),Fb.p(x-.05,-1.05,-.06)];g.poly(st,Fb.d(0,-1,-1));g.poly([Fb.p(x-.05,-.25,-dp+.14),Fb.p(x-.05,-.25,-.06),Fb.p(x-.05,-1.05,-.06)],Fb.d(-1,0,0));g.poly([Fb.p(x+.05,-.25,-dp+.14),Fb.p(x+.05,-1.05,-.06),Fb.p(x+.05,-.25,-.06)],Fb.d(1,0,0));}}
      for(let x=-bl/2+.05;x<=bl/2-.04;x+=.55)box(g,Fb,x,.1,zr,.022,.9,.022,31);box(g,Fb,0,1.0,zr,bl/2,.05,.04,31);box(g,Fb,0,.55,zr,bl/2,.025,.02,31);
      for(const sx of[-1,1]){box(g,Fb,sx*(bl/2-.04),.1,-dp/2+.04,.022,.9,.022,31);box(g,Fb,sx*(bl/2-.04),1.0,-dp/2+.04,.04,.05,dp/2,31);}
      for(let x=-bl/2+.6;x<bl/2-.3;x+=.9+hs(4)*.5){lathe(g,Fb,x,.1,zr+.28,[[.1,0],[.17,.27],[.15,.3],[0,.3]],8,4);lathe(g,Fb,x,.38,zr+.28,[[.02,0],[.2,.14],[.15,.4],[0,.5]],7,23);}}}
  return true;}
// street surface between the block edge (the street centre line) and the lot line: basalt paving in the city
// (packed earth on the edges), a raised travertine sidewalk with a grey kerb on the wider streets
function paveBlock(W,g,P0,B,Z){if(!B||P0.length!==B.length)return;const n=P0.length,c=pCen(P0),dist=Math.hypot(c[0]-17,c[1]+22),
    bas=Z.kind!=='ware'&&dist<1750,side=(Z.kind==='mid'||Z.kind==='domus')&&dist<1600,y=(p,h)=>[p[0],W.gy(p[0],p[1])+h,p[1]];
  for(let e=0;e<n;e++){const a=P0[e],b=P0[(e+1)%n],ia=B[e],ib=B[(e+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;
    const ns=Math.max(1,Math.round(L/10)),nx=(b[1]-a[1])/L,nz=-(b[0]-a[0])/L;
    for(let k=0;k<ns;k++){const o0=lp(a,b,k/ns),o1=lp(a,b,(k+1)/ns),i0=lp(ia,ib,k/ns),i1=lp(ia,ib,(k+1)/ns),
        w=Math.min(Math.hypot(o0[0]-i0[0],o0[1]-i0[1]),Math.hypot(o1[0]-i1[0],o1[1]-i1[1]))||1,sw=side?Math.min(1.1,w*.42):0,
        s0=sw?lp(i0,o0,sw/w):i0,s1=sw?lp(i1,o1,sw/w):i1;
      g.set(bas?10:31,.3);g.poly([y(o0,.14),y(o1,.14),y(s1,.14),y(s0,.14)],[0,1,0]);
      if(sw){g.set(11,.4);g.poly([y(s0,.36),y(s1,.36),y(i1,.36),y(i0,.36)],[0,1,0]);g.set(33,.3);g.poly([y(s0,-.05),y(s1,-.05),y(s1,.36),y(s0,.36)],[nx,0,nz]);}}}}

// Residential inner courts never call the housing generator. This is shared by
// dense/middle-income ring blocks; later passes see their open-space reservation.
function residentialCourtGarden(W,g,C,R){
  const I=pInset(C,1)||C,h=houseGround(W,I),c=pCen(I);if(!h)return;
  g.set(5,.42);for(let i=0;i<I.length;i++){const a=I[i],b=I[(i+1)%I.length];g.poly([[c[0],W.gy(...c)+.12,c[1]],[a[0],W.gy(...a)+.12,a[1]],[b[0],W.gy(...b)+.12,b[1]]],[0,1,0]);}
  const bb=lotOBB(I),size=Math.min(bb.hw,bb.hd),pool=size>3.2&&h.max-h.min<1.3;
  if(pool){const J=courtyardPoolPolygon(I);if(J){const o=lotOBB(J),F=frame(o.cx,h.max+.14,o.cz,o.rot),hx=Math.max(.65,o.hw*.75),hz=Math.max(.65,o.hd*.75);g.set(2,.42);for(const sd of[-1,1]){box(g,F,0,0,sd*hz,hx+.12,.55,.12,31);box(g,F,sd*hx,0,0,.12,.55,hz+.12,31);}if(W.poolG)W.poolG.poly([F.p(-hx,.4,-hz),F.p(hx,.4,-hz),F.p(hx,.4,hz),F.p(-hx,.4,hz)],[0,1,0]);g.set(6,.48);lathe(g,F,0,.4,0,[[.2,0],[.16,.45],[.4,.6],[.35,.69],[.02,.78]],10);}}
  for(let k=0;k<I.length;k++){const q=lp(I[k],c,.23);if(pool&&Math.hypot(q[0]-c[0],q[1]-c[1])<2.5)continue;W.trees.push([q[0],W.gy(...q)+.15,q[1],k%2?'shrub':'flower',.42,null,2]);}
}
// A ring that did not close (a lot was skipped for a road, a monument or the slope) gets no garden: its court stays a plain yard of beaten
// earth (the ground itself) round a well-head, the way most insula courts were.
function residentialCourtYard(W,g,C){
  const I=pInset(C,.6)||C,c=pCen(I);if(!houseGround(W,I))return;
  const bb=lotOBB(I);if(Math.min(bb.hw,bb.hd)>2.2){const F=frame(c[0],W.gy(...c)+.1,c[1],bb.rot);g.set(2,.45);lathe(g,F,0,0,0,[[.55,0],[.55,.8],[.42,.8],[.42,.1],[0,.1]],10);}
}
// A lot against W.foot by real outlines: the lot polygon grown by m against each footprint's own outline (a block lot's polygon, a parcel's
// poly, else its box). skip: a tag to ignore.
function footBox(f){return[[-f.hw,-f.hd],[f.hw,-f.hd],[f.hw,f.hd],[-f.hw,f.hd]].map(([u,v])=>[f.cx+u*f.c+v*f.s,f.cz-u*f.s+v*f.c]);}
function lotHitWhat(W,L,m){const F=W.foot,ob=lotOBB(L),r=Math.hypot(ob.hw,ob.hd)+m,cs=F.cell,P=pInset(L,-m)||L;   // the first footprint lotHits would stop at (for the audit)
  for(let i=Math.floor((ob.cx-r)/cs);i<=Math.floor((ob.cx+r)/cs);i++)for(let j=Math.floor((ob.cz-r)/cs);j<=Math.floor((ob.cz+r)/cs);j++)for(const f of F.map.get(F.key(i,j))||[]){const dx=f.cx-ob.cx,dz=f.cz-ob.cz;if(dx*dx+dz*dz>(f.r+r)**2)continue;if(residentialOverlap(P,f.blkLot||f.poly||footBox(f)))return f;}
  return null;}
function lotHits(W,L,m,skip){const F=W.foot,ob=lotOBB(L),r=Math.hypot(ob.hw,ob.hd)+m,cs=F.cell,P=pInset(L,-m)||L;
  for(let i=Math.floor((ob.cx-r)/cs);i<=Math.floor((ob.cx+r)/cs);i++)for(let j=Math.floor((ob.cz-r)/cs);j<=Math.floor((ob.cz+r)/cs);j++)for(const f of F.map.get(F.key(i,j))||[]){
    if(skip&&f.tag===skip)continue;const dx=f.cx-ob.cx,dz=f.cz-ob.cz;if(dx*dx+dz*dz>(f.r+r)**2)continue;if(residentialOverlap(P,f.blkLot||f.poly||footBox(f)))return true;}
  return false;}
// Spec 6.2.3 (U-shaped court): the stretches of the court edge that no house covers get a plastered garden wall, 2.6 m, with a gate in the
// longest one. All or nothing: a stretch that crosses a footprint or climbs more than 3 m leaves the court a yard. Returns true when walled.
function courtWalls(W,g,C,uncovered){const segs=[];
  for(const u of uncovered){const a=C[u.edge],b=C[(u.edge+1)%C.length],A=lp(a,b,u.from),B=lp(a,b,u.to),len=Math.hypot(B[0]-A[0],B[1]-A[1]);if(len<.05)continue;
    const rot=Math.atan2(-(B[1]-A[1]),B[0]-A[0]),mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2,ha=W.gy(...A),hb=W.gy(...B);
    if(Math.abs(ha-hb)>3||W.foot.hits(mx,mz,len/2,.3,rot,0))return false;segs.push({A,B,len,rot});}
  if(!segs.length)return false;const gate=segs.reduce((m,s)=>s.len>m.len?s:m,segs[0]);
  for(const S of segs){const n=Math.max(1,Math.ceil(S.len/4)),cut=S===gate&&S.len>=5?[.5-1.3/S.len,.5+1.3/S.len]:null;
    for(let k=0;k<n;k++){let t0=k/n,t1=(k+1)/n;if(cut&&t1>cut[0]&&t0<cut[1]){if(t0<cut[0])t1=cut[0];else if(t1>cut[1])t0=cut[1];else continue;}   // the gate: a 2.6 m opening between two piers
      const P0=lp(S.A,S.B,t0),P1=lp(S.A,S.B,t1),hx=Math.hypot(P1[0]-P0[0],P1[1]-P0[1])/2,y=Math.min(W.gy(...P0),W.gy(...P1))-.3,F=frame((P0[0]+P1[0])/2,y,(P0[1]+P1[1])/2,S.rot);
      g.set(2,.42);box(g,F,0,0,0,hx,2.9,.24,31);g.set(2,.55);box(g,F,0,2.9,0,hx+.02,.14,.32,31);}
    if(cut)for(const t of cut){const q=lp(S.A,S.B,t),F=frame(q[0],W.gy(...q)-.3,q[1],S.rot);g.set(2,.5);box(g,F,0,0,0,.4,3.5,.4,31);}
    W.foot.add((S.A[0]+S.B[0])/2,(S.A[1]+S.B[1])/2,S.len/2,.3,S.rot);}
  return true;}
// Clip block B to the far side of footprint f's nearest face (grown by m): the part of the block that keeps clear of it.
function cutAway(B,f,m){const c=pCen(B),dx=c[0]-f.cx,dz=c[1]-f.cz;
  if(f.circ){const d=Math.hypot(dx,dz)||1,nx=dx/d,nz=dz/d;return clipHalf(B,nx,nz,f.cx*nx+f.cz*nz+f.hw+m,1);}
  const u=f.c*dx-f.s*dz,v=f.s*dx+f.c*dz,byU=Math.abs(u)/(f.hw||1)>Math.abs(v)/(f.hd||1),sg=Math.sign(byU?u:v)||1,nx=(byU?f.c:f.s)*sg,nz=(byU?-f.s:f.c)*sg;
  return clipHalf(B,nx,nz,f.cx*nx+f.cz*nz+(byU?f.hw:f.hd)+m,1);}
// A story-state group of houses (W.preLayers[k], switched by the state lists in app.js); every generator that files houses under k shares it
// (a second genBlocks call used to replace the first one's entry, leaving its houses hidden in every state).
function preLayerGroup(W,k){const P=W.preLayers||(W.preLayers={});let G=P[k];if(!G){G=new THREE.Group();G.name=k;G.userData.rise=0;G.visible=false;W.scene.add(G);P[k]=G;}return G;}
// A ring of lots round a court: block B inset by the wing depth dd gives the court; each edge is cut into lots about lw wide.
function ringLots(B,dd,lw,R){const I=pInset(B,dd);if(!I||pArea(I)<=40)return{court:null,lots:[]};const lots=[];
  for(let e=0;e<B.length;e++){const a=B[e],b=B[(e+1)%B.length],ia=I[e],ib=I[(e+1)%B.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nl=Math.max(1,Math.round(len/(lw*(.8+.4*R()))));
    let t0=0;for(let k=1;k<=nl;k++){const t1=k===nl?1:(k+(R()-.5)*.5)/nl;lots.push([lp(a,b,t0),lp(a,b,t1),lp(ia,ib,t1),lp(ia,ib,t0)]);t0=t1;}}
  return{court:I,lots};}
// Keep the part of polygon P on one side of the line p.n = c (sign +1: p.n >= c).
function clipHalf(P,nx,nz,c,sign){const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],da=sign*(a[0]*nx+a[1]*nz-c),db=sign*(b[0]*nx+b[1]*nz-c);if(da>=0)out.push(a);if((da>=0)!==(db>=0))out.push(lp(a,b,da/(da-db)));}return out.length>=3?out:null;}
// Spec F6: a block too steep for one courtyard house, even on a terrace platform, is cut along the contours into terrace strips at least
// 10 m deep with a 2.4 m stepped lane between them; each strip is a row of houses fronting downhill. Never one big house, never scattered huts.
function terraceStrips(W,B,Z,o,R,addLot,mg){const ob=lotOBB(B),r=Math.hypot(ob.hw,ob.hd);let n=0,mx=0,mz=0,mh=0;const pts=[];
  for(let x=ob.cx-r;x<=ob.cx+r;x+=5)for(let z=ob.cz-r;z<=ob.cz+r;z+=5)if(nobleInside(x,z,B)){const h=W.gy(x,z);pts.push([x,z,h]);mx+=x;mz+=z;mh+=h;n++;}
  if(n<6)return 0;mx/=n;mz/=n;mh/=n;let xx=0,zz=0,xz=0,xh=0,zh=0;for(const[x,z,h]of pts){const dx=x-mx,dz=z-mz,dh=h-mh;xx+=dx*dx;zz+=dz*dz;xz+=dx*dz;xh+=dx*dh;zh+=dz*dh;}
  const det=xx*zz-xz*xz||1,a=(xh*zz-zh*xz)/det,b=(zh*xx-xh*xz)/det,gl=Math.hypot(a,b)||1,gx=a/gl,gz=b/gl,tx=-gz,tz=gx;   // least-squares plane: (gx,gz) points uphill
  const s=B.map(p=>p[0]*gx+p[1]*gz),s0=Math.min(...s),s1=Math.max(...s),depth=s1-s0,k=Math.max(1,Math.min(Math.floor(depth/10),Math.ceil(gl*depth/3)));let placed=0;
  for(let i=0;i<k;i++){let S=clipHalf(B,gx,gz,s0+depth*i/k,1);S=S&&clipHalf(S,gx,gz,s0+depth*(i+1)/k,-1);const I=S&&pInset(S,1.2);if(!I||Math.abs(pArea(I))<40)continue;
    const u=I.map(p=>p[0]*tx+p[1]*tz),u0=Math.min(...u),u1=Math.max(...u),m=Math.max(1,Math.round((u1-u0)/(Z.lotW*1.2)));
    for(let j=0;j<m;j++){let L=clipHalf(I,tx,tz,u0+(u1-u0)*j/m,1);L=L&&clipHalf(L,tx,tz,u0+(u1-u0)*(j+1)/m,-1);if(!L||Math.abs(pArea(L))<14)continue;
      let f0=0,best=1e9;for(let e=0;e<L.length;e++){const p=L[e],q=L[(e+1)%L.length],d=((p[0]+q[0])*gx+(p[1]+q[1])*gz)/2;if(d<best){best=d;f0=e;}}L=L.slice(f0).concat(L.slice(0,f0));   // the downhill edge first: the house fronts the lane below
      const lob=lotOBB(L);if(o.lotOK&&!o.lotOK(lob.cx,lob.cz))continue;if(lotHits(W,L,mg+.8))continue;const key=o.grp?o.grp(lob.cx,lob.cz):'';if(key===null||key===undefined)continue;
      const p=Z.lot(R);p.burn=0;if(lotBuild(W,addLot(lob.cx,lob.cz,key),L,p,R,null)){const f=W.foot.add(lob.cx,lob.cz,lob.hw,lob.hd,lob.rot);f.blkLot=L;placed++;}}}
  return placed;}
// Detached horrea are a separate building type. They are never passed through
// residential mass splitting, never a roof mosaic covering a whole ring block.
function warehouseBlock(W,g,B,R,margin=0){
  const o=lotOBB(B),F=frame(o.cx,0,o.cz,o.rot),inside=q=>B.every((a,i)=>{const b=B[(i+1)%B.length];return(b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0])>.3;});let count=0;
  for(const u of[-o.hw*.47,o.hw*.47])for(const v of[-o.hd*.45,o.hd*.45]){
    const w=10.4+R()*1.2,d=17+R()*2.5,P=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([x,z])=>{const p=F.p(u+x,0,v+z);return[p[0],p[2]];});
    if(!P.every(inside)||(W.name==='rome'&&P.some(p=>polyDist(...p,TIBER)[0]<RTW+12)))continue;const b=lotOBB(P),h=houseGround(W,P,2);if(!h||h.max-h.min>1.65||W.foot.hits(b.cx,b.cz,b.hw+.8,b.hd+.8,b.rot,margin)||!houseRoadClear(W,pInset(P,-.65)||P)||!residentialSiteAllowed(W,P))continue;
    const y=h.max+.12,T=frame(b.cx,y,b.cz,b.rot),height=5.6;
    rectWalls(g,T,0,0,w,d,h.min-y-.25,height,0,{part:9,seed:.35+R()*.2,sty:3,fl:1,nSt:1,gH:height,sH:3,lit:.6});
    roof(g,T,'gableZ',0,0,w,d,height,23*DEG,.55,.37+R()*.2);
    // Broad timber loading doors, raised stone threshold and small high vents.
    g.set(45,.4);box(g,T,0,0,d/2+.025,1.1,3.4,.04,31);g.set(2,.35);box(g,T,0,-.08,d/2+.35,1.4,.2,.4,31);
    g.set(33,.4);for(const x of[-w*.3,w*.3])box(g,T,x,4.35,d/2+.025,.36,.45,.03,31);
    const f=W.foot.add(b.cx,b.cz,b.hw+.65,b.hd+.65,b.rot);f.poly=pInset(P,-.6)||P;f.warehouse=true;
    (W.warehouseLog||(W.warehouseLog=[])).push({polygon:P,x:b.cx,z:b.cz,y,groundMin:h.min,groundMax:h.max,height,role:'warehouse',roof:'gableZ'});count++;
  }return count;
}
function estateAppendGB(dst,src){if(!src||!src.nv)return;dst.grow(dst.nv+src.nv,dst.ni+src.ni);const vo=dst.nv,io=dst.ni;for(const k of['p','n','a','b','c']){const w=k==='p'||k==='n'?3:4;dst[k].set(src[k].subarray(0,src.nv*w),vo*w);}for(let i=0;i<src.ni;i++)dst.ix[io+i]=src.ix[i]+vo;dst.nv+=src.nv;dst.ni+=src.ni;}
function estateChildWorld(W){const C=Object.assign({},W,{cols:{},trees:[],people:[],lotLog:[],poolG:new GB(),houseGalleryLog:[],balcLog:[],residentialReservations:[],residentialRejects:{}});for(const k of Object.keys(W.cols||{}))C.cols[k]=[];return C;}
function estateMergeWorld(W,C){for(const k of Object.keys(C.cols||{})){const a=W.cols[k]||(W.cols[k]=[]),b=C.cols[k];for(let i=0;i<b.length;i+=8192)a.push(...b.slice(i,i+8192));}for(const k of['trees','people','lotLog','houseGalleryLog','balcLog'])if(C[k]?.length)(W[k]||(W[k]=[])).push(...C[k]);if(C.poolG?.nv)estateAppendGB(W.poolG||(W.poolG=new GB()),C.poolG);}
function estatePlanStats(W){return W.estatePlanStats||(W.estatePlanStats={attempted:0,committed:0,fallback:0,fallbackHomes:0,fallbackFloors:{},reasons:{},transactions:[]});}
function estateReject(W,reason,record){const S=estatePlanStats(W);S.fallback++;S.reasons[reason]=(S.reasons[reason]||0)+1;record.status='fallback';record.reason=reason;}
function estatePlanReason(W,B,C,lots,o,mg,deck){const h=houseGround(W,B);if(!h)return'invalid-block-ground';if(h.max-h.min>ESTATE_TERRACE.relief)return'block-relief-over-6m';if(!deck)return'court-exposure-over-6m';if(lotHits(W,B,mg+.8))return'block-foot-conflict';if(!lots.length)return'incomplete-perimeter';const expected=Math.abs(pArea(B))-Math.abs(pArea(C)),covered=lots.reduce((a,L)=>a+Math.abs(pArea(L)),0);if(expected<=0||Math.abs(covered-expected)>Math.max(2,expected*.015))return'incomplete-perimeter';for(const L of lots){if(pArea(L)<14)return'incomplete-wing-lot';const ob=lotOBB(L);if(o.lotOK&&!o.lotOK(ob.cx,ob.cz))return'lot-policy';if(lotHits(W,L,mg+.8))return'reserved-road-or-foot';if(!houseRoadClear(W,L))return'road-collision';}return null;}
function estateFallback(W,lots,o,R,addLot,record){let placed=0;const floors={};const put=(P,depth=0)=>{if(pArea(P)<14||depth>8)return;const ob=lotOBB(P),key=o.grp?o.grp(ob.cx,ob.cz):'',small=ob.hw*2<=12.01&&ob.hd*2<=11.01&&Math.abs(pArea(P))<=110;
  if(small&&key!==null&&key!==undefined&&(!o.lotOK||o.lotOK(ob.cx,ob.cz))&&!W.foot.hits(ob.cx,ob.cz,ob.hw,ob.hd,ob.rot,(o.margin||0)+.8)&&houseRoadClear(W,P)){const p={part:R()<.5?0:9,seed:R(),sty:R()<.5?0:3,fl:2|16,nSt:2+Math.floor(R()*2),gH:3.8,sH:2.9,pitch:.36+R()*.09,lit:1,flat:false,noSplit:true,noDecor:true};if(typeof nobleQuarterAt==='function'&&nobleQuarterAt(ob.cx,ob.cz)==='core')p.nSt=3;if(lotBuild(W,addLot(ob.cx,ob.cz,key),P,p,R,null)){W.foot.add(ob.cx,ob.cz,ob.hw,ob.hd,ob.rot);placed++;const rows=(W.lotLog||[]).slice(-1),n=rows[0]?.storeys||p.nSt;floors[n]=(floors[n]||0)+1;return;}}
  const halves=splitResidentialPolygon(P);if(halves.length===2){put(halves[0],depth+1);put(halves[1],depth+1);}};for(const L of lots){const inset=pInset(L,.4);if(inset&&Math.abs(pArea(inset))>14)put(inset);}
  record.fallbackHomes=placed;record.fallbackFloors=floors;const S=estatePlanStats(W);S.fallbackHomes+=placed;for(const k of Object.keys(floors))S.fallbackFloors[k]=(S.fallbackFloors[k]||0)+floors[k];return placed;}
function genBlocks(W,o){(W.blockZones||(W.blockZones=[])).push({zone:o.zone,ext:o.ext});   // kept for the review panel's zone edges
  const R=RNG(o.seed||11),mg=o.margin||0,dq=Math.max(.3,Q.dens),sx=o.sx,sz=o.sz,th=o.rot,c=Math.cos(th),s=Math.sin(th),E=o.ext,chunks=new Map(),cs=o.chunk||600,smk=[];let nL=0;
  const G=(x,z,k,lay='houses')=>{const key=k+'|'+lay+'|'+Math.floor(x/cs)+'_'+Math.floor(z/cs);let e=chunks.get(key);if(!e){e={k,lay,g:new GB(1<<14)};chunks.set(key,e);}return e.g;};   // lay: the squares get their own chunks so the review panel can show them apart
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const[x,z]of[[E[0],E[1]],[E[2],E[1]],[E[2],E[3]],[E[0],E[3]]]){const u=x*c-z*s,v=x*s+z*c;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
  const i0=Math.floor(u0/sx)-1,i1=Math.ceil(u1/sx)+1,j0=Math.floor(v0/sz)-1,j1=Math.ceil(v1/sz)+1,NJ=j1-j0+1,N=[];
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){let u=i*sx+(hash2(i,j*7+1)-.5)*sx*.26,v=j*sz+(hash2(i*3+5,j)-.5)*sz*.26;const wu=34*(fbm(u*.0015+3,v*.0015,3)-.5)*2,wv=34*(fbm(u*.0015,v*.0015+9,3)-.5)*2;u+=wu;v+=wv;N.push([u*c+v*s,-u*s+v*c]);}
  const nd=(i,j)=>N[(i-i0)*NJ+(j-j0)];
  for(let i=i0;i<i1;i++)for(let j=j0;j<j1;j++){let Qd=[nd(i,j),nd(i+1,j),nd(i+1,j+1),nd(i,j+1)];if(pArea(Qd)<0)Qd=[Qd[0],Qd[3],Qd[2],Qd[1]];
    const cc=pCen(Qd),Z=o.zone(cc[0],cc[1]);if(!Z)continue;if(dq<1&&R()>.6+dq*.4)continue;
    let polys=[Qd];if(R()<Z.tri){const diag=R()<.5,key=o.grp?o.grp(cc[0],cc[1]):'';   // spec 5.2: no random triangles of houses; now and then the diagonal lane makes one double-triangle square (F3), at least 240 m apart
      if(key===''&&Z.kind!=='ware'&&typeof faceDoubleTriangle==='function'&&!(W.faceF3||[]).some(p=>Math.hypot(p[0]-cc[0],p[1]-cc[1])<240)){const B3=pInset(Qd,Z.street*.5);if(B3&&faceDoubleTriangle(W,G(cc[0],cc[1],'','squares'),B3,diag,R)){(W.faceF3||(W.faceF3=[])).push(cc);continue;}}}
    for(const P0 of polys){const B=P0.inset?P0:pInset(P0,Z.street*(.8+.4*R())/2);if(!B)continue;
      // a block a main road crosses is cut along the road's corridor; each piece is judged on its own (faces.js): a whole block (F5) goes on below, the rest become squares
      if(!P0.inset&&Z.kind!=='ware'&&typeof faceRoadCut==='function'){const pieces=faceRoadCut(W,B);if(pieces){faceStat(W,'cutBlocks');for(const P of pieces){const f=faceClass(P),pc=pCen(P),key=o.grp?o.grp(pc[0],pc[1]):'';
          if(f.kind==='F5'){P.inset=true;polys.push(P);}else if(f.kind!=='F0'&&key==='')nL+=facePlace(W,G(pc[0],pc[1],'','squares'),P,f,R,Z.kind);else faceStat(W,'F0',P);}continue;}}
      if(o.pave===true){const pk=o.grp?o.grp(cc[0],cc[1]):'';if(pk!==null&&pk!==undefined)paveBlock(W,G(cc[0],cc[1],pk),P0,B,Z);}const area=pArea(B);if(area<60)continue;if(Z.kind==='ware'){nL+=warehouseBlock(W,G(cc[0],cc[1],''),B,R,mg);continue;}const built=[],lw=Z.lotW/Math.sqrt(dq);
      const ring=Z.kind==='domus'||Z.kind==='ware'||B.length!==4||(area>Z.ringA&&R()<Z.ringP);let lots=[],court=null;   // a piece that is not a quadrilateral (cut by a road) can only take a ring
      if(ring){const dd=Z.kind==='domus'?8.5+R()*2:Z.kind==='ware'?14:Z.depth*(.85+.3*R()),rl=ringLots(B,dd,lw,R);
        if(rl.court){court=rl.court;lots=rl.lots;}
        else lots.push(B);}
      else{let A=B[0],Bq=B[1],C=B[2],D=B[3];if(Math.hypot(Bq[0]-A[0],Bq[1]-A[1])+Math.hypot(D[0]-C[0],D[1]-C[1])<Math.hypot(C[0]-Bq[0],C[1]-Bq[1])+Math.hypot(A[0]-D[0],A[1]-D[1])){const t=A;A=Bq;Bq=C;C=D;D=t;}
        const M1=lp(D,A,.5),M2=lp(Bq,C,.5),len=Math.hypot(Bq[0]-A[0],Bq[1]-A[1]),nl=Math.max(1,Math.round(len/(lw*(.8+.4*R()))));let t0=0;
        for(let k=1;k<=nl;k++){const t1=k===nl?1:(k+(R()-.5)*.5)/nl;lots.push([lp(A,Bq,t0),lp(A,Bq,t1),lp(M1,M2,t1),lp(M1,M2,t0)]);lots.push([lp(D,C,t1),lp(D,C,t0),lp(M1,M2,t0),lp(M1,M2,t1)]);t0=t1;}}
      const blockLotStart=W.lotLog?.length||0;
      let courtPlan=court&&Z.kind==='domus'&&typeof courtyardDeckPlan==='function'?courtyardDeckPlan(W,court,ESTATE_TERRACE):null;
      if(o.whole&&Z.kind!=='domus'&&lots.some(L=>{const ob=lotOBB(L);return W.foot.hits(ob.cx,ob.cz,ob.hw,ob.hd,ob.rot,mg+.8);}))continue;
      let EB=B;const domus=Z.kind==='domus',estate=domus?{block:B.map(p=>p.slice()),court:court&&court.map(p=>p.slice()),wings:lots.length}:null;
      if(domus&&!court){const S=estatePlanStats(W);S.tooSmall=(S.tooSmall||0)+1;nL+=estateFallback(W,lots,o,R,(x,z,k)=>G(x,z,k),{});continue;}   // no court fits inside the wings: no courtyard house is possible here (not counted as an attempt)
      if(domus){const hb=houseGround(W,B);if(hb&&hb.max-hb.min>ESTATE_TERRACE.relief){const S=estatePlanStats(W);S.steep=(S.steep||0)+1;(S.steepAt||(S.steepAt=[])).push(pCen(B).map(Math.round));nL+=terraceStrips(W,B,Z,o,R,(x,z,k)=>G(x,z,k),mg);continue;}}   // spec F6: too steep for a courtyard house even on a terrace platform
      if(domus){const S=estatePlanStats(W);S.attempted++;S.transactions.push(estate);const h=houseGround(W,B);estate.relief=h?h.max-h.min:null;estate.maxExposure=courtPlan?courtPlan.maxExposure:null;
        {let reason=estatePlanReason(W,B,court,lots,o,mg,courtPlan);
          // spec 6.2.3 within the same block, when the whole block collides or its court is too exposed: first cut away what it hits (the block is
          // clipped along that road's or building's face, the larger part keeps the estate; up to three times), then try it set back 3 or 6 m from
          // the street. The estate stays at least 28 m across; what is cut off stays open garden.
          const tryBlock=B2=>{const o2=B2&&lotOBB(B2);if(!o2||Math.min(o2.hw,o2.hd)*2<28)return null;const rl=ringLots(B2,9.5,lw,R);if(!rl.court)return null;const cp=courtyardDeckPlan(W,rl.court,ESTATE_TERRACE);return{B2,rl,cp,r:estatePlanReason(W,B2,rl.court,rl.lots,o,mg,cp)};};
          const take=t=>{EB=t.B2;court=t.rl.court;lots=t.rl.lots;courtPlan=t.cp;estate.block=EB.map(p=>p.slice());estate.court=court.map(p=>p.slice());};
          let cur=B;for(let it=0;it<3&&(reason==='block-foot-conflict'||reason==='reserved-road-or-foot');it++){const f=lotHitWhat(W,cur,mg+.8);if(!f)break;const t=tryBlock(cutAway(cur,f,mg+1.8));if(!t)break;estate.cut=(estate.cut||0)+1;cur=t.B2;reason=t.r;if(!reason)take(t);}
          for(const back of[3,6]){if(!['block-foot-conflict','court-exposure-over-6m','reserved-road-or-foot','incomplete-perimeter'].includes(reason))break;const t=tryBlock(pInset(cur,back));if(!t)break;estate.setback=back;reason=t.r;if(!reason)take(t);}
          if(reason==='block-foot-conflict'){const f=lotHitWhat(W,B,mg+.8);estate.hit=!f?'?':f.tag==='road'?(f.nobleRoad?'nobleRoad':'road'):f.tag?f.tag+':'+(f.siteRole||''):f.blkLot?'blockLot':f.poly?(f.nobleHome?'noble':f.academyHome?'academy':'parcel'):f.warehouse?'warehouse':f.t?'temple':f.r>40?'monument':'small';estate.hitAt=[Math.round(f?.cx||0),Math.round(f?.cz||0),Math.round(f?.hw||0),Math.round(f?.hd||0)];}
          if(reason)estateReject(W,reason,estate);else{
            const child=estateChildWorld(W),stages=new Map(),stageSmoke=[],stageR=RNG(Math.floor(R()*0xffffffff)||1);let ok=true;
            for(let wi=0;wi<lots.length;wi++){const L=lots[wi],ob=lotOBB(L),key=o.grp?o.grp(ob.cx,ob.cz):'';if(key===null||key===undefined){ok=false;reason='layer-rejected';estate.failedWing=wi;break;}let st=stages.get(key);if(!st){st={g:new GB(1<<14),cx:ob.cx,cz:ob.cz,key};stages.set(key,st);}const p=Z.lot(stageR);p.minRoofY=courtPlan.y+3.9;p.burn=0;const logStart=child.lotLog.length,builtWing=lotBuild(child,st.g,L,p,stageR,key===''?stageSmoke:null),covered=child.lotLog.slice(logStart).reduce((a,l)=>a+Math.abs(pArea(l.L)),0),wingArea=Math.abs(pArea(L));if(!builtWing||Math.abs(covered-wingArea)>Math.max(1.5,wingArea*.015)){ok=false;reason='wing-build-incomplete';estate.failedWing=wi;estate.failedWingArea=wingArea;estate.builtWingArea=covered;break;}}
            if(ok){for(const st of stages.values())estateAppendGB(G(st.cx,st.cz,st.key),st.g);estateMergeWorld(W,child);smk.push(...stageSmoke);estate.status='committed';estate.wingLots=lots.length;S.committed++;for(const L of lots){const ob=lotOBB(L);built.push(ob);nL++;}}
            else estateReject(W,reason||'wing-build-rejected',estate);
          }}
        if(estate.status!=='committed'){const fbLots=lots.concat(court?[court]:[]);court=null;courtPlan=null;const count=estateFallback(W,fbLots,o,R,(x,z,k)=>G(x,z,k),estate);nL+=count;}
      }
      const RS=W.ringStats||(W.ringStats={rings:0,closed:0,walled:0,lot:{}}),rs=k=>{if(court&&!domus)RS.lot[k]=(RS.lot[k]||0)+1;};   // audit: how the lots of ring blocks fare
      if(!domus)for(let L of lots){if(pArea(L)<14){rs('small');continue;}let ob=lotOBB(L);if(o.lotOK&&!o.lotOK(ob.cx,ob.cz)){rs('lotOK');continue;}
        // The entire lot outline, plus roof overhang, must clear every reserved road and building. Tested on the real outlines (lotHits):
        // a corner lot's bounding box reached across the street and refused lots whose houses would not have touched anything.
        if(lotHits(W,L,mg+.8)){rs(lotHits(W,L,mg+.8,'road')?'hit':'hitRoad');continue;}
        const key=o.grp?o.grp(ob.cx,ob.cz):'';if(key===null||key===undefined){rs('grp');continue;}
        const p=Z.lot(R);if(courtPlan)p.minRoofY=courtPlan.y+3.9;p.burn=Z.burn&&R()<.4?1:0;const l0=(W.lotLog||[]).length;ob.L=L;if(lotBuild(W,G(ob.cx,ob.cz,key),L,p,R,key===''?smk:null)){const cov=(W.lotLog||[]).slice(l0).reduce((a,l)=>a+Math.abs(pArea(l.L)),0);rs(cov<Math.abs(pArea(L))*.97?'partial':'built');built.push(ob);nL++;
          if(!o.noPpl&&Z.ppl&&R()<Z.ppl){const a=L[0],b=L[1],m=lp(a,b,.5),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,px=m[0]+dz/l*1.6,pz=m[1]-dx/l*1.6;W.people.push([px,W.gy(px,pz),pz]);}}else rs('buildFail');}
      if(court&&!domus&&footTagHit(W,court,'road'))court=null;   // a road crosses this block: its lots on the road were skipped, and the yard between them is no courtyard
      let closure=court?residentialCourtClosure(court,(W.lotLog||[]).slice(blockLotStart)):{closed:false,uncovered:[]};
      if(court&&!domus&&!closure.closed){let per=0,gap=0;for(let e=0;e<court.length;e++){const a=court[e],b=court[(e+1)%court.length];per+=Math.hypot(b[0]-a[0],b[1]-a[1]);}for(const u of closure.uncovered){const a=court[u.edge],b=court[(u.edge+1)%court.length];gap+=(u.to-u.from)*Math.hypot(b[0]-a[0],b[1]-a[1]);}
        const c2=pCen(court),key=o.grp?o.grp(c2[0],c2[1]):'';
        if(gap>per*.4)court=null;   // under 60 % of the ring built: no yard and no reservation, the gap-filling pass may build there
        else if(key!==null&&key!==undefined&&courtWalls(W,G(c2[0],c2[1],key),court,closure.uncovered))closure={closed:true,uncovered:[],walled:true};}   // spec 6.2.3: the missing stretch of the ring becomes a garden wall with a gate (the U-shaped court)
      if(court&&!domus){RS.rings++;if(closure.closed)RS.closed++;if(closure.walled)RS.walled++;}
      if(court&&domus&&estate?.status==='committed'&&Z.court){const c2=pCen(court),key=o.grp?o.grp(c2[0],c2[1]):'';if(key!==null&&key!==undefined)Z.court(W,G(c2[0],c2[1],key),court,R,pArea(court),courtPlan);}
      else if(court&&!domus&&built.length>1&&Z.court){const c2=pCen(court),key=o.grp?o.grp(c2[0],c2[1]):'';if(key!==null&&key!==undefined){if(closure.closed)Z.court(W,G(c2[0],c2[1],key),court,R,pArea(court));else residentialCourtYard(W,G(c2[0],c2[1],key),court);}}   // spec 6.2: a garden only inside a closed ring; a ring with gaps keeps a plain yard with a well
      if(court&&built.length&&typeof reserveResidentialArea==='function'&&(!domus||estate?.status==='committed')){
        reserveResidentialArea(W,court,Z.kind==='domus'?'senatorial-garden':'residential-courtyard',{closed:closure.closed,uncovered:closure.uncovered,allowed:closure.closed||domus?['garden','fountain','columns','paths']:['paths'],yard:!closure.closed&&!domus,walled:!!closure.walled,deckY:courtPlan&&courtPlan.y,minEave:courtPlan?Math.min(...(W.lotLog||[]).slice(blockLotStart).map(l=>l.floorY+l.gH+(l.storeys-1)*l.sH)):null,deckBuilt:built.length>1&&(closure.closed||domus)});
        if(Z.kind==='domus')reserveResidentialArea(W,EB,'senatorial-estate');}
      for(const ob of built){const f=W.foot.add(ob.cx,ob.cz,ob.hw,ob.hd,ob.rot);if(ob.L)f.blkLot=ob.L;}}}   // blkLot: the lot's real outline, for lotHits
  const groups={};for(const e of chunks.values()){const m=layTag(e.g.mesh(MAT.city),e.lay);if(!m)continue;let G2=groups[e.k];if(!G2){if(e.k!=='')G2=groups[e.k]=preLayerGroup(W,e.k);else{G2=groups[e.k]=new THREE.Group();W.scene.add(G2);}}G2.add(m);}
  if(smk.length)W.scene.add(smokeSys(smk.slice(0,280),{col:[.86,.84,.8],rise:24,size:3,rate:.06,alpha:.3,per:8,drift:[4,0,2]}));return nL;}

/* TEST tool: residential embedding under the lowest-ground policy; no raised terraces. */
window.__houseFloat=()=>{const L=W0.lotLog||[];let embedded=0,embeddedMax=0;for(const l of L)if(l.embeddedRise>0){embedded++;embeddedMax=Math.max(embeddedMax,l.embeddedRise);}
  return{lots:L.length,embedded,embeddedMax:+embeddedMax.toFixed(2),terraces:L.filter(l=>l.terrace).length};};

/* Dense mixed three/four-storey elite courtyard street blocks. Heights and boundaries are design choices,
   not a reconstruction of every senator's home. Public streets remain public. */
const NOBLE_QUARTER={
  carinae:[[470,-118],[805,-118],[850,-30],[760,85],[535,95],[445,25]],
  velia:[[340,35],[460,5],[540,60],[505,175],[385,220],[310,155]]
};
function nobleInside(x,z,P){let yes=false;for(let i=0,j=P.length-1;i<P.length;j=i++){
  const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function nobleQuarterAt(x,z){
  // The Subura north of this boundary retains its low-income/dense zoning rules.
  if(x<280||x>890||z>255||z< -120)return null;
  if(segD(x,z,0,280,230,320)<205||Math.hypot(x-572,z-200)<150)return null;
  if(nobleInside(x,z,NOBLE_QUARTER.carinae)||nobleInside(x,z,NOBLE_QUARTER.velia))return 'core';
  for(const P of Object.values(NOBLE_QUARTER)){const closed=[...P,P[0]];if(polyDist(x,z,closed)[0]<30)return 'transition';}
  return null;
}
// Convex parcel clipping keeps party walls coincident instead of scattering freestanding villas.
function nobleClip(P,n,d,keep=true){const out=[],val=p=>(p[0]*n[0]+p[1]*n[1]-d)*(keep?1:-1);
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],va=val(a),vb=val(b);if(va<=1e-7)out.push(a);
    if((va<0&&vb>0)||(va>0&&vb<0))out.push(lp(a,b,va/(va-vb)));}return out;}
function nobleOffset(P,widths){let Q=P;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),n=[dz/l,-dx/l];Q=nobleClip(Q,n,a[0]*n[0]+a[1]*n[1]-widths[i]);if(Q.length<3)return null;}return pArea(Q)>25?Q:null;}
function nobleOverlap(P,f){const B=[[-f.hw,-f.hd],[f.hw,-f.hd],[f.hw,f.hd],[-f.hw,f.hd]].map(p=>[f.cx+p[0]*f.c+p[1]*f.s,f.cz-p[0]*f.s+p[1]*f.c]);
  for(const Q of[P,B])for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],n=[b[1]-a[1],a[0]-b[0]],A=P.map(p=>p[0]*n[0]+p[1]*n[1]),C=B.map(p=>p[0]*n[0]+p[1]*n[1]);if(Math.max(...A)<Math.min(...C)-.01||Math.max(...C)<Math.min(...A)-.01)return false;}return true;}
function nobleParcels(P,count,R){
  // A street block holds two/three compounds; each compound contains several house-sized wings.
  const ob=lotOBB(P),n=[ob.ux,ob.uz],v=P.map(p=>p[0]*n[0]+p[1]*n[1]),lo=Math.min(...v),hi=Math.max(...v),cols=count===6?3:2,out=[];
  for(let k=0;k<cols;k++){const Q=nobleClip(nobleClip(P,n,lo+(hi-lo)*(k+1)/cols),n,lo+(hi-lo)*k/cols,false);if(Q.length>=3&&pArea(Q)>130)out.push(Q);}
  return out;
}
function nobleInternalLanes(P,count){const o=lotOBB(P),n=[o.ux,o.uz],v=P.map(p=>p[0]*n[0]+p[1]*n[1]),lo=Math.min(...v),hi=Math.max(...v),cols=count===6?3:2,out=[];
  for(let k=1;k<cols;k++){const d=lo+(hi-lo)*k/cols,hit=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],va=a[0]*n[0]+a[1]*n[1]-d,vb=b[0]*n[0]+b[1]*n[1]-d;if(va*vb<0)hit.push(lp(a,b,va/(va-vb)));}if(hit.length===2)out.push({a:hit[0],b:hit[1],width:1.6,service:true});}return out;
}
function nobleLot(R){const seed=R();return{lux:true,part:R()<.18?9:0,seed,sty:0,fl:262144|2|16,nSt:R()<.82?3:4,gH:3.8,sH:2.9,pitch:(20+R()*4)*DEG,lit:.8,flat:false,noSplit:true,loggiaA:false,awn:0,balc:0,roofPart:R()<.48?43:1};}
function nobleSlopeLimit(area,nSt){return Math.min(3.8+(nSt-3)*1.2,3.8+(nSt-3)*2.9-.4,area>650?2.2:area>350?3.1:4.5);}
function nobleSplitPlot(P){const o=lotOBB(P),n=[o.ux,o.uz],v=P.map(p=>p[0]*n[0]+p[1]*n[1]),d=(Math.min(...v)+Math.max(...v))/2;
  return[true,false].map(side=>nobleClip(P,n,d,side)).map(Q=>nobleOffset(Q,Q.map(()=>.8))).filter(Q=>Q&&pArea(Q)>110);}
function decorateNobleLot(W,g,L,o){
  // Street-facing timber portal and painted panels sit 20 cm inside the parcel edge.
  const a=L[0],b=L[1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<5.8)return;
  const dx=b[0]-a[0],dz=b[1]-a[1],nx=-dz/l,nz=dx/l,F=frame((a[0]+b[0])/2+nx*.2,o.floorY??houseGround(W,L).min+.15,(a[1]+b[1])/2+nz*.2,Math.atan2(-dz,dx)),z=-.2;
  // Two broad timber leaves, with a restrained inset panel on each; these overlay
  // the intact wall surface, so the decoration never cuts a doorway through it.
  g.set(3,o.seed);for(const sx of[-.55,.55])box(g,F,sx,0,z+.025,.55,3.3,.055,31);
  g.set(2,o.seed);for(const sx of[-.55,.55]){
    box(g,F,sx,.42,z-.007,.39,.78,.025,31);box(g,F,sx,1.94,z-.007,.39,.72,.025,31);
    box(g,F,sx-.43,0,z-.01,.045,3.3,.025,31);box(g,F,sx+.43,0,z-.01,.045,3.3,.025,31);
    box(g,F,sx,0,z-.01,.045,3.3,.025,31);
  }
  // Stone jambs, projecting lintel, paired attached pilasters and a modest pediment.
  for(const sx of[-1.22,1.22]){
    box(g,F,sx,.02,z+.035,.14,3.46,.07,31);
    box(g,F,sx,-.02,z+.035,.23,.2,.07,31);box(g,F,sx,3.28,z+.035,.22,.18,.07,31);
  }
  box(g,F,0,3.36,z+.035,1.48,.2,.06,31);
  for(const sx of[-1.62,1.62]){
    box(g,F,sx,.05,z-.01,.16,3.48,.025,31);
    box(g,F,sx,-.02,z-.01,.27,.2,.025,31);box(g,F,sx,3.32,z-.01,.25,.18,.025,31);
  }
  g.set(2,o.seed);g.poly([F.p(-1.48,3.56,z-.035),F.p(1.48,3.56,z-.035),F.p(0,3.94,z-.035)],[0,0,-1]);
  box(g,F,0,3.54,z+.025,1.55,.09,.06,31);
  // Broad red-ochre painted fields flank the entrance without a dense stripe motif.
  if(l>=8.5){
    const hx=Math.min(1.05,(l*.5-1.65)*.42),cx=1.65+(l*.5-1.65)*.5;
    for(const sx of[-cx,cx]){
      g.set(25,o.seed);box(g,F,sx,.38,z-.01,hx,2.72,.025,31);
      g.set(2,o.seed);box(g,F,sx,.34,z-.01,hx+.07,.12,.025,31);box(g,F,sx,3.02,z-.01,hx+.07,.12,.025,31);
      for(const side of[-1,1])box(g,F,sx+side*(hx+.01),.4,z-.01,.06,2.6,.025,31);
      // One centered painted lozenge gives the panel a clear Roman accent.
      const d=.34;g.set(3,o.seed);g.poly([F.p(sx,.98,z-.035),F.p(sx+d,.98+d,z-.035),F.p(sx, .98+2*d,z-.035),F.p(sx-d,.98+d,z-.035)],[0,0,-1]);
    }
  }
  // A compact three-window upper group with shallow stone surrounds on this facade only.
  if(l>=8.2&&o.nSt>=3){
    const wy=o.gH+(o.nSt-2)*o.sH+.62;
    const gallery=houseGalleryPlan(L,o),galleryFloors=new Set(gallery.map(p=>p.level));
    if(!galleryFloors.has(o.nSt-1)){
    for(const x of[-2.45,0,2.45]){
      g.set(0,.16,0,1|64);g.poly([F.p(x-.36,wy-.52,z-.045),F.p(x+.36,wy-.52,z-.045),F.p(x+.36,wy+.52,z-.045),F.p(x-.36,wy+.52,z-.045)],[0,0,-1]);
      g.set(7,.5);box(g,F,x,wy,z-.01,.34,1.12,.025,31);
      g.set(2,o.seed);for(const sx of[-.48,.48])box(g,F,x+sx,wy-.08,z-.01,.1,1.48,.025,31);
      box(g,F,x,wy-.2,z-.01,.59,.14,.025,31);box(g,F,x,wy+1.36,z-.01,.58,.14,.025,31);
      box(g,F,x,wy-.34,z-.01,.68,.14,.025,31);
    }
    }
  }
}
function nobleWingRoof(g,P,I,i,eave,pitch,seed){
  const n=(i+1)%P.length,a=P[i],b=P[n],ia=I[i],ib=I[n],ra=lp(a,ia,.5),rb=lp(b,ib,.5);
  const depth=(Math.hypot(ia[0]-a[0],ia[1]-a[1])+Math.hypot(ib[0]-b[0],ib[1]-b[1]))*.5;
  if(depth<1.2)return eave;
  const rise=Math.tan(Math.max(18,pitch/DEG)*DEG)*depth*.5,yR=eave+rise,Y=(p,y)=>[p[0],y,p[1]];
  g.set(43,seed);
  g.poly([Y(a,eave),Y(b,eave),Y(rb,yR),Y(ra,yR)],[0,1,0]);
  g.poly([Y(ra,yR),Y(rb,yR),Y(ib,eave),Y(ia,eave)],[0,1,0]);
  // Close the gable ends. Adjacent wings at different heights each contribute the
  // portion needed to seal their own roof section at the stepped junction.
  const end0=lp(ra,rb,0),end1=lp(ra,rb,1);
  g.poly([Y(a,eave),Y(ia,eave),Y(end0,yR)],[1,0,0]);
  g.poly([Y(b,eave),Y(end1,yR),Y(ib,eave)],[1,0,0]);
  return yR;
}
function nobleMaxEdge(P){let m=0;for(let i=0;i<P.length;i++)m=Math.max(m,Math.hypot(P[(i+1)%P.length][0]-P[i][0],P[(i+1)%P.length][1]-P[i][1]));return m;}
function nobleCourtFits(P,I){if(!I||I.length<3||Math.abs(pArea(I))<35)return false;const o=lotOBB(I);return Math.min(o.hw,o.hd)*2>=5;}
function nobleCourtyardValid(P,I,ground,y,nSt,gH,sH){
  if(!I||!nobleCourtFits(P,I))return false;
  const minStoreys=nSt>=4?3:nSt,lowestEave=y+gH+(minStoreys-1)*sH,courtBase=ground.max+.16;
  return courtBase>ground.max&&lowestEave-courtBase>=2;
}
function nobleCourtHouse(W,g,P,R,block){
  const o=nobleLot(R),ob=lotOBB(P),ground=houseGround(W,P),area=pArea(P);if(!ground)return null;
  const relief=ground.max-ground.min;if(relief>nobleSlopeLimit(area,o.nSt)||Math.min(ob.hw,ob.hd)<4.2)return null;
  const y=ground.min+.15,low=ground.min-.2,H=y+o.gH+(o.nSt-1)*o.sH,Y=(p,h)=>[p[0],h,p[1]];
  // Inset by a substantial room depth. Long thin lots become solid houses, never paper-thin rings.
  const depth=Math.min(8.5,Math.max(5.6,Math.sqrt(area)*.24));let I=nobleOffset(P,P.map(()=>depth));
  if(I&&(I.length!==P.length||pArea(I)<35||Math.min(lotOBB(I).hw,lotOBB(I).hd)<2.4))I=null;
  const longParcel=nobleMaxEdge(P)>24||area>280;
  const solidFits=typeof residentialSolidFits==='function'?residentialSolidFits(P):nobleMaxEdge(P)<=22&&Math.min(ob.hw,ob.hd)*2<=16&&area<=260;
  if(longParcel&&!nobleCourtyardValid(P,I,ground,y,o.nSt,o.gH,o.sH))return null;
  if(!I&&!solidFits)return null;
  if(I&&!nobleCourtyardValid(P,I,ground,y,o.nSt,o.gH,o.sH))return null;
  if(I){let best=0,score=Infinity;for(let k=0;k<I.length;k++){const d=P.reduce((sum,p,i)=>sum+(p[0]-I[(i+k)%I.length][0])**2+(p[1]-I[(i+k)%I.length][1])**2,0);if(d<score){score=d;best=k;}}I=I.map((_,i)=>I[(i+best)%I.length]);}
  const C=I?pCen(I):pCen(P),volumes=[],roofs=[];let roofspan=I?0:nobleMaxEdge(P),courtBase=null,lowestEave=null;
  if(I){
    courtBase=ground.max+.16;
    // Select a broad entrance wing. Side/rear wings differ by at most one storey, never below three.
    let front=0;for(let i=1;i<P.length;i++)if(Math.hypot(...[P[(i+1)%P.length][0]-P[i][0],P[(i+1)%P.length][1]-P[i][1]])>Math.hypot(P[(front+1)%P.length][0]-P[front][0],P[(front+1)%P.length][1]-P[front][1]))front=i;
    for(let i=0;i<P.length;i++){
      const n=(i+1)%P.length,a=P[i],b=P[n],ia=I[i],ib=I[n],len=Math.hypot(b[0]-a[0],b[1]-a[1]),maxSpan=typeof RESIDENTIAL_RULES!=='undefined'?RESIDENTIAL_RULES.maxRoofSpan:14,segments=Math.max(1,Math.ceil(len/maxSpan));roofspan=Math.max(roofspan,len/segments);
      for(let k=0;k<segments;k++){
        const t0=k/segments,t1=(k+1)/segments,A=lp(a,b,t0),B=lp(a,b,t1),D=lp(ia,ib,t0),E=lp(ia,ib,t1),Q=[A,B,E,D];
        const ns=o.nSt===4&&i!==front?3:o.nSt,top=y+o.gH+(ns-1)*o.sH;
        g.set(o.part,o.seed+i*.013,0,o.fl,ns,o.gH,0,.8);for(let e=0;e<Q.length;e++)wall(g,IDF,...Q[e],...Q[(e+1)%Q.length],low,top,y,o.sH);
        const r0=lp(A,D,.5),r1=lp(B,E,.5),heightJitter=((hash2(i+o.seed*127,k+31)%1)-.5)*.34,ridgeTop=top+Math.tan(o.pitch)*(Math.hypot(A[0]-D[0],A[1]-D[1])+Math.hypot(B[0]-E[0],B[1]-E[1]))*.25+heightJitter;
        const roofSeed=o.seed+i*.027+k*.071,roofPart=(k+i)%4===0?(o.roofPart===43?1:43):o.roofPart;
        const endRise=lp(A,D,.5),endRise2=lp(B,E,.5),ridge0=[r0[0],ridgeTop,r0[1]],ridge1=[r1[0],ridgeTop,r1[1]],hip=(i+k)%2===1;
        g.set(roofPart,roofSeed);g.poly([Y(A,top),Y(B,top),ridge1,ridge0],[0,1,0]);g.poly([ridge0,ridge1,Y(E,top),Y(D,top)],[0,1,0]);
        if(hip){g.poly([Y(A,top),ridge0,Y(endRise,top)],[1,0,0]);g.poly([Y(B,top),Y(endRise2,top),ridge1],[1,0,0]);}
        else{g.set(o.part,o.seed,0,0,1,3.8);g.poly([Y(A,top),Y(D,top),ridge0]);g.poly([Y(B,top),ridge1,Y(E,top)]);}
        volumes.push({polygon:Q,storeys:ns,depth,top});roofs.push(ridgeTop);
      }
    }
    lowestEave=Math.min(...volumes.map(v=>v.top));
    // A low garden floor can be locally raised; the surrounding house still starts at the lowest terrain.
    courtyardDeck(W,g,I,{y:courtBase,bottom:ground.min-.2});const J=I.map(p=>lp(p,C,.22));
    for(let i=0;i<I.length;i++){const n=(i+1)%I.length,a=J[i],b=J[n],l=Math.hypot(b[0]-a[0],b[1]-a[1]),num=Math.max(1,Math.floor(l/3));
      for(let j=0;j<num;j++){const q=lp(a,b,(j+.5)/num);W.cols.ion.push([q[0],courtBase,q[1],0,3.05,[.78,.7,.58]]);}
      g.set(25,o.seed);wall(g,IDF,...I[n],...I[i],courtBase,courtBase+1.05,courtBase,2.9);
      g.set(2,o.seed);wall(g,IDF,...a,...b,courtBase+3.02,courtBase+3.25,courtBase,2.9);
      // Keep this inner arcade open to the sky so its columns remain visible from above.
    }
    const basinHalf=Math.min(2.1,Math.max(.9,Math.min(lotOBB(J).hw,lotOBB(J).hd)*.34)),F=frame(C[0],courtBase,C[1],0);
    g.set(2,.4);for(const sg of[-1,1]){box(g,F,sg*(basinHalf+.12),0,0,.12,.48,basinHalf+.24,31);box(g,F,0,0,sg*(basinHalf+.12),basinHalf,.48,.12,31);}
    if(W.poolG)W.poolG.poly([[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>F.p(x*basinHalf,.34,z*basinHalf)),[0,1,0]);
    g.set(6,.48);lathe(g,F,0,.34,0,[[.32,0],[.3,.24],[.16,.6],[.55,.75],[.5,.84],[.07,.94]],12);
    for(let k=0;k<J.length;k++){const q=lp(J[k],C,.13);if(Math.hypot(q[0]-C[0],q[1]-C[1])<basinHalf+1.3)continue;const T=frame(q[0],courtBase,q[1],0);g.set(25,o.seed);lathe(g,T,0,0,0,[[.36,0],[.48,.65],[.55,.72]],10);W.trees.push([q[0],courtBase+.6,q[1],k%2?'shrub':'flower',.7,null,2]);}
    WAT.add(C[0],C[1],2);
    // Use the same dressed entrance and classical column kit as the palace precinct.
    const L=[...P.slice(front),...P.slice(0,front)];decorateNobleLot(W,g,L,{...o,floorY:y});
  }else{
    g.set(o.part,o.seed,0,o.fl,o.nSt,o.gH,0,.8);for(let i=0;i<P.length;i++)wall(g,IDF,...P[i],...P[(i+1)%P.length],low,H,y,o.sH);
    const inset=P.map(p=>lp(p,C,.45));for(let i=0;i<P.length;i++){const n=(i+1)%P.length;g.set(o.roofPart,o.seed);g.poly([Y(P[i],H),Y(P[n],H),Y(inset[n],H+1.5),Y(inset[i],H+1.5)],[0,1,0]);}
    g.set(o.roofPart,o.seed);g.poly(inset.map(p=>Y(p,H+1.5)),[0,1,0]);volumes.push({polygon:P,storeys:o.nSt,depth:Math.min(ob.hw,ob.hd)*2,top:H});roofs.push(H+1.5);decorateNobleLot(W,g,P,{...o,floorY:y});
  }
  return{x:ob.cx,z:ob.cz,y,storeys:o.nSt,polygon:P,court:I,block,volumes,roofPart:o.roofPart,roofTop:Math.max(...roofs),roofspan,courtBase,lowestEave,base:low,groundMin:ground.min,groundMax:ground.max};
}
function nobleDetailHouse(W,g,P,R,block,index){
  if(P.length!==4||pArea(P)<380)return null;
  const ob=lotOBB(P),n=index%2?'rome_lux_row4':'rome_lux_corner4',dim=n.endsWith('row4')?[25.6,22.2]:[22.2,22.2],F=frame(ob.cx,0,ob.cz,ob.rot);
  let fit=1.05;const rect=s=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>{const q=F.p(x*dim[0]*s/2,0,z*dim[1]*s/2);return[q[0],q[2]];});
  while(fit>.8&&!rect(fit).every(p=>nobleInside(...p,P)))fit-=.025;if(fit<=.8)return null;
  const I=rect(fit),ground=houseGround(W,P),lo=ground.min,hi=ground.max;if(hi-lo>2.2)return null;
  const y=lo+.15;romeStand(W,n,ob.cx,ob.cz,y,ob.rot,(gg,FF)=>courtBlock(W,gg,FF,{cx:0,cz:0,w:dim[0]*fit-.9,d:dim[1]*fit-.9,y0:0,nSt:4,gH:4,sH:3.2,cw:7*fit,cd:6*fit,part:0,seed:R(),sty:1,fl:2,garden:false}),{grot:ob.rot+Math.PI,sx:fit,sz:fit});
  const all=[...P,...I],Y=(p,h)=>[p[0],h,p[1]];g.set(11,.4);
  for(const t of THREE.ShapeUtils.triangulateShape(P.map(p=>new THREE.Vector2(...p)),[I.map(p=>new THREE.Vector2(...p))]))g.poly(t.map(k=>Y(all[k],y+.04)),[0,1,0]);
  const C=pCen(I),rec={asset:n,x:ob.cx,z:ob.cz,y,rot:ob.rot,w:dim[0]*fit,d:dim[1]*fit,storeys:4,polygon:P,court:null,block,groundMin:lo,groundMax:hi,scale:fit};
  WAT.add(C[0],C[1],2);return rec;
}
function buildNobleQuarter(W){
  const R=RNG(56025),g=new GB(1<<17),gA=new GB(1<<14),fixed=W.foot.list.slice(),blocks=[],homes=[],plots=[],roads=[],node=(i,j)=>[310+i*50+(hash2(i,j)-.5)*19, -145+j*45+(hash2(i+51,j+17)-.5)*17];
  const blocked=P=>{const ob=lotOBB(P);return fixed.some(f=>Math.hypot(f.cx-ob.cx,f.cz-ob.cz)<f.r+Math.hypot(ob.hw,ob.hd)&&nobleOverlap(P,f));};
  const streetWidth=(axis,k)=>k%3===0?(axis?6.2:5.4):k%3===1?4.4:2.4;
  for(let i=0;i<12;i++)for(let j=0;j<8;j++){
    const Q=[node(i,j),node(i+1,j),node(i+1,j+1),node(i,j+1)],C=pCen(Q);if(nobleQuarterAt(...C)!=='core')continue;
    const widths=[streetWidth(0,j),streetWidth(1,i+1),streetWidth(0,j+1),streetWidth(1,i)],B=nobleOffset(Q,widths.map(w=>w/2));if(!B)continue;
    let triangular=hash2(i+29,j+3)<.25;
    if(triangular){triangular=false;   // spec 5.2: no random triangles of houses; now and then the diagonal lane makes one double-triangle square (F3)
      if(!AUREA_SITE(...C)&&!(W.faceF3||[]).some(p=>Math.hypot(p[0]-C[0],p[1]-C[1])<160)&&!blocked(B)&&faceDoubleTriangle(W,g,B,true,R)){(W.faceF3||(W.faceF3=[])).push(C);for(let e=0;e<4;e++)roads.push({a:Q[e],b:Q[(e+1)%4],width:widths[e]});continue;}}
    const raw=triangular?[nobleOffset([B[0],B[1],B[2]],[0,0,1.1]),nobleOffset([B[0],B[2],B[3]],[1.1,0,0])].filter(Boolean):[B];
    for(let t=0;t<raw.length;t++){
      const shape=raw[t],id=`${i}:${j}:${t}`,count=triangular?4:(widths.some(w=>w>=5.4)&&hash2(i+9,j+42)<.6?4:(hash2(i+7,j+71)<.65?6:4)),candidates=nobleParcels(shape,count,R),built=[];
      const attempt=(P,level=0)=>{if(!P||P.some(p=>nobleQuarterAt(...p)!=='core')||blocked(P)){
          if(P&&level<2&&pArea(P)>300)for(const Q of nobleSplitPlot(P))attempt(Q,level+1);return;}
        const gg=AUREA_SITE(...pCen(P))?gA:g;let rec=homes.length<4&&pArea(P)>600?nobleDetailHouse(W,gg,P,R,id,homes.length):null;if(rec)homes.push(rec);else rec=nobleCourtHouse(W,gg,P,R,id);   // gA: the parcels on the Golden House ground, shown in states 0-6 (aureaSite)
        if(!rec){if(level<3&&pArea(P)>220)for(const Q of nobleSplitPlot(P))attempt(Q,level+1);return;}
        plots.push(rec);built.push(rec);};
      for(const P0 of candidates)attempt(nobleOffset(P0,P0.map(()=>.9)));
      if(built.length){roads.push(...nobleInternalLanes(shape,count));blocks.push({id,shape,triangular,target:count===6?3:2,parcels:built.length,polygon:shape});}
    }
    // One street network for all blocks; no ornamental ring-road around every individual home.
    if(plots.some(p=>p.block.startsWith(`${i}:${j}:`))){for(let e=0;e<4;e++)roads.push({a:Q[e],b:Q[(e+1)%4],width:widths[e]});if(triangular)roads.push({a:B[0],b:B[2],width:2.2});}
  }
  // Reserve lanes now, before subsequent general housing generators run.
  for(const r of roads){const dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],len=Math.hypot(dx,dz);if(!len)continue;
    W.foot.add((r.a[0]+r.b[0])/2,(r.a[1]+r.b[1])/2,len/2,r.width/2,Math.atan2(-dz,dx),'road');}
  W.nobleProcedural=plots.filter(p=>!p.asset);W.nobleParcels=plots;W.nobleBlocks=blocks;W.nobleRoads=roads;W.nobleHomes=homes;
  const mesh=g.mesh(MAT.city);if(mesh){mesh.name='noble_dense_courtyard_blocks';W.scene.add(mesh);}const mA=gA.mesh(MAT.city);if(mA)preLayerGroup(W,'aureaSite').add(mA);
  for(const P of plots){const ob=lotOBB(P.polygon),f=W.foot.add(ob.cx,ob.cz,ob.hw+.8,ob.hd+.8,ob.rot);f.poly=nobleOffset(P.polygon,P.polygon.map(()=>-.7))||P.polygon;f.nobleHome=true;}
  // Exact terrain-following paving preserves narrow lanes below the 2.5m city raster resolution.
  const pg=new GB(1<<15),pgA=new GB(1<<12),seen=new Set();for(const r of roads){const ka=r.a.map(x=>x.toFixed(2)).join(','),kb=r.b.map(x=>x.toFixed(2)).join(','),key=[ka,kb].sort().join('|');if(seen.has(key))continue;seen.add(key);
    const dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l,N=Math.ceil(l/2.5);
    for(let k=0;k<N;k++){const a=lp(r.a,r.b,k/N),b=lp(r.a,r.b,(k+1)/N),c=lp(a,b,.5);if(nobleQuarterAt(...c)!=='core'||fixed.some(f=>Math.abs(f.c*(c[0]-f.cx)-f.s*(c[1]-f.cz))<f.hw+.2&&Math.abs(f.s*(c[0]-f.cx)+f.c*(c[1]-f.cz))<f.hd+.2&&f.tag!=='road'))continue;
      const P=[[-1,a],[1,a],[1,b],[-1,b]].map(([s,p])=>[p[0]+nx*r.width/2*s,p[1]+nz*r.width/2*s]),gp=AUREA_SITE(...c)?pgA:pg;gp.set(r.width>4?10:33,.4);gp.poly(P.map(p=>[p[0],W.gy(...p)+.16,p[1]]),[0,1,0]);}}
  const pm=pg.mesh(MAT.city,false);if(pm){pm.name='noble_main_streets_and_lanes';W.scene.add(pm);}const pA=pgA.mesh(MAT.city,false);if(pA)preLayerGroup(W,'aureaSite').add(pA);
  W.pois.push({n:'卡里奈·庭院街宅',l:'Carinae',x:680,z:-40,y:W.gy(680,-40)+25,s0:0,s1:99,d:1000,sub:true,
    info:'【史】卡里奈有显贵住宅。此处用贴邻宅院、曲折街巷和三／四层混合体量作设计推演；层数、户数和道路宽度不是考古测绘结论。'});
}
function nobleViews(W){
  W.views.noble={n:'元老街坊·卡里奈',pos:[780,W.gy(700,-10)+135,155],tgt:[650,W.gy(650,-10)+8,-10]};
  const H=W.nobleProcedural.filter(p=>p.court&&p.groundMax-p.groundMin<1.5).sort((a,b)=>pArea(b.court)-pArea(a.court))[0]||W.nobleProcedural[0];if(H)W.views.nobleHome={n:'三四层宅院·近看',pos:[H.x+38,H.y+37,H.z+40],tgt:[H.x,H.y+5,H.z]};
  W.views.noblePlan={n:'元老街坊·俯看',pos:[650,310,0],tgt:[650,W.gy(650,0),0]};
}

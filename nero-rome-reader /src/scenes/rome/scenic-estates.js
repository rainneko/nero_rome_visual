/* Restored old-style courtyard estates. Call after fixed monuments and academy Foot
   reservations, before ordinary residential infill. One estate is one complete court. */
function scenicEstateReject(ground, maxRelief, maxExposure, hasFootprintHit) {
  if (!ground || !Number.isFinite(ground.min) || !Number.isFinite(ground.max)) return 'invalid-ground';
  if (ground.max - ground.min > maxRelief + .001) return 'slope-too-steep';
  if (maxExposure > 2.001) return 'terrace-exposure';
  if (hasFootprintHit) return 'footprint-conflict';
  return null;
}
function buildScenicEstates(W) {
  const g=new GB(1<<17),R=RNG(731908),placed=[],rejected=[],acceptedPolys=[];
  const overlap=(A,B)=>{
    for(const P of [A,B])for(let i=0;i<P.length;i++){
      const a=P[i],b=P[(i+1)%P.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
      const x=A.map(p=>p[0]*nx+p[1]*nz),y=B.map(p=>p[0]*nx+p[1]*nz);
      if(Math.max(...x)<Math.min(...y)-.01||Math.max(...y)<Math.min(...x)-.01)return false;
    } return true;
  };
  const makePoly=(x,z,w,d,rot)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[x+u*Math.cos(rot)+v*Math.sin(rot),z-u*Math.sin(rot)+v*Math.cos(rot)]);
  const academyReserve=(af)=>makePoly(af.ox,af.oz,64,100,af.rot);
  const admit=(site,x,z,w,d,rot,index)=>{
    const P=makePoly(x,z,w,d,rot),ob=lotOBB(P),broad=makePoly(x,z,w+3,d+3,rot);
    let hit=W.foot.hits(ob.cx,ob.cz,ob.hw+1.5,ob.hd+1.5,ob.rot,0);
    if(!hit)hit=acceptedPolys.some(Q=>overlap(broad,Q));
    const ground=houseGround(W,P,2),exposure=ground?ground.max-ground.min:Infinity,deckExposure=ground?exposure+.15:Infinity;
    const why=scenicEstateReject(ground,1.8,deckExposure,hit);
    if(why){rejected.push({site,x,z,w,d,reason:why,relief:Number.isFinite(exposure)?+exposure.toFixed(2):null});return false;}
    const y=ground.max+.10;
    const innerW=w-13,innerD=d-13,innerPolygon=makePoly(ob.cx,ob.cz,innerW,innerD,ob.rot);
    const deckY=y+.05,deckBottom=ground.min-.2;
    const simpleStart=W.cols.simple.length;
    // Two-storey Roman roofed gallery, continuous residential perimeter, open garden.
    // courtBlock's garden option is off: no inner walls or random canopy obscure the court.
    const top=courtBlock(W,g,frame(ob.cx,0,ob.cz,ob.rot),{
      cx:0,cz:0,w,d,y0:y,nSt:2,sH:3.65,gH:4.35,cw:w-13,cd:d-13,
      part:0,seed:.27+R()*.32,sty:5,fl:1|64|8,garden:false,peristyle:true
    });
    if(!Number.isFinite(top)){rejected.push({site,x,z,w,d,reason:'court-build-failed'});return false;}
    // Explicitly support and pave the court down to the lowest sampled ground.
    const actualDeckY=courtyardDeck(W,g,innerPolygon,{y:deckY,bottom:deckBottom,relief:exposure,maxExposure:deckY-ground.min});
    // courtBlock emits its peristyle as simple columns; this estate's column order is Ionic.
    g.set(23,.43);g.poly(innerPolygon.map(p=>[p[0],actualDeckY+.02,p[1]]),[0,1,0]);
    const gardenFrame=frame(ob.cx,actualDeckY,ob.cz,ob.rot);g.set(5,.44);
    for(const[hx,hz]of[[innerW/2,.7],[.7,innerD/2]])g.poly([gardenFrame.p(-hx,.04,-hz),gardenFrame.p(hx,.04,-hz),gardenFrame.p(hx,.04,hz),gardenFrame.p(-hx,.04,hz)],[0,1,0]);
    const estateColumns=W.cols.simple.splice(simpleStart);
    W.cols.ion.push(...estateColumns);
    // Fountain sits fully inside the open court, visible above the planting and arcade.
    const courtX=ob.cx,courtZ=ob.cz,waterY=actualDeckY+.11;
    fountain(W,g,courtX,courtZ,{y:waterY,hx:Math.min(3.4,(w-13)*.17),hz:Math.min(2.8,(d-13)*.17),statue:1.8});
    for(const [sx,sz,type,scale] of [[-.32,-.32,'cyp',.46],[.32,-.32,'cyp',.46],[-.32,.32,'flower',.62],[.32,.32,'flower',.62]]){
      const tx=ob.cx+sx*innerW,tz=ob.cz+sz*innerD;
      if(Math.hypot(tx-courtX,tz-courtZ)>4.8)W.trees.push([tx,waterY,tz,type,scale,null,2]);
    }
    // courtBlock records its authored estate reservation; tag that record and footprint.
    const f=[...W.foot.list].reverse().find(q=>q.reservation?.role==='authored-courtyard-estate'&&Math.hypot(q.cx-ob.cx,q.cz-ob.cz)<.1);
    if(f){f.scenicEstate=true;f.siteRole='scenic-courtyard-estate';f.reservation.role='scenic-courtyard-estate';}
    const courtEaveY=y+Math.min(4.35*.85,5.2)+.2;
    const rec={site,x:ob.cx,z:ob.cz,y,rot:ob.rot,w,d,storeys:2,roofTop:top,roofEaveY:top,
      lowestEaveY:courtEaveY,courtEaveClearance:+(courtEaveY-deckY).toFixed(2),
      groundMin:ground.min,groundMax:ground.max,groundRelief:+exposure.toFixed(2),deckExposure:+(actualDeckY-ground.min).toFixed(2),deckY:actualDeckY,deckBottom,
      polygon:P,courtPolygon:innerPolygon,polygons:[P,innerPolygon],court:[innerW,innerD],fountain:true,index};
    placed.push(rec);acceptedPolys.push(broad);return true;
  };
  const attemptSite=(site,center,candidates,target)=>{
    let count=0;
    for(const [dx,dz,size,rot] of candidates){if(count>=target)break;const x=center[0]+dx,z=center[1]+dz;
      if(admit(site,x,z,size[0],size[1],rot,placed.length))count++;}
    return count;
  };
  // Start with legacy courtyard estates on the Aventine; use compact 30–36 m plots.
  const aveRot=-30*DEG,ave=[],aveCenter=[-460,1020];
  for(let z=740;z<=1300;z+=40)for(let x=-670;x<=-250;x+=42){
    const dx=x-aveCenter[0],dz=z-aveCenter[1],w=30+((Math.round((x+670)/42)+Math.round((z-740)/40))%3)*2;
    ave.push([dx,dz,[w,30+(Math.round((z-740)/40)%3)*2],aveRot]);
  }
  ave.sort((a,b)=>Math.hypot(a[0],a[1])-Math.hypot(b[0],b[1]));
  const aveCount=attemptSite('aventine',aveCenter,ave,4);
  // Academy growth surrounds the original 170 m reserve. AF is the authored academy frame.
  const af=W.AF||frame(1350,0,-330,Math.PI-200*DEG);
  const acad=[];
  const academyKeepout=academyReserve(af);
  for(let r=95;r<=235;r+=23.333)for(let k=0;k<16;k++){
    const a=k/16*TAU,local=[Math.cos(a)*r,Math.sin(a)*r],q=af.p(local[0],0,local[1]);
    const w=30+(k%3)*2,d=29+((k+1)%3)*2,P=makePoly(q[0],q[2],w+3,d+3,af.rot);
    if(overlap(P,academyKeepout)){rejected.push({site:'academy',x:q[0],z:q[2],w,d,reason:'academy-campus-reserve'});continue;}
    acad.push([q[0]-1350,q[2]+330,[w,d],af.rot]);
  }
  const acadCount=attemptSite('academy', [1350,-330], acad,4);
  const mesh=g.mesh(MAT.city);if(mesh){mesh.name='rome_scenic_courtyard_estates';W.scene.add(mesh);}
  // Emit the Greek columns together with the city's other pending column instances.
  flushColumns(W);
  W.scenicEstates=placed;
  W.scenicEstateLog={placed:placed.map(p=>({site:p.site,x:+p.x.toFixed(1),z:+p.z.toFixed(1),w:p.w,d:p.d,
      relief:p.groundRelief,deckExposure:p.deckExposure,deckY:p.deckY,lowestEaveY:p.lowestEaveY,courtEaveClearance:p.courtEaveClearance,polygons:p.polygons})),rejected,
    targets:{aventine:4,academy:4},counts:{aventine:aveCount,academy:acadCount}};
  return placed.length;
}

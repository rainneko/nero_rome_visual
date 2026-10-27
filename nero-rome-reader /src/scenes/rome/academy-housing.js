/* Esquiline senatorial street groups. Call after academy/fixed Foot is registered. */
function buildAcademyHousing(W){
  const g=new GB(1<<18),homes=[],placed=[];
  const cx=1350,cz=-330,streetRot=-30*DEG,cs=Math.cos(streetRot),sn=Math.sin(streetRot),R=RNG(135056);
  const world=(u,v)=>[cx+u*cs+v*sn,cz-u*sn+v*cs];
  const rect=(u,v,w,d,rot)=>{const [x,z]=world(u,v),a=streetRot+rot;return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([p,q])=>[x+p*Math.cos(a)+q*Math.sin(a),z-p*Math.sin(a)+q*Math.cos(a)]);};
  const overlap=(A,B)=>{
    for(const P of[A,B])for(let i=0;i<P.length;i++){
      const a=P[i],b=P[(i+1)%P.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l;
      const x=A.map(p=>p[0]*nx+p[1]*nz),y=B.map(p=>p[0]*nx+p[1]*nz);
      if(Math.max(...x)<Math.min(...y)-.01||Math.max(...y)<Math.min(...x)-.01)return false;
    }
    return true;
  };
  const AF=W.AF||frame(1350,0,-330,Math.PI-200*DEG);
  const campus=[[-32,-50],[32,-50],[32,50],[-32,50]].map(([x,z])=>{const q=AF.p(x,0,z);return[q[0],q[2]];});
  const outsideCampus=P=>!overlap(P,campus);
  const free=(P,pad=2)=>{const b=lotOBB(P);return !W.foot.hits(b.cx,b.cz,b.hw+pad,b.hd+pad,b.rot);};
  const seenFree=P=>placed.every(Q=>!overlap(P,Q));
  const localRoad=(a,b,width=4)=>{
    const A=world(...a),B=world(...b),dx=B[0]-A[0],dz=B[1]-A[1],len=Math.hypot(dx,dz),rot=Math.atan2(-dz,dx),mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2;
    if(W.foot.hits(mx,mz,len/2,width/2,rot,0,'road'))return false;   // a lane may cross other roads, not buildings
    W.foot.add(mx,mz,len/2,width/2,rot,'road');
    const nx=-dz/len,nz=dx/len,P=[[A[0]+nx*width/2,A[1]+nz*width/2],[B[0]+nx*width/2,B[1]+nz*width/2],[B[0]-nx*width/2,B[1]-nz*width/2],[A[0]-nx*width/2,A[1]-nz*width/2]];
    g.set(10,.38);g.poly(P.map(p=>[p[0],W.gy(p[0],p[1])+.13,p[1]]),[0,1,0]);return true;
  };
  // A connected orthogonal street grid in the existing -30 degree urban alignment.
  // Cross streets frame three compact groups; candidates sit inside the resulting blocks.
  for(const u of[-185,0,185])localRoad([u,-210],[u,210],5.2);
  for(const v of[-210,0,210])for(const [a,b] of[[-182.4,-2.6],[2.6,182.4]])localRoad([a,v],[b,v],5.2);

  const addProcedural=(u,v,w,d,role,index)=>{
    const P=rect(u,v,w,d,0);if(!outsideCampus(P)||!free(P,2)||!seenFree(P))return false;
    const ground=houseGround(W,P,1.5);if(!ground||ground.max-ground.min>1.5)return false;
    const rec=nobleCourtHouse(W,g,P,R,`academy:${role}:${index}`);if(!rec)return false;
    const b=lotOBB(P),f=W.foot.add(b.cx,b.cz,b.hw,b.hd,b.rot);f.poly=P;f.academyHome=true;
    Object.assign(rec,{type:'existing-new-dense',role:'existing-new-dense',form:role,w,d,groundRelief:ground.max-ground.min});homes.push(rec);
    placed.push(rect(u,v,w+4,d+4,0));return true;
  };
  const addLux=(u,v,model,index)=>{
    const plot=rect(u,v,30,30,0),b=lotOBB(plot);if(!outsideCampus(plot)||!free(plot,2)||!seenFree(plot))return false;
    const ground=houseGround(W,plot,1.5);if(!ground||ground.max-ground.min>1)return false;
    const rec=nobleDetailHouse(W,g,plot,R,`academy:old-lux:${index}`,index);if(!rec)return false;
    // nobleDetailHouse deterministically chooses a four-storey row/corner GLB by index.
    if(rec.asset!==model)return false;
    const f=W.foot.add(b.cx,b.cz,15,15,b.rot);f.poly=plot;f.academyHome=true;
    Object.assign(rec,{type:'four-storey-glb-luxury-house',role:'four-storey-glb-luxury-house',form:model,w:30,d:30,groundRelief:ground.max-ground.min});homes.push(rec);
    placed.push(rect(u,v,34,34,0));return true;
  };

  // Four substantial courtyard houses, in two paired street blocks.
  for(const [i,[u,v]] of[[-238,-52],[-238,52],[238,-52],[238,52]].entries())
    addProcedural(u,v,32,28,'new-dense-courtyard',i);
  // Two existing four-storey tiled houses, each on a 30 x 30 m plot with a 2 m clear rim.
  addLux(-285,112,'rome_lux_corner4',0);
  addLux(285,112,'rome_lux_row4',1);
  // Smaller three/four-storey compounds complete the grouped blocks without filling the lanes.
  for(const [i,[u,v]] of[[280,150],[-280,150],[225,170],[-225,170],[280,-150],[-280,-150],[225,-170],[-225,-170]].entries())
    addProcedural(u,v,14+R()*1.8,14+R()*1.8,'new-dense-house',i);

  // Medium old-style court houses extend into nearby residential blocks while
  // leaving the rotated academy core and its annex/glasshouse reserve unobstructed.
  let mediumCourts=0;
  for(const [i,[u,v]] of[[125,0],[-125,0],[0,125],[0,-125],[155,50],[-155,50],[50,-155],[-50,155]].entries()){
    if(mediumCourts>=4)break;
    const P=rect(u,v,30,28,0);if(!outsideCampus(P)||!free(P,2)||!seenFree(P))continue;
    const ground=houseGround(W,P,1.5);if(!ground||ground.max-ground.min>1.5)continue;
    const rec=nobleCourtHouse(W,g,P,R,`academy:medium-court:${i}`);if(!rec)continue;
    const b=lotOBB(P),f=W.foot.add(b.cx,b.cz,b.hw,b.hd,b.rot);f.poly=P;f.academyHome=true;
    Object.assign(rec,{type:'old-medium-courtyard-house',role:'old-medium-courtyard-house',form:'medium-courtyard',w:30,d:28,groundRelief:ground.max-ground.min});
    homes.push(rec);placed.push(rect(u,v,34,32,0));mediumCourts++;
  }

  const mesh=layTag(g.mesh(MAT.city),'houses');if(mesh){mesh.name='academy_senatorial_street_groups';W.scene.add(mesh);}
  // Flush shared courtyard columns once after all houses have been emitted.
  flushColumns(W);
  W.academyHomes=homes;
  W.academyHousingLog={placed:homes.map(h=>({x:h.x,z:h.z,role:h.role,form:h.form})),count:homes.length,mediumCourts};
  return homes.length;
}

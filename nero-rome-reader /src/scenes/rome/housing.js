/* Residential repair is local to the built-up centre. The original density map and
   suburban falloff remain authoritative outside this boundary. */
function housingCore(x,z){return x>-430&&x<1250&&z>-1020&&z<780&&Math.hypot(x-250,(z+70)*.95)<1230&&romeHorti(x,z)<.35&&polyDist(x,z,TIBER)[0]>RTW+15;}
function housingFree(W,P){if(typeof residentialSiteAllowed==='function'&&!residentialSiteAllowed(W,P))return false;const b=lotOBB(P),cs=W.foot.cell,rad=Math.hypot(b.hw,b.hd),seen=new Set();
  for(let i=Math.floor((b.cx-rad)/cs);i<=Math.floor((b.cx+rad)/cs);i++)for(let j=Math.floor((b.cz-rad)/cs);j<=Math.floor((b.cz+rad)/cs);j++){
    for(const f of W.foot.map.get(W.foot.key(i,j))||[]){if(seen.has(f)||f.preAurea)continue;seen.add(f);if(nobleOverlap(P,f))return false;}}
  return true;
}
function fillCentralHousing(W){const R=RNG(641024),g=new GB(1<<18),late=new GB(1<<16),stats={total:0,noble:0,early:0,sloped:0,byPass:[],floors:{},bounds:[-430,-1020,1250,780]},records=[],rot=-30*DEG,c=Math.cos(rot),s=Math.sin(rot);
  const world=(u,v)=>[u*c+v*s,-u*s+v*c],deferred=W.foot.list.filter(f=>f.preAurea);
  // The noble generator already owns these lane centre lines. Reserve the actual lanes
  // before repairing rejected boundary parcels so the fallback cannot seal a through route.
  for(const r of W.nobleRoads||[]){const C=lp(r.a,r.b,.5);if(nobleQuarterAt(...C)!=='core')continue;const dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],l=Math.hypot(dx,dz);W.foot.add(C[0],C[1],l/2,r.width/2,Math.atan2(-dz,dx),'road');}
  for(const[step,w,d]of[[23,19,16],[15,12,10],[10,8.4,8.2]]){let added=0;
    for(let u=-850;u<1780;u+=step)for(let v=-1400;v<1400;v+=step){const[x,z]=world(u+(hash2(u,v)-.5)*1.4,v+(hash2(v,u)-.5)*1.4);if(!housingCore(x,z))continue;
      const D=dCity(x,z);if(D<.36)continue; // Never turn low-density outskirts into a city grid.
      if(palFilled(x,z))continue;
      // Keep small public lanes through each repaired patch; old major roads are Foot obstacles.
      const near=k=>Math.min(((k%52)+52)%52,52-((k%52)+52)%52);if(near(u)<w/2+1.1||near(v+11)<d/2+1.1)continue;
      const F=frame(x,0,z,rot),P=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>{const p=F.p(q[0],0,q[1]);return[p[0],p[2]];});
      if(P.some(p=>!housingCore(...p))||!housingFree(W,P))continue;
      const ground=houseGround(W,P);if(!ground||ground.max-ground.min>6)continue;
      const elite=nobleQuarterAt(x,z)==='core',early=Math.hypot(x-572,z-200)<155||deferred.some(f=>nobleOverlap(P,f));
      const G=early?late:g;let rec;
      if(elite&&!early&&pArea(P)>260){rec=nobleCourtHouse(W,G,P,R,'repair');if(!rec)continue;rec.meshTag='central_housing_repairs';W.nobleParcels.push(rec);W.nobleProcedural.push(rec);stats.noble++;}
      else{const ns=elite?(R()<.82?3:4):3+Math.floor(R()*3),seed=R(),profile={part:elite?0:R()<.28?9:0,seed,sty:elite?0:3+(R()<.4?8:0),fl:(elite?262144:0)|2|16,nSt:ns,gH:3.8,sH:2.9,pitch:20*DEG,lit:.7,flat:false,noSplit:true,noDecor:early,awn:early?0:.08,balc:early?0:.08};
        if(!lotBuild(W,G,P,profile,R,null))continue;rec={polygon:P,x,z,y:ground.min+.15,groundMin:ground.min,groundMax:ground.max,storeys:ns};}
      const ob=lotOBB(P),f=W.foot.add(ob.cx,ob.cz,ob.hw+.25,ob.hd+.25,ob.rot);f.poly=P;rec.early=early;records.push(rec);stats.total++;added++;if(early)stats.early++;if(ground.max-ground.min>1)stats.sloped++;stats.floors[rec.storeys]=(stats.floors[rec.storeys]||0)+1;
    }stats.byPass.push({size:[w,d],added});}
  const mesh=g.mesh(MAT.city);if(mesh){mesh.name='central_housing_repairs';W.scene.add(mesh);}const m=late.mesh(MAT.city);
  if(m){const G=new THREE.Group();G.name='preAureaHomes';G.userData.rise=0;G.visible=false;G.add(m);W.scene.add(G);(W.preLayers||(W.preLayers={})).preAureaHomes=G;}
  W.housingGapStats=stats;W.housingGapHomes=records;
}

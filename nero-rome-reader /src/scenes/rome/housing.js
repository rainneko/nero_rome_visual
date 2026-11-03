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
    for(let u=-850;u<1780;u+=step)for(let v=-1400;v<1400;v+=step){const R=RNG(hash2(u*31+step,v*17+977)*4294967296);   // dice keyed to the candidate: a change elsewhere does not reshuffle this house
      const[x,z]=world(u+(hash2(u,v)-.5)*1.4,v+(hash2(v,u)-.5)*1.4);if(!housingCore(x,z))continue;
      const D=dCity(x,z);if(D<.36)continue; // Never turn low-density outskirts into a city grid.
      if(palFilled(x,z))continue;
      // Keep small public lanes through each repaired patch; old major roads are Foot obstacles.
      const near=k=>Math.min(((k%52)+52)%52,52-((k%52)+52)%52);if(near(u)<w/2+1.1||near(v+11)<d/2+1.1)continue;
      const F=frame(x,0,z,rot),P=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>{const p=F.p(q[0],0,q[1]);return[p[0],p[2]];});
      if(P.some(p=>!housingCore(...p))||!housingFree(W,P))continue;
      const ground=houseGround(W,P);if(!ground||ground.max-ground.min>6)continue;
      const elite=nobleQuarterAt(x,z)==='core',early=Math.hypot(x-572,z-200)<155||AUREA_SITE(x,z)||deferred.some(f=>nobleOverlap(P,f));
      const G=early||AUREA_GONE(x,z)?late:g;let rec;   // (the houses by the vestibule and the Via Sacra keep their look but go with the fire too)
      if(elite&&!early&&pArea(P)>260){rec=nobleCourtHouse(W,G,P,R,'repair');if(!rec)continue;rec.meshTag='central_housing_repairs';W.nobleParcels.push(rec);W.nobleProcedural.push(rec);stats.noble++;}
      else{const ns=elite?(R()<.82?3:4):3+Math.floor(R()*3),seed=R(),profile={part:elite?0:R()<.28?9:0,seed,sty:elite?0:3+(R()<.4?8:0),fl:(elite?262144:0)|2|16,nSt:ns,gH:3.8,sH:2.9,pitch:20*DEG,lit:.7,flat:false,noSplit:true,noDecor:early,awn:early?0:.08,balc:early?0:.08};
        if(!lotBuild(W,G,P,profile,R,null))continue;rec={polygon:P,x,z,y:ground.min+.15,groundMin:ground.min,groundMax:ground.max,storeys:ns};}
      const ob=lotOBB(P),f=W.foot.add(ob.cx,ob.cz,ob.hw+.25,ob.hd+.25,ob.rot);f.poly=P;rec.early=early;records.push(rec);stats.total++;added++;if(early)stats.early++;if(ground.max-ground.min>1)stats.sloped++;stats.floors[rec.storeys]=(stats.floors[rec.storeys]||0)+1;
    }stats.byPass.push({size:[w,d],added});}
  const mesh=layTag(g.mesh(MAT.city),'houses');if(mesh){mesh.name='central_housing_repairs';W.scene.add(mesh);}const m=layTag(late.mesh(MAT.city),'houses');
  if(m){const G=new THREE.Group();G.name='preAureaHomes';G.userData.rise=0;G.visible=false;G.add(m);W.scene.add(G);(W.preLayers||(W.preLayers={})).preAureaHomes=G;}
  W.housingGapStats=stats;W.housingGapHomes=records;
}
// Shop houses along the main roads in the centre (the author, 2026-11-03: a main road runs between two rows of houses with shops on the ground floor).
// genBlocks lines the roads that cut its blocks (faceFrontage); here, before genCity and the repair grid fill the centre with houses turned to the city
// grid, each main road is walked on both sides and lined with lots whose front (L[0]->L[1], the shop bays) faces it, beyond the road's corridor and the
// eaves (w/2+3.6 from the centre line). A lot that hits something steps back 0.8-3.8 m or gets shallower (on a hillside too); one that still does not fit is
// left out (crossings, monuments, the noble houses' parcels). On the ground the fire and the Golden House take they go with the old streets (preLayer
// 'aureaSite', states 0-6). Widths and dice are keyed to the place.
function fillRoadFrontage(W){const g=new GB(1<<17),gl=new GB(1<<15),st={tried:0,built:0,roads:0,zone:0,hit:0,free:0,row:0,slope:0,fail:0};
  const zone=p=>housingCore(...p)&&dCity(...p)>=.36&&!palFilled(...p);
  const hits=(L,m,pick)=>{const F=W.foot,ob=lotOBB(L),r=Math.hypot(ob.hw,ob.hd)+m,cs=F.cell,P=pInset(L,-m)||L;   // lotHits, over the footprints pick() takes
    for(let i=Math.floor((ob.cx-r)/cs);i<=Math.floor((ob.cx+r)/cs);i++)for(let j=Math.floor((ob.cz-r)/cs);j<=Math.floor((ob.cz+r)/cs);j++)for(const f of F.map.get(F.key(i,j))||[]){
      if(!pick(f))continue;const dx=f.cx-ob.cx,dz=f.cz-ob.cz;if(dx*dx+dz*dz>(f.r+r)**2)continue;if(residentialOverlap(P,f.blkLot||f.poly||footBox(f)))return true;}return false;};
  for(const[w,pts]of W.roadList||[]){if(w<7)continue;const P=densify(pts,3),cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    const len=cum[cum.length-1],h=w/2+3.6;let i0=0;st.roads++;
    const at=s=>{while(i0>0&&cum[i0]>s)i0--;while(i0<P.length-2&&cum[i0+1]<s)i0++;return lp(P[i0],P[i0+1],Math.max(0,Math.min(1,(s-cum[i0])/((cum[i0+1]-cum[i0])||1))));};
    for(const sg of[1,-1]){const row=[];
      for(let s=4;s<len-8;){const A=at(s),lw=10+4*hash2(A[0]*.37+sg*3.1,A[1]*.29),B=at(Math.min(len,s+lw));s+=lw;if(!housingCore(...A))continue;
        const dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz);if(l<6)continue;const nx=-dz/l*sg,nz=dx/l*sg,D=12+3*hash2(A[1]*.41,A[0]*.23+sg);st.tried++;let got=null,why='zone';
        const R=RNG(hash2(Math.round(A[0]*2)+7717+sg,Math.round(A[1]*2)+311)*4294967296),profile={part:R()<.3?9:0,seed:R(),sty:3+(R()<.4?8:0),fl:2|16,nSt:3+Math.floor(R()*3),gH:3.9,sH:2.9,pitch:20*DEG,lit:.7,flat:false,noSplit:true,awn:.3,balc:.1};
        lot:for(const e of[0,.8,1.6,2.6,3.8])for(const d of[D,D*.75,D*.55]){const o0=h+e,o1=o0+d;let L=[[A[0]+nx*o0,A[1]+nz*o0],[B[0]+nx*o0,B[1]+nz*o0],[B[0]+nx*o1,B[1]+nz*o1],[A[0]+nx*o1,A[1]+nz*o1]];
          if(pArea(L)<0)L=[L[1],L[0],L[3],L[2]];if(!L.every(zone))break lot;
          if(hits(L,.6,f=>!f.preAurea)){why='hit';continue;}   // what the Golden House builds later (preAurea) is not there yet
          if(!housingFree(W,L)){why='free';continue;}
          if(row.slice(-2).some(([,Q])=>residentialOverlap(pInset(L,.5)||L,pInset(Q,.5)||Q))){why='row';continue;}   // the inside of a bend: the row's own lots fan in
          const gr=houseGround(W,L);if(!gr||gr.max-gr.min>6){why='slope';continue;}
          const c=pCen(L);if(lotBuild(W,AUREA_GONE(...c)||Math.hypot(c[0]-572,c[1]-200)<155||hits(L,0,f=>f.preAurea)?gl:g,L,profile,R,null)){got=L;break lot;}why='fail';}   // a lot the house will not fit (a steep side) tries the next
        if(!got){st[why]++;continue;}row.push([lotOBB(got),got]);st.built++;}
      for(const[ob,L]of row)W.foot.add(ob.cx,ob.cz,ob.hw+.25,ob.hd+.25,ob.rot).poly=L;}}   // after the row: its lots touch, wall to wall
  const m=layTag(g.mesh(MAT.city),'houses');if(m){m.name='road_frontage';W.scene.add(m);}const ml=layTag(gl.mesh(MAT.city),'houses');if(ml){ml.name='road_frontage_pre';preLayerGroup(W,'aureaSite').add(ml);}W.roadFrontStats=st;return st;}

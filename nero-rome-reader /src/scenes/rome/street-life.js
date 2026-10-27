/* Daily-life groups: optional furnishings admitted after the street mask exists.
   Compact groups are instanced, never inserted into main-road corridors or private courts. */
function lifePolygon(x,z,w,d,rot){const F=frame(x,0,z,rot);return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(p=>{const q=F.p(p[0],0,p[1]);return[q[0],q[2]];});}
function lifeInside(P,x,z){let inside=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function populateStreetLife(W){
  const S=W.street;if(!S)return;
  const records=[],rejected={},reject=why=>{rejected[why]=(rejected[why]||0)+1;return false;};
  const at=(x,z)=>{const i=Math.floor((x-S.x0)/S.cs),j=Math.floor((z-S.z0)/S.cs);return i>=0&&j>=0&&i<S.nx&&j<S.nz?j*S.nx+i:-1;};
  const groundFree=(x,z,mainRoad=false,square=false)=>{const k=at(x,z);return k>=0&&S.grd[k]>0&&(S.grd[k]<3||square)&&!S.solid[k]&&!S.court[k]&&!S.water[k]&&(!S.waterAt||!S.waterAt(x,z))&&(mainRoad||!S.road[k]);};
  const sample=(F,w,d,fn)=>{const nx=Math.ceil(w),nz=Math.ceil(d);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const q=F.p(-w/2+w*i/nx,0,-d/2+d*j/nz);if(!fn(q[0],q[2]))return false;}return true;};
  // the market squares are paved and registered as road footprints; stalls may stand on them, but on nothing else
  const footHit=(x,z,hw,hd,rot,square)=>{const q={cx:x,cz:z,hw,hd,c:Math.cos(rot),s:Math.sin(rot),r:Math.hypot(hw,hd)},cs=W.foot.cell;
    for(let i=Math.floor((x-q.r)/cs);i<=Math.floor((x+q.r)/cs);i++)for(let j=Math.floor((z-q.r)/cs);j<=Math.floor((z+q.r)/cs);j++)for(const o of W.foot.map.get(W.foot.key(i,j))||[]){if(square&&o.marketSquare)continue;if(Math.hypot(o.cx-x,o.cz-z)<=o.r+q.r&&obb(o,q))return true;}return false;};
  const placeStreet=(name,x,z,rot,w,d,site,square,gap)=>{
    if(footHit(x,z,w/2+.45,d/2+.45,rot,square))return reject('footprint');
    const F=frame(x,0,z,rot),P=lifePolygon(x,z,w,d,rot);
    if(!sample(F,w,d,(px,pz)=>groundFree(px,pz,square,square)))return reject('mask');   // paved squares are marked as road cells in the street mask
    const G=houseGround(W,P,1);if(!G||G.max-G.min>(square?.5:.18))return reject('slope');   // a paved market square on the river bank keeps a gentle fall; the stall's uphill feet sink into it
    // Keep the entire module outside the authored road width, plus a pedestrian margin.
    if(!sample(F,w,d,(px,pz)=>!W.roadList.some(([width,path])=>polyDist(px,pz,path)[0]<width/2+1.5)))return reject('road-margin');
    // A clear 1.5 m public approach in front; it may connect to the existing street.
    for(let u=-w/2;u<=w/2;u+=.8)for(const v of[d/2+.4,d/2+1.5]){const q=F.p(u,0,v);if(!groundFree(q[0],q[2],true,square))return reject('front-access');}
    if(ROME.GLB.some(p=>p.o&&p.o.inst&&Math.hypot(x-p.x,z-p.z)<6))return reject('existing-prop');
    if(records.some(p=>Math.hypot(x-p.x,z-p.z)<(p.site===site&&p.n===name?gap:24)))return reject('spacing');
    const y=G.min+.06;
    romePlace(name,x,y,z,rot,{inst:1});
    W.foot.add(x,z,w/2+.3,d/2+.3,rot,'life-furnishing').siteRole='daily-life';
    records.push({n:name,x,z,y,rot,w,d,polygon:P,site,square:!!square,role:'street-commerce',groundMin:G.min,groundMax:G.max,relief:G.max-G.min});return true;
  };
  // Where trade and baking belonged in Nero's Rome (the project's reading of the city, not excavated plans). Markets: the cattle market by the river
  // and the vegetable market below the Capitol (paved squares), the Velabrum food street between them, the Argiletum/Subura shopping street,
  // the door of Livia's provision market, the river port. Bakeries sit by their grain (port granaries, Velabrum) and among the tenements they feed
  // (Subura, the foot of the Aventine). None in the senatorial Carinae courts or on the marble ceremonial squares.
  // [site, centre x, z, radius, kind, how many, market square (paved, may be stood on)]
  const sites=[['forum-boarium',-440,225,70,'market',2,true],['forum-holitorium',-418,160,45,'market',1,true],['velabrum',-250,215,95,'market',1,false],
    ['argiletum-subura',420,-380,150,'market',2,false],['macellum-liviae',1240,-560,95,'market',1,false],['emporium',-850,1300,170,'market',1,false],
    ['emporium-granaries',-800,1240,190,'bakery',1,false],['velabrum',-250,215,120,'bakery',1,false],['subura',620,-560,180,'bakery',1,false],['aventine-foot',-600,790,150,'bakery',1,false]];
  const shortfall=[];
  for(const[site,cx,cz,radius,kind,want,square]of sites){
    const name=kind==='bakery'?'rome_bakery_bay':'rome_market_pair',w=kind==='bakery'?6:6.4,d=kind==='bakery'?5.4:3.8,candidates=[];
    for(let z=cz-radius;z<=cz+radius;z+=5)for(let x=cx-radius;x<=cx+radius;x+=5){const dd=Math.hypot(x-cx,z-cz);if(dd>radius||!groundFree(x,z,square,square))continue;const k=at(x,z),distance=S.dist[k]*S.cs;if(distance<2.4||distance>(square?24:9.5))continue;
      const i=k%S.nx,j=Math.floor(k/S.nx);if(i<1||j<1||i>=S.nx-1||j>=S.nz-1)continue;
      const gx=S.dist[k+1]-S.dist[k-1],gz=S.dist[k+S.nx]-S.dist[k-S.nx];
      const rot=Math.hypot(gx,gz)>.2?Math.atan2(gx,gz):0;   // back to the nearest wall, counter to the street
      candidates.push({x,z,rot,score:dd+Math.abs(distance-(square?6:4))*3});}
    candidates.sort((a,b)=>a.score-b.score);let got=0;
    for(const c of candidates){if(got>=want)break;if(placeStreet(name,c.x,c.z,c.rot,w,d,site,square,square?11:16))got++;}
    if(got<want)shortfall.push({site,kind,want,got});
  }
  // Garden furnishings belong to an already validated, supported private courtyard.
  // They must fit wholly inside its inner polygon, away from the central fountain and cross paths.
  for(const E of[...(W.scenicEstates||[])].sort((a,b)=>(a.site==='aventine'?0:1)-(b.site==='aventine'?0:1))){   // the senatorial courts of the Aventine first
    if(records.filter(p=>p.role==='garden-rest').length>=4)break;
    const slot=E.restSlot;if(!slot)continue;
    const{w,d,scale}=slot,F=frame(E.x,E.deckY,E.z,E.rot),q=[slot.x,slot.y,slot.z],P=lifePolygon(q[0],q[2],w,d,E.rot),C=frame(q[0],q[1],q[2],E.rot);
    if(!P.every(p=>lifeInside(E.courtPolygon,p[0],p[1])))continue;
    const local=(x,z)=>{const dx=x-C.ox,dz=z-C.oz;return[C.c*dx-C.s*dz,C.s*dx+C.c*dz];};
    if(E.peristyleColumns.some(c=>{const[u,v]=local(c.x,c.z);return Math.abs(u)<w/2+c.clearance&&Math.abs(v)<d/2+c.clearance;}))continue;
    const pool=E.fountainPlan,[pu,pv]=local(pool.x,pool.z);if(Math.abs(pu)<w/2+pool.hx+.4&&Math.abs(pv)<d/2+pool.hz+.4)continue;
    let treesMoved=0;
    for(const t of W.trees){if(!lifeInside(P,t[0],t[2]))continue;const tp=F.p(-E.court[0]*.31,0,-E.court[1]*.15-treesMoved*.8);t[0]=tp[0];t[1]=E.deckY+.11;t[2]=tp[2];treesMoved++;}
    romePlace('rome_garden_exedra',q[0],q[1],q[2],E.rot,{inst:1,sx:scale,sy:scale,sz:scale});
    records.push({n:'rome_garden_exedra',x:q[0],z:q[2],y:q[1],rot:E.rot,w,d,scale,polygon:P,site:E.site,role:'garden-rest',estateIndex:E.index,treesMoved});
  }
  W.streetLife={placements:records,rejected,shortfall,limits:{markets:8,bakeries:4,gardens:4},counts:{markets:records.filter(p=>p.n==='rome_market_pair').length,bakeries:records.filter(p=>p.n==='rome_bakery_bay').length,gardens:records.filter(p=>p.n==='rome_garden_exedra').length}};
  console.log('street life',JSON.stringify(W.streetLife.counts));
}
function streetLifeViews(W){
  const records=W.streetLife?.placements||[];
  // Review cameras also make the selected examples easy to revisit from the normal view menu.
  for(const[n,key,title]of[['rome_market_pair','lifeMarket','街边市集'],['rome_bakery_bay','lifeBakery','烘焙作坊'],['rome_garden_exedra','lifeGarden','庭院休憩角']]){
    const p=records.find(p=>p.n===n);if(!p)continue;const F=frame(p.x,p.y,p.z,p.rot),offset=n==='rome_garden_exedra'?[0,12,5]:n==='rome_market_pair'?[0,20,4]:[0,17,9],a=F.p(...offset),b=F.p(0,1.1,0);W.views[key]={n:title,pos:a,tgt:b};}
}

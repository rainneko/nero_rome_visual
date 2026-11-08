/* Daily-life groups: optional furnishings admitted after the street mask exists.
   Compact groups are instanced, never inserted into main-road corridors or private courts. */
function lifePolygon(x,z,w,d,rot){const F=frame(x,0,z,rot);return[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(p=>{const q=F.p(p[0],0,p[1]);return[q[0],q[2]];});}
function lifeInside(P,x,z){let inside=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
// Where trade and baking belonged in Nero's Rome (the project's reading of the city, not excavated plans). Markets: the cattle market by the river
// and the vegetable market below the Capitol (paved squares), the Velabrum food street between them, the Argiletum/Subura shopping street,
// the door of Livia's provision market, the river port. Bakeries sit by their grain (port granaries, Velabrum) and among the tenements they feed
// (Subura, the foot of the Aventine). None in the senatorial Carinae courts or on the marble ceremonial squares.
// [site, centre x, z, radius, kind, how many, market square (paved, may be stood on)]. ?city=v2 leaves a plot open for each one off a square
// (cityParcels o.life, W.lifePlots): its streets are too narrow for a stall or a bakery bay
const LIFE_SITES=[['forum-boarium',-440,225,70,'market',2,true],['forum-holitorium',-418,160,45,'market',1,true],['velabrum',-250,215,95,'market',1,false],
  ['argiletum-subura',420,-380,150,'market',2,false],['macellum-liviae',1240,-560,95,'market',1,false],['emporium',-850,1300,170,'market',1,false],
  ['emporium-granaries',-800,1240,190,'bakery',1,false],['velabrum',-250,215,120,'bakery',1,false],['subura',620,-560,180,'bakery',1,false],['aventine-foot',-600,790,150,'bakery',1,false]];
function populateStreetLife(W){
  const S=W.street;if(!S)return;
  const records=[],rejected={},reject=why=>{rejected[why]=(rejected[why]||0)+1;return false;};
  const at=(x,z)=>{const i=Math.floor((x-S.x0)/S.cs),j=Math.floor((z-S.z0)/S.cs);return i>=0&&j>=0&&i<S.nx&&j<S.nz?j*S.nx+i:-1;};
  const groundFree=(x,z,mainRoad=false,square=false)=>{const k=at(x,z);return k>=0&&S.grd[k]>0&&(S.grd[k]<3||square)&&!S.solid[k]&&!S.court[k]&&!S.water[k]&&(!S.waterAt||!S.waterAt(x,z))&&(mainRoad||!S.road[k]);};
  const sample=(F,w,d,fn)=>{const nx=Math.ceil(w),nz=Math.ceil(d);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const q=F.p(-w/2+w*i/nx,0,-d/2+d*j/nz);if(!fn(q[0],q[2]))return false;}return true;};
  // the market squares are paved and registered as road footprints; stalls may stand on them, but on nothing else
  const footHit=(x,z,hw,hd,rot,square)=>{const q={cx:x,cz:z,hw,hd,c:Math.cos(rot),s:Math.sin(rot),r:Math.hypot(hw,hd)},cs=W.foot.cell;
    for(let i=Math.floor((x-q.r)/cs);i<=Math.floor((x+q.r)/cs);i++)for(let j=Math.floor((z-q.r)/cs);j<=Math.floor((z+q.r)/cs);j++)for(const o of W.foot.map.get(W.foot.key(i,j))||[]){if(square&&o.marketSquare)continue;if(Math.hypot(o.cx-x,o.cz-z)<=o.r+q.r&&obb(o,q)){if(o.poly&&(o.v2||W.parcels)&&!residentialOverlap(lifePolygon(x,z,2*hw,2*hd,rot),o.poly))continue;return true;}}return false;};   // ?city=v2: a footprint with an outline (v2's houses, courts) by that outline, its box may reach well past it; the old city keeps the boxes
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
  const shortfall=[];
  for(const[site,cx,cz,radius,kind,want,square]of LIFE_SITES){
    const name=kind==='bakery'?'rome_bakery_bay':'rome_market_pair',w=kind==='bakery'?6:6.4,d=kind==='bakery'?5.4:3.8,candidates=[];
    for(const q of W.lifePlots||[])if(q.site===site&&q.kind===kind)candidates.push({x:q.x,z:q.z,rot:q.rot,score:-1e9});   // ?city=v2: the plots cityParcels left open for them
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
/* Flowers along the wide avenues (the author, 2026-11-02). 【史】Rome had no municipal flower beds that we know of: a street's flowers were the tenants' own,
   pots by the door and window gardens (Pliny NH 19.59). So along the main roads 9 m and wider inside the city, every 14-26 m (keyed to place): where a house
   front stands within 4 m of the kerb, two or three terracotta pots of flowering shrubs 0.7 m before it (season profile 4, the tenants' pots); where the
   margin is wide and open, a travertine trough of them just beyond the kerb (a reconstruction; profile 2). Not on fields, stairs, slopes, water or crossings,
   not by a stall, not in the fire zone (o.skip). */
function avenueFlowers(W,o){const S=W.street;if(!S)return;const g=new GB(1<<14),spots=[],rej={},no=k=>{rej[k]=(rej[k]||0)+1;};
  const at=(x,z)=>{const i=Math.floor((x-S.x0)/S.cs),j=Math.floor((z-S.z0)/S.cs);return i>=0&&j>=0&&i<S.nx&&j<S.nz?j*S.nx+i:-1;};
  for(const[w,pts]of W.roadList){if(w<9)continue;const dense=densify(pts,2);let acc=0,next=6;
    for(let i=1;i<dense.length;i++){const a=dense[i-1],b=dense[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(!l)continue;acc+=l;if(acc<next)continue;
      const h=hash2(b[0]*.13,b[1]*.17);next=acc+14+h*12;const ux=dx/l,uz=dz/l,rot=Math.atan2(-dz,dx);
      for(const sd of[-1,1]){if(hash2(b[0]*.31+sd,b[1]*.29)<.3)continue;const P=off=>[b[0]-uz*off*sd,b[1]+ux*off*sd];
        if(o.urban(...P(w/2+3))<.55||(o.skip&&o.skip(...P(w/2+3)))){no('outside');continue;}
        let f=0;for(let off=w/2+1.4;off<=w/2+4;off+=.5){const q=P(off);if(W.foot.hits(q[0],q[1],.25,.25,0,0,'road')){f=off;break;}}
        const pots=!!f,[x,z]=P(pots?f-.7:w/2+1.3),k=at(x,z);
        if(k<0||S.solid[k]||S.water[k]||S.court[k]||S.veg[k]||(S.openLand&&S.openLand[k])||(S.stair&&S.stair[k])||(S.waterAt&&S.waterAt(x,z))){no('mask');continue;}
        if(W.foot.hits(x,z,1.5,.4,rot,0,'road')){no('foot');continue;}   // clear of the front and of anything set before it
        if(W.roadList.some(([w2,p2])=>p2!==pts&&polyDist(x,z,p2)[0]<w2/2+4)){no('crossing');continue;}
        const y0=W.gy(x,z);if(Math.abs(W.gy(x+1.6*ux,z+1.6*uz)-W.gy(x-1.6*ux,z-1.6*uz))>.35){no('slope');continue;}
        if(ROME.GLB.some(p=>p.o&&p.o.inst&&Math.abs(p.x-x)<4&&Math.abs(p.z-z)<4)){no('prop');continue;}
        const F=frame(x,y0,z,rot),m=h>.6?3:2;
        if(pots)for(let j=0;j<m;j++){const u=(j-(m-1)/2)*1.05,sc=.8+.3*hash2(x+j,z),q=F.p(u,0,0);g.set(25,.3+.4*hash2(x,z+j));lathe(g,F,u,-.05,0,[[.24*sc,0],[.34*sc,.5*sc],[.39*sc,.56*sc]],9);
          W.trees.push([q[0],y0+.5*sc,q[2],hash2(x*.7+j,z*.3)<.75?'flower':'shrub',.42*sc,null,4]);}
        else{g.set(2,.45);box(g,F,0,-.1,0,1.3,.62,.42,31);g.set(2,.55);box(g,F,0,.52,0,1.36,.06,.48,31);   // a travertine trough with a moulded lip
          for(let j=0;j<3;j++){const q=F.p(-.85+j*.85,0,0);W.trees.push([q[0],y0+.62,q[2],j===1&&h<.5?'shrub':'flower',.48,null,2]);}}
        spots.push([x,y0,z,rot,w,pots?1:0]);}}}
  const m=g.mesh(MAT.city);if(m)W.scene.add(layTag(m,'roadDetail'));W.avenueFlowers=spots;console.log('avenue flowers',spots.length,JSON.stringify(rej));}
/* The lanes behind the shop rows (the author, 2026-11-04, on the dark strip behind the row along the Vicus Patricius: stalls along the street, trees,
   small squares, fill the gaps). Called after streetKit and populateStreetLife. The rows that line the main roads (fillRoadFrontage, opened by
   finishRoadFrontage) are walked along their backs and fronts; every die is keyed to its place.
   - a small square where a passage through the row comes out on a wide stretch of the lane behind it (a 4.5-7 m disc clear of the walls): paved
     like the city's streets (stone written into the street raster), with a public basin or a crossroads shrine and a fig; at most one in 70 m and
     none within 45 m of another basin or shrine
   - trees where the back lane is 7 m wide or more, 2.5 m off the walls, one in 18-30 m, none in a passage mouth
   - against the back walls the workshops' things: counters and awnings (streetWallProp), amphorae, a cart, washing on a line
   - on the main road a third of the shops put out a counter or amphorae under the eaves (the front is w/2 + 3.6 m from the road's centre line, so
     a counter keeps more than a metre off the carriageway); none in a passage mouth
   【史】Pliny counts 265 crossroads shrines (compita) in the city (NH 3.66); Agrippa built 700 basins (lacus) (NH 36.121). Until Domitian's edict
   the shops had taken over the streets (Martial 7.61). */
const STREET_SHRINE={hw:1.3,back:.5,front:.6,gap:.05,feet:[[-1.25,.25],[1.25,.25]]};
function backLanes(W){const S=W.street,rows=W.frontRows||[];if(!S||!rows.length)return null;const t0=performance.now();
  const st={squares:0,basins:0,shrines:0,trees:0,back:0,front:0,rej:{}},no=k=>{st.rej[k]=(st.rej[k]||0)+1;return false;};
  const K=(x,z)=>{const i=Math.floor((x-S.x0)/S.cs),j=Math.floor((z-S.z0)/S.cs);return i>=0&&j>=0&&i<S.nx&&j<S.nz?j*S.nx+i:-1;};
  const open=(x,z)=>{const k=K(x,z);return k>=0&&S.st[k]===1&&!S.solid[k]&&!S.court[k]&&!S.water[k]&&!S.road[k];};
  const wid=(x,z)=>{const k=K(x,z);return k<0?0:S.wid[k];},wall=(x,z)=>{const k=K(x,z);return k<0?0:S.dist[k]*S.cs;};
  const key=(x,z,a)=>RNG(hash2(Math.round(x*2)+a*131,Math.round(z*2)+a*37+17)*4294967296);
  // what stands already (the street kit, the daily-life groups) on a 6 m hash; the passages; the basins and shrines
  const H=new Map(),hk=(i,j)=>i+','+j,addP=(x,z,r)=>{const k=hk(Math.floor(x/6),Math.floor(z/6));let a=H.get(k);if(!a)H.set(k,a=[]);a.push([x,z,r]);};
  for(const p of ROME.GLB)if(p.o&&p.o.inst)addP(p.x,p.z,1.6);
  const nearP=(x,z,d)=>{const i0=Math.floor(x/6),j0=Math.floor(z/6);for(let i=i0-1;i<=i0+1;i++)for(let j=j0-1;j<=j0+1;j++)for(const q of H.get(hk(i,j))||[])if(Math.hypot(q[0]-x,q[1]-z)<d+q[2])return true;return false;};
  const PS=W.passages||[],nearPass=(x,z,d)=>PS.some(p=>{const dx=x-p.x,dz=z-p.z;if(Math.abs(dx)>30||Math.abs(dz)>30)return false;return Math.abs(dx*p.ux+dz*p.uz)<p.w/2+d&&Math.abs(dx*p.nx+dz*p.nz)<p.len/2+d+1;});
  const basins=ROME.GLB.filter(p=>p.n==='rome_lacus'||p.n==='rome_compitum').map(p=>[p.x,p.z]),props=[],trees=[],squares=[];
  const put=(n,x,z,rot,opt)=>{const lk=AUREA_GONE(x,z)?'aureaSite':null;ROME.GLB.push({n,x,y:W.gy(x,z)+(opt&&opt.dy||0),z,r:rot,o:Object.assign({inst:1},lk?{parentLayer:lk}:null,opt)});addP(x,z,1.6);};
  const tree=(x,z,R)=>{const k=R();W.trees.push([x,W.gy(x,z),z,k<.55?'fig':k<.75?'pomegr':k<.9?'almond':'broadD',k<.55?.85+.3*R():.9+.3*R()]);trees.push([x,z]);addP(x,z,1.2);st.trees++;};
  const wallProp=(n,x,z,Kp,R,opt)=>{const a=streetWallProp(W,x,z,props,Kp,wid(x,z));if(!a)return no('wall');if(nearPass(a[0],a[1],Kp.hw*.6)||nearP(a[0],a[1],1.6))return no('near');
    put(n,a[0],a[1],a[2],Object.assign({dy:a[3]-W.gy(a[0],a[1])},opt));props.push(a);return true;};
  const TINT=[[.8,.74,.6],[.74,.5,.1],[.46,.12,.08],[.52,.34,.14],[.36,.17,.28]];   // undyed linen, saffron, madder, ochre, faded purple
  // 1. small squares where the passages come out behind the rows
  const T1=S.texture;let painted=false;
  for(const p of PS){const R=key(p.back[0],p.back[1],5);if(R()>.75){no('sqDice');continue;}let best=null;
    for(const r of[7,6,5,4.5]){for(const d of[r+.5,r+1.5,r+2.5]){const cx=p.back[0]+p.nx*d,cz=p.back[1]+p.nz*d;let ok=open(cx,cz);
        for(let a=0;ok&&a<16;a++){const t=a/16*TAU;if(!open(cx+Math.cos(t)*r,cz+Math.sin(t)*r)||!open(cx+Math.cos(t)*r*.5,cz+Math.sin(t)*r*.5))ok=false;}
        if(ok){best={cx,cz,r};break;}}if(best)break;}
    if(!best){no('sqRoom');continue;}const{cx,cz,r}=best;
    if(squares.some(q=>Math.hypot(q.x-cx,q.z-cz)<70)||basins.some(q=>Math.hypot(q[0]-cx,q[1]-cz)<45)){no('sqSpacing');continue;}
    const hs=[];for(let a=0;a<12;a++){const t=a/12*TAU;hs.push(W.gy(cx+Math.cos(t)*r,cz+Math.sin(t)*r));}if(Math.max(...hs)-Math.min(...hs)>1.6){no('sqSlope');continue;}
    // the ground: stone, as the street raster paints it (grade 2), no lane path
    const i0=Math.floor((cx-r-1-S.x0)/S.cs),i1=Math.floor((cx+r+1-S.x0)/S.cs),j0=Math.floor((cz-r-1-S.z0)/S.cs),j1=Math.floor((cz+r+1-S.z0)/S.cs);
    for(let j=Math.max(0,j0);j<=Math.min(S.nz-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(S.nx-1,i1);i++){const k=j*S.nx+i;if(!S.st[k]||S.solid[k]||S.road[k]||S.court[k])continue;
      if(Math.hypot(S.x0+(i+.5)*S.cs-cx,S.z0+(j+.5)*S.cs-cz)>r+.6)continue;S.grd[k]=2;T1[k*4+1]=128;T1[k*4+3]=0;painted=true;}
    // a basin in the middle, or a shrine on the row's back wall beside the passage (then a basin is not needed)
    const rot=Math.atan2(p.nx,p.nz),sd=R()<.5?1:-1;let kind=null;
    if(R()<.55){put('rome_lacus',cx,cz,rot+Math.PI/2);kind='lacus';st.basins++;}
    else{for(const s of[sd,-sd]){const x=p.back[0]+p.ux*s*(p.w/2+2)+p.nx*1.2,z=p.back[1]+p.uz*s*(p.w/2+2)+p.nz*1.2;if(wallProp('rome_compitum',x,z,STREET_SHRINE,R)){kind='compitum';st.shrines++;break;}}
      if(!kind){put('rome_lacus',cx,cz,rot+Math.PI/2);kind='lacus';st.basins++;}}
    basins.push([cx,cz]);
    {const a=rot+(sd>0?1:-1)*(1+R()*.6),x=cx+Math.sin(a)*(r-1.8),z=cz+Math.cos(a)*(r-1.8);if(open(x,z)&&wall(x,z)>=2&&!nearP(x,z,2.2))tree(x,z,R);}
    squares.push({x:cx,z:cz,r,kind,passage:PS.indexOf(p)});st.squares++;}
  if(painted)U.uSt.value.needsUpdate=true;
  // 2. and 3. along the back of each row: trees where the lane is wide, the workshops' things against the walls; 4. the shops' stalls on the road
  for(const Rw of rows){let next=-1e9;
    for(const r of Rw.lots){const ux=r.ux,uz=r.uz,sc=r.l/(r.s1-r.s0);
      r.pieces.forEach((pc,pi)=>{if(r.stood&&!r.stood[pi])return;const ta=(pc[0]-r.s0)*sc,tb=(pc[1]-r.s0)*sc,L=tb-ta,at=(t,o)=>[r.A[0]+ux*t+r.nx*o,r.A[1]+uz*t+r.nz*o];
        // trees, 3.2 m behind the back wall (the eaves take .55 m)
        for(let t=ta+1;t<tb-1;t+=2){const sAbs=pc[0]+(t-ta)/sc;if(sAbs<next)continue;const[x,z]=at(t,r.o1+3.2);
          if(!open(x,z)||wid(x,z)<7||wall(x,z)<2.5||nearPass(x,z,2.5)||nearP(x,z,2.5)||trees.some(q=>Math.hypot(q[0]-x,q[1]-z)<12))continue;
          const R=key(x,z,7);if(R()<.5){tree(x,z,R);next=sAbs+18+12*R();}else next=sAbs+6;}
        if(L<5)return;const m=(ta+tb)/2;
        // the back wall
        {const[wx,wz]=at(m,r.o1),R=key(wx,wz,9);if(R()<.42){const k=R(),[x,z]=at(m+(R()-.5)*(L-4),r.o1+1.6);
          if(!open(x,z)||wid(x,z)<4.5)no('backNarrow');
          else if(k<.28){if(wallProp('rome_counter',x,z,STREET_COUNTER,R))st.back++;}
          else if(k<.5){if(wallProp('rome_awning',x,z,STREET_AWNING,R,{tint:TINT[Math.floor(R()*TINT.length)]}))st.back++;}
          else{const[ax,az]=at(m+(R()-.5)*(L-3),r.o1+(k<.85?1.1:.35)),rot=Math.atan2(-r.nx,-r.nz);
            if(!open(ax,az)&&k<.85||nearPass(ax,az,1.4)||nearP(ax,az,1.8))no('backNear');
            else{if(k<.72)put('rome_amphorae',ax,az,rot+(R()-.5)*.5);else if(k<.85)put('rome_cart',ax,az,Math.atan2(ux,uz)+(R()-.5)*.6);else put('rome_laundry',ax,az,rot,{dy:4.4});st.back++;}}}}
        // the front, on the main road
        {const[fx,fz]=at(m,r.o0),R=key(fx,fz,13);if(R()<.33){const k=R(),[x,z]=at(m+(R()-.5)*(L-4),r.o0-1.4);
          if(k<.6){if(wallProp('rome_counter',x,z,STREET_COUNTER,R))st.front++;}
          else{const[ax,az]=at(m+(R()-.5)*(L-3),r.o0-.9);if(nearPass(ax,az,1.4)||nearP(ax,az,1.8))no('frontNear');else{put('rome_amphorae',ax,az,Math.atan2(r.nx,r.nz)+(R()-.5)*.5);st.front++;}}}}});}}
  st.ms=Math.round(performance.now()-t0);W.backLanes={squares,stats:st};console.log('back lanes',JSON.stringify(st));return st;}

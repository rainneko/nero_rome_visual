// Whole-city audit for briefs/rome/city-generation-spec.md section 8 (H1-H5, H8) and road-first-city.md section 9 (H12, H13). Needs `npm run build:test`.
// Usage: node tools/test/city-audit.mjs [--assert]   -> prints the counts, writes shots/city-audit.json; --assert fails on any H1-H3, H5 or H8 hit,
// H4 < 50 %, H12 >= 1 % or H13 >= 10 % (P2, fabric.js: street ends that meet their street outside 60-120°; only round the Y junction for now).
// Both quality tiers, side by side: the low tier (800 x 600: a coarser ground) and the desktop tier (1280 x 800). One network at every tier
// (road-first-city.md 4.3): --assert also fails when the road list (L1), the number of districts (L2) or the secondary streets and blocks (L3) differ.
// P3 (road-first-city.md 9, 10; parcels.js): a third page, the desktop tier with ?city=v2, measures the lots and houses v2 builds. --assert fails on any
// H10 (a built lot whose front faces no street, road, square or paved ground), H11 (a house on a secondary street or a main road, or two houses
// overlapping) or H14 (a house front more than 5° off the street it faces). Reported only: the houses in that area against the page without the flag
// (the brief's ±10 % is P4's).
// Open dist/city-audit.html?review (or dist/index.html?review served over http) for the layer panel and the generator lines (src/ui/review.js).
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import puppeteer from 'puppeteer';
const root=process.cwd(),strict=process.argv.includes('--assert');fs.mkdirSync('shots',{recursive:true});
const src=fs.readFileSync('dist/test.html','utf8');fs.writeFileSync('dist/city-audit.html',src.replace('window.__ready=true;loop();','window.__ready=true;if(REVIEW)loop();'));   // city-audit.html?review draws, with the review panel
const errors=[],browsers=[];
// the houses in the area ?city=v2 builds (parcels.js cityParcelsArea with monuments.js's W.v2Excl): lots, scattered houses, noble houses, warehouses, GLB insulae
const houseCount=()=>{const W=W0;if(!W.v2At&&typeof cityParcelsArea==='function'&&W.v2Excl)cityParcelsArea(W,{excl:W.v2Excl});if(!W.v2At)return null;const at=P=>W.v2At(...pCen(P));
  const o={lots:(W.lotLog||[]).filter(l=>at(l.L)).length,scatter:(W.residentialEnvelopes||[]).filter(e=>at(e.polygon)).length,noble:(W.nobleParcels||[]).filter(p=>at(p.polygon)).length,
    warehouses:(W.warehouseLog||[]).filter(w=>at(w.polygon)).length,glb:ROME.GLB.filter(g=>/insula/.test(g.n)&&W.v2At(g.x,g.z)).length};o.all=o.lots+o.scatter+o.noble+o.warehouses+o.glb;return o;};
// P3 on the ?city=v2 page: H10, H11, H14 on what parcels.js built (W.parcels), with its own street lines (pcLines, pcFacing, pcStreetClear)
const v2Measure=()=>{const W=W0,F=cityFabric(W),PC=W.parcels,LL=W.lotLog||[],LN=pcLines(W,F),R=v=>Math.round(v),ex=(A,v)=>{if(A.length<12)A.push(v);};
 const sq=F.squares.map(s=>s.Y[0].P).concat(PC.tips);
 // H10: 1 m out from the middle of each built lot's front: in a street's or a road's band (and its step back), a square, or on paved ground within 2 m
 const H10={lots:0,n:0,by:{},ex:[]};
 for(const l of PC.lots){if(!l.built)continue;H10.lots++;const L=l.L,a=L[0],b=L[1],len=Math.hypot(b[0]-a[0],b[1]-a[1])||1,m=[(a[0]+b[0])/2,(a[1]+b[1])/2],at=d=>[m[0]+(b[1]-a[1])/len*d,m[1]-(b[0]-a[0])/len*d],p=at(1);
   let k=null;for(const id of LN.near(p[0],p[1])){const s=LN.segs[id];if(fbSegD2(p[0],p[1],s.a,s.b)<=(s.hw+(s.road?s.reach:.3))**2){k=s.road?'road':'street';break;}}
   if(!k&&sq.some(P=>nobleInside(p[0],p[1],P)))k='square';if(!k&&[1,1.5,2].some(d=>W.streetAt(...at(d))))k='paved';
   if(k)H10.by[k]=(H10.by[k]||0)+1;else{H10.n++;ex(H10.ex,{at:m.map(R),k:l.k,lot:l.row?'row':l.corner?'corner':'strip'});}}
 // H11: v2 houses on a secondary street (10 cm leeway) or on a main road (with eaves, as H1), and pairs of houses that overlap (10 cm in), any house with a v2 house
 const v2h=PC.houses.map(h=>LL[h.h].L),roads=[];W.roadList.forEach(([w,P])=>{for(let k=1;k<P.length;k++){const p=P[k-1],q=P[k],dx=q[0]-p[0],dz=q[1]-p[1],r=Math.atan2(-dz,dx);roads.push({cx:(p[0]+q[0])/2,cz:(p[1]+q[1])/2,hw:Math.hypot(dx,dz)/2,hd:Math.max(1,w-1)/2,c:Math.cos(r),s:Math.sin(r)});}});
 const H11={houses:v2h.length,street:0,road:0,pairs:0,ex:[]},gc=20,G=new Map(),key=(i,j)=>i*100003+j,box=[];
 for(const L of v2h){if(!pcStreetClear(LN,L)){H11.street++;ex(H11.ex,['street',...pCen(L).map(R)]);}const E=pInset(L,-.55)||L,o=lotOBB(E),rad=Math.hypot(o.hw,o.hd);
   if(roads.some(r=>Math.hypot(o.cx-r.cx,o.cz-r.cz)<=rad+Math.hypot(r.hw,r.hd)&&nobleOverlap(E,r))){H11.road++;ex(H11.ex,['road',...pCen(L).map(R)]);}}
 const homes=v2h.map(L=>({P:L,v2:1})).concat(LL.filter(l=>!v2h.includes(l.L)).map(l=>({P:l.L})),(W.residentialEnvelopes||[]).map(e=>({P:e.polygon})),(W.nobleParcels||[]).map(p=>({P:p.polygon})),(W.warehouseLog||[]).map(w=>({P:w.polygon})));
 for(const h of homes){const I=pInset(h.P,.1)||h.P;let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of I){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}h.I=I;h.b=[x0,z0,x1,z1];
   for(let i=Math.floor(x0/gc);i<=Math.floor(x1/gc);i++)for(let j=Math.floor(z0/gc);j<=Math.floor(z1/gc);j++){const kk=key(i,j);let A=G.get(kk);if(!A)G.set(kk,A=[]);A.push(h);}}
 const seen=new Set();for(const A of G.values())for(let u=0;u<A.length;u++)for(let v=u+1;v<A.length;v++){const a=A[u],b=A[v];if(!a.v2&&!b.v2)continue;const k=homes.indexOf(a)+'|'+homes.indexOf(b);if(seen.has(k))continue;seen.add(k);
   if(a.b[2]<b.b[0]||b.b[2]<a.b[0]||a.b[3]<b.b[1]||b.b[3]<a.b[1])continue;if(residentialOverlap(a.I,b.I)){H11.pairs++;ex(H11.ex,['pair',...pCen(a.I).map(R)]);}}
 // H14: each v2 house on a lot that faces a street or a main road, its front against the line it faces (pcFacing: the most nearly parallel of those within reach;
 // houses behind others face none). A house on a precinct's ring or a square faces that, which has no line here
 const H14={houses:v2h.length,measured:0,n:0,max:0,hist:{},ex:[]};
 PC.houses.forEach((h,i)=>{const k=PC.lots[h.lot].k;if(k!=='road'&&k!=='street')return;const L=v2h[i],f=pcFacing(LN,L);if(!f)return;H14.measured++;const d=f.dA/DEG,bin=d<1?'<1':d<3?'1-3':d<5?'3-5':d<10?'5-10':'10+';H14.hist[bin]=(H14.hist[bin]||0)+1;H14.max=Math.max(H14.max,+d.toFixed(1));
   if(d>5){H14.n++;ex(H14.ex,{at:pCen(L).map(R),deg:+d.toFixed(1),road:f.s.road});}});
 // H3 for v2's courts: a garden in a court that is not closed
 const H3=(W.residentialReservations||[]).filter(r=>r.v2&&r.closed===false&&r.deckBuilt).length,S=PC.stats;
 return{H10,H11,H14,H3,stats:{blocks:S.blocks,modes:S.modes,lots:S.lots,built:S.built,houses:S.houses,dropped:S.dropped,courts:S.courts,shops:S.shops,corners:S.corners,lanes:S.lanes,passages:S.passages,
   stepBack:S.stepBack,aligned:S.aligned,ms:S.ms,areaMs:W.v2AreaMs,glbSkipped:W.nInsulaV2||0}};};
   // one browser per tier: a second page in the same browser is a background tab, throttled until the wait times out
const audit=async(tier,viewport)=>{const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});browsers.push(browser);
const page=await browser.newPage();await page.setViewport(viewport);page.on('pageerror',e=>errors.push(tier+': '+e.message));await page.goto('file://'+path.join(root,'dist/city-audit.html')+(tier==='v2'?'?city=v2':''),{timeout:0});
await page.waitForFunction(()=>window.__ready||window.__err,{timeout:300000,polling:2000});
if(tier==='v2')return Object.assign(await page.evaluate(v2Measure),{area:await page.evaluate(houseCount)});
const area=await page.evaluate(houseCount);
return Object.assign(await page.evaluate(()=>{const W=W0,R=v=>Math.round(v),seg=(p,q,w,tag)=>{const dx=q[0]-p[0],dz=q[1]-p[1],r=Math.atan2(-dz,dx);return{cx:(p[0]+q[0])/2,cz:(p[1]+q[1])/2,hw:Math.hypot(dx,dz)/2,hd:w/2,c:Math.cos(r),s:Math.sin(r),tag};};
 // road corridors: main roads at full width minus 1 m (kerb tolerance), noble streets minus 0.4 m
 const roads=[];W.roadList.forEach(([w,P],i)=>{for(let k=1;k<P.length;k++)roads.push({...seg(P[k-1],P[k],Math.max(1,w-1),'main'),ri:i});});for(const q of W.nobleRoads||[])roads.push({...seg(q.a,q.b,Math.max(.8,q.width-.4),'noble'),ri:-1});
 // every residential source with a real polygon (eaves added to ordinary lots, as block-road-audit does)
 const homes=[];for(const l of W.lotLog||[])homes.push({P:pInset(l.L,-.55)||l.L,src:'lot'});for(const e of W.residentialEnvelopes||[])homes.push({P:e.polygon,src:'scatter:'+e.type});
 for(const p of W.nobleParcels||[])homes.push({P:p.polygon,src:'noble'});for(const w of W.warehouseLog||[])homes.push({P:w.polygon,src:'warehouse'});
 const onRoad=[];for(const h of homes){const o=lotOBB(h.P),rad=Math.hypot(o.hw,o.hd);for(const r of roads){if(Math.hypot(o.cx-r.cx,o.cz-r.cz)>rad+Math.hypot(r.hw,r.hd))continue;if(nobleOverlap(h.P,r)){onRoad.push({x:R(o.cx),z:R(o.cz),src:h.src,road:r.tag+(r.ri>=0?r.ri:'')});break;}}}
 const bySrc=onRoad.reduce((m,v)=>(m[v.src]=(m[v.src]||0)+1,m),{});
 // H2: main road centre lines inside the Tiber channel (bank margin 4 m plus half the road); a segment with an end on the water is a bridge deck, not a road in the river
 // (or ends at a bridge's deck end: its approach, roadgraph.js joins both ends of every bridge)
 const deckEnds=(W.bridges||[]).flatMap(b=>[1,-1].map(sd=>[b.x-b.uz*sd*b.len/2,b.z+b.ux*sd*b.len/2])),atDeck=p=>deckEnds.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<3);
 const wet=[];W.roadList.forEach(([w,P],i)=>{let n=0,first=null;for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k];if(polyDist(a[0],a[1],TIBER)[0]<RTW||polyDist(b[0],b[1],TIBER)[0]<RTW||atDeck(a)||atDeck(b))continue;
   for(const p of densify([a,b],5))if(polyDist(p[0],p[1],TIBER)[0]<RTW+4+w/2){n++;first=first||p.map(R);}}if(n)wet.push({road:i,metres:n*5,from:first});});
 // H3: residential courts that got a garden without being closed
 const res=W.residentialReservations||[],openGardens=res.filter(r=>r.closed===false&&r.deckBuilt).length,courts=res.filter(r=>r.role==='residential-courtyard').length;
 // H4: old courtyard estates (genBlocks domus) committed / attempted
 const E=W.estatePlanStats||{attempted:0,committed:0};
 const RS=W.ringStats||{rings:0,closed:0,walled:0,lot:{}};
 // H5: the network in the city is one piece (roadgraph.js roadGraph: roads, joins, bridges, the island and the Forum), and both ends of every bridge reach a road
 const G=roadGraph(W),ro=W.roadOpts||{},inCity=n=>!ro.country||!ro.country(n.x,n.z),pieces={};for(const n of G.nodes)if(inCity(n))pieces[n.comp]=(pieces[n.comp]||0)+1;
 const looseBridge=[];for(const e of G.edges)if(e.kind==='bridge')for(const id of[e.a,e.b])if(G.nodes[id].deg<2)looseBridge.push({bridge:e.name,at:[R(G.nodes[id].x),R(G.nodes[id].z)]});
 const H5={pieces:Object.keys(pieces).length,sizes:Object.values(pieces).sort((a,b)=>b-a),looseBridge,n:Object.keys(pieces).length-1+looseBridge.length};
 // H8: A-level road stretches (7 m and wider, not an uphill piece) on the final ground steeper than 10 % over 15 m for 30 m or more, or 28 % over 3 m,
 // with no stair or switchback marked on them (roadgraph.js) and no flight built (roadStairs): the same test roadHillSplit uses to narrow them
 const flights=W.roadStairs||[],H8=[];
 for(const[w,P,m]of W.roadList){if(w<7||(m&&m.hill))continue;const D=densify(P,3),S=[0];for(let k=1;k<D.length;k++)S.push(S[k-1]+Math.hypot(D[k][0]-D[k-1][0],D[k][1]-D[k-1][1]));const Y=D.map(p=>W.gy(p[0],p[1]));
   const gr=r=>S.map((s,i)=>{let a=i,b=i;while(a>0&&s-S[a-1]<=r)a--;while(b<D.length-1&&S[b+1]-s<=r)b++;return Math.abs(Y[b]-Y[a])/Math.max(1,S[b]-S[a]);}),g15=gr(15),g3=gr(3);
   const marks=[...((m&&m.stairs)||[]),...((m&&m.switchbacks)||[])],marked=p=>marks.some(([a,b])=>segD(p[0],p[1],a[0],a[1],b[0],b[1])<w+20)||flights.some(f=>Math.hypot(p[0]-f.x,p[1]-f.z)<f.len/2+8);
   let run=null;const close=()=>{if(run&&(run.steep||run.b-run.a>=30)&&!run.ok)H8.push({road:(m&&m.name)||'',from:run.p.map(R),metres:R(run.b-run.a),grade:+run.g.toFixed(2)});run=null;};
   for(let i=0;i<D.length;i++){const on=g15[i]>(run?.07:.10)||g3[i]>.28;if(!on){close();continue;}if(!run)run={a:S[i],b:S[i],p:D[i],g:0,steep:false,ok:true};run.b=S[i];run.g=Math.max(run.g,g15[i]);run.steep=run.steep||g3[i]>.28;run.ok=run.ok&&marked(D[i]);}close();}
 // H12: land in the districts with no use (roadgraph.js cityDistricts: districts with no road or ring along them, fragments with nothing round them), per cent
 const CD=cityDistricts(W);
 // P2 (fabric.js): the secondary streets and blocks round the Y junction, H13 and the block areas
 const FBo=cityFabric(W),FB=FBo.stats,P2={H13:FB.H13,H13ends:FB.H13ends,cuts:FB.cuts,blocks:FB.blocks,squares:FB.squares,km:FB.km,blockArea:FB.blockArea,blockAreaWindow:FB.blockAreaWindow,holes:FB.holes,unsnapped:FB.unsnapped,snapFixed:FB.snapFixed,ms:FB.ms,districts:FB.districts};
 // one network at every tier: L1 the road list (uphill pieces included), L2 the districts, L3 the secondary streets, blocks and squares
 const r2=v=>Math.round(v*100)/100,hs=s=>{let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return(x>>>0).toString(16);},pts=P=>P.map(p=>[r2(p[0]),r2(p[1])]);
 const net={tier:Q.name,grid:W.grid.n,hillBaked:!!W.roadHillBaked,L1:hs(JSON.stringify(W.roadList.map(([w,P,m])=>[w,pts(P),m&&m.hill?1:0]))),L2:CD.districts.map(d=>[d.cx,d.cz,d.area,d.cls,d.access?1:0].join(',')),
   L3:hs(JSON.stringify([FBo.blocks.map(b=>[r2(b.x),r2(b.z),Math.round(b.area),b.cls,b.Y.map(r=>pts(r.P))]),FBo.streets.map(t=>[t.w,t.lv,pts(t.S)]),FBo.squares.length]))};
 return{net,P2,faces:W.faceStats||{},triLots:(W.lotLog||[]).filter(l=>l.L&&l.L.length===3).length,rings:{courts:RS.rings,closed:RS.closed,walled:RS.walled,rate:RS.rings?+(RS.closed/RS.rings).toFixed(3):null,lots:RS.lot},H5,H8:H8.length,H8sample:H8.slice(0,20),H8all:H8,H12:CD.stats.H12,roads:G.stats,city:CD.stats,H1:onRoad.length,H1bySource:bySrc,H1sample:onRoad.slice(0,25),H2:wet,H3:openGardens,courts,H4:{attempted:E.attempted,committed:E.committed,rate:E.attempted?+(E.committed/E.attempted).toFixed(3):null,steepTerraced:E.steep||0,tooSmall:E.tooSmall||0,reasons:E.reasons,fallbackHomes:E.fallbackHomes},
   noble:{blocks:(W.nobleBlocks||[]).length,partial:(W.nobleBlocks||[]).filter(b=>b.parcels<b.target).length,triangular:(W.nobleBlocks||[]).filter(b=>b.triangular).length}};}),{area});};
try{const[low,desk,v2]=await Promise.all([audit('low',{width:800,height:600}),audit('desktop',{width:1280,height:800}),audit('v2',{width:1280,height:800})]),T={low,desktop:desk};
const L2a=new Set(low.net.L2),L2b=new Set(desk.net.L2),net={tiers:[low.net.tier,desk.net.tier],grids:[low.net.grid,desk.net.grid],hillBaked:low.net.hillBaked,L1same:low.net.L1===desk.net.L1,
  L2:{districts:[low.net.L2.length,desk.net.L2.length],same:low.net.L2.filter(d=>L2b.has(d)).length,lowOnly:low.net.L2.filter(d=>!L2b.has(d)),desktopOnly:desk.net.L2.filter(d=>!L2a.has(d))},L3same:low.net.L3===desk.net.L3};
const P3={H10:v2.H10,H11:v2.H11,H14:v2.H14,H3:v2.H3,stats:v2.stats,houses:{v2:v2.area,flagOff:desk.area,ratio:v2.area&&desk.area&&desk.area.all?+(v2.area.all/desk.area.all).toFixed(3):null}};
fs.writeFileSync('shots/city-audit.json',JSON.stringify({net,low,desktop:desk,P3,errors},null,1));
const show=a=>({faces:a.faces,triLots:a.triLots,rings:a.rings,H1:a.H1,H1bySource:a.H1bySource,H2:a.H2,H3:a.H3,courts:a.courts,H4:a.H4,H5:a.H5,H8:a.H8,H8sample:a.H8sample,H12:a.H12,P2:a.P2,roads:a.roads,city:a.city,noble:a.noble});
console.log(JSON.stringify({net,low:show(low),desktop:show(desk),P3,errors},null,1));
assert.equal(errors.length,0,'page errors');
// H8 is asserted at the desktop tier: the uphill stretches are cut on its ground (road-network.js); the low tier's coarser ground (20 m cells) has kinks and
// steeper bits of its own on the wide pieces, reported only. Three desktop spots were on main before the audit measured the desktop tier (docs/TODO.md):
const H8known=[['Via Ostiensis',-491,3366,'33 m at 13 %, just over the 30 m rule: the split and H8 sample the road at different points'],
  ['Via Portuensis',-1036,226,'the last 20 m down to the river at 28 %: the bank is never graded (gradeRoads keep) and the flight covers half of it'],
  ['Pons Neronianus→Pons Agrippae→bridge 12',-1338,-400,'a 1 m bump where two road beds overlap (gradeRoads: the heavier road wins cell by cell)']];
const H8new=desk.H8all.filter(h=>!H8known.some(([n,x,z])=>h.road===n&&Math.hypot(h.from[0]-x,h.from[1]-z)<10));
if(strict){for(const[t,a]of Object.entries(T)){assert.equal(a.H1,0,t+': H1 houses on roads');assert.equal(a.H2.length,0,t+': H2 roads in the river');assert.equal(a.H3,0,t+': H3 open courts with gardens');assert.ok(a.H4.committed>=a.H4.attempted*.5,t+': H4 old courtyard estates below 50 %');
    assert.equal(a.H5.n,0,t+': H5 network in pieces or a bridge end with no road');assert.ok(a.H12<1,t+': H12 district land with no use 1 % or more');
    assert.ok(a.P2.H13<10,t+': H13 street ends off square 10 % or more');}
  assert.equal(H8new.length,0,'desktop: H8 steep A-level stretches unmarked: '+JSON.stringify(H8new));
  assert.ok(net.hillBaked,'the low tier did not use the baked uphill stretches (road-network.js: run npm run bake:roads)');assert.ok(net.L1same,'L1: the road lists of the two tiers differ');
  assert.equal(net.L2.districts[0],net.L2.districts[1],'L2: the two tiers have different numbers of districts');assert.ok(net.L3same,'L3: the secondary streets and blocks of the two tiers differ');
  assert.equal(P3.H10.n,0,'v2: H10 lots facing no street: '+JSON.stringify(P3.H10.ex));assert.equal(P3.H11.street+P3.H11.road+P3.H11.pairs,0,'v2: H11 houses on streets or roads, or overlapping: '+JSON.stringify(P3.H11.ex));
  assert.equal(P3.H14.n,0,'v2: H14 house fronts more than 5° off their street: '+JSON.stringify(P3.H14.ex));assert.equal(P3.H3,0,'v2: H3 open courts with gardens');}
}finally{for(const b of browsers)await b.close();}

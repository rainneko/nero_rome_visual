// Whole-city audit for briefs/rome/city-generation-spec.md section 8 (H1-H5, H8) and road-first-city.md section 9 (H12, H13). Needs `npm run build:test`.
// Usage: node tools/test/city-audit.mjs [--assert]   -> prints the counts, writes shots/city-audit.json; --assert fails on any H1-H3, H5 or H8 hit,
// H4 < 50 %, H12 >= 1 % or H13 >= 10 % (P2, fabric.js: street ends that meet their street outside 60-120°; only round the Y junction for now).
// Open dist/city-audit.html?review (or dist/index.html?review served over http) for the layer panel and the generator lines (src/ui/review.js).
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import puppeteer from 'puppeteer';
const root=process.cwd(),strict=process.argv.includes('--assert');fs.mkdirSync('shots',{recursive:true});
const src=fs.readFileSync('dist/test.html','utf8');fs.writeFileSync('dist/city-audit.html',src.replace('window.__ready=true;loop();','window.__ready=true;if(REVIEW)loop();'));   // city-audit.html?review draws, with the review panel
const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});const errors=[];
try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.join(root,'dist/city-audit.html'),{timeout:0});
await page.waitForFunction(()=>window.__ready||window.__err,{timeout:300000,polling:2000});
const a=await page.evaluate(()=>{const W=W0,R=v=>Math.round(v),seg=(p,q,w,tag)=>{const dx=q[0]-p[0],dz=q[1]-p[1],r=Math.atan2(-dz,dx);return{cx:(p[0]+q[0])/2,cz:(p[1]+q[1])/2,hw:Math.hypot(dx,dz)/2,hd:w/2,c:Math.cos(r),s:Math.sin(r),tag};};
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
 const FB=cityFabric(W).stats,P2={H13:FB.H13,H13ends:FB.H13ends,cuts:FB.cuts,blocks:FB.blocks,squares:FB.squares,km:FB.km,blockArea:FB.blockArea,blockAreaWindow:FB.blockAreaWindow,holes:FB.holes,unsnapped:FB.unsnapped,snapFixed:FB.snapFixed,ms:FB.ms,districts:FB.districts};
 return{P2,faces:W.faceStats||{},triLots:(W.lotLog||[]).filter(l=>l.L&&l.L.length===3).length,rings:{courts:RS.rings,closed:RS.closed,walled:RS.walled,rate:RS.rings?+(RS.closed/RS.rings).toFixed(3):null,lots:RS.lot},H5,H8:H8.length,H8sample:H8.slice(0,20),H12:CD.stats.H12,roads:G.stats,city:CD.stats,H1:onRoad.length,H1bySource:bySrc,H1sample:onRoad.slice(0,25),H2:wet,H3:openGardens,courts,H4:{attempted:E.attempted,committed:E.committed,rate:E.attempted?+(E.committed/E.attempted).toFixed(3):null,steepTerraced:E.steep||0,tooSmall:E.tooSmall||0,reasons:E.reasons,fallbackHomes:E.fallbackHomes},
   noble:{blocks:(W.nobleBlocks||[]).length,partial:(W.nobleBlocks||[]).filter(b=>b.parcels<b.target).length,triangular:(W.nobleBlocks||[]).filter(b=>b.triangular).length}};});
fs.writeFileSync('shots/city-audit.json',JSON.stringify({a,errors},null,1));
console.log(JSON.stringify({faces:a.faces,triLots:a.triLots,rings:a.rings,H1:a.H1,H1bySource:a.H1bySource,H2:a.H2,H3:a.H3,courts:a.courts,H4:a.H4,H5:a.H5,H8:a.H8,H8sample:a.H8sample,H12:a.H12,P2:a.P2,roads:a.roads,city:a.city,noble:a.noble,errors},null,1));
assert.equal(errors.length,0,'page errors');
if(strict){assert.equal(a.H1,0,'H1 houses on roads');assert.equal(a.H2.length,0,'H2 roads in the river');assert.equal(a.H3,0,'H3 open courts with gardens');assert.ok(a.H4.committed>=a.H4.attempted*.5,'H4 old courtyard estates below 50 %');
  assert.equal(a.H5.n,0,'H5 network in pieces or a bridge end with no road');assert.equal(a.H8,0,'H8 steep A-level stretches unmarked');assert.ok(a.H12<1,'H12 district land with no use 1 % or more');
  assert.ok(a.P2.H13<10,'H13 street ends off square 10 % or more');}
}finally{await browser.close();}

// Whole-city audit for briefs/rome/city-generation-spec.md section 8 (H1-H4). Needs `npm run build:test`.
// Usage: node tools/test/city-audit.mjs [--assert]   -> prints the counts, writes shots/city-audit.json; --assert fails on any H1-H3 hit or H4 < 50 %.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import puppeteer from 'puppeteer';
const root=process.cwd(),strict=process.argv.includes('--assert');fs.mkdirSync('shots',{recursive:true});
const src=fs.readFileSync('dist/test.html','utf8');fs.writeFileSync('dist/city-audit.html',src.replace('window.__ready=true;loop();','window.__ready=true;'));
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
 const wet=[];W.roadList.forEach(([w,P],i)=>{let n=0,first=null;for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k];if(polyDist(a[0],a[1],TIBER)[0]<RTW||polyDist(b[0],b[1],TIBER)[0]<RTW)continue;
   for(const p of densify([a,b],5))if(polyDist(p[0],p[1],TIBER)[0]<RTW+4+w/2){n++;first=first||p.map(R);}}if(n)wet.push({road:i,metres:n*5,from:first});});
 // H3: residential courts that got a garden without being closed
 const res=W.residentialReservations||[],openGardens=res.filter(r=>r.closed===false&&r.deckBuilt).length,courts=res.filter(r=>r.role==='residential-courtyard').length;
 // H4: old courtyard estates (genBlocks domus) committed / attempted
 const E=W.estatePlanStats||{attempted:0,committed:0};
 const RS=W.ringStats||{rings:0,closed:0,walled:0,lot:{}};
 return{rings:{courts:RS.rings,closed:RS.closed,walled:RS.walled,rate:RS.rings?+(RS.closed/RS.rings).toFixed(3):null,lots:RS.lot},H1:onRoad.length,H1bySource:bySrc,H1sample:onRoad.slice(0,25),H2:wet,H3:openGardens,courts,H4:{attempted:E.attempted,committed:E.committed,reasons:E.reasons,fallbackHomes:E.fallbackHomes},
   noble:{blocks:(W.nobleBlocks||[]).length,partial:(W.nobleBlocks||[]).filter(b=>b.parcels<b.target).length,triangular:(W.nobleBlocks||[]).filter(b=>b.triangular).length}};});
fs.writeFileSync('shots/city-audit.json',JSON.stringify({a,errors},null,1));
console.log(JSON.stringify({rings:a.rings,H1:a.H1,H1bySource:a.H1bySource,H2:a.H2,H3:a.H3,courts:a.courts,H4:a.H4,noble:a.noble,errors},null,1));
assert.equal(errors.length,0,'page errors');
if(strict){assert.equal(a.H1,0,'H1 houses on roads');assert.equal(a.H2.length,0,'H2 roads in the river');assert.equal(a.H3,0,'H3 open courts with gardens');assert.ok(a.H4.committed>=a.H4.attempted*.5,'H4 old courtyard estates below 50 %');}
}finally{await browser.close();}

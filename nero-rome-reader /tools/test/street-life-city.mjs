// Whole-city admission and exported-geometry audit for the new daily-life groups.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import puppeteer from 'puppeteer';
const out='shots/street-life-20261025';fs.mkdirSync(out,{recursive:true});
let source=fs.readFileSync('dist/test.html','utf8').replace('window.__ready=true;loop();','window.__ready=true;').replace('Q.dens=.8;Q.trees=.8;','Q.dens=1;Q.trees=1;');
source=source.replace('function romePutModels(n,scene){',`function romePutModels(n,scene){if(['rome_market_pair','rome_bakery_bay','rome_garden_exedra'].includes(n)){scene.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(scene);(window.__lifeBounds||(window.__lifeBounds={}))[n]={min:b.min.toArray(),max:b.max.toArray()};}`);
fs.writeFileSync('dist/street-life-review.html',source);
const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']}),errors=[];
try{const p=await browser.newPage();await p.setViewport({width:1280,height:800});p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message);});p.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,600));if(/street life|streets|Error|failed/.test(m.text()))console.log('PAGE',m.text().slice(0,500));});
await p.goto('file://'+path.join(process.cwd(),'dist/street-life-review.html')+'?test',{timeout:60000});await p.waitForFunction(()=>window.__ready||window.__err,{timeout:240000});if(!await p.evaluate(()=>!!window.__ready))throw Error(await p.evaluate(()=>window.__err));await p.waitForFunction(()=>window.__romeReady,{timeout:120000});
const audit=await p.evaluate(()=>{
 const L=W0.streetLife,S=W0.street,violations=[];
 for(const q of L.placements){
  if(q.role==='garden-rest'){const E=W0.scenicEstates.find(e=>e.index===q.estateIndex);if(!q.polygon.every(p=>lifeInside(E.courtPolygon,p[0],p[1])))violations.push({type:'garden-outside',q});
   const C=frame(q.x,q.y,q.z,q.rot),local=(x,z)=>{const dx=x-q.x,dz=z-q.z;return[C.c*dx-C.s*dz,C.s*dx+C.c*dz];};
   for(const col of E.peristyleColumns){const[u,v]=local(col.x,col.z);if(Math.abs(u)<q.w/2+col.clearance&&Math.abs(v)<q.d/2+col.clearance)violations.push({type:'garden-column',q,col});}
   if(q.y<E.deckY+.07||q.y>E.deckY+.10)violations.push({type:'garden-coplanar-or-high',q});
   const E0=frame(E.x,E.deckY,E.z,E.rot);for(const a of q.polygon){const dx=a[0]-E.x,dz=a[1]-E.z;if(Math.abs(E0.c*dx-E0.s*dz)>E.restSlot.openHW-.3||Math.abs(E0.s*dx+E0.c*dz)>E.restSlot.openHD-.3)violations.push({type:'garden-roof',q});}
   const pool=E.fountainPlan,[pu,pv]=local(pool.x,pool.z);if(Math.abs(pu)<q.w/2+pool.hx+.4&&Math.abs(pv)<q.d/2+pool.hz+.4)violations.push({type:'garden-pool',q});continue;}
  const F=frame(q.x,0,q.z,q.rot),nx=Math.ceil(q.w),nz=Math.ceil(q.d);
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const p=F.p(-q.w/2+q.w*i/nx,0,-q.d/2+q.d*j/nz),x=p[0],z=p[2],ix=Math.floor((x-S.x0)/S.cs),iz=Math.floor((z-S.z0)/S.cs),k=iz*S.nx+ix;
    if(S.solid[k]||S.court[k]||(S.road[k]&&!q.square)||S.water[k]||S.waterAt(x,z)||!S.grd[k])violations.push({type:'mask',n:q.n,x,z});
    if(W0.roadList.some(([w,P])=>polyDist(x,z,P)[0]<w/2+1.5-1e-5))violations.push({type:'road',n:q.n,x,z});}
  const o={cx:q.x,cz:q.z,hw:q.w/2,hd:q.d/2,c:Math.cos(q.rot),s:Math.sin(q.rot)};
  for(const f of W0.foot.list){if(f.siteRole==='daily-life'||(q.square&&f.marketSquare))continue;if(Math.hypot(q.x-f.cx,q.z-f.cz)>Math.hypot(o.hw,o.hd)+f.r)continue;if(obb(o,f))violations.push({type:'foot',n:q.n,x:f.cx,z:f.cz,tag:f.tag});}
 }
 return{density:Q.dens,life:L,estateCounts:W0.scenicEstateLog.counts,scenicSupportOK:W0.scenicEstates.every(E=>E.courtEaveClearance>=2&&E.deckExposure<=2.001),bounds:window.__lifeBounds,views:['lifeMarket','lifeBakery','lifeGarden'].filter(k=>W0.views[k]),violations};
});
fs.writeFileSync(out+'/audit.json',JSON.stringify({audit,errors},null,2));console.log(JSON.stringify({counts:audit.life.counts,rejected:audit.life.rejected,violations:audit.violations,views:audit.views,bounds:audit.bounds,errors}));
assert.equal(errors.length,0,'browser/GLSL errors');assert.equal(audit.violations.length,0,'street/court placement violations');
assert.ok(audit.life.counts.markets>0&&audit.life.counts.bakeries>0&&audit.life.counts.gardens>0,'all three assets present in city');
assert.deepEqual(audit.estateCounts,{aventine:4,academy:4},'all restored estates retained');assert.ok(audit.scenicSupportOK,'estate floors and eaves remain supported');
const dimensions={rome_market_pair:[6.4,2.85,3.8],rome_bakery_bay:[6,3.5,5.4],rome_garden_exedra:[7.2,3.1,4.2]};
for(const[n,[w,h,d]]of Object.entries(dimensions)){const b=audit.bounds[n];assert.ok(b,'GLB loaded: '+n);assert.ok(b.min[0]>=-w/2-.005&&b.max[0]<=w/2+.005&&b.min[2]>=-d/2-.005&&b.max[2]<=d/2+.005&&b.max[1]<=h+.005,'exported bounds: '+n);}
await p.evaluate(()=>{for(const id of['labels','dock','reader'])document.getElementById(id).style.display='none';window.__shot(0,null,.42);settings.crystL=true;resize();camera.clearViewOffset();camera.aspect=1280/800;camera.near=.5;camera.updateProjectionMatrix();});
if(!process.env.LIFE_AUDIT_ONLY)for(const key of audit.views){if(process.env.LIFE_SHOTS&&!process.env.LIFE_SHOTS.split(',').includes(key))continue;await p.evaluate(key=>{const v=W0.views[key];camera.position.set(...v.pos);camera.lookAt(...v.tgt);skyMesh.position.copy(camera.position);P.render(W0.scene,camera);},key);await p.screenshot({path:out+'/'+key+'.png'});console.log('shot',key);}
fs.rmSync(out+'/error.json',{force:true});
}catch(e){fs.writeFileSync(out+'/error.json',JSON.stringify({error:e.message,errors},null,2));throw e;}finally{await browser.close();}

// Four-storey elite quarter acceptance: inspect actual GLBs, then boot the real city once.
import fs from 'node:fs';import path from 'node:path';import puppeteer from 'puppeteer';
const root=process.cwd(),out=path.join(root,'shots/noble-compounds');fs.mkdirSync(out,{recursive:true});
const names=['rome_lux_row4','rome_lux_corner4'],data=Object.fromEntries(names.map(n=>[n,fs.readFileSync(`assets/models/rome/${n}.glb`).toString('base64')]));
const source=['src/core/renderer.js','src/core/materials.js','src/scenes/rome/assets.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const setup=`
Q.msaa=0;renderer.setPixelRatio(1);renderer.setSize(1100,750);P.setSize(1100,750);camera.aspect=1100/750;camera.near=.4;camera.far=500;camera.updateProjectionMatrix();
const scene=new THREE.Scene();scene.background=new THREE.Color(.57,.58,.57);const models=[],checks=[];
const data=${JSON.stringify(data)};
window.readyModels=Promise.all(Object.entries(data).map(([n,b64],i)=>new Promise((resolve,reject)=>{
 new THREE.GLTFLoader().parse(Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer,'',g=>{const o=g.scene;o.position.x=i?17:-17;o.rotation.y=Math.PI;o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;romeMat(m.material);}});scene.add(o);models.push({n,o});resolve();},reject);
}))).then(()=>{
 scene.updateMatrixWorld(true);
 for(const {n,o} of models){const hits=new THREE.Raycaster(new THREE.Vector3(o.position.x,40,0),new THREE.Vector3(0,-1,0),0,45).intersectObject(o,true);
 checks.push({name:n+' courtyard is open to sky',pass:!!hits.length&&hits[0].point.y<3,firstHitY:hits[0]?.point.y});
 const box=new THREE.Box3().setFromObject(o);checks.push({name:n+' eave/roof height budget',pass:box.max.y<=17.5,bounds:box.getSize(new THREE.Vector3()).toArray()});}
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(130,100).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xb1a99a,roughness:1}));ground.position.y=-.04;ground.receiveShadow=true;scene.add(ground,sun,sun.target,hemi);
 ENV.tod=.4;applyEnv();updateEnv(scene);U.uHaze.value.x=0;sun.position.set(-30,40,-25);sun.target.position.set(0,6,0);sun.target.updateMatrixWorld();sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,near:.5,far:150});sun.shadow.camera.updateProjectionMatrix();
 camera.position.set(-40,30,-63);camera.lookAt(0,7,0);settings.paint=false;settings.cryst=false;settings.crystL=false;P.render(scene,camera);window.__modelsReady=true;
});
`;
fs.writeFileSync('dist/noble-assets-test.html',`<html><body style="margin:0"><canvas id="gl"></canvas><span id="todv" style="display:none"></span><script src="../node_modules/three/build/three.min.js"></script><script src="../node_modules/three/examples/js/loaders/GLTFLoader.js"></script><script>${source}\n${setup}</script></body></html>`);
const results=[],errors=[],b=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});const watchdog=setTimeout(()=>b.process()?.kill('SIGTERM'),150000);
try{
 const p=await b.newPage();await p.setViewport({width:1100,height:750});p.on('pageerror',e=>{errors.push(e.message);console.log('ERROR',e.message);});p.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.log('CONSOLE',m.text().slice(0,300));}});
 await p.goto('file://'+path.join(root,'dist/noble-assets-test.html')+'?test',{timeout:45000});await p.waitForFunction(()=>window.__modelsReady,{timeout:45000});results.push(...await p.evaluate(()=>checks));await p.screenshot({path:path.join(out,'assets-plain.png')});
 await p.evaluate(()=>{settings.crystL=true;P.render(scene,camera);});await p.screenshot({path:path.join(out,'assets-crystal.png')});
 const city=fs.readFileSync('dist/test.html','utf8');if(!city.includes('window.__ready=true;loop();'))throw Error('boot marker changed');fs.writeFileSync('dist/noble-city-test.html',city.replace('window.__ready=true;loop();','window.__ready=true;'));
 await p.goto('file://'+path.join(root,'dist/noble-city-test.html')+'?test',{timeout:45000});await p.waitForFunction(()=>window.__ready||window.__err,{timeout:60000});const boot=await p.evaluate(()=>({ready:window.__ready,error:window.__err}));if(!boot.ready)throw Error(boot.error);
 await p.waitForFunction(()=>window.__romeReady,{timeout:45000});
 const audit=await p.evaluate(()=>{W0.scene.updateMatrixWorld(true);const homes=W0.nobleHomes,rows=W0.nobleProcedural||[],parcels=W0.nobleParcels,blocks=W0.nobleBlocks,roads=W0.nobleRoads,loaded=ROME.GLB.filter(p=>p.n.startsWith('rome_lux_'));
   const storeys={};for(const p of parcels)storeys[p.storeys]=(storeys[p.storeys]||0)+1;
   const fullBlocks=blocks.filter(b=>b.parcels>=b.target),six=fullBlocks.filter(b=>b.target===3).length;
   const mesh=W0.scene.getObjectByName('noble_dense_courtyard_blocks'),courtChecks=rows.filter(p=>p.court).map(p=>{const c=pCen(p.court),hits=new THREE.Raycaster(new THREE.Vector3(c[0],p.roofTop+10,c[1]),new THREE.Vector3(0,-1,0),0,40).intersectObject(p.meshTag?W0.scene.getObjectByName(p.meshTag):mesh);return{block:p.block,y:p.y,first:hits[0]?.point.y,open:!!hits.length&&hits[0].point.y<Math.max(p.y+2,(p.groundMax||p.y)+1.8)};});
   // Distance between parcels is measured, not inferred from a density slider.
   const pointEdge=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);};
   const gaps=[];for(let i=0;i<parcels.length;i++)for(let j=i+1;j<parcels.length;j++){const a=parcels[i],b=parcels[j];if(a.block!==b.block)continue;let d=1e9;for(const[P,Q]of[[a.polygon,b.polygon],[b.polygon,a.polygon]])for(const p of P)for(let k=0;k<Q.length;k++)d=Math.min(d,pointEdge(p,Q[k],Q[(k+1)%Q.length]));gaps.push(d);}
   return {homes,proceduralCount:rows.length,parcels:parcels.length,storeys,blocks:blocks.length,six,fullBlocks:fullBlocks.map(b=>({id:b.id,count:b.parcels})),triangular:blocks.filter(b=>b.triangular).length,nonQuad:parcels.filter(p=>p.polygon.length!==4).length,roads:[...new Set(roads.map(r=>r.width))],partyWallPairs:gaps.length,maxPartyGap:Math.min(Infinity,...gaps),volumes:rows.flatMap(p=>p.volumes||[]).map(v=>({storeys:v.storeys,depth:v.depth})),roofParts:[...new Set(rows.map(p=>p.roofPart))],pocketSquares:W0.pocketSquares||[],compoundSlopeErrors:rows.filter(p=>p.groundMax-p.groundMin>nobleSlopeLimit(pArea(p.polygon),p.storeys)+.01).length,courtChecks,loaded:loaded.filter(p=>p.obj).length,suburaPreserved:nobleQuarterAt(700,-350)===null,core:nobleQuarterAt(638,-90),views:!!W0.views.noble&&!!W0.views.nobleHome&&!!W0.views.noblePlan,corridorRemoved:!W0.eastGalleryLog};});
 results.push({name:'detailed homes load inside attached parcels',pass:audit.homes.length>0&&audit.loaded===audit.homes.length,audit});
 results.push({name:'mixed three/four-storey compounds and irregular blocks',pass:audit.storeys[3]>0&&audit.storeys[4]>0&&audit.six>0&&audit.triangular>0&&audit.nonQuad>0});
 results.push({name:'separate compounds with service lanes, main streets and lanes',pass:audit.partyWallPairs>10&&audit.maxPartyGap>=1.5&&audit.roads.some(w=>w<3)&&audit.roads.some(w=>w>6)});
 results.push({name:'thick house volumes, floor and slope rules',pass:audit.volumes.length>30&&audit.volumes.every(v=>v.storeys>=3&&v.storeys<=4&&v.depth>=5.6)&&audit.compoundSlopeErrors===0&&audit.roofParts.includes(1)&&audit.roofParts.includes(43)});
 results.push({name:'procedural private courts genuinely open',pass:audit.courtChecks.length>0&&audit.courtChecks.every(c=>c.open)});
 results.push({name:'pocket squares use real gaps',pass:audit.pocketSquares.length>0&&audit.pocketSquares.every(p=>p.slope<.8)});
 results.push({name:'old speculative corridor gone, Subura rule preserved',pass:audit.corridorRemoved&&audit.suburaPreserved&&audit.views});
 await p.evaluate(()=>{document.querySelector('#reader').classList.add('closed');for(const id of ['labels','dock','reader'])document.getElementById(id).style.display='none';resize();window.__shot(0,'noble',.42);camApply();camera.near=.5;camera.clearViewOffset();camera.aspect=1100/750;camera.updateProjectionMatrix();skyMesh.position.copy(camera.position);settings.crystL=true;P.render(W0.scene,camera);});await p.screenshot({path:path.join(out,'district.png')});
 await p.evaluate(()=>{window.__shot(0,'noblePlan',.42);camApply();camera.near=.5;camera.updateProjectionMatrix();skyMesh.position.copy(camera.position);P.render(W0.scene,camera);});await p.screenshot({path:path.join(out,'plan.png')});
 await p.evaluate(()=>{window.__shot(0,'nobleHome',.42);camApply();camera.near=.5;camera.updateProjectionMatrix();skyMesh.position.copy(camera.position);P.render(W0.scene,camera);});await p.screenshot({path:path.join(out,'home-in-city.png')});
}finally{clearTimeout(watchdog);await b.close();fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({results,errors},null,2));}
console.log(JSON.stringify({results:results.map(r=>({...r,audit:r.audit?{homes:r.audit.homes.length,procedural:r.audit.proceduralCount,loaded:r.audit.loaded,storeys:r.audit.storeys,blocks:r.audit.blocks,six:r.audit.six,triangular:r.audit.triangular,nonQuad:r.audit.nonQuad,partyWallPairs:r.audit.partyWallPairs,courts:r.audit.courtChecks.length}:undefined})),errors}));if(errors.length||results.some(r=>!r.pass))process.exitCode=1;

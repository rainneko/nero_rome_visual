// Boot the real city once and take static geometry acceptance views; not an FPS test.
import fs from 'node:fs';import path from 'node:path';import puppeteer from 'puppeteer';
const root=process.cwd(),out=path.join(root,'shots/gallery-structure');
const source=fs.readFileSync('dist/test.html','utf8');
if(!source.includes('window.__ready=true;loop();'))throw Error('Boot marker changed');
fs.writeFileSync('dist/gallery-city.html',source.replace('window.__ready=true;loop();','window.__ready=true;'));
const b=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const timer=setTimeout(()=>b.process()?.kill('SIGTERM'),150000),errors=[];
try{const p=await b.newPage();await p.setViewport({width:1100,height:750});p.on('pageerror',e=>{errors.push(e.message);console.log('ERROR',e.message);});p.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.log('CONSOLE',m.text().slice(0,400));}});
 await p.goto('file://'+path.join(root,'dist/gallery-city.html')+'?test',{timeout:45000});await p.waitForFunction(()=>window.__ready||window.__err,{timeout:60000});
 const status=await p.evaluate(()=>({ready:window.__ready,error:window.__err,galleries:W0.houseGalleryLog?.length,corridorRemoved:!W0.eastGalleryLog}));console.log('BOOT',JSON.stringify(status));if(!status.corridorRemoved)throw Error('Cancelled eastern gallery is still in scene');if(!status.ready)throw Error(status.error);
 await p.waitForFunction(()=>window.__romeReady,{timeout:45000});
 await p.evaluate(()=>{document.querySelector('#labels').style.display='none';document.querySelector('#dock').style.display='none';document.querySelector('#reader').style.display='none';window.__shot(0,null,.42);settings.crystL=true;camera.near=.5;camera.clearViewOffset();camera.aspect=1100/750;camera.updateProjectionMatrix();camera.position.set(700,190,440);camera.lookAt(455,42,90);skyMesh.position.copy(camera.position);P.render(W0.scene,camera);});
 await p.screenshot({path:path.join(out,'city-cancelled-gallery-area.png')});
 await p.evaluate(()=>{const L=W0.houseGalleryLog.filter(q=>q.wrap).map(q=>({...q,c:q.outer.reduce((s,p)=>[s[0]+p[0]/4,s[1]+p[2]/4],[0,0])})).sort((a,b)=>Math.hypot(a.c[0]-450,a.c[1]-40)-Math.hypot(b.c[0]-450,b.c[1]-40))[0];if(!L)throw Error('No real galleries in city');camera.position.set(L.c[0]+19,L.y+9,L.c[1]-25);camera.lookAt(L.c[0],L.y+1,L.c[1]);skyMesh.position.copy(camera.position);P.render(W0.scene,camera);});
 await p.screenshot({path:path.join(out,'city-house.png')});fs.writeFileSync(path.join(out,'city-result.json'),JSON.stringify({status,errors},null,2));
 if(errors.length)process.exitCode=1;
}finally{clearTimeout(timer);await b.close();}

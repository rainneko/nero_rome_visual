// Render arbitrary cameras to PNG with headless Chromium (software WebGL), no browser window needed.
// Usage: node tools/test/cam.mjs jobs.json      (build with `npm run build:test` first)
// jobs.json: [{"out":"forum.png","state":0,"tod":0.45,"view":"forum"} | {"out":..,"pos":[x,y,z],"tgt":[x,y,z]},
//             optional "js": "code run in the page before the shot", "wait": ms]
// Output goes to shots/. Models from dist/*-assets.js are loaded before the first shot.
import puppeteer from 'puppeteer';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const jobs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));fs.mkdirSync(path.join(root,'shots'),{recursive:true});
const b=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:1280,height:720});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});
const t0=Date.now();while(Date.now()-t0<400000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,1500));}
console.log('boot',((Date.now()-t0)/1000).toFixed(0)+'s');
await p.evaluate(()=>{if(typeof romeLoadModels==='function')romeLoadModels();if(typeof antLoadModels==='function')antLoadModels();});
const t1=Date.now();while(Date.now()-t1<120000){if(await p.evaluate(()=>(typeof ROME==='undefined'||!ROME.GLB.length||window.__romeReady)&&(typeof ANT==='undefined'||window.__antReady)))break;await new Promise(r=>setTimeout(r,1500));}
for(const j of jobs){await p.evaluate(j=>{if(j.pos)W0.views.__cam={n:'cam',pg:j.pg,pos:j.pos,tgt:j.tgt};window.__shot(j.state||0,j.pos?'__cam':j.view,j.tod??.45);if(j.js)(0,eval)(j.js);},j);
  await new Promise(r=>setTimeout(r,j.wait||2500));await p.screenshot({path:path.join(root,'shots',j.out)});console.log('shot',j.out);}
if(errs.length)console.log('PAGE ERRORS:\n'+errs.join('\n'));await b.close();

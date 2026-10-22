// Render camera views to PNG. Usage: node tools/test/shot.mjs '[[state,"viewKey",timeOfDay,"out.png"],...]'
// View keys live in W.views (see src/scenes/*). Output goes to shots/.
import puppeteer from 'puppeteer';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');const jobs=JSON.parse(process.argv[2]||'[[0,"forum",0.3,"forum.png"]]');
fs.mkdirSync(path.join(root,'shots'),{recursive:true});
const b=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage();await p.setViewport({width:1280,height:720});await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});
const t0=Date.now();while(Date.now()-t0<300000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,2000));}
for(const[s,v,tod,out]of jobs){const url=await p.evaluate(async(s,v,tod)=>await window.__shot(s,v,tod),s,v,tod);
  fs.writeFileSync(path.join(root,'shots',out),Buffer.from(url.split(',')[1],'base64'));console.log('shot',out);}
await b.close();

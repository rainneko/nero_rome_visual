// Page views of the Domus Tiberiana (briefs/rome/tiberiana-v2.md, steps 2 and 7): the same cameras as palatine_survey.mjs
// (briefs/rome/palatine-masterplan.md, section 7; hill grid lx, y, lz -> world by palW).
// Usage: [STANDIN=1] node tools/plan/tiberiana_shots.mjs <out dir> [prefix] [view,view,...]      (after npm run build:test)
import path from 'node:path';import fs from 'node:fs';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),require=createRequire(path.join(root,'package.json')),puppeteer=require('puppeteer');
const out=path.resolve(process.argv[2]||path.join(root,'shots')),pre=process.argv[3]||'page',only=process.argv[4]?process.argv[4].split(','):null;
fs.mkdirSync(out,{recursive:true});
const b=await puppeteer.launch({headless:'new',args:['--enable-gpu','--use-angle=metal','--allow-file-access-from-files','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:1600,height:900});const errs=[];p.on('pageerror',e=>errs.push(e.message));
if(process.env.STANDIN){await p.setRequestInterception(true);p.on('request',r=>r.url().includes('rome-assets.js')?r.abort():r.continue());}   // STANDIN=1: the Rome models never arrive, the page keeps its stand-ins
const t0=Date.now();await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});
while(Date.now()-t0<400000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,1000));}
console.log('boot',((Date.now()-t0)/1000).toFixed(0)+'s');
if(!process.env.STANDIN){await p.evaluate(()=>{if(typeof romeLoadModels==='function')romeLoadModels();});
  const t1=Date.now();while(Date.now()-t1<180000){if(await p.evaluate(()=>typeof ROME==='undefined'||!ROME.GLB.length||window.__romeReady))break;await new Promise(r=>setTimeout(r,1000));}}
console.log('models',((Date.now()-t0)/1000).toFixed(0)+'s');
const c=Math.cos(-Math.PI/6),s=Math.sin(-Math.PI/6),W=(lx,y,lz)=>[100+lx*c+lz*s,y,300-lx*s+lz*c];   // palW (PALF: 100, 300, -30 deg)
const cams=[['tib_roofs',[-150,165,115],[-138,58,-35]],['tib_north',[-200,70,-250],[-138,35,-60]],['top',[0,760,60],[0,50,20]],['saddle',[-30,150,60],[-30,55,-45]],['west',[-360,120,80],[-170,38,30]],
  ['tib_close',[-60,120,60],[-138,62,-30]],['tib_sw',[-250,95,60],[-180,62,0]],['tib_plan',[-138.4,330,-29.7],[-138.4,55,-29.8]],
  // the way down from the side door (briefs/rome/tiberiana-v2-stairs.md): the north-west stair, its foot from the street side and from above, the side door's stair, the whole way
  ['tib_nw',[-250,48,-182],[-196,20,-134]],['tib_foot',[-228,22,-153],[-212.5,10.5,-137]],['tib_foot_top',[-212.4,38,-137.2],[-212.4,9,-137.6]],['tib_side',[-268,82,-40],[-206,47,-45]],['tib_way',[-330,105,-160],[-208,35,-90]]];
for(const[n,P,T]of cams){if(only&&!only.includes(n))continue;
  await p.evaluate((pos,tgt)=>{W0.views.__cam={n:'cam',pos,tgt};window.__shot(0,'__cam',.45);},W(P[0],P[1],P[2]),W(T[0],T[1],T[2]));await new Promise(r=>setTimeout(r,3500));
  await p.screenshot({path:path.join(out,pre+'_'+n+'.jpg'),type:'jpeg',quality:88});console.log('shot',n);}
if(errs.length)console.log('PAGE ERRORS:\n'+errs.join('\n'));await b.close();

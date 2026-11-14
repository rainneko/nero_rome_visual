// Page pictures of the Palatine terrace houses (rome_domus_a/b and their belt variants) from fixed cameras.
// Usage: ROOT=<project> OUT=<dir> [PREFIX=after-] node tools/plan/domus_shots.mjs
// Cameras are in the Palatine's own frame (palatine_survey.mjs); the first five are the acceptance views.
import path from 'node:path';import fs from 'node:fs';import {createRequire} from 'node:module';
const root=process.env.ROOT,out=process.env.OUT,pre=process.env.PREFIX||'',require=createRequire(path.join(root,'package.json')),puppeteer=require('puppeteer');
fs.mkdirSync(out,{recursive:true});
const b=await puppeteer.launch({headless:'new',protocolTimeout:600000,args:['--enable-gpu','--use-angle=metal','--allow-file-access-from-files','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:1440,height:840});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t0=Date.now();await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});
while(Date.now()-t0<400000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,1000));}
await p.evaluate(()=>{if(typeof romeLoadModels==='function')romeLoadModels();});
{const t1=Date.now();while(Date.now()-t1<180000){if(await p.evaluate(()=>!!window.__romeReady))break;await new Promise(r=>setTimeout(r,1000));}}
console.log('ready',((Date.now()-t0)/1000).toFixed(0)+'s');
const state=await p.evaluate(()=>({placements:ROME.GLB.filter(q=>/rome_domus_[ab](_belt)?$/.test(q.n)).map(q=>({n:q.n,x:+q.x.toFixed(2),y:+q.y.toFixed(2),z:+q.z.toFixed(2),r:q.r,loaded:!!(q.obj||q.ghost)})),stats:W0.palTerStats||null}));
fs.writeFileSync(path.join(out,pre+'state.json'),JSON.stringify(state,null,1)+'\n');
const c=Math.cos(-Math.PI/6),s=Math.sin(-Math.PI/6),W=([x,y,z])=>[100+x*c+z*s,y,300-x*s+z*c];
const cams=[['lo_a',[245,52,-52],[204,46,-72]],['lo_b',[240,50,58],[204,46,36]],['c_villa_a',[270,70,-120],[205,38,-72]],['east',[350,125,-20],[170,45,0]],['north_bowl',[15,150,-340],[15,30,-105]],
  ['stair_a',[226,44,-72],[204,39,-72]],['top_a',[214,78,-72],[206,38,-72]],['north_a',[62,66,-196],[62,46,-150]]];
for(const[n,P,T]of cams){await p.evaluate((pos,tgt)=>{W0.views.__cam={n:'cam',pos,tgt};window.__shot(0,'__cam',2.45);},W(P),W(T));await new Promise(r=>setTimeout(r,3500));
  await p.screenshot({path:path.join(out,pre+n+'.jpg'),type:'jpeg',quality:90});console.log('shot',n);}
if(errs.length)console.log('PAGE ERRORS:\n'+errs.join('\n'));await b.close();

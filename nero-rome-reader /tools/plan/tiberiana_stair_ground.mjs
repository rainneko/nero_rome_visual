// The north-west stair of the Domus Tiberiana against the page's DRAWN ground (briefs/rome/tiberiana.md, "The way down").
// The terrain under a hill model stands above the model's own lowest surface: tools/pal_rock.mjs lifts each 4 m cell toward its
// neighbours' lowest points, palShape (palatine.js) puts the terrain 0.25 m under that, and buildPatch (terrain-roads.js)
// smooths the Palatine's terrain patch three times. Whatever of the model lies under that ground is covered by it. This reads
// the treads and landings the model script prints (NW_TREADS: [x0, y0, x1, y1, top] in model axes, and the foot from NW_STAIR)
// and compares each with W0.gy, which inside a patch is the drawn surface.
// Usage: node tools/plan/tiberiana_stair_ground.mjs <log of tools/models/rome/rome_tiberiana.py> [low]      (after npm run build:test)
//        "low": the low quality tier (touch or small screens: coarser terrain, here up to 0.35 m higher at the rock's hem)
import path from 'node:path';import fs from 'node:fs';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),require=createRequire(path.join(root,'package.json')),puppeteer=require('puppeteer');
const log=fs.readFileSync(process.argv[2],'utf8').split('\n'),line=k=>{const l=log.find(t=>t.startsWith(k+' '));if(!l)throw new Error('no '+k+' line in '+process.argv[2]);return JSON.parse(l.slice(k.length+1));};
const T=line('NW_TREADS'),foot=line('NW_STAIR')['foot model'],low=process.argv[3]==='low';
const b=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage();await p.setViewport(low?{width:640,height:640}:{width:1280,height:800});
await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});await p.waitForFunction(()=>window.__ready||window.__err,{timeout:400000,polling:2000});
const r=await p.evaluate((T,foot)=>{const g=(x,y)=>{const q=palW(-138.4+x,-29.8-y);return W0.gy(q[0],q[1])-54.8;};   // model x, y -> the drawn ground as model z
  const rows=T.map(([x0,y0,x1,y1,z])=>{let m=1e9,at=null;for(const[x,y]of[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[(x0+x1)/2,(y0+y1)/2]]){const d=z-g(x,y);if(d<m){m=d;at=[x,y];}}return{m:+m.toFixed(2),at,z,r:[x0,y0,x1,y1]};});
  rows.sort((a,c)=>a.m-c.m);const x0=Math.min(...T.map(t=>t[0])),f=T.filter(t=>Math.abs(t[3]-foot[1])<.01&&Math.abs(t[4]-foot[2])<.01)[0];
  return{tier:Q.name,grid:W0.grid.n,n:T.length,under:rows.filter(q=>q.m<0),least:rows.slice(0,5),
    foot:f?[f[0],(f[0]+f[2])/2,f[2]].map(x=>({x:+x.toFixed(1),top:foot[2],ground:+g(x,foot[1]).toFixed(2),step:+(foot[2]-g(x,foot[1])).toFixed(2)})):null};},T,foot);
console.log('tier',r.tier,'(grid '+r.grid+'), '+r.n+' treads and landings');
console.log('under the drawn ground: '+r.under.length+(r.under.length?'  '+r.under.map(q=>'['+q.r.map(v=>v.toFixed(1))+'] by '+(-q.m).toFixed(2)+' m at ('+q.at.map(v=>v.toFixed(1))+')').join('; '):''));
console.log('least clearance: '+r.least.map(q=>q.m.toFixed(2)+' m at ('+q.at.map(v=>v.toFixed(1))+') top '+q.z).join('; '));
if(r.foot)console.log('foot (lowest tread '+foot[2]+' at y '+foot[1]+'): the step down onto the ground at its west end, middle, east end: '+r.foot.map(q=>q.step.toFixed(2)+' m (x '+q.x+', ground '+q.ground+')').join(', '));
await b.close();

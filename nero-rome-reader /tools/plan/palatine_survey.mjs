// Survey of the Palatine as the page builds it now: ground heights on the hill's own grid, the plan data, and "before" shots.
// Usage: ROOT=<project> OUT=<dir> node survey.mjs
import path from 'node:path';import fs from 'node:fs';import {createRequire} from 'node:module';
const root=process.env.ROOT,out=process.env.OUT,require=createRequire(path.join(root,'package.json')),puppeteer=require('puppeteer');
fs.mkdirSync(out,{recursive:true});
const b=await puppeteer.launch({headless:'new',args:['--enable-gpu','--use-angle=metal','--allow-file-access-from-files','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:1600,height:900});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t0=Date.now();await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});
while(Date.now()-t0<400000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,1000));}
console.log('boot',((Date.now()-t0)/1000).toFixed(0)+'s');
await p.evaluate(()=>{if(typeof romeLoadModels==='function')romeLoadModels();});
{const t1=Date.now();while(Date.now()-t1<180000){if(await p.evaluate(()=>typeof ROME==='undefined'||!ROME.GLB.length||window.__romeReady))break;await new Promise(r=>setTimeout(r,1000));}}
console.log('models',((Date.now()-t0)/1000).toFixed(0)+'s');
const data=await p.evaluate(()=>{const o={};
  const X0=-300,X1=300,Z0=-260,Z1=320,ST=4,H=[];for(let lz=Z0;lz<=Z1;lz+=ST){const row=[];for(let lx=X0;lx<=X1;lx+=ST){const q=palW(lx,lz);row.push(+W0.gy(q[0],q[1]).toFixed(2));}H.push(row);}
  o.grid={X0,X1,Z0,Z1,ST,H};o.PALF={ox:PALF.ox,oz:PALF.oz,rot:PALF.rot};
  o.assets=PAL_ASSETS;o.blocks=PAL_BL;o.blk=PAL_BLK;o.basin=PAL_BASIN;o.pads=PAL_PADS;o.zones=PAL_ZONES;o.sc=PAL_SC;o.crypto=PAL_CRYPTO;o.lv=PAL_LV;o.deck=PAL_DECK;o.top=PAL_TOP;o.obs=PAL_OBS;
  o.rock={};if(typeof PAL_ROCK!=='undefined')for(const k in PAL_ROCK)o.rock[k]={pts:PAL_ROCK[k].pts,foot:PAL_ROCK[k].foot,top:PAL_ROCK[k].top};
  o.segs=(W0.palTerSegs||[]).map(s=>({yk:s.yk,k:s.k,gap:s.gap,wp:s.wp,oA:s.oA,oB:s.oB,iA:s.iA,iB:s.iB,ht:+s.ht.toFixed(1),along:s.along}));
  const L=p=>palL(p[0],p[1]).map(v=>+v.toFixed(1));
  o.stairs=(W0.hillStairs||[]).map(h=>({w:h.w,top:h.top,glb:h.glb||null,steps:h.steps,R:h.R.filter((_,i)=>i%2===0||i===h.R.length-1).map(L)}));
  o.clivus=(W0.palClivus||[]).filter((_,i)=>i%2===0).map(L);
  o.Wkeys=Object.keys(W0).slice(0,400);o.footKeys=W0.foot?Object.keys(W0.foot):[];
  o.views=Object.fromEntries(Object.entries(W0.views).filter(([k,v])=>v&&v.pos).map(([k,v])=>[k,{n:v.n,pos:v.pos,tgt:v.tgt}]));
  o.temples=(W0.temples||[]).map(t=>({n:t.n||t.name||null,x:t.x,z:t.z,l:(t.x!=null)?L([t.x,t.z]):null,w:t.w,d:t.d,rot:t.rot,y:t.y,pod:t.pod})).filter(t=>t.l&&Math.abs(t.l[0])<320&&Math.abs(t.l[1])<340);
  o.stats=W0.palTerStats||null;o.walls=W0.palWalls;
  return o;});
fs.writeFileSync(path.join(out,'survey.json'),JSON.stringify(data));console.log('survey.json',JSON.stringify(data).length,'bytes; W keys:',data.Wkeys.join(' '));console.log('foot keys:',data.footKeys.join(' '));
const c=Math.cos(-Math.PI/6),s=Math.sin(-Math.PI/6),W=(lx,y,lz)=>[100+lx*c+lz*s,y,300-lx*s+lz*c];
const cams=[['north_bowl',[15,150,-340],[15,30,-105]],['tib_roofs',[-150,165,115],[-138,58,-35]],['tib_north',[-200,70,-250],[-138,35,-60]],['west',[-360,120,80],[-170,38,30]],['south_circus',[20,130,400],[20,35,150]],['east',[350,125,-20],[170,45,0]],['top',[0,760,60],[0,50,20]],['saddle',[-30,150,60],[-30,55,-45]]];
for(const[n,P,T]of cams){await p.evaluate((pos,tgt)=>{W0.views.__cam={n:'cam',pos,tgt};window.__shot(0,'__cam',.45);},W(P[0],P[1],P[2]),W(T[0],T[1],T[2]));await new Promise(r=>setTimeout(r,3500));await p.screenshot({path:path.join(out,'now_'+n+'.jpg'),type:'jpeg',quality:88});console.log('shot',n);}
if(errs.length)console.log('PAGE ERRORS:\n'+errs.join('\n'));await b.close();

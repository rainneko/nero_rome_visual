// With the camera still: how many of 150 frames redraw the shadow map (shadows on demand, app.js shadowTick), and the frame time (mean, p50, p95).
// Usage: node tools/test/perf-shadow.mjs [state:view ...]   (build:test first; the machine's GPU, vsync off; VW/VH: the canvas size; PAGE: another build in dist/)
// Frame times move with whatever else the machine is doing: compare two builds by alternating runs, never from one run each.
import puppeteer from 'puppeteer';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const views=(process.argv.slice(2).length?process.argv.slice(2):['0:forum','6:galba','8:aurea']).map(s=>{const[a,b]=s.split(':');return[+a,b];});
const b=await puppeteer.launch({headless:'new',args:['--enable-gpu','--use-angle=metal','--disable-gpu-vsync','--disable-frame-rate-limit','--allow-file-access-from-files','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:+(process.env.VW||1280),height:+(process.env.VH||720)});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t0=Date.now();await p.goto('file://'+path.join(root,'dist/'+(process.env.PAGE||'test.html'))+'?test',{timeout:0});
while(Date.now()-t0<400000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,1000));}
await p.evaluate(()=>{if(typeof romeLoadModels==='function')romeLoadModels();});
{const t1=Date.now();while(Date.now()-t1<120000){if(await p.evaluate(()=>typeof ROME==='undefined'||!ROME.GLB.length||window.__romeReady))break;await new Promise(r=>setTimeout(r,1000));}}
for(const[s,v]of views){await p.evaluate((s,v)=>window.__shot(s,v,.45),s,v);await new Promise(r=>setTimeout(r,4000));
  const o=await p.evaluate(()=>new Promise(res=>{renderer.shadowMap.enabled=true;const sm=renderer.shadowMap,r0=sm.render;let shadow=0,frames=0;const who={};
    sm.render=function(){if(sm.enabled&&(sm.autoUpdate||sm.needsUpdate))shadow++;return r0.apply(this,arguments);};
    const n0=typeof shNear==='function'?shNear:null;let near=0,asked=0;
    if(n0)window.__shNearProbe=(x,z)=>{near++;};
    const T=[];let last=0;const tick=t=>{if(last)T.push(t-last);last=t;frames++;if(W0.sdirty)asked++;if(frames<150)requestAnimationFrame(tick);else{sm.render=r0;renderer.shadowMap.enabled=false;T.sort((a,b)=>a-b);
      res({frames,shadowRedraws:shadow,dirtyAtRaf:asked,meanMs:+(T.reduce((a,b)=>a+b,0)/T.length).toFixed(1),p50:+T[T.length>>1].toFixed(1),p95:+T[Math.floor(T.length*.95)].toFixed(1),
        layersVisible:Object.keys(W0.layers).filter(k=>W0.layers[k].visible).length,dist:Math.round(view.dist),D:Math.round(sun.shadow.camera.right)});}};requestAnimationFrame(tick);}));
  console.log(JSON.stringify({view:s+':'+v,...o}));}
if(errs.length)console.log('PAGE ERRORS:\n'+errs.join('\n'));await b.close();

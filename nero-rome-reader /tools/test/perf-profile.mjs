// Where the memory and the frame go: geometry bytes by layer and by mesh, the JS heap, and what one frame draws (with shadows) at a few views.
// Usage: node tools/test/perf-profile.mjs [state:view ...]      (build with `npm run build:test` first; default views 0:forum 6:galba 8:aurea)
//   GPU=1: the machine's GPU instead of SwiftShader, and each view's frame time (CPU submit, mean of 20 renders; and a 180-frame rAF loop, mean and p95; shadows on)
import puppeteer from 'puppeteer';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const views=(process.argv.slice(2).length?process.argv.slice(2):['0:forum','6:galba','8:aurea']).map(s=>{const[a,b]=s.split(':');return[+a,b];});
const GPU=!!process.env.GPU,b=await puppeteer.launch({headless:'new',args:[...(GPU?['--enable-gpu','--use-angle=metal']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']),'--allow-file-access-from-files','--ignore-gpu-blocklist','--enable-precise-memory-info']});
const p=await b.newPage();await p.setViewport({width:1280,height:720});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t0=Date.now();await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});
while(Date.now()-t0<400000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,1000));}
if(GPU)await p.evaluate(()=>{window.__gpuT=1;});const boot=(Date.now()-t0)/1000;
await p.evaluate(()=>{if(typeof romeLoadModels==='function')romeLoadModels();});   // the models first (as cam.mjs), so every view counts them
{const t1=Date.now();while(Date.now()-t1<120000){if(await p.evaluate(()=>typeof ROME==='undefined'||!ROME.GLB.length||window.__romeReady))break;await new Promise(r=>setTimeout(r,1000));}}
const cdp=await p.target().createCDPSession();await cdp.send('Performance.enable');
const heap=async()=>{const m=(await cdp.send('Performance.getMetrics')).metrics,g=k=>(m.find(x=>x.name===k)||{}).value||0;return Math.round(g('JSHeapUsedSize')/1048576);};
await cdp.send('HeapProfiler.collectGarbage');const heapBoot=await heap();
const geo=await p.evaluate(()=>{const MB=1048576,seen=new Set(),arrs=new Set(),lay={},big=[];let tot=0,tris=0,inst=0;
  const once=a=>{if(!a||arrs.has(a))return 0;arrs.add(a);return a.byteLength;},bytes=g=>{let s=0;for(const k in g.attributes){const a=g.attributes[k];s+=once(a.isInterleavedBufferAttribute?a.data.array:a.array);}if(g.index)s+=once(g.index.array);return s;};
  const layerOf=o=>{for(let q=o;q;q=q.parent){if(q.userData&&q.userData.lay)return q.userData.lay+(q.parent===W0.scene?'':'');if(q.parent===W0.scene)return q.name||q.type;}return'?';};
  const layName=o=>{for(let q=o;q;q=q.parent)if(q.parent===W0.scene)return q.name||q.userData.lay||q.type;return'?';};
  W0.scene.traverse(o=>{const g=o.geometry;if(!g)return;const n=(g.index?g.index.count:g.attributes.position?g.attributes.position.count:0)/3*(o.isInstancedMesh?o.count:1);tris+=n;
    let s=0;if(!seen.has(g.uuid)){seen.add(g.uuid);s=bytes(g);}if(o.isInstancedMesh){const a=once(o.instanceMatrix.array)+(o.instanceColor?once(o.instanceColor.array):0);s+=a;inst+=a;}tot+=s;
    const k=layName(o),L=lay[k]||(lay[k]={mb:0,tris:0,meshes:0,vis:0});L.mb+=s/MB;L.tris+=n;L.meshes++;let v=true;for(let q=o;q;q=q.parent)if(!q.visible){v=false;break;}if(v)L.vis++;
    if(!g.boundingSphere)g.computeBoundingSphere();big.push({lay:k,tag:layerOf(o),mat:(o.material&&(o.material.name||o.material.type))||'',mb:+(s/MB).toFixed(1),tris:Math.round(n),r:Math.round(g.boundingSphere?g.boundingSphere.radius:0),vis:v});});
  const L=Object.entries(lay).map(([k,v])=>({k,mb:+v.mb.toFixed(1),tris:Math.round(v.tris/1e3)+'k',meshes:v.meshes,vis:v.vis})).sort((a,b)=>b.mb-a.mb);
  let tex=0;const ts=new Set();W0.scene.traverse(o=>{const m=o.material;if(!m)return;for(const mm of[].concat(m))for(const k in mm){const t=mm[k];if(t&&t.isTexture&&!ts.has(t.uuid)){ts.add(t.uuid);const i=t.image;if(i&&i.width)tex+=i.width*i.height*4*1.33;}}});
  big.sort((a,b)=>b.mb-a.mb);const r=big.filter(x=>x.r>800),rad={over800m:r.length,over800mMB:+r.reduce((a,x)=>a+x.mb,0).toFixed(1)};
  return{totalMB:+(tot/MB).toFixed(1),instancedMB:+(inst/MB).toFixed(1),textureMB:+(tex/MB).toFixed(1),trisM:+(tris/1e6).toFixed(2),meshes:big.length,geometries:seen.size,rad,layers:L.slice(0,30),top:big.slice(0,25)};});
console.log(JSON.stringify({boot:boot.toFixed(0)+'s',heapAfterBootMB:heapBoot,...geo},null,1));
for(const[s,v]of views){await p.evaluate((s,v)=>window.__shot(s,v,.45),s,v);await new Promise(r=>setTimeout(r,2500));
  const f=await p.evaluate(()=>{renderer.shadowMap.enabled=true;renderer.shadowMap.needsUpdate=true;renderer.info.autoReset=false;renderer.info.reset();const by={},tb={},rb=renderer.renderBufferDirect;renderer.renderBufferDirect=function(c,sc,g,m,o,gr){let k='?';for(let q=o;q;q=q.parent)if(q.parent===W0.scene){k=q.name||q.userData.lay||q.type;break;}k+=o.userData.lay?'/'+o.userData.lay:'';by[k]=(by[k]||0)+1;const n=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1),ps=c===camera?'main':'shadow';tb[ps+' '+k]=(tb[ps+' '+k]||0)+n;return rb.apply(this,arguments);};const t=performance.now();renderer.render(W0.scene,camera);const ms=performance.now()-t;renderer.renderBufferDirect=rb;
    const i=renderer.info,o={calls:i.render.calls,trisM:+(i.render.triangles/1e6).toFixed(2),cpuMs:Math.round(ms),gpuGeometries:i.memory.geometries,gpuTextures:i.memory.textures,callsBy:Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e.join(':')).join(' '),trisBy:Object.entries(tb).sort((a,b)=>b[1]-a[1]).slice(0,10).map(e=>e[0]+':'+(e[1]/1e6).toFixed(1)+'M').join(' ')};renderer.info.autoReset=true;
    if(window.__gpuT){let a=0;for(let k=0;k<20;k++){renderer.shadowMap.needsUpdate=true;const t0=performance.now();renderer.render(W0.scene,camera);a+=performance.now()-t0;}o.submitMs=+(a/20).toFixed(1);}
    renderer.shadowMap.enabled=false;return o;});
  if(GPU){f.loop=await p.evaluate(()=>new Promise(res=>{renderer.shadowMap.enabled=true;const T=[];let last=0;const tick=t=>{if(last)T.push(t-last);last=t;if(T.length<180)requestAnimationFrame(tick);else{T.sort((a,b)=>a-b);renderer.shadowMap.enabled=false;res({meanMs:+(T.reduce((a,b)=>a+b,0)/T.length).toFixed(1),p95Ms:+T[Math.floor(T.length*.95)].toFixed(1)});}};requestAnimationFrame(tick);}));}
  console.log(JSON.stringify({view:s+':'+v,...f,heapMB:await heap()}));}
if(errs.length)console.log('PAGE ERRORS:\n'+errs.join('\n'));await b.close();

// Overdraw, counted exactly: fragments that pass the depth test in today's draw order (what the page shades) and all rasterised fragments (depth complexity),
// per pixel of the canvas. Usage: node tools/test/perf-overdraw.mjs [state:view ...]   (build:test first; VW/VH: the canvas size). A depth pre-pass would bring the first number to 1.
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
  const o=await p.evaluate(()=>{renderer.shadowMap.enabled=false;const gl=renderer.getContext(),w=renderer.domElement.width,h=renderer.domElement.height;
    const rt=new THREE.WebGLRenderTarget(w,h,{depthBuffer:true});const cnt=new THREE.MeshBasicMaterial({color:new THREE.Color(4/255,4/255,4/255),blending:THREE.AdditiveBlending,transparent:false,fog:false});cnt.toneMapped=false;
    const read=()=>{const px=new Uint8Array(w*h*4);renderer.readRenderTargetPixels(rt,0,0,w,h,px);let s=0,cov=0,mx=0;for(let i=0;i<px.length;i+=4){const v=px[i]/4;s+=v;if(v>0)cov++;if(v>mx)mx=v;}return{perPixel:+(s/(w*h)).toFixed(2),perCoveredPixel:+(s/Math.max(1,cov)).toFixed(2),covered:+(cov/(w*h)).toFixed(2),max:mx};};
    const oc=renderer.getClearColor(new THREE.Color()).clone(),oa=renderer.getClearAlpha(),bg=W0.scene.background;W0.scene.background=null;renderer.setClearColor(0,1);
    // (a) fragments that pass the depth test in today's draw order = fragments the page shades
    W0.scene.overrideMaterial=cnt;renderer.setRenderTarget(rt);renderer.autoClear=true;renderer.render(W0.scene,camera);const shaded=read();
    // (b) every rasterised fragment (no depth test): the depth complexity of the view
    cnt.depthTest=false;renderer.render(W0.scene,camera);const all=read();
    W0.scene.overrideMaterial=null;W0.scene.background=bg;renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);rt.dispose();
    return{size:[w,h],shadedNow:shaded,depthComplexity:all};});
  console.log(JSON.stringify({view:s+':'+v,...o}));}
if(errs.length)console.log('PAGE ERRORS:\n'+errs.join('\n'));await b.close();

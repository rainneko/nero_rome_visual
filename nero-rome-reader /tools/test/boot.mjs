// Boot the page headless, collect errors, print the resource bar. Run: npm run build:test && npm run test:boot
import puppeteer from 'puppeteer';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const b=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage();await p.setViewport({width:1280,height:720});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});const t0=Date.now();
while(Date.now()-t0<300000){if(await p.evaluate(()=>!!(window.__ready||window.__err)))break;await new Promise(r=>setTimeout(r,2000));}
{const e=await p.evaluate(()=>window.__err?String(window.__err.stack||window.__err):(window.__ready?null:'the page never became ready'));if(e)errs.push('build: '+e);}   // a failed build sets __err (caught, so it is no pageerror)
// the Palatine's street stair footMC must reach the lane (palFootMCStreet): it is left out without a word when the wall-side flight's sampled foot moves out of its window. No street-cell test here: test.html's street raster has no cell at the lane's head (index.html has: st.footMCst.street)
{const r=await p.evaluate(()=>{const W=typeof W0!=='undefined'&&W0,s=W&&W.palStairStats;if(!s)return{e:'footMCst: no stair statistics (W0.palStairStats)'};const f=s.footMCst;
  return{f,e:!f?'footMCst: not built':f.skipped?'footMCst: skipped ('+f.skipped+')':Math.abs(f.ground-f.foot)>.9?'footMCst: its foot paving is '+(f.foot-f.ground).toFixed(2)+' m off the ground':null};});
  if(r.e)errs.push(r.e);else console.log('footMCst top '+r.f.top+' foot '+r.f.foot+' ground '+r.f.ground);}
console.log('boot',((Date.now()-t0)/1000).toFixed(1)+'s');
console.log(await p.evaluate(()=>[...document.querySelectorAll('#ledgers .led')].map(d=>d.getAttribute('data-tip')).join('\n')));
console.log(errs.length?'ERRORS:\n'+errs.join('\n'):'no page errors');await b.close();process.exit(errs.length?1:0);

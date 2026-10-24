// Compare actual production settings; deliberately do not append ?test.
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const watchdog=setTimeout(()=>{browser.process()?.kill('SIGTERM');},300000);
const results=[];fs.mkdirSync('shots',{recursive:true});
try{for(const file of ['perf-before.html','test.html']){
 const page=await browser.newPage();await page.setViewport({width:1000,height:720,deviceScaleFactor:1.5});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.join(root,'dist',file),{timeout:120000});
 await page.waitForFunction(()=>window.__ready&&window.__romeReady&&window.__antReady,{timeout:240000});
 await page.evaluate(()=>{window.__shot(0,'birdForum',.45);});
 await new Promise(r=>setTimeout(r,1500));
 const stats=await page.evaluate(async()=>{
   const gl=renderer.getContext(),times=[];let last=performance.now();
   for(let i=0;i<16;i++){await new Promise(requestAnimationFrame);gl.finish();const now=performance.now();if(i>3)times.push(now-last);last=now;}
   times.sort((a,b)=>a-b);
   return {test:TEST,pr:renderer.getPixelRatio(),shadow:sun.shadow.mapSize.x,msaa:Q.msaa,lightCrystal:settings.crystL,oil:P.oilLight?[P.oilLight.width,P.oilLight.height]:[P.ldr2.width,P.ldr2.height],medianMs:times[Math.floor(times.length/2)],p95Ms:times[Math.floor(times.length*.95)]};
 });
 await page.screenshot({path:`shots/perf-${file}.png`});
 if(file==='test.html')stats.controls=await page.evaluate(()=>{setPerfMode('fine');const fine=P.oilLight.width===P.ldr.width;setPerfMode('smooth');const smooth=Q.msaa===0&&sun.shadow.mapSize.x===1024;setPerfMode('balanced');return {fine,smooth,visible:!!document.querySelector('#renderQuality'),defaultOn:settings.crystL};});
 results.push({file,...stats,errors});console.log(JSON.stringify(results.at(-1)));await page.close();
}}finally{clearTimeout(watchdog);await browser.close();fs.writeFileSync('shots/performance.json',JSON.stringify(results,null,2));}

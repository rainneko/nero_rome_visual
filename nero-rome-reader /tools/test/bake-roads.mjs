// Route the main roads in the page (?reroute) and write src/scenes/rome/road-network.js, so the reader loads them instead of routing on every visit.
// Usage: npm run build:test && node tools/test/bake-roads.mjs [--check]   (--check: fail if the baked file is out of date instead of writing it)
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';import puppeteer from 'puppeteer';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'src/scenes/rome/road-network.js'),check=process.argv.includes('--check');
const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'dist/test.html')+'?reroute',{timeout:0});await page.waitForFunction(()=>window.__ready||window.__err,{timeout:300000,polling:2000});
  const err=await page.evaluate(()=>window.__err&&String(window.__err));if(err||errors.length)throw Error(err||errors.join('\n'));
  const r=await page.evaluate(()=>({key:W0.roadRouted.key,roads:W0.roadRouted.roads.map(P=>P.map(p=>[Math.round(p[0]*10)/10,Math.round(p[1]*10)/10])),ms:W0.roadTiming,fail:W0.roadRouteFail||[]}));
  const body=`/* Main roads as routed by routeRoad (streets.js) from the waypoints in monuments.js: written by tools/test/bake-roads.mjs, do not edit by hand.
   key: the waypoints and late obstacles they were routed from; when monuments.js changes them the reader routes live and warns until this is baked again. */
const ROME_ROADS_BAKED={key:${JSON.stringify(r.key)},
roads:[${r.roads.map(P=>'\n'+JSON.stringify(P)).join(',')}]};
`;
  if(check){const old=fs.readFileSync(out,'utf8');if(old!==body){console.error('road-network.js is out of date: run node tools/test/bake-roads.mjs');process.exit(1);}console.log('road-network.js up to date');}
  else{fs.writeFileSync(out,body);console.log('wrote',path.relative(root,out),r.roads.length,'roads,',r.roads.reduce((n,P)=>n+P.length,0),'points; routing took',r.ms.route,'ms; kept as drawn:',JSON.stringify(r.fail));}
}finally{await browser.close();}

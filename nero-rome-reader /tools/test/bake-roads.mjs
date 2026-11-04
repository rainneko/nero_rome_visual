// Route the main roads in the page (?reroute), join them into one network (roadGraphJoin, roadgraph.js) and write src/scenes/rome/road-network.js,
// so the reader loads both instead of routing and joining on every visit.
// Usage: npm run build:test && node tools/test/bake-roads.mjs [--check]   (--check: fail if the baked file is out of date instead of writing it)
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';import puppeteer from 'puppeteer';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'src/scenes/rome/road-network.js'),check=process.argv.includes('--check');
const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'dist/test.html')+'?reroute',{timeout:0});await page.waitForFunction(()=>window.__ready||window.__err,{timeout:300000,polling:2000});
  const err=await page.evaluate(()=>window.__err&&String(window.__err));if(err||errors.length)throw Error(err||errors.join('\n'));
  const r=await page.evaluate(()=>{const r1=v=>Math.round(v*10)/10,pt=P=>P.map(p=>[r1(p[0]),r1(p[1])]);
    return{key:W0.roadRouted.key,roads:W0.roadRouted.roads.map(pt),ms:W0.roadTiming,fail:W0.roadRouteFail||[],joinKey:W0.roadJoinKey,joinStats:W0.roadJoin.stats,joinLog:W0.roadJoin.log||[],
      joined:W0.roadJoined.map(([w,P,m])=>[w,pt(P),Object.assign({},m,m.stairs?{stairs:m.stairs.map(pt)}:{},m.switchbacks?{switchbacks:m.switchbacks.map(pt)}:{})])};});
  const body=`/* Main roads as routed by routeRoad (streets.js) from the waypoints in monuments.js: written by tools/test/bake-roads.mjs, do not edit by hand.
   key: the waypoints and late obstacles they were routed from; when monuments.js changes them the reader routes live and warns until this is baked again. */
const ROME_ROADS_BAKED={key:${JSON.stringify(r.key)},
roads:[${r.roads.map(P=>'\n'+JSON.stringify(P)).join(',')}],
/* the same roads joined into one network (roadGraphJoin, roadgraph.js): [width, points, {name, kind: main|join, join: ext|pair|bridge|merge, stairs, switchbacks}] */
joinKey:${JSON.stringify(r.joinKey)},joinStats:${JSON.stringify(r.joinStats)},
joined:[${r.joined.map(J=>'\n'+JSON.stringify(J)).join(',')}]};
`;
  if(check){const old=fs.readFileSync(out,'utf8');if(old!==body){console.error('road-network.js is out of date: run node tools/test/bake-roads.mjs');process.exit(1);}console.log('road-network.js up to date');}
  else{fs.writeFileSync(out,body);for(const l of r.joinLog)console.log('  '+Object.entries(l).map(([k,v])=>k==='k'?v:k+' '+(Array.isArray(v)?v.join(','):v)).join(' · '));console.log('wrote',path.relative(root,out),r.roads.length,'roads,',r.roads.reduce((n,P)=>n+P.length,0),'points; routing and joining took',r.ms.route,'ms; kept as drawn:',JSON.stringify(r.fail),'; joins:',JSON.stringify(r.joinStats));}
}finally{await browser.close();}

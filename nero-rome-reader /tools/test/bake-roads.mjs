// Route the main roads in the page (?reroute), join them into one network (roadGraphJoin, roadgraph.js) and write src/scenes/rome/road-network.js,
// so the reader loads both instead of routing and joining on every visit. Then, at the desktop tier, the uphill stretches of that network
// (roadHillSplit, terrain-roads.js): the low tier cuts the roads where the desktop tier does, so both tiers have one network (road-first-city.md 4.3).
// Usage: npm run build:test && node tools/test/bake-roads.mjs [--check]   (--check: fail if the baked file is out of date instead of writing it)
// When the routes or joins change, the script writes them, builds test.html again (npm run build:test) and then measures the uphill stretches on them.
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';import {execSync} from 'child_process';import puppeteer from 'puppeteer';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'src/scenes/rome/road-network.js'),check=process.argv.includes('--check');
const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const load=async(query,viewport)=>{const page=await browser.newPage();await page.setViewport(viewport);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(root,'dist/test.html')+query,{timeout:0});await page.waitForFunction(()=>window.__ready||window.__err,{timeout:300000,polling:2000});
  const err=await page.evaluate(()=>window.__err&&String(window.__err));if(err||errors.length)throw Error(err||errors.join('\n'));return page;};
try{
  // 1. routes and joins, routed and joined live at the low tier (800 x 600), as they always were
  let page=await load('?reroute',{width:800,height:600});
  const r=await page.evaluate(()=>{const r1=v=>Math.round(v*10)/10,pt=P=>P.map(p=>[r1(p[0]),r1(p[1])]);
    return{key:W0.roadRouted.key,roads:W0.roadRouted.roads.map(pt),ms:W0.roadTiming,fail:W0.roadRouteFail||[],joinKey:W0.roadJoinKey,joinStats:W0.roadJoin.stats,joinLog:W0.roadJoin.log||[],
      joined:W0.roadJoined.map(([w,P,m])=>[w,pt(P),Object.assign({},m,m.stairs?{stairs:m.stairs.map(pt)}:{},m.switchbacks?{switchbacks:m.switchbacks.map(pt)}:{})])};});
  await page.close();
  const head=`/* Main roads as routed by routeRoad (streets.js) from the waypoints in monuments.js: written by tools/test/bake-roads.mjs, do not edit by hand.
   key: the waypoints and late obstacles they were routed from; when monuments.js changes them the reader routes live and warns until this is baked again. */
const ROME_ROADS_BAKED={key:${JSON.stringify(r.key)},
roads:[${r.roads.map(P=>'\n'+JSON.stringify(P)).join(',')}],
/* the same roads joined into one network (roadGraphJoin, roadgraph.js): [width, points, {name, kind: main|join, join: ext|pair|bridge|merge, stairs, switchbacks}] */
joinKey:${JSON.stringify(r.joinKey)},joinStats:${JSON.stringify(r.joinStats)},
joined:[${r.joined.map(J=>'\n'+JSON.stringify(J)).join(',')}]`;
  const old=fs.existsSync(out)?fs.readFileSync(out,'utf8'):'';
  if(!old.startsWith(head)){
    if(check){console.error('road-network.js is out of date (routes or joins): run npm run build:test && node tools/test/bake-roads.mjs');process.exit(1);}
    fs.writeFileSync(out,head+'};\n');for(const l of r.joinLog)console.log('  '+Object.entries(l).map(([k,v])=>k==='k'?v:k+' '+(Array.isArray(v)?v.join(','):v)).join(' · '));
    console.log('wrote the routes and joins:',r.roads.length,'roads,',r.roads.reduce((n,P)=>n+P.length,0),'points; routing and joining took',r.ms.route,'ms; kept as drawn:',JSON.stringify(r.fail),'; joins:',JSON.stringify(r.joinStats));
    execSync('npm run build:test',{cwd:root,stdio:'inherit'});}
  // 2. the uphill stretches of the baked network, on the desktop tier's graded ground (1280 x 800)
  page=await load('',{width:1280,height:800});
  const h=await page.evaluate(()=>({tier:Q.name,grid:W0.grid.n,baked:!!(W0.roadJoin&&W0.roadJoin.baked),key:W0.roadHillKey,runs:W0.roadHillRuns,st:W0.roadHill}));
  if(h.tier==='low'||!h.baked)throw Error('the desktop pass did not run at the desktop tier on the baked network: '+JSON.stringify({tier:h.tier,grid:h.grid,baked:h.baked}));
  const body=head+`,
/* the uphill stretches (roadHillSplit, terrain-roads.js) measured on the desktop tier's graded ground: per joined road, the [from, to] metres along it that are
   narrowed (null: a road no wider than a street). The low tier cuts there too. hillKey: the joins and the rules; the desktop tier warns when its ground disagrees. */
hillKey:${JSON.stringify(h.key)},
hill:${JSON.stringify(h.runs)}};
`;
  if(check){if(fs.readFileSync(out,'utf8')!==body){console.error('road-network.js is out of date (uphill stretches): run npm run build:test && node tools/test/bake-roads.mjs');process.exit(1);}console.log('road-network.js up to date');}
  else{fs.writeFileSync(out,body);console.log('wrote',path.relative(root,out),'with the uphill stretches:',h.st.pieces,'pieces,',h.st.metres,'m');}
}finally{await browser.close();}

// Preload for tools/plan/palatine_paths.mjs (node --import): puts PAL_PLAN.apE.draw (from ape_input.json) on the page once it is ready, so the
// repo's dump script reads the apE box, sections and probes. Nothing in the repo is changed.
import path from 'node:path';import fs from 'node:fs';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=process.env.ROOT,require=createRequire(path.join(root,'package.json')),pp=require('puppeteer');
const draw=JSON.parse(fs.readFileSync(path.join(here,'ape_input.json'),'utf8')).draw;
const js=`(function(){var D=${JSON.stringify(draw)};var t=setInterval(function(){try{if(window.__ready&&typeof PAL_PLAN!=='undefined'){if(!PAL_PLAN.apE)PAL_PLAN.apE={draw:D};clearInterval(t);}}catch(e){}},200);})();`;
const L=pp.launch.bind(pp);pp.launch=async(...a)=>{const b=await L(...a),N=b.newPage.bind(b);b.newPage=async()=>{const p=await N();await p.evaluateOnNewDocument(js);return p;};return b;};

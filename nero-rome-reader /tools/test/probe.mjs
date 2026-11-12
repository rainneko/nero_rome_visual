// Evaluate an expression in the built test page and print it as JSON. Usage: node tools/test/probe.mjs '<js expression>' [query]
// The expression runs after the page is ready, with W0 (the world) and every global in scope; wrap statements in (()=>{...})().
// The page is dist/test.html (npm run build:test first); query defaults to '?test'.
import puppeteer from 'puppeteer';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),expr=process.argv[2]||'Object.keys(W0.views)',q=process.argv[3]||'?test';
const b=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage();await p.setViewport({width:1280,height:720});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(root,'dist/test.html')+q,{timeout:0});await p.waitForFunction(()=>window.__ready||window.__err,{timeout:400000,polling:2000});
console.log(JSON.stringify(await p.evaluate(e=>(0,eval)(e),expr)));if(errs.length)console.error('page errors:',errs);await b.close();

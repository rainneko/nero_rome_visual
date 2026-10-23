#!/usr/bin/env node
// Build: concatenate the sources in build.config.json order, inline data and GLB models,
// and write one self-contained page (dist/index.html). `--test` also writes dist/test.html,
// which loads three.js from node_modules instead of the CDN (for headless checks).
import fs from 'node:fs';import {optimize} from './glbopt.mjs';import zlib from 'node:zlib';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const rd=p=>fs.readFileSync(path.join(root,p),'utf8');
const cfg=JSON.parse(rd('build.config.json'));
let js=cfg.order.map(f=>rd(f)+'\n').join('');
for(const[ph,file]of Object.entries(cfg.data))js=js.split(ph).join(rd(file).trim());
const glb=cfg.glb.map(([name,file])=>`const ${name}='${fs.readFileSync(path.join(root,file)).toString('base64')}';\n`).join('');
js=glb+js;
js=js.split('/*__COUNTER__*/\'\'').join(JSON.stringify(cfg.counter||''));
const page=rd(cfg.shell).split('/*__JS__*/').join(js);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/index.html'),page);
console.log('dist/index.html',(page.length/1e6).toFixed(2)+' MB');
// full text: dist/<book.out> sets window.BOOK = {title, author, intro, tags, vols, chs:[{n, t, v, p:[...]}], notes} (loaded on demand)
if(cfg.book&&fs.existsSync(path.join(root,cfg.book.src))){const B=cfg.book,lines=rd(B.src).split(/\r?\n/),chs=[],notes=[];let cur=null,inNotes=false;
  const head=/^\s*第\s*([0-9]+)\s*章\s*(.*)$/;
  for(const raw of lines){const t=raw.replace(/\[cite:[^\]]*\]/g,'').replace(/^[\s\u3000]+|[\s\u3000]+$/g,'');if(!t)continue;
    if(/^【注】/.test(t)){inNotes=true;continue;}
    if(inNotes){if(/^【\d+】/.test(t)){notes.push(t);continue;}break;}             // stop after the author's notes (drafts and working notes follow)
    const m=t.match(head);if(m){const n=+m[1];if(n>B.lastChapter)break;cur={n,t:m[2].trim(),v:B.vols.findIndex(v=>n>=v[1]&&n<=v[2]),p:[]};chs.push(cur);continue;}
    if(/^第[一二三四五六七八九十0-9]+卷/.test(t))continue;                      // volume lines come from cfg.book.vols
    if(cur)cur.p.push(t);}
  const words=chs.reduce((a,c)=>a+c.p.join('').replace(/[\s"“”‘’「」『』，。！？；：、…—（）《》\-]/g,'').length,0);
  const book={title:B.title,author:B.author,intro:B.intro,tags:B.tags,vols:B.vols.map(v=>v[0]),words,chs,notes};
  const out=`window.BOOK=${JSON.stringify(book)};if(window.bookLoaded)bookLoaded();\n`;fs.writeFileSync(path.join(root,'dist',B.out),out);
  console.log('dist/'+B.out,chs.length+' chapters',(words/1e4).toFixed(1)+' 万字',(out.length/1e6).toFixed(2)+' MB');}
// lazy model bundles (loaded by the page on demand): dist/<file> sets window[var]={name:base64} and calls window[cb]()
for(const L of cfg.lazy||[]){const dir=path.join(root,L.dir),names=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.glb')).sort():[];
  const body=names.map(f=>`${JSON.stringify(f.slice(0,-4))}:'${(L.optimize?zlib.gzipSync(optimize(fs.readFileSync(path.join(dir,f))),{level:9}):fs.readFileSync(path.join(dir,f))).toString('base64')}'`).join(',\n');
  const out=`window.${L.var}={${body}};${L.optimize?`window.${L.var}_gz=true;`:''}if(window.${L.cb})window.${L.cb}();\n`;fs.writeFileSync(path.join(root,'dist',L.file),out);console.log('dist/'+L.file,names.length+' models',(out.length/1e6).toFixed(2)+' MB');}
if(process.argv.includes('--test')){const three=path.join(root,'node_modules/three');if(!fs.existsSync(three)){console.error('npm install first (three@0.147.0 is a dev dependency)');process.exit(1);}
  const t=page.split(cfg.three.cdn).join('../node_modules/three/build/three.min.js').split(cfg.three.cdnGltf).join('../node_modules/three/examples/js/loaders/GLTFLoader.js').replace(/<link href="https:\/\/fonts.googleapis.com[^>]*>/g,'');
  fs.writeFileSync(path.join(root,'dist/test.html'),t);console.log('dist/test.html');}

#!/usr/bin/env node
// Build: concatenate the sources in build.config.json order, inline data and GLB models,
// and write one self-contained page (dist/index.html). `--test` also writes dist/test.html,
// which loads three.js from node_modules instead of the CDN (for headless checks).
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const rd=p=>fs.readFileSync(path.join(root,p),'utf8');
const cfg=JSON.parse(rd('build.config.json'));
let js=cfg.order.map(f=>rd(f)+'\n').join('');
for(const[ph,file]of Object.entries(cfg.data))js=js.split(ph).join(rd(file).trim());
const glb=cfg.glb.map(([name,file])=>`const ${name}='${fs.readFileSync(path.join(root,file)).toString('base64')}';\n`).join('');
js=glb+js;
const page=rd(cfg.shell).split('/*__JS__*/').join(js);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/index.html'),page);
console.log('dist/index.html',(page.length/1e6).toFixed(2)+' MB');
if(process.argv.includes('--test')){const three=path.join(root,'node_modules/three');if(!fs.existsSync(three)){console.error('npm install first (three@0.147.0 is a dev dependency)');process.exit(1);}
  const t=page.split(cfg.three.cdn).join('../node_modules/three/build/three.min.js').split(cfg.three.cdnGltf).join('../node_modules/three/examples/js/loaders/GLTFLoader.js').replace(/<link href="https:\/\/fonts.googleapis.com[^>]*>/g,'');
  fs.writeFileSync(path.join(root,'dist/test.html'),t);console.log('dist/test.html');}

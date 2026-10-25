// Isolated before/after regression scene: real production materials and lot geometry, no city boot.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import puppeteer from 'puppeteer';
const root=process.cwd(),out=path.join(root,'shots/arcades');fs.mkdirSync(out,{recursive:true});fs.mkdirSync('dist',{recursive:true});
const read=f=>fs.readFileSync(f,'utf8');
const setup=`
Q.msaa=0;renderer.setPixelRatio(1);renderer.setSize(1000,700);P.setSize(1000,700);camera.aspect=1000/700;camera.near=.5;camera.far=250;camera.updateProjectionMatrix();
const scene=new THREE.Scene();scene.background=new THREE.Color(.65,.62,.55);
const W={gy:()=>0,cols:{simple:[],cor:[],ion:[],dor:[]},scene};const g=new GB(1<<16),R=RNG(41);
const specs=[{x:-16,fl:2|16|512,seed:.281,loggiaA:false},{x:0,fl:2|16,seed:.281,loggiaA:true},{x:16,fl:2|16,seed:.055,loggiaA:false}];
for(const o of specs){const L=[[o.x-6,-5],[o.x+6,-5],[o.x+6,5],[o.x-6,5]];lotBuild(W,g,L,{part:0,seed:o.seed,sty:0,fl:o.fl,nSt:5,gH:3.9,sH:2.9,pitch:.3,lit:.6,flat:false,loggiaA:o.loggiaA,noSplit:true},R,null);}
scene.add(g.mesh(MAT.city));flushColumns(W);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,80).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x9e9586,roughness:1}));ground.position.y=-.05;ground.receiveShadow=true;scene.add(ground,sun,sun.target,hemi);
ENV.tod=.4;updateEnv(scene);U.uHaze.value.x=0;sun.position.set(-25,40,-35);sun.target.position.set(0,5,0);sun.target.updateMatrixWorld();sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:.5,far:150});sun.shadow.camera.updateProjectionMatrix();
camera.position.set(25,23,-52);camera.lookAt(0,7,0);settings.crystL=false;settings.cryst=false;settings.paint=false;
window.renderStudy=light=>{settings.crystL=light;P.render(scene,camera);};renderStudy(false);window.__studyReady=true;
`;
const errs=[],results=[];const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const watchdog=setTimeout(()=>browser.process()?.kill('SIGTERM'),90000);
try{for(const version of ['before','after']){
 const sources=['src/core/renderer.js','src/core/materials.js','src/world/builders.js','src/world/lots.js'].map(f=>version==='before'&&(f.includes('materials')||f.includes('lots'))?execFileSync('git',['show','HEAD:nero-rome-reader /'+f],{encoding:'utf8'}):read(f)).join('\n');
 const html=`<html><head><style>body{margin:0}canvas{display:block}#todv{display:none}</style></head><body><canvas id="gl"></canvas><span id="todv"></span><script src="../node_modules/three/build/three.min.js"></script><script>${sources}\n${setup}</script></body></html>`;
 const filename=path.join(root,`dist/arcades-${version}.html`);fs.writeFileSync(filename,html);
 const p=await browser.newPage();await p.setViewport({width:1000,height:700});p.on('pageerror',e=>errs.push(version+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(version+': '+m.text());});
 await p.goto('file://'+filename+'?test',{timeout:45000});await p.waitForFunction(()=>window.__studyReady,{timeout:45000});
 for(const light of [false,true]){await p.evaluate(light=>renderStudy(light),light);await p.screenshot({path:path.join(out,`${version}-${light?'crystal':'plain'}.png`)});}
 results.push(await p.evaluate(()=>({version:location.pathname,loggias:W.loggiaLog?.length||0,triangles:renderer.info.render.triangles,programs:renderer.info.programs.length})));await p.close();
}}finally{clearTimeout(watchdog);await browser.close();fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({results,errors:errs},null,2));}
console.log(JSON.stringify({results,errors:errs}));if(errs.length)process.exitCode=1;

// Real geometry regression: adjacent arcade openings must see across a corner,
// but a ray perpendicular to the facade must hit the inset room wall.
import fs from 'node:fs';import path from 'node:path';import puppeteer from 'puppeteer';
const root=process.cwd(),out=path.join(root,'shots/gallery-structure');fs.mkdirSync(out,{recursive:true});
const read=f=>fs.readFileSync(f,'utf8');
const sources=['src/core/renderer.js','src/core/materials.js','src/world/builders.js','src/world/lots.js'].map(read).join('\n');
const setup=`
Q.msaa=0;renderer.setPixelRatio(1);renderer.setSize(1100,750);P.setSize(1100,750);camera.aspect=1100/750;camera.near=.2;camera.far=500;camera.updateProjectionMatrix();
const scene=new THREE.Scene();scene.background=new THREE.Color(.55,.58,.58);const W={gy:()=>0,cols:{simple:[],cor:[],ion:[],dor:[]},scene,foot:{add(){}}};
const assertions=[];const add=g=>{const m=g.mesh(MAT.city);scene.add(m);return m;};
const sd=Array.from({length:90},(_,i)=>.01+i*.01).find(seed=>houseGalleryPlan([[-9,-5],[9,-5],[9,5],[-9,5]],{seed,nSt:6,fl:16,gH:4,sH:3,loggiaA:true}).some(x=>!x.wrap));
{
 const g=new GB(1<<16),L=[[-9,-5],[9,-5],[9,5],[-9,5]],o={part:0,seed:sd,sty:0,fl:2|16,nSt:6,gH:4,sH:3,pitch:.3,lit:.6,flat:false,loggiaA:true,noSplit:true};
 lotBuild(W,g,L,o,RNG(41),null);const m=add(g);scene.updateMatrixWorld(true);
 const log=W.houseGalleryLog.find(x=>x.wrap),partial=W.houseGalleryLog.find(x=>!x.wrap);
 const y=log.y+1.4,frontStep=18/Math.round(18/2.9)/2,sideStep=10/Math.round(10/2.9)/2;
 const origin=new THREE.Vector3(-9+frontStep,y,-5.3),end=new THREE.Vector3(-9.3,y,-5+sideStep),direction=end.clone().sub(origin),dist=direction.length();
 const cross=new THREE.Raycaster(origin,direction.normalize(),0,dist).intersectObject(m);
 const rearOrigin=new THREE.Vector3(-1.5,y,-5.3);const rear=new THREE.Raycaster(rearOrigin,new THREE.Vector3(0,0,1),0,4).intersectObject(m);
 assertions.push({name:'corner is actually open',pass:cross.length===0,hits:cross.map(x=>x.distance)});
 assertions.push({name:'physical rear wall within 2.2m',pass:rear.length>0&&rear[0].distance>1.3&&rear[0].distance<2.2,distance:rear[0]?.distance});
 assertions.push({name:'three-bay middle gallery below penultimate floor',pass:!!partial&&partial.y<log.y-3.1,partial,top:log.y});
 // Check the second infill code path uses the same geometry and not a shader mask.
 const g2=new GB(1<<15);houseRectWalls(W,g2,frame(23,0,0),0,0,12,10,-2,16.15,.15,{part:0,seed:.4,sty:0,fl:2|16|256,nSt:5,gH:4,sH:3,lit:.6});roof(g2,frame(23,0,0),'hip',0,0,12,10,16.15,.3,.4,.4);add(g2);
 assertions.push({name:'infill gallery generated',pass:W.houseGalleryLog.filter(x=>x.wrap).length===2});
 camera.position.set(28,24,-47);camera.lookAt(7,9,0);
}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,100).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x9e9586,roughness:1}));ground.position.y=-.05;ground.receiveShadow=true;scene.add(ground,sun,sun.target,hemi);
ENV.tod=.4;applyEnv();updateEnv(scene);U.uHaze.value.x=0;sun.position.set(-25,40,-35);sun.target.position.set(0,5,0);sun.target.updateMatrixWorld();sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:.5,far:180});sun.shadow.camera.updateProjectionMatrix();
settings.crystL=false;settings.cryst=false;settings.paint=false;window.renderStudy=light=>{settings.crystL=light;P.render(scene,camera);};renderStudy(false);window.__studyReady=true;
`;
fs.mkdirSync('dist',{recursive:true});const filename=path.join(root,'dist/gallery-structure.html');fs.writeFileSync(filename,`<html><head><style>body{margin:0}canvas{display:block}#todv{display:none}</style></head><body><canvas id="gl"></canvas><span id="todv"></span><script src="../node_modules/three/build/three.min.js"></script><script>${sources}\n${setup}</script></body></html>`);
const errors=[],results=[];const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});const timer=setTimeout(()=>browser.process()?.kill('SIGTERM'),90000);
try{for(const type of ['house']){const p=await browser.newPage();await p.setViewport({width:1100,height:750});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('file://'+filename+'?test#'+type,{timeout:45000});await p.waitForFunction(()=>window.__studyReady,{timeout:45000});
 for(const light of [false,true]){await p.evaluate(light=>renderStudy(light),light);await p.screenshot({path:path.join(out,type+'-'+(light?'crystal':'plain')+'.png')});}
 results.push({type,assertions:await p.evaluate(()=>assertions)});await p.close();
}}finally{clearTimeout(timer);await browser.close();fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({results,errors},null,2));}
console.log(JSON.stringify({results,errors}));if(errors.length||results.some(r=>r.assertions.some(a=>!a.pass)))process.exitCode=1;

// Construction asset review, separate from the reader's story chronology.
// Run after build:test and Blender exports: node tools/test/construction-stages.mjs
// All imagery stays in ignored renders/construction/. No deployment files are changed.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import puppeteer from 'puppeteer';
import {optimize} from '../glbopt.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'renders/construction');
const ids=['furnaceA','chem'], stages=['K0','K1','K2','K3'];
const data={};
for(const id of ids){data[id]={};for(const k of stages){const p=path.join(root,'assets/models/construction',id,k+'.glb');assert.ok(fs.existsSync(p),'Missing stage '+p);data[id][k]=optimize(fs.readFileSync(p)).toString('base64');}}
let source=fs.readFileSync(path.join(root,'dist/test.html'),'utf8');
assert.ok(source.includes('window.__ready=true;loop();'),'Unrecognized test boot');
source=source.replace('const TEST=/[?&]test/.test(location.search);','const TEST=true;').replace('window.__ready=true;loop();','window.__ready=true;')
 .replace('Q.dens=.8;Q.trees=.8;','Q.dens=1;Q.trees=1;')
 .replace("setTimeout(antLoadModels,TEST?0:6000)","setTimeout(()=>{},0)");
const reviewBoot=()=>{
 const ids=['furnaceA','chem'];
 const panel=document.createElement('div');panel.className='construction-ui';
 panel.innerHTML='<b>施工阶段审阅 · 设计推演</b><div><select id="cAsset"><option value="furnaceA">南岸高炉组</option><option value="chem">平炉／化工组</option></select> <select id="cCamera"><option value="three">三分之四视角</option><option value="plan">俯视</option><option value="detail">工艺近景</option><option value="hall">厂房近景</option></select></div><div id="cStages"></div><small>机位、季节与光照固定。K4／K5沿用现有完工模型；施工图不代表新增剧情年代。</small>';
 document.body.append(panel);
 const names=['场地测量','地基砌筑','主体／脚手架','封顶施工','现有完工','运转中'];
 names.forEach((n,i)=>{const b=document.createElement('button');b.textContent='K'+i+' '+n;b.dataset.stage='K'+i;b.onclick=()=>window.__construction.show(window.__construction.asset,'K'+i,document.querySelector('#cCamera').value);panel.querySelector('#cStages').append(b);});
 const C=window.__construction={asset:'furnaceA',stage:'K2',groups:{},cameras:{},bounds:{},errors:[],ready:false};
 C.show=(id,k,cam='three')=>{
  C.asset=id;C.stage=k;
  for(const a of ids){W0.layers[a].visible=true;for(const g of Object.values(C.groups[a]))g.visible=false;}
  for(const n of ['smokeA','smokeChem','smokeB'])W0.layers[n].visible=false;
  if(k==='K5')W0.layers[id==='furnaceA'?'smokeA':'smokeChem'].visible=true;
  if(C.groups[id][k]){W0.layers[id].visible=false;C.groups[id][k].visible=true;}
  const v=C.cameras[id][cam];camera.position.fromArray(v.pos);camera.lookAt(new THREE.Vector3().fromArray(v.tgt));camera.near=1;camera.far=20000;camera.aspect=innerWidth/innerHeight;camera.clearViewOffset();camera.updateProjectionMatrix();
  skyMesh.position.copy(camera.position);sun.shadow.needsUpdate=true;P.render(W0.scene,camera);
  document.querySelector('#cAsset').value=id;document.querySelector('#cCamera').value=cam;
  for(const b of panel.querySelectorAll('button'))b.classList.toggle('selected',b.dataset.stage===k);
  const limits=id==='furnaceA'?[-205,-51,-179,-111,36]:[-179,190,-168,-18,32],F=frB(-1190,2760,230,W0.gy(-1190,2760)),pixels=[];
  camera.updateMatrixWorld(true);
  for(const x of[limits[0],limits[1]])for(const z of[limits[2],limits[3]])for(const y of[-3.1,limits[4]]){const p=new THREE.Vector3().fromArray(F.p(x,y,z)).project(camera);pixels.push([(p.x*.5+.5)*innerWidth,(.5-p.y*.5)*innerHeight]);}
  const siteRect=[Math.max(0,Math.floor(Math.min(...pixels.map(p=>p[0]))-50)),Math.max(0,Math.floor(Math.min(...pixels.map(p=>p[1]))-50)),Math.min(innerWidth,Math.ceil(Math.max(...pixels.map(p=>p[0]))+50)),Math.min(innerHeight,Math.ceil(Math.max(...pixels.map(p=>p[1]))+50))];
  return{asset:id,stage:k,camera:cam,pos:camera.position.toArray(),tgt:v.tgt,siteRect,visibleStageGroups:Object.entries(C.groups[id]).filter(([,g])=>g.visible).map(([s])=>s),nativeVisible:W0.layers[id].visible};
 };
 const start=async()=>{
  if(!window.__ready||!window.__romeReady)return;
  clearInterval(timer);
  try{
   document.querySelector('#reader').classList.add('closed');settings.labels=false;settings.crystL=true;settings.cryst=settings.paint=false;
   renderer.setPixelRatio(1);resize();window.__shot(3,null,.3);
   // Wait for state-driven deferred visibility updates, then freeze every environmental input.
   await new Promise(r=>setTimeout(r,120));
   SEAS.t=SEAS.v=1;U.uSeason.value=1;U.uTime.value=20;P.comp.uniforms.time.value=20;ENV.weather='clear';ENV.smog=0;ENV.tod=.3;setEnv();updateEnv(W0.scene);todT=camT=null;
   const F=frB(-1190,2760,230,W0.gy(-1190,2760));C.frame={origin:[F.ox,F.oy,F.oz],rotationY:F.rot};
   const loader=new THREE.GLTFLoader();
   const stageMaterial=mt=>{
    const original=mt.name;
    mt.name=({workbrick:'brick',redbrick:'brick',refractory:'stone',timber:'wood',woodraw:'wood',plank:'wood',mortar:'tuff'})[original]||original;
    romeMat(mt); // Match the reader's atmosphere and material pattern pipeline.
    if(['workbrick','redbrick'].includes(original))mt.color.setRGB(.26,.17,.105);
    if(['tile','tile2'].includes(original))mt.color.setRGB(.27,.16,.09);
    if(['timber','woodraw','plank'].includes(original))mt.color.setRGB(.16,.105,.055);
   };
   for(const id of ids){
    C.groups[id]={};C.bounds[id]={};W0.layers[id].updateMatrixWorld(true);
    const B=new THREE.Box3().setFromObject(W0.layers[id]),center=B.getCenter(new THREE.Vector3()),size=B.getSize(new THREE.Vector3());
    // Freeze the completed asset camera before loading any stage (never fit individual stages).
    center.set(...center.toArray().map(Math.round));size.set(...size.toArray().map(Math.round));
    const dist=size.length()/2/Math.tan(19*DEG)*.8*1.1,tgt=[center.x,center.y-size.y*.3,center.z];
    C.cameras[id]={};for(const [name,el] of [['three',30],['plan',70]]){
     const yaw=35*DEG,pitch=el*DEG;C.cameras[id][name]={tgt,pos:[tgt[0]+dist*Math.sin(yaw)*Math.cos(pitch),tgt[1]+dist*Math.sin(pitch),tgt[2]+dist*Math.cos(yaw)*Math.cos(pitch)]};
    }
    for(const name of ['detail','hall']){
     const q=id==='furnaceA'?F.p(-110,10,-150):F.p(name==='detail'?-145:60,10,name==='detail'?-40:-118),d=id==='furnaceA'?105:125;
     const yaw=35*DEG,pitch=30*DEG;C.cameras[id][name]={tgt:q,pos:[q[0]+d*Math.sin(yaw)*Math.cos(pitch),q[1]+d*Math.sin(pitch),q[2]+d*Math.cos(yaw)*Math.cos(pitch)]};
    }
    const prepared=new Set();
    for(const [stage,encoded] of Object.entries(window.CONSTRUCTION_DATA[id])){
     const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
     const gltf=await new Promise((ok,bad)=>loader.parse(bytes.buffer,'',ok,bad)),G=gltf.scene;
     const local=new THREE.Box3().setFromObject(G);let triangles=0;
     G.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count*3;i++)if(!Number.isFinite(p.array[i]))throw Error('Non-finite vertex '+id+'/'+stage);triangles+=(o.geometry.index?o.geometry.index.count:p.count)/3;for(const mt of(Array.isArray(o.material)?o.material:[o.material]))if(!prepared.has(mt)){stageMaterial(mt);prepared.add(mt);}o.castShadow=o.receiveShadow=true;});
     C.bounds[id][stage]={min:local.min.toArray(),max:local.max.toArray(),triangles,bytes:bytes.length};
     G.name=id+'@'+stage;G.position.set(F.ox,F.oy,F.oz);G.rotation.y=F.rot;G.visible=false;W0.scene.add(G);C.groups[id][stage]=G;
    }
   }
   C.ready=true;document.getElementById('loading').classList.add('gone');C.show('furnaceA','K2');
   document.querySelector('#cAsset').onchange=e=>C.show(e.target.value,C.stage,document.querySelector('#cCamera').value);
   document.querySelector('#cCamera').onchange=e=>C.show(C.asset,C.stage,e.target.value);
   window.addEventListener('resize',()=>{resize();C.show(C.asset,C.stage,document.querySelector('#cCamera').value);});
  }catch(e){C.errors.push(e.message);console.error(e);panel.append('失败：'+e.message);}
 };
 const timer=setInterval(start,200);
};
const style='<style>body *{visibility:hidden!important}#gl,.construction-ui,.construction-ui *{visibility:visible!important}#dock,#reader,#labels,#topbar,#ledgers,#timebar,.hud{display:none!important}.construction-ui{position:fixed;z-index:100000;left:16px;top:16px;max-width:450px;padding:16px;color:#fff3da;background:#392b22e8;border:1px solid #b59465;border-radius:10px;font:14px system-ui}.construction-ui div{margin-top:10px}.construction-ui small{display:block;margin-top:8px;color:#d5c4a6}.construction-ui button,.construction-ui select{margin:3px;padding:7px;background:#67503c;color:white;border:1px solid #b39870;border-radius:4px}.construction-ui button.selected{background:#9b4c2d}html.construction-shot .construction-ui{display:none}</style>';
source=source.replace('<head>','<head><base href="../../dist/">'+style).replace('</body>',`<script>window.CONSTRUCTION_DATA=${JSON.stringify(data)};(${reviewBoot.toString()})();</script></body>`);
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'review.html'),source);
const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const errors=[];
try{
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message);});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text().slice(0,500));console.log('CONSOLE',m.text().slice(0,200));}});
 await page.goto(pathToFileURL(path.join(out,'review.html')).href+'?test',{timeout:60000});
 await page.waitForFunction(()=>window.__construction?.ready||window.__construction?.errors.length||window.__err,{timeout:240000});
 const audit=await page.evaluate(()=>{const C=window.__construction;return{ready:C.ready,errors:C.errors,frame:C.frame,cameras:C.cameras,bounds:C.bounds,environment:{tod:ENV.tod,season:U.uSeason.value,time:U.uTime.value,crystL:settings.crystL},existingRise:{furnaceA:W0.layers.furnaceA.userData.rise,chem:W0.layers.chem.userData.rise}};});
 assert.ok(audit.ready,JSON.stringify(audit.errors));assert.equal(errors.length,0,errors.join('\n'));
 assert.deepEqual(audit.existingRise,{furnaceA:26,chem:20},'Original story animation configuration preserved');
 assert.ok(Math.abs(audit.frame.rotationY+50*Math.PI/180)<1e-7,'Native frame orientation');
 const limit={furnaceA:{x:[-205,-51],z:[-179,-111],height:35.5,budget:40000},chem:{x:[-179,190],z:[-168,-18],height:32,budget:60000}};
 for(const id of ids)for(const[k,B]of Object.entries(audit.bounds[id])){const L=limit[id];assert.ok(B.triangles>0&&B.triangles<=L.budget,id+'/'+k+' triangle budget');assert.ok(B.min[0]>=L.x[0]&&B.max[0]<=L.x[1]&&B.min[2]>=L.z[0]&&B.max[2]<=L.z[1],id+'/'+k+' native footprint: '+JSON.stringify(B));assert.ok(B.min[1]>=-3.1&&B.max[1]<=L.height,id+'/'+k+' height');}
 await page.evaluate(()=>document.documentElement.classList.add('construction-shot'));
 audit.frames=[];
 for(const id of ids)for(const cam of (process.env.CONSTRUCTION_DETAIL?['detail','hall']:['three','plan','detail','hall'])){
  const ks=process.env.CONSTRUCTION_QUICK?['K2','K4']:(cam==='detail'||cam==='hall')?['K2','K3']:['K0','K1','K2','K3','K4','K5'];
  for(const k of ks){const f=await page.evaluate(({id,k,cam})=>window.__construction.show(id,k,cam),{id,k,cam});assert.deepEqual(f.pos,audit.cameras[id][cam].pos,'Fixed camera');assert.equal(f.nativeVisible,k==='K4'||k==='K5','Native hidden for construction');assert.equal(f.visibleStageGroups.length,k==='K4'||k==='K5'?0:1,'Only one stage');const name=k+(cam==='three'?'':'-'+cam)+'.png';await page.screenshot({path:path.join(out,id,name)});audit.frames.push({...f,file:id+'/'+name});console.log('FRAME',id,name);}
 }
 audit.errors=errors;fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(audit,null,2));console.log('PASS: stage isolation, native footprints, scale, fixed cameras, finite geometry, triangle budgets.');
}catch(e){fs.writeFileSync(path.join(out,'error.json'),JSON.stringify({message:e.message,errors},null,2));throw e;}finally{await browser.close();}
console.log('Review:',path.join(out,'review.html'));

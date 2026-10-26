#!/usr/bin/env node
// Record camera shots of the city as video files. The page runs on a virtual clock: each frame advances
// exactly 1/fps, so camera moves, water, smoke and rising story layers keep their speed however slow the
// render is. Shot lists and options: tools/video/README.md.
//
//   node tools/video/record.mjs tools/video/shots/smoke.json [--only a,b] [--out DIR] [--preview] [--stills] [--png] [--keep-frames]
//   node tools/video/record.mjs --list-views
import puppeteer from 'puppeteer';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {spawn,spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const argv=process.argv.slice(2),flag=k=>argv.includes('--'+k),opt=k=>{const i=argv.indexOf('--'+k);return i>=0?argv[i+1]:null;};
const listFile=argv.find((a,i)=>!a.startsWith('--')&&!['--only','--out','--site'].includes(argv[i-1]));
const outDir=path.resolve(opt('out')||path.join(os.homedir(),'NeroRome-video/footage'));
const site=opt('site')?path.resolve(opt('site')):root;   // --site: another checkout to film (an older commit, another branch), built with build:test
const page0=path.join(site,'dist/test.html');   // test.html = index.html with three.js from node_modules; without ?test it runs at full quality
if(!fs.existsSync(page0)){console.error('Build first: npm run build:test'+(opt('site')?' in '+site:''));process.exit(1);}
const ffmpeg=spawnSync('ffmpeg',['-version']).status===0;
// x264 in BT.709 and tagged so: by default ffmpeg writes BT.601 untagged, which players read as 709 (colours shift).
// JPEG frames are BT.601 YCbCr, so they go through RGB first.
const x264=w=>['-vf','format=rgb24,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p',
  '-c:v','libx264','-preset','slow','-crf',w>2000?'18':'16','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv','-movflags','+faststart'];
// Without ffmpeg, macOS encodes with AVFoundation: tools/video/encode.m, compiled once into the user cache.
function macEncoder(){if(process.platform!=='darwin')return null;const src=path.join(root,'tools/video/encode.m'),bin=path.join(os.homedir(),'Library/Caches/nero-rome-video/encode');
  if(fs.existsSync(bin)&&fs.statSync(bin).mtimeMs>=fs.statSync(src).mtimeMs)return bin;fs.mkdirSync(path.dirname(bin),{recursive:true});
  const r=spawnSync('clang',['-fobjc-arc','-O2',src,'-framework','AVFoundation','-framework','CoreMedia','-framework','CoreVideo','-framework','ImageIO','-framework','CoreGraphics','-framework','Foundation','-o',bin],{encoding:'utf8'});
  if(r.status!==0){console.warn('Could not build the AVFoundation encoder:',(r.stderr||'').trim().split('\n')[0]);return null;}return bin;}
const avf=ffmpeg?null:macEncoder();

/* ---------- shot list ---------- */
const DEG=Math.PI/180,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t;
const EASE={linear:u=>u,in:u=>u*u*u,out:u=>1-(1-u)**3,inOut:u=>u<.5?4*u*u*u:1-(-2*u+2)**3/2};
let L={fps:30,width:1920,height:1080,scale:1,defaults:{},shots:[]};
if(listFile){L={...L,...JSON.parse(fs.readFileSync(listFile,'utf8'))};}
if(flag('preview'))Object.assign(L,{fps:10,width:1280,height:720,scale:1});   // the page drops to its low-quality profile below 700 px height
const only=opt('only')?opt('only').split(','):null;
const shots=L.shots.map(s=>({...L.defaults,...s})).filter(s=>!only||only.includes(s.name));
if(listFile&&!shots.length){console.error('No shots to record.');process.exit(1);}

// A value is a number, a list of values spread evenly over the shot, or a list of [seconds, value] pairs.
function track(v,dur){if(v==null)return()=>null;if(typeof v==='number')return()=>v;
  const K=Array.isArray(v[0])?v.map(([t,x])=>[t,x]):v.map((x,i)=>[v.length>1?dur*i/(v.length-1):0,x]);
  return t=>{if(t<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++)if(t<=K[i][0]){const[a,x]=K[i-1],[b,y]=K[i],u=(t-a)/Math.max(1e-6,b-a);return lerp(x,y,EASE.inOut(u));}return K[K.length-1][1];};}
// The same without blending: the value of the last key reached (construction stages).
function steps(v){if(v==null)return()=>null;if(typeof v==='number')return()=>v;return t=>{let k=v[0][1];for(const[a,x]of v)if(t>=a)k=x;return k;};}

// Camera keyframes live in the reader's own view space (target, distance, yaw, pitch), as flyTo does.
function key(k,{views,boxes}){
  if(k.layer){const b=boxes[k.layer];if(!b)throw new Error('Unknown or empty layer '+k.layer+' (see --list-layers)');   // frame a story layer from its bounding box
    const r=Math.hypot(...b.s)/2;return{tgt:[b.c[0],b.c[1]-b.s[1]*.3+(k.lift||0),b.c[2]],dist:r/Math.tan(19*DEG)*.8*(k.fit||1),yaw:(k.az??35)*DEG,pitch:(k.el??32)*DEG};}
  if(k.ground){const g=[k.ground[0],k._gy+(k.lift||0),k.ground[1]];return{tgt:g,dist:k.dist||60,yaw:(k.az??35)*DEG,pitch:(k.el??32)*DEG};}   // a point on the terrain
  let pos=k.pos,tgt=k.tgt;if(k.view){const V=views[k.view];if(!V)throw new Error('Unknown view '+k.view+' (see --list-views)');pos=pos||V.pos;tgt=tgt||V.tgt;}
  const d=[pos[0]-tgt[0],pos[1]-tgt[1],pos[2]-tgt[2]],dist=Math.hypot(...d);
  return{tgt:[tgt[0],tgt[1]+(k.lift||0),tgt[2]],dist:dist*(k.zoom||1),yaw:Math.atan2(d[0],d[2])+(k.yaw||0)*DEG,pitch:clamp(Math.asin(d[1]/dist)+(k.pitch||0)*DEG,-1.2,1.5)};}
const cr=(p0,p1,p2,p3,u)=>.5*(2*p1+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u);   // Catmull-Rom
function camPath(s,views){const K=(s.path||[]).map(k=>key(k,views));if(!K.length)throw new Error(s.name+': path needs at least one keyframe');
  for(let i=1;i<K.length;i++){let d=K[i].yaw-K[i-1].yaw;d=Math.atan2(Math.sin(d),Math.cos(d));K[i].yaw=K[i-1].yaw+d;}   // turn the short way round
  const at=(s.path||[]).map((k,i)=>k.at??(K.length>1?i/(K.length-1):0)),ease=EASE[s.ease||'inOut'];
  return u0=>{const u=ease(clamp(u0,0,1));let i=0;while(i<K.length-2&&u>at[i+1])i++;const j=Math.min(i+1,K.length-1),w=j===i?0:clamp((u-at[i])/Math.max(1e-6,at[j]-at[i]),0,1);
    const g=n=>K[clamp(n,0,K.length-1)],f=sel=>cr(sel(g(i-1)),sel(g(i)),sel(g(j)),sel(g(j+1)),w);
    const orbit=(s.orbit||0)*DEG*(u-.5),push=lerp(1,s.push||1,u);
    return{tgt:[0,1,2].map(c=>f(k=>k.tgt[c])),dist:Math.exp(f(k=>Math.log(k.dist)))*push,yaw:f(k=>k.yaw)+orbit,pitch:f(k=>k.pitch)};};}

/* ---------- page ---------- */
// Installed before any page script runs: performance.now and requestAnimationFrame switch to a virtual clock on start().
const virtualClock=()=>{const real=performance.now.bind(performance),raf=window.requestAnimationFrame.bind(window),q=[];let on=false,vt=0;
  performance.now=()=>on?vt:real();window.requestAnimationFrame=cb=>{if(on){q.push(cb);return q.length;}return raf(cb);};
  window.__vclock={start(){vt=real();on=true;},step(ms){vt+=ms;const cbs=q.splice(0);for(const cb of cbs)cb(vt);return cbs.length;}};};

// Runs in the page. W0, view, SEAS, ENV, U, camT, todT ... are the reader's globals (src/ui/app.js).
function pageApi(){
  const hide=document.createElement('style');hide.textContent='body *{visibility:hidden!important}';document.head.appendChild(hide);
  const c=renderer.domElement;c.style.setProperty('visibility','visible','important');c.style.position='fixed';c.style.left='0';c.style.top='0';c.style.zIndex='99999';
  settings.labels=false;const rd=document.getElementById('reader');if(rd)rd.classList.add('closed');
  let envTod=-1,envSmog=-1,fps=30;const sunAz0=ENV.sunAz;
  window.__rec={
    setup(o){fps=o.fps;setPerfMode('fine');if(o.scale&&o.scale!==1)renderer.setPixelRatio(o.scale);resize();
      __vclock.start();SEAS.lock=TXT.lock=1e15;},
    views(){const out={};for(const[k,v]of Object.entries(W0.views))out[k]={n:v.n,pg:v.pg||'rome',pos:v.pos,tgt:v.tgt};return out;},
    boxes(){const out={},B=new THREE.Box3(),T=new THREE.Box3();   // instanced columns and trees are left out: r147 boxes them at the origin
      for(const[k,G]of Object.entries(W0.layers)){B.makeEmpty();G.updateMatrixWorld(true);G.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();T.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);B.union(T);});
        if(!B.isEmpty())out[k]={c:B.getCenter(new THREE.Vector3()).toArray().map(Math.round),s:B.getSize(new THREE.Vector3()).toArray().map(Math.round)};}return out;},
    async shot(s){if(s.page&&s.page!==PAGE){if(s.page==='antium'&&typeof antLoadModels==='function'){antLoadModels();const t0=Date.now();while(!window.__antReady&&Date.now()-t0<120000)await new Promise(r=>setTimeout(r,500));}PAGE=s.page;pagesUI();}
      clock.elapsedTime=s.clock||0;clock.oldTime=performance.now();   // every shot starts at the same animation time, so a re-render matches frame for frame
      setState(s.state??0,{instant:true});todT=null;camT=null;for(const k in W0.layers){W0.layers[k].position.y=0;delete W0.layers[k].userData.r0;for(const c of W0.layers[k].children)if(c.userData.y0!=null)c.position.y=c.userData.y0;}
      for(const k of s.hide||[])if(W0.layers[k])W0.layers[k].visible=false;for(const k of s.show||[])if(W0.layers[k])W0.layers[k].visible=true;
      if(s.weather)ENV.weather=s.weather;if(typeof s.smog==='number')ENV.smog=s.smog;envTod=-1;envSmog=-1;
      ENV.sunAz=s.sunAz??sunAz0;W0.fx={};   // the reader keeps the sun in the east-north-east at every hour; afternoon shots set it in the west
      if(typeof consApply==='function'){applyGates();const t0=Date.now();while(CONS.load&&CONS.load<3&&Date.now()-t0<60000)await new Promise(r=>setTimeout(r,200));}},   // construction stage models (construction-assets.js)
    ground(pts){return pts.map(p=>W0.gy(p[0],p[1]));},
    event(e){if(e.state!=null){setState(e.state,{instant:!e.rise});camT=null;if(e.ownTod)todT=null;}if(e.weather)ENV.weather=e.weather;if(e.smog!=null)ENV.smog=e.smog;},   // without a tod track the state's own light change plays
    frame(f){if(f.season!=null){const v=((f.season%4)+4)%4;SEAS.t=SEAS.v=v;U.uSeason.value=v;}
      if(f.smog!=null){ENV.smog=f.smog;if(f.tod==null)setEnv();}
      if(f.tod!=null){ENV.tod=f.tod;setEnv();}
      if(f.sky!=null){if(f.tod==null)setEnv();SKY.uZen.value.lerp(new THREE.Color(.13,.34,.78),f.sky);SKY.uHor.value.lerp(new THREE.Color(.62,.76,.93),f.sky*.55);   // the reader's clear sky is pale
        U.uSkyRefl.value.copy(SKY.uHor.value).lerp(SKY.uZen.value,.3);}
      Object.assign(W0.fx,f.fx);   // effect parameters read by the layers (balloonFill, rig, crowdCheer in src/scenes/rome/layers.js)
      if((f.tod!=null&&Math.abs(f.tod-envTod)>.004)||(f.smog!=null&&Math.abs(f.smog-envSmog)>.02)){updateEnv(W0.scene);envTod=f.tod??envTod;envSmog=f.smog??envSmog;}
      for(const k in f.layerY||{})for(const c of W0.layers[k]?.children||[]){c.userData.y0??=c.position.y;c.position.y=c.userData.y0+f.layerY[k];}   // children: some layers move their own group (the balloon bobs)
      for(const id in f.stages||{}){const C=typeof CONS!=='undefined'&&CONS.ids[id];if(!C)continue;const k=f.stages[id];C.goal=k;if(C.cur!==k)consShow(id,k,C.cur!=null&&k>C.cur);}   // goal = shown stage, so the reader's own build animation stays put
      view.tgt.set(...f.tgt);view.dist=f.dist;view.yaw=f.yaw;view.pitch=f.pitch;camT=null;
      return __vclock.step(f.dt??1000/fps);}};}

/* ---------- output ---------- */
function freeBytes(dir){try{const s=fs.statfsSync(dir);return s.bavail*s.bsize;}catch(e){return Infinity;}}
function writer(name,w,h,fps){const base=path.join(outDir,name);
  if(ffmpeg&&!flag('keep-frames')){const p=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','-',...x264(w),base+'.mp4'],{stdio:['pipe','inherit','inherit']});
    const done=new Promise((ok,bad)=>p.on('close',c=>c===0?ok(base+'.mp4'):bad(new Error('ffmpeg exited '+c))));
    return{put:buf=>new Promise(ok=>p.stdin.write(buf)?ok():p.stdin.once('drain',ok)),end:()=>{p.stdin.end();return done;}};}
  if(avf&&!flag('keep-frames')){const p=spawn(avf,[base+'.mp4',String(fps),'--stdin'],{stdio:['pipe','ignore','inherit']}),len=Buffer.alloc(4);   // frames as 4-byte length + image
    const done=new Promise((ok,bad)=>p.on('close',c=>c===0?ok(base+'.mp4'):bad(new Error('encoder exited '+c))));
    return{put:async buf=>{len.writeUInt32BE(buf.length);p.stdin.write(len);if(!p.stdin.write(buf))await new Promise(ok=>p.stdin.once('drain',ok));},end:()=>{p.stdin.end();return done;}};}
  fs.mkdirSync(base,{recursive:true});let n=0;const ext=flag('png')?'png':'jpg';
  return{put:async buf=>{fs.writeFileSync(path.join(base,String(n++).padStart(5,'0')+'.'+ext),buf);},
    end:async()=>{const ff=`ffmpeg -y -framerate ${fps} -i "${base}/%05d.${ext}" ${x264(w).map(a=>a.includes('=')?`'${a}'`:a).join(' ')} "${base}.mp4"`;
      const cmd=ffmpeg?ff:avf?`"${avf}" "${base}.mp4" ${fps} --dir "${base}"`:'# install ffmpeg, then: '+ff;
      fs.writeFileSync(base+'.encode.sh',cmd+'\n');return base+'/ (frames; encode with '+path.basename(base)+'.encode.sh)';}};}

/* ---------- run ---------- */
fs.mkdirSync(outDir,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--allow-file-access-from-files']});
try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:L.width,height:L.height,deviceScaleFactor:L.scale});
  await page.evaluateOnNewDocument(virtualClock);
  await page.goto('file://'+page0,{timeout:0});
  const t0=Date.now();await page.waitForFunction(()=>window.__ready||window.__err,{timeout:300000,polling:1000});
  await page.waitForFunction(()=>window.__romeReady,{timeout:180000,polling:1000}).catch(()=>console.warn('Rome models still loading; recording with stand-ins'));
  console.log('city ready in',Math.round((Date.now()-t0)/1000),'s',errors.length?'page errors: '+errors.join(' | '):'');
  await page.evaluate(pageApi);await page.evaluate(o=>__rec.setup(o),{fps:L.fps,scale:L.scale});await new Promise(r=>setTimeout(r,400));   // let the last real-time frame pass
  const scene={views:await page.evaluate(()=>__rec.views()),boxes:await page.evaluate(()=>__rec.boxes())};
  if(flag('list-layers')){for(const[k,b]of Object.entries(scene.boxes))console.log(k.padEnd(14),'centre',JSON.stringify(b.c),'size',JSON.stringify(b.s));process.exit(0);}
  if(flag('list-views')||!listFile){for(const[k,v]of Object.entries(scene.views))console.log(k.padEnd(14),(v.pg||'').padEnd(7),v.n||'','pos',JSON.stringify(v.pos),'tgt',JSON.stringify(v.tgt));process.exit(0);}

  {const G=shots.flatMap(s=>(s.path||[]).filter(k=>k.ground)),h=await page.evaluate(p=>__rec.ground(p),G.map(k=>k.ground));G.forEach((k,i)=>k._gy=h[i]);}
  for(const s of shots){const dur=s.seconds||6,fps=L.fps,frames=flag('stills')?(s.stills??3):Math.max(1,Math.round(dur*fps)),cam=camPath(s,scene),season=track(s.season,dur),tod=track(s.tod,dur),
      smog=track(typeof s.smog==='number'?null:s.smog,dur),layerY=Object.entries(s.layerY||{}).map(([k,v])=>[k,track(v,dur)]),stages=Object.entries(s.stages||{}).map(([k,v])=>[k,steps(v)]),
      fx=Object.entries(s.fx||{}).map(([k,v])=>[k,track(v,dur)]),sky=track(s.sky,dur);
    const w=Math.round(L.width*L.scale),h=Math.round(L.height*L.scale),need=frames*w*h*(flag('png')?1.6:.35);
    if((flag('keep-frames')||!(ffmpeg||avf))&&!flag('stills')&&need>freeBytes(outDir)-2e9){console.error(`${s.name}: about ${(need/1e9).toFixed(1)} GB of frames would not fit on the disk; drop --keep-frames, install ffmpeg or shorten the shot.`);continue;}
    await page.evaluate(s=>__rec.shot(s),s);
    const events=(s.events||[]).slice().sort((a,b)=>a.t-b.t);let ev=0;
    const at=t=>({...cam(Math.min(1,t/(s.moveFor||dur))),season:season(t),tod:tod(t),smog:smog(t),layerY:Object.fromEntries(layerY.map(([k,f])=>[k,f(t)])),stages:Object.fromEntries(stages.map(([k,f])=>[k,f(t)])),fx:Object.fromEntries(fx.map(([k,f])=>[k,f(t)])),sky:sky(t)});   // moveFor: the camera arrives then and holds
    for(let k=0;k<(s.warmup??8);k++)await page.evaluate(f=>__rec.frame(f),{...at(0),dt:0});   // shaders, shadow maps and textures settle before frame 0
    const out=flag('stills')?null:writer(s.name,w,h,fps),T=Date.now();let tPrev=0;
    for(let i=0;i<frames;i++){const t=flag('stills')?(frames>1?dur*i/(frames-1):0):i/fps;
      while(ev<events.length&&events[ev].t<=t)await page.evaluate(e=>__rec.event(e),{...events[ev++],ownTod:s.tod!=null});
      if(flag('stills')&&t>tPrev){for(let k=0;k<Math.ceil((t-tPrev)*4);k++)await page.evaluate(f=>__rec.frame(f),{...at(t),dt:250});}   // stills still let rising layers and flights finish
      const ran=await page.evaluate(f=>__rec.frame(f),{...at(t),dt:flag('stills')?0:undefined});if(!ran)throw new Error('render loop stopped');tPrev=t;
      const buf=await page.screenshot({type:flag('png')?'png':'jpeg',quality:flag('png')?undefined:95,optimizeForSpeed:true});
      if(out)await out.put(buf);else fs.writeFileSync(path.join(outDir,frames===1?`${s.name}.jpg`:frames===3?`${s.name}_${['start','mid','end'][i]}.jpg`:`${s.name}_${i}.jpg`),buf);
      if(i%30===29)process.stdout.write(`\r${s.name}: ${i+1}/${frames} frames, ${((Date.now()-T)/(i+1)/1000).toFixed(2)} s/frame`);}
    const where=out?await out.end():outDir;
    fs.writeFileSync(path.join(outDir,s.name+'.json'),JSON.stringify({shot:s,fps,frames,width:w,height:h,keys:[0,.25,.5,.75,1].map(u=>({u,...cam(u)}))},null,1));
    console.log(`\r${s.name}: ${frames} frames in ${Math.round((Date.now()-T)/1000)} s -> ${where}`);}
  if(errors.length)console.warn('page errors:',errors.join(' | '));
}finally{await browser.close();}

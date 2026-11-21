// The first-person walk (src/ui/fp.js) in headless Chromium: enter on the Palatine, walk, look, take pictures.
// Usage: npm run build && GPU=1 node tools/test/fp-walk.mjs [steps.json] [outDir]
//   without steps.json: the standing check (enter, walk a loop, the three kinds of figures, plants; exit 1 when something fails).
//   steps.json: [{"enter":[x,z]} | {"look":[yaw,pitch]} | {"key":"w","ms":3000} | {"goto":[x,z],"ms":15000} | {"climb":1} | {"meet":"g"|"f"|"s"|"lawn","post":true,"d":3.2} | {"wait":ms} | {"shot":"name.png"} | {"map":"name.png"} |
//                {"js":"code run in the page"} | {"tod":0.4} | {"season":0..3} | {"state":n}]
//   {"map"} draws the height grid the walker stands on: green walkable (brighter = higher), red a step too high, black a wall, blue a drop, magenta unknown;
//   yellow the walker, red / orange / white the guards, freedmen and senators.
// GPU=1 uses the Mac's GPU (Metal); without it the software renderer, which is slow (a frame takes seconds; the walk is then stepped by hand).
import puppeteer from 'puppeteer';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const stepsFile=process.argv[2]&&process.argv[2].endsWith('.json')?process.argv[2]:null,outDir=path.resolve(root,process.argv[stepsFile?3:2]||'shots/fp');fs.mkdirSync(outDir,{recursive:true});
const GPU=!!process.env.GPU,b=await puppeteer.launch({headless:'new',args:[...(GPU?['--enable-gpu','--use-angle=metal']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']),'--allow-file-access-from-files','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:1280,height:720});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
await p.goto('file://'+path.join(root,'dist/'+(process.env.PAGE||'index.html')),{timeout:0});
const t0=Date.now();while(Date.now()-t0<400000){if(await p.evaluate(()=>!!(window.__ready||window.__err)))break;await new Promise(r=>setTimeout(r,1000));}
console.log('boot',((Date.now()-t0)/1000).toFixed(0)+'s');
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),frames=n=>p.evaluate(n=>new Promise(r=>{const f0=window.__frames,t=setInterval(()=>{if(window.__frames-f0>=n){clearInterval(t);r();}},30);}),n);
const state=()=>p.evaluate(()=>window.__fp.state());
const mapPng=()=>p.evaluate(()=>{const F=window.__fp,M=F.FPM,N=512,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),im=g.createImageData(N,N),f=F.FP.g;
  for(let c=0;c<N*N;c++){const t=M.top[c],o=c*4,d=t-f;let r,gg,bb;if(t<-1e8){r=255;gg=0;bb=255;}else if(d>1.2){r=gg=bb=30;}else if(d>.5){r=200;gg=60;bb=40;}else if(d<-.75){r=30;gg=60+Math.max(0,90+d*6);bb=160;}else{const v=140+d*150;r=v*.6;gg=v;bb=v*.6;}
    im.data[o]=r;im.data[o+1]=gg;im.data[o+2]=bb;im.data[o+3]=255;}g.putImageData(im,0,0);
  for(const a of F.FPN.list){g.fillStyle=a.k[0]==='g'?'#f00':a.k[0]==='s'&&'cpy'.includes(a.k[1]||'c')?'#fff':a.k[0]==='p'||a.k==='vv'?'#f0f':a.k[0]==='e'?'#0ff':'#fa0';g.fillRect((a.x-M.x0)/M.cs-2,(a.z-M.z0)/M.cs-2,5,5);}
  const px=(F.FP.x-M.x0)/M.cs,pz=(F.FP.z-M.z0)/M.cs;g.fillStyle='#ff0';g.fillRect(px-3,pz-3,7,7);g.strokeStyle='#ff0';g.beginPath();g.moveTo(px,pz);g.lineTo(px-Math.sin(F.FP.yaw)*24,pz-Math.cos(F.FP.yaw)*24);g.stroke();return cv.toDataURL('image/png');});
const save=(name,url)=>{fs.writeFileSync(path.join(outDir,name),Buffer.from(url.split(',')[1],'base64'));console.log('saved',path.join(outDir,name));};
async function run(s){
  if(s.enter!==undefined){   // the walk waits for the models by itself; here the wait is done first, so that the time printed is the landing alone
    const tw=Date.now();while(Date.now()-tw<120000&&!await p.evaluate(()=>!!window.__romeReady||!ROME.GLB.length))await sleep(300);
    const r=await p.evaluate(a=>{const t=performance.now(),ok=a?window.__fp.enter(a[0],a[1]):window.__fp.enter();return{ok,ms:Math.round(performance.now()-t),st:window.__fp.state()};},s.enter);console.log('enter',JSON.stringify(r));await frames(3);}
  else if(s.look){await p.evaluate(a=>window.__fp.look(a[0],a[1]),s.look);await frames(2);}
  else if(s.key){await p.evaluate(k=>window.__fp.key(k,true),s.key);await sleep(s.ms||1000);await p.evaluate(k=>window.__fp.key(k,false),s.key);await frames(2);}
  else if(s.goto){const t=Date.now(),y0=(await state()).y;let d=1e9,lo=y0,hi=y0;await p.evaluate(()=>window.__fp.key('w',true));   // walk to [x, z], steering all the way; gives up after ms
    while(Date.now()-t<(s.ms||15000)){const st=await p.evaluate(a=>{const F=window.__fp,dx=a[0]-F.FP.x,dz=a[1]-F.FP.z;F.look(Math.atan2(-dx,-dz),-.1);return{d:Math.hypot(dx,dz),y:F.FP.y};},s.goto);d=st.d;lo=Math.min(lo,st.y);hi=Math.max(hi,st.y);if(d<(s.near||.6))break;await sleep(40);}
    await p.evaluate(()=>window.__fp.key('w',false));if(!s.quiet)console.log('goto',JSON.stringify(s.goto),'left '+d.toFixed(2)+' m, height '+lo.toFixed(2)+'..'+hi.toFixed(2),((Date.now()-t)/1000).toFixed(1)+'s');}
  else if(s.climb){   // walk, along the way the grid gives, to the place within reach that is highest above or lowest below the walker: steps and ramps
    const W=await p.evaluate(()=>{const F=window.__fp,Wk=F.FPM.walk(F.FP.x,F.FP.z,F.FP.g,6000);let b=0;for(let i=1;i<Wk.length;i++)if(Math.abs(Wk[i][2]-F.FP.g)>Math.abs(Wk[b][2]-F.FP.g))b=i;const P=[];for(let i=b;i>=0;i=Wk[i][3])P.push([Wk[i][0],Wk[i][1],Wk[i][2]]);return P.reverse();});
    console.log('climb: '+W.length+' places, from '+W[0][2].toFixed(2)+' to '+W[W.length-1][2].toFixed(2));for(let i=1;i<W.length-1;i++)await run({goto:[W[i][0],W[i][1]],ms:3000,near:.4,quiet:true});await run({goto:[W[W.length-1][0],W[W.length-1][1]],ms:4000});}
  else if(s.meet){   // walk to within d metres of the nearest figure of a kind and face it ("g" guard, "f" freedman, "s" senator; "post":true a sentry, false one on the move), or to the thickest grass ("lawn")
    const D=s.d||3.2;let W=null;for(let tries=0;tries<3;tries++){
      W=await p.evaluate((k,post,D)=>{const F=window.__fp,P=F.FP,M=F.FPM,Wk=M.walk(P.x,P.z,P.g,6000);let b=-1;window.__meet=null;
        if(k==='lawn'){const A=F.FPG.tuft.geometry.attributes.aG.array,B=new Map(),key=(x,z)=>Math.floor(x/3)+','+Math.floor(z/3);for(let i=0;i<F.FPG.n;i++){const q=key(A[i*4],A[i*4+2]);B.set(q,(B.get(q)||0)+1);}
          let best=0;for(let i=0;i<Wk.length;i++){let c=0;for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++)c+=B.get(key(Wk[i][0]+u*3,Wk[i][1]+v*3))||0;if(c>best){best=c;b=i;}}
          if(b>=0){let sx=0,sz=0,n=0;for(let i=0;i<F.FPG.n;i++){const x=A[i*4]-Wk[b][0],z=A[i*4+2]-Wk[b][1];if(Math.hypot(x,z)<9){sx+=x;sz+=z;n++;}}window.__meet={x:Wk[b][0]+sx/n*3,z:Wk[b][1]+sz/n*3,y:Wk[b][2]-1.15,lawn:1};}}
        else{const L=F.FPN.list.filter(a=>a.k===k&&(post==null||!!a.post===post)).sort((u,v)=>Math.hypot(u.x-P.x,u.z-P.z)-Math.hypot(v.x-P.x,v.z-P.z));
          for(const a of L){for(let i=0;i<Wk.length&&b<0;i++){const x=a.x-Wk[i][0],z=a.z-Wk[i][1],d=Math.hypot(x,z);if(Math.abs(d-D)>.8)continue;let seen=true;for(let n=Math.ceil(d/.3),j=1;j<n;j++)if(M.at(Wk[i][0]+x*j/n,Wk[i][1]+z*j/n)>Wk[i][2]+1.45){seen=false;break;}if(seen)b=i;}if(b>=0){window.__meet=a;break;}}}
        if(b<0)return null;const R=[];for(let i=b;i>=0;i=Wk[i][3])R.push([Wk[i][0],Wk[i][1]]);return R.reverse();},s.meet,s.post==null?null:!!s.post,D);
      if(!W){console.log('meet '+s.meet+': nobody within reach');break;}
      for(let i=1;i<W.length-1;i++)await run({goto:W[i],ms:3000,near:.4,quiet:true});if(W.length>1)await run({goto:W[W.length-1],ms:4000,near:.3,quiet:true});
      const d=await p.evaluate(()=>{const F=window.__fp,P=F.FP,a=window.__meet,x=a.x-P.x,z=a.z-P.z,d=Math.hypot(x,z);F.look(Math.atan2(-x,-z),a.lawn?-.42:Math.atan2(a.y+1.15-(P.y+1.62),d));return d;});
      console.log('meet '+s.meet+': '+W.length+' places walked, '+d.toFixed(1)+' m away');if(s.meet==='lawn'||d<D+2)break;}await frames(3);}
  else if(s.wait)await sleep(s.wait);
  else if(s.shot){await frames(2);await p.screenshot({path:path.join(outDir,s.shot)});console.log('saved',path.join(outDir,s.shot),JSON.stringify(await state()));}
  else if(s.map)save(s.map,await mapPng());
  else if(s.js)console.log('js',JSON.stringify(await p.evaluate(s.js)));
  else if(s.tod!=null){await p.evaluate(t=>{ENV.tod=t;setEnv();updateEnv(W0.scene);todT=null;W0.sdirty=1;},s.tod);await frames(3);}
  else if(s.season!=null){await p.evaluate(v=>{SEAS.t=SEAS.v=v;U.uSeason.value=v;W0.sdirty=1;},s.season);await frames(3);}
  else if(s.state!=null){await p.evaluate(i=>setState(i,{instant:true}),s.state);await frames(3);}}
let fail=[];
if(stepsFile){for(const s of JSON.parse(fs.readFileSync(stepsFile,'utf8')))await run(s);}
else{
  // the standing check. First the page's own way in and out: the button, the keys, a drag of the mouse, Esc twice
  await run({tod:.4});const fb=async()=>{const f0=await p.evaluate(()=>window.__frames),t=Date.now();await sleep(3000);return(await p.evaluate(()=>window.__frames)-f0)/((Date.now()-t)/1000);};
  console.log('fps from above',(await fb()).toFixed(1));
  await p.evaluate(()=>document.querySelector('#tWalk').click());{const t=Date.now();while(Date.now()-t<120000&&!(await state()).on)await sleep(300);}await frames(5);
  {const s0=await state();if(!s0.on)fail.push('the button did not start the walk');
    if(await p.evaluate(()=>getComputedStyle(document.querySelector('#reader')).display!=='none'||getComputedStyle(document.querySelector('#fpTop')).display==='none'))fail.push('the reading page is still up, or the walk bar is not');
    await p.keyboard.down('w');await sleep(1500);await p.keyboard.up('w');await frames(2);const s1=await state();if(Math.hypot(s1.x-s0.x,s1.z-s0.z)<.5)fail.push('the W key did not move the walker');
    await p.mouse.move(640,360);await p.mouse.down();await p.mouse.move(760,380,{steps:6});await p.mouse.up();await frames(2);const s2=await state();if(Math.abs(s2.yaw-s1.yaw)<.05)fail.push('the mouse did not turn the view');
    await p.keyboard.down(' ');let top=0;for(let i=0;i<12;i++){await sleep(50);top=Math.max(top,(await state()).jy);}await p.keyboard.up(' ');await sleep(900);if(top<.3||(await state()).jy!==0)fail.push('Space did not jump and land (top '+top.toFixed(2)+' m)');
    await p.screenshot({path:path.join(outDir,'check-ui.png')});
    await p.keyboard.press('Escape');await frames(2);if(!await p.evaluate(()=>document.body.classList.contains('fp-paused')))fail.push('Esc did not pause');
    await p.keyboard.press('Escape');await frames(3);if((await state()).on||await p.evaluate(()=>document.body.classList.contains('fp')||getComputedStyle(document.querySelector('#reader')).display==='none'))fail.push('the second Esc did not bring the reading page back');}
  await run({enter:null});const a=await state();if(!a.on||!a.ready)fail.push('did not enter');if(!a.hill)fail.push('not on the Palatine');
  const f0=await p.evaluate(()=>window.__frames),tA=Date.now();await sleep(3000);const fps=(await p.evaluate(()=>window.__frames)-f0)/((Date.now()-tA)/1000);console.log('fps on foot',fps.toFixed(1));
  // walk: four legs, turning left each time; count the ground covered and check the walker never stands where the grid says it cannot
  let path_=0,last=a,bad=0;for(let leg=0;leg<8;leg++){await run({look:[a.yaw+leg*Math.PI/4,-.08]});await run({key:'w',ms:Math.max(2500,25000/Math.max(fps,1))});const s=await state();path_+=Math.hypot(s.x-last.x,s.z-last.z);last=s;
    if(!await p.evaluate(()=>{const F=window.__fp,g=F.FPM.stand(F.FP.x,F.FP.z,F.FP.g+.05,F.FP.R||.15);return g===g;}))bad++;}
  console.log('walked',path_.toFixed(1)+' m, people '+last.people+', tufts '+last.tufts+', flowers '+last.flowers);
  if(path_<8)fail.push('walked only '+path_.toFixed(1)+' m');if(bad)fail.push('stood on a place the grid refuses, '+bad+' times');
  {const Pp=last.people.split(',');for(const k of['g','f'])if(!Pp.includes(k))fail.push('no figure of kind '+k);if(new Set(Pp).size<6)fail.push('only '+new Set(Pp).size+' kinds of figures');if(last.misplaced)fail.push('out of place: '+last.misplaced);console.log('zones',JSON.stringify(last.zones),'here',last.zone);}if(!(last.tufts>0))fail.push('no grass tufts');
  await run({shot:'check.png'});await run({map:'check-map.png'});await p.evaluate(()=>window.__fp.exit());await frames(3);
  if(await p.evaluate(()=>document.body.classList.contains('fp')||window.__fp.state().on))fail.push('did not leave');}
if(errs.length)fail.push('page errors:\n'+errs.join('\n'));
console.log(fail.length?'FAIL\n'+fail.join('\n'):'ok');await b.close();process.exit(fail.length?1:0);

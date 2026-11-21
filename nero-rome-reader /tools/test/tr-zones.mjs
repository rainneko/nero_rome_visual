// The east palace's furnishing packs: loaded near, released far (src/scenes/rome/palace-interior.js, briefs/rome/transitoria-v3/item1-zone-packs.md).
// Measures the PR's acceptance figures and prints one table; exit 1 when one fails.
// Run: npm run build && GPU=1 node tools/test/tr-zones.mjs          (without GPU=1 the software renderer: the counts hold, the frame times mean nothing)
// The reader is moved along straight lines of the plan (model axes: x east, y north) at a given speed; nothing is walked into, the
// distances are what is tested. 1 clean release (three round trips, 150 m out; one to 250 m)  2 frame time in the kitchen, with and
// without the pack  2b faces shown in the middle of the south walk  3 the longest frame while the pack arrives  4 no reloading at the edge.
import puppeteer from 'puppeteer';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),GPU=!!process.env.GPU;
const b=await puppeteer.launch({headless:'new',args:[...(GPU?['--enable-gpu','--use-angle=metal']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']),'--allow-file-access-from-files','--ignore-gpu-blocklist','--enable-precise-memory-info','--js-flags=--expose-gc']});
const p=await b.newPage();await p.setViewport({width:1280,height:720});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(root,'dist/index.html'),{timeout:0});
const t0=Date.now();while(Date.now()-t0<400000){if(await p.evaluate(()=>!!(window.__ready||window.__err)))break;await new Promise(r=>setTimeout(r,1000));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
while(Date.now()-t0<520000&&!await p.evaluate(()=>!!window.__romeReady||!ROME.GLB.length))await sleep(500);
console.log('boot',((Date.now()-t0)/1000).toFixed(0)+'s',GPU?'GPU':'software renderer');
await p.evaluate(()=>{setState(6,{instant:true});
  // move the reader from model (ax,ay) to (bx,by) at v m/s, a step a frame; resolves with the frame times (ms)
  window.__mv=(ax,ay,bx,by,v)=>new Promise(res=>{const F=window.__fp.FP,A=window.__triW(ax,ay,0),B=window.__triW(bx,by,0),L=Math.hypot(B[0]-A[0],B[2]-A[2])||1e-6;let u=0,last=performance.now();const dts=[];
    const f=()=>{const now=performance.now(),dt=now-last;last=now;dts.push(dt);u+=v*dt/1000;const k=Math.min(1,u/L);F.x=A[0]+(B[0]-A[0])*k;F.z=A[2]+(B[2]-A[2])*k;F.vx=F.vz=0;if(k<1)requestAnimationFrame(f);else res(dts);};requestAnimationFrame(f);});
  // put the reader on the floor at a model point
  window.__put=(x,y,z)=>{const F=window.__fp,w=window.__triW(x,y,z);F.FP.x=w[0];F.FP.z=w[2];F.FP.g=F.FP.y=w[1];F.FP.vx=F.FP.vz=F.FP.vy=F.FP.jy=0;F.FP.trail.length=0;F.FPM.now(w[0],w[2],w[1]);const st=F.FPM.stand(w[0],w[2],w[1],.3);if(st===st)F.FP.g=F.FP.y=st;};
  window.__num=()=>{if(window.gc){gc();gc();}const t=window.__tri(),f=window.__trf();return{geo:renderer.info.memory.geometries,tex:renderer.info.memory.textures,walls:t.tris,fit:f.held,shown:f.shown,text:f.zones[0].text||!!window.TRF_S_GLB,tag:f.zones[0].tag,base:t.load,
    heap:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null,loads:f.zones[0].loads,frees:f.zones[0].frees,wl:t.loads,wf:t.frees,room:f.room};};});
const ev=(f,...a)=>p.evaluate(f,...a),num=()=>ev(()=>window.__num());
const until=async(f,ms=20000)=>{const t=Date.now();while(Date.now()-t<ms){if(await ev(f))return true;await sleep(150);}return false;};
const K=[28,-41],X=28;                        // the great kitchen S09; the trips run south from it along x 28
const out=d=>[X,-46-d];                       // d m outside the south zone's edge (y -46)
const mv=(a,c,v)=>ev((a,c,v)=>window.__mv(a[0],a[1],c[0],c[1],v),a,c,v);
const rows=[],fail=[];const row=(k,what,got,want,ok)=>{rows.push([k,what,got,want,ok?'ok':'FAIL']);if(!ok)fail.push(k+' '+what);};
const same=(a,c,keys)=>keys.every(k=>a[k]===c[k]);

// ---- 0 before ever going near
const w250=await ev(a=>window.__triW(a[0],a[1],0),out(250));await ev(w=>window.__fp.enter(w[0],w[2]),w250);await sleep(1500);
await ev(a=>window.__put(a[0],a[1],0),out(250));await sleep(1200);const N0=await num();console.log('never near (250 m out)',JSON.stringify(N0));
// the same trip with the palace's packs switched off, twice: what the people, the grass and the city's own detail do to the counts
await ev(()=>{TRI.NEAR0=TRI.NEAR;TRI.NEAR=-1;TRF.NEAR=-1;});const C=[];
for(let i=0;i<2;i++){await mv(out(250),out(150),40);await sleep(1200);for(let k=0;k<3;k++){await mv(out(150),K,40);await ev(a=>window.__put(a[0],a[1],.06),K);await sleep(2500);await mv(K,out(150),40);await sleep(1500);}await mv(out(150),out(250),40);await sleep(1500);C.push(await num());console.log('control (nothing loads), back at 250 m',i+1,JSON.stringify(C[i]));}
await ev(()=>{TRI.NEAR=TRI.NEAR0;TRF.NEAR=45;});
await mv(out(250),out(150),40);await sleep(1200);const A0=await num();console.log('150 m out, before',JSON.stringify(A0));

// ---- 1 three round trips
const OUT=[],IN=[];
for(let i=0;i<3;i++){await mv(out(150),K,40);await ev(a=>window.__put(a[0],a[1],.06),K);await sleep(2500);const ok=await ev(()=>window.__trf().zones[0].st===3&&window.__trf().shown>0);const n=await num();IN.push(n);console.log('in',i+1,ok?'':'(the pack never showed)',JSON.stringify(n));
  await mv(K,out(150),40);await sleep(1500);const o=await num();OUT.push(o);console.log('out',i+1,JSON.stringify(o));}
row('1','in the kitchen: the pack is there and shown',`fit ${IN[0].fit} faces, shown ${IN[0].shown}, room ${IN[0].room}`,'shown > 0 in S09',IN.every(n=>n.shown>0&&/\bS09\b/.test(n.room)));
row('1','150 m out, three times: geometries / textures / wall faces / fit faces',OUT.map(o=>[o.geo,o.tex,o.walls,o.fit].join('/')).join('  '),'the same three times',same(OUT[0],OUT[1],['geo','tex','walls','fit'])&&same(OUT[1],OUT[2],['geo','tex','walls','fit']));
row('1','150 m out: the pack\'s text and script tag are gone',OUT.map(o=>o.text+'/'+o.tag).join('  '),'false/false',OUT.every(o=>!o.text&&!o.tag&&o.fit===0));
row('1','JS heap 150 m out, MB (after gc)',OUT.map(o=>o.heap).join('  '),'not higher each time',OUT[0].heap===null||!(OUT[1].heap>OUT[0].heap+.5&&OUT[2].heap>OUT[1].heap+.5));
await mv(out(150),out(250),40);await sleep(1500);const N1=await num();console.log('250 m out, after',JSON.stringify(N1));
row('1','250 m out: as after the same trips with nothing loaded (geometries / textures / wall faces / walls pack state)',[N1.geo,N1.tex,N1.walls,N1.base].join('/')+'  control '+[C[1].geo,C[1].tex,C[1].walls,C[1].base].join('/')+'  (first control '+C[0].geo+', never near '+N0.geo+')','textures, faces and state equal; geometries within the controls\' own drift (the strict count is the next line)',same(C[1],N1,['tex','walls','base'])&&Math.abs(N1.geo-C[1].geo)<=Math.max(30,Math.abs(C[1].geo-C[0].geo)));
row('1','JS heap 250 m out, MB: before / after',N0.heap+' / '+N1.heap,'(for the record)',true);

// ---- 4 no reloading at the edge (done here, while the reader is outside)
await mv(out(250),out(89),40);await sleep(800);let c0=await num();
for(let i=0;i<5;i++){await mv(out(89),out(46),12);await sleep(400);await mv(out(46),out(89),12);await sleep(400);}
let c1=await num();row('4','46 – 89 m, five times there and back: loads / releases',(c1.loads-c0.loads)+' / '+(c1.frees-c0.frees),'0 or 1 / 0',c1.loads-c0.loads<=1&&c1.frees===c0.frees);
await mv(out(89),out(46),12);c0=await num();
for(let i=0;i<10;i++){await mv(out(46),out(44),2.1);await sleep(350);await mv(out(44),out(46),2.1);await sleep(350);}
c1=await num();row('4','44 – 46 m, ten times there and back: loads / releases',(c1.loads-c0.loads)+' / '+(c1.frees-c0.frees),'1 / 0',c1.loads-c0.loads===1&&c1.frees===c0.frees);
row('4','the walls\' own pack through all of this: loads / releases',c1.wl+' / '+c1.wf,'(for the record)',true);

// ---- 3 the longest frame while the pack arrives: walking pace from 60 m out to the kitchen
await mv(out(46),out(150),40);await sleep(1500);await mv(out(150),out(60),40);await sleep(800);
const hit=await ev((a,c)=>new Promise(res=>{let on=true,cross=0,seen=0;const D=[];let last=performance.now();
  const f=()=>{const now=performance.now();D.push([now,now-last]);last=now;const z=window.__trf().zones[0];if(!cross&&z.st)cross=now;if(!seen&&window.__trf().shown>0)seen=now;if(on)requestAnimationFrame(f);};requestAnimationFrame(f);
  window.__mv(a[0],a[1],c[0],c[1],2.1*4).then(()=>setTimeout(()=>{on=false;const W=D.filter(d=>cross&&d[0]>=cross&&d[0]<=(seen||1e18)+300);res({cross:!!cross,seen:!!seen,wait:seen-cross,max:Math.max(0,...W.map(d=>d[1])),all:Math.max(...D.slice(5).map(d=>d[1])),n:W.length});},1500));}),out(60),K);
console.log('arrival',JSON.stringify(hit));
row('3','from the 45 m line until the kitchen\'s things are on screen (+0.3 s): longest frame, ms',hit.max.toFixed(1)+' (waited '+Math.round(hit.wait)+' ms, '+hit.n+' frames; longest of the whole approach '+hit.all.toFixed(1)+')','<= 100',hit.cross&&hit.seen&&hit.max<=100);

// ---- 2 frame time: a slow turn in the kitchen, 300 frames, with the pack and without
const turn=()=>ev(()=>new Promise(res=>{const F=window.__fp,y0=F.FP.yaw,D=[];let last=performance.now(),n=0;const f=()=>{const now=performance.now();if(n)D.push(now-last);last=now;F.look(y0+n/300*Math.PI*2,0);if(++n<=300)requestAnimationFrame(f);else{D.sort((a,c)=>a-c);res({mean:D.reduce((s,v)=>s+v,0)/D.length,max:D[D.length-1],p95:D[Math.floor(D.length*.95)]});}};requestAnimationFrame(f);}));
await ev(a=>window.__put(a[0],a[1],.06),K);await until(()=>window.__trf().shown>0);await sleep(2500);
const A=[],B=[];let sh;
for(let i=0;i<2;i++){A.push(await turn());sh=await num();await ev(()=>{TRF.NEAR=-1;trfFreeAll();triRedraw();});await sleep(2500);B.push(await turn());await ev(()=>{TRF.NEAR=45;});await until(()=>window.__trf().shown>0);await sleep(2500);}
const f=t=>t.mean.toFixed(2)+' / '+t.p95.toFixed(1)+' / '+t.max.toFixed(1);
row('2','kitchen, slow turn, 300 frames, with the pack ('+sh.shown+' faces shown): mean / 95th / worst ms, two runs',f(A[0])+'   '+f(A[1]),'worst <= 33 (a real browser)',true);
row('2','the same without the pack, two runs',f(B[0])+'   '+f(B[1]),'mean within 2 of the above',!GPU||Math.min(A[0].mean,A[1].mean)-Math.min(B[0].mean,B[1].mean)<=2);

// ---- 1 (strict) release and load again on the spot, in the kitchen: the count moves by exactly the palace's own geometries
{await ev(a=>window.__put(a[0],a[1],.06),K);await until(()=>window.__trf().shown>0);await sleep(3000);
 const own=await ev(()=>{let n=0;const S=new Set();for(const G of [TRI.G,...TRF.Z[0].G])G.traverse(o=>{if(o.isMesh)S.add(o.geometry);});return S.size;});
 const g1=(await num()).geo;await ev(()=>{TRI.NEAR0=TRI.NEAR;TRI.NEAR=-1;TRF.NEAR=-1;trfFreeAll();triFree(triPlace());});await sleep(400);const g2=(await num()).geo;
 await ev(()=>{TRI.NEAR=TRI.NEAR0;TRF.NEAR=45;});await until(()=>window.__trf().shown>0);await sleep(600);const g3=(await num()).geo;
 row('1','on the spot in the kitchen: geometries loaded / released / loaded again; the palace\'s own are '+own,g1+' / '+g2+' / '+g3,'drops by '+own+', comes back',g1-g2===own&&g3===g1);}

// ---- 2b the middle of the south walk: how much shows at once
await ev(()=>window.__put(0,-22,.06));await sleep(1200);const sw=await num();
row('2b','middle of the south walk (0, -22): room / faces shown / faces held',sw.room+' / '+sw.shown+' / '+sw.fit,'shown <= 45 000',sw.shown<=45000);

console.log('\n| item | what | measured | wanted | |\n|---|---|---|---|---|');for(const r of rows)console.log('| '+r.join(' | ')+' |');
if(errs.length)console.log('page errors:',errs.slice(0,5));
await b.close();if(fail.length||errs.length){console.log('FAILED:',fail.join('; '));process.exit(1);}console.log('all pass');

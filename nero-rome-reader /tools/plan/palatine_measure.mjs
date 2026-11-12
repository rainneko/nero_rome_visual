// Colour and surface survey of the Palatine for the master plan's acceptance (palatine-masterplan.md section 4).
// For each of the plan's eight cameras (and two on other hills, to show they did not change) it saves
//   <name>.png     the frame as shot (same camera, time and season as palatine_survey.mjs), and
//   <name>_id.png  an id pass of the same frame: R = what the surface is (city part 0-99, 150+ a model material, 200 terrain,
//                  250 instanced vegetation, 255 anything else), G = hill palette*16 + flag (city) / slope (terrain),
//                  B = how squarely the face is turned to the sun (0-127), +128 on the Palatine (above the streets); A = 0 where nothing was drawn.
// Then: python3 tools/plan/palatine_measure.py <dir> [<dir before>] (sunlit colour per stone grade, green pixels, other hills).
// Usage: ROOT=<project> OUT=<dir> [CAMS=east,west] node tools/plan/palatine_measure.mjs   (after npm run build:test)
import path from 'node:path';import fs from 'node:fs';import {createRequire} from 'node:module';
const root=process.env.ROOT,out=process.env.OUT,require=createRequire(path.join(root,'package.json')),puppeteer=require('puppeteer');
fs.mkdirSync(out,{recursive:true});
const c=Math.cos(-Math.PI/6),s=Math.sin(-Math.PI/6),W=(lx,y,lz)=>[100+lx*c+lz*s,y,300-lx*s+lz*c];
const cams=[['north_bowl',[15,150,-340],[15,30,-105]],['tib_roofs',[-150,165,115],[-138,58,-35]],['tib_north',[-200,70,-250],[-138,35,-60]],['west',[-360,120,80],[-170,38,30]],
  ['south_circus',[20,130,400],[20,35,150]],['east',[350,125,-20],[170,45,0]],['top',[0,760,60],[0,50,20]],['saddle',[-30,150,60],[-30,55,-45]]].map(([n,P,T])=>[n,W(...P),W(...T)]);
cams.push(['x_capitol',[-150,95,170],[-275,35,10]],['x_aventine',[-250,200,780],[-480,40,1000]]);   // world coordinates: the Capitoline and the Aventine
const pick=process.env.CAMS?process.env.CAMS.split(','):null;
const b=await puppeteer.launch({headless:'new',args:['--enable-gpu','--use-angle=metal','--allow-file-access-from-files','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:1600,height:900});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,600));});
const t0=Date.now();await p.goto('file://'+path.join(root,'dist/test.html')+'?test',{timeout:0});
while(Date.now()-t0<400000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,1000));}
await p.evaluate(()=>{if(typeof romeLoadModels==='function')romeLoadModels();});
{const t1=Date.now();while(Date.now()-t1<180000){if(await p.evaluate(()=>typeof ROME==='undefined'||!ROME.GLB.length||window.__romeReady))break;await new Promise(r=>setTimeout(r,1000));}}
console.log('ready',((Date.now()-t0)/1000).toFixed(0)+'s');
const stats=await p.evaluate(()=>{let tri=0;const m=W0.scene.getObjectByName('palTerraces');if(m)tri=m.geometry.index.count/3;return{palTer:W0.palTerStats||null,palTerTris:tri};});console.log('stats',JSON.stringify(stats));
const GLBN=['rock','rock2','rock3','rock4','turf','tuff','stone','travertine','travertine_light','marble','paving','grass','moss','hedge','ivy','gravel','plaster','plaster2','plaster3','warmwall','warmstone','courtyard','brick','tile','roof','basalt','peperino','stucco'];
const tris={};
for(const[n,pos,tgt]of cams){if(pick&&!pick.includes(n))continue;
  await p.evaluate((pos,tgt)=>{W0.views.__cam={n:'cam',pos,tgt};window.__shot(0,'__cam',.45);},pos,tgt);await new Promise(r=>setTimeout(r,3500));
  await p.screenshot({path:path.join(out,n+'.png'),type:'png'});tris[n]=await p.evaluate(()=>renderer.info.render.triangles);
  const png=await p.evaluate(GLBN=>{const R=renderer,sc=W0.scene,w=R.domElement.width,h=R.domElement.height,rt=new THREE.WebGLRenderTarget(w,h);
    const VS=`#ifdef CITY
attribute vec4 aB;
#endif
varying vec4 vB;varying vec3 vN;varying vec3 vW;
void main(){vB=vec4(0.);
#ifdef CITY
vB=aB;
#endif
vec4 q=vec4(position,1.);vec3 n=normal;
#ifdef USE_INSTANCING
q=instanceMatrix*q;n=mat3(instanceMatrix)*n;
#endif
vec4 w=modelMatrix*q;vW=w.xyz;vN=mat3(modelMatrix)*n;gl_Position=projectionMatrix*viewMatrix*w;}`;
    const FS=`uniform vec3 uCls;uniform vec3 uSun;varying vec4 vB;varying vec3 vN;varying vec3 vW;
void main(){float r=uCls.x,g=uCls.y;vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;
#ifdef CITY
r=floor(vB.y+.5);g=floor(vB.z+.5)*16.+floor(vB.w+.5);
#endif
if(uCls.z>.5)g=floor((1.-clamp(n.y,0.,1.))*255.);
vec2 d=vW.xz-vec2(100.,300.);float c=.8660254,s=-.5,lx=c*d.x-s*d.y,lz=s*d.x+c*d.y;
float m=(lx>-260.&&lx<300.&&lz>-230.&&lz<270.&&vW.y>14.)?128.:0.;
gl_FragColor=vec4(r/255.,g/255.,(floor(clamp(dot(n,uSun),0.,1.)*127.)+m)/255.,1.);}`;
    const cache=new Map(),sw=[],sun=SUNDIR.clone().normalize();
    const idm=(key,cls,city,side)=>{const k=key+'|'+side;if(!cache.has(k))cache.set(k,new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,defines:city?{CITY:1}:{},side,toneMapped:false,
      uniforms:{uCls:{value:new THREE.Vector3(...cls)},uSun:{value:sun}}}));return cache.get(k);};
    sc.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m=o.material;let k,cls,city=false;
      if(m===MAT.city){k='city';cls=[0,0,0];city=true;}
      else if(m===MAT.terrain){k='terr';cls=[200,0,1];}
      else if(m.userData&&m.userData.rome!==undefined){const i=GLBN.indexOf(m.name);k='glb'+i;cls=[i<0?149:150+i,0,0];}
      else if(o.isInstancedMesh){k='inst';cls=[250,0,0];}
      else{k='other';cls=[255,0,0];}
      sw.push([o,m]);o.material=idm(k,cls,city,m.side);});
    const bg=sc.background,fog=sc.fog;sc.background=null;sc.fog=null;R.setRenderTarget(rt);R.setClearColor(0xffffff,0);R.clear();R.render(sc,camera);
    const px=new Uint8Array(w*h*4);R.readRenderTargetPixels(rt,0,0,w,h,px);R.setRenderTarget(null);sc.background=bg;sc.fog=fog;
    for(const[o,m]of sw)o.material=m;rt.dispose();for(const v of cache.values())v.dispose();
    const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d'),im=cx.createImageData(w,h);
    for(let y=0;y<h;y++)im.data.set(px.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4);cx.putImageData(im,0,0);return cv.toDataURL('image/png');},GLBN);
  fs.writeFileSync(path.join(out,n+'_id.png'),Buffer.from(png.split(',')[1],'base64'));console.log('shot',n);}
fs.writeFileSync(path.join(out,'meta.json'),JSON.stringify({glb:GLBN,errors:errs,cams,stats,tris}));
if(errs.length)console.log('page errors:',errs.slice(0,5).join(' | '));
await b.close();

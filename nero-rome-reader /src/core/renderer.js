'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const TAU=Math.PI*2, DEG=Math.PI/180;
const clamp=(x,a,b)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function RNG(seed){let s=seed>>>0||1;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function hash2(x,y){let h=(Math.imul(x|0,374761393)^Math.imul(y|0,668265263))>>>0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296;}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,y,o=4){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vnoise(x*f+i*13.7,y*f-i*7.3);f*=2.03;a*=.5;}return s;}
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
const TEST=/[?&]test/.test(location.search);
const PERF_PROFILES={smooth:{pr:1,shadow:1024,msaa:0,oil:.5},balanced:{pr:1.25,shadow:2048,msaa:2,oil:.5},fine:{pr:1.5,shadow:4096,msaa:4,oil:1}};
let perfMode='balanced';
try{const saved=localStorage.getItem('rome-quality');if(PERF_PROFILES[saved])perfMode=saved;}catch(e){}
const isTouch=matchMedia('(pointer:coarse)').matches, small=Math.min(innerWidth,innerHeight)<700;
const Q=(isTouch||small)?{name:'low',pr:Math.min(devicePixelRatio,1.25),shadow:2048,dens:.4,trees:.45,msaa:0,paint:false}
  :{name:'high',pr:Math.min(devicePixelRatio,1.5),shadow:4096,dens:1,trees:1,msaa:4,paint:true};
if(!TEST){const q=PERF_PROFILES[perfMode];Q.pr=Math.min(Q.pr,q.pr);Q.shadow=q.shadow;Q.msaa=isTouch||small?0:q.msaa;}
if(TEST){Q.pr=1;Q.dens=.8;Q.trees=.8;}if(!TEST&&navigator.deviceMemory&&navigator.deviceMemory<=4){Q.dens=Math.min(Q.dens,.7);}

/* ---------- GLSL ---------- */
const GL_NOISE=`
float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float h13(vec3 p3){p3=fract(p3*.1031);p3+=dot(p3,p3.zyx+31.32);return fract((p3.x+p3.y)*p3.z);}
float vn2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h12(i),h12(i+vec2(1,0)),u.x),mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),u.x),u.y);}
float vn3(vec3 p){vec3 i=floor(p),f=fract(p);vec3 u=f*f*(3.-2.*f);
 return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),u.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),u.x),u.y),
  mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),u.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),u.x),u.y),u.z);}
float fbm2(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn2(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return s;}
float fbm3(vec3 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*vn3(p);p=p*2.03+vec3(17.1,9.2,4.3);a*=.5;}return s;}
`;
const GL_ATMO=`
uniform vec3 uSunDir;uniform vec3 uSunCol;uniform vec3 uHazeCol;uniform vec4 uHaze;uniform float uTime;uniform float uNight;
uniform float uLit;uniform float uGlass;uniform float uWet;uniform float uBurn;uniform float uRust;uniform float uSeason;uniform vec3 uSkyRefl;
vec3 atmo(vec3 col,vec3 wp){
 vec3 d=wp-cameraPosition;float dist=length(d);vec3 v=d/max(dist,.001);
 float H=uHaze.y;float h0=cameraPosition.y-uHaze.z,h1=wp.y-uHaze.z;float dy=h1-h0;
 float e0=exp(-max(h0,-60.)/H),e1=exp(-max(h1,-60.)/H);
 float od=abs(dy)<1.?uHaze.x*dist*e0:uHaze.x*dist*H*(e0-e1)/dy;od=max(od,0.);
 vec3 T=exp(-od*vec3(.6,.8,1.15));
 float mu=max(dot(v,uSunDir),0.);
 vec3 ins=uHazeCol+uSunCol*uHaze.w*(pow(mu,12.)*.9+pow(mu,3.)*.18);
 return col*T+ins*(1.-T);
}`;
const U={uTime:{value:0},uNight:{value:0},uSunDir:{value:new THREE.Vector3(.4,.5,.7).normalize()},uSunCol:{value:new THREE.Color(1,.9,.7)},
  uHazeCol:{value:new THREE.Color(.6,.62,.7)},uHaze:{value:new THREE.Vector4(1.6e-4,420,0,.8)},uLit:{value:0},uGlass:{value:.03},
  uWet:{value:0},uBurn:{value:0},uRust:{value:0},uSeason:{value:1},uSkyRefl:{value:new THREE.Color(.5,.6,.75)},
  uDbg:{value:new THREE.Vector4(0,0,0,0)},uSt:{value:null},uStA:{value:null},uStX:{value:new THREE.Vector4(0,0,0,0)},uStN:{value:new THREE.Vector2(1,1)},uRk:{value:Array.from({length:16},()=>new THREE.Vector4(1e6,0,1e6,100))},uWat:{value:Array.from({length:56},()=>new THREE.Vector4(1e6,0,0,0))},uWatR:{value:new Array(56).fill(0)}};   // uWat: watered ground discs (x,z,r) that stay green all year (palace and domus gardens), see WAT in builders.js
   // uRk: rock-cluster segments (ax,az,bx,bz) for the terrain's rocky scarp   // street raster (streets.js): mask+grade+wall distance, coarse direction, extent, size

function procMat(o){
  const M=o.physical?THREE.MeshPhysicalMaterial:THREE.MeshStandardMaterial;
  const m=new M(Object.assign({color:0xffffff,roughness:.8,metalness:0,envMapIntensity:o.env??.8},o.params||{}));
  m.onBeforeCompile=sh=>{
    for(const k in U)sh.uniforms[k]=U[k];
    if(o.uniforms)for(const k in o.uniforms)sh.uniforms[k]=o.uniforms[k];
    const head=GL_NOISE+GL_ATMO+'\nvarying vec3 vWP;varying vec3 vWN;\n';
    sh.vertexShader=sh.vertexShader
      .replace('#include <common>','#include <common>\n'+head+(o.vHead||''))
      .replace('#include <begin_vertex>','#include <begin_vertex>\n'+(o.vBody||''))
      .replace('#include <project_vertex>',`#include <project_vertex>
{vec4 aw=vec4(transformed,1.0);
#ifdef USE_INSTANCING
aw=instanceMatrix*aw;
#endif
aw=modelMatrix*aw;vWP=aw.xyz;vec3 an=objectNormal;
#ifdef USE_INSTANCING
an=mat3(instanceMatrix)*an;
#endif
vWN=normalize(mat3(modelMatrix)*an);}`);
    sh.fragmentShader=sh.fragmentShader
      .replace('#include <common>','#include <common>\n'+head+'struct PS{vec3 alb;float rough;float metal;vec3 nw;float useN;vec3 emit;float ao;float a;float bounce;};\n'+(o.fHead||'')+
        '\nPS surf(){PS S;S.alb=vec3(.6);S.rough=.85;S.metal=0.;S.nw=normalize(vWN);S.useN=0.;S.emit=vec3(0.);S.ao=1.;S.a=1.;S.bounce=0.;\n'+o.fSurf+'\nreturn S;}\n')
      .replace('#include <color_fragment>','#include <color_fragment>\nPS S=surf();diffuseColor.rgb*=S.alb;diffuseColor.a*=S.a;')
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=S.rough;')
      .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=S.metal;')
      .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nif(S.useN>.5){normal=normalize((viewMatrix*vec4(S.nw,0.)).xyz);}')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=S.emit;')
      .replace('#include <aomap_fragment>','#include <aomap_fragment>\nreflectedLight.indirectDiffuse*=S.ao;reflectedLight.indirectSpecular*=S.ao;reflectedLight.directDiffuse*=mix(1.,S.ao,.35);\nif(S.bounce>0.)reflectedLight.indirectDiffuse=max(reflectedLight.indirectDiffuse,S.alb*S.bounce*(1.-uNight));')
      .replace('#include <fog_fragment>','gl_FragColor.rgb=atmo(gl_FragColor.rgb,vWP);');
  };
  m.customProgramCacheKey=()=>o.key;
  return m;
}
// simple shader material with atmosphere (for sprites/effects)
function fxMat(o){
  return new THREE.ShaderMaterial({uniforms:Object.assign({},U,o.uniforms||{}),transparent:true,depthWrite:false,
    blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending,side:o.side||THREE.FrontSide,
    vertexShader:GL_NOISE+GL_ATMO+o.vs,fragmentShader:GL_NOISE+GL_ATMO+o.fs});
}

/* ---------- renderer & post ---------- */
const canvas=$('#gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',stencil:false,preserveDrawingBuffer:TEST});
THREE.ColorManagement.legacyMode=false;
renderer.outputEncoding=THREE.LinearEncoding;renderer.toneMapping=THREE.NoToneMapping;
renderer.physicallyCorrectLights=true;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Q.pr);
const camera=new THREE.PerspectiveCamera(38,1,4,60000);
const VS_FS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const fsScene=new THREE.Scene(),fsCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const FSQ=new THREE.Mesh(new THREE.PlaneGeometry(2,2));FSQ.frustumCulled=false;fsScene.add(FSQ);
function fsPass(mat,target){FSQ.material=mat;renderer.setRenderTarget(target);renderer.render(fsScene,fsCam);}
const mkRT=(w,h,o={})=>new THREE.WebGLRenderTarget(w,h,Object.assign({type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false},o));
const P={rt:null,mips:[],blur:null,ldr:null,w:1,h:1,
  down:new THREE.ShaderMaterial({uniforms:{t:{value:null},tx:{value:new THREE.Vector2()},thr:{value:-1}},vertexShader:VS_FS,fragmentShader:`
    uniform sampler2D t;uniform vec2 tx;uniform float thr;varying vec2 vUv;
    vec3 s(vec2 o){return texture2D(t,vUv+o*tx).rgb;}
    void main(){vec3 c=s(vec2(0))*.5+(s(vec2(-1,-1))+s(vec2(1,-1))+s(vec2(-1,1))+s(vec2(1,1)))*.125;
     if(thr>0.){float l=max(c.r,max(c.g,c.b));c*=max(l-thr,0.)/max(l,1e-4);c=min(c,vec3(40.));}
     gl_FragColor=vec4(c,1.);}`}),
  up:new THREE.ShaderMaterial({uniforms:{t:{value:null},tx:{value:new THREE.Vector2()},base:{value:null}},vertexShader:VS_FS,fragmentShader:`
    uniform sampler2D t,base;uniform vec2 tx;varying vec2 vUv;
    void main(){vec3 c=vec3(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){float w=(i==0?2.:1.)*(j==0?2.:1.);c+=texture2D(t,vUv+vec2(i,j)*tx).rgb*w;}
     gl_FragColor=vec4(c/16.+texture2D(base,vUv).rgb,1.);}`}),
  comp:new THREE.ShaderMaterial({uniforms:{tS:{value:null},tB:{value:null},tBl:{value:null},uExpo:{value:1},bloom:{value:.06},sat:{value:1.17},
      con:{value:1.1},vig:{value:.32},tilt:{value:0},fy:{value:.45},warm:{value:new THREE.Vector3(1.03,1,.95)},cool:{value:new THREE.Vector3(.93,.98,1.06)},
      lift:{value:new THREE.Vector3(.012,.012,.02)},time:{value:0},flash:{value:0}},vertexShader:VS_FS,fragmentShader:`
    uniform sampler2D tS,tB,tBl;uniform float uExpo,bloom,sat,con,vig,tilt,fy,time,flash;uniform vec3 warm,cool,lift;varying vec2 vUv;
    float hh(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
    vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
    void main(){vec3 h=texture2D(tS,vUv).rgb;
     if(tilt>0.){float d=abs(vUv.y-fy);h=mix(h,texture2D(tBl,vUv).rgb,smoothstep(.12,.42,d)*tilt);}
     h+=texture2D(tB,vUv).rgb*bloom;h*=uExpo*(1.+flash);
     vec3 c=pow(aces(h),vec3(1./2.2));c=mix(c,.8+.2*(1.-exp(-(max(c,.8)-.8)/.2)),step(.8,c));   // soft shoulder above .8: bright marble compresses instead of clipping
     float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,sat);
     c=clamp((c-.5)*con+.5,0.,1.);
     c*=mix(cool,warm,smoothstep(.15,.85,l));
     c=c+lift*(1.-c);
     vec2 q=vUv-.5;c*=1.-vig*dot(q*vec2(1.05,1.),q*vec2(1.05,1.))*1.7;
     c+=(hh(gl_FragCoord.xy+fract(time)*91.)-.5)/255.;
     gl_FragColor=vec4(clamp(c,0.,1.),1.);}`}),
  kuw:new THREE.ShaderMaterial({uniforms:{t:{value:null},tx:{value:new THREE.Vector2()}},vertexShader:VS_FS,fragmentShader:`
    uniform sampler2D t;uniform vec2 tx;varying vec2 vUv;
    void main(){vec3 m0=vec3(0),m1=vec3(0),m2=vec3(0),m3=vec3(0),s0=vec3(0),s1=vec3(0),s2=vec3(0),s3=vec3(0);
     for(int j=0;j<=3;j++)for(int i=0;i<=3;i++){
      vec3 a=texture2D(t,vUv+vec2(-i,-j)*tx).rgb;m0+=a;s0+=a*a;
      vec3 b=texture2D(t,vUv+vec2(i,-j)*tx).rgb;m1+=b;s1+=b*b;
      vec3 c=texture2D(t,vUv+vec2(-i,j)*tx).rgb;m2+=c;s2+=c*c;
      vec3 d=texture2D(t,vUv+vec2(i,j)*tx).rgb;m3+=d;s3+=d*d;}
     float n=16.;m0/=n;m1/=n;m2/=n;m3/=n;
     vec3 v0=abs(s0/n-m0*m0),v1=abs(s1/n-m1*m1),v2=abs(s2/n-m2*m2),v3=abs(s3/n-m3*m3);
     float w0=1./(1e-5+pow(v0.r+v0.g+v0.b,2.)),w1=1./(1e-5+pow(v1.r+v1.g+v1.b,2.)),w2=1./(1e-5+pow(v2.r+v2.g+v2.b,2.)),w3=1./(1e-5+pow(v3.r+v3.g+v3.b,2.));
     vec3 c=(m0*w0+m1*w1+m2*w2+m3*w3)/(w0+w1+w2+w3);
     gl_FragColor=vec4(c,1.);}`}),
  /* crystallized painterly (webtoon oil background): Kuwahara-flattened input -> Voronoi facets (polygonal colour
     patches with faint edges) -> short crossed oil-brush dabs -> soft posterize -> canvas grain */
  cryst:new THREE.ShaderMaterial({uniforms:{t:{value:null},t0:{value:null},res:{value:new THREE.Vector2(1,1)},time:{value:0},k:{value:1},cz:{value:1}},vertexShader:VS_FS,fragmentShader:`
    uniform sampler2D t,t0;uniform vec2 res;uniform float time,k,cz;varying vec2 vUv;
    vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
    float h1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
    float stroke(vec2 px,float a,vec2 sc){vec2 d=vec2(cos(a),sin(a));vec2 q=vec2(dot(px,d),dot(px,vec2(-d.y,d.x)));return vn(q*sc);}
    void main(){vec2 px=vUv*res;float cs=max(5.*cz,res.y/128.*cz);vec2 g=px/cs,gi=floor(g),gf=fract(g);
     float d1=9.,d2=9.;vec2 c1=vec2(0.);
     for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j)),hp=h2(gi+o)*.84+.08;vec2 r=o+hp-gf;float d=dot(r,r);
      if(d<d1){d2=d1;d1=d;c1=gi+o+hp;}else if(d<d2)d2=d;}
     vec2 cu=c1*cs/res,o=cs*.32/res;
     vec3 cell=texture2D(t,cu).rgb*.36+(texture2D(t,cu+vec2(o.x,o.y)).rgb+texture2D(t,cu+vec2(-o.x,o.y)).rgb+texture2D(t,cu+vec2(o.x,-o.y)).rgb+texture2D(t,cu+vec2(-o.x,-o.y)).rgb)*.16;
     vec3 base=texture2D(t,vUv).rgb;vec3 col=mix(cell,base,.3);
     float e=1.-smoothstep(0.,.07,sqrt(d2)-sqrt(d1));float lb=dot(base,vec3(.333));col*=1.-.05*e*smoothstep(.15,.6,lb)*k;
     float a=.62+.5*(h1(floor(c1*.5))-.5);
     float s=mix(stroke(px,a,vec2(.075,.36)),stroke(px,a-1.57+.35,vec2(.085,.33)),step(.5,h1(c1)));
     float s2=stroke(px+17.,a+.9,vec2(.16,.7));col*=.92+.14*s+.05*(s2-.5);
     float l=dot(col,vec3(.299,.587,.114)),lq=(floor(l*9.+.5))/9.;col*=mix(1.,lq/max(l,1e-3),.3);
     col=mix(vec3(dot(col,vec3(.299,.587,.114))),col,1.06);
     col+=(vn(px*.7)-.5)*.018+(h1(px+fract(time)*61.)-.5)*.01;
     if(k<.99)col=mix(texture2D(t0,vUv).rgb,col,k);          // light version: partial blend with the plain image
     gl_FragColor=vec4(clamp(col,0.,1.),1.);}`}),
  setSize(w,h){this.w=w;this.h=h;const pr=renderer.getPixelRatio();const W=Math.round(w*pr),H=Math.round(h*pr);
    if(this.rt)this.rt.dispose();this.rt=mkRT(W,H,{depthBuffer:true,stencilBuffer:true,samples:Q.msaa});  // stencil => 24-bit depth (r147 gives 16-bit otherwise: far z-fighting)
    this.mips.forEach(m=>m.dispose());this.mips=[];if(this.ups)this.ups.forEach(r=>r.dispose());this.ups=[];let mw=W,mh=H;
    for(let i=0;i<6;i++){mw=Math.max(2,mw>>1);mh=Math.max(2,mh>>1);this.mips.push(mkRT(mw,mh));this.ups.push(mkRT(mw,mh));}
    if(this.blur)this.blur.dispose();this.blur=mkRT(Math.max(2,W>>2),Math.max(2,H>>2));
    if(this.blur2)this.blur2.dispose();this.blur2=mkRT(Math.max(2,W>>1),Math.max(2,H>>1));
    if(this.ldr)this.ldr.dispose();this.ldr=mkRT(W,H,{type:THREE.UnsignedByteType});if(this.ldr2)this.ldr2.dispose();this.ldr2=mkRT(W,H,{type:THREE.UnsignedByteType});this.cryst.uniforms.res.value.set(W,H);
    if(this.oilLight)this.oilLight.dispose();const os=PERF_PROFILES[perfMode].oil;this.oilLight=mkRT(Math.max(2,Math.round(W*os)),Math.max(2,Math.round(H*os)),{type:THREE.UnsignedByteType});},
  render(scene,cam){
    renderer.setRenderTarget(this.rt);renderer.clear();renderer.render(scene,cam);
    const d=this.down,u=this.up;let src=this.rt.texture;
    for(let i=0;i<this.mips.length;i++){d.uniforms.t.value=src;d.uniforms.tx.value.set(1/this.mips[i].width,1/this.mips[i].height);d.uniforms.thr.value=i===0?1.2:-1;fsPass(d,this.mips[i]);src=this.mips[i].texture;}
    const nM=this.mips.length;for(let i=nM-1;i>0;i--){u.uniforms.t.value=(i===nM-1?this.mips[i]:this.ups[i]).texture;u.uniforms.base.value=this.mips[i-1].texture;u.uniforms.tx.value.set(1/this.mips[i].width,1/this.mips[i].height);fsPass(u,this.ups[i-1]);}
    const c=this.comp;
    if(c.uniforms.tilt.value>0){d.uniforms.thr.value=-1;d.uniforms.t.value=this.rt.texture;d.uniforms.tx.value.set(1/this.blur2.width,1/this.blur2.height);fsPass(d,this.blur2);
      d.uniforms.t.value=this.blur2.texture;d.uniforms.tx.value.set(1/this.blur.width,1/this.blur.height);fsPass(d,this.blur);}
    c.uniforms.tS.value=this.rt.texture;c.uniforms.tB.value=(this.mips.length>1?this.ups[0]:this.mips[0]).texture;c.uniforms.tBl.value=this.blur.texture;
    if(settings.cryst||settings.crystL){const lt=settings.crystL;this.cryst.uniforms.k.value=lt?.58:1;this.cryst.uniforms.cz.value=lt?.66:1;this.cryst.uniforms.t0.value=this.ldr.texture;fsPass(c,this.ldr);this.kuw.uniforms.t.value=this.ldr.texture;this.kuw.uniforms.tx.value.set(1/this.ldr.width,1/this.ldr.height);const oilTarget=lt?this.oilLight:this.ldr2;fsPass(this.kuw,oilTarget);
      this.cryst.uniforms.t.value=oilTarget.texture;this.cryst.uniforms.time.value=c.uniforms.time.value;fsPass(this.cryst,null);}
    else if(settings.paint){fsPass(c,this.ldr);this.kuw.uniforms.t.value=this.ldr.texture;this.kuw.uniforms.tx.value.set(1/this.ldr.width,1/this.ldr.height);fsPass(this.kuw,null);}
    else fsPass(c,null);
  }};
function setPerfMode(mode){if(!PERF_PROFILES[mode])return;perfMode=mode;const q=PERF_PROFILES[mode];Q.msaa=isTouch||small?0:q.msaa;renderer.setPixelRatio(Math.min(devicePixelRatio,q.pr,isTouch||small?1.25:1.5));sun.shadow.mapSize.set(q.shadow,q.shadow);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}renderer.shadowMap.needsUpdate=true;resize();try{localStorage.setItem('rome-quality',mode);}catch(e){}}
const settings={paint:false,cryst:false,crystL:!TEST,labels:true,tilt:false,glassOp:.38};

/* ---------- sky ---------- */
const SKY={uZen:{value:new THREE.Color()},uHor:{value:new THREE.Color()},uGround:{value:new THREE.Color()},uCloudLit:{value:new THREE.Color()},
  uCloudShade:{value:new THREE.Color()},uCover:{value:.42},uSunVis:{value:1},uStorm:{value:0}};
const skyMat=new THREE.ShaderMaterial({uniforms:Object.assign({},U,SKY),side:THREE.BackSide,depthWrite:false,
  vertexShader:`varying vec3 vD;void main(){vD=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`,
  fragmentShader:GL_NOISE+`uniform vec3 uSunDir,uSunCol,uZen,uHor,uGround,uCloudLit,uCloudShade;uniform float uTime,uNight,uCover,uSunVis,uStorm;varying vec3 vD;
  float cl(vec2 p){vec2 w=vec2(fbm2(p*.7+3.1),fbm2(p*.7+8.4));float n=fbm2(p+w*1.4);n+=.35*fbm2(p*3.3+11.)-.17;return smoothstep(1.-uCover,1.-uCover+.2,n);}
  void main(){vec3 d=normalize(vD);float y=d.y;float mu=dot(d,uSunDir);
   vec3 sky=mix(uHor,uZen,pow(clamp(y,0.,1.),.55));
   sky+=uSunCol*(pow(max(mu,0.),6.)*.35+pow(max(mu,0.),64.)*.8)*uSunVis*(1.-uStorm*.8);
   if(y<0.)sky=mix(uHor,uGround,clamp(-y*6.,0.,1.));
   if(y>0.){vec2 p=d.xz/(y+.12)*.85+vec2(uTime*.003,uTime*.0012);float c=cl(p);
    float c2=cl(p+uSunDir.xz*.08);float lit=clamp(1.-(c2-c)*2.2+.25,0.,1.);
    vec3 cc=mix(uCloudShade,uCloudLit,lit);cc+=uSunCol*pow(max(mu,0.),8.)*(1.-c)*.6*uSunVis;
    sky=mix(sky,cc,c*smoothstep(0.,.12,y)*.96);}
   float sd=smoothstep(.9994,.99975,mu)*uSunVis*(1.-uStorm);sky+=uSunCol*sd*30.;
   if(uNight>.01&&y>0.){vec3 g=floor(d*420.);float st=step(.9985,h13(g))*h13(g+3.);sky+=vec3(st*uNight*1.6);}
   gl_FragColor=vec4(sky,1.);}`});
const skyMesh=new THREE.Mesh(new THREE.SphereGeometry(20000,48,24),skyMat);skyMesh.frustumCulled=false;skyMesh.renderOrder=-10;
const envScene=new THREE.Scene();const envSky=new THREE.Mesh(new THREE.SphereGeometry(100,32,16),skyMat);envScene.add(envSky);
const pmrem=new THREE.PMREMGenerator(renderer);let envRT=null,envDirty=true,envT=0;
function updateEnv(scene){if(envRT)envRT.dispose();envRT=pmrem.fromScene(envScene,0,.1,1000);scene.environment=envRT.texture;envDirty=false;}

/* ---------- lights & time of day ---------- */
const sun=new THREE.DirectionalLight(0xffffff,3);sun.castShadow=true;sun.shadow.mapSize.set(Q.shadow,Q.shadow);
sun.shadow.bias=-.0003;sun.shadow.normalBias=.8;
const hemi=new THREE.HemisphereLight(0xbcd0ff,0x6a5944,.8);
const C3=a=>new THREE.Color(a[0],a[1],a[2]);
// t, elev, sunCol, sunI, zen, hor, hemiSky, hemiGnd, hemiI, haze, exposure, night
const TODK=[
 [0.00,3,[1,.55,.33],1.6,[.18,.27,.45],[.92,.62,.47],[.5,.52,.65],[.36,.26,.2],.45,[.8,.6,.5],1.25,0],
 [0.18,15,[1,.82,.6],3.0,[.24,.42,.72],[.95,.85,.72],[.6,.7,.9],[.45,.36,.26],.6,[.86,.78,.7],.8,0],
 [0.38,40,[1,.95,.88],3.6,[.2,.42,.8],[.78,.86,.95],[.6,.72,.95],[.46,.4,.3],.7,[.72,.8,.9],.76,0],
 [0.60,17,[1,.78,.52],3.1,[.24,.39,.68],[1,.8,.62],[.6,.65,.85],[.45,.33,.24],.6,[.95,.78,.64],.84,0],
 [0.76,3,[1,.48,.25],1.6,[.2,.24,.42],[1,.55,.36],[.45,.44,.6],[.36,.24,.18],.42,[.9,.55,.42],1.2,.06],
 [0.86,-6,[.9,.45,.35],.0,[.06,.09,.2],[.4,.27,.3],[.22,.25,.4],[.12,.1,.1],.12,[.3,.26,.32],1.05,.7],
 [1.00,-25,[.55,.66,1],.0,[.015,.025,.06],[.05,.07,.12],[.08,.11,.2],[.03,.03,.04],.06,[.06,.08,.13],.95,1]];
const WEATHER={clear:{cover:.42,haze:1,dim:1,storm:0,wet:0},haze:{cover:.5,haze:2.3,dim:.8,storm:0,wet:0,tint:[1.05,.96,.78]},
  overcast:{cover:.78,haze:1.6,dim:.5,storm:.4,wet:0},storm:{cover:.95,haze:2.2,dim:.28,storm:1,wet:.8},rain:{cover:.9,haze:2.6,dim:.35,storm:.7,wet:1}};
const ENV={tod:.18,weather:'clear',sunAz:68,smog:0};
function todLabel(t){return t<.08?'破晓':t<.3?'清晨':t<.5?'正午':t<.68?'午后':t<.8?'黄昏':t<.9?'暮色':'深夜';}
function applyEnv(){
  const t=clamp(ENV.tod,0,1);let i=0;while(i<TODK.length-2&&t>TODK[i+1][0])i++;
  const A=TODK[i],B=TODK[i+1],f=sstep(0,1,(t-A[0])/(B[0]-A[0]));
  const mixC=(a,b)=>C3(a).lerp(C3(b),f),mixN=(a,b)=>lerp(a,b,f);
  const Wt=WEATHER[ENV.weather]||WEATHER.clear;
  const el=mixN(A[1],B[1])*DEG,az=ENV.sunAz*DEG;
  const sd=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el)).normalize();
  const night=mixN(A[11],B[11]);
  U.uNight.value=night;U.uSunDir.value.copy(sd.y>-.05?sd:new THREE.Vector3(sd.x,.2,sd.z).normalize());
  const sc=mixC(A[2],B[2]);U.uSunCol.value.copy(sc);
  const tint=Wt.tint?C3(Wt.tint):new THREE.Color(1,1,1);
  SKY.uZen.value.copy(mixC(A[4],B[4])).lerp(new THREE.Color(.32,.34,.38).multiplyScalar(1-night*.85),Wt.storm*.75);
  SKY.uHor.value.copy(mixC(A[5],B[5])).multiply(tint).lerp(new THREE.Color(.45,.45,.47).multiplyScalar(1-night*.85),Wt.storm*.6);
  SKY.uGround.value.copy(SKY.uHor.value).multiplyScalar(.6);
  SKY.uCover.value=Wt.cover;SKY.uStorm.value=Wt.storm;SKY.uSunVis.value=clamp(sd.y*8+.3,0,1)*(1-Wt.storm*.85);
  SKY.uCloudLit.value.copy(sc).multiplyScalar(1.15*(1-night*.9)).lerp(SKY.uHor.value,.35).lerp(new THREE.Color(.5,.5,.52),Wt.storm*.7);
  SKY.uCloudShade.value.copy(SKY.uZen.value).lerp(new THREE.Color(.48,.5,.58).multiplyScalar(1-night*.9),.6).multiplyScalar(1-Wt.storm*.35);
  // lights
  const moon=sd.y<0;
  if(moon){sun.position.set(-.3,.8,.5);sun.color.setRGB(.55,.66,1);sun.intensity=.17*night*Wt.dim+.02;}
  else{sun.position.copy(sd);sun.color.copy(sc);sun.intensity=mixN(A[3],B[3])*Wt.dim;}
  hemi.color.copy(mixC(A[6],B[6]));hemi.groundColor.copy(mixC(A[7],B[7]));hemi.intensity=mixN(A[8],B[8])*(0.85+.3*(1-Wt.dim));
  const hz=mixC(A[9],B[9]).multiply(tint);U.uHazeCol.value.copy(hz).multiplyScalar(.85);
  U.uHaze.value.set(2.6e-5*Wt.haze*(1+ENV.smog*1.4),430,0,.9*(1-Wt.storm));
  if(ENV.smog>0){U.uHazeCol.value.lerp(new THREE.Color(.62,.55,.38),ENV.smog*.55);SKY.uHor.value.lerp(new THREE.Color(.85,.72,.48),ENV.smog*.45);}
  U.uSkyRefl.value.copy(SKY.uHor.value).lerp(SKY.uZen.value,.3);
  U.uWet.value=Wt.wet;U.uLit.value=sstep(.6,.9,t)*1.0;
  P.comp.uniforms.uExpo.value=mixN(A[10],B[10])*(1+(1-Wt.dim)*.5);
  $('#todv').textContent=todLabel(t);
  envDirty=true;
}

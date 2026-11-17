// Water. One shader for every surface: slow swell (as before) plus three layers of fine ripples that fade with distance,
// and caustic glints on the still pools. The surface nearest the camera also gets a planar reflection (WREFL):
// the scene is drawn once more from the mirrored camera into a small target and mixed in by Fresnel.
// kind 0 = pool, basin, channel; 1 = river and lake; 2 = sea.
const WREFL={uRT:{value:null},uRM:{value:new THREE.Matrix4()},uRY:{value:-1e6},rt:null,cam:new THREE.PerspectiveCamera(),mesh:null,list:[],tScan:-1e9,tPick:-1e9,pick:null,on:true,size:512,ms:0};
const WATER_KIND={tiber:1,antsea:2};
function waterMat(key,col,amp,foamTex,refl){const kind=WATER_KIND[key]||0,As=[.04,.04,.03][kind];
 const un={};if(foamTex){un.uHT={value:foamTex.tex};un.uHX={value:foamTex.ext};}if(refl){un.uRT=WREFL.uRT;un.uRM=WREFL.uRM;un.uRY=WREFL.uRY;}
 const m=procMat({key:key+(refl?'_refl':''),params:{transparent:false},env:1.1,uniforms:un,
 fHead:(foamTex?'uniform sampler2D uHT;uniform vec4 uHX;':'')+(refl?'uniform sampler2D uRT;uniform mat4 uRM;uniform float uRY;':'')+`
 float wBig(vec2 p,float t){return fbm2(p*.025+vec2(t*.02,t*.013))+.5*vn2(p*.11-t*.06);}
 float wFine(vec2 p,float t){return vn2(p*1.5+t*vec2(.42,.27))+.55*vn2(p*3.6-t*vec2(.33,.48))+.28*vn2(p*8.3+t*vec2(-.7,.55));}`,fSurf:`
 vec2 p=vWP.xz;float t=uTime;float e=1.2;float dc=distance(cameraPosition,vWP);
 float h0=wBig(p,t),hx=wBig(p+vec2(e,0.),t),hz=wBig(p+vec2(0.,e),t);
 float A=${amp.toFixed(2)};vec2 sl=vec2(hx-h0,hz-h0)/e*A;
 float kF=1.-smoothstep(45.,170.,dc);
 if(kF>.01){float f=.07;float g0=wFine(p,t),gx=wFine(p+vec2(f,0.),t),gz=wFine(p+vec2(0.,f),t);sl+=vec2(gx-g0,gz-g0)/f*${As.toFixed(3)}*kF;}
 S.nw=normalize(vec3(-sl.x,1.,-sl.y));S.useN=1.;
 S.alb=vec3(${col.join(',')});S.rough=.07;
 ${kind===0?`float ca=pow(clamp(vn2(p*2.3+t*.5)+vn2(p*2.9-t*.4)-.8,0.,1.),2.)*kF;S.alb+=vec3(.05,.09,.08)*ca*(1.-uNight);`:''}
 ${foamTex?`vec2 tc=(p-uHX.xy)/uHX.zw;float gh=texture2D(uHT,tc).r*120.-40.;float dep=vWP.y-gh;
 float fo=(1.-smoothstep(0.,6.,dep))*smoothstep(.35,.7,vn2(p*.35+vec2(t*.4,-t*.3))+.4*(1.-smoothstep(0.,2.5,dep)));
 S.alb=mix(S.alb,vec3(.85,.88,.9),fo);S.rough=mix(S.rough,.6,fo);`:''}
 ${refl?`{float on=1.-smoothstep(.04,.12,abs(vWP.y-uRY));
 if(on>0.){vec4 rc=uRM*vec4(vWP.x,uRY,vWP.z,1.);rc.xy+=S.nw.xz*.09*rc.w/(1.+dc*.04);vec3 rf=texture2DProj(uRT,rc).rgb;
 vec3 V=normalize(cameraPosition-vWP);float fr=.03+.97*pow(1.-clamp(dot(V,S.nw),0.,1.),5.);fr=clamp(fr*1.25+.04,0.,1.)*on;
 S.emit+=rf*fr;S.envS=1.-on;}}`:''}`});
 m.userData.water={key,col,amp,foamTex};return m;}
MAT.tiber=waterMat('tiber',[.07,.075,.045],.55);MAT.pool=waterMat('pool',[.03,.17,.19],.18);

const _wB=new THREE.Box3(),_wF=new THREE.Frustum(),_wM=new THREE.Matrix4(),_wV=new THREE.Vector3(),_wP=new THREE.Vector3(),_wT=new THREE.Vector3(),_wU=new THREE.Vector3(),_wQ=new THREE.Vector4(),_wC=new THREE.Vector4(),_wPl=new THREE.Plane(),_wS=new THREE.Sphere();
function waterShown(o){for(;o;o=o.parent)if(!o.visible)return false;return true;}
function waterBase(m){return m.userData.wBase||m.material;}
// nearest water surface in view below the camera: flat meshes by their box, merged pool meshes (many heights in one mesh) by their nearest vertex
function waterPick(scene,cam,now){
  if(now-WREFL.tScan>2500){WREFL.tScan=now;const L=[];scene.traverse(o=>{if(!o.isMesh||!waterBase(o).userData||!waterBase(o).userData.water)return;L.push(o);if(o.userData.wFlat!==undefined)return;
      // GB meshes drop their arrays once uploaded: keep the surface points of the merged pool meshes while they are still there
      const g=o.geometry,a=g.attributes.position;if(!g.boundingBox){if(!a.array)return;g.computeBoundingBox();}o.updateWorldMatrix(true,false);const bb=g.boundingBox;
      if(bb.max.y-bb.min.y<.2){o.userData.wFlat=1;return;}if(!a.array||a.count>60000)return;o.userData.wFlat=0;const P=new Float32Array(a.count*3);
      for(let i=0;i<a.count;i++){_wV.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);P[i*3]=_wV.x;P[i*3+1]=_wV.y;P[i*3+2]=_wV.z;}o.userData.wPts=P;});WREFL.list=L;}
  _wM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);_wF.setFromProjectionMatrix(_wM);const cp=cam.getWorldPosition(_wP);let best=null,bd=1e9,by=0;
  for(const m of WREFL.list){if(!m.parent||m.userData.wFlat===undefined||!waterShown(m))continue;const g=m.geometry;_wB.copy(g.boundingBox).applyMatrix4(m.matrixWorld);
    const kind=WATER_KIND[waterBase(m).userData.water.key]||0,lim=kind?700:160;
    if(m.userData.wFlat){if(cp.y<_wB.max.y+.3||!_wF.intersectsBox(_wB))continue;const d=_wB.distanceToPoint(cp);if(d<lim&&d<bd){bd=d;best=m;by=(_wB.max.y+_wB.min.y)/2;}}
    else{if(_wB.distanceToPoint(cp)>lim)continue;const P=m.userData.wPts;
      for(let i=0;i<P.length;i+=3){if(P[i+1]>cp.y-.3)continue;const dx=P[i]-cp.x,dy=P[i+1]-cp.y,dz=P[i+2]-cp.z,d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d<bd&&d<lim){_wS.center.set(P[i],P[i+1],P[i+2]);_wS.radius=2;if(_wF.intersectsSphere(_wS)){bd=d;best=m;by=P[i+1];}}}}}
  return best?{mesh:best,y:by}:null;}
function waterReflSet(m){const o=WREFL.mesh;if(o===m)return;
  if(o){o.material=o.userData.wBase;delete o.userData.wBase;}WREFL.mesh=m;
  if(m){const b=m.material,w=b.userData.water;if(!b.userData.wRefl)b.userData.wRefl=waterMat(w.key,w.col,w.amp,w.foamTex,true);m.userData.wBase=b;m.material=b.userData.wRefl;}}
function waterReflTick(scene,cam,now){
  if(!WREFL.on||(typeof isTouch!=='undefined'&&(isTouch||small))||(typeof perfMode!=='undefined'&&perfMode==='smooth'&&!TEST)){waterReflSet(null);return;}
  if(now-WREFL.tPick>250){WREFL.tPick=now;WREFL.pick=waterPick(scene,cam,now);}
  const pk=WREFL.pick;if(!pk||!pk.mesh.parent){waterReflSet(null);return;}
  const t0=performance.now(),h=pk.y,vc=WREFL.cam,cp=cam.getWorldPosition(_wP);if(cp.y<h+.05){waterReflSet(null);return;}
  if(!WREFL.rt){WREFL.rt=mkRT(WREFL.size,WREFL.size,{depthBuffer:true});WREFL.uRT.value=WREFL.rt.texture;}
  const same=WREFL.mesh===pk.mesh&&WREFL.uRY.value===h;waterReflSet(pk.mesh);WREFL.uRY.value=h;
  if(same&&(WREFL.n=(WREFL.n|0)+1)%2)return;   // the mirror is redrawn every other frame: half the cost, one frame of lag
  // mirrored camera (as THREE.Reflector, plane y = h)
  _wT.set(0,0,-1).transformDirection(cam.matrixWorld).add(cp);_wU.set(0,1,0).transformDirection(cam.matrixWorld);
  vc.position.set(cp.x,2*h-cp.y,cp.z);vc.up.set(_wU.x,-_wU.y,_wU.z);vc.lookAt(_wT.x,2*h-_wT.y,_wT.z);vc.near=cam.near;vc.far=cam.far;vc.updateMatrixWorld();vc.matrixWorldInverse.copy(vc.matrixWorld).invert();vc.projectionMatrix.copy(cam.projectionMatrix);
  WREFL.uRM.value.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(vc.projectionMatrix).multiply(vc.matrixWorldInverse);
  // oblique near plane on the water, so nothing below the surface gets into the mirror
  _wPl.set(_wV.set(0,1,0),-(h-.02)).applyMatrix4(vc.matrixWorldInverse);_wC.set(_wPl.normal.x,_wPl.normal.y,_wPl.normal.z,_wPl.constant);const pm=vc.projectionMatrix,e=pm.elements;
  _wQ.x=(Math.sign(_wC.x)+e[8])/e[0];_wQ.y=(Math.sign(_wC.y)+e[9])/e[5];_wQ.z=-1;_wQ.w=(1+e[10])/e[14];_wC.multiplyScalar(2/_wC.dot(_wQ));e[2]=_wC.x;e[6]=_wC.y;e[10]=_wC.z+1-.003;e[14]=_wC.w;
  const rt0=renderer.getRenderTarget(),sa=renderer.shadowMap.autoUpdate,sn=renderer.shadowMap.needsUpdate,vis=pk.mesh.visible;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;pk.mesh.visible=false;
  renderer.setRenderTarget(WREFL.rt);renderer.state.buffers.depth.setMask(true);renderer.clear();renderer.render(scene,vc);
  pk.mesh.visible=vis;renderer.shadowMap.autoUpdate=sa;renderer.shadowMap.needsUpdate=sn;renderer.setRenderTarget(rt0);WREFL.ms=WREFL.ms*.9+(performance.now()-t0)*.1;}

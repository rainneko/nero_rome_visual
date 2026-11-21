/* ---------- first-person walk (2026-11-16) ----------
   Walk the city at eye height; made for the Palatine, works wherever the camera looks. Nothing here knows where a terrace, a palace or a house
   stands: the ground and the walls are read back from the picture.

   The ground. A merged city mesh has no vertices left in JS once it is on the GPU (gbFree, materials.js), so rays cannot be cast on it. Instead the
   scene round the walker (FPC.SPAN metres square) is drawn from straight above with a material that writes each fragment's height, and everything
   above head height is thrown away in the fragment shader: what is left is the highest thing a person could stand on or walk into, roofs and
   crowns excluded. A wall seen from straight above has no area, so two more pictures are drawn sheared along x and along z (a point moves
   sideways by FPC.K times its height): there a wall is a strip, and each of its pixels gives back a true (x, y, z). The three pictures are read
   back and folded into one grid, FPM.top: the highest sample per 0.19 m cell. A cell can be stood on when its top is no more than a step above
   the feet; stairs and ramps follow from that.
   The picture is drawn again (one pass a frame) when the walker has gone FPC.MOVE metres from its centre or FPC.DY metres up or down.

   People (FPN): three figures made here from boxes and cylinders, one InstancedMesh each, limbs swung in the vertex shader. They walk the same grid.
   Plants (FPG): one more picture from above, in plain ambient light, tells where the ground is green; tufts and a few flowers stand there and bend
   to the gusts (windGust, builders.js), which also move the tree crowns while the walk is on. Leaves drift past (FPL). */
const FPC={N:512,SPAN:96,K:.5,UP:2,DOWN:14,STEP:.5,DROP:.75,DOWN1:1,DOOR:1.5,R:.3,EYE:1.62,WALK:2.1,RUN:5.4,FOV:62,NEAR:.15,MOVE:9,DY:.25,SNAP:3,
  HILL:[0,280,230,320,200],HOME:[120,290],GRASS_R:34,GRASS_MAX:40000};
const FP={on:false,paused:false,x:0,z:0,g:0,y:0,yaw:0,pitch:0,vx:0,vz:0,vy:0,jy:0,bob:0,trail:[],keys:new Set(),save:null,G:null,drag:null,hintT:0,sh:new THREE.Vector3(),moved:0,
  onHill(x,z){const H=FPC.HILL;return polyDist(x,z,[[H[0],H[1]],[H[2],H[3]]])[0]<H[4];}};

/* ----- the height picture ----- */
const FPM={ready:false,job:null,x0:0,z0:0,cx:0,cz:0,yRef:0,cs:FPC.SPAN/FPC.N,top:null,flo:null,vt:null,veg:null,col:null,cov:null,buf:[],rt:null,rtC:null,cam:null,mat:null,hide:[],
  init(){if(this.rt)return;const N=FPC.N,o={type:THREE.UnsignedByteType,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true,stencilBuffer:true};
    this.rt=new THREE.WebGLRenderTarget(N,N,o);this.rtC=new THREE.WebGLRenderTarget(N,N,o);for(let i=0;i<4;i++)this.buf.push(new Uint8Array(N*N*4));this.cov=new Uint8Array(N*N);this.col=new Uint8Array(N*N*4);
    this.top=new Float32Array(N*N);this.flo=new Float32Array(N*N);this.vt=new Float32Array(N*N);this.veg=new Uint8Array(N*N);const s=FPC.SPAN/2;this.cam=new THREE.OrthographicCamera(-s,s,s,-s,1,100);this.cam.up.set(0,0,-1);
    this.mat=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{uSh:{value:new THREE.Vector3()},uY:{value:new THREE.Vector2()},uK:{value:1}},
      vertexShader:`uniform vec3 uSh;varying float vY;void main(){vec4 wp=vec4(position,1.);
#ifdef USE_INSTANCING
wp=instanceMatrix*wp;
#endif
wp=modelMatrix*wp;vY=wp.y;wp.x+=uSh.x*(wp.y-uSh.z);wp.z+=uSh.y*(wp.y-uSh.z);gl_Position=projectionMatrix*viewMatrix*wp;}`,
      fragmentShader:`uniform vec2 uY;uniform float uK;varying float vY;void main(){if(vY>uY.y||vY<uY.x)discard;float h=floor((vY-uY.x)/(uY.y-uY.x)*65535.),hi=floor(h/256.);gl_FragColor=vec4(hi/255.,(h-hi*256.)/255.,uK,1.);}`});},
  // hide: things that are no ground and no wall: points, lines, sprites, see-through effects (smoke, rain, birds), the sky, the far crowd, and the walk's own figures and plants.
  // veg: trees, shrubs and hedges. They are drawn after the rest with a mark (blue 128, not 255): a plant is in the way, but it is never ground,
  // or one could go up a shrub, a low crown and a higher crown onto the roofs
  lists(){const hide=[],veg=[],isV=m=>m===MAT.foliage||m===MAT.foliageD||m===MAT.bloom||(m&&/^(hedge|ivy)$/.test(m.name||''));
    const walk=o=>{if(!o.visible)return;const m=o.material;if(o===FP.G||o===skyMesh||o.isPoints||o.isLine||o.isSprite||(o.isMesh&&m&&(m===MAT.people||m.isShaderMaterial&&m.transparent))){hide.push(o);return;}
      if(o.isMesh&&m&&(Array.isArray(m)?m.some(isV):isV(m)))veg.push(o);for(const c of o.children)walk(c);};walk(W0.scene);return{hide,veg};},
  draw(J,i){const c=this.cam,m=this.mat,R=renderer,sc=W0.scene,N=FPC.N;c.position.set(J.cx,J.hi+60,J.cz);c.lookAt(J.cx,J.hi,J.cz);c.near=1;c.far=62+J.hi-J.lo;c.updateProjectionMatrix();c.updateMatrixWorld();
    m.uniforms.uSh.value.set(i===1?FPC.K:0,i===2?FPC.K:0,J.yRef);m.uniforms.uY.value.set(J.lo,J.hi);
    const rt0=R.getRenderTarget(),ov=sc.overrideMaterial,cc=R.getClearColor(new THREE.Color()),ca=R.getClearAlpha();
    for(const o of J.hide)o.visible=false;const lm=J.veg.map(o=>o.layers.mask);for(const o of J.veg)o.layers.set(2);
    sc.overrideMaterial=m;R.setRenderTarget(this.rt);R.setClearColor(0x000000,0);m.uniforms.uK.value=1;c.layers.set(0);R.clear();R.render(sc,c);
    if(J.veg.length){const ac=R.autoClear;R.autoClear=false;m.uniforms.uK.value=.5;c.layers.set(2);R.render(sc,c);R.autoClear=ac;c.layers.set(0);}
    R.readRenderTargetPixels(this.rt,0,0,N,N,this.buf[i]);
    sc.overrideMaterial=ov;for(const o of J.hide)o.visible=true;J.veg.forEach((o,k)=>o.layers.mask=lm[k]);R.setRenderTarget(rt0);R.setClearColor(cc,ca);},
  // the same window in the scene's own materials, lit by a flat white sky only: about the surface colour, whatever the hour. For the plants.
  drawColour(J){const c=this.cam,R=renderer,sc=W0.scene,N=FPC.N;c.position.set(J.cx,J.hi,J.cz);c.lookAt(J.cx,J.hi-1,J.cz);c.near=.02;c.far=J.hi-J.lo+1;c.updateProjectionMatrix();c.updateMatrixWorld();
    const rt0=R.getRenderTarget(),cc=R.getClearColor(new THREE.Color()),ca=R.getClearAlpha(),si=sun.intensity,hi=hemi.intensity,hc=hemi.color.clone(),hg=hemi.groundColor.clone();
    sun.intensity=0;hemi.intensity=Math.PI;hemi.color.setRGB(1,1,1);hemi.groundColor.setRGB(1,1,1);for(const o of J.hide)o.visible=false;
    R.setRenderTarget(this.rtC);R.setClearColor(0x000000,0);R.clear();R.render(sc,c);R.readRenderTargetPixels(this.rtC,0,0,N,N,this.col);
    for(const o of J.hide)o.visible=true;sun.intensity=si;hemi.intensity=hi;hemi.color.copy(hc);hemi.groundColor.copy(hg);R.setRenderTarget(rt0);R.setClearColor(cc,ca);},
  // what is overhead: one more picture, of everything solid from a hand above the walker's head upwards. A cell under a roof, a vault or an upper floor is "covered" (for the people: who belongs indoors)
  cover(J){const N=FPC.N,B=this.buf[3],cov=this.cov;this.draw({...J,lo:J.yRef+FPC.UP+.3,hi:J.yRef+130,hide:J.hide.concat(J.veg),veg:[]},3);for(let j=0;j<N;j++)for(let i=0;i<N;i++)cov[(N-1-j)*N+i]=B[(j*N+i)*4+2]>200?1:0;},
  // green ground under a cell (the colour picture), as the plants read it
  green(c){const N=FPC.N,i=c%N,j=(c-i)/N,o=((N-1-j)*N+i)*4,C=this.col,r=C[o],g=C[o+1],b=C[o+2];return!(g<22||g<r*1.06||g<b*1.3||(g-Math.max(r,b))<g*.1);},
  fold(J){const N=FPC.N,cs=this.cs,S=FPC.SPAN,top=this.top,flo=this.flo,vt=this.vt,veg=this.veg,rng=J.hi-J.lo,x0=J.cx-S/2,z0=J.cz-S/2,z1=J.cz+S/2,K=FPC.K;top.fill(-1e9);flo.fill(-1e9);vt.fill(-1e9);
    for(let p=0;p<3;p++){const B=this.buf[p],kx=p===1?K:0,kz=p===2?K:0;
      for(let j=0;j<N;j++){const zs=z1-(j+.5)*cs;for(let i=0;i<N;i++){const o=(j*N+i)*4,k=B[o+2];if(!k)continue;const y=J.lo+(B[o]*256+B[o+1])/65535*rng,T=k>200?top:vt;
        if(p===0){const c=(N-1-j)*N+i;if(k>200)flo[c]=y;if(y>T[c])T[c]=y;}
        else{const d=y-J.yRef,ci=Math.floor((i+.5)-kx*d/cs),cj=Math.floor((zs-kz*d-z0)/cs);if(ci<0||cj<0||ci>=N||cj>=N)continue;const c=cj*N+ci;if(y>T[c])T[c]=y;}}}}
    for(let c=0;c<N*N;c++){if(vt[c]>top[c]+.25){top[c]=1e6;veg[c]=1;}else veg[c]=0;}   // a plant standing a hand above the ground: in the way, whatever the height of the feet
    this.x0=x0;this.z0=z0;this.cx=J.cx;this.cz=J.cz;this.yRef=J.yRef;this.ready=true;},
  jobAt(x,z,y){const s=FPC.SNAP;this.sig=renderer.info.memory.geometries;return{cx:Math.round(x/s)*s,cz:Math.round(z/s)*s,yRef:y,lo:y-FPC.DOWN,hi:y+FPC.UP,stage:0,...this.lists()};},
  grid(x,z,y){this.init();const J=this.jobAt(x,z,y);for(let i=0;i<3;i++)this.draw(J,i);this.cover(J);this.fold(J);this.job=null;return J;},
  now(x,z,y){this.drawColour(this.grid(x,z,y));FPG.grow();FPN.census(true);},
  // one step a frame: three pictures, the grid, the colour picture, the plants
  step(){const J=this.job;if(!J)return;if(J.stage<3)this.draw(J,J.stage);else if(J.stage===3)this.cover(J);else if(J.stage===4){this.fold(J);fpUnstick();}   // a new picture can differ by a cell from the last: the place under the feet must stay one a body can leave
    else if(J.stage===5){if(J.moved)this.drawColour(J);}else{if(J.moved)FPG.grow();FPN.census(false);this.job=null;return;}J.stage++;},
  // force: the scene itself has changed (a model has arrived, a layer has come or gone)
  want(x,z,y){if(this.job)return;const far=Math.max(Math.abs(x-this.cx),Math.abs(z-this.cz))>FPC.MOVE,force=nFrame%30===0&&renderer.info.memory.geometries!==this.sig;
    if(far||force||Math.abs(y-this.yRef)>FPC.DY){this.job=this.jobAt(x,z,y);this.job.moved=far||force||!FPG.n;this.job.force=force;}},
  wall(x,z,g){const c=this.cell(x,z);return c>=0&&!this.veg[c]&&this.top[c]>g+1.4;},
  cell(x,z){const i=Math.floor((x-this.x0)/this.cs),j=Math.floor((z-this.z0)/this.cs);return i<0||j<0||i>=FPC.N||j>=FPC.N?-1:j*FPC.N+i;},
  at(x,z){const c=this.cell(x,z);return c<0?-1e9:this.top[c];},
  // the ground under a body of radius r whose feet are at f, or NaN: every cell under it is known, none is more than a step up, and it is no drop
  stand(x,z,f,r,drop){const lim=f+FPC.STEP;let g=this.at(x,z);if(g<-1e8||g>lim)return NaN;
    for(let k=0;k<8;k++){const a=k*.7854,t=this.at(x+Math.cos(a)*r,z+Math.sin(a)*r);if(t<-1e8||t>lim)return NaN;}
    for(let k=0;k<4;k++){const a=k*1.5708+.3927,t=this.at(x+Math.cos(a)*r*.5,z+Math.sin(a)*r*.5);if(t<-1e8||t>lim)return NaN;if(t>g)g=t;}
    return g<f-(drop||FPC.DROP)?NaN:g;},
  // the places one can walk to from (x, z), on a 0.75 m lattice, nearest first, up to cap: [x, z, ground, the place it was reached from]
  walk(x,z,y,cap){const s=.75,seen=new Set([0]),q=[[x,z,y,-1,0,0]];for(let n=0;n<q.length&&q.length<cap;n++){const c=q[n];for(const d of[[1,0],[-1,0],[0,1],[0,-1]]){const a=c[4]+d[0],b=c[5]+d[1],key=a*4096+b;if(seen.has(key))continue;
        let h=c[2];for(let k=1;k<=3&&h===h;k++)h=this.stand(c[0]+d[0]*s*k/3,c[1]+d[1]*s*k/3,h,FPC.R);   // every quarter metre of the way: a wall is one cell thick
        if(h===h){seen.add(key);q.push([x+a*s,z+b*s,h,n,a,b]);}}}return q;},
  reach(x,z,y,cap){return this.walk(x,z,y,cap).length;},
  // from above over a tall range: the level places (2.4 m round them within 0.3 m) near (x, z), nearest first, those on the ground (within 1.5 m of the terrain)
  // before podiums, terraces and flat roofs. [x, y, z, rank]
  landing(x,z){this.init();const gy=W0.gy(x,z),J={cx:x,cz:z,yRef:gy,lo:gy-30,hi:gy+130,...this.lists()};this.draw(J,0);const N=FPC.N,B=this.buf[0],cs=this.cs,rng=J.hi-J.lo;
    const H=(i,j)=>{if(i<0||j<0||i>=N||j>=N)return NaN;const o=((N-1-j)*N+i)*4;return B[o+2]>200?J.lo+(B[o]*256+B[o+1])/65535*rng:NaN;},c0=N>>1;
    const level=(i,j)=>{const h=H(i,j);if(!(h===h))return NaN;for(const rr of[6,13])for(let k=0;k<8;k++){const a=k*.7854,t=H(i+Math.round(Math.cos(a)*rr),j+Math.round(Math.sin(a)*rr));if(!(Math.abs(t-h)<=.3))return NaN;}return h;};
    const out=[];for(let r=0;r<N/2-16&&out.length<60;r+=2){const n=Math.max(1,Math.round(r*3.2));for(let k=0;k<n;k++){const a=k/n*TAU,i=c0+Math.round(Math.cos(a)*r),j=c0+Math.round(Math.sin(a)*r),h=level(i,j);if(!(h===h))continue;
        const px=x-FPC.SPAN/2+(i+.5)*cs,pz=z-FPC.SPAN/2+(j+.5)*cs;if(out.some(o=>Math.hypot(o[0]-px,o[2]-pz)<6))continue;out.push([px,h,pz,r*cs+(Math.abs(h-W0.gy(px,pz))>1.5?70:0)]);}}
    out.sort((a,b)=>a[3]-b[3]);return out.length?out:[[x,gy,z,0]];}};

/* ----- the figures are in fp-people.js ----- */

/* ----- plants: tufts and flowers where the ground is green ----- */
const FPG={n:0,nf:0,tuft:null,flower:null,
  geo(flower){const P=[],H=[],Nn=[],blade=(a,lean,h,w,r)=>{const c=Math.cos(a),s=Math.sin(a),bx=c*.03,bz=s*.03,tx=bx+c*lean,tz=bz+s*lean,px=-s*w,pz=c*w;
      const A=[bx-px,0,bz-pz],B=[bx+px,0,bz+pz],Cc=[bx+c*lean*.45+px*.6,h*.55,bz+s*lean*.45+pz*.6],D=[bx+c*lean*.45-px*.6,h*.55,bz+s*lean*.45-pz*.6],T=[tx,h,tz];
      for(const t of[[A,B,Cc],[A,Cc,D],[D,Cc,T],[Cc,B,A],[D,Cc,A],[T,Cc,D]])for(const v of t){P.push(v[0],v[1],v[2]);H.push(v[1]/h*(flower?.8:1),r);Nn.push(0,1,0);}};   // both windings, the normal up on both: a blade is lit like the ground it stands on
    if(flower){blade(.4,.03,1,.007,.3);const y=1,R=.06;for(let k=0;k<6;k++){const a0=k/6*TAU,a1=(k+1)/6*TAU,t=[[0,y+.012,0],[Math.cos(a0)*R,y,Math.sin(a0)*R],[Math.cos(a1)*R,y,Math.sin(a1)*R]];for(const o of[[0,1,2],[0,2,1]])for(const i of o){P.push(t[i][0],t[i][1],t[i][2]);H.push(1,.9);Nn.push(0,1,0);}}}
    else{const r=RNG(977);for(let k=0;k<6;k++)blade(k/6*TAU+r()*.8,.1+r()*.22,.6+r()*.4,.014+r()*.008,r());}
    const G=new THREE.InstancedBufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));G.setAttribute('aH',new THREE.Float32BufferAttribute(H,2));
    const n=flower?FPC.GRASS_MAX>>3:FPC.GRASS_MAX;G.setAttribute('aG',new THREE.InstancedBufferAttribute(new Float32Array(n*4),4));G.setAttribute('aT',new THREE.InstancedBufferAttribute(new Float32Array(n*4),4));G.instanceCount=0;return G;},
  init(){if(this.tuft)return;const mk=(flower)=>{const m=new THREE.Mesh(this.geo(flower),procMat({key:flower?'fpFlower':'fpTuft',env:.4,
        vHead:'attribute vec4 aG;attribute vec4 aT;attribute vec2 aH;uniform vec4 uFP;varying vec4 vT;varying vec2 vH;'+GL_WIND,
        vBody:`{vT=aT;vH=aH;float dC=distance(aG.xyz,cameraPosition),keep=1.-smoothstep(uFP.y*.4,uFP.y,dC+aT.a*uFP.y*.45);
 float a=h12(aG.xz*3.7)*6.2832,ca=cos(a),sa=sin(a);vec3 q=vec3(transformed.x*ca-transformed.z*sa,transformed.y,transformed.x*sa+transformed.z*ca)*aG.w*keep;
 float gu=windGust(aG.xz),bend=aH.x*aH.x*aG.w*(.04+.3*gu)*uWind.z;
 q.xz+=uWind.xy*bend+vec2(sin(uTime*4.7+a*3.+aH.y*9.),cos(uTime*3.9+a*5.+aH.y*4.))*.014*aH.x*uWind.z;q.y-=bend*bend*1.4;transformed=q+aG.xyz;}`,
        fHead:'varying vec4 vT;varying vec2 vH;',
        fSurf:flower?'S.alb=vH.y>.8?vT.rgb*(.85+.3*vH.x):vec3(.07,.13,.035);S.rough=.8;':'S.alb=vT.rgb*mix(.7,1.9,vH.x)*(.8+.4*vH.y);S.rough=.9;S.ao=mix(.6,1.,vH.x);'}));
      m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;layTag(m,'trees');FP.G.add(m);return m;};this.tuft=mk(false);this.flower=mk(true);},
  // green: clearly more green than red and blue in the ambient picture. Summer-dry hill grass is straw there and gets no tufts; watered gardens stay green
  grow(){this.init();const N=FPC.N,cs=FPM.cs,col=FPM.col,flo=FPM.flo,top=FPM.top,R=FPC.GRASS_R,gA=this.tuft.geometry.attributes,fA=this.flower.geometry.attributes,maxT=FPC.GRASS_MAX,maxF=maxT>>3;
    const i0=Math.max(1,Math.floor((FP.x-R-FPM.x0)/cs)),i1=Math.min(N-2,Math.ceil((FP.x+R-FPM.x0)/cs)),j0=Math.max(1,Math.floor((FP.z-R-FPM.z0)/cs)),j1=Math.min(N-2,Math.ceil((FP.z+R-FPM.z0)/cs));
    const wi0=Math.round(FPM.x0/cs),wj0=Math.round(FPM.z0/cs),se=U.uSeason.value,spring=se<.6||se>3.6,fl=spring?.06:se<1.6?.02:se<2.6?.008:0,dens=.55*(Q.dens||1);let n=0,nf=0;
    const FC=[[.75,.72,.6],[.6,.05,.035],[.8,.6,.08],[.34,.16,.5],[.78,.42,.5]];
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const c=j*N+i,y=flo[c];if(y<-1e8)continue;const h=hash2(wi0+i,wj0+j);if(h>dens)continue;
      const o=((N-1-j)*N+i)*4,r=col[o],g=col[o+1],b=col[o+2];if(g<22||g<r*1.06||g<b*1.3||(g-Math.max(r,b))<g*.1)continue;
      if(top[c]-y>.25||Math.abs(flo[c+1]-y)>.12||Math.abs(flo[c-1]-y)>.12||Math.abs(flo[c+N]-y)>.12||Math.abs(flo[c-N]-y)>.12)continue;
      if(i<3||j<3||i>N-4||j>N-4||Math.abs(flo[c+3]-y)>.3||Math.abs(flo[c-3]-y)>.3||Math.abs(flo[c+3*N]-y)>.3||Math.abs(flo[c-3*N]-y)>.3)continue;   // level for half a metre each way: a lawn or a bed, not the top of a clipped shrub
      const x=FPM.x0+(i+hash2(wi0+i+911,wj0+j))*cs,z=FPM.z0+(j+hash2(wi0+i,wj0+j+577))*cs;if(Math.hypot(x-FP.x,z-FP.z)>R)continue;
      const k=hash2(wi0+i+31,wj0+j+17),k2=hash2(wi0+i+71,wj0+j+113);
      if(k2<fl&&nf<maxF){const fc=FC[Math.floor(hash2(wi0+i+5,wj0+j+9)*FC.length)];fA.aG.setXYZW(nf,x,y-.01,z,.16+.2*k);fA.aT.setXYZW(nf,fc[0],fc[1],fc[2],k);nf++;}
      if(n<maxT){const v=(.85+.5*k)/255;gA.aG.setXYZW(n,x,y-.02,z,.17+.2*k);gA.aT.setXYZW(n,Math.min(.5,r*v),Math.min(.6,g*v*1.1),Math.min(.4,b*v),k2);n++;}}
    this.n=n;this.nf=nf;this.tuft.geometry.instanceCount=n;this.flower.geometry.instanceCount=nf;for(const A of[gA,fA]){A.aG.needsUpdate=true;A.aT.needsUpdate=true;}}};

/* ----- leaves on the wind ----- */
const FPL={pts:null,init(){if(this.pts)return;const n=260,A=new Float32Array(n*3);const r=RNG(4127);for(let i=0;i<n*3;i++)A[i]=r();const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(A,3));
    this.pts=new THREE.Points(G,fxMat({side:THREE.DoubleSide,uniforms:{uPx:SMOKEPX,uEye:{value:new THREE.Vector3()},uWind:U.uWind},
      vs:`uniform float uPx;uniform vec3 uEye;uniform vec4 uWind;varying vec3 vW;varying vec2 vR;varying float vK;
void main(){vec3 bx=vec3(44.,15.,44.),sd=position;float t=uTime,sp=3.2+2.4*sd.y;
 vec3 p=sd*bx;p.xz+=uWind.xy*t*sp;p.y-=t*(.25+.5*sd.z);p.xz+=vec2(sin(t*1.3+sd.x*40.),cos(t*1.1+sd.z*33.))*.6;p.y+=sin(t*.9+sd.y*27.)*.5;
 p=mod(p-uEye+bx*.5,bx)-bx*.5+uEye;vW=p;vK=fract(sd.x*17.+sd.z*5.);vR=vec2(cos(t*(1.5+sd.x*3.)+sd.y*9.),sin(t*(1.5+sd.x*3.)+sd.y*9.));
 vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float fade=1.-smoothstep(16.,21.,length(p-uEye));gl_PointSize=uWind.z*fade*(.05+.05*sd.y)*uPx/max(-mv.z,.3);}`,
      fs:`varying vec3 vW;varying vec2 vR;varying float vK;
void main(){vec2 q=gl_PointCoord-.5;q=vec2(q.x*vR.x-q.y*vR.y,q.x*vR.y+q.y*vR.x);if(length(q*vec2(1.,2.4))>.46)discard;
 float s=uSeason;vec3 c=s<.6||s>3.6?mix(vec3(.8,.62,.64),vec3(.82,.8,.7),vK):s<1.6?mix(vec3(.16,.22,.06),vec3(.4,.34,.14),vK):s<2.6?mix(vec3(.62,.4,.06),vec3(.34,.14,.05),vK):mix(vec3(.25,.17,.1),vec3(.34,.3,.2),vK);
 vec3 l=uSunCol*(1.-uNight)*1.1+uHazeCol*.45+.02;gl_FragColor=vec4(atmo(c*l*(.8+.4*q.y),vW),1.);}`}));
    this.pts.material.transparent=false;this.pts.material.depthWrite=true;this.pts.frustumCulled=false;FP.G.add(this.pts);}};

/* ----- the walk ----- */
function fpNote(s){const el=$('#fpNote');if(el){el.textContent=s;el.hidden=!s;}}
// One-sided faces (roof sheets, parapet slabs, model walls that have no back) are see-through from behind. From the air nobody is behind them;
// on foot one is, all the time. While walking, every opaque lit material draws both sides (its shadow pass keeps the back faces it used before);
// new models that arrive later are picked up every 3 s. Leaving the walk puts every material back.
const FPS={M:new Set(),t:0};
function fpSides(on){if(!W0)return 0;if(!on){FPS.M.forEach(m=>{m.side=THREE.FrontSide;m.shadowSide=null;m.needsUpdate=true;});const n=FPS.M.size;FPS.M.clear();return n;}
  let n=0;W0.scene.traverse(o=>{if(!o.isMesh||!o.material)return;const A=Array.isArray(o.material)?o.material:[o.material];
    for(const m of A){if(!m||m.side!==THREE.FrontSide||m.transparent||m.isShaderMaterial||m.isMeshBasicMaterial||FPS.M.has(m)||(m.userData&&m.userData.water))continue;
      m.side=THREE.DoubleSide;m.shadowSide=THREE.BackSide;m.needsUpdate=true;FPS.M.add(m);n++;}});return n;}
function fpEnter(x,z){if(FP.on||!W0||PAGE!=='rome')return false;
  // the palaces and temples are models that arrive some seconds after the page: land once they stand, or the walker ends up inside one
  if(typeof romeLoadModels==='function'&&ROME.GLB.length&&!window.__romeReady){romeLoadModels();if(!FP.pend){fpNote('正在等宫殿和神庙的模型就位……');FP.pend=setInterval(()=>{if(window.__romeReady){clearInterval(FP.pend);FP.pend=0;fpNote('');fpEnter(x,z);}},250);}return false;}
  if(x==null){x=view.tgt.x;z=view.tgt.z;if(!FP.onHill(x,z)){x=FPC.HOME[0];z=FPC.HOME[1];}}
  if(!FP.G){FP.G=new THREE.Group();FP.G.name='fp';W0.scene.add(FP.G);}
  FP.save={tgt:view.tgt.clone(),yaw:view.yaw,pitch:view.pitch,dist:view.dist,fov:camera.fov,near:camera.near,far:camera.far,labels:settings.labels};
  // where to stand: the first of the level places from which one can walk some way (about 400 m2), so not a walled-in corner, a podium without steps or a roof
  FP.G.visible=false;const C=FPM.landing(x,z);let p=null,pn=-1;for(let i=0;i<C.length&&i<8;i++){const c=C[i];FPM.grid(c[0],c[2],c[1]);const s=fpSettle(c[0],c[2],c[1]);if(!s)continue;const n=FPM.reach(s[0],s[2],s[1],700);if(n>pn){pn=n;p=s;}if(n>=700)break;}
  if(!p)p=C[0];FP.x=p[0];FP.z=p[2];FP.g=FP.y=p[1];FP.yaw=view.yaw;FP.pitch=0;FP.vx=FP.vz=0;FP.bob=0;FP.trail.length=0;FP.keys.clear();FP.moved=0;
  FP.on=true;FP.paused=false;camT=null;U.uWind.value.z=1;U.uFP.value.set(1,FPC.GRASS_R-9,0,0);FPN.init();FPL.init();FPN.clear();FPG.n=0;
  FPM.now(FP.x,FP.z,FP.g);FP.G.visible=true;fpSides(true);FPS.t=performance.now();
  // face the way one can walk farthest (of 16), the bird's-eye heading breaking ties: not a wall or a tree in the face
  {let by=FP.yaw,bd=-1;for(let k=0;k<16;k++){const yw=view.yaw+k*TAU/16,fx=-Math.sin(yw),fz=-Math.cos(yw);let g=FP.g,d=0;while(d<30){g=FPM.stand(FP.x+fx*(d+.35),FP.z+fz*(d+.35),g,FPC.R);if(!(g===g))break;d+=.35;}if(d>bd+.5){bd=d;by=yw;}}FP.yaw=by;}
  camera.fov=FPC.FOV;document.body.classList.add('fp');$('#tWalk')&&$('#tWalk').classList.add('on');fpHud();resize();
  FP.hintT=performance.now()+9000;$('#fpHint').classList.remove('gone');fpLock();W0.sdirty=1;return true;}
function fpExit(){if(!FP.on)return;FP.on=false;FP.paused=false;const s=FP.save;view.tgt.copy(s.tgt);view.yaw=s.yaw;view.pitch=s.pitch;view.dist=s.dist;camera.fov=s.fov;camera.near=s.near;camera.far=s.far;camera.updateProjectionMatrix();
  U.uWind.value.z=0;U.uFP.value.x=0;FP.G.visible=false;fpSides(false);FPN.clear();FPM.job=null;document.body.classList.remove('fp','fp-paused');$('#tWalk')&&$('#tWalk').classList.remove('on');
  if(document.pointerLockElement===canvas)document.exitPointerLock();resize();W0.sdirty=1;}
function fpLock(){if(isTouch||TEST)return;try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(e){}}
function fpPause(on){if(!FP.on)return;FP.paused=on;FP.keys.clear();document.body.classList.toggle('fp-paused',on);if(!on)fpLock();}
// after the scene has changed under the walker: if the place is no longer one to stand on, move to the nearest that is
function fpUnstick(){const g=FPM.stand(FP.x,FP.z,FP.g,FPC.R);if(g===g)return;const s=fpSettle(FP.x,FP.z,FP.g)||fpSettle(FP.x,FP.z,FPM.at(FP.x,FP.z));if(s){FP.x=s[0];FP.g=FP.y=s[1];FP.z=s[2];FP.trail.length=0;}}
// the nearest cell a body can stand on, searching outwards (the landing is from a coarser look)
function fpSettle(x,z,y){for(let r=0;r<6;r+=.125)for(let k=0;k<(r?12:1);k++){const a=k/12*TAU,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,t=FPM.at(px,pz);if(t<-1e8||Math.abs(t-y)>1.2)continue;const g=FPM.stand(px,pz,t,FPC.R);if(g===g)return[px,g,pz];}return null;}
function fpHud(){const el=$('#fpWhere');if(el)el.textContent='第一人称 · '+(FP.onHill(FP.x,FP.z)?'帕拉蒂尼山':'罗马城')+' · '+STATES[Math.max(0,curS)].t.split(' · ')[0];}
function fpTick(t,dt){if(!FP.on)return;const K=FP.keys;
  {const n=performance.now();if(n-FPS.t>3000){FPS.t=n;fpSides(true);}}
  if(!FP.paused){
    const run=K.has('shift'),sp=run?FPC.RUN:FPC.WALK;let mf=0,ms=0;if(K.has('w')||K.has('arrowup'))mf+=1;if(K.has('s')||K.has('arrowdown'))mf-=1;if(K.has('d'))ms+=1;if(K.has('a'))ms-=1;
    if(K.has('arrowleft')||K.has('q'))FP.yaw+=1.9*dt;if(K.has('arrowright')||K.has('e'))FP.yaw-=1.9*dt;
    const fx=-Math.sin(FP.yaw),fz=-Math.cos(FP.yaw),l=Math.hypot(mf,ms)||1,tvx=(fx*mf-fz*ms)/l*sp,tvz=(fz*mf+fx*ms)/l*sp,e=1-Math.exp(-9*dt);FP.vx+=(tvx-FP.vx)*e;FP.vz+=(tvz-FP.vz)*e;
    let dx=FP.vx*dt,dz=FP.vz*dt;const dist=Math.hypot(dx,dz),g0=FP.g;
    if(dist>1e-5&&FPM.ready){const n=Math.ceil(dist/.07);dx/=n;dz/=n;
      for(let i=0;i<n;i++){let g=fpTry(FP.x+dx,FP.z+dz);if(g===g){FP.x+=dx;FP.z+=dz;}else{g=fpTry(FP.x+dx,FP.z);if(g===g){FP.x+=dx;FP.vz*=.5;}else{g=fpTry(FP.x,FP.z+dz);if(g===g){FP.z+=dz;FP.vx*=.5;}else{FP.vx=FP.vz=0;break;}}}
        const st=Math.hypot(dx,dz);FP.g=g;FP.moved+=st;FP.bob+=st*(run?3.1:4.1);const T=FP.trail,last=T[T.length-1];if(!last||Math.hypot(FP.x-last[0],FP.z-last[1])>.2){T.push([FP.x,FP.z,FP.g]);if(T.length>5)T.shift();}}}
    else if(FPM.ready){const g=FPM.stand(FP.x,FP.z,FP.g,FPC.R*.5);if(g===g)FP.g=g;}   // standing still: the grid under the feet may have been drawn again
    // figures are in the way too
    for(const a of FPN.list){const ex=FP.x-a.x,ez=FP.z-a.z,d=Math.hypot(ex,ez);if(d<.62&&d>1e-3&&Math.abs(a.y-FP.g)<1.2){const px=a.x+ex/d*.62,pz=a.z+ez/d*.62,g=FPM.stand(px,pz,FP.g,FPC.R);if(g===g){FP.x=px;FP.z=pz;FP.g=g;}}}
    // a jump (Space): 0.65 m up; in the air a ledge up to 0.45 m higher than a step can be reached
    {const d=FP.g-g0;if(FP.jy>0||d<-.3){FP.y+=d;FP.jy-=d;}}   // off a ledge (up to a metre down, on foot or in a jump): a fall, not a snap
    if(K.has(' ')&&FP.jy<=0&&!FP.vy&&FPM.ready)FP.vy=4.3;
    if(FP.vy||FP.jy>0){FP.jy+=FP.vy*dt;FP.vy-=14*dt;if(FP.jy<=0){FP.jy=0;FP.vy=0;}}
    FP.y+=(FP.g-FP.y)*(1-Math.exp(-(FP.g>FP.y?13:18)*dt));
    FPM.want(FP.x,FP.z,FP.g);FPM.step();FPN.tick(dt);
    if(FP.moved>1.5&&performance.now()>FP.hintT-6500)FP.hintT=Math.min(FP.hintT,performance.now()+1200);}
  if(FP.hintT&&performance.now()>FP.hintT){FP.hintT=0;$('#fpHint').classList.add('gone');}
  if(nFrame%12===0){const a=FP.paused?null:FPN.facing(),el=$('#fpWho');if(a){const I=FPN.info[a.k];if(el.dataset.k!==a.k){el.dataset.k=a.k;el.innerHTML='<b>'+I[0]+'</b> <i>'+I[1]+'</i><br>'+I[2];}el.classList.add('on');}else el.classList.remove('on');if(nFrame%120===0)fpHud();}
  // the wind turns slowly
  const wa=.6+.35*Math.sin(t*.021);U.uWind.value.x=Math.cos(wa);U.uWind.value.y=Math.sin(wa);
  if(FPL.pts)FPL.pts.material.uniforms.uEye.value.copy(camera.position);
  fpCam();}
// a move to (x, z): standable, and not a scramble (more than 50 degrees over the last metre of the way)
// right click: through one door or thin wall. Straight ahead, the first thing in the way within 1.6 m, no thicker than 1.5 m, with ground to stand on behind it within a metre of this level
// The centre ray first, then rays 0.15 and 0.3 m to either side (a door of bars lets the centre ray through its gaps); each ray judges a door the same way.
function fpDoor(){if(!FP.on||FP.paused||!FPM.ready||FP.jy>0)return false;const fx=-Math.sin(FP.yaw),fz=-Math.cos(FP.yaw);let any=false;
  const ray=o=>{const ox=FP.x-fz*o,oz=FP.z+fx*o;let hit=-1;
    for(let d=.2;d<=1.6+FPC.DOOR+.8;d+=.1){const x=ox+fx*d,z=oz+fz*d,t=FPM.at(x,z);if(hit<0){if(t>FP.g+FPC.STEP){if(d>1.6)break;hit=d;any=true;}continue;}
      if(d-hit>FPC.DOOR+.8)break;if(t<-1e8||Math.abs(t-FP.g)>1)continue;const g=FPM.stand(x,z,t,FPC.R);if(g===g&&d-hit>=.3){FP.x=x;FP.z=z;FP.g=FP.y=g;FP.vx=FP.vz=0;FP.trail.length=0;return true;}}return false;};
  for(const o of[0,.15,-.15,.3,-.3])if(ray(o))return true;
  fpNote(any?'这里穿不过去（太厚，或者后面没有落脚的地方）。':'面前没有门或墙。');setTimeout(()=>{if(FP.on)fpNote('');},1600);return false;}
function fpTry(x,z){if(FP.jy>.05){const g=FPM.stand(x,z,FP.g+Math.min(FP.jy,.45),FPC.R,FPC.DOWN1+.45);if(g===g)return g;}const g=FPM.stand(x,z,FP.g,FPC.R,FPC.DOWN1);if(!(g===g))return NaN;const T=FP.trail;if(T.length){const p=T[0],d=Math.hypot(x-p[0],z-p[1]);if(d>.3&&g-p[2]>1.19*d+.3)return NaN;}return g;}
function fpCam(){const b=Math.abs(Math.sin(FP.bob))*.032*Math.min(1,Math.hypot(FP.vx,FP.vz)/FPC.WALK);camera.position.set(FP.x,FP.y+FP.jy+FPC.EYE-(FP.jy>0?0:b),FP.z);camera.rotation.set(FP.pitch,FP.yaw,0,'YXZ');
  if(camera.near!==FPC.NEAR){camera.near=FPC.NEAR;camera.updateProjectionMatrix();}view.tgt.set(FP.x,FP.y,FP.z);view.dist=60;
  const s=6;FP.sh.set(Math.round(FP.x/s)*s,Math.round(FP.y/2)*2,Math.round(FP.z/s)*s);}   // the shadow box moves in 6 m steps, so the map is drawn again on a step, not on every pace
function fpInit(){if(FP.inited)return;FP.inited=true;const b=$('#tWalk');if(b){if(isTouch)b.hidden=true;b.onclick=()=>{if(FP.on){fpExit();return;}if(PAGE!=='rome')setPage('rome','palatine',()=>setTimeout(()=>fpEnter(FPC.HOME[0],FPC.HOME[1]),700));else fpEnter();b.blur();};}
  addEventListener('keydown',e=>{if(!FP.on)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA'))return;const k=e.key.toLowerCase();
    if(k==='escape'){if(FP.paused||isTouch||TEST||document.pointerLockElement!==canvas)FP.paused?fpExit():fpPause(true);e.preventDefault();return;}   // with the pointer locked the browser takes Esc itself and unlocks: that pauses (pointerlockchange)
    if(['w','a','s','d','q','e',' ','shift','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){FP.keys.add(k);e.preventDefault();}},true);
  addEventListener('keyup',e=>FP.keys.delete(e.key.toLowerCase()),true);addEventListener('blur',()=>FP.keys.clear());
  document.addEventListener('pointerlockchange',()=>{if(FP.on&&document.pointerLockElement!==canvas&&!FP.paused)fpPause(true);});
  document.addEventListener('mousemove',e=>{if(!FP.on||FP.paused)return;if(document.pointerLockElement===canvas){FP.yaw-=e.movementX*.0022;FP.pitch=clamp(FP.pitch-e.movementY*.0022,-1.25,1.25);}});
  // without a pointer lock (it was refused, or a test): drag to look
  canvas.addEventListener('pointerdown',e=>{if(!FP.on)return;if(FP.paused){fpPause(false);return;}if(document.pointerLockElement!==canvas){FP.drag=[e.clientX,e.clientY];fpLock();}});
  canvas.addEventListener('pointermove',e=>{if(!FP.on||!FP.drag||document.pointerLockElement===canvas)return;FP.yaw-=(e.clientX-FP.drag[0])*.004;FP.pitch=clamp(FP.pitch-(e.clientY-FP.drag[1])*.004,-1.25,1.25);FP.drag=[e.clientX,e.clientY];});
  addEventListener('pointerup',()=>{FP.drag=null;});addEventListener('mousedown',e=>{if(FP.on&&!FP.paused&&e.button===2){fpDoor();e.preventDefault();}},true);
  const ov=$('#fpPause');if(ov){ov.querySelector('[data-a="go"]').onclick=()=>fpPause(false);ov.querySelector('[data-a="out"]').onclick=fpExit;}const x=$('#fpOut');if(x)x.onclick=fpExit;
  W0.anim.push(fpTick);
  window.__fp={enter:fpEnter,exit:fpExit,state:()=>({on:FP.on,posts:FPN.list.filter(a=>a.post).length,x:FP.x,y:FP.y,z:FP.z,jy:FP.jy,yaw:FP.yaw,pitch:FP.pitch,ready:FPM.ready,people:FPN.list.map(a=>a.k).join(','),zones:FPN.zones,misplaced:FPM.ready?FPN.list.filter(a=>{const R=FP_ROLES[a.lead?a.lead.k:a.k],q=FPN.zone(a.x,a.z,a.y);return'EGM'.indexOf(q)>=0&&R.z&&R.z.indexOf(q)<0&&!(q==='M'&&R.z.indexOf('C')>=0);}).map(a=>a.k+'@'+FPN.zone(a.x,a.z,a.y)).join(','):'',zone:FPM.ready?FPN.zone(FP.x,FP.z,FP.g):'',tufts:FPG.n,flowers:FPG.nf,hill:FP.onHill(FP.x,FP.z)}),
    look:(yaw,pitch)=>{FP.yaw=yaw;FP.pitch=pitch||0;},door:fpDoor,key:(k,on)=>{on?FP.keys.add(k):FP.keys.delete(k);},FP,FPM,FPN,FPG};}

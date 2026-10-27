/* ================= 小说图层（按章节显隐） ================= */
const SMOKEPX={value:600};
function smokeSys(em,o){const per=o.per||36,n=em.length*per,P=new Float32Array(n*3),A=new Float32Array(n*2),R=RNG(o.seed||3);
  for(let e=0;e<em.length;e++)for(let i=0;i<per;i++){const k=e*per+i;P[k*3]=em[e][0];P[k*3+1]=em[e][1];P[k*3+2]=em[e][2];A[k*2]=R();A[k*2+1]=R();}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('aR',new THREE.BufferAttribute(A,2));
  const m=new THREE.Points(G,fxMat({add:!!o.add,uniforms:{uCol:{value:new THREE.Color(...o.col)},uRise:{value:o.rise||40},uSize:{value:o.size||12},uRate:{value:o.rate||.05},
    uOff:{value:new THREE.Vector3()},uDrift:{value:new THREE.Vector3(...(o.drift||[8,0,4]))},uAlpha:{value:o.alpha||.5},uPx:SMOKEPX,uEmit:{value:o.emit||0}},
   vs:`attribute vec2 aR;uniform float uRise,uSize,uRate,uAlpha,uPx;uniform vec3 uOff,uDrift;varying float vA;varying vec3 vP;varying float vT;
   void main(){float t=fract(uTime*uRate+aR.x);vec3 p=position+uOff;p.y+=t*uRise;p+=uDrift*t*t*uRise*.05+vec3(sin(aR.y*40.+uTime*.3),0.,cos(aR.y*31.+uTime*.25))*t*uRise*.13;
   vP=p;vT=t;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float s=uSize*(.35+1.7*t);gl_PointSize=clamp(s*uPx/max(-mv.z,1.),1.,600.);vA=uAlpha*smoothstep(0.,.07,t)*(1.-t);}`,
   fs:`uniform vec3 uCol;uniform float uEmit;varying float vA;varying vec3 vP;varying float vT;void main(){vec2 q=gl_PointCoord-.5;float r=length(q);float n=vn2(gl_PointCoord*3.5+vP.xz*.05+vT*2.);
   float a=smoothstep(.5,.12,r)*vA*(.55+.7*n);if(a<.004)discard;vec3 c=uCol*(uSunCol*max(uSunDir.y+.1,0.)*.8+uHazeCol*.7+.03)+uCol*uEmit*(1.-vT);c=atmo(c,vP);gl_FragColor=vec4(c,a);}`}));
  m.frustumCulled=false;m.renderOrder=3;return m;}
const LAMPMATS=[];function lampMat(r,g,b,k){const m=new THREE.MeshBasicMaterial({color:new THREE.Color(r,g,b)});m.userData={base:[r,g,b],k};LAMPMATS.push(m);return m;}
function makeLayer(W,name,rise,fn){const G=new THREE.Group();G.name=name;G.userData.rise=rise||0;G.visible=false;W.scene.add(G);W.layers[name]=G;
  if(fn){const g=new GB(1<<14),gl=new GB(1<<10),tr=W.trees,pp=W.people;W.trees=[];W.people=[];W.colGroup=G;fn(g,G,gl);
    const m=g.mesh(MAT.city);if(m)G.add(m);const mg=gl.mesh(MAT.glass,false);if(mg){mg.renderOrder=2;G.add(mg);}
    flushColumns(W);flushTrees(W,W.trees,G);flushPeople(W,W.people,G);W.colGroup=null;W.trees=tr;W.people=pp;}return G;}
/* industrial pieces (frame-local) */
function blastFurnace(g,F,x,z){g.set(22,.35);lathe(g,F,x,-3,z,[[7.5,0],[7.5,3],[6.8,11],[5.2,17],[4.6,18.5],[4.9,19],[4.9,20],[0,20]],4);
  g.set(19,.3);box(g,F,x,0,z+5.4,1.2,1.4,.5,31);
  rectWalls(g,F,x,z+15,18,13,-1,6.5,0,{part:9,seed:.4,sty:24,fl:2,nSt:1,gH:6.5,sH:4,lit:1,doorSide:2});roof(g,F,'gable',x,z+15,18,13,6.5,22*DEG,.6,.3,{part:9,seed:.4,nSt:1,gH:6.5,sH:4,floorY:0});
  g.set(3,.3);box(g,F,x,16,z-11,1.6,1,9,31);for(const dz of[-18,-12])box(g,F,x,-1,z+dz,.4,17,.4,31);
  g.set(9,.5,0,1);lathe(g,F,x+11,-1,z-4,[[2.4,0],[2.4,1],[2,11],[1.7,25],[1.55,33],[1.85,33.6],[1.85,34.6],[1.35,34.6]],12);return F.p(x+11,35,z-4);}
function openHearth(g,F,x,z){rectWalls(g,F,x,z,48,18,-1,10,0,{part:9,seed:.6,sty:24,fl:8,nSt:2,gH:5,sH:5,lit:1});roof(g,F,'gable',x,z,48,18,10,20*DEG,.6,.5,{part:9,seed:.6,nSt:2,gH:5,sH:5,floorY:0});
  g.set(19,.3);for(let i=-2;i<=2;i++)box(g,F,x+i*8,.4,z+9.06,1.1,1.5,.06,1);g.set(9,.6,0,1);box(g,F,x-28,-1,z,4,6,8,31);box(g,F,x+28,-1,z,4,6,8,31);
  const tops=[];for(const sx of[-1,1]){lathe(g,F,x+sx*28,5,z,[[1.8,0],[1.5,14],[1.3,22],[1.55,22.5],[1.55,23.3],[1.1,23.3]],10);tops.push(F.p(x+sx*28,28.5,z));}return tops;}
function kiln(g,F,x,z){g.set(9,.7,0,1);lathe(g,F,x,-1,z,[[5.2,0],[5.2,7],[4.4,11],[2.4,15.5],[1.7,18],[2,18.5],[2,19.3],[1.3,19.3]],12);g.set(3,.4);box(g,F,x,10,z-6.5,2.5,.5,2.5,31);for(const sx of[-1,1])box(g,F,x+sx*2,-1,z-8,.3,11,.3,31);return F.p(x,19,z);}
function glassCone(g,F,x,z,gl){g.set(9,.45,0,1);lathe(g,F,x,-1,z,[[11.5,0],[11.5,5],[10.6,9],[8.4,16],[5.4,23],[3.4,28],[2.9,29],[3.2,29.5],[3.2,30.4],[2.4,30.4]],16);
  g.set(7,.3);for(const s of[1,-1]){const S=F.sub(x,0,z+s*11.65,s>0?0:Math.PI);g.poly(arch(g,S,0,1.8,0,2.6,0),S.d(0,0,1));}
  rectWalls(g,F,x+28,z,34,12,-1,5,0,{part:9,seed:.45,sty:1,fl:8,nSt:1,gH:5,sH:4,lit:1});roof(gl,F,'gable',x+28,z,34,12,5,24*DEG,.4,.5,null);
  g.set(19,.3);box(g,F,x+28,0,z,9,1.1,2,31);g.set(18,.3);box(g,F,x+28,5+6*Math.tan(24*DEG),z,17.2,.25,.25,31);for(let i=-16;i<=16;i+=4)box(g,F,x+i+28,5,z,.12,6*Math.tan(24*DEG),.12,31);return F.p(x,31,z);}
function soapWorks(g,F,x,z){g.set(9,.4,0,1);box(g,F,x,-1,z,13,1.6,7.6,31);g.set(3,.4);for(const sx of[-1,1])for(const sz of[-1,1])box(g,F,x+sx*12,0,z+sz*7,.35,6,.35,31);roof(g,F,'gable',x,z,26,15,6,22*DEG,.8,.65,null);
  const tops=[];for(let i=0;i<4;i++){const kx=x-9+i*6;g.set(19,.3);box(g,F,kx,0,z,1.4,.9,1.4,31);lathe(g,F,kx,.9,z,[[2.2,0],[2.45,.9],[2.35,2.5],[2.05,2.8],[0,2.8]],14,17);tops.push(F.p(kx,4,z));}
  g.set(3,.3);for(let r=0;r<4;r++)box(g,F,x+22,0,z-6+r*4,6,1.6,.15,31);return tops;}
function leadChambers(g,F,x,z){rectWalls(g,F,x,z,36,14,-1,15,0,{part:16,seed:.3,sty:0,fl:1,nSt:1,gH:15,sH:4,lit:0});roof(g,F,'gable',x,z,36,14,15,14*DEG,.5,.3,null);
  g.set(3,.4);for(let i=-3;i<=3;i++){box(g,F,x+i*6,-1,z+7.3,.3,16,.3,31);box(g,F,x+i*6,-1,z-7.3,.3,16,.3,31);}
  g.set(16,.4);box(g,F,x+22,-1,z,3,24,3,31);box(g,F,x+18,17,z,4,.8,.8,31);g.set(9,.4,0,1);lathe(g,F,x-22,-1,z,[[1.6,0],[1.3,21],[1.5,21.6],[1.5,22.2],[1,22.2]],10);return F.p(x-22,22,z);}
function sodaWorks(g,F,x,z){rectWalls(g,F,x,z,30,12,-1,6,0,{part:9,seed:.8,sty:24,fl:8,nSt:1,gH:6,sH:4,lit:1});roof(g,F,'gable',x,z,30,12,6,22*DEG,.6,.8,{part:9,seed:.8,nSt:1,gH:6,sH:4,floorY:0});
  g.set(20,.3);lathe(g,F,x+28,0,z+4,[[11,0],[6,3.4],[0,5.5]],10);lathe(g,F,x+22,0,z-10,[[8,0],[4,2.6],[0,4]],10);
  g.set(9,.8,0,1);lathe(g,F,x-17,-1,z,[[1.5,0],[1.25,19],[1.45,19.6],[1.45,20.2],[1,20.2]],10);return F.p(x-17,20,z);}
function scaffold(g,F,cx,cz,r,y0,h,broken){g.set(3,broken?.9:.3);const n=12;for(let i=0;i<n;i++){const a=i/n*TAU;if(broken&&i%3===1)continue;box(g,F,cx+Math.cos(a)*r,y0,cz+Math.sin(a)*r,.18,h*(broken&&i%4===0?.6:1),.18,31);}
  for(let y=y0+2;y<y0+h;y+=2.4){for(let i=0;i<n;i++){if(broken&&(i+Math.floor(y))%3===0)continue;const a0=i/n*TAU,a1=(i+1)/n*TAU,x0=cx+Math.cos(a0)*r,z0=cz+Math.sin(a0)*r,x1=cx+Math.cos(a1)*r,z1=cz+Math.sin(a1)*r;
    const S=F.sub((x0+x1)/2,0,(z0+z1)/2,Math.atan2(-(z1-z0),x1-x0));box(g,S,0,y,0,Math.hypot(x1-x0,z1-z0)/2,.14,.14,31);}}}
/* pagoda: 8 sides, 9 tiers, glazed tiles as instances */
function buildPagoda(W,x,z){const y0=W.gy(x,z),grp=new THREE.Group();W.scene.add(grp);const F=frame(x,y0,z,Math.PI/8),base=new GB(1<<13);
  base.set(2,.45);lathe(base,F,0,-5,0,[[19,0],[19,7.8],[17,7.8],[17,8.6],[0,8.6]],8);for(let i=0;i<6;i++)box(base,F,0,0,18.6+i*.55+.27,5,3.4-i*.5,.27,1|2|8|16);
  grp.add(base.mesh(MAT.city));
  const tiers=[],scaf=[],tileGeo=new THREE.BoxGeometry(.98,.47,.16),M=new THREE.Matrix4(),q=new THREE.Quaternion(),E=new THREE.Euler(0,0,0,'YXZ'),S1=new THREE.Vector3(1,1,1),Pv=new THREE.Vector3(),R=RNG(77);
  const lampM=[],pal=[[.5,.76,.6],[.92,.73,.3],[.33,.48,.8]];let y=3.6;
  for(let i=0;i<9;i++){const r=10-i*.62,h=i===0?8:6.3,T=new THREE.Group();grp.add(T);const g=new GB(1<<12),gr=new GB(1<<12),gg=new GB(1<<10);
    const ap=r*.97*Math.cos(Math.PI/8),fw=2*r*.97*Math.sin(Math.PI/8);g.set(7,.3);lathe(g,F,0,y,0,[[r*.97,0],[r*.97,h],[0,h]],8);
    const cols=Math.floor(fw/1.04),rows=Math.floor((h-1.5)/.5),cw=[],cc=[],mats=[];
    for(let k=0;k<8;k++){const ac=(k+.5)/8*TAU,nx=Math.cos(ac),nz=Math.sin(ac),tx=-nz,tz=nx,win=k%2===0;
      for(let rI=0;rI<rows;rI++)for(let c=0;c<cols;c++){const u=(c-(cols-1)/2)*1.04,v=.35+rI*.5;if(win&&Math.abs(u)<1.5&&v>.4&&v<4.4)continue;
        const p=F.p(nx*(ap+.09)+tx*u,y+v,nz*(ap+.09)+tz*u),wn=F.d(nx,0,nz);E.set((R()-.5)*.09,Math.atan2(wn[0],wn[2])+(R()-.5)*.07,(R()-.5)*.05);q.setFromEuler(E);Pv.set(p[0],p[1],p[2]);M.compose(Pv,q,S1);mats.push(M.clone());
        const w=.9+.12*R();cw.push(w,w,w*.97);const band=(rI%4===0)||(c===0||c===cols-1);const pc=pal[(i+k+rI)%3];if(band){cc.push(pc[0]*w,pc[1]*w,pc[2]*w);}else cc.push(w,w,w*.97);}
      if(win){gg.set(29,.5);const z0=ap+.06,S=F.sub(nx*z0,0,nz*z0,Math.atan2(nx,nz));gg.poly(arch(gg,S,0,1.15,y+.8,2.6,0),S.d(0,0,1));g.set(7,.3);const S2=F.sub(nx*(ap-.2),0,nz*(ap-.2),Math.atan2(nx,nz));g.poly(arch(g,S2,0,1.3,y+.6,2.8,0),S2.d(0,0,1));}}
    const im=new THREE.InstancedMesh(tileGeo,MAT.glaze,mats.length);mats.forEach((m,j)=>im.setMatrixAt(j,m));im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cw),3);
    im.castShadow=true;im.receiveShadow=true;T.add(im);
    const ye=y+h,ro=r+3.3,yo=ye-1.5,lift=1.5,am=r*Math.cos(Math.PI/8);gr.set(1,(i%3)/3+.1);
    for(let k=0;k<8;k++){const a0=k/8*TAU,a1=(k+1)/8*TAU,ac=(k+.5)/8*TAU;const P0=F.p(Math.cos(a0)*r,ye+.25,Math.sin(a0)*r),P1=F.p(Math.cos(a1)*r,ye+.25,Math.sin(a1)*r),PM=F.p(Math.cos(ac)*am,ye+.25,Math.sin(ac)*am);
      const O0=F.p(Math.cos(a0)*ro,yo+lift,Math.sin(a0)*ro),O1=F.p(Math.cos(a1)*ro,yo+lift,Math.sin(a1)*ro),OM=F.p(Math.cos(ac)*ro*Math.cos(Math.PI/8),yo,Math.sin(ac)*ro*Math.cos(Math.PI/8));
      gr.poly([P0,PM,OM,O0],[0,1,0]);gr.poly([PM,P1,O1,OM],[0,1,0]);g.set(29,.5);g.poly([O0,OM,PM,P0],[0,-1,0]);g.poly([OM,O1,P1,PM],[0,-1,0]);
      g.set(13,.3);lathe(g,F,Math.cos(a0)*(ro+.15),yo+lift-1.25,Math.sin(a0)*(ro+.15),[[0,0],[.42,.1],[.48,.85],[.16,1.15],[0,1.2]],8);
      lampM.push(F.p(Math.cos(a0)*(r+1.4),ye-.55,Math.sin(a0)*(r+1.4)),F.p(Math.cos(ac)*(am+1.1),ye-.55,Math.sin(ac)*(am+1.1)));}
    g.set(2,.5);lathe(g,F,0,ye+.2,0,[[r+.15,0],[r+.15,.45],[0,.45]],8);
    T.add(g.mesh(MAT.city));const mr=gr.mesh(MAT.glazeRoof);T.add(mr);const mg=gg.mesh(MAT.glass,false);mg.renderOrder=2;T.add(mg);
    tiers.push({T,im,cw:new Float32Array(cw),cc:new Float32Array(cc)});
    const sg=new GB(1<<12);scaffold(sg,F,0,0,r+2.2,y-.5,h+2,false);const sb=new GB(1<<12);scaffold(sb,F,0,0,r+2.2,y-.5,h+2,true);
    const Sm=sg.mesh(MAT.city),Sb=sb.mesh(MAT.city);Sm.visible=Sb.visible=false;grp.add(Sm,Sb);scaf.push([Sm,Sb]);y=ye+1.6;}
  const sp=new GB(1<<10);sp.set(28,.5);lathe(sp,F,0,y-1.3,0,[[2.3,0],[2.3,.8],[1,1.3],[.9,3],[1.7,3.4],[.9,3.9],[1.5,4.5],[.6,5.4],[1.2,6.8],[.25,8],[.2,11],[0,11.5]],12);
  const spire=sp.mesh(MAT.city);grp.add(spire);
  const lm=lampMat(1,.6,.28,14),lamps=new THREE.InstancedMesh(new THREE.SphereGeometry(.42,8,6),lm,lampM.length);lampM.forEach((p,j)=>{M.makeTranslation(p[0],p[1],p[2]);lamps.setMatrixAt(j,M);});grp.add(lamps);
  for(const[a,b,t]of[[3,6,'城南河湾高地。57夏地基，57秋一层，57冬三层，58年四层。白琉璃砖。'],[7,7,'还是四层。脚手架发黑，檐角铜铃长满绿锈。'],[8,99,'九层封顶。']])W.pois.push({n:'琉璃塔',l:'八面',x,z,y:y0+75,s0:a,s1:b,d:3200,info:t});
  return{grp,set(n,colorful,sc){tiers.forEach((t,i)=>{t.T.visible=i<n;const a=colorful?t.cc:t.cw;t.im.instanceColor.array.set(a);t.im.instanceColor.needsUpdate=true;});
    lamps.count=16*n;spire.visible=n>=9;scaf.forEach((s,i)=>{s[0].visible=sc==='build'&&i===n;s[1].visible=sc==='rot'&&i===n;});grp.visible=n>0;}};}
function explosionFX(W,x,y,z,light){const G=new THREE.Group();if(light){light.position.set(x,y+45,z);if(light.distance!==undefined&&light.distance<900)light.distance=900;}
  const fb=new THREE.Mesh(new THREE.IcosahedronGeometry(1,4),fxMat({add:true,vs:`varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec3 p=position*(1.+.22*vn3(position*2.2+uTime*.9));vP=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fs:`varying vec3 vN;varying vec3 vP;void main(){float f=pow(abs(vN.z),1.4);float n=fbm3(vP*.05+vec3(0.,-uTime*.6,0.));vec3 c=mix(vec3(3.5,.8,.12),vec3(9.,5.,1.4),clamp(f*n*1.6,0.,1.));gl_FragColor=vec4(c*(.35+.9*n),.8*f+.1);}`}));
  fb.position.set(x,y+36,z);fb.scale.setScalar(34);fb.renderOrder=4;G.add(fb);
  G.add(smokeSys([[x,y+40,z],[x+15,y+30,z-10],[x-12,y+28,z+8]],{col:[.09,.07,.06],rise:280,size:75,rate:.018,alpha:.78,per:60,drift:[30,0,10],emit:2.5}));
  G.add(smokeSys([[x,y+20,z]],{col:[1,.45,.12],rise:230,size:3,rate:.08,alpha:1,per:240,drift:[20,0,8],add:true,emit:30}));
  W.anim.push(t=>{const on=G.visible&&G.parent&&G.parent.visible;light.intensity=on?5e5*(1+.35*Math.sin(t*17)+.25*Math.sin(t*41)):0;if(on)fb.scale.setScalar(34*(1+.07*Math.sin(t*9)+.05*Math.sin(t*23)));});return G;}
function movingPath(W,pts,y){const P=densify(pts,4),cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=cum[cum.length-1];
  return{L,at(s){s=clamp(s,0,L);let i=1;while(i<cum.length-1&&cum[i]<s)i++;const f=(s-cum[i-1])/Math.max(cum[i]-cum[i-1],1e-3),a=P[i-1],b=P[i],x=lerp(a[0],b[0],f),z=lerp(a[1],b[1],f);
    return[x,y===undefined?W.gy(x,z):y,z,Math.atan2(b[0]-a[0],b[1]-a[1])];}};}

async function buildRomeLayers(W,msg){const gy=(x,z)=>W.gy(x,z),L=(n,r,f)=>makeLayer(W,n,r,f);
  W.lights={expl:new THREE.PointLight(0xff8a3a,0,0,2),arc:new THREE.PointLight(0xd8ecff,0,0,2)};for(const k in W.lights)W.scene.add(W.lights[k]);
  /* balloon */
  L('balloon',0,(g,G)=>{const F=frame(0,gy(0,667)+92,667,0);g.set(8,.2);lathe(g,F,0,0,0,[[0,-14],[3,-12.5],[8.5,-6],[11,1],[10,8],[6.5,13],[0,14.6]],18);
    g.set(3,.4);box(g,F,0,-21,0,1.3,1.4,1.3,31);for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]])box(g,F,sx*1.6,-19.6,sz*1.6,.05,6,.05,31);
    const gt=new GB(256);gt.set(3,.4);box(gt,frame(0,gy(0,667),667,0),0,0,0,.06,71,.06,31);G.add(gt.mesh(MAT.city,false));W.anim.push(t=>{G.position.y=Math.sin(t*.6)*1.8;});});
  await msg('建造南岸特区：高炉、平炉、玻璃、肥皂、硫酸……');
  /* south bank industrial zone */
  const ZF=frB(-1190,2760,230,gy(-1190,2760)),Zr=RNG(4),em={A:[],chem:[],steam:[],B:[]};
  const zFence=(g,x0,z0,x1,z1)=>{g.set(3,.35);for(const[a,b,c,d]of[[x0,z0,x1,z0],[x1,z0,x1,z1],[x1,z1,x0,z1],[x0,z1,x0,z0]]){const L2=Math.hypot(c-a,d-b),n=Math.max(2,Math.round(L2/4));for(let k=0;k<=n;k++)box(g,ZF,lerp(a,c,k/n),-.3,lerp(b,d,k/n),.12,2.2,.12,31);}};
  L('zoneBase',12,(g)=>{g.set(31,.4);g.poly([ZF.p(-205,.2,-180),ZF.p(-15,.2,-180),ZF.p(-15,.2,25),ZF.p(-205,.2,25)],[0,1,0]);zFence(g,-205,-180,-15,25);
    for(let i=0;i<4;i++){const x=-170+i*48;rectWalls(g,ZF,x,10,30,11,-1,7.2,0,{part:3,seed:.4,sty:0,fl:1,nSt:2,gH:3.6,sH:3.6,lit:1});roof(g,ZF,'gable',x,10,30,11,7.2,24*DEG,.7,.3,{part:3,seed:.4,nSt:2,gH:3.6,sH:3.6,floorY:0});}
    g.set(3,.3);for(let i=0;i<14;i++){const S=ZF.sub(-58+(i%7)*6,0,-112+Math.floor(i/7)*8,(Zr()-.5)*.2);box(g,S,0,0,0,3.2,.7+Zr()*.5,1.4,31);}g.set(9,.5,0,1);for(let i=0;i<8;i++)box(g,ZF,-200+i*6,0,-40,2.2,1.1+Zr()*.8,1.6,31);
    rectWalls(g,ZF,-38,-160,16,12,-1,7,0,{part:22,seed:.4,sty:0,fl:1,nSt:1,gH:7,sH:4,lit:0});roof(g,ZF,'gable',-38,-160,16,12,7,22*DEG,.5,.4);{const wp=ZF.p(199.5,5,-120);g.set(3,.35);g.addGeo(new THREE.CylinderGeometry(5,5,1.2,16),new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0,ZF.rot,Math.PI/2,'YXZ')).setPosition(wp[0],wp[1],wp[2]));}
    g.set(20,.3);for(const x of[120,150])box(g,ZF,x,-.2,-60,10,.4,7,16);
    const yb=RW-4-ZF.oy;g.set(14,.4);box(g,ZF,0,yb,-192,232,ZF.oy-RW+5.5,4,31);g.poly([ZF.p(-232,1.4,-188),ZF.p(232,1.4,-188),ZF.p(232,.2,-150),ZF.p(-232,.2,-150)],[0,1,0]);
    for(let i=0;i<3;i++){const B=ZF.sub(-120+i*70,RW-ZF.oy,-206,0);g.set(3,.4);box(g,B,0,-.8,0,12,1.8,3,31);g.set(20,.3);box(g,B,0,1,0,11,.6,2.6,16);}
    g.set(3,.35);for(const[ax,az,bx,bz]of[[-215,-186,215,-186],[215,-186,215,118],[215,118,8,118],[-8,118,-215,118],[-215,118,-215,-186]]){const L2=Math.hypot(bx-ax,bz-az),n=Math.ceil(L2/10);
      for(let k=0;k<n;k++){const x0=lerp(ax,bx,k/n),z0=lerp(az,bz,k/n),x1=lerp(ax,bx,(k+1)/n),z1=lerp(az,bz,(k+1)/n);const S=ZF.sub((x0+x1)/2,0,(z0+z1)/2,Math.atan2(-(z1-z0),x1-x0));box(g,S,0,-.5,0,L2/n/2,3.4,.15,31);}}
    for(const[x,z,r,h,p]of[[-20,-165,12,6,20],[5,-170,9,5,20],[30,-165,8,4,21],[52,-150,7,4,29]]){g.set(p,.3);lathe(g,ZF,x,0,z,[[r,0],[r*.55,h*.7],[0,h]],10);}
    for(let i=0;i<7;i++){const q=ZF.p(-180+i*60,0,82);emitBuilding(W,g,'insula',q[0],q[2],ZF.rot,24,14,3,gy(q[0],q[2]),gy(q[0],q[2]),Zr,{shops:.3,brick:.7});}
    for(let i=0;i<70;i++){const q=ZF.p((Zr()-.5)*400,0,-140+Zr()*220);W.people.push([q[0],gy(q[0],q[2])+.2,q[2]]);}});
  L('refugees',3,(g,G)=>{const fires=[],steam=[],RF=lampMat(1,.45,.14,9);
    for(let i=0;i<84;i++){const q=ZF.p((Zr()-.5)*440,0,126+Zr()*80),y=gy(q[0],q[2]),S=frame(q[0],y,q[2],ZF.rot+(Zr()-.5)*1.3),L2=1.8+Zr()*1.6,hw=1+Zr()*.8,hh=1.7+Zr()*.8;
      if(Zr()<.58){g.set(8,.24+Zr()*.05);g.poly([S.p(-hw,0,-L2),S.p(0,hh,-L2),S.p(0,hh,L2),S.p(-hw,0,L2)],S.d(-1,1,0));g.poly([S.p(hw,0,L2),S.p(0,hh,L2),S.p(0,hh,-L2),S.p(hw,0,-L2)],S.d(1,1,0));g.set(7,.3);g.poly([S.p(-hw,0,L2),S.p(hw,0,L2),S.p(0,hh,L2)],S.d(0,0,1));g.set(8,.25);g.poly([S.p(hw,0,-L2),S.p(-hw,0,-L2),S.p(0,hh,-L2)],S.d(0,0,-1));}
      else{g.set(21,.6+Zr()*.3);lathe(g,S,0,-.2,0,[[hw*1.35,0],[hw*1.1,hh*.45],[hw*.4,hh*1.05],[0,hh*1.2]],8);}}
    g.set(21,.8);for(let i=0;i<70;i++){const q=ZF.p((Zr()-.5)*480,0,110+Zr()*110);lathe(g,frame(q[0],gy(q[0],q[2]),q[2],0),0,0,0,[[1.6+Zr(),0],[.9,1.4],[0,2.2+Zr()]],6);}
    for(let i=0;i<6;i++){const q=ZF.p((i<3?-1:1)*(232+Zr()*40),0,-150+Zr()*120),S=frame(q[0],gy(q[0],q[2]),q[2],Zr()*TAU);g.set(3,.25);box(g,S,0,-.2,0,1.3,.8,4.6,31);g.poly([S.p(-1.3,.6,-4.6),S.p(1.3,.6,-4.6),S.p(0,1.3,-3.8)],[0,1,0]);}
    for(let i=0;i<12;i++){const q=ZF.p((Zr()-.5)*420,0,140+Zr()*55),y=gy(q[0],q[2]);g.set(20,.3);lathe(g,frame(q[0],y,q[2],0),0,0,0,[[1.1,0],[0,.25]],8);fires.push([q[0],y+.6,q[2]]);const b=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),RF);b.position.set(q[0],y+.5,q[2]);G.add(b);}
    for(let i=0;i<10;i++){const q=ZF.p(-27+i*6,0,108),y=gy(q[0],q[2]);g.set(3,.35);lathe(g,frame(q[0],y,q[2],0),0,0,0,[[.75,0],[.85,.6],[.75,1.2],[0,1.2]],10);steam.push([q[0],y+1.3,q[2]]);}
    G.add(smokeSys(fires,{col:[.45,.43,.41],rise:26,size:4,rate:.09,alpha:.45,per:12,drift:[3,0,2]}));G.add(smokeSys(steam,{col:[.95,.95,.95],rise:7,size:1.6,rate:.25,alpha:.5,per:8,drift:[1,0,.5]}));
    for(let i=0;i<110;i++){const q=ZF.p((Zr()-.5)*440,0,122+Zr()*80);W.people.push([q[0],gy(q[0],q[2])+.2,q[2]]);}});
  L('furnaceA',26,(g)=>{for(const x of[-150,-110,-70])em.A.push(blastFurnace(g,ZF,x,-150));});
  L('chem',20,(g,G,gl)=>{em.chem.push(...openHearth(g,ZF,60,-118));for(const x of[132,152,172])em.chem.push(kiln(g,ZF,x,-150));
    em.chem.push(glassCone(g,ZF,-160,-40,gl));em.steam.push(...soapWorks(g,ZF,-62,-40));em.chem.push(leadChambers(g,ZF,22,-40));em.chem.push(sodaWorks(g,ZF,102,-40));});
  L('smokeA',0,(g,G)=>G.add(smokeSys(em.A,{col:[.16,.14,.12],rise:150,size:26,rate:.03,alpha:.55,per:48,drift:[18,0,10]})));
  L('smokeChem',0,(g,G)=>{G.add(smokeSys(em.chem,{col:[.3,.28,.25],rise:110,size:18,rate:.035,alpha:.42,per:34,drift:[16,0,9]}));G.add(smokeSys(em.steam,{col:[.95,.95,.95],rise:40,size:9,rate:.08,alpha:.45,per:24,drift:[6,0,3]}));});
  const ZB=frB(-765,3141,256,gy(-765,3141));
  L('furnaceB',26,(g)=>{for(const x of[-50,-10,30])em.B.push(blastFurnace(g,ZB,x,-70));em.B.push(...openHearth(g,ZB,0,0));g.set(14,.4);box(g,ZB,0,RW-4-ZB.oy,-114,90,ZB.oy-RW+5.5,4,31);
    g.set(21,.4);g.poly([ZB.p(-95,.2,-100),ZB.p(95,.2,-100),ZB.p(95,.2,40),ZB.p(-95,.2,40)],[0,1,0]);for(let i=0;i<30;i++){const q=ZB.p((Zr()-.5)*170,0,-80+Zr()*110);W.people.push([q[0],gy(q[0],q[2])+.2,q[2]]);}});
  L('smokeB',0,(g,G)=>G.add(smokeSys(em.B,{col:[.17,.15,.13],rise:150,size:26,rate:.03,alpha:.55,per:48,drift:[18,0,10]})));
  W.pois.push({n:'南岸特区',l:'高炉 · 平炉 · 水泥堤',x:-1190,z:2760,y:gy(-1190,2760)+55,s0:2,s1:99,d:3600,info:'56秋开工。三座烟囱高炉、水泥堤，栅栏外有流民。57年加平炉、水泥立窑、玻璃锥窑、肥皂锅、铅室硫酸、吕布兰纯碱。57冬污染令，高炉迁往下游。'});
  for(const[n,l,lx,lz,s0,info]of[['玻璃工坊','锥窑 + 退火棚',-160,-40,3,'砖砌玻璃锥窑，旁边退火棚是玻璃屋顶。57年平板玻璃30吨。'],['肥皂工坊','铜锅',-62,-40,3,'四口铜锅日夜沸煮。57年肥皂300吨。'],
    ['平炉','蓄热式',60,-118,3,'57夏第一炉，一炉约300公斤，够打三百把剑。'],['高炉','焦炭生铁',-110,-150,2,'三座高炉，单炉日产约3吨。'],['水泥立窑','×3',152,-150,3,'57年水泥2000吨。'],['铅室硫酸','铅室法',22,-40,3,'57年硫酸100吨。']]){
    const q=ZF.p(lx,0,lz);W.pois.push({n,l,x:q[0],z:q[2],y:gy(q[0],q[2])+34,s0,s1:99,d:900,info,sub:true});}
  {const q=ZB.p(0,0,-40);W.pois.push({n:'下游新炉区',l:'57冬污染令后',x:q[0],z:q[2],y:gy(q[0],q[2])+48,s0:5,s1:99,d:2600,info:'高炉迁到下游，城南的天空才慢慢转回蓝色。'});}
  await msg('砌琉璃塔：约四千片釉砖……');
  W.pagoda=buildPagoda(W,-1420,2450);
  await msg('建造城东、学园新楼、浴场、铁轨……');
  /* Galba warehouses → explosion → ruins → cathedral */
  const GF=frB(GALBA[0],GALBA[1],200,gy(GALBA[0],GALBA[1]));
  L('galbaA',10,(g)=>{for(let i=0;i<3;i++)courtBlock(W,g,GF,{cx:-75+i*50,cz:0,w:42,d:60,y0:0,nSt:2,sH:4.2,gH:5,cw:20,cd:34,part:22,seed:.3+i*.05,peristyle:false,garden:false});});
  L('galba4',10,(g)=>{courtBlock(W,g,GF,{cx:75,cz:0,w:42,d:60,y0:0,nSt:3,sH:4.2,gH:5,cw:20,cd:34,part:22,seed:.5,peristyle:false,garden:false});});
  L('galbaRuin',0,(g,G)=>{g.set(20,.3);for(let i=0;i<9;i++)lathe(g,GF,60+(Zr()-.5)*40,0,(Zr()-.5)*50,[[7+Zr()*5,0],[3,2.5+Zr()*2],[0,3.5+Zr()*2]],8);
    g.set(22,.5,0,0,1,4,1);for(let i=0;i<14;i++){const a=Zr()*TAU;box(g,GF,75+Math.cos(a)*20,0,Math.sin(a)*28,1+Zr()*5,1+Zr()*5,.8,31);}
    G.add(smokeSys([GF.p(75,4,0),GF.p(55,3,12)],{col:[.35,.33,.31],rise:90,size:20,rate:.03,alpha:.4,per:30,drift:[10,0,6]}));});
  L('explosion',0,(g,G)=>G.add(explosionFX(W,...GF.p(75,0,0),W.lights.expl)));
  for(const[a,b,t]of[[0,3,'城东的官仓。顶层租给了公社做库房。'],[4,5,'57年深秋（第三卷）。']])W.pois.push({n:'埃斯奎利诺公仓',l:'【书中】城东',x:GALBA[0],z:GALBA[1],y:gy(GALBA[0],GALBA[1])+40,s0:a,s1:b,d:3000,info:t});
  const CT=frB(GALBA[0],GALBA[1],270,gy(GALBA[0],GALBA[1]));
  L('cathedral',32,(g)=>{const len=84,nw=16,ah=16,nh=33,cw={part:14,seed:.5,sty:0,fl:1,nSt:1,gH:40,sH:4,lit:0,burn:1};
    rectWalls(g,CT,0,0,nw+16,len,-2,ah,0,cw);rectWalls(g,CT,0,0,nw,len,ah-1,nh,0,cw);const t0=g.nv;roof(g,CT,'gableZ',0,0,nw,len,nh,52*DEG,.6,.5,{part:14,seed:.5,nSt:1,gH:40,sH:4,floorY:0,burn:1});retag(g,1,16,t0);
    g.set(16,.4);for(const s of[1,-1])g.poly([CT.p(s*(nw/2+.3),ah+5.5,len/2),CT.p(s*(nw/2+.3),ah+5.5,-len/2),CT.p(s*(nw/2+8.6),ah+.3,-len/2),CT.p(s*(nw/2+8.6),ah+.3,len/2)],[s,4,0]);
    for(let z=-len/2+6;z<=len/2-8;z+=8){for(const s of[1,-1]){const Sa=CT.sub(s*(nw/2+8.06),0,z,s*Math.PI/2),Sb=CT.sub(s*(nw/2+.06),0,z,s*Math.PI/2);
        g.set(15,.4);g.poly(arch(g,Sa,0,1.5,4,7,0,true).map(p=>p),Sa.d(0,0,1));g.poly(arch(g,Sb,0,1.4,ah+2.5,9,0,true),Sb.d(0,0,1));
        g.set(14,.5,0,0,1,4,1);box(g,CT,s*(nw/2+12),-1,z+4,1.1,ah+5,1.1,31);const B=CT.sub(s*(nw/2+6),0,z+4,s>0?-Math.PI/2:Math.PI/2);
        g.poly([B.p(-6,ah+4,-.6),B.p(6,nh-7,-.6),B.p(6,nh-5,-.6),B.p(-6,ah+6.5,-.6)],B.d(0,0,-1));g.poly([B.p(-6,ah+4,.6),B.p(6,nh-7,.6),B.p(6,nh-5,.6),B.p(-6,ah+6.5,.6)],B.d(0,0,1));
        g.poly([B.p(-6,ah+6.5,-.6),B.p(6,nh-5,-.6),B.p(6,nh-5,.6),B.p(-6,ah+6.5,.6)],[0,1,0]);}}
    for(const s of[1,-1]){rectWalls(g,CT,s*(nw/2+5),len/2+2,11,11,-2,52,0,cw);const t1=g.nv;roof(g,CT,'pyr',s*(nw/2+5),len/2+2,11,11,52,74*DEG,.4,.5);retag(g,1,16,t1);
      for(const lv of[20,36]){const S=CT.sub(s*(nw/2+5),0,len/2+7.56,0);g.set(15,.5);g.poly(arch(g,S,0,1.3,lv,6,0,true),S.d(0,0,1));}}
    const S=CT.sub(0,0,len/2+.08,0);g.set(7,.3);for(const x of[-5,0,5])g.poly(arch(g,S,x,x?1.6:2.4,0,x?5.5:7,0,true),S.d(0,0,1));
    g.set(15,.5,0,0,1,4,1);const rc=ah+10,pts=[],uv=[];for(let k=0;k<24;k++){const a=k/24*TAU;pts.push(S.p(Math.cos(a)*5.4,rc+Math.sin(a)*5.4,.02));uv.push([Math.cos(a)*5.4,Math.sin(a)*5.4]);}g.poly(pts,S.d(0,0,1),uv);
    g.set(14,.5,0,0,1,4,1);lathe(g,CT,0,-2,-len/2,[[nw/2+.3,0],[nw/2+.3,nh+1],[0,nh+1]],8);const t2=g.nv;lathe(g,CT,0,nh,-len/2,[[nw/2+1,0],[0,7]],8,16);retag(g,1,16,t2);});
  for(const[a,b,t]of[[6,6,'建在埃斯奎利诺公仓的废墟上。57冬木骨架，水泥壳，58春封顶，58冬装上玫瑰彩窗。'],[7,7,'玫瑰窗熏黑了。'],[8,99,'玫瑰窗右下角钉过一块木板；后来补上一块新的红玻璃，比旁边的旧玻璃亮一点。']])W.pois.push({n:'阿波罗圣辉大殿',l:'【书中】',x:GALBA[0],z:GALBA[1],y:gy(GALBA[0],GALBA[1])+70,s0:a,s1:b,d:3600,info:t});
  L('valleyTrees',0,(g)=>{for(let i=0;i<70;i++){const x=572+(Zr()-.5)*220,z=200+(Zr()-.5)*170;W.trees.push([x,gy(x,z),z,Zr()<.5?'pine':'broad',.9]);}});
  buildDomusAurea(W,L,gy);   // the Golden House, its streets before the fire and the Transitoria's glazed loggia (domus-aurea.js)
  /* academy growth */
  const AF=W.AF;
  {const inner=(lx,lz)=>(Math.abs(lx-46)<20&&Math.abs(lz+14)<22)||(Math.abs(lx+44)<19&&Math.abs(lz+24)<14)||(Math.abs(lx)<60&&lz>14&&lz<46);
   const spots=[];for(let lx=-100;lx<=100;lx+=15)for(let lz=-96;lz<=86;lz+=14){if(Math.abs(lx)<30&&lz>-46&&lz<10)continue;if(Math.hypot(lx,lz)>136)continue;spots.push([lx,lz]);}
   const mkH=(g,list,R8)=>{for(const[lx,lz]of list){const q=AF.p(lx,0,lz),w=9+R8()*3,d=8+R8()*3;if(W.foot.hits(q[0],q[2],w/2,d/2,AF.rot,1))continue;const F=frame(q[0],gy(q[0],q[2]),q[2],AF.rot+(R8()-.5)*.2),two=R8()<.65,top=two?6.6:3.8;
     rectWalls(g,F,0,0,w,d,-2,top,0,{part:R8()<.6?0:9,seed:R8(),sty:3,fl:2|16|8,nSt:two?2:1,gH:3.8,sH:2.8,lit:.6});roof(g,F,'gable',0,0,w+.8,d+.8,top,24*DEG,.4,R8());}};
   L('acadHousesA',0,(g)=>mkH(g,spots.filter(([a2,b2])=>inner(a2,b2)),RNG(51)));L('acadHousesB',0,(g)=>mkH(g,spots.filter(([a2,b2])=>!inner(a2,b2)),RNG(52)));
   L('acadAnnex',0,(g)=>{for(const[lx,lz]of[[-58,-58],[60,-62],[-70,36]]){const q=AF.p(lx,0,lz),F=frame(q[0],gy(q[0],q[2]),q[2],AF.rot);rectWalls(g,F,0,0,16,11,-2,7,0,{part:0,seed:.16,sty:5,fl:1|64|8,nSt:2,gH:3.8,sH:3.2,lit:1});roof(g,F,'gable',0,0,16.8,11.8,7,24*DEG,.5,.4);}});}
  L('acad57',14,(g)=>{courtBlock(W,g,AF,{cx:46,cz:-14,w:26,d:30,y0:0,nSt:2,sH:4,gH:4.6,cw:12,cd:14,part:0,seed:.66,sty:0,fl:8|16});
    rectWalls(g,AF,-44,-24,24,14,-2,9,0,{part:9,seed:.5,sty:1,fl:8|2,nSt:2,gH:4.5,sH:4.5,lit:1});roof(g,AF,'gable',-44,-24,24,14,9,20*DEG,.6,.5,{part:9,seed:.5,nSt:2,gH:4.5,sH:4.5,floorY:0});
    g.set(9,.5,0,1);lathe(g,AF,-54,-1,-24,[[1.2,0],[1,18],[1.2,18.5],[1.2,19],[.8,19]],10);const y1=tower(g,AF,20,-52,9,0,5,4,{part:24,seed:.7});g.set(16,.4);lathe(g,AF,20,y1+3.2,-52,[[3.4,0],[2.8,1.8],[1.6,3],[0,3.4]],12);});
  const CG=frB(1640,-60,200,gy(1640,-60));
  const cLong=(g,cx,cz,len)=>{rectWalls(g,CG,cx,cz,len,12,-2,8.6,0,{part:9,seed:.42,sty:2,fl:8|2,nSt:2,gH:4.6,sH:4,lit:1});roof(g,CG,'gableX',cx,cz,len+.8,12.8,8.6,26*DEG,.5,.3,{part:9,seed:.42,nSt:2,gH:4.6,sH:4,floorY:0});};
  const cLongZ=(g,cx,cz,len)=>{rectWalls(g,CG,cx,cz,12,len,-2,8.6,0,{part:9,seed:.42,sty:2,fl:8|2,nSt:2,gH:4.6,sH:4,lit:1});roof(g,CG,'gable',cx,cz,12.8,len+.8,8.6,26*DEG,.5,.3,{part:9,seed:.42,nSt:2,gH:4.6,sH:4,floorY:0});};
  const court=(g,cz,gate)=>{g.set(23,.45);g.poly([CG.p(-26,.12,cz-20),CG.p(26,.12,cz-20),CG.p(26,.12,cz+20),CG.p(-26,.12,cz+20)],[0,1,0]);cLong(g,0,cz-26,64);cLongZ(g,-32,cz,40);cLongZ(g,32,cz,40);
    if(gate){cLong(g,-19,cz+26,26);cLong(g,19,cz+26,26);const F=CG.sub(0,0,cz+26,0);rectWalls(g,F,0,0,12,13,-2,15,0,{part:9,seed:.38,sty:2,fl:8|2,nSt:3,gH:6,sH:4.5,lit:1});arcade(g,F,0,-.5,6.6,10,7,1,1.2,2,{span:.3,attic:1});
      roof(g,F,'hip',0,0,12.6,13.6,15,24*DEG,.5,.3);g.set(9,.42);for(const[sx,sz]of[[-6,-6.5],[6,-6.5],[-6,6.5],[6,6.5]]){box(g,F,sx,0,sz,1.4,18.5,1.4,31);g.set(1,.4);lathe(g,F,sx,18.5,sz,[[1.6,0],[0,2.4]],8);g.set(9,.42);}}
    else cLong(g,0,cz+26,64);};
  L('college1',14,(g)=>{g.set(27,.4);g.poly([CG.p(-14,.15,33),CG.p(14,.15,33),CG.p(14,.15,84),CG.p(-14,.15,84)],[0,1,0]);court(g,0,true);});
  L('college2',12,(g)=>{court(g,-66,false);});L('college3',10,(g)=>{});
  L('collegeTreesS',0,(g)=>{for(let k=0;k<7;k++)for(const sd of[1,-1]){const q=CG.p(sd*10,0,38+k*7);W.trees.push([q[0],gy(q[0],q[2]),q[2],'cyp',.22]);}});
  L('collegeTreesL',0,(g)=>{for(let k=0;k<7;k++)for(const sd of[1,-1]){const q=CG.p(sd*10,0,38+k*7);W.trees.push([q[0],gy(q[0],q[2]),q[2],'cyp',.95]);}});
  W.pois.push({n:'东校',l:'新校区',x:1640,z:-60,y:gy(1640,-60)+20,s0:6,s1:99,d:2400,info:'【书中】两层砖楼，红瓦，大窗，围成剑桥式的方院，正面一座带四角塔楼的门楼；门前碎石地，两排柏树。尖拱只留给圣辉大殿，这里不用。'});
  L('glasshouse',6,(g,G,gl)=>{const F=AF.sub(-42,0,12,0);rectWalls(gl,F,0,0,30,12,0,4.5,0,{part:29,seed:.5,sty:0,fl:1,nSt:1,gH:5,sH:4});roof(gl,F,'gable',0,0,30,12,4.5,30*DEG,.2,.5,null);
    g.set(18,.3);for(let x=-15;x<=15;x+=3){box(g,F,x,0,6,.1,4.5,.1,31);box(g,F,x,0,-6,.1,4.5,.1,31);}box(g,F,0,4.5+6*Math.tan(30*DEG),0,15.2,.15,.15,31);});
  /* Campus Martius: great baths, military school */
  const BF=frB(-895,-834,180,gy(-895,-834));
  const baths=(g,full,G)=>{const k=full?1:.42;rectWalls(g,BF,0,0,92,46,-2,30*k,0,{part:24,seed:.75,sty:5,fl:8|32,nSt:3,gH:11,sH:9.5,lit:1});
    for(const s of[1,-1])rectWalls(g,BF,s*82,4,70,58,-2,17*k,0,{part:9,seed:.6,sty:1,fl:8,nSt:2,gH:8.5,sH:8.5,lit:1});
    g.set(24,.75,0,1);lathe(g,BF,0,-2,50,[[22,0],[22,22*k],[0,22*k]],24);
    if(full){roof(g,BF,'gable',0,0,92,46,30,18*DEG,.8,.5,{part:24,seed:.75,nSt:3,gH:11,sH:9.5,floorY:0});for(const s of[1,-1])roof(g,BF,'gable',s*82,4,70,58,17,14*DEG,.7,.5,{part:9,seed:.6,nSt:2,gH:8.5,sH:8.5,floorY:0});
      g.set(16,.4);lathe(g,BF,0,20,50,[[22.6,0],[19,7],[10,12.5],[0,14]],24);g.set(2,.45);box(g,BF,0,-1,-44,36,1.5,9,31);const pg=new GB(512);pg.poly([BF.p(-34,.6,-37),BF.p(34,.6,-37),BF.p(34,.6,-51),BF.p(-34,.6,-51)],[0,1,0]);if(G)G.add(pg.mesh(MAT.pool,false));
      for(const s of[1,-1]){portico(W,g,BF,s*122,-62,s*122,74,0,7,6,3.6,[1,.84,.5]);portico(W,g,BF,s*170,74,s*170,-62,0,7,6,3.6,[1,.84,.5]);g.set(11,.35);g.poly([BF.p(s*122,.3,74),BF.p(s*170,.3,74),BF.p(s*170,.3,-62),BF.p(s*122,.3,-62)],[0,1,0]);}
      g.set(9,.4,0,1);for(const s of[1,-1])box(g,BF,s*177,-1,6,1.2,8,75,31);box(g,BF,0,-1,82,178,8,1.2,31);box(g,BF,0,-1,-70,178,8,1.2,31);for(const s of[1,-1]){const q=BF.p(s*146,0,58);tholos(W,g,{x:q[0],y:BF.oy,z:q[2],R:4.2,podH:.8,colH:4.4,n:10,roofPart:1});}const pg2=new GB(512);for(const s of[1,-1]){g.set(2,.45);box(g,BF,s*146,-1,20,13,1.4,9,31);pg2.poly([BF.p(s*134,.5,28),BF.p(s*158,.5,28),BF.p(s*158,.5,12),BF.p(s*134,.5,12)],[0,1,0]);}if(G)G.add(pg2.mesh(MAT.pool,false));}
    else{scaffold(g,BF,0,0,40,0,16,false);scaffold(g,BF,82,4,38,0,10,false);scaffold(g,BF,-82,4,38,0,10,false);}};
  L('baths0',8,(g,G)=>baths(g,false,G));L('baths1',16,(g,G)=>baths(g,true,G));
  W.pois.push({n:'大浴场',l:'战神广场边',x:-895,z:-834,y:gy(-895,-834)+40,s0:3,s1:99,d:2400,info:'57年开工，努米底亚黄大理石，58年完工。花费2000–3000万塞斯特斯。'});
  L('milSchool',10,(g)=>{const F=frB(-590,-1300,180,gy(-590,-1300));   // west of Via Flaminia, which ran straight along the Campus Martius
   courtBlock(W,g,F,{cx:0,cz:-20,w:80,d:50,y0:0,nSt:2,sH:4.2,gH:5,cw:46,cd:22,part:9,seed:.45,sty:0,fl:8|2,peristyle:false,garden:false});
    g.set(21,.4);g.poly([F.p(-60,.25,60),F.p(60,.25,60),F.p(60,.25,10),F.p(-60,.25,10)],[0,1,0]);g.set(3,.4);for(let x=-50;x<=50;x+=12)box(g,F,x,0,55,.6,2.2,.15,31);
    for(let i=0;i<40;i++){const q=F.p(-50+(i%10)*10,0,20+Math.floor(i/10)*8);W.people.push([q[0],gy(q[0],q[2])+.2,q[2]]);}});
  W.pois.push({n:'军校',l:'战神广场北',x:-590,z:-1300,y:gy(-590,-1300)+24,s0:6,s1:99,d:2400,info:'58年开学，首期320人。钢臂弩射穿重盾。'});
  L('vat3',14,(g)=>{const F=W.vatF;for(const s of[1,-1]){const Fa=F.sub(0,0,s*56,s>0?0:Math.PI);arcade(g,Fa,0,0,0,500,9,36,3,2,{span:.3});arcade(g,Fa,0,9,0,500,8,36,2.6,2,{span:.28});arcade(g,Fa,0,17,0,500,7,36,2.4,2,{span:.26});
    g.set(26,.5);g.poly([F.p(-250,9,s*50),F.p(250,9,s*50),F.p(250,23,s*56),F.p(-250,23,s*56)],[0,1,0]);g.set(2,.4);for(const e of[-250,250])g.poly([F.p(e,0,s*50),F.p(e,0,s*57.5),F.p(e,24,s*57.5),F.p(e,9,s*50)],F.d(Math.sign(e),0,0));}});
  /* rail, steamer, semaphore, telegraph, arc lamps */
  const RAIL=[[-640,1450],[-560,1900],[-470,2400],[-430,2900],[-470,3300],[-560,3580]];
  L('rail',0,(g,G,gl)=>{const pts=densify(RAIL,8);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,F=frame(mx,gy(mx,mz),mz,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));
      g.set(27,.62);box(g,F,0,-.4,0,L2/2+.1,.6,2.6,16);g.set(3,.3);for(let x=-L2/2;x<L2/2;x+=1.4)box(g,F,x+.7,.2,0,.14,.14,1.35,17);g.set(14,.75);for(const s of[1,-1])box(g,F,0,.34,s*.72,L2/2+.05,.14,.06,31);}
    const SF=frB(-660,1430,170,gy(-660,1430));rectWalls(g,SF,0,0,36,12,-1,6,0,{part:9,seed:.52,sty:1,fl:8|2,nSt:1,gH:6,sH:4,lit:1});roof(g,SF,'hip',0,0,36,12,6,22*DEG,.8,.5);
    const tg=new GB(2048),T0=frame(0,0,0,0);tg.set(3,.4);box(tg,T0,0,.7,0,1.3,1.5,3.1,31);tg.set(20,.3);box(tg,T0,0,2.2,0,1.12,.45,2.85,16);tg.set(18,.3);for(const s of[1,-1])for(const t of[-2,2])box(tg,T0,s*1.32,.1,t,.12,.9,.5,31);
    const lg=new GB(2048);lg.set(18,.2);box(lg,T0,0,.9,0,1.15,1.8,3.4,31);lg.set(3,.3);box(lg,T0,0,.9,-3.2,1.3,2.8,1.2,31);lg.set(18,.2);lathe(lg,T0,0,2.7,2.4,[[.42,0],[.36,1.6],[.6,2.2],[0,2.3]],8);
    const geo=tg.geometry(),cars=[];for(let i=0;i<7;i++){const m=new THREE.Mesh(geo,MAT.city);m.castShadow=true;G.add(m);cars.push(m);}const loco=new THREE.Mesh(lg.geometry(),MAT.city);loco.castShadow=true;G.add(loco);
    const sm=smokeSys([[0,0,0]],{col:[.9,.9,.9],rise:28,size:5,rate:.15,alpha:.6,per:44,drift:[3,0,2]});G.add(sm);const path=movingPath(W,RAIL);const hg=new GB(2048);for(const s of[1,-1]){hg.set(3,.25+(s>0?.1:0));box(hg,T0,s*.55,1.0,0,.28,.62,1.05,31);box(hg,T0,s*.55,1.45,.95,.16,.55,.2,31);box(hg,T0,s*.55,1.85,1.2,.14,.2,.32,31);for(const lz of[-.75,.75])box(hg,T0,s*.55,0,lz,.08,1.0,.08,31);}const horses=new THREE.Mesh(hg.geometry(),MAT.city);G.add(horses);
    W.anim.push(t=>{if(!G.visible)return;const per=path.L*2/7,ph=(t%per)*7,s0=ph<path.L?ph:2*path.L-ph,dir=ph<path.L?1:-1,p=path.at(s0);loco.position.set(p[0],p[1]+.4,p[2]);loco.rotation.y=p[3]+(dir<0?Math.PI:0);
      loco.visible=sm.visible=!!W.locoOn&&!W.railIdle;cars.forEach((m,i)=>{m.visible=!W.railIdle;const q=path.at(s0-dir*(W.locoOn?8+i*7:i*7));m.position.set(q[0],q[1]+.4,q[2]);m.rotation.y=q[3];});sm.material.uniforms.uOff.value.set(p[0],p[1]+5.2,p[2]);horses.visible=!W.locoOn&&!W.railIdle;if(horses.visible){const hp=path.at(s0+dir*5.5);horses.position.set(hp[0],hp[1]+.4,hp[2]);horses.rotation.y=hp[3]+(dir<0?Math.PI:0);}});});
  W.pois.push({n:'罗马站',l:'铁路起点',x:-660,z:1430,y:gy(-660,1430)+14,s0:6,s1:99,d:4200,info:'罗马到奥斯提亚铁路在城里的起点，旁边是商港仓库区。'});W.views.railway={n:'铁路与罗马站',pos:[-430,gy(-660,1430)+120,1650],tgt:[-650,gy(-660,1430)+8,1450]};for(const[a,b,t]of[[6,6,'58年通车：木轨包铁皮，马拉的运煤车厢。'],[7,7,'锅炉炸了以后停运。铁轨生锈，没有车。'],[8,99,'布鲁斯号复驶：黑车头，侧面黄铜嵌字 BRVTVS。']])W.pois.push({n:'罗马–奥斯提亚铁轨',l:'12罗马里',x:-470,z:2400,y:gy(-470,2400)+20,s0:a,s1:b,d:3000,info:t});
  L('tug',0,(g,G)=>{const bg=new GB(4096),F=frame(0,0,0,0);bg.set(3,.3);box(bg,F,0,-1,0,2.6,2.6,9,31);bg.set(29,.4);box(bg,F,0,1.6,1,1.8,2,3,31);bg.set(18,.3);for(const s of[1,-1])box(bg,F,s*3.1,-.6,0,.7,3.2,2.2,31);
      lathe(bg,F,0,3.6,1,[[.45,0],[.42,3.6],[.6,4],[0,4.1]],8);const boat=new THREE.Mesh(bg.geometry(),MAT.city);boat.castShadow=true;G.add(boat);
    const cg=new GB(2048);cg.set(3,.3);box(cg,F,0,-1,0,2.8,2.1,10,31);cg.set(20,.3);box(cg,F,0,1,0,2.5,.5,9.4,16);const cgeo=cg.geometry(),bar=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(cgeo,MAT.city);G.add(m);bar.push(m);}
    const sm=smokeSys([[0,0,0]],{col:[.32,.3,.28],rise:40,size:7,rate:.12,alpha:.55,per:40,drift:[4,0,3]});G.add(sm);const path=movingPath(W,TIBER.slice(16,23),RW+.4);
    W.anim.push(t=>{if(!G.visible)return;const per=path.L*2/3,ph=(t%per)*3,s0=ph<path.L?ph:2*path.L-ph,dir=ph<path.L?1:-1,p=path.at(s0);boat.position.set(p[0],p[1],p[2]);boat.rotation.y=p[3]+(dir<0?Math.PI:0);
      bar.forEach((m,i)=>{const q=path.at(s0-dir*(26+i*23));m.position.set(q[0],q[1],q[2]);m.rotation.y=q[3];});sm.material.uniforms.uOff.value.set(p[0],p[1]+8,p[2]);});});
  L('semaphore',18,(g,G)=>{for(const[x,z]of[[254,339],[-480,940],[-470,2520],[-560,3480],[-1460,2380]]){const F=frame(x,gy(x,z),z,.3);g.set(3,.4);for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]])box(g,F,sx*1.6,-1,sz*1.6,.18,17,.18,31);
      for(let y=3;y<16;y+=4){box(g,F,0,y,1.6,1.7,.15,.12,31);box(g,F,0,y,-1.6,1.7,.15,.12,31);box(g,F,1.6,y,0,.12,.15,1.7,31);box(g,F,-1.6,y,0,.12,.15,1.7,31);}
      box(g,F,0,16,0,2,.4,2,31);box(g,F,0,16.4,0,.2,7,.2,31);const ag=new GB(256);ag.set(3,.4);box(ag,frame(0,0,0,0),2.6,-.2,0,2.8,.4,.12,31);const ageo=ag.geometry();
      for(const s of[1,-1]){const a=new THREE.Mesh(ageo,MAT.city);const p=F.p(0,22.8,0);a.position.set(p[0],p[1],p[2]);a.rotation.y=F.rot+(s>0?0:Math.PI);G.add(a);const ph=x*.01+s;W.anim.push(t=>{a.rotation.z=(W.semBroken?(.95+.35*Math.sin(ph*7.3)):(Math.floor(t*.5+ph)%3*.6-.4));});}}});
  for(const[a,b,t]of[[6,6,'第一座塔在帕拉蒂尼山最高处那座老烽火台旁。58秋，罗马到奥斯提亚5座塔。'],[7,7,'修到了亚平宁一线。有一些木臂断了，歪在杆子上。'],[8,99,'后来一直修到叙利亚。']])W.pois.push({n:'臂板信号塔',l:'第一座',x:254,z:339,y:gy(254,339)+34,s0:a,s1:b,d:2200,info:t});
  L('telegraph',0,(g)=>{const A=[22,150],B=[-30,-92],n=9;let prev=null;for(let i=0;i<=n;i++){const x=lerp(A[0],B[0],i/n),z=lerp(A[1],B[1],i/n),y=gy(x,z);g.set(3,.4);box(g,frame(x,y,z,0),0,0,0,.14,8,.14,31);
      const top=[x,y+7.8,z];if(prev){const L2=Math.hypot(top[0]-prev[0],top[2]-prev[2]),F=frame((x+prev[0])/2,0,(z+prev[2])/2,Math.atan2(-(top[2]-prev[2]),top[0]-prev[0]));g.set(18,.3);
        g.poly([F.p(-L2/2,prev[1],0),F.p(L2/2,top[1],0),F.p(L2/2,top[1]+.06,0),F.p(-L2/2,prev[1]+.06,0)],[0,0,1]);}prev=top;}});
  L('arc',0,(g,G)=>{const F=W.pompey,am=lampMat(.75,.88,1,60);for(const s of[1,-1]){const p=F.p(s*24,0,5);g.set(18,.3);box(g,F,s*24,-1,5,.25,15,.25,31);const b=new THREE.Mesh(new THREE.SphereGeometry(1.1,12,8),am);b.position.set(p[0],p[1]+14.6,p[2]);G.add(b);}
    const p=F.p(0,20,0);W.lights.arc.position.set(p[0],p[1],p[2]);});
  L('iron',8,(g,G,gl)=>{const[x,z]=polyAt(TIBER,20.4),i=20,a=TIBER[i],b=TIBER[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,F=frame(x,RW+9,z,Math.atan2(-ux,-uz));
    g.set(18,.3);box(g,F,0,0,0,80,.8,5,31);for(const s of[1,-1]){for(let k=-8;k<8;k++){const x0=k*10,x1=x0+10,y0=9*Math.cos(x0/80*Math.PI/2),y1=9*Math.cos(x1/80*Math.PI/2);const S=F.sub((x0+x1)/2,0,s*5,0);
      g.poly([S.p(-5,y0,0),S.p(5,y1,0),S.p(5,y1+.7,0),S.p(-5,y0+.7,0)],F.d(0,0,s));box(g,F,x0,0,s*5,.15,y0,.15,31);}}
    const SF=frB(-660,1430,170,gy(-660,1430));roof(gl,SF,'gable',0,0,44,22,9,24*DEG,.3,.5,null);g.set(18,.3);for(let x=-22;x<=22;x+=5.5){box(g,SF,x,0,10.8,.18,9,.18,31);box(g,SF,x,0,-10.8,.18,9,.18,31);}});
  const race=(name,F,x0,x1,rz,spd)=>L(name,0,(g,G)=>{const pts=[];for(let i=0;i<=24;i++){const a=-Math.PI/2+i/24*Math.PI,p=F.p(x1+Math.cos(a)*rz,0,Math.sin(a)*rz);pts.push([p[0],p[2]]);}for(let i=0;i<=24;i++){const a=Math.PI/2+i/24*Math.PI,p=F.p(x0+Math.cos(a)*rz,0,Math.sin(a)*rz);pts.push([p[0],p[2]]);}pts.push(pts[0]);
    const path=movingPath(W,pts,F.oy+.3),cg=new GB(2048),T0=frame(0,0,0,0);cg.set(29,.9);box(cg,T0,0,.35,0,.85,.9,.8,31);cg.set(18,.3);for(const s of[-1,1])box(cg,T0,s*1.05,0,0,.1,1.1,.55,31);
    cg.set(29,.6);for(let k=0;k<4;k++){const hx=(k-1.5)*.62;box(cg,T0,hx,.9,3.4,.26,.95,1.15,31);box(cg,T0,hx,1.75,4.6,.16,.5,.3,31);box(cg,T0,hx,0,3.4,.1,.9,.1,31);}
    const m=new THREE.Mesh(cg.geometry(),MAT.city);m.castShadow=true;G.add(m);const du=smokeSys([[0,0,0]],{col:[.8,.7,.5],rise:4,size:2.5,rate:.5,alpha:.4,per:20,drift:[0,0,0]});G.add(du);
    W.anim.push(t=>{if(!G.visible)return;const p=path.at((t*spd)%path.L);m.position.set(p[0],p[1],p[2]);m.rotation.y=p[3];du.material.uniforms.uOff.value.set(p[0],p[1],p[2]);});});
  race('chariot',W.circF,-188,148,21,26);race('chariotV',W.vatF,-158,158,19,24);
  L('taurus',0,(g)=>{const F=frame(-610,gy(-610,-330),-330,.4),rx=46,rz=34;for(let k=0;k<16;k++){const a=k/16*TAU,a1=(k+1)/16*TAU,p0=[Math.cos(a)*rx,Math.sin(a)*rz],p1=[Math.cos(a1)*rx,Math.sin(a1)*rz],S=F.sub((p0[0]+p1[0])/2,0,(p0[1]+p1[1])/2,Math.atan2(-(p1[1]-p0[1]),p1[0]-p0[0])),len=Math.hypot(p1[0]-p0[0],p1[1]-p0[1])+.6;
      arcade(g,S,0,-1,0,len,10,2,3,2,{span:.3});arcade(g,S,0,9,0,len,8,2,2.6,2,{span:.28});const Pi=(r,aa,y)=>F.p(Math.cos(aa)*r,y,Math.sin(aa)*r*rz/rx);g.set(26,.5);g.poly([Pi(18,a,2),Pi(18,a1,2),Pi(44,a1,16),Pi(44,a,16)],[0,1,0]);g.set(27,.5);g.poly([F.p(0,.3,0),Pi(18,a1,.3),Pi(18,a,.3)],[0,1,0]);}});
  W.pois.push({n:'陶鲁斯圆形剧场',l:'Amphitheatrum Statilii Tauri',x:-610,z:-330,y:gy(-610,-330)+26,s0:0,s1:6,d:1600,info:'公元前29年建成的石砌圆形剧场，64年大火中烧毁。'});
  L('neroAmph',14,(g)=>{const F=frame(-880,gy(-880,-1090),-1090,.2),rx=50,rz=38;for(let k=0;k<24;k++){const a=k/24*TAU,a1=(k+1)/24*TAU,P0=F.p(Math.cos(a)*rx,0,Math.sin(a)*rz),P1=F.p(Math.cos(a1)*rx,0,Math.sin(a1)*rz),len=Math.hypot(P1[0]-P0[0],P1[2]-P0[2]),S=frame((P0[0]+P1[0])/2,F.oy,(P0[2]+P1[2])/2,Math.atan2(-(P1[2]-P0[2]),P1[0]-P0[0]));
      g.set(3,.45);box(g,S,0,-1,0,len/2+.3,15,.5,31);for(let t=-len/2;t<len/2;t+=3)box(g,S,t,-1,.8,.18,15,.18,31);const Pi=(r,aa,y)=>F.p(Math.cos(aa)*r,y,Math.sin(aa)*r*rz/rx);g.set(26,.6);g.poly([Pi(20,a,2),Pi(20,a1,2),Pi(48,a1,13),Pi(48,a,13)],[0,1,0]);g.set(27,.5);g.poly([F.p(0,.3,0),Pi(20,a1,.3),Pi(20,a,.3)],[0,1,0]);}});
  W.pois.push({n:'尼禄木构圆形剧场',l:'Amphitheatrum Neronis',x:-880,z:-1090,y:gy(-880,-1090)+24,s0:3,s1:99,d:1600,info:'57年尼禄在战神广场用木头搭的圆形剧场，一年建成。'});
  L('macellum',12,(g)=>{const F=frame(890,gy(890,910),910,0);courtBlock(W,g,F,{cx:0,cz:0,w:80,d:64,y0:0,nSt:2,sH:3.8,gH:4.6,cw:56,cd:40,part:0,seed:.62,sty:8,fl:8|2,garden:false});tholos(W,g,{x:F.ox,y:F.oy,z:F.oz,R:9,podH:1.2,colH:7,n:16,roofPart:16});});
  W.pois.push({n:'大市场',l:'Macellum Magnum',x:890,z:910,y:gy(890,910)+24,s0:7,s1:99,d:1600,info:'59年尼禄在西里欧山修的大市场，中央是两层圆亭，印在尼禄的钱币上。'});
  const plume=(x0,z0,len,col)=>{const P=densify(TIBER,20);let bi=0,bd=1e9;for(let i=0;i<P.length;i++){const dd=Math.hypot(P[i][0]-x0,P[i][1]-z0);if(dd<bd){bd=dd;bi=i;}}
    const a0=P[bi],b0=P[Math.min(P.length-1,bi+1)],sd=Math.sign((x0-a0[0])*(b0[1]-a0[1])-(z0-a0[1])*(b0[0]-a0[0]))||1,pos=[],uv=[],idx=[];let acc=0,n=0;
    for(let i=bi;i<P.length-1&&acc<len;i++){const a=P[i],b=P[i+1],tx=b[0]-a[0],tz=b[1]-a[1],l=Math.hypot(tx,tz)||1,nx=tz/l,nz=-tx/l,t=acc/len,w=14+t*30,off=sd*(RTW-10-w*.5)*(1-t*.7),cx=a[0]+nx*off,cz=a[1]+nz*off;
      pos.push(cx-nx*w,RW+.25,cz-nz*w,cx+nx*w,RW+.25,cz+nz*w);uv.push(t,0,t,1);if(n>0){const k=(n-1)*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}n++;acc+=l;}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uTime:U.uTime,uC:{value:new THREE.Color(col[0],col[1],col[2])}},
      vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec2 vU;uniform float uTime;uniform vec3 uC;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}void main(){float e=smoothstep(0.,.3,vU.y)*smoothstep(1.,.7,vU.y);float a=pow(1.-vU.x,1.2)*e*(.45+.55*n2(vec2(vU.x*40.-uTime*.35,vU.y*5.+uTime*.05)));gl_FragColor=vec4(uC,a*.6);}'});
    const mesh=new THREE.Mesh(geo,m);mesh.renderOrder=2;return mesh;};
  for(const[nm,x0,z0,len,col]of[['sewageA',ZF.ox,ZF.oz,1400,[.3,.23,.12]],['sewageB',(typeof ZB!=='undefined'?ZB.ox:ZF.ox),(typeof ZB!=='undefined'?ZB.oz:ZF.oz),1100,[.26,.23,.15]]]){const G2=new THREE.Group();G2.add(plume(x0,z0,len,col));G2.name=nm;G2.userData.rise=0;G2.visible=false;W.scene.add(G2);W.layers[nm]=G2;}
  L('bathSite',0,(g,G)=>{g.set(23,.45);g.poly([BF.p(-176,.15,-88),BF.p(176,.15,-88),BF.p(176,.15,88),BF.p(-176,.15,88)],[0,1,0]);g.set(11,.35);g.poly([BF.p(-176,.2,-3),BF.p(176,.2,-3),BF.p(176,.2,3),BF.p(-176,.2,3)],[0,1,0]);g.poly([BF.p(-3,.2,-88),BF.p(3,.2,-88),BF.p(3,.2,88),BF.p(-3,.2,88)],[0,1,0]);
    for(let x=-165;x<=165;x+=15)for(let z=-80;z<=80;z+=16){if(Math.abs(x)<9||Math.abs(z)<9)continue;const q=BF.p(x,0,z);W.trees.push([q[0],gy(q[0],q[2]),q[2],(x/15+z/16)%3===0?'cyp':'pine',.9]);}
    portico(W,g,BF,-60,-88,60,-88,0,6,-5,3.4,[1,.96,.9]);});
  W.pois.push({n:'阿格里帕花园',l:'Horti Agrippae',x:-895,z:-834,y:gy(-895,-834)+16,s0:0,s1:2,d:1600,info:'后来尼禄大浴场的地基，在此之前是阿格里帕留给市民的花园。'});
  /* Claudius precinct on the Caelian (novel vols 9-13 and 20; 小说文本/发电房建设线_阶段与核算.md). The platform, its west arcade and the east water-works site (W.claudEast) are in monuments.js.
     claudSite  [0,6]  the building site round the temple: stone piles, a treadwheel crane, the NE corner of the platform still open masonry
     claudOldTemple [0,5]  the stalled temple: rough podium, column stumps, low cella walls in scaffolding
     claudHall  [6,8]  the old hall roofed in 58 (vol 10: "台基上旧殿，补梁，盖瓦，防渗"): walls brought up, new red tiles; that counts as the temple finished
     claudWeeds [3,5]  grass in the joints (vol 10: "石料堆在台基旁边，草从缝里长出来")
     claudWorks [-1,-1] (no state: the novel finishes the works within 58, vol 10 to vol 13, so state 6 shows them done; the video team switches this on for the building shots) AD 58 on the east face: survey stakes and line from the intake down the slope, trial pit, tail race tried with clean water, basin and gallery half built, piles, the wheel set
     claudDone  [6,8]  dressed faces and the precinct colonnades
     claudWater [6,8]  the nymphaeum: three receding light-stone tiers, five falls (the wide one narrowed, thin ones beside it, vol 10), the gallery behind the water, pool, tail race, water tower, gauge basin
     claudMill  [6,8]  machine room and plating room below the pool; the wheel turns in 58 (vol 10: the first turn with the machine) and in state 8 (vol 20 restored); 59-68 it stands
     claudLamps [8,8]  vol 20 "水后的灯从一龛添到几龛": three lit niches behind the water, the machine-room window
     claudLamp1        vol 13 "亮的只有这一龛": one lit niche, switched by the paragraph trigger (app.js TRIG / applyGates, event claudLamp)
     The tail race runs on down the slope to the fullery's treading vats (monuments.js), not to drinking water. */
  {const F=W.claudF,CE=W.claudEast,FE=CE.FE,TF=F.sub(0,0,0,Math.PI/2),R=RNG(5401),gP=p=>gy(p[0],p[2]),yG=(x,z)=>gP(FE.p(x,0,z))-F.oy;   // yG: ground under an FE point, from the platform top
   // straight member between two world points: n = width direction (made normal to the axis), thickness along axis x n
   const prism=(g,A,B,n,w,h)=>{const d=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],l=Math.hypot(...d)||1;for(let i=0;i<3;i++)d[i]/=l;const k=n[0]*d[0]+n[1]*d[1]+n[2]*d[2],u0=[n[0]-k*d[0],n[1]-k*d[1],n[2]-k*d[2]],ul=Math.hypot(...u0)||1,u=u0.map(v=>v/ul),
       b=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]],c=(P,su,sb)=>[0,1,2].map(i=>P[i]+u[i]*w/2*su+b[i]*h/2*sb);
     g.poly([c(A,1,-1),c(B,1,-1),c(B,1,1),c(A,1,1)],u);g.poly([c(A,-1,1),c(B,-1,1),c(B,-1,-1),c(A,-1,-1)],u.map(v=>-v));
     g.poly([c(A,1,1),c(B,1,1),c(B,-1,1),c(A,-1,1)],b);g.poly([c(A,-1,-1),c(B,-1,-1),c(B,1,-1),c(A,1,-1)],b.map(v=>-v));
     g.poly([c(A,-1,-1),c(A,1,-1),c(A,1,1),c(A,-1,1)],d.map(v=>-v));g.poly([c(B,-1,-1),c(B,-1,1),c(B,1,1),c(B,1,-1)],d);};
   // water wheel in the x-y plane of an identity frame, axle along +z: two iron-shod rims, buckets, spokes, iron axle
   const wheel=(g,r,wd,n,axle)=>{const P=(a,rr,z)=>[Math.cos(a)*rr,Math.sin(a)*rr,z];g.set(3,.42);
     for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU;for(const z of[-wd/2,wd/2])prism(g,P(a0,r,z),P(a1,r,z),[0,0,1],.16,.28);prism(g,P(a0,r-.17,-wd/2),P(a0,r-.17,wd/2),[Math.cos(a0+.5),Math.sin(a0+.5),0],.05,.45);}
     for(let i=0;i<8;i++){const a=i/8*TAU;for(const z of[-wd/2,wd/2])prism(g,P(a,.3,z),P(a,r-.14,z),[0,0,1],.11,.11);}g.set(18,.5);prism(g,[0,0,-wd/2-.5],[0,0,wd/2+axle],[0,1,0],.28,.28);};
   const pole=(g,F2,x,z,y0,h)=>{g.set(32,.45);box(g,F2,x,y0,z,.11,h,.11,31);};
   const P3=(x,y,z)=>FE.p(x,y,z);
   // falling water: translucent sheets with streaks running down (the pool material is opaque and shades as a level surface); a lamp behind still shows through
   const fallMesh=(quads)=>{const pos=[],uv=[],idx=[];quads.forEach(([a,b,c,d,w,h],i)=>{pos.push(...a,...b,...c,...d);uv.push(0,0,w,0,w,h,0,h);const k=i*4;idx.push(k,k+1,k+2,k,k+2,k+3);});
     const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);
     const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uTime:U.uTime,uNight:U.uNight},
       vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
       fragmentShader:'varying vec2 vU;uniform float uTime,uNight;float h(float x){return fract(sin(x*127.1)*43758.5);}void main(){float c=floor(vU.x*6.);float s=fract(vU.y*.9+uTime*(1.1+h(c)*.9)+h(c+3.));float k=smoothstep(0.,.45,s)*smoothstep(1.,.55,s);vec3 col=mix(vec3(.5,.64,.68),vec3(.9,.95,.97),k*.75)*(1.-uNight*.75);gl_FragColor=vec4(col,.34+.34*k);}'});
     const mesh=new THREE.Mesh(geo,m);mesh.renderOrder=2;return mesh;};
   const vq=(arr,x0,x1,z,y0,y1)=>arr.push([P3(x0,y0,z),P3(x1,y0,z),P3(x1,y1,z),P3(x0,y1,z),x1-x0,(y1-y0)/2]);   // a vertical sheet across FE x at depth z
   const wstrip=(pg,a,b,hw,dy=0)=>{const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;pg.poly([[a[0]+nx,a[1]+dy,a[2]+nz],[b[0]+nx,b[1]+dy,b[2]+nz],[b[0]-nx,b[1]+dy,b[2]-nz],[a[0]-nx,a[1]+dy,a[2]-nz]],[0,1,0]);};   // water on a sloping channel between world points
   // a wall along FE (x0,z0)-(x1,z1) up to `top`, its foot 1.5 m below the lowest ground under it (built up from the slope, never dug)
   const wallFE=(g,x0,z0,x1,z1,top,th,part,seed=.45)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/4)),rot=Math.atan2(-(z1-z0),x1-x0);g.set(part,seed);
     for(let i=0;i<n;i++){const ax=lerp(x0,x1,i/n),az=lerp(z0,z1,i/n),bx=lerp(x0,x1,(i+1)/n),bz=lerp(z0,z1,(i+1)/n),lo=Math.min(yG(ax,az),yG(bx,bz),yG((ax+bx)/2,(az+bz)/2))-1.5;if(top-lo<.05)continue;
       box(g,FE.sub((ax+bx)/2,0,(az+bz)/2,rot),0,lo,0,Math.hypot(bx-ax,bz-az)/2+th/2,top-lo,th/2,31);}};
   const stumps=(g,lo,hi)=>{const R2=RNG(5402),m=1.26,ic=(30-2*m)/7;g.set(6,.3);for(let c=0;c<8;c++)for(const z of[20.9,20.9-ic]){const h=lo+(hi-lo)*R2();lathe(g,TF,-15+m+c*ic,4,z,[[.7,0],[.7,h],[0,h]],10);}   // the same stumps in every state
     for(let z=20.9-2*ic;z>-20.9;z-=ic)for(const x of[-15+m,15-m])if(R2()<.75){const h=lo+(hi-lo)*R2();lathe(g,TF,x,4,z,[[.7,0],[.7,h],[0,h]],10);}};
   const podium=(g)=>{g.set(22,.45);box(g,TF,0,-1.5,0,15,5.5,22,31);g.set(6,.3);box(g,TF,0,-1.5,14,15.1,5,8.1,31);};   // rough podium core; the marble facing has reached only its front third
   const NX=[36,40,44,48,52],NW=[1.1,1.1,2.2,1.1,1.1],PO=CE.pool,WH=CE.wheel,ML=CE.mill,PL=CE.plate,yHub=CE.floor+WH.r+.35,yTop=yHub+WH.r;
   L('claudOldTemple',0,(g)=>{podium(g);stumps(g,.9,5.5);g.set(22,.42);for(const[x,z,hx,hz,h]of[[-9.6,-4,.6,13,4.2],[9.6,-4,.6,13,2.6],[0,-17,9.6,.6,3.4],[-6,9,3.6,.6,5.2]])box(g,TF,x,4,z,hx,h,hz,31);   // cella walls of uneven height, the door wall barely begun
     for(const x of[-11,11])for(let z=-18;z<=10;z+=7)pole(g,TF,x,z,4,9);g.set(32,.4);for(const y of[7,10])for(const x of[-11,11])box(g,TF,x,y,-4,.08,.08,14,31);});   // scaffold poles and ledgers along the cella
   L('claudHall',0,(g)=>{podium(g);stumps(g,.9,5.5);const top=14.5;g.set(22,.44);for(const[x,z,hx,hz]of[[-9.6,-4,.6,13.6],[9.6,-4,.6,13.6],[0,-17,9.6,.6],[-6.6,9,3,.6],[6.6,9,3,.6]])box(g,TF,x,4,z,hx,top-4,hz,31);box(g,TF,0,10.2,9,3.6,top-10.2,.6,31);   // walls brought up; the door left open below the lintel
     g.set(7,.3);g.poly([TF.p(-3.6,4.05,9.62),TF.p(3.6,4.05,9.62),TF.p(3.6,10.15,9.62),TF.p(-3.6,10.15,9.62)],TF.d(0,0,1));
     roof(g,TF,'gableZ',0,-4,20.4,27.4,top,20*DEG,.8,.207,{part:22,seed:.44,nSt:1,gH:top-4,sH:4,floorY:4});});   // new red tiles over the old hall (seed .207: the reddest roof colour)
   L('claudSite',0,(g)=>{substructFaces(W,g,F,0,0,90,100,F.oy,{unf:{N:{x0:60,x1:90},E:{x0:-100,x1:-70}}});
     for(let k=0;k<11;k++){const q=F.p(-60+R()*120,0,(R()<.5?-1:1)*(34+R()*40)),S=frame(q[0],F.oy,q[2],R()*TAU),n=2+Math.floor(R()*4);g.set(2,.35+R()*.15);   // stone piles: squared blocks and column drums
       for(let i=0;i<n;i++){const ox=(i%2)*1.5-.75,oz=Math.floor(i/2)*1.1;if(R()<.35)lathe(g,S,ox,0,oz,[[.7,0],[.7,.9],[0,.9]],10);else box(g,S,ox,0,oz,.7,.75,.5,31);}if(n>3)box(g,S,0,.75,.5,.7,.75,.5,31);}
     {const q=F.p(30,0,30),C=frame(q[0],F.oy,q[2],.4),B=C.p(0,15,-6),J=C.p(0,9,-13);g.set(32,.42);   // treadwheel crane: three raking legs, a jib, the walking wheel at its foot
      prism(g,C.p(0,0,0),B,[1,0,0],.35,.35);prism(g,C.p(3,0,-1),B,[1,0,0],.3,.3);prism(g,C.p(-3,0,-1),B,[1,0,0],.3,.3);prism(g,B,J,[1,0,0],.25,.25);g.set(3,.4);prism(g,J,C.p(0,1.2,-13),[1,0,0],.04,.04);
      g.set(3,.38);for(let i=0;i<16;i++){const a0=i/16*TAU,a1=(i+1)/16*TAU,P=(a,s)=>C.p(s*.9,2.6+Math.sin(a)*2.5,2.4+Math.cos(a)*2.5);prism(g,P(a0,1),P(a1,1),[0,1,0],.12,.18);prism(g,P(a0,-1),P(a1,-1),[0,1,0],.12,.18);prism(g,P(a0,-1),P(a0,1),[0,1,0],.06,.12);}}});
   L('claudWeeds',0,(g)=>{g.set(23,.5);for(let k=0;k<26;k++){const x=-82+R()*164,z=-92+R()*184;if(Math.abs(x)<18&&Math.abs(z)<26)continue;const S=F.sub(x,0,z,R()*TAU),a=2+R()*6,b=1.2+R()*3;g.poly([S.p(-a,.06,-b),S.p(a,.06,-b),S.p(a*.7,.06,b),S.p(-a*.8,.06,b*.8)],[0,1,0]);}
     for(let k=0;k<9;k++){const q=F.p(-80+R()*160,0,-90+R()*180);W.trees.push([q[0],F.oy+.05,q[2],'shrub',.5+R()*.4,null,2]);}});
   // shared pieces of the east works
   const wheelPit=(g)=>{g.set(20,.4);box(g,FE,WH.x,CE.floor,WH.z,.62,.1,WH.r+.5,31);for(const s of[-1,1])wallFE(g,WH.x+s*.85,WH.z-WH.r-.7,WH.x+s*.85,WH.z+WH.r+.7,yHub+.4,.3,22);};
   const wheelMesh=(G,turn)=>{const wg=new GB(1<<13);wheel(wg,WH.r,1,16,ML.x-ML.hw-WH.x);const m=wg.mesh(MAT.city);if(!m)return;
     const piv=new THREE.Object3D(),spin=new THREE.Object3D(),q=P3(WH.x,yHub,WH.z);piv.position.set(q[0],q[1],q[2]);piv.rotation.y=FE.rot+Math.PI/2;spin.add(m);piv.add(spin);G.add(piv);   // wheel axle = FE +x, into the machine room
     if(turn)W.anim.push(t=>{if(G.visible&&(curS===6||curS===8))spin.rotation.z=t*.9;});};   // 59-68 the wheel stands (curS is the story state, app.js)
   // tail race: from the wheel pit down the slope; the water never rises (each point no higher than the last) and follows the ground where the ground is lower
   const race=[[WH.x,WH.z+WH.r+.9],...CE.race.slice(1)],ry=[];{let y=-6.5;for(const[x,z]of densify(race,4)){y=Math.min(y,yG(x,z)+.45);ry.push([x,y,z]);}}
   const tailRace=(g,pg,part,rail)=>{for(let i=0;i<ry.length-1;i++){const a=ry[i],b=ry[i+1],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,E=(p,o,dy)=>P3(p[0]+nx*o,p[1]+dy,p[2]+nz*o);   // E: offset across the race, height above that point's water
       g.set(part,.42);for(const s of[-1,1]){const lo=Math.min(yG(a[0]+nx*s*1.2,a[2]+nz*s*1.2),yG(b[0]+nx*s*1.2,b[2]+nz*s*1.2))-.6;prism(g,E(a,s*1.05,.15),E(b,s*1.05,.15),[0,1,0],.3,.6);
         g.poly([E(a,s*1.2,-.15),E(b,s*1.2,-.15),E(b,s*1.2,lo-b[1]),E(a,s*1.2,lo-a[1])],FE.d(s*nx,0,s*nz));}
       g.set(21,.42);g.poly([E(a,-.9,-.35),E(b,-.9,-.35),E(b,.9,-.35),E(a,.9,-.35)],[0,1,0]);if(pg)pg.poly([E(a,-.9,0),E(b,-.9,0),E(b,.9,0),E(a,.9,0)],[0,1,0]);
       if(rail&&i%2===0){g.set(3,.4);const p=E(a,1.2,.45);box(g,frame(p[0],p[1],p[2],0),0,0,0,.06,.95,.06,31);prism(g,E(a,1.2,1.35),E(b,1.2,1.35),[0,1,0],.07,.07);}}};
   const basin=(g,top)=>{wallFE(g,PO.x0,PO.z1,PO.x1,PO.z1,top,.6,2);wallFE(g,PO.x0,PO.z0,PO.x0,PO.z1,top,.6,2);wallFE(g,PO.x1,PO.z0,PO.x1,PO.z1,top,.6,2);};
   const stakes=(g)=>{const line=[[CE.tower.x,CE.tower.z],[CE.tower.x,2],[PO.x1+2,8],...race],pts=densify(line,8);let prev=null;   // vol 10: "我们从接水的地方一直量到坡下"
     for(const[x,z]of pts){const y=Math.max(yG(x,z),z<0?0:-99);pole(g,FE,x,z,y,1.5);g.set(25,.5);box(g,FE,x,y+1.45,z,.12,.15,.12,31);const top=P3(x,y+1.4,z);if(prev){g.set(3,.3);prism(g,prev,top,[0,1,0],.025,.025);}prev=top;}};
   L('claudWorks',0,(g,G)=>{const pg=new GB(1024);stakes(g);
     basin(g,PO.rim-2.2);g.set(2,.42);for(let i=0;i<=5;i++){const x=CE.fx0+i*(CE.fx1-CE.fx0)/5;wallFE(g,x-.4,CE.zA,x+.4,CE.zA,CE.yF+2.2,.8,2);}   // basin walls and the gallery piers half up
     for(let x=CE.fx0-1;x<=CE.fx1+1;x+=3){const y=yG(x,CE.zA+1.2);pole(g,FE,x,CE.zA+1.2,y,CE.yC+1-y);}g.set(32,.4);for(const y of[0,2.4,4.8])box(g,FE,(CE.fx0+CE.fx1)/2,y,CE.zA+1.2,(CE.fx1-CE.fx0)/2+1,.08,.08,31);
     g.set(21,.45);box(g,FE,WH.x,yG(WH.x,WH.z)-.4,WH.z,1.6,.5,WH.r+1.2,31);   // the trial pit outside, not under the arches
     g.set(3,.35);for(let x=ML.x-ML.hw;x<=ML.x+ML.hw+.01;x+=2.5)for(let z=ML.z-ML.hd;z<=ML.z+ML.hd+.01;z+=2.5){const y=yG(x,z);if(CE.floor-y>.2)box(g,FE,x,y-.5,z,.15,CE.floor-y+.8,.15,31);}   // piles, driven once the tail water drained
     wheelPit(g);wheelMesh(G,false);tailRace(g,pg,22,false);G.add(pg.mesh(MAT.pool,false));   // the tail race tried with clean water
     for(const x of[-11.2,11.2])for(let z=-18;z<=10;z+=4.7)pole(g,TF,x,z,4,12.4);g.set(32,.4);for(const y of[8,12])for(const x of[-11.2,11.2])box(g,TF,x,y,-4,.08,.08,14.2,31);});   // scaffold for the new roof beams and tiles on the old hall
   L('claudDone',6,(g)=>{substructFaces(W,g,F,0,0,90,100,F.oy,{});for(const[ax,az,bx,bz]of[[-80,-90,80,-90],[80,90,-80,90]])portico(W,g,F,ax,az,bx,bz,0,7,-6,4,[1,.97,.9]);});
   L('claudWater',0,(g,G)=>{const pg=new GB(4096),falls=[],mx=(CE.fx0+CE.fx1)/2,hx=(CE.fx1-CE.fx0)/2;
     // three receding tiers of light stone: the gallery (front at zA), the middle tier (zB) and the crest (zC) with the water channel on top
     g.set(2,.46);box(g,FE,mx,CE.yF,CE.zBack/2,hx,CE.yB-CE.yF,CE.zBack/2,31);   // infill against the old face
     g.set(6,.42);box(g,FE,mx,CE.yF-.35,(CE.zBack+CE.zA)/2,hx+.5,.35,(CE.zA-CE.zBack)/2+.4,31);   // gallery floor
     arcade(g,FE,mx,CE.yF,CE.zA,CE.fx1-CE.fx0,CE.yA-CE.yF,5,.8,6,{span:.36,attic:.45,pilasters:false,cornice:false});g.set(2,.5);box(g,FE,mx+2,CE.yF,CE.zBack+.45,3,.45,.3,31);   // vol 13: "这里可以放一张凳子" - the bench behind the waterg.set(6,.44);box(g,FE,CE.fx1,CE.yF,(CE.zBack+CE.zA)/2,.4,CE.yA-CE.yF,(CE.zA-CE.zBack)/2,31);   // arcade; the north end closed, the south end the way in
     g.set(6,.4);box(g,FE,mx,CE.yA,(CE.zBack+CE.zA)/2+.2,hx+.4,.5,(CE.zA-CE.zBack)/2+.6,31);box(g,FE,mx,CE.yA+.5,(CE.zBack+CE.zB)/2,hx,CE.yB-CE.yA-.5,(CE.zB-CE.zBack)/2,31);box(g,FE,mx,CE.yB,CE.zC/2,hx,CE.yC-CE.yB,CE.zC/2,31);
     g.set(2,.5);for(const z of[CE.zC-.15,.15])box(g,FE,mx,CE.yC,z,hx,.3,.15,31);   // the channel kerbs on the crest
     pg.poly([P3(CE.fx0,CE.yC+.18,.3),P3(CE.fx1,CE.yC+.18,.3),P3(CE.fx1,CE.yC+.18,CE.zC-.3),P3(CE.fx0,CE.yC+.18,CE.zC-.3)],[0,1,0]);
     NX.forEach((x,i)=>{const w=NW[i]/2;g.set(7,.3);for(const[z,y0,y1]of[[CE.zC+.02,CE.yB+.25,CE.yC-.2],[CE.zB+.02,CE.yA+.75,CE.yB-.15],[CE.zBack+.02,CE.yF+.3,CE.yA-.4]])g.poly([P3(x-w-.4,y0,z),P3(x+w+.4,y0,z),P3(x+w+.4,y1,z),P3(x-w-.4,y1,z)],FE.d(0,0,1));   // niche recesses
       for(const[z,y0,y1]of[[CE.zC+.06,CE.yB+.05,CE.yC+.18],[CE.zB+.06,CE.yA+.55,CE.yB+.05],[CE.zA+.45,PO.y,CE.yA+.55]])vq(falls,x-w,x+w,z,y0,y1);   // the falls: down the crest, the middle tier, and as a curtain before the gallery
       for(const[z0,z1,y]of[[CE.zC,CE.zB,CE.yB+.06],[CE.zB,CE.zA+.45,CE.yA+.56]])pg.poly([P3(x-w,y,z0),P3(x+w,y,z0),P3(x+w,y,z1),P3(x-w,y,z1)],[0,1,0]);});
     basin(g,PO.rim);g.set(20,.4);box(g,FE,(PO.x0+PO.x1)/2,PO.y-1.4,(PO.z0+PO.z1)/2,(PO.x1-PO.x0)/2,.2,(PO.z1-PO.z0)/2,31);pg.poly([P3(PO.x0+.3,PO.y,PO.z0+.4),P3(PO.x1-.3,PO.y,PO.z0+.4),P3(PO.x1-.3,PO.y,PO.z1-.3),P3(PO.x0+.3,PO.y,PO.z1-.3)],[0,1,0]);
     g.set(3,.4);for(let x=PO.x0+1;x<=PO.x1-1;x+=2.4){box(g,FE,x,PO.rim,PO.z1,.05,1,.05,31);}box(g,FE,(PO.x0+PO.x1)/2,PO.rim+.95,PO.z1,(PO.x1-PO.x0)/2-1,.06,.06,31);   // railing on the pool edge
     {g.set(2,.45);const lx=CE.fx0-9.5,lo=Math.min(yG(lx,2.8),-1)-1;box(g,FE,lx,lo,2.8,2,-lo,2.8,31);for(let k=0;k<4;k++){const x=CE.fx0-6.9+k*1.4,y=CE.yF*(k+1)/4,b=Math.min(yG(x,3.5),y)-1;box(g,FE,x,b,3.5,.75,y-b,2,31);}}   // landing at the platform edge, steps down into the gallery (Nero's way in)
     {const T=CE.tower,G2=CE.gauge;rectWalls(g,FE,T.x,T.z,4,4,-.6,6.2,0,{part:9,seed:.4,sty:0,fl:1,nSt:1,gH:6.2,sH:3,lit:.2});g.set(2,.45);box(g,FE,T.x,6.2,T.z,2.3,.35,2.3,31);pg.poly([P3(T.x-1.7,6.4,T.z-1.7),P3(T.x+1.7,6.4,T.z-1.7),P3(T.x+1.7,6.4,T.z+1.7),P3(T.x-1.7,6.4,T.z+1.7)],[0,1,0]);   // water tower: the branch from the Claudia distribution rises here
      g.set(18,.5);prism(g,P3(T.x,5.8,T.z+2),P3(T.x,CE.yC+.3,.4),[1,0,0],.25,.25);   // lead pipe to the crest channel
      g.set(2,.45);for(const[dx,dz,hx,hz]of[[0,-1.2,1.6,.15],[0,1.2,1.6,.15],[-1.6,0,.15,1.2],[1.6,0,.15,1.2]])box(g,FE,G2.x+dx,0,G2.z+dz,hx,.7,hz,31);pg.poly([P3(G2.x-1.45,.55,G2.z-1.05),P3(G2.x+1.45,.55,G2.z-1.05),P3(G2.x+1.45,.55,G2.z+1.05),P3(G2.x-1.45,.55,G2.z+1.05)],[0,1,0]);g.set(18,.6);box(g,FE,G2.x+1.2,0,G2.z,.05,1.6,.05,31);}   // gauge basin (取水池) with a bronze measuring rod
     {const top=[CE.tower.x+2,.9,-3.5],bend=[WH.x,.6,-1.2],end=[WH.x,yTop+.45,WH.z-.9];g.set(2,.42);prism(g,P3(...top),P3(...bend),[0,1,0],1,.45);prism(g,P3(...bend),P3(...end),[0,1,0],1,.45);   // mill leat: along the platform top, then over the edge onto the wheel (the other branch of the same water)
      for(let k=1;k<4;k++){const t=k/4,x=lerp(bend[0],end[0],t),z=lerp(bend[2],end[2],t),y=lerp(bend[1],end[1],t),b=yG(x,z);if(z>0&&y-b>1)box(g,FE,x,b,z,.35,y-b-.25,.35,31);}
      wstrip(pg,P3(...top),P3(...bend),.35,.25);wstrip(pg,P3(...bend),P3(...end),.35,.25);}
     {const a=P3(PO.x1-.5,PO.y-.1,9),b=P3(race[0][0]-1,-6.3,race[0][1]+.3);g.set(2,.42);prism(g,a,b,[0,1,0],.8,.3);wstrip(pg,a,b,.3,.18);}   // the pool spills into the tail race
     tailRace(g,pg,2,true);G.add(pg.mesh(MAT.pool,false));G.add(fallMesh(falls));
     W.views.claudiusE={n:'克劳狄神殿·东面水景',pos:P3(80,24,48),tgt:P3(48,-2,6)};});
   L('claudMill',0,(g,G)=>{const fl=CE.floor,base=(o)=>Math.min(...[[-o.hw,-o.hd],[o.hw,-o.hd],[-o.hw,o.hd],[o.hw,o.hd],[0,0]].map(([dx,dz])=>yG(o.x+dx,o.z+dz)))-1;
     rectWalls(g,FE,ML.x,ML.z,ML.hw*2,ML.hd*2,base(ML),fl+ML.h,fl,{part:9,seed:.42,sty:0,fl:1,nSt:1,gH:ML.h,sH:3,lit:.2});roof(g,FE,'gable',ML.x,ML.z,ML.hw*2+.8,ML.hd*2+.8,fl+ML.h,24*DEG,.4,.38,{part:9,seed:.42,nSt:1,gH:ML.h,sH:3,floorY:fl});   // machine room ("下到机房")
     rectWalls(g,FE,PL.x,PL.z,PL.hw*2,PL.hd*2,base(PL),fl+PL.h,fl,{part:0,seed:.3,sty:0,fl:1,nSt:1,gH:PL.h,sH:3,lit:.2});roof(g,FE,'gable',PL.x,PL.z,PL.hw*2+.6,PL.hd*2+.6,fl+PL.h,22*DEG,.35,.42,{part:0,seed:.3,nSt:1,gH:PL.h,sH:3,floorY:fl});   // the plating room next door ("另一间装镀槽的屋子")
     {const sx=(PO.x1+WH.x-.85)/2;g.set(2,.42);for(let k=0;k<12;k++){const z=1+k*.95,y=fl*(k+1)/12,b=Math.min(yG(sx,z),y)-1;box(g,FE,sx,b,z,.9,y-b,.5,31);}const b=Math.min(yG(sx,12.9),fl)-1;box(g,FE,sx,b,12.9,.9,fl-b,.9,31);}   // "下到机房": a stair from the platform edge between the pool and the wheel pit, then a landing to the door
     wheelPit(g);wheelMesh(G,true);});
   const lamp=(G,xs)=>{for(const x of xs){const m=new THREE.Mesh(new THREE.PlaneGeometry(NW[NX.indexOf(x)]+.6,CE.yA-CE.yF-.9),lampMat(.95,.97,1,26)),q=P3(x,(CE.yF+CE.yA)/2-.05,CE.zBack+.05);m.position.set(q[0],q[1],q[2]);m.rotation.y=FE.rot;G.add(m);}};   // carbon arcs behind glass in dry niches; their light comes through the thin fall
   L('claudLamps',0,(g,G)=>{lamp(G,NX.slice(1,4));const win=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.4),lampMat(1,.7,.36,10)),wq=P3(ML.x+1.5,CE.floor+2.4,ML.z+ML.hd+.06);win.position.set(wq[0],wq[1],wq[2]);win.rotation.y=FE.rot;G.add(win);});
   L('claudLamp1',0,(g,G)=>{lamp(G,[NX[2]]);});
   {const q=P3(PL.x,0,PL.z);W.pois.push({n:'镀房',l:'Claudius · 机房与镀房',x:q[0],z:q[2],y:F.oy+CE.floor+9,s0:7,s1:99,d:700,sub:true,info:'【书中】第13卷：“下到机房，水轮和轴都藏在隔墙后面，地上干着。铜线绕过烧好的陶制托件，到了另一间装镀槽的屋子。”'});}
   }
  /* Piso's house on the Aventine (vol 9): standing until 58, burnt the night of the fire, a ruin afterwards:
     "墙塌了一半，屋顶没了，满地都是烧黑的木头。中庭的大理石地砖还在，被火烤得发黄，有几块裂了。" pisoFire is the night itself (paragraph trigger, app.js). */
  if(W.pisoSite){const P=W.pisoSite,S=frame(P.x,P.y,P.z,P.rot),w=P.hw*2-3,d=P.hd*2-3,R=RNG(9058),cw=w*.5,cd=d*.46,gyS=(x,z)=>{const q=S.p(x,0,z);return gy(q[0],q[2])-P.y;};
   L('pisoHouse',0,(g,G)=>{const pool=new GB(512),keep=W.poolG;W.poolG=pool;emitBuilding(W,g,'domus',P.x,P.z,P.rot,w,d,2,P.y,P.y+2.5,R,{shops:0,brick:.2});W.poolG=keep;const m=pool.mesh(MAT.pool,false);if(m)G.add(m);});
   L('pisoRuin',0,(g)=>{const fl=.15;
     // outer walls broken into 3 m pieces: a third stands to the eaves, the rest is down to a metre or two
     for(const[ax,az,bx,bz]of[[-w/2,-d/2,w/2,-d/2],[w/2,-d/2,w/2,d/2],[w/2,d/2,-w/2,d/2],[-w/2,d/2,-w/2,-d/2],[-cw/2,-cd/2,cw/2,-cd/2],[cw/2,-cd/2,cw/2,cd/2],[cw/2,cd/2,-cw/2,cd/2],[-cw/2,cd/2,-cw/2,-cd/2]]){const L2=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L2/3)),rot=Math.atan2(-(bz-az),bx-ax);
       for(let i=0;i<n;i++){const t=(i+.5)/n,x=lerp(ax,bx,t),z=lerp(az,bz,t),h=R()<.34?6+R()*2.5:.6+R()*1.8,lo=Math.min(gyS(x,z),fl)-1;g.set(9,.36+R()*.06);box(g,S.sub(x,0,z,rot),0,lo,0,L2/n/2+.02,fl+h-lo,.32,31);
         if(h>4){g.set(20,.4);box(g,S.sub(x,0,z,rot),0,fl+h-1.4,0,L2/n/2+.03,1.4,.34,31);}}}   // soot on the standing tops
     g.set(27,.5);box(g,S,0,fl-.2,0,cw/2-.4,.25,cd/2-.4,31);g.set(20,.4);for(let k=0;k<6;k++){const x=(R()-.5)*(cw-3),z=(R()-.5)*(cd-3),r=R()*Math.PI;box(g,S.sub(x,0,z,r),0,fl+.06,0,1.2+R()*2,.02,.04,31);}   // the court's marble floor, scorched yellow, cracked
     g.set(21,.4);for(const[x0,x1,z0,z1]of[[-w/2,w/2,-d/2,-cd/2],[-w/2,w/2,cd/2,d/2],[-w/2,-cw/2,-cd/2,cd/2],[cw/2,w/2,-cd/2,cd/2]])g.poly([S.p(x0+.4,fl+.08,z0+.4),S.p(x1-.4,fl+.08,z0+.4),S.p(x1-.4,fl+.08,z1-.4),S.p(x0+.4,fl+.08,z1-.4)],[0,1,0]);   // ash where the rooms were
     g.set(20,.35);for(let k=0;k<22;k++){const ring=R()<.5,x=ring?(R()<.5?-1:1)*(cw/2+R()*(w-cw)/2):(R()-.5)*w,z=ring?(R()-.5)*d:(R()<.5?-1:1)*(cd/2+R()*(d-cd)/2);box(g,S.sub(x,0,z,R()*Math.PI),0,fl+.05,0,1.5+R()*2.2,.16,.14,31);}   // fallen roof beams, burnt black
     g.set(22,.4);for(let k=0;k<9;k++){const x=(R()-.5)*w*.9,z=(R()-.5)*d*.9;if(Math.abs(x)<cw/2-1&&Math.abs(z)<cd/2-1)continue;box(g,S.sub(x,0,z,R()*TAU),0,fl,0,.8+R(),.35+R()*.5,.6+R()*.8,31);}   // rubble heaps
     g.set(6,.3);for(let i=0;i<=4;i++){const t=i/4-.5;for(const[px,pz]of[[t*(cw-3),cd/2-1.6],[t*(cw-3),-cd/2+1.6],[cw/2-1.6,t*(cd-3)],[-cw/2+1.6,t*(cd-3)]]){const h=R()<.4?3.8:.5+R()*2;lathe(g,S,px,fl,pz,[[.24,0],[.22,h],[0,h]],8);}}});   // the peristyle columns, some broken
   L('pisoSmoke',0,(g,G)=>{G.add(smokeSys([[-6,4,2],[5,5,-3],[0,3,6],[9,4,4]].map(([x,y,z])=>{const q=S.p(x,y,z);return q;}),{col:[.22,.2,.19],rise:38,size:9,rate:.03,alpha:.3,per:14,drift:[5,0,2]}));});   // still smoking in 58
   L('pisoFire',0,(g,G)=>{const fm=lampMat(1,.42,.1,30);for(const[x,z]of[[-w/2+2,-d/2+2],[w/2-2,-d/2+2],[w/2-2,d/2-2],[-w/2+2,d/2-2],[0,0]]){const c=new THREE.Mesh(new THREE.ConeGeometry(2.2,7+R()*3,7),fm),q=S.p(x,8,z);c.position.set(q[0],q[1],q[2]);G.add(c);}   // "火是从四个角同时烧起来的"
     emitBuilding(W,g,'domus',P.x,P.z,P.rot,w,d,2,P.y,P.y+2.5,R,{shops:0,brick:.2,burn:()=>1});G.add(smokeSys([[-8,9,0],[8,9,0],[0,10,6],[0,10,-6]].map(([x,y,z])=>S.p(x,y,z)),{col:[.3,.25,.22],rise:60,size:14,rate:.05,alpha:.45,per:18,emit:.6,drift:[6,0,3]}));});
   W.pois.push({n:'皮索家宅',l:'Domus Pisonum',x:P.x,z:P.z,y:P.y+14,s0:0,s1:5,d:900,info:'【史】卡尔普尔尼乌斯·皮索家是罗马的老贵族；历史上盖乌斯·皮索是65年反尼禄阴谋的领导者。'});
   W.pois.push({n:'皮索家宅废墟',l:'Domus Pisonum',x:P.x,z:P.z,y:P.y+12,s0:6,s1:99,d:900,info:'【书中】第9卷：“那天夜里，城南阿文提诺山上，皮索家的宅子着火了。”“墙塌了一半，屋顶没了，满地都是烧黑的木头。中庭的大理石地砖还在，被火烤得发黄，有几块裂了。”'});
   W.views.piso={n:'皮索家宅',pos:[P.x+70,P.y+48,P.z+55],tgt:[P.x,P.y+3,P.z]};}
  L('arcNero',14,(g)=>{const F=frame(-247,gy(-247,74),74,0);arcade(g,F,0,-1,0,13,12,1,5.5,2,{span:.38,attic:4});statue(g,F,0,15.2,0,3.4,true);for(const sd of[-1,1])statue(g,F,sd*4.6,15.2,0,2.4,true);});
  W.pois.push({n:'尼禄凯旋门',l:'Arcus Neronis',x:-247,z:74,y:gy(-247,74)+20,s0:6,s1:99,d:1100,info:'【史】58年元老院为科尔布罗在亚美尼亚的胜利给尼禄立的凯旋门，在卡比托利欧山上，顶上是驷马战车。'});
  L('campusRefuge',4,(g)=>{const F=frame(-1000,gy(-1000,-990),-990,.1);for(let r=0;r<8;r++)for(let c=0;c<12;c++){const x=-66+c*12,z=-42+r*12;rectWalls(g,F,x,z,8,5,-.5,2.6,0,{part:3,seed:.3+((r*7+c)%5)*.05,sty:0,fl:1,nSt:1,gH:2.6,sH:2.6,lit:.3});const t0=g.nv;roof(g,F,'gable',x,z,8.6,5.6,2.6,24*DEG,.2,.4,{part:3,seed:.35,nSt:1,gH:2.6,sH:2.6,floorY:0});retag(g,1,3,t0);}});
  W.pois.push({n:'大火难民棚屋',l:'Campus Martius, 64 AD',x:-1000,z:-990,y:gy(-1000,-990)+14,s0:7,s1:7,d:1600,info:'塔西佗记载：64年大火后，尼禄开放战神广场、阿格里帕的建筑和自己的花园，并搭起临时棚屋收容无家可归的人。'});
  L('pomeAlive',0,(g)=>{const p=W.pomePos;if(p)W.trees.push([p[0],p[1],p[2],'broad',.42,[.07,.1,.035]]);});
  L('pomeStump',0,(g)=>{const p=W.pomePos;if(p){g.set(3,.2);box(g,frame(p[0],p[1],p[2],0),0,0,0,.18,1.1,.18,31);}});
  L('pomeYoung',0,(g)=>{const p=W.pomePos;if(p)W.trees.push([p[0],p[1],p[2],'broad',.22,[.08,.12,.04]]);});
  const bankAt=(x0,z0)=>{const P=densify(TIBER,10);let bi=0,bd=1e9;for(let k=0;k<P.length-1;k++){const dd=Math.hypot(P[k][0]-x0,P[k][1]-z0);if(dd<bd){bd=dd;bi=k;}}const a=P[bi],b=P[bi+1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,tx=(b[0]-a[0])/l,tz=(b[1]-a[1])/l,nx=tz,nz=-tx,sd=Math.sign((x0-a[0])*nx+(z0-a[1])*nz)||1;return{a,tx,tz,nx:nx*sd,nz:nz*sd};};
  const hauler=(g,up)=>{const B=bankAt(ZF.ox,ZF.oz);for(let k=0;k<10;k++){const s2=-12+k*2.6,x=B.a[0]+B.tx*s2+B.nx*(RTW+6),z=B.a[1]+B.tz*s2+B.nz*(RTW+6),F=frame(x,gy(x,z),z,Math.atan2(-B.tz,B.tx));g.set(30,.3+k*.03);box(g,F,0,0,0,.22,up?1.6:1.2,.2,31);g.set(3,.4);box(g,F,up?0:.25,up?1.7:1.3,0,.14,.18,.14,31);}
    if(!up){const x0=B.a[0]-B.tx*14+B.nx*(RTW+6),z0=B.a[1]-B.tz*14+B.nz*(RTW+6),x1=B.a[0]-B.tx*40+B.nx*(RTW-18),z1=B.a[1]-B.tz*40+B.nz*(RTW-18),L3=Math.hypot(x1-x0,z1-z0);g.set(3,.5);box(g,frame((x0+x1)/2,RW+1.2,(z0+z1)/2,Math.atan2(-(z1-z0),x1-x0)),0,0,0,L3/2,.04,.04,31);g.set(3,.35);box(g,frame(x1,RW,z1,Math.atan2(-B.tz,B.tx)),-6,-.6,0,7,1.6,2.4,31);}};
  L('haulers',2,(g)=>hauler(g,false));L('haulersStop',2,(g)=>hauler(g,true));
  W.pois.push({n:'纤夫',l:'南岸堤上',x:ZF.ox,z:ZF.oz,y:gy(ZF.ox,ZF.oz)+10,s0:2,s1:3,d:800,sub:true,info:'南岸堤上，一队纤夫弯着腰拉船。'});
  L('vatAwning',0,(g)=>{const F=W.vatF;if(!F)return;const S=F.sub(150,0,56,0);g.set(3,.4);for(const[x,z]of[[-3,-2],[3,-2],[-3,2],[3,2]])box(g,S,x,0,z,.12,2.6,.12,31);g.set(8,.12);g.poly([S.p(-3.4,2.7,-2.4),S.p(3.4,2.7,-2.4),S.p(3.4,2.5,2.4),S.p(-3.4,2.5,2.4)],[0,1,0]);g.poly([S.p(3.4,2.7,-2.4),S.p(-3.4,2.7,-2.4),S.p(-3.4,2.5,2.4),S.p(3.4,2.5,2.4)],[0,-1,0]);});
  if(W.vatF){const q=W.vatF.p(150,0,56);W.pois.push({n:'终点旁的凉棚',l:'梵蒂冈跑马场',x:q[0],z:q[2],y:gy(q[0],q[2])+6,s0:8,s1:99,d:700,sub:true,info:'终点旁石阶上的凉棚。'});}
  L('zoneMid',12,(g)=>{g.set(31,.4);g.poly([ZF.p(-15,.21,-180),ZF.p(205,.21,-180),ZF.p(205,.21,-15),ZF.p(-15,.21,-15)],[0,1,0]);zFence(g,-205,-180,205,-15);g.set(3,.3);for(let k=0;k<14;k++){const S=ZF.sub(150+(k%7)*7,0,-60+Math.floor(k/7)*8,0);box(g,S,0,0,0,3.2,.9,1.4,31);}});
  L('zoneBig',14,(g)=>{g.set(31,.4);g.poly([ZF.p(-250,.22,-180),ZF.p(250,.22,-180),ZF.p(250,.22,215),ZF.p(-250,.22,215)],[0,1,0]);zFence(g,-250,-180,250,215);
    rectWalls(g,ZF,-120,120,70,26,-1,12,0,{part:9,seed:.5,sty:1,fl:8|2,nSt:2,gH:6,sH:6,lit:1});roof(g,ZF,'gableX',-120,120,71,27,12,22*DEG,.5,.4,{part:9,seed:.5,nSt:2,gH:6,sH:6,floorY:0});
    rectWalls(g,ZF,40,130,56,22,-1,10,0,{part:9,seed:.55,sty:1,fl:8|2,nSt:2,gH:5,sH:5,lit:1});roof(g,ZF,'gableX',40,130,57,23,10,22*DEG,.5,.45,{part:9,seed:.55,nSt:2,gH:5,sH:5,floorY:0});
    g.set(9,.45,0,1);lathe(g,ZF,85,-1,150,[[2.2,0],[1.8,34],[2.1,34.5],[2.1,35.5],[1.6,35.5]],12);g.set(14,.5);for(let k=0;k<4;k++)box(g,ZF,0,0,60+k*4,240,.25,.18,31);
    rectWalls(g,ZF,170,80,40,30,-1,8,0,{part:22,seed:.4,sty:0,fl:1,nSt:1,gH:8,sH:4,lit:0});roof(g,ZF,'gable',170,80,40,30,8,24*DEG,.6,.4,{part:22,seed:.4,nSt:1,gH:8,sH:4,floorY:0});});
  const farm=(g,x0,z0,x1,z1,nh)=>{for(let x=x0;x<x1;x+=24){{const q=Math.floor((x-x0)/24)%3;g.set(q===2?23:21,q===0?.32:q===1?.55:.12);}g.poly([ZF.p(x,.12,z0),ZF.p(Math.min(x1,x+23),.12,z0),ZF.p(Math.min(x1,x+23),.12,z1),ZF.p(x,.12,z1)],[0,1,0]);}
    for(let k=0;k<nh;k++){const x=lerp(x0+15,x1-15,(k+.5)/nh),z=lerp(z0,z1,.3+.4*((k*37)%10)/10),F=ZF.sub(x,0,z,k*.7);g.set(30,.3+k*.07);box(g,F,0,-.5,0,3.4,3.4,2.6,31);const t0=g.nv;roof(g,F,'gable',0,0,7.4,5.8,2.9,26*DEG,.3,.4,{part:30,seed:.4,nSt:1,gH:3,sH:3,floorY:0});retag(g,1,21,t0);}};
  L('zoneFarm1',0,(g)=>farm(g,-10,-175,200,-20,3));L('zoneFarm2',0,(g)=>farm(g,-245,30,245,210,6));
  for(const[a,b,t]of[[2,2,'第一批地：栅栏围起来的一小块，三座高炉和几排木棚。旁边还是农田。'],[3,5,'地往下游扩了一段：平炉、窑、玻璃、肥皂、铅室。'],[6,99,'【待写·第9–13卷】工业用地越来越大，吞掉了旁边的农田和几户人家。']])W.pois.push({n:'南岸工坊',l:'神机公社',x:ZF.ox,z:ZF.oz,y:gy(ZF.ox,ZF.oz)+30,s0:a,s1:b,d:2400,info:t});
  L('cathFrame',8,(g)=>{const len=84,nw=16;g.set(3,.38);for(let z=-len/2;z<=len/2+.01;z+=7){for(const sd of[1,-1]){box(g,CT,sd*(nw/2+8),-1,z,.35,17,.35,31);box(g,CT,sd*nw/2,-1,z,.4,34,.4,31);}
      for(const sd of[1,-1]){const a0=[sd*nw/2,33],a1=[0,33+nw*.6];for(const dz of[.25,-.25])g.poly([CT.p(a0[0],a0[1]-.5,z+dz),CT.p(a1[0],a1[1]-.5,z+dz),CT.p(a1[0],a1[1],z+dz),CT.p(a0[0],a0[1],z+dz)],CT.d(0,0,Math.sign(dz)));g.poly([CT.p(a0[0],a0[1],z-.25),CT.p(a1[0],a1[1],z-.25),CT.p(a1[0],a1[1],z+.25),CT.p(a0[0],a0[1],z+.25)],[0,1,0]);}}
    for(const sd of[1,-1])box(g,CT,sd*nw/2,33,0,.35,.4,len/2,31);scaffold(g,CT,0,len/2+6,nw+20,0,30,false);scaffold(g,CT,0,-len/2-6,nw+20,0,24,false);});
  L('cathPiazza',0,(g)=>{g.set(11,.35);g.poly([CT.p(-34,.2,46),CT.p(34,.2,46),CT.p(34,.2,96),CT.p(-34,.2,96)],[0,1,0]);for(let k=0;k<9;k++){const q=CT.p(-32+k*8,0,96);W.trees.push([q[0],gy(q[0],q[2]),q[2],'cyp',.8]);}g.set(6,.4);box(g,CT,0,0,72,1.2,1.4,1.2,31);});
  buildAntium(W,L);
  /* ================= 奥斯提亚（OSTIA）：台伯河口、克劳狄港、港北六座船坞。本地坐标 x 东、z 南，海在西边 ================= */
  const OX=-70000,OZ=-80000;W.OO=[OX,OZ];
  const oCoast=z=>15*Math.sin(z/300)+8*Math.sin(z/97);
  const oRIV=[[2800,120],[1900,60],[1400,140],[900,60],[450,90],[-80,40]],oCAN=[[540,-860],[640,60]];
  const oSeg=(x,z,P)=>{let b=1e9;for(let i=0;i<P.length-1;i++){const a=P[i],c=P[i+1],dx=c[0]-a[0],dz=c[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);b=Math.min(b,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return b;};
  const hO=(x,z)=>{const dc=x-oCoast(z);if(dc<0)return -2-Math.min(10,-dc*.05);
    const rv=oSeg(x,z,oRIV),cn=oSeg(x,z,oCAN),br=Math.hypot(x-300,(z+1150)/.85),inB=x>-40;
    if(rv<55||cn<20)return -3;if(br<400&&inB)return -4;
    let h=1.4+.6*Math.sin(x*.01)*Math.cos(z*.013)+Math.exp(-(((dc-70)/45)**2))*4.5+(z<-1640?Math.min(7,(-1640-z)*.045)*(1+.3*Math.sin(x*.03)):0);
    if(rv<75)h=Math.min(h,lerp(-3,1.2,(rv-55)/20));if(cn<30)h=Math.min(h,lerp(-3,1.2,(cn-20)/10));if(br<420&&inB)h=Math.min(h,lerp(-4,1.2,(br-400)/20));return h;};
  W.hO=hO;const oF=(x,z,rot,y)=>frame(OX+x,y===undefined?hO(x,z):y,OZ+z,rot||0);
  L('ostiaBase',0,(g,G)=>{
    const mk=(X0,X1,Z0,Z1,S,skip)=>{const nx=Math.round((X1-X0)/S)+1,nz=Math.round((Z1-Z0)/S)+1,ps=new Float32Array(nx*nz*3),cs=new Float32Array(nx*nz*3),id=[];
      for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=X0+i*S,z=Z0+j*S,k=(j*nx+i)*3,h=hO(x,z);ps[k]=OX+x;ps[k+1]=skip?h-.3:h;ps[k+2]=OZ+z;const n=.5+.5*Math.sin(x*.05+Math.sin(z*.04)*2)*Math.cos(z*.045),dc=x-oCoast(z);
        const c=h<-.4?[.36,.35,.29]:(dc<130||z<-1630)?[.8,.74,.58]:[.42+.14*n,.46+.08*n,.27+.06*n];cs[k]=c[0]*.45;cs[k+1]=c[1]*.45;cs[k+2]=c[2]*.45;}
      for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){if(skip){const xc=X0+(i+.5)*S,zc=Z0+(j+.5)*S;if(xc>-400&&xc<2800&&zc>-2600&&zc<1200)continue;}const a=j*nx+i;id.push(a,a+nx,a+1,a+1,a+nx,a+nx+1);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(ps,3));geo.setAttribute('color',new THREE.BufferAttribute(cs,3));geo.setIndex(id);geo.computeVertexNormals();G.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96})));};
    mk(-400,2800,-2600,1200,10,false);mk(-400,9000,-9000,6000,60,true);
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(46000,60000).rotateX(-Math.PI/2),MAT.antSea);sea.position.set(OX-20000,0,OZ);G.add(sea);
    /* 克劳狄港：两道弧形防波堤、灯塔岛 */
    const mole=(pts)=>{for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),F=frame(OX+(a[0]+b[0])/2,0,OZ+(a[1]+b[1])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));g.set(9,.5);box(g,F,0,-5,0,L2/2+.6,7.2,7,31);}};
    mole([[20,-1580],[-90,-1520],[-180,-1420],[-230,-1290]]);mole([[20,-760],[-90,-820],[-170,-920],[-220,-1030]]);
    {const F=oF(-250,-1155,0,0);g.set(6,.42);box(g,F,0,-5,0,18,7,18,31);g.set(2,.5);box(g,F,0,2,0,12,18,12,31);box(g,F,0,20,0,8.5,14,8.5,31);lathe(g,F,0,34,0,[[5,0],[5,9],[5.6,9.3],[0,9.3]],12);
      G.add(smokeSys([[OX-250,46,OZ-1155]],{col:[1,.55,.2],rise:30,size:4,rate:.05,alpha:.8,per:60,drift:[3,0,1],add:true,emit:12}));W.ostLight=[OX-250,0,OZ-1155];}
    /* 码头仓库：港东岸与河口南岸 */
    for(let k=0;k<6;k++){const z=-1400+k*92,F=oF(690,z,0,1.6);rectWalls(g,F,0,0,20,62,-1,8,0,{part:9,seed:.5+k*.03,sty:0,fl:1,nSt:2,gH:4.4,sH:3.6,lit:1});roof(g,F,'gable',0,0,20.8,62.8,8,22*DEG,.6,.4,{part:9,seed:.5,nSt:2,gH:4.4,sH:3.6,floorY:0});}
    for(let k=0;k<9;k++){const x=150+k*120,z=175+Math.sin(k)*8,F=oF(x,z,0,1.6);rectWalls(g,F,0,0,70,18,-1,8,0,{part:9,seed:.45+k*.02,sty:0,fl:1,nSt:2,gH:4.4,sH:3.6,lit:1});roof(g,F,'gableX',0,0,70.8,18.8,8,22*DEG,.6,.4,{part:9,seed:.45,nSt:2,gH:4.4,sH:3.6,floorY:0});}
    /* 奥斯提亚城：砖砌公寓楼网格、广场与卡皮托利姆神庙 */
    for(let i=0;i<26;i++)for(let j=0;j<16;j++){const x=170+i*44,z=230+j*44;if(x>620&&x<800&&z>440&&z<600)continue;if(oSeg(x,z,oRIV)<90)continue;const s=(i*31+j*17)%10;if(s===0)continue;
      const F=oF(x,z,0,1.6+Math.max(0,hO(x,z)-1.6)),n=2+(s%3),top=3.8+(n-1)*3.2;rectWalls(g,F,0,0,34,34,-1.5,top,0,{part:s%2?9:0,seed:s/10,sty:3,fl:2|16,nSt:n,gH:3.8,sH:3.2,lit:.8});roof(g,F,'hip',0,0,34.8,34.8,top,20*DEG,.6,(s*7%10)/10);}
    {const F=oF(710,520,0);g.set(11,.3);g.poly([F.p(-80,.15,-70),F.p(80,.15,-70),F.p(80,.15,70),F.p(-80,.15,70)],[0,1,0]);temple(W,g,{x:OX+710,y:F.oy,z:OZ+470,rot:Math.PI,W:16,L:28,podH:4,colH:10,nf:6,rows:2,seed:.4});
      openPortico(W,g,F,-75,-60,-75,62,0,6.5,6,3.6,[1,.97,.9]);openPortico(W,g,F,75,62,75,-60,0,6.5,6,3.6,[1,.97,.9]);}
    /* 船只与脚夫 */
    for(let k=0;k<8;k++){const x=200+(k%4)*110,z=-1250+Math.floor(k/4)*170,F=frame(OX+x,0,OZ+z,.3+k*.2);g.set(3,.35);box(g,F,0,-1.5,0,14,4,3.6,31);box(g,F,-8,2.5,0,4,2.2,3,31);g.set(3,.5);box(g,F,2,2.5,0,.2,18,.2,31);box(g,F,2,17,0,.15,.2,9,31);g.set(8,.12);g.poly([F.p(2.3,17,-8.5),F.p(2.3,17,8.5),F.p(2.3,7,8),F.p(2.3,7,-8)],F.d(1,0,0));g.poly([F.p(2.1,17,8.5),F.p(2.1,17,-8.5),F.p(2.1,7,-8),F.p(2.1,7,8)],F.d(-1,0,0));}
    for(let k=0;k<22;k++){const x=120+(k%11)*60+Math.sin(k*3)*12,z=-1050+Math.floor(k/11)*330+Math.cos(k*5)*30,F=frame(OX+x,0,OZ+z,k*.6);g.set(3,.3+(k%4)*.08);box(g,F,0,-.2,0,1.1,1.1,3.4,31);g.set(3,.5);box(g,F,0,.9,.3,.07,6,.07,31);}
    for(let k=0;k<20;k++){const x=300+k*9+Math.sin(k)*3,z=150+Math.cos(k*2)*6,F=oF(x,z,k);g.set(30,.3+(k%5)*.07);box(g,F,0,0,0,.22,1.5,.2,31);g.set(3,.4);box(g,F,0,1.5,0,.14,.18,.14,31);g.set(21,.6);box(g,F,0,1.55,-.15,.35,.35,.25,31);}
    /* 树 */
    for(let k=0;k<360;k++){const x=-20+((k*83)%2800),z=-2500+((k*59)%3600);const h=hO(x,z);if(h<1)continue;if(x>150&&x<1330&&z>200&&z<940)continue;if(oSeg(x,z,oRIV)<95)continue;if(Math.hypot(x-300,(z+1150)/.85)<440)continue;
      W.trees.push([OX+x,h,OZ+z,k%4===0?'cyp':k%3===0?'shrub':'pine',.7+(k%4)*.1]);}
  });
  L('ostiaYard',0,(g,G)=>{
    /* 港北，背靠沙丘，六座石砌斜坡船坞 */
    for(let k=0;k<6;k++){const x=120+k*70,F=oF(x,-1525,0,0);g.set(6,.4);g.poly([F.p(-11,-1.2,55),F.p(11,-1.2,55),F.p(11,2.6,-55),F.p(-11,2.6,-55)],[0,1,0]);for(const sd of[1,-1])box(g,F,sd*12,-1.5,0,1,4.8,56,31);
      g.set(3,.4);for(let z=-50;z<=40;z+=15)for(const sd of[1,-1])box(g,F,sd*12.6,2.6,z,.3,12,.3,31);
      for(const sd of[1,-1]){g.set(1,.4);g.poly([F.p(sd*14,14.6,-56),F.p(sd*14,14.6,44),F.p(0,19.5,44),F.p(0,19.5,-56)],[0,1,0]);}g.set(1,.36);g.poly([F.p(14,14.6,-56),F.p(-14,14.6,-56),F.p(0,19.5,-56)],F.d(0,0,-1));
      if(k===0){g.set(3,.3);box(g,F,0,2.8,-6,.75,1.2,33,31);for(let z=-36;z<=24;z+=3.2){const S=F.sub(0,0,z,0),a=[[-.5,3.9],[-4.6,5.2],[-6.6,9.6],[-6.9,13.2]];for(const sd of[1,-1])for(let q=0;q<a.length-1;q++){const p0=a[q],p1=a[q+1];for(const dz of[.18,-.18])g.poly([S.p(sd*-p0[0],p0[1],dz),S.p(sd*-p1[0],p1[1],dz),S.p(sd*-p1[0],p1[1]+.35,dz),S.p(sd*-p0[0],p0[1]+.35,dz)],S.d(0,0,Math.sign(dz)));}}W.ostKeel=[OX+x,3,OZ-1525];}}
    {const F=oF(330,-1610,0);rectWalls(g,F,0,0,60,14,-1,7,0,{part:9,seed:.6,sty:0,fl:1,nSt:2,gH:4,sH:3,lit:1});roof(g,F,'gableX',0,0,60.8,14.8,7,22*DEG,.6,.4,{part:9,seed:.6,nSt:2,gH:4,sH:3,floorY:0});}
  });
  L('ostiaGrain',0,(g)=>{const F=oF(420,215,0,1.6);g.set(9,.48);rectWalls(g,F,0,0,40,16,-1,7.4,0,{part:9,seed:.32,sty:3,fl:2|8,nSt:2,gH:4,sH:3.4,lit:1});roof(g,F,'gableX',0,0,40.8,16.8,7.4,22*DEG,.6,.3,{part:9,seed:.32,nSt:2,gH:4,sH:3.4,floorY:0});});
  L('ostiaRail',0,(g)=>{for(let x=1310;x<=2780;x+=3){const F=oF(x,320,0);g.set(3,.3);box(g,F,0,0,0,.18,.14,1.4,31);}for(const sd of[1,-1]){const F=oF(2045,320+sd*.75,0);g.set(14,.5);box(g,F,0,.14,0,735,.12,.06,31);}
    const F=oF(2350,290,0);rectWalls(g,F,0,0,16,10,-1,6.4,0,{part:0,seed:.5,sty:3,fl:2|16,nSt:2,gH:3.4,sH:3,lit:.8});roof(g,F,'gable',0,0,16.8,10.8,6.4,24*DEG,.4,.5);
    const S=oF(2350,262,0);rectWalls(g,S,0,0,32,8,-1,4,0,{part:3,seed:.4,sty:0,fl:1,nSt:1,gH:4,sH:3,lit:0});roof(g,S,'gableX',0,0,32.8,8.8,4,22*DEG,.6,.3,{part:3,seed:.4,nSt:1,gH:4,sH:3,floorY:0});
    g.set(3,.38);for(let k=0;k<=16;k++)box(g,oF(2310+k*5,240,0),0,0,0,.1,1.3,.1,31);});
  for(const[n,l,x,z,dy,s0,info]of[['奥斯提亚港','克劳狄港',300,-1150,10,0,'【史】克劳狄乌斯在台伯河口以北修的大港，两道弧形防波堤。'],['港口灯塔','【史】',-250,-1155,52,0,'【史】防波堤之间小岛上的灯塔，夜里点火。'],
    ['皇家船坞','六座斜坡坞',290,-1525,24,3,'港北，背靠沙丘，六个石砌斜坡大坞。'],['复仇女神号','一号坞',120,-1525,18,3,'一号坞里，四十多步长的老橡木龙骨，一排排木肋骨。'],
    ['粮署','旧仓库',420,215,14,6,'奥斯提亚一间旧仓库，十二张桌子，墙上一张罗马城图。'],['码头脚夫','',390,150,6,0,'码头上扛麻袋的脚夫。'],['铁轨与换马驿站','通往罗马',2350,300,10,6,'奥斯提亚通往罗马的铁轨，大道旁的换马驿站。'],
    ['奥斯提亚城','Ostia',720,560,30,0,'【史】台伯河口南岸的港城，砖砌公寓楼，广场上的卡皮托利姆神庙。'],['台伯河口','',0,40,8,0,'台伯河在这里入海。']])W.pois.push({n,l,x:OX+x,z:OZ+z,y:Math.max(0,hO(x,z))+dy,s0,s1:99,d:1200,pg:'ostia',info});
  Object.assign(W.views,{ostia:{n:'奥斯提亚全景',pg:'ostia',pos:[OX-950,420,OZ+650],tgt:[OX+380,0,OZ-380]},ostLight:{n:'港口灯塔',pg:'ostia',pos:[OX-470,95,OZ-990],tgt:[OX-250,30,OZ-1155]},
    ostYard:{n:'港北船坞',pg:'ostia',pos:[OX+300,120,OZ-1250],tgt:[OX+300,4,OZ-1535]},ostNemesis:{n:'复仇女神号',pg:'ostia',pos:[OX+40,40,OZ-1450],tgt:[OX+120,6,OZ-1530]},
    ostGrain:{n:'粮署与码头',pg:'ostia',pos:[OX+290,70,OZ+330],tgt:[OX+420,6,OZ+205]},ostRail:{n:'铁轨与驿站',pg:'ostia',pos:[OX+2160,80,OZ+460],tgt:[OX+2350,5,OZ+300]}});

  L('braziers',0,(g,G)=>{const FF2=frame(17,gy(17,-22),-22,-30*DEG),pts=[];{const q=FF2.p(118,0,30);pts.push(q);}pts.push([-275,(W.capY||gy(-275,10)),72]);pts.push([254,gy(254,339),352]);pts.push([1550,gy(1550,-1490),-1490]);pts.push([1490,gy(1490,-1557),-1557]);pts.push([95,(gy(95,382)),426]);
    for(const q of pts){const F=frame(q[0],q[1],q[2],0);g.set(13,.35);for(const a2 of[0,2.1,4.2])box(g,F,Math.cos(a2)*.45,0,Math.sin(a2)*.45,.05,1.1,.05,31);lathe(g,F,0,1.1,0,[[.55,0],[.7,.3],[0,.3]],10);G.add(smokeSys([[q[0],q[1]+1.6,q[2]]],{col:[1,.5,.15],rise:5,size:1.4,rate:.06,alpha:.9,per:16,drift:[.4,0,.3],add:true,emit:5}));}});
  {const routes=[[[-20,-60],[60,-20],[140,10],[240,40],[380,92],[520,180]],[[0,-80],[150,-200],[320,-330],[520,-420]],[[45,40],[-40,250],[-150,480]],[[-560,-1500],[-560,-900],[-560,-300]]],N=routes.length*9,pos=new Float32Array(N*3),gT=new THREE.BufferGeometry();gT.setAttribute('position',new THREE.BufferAttribute(pos,3));
   const mT=new THREE.PointsMaterial({color:0xffa04a,size:3.2,sizeAttenuation:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const PT=new THREE.Points(gT,mT);PT.frustumCulled=false;W.scene.add(PT);
   const lens=routes.map(r=>{let t=0;for(let i=0;i<r.length-1;i++)t+=Math.hypot(r[i+1][0]-r[i][0],r[i+1][1]-r[i][1]);return t;});
   const at=(r,d)=>{for(let i=0;i<r.length-1;i++){const L2=Math.hypot(r[i+1][0]-r[i][0],r[i+1][1]-r[i][1]);if(d<=L2){const t=d/L2;return[lerp(r[i][0],r[i+1][0],t),lerp(r[i][1],r[i+1][1],t)];}d-=L2;}return r[r.length-1];};
   W.anim.push(t=>{const nv=(typeof U!=='undefined'&&U.uNight)?U.uNight.value:0;mT.opacity=Math.min(1,nv*1.3);if(nv<.05)return;let k=0;routes.forEach((r,ri)=>{const d0=((t*1.3+ri*137)%lens[ri]);for(let j=0;j<9;j++){const p=at(r,(d0+j*2.6)%lens[ri]);pos[k*3]=p[0]+((j%2)?1.1:-1.1);pos[k*3+1]=gy(p[0],p[1])+2.4;pos[k*3+2]=p[1];k++;}});gT.attributes.position.needsUpdate=true;});}

  L('bronzeCol',0,(g)=>{const AF=W.AF;g.set(6,.4);box(g,AF,0,0,44,1.1,1.4,1.1,31);W.cols.cor.push([...AF.p(0,1.4,44),AF.rot,7,[.62,.42,.24]]);});
  L('villaGarden',0,(g)=>{const AF=W.AF,RV=RNG(91);g.set(27,.5);g.poly([AF.p(-1.6,.12,10),AF.p(1.6,.12,10),AF.p(1.6,.12,42),AF.p(-1.6,.12,42)],[0,1,0]);
    for(const sd of[1,-1])for(let z=11;z<41;z+=1.3){const h=.7+RV()*.8,w=.5+RV()*.5;g.set(23,.2+RV()*.25);box(g,AF,sd*(2.5+RV()*.6),0,z,w,h,.75,31);}
    for(let k=0;k<10;k++){const q=AF.p((RV()-.5)*40,0,8+RV()*30);W.trees.push([q[0],gy(q[0],q[2]),q[2],'shrub',.5+RV()*.4]);}});
  {const F=frame(-735,gy(-735,-1240),-1240,.08);
   L('campusFest',0,(g,G)=>{const stand=(cx,cz,len,rot)=>{const S=F.sub(cx,0,cz,rot);for(let t=0;t<6;t++){g.set(3,.36+t*.02);box(g,S,0,0,t*1.6,len/2,.9+t*.85,.8,31);}g.set(3,.28);for(let x=-len/2;x<=len/2+.01;x+=6)box(g,S,x,0,9.2,.15,6,.15,31);
       const RC=RNG(len|0);for(let t=0;t<6;t++)for(let x=-len/2+1;x<len/2-1;x+=1.15){if(RC()<.25)continue;g.set(8,RC());box(g,S,x,.9+t*.85,t*1.6+.1,.2,.55,.18,31);}};
     stand(0,-56,112,Math.PI);stand(84,0,82,Math.PI/2);stand(-84,0,82,-Math.PI/2);
     {const S=F.sub(0,0,-58,Math.PI);g.set(3,.3);for(const[sx,sz]of[[-6,0],[6,0],[-6,5],[6,5]])box(g,S,sx,4.5,sz,.15,4.2,.15,31);g.set(8,.62);g.poly([S.p(-6.5,8.8,-.5),S.p(6.5,8.8,-.5),S.p(6.5,8.3,5.6),S.p(-6.5,8.3,5.6)],[0,1,0]);}
     const P=F.sub(0,0,4,0);g.set(3,.35);box(g,P,0,0,0,4,3,4,31);for(const[sx,sz]of[[-5,-5],[5,-5],[-5,5],[5,5]])box(g,P,sx,0,sz,.18,12.5,.18,31);box(g,P,0,12.5,0,5.4,.3,.3,31);
     g.set(5,.3);lathe(g,P,0,3.2,0,[[.4,0],[2.8,.7],[4.8,2.9],[4.5,6.2],[3,8.4],[.6,9.2],[0,9.3]],14);g.set(18,.3);lathe(g,P,4.5,3,3,[[.9,0],[1.1,.8],[0,.8]],8);
     G.add(smokeSys([[F.ox,F.oy+5,F.oz+4]],{col:[.11,.1,.09],rise:42,size:7,rate:.06,alpha:.62,per:30,drift:[3,0,2]}));});
   W.pois.push({n:'阿波罗祭典的看台',l:'第3章',x:F.ox,z:F.oz-40,y:F.oy+14,s0:0,s1:0,ch0:3,ch1:3,d:2600,info:'第3章：阿波罗祭典那天，战神广场搭起木看台。场中央的木高台上挂着涂满暗黄蜂蜡的大皮囊，“一条死鲸鱼”。【史】战神广场没有固定的大看台，节庆和表演时常临时搭木看台。'});
   W.views.campusFest={n:'战神广场·阿波罗祭典',pos:[F.ox+120,F.oy+62,F.oz+120],tgt:[F.ox,F.oy+6,F.oz-6]};}

  for(const k in (W.preLayers||{}))W.layers[k]=W.preLayers[k];
  return W;}

/* ---------- other materials ---------- */
MAT.terrain=procMat({key:'terr',vHead:'attribute vec4 aZ;varying vec4 vZ;',vBody:'vZ=aZ;',fHead:'varying vec4 vZ;uniform sampler2D uSt,uStA;uniform vec4 uStX;uniform vec2 uStN;',env:.4,fSurf:`
 vec3 N=normalize(vWN);float sl=1.-clamp(N.y,0.,1.);vec2 p=vWP.xz;
 vec3 grass=mix(vec3(.07,.11,.035),vec3(.16,.19,.06),fbm2(p*.008));vec3 dry=vec3(.34,.29,.17);
 vec3 c=mix(grass,dry,.36+.36*fbm2(p*.0035+7.));
#define SDS(p,a,b) length((p)-(a)-((b)-(a))*clamp(dot((p)-(a),(b)-(a))/dot((b)-(a),(b)-(a)),0.,1.))
 vec3 htG=vec3(0.),fcG=vec3(0.);float hwG=0.,fmG=0.;float sS=uSeason;float sDry=sS<1.?mix(-.18,.32,sS):sS<2.?mix(.32,.12,sS-1.):sS<3.?mix(.12,-.05,sS-2.):mix(-.05,-.18,sS-3.);c=mix(c,sDry>0.?dry*1.05:vec3(.1,.17,.05),abs(sDry));
 float fBl=sS<1.?mix(.35,1.,min(1.,sS*2.)):sS<2.?mix(1.,.45,sS-1.):sS<3.?mix(.45,.06,sS-2.):mix(.06,.35,sS-3.);
 {vec3 ht=vec3(0.);float hwt=0.,dd;dd=SDS(p,vec2(0.,280.),vec2(230.,320.));float w1=1.-smoothstep(140.,190.,dd);ht+=vec3(.1,.17,.05)*w1;hwt+=w1;dd=SDS(p,vec2(-262.,40.),vec2(-205.,-225.));float w2=1.-smoothstep(90.,125.,dd);ht+=mix(vec3(.3,.26,.16),vec3(.4,.35,.1),step(.82,vn2(p*.3)))*w2;hwt+=w2;dd=SDS(p,vec2(-700.,900.),vec2(-300.,1150.));float w3=1.-smoothstep(180.,250.,dd);ht+=vec3(.07,.12,.04)*w3;hwt+=w3;dd=SDS(p,vec2(700.,700.),vec2(1500.,600.));float w4=1.-smoothstep(160.,220.,dd);ht+=vec3(.13,.14,.06)*w4;hwt+=w4;dd=SDS(p,vec2(480.,-40.),vec2(1300.,-300.));float w5=1.-smoothstep(170.,230.,dd);ht+=vec3(.12,.2,.06)*w5;hwt+=w5;dd=SDS(p,vec2(-60.,-560.),vec2(900.,-1520.));float w6=1.-smoothstep(170.,230.,dd);ht+=mix(vec3(.08,.14,.05),vec3(.17,.15,.22),step(.84,vn2(p*.3)))*w6;hwt+=w6;dd=SDS(p,vec2(500.,-760.),vec2(1350.,-1080.));float w7=1.-smoothstep(120.,170.,dd);ht+=vec3(.18,.22,.08)*w7;hwt+=w7;if(hwt>.01){ht/=hwt;float sd2=(sS>.5&&sS<2.)?.35:0.;htG=mix(ht,dry,sd2*(1.-w1)*(1.-w5));hwG=min(1.,hwt);}}{float hm=smoothstep(.72,.9,vn2(p*.5))*fBl;vec3 fc2=vec3(0.);float hw=0.;float hk=h12(floor(p/2.3));
  if(SDS(p,vec2(0.,280.),vec2(230.,320.))<190.){fc2=hk<.5?vec3(.86,.56,.62):vec3(.52,.36,.66);hw=1.;}
  else if(SDS(p,vec2(-262.,40.),vec2(-205.,-225.))<125.){fc2=vec3(.88,.76,.16);hw=1.;}
  else if(SDS(p,vec2(-700.,900.),vec2(-300.,1150.))<250.){fc2=hk<.45?vec3(.92,.45,.6):hk<.75?vec3(.94,.92,.9):vec3(.8,.18,.12);hw=1.;}
  else if(SDS(p,vec2(700.,700.),vec2(1500.,600.))<220.){fc2=hk<.6?vec3(.92,.92,.88):vec3(.46,.36,.72);hw=.8;}
  else if(SDS(p,vec2(480.,-40.),vec2(1300.,-300.))<230.){fc2=hk<.5?vec3(.8,.28,.34):vec3(.95,.9,.55);hw=.9;}
  else if(SDS(p,vec2(-60.,-560.),vec2(900.,-1520.))<230.){fc2=hk<.6?vec3(.94,.94,.9):vec3(.56,.5,.76);hw=.9;}
  else if(SDS(p,vec2(500.,-760.),vec2(1350.,-1080.))<170.){fc2=hk<.5?vec3(.92,.56,.15):vec3(.46,.36,.72);hw=.8;}
  fcG=fc2;fmG=hm*hw*.32;}

 c=mix(c,mix(vec3(.34,.29,.19),vec3(.28,.25,.17),.35+.4*fbm2(p*.02))*(.8+.3*fbm2(p*.05))*(.86+.3*fbm2(p*.45)),vZ.x*.8);   // town ground: open earth between the streets
 c=mix(c,vec3(.08,.14,.04)*(.75+.5*fbm2(p*.03)),vZ.y);c=mix(c,htG*(.85+.3*fbm2(p*.02)),hwG*.5);c=mix(c,fcG,fmG);{float frT=smoothstep(2.35,3.,sS)*(1.-smoothstep(3.,3.6,sS));c=mix(c,vec3(.82,.84,.87),frT*.42*smoothstep(.75,1.,N.y));}
 vec2 qq=p/165.+vec2(fbm2(p*.003),fbm2(p*.003+5.))*.9;vec2 cl=floor(qq),fq=fract(qq);float chs=h12(cl);float ang=chs*6.2832;vec2 dr=vec2(cos(ang),sin(ang));
 float rw=dot(p,dr)/3.3;float aaF=fwidth(rw);float vine=smoothstep(.24+aaF,.24-aaF,abs(fract(rw)-.5));vec3 soil=vec3(.4,.32,.2)*(.85+.2*fbm2(p*.05)),vc=vec3(.19,.2,.1)*(.8+.3*fbm2(p*.2));
 vec3 fc=chs<.42?mix(soil,vc,mix(vine,.45,smoothstep(.15,.5,aaF))):chs<.62?mix(vec3(.5,.43,.22),vec3(.42,.39,.18),fbm2(p*.03)):chs<.82?mix(vec3(.19,.23,.1),vec3(.27,.27,.12),fbm2(p*.04)):mix(vec3(.3,.29,.14),vec3(.44,.38,.22),fbm2(p*.02));
 float edge=1.-smoothstep(0.,.018+fwidth(qq.x)*1.5,min(min(fq.x,1.-fq.x),min(fq.y,1.-fq.y)));fc=mix(fc,vec3(.07,.1,.04),edge*.85);c=mix(c,fc,vZ.z*.92);
 c=mix(c,vec3(.7,.62,.45)*(.9+.15*vn2(p*.5)),vZ.w);
 float pal=1.-smoothstep(230.,380.,length(p-vec2(100.,300.)));   // the Palatine: pale limestone with moss on the ledges (rock_and_base brief)
 c=mix(c,vec3(.085,.11,.05)*(.8+.4*fbm2(p*.03)),smoothstep(.22,.45,sl)*(1.-vZ.w)*.8);
 c=mix(c,vec3(.33,.35,.11)*(.8+.4*fbm2(p*.06)),pal*smoothstep(.16,.32,sl)*(1.-smoothstep(.46,.66,sl))*.6);
 vec3 rock=mix(vec3(.31,.28,.19),vec3(.2,.18,.16),vZ.w)*(.75+.4*fbm2(vec2(p.x+p.y,vWP.y*5.)*.06));
 rock=mix(rock,vec3(.58,.52,.41)*(.8+.4*fbm2(vec2(p.x+p.y,vWP.y*4.)*.07)),pal*.85);
 c=mix(c,rock,mix(smoothstep(.6,.9,sl),smoothstep(.4,.7,sl),pal)*.85);
 // streets (streets.js): coverage / grade / wall distance from the street raster, direction from the coarse texture
 float stR=.95;
 if(uStX.z>0.){vec2 q0=(vWP.xz-uStX.xy)/uStX.zw;
  if(q0.x>0.&&q0.y>0.&&q0.x<1.&&q0.y<1.){
   vec2 wob=(vec2(fbm2(vWP.xz*.31),fbm2(vWP.xz*.31+7.3))-.5)*1.7;vec2 q=q0+wob/uStX.zw;vec4 t=texture2D(uSt,q);
   float mini=smoothstep(.8,2.6,fwidth(q.x)*uStN.x);float cov=mix(smoothstep(.26,.5,t.r),t.r,mini);
   if(cov>.004){
    float gc=t.g*255.;float wM=clamp((gc-128.)/64.,0.,1.),wD=clamp((128.-gc)/64.,0.,1.),wS=1.-max(wM,wD);float dw=t.b*8.;
    vec4 ta=texture2D(uStA,q0);vec2 av=ta.rg*2.-1.;float th=.5*atan(av.y,av.x);vec2 tv=vec2(cos(th),sin(th)),nv=vec2(-tv.y,tv.x);float across=dot(vWP.xz,nv),along=dot(vWP.xz,tv);
    float trk=smoothstep(.22,.06,abs(fract((across+vn2(vec2(along*.05,3.))*1.4)/1.45)-.5)*1.45)*smoothstep(.3,.7,vn2(vec2(along*.1,across*.3)))*clamp(ta.b*4.,0.,1.);
    vec2 rp=vec2(vWP.x*.866+vWP.z*.5,-vWP.x*.5+vWP.z*.866);
    vec3 cM=vec3(.66,.62,.54),cS=vec3(.17,.15,.125),cD=vec3(.36,.26,.15);
    if(wM>.01){float sl=2.6,sw=1.3,row=floor(rp.y/sw),u=rp.x+mod(row,2.)*sl*.5,id=floor(u/sl),jx=abs(fract(u/sl+.5)-.5)*sl,jy=abs(fract(rp.y/sw+.5)-.5)*sw,aa=fwidth(rp.x)*1.5+.01,jn=1.-smoothstep(.02,.02+aa,min(jx,jy)),hh=h12(vec2(id,row)+3.1);
     cM=vec3(.66,.62,.54)*(.88+.18*hh)*(.94+.1*vn2(rp*.6));cM=mix(cM,cM*vec3(.84,.8,.73),step(.84,hh));cM*=1.-.34*jn*(1.-mini);cM*=mix(.72,1.,smoothstep(0.,1.1,dw));}
    if(wS>.01){vec2 p=vWP.xz*1.15;vec2 ip=floor(p),fp=fract(p);float m1=8.,m2=8.;vec2 id=ip;
     for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j);vec2 o=vec2(h12(ip+g),h12(ip+g+17.3));vec2 r=g+o-fp;float d=dot(r,r);if(d<m1){m2=m1;m1=d;id=ip+g;}else if(d<m2)m2=d;}
     float e=sqrt(m2)-sqrt(m1),far=smoothstep(.2,.7,fwidth(p.x)*2.);cS=vec3(.27,.225,.17)*(.7+.5*h12(id));cS*=mix(.45,1.,smoothstep(0.,.08,e));cS=mix(cS,vec3(.27,.225,.17)*.95,far);
     cS*=(.82+.4*fbm2(vWP.xz*.17))*(1.-.18*smoothstep(.62,.78,fbm2(vWP.xz*.06+11.)));   // large-scale tone: worn, repaired and dirty stretches
     cS*=1.+.3*smoothstep(1.4,3.4,dw);cS*=mix(.6,1.,smoothstep(0.,1.4,dw));}
    if(wD>.01){cD=mix(vec3(.38,.27,.155),vec3(.29,.2,.115),fbm2(vWP.xz*.9));cD*=.85+.3*vn2(vWP.xz*5.);cD=mix(cD,vec3(.55,.47,.33),step(.93,vn2(vWP.xz*9.))*.5);
     cD=mix(cD,cD*.55,smoothstep(.62,.8,fbm2(vWP.xz*.12+4.)));cD*=1.-.28*trk;cD*=mix(.68,1.,smoothstep(0.,1.2,dw));}
    vec3 stC=cM*wM+cS*wS+cD*wD;stR=.52*wM+.72*wS+.95*wD;
    float ed=smoothstep(.0,.3,cov)*(1.-smoothstep(.55,.95,cov));stC=mix(stC,cD*.92,ed*.55*(1.-wD));
    c=mix(c,stC,cov);}}}
 S.alb=c;S.rough=stR;`});
MAT.terrain.polygonOffset=true;MAT.terrain.polygonOffsetFactor=1;MAT.terrain.polygonOffsetUnits=2;
MAT.road=MAT.city;
function waterMat(key,col,amp,foamTex){return procMat({key,params:{transparent:false},env:1.1,uniforms:foamTex?{uHT:{value:foamTex.tex},uHX:{value:foamTex.ext}}:{},
 fHead:foamTex?'uniform sampler2D uHT;uniform vec4 uHX;':'',fSurf:`
 vec2 p=vWP.xz;float t=uTime;float e=1.2;
 float h0=fbm2(p*.025+vec2(t*.02,t*.013))+.5*vn2(p*.11-t*.06);
 float hx=fbm2((p+vec2(e,0.))*.025+vec2(t*.02,t*.013))+.5*vn2((p+vec2(e,0.))*.11-t*.06);
 float hz=fbm2((p+vec2(0.,e))*.025+vec2(t*.02,t*.013))+.5*vn2((p+vec2(0.,e))*.11-t*.06);
 float A=${amp.toFixed(2)};S.nw=normalize(vec3(-(hx-h0)/e*A,1.,-(hz-h0)/e*A));S.useN=1.;
 S.alb=vec3(${col.join(',')});S.rough=.07;
 ${foamTex?`vec2 tc=(p-uHX.xy)/uHX.zw;float gh=texture2D(uHT,tc).r*120.-40.;float dep=vWP.y-gh;
 float fo=(1.-smoothstep(0.,6.,dep))*smoothstep(.35,.7,vn2(p*.35+vec2(t*.4,-t*.3))+.4*(1.-smoothstep(0.,2.5,dep)));
 S.alb=mix(S.alb,vec3(.85,.88,.9),fo);S.rough=mix(S.rough,.6,fo);`:''}`});}
MAT.tiber=waterMat('tiber',[.07,.075,.045],.55);MAT.pool=waterMat('pool',[.03,.17,.19],.18);
MAT.foliage=procMat({key:'fol',vHead:'attribute vec3 aF;varying vec3 vF;',fHead:'varying vec3 vF;',env:.5,
 vBody:`vF=aF;
#ifdef USE_INSTANCING
 float ph=instanceMatrix[3].x*.07+instanceMatrix[3].z*.05;
#else
 float ph=0.;
#endif
 float sw=sin(uTime*1.3+ph)*.18*aF.x*aF.y*aF.y;transformed.x+=sw;transformed.z+=sw*.6;`,
 fSurf:`vec3 N=normalize(vWN);
 if(vF.x<.5){S.alb=vec3(.42,.36,.3)*(.8+.4*vn2(vWP.xy*2.));S.rough=.9;}
 else{float n=fbm3(vWP*.7);float n2=vn3(vWP*2.6);
  float sunF=max(dot(N,uSunDir),0.);
  S.alb=vec3(1.)*(.6+.55*n)*mix(.5,1.05,vF.z);S.alb+=vec3(.25,.3,.1)*step(.68,n2)*sunF*.6;
  S.rough=.85;S.ao=mix(.5,1.,vF.z)*mix(.75,1.,vF.y);
  S.emit=vec3(.04,.07,.015)*max(dot(-N,uSunDir),0.)*(1.-uNight);}`});
MAT.foliageD=procMat({key:'folD',vHead:'attribute vec3 aF;varying vec3 vF;',fHead:'varying vec3 vF;',env:.5,
 vBody:`vF=aF;
#ifdef USE_INSTANCING
 float ph=instanceMatrix[3].x*.07+instanceMatrix[3].z*.05;
#else
 float ph=0.;
#endif
 float sw=sin(uTime*1.3+ph)*.18*aF.x*aF.y*aF.y;transformed.x+=sw;transformed.z+=sw*.6;`,
 fSurf:`vec3 N=normalize(vWN);
 if(vF.x<.5){S.alb=vec3(.42,.36,.3)*(.8+.4*vn2(vWP.xy*2.));S.rough=.9;}
 else{float n=fbm3(vWP*.7);float n2=vn3(vWP*2.6);
  float sunF=max(dot(N,uSunDir),0.);
  S.alb=vec3(1.)*(.6+.55*n)*mix(.5,1.05,vF.z);S.alb+=vec3(.25,.3,.1)*step(.68,n2)*sunF*.6;
  S.rough=.85;S.ao=mix(.5,1.,vF.z)*mix(.75,1.,vF.y);
  S.emit=vec3(.04,.07,.015)*max(dot(-N,uSunDir),0.)*(1.-uNight);}
 if(vF.x>.5){float s5=uSeason;vec3 tS=vec3(.82,1.12,.6),tU=vec3(1.),tA=vec3(1.5,.82,.3),tW=vec3(.66,.6,.5);vec3 tn=s5<1.?mix(tS,tU,s5):s5<2.?mix(tU,tA,s5-1.):s5<3.?mix(tA,tW,s5-2.):mix(tW,tS,s5-3.);S.alb*=tn;}
`});
MAT.glaze=procMat({key:'glaze',physical:true,env:1.35,params:{roughness:.16,clearcoat:1,clearcoatRoughness:.04},
 fSurf:`S.alb=vec3(1.)*mix(1.,.5,uRust);S.rough=mix(.14,.55,uRust);`});
MAT.glazeRoof=procMat({key:'glazeroof',physical:true,env:1.2,params:{clearcoat:1,clearcoatRoughness:.08},
 vHead:'attribute vec4 aA;attribute vec4 aB;attribute vec4 aC;varying vec4 vA;varying vec4 vB;varying vec4 vC;',vBody:'vA=aA;vB=aB;vC=aC;',fHead:CITY_F,
 fSurf:`vec3 N=normalize(vWN);float aa=max(fwidth(vA.x),fwidth(vA.y))*1.2+.002;roofS(S,N,0.,aa);float k=vB.x;
 vec3 gc=k<.33?vec3(.07,.32,.16):k<.66?vec3(.75,.55,.08):vec3(.08,.22,.42);S.alb=gc*(S.alb/max(roofCol(vB.x).r,.1))*1.6;S.rough=mix(.22,.6,uRust);S.alb*=1.-.45*uRust;`});
MAT.glass=procMat({key:'glass',env:1.6,params:{transparent:true,opacity:.38,depthWrite:false,roughness:.05,color:0xcfe3e6},
 fSurf:`S.alb=vec3(.9,.97,1.);S.rough=.04;S.emit=vec3(1.,.62,.3)*uNight*.9;`});
MAT.people=procMat({key:'ppl',env:.4,fSurf:`S.alb=vec3(1.);S.rough=.9;`});
MAT.lamp=new THREE.MeshBasicMaterial({color:new THREE.Color(1,.6,.28)});
MAT.dark=new THREE.MeshBasicMaterial({color:0x000000});

/* ---------- columns (instanced) ---------- */
function colGeo(type){ // height 1, base at 0
  const g=new GB(4096),F=frame(0,0,0);const R=type==='cor'?.05:type==='ion'?.055:type==='dor'?.068:.042;
  g.set(6,.5);const capH=type==='cor'?.11:type==='ion'?.065:.05,baseH=type==='dor'?0:.05,sh=1-capH-baseH;
  if(baseH){box(g,F,0,0,0,R*1.45,baseH*.35,R*1.45,31);lathe(g,F,0,baseH*.35,0,[[R*1.35,0],[R*1.35,baseH*.25],[R*1.15,baseH*.4],[R*1.25,baseH*.5],[R*1.05,baseH*.65]],16);}
  const fl=type==='simple'?0:20,seg=type==='simple'?10:40,rings=type==='simple'?2:6;
  for(let j=0;j<rings;j++){const t0=j/rings,t1=(j+1)/rings,r0=R*(1-.14*Math.pow(t0,1.3)),r1=R*(1-.14*Math.pow(t1,1.3)),y0=baseH*.65+sh*t0,y1=baseH*.65+sh*t1;
    for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU;const f0=fl?1-.07*Math.max(0,Math.cos(a0*fl)):1,f1=fl?1-.07*Math.max(0,Math.cos(a1*fl)):1;
      g.poly([F.p(Math.cos(a0)*r0*f0,y0,Math.sin(a0)*r0*f0),F.p(Math.cos(a1)*r0*f1,y0,Math.sin(a1)*r0*f1),F.p(Math.cos(a1)*r1*f1,y1,Math.sin(a1)*r1*f1),F.p(Math.cos(a0)*r1*f0,y1,Math.sin(a0)*r1*f0)],F.d(Math.cos((a0+a1)/2),0,Math.sin((a0+a1)/2)));}}
  const yc=1-capH,rt=R*.86;
  if(type==='cor'){lathe(g,F,0,yc,0,[[rt,0],[rt*1.12,capH*.25],[rt*1.28,capH*.55],[rt*1.5,capH*.8],[rt*1.55,capH*.86]],16);
    for(let k=0;k<8;k++){const a=k/8*TAU;const L=frame(Math.cos(a)*rt*1.18,yc+capH*.08,Math.sin(a)*rt*1.18,-a);box(g,L,0,0,0,rt*.32,capH*.42,rt*.12,31);}
    box(g,F,0,1-capH*.14,0,R*1.62,capH*.14,R*1.62,31);}
  else if(type==='ion'){lathe(g,F,0,yc,0,[[rt,0],[rt*1.25,capH*.45],[rt*1.1,capH*.7]],16);box(g,F,0,yc+capH*.35,0,R*1.55,capH*.35,R*1.1,31);
    for(const sx of[-1,1])lathe(frame(0,0,0).p?g:g,frame(sx*R*1.45,yc+capH*.5,0,Math.PI/2),0,-R*.9,0,[[0,0],[R*.38,0],[R*.38,R*1.8],[0,R*1.8]],10);
    box(g,F,0,1-capH*.25,0,R*1.45,capH*.25,R*1.45,31);}
  else{lathe(g,F,0,yc,0,[[rt,0],[rt*1.35,capH*.55],[rt*1.4,capH*.6]],16);box(g,F,0,1-capH*.4,0,R*1.45,capH*.4,R*1.45,31);}
  return g.geometry();
}
const COLGEO={};['cor','ion','dor','simple'].forEach(k=>COLGEO[k]=colGeo(k));
function flushColumns(W){for(const k in W.cols){const L=W.cols[k];if(!L.length)continue;
  const m=new THREE.InstancedMesh(COLGEO[k],MAT.city,L.length);const M=new THREE.Matrix4(),q=new THREE.Quaternion(),S=new THREE.Vector3(),Pp=new THREE.Vector3(),col=new THREE.Color();
  L.forEach((c,i)=>{q.setFromAxisAngle(new THREE.Vector3(0,1,0),c[3]||0);S.set(c[4],c[4],c[4]);Pp.set(c[0],c[1],c[2]);M.compose(Pp,q,S);m.setMatrixAt(i,M);
    col.setRGB(...(c[5]||[1,1,1]));m.setColorAt(i,col);});
  m.castShadow=true;m.receiveShadow=true;(W.colGroup||W.scene).add(m);W.cols[k]=[];}}

/* ---------- trees (instanced) ---------- */
function treeGeo(type){const P=[],N=[],F=[],I=[];let base=0;
  const add=(geo,fol,cy,rad)=>{const g=geo.index?geo.toNonIndexed():geo;g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal;
    for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));N.push(n.getX(i),n.getY(i),n.getZ(i));
      const r=rad?Math.min(1,Math.hypot(p.getX(i),p.getZ(i))/rad):1;F.push(fol,clamp(p.getY(i)/cy,0,1),fol?.35+.65*r:0);I.push(base+i);}base+=p.count;};
  const rnd=RNG(type==='cyp'?3:type==='pine'?7:11);
  const bump=(geo,amt,sc)=>{const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const k=1+amt*(vnoise(x*sc+9,y*sc+z*sc*.7)-.5)*2;p.setXYZ(i,x*k,y,z*k);}return geo;};
  if(type==='cyp'){add(new THREE.CylinderGeometry(.18,.28,2,5),0,10,0);
    const prof=[];for(let i=0;i<=9;i++){const t=i/9;prof.push(new THREE.Vector2(t>=1?0:1.15*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05+.02)),.75)*(1-t*.55),1+t*10.5));}
    add(bump(new THREE.LatheGeometry(prof,9),.28,1.4),1,11.5,1.2);}
  else if(type==='pine'){const tr=new THREE.CylinderGeometry(.22,.38,12,6);tr.translate(0,6,0);add(tr,0,16,0);
    for(let k=0;k<5;k++){const s=new THREE.IcosahedronGeometry(1,1);s.scale(3.6+rnd()*1.6,1.3+rnd()*.5,3.4+rnd()*1.6);s.translate((rnd()-.5)*4.5,12.6+rnd()*1.6,(rnd()-.5)*4.5);add(bump(s,.2,.8),1,15,7);}}
  else{const tr=new THREE.CylinderGeometry(.2,.32,3.2,5);tr.translate(0,1.6,0);add(tr,0,9,0);
    for(let k=0;k<4;k++){const s=new THREE.IcosahedronGeometry(1,1);s.scale(2.4+rnd(),2.2+rnd(),2.4+rnd());s.translate((rnd()-.5)*2.6,4.6+rnd()*2.2,(rnd()-.5)*2.6);add(bump(s,.25,.9),1,8,4);}}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  G.setAttribute('aF',new THREE.Float32BufferAttribute(F,3));G.computeBoundingSphere();return G;}
const TREEGEO={cyp:treeGeo('cyp'),pine:treeGeo('pine'),broad:treeGeo('broad')};
const TREECOL={cyp:[.035,.06,.028],pine:[.05,.085,.03],broad:[.07,.1,.035],olive:[.08,.088,.058]};TREEGEO.olive=TREEGEO.broad;TREEGEO.shrub=(()=>{const g=new THREE.IcosahedronGeometry(1,0).toNonIndexed();g.scale(1.25,.8,1.25);g.translate(0,.62,0);g.computeVertexNormals();const p=g.attributes.position,a=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){a[i*3]=1;a[i*3+1]=Math.min(1,p.getY(i)/1.4);a[i*3+2]=.85;}g.setAttribute('aF',new THREE.BufferAttribute(a,3));return g;})();TREEGEO.flower=TREEGEO.shrub;TREECOL.shrub=[.055,.085,.03];TREECOL.flower=[.3,.1,.16];
function flushTrees(W,list,parent){if(W.trees.length>60000*Q.trees){const k=60000*Q.trees/W.trees.length;W.trees=W.trees.filter(()=>Math.random()<k);}W.treeCount=(W.treeCount||0)+W.trees.length;const by={cyp:[],pine:[],broad:[],olive:[],broadD:[],shrub:[],flower:[]};list.forEach(t=>by[t[3]]&&by[t[3]].push(t));const out=[];
  for(const k in by){const L=by[k];if(!L.length)continue;const m=new THREE.InstancedMesh(TREEGEO[k==='broadD'?'broad':k],k==='broadD'&&MAT.foliageD?MAT.foliageD:MAT.foliage,L.length);if(k==='flower')m.userData.flower=true;
    const M=new THREE.Matrix4(),q=new THREE.Quaternion(),S=new THREE.Vector3(),Pp=new THREE.Vector3(),c=new THREE.Color();
    L.forEach((t,i)=>{const s=t[4]||1;q.setFromAxisAngle(new THREE.Vector3(0,1,0),hash2(t[0]|0,t[2]|0)*TAU);S.set(s*(.85+.3*hash2(i,7)),s,s*(.85+.3*hash2(i,9)));Pp.set(t[0],t[1]-.3,t[2]);
      M.compose(Pp,q,S);m.setMatrixAt(i,M);const v=.75+.5*hash2(i,3),b=TREECOL[k==='broadD'?'broad':k];c.setRGB(b[0]*v,b[1]*v*(.9+.2*hash2(i,5)),b[2]*v);if(t[5])c.setRGB(t[5][0]*v,t[5][1]*v,t[5][2]*v);m.setColorAt(i,c);});
    m.castShadow=true;m.receiveShadow=true;(parent||W.scene).add(m);out.push(m);}return out;}

/* ---------- people ---------- */
const PPLGEO=(()=>{const a=new THREE.CylinderGeometry(.17,.3,1.35,6);a.translate(0,.68,0);const b=new THREE.SphereGeometry(.17,6,5);b.translate(0,1.5,0);
  const P=[...a.toNonIndexed().attributes.position.array,...b.toNonIndexed().attributes.position.array];const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.computeVertexNormals();return G;})();
const PPLCOL=[[.75,.72,.65],[.6,.25,.14],[.2,.3,.5],[.55,.42,.2],[.3,.4,.25],[.45,.3,.4],[.7,.6,.45],[.35,.2,.15]];
function flushPeople(W,list,parent){if(W.people.length>9000){const k=9000/W.people.length;W.people=W.people.filter(()=>Math.random()<k);}if(!list.length)return null;const m=new THREE.InstancedMesh(PPLGEO,MAT.people,list.length);const M=new THREE.Matrix4(),c=new THREE.Color();
  list.forEach((p,i)=>{M.makeTranslation(p[0],p[1],p[2]);m.setMatrixAt(i,M);const k=PPLCOL[Math.floor(hash2(i,p[0]|0)*PPLCOL.length)];c.setRGB(k[0],k[1],k[2]);m.setColorAt(i,c);});
  m.castShadow=false;m.receiveShadow=true;(parent||W.scene).add(m);return m;}

/* ---------- monument generators (into GB g) ---------- */
function statue(g,F,x,y,z,h,gilt=false,spear=false){const part=gilt?28:6;g.set(part,.4);const r=h*.13;
  lathe(g,F,x,y,z,[[r*1.25,0],[r*1.1,h*.25],[r*.9,h*.55],[r*1.05,h*.7],[r*.75,h*.8],[0,h*.8]],7);
  lathe(g,F,x,y+h*.8,z,[[0,0],[r*.55,h*.03],[r*.62,h*.1],[r*.45,h*.18],[0,h*.2]],6);
  box(g,F,x+r*.95,y+h*.52,z,r*.22,h*.28,r*.22,31);if(spear){g.set(13,.3);box(g,F,x-r*1.1,y+h*.3,z,.05*h/4,h*.95,.05*h/4,31);}}
function pedestalStatue(g,F,x,z,y,h,opts={}){g.set(6,.6);box(g,F,x,y,z,h*.22,h*.22,h*.22,31);g.set(2,.6);box(g,F,x,y+h*.22,z,h*.26,h*.06,h*.26,31);statue(g,F,x,y+h*.28,z,h*.72,opts.gilt,opts.spear);}
function honorCol(W,g,F,x,z,y,h){W.cols.cor.push([...F.p(x,y+1.2,z),F.rot,h,[.95,.92,.86]]);g.set(6,.5);box(g,F,x,y,z,h*.07,1.2,h*.07,31);statue(g,F,x,y+1.2+h,z,2.4,true);}
// temple: front faces +z of the frame
function temple(W,g,o){const F=frame(o.x,o.y,o.z,o.rot||0);const W2=o.W/2,L2=o.L/2,ph=o.podH||3,cH=o.colH||12,ord=o.order||'cor',nf=o.nf||6,rows=o.rows??2;
  const cD=cH/(ord==='cor'?10:ord==='ion'?9:7),m=cD*.9,ic=(o.W-2*m)/(nf-1);
  g.set(6,o.seed||.3);let fd=6;if(W.gy){for(const[sx,sz]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const q=F.p(sx*W2,0,sz*L2);fd=Math.max(fd,F.oy-W.gy(q[0],q[2])+1.5);}}box(g,F,0,-fd,0,W2,fd+ph,L2,31);
  g.set(2,.4);box(g,F,0,-.5,0,W2+.3,.9,L2+.3,15);box(g,F,0,ph-.45,0,W2+.25,.45,L2+.25,31);
  if(o.stairs!==false){const n=Math.max(4,Math.round(ph/.3)),sd=.4,sw=W2-(o.stairInset||0);g.set(2,.45);
    for(let i=0;i<n;i++){const h=ph*(n-i)/n;box(g,F,0,0,L2+(i+1)*sd/2,sw,h,(i+1)*sd/2,1|2|8|16);}if(W.gy){const gq=F.p(0,0,L2+n*sd+.6),gf=W.gy(gq[0],gq[2])-F.oy;if(gf<-.3){g.set(2,.42);box(g,F,0,gf-1.2,L2+n*sd/2,sw+.6,-gf+1.2,n*sd/2+.3,31);}}}
  const y0=ph,zf=L2-cD*.8,cols=[];
  for(let r=0;r<rows;r++)for(let c=0;c<nf;c++)cols.push([-W2+m+c*ic,zf-r*ic]);
  const zBackCol=-L2+cD*.8;
  if(o.peri){for(let z=zf-rows*ic;z>zBackCol-ic*.3;z-=ic){cols.push([-W2+m,z]);cols.push([W2-m,z]);}for(let c=1;c<nf-1;c++)cols.push([-W2+m+c*ic,zBackCol]);cols.push([-W2+m,zBackCol]);cols.push([W2-m,zBackCol]);}
  const cw=o.peri?o.W-2*m-ic*1.1:o.W-2*m*.55,zc0=o.peri?zBackCol+ic*.6:-L2+m*.3,zc1=zf-(rows-.35)*ic;
  if(!o.peri)for(let z=zc1-ic;z>zc0+ic*.4;z-=ic){cols.push([-cw/2,z]);cols.push([cw/2,z]);}
  cols.forEach(([x,z])=>W.cols[ord].push([...F.p(x,y0,z),F.rot,cH,o.colTint]));const tH=hash2(o.x*.13,o.z*.29),band=o.band??(o.W<24&&tH<.45);if(band){g.set(35,tH*3.7);cols.forEach(([x,z])=>lathe(g,F,x,y0+.02,z,[[cD*.53,0],[cD*.53,2.1],[cD*.5,2.15]],12));}
  g.set(o.cellaPart||6,o.seed||.3,0,1);box(g,F,0,y0,(zc0+zc1)/2,cw/2,cH,(zc1-zc0)/2,31);
  g.set(13,.2);g.poly([F.p(-o.W*.09,y0,zc1+.05),F.p(o.W*.09,y0,zc1+.05),F.p(o.W*.09,y0+cH*.6,zc1+.05),F.p(-o.W*.09,y0+cH*.6,zc1+.05)],F.d(0,0,1));if(o.open??(tH>.5)){g.set(7,.3);g.poly([F.p(-o.W*.085,y0,zc1+.08),F.p(o.W*.085,y0,zc1+.08),F.p(o.W*.085,y0+cH*.58,zc1+.08),F.p(-o.W*.085,y0+cH*.58,zc1+.08)],F.d(0,0,1));statue(g,F,0,y0+.4,zc1+.9,cH*.45,true);}{const nS=Math.max(4,Math.round(ph/.3)),zF=L2+(o.stairs!==false?nS*.4:0);if(o.altar!==false&&o.W>=10){g.set(2,.55);box(g,F,0,0,zF+4.5,1.3,1.15,.75,31);g.set(13,.3);for(const sx of[-1,1])lathe(g,F,sx*W2*.55,0,zF+1.8,[[.08,0],[.08,1.1],[.45,1.25],[.4,1.45],[0,1.45]],8);}if(o.pave!==false&&o.W>=10){const pz0=-L2-4,pz1=zF+12,pcz=(pz0+pz1)/2,phx=W2+5,phz=(pz1-pz0)/2;let yb=0;if(W.gy){yb=1e9;for(const[sx,sz]of[[-1,-1],[1,-1],[1,1],[-1,1],[0,1],[0,-1],[1,0],[-1,0]]){const q=F.p(sx*phx,0,pcz+sz*phz);yb=Math.min(yb,W.gy(q[0],q[2])-F.oy);}}if(yb<-.2){g.set(6,o.seed||.3);box(g,F,0,yb-1.2,pcz,phx,-yb+1.2-.03,phz,31);g.set(2,.5);box(g,F,0,-.35,pcz,phx+.25,.4,phz+.25,31);}g.set(34,tH);g.poly([F.p(-phx,.07,pcz-phz),F.p(phx,.07,pcz-phz),F.p(phx,.07,pcz+phz),F.p(-phx,.07,pcz+phz)],[0,1,0]);}}if(o.fest??(tH>.62&&o.W<34)){const fz=zf+cD*.8;for(let c=0;c<nf-1;c++){const xa=-W2+m+c*ic,xb=xa+ic;g.set(23,.3);for(let k=1;k<6;k++){const t=k/6;box(g,F,lerp(xa,xb,t),y0+cH-1.3-Math.sin(t*Math.PI)*1.1,fz,.22,.3,.22,31);}g.set(8,(c*.37+tH)%1);for(const xx of[xa+.35,xb-.35])g.poly([F.p(xx-.08,y0+cH-2.6,fz+.05),F.p(xx+.08,y0+cH-2.6,fz+.05),F.p(xx+.08,y0+cH-1.3,fz+.05),F.p(xx-.08,y0+cH-1.3,fz+.05)],F.d(0,0,1));}}
  const eH=cH*.24,ye=y0+cH;g.set(6,o.seed||.3);box(g,F,0,ye,0,W2-m*.25,eH*.62,L2-m*.25,31);g.set(2,.5);box(g,F,0,ye+eH*.33,0,W2-m*.2+.06,eH*.12,L2-m*.2+.06,15);
  g.set(6,o.seed||.3);box(g,F,0,ye+eH*.62,0,W2+.35,eH*.38,L2+.35,31);
  if(o.dentils!==false){g.set(2,.6);for(let x=-W2;x<=W2;x+=.45){box(g,F,x,ye+eH*.55,L2+.12,.12,eH*.08,.15,1|2|8|32);}}
  const yb=ye+eH,hP=Math.tan((o.pitch||15)*DEG)*(W2+.35),zr=L2+.35;
  for(const sz of[1,-1]){g.set(6,o.seed||.3);g.poly([F.p(-W2+.2,yb,sz*(zr-.5)),F.p(W2-.2,yb,sz*(zr-.5)),F.p(0,yb+hP-.3,sz*(zr-.5))],F.d(0,0,sz));
    g.set(2,.5);for(const sx of[-1,1]){const a=F.p(sx*(W2+.45),yb,sz*(zr+.15)),b=F.p(0,yb+hP+.25,sz*(zr+.15)),a2=F.p(sx*(W2+.45),yb+.55,sz*(zr+.15)),b2=F.p(0,yb+hP+.8,sz*(zr+.15));
      g.poly([a,b,b2,a2],F.d(0,0,sz));}
    if(o.sculpt!==false&&sz===1){const n=7;for(let i=0;i<n;i++){const t=(i+.5)/n*2-1,hh=(hP-.6)*(1-Math.abs(t))*.85+.5;statue(g,F,t*(W2-1.2),yb+.05,zr-.95,hh,false);}}
    if(o.acro!==false){statue(g,F,0,yb+hP+.7,sz*zr,2.6+o.W*.05,true);for(const sx of[-1,1])statue(g,F,sx*W2,yb+.5,sz*zr,1.8+o.W*.03,true);}}
  g.set(o.roof==='gilt'?12:1,(o.seed||.3)+.2+(tH>.5?.37:0));
  for(const sx of[1,-1])g.poly([F.p(sx*(W2+.55),yb+.35,zr+.2),F.p(0,yb+hP+.55,zr+.2),F.p(0,yb+hP+.55,-zr-.2),F.p(sx*(W2+.55),yb+.35,-zr-.2)],F.d(sx,1,0));
  W.foot.add(o.x,o.z,W2+1,L2+(ph*1.4)+1,o.rot||0).t=1;return{top:yb+hP};}
function tholos(W,g,o){const F=frame(o.x,o.y,o.z,o.rot||0),R=o.R||7,ph=o.podH||2.6,cH=o.colH||9,n=o.n||18;
  g.set(6,.35);lathe(g,F,0,-3,0,[[R+.9,0],[R+.9,3+ph],[0,3+ph]],32);g.set(2,.4);lathe(g,F,0,ph-.4,0,[[R+1.05,0],[R+1.05,.4],[0,.4]],32);
  for(let i=0;i<5;i++){g.set(2,.45);box(g,F,0,0,R+.9+(i+.5)*.42,2.6,ph*(5-i)/5,.21,1|2|8|16);}
  for(let i=0;i<n;i++){const a=i/n*TAU;W.cols.cor.push([...F.p(Math.cos(a)*(R-.2),ph,Math.sin(a)*(R-.2)),0,cH,o.colTint]);}
  g.set(6,.3,0,1);lathe(g,F,0,ph,0,[[R-1.9,0],[R-1.9,cH],[0,cH]],24);
  g.set(6,.3);lathe(g,F,0,ph+cH,0,[[R+.45,0],[R+.45,1.4],[R+.7,1.6],[R+.7,2],[0,2]],32);
  g.set(o.roofPart||1,.5);lathe(g,F,0,ph+cH+2,0,[[R+.8,0],[R*.82,R*.32],[R*.45,R*.58],[R*.12,R*.7],[0,R*.72]],32);
  g.set(13,.3);lathe(g,F,0,ph+cH+2+R*.7,0,[[.5,0],[.5,.6],[.15,1.5],[0,1.8]],8);
  W.foot.addCircle(o.x,o.z,R+3).t=1;}
// arcade wall built with ExtrudeGeometry (real holes): along local x, centered, thickness t
function arcade(g,F,cx,y0,cz,len,h,nArch,thick,part,o={}){const s=new THREE.Shape();s.moveTo(-len/2,-.06);s.lineTo(len/2,-.06);s.lineTo(len/2,h);s.lineTo(-len/2,h);s.closePath();
  const bay=len/nArch,r=bay*(o.span||.32),spring=o.spring??Math.max(.6,h-r-(o.attic??h*.22));
  for(let i=0;i<nArch;i++){const x=-len/2+bay*(i+.5);const p=new THREE.Path();p.moveTo(x-r,0);p.lineTo(x+r,0);p.lineTo(x+r,spring);p.absarc(x,spring,r,0,Math.PI,false);p.lineTo(x-r,0);s.holes.push(p);}
  const geo=new THREE.ExtrudeGeometry(s,{depth:thick,bevelEnabled:false,curveSegments:5});geo.translate(0,0,-thick/2);
  const M=new THREE.Matrix4().makeRotationY(F.rot);const pp=F.p(cx,y0,cz);M.setPosition(pp[0],pp[1],pp[2]);g.set(part,o.seed||.4);g.addGeo(geo,M);
  if(o.pilasters!==false){g.set(part,o.seed||.4);for(let i=0;i<=nArch;i++){const x=-len/2+bay*i;box(g,F,cx+x,y0,cz+thick/2+.18,.32,h*.94,.18,1|2|8);}}
  if(o.cornice!==false){g.set(2,.5);box(g,F,cx,y0+h-.35,cz,len/2+.15,.35,thick/2+.35,31);}}
// building block with courtyard (palace wing ring)
function courtBlock(W,g,F,o){const{cx,cz,w,d,y0,nSt,sH,cw,cd}=o,gH=o.gH||sH*1.2,yT=y0+gH+(nSt-1)*sH;
  const fac={part:o.part??0,seed:o.seed??.5,sty:o.sty??(5+8*1),fl:o.fl??(8|32),nSt,gH,sH,lit:1,burn:o.burn||0};
  rectWalls(g,F,cx,cz,w,d,y0-6,yT,y0,cw>2?Object.assign({},fac,{lit:.06}):fac);
  if(cw>2){rectWalls(g,F,cx,cz,cw,cd,y0,yT,y0,Object.assign({},fac,{sty:0+8,fl:(8|16),lit:1.6}),true);
    roof(g,F,'ring',cx,cz,w,d,yT,22*DEG,.7,fac.seed+.1,{cw,cd});
    g.set(23,.5);g.poly([F.p(cx-cw/2,y0+.05,cz+cd/2),F.p(cx+cw/2,y0+.05,cz+cd/2),F.p(cx+cw/2,y0+.05,cz-cd/2),F.p(cx-cw/2,y0+.05,cz-cd/2)],[0,1,0]);
    if(o.peristyle!==false){const ins=2.6,ch=Math.min(gH*.85,5.2),stp=3.2;
      for(let x=-cw/2+ins;x<=cw/2-ins+.01;x+=stp){W.cols.simple.push([...F.p(cx+x,y0,cz+cd/2-ins),F.rot,ch]);W.cols.simple.push([...F.p(cx+x,y0,cz-cd/2+ins),F.rot,ch]);}
      for(let z=-cd/2+ins+stp;z<=cd/2-ins-stp+.01;z+=stp){W.cols.simple.push([...F.p(cx+cw/2-ins,y0,cz+z),F.rot,ch]);W.cols.simple.push([...F.p(cx-cw/2+ins,y0,cz+z),F.rot,ch]);}
      g.set(1,fac.seed+.3);const yr=y0+ch+.2,yi=y0+gH*.96;
      for(const[sx,sz,ax]of[[0,1,0],[0,-1,0],[1,0,1],[-1,0,1]]){if(!ax){const z1=sz*(cd/2-ins+.4),z2=sz*cd/2;
        g.poly([F.p(cx-cw/2+ins,yr,cz+z1),F.p(cx+cw/2-ins,yr,cz+z1),F.p(cx+cw/2,yi,cz+z2),F.p(cx-cw/2,yi,cz+z2)],F.d(0,1,-sz));}
        else{const x1=sx*(cw/2-ins+.4),x2=sx*cw/2;g.poly([F.p(cx+x1,yr,cz-cd/2+ins),F.p(cx+x1,yr,cz+cd/2-ins),F.p(cx+x2,yi,cz+cd/2),F.p(cx+x2,yi,cz-cd/2)],F.d(-sx,1,0));}}}
    if(W.trees&&o.garden!==false){const n=Math.floor(cw*cd/180);for(let i=0;i<n;i++){const q=F.p(cx+(hash2(i,cw|0)-.5)*(cw-9),y0,cz+(hash2(i,cd|0)-.5)*(cd-9));W.trees.push([q[0],y0,q[2],hash2(i,3)<.5?'cyp':'broad',.6+.4*hash2(i,5)]);}}
  }else roof(g,F,o.roof||'hip',cx,cz,w,d,yT,22*DEG,.8,fac.seed+.1);
  return yT;}
function tower(g,F,cx,cz,w,y0,nSt,sH,o={}){const gH=sH*1.1,yT=y0+gH+(nSt-1)*sH;
  rectWalls(g,F,cx,cz,w,w,y0-8,yT,y0,{part:o.part??0,seed:o.seed??.7,sty:7,fl:(8|4|256|32),nSt,gH,sH,lit:1});
  roof(g,F,'pyr',cx,cz,w,w,yT,24*DEG,1.3,(o.seed??.7)+.2);return yT;}

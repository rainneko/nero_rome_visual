/* ---------- other materials ---------- */
// farmland colours (farmland.js): crop t, field hash fh, season s (0 spring, 1 summer, 2 autumn, 3 winter), the wild grass and straw of the
// same place; fine: 1 near, 0 where a pixel spans metres (rows and specks fade out instead of shimmering)
const GL_FARM=`
vec3 s4(vec3 sp,vec3 su,vec3 au,vec3 wi,float s){return s<1.?mix(sp,su,s):s<2.?mix(su,au,s-1.):s<3.?mix(au,wi,s-2.):mix(wi,sp,s-3.);}
vec3 farmCol(int t,float fh,vec2 p,float s,vec3 gr,vec3 stw,float fine){
 float n1=fbm2(p*.04+fh*31.),n2=vn2(p*.6),ang=fh*3.1416,rw=dot(p,vec2(cos(ang),sin(ang))),bl=1.-smoothstep(0.,.8,s>3.5?0.:s);   // bl: spring bloom
 vec3 soil=vec3(.38,.29,.18)*(.85+.25*n1);float fur=mix(.5,.5+.5*sin(rw*2.4),fine);
 if(t==1){vec3 c=s4(vec3(.12,.22,.06),fh<.6?vec3(.62,.5,.22):vec3(.66,.58,.4),soil*(.8+.25*fur),mix(soil,vec3(.13,.2,.06),.55+.2*fur),s)*(.92+.16*n1);   // grain: green in spring, gold or stubble in summer, ploughed in autumn, shoots in winter
  return mix(c,vec3(.6,.05,.03),step(.93,vn2(p*1.3+fh*17.))*bl*fine*.8);}   // poppies in the spring corn
 if(t==2){float r=abs(fract(rw/2.2)-.5),aR=fwidth(rw/2.2),row=mix(.4,smoothstep(.2+aR,.2-aR,r),fine);   // vines on stakes, rows 2.2 m apart: leaf in spring, deep green in summer, yellow after the vintage, bare in winter
  return mix(s4(gr,stw,soil*.95,mix(soil,gr,.5),s),s4(vec3(.2,.3,.08),vec3(.12,.2,.06),vec3(.45,.3,.09),vec3(.22,.16,.11),s),row)*(.9+.2*n1);}
 if(t==3){vec2 q=p/9.;q.x+=mod(floor(q.y),2.)*.5;float cr=mix(.42,smoothstep(.36,.3,length(fract(q)-.5)),fine)*smoothstep(2600.,2800.,length(p-vec2(150.,250.)));   // olive grove: silver-green crowns in a quincunx over grass, painted only beyond the planted groves (plantOliveGroves, 2.7 km)
  return mix(s4(gr,stw*.95,mix(stw,gr,.5),gr,s),vec3(.19,.21,.14)*(.85+.3*n2),cr*.85);}
 if(t==4){vec3 c=s4(vec3(.16,.31,.07),vec3(.56,.48,.26),vec3(.13,.22,.07),vec3(.1,.19,.06),s)*(.9+.2*n1);   // hay meadow: flowers in spring, mown in summer (windrows), green again after the rains
  c=mix(c,fh<.5?vec3(.85,.78,.35):vec3(.85,.85,.8),step(.9,vn2(p*1.7+fh*9.))*bl*fine*.6);return mix(c,vec3(.68,.6,.36),step(.5,s)*(1.-step(1.5,s))*smoothstep(.45,.4,abs(fract(rw/6.)-.5))*fine*.5);}
 if(t==5)return s4(mix(vec3(.12,.24,.07),vec3(.7,.72,.66),step(.94,vn2(p*1.9))*fine*.6),vec3(.36,.29,.15),soil,mix(soil,vec3(.12,.2,.07),.5),s)*(.85+.15*fur);   // beans and lentils: white flowers in spring, dry in summer
 if(t==6)return s4(mix(vec3(.14,.24,.08),vec3(.42,.52,.78),step(.55,vn2(p*2.1+fh*7.))*mix(.35,1.,fine)*.7),vec3(.5,.41,.24),soil,mix(soil,vec3(.12,.21,.07),.45),s)*(.92+.16*n2);   // flax: green flecked with its small pale-blue flowers in spring, pulled and golden-brown in summer
 if(t==8){vec3 v=s4(vec3(.12,.27,.06),vec3(.1,.22,.05),vec3(.14,.22,.06),vec3(.08,.17,.05),s),v2=v*vec3(1.2,.9,1.3);   // market garden: narrow irrigated beds, green all year
  return mix(soil*.9,mix(v,v2,step(.5,fract(rw/9.))),mix(.65,step(.35,fract(rw/1.6)),fine))*(.9+.2*n2);}
 if(t==9){float bush=mix(.5,smoothstep(.32,.24,abs(fract(rw/1.8)-.5)),fine)*(.6+.4*n2);   // rose beds for garlands: in flower in late spring
  vec3 b=mix(vec3(.07,.13,.05),fh<.5?vec3(.62,.12,.16):vec3(.75,.42,.5),bl*step(.45,vn2(p*2.3)));return mix(s4(gr,stw,soil,mix(soil,gr,.4),s),b,bush);}
 vec3 c=s4(mix(vec3(.2,.26,.08),vec3(.36,.3,.16),.4*n1),stw*.92,soil*(.85+.2*fur),mix(soil,gr,.45),s);   // fallow: weeds in spring, dry in summer, ploughed in autumn
 return mix(c,vec3(.6,.05,.03),step(.95,vn2(p*1.2+fh*5.))*bl*fine*.7);}
`;
MAT.terrain=procMat({key:'terr',vHead:'attribute vec4 aZ;varying vec4 vZ;',vBody:'vZ=aZ;',fHead:'varying vec4 vZ;uniform vec4 uDbg;uniform sampler2D uSt,uStA;uniform vec4 uStX;uniform vec2 uStN;uniform vec4 uRk[16];uniform vec4 uWat[56];uniform float uWatR[56];uniform sampler2D uFarm;uniform vec4 uFarmX;uniform float uAurea;'+GL_FARM,env:.4,fSurf:`
 vec3 N=normalize(vWN);float sl=1.-clamp(N.y,0.,1.);vec2 p=vWP.xz;
 vec3 grass=mix(vec3(.07,.11,.035),vec3(.16,.19,.06),fbm2(p*.008));vec3 dry=vec3(.34,.29,.17);vec3 wcG=vec3(0.);float wmG=0.;

 // seasonal grass (vegetation_seasons brief): Rome is summer-dry. Unwatered ground goes straw in summer, regrows after the autumn rains, is green in winter and freshest in spring.
 float sS=uSeason;const vec3 W3=vec3(.3,.5,.2);
 float dryA=smoothstep(.4,.95,sS)*(1.-smoothstep(1.45,1.95,sS));
 vec3 gSp=vec3(.103,.345,.036),gAu=vec3(.038,.169,.037),gWi=vec3(.047,.169,.044);
 vec3 gS=sS<2.?mix(gSp,gAu,sS*.5):sS<3.?mix(gAu,gWi,sS-2.):mix(gWi,gSp,sS-3.);
 vec3 gr=gS*mix(.82,1.18,fbm2(p*.008))*(.93+.14*vn2(p*.4));
 vec3 stw=vec3(.54,.42,.16)*mix(.85,1.15,fbm2(p*.0035+7.))*(.94+.12*vn2(p*.5));
 vec3 c=mix(gr,stw,dryA*(.9+.1*fbm2(p*.004+3.)));
 {float lc=dot(c,W3);float wW=0.;for(int i=0;i<56;i++){vec4 w=uWat[i];if(w.z>0.){if(w.w>0.){float cr=cos(uWatR[i]),sr=sin(uWatR[i]);vec2 dd=p-w.xy,l=vec2(dd.x*cr-dd.y*sr,dd.x*sr+dd.y*cr),q=abs(l)-w.zw;float sd=length(max(q,0.))+min(max(q.x,q.y),0.);   // garden rectangle: solid inside, a soft noisy edge about 5 m wide outside
   wW=max(wW,1.-smoothstep(0.,5.,sd+(fbm2(p*.03+w.xy)-.5)*7.+(vn2(p*.3)-.5)*3.));}
  else{float d=length(p-w.xy);wW=max(wW,1.-smoothstep(w.z*.6,w.z,d+(fbm2(p*.03+w.xy)-.5)*w.z*.5));}}}
  vec3 wSp=vec3(.058,.19,.04),wAu=vec3(.05,.171,.036),wWi=vec3(.042,.141,.034);vec3 wc=sS<1.?wSp:sS<2.?mix(wSp,wAu,sS-1.):sS<3.?mix(wAu,wWi,sS-2.):mix(wWi,wSp,sS-3.);
  wcG=wc*(.88+.24*fbm2(p*.03));wmG=wW;}
#define SDS(p,a,b) length((p)-(a)-((b)-(a))*clamp(dot((p)-(a),(b)-(a))/dot((b)-(a),(b)-(a)),0.,1.))
 vec3 htG=vec3(0.),fcG=vec3(0.);float hwG=0.,fmG=0.;
 float fBl=sS<1.4?1.-smoothstep(.55,1.3,sS):sS<3.5?0.:smoothstep(3.5,4.,sS);   // wild flowers: spring only
 {vec3 ht=vec3(0.);float hwt=0.,dd;dd=SDS(p,vec2(0.,280.),vec2(230.,320.));float w1=1.-smoothstep(140.,190.,dd);ht+=vec3(.1,.17,.05)*w1;hwt+=w1;dd=SDS(p,vec2(-262.,40.),vec2(-205.,-225.));float w2=1.-smoothstep(98.,104.,dd);ht+=mix(vec3(.2,.21,.1),vec3(.27,.25,.13),smoothstep(.4,.7,fbm2(p*.04)))*w2;hwt+=w2;dd=SDS(p,vec2(-700.,900.),vec2(-300.,1150.));float w3=1.-smoothstep(180.,250.,dd);ht+=vec3(.07,.12,.04)*w3;hwt+=w3;dd=SDS(p,vec2(700.,700.),vec2(1500.,600.));float w4=1.-smoothstep(160.,220.,dd);ht+=vec3(.13,.14,.06)*w4;hwt+=w4;dd=SDS(p,vec2(480.,-40.),vec2(1300.,-300.));float w5=1.-smoothstep(170.,230.,dd);ht+=vec3(.12,.2,.06)*w5;hwt+=w5;dd=SDS(p,vec2(-60.,-560.),vec2(900.,-1520.));float w6=1.-smoothstep(170.,230.,dd);ht+=mix(vec3(.08,.14,.05),vec3(.17,.15,.22),step(.84,vn2(p*.3)))*w6;hwt+=w6;dd=SDS(p,vec2(500.,-760.),vec2(1350.,-1080.));float w7=1.-smoothstep(120.,170.,dd);ht+=vec3(.18,.22,.08)*w7;hwt+=w7;if(hwt>.01){ht/=hwt;htG=ht;hwG=min(1.,hwt);}}{float hw=0.,aa=fwidth(p.x*1.1)*.9;   // wild spring flowers (vegetation_fix): small warm dots in loose clusters, about 3 % of the grass, where the hill slopes are open
  if(SDS(p,vec2(0.,280.),vec2(230.,320.))<190.)hw=.3;
  else if(SDS(p,vec2(-262.,40.),vec2(-205.,-225.))<125.)hw=.5;
  else if(SDS(p,vec2(-700.,900.),vec2(-300.,1150.))<250.)hw=1.;
  else if(SDS(p,vec2(700.,700.),vec2(1500.,600.))<220.)hw=.8;
  else if(SDS(p,vec2(480.,-40.),vec2(1300.,-300.))<230.)hw=.9;
  else if(SDS(p,vec2(-60.,-560.),vec2(900.,-1520.))<230.)hw=.9;
  else if(SDS(p,vec2(500.,-760.),vec2(1350.,-1080.))<170.)hw=.8;
  if(hw>0.&&fBl>.01){vec2 fq2=p*1.1,id=floor(fq2),lc=fract(fq2)-.5;vec2 jt=vec2(h12(id+3.7),h12(id+11.3))-.5;float d=length(lc-jt*.5);
   float dotM=(1.-smoothstep(.15-aa,.15+aa,d))*step(h12(id+9.9),.85*hw)*(1.-smoothstep(.5,1.,aa));
   float clus=smoothstep(.5,.7,fbm2(p*.03+11.));float hk2=h12(id+5.1);
   fcG=hk2<.4?vec3(.52,.032,.021):hk2<.65?vec3(.83,.75,.51):hk2<.9?vec3(.75,.51,.045):vec3(.26,.1,.4);   // poppy red, cream, yellow, a few violet (linear)
   fmG=dotM*clus*fBl;}}

 vec3 cGr=c;{vec3 gn=gS/max(dot(gS,W3),.01);vec3 hc=htG/max(dot(htG,W3),.01);cGr=c*mix(vec3(1.),clamp(hc/gn,vec3(.7),vec3(1.4)),.6*(1.-dryA));}   // hill grass: the season colour with a slight hue of its own (applied over the town ground below)
 c=mix(c,mix(vec3(.4,.29,.17),vec3(.32,.23,.135),.35+.4*fbm2(p*.02))*(.8+.3*fbm2(p*.05))*(.86+.3*fbm2(p*.45)),vZ.x*(1.-vZ.y)*1.);   // town ground: open earth between the streets
 c=mix(c,cGr,hwG*.7);c=mix(c,wcG*(.9+.2*fbm2(p*.03)),clamp(vZ.y+wmG,0.,1.)*.95);c=mix(c,fcG,fmG);{float frT=smoothstep(2.35,3.,sS)*(1.-smoothstep(3.,3.6,sS));c=mix(c,vec3(.82,.84,.87),frT*.42*smoothstep(.75,1.,N.y));}
 vec2 qq=p/165.+vec2(fbm2(p*.003),fbm2(p*.003+5.))*.9;vec2 cl=floor(qq),fq=fract(qq);float chs=h12(cl);if(vZ.z>.85)chs=.1;float ang=chs*6.2832;vec2 dr=vec2(cos(ang),sin(ang));
 float rw=dot(p,dr)/3.3;float aaF=fwidth(rw);float vine=smoothstep(.24+aaF,.24-aaF,abs(fract(rw)-.5));vec3 soil=vec3(.4,.32,.2)*(.85+.2*fbm2(p*.05)),vc=vec3(.19,.2,.1)*(.8+.3*fbm2(p*.2));
 vec3 fc=chs<.42?mix(soil,vc,mix(vine,.45,smoothstep(.15,.5,aaF))):chs<.62?mix(vec3(.5,.43,.22),vec3(.42,.39,.18),fbm2(p*.03)):chs<.82?mix(vec3(.19,.23,.1),vec3(.27,.27,.12),fbm2(p*.04)):mix(vec3(.3,.29,.14),vec3(.44,.38,.22),fbm2(p*.02));
 float edge=1.-smoothstep(0.,.018+fwidth(qq.x)*1.5,min(min(fq.x,1.-fq.x),min(fq.y,1.-fq.y)));fc=mix(fc,vec3(.07,.1,.04),edge*.85);
 {vec2 fq0=(p-uFarmX.xy)/uFarmX.zw;if(uFarmX.z>0.&&fq0.x>0.&&fq0.y>0.&&fq0.x<1.&&fq0.y<1.){   // the crop map (farmland.js) replaces the random patchwork in Rome
  vec4 ft=texture2D(uFarm,fq0+((vec2(fbm2(p*.06),fbm2(p*.06+4.1))-.5)*16.+(vec2(vn2(p*.45),vn2(p*.45+2.7))-.5)*5.)/uFarmX.zw);int crop=int(ft.r*255.+.5);if(vZ.z>.85)crop=2;   // ragged field edges; the Aventine vineyard stays a vineyard
  float fine=1.-smoothstep(.4,1.6,fwidth(p.x));fc=farmCol(crop,ft.g,p,sS,gr,stw,fine);fc=mix(fc,fc*vec3(.62,.72,.55),ft.b*(.5+.4*fbm2(p*.3))*.6);}}   // a hedge or path where two fields meet
 c=mix(c,fc,vZ.z*.92);
 c=mix(c,vec3(.7,.62,.45)*(.9+.15*vn2(p*.5)),vZ.w);
 float pal=(1.-smoothstep(230.,380.,length(p-vec2(100.,300.))))*(1.-uDbg.x);   // the Palatine: pale limestone with moss on the ledges (rock_and_base brief)
 // (the dark-green slope band that used to sit here was the soft smear in front of the Jupiter temple; steep cells are now the rocky scarp below)
 vec3 rock=mix(vec3(.31,.28,.19),vec3(.2,.18,.16),vZ.w)*(.75+.4*fbm2(p*.07));
 rock=mix(rock,vec3(.58,.52,.41)*(.85+.3*fbm2(p*.08)),pal*.85);
 c=mix(c,rock,mix(smoothstep(.6,.9,sl),smoothstep(.5,.78,sl),pal)*.85);
 {   // bare rock/earth: only within 6-10 m of a rock cluster and on near-vertical cells (gradient > .9), as irregular fBm patches in world xz (no height term: bands read as a topographic map)
  float rkd=1e3;for(int i=0;i<16;i++){vec4 rs=uRk[i];rkd=min(rkd,SDS(p,rs.xy,rs.zw));}
  float nearR=1.-smoothstep(6.,10.,rkd+(fbm2(p*.35)-.5)*5.),steep=smoothstep(.25,.31,sl);
  float pn=fbm2(p*.06+vec2(31.,7.))+.18*(fbm2(p*.37+3.)-.5);
  float scarp=max(nearR,steep)*smoothstep(.5,.6,pn+.2*nearR+.15*steep)*(1.-vZ.w)*(1.-pal*.6);
  vec3 bare=mix(vec3(.305,.254,.171),vec3(.216,.181,.127),smoothstep(.4,.6,fbm2(p*.045+vec2(11.,23.))))*(.93+.14*vn2(p*1.3));   // sRGB ~150/138/115 and ~128/118/100
  c=mix(c,bare,scarp*.92);}
 // streets (streets.js): coverage / grade / wall distance from the street raster, direction from the coarse texture
 float stR=.95;
 if(uStX.z>0.&&uDbg.y<.5){vec2 q0=(vWP.xz-uStX.xy)/uStX.zw;
  if(q0.x>0.&&q0.y>0.&&q0.x<1.&&q0.y<1.){
   vec2 wob=(vec2(fbm2(vWP.xz*.31),fbm2(vWP.xz*.31+7.3))-.5)*1.7;vec2 q=q0+wob/uStX.zw;vec4 t=texture2D(uSt,q);
   float mini=smoothstep(.8,2.6,fwidth(q.x)*uStN.x);float cov=mix(smoothstep(.26,.5,t.r),t.r,mini);
   if(cov>.004){
    float gc=t.g*255.;float wM=clamp((gc-128.)/64.,0.,1.),wD=clamp((128.-gc)/64.,0.,1.),wS=1.-max(wM,wD);float dw=t.b*8.;cov*=1.-smoothstep(.16,.26,sl)*(1.-wD);   // no stone/marble paving painted on steep faces (the pale wedge over the Capitol slope was marble street colour on a cut face; real stairs are geometry)
    vec4 ta=texture2D(uStA,q0);vec2 av=ta.rg*2.-1.;float th=.5*atan(av.y,av.x);vec2 tv=vec2(cos(th),sin(th)),nv=vec2(-tv.y,tv.x);float across=dot(vWP.xz,nv),along=dot(vWP.xz,tv);
    float trk=smoothstep(.22,.06,abs(fract((across+vn2(vec2(along*.05,3.))*1.4)/1.45)-.5)*1.45)*smoothstep(.3,.7,vn2(vec2(along*.1,across*.3)))*clamp(ta.b*4.,0.,1.);
    vec2 rp=vec2(vWP.x*.866+vWP.z*.5,-vWP.x*.5+vWP.z*.866);
    vec3 cM=vec3(.55,.49,.395),cS=vec3(.17,.15,.125),cD=vec3(.36,.26,.15);
    if(wM>.01){float sl=3.4,sw=1.7,row=floor(rp.y/sw),u=rp.x+mod(row,2.)*sl*.5,id=floor(u/sl),jx=abs(fract(u/sl+.5)-.5)*sl,jy=abs(fract(rp.y/sw+.5)-.5)*sw,aa=fwidth(rp.x)*1.5+.01,jn=1.-smoothstep(.02,.02+aa,min(jx,jy)),hh=h12(vec2(id,row)+3.1);
     cM=vec3(.55,.49,.395)*(.9+.16*hh)*(.94+.1*vn2(rp*.6));cM=mix(cM,cM*vec3(.84,.8,.73),step(.84,hh));cM*=1.-.34*jn*(1.-mini);cM*=mix(.72,1.,smoothstep(0.,1.1,dw));}
    if(wS>.01){vec2 p=vWP.xz*1.15;vec2 ip=floor(p),fp=fract(p);float m1=8.,m2=8.;vec2 id=ip;
     for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j);vec2 o=vec2(h12(ip+g),h12(ip+g+17.3));vec2 r=g+o-fp;float d=dot(r,r);if(d<m1){m2=m1;m1=d;id=ip+g;}else if(d<m2)m2=d;}
     float e=sqrt(m2)-sqrt(m1),far=smoothstep(.2,.7,fwidth(p.x)*2.);cS=vec3(.28,.225,.165)*(.7+.5*h12(id));cS*=mix(.45,1.,smoothstep(0.,.08,e));cS=mix(cS,vec3(.28,.225,.165)*.95,far);
     cS*=(.82+.4*fbm2(vWP.xz*.17))*(1.-.18*smoothstep(.62,.78,fbm2(vWP.xz*.06+11.)));   // large-scale tone: worn, repaired and dirty stretches
     cS*=1.+.3*smoothstep(1.4,3.4,dw);cS*=mix(.6,1.,smoothstep(0.,1.4,dw));
     }   // (the crown / drain line / ruts painted from a 2.5 m raster were invisible at street height; they are real strips now: roadKerbs/roadWear in streets.js)
    if(wD>.01){cD=mix(vec3(.38,.27,.155),vec3(.29,.2,.115),fbm2(vWP.xz*.9));cD*=.85+.3*vn2(vWP.xz*5.);cD=mix(cD,vec3(.55,.47,.33),step(.93,vn2(vWP.xz*9.))*.5);
     cD=mix(cD,cD*.55,smoothstep(.62,.8,fbm2(vWP.xz*.12+4.)));cD*=1.-.28*trk;cD*=mix(.68,1.,smoothstep(0.,1.2,dw));}
    vec3 stC=cM*wM+cS*wS+cD*wD;stR=.52*wM+.72*wS+.95*wD;
    float ed=smoothstep(.0,.3,cov)*(1.-smoothstep(.55,.95,cov));stC=mix(stC,cD*.92,ed*.55*(1.-wD));
    c=mix(c,stC,cov);}}}
 if(uAurea>.5){   // the Golden House ground (domus-aurea.js AUREA_SITE): from 59 the streets are gone; 59-68 rough ground and builders' earth, from 68 mown grass
  float mA=max(max(1.-smoothstep(142.,152.,length(p-vec2(572.,200.))),1.-smoothstep(-6.,2.,max(max(380.-p.x,p.x-520.),max(20.-p.y,p.y-200.)))),max(1.-smoothstep(-6.,2.,max(max(450.-p.x,p.x-1000.),max(-20.-p.y,p.y-120.))),1.-smoothstep(32.,40.,length(p-vec2(330.,160.)))));
  mA*=1.-smoothstep(.55,.8,sl);vec3 lawn=uAurea>1.5?mix(gr,vec3(.16,.22,.09),.45):mix(gr,vec3(.33,.27,.17),.45+.3*fbm2(p*.03));c=mix(c,lawn*(.92+.16*fbm2(p*.07)),mA);stR=mix(stR,.9,mA);}
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
  S.emit=vec3(.04,.07,.015)*max(dot(-N,uSunDir),0.)*(1.-uNight);}
 if(vF.x>.5){float s5=uSeason,sw=s5>3.4?s5-4.:s5;float spr=1.-smoothstep(0.,.8,sw>0.?sw:0.);float win=smoothstep(2.3,3.,s5)*(1.-smoothstep(3.5,4.,s5));float sum=1.-smoothstep(0.,.8,abs(s5-1.));
  S.alb*=mix(vec3(1.),vec3(1.55,1.45,.7),spr*smoothstep(.45,1.,vF.z)*.75);   // spring: pale new growth on the tips
  S.alb*=mix(vec3(1.),vec3(.88,.95,.98),win*.8)*(1.-.1*sum);}   // winter slightly grey, summer darkest
`});
// deciduous crowns (vegetation_seasons brief). aI = (type, hash, owner, hash2) per instance. type 1 oak/elm, 2 plane, 3 poplar/willow, 4 pomegranate, 5 almond, 6 fig.
// The season colour is worked out per instance in the vertex shader (autumn is staggered by the instance hash: a third green, a third yellow, a third yellow-brown at mid-autumn).
const DEC_GL=`
vec3 decCol(float ty,float h,float s,out float lv,out vec2 ex){
 float spr=s>3.5?s-4.:(s<1.?s:9.);
 vec3 sp=vec3(.319,.504,.0625),gr=vec3(.096,.215,.036),ye=vec3(1.05,.72,.10),br=vec3(.30,.125,.05),ba=vec3(.21,.15,.10);   // linear albedo, calibrated so a sunlit crown probes about 120/150/60 (spring), 200/165/60 (yellow), 150/100/45 (brown)
 if(ty>2.5&&ty<3.5){gr*=vec3(1.2,1.4,1.1);sp*=vec3(1.1,1.1,1.2);}
 vec3 tg=ty<1.5?br:ty<2.5?mix(br,ye,.4):ty<3.5?ye*.95:ty<4.5?ye:ty<5.5?mix(ye*.75,br,.5):mix(ye*.85,br,.25);
 vec3 c;lv=1.;ex=vec2(0.);
 if(s<1.||s>3.5){float lf=smoothstep(-.4,.2,spr);c=mix(ba,mix(sp,gr,smoothstep(.1,.9,max(spr,0.))),lf);lv=mix(.2,1.,lf);}
 else{float u=(s-2.)*1.4+(.5-h)*1.6-.1;if(ty>2.5&&ty<3.5)u-=.12;if(ty>5.5)u+=.15;
  c=gr;c=mix(c,ye,smoothstep(-.35,0.,u));c=mix(c,tg,smoothstep(.05,.35,u));float bz=smoothstep(.5,.95,u);c=mix(c,ba,bz);lv=mix(1.,.2,bz);}
 if(ty>3.5&&ty<4.5){ex=vec2(smoothstep(.45,.8,s)*(1.-smoothstep(1.1,1.6,s)),1.);if(s>1.5){ex=vec2(smoothstep(1.5,1.9,s)*(1.-smoothstep(2.7,3.1,s)),2.);}}
 if(ty>4.5&&ty<5.5){ex=vec2(smoothstep(-.45,-.15,spr)*(1.-smoothstep(.15,.55,spr)),3.);}
 return c;}`;
MAT.foliageD=procMat({key:'folD',vHead:'attribute vec3 aF;attribute vec4 aI;varying vec3 vF;varying vec3 vSC;varying vec2 vEx;varying float vLv;'+DEC_GL,fHead:'varying vec3 vF;varying vec3 vSC;varying vec2 vEx;varying float vLv;',env:.5,
 vBody:`vF=aF;float lv0;vec2 ex0;vSC=decCol(aI.x,aI.y,uSeason,lv0,ex0);vEx=ex0;vLv=lv0;
#ifdef USE_INSTANCING
 float ph=instanceMatrix[3].x*.07+instanceMatrix[3].z*.05;
#else
 float ph=0.;
#endif
 if(aF.x>.5){float k=mix(.7,1.,smoothstep(.2,1.,lv0));transformed.xz*=k;transformed.y=mix(transformed.y,transformed.y*.88+.35,1.-k);}
 float sw=sin(uTime*1.3+ph)*.18*aF.x*aF.y*aF.y;transformed.x+=sw;transformed.z+=sw*.6;`,
 fSurf:`vec3 N=normalize(vWN);
 if(vF.x<.5){S.alb=vec3(.42,.36,.3)*(.8+.4*vn2(vWP.xy*2.));S.rough=.9;}
 else{float n=fbm3(vWP*.7);float n2=vn3(vWP*2.6);
  float sunF=max(dot(N,uSunDir),0.);
  if(vLv<.95&&vn3(vWP*2.1+7.)>vLv*1.1+.12+smoothstep(.55,.2,vLv)*.9)discard;   // leaves falling: the crown thins out and breaks up in clumps
  S.alb=vSC*(.6+.55*n)*mix(.5,1.05,vF.z);S.alb+=vec3(.25,.3,.1)*step(.68,n2)*sunF*.15;
  S.rough=.85;S.ao=mix(.5,1.,vF.z)*mix(.75,1.,vF.y);
  S.emit=vec3(.04,.07,.015)*max(dot(-N,uSunDir),0.)*(1.-uNight)*.6;
  if(vEx.x>.01){float kd=vEx.y;vec3 fc=kd<1.5?vec3(.8,.07,.03):kd<2.5?vec3(.62,.05,.035):vec3(.97,.74,.78);float mk;
   if(kd>2.5){float nn=vn3(vWP*1.9);mk=smoothstep(.15,.4,nn+vEx.x*.35-.35);}
   else{vec3 q3=vWP*2.,id=floor(q3);vec3 jt=vec3(h13(id+1.3),h13(id+7.7),h13(id+13.1))-.5;float d=length(fract(q3)-.5-jt*.35);   // flowers and fruit: a few distinct dots on the outer shell, never noise over the whole crown
    mk=(1.-smoothstep(.26,.34,d))*step(h13(id+21.9),.8)*smoothstep(.72,.9,vF.z)*smoothstep(0.,.35,vEx.x);}
   S.alb=mix(S.alb,fc*(.8+.4*n),mk*min(1.,vEx.x*1.2));}}
`});
// shadow pass for deciduous crowns: the same winter shrink as the vertex shader above, so bare trees cast a thinner shadow
const DEPTH_D=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});
DEPTH_D.onBeforeCompile=sh=>{sh.uniforms.uSeason=U.uSeason;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aF;attribute vec4 aI;uniform float uSeason;'+DEC_GL)
  .replace('#include <begin_vertex>','#include <begin_vertex>\n{float lv0;vec2 ex0;decCol(aI.x,aI.y,uSeason,lv0,ex0);if(aF.x>.5){float k=mix(.7,1.,smoothstep(.2,1.,lv0));transformed.xz*=k;transformed.y=mix(transformed.y,transformed.y*.88+.35,1.-k);}}');};
// flower shrubs: green body, flower dots whose cover and colour family follow the season and the owner (0 public/wild, 1 imperial, 2 senatorial, 4 plebeian pots)
const FLW_GL=`
float flDens(float ow,float s){vec4 d=ow<.5?vec4(1.,.08,0.,0.):ow<1.5?vec4(1.,.5,.35,.3):ow<2.5?vec4(1.,.4,.14,0.):ow<3.5?vec4(0.):vec4(1.,.8,0.,0.);
 return s<1.?mix(d.x,d.y,s):s<2.?mix(d.y,d.z,s-1.):s<3.?mix(d.z,d.w,s-2.):mix(d.w,d.x,s-3.);}
vec3 flCol(float ow,float s,float h){
 if(s<.55||s>3.45){ if(ow<.5)return h<.3?vec3(.62,.05,.03):h<.6?vec3(.85,.84,.78):h<.85?vec3(.8,.58,.08):vec3(.3,.14,.55);
  if(ow>3.5)return h<.3?vec3(.62,.06,.05):h<.55?vec3(.82,.3,.4):h<.8?vec3(.88,.86,.8):vec3(.8,.58,.08);
  return h<.28?vec3(.62,.06,.1):h<.5?vec3(.82,.3,.4):h<.68?vec3(.3,.14,.55):h<.84?vec3(.9,.88,.82):vec3(.2,.18,.6);}
 if(s<1.5){ if(ow<.5)return h<.5?vec3(.8,.58,.08):vec3(.85,.84,.78);return h<.55?vec3(.8,.25,.4):h<.8?vec3(.9,.9,.85):vec3(.7,.06,.03);}
 if(s<2.7){ return h<.5?vec3(.65,.05,.08):h<.8?vec3(.85,.4,.5):vec3(.45,.2,.6);}
 return h<.6?vec3(.7,.04,.07):vec3(.85,.45,.5);}`;
MAT.bloom=procMat({key:'bloom',vHead:'attribute vec3 aF;attribute vec4 aI;varying vec3 vF;varying vec4 vBc;'+FLW_GL,fHead:'varying vec3 vF;varying vec4 vBc;',env:.5,
 vBody:`vF=aF;vBc=vec4(flCol(aI.z,uSeason,aI.w),flDens(aI.z,uSeason)*(.6+.4*aI.y));
#ifdef USE_INSTANCING
 float ph=instanceMatrix[3].x*.07+instanceMatrix[3].z*.05;
#else
 float ph=0.;
#endif
 float sw=sin(uTime*1.3+ph)*.18*aF.x*aF.y*aF.y;transformed.x+=sw;transformed.z+=sw*.6;`,
 fSurf:`vec3 N=normalize(vWN);float n=fbm3(vWP*.7);
 S.alb=vec3(.07,.12,.032)*(.6+.55*n)*mix(.5,1.05,vF.z);S.rough=.85;S.ao=mix(.5,1.,vF.z)*mix(.75,1.,vF.y);
 {float nn=vn3(vWP*3.4);float cov=vBc.w;float thr=.74-cov*.32;float mk=cov>.02?smoothstep(thr,thr+.07,nn):0.;S.alb=mix(S.alb,vBc.rgb*(.85+.3*n),mk);}
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
  else if(type==='palm'){const tr=new THREE.CylinderGeometry(.2,.34,9,6);tr.translate(0,4.5,0);add(tr,0,13,0);   // date palm (one, at the House of Augustus): trunk and nine arching fronds
    for(let k=0;k<9;k++){const f=new THREE.IcosahedronGeometry(1,0);f.scale(2.9,.09,.5);f.translate(2.7,0,0);f.rotateZ(.55-.25*(k%3)/2);f.rotateY(k/9*TAU+rnd()*.3);f.translate(0,9.2,0);add(f,1,13,3.4);}}
  else{const tr=new THREE.CylinderGeometry(.2,.32,3.2,5);tr.translate(0,1.6,0);add(tr,0,9,0);
    for(let k=0;k<4;k++){const s=new THREE.IcosahedronGeometry(1,1);s.scale(2.4+rnd(),2.2+rnd(),2.4+rnd());s.translate((rnd()-.5)*2.6,4.6+rnd()*2.2,(rnd()-.5)*2.6);add(bump(s,.25,.9),1,8,4);}}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  G.setAttribute('aF',new THREE.Float32BufferAttribute(F,3));G.computeBoundingSphere();return G;}
const TREEGEO={cyp:treeGeo('cyp'),pine:treeGeo('pine'),broad:treeGeo('broad'),palm:treeGeo('palm')};
const TREECOL={cyp:[.035,.06,.028],pine:[.05,.085,.03],broad:[.07,.1,.035],olive:[.08,.088,.058]};TREEGEO.olive=TREEGEO.broad;TREEGEO.shrub=(()=>{const g=new THREE.IcosahedronGeometry(1,0).toNonIndexed();g.scale(1.25,.8,1.25);g.translate(0,.62,0);g.computeVertexNormals();const p=g.attributes.position,a=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){a[i*3]=1;a[i*3+1]=Math.min(1,p.getY(i)/1.4);a[i*3+2]=.85;}g.setAttribute('aF',new THREE.BufferAttribute(a,3));return g;})();TREEGEO.flower=TREEGEO.shrub;TREECOL.shrub=[.055,.085,.03];TREECOL.palm=[.06,.095,.03];TREECOL.flower=[.3,.1,.16];
// Tree kinds (t[3]): evergreen cyp, pine, broad (holm oak / laurel), olive, shrub, palm; deciduous broadD (oak/elm), plane, poplar (and willow), fig, pomegr, almond; flower (shrub with seasonal flowers).
// t = [x,y,z,kind,scale,colour?,owner?]. owner: 0 public / wild, 1 imperial, 2 senatorial, 3 temple, 4 plebeian (pots): picks the flower season profile (see FLW_GL).
const TKIND={broadD:{g:'broad',t:1,m:1},plane:{g:'broad',t:2,m:1,sx:1.3,sy:1.3},poplar:{g:'cyp',t:3,m:1,sx:1.9,sy:1.1},fig:{g:'broad',t:6,m:1,sx:.7,sy:.7},pomegr:{g:'broad',t:4,m:1,sx:.5,sy:.5},almond:{g:'broad',t:5,m:1,sx:.6,sy:.6},flower:{g:'flower',t:0,m:2}};
function flushTrees(W,list,parent){if(list.length>60000*Q.trees){const k=60000*Q.trees/list.length;list=list.filter((t,i)=>hash2(i,t[2]|0)<k);}   // the cap thins the list that is drawn, the same way on every load (it used to thin W.trees, a copy nobody drew)
  W.treeCount=(W.treeCount||0)+W.trees.length;const by={cyp:[],pine:[],broad:[],olive:[],shrub:[],palm:[]};for(const k in TKIND)by[k]=[];list.forEach(t=>by[t[3]]&&by[t[3]].push(t));const out=[];
  for(const k in by){const L=by[k];if(!L.length)continue;const kd=TKIND[k]||{g:k,t:0,m:0};let geo=TREEGEO[kd.g];
    if(kd.m){const g2=new THREE.BufferGeometry();for(const a in geo.attributes)g2.setAttribute(a,geo.attributes[a]);g2.boundingSphere=geo.boundingSphere;geo=g2;}   // the per-instance season attribute needs its own geometry object (buffers are shared)
    const m=new THREE.InstancedMesh(geo,kd.m===2?MAT.bloom:kd.m===1?MAT.foliageD:MAT.foliage,L.length);
    const aI=kd.m?new Float32Array(L.length*4):null;
    const M=new THREE.Matrix4(),q=new THREE.Quaternion(),S=new THREE.Vector3(),Pp=new THREE.Vector3(),c=new THREE.Color();
    L.forEach((t,i)=>{const s=t[4]||1,sx=s*(kd.sx||1),sy=s*(kd.sy||1);q.setFromAxisAngle(new THREE.Vector3(0,1,0),hash2(t[0]|0,t[2]|0)*TAU);S.set(sx*(.85+.3*hash2(i,7)),sy,sx*(.85+.3*hash2(i,9)));Pp.set(t[0],t[1]-.3,t[2]);
      M.compose(Pp,q,S);m.setMatrixAt(i,M);const v=.75+.5*hash2(i,3);
      if(kd.m){c.setRGB(v,v,v);aI[i*4]=kd.t;aI[i*4+1]=hash2(t[0]*.37,t[2]*.53);aI[i*4+2]=t[6]||0;aI[i*4+3]=hash2(t[0]*.91+3.,t[2]*.77);}
      else{const b=TREECOL[k];c.setRGB(b[0]*v,b[1]*v*(.9+.2*hash2(i,5)),b[2]*v);if(t[5])c.setRGB(t[5][0]*v,t[5][1]*v,t[5][2]*v);}
      m.setColorAt(i,c);});
    if(aI)geo.setAttribute('aI',new THREE.InstancedBufferAttribute(aI,4));
    if(kd.m===1)m.customDepthMaterial=DEPTH_D;
    m.castShadow=true;m.receiveShadow=true;(parent||W.scene).add(m);out.push(m);}return out;}
// watered ground (palace and domus gardens): discs the terrain shader keeps green all year (uWat)
const WAT={n:0,add(x,z,r,hd=0,rot=0){if(this.n<56){U.uWatR.value[this.n]=rot;U.uWat.value[this.n++].set(x,z,r,hd);}}};   // circle (x,z,r) or rectangle (x,z,half-width,half-depth,rot as in Foot)

/* ---------- people ---------- */
const PPLGEO=(()=>{const a=new THREE.CylinderGeometry(.17,.3,1.35,6);a.translate(0,.68,0);const b=new THREE.SphereGeometry(.17,6,5);b.translate(0,1.5,0);
  const P=[...a.toNonIndexed().attributes.position.array,...b.toNonIndexed().attributes.position.array];const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.computeVertexNormals();return G;})();
const PPLCOL=[[.75,.72,.65],[.6,.25,.14],[.2,.3,.5],[.55,.42,.2],[.3,.4,.25],[.45,.3,.4],[.7,.6,.45],[.35,.2,.15]];
function flushPeople(W,list,parent){if(list.length>9000){const k=9000/list.length;list=list.filter((p,i)=>hash2(i,p[2]|0)<k);}if(!list.length)return null;const m=new THREE.InstancedMesh(PPLGEO,MAT.people,list.length);const M=new THREE.Matrix4(),c=new THREE.Color();   // the cap thins the list that is drawn (it used to thin W.people, a copy nobody drew), the same way on every load
  list.forEach((p,i)=>{M.makeTranslation(p[0],p[1],p[2]);m.setMatrixAt(i,M);const k=PPLCOL[Math.floor(hash2(i,p[0]|0)*PPLCOL.length)];c.setRGB(k[0],k[1],k[2]);m.setColorAt(i,c);});
  m.castShadow=false;m.receiveShadow=true;m.frustumCulled=false;(parent||W.scene).add(m);return m;}   // r147 culls an InstancedMesh by one figure's bounds at the origin: a crowd far from the origin vanished

/* ---------- monument generators (into GB g) ---------- */
function statue(g,F,x,y,z,h,gilt=false,spear=false){   // a standing figure (phase 5): drapery block for the legs, torso with square shoulders, head, one arm hanging and one raised diagonally; dark bronze (gilt=true) or marble ivory; gilding only on a small detail in the raised hand
  const part=gilt?40:6,u=h/10;g.set(part,.4);
  lathe(g,F,x,y,z,[[1.45*u,0],[1.5*u,.4*u],[1.15*u,1.5*u],[1.0*u,3.4*u],[1.15*u,4.7*u],[0,4.7*u]],8,part);   // plinth + legs/drapery block
  box(g,F,x,y+4.6*u,z,1.55*u,3.1*u,1.0*u,31);   // torso, square shoulders
  lathe(g,F,x,y+7.6*u,z,[[.4*u,0],[.75*u,.45*u],[.85*u,1.2*u],[.7*u,2.0*u],[0,2.3*u]],8,part);   // neck and head
  box(g,F,x-1.95*u,y+4.9*u,z,.38*u,2.7*u,.38*u,31);   // arm hanging in the drapery
  box(g,F,x+2.0*u,y+6.5*u,z,.5*u,1.0*u,.38*u,31);box(g,F,x+2.55*u,y+7.4*u,z,.42*u,1.1*u,.36*u,31);box(g,F,x+3.0*u,y+8.4*u,z,.38*u,1.2*u,.34*u,31);   // raised arm in three steps (a diagonal)
  if(gilt){g.set(28,.4);box(g,F,x+3.0*u,y+9.6*u,z,.5*u,.6*u,.5*u,31);}   // small gilt detail (a wreath or orb) in the raised hand
  if(spear){g.set(13,.3);box(g,F,x-2.3*u,y+2*u,z,.05*h/4,h*.95,.05*h/4,31);}}
function pedestalStatue(g,F,x,z,y,h,opts={}){g.set(6,.6);box(g,F,x,y,z,h*.22,h*.22,h*.22,31);g.set(2,.6);box(g,F,x,y+h*.22,z,h*.26,h*.06,h*.26,31);statue(g,F,x,y+h*.28,z,h*.72,opts.gilt,opts.spear);}
function honorCol(W,g,F,x,z,y,h){W.cols.cor.push([...F.p(x,y+1.2,z),F.rot,h,[.95,.92,.86]]);g.set(6,.5);box(g,F,x,y,z,h*.07,1.2,h*.07,31);statue(g,F,x,y+1.2+h,z,2.2,true);}
// square furniture (phase 4). Honorific column: 2 m pedestal + plain shaft + abacus + gilt statue, ~12.5 m in all (no spiral relief: that is a later invention). y is relative to F.oy.
function honorCol2(W,g,F,x,z,y){const H=8;g.set(6,.5);box(g,F,x,y,z,1.5,.5,1.5,31);box(g,F,x,y+.5,z,1.15,1.35,1.15,31);g.set(2,.5);box(g,F,x,y+1.85,z,1.35,.22,1.35,31);
  W.cols.cor.push([...F.p(x,y+2.07,z),F.rot,H,[.95,.92,.86]]);g.set(2,.5);box(g,F,x,y+2.07+H,z,.9,.45,.9,31);(W.statLog=W.statLog||[]).push(F.p(x,y+2.52+H,z).map(v=>Math.round(v)));statue(g,F,x,y+2.52+H,z,2.2,true);return 12.4;}
// large statue base: two steps, a block with a moulded cap and a gilt statue (or a horse-and-rider blob when o.eq)
function bigBase(g,F,x,z,y,w,d,h,o={}){g.set(2,.5);box(g,F,x,y,z,w/2+.9,.3,d/2+.9,31);box(g,F,x,y+.3,z,w/2+.45,.3,d/2+.45,31);g.set(6,.55);box(g,F,x,y+.6,z,w/2,h,d/2,31);g.set(2,.5);box(g,F,x,y+.6+h,z,w/2+.25,.3,d/2+.25,31);
  const yt=y+.9+h;if(o.eq){g.set(40,.4);box(g,F,x,yt+.9,z,d*.18,1.0,d*.42,31);box(g,F,x+d*.14,yt+1.9,z-d*.34,.28,1.1,.3,31);statue(g,F,x-.2,yt+1.8,z,1.9,true);}else statue(g,F,x,yt,z,1.9,o.gilt!==false,false);}
// a row of cypresses between two local points (y from the ground); trees go in W.trees (the instanced tree pass)
function cypRow(W,F,ax,az,bx,bz,step,gyF,sc=1){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/step));for(let i=0;i<=n;i++){const q=F.p(ax+(bx-ax)*i/n,0,az+(bz-az)*i/n);W.trees.push([q[0],gyF(q[0],q[2]),q[2],'cyp',sc*(.92+.16*((i*37)%7)/7)]);}}
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
/* Roman substructure face (phase 5b): a blind-arcade wall along a plain block wall. S = frame whose local x runs along the wall (centred on it); the existing wall face is the plane z=zf and `out` (+1/-1)
   is the local z direction that points away from the building. Between pilaster buttresses every 6-8 m: two or three storeys of recessed, darker blind arches (each with a moulded ring and sill),
   a string course per storey and a cornice on top. Storeys are counted down from yTop; a storey is drawn in a bay only while enough of it stands above the ground in front of the wall.
   o.unfinished = {x0,x1} (local x range): that stretch is left as rough block with scaffolding poles (AD 56: the Claudius precinct was still being built). */
const _subGeo={};
function _archGeo(aw,ah,depth,ring){const k=[aw.toFixed(2),ah.toFixed(2),depth,ring].join('|');if(_subGeo[k])return _subGeo[k];
  const arch=(w,h,y0,P)=>{const sp=h-w/2;P.moveTo(-w/2,y0);P.lineTo(w/2,y0);P.lineTo(w/2,sp);P.absarc(0,sp,w/2,0,Math.PI,false);P.lineTo(-w/2,y0);return P;};
  let s;if(ring){s=arch(aw+1.0,ah+.5,-.45,new THREE.Shape());s.holes.push(arch(aw,ah,0,new THREE.Path()));}else s=arch(aw,ah,0,new THREE.Shape());
  return _subGeo[k]=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:6});}
function substructure(W,g,S,L,yTop,zf,out,o={}){
  const gy=W.gy,nb=Math.max(1,Math.round(L/(o.bay||7))),bw=L/nb,hs=o.hs||9.5,pil=o.pil??2,dk=o.dark??38,Z=d=>zf+out*d,x0=-L/2,uf=o.unfinished,
    fin=x=>!(uf&&x>uf.x0&&x<uf.x1),yc=yTop-1.0;
  const gAt=(x,w=0)=>{let m=1e9;for(const dx of[-w,0,w])for(const d of[-1.5,0,2,5]){const q=S.p(x+dx,0,Z(d));m=Math.min(m,gy(q[0],q[2]));}return m;};
  const B=(cx,y0,cz,hx,h,hz,f)=>box(g,S,cx,y0-S.oy,cz,hx,h,hz,f);
  const rot=S.rot+(out<0?Math.PI:0),addX=(geo,x,y,part,seed)=>{const M=new THREE.Matrix4().makeRotationY(rot),p=S.p(x,y-S.oy,zf);M.setPosition(p[0],p[1],p[2]);g.set(part,seed);g.addGeo(geo,M);};
  for(const[ca,cb]of uf?[[x0-.4,Math.max(x0-.4,uf.x0)],[Math.min(-x0+.4,uf.x1),-x0+.4]]:[[x0-.4,-x0+.4]]){if(cb-ca<.5)continue;g.set(pil,.5);B((ca+cb)/2,yTop-1.0,Z(.6),(cb-ca)/2,1.0,.6,31&~32);B((ca+cb)/2,yTop-1.35,Z(.3),(cb-ca)/2-.2,.4,.3,31&~32);}   // cornice and its soffit course
  let nA=0;
  for(let j=0;j<nb;j++){const xa=x0+j*bw,xc=xa+bw/2,gB=gAt(xc,bw*.4);
    if(!fin(xc)){g.set(pil,.5);continue;}
    for(let k=0;k<4;k++){const yt=yc-k*hs,yb=yt-hs;if(yt<gB+2.5)break;
      const y0=Math.max(yb+.9,gB+.15),ah=yt-.9-y0,aw=Math.min(bw-2.5,6);if(ah<.5*(hs-1.8)||aw<1.8)continue;   // a storey the ground cuts to less than half is left as plain wall
      addX(_archGeo(aw,ah,.5,true),xc,y0,pil,.5);addX(_archGeo(aw,ah,.2,false),xc,y0,dk,.5);nA++;
      g.set(pil,.5);B(xc,yb-.1,Z(.2),bw/2-.55,.55,.2,31&~32);}   // string course under every storey, between the buttresses
    g.set(pil,.5);B(xc,yc-.25,Z(.2),bw/2-.55,.55,.2,31&~32);}
  for(let i=0;i<=nb;i++){const x=x0+i*bw;if(uf&&x>uf.x0+.1&&x<uf.x1-.1)continue;const b=gAt(x,.7)-1.5;g.set(pil,.5);B(x,b,Z(.35),.62,yTop-1.0-b,.35,31&~32);B(x,yc-1.1,Z(.45),.82,.55,.45,31&~32);}   // buttress pilasters with a capital
  if(uf){const xa=Math.max(x0,uf.x0),xb=Math.min(-x0,uf.x1),n=Math.max(2,Math.round((xb-xa)/2.4)),P=(x,y,d)=>S.p(x,y,Z(d));   // scaffolding: poles, ledgers, putlogs and two plank decks
    for(let i=0;i<=n;i++){const x=xa+(xb-xa)*i/n,b=gAt(x)-.4,h=yTop+2.5-b;g.set(32,.5);B(x,b,Z(1.5),.07,h,.07,31&~32);B(x,b,Z(2.9),.07,h,.07,31&~32);
      for(let l=0;l<=Math.floor(h/3.2);l++){const y=b+1.5+l*3.2;if(y>yTop+2)break;g.set(32,.4);B(x,y,Z(2.2),.04,.1,1.5,31);}}
    for(let l=0;;l++){const yy=yTop-2.3-l*3.2;const lo=gAt(xa,xb-xa)+2;if(yy<lo)break;g.set(32,.5);B((xa+xb)/2,yy,Z(1.5),(xb-xa)/2,.1,.07,31);B((xa+xb)/2,yy,Z(2.9),(xb-xa)/2,.1,.07,31);
      if(l<3){g.set(32,.2);B((xa+xb)/2,yy+.12,Z(2.2),(xb-xa)/2-.2,.05,.8,31);}}}
  return nA;}
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
  if(cw>2&&typeof reserveResidentialArea==='function'){const P=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>{const p=F.p(cx+q[0],0,cz+q[1]);return[p[0],p[2]];});reserveResidentialArea(W,P,'authored-courtyard-estate');}
  return yT;}
function tower(g,F,cx,cz,w,y0,nSt,sH,o={}){const gH=sH*1.1,yT=y0+gH+(nSt-1)*sH;
  rectWalls(g,F,cx,cz,w,w,y0-8,yT,y0,{part:o.part??0,seed:o.seed??.7,sty:7,fl:(8|4|256|32),nSt,gH,sH,lit:1});
  roof(g,F,'pyr',cx,cz,w,w,yT,24*DEG,1.3,(o.seed??.7)+.2);return yT;}

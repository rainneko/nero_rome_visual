/* ================= ROME · 公元54年的真实布局（x 向东、z 向南，单位米，原点罗马广场） ================= */
const GALBA_EAST=true; // 加尔巴仓：true=小说写的“城东”；false=史实位置（城南台伯河边，今泰斯塔乔）
const RW=1.5,RTW=56,R_EXT=[-3200,-2800,2800,3600];
const TIBER=[[-1350,-2800],[-1219,-1968],[-1000,-1600],[-912,-1390],[-1020,-1201],[-1300,-1110],[-1575,-1068],[-1666,-912],[-1741,-734],[-1700,-600],[-1567,-489],[-1400,-250],[-1235,-44],[-1036,133],[-830,165],[-630,156],[-464,300],[-490,500],[-522,667],[-688,945],[-895,1279],[-1100,1550],[-1326,1868],[-1350,2100],[-1268,2280],[-1000,2600],[-688,2836],[-564,3336],[-937,3892],[-1683,4448],[-2600,4900]];
const HILLS=[[-262,40,-205,-225,112,31],[0,280,230,320,175,36],[-640,860,-330,1150,250,33],[-60,1150,150,1350,190,24],[560,640,1250,760,200,33],[480,-40,1250,-170,210,36],[760,-480,1400,-560,175,39],[1500,-500,2700,0,620,42],[500,-760,1350,-1080,170,41],[-60,-560,900,-1520,230,43],[-650,-2050,150,-2300,330,42],[-1700,-500,-1780,1500,360,62],[-1500,2200,-1650,2700,250,28],[-2900,-1700,-2500,-1400,420,46],[360,120,430,80,110,16]];
const GALBA=GALBA_EAST?[1760,140]:[-690,1560];
// 密度图：由 3D STOA 全景图按屋顶颜色分割，再用 9 个地标做单应性映射得到（64×64，255=图外）
const DMAP=/*__DMAP__*/null,RINGD=[[0,.74],[200,.73],[600,.66],[1000,.56],[1400,.36],[1900,.18],[2600,.06],[3600,.03],[6000,.02]];
function ringD(x,z){const r=Math.hypot(x-17,z+22);for(let i=0;i<RINGD.length-1;i++){const a=RINGD[i],b=RINGD[i+1];if(r<b[0])return lerp(a[1],b[1],(r-a[0])/(b[0]-a[0]));}return .02;}
let DM=null;function dmS(k,x,z){if(!DMAP)return-1;if(!DM)DM={D:Uint8Array.from(atob(DMAP.D),c=>c.charCodeAt(0)),V:Uint8Array.from(atob(DMAP.V),c=>c.charCodeAt(0))};const a=DM[k],e=DMAP.ext,n=DMAP.n,fx=(x-e[0])/(e[2]-e[0])*n-.5,fz=(z-e[1])/(e[3]-e[1])*n-.5,i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j;let s=0,w=0;
  for(const[di,dj,ww]of[[0,0,(1-u)*(1-v)],[1,0,u*(1-v)],[0,1,(1-u)*v],[1,1,u*v]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=n||jj>=n)continue;const val=a[jj*n+ii];if(val===255)continue;s+=val/254*ww;w+=ww;}return w>.3?s/w:-1;}
const dCity=(x,z)=>{const m=dmS('D',x,z),r=ringD(x,z);return m<0?r:.6*m+.4*r;},vImg=(x,z)=>{const m=dmS('V',x,z);return m<0?0:m;};
const PADS=[[17,-22,190],[-200,560,150],[0,667,160],[200,780,150],[110,300,140],[-275,10,80],[-200,-210,45],[1350,-330,78],[-1190,2760,270],[-765,3141,170],[-1420,2450,70],[GALBA[0],GALBA[1],135],[-2429,-1134,320],[-1036,-356,170],[-448,22,90],[900,640,130],[850,-40,170],[572,200,130],[-500,-1300,120],[-895,-834,130],[-99,-143,70],[110,-235,80],[-1250,600,175],[-960,-525,75]];
const HORTI=[[1450,-380,260],[1950,-80,260],[150,-1250,300],[-300,-2150,360],[-2250,-1050,520],[-1550,1050,330],[1080,780,200]];
let PADH=null;
function segD(x,z,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;let t=((x-ax)*dx+(z-az)*dz)/l2;t=clamp(t,0,1);return Math.hypot(ax+dx*t-x,az+dz*t-z);}
function romeRaw(x,z){let h=RW+7.5+5*(fbm(x*.0011+3,z*.0011,3)-.5);const n=fbm(x*.003,z*.003,3)-.5,tv=.9+.2*fbm(x*.006+5,z*.006,2);let hm=0;
  for(const H of HILLS){const d=segD(x,z,H[0],H[1],H[2],H[3])/H[4];if(d>1.5)continue;const v=1-sstep(.38+n*.35,1.18+n*.5,d);if(v>0)hm=Math.max(hm,v*H[5]*tv);}
  return h+hm*VEX;}
function romeFar(x,z){const r=Math.hypot(x,z);let h=12+34*fbm(x*.0004,z*.0004,4)*sstep(3000,9000,r);
  h+=950*Math.exp(-(((x-14500)/6500)**2+((z-16500)/6000)**2));h+=1100*Math.exp(-(((x-26000)/5000)**2+((z+9000)/12000)**2))*(.7+.3*fbm(x*.0003,z*.0003,3));
  h+=420*Math.exp(-(((x+21000)/9000)**2+((z+15000)/7000)**2));h+=110*Math.exp(-(((x+3600)/900)**2+((z+3800)/1300)**2));return h;}
function romeH(x,z){let h=romeRaw(x,z);
  for(let i=0;i<PADS.length;i++){const p=PADS[i],d=Math.hypot(x-p[0],z-p[1]);if(d<p[2])h=lerp(h,PADH[i],1-sstep(p[2]*.7,p[2],d));}
  const e=Math.min(x-R_EXT[0],R_EXT[2]-x,z-R_EXT[1],R_EXT[3]-z);h=lerp(romeFar(x,z),h,sstep(0,600,e));
  const[rd]=polyDist(x,z,TIBER);h=lerp(RW-5,h,sstep(RTW-8,RTW+40,rd));
  const dx=x+630,dz=z-156,u=dx*.94+dz*.342,v=-dx*.342+dz*.94,ie=Math.hypot(u/138,v/30);if(ie<1.1)h=Math.max(h,lerp(RW+6.5,RW-5,sstep(.8,1.08,ie)));
  return h;}
const romeUrban=(x,z)=>1-sstep(1500,2350,Math.hypot(x-150,(z-250)*.92));
function romeHorti(x,z){let g=0;for(const b of HORTI){const d=Math.hypot(x-b[0],z-b[1])/b[2];if(d<1)g=Math.max(g,1-sstep(.6,1,d));}
  return Math.max(g,1-sstep(.4,1,segD(x,z,-1700,-500,-1780,1500)/300));}
const frB=(x,z,b,y)=>frame(x,y,z,Math.PI-b*DEG);
function retag(g,from,to,start){for(let i=start;i<g.nv;i++)if(g.b[i*4+1]===from)g.b[i*4+1]=to;}
function arch(g,S,x,hw,y0,h,z,pointed){const pts=[S.p(x-hw,y0,z),S.p(x+hw,y0,z),S.p(x+hw,y0+h,z)];
  if(pointed){pts.push(S.p(x+hw*.55,y0+h+hw*.75,z),S.p(x,y0+h+hw*1.25,z),S.p(x-hw*.55,y0+h+hw*.75,z));}else for(let k=1;k<6;k++){const a=k/6*Math.PI;pts.push(S.p(x+Math.cos(a)*hw,y0+h+Math.sin(a)*hw,z));}
  pts.push(S.p(x-hw,y0+h,z));return pts;}
function terraceRect(W,g,F,cx,cz,hx,hz,yTop,pave){let yb=1e9;for(const[sx,sz]of[[-1,-1],[1,-1],[1,1],[-1,1],[0,0],[0,-1],[0,1],[-1,0],[1,0]]){const q=F.p(cx+sx*hx,0,cz+sz*hz);yb=Math.min(yb,W.gy(q[0],q[2])-F.oy);}
  if(yTop-yb>.25){g.set(6,.36);box(g,F,cx,yb-1.5,cz,hx,yTop-yb+1.5-.03,hz,31);g.set(2,.5);box(g,F,cx,yTop-.4,cz,hx+.3,.42,hz+.3,31);}g.set(pave||11,.32);g.poly([F.p(cx-hx,yTop+.06,cz-hz),F.p(cx+hx,yTop+.06,cz-hz),F.p(cx+hx,yTop+.06,cz+hz),F.p(cx-hx,yTop+.06,cz+hz)],[0,1,0]);}
function maxGround(W,F,cx,cz,hx,hz){let m=-1e9;for(const[sx,sz]of[[-1,-1],[1,-1],[1,1],[-1,1],[0,0],[0,-1],[0,1],[-1,0],[1,0]]){const q=F.p(cx+sx*hx,0,cz+sz*hz);m=Math.max(m,W.gy(q[0],q[2]));}return m;}
function fountain(W,g,x,z,o={}){const y=o.y??W.gy(x,z),F=frame(x,y,z,o.rot||0),hx=o.hx||3,hz=o.hz||hx;let wy=.62,wx=hx-.45,wz=hz-.45,round=false;
  if(o.type==='meta'){round=true;g.set(2,.5);lathe(g,F,0,0,0,[[hx+.6,0],[hx+.6,.9],[hx+.2,.9],[hx+.2,.35],[0,.35]],28);g.set(22,.5);lathe(g,F,0,0,0,[[2.3,0],[2.1,6],[1.5,11.5],[.9,14.5],[0,15.5]],16);wx=hx+.2;}
  else if(o.type==='lacus'){g.set(2,.45);box(g,F,0,0,-.62,1.3,.85,.08,31);box(g,F,0,0,.62,1.3,.85,.08,31);box(g,F,-1.22,0,0,.08,.85,.62,31);box(g,F,1.22,0,0,.08,.85,.62,31);box(g,F,0,0,0,1.3,.12,.7,31);box(g,F,0,0,-.95,.32,1.55,.2,31);wx=1.15;wz=.55;wy=.7;}
  else{g.set(2,.48);for(const sd of[1,-1]){box(g,F,0,0,sd*(hz-.25),hx,.8,.25,31);box(g,F,sd*(hx-.25),0,0,.25,.8,hz,31);}box(g,F,0,0,0,hx,.15,hz,31);if(o.statue)pedestalStatue(g,F,0,0,0,o.statue,{gilt:false});}
  const geo=round?new THREE.CircleGeometry(wx,32):new THREE.PlaneGeometry(2*wx,2*wz);geo.rotateX(-Math.PI/2);const wm=new THREE.Mesh(geo,MAT.pool),wp=F.p(0,wy,0);wm.position.set(wp[0],wp[1],wp[2]);wm.rotation.y=F.rot;W.scene.add(wm);
  W.foot.add(x,z,Math.max(hx,1.4)+1,Math.max(hz,1)+1,F.rot);return F;}
function openPortico(W,g,F,ax,az,bx,bz,y,h,dep,step,tint,type='cor'){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),n=Math.max(1,Math.round(L/step)),S=F.sub((ax+bx)/2,0,(az+bz)/2,Math.atan2(-dz,dx)),sg=Math.sign(dep)||1;
  for(let i=0;i<=n;i++){const t=i/n;for(const off of[0,dep]){W.cols[type].push([...S.p(-L/2+L*t,y,off),S.rot,h,tint]);}}
  g.set(2,.45);box(g,S,0,y-1.4,dep/2,L/2+1.1,1.4,Math.abs(dep)/2+1.3,31);g.set(2,.5);box(g,S,0,y+h,0,L/2+.6,.9,.6,31);box(g,S,0,y+h,dep,L/2+.6,.9,.6,31);
  const yr=y+h+.9,yp=yr+Math.abs(dep)*.32;g.set(1,.4);g.poly([S.p(-L/2-.7,yr,-.8*sg),S.p(L/2+.7,yr,-.8*sg),S.p(L/2+.7,yp,dep/2),S.p(-L/2-.7,yp,dep/2)],[0,1,0]);g.poly([S.p(L/2+.7,yr,dep+.8*sg),S.p(-L/2-.7,yr,dep+.8*sg),S.p(-L/2-.7,yp,dep/2),S.p(L/2+.7,yp,dep/2)],[0,1,0]);
  g.set(2,.5);for(const ex of[-L/2-.7,L/2+.7])g.poly([S.p(ex,yr,-.8*sg),S.p(ex,yr,dep+.8*sg),S.p(ex,yp,dep/2)],S.d(Math.sign(ex),0,0));}
function colonnadeRing(W,g,F,cx,cz,w,d,y,h,walk,step,tint){const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
  for(const[ax,az,bx,bz]of[[x0,z0,x1,z0],[x1,z0,x1,z1],[x1,z1,x0,z1],[x0,z1,x0,z0]])openPortico(W,g,F,ax,az,bx,bz,y,h,walk,step,tint);}
function portico(W,g,F,ax,az,bx,bz,y,h,dep,step,tint,type='simple'){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),n=Math.max(1,Math.round(L/step));
  for(let i=0;i<=n;i++){const t=i/n;W.cols[type].push([...F.p(ax+dx*t,y,az+dz*t),F.rot,h,tint]);}
  const S=F.sub((ax+bx)/2,0,(az+bz)/2,Math.atan2(-dz,dx)),ad=Math.abs(dep);g.set(2,.45);box(g,S,0,y-12,dep/2,L/2+.7,12,ad/2+.9,31);g.set(2,.5);box(g,S,0,y+h,0,L/2+.5,.9,.6,31);
  g.set(1,.4);g.poly([S.p(-L/2-.6,y+h+.9,0),S.p(L/2+.6,y+h+.9,0),S.p(L/2+.6,y+h+.9+ad*.3,dep),S.p(-L/2-.6,y+h+.9+ad*.3,dep)],[0,1,0]);
  g.set(22,.4);box(g,S,0,y-1,dep,L/2+.6,h+2+ad*.3,.45,31);}
function basilica(g,F,o){const L=o.L,D=o.D,h1=o.h1||9.5,h2=o.h2||8,n=o.n||12,pt=o.part||6;
  g.set(2,.45);box(g,F,0,-4,0,L/2+2.5,4.6,D/2+2.5,31);for(let i=0;i<3;i++)box(g,F,0,0,D/2+2.5+i*.45+.22,L/2,.6-i*.2,.22,1|2|8|16);
  for(const s of[1,-1]){const Fa=F.sub(0,0,s*D/2,s>0?0:Math.PI);arcade(g,Fa,0,.6,0,L,h1,n,1.6,pt,{span:.3});arcade(g,Fa,0,.6+h1,0,L,h2,n,1.3,pt,{span:.27});
    const Fb=F.sub(s*L/2,0,0,s*Math.PI/2),nd=Math.max(2,Math.round(n*D/L));arcade(g,Fb,0,.6,0,D,h1,nd,1.6,pt,{span:.3});arcade(g,Fb,0,.6+h1,0,D,h2,nd,1.3,pt,{span:.27});}
  const yT=.6+h1+h2;g.set(2,.5);box(g,F,0,yT-.4,0,L/2+.6,.6,D/2+.6,31);rectWalls(g,F,0,0,L-13,D-13,.6,yT-.6,.6,{part:24,seed:.36,sty:5,fl:8|2,nSt:2,gH:h1,sH:h2,lit:.4});g.set(2,.45);box(g,F,0,.3+h1,0,L/2-.9,.3,D/2-.9,16|32);g.set(2,.42);box(g,F,0,.55,0,L/2-1,.1,D/2-1,16);g.set(5,.5);box(g,F,0,yT-.7,0,L/2-1,.1,D/2-1,32);
  roof(g,F,'hip',0,0,L,D,yT+.2,15*DEG,.9,.4);const cl={part:24,seed:.3,sty:29,fl:8|32,nSt:2,gH:1,sH:7,lit:.6};
  rectWalls(g,F,0,0,L-16,D-18,yT-2,yT+8,yT-1,cl);roof(g,F,'gable',0,0,L-16,D-18,yT+8,16*DEG,.8,.45,Object.assign({},cl,{floorY:yT-1}));}
function curia(g,F){const w=18,d=27,H=20;g.set(2,.42);box(g,F,0,-4,0,w/2+1.2,4.8,d/2+1.2,31);
  for(let i=0;i<5;i++)box(g,F,0,0,d/2+1.2+i*.5+.25,5.5,.8-i*.16,.25,1|2|8|16);
  rectWalls(g,F,0,0,w,d,.8,H,.8,{part:24,seed:.33,sty:0,fl:1,nSt:1,gH:4,sH:4,lit:0});
  g.set(13,.3);g.poly([F.p(-2,.8,d/2+.06),F.p(2,.8,d/2+.06),F.p(2,8.6,d/2+.06),F.p(-2,8.6,d/2+.06)],F.d(0,0,1));
  g.set(7,.3);for(const x of[-5,0,5])g.poly(arch(g,F,x,1.2,11.5,4,d/2+.06),F.d(0,0,1));
  g.set(2,.4);box(g,F,0,H,0,w/2+.4,.9,d/2+.4,31);const yb=H+.9,hp=(w/2+.4)*Math.tan(18*DEG);
  for(const sz of[1,-1]){g.set(24,.33,0,1);g.poly([F.p(-w/2,yb,sz*(d/2+.2)),F.p(w/2,yb,sz*(d/2+.2)),F.p(0,yb+hp-.2,sz*(d/2+.2))],F.d(0,0,sz));
    g.set(2,.4);for(const sx of[-1,1])g.poly([F.p(sx*(w/2+.6),yb,sz*(d/2+.5)),F.p(0,yb+hp+.2,sz*(d/2+.5)),F.p(0,yb+hp+.7,sz*(d/2+.5)),F.p(sx*(w/2+.6),yb+.5,sz*(d/2+.5))],F.d(0,0,sz));
    statue(g,F,0,yb+hp+.6,sz*(d/2+.4),2.4,true);}
  g.set(1,.35);for(const sx of[1,-1])g.poly([F.p(sx*(w/2+.7),yb+.3,d/2+.7),F.p(0,yb+hp+.45,d/2+.7),F.p(0,yb+hp+.45,-d/2-.7),F.p(sx*(w/2+.7),yb+.3,-d/2-.7)],F.d(sx,1,0));}
function theatre(W,g,F,o){const R=o.R,h=o.h,r0=R*.3,seg=16;g.set(26,.5);
  const Pp=(r,a,y)=>F.p(Math.cos(a)*r,y,Math.sin(a)*r);
  for(let i=0;i<seg;i++){const a0=Math.PI+i/seg*Math.PI,a1=Math.PI+(i+1)/seg*Math.PI;g.poly([Pp(r0,a0,1.2),Pp(r0,a1,1.2),Pp(R-3,a1,h-2),Pp(R-3,a0,h-2)],[0,1,0]);
    g.set(6,.3);g.poly([F.p(0,.6,0),Pp(r0,a1,.6),Pp(r0,a0,.6)],[0,1,0]);g.set(26,.5);}
  for(const a of[Math.PI,2*Math.PI]){const tx=-Math.sin(a),tz=Math.cos(a),A=Pp(r0,a,-1),B=Pp(R,a,-1),C=Pp(R,a,h-2),D=Pp(r0,a,1.2);g.set(2,.4);g.poly([A,B,C,D],F.d(tx,0,tz));g.poly([D,C,B,A],F.d(-tx,0,-tz));}
  const nS=10;for(let k=0;k<nS;k++){const a=Math.PI+(k+.5)/nS*Math.PI,len=2*R*Math.sin(Math.PI/nS/2)+.8,S=F.sub(Math.cos(a)*R,0,Math.sin(a)*R,-a-Math.PI/2);
    let yy=-2;const hs=[h*.37,h*.33,h*.30];for(let j=0;j<3;j++){arcade(g,S,0,yy,0,len,hs[j]+(j?0:2),3,3.2,2,{span:.3,pilasters:true});yy+=hs[j]+(j?0:2);}}
  rectWalls(g,F,0,9,2*R*.94,12,-2,h*.88,0,{part:24,seed:.42,sty:5,fl:8|32,nSt:3,gH:h*.3,sH:h*.28,lit:1});
  roof(g,F,'gableX',0,9,2*R*.94,12,h*.88,15*DEG,.6,.4,{part:24,seed:.42,nSt:3,gH:h*.3,sH:h*.28,floorY:0});
  g.set(2,.45);box(g,F,0,-2,4,R*.94,3,6.2,31);
  g.set(2,.5);box(g,F,0,-1,-2.2,R*.66,2.6,4.6,31);g.set(3,.42);g.poly([F.p(-R*.66,1.62,-6.8),F.p(R*.66,1.62,-6.8),F.p(R*.66,1.62,2.4),F.p(-R*.66,1.62,2.4)],[0,1,0]);
  g.set(2,.55);for(let x=-R*.6;x<=R*.6+.01;x+=R*.1)box(g,F,x,-1,-6.85,.5,2.6,.12,31);
  const y1=1.6,c1=h*.27,y2=y1+c1+1.3,c2=h*.21;for(let x=-R*.82;x<=R*.83;x+=R*.091){W.cols.cor.push([...F.p(x,y1,2.6),F.rot,c1]);W.cols.cor.push([...F.p(x,y2,2.6),F.rot,c2]);}
  g.set(2,.5);box(g,F,0,y1+c1,2.6,R*.86,1.3,1.3,31);box(g,F,0,y2+c2,2.6,R*.86,1.1,1.3,31);
  g.set(7,.2);box(g,F,0,y1,3.02,1.8,7,.06,31);for(const sd of[1,-1])box(g,F,sd*R*.32,y1,3.02,1.3,5.4,.06,31);
  for(let x=-R*.73;x<=R*.74;x+=R*.182)pedestalStatue(g,F,x,1.5,y2+.2,2.4,{gilt:false});
  g.set(1,.4);g.poly([F.p(-R*.7,h*.66,3.2),F.p(R*.7,h*.66,3.2),F.p(R*.7,h*.6,-6.6),F.p(-R*.7,h*.6,-6.6)],[0,1,0]);g.poly([F.p(R*.7,h*.66,3.2),F.p(-R*.7,h*.66,3.2),F.p(-R*.7,h*.6,-6.6),F.p(R*.7,h*.6,-6.6)],[0,-1,0]);
  const c=F.p(0,0,-R*.4+8);W.foot.add(c[0],c[2],R+4,R*.6+12,F.rot);}
function bridgeAt(g,x,z,ux,uz,len,nA,w,h,part,wood,gyF){const F=frame(x,RW-3,z,Math.atan2(-ux,-uz));if(gyF){const dk=h+.35;for(const sd of[1,-1]){const e1=F.p(sd*len/2,0,0),e2=F.p(sd*(len/2+16),0,0),gE=gyF(e1[0],e1[2])-F.oy+.35,gO=gyF(e2[0],e2[2])-F.oy+.35;if(gE<dk-.3){g.set(2,.42);box(g,F,sd*(len/2+1.6),gE-2.4,0,1.7,dk-gE+2.4,w/2,31);}const dh=dk-Math.max(gO,gE);if(dh>.4){const rl=Math.min(42,dh*7);g.set(10,.3);g.poly([F.p(sd*(len/2),dk,-w/2+.6),F.p(sd*(len/2+rl),dk-dh,-w/2+.6),F.p(sd*(len/2+rl),dk-dh,w/2-.6),F.p(sd*(len/2),dk,w/2-.6)],[0,1,0]);g.set(2,.42);box(g,F,sd*(len/2+rl/2),dk-dh-2.5,0,rl/2,dh+2.4,w/2-.5,31);}}}
  if(wood){g.set(3,.4);for(let i=-len/2;i<=len/2;i+=9)box(g,F,i,0,0,.5,h,w/2-.6,31);box(g,F,0,h,0,len/2,.6,w/2,31);}
  else{arcade(g,F,0,0,0,len,h,nA,w,part,{span:.36,attic:2.2,pilasters:false,cornice:false});g.set(10,.3);box(g,F,0,h,0,len/2,.35,w/2-.6,16);}
  g.set(2,.4);box(g,F,0,h,w/2-.4,len/2,1.1,.4,31);box(g,F,0,h,-w/2+.4,len/2,1.1,.4,31);}

function rustica(W,g,F,w,d,y0,y1,R){const floorY=y1+.15,yB=y0-2.5,cw=w-12,cd=d-12,brick=R()<.45,fac={part:brick?9:0,seed:brick?.3:.04+R()*.02,sty:3,fl:16|2,nSt:1,gH:4.2,sH:3,lit:.5},yT=floorY+4.2;
  rectWalls(g,F,0,0,w,d,yB,yT,floorY,fac);rectWalls(g,F,0,0,cw,cd,floorY,yT,floorY,Object.assign({},fac,{fl:2}),true);roof(g,F,'ring',0,0,w,d,yT,20*DEG,.5,R(),{cw,cd});
  g.set(21,.25);g.poly([F.p(-cw/2,floorY+.05,cd/2),F.p(cw/2,floorY+.05,cd/2),F.p(cw/2,floorY+.05,-cd/2),F.p(-cw/2,floorY+.05,-cd/2)],[0,1,0]);
  g.set(22,.4);lathe(g,F,cw*.22,floorY,0,[[1.4,0],[1.4,.8],[0,.8]],10);box(g,F,-cw*.22,floorY,0,.9,1.2,.9,31);
  g.set(3,.4);for(const s of[-1,1])box(g,F,w/2+3.6,floorY-1,s*d*.3,.15,3.6,.15,31);const t0=g.nv;g.set(1,R());g.poly([F.p(w/2,floorY+3.2,-d*.36),F.p(w/2,floorY+3.2,d*.36),F.p(w/2+4,floorY+2.4,d*.36),F.p(w/2+4,floorY+2.4,-d*.36)],[0,1,0]);if(R()<.5)retag(g,1,21,t0);
  g.set(22,.5);box(g,F,0,floorY-1,-d/2-9,w/2+6,1.6,.35,31);for(let i=0;i<2;i++){const q=F.p(-w/2-3,0,(i-.5)*d*.6);W.trees.push([q[0],floorY,q[2],'cyp',.9]);}}
async function buildRome(msg){
  const W=makeWorld('rome');W.farC=[0,0];W.ext=R_EXT;W.water=RW;W.poolG=new GB(1<<14);const gy=(x,z)=>W.gy(x,z);
  PADH=PADS.map(p=>romeRaw(p[0],p[1]));
  buildGrid(W,R_EXT,Q.name==='low'?320:500,romeH);
  terrainMesh(W,(x,z)=>{const u=romeUrban(x,z),g=romeHorti(x,z),[rd]=polyDist(x,z,TIBER);return[u*(1-g)*.9,g*.95,(1-u)*(1-g)*.8,1-sstep(RTW+2,RTW+30,rd)];},romeFar);
  riverMesh(W,densify(TIBER,25),RTW+4,RW,MAT.tiber);
  const fpw=(F,x,z,hw,hd,r=0)=>{const q=F.p(x,0,z);W.foot.add(q[0],q[2],hw,hd,F.rot+r);};
  const poi=(n,l,x,z,h,s0,s1,info,d)=>W.pois.push({n,l,x,z,y:gy(x,z)+h,s0:s0??0,s1:s1??99,info:info||'',d:d||3000});
  await msg('建造罗马广场与元老院……');
  /* ---- Forum Romanum ---- */
  const yF=gy(17,-22),FF=frame(17,yF,-22,-30*DEG),g=new GB(1<<16);
  g.set(11,.3);g.poly([FF.p(-64,.3,24),FF.p(64,.3,24),FF.p(64,.3,-24),FF.p(-64,.3,-24)],[0,1,0]);fpw(FF,0,0,66,26);
  {const CF=FF.sub(-76,0,-41,0),gCu=new GB(1<<13);curia(gCu,CF);const mC=gCu.mesh(MAT.city),GC=new THREE.Group();if(mC)GC.add(mC);W.scene.add(GC);W.cuProc=GC;W.cuPos=[CF.ox,CF.oy,CF.oz];W.cuRot=CF.rot;}fpw(FF,-76,-38,11,18);
  basilica(g,FF.sub(-12,0,-47,0),{L:96,D:32,n:12});fpw(FF,-12,-47,51,19);
  basilica(g,FF.sub(-8,0,47,Math.PI),{L:100,D:44,n:14});fpw(FF,-8,47,53,25);
  {const R=FF.sub(-68,0,-2,Math.PI/2);g.set(6,.4);box(g,R,0,0,0,12,3.6,6,31);g.set(13,.3);for(let i=-9;i<=9;i+=3)box(g,R,i,1.4,6.5,.4,.7,.6,31);
    g.set(2,.5);box(g,R,0,3.6,0,12.3,.4,6.3,31);honorCol(W,g,R,-8,-3,4,9);honorCol(W,g,R,8,-3,4,9);fpw(FF,-68,-2,7,13);}
  const T=(lx,lz,face,o)=>{const q=FF.p(lx,0,lz);temple(W,g,Object.assign({x:q[0],y:yF,z:q[2],rot:FF.rot+face},o));};
  T(-96,30,Math.PI/2,{W:22,L:40,podH:8,colH:11,order:'ion',nf:6,rows:2,seed:.4});
  T(-102,-13,Math.PI/2,{W:26,L:24,podH:3,colH:12,nf:6,rows:1,seed:.3});
  T(84,46,-Math.PI/2,{W:30,L:46,podH:7,colH:12.5,nf:8,rows:2,peri:true,seed:.25});
  T(76,-6,-Math.PI/2,{W:24,L:30,podH:5,colH:10,nf:6,rows:2,seed:.35});
  {const A=FF.sub(64,0,20,Math.PI/2);arcade(g,A,0,0,0,18,12,3,6,6,{span:.33,attic:3.5});statue(g,A,0,12.4,0,3.2,true);statue(g,A,-5,12.4,0,2.6,true);statue(g,A,5,12.4,0,2.6,true);fpw(FF,64,20,4,10);}
  rectWalls(g,FF,104,-14,18,12,-1,7,0,{part:22,seed:.3,sty:0,fl:1,nSt:1,gH:7,sH:4,lit:0});roof(g,FF,'gable',104,-14,18,12,7,20*DEG,.6,.3,{part:22,seed:.3,nSt:1,gH:7,sH:4,floorY:0});fpw(FF,104,-14,10,7);
  {const q=FF.p(118,0,18);tholos(W,g,{x:q[0],y:yF,z:q[2],rot:FF.rot,R:7,podH:3,colH:9,n:20,roofPart:13});fpw(FF,118,18,10,10);W.foot.addCircle(q[0],q[2],12);}
  courtBlock(W,g,FF,{cx:156,cz:40,w:64,d:26,y0:0,nSt:2,sH:4,gH:5,cw:40,cd:12,part:0,seed:.62,sty:0,fl:8|16});fpw(FF,156,40,33,14);
  for(const x of[-34,-14,6,26])honorCol(W,g,FF,x,17,0,11);pedestalStatue(g,FF,-46,-12,0,7,{gilt:true});pedestalStatue(g,FF,40,-14,0,6);
  for(const[lx,lz,t]of[[-56,19,'cyp'],[-58,-21,'broad'],[46,-22,'cyp'],[49,21,'cyp'],[-30,-23,'broad']]){const q=FF.p(lx,0,lz);W.trees.push([q[0],yF,q[2],t,.75]);}
  {const R=RNG(5);for(let i=0;i<480;i++){const lx=(R()-.5)*120,lz=(R()-.5)*42;const q=FF.p(lx,.3,lz);W.people.push([q[0],yF+.3,q[2]]);}}
  {const T2=FF.sub(-128,0,0,Math.PI/2);g.set(33,.3);box(g,T2,0,-3,-9,36,21,9,31);arcade(g,T2,0,18,-.5,72,10.5,11,4,33,{span:.3,attic:2.4});for(let k=0;k<=11;k++){g.set(2,.5);lathe(g,T2,-36+k*72/11,18.2,1.6,[[.68,0],[.68,.35],[.56,.45],[.5,8.1],[.66,8.3],[.7,8.6]],10);}g.set(2,.52);box(g,T2,0,26.8,1.9,36.4,1.7,.55,31);g.set(33,.36);for(let k=0;k<=22;k++)box(g,T2,-36+k*72/22,27.2,2.48,.32,1.1,.06,31);g.set(2,.55);box(g,T2,0,28.5,2.1,36.8,.5,.9,31);for(let k=0;k<11;k++)box(g,T2,-36+(k+.5)*72/11,24.3,1.62,.38,.9,.12,31);g.set(33,.32);box(g,T2,0,18,-12,35.6,10.5,5.6,31);g.set(2,.42);box(g,T2,0,28.2,-4.5,35.6,.3,4,48);
    rectWalls(g,T2,0,-9,72,18,28.5,37,28.5,{part:24,seed:.3,sty:1,fl:8|32|4096|8192,nSt:1,gH:8.5,sH:4,lit:.5});roof(g,T2,'hip',0,-9,72,18,37,18*DEG,.8,.3);fpw(T2,0,-5,37,14);}
  /* Forum of Caesar & Augustus */
  {const F=frame(-99,gy(-99,-143),-143,-30*DEG);g.set(11,.35);g.poly([F.p(-30,.3,30),F.p(62,.3,30),F.p(62,.3,-30),F.p(-30,.3,-30)],[0,1,0]);
    const q=F.p(-44,0,0);temple(W,g,{x:q[0],y:F.oy,z:q[2],rot:F.rot+Math.PI/2,W:28,L:34,podH:5,colH:14,nf:8,rows:2,seed:.23});
    portico(W,g,F,-28,-32,62,-32,0,7,-7,3.6,[1,.96,.9]);portico(W,g,F,62,32,-28,32,0,7,-7,3.6,[1,.96,.9]);pedestalStatue(g,F,24,0,0,7,{gilt:true});fpw(F,10,0,58,40);}
  {const F=frame(110,gy(110,-235),-235,-45*DEG);g.set(11,.35);g.poly([F.p(-44,.3,62),F.p(44,.3,62),F.p(44,.3,-10),F.p(-44,.3,-10)],[0,1,0]);
    temple(W,g,{x:F.p(0,0,-40)[0],y:F.oy,z:F.p(0,0,-40)[2],rot:F.rot,W:36,L:48,podH:4,colH:17,nf:8,rows:2,peri:true,seed:.2});
    g.set(22,.35);{const segs=[[-70,-74,-48,-80,26],[-48,-80,-20,-83,31],[-20,-83,12,-82,33],[12,-82,40,-79,30],[40,-79,70,-73,25]];for(const[ax,az,bx,bz,h]of segs){const Lw=Math.hypot(bx-ax,bz-az),S=F.sub((ax+bx)/2,0,(az+bz)/2,Math.atan2(-(bz-az),bx-ax));g.set(22,.34);box(g,S,0,-1,0,Lw/2+.4,h+1,2.2,31);g.set(2,.5);for(let yy=6;yy<h;yy+=6.5)box(g,S,0,yy,0,Lw/2+.5,.45,2.45,31);box(g,S,0,h,0,Lw/2+.6,.7,2.6,31);g.set(22,.3);for(let k=-1;k<=1;k++)box(g,S,k*Lw/3,-1,2.6,1.1,h-2,.6,31);}{const S=F.sub(-24,0,-82.4,0);g.set(7,.2);box(g,S,0,0,0,3.2,9,2.5,31);g.set(2,.55);box(g,S,0,9,0,4.2,1.2,2.7,31);}}g.set(22,.34);box(g,F,-70,-1,-50,2.2,22,24,31);box(g,F,70,-1,-50,2.2,22,24,31);g.set(2,.5);box(g,F,-70,21,-50,2.5,.7,24.3,31);box(g,F,70,21,-50,2.5,.7,24.3,31);
    portico(W,g,F,-46,-58,-46,58,0,9,-7,4,[1,.9,.72],'cor');portico(W,g,F,46,58,46,-58,0,9,-7,4,[1,.9,.72],'cor');fpw(F,0,-10,74,74);}
  W.scene.add(g.mesh(MAT.city));
  poi('元老院','Curia Julia',...(()=>{const q=FF.p(-76,0,-41);return[q[0],q[2]];})(),34,0,99,'元老在这里开会。砖墙外抹灰仿大理石，青铜大门。正文：电报从帕拉蒂尼山拉到这里（第10卷）。',1800);
  poi('罗马广场','Forum Romanum',17,-22,22,0,99,'帝国的政治中心。两侧是尤利亚巴西利卡和埃米利亚巴西利卡。',2600);
  {const q=FF.p(118,0,18);poi('维斯塔神庙','Aedes Vestae',q[0],q[2],24,0,99,'圆形神庙，供奉炉火女神，屋顶是青铜瓦。',1500);}
  {const q=FF.p(84,0,46);poi('卡斯托尔神庙','Aedes Castoris',q[0],q[2],34,0,99,'八柱科林斯神庙。',1400);}
  poi('奥古斯都广场','Forum Augusti',110,-235,40,0,99,'复仇者马尔斯神庙，背后是三十多米高的防火墙。',1800);
  await msg('建造帕拉蒂尼山皇宫……');
  /* ---- Palatine ---- */
  const gP=new GB(1<<16),PalF=(x,z)=>frame(x,gy(x,z),z,-30*DEG);
  {const F=PalF(-5,205);flushColumns(W);const gD=new GB(1<<14),DG=new THREE.Group();courtBlock(W,gD,F,{cx:0,cz:0,w:130,d:100,y0:0,nSt:3,sH:4.6,gH:5.6,cw:64,cd:44,part:24,seed:.36,sty:13,fl:8|32|4|64,garden:false});{const dm=gD.mesh(MAT.city);if(dm)DG.add(dm);}W.colGroup=DG;flushColumns(W);W.colGroup=null;W.scene.add(DG);W.dtProc=DG;W.dtPos=[F.ox,F.oy,F.oz];W.dtRot=F.rot+Math.PI;fpw(F,0,0,66,51);
    W.poolG.set(0,.5);gP.set(6,.3);box(gP,F,0,0,0,15,.6,9,31);W.poolG.poly([F.p(-14,.62,8),F.p(14,.62,8),F.p(14,.62,-8),F.p(-14,.62,-8)],[0,1,0]);pedestalStatue(gP,F,0,0,.6,5,{gilt:true});
    gP.set(23,.4);for(const[bx,bz]of[[-24,-15],[24,-15],[-24,15],[24,15],[0,-17],[0,17]])box(gP,F,bx,0,bz,3.2,1.1,1.6,31);
    for(const[tx,tz]of[[-27,0],[27,0],[-12,-17],[12,17],[-12,17],[12,-17]]){const q=F.p(tx,0,tz);W.trees.push([q[0],F.oy,q[2],'pine',.85]);}
    {const sx=-118,sz=252,rot=-30*DEG,w=34,d=28;let y0=1e9,y1=-1e9;for(const[a,b]of[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]){const yy=gy(sx+a*Math.cos(rot)+b*Math.sin(rot),sz-a*Math.sin(rot)+b*Math.cos(rot));y0=Math.min(y0,yy);y1=Math.max(y1,yy);}
      const S=frame(sx,y1+.4,sz,rot);gP.set(22,.4);box(gP,S,0,y0-y1-2.5,0,w/2+1.2,y1-y0+2.9,d/2+1.2,31);courtBlock(W,gP,S,{cx:0,cz:0,w,d,y0:0,nSt:1,sH:3.8,gH:4.6,cw:16,cd:12,part:0,seed:.17,sty:0,fl:1|64,garden:false});
      gP.set(13,.3);lathe(gP,S,2.5,0,1.5,[[.5,0],[.35,.6],[.6,.9],[.5,1]],8);gP.set(3,.4);box(gP,S,-3,0,-2,.06,2.2,.06,31);gP.set(15,.6);box(gP,S,-3,2.2,-2,.25,.4,.25,31);W.foot.add(sx,sz,w/2+1.5,d/2+1.5,rot);
      W.pomePos=[sx,S.oy,sz];for(const[a,b,t]of[[0,4,'宫殿西侧偏殿的小庭院，角落一棵石榴树。'],[5,6,'西侧偏殿的小庭院。角落一棵石榴树（第三卷《雨》）。'],[7,7,'石榴树冻死了，只剩一截黑桩。'],[8,99,'西侧偏殿的小庭院。']])W.pois.push({n:'西侧偏殿小庭院',l:'石榴树',x:sx,z:sz,y:S.oy+12,s0:a,s1:b,d:700,sub:true,info:t});}
    let yb=1e9;for(let x=-68;x<=68;x+=17)for(const zz of[-53,-57,-62]){const q=F.p(x,0,zz);yb=Math.min(yb,gy(q[0],q[2]));}const hh=F.oy-yb+1;
    if(hh>2.5){const yb0=yb-F.oy-3,H0=-yb0,nA=11,FA=F.sub(0,0,-61.3,Math.PI);gP.set(33,.5);box(gP,F,0,yb0,-57,68,H0,4,31);if(H0>15)arcade(gP,FA,0,yb0,0,136,H0-12,17,1.4,2,{span:.38,attic:1.2});const yU=Math.max(yb0,-12);arcade(gP,FA,0,yU,0,136,-yU-.2,nA,2.4,2,{span:.36,attic:1.6});gP.set(2,.52);for(let k=0;k<=nA;k++)lathe(gP,F,-68+k*136/nA,yU+.2,-62.3,[[.75,0],[.75,.35],[.6,.45],[.55,-yU-2.6],[.72,-yU-2.35],[.78,-yU-2]],10);gP.set(2,.55);box(gP,F,0,-2,-62.4,68.6,1.4,.7,31);box(gP,F,0,-.6,-57,68.8,.6,5.6,31);}gP.set(2,.5);for(let x=-66;x<=66;x+=2.4)box(gP,F,x,0,-60,.18,1.1,.18,31);{let ymin=1e9;for(let x=-66;x<=66;x+=11)for(let z=-53;z<=51;z+=13){const q=F.p(x,0,z);ymin=Math.min(ymin,gy(q[0],q[2]));}const yb1=ymin-F.oy-3;if(yb1<-1.5){gP.set(2,.5);box(gP,F,0,yb1,-1,66,-yb1,52,31);}for(const[cx,cz,rot,len]of[[-66,0,-Math.PI/2,104],[66,0,Math.PI/2,104],[0,51,0,132]]){let ym=1e9;for(let t=-len/2;t<=len/2;t+=len/8){const q=F.p(rot===0?t:cx+Math.sign(cx)*2,0,rot===0?cz+2:t);ym=Math.min(ym,gy(q[0],q[2]));}if(F.oy-ym<2.5)continue;const y0s=ym-F.oy-3,FS=F.sub(rot===0?0:cx+Math.sign(cx)*.9,0,rot===0?cz+.9:0,rot),hU=Math.min(-y0s-.2,12),yU=-hU-.2,nA=Math.max(4,Math.round(len/12));gP.set(33,.5);box(gP,FS,0,y0s,-1.1,len/2,-y0s,.7,31);if(-y0s>13)arcade(gP,FS,0,y0s,0,len,-y0s-12.4,Math.max(5,Math.round(len/9)),1.4,2,{span:.38,attic:1});arcade(gP,FS,0,yU,0,len,hU,nA,2.4,2,{span:.36,attic:1.4});gP.set(2,.52);for(let k=0;k<=nA;k++)lathe(gP,FS,-len/2+k*len/nA,yU+.2,1,[[.7,0],[.7,.3],[.56,.4],[.5,hU-2.5],[.68,hU-2.25],[.72,hU-1.9]],10);gP.set(2,.55);box(gP,FS,0,-1.8,1.05,len/2+.6,1.3,.6,31);}}}
  courtBlock(W,gP,PalF(35,318),{cx:0,cz:0,w:72,d:58,y0:0,nSt:2,sH:4.2,gH:5,cw:34,cd:24,part:0,seed:.55,sty:0,fl:8|16});W.foot.add(35,318,37,30,-30*DEG);
  {const x=95,z=382,F0=frame(x,gy(x,z),z,-30*DEG),y=maxGround(W,F0,0,2,46,46)+.3;const F=frame(x,y,z,-30*DEG);terraceRect(W,gP,F,0,2,47,47,0,34);temple(W,gP,{x,y,z,rot:-30*DEG,W:24,L:42,podH:4.5,colH:13,nf:6,rows:2,peri:true,colTint:[1,1,.97],seed:.21,pave:false});
    for(const[ax,az,bx,bz]of[[-42,-40,42,-40],[42,-40,42,44],[42,44,13,44],[-13,44,-42,44],[-42,44,-42,-40]])portico(W,gP,F,ax,az,bx,bz,0,6,-6,3.4,[1,.85,.52]);gP.set(2,.5);for(const sd of[1,-1])box(gP,F,sd*13,0,44,1.2,8.2,1.2,31);box(gP,F,0,8.2,44,14.4,1,1.6,31);gP.set(1,.42);gP.poly([F.p(-14.6,9.2,44),F.p(14.6,9.2,44),F.p(0,12.4,44)],F.d(0,0,1));W.foot.add(x,z,50,50,-30*DEG);}
  temple(W,gP,{x:-55,y:gy(-55,338),z:338,rot:-30*DEG,W:18,L:32,podH:5,colH:11,nf:6,rows:2,seed:.4});
  {const F=PalF(195,282);courtBlock(W,gP,F,{cx:0,cz:0,w:112,d:92,y0:0,nSt:3,sH:4.8,gH:6,cw:58,cd:42,part:24,seed:.83,sty:15,fl:8|32|4|256});fpw(F,0,0,57,47);
    tholos(W,gP,{x:F.ox,y:F.oy,z:F.oz,R:6.5,podH:1.6,colH:7,n:14,roofPart:12});const t0=gP.nv;tower(gP,F,64,8,15,0,5,4.4,{part:24,seed:.84});retag(gP,1,12,t0);fpw(F,64,8,9,9);{gP.set(2,.5);box(gP,F,30,15.6,-30,.6,1.4,.6,31);const E=F.sub(30,17,-30,.6);gP.set(25,.6);box(gP,E,0,0,0,.3,.45,.5,31);box(gP,E,0,.4,.42,.16,.2,.18,31);box(gP,E,0,.05,-.55,.12,.25,.2,31);box(gP,E,.55,.25,0,.6,.05,.32,31);box(gP,E,-.32,.25,0,.14,.05,.2,31);const q=F.p(30,17,-30);W.pois.push({n:'缺了翅膀的陶鹰',l:'帕拉蒂尼山屋顶',x:q[0],z:q[2],y:q[1]+3,s0:3,s1:99,d:500,sub:true,info:'屋顶上一只缺了翅膀的陶鹰。'});}}
  {const pts=[[252,232],[330,172],[420,112],[520,42],[620,-28]];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
    const F=frame(mx,gy(mx,mz),mz,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));const fac={part:24,seed:.8,sty:0,fl:512|8,nSt:2,gH:5.2,sH:4.6,lit:.8};
    rectWalls(gP,F,0,0,L-2,13,-9,9.8,0,fac);roof(gP,F,'hip',0,0,L-2,13,9.8,20*DEG,.7,.82);fpw(F,0,0,L/2,7);}}
  W.scene.add(gP.mesh(MAT.city));
  poi('帕拉蒂尼山·尼禄皇宫','Domus Transitoria',195,282,44,0,99,'尼禄的“过渡宫”，用柱廊长廊连到埃斯奎利诺山。东侧塔楼顶层是观景露台（第三卷，看见城东火球的地方）。',2600);
  poi('提比略宫','Domus Tiberiana',-5,205,30,0,99,'俯瞰罗马广场的旧皇宫，北面是巨大的拱券基座。',1800);
  poi('阿波罗神庙','Aedes Apollinis',95,382,32,0,99,'白色卢那大理石，前面是达那伊得斯柱廊。',1600);
  await msg('建造卡比托利欧山与大竞技场……');
  /* ---- Capitoline ---- */
  const gC=new GB(1<<16);
  {const x=-275,z=10,y0c=gy(x,z),PLY=[[-62,-50],[-30,-64],[30,-64],[62,-46],[72,10],[66,72],[36,92],[-22,96],[-60,78],[-72,30]];let yt=0;for(const[px,pz]of PLY)yt=Math.max(yt,gy(x+px*.8,z+pz*.8)-y0c);const y=y0c+Math.max(.15,yt-2.2);W.capPLY=PLY;W.capY=y;flushColumns(W);const gJ=new GB(1<<14),JG=new THREE.Group();temple(W,gJ,{x,y,z,rot:0,W:50,L:62,podH:5,colH:15,nf:6,rows:3,peri:true,roof:'gilt',colTint:[1,.98,.92],seed:.27});const jm=gJ.mesh(MAT.city);if(jm)JG.add(jm);W.colGroup=JG;flushColumns(W);W.colGroup=null;W.scene.add(JG);W.jomProc=JG;W.jomPos=[x,y-.8,z];
    const F=frame(x,y,z,0);
    const terrace=(P,yTop)=>{const c=P.reduce((a2,p)=>[a2[0]+p[0]/P.length,a2[1]+p[1]/P.length],[0,0]);gC.set(11,.3);
      for(let i=0;i<P.length;i++){const a2=P[i],b2=P[(i+1)%P.length];gC.poly([F.p(c[0],yTop+.08,c[1]),F.p(a2[0],yTop+.08,a2[1]),F.p(b2[0],yTop+.08,b2[1])],[0,1,0]);}
      for(let i=0;i<P.length;i++){const a2=P[i],b2=P[(i+1)%P.length],qa=F.p(a2[0],0,a2[1]),qb=F.p(b2[0],0,b2[1]),yb=Math.min(gy(qa[0],qa[2]),gy(qb[0],qb[2]),F.oy+yTop)-3;
        let nx=b2[1]-a2[1],nz=-(b2[0]-a2[0]);const mx=(a2[0]+b2[0])/2-c[0],mz=(a2[1]+b2[1])/2-c[1];if(nx*mx+nz*mz<0){nx=-nx;nz=-nz;}const nl=Math.hypot(nx,nz)||1;
        gC.set(6,.36);gC.poly([F.p(a2[0],yb-F.oy,a2[1]),F.p(b2[0],yb-F.oy,b2[1]),F.p(b2[0],yTop,b2[1]),F.p(a2[0],yTop,a2[1])],F.d(nx/nl,0,nz/nl));
        gC.poly([F.p(b2[0],yb-F.oy,b2[1]),F.p(a2[0],yb-F.oy,a2[1]),F.p(a2[0],yTop,a2[1]),F.p(b2[0],yTop,b2[1])],F.d(-nx/nl,0,-nz/nl));
        const Lw=Math.hypot(b2[0]-a2[0],b2[1]-a2[1]),S=F.sub((a2[0]+b2[0])/2,0,(a2[1]+b2[1])/2,Math.atan2(-(b2[1]-a2[1]),b2[0]-a2[0]));gC.set(2,.5);box(gC,S,0,yTop,0,Lw/2+.3,.95,.32,31);}};
    terrace(PLY,0);const LOW=[[-72,30],[-60,78],[-22,96],[-30,124],[-84,112],[-100,62]];terrace(LOW,-4.6);
    
    {const S1=F.sub(-28,0,93,Math.atan2(-.43,.9));gC.set(2,.5);for(let i=0;i<16;i++){box(gC,S1,0,-4.9,.22+i*.42,2.1,4.9-i*.29,.21,31);}for(const sd of[1,-1])box(gC,S1,sd*2.35,-4.9,3.4,.25,5.6,3.4,31);
     {const path=[[-22,96],[-30,124],[-84,112]];let seg=0,t=1.2,yT=-4.6;for(let k=0;k<140;k++){let a=path[seg],b=path[seg+1],L3=Math.hypot(b[0]-a[0],b[1]-a[1]);if(t>L3-1.4){if(seg+1>=path.length-1)break;seg++;t=1.6;a=path[seg];b=path[seg+1];L3=Math.hypot(b[0]-a[0],b[1]-a[1]);}
       const dx=(b[0]-a[0])/L3,dz=(b[1]-a[1])/L3,nx=dz,nz=-dx,px=a[0]+dx*t+nx*1.75,pz=a[1]+dz*t+nz*1.75,S=F.sub(px,0,pz,Math.atan2(dx,dz)),q=F.p(px,0,pz),gl=gy(q[0],q[2])-F.oy;if(yT<=gl+.25)break;
       const yb=gl-.6;gC.set(2,.46);box(gC,S,0,yb,0,1.35,yT-yb,.22,31);gC.set(2,.52);box(gC,S,1.5,yb,0,.2,yT-yb+.9,.22,31);t+=.42;yT-=.3;}}}
    {const yl=F.oy-4.6;for(const[lx,lz,sd]of[[-77,82,.48],[-49,98,.51]])temple(W,gC,{x:F.ox+lx,y:yl,z:F.oz+lz,rot:0,W:12,L:20,podH:2.6,colH:8,nf:6,rows:1,peri:true,seed:sd,pave:false,sculpt:false});
     const ch=new THREE.Mesh(new THREE.PlaneGeometry(4,22).rotateX(-Math.PI/2),MAT.pool);ch.position.set(F.ox-63,yl+.25,F.oz+91);ch.rotation.y=-.45;W.scene.add(ch);gC.set(2,.5);for(const sd of[1,-1])box(gC,F.sub(-63,0,91,-.45),sd*2.3,-4.9,0,.3,.6,11,31);
     poi('心智女神与厄律克斯维纳斯神庙','Aedes Mentis · Veneris Erycinae',F.ox-63,F.oz+90,14,0,99,'【史】前215年在卡比托利欧山上并排落成的两座神庙，中间只隔一道水渠（李维《罗马史》23.31）。',900);}
    temple(W,gC,{x:F.ox-48,y:F.oy,z:F.oz+40,rot:Math.PI/2,W:6,L:7,podH:1.2,colH:3.6,nf:2,rows:1,seed:.55,pave:false,sculpt:false,stairs:true});
    fountain(W,gC,F.ox+30,F.oz+66,{hx:5.2,hz:3.2,y:F.oy+.08});
    {const GF=F.sub(54,0,86,-.75);arcade(gC,GF,0,0,0,9,8.2,1,2.2,2,{span:.36,attic:1.6});}
    openPortico(W,gC,F,-30,-58,30,-58,0,6.8,6.5,3.6,[1,.97,.9]);openPortico(W,gC,F,58,-38,64,40,0,6.8,-6.5,3.6,[1,.97,.9]);
    for(const[px,pz]of PLY){const q=F.p(px*.92,0,pz*.92);W.foot.add(q[0],q[2],10,10,0);}W.foot.add(x,z+14,70,80,0);}
  {const F=frame(-275,W.capY||gy(-275,10),10,0),TS=(lx,lz,b,o)=>{const q=F.p(lx,0,lz);temple(W,gC,Object.assign({x:q[0],y:F.oy,z:q[2],rot:Math.PI-b*DEG,band:false,pave:false,altar:false,fest:false},o));return q;};
   const q1=TS(38,-18,90,{W:9,L:15,podH:3.4,colH:7,nf:4,rows:1,seed:.44}),q2=TS(38,18,90,{W:9,L:15,podH:3.4,colH:7,nf:4,rows:1,seed:.47}),q3=TS(-38,-20,270,{W:7,L:10,podH:2.8,colH:5.5,nf:4,rows:1,seed:.52,sculpt:false});
   gC.set(2,.55);box(gC,F,0,0,60,2.6,1.5,1.6,31);for(const[sx,sz]of[[-16,58],[16,58],[-28,66],[28,66],[-40,52],[40,56]])pedestalStatue(gC,F,sx,sz,0,4.5,{gilt:Math.abs(sx)<20});for(const sx of[-22,22]){const q=F.p(sx,0,78);W.cols.cor.push([q[0],F.oy,q[2],0,11,[1,.97,.9]]);pedestalStatue(gC,F,sx,78,11.4,2.6,{gilt:true});}
   for(const[tx,tz]of[[-50,46],[52,62],[-48,-40]]){const q=F.p(tx,0,tz);W.trees.push([q[0],F.oy,q[2],'cyp',.9]);}
   poi('诚信女神神庙','Aedes Fidei',q1[0],q1[2],14,0,99,'卡比托利欧山上的古老神庙，元老院有时在这里开会，墙上挂着外交条约的铜板。',900);poi('丰饶女神神庙','Aedes Opis',q2[0],q2[2],14,0,99,'奥普斯女神的神庙，凯撒曾把国库存放在这里。',900);poi('朱庇特·费雷特里乌斯神庙','Aedes Iovis Feretrii',q3[0],q3[2],12,0,99,'罗马最古老的神庙，罗慕路斯在这里献上敌将的盔甲。',900);}
  temple(W,gC,{x:-200,y:gy(-200,-210),z:-210,rot:Math.PI-135*DEG,W:20,L:32,podH:3.5,colH:10,nf:6,rows:2,seed:.5});
  W.foot.add(-200,-210,15,21,Math.PI-135*DEG);
  {const RS=RNG(41);let placed=0;
   {const vx=-232,vz=-112,vy=gy(vx,vz);if(!W.foot.hits(vx,vz,9,13,0,2)){temple(W,gC,{x:vx,y:vy,z:vz,rot:Math.PI*.5,W:12,L:18,podH:2.4,colH:7,nf:4,rows:1,seed:.46,sculpt:false});W.foot.add(vx,vz,8,11,Math.PI*.5);poi('维尤维斯神庙','Aedes Veiovis',vx,vz,14,0,99,'卡比托利欧两座山顶之间鞍部（避难所）里的小神庙。',900);}}
   {const F=frame(-252,gy(-252,-140),-140,0);gC.set(11,.34);gC.poly([F.p(-14,.1,-10),F.p(14,.1,-10),F.p(14,.1,10),F.p(-14,.1,10)],[0,1,0]);W.foot.add(-252,-140,15,11,0);}
   for(let t=0;t<520&&placed<34;t++){const x=-318+RS()*140,z=-192+RS()*132,rot=(RS()-.5)*.5,two=RS()<.6,w=8+RS()*5,d=7.5+RS()*4.5;
     if(W.foot.hits(x,z,w/2+1,d/2+1,rot,2))continue;const y=gy(x,z);if(Math.abs(gy(x+w/2,z)-gy(x-w/2,z))>4||Math.abs(gy(x,z+d/2)-gy(x,z-d/2))>4)continue;
     const F=frame(x,y,z,rot),top=two?6.6:3.8;rectWalls(gC,F,0,0,w,d,-2.5,top,0,{part:RS()<.5?0:24,seed:RS(),sty:3,fl:2|16,nSt:two?2:1,gH:3.8,sH:2.8,lit:.6});roof(gC,F,'gable',0,0,w+.8,d+.8,top,24*DEG,.4,RS());W.foot.add(x,z,w/2+.9,d/2+.9,rot);placed++;}
   W.capSaddle=placed;}
  poi('卡比托利欧山·朱庇特神庙','Iuppiter Optimus Maximus',-275,10,48,0,99,'罗马最神圣的神庙。高台基，正面六柱、三排，三间内殿。神庙立在顺着山顶地形砌出来的多边形平台上，平台边是挡土墙。',3500);
  /* ---- Circus Maximus ---- */
  const yC=gy(0,667),CF=frame(0,yC,667,-29*DEG);W.circF=CF;
  {const P=(x,z,y=.25)=>CF.p(x,y,z);gC.set(27,.5);gC.poly([P(-268,40),P(222,40),P(222,-40),P(-268,-40)],[0,1,0]);
    for(let i=0;i<12;i++){const a0=-Math.PI/2+i/12*Math.PI,a1=-Math.PI/2+(i+1)/12*Math.PI;gC.poly([P(222,0),P(222+Math.cos(a0)*40,Math.sin(a0)*40),P(222+Math.cos(a1)*40,Math.sin(a1)*40)],[0,1,0]);}
    gC.set(6,.4);box(gC,CF,-23,0,0,168,1.7,4.6,31);lathe(gC,CF,-23,1.7,0,[[2,0],[2,4.5],[1.7,4.5],[1.4,4.8],[1.05,26],[0,28.5]],4,25);
    for(const mx of[-191,145]){gC.set(6,.4);box(gC,CF,mx,0,0,3.2,1.8,4.8,31);for(const mz of[-2,0,2])lathe(gC,CF,mx,1.8,mz,[[1.1,0],[1,1],[.5,6.2],[0,7.2]],10,28);}
    for(let i=0;i<6;i++){const x=-155+i*26+(i>2?50:0);pedestalStatue(gC,CF,x,0,1.7,5,{gilt:i%2===0});}
    for(const s of[1,-1]){gC.set(26,.5);gC.poly([P(-268,s*42,3),P(222,s*42,3),P(222,s*80,26),P(-268,s*80,26)],[0,1,0]);gC.set(6,.4);gC.poly([P(-268,s*41.5,0),P(222,s*41.5,0),P(222,s*41.5,3),P(-268,s*41.5,3)],CF.d(0,0,-s));
      const Fa=CF.sub(-23,0,s*82,s>0?0:Math.PI);arcade(gC,Fa,0,-2,0,490,12,35,4,2,{span:.3});arcade(gC,Fa,0,10,0,490,9,35,3.4,2,{span:.28});arcade(gC,Fa,0,19,0,490,8,35,3,2,{span:.26});}
    for(let i=0;i<12;i++){const a0=-Math.PI/2+i/12*Math.PI,a1=-Math.PI/2+(i+1)/12*Math.PI,Q2=(r,a,y)=>CF.p(222+Math.cos(a)*r,y,Math.sin(a)*r);gC.set(26,.5);gC.poly([Q2(42,a0,3),Q2(42,a1,3),Q2(80,a1,26),Q2(80,a0,26)],[0,1,0]);}
    for(let k=0;k<8;k++){const a=-Math.PI/2+(k+.5)/8*Math.PI,S=CF.sub(222+Math.cos(a)*82,0,Math.sin(a)*82,-a-Math.PI/2),len=2*82*Math.sin(Math.PI/16)+1;
      arcade(gC,S,0,-2,0,len,12,3,4,2,{span:.3});arcade(gC,S,0,10,0,len,9,3,3.4,2,{span:.28});arcade(gC,S,0,19,0,len,8,3,3,2,{span:.26});}
    {const CW=CF.sub(-277,0,0,0);rectWalls(gC,CW,0,0,14,168,-2,15,0,{part:24,seed:.62,sty:9,fl:8|32|128|2,nSt:2,gH:8.5,sH:6.5,lit:1});gC.set(2,.5);box(gC,CW,0,15,0,7.6,.7,84.6,31);
      gC.set(2,.48);for(let z=-82;z<=82;z+=2.6)box(gC,CW,-6.6,15.7,z,.16,1,.16,31);
      gC.set(7,.3);const SA=CW.sub(7.06,0,0,Math.PI/2);for(let i=0;i<12;i++){const z=-66+i*12;if(Math.abs(z)<8)continue;gC.poly(arch(gC,SA,z,4,0,6.2,0),SA.d(0,0,1));}
      rectWalls(gC,CW,-1,0,16,30,-2,22,0,{part:24,seed:.6,sty:9,fl:8|32|128,nSt:3,gH:8.5,sH:6.8,lit:1});roof(gC,CW,'gableX',-1,0,17,31,22,22*DEG,.4,.5,{part:24,seed:.6,nSt:3,gH:8.5,sH:6.8,floorY:0});
      gC.set(2,.5);box(gC,CW,-10.8,8.2,0,1.8,.5,14,31);for(let z=-12;z<=12;z+=4.8){const q=CW.p(-11,8.7,z);W.cols.simple.push([q[0],q[1],q[2],0,7.4,[1,.97,.92]]);}gC.set(2,.48);box(gC,CW,-11,16.1,0,1.4,.9,14.2,31);
      for(const s of[1,-1]){rectWalls(gC,CW,0,s*86,16,16,-2,24,0,{part:24,seed:.58,sty:1,fl:8|32,nSt:3,gH:8.5,sH:7.5,lit:1});gC.set(2,.5);box(gC,CW,0,24,s*86,8.4,.6,8.4,31);gC.set(24,.58,0,1);
        for(let t=-7;t<=7.1;t+=2.33){box(gC,CW,t,24.6,s*86+7.7,.5,1.2,.3,31);box(gC,CW,t,24.6,s*86-7.7,.5,1.2,.3,31);box(gC,CW,7.7,24.6,s*86+t,.3,1.2,.5,31);box(gC,CW,-7.7,24.6,s*86+t,.3,1.2,.5,31);}
        rectWalls(gC,CW,-2,s*46,14,20,-2,18,0,{part:24,seed:.6,sty:9,fl:8|32|128,nSt:2,gH:8.5,sH:8,lit:1});roof(gC,CW,'gableX',-2,s*46,15,21,18,24*DEG,.4,.5,{part:24,seed:.6,nSt:2,gH:8.5,sH:8,floorY:0});statue(gC,CW,-9.5,18.6,s*46,2.6,true);}
      statue(gC,CW,-9.4,26.5,0,3.4,true);}
    const q=CF.p(10,14,-60);temple(W,gC,{x:q[0],y:q[1],z:q[2],rot:CF.rot,W:12,L:8,podH:1,colH:6,nf:4,rows:1,stairs:false,sculpt:false,seed:.6});
    for(const s of[1,-1]){gC.set(2,.4);gC.poly([P(-268,s*42,0),P(-268,s*84,0),P(-268,s*84,27),P(-268,s*42,3)],CF.d(-1,0,0));}
    {const GE=CF.sub(306,0,0,0);rectWalls(gC,GE,0,0,14,40,-2,31,0,{part:24,seed:.6,sty:1,fl:8|32|128|1,nSt:3,gH:12,sH:9.5,lit:1});gC.set(2,.5);box(gC,GE,0,31,0,7.6,.8,20.6,31);gC.set(24,.6,0,1);box(gC,GE,0,31.8,0,6.4,4,17,31);
      gC.set(7,.3);for(const s of[1,-1]){const S=GE.sub(s*6.06,0,0,s>0?Math.PI/2:-Math.PI/2);gC.poly(arch(gC,S,0,5,0,15,0),S.d(0,0,1));}statue(gC,GE,0,35.8,0,4.6,true);for(const s of[-1,1])statue(gC,GE,0,35.8,s*12,3.4,true);}
    for(const s of[1,-1])portico(W,gC,CF,-268,s*77,222,s*77,24,6.5,s*5,3.6,[1,.96,.9]);
    for(const x of[-120,95]){const q=CF.p(x,1.7,0);tholos(W,gC,{x:q[0],y:q[1],z:q[2],R:2.6,podH:.8,colH:4,n:8,roofPart:13});}
    W.foot.add(0,667,310,94,CF.rot);}
  W.scene.add(gC.mesh(MAT.city));
  poi('大竞技场','Circus Maximus',0,667,40,0,99,'十五万人的赛车场。第一卷：朱红热气球在这里升空；55年冬的战车赛。',3000);
  await msg('建造埃斯奎利诺山学园与战神广场……');
  /* ---- Esquiline academy ---- */
  const gA=new GB(1<<15),AF=frB(1350,-330,200,gy(1350,-330));W.AF=AF;
  courtBlock(W,gA,AF,{cx:0,cz:-22,w:46,d:36,y0:0,nSt:2,sH:3.8,gH:4.6,cw:22,cd:16,part:0,seed:.16,sty:5,fl:1|64|8});
  gA.set(2,.5);for(const[cx,cz,hx,hz]of[[0,9.4,10.6,.6],[0,18.6,10.6,.6],[-10,14,.6,4],[10,14,.6,4]])box(gA,AF,cx,0,cz,hx,.7,hz,31);gA.set(23,.4);box(gA,AF,0,-1,14,9.4,.6,4,16);
  pedestalStatue(gA,AF,15,14,0,6.5);for(const s of[-1,1]){const q=AF.p(s*11,0,40);W.trees.push([q[0],gy(q[0],q[2]),q[2],'pine',1.85]);}
  {const q=AF.p(0,0,44);W.pois.push({n:'青铜规矩柱',l:'帝国阿波罗大学堂',x:q[0],z:q[2],y:AF.oy+12,s0:0,s1:99,ch0:7,d:700,sub:true,info:'第7章：大门外立起一根青铜柱，刻着新的规矩。门口两棵很老的伞松，树冠铺开，像两把撑着的伞（第4章）。'});}
  gA.set(0,.16,0,1|64);box(gA,AF,-15,-1,38,9,3.2,.5,31);box(gA,AF,15,-1,38,9,3.2,.5,31);fpw(AF,0,0,30,48);W.scene.add(gA.mesh(MAT.city));
  poi('埃斯奎利诺山·帝国学园','Horti Maecenatiani',1350,-330,30,0,99,'最初的学园是一座废弃的元老宅邸，夹在民房中间。门口两棵老伞松，楼前是长满青苔的干水池和断手女神像。57年学生2000人，第一期金边 Master 23人；58年起陆续迁往城东新校区。',2600);
  /* ---- Campus Martius ---- */
  const gM=new GB(1<<16);
  temple(W,gM,{x:-696,y:gy(-696,-734),z:-734,rot:Math.PI,W:32,L:42,podH:2.5,colH:12.5,nf:8,rows:2,seed:.3});
  {const F=frame(-740,gy(-740,-650),-650,0);rectWalls(gM,F,0,0,90,56,-2,23,0,{part:9,seed:.4,sty:25,fl:8,nSt:2,gH:9,sH:7,lit:.7});roof(gM,F,'hip',0,0,90,56,23,16*DEG,.8,.4);
    gM.set(9,.4,0,1);lathe(gM,F,0,0,-40,[[13,-2],[13,19]],20);lathe(gM,F,0,19,-40,[[13.6,0],[11,5],[6,9],[0,10]],20,16);W.foot.add(-740,-660,47,44,0);}
  {const F=frame(-540,gy(-540,-760),-760,0);gM.set(22,.4);for(const s of[1,-1]){box(gM,F,s*47,-1,0,1,11,150,31);box(gM,F,0,-1,s*150,47,11,1,31);}
    portico(W,gM,F,-40,-145,-40,145,0,8,-6,5,[1,.97,.9]);portico(W,gM,F,40,145,40,-145,0,8,-6,5,[1,.97,.9]);W.foot.add(-540,-760,49,152,0);}
  {const F=frB(-1036,-356,90,gy(-1036,-356));theatre(W,gM,F,{R:78,h:30});const q=F.p(0,28,-72);temple(W,gM,{x:q[0],y:q[1],z:q[2],rot:F.rot,W:16,L:20,podH:1.5,colH:8,nf:6,rows:1,seed:.4});
    for(const[ax,az,bx,bz]of[[-62,20,-62,190],[62,190,62,20],[-62,190,62,190]])portico(W,gM,F,ax,az,bx,bz,0,7,6,4,[1,.97,.9]);
    const R=RNG(9);for(let i=0;i<60;i++){const q2=F.p((R()-.5)*100,0,40+R()*140);W.trees.push([q2[0],gy(q2[0],q2[2]),q2[2],'broad',.8+R()*.3]);}fpw(F,0,105,66,90);
    W.pompey=F;}
  theatre(W,gM,frB(-448,22,240,gy(-448,22)),{R:62,h:32});W.octPos=[-590,-44];W.foot.add(-590,-44,60,52,0);theatre(W,gM,frB(-812,-167,100,gy(-812,-167)),{R:44,h:22});
  {const F=frame(-730,gy(-730,-1557),-1557,0);gM.set(6,.3);lathe(gM,F,0,-2,0,[[44,0],[44,14],[38,14]],36);gM.set(23,.5);lathe(gM,F,0,12,0,[[38,0],[30,10],[20,18],[12,23]],36);
    gM.set(6,.3);lathe(gM,F,0,34,0,[[12,0],[12,10],[0,10]],20);statue(gM,F,0,44,0,7,true);for(let i=0;i<24;i++){const a=i/24*TAU;W.trees.push([F.ox+Math.cos(a)*34,F.oy+20,F.oz+Math.sin(a)*34,'cyp',1]);}
    for(const s of[1,-1])lathe(gM,F,s*14,0,54,[[1.3,0],[1,14],[0,15.4]],4,25);W.foot.addCircle(-730,-1557,60);}
  {const F=frame(-610,gy(-610,-1000),-1000,0);gM.set(11,.3);lathe(gM,F,0,.2,0,[[70,0],[0,0]],24);lathe(gM,F,0,0,0,[[1.6,0],[1.4,20],[0,22]],4,25);
    rectWalls(gM,F,-30,-30,11,10,0,5,0,{part:6,seed:.5,sty:0,fl:1,nSt:1,gH:5,sH:4});W.foot.addCircle(-610,-1000,72);}
  
  for(const[x,z]of[[-790,-310],[-765,-330],[-740,-350]])temple(W,gM,{x,y:gy(x,z),z,rot:Math.PI/2,W:12,L:18,podH:2,colH:8,nf:4,rows:1,seed:.5,sculpt:false});
  tholos(W,gM,{x:-340,y:gy(-340,378),z:378,R:7.5,podH:1.5,colH:10,n:20});temple(W,gM,{x:-373,y:gy(-373,311),z:311,rot:Math.PI/2+.3,W:12,L:24,podH:2.5,colH:8.5,order:'ion',nf:4,rows:2,seed:.5});
  W.foot.add(-620,-100,160,52,0);
  {const F=frame(900,gy(900,640),640,0);gM.set(22,.4);box(gM,F,0,-14,0,90,14,100,31);arcade(gM,F.sub(-91,0,0,-Math.PI/2),0,-14,0,200,14,14,3,22,{span:.32});
    temple(W,gM,{x:900,y:F.oy,z:640,rot:Math.PI/2,W:30,L:44,podH:4,colH:14,nf:8,rows:2,peri:true,seed:.3});for(const[ax,az,bx,bz]of[[-80,-90,80,-90],[80,90,-80,90]])portico(W,gM,F,ax,az,bx,bz,0,7,-6,4,[1,.97,.9]);W.foot.add(900,640,94,104,0);}
  {const F=frame(1550,gy(1550,-1557),-1557,0);gM.set(9,.4,0,1);for(const s of[1,-1]){box(gM,F,s*220,-2,0,2,9,190,31);box(gM,F,0,-2,s*190,220,9,2,31);}
    for(let x=-200;x<=200;x+=40)for(let z=-170;z<=170;z+=34){rectWalls(gM,F,x,z,32,9,-1,4.5,0,{part:9,seed:.3,sty:0,fl:2,nSt:1,gH:4.5,sH:4});roof(gM,F,'gable',x,z,32,9,4.5,20*DEG,.4,.4,null);}W.foot.add(1550,-1557,224,194,0);}
  {const F=frame(-2429,gy(-2429,-1134),-1134,0);gM.set(27,.5);gM.poly([F.p(-250,.25,36),F.p(250,.25,36),F.p(250,.25,-36),F.p(-250,.25,-36)],[0,1,0]);gM.set(6,.4);box(gM,F,0,0,0,150,1.5,4,31);
    lathe(gM,F,0,1.5,0,[[1.8,0],[1.5,24],[0,26]],4,25);for(const s of[1,-1]){gM.set(26,.5);gM.poly([F.p(-250,3,s*38),F.p(250,3,s*38),F.p(250,9,s*50),F.p(-250,9,s*50)],[0,1,0]);gM.set(3,.4);box(gM,F,0,-1,s*51,250,10,1,31);}for(const s of[1,-1])for(const e of[-250,250]){gM.set(3,.4);gM.poly([F.p(e,-1,s*38),F.p(e,-1,s*51.5),F.p(e,9,s*51.5),F.p(e,3,s*38)],F.d(Math.sign(e),0,0));}W.foot.add(-2429,-1134,260,60,0);W.vatF=F;}
  poi('庞培剧场','Theatrum Pompei',-1036,-356,40,0,99,'罗马第一座石砌剧场。第11卷：四百片锌铜电堆点亮电弧灯。',2600);
  poi('马塞卢斯剧场','Theatrum Marcelli',-448,22,40,0,99,'三层拱廊立面的剧场。',1600);
  poi('阿格里帕万神殿','Pantheon',-696,-734,30,0,99,'公元54年还是长方形门廊神庙。哈德良的圆顶万神殿约125年才建成。',1800);
  poi('奥古斯都陵','Mausoleum Augusti',-730,-1557,50,0,99,'圆形陵墓，土丘上种着柏树。',2200);
  poi('战神广场','Campus Martius',-800,-1050,20,0,99,'平坦的大平原，第7卷尼禄在旁边修大浴场，第10卷北面开军校。',3500);
  poi('克劳狄神庙','Templum Divi Claudii',900,640,30,0,99,'阿格里皮娜在54年后开始修建。',1800);
  poi('禁卫军营','Castra Praetoria',1550,-1557,20,0,99,'禁卫军驻地。',2600);
  poi('梵蒂冈跑马场','Circus Gai et Neronis',-2429,-1134,30,0,99,'尼禄的私人赛车场，中轴立着方尖碑。57年看台加三层。',3000);
  await msg('架桥、引水、铺路……');
  /* ---- Tiber island, bridges ---- */
  {const ux=.94,uz=.342,lx=.342,lz=-.94,cx=-630,cz=156,y=gy(cx,cz);const q=[cx+ux*55,cz+uz*55];
    temple(W,gM,{x:q[0],y,z:q[1],rot:Math.atan2(-ux,-uz)+Math.PI/2,W:14,L:22,podH:2,colH:8,nf:6,rows:1,seed:.5});
    const F=frame(cx,y,cz,Math.atan2(-uz,ux));lathe(gM,F,-20,0,0,[[1.3,0],[1,14],[0,15.4]],4,25);gM.set(2,.4);
    gM.poly([F.p(126,-4,-22),F.p(150,-4,0),F.p(150,3,0),F.p(126,3,-22)],F.d(.7,0,-.7));gM.poly([F.p(150,-4,0),F.p(126,-4,22),F.p(126,3,22),F.p(150,3,0)],F.d(.7,0,.7));
    bridgeAt(gM,cx-ux*25+lx*46,cz-uz*25+lz*46,ux,uz,52,2,9,11,2,false,gy);bridgeAt(gM,cx+ux*20-lx*46,cz+uz*20-lz*46,ux,uz,52,1,9,11,2,false,gy);}
  const brT=(t,len,nA,w,wood)=>{const[x,z]=polyAt(TIBER,t);const i=Math.floor(t),a=TIBER[i],b=TIBER[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);bridgeAt(gM,x,z,(b[0]-a[0])/l,(b[1]-a[1])/l,len,nA,w,12,2,wood,gy);};
  brT(16.15,150,5,12);brT(16.9,150,0,10,true);brT(12.0,150,5,11);brT(7.1,150,5,12);brT(13.02,150,5,11);{const q=polyAt(TIBER,13.02);poi('阿格里帕桥','Pons Agrippae',q[0],q[1],16,0,99,'【史】阿格里帕修的石桥，连接战神广场和台伯河西岸。',1400);}
  poi('台伯岛','Insula Tiberina',-630,156,24,0,99,'船形小岛，岛上是医神埃斯库拉庇乌斯神庙，岛头砌成船首。',1600);
  {const q=polyAt(TIBER,7.1);poi('尼禄桥','Pons Neronianus',q[0],q[1],18,0,99,'通往梵蒂冈跑马场的桥。',1800);}
  poi('台伯河','Tiberis',-1650,-760,12,0,99,'',4500);
  /* ---- aqueduct (Aqua Claudia + Arcus Neroniani) ---- */
  if(!MAT.aqWater)MAT.aqWater=waterMat('aqueduct',[.035,.17,.21],.12);const aqStrip=(grp,F,sl,h)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(sl+.3,1.5).rotateX(-Math.PI/2),MAT.aqWater),q=F.p(0,h+3.64,0);m.position.set(q[0],q[1],q[2]);m.rotation.y=F.rot;grp.add(m);};const aqS=new THREE.Group(),aqL=new THREE.Group();
  {const gAq=new GB(1<<15);const P=[[2790,-60],[2545,56],[2200,180],[1800,330],[1400,520],[1100,620],[994,632]];let top=97;
    for(let i=0;i<P.length-1;i++){const gQ=i>=1?gAq:gM;const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/66);
      for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,x0=lerp(a[0],b[0],t0),z0=lerp(a[1],b[1],t0),x1=lerp(a[0],b[0],t1),z1=lerp(a[1],b[1],t1),mx=(x0+x1)/2,mz=(z0+z1)/2,sl=L/n;
        let gmin=1e9;for(let j=0;j<=4;j++)gmin=Math.min(gmin,gy(lerp(x0,x1,j/4),lerp(z0,z1,j/4)));top-=sl*.004;const h=Math.max(8,top-gmin);
        const F=frame(mx,gmin-2,mz,Math.atan2(-(z1-z0),x1-x0));if(h>32){const h1=h*.56;arcade(gQ,F,0,0,0,sl+.3,h1+2,Math.max(2,Math.round(sl/10)),6,22,{span:.33,attic:3,pilasters:false});arcade(gQ,F,0,h1+2,0,sl+.3,h-h1,Math.max(3,Math.round(sl/7)),4.6,22,{span:.3,attic:2.6,pilasters:false,cornice:false});}else arcade(gQ,F,0,0,0,sl+.3,h+2,Math.max(2,Math.round(sl/10)),5.5,22,{span:.33,attic:3.4,pilasters:false});
        gQ.set(14,.4);box(gQ,F,0,h+2,0,sl/2+.2,1.6,2.9,31);gQ.set(22,.45);for(const sd of[1,-1])box(gQ,F,0,h+3.6,sd*1.08,sl/2+.2,.55,.3,31);aqStrip(i>=1?aqL:aqS,F,sl,h);W.foot.add(mx,mz,sl/2,4,F.rot);}}
    W.aqTop=top;
    {const Ys=top,PB=[[994,632],[950,705],[815,735],[660,660],[505,575],[372,500],[305,430],[262,382]],Ye=gy(262,382)+10;let acc=0,tot=0;for(let i=0;i<PB.length-1;i++)tot+=Math.hypot(PB[i+1][0]-PB[i][0],PB[i+1][1]-PB[i][1]);
     for(let i=0;i<PB.length-1;i++){const a=PB[i],b=PB[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/52);for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,x0=lerp(a[0],b[0],t0),z0=lerp(a[1],b[1],t0),x1=lerp(a[0],b[0],t1),z1=lerp(a[1],b[1],t1),mx=(x0+x1)/2,mz=(z0+z1)/2,sl=L/n;
       let gmin=1e9;for(let j=0;j<=4;j++)gmin=Math.min(gmin,gy(lerp(x0,x1,j/4),lerp(z0,z1,j/4)));const Yt=lerp(Ys,Ye,(acc+sl*(k+.5))/tot),h=Math.max(8,Yt-gmin),F=frame(mx,gmin-2,mz,Math.atan2(-(z1-z0),x1-x0));
       if(h>30){const h1=h*.55;arcade(gAq,F,0,0,0,sl+.3,h1+2,Math.max(2,Math.round(sl/10)),6,9,{span:.33,attic:3,pilasters:false});arcade(gAq,F,0,h1+2,0,sl+.3,h-h1,Math.max(3,Math.round(sl/7)),4.6,9,{span:.3,attic:2.6,pilasters:false,cornice:false});}
       else arcade(gAq,F,0,0,0,sl+.3,h+2,Math.max(2,Math.round(sl/10)),5.5,9,{span:.33,attic:3.4,pilasters:false});gAq.set(14,.4);box(gAq,F,0,h+2,0,sl/2+.2,1.6,2.9,31);gAq.set(22,.45);for(const sd of[1,-1])box(gAq,F,0,h+3.6,sd*1.08,sl/2+.2,.55,.3,31);aqStrip(aqL,F,sl,h);W.foot.add(mx,mz,sl/2,4,F.rot);}acc+=L;}}
    {const cx=258,cz=377,cy=gy(cx,cz),CF=frame(cx,cy,cz,Math.atan2(-(382-430),262-305));gAq.set(9,.5);box(gAq,CF,0,-2,0,5.5,(gy(262,382)+10)-cy+5.5,5.5,31);gAq.set(2,.55);box(gAq,CF,0,(gy(262,382)+10)-cy+3.5,0,6,.6,6,31);roof(gAq,CF,'pyr',0,0,11.4,11.4,(gy(262,382)+10)-cy+4.1,24*DEG,.4,.5);
      gAq.set(2,.48);for(const sd of[1,-1]){box(gAq,CF,-9,0,sd*5.6,4,.8,.3,31);}box(gAq,CF,-13,0,0,.3,.8,5.6,31);const wb=new THREE.Mesh(new THREE.PlaneGeometry(7.6,10.6).rotateX(-Math.PI/2),MAT.pool),wp=CF.p(-9,.6,0);wb.position.set(wp[0],wp[1],wp[2]);wb.rotation.y=CF.rot;W.aqBasin=wb;
      poi('配水塔','Castellum',cx,cz,22,7,99,'水渠的终点：分水塔把水分进宫里的水池和浴室。',900);}
    {const m=gAq.mesh(MAT.city),G2=new THREE.Group();if(m)G2.add(m);G2.name='arcusNero';if(W.aqBasin)G2.add(W.aqBasin);G2.add(aqL);W.scene.add(aqS);G2.userData.rise=0;G2.visible=false;W.scene.add(G2);(W.preLayers=W.preLayers||{}).arcusNero=G2;}
    poi('尼禄拱渠','Arcus Neroniani',1400,520,46,7,99,'【史】64年大火后，尼禄从克劳狄水渠在大门附近分出一条约两公里的砖拱水渠，送水到克劳狄神庙台地东侧的水景墙和金宫的人工湖。',3200);
    poi('跨谷水桥','通往帕拉蒂尼山',660,660,52,7,99,'【史】从西里欧山跨过山谷通到帕拉蒂尼山的这段水桥，多数资料记为图密善所建，也有学者认为始于尼禄。【书中】尼禄活着，水送到了宫里。',2400);
    const F=frame(2545,gy(2545,56),56,Math.atan2(-116,-245)+Math.PI/2);arcade(gM,F,0,-1,0,44,28,2,16,2,{span:.3,attic:9});}
  poi('克劳狄水渠','Aqua Claudia',2650,0,50,0,99,'【史】52年通水，从东边在大门（今马焦雷门）一带进城。',3500);
  W.scene.add(gM.mesh(MAT.city));
  /* ---- roads ---- */
  const gR=new GB(1<<15);
  roads(W,[[9,[[-20,-60],[60,-20],[140,10],[240,40],[380,92],[520,180],[700,200]]],[7,[[45,40],[-40,250],[-150,480]]],[10,[[330,520],[555,890],[900,1500],[1500,2600],[2000,3500]]],
    [10,[[-500,560],[-640,1100],[-600,1700],[-500,2400],[-440,2950],[-520,3600]]],[12,[[-200,-280],[-480,-1100],[-720,-2300],[-900,-2800]]],
    [8,[[-20,-120],[300,-300],[700,-430],[1100,-330],[1600,-500],[2600,-800]]],[9,[[700,200],[1100,250],[1800,150],[2545,56],[2800,0]]],
    [7,[[150,-200],[500,-600],[900,-1000],[1200,-1300]]],[7,[[100,-500],[500,-1000],[900,-1500]]],[8,[[-1036,133],[-1300,300],[-1650,600],[-2400,800]]],
    [7,[[-1235,-44],[-1400,-200],[-1650,-450]]],[7,[[-1666,-912],[-2000,-1000],[-2400,-1150]]],[7,[[-1100,2700],[-1400,2200],[-1450,1500],[-1350,1000]]]],gR);
  W.scene.add(gR.mesh(MAT.city,false));
  /* ---- reserved open land (novel sites, gardens) ---- */
  for(const[x,z,r]of[[1350,-330,170],[-1190,2760,280],[-765,3141,175],[-1420,2450,80],[GALBA[0],GALBA[1],100],[-500,-1300,120],[1640,-60,120],[195,282,40]])W.foot.addCircle(x,z,r);W.foot.add(-895,-834,184,96,0);
  for(const p of densify([[-640,1450],[-560,1900],[-470,2400],[-430,2900],[-470,3300],[-560,3580]],18))W.foot.addCircle(p[0],p[1],7);
  for(const[x,z,r]of[[-480,940,7],[-470,2520,7],[-560,3480,7],[-1460,2380,7],[-660,1430,26],[430,140,10]])W.foot.addCircle(x,z,r);W.foot.add(850,-40,142,26,Math.PI-190*DEG);
  {const x=-356,z=1735,y=gy(x,z),F=frame(x,y,z,Math.PI/4+.1),gX=new GB(1<<13);gX.set(6,.3);lathe(gX,F,0,-2,0,[[21.5,0],[0,38.5]],4);W.foot.addCircle(x,z,26);
    poi('塞斯提乌斯金字塔','Pyramis Cestii',x,z,42,0,99,'约公元前12年的大理石金字塔墓，在奥斯提亚大道旁。',2500);
    const C=frB(-1280,180,90,gy(-1280,180));courtBlock(W,gX,C,{cx:0,cz:0,w:36,d:30,y0:0,nSt:2,sH:3.6,gH:4.4,cw:16,cd:12,part:0,seed:.66,sty:16,fl:8|2,peristyle:false,garden:false});gX.set(3,.4);box(gX,C,0,5,15.3,3,1,.12,31);W.foot.add(-1280,180,19,16,C.rot);
    poi('公社抚恤所','渔夫西蒙 · 第22章',-1280,180,22,2,99,'台伯河西岸的旧院落，挂着阿波罗神机公社的木牌，墙角画着两条交错弧线的白垩小鱼。渔夫西蒙（彼得）每天在这里用粗肥皂和麦芽糖渣救济穷人。',1500);{const F=frB(-440,215,120,gy(-440,215)),R2=RNG(8);W.foot.add(-440,215,34,22,F.rot);for(let i=0;i<20;i++){const S=F.sub(-28+(i%7)*9,0,-14+Math.floor(i/7)*12,0);gX.set(3,.4);for(const[a,b]of[[-2,-1.5],[2,-1.5],[-2,1.5],[2,1.5]])box(gX,S,a,0,b,.08,2.4,.08,31);
      gX.set(8,(i*.37)%1);gX.poly([S.p(-2.4,2.6,-1.9),S.p(2.4,2.6,-1.9),S.p(2.4,2.1,1.9),S.p(-2.4,2.1,1.9)],[0,1,0]);gX.poly([S.p(2.4,2.6,-1.9),S.p(-2.4,2.6,-1.9),S.p(-2.4,2.1,1.9),S.p(2.4,2.1,1.9)],[0,-1,0]);gX.set(3,.5);box(gX,S,0,0,1.1,1.6,.8,.5,31);}
     for(let i=0;i<70;i++){const q=F.p((R2()-.5)*64,0,(R2()-.5)*40);W.people.push([q[0],gy(q[0],q[2])+.2,q[2]]);}poi('牛市广场','Forum Boarium',-440,215,16,0,99,'台伯河边的集市广场，旁边是圆形的胜利者赫丘利神庙。',1400);}
    W.scene.add(gX.mesh(MAT.city));}
  flushColumns(W);
  await msg('铺满民居与街坊（约一万栋）……');
  /* ---- city fabric ---- */
  await msg('补齐词典里的尼禄时期建筑……');
  {const gN=new GB(1<<16),T2=(x,z,b,o)=>temple(W,gN,Object.assign({x,y:gy(x,z),z,rot:Math.PI-b*DEG},o)),fw=(x,z,hw,hd,r=0)=>W.foot.add(x,z,hw,hd,r);
   const aqd=(P,top0,thick,part)=>{let top=top0;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/50);for(let k=0;k<n;k++){const x0=lerp(a[0],b[0],k/n),z0=lerp(a[1],b[1],k/n),x1=lerp(a[0],b[0],(k+1)/n),z1=lerp(a[1],b[1],(k+1)/n),mx=(x0+x1)/2,mz=(z0+z1)/2,sl=L/n;
     let gm=1e9;for(let j=0;j<=4;j++)gm=Math.min(gm,gy(lerp(x0,x1,j/4),lerp(z0,z1,j/4)));top-=sl*.003;const h=Math.max(6,top-gm),F=frame(mx,gm-2,mz,Math.atan2(-(z1-z0),x1-x0));arcade(gN,F,0,0,0,sl+.3,h+2,Math.max(2,Math.round(sl/8)),thick,part,{span:.32,attic:2.6,pilasters:false});gN.set(14,.4);box(gN,F,0,h+2,0,sl/2+.2,1.3,thick/2+.4,31);fw(mx,mz,sl/2,thick/2+1,F.rot);}}};
   {const q=FF.p(-30,0,108);T2(q[0],q[2],300,{W:24,L:38,podH:4,colH:13,order:'ion',nf:6,rows:2,seed:.31});poi('神君奥古斯都神庙','Templum Divi Augusti',q[0],q[2],30,0,99,'卡利古拉时建成，在尤利亚巴西利卡背后、帕拉蒂尼山脚下。',1400);}
   {const A=FF.sub(-60,0,16,Math.PI/2);arcade(gN,A,0,0,0,9,10,1,5,6,{span:.34,attic:3});statue(gN,A,0,10.2,0,2.6,true);}
   {const S=FF.sub(-66,0,-20,0);gN.set(13,.3);box(gN,S,0,0,0,2.4,4,3.2,31);roof(gN,S,'gableZ',0,0,4.8,6.4,4,15*DEG,.2,.3,{part:13,seed:.3,nSt:1,gH:4,sH:4,floorY:0});}
   T2(-30,392,210,{W:18,L:30,podH:4,colH:10,nf:6,rows:1,seed:.45});
   {const F=frame(-8,gy(-8,355),355,0);gN.set(21,.6);lathe(gN,F,0,0,0,[[3.4,0],[3.4,2.2],[2.6,3.6],[1.2,5],[0,5.6]],12);gN.set(3,.3);box(gN,F,0,0,3.3,.6,1.8,.15,1);fw(-8,355,5,5);poi('罗慕路斯草屋','Casa Romuli',-8,355,10,0,99,'传说中罗慕路斯住过的茅草屋，一直被保存。',700);}
   for(let k=0;k<3;k++)T2(-388,70+k*24,80,{W:14,L:24,podH:2.5,colH:8,order:k===1?'ion':'dor',nf:6,rows:1,seed:.4+k*.05,sculpt:false});poi('蔬菜广场三神庙','Forum Holitorium',-388,94,24,0,99,'雅努斯、希望女神、救护者朱诺三座神庙并排。',1200);
   {const F=frame(-898,gy(-898,1490),1490,-2.219);rectWalls(gN,F,0,0,380,60,-2,10,0,{part:22,seed:.35,sty:0,fl:1,nSt:1,gH:10,sH:4,lit:0});
    for(let i=0;i<40;i++)roof(gN,F,'gableZ',-190+9.5*(i+.5),0,9.5,60,10,28*DEG,.15,.35+(i%5)*.02,{part:22,seed:.35,nSt:1,gH:10,sH:4,floorY:0});fw(-898,1490,192,32,F.rot);poi('埃米利亚柱廊仓库','Porticus Aemilia',-898,1490,20,0,99,'公元前193年建成的巨型仓库，约487米长，屋顶是一排排拱顶。',2000);}
   {const F=frame(-770,gy(-770,1780),1780,0);gN.set(25,.5);lathe(gN,F,0,-1,0,[[42,0],[30,6],[14,12],[0,14]],16);fw(-770,1780,42,42);}
   {const F=frame(-1250,gy(-1250,600),600,.15),yw=F.oy+.4,wm=new THREE.Mesh(new THREE.PlaneGeometry(250,160).rotateX(-Math.PI/2),MAT.tiber);wm.position.set(-1250,yw,600);wm.rotation.y=.15;wm.receiveShadow=true;W.scene.add(wm);
    gN.set(2,.4);for(const s of[1,-1]){box(gN,F,0,-1,s*82,127,2.2,2,31);box(gN,F,s*127,-1,0,2,2.2,82,31);}gN.set(26,.5);for(const s of[1,-1])gN.poly([F.p(-129,1.2,s*84),F.p(129,1.2,s*84),F.p(129,7,s*96),F.p(-129,7,s*96)],[0,1,0]);
    gN.set(23,.5);lathe(gN,F,0,-1,0,[[14,0],[14,2],[0,2]],16);temple(W,gN,{x:-1250,y:yw+1.6,z:600,rot:.15,W:8,L:12,podH:.8,colH:5,nf:4,rows:1,stairs:false,sculpt:false,acro:false,seed:.5});
    fw(-1250,600,132,100,.15);poi('奥古斯都海战池','Naumachia Augusti',-1250,600,16,0,99,'公元前2年奥古斯都在台伯河西岸挖的人工湖，用来表演海战。',2500);}
   {const yw=gy(-960,-525)+.35,wm=new THREE.Mesh(new THREE.PlaneGeometry(120,80).rotateX(-Math.PI/2),MAT.pool);wm.position.set(-960,yw,-525);W.scene.add(wm);const F=frame(-960,yw-.35,-525,0);gN.set(2,.4);for(const s of[1,-1]){box(gN,F,0,-1,s*41,61,1.6,1,31);box(gN,F,s*61,-1,0,1,1.6,41,31);}
    const eu=densify([[-1021,-525],[-1150,-470],[-1290,-380],[-1395,-262]],12);riverMesh(W,eu,3.5,yw,MAT.pool);const ch=densify([[-787,-640],[-850,-600],[-900,-540]],10);riverMesh(W,ch,2.2,yw,MAT.pool);for(const p of ch)W.foot.addCircle(p[0],p[1],4);const kerb=(pts,hw)=>{for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),Fk=frame((a[0]+b[0])/2,yw-.35,(a[1]+b[1])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));gN.set(2,.42);for(const sd of[1,-1])box(gN,Fk,0,-.6,sd*(hw+.35),L2/2+.3,1.1,.35,31);}};kerb(eu,3.5);kerb(ch,2.2);for(const p of eu)W.foot.addCircle(p[0],p[1],6);
    for(let i=0;i<26;i++){const a=i/26*TAU,x=-960+Math.cos(a)*72,z=-525+Math.sin(a)*50;W.trees.push([x,gy(x,z),z,i%3?'pine':'cyp',1]);}fw(-960,-525,64,44);poi('阿格里帕人工湖','Stagnum Agrippae',-960,-525,10,0,99,'阿格里帕浴场西边的人工湖，一条运河通往台伯河。',1800);}
   {const F=frame(-540,gy(-540,-560),-560,0);rectWalls(gN,F,0,0,110,40,-2,20,0,{part:24,seed:.3,sty:5,fl:8|32,nSt:2,gH:10,sH:9,lit:1});roof(gN,F,'hip',0,0,110,40,20,18*DEG,.8,.3);fw(-540,-560,56,21);poi('计票大厅','Diribitorium',-540,-560,26,0,99,'选举计票用的大厅，当时罗马最大的单跨木屋顶。',1400);}
   {const F=frame(-430,gy(-430,-780),-780,0);for(const[ax,az,bx,bz]of[[-28,-70,28,-70],[28,-70,28,70],[28,70,-28,70],[-28,70,-28,-70]])portico(W,gN,F,ax,az,bx,bz,0,6,-5,3.2,[1,.95,.85]);
    T2(-430,-818,180,{W:12,L:18,podH:2,colH:7,nf:4,rows:1,seed:.6,sculpt:false});for(const s of[1,-1])lathe(gN,F,s*8,0,-10,[[1,0],[.8,9],[0,10]],4,25);fw(-430,-780,34,76);poi('伊西斯神庙','Iseum Campense',-430,-780,18,0,99,'战神广场上的埃及式神庙，院里立着方尖碑。',1400);}
   W.foot.addCircle(-610,-330,52);W.foot.addCircle(-880,-1090,56);W.foot.addCircle(890,910,50);
   {const F0=frame(930,gy(930,-280),-280,0),yL=maxGround(W,F0,0,0,62,42)+1.2,F=frame(930,yL,-280,0);terraceRect(W,gN,F,0,0,63,43,0,11);for(const[ax,az,bx,bz]of[[-55,-35,55,-35],[55,-35,55,35],[55,35,-55,35],[-55,35,-55,-35]])portico(W,gN,F,ax,az,bx,bz,0,6,-5,3.4,[1,.96,.88]);
    temple(W,gN,{x:930,y:yL,z:-280,rot:0,W:10,L:14,podH:1.8,colH:6,nf:4,rows:1,seed:.5,sculpt:false,pave:false});for(const tx of[-26,26])fountain(W,gN,930+tx,-280,{hx:3.2,hz:2.2});for(let i=0;i<16;i++){const q=F.p(-45+(i%8)*12.8,0,i<8?-22:22);W.trees.push([q[0],F.oy+.1,q[2],'broad',.8]);}fw(930,-280,64,44);poi('莉维亚柱廊','Porticus Liviae',930,-280,16,0,99,'奥古斯都为莉维亚修的柱廊花园，中间是和谐女神祠。',1600);}
   courtBlock(W,gN,frame(1240,gy(1240,-560),-560,0),{cx:0,cz:0,w:64,d:46,y0:0,nSt:1,sH:4,gH:5,cw:40,cd:24,part:0,seed:.6,sty:16,fl:8|2,garden:false});tholos(W,gN,{x:1240,y:gy(1240,-560),z:-560,R:5,podH:.8,colH:5,n:12,roofPart:1});fw(1240,-560,33,24);poi('莉维亚市场','Macellum Liviae',1240,-560,14,0,99,'埃斯奎利诺门旁的肉菜市场。',1400);
   {const F=frame(1420,gy(1420,-415),-415,.3);tower(gN,F,0,0,12,0,7,4.2,{part:24,seed:.72});fw(1420,-415,8,8,.3);poi('梅塞纳斯塔','Turris Maecenatiana',1420,-415,40,0,6,'梅塞纳斯花园里的高塔。',1800);poi('梅塞纳斯塔','Turris Maecenatiana',1420,-415,40,7,99,'【史】相传64年大火时尼禄在这里看火。“我只听见风停的那一下，他念了一个名字。”',1800);}
   {const F=frame(-405,gy(-405,-880),-880,.33);arcade(gN,F,0,-1,0,20,15,1,7,2,{span:.36,attic:4.5});statue(gN,F,0,18.6,0,3.5,true);fw(-405,-880,11,5,.33);
    aqd([[-120,-1060],[-395.5,-883.2]],gy(-260,-970)+12,3.2,22);aqd([[-414.5,-876.8],[-484,-861],[-484,-596],[-690,-596]],gy(-470,-760)+11,3.2,22);{const F2=frame(-692,gy(-692,-596),-596,0);gN.set(9,.45);lathe(gN,F2,0,-1,0,[[4.2,0],[4.2,13],[4.8,13],[4.8,14],[0,15.5]],14);}poi('克劳狄凯旋门·处女水道','Arcus Claudii · Aqua Virgo',-405,-880,22,0,99,'51年为征服不列颠而建，同时托着处女水道。水道通到阿格里帕浴场。',1800);}
   aqd([[2790,-520],[2300,-640],[1840,-778]],98,4,22);{const F=frame(1840,gy(1840,-778),-778,.3);arcade(gN,F,0,-1,0,22,18,1,8,2,{span:.36,attic:5});}poi('马尔基亚水道','Aqua Marcia · Tepula · Iulia',2300,-640,40,0,99,'三条水道叠在同一道拱上，从蒂布尔蒂纳门进城。',3000);
   {const F=frame(555,gy(555,890),890,.514);arcade(gN,F,0,-1,0,16,11,1,6,22,{span:.36,attic:3});}{const F=frame(1100,gy(1100,-330),-330,1.326);arcade(gN,F,0,-1,0,14,10,1,6,22,{span:.36,attic:3});}
   T2(-560,975,90,{W:26,L:44,podH:3.5,colH:13,nf:8,rows:2,peri:true,seed:.3});poi('狄安娜神庙','Aedes Dianae',-560,975,30,0,99,'阿文提诺山上的平民圣所。',1600);
   T2(-330,560,30,{W:20,L:32,podH:3.5,colH:11,nf:6,rows:2,seed:.42});T2(420,-1170,180,{W:30,L:54,podH:3.5,colH:13,order:'dor',nf:8,rows:2,peri:true,seed:.35});poi('奎里努斯神庙','Aedes Quirini',420,-1170,30,0,99,'奥古斯都重建的双层柱廊多立克神庙。',1600);
   tholos(W,gN,{x:150,y:gy(150,-1250),z:-1250,R:11,podH:1.5,colH:9,n:16,roofPart:16});{const F=frame(150,gy(150,-1250),-1250,0);portico(W,gN,F,-60,30,60,30,0,6,6,4,[1,.96,.9]);for(let i=0;i<24;i++){const q=F.p(-70+(i%12)*12.5,0,i<12?50:70);W.trees.push([q[0],gy(q[0],q[2]),q[2],i%2?'cyp':'pine',1]);}fw(150,-1250,66,40);poi('萨卢斯特花园','Horti Sallustiani',150,-1250,26,0,99,'皇家花园，中间是圆顶亭。',2200);}
   {const F=frame(-300,gy(-300,-2150),-2150,0);for(let i=0;i<=14;i++){const a=Math.PI+i/14*Math.PI;W.cols.simple.push([...F.p(Math.cos(a)*30,0,-20+Math.sin(a)*22),0,6,[1,.97,.9]]);}gN.set(2,.45);box(gN,F,0,-1,-20,32,1.4,1.2,31);
    for(let i=0;i<20;i++){const q=F.p(-50+(i%10)*11,0,5+Math.floor(i/10)*18);W.trees.push([q[0],gy(q[0],q[2]),q[2],i%2?'cyp':'pine',1]);}fw(-300,-2150,62,50);poi('卢库卢斯花园','Horti Luculliani',-300,-2150,20,0,99,'平乔山上的花园，顶上是半圆形柱廊。',2200);}
   {const F=frame(-1578,gy(-1578,-607),-607,-.693);for(let i=0;i<7;i++){const x=-33+i*11;rectWalls(gN,F,x,-18,9,36,-3,6,0,{part:22,seed:.4,sty:0,fl:1,nSt:1,gH:6,sH:4,lit:0});roof(gN,F,'gableZ',x,-18,9,36,6,26*DEG,.3,.45,{part:22,seed:.4,nSt:1,gH:6,sH:4,floorY:0});}
    const q=F.p(0,0,-18);fw(q[0],q[2],40,20,F.rot);poi('船棚','Navalia',q[0],q[2],14,0,99,'战神广场河岸边的军舰船棚。',1400);}
   W.scene.add(gN.mesh(MAT.city));}
  {const gK=new GB(1<<15),R6=RNG(21);W.skipped=[];
   const free=(x,z,hw,hd,rot)=>{for(const r of[0,14,28,42,58,76])for(let k=0;k<(r?8:1);k++){const a=k/8*TAU,X=x+Math.cos(a)*r,Z=z+Math.sin(a)*r;if(polyDist(X,Z,TIBER)[0]<RTW+12)continue;if(W.foot.hits(X,Z,hw,hd,rot,3))continue;let y0=1e9,y1=-1e9;for(const[a2,b2]of[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]]){const yy=gy(X+a2*Math.cos(rot)+b2*Math.sin(rot),Z-a2*Math.sin(rot)+b2*Math.cos(rot));y0=Math.min(y0,yy);y1=Math.max(y1,yy);}if(y1-y0>7)continue;return[X,Z];}return null;};
   W.foot.addCircle(-448,22,72);
   const CK=[['卡尔切尔监狱','Carcer Tullianum',-85,-136,'H',{hw:7,hd:4.5,h:6,rot:-30*DEG,info:'卡比托利欧山脚下的国家监狱，分上下两层。'}],
    ['索西亚努斯阿波罗神庙','Aedes Apollinis Medici',-469,-66,'T',{fix:true,W:20,L:36,col:12,nf:6,b:180,hw:12,hd:24,info:'马塞卢斯剧场北侧的阿波罗神庙。'}],['贝罗纳神庙','Aedes Bellonae',-496,-61,'T',{fix:true,W:18,L:30,col:10,nf:6,b:180,hw:11,hd:21,info:'元老院在这里接见外国使节、讨论凯旋式。'}],
    ['巴尔布斯柱廊院','Crypta Balbi',-589,-289,'P',{hw:40,hd:25,info:'巴尔布斯剧场背后的大柱廊院。'}],['米努西乌斯柱廊','Porticus Minucia',-564,-423,'P',{hw:55,hd:35,info:'发放粮食配给的地方。'}],['公共别墅','Villa Publica',-522,-500,'D',{hw:25,hd:20,info:'人口普查和征兵登记用的公共建筑。'}],
    ['维普萨尼亚柱廊','Porticus Vipsania',-356,-1001,'L',{hw:100,hd:12,rot:1.899,info:'阿格里帕的姐姐修的长柱廊，墙上画着世界地图。'}],['百柱廊','Hecatostylum',-937,-445,'L',{hw:85,hd:10,rot:0,info:'庞培柱廊北边，一百根柱子的长廊。'}],['今日命运女神圆庙','Aedes Fortunae Huiusce Diei',-765,-340,'R',{R:9,hw:11,hd:11,info:'神圣区里唯一的圆形神庙。'}],
    ['天后朱诺神庙','Aedes Iunonis Reginae',-439,834,'T',{W:18,L:30,col:10,nf:6,b:60,hw:11,hd:21,info:'阿文提诺山上的天后神庙。'}],['密涅瓦神庙','Aedes Minervae',-315,1000,'T',{W:14,L:24,col:8,nf:4,b:30,hw:9,hd:18,info:'阿文提诺山上，作家和演员行会的聚会所。'}],['赫丘利大祭坛','Ara Maxima Herculis',-332,434,'A',{hw:6,hd:4,info:'牛市广场边最古老的祭坛之一。'}],
    ['西庇阿家族墓','Sepulcrum Scipionum',1277,1490,'B',{hw:9,hd:7,h:8,snap:[[555,890],[900,1500],[1500,2600]],info:'阿庇亚大道边的西庇阿家族墓。'}],['面包师欧律萨刻斯墓','Sepulcrum Eurysacis',2520,90,'B',{hw:5,hd:4,h:10,info:'马焦雷门外的面包师墓，外墙做成揉面桶的样子。'}],['比布卢斯墓','Sepulcrum Bibuli',-191,-389,'B',{hw:4,hd:3,h:6,info:'弗拉米尼亚大道起点的共和时代墓。'}],
    ['第一消防队站','Statio Cohortis I Vigilum',-149,-723,'S',{hw:22,hd:16,info:'奥古斯都设立的消防兼夜巡队驻地。'}],['第二消防队站','Statio Cohortis II Vigilum',1343,-334,'S',{hw:20,hd:15,info:'埃斯奎利诺山的消防队驻地。'}],['第四消防队站','Statio Cohortis IV Vigilum',-191,1000,'S',{hw:20,hd:15,info:'阿文提诺山的消防队驻地。'}],['第七消防队站','Excubitorium Cohortis VII',-1103,556,'S',{hw:20,hd:15,info:'台伯河西岸的消防队哨所。'}],
    ['科利纳门','Porta Collina',970,-1390,'G',{rot:.8,hw:16,hd:4,info:'塞尔维乌斯城墙东北的城门。'}],['维米纳尔门','Porta Viminalis',1260,-1056,'G',{rot:0,hw:16,hd:4,info:'塞尔维乌斯土垒中段的城门。'}],['三联门','Porta Trigemina',-418,598,'G',{rot:1.2,hw:16,hd:4,info:'台伯河边通往奥斯提亚大道的城门。'}],['卡门塔利斯门','Porta Carmentalis',-338,142,'G',{rot:-.6,hw:16,hd:4,info:'凯旋队伍进城经过的城门。'}],['西里欧门','Porta Caelimontana',1094,778,'G',{rot:.3,hw:16,hd:4,info:'西里欧山上的城门，后来托着尼禄水道。'}],
    ['大地女神神庙','Aedes Telluris',638,-111,'T',{W:18,L:30,col:10,nf:6,b:180,hw:11,hd:21,info:'卡里奈区的大地女神神庙。'}],['卢奇娜朱诺神庙','Aedes Iunonis Lucinae',1094,-556,'T',{W:14,L:22,col:8,nf:4,b:200,hw:9,hd:17,info:'埃斯奎利诺山圣林里的生育女神庙。'}],['健康女神神庙','Aedes Salutis',224,-945,'T',{W:14,L:24,col:8,nf:4,b:180,hw:9,hd:18,info:'奎里纳尔山上的健康女神庙。'}],
    ['塞莫·桑库斯神庙','Aedes Semonis Sanci',307,-834,'T',{W:12,L:20,col:7,nf:4,b:200,hw:8,hd:16,info:'誓约之神的古老神庙。'}],['花神神庙','Aedes Florae',-191,778,'T',{W:16,L:26,col:9,nf:6,b:30,hw:10,hd:19,info:'大竞技场边的花神庙。'}],['墨丘利神庙','Aedes Mercurii',141,850,'T',{W:14,L:22,col:8,nf:4,b:30,hw:9,hd:17,info:'商人之神的神庙，在大竞技场南侧。'}],
    ['福尔斯·福尔图娜神庙','Aedes Fortis Fortunae',-937,1334,'T',{W:16,L:26,col:9,nf:6,b:90,hw:10,hd:19,info:'台伯河西岸的平民命运女神庙。'}],['缪斯赫丘利神庙','Aedes Herculis Musarum',-605,-111,'R',{R:7,hw:9,hd:9,info:'菲利普斯柱廊里的圆形神庙。'}],['四大车队马厩','Stabula IIII Factionum',-1185,-500,'S',{hw:35,hd:25,info:'红白蓝绿四个赛车队的马厩。'}],
    ['阿格里帕仓库','Horrea Agrippiana',-41,167,'S',{hw:30,hd:23,info:'托斯卡纳街边的三层仓库。'}],['奥古斯都火化场','Ustrinum Augusti',-771,-1334,'U',{hw:20,hd:20,info:'奥古斯都陵旁的皇家火化场，大理石围墙里种着树。'}],['拉特兰宅','Domus Lateranorum',1633,645,'D',{hw:28,hd:23,info:'【史】普劳提乌斯·拉特兰努斯的宅邸。65年他因皮索阴谋被处死。【书中】情节不同，见第14卷。'}],['老希望神庙','Aedes Spei Veteris',2296,56,'T',{W:12,L:20,col:7,nf:4,b:270,hw:8,hd:16,info:'马焦雷门附近的古老神庙。'}],['铸币工坊','Officina Monetae',-228,-186,'S',{hw:12,hd:9,info:'警戒朱诺神庙旁的铸币工坊，金银币在这里压印。'}],['鸟卜台','Auguraculum',-170,-238,'A',{hw:5,hd:5,info:'卫城上的鸟卜台，祭司在这里观察飞鸟占卜。'}],['加尔巴仓【史】','Horrea Galbae',-690,1560,'S',{hw:55,hd:38,info:'【史】加尔巴家族的大仓库，在台伯河边的商港区（今泰斯塔乔）。书中出事的是城东的埃斯奎利诺公仓。'}]];
   for(const e of CK){const[n,l,x0,z0,k,o]=e;let x=x0,z=z0;
     if(o.snap){const pts=densify(o.snap,10);let bd=1e9,bi=0;for(let i=0;i<pts.length-1;i++){const dd=Math.hypot(pts[i][0]-x0,pts[i][1]-z0);if(dd<bd){bd=dd;bi=i;}}const a=pts[bi],b=pts[bi+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=Math.hypot(dx,dz)||1;x=a[0]+dz/L2*16;z=a[1]-dx/L2*16;}
     const rot=o.b!==undefined?Math.PI-o.b*DEG:(o.rot||0),hw=o.hw,hd=o.hd,p=(k==='G'||o.fix)?[x,z]:free(x,z,hw,hd,rot);if(!p){W.skipped.push(n);continue;}x=p[0];z=p[1];const y=gy(x,z),F=frame(x,y,z,rot);
     if(k==='T'){temple(W,gK,{x,y,z,rot,W:o.W,L:o.L,podH:2.5,colH:o.col,nf:o.nf,rows:1,seed:R6(),sculpt:false});if(R6()<.4&&o.W&&Math.hypot(x+448,z-22)>190&&(!W.octPos||Math.hypot(x-W.octPos[0],z-W.octPos[1])>140)){const rw=o.W+16,rd=o.L+16;if(!W.foot.hits(x,z,rw/2,rd/2,rot,2)){colonnadeRing(W,gK,F,0,0,rw,rd,0,Math.max(5,o.col*.7),4.5,3.6,[1,.97,.9]);W.foot.add(x,z,rw/2,rd/2,rot);}}}
     else if(k==='R')tholos(W,gK,{x,y,z,R:o.R,podH:1.2,colH:o.R*1.1,n:12,roofPart:1});
     else if(k==='G'){arcade(gK,F,0,-1,0,15,14.5,1,6,22,{span:.34,attic:4.5});gK.set(22,.45);for(const sd of[1,-1]){box(gK,F,sd*12,-1,0,4.5,17.5+R6()*2.5,4.2,31);gK.set(2,.5);box(gK,F,sd*12,16.5,0,4.9,.6,4.6,31);{const q=F.p(sd*36,0,0);if(polyDist(q[0],q[2],TIBER)[0]>RTW+26){gK.set(22,.42);box(gK,F,sd*36,-1,0,19.5,10.5,2.1,31);gK.set(2,.5);box(gK,F,sd*36,9.5,0,19.8,.5,2.3,31);gK.set(22,.45);W.foot.add(q[0],q[2],20,3,rot);}}}}
     else if(k==='S')courtBlock(W,gK,F,{cx:0,cz:0,w:hw*2,d:hd*2,y0:0,nSt:2,sH:3.6,gH:4.4,cw:hw*2-16,cd:hd*2-16,part:9,seed:R6(),sty:3,fl:8|2,garden:false});
     else if(k==='P'){for(const[ax,az,bx,bz]of[[-hw,-hd,hw,-hd],[hw,-hd,hw,hd],[hw,hd,-hw,hd],[-hw,hd,-hw,-hd]])portico(W,gK,F,ax,az,bx,bz,0,5.5,-4.5,3.2,[1,.96,.88]);}
     else if(k==='L')portico(W,gK,F,-hw,0,hw,0,0,6,-hd,3.3,[1,.96,.88]);
     else if(k==='D')courtBlock(W,gK,F,{cx:0,cz:0,w:hw*2,d:hd*2,y0:0,nSt:2,sH:3.8,gH:4.6,cw:hw*2-18,cd:hd*2-16,part:0,seed:.15,sty:0,fl:1|64|8});
     else if(k==='A'){gK.set(2,.5);box(gK,F,0,-.5,0,hw,2.8,hd,31);}
     else if(k==='B'){gK.set(6,.45);box(gK,F,0,-1,0,hw,o.h+1,hd,31);gK.set(2,.4);box(gK,F,0,o.h,0,hw+.3,.5,hd+.3,31);}
     else if(k==='U'){gK.set(2,.5);for(const sd of[1,-1]){box(gK,F,0,-1,sd*hd,hw,3.4,.5,31);box(gK,F,sd*hw,-1,0,.5,3.4,hd,31);}for(let i=0;i<10;i++){const q=F.p((i%5-2)*7,0,(i<5?-1:1)*hd*.5);W.trees.push([q[0],y,q[2],'cyp',.8]);}}
     else if(k==='H'){rectWalls(gK,F,0,0,hw*2,hd*2,-2,o.h,0,{part:22,seed:.3,sty:0,fl:1,nSt:1,gH:o.h,sH:4,lit:0});roof(gK,F,'flat',0,0,hw*2,hd*2,o.h,0,0,.3,{part:22,seed:.3,nSt:1,gH:o.h,sH:4,floorY:0});}
     W.foot.add(x,z,hw+1,hd+1,rot);poi(n,l,x,z,Math.max(10,(o.col||o.h||8)+10),0,99,o.info||'',k==='G'||k==='B'||k==='A'?700:1100);}
   {const P=[[970,-1390],[1260,-1056],[1200,-760],[1150,-420]];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L2/40),hl=L2/n/2;for(let k2=0;k2<n;k2++){const x0=lerp(a[0],b[0],(k2+.5)/n),z0=lerp(a[1],b[1],(k2+.5)/n);if(W.foot.hits(x0,z0,hl,8,0,0))continue;
      const F=frame(x0,gy(x0,z0),z0,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));gK.set(22,.42);box(gK,F,0,-2,-6,hl+.2,8,1.6,31);gK.set(23,.5);gK.poly([F.p(-hl,6,-5),F.p(hl,6,-5),F.p(hl,.2,12),F.p(-hl,.2,12)],[0,1,0]);W.foot.add(x0,z0,hl,12,F.rot);}}
    poi('塞尔维乌斯土垒','Agger Servianus',1260,-1056,14,0,99,'王政时代城墙最高的一段土垒。到尼禄时代已经成了散步道，一部分被梅塞纳斯花园占用。',1600);}
   W.scene.add(gK.mesh(MAT.city));if(W.skipped.length)console.log('skipped:',W.skipped.join(','));}
  {const RL=frame(-950,gy(-950,-2200),-2200,.15),R5=RNG(15),gs=[new GB(1<<14),new GB(1<<14)];W.foot.add(-950,-2200,128,98,.15);
   for(let i=0;i<8;i++)for(let j=0;j<6;j++){const g=gs[j<3?0:1],cx=-105+i*30,cz=-75+j*30;for(const[x0,x1]of[[cx-12,cx],[cx,cx+12]]){for(const Lc of[[[x0,cz-12],[x1,cz-12],[x1,cz],[x0,cz]],[[x1,cz+12],[x0,cz+12],[x0,cz],[x1,cz]]]){
     const L=Lc.map(([a,b])=>{const p=RL.p(a,0,b);return[p[0],p[2]];});lotBuild(W,g,L,{part:9,seed:R5(),sty:3,fl:2|8,nSt:2,gH:3.6,sH:3,pitch:20*DEG,lit:.6},R5,null);}}}
   ['reloc1','reloc2'].forEach((nm,k)=>{const m=gs[k].mesh(MAT.city),G2=new THREE.Group();if(m)G2.add(m);G2.name=nm;G2.userData.rise=0;G2.visible=false;W.scene.add(G2);(W.preLayers=W.preLayers||{})[nm]=G2;});
   poi('城北安置区','57冬污染令',-950,-2200,14,5,99,'57年冬污染令：下游沿岸三百户迁到城北，公社盖了砖房，补一年口粮。',1600);}
  {const F=frame(-1300,gy(-1300,-860),-860,-.55),g2=new GB(1<<13);g2.set(27,.6);g2.poly([F.p(-150,.25,-40),F.p(150,.25,-40),F.p(150,.25,40),F.p(-150,.25,40)],[0,1,0]);
    g2.set(3,.4);for(let x=-150;x<=150;x+=6){box(g2,F,x,0,-40,.12,1.2,.12,31);box(g2,F,x,0,40,.12,1.2,.12,31);}g2.set(6,.4);box(g2,F,-130,0,0,3,2.2,4,31);
    for(let i=0;i<24;i++){const q=F.p(-150+i*13,0,i%2?52:-52);W.trees.push([q[0],gy(q[0],q[2]),q[2],i%3?'pine':'cyp',1]);}W.scene.add(g2.mesh(MAT.city));W.foot.add(-1300,-860,154,46,-.55);
    poi('特里加里乌姆练车场','Trigarium',-1300,-860,10,0,99,'战神广场靠河的一片空地，赛车手在这里练车。旁边的塔伦图姆祭坛每百年举行一次世纪祭。',1600);}
{const q=FF.p(-96,0,30);poi('土星神庙（国库）','Aedes Saturni',q[0],q[2],26,0,99,'萨图尔努斯神庙，台基下的地窖就是国库（Aerarium）。屋顶上立着吹号角的特里同像。',1200);}{const q=FF.p(-102,0,-13);poi('和谐女神庙','Aedes Concordiae',q[0],q[2],26,0,99,'提比略重建的和谐女神庙，横向宽大的内殿，用了彩色大理石。',1200);}{const q=FF.p(76,0,-6);poi('神君凯撒神庙','Aedes Divi Iulii',q[0],q[2],26,0,99,'在凯撒火化处建起的神庙，前方讲坛上装着阿克提姆海战缴获的船首。',1200);}{const q=[-200,0,-210];poi('警戒朱诺神庙（铸币厂）','Aedes Iunonis Monetae',q[0],q[2],26,0,99,'卫城上的朱诺神庙，旁边是铸币工坊。这里养着圣鹅。',1200);}{const q=[-340,0,378];poi('胜利者赫丘利圆庙','Aedes Herculis Victoris',q[0],q[2],26,0,99,'河边的圆形神庙，二十根潘泰列克大理石柱。',1200);}{const q=[-373,0,311];poi('港口神波尔图努斯神庙','Aedes Portuni',q[0],q[2],26,0,99,'四柱爱奥尼式小神庙，凝灰岩外抹灰泥。',1200);}{const q=[-55,0,338];poi('众神之母神庙（库柏勒）','Aedes Matris Deum',q[0],q[2],26,0,99,'奥古斯都重建的六柱科林斯式神庙，供奉从小亚细亚运来的黑色圣石。',1200);}{const q=[-30,0,392];poi('胜利女神神庙','Aedes Victoriae',q[0],q[2],26,0,99,'帕拉蒂尼山西南角，俯瞰大竞技场的起点。',1200);}{const q=[-765,0,-330];poi('神圣区共和国神庙群','Area Sacra',q[0],q[2],26,0,99,'四座共和时代的小神庙并排而立（今银塔广场）。',1200);}{const gW=new GB(1<<14);
   {const q=FF.p(102,0,36);fountain(W,gW,q[0],q[2],{hx:2.8,hz:2.8,rot:FF.rot,statue:2.4});poi('尤图尔纳泉','Lacus Iuturnae',q[0],q[2],8,0,99,'【史】卡斯托尔神庙旁的圣泉水池，池中立着双子神像。',700);}
   {const q=FF.p(-56,0,30);fountain(W,gW,q[0],q[2],{hx:3,hz:1.8,rot:FF.rot});poi('塞尔维利乌斯泉','Lacus Servilius',q[0],q[2],8,0,99,'【史】广场西南角的公共水池。',700);}
   {let mx=455,mz=300;for(const r of[0,14,28,42]){let hit=false;for(let k=0;k<(r?8:1);k++){const X=455+Math.cos(k/8*TAU)*r,Z=300+Math.sin(k/8*TAU)*r;if(!W.foot.hits(X,Z,7,7,0,2)){mx=X;mz=Z;hit=true;break;}}if(hit)break;}
    fountain(W,gW,mx,mz,{type:'meta',hx:5.5});poi('圆锥泉（梅塔苏丹斯）','Meta Sudans',mx,mz,18,0,99,'【史】奥古斯都时代的圆锥形喷泉，水从锥顶往下淌，在帕拉蒂尼山东北角的路口。',900);}
   {let sx=-905,sz=-640;{let ok=false;for(const r of[0,20,40,60,80]){for(let k=0;k<(r?12:1);k++){const X=-905+Math.cos(k/12*TAU)*r,Z=-640+Math.sin(k/12*TAU)*r;if(polyDist(X,Z,TIBER)[0]<RTW+90)continue;if(!W.foot.hits(X,Z,78,48,0,3)){sx=X;sz=Z;ok=true;break;}}if(ok)break;}W.lakeOK=ok;}const sy=gy(sx,sz),SF=frame(sx,sy,sz,0);gW.set(2,.5);for(const sd of[1,-1]){box(gW,SF,0,-1,sd*46,76,1.6,1.2,31);box(gW,SF,sd*76,-1,0,1.2,1.6,46,31);}
    const lake=new THREE.Mesh(new THREE.PlaneGeometry(150,90).rotateX(-Math.PI/2),MAT.pool);lake.position.set(sx,sy+.3,sz);W.scene.add(lake);W.foot.add(sx,sz,78,48,0);
    const nr=polyDist(sx-80,sz,TIBER);let tx=sx-80,tz=sz;{let best=1e9;for(let a2=0;a2<TIBER.length;a2++){const p=TIBER[a2],d=Math.hypot(p[0]-(sx-80),p[1]-sz);if(d<best&&+p[0]<sx){best=d;tx=+p[0];tz=+p[1];}}}
    const L3=Math.hypot(tx-(sx-76),tz-sz),cr=Math.atan2(-(tz-sz),tx-(sx-76)),CF=frame((sx-76+tx)/2,sy,(sz+tz)/2,cr);const can=new THREE.Mesh(new THREE.PlaneGeometry(L3,7).rotateX(-Math.PI/2),MAT.pool);can.position.set(CF.ox,sy+.25,CF.oz);can.rotation.y=cr;W.scene.add(can);
    gW.set(2,.48);for(const sd of[1,-1])box(gW,CF,0,-1,sd*4,L3/2,1.4,.5,31);for(let t=0;t<=1;t+=.05){const q=CF.p(-L3/2+L3*t,0,0);W.foot.addCircle(q[0],q[2],7);}
    poi('阿格里帕人工湖','Stagnum Agrippae',sx,sz,10,0,99,'【史】阿格里帕在战神广场修的人工湖，旁边是他的浴场，一条人工水渠（欧里普斯）通到台伯河。',1600);}
   for(const[fx,fz]of[[-925,-352],[-885,-352]]){if(!W.foot.hits(fx,fz,4,4,0,1))fountain(W,gW,fx,fz,{hx:3.4,hz:3.4});}
   let nl=0;for(const[fx,fz]of[[-330,290],[140,-120],[420,-200],[700,40],[260,560],[-560,600],[980,180],[1200,-200],[-200,-420],[-480,-280],[620,-420],[860,460],[-90,860],[380,820]]){for(const r of[0,10,20,30]){let ok=false;for(let k=0;k<(r?8:1);k++){const X=fx+Math.cos(k/8*TAU)*r,Z=fz+Math.sin(k/8*TAU)*r;if(polyDist(X,Z,TIBER)[0]<RTW+10)continue;if(!W.foot.hits(X,Z,2.4,2,0,1)){fountain(W,gW,X,Z,{type:'lacus',rot:(k*.7)});nl++;ok=true;if(nl===1)poi('街头水槽','Lacus',X,Z,5,0,99,'【史】阿格里帕在全城修了七百个水槽、一百零五座喷泉，街角都能接到水。',500);break;}}if(ok)break;}}
   W.scene.add(gW.mesh(MAT.city));W.nLacus=nl;}
  {const xo=W.octPos[0],zo=W.octPos[1],FO0=frame(xo,gy(xo,zo),zo,0),yo=maxGround(W,FO0,0,0,57,49)+.3,FO=frame(xo,yo,zo,0),gO=new GB(1<<14);terraceRect(W,gO,FO,0,0,58,50,0,11);
   colonnadeRing(W,gO,FO,0,0,112,96,0,8,6.5,3.8,[1,.97,.9]);
   temple(W,gO,{x:xo-18,y:yo,z:zo-12,rot:0,W:15,L:26,podH:2.6,colH:9,nf:6,rows:2,peri:false,seed:.41,sculpt:false,pave:false});
   temple(W,gO,{x:xo+18,y:yo,z:zo-12,rot:0,W:15,L:26,podH:2.6,colH:9,nf:6,rows:2,peri:true,seed:.44,sculpt:true,pave:false});
   temple(W,gO,{x:xo,y:yo,z:zo+52,rot:0,W:15,L:9,podH:.8,colH:9,nf:4,rows:2,peri:false,seed:.46,sculpt:false,pave:false,stairs:true});
   W.scene.add(gO.mesh(MAT.city));
   poi('屋大维娅柱廊','Porticus Octaviae',xo,zo,26,0,99,'【史】四面柱廊围成的大院，正面中间是带三角楣的门廊。院里靠后并排两座神庙：左边天后朱诺神庙，右边朱庇特·斯塔托尔神庙（罗马第一座全大理石神庙），都面向门廊。旁边还有图书馆和讲堂。',1200);}
  {const F=frame(-735,gy(-735,-1240),-1240,.08),g3=new GB(1<<13);g3.set(23,.42);g3.poly([F.p(-110,.12,-75),F.p(110,.12,-75),F.p(110,.12,75),F.p(-110,.12,75)],[0,1,0]);g3.set(27,.55);
    for(let i=0;i<32;i++){const a0=i/32*TAU,a1=(i+1)/32*TAU,P1=(r,a)=>F.p(Math.cos(a)*r*1.53,.18,Math.sin(a)*r);g3.poly([P1(56,a0),P1(56,a1),P1(62,a1),P1(62,a0)],[0,1,0]);}
    W.scene.add(g3.mesh(MAT.city));W.foot.add(-735,-1240,97,63,.08);poi('战神广场练兵草坪','Campus Martius',-735,-1240,10,0,99,'北部保留的开阔草坪和沙地跑道，市民在这里锻炼、骑马、投枪；第10卷军校的骑射也在这一带。',1800);}
  {const grandStair=(x0,z0,x1,z1,w,top)=>{const yT=top??gy(x0,z0),yB=gy(x1,z1),Ls=Math.hypot(x1-x0,z1-z0),dh=yT-yB;if(dh<2)return;const n=Math.max(8,Math.round(dh/.19)),tr=Ls/n,F=frame(x0,0,z0,Math.atan2(-(z1-z0),x1-x0)),gS=new GB(1<<13);
     for(let i=0;i<n;i++){const s=(i+.5)*tr,yS=yT-(i+1)*dh/n,q=F.p(s,0,0),gb=Math.min(gy(q[0],q[2]),yS)-2.5;gS.set(6,.4);box(gS,F,s,gb,0,tr/2+.02,yS-gb,w/2,31);if(i%3===0){gS.set(2,.45);for(const sd of[1,-1])box(gS,F,s,gb,sd*(w/2+.35),tr*1.5+.02,yS-gb+1.0,.35,31);}}
     W.scene.add(gS.mesh(MAT.city));for(let t=0;t<=1.001;t+=.1)W.foot.addCircle(lerp(x0,x1,t),lerp(z0,z1,t),w/2+1.5);};
   grandStair(-207,86,-140,150,3.2,(W.capY||gy(-275,10)));grandStair(-42,424,-92,500,4.5,gy(-30,392));grandStair(78,432,42,498,7,gy(95,382));grandStair(-530,962,-445,900,5,gy(-560,975));
   poi('百级台阶','Centum Gradus',-181,54,10,0,99,'从卡比托利欧山圣域走下去的大理石台阶。',800);poi('卡库斯台阶','Scalae Caci',-67,462,10,0,99,'帕拉蒂尼山西南角最古老的上山路，通到罗慕路斯草屋。',800);}
  const inPal=(x,z)=>segD(x,z,0,280,230,320)<205||segD(x,z,-262,40,-205,-225)<135,CAMPN=(x,z)=>x>-1150&&x<-420&&z>-1750&&z<-950,VAL=(x,z)=>Math.hypot(x-572,z-200)<150;
  const lotP={dense:R=>{const r=R();return{part:9,up:r<.66?30:r<.9?0:9,seed:R(),sty:3+8*(R()<.6?2:1),flUp:16|(R()<.3?32:0),nSt:4+Math.floor(R()*4),gH:3.6,sH:2.9,pitch:(15+R()*9)*DEG,lit:.4+R()*.6,flat:R()<.18,awn:.35,balc:.35};},
    mid:R=>{let fl=2;if(R()<.75)fl|=8;if(R()<.5)fl|=16;if(R()<.45)fl|=32;if(R()<.5)fl|=64;if(R()<.2)fl|=1024;if(R()<.15)fl|=2048;if(R()<.4)fl|=8192;if(R()<.15)fl|=4;if(R()<.3)fl|=128;return{part:R()<.38?9:0,seed:R(),sty:Math.floor(R()*8)+8*(R()<.62?1:2),fl,nSt:3+Math.floor(R()*3),gH:4.2,sH:3.15,pitch:(17+R()*8)*DEG,lit:.4+R()*.6,flat:R()<.12,awn:.3,balc:.15,loggia:R()<.12};},
    domus:R=>{const k=R()<.22;return{part:0,seed:.15+R()*.015,sty:0,fl:1|64|8|4096|8192|(R()<.4?128:0),nSt:k?2:(R()<.7?1:2),gH:4.6,sH:3.6,pitch:20*DEG,lit:.3,flat:k,kiosk:k};},ware:R=>({part:22,seed:R(),sty:0,fl:1,nSt:2,gH:5,sH:4,pitch:18*DEG,lit:.2})};
  const courtFill={dense:(W,g,C,R,ca)=>{if(ca>80&&R()<.7){const I=pInset(C,2.2);if(I&&pArea(I)>28)lotBuild(W,g,I,{part:9,up:30,seed:R(),sty:3,flUp:16,nSt:2+Math.floor(R()*2),gH:3.4,sH:2.8,pitch:.3,lit:.8,flat:R()<.5},R,null);}},
    mid:(W,g,C,R,ca)=>{if(ca>110&&R()<.45){const I=pInset(C,3);if(I&&pArea(I)>36)lotBuild(W,g,I,{part:0,seed:R(),sty:0,fl:8,nSt:2,gH:3.8,sH:3,pitch:.33,lit:.8,flat:R()<.4},R,null);}else if(R()<.5){const c=pCen(C);W.trees.push([c[0],W.gy(c[0],c[1]),c[1],R()<.5?'cyp':'broad',.6]);}},
    domus:(W,g,C,R,ca)=>{const c=pCen(C),y=W.gy(c[0],c[1])+.2;g.set(23,R());g.poly(C.map(p=>[p[0],y,p[1]]),[0,1,0]);const I=pInset(C,Math.min(3.2,Math.sqrt(ca)*.15));
      if(I){const J=pInset(I,Math.sqrt(pArea(I))*.28);if(J&&W.poolG)W.poolG.poly(J.map(p=>[p[0],y+.32,p[1]]),[0,1,0]);
        for(let k=0;k<I.length;k++){const a=I[k],b=I[(k+1)%I.length],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/4.4));for(let t=0;t<n;t++){const p=lp(a,b,t/n);W.cols.simple.push([p[0],y,p[1],0,3.4,[1,.98,.94]]);}}}
      for(let k=0;k<2;k++){const p=lp(C[k],c,.3+R()*.25);W.trees.push([p[0],y,p[1],R()<.5?'cyp':'broad',.55]);}},
    ware:(W,g,C,R,ca)=>{const c=pCen(C),y=W.gy(c[0],c[1])+.2;g.set(11,.3);g.poly(C.map(p=>[p[0],y,p[1]]),[0,1,0]);}};
  const bzone=(x,z)=>{let D=dCity(x,z);if(x>-1500&&x<-950&&z>-1000&&z<-400)D=Math.max(D,.46);if(D<.36||inPal(x,z)||CAMPN(x,z)||VAL(x,z))return null;const[rd]=polyDist(x,z,TIBER);if(rd<RTW+12)return null;const gd=romeHorti(x,z);if(gd>.55)return null;
    const h=gy(x,z),sx=gy(x+10,z)-gy(x-10,z),sz=gy(x,z+10)-gy(x,z-10);if(Math.hypot(sx,sz)/20>1.25)return null;const rel=(h-RW-8)/VEX,burn=Math.hypot(x-250,z-300)<950?1:0;
    const SUB=x>200&&x<1050&&z>-950&&z<-120,VEL=x>-400&&x<-60&&z>60&&z<480,CIR=x>250&&x<720&&z>540&&z<1000,TRV=x<-1060&&z>-560&&z<1450&&rd<560,AVN=x>-780&&x<-160&&z>680&&z<1380&&rel<15;
    if(x>-820&&x<-300&&z>-460&&z<160)return{kind:'mid',street:3.6,lotW:12,depth:13,ringA:1600,ringP:.5,tri:.14,lot:R=>{const p=lotP.mid(R);p.nSt=4+Math.floor(R()*3);p.loggia=false;p.balc=.35;p.awn=.45;return p;},court:courtFill.mid,ppl:.3,burn};
    if(x<-560&&x>-1150&&z>1050&&z<1950&&rd<300)return{kind:'ware',street:6,lotW:30,depth:14,ringA:0,ringP:1,tri:.05,lot:lotP.ware,court:courtFill.ware,ppl:.1,burn};
    const core=Math.hypot(x-120,z+160)<1000;if(core&&(SUB||VEL||D>.74))return{kind:'dense',street:3.2,lotW:11.5,depth:12,ringA:1500,ringP:.6,tri:.16,lot:lotP.dense,court:courtFill.dense,ppl:.3,burn};
    if(rel>15&&gd<.3&&hash2(Math.floor(x/60),Math.floor(z/60))<.6)return{kind:'domus',street:5.5,lotW:14,depth:9,ringA:0,ringP:1,tri:.08,lot:lotP.domus,court:courtFill.domus,ppl:.04,burn};
    return{kind:'mid',street:4.8,lotW:16,depth:14,ringA:1300,ringP:.4,tri:.12,lot:lotP.mid,court:courtFill.mid,ppl:.15,burn};};
  W.nLots=genBlocks(W,{seed:11,sx:58,sz:44,rot:-30*DEG,ext:[-2900,-2500,2700,3300],zone:bzone,lotOK:(x,z)=>polyDist(x,z,TIBER)[0]>RTW+8&&!inPal(x,z),chunk:600});
  W.nLots+=genBlocks(W,{seed:12,sx:58,sz:44,rot:-30*DEG,ext:[400,30,750,370],zone:(x,z)=>VAL(x,z)?{kind:'mid',street:4.2,lotW:13,depth:13,ringA:1200,ringP:.45,tri:.12,lot:R=>{const p=lotP.mid(R);p.loggia=false;return p;},court:null,ppl:0,burn:1}:null,grp:(x,z)=>VAL(x,z)?'valleyCity':null,noPpl:true,chunk:600});
  W.nLots+=genBlocks(W,{seed:13,sx:58,sz:44,rot:-30*DEG,ext:[-220,60,420,520],zone:(x,z)=>segD(x,z,0,280,230,320)<190&&z>175?{kind:'domus',street:6,lotW:14,depth:9,ringA:0,ringP:1,tri:.06,lot:lotP.domus,court:courtFill.domus,ppl:0,burn:0}:null,margin:14,whole:true,noPpl:true,chunk:600});

  {const gI=new GB(1<<17),RI=RNG(77);let nI=0,nS=0;const zones=[[-760,-330,-400,190],[-430,-150,90,460],[-330,-160,-330,90],[-665,-515,10,125]];
   for(const[x0,x1,z0,z1]of zones)for(let x=x0;x<=x1;x+=10.5)for(let z=z0;z<=z1;z+=11){const px=x+(RI()-.5)*4,pz=z+(RI()-.5)*4;if(polyDist(px,pz,TIBER)[0]<RTW+10)continue;
     const w=7+RI()*4.5,d=8+RI()*4.5,rot=(RI()<.5?0:Math.PI/2)+(RI()-.5)*.25;if(W.foot.hits(px,pz,w/2+.7,d/2+.7,rot,0))continue;const y=gy(px,pz);if(Math.abs(gy(px+w/2,pz)-gy(px-w/2,pz))>3.5)continue;
     const n=3+Math.floor(RI()*3),top=3.9+(n-1)*2.9,F=frame(px,y,pz,rot),sd=RI();rectWalls(gI,F,0,0,w,d,-2,top,0,{part:sd<.62?0:9,seed:RI(),sty:3,fl:2|8|16,nSt:n,gH:3.9,sH:2.9,lit:.6});roof(gI,F,RI()<.5?'gable':'hip',0,0,w+.7,d+.7,top,23*DEG,.4,RI());
     if(RI()<.3){gI.set(3,.42);box(gI,F,0,3.7,d/2+.45,w/2-.4,.16,.45,31);box(gI,F,0,3.9,d/2+.86,w/2-.4,.9,.04,31);}W.foot.add(px,pz,w/2+.5,d/2+.5,rot);nI++;}
   for(const[cx,cz]of[[-485,-60],[-520,-10],[-455,-70],[-540,30],[-360,300],[-330,260],[-300,330]])for(let k=0;k<6;k++){const px=cx+(RI()-.5)*30,pz=cz+(RI()-.5)*30,rot=RI()*Math.PI;if(W.foot.hits(px,pz,1.8,1.3,rot,0))continue;const F=frame(px,gy(px,pz),pz,rot);
     gI.set(3,.4);for(const[sx,sz]of[[-1.5,-1],[1.5,-1],[-1.5,1],[1.5,1]])box(gI,F,sx,0,sz,.06,2.3,.06,31);box(gI,F,0,.8,0,1.4,.1,.8,31);gI.set(8,RI());gI.poly([F.p(-1.7,2.5,-1.2),F.p(1.7,2.5,-1.2),F.p(1.7,2.1,1.3),F.p(-1.7,2.1,1.3)],[0,1,0]);W.foot.add(px,pz,1.8,1.4,rot);nS++;}
   for(let x=-770;x<=-662;x+=9)for(let z=-146;z<=-56;z+=8){if(RI()<.25)continue;const px=x+(RI()-.5)*3,pz=z+(RI()-.5)*3,rot=(RI()-.5)*.4,F=frame(px,gy(px,pz),pz,rot);gI.set(3,.4);for(const[sx,sz]of[[-1.5,-1],[1.5,-1],[-1.5,1],[1.5,1]])box(gI,F,sx,0,sz,.06,2.3,.06,31);box(gI,F,0,.8,0,1.4,.1,.8,31);gI.set(8,RI());gI.poly([F.p(-1.7,2.5,-1.2),F.p(1.7,2.5,-1.2),F.p(1.7,2.1,1.3),F.p(-1.7,2.1,1.3)],[0,1,0]);nS++;}
   for(let x=-528;x<=-470;x+=8)for(let z=-150;z<=-90;z+=7.5){if(RI()<.2)continue;const px=x+(RI()-.5)*2.5,pz=z+(RI()-.5)*2.5,rot=(RI()-.5)*.4,F=frame(px,gy(px,pz),pz,rot);gI.set(3,.4);for(const[sx,sz]of[[-1.5,-1],[1.5,-1],[-1.5,1],[1.5,1]])box(gI,F,sx,0,sz,.06,2.3,.06,31);box(gI,F,0,.8,0,1.4,.1,.8,31);gI.set(8,RI());gI.poly([F.p(-1.7,2.5,-1.2),F.p(1.7,2.5,-1.2),F.p(1.7,2.1,1.3),F.p(-1.7,2.1,1.3)],[0,1,0]);nS++;}
   W.scene.add(gI.mesh(MAT.city));W.nInfill=nI;W.nStalls=nS;}
  {const ZF=frB(-1190,2760,230,gy(-1190,2760)),gh=new GB(1<<13),gd=new GB(1<<13),R7=RNG(17);
   for(let k=0;k<9;k++){const q=ZF.p(-200+k*45+R7()*12,0,-170+R7()*14),F=frame(q[0],gy(q[0],q[2]),q[2],R7()*TAU);gh.set(30,R7());box(gh,F,0,-.5,0,2.6,3.3,2,31);const t0=gh.nv;roof(gh,F,'gable',0,0,5.6,4.4,2.8,26*DEG,.25,.4,{part:30,seed:.4,nSt:1,gH:3,sH:3,floorY:0});retag(gh,1,21,t0);gh.set(3,.35);box(gh,frame(q[0]+6,gy(q[0],q[2])+.2,q[2]-6,R7()*TAU),0,0,0,1.2,.6,3.4,31);}
   {const P=densify(TIBER,15);let bi=0,bd=1e9;for(let k=0;k<P.length-1;k++){const dd=Math.hypot(P[k][0]+765,P[k][1]-3141);if(dd<bd){bd=dd;bi=k;}}
    for(let k=Math.max(0,bi-22);k<Math.min(P.length-1,bi+22);k++){const a=P[k],b=P[k+1],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=(b[1]-a[1])/l,nz=-(b[0]-a[0])/l,sd=Math.sign((-765-a[0])*nx+(3141-a[1])*nz)||1;
      for(const off of[RTW+22,RTW+40]){const x=a[0]+nx*sd*(off+R7()*8),z=a[1]+nz*sd*(off+R7()*8);if(W.foot.hits(x,z,6,6,0,0))continue;const two=R7()<.4,top=two?6.4:3.4,F=frame(x,gy(x,z),z,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));
        rectWalls(gd,F,0,0,9,7.5,-1.5,top,0,{part:R7()<.5?0:9,seed:R7(),sty:3,fl:2|16,nSt:two?2:1,gH:3.4,sH:3,lit:.6});roof(gd,F,'gable',0,0,9.8,8.3,top,24*DEG,.4,R7());}}}
   for(const[nm,gg]of[['fisherHuts',gh],['downstreamHomes',gd]]){const m=gg.mesh(MAT.city),G2=new THREE.Group();if(m)G2.add(m);G2.name=nm;G2.userData.rise=0;G2.visible=false;W.scene.add(G2);(W.preLayers=W.preLayers||{})[nm]=G2;}}
  await msg('见缝插针：补齐街角与空隙……');
  const izone=(x,z)=>{const u=dCity(x,z);if(u<.1||inPal(x,z)||CAMPN(x,z)||VAL(x,z))return null;const[rd]=polyDist(x,z,TIBER);if(rd<RTW+14)return null;const gd=romeHorti(x,z),sxg=gy(x+8,z)-gy(x-8,z),szg=gy(x,z+8)-gy(x,z-8);if(Math.hypot(sxg,szg)/16>.75)return null;
    const rot=-30*DEG+.9*(fbm(x*.0006+11,z*.0006,2)-.5),burn=(x,z)=>Math.hypot(x-250,z-300)<950?1:0;
    if(u>=.5)return{d:.8*(1-gd*.8),mix:{shed:.5,tower:.15,insula:.35},st:[2,4],rot,m:.7,step:7,shops:.7,brick:.35,ppl:.05,burn};
    return{d:Math.min(.5,u*1.2)*(1-gd*.9),mix:{hut:.55,shed:.2,insula:.15,domus:.1},st:[1,3],rot,m:2,step:6,shops:.3,brick:.25,ppl:.03,burn};};
  W.nBuild=genCity(W,{seed:7,ext:[-2900,-2500,2700,3300],sp:15,zone:izone,chunk:700});
  await msg('郊野：农庄、佃农棚屋、墓道……');
  {const R=RNG(33),gV=new GB(1<<15),Zv={shops:0,brick:.25},MR=[[[555,890],[900,1500],[1500,2600],[2000,3500]],[[-500,2400],[-440,2950],[-520,3600]],[[-480,-1100],[-720,-2300],[-900,-2800]],[[700,200],[1100,250],[1800,150],[2545,56],[2800,0]],[[-1036,133],[-1300,300],[-1650,600],[-2400,800]]];
    const nr=(x,z)=>{let m=1e9;for(const P0 of MR)m=Math.min(m,polyDist(x,z,P0)[0]);return m;};let nb=0;
    for(let k=0;k<3000&&nb<190;k++){const x=lerp(-3000,2600,R()),z=lerp(-2600,3400,R());if(romeUrban(x,z)>.2||polyDist(x,z,TIBER)[0]<RTW+50)continue;
      const rel=(gy(x,z)-RW-8)/VEX,r=R();let typ=r<.1?'villa':r<.4?'rustica':'casale';if(typ==='villa'&&nr(x,z)>200&&rel<14)typ='rustica';
      const w=typ==='villa'?40+R()*14:typ==='rustica'?28+R()*10:6+R()*3,d=typ==='villa'?34+R()*12:typ==='rustica'?22+R()*8:6+R()*4,rot=R()*TAU;if(W.foot.hits(x,z,w/2,d/2,rot,typ==='casale'?3:10))continue;
      let y0=1e9,y1=-1e9;for(const[a,b]of[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]]){const yy=gy(x+a*Math.cos(rot)+b*Math.sin(rot),z-a*Math.sin(rot)+b*Math.cos(rot));y0=Math.min(y0,yy);y1=Math.max(y1,yy);}if(y1-y0>5)continue;
      W.foot.add(x,z,w/2,d/2,rot);if(typ==='villa')emitBuilding(W,gV,'domus',x,z,rot,w,d,1,y0,y1,R,Zv);else if(typ==='rustica')rustica(W,gV,frame(x,0,z,rot),w,d,y0,y1,R);else emitBuilding(W,gV,'hut',x,z,rot,w,d,1,y0,y1,R,Zv);nb++;}
    for(const P0 of MR.slice(0,3)){const pts=densify(P0,26);for(let i=0;i<pts.length-1;i++){const[x,z]=pts[i];if(romeUrban(x,z)>.45)continue;const a=Math.atan2(pts[i+1][1]-z,pts[i+1][0]-x);
      for(const s of[-1,1]){const off=9+R()*11,ox=x+Math.sin(a)*s*off,oz=z-Math.cos(a)*s*off;if(W.foot.hits(ox,oz,3,3,0,.5))continue;const y=gy(ox,oz),F=frame(ox,y,oz,-a),rr=R();
        if(rr<.4){gV.set(6,.4);box(gV,F,0,-.5,0,.45,1.8,.45,31);}else if(rr<.7){gV.set(6,.4);lathe(gV,F,0,-1,0,[[4.2,0],[4.2,4.2],[3.6,4.2],[3.6,5],[0,6.2]],14);}
        else if(rr<.85){gV.set(22,.4);box(gV,F,0,-1,0,3,5.5,3.6,31);roof(gV,F,'gable',0,0,6.2,7.4,4.5,18*DEG,.3,.5);}else{gV.set(22,.45);box(gV,F,0,-1,0,2.2,2.6,2.2,31);gV.set(6,.4);box(gV,F,0,1.6,0,1.6,.6,1.6,31);}
        W.foot.addCircle(ox,oz,rr<.4?1.2:5);if(rr>.4&&R()<.5)W.trees.push([ox+Math.cos(a)*6,y,oz+Math.sin(a)*6,'cyp',1]);}}}
    W.scene.add(gV.mesh(MAT.city));}
  flushColumns(W);{const pm=W.poolG.mesh(MAT.pool,false);if(pm)W.scene.add(pm);}
  poi('苏布拉区','Subura',650,-560,30,0,99,'最拥挤的平民区，五六层的公寓楼。',2400);
  poi('特拉斯提弗列','Trans Tiberim',-1380,300,26,0,99,'台伯河西岸的平民和外邦人街区。',3000);
  poi('阿文提诺山','Aventinus',-480,1000,26,0,99,'第10卷：第一座臂板信号塔立在这里。',3000);
  poi('码头仓库区','Emporium',-850,1350,20,0,99,'台伯河码头和仓库。第11卷明轮拖船在这里拖驳船。',2400);
  /* ---- trees ---- */
  {const R=RNG(91),cap=Math.round(21000*Q.trees);for(let z=-2800;z<3500&&W.trees.length<cap;z+=19)for(let x=-3100;x<2700;x+=19){const X=x+(R()-.5)*19,Z=z+(R()-.5)*19,[rd]=polyDist(X,Z,TIBER);if(rd<RTW+8)continue;
      const gd=romeHorti(X,Z),u=romeUrban(X,Z),h=gy(X,Z),sx=gy(X+6,Z)-gy(X-6,Z),sz=gy(X,Z+6)-gy(X,Z-6),sl=Math.hypot(sx,sz)/12;if(VAL(X,Z))continue;const dc=dCity(X,Z);let p=Math.max(gd*.65,vImg(X,Z)*.26*(1-dc))+(sl>.2?(dc>.36?.2:.6):0)*(1-gd)+(1-u)*.05;if(R()>p)continue;
      if(W.foot.hits(X,Z,2.5,2.5,0,0))continue;const r=R(),rur=u<.3&&gd<.3;W.trees.push([X,h,Z,rur?(r<.62?'olive':r<.8?'pine':'cyp'):(r<.36?'pine':r<.62?'cyp':'broad'),rur?.5+R()*.3:.8+R()*.45]);}}
  {const add=[];for(const t of W.trees){if(add.length>16000)break;const v=vImg(t[0],t[2]);if(v<.35||dCity(t[0],t[2])>.42)continue;const n=1+Math.floor(v*3.2);for(let k=0;k<n;k++){const a=Math.random()*TAU,r=4+Math.random()*7,x=t[0]+Math.cos(a)*r,z=t[2]+Math.sin(a)*r;if(W.foot.hits(x,z,1.5,1.5,0,0)||polyDist(x,z,TIBER)[0]<RTW+6)continue;add.push([x,gy(x,z),z,t[3]==='cyp'?'broad':t[3],(t[4]||1)*(.8+Math.random()*.4)]);}}for(const a of add)W.trees.push(a);}
  {let added=0;const lim=18000*Q.trees;for(let x=-3100;x<2700&&added<lim;x+=46)for(let z=-2700;z<3500&&added<lim;z+=46){const jx=x+(hash2(x*.13,z*.17)-.5)*40,jz=z+(hash2(z*.11,x*.19)-.5)*40;if(dCity(jx,jz)>.16)continue;const mm=fbm(jx*.0011+4.2,jz*.0011+1.7,3);if(mm<.56)continue;if(polyDist(jx,jz,TIBER)[0]<RTW+20)continue;const n=4+Math.floor((mm-.56)*40);for(let k=0;k<n&&added<lim;k++){const a=hash2(jx+k*3.1,jz-k*1.7)*TAU,r=hash2(jx-k*2.3,jz+k*4.1)*24,tx=jx+Math.cos(a)*r,tz=jz+Math.sin(a)*r;if(W.foot.hits(tx,tz,1.5,1.5,0,0))continue;const h=hash2(tx*.7,tz*.3);W.trees.push([tx,gy(tx,tz),tz,h<.45?'olive':h<.8?'broad':h<.93?'pine':'cyp',.8+h*.5]);added++;}}}
  {const HL=[['pal',0,280,230,320,190],['cap',-262,40,-205,-225,125],['ave',-700,900,-300,1150,250],['cae',700,700,1500,600,220],['esq',480,-40,1300,-300,230],['qui',-60,-560,900,-1520,230],['vim',500,-760,1350,-1080,170]];
   const SP={pal:[['broad',.55,[.05,.08,.03]],['pine',.3],['cyp',.15]],cap:[['broadD',.55,[.08,.105,.04]],['olive',.2],['cyp',.25]],ave:[['broad',.55,[.045,.08,.03]],['olive',.25,[.07,.09,.045]],['cyp',.2]],cae:[['broadD',.75,[.075,.105,.038]],['pine',.25]],esq:[['pine',.45],['cyp',.3],['broadD',.25,[.085,.115,.045]]],qui:[['broadD',.6,[.08,.12,.045]],['cyp',.2],['pine',.2]],vim:[['broadD',.75,[.13,.16,.065]],['olive',.25]]};
   const hillOf=(x,z)=>{for(const h of HL)if(segD(x,z,h[1],h[2],h[3],h[4])<h[5])return h[0];return null;},pick=(h,r)=>{let a=0;for(const sp of SP[h]){a+=sp[1];if(r<a)return sp;}return SP[h][0];};
   for(const t of W.trees){const h=hillOf(t[0],t[2]);if(!h)continue;const sp=pick(h,hash2(t[0]*.37,t[2]*.53));t[3]=sp[0];if(sp[2])t[5]=sp[2];}
   let ad=0;for(const[nm,ax,az,bx,bz,r]of HL){for(let x=Math.min(ax,bx)-r;x<Math.max(ax,bx)+r;x+=19)for(let z=Math.min(az,bz)-r;z<Math.max(az,bz)+r;z+=19){if(ad>9000*Q.trees)break;const jx=x+(hash2(x*.7,z*.3)-.5)*14,jz=z+(hash2(z*.9,x*.1)-.5)*14;
     if(segD(jx,jz,ax,az,bx,bz)>r||hash2(jx*.11,jz*.13)>(nm==='cap'?.68:.42)||W.foot.hits(jx,jz,2,2,0,0)||polyDist(jx,jz,TIBER)[0]<RTW+10)continue;const sp=pick(nm,hash2(jx*.29,jz*.41));W.trees.push([jx,gy(jx,jz),jz,sp[0],.75+hash2(jx,jz)*.55,sp[2]]);ad++;}}const FC={pal:[[.5,.16,.26],[.3,.18,.45],[.55,.55,.5]],cap:[[.5,.4,.03]],ave:[[.55,.17,.3],[.58,.58,.54],[.5,.07,.05]],cae:[[.56,.56,.52],[.28,.2,.48]],esq:[[.5,.07,.1],[.58,.55,.3]],qui:[[.58,.6,.54],[.26,.2,.45]],vim:[[.55,.3,.04],[.28,.2,.48]]};let sh=0;for(const[nm,ax,az,bx,bz,r]of HL){for(let x=Math.min(ax,bx)-r;x<Math.max(ax,bx)+r;x+=9)for(let z=Math.min(az,bz)-r;z<Math.max(az,bz)+r;z+=9){if(sh>16000*Q.trees)break;const jx=x+(hash2(x*.3,z*.7)-.5)*7,jz=z+(hash2(z*.3,x*.5)-.5)*7;if(segD(jx,jz,ax,az,bx,bz)>r||hash2(jx*.21,jz*.17)>.38||W.foot.hits(jx,jz,1.2,1.2,0,0)||polyDist(jx,jz,TIBER)[0]<RTW+8)continue;const fl=hash2(jx*.5,jz*.9)<.42,cl=FC[nm];W.trees.push([jx,gy(jx,jz),jz,fl?'flower':'shrub',.8+hash2(jx,jz*1.3)*.9,fl?cl[Math.floor(hash2(jx*1.7,jz)*cl.length)%cl.length]:null]);sh++;}}}
  flushTrees(W,W.trees);W.trees=[];flushPeople(W,W.people);W.people=[];
  W.views={forum:{n:'罗马广场',pos:[-250,118,-205],tgt:[40,26,40]},senate:{n:'元老院',pos:[150,64,40],tgt:[-45,22,-84]},palatine:{n:'帕拉蒂尼',pos:[520,210,560],tgt:[120,70,290]},
    circus:{n:'大竞技场',pos:[-340,150,990],tgt:[60,30,600]},academy:{n:'学园',pos:[1110,205,-50],tgt:[1360,95,-330]},campus:{n:'战神广场',pos:[-360,230,-380],tgt:[-880,20,-720]},
    south:{n:'南岸特区',pos:[-820,150,2380],tgt:[-1240,25,2790]},pagoda:{n:'琉璃塔',pos:[-1250,170,2280],tgt:[-1420,95,2460]},subura:{n:'苏布拉',pos:[520,135,-330],tgt:[700,30,-640]},circusW:{n:'竞技场西门',pos:[-382,70,490],tgt:[-242,12,533]},capitol:{n:'卡比托利欧',pos:[-150,95,170],tgt:[-275,35,10]},claudius:{n:'克劳狄神庙',pos:[720,95,470],tgt:[880,20,640]},jupiter:{n:'朱庇特神庙',pos:[-186,118,142],tgt:[-275,42,8]},palW:{n:'提比略宫西侧',pos:[-178,75,105],tgt:[-20,25,190]},campusS:{n:'战神广场南部',pos:[-450,140,250],tgt:[-620,20,-150]},boarium:{n:'牛市广场河岸',pos:[-245,75,455],tgt:[-370,8,330]},stoa:{n:'鸟瞰对照',pos:[280,1250,2150],tgt:[20,0,-300]},galba:{n:'城东',pos:[GALBA[0]-310,230,GALBA[1]-370],tgt:[GALBA[0],110,GALBA[1]]},
    overview:{n:'全城',pos:[700,1900,3500],tgt:[-200,0,200]}};
  W.defView='forum';W.mapName='尼禄时期的罗马（近似）';
  return W;}

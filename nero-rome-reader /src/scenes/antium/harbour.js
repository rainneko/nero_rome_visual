/* Antium · harbour, town and the narrator's works.
   Book: "岬角的南面是港口，渔船挤在一起，桅杆像一片光秃秃的林子。" 【史】Nero built Antium a new harbour with two moles.
   The town lies on the mainland round the harbour, outside the villa walls (the headland itself is all palace).
   Works: the workshop hall in the south-east yard on the cliff top (GLB); below the cliff, on the basalt shelf by the
   sea, the mill house with the water wheel (book: "在临海的天然玄武岩上就地浇筑了一座重达十吨的基座。高处引来的山泉
   冲刷着巨大的木制水轮"), joined to the yard by a stair down the cliff; the lead chamber and the vine pergola in the yard. */
function antHarbour(W,g,G){const AX=ANT.AX,AZ=ANT.AZ;
  /* moles */
  const mole=pts=>{for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),F=frame(AX+(a[0]+b[0])/2,0,AZ+(a[1]+b[1])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));g.set(22,.5);box(g,F,0,-4,0,L2/2+.6,6.4,6,31);g.set(31,.5);box(g,F,0,2.4,0,L2/2+.6,.12,5.6,16);}
    const e=pts[pts.length-1],T=frame(AX+e[0],2.5,AZ+e[1],0);g.set(2,.6);lathe(g,T,0,0,0,[[3,0],[2.6,7],[3,7.4],[1.6,7.4],[1.6,9],[0,9]],10);};
  mole([[118,96],[124,170],[134,236],[180,282],[230,300]]);mole([[530,362],[440,372],[340,376]]);
  /* quay along the mainland shore, warehouses behind it */
  {const Q=[];for(let z=118;z<=300;z+=10){const x=antCoastX(z)+2;Q.push([x,z]);}for(let k=0;k<Q.length-1;k++){const a=Q[k],b=Q[k+1],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),F=frame(AX+(a[0]+b[0])/2,0,AZ+(a[1]+b[1])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));g.set(22,.5);box(g,F,0,-3,0,L2/2+.5,5.2,4,31);}
    for(let k=0;k<6;k++){const z=130+k*30,x=antCoastX(z)+24,F=antF(x,z,Math.atan2(-.95,1)-Math.PI/2);rectWalls(g,F,0,0,30,11,-3,7,0,{part:9,seed:.5+k*.05,sty:0,fl:1,nSt:2,gH:3.6,sH:3.4,lit:1});roof(g,F,'gableX',0,0,30.8,11.8,7,22*DEG,.6,.4,{part:9,seed:.5,nSt:2,gH:3.6,sH:3.4,floorY:0});}}
  /* fishing boats crowded at the quay (masts like a bare wood), a few merchantmen at anchor */
  for(let k=0;k<44;k++){const z=124+(k%11)*16+Math.sin(k*5)*3,x=antCoastX(z)-12-Math.floor(k/11)*9+Math.cos(k*3)*2;if(antH(x,z)>-.6)continue;const F=frame(AX+x,0,AZ+z,Math.atan2(-.95,1)+Math.PI/2+Math.sin(k)*.3);g.set(3,.3+(k%4)*.08);box(g,F,0,-.2,0,1.1,1.1,3.4,31);g.set(3,.5);box(g,F,0,.9,.5,.07,7+(k%3),.07,31);}
  for(let k=0;k<4;k++){const F=frame(AX+200+k*60,0,AZ+180+k*26,.3+k*.4);g.set(3,.35);box(g,F,0,-1.5,0,13,3.8,3.4,31);g.set(3,.5);box(g,F,2,2.3,0,.2,17,.2,31);g.set(8,.12);g.poly([F.p(2.3,17,-7.5),F.p(2.3,17,7.5),F.p(2.3,7,7),F.p(2.3,7,-7)],F.d(1,0,0));g.poly([F.p(2.1,17,7.5),F.p(2.1,17,-7.5),F.p(2.1,7,-7),F.p(2.1,7,7)],F.d(-1,0,0));}
  /* road from the gate to the town */
  {const R=[[306,3],[330,2],[360,8],[392,40],[412,90],[430,140]];for(let k=0;k<R.length-1;k++){const a=R[k],b=R[k+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4);for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,x0=lerp(a[0],b[0],t0),z0=lerp(a[1],b[1],t0),x1=lerp(a[0],b[0],t1),z1=lerp(a[1],b[1],t1),r=Math.atan2(-(z1-z0),x1-x0),dx=Math.sin(r)*3,dz=Math.cos(r)*3;
      g.set(5,.5);g.poly([[AX+x0-dx,antH(x0-dx,z0-dz)+.15,AZ+z0-dz],[AX+x1-dx,antH(x1-dx,z1-dz)+.15,AZ+z1-dz],[AX+x1+dx,antH(x1+dx,z1+dz)+.15,AZ+z1+dz],[AX+x0+dx,antH(x0+dx,z0+dz)+.15,AZ+z0+dz]],[0,1,0]);}}W.antRoad2=R;}
  /* the town of Antium on the mainland, densest by the harbour; none on the headland */
  {const R=RNG(58),homes=[];for(let k=0;k<1400&&homes.length<230;k++){const x=345+R()*430,z=-140+R()*600;if(x<antCoastX(z)+14)continue;const h=antH(x,z);if(h<3||h>70)continue;const dH=Math.hypot(x-440,z-190);if(R()>Math.max(.06,1.15-dH/250))continue;
      if(homes.some(p=>Math.abs(p[0]-x)<11.5&&Math.abs(p[1]-z)<9.5))continue;if(Math.abs(z-lerp(3,140,clamp((x-306)/124,0,1)))<8&&x<440)continue;homes.push([x,z]);
      const F=antF(x,z,Math.sin(k)*.25),tw=R()<.3,top=tw?6.4:3.6;rectWalls(g,F,0,0,10,8,-2,top,0,{part:k%2?0:9,seed:R(),sty:3,fl:2|16|8,nSt:tw?2:1,gH:3.6,sH:2.8,lit:.6});roof(g,F,'gable',0,0,10.8,8.8,top,24*DEG,.4,R());}
    W.antTown=homes;
    {const x=470,z=170;temple(W,g,{x:AX+x,y:antH(x,z),z:AZ+z,rot:-.4,W:14,L:24,podH:2.5,colH:8,order:'ion',nf:6,rows:1});}}
  /* trees: mainland groves; on the headland only shrubs and a few pines outside the walls */
  for(let k=0;k<900;k++){const x=-260+((k*97)%1240)+Math.sin(k)*13,z=-560+((k*61)%1120)+Math.cos(k*1.3)*11,h=antH(x,z);if(h<3)continue;if(antLevel(x,z)!==null)continue;
    if(W.antTown&&W.antTown.some(p=>Math.abs(p[0]-x)<9&&Math.abs(p[1]-z)<8))continue;if(antRockD(x,z)>-4)continue;
    const steep=Math.abs(antH(x+4,z)-h)+Math.abs(antH(x,z+4)-h);if(steep>4)continue;const head=x<ANT.NECK+20&&antHalfW(x,1)>0&&Math.abs(z-antSpZ(x))<110;
    if(head){if(W.antRoadPts&&W.antRoadPts.some(p=>Math.abs(p[0]-x)<5&&Math.abs(p[1]-z)<5))continue;W.trees.push([AX+x,h,AZ+z,k%5?'shrub':'pine',.55+(k%4)*.1]);continue;}
    const r1=Math.hypot(x+900,z+640);W.trees.push([AX+x,h,AZ+z,r1<220?(k%3?'pine':'cyp'):(k%5===0?'cyp':k%3===0?'shrub':k%4===0?'olive':'pine'),.7+(k%4)*.12]);}}
/* the workshop hall (GLB) at the south edge of the yard, door to the east; steps down to the gate terrace */
function antWorkshop(W,g,G){const AX=ANT.AX,AZ=ANT.AZ,yl=ANT.YARD.level;
  {const x=244,z=antSpZ(244)+61;antStand(G,'antiumBase','ant_workshop',x,z,yl,0,(g2,F)=>{rectWalls(g2,F,0,0,36,15,-6,8,0,{part:9,seed:.55,sty:0,fl:1,nSt:1,gH:8,sH:4,lit:1});roof(g2,F,'gable',0,0,36.8,15.8,8,24*DEG,.6,.4,{part:9,seed:.55,nSt:1,gH:8,sH:4,floorY:0});
      g2.set(9,.6);for(const sz of[-4,4])box(g2,F,-20,0,sz,1.1,18,1.1,31);});
    W.antWork=[AX+x,yl,AZ+z];const S=frame(AX+x+26,26,AZ+z,0);g.set(6,.85);for(let i=0;i<9;i++)box(g,S,-i*.38,0,0,.19,(i+1)*.167,4,31);}}
function antWorks(W,g,G){const AX=ANT.AX,AZ=ANT.AZ,yl=ANT.YARD.level;
  /* the yard behind it: lead chamber (white fumes), vine pergola and the old fig tree, timber and stone */
  {const x=238,z=antSpZ(238)+40,F=antF(x,z,0,yl);g.set(14,.45);box(g,F,0,0,0,6,6,4,31);g.set(16,.4);for(let k=-5;k<=5;k+=2.5)box(g,F,k,0,4.05,.06,6,.05,1);
    G.add(smokeSys([[AX+x,yl+6.5,AZ+z]],{col:[.93,.93,.9],rise:46,size:9,rate:.03,alpha:.3,per:30,drift:[5,0,3]}));W.antLead=[AX+x,yl,AZ+z];}
  {const x=254,z=antSpZ(254)+36,P=antF(x,z,0,yl+.1);g.set(3,.4);for(const[px,pz]of[[-4,-3],[4,-3],[-4,3],[4,3]])box(g,P,px,0,pz,.13,2.6,.13,31);for(let k=-3;k<=3;k++)box(g,P,0,2.6,k,4.3,.1,.07,31);g.set(23,.25);box(g,P,0,2.72,0,4.5,.22,3.4,31);g.set(2,.5);box(g,P,0,0,0,1.2,.75,.8,31);
    W.trees.push([AX+x+8,yl,AZ+z+3,'broad',.62,[.08,.11,.04]]);W.antPerg=[AX+x,yl,AZ+z];}
  {const F=antF(232,antSpZ(232)+54,.2,yl);g.set(3,.35);for(let k=0;k<4;k++)box(g,F,0,k*.42,0,4.5,.4,.9-k*.1,31);g.set(2,.55);for(let k=0;k<6;k++)box(g,F,(k%3)*1.3-1.3,0,3+Math.floor(k/3)*1.2,.55,.55,.55,31);}
  /* yard clutter: carts, beam stacks, stone blocks, bronze castings, charcoal heaps; olive trees along the garden wall */
  {const R=RNG(77);for(let k=0;k<16;k++){const x=230+R()*28,z=antSpZ(244)+30+R()*24;if(Math.abs(x-238)<8&&Math.abs(z-antSpZ(238)-40)<6)continue;if(Math.abs(x-254)<6&&Math.abs(z-antSpZ(254)-36)<5)continue;const F=antF(x,z,R()*3,yl);
      const t=k%4;if(t===0){g.set(3,.4);box(g,F,0,.5,0,1.1,.5,.7,31);for(const sx of[-1,1])box(g,F,sx*1.2,.1,0,.08,.8,.8,31);}else if(t===1){g.set(3,.3);for(let j=0;j<3;j++)box(g,F,0,j*.35,0,2.6,.33,.5-j*.08,31);}else if(t===2){g.set(2,.6);box(g,F,0,0,0,.7,.7,.7,31);box(g,F,1.5,0,.3,.6,.6,.6,31);}else{g.set(20,.3);lathe(g,F,0,0,0,[[1.6,0],[0,1.1]],8);}}
    for(let k=0;k<6;k++){const x=230+k*5.5,z=antSpZ(x)+28;W.trees.push([AX+x,yl,AZ+z,'olive',.62]);}}
  /* below the cliff: basalt shelf at the cliff foot, mill house with the boring mill and the water wheel; the spring
     flume runs down the cliff face from the top to the wheel; a stair climbs the cliff to the yard */
  {const x=244,zcst=antSpZ(244)+antHalfW(244,1),zc=zcst-1.5,F=antF(x,zc,0,1.8);g.set(33,.35);box(g,F,1,-4,0,10,5.8,6.5,31);
    rectWalls(g,F,2,0,14,9,-.2,6,0,{part:22,seed:.4,sty:0,fl:1,nSt:1,gH:6,sH:4,lit:1});roof(g,F,'gable',2,0,14.8,9.8,6,24*DEG,.6,.3,{part:22,seed:.4,nSt:1,gH:6,sH:4,floorY:0});
    g.set(5,.5);box(g,F,-6.5,0,0,2.2,1.2,2.6,31);
    const wx=x-6.6,wz=zc,top=[wx,zcst-15];let prev=null;for(let k=0;k<=14;k++){const t=k/14,px=wx,pz=lerp(top[1],wz-2.2,t),py=Math.max(antH(px,pz)+1.1,lerp(antH(top[0],top[1])+1.5,8.2,t));
      const S=antF(px,pz,0,py);g.set(3,.38);box(g,S,0,0,0,.5,.32,.55,31);box(g,S,0,-Math.max(.4,py-antH(px,pz)),0,.1,Math.max(.4,py-antH(px,pz)),.1,31);prev=[px,py,pz];}
    const wg=new THREE.Group(),wm=new THREE.MeshStandardMaterial({color:0x6b4a2e,roughness:.9});wg.add(new THREE.Mesh(new THREE.TorusGeometry(3.4,.18,6,28),wm));for(let k=0;k<12;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.14,6.7,.14),wm);sp.rotation.z=k/12*Math.PI;wg.add(sp);const pd=new THREE.Mesh(new THREE.BoxGeometry(.9,.12,1.2),wm),a=k/12*Math.PI*2;pd.position.set(Math.cos(a)*3.5,Math.sin(a)*3.5,0);pd.rotation.z=a;wg.add(pd);}
    const wp=F.p(-6.6,4.6,0);wg.position.set(wp[0],wp[1],wp[2]);wg.rotation.y=Math.PI/2;G.add(wg);W.anim.push(t=>{if(G.visible)wg.rotation.x=-t*.9;});W.antMill=[AX+x,1.8,AZ+zc];
    const pts=[];for(let k=0;k<=9;k++)pts.push([x+16+(k%2)*9,zcst-3-k*2.4]);antStairPath(W,g,pts,2.4,2.4);}
  /* the test pier with cement blocks in the harbour */
  {const a=[262,106],b=[274,148],L=Math.hypot(b[0]-a[0],b[1]-a[1]),F=frame(AX+(a[0]+b[0])/2,0,AZ+(a[1]+b[1])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));g.set(3,.35);box(g,F,0,1.2,0,L/2,.25,1.4,31);for(let u=-L/2+1;u<=L/2;u+=3.5)for(const sd of[-1,1])box(g,F,u,-3,sd*1.25,.12,4.4,.12,31);}
  g.set(5,.55);for(let k=0;k<3;k++)box(g,frame(AX+276+k*3,0,AZ+150+k,0),0,-1,0,1.4,2.4,1.4,31);W.antPier=[AX+268,1.4,AZ+130];
  /* smoke from the workshop chimneys */
  G.add(smokeSys([[AX+224,yl+19,AZ+antSpZ(244)+62],[AX+224,yl+19,AZ+antSpZ(244)+70]],{col:[.5,.48,.46],rise:60,size:12,rate:.025,alpha:.35,per:26,drift:[6,0,2]}));}

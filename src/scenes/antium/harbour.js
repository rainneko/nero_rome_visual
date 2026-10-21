/* Antium · the harbour cove, the zigzag cliff stair, the town, trees; the workshop, pergola, boring mill and test pier. */
function antHarbour(W,g,G){const AX=ANT.AX,AZ=ANT.AZ;
  {let x=182,z=146,y=2;for(let leg=0;leg<6&&y<31;leg++){const dir=leg%2?1:-1;for(let i=0;i<14&&y<31;i++){const F=antF(x,z,leg%2?.35:-.35,y);g.set(2,.5);box(g,F,0,-3,0,1.4,3.3,.22,31);x+=dir*.95;z-=.62;y+=.36;}}W.antStair=[AX+x,y,AZ+z];}
  const mole=pts=>{for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),F=frame(AX+(a[0]+b[0])/2,0,AZ+(a[1]+b[1])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));g.set(9,.5);box(g,F,0,-4,0,L2/2+.6,6.6,6,31);}};
  mole([[150,168],[170,230],[215,290],[280,320]]);mole([[600,300],[540,340],[440,368],[360,372]]);
  for(let k=0;k<5;k++){const x=470+k*36,z=(x-400)/.9+120-16,F=antF(x,z,Math.atan2(-.9,1));rectWalls(g,F,0,0,30,11,-2,7,0,{part:9,seed:.5+k*.05,sty:0,fl:1,nSt:2,gH:3.6,sH:3.4,lit:1});roof(g,F,'gableX',0,0,30.8,11.8,7,22*DEG,.6,.4,{part:9,seed:.5,nSt:2,gH:3.6,sH:3.4,floorY:0});}
  for(let k=0;k<26;k++){const x=230+(k%7)*36+Math.sin(k*5)*7,z=210+Math.floor(k/7)*34+Math.cos(k*3)*6;if(antH(x,z)>-.5)continue;const F=frame(AX+x,0,AZ+z,k*.4);g.set(3,.3+(k%4)*.08);box(g,F,0,-.2,0,1.1,1.1,3.3,31);g.set(3,.5);box(g,F,0,.9,.4,.07,7+(k%3),.07,31);}
  for(let k=0;k<3;k++){const F=frame(AX+300+k*70,0,AZ+250+k*20,.3+k*.2);g.set(3,.35);box(g,F,0,-1.5,0,13,3.8,3.4,31);g.set(3,.5);box(g,F,2,2.3,0,.2,17,.2,31);g.set(8,.12);g.poly([F.p(2.3,17,-7.5),F.p(2.3,17,7.5),F.p(2.3,7,7),F.p(2.3,7,-7)],F.d(1,0,0));g.poly([F.p(2.1,17,7.5),F.p(2.1,17,-7.5),F.p(2.1,7,-7),F.p(2.1,7,7)],F.d(-1,0,0));}
  for(let k=0;k<90;k++){const x=470+(k%10)*36+Math.sin(k*2.3)*8,z=150+Math.floor(k/10)*30+Math.cos(k*1.9)*6,h=antH(x,z);if(h<3||h>26)continue;const F=antF(x,z,Math.sin(k)*.25),tw=k%3===0,top=tw?6.4:3.6;
    rectWalls(g,F,0,0,10,8,-2,top,0,{part:k%2?0:9,seed:(k*37%100)/100,sty:3,fl:2|16|8,nSt:tw?2:1,gH:3.6,sH:2.8,lit:.6});roof(g,F,'gable',0,0,10.8,8.8,top,24*DEG,.4,(k*13%10)/10);}
  for(let k=0;k<700;k++){const x=-970+((k*97)%1880)+Math.sin(k)*13,z=-750+((k*61)%1360)+Math.cos(k*1.3)*11,h=antH(x,z);if(h<3)continue;const dh=antSeg(x,z)[0];if(antRad(x)-dh>-14&&x<405)continue;if(Math.hypot(x-ANT.ISL[0],z-ANT.ISL[1])<62)continue;
    const r1=Math.hypot(x+760,z+540),steep=Math.abs(antH(x+4,z)-h)+Math.abs(antH(x,z+4)-h);if(steep>5)continue;
    W.trees.push([AX+x,h,AZ+z,r1<200?(k%3?'pine':'cyp'):(k%5===0?'cyp':k%3===0?'shrub':k%4===0?'olive':'pine'),.7+(k%4)*.12]);}}
function antWorks(W,g,G){const AX=ANT.AX,AZ=ANT.AZ;
  {const x=212,z=antAxZ(212)+82,F=antF(x,z,0,32);rectWalls(g,F,0,0,20,10,-2,6,0,{part:9,seed:.55,sty:0,fl:1,nSt:1,gH:6,sH:4,lit:1});roof(g,F,'gable',0,0,20.8,10.8,6,24*DEG,.6,.4,{part:9,seed:.55,nSt:1,gH:6,sH:4,floorY:0});
   const P=antF(x+24,z,0,32);g.set(3,.4);for(const[px,pz]of[[-4,-3],[4,-3],[-4,3],[4,3]])box(g,P,px,0,pz,.13,2.6,.13,31);for(let k=-3;k<=3;k++)box(g,P,0,2.6,k,4.3,.1,.07,31);g.set(23,.25);box(g,P,0,2.72,0,4.5,.22,3.4,31);
   W.trees.push([AX+x+33,32,AZ+z+5,'broad',.62,[.08,.11,.04]]);W.antPerg=[AX+x+24,32,AZ+z];}
  {const x=168,z=158,F=antF(x,z,0,2.2);g.set(14,.2);box(g,F,0,-6,0,12,6.2,8,31);rectWalls(g,F,0,0,20,12,-.2,6.5,0,{part:3,seed:.4,sty:0,fl:1,nSt:1,gH:6.5,sH:4,lit:1});roof(g,F,'gable',0,0,20.8,12.8,6.5,24*DEG,.6,.3,{part:3,seed:.4,nSt:1,gH:6.5,sH:4,floorY:0});
   g.set(5,.5);box(g,F,0,0,-9.5,5,1.5,2.5,31);g.set(3,.38);for(let k=0;k<10;k++){const t=k/10,S=antF(x-14+t*4,z-12-t*16,0,30-t*21);box(g,S,0,0,0,.6,.3,1.2,31);}
   const wg=new THREE.Group(),wm=new THREE.MeshStandardMaterial({color:0x6b4a2e,roughness:.9});wg.add(new THREE.Mesh(new THREE.TorusGeometry(3.2,.18,6,28),wm));for(let k=0;k<12;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.14,6.3,.14),wm);sp.rotation.z=k/12*Math.PI;wg.add(sp);const pd=new THREE.Mesh(new THREE.BoxGeometry(.9,.12,1.1),wm),a=k/12*Math.PI*2;pd.position.set(Math.cos(a)*3.3,Math.sin(a)*3.3,0);pd.rotation.z=a;wg.add(pd);}
   const wp=F.p(-9,4.2,-9.5);wg.position.set(wp[0],wp[1],wp[2]);G.add(wg);W.anim.push(t=>{if(G.visible)wg.rotation.z=-t*.9;});W.antMill=[AX+x,2.2,AZ+z];}
  for(let k=0;k<9;k++){const F=frame(AX+250+k*4,0,AZ+235+k*4,-.8);g.set(3,.35);box(g,F,0,1.2,0,2.6,.25,1.4,31);box(g,F,-2,-3,0,.12,4.2,.12,31);box(g,F,2,-3,0,.12,4.2,.12,31);}g.set(5,.55);box(g,frame(AX+290,0,AZ+275,0),0,-1,0,1.6,2.4,1.6,31);}

/* Antium · the fortress villa on the headland: cliff walls with square towers, the gate, three terraces,
   the main palace, the round temple and the observation tower with the iron spear. */
const ANT_WALL={part:24,seed:.86,sty:13,fl:8|32,lit:1};
function antSqTower(g,x,z,w,hgt,y){const F=antF(x,z,0,y);rectWalls(g,F,0,0,w,w,-30,hgt,0,Object.assign({},ANT_WALL,{nSt:Math.max(1,Math.round(hgt/5)),gH:5.5,sH:5}));roof(g,F,'pyr',0,0,w+1.2,w+1.2,hgt,28*DEG,.6,.82);return F;}
function antFortress(W,g,G){const AX=ANT.AX,AZ=ANT.AZ;
  for(const sd of[-1,1]){let k=0;for(let x=392;x>-288;x-=17,k++){const x2=x-17,z1=antAxZ(x)+sd*(antRad(x)-9),z2=antAxZ(x2)+sd*(antRad(x2)-9),y=antPlat(x),L2=Math.hypot(x2-x,z2-z1),F=antF((x+x2)/2,(z1+z2)/2,Math.atan2(-(z2-z1),x2-x),y);
      g.set(24,.84);box(g,F,0,-26,0,L2/2+.6,26+3.6,.9,31);g.set(2,.55);box(g,F,0,3.6,0,L2/2+.7,.35,1.05,31);if(k%6===0)antSqTower(g,x,z1,9,14,y);}}
  for(const x of[150,-50]){const y=antPlat(x+1),F=antF(x,antAxZ(x),0,y);g.set(24,.8);box(g,F,0,-18,0,1.2,18+(antPlat(x-1)-y)+1,antRad(x)-12,31);}
  {const gx=402,F=antF(gx,antAxZ(gx),Math.PI/2,32);arcade(g,F,0,0,0,12,13,1,5,24,{span:.33,attic:3.4});roof(g,F,'gableX',0,0,12.6,6,13,20*DEG,.5,.8);for(const sd of[-1,1])antSqTower(g,gx,antAxZ(gx)+sd*14,11,20,32);
   g.set(21,.4);g.poly([F.p(-3,.1,0),F.p(3,.1,0),F.p(3,.1,-160),F.p(-3,.1,-160)],[0,1,0]);}
  /* terrace 1: cypress alley, circular colonnaded garden with a pool, flower beds, olives, sea-facing portico */
  {for(let x=168;x<392;x+=9)for(const sd of[-1,1])W.trees.push([AX+x,32.1,AZ+antAxZ(x)+sd*9,'cyp',1.05]);
   const F=antF(0,0,0,32);g.set(11,.36);g.poly([F.p(160,.08,antAxZ(160)-4),F.p(392,.08,antAxZ(392)-4),F.p(392,.08,antAxZ(392)+4),F.p(160,.08,antAxZ(160)+4)],[0,1,0]);
   const cx=262,cz=antAxZ(262)+52,C=antF(cx,cz,0,32);g.set(11,.36);lathe(g,C,0,.06,0,[[27,0],[0,0]],32);for(let k=0;k<26;k++){const a=k/26*TAU;W.cols.cor.push([...C.p(Math.cos(a)*24,0,Math.sin(a)*24),0,6,[1,.97,.9]]);W.cols.cor.push([...C.p(Math.cos(a)*19,0,Math.sin(a)*19),0,6,[1,.97,.9]]);}
   g.set(2,.5);lathe(g,C,0,6,0,[[25,0],[25,.9],[18,.9],[18,0]],32);g.set(1,.42);lathe(g,C,0,6.9,0,[[25.6,0],[21.5,2.4],[17.4,0]],32);
   const pool=new THREE.Mesh(new THREE.CircleGeometry(9,28).rotateX(-Math.PI/2),MAT.pool),pp=C.p(0,.45,0);pool.position.set(pp[0],pp[1],pp[2]);G.add(pool);g.set(2,.5);lathe(g,C,0,0,0,[[10,0],[10,.6],[9,.6],[9,0]],28);
   for(const[bx,bz]of[[205,-45],[320,-45],[205,40],[320,-70]]){const B=antF(bx,antAxZ(bx)+bz,0,32);g.set(23,.35);box(g,B,0,0,0,18,.5,9,31);g.set(2,.5);box(g,B,0,0,0,18.6,.65,.3,31);}
   for(let k=0;k<44;k++){const x=172+(k*53)%210,z=antAxZ(x)+((k*37)%2?1:-1)*(22+(k*29)%60);if(Math.hypot(x-cx,z-cz)<34)continue;W.trees.push([AX+x,32.1,AZ+z,'olive',.75+(k%3)*.1]);}
   openPortico(W,g,F,170,antAxZ(170)+antRad(170)-22,388,antAxZ(388)+antRad(388)-22,0,6.2,-6,3.8,[1,.97,.9]);}
  /* terrace 2: grand stair between towers, two courtyard wings, portico toward the north sea */
  {const S=antF(150,antAxZ(150),0,32);g.set(2,.52);for(let i=0;i<34;i++)box(g,S,-1-i*.42,0,0,.22,i*.47+.47,9,31);for(const sd of[-1,1])antSqTower(g,150,antAxZ(150)+sd*13,9,26,32);
   for(const[bx,bz,w,d]of[[60,-44,74,44],[60,48,74,40]])courtBlock(W,g,antF(bx,antAxZ(bx)+bz,0,48),{cx:0,cz:0,w,d,y0:0,nSt:2,sH:4.6,gH:5.6,cw:w-26,cd:d-20,part:24,seed:.86,sty:13,fl:8|32});
   const F=antF(0,0,0,48);openPortico(W,g,F,-40,antAxZ(-40)-antRad(-40)+22,140,antAxZ(140)-antRad(140)+22,0,6.4,6,3.8,[1,.97,.9]);
   for(let x=-40;x<145;x+=10)W.trees.push([AX+x,48.1,AZ+antAxZ(x)+2,'cyp',1]);}
  /* terrace 3: stair, main palace with corner towers and a west loggia, round temple, observation tower */
  {const S=antF(-50,antAxZ(-50),0,48);g.set(2,.52);for(let i=0;i<38;i++)box(g,S,-1-i*.42,0,0,.22,i*.47+.47,8,31);
   const px=-150,pz=antAxZ(-150),P=antF(px,pz,0,66);courtBlock(W,g,P,{cx:0,cz:0,w:104,d:74,y0:0,nSt:3,sH:4.8,gH:6,cw:52,cd:34,part:24,seed:.86,sty:13,fl:8|32|4});
   for(const[sx,sz]of[[-1,-1],[1,-1],[-1,1],[1,1]])antSqTower(g,px+sx*55,pz+sz*40,11,28,66);
   openPortico(W,g,P,-60,-34,-60,34,0,7,-7,3.8,[1,.97,.9]);
   tholos(W,g,{x:AX-238,y:66,z:AZ+antAxZ(-238)+40,R:9,podH:1.6,colH:8,n:14,roofPart:1});
   const tx=-262,tz=antAxZ(-262)-26,T=antF(tx,tz,.06,66),nS=9,sH=4.6,yT=sH*1.1+(nS-1)*sH;tower(g,T,0,0,13,0,nS,sH,{part:24,seed:.95});g.set(2,.55);box(g,T,0,yT,0,7.2,.8,7.2,31);
   g.set(14,.6);box(g,T,0,yT+.8,0,.09,10,.09,31);g.set(2,.95);box(g,T,0,yT+10.8,0,.06,.9,.06,31);g.set(25,.7);box(g,T,-6.6,0,0,.06,yT+.8,.06,31);W.antTower=[AX+tx,66+yT,AZ+tz];
   const F=antF(0,0,0,66);g.set(11,.36);g.poly([F.p(-292,.08,antAxZ(-292)-60),F.p(-205,.08,antAxZ(-205)-70),F.p(-205,.08,antAxZ(-205)+70),F.p(-292,.08,antAxZ(-292)+60)],[0,1,0]);
   for(let x=-280;x<-60;x+=11)for(const sd of[-1,1])W.trees.push([AX+x,66.1,AZ+antAxZ(x)+sd*(antRad(x)-20),'cyp',1.1]);}}

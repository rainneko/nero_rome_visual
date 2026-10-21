/* Antium · the only bridge and the islet. Book: the bridge is narrow (two people side by side) and has no railings;
   an iron gate and German guards at the bridgehead; on the islet a side hall with felt-covered windows and a lead chamber. */
function antIslet(W,g,G){const AX=ANT.AX,AZ=ANT.AZ,I=ANT.ISL,len=ANT.BRL;for(let k=0;k<26;k++){const a=k/26*TAU+.1,r=antIsleR(a)-5,x=I[0]+Math.cos(a)*r,z=I[1]+Math.sin(a)*r;W.trees.push([AX+x,antH(x,z),AZ+z,k%3?'shrub':'cyp',.6+(k%4)*.1]);}
  const F=frame(AX+I[0],0,AZ+ANT.BRZ,Math.PI/2);arcade(g,F,0,-10,0,len,75,1,4.4,24,{span:.33,attic:3.2});g.set(2,.6);box(g,F,0,65,0,len/2+1,.5,1.35,31);
  for(const s2 of[-1,1]){const q=F.p(s2*(len/2+3),0,0);for(const sd of[-1,1])pedestalStatue(g,frame(q[0],65,q[2],F.rot),0,sd*2.2,.5,2.4,{gilt:false});}
  {const hz=F.p(-(len/2+5),0,0),HF=frame(hz[0],66,hz[2],F.rot);arcade(g,HF,0,0,0,7,7.5,1,4,24,{span:.34,attic:1.6});roof(g,HF,'gableZ',0,0,4.6,7.6,7.5,22*DEG,.5,.8);g.set(14,.4);box(g,HF,0,0,0,.12,4.6,1.15,31);
   for(let k=0;k<6;k++){const S=HF.sub(-4-(k%3)*1.4,0,-2.4+Math.floor(k/3)*4.8,0);g.set(30,.35);box(g,S,0,0,0,.22,1.6,.2,31);g.set(3,.4);box(g,S,0,1.6,0,.14,.18,.14,31);}}
  const Hl=antF(I[0],I[1]-6,0,63);rectWalls(g,Hl,0,0,26,15,-1,10,0,{part:24,seed:.86,sty:13,fl:8,nSt:2,gH:5.6,sH:4.4,lit:0});roof(g,Hl,'hip',0,0,26.8,15.8,10,20*DEG,.8,.88);
  g.set(7,.1);for(const sz of[-7.55,7.55])for(const sx of[-9,-3,3,9])box(g,Hl,sx,6.6,sz,1,1.8,.04,31);
  const C=antF(I[0]+18,I[1]+14,0,63);g.set(14,.45);box(g,C,0,0,0,5,5.5,3.4,31);G.add(smokeSys([[AX+I[0]+18,69,AZ+I[1]+14]],{col:[.92,.92,.9],rise:46,size:9,rate:.03,alpha:.3,per:30,drift:[5,0,3]}));
  const E=antF(I[0]-22,I[1],0,63);for(let k=0;k<=12;k++){const a=Math.PI*.5+k/12*Math.PI;W.cols.cor.push([...E.p(Math.cos(a)*12,0,Math.sin(a)*12),0,5,[1,.97,.9]]);}g.set(2,.5);for(let k=0;k<12;k++){const a=Math.PI*.5+(k+.5)/12*Math.PI,S=E.sub(Math.cos(a)*12,0,Math.sin(a)*12,-a);box(g,S,0,5,0,.6,.6,1.7,31);box(g,S,0,0,2,.6,.5,1.3,31);}
  for(let k=0;k<28;k++){const a=k/28*TAU,r=antIsleR(a)-12.5,S=frame(AX+I[0]+Math.cos(a)*r,63,AZ+I[1]+Math.sin(a)*r,-a);if(Math.abs(Math.sin(a)-1)<.04)continue;g.set(24,.84);box(g,S,0,-3,0,.5,4.2,r*Math.PI/28+.3,31);}}

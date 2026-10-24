/* Antium · the side-hall rock and the only bridge.
   Book: "安齐奥靠悬崖那一整座侧殿，给你。三面绝壁，只有一座窄桥连着主宫。桥头装一道铁门，再放二十个日耳曼人。"
         "大理石窄桥两侧没有栏杆，下面是几十丈深的黑礁石。"
   The bridge (GLB, z = 0 at sea level, deck at 50) runs north from the upper palace terrace; its gatehouse with the iron
   gate stands on the palace side. The side hall (GLB) sits on a podium on the rock, its gallery facing the bridge. */
function antIslet(W,g,G){const AX=ANT.AX,AZ=ANT.AZ,R=ANT.ROCK,B=ANT.BR,lv=56.5,deck=50+B.dy;
  /* podium only under the side hall, its gallery and terrace, reaching the bridge end; the rest of the top is natural */
  {const x0=R.x-20,x1=R.x+20,z0=R.z-14,z1=B.z-37,q=(x,y,z)=>[AX+x,y,AZ+z],gr=(x,z)=>Math.min(lv-.5,antH(x,z))-1.5;
    g.set(31,.5);g.poly([q(x0,lv,z0),q(x1,lv,z0),q(x1,lv,z1),q(x0,lv,z1)],[0,1,0]);
    const E=[[x0,z0,x1,z0,[0,0,-1]],[x1,z0,x1,z1,[1,0,0]],[x1,z1,x0,z1,[0,0,1]],[x0,z1,x0,z0,[-1,0,0]]];
    for(const[ax,az,bx,bz,nn]of E){const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/5));for(let k=0;k<n;k++){const xa=lerp(ax,bx,k/n),za=lerp(az,bz,k/n),xb=lerp(ax,bx,(k+1)/n),zb=lerp(az,bz,(k+1)/n);g.set(24,.84,13);g.poly([q(xa,gr(xa,za),za),q(xb,gr(xb,zb),zb),q(xb,lv,zb),q(xa,lv,za)],nn);}
      if(nn[2]===1)continue;const L=Math.hypot(bx-ax,bz-az),F=frame(AX+(ax+bx)/2,lv,AZ+(az+bz)/2,Math.atan2(-(bz-az),bx-ax));g.set(2,.84);box(g,F,0,0,0,L/2+.3,1,.3,31);g.set(6,.5);box(g,F,0,1,0,L/2+.35,.14,.38,31);}
    for(const sx of[-1,1]){const L=17,F=frame(AX+B.x+sx*(1.4+L/2+.3),lv,AZ+z1,0);g.set(2,.84);box(g,F,0,0,0,L/2,1,.3,31);g.set(6,.5);box(g,F,0,1,0,L/2+.05,.14,.38,31);}}
  /* the side hall (GLB): gallery (长廊) along its south front, the dark room in its west end */
  antStand(G,'antiumBase','ant_sidehall',R.x,R.z-4,lv,0,(g2,F)=>{rectWalls(g2,F,0,0,34,15,-8,9.6,0,Object.assign({},ANT_WALL,{sty:13,nSt:2,gH:5.2,sH:4.4}));roof(g2,F,'hip',0,0,34.8,15.8,9.6,22*DEG,.6,.84);
    g2.set(19,.1);for(const sz of[-7.55,7.55])for(const sx of[-15,-12])box(g2,F,sx,6.4,sz,1,1.7,.05,31);});
  W.antSide=[AX+R.x,lv,AZ+R.z-4];
  for(let k=0;k<40;k++){const a=k/40*TAU+.2,r=.35+.45*((k*37)%10)/10,x=R.x+Math.cos(a)*R.rx*r,z=R.z+Math.sin(a)*R.rz*r;if(x>R.x-22&&x<R.x+22&&z>R.z-16&&z<B.z-35)continue;if(antRockD(x,z)<8)continue;W.trees.push([AX+x,antH(x,z),AZ+z,k%4?'shrub':(k%8?'pine':'cyp'),.6+(k%4)*.12]);}
  /* the bridge (GLB): stand-in deck and arch; gatehouse with the iron gate on the palace side */
  antStand(G,'antiumBase','ant_bridge',B.x,B.z,B.dy,-Math.PI/2,(g2,F)=>{arcade(g2,F,0,-10,0,76,deck+10-B.dy,1,3.4,24,{span:.32,attic:3});g2.set(6,.62);box(g2,F,0,deck-B.dy,0,38,.3,1.35,31);
    const H=F.sub(42,deck-B.dy,0);rectWalls(g2,H,0,0,8,7.5,-6,7.5,0,Object.assign({},ANT_WALL,{nSt:1,gH:7.5,sH:4}));roof(g2,H,'gableX',0,0,8.6,8.1,7.5,22*DEG,.5,.8);});
  W.antBridge=[AX+B.x,deck,AZ+B.z];
  /* German guards behind the gate (book: "桥头有铁门，门后站着日耳曼人"), a small post of figures on the palace side */
  for(let k=0;k<6;k++){const S=frame(AX+B.x-3+(k%3)*3,deck,AZ+B.z+48+Math.floor(k/3)*2.2,0);g.set(30,.35);box(g,S,0,0,0,.22,1.6,.2,31);g.set(3,.4);box(g,S,0,1.6,0,.14,.18,.14,31);}}

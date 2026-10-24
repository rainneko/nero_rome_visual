/* ================= 帕拉蒂尼山：皇宫区放置、层叠台地与山体基座 =================
   Palatine local frame (the city grid): origin (100, 300), rotation −30°; local +x = ESE (along the Circus), +z = SSW.
   The hilltop is about 56.5 m. Hero models sit on the top and on the edges; round them the slopes are terraced by
   retaining walls that follow the contours (6 m walls with half-round buttresses, 7 m apart), porticoes stacked on
   some terraces, gardens and stairs climbing along the walls — the "hill base" of the reference picture. */
const PALF={ox:100,oz:300,c:Math.cos(-Math.PI/6),s:Math.sin(-Math.PI/6),rot:-Math.PI/6};
const palW=(lx,lz)=>[PALF.ox+lx*PALF.c+lz*PALF.s,PALF.oz-lx*PALF.s+lz*PALF.c];
// imperial garden planting (vegetation_seasons brief): clipped box and rose beds, almond (white-pink blossom in early spring) and pomegranate (scarlet flowers in summer, yellow leaves and red fruit in autumn)
const impGarden=r=>r<.25?'shrub':r<.5?'flower':r<.72?'almond':r<.88?'pomegr':'shrub';
const palL=(x,z)=>{const dx=x-PALF.ox,dz=z-PALF.oz;return[PALF.c*dx-PALF.s*dz,PALF.s*dx+PALF.c*dz];};
// hero models on the hill: centre (local), turn (deg, added to the grid), half sizes in the model's own axes, floor height (the four domus a/b stand at the top of their slope: the rock foot carries the drop)
const PAL_ASSETS=[
  {n:'rome_tiberiana',lx:-138.4,lz:-29.8,turn:0,hw:72,hd:60,y:54.8},
  {n:'rome_transitoria',lx:73.3,lz:-63.1,turn:0,hw:60,hd:52,y:56.7},
  {n:'rome_apollo',lx:37,lz:74,turn:0,hw:64,hd:60,y:56.6},
  {n:'rome_domus_augusti',lx:-47,lz:106,turn:0,hw:38,hd:41,y:56.6},
  {n:'rome_magna_mater',lx:-154,lz:100,turn:0,hw:32,hd:46,y:56.6},
  {n:'rome_victoria',lx:-110,lz:132,turn:0,hw:29,hd:40,y:52},
  {n:'rome_domus_a',lx:190,lz:-72,turn:90,hw:16,hd:26,y:57.3},
  {n:'rome_domus_b',lx:196,lz:36,turn:90,hw:16,hd:26,y:52.9},
  {n:'rome_domus_a',lx:62,lz:-142,turn:180,hw:16,hd:26,y:52.1},
  {n:'rome_domus_b',lx:-30,lz:-128,turn:180,hw:16,hd:26,y:55.9}];
// terrain pads under the models (cut the hill to their floors); [lx0,lx1,lz0,lz1,y]
const PAL_PADS=[[-84,-10,104,120,51.3],[-84,-10,120,146,47],[-186,-122,56,132,56.3],[-139,-81,92,160,51.7],[-209,-63,-93,24,54.3]];
/* ---- the crowded saddle (Intermontium): a sunken basin between the two summits, packed with office blocks ----
   Level logic: every block has its LOW floor on the ground around it and its HIGH floor 5 m (c: 10 m) above that (see briefs/rome/pal_blocks.md).
   In the basins the ground is the deck (PAL_DECK, 5 m below the plateau), so the high floor is at plateau level; on the plateau strips the
   blocks stand on the plateau and their high part rises 5 m above it (solid podium made by their own walls). */
const PAL_PATCH=[-210,40,440,660];                 // world rect [x0,z0,x1,z1] of the finer terrain patch (3 m cells) over the hill
const PAL_DECK=51.4,PAL_TOP=56.4;
const PAL_BASIN=[[-72,10,-106,26],[-72,-12,26,76]];  // [lx0,lx1,lz0,lz1]: carved to the deck, paved, walled where the neighbour is higher
// footprints include the overhangs of the GLBs (a 38.8x32.8, b 62.8x18.6, c 32.9x30.8, d 36.8x28.3); stand-ins are drawn with the nominal sizes
const PAL_BLK={a:{n:'rome_pal_block_a',w:39,d:33,dr:5},b:{n:'rome_pal_block_b',w:63,d:19,dr:5},c:{n:'rome_pal_block_c',w:33,d:31,dr:10},d:{n:'rome_pal_block_d',w:37,d:29,dr:5}};
// [type, lx, lz, turn (0: front/low side faces +lz, 90: +lx, 180: -lz, 270: -lx), y of the HIGH floor]
const PAL_BL=[
  ['d',-46.5,-81.5,0,56.4],['c',-8.5,-80.5,0,61.4],           // north row of the basin (the gallery runs along its north side); c: 10 m drop, garden terrace 5 m above the plateau
  ['d',-52,-48,180,56.4],['d',-12,-48,180,56.4],             // second row
  ['a',-50.5,-14.5,0,56.4],['c',-12,-14.5,0,61.4],           // third row
  ['b',-38,14,0,56.4],['a',-51,43,0,56.4],                   // south basin
  ['b',-130,39,0,61.4],                                      // south of the Tiberiana (plateau strip)
  ['d',34,8,0,61.4],['d',75,8,0,61.4],                       // between Transitoria and Apollo
  ['c',156,-14,90,64],['a',153,26,90,60],                    // east of the Transitoria, fronts to the east slope
  ['c',-66,-123,180,44.5],['c',15,-135,180,50],              // north slope towards the Forum
  ['b',5,148,0,38],['b',5,171,0,28],['b',5,194,0,18.5]];     // south slope: three long colonnaded ranges stacked down the hill, seen from the Circus
const palBL=PAL_BL.map(([t,lx,lz,tn,y])=>{const k=PAL_BLK[t],q=tn*Math.PI/180;return{t,lx,lz,tn,y,hw:k.w/2,hd:k.d/2,dr:k.dr,c:Math.cos(q),s:Math.sin(q),n:k.n};});
// rebuilt ledge-rock hills (palrock.js, from tools/pal_rock.mjs): outline edges [x,z,nx,nz] of the lowest bench in the model's axes
const PAL_NOROCK=typeof location!=='undefined'&&/[?&]norock/.test(location.search);   // diagnostics: ?norock switches the rock-foot terrain off
const palRockE=(()=>{const o={};if(typeof PAL_ROCK==='undefined')return o;for(const k in PAL_ROCK){const P=PAL_ROCK[k].pts;let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}
  const sg=a>0?1:-1,E=[];for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],dx=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(dx,dz)||1;E.push([p[0],p[1],sg*dz/l,-sg*dx/l]);}o[k]=E;}return o;})();
function palShape(x,z,h){const[lx,lz]=palL(x,z);if(lx<-260||lx>300||lz<-220||lz>260)return h;
  for(const[x0,x1,z0,z1,y]of PAL_PADS){const e=Math.min(lx-x0,x1-lx,lz-z0,z1-lz);if(e>-3)h=Math.min(h,lerp(h,y,clamp((e+3)/4,0,1)));}
  for(const[x0,x1,z0,z1]of PAL_BASIN){const e=Math.min(lx-x0,x1-lx,lz-z0,z1-lz)+1.6;if(e>0)h=Math.min(h,lerp(h,PAL_DECK-.8,sstep(0,1.6,e)));}   // carve reaches 1.6 m beyond the wall line: no terrain pokes through the deck
  // rock hills: terrain under the whole rock mass is the rock's own foot (grid of its lowest ledge heights, so a dipping stack is followed exactly: raised where the slope
  // is lower, cut where it is higher), blending outwards to the natural slope over 18 m - you see the modelled rock, not a terrain lip, a gap or a floating skirt
  if(!PAL_NOROCK){const C=[];   // neighbouring hills overlap: collect every pull, apply the weakest first, among equals the lowest foot first (so the higher rock is never left floating)
    for(const A of PAL_ASSETS){const E=palRockE[A.n];if(!E||A.y===undefined||palInBasin(lx,lz,3))continue;const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),dx=lx-A.lx,dz=lz-A.lz,u=c*dx-s*dz,v=s*dx+c*dz;let d=-1e9;
      for(const[px,pz,nx,nz]of E)d=Math.max(d,(u-px)*nx+(v-pz)*nz);if(d>=20)continue;const G=PAL_ROCK[A.n].g,fx=clamp((u-G.x0)/G.cs-.5,0,G.nx-1.001),fz=clamp((v-G.z0)/G.cs-.5,0,G.nz-1.001),i=Math.floor(fx),j=Math.floor(fz),a=fx-i,b=fz-j,k=j*G.nx+i,
        ft=A.y+(lerp(lerp(G.h[k],G.h[k+1],a),lerp(G.h[k+G.nx],G.h[k+G.nx+1],a),b))/10-.25;
      C.push([d<=2.6?1:1-sstep(2.6,20,d),ft]);}   // the rock's own foot reaches 2.6 m beyond its outline (the terrain mesh cannot step at the very rim)
    C.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);for(const[w,ft]of C)h=lerp(h,ft,w*(1-sstep(8,22,h-ft)));}   // (1-sstep): on the inland side, where the ground is far above the foot, the rock stays buried
  // office blocks last: their pads win over a neighbour's rock skirt
  for(const B of palBL){const dx=lx-B.lx,dz=lz-B.lz,u=B.c*dx-B.s*dz,v=B.s*dx+B.c*dz,e=Math.min(B.hw+1.5-Math.abs(u),B.hd+1.5-Math.abs(v));
    if(e>-3)h=Math.min(h,lerp(h,lerp(B.y-.5,B.y-B.dr-.5,sstep(-4,4,v)),clamp((e+3)/4,0,1)));
    const yb=B.y-(B.dr>6?10.5:10)-.2,e2=Math.min(B.hw+6-Math.abs(u),B.hd+6-Math.abs(v));if(e2>-8&&h<yb)h=lerp(h,yb,clamp((e2+8)/8,0,1));}   // on steep slopes the ground is raised to the foot of the block's walls (the GLB walls go 10 m below the high floor), blending out over 8 m
  return h;}
const palInBasin=(lx,lz,m=0)=>PAL_BASIN.some(([x0,x1,z0,z1])=>lx>x0-m&&lx<x1+m&&lz>z0-m&&lz<z1+m);
function palInAsset(lx,lz,m){for(const A of PAL_ASSETS){const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),dx=lx-A.lx,dz=lz-A.lz,u=c*dx-s*dz,v=s*dx+c*dz;
    if(Math.abs(u)<A.hw+m&&Math.abs(v)<A.hd+m)return true;}
  for(const B of palBL){const dx=lx-B.lx,dz=lz-B.lz,u=B.c*dx-B.s*dz,v=B.s*dx+B.c*dz;if(Math.abs(u)<B.hw+m&&Math.abs(v)<B.hd+m)return true;}
  return false;}
// stair corridors kept free of walls (local lx ranges at the south foot)
const PAL_CL=[];   // local points of the south-slope road (switchbacks from the Apollo precinct to the Circus): terrace walls leave a gate where it crosses
const palSkip=(lx,lz)=>palInAsset(lx,lz,4)||palInBasin(lx,lz,8)||PAL_CL.some(p=>Math.abs(p[0]-lx)<5.5&&Math.abs(p[1]-lz)<5.5);

/* models: stand-ins now, GLBs from rome-assets.js later */
function palPlace(W,gP){const gy=(x,z)=>W.gy(x,z);
  for(const A of PAL_ASSETS){const[x,z]=palW(A.lx,A.lz),rot=PALF.rot+A.turn*DEG,y=A.y??gy(x,z)+.3;
    if(A.n==='rome_tiberiana'){ROME.GLB.push({n:A.n,x,y,z,r:rot,stand:W.dtProc,o:{hide:'glb_dt'}});continue;}
    romeStand(W,A.n,x,z,y,rot,(g,F)=>{
      if(A.n==='rome_apollo'){terraceRect(W,g,F,0,0,47,47,0,34);temple(W,g,{x,y,z:z,rot,W:24,L:40,podH:5,colH:14,nf:6,rows:2,peri:true,colTint:[1,1,.97],seed:.21,pave:false});}
      else if(A.n==='rome_transitoria'){courtBlock(W,g,F,{cx:0,cz:0,w:112,d:92,y0:0,nSt:2,sH:4.8,gH:6,cw:64,cd:48,part:24,seed:.83,sty:15,fl:8|32|4|256});tower(g,F,50,0,12,0,6,5,{part:24,seed:.84});}
      else if(A.n==='rome_domus_augusti')courtBlock(W,g,F,{cx:0,cz:-8,w:70,d:52,y0:0,nSt:1,sH:4,gH:5,cw:34,cd:22,part:0,seed:.55,sty:0,fl:8|16});
      else if(A.n==='rome_magna_mater')temple(W,g,{x,y,z,rot,W:17.5,L:33,podH:6,colH:12,nf:6,rows:3,seed:.4});
      else if(A.n==='rome_victoria')temple(W,g,{x,y,z,rot,W:16,L:28,podH:4,colH:10,nf:6,rows:2,seed:.45});
      else courtBlock(W,g,F,{cx:0,cz:-6,w:28,d:30,y0:0,nSt:2,sH:3.8,gH:4.4,cw:12,cd:10,part:0,seed:.3+A.lx*.001,sty:0,fl:1|64|8});});
    W.foot.add(x,z,A.hw,A.hd,rot);}}

/* terraces: for each level, march rays out from the hilltop; the outer wall stands where the ground drops 6 m below the
   terrace, the floor reaches back to where the ground is level with it */
const PAL_LV=[51,44,37,30,23,16];
function palTerraces(W){{const a=palW(48,132),b=palW(54,240),R=hillRoute(W,a,b,{lim:.15,half:34,step:2.5});W.palClivus=R;PAL_CL.length=0;for(const p of R)PAL_CL.push(palL(p[0],p[1]));}
  const g=new GB(1<<16),C=[20,-15],P=(lx,lz)=>palW(lx,lz),H=(lx,lz)=>{const q=P(lx,lz);return W.gy(q[0],q[1]);},R=RNG(57);
  const xyz=(l,y)=>{const q=P(l[0],l[1]);return[q[0],y,q[1]];};
  W.palWalls=0;
  PAL_LV.forEach((yk,ki)=>{const tk=yk-6,S=[];
    for(let a=-42;a<=208;a+=1.5){const th=a*DEG,dx=Math.cos(th),dz=Math.sin(th);let rIn=null,rOut=null;
      for(let r=36;r<430;r+=1.2){const h=H(C[0]+dx*r,C[1]+dz*r);if(rIn===null&&h<yk)rIn=r;if(h<tk){rOut=r;break;}}
      if(rIn===null||rOut===null||rOut-rIn<3.5){S.push(null);continue;}
      const o=[C[0]+dx*rOut,C[1]+dz*rOut],i=[C[0]+dx*rIn,C[1]+dz*rIn],m=[(o[0]+i[0])/2,(o[1]+i[1])/2];
      S.push(palSkip(o[0],o[1])||palSkip(i[0],i[1])||palSkip(m[0],m[1])?null:{o,i,d:rOut-rIn,a,n:[dx,dz]});}
    for(let k=1;k<S.length-1;k++){const A=S[k-1],B=S[k],Cc=S[k+1];if(A&&B&&Cc){B.o=[(A.o[0]+2*B.o[0]+Cc.o[0])/4,(A.o[1]+2*B.o[1]+Cc.o[1])/4];B.i=[(A.i[0]+2*B.i[0]+Cc.i[0])/4,(A.i[1]+2*B.i[1]+Cc.i[1])/4];}}
    /* hill base after rock_and_base.md: short runs (about 12 m) of pale ashlar with a batter and a coping, set back by 0-3 m from run to run, D-shaped bastions taller than the wall,
       a ledge-rock band at the foot (uneven blocks), gardens instead of paving, stairs along the wall, and gaps (gardens/slope with trees) where a run or a whole sector has no wall */
    const porch=(yk===44||yk===30),RS=8,runOf=k=>Math.floor(k/RS),hz=(k,s)=>hash2(ki*97+runOf(k)*13+s*5,ki*7+3+s*11);let since=0;
    for(let k=0;k<S.length-1;k++){const A=S[k],B=S[k+1];if(!A||!B)continue;const L=Math.hypot(B.o[0]-A.o[0],B.o[1]-A.o[1]);if(L>14||L<.5)continue;
      if(ki>1&&hash2(ki*53+Math.floor(A.a/16),11)<.3)continue;                                       // sector without this level
      W.palWalls++;const nx=(A.n[0]+B.n[0])/2,nz=(A.n[1]+B.n[1])/2,ux=(B.o[0]-A.o[0])/L,uz=(B.o[1]-A.o[1])/L,wr=PALF.rot-Math.atan2(uz,ux);
      const wn=(()=>{const a=P(0,0),b=P(nx,nz);const vx=b[0]-a[0],vz=b[1]-a[1],l=Math.hypot(vx,vz)||1;return[vx/l,0,vz/l];})();
      const gap=hz(k,1)<.2,sb=gap?0:hz(k,2)*3.2,sh=(Q,n,d)=>[Q[0]+n[0]*d,Q[1]+n[1]*d],oA=sh(A.o,A.n,-sb),oB=sh(B.o,B.n,-sb),iA=sh(A.i,A.n,-sb*.6),iB=sh(B.i,B.n,-sb*.6);
      const ybA=Math.min(H(oA[0]+nx*2,oA[1]+nz*2),H(oA[0],oA[1]))-1.6,ybB=Math.min(H(oB[0]+nx*2,oB[1]+nz*2),H(oB[0],oB[1]))-1.6,ht=yk-Math.max(ybA,ybB);
      const off=(Q,d)=>[Q[0]+nx*d,Q[1]+nz*d];
      if(gap){   // garden gap: the slope stays; cypresses and pines in loose groups, shrubs and flowers
        if(k%3===0){const q=xyz(off(A.o,-3-R()*3),0),y=H(off(A.o,-3)[0],off(A.o,-3)[1]);W.trees.push([q[0],y,q[2],R()<.55?'cyp':'pine',.8+R()*.4]);}
        if(k%2===0){const t2=off(A.o,-1-R()*5),q=xyz(t2,0),y=H(t2[0],t2[1]);W.trees.push([q[0],y,q[2],impGarden(R()),.7+R()*.6,null,1]);}
        continue;}
      // floor: a garden terrace (gravel path along the edge), paving only behind the porticoes
      const wp=porch&&hz(k,5)>.45;g.set(wp?11:23,.4);g.poly([xyz(oA,yk+.06),xyz(oB,yk+.06),xyz(iB,yk+.06),xyz(iA,yk+.06)],[0,1,0]);
      g.set(5,.4);g.poly([xyz(sh(oA,A.n,-.4),yk+.09),xyz(sh(oB,B.n,-.4),yk+.09),xyz(sh(oB,B.n,-2.4),yk+.09),xyz(sh(oA,A.n,-2.4),yk+.09)],[0,1,0]);
      // retaining wall with a 4 % batter, coping, parapet on part of the runs
      const bt=.04*ht,lA=sh(oA,A.n,bt),lB=sh(oB,B.n,bt),wseed=.3+hz(k,6)*.5;
      g.set(2,wseed);g.poly([xyz(lA,ybA),xyz(lB,ybB),xyz(oB,yk+.1),xyz(oA,yk+.1)],wn);
      const cA=sh(oA,A.n,.35),cB=sh(oB,B.n,.35),dA=sh(oA,A.n,-.45),dB=sh(oB,B.n,-.45);
      g.set(2,.62);g.poly([xyz(cA,yk+.5),xyz(cB,yk+.5),xyz(dB,yk+.5),xyz(dA,yk+.5)],[0,1,0]);g.poly([xyz(cA,yk-.05),xyz(cB,yk-.05),xyz(cB,yk+.5),xyz(cA,yk+.5)],wn);
      if(hz(k,3)>.45){g.set(2,.5);g.poly([xyz(sh(oA,A.n,.2),yk+1.32),xyz(sh(oB,B.n,.2),yk+1.32),xyz(sh(oB,B.n,-.12),yk+1.32),xyz(sh(oA,A.n,-.12),yk+1.32)],[0,1,0]);
        g.poly([xyz(sh(oA,A.n,.2),yk+1.12),xyz(sh(oB,B.n,.2),yk+1.12),xyz(sh(oB,B.n,.2),yk+1.32),xyz(sh(oA,A.n,.2),yk+1.32)],wn);
        since+=L;if(since>2.4){since=0;const q=xyz(oA,yk+.5);g.set(2,.5);box(g,frame(q[0],q[1],q[2],0),0,0,0,.16,.9,.16,31);}}
      // run ends: a return wall where the set-back changes
      if(k%RS===0||k%RS===RS-1){const e=k%RS===0?A:B,o0=e.o,o1=k%RS===0?oA:oB,u2=k%RS===0?-1:1,yb=k%RS===0?ybA:ybB;g.set(2,wseed);g.poly([xyz(o0,yb),xyz(o1,yb),xyz(o1,yk+.1),xyz(o0,yk+.1)],[(ux*PALF.c+uz*PALF.s)*u2,0,(-ux*PALF.s+uz*PALF.c)*u2]);}
      // D-shaped bastions about every 16 m, 0.9 m taller than the wall, with a coping disc
      if(k%11===5){const q=xyz(sh(oA,A.n,-.9),0),ybm=Math.min(ybA,ybB),h=yk-ybm+.9,Rb=3+hz(k,7)*1.1;g.set(2,wseed);lathe(g,frame(q[0],ybm,q[2],0),0,0,0,[[Rb,0],[Rb*.97,h*.5],[Rb*.94,h],[Rb+.28,h],[Rb+.28,h+.35],[0,h+.35]],14);}
      if(ht>3.2){g.set(2,.45);g.poly([xyz(sh(oA,A.n,bt*.5+.04),yk-2.6),xyz(sh(oB,B.n,bt*.5+.04),yk-2.6),xyz(sh(oB,B.n,bt*.5+.04),yk-2.35),xyz(sh(oA,A.n,bt*.5+.04),yk-2.35)],wn);}
      // ledge-rock band at the foot: uneven blocks of grey bedded stone, a few on top of one another, never one straight line
      {const d1=1.4+R()*1.2,pp=sh([(oA[0]+oB[0])/2,(oA[1]+oB[1])/2],A.n,d1+bt),qq=xyz(pp,0),gh=H(pp[0],pp[1]),F=frame(qq[0],gh-2,qq[2],wr+(R()-.5)*.5),hx=L*.5+.5+R()*.7,hd=1.3+R()*1.3,h1=Math.min(2.4,(yk-gh)*.14+.5+R()*.7);
        g.set(33,.2+R()*.5);box(g,F,0,0,0,hx,h1+2,hd,31);   // a continuous, uneven ledge: each block overlaps its neighbours; a second course on some, a jutting block now and then
        if(R()<.55){g.set(33,.2+R()*.5);box(g,frame(qq[0]+(R()-.5)*L*.4,gh+h1-.35,qq[2]+(R()-.5)*.8,wr+(R()-.5)*.6),0,0,0,hx*.6,.6+R()*.5,hd*.7,31);}
        if(R()<.22){const p3=sh(pp,A.n,2.2+R()*1.4),q3=xyz(p3,0),g3=H(p3[0],p3[1]);g.set(33,.5);box(g,frame(q3[0],g3-1.2,q3[2],R()*3),0,0,0,1.2+R()*1.1,1.3+R()*.8,1+R()*.8,31);}}
      // portico against the slope (stacked colonnades seen from the Circus), only on some runs of the two porch levels
      if(wp&&A.d>8.5&&B.d>8.5){const cA2=[iA[0]+A.n[0]*5,iA[1]+A.n[1]*5],cB2=[iB[0]+B.n[0]*5,iB[1]+B.n[1]*5];
        g.set(24,.6,0,8,1,6.8,0,.6);g.poly([xyz(iA,yk-.5),xyz(iB,yk-.5),xyz(iB,yk+7.2),xyz(iA,yk+7.2)],wn,[[0,-.5],[L,-.5],[L,7.2],[0,7.2]],L,4);
        {const q=xyz(cA2,yk);W.cols.ion.push([q[0],yk,q[2],PALF.rot,5.2,[1,.97,.9]]);}
        g.set(2,.5);g.poly([xyz(cA2,yk+5.2),xyz(cB2,yk+5.2),xyz(cB2,yk+6),xyz(cA2,yk+6)],wn);
        const eA=[cA2[0]+A.n[0]*.6,cA2[1]+A.n[1]*.6],eB=[cB2[0]+B.n[0]*.6,cB2[1]+B.n[1]*.6];
        g.set(1,.5);g.poly([xyz(eA,yk+6),xyz(eB,yk+6),xyz(iB,yk+7.4),xyz(iA,yk+7.4)],[0,1,0]);g.poly([xyz(iA,yk+7.3),xyz(iB,yk+7.3),xyz(eB,yk+5.9),xyz(eA,yk+5.9)],[0,-1,0]);}
      else{if(k%4===0&&A.d>6){const q=xyz(sh(oA,A.n,-2.2),yk);W.trees.push([q[0],yk,q[2],R()<.62?'cyp':'pine',.8+R()*.3]);}
        if(k%3===1&&A.d>5){const t2=sh(oA,A.n,-3.4-R()*Math.max(1,A.d-6)*.5),q=xyz(t2,yk);W.trees.push([q[0],yk,q[2],impGarden(R()),.7+R()*.6,null,1]);}}
      if(!porch&&k%17===5&&A.d>13){const c=[(A.o[0]+A.i[0])/2,(A.o[1]+A.i[1])/2],q=xyz(c,yk);fountain(W,g,q[0],q[2],{hx:2.6,hz:2.6,y:yk+.05,statue:1.8});}
      if(k%11===3){const q=xyz(sh(oA,A.n,-1.1),yk);pedestalStatue(g,frame(q[0],yk,q[2],0),0,0,0,2.4,{gilt:R()<.2});}
      // stairs climbing along the wall face to the terrace below, with a cheek wall on the open side
      if(ki<PAL_LV.length-1&&k%RS===1&&(runOf(k)+ki*2)%5===0){   // staggered by two runs per level: flights never line up into one long stair; you walk along each terrace to the next flight
        const run=12,n=36;
        for(let s=0;s<n;s++){const t=(s+.5)/n*run,p=[oA[0]+ux*t+nx*2.1,oA[1]+uz*t+nz*2.1],q=xyz(p,0),ys=yk-7+(s+1)*7/n;g.set(2,.42);box(g,frame(q[0],0,q[2],wr),0,yk-7.5,0,run/n/2+.02,ys-(yk-7.5),1.3,31);
          const p2=[p[0]+nx*1.55,p[1]+nz*1.55],q2=xyz(p2,0);g.set(2,.55);box(g,frame(q2[0],0,q2[2],wr),0,yk-7.5,0,run/n/2+.02,ys-(yk-7.5)+.7,.18,31);}}
      const mx=(A.o[0]+B.i[0])/2,mz=(A.o[1]+B.i[1])/2,q=P(mx,mz);W.foot.add(q[0],q[1],Math.max(L,4)/2+1,(A.d+B.d)/4+1,wr,'open');}});   // 'open': garden terraces count as vegetation for the street raster
  flushColumns(W);const m=g.mesh(MAT.city);if(m)W.scene.add(m);}

/* ================= crowded saddle: block stand-ins, basin deck, walls, cryptoporticus, temple, gardens ================= */
const PFR=frame(PALF.ox,0,PALF.oz,PALF.rot);                       // the Palatine grid as a frame: PFR.p(lx,y,lz) = world point at local (lx,lz), absolute y
const PAL_OBS=[[104,123,-1,34]];                                    // extra obstacles (Jupiter Victor temple with stair and altar)
const PAL_ZONES=[[-215,-72,16,60],[10,140,-14,30],[136,180,-50,55]]; // plateau strips that get paved ground
const PAL_FILLED=[...PAL_BASIN,...PAL_ZONES];                       // where the old street-grid generator must stay out
const palFilled=(x,z)=>{const[lx,lz]=palL(x,z);return PAL_FILLED.some(([x0,x1,z0,z1])=>lx>x0-12&&lx<x1+12&&lz>z0-12&&lz<z1+12);};
// stand-in for rome_pal_block_*: nominal sizes (a 36x30, b 60x16, c 30x30, d 34x26), low floor at -dr, high floor at 0, front = +z
function palBlockStand(W,g,F,B){const dr=B.dr,L=-dr,R=RNG(Math.abs(Math.round(B.lx*31+B.lz*17))+5),sd=.06+R()*.85;
  const fac=o=>Object.assign({part:0,seed:sd,sty:3,fl:8|32,nSt:2,gH:4.4,sH:3.5,lit:.8},o);
  const stairs=(x,z0,z1,y0,y1)=>{const n=Math.round((y1-y0)/.3),dz=(z1-z0)/n;g.set(2,.45);for(let i=0;i<n;i++)box(g,F,x,y0-1,z0+dz*(i+.5),1.2,1+(i+1)*(y1-y0)/n,Math.abs(dz)/2+.02,31);};
  if(B.t==='a'){courtBlock(W,g,F,{cx:0,cz:-5.5,w:36,d:21,y0:0,nSt:2,sH:3.8,gH:4.6,cw:12,cd:8,part:0,seed:sd,sty:3,fl:8|32,garden:false});
    const t=L+4.4+2*3.4;rectWalls(g,F,0,10,36,10,L-2,t,L,fac({nSt:3,sty:11,fl:8|2|32,sH:3.4}));roof(g,F,'gable',0,10,36,10,t,17*DEG,.6,sd,{part:0,seed:sd,nSt:3,gH:4.4,sH:3.4,floorY:L});
    arcade(g,F,0,L,15.7,36,4.2,7,1.3,2,{span:.34,attic:.8});stairs(19.2,14,-2,L,0);}
  else if(B.t==='b'){const t=L+4.2+3.6;rectWalls(g,F,0,3.5,60,9,L-2,t,L,fac({nSt:2,gH:4.2,sH:3.6,sty:11,fl:8|2|32}));roof(g,F,'gable',0,3.5,60,9,t,14*DEG,.6,sd,{part:0,seed:sd,nSt:2,gH:4.2,sH:3.6,floorY:L});
    arcade(g,F,0,L,8.3,60,4,15,1.1,2,{span:.34,attic:.8});
    for(let i=0;i<5;i++){const x=-24+12*i,yo=3.4+(i%3)*1.2;rectWalls(g,F,x,-4.5,11.4,7,L-2,yo,0,fac({nSt:1,gH:yo,sH:3,sty:3,fl:2|8|16,seed:sd+i*.07}));roof(g,F,'gableZ',x,-4.5,11.4,7,yo,22*DEG,.4,sd+i*.1,{part:0,seed:sd,nSt:1,gH:yo,sH:3,floorY:0});}}
  else if(B.t==='c'){g.set(6,.4);box(g,F,0,L-1,-6,15,1-L,9,31);g.set(23,.5);g.poly([F.p(-15,.06,3),F.p(15,.06,3),F.p(15,.06,-15),F.p(-15,.06,-15)],[0,1,0]);
    rectWalls(g,F,0,-10.5,30,9,L-1,7.6,0,fac({nSt:2,gH:4.2,sH:3.4}));roof(g,F,'gable',0,-10.5,30,9,7.6,20*DEG,.6,sd,{part:0,seed:sd,nSt:2,gH:4.2,sH:3.4,floorY:0});
    const t=L+4.4+2*3.2;rectWalls(g,F,-9.5,9,11,12,L-1,t,L,fac({nSt:3,gH:4.4,sH:3.2,seed:sd+.1}));roof(g,F,'hip',-9.5,9,11,12,t,24*DEG,.6,sd+.1);
    tower(g,F,11.5,10.5,7,L,3,3.5,{part:0,seed:sd+.2});
    g.set(22,.45);box(g,F,0,L,3.1,15,-L,.6,31);for(const x of[-13,-5,4,12])box(g,F,x,L,3.9,.6,-L-.4,.7,31);g.set(2,.5);box(g,F,0,0,3.1,15.3,1,.18,31);
    {const q=F.p(5,.4,-6);W.poolG.set(0,.5);W.poolG.poly([F.p(2,.32,-3),F.p(8,.32,-3),F.p(8,.32,-9),F.p(2,.32,-9)],[0,1,0]);}
    pedestalStatue(g,F,-6,-5,.06,3.2,{});g.set(3,.4);for(const[x,z]of[[-12,-2],[-4,-2],[-12,-8],[-4,-8]])box(g,F,x,0,z,.1,2.5,.1,31);box(g,F,-8,2.5,-5,4.2,.15,3.4,31);}
  else{courtBlock(W,g,F,{cx:0,cz:-6.5,w:34,d:16,y0:0,nSt:2,sH:3.6,gH:4.4,cw:14,cd:7,part:22,seed:sd,sty:0,fl:1|4,garden:false});
    rectWalls(g,F,0,8,34,10,L-2,L+7.4,L,{part:9,seed:sd,sty:3,fl:1,nSt:1,gH:7.4,sH:3,lit:.2});roof(g,F,'flat',0,8,34,10,L+7.4,0,0,sd,{part:9,seed:sd,nSt:1,gH:7.4,sH:3,floorY:L});stairs(18.4,13,0,L,0);}}
function palBlocks(W){const gF=new GB(1<<14);
  for(const B of palBL){const[x,z]=palW(B.lx,B.lz),rot=PALF.rot+B.tn*DEG;romeStand(W,B.n,x,z,B.y,rot,(g,F)=>palBlockStand(W,g,F,B));W.foot.add(x,z,B.hw,B.hd,rot);
    // solid foundation under the lowest floor: hidden inside the walls, shows only where the ground falls away
    const F=frame(x,B.y,z,rot);let m=1e9;for(const[sx,sz]of[[-1,-1],[1,-1],[1,1],[-1,1],[0,-1],[0,1],[-1,0],[1,0],[0,0]]){const q=F.p(sx*B.hw,0,sz*B.hd);m=Math.min(m,W.gy(q[0],q[2]));}
    // where the ground falls far below the low floor the foundation steps down in 3 m ledges (paved, with coping and planting), not one plain wall
    ROME.supports=ROME.supports||[];ROME.supports.push({x,z,c:Math.cos(rot),s:Math.sin(rot),hw:B.hw,hd:B.hd+9});
    const top=B.y-B.dr-.35,D=top-m,n=D>5?Math.min(3,Math.ceil(D/5)-1):0,y0=m-1.5-B.y;
    if(D>.3){gF.set(6,.4);box(gF,F,0,y0,0,B.hw-.5,top-m+1.5,B.hd-.5,31);}
    for(let j=1;j<=n;j++){const yj=top-D*j/(n+1),ez=3*j,zf=B.hd-.5+ez,r=RNG(j*17+Math.round(B.lx));gF.set(22,.42);box(gF,F,0,y0,ez/2,B.hw-.5,yj-m+1.5,B.hd-.5+ez/2,31);
      gF.set(11,.4);gF.poly([F.p(-B.hw+.5,yj-B.y+.03,zf),F.p(B.hw-.5,yj-B.y+.03,zf),F.p(B.hw-.5,yj-B.y+.03,zf-2.6),F.p(-B.hw+.5,yj-B.y+.03,zf-2.6)],[0,1,0]);
      gF.set(2,.5);box(gF,F,0,yj-B.y-.4,zf-.2,B.hw-.3,.5,.4,31);
      for(let x=-B.hw+3;x<B.hw-2;x+=5+r()*4){const q=F.p(x,0,zf-1.5);W.trees.push([q[0],yj,q[2],r()<.55?'cyp':'shrub',.6+r()*.4]);}}}
  const mm=gF.mesh(MAT.city);if(mm)W.scene.add(mm);}
// obstacles for planting: axis-aligned local rects of heroes, blocks, temple, cryptoporticus
const PAL_CRYPTO=[[-72,-64.5],[-69,-64.5],[-69,-101.5],[2,-101.5],[10,-97.5]];   // Nero's cryptoporticus: from the Tiberiana's east wall, north along it, east along the north edge of the saddle, bending to the Transitoria
function palObstacles(){const o=[];for(const B of palBL){const a=Math.abs(B.c),b=Math.abs(B.s),ex=a*B.hw+b*B.hd,ez=b*B.hw+a*B.hd;o.push([B.lx-ex,B.lx+ex,B.lz-ez,B.lz+ez]);}
  for(const A of PAL_ASSETS){const a=Math.abs(Math.cos(A.turn*DEG)),b=Math.abs(Math.sin(A.turn*DEG)),ex=a*A.hw+b*A.hd,ez=b*A.hw+a*A.hd;o.push([A.lx-ex,A.lx+ex,A.lz-ez,A.lz+ez]);}
  for(let i=0;i<PAL_CRYPTO.length-1;i++){const a=PAL_CRYPTO[i],b=PAL_CRYPTO[i+1];o.push([Math.min(a[0],b[0])-3,Math.max(a[0],b[0])+3,Math.min(a[1],b[1])-3,Math.max(a[1],b[1])+3]);}
  return o.concat(PAL_OBS);}
const palClear=(O,lx,lz)=>{let m=1e9;for(const[x0,x1,z0,z1]of O){const dx=Math.max(x0-lx,0,lx-x1),dz=Math.max(z0-lz,0,lz-z1);m=Math.min(m,(dx||dz)?Math.hypot(dx,dz):-Math.min(lx-x0,x1-lx,lz-z0,z1-lz));}return m;};
/* Nero's cryptoporticus (Cryptoporticus Neroniana): lower level = half-sunk vaulted corridor (brick walls 2.6 m above the ground, a row of small arched
   windows every ~3.5 m, cornice; only parts 0/9/24/30 get windows from the wall shader); upper level on its roof = covered walkway (travertine floor, small columns on both sides, tile gable roof).
   An arched passage lets a lane run under it where the route crosses one; both ends have arched doors. */
const PAL_ARCHES=[[2,-26.5]];                                      // [segment index, lx of a lane crossing it]
function palGallery(W,g){const y0=PAL_DECK+.12,Wd=5.8,P=PAL_CRYPTO,n=P.length-1,seed=.1;
  const col=(F,x,z,h,rot)=>W.cols.dor.push([...F.p(x,y0+3,z),rot,h,[1,.97,.92]]);
  const body=(F,cx,len,rot,arch)=>{  // one straight piece of the gallery in frame F (local x along the route)
    if(arch)arcade(g,F,cx,y0-.3,0,len,2.9,1,Wd,22,{span:.26,attic:.5,pilasters:false,cornice:false});
    else rectWalls(g,F,cx,0,len,Wd,y0-.5,y0+2.6,y0-2.5,{part:9,seed,sty:1,fl:0,nSt:3,gH:2.5,sH:2.6,lit:0});   // floorY y0-2.5: the wall shader keeps gH>=2.5, so this puts the first storey (small arched windows) above the ground
    g.set(2,.5);box(g,F,cx,y0+2.55,0,len/2+.2,.45,Wd/2+.35,31);                       // cornice slab
    g.set(33,.3);g.poly([F.p(cx-len/2,y0+3.02,-2.9),F.p(cx+len/2,y0+3.02,-2.9),F.p(cx+len/2,y0+3.02,2.9),F.p(cx-len/2,y0+3.02,2.9)],[0,1,0]);   // travertine floor of the walkway
    for(let t=-len/2+.5;t<=len/2-.2;t+=2.6)for(const sd of[-1,1])col(F,cx+t,sd*2.6,2.8,rot);
    g.set(2,.5);for(const sd of[-1,1])box(g,F,cx,y0+5.8,sd*2.6,len/2+.1,.4,.32,31);   // architraves
    roof(g,F,'gableX',cx,0,len+.2,6.4,y0+6.2,16*DEG,.3,.05,{part:24,seed:.46,nSt:1,gH:3,sH:3,floorY:y0+3});};
  const corner=(lx,lz,door)=>{rectWalls(g,PFR,lx,lz,Wd,Wd,y0-.5,y0+2.6,y0-2.5,{part:9,seed,sty:1,fl:0,nSt:3,gH:2.5,sH:2.6,lit:0});g.set(2,.5);box(g,PFR,lx,y0+2.55,lz,Wd/2+.35,.45,Wd/2+.35,31);
    g.set(33,.3);g.poly([PFR.p(lx-2.9,y0+3.02,lz-2.9),PFR.p(lx+2.9,y0+3.02,lz-2.9),PFR.p(lx+2.9,y0+3.02,lz+2.9),PFR.p(lx-2.9,y0+3.02,lz+2.9)],[0,1,0]);
    for(const[a,b]of[[-2.6,-2.6],[2.6,-2.6],[2.6,2.6],[-2.6,2.6]])W.cols.dor.push([...PFR.p(lx+a,y0+3,lz+b),PALF.rot,2.8,[1,.97,.92]]);
    roof(g,PFR,'pyr',lx,lz,6.4,6.4,y0+6.2,22*DEG,.3,.05);
    if(door){const S=PFR.sub(lx,0,lz+Wd/2+.03,0);g.set(7,.3);g.poly(arch(g,S,0,1.15,y0,1.6,0),S.d(0,0,1));g.set(2,.5);box(g,S,-1.4,y0,0,.2,3.2,.3,31);box(g,S,1.4,y0,0,.2,3.2,.3,31);box(g,S,0,y0+3.1,0,1.7,.3,.3,31);}};
  // piers where the ground falls away from the gallery's floor (outer edge and the far side), carrying it on a row of squat stone piers with a string course
  for(let i=0;i<n;i++){const a=P[i],b=P[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len;
    for(let t=1;t<len;t+=5.8)for(const sd of[-1,1]){const lx=a[0]+ux*t-uz*sd*3.05,lz=a[1]+uz*t+ux*sd*3.05,q=PFR.p(lx,0,lz),gh=W.gy(q[0],q[2]);if(gh<y0-.6&&PAL_DECK-gh>.6){g.set(22,.45);box(g,PFR,lx,gh-1.2,lz,.75,y0-gh+1.2,.75,31);g.set(2,.5);box(g,PFR,lx,y0-.5,lz,1,.35,1,31);}}}
  let total=0;
  for(let i=0;i<n;i++){const a=P[i],b=P[i+1],A=palW(a[0],a[1]),B=palW(b[0],b[1]),L=Math.hypot(B[0]-A[0],B[1]-A[1]),rot=Math.atan2(-(B[1]-A[1]),B[0]-A[0]),st=i>0?Wd/2:0,en=i<n-1?Wd/2:0,len=L-st-en,cx=(st-en)/2,F=frame((A[0]+B[0])/2,0,(A[1]+B[1])/2,rot);total+=L;
    const arch=PAL_ARCHES.filter(q=>q[0]===i).map(q=>{const t=Math.abs(q[1]-a[0])/Math.hypot(b[0]-a[0],b[1]-a[1])*L-L/2;return t;});   // arch centre along the piece
    if(!arch.length)body(F,cx,len,rot,false);
    else{let lo=cx-len/2;for(const t of arch.sort((u,v)=>u-v)){const w=6.4,e0=t-w/2;if(e0>lo+.5)body(F,(lo+e0)/2,e0-lo,rot,false);body(F,t,w,rot,true);lo=t+w/2;}if(cx+len/2>lo+.5)body(F,(lo+cx+len/2)/2,cx+len/2-lo,rot,false);}}
  for(let i=1;i<n;i++)corner(P[i][0],P[i][1],i===1||i===n-1);
  const q=palW(-34,-101.5),gyq=y0+3;W.palGalleryLen=total;
  W.pois.push({n:'尼禄的长廊',l:'Cryptoporticus Neroniana',x:q[0],z:q[1],y:gyq+9,s0:0,s1:99,d:700,sub:true,info:'【史】帕拉蒂尼山上至今还保存着一段半埋在地下的拱顶长廊（约130米），光线从拱顶的窗洞透进来，连接提比略宫一带和东面的宫殿。山坡上能看到的屋顶上那层有柱子的有顶步道是复原想象。'});}
function palBasins(W){const g=new GB(1<<16),dk=PAL_DECK+.12,P=(lx,y,lz)=>PFR.p(lx,y,lz),qd=(x0,x1,z0,z1,y)=>[P(x0,y,z1),P(x1,y,z1),P(x1,y,z0),P(x0,y,z0)],O=palObstacles(),R=RNG(31);
  const stairs=(x0,x1,z0,z1,y0,y1,ax,wd,cheek)=>{const n=Math.max(2,Math.round(Math.abs(y1-y0)/.3));g.set(2,.45);
    for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,h=Math.abs(y1-y0)*t1+(y1>y0?0:0);const yy=Math.min(y0,y1);
      if(ax==='x')box(g,PFR,lerp(x0,x1,(t0+t1)/2),yy-.6,(z0+z1)/2,Math.abs(x1-x0)/n/2+.02,.6+Math.abs(y1-y0)*(y1>y0?t1:1-t0),wd/2,31);
      else box(g,PFR,(x0+x1)/2,yy-.6,lerp(z0,z1,(t0+t1)/2),wd/2,.6+Math.abs(y1-y0)*(y1>y0?t1:1-t0),Math.abs(z1-z0)/n/2+.02,31);}
    if(cheek)for(const sd of[1,-1]){if(ax==='x')box(g,PFR,(x0+x1)/2,Math.min(y0,y1)-.6,(z0+z1)/2+sd*(wd/2+.4),Math.abs(x1-x0)/2,Math.abs(y1-y0)+1.7,.4,31);else box(g,PFR,(x0+x1)/2+sd*(wd/2+.4),Math.min(y0,y1)-.6,(z0+z1)/2,.4,Math.abs(y1-y0)+1.7,Math.abs(z1-z0)/2,31);}};
  // paved deck of the basins, kerbs along the walls
  g.set(11,.3);for(const[x0,x1,z0,z1]of PAL_BASIN)g.poly(qd(x0,x1,z0,z1,dk),[0,1,0]);
  // retaining walls: the plateau is 5 m above the deck on the east (strip A) and the west (south of the Tiberiana)
  const topY=PAL_TOP,wh=topY-(PAL_DECK-.6);
  // east wall (lx 8.8..10, z -10..26, stair opening 5.5..10.5) and west wall (lx -72..-70.8, z 22..76, opening 66..71): plateau side higher by 5 m
  for(const[cx,za,zb,fx]of[[9.4,-10,5.5,-1],[9.4,10.5,26,-1],[-71.4,22,66,1],[-71.4,71,76,1]]){const cz=(za+zb)/2,hz=(zb-za)/2;g.set(22,.45);box(g,PFR,cx,PAL_DECK-.6,cz,.6,wh,hz,31);g.set(2,.5);box(g,PFR,cx,topY-.45,cz,.85,.5,hz,31);
    for(let k=za+3;k<zb-1;k+=9){g.set(22,.5);box(g,PFR,cx+fx*.9,PAL_DECK-.6,k,.9,wh-.5,.7,31);}
    g.set(2,.5);for(let k=za+.5;k<=zb-.4;k+=2.4)box(g,PFR,cx-fx*.2,topY+.05,k,.14,.9,.14,31);}
  // rim promenades on the plateau side of both walls (flat, flush with the wall tops: they also cover the small ditch behind)
  g.set(11,.35);g.poly(qd(8.8,17,-10,26,topY+.06),[0,1,0]);g.poly(qd(-79,-70.8,22,76,topY+.06),[0,1,0]);
  // north edge (cliff top above the Forum slope): where the ground beyond is lower than the deck the wall faces out and carries a parapet, where it is higher the wall retains it
  for(let x=-72;x<10;x+=4){const gq=a=>{const q=PFR.p(a,0,-108);return W.gy(q[0],q[2]);},gyc=Math.min(gq(x),gq(x+2),gq(x+4));
    if(gyc<PAL_DECK-.3){g.set(22,.45);box(g,PFR,x+2,gyc-1.6,-106.2,2.03,PAL_DECK-gyc+1.6,.6,31);if(((x+72)/4|0)%2===0){g.set(22,.5);box(g,PFR,x+2,gyc-1.6,-107.2,.8,PAL_DECK-gyc+1.2,.7,31);}
      g.set(2,.5);box(g,PFR,x+2,PAL_DECK-.4,-106.2,2.03,.5,.85,31);}
    else{g.set(22,.45);box(g,PFR,x+2,PAL_DECK-.6,-106,2.03,Math.max(.5,gyc+.25-PAL_DECK+.6),.6,31);g.set(2,.5);box(g,PFR,x+2,Math.max(PAL_DECK,gyc)-.2,-106.1,2.03,.45,.85,31);}}
  ROME.supports=ROME.supports||[];ROME.supports.push({x:PFR.p(-47.5,0,76.9)[0],z:PFR.p(-47.5,0,76.9)[2],c:Math.cos(PALF.rot),s:Math.sin(PALF.rot),hw:37.5,hd:1.1});   // (the float check knows this wall carries the Augusti)
  // plinth wall along the Augusti's north front (its facade ends at the plateau level, the basin deck is 5 m lower)
  g.set(22,.45);box(g,PFR,-47.5,PAL_DECK-.6,76.9,37.5,PAL_TOP-.5-PAL_DECK+.6,1.1,31);
  // short west wall north of the Tiberiana's corner
  {const gy=W.gy(PFR.p(-74,0,-98)[0],PFR.p(-74,0,-98)[2]);if(gy<PAL_DECK-.3){g.set(22,.45);box(g,PFR,-71.4,gy-1.6,-98.5,.6,PAL_DECK-gy+1.6,7.5,31);}}
  // stairs from the deck up to the two promenades
  stairs(2,10.4,5.5,10.5,PAL_DECK,topY,'x',5,true);stairs(-72.4,-65,66,71,topY,PAL_DECK,'x',5,true);
  // a fountain in the corner of the south basin, planters along the lanes
  fountain(W,g,PFR.p(1,0,13)[0],PFR.p(1,0,13)[2],{hx:3.2,hz:3.2,y:dk,statue:2.6,rot:PALF.rot});
  palGallery(W,g);
  // watered ground (cisterns and pipes): palace gardens stay green all summer, the bare slopes outside dry to straw
  for(const[lx,lz,r]of[[-138,-30,80],[73,-63,66],[37,74,68],[-47,100,52],[-154,100,44],[-24,-30,72],[-100,-80,40],[190,-30,52]]){const q=PFR.p(lx,0,lz);WAT.add(q[0],q[2],r);}
  {const dq=(lx,lz)=>{const q=PFR.p(lx,0,lz);return[q[0],W.gy(q[0],q[2]),q[2]];};   // Suetonius, Aug. 92: a date palm sprang up between the paving stones before the house; two laurels flank the door
   for(const lx of[-52,-43]){const q=dq(lx,74.5);W.trees.push([q[0],q[1],q[2],'broad',.5,[.04,.085,.03],1]);}
   {const q=dq(-30,73);W.trees.push([q[0],q[1],q[2],'palm',1,null,1]);}}
  // trees and shrubs in every gap: umbrella pines in the open corners, cypresses along the lanes, shrubs and flower beds elsewhere
  const spots=[];for(const[x0,x1,z0,z1]of PAL_BASIN)for(let lx=x0+2;lx<x1;lx+=3)for(let lz=z0+2;lz<z1;lz+=3)spots.push([lx+(R()-.5)*1.6,lz+(R()-.5)*1.6,PAL_DECK]);
  for(const[x0,x1,z0,z1]of PAL_ZONES)for(let lx=x0+2;lx<x1;lx+=3.5)for(let lz=z0+2;lz<z1;lz+=3.5)spots.push([lx+(R()-.5)*1.8,lz+(R()-.5)*1.8,null]);
  const lastP=[];for(const[lx,lz,yy]of spots){const c=palClear(O,lx,lz);if(c<1.6)continue;if(lastP.some(p=>Math.hypot(p[0]-lx,p[1]-lz)<(p[2]?7.5:3)))continue;
    const q=PFR.p(lx,0,lz),y=yy??W.gy(q[0],q[2]);
    if(c>2.4&&hash2(lx*.77,lz*.61)<.24){const b=hash2(lx*.31,lz*1.7);W.trees.push([q[0],y,q[2],b<.45?'flower':b<.65?'almond':b<.8?'pomegr':'shrub',.7+R()*.5,null,1]);lastP.push([lx,lz,0]);continue;}   // rose and flower beds, almond and pomegranate between the trees (Nero's garden: the winter forced roses are here)
    const nAp=Math.hypot(lx-37,lz-74)<80,nMM=Math.hypot(lx+154,lz-100)<60;   // laurel grove at the Apollo precinct, stone pines at the Magna Mater (Attis)
    if(c>7.5&&R()<.8){W.trees.push([q[0],y,q[2],nMM||R()<.45?'pine':'plane',.75+R()*.3,null,1]);lastP.push([lx,lz,1]);}
    else if(c>2.4&&R()<.7){const r=R();W.trees.push([q[0],y,q[2],nAp?(r<.8?'broad':'cyp'):nMM?'pine':(r<.5?'cyp':r<.75?'broad':'plane'),.55+R()*.3,nAp||r>=.5&&r<.75?[.04,.085,.03]:null,1]);lastP.push([lx,lz,0]);}
    else if(R()<.55){W.trees.push([q[0],y,q[2],impGarden(R()),.7+R()*.5,null,1]);lastP.push([lx,lz,0]);}}
  {let nb=0;for(const[lx,lz,yy]of spots){if(nb>110)break;if(hash2(lx*.53,lz*.47)>.34)continue;const c=palClear(O,lx+1.5,lz+1.5);if(c<1.2)continue;const q=PFR.p(lx+1.5,0,lz+1.5),y=yy??W.gy(q[0],q[2]);W.trees.push([q[0],y,q[2],'flower',.5+R()*.4,null,1]);nb++;}W.palBeds=nb;}   // imperial rose and flower beds (the richest planting in Rome; a few roses stay in flower all winter, forced with warm water: Seneca, Ep. 122.8)
  // buttress blocks under the last rim cells where a hill model's lowest ledge still hangs above the terrain (found with __floatCheck)
  for(const[lx,lz,hw,top]of[[62,-125,6,42.9],[6,25,6,53.9],[-10,80,5,55.9]]){const q=PFR.p(lx,0,lz),gh=W.gy(q[0],q[2]);g.set(33,.5);box(g,PFR,lx,gh-1.5,lz,hw,top-gh+1.5,hw,31);(ROME.supports=ROME.supports||[]).push({x:q[0],z:q[2],c:Math.cos(PALF.rot),s:Math.sin(PALF.rot),hw:hw+2,hd:hw+2});}
  // phase 3: more rim cells found with __floatCheck (world x, z, height of the model's lowest geometry there): a small plinth under each
  for(const[wx,wz,top]of[[234,234,42.7],[-22,345,55.6],[44,376,55.6],[46,372,55.6],[-34,367,50.6],[-32,363,50.6],[-28,355,50.6],[28,403,50.6],[33,394,50.6],[30,399,50.6],[-81,392,41.5],[155,155,31.7],[118,215,51.2]]){
    const[lx,lz]=palL(wx,wz),gh=W.gy(wx,wz);if(top-gh<.3)continue;g.set(33,.5);box(g,PFR,lx,gh-1.5,lz,2.3,top-gh+1.55,2.3,31);(ROME.supports=ROME.supports||[]).push({x:wx,z:wz,c:Math.cos(PALF.rot),s:Math.sin(PALF.rot),hw:3.3,hd:3.3});}
  {const cell=new Map();for(const t of W.trees){if(t[6]!==1)continue;const k=Math.floor(t[0]/48)+','+Math.floor(t[2]/48),c=cell.get(k)||[0,0,0];c[0]+=t[0];c[1]+=t[2];c[2]++;cell.set(k,c);}for(const c of cell.values())if(c[2]>=2)WAT.add(c[0]/c[2],c[1]/c[2],30);}   // every imperial garden cluster is watered (green all summer)
  W.foot.add(PFR.p(-31,0,-40)[0],PFR.p(-31,0,-40)[2],56,76,PALF.rot);
  const m=g.mesh(MAT.city);if(m)W.scene.add(m);flushColumns(W);}
// paved ground on the plateau strips (follows the terrain), Jupiter Victor temple with stair and altar
function palStrips(W){const g=new GB(1<<15),O=palObstacles();g.set(11,.35);
  for(const[x0,x1,z0,z1]of PAL_ZONES)for(let lx=x0;lx<x1;lx+=6)for(let lz=z0;lz<z1;lz+=6){const w=Math.min(6,x1-lx),d=Math.min(6,z1-lz);if(palClear(O,lx+w/2,lz+d/2)<-.5)continue;if(palInAsset(lx+w/2,lz+d/2,-1))continue;
      const pt=(a,b)=>{const q=PFR.p(a,0,b);return[q[0],W.gy(q[0],q[2])+.13,q[2]];};g.poly([pt(lx,lz+d),pt(lx+w,lz+d),pt(lx+w,lz),pt(lx,lz)],[0,1,0]);}
  const m=g.mesh(MAT.city);if(m)W.scene.add(m);
  {const gt=new GB(1<<14),[x,z]=palW(113.5,10),F0=frame(x,0,z,PALF.rot),y=maxGround(W,F0,0,0,8,12)+.3;
    temple(W,gt,{x,y,z,rot:PALF.rot,W:11,L:19,podH:3.2,colH:7.5,nf:4,rows:1,seed:.52,sculpt:false,pave:false,colTint:[1,.98,.94]});
    const tm=gt.mesh(MAT.city);if(tm)W.scene.add(tm);flushColumns(W);
    W.pois.push({n:'尤皮特·维克托神庙',l:'Aedes Iovis Victoris',x,z,y:y+16,s0:0,s1:99,d:700,sub:true,info:'【史】帕拉蒂尼山东北角的小神庙，前面有台阶和祭坛。尼禄时代这一带挤满了旧贵族宅邸改成的官署、客舍和卫兵院。'});}}

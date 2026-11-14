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
  {n:'rome_domus_a_belt',lx:202.6,lz:-72,turn:90,hw:15.5,hd:23,y:42},   // H1 (palatine-plan.js villas): the east villas cut down to the belt (42), their gardens 36 and 30
  {n:'rome_domus_b_belt',lx:202.6,lz:36,turn:90,hw:15.5,hd:23,y:42},
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
  ['c',156,-14,90,65],['a',153,26,90,60],                    // east of the Transitoria, fronts to the east slope: low floors on the summit rim (55, H1)
  ['c',-66,-123,180,44.5],['c',15,-135,180,50],              // north slope towards the Forum
  ['b',5,148,0,47],['b',5,171,0,31],['b',5,194,0,18.5]];     // south slope: three long colonnaded ranges stacked down the hill, seen from the Circus; low floors on the belt (42) and the foot terrace (26), H1
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
  h=palPlatShape(lx,lz,h);   // H1: the closed terraces of the east and south slopes (palatine-h1.js)
  // office blocks last: their pads win over a neighbour's rock skirt
  for(const B of palBL){const dx=lx-B.lx,dz=lz-B.lz,u=B.c*dx-B.s*dz,v=B.s*dx+B.c*dz,e=Math.min(B.hw+1.5-Math.abs(u),B.hd+1.5-Math.abs(v));
    if(e>-3)h=Math.min(h,lerp(h,lerp(B.y-.5,B.y-B.dr-.5,sstep(-4,4,v)),clamp((e+3)/4,0,1)));
    const yb=B.y-(B.dr>6?10.5:10)-.2,e2=Math.min(B.hw+6-Math.abs(u),B.hd+6-Math.abs(v));if(e2>-8&&h<yb){const Pl=palPlIn(lx,lz);if(!(Pl&&Pl.y<yb))h=lerp(h,yb,clamp((e2+8)/8,0,1));}}   // on steep slopes the ground is raised to the foot of the block's walls (the GLB walls go 10 m below the high floor), blending out over 8 m; not on a lower H1 terrace, which has its own floor
  return h;}
const palInBasin=(lx,lz,m=0)=>PAL_BASIN.some(([x0,x1,z0,z1])=>lx>x0-m&&lx<x1+m&&lz>z0-m&&lz<z1+m);
function palInAsset(lx,lz,m){for(const A of PAL_ASSETS){const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),dx=lx-A.lx,dz=lz-A.lz,u=c*dx-s*dz,v=s*dx+c*dz;
    if(Math.abs(u)<A.hw+m&&Math.abs(v)<A.hd+m)return true;}
  for(const B of palBL){const dx=lx-B.lx,dz=lz-B.lz,u=B.c*dx-B.s*dz,v=B.s*dx+B.c*dz;if(Math.abs(u)<B.hw+m&&Math.abs(v)<B.hd+m)return true;}
  return false;}
// stair corridors kept free of walls (local lx ranges at the south foot)
const PAL_CL=[];   // local points of the south-slope road (switchbacks from the Apollo precinct to the Circus): terrace walls leave a gate where it crosses
const palSkip=(lx,lz)=>palInAsset(lx,lz,4)||palInBasin(lx,lz,8)||PAL_CL.some(p=>Math.abs(p[0]-lx)<5.5&&Math.abs(p[1]-lz)<5.5);

/* Trees and shrubs of the Domus Tiberiana's terrace garden and on the cliff below it (round 3, 2026-11-08): printed by tools/models/rome/rome_tiberiana.py
   (TIB_PLANTS: model x, y north, z up, kind, scale); paste the new list here whenever the model is rebuilt. */
const TIB_PLANTS=[[-48.6,76.8,-19.42,"pomegr",0.8],[-56.4,74.6,-19.42,"flower",0.6],[-40.8,74.6,-19.42,"flower",0.6],[-56.4,79.0,-19.42,"shrub",0.6],[-40.8,79.0,-19.42,"shrub",0.6],[-48.6,87.6,-19.42,"fig",0.8],[-56.4,86.4,-19.42,"flower",0.6],[-40.8,86.4,-19.42,"flower",0.6],[-56.4,88.8,-19.42,"shrub",0.6],[-40.8,88.8,-19.42,"shrub",0.6],[-23.3,76.8,-19.42,"pomegr",0.8],[-32.0,74.6,-19.42,"flower",0.6],[-14.6,74.6,-19.42,"flower",0.6],[-32.0,79.0,-19.42,"shrub",0.6],[-14.6,79.0,-19.42,"shrub",0.6],[-23.3,87.6,-19.42,"fig",0.8],[-32.0,86.4,-19.42,"flower",0.6],[-14.6,86.4,-19.42,"shrub",0.6],[-32.0,88.8,-19.42,"shrub",0.6],[-14.6,88.8,-19.42,"shrub",0.6],[23.3,76.8,-19.42,"pomegr",0.8],[14.6,74.6,-19.42,"shrub",0.6],[32.0,74.6,-19.42,"shrub",0.6],[14.6,79.0,-19.42,"flower",0.6],[32.0,79.0,-19.42,"flower",0.6],[23.3,87.6,-19.42,"fig",0.8],[14.6,86.4,-19.42,"shrub",0.6],[32.0,86.4,-19.42,"shrub",0.6],[14.6,88.8,-19.42,"shrub",0.6],[32.0,88.8,-19.42,"flower",0.6],[48.6,76.8,-19.42,"pomegr",0.8],[40.8,74.6,-19.42,"shrub",0.6],[56.4,74.6,-19.42,"shrub",0.6],[40.8,79.0,-19.42,"shrub",0.6],[56.4,79.0,-19.42,"flower",0.6],[48.6,87.6,-19.42,"fig",0.8],[40.8,86.4,-19.42,"shrub",0.6],[56.4,86.4,-19.42,"shrub",0.6],[40.8,88.8,-19.42,"flower",0.6],[56.4,88.8,-19.42,"shrub",0.6],[-57,93.4,-19.48,"cyp",0.75],[-50,93.4,-19.48,"pine",0.75],[-43,93.4,-19.48,"cyp",0.75],[-36,93.4,-19.48,"broad",0.75],[-29,93.4,-19.48,"cyp",0.75],[-22,93.4,-19.48,"pine",0.75],[-15,93.4,-19.48,"cyp",0.75],[-8,93.4,-19.48,"cyp",0.75],[8,93.4,-19.48,"cyp",0.75],[15,93.4,-19.48,"cyp",0.75],[22,93.4,-19.48,"pine",0.75],[29,93.4,-19.48,"cyp",0.75],[36,93.4,-19.48,"broad",0.75],[43,93.4,-19.48,"cyp",0.75],[50,93.4,-19.48,"pine",0.75],[57,93.4,-19.48,"cyp",0.75],[-77.2,-63.9,-29.3,"shrub",0.64],[-78.5,-50.4,-31.2,"shrub",0.92],[-78.9,-38.1,-31.8,"broadD",0.89],[-78.9,-5.2,-33.3,"shrub",0.73],[-79.0,-2.6,-33.4,"broadD",0.59],[-78.4,7.4,-33.1,"shrub",0.85],[-79.4,12.6,-34.4,"broadD",0.56],[-80.4,18.2,-36.3,"shrub",0.84],[-81.3,52.3,-38.1,"shrub",0.67],[-81.2,55.2,-38.1,"broadD",0.57],[-80.7,68.5,-39.1,"broadD",0.61],[-78.8,71.2,-38.5,"broadD",0.57],[-80.1,74.2,-39.6,"broadD",0.71],[-80.8,76.4,-40.5,"shrub",0.63],[-81.6,78.9,-41.8,"shrub",0.79],[-80.6,84.1,-41.4,"broadD",0.75],[-80.9,87.8,-42.3,"broadD",0.84],[-77.0,91.9,-40.5,"shrub",0.61],[-33.7,107.8,-44.6,"broadD",0.77],[-20.4,107.9,-43.1,"shrub",0.65],[-18.2,107.6,-44.6,"broadD",0.64],[-5.9,105.9,-43.5,"broadD",0.89],[-2.2,105.6,-43.7,"shrub",0.64],[0.8,106.9,-43.8,"shrub",0.75],[5.5,110.1,-46.0,"broadD",0.68],[13.3,109.9,-46.2,"shrub",0.81],[19.6,107.9,-45.1,"shrub",0.89],[20.9,101.4,-28.4,"broadD",0.9],[23.7,101.2,-28.3,"broadD",0.71],[26.5,101.7,-28.0,"broadD",0.71],[31.9,101.6,-28.0,"fig",0.67],[53.5,108.4,-45.3,"broadD",0.62],[59.8,107.5,-44.8,"shrub",1.0],[69.3,106.8,-44.6,"shrub",0.63],[78.5,100.3,-42.3,"broadD",0.61],[80.4,71.2,-38.8,"broadD",0.64],[81.3,66.1,-39.3,"shrub",0.96],[-9.5,-2.0,0.15,"pomegr",0.8],[-12.0,-8.0,0.15,"flower",0.6],[-8.5,-8.0,0.15,"shrub",0.6],[-19.5,0.0,0.15,"flower",0.6],[9.5,-2.0,0.15,"pomegr",0.8],[12.0,-8.0,0.15,"flower",0.6],[8.5,-8.0,0.15,"shrub",0.6],[19.0,-5.0,0.15,"broad",0.45],[19.5,0.0,0.15,"flower",0.6],[-19.2,6.0,0.15,"cyp",0.4],[-19.2,14.0,0.15,"cyp",0.4],[19.2,6.0,0.15,"cyp",0.4],[19.2,14.0,0.15,"cyp",0.4],[-47.5,-38.0,0.15,"fig",1.3],[46.5,-34.5,0.15,"cyp",0.45],[62.5,-34.5,0.15,"cyp",0.45],[46.5,-47.5,0.15,"shrub",0.7],[62.5,-47.5,0.15,"shrub",0.7]];
/* models: stand-ins now, GLBs from rome-assets.js later */
function palPlace(W,gP){const gy=(x,z)=>W.gy(x,z);
  for(const A of PAL_ASSETS){const[x,z]=palW(A.lx,A.lz),rot=PALF.rot+A.turn*DEG,y=A.y??gy(x,z)+.3;
    if(A.n==='rome_tiberiana'){ROME.GLB.push({n:A.n,x,y,z,r:rot,stand:W.dtProc,o:{hide:'glb_dt'}});
      {const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t);for(const[mx,my,mz,k,sc]of TIB_PLANTS){const v=-my,[px,pz]=palW(A.lx+c*mx+s*v,A.lz-s*mx+c*v);W.trees.push([px,y+mz,pz,k,sc]);}}   // the garden's trees, the cliff's shrubs
      continue;}
    romeStand(W,A.n,x,z,y,rot,(g,F)=>{
      if(A.n==='rome_apollo'){terraceRect(W,g,F,0,0,47,47,0,34);temple(W,g,{x,y,z:z,rot,W:24,L:40,podH:5,colH:14,nf:6,rows:2,peri:true,colTint:[1,1,.97],seed:.21,pave:false});}
      else if(A.n==='rome_transitoria'){   // the stand-in until the model arrives: one box per roof block of the palace plan (TR_BLOCKS: model x0, y0 (north +), x1, y1, wall top, storeys, roof 0 flat, 1 ridge east-west, 2 ridge north-south, 3 hipped; printed by tools/models/rome/rome_transitoria.py)
        const TR_BLOCKS=[[-44,36,44,46,12.0,2,1],[-7,36,7,46,14.0,2,2],[-44,24,44,36,12.0,2,1],[-56,24,-44,46,14.0,2,3],[44,24,56,46,14.0,2,3],[44,-6,56,6,34.0,6,3],[32,-6,44,6,12.0,2,1],[38,6,50,24,12.0,2,2],[32,6,38,24,10.56,2,0],[50,6,56,24,11.6,2,0],[38,-24,50,-6,12.0,2,2],[32,-24,38,-6,10.56,2,0],[50,-24,56,-6,11.6,2,0],[-32,-36,32,-24,16.2,3,1],[-32,-46,32,-36,12.0,2,1],[38,-36,56,-24,14.0,2,3],[38,-46,56,-36,7.0,1,0],[32,-46,38,-24,10.56,2,0],[-56,-46,-44,-24,8.0,1,0],[-44,-46,-32,-24,8.0,1,0],[-56,-24,-44,24,7.6,1,2],[-44,-24,-32,24,7.6,1,2],[-32,19,32,24,10.6,2,0],[-32,-24,32,-19,10.6,2,0],[27,-19,32,19,10.6,2,0],[-32,-19,-27,19,5.6,1,0]];
        {const P0=[[-56,-46],[56,-46],[56,46],[-56,46]].map(q=>{const p=F.p(q[0],0,q[1]);return[p[0],p[2]];});if(typeof reserveResidentialArea==='function')reserveResidentialArea(W,P0,'authored-courtyard-estate');}   // the reservation the old stand-in's courtBlock made: placed before the houses, the street fabric is keyed to it
        g.set(23,.5);g.poly([F.p(-56,.05,46),F.p(56,.05,46),F.p(56,.05,-46),F.p(-56,.05,-46)],[0,1,0]);
        for(const[x0,y0,x1,y1,h,n,k]of TR_BLOCKS){const cx=(x0+x1)/2,cz=-(y0+y1)/2,w=x1-x0,d=y1-y0;rectWalls(g,F,cx,cz,w,d,-1,h,0,{part:24,seed:.83,sty:15,fl:8|32,nSt:Math.min(n,3),gH:Math.min(7,h),sH:5,lit:1});
          roof(g,F,k===0?'flat':k===1?'gableX':k===2?'gableZ':'hip',cx,cz,w,d,h,22*DEG,.5,.83+.1);}}
      else if(A.n==='rome_domus_augusti')courtBlock(W,g,F,{cx:0,cz:-8,w:70,d:52,y0:0,nSt:1,sH:4,gH:5,cw:34,cd:22,part:0,seed:.55,sty:0,fl:8|16});
      else if(A.n==='rome_magna_mater')temple(W,g,{x,y,z,rot,W:17.5,L:33,podH:6,colH:12,nf:6,rows:3,seed:.4,name:'众神之母神庙（库柏勒）'});
      else if(A.n==='rome_victoria')temple(W,g,{x,y,z,rot,W:16,L:28,podH:4,colH:10,nf:6,rows:2,seed:.45,name:'胜利女神神庙'});
      else courtBlock(W,g,F,{cx:0,cz:-6,w:28,d:30,y0:0,nSt:2,sH:3.8,gH:4.4,cw:12,cd:10,part:0,seed:.3+A.lx*.001,sty:0,fl:1|64|8});});
    (W.palFeet||(W.palFeet=[])).push(W.foot.add(x,z,A.hw,A.hd,rot));}}
// Scrub round the foot of the rock hills (the author, 2026-11-03: the rock bases looked odd, bare stone straight out of the grass; the reference has
// bushes and small trees in the hollows at the foot of the cliffs): holm oak, wild fig, box, cypress and pine every 5-9 m round each rock outline,
// 1-6 m outside it, clear of streets, buildings and the other rocks; keyed to the place. Run once the city stands (monuments.js, after the outcrops).
function palRockScrub(W){if(typeof PAL_ROCK==='undefined')return 0;const own=new Set(W.palFeet||[]),free=f=>own.has(f)||f.tag==='open';let n=0;   // the models' own footprints and reserved open land are not in the way
  const inRock=(lx,lz)=>PAL_ASSETS.some(A=>{const E=palRockE[A.n];if(!E)return false;const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),dx=lx-A.lx,dz=lz-A.lz,u=c*dx-s*dz,v=s*dx+c*dz;let d=-1e9;for(const[px,pz,nx,nz]of E)d=Math.max(d,(u-px)*nx+(v-pz)*nz);return d<.8;});
  for(const A of PAL_ASSETS){const P=PAL_ROCK[A.n]?.pts,E=palRockE[A.n];if(!P||!E)continue;const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t);
    for(let i=0;i<P.length;i++){const[px,pz,nx,nz]=E[i],q=P[(i+1)%P.length],L=Math.hypot(q[0]-px,q[1]-pz);
      for(let k=1.5;k<L;k+=5+4*hash2(px*.37+k,pz*.41)){const h=j=>hash2(px*1.13+k*.71+j*3.7,pz*.97+k*1.31+j*5.1),off=1+5*h(1),u=px+(q[0]-px)*k/L+nx*off,v=pz+(q[1]-pz)*k/L+nz*off;
        if(h(2)>.62)continue;const lx=A.lx+c*u+s*v,lz=A.lz-s*u+c*v;if(inRock(lx,lz))continue;const[x,z]=palW(lx,lz);if(W.streetAt(x,z)||W.foot.hits(x,z,1.2,1.2,0,0,free))continue;
        const r=h(3),kind=r<.42?'shrub':r<.6?'broadD':r<.72?'fig':r<.84?'cyp':r<.92?'pine':'olive';W.trees.push([x,W.gy(x,z),z,kind,kind==='shrub'?.8+.5*h(4):.55+.35*h(4)]);n++;}}}
  return n;}

/* G1 (briefs/rome/podium-stairs-rock.md, 2026-11-04): the foot of the Domus Tiberiana model's rock base on the west slope, as wall-foot records along its
   outline (PAL_ROCK, model x,z), every ~2 m: terraceFeet (terrace-edge.js) sets rock blocks, moss, shrubs and cypresses against it, and __wallFootCheck reads it.
   top: the palace floor; only edges whose foot is 8 m or more below it on average; the model's own footprints are not in the way (R.own). Call before terraceFeet. */
function palGlbFeet(W){const A=PAL_ASSETS.find(a=>a.n==='rome_tiberiana'),P=A&&PAL_ROCK[A.n]?.pts,E=A&&palRockE[A.n];if(!P||!E)return 0;const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),own=new Set([...(W.palFeet||[]),W.dtFoot].filter(Boolean));   // W.dtFoot: the palace's own footprint (monuments.js)
  const toW=(u,v)=>palW(A.lx+c*u+s*v,A.lz-s*u+c*v);let n=0;
  for(let i=0;i<P.length;i++){const[px,pz,mx,mz]=E[i],q=P[(i+1)%P.length],a=toW(px,pz),b=toW(q[0],q[1]),o=toW(px+mx,pz+mz),L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<4)continue;
    const nx=o[0]-a[0],nz=o[1]-a[1],ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,ns=Math.max(2,Math.round(L/2)),S=[];
    for(let k=0;k<=ns;k++){const sk=L*k/ns,x=a[0]+ux*sk,z=a[1]+uz*sk,y=Math.min(W.gy(x+nx*.5,z+nz*.5),W.gy(x+nx*1.4,z+nz*1.4));S.push({s:sk,x,z,y,h:A.y-y,open:false});}
    if(S.reduce((m,q)=>m+q.h,0)/S.length<8)continue;(W.wallFeet||(W.wallFeet=[])).push({tag:'palGLB:tiberiana:'+i,pal:1,natural:true,ax:a[0],az:a[1],ux,uz,nx,nz,L,top:A.y,S,brk:[],own});n++;}   // only where the rock base stands well out of the slope (the west and Forum sides), not where the palace stands on the hilltop;
  return n;}   // natural: the model's cliff has its own talus, boulders and shrubs (round 3), so terraceFeet adds only shrubs and cypresses
/* The Domus Tiberiana model's ground where its rock base stands out of the slope (the author, 2026-11-07: houses and a street ran into the big base
   on the Forum side). W.dtFoot (monuments.js) is the palace; the rock base (PAL_ROCK outline) reaches 17 m further west and 62 m further north, down
   towards the Forum. Two footprints take the outline + 2 m on the west side and on the north (Forum) side; on the east and the south the rock is under
   the saddle deck and the hilltop, where the office blocks stand. Outside the north side a 6.5 m strip is reserved open ('open': no houses and no
   streets; palRockScrub and terraceFeet plant it), short of the main road round the north-west corner. They count as the model's own (W.palFeet).
   Called after the roads, before the houses (monuments.js). */
function palTibFeet(W){const A=PAL_ASSETS.find(a=>a.n==='rome_tiberiana'),P=A&&PAL_ROCK[A.n]?.pts;if(!P)return 0;
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const[u,v]of P){u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
  const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),rot=PALF.rot+t,m=2,feet=W.palFeet||(W.palFeet=[]);
  const box=(a0,a1,b0,b1,tag)=>{const u=(a0+a1)/2,v=(b0+b1)/2,[x,z]=palW(A.lx+c*u+s*v,A.lz-s*u+c*v);return W.foot.add(x,z,(a1-a0)/2,(b1-b0)/2,rot,tag);};
  feet.push(box(u0-m,-60,v0-m,v1+m));   // the west side, all of it (the slope falls to the Velabrum)
  feet.push(box(-60,56,v0-m,-45));      // the north side, as far east as the rock stands out of the ground (the office block beyond, palBL)
  W.dtOpen=box(-70,56,v0-m-6.5,v0-m,'open');
  return 3;}

/* ---- the Scalae Caci (podium p3, 2026-11-08; the author: how should the Victoria temple's stair go on down from its terrace?) ----
   The rome_victoria model brings its axial stair down 10 m from the temple terrace to a road it supposes at 42 m, between two rock outcrops; the slope
   in front is 36-41 m and falls away fast (about 1 in 1 for the next 15 m). A forecourt (land) holds those 42 m: from the outcrops' faces, where the model's
   stair comes down into it, 11 m out; paved, walled on the east and south (terraceEdge: coping, parapet, buttresses), open to the west, where the Scalae Caci
   leave it, as wide as the court, between two piers with statues or tripods. The stair goes down to the street in the valley: west-south-west along the
   slope to a landing on the garden terrace below (30 m), then south-south-west (path; hillStair: flights of at most 15 steps, a landing on each garden
   terrace it crosses, whose wall opens for it: palTerraceWalls). It is the way up to the temple as well: the model's own stair is logged as a hill stair
   (no mesh) so that templeLinks finds it. Fixed points (Palatine local lx, lz), reserved before the houses (palScalae is called before W.footMark.houses).
   【史】Scalae Caci: the stair from the Circus valley up the south-west corner of the Palatine; Faustulus' hut stood at its top (Solinus 1.18). */
const PAL_SC={land:[[-120.5,166],[-107.5,166],[-107.5,176.8],[-120.5,176.8]],y:42,w:5.8,path:[[-120.5,171.4],[-148,179],[-170,216]],glb:[[-114,157],[-114,170]]};   // glb: the model's stair, head (52 m) and foot (42 m)
const palNearSC=(lx,lz,m)=>lx>-120.5-m&&lx<-107.5+m&&lz>166-m&&lz<176.8+m;
function palScalae(W){const F=PFR,g=new GB(1<<15),y=PAL_SC.y,P=PAL_SC.land;
  terraceReserve(W,F,P,{skip:[0,3]});
  g.set(60,.35,1,3);g.poly([F.p(P[3][0],y+.06,P[3][1]),F.p(P[2][0],y+.06,P[2][1]),F.p(P[1][0],y+.06,P[1][1]),F.p(P[0][0],y+.06,P[0][1])],[0,1,0]);   // the paving
  W.palSCEdge=terraceEdge(W,g,P,y,{F,tag:'palSC',skip:[0,3],pal:1});   // 0: against the outcrops and the model's stair; 3: the Scalae Caci
  for(const c of[P[0],P[3]]){const q=F.p(c[0]+.75,0,c[1]+(c===P[0]?.75:-.75)),gF=W.gy(q[0],q[2]),PF=frame(q[0],0,q[2],PALF.rot);g.set(60,.5,1,1);box(g,PF,0,Math.min(gF,y)-1.2,0,.7,y+1.3-Math.min(gF,y)+1.2,.7,31&~32);
    g.set(48,.5);box(g,PF,0,y+1.3,0,.8,.16,.8,31);if(teH(q[0],q[2],5)<.5)pedestalStatue(g,PF,0,0,y+1.46,2.6,{gilt:teH(q[0],q[2],6)<.4});else tripod(g,PF,0,0,y+1.46,1.25);}   // B5: a pier each side of the opening
  {const m=g.mesh(MAT.city);if(m){m.name='scalaeCaci';W.scene.add(m);}}
  const pts=PAL_SC.path.map(p=>palW(p[0],p[1])),R=[pts[0].slice()];R.corners=[];
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/2));for(let j=1;j<=n;j++)R.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);if(i<pts.length-1)R.corners.push(R.length-1);}
  hillStair(W,R,PAL_SC.w,y);W.palSC=R;
  const G=PAL_SC.glb.map(p=>palW(p[0],p[1]));G.corners=[];(W.hillStairs||(W.hillStairs=[])).push({R:G,w:6,top:PAL_ASSETS.find(a=>a.n==='rome_victoria').y,steps:0,landings:0,rock:0,parapets:0,glb:'rome_victoria'});
  return R;}

/* terraces: for each level, march rays out from the hilltop; the outer wall stands where the ground drops 6 m below the
   terrace, the floor reaches back to where the ground is level with it.
   Podium p3 (2026-11-08; the author: the bases looked stacked one in front of another and the stairs ran into the walls):
   - palTerraces plans the terraces here, before the houses (the floors as footprints with palTer, the wall-foot records); palTerraceWalls draws the walls
     once every hill stair exists (monuments.js, after templeLinks). Where a stair goes through a wall the coping and the parapet stop, with a pier and a
     statue or a tripod on each side, and nothing else stands in its way (buttress, ledge rocks, trees, a portico, a stair along the wall).
   - No terrace within 10 m of a model's rock base (palRockE) or 8 m of the Scalae Caci forecourt: one base, not a second one in front of it.
   - A terrace shallower than 6 m is not built (3.5 m before). The wall is set back by one amount per 16° sector (it was per 12 m run, with a return wall
     at every run); half as many garden gaps; where a wall stops, the side of its terrace is walled back into the slope (it was a wing wall stepping
     down the slope in front). */
const PAL_LV=[51,44,37,30,23,16],PAL_ROCK_CLEAR=10;
// the signed distance from local (lx,lz) to the nearest model's rock base outline (palRockE; negative inside), as palShape measures it
function palRockD(lx,lz){let best=1e9;for(const A of PAL_ASSETS){const E=palRockE[A.n];if(!E)continue;const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),dx=lx-A.lx,dz=lz-A.lz,u=c*dx-s*dz,v=s*dx+c*dz;
    let d=-1e9;for(const[px,pz,nx,nz]of E)d=Math.max(d,(u-px)*nx+(v-pz)*nz);best=Math.min(best,d);}return best;}
const palTerSkip=(lx,lz)=>palSkip(lx,lz)||palRockD(lx,lz)<PAL_ROCK_CLEAR||palNearSC(lx,lz,8);
function palTerraces(W){{const R=palClivusRoute(W);W.palClivus=R;PAL_CL.length=0;for(const p of R)PAL_CL.push(palL(p[0],p[1]));}   // H1: down the ravine east of the south terraces (palatine-h1.js)
  const P=(lx,lz)=>palW(lx,lz),H=(lx,lz)=>{const q=P(lx,lz);return W.gy(q[0],q[1]);},C=[20,-15],segs=[],
    RG=W.routeGround||W,Hp=(lx,lz)=>{const q=P(lx,lz);return RG.gy(q[0],q[1]);};   // Hp: the plan (where each terrace runs) on the desktop tier's ground at every tier, so its footprints and walls are the same at both tiers (the street fabric's key); H: the heights, on this tier's ground
  W.palWalls=0;W.palTerSegs=segs;
  PAL_LV.forEach((yk,ki)=>{const tk=yk-6,S=[];
    for(let a=-42;a<=208;a+=1.5){const th=a*DEG,dx=Math.cos(th),dz=Math.sin(th);let rIn=null,rOut=null;if(a>=PAL_PLAN.rayCut[0]&&a<=PAL_PLAN.rayCut[1]){S.push(null);continue;}   // H1: the east and south slopes are closed terraces (palPlatReserve)
      for(let r=36;r<430;r+=1.2){const h=Hp(C[0]+dx*r,C[1]+dz*r);if(rIn===null&&h<yk)rIn=r;if(h<tk){rOut=r;break;}}
      if(rIn===null||rOut===null||rOut-rIn<6){S.push(null);continue;}
      const o=[C[0]+dx*rOut,C[1]+dz*rOut],i=[C[0]+dx*rIn,C[1]+dz*rIn],m=[(o[0]+i[0])/2,(o[1]+i[1])/2];
      S.push(palTerSkip(o[0],o[1])||palTerSkip(i[0],i[1])||palTerSkip(m[0],m[1])||[o,i,m].some(q=>palInZoneL(q[0],q[1],6))?null:{o,i,d:rOut-rIn,a,n:[dx,dz]});}
    for(let k=1;k<S.length-1;k++){const A=S[k-1],B=S[k],Cc=S[k+1];if(A&&B&&Cc){B.o=[(A.o[0]+2*B.o[0]+Cc.o[0])/4,(A.o[1]+2*B.o[1]+Cc.o[1])/4];B.i=[(A.i[0]+2*B.i[0]+Cc.i[0])/4,(A.i[1]+2*B.i[1]+Cc.i[1])/4];}}
    /* hill base after rock_and_base.md: runs of pale ashlar with a batter and a coping, set back by 0-2.4 m from sector to sector, square buttresses,
       a ledge-rock band at the foot (uneven blocks), gardens instead of paving, stairs along the wall, and gaps (gardens/slope with trees) where a run or a whole sector has no wall */
    const RS=8,runOf=k=>Math.floor(k/RS),hz=(k,s)=>hash2(ki*97+runOf(k)*13+s*5,ki*7+3+s*11),sbOf=k=>hash2(ki*61+Math.floor(S[k].a/16)*17,29)*2.4,
      lvAt=k=>!(ki>1&&hash2(ki*53+Math.floor(S[k].a/16),11)<.3),   // a sector without this level
      segAt=k=>{const A=S[k],B=S[k+1];if(!A||!B)return false;const L=Math.hypot(B.o[0]-A.o[0],B.o[1]-A.o[1]);return L<=14&&L>=.5&&lvAt(k);},
      wallAt=k=>segAt(k)&&!(hz(k,1)<.1);   // segment k is a wall (not a garden gap)
    let rec=null;
    for(let k=0;k<S.length-1;k++){if(!segAt(k))continue;const A=S[k],B=S[k+1],L=Math.hypot(B.o[0]-A.o[0],B.o[1]-A.o[1]);
      W.palWalls++;const nx=(A.n[0]+B.n[0])/2,nz=(A.n[1]+B.n[1])/2,ux=(B.o[0]-A.o[0])/L,uz=(B.o[1]-A.o[1])/L,wr=PALF.rot-Math.atan2(uz,ux);
      const wn=(()=>{const a=P(0,0),b=P(nx,nz);const vx=b[0]-a[0],vz=b[1]-a[1],l=Math.hypot(vx,vz)||1;return[vx/l,0,vz/l];})();
      const gap=!wallAt(k),sb=gap?0:sbOf(k),sh=(Q,n,d)=>[Q[0]+n[0]*d,Q[1]+n[1]*d],oA=sh(A.o,A.n,-sb),oB=sh(B.o,B.n,-sb),iA=sh(A.i,A.n,-sb*.6),iB=sh(B.i,B.n,-sb*.6);
      const ybA=Math.min(H(oA[0]+nx*2,oA[1]+nz*2),H(oA[0],oA[1]))-1.6,ybB=Math.min(H(oB[0]+nx*2,oB[1]+nz*2),H(oB[0],oB[1]))-1.6;
      const sg={ki,yk,k,A,B,L,nx,nz,ux,uz,wr,wn,gap,sb,oA,oB,iA,iB,ybA,ybB,ht:yk-Math.max(ybA,ybB),rec:null,sA:-1,sB:-1,
        wp:(yk===44||yk===30)&&hz(k,5)>.45,prevW:wallAt(k-1),nextW:wallAt(k+1),prevSb:wallAt(k-1)?sbOf(k-1):sb,
        along:ki<PAL_LV.length-1&&k%RS===1&&(runOf(k)+ki*2)%5===0,last:ki===PAL_LV.length-1};segs.push(sg);   // along: staggered by two runs per level, so the flights never line up into one long stair
      if(gap)continue;
      {const wA0=P(oA[0],oA[1]),wB0=P(oB[0],oB[1]),smp=(w,yb)=>({x:w[0],z:w[1],y:yb+1.6,h:yk+.1-(yb+1.6),open:false,nx:wn[0],nz:wn[2]});   // B6 (G1): the wall foot, for terraceFeet and __wallFootCheck
        if(!rec||rec.k!==k-1||rec.sb!==sb){rec={tag:'palTer:'+yk+':'+k,pal:1,ax:wA0[0],az:wA0[1],ux:0,uz:0,nx:wn[0],nz:wn[2],L:0,top:yk,S:[Object.assign(smp(wA0,ybA),{s:0})],brk:[0],ledge:true,sb};(W.wallFeet||(W.wallFeet=[])).push(rec);}
        const Lw0=Math.hypot(wB0[0]-wA0[0],wB0[1]-wA0[1]);sg.sA=rec.S.length-1;rec.L+=Lw0;rec.S.push(Object.assign(smp(wB0,ybB),{s:rec.L}));sg.sB=rec.S.length-1;rec.brk.push(rec.L);rec.k=k;sg.rec=rec;   // the ledge band (below) runs under the whole segment
        const t0=rec.S[0],t1=rec.S[rec.S.length-1],tl=Math.hypot(t1.x-t0.x,t1.z-t0.z)||1;rec.ux=(t1.x-t0.x)/tl;rec.uz=(t1.z-t0.z)/tl;}
      const mx=(A.o[0]+B.i[0])/2,mz=(A.o[1]+B.i[1])/2,q=P(mx,mz);W.foot.add(q[0],q[1],Math.max(L,4)/2+1,(A.d+B.d)/4+1,wr,'open').palTer=yk;}});   // 'open': garden terraces count as vegetation for the street raster; palTer: the floor, for the hill stairs (temple-links.js)
  palPlatReserve(W);   // H1: the closed terraces' ground, before the roads and the houses (palatine-h1.js)
  flushColumns(W);}
// the walls of the terraces planned by palTerraces, opened where a hill stair goes through (W.hillStairs: every one is built by now). Dice keyed to the segment.
function palTerraceWalls(W){const segs=W.palTerSegs||[];if(!segs.length)return;
  const g=new GB(1<<16),P=(lx,lz)=>palW(lx,lz),H=(lx,lz)=>{const q=P(lx,lz);return W.gy(q[0],q[1]);},xyz=(l,y)=>{const q=P(l[0],l[1]);return[q[0],y,q[1]];},C0=W.cols;W.cols={ion:[]};
  const ST=(W.hillStairs||[]).filter(h=>h.R&&h.R.length>1).map(h=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of h.R){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return{R:h.R,r:h.w/2+1.2,x0,x1,z0,z1};});
  const nearW=(x,z,m)=>ST.some(h=>{const r=h.r+m;if(x<h.x0-r||x>h.x1+r||z<h.z0-r||z>h.z1+r)return false;for(let i=1;i<h.R.length;i++)if(segD(x,z,h.R[i-1][0],h.R[i-1][1],h.R[i][0],h.R[i][1])<r)return true;return false;}),
    near=(l,m=0)=>{const q=P(l[0],l[1]);return nearW(q[0],q[1],m);};
  const st=W.palTerStats={walls:0,openings:0,piers:0,skipped:0,wallLen:0,ledgeLen:0,topPiers:0,beds:0};
  for(const sg of segs){const{yk,k,A,B,L,nx,nz,ux,uz,wr,wn,gap,sb,oA,oB,iA,iB,ybA,ybB,ht}=sg,R=RNG(57+sg.ki*7919+k*131),sh=(Q,n,d)=>[Q[0]+n[0]*d,Q[1]+n[1]*d],off=(Q,d)=>[Q[0]+nx*d,Q[1]+nz*d];
    if(gap){   // garden gap: the slope stays; cypresses and pines in loose groups, shrubs and flowers
      if(k%3===0){const t=off(A.o,-3-R()*3),q=xyz(t,0),y=H(t[0],t[1]),kind=R()<.55?'cyp':'pine',s=.8+R()*.4;if(!near(t,1))W.trees.push([q[0],y,q[2],kind,s]);}
      if(k%2===0){const t2=off(A.o,-1-R()*5),q=xyz(t2,0),y=H(t2[0],t2[1]),kind=impGarden(R()),s=.7+R()*.6;if(!near(t2,1))W.trees.push([q[0],y,q[2],kind,s,null,1]);}
      continue;}
    st.walls++;const at=(t,d)=>{const n=[lerp(A.n[0],B.n[0],t),lerp(A.n[1],B.n[1],t)];return[lerp(oA[0],oB[0],t)+n[0]*d,lerp(oA[1],oB[1],t)+n[1]*d];};
    // where a hill stair goes through: the open stretches of the wall line (0.25 m samples), the stretches with coping and parapet between them
    const ns=Math.max(2,Math.ceil(L/.25)),op=[];for(let j=0;j<=ns;j++)op.push(near(at(j/ns,0)));
    const keep=[];for(let j=0;j<=ns;){if(op[j]){j++;continue;}let j1=j;while(j1<ns&&!op[j1+1])j1++;keep.push([j/ns,j1/ns]);j=j1+1;}
    const opened=op.some(v=>v);if(opened){st.openings++;const R0=sg.rec;if(R0){if(op[0])R0.S[sg.sA].open='stair';if(op[ns])R0.S[sg.sB].open='stair';R0.brk.push(R0.S[sg.sA].s,R0.S[sg.sB].s);}}
    // floor (H0, M5 of palatine-masterplan.md): gravel with a band of stone slabs inside the parapet; paving behind the porticoes. No lawn: the green is in the
    // small garden beds (below), the trees and the slopes. Every stone here is part 60 on palette 1 (palStone in materials.js): flag 1 rusticated, 2 travertine, 3 paving, 4 gravel
    const wp=sg.wp;g.set(60,.4,1,wp?3:4);g.poly([xyz(oA,yk+.06),xyz(oB,yk+.06),xyz(iB,yk+.06),xyz(iA,yk+.06)],[0,1,0]);
    if(!wp){g.set(60,.4,1,3);g.poly([xyz(sh(oA,A.n,-.66),yk+.09),xyz(sh(oB,B.n,-.66),yk+.09),xyz(sh(oB,B.n,-1.86),yk+.09),xyz(sh(oA,A.n,-1.86),yk+.09)],[0,1,0]);}
    // retaining wall with a 4 % batter (behind a stair it stays: the stair stands in front of it)
    const bt=.04*ht,lA=sh(oA,A.n,bt),lB=sh(oB,B.n,bt),wseed=.3+hz2(sg.ki,k)*.5,R0=sg.rec,u0=R0?(R0.ax*.37+R0.az*.53)%97:0,uA=u0+(R0?R0.S[sg.sA].s:0),uB=u0+(R0?R0.S[sg.sB].s:L),
      uv0=(a,b)=>[[a,0],[b,0],[b,0],[a,0]];   // the wall's own length as the stone's u: the blocks run on from segment to segment (palStone)
    g.set(60,wseed,1,0);g.poly([xyz(lA,ybA),xyz(lB,ybB),xyz(oB,yk+.1),xyz(oA,yk+.1)],wn,uv0(uA,uB));   // B1 (podium-stairs-rock.md G1): the Palatine's wall stone (palette 1, terrace-edge.js)
    st.wallLen+=L;
    // M2: the bottom 2.4 m above the ground in rusticated courses (0.9 m, counted down from the band's top), standing 7 cm proud with a weathered top
    const fA=ybA+1.6,fB=ybB+1.6,tA=Math.min(fA+2.4,yk-.8),tB=Math.min(fB+2.4,yk-.8),plinth=tA-fA>.6&&tB-fB>.6;
    if(plinth){const hA=yk+.1-ybA,hB=yk+.1-ybB,fa=bt*(1-(tA-ybA)/hA)+.07,fb=bt*(1-(tB-ybB)/hB)+.07;g.set(60,wseed,1,1);
      g.poly([xyz(sh(oA,A.n,bt+.07),ybA),xyz(sh(oB,B.n,bt+.07),ybB),xyz(sh(oB,B.n,fb),tB),xyz(sh(oA,A.n,fa),tA)],wn,[[uA,tA],[uB,tB],[uB,tB],[uA,tA]],1);
      g.poly([xyz(sh(oA,A.n,fa),tA),xyz(sh(oB,B.n,fb),tB),xyz(sh(oB,B.n,fb-.08),tB),xyz(sh(oA,A.n,fa-.08),tA)],[0,1,0]);}
    // coping and parapet (B2, a solid pluteus with a travertine cap: coping and parapet 1.37 m) on the stretches no stair goes through; a pier at each side of an opening
    const iw=[-wn[0],0,-wn[2]];
    const ua=t=>lerp(uA,uB,t);
    for(const[t0,t1]of keep){if((t1-t0)*L<.3)continue;const a0=t0,a1=t1,Q=(t,d)=>at(t,d);
      // M3 (H0): a travertine coping 0.45 m thick, 0.25 m out over the face and 0.9 m deep; on it a parapet 0.6 m thick and 1.0 m high: ashlar with a travertine cap
      g.set(60,.5,1,2);g.poly([xyz(Q(a0,.25),yk+.1),xyz(Q(a1,.25),yk+.1),xyz(Q(a1,-.65),yk+.1),xyz(Q(a0,-.65),yk+.1)],[0,1,0]);
      g.poly([xyz(Q(a0,.25),yk-.35),xyz(Q(a1,.25),yk-.35),xyz(Q(a1,.25),yk+.1),xyz(Q(a0,.25),yk+.1)],wn,uv0(ua(a0),ua(a1)));g.poly([xyz(Q(a0,0),yk-.35),xyz(Q(a1,0),yk-.35),xyz(Q(a1,.25),yk-.35),xyz(Q(a0,.25),yk-.35)],[0,-1,0]);
      g.set(60,wseed,1,0);g.poly([xyz(Q(a0,.05),yk+.1),xyz(Q(a1,.05),yk+.1),xyz(Q(a1,.05),yk+1),xyz(Q(a0,.05),yk+1)],wn,uv0(ua(a0),ua(a1)));g.poly([xyz(Q(a1,-.55),yk+.1),xyz(Q(a0,-.55),yk+.1),xyz(Q(a0,-.55),yk+1),xyz(Q(a1,-.55),yk+1)],iw,uv0(ua(a1),ua(a0)));
      g.set(60,.5,1,2);g.poly([xyz(Q(a0,.09),yk+1.1),xyz(Q(a1,.09),yk+1.1),xyz(Q(a1,-.59),yk+1.1),xyz(Q(a0,-.59),yk+1.1)],[0,1,0]);
      g.poly([xyz(Q(a0,.09),yk+1),xyz(Q(a1,.09),yk+1),xyz(Q(a1,.09),yk+1.1),xyz(Q(a0,.09),yk+1.1)],wn,uv0(ua(a0),ua(a1)));g.poly([xyz(Q(a1,-.59),yk+1),xyz(Q(a0,-.59),yk+1),xyz(Q(a0,-.59),yk+1.1),xyz(Q(a1,-.59),yk+1.1)],iw,uv0(ua(a1),ua(a0)));
      // M3: a pier 0.9 m square every 4.5 m of the wall's length, 0.3 m above the parapet (not by an opening: the B5 piers stand there)
      if(R0){const sa=ua(a0)-u0,sz=ua(a1)-u0;for(let n=Math.ceil((sa+(a0>0?1.2:0))/4.5);n*4.5<sz-(a1<1?1.2:0);n++){const t=(u0+n*4.5-uA)/(uB-uA);if(near(at(t,0),1.6))continue;   // (a pier on a segment's end belongs to the next segment)
        if((t*L<1.4&&(!sg.prevW||Math.abs(sg.prevSb-sb)>.05))||((1-t)*L<1.4&&!sg.nextW))continue;   // the corner piers stand there
        const q=xyz(at(t,-.25),0),PF=frame(q[0],0,q[2],wr);g.set(60,wseed,1,0);box(g,PF,0,yk+.1,0,.45,1.18,.45,15);g.set(60,.5,1,2);box(g,PF,0,yk+1.28,0,.5,.12,.5,31);st.topPiers++;}}
      // B5: by an opening the parapet ends in a pier with a statue or a bronze tripod (the next segment's opening counts: a point 0.6 m on)
      for(const[t,dir]of[[a0,-1],[a1,1]]){const edge=(dir<0&&t===0)||(dir>0&&t===1),j=Math.round(t*ns),open=edge?near(at(t+dir*.6/L,0)):op[j+dir];if(!open)continue;
        const tp=t-dir*.45/L,q=xyz(at(tp,-.1),0),gF=lerp(ybA,ybB,tp)+1.6,PF=frame(q[0],0,q[2],wr);(W.wallPiers=W.wallPiers||[]).push([q[0],q[2],.7]);g.set(60,wseed,1,1);box(g,PF,0,gF-1.2,0,.7,yk+1.3-gF+1.2,.7,31&~32);g.set(60,.5,1,2);box(g,PF,0,yk+1.3,0,.8,.16,.8,31);
        if(teH(q[0],q[2],5)<.5)pedestalStatue(g,PF,0,0,yk+1.46,2.6,{gilt:teH(q[0],q[2],6)<.4});else tripod(g,PF,0,0,yk+1.46,1.25);st.piers++;}}
    // M3: a corner pier 1.2 m square where the wall line ends or turns back (set-back), on the coping
    for(const[cnd,t]of[[(!sg.prevW||Math.abs(sg.prevSb-sb)>.05)&&!op[0],.6/L],[!sg.nextW&&!op[ns],1-.6/L]]){if(!cnd||near(at(t,0),1))continue;const q=xyz(at(t,-.25),0),PF=frame(q[0],0,q[2],wr);
      g.set(60,wseed,1,0);box(g,PF,0,yk+.1,0,.6,1.18,.6,15);g.set(60,.5,1,2);box(g,PF,0,yk+1.28,0,.66,.12,.66,31);st.topPiers++;}
    // a run of coping (0.45 m) and parapet (1.0 m) on a side wall, from local p0 to p1 (part of M3)
    const parRun=(p0,p1)=>{const a=P(p0[0],p0[1]),b=P(p1[0],p1[1]),l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<.3)return;const F=frame((a[0]+b[0])/2,0,(a[1]+b[1])/2,Math.atan2(-(b[1]-a[1]),b[0]-a[0]));
      g.set(60,.5,1,2);box(g,F,0,yk-.35,0,l/2,.45,.45,31);g.set(60,wseed,1,0);box(g,F,0,yk+.1,0,l/2,.9,.3,15);g.set(60,.5,1,2);box(g,F,0,yk+1,0,l/2+.02,.1,.34,31);};
    // where the set-back changes from the segment before: a return wall between the two wall lines; where the wall stops (a garden gap, the end of the level)
    // the side of the terrace is walled back into the slope, from the wall's corner to where the floor meets the ground
    if(sg.prevW&&Math.abs(sg.prevSb-sb)>.05&&!near(A.o,.5)){const p0=sh(A.o,A.n,-sg.prevSb),p1=oA,yb=Math.min(ybA,H(p0[0],p0[1])-1.6),un=[ux*PALF.c+uz*PALF.s,0,-ux*PALF.s+uz*PALF.c],s=sg.prevSb>sb?1:-1;
      g.set(60,wseed,1,0);g.poly([xyz(p0,yb),xyz(p1,yb),xyz(p1,yk+.1),xyz(p0,yk+.1)],[un[0]*-s,0,un[2]*-s]);parRun(sh(p0,A.n,.25),sh(p1,A.n,.25));}
    for(const[end,o0,i0,s]of[[!sg.prevW,oA,iA,-1],[!sg.nextW,oB,iB,1]]){if(!end||near(o0,.5))continue;const un=[ux*PALF.c+uz*PALF.s,0,-ux*PALF.s+uz*PALF.c],n=5;let prev=null;
      for(let j=0;j<=n;j++){const t=j/n,p=[lerp(o0[0],i0[0],t),lerp(o0[1],i0[1],t)],gp=H(p[0],p[1]),cur={p,gp};if(prev&&(yk-prev.gp>.3||yk-gp>.3)){
        g.set(60,wseed,1,0);g.poly([xyz(prev.p,prev.gp-1),xyz(p,gp-1),xyz(p,yk+.1),xyz(prev.p,yk+.1)],[un[0]*s,0,un[2]*s]);
        if(yk-prev.gp>.6||yk-gp>.6)parRun(sh(prev.p,[ux,uz],-s*.3),sh(p,[ux,uz],-s*.3));else{g.set(60,.5,1,2);const c0=sh(prev.p,[ux,uz],s*.25),c1=sh(p,[ux,uz],s*.25),c2=sh(p,[ux,uz],-s*.25),c3=sh(prev.p,[ux,uz],-s*.25);g.poly([xyz(c0,yk+.12),xyz(c1,yk+.12),xyz(c2,yk+.12),xyz(c3,yk+.12)],[0,1,0]);}}prev=cur;}}
    // B3: square buttresses every ~7 m where the wall is higher than 2.5 m (the author, 2026-11-04: half-round projections only at rock-spur corners); not where a stair goes
    const wA=P(oA[0],oA[1]),wB=P(oB[0],oB[1]),Lw=Math.hypot(wB[0]-wA[0],wB[1]-wA[1])||1,eux=(wB[0]-wA[0])/Lw,euz=(wB[1]-wA[1])/Lw,eW={ux:eux,uz:euz,nx:wn[0],nz:wn[2],Wp:(s,d,y)=>[wA[0]+eux*s+wn[0]*d,y,wA[1]+euz*s+wn[2]*d]};
    if(ht>2.5&&(k%2===0||L>7)&&!near(at(.5,1),.8))buttress(g,eW,Lw/2,Math.max(ybA,ybB)-.2,yk-.35,.04,1,wseed);
    // M2: a 0.3 m travertine string course every 6 m of height, the first about 3 m under the coping on a course line, never on the plinth
    for(let yc=Math.floor((yk-3)/.6)*.6;yc>(plinth?Math.max(tA,tB):Math.max(fA,fB))+.6;yc-=6){const dA=bt*(yk+.1-yc)/(yk+.1-ybA)+.06,dB=bt*(yk+.1-yc)/(yk+.1-ybB)+.06;g.set(60,.5,1,2);
      g.poly([xyz(sh(oA,A.n,dA),yc),xyz(sh(oB,B.n,dB),yc),xyz(sh(oB,B.n,dB),yc+.3),xyz(sh(oA,A.n,dA),yc+.3)],wn,uv0(uA,uB));g.poly([xyz(sh(oA,A.n,dA),yc+.3),xyz(sh(oB,B.n,dB),yc+.3),xyz(sh(oB,B.n,dB-.08),yc+.3),xyz(sh(oA,A.n,dA-.08),yc+.3)],[0,1,0]);}
    // ledge-rock band at the foot: uneven blocks of grey bedded stone, a few on top of one another, never one straight line
    {const d1=1.4+R()*1.2,pp=sh([(oA[0]+oB[0])/2,(oA[1]+oB[1])/2],A.n,d1+bt),qq=xyz(pp,0),gh=H(pp[0],pp[1]),F=frame(qq[0],gh-2,qq[2],wr+(R()-.5)*.5),hx=L*.5+.5+R()*.7,hd=1.3+R()*1.3,h1=Math.min(2.4,(yk-gh)*.14+.5+R()*.7),r2=R(),r3=R();
      if(!near(pp,hd+.5)){st.ledgeLen+=L;g.set(61,.2+R()*.5,1,0);box(g,F,0,0,0,hx,h1+2,hd,31);   // a continuous, uneven ledge: each block overlaps its neighbours; a second course on some, a jutting block now and then
        if(r2<.55){g.set(61,.2+R()*.5,1,0);box(g,frame(qq[0]+(R()-.5)*L*.4,gh+h1-.35,qq[2]+(R()-.5)*.8,wr+(R()-.5)*.6),0,0,0,hx*.6,.6+R()*.5,hd*.7,31);}
        if(r3<.22){const p3=sh(pp,A.n,2.2+R()*1.4),q3=xyz(p3,0),g3=H(p3[0],p3[1]);if(!near(p3,1.5)){g.set(61,.5,1,0);box(g,frame(q3[0],g3-1.2,q3[2],R()*3),0,0,0,1.2+R()*1.1,1.3+R()*.8,1+R()*.8,31);}}}}
    // portico against the slope (stacked colonnades seen from the Circus), only on some runs of the two porch levels, and not where a stair crosses the terrace
    if(wp&&A.d>8.5&&B.d>8.5&&!opened&&![0,.5,1].some(t=>near([lerp(iA[0],iB[0],t)+A.n[0]*3,lerp(iA[1],iB[1],t)+A.n[1]*3],2.5))){const cA2=[iA[0]+A.n[0]*5,iA[1]+A.n[1]*5],cB2=[iB[0]+B.n[0]*5,iB[1]+B.n[1]*5];
      g.set(24,.6,0,8,1,6.8,0,.6);g.poly([xyz(iA,yk-.5),xyz(iB,yk-.5),xyz(iB,yk+7.2),xyz(iA,yk+7.2)],wn,[[0,-.5],[L,-.5],[L,7.2],[0,7.2]],L,4);
      {const q=xyz(cA2,yk);W.cols.ion.push([q[0],yk,q[2],PALF.rot,5.2,[1,.97,.9]]);}
      g.set(2,.5);g.poly([xyz(cA2,yk+5.2),xyz(cB2,yk+5.2),xyz(cB2,yk+6),xyz(cA2,yk+6)],wn);
      const eA=[cA2[0]+A.n[0]*.6,cA2[1]+A.n[1]*.6],eB=[cB2[0]+B.n[0]*.6,cB2[1]+B.n[1]*.6];
      g.set(1,.5);g.poly([xyz(eA,yk+6),xyz(eB,yk+6),xyz(iB,yk+7.4),xyz(iA,yk+7.4)],[0,1,0]);g.poly([xyz(iA,yk+7.3),xyz(iB,yk+7.3),xyz(eB,yk+5.9),xyz(eA,yk+5.9)],[0,-1,0]);}
    else{if(k%4===0&&A.d>6){const t=sh(oA,A.n,-2.2),q=xyz(t,yk),kind=R()<.62?'cyp':'pine',s=.8+R()*.3;if(!near(t,1))W.trees.push([q[0],yk,q[2],kind,s]);}
      if(k%3===1&&A.d>5){const t2=sh(oA,A.n,-3.4-R()*Math.max(1,A.d-6)*.5),q=xyz(t2,yk),kind=impGarden(R()),s=.7+R()*.6;if(!near(t2,1)){W.trees.push([q[0],yk,q[2],kind,s,null,1]);
        const BF=frame(q[0],0,q[2],wr);g.set(60,.5,1,2);box(g,BF,0,yk,0,1.3,.2,1,31);g.set(23,.4);g.poly([BF.p(-1.16,yk+.205,-.86),BF.p(1.16,yk+.205,-.86),BF.p(1.16,yk+.205,.86),BF.p(-1.16,yk+.205,.86)],[0,1,0]);st.beds++;}}}   // M5: the planting in a small lawn bed with a travertine kerb (the only lawn on the terraces)
    if(!sg.wp&&!(yk===44||yk===30)&&k%17===5&&A.d>13){const c=[(A.o[0]+A.i[0])/2,(A.o[1]+A.i[1])/2],q=xyz(c,yk);if(!near(c,4))fountain(W,g,q[0],q[2],{hx:2.6,hz:2.6,y:yk+.05,statue:1.8});}
    if(k%11===3){const t=sh(oA,A.n,-1.1),q=xyz(t,yk);if(!near(t,1.5))pedestalStatue(g,frame(q[0],yk,q[2],0),0,0,0,2.4,{gilt:R()<.2});}
    // stairs climbing along the wall face to the terrace below, with a cheek wall on the open side (not where a hill stair comes through). M6: travertine treads, the cheek in the wall's ashlar
    if(sg.along&&![0,4,8,12].some(t=>near([oA[0]+ux*t+nx*2.1,oA[1]+uz*t+nz*2.1],1.5))){const run=12,n=36;
      for(let s=0;s<n;s++){const t=(s+.5)/n*run,p=[oA[0]+ux*t+nx*2.1,oA[1]+uz*t+nz*2.1],q=xyz(p,0),ys=yk-7+(s+1)*7/n;g.set(60,.42,1,2);box(g,frame(q[0],0,q[2],wr),0,yk-7.5,0,run/n/2+.02,ys-(yk-7.5),1.3,31);
        const p2=[p[0]+nx*1.55,p[1]+nz*1.55],q2=xyz(p2,0);g.set(60,.55,1,0);box(g,frame(q2[0],0,q2[2],wr),0,yk-7.5,0,run/n/2+.02,ys-(yk-7.5)+.7,.18,31);}}}
  flushColumns(W);W.cols=C0;const m=g.mesh(MAT.city);if(m){m.name='palTerraces';W.scene.add(m);}}
const hz2=(ki,k)=>hash2(ki*97+Math.floor(k/8)*13+30,ki*7+3+66);   // the wall stone's shade, per 12 m run (as before)

/* ================= crowded saddle: block stand-ins, basin deck, walls, cryptoporticus, temple, gardens ================= */
const PFR=frame(PALF.ox,0,PALF.oz,PALF.rot);                       // the Palatine grid as a frame: PFR.p(lx,y,lz) = world point at local (lx,lz), absolute y
const PAL_OBS=[[104,123,-1,34]];                                    // extra obstacles (Jupiter Victor temple with stair and altar)
const PAL_ZONES=[[-215,-72,16,60],[10,140,-14,30],[136,180,-50,55]]; // plateau strips that get paved ground
const PAL_FILLED=[...PAL_BASIN,...PAL_ZONES];                       // where the old street-grid generator must stay out
const palFilled=(x,z)=>{const[lx,lz]=palL(x,z);return PAL_FILLED.some(([x0,x1,z0,z1])=>lx>x0-12&&lx<x1+12&&lz>z0-12&&lz<z1+12)||palInZoneL(lx,lz,12);};   // and the H1 terraces
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
  g.set(60,.3,1,3);for(const[x0,x1,z0,z1]of PAL_BASIN)g.poly(qd(x0,x1,z0,z1,dk),[0,1,0]);
  // retaining walls: the plateau is 5 m above the deck on the east (strip A) and the west (south of the Tiberiana)
  const topY=PAL_TOP,wh=topY-(PAL_DECK-.6);
  // east wall (lx 8.8..10, z -10..26, stair opening 5.5..10.5) and west wall (lx -72..-70.8, z 22..76, opening 66..71): plateau side higher by 5 m
  for(const[cx,za,zb,fx]of[[9.4,-10,5.5,-1],[9.4,10.5,26,-1],[-71.4,22,66,1],[-71.4,71,76,1]]){const cz=(za+zb)/2,hz=(zb-za)/2;g.set(22,.45);box(g,PFR,cx,PAL_DECK-.6,cz,.6,wh,hz,31);g.set(2,.5);box(g,PFR,cx,topY-.45,cz,.85,.5,hz,31);
    for(let k=za+3;k<zb-1;k+=9){g.set(22,.5);box(g,PFR,cx+fx*.9,PAL_DECK-.6,k,.9,wh-.5,.7,31);}
    g.set(2,.5);for(let k=za+.5;k<=zb-.4;k+=2.4)box(g,PFR,cx-fx*.2,topY+.05,k,.14,.9,.14,31);}
  // rim promenades on the plateau side of both walls (flat, flush with the wall tops: they also cover the small ditch behind)
  g.set(60,.35,1,3);g.poly(qd(8.8,17,-10,26,topY+.06),[0,1,0]);g.poly(qd(-79,-70.8,22,76,topY+.06),[0,1,0]);
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
  // watered ground (cisterns and pipes): palace gardens stay green all summer, the bare slopes outside dry to straw. H0 (palatine-masterplan.md M5: lawn only in
  // enclosed gardens): each palace's own footprint, a rectangle, where there were discs of 44-80 m that spilt onto the open hilltop and slopes (the Magna Mater
  // grove, the ground round the Tiberiana and Apollo), one on the open east slope between the two houses ([190,-30,52]), and 30 m discs round every cluster of
  // garden trees (below). The sunken basins are paved.
  for(const A of PAL_ASSETS)if(/tiberiana|transitoria|apollo|domus_augusti/.test(A.n)){const q=PFR.p(A.lx,0,A.lz);WAT.add(q[0],q[2],A.hw-6,A.hd-6,PALF.rot);}
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
  W.foot.add(PFR.p(-31,0,-40)[0],PFR.p(-31,0,-40)[2],56,76,PALF.rot);
  const m=g.mesh(MAT.city);if(m)W.scene.add(m);flushColumns(W);}
// paved ground on the plateau strips (follows the terrain), Jupiter Victor temple with stair and altar
function palStrips(W){const g=new GB(1<<15),O=palObstacles();g.set(60,.35,1,3);   // H0 (palatine-masterplan.md 2.3): grade 5, the slabs of the terrace floors, not the city paving (part 11, lighter than the copings)
  for(const[x0,x1,z0,z1]of PAL_ZONES)for(let lx=x0;lx<x1;lx+=6)for(let lz=z0;lz<z1;lz+=6){const w=Math.min(6,x1-lx),d=Math.min(6,z1-lz);if(palClear(O,lx+w/2,lz+d/2)<-.5)continue;if(palInAsset(lx+w/2,lz+d/2,-1))continue;
      if(palPlIn(lx+w/2,lz+d/2))continue;   // H1: a closed terrace has its own floor (palPlatFloor)
      const pt=(a,b)=>{const q=PFR.p(a,0,b);return[q[0],W.gy(q[0],q[2])+.13,q[2]];};g.poly([pt(lx,lz+d),pt(lx+w,lz+d),pt(lx+w,lz),pt(lx,lz)],[0,1,0]);}
  const m=g.mesh(MAT.city);if(m)W.scene.add(m);
  {const gt=new GB(1<<14),[x,z]=palW(113.5,10),F0=frame(x,0,z,PALF.rot),y=maxGround(W,F0,0,0,8,12)+.3;
    temple(W,gt,{x,y,z,rot:PALF.rot,W:11,L:19,podH:3.2,colH:7.5,nf:4,rows:1,seed:.52,sculpt:false,pave:false,colTint:[1,.98,.94]});
    const tm=gt.mesh(MAT.city);if(tm)W.scene.add(tm);flushColumns(W);
    W.pois.push({n:'尤皮特·维克托神庙',l:'Aedes Iovis Victoris',x,z,y:y+16,s0:0,s1:99,d:700,sub:true,info:'【史】帕拉蒂尼山东北角的小神庙，前面有台阶和祭坛。尼禄时代这一带挤满了旧贵族宅邸改成的官署、客舍和卫兵院。'});}}

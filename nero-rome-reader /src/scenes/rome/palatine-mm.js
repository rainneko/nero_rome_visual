/* mm-terraces: the slope below the Magna Mater and the Victoria as lived-in terraces (stage B, review rounds 1-3; the author approved the lane and
   the removal of the zigzag stair, and the scheme is on by default since round 3: no ?mm=1 switch).
   Plan, levels and history notes: briefs/rome/notes/mm-terraces/ (survey.md, scheme.md). All coordinates are hill-local (palL / palW / PFR), 1 unit = 1 m.
   Hooks: palShape and palPlatPost (the ground cut to the new floors), templeLinks (the Magna Mater's auto stair, the zigzag from the foot of its south
   wall, is not built: the new lane is its link), palMMLinks (replaced: main's west landing at the model stair's foot with its low walls and the straight
   flight down to the viewing terrace (30) and its 'mmWest' walk route are not built; mmBuild builds the model stair's base, the landing 'top' and the
   yard flight instead), palWestReserve (the new footprints, before the roads and the houses), palWestSlope (the grove inside the scheme cleared, then
   everything below built), palWestClear (wall-foot plants that fell on the new floors removed).
   【史】The Magna Mater's precinct stood among aristocratic and imperial houses (the "House of Livia" one terrace below, Augustus' house): the range
   under the temple terrace is the sanctuary's own annex, the blocks by the lane are the walled backs of large houses; street trade is below the foot
   wall by the valley street. The gated recess RA, the annex rooms, the house blocks, the gardens and the pine enclosure are design, not attested. */
const MM={st:{},cuts:[],pads:[],blds:[],mine:new Set()};
function mmData(){if(MM.data)return MM.data;
  const D={};
  // the lane (cordonata): points [lx, lz, y]; risers per leg; 3.8 wide. L0 snaps to the floor of ring 23
  D.lane={w:3.8,P:[[-216,154.5,23.06],[-204,159.2,25.0],[-190,159.6,27.2],[-177,158.6,29.0],[-166,157.8,31.0],[-161,157.8,32.5]],n:[13,15,12,13,8],snap0:1};
  D.branch={w:3,P:[[-166.2,159.7,31.0],[-164.8,169.8,30.06]],n:[6],snap1:1};   // the lane's fork down to the floor of ring 30 (walk 30)
  D.alley={w:2.2,P:null,n:[]};   // below the foot wall, set from the wall line (mmLower)
  // pads: level floors. surf: pave | earth | garden | none (a house plot). fin: the wall finish where the auto walls stand on its edges
  D.pads=[
    {id:'yard',y:33.5,surf:'yard',fin:'tufa',cfin:'plaster',P:[[-208.5,104],[-196,104],[-196,134],[-200.6,137.3],[-205.6,137.3],[-208.5,128]]},
    {id:'courtW',y:32.5,surf:'pave',fin:'ret',cfin:'plaster',P:[[-161,155.6],[-147.6,155.6],[-147.6,164.5],[-161,164.5]]},
    {id:'courtE',y:33.5,surf:'pave',fin:'ret',cfin:'plaster',P:[[-147.6,155.6],[-142.2,155.6],[-142.2,164.5],[-140.6,164.5],[-140.6,168.9],[-134,168.9],[-134,171.5],[-140.6,171.6],[-147.6,169.0]]},
    {id:'n30',y:30.06,snap:[-154.8,170.5],surf:'pave',fin:'ret',cfin:'plaster',P:[[-156.2,169.0],[-153.4,169.0],[-153.4,172.2],[-156.2,171.3]]},
    {id:'top',y:40.6,surf:'pave',fin:'tufa',solid:1,P:[[-203.9,150.0],[-198.6,150.0],[-198.6,154.2],[-203.9,154.2]]},   // the model stair's foot landing (y: the model's, set in mmBuild)
    {id:'hut',y:38.2,surf:'earth',fin:'tufa',P:null},   // casa Romuli: an oval pad, set below
  ];
  {const P=[];for(let i=0;i<16;i++){const a=i/16*TAU;P.push([-101.5+Math.cos(a)*4.8,169.5+Math.sin(a)*3.9]);}D.pads.find(p=>p.id==='hut').P=P;}
  // buildings. k: annex | wall (the plastered backs of the large houses) | gate (the tiled gatehouse) | store | shed | shop (below the foot wall: city houses)
  // r: [x0,x1,z0,z1] axis-aligned in the hill frame, front +z; or L: a quad [front-right, front-left, back-left, back-right] (front L0->L1); or c,w,d,th
  D.blds=[
    {id:'R1',k:'annex',use:'库房',r:[-188,-181.5,148.3,157.2],y:27.8,h:6.6,roof:'lean'},
    {id:'R2',k:'annex',use:'库房',r:[-181.5,-175.5,148.3,156.7],y:28.8,h:5.6,roof:'gable'},
    {id:'R3',k:'annex',use:'祭司住房',r:[-175.5,-169.4,148.3,156.25],y:29.9,h:7.1,roof:'lean'},
    {id:'R4',k:'annex',use:'库房',r:[-169.4,-164.8,148.3,155.9],y:30.9,h:6.4,roof:'hip'},
    {id:'RA',k:'arch',use:'门房 + 带门的深龛（设计，非史）',r:[-164.8,-160.2,148.3,155.5],y:32.5,h:6.9,roof:'lean'},
    {id:'R5',k:'annex',use:'侍从住房',r:[-160.2,-153.6,148.3,155.3],y:32.5,h:6.2,roof:'gable'},
    {id:'R6',k:'annex',use:'祭司住房',r:[-153.6,-147.6,148.3,155.5],y:32.5,h:7.5,roof:'lean'},
    {id:'R7',k:'annex',use:'库房',r:[-147.6,-142.5,148.3,155.5],y:33.5,h:6.3,roof:'hip'},
    {id:'S1',k:'store',use:'圣所库房',c:[-198.75,108.6],w:9,d:5.5,th:-90,y:33.5,h:3.8,roof:'lean'},
    {id:'S2',k:'store',use:'圣所库房',c:[-198.75,118.7],w:11,d:5.5,th:-90,y:33.5,h:4.4,roof:'lean'},
    {id:'S3',k:'store',use:'圣所库房',c:[-198.75,128.9],w:9.2,d:5.5,th:-90,y:33.5,h:3.5,roof:'lean'},
    {id:'B2',k:'wall',use:'大宅西翼（背墙）',r:[-212,-204.5,149.5,155.6],y:24.3,h:9.6,roof:'hip'},
    {id:'B0',k:'gate',use:'大宅门楼（瓦顶，两层）',r:[-203.6,-198.6,154.6,157.4],y:25.5,h:7.4,roof:'gable'},
    {id:'B3',k:'wall',use:'大宅西翼北段（背墙，贴院梯西侧）',L:[[-212.5,137.8],[-212.5,149.3],[-203.95,149.3],[-203.95,137.8]],y:27.4,h:7.4,roof:'lean'},
    {id:'B1',k:'wall',use:'大宅东翼（背墙）',r:[-197.8,-188.3,151.5,157.6],y:26.7,h:7.2,roof:'lean'},
    {id:'AW',k:'wall',use:'坡下大宅（背墙）',L:[[-190,170.3],[-203.5,166.6],[-203.5,161.1],[-190,161.5]],y:23,h:7.8,roof:'lean',fall:'front'},
    {id:'AE',k:'wall',use:'坡下大宅东翼（背墙）',L:[[-171.5,175.4],[-181,172.6],[-181,160.9],[-171.5,160.4]],y:23,h:8.4,roof:'lean',fall:'front'},
    {id:'AS',k:'store',use:'马厩（贴环台 30 外墙）',L:[[-160.6,181.4],[-167.6,178.9],[-168.4,174.2],[-161.6,176.6]],y:23.06,snapY:[-164,180.5],h:4.6,roof:'lean',fall:'front'},
    {id:'C1',k:'wall',use:'大宅东翼（朝小院的背墙，屋顶葡萄架）',L:[[-156.2,171.2],[-162.6,168.6],[-162.6,164.6],[-156.2,164.6]],y:30.06,snapY:[-159,172],gH:2.5,h:6.8,roof:'flat'},
    {id:'C2',k:'wall',use:'大宅东翼（朝小院的背墙）',L:[[-147.6,174.0],[-153.4,172.0],[-153.4,164.6],[-147.6,164.6]],y:30.06,snapY:[-150.5,175],gH:2.5,h:6.4,roof:'lean',fall:'front'},
  ];
  // the walled garden of the lower house between AW and AE (floor 23, walls along the lane and the foot road, trees over them)
  D.garden={P:[[-181.5,172.4],[-189.5,170.2],[-189.5,161.5],[-181.5,160.9]],y:23};
  // stairs: [x,z] top and bottom (local), widths; y top / bottom; flights split by a landing (L metres) where n > 20
  D.stairs=[
    {id:'yardFlight',a:[-202.6,150.0],b:[-202.6,137.3],w:2.6,ya:'top',yb:33.5},
    {id:'court30',a:[-154.8,164.5],b:[-154.8,169.0],w:2.4,ya:32.5,yb:'n30'},
    {id:'courtStep',a:[-149.4,160],b:[-147.6,160],w:7.2,ya:32.5,yb:33.5,up:1},
    {id:'hutStair',a:[-107.6,171.0],b:[-105.6,171.0],w:1.6,ya:null,yb:38.2,skip:1},
  ];
  // the pine enclosure in the north pit between the two temples (design): wall line, gate on the north side
  D.encl={P:[[-129.5,74],[-99,74],[-99,95],[-112,97],[-126,97.5],[-129.5,99]],gate:[-116.5,-113.9]};
  // the wall line of ring 23 (its outer face, survey) for the band below the foot wall
  D.O=[[-207.4,169.1],[-200,172.8],[-192.4,176.2],[-184.9,179.4],[-177.8,182.8],[-170.9,186.1],[-164,189.3]];
  D.T1=[16.0,16.0,15.7,15.6,15.4,15.4];D.T2=[12.0,12.0,12.3,12.5,12.6,12.6];D.T3=[10.2,10.3,10.5,10.6,10.7,10.6];
  D.D=[{c:[-152.5,201.6],y:13.5},{c:[-156.5,208.5],y:11.3},{c:[-160.6,215.4],y:9.4}];   // the houses east of the Scalae Caci's lower flight
  return MM.data=D;}
// ---------- small geometry (hill-local) ----------
const mmW=(lx,lz)=>palW(lx,lz);
const mmBB=P=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of P){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return[x0,x1,z0,z1];};
const mmArea=P=>{let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;};
function mmTri(P){const n=P.length,I=[...Array(n).keys()];if(mmArea(P)<0)I.reverse();const T=[];let guard=0;
  const cr=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  while(I.length>3&&guard++<500){let cut=false;for(let i=0;i<I.length;i++){const a=P[I[(i+I.length-1)%I.length]],b=P[I[i]],c=P[I[(i+1)%I.length]];if(cr(a,b,c)<=1e-9)continue;
      let inside=false;for(const j of I){const p=P[j];if(p===a||p===b||p===c)continue;if(cr(a,b,p)>=0&&cr(b,c,p)>=0&&cr(c,a,p)>=0){inside=true;break;}}
      if(inside)continue;T.push([a,b,c]);I.splice(i,1);cut=true;break;}if(!cut)break;}
  if(I.length===3)T.push(I.map(j=>P[j]));return T;}
function mmRect(r){return[[r[1],r[3]],[r[0],r[3]],[r[0],r[2]],[r[1],r[2]]];}   // front-right, front-left, back-left, back-right (front +z)
function mmRot(c,w,d,th){const t=th*DEG,cs=Math.cos(t),sn=Math.sin(t),q=(x,z)=>[c[0]+x*cs+z*sn,c[1]-x*sn+z*cs];return[q(w/2,d/2),q(-w/2,d/2),q(-w/2,-d/2),q(w/2,-d/2)];}
function mmPolyOf(b){return b.L||(b.r?mmRect(b.r):mmRot(b.c,b.w,b.d,b.th||0));}
// ---------- the lane legs as pads with a stepped height ----------
function mmLegs(spec,id){const P=spec.P,hw=spec.w/2,out=[];if(!P)return out;
  const nrm=i=>{const a=P[i],b=P[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);return[-(b[1]-a[1])/l,(b[0]-a[0])/l];};
  const m=P.map((p,i)=>{if(i===0)return nrm(0);if(i===P.length-1)return nrm(i-1);const a=nrm(i-1),b=nrm(i),s=[a[0]+b[0],a[1]+b[1]],l=Math.hypot(...s),k=1/Math.max(.5,(s[0]*a[0]+s[1]*a[1])/l);return[s[0]/l*k,s[1]/l*k];});
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,n=spec.n[i],y0=a[2],y1=b[2];
    const Q=[[b[0]+m[i+1][0]*hw,b[1]+m[i+1][1]*hw],[a[0]+m[i][0]*hw,a[1]+m[i][1]*hw],[a[0]-m[i][0]*hw,a[1]-m[i][1]*hw],[b[0]-m[i+1][0]*hw,b[1]-m[i+1][1]*hw]];
    const sOf=(lx,lz)=>clamp(((lx-a[0])*ux+(lz-a[1])*uz)/L,0,1),kOf=s=>clamp(Math.floor(s*n+.5),0,n),yf=(lx,lz)=>y0+(y1-y0)*kOf(sOf(lx,lz))/n;
    out.push({id:id+i,P:Q,yf,leg:{a,b,L,ux,uz,n,y0,y1,m0:m[i],m1:m[i+1],hw},surf:'lane',fin:'ret'});}
  return out;}
// ---------- the band below the foot wall: gardens (T1), city houses (T2, T3), the alley ----------
function mmLower(D){const O=D.O,res={pads:[],blds:[]};
  const seg=k=>{const a=O[k],b=O[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;let nx=-uz,nz=ux;if(nz<0){nx=-nx;nz=-nz;}return{a,b,L,ux,uz,nx,nz};};
  const quad=(S,t0,t1,o0,o1)=>{const p=(t,o)=>[S.a[0]+S.ux*S.L*t+S.nx*o,S.a[1]+S.uz*S.L*t+S.nz*o];return[p(t1,o1),p(t0,o1),p(t0,o0),p(t1,o0)];};   // front (outer, down the slope) first
  const T2H=[[[.35,1]],[[0,.5],[.5,1]],[[0,.84]],[[.16,1]],[[0,.5],[.5,1]],[[0,1]]],T3H=[null,[[.05,.95]],[[0,.84]],null,[[0,.55],[.55,1]],[[0,.8]]];
  let nh=0;const r2=b=>(b.r2=nh++%4===2,b);
  const uses=['面包坊','布店','陶器铺','杂货铺','酒馆','鱼铺','油灯铺','铁匠铺','染坊','鞋铺'];let ui=0;
  for(let k=0;k<6;k++){const S=seg(k);
    res.pads.push({id:'T1_'+k,y:D.T1[k],surf:'garden',fin:k%2?'plaster':'tufa',P:quad(S,k===0?.05:0,k===2?.88:1,.6,7),garden:1});
    for(const[t0,t1]of T2H[k]){const Lq=quad(S,t0,t1,7.4,13.4),u=uses[ui++%uses.length];res.blds.push(r2({id:'T2_'+k+'_'+t0,k:'shop',use:u,L:Lq,y:D.T2[k],nSt:k%3===1?3:2,roof:(k+t0*2)%3<1?'lean':'gableL',bake:u==='面包坊'}));}
    res.pads.push({id:'Wk_'+k,y:D.T2[k],surf:'pave',fin:'plaster',P:quad(S,k===0?.05:0,1,13.4,16)});   // the shop walk in front of T2 (the T3 houses' backs on its outer side)
    if(T3H[k])for(const[t0,t1]of T3H[k]){const Lq=quad(S,t0,t1,16,20.5),u=uses[ui++%uses.length];res.blds.push(r2({id:'T3_'+k+'_'+t0,k:'shop',use:u,L:Lq,y:D.T3[k],nSt:2,roof:(k+t0*3)%2<1?'gableL':'lean',bake:u==='面包坊'}));}
    else res.pads.push({id:'T3g_'+k,y:D.T3[k],surf:'garden',fin:'tufa',P:quad(S,k===0?.4:0,1,16,20.5),garden:1});}
  // the alley: from T1 at the joint O[3] straight down the slope to the valley floor; flush with T1 at its head
  {const S=seg(2),p=O[3],nx=S.nx*.5+seg(3).nx*.5,nz=S.nz*.5+seg(3).nz*.5,l=Math.hypot(nx,nz),at=o=>[p[0]+nx/l*o,p[1]+nz/l*o];
    D.alley.P=[[...at(7),D.T1[2]],[...at(13.6),D.T2[3]],[...at(20.4),D.T3[3]],[...at(26),9.6]];D.alley.n=[19,10,6];}
  for(const d of D.D){const a=[-155.8,192.1],b=[-170,216],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
    res.blds.push(r2({id:'D'+res.blds.length,k:'shop',use:'住宅（楼上门开在卡库斯台阶）',c:d.c,w:6.4,d:5.8,th:Math.atan2(-uz,ux)/DEG,y:d.y,nSt:2,roof:'gableL'}));}
  return res;}
// ---------- everything set up once (before the terrain is built: the cut list) ----------
function mmSetup(){if(MM.ready)return;MM.ready=true;const D=mmData(),low=mmLower(D);
  MM.pads=[...D.pads,{id:'garden',y:D.garden.y,P:D.garden.P,surf:'garden',fin:'plaster',garden:1},...low.pads,...mmLegs(D.lane,'lane'),...mmLegs(D.branch,'branch'),...mmLegs(D.alley,'alley')];
  MM.blds=[...D.blds,...low.blds].map(b=>Object.assign(b,{P:mmPolyOf(b)}));
  // the stairs' footprints and stepped heights (mmFlightSpec), their y ends resolved later (snap); for the cut, the lower end is enough
  MM.cuts=[];const cut=(P,yf,y)=>{const B=mmBB(P);MM.cuts.push({P,B,yf,y});};
  for(const p of MM.pads)if(p.P&&!p.solid)cut(p.P,p.yf,p.y);
  for(const b of MM.blds)cut(b.P,null,b.y);
  for(const s of D.stairs){if(s.skip)continue;const Q=mmStripQ(s.a,s.b,s.w+.2),yl=typeof s.yb==='number'?s.yb:(D[s.yb]||MM.pads.find(p=>p.id===s.yb)||{}).y;if(yl!=null)cut(Q,null,Math.min(yl,typeof s.ya==='number'?s.ya:yl));}
  // the strip between the east arm and the Scalae Caci (its north rock banks, the side gate): the ground no higher than the arm, so the hill mesh (2.5 m cells on
  // the desktop tier) does not rise across the arm from a vertex held up beside the stair (it made a 2 m hump the walker climbed); under the banks and treads, unseen
  cut([[-141,171.3],[-133.6,171.3],[-133.6,173.4],[-141,174.8]],null,33.5);
  // and behind the arm's north and east cut walls a band one mesh cell (3 m) wide held at the arm's level, the walls' coping carried back over it (mmPadWalls, MM_ARMW)
  cut([[-140.6,165.4],[-130.6,165.4],[-130.6,171.5],[-134,171.5],[-134,168.9],[-140.6,168.9]],null,33.5);
  {let B=[1e9,-1e9,1e9,-1e9];for(const c of MM.cuts)B=[Math.min(B[0],c.B[0]),Math.max(B[1],c.B[1]),Math.min(B[2],c.B[2]),Math.max(B[3],c.B[3])];MM.cutB=B;}}
function mmStripQ(a,b,w){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L*w/2,nz=(b[0]-a[0])/L*w/2;return[[b[0]+nx,b[1]+nz],[a[0]+nx,a[1]+nz],[a[0]-nx,a[1]-nz],[b[0]-nx,b[1]-nz]];}
// the ground under every new floor is cut to 0.12 under it; where the slope is lower (a fill) it stays and a wall closes the side
function mmTerrain(x,z,h){const[lx,lz]=palL(x,z),B=MM.cutB;if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3])return h;
  for(const c of MM.cuts){if(lx<c.B[0]||lx>c.B[1]||lz<c.B[2]||lz>c.B[3]||!inPolyXZ(lx,lz,c.P))continue;const y=c.yf?c.yf(lx,lz):c.y;h=Math.min(h,y-.12);}
  return h;}
const mmIn=(lx,lz,P)=>inPolyXZ(lx,lz,P);
function mmPadAt(lx,lz,skip){for(const p of MM.pads){if(p===skip||!p.P)continue;const B=p.B||(p.B=mmBB(p.P));if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3])continue;if(mmIn(lx,lz,p.P))return p;}return null;}
function mmBldAt(lx,lz,m=0){for(const b of MM.blds){const B=b.B||(b.B=mmBB(b.P));if(lx<B[0]-m||lx>B[1]+m||lz<B[2]-m||lz>B[3]+m)continue;if(mmIn(lx,lz,b.P))return b;}return null;}
const mmPadY=(p,lx,lz)=>p.yf?p.yf(lx,lz):p.y;
/* ---------- the hooks ---------- */
{
  const _ps=palShape;palShape=function(x,z,h){mmSetup();return mmTerrain(x,z,_ps(x,z,h));};
  const _pp=palPlatPost;palPlatPost=function(x,z,h){mmSetup();return mmTerrain(x,z,_pp(x,z,h));};
  const _tl=templeLinks;templeLinks=function(W){const T=W.temples,q=palW(-162.5,100),mm=T?T.filter(t=>Math.hypot(t.x-q[0],t.z-q[1])<9):[];
    if(mm.length)W.temples=T.filter(t=>!mm.includes(t));try{_tl(W);}finally{if(mm.length)W.temples=T;}
    if(mm.length&&W.templeLinks){for(const t of mm)W.templeLinks.push({n:t.name||'众神之母神庙（库柏勒）',x:Math.round(t.x),z:Math.round(t.z),y:+t.y.toFixed(1),status:'linked',via:'mm lane'});if(W.templeLinkStats)W.templeLinkStats.linked+=mm.length;}
    MM.st.templeSkipped=mm.length;};
  palMMLinks=function(W){MM.st.mmWest='replaced (yard flight)';};
  const _wr=palWestReserve;palWestReserve=function(W){_wr(W);mmSetup();mmReserve(W);};
  const _ws=palWestSlope;palWestSlope=function(W){_ws(W);mmSetup();mmClearPlants(W,'slope');mmBuild(W);};
  const _wc=palWestClear;palWestClear=function(W){const n=_wc(W);mmClearPlants(W,'feet');return n;};
  const _sc=palScalae;palScalae=function(W){const ob=box,om=GB.prototype.mesh;MM.scT=[];MM.scC=[];
    const orb=rockBank;box=mmSCBox(ob);rockBank=mmSCBank(orb);GB.prototype.mesh=function(...a){mmSCFlush(this,ob);return om.apply(this,a);};try{return _sc(W);}finally{box=ob;rockBank=orb;GB.prototype.mesh=om;mmSCGate();}};
}
/* the side gate from the east arm (courtE, 33.5) into the Scalae Caci (review round 3: every step at most 0.2 m, flush at both ends). The stair's first flight
   passes the arm's south-east corner 0.2-1 m off; its treads there are cut in the rock between rock banks (temple-links.js E1), and its landing at 34.10 has a
   coped cheek: in round 2 the arm met it over that cheek. While palScalae builds the stair, the north side is opened over the landing and one tread each side
   (1.5 m): the landing's cheek pieces are held back and left out, and a rock bank that crosses the gap is drawn as two banks ending at its edges (their end faces
   close the gap's sides). box and rockBank draw no random numbers; nothing else of the stair changes. mmSCGateBuild then carries the landing and the two treads
   on north to the arm's edge at their own levels, and lays three treads on the arm: 33.5 -> 33.65 -> 33.80 -> 33.95 -> 34.10 (risers of 0.15 m). */
const MM_SCZ=[[-140,170.5],[-132.5,170.5],[-132.5,176],[-140,176]],MM_SCY=33.5;
const mmSCNorth=(F,s,z)=>{const a=F.p(s,0,z),b=F.p(s,0,-z);return palL(a[0],a[2])[1]<palL(b[0],b[2])[1];};
function mmSCBox(ob){return function(g,F,cx,y0,cz,hx,h,hz,faces){if(F&&F.p&&MM.scT){const w=F.p(cx,0,cz),q=palL(w[0],w[2]);
    if(inPolyXZ(q[0],q[1],MM_SCZ)){if(Math.abs(cz)<1e-6&&Math.abs(hz-2.9)<1e-6){MM.scT.push({g,F,s:cx,hx,y:y0+h});}
      else if(Math.abs(Math.abs(cz)-3.2)<1e-6&&mmSCNorth(F,cx,cz)){MM.scC.push({g,args:[g,F,cx,y0,cz,hx,h,hz,faces]});return;}}}   // the north (the arm's) cheeks: held
  return ob.apply(this,arguments);};}
// the landing for the gate: the widest piece (a landing, not a tread) nearest the arm's south-east corner; the gap: it and the next piece each side
function mmSCPick(T){const c=[-134.6,171.5];let best=null,bd=1e9;for(const r of T){if(r.hx<.35)continue;const w=r.F.p(r.s,0,0),q=palL(w[0],w[2]),d=Math.hypot(q[0]-c[0],q[1]-c[1]);if(d<bd){bd=d;best=r;}}return bd<5.5?best:null;}
function mmSCGap(T){const L=mmSCPick(T);if(!L)return null;const S=T.filter(r=>r.F===L.F),up=S.filter(r=>r.s<L.s-.05).sort((p,q)=>q.s-p.s)[0],dn=S.filter(r=>r.s>L.s+.05).sort((p,q)=>p.s-q.s)[0];
  return{L,lo:up?up.s-up.hx+.02:L.s-L.hx,hi:dn?dn.s+dn.hx-.02:L.s+L.hx,P:[up,L,dn].filter(Boolean)};}
function mmSCBank(orb){return function(g,F,sa,sb,ya,yb,sd,w,...r){const G=MM.scT&&F&&F.p?mmSCGap(MM.scT):null;
  if(G&&G.L.F===F&&mmSCNorth(F,(sa+sb)/2,sd)&&sb>G.lo&&sa<G.hi){const yAt=s=>lerp(ya,yb,clamp((s-sa)/(sb-sa),0,1));MM.st.scBanks=(MM.st.scBanks||0)+1;
    if(G.lo-sa>.1)orb.call(this,g,F,sa,G.lo,ya,yAt(G.lo),sd,w,r[0],r[1],null,r[3]);if(sb-G.hi>.1)orb.call(this,g,F,G.hi,sb,yAt(G.hi),yb,sd,w,r[0],null,r[2],r[3]);return;}
  return orb.apply(this,arguments);};}
function mmSCFlush(g,ob){if(!MM.scC)return;const G=mmSCGap(MM.scT.filter(r=>r.g===g));
  MM.scC=MM.scC.filter(c=>{if(c.g!==g)return true;const a=c.args;if(G&&a[1]===G.L.F&&a[2]+a[5]>G.lo+.1&&a[2]-a[5]<G.hi-.1){MM.st.scCut=(MM.st.scCut||0)+1;return false;}ob.apply(null,a);return false;});}
function mmSCGate(){const G=mmSCGap(MM.scT||[]);MM.scT=MM.scC=null;if(!G){MM.scGate=null;return;}const F=G.L.F,a=F.p(0,0,1),b=F.p(0,0,-1),sg=palL(a[0],a[2])[1]<palL(b[0],b[2])[1]?1:-1;   // sg: the frame's z towards the arm
  MM.scGate={F,sg,lo:G.lo,hi:G.hi,P:G.P.map(r=>({s:r.s,hx:r.hx-.02,y:r.y}))};}
// the arm's south edge (courtE: lz 171.5-171.6 from lx -134 to -140.6) in the gate's frame: z at stretch s where the edge line is met
function mmSCEdgeZ(G,s){const E=mmData().pads.find(p=>p.id==='courtE').P,a=E[6],b=E[7],lzOn=lx=>lerp(a[1],b[1],clamp((lx-a[0])/(b[0]-a[0]),0,1));
  let z=G.sg*2.9;for(let k=0;k<400;k++){const w=G.F.p(s,0,z),q=palL(w[0],w[2]);if(q[1]<=lzOn(q[0]))break;z+=G.sg*.005;}return z;}
function mmSCGateBuild(W,g){const G=MM.scGate;if(!G)return null;const F=G.F,sg=G.sg,gy=W.gy,P=(s,y,z)=>F.p(s,y,z),dep=.4;
  const dS=P(1,0,0),dZ=P(0,0,1),o=P(0,0,0),uS=[dS[0]-o[0],0,dS[2]-o[2]],uZ=[(dZ[0]-o[0])*sg,0,(dZ[2]-o[2])*sg],mS=[-uS[0],0,-uS[2]],z0=sg*2.88;
  // a solid block over stretch s0..s1, from za(s) to zb(s) (frame z), top y, down to yb
  const blk=(s0,s1,za0,za1,zb0,zb1,y,yb)=>{g.set(60,.4,1,2);g.poly([P(s0,y,za0),P(s1,y,za1),P(s1,y,zb1),P(s0,y,zb0)],[0,1,0]);g.set(60,.45,1,0);
    g.poly([P(s1,yb,za1),P(s1,yb,zb1),P(s1,y,zb1),P(s1,y,za1)],uS);g.poly([P(s0,yb,zb0),P(s0,yb,za0),P(s0,y,za0),P(s0,y,zb0)],mS);g.poly([P(s0,yb,zb0),P(s1,yb,zb1),P(s1,y,zb1),P(s0,y,zb0)],uZ);};
  const out={pieces:[],width:+(G.hi-G.lo).toFixed(2)};
  for(const r of G.P){const s0=Math.max(G.lo,r.s-r.hx),s1=Math.min(G.hi,r.s+r.hx),e0=mmSCEdgeZ(G,s0),e1=mmSCEdgeZ(G,s1);let yg=1e9;for(const[s,z]of[[s0,z0],[s1,z0],[s0,e0],[s1,e1]]){const q=P(s,0,z);yg=Math.min(yg,gy(q[0],q[2]));}
    blk(s0,s1,z0,z0,e0,e1,r.y,Math.min(yg,r.y)-.6);out.pieces.push(+r.y.toFixed(3));}   // the stair's own tread or landing, carried on to the arm's edge
  const yTop=Math.max(...G.P.map(r=>r.y)),n=Math.max(1,Math.ceil((yTop-MM_SCY)/.2-1e-3)),rise=(yTop-MM_SCY)/n,e0=mmSCEdgeZ(G,G.lo),e1=mmSCEdgeZ(G,G.hi);
  for(let k=n-1;k>=1;k--){const y=MM_SCY+rise*k,da=(n-1-k)*dep,db=(n-k)*dep;blk(G.lo,G.hi,e0+sg*da,e1+sg*da,e0+sg*db,e1+sg*db,y,MM_SCY-.05);}   // treads on the arm, the highest by the edge
  out.arm=[MM_SCY,...[...Array(n-1).keys()].map(k=>+(MM_SCY+rise*(k+1)).toFixed(3))];out.steps=[...out.arm,...out.pieces];
  return out;}
function mmReserve(W){let n=0;const add=P=>{const B=mmBB(P),c=palW((B[0]+B[1])/2,(B[2]+B[3])/2),f=W.foot.add(c[0],c[1],(B[1]-B[0])/2,(B[3]-B[2])/2,PALF.rot,'mm');f.poly=P.map(p=>palW(p[0],p[1]));n++;};
  for(const b of MM.blds)add(b.P);for(const p of MM.pads)if(p.P&&p.id!=='hut')add(p.P);add(mmData().encl.P);MM.st.foot=n;}
// the grove, scrub and fill inside the scheme go (the review: the planting of 2026-11-13 stays outside it); wall-foot plants on the new floors go
function mmClearPlants(W,k){const D=mmData(),A=[[-213,98],[-134,98],[-134,176],[-150,183],[-172,178],[-208,170],[-216,150]],Lo=[[-209,168],[-157,192],[-148,196],[-150,222],[-212,214]],E=D.encl.P;
  const ends=[];{const L=D.lane.P,d=[L[0][0]-L[1][0],L[0][1]-L[1][1]],l=Math.hypot(...d);ends.push([L[0][0]+d[0]/l*1.5,L[0][1]+d[1]/l*1.5],[L[0][0],L[0][1]]);const B=D.branch.P;ends.push([B[1][0],B[1][1]]);for(const S of D.stairs)if(!S.skip)ends.push(S.a,S.b);}
  const atEnd=(lx,lz)=>ends.some(e=>Math.hypot(lx-e[0],lz-e[1])<2.4);   // the mouths of the new paths and stairs stay clear
  const inA=(lx,lz)=>atEnd(lx,lz)||mmIn(lx,lz,A)||mmIn(lx,lz,Lo)||mmIn(lx,lz,E)||!!mmPadAt(lx,lz)||!!mmBldAt(lx,lz,.8)||Math.hypot((lx+101.5)/5.5,(lz-169.5)/4.6)<1;let n=0;
  for(let i=W.trees.length-1;i>=0;i--){const t=W.trees[i];if(MM.mine.has(t))continue;const[lx,lz]=palL(t[0],t[2]);if(!inA(lx,lz))continue;
    if(k==='feet'&&!mmPadAt(lx,lz)&&!mmBldAt(lx,lz,.8)&&!atEnd(lx,lz))continue;W.trees.splice(i,1);n++;}
  if(k==='feet'&&typeof ROME!=='undefined')for(let i=ROME.GLB.length-1;i>=0;i--){const p=ROME.GLB[i];if(!/^rome_rock/.test(p.n))continue;const[lx,lz]=palL(p.x,p.z);const near=[[0,0],[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]].some(o=>mmPadAt(lx+o[0],lz+o[1]));if(near||mmBldAt(lx,lz,1.2)||ends.some(e=>Math.hypot(lx-e[0],lz-e[1])<3.2)){ROME.GLB.splice(i,1);n++;}}   // the ledge rocks: none on or against a new floor, a house or a stair's mouth
  MM.st['cleared_'+k]=n;}
/* ---------- builders ---------- */
// one tile for every roof of the scheme (the author, round 3: the Palatine's roofs a little more of one colour). roofCol (materials.js) at seed
// 1544/4096 gives (.394,.118,.054), unweathered: the hill models' 'tile' (.393,.095,.047). A second, 2132/4096 (.284,.103,.052, older), near their
// 'tile2' (.263,.078,.043), on R2, R5, B0, S2, AS and one city house in four (MM_ROOF2, b.r2): 9 of 37 roofs
const MM_ROOF=[1544/4096,2132/4096],MM_ROOF2=new Set(['R2','R5','B0','S2','AS']),mmRoofS=b=>MM_ROOF[b&&(MM_ROOF2.has(b.id)||b.r2)?1:0];
const MMF={tufa:(g,s)=>g.set(47,s),ret:(g,s)=>g.set(60,s,1,0),plaster:(g,s)=>g.set(44,s)};
function mmSurf(g,surf,s){if(surf==='pave')g.set(11,s);else if(surf==='earth')g.set(21,s);else if(surf==='yard')g.set(27,s);else if(surf==='garden')g.set(23,s);else if(surf==='lane')g.set(11,s);else g.set(21,s);}
function mmFloor(g,P,y,surf,s){mmSurf(g,surf,s);for(const T of mmTri(P))g.poly(T.map(p=>PFR.p(p[0],y,p[1])),[0,1,0]);}
function mmMask(W,P){for(const T of mmTri(P))groundMaskQuad(W,[...T,T[2]].map(p=>palW(p[0],p[1])));}
// a vertical strip of wall in the hill frame from a to b, bottoms ya0/yb0, tops ya1/yb1, facing the normal n (local); a coping on top
function mmWallStrip(g,a,b,ya0,ya1,yb0,yb1,n,fin,s,cope=true,th=.45){const P=(p,y,o)=>PFR.p(p[0]+n[0]*o,y,p[1]+n[1]*o),wd=[n[0],0,n[1]],dd=PFR.d(wd[0],0,wd[2]);
  if(fin==='plaster')mmPlasterQ(g,a,b,ya0,ya1,yb0,yb1,n,s);
  else{MMF[fin](g,s);g.poly([P(a,ya0,0),P(b,yb0,0),P(b,yb1,0),P(a,ya1,0)],dd);g.set(60,s,1,1);const h=.6;if(ya1-ya0>1.4)g.poly([P(a,ya0,.03),P(b,yb0,.03),P(b,yb0+h,.03),P(a,ya0+h,.03)],dd);}   // a plinth course of big blocks
  if(cope){trimSet(g,1,.5);const o=.06;g.poly([P(a,ya1+.1,o),P(b,yb1+.1,o),P(b,yb1+.1,-th),P(a,ya1+.1,-th)],[0,1,0]);g.poly([P(a,ya1,o),P(b,yb1,o),P(b,yb1+.1,o),P(a,ya1+.1,o)],dd);}
  // weeds at the foot (the visible side): a strip of moss and grass
  g.set(62,s,1,0);g.poly([P(a,ya0+.32,.04),P(b,yb0+.32,.04),P(b,yb0-.05,.75),P(a,ya0-.05,.75)],[n[0]*.6,1,n[1]*.6]);}
// lime plaster in the city houses' colours (materials.js plasterCol: off-white, grey-beige, yellow, pale ochre, ochre) over a dado of squared tuff
// 1.2-1.8 m high (from MM.plD), the colour from MM.plS (one per wall run: neighbours differ). uv: u along the wall, v 2.6 m up at the dado top so the
// shader's foot bands stay off, the eave streaks under the top
const MM_ARMW={courtE:[4,5]};   // the pad edges whose cut wall has a 3.4 m deep coping over the band cut behind it (mmSetup)
const MM_PL=[.0098,.035,.0589,.0842,.101,.1178];
function mmPlasterQ(g,a,b,ya0,ya1,yb0,yb1,n,s){const P=(p,y,o)=>PFR.p(p[0]+n[0]*o,y,p[1]+n[1]*o),dd=PFR.d(n[0],0,n[1]),t=[-n[1],n[0]],ua=a[0]*t[0]+a[1]*t[1],ub=b[0]*t[0]+b[1]*t[1];
  const dh=MM.plD||1.5,da=Math.min(ya1,Math.max(ya0,(MM.plY??ya0+.5)+dh)),db=Math.min(yb1,Math.max(yb0,(MM.plY??yb0+.5)+dh));
  g.set(60,s,1,0);g.poly([P(a,ya0,0),P(b,yb0,0),P(b,db,0),P(a,da,0)],dd);
  if(ya1-da<.05&&yb1-db<.05)return;const y0=Math.min(da,db),top=Math.max(ya1,yb1)-y0+2.6;
  g.set(0,MM.plS??MM_PL[0],0,0,1,top);g.poly([P(a,da,.01),P(b,db,.01),P(b,yb1,.01),P(a,ya1,.01)],dd,[[ua,da-y0+2.6],[ub,db-y0+2.6],[ub,yb1-y0+2.6],[ua,ya1-y0+2.6]],Math.abs(ub-ua),3);
  trimSet(g,1,s);g.poly([P(a,da,.06),P(b,db,.06),P(b,db+.08,.06),P(a,da+.08,.06)],dd);g.poly([P(a,da+.08,.06),P(b,db+.08,.06),P(b,db+.08,0),P(a,da+.08,0)],[0,1,0]);}   // the dado's capping
// the auto walls of a pad: along every edge, 1 m pieces. Beside another pad lower down, or the slope lower down: a fill wall from there up to the floor + kerb;
// the slope higher: a cut wall from the floor up to the ground behind + 0.3; beside a building of the scheme, a model or a pad at the same level: nothing
function mmPadWalls(W,g,p,kerb){const P=p.P,ar=mmArea(P),gy=W.gy,s0=.3+.4*teH(P[0][0],P[0][1],7);let nW=0,maxE=0;
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.05)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,n=ar>0?[uz,-ux]:[-uz,ux];   // n: out of the pad
    const N=Math.max(1,Math.round(L/(p.id==='courtE'?.3:1.2))),S=[];   // courtE: 0.3 m pieces, so its kerb opens for the 1 m gate to the Scalae Caci only
    for(let j=0;j<=N;j++){const t=Math.min(L-.02,Math.max(.02,L*j/N)),q=[a[0]+ux*t,a[1]+uz*t],y=mmPadY(p,q[0]-n[0]*.15,q[1]-n[1]*.15),o1=[q[0]+n[0]*.7,q[1]+n[1]*.7],o2=[q[0]+n[0]*3.3,q[1]+n[1]*3.3];
      let kind=null,yo=null;const ob=mmBldAt(o1[0],o1[1]),op=mmPadAt(o1[0],o1[1],p);
      const inSt=(MM.stairQ||[]).some(Q=>inPolyXZ(o1[0],o1[1],Q)&&!inPolyXZ(q[0]-n[0]*.3,q[1]-n[1]*.3,Q));   // a stair leaves this edge here: open
      const sgy=MM.terFloor?(()=>{const w=palW(...o1);return MM.terFloor(w[0],w[1]);})():null;   // an existing terrace floor (ring 23, ring 30, the H1 terraces) outside, whatever the masked terrain under it says
      if(ob||inSt||palInAsset(o1[0],o1[1],.3))kind=null;
      else if(sgy!=null&&!op){if(sgy<y-.35){kind='fill';yo=sgy;}else if(sgy>y+.35){kind='cut';yo=Math.min(sgy,y+7.5);}}   // level with it: open
      else if(p.leg&&/^(lane0|branch0|alley2)$/.test(p.id)&&y<Math.min(p.leg.y0,p.leg.y1)+.4)kind=null;   // a path's foot: open to the road it leaves
      else if(op){const yy=mmPadY(op,o1[0],o1[1]);if(yy<y-.3){kind='fill';yo=yy;}}
      else{const w1=palW(...o1),w2=palW(...o2),g1=gy(w1[0],w1[1]),g2=gy(w2[0],w2[1]);if(Math.max(g1,g2)>y+.35){kind='cut';yo=Math.min(Math.max(g1,g2),y+7.5);}else if(Math.min(g1,g2)<y-.35){kind='fill';yo=Math.min(g1,g2);}}
      if(p.snap&&kind)kind=null;   // a pad set on an existing ring floor (r30w, n30): that floor is its ground, no wall
      S.push({q,y,kind,yo});}
    MM.plS=MM_PL[(i+[...p.id].reduce((h,c)=>h+c.charCodeAt(0),0))%6];MM.plY=null;
    const TR=[];for(let j=0;j<N;j++){const A=S[j],B=S[j+1];if(!A.kind||A.kind!==B.kind)continue;
      if(A.kind==='fill'){const k=kerb??.45,m=1.6,o=(q,d)=>[q[0]+n[0]*d,q[1]+n[1]*d],free=q=>!mmBldAt(q[0],q[1],.2)&&!mmPadAt(q[0],q[1],p)&&!(MM.stairQ||[]).some(Q=>inPolyXZ(q[0],q[1],Q));
        if(Math.max(A.y-A.yo,B.y-B.yo)+k>8.9&&free(o(A.q,m))&&free(o(B.q,m))&&free(o(A.q,m*.5))){   // over 9 m: one set-back tier (R: no wall face over 9 m), a ledge 1.6 m wide with a low parapet, pots on it
          const tA=Math.max(A.yo+.3,A.y+k-8.85),tB=Math.max(B.yo+.3,B.y+k-8.85),A1=o(A.q,m),B1=o(B.q,m);
          mmWallStrip(g,A1,B1,A.yo-.7,tA+.55,B.yo-.7,tB+.55,n,p.fin||'ret',s0,true,.35);mmWallStrip(g,A.q,B.q,Math.min(tA,tB)-.3,A.y+k,Math.min(tA,tB)-.3,B.y+k,n,p.fin||'ret',s0);
          g.set(21,s0);g.poly([PFR.p(A.q[0],tA,A.q[1]),PFR.p(B.q[0],tB,B.q[1]),PFR.p(B1[0],tB,B1[1]),PFR.p(A1[0],tA,A1[1])],[0,1,0]);
          (MM.ledge=MM.ledge||[]).push([(A.q[0]+B.q[0])/2+n[0]*m*.5,(A.q[1]+B.q[1])/2+n[1]*m*.5,(tA+tB)/2]);
          maxE=Math.max(maxE,A.y+k-Math.min(tA,tB)+.3-.3,tA+.55-A.yo,tB+.55-B.yo);MM.st.tiers=(MM.st.tiers||0)+1;TR[j]={A,B,A1,B1,tA,tB,top:[A.y+k,B.y+k]};}
        else{S[j].plain=1;mmWallStrip(g,A.q,B.q,A.yo-.7,A.y+k,B.yo-.7,B.y+k,n,p.fin||'ret',s0);maxE=Math.max(maxE,A.y-A.yo,B.y-B.yo);}}
      else{const nn=[-n[0],-n[1]],A2=[A.q[0]+n[0]*.02,A.q[1]+n[1]*.02],B2=[B.q[0]+n[0]*.02,B.q[1]+n[1]*.02];mmWallStrip(g,B2,A2,B.y-.4,B.yo+.3,A.y-.4,A.yo+.3,nn,p.cfin||p.fin||'ret',s0,true,(MM_ARMW[p.id]||[]).includes(i)?3.4:.45);maxE=Math.max(maxE,A.yo+.3-A.y,B.yo+.3-B.y);}
      nW++;}
    // round 3: both ends of a run of tier pieces closed by a side wall across the ledge (to the full wall's top where a plain fill wall goes on, else
    // the parapet's), faced on the outside from the foot and on the ledge side from the ledge floor
    TR.forEach((r,j)=>{if(!r)return;for(const end of[0,1]){if(TR[end?j+1:j-1])continue;const q=end?r.B.q:r.A.q,q1=end?r.B1:r.A1,ty=end?r.tB:r.tA,yo=(end?r.B:r.A).yo,
        nb=S[end?j+1:j-1],full=nb&&nb.plain,top=full?r.top[end]:ty+.55,u=end?[ux,uz]:[-ux,-uz];
      mmWallStrip(g,q1,q,yo-.7,top,yo-.7,top,u,p.fin||'ret',s0,true,.3);mmWallStrip(g,[q[0]-u[0]*.3,q[1]-u[1]*.3],[q1[0]-u[0]*.3,q1[1]-u[1]*.3],ty-.05,top,ty-.05,top,[-u[0],-u[1]],p.fin||'ret',s0,false);
      MM.st.tierEnds=(MM.st.tierEnds||0)+1;}});}
  return{nW,maxE};}
// the floor of an existing terrace at a world point (the footprints with palTer, the H1 outlines W.palPlats), or null
function mmTerFloor(W){const T=W.foot.list.filter(f=>f.palTer!=null),PP=W.palPlats||[];
  return(x,z)=>{let y=null;for(const f of T){const dx=x-f.cx,dz=z-f.cz;if(Math.abs(dx)>f.r||Math.abs(dz)>f.r)continue;if(Math.abs(f.c*dx-f.s*dz)<=f.hw-.2&&Math.abs(f.s*dx+f.c*dz)<=f.hd-.2)y=Math.max(y??-1e9,f.palTer);}
    for(const P of PP)if(inPolyXZ(x,z,P.W))y=Math.max(y??-1e9,P.y);return y;};}
// a straight flight from a (at ya) to b (at yb), treads of equal run, risers <= 0.19; landing 1.4 m in the middle when more than 20 risers. Solid to the ground.
function mmFlight(W,g,a,b,ya,yb,w,s){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,dy=yb-ya,n=Math.max(1,Math.ceil(Math.abs(dy)/.19)),rise=dy/n,land=n>20?1.4:0,run=(L-land)/n;
  const wd=PFR.d(ux,0,uz),aw=palW(a[0],a[1]),Fw=frame(aw[0],0,aw[1],Math.atan2(-wd[2],wd[0])),gy=W.gy,half=Math.floor(n/2),steps=[];let x=0,tr=0;
  for(let k=0;k<n;k++){const len=run+(land&&k===half-1?land:0);steps.push([x,x+len,ya+rise*(k+1)]);x+=len;}   // the tread after riser k; the last one is the lower (or upper) floor's level
  for(const[x0,x1,yt]of steps){let yg=1e9;for(const xx of[x0,x1])for(const zz of[-w/2,w/2]){const q=Fw.p(xx,0,zz);yg=Math.min(yg,gy(q[0],q[2]));}
    g.set(60,s,1,0);box(g,Fw,(x0+x1)/2,Math.min(yg,yt)-.6,0,(x1-x0)/2,yt-Math.min(yg,yt)+.6-.08,w/2,31&~32);trimSet(g,1,s);box(g,Fw,(x0+x1)/2,yt-.08,0,(x1-x0)/2+.02,.08,w/2,31);tr++;}
  return{n,rise,run,tr,ends:[ya,yb]};}
// a stepped strip (lane leg): treads at the leg's yf, risers between; solid down to the ground
function mmLaneMesh(W,g,p,s){const G=p.leg,{a,b,n,y0,y1,m0,m1,hw}=G,gy=W.gy,lp=(t,side)=>{const mx=lerp(m0[0],m1[0],t),mz=lerp(m0[1],m1[1],t);return[lerp(a[0],b[0],t)+mx*hw*side,lerp(a[1],b[1],t)+mz*hw*side];};
  for(let k=0;k<=n;k++){const t0=Math.max(0,(k-.5)/n),t1=Math.min(1,(k+.5)/n),y=y0+(y1-y0)*k/n,A=lp(t0,1),B=lp(t1,1),C=lp(t1,-1),Dd=lp(t0,-1);
    g.set(11,s);g.poly([A,B,C,Dd].map(q=>PFR.p(q[0],y,q[1])),[0,1,0]);
    if(k>0){const yp=y0+(y1-y0)*(k-1)/n,lo=Math.min(y,yp),hi=Math.max(y,yp),fw=y>yp?-1:1;g.set(60,s,1,0);const d=[b[0]-a[0],0,b[1]-a[1]];g.poly([PFR.p(A[0],lo,A[1]),PFR.p(Dd[0],lo,Dd[1]),PFR.p(Dd[0],hi,Dd[1]),PFR.p(A[0],hi,A[1])],PFR.d(d[0]*fw,0,d[2]*fw));}}
  return n;}
// a box on a wall face in wall coordinates: u along (t), v up, o out of the wall (n); five faces (not the back)
function mmWBox(g,P,dd,dt,u0,u1,v0,v1,o0,o1){const mt=[-dt[0],-dt[1],-dt[2]];g.poly([P(u0,v0,o1),P(u1,v0,o1),P(u1,v1,o1),P(u0,v1,o1)],dd);g.poly([P(u0,v1,o0),P(u1,v1,o0),P(u1,v1,o1),P(u0,v1,o1)],[0,1,0]);
  g.poly([P(u0,v0,o0),P(u1,v0,o0),P(u1,v0,o1),P(u0,v0,o1)],[0,-1,0]);g.poly([P(u1,v0,o0),P(u1,v1,o0),P(u1,v1,o1),P(u1,v0,o1)],dt);g.poly([P(u0,v0,o0),P(u0,v1,o0),P(u0,v1,o1),P(u0,v0,o1)],mt);}
// a window: a dark opening behind a travertine surround 0.1 m wide on the face (round 3: no frame shows more than 0.15 m), 0.28 m deep (the reveal reads as the wall's thickness), a sill stone, timber shutters
// folded back against the wall (one window in three shut). From p (local) on a wall facing n, at height y; w x h
function mmWin(g,p,n,y,w,h,s){const t=[-n[1],n[0]],P=(u,v,o)=>PFR.p(p[0]+t[0]*u+n[0]*o,v,p[1]+t[1]*u+n[1]*o),dd=PFR.d(n[0],0,n[1]),dt=PFR.d(t[0],0,t[1]),D=.28,f=.1,hw=w/2;
  g.set(39,s);g.poly([P(-hw,y,.02),P(hw,y,.02),P(hw,y+h,.02),P(-hw,y+h,.02)],dd);
  trimSet(g,1,s);mmWBox(g,P,dd,dt,-hw-f,-hw,y,y+h,0,D);mmWBox(g,P,dd,dt,hw,hw+f,y,y+h,0,D);mmWBox(g,P,dd,dt,-hw-f,hw+f,y+h,y+h+.12,0,D);
  mmWBox(g,P,dd,dt,-hw-f-.04,hw+f+.04,y-.1,y,0,D+.05);   // the sill
  const shut=teH(p[0],p[1],17)<.33;g.set(3,s);if(shut)mmWBox(g,P,dd,dt,-hw,hw,y+.02,y+h-.02,.06,.1);
  else{mmWBox(g,P,dd,dt,-hw-f-hw,-hw-f-.02,y+.02,y+h-.02,0,.05);mmWBox(g,P,dd,dt,hw+f+.02,hw+f+hw,y+.02,y+h-.02,0,.05);}}
// a door: timber leaf set back in a travertine frame 0.13 m wide on the face (jambs and lintel 0.25 m proud), a threshold stone in front
function mmDoor(g,p,n,y,w,h,s){const t=[-n[1],n[0]],P=(u,v,o)=>PFR.p(p[0]+t[0]*u+n[0]*o,v,p[1]+t[1]*u+n[1]*o),dd=PFR.d(n[0],0,n[1]),dt=PFR.d(t[0],0,t[1]),D=.25,f=.13,hw=w/2;
  g.set(45,s);g.poly([P(-hw,y,.09),P(hw,y,.09),P(hw,y+h,.09),P(-hw,y+h,.09)],dd);
  trimSet(g,1,s);mmWBox(g,P,dd,dt,-hw-f,-hw,y,y+h,0,D);mmWBox(g,P,dd,dt,hw,hw+f,y,y+h,0,D);mmWBox(g,P,dd,dt,-hw-f-.02,hw+f+.02,y+h,y+h+.15,0,D+.03);
  mmWBox(g,P,dd,dt,-hw-.12,hw+.12,y-.1,y+.06,0,.42);}   // the threshold
// one block of the scheme (not a city house): walls of the given finish from yB to the eave, a plinth, a roof. L: front-right, front-left, back-left, back-right
function mmBlock(W,g,b,s){const L=b.P,y=b.y,yE=y+b.h,gy=W.gy;let yB=1e9;for(const q of L){const w=palW(q[0],q[1]);yB=Math.min(yB,gy(w[0],w[1]));}yB=Math.min(yB,y)-.5;b.yB=yB;
  const fin='plaster',bi=MM.blds.indexOf(b);MM.plS=MM_PL[(bi+6)%6];MM.plY=y;MM.plD=1.2+.6*teH(bi,3.1,11);const ar=mmArea(L);   // every block: a tuff dado, plaster above, the colour turning from block to block
  const edges=[0,1,2,3].map(i=>{const a=L[i],c=L[(i+1)%4],l=Math.hypot(c[0]-a[0],c[1]-a[1]),ux=(c[0]-a[0])/l,uz=(c[1]-a[1])/l;return{a,c,l,ux,uz,n:ar>0?[uz,-ux]:[-uz,ux]};});
  const lean=b.roof==='lean',back=b.fall==='front'?2:0,drop=lean?Math.min(2.2,Math.max(1.1,edges[1].l*.24)):0;
  // walls: front edge 0, sides 1 and 3, back 2 (for a lean roof the high side is the back unless fall says 'front' ... the high side is opposite the fall)
  const hiE=b.fall==='back'?0:2;   // the high edge of a lean roof
  for(let i=0;i<4;i++){const e=edges[i],top=yE+(lean&&i===hiE?drop:0);mmWallStrip(g,e.c,e.a,yB,top,yB,top,e.n,fin,s,false);
    if(lean&&(i===1||i===3)){g.set(0,MM.plS,0,0,1,40);const hiA=i===1?(hiE===2?e.c:e.a):(hiE===2?e.a:e.c),loA=hiA===e.a?e.c:e.a,dd=PFR.d(e.n[0],0,e.n[1]);g.poly([PFR.p(loA[0],yE,loA[1]),PFR.p(hiA[0],yE,hiA[1]),PFR.p(hiA[0],yE+drop,hiA[1])],dd);}}
  // plinth: a course of tuff 0.5 m over the floor round the foot, 6 cm proud
  g.set(47,s);for(const e of edges){const P=(p,yy)=>PFR.p(p[0]+e.n[0]*.06,yy,p[1]+e.n[1]*.06);g.poly([P(e.c,yB),P(e.a,yB),P(e.a,y+.5),P(e.c,y+.5)],PFR.d(e.n[0],0,e.n[1]));trimSet(g,1,s);g.poly([P(e.c,y+.5),P(e.a,y+.5),PFR.p(e.a[0],y+.5,e.a[1]),PFR.p(e.c[0],y+.5,e.c[1])],[0,1,0]);g.set(47,s);}
  // roof
  const over=.45;if(lean){const lo=edges[hiE===2?0:2],hi=edges[hiE],o=(p,e,k)=>[p[0]+e.n[0]*k,p[1]+e.n[1]*k],sx=(p,e)=>[p[0]-e.ux*.3,p[1]-e.uz*.3],ex=(p,e)=>[p[0]+e.ux*.3,p[1]+e.uz*.3];
      const A=o(sx(lo.a,lo),lo,over),B=o(ex(lo.c,lo),lo,over),C=o(sx(hi.a,hi),hi,.05),Dd=o(ex(hi.c,hi),hi,.05);
      const rs=mmRoofS(b);g.set(1,rs);g.poly([PFR.p(A[0],yE-.12,A[1]),PFR.p(B[0],yE-.12,B[1]),PFR.p(C[0],yE+drop+.05,C[1]),PFR.p(Dd[0],yE+drop+.05,Dd[1])].slice(0,4),[0,1,0]);
      g.set(3,s);g.poly([PFR.p(A[0],yE-.22,A[1]),PFR.p(B[0],yE-.22,B[1]),PFR.p(C[0],yE+drop-.05,C[1]),PFR.p(Dd[0],yE+drop-.05,Dd[1])],[0,-1,0]);
      const aw=palW(A[0],A[1]),bw=palW(B[0],B[1]);rdAntefixes(g,[bw[0],bw[1]],[aw[0],aw[1]],yE-.12,rs);}
  else if(b.roof==='flat'){g.set(46,s);for(const T of mmTri(L))g.poly(T.map(p=>PFR.p(p[0],yE+.02,p[1])),[0,1,0]);
      for(const e of edges)mmWallStrip(g,e.c,e.a,yE,yE+.95,yE,yE+.95,e.n,fin,s,true,.3);}
  else{const c=[(L[0][0]+L[2][0])/2,(L[0][1]+L[2][1])/2],e=edges[0],th=Math.atan2(-e.uz,e.ux)/DEG+180,F=PFR.sub(c[0],0,c[1],th*DEG),w=edges[0].l,d=edges[1].l;roof(g,F,b.roof==='hip'?'hip':'gable',0,0,w,d,yE,(b.roof==='hip'?22:24)*DEG,over,mmRoofS(b),{part:44,seed:s,nSt:1,gH:4,sH:4,floorY:yE-4});}
  MM.plY=null;return{yB,edges,fin};}
function mmBuild(W){const t0=performance.now(),D=mmData(),g=new GB(1<<16),gS=new GB(1<<15),gH=new GB(1<<16),gL=new GB(1<<15),st=MM.st,gy=W.gy,SG=stairGround(W);
  const mine=t=>{W.trees.push(t);MM.mine.add(t);};MM.SG=SG;MM.terFloor=mmTerFloor(W);MM.stairQ=D.stairs.filter(S=>!S.skip).map(S=>mmStripQ(S.a,S.b,S.w+.1));
  if(MM.scGate){const G=MM.scGate,Q=[[G.lo,G.sg*2.9],[G.hi,G.sg*2.9],[G.hi,mmSCEdgeZ(G,G.hi)],[G.lo,mmSCEdgeZ(G,G.lo)]].map(([s,z])=>{const w=G.F.p(s,0,z);return palL(w[0],w[2]);});MM.stairQ.push(Q);MM.scQ=Q;}
  // levels that join existing floors: snapped to them (R11)
  const snap=q=>{const w=palW(q[0],q[1]);return+SG(w[0],w[1]).toFixed(3);};
  const A=PAL_ASSETS.find(a=>a.n==='rome_magna_mater'),PW=PAL_MM_LINKS.west,yTop=A?A.y+PW.z:40.6;
  for(const p of MM.pads){if(p.snap)p.y=snap(p.snap);if(p.id==='top')p.y=yTop;}
  {const L0=D.lane.P[0];st.laneFoot={want:L0[2],ring23:snap(L0)};const B1=D.branch.P[1];st.branchFoot={want:B1[2],ring30:snap(B1)};}
  for(const b of MM.blds)if(b.snapY)b.y=snap(b.snapY);
  // the model stair's base (as palMMLinks had it): its old underside is solid down to the ground, in 1 m pieces
  if(A){const t=A.turn*DEG,c=Math.cos(t),s=Math.sin(t),M=(x,y)=>palW(A.lx+c*x-s*y,A.lz-s*x-c*y),F0=M(...PW.foot),H0=M(...PW.head),wo=PW.w+1.2,Ls=Math.hypot(H0[0]-F0[0],H0[1]-F0[1]),Fs=frame(F0[0],0,F0[1],Math.atan2(-(H0[1]-F0[1]),H0[0]-F0[0])),yb=yTop-.5;let nb=0;
    for(let q=0;q<Ls-.01;q+=1){const l=Math.min(1,Ls-q);let yg=1e9;for(const a of[q,q+l])for(const bb of[-wo/2,wo/2]){const r=Fs.p(a,0,bb);yg=Math.min(yg,gy(r[0],r[2]));}
      if(yg-.8<yb-.05){g.set(60,.5,1,0);box(g,Fs,q+l/2,yg-.8,0,l/2+.01,yb-yg+.8,wo/2,31&~32);nb++;}}st.modelBase=nb;st.modelFoot=palL(F0[0],F0[1]).map(v=>+v.toFixed(2));}
  // floors, masks, walls
  st.walls={};let tri0=0;
  for(const p of MM.pads){if(!p.P)continue;const s=.3+.5*teH(p.P[0][0],p.P[0][1],3);
    if(p.leg){mmLaneMesh(W,gL,p,s);mmMask(W,p.P);const r=mmPadWalls(W,g,p,.55);st.walls[p.id]=r;continue;}
    if(p.solid){const B=mmBB(p.P);let yg=1e9;for(const q of p.P){const w=palW(q[0],q[1]);yg=Math.min(yg,gy(w[0],w[1]));}
      let tier=null;if(p.y-yg>8.9){const yT=p.y-7.8,m=1.4,T=[B[0]-m,B[1]+m,B[2],B[3]+m];tier={y:+yT.toFixed(2),exp:+(yT+.55-yg).toFixed(2)};   // over 9 m: a set-back tier on the W, S and E (the flight lands on the N), a ledge with a low parapet and pots
        g.set(60,s,1,0);box(g,PFR,(T[0]+T[1])/2,yg-.8,(T[2]+T[3])/2,(T[1]-T[0])/2,yT-yg+.8,(T[3]-T[2])/2,31&~32);g.set(21,s);g.poly([PFR.p(T[0],yT+.01,T[2]),PFR.p(T[1],yT+.01,T[2]),PFR.p(T[1],yT+.01,T[3]),PFR.p(T[0],yT+.01,T[3])],[0,1,0]);
        for(const[a,c,n]of[[[T[0],T[2]],[T[0],T[3]],[-1,0]],[[T[0],T[3]],[T[1],T[3]],[0,1]],[[T[1],T[3]],[T[1],T[2]],[1,0]]])mmWallStrip(g,[a[0]-n[0]*.2,a[1]-n[1]*.2],[c[0]-n[0]*.2,c[1]-n[1]*.2],yT,yT+.55,yT,yT+.55,n,'tufa',.45,true,.3);
        for(const[x0,x1]of[[T[0],B[0]],[B[1],T[1]]]){mmWallStrip(g,[x1,T[2]],[x0,T[2]],yg-.8,p.y,yg-.8,p.y,[0,-1],'tufa',.45,true,.3);mmWallStrip(g,[x0,T[2]+.3],[x1,T[2]+.3],yT-.05,p.y,yT-.05,p.y,[0,1],'tufa',.45,false);MM.st.tierEnds=(MM.st.tierEnds||0)+1;}   // round 3: the W and E ledges closed at their north ends
        for(let lz=B[2]+1;lz<T[3]-.5;lz+=2.2)for(const lx of[B[0]-m*.5,B[1]+m*.5])if(!mmBldAt(lx,lz,.3))(MM.ledge=MM.ledge||[]).push([lx,lz,yT]);
        for(let lx=T[0]+.8;lx<T[1];lx+=2.2)if(!mmBldAt(lx,B[3]+m*.5,.3))(MM.ledge=MM.ledge||[]).push([lx,B[3]+m*.5,yT]);}g.set(60,s,1,0);box(g,PFR,(B[0]+B[1])/2,yg-.8,(B[2]+B[3])/2,(B[1]-B[0])/2,p.y-.12-yg+.8,(B[3]-B[2])/2,31&~32);trimSet(g,1,.45);box(g,PFR,(B[0]+B[1])/2,p.y-.12,(B[2]+B[3])/2,(B[1]-B[0])/2+.03,.12,(B[3]-B[2])/2+.03,31);for(let yy=p.y-3.4;yy>yg+1.5;yy-=3.4){trimSet(g,1,.45);box(g,PFR,(B[0]+B[1])/2,yy,(B[2]+B[3])/2,(B[1]-B[0])/2+.05,.16,(B[3]-B[2])/2+.05,31&~32);}   // string courses every 3.4 m
      {const cz=B[3]+.04,cx=(B[0]+B[1])/2,P=(u,yy)=>PFR.p(cx+u,yy,cz),yn=p.y-6.2;g.set(39,.5);g.poly([P(-.75,yn),P(.75,yn),P(.75,yn+2.1),P(-.75,yn+2.1)],PFR.d(0,0,1));for(let i=0;i<6;i++){const a0=Math.PI*i/6,a1=Math.PI*(i+1)/6;g.poly([P(0,yn+2.1),P(Math.cos(a0)*.75,yn+2.1+Math.sin(a0)*.75),P(Math.cos(a1)*.75,yn+2.1+Math.sin(a1)*.75)],PFR.d(0,0,1));}
        trimSet(g,1,.45);g.poly([PFR.p(cx-.85,yn-.02,cz+.25),PFR.p(cx+.85,yn-.02,cz+.25),PFR.p(cx+.85,yn-.02,cz),PFR.p(cx-.85,yn-.02,cz)],[0,1,0]);}   // a shrine niche on the face over the gatehouse
      if(p.id==='top'){const y=p.y;for(const[a,c,n]of[[[B[0],B[3]],[B[0],B[2]+.02],[-1,0]],[[B[1],B[3]],[B[0],B[3]],[0,1]],[[B[1],B[2]+2.8],[B[1],B[3]],[1,0]]])mmWallStrip(g,[a[0]-n[0]*.3,a[1]-n[1]*.3],[c[0]-n[0]*.3,c[1]-n[1]*.3],y,y+1.05,y,y+1.05,n,'tufa',.45,true,.3);}   // a parapet on the landing's three open sides (W, S, and E below the model stair)
      st.walls[p.id]={solid:1,exp:+(tier?p.y+1.05-tier.y:p.y-yg).toFixed(2),tier};continue;}
    mmFloor(gS,p.P,p.y+.0,p.surf,s);mmMask(W,p.P);st.walls[p.id]=mmPadWalls(W,g,p,p.garden?1.1:.45);}
  // stairs
  st.stairs={};const yOf=v=>typeof v==='number'?v:v==='top'?yTop:(MM.pads.find(p=>p.id===v)||{}).y;
  for(const S of D.stairs){if(S.skip)continue;const ya=yOf(S.ya),yb=yOf(S.yb);const r=mmFlight(W,gL,S.a,S.b,ya,yb,S.w,.45);mmMask(W,mmStripQ(S.a,S.b,S.w+.3));
    const sp={id:S.id,P:mmStripQ(S.a,S.b,S.w),y:Math.min(ya,yb),yf:(lx,lz)=>{const L=Math.hypot(S.b[0]-S.a[0],S.b[1]-S.a[1]),t=clamp(((lx-S.a[0])*(S.b[0]-S.a[0])+(lz-S.a[1])*(S.b[1]-S.a[1]))/(L*L),0,1);return lerp(ya,yb,t);},fin:'ret'};
    st.stairs[S.id]={n:r.n,rise:+r.rise.toFixed(3),run:+r.run.toFixed(2),ya,yb,walls:mmPadWalls(W,g,sp,.95)};}
  st.scGate=mmSCGateBuild(W,gL);
  // buildings
  st.blds={};
  for(const b of MM.blds){const s=.2+.6*teH(b.P[0][0],b.P[0][1],5);
    if(b.k==='shop'){mmCityHouse(W,gH,b,s);st.blds[b.id]={k:b.k,y:b.y,use:b.use};continue;}
    const r=mmBlock(W,gH,b,s);st.blds[b.id]={k:b.k,y:b.y,yB:+r.yB.toFixed(2),use:b.use};mmDetails(W,gH,b,r,s);}
  mmGardenWalls(W,g,D);mmEnclosure(W,g,D,mine);mmHut(W,gH,D);mmLife(W,g,D,mine);mmLife2(W,g,gH,D,mine);
  // nobody and nothing stands inside the new buildings (the city's own street life was placed before them); no static cone figures anywhere in the
  // scheme (review round 3: an empty lane is better than cones; the walker's townspeople, FPN 'f', are the only people here)
  {const ZA=[[-213,98],[-134,98],[-134,176],[-150,183],[-172,178],[-208,170],[-216,150]],ZL=[[-209,168],[-157,192],[-148,196],[-150,222],[-212,214]],inZ=(x,z)=>{const[lx,lz]=palL(x,z);return inPolyXZ(lx,lz,ZA)||inPolyXZ(lx,lz,ZL);};
    const inB=(x,z)=>{const[lx,lz]=palL(x,z),B=MM.cutB;if(lx<B[0]||lx>B[1]||lz<B[2]||lz>B[3])return false;for(const b of MM.blds)if(inPolyXZ(lx,lz,b.P))return true;return false;};
    const n0=W.people.length;W.people=W.people.filter(q=>!inB(q[0],q[2])&&!inZ(q[0],q[2]));const g0=ROME.GLB.length;for(let i=ROME.GLB.length-1;i>=0;i--){const q=ROME.GLB[i];if(q.o&&q.o.inst&&inB(q.x,q.z))ROME.GLB.splice(i,1);}
    st.removedInside={people:n0-W.people.length,props:g0-ROME.GLB.length};}
  for(const[G,name,tag]of[[g,'mmWalls','other'],[gS,'mmFloors','squares'],[gH,'mmHouses','houses'],[gL,'mmStairs','stairs']]){const m=layTag(G.mesh(MAT.city),tag);if(m){m.name=name;W.scene.add(m);st['tri_'+name]=G.ni/3;}}
  st.ms=Math.round(performance.now()-t0);if(typeof window!=='undefined')window.__mm=MM;console.log('mm preview',JSON.stringify({ms:st.ms,blds:MM.blds.length,pads:MM.pads.length,tri:[g,gS,gH,gL].reduce((a,G)=>a+G.ni/3,0)}));}
// review round 2: the things at eye level. A jar; a tiled canopy on brackets; the lane's height at lx
function mmJar(g,lx,lz,y,k,s){const w=palW(lx,lz),F=frame(w[0],0,w[1],0);g.set(25,s);lathe(g,F,0,y,0,[[.2*k,0],[.34*k,.25*k],[.36*k,.5*k],[.26*k,.78*k],[.16*k,.86*k],[.19*k,.94*k],[0,.94*k]],9);}
function mmCanopy(g,q,n,y,w,dp,s){const t=[-n[1],n[0]],P=(u,v,o)=>PFR.p(q[0]+t[0]*u+n[0]*o,v,q[1]+t[1]*u+n[1]*o),dd=PFR.d(n[0],0,n[1]),dt=PFR.d(t[0],0,t[1]),hw=w/2;
  g.set(1,MM_ROOF[0]);g.poly([P(-hw,y+.35,.04),P(hw,y+.35,.04),P(hw,y,dp),P(-hw,y,dp)],[n[0]*.3,1,n[1]*.3]);g.set(3,s);g.poly([P(-hw,y+.27,.04),P(hw,y+.27,.04),P(hw,y-.08,dp),P(-hw,y-.08,dp)],[-n[0]*.3,-1,-n[1]*.3]);
  for(const u of[-hw+.2,hw-.2])mmWBox(g,P,dd,dt,u-.06,u+.06,y-.55,y+.25,0,dp*.85);
  const a=P(-hw,y,dp),b=P(hw,y,dp);rdAntefixes(g,[b[0],b[2]],[a[0],a[2]],y,MM_ROOF[0]);}
function mmLaneY(lx){const L=mmData().lane.P;for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1],x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]);if(lx>=x0&&lx<=x1){const t=(lx-a[0])/(b[0]-a[0]);return[lerp(a[1],b[1],t),lerp(a[2],b[2],t)];}}return null;}
function mmLife2(W,g,gH,D,mine){const s=.45,tree=(lx,lz,y,k,sc)=>{const w=palW(lx,lz);mine([w[0],y,w[1],k,sc,null,3]);};
  // the ledges of the set-back tiers: a jar with a shrub in it every other place, a small fig at the far ends
  (MM.ledge||[]).forEach((q,i)=>{if(i%2)return;mmJar(g,q[0],q[1],q[2],1.3,s);tree(q[0],q[1],q[2]+1.1,i%6===0?'broad':'shrub',i%6===0?.4:.55);});MM.st.ledgePots=Math.ceil((MM.ledge||[]).length/2);
  // the court: a tiled lean-to on square timber posts along R5 (R7: square posts), a stone trough and jars under it; the well and the bench stay
  {const y=32.5,z0=155.35,z1=157.25,x0=-159.4,x1=-153.7,yH=y+3.3,yL=y+2.75;   // 1.9 m deep: the way in from the lane (z 157.8) stays clear
    g.set(1,MM_ROOF[0]);g.poly([PFR.p(x0,yH,z0),PFR.p(x1,yH,z0),PFR.p(x1,yL,z1),PFR.p(x0,yL,z1)],[0,1,.3]);
    g.set(3,s);g.poly([PFR.p(x0,yH-.1,z0),PFR.p(x1,yH-.1,z0),PFR.p(x1,yL-.1,z1-.05),PFR.p(x0,yL-.1,z1-.05)],[0,-1,-.3]);
    for(const x of[-159.05,-156.55,-154.05])box(g,PFR,x,y,z1-.25,.09,yL-y-.08,.09,31);box(g,PFR,(x0+x1)/2,yL-.3,z1-.25,(x1-x0)/2-.15,.22,.1,31);
    {const a=PFR.p(x1,yL,z1),b=PFR.p(x0,yL,z1);rdAntefixes(g,[a[0],a[2]],[b[0],b[2]],yL,MM_ROOF[0]);}
    g.set(48,s);box(g,PFR,-155.3,y,155.95,.75,.62,.28,31);g.set(39,s);g.poly([PFR.p(-155.95,y+.63,155.75),PFR.p(-154.65,y+.63,155.75),PFR.p(-154.65,y+.63,156.15),PFR.p(-155.95,y+.63,156.15)],[0,1,0]);   // the trough, water dark in it
    mmJar(g,-153.95,156.0,y,1.15,s);mmJar(g,-154.25,156.75,y,.9,s);mmJar(g,-158.1,155.9,y,1.0,s);}
  // the lane: a door at the lane's level in AE's back wall with a tiled canopy and a high window over it; a door from the lane into the walled garden
  {const b=MM.blds.find(q=>q.id==='AE');if(b){const a=b.P[2],c=b.P[3],t=.32,q=[a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t],l=Math.hypot(c[0]-a[0],c[1]-a[1]),n=[(c[1]-a[1])/l,-(c[0]-a[0])/l],nn=n[1]<0?n:[-n[0],-n[1]],L=mmLaneY(q[0]),yl=L?L[1]:29;
    mmDoor(gH,q,nn,yl+.02,1,2.1,s);mmCanopy(gH,q,nn,yl+2.75,1.8,.95,s);mmWin(gH,[q[0]+(c[0]-a[0])/l*2.6,q[1]+(c[1]-a[1])/l*2.6],nn,yl+3.4,.5,.65,s);mmWin(gH,[q[0]-(c[0]-a[0])/l*2.4,q[1]-(c[1]-a[1])/l*2.4],nn,yl+3.6,.45,.6,s);}}
  {const P=D.garden.P,a=P[2],c=P[3],q=[a[0]+(c[0]-a[0])*.4,a[1]+(c[1]-a[1])*.4],l=Math.hypot(c[0]-a[0],c[1]-a[1]),n=[(c[1]-a[1])/l,-(c[0]-a[0])/l],nn=n[1]<0?n:[-n[0],-n[1]],L=mmLaneY(q[0]);if(L)mmDoor(gH,q,nn,L[1]+.02,.95,2.0,s);}
  // the side gate from the arm onto the Scalae Caci: mmSCGateBuild (built with the stairs)
  // the walker's crowd: no guard posts or patrols in the lane, the court and the yard (the annex and the houses' back lane, not a guard post): two or three townspeople
  if(typeof FPN!=='undefined'&&!FPN._mm){FPN._mm=1;const Z=[[-213,98],[-134,98],[-134,176],[-150,183],[-172,178],[-208,170],[-216,150]],o=FPN.mk;
    FPN.mk=function(k,x,z,y,h){if(k==='g'){const q=palL(x,z);if(inPolyXZ(q[0],q[1],Z)){let n=0;for(const a of this.list){const r=palL(a.x,a.z);if(a.k==='f'&&inPolyXZ(r[0],r[1],Z))n++;}const a=o.call(this,'f',x,z,y,h);if(n>=3)this.list.splice(this.list.indexOf(a),1);return a;}}return o.call(this,k,x,z,y,h);};}}
// a city house below the foot wall (the city's own shell: houseShell, its facade shader's doors, windows and shops; rdShopRow; the tiled roofs)
function mmCityHouse(W,g,b,s){const L=b.P,gy=W.gy;let yB=1e9;for(const q of L){const w=palW(q[0],q[1]);yB=Math.min(yB,gy(w[0],w[1]));}yB=Math.min(yB,b.y)-.3;
  const R=RNG(Math.floor(s*1e6)+7),gH=3.9+R()*.5,sH=3.0+R()*.3,nSt=b.nSt||2,yT=b.y+gH+stUp(nSt-1,sH,false),winT=Math.floor(R()*8);
  const fac={part:R()<.45?9:0,seed:s,sty:winT+8*2,fl:2|8|(R()<.5?16:0),nSt,gH,sH,lit:.5+R()*.4,shopMask:1,doorSide:0,burn:0};
  houseShell(W,g,PFR,L,yB,yT,b.y+.15,fac);
  const e0=L[0],e1=L[1],e3=L[3],l=Math.hypot(e1[0]-e0[0],e1[1]-e0[1]),ux=(e1[0]-e0[0])/l,uz=(e1[1]-e0[1])/l,d=Math.hypot(e3[0]-e0[0],e3[1]-e0[1]);
  // roof: a lean-to falling to the front, or a gable across the front (tiles, antefixes)
  const c=[(L[0][0]+L[2][0])/2,(L[0][1]+L[2][1])/2],th=Math.atan2(-uz,ux)+Math.PI,F=PFR.sub(c[0],0,c[1],th);
  if(b.roof==='lean'){const B={P:L,y:yT,h:0,k:'x',roof:'lean'};const drop=1.3,o=.5,n=[(L[0][0]-L[3][0])/d,(L[0][1]-L[3][1])/d];const A=[L[0][0]+n[0]*o-ux*.3,L[0][1]+n[1]*o-uz*.3],Bq=[L[1][0]+n[0]*o+ux*.3,L[1][1]+n[1]*o+uz*.3],C=[L[2][0]+ux*.3,L[2][1]+uz*.3],Dq=[L[3][0]-ux*.3,L[3][1]-uz*.3];
    g.set(1,mmRoofS(b));g.poly([PFR.p(A[0],yT-.1,A[1]),PFR.p(Bq[0],yT-.1,Bq[1]),PFR.p(C[0],yT+drop,C[1]),PFR.p(Dq[0],yT+drop,Dq[1])],[0,1,0]);
    g.set(fac.part===9?9:44,s);for(const[p0,p1]of[[L[1],L[2]],[L[3],L[0]]]){const hi=p0===L[1]?p1:p0,lo=p0===L[1]?p0:p1;g.poly([PFR.p(lo[0],yT,lo[1]),PFR.p(hi[0],yT,hi[1]),PFR.p(hi[0],yT+drop,hi[1])],null);g.poly([PFR.p(hi[0],yT+drop,hi[1]),PFR.p(hi[0],yT,hi[1]),PFR.p(lo[0],yT,lo[1])],null);}
    {const a=L[3],bq=L[2];g.set(fac.part===9?9:44,s);g.poly([PFR.p(a[0],yT,a[1]),PFR.p(bq[0],yT,bq[1]),PFR.p(bq[0],yT+drop,bq[1]),PFR.p(a[0],yT+drop,a[1])],PFR.d(-n[0],0,-n[1]));}
    const aw=palW(A[0],A[1]),bw=palW(Bq[0],Bq[1]);rdAntefixes(g,[aw[0],aw[1]],[bw[0],bw[1]],yT-.1,mmRoofS(b));}
  else roof(g,F,'gable',0,0,l,d,yT,(20+R()*6)*DEG,.55,mmRoofS(b),Object.assign({},fac,{floorY:b.y}));
  // the shop front: piers, lintels, counters on the ground floor (rdShopRow) in one house of two; awnings and goods come in mmLife
  const Fw=PFR.sub((e0[0]+e1[0])/2,0,(e0[1]+e1[1])/2,Math.atan2(-uz,ux));
  if(R()<.6){const piers=rdShopRow(g,Fw,0,-l/2+.4,l/2-.4,b.y+.15,s,0,R()<.6);b.shop=piers||null;}
  if(b.bake){g.set(47,s);const q=[c[0]-(L[0][0]-L[3][0])/d*1.2,c[1]-(L[0][1]-L[3][1])/d*1.2];box(g,frame(...(()=>{const w=palW(q[0],q[1]);return[w[0],0,w[1]];})(),PALF.rot),0,yT-.5,0,.45,2.6,.45,31);}   // the bakery's oven flue
  b.yT=yT;b.ux=ux;b.uz=uz;b.l=l;b.d=d;}
// details of the scheme's own blocks: doors, small windows, the gated recess RA, the gatehouse door
function mmDetails(W,g,b,r,s){const E=r.edges,f=E[0],mid=(e,t=.5)=>[e.a[0]+(e.c[0]-e.a[0])*t,e.a[1]+(e.c[1]-e.a[1])*t],y=b.y;
  if(b.k==='annex'){const nWin=Math.max(1,Math.floor(f.l/2.6));mmDoor(g,mid(f,.5+(teH(y,b.r[0],1)-.5)*.3),f.n,y+.06,1.1,2.25,s);
    for(let i=0;i<nWin;i++){const t=(i+.5)/nWin;if(Math.abs(t-.5)<.18&&nWin>1)continue;mmWin(g,mid(f,t),f.n,y+1.6,.55,.7,s);}
    const yU=y+4.1;   // the upper storey: a row of small windows (round 3: the loggias of R3 and R6, a dark panel behind piers, are plastered and windowed like the rest)
    {const nU=Math.max(3,Math.round(f.l/1.9));for(let i=0;i<nU;i++)mmWin(g,mid(f,(i+.5)/nU),f.n,yU+1.0,.48,.62,s);}}
  else if(b.k==='arch'){const c=mid(f),P=(u,yy,o)=>PFR.p(c[0]+f.ux*u+f.n[0]*o,yy,c[1]+f.uz*u+f.n[1]*o),hw=1.35,h0=y+2.6,dd=PFR.d(f.n[0],0,f.n[1]),din=-4;
    g.set(39,s);g.poly([P(-hw,y,.04),P(hw,y,.04),P(hw,h0,.04),P(-hw,h0,.04)],dd);for(let i=0;i<8;i++){const a0=Math.PI*i/8,a1=Math.PI*(i+1)/8;g.poly([P(0,h0,.04),P(Math.cos(a0)*hw,h0+Math.sin(a0)*hw,.04),P(Math.cos(a1)*hw,h0+Math.sin(a1)*hw,.04)],dd);}   // the recess's dark mouth (4 m deep behind, unlit)
    g.set(47,s*.7);for(let i=0;i<9;i++){const a0=Math.PI*i/9,a1=Math.PI*(i+1)/9,r0=hw+.06,r1=hw+.62;g.poly([P(Math.cos(a0)*r0,h0+Math.sin(a0)*r0,.1),P(Math.cos(a0)*r1,h0+Math.sin(a0)*r1,.1),P(Math.cos(a1)*r1,h0+Math.sin(a1)*r1,.1),P(Math.cos(a1)*r0,h0+Math.sin(a1)*r0,.1)].reverse(),dd);}   // tufa voussoirs
    trimSet(g,1,s);g.poly([P(-.26,h0+hw+.02,.12),P(.26,h0+hw+.02,.12),P(.2,h0+hw+.66,.12),P(-.2,h0+hw+.66,.12)],dd);   // the travertine keystone
    g.set(3,s);for(let u=-hw+.18;u<hw;u+=.24)box(g,frame(...(()=>{const w=PFR.p(c[0]+f.ux*u+f.n[0]*.25,0,c[1]+f.uz*u+f.n[1]*.25);return[w[0],0,w[2]];})(),PALF.rot),0,y,0,.03,2.55+Math.sqrt(Math.max(0,hw*hw-u*u))*.92,.03,31);   // the timber grille gate
    mmDoor(g,mid(f,.92),f.n,y+.05,.8,2,s);}   // the porter's door beside it
  else if(b.k==='wall'){for(const i of[1,3]){const e=E[i];if(e.l<3.5)continue;const m=Math.floor(e.l/4.5)||1;for(let j=0;j<m;j++)mmWin(g,mid(e,(j+.5)/m),e.n,y+b.h-1.5,.42,.5,s);if(b.h>6.5)for(let j=0;j<m;j++)mmWin(g,mid(e,(j+.5)/m),e.n,y+1.9,.36,.42,s);}
    const n=Math.max(1,Math.floor(f.l/4.5));for(let i=0;i<n;i++)mmWin(g,mid(f,(i+.5+(teH(i,y,3)-.5)*.3)/n),f.n,y+b.h-1.6,.45,.55,s);mmDoor(g,mid(f,.18+.6*teH(y,f.l,4)),f.n,y+.06,1,2.1,s);
    const k=E[2];if(b.id[0]==='A'||b.id[0]==='C'){const yl=b.id[0]==='C'?32.5:null;const q=mid(k,.5),yy=yl??(()=>{const w=palW(q[0]+k.n[0]*1.5,q[1]+k.n[1]*1.5);return W.gy(w[0],w[1]);})();if(yy>y+1.5)mmDoor(g,q,k.n,yy,.95,2.05,s);for(let i=0;i<2;i++)mmWin(g,mid(k,.2+.6*i),k.n,y+b.h-1.3,.42,.5,s);}}
  else if(b.k==='gate'){mmDoor(g,mid(f),f.n,y+.06,1.6,2.7,s);if(b.h>5)for(const t of[.25,.75])mmWin(g,mid(f,t),f.n,y+b.h-1.7,.45,.6,s);}
  else if(b.k==='store'||b.k==='shed'){const n=b.k==='shed'?1:Math.max(2,Math.round(f.l/4.6));for(let i=0;i<n;i++)mmDoor(g,mid(f,(i+.5)/n),f.n,y+.06,b.k==='shed'?2.2:1.2,b.k==='shed'?2.1:2.2,s);}}
// the lower house's walled garden: walls along its four sides (3.2 m over the garden on the foot road, 2.4 m over the lane on the lane), a service door
function mmGardenWalls(W,g,D){const P=D.garden.P,y=D.garden.y,ar=mmArea(P),s=.4;const lz=x=>{const L=D.lane.P;for(let i=0;i<L.length-1;i++)if(x>=L[i][0]&&x<=L[i+1][0]){const t=(x-L[i][0])/(L[i+1][0]-L[i][0]);return lerp(L[i][2],L[i+1][2],t);}return 27;};
  for(let i=0;i<P.length;i++){const a=P[i],c=P[(i+1)%P.length],l=Math.hypot(c[0]-a[0],c[1]-a[1]),ux=(c[0]-a[0])/l,uz=(c[1]-a[1])/l,n=ar>0?[uz,-ux]:[-uz,ux];if(mmBldAt(a[0]+(c[0]-a[0])/2+n[0]*.6,a[1]+(c[1]-a[1])/2+n[1]*.6))continue;
    const top=i===2?Math.max(lz(a[0]),lz(c[0]))+2.4:y+3.4;mmWallStrip(g,c,a,y-.4,top,y-.4,top,n,'plaster',s,true,.4);
    if(i===0)mmDoor(g,[a[0]+ux*l*.5,a[1]+uz*l*.5],n,y+.06,1,2.1,s);}}
// the pine enclosure in the north pit (design): a low wall following the ground, its top stepped, a tiled coping; one gate (north) with two piers and a timber leaf
function mmEnclosure(W,g,D,mine){const P=D.encl.P,ar=mmArea(P),gy=W.gy,s=.5;let pieces=0,skip=0;
  for(let i=0;i<P.length;i++){const a=P[i],c=P[(i+1)%P.length],l=Math.hypot(c[0]-a[0],c[1]-a[1]),ux=(c[0]-a[0])/l,uz=(c[1]-a[1])/l,n=ar>0?[uz,-ux]:[-uz,ux],N=Math.max(1,Math.round(l/2.4));
    for(let j=0;j<N;j++){const t0=l*j/N,t1=l*(j+1)/N,p0=[a[0]+ux*t0,a[1]+uz*t0],p1=[a[0]+ux*t1,a[1]+uz*t1],m=[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2];
      if(i===0&&m[0]>D.encl.gate[0]-.2&&m[0]<D.encl.gate[1]+.2){skip++;continue;}if(palInAsset(m[0],m[1],.4)){skip++;continue;}
      let lo=1e9,hi=-1e9;for(const q of[p0,p1])for(const o of[-.8,.8]){const w=palW(q[0]+n[0]*o,q[1]+n[1]*o),h=gy(w[0],w[1]);lo=Math.min(lo,h);hi=Math.max(hi,h);}
      const top=Math.ceil((hi+1.25)/.45)*.45;mmWallStrip(g,p1,p0,lo-.5,top,lo-.5,top,n,'tufa',s,false);mmWallStrip(g,p0,p1,lo-.5,top,lo-.5,top,[-n[0],-n[1]],'tufa',s,false);
      g.set(1,MM_ROOF[0]);const R=(p,yy,o)=>PFR.p(p[0]+n[0]*o,yy,p[1]+n[1]*o);g.poly([R(p0,top+.02,.36),R(p1,top+.02,.36),R(p1,top+.24,0),R(p0,top+.24,0)],[n[0],1,n[1]]);g.poly([R(p1,top+.02,-.36),R(p0,top+.02,-.36),R(p0,top+.24,0),R(p1,top+.24,0)],[-n[0],1,-n[1]]);
      g.set(47,s);for(const[pp,dir]of[[p0,1],[p1,-1]])g.poly([R(pp,top,.3),R(pp,top,-.3),R(pp,lo-.5,-.3),R(pp,lo-.5,.3)].map(v=>v),PFR.d(-ux*dir,0,-uz*dir));pieces++;}}
  // the gate
  {const z=P[0][1],x0=D.encl.gate[0],x1=D.encl.gate[1],w0=palW((x0+x1)/2,z),yg=gy(w0[0],w0[1]);for(const x of[x0-.4,x1+.4]){const w=palW(x,z),F=frame(w[0],0,w[1],PALF.rot);g.set(47,s);box(g,F,0,yg-.5,0,.4,2.9+.5,.4,31);trimSet(g,1,s);box(g,F,0,yg+2.9,0,.48,.18,.48,31);}
    g.set(3,s);const F=frame(w0[0],0,w0[1],PALF.rot);box(g,F,0,yg+2.35,0,(x1-x0)/2+.1,.18,.12,31);box(g,F,-(x1-x0)/4,yg,.05,(x1-x0)/4-.05,1.9,.04,31);box(g,F,(x1-x0)/4+.4,yg,-.5,(x1-x0)/4-.05,1.9,.04,31);
    g.set(48,s);const a=palW(-114.6,86),Fa=frame(a[0],0,a[1],PALF.rot),ya=gy(a[0],a[1]);box(g,Fa,0,ya-.3,0,.6,1.35,.45,31);}   // an altar inside (travertine)
  // the planting: five stone pines (Attis' pine, the Magna Mater's), laurels and a shrub belt against the two temples' rock
  const pin=[[-122,82],[-108,80],[-116,91],[-104.5,88.5],[-125,92]];for(const[lx,lz]of pin){const w=palW(lx,lz);mine([w[0],gy(w[0],w[1]),w[1],'pine',.95+.25*teH(w[0],w[1],1),null,3]);}
  for(let k=0;k<36;k++){const t=k/26,lx=k<12?-128.2:k<26?lerp(-127,-100.5,(k-12)/14):-100.4,lz=k<12?lerp(77,97,t*26/12):k<26?lerp(96.6,94.5,(k-12)/14)-1:lerp(76,93,(k-26)/9),w=palW(lx+(teH(k,1,2)-.5)*1.2,lz+(teH(k,2,2)-.5)*1.2);
    mine([w[0],gy(w[0],w[1]),w[1],k%5===2?'broad':'shrub',k%5===2?.55:1.1+.6*teH(k,3,2),k%5===2?[.045,.088,.032]:null,3]);}
  MM.st.encl={pieces,skip,pines:pin.length};}
// the casa Romuli (【史】the hut of Romulus kept on the Palatine as a relic; its place here is approximate): an oval wattle-and-daub hut, thatched, a low fence
function mmHut(W,g,D){const p=MM.pads.find(q=>q.id==='hut'),w=palW(-101.5,169.5),y=p.y,F=frame(w[0],0,w[1],PALF.rot+.3),a=2.5,b=1.8,N=18,s=.4;
  const E=(k,sx,yy)=>F.p(Math.cos(k/N*TAU)*a*sx,yy,Math.sin(k/N*TAU)*b*sx);
  for(let k=0;k<N;k++){g.set(30,s);g.poly([E(k,1,y-.3),E(k+1,1,y-.3),E(k+1,1,y+1.85),E(k,1,y+1.85)],null);g.poly([E(k,1,y+1.85),E(k+1,1,y+1.85),E(k+1,1,y-.3),E(k,1,y-.3)],null);}
  for(let k=0;k<N;k++){g.set(3,.15+.1*(k%3));const r0=1.22,ap=F.p(0,y+4.3,0);g.poly([E(k,r0,y+1.6),E(k+1,r0,y+1.6),ap],null);g.poly([ap,E(k+1,r0,y+1.6),E(k,r0,y+1.6)],null);}   // the thatch, a cone over the oval (part 21: straw-brown)
  g.set(45,s);const dq=E(N*.25,1.02,y);const Fd=frame(dq[0],0,dq[2],PALF.rot+.3);box(g,Fd,0,y,0,.42,1.55,.04,31);
  g.set(3,s);for(let k=0;k<28;k++){if(k===7||k===8)continue;const q=E(k*N/28,1.6,y);box(g,frame(q[0],0,q[2],0),0,y-.3,0,.05,1.25,.05,31);}
  for(let k=0;k<28;k++){if(k===7)continue;const q0=E(k*N/28,1.6,y+.85),q1=E((k+1)*N/28,1.6,y+.85);const dx=q1[0]-q0[0],dz=q1[2]-q0[2],l=Math.hypot(dx,dz);box(g,frame((q0[0]+q1[0])/2,0,(q0[2]+q1[2])/2,Math.atan2(-dz,dx)),0,y+.8,0,l/2,.06,.03,31);}
  MM.st.hut={y,ground:+W.gy(w[0],w[1]).toFixed(2)};}
// signs of life, each tied to its place (upper band: the annex and the houses' backs are quiet; trade is below the foot wall)
function mmLife(W,g,D,mine){const gy=W.gy,put=(n,lx,lz,y,rot,o)=>{const w=palW(lx,lz);ROME.GLB.push({n,x:w[0],y,z:w[1],r:rot,o:Object.assign({inst:1},o||{})});},
    tree=(lx,lz,y,k,s,col)=>{const w=palW(lx,lz);mine([w[0],y,w[1],k,s,col||null,3]);},rotN=n=>{const d=PFR.d(n[0],0,n[1]);return Math.atan2(d[0],d[2]);};   // rot: the model's +z out along n
  // the lane: the street shrine at the fork, against the corner of AE (its back to the wall, facing the lane)
  {const q=[-173.2,159.95],p=mmPadAt(q[0],q[1]);put('rome_compitum',q[0],q[1],p?mmPadY(p,q[0],q[1]):29.7,rotN([0,1]));}
  // the court (a service court of the house and the annex): a well-head, a bench by the gate RA, the stone pine and the fig in two corners
  {const y=32.5,w=palW(-154.5,160.5),F=frame(w[0],0,w[1],0);g.set(48,.5);lathe(g,F,0,y,0,[[.62,0],[.62,.82],[.5,.82],[.5,.1]],12);g.set(3,.4);box(g,F,-.75,y,0,.06,1.6,.06,31);box(g,F,.75,y,0,.06,1.6,.06,31);box(g,F,0,y+1.6,0,.82,.08,.08,31);
    const wb=palW(-159,156.4),Fb=frame(wb[0],0,wb[1],PALF.rot);g.set(48,.5);box(g,Fb,0,y,0,1,.42,.22,31);
    tree(-144.6,158,33.5,'pine',.75);tree(-159.6,163.2,y,'fig',.6);}
  // the yard (the sanctuary's work yard): jars, a cart under the pergola, kitchen beds, three stone pines at its north end, a low vine pergola
  {const y=33.5;put('rome_amphorae',-205,121,y,0.4);put('rome_amphorae',-207.3,127.6,y,2);put('rome_cart',-205.2,124.5,y,rotN([0,1]));
    tree(-206.5,106.5,y,'pine',.9);tree(-203,103.8,y,'pine',.8);tree(-207.5,112.5,y,'pine',.85);
    for(let i=0;i<4;i++)for(let j=0;j<5;j++)tree(-207.2+i*1.1,129.6+j*1.15,y,'shrub',.42+.08*teH(i,j,9),[.07,.11,.03]);
    const P=[-207.7,117.4],F=PFR.sub(P[0],0,P[1],0);g.set(3,.4);for(let i=0;i<3;i++)for(let j=0;j<4;j++)box(g,F,i*1.9,y,j*2.4,.07,2.45,.07,31);for(let i=0;i<3;i++)box(g,F,i*1.9,y+2.45,3.6,.06,.08,3.9,31);   // west of the way from the yard's south end to the flight (x -203.6 .. -201.5 clear)
    g.set(23,.6);g.poly([F.p(-.4,y+2.56,-.4),F.p(4.2,y+2.56,-.4),F.p(4.2,y+2.56,7.6),F.p(-.4,y+2.56,7.6)],[0,1,0]);g.poly([F.p(-.4,y+2.55,7.6),F.p(4.2,y+2.55,7.6),F.p(4.2,y+2.55,-.4),F.p(-.4,y+2.55,-.4)],[0,-1,0]);}
  // the house's roof terrace (C1): a vine pergola; laundry on C2's roof line
  {const b=MM.blds.find(q=>q.id==='C1');if(b){const yE=b.y+b.h,c=[(b.P[0][0]+b.P[2][0])/2,(b.P[0][1]+b.P[2][1])/2],F=PFR.sub(c[0],0,c[1],0);g.set(3,.4);for(const[i,j]of[[-2,-1.4],[2,-1.4],[-2,1.4],[2,1.4]])box(g,F,i,yE,j,.06,2.3,.06,31);g.set(23,.55);g.poly([F.p(-2.4,yE+2.35,1.8),F.p(2.4,yE+2.35,1.8),F.p(2.4,yE+2.35,-1.8),F.p(-2.4,yE+2.35,-1.8)],[0,1,0]);g.poly([F.p(-2.4,yE+2.34,-1.8),F.p(2.4,yE+2.34,-1.8),F.p(2.4,yE+2.34,1.8),F.p(-2.4,yE+2.34,1.8)],[0,-1,0]);}}
  // the walled garden: trees over its walls
  tree(-187.6,163.6,23,'cyp',.9);tree(-183.4,164.6,23,'cyp',.85);tree(-185.6,168.4,23,'pine',.7);tree(-188,169.6,23,'broad',.6,[.045,.088,.032]);tree(-182.8,170.4,23,'pomegr',.7);
  // ---- below the foot wall: the street trade ----
  for(const b of MM.blds){if(b.k!=='shop'||!b.l)continue;const n=[(b.P[0][0]-b.P[3][0])/b.d,(b.P[0][1]-b.P[3][1])/b.d],c=[(b.P[0][0]+b.P[1][0])/2,(b.P[0][1]+b.P[1][1])/2],r=rotN(n),k=teH(c[0],c[1],11);
    if(b.shop&&k<.55)put('rome_awning',c[0]+n[0]*.95,c[1]+n[1]*.95,b.y+.15,rotN([-n[0],-n[1]]),{tint:[[.8,.74,.6],[.74,.5,.1],[.46,.12,.08],[.52,.34,.14]][Math.floor(k*7)%4]});
    if(b.shop){const nm=b.bake?'rome_wares_bread':['rome_wares_jars','rome_wares_cloth','rome_wares_amph','rome_wares_fish'][Math.floor(teH(c[0],c[1],12)*4)];put(nm,c[0]+n[0]*1.25-b.ux*1.2,c[1]+n[1]*1.25-b.uz*1.2,b.y+.15,r);}
    else if(k>.7)put('rome_amphorae',c[0]+n[0]*1.1+b.ux*1.4,c[1]+n[1]*1.1+b.uz*1.4,b.y+.15,r);}
  // the street fountain where the valley floor widens below the houses, people at it; a cart, laundry across the alley, a bench
  {const lx=-196,lz=200.5,w=palW(lx,lz),y=gy(w[0],w[1]);put('rome_lacus',lx,lz,y,PALF.rot);
    const b=MM.blds.find(q=>q.id==='T3_4_0.55');if(b&&b.l){const n=[(b.P[0][0]-b.P[3][0])/b.d,(b.P[0][1]-b.P[3][1])/b.d],c=[(b.P[0][0]+b.P[1][0])/2+n[0]*3.4,(b.P[0][1]+b.P[1][1])/2+n[1]*3.4],cq=palW(c[0],c[1]);put('rome_cart',c[0],c[1],gy(cq[0],cq[1]),rotN([b.ux,b.uz]));}}
  {const A=D.alley.P;if(A){const p=A[1];put('rome_laundry',p[0],p[1],p[2]+4.4,rotN([1,0]));}}
  // the kitchen gardens on T1: rows of greens, a fig or a pomegranate each, a few vines along the foot wall
  for(const p of MM.pads){if(!p.garden||!p.P)continue;const B=mmBB(p.P);let k=0;for(let lx=B[0]+.8;lx<B[1]-.6;lx+=1.3)for(let lz=B[2]+.8;lz<B[3]-.6;lz+=1.6){if(!mmIn(lx,lz,p.P)||mmBldAt(lx,lz,.6))continue;const h=teH(lx,lz,21);if(h<.62)tree(lx,lz,p.y,'shrub',.4+.12*h,[.06+.03*h,.1,.03]);else if(h>.95)tree(lx,lz,p.y,h>.975?'fig':'pomegr',.55);k++;}}
  MM.st.life=true;}

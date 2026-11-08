/* Residential repair is local to the built-up centre. The original density map and
   suburban falloff remain authoritative outside this boundary. */
function housingCore(x,z){return x>-430&&x<1250&&z>-1020&&z<780&&Math.hypot(x-250,(z+70)*.95)<1230&&romeHorti(x,z)<.35&&polyDist(x,z,TIBER)[0]>RTW+15;}
function housingFree(W,P){if(typeof residentialSiteAllowed==='function'&&!residentialSiteAllowed(W,P))return false;const b=lotOBB(P),cs=W.foot.cell,rad=Math.hypot(b.hw,b.hd),seen=new Set();
  for(let i=Math.floor((b.cx-rad)/cs);i<=Math.floor((b.cx+rad)/cs);i++)for(let j=Math.floor((b.cz-rad)/cs);j<=Math.floor((b.cz+rad)/cs);j++){
    for(const f of W.foot.map.get(W.foot.key(i,j))||[]){if(seen.has(f)||f.preAurea)continue;seen.add(f);if(nobleOverlap(P,f))return false;}}
  return true;
}
function fillCentralHousing(W){const R=RNG(641024),g=new GB(1<<18),late=new GB(1<<16),stats={total:0,noble:0,early:0,sloped:0,byPass:[],floors:{},bounds:[-430,-1020,1250,780]},records=[],rot=-30*DEG,c=Math.cos(rot),s=Math.sin(rot);
  const world=(u,v)=>[u*c+v*s,-u*s+v*c],deferred=W.foot.list.filter(f=>f.preAurea);
  // The noble generator already owns these lane centre lines. Reserve the actual lanes
  // before repairing rejected boundary parcels so the fallback cannot seal a through route.
  for(const r of W.nobleRoads||[]){const C=lp(r.a,r.b,.5);if(nobleQuarterAt(...C)!=='core')continue;const dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],l=Math.hypot(dx,dz);W.foot.add(C[0],C[1],l/2,r.width/2,Math.atan2(-dz,dx),'road');}
  for(const[step,w,d]of[[23,19,16],[15,12,10],[10,8.4,8.2]]){let added=0;
    for(let u=-850;u<1780;u+=step)for(let v=-1400;v<1400;v+=step){const R=RNG(hash2(u*31+step,v*17+977)*4294967296);   // dice keyed to the candidate: a change elsewhere does not reshuffle this house
      const[x,z]=world(u+(hash2(u,v)-.5)*1.4,v+(hash2(v,u)-.5)*1.4);if(!housingCore(x,z)||(W.v2At&&W.v2At(x,z)))continue;   // ?city=v2: parcels.js builds there
      const D=dCity(x,z);if(D<.36)continue; // Never turn low-density outskirts into a city grid.
      if(palFilled(x,z))continue;
      // Keep small public lanes through each repaired patch; old major roads are Foot obstacles.
      const near=k=>Math.min(((k%52)+52)%52,52-((k%52)+52)%52);if(near(u)<w/2+1.1||near(v+11)<d/2+1.1)continue;
      const F=frame(x,0,z,rot),P=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(q=>{const p=F.p(q[0],0,q[1]);return[p[0],p[2]];});
      if(P.some(p=>!housingCore(...p))||!housingFree(W,P))continue;
      const ground=houseGround(W,P);if(!ground||ground.max-ground.min>6)continue;
      const elite=nobleQuarterAt(x,z)==='core',early=Math.hypot(x-572,z-200)<155||AUREA_SITE(x,z)||deferred.some(f=>nobleOverlap(P,f));
      const G=early||AUREA_GONE(x,z)?late:g;let rec;   // (the houses by the vestibule and the Via Sacra keep their look but go with the fire too)
      if(elite&&!early&&pArea(P)>260){rec=nobleCourtHouse(W,G,P,R,'repair');if(!rec)continue;rec.meshTag='central_housing_repairs';W.nobleParcels.push(rec);W.nobleProcedural.push(rec);stats.noble++;}
      else{const ns=elite?(R()<.82?3:4):3+Math.floor(R()*3),seed=R(),profile={part:elite?0:R()<.28?9:0,seed,sty:elite?0:3+(R()<.4?8:0),fl:(elite?262144:0)|2|16,nSt:ns,gH:3.8,sH:2.9,pitch:20*DEG,lit:.7,flat:false,noSplit:true,noDecor:early,awn:early?0:.08,balc:early?0:.08};
        if(!lotBuild(W,G,P,profile,R,null))continue;rec={polygon:P,x,z,y:ground.min+.15,groundMin:ground.min,groundMax:ground.max,storeys:ns};}
      const ob=lotOBB(P),f=W.foot.add(ob.cx,ob.cz,ob.hw+.25,ob.hd+.25,ob.rot);f.poly=P;rec.early=early;records.push(rec);stats.total++;added++;if(early)stats.early++;if(ground.max-ground.min>1)stats.sloped++;stats.floors[rec.storeys]=(stats.floors[rec.storeys]||0)+1;
    }stats.byPass.push({size:[w,d],added});}
  const mesh=layTag(g.mesh(MAT.city),'houses');if(mesh){mesh.name='central_housing_repairs';W.scene.add(mesh);}const m=layTag(late.mesh(MAT.city),'houses');
  if(m){const G=new THREE.Group();G.name='preAureaHomes';G.userData.rise=0;G.visible=false;G.add(m);W.scene.add(G);(W.preLayers||(W.preLayers={})).preAureaHomes=G;}
  W.housingGapStats=stats;W.housingGapHomes=records;
}
// Shop houses along the main roads in the centre (the author, 2026-11-03: a main road runs between two rows of houses with shops on the ground floor).
// genBlocks lines the roads that cut its blocks (faceFrontage); here, before genCity and the repair grid fill the centre with houses turned to the city
// grid, each main road is walked on both sides and lined with lots whose front (L[0]->L[1], the shop bays) faces it, beyond the road's corridor and the
// eaves (w/2+3.6 from the centre line). A lot that hits something steps back 0.8-3.8 m or gets shallower (on a hillside too); one that still does not fit is
// left out (crossings, monuments, the noble houses' parcels). On the ground the fire and the Golden House take they go with the old streets (preLayer
// 'aureaSite', states 0-6). Widths and dice are keyed to the place.
function fillRoadFrontage(W){const g=new GB(1<<17),gl=new GB(1<<15),st={tried:0,built:0,roads:0,zone:0,hit:0,free:0,row:0,slope:0,fail:0};
  const zone=p=>housingCore(...p)&&dCity(...p)>=.36&&!palFilled(...p);
  const hits=(L,m,pick)=>{const F=W.foot,ob=lotOBB(L),r=Math.hypot(ob.hw,ob.hd)+m,cs=F.cell,P=pInset(L,-m)||L;   // lotHits, over the footprints pick() takes
    for(let i=Math.floor((ob.cx-r)/cs);i<=Math.floor((ob.cx+r)/cs);i++)for(let j=Math.floor((ob.cz-r)/cs);j<=Math.floor((ob.cz+r)/cs);j++)for(const f of F.map.get(F.key(i,j))||[]){
      if(!pick(f))continue;const dx=f.cx-ob.cx,dz=f.cz-ob.cz;if(dx*dx+dz*dz>(f.r+r)**2)continue;if(residentialOverlap(P,f.blkLot||f.poly||footBox(f)))return true;}return false;};
  for(const[w,pts]of W.roadList||[]){if(w<7)continue;const P=densify(pts,3),cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    const len=cum[cum.length-1],h=w/2+3.6;let i0=0;st.roads++;
    const at=s=>{while(i0>0&&cum[i0]>s)i0--;while(i0<P.length-2&&cum[i0+1]<s)i0++;return lp(P[i0],P[i0+1],Math.max(0,Math.min(1,(s-cum[i0])/((cum[i0+1]-cum[i0])||1))));};
    for(const sg of[1,-1]){let row=[],v2gap=false;const rows=[row];
      for(let s=4;s<len-8;){const sA=s,A=at(s),lw=10+4*hash2(A[0]*.37+sg*3.1,A[1]*.29),B=at(Math.min(len,s+lw));s+=lw;if(!housingCore(...A))continue;
        const dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz);if(l<6)continue;const nx=-dz/l*sg,nz=dx/l*sg,D=12+3*hash2(A[1]*.41,A[0]*.23+sg);
        if(W.v2At&&W.v2At((A[0]+B[0])/2+nx*(h+D/2),(A[1]+B[1])/2+nz*(h+D/2))){st.v2=(st.v2||0)+1;v2gap=true;continue;}   // ?city=v2: parcels.js lines this stretch
        st.tried++;let got=null,rec=null,why='zone';
        const R=RNG(hash2(Math.round(A[0]*2)+7717+sg,Math.round(A[1]*2)+311)*4294967296),profile={part:R()<.3?9:0,seed:R(),sty:3+(R()<.4?8:0),fl:2|16,nSt:3+Math.floor(R()*3),gH:3.9,sH:2.9,pitch:20*DEG,lit:.7,flat:false,noSplit:true,awn:.3,balc:.1};
        lot:for(const e of[0,.8,1.6,2.6,3.8])for(const d of[D,D*.75,D*.55]){const o0=h+e,o1=o0+d;let L=[[A[0]+nx*o0,A[1]+nz*o0],[B[0]+nx*o0,B[1]+nz*o0],[B[0]+nx*o1,B[1]+nz*o1],[A[0]+nx*o1,A[1]+nz*o1]];
          if(pArea(L)<0)L=[L[1],L[0],L[3],L[2]];if(!L.every(zone))break lot;
          if(hits(L,.6,f=>!f.preAurea)){why='hit';continue;}   // what the Golden House builds later (preAurea) is not there yet
          if(!housingFree(W,L)){why='free';continue;}
          if(row.slice(-2).some(([,Q])=>residentialOverlap(pInset(L,.5)||L,pInset(Q,.5)||Q))){why='row';continue;}   // the inside of a bend: the row's own lots fan in
          const gr=houseGround(W,L);if(!gr||gr.max-gr.min>6){why='slope';continue;}
          const c=pCen(L),G=AUREA_GONE(...c)||Math.hypot(c[0]-572,c[1]-200)<155||hits(L,0,f=>f.preAurea)?gl:g,k0=frontMark(W,G);
          if(lotBuild(W,G,L,profile,R,null)){got=L;rec={L,A,B,l,nx,nz,o0,o1,s0:sA,s1:Math.min(len,sA+lw),sg,G,k0,k1:frontMark(W,G),profile};break lot;}why='fail';}   // a lot the house will not fit (a steep side) tries the next
        if(!got){st[why]++;continue;}if(v2gap&&row.length){row=[];rows.push(row);}v2gap=false;row.push([lotOBB(got),got,rec]);st.built++;}
      for(const row of rows){for(const[ob,L,r]of row){r.foot=W.foot.add(ob.cx,ob.cz,ob.hw+.25,ob.hd+.25,ob.rot);r.foot.poly=L;}   // after the row: its lots touch, wall to wall
        if(row.length)(W.frontRows||(W.frontRows=[])).push({w,sg,lots:row.map(q=>q[2])});}}}
  W.frontGB={g,gl};W.roadFrontStats=st;return st;}   // the meshes are made by finishRoadFrontage, once the passages are cut
// What a house build leaves on the world besides its triangles: finishRoadFrontage replaces these entries when it rebuilds a house.
const FRONT_LOGS=[['lot',W=>W.lotLog||(W.lotLog=[])],['col',W=>W.cols.simple],['balc',W=>W.balcLog||(W.balcLog=[])],['rd',W=>W.rdLog||(W.rdLog=[])],['gal',W=>W.houseGalleryLog||(W.houseGalleryLog=[])]];
function frontMark(W,G){const m={nv:G.nv,ni:G.ni};for(const[k,f]of FRONT_LOGS)m[k]=f(W).length;return m;}
// Narrow passages through the shop rows (the author, 2026-11-04: where a lane meets the row of shop houses along a main road, a very narrow way should
// run on through the row to the road). Called once the blocks, genCity, the repair grid and the suburbs stand. Everything standing is drawn on a 1 m raster
// round the rows; each row's back is probed every .5 m, straight back and in six slanting directions: where the open ground runs on deep (>= 16 m and
// 12 m more than the yard behind the neighbours) in a run 1.2-12 m wide with the houses close again either side, a lane comes in there; one within 12 m
// of an opening is served by it. The row is opened at the party wall when one is within 3.5 m, else through the house, which is built again as two
// narrower ones (each >= 4.8 m) from the same profile; the passage is 2.2-3 m (the eaves take .55 m off each side seen from above). A row that still runs on for 40-56 m
// without an opening gets one at a party wall with open ground behind it (>= 2.5 m). Every other house stays exactly as it was. The passage is kept as
// road (nothing stands in it later), goes to W.laneLog for the street raster and is paved with tuff slabs (part 47). 【史】After the fire every building had to
// stand within its own walls, without party walls (Tacitus, Annals 15.43); the Twelve Tables already kept a gap (ambitus) of 2.5 feet between houses.
function finishRoadFrontage(W){const rows=W.frontRows||[],GB2=W.frontGB;if(!GB2)return null;const t0=performance.now();
  const st={rows:rows.length,lots:0,mouths:0,served:0,wall:0,split:0,rhythm:0,noRoom:0,rebuilt:0,lost:0,passages:0};
  // 1. what stands now (a footprint's own polygon where it has one, else its box; roads are open), 1 m cells
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const R of rows)for(const r of R.lots)for(const p of r.L){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
  const cuts=[],gp=new GB(1<<13),gpl=new GB(1<<11);W.passages=[];
  if(x0<x1){x0-=46;z0-=46;x1+=46;z1+=46;const nx=Math.ceil(x1-x0),nz=Math.ceil(z1-z0),solid=new Uint8Array(nx*nz);
    for(const f of W.foot.list){if(f.tag==='road'||f.cx+f.r<x0||f.cx-f.r>x1||f.cz+f.r<z0||f.cz-f.r>z1)continue;const P=f.blkLot||f.poly;
      const i0=Math.max(0,Math.floor(f.cx-f.r-x0)),i1=Math.min(nx-1,Math.floor(f.cx+f.r-x0)),j0=Math.max(0,Math.floor(f.cz-f.r-z0)),j1=Math.min(nz-1,Math.floor(f.cz+f.r-z0));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+i+.5,z=z0+j+.5,dx=x-f.cx,dz=z-f.cz;
        if(P?nobleInside(x,z,P):f.circ?dx*dx+dz*dz<=f.hw*f.hw:Math.abs(f.c*dx-f.s*dz)<=f.hw&&Math.abs(f.s*dx+f.c*dz)<=f.hd)solid[j*nx+i]=1;}}
    const solidAt=(x,z)=>{const i=Math.floor(x-x0),j=Math.floor(z-z0);return i>=0&&j>=0&&i<nx&&j<nz&&solid[j*nx+i]===1;};
    var free=(x,z,dx,dz,mx)=>{for(let t=.5;t<=mx;t+=.5)if(solidAt(x+dx*t,z+dz*t))return t-.5;return mx;};
    const TH=[0,-.26,.26,-.52,.52,-.79,.79];   // straight back, 15, 30 and 45 degrees to either side
    const sub=(P,c0,c1)=>{const out=[];for(const[a,b]of P){if(c1<=a||c0>=b){out.push([a,b]);continue;}if(c0>a)out.push([a,c0]);if(c1<b)out.push([c1,b]);}return out;};
    for(const R of rows){const lots=R.lots;st.lots+=lots.length;
      for(const r of lots){r.ux=(r.B[0]-r.A[0])/r.l;r.uz=(r.B[1]-r.A[1])/r.l;r.pieces=[[r.s0,r.s1]];}
      const front=s=>{let r=lots[0];for(const q of lots)if(s>=q.s0){r=q;}const t=(s-r.s0)*r.l/(r.s1-r.s0);return[r.A[0]+r.ux*t,r.A[1]+r.uz*t];};
      // 2. the back of the row every .5 m: G how far the ground stays open straight back, F the farthest of the seven directions
      const S=[];for(const r of lots){const sc=(r.s1-r.s0)/r.l;for(let t=.25;t<r.l;t+=.5){const bx=r.A[0]+r.ux*t+r.nx*(r.o1+.3),bz=r.A[1]+r.uz*t+r.nz*(r.o1+.3);let F=0;
        for(const a of TH){const c=Math.cos(a),s=Math.sin(a),f=free(bx,bz,r.nx*c-r.nz*s,r.nx*s+r.nz*c,42);if(f>F)F=f;}S.push({s:r.s0+t*sc,F,G:free(bx,bz,r.nx,r.nz,42)});}}
      S.sort((a,b)=>a.s-b.s);
      for(let i=0;i<S.length;i++){const g=[];for(let k=i;k>=0&&S[i].s-S[k].s<=12;k--)g.push(S[k].G);for(let k=i+1;k<S.length&&S[k].s-S[i].s<=12;k++)g.push(S[k].G);g.sort((a,b)=>a-b);S[i].deep=S[i].F>=Math.max(16,g[g.length>>1]+12);}
      const Gat=s=>{let b=null;for(const q of S)if(!b||Math.abs(q.s-s)<Math.abs(b.s-s))b=q;return b?b.G:0;};
      // a lane: a run of deep samples 1.2-12 m wide with the houses close again on both sides (2-5 m beyond it the ground runs out 8 m sooner), not a wide yard
      const mouths=[];for(let i=0;i<S.length;){if(!S[i].deep){i++;continue;}let k=i;while(k+1<S.length&&S[k+1].deep&&S[k+1].s-S[k].s<.8)k++;
        const sa=S[i].s,sb=S[k].s,wd=sb-sa+.5;let F=0;for(let q=i;q<=k;q++)F+=S[q].F;F/=k-i+1;let out=0;for(const q of S)if((q.s>=sa-5&&q.s<=sa-2)||(q.s>=sb+2&&q.s<=sb+5))out=Math.max(out,q.F);
        if(wd>=1.2&&wd<=12&&out<=F-8)mouths.push({s:(sa+sb)/2,F});i=k+1;}
      mouths.sort((a,b)=>b.F-a.F);st.mouths+=mouths.length;
      // 3. where to open: the row's ends and the gaps it already has count as openings
      const openings=()=>{const o=[lots[0].s0,lots[lots.length-1].s1];let prev=null;for(const r of lots)for(const p of r.pieces){if(prev!==null&&p[0]-prev>=1.2)o.push((p[0]+prev)/2);prev=p[1];}return o.sort((a,b)=>a-b);};
      const bounds=[];for(let k=1;k<lots.length;k++){const a=lots[k-1],b=lots[k];if(b.s0-a.s1<1.2)bounds.push((a.s1+b.s0)/2);}   // party walls
      const tryCut=(c0,c1)=>{const nw=[];for(const r of lots){const P=sub(r.pieces,c0,c1);if(P.length===r.pieces.length&&P.every((p,i)=>p[0]===r.pieces[i][0]&&p[1]===r.pieces[i][1]))continue;if(P.some(p=>p[1]-p[0]<4.8))return false;nw.push([r,P]);}
        if(!nw.length)return false;for(const[r,P]of nw)r.pieces=P;return true;};
      const place=(s,why)=>{const q=front(s),g=2.2+.8*hash2(Math.round(q[0]*2)+911,Math.round(q[1]*2)+3727),cand=[];
        for(const sb of bounds){const d=Math.abs(sb-s);if(d<=6){const k=d<=3.5?0:2;cand.push([d+k,sb-g/2,sb+g/2,'wall'],[d+k+.6,sb-g,sb,'wall'],[d+k+.6,sb,sb+g,'wall']);}}
        cand.push([4,s-g/2,s+g/2,'split']);cand.sort((a,b)=>a[0]-b[0]);
        for(const[,c0,c1,kind]of cand)if(tryCut(c0,c1)){cuts.push({R,c0,c1,why,kind});st[kind]++;return true;}st.noRoom++;return false;};
      for(const m of mouths){if(openings().some(o=>Math.abs(o-m.s)<12)){st.served++;continue;}place(m.s,'lane');}
      const Lmax=40+16*hash2(Math.round(front(lots[0].s0)[0])+R.sg*17,Math.round(front(lots[0].s0)[1])+5);
      for(let guard=0;guard<60;guard++){const o=openings();let more=false;
        for(let i=1;i<o.length;i++){if(o[i]-o[i-1]<=Lmax)continue;const mid=(o[i]+o[i-1])/2,span=o[i]-o[i-1];let best=null;
          for(const sb of bounds){if(Math.abs(sb-mid)>span/3)continue;const G=Gat(sb);if(G<2.5)continue;const sc=G-Math.abs(sb-mid)*.15;if(!best||sc>best.sc)best={sb,sc};}
          if(best&&place(best.sb,'rhythm')){st.rhythm++;more=true;break;}}
        if(!more)break;}}
    // 4. the opened houses are built again: the old triangles become degenerate, each piece is built from the same profile (the second with another
    //    seed), and the entries the old house left in the logs are replaced in place (the court reservations point into lotLog by index)
    const killed=[];for(const R of rows)for(const r of R.lots)if(!(r.pieces.length===1&&r.pieces[0][0]===r.s0&&r.pieces[0][1]===r.s1))killed.push(r);
    const N0={};for(const[k,f]of FRONT_LOGS)N0[k]=f(W).length;
    for(const r of killed){r.G.ix.fill(0,r.k0.ni,r.k1.ni);r.n0={};for(const[k,f]of FRONT_LOGS)r.n0[k]=f(W).length;let first=true;
      for(const[p0,p1]of r.pieces){const sc=r.l/(r.s1-r.s0),a=(p0-r.s0)*sc,b=(p1-r.s0)*sc,A=[r.A[0]+r.ux*a,r.A[1]+r.uz*a],B=[r.A[0]+r.ux*b,r.A[1]+r.uz*b];
        let L=[[A[0]+r.nx*r.o0,A[1]+r.nz*r.o0],[B[0]+r.nx*r.o0,B[1]+r.nz*r.o0],[B[0]+r.nx*r.o1,B[1]+r.nz*r.o1],[A[0]+r.nx*r.o1,A[1]+r.nz*r.o1]];if(pArea(L)<0)L=[L[1],L[0],L[3],L[2]];
        const c=pCen(L),Rp=RNG(hash2(Math.round(c[0]*2)+7717+r.sg,Math.round(c[1]*2)+311)*4294967296),prof=Object.assign({},r.profile,first?null:{seed:(r.profile.seed+.37)%1});
        const ok=lotBuild(W,r.G,L,prof,Rp,null);(r.stood||(r.stood=[])).push(ok);
        if(ok){st.rebuilt++;const ob=lotOBB(L),hw=ob.hw+.25,hd=ob.hd+.25;
          if(first){Object.assign(r.foot,{cx:ob.cx,cz:ob.cz,hw,hd,c:Math.cos(ob.rot),s:Math.sin(ob.rot),r:Math.hypot(hw,hd),poly:L});first=false;}else W.foot.add(ob.cx,ob.cz,hw,hd,ob.rot).poly=L;}
        else st.lost++;}
      if(first)Object.assign(r.foot,{cx:-1e6,cz:-1e6,hw:0,hd:0,r:0,poly:null,tag:'road'});   // no piece stood: the footprint goes
      r.n1={};for(const[k,f]of FRONT_LOGS)r.n1[k]=f(W).length;}
    for(const[k,f]of FRONT_LOGS){const arr=f(W),tail=arr.splice(N0[k]),ks=killed.slice().sort((a,b)=>b.k0[k]-a.k0[k]);
      for(const r of ks){const add=tail.slice(r.n0[k]-N0[k],r.n1[k]-N0[k]),del=r.k1[k]-r.k0[k];arr.splice(r.k0[k],del,...add);
        if(k==='lot'&&add.length!==del)for(const q of W.residentialReservations||[])if(q.afterLot>r.k0[k])q.afterLot+=add.length-del;}}
    // 5. the passages: a thin road reservation down the middle (props, squares and trees keep out; the eaves either side do not touch it), a lane for
    //    the street raster, tuff slabs on the ground from the shop fronts to the yard behind
    for(const c of cuts){const R=c.R,s=(c.c0+c.c1)/2,g=c.c1-c.c0;let r=R.lots[0];for(const q of R.lots)if(s>=q.s0)r=q;
      const inv=R.lots.filter(q=>q.s1>c.c0-.5&&q.s0<c.c1+.5),of=Math.min(...inv.map(q=>q.o0))-.4,o1=Math.max(...inv.map(q=>q.o1)),t=(s-r.s0)*r.l/(r.s1-r.s0),C=[r.A[0]+r.ux*t,r.A[1]+r.uz*t],
        ob=o1+.3+free(C[0]+r.nx*(o1+.3),C[1]+r.nz*(o1+.3),r.nx,r.nz,4),q=(u,v)=>[C[0]+r.ux*u+r.nx*v,C[1]+r.uz*u+r.nz*v],mid=q(0,(of+ob)/2);
      W.foot.add(mid[0],mid[1],Math.max(.1,g/2-.6),(ob-of)/2,Math.atan2(-r.uz,r.ux),'road').passage=true;
      (W.laneLog||(W.laneLog=[])).push([q(-g/2,of),q(g/2,of),q(g/2,ob),q(-g/2,ob)]);
      const G=AUREA_GONE(...mid)?gpl:gp,wd=g/2-.12,n=Math.max(1,Math.round((ob-of)/2)),pt=(u,v)=>{const p=q(u,v);return[p[0],W.gy(p[0],p[1])+.06,p[1]];};
      G.set(47,hash2(Math.round(mid[0]),Math.round(mid[1])));   // grey-yellow tuff, rows of 1.2 x .6 m slabs across the way (the pale part 22 read as white boards from the 14 m camera)
      for(let k=0;k<n;k++){const v0=of+(ob-of)*k/n,v1=of+(ob-of)*(k+1)/n;G.poly([pt(-wd,v0),pt(wd,v0),pt(wd,v1),pt(-wd,v1)],[0,1,0],[[-wd,v0],[wd,v0],[wd,v1],[-wd,v1]]);}
      W.passages.push({x:mid[0],z:mid[1],w:+g.toFixed(2),len:+(ob-of).toFixed(1),why:c.why,kind:c.kind,ux:r.ux,uz:r.uz,nx:r.nx,nz:r.nz,front:q(0,of),back:q(0,ob)});}}
  const m=layTag(GB2.g.mesh(MAT.city),'houses');if(m){m.name='road_frontage';W.scene.add(m);}const ml=layTag(GB2.gl.mesh(MAT.city),'houses');if(ml){ml.name='road_frontage_pre';preLayerGroup(W,'aureaSite').add(ml);}
  const mp=layTag(gp.mesh(MAT.city),'roadDetail');if(mp){mp.name='frontage_passages';W.scene.add(mp);}const mpl=layTag(gpl.mesh(MAT.city),'roadDetail');if(mpl){mpl.name='frontage_passages_pre';preLayerGroup(W,'aureaSite').add(mpl);}
  st.passages=cuts.length;st.ms=Math.round(performance.now()-t0);W.frontPassStats=st;console.log('frontage passages',JSON.stringify(st));return st;}

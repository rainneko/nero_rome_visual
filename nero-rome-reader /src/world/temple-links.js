/* ================= TEMPLE LINKS (author, 2026-10-27): every temple reaches an ordinary street from its front or the sides of its podium =================
   Runs after the street raster (buildStreets). From the foot of the front stair and the middle of each long side it walks out over the temple's own
   precinct (at the temple's level) and open ground, never down a slope steeper than 36 %. The temple is linked when that walk reaches a street of the
   city's network (a street patch a main road runs through) or a hill stair, within 45 m off the streets. A temple that is not linked gets a stair down
   the hill: from the edge of its precinct (where the ground falls away) down to the nearest street below from which one walks on to the network, in
   flights of at most 30 % that turn at landings (hillRoute), built like the Centum Gradus (hillStair). On the Palatine the stair lands on each garden
   terrace it crosses and runs down in front of its wall. W.templeLinks logs every temple: linked / stair / raised / none, and why. */

// a stair that follows the hill along a hillRoute R: flights between landings, turning at each landing, never one straight run.
// (briefs/rome/podium-stairs-rock.md E, 2026-11-04) E2: a landing at most every 15 steps, the flights equal (stairRun), and a parapet on the open sides of a turning landing where the
// ground falls away; E1: where the hill is steeper than 52 % the steps are cut in the rock: treads of the hill's rock (part 61), rock on both sides, no walls.
function hillStair(W,R,w,top){const gy=W.gy,H=stairGround(W),ix=stairLandings(W,R),gS=new GB(1<<15);let yT=top??H(R[0][0],R[0][1]);const y0=yT,st={steps:0,landings:0,rock:0,parapets:0};
  const slope=(x,z)=>Math.hypot(gy(x+2,z)-gy(x-2,z),gy(x,z+2)-gy(x,z-2))/4;
  for(let l=0;l<ix.length-1;l++){const A=R[ix[l]],B=R[ix[l+1]],Ls=Math.hypot(B[0]-A[0],B[1]-A[1]);if(Ls<3)continue;const yB=H(B[0],B[1]),dh=yT-yB;if(dh<.5){yT=Math.min(yT,yB);continue;}
    const F=frame(A[0],0,A[1],Math.atan2(-(B[1]-A[1]),B[0]-A[0])),o0=stairEdge(W,H,A,B,Ls,yT),run=stairRun(Ls-o0,dh),pal=hillPal(A[0],A[1]),rks=[],stS=(pt,sd,fl)=>pal===1?gS.set(60,sd,1,fl):gS.set(pt,sd);   // M6 (palatine-masterplan.md, H0): on the Palatine the treads travertine, the cheeks the wall's ashlar, the bases rusticated
    if(o0>0){const q=F.p(o0/2,0,0),gb=Math.min(gy(q[0],q[2]),yT)-2.5;stS(6,.4,2);box(gS,F,o0/2,gb,0,o0/2+.02,yT-gb,w/2,31);stS(6,.55,0);for(const sd of[1,-1])box(gS,F,o0/2,gb,sd*(w/2+.3),o0/2+.02,yT-gb+.9,.3,31);
      trimSet(gS,pal,.5);for(const sd of[1,-1])box(gS,F,o0/2,yT+.9,sd*(w/2+.3),o0/2+.06,.12,.36,31);st.landings++;}   // podium p3: the landing out to the terrace's edge, where the steps begin
    for(const p of run.P){const s2=o0+p.s+p.len/2,yS=yT-p.i*run.rise-(p.land?0:run.rise),q=F.p(s2,0,0),gb=Math.min(gy(q[0],q[2]),yS)-2.5;
      if(p.land){stS(6,.4,2);box(gS,F,s2,gb,0,p.len/2+.02,yS-gb,w/2,31);stS(6,.55,0);for(const sd of[1,-1])box(gS,F,s2,gb,sd*(w/2+.3),p.len/2+.02,yS-gb+.9,.3,31);
        trimSet(gS,pal,.5);for(const sd of[1,-1])box(gS,F,s2,yS+.9,sd*(w/2+.3),p.len/2+.06,.12,.36,31);st.landings++;continue;}   // E2: a landing between two flights, its cheeks a little higher
      const ql=F.p(s2,0,w/2+1),qr=F.p(s2,0,-w/2-1),rk=Math.max(slope(q[0],q[2]),slope(ql[0],ql[2]),slope(qr[0],qr[2]))>.52;st.steps++;
      if(rk){gS.set(61,.35+.3*teH(q[0],q[2],70),pal,0);box(gS,F,s2,gb,0,p.len/2+.02,yS-gb,w/2,31);st.rock++;rks.push({s0:o0+p.s,s1:o0+p.s+p.len,y:yS});continue;}   // E1: cut in the rock (the banks on both sides below)
      stS(6,.4,2);box(gS,F,s2,gb,0,p.len/2+.02,yS-gb,w/2,31);stS(6,.55,0);for(const sd of[1,-1])box(gS,F,s2,gb,sd*(w/2+.3),p.len/2+.02,yS-gb+.75,.3,31);   // pale treads between low pale cheek walls
      if(p.i%3===0){stS(2,.6,2);for(const sd of[1,-1])box(gS,F,s2,yS+.7,sd*(w/2+.3),p.len*1.5+.02,.14,.4,31);}}   // coping
    // E1: the rock left standing on both sides of the cut steps, in banks about 2.4 m long that follow the slope of the flight, sheer on the stair side
    for(let i=0;i<rks.length;){let j=i;while(j+1<rks.length&&rks[j+1].s0-rks[j].s1<.05&&rks[j].s1-rks[i].s0<2.2)j++;const a0=rks[i],b0=rks[j];
      for(const sd of[1,-1])rockBank(gS,F,a0.s0-.04,b0.s1+.04,a0.y,b0.y,sd,w,pal);i=j+1;}
    if(l<ix.length-2){const FL=frame(B[0],0,B[1],F.rot),hw=w/2+.9,gb=Math.min(gy(B[0],B[1]),yB)-2.5;stS(6,.4,1);box(gS,FL,0,gb,0,hw,yB-gb,hw,31);stS(2,.45,2);box(gS,FL,0,yB,0,w/2+1.1,.3,w/2+1.1,31);
      // E2: the turning landing's parapet, on each side that is neither where the flights come in (-x) and go out, where the ground outside is 0.6 m or more below
      const C2=R[ix[l+2]],el=Math.hypot(C2[0]-B[0],C2[1]-B[1])||1,lx=((C2[0]-B[0])*FL.c-(C2[1]-B[1])*FL.s)/el,lz=((C2[0]-B[0])*FL.s+(C2[1]-B[1])*FL.c)/el,ex=Math.abs(lx)>Math.abs(lz)?(lx>0?0:-1):(lz>0?1:2);
      for(const[f,nx,nz]of[[0,1,0],[1,0,1],[2,0,-1]]){if(f===ex)continue;const o=FL.p(nx*(hw+1),0,nz*(hw+1));if(yB+.3-gy(o[0],o[2])<.6)continue;const px=nx*(hw-.15),pz=nz*(hw-.15),ax=nx?.15:hw,az=nx?hw:.15;
        gS.set(60,.5,pal,0);box(gS,FL,px,yB+.3,pz,ax,.9,az,31);trimSet(gS,pal,.5);box(gS,FL,px,yB+1.2,pz,ax+.04,.1,az+.06,31);st.parapets++;}}
    yT=yB;}
  for(let i=1;i<R.length-1;i+=4){const A=R[i],B=R[i+1],ux=B[0]-A[0],uz=B[1]-A[1],l=Math.hypot(ux,uz)||1,sd=(i>>2)%2?1:-1,off=w/2+2.2+((i*7)%3)*.5;   // cypresses and umbrella pines along both sides: a garden stair, not a cut
    const tx=A[0]-uz/l*off*sd,tz=A[1]+ux/l*off*sd;if(!W.foot.hits(tx,tz,1,1,0,0))W.trees.push([tx,gy(tx,tz),tz,((i>>2)%3)?'cyp':'pine',.8+((i*13)%5)*.07]);}
  {const A=R[R.length-2],B=R[R.length-1],l=Math.hypot(B[0]-A[0],B[1]-A[1])||1;(W.stairFeet=W.stairFeet||[]).push({x:B[0],z:B[1],dx:(B[0]-A[0])/l,dz:(B[1]-A[1])/l});}
  const m=layTag(gS.mesh(MAT.city),'stairs');if(m)W.scene.add(m);for(let i=0;i<R.length;i+=2)W.foot.addCircle(R[i][0],R[i][1],w/2+1.5,'road');
  (W.hillStairs||(W.hillStairs=[])).push(Object.assign({R,w,top:y0},st));return m;}
// E1: a bank of rock beside cut steps, from sa to sb along flight frame F (local x = walking direction, z = left), on side sd of a stair w wide; its top 0.5-1 m
// above the treads ya..yb, its stair face sheer, its outer face falling away; corners jittered by a die keyed to the place
function rockBank(g,F,sa,sb,ya,yb,sd,w,pal){const c=F.p((sa+sb)/2,0,sd*(w/2+.5)),j=k=>teH(c[0],c[2],80+k),y0=Math.min(ya,yb)-2.5,ha=ya+.5+.5*j(0),hb=yb+.5+.5*j(1),zi=sd*(w/2+.02),zo=sd*(w/2+.85+.3*j(2)),zt=sd*(w/2+.5+.15*j(3));
  const P=(x,y,z)=>F.p(x,y,z),B=[P(sa,y0,zi),P(sb,y0,zi),P(sb,y0,zo),P(sa,y0,zo)],T=[P(sa,ha,zi),P(sb,hb,zi),P(sb,hb+.12*j(4),zt),P(sa,ha+.12*j(5),zt)];g.set(61,.3+.4*j(6),pal,0);
  g.poly([B[0],B[1],T[1],T[0]],F.d(0,0,-sd));g.poly([B[3],B[2],T[2],T[3]],F.d(0,.6,sd));g.poly([T[0],T[1],T[2],T[3]],[0,1,0]);g.poly([B[0],B[3],T[3],T[0]],F.d(-1,0,0));g.poly([B[1],B[2],T[2],T[1]],F.d(1,0,0));}
// E2: one flight of a hill stair, Ls long and dh high: risers of about 0.19 m, a landing (0.9-1.5 m) at most every 15 steps, the flights equal; P: the steps and landings along the run
// (i: the number of steps before it), the same for hillStair and hillStairHeights
function stairRun(Ls,dh){const n=Math.max(3,Math.round(dh/.19));let m=Math.max(1,Math.ceil(n/15)),Lw=m>1?Math.max(.9,Math.min(1.5,(Ls-n*.32)/(m-1))):0;if(m>1&&(Ls-(m-1)*Lw)/n<.28){m=1;Lw=0;}
  const tr=(Ls-(m-1)*Lw)/n,P=[];let s=0,i=0;for(let f=0;f<m;f++){const k=Math.round(n*(f+1)/m)-Math.round(n*f/m);for(let j=0;j<k;j++){P.push({s,len:tr,i:i++});s+=tr;}if(f<m-1){P.push({s,len:Lw,i,land:true});s+=Lw;}}
  return{n,P,rise:dh/n};}
// podium p3 (2026-11-08): where a flight leaves the floor of a Palatine garden terrace (stairGround above the terrain), the distance along it to the floor's edge,
// plus 0.5 m: the steps begin there, not at the landing point up to 2 m inside the edge (they went down under the floor and met the wall's parapet). 0 elsewhere.
function stairEdge(W,H,A,B,Ls,yT){if(H(A[0],A[1])<W.gy(A[0],A[1])+.5)return 0;const ux=(B[0]-A[0])/Ls,uz=(B[1]-A[1])/Ls;let s=0;
  while(s<Ls-3&&H(A[0]+ux*(s+.25),A[1]+uz*(s+.25))>yT-.3)s+=.25;return s>0?Math.min(s+.5,Ls-3):0;}
// what a hill stair stands on: the terrain, or the floor of a Palatine garden terrace where one lies over it (palatine.js palTerraces, 1.25 m raster)
function stairGround(W){if(W.stairGround)return W.stairGround;const gy=W.gy,T=W.foot.list.filter(f=>f.palTer!=null),PP=W.palPlats||[];if(!T.length&&!PP.length)return W.stairGround=gy;
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const f of T){x0=Math.min(x0,f.cx-f.r);z0=Math.min(z0,f.cz-f.r);x1=Math.max(x1,f.cx+f.r);z1=Math.max(z1,f.cz+f.r);}
  for(const P of PP)for(const q of P.W){x0=Math.min(x0,q[0]-2);z0=Math.min(z0,q[1]-2);x1=Math.max(x1,q[0]+2);z1=Math.max(z1,q[1]+2);}   // H1: the closed terraces (palatine-h1.js), world outlines P.W
  const cs=1.25,nx=Math.ceil((x1-x0)/cs),nz=Math.ceil((z1-z0)/cs),Y=new Float32Array(nx*nz).fill(-1e9);
  for(const f of T)for(let j=Math.max(0,Math.floor((f.cz-f.r-z0)/cs));j<=Math.min(nz-1,Math.floor((f.cz+f.r-z0)/cs));j++)for(let i=Math.max(0,Math.floor((f.cx-f.r-x0)/cs));i<=Math.min(nx-1,Math.floor((f.cx+f.r-x0)/cs));i++){
    const dx=x0+(i+.5)*cs-f.cx,dz=z0+(j+.5)*cs-f.cz;if(Math.abs(f.c*dx-f.s*dz)<=f.hw-1&&Math.abs(f.s*dx+f.c*dz)<=f.hd-1)Y[j*nx+i]=Math.max(Y[j*nx+i],f.palTer);}   // the foot rect less its 1 m margin
  for(const P of PP){let px0=1e9,pz0=1e9,px1=-1e9,pz1=-1e9;for(const q of P.W){px0=Math.min(px0,q[0]);pz0=Math.min(pz0,q[1]);px1=Math.max(px1,q[0]);pz1=Math.max(pz1,q[1]);}
    for(let j=Math.max(0,Math.floor((pz0-z0)/cs));j<=Math.min(nz-1,Math.floor((pz1-z0)/cs));j++)for(let i=Math.max(0,Math.floor((px0-x0)/cs));i<=Math.min(nx-1,Math.floor((px1-x0)/cs));i++){
      const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs;if(!inPolyXZ(x,z,P.W)||nearPoly(x,z,[...P.W,P.W[0]],1))continue;Y[j*nx+i]=Math.max(Y[j*nx+i],P.y);}}   // the outline less 1 m
  return W.stairGround=(x,z)=>{const g=gy(x,z),i=Math.floor((x-x0)/cs),j=Math.floor((z-z0)/cs);return i<0||j<0||i>=nx||j>=nz?g:Math.max(g,Y[j*nx+i]);};}
// the landings of a hill stair: the ends, the turns, and the edge of a terrace where the route steps off it (the next flight runs down in front of its wall)
function stairLandings(W,R){const H=stairGround(W),L=new Set([0,...R.corners,R.length-1]),h=R.map(p=>H(p[0],p[1]));
  for(let i=1;i<R.length-1;i++)if(h[i]-h[i+1]>1.5||h[i]-h[i-1]>1.5)L.add(i);return[...L].sort((a,b)=>a-b);}

// the network: street cells whose patch a main road runs through; and the cells along hill stairs and the Clivus Palatinus, with the height of the tread there
// reach(k): from street cell k one walks on to the network (its own patch is in it, or a walk of TL_OFF from it gets there; kept per patch)
function templeNet(W){const S=W.street,{nx,nz,grd,road}=S,net=new Uint8Array(nx*nz),stair=new Uint8Array(nx*nz),stairY=new Float32Array(nx*nz),cid=new Int32Array(nx*nz).fill(-1);let nc=0;
  stComps(grd,nx,nz,c=>{let r=false;for(const k of c){cid[k]=nc;if(road[k])r=true;}if(r)for(const k of c)net[k]=1;nc++;});const memo=new Map(),N={net,stair,stairY};
  N.reach=(k,x,z)=>{if(net[k])return true;const c=cid[k];if(c<0)return false;if(!memo.has(c))memo.set(c,!!tlWalk(W,N,x,z,TL_OFF+160,[{k:'end',x,z}],()=>false,0,false));return memo.get(c);};
  for(const h of W.hillStairs||[])templeMark(S,N,h.R,h.w/2+1.5,hillStairHeights(W,h.R,h.top));if(W.palClivus)templeMark(S,N,W.palClivus,3,W.palClivus.map(p=>W.gy(p[0],p[1])));return N;}
// the tread height at each point of a hill stair (the flights of hillStair: straight from landing to landing)
function hillStairHeights(W,R,top){const H=stairGround(W),ix=stairLandings(W,R),Y=new Array(R.length).fill(top);let yT=top;
  for(let l=0;l<ix.length-1;l++){const A=R[ix[l]],B=R[ix[l+1]],Ls=Math.hypot(B[0]-A[0],B[1]-A[1]);if(Ls<3){for(let i=ix[l];i<=ix[l+1];i++)Y[i]=yT;continue;}const yB=H(B[0],B[1]),dh=yT-yB;
    if(dh<.5){for(let i=ix[l];i<=ix[l+1];i++)Y[i]=yT;yT=Math.min(yT,yB);continue;}const o0=stairEdge(W,H,A,B,Ls,yT),run=stairRun(Ls-o0,dh);let d=0;
    for(let i=ix[l];i<=ix[l+1];i++){if(i>ix[l])d+=Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]);const sd=Math.min(Ls-o0,Math.max(0,d-o0));let y=yT;for(const p of run.P){if(p.s>sd)break;y=yT-p.i*run.rise-(p.land?0:run.rise);}Y[i]=y;}yT=yB;}
  return Y;}
function templeMark(S,N,R,r,Y){const{x0,z0,cs,nx,nz}=S;
  for(let p=0;p<R.length-1;p++){const a=R[p],b=R[p+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/(cs*.5)));
    for(let s=0;s<=n;s++){const x=a[0]+(b[0]-a[0])*s/n,z=a[1]+(b[1]-a[1])*s/n,y=Y[p]+(Y[p+1]-Y[p])*s/n;
      for(let j=Math.max(0,Math.floor((z-r-z0)/cs));j<=Math.min(nz-1,Math.floor((z+r-z0)/cs));j++)for(let i=Math.max(0,Math.floor((x-r-x0)/cs));i<=Math.min(nx-1,Math.floor((x+r-x0)/cs));i++)
        if(Math.hypot(x0+(i+.5)*cs-x,z0+(j+.5)*cs-z)<=r){const k=j*nx+i;N.stair[k]=1;N.stairY[k]=y;}}}}
// where one goes in or out: the foot of the front stair and the middle of each long side; d points away from the temple
function templeFeet(t){const s=Math.sin(t.rot),c=Math.cos(t.rot),fd=t.L/2+(t.stairs?(t.run!=null?t.run:Math.max(4,Math.round(t.podH/.3))*.4):0)+1.5,sd=t.W/2+2;   // t.run: the stair's length as temple() built it
  return[{k:'front',x:t.x+s*fd,z:t.z+c*fd,dx:s,dz:c},{k:'left',x:t.x-c*sd,z:t.z+s*sd,dx:-c,dz:s},{k:'right',x:t.x+c*sd,z:t.z-s*sd,dx:c,dz:-s}];}
// the temple's own ground: the footprints that hold its centre (the temple, its precinct, the terrace or forum it stands in); on it one walks at the temple's floor
function templeOwn(W,t){const inF=(f,x,z,m)=>{const dx=x-f.cx,dz=z-f.cz;if(f.circ)return Math.hypot(dx,dz)<=f.hw+m;const u=f.c*dx-f.s*dz,v=f.s*dx+f.c*dz;return Math.abs(u)<=f.hw+m&&Math.abs(v)<=f.hd+m;},
    E=W.foot.list.filter(f=>f.tag!=='road'&&f.tag!=='open'&&f.tag!=='court'&&!f.poly&&f.r<400&&inF(f,t.x,t.z,1)),r0=Math.hypot(t.W/2,t.L/2)+3;
  return(x,z)=>Math.hypot(x-t.x,z-t.z)<r0||E.some(f=>inF(f,x,z,.8));}
const TL_OFF=45,TL_STEP=.36,TL_DOOR=2.5;   // 45 m off the streets at most; walkable up to 36 %; the step between the precinct floor and the ground outside it
// the walk out (Dijkstra on the street raster, within Rr of (x,z)): the cheapest reach of the network from any seed, or null; own ground is walked at
// height y0; stairs: a hill stair counts as arrival
const templeWalk=(W,t,N,own)=>tlWalk(W,N,t.x,t.z,Math.hypot(t.W/2,t.L/2)+TL_OFF+160,templeFeet(t),own,t.y,true);
function tlWalk(W,N,x,z,Rr,seeds,own,y0,stairs){const S=W.street,{x0,z0,cs,nx,nz,grd,solid,water}=S,gy=W.gy,
    i0=Math.max(0,Math.floor((x-Rr-x0)/cs)),i1=Math.min(nx-1,Math.floor((x+Rr-x0)/cs)),j0=Math.max(0,Math.floor((z-Rr-z0)/cs)),j1=Math.min(nz-1,Math.floor((z+Rr-z0)/cs)),w=i1-i0+1,h=j1-j0+1;
  if(w<1||h<1)return null;const D=new Float64Array(w*h).fill(1e9),Hc=new Float32Array(w*h).fill(NaN),Fl=new Int8Array(w*h).fill(-1),O=new Int8Array(w*h),Q=[];
  const cx=q=>x0+(q%w+i0+.5)*cs,cz=q=>z0+(Math.floor(q/w)+j0+.5)*cs,K=q=>(Math.floor(q/w)+j0)*nx+(q%w+i0);
  const floor=q=>{if(Fl[q]<0)Fl[q]=solid[K(q)]&&own(cx(q),cz(q))?1:0;return Fl[q];},   // a building cell of the own ground: the precinct floor, at the temple's level
    PF=W.palFloorY,Py=PF?new Float32Array(w*h).fill(NaN):null,pf=q=>{if(!Py)return null;if(Number.isNaN(Py[q])){const y=PF(cx(q),cz(q));Py[q]=y==null?-1e9:y;}return Py[q]>-1e8?Py[q]:null;},   // the Palatine's terrace floors (H1): walked at their level, their reserved ground is solid in the raster
    ht=q=>{if(floor(q))return y0;const p=pf(q);if(p!=null)return p;if(Number.isNaN(Hc[q]))Hc[q]=gy(cx(q),cz(q));return Hc[q];},pass=q=>{const k=K(q);return!water[k]&&(!solid[k]||floor(q)||pf(q)!=null);};
  const push=(q,d)=>{Q.push([d,q]);let i=Q.length-1;while(i>0){const p=(i-1)>>1;if(Q[p][0]<=Q[i][0])break;[Q[p],Q[i]]=[Q[i],Q[p]];i=p;}},
    pop=()=>{const top=Q[0],last=Q.pop();if(Q.length){Q[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<Q.length&&Q[l][0]<Q[m][0])m=l;if(r<Q.length&&Q[r][0]<Q[m][0])m=r;if(m===i)break;[Q[m],Q[i]]=[Q[i],Q[m]];i=m;}}return top;};
  seeds.forEach((f,o)=>{const i=Math.floor((f.x-x0)/cs)-i0,j=Math.floor((f.z-z0)/cs)-j0;if(i<0||j<0||i>=w||j>=h)return;const q=j*w+i;if(D[q]>0){D[q]=0;O[q]=o;push(q,0);}});
  const NB=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]],hit=(via,q,d)=>({via,from:seeds[O[q]].k,off:Math.round(d),at:[Math.round(cx(q)),Math.round(cz(q))]});
  while(Q.length){const[d,q]=pop();if(d>D[q])continue;const k=K(q);if(grd[k]&&N.net[k])return hit('street',q,d);
    const qi=q%w,qj=Math.floor(q/w),hq=ht(q);
    for(const[a,b,l]of NB){const ii=qi+a,jj=qj+b;if(ii<0||jj<0||ii>=w||jj>=h)continue;const n=jj*w+ii,kn=K(n);
      if(stairs&&N.stair[kn]&&(Math.abs(N.stairY[kn]-hq)<=1.5||own(cx(n),cz(n))))return hit('stair',q,d);   // onto a hill stair at the height of its tread, or one that starts on the own ground (Apollo's)
      if(!pass(n))continue;const st=l*cs,dy=Math.abs(ht(n)-hq);if(dy>(floor(n)!==floor(q)?TL_DOOR:TL_STEP*st))continue;
      const nd=d+(floor(n)?0:grd[kn]?.3:1)*st;if(nd>TL_OFF||nd>=D[n]-1e-6)continue;D[n]=nd;O[n]=O[q];push(n,nd);}}   // the own precinct is free to cross; streets of other patches nearly so
  return null;}
// a stair for a temple that is not linked: tried from each foot (front first), off the edge of its own ground, to the nearest streets below that reach the network
function templeStairPlan(W,t,N,own){const S=W.street,{x0,z0,cs,nx,nz,grd,solid,water}=S,gy=W.gy,wS=3.6;
  const cell=(x,z)=>{const i=Math.floor((x-x0)/cs),j=Math.floor((z-z0)/cs);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i;};
  const route=(a,b,half)=>hillRoute(W,a,b,{lim:.3,half,step:2}),join=(A,B)=>{const P=A.slice(0,-1).concat(B);P.corners=[...A.corners,A.length-1,...B.corners.map(c=>c+A.length-1)];return P;};
  let best=null,tries=0;const why={};
  for(const f of templeFeet(t))for(const a of[0,.6,-.6]){if(tries>=60)break;const dx=f.dx*Math.cos(a)-f.dz*Math.sin(a),dz=f.dx*Math.sin(a)+f.dz*Math.cos(a);
    // the edge: walk out over the own ground; where the ground beyond is at the temple's level, on to where it falls away (the stair starts there, at the
    // floor); where the precinct stands on a substructure over the slope, the stair starts at the foot of the substructure (its own stairs are inside)
    let E=null,top=t.y;for(let s=0;s<=90;s++){const x=f.x+dx*s,z=f.z+dz*s,k=cell(x,z);if(k<0||water[k])break;if(own(x,z))continue;if(solid[k])break;const g=gy(x,z);
      if(g<t.y-1.5){const px=x-dx,pz=z-dz;if(!own(px,pz)){E=[px,pz];top=t.y;}else{E=[x,z];top=g;}break;}}
    if(!E){why.noEdge=(why.noEdge||0)+1;continue;}const TR=260,T=[];
    for(let j=Math.max(0,Math.floor((E[1]-TR-z0)/cs));j<=Math.min(nz-1,Math.floor((E[1]+TR-z0)/cs));j++)for(let i=Math.max(0,Math.floor((E[0]-TR-x0)/cs));i<=Math.min(nx-1,Math.floor((E[0]+TR-x0)/cs));i++){
      const k=j*nx+i;if(!grd[k])continue;const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs,d=Math.hypot(x-E[0],z-E[1]);if(d>TR||d<8||own(x,z)||gy(x,z)>top-3||!N.reach(k,x,z))continue;T.push([d,x,z]);}
    T.sort((p,q)=>p[0]-q[0]);const pick=[];for(const p of T){if(pick.length>=6)break;if(pick.every(q=>Math.hypot(q[1]-p[1],q[2]-p[2])>18))pick.push(p);}
    if(!pick.length)why.noTarget=(why.noTarget||0)+1;
    for(const[d,x,z]of pick)for(const half of[16,10]){if(++tries>60)break;let P=templeStairCut(S,route(E,[x,z],half),cell,own,N,wS);
      if(P.fail==='building'){const[bx,bz]=P.at,ux=x-E[0],uz=z-E[1],l=Math.hypot(ux,uz)||1;   // a house or a fountain in the way: round it, with a landing beside it
        for(const o of[10,-10,18,-18]){const V=[bx-uz/l*o,bz+ux/l*o];if(Math.hypot(V[0]-E[0],V[1]-E[1])<6)continue;const P2=templeStairCut(S,join(route(E,V,half),route(V,[x,z],half)),cell,own,N,wS);if(P2.R){P=P2;break;}}}
      if(!P.R){why[P.fail]=(why[P.fail]||0)+1;if(P.at&&!why.at)why.at=P.at.map(Math.round).join('/');continue;}
      const Y=hillStairHeights(W,P.R,top),ix=[0,...P.R.corners,P.R.length-1];let steep=false;   // no flight steeper than 60 %
      for(let l=0;l<ix.length-1;l++){const A=P.R[ix[l]],B=P.R[ix[l+1]],Ls=Math.hypot(B[0]-A[0],B[1]-A[1]);if(Ls>=3&&(Y[ix[l]]-Y[ix[l+1]])/Ls>.6)steep=true;}if(steep){why.steep=(why.steep||0)+1;continue;}
      const len=P.len,score=len+(f.k==='front'?0:25);if(len>d*3+40){why.long=(why.long||0)+1;continue;}
      if(!best||score<best.score)best={R:P.R,len:Math.round(len),drop:+(top-gy(...P.R[P.R.length-1])).toFixed(1),from:f.k,top,score};}}
  return best||{why:Object.entries(why).map(([k,v])=>k+' '+v).join(', ')||'none'};}
// the route up to the first street it reaches off the own ground from which one walks on to the network, or why not: a building, water, the edge of the raster
function templeStairCut(S,R,cell,own,N,wS){let len=0;
  for(let i=1;i<R.length;i++){const[x,z]=R[i],k=cell(x,z);len+=Math.hypot(x-R[i-1][0],z-R[i-1][1]);if(k<0)return{fail:'off'};if(S.water[k])return{fail:'water'};if(own(x,z))continue;
    if(i>2&&S.grd[k]&&N.reach(k,x,z)){const P=R.slice(0,i+1);P.corners=R.corners.filter(c=>c>0&&c<i);return{R:P,len};}
    const ux=x-R[i-1][0],uz=z-R[i-1][1],l=Math.hypot(ux,uz)||1,near=i>=R.length-4;   // the last few metres may squeeze between the houses
    for(const sd of near?[0]:[0,1,-1]){const kk=cell(x-uz/l*sd*(wS/2+.6),z+ux/l*sd*(wS/2+.6));if(kk<0||S.solid[kk])return{fail:'building',at:[x,z]};}}
  return{fail:'unreached'};}
function templeLinks(W){if(!W.street||!W.temples)return;const N=templeNet(W),log=W.templeLinks=[];
  const name=t=>{if(t.name)return t.name;let b='',bd=50;for(const p of W.pois||[]){const d=Math.hypot(p.x-t.x,p.z-t.z);if(d<bd){bd=d;b=p.n;}}return b;};
  const list=W.temples.filter(t=>t.W>6).sort((a,b)=>b.W*b.L-a.W*a.L);   // the big ones first, a small neighbour may then reach their stair (face shrines, W 6, stand on their squares)
  for(const t of list){const e={n:name(t),x:Math.round(t.x),z:Math.round(t.z),y:+t.y.toFixed(1)};
    {const r=Math.hypot(t.W/2,t.L/2)+20;let hi=-1e9;for(let a=0;a<16;a++)hi=Math.max(hi,W.gy(t.x+Math.cos(a*Math.PI/8)*r,t.z+Math.sin(a*Math.PI/8)*r));   // no ground near its level all round: it stands on a building
      if(hi<t.y-6){log.push(Object.assign(e,{status:'raised',why:'on a building'}));continue;}}   // (on top of a theatre or the Circus: one comes up through the building)
    const own=templeOwn(W,t),wk=templeWalk(W,t,N,own);if(wk){log.push(Object.assign(e,{status:'linked'},wk));continue;}
    const p=templeStairPlan(W,t,N,own);if(!p.R){log.push(Object.assign(e,{status:'none',why:p.why}));continue;}
    hillStair(W,p.R,3.6,p.top);W.hillStairs[W.hillStairs.length-1].temple=e.n||true;templeMark(W.street,N,p.R,3.6/2+1.5,hillStairHeights(W,p.R,p.top));
    log.push(Object.assign(e,{status:'stair',from:p.from,len:p.len,drop:p.drop,R:p.R}));}
  const c={linked:0,stair:0,raised:0,none:0};for(const e of log)c[e.status]++;W.templeLinkStats=c;console.log('temple links',JSON.stringify(c));}

/* ---------- the road network as one graph (briefs/rome/road-first-city.md L1-L2; city-generation-spec.md sections 3, 4.1 and 8) ----------
   roadGraphJoin (P0) runs on the routed main roads before their beds are graded, so that everything built later sees one network:
   1. spikes: a corner where a road turns back by 120 degrees or more and whose two arms are both under 80 m. If the corner is no higher or lower
      than both its arms' ends, or the chord across it is gentle (16 % or less), the router went out and back for nothing: the corner is cut by the chord.
      Else, if both arms are at least twice the road's width, it is a real switchback: on a street that may climb by steps (o.steps: the Subura's climb has them, Martial 5.22) the chord is cut and marked
      stair; on the consular and processional roads, and anywhere out in the country, the switchback stays, its tip rounded, and is marked switchback.
   2. branches: a road end within 55 m of another road starts on it: at a vertex of that road if one gives a fork of 30 degrees or more
      (the bend is where the junction is cleanest), else at the nearest point within 40 m.
   3. loose ends: an end that is not on a road, not a registered terminus (the Forum, a gate, the Capitol, the palace), not on a bridge and
      not out in the country goes on to the nearest road it can reach (routeRoad, so it keeps off the monuments, the river and the cliffs).
      It keeps its road's width within 5.4-7 m; two ends facing each other are joined at the narrower road's width. Both ends of every
      bridge reach a road (7 m). The cheapest join is made first, so the later ones can end on it.
   roadGraphBuild (P1) turns the result into nodes, edges and faces (W.roads), and roadDistricts the faces into districts (W.city). */
const RG={snapV:55,snapP:40,fork:30*DEG,tol:6,spikeTurn:120*DEG,spikeArm:80,spikeTip:25,stair:.16,joinMax:900,bridgeMax:1500,pairMax:420,face:35*DEG};

/* polyline helpers */
function rgCum(P){const c=[0];for(let i=1;i<P.length;i++)c.push(c[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return c;}
function rgLen(P){const c=rgCum(P);return c[c.length-1];}
function rgAt(P,c,s){let i=1;while(i<P.length-1&&c[i]<s)i++;const t=clamp((s-c[i-1])/Math.max(1e-9,c[i]-c[i-1]),0,1);return[lerp(P[i-1][0],P[i][0],t),lerp(P[i-1][1],P[i][1],t)];}
function rgNear(P,x,z){let b=null;for(let i=0;i<P.length-1;i++){const a=P[i],q=P[i+1],dx=q[0]-a[0],dz=q[1]-a[1],l2=dx*dx+dz*dz,t=l2?clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1):0,px=a[0]+dx*t,pz=a[1]+dz*t,d=Math.hypot(px-x,pz-z);
    if(!b||d<b.d)b={d,i,t,x:px,z:pz};}return b||{d:Math.hypot(P[0][0]-x,P[0][1]-z),i:0,t:0,x:P[0][0],z:P[0][1]};}
function rgUnit(dx,dz){const l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];}
function rgAng(a,b){return Math.acos(clamp(a[0]*b[0]+a[1]*b[1],-1,1));}
function rgOut(P,end,back){const Q=end?P.slice().reverse():P,c=rgCum(Q),b=rgAt(Q,c,Math.min(back||20,c[c.length-1]));return rgUnit(Q[0][0]-b[0],Q[0][1]-b[1]);}   // outward direction at an end
function rgSegX(a,b,c,d){const rx=b[0]-a[0],rz=b[1]-a[1],sx=d[0]-c[0],sz=d[1]-c[1],den=rx*sz-rz*sx;if(Math.abs(den)<1e-12)return null;
  const qx=c[0]-a[0],qz=c[1]-a[1],t=(qx*sz-qz*sx)/den,u=(qx*rz-qz*rx)/den;return t>=0&&t<=1&&u>=0&&u<=1?{t,u,x:a[0]+rx*t,z:a[1]+rz*t}:null;}
function rgInsert(P,x,z){const n=rgNear(P,x,z);if(Math.hypot(P[n.i][0]-n.x,P[n.i][1]-n.z)<1)return n.i;if(Math.hypot(P[n.i+1][0]-n.x,P[n.i+1][1]-n.z)<1)return n.i+1;P.splice(n.i+1,0,[n.x,n.z]);return n.i+1;}
function rgTerm(T,x,z){for(const t of T||[]){if(t.F){const dx=x-t.F.ox,dz=z-t.F.oz,u=t.F.c*dx-t.F.s*dz,v=t.F.s*dx+t.F.c*dz,m=t.m||0;if(u>t.u[0]-m&&u<t.u[1]+m&&v>t.v[0]-m&&v<t.v[1]+m)return t;}
    else if(Math.hypot(x-t.x,z-t.z)<t.r)return t;}return null;}
function rgRect(t){const{F,u,v}=t;return[[u[0],v[0]],[u[1],v[0]],[u[1],v[1]],[u[0],v[1]],[u[0],v[0]]].map(([a,b])=>{const q=F.p(a,0,b);return[q[0],q[2]];});}   // a plaza's outline, closed

/* a spatial index of road segments (the other roads a join must keep off) */
function rgSegIndex(net,skip){const cs=40,map=new Map(),key=(i,j)=>i*73856093^j*19349663;
  for(const f of net){if(skip&&skip(f))continue;for(let k=1;k<f.P.length;k++){const p=f.P[k-1],q=f.P[k],hw=(f.w||0)/2+1,s={a:p,b:q,hw};
      for(let i=Math.floor((Math.min(p[0],q[0])-hw)/cs);i<=Math.floor((Math.max(p[0],q[0])+hw)/cs);i++)for(let j=Math.floor((Math.min(p[1],q[1])-hw)/cs);j<=Math.floor((Math.max(p[1],q[1])+hw)/cs);j++){
        const kk=key(i,j);let a=map.get(kk);if(!a)map.set(kk,a=[]);a.push(s);}}}
  return(x,z,r)=>{for(let i=Math.floor((x-r-8)/cs);i<=Math.floor((x+r+8)/cs);i++)for(let j=Math.floor((z-r-8)/cs);j<=Math.floor((z+r+8)/cs);j++){const a=map.get(key(i,j));if(!a)continue;
      for(const s of a)if(segD(x,z,s.a[0],s.a[1],s.b[0],s.b[1])<s.hw+r)return true;}return false;};}

function rgClear(W,o,a,b,w){const r=w/2+1.5,L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.ceil(L/3));
  for(let k=0;k<=n;k++){const x=lerp(a[0],b[0],k/n),z=lerp(a[1],b[1],k/n);if(o.ro.wet(x,z,r)||roadFoot(W,x,z,r)||roadNear(o.ro.avoid||[],x,z,r))return false;}return true;}

/* 1. spikes: a corner of 1-3 vertices (a rounded corner has three) whose arms are both under 80 m and which turns back by 120 degrees or more.
   A chord's two ends are never part of another corner, so a switchback is not eaten corner by corner. Out in the country a steep chord is not cut:
   there the corner is a switchback of a country road. */
function rgSpikes(W,e,o,log){const P=e.P,done=new Set(),steps=!o.steps||o.steps.includes(e.name);let n=0;
  for(const tn of[1,2,3])for(let i=1;i+tn<P.length;i++){const j=i+tn-1,tip=P.slice(i,j+1),a=P[i-1],b=P[j+1];
    if(tip.some(v=>done.has(v))||rgLen(tip)>RG.spikeTip)continue;
    const la=Math.hypot(P[i][0]-a[0],P[i][1]-a[1]),lb=Math.hypot(b[0]-P[j][0],b[1]-P[j][1]);if(la>RG.spikeArm||lb>RG.spikeArm)continue;
    const th=rgAng(rgUnit(P[i][0]-a[0],P[i][1]-a[1]),rgUnit(b[0]-P[j][0],b[1]-P[j][1]));if(th<RG.spikeTurn)continue;
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ya=W.gy(a[0],a[1]),yb=W.gy(b[0],b[1]),yv=tip.reduce((s,v)=>s+W.gy(v[0],v[1]),0)/tn,g=Math.abs(yb-ya)/Math.max(1,L),
      at=P[i].map(Math.round),country=o.country&&o.country(P[i][0],P[i][1]),climb=yv>Math.min(ya,yb)-1&&yv<Math.max(ya,yb)+1&&g>RG.stair&&Math.min(la,lb)>=Math.max(15,2*e.w);   // arms shorter than twice the road's width: a kink, not a switchback
    if(climb&&(country||!steps)){for(const v of tip)done.add(v);let round=false;   // a switchback: round its tip (a quadratic curve 0.45 of the shorter arm, at most 12 m, back along each arm)
      if(tn===1){const v=P[i],r=Math.min(12,.45*Math.min(la,lb)),A=[v[0]+(a[0]-v[0])*r/la,v[1]+(a[1]-v[1])*r/la],B=[v[0]+(b[0]-v[0])*r/lb,v[1]+(b[1]-v[1])*r/lb],C=[];
        for(let k=0;k<=6;k++){const t=k/6,u=1-t;C.push([u*u*A[0]+2*u*t*v[0]+t*t*B[0],u*u*A[1]+2*u*t*v[1]+t*t*B[1]]);}
        let ok=true;for(let k=1;k<C.length&&ok;k++)ok=rgClear(W,o,C[k-1],C[k],Math.min(e.w,5));if(ok){P.splice(i,1,...C);for(const q of C)done.add(q);round=true;}}
      (e.switchbacks||(e.switchbacks=[])).push([a.slice(),b.slice()]);log.push({k:'switchback',road:e.name,at,turn:Math.round(th/DEG),grade:+g.toFixed(2),country:!!country,round});continue;}
    if(!rgClear(W,o,a,b,Math.min(e.w,5))){log.push({k:'spike kept (chord blocked)',road:e.name,at,turn:Math.round(th/DEG)});continue;}
    P.splice(i,tn);done.add(a);done.add(b);if(g>RG.stair)(e.stairs||(e.stairs=[])).push([a.slice(),b.slice()]);
    log.push({k:'spike',road:e.name,at,turn:Math.round(th/DEG),chord:Math.round(L),grade:+g.toFixed(2),stair:g>RG.stair,climb});n++;i=Math.max(0,i-2);}
  return n;}

/* 2. a branch that starts beside its parent starts on it */
function rgSnap(W,net,e,end,o,log){const P=e.P,Q=end?P.slice().reverse():P,p=Q[0];let best=null;
  for(const f of net){if(f===e||f.kind!=='main'&&f.kind!=='fixed')continue;const n=rgNear(f.P,p[0],p[1]);if(n.d<=RG.tol)return'on';if(n.d>RG.snapV)continue;
    const C=[];f.P.forEach((v,k)=>{const d=Math.hypot(v[0]-p[0],v[1]-p[1]);if(d<=RG.snapV&&k>0&&k<f.P.length-1)C.push({x:v[0],z:v[1],d,k,vert:true});});
    if(n.d<=RG.snapP)C.push({x:n.x,z:n.z,d:n.d,k:n.i,t:n.t,vert:false});
    for(const c of C){let m=1;while(m<Q.length-1&&Math.hypot(Q[m][0]-c.x,Q[m][1]-c.z)<15)m++;const nx=Q[m],dir=rgUnit(nx[0]-c.x,nx[1]-c.z);   // the branch leaves c for its next vertex 15 m or more away
      const k=c.k,fa=c.vert?f.P[k-1]:f.P[k],fb=c.vert?f.P[k+1]:f.P[k+1],fork=Math.min(rgAng(dir,rgUnit(fa[0]-c.x,fa[1]-c.z)),rgAng(dir,rgUnit(fb[0]-c.x,fb[1]-c.z)));
      if(fork<RG.fork||!rgClear(W,o,[c.x,c.z],nx,Math.min(e.w,5)))continue;
      const score=(c.vert?0:1e3)+c.d;if(!best||score<best.score)best={f,c,m,fork,score};}}
  if(!best)return null;
  const{f,c,m}=best,from=p.map(Math.round);Q.splice(0,m,[c.x,c.z]);if(end){P.length=0;P.push(...Q.reverse());}if(!c.vert)rgInsert(f.P,c.x,c.z);
  log.push({k:'branch snapped',road:e.name,on:f.name,from,to:[Math.round(c.x),Math.round(c.z)],moved:Math.round(c.d),fork:Math.round(best.fork/DEG),vertex:c.vert});return'snap';}

/* 3. loose ends and bridge ends */
function rgCands(net,ends,L){const out=[],p=L.p,d=L.dir,cone=L.bridge?150*DEG:100*DEG,face=L.bridge?60*DEG:RG.face;   // a bridgehead may turn along the bank
  const add=(f,x,z,s,k)=>{if(s>L.max||s<1)return;const a=rgAng(d,rgUnit(x-p[0],z-p[1]));if(a>cone)return;
    out.push({f,x,z,s,a,score:s*(1+3*Math.max(0,a-face)/Math.PI)*(f.kind==='main'?1:1.25)*(k||1)});};
  for(const f of net){if(f===L.e||f.kind==='island'||f.kind==='fixed')continue;
    if(f.kind==='bridge'){for(const q of[f.P[0],f.P[f.P.length-1]])add(f,q[0],q[1],Math.hypot(q[0]-p[0],q[1]-p[1]));continue;}   // a bridge is reached at its ends, never on the deck
    const n=rgNear(f.P,p[0],p[1]);add(f,n.x,n.z,n.d);
    for(const da of[0,-.35,.35]){const c=Math.cos(da),s=Math.sin(da),r=[d[0]*c-d[1]*s,d[0]*s+d[1]*c],q=[p[0]+r[0]*L.max,p[1]+r[1]*L.max];let h=null;   // and where the road runs on straight into f
      for(let k=1;k<f.P.length;k++){const x=rgSegX(p,q,f.P[k-1],f.P[k]);if(x&&x.t*L.max>1&&(!h||x.t<h.t))h=x;}if(h)add(f,h.x,h.z,h.t*L.max);}}
  for(const M of ends){if(M===L||M.e===L.e||M.bridge||L.bridge)continue;const v=rgUnit(M.p[0]-p[0],M.p[1]-p[1]),s=Math.hypot(M.p[0]-p[0],M.p[1]-p[1]);   // two ends facing each other
    if(s<=RG.pairMax&&rgAng(d,v)<=45*DEG&&rgAng(M.dir,[-v[0],-v[1]])<=45*DEG)out.push({pair:M,f:M.e,x:M.p[0],z:M.p[1],s,a:rgAng(d,v),score:s*.75});}
  return out.sort((a,b)=>a.score-b.score);}
/* route a join from L.p to the candidate c with routeRoad. The other roads are obstacles, the target road is not: the join stops where it first
   reaches the target road (within half its width) or crosses any other road that stop() accepts. */
function rgRoute(W,net,o,L,c,stop){const a=L.p.slice(),b=[c.x,c.z],w=c.pair?Math.max(5.4,Math.min(L.rw,c.pair.rw)):L.w,
    block=rgSegIndex(net,f=>f.kind==='island'||f.kind==='plaza'||f===c.f),ro=Object.assign({},o.ro,{free:Math.max(18,w+12),block}),nf=(W.roadRouteFail||[]).length;
  let P=routeRoad(W,[a,b],w,ro);if((W.roadRouteFail||[]).length>nf){W.roadRouteFail.length=nf;return null;}
  const D=densify(P,2);let cut=null;
  for(let k=1;k<D.length&&!cut;k++){const q=D[k];if(Math.hypot(q[0]-a[0],q[1]-a[1])<ro.free)continue;
    for(const f of net){if(f===L.e||f.kind==='island'||f.kind==='fixed'||(stop&&!stop(f)&&f!==c.f))continue;const n=rgNear(f.P,q[0],q[1]);
      if(n.d<=Math.max(1,(f.w||0)/2)&&(f!==c.f||!c.pair)){cut={k,f,x:n.x,z:n.z};break;}}}
  if(cut){if(cut.f.kind==='bridge'){const e=[cut.f.P[0],cut.f.P[cut.f.P.length-1]].sort((u,v)=>Math.hypot(u[0]-cut.x,u[1]-cut.z)-Math.hypot(v[0]-cut.x,v[1]-cut.z))[0];cut.x=e[0];cut.z=e[1];}   // a bridge only at its ends
    P=D.slice(0,cut.k).concat([[cut.x,cut.z]]);c={f:cut.f,x:cut.x,z:cut.z,s:c.s,pair:null,cut:true};}
  else if(!c.pair){const n=rgNear(c.f.P,b[0],b[1]);c=Object.assign({},c,{x:n.x,z:n.z});}
  P=rgThin(P);const len=rgLen(P);if(len>1.8*c.s+80||len>L.max)return null;return{P,w,len,c};}
/* drop the 2 m points the cut left on straight stretches (keep the bends) */
function rgThin(P){if(P.length<3)return P;const out=[P[0]];for(let i=1;i<P.length-1;i++){const a=out[out.length-1],b=P[i],c=P[i+1],u=rgUnit(b[0]-a[0],b[1]-a[1]),v=rgUnit(c[0]-b[0],c[1]-b[1]);
    if(rgAng(u,v)>3*DEG||Math.hypot(b[0]-a[0],b[1]-a[1])>60)out.push(b);}out.push(P[P.length-1]);return out;}
function rgJoin(W,net,o,log){const st={pair:0,ext:0,bridge:0,open:0},ends=[],loose=[];
  const onNet=(x,z,self)=>net.some(f=>f!==self&&rgNear(f.P,x,z).d<=RG.tol);
  for(const e of net){if(e.kind!=='main'&&e.kind!=='fixed')continue;
    for(const end of[0,1]){const p=end?e.P[e.P.length-1]:e.P[0],E={e,end,p,dir:rgOut(e.P,end,20),rw:e.w,w:clamp(e.w,5.4,7)};ends.push(E);
      if(onNet(p[0],p[1],e))continue;const t=rgTerm(o.termini,p[0],p[1]);if(t){E.term=t.name;continue;}
      if(o.country&&o.country(p[0],p[1])){E.term='country';continue;}loose.push(E);}}
  for(const b of net)if(b.kind==='bridge')for(const end of[0,1]){const p=end?b.P[b.P.length-1]:b.P[0];if(onNet(p[0],p[1],b))continue;
    const E={e:b,end,p,dir:rgOut(b.P,end,20),rw:7,w:7,bridge:true,max:RG.bridgeMax};ends.push(E);loose.push(E);}
  let retry=true;const left=[];
  while(loose.length){let L=null,C=null;for(const E of loose){const c=rgCands(net,ends,E);if(c.length&&(!C||c[0].score<C[0].score)){L=E;C=c;}}
    if(!L){left.push(...loose);break;}
    // o.pins: [{from, to, P}] a loose end of road `from` at P[0] joins road `to` along P as given, not routed (monuments.js PAL_PINS); its turn in the queue is as before
    let r=null;const pin=(o.pins||[]).find(q=>q.from===L.e.name&&Math.hypot(q.P[0][0]-L.p[0],q.P[0][1]-L.p[1])<1),pf=pin&&net.find(g=>g.name===pin.to&&(g.kind==='main'||g.kind==='join'));
    if(pf){const e=pin.P[pin.P.length-1];r={P:pin.P.map(p=>p.slice()),w:L.w,len:rgLen(pin.P),c:{f:pf,x:e[0],z:e[1],s:Math.hypot(e[0]-L.p[0],e[1]-L.p[1]),pair:null}};log.push({k:'pinned',road:L.e.name,to:pin.to});}
    else{const seen=new Set();let best=null;   // route the four best targets (one point per road) and keep the shortest, weighed like the candidates
      for(const c of C){if(seen.size>=4)break;const key=c.pair?'end:'+ends.indexOf(c.pair):'road:'+net.indexOf(c.f);if(seen.has(key))continue;seen.add(key);
        const q=rgRoute(W,net,o,L,c);if(!q)continue;const sc=q.len*c.score/Math.max(1,c.s);if(!best||sc<best.sc)best={sc,q};}
      r=best&&best.q;}
    loose.splice(loose.indexOf(L),1);
    if(!r){left.push(L);continue;}
    const c=r.c,kind=L.bridge?'bridge':c.pair?'pair':'ext',J={w:r.w,P:r.P,kind:'join',join:kind,name:`${L.e.name}→${c.pair?c.pair.e.name:c.f.name}`};
    if(!c.pair&&c.f&&c.f.kind!=='bridge')rgInsert(c.f.P,c.x,c.z);net.push(J);st[kind]++;J.to=c.f.name;
    log.push({k:'join '+kind,road:L.e.name,end:L.end,to:c.pair?c.pair.e.name+' end':c.f.name,len:Math.round(r.len),w:r.w,cut:!!c.cut});
    if(c.pair){const i=loose.indexOf(c.pair);if(i>=0)loose.splice(i,1);}
    for(let i=loose.length-1;i>=0;i--)if(onNet(loose[i].p[0],loose[i].p[1],loose[i].e)){loose.splice(i,1);}
    if(!loose.length&&left.length&&retry){retry=false;loose.push(...left.splice(0));}}   // once more for those that failed: the network has grown
  for(const L of left){st.open++;log.push({k:'open end',road:L.e.name,end:L.end,at:L.p.map(Math.round)});}
  return st;}

/* connected pieces of the network: roads touching within RG.tol or crossing, the island between its bridges, and the roads ending in a plaza */
function rgComponents(net,o){const n=net.length,par=net.map((_,i)=>i),find=i=>par[i]===i?i:(par[i]=find(par[i])),uni=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[a]=b;};
  const box=net.map(f=>{let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of f.P){x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);}return[x0-RG.tol,z0-RG.tol,x1+RG.tol,z1+RG.tol];});
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const A=net[i],B=net[j],a=box[i],b=box[j];if(a[0]>b[2]||b[0]>a[2]||a[1]>b[3]||b[1]>a[3])continue;
    let hit=false;for(const[X,Y]of[[A,B],[B,A]])for(const p of[X.P[0],X.P[X.P.length-1]])if(!hit&&rgNear(Y.P,p[0],p[1]).d<=RG.tol)hit=true;
    for(let k=1;k<A.P.length&&!hit;k++)for(let m=1;m<B.P.length&&!hit;m++)if(rgSegX(A.P[k-1],A.P[k],B.P[m-1],B.P[m]))hit=true;
    if(hit)uni(i,j);}
  net.forEach((f,i)=>{if(f.kind==='plaza')return;for(const p of[f.P[0],f.P[f.P.length-1]]){const t=rgTerm(o.termini,p[0],p[1]);if(t&&t.plaza){const k=net.findIndex(g=>g.kind==='plaza'&&g.name===t.name);if(k>=0)uni(i,k);}}});
  return net.map((_,i)=>find(i));}
/* join the pieces left over to the piece with the Forum: the closest pair of points in the city that the router can link, 7 m wide */
function rgMerge(W,net,o,log){let n=0;const inCity=p=>!o.country||!o.country(p[0],p[1]);
  for(let it=0;it<12;it++){const comp=rgComponents(net,o),pi=net.findIndex(f=>f.kind==='plaza'),main=comp[pi>=0?pi:0];
    const real=f=>f.kind==='main'||f.kind==='join'||f.kind==='bridge',others=[...new Set(net.map((f,i)=>comp[i]!==main&&real(f)&&f.P.some(inCity)?comp[i]:-1))].filter(c=>c>=0);
    if(!others.length)break;
    const samp=c=>{const out=[];net.forEach((f,i)=>{if(comp[i]!==c||!real(f))return;for(const p of f.kind==='bridge'?[f.P[0],f.P[f.P.length-1]]:densify(f.P,15))if(inCity(p)&&!o.ro.wet(p[0],p[1],0))out.push({p,f});});return out;};
    const B=samp(main),pairs=[];
    for(const c of others)for(const a of samp(c)){let bb=null;for(const b of B){const d=Math.hypot(a.p[0]-b.p[0],a.p[1]-b.p[1]);if(!bb||d<bb.d)bb={d,b};}
      if(!bb||bb.d>RG.joinMax)continue;let wet=false;for(let k=1;k<8;k++){const x=lerp(a.p[0],bb.b.p[0],k/8),z=lerp(a.p[1],bb.b.p[1],k/8);if(o.ro.wet(x,z,0)){wet=true;break;}}if(!wet)pairs.push({a,b:bb.b,d:bb.d,c});}
    pairs.sort((x,y)=>x.d-y.d);const tried=[];let done=false;
    for(const q of pairs){if(tried.length>=6)break;if(tried.some(t=>Math.hypot(t.a.p[0]-q.a.p[0],t.a.p[1]-q.a.p[1])<60))continue;tried.push(q);
      const L={e:q.a.f,p:q.a.p.slice(),dir:rgUnit(q.b.p[0]-q.a.p[0],q.b.p[1]-q.a.p[1]),w:7,rw:7,max:RG.joinMax},r=rgRoute(W,net,o,L,{f:q.b.f,x:q.b.p[0],z:q.b.p[1],s:q.d},f=>comp[net.indexOf(f)]!==q.c);
      if(!r)continue;if(q.a.f.kind!=='bridge')rgInsert(q.a.f.P,L.p[0],L.p[1]);if(r.c.f.kind!=='bridge')rgInsert(r.c.f.P,r.c.x,r.c.z);
      net.push({w:r.w,P:r.P,kind:'join',join:'merge',name:`${q.a.f.name}→${r.c.f.name}`});n++;log.push({k:'join merge',road:q.a.f.name,to:r.c.f.name,len:Math.round(r.len),at:L.p.map(Math.round)});done=true;break;}
    if(!done){log.push({k:'pieces left unjoined',n:others.length});break;}}
  return n;}

function rgHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16);}   // a short key for the bake
/* P0: the main roads plus fixed routes, bridges and plazas in, the edited roads and the joins out ([w, pts, meta] for gradeRoads and roads()) */
function roadGraphJoin(W,routed,o){const t0=performance.now(),log=[],net=[];
  routed.forEach(([w,P],i)=>net.push({w,P:P.map(p=>p.slice()),kind:'main',i,name:(o.names&&o.names[i])||'road'+i}));
  for(const[w,P,m]of o.fixed||[])net.push({w,P:P.map(p=>p.slice()),kind:'fixed',name:(m&&m.name)||'fixed'});
  (o.bridges||[]).forEach((b,i)=>{const lx=-b.uz,lz=b.ux,h=b.len/2;net.push({w:b.w||9,P:[[b.x-lx*h,b.z-lz*h],[b.x,b.z],[b.x+lx*h,b.z+lz*h]],kind:'bridge',i,name:b.name||'bridge'+i});});
  for(const[i,j]of o.island||[]){const A=net.find(f=>f.kind==='bridge'&&(f.i===i||f.name===i)),B=net.find(f=>f.kind==='bridge'&&(f.i===j||f.name===j));if(!A||!B)continue;   // the island's two bridgeheads: the nearer ends
    let m=null;for(const a of[0,2])for(const b of[0,2]){const d=Math.hypot(A.P[a][0]-B.P[b][0],A.P[a][1]-B.P[b][1]);if(!m||d<m.d)m={d,a,b};}
    net.push({w:0,P:[A.P[m.a].slice(),B.P[m.b].slice()],kind:'island',name:'island'});}
  for(const t of o.termini||[])if(t.plaza&&t.F)net.push({w:0,P:rgRect(t),kind:'plaza',name:t.name});
  const st={spikes:0,switchbacks:0,snapped:0};
  for(const e of net)if(e.kind==='main'){st.spikes+=rgSpikes(W,e,o,log);st.switchbacks+=(e.switchbacks||[]).length;}
  for(const e of net)if(e.kind==='main')for(const end of[0,1]){const p=end?e.P[e.P.length-1]:e.P[0];if(rgTerm(o.termini,p[0],p[1])||o.ro.wet(p[0],p[1],0))continue;if(rgSnap(W,net,e,end,o,log)==='snap')st.snapped++;}
  Object.assign(st,rgJoin(W,net,o,log));st.merge=rgMerge(W,net,o,log);
  const out=net.filter(f=>f.kind==='main'||f.kind==='join').map(f=>[f.w,f.P,{name:f.name,kind:f.kind,join:f.join,stairs:f.stairs,switchbacks:f.switchbacks}]);
  W.roadJoin={net,log,stats:st,ms:Math.round(performance.now()-t0)};
  for(const L of log)console.log('[rg]',JSON.stringify(L));console.log('[rg] P0',JSON.stringify(st),W.roadJoin.ms+' ms');
  return out;}

/* ======================= P1: the network as a planar graph, the land between the roads as districts ======================= */
/* roadGraph(W) -> W.roads {nodes, edges, faces, stats}. In: the drawn roads (W.roadList: main roads, joins, hill pieces, the clivi), the bridges
   (W.bridges), the island link and the Forum's outline (W.roadOpts), cut where they meet or cross. A node is where pieces end, meet (within 2 m)
   or cross; an edge is the piece between two nodes, with its width, kind (main, join, hill, fixed, bridge, island, plaza) and level (A: 7 m and
   wider, B: narrower, '-': a link that is not a street). Faces are walked along the half-edges with the face on the left, so the outer face of
   each piece of the network has a negative area. A node of degree 3 or more is a junction: a compitum candidate (road-first-city.md 4.1). */
function roadGraph(W){if(W.roads)return W.roads;const t0=performance.now(),o=W.roadOpts||{},L=[],SNAP=2;
  for(const[w,P,m]of W.roadList||[]){if(!P||P.length<2)continue;const M=m||{};L.push({P:P.map(p=>p.slice()),w,kind:M.hill?'hill':M.kind||'main',level:(M.hill?M.w0:w)>=7?'A':'B',name:M.name||''});}
  for(const b of W.bridges||[]){const lx=-b.uz,lz=b.ux,h=b.len/2;L.push({P:[[b.x-lx*h,b.z-lz*h],[b.x+lx*h,b.z+lz*h]],w:b.w,kind:'bridge',level:'A',name:b.name});}
  for(const[i,j]of o.island||[]){const A=L.find(l=>l.kind==='bridge'&&l.name===i),B=L.find(l=>l.kind==='bridge'&&l.name===j);if(!A||!B)continue;let m=null;
    for(const a of A.P)for(const b of B.P){const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(!m||d<m.d)m={d,a,b};}L.push({P:[m.a.slice(),m.b.slice()],w:0,kind:'island',level:'-',name:'insula'});}
  for(const t of(o.termini||[]).filter(t=>t.plaza&&t.F)){const R=rgRect(t),n0=L.length;L.push({P:R,w:0,kind:'plaza',level:'-',name:t.name});
    for(let li=0;li<n0;li++){const l=L[li];if(!l.w)continue;for(const p of[l.P[0],l.P[l.P.length-1]]){if(!rgTerm([t],p[0],p[1]))continue;const n=rgNear(R,p[0],p[1]);   // a road ending in the plaza (or by it) is linked to its outline
      if(n.d>SNAP)L.push({P:[p.slice(),[n.x,n.z]],w:0,kind:'plaza',level:'-',name:t.name});}}}
  // cut points along each piece (arc lengths): its ends, where it crosses another piece, where another piece's end touches it
  const cs=40,map=new Map(),key=(i,j)=>i*73856093^j*19349663;
  L.forEach((l,li)=>{l.cum=rgCum(l.P);l.ev=[0,l.cum[l.cum.length-1]];for(let k=1;k<l.P.length;k++){const a=l.P[k-1],b=l.P[k],s={li,k,a,b};
    for(let i=Math.floor((Math.min(a[0],b[0])-SNAP)/cs);i<=Math.floor((Math.max(a[0],b[0])+SNAP)/cs);i++)for(let j=Math.floor((Math.min(a[1],b[1])-SNAP)/cs);j<=Math.floor((Math.max(a[1],b[1])+SNAP)/cs);j++){
      const kk=key(i,j);let A=map.get(kk);if(!A)map.set(kk,A=[]);A.push(s);}}});
  const segAt=(s,t)=>{const c=L[s.li].cum;return c[s.k-1]+t*(c[s.k]-c[s.k-1]);},seen=new Set();
  for(const A of map.values())for(let x=0;x<A.length;x++)for(let y=x+1;y<A.length;y++){let s=A[x],t=A[y];if(s.li===t.li&&Math.abs(s.k-t.k)<=1)continue;if(s.li>t.li||s.li===t.li&&s.k>t.k)[s,t]=[t,s];
    const pk=s.li*1e6+s.k+'|'+(t.li*1e6+t.k);if(seen.has(pk))continue;seen.add(pk);const X=rgSegX(s.a,s.b,t.a,t.b);if(X){L[s.li].ev.push(segAt(s,X.t));L[t.li].ev.push(segAt(t,X.u));}}
  L.forEach((l,li)=>{for(const p of[l.P[0],l.P[l.P.length-1]])for(const s of map.get(key(Math.floor(p[0]/cs),Math.floor(p[1]/cs)))||[]){if(s.li===li)continue;
    const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],l2=dx*dx+dz*dz,t=l2?clamp(((p[0]-s.a[0])*dx+(p[1]-s.a[1])*dz)/l2,0,1):0;if(Math.hypot(s.a[0]+dx*t-p[0],s.a[1]+dz*t-p[1])<SNAP)L[s.li].ev.push(segAt(s,t));}});
  // nodes (cut points within SNAP are one node) and edges (the pieces between them)
  const nodes=[],nmap=new Map(),node=(x,z)=>{const i=Math.floor(x/SNAP),j=Math.floor(z/SNAP);for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++)for(const n of nmap.get(key(a,b))||[])if(Math.hypot(n.x-x,n.z-z)<SNAP)return n;
      const n={id:nodes.length,x,z,edges:[]};nodes.push(n);const k=key(i,j);let A=nmap.get(k);if(!A)nmap.set(k,A=[]);A.push(n);return n;},edges=[];
  for(const l of L){const tot=l.cum[l.cum.length-1],ev=[...new Set(l.ev.map(s=>Math.round(clamp(s,0,tot)*100)/100))].sort((a,b)=>a-b);let prev=null,ps=0;
    for(const s of ev){const p=rgAt(l.P,l.cum,s),n=node(p[0],p[1]);if(!prev){prev=n;ps=s;continue;}if(n===prev&&s-ps<SNAP*3)continue;
      const pts=[[prev.x,prev.z]];for(let k=1;k<l.P.length-1;k++)if(l.cum[k]>ps+.05&&l.cum[k]<s-.05)pts.push(l.P[k].slice());pts.push([n.x,n.z]);
      const e={id:edges.length,a:prev.id,b:n.id,pts,w:l.w,kind:l.kind,level:l.level,name:l.name,len:+(s-ps).toFixed(1)};edges.push(e);prev.edges.push(e.id);n.edges.push(e.id);prev=n;ps=s;}}
  // half-edges 2e (a->b) and 2e+1 (b->a); at each node the outgoing ones sorted by angle; next(h): the outgoing half-edge just clockwise of h's twin
  const H=edges.length*2,from=h=>h&1?edges[h>>1].b:edges[h>>1].a,pts=h=>h&1?edges[h>>1].pts.slice().reverse():edges[h>>1].pts,ang=new Float64Array(H),out=nodes.map(()=>[]);
  for(let h=0;h<H;h++){const P=pts(h);let q=P[1];for(let k=1;k<P.length;k++){q=P[k];if(Math.hypot(q[0]-P[0][0],q[1]-P[0][1])>1)break;}ang[h]=Math.atan2(q[1]-P[0][1],q[0]-P[0][0]);out[from(h)].push(h);}
  const pos=new Int32Array(H);for(const A of out){A.sort((x,y)=>ang[x]-ang[y]);A.forEach((h,i)=>pos[h]=i);}
  const next=h=>{const t=h^1,A=out[from(t)];return A[(pos[t]-1+A.length)%A.length];},fOf=new Int32Array(H).fill(-1),faces=[];
  for(let h0=0;h0<H;h0++){if(fOf[h0]>=0)continue;const f={id:faces.length,he:[]};let h=h0,g=0;do{fOf[h]=f.id;f.he.push(h);h=next(h);}while(h!==h0&&++g<1e5);
    const P=[];for(const h of f.he){const Q=pts(h);for(let k=P.length?1:0;k<Q.length;k++)P.push(Q[k]);}f.poly=P;f.area=pArea(P);f.outer=f.area<=0;faces.push(f);}
  // pieces of the network (union-find over the nodes)
  const par=nodes.map((_,i)=>i),find=i=>par[i]===i?i:(par[i]=find(par[i]));for(const e of edges){const a=find(e.a),b=find(e.b);if(a!==b)par[a]=b;}
  for(const n of nodes){n.deg=n.edges.length;n.comp=find(n.id);}
  const G=W.roads={nodes,edges,faces,ms:0,stats:{nodes:nodes.length,edges:edges.length,faces:faces.filter(f=>!f.outer).length,junctions:nodes.filter(n=>n.deg>=3).length,
    deadEnds:nodes.filter(n=>n.deg===1).length,pieces:new Set(nodes.map(n=>n.comp)).size,km:+(edges.filter(e=>e.level!=='-').reduce((s,e)=>s+e.len,0)/1e3).toFixed(1)}};
  G.ms=Math.round(performance.now()-t0);return G;}

/* cityDistricts(W) -> W.city: the city's land on a 4 m raster. A cell is out (the country: W.roadOpts.country), water, road (the corridors roads()
   reserves: half the width plus 2.6 m on roads 7 m and wider, else 1.2 m; bridges), precinct (the footprints placed before the houses,
   W.foot up to W.footMark.houses), ring (the 4.5 m street round each precinct of 8 m and more that is not reserved open land, road-first-city.md
   4.2), cliff (slope over 52 %, on the desktop tier's ground at every tier: W.routeGround) or buildable. The buildable cells fall into connected pieces: a district when it has 300 m² and is 11 m thick,
   else a fragment (F0-F4 later): along a road or a ring it is street (under 8 m thick) or a small square, by a cliff or the river green, else
   precinct ground; a fragment with none of these round it, and a district with no road or ring along it, is land with no use (H12).
   A district's class is the majority of W.cityClass (the old zones) over its cells on a 16 m world lattice. Outlines: the cell edges, chained and simplified. */
const CD={cs:4,cliff:.52,ring:4.5,ringMin:8,area:300,thick:11,strip:8};
function cityDistricts(W){if(W.city)return W.city;const t0=performance.now(),o=W.roadOpts||{},cs=CD.cs,country=o.country||(()=>false);
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(let z=-3000;z<=3400;z+=40)for(let x=-3200;x<=3000;x+=40)if(!country(x,z)){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}
  x0-=80;z0-=80;x1+=80;z1+=80;const nx=Math.ceil((x1-x0)/cs),nz=Math.ceil((z1-z0)/cs),N=nx*nz,C=new Uint8Array(N),OUT=0,WATER=1,ROAD=2,PREC=3,RING=4,CLIFF=5,BUILD=6;
  const Y=new Float32Array((nx+1)*(nz+1)),G=fbGround(W);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)Y[j*(nx+1)+i]=G.gy(x0+i*cs,z0+j*cs);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+(i+.5)*cs,z=z0+(j+.5)*cs,k=j*nx+i;if(country(x,z)){C[k]=OUT;continue;}
    const a=Y[j*(nx+1)+i],b=Y[j*(nx+1)+i+1],c=Y[(j+1)*(nx+1)+i],d=Y[(j+1)*(nx+1)+i+1];C[k]=Math.hypot(b-a+d-c,c-a+d-b)/(2*cs)>CD.cliff?CLIFF:BUILD;}
  const stamp=(cx,cz,hw,hd,c,s,circ,pad,fn)=>{const r=Math.hypot(hw,hd)+pad;for(let j=Math.max(0,Math.floor((cz-r-z0)/cs));j<=Math.min(nz-1,Math.floor((cz+r-z0)/cs));j++)
      for(let i=Math.max(0,Math.floor((cx-r-x0)/cs));i<=Math.min(nx-1,Math.floor((cx+r-x0)/cs));i++){const dx=x0+(i+.5)*cs-cx,dz=z0+(j+.5)*cs-cz;let d;
        if(circ)d=Math.hypot(dx,dz)-hw;else{const u=Math.abs(c*dx-s*dz)-hw,v=Math.abs(s*dx+c*dz)-hd;d=Math.hypot(Math.max(u,0),Math.max(v,0))+Math.min(Math.max(u,v),0);}if(d<pad)fn(j*nx+i,d);}};
  if(o.river){const{P,hw}=o.river;for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(!l)continue;const r=Math.atan2(-dz,dx);   // the river (its half-width: hw)
    stamp((a[0]+b[0])/2,(a[1]+b[1])/2,l/2+hw,hw,Math.cos(r),Math.sin(r),false,0,k2=>{if(C[k2]!==OUT)C[k2]=WATER;});}}
  // precincts and their rings, then the road corridors over them (a road through a precinct is still a road)
  const fixed=fbPrecincts(W).map(o=>o.f);   // the fabric's view (fabric.js): inside the Palatine's fence, H0's
  for(const f of fixed){const ring=f.tag!=='open'&&Math.max(f.hw,f.hd)>=CD.ringMin;stamp(f.cx,f.cz,f.hw,f.hd,f.c,f.s,f.circ,ring?CD.ring:0,(k,d)=>{const v=C[k];if(v===OUT||v===WATER)return;if(d<0)C[k]=PREC;else if(v!==PREC)C[k]=RING;});}
  const road=(P,half)=>{for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(!l)continue;const r=Math.atan2(-dz,dx);
    stamp((a[0]+b[0])/2,(a[1]+b[1])/2,l/2+half,half,Math.cos(r),Math.sin(r),false,0,k2=>{if(C[k2]!==OUT)C[k2]=ROAD;});}};
  for(const[w,P]of fbRoads(W))road(P,w/2+(w>=7?2.6:1.2));for(const b of W.bridges||[]){const lx=-b.uz,lz=b.ux,h=b.len/2;road([[b.x-lx*h,b.z-lz*h],[b.x+lx*h,b.z+lz*h]],b.w/2);}
  {const F=fbFence();if(F){const c=F.cells,di=(c.x0-x0)/cs,dj=(c.z0-z0)/cs;if(di!==Math.round(di)||dj!==Math.round(dj))console.warn('palatine-fence.js: its raster is not on the districts\' grid');   // the fence: H0's classes inside R
    else{let k=0;for(const[,ch,nr]of c.rle.matchAll(/([a-g.])(\d+)/g))for(let r=+nr;r>0;r--,k++){if(ch==='.')continue;const i=di+k%c.nx,j=dj+((k-k%c.nx)/c.nx);if(i>=0&&j>=0&&i<nx&&j<nz)C[j*nx+i]=ch.charCodeAt(0)-97;}}}}
  // connected buildable pieces (4-neighbours), their size, thickness (chamfer distance to anything not buildable) and what they touch
  const lab=new Int32Array(N).fill(-1),D=new Float32Array(N),pieces=[],Q=new Int32Array(N);
  for(let k=0;k<N;k++)D[k]=C[k]===BUILD?1e9:0;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(!D[k])continue;if(i>0)D[k]=Math.min(D[k],D[k-1]+1);if(j>0)D[k]=Math.min(D[k],D[k-nx]+1);if(i>0&&j>0)D[k]=Math.min(D[k],D[k-nx-1]+1.414);if(i<nx-1&&j>0)D[k]=Math.min(D[k],D[k-nx+1]+1.414);}
  for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const k=j*nx+i;if(!D[k])continue;if(i<nx-1)D[k]=Math.min(D[k],D[k+1]+1);if(j<nz-1)D[k]=Math.min(D[k],D[k+nx]+1);if(i<nx-1&&j<nz-1)D[k]=Math.min(D[k],D[k+nx+1]+1.414);if(i>0&&j<nz-1)D[k]=Math.min(D[k],D[k+nx-1]+1.414);}
  for(let k0=0;k0<N;k0++){if(C[k0]!==BUILD||lab[k0]>=0)continue;const id=pieces.length,p={id,n:0,dmax:0,sx:0,sz:0,touch:{},cells:null};let h=0,t=0;Q[t++]=k0;lab[k0]=id;const cells=[];
    while(h<t){const k=Q[h++],i=k%nx,j=(k-i)/nx;cells.push(k);p.n++;p.sx+=i;p.sz+=j;if(D[k]>p.dmax)p.dmax=D[k];
      for(const[q,ok]of[[k-1,i>0],[k+1,i<nx-1],[k-nx,j>0],[k+nx,j<nz-1]]){if(!ok)continue;const v=C[q];if(v===BUILD){if(lab[q]<0){lab[q]=id;Q[t++]=q;}}else p.touch[v]=(p.touch[v]||0)+1;}}
    p.cells=cells;pieces.push(p);}
  const cls=W.cityClass||(()=>'other'),districts=[],frags=[],area={district:0,street:0,square:0,green:0,precinct:0,none:0};
  for(const p of pieces){const A=p.n*cs*cs,thick=(2*p.dmax-1)*cs,T=p.touch,cx=x0+(p.sx/p.n+.5)*cs,cz=z0+(p.sz/p.n+.5)*cs;p.area=A;p.thick=+thick.toFixed(1);p.cx=Math.round(cx);p.cz=Math.round(cz);
    if(A>=CD.area&&thick>=CD.thick){const votes={},ox=x0/cs,oz=z0/cs;let lat=p.cells.filter(k=>{const i=k%nx,j=(k-i)/nx;return!((ox+i)&3)&&!((oz+j)&3);});if(!lat.length)lat=p.cells;   // every cell on a 16 m world lattice (25 samples of the cell list flipped a district's class when its outline moved a little)
      for(const k of lat){const i=k%nx,j=(k-i)/nx;let c='other';try{c=cls(x0+(i+.5)*cs,z0+(j+.5)*cs)||'other';}catch(e){}votes[c]=(votes[c]||0)+1;}
      let best='other',bv=0;for(const c in votes)if(c!=='other'&&votes[c]>bv){best=c;bv=votes[c];}
      p.kind='district';p.cls=best;p.access=!!(T[ROAD]||T[RING]);p.seed=hash2(p.cx,p.cz);districts.push(p);area[p.access?'district':'none']+=A;}
    else{p.kind='frag';p.use=T[ROAD]||T[RING]?(thick<CD.strip?'street':'square'):T[CLIFF]||T[WATER]?'green':T[PREC]?'precinct':'none';frags.push(p);area[p.use]+=A;}}
  // outlines: each piece's cell edges with the piece on the left, chained into loops (at a pinch take the left turn), then simplified
  const loops=new Map(),ekey=(i,j)=>i*100003+j,addE=(id,a,b)=>{let m=loops.get(id);if(!m)loops.set(id,m=new Map());const k=ekey(a[0],a[1]);let A=m.get(k);if(!A)m.set(k,A=[]);A.push([a,b]);};
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const id=lab[j*nx+i];if(id<0)continue;const L=(a,b)=>a<0||b<0||a>=nx||b>=nz?-1:lab[b*nx+a];
    if(L(i,j-1)!==id)addE(id,[i,j],[i+1,j]);if(L(i+1,j)!==id)addE(id,[i+1,j],[i+1,j+1]);if(L(i,j+1)!==id)addE(id,[i+1,j+1],[i,j+1]);if(L(i-1,j)!==id)addE(id,[i,j+1],[i,j]);}
  const dp=(P,tol)=>{if(P.length<4)return P;const keep=new Uint8Array(P.length);keep[0]=keep[P.length-1]=1;const st=[[0,P.length-1]];
    while(st.length){const[a,b]=st.pop();let m=-1,dm=tol;for(let k=a+1;k<b;k++){const d=rgNear([P[a],P[b]],P[k][0],P[k][1]).d;if(d>dm){dm=d;m=k;}}if(m>=0){keep[m]=1;st.push([a,m],[m,b]);}}   // rgNear: a closed loop's chord has no length
    return P.filter((_,k)=>keep[k]);};
  for(const p of pieces){const m=loops.get(p.id);p.loops=[];if(!m)continue;
    for(const[,A0]of m)while(A0.length){let e=A0.pop(),g=0;const P=[e[0]];
      while(g++<1e6){P.push(e[1]);if(e[1][0]===P[0][0]&&e[1][1]===P[0][1])break;const A=m.get(ekey(e[1][0],e[1][1]));if(!A||!A.length)break;let pick=0;
        if(A.length>1){const dx=e[1][0]-e[0][0],dz=e[1][1]-e[0][1];pick=A.findIndex(q=>{const ex=q[1][0]-q[0][0],ez=q[1][1]-q[0][1];return dx*ez-dz*ex>0;});if(pick<0)pick=0;}   // a pinch: turn left
        e=A.splice(pick,1)[0];}
      const W2=dp(P.map(([i,j])=>[x0+i*cs,z0+j*cs]),cs*.75);if(W2.length>=4)p.loops.push(W2);}}
  for(const p of pieces)delete p.cells;
  const tot=area.district+area.street+area.square+area.green+area.precinct+area.none,buildable=pieces.reduce((s,p)=>s+p.area,0);
  // where the houses built so far stand (an observation, not a check: the old generators did not know the districts)
  const houses={};for(const f of W.foot.list.slice((W.footMark&&W.footMark.houses)||0)){if(f.tag==='road'||f.tag==='open')continue;const i=Math.floor((f.cx-x0)/cs),j=Math.floor((f.cz-z0)/cs);if(i<0||j<0||i>=nx||j>=nz)continue;
    const k=j*nx+i,v=C[k],c=v===BUILD?(pieces[lab[k]].kind==='district'?'district':'fragment'):['out','water','road','precinct','ring','cliff'][v];houses[c]=(houses[c]||0)+1;}
  const byCls={};for(const d of districts)byCls[d.cls]=(byCls[d.cls]||0)+d.area;for(const c in byCls)byCls[c]=Math.round(byCls[c]/1e4*10)/10;
  W.city={cs,x0,z0,nx,nz,C,lab,pieces,districts,frags,ms:0,stats:{districts:districts.length,frags:frags.length,ha:{buildable:+(buildable/1e4).toFixed(1),...Object.fromEntries(Object.entries(area).map(([k,v])=>[k,+(v/1e4).toFixed(2)]))},
    byClass:byCls,noAccess:districts.filter(d=>!d.access).length,H12:tot?+(area.none/tot*100).toFixed(2):0,houses}};
  W.city.ms=Math.round(performance.now()-t0);return W.city;}

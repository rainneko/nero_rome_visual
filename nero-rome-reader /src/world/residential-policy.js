/* Shared residential admission rules. These govern ordinary procedural housing,
   not temples, civic halls or deliberately authored palace buildings. */
const RESIDENTIAL_RULES={maxSolidLength:22,maxSolidWidth:16,maxSolidArea:260,maxRoofSpan:14,minCourtWidth:5,minCourtArea:35,gardenEaveClearance:2};
function residentialBounds(P){const o=lotOBB(P);return{...o,length:Math.max(o.hw,o.hd)*2,width:Math.min(o.hw,o.hd)*2,area:Math.abs(pArea(P))};}
function residentialSolidFits(P){const b=residentialBounds(P);return b.length<=RESIDENTIAL_RULES.maxSolidLength+.01&&b.width<=RESIDENTIAL_RULES.maxSolidWidth+.01&&b.area<=RESIDENTIAL_RULES.maxSolidArea+.01;}
function residentialOverlap(P,Q){
  for(const A of[P,Q])for(let i=0;i<A.length;i++){const a=A[i],b=A[(i+1)%A.length],nx=b[1]-a[1],nz=a[0]-b[0],u=P.map(p=>p[0]*nx+p[1]*nz),v=Q.map(p=>p[0]*nx+p[1]*nz);if(Math.max(...u)<=Math.min(...v)+.001||Math.max(...v)<=Math.min(...u)+.001)return false;}return true;
}
function footTagHit(W,P,tag){const o=residentialBounds(P),q={cx:o.cx,cz:o.cz,hw:o.hw,hd:o.hd,c:Math.cos(o.rot),s:Math.sin(o.rot),r:Math.hypot(o.hw,o.hd)},F=W.foot,cs=F.cell;   // does polygon P overlap a footprint tagged tag?
  for(let i=Math.floor((q.cx-q.r)/cs);i<=Math.floor((q.cx+q.r)/cs);i++)for(let j=Math.floor((q.cz-q.r)/cs);j<=Math.floor((q.cz+q.r)/cs);j++)for(const f of F.map.get(F.key(i,j))||[]){if(f.tag!==tag)continue;const dx=f.cx-q.cx,dz=f.cz-q.cz;if(dx*dx+dz*dz<=(f.r+q.r)**2&&obb(f,q))return true;}
  return false;}
function reserveResidentialArea(W,P,role,extra={}){if(!P||P.length<3)return;const o=residentialBounds(P),rec={polygon:P.map(p=>p.slice()),role,cx:o.cx,cz:o.cz,r:Math.hypot(o.hw,o.hd),afterLot:W.lotLog?.length||0,...extra};
  (W.residentialReservations||(W.residentialReservations=[])).push(rec);
  const f=W.foot.add(o.cx,o.cz,o.hw,o.hd,o.rot,'open');f.poly=P;f.siteRole=role;f.reservation=rec;return rec;
}
function residentialSiteReason(W,P){
  const o=residentialBounds(P),rad=Math.hypot(o.hw,o.hd),seen=new Set(),cs=W.foot&&W.foot.cell;
  if(cs)for(let i=Math.floor((o.cx-rad)/cs);i<=Math.floor((o.cx+rad)/cs);i++)for(let j=Math.floor((o.cz-rad)/cs);j<=Math.floor((o.cz+rad)/cs);j++)for(const f of W.foot.map.get(W.foot.key(i,j))||[]){const r=f.reservation;if(!r||seen.has(r))continue;seen.add(r);if(Math.hypot(o.cx-r.cx,o.cz-r.cz)>rad+r.r)continue;if(residentialOverlap(P,r.polygon))return r.role;}
  // The engineered Palatine precinct is managed by its authored buildings, courts,
  // offices and terraces. Random housing has no implicit right to occupy its foundations.
  if(W.name==='rome'&&typeof palL==='function'){
    const samples=P.concat(P.map((p,i)=>lp(p,P[(i+1)%P.length],.5)),[[o.cx,o.cz]]);
    for(const q of samples){const[x,z]=palL(...q);if((x/260)**2+((z-12)/205)**2<1&&W.gy(...q)>18)return 'palatine-planned-precinct';}
  }
  return null;
}
function residentialSiteAllowed(W,P){const reason=residentialSiteReason(W,P);if(reason){const S=W.residentialRejects||(W.residentialRejects={});S[reason]=(S[reason]||0)+1;return false;}return true;}
function splitResidentialPolygon(P){
  const b=lotOBB(P),axis=b.hw>=b.hd?[b.ux,b.uz]:[-b.uz,b.ux],v=P.map(p=>p[0]*axis[0]+p[1]*axis[1]),mid=(Math.min(...v)+Math.max(...v))/2;
  const cut=sign=>{const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],va=(a[0]*axis[0]+a[1]*axis[1]-mid)*sign,vb=(b[0]*axis[0]+b[1]*axis[1]-mid)*sign;if(va<=0)out.push(a);if(va*vb<0)out.push(lp(a,b,va/(va-vb)));}return out;};return[cut(1),cut(-1)].filter(P=>P.length>=3&&Math.abs(pArea(P))>20);
}
function courtyardDeckPlan(W,C){const h=houseGround(W,C);if(!h)return null;const y=h.max+.16,exposure=y-h.min;if(h.max-h.min>2.001||exposure>1.8+.001)return null;return{y,bottom:h.min-.2,relief:h.max-h.min,maxExposure:exposure};}
function courtyardDeck(W,g,C,plan){plan=plan||courtyardDeckPlan(W,C);if(!plan)return null;
  g.set(22,.45);for(let i=0;i<C.length;i++){const a=C[i],b=C[(i+1)%C.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let j=0;j<n;j++){const p=lp(a,b,j/n),q=lp(a,b,(j+1)/n),lo=Math.min(W.gy(...p),W.gy(...q))-.2;wall(g,IDF,...p,...q,lo,plan.y,lo,3);}}
  g.set(11,.4);g.poly(C.map(p=>[p[0],plan.y,p[1]]),[0,1,0]);return plan.y;
}
// Pools are fitted to the garden, never produced by blindly insetting a narrow skew plot.
function courtyardPoolPolygon(P){const o=lotOBB(P),F=frame(o.cx,0,o.cz,o.rot),sign=Math.sign(pArea(P))||1;
  const inside=q=>P.every((a,i)=>{const b=P[(i+1)%P.length];return sign*((b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]))>=.02;});
  let hx=Math.min(4,o.hw*.25),hz=Math.min(2.2,o.hd*.25);
  for(let k=0;k<6;k++){const Q=[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(q=>{const p=F.p(q[0],0,q[1]);return[p[0],p[2]];});if(Q.every(inside))return Q;hx*=.75;hz*=.75;}return null;
}

// A court is a topological hole: each inner edge must be covered by built wing
// polygons. Clipping gives exact covered intervals, not a count of nearby houses.
function residentialCourtClosure(C,records){
  const uncovered=[];
  for(let e=0;e<C.length;e++){
    const a=C[e],b=C[(e+1)%C.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),spans=[];
    for(const rec of records){const P=rec.L||rec.polygon;if(!P||P.length<3)continue;let lo=0,hi=1;const sign=Math.sign(pArea(P))||1;
      for(let i=0;i<P.length;i++){const u=P[i],v=P[(i+1)%P.length],ex=v[0]-u[0],ez=v[1]-u[1],f=sign*(ex*(a[1]-u[1])-ez*(a[0]-u[0]))+.015*Math.hypot(ex,ez),d=sign*(ex*dz-ez*dx);
        if(Math.abs(d)<1e-9){if(f<0){lo=1;hi=0;break;}}else if(d>0)lo=Math.max(lo,-f/d);else hi=Math.min(hi,-f/d);
      }if(hi>lo)spans.push([Math.max(0,lo),Math.min(1,hi)]);
    }
    spans.sort((x,y)=>x[0]-y[0]);let end=0;for(const [lo,hi]of spans){if(lo>end+.025/length)uncovered.push({edge:e,from:end,to:lo});end=Math.max(end,hi);}if(end<1-.025/length)uncovered.push({edge:e,from:end,to:1});
  }
  return{closed:uncovered.length===0,uncovered};
}

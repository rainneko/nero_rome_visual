/* ---------- terrace edges: retaining walls, parapets, stairs along walls, wall feet (briefs/rome/podium-stairs-rock.md B, phase 2, 2026-11-04) ----------
   One wall stone and one rock per hill (the author, 2026-11-04). The palette index rides in sty of parts 60 (wall), 61 (rock) and 62 (moss at the foot);
   the colours are in the city shader (materials.js). 0 Capitoline: grey peperino walls on grey-yellow tuff (【史】the platform of Jupiter's temple was
   founded on blocks of the local cappellaccio tuff); 1 Palatine: brown-grey tuff walls on brown tuff, matched to the Domus Tiberiana model; 2 the other hills.
   The hill of a point is the HILLS ridge (monuments.js) nearest to it, in units of that hill's radius. */
function hillPal(x,z){let best=-1,bd=1.15;for(let i=0;i<HILLS.length;i++){const H=HILLS[i],d=segD(x,z,H[0],H[1],H[2],H[3])/H[4];if(d<bd){bd=d;best=i;}}return best===0?0:best===1?1:2;}
const teH=(x,z,j)=>hash2(Math.round(x*8)+j*9173,Math.round(z*8)-j*6151);   // a die keyed to the place (hash2 truncates its arguments)
const trimSet=(g,pal,s=.5)=>pal===1?g.set(60,s,1,2):g.set(48,s);   // the travertine trim (coping, string course, caps, treads): on the Palatine grade 4 of its stone family (part 60 flag 2, H0), elsewhere part 48 as before
function nearPoly(x,z,P,r){for(let i=1;i<P.length;i++)if(segD(x,z,P[i-1][0],P[i-1][1],P[i][0],P[i][1])<r)return true;return P.length===1&&Math.hypot(x-P[0][0],z-P[0][1])<r;}
function inPolyXZ(x,z,Q){let ins=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[j],b=Q[i];if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))ins=!ins;}return ins;}
// the ground a terrace takes, reserved before the houses and streets are laid out: a 12 m strip inside each edge ('precinct') and, outside each walled edge,
// a 5 m strip at the wall foot ('open': no houses and no streets there; terraceFeet plants it)
function terraceReserve(W,F,P,o={}){const Q=P.map(p=>{const q=F.p(p[0],0,p[1]);return[q[0],q[2]];}),n=Q.length;let A2=0,cx=0,cz=0;for(let i=0;i<n;i++){const a=Q[i],b=Q[(i+1)%n];A2+=a[0]*b[1]-b[0]*a[1];cx+=a[0]/n;cz+=a[1]/n;}
  for(let i=0;i<n;i++){const a=Q[i],b=Q[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=A2>0?uz:-uz,nz=A2>0?-ux:ux,rot=Math.atan2(-uz,ux),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
    W.foot.add(mx-nx*6,mz-nz*6,L/2,6,rot,'precinct');if(!(o.skip&&o.skip.includes(i)))W.foot.add(mx+nx*2.6,mz+nz*2.6,L/2+1,2.5,rot,'open');}
  W.foot.add(cx,cz,14,14,0,'precinct');}
/* terraceEdge(W,g,P,yTop,o): the edge of a terrace whose outline P is given in frame o.F (local x,z); its floor is at yTop (relative to o.F.oy).
   B1 the wall: sampled every 2 m, it goes down to 1.2 m under the ground in front, battered 4 %, the bottom metre in big blocks (a plinth course), a string
      course every 6 m where it is higher than 6 m. B2 a travertine coping 0.45 m thick, 0.3 m over the face; a parapet 1.08 m high where the drop is 0.6 m or
      more: a solid pluteus (default), or piers and stone grilles (o.rail[i]='transenna', round temple courts). B3 square buttresses every 6-8 m where the wall
      is higher than 2.5 m, blind arches (substructure()) over 9 m, piers at the corners. B4 half-round projections at the rock-spur corners in o.spur (a
      reconstruction). B5 at each opening the wall ends in a pier with a statue or a bronze tripod and turns back into the slope in a stepped wing wall.
   o.butt (H1, palatine-masterplan.md 4, the review of 2026-11-12) in place of B3's rule: {min, sp, turn, avoid(x,z), sym:{i: s}}: a buttress only where
   the wall is min m high or more, one every sp m along a run of walls that turn less than turn degrees at each vertex (a curve is one wall: a run of
   8 m or less has none), evenly from end to end, or on edge i out from s both ways; none where avoid(x,z) (a stair along the wall); no corner pier at such a turn.
   o.noLump(x,z): no rock lumps at the foot of the rock face there (a paved garden at its foot).
   o.piers: vertices with a 6 x 6 m pier (H1); every one as the corner-pier pilot of round 4 (the author, 2026-11-15: "统一改"): solid up to the coping,
   its top paved flush with the terrace, the coping and the parapet carried round its outline outside the terrace (pierRing); the walls' coping and parapet
   stop where that parapet meets them. Its two sides: a wall of this terrace; else o.pierX[v] ({d, n, draw}: the ray from the vertex along another terrace's
   wall, its outward normal; draw false: that terrace draws the pier, this one only stops its wall there); else a shared edge (o.shared: the terrace beyond
   it, the pier going along its line on the outer side of the wall) or rock. W.pierSq: the square, its top and its outlines per pier drawn (inPierSq).
   o.band[v]: levels (local) of lower terraces whose walls meet such a pier: their coping's section goes on round the pier's free faces as a string course.
   o.noCorner: vertices with no corner pier at all (the coping and parapet simply turn).
   o.skip: edges with no wall (shared with a higher terrace); o.footY[i]: the edge stands on a lower floor at that level (local), not on the ground;
   o.open(x,z,i,s): 'road' | 'stair' | 'arch' | false for a point on the edge; o.rooms[i]=[s0,s1]: an arcade of rooms in the wall there (B8, arcadeRooms). o.wing=false: no wing walls at the openings (a stair
   with its own cheek walls comes through). o.endV: outline vertices where a run that reaches the corner still ends on a pier (a wall beside an open stair head).
   Records: W.wallFeet (the samples and what breaks the line of the wall foot: read by terraceFeet and __wallFootCheck), W.terraceEdges (the band) and
   W.wallButt ([x, z, tag:edge, 'b3' | 'corner', height] per buttress and corner pier: the counts in palatine-masterplan.md 9). */
function terraceEdge(W,g,P,yTop,o={}){
  const F=o.F,top=F.oy+yTop,yW=top-.35,gy=W.gy,n=P.length,Q=P.map(p=>{const q=F.p(p[0],0,p[1]);return[q[0],q[2]];});let A2=0;
  for(let i=0;i<n;i++){const a=Q[i],b=Q[(i+1)%n];A2+=a[0]*b[1]-b[0]*a[1];}
  const pal=o.pal??hillPal(Q.reduce((s,p)=>s+p[0],0)/n,Q.reduce((s,p)=>s+p[1],0)/n),tag=o.tag||'terrace',E=[],out={edges:E,spurs:[],ends:[]};
  W.wallFeet=W.wallFeet||[];W.terraceEdges=W.terraceEdges||[];const spur=v=>!!(o.spur&&o.spur.includes(((v%n)+n)%n)),TRIM=4.4;   // coping and parapet stop at a half-round tower
  for(let i=0;i<n;i++){const a=Q[i],b=Q[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=A2>0?uz:-uz,nz=A2>0?-ux:ux,
      fl=A2>0,EF=fl?frame(b[0],0,b[1],Math.atan2(uz,-ux)):frame(a[0],0,a[1],Math.atan2(-uz,ux)),X=s=>fl?L-s:s,   // EF: local x along the edge, local z outward, y world
      Wp=(s,d,y)=>[a[0]+ux*s+nx*d,y,a[1]+uz*s+nz*d],e={i,a,b,L,ux,uz,nx,nz,EF,X,Wp,skip:!!(o.skip&&o.skip.includes(i)),S:[],brk:[]};E.push(e);
    if(e.skip)continue;const ns=Math.max(2,Math.round(L/2)),rm=o.rooms&&o.rooms[i];
    for(let k=0;k<=ns;k++){const s=L*k/ns,x=a[0]+ux*s,z=a[1]+uz*s;let gF;
      if(o.footY&&o.footY[i]!=null)gF=F.oy+o.footY[i];else gF=Math.min(gy(x+nx*.5,z+nz*.5),gy(x+nx*1.4,z+nz*1.4));
      e.S.push({s,x,z,gF,h:yW-gF,open:(o.open&&o.open(x,z,i,s))||false,room:!!(rm&&s>rm[0]-.01&&s<rm[1]+.01)});}
    const S=e.S;for(const q of S){q.rk=o.rock&&q.h>9.8?yW-9.5:null;q.gW=q.rk??q.gF;if(q.rk!=null)q.h=yW-q.rk;}   // o.rock (H1, palatine-masterplan.md 2.1): over 9.8 m the masonry stands on the hill's rock, 9.5 m of wall at most
    for(let k=0;k<=ns;k++){let lo=k,hi=k;while(lo>0&&S[lo-1].h>9&&!S[lo-1].open)lo--;while(hi<ns&&S[hi+1].h>9&&!S[hi+1].open)hi++;S[k].sub=!o.rock&&S[k].h>9&&S[hi].s-S[lo].s>=12&&!S[k].room;S[k].bat=S[k].sub||S[k].room?0:.04;}}
  // the piers (o.piers): PR[v], each one's frame (its axes along the sum of its walls' directions), foot and outline, before the walls (their coping and
  // parapet stop at it); none where it would stand less than 1.5 m out of the ground
  const PR={},SH=o.shared||[];
  for(const v of o.piers||[]){const e0=E[(v+n-1)%n],e1=E[v],w0=!e0.skip&&e0.S.length>0,w1=!e1.skip&&e1.S.length>0,X=o.pierX&&o.pierX[v],V=Q[v];if(!w0&&!w1)continue;
    const side=(e,k,w)=>{if(w)return{d:k?[e.ux,e.uz]:[-e.ux,-e.uz],n:[e.nx,e.nz],w:1};if(X)return{d:X.d,n:X.n,w:1};   // k 0: the edge ending at V, 1: the one from it
      if(SH.includes(e.i)){const m=k?e0:e1,s=Math.sign(e.ux*m.nx+e.uz*m.nz)||(k?1:-1);return{d:[e.ux*s,e.uz*s],n:[-e.nx,-e.nz],w:0};}   // shared: along it on the wall's outer side
      return{d:k?[e.ux,e.uz]:[-e.ux,-e.uz],n:[e.nx,e.nz],w:0};},s0=side(e0,0,w0),s1=side(e1,1,w1);   // rock
    let ux=(s1.w?s1.d[0]:0)-(s0.w?s0.d[0]:0),uz=(s1.w?s1.d[1]:0)-(s0.w?s0.d[1]:0);const ul=Math.hypot(ux,uz)||1;ux/=ul;uz/=ul;const C=frame(V[0],0,V[1],Math.atan2(-uz,ux));
    const fY=[w0&&o.footY&&o.footY[e0.i],w1&&o.footY&&o.footY[e1.i]].filter(y=>y!=null&&y!==false);let gF=1e9;
    if(fY.length)gF=F.oy+Math.min(...fY);else for(const[a,b]of[[0,0],[-3,-3],[3,-3],[3,3],[-3,3]]){const q=C.p(a,0,b);gF=Math.min(gF,gy(q[0],q[2]));}
    if(top-gF<1.5)continue;PR[v]={C,gF,w0,w1,s0,s1,ax:[ux,uz],R:pierRing(V,s0,s1,[ux,uz],3,o.pierFill&&o.pierFill[v]),draw:!(X&&X.draw===false)};}
  // two piers at the two ends of one short wall whose outlines overlap (beltS:6 and :0, 6 m apart; the reviewer, 2026-11-15): one joint pier (pierJoint),
  // drawn by the first (the wall's start): both bodies, the notch between their outlines filled, one paving inside the coping round the joint outline and
  // the parapet round that outline only; the wall between them has no coping or parapet of its own (noTop), its neighbours stop at the joint's parapet
  const noTop=new Set();
  for(const b of o.piers||[]){const a=(b+1)%n,Pb=PR[b],Pa=PR[a];if(!Pb||!Pa||!Pb.draw||!Pa.draw||Pb.J||Pa.J||!o.piers.includes(a)||!Pb.w1||!Pa.w0)continue;const e=E[b],rb=Pb.R.ring,ra=Pa.R.ring;
    if(Math.hypot(rb[rb.length-1][0]-Q[b][0],rb[rb.length-1][1]-Q[b][1])+Math.hypot(ra[0][0]-Q[a][0],ra[0][1]-Q[a][1])<=e.L+1e-6)continue;
    const J=pierJoint(Q[b],Q[a],Pb,Pa,e);J.a=a;J.b=b;Pb.J=J;Pa.J=J;Pa.jm=b;Pb.R.t0=J.t0;Pa.R.t1=J.t1;noTop.add(e.i);(W.pierJoints=W.pierJoints||[]).push(tag+':'+b+'+'+a);}
  // any other two piers whose outlines overlap (none on the hill now): each one's parapet stops where it crosses the other's and keeps the part outside
  // the other's outline; the post at the crossing is the first one's (the walls' trims, t0 and t1, are not changed)
  {const D=(o.piers||[]).filter(v=>PR[v]&&PR[v].draw&&!PR[v].J),P0={};for(const v of D){P0[v]=PR[v].R.par;PR[v].R.noPost=[];}
    for(const a of D)for(const b of D){if(a===b)continue;const B=P0[b],Bo=[...PR[b].R.ring,Q[b]];let A=PR[a].R.par,hit=null;
      for(let i=0;i+1<A.length&&!hit;i++)for(let j=0;j+1<B.length&&!hit;j++){const p=A[i],q=A[i+1],r=B[j],d1=[q[0]-p[0],q[1]-p[1]],d2=[B[j+1][0]-r[0],B[j+1][1]-r[1]],cr=d1[0]*d2[1]-d1[1]*d2[0];
        if(Math.abs(cr)<1e-9)continue;const t=((r[0]-p[0])*d2[1]-(r[1]-p[1])*d2[0])/cr,u=((r[0]-p[0])*d1[1]-(r[1]-p[1])*d1[0])/cr;if(t>1e-6&&t<1-1e-6&&u>1e-6&&u<1-1e-6)hit={i,X:[p[0]+d1[0]*t,p[1]+d1[1]*t]};}
      if(!hit)continue;const{i,X}=hit,hd=[...A.slice(0,i+1),X],tl=[X,...A.slice(i+1)],mid=L=>{let s=0;for(let k=1;k<L.length;k++)s+=Math.hypot(L[k][0]-L[k-1][0],L[k][1]-L[k-1][1]);s/=2;
        for(let k=1;k<L.length;k++){const l=Math.hypot(L[k][0]-L[k-1][0],L[k][1]-L[k-1][1]);if(s<=l){const f=s/l;return[L[k-1][0]+(L[k][0]-L[k-1][0])*f,L[k-1][1]+(L[k][1]-L[k-1][1])*f];}s-=l;}return L[L.length-1];};
      PR[a].R.par=inPolyXZ(...mid(hd),Bo)?tl:hd;if(a>b)PR[a].R.noPost.push(X);}}
  const bPos=new Map(),BT=o.butt?Math.cos((o.butt.turn||20)*DEG):2;   // o.butt: the buttresses' places along each edge (s), by runs of walls that turn less than BT
  if(o.butt){const soft=v=>{const e0=E[(v+n-1)%n],e1=E[v];return!e0.skip&&!e1.skip&&e0.ux*e1.ux+e0.uz*e1.uz>BT;},put=(i,s)=>{if(!bPos.has(i))bPos.set(i,[]);bPos.get(i).push(s);};
    for(let v=0;v<n;v++){if(soft(v))continue;const ch=[];let u=v;do{if(E[u].skip)break;ch.push(E[u]);u=(u+1)%n;}while(soft(u)&&u!==v);if(!ch.length)continue;
      const sym=ch.length===1&&o.butt.sym&&o.butt.sym[ch[0].i]!=null?o.butt.sym[ch[0].i]:null,Lc=ch.reduce((a,e)=>a+e.L,0),sp=o.butt.sp;
      if(sym!=null){for(let s=sym;s<Lc-1.5;s+=sp)put(ch[0].i,s);for(let s=sym-sp;s>1.5;s-=sp)put(ch[0].i,s);continue;}
      const nb=Lc<=8?0:Math.max(1,Math.round(Lc/sp));for(let j=0;j<nb;j++){let s=Lc*(j+.5)/nb;for(const e of ch){if(s<=e.L){put(e.i,s);break;}s-=e.L;}}}}
  const bodyAt=(e,k)=>{const q=e.S[k],f=Math.min(q.rk!=null?q.rk:q.gF-1.2,yW);return[f,q.bat*(yW-f)];},M3=!!o.m3;
  for(const e of E){if(e.skip)continue;const S=e.S,ns=S.length-1,{Wp,EF,X,nx,nz}=e,want=[nx,0,nz],seed=.3+.4*teH(e.a[0],e.a[1],1);
    const runs=[];for(let k=0;k<=ns;){if(S[k].open){k++;continue;}let k1=k;while(k1<ns&&!S[k1+1].open)k1++;if(k1>k)runs.push([k,k1]);k=k1+1;}
    e.runs=runs;
    for(const[k0,k1]of runs){const sA=S[k0].s,sB=S[k1].s,cA=k0===0,cB=k1===ns;   // cA/cB: the run reaches the corner of the outline (else it ends at an opening)
      // B1 body, plinth and string courses
      g.set(60,seed,pal,0);for(let k=k0;k<k1;k++){const A=S[k],B=S[k+1];if(A.room&&B.room)continue;if(A.gF>yW-.05&&B.gF>yW-.05)continue;const[fa,ba]=bodyAt(e,k),[fb,bb]=bodyAt(e,k+1);
        g.poly([Wp(A.s,ba,fa),Wp(B.s,bb,fb),Wp(B.s,0,yW),Wp(A.s,0,yW)],want);}
      g.set(60,seed,pal,1);for(let k=k0;k<k1;k++){const A=S[k],B=S[k+1];if(A.h<1.6||B.h<1.6||A.room||B.room)continue;const[fa,ba]=bodyAt(e,k),[fb,bb]=bodyAt(e,k+1),pl=M3?2.4:1,ta=Math.min(A.gW+pl,yW-.6),tb=Math.min(B.gW+pl,yW-.6),oa=A.bat*(yW-ta)+.07,ob=B.bat*(yW-tb)+.07;
        g.poly([Wp(A.s,ba+.07,fa),Wp(B.s,bb+.07,fb),Wp(B.s,ob,tb),Wp(A.s,oa,ta)],want);g.poly([Wp(A.s,oa,ta),Wp(B.s,ob,tb),Wp(B.s,ob-.08,tb),Wp(A.s,oa-.08,ta)],[0,1,0]);}
      trimSet(g,pal,.5);for(let j=1;j<5;j++){const yc=yW-6*j;for(let k=k0;k<k1;k++){const A=S[k],B=S[k+1];if(A.sub||B.sub||A.room||B.room||yc<A.gW+(M3?3:1.5)||yc<B.gW+(M3?3:1.5))continue;const d=A.bat*(yW-yc)+.12,d2=B.bat*(yW-yc)+.12;
        g.poly([Wp(A.s,d,yc),Wp(B.s,d2,yc),Wp(B.s,d2,yc+.3),Wp(A.s,d,yc+.3)],want);g.poly([Wp(A.s,d,yc+.3),Wp(B.s,d2,yc+.3),Wp(B.s,d2-.16,yc+.3),Wp(A.s,d-.16,yc+.3)],[0,1,0]);g.poly([Wp(A.s,d-.16,yc),Wp(B.s,d2-.16,yc),Wp(B.s,d2,yc),Wp(A.s,d,yc)],[0,-1,0]);}}
      if(o.rock){for(let k=k0;k<k1;k++){const A=S[k],B=S[k+1];if(A.rk==null&&B.rk==null)continue;const ra=A.rk??A.gW,rb=B.rk??B.gW,j=t=>.35+.5*teH(e.a[0]+t,e.a[1]-t,21);   // the rock face: battered, its top edge uneven
          g.set(61,.25+.45*teH(A.x,A.z,22),pal,0);g.poly([Wp(A.s,1.1+j(A.s),A.gF-1.2),Wp(B.s,1.1+j(B.s),B.gF-1.2),Wp(B.s,.12,rb+.05),Wp(A.s,.12,ra+.05)],[nx,.35,nz]);
          g.poly([Wp(A.s,.12,ra+.05),Wp(B.s,.12,rb+.05),Wp(B.s,-.1,rb+.05),Wp(A.s,-.1,ra+.05)],[0,1,0]);
          if(k%2===0&&!(o.noLump&&o.noLump(A.x,A.z))){const m=Wp((A.s+B.s)/2,1.2+.6*teH(A.x,A.z,23),0),C=frame(m[0],0,m[2],EF.rot+(teH(A.z,A.x,24)-.5)*.4),hh=Math.min(ra,rb)-Math.min(A.gF,B.gF);
            if(hh>1.2){rockLump(g,C,1.1+.8*teH(A.x,A.z,25),.9+.5*teH(A.x,A.z,26),Math.min(A.gF,B.gF)-.6,Math.min(hh*.7,1.2+2.2*teH(A.x,A.z,27)),pal,teH(A.x,A.z,28),[m[0],m[2]]);(W.palRocks=W.palRocks||[]).push([m[0],m[2],2]);}}}}
      // B2 coping and parapet
      const tA=cA&&spur(e.i)?TRIM:cA&&PR[e.i]?Math.max(0,PR[e.i].R.t1):0,tB=cB&&spur(e.i+1)?TRIM:cB&&PR[(e.i+1)%n]?Math.max(0,PR[(e.i+1)%n].R.t0):0,xa=Math.max(sA-(cA&&!tA?.3:0),tA),xb=Math.min(sB+(cB&&!tB?.3:0),e.L-tB);if(!noTop.has(e.i)){trimSet(g,pal,.45);if(M3)box(g,EF,X((xa+xb)/2),yW,-.2,(xb-xa)/2,.45,.45,31);else box(g,EF,X((xa+xb)/2),yW,-.075,(xb-xa)/2,.45,.375,31);   // M3 (H0): 0.45 m thick, 0.25 m out, 0.9 m deep
      const rail0=(o.rail&&o.rail[e.i])||'pluteus',rail=typeof rail0==='string'?rail0:'pluteus',cut=rail0&&rail0.none||null;   // {none:[s0,s1]}: no parapet there (a model's own balustrade stands on the edge)
      for(let k=k0;k<=k1;){if(top-S[k].gF<.6){k++;continue;}let k2=k;while(k2<k1&&top-S[k2+1].gF>=.6)k2++;const ra0=Math.max(S[k].s-(k===0&&!tA?.3:0),tA),rb0=Math.min(S[k2].s+(k2===ns&&!tB?.3:0),e.L-tB);
        for(const[ra,rb]of cut?[[ra0,Math.min(rb0,cut[0])],[Math.max(ra0,cut[1]),rb0]]:[[ra0,rb0]])if(rb-ra>(cut?.3:1.5)){if(rail==='transenna')transenna(g,EF,X,ra,rb,top+.1,pal,e.brk);
          else if(M3){g.set(60,seed,pal,0);box(g,EF,X((ra+rb)/2),top+.1,-.25,(rb-ra)/2,.9,.3,31);trimSet(g,pal,.5);box(g,EF,X((ra+rb)/2),top+1,-.25,(rb-ra)/2+.03,.1,.34,31);   // M3: a parapet 0.6 m thick and 1.0 m high, ashlar with a travertine cap,
            for(let n=Math.ceil((ra+1.4)/4.5);n*4.5<rb-1.4;n++){g.set(60,seed,pal,0);box(g,EF,X(n*4.5),top+.1,-.25,.45,1.18,.45,15);trimSet(g,pal,.5);box(g,EF,X(n*4.5),top+1.28,-.25,.5,.12,.5,31);}}   // and a pier 0.9 m square every 4.5 m, 0.3 m above it
          else{g.set(60,seed,pal,0);box(g,EF,X((ra+rb)/2),top+.1,-.12,(rb-ra)/2,.88,.2,31);trimSet(g,pal,.5);box(g,EF,X((ra+rb)/2),top+.98,-.12,(rb-ra)/2+.04,.1,.25,31);}}
        k=k2+1;}}   // noTop: the wall inside a joint pier
      // B3 buttresses (or blind arches where the wall is higher than 9 m)
      const Lr=sB-sA,BP=o.butt?(bPos.get(e.i)||[]).filter(s=>(cA?s>=0:s>sA+1.2)&&(cB?s<=e.L:s<sB-1.2)&&!(o.piers&&((o.piers.includes(e.i)&&s<4.2)||(o.piers.includes((e.i+1)%n)&&s>e.L-4.2)))):null,m=BP?BP.length:Math.max(1,Math.round(Lr/7));
      for(let j=0;j<m;j++){const s=BP?BP[j]:sA+Lr*(j+.5)/m,k=Math.min(ns-1,Math.floor(s/(e.L/ns))),t=(s-S[k].s)/(S[k+1].s-S[k].s),gF=lerp(S[k].gW,S[k+1].gW,t),h=yW-gF;
        if(h<=(o.butt?o.butt.min:2.5)||S[k].sub||S[k+1].sub||S[k].room||S[k+1].room)continue;if(o.butt&&o.butt.avoid){const q=Wp(s,.6,0);if(o.butt.avoid(q[0],q[2]))continue;}buttress(g,e,s,S[k].rk!=null?gF:gF-1.2,yW-.12,S[k].bat,pal,seed);e.brk.push(s);
          {const q=Wp(s,0,0);(W.wallButt=W.wallButt||[]).push([q[0],q[2],tag+':'+e.i,'b3',+h.toFixed(1)]);}}
      for(let k=k0;k<=k1;){if(!S[k].sub){k++;continue;}let k2=k;while(k2<k1&&S[k2+1].sub)k2++;const s0=S[k].s,s1=S[k2].s;
        if(s1-s0>=12){const SS=EF.sub(X((s0+s1)/2),0,0,0),nb=Math.max(1,Math.round((s1-s0)/7));substructure(W,g,SS,s1-s0,yW,0,1,{pil:60,sty:pal,bay:7});for(let j=0;j<=nb;j++)e.brk.push(s0+(s1-s0)*j/nb);}k=k2+1;}
      // B8 rooms in the wall
      if(o.rooms&&o.rooms[e.i]){const[r0,r1]=o.rooms[e.i];arcadeRooms(W,g,e,Math.max(r0,sA),Math.min(r1,sB),S[k0].gF,yW,pal,o.roomOpt||{});}
      // B5 ends at the openings: a pier with a statue or a tripod, a stepped wing wall back into the slope
      for(const[end,k,dir]of[[!cA||(o.endV&&o.endV.includes(e.i)),k0,1],[!cB||(o.endV&&o.endV.includes((e.i+1)%n)),k1,-1]]){if(!end)continue;const q=S[k],kind=S[k-dir]&&S[k-dir].open;if(kind==='arch')continue;const s=q.s+dir*.45;endPier(W,g,e,s,q.rk!=null?q.rk+1.2:q.gF,top,pal,seed,kind);e.brk.push(q.s);out.ends.push([q.x,q.z]);
        if(o.wing!==false&&top-q.gF>1.5)wingWall(W,g,e,s,top,pal,seed);}}
    W.wallFeet.push({tag:tag+':'+e.i,pal,ax:e.a[0],az:e.a[1],ux:e.ux,uz:e.uz,nx,nz,L:e.L,top,S:S.map(q=>({s:q.s,x:q.x,z:q.z,y:q.gF,h:top+.1-q.gF,open:q.open,sub:q.sub,room:q.room})),brk:e.brk});
    const rl=(o.rail&&o.rail[e.i])==='transenna'?1.12:1.08;let band=9;for(const q of S)if(!q.open&&top-q.gF>=.6)band=Math.min(band,.45+rl);W.terraceEdges.push({tag:tag+':'+e.i,L:+e.L.toFixed(1),band:band<9?band:null,maxH:+Math.max(0,...S.map(q=>q.h)).toFixed(1)});}   // band: the edge seen from below, coping + parapet (or the grille piers)
  // corners: a pier where two walls meet at an outer corner, a half-round projection at the rock spurs
  for(let v=0;v<n;v++){const e0=E[(v+n-1)%n],e1=E[v];if(e0.skip||e1.skip)continue;const q0=e0.S[e0.S.length-1],q1=e1.S[0];if(q0.open||q1.open)continue;
    const cr=e0.ux*e1.uz-e0.uz*e1.ux;if(cr*(A2>0?1:-1)<=0)continue;const gF=Math.min(q0.gF,q1.gF);if(top-gF<.6)continue;let bx=e0.nx+e1.nx,bz=e0.nz+e1.nz;const bl=Math.hypot(bx,bz)||1;bx/=bl;bz/=bl;
    const[vx,vz]=Q[v],sp=o.spur&&o.spur.includes(v);if(o.piers&&o.piers.includes(v))continue;if(o.noCorner&&o.noCorner.includes(v))continue;if(o.butt&&e0.ux*e1.ux+e0.uz*e1.uz>BT)continue;   // o.butt: a curve's facets meet with no pier
    if(sp){out.spurs.push(spurTower(W,g,vx,vz,bx,bz,gF,top,pal,Q));e0.brk.push(e0.L);e1.brk.push(0);continue;}
    const C=frame(vx+bx*.3,0,vz+bz*.3,Math.atan2(bx,bz));(W.wallPiers=W.wallPiers||[]).push([vx+bx*.3,vz+bz*.3,.85]);(W.wallButt=W.wallButt||[]).push([vx,vz,tag+':'+v,'corner',+(top-gF).toFixed(1)]);g.set(60,.5,pal,1);box(g,C,0,gF-1.2,0,.85,top+1.2-gF+1.2,.85,31&~32);trimSet(g,pal,.5);box(g,C,0,top+1.2,0,.95,.18,.95,31);e0.brk.push(e0.L);e1.brk.push(0);}
  // H1 (palatine-masterplan.md 2.2): a square pier about 6 x 6 m at each turn of the wall line and where a wall ends on rock or a grade or shared edge; as the
  // corner-pier pilot of round 4, every one (the author, 2026-11-15): solid to the coping, its top the terrace's paving, the parapet round its outer outline
  for(const v of o.piers||[]){const Pp=PR[v];if(!Pp||!Pp.draw)continue;const{C,gF,w0,w1,J}=Pp,R=J||Pp.R,e0=E[(v+n-1)%n],e1=E[v],[vx,vz]=Q[v],rk=o.rock&&top-gF>9.8?top-9.5:null,seed=.3+.4*teH(vx,vz,1);
    if(rk!=null){g.set(61,.4,pal,0);box(g,C,0,gF-1.2,0,3.5,rk-gF+1.2,3.5,31&~32);const nb=w1?e1:e0;rockLump(g,frame(vx+nb.nx*3,0,vz+nb.nz*3,C.rot+.5),1.6,1.2,gF-.8,Math.min(2.6,rk-gF),pal,.6,[vx,vz]);}
    const[rx,rz]=J?J.M:[vx,vz],seg=(P,Q)=>{const dx=Q[0]-P[0],dz=Q[1]-P[1],L=Math.hypot(dx,dz),zo=(-dz*(P[0]+Q[0]-2*rx)+dx*(P[1]+Q[1]-2*rz))>0?1:-1;return{F:frame((P[0]+Q[0])/2,0,(P[1]+Q[1])/2,Math.atan2(-dz,dx)),L,zo};};   // zo: the sign of the frame's z out of the pier (a joint pier: out of the middle of its wall)
    const f1=rk??Math.min(gF-1.2,...Pp.R.ring.map(p=>gy(p[0],p[1])-1.2));   // its foot: on the rock base; else the walls' (footY) or the lowest ground under its outer outline, where the terrace below is cut back (v30n's corner, on footN)
    g.set(60,seed,pal,1);box(g,C,0,f1,0,3.06,Math.min(2.4,yW-f1),3.06,31&~32);if(yW>f1+2.4){g.set(60,seed,pal,0);box(g,C,0,f1+2.4,0,3,yW-(f1+2.4),3,31&~32);}   // the body up to the coping's foot
    if(R.fill&&Pp.jm==null)for(const T of R.fill){const fF=rk??Math.min(f1,...T.map(p=>gy(p[0],p[1])-1.2)),on=(p,q)=>R.ring.some((r,k)=>k+1<R.ring.length&&Math.hypot(r[0]-p[0],r[1]-p[1])<1e-6&&Math.hypot(R.ring[k+1][0]-q[0],R.ring[k+1][1]-q[1])<1e-6);   // fill: the body carried out to the outline
      for(let k=0;k<T.length;k++){const p=T[k],q=T[(k+1)%T.length];if(!on(p,q))continue;const dx=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(dx,dz);let nx=dz/l,nz=-dx/l;if((p[0]+q[0]-2*rx)*nx+(p[1]+q[1]-2*rz)*nz<0){nx=-nx;nz=-nz;}   // its faces on the outline only
        const y2=Math.min(fF+2.4,yW),P6=(r,d,y)=>[r[0]+nx*d,y,r[1]+nz*d];g.set(60,seed,pal,1);g.poly([P6(p,.06,fF),P6(q,.06,fF),P6(q,.06,y2),P6(p,.06,y2)],[nx,0,nz]);g.poly([P6(p,.06,y2),P6(q,.06,y2),P6(q,0,y2),P6(p,0,y2)],[0,1,0]);
        if(yW>y2){g.set(60,seed,pal,0);g.poly([P6(p,0,y2),P6(q,0,y2),P6(q,0,yW),P6(p,0,yW)],[nx,0,nz]);}}}
    if(Pp.jm!=null){(W.wallPiers=W.wallPiers||[]).push([vx,vz,3.2]);(W.pierSq=W.pierSq||[]).push({x:vx,z:vz,ux:Pp.ax[0],uz:Pp.ax[1],h:3.06,top,tag:tag+':'+v,ring:R.ring,par:R.par,pave:R.pave,band:[],joint:tag+':'+Pp.jm});   // a joint pier's second: its body only
      if(w0)e0.brk.push(e0.L);if(w1)e1.brk.push(0);continue;}
    const BD=J?[...new Set([...(o.band&&o.band[J.b])||[],...(o.band&&o.band[J.a])||[]])].sort((a,b)=>b-a):(o.band&&o.band[v])||[];    trimSet(g,pal,.45);for(let k=0;k+1<R.ring.length;k++){const{F:SF,L,zo}=seg(R.ring[k],R.ring[k+1]),ea=k?.25:R.ext[0],eb=k+2<R.ring.length?.25:R.ext[1];box(g,SF,(eb-ea)/2,yW,-.2*zo,L/2+(ea+eb)/2,.45,.45,31);}   // the coping round the outer edge, as the walls' (0.25 m out, 0.9 m deep), on into theirs
    for(const yb of BD){const yB=F.oy+yb-.35;trimSet(g,pal,.45);   // o.band: a string course at a lower terrace's coping, the same section, round the faces that stand free below it
      for(let k=0;k+1<R.ring.length;k++){const{F:SF,L,zo}=seg(R.ring[k],R.ring[k+1]),N=Math.max(1,Math.ceil(L/.25)),fr=[];
        for(let j=0;j<=N;j++){const q=SF.p(-L/2+L*j/N,0,.6*zo);fr.push(gy(q[0],q[2])<yB-.5);}   // free: the ground 0.6 m out more than 0.5 m under it (on the lower terrace's floor it is not)
        for(let j=0;j<=N;){if(!fr[j]){j++;continue;}let j1=j;while(j1<N&&fr[j1+1])j1++;const s0=-L/2+L*j/N-(j===0?.25:.3),s1=-L/2+L*j1/N+(j1===N?.25:.3);   // mitred at the ring's turns, on into the lower coping where its walls meet the pier
          if(s1-s0>.6)box(g,SF,(s0+s1)/2,yB,-.2*zo,(s1-s0)/2,.45,.45,31);j=j1+1;}}}
    g.set(60,.4,pal,3);const PV=R.pave,ix=THREE.ShapeUtils.triangulateShape(PV.map(p=>new THREE.Vector2(p[0],p[1])),[]);for(const[i,j,k]of ix)g.poly([i,j,k].map(m=>[PV[m][0],top+.09,PV[m][1]]),[0,1,0]);   // the top: the terrace's paving
    for(let k=0;k+1<R.par.length;k++){const{F:SF,L}=seg(R.par[k],R.par[k+1]);g.set(60,seed,pal,0);box(g,SF,0,top+.1,0,L/2+.3,.9,.3,31);trimSet(g,pal,.5);box(g,SF,0,top+1,0,L/2+.33,.1,.34,31);}   // the parapet (M3), mitred
    for(let k=0;k<R.par.length;k++){const M=R.par[k];if(R.noPost.some(p=>Math.hypot(p[0]-M[0],p[1]-M[1])<1e-6))continue;const{F:SF}=seg(R.par[Math.max(0,k-1)],R.par[Math.max(1,k)]),PF=frame(M[0],0,M[1],SF.rot);g.set(60,seed,pal,0);box(g,PF,0,top+.1,0,.45,1.18,.45,15);trimSet(g,pal,.5);box(g,PF,0,top+1.28,0,.5,.12,.5,31);}   // a parapet pier at each turn and end
    (W.wallPiers=W.wallPiers||[]).push([vx,vz,3.2]);(W.pierSq=W.pierSq||[]).push({x:vx,z:vz,ux:Pp.ax[0],uz:Pp.ax[1],h:3.06,top,tag:tag+':'+v,ring:R.ring,par:R.par,pave:R.pave,band:BD,fill:R.fill||null,joint:J?tag+':'+J.a:null});
    if(w0)e0.brk.push(e0.L);if(w1)e1.brk.push(0);}
  for(const v of o.piers||[]){const Pp=PR[v];if(Pp&&!Pp.draw){if(Pp.w0)E[(v+n-1)%n].brk.push(E[(v+n-1)%n].L);if(Pp.w1)E[v].brk.push(0);}}   // another terrace's pier stands there
  return out;}
// the outline of the 6 x 6 m pier at vertex V outside the terrace (half size h, axes ax and across it), between its sides s0 and s1 ({d: the side's ray from
// V, n: its normal into the pier, w: a wall, whose coping and parapet meet the pier's; or not: rock, or the face of the terrace beyond a shared edge, where
// the pier's parapet, coping and paving stop on its line}), swept from s0's ray towards its normal: from where it leaves s0 (A) by the square's corners to
// where it meets s1 (B). par: the parapet's mitred line 0.25 m in from it and on along the walls' parapets (where those stop: t0 out along s0, t1 along s1);
// pave: the top inside the coping (0.66 m in, and on the walls' side to where the terrace's paved band starts), closed at its corner inside V; ext: how far
// the coping goes on past A and B (into a wall's)
function pierRing(V,s0,s1,ax,h,mid){const ux=ax[0],uz=ax[1],wx=-uz,wz=ux,ex=d=>h/Math.max(Math.abs(d[0]*ux+d[1]*uz),Math.abs(d[0]*wx+d[1]*wz)),
    ta=ex(s0.d),tb=ex(s1.d),A=[V[0]+s0.d[0]*ta,V[1]+s0.d[1]*ta],B=[V[0]+s1.d[0]*tb,V[1]+s1.d[1]*tb],sg=Math.sign(s0.d[0]*s0.n[1]-s0.d[1]*s0.n[0])||1,
    ang=p=>{const dx=p[0]-V[0],dz=p[1]-V[1];let a=Math.atan2((s0.d[0]*dz-s0.d[1]*dx)*sg,s0.d[0]*dx+s0.d[1]*dz);return a<0?a+2*Math.PI:a;},aB=ang(B),
    far=p=>Math.hypot(p[0]-A[0],p[1]-A[1])>.05&&Math.hypot(p[0]-B[0],p[1]-B[1])>.05,
    cs=[[1,1],[1,-1],[-1,-1],[-1,1]].map(([a,b])=>[V[0]+(ux*a+wx*b)*h,V[1]+(uz*a+wz*b)*h]).filter(p=>far(p)&&ang(p)>.01&&ang(p)<aB-.01).sort((p,q)=>ang(p)-ang(q)),fm=!!(mid&&mid.length&&!cs.length),ring=fm?[A,...mid,B]:[A,...cs,B];   // mid (o.pierFill): a concave pier's outline carried out (fill: the body there)
  const off=s=>s.w?[.25,.66]:[0,0],L=[{p:V,t:s0.d,n:s0.n,o:off(s0)}];
  for(let k=0;k+1<ring.length;k++){const P=ring[k],Q=ring[k+1],l=Math.hypot(Q[0]-P[0],Q[1]-P[1]),t=[(Q[0]-P[0])/l,(Q[1]-P[1])/l];let nn=[t[1],-t[0]];
    if((P[0]+Q[0]-2*V[0])*nn[0]+(P[1]+Q[1]-2*V[1])*nn[1]<0)nn=[-nn[0],-nn[1]];L.push({p:P,t,n:nn,o:[.25,.66]});}
  L.push({p:V,t:s1.d,n:s1.n,o:off(s1)});
  const cut=pierCut,mit=j=>L.slice(0,-1).map((a,k)=>cut(a,L[k+1],j)),par=mit(0),cl=cut(L[L.length-1],L[0],1),pave=cl?[...mit(1),cl]:mit(1);   // cl: none where the two sides are in line
  return{ring,par,pave,fill:fm?[mid]:null,ext:[s0.w?.25:0,s1.w?.25:0],t0:(par[0][0]-V[0])*s0.d[0]+(par[0][1]-V[1])*s0.d[1],t1:(par[par.length-1][0]-V[0])*s1.d[0]+(par[par.length-1][1]-V[1])*s1.d[1]};}
// where two of a pier's lines ({p, t: along, n: into the pier, o: [parapet, paving] offsets, away from n}) cross, offset by o[j]; null if parallel
function pierCut(a,b,j){const da=a.o[j],db=b.o[j],pa=[a.p[0]-a.n[0]*da,a.p[1]-a.n[1]*da],pb=[b.p[0]-b.n[0]*db,b.p[1]-b.n[1]*db],cr=a.t[0]*b.t[1]-a.t[1]*b.t[0];
  if(Math.abs(cr)<1e-6)return null;const s=((pb[0]-pa[0])*b.t[1]-(pb[1]-pa[1])*b.t[0])/cr;return[pa[0]+a.t[0]*s,pa[1]+a.t[1]*s];}
// the joint outline of two piers whose outlines overlap at the two ends of wall e (Pb at its start Vb, Pa at its end Va): Pb's outline to its last corner,
// on to Pa's first (the faces on the wall's line dropped), the notch between them filled (fill: the triangle between Pb's last face, Pa's first and where
// their lines cross); par and pave as pierRing's round it from Pb's s0 to Pa's s1, the paving closed along the wall's line 0.66 m in (the walls' paved band)
function pierJoint(Vb,Va,Pb,Pa,e){const M=[(Vb[0]+Va[0])/2,(Vb[1]+Va[1])/2],rb=Pb.R.ring,ra=Pa.R.ring,ring=[...rb.slice(0,-1),...ra.slice(1)],off=s=>s.w?[.25,.66]:[0,0],
    L=[{p:Vb,t:Pb.s0.d,n:Pb.s0.n,o:off(Pb.s0)}];
  for(let k=0;k+1<ring.length;k++){const P=ring[k],Q=ring[k+1],l=Math.hypot(Q[0]-P[0],Q[1]-P[1]),t=[(Q[0]-P[0])/l,(Q[1]-P[1])/l];let nn=[t[1],-t[0]];
    if((P[0]+Q[0]-2*M[0])*nn[0]+(P[1]+Q[1]-2*M[1])*nn[1]<0)nn=[-nn[0],-nn[1]];L.push({p:P,t,n:nn,o:[.25,.66]});}
  L.push({p:Va,t:Pa.s1.d,n:Pa.s1.n,o:off(Pa.s1)});
  const sh={p:Vb,t:[e.ux,e.uz],n:[e.nx,e.nz],o:[.25,.66]},LP=[...L,sh],par=L.slice(0,-1).map((a,k)=>pierCut(a,L[k+1],0)),pave=[...LP.slice(0,-1).map((a,k)=>pierCut(a,LP[k+1],1)),pierCut(sh,L[0],1)];
  const P0=rb[rb.length-2],P1=rb[rb.length-1],A0=ra[0],A1=ra[1],d1=[P1[0]-P0[0],P1[1]-P0[1]],d2=[A1[0]-A0[0],A1[1]-A0[1]],cr=d1[0]*d2[1]-d1[1]*d2[0];let fill=null;
  if(Math.abs(cr)>1e-9){const t=((A0[0]-P0[0])*d2[1]-(A0[1]-P0[1])*d2[0])/cr;fill=[[P0,[P0[0]+d1[0]*t,P0[1]+d1[1]*t],A1]];}
  return{ring,par,pave,M,fill,noPost:[],ext:[Pb.s0.w?.25:0,Pa.s1.w?.25:0],t0:(par[0][0]-Vb[0])*Pb.s0.d[0]+(par[0][1]-Vb[1])*Pb.s0.d[1],
    t1:(par[par.length-1][0]-Va[0])*Pa.s1.d[0]+(par[par.length-1][1]-Va[1])*Pa.s1.d[1]};}
// the pier (W.pierSq) whose square, or the body it has out past the square (fill), world point (x, z) is in, within pad m, or null
function inPierSq(W,x,z,pad=0){for(const q of W.pierSq||[]){const dx=x-q.x,dz=z-q.z;if(Math.abs(dx*q.ux+dz*q.uz)<q.h+pad&&Math.abs(-dx*q.uz+dz*q.ux)<q.h+pad)return q;
    if(q.fill)for(const T of q.fill)if(inPolyXZ(x,z,T)||(pad>0&&nearPoly(x,z,[...T,T[0]],pad)))return q;}return null;}   // fill: where its body goes out past the square
// B3: a square buttress at s along edge e, from y0 (under the ground) to y1 under the coping: 1.2 m wide and 0.6 m deep at the foot, 0.84 x 0.32 at the top, the top weathered
function buttress(g,e,s,y0,y1,bat,pal,seed){const{Wp}=e,face=y=>bat*(y1+.12-y),w0=.6,w1=.42,p0=.6,p1=.32,yc=y1-.55;g.set(60,seed,pal,1);
  const P=(sd,y,d)=>Wp(s+sd,d,y),fA=face(y0),fC=face(yc);
  g.poly([P(-w0,y0,fA+p0),P(w0,y0,fA+p0),P(w1,yc,fC+p1),P(-w1,yc,fC+p1)],[e.nx,0,e.nz]);
  for(const sd of[-1,1])g.poly([P(sd*w0,y0,fA-.05),P(sd*w0,y0,fA+p0),P(sd*w1,yc,fC+p1),P(sd*w1,y1,face(y1)-.05)],[e.ux*sd,0,e.uz*sd]);
  g.poly([P(-w1,yc,fC+p1),P(w1,yc,fC+p1),P(w1,y1,face(y1)-.05),P(-w1,y1,face(y1)-.05)],[e.nx,1,e.nz]);}
// B2: piers every ~2.4 m and stone grilles (transenna) between them, along edge frame EF from s ra to rb, base y
function transenna(g,EF,X,ra,rb,y,pal,brk){const nb=Math.max(1,Math.round((rb-ra)/2.4)),bw=(rb-ra)/nb;
  for(let j=0;j<=nb;j++){const s=ra+j*bw;trimSet(g,pal,.5);box(g,EF,X(s),y,-.12,.2,1.02,.2,31);box(g,EF,X(s),y+1.02,-.12,.25,.1,.25,31);}
  g.set(6,.45);for(let j=0;j<nb;j++){const c=ra+(j+.5)*bw,hw=bw/2-.2;box(g,EF,X(c),y,-.12,hw,.14,.09,31);box(g,EF,X(c),y+.84,-.12,hw,.1,.09,31);
    const nv=Math.max(2,Math.round(hw*2/.32));for(let v=1;v<nv;v++)box(g,EF,X(c-hw+v*hw*2/nv),y+.14,-.12,.03,.7,.06,31);box(g,EF,X(c),y+.47,-.12,hw,.04,.06,31);}}
// B5: the pier at the end of a wall by an opening, with a statue or a bronze tripod on it (the author, 2026-11-04)
function endPier(W,g,e,s,gF,top,pal,seed,kind){const{EF,X}=e;{const q=e.Wp(s,-.1,0);(W.wallPiers=W.wallPiers||[]).push([q[0],q[2],.7]);}g.set(60,seed,pal,1);box(g,EF,X(s),gF-1.2,-.1,.7,top+1.3-gF+1.2,.7,31&~32);trimSet(g,pal,.5);box(g,EF,X(s),top+1.3,-.1,.8,.16,.8,31);
  const q=e.Wp(s,-.1,0);if(teH(q[0],q[2],5)<.5)pedestalStatue(g,frame(q[0],0,q[2],EF.rot),0,0,top+1.46,2.6,{gilt:teH(q[0],q[2],6)<.4});else tripod(g,frame(q[0],0,q[2],EF.rot),0,0,top+1.46,1.25);}
// B5: a wing wall from the end pier back into the slope, along the outward normal, its top stepping down 1.5 m at a time
function wingWall(W,g,e,s,top,pal,seed){const p0=e.Wp(s,0,0),C=frame(p0[0],0,p0[2],Math.atan2(e.nx,e.nz)),gy=W.gy,Lw=7;let yPrev=top+.1;
  for(let d=.7;d<Lw;d+=1.5){const q=C.p(0,0,d+.75),g0=gy(q[0],q[2]),yT=Math.max(g0+.8,Math.min(yPrev,lerp(top+.1,g0+.8,(d+.75)/Lw)));if(yT-g0<.75)break;
    g.set(60,seed,pal,0);box(g,C,0,g0-1,d+.75,.3,yT-g0+1,.75,31&~32);trimSet(g,pal,.5);box(g,C,0,yT,d+.75,.36,.12,.8,31);yPrev=yT-.01;}}
// B4: a half-round projection at a rock-spur corner (a reconstruction): diameter 8 m, its own coping and parapet 0.8 m above the wall's, four steps up from the terrace
function spurTower(W,g,vx,vz,bx,bz,gF,top,pal,Q){const R=4,cx=vx+bx*R*.45,cz=vz+bz*R*.45,F0=frame(cx,0,cz,0),gy=W.gy;let yb=gF;for(let k=0;k<12;k++){const a=k/12*TAU;yb=Math.min(yb,gy(cx+Math.cos(a)*(R+.6),cz+Math.sin(a)*(R+.6)));}
  const yD=top+.9;g.set(60,.55,pal,0);lathe(g,F0,0,yb-1.2,0,[[R,0],[R,yD-.45-(yb-1.2)]],28);trimSet(g,pal,.5);lathe(g,F0,0,yD-.45,0,[[R,0],[R+.3,0],[R+.3,.45],[R-.4,.45]],28);g.set(49,.4);lathe(g,F0,0,yD,0,[[R-.4,0],[0,0]],28);
  g.set(60,.55,pal,1);lathe(g,F0,0,yb-1.2,0,[[R+.08,0],[R+.08,Math.min(1.2+1,yD-.6-(yb-1.2))],[R,Math.min(1.2+1.08,yD-.5-(yb-1.2))]],28);   // the plinth course
  const nS=20;for(let k=0;k<nS;k++){const a=(k+.5)/nS*TAU,px=cx+Math.cos(a)*(R-.2),pz=cz+Math.sin(a)*(R-.2);if(inPolyXZ(px-Math.cos(a)*.6,pz-Math.sin(a)*.6,Q)&&inPolyXZ(px+Math.cos(a)*.3,pz+Math.sin(a)*.3,Q))continue;
    if(Math.cos(a)*-bx+Math.sin(a)*-bz>.55)continue;const S=frame(px,0,pz,Math.atan2(Math.cos(a),Math.sin(a))),hl=Math.PI*(R-.2)/nS+.04;g.set(60,.55,pal,0);box(g,S,0,yD,0,hl,.88,.2,31);trimSet(g,pal,.5);box(g,S,0,yD+.88,0,hl+.03,.1,.25,31);}
  const S=frame(cx-bx*(R-.3),0,cz-bz*(R-.3),Math.atan2(-bx,-bz));trimSet(g,pal,.5);for(let k=0;k<4;k++)box(g,S,0,top+.1,.2+k*.38,1.2,.2*(4-k),.19,31);
  return{x:cx,z:cz,y:yD,R};}
/* B8: a row of rooms in a wall (the Tabularium's way, a reconstruction): open arches with dark rooms 4 m deep behind them, an awning over each and a stall
   in front, on edge e from s0 to s1; the wall there is built with real openings (arcade()). Where the wall is 10.5 m or higher a gallery with half-columns
   goes above the rooms. y0: the floor in front, yW: under the coping. */
function arcadeRooms(W,g,e,s0,s1,y0,yW,pal,o){const{EF,X}=e,len=s1-s0,h=yW-y0,nA=Math.max(2,Math.round(len/(o.bay||5.2))),bay=len/nA,hs=h>=10.5?Math.min(5.4,h*.48):h,cx=X((s0+s1)/2),
    span=o.span||.3,r=bay*span,spring=Math.max(1.8,Math.min(hs-r-1.2,2.6));
  arcade(g,EF,cx,y0,-.35,len,hs,nA,.7,60,{span,spring,attic:hs-spring-r,sty:pal,seed:.5,cornice:false,pilasters:true});
  if(hs<h-.2){g.set(60,.5,pal,0);box(g,EF,cx,y0+hs,-.35,len/2,.55,.38,1|16);arcade(g,EF,cx,y0+hs+.55,-.5,len,h-hs-.55,nA,.5,60,{span:.33,spring:Math.max(.9,(h-hs-.55)*.3),sty:pal,seed:.5,cornice:false,pilasters:false});
    for(let i=0;i<=nA;i++){const q=EF.p(X(s0+i*bay),y0+hs+.55,-.05);W.cols.dor.push([q[0],q[1],q[2],EF.rot,h-hs-1.1,[.93,.9,.84]]);}}   // half-columns: Doric columns set into the wall face
  for(let i=0;i<nA;i++){const x=X(s0+(i+.5)*bay),D=4,yt=y0+spring+r,dk=(p,want)=>g.poly(p,want);g.set(38,.5);
    dk([EF.p(x-r,y0,-.7-D),EF.p(x+r,y0,-.7-D),EF.p(x+r,yt,-.7-D),EF.p(x-r,yt,-.7-D)],EF.d(0,0,1));dk([EF.p(x-r,y0,-.7),EF.p(x-r,y0,-.7-D),EF.p(x-r,yt,-.7-D),EF.p(x-r,yt,-.7)],EF.d(1,0,0));
    dk([EF.p(x+r,y0,-.7-D),EF.p(x+r,y0,-.7),EF.p(x+r,yt,-.7),EF.p(x+r,yt,-.7-D)],EF.d(-1,0,0));dk([EF.p(x-r,yt,-.7),EF.p(x-r,yt,-.7-D),EF.p(x+r,yt,-.7-D),EF.p(x+r,yt,-.7)],[0,-1,0]);
    g.set(11,.4);dk([EF.p(x-r,y0+.02,-.7-D),EF.p(x-r,y0+.02,0),EF.p(x+r,y0+.02,0),EF.p(x+r,y0+.02,-.7-D)],[0,1,0]);
    const q=EF.p(x,0,0),hh=teH(q[0],q[2],7);g.set(35,hh);const ya=y0+spring+r+.25;dk([EF.p(x-r-.2,ya,0),EF.p(x+r+.2,ya,0),EF.p(x+r+.2,ya-.55,1.7),EF.p(x-r-.2,ya-.55,1.7)],[0,1,0]);   // awning
    g.set(3,.4);for(const sd of[-1,1])box(g,EF,x+sd*(r+.1),y0,1.6,.04,ya-.55-y0,.04,31);
    if(hh<.75){g.set(3,.5);box(g,EF,x,y0,1.05,r*.8,.85,.4,31);g.set(hh<.4?35:13,hh*7%1);box(g,EF,x-r*.35,y0+.85,1.05,r*.25,.18,.3,31);box(g,EF,x+r*.3,y0+.85,1.1,r*.22,.25,.25,31);}}   // a stall: a table with goods
  e.brk.push(...Array.from({length:nA+1},(_,i)=>s0+i*bay));}
/* B7: a stair along a wall. path: world points the stair's middle line follows down from the top (y0, world); risers 0.2 m, treads 0.38 m, equal flights of at most
   15 steps between landings, and a landing at each turn; side: +1/-1 = the outer side (right/left of the walking direction) gets a parapet, the inner side leans on the wall. The steps are
   solid blocks of wall stone down to the ground with travertine treads; a pier with a tripod or a statue at the foot of the parapet. Ends where it meets the ground.
   Two of them running down from one landing in opposite directions make the paired flights that meet at the upper door (【史】the two great ramps of the
   sanctuary of Fortuna at Praeneste climb from both sides to its axis). */
function edgeStair(W,g,path,y0,o={}){const w=o.w||2.6,side=o.side||1,pal=o.pal??hillPal(path[0][0],path[0][1]),gy=o.floorY!=null?()=>o.floorY:W.gy,cum=[0];   // o.floorY: it lands on a floor at that level (not the ground)
for(let i=1;i<path.length;i++)cum.push(cum[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
  const Ltot=cum[cum.length-1],at=s=>{let i=1;while(i<path.length-1&&cum[i]<s)i++;const t=clamp((s-cum[i-1])/(cum[i]-cum[i-1]),0,1),dx=(path[i][0]-path[i-1][0])/(cum[i]-cum[i-1]),dz=(path[i][1]-path[i-1][1])/(cum[i]-cum[i-1]);return{x:lerp(path[i-1][0],path[i][0],t),z:lerp(path[i-1][1],path[i][1],t),dx,dz,seg:i};};
  const pts=[];
  const block=(s,len,yt,landing)=>{const p=at(s+len/2),S=frame(p.x,0,p.z,Math.atan2(-p.dz,p.dx));let yg=1e9;for(const a of[-len/2,len/2])for(const b of[-w/2,w/2]){const q=S.p(a,0,b);yg=Math.min(yg,gy(q[0],q[2]));}   // frame: local x = walking direction, local z = left
    let zc=0,hz=w/2;if(o.ex>0){const d=S.d(0,0,1),sz=d[0]*o.wall[0]+d[2]*o.wall[1]>0?1:-1;zc=sz*o.ex/2;hz=w/2+o.ex/2;}   // o.wall, o.ex: R11, the treads and their base reach o.ex further that way, to the wall the flight runs along
    g.set(60,.5,pal,0);box(g,S,0,yg-.8,zc,len/2+.01,yt-.12-yg+.8,hz,31&~32);trimSet(g,pal,.45);box(g,S,0,yt-.12,zc,len/2+.03,.12,hz+.03,31);
    const zs=-side*(w/2+.18);g.set(60,.5,pal,0);box(g,S,0,yt,zs,len/2+.01,landing?1.0:.95,.18,31);trimSet(g,pal,.5);box(g,S,0,yt+(landing?1.0:.95),zs,len/2+.03,.08,.22,31);pts.push([p.x,p.z]);return S;};
  // B7: a landing every 12-15 steps, spread evenly: a dry run counts the steps, then the run is cut into equal flights of at most 15 (and at each turn)
  const march=(per,mk)=>{let s=o.s0||0,y=y0,nSt=0,inFl=0,lastSeg=1,nL=0;
    while(s<Ltot-.2&&nSt<400){const p=at(s),turn=p.seg!==lastSeg;lastSeg=p.seg;if(y<=gy(p.x,p.z)+.22)break;
      if(turn||inFl>=per){if(mk)block(s,1.5,y,true);s+=1.5;inFl=0;nL++;continue;}
      y-=.2;if(mk)block(s,.38,y,false);s+=.38;nSt++;inFl++;}
    return{s,y,nSt,nL};};
  const n0=march(15,false).nSt,{s,y,nSt,nL}=march(Math.max(1,Math.ceil(n0/Math.max(1,Math.ceil(n0/15)))),true);
  const p=at(Math.min(s,Ltot)),S=frame(p.x,0,p.z,Math.atan2(-p.dz,p.dx)),q=S.p(.2,0,-side*(w/2+.18)),yg=gy(q[0],q[2]);
  g.set(60,.5,pal,1);box(g,S,.2,yg-.6,-side*(w/2+.18),.35,Math.max(y,yg)+1.25-yg+.6,.35,31&~32);trimSet(g,pal,.5);box(g,S,.2,Math.max(y,yg)+1.25,-side*(w/2+.18),.42,.12,.42,31);
  if(teH(q[0],q[2],3)<.55)tripod(g,frame(q[0],0,q[2],S.rot),0,0,Math.max(y,yg)+1.37,1.2);else pedestalStatue(g,frame(q[0],0,q[2],S.rot),0,0,Math.max(y,yg)+1.37,2.4,{gilt:false});
  for(let i=0;i<pts.length;i+=3)W.foot.addCircle(pts[i][0],pts[i][1],w/2+.8,'road');
  W.stairFeet=W.stairFeet||[];W.stairFeet.push({x:p.x,z:p.z,dx:p.dx,dz:p.dz});(W.edgeStairs=W.edgeStairs||[]).push({steps:nSt,landings:nL,top:+y0.toFixed(2),bottom:+y.toFixed(2),len:+s.toFixed(1)});
  return{steps:nSt,landings:nL,end:[p.x,p.z],y,pts};}
/* B6: the wall feet, planted once the streets exist (call after buildStreets): where the wall stands 1.5 m or more out of the ground, rock blocks and ledges
   of the hill's rock of uneven height against it, a band of moss and grass 0.5-1 m wide, shrubs, a cypress every 6-8 m along the long walls (3 m or higher),
   and a scatter of stones further down the slope. Nothing on streets, roads or other footprints. Each block, shrub and tree is a break in the line where
   the wall meets the ground (rec.brk, read by __wallFootCheck). Trees carry owner 3: the hill planting keeps their kind. */
function terraceFeet(W,o={}){const gy=W.gy,g=new GB(1<<15),st={rocks:0,moss:0,shrubs:0,cyp:0,scree:0};let own=null;   // own: footprints of the record's own building (R.own), not in the way
  const busy=(x,z,r)=>(W.streetAt&&W.streetAt(x,z))||W.foot.hits(x,z,r,r,0,0,f=>f.tag==='open'||f.tag==='precinct'||(own&&own.has(f)));
  const rock=(x,z,rot,hl,hd,ht,pal,sd)=>{const C=frame(x,0,z,rot);let yg=1e9;for(const a of[-hl,hl])for(const b of[-hd,hd]){const q=C.p(a,0,b);yg=Math.min(yg,gy(q[0],q[2]));}rockLump(g,C,hl,hd,yg-.45,ht+.45,pal,sd,[x,z]);};
  for(const R of W.wallFeet||[]){const S=R.S,pal=R.pal,tr=Math.atan2(-R.uz,R.ux),nat=!!R.natural,lg=!!R.ledge||nat;if(S.length<2||R.bare)continue;own=R.own||null;   /* R.bare: a paved floor at its foot (the Palatine's h51): nothing grows there */   // R.ledge: the wall already stands on a band of ledge rock (palTerraces): only shrubs and cypresses, further out
    // R.west: the Palatine's west rings (palTerraces, the review of 2026-11-13): shrubs only, no cypress (no tall tree within 6 m of a parapet) and no scree (no stones)
    // R.natural: the foot of a modelled cliff with its own talus, scree and boulders (the Tiberiana's rock): as a ledge, and no scree either
    const Wp=(s,d)=>{let k=0;while(k<S.length-2&&S[k+1].s<s)k++;const A=S[k],B=S[k+1],t=clamp((s-A.s)/((B.s-A.s)||1),0,1),nx=lerp(A.nx??R.nx,B.nx??R.nx,t),nz=lerp(A.nz??R.nz,B.nz??R.nz,t);   // along the samples (a curved wall foot has its own normals)
      return[lerp(A.x,B.x,t)+nx*d,lerp(A.z,B.z,t)+nz*d];};let nextRock=1+3*teH(R.ax,R.az,1),nextShrub=1.5,nextCyp=3+4*teH(R.ax,R.az,2);
    const tall=S.filter(q=>q.h>=3&&!q.open).length*(R.L/(S.length-1));
    for(const q of S){q.road=false;for(const d of[1.2,2.5]){const p=Wp(q.s,d);if((W.streetAt&&W.streetAt(p[0],p[1]))||W.foot.hits(p[0],p[1],.6,.6,0,0,f=>f.tag!=='road')){q.road=true;break;}}}   // a street runs along the wall foot here: nothing is planted on it, and the kerb is no seam (__wallFootCheck)
    for(let k=0;k<S.length-1;k++){const A=S[k],B=S[k+1];if(A.open||B.open||A.room||B.room)continue;const hm=Math.min(A.h,B.h);
      if(hm>=1.5&&!lg){const wd=.5+.5*teH(A.x,A.z,3),a0=Wp(A.s,.15),a1=Wp(A.s,.15+wd),b0=Wp(B.s,.15),b1=Wp(B.s,.15+wd);if(!busy((a0[0]+b1[0])/2,(a0[1]+b1[1])/2,.5)){g.set(62,.5,pal,0);
        g.poly([[a0[0],gy(a0[0],a0[1])+.05,a0[1]],[b0[0],gy(b0[0],b0[1])+.05,b0[1]],[b1[0],gy(b1[0],b1[1])+.05,b1[1]],[a1[0],gy(a1[0],a1[1])+.05,a1[1]]],[0,1,0]);st.moss++;}}
      for(let s=A.s;s<B.s;s+=.5){
        // the west rings (the review of 2026-11-13): a rock only where the wall stands 4 m or more out of the ground, one every 9 m
        if(s>=nextRock&&hm>=(R.west?4:1.5)&&!lg){const hh=teH(A.x+s,A.z,4),hl=.55+1.3*hh,hd=.45+.8*teH(A.x,A.z+s,5),ht=Math.min(.45+1.4*teH(A.x+s,A.z+s,6),Math.max(.5,hm*.45)),q=Wp(s,.35+hd);
          if(!busy(q[0],q[1],Math.max(hl,hd)*.6)){rock(q[0],q[1],tr+(hh-.5)*.5,hl,hd,ht,pal,hh);R.brk.push(s);st.rocks++;
            if(teH(q[0],q[1],8)<.45){const q2=Wp(s+hl*.9,.3+hd*.6);if(!busy(q2[0],q2[1],.5)){rock(q2[0],q2[1],tr+.4,hl*.55,hd*.6,ht*.6,pal,hh*.7);st.rocks++;}}}
          nextRock=s+(R.west?9:4+5*teH(A.x+s,A.z-s,9));}
        if(s>=nextShrub&&hm>=1.2){const q=Wp(s,(lg?3.6:.9)+1.6*teH(A.x+s,A.z,10));if(teH(q[0],q[1],11)<.6&&!busy(q[0],q[1],.8)&&!inPierSq(W,q[0],q[1])){W.trees.push([q[0],gy(q[0],q[1]),q[1],'shrub',.7+.6*teH(q[0],q[1],12),null,3]);R.brk.push(s);st.shrubs++;}nextShrub=s+2.5+3*teH(A.x,A.z+s,13);}
        if(s>=nextCyp&&hm>=3&&tall>=18&&!R.west){const q=Wp(s,(lg?5.6:2.6)+.9*teH(A.x+s,A.z,14));if(!busy(q[0],q[1],1.2)&&!inPierSq(W,q[0],q[1])){W.trees.push([q[0],gy(q[0],q[1]),q[1],'cyp',.85+.3*teH(q[0],q[1],15),null,3]);R.brk.push(s);st.cyp++;}nextCyp=s+6+2*teH(A.x+s,A.z+s,16);}}
      if(hm>=3&&!nat&&!R.west&&teH(A.x,A.z,17)<.55)for(let j=0;j<3;j++){const q=Wp(A.s+2*teH(A.x,A.z,30+j),(lg?6:3)+9*teH(A.z,A.x,40+j)),sl=Math.hypot(gy(q[0]+2,q[1])-gy(q[0]-2,q[1]),gy(q[0],q[1]+2)-gy(q[0],q[1]-2))/4;   // scree on the slope below
        if(sl<.35||busy(q[0],q[1],.4))continue;const r=.22+.35*teH(q[0],q[1],50+j);rock(q[0],q[1],teH(q[1],q[0],60+j)*TAU,r,r*.8,r*.7,pal,.3);st.scree++;}}}
  own=null;const m=g.mesh(MAT.city);if(m){layTag(m,'ground');m.name='terraceFeet';W.scene.add(m);}W.terraceFeetStats=st;return st;}
// a lump of the hill's rock (part 61, palette pal) centred on frame C: hl x hd at its base y0, ht high, its corners jittered by a die keyed to key (x,z)
function rockLump(g,C,hl,hd,y0,ht,pal,sd,key){const j=k=>teH(key[0],key[1],20+k)-.5,c=C.p(0,0,0),P=(a,y,b,k)=>C.p(a*(1+.22*j(k)),y,b*(1+.22*j(k+8)));
  const B=[P(-hl,y0,-hd,0),P(hl,y0,-hd,1),P(hl,y0,hd,2),P(-hl,y0,hd,3)],T=[P(-hl*.8,y0+ht*(1+.25*j(4)),-hd*.75,4),P(hl*.85,y0+ht*(1+.25*j(5)),-hd*.7,5),P(hl*.75,y0+ht*.8*(1+.2*j(6)),hd*.8,6),P(-hl*.7,y0+ht*.85*(1+.2*j(7)),hd*.85,7)];
  g.set(61,sd,pal,0);for(let k=0;k<4;k++){const k2=(k+1)%4;g.poly([B[k],B[k2],T[k2],T[k]],[T[k][0]-c[0]+T[k2][0]-c[0],0,T[k][2]-c[2]+T[k2][2]-c[2]]);}g.poly([T[0],T[1],T[2],T[3]],[0,1,0]);}
// C3: a tree in a stone pit 0.5 m high (2.6 m square) on a terrace floor at y (relative to F); the tree keeps its kind (owner 3)
function treePit(W,g,F,x,z,y,kind,sc){g.set(48,.5);for(const[cx,cz,hx,hz]of[[0,1.15,1.3,.15],[0,-1.15,1.3,.15],[1.15,0,.15,1],[-1.15,0,.15,1]])box(g,F,x+cx,y,z+cz,hx,.5,hz,31);g.set(36,.5);box(g,F,x,y,z,1,.42,1,16);
  const q=F.p(x,y+.42,z);W.trees.push([q[0],q[1],q[2],kind,sc,null,3]);}

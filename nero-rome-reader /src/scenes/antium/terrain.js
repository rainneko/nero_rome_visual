/* Antium · terrain. A rocky headland runs west from the land neck (x≈300) and ends in a sheer bluff (x≈-255): the
   summit plateau carries the upper palace and the observation tower, nothing lies beyond it. Natural rock outside the
   walls (ragged cliffs, ledges, coves); inside, the villa stands on built terraces with masonry sides (antTerraces).
   Book: "城建在一段向海里伸出去的岩岬上。岬角的南面是港口……北面是悬崖，崖下全是黑色的礁石"
   North of the upper palace, across a 35 m chasm, a cliff-bound rock carries the side hall ("三面绝壁，只有一座窄桥连着主宫").
   Local metres: x east, z south, y up. */
const ANT={AX:-70000,AZ:0,NECK:300,TIP:-255,
  ROCK:{x:-140,z:-161,rx:55,rz:45,top:54},     // the side-hall rock
  BR:{x:-140,z:-99,dy:7},                      // bridge centre (axis N-S); the GLB deck (z 50) is lifted by dy -> 57
  /* built terraces east -> west: [x east end, x west end, level, name]; flights of steps climb against the west ones */
  TERR:[[306,262,26,'gate'],[262,112,29,'garden'],[112,20,37,'tier1'],[20,-66,47,'tier2'],[-66,-188,57,'palace'],[-188,-252,58,'summit']],
  YARD:{x0:262,x1:226,z:26,level:27.5},          // the workshop yard: the south-east corner of the garden terrace, at gate level
  SUM:[-232,-24]};                             // the observation tower
const antS=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const antN=(x,z)=>Math.sin(x*.013+Math.sin(z*.011)*1.7)*.5+Math.sin(z*.017+Math.sin(x*.009)*2.1)*.35+Math.sin((x+z)*.031+1.3)*.15;
const antN1=u=>Math.sin(u)*.55+Math.sin(u*2.3+1.1)*.3+Math.sin(u*5.1+2.3)*.15;
/* piecewise smoothstep through [x, value] nodes (ascending x): no overshoot, flat at the nodes */
function antPW(P,x){if(x<=P[0][0])return P[0][1];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(x<=b[0]){const t=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t*t*(3-2*t);}}return P[P.length-1][1];}
const antSpZ=x=>6*Math.sin(x*.009);
const ANT_HN=[[-260,44],[-190,64],[-150,70],[-140,76],[-128,70],[-80,66],[0,70],[80,76],[170,80],[240,78],[300,74],[360,90]];
const ANT_HS=[[-260,44],[-190,64],[-140,68],[-80,70],[0,76],[80,84],[160,92],[230,98],[290,96],[360,110]];
/* natural crest under the terraces: always 1.5 m or more below the terrace level, rising inside the upper terrace */
const ANT_RIDGE=[[-268,14],[-250,48],[-236,55.5],[-200,56.5],[-188,55.5],[-90,55],[-74,45.5],[-66,45],[-4,44.5],[12,35.5],[20,35],[90,35],[106,27.5],[112,27],[226,27],[240,25.5],[262,24.5],[306,24.5],[350,26],[430,31]];
function antHalfW(x,side){let w=antPW(side<0?ANT_HN:ANT_HS,x)+6*antN1(x*.021+side*3.1)+3.5*antN1(x*.057+side*7.7)-12*Math.pow(Math.max(0,Math.sin(x*.023+side*2.4)),10);
  const t0=ANT.TIP+70;if(x<t0){const q=(t0-x)/70;w*=Math.sqrt(Math.max(0,1-q*q));}return Math.max(0,w);}
function antEdgeW(x,side){let e=13+5*antN1(x*.05+side*2);if(x<-180)e=lerp(e,9,antS(-180,-230,x));if(side<0)e=lerp(e,11.5,Math.exp(-(((x+140)/26)**2)));return e;}
/* lateral distance from the spine to the wall line (the outer edge of the terraces); the north side leaves room for
   the cliff bridle path (book: "悬崖上有一条马道，沿着岩岬绕半圈，一边是石墙，一边是海") */
function antWallOff(x,side){const inset=side<0&&x>-40&&x<292?12:2.5;return antHalfW(x,side)-antEdgeW(x,side)-inset;}
const antWallZ=(x,side)=>antSpZ(x)+side*antWallOff(x,side);
function antGround(x,z){const lat=z-antSpZ(x),side=lat<0?-1:1,w=Math.max(1,antHalfW(x,side)),r=Math.min(1.3,Math.abs(lat)/w);
  return antPW(ANT_RIDGE,x)*(1-.18*r*r)+(2.2*antN(x*1.6,z*1.6)+1.1*antN(x*4.5,z*4.5))*(.25+.75*r);}
/* the side-hall rock: ragged outline, cliffs all round */
function antRockD(x,z){const R=ANT.ROCK,dx=(x-R.x)/R.rx,dz=(z-R.z)/R.rz,a=Math.atan2(dz,dx);return (1-Math.hypot(dx,dz)/(1+.11*Math.sin(a*2+.6)+.08*Math.sin(a*3+1)+.06*Math.sin(a*5+2)+.04*Math.sin(a*9)+.025*Math.sin(a*17+1.3)))*Math.min(R.rx,R.rz);}
function antRockH(x,z){const d=antRockD(x,z);if(d<-16)return -1e9;if(d<0)return -1.5-5*antS(0,16,-d);
  const R=ANT.ROCK,a=Math.atan2(z-R.z,x-R.x),E=11+6*antN1(a*2.3+.4)+3*antN1(a*7.1),q=antS(0,E,d),
    knoll=6*Math.exp(-(((x-R.x+36)/16)**2+((z-R.z+24)/14)**2)),shelf=a>2.2||a<-2.6?.72:1,
    top=R.top-1.5+knoll+2*antN(x*3,z*3)+1.2*antN(x*7,z*7)-5*antS(22,0,d);
  return top*(q*shelf+(1-shelf)*antS(0,E*.35,d)*q+.05*Math.sin(q*Math.PI*4));}
const antIsleTop=(x,z)=>antRockH(x,z);
function antCoastX(z){return z<110?330+10*antN(z*1.2,.5):330+.95*(z-110)+8*antN(z*.8,3);}
function antH(x,z){let isl=antRockH(x,z);
  {const rs=Math.hypot(x-40,z+128),as=Math.atan2(z+128,x-40),rr=11+3*Math.sin(as*3)+2*Math.sin(as*5+1);if(rs<rr+8)isl=Math.max(isl,(34+(x-40)*.15)*antS(rr,rr-7,rs)-2-4*antS(rr,rr+8,rs));}
  {const r1=Math.hypot(x+900,z+640);if(r1<210){const pk=Math.max(0,1-r1/190);isl=Math.max(isl,105*pk*pk*(1+.22*antN(x*2.4,z*2.4))+12*antS(190,140,r1)-4);}}
  {const r2=Math.hypot(x+560,z-430);if(r2<60)isl=Math.max(isl,17*antS(56,22,r2)*(1+.2*antN(x*3,z*3))-3);}
  let h=-1e9;const lat=z-antSpZ(x),side=lat<0?-1:1,w=antHalfW(x,side),d=w-Math.abs(lat);
  if(x<ANT.NECK+60&&x>ANT.TIP-2&&d>0){const E=antEdgeW(x,side),q=antS(0,E,d);h=antGround(x,z)*(q+.05*Math.sin(q*Math.PI*4));}
  const dM=x-antCoastX(z);
  if(dM>0)h=Math.max(h,26*antS(0,40,dM)+(dM>160?(dM-160)*.06:0)+(14*antN(x*.6,z*.6)+7*antN(x*1.7+40,z*1.7))*antS(60,240,dM)-(z>120?Math.min(10,(z-120)*.05):0));
  if(h<=0){const dd=Math.max(d,dM);h=Math.max(isl,-2-Math.min(14,Math.max(0,-dd)*.1));}else h=Math.max(h,isl);return h;}
const antF=(x,z,rot,y)=>frame(ANT.AX+x,y===undefined?antH(x,z):y,ANT.AZ+z,rot||0);
/* level of the built terrace at (x, z), or null outside the walls */
function antLevel(x,z){const Y=ANT.YARD;if(x<=Y.x0&&x>=Y.x1&&z-antSpZ(x)>Y.z&&z<antWallZ(x,1))return Y.level;
  for(const[a,b,l]of ANT.TERR)if(x<=a&&x>b){if(z<antWallZ(x,-1)||z>antWallZ(x,1))return null;return l;}return null;}
/* podium on the natural ground: highest ground under the footprint, a stone base down the slope; returns the floor */
function antPad(g,x,z,w,d,rot,o={}){let y=-1e9;const c=Math.cos(rot||0),s=Math.sin(rot||0);for(const[a,b]of[[0,0],[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]]){const px=x+a*w/2*c+b*d/2*s,pz=z-a*w/2*s+b*d/2*c;y=Math.max(y,antH(px,pz));}
  y+=o.lift||.4;const F=antF(x,z,rot,y);g.set(o.part||24,o.seed||.82);box(g,F,0,-16,0,w/2+(o.m||1.2),16,d/2+(o.m||1.2),31);g.set(2,.62);box(g,F,0,-.35,0,w/2+(o.m||1.2)+.25,.35,d/2+(o.m||1.2)+.25,31);return y;}

function antRockMat(){if(MAT.antRock)return MAT.antRock;const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96});
  m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;float ahs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float ans(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(ahs(i),ahs(i+vec2(1,0)),f.x),mix(ahs(i+vec2(0,1)),ahs(i+vec2(1,1)),f.x),f.y);}')
      .replace('#include <color_fragment>','#include <color_fragment>\n{float st=1.-clamp(vWN.y,0.,1.);float n1=ans(vWP.xz*.035)+.5*ans(vWP.xz*.11);float band=.5+.5*sin(vWP.y*1.15+n1*5.);float fine=ans(vec2(vWP.x*.31+vWP.z*.27,vWP.y*1.9));float crack=smoothstep(.62,.7,ans(vec2((vWP.x+vWP.z)*.09,vWP.y*.35)));vec3 rock=vec3(.66,.6,.52)*(.78+.26*band)*(.84+.3*fine)*(1.-.42*crack)*.47;float moss=smoothstep(.55,.75,ans(vWP.xz*.07+vWP.y*.05))*(1.-smoothstep(.5,.85,st));rock=mix(rock,vec3(.3,.36,.18)*.45,moss*.6);float wet=smoothstep(3.,.4,vWP.y);rock=mix(rock,vec3(.08,.08,.075),wet*.8);diffuseColor.rgb=mix(diffuseColor.rgb,rock,smoothstep(.36,.6,st)*step(-.5,vWP.y));}');};
  MAT.antRock=m;return m;}
function antTerrain(G){const AX=ANT.AX,AZ=ANT.AZ,F0=[-960,960,-760,620];
  const mk=(X0,X1,Z0,Z1,S,skip)=>{const nx=Math.round((X1-X0)/S)+1,nz=Math.round((Z1-Z0)/S)+1,ps=new Float32Array(nx*nz*3),cs=new Float32Array(nx*nz*3),id=[];
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=X0+i*S,z=Z0+j*S,k=(j*nx+i)*3;ps[k]=AX+x;ps[k+1]=antH(x,z)-(skip?.3:0);ps[k+2]=AZ+z;}
    for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){if(skip){const xc=X0+(i+.5)*S,zc=Z0+(j+.5)*S;if(xc>F0[0]&&xc<F0[1]&&zc>F0[2]&&zc<F0[3])continue;}const a=j*nx+i;id.push(a,a+nx,a+1,a+1,a+nx,a+nx+1);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(ps,3));geo.setIndex(id);geo.computeVertexNormals();const nr=geo.attributes.normal.array;
    for(let v=0;v<nx*nz;v++){const h=ps[v*3+1],sl=1-nr[v*3+1],x=ps[v*3]-AX,z=ps[v*3+2]-AZ,n=.5+.5*antN(x*3,z*3);let c;
      if(h<-.7)c=[.3,.35,.31];else if(h<.6)c=[.86,.84,.78];else if(h<2.8&&sl<.3)c=[.84,.77,.6];
      else if(sl>.4){const band=.5+.5*Math.sin(h*1.25+antN(x*2,z*2)*3),crack=(((x*.21+z*.17+h*.4)%1)+1)%1<.07?.7:1,k=(.84+.24*band)*crack;c=[.64*k,.57*k,.48*k];}
      else if(sl>.2)c=[.56+.06*n,.53+.04*n,.37];else{const dry=antS(.35,.75,n);c=[.36+.2*dry,.44+.06*dry,.22+.06*dry];}
      cs[v*3]=c[0]*.45;cs[v*3+1]=c[1]*.45;cs[v*3+2]=c[2]*.45;}
    geo.setAttribute('color',new THREE.BufferAttribute(cs,3));const m=new THREE.Mesh(geo,antRockMat());m.receiveShadow=true;G.add(m);};
  mk(F0[0],F0[1],F0[2],F0[3],4,false);mk(-1600,9000,-6000,6000,80,true);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(49000,60000).rotateX(-Math.PI/2),MAT.antSea);sea.position.set(AX-15500,0,AZ);G.add(sea);
  /* boulders, and black reef rocks under the north cliffs (book: 崖下全是黑色的礁石) */
  const pts=[];for(let x=F0[0]+10;x<F0[1]-10;x+=5)for(let z=F0[2]+10;z<F0[3]-10;z+=5){const h=antH(x,z);if(h<-1.6||h>1.4)continue;const hm=Math.max(antH(x+7,z),antH(x-7,z),antH(x,z+7),antH(x,z-7));if(hm<4)continue;const r=Math.abs(Math.sin(x*12.9898+z*78.233)*43758.5453)%1;if(r>.62)continue;pts.push([x+(r-.3)*5,h,z+((r*7)%1-.5)*5,1.1+((r*13)%1)*2.8,z<-60?1:0]);}
  for(const dark of[0,1]){const P=pts.filter(p=>p[4]===dark);if(!P.length)continue;const im=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:dark?0x2e2c2a:0x8a8074,roughness:dark?.7:1,flatShading:true}),P.length),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
    P.forEach((p,i)=>{e.set(p[0]*.3,p[2]*.7,p[0]*.11);q.setFromEuler(e);m4.compose(new THREE.Vector3(AX+p[0],p[1]-.3,AZ+p[2]),q,new THREE.Vector3(p[3]*1.3,p[3]*.8,p[3]));im.setMatrixAt(i,m4);});im.castShadow=true;G.add(im);}
  /* far mountains behind the mainland (the Alban hills) */
  const mtn=(cx,cz,R,H,sd)=>{const nR=10,nA=30,pos=[],col=[],idx=[];for(let i=0;i<=nR;i++)for(let j=0;j<nA;j++){const r=R*i/nR,a=j/nA*TAU,f=1-i/nR,h=H*Math.pow(f,1.3)*(1+.3*Math.sin(a*3+sd)+.18*Math.sin(a*7+sd*2)+.1*Math.sin(a*13+sd))*(1+.15*Math.sin(r*.004+a*5));pos.push(AX+cx+Math.cos(a)*r,h,AZ+cz+Math.sin(a)*r);const k=.5+.16*f;col.push(k*.68,k*.74,k*.8);}
    for(let i=0;i<nR;i++)for(let j=0;j<nA;j++){const a=i*nA+j,b=i*nA+(j+1)%nA,c=(i+1)*nA+j,d=(i+1)*nA+(j+1)%nA;idx.push(a,b,c,b,d,c);}
    const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g2.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g2.setIndex(idx);g2.computeVertexNormals();G.add(new THREE.Mesh(g2,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide})));};
  mtn(8200,-2600,3000,820,1);mtn(9400,-300,3400,1000,2);mtn(8600,2600,2800,700,3);mtn(7600,-5200,3200,950,4);mtn(6800,4800,2600,600,5);}

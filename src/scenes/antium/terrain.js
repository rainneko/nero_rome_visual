/* Antium · terrain: the headland (three terraces inside the cliff walls), the islet with its sea stack,
   offshore islands, a natural sea arch, the mainland hills and far mountains. Local metres: x east, z south. */
const ANT={AX:-70000,AZ:0,ISL:[-210,-182],STACK:[-290,-242],BRZ:-100,BRL:96};
const antS=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const antN=(x,z)=>Math.sin(x*.013+Math.sin(z*.011)*1.7)*.5+Math.sin(z*.017+Math.sin(x*.009)*2.1)*.35+Math.sin((x+z)*.031+1.3)*.15;
const antAxZ=x=>lerp(0,30,clamp((420-x)/720,0,1)),antRad=x=>lerp(125,95,clamp((420-x)/720,0,1)),antPlat=x=>x>150?32:x>-50?48:66;
function antSeg(x,z){const dx=-720,dz=30,t=clamp(((x-420)*dx+z*dz)/(dx*dx+dz*dz),0,1);return[Math.hypot(x-420-dx*t,z-dz*t),t];}
function antIsleR(a){return 52+7*Math.sin(a*3+1)+4*Math.sin(a*5+2)+2.5*Math.sin(a*9+.5);}
function antH(x,z){
  const I=ANT.ISL,ri=Math.hypot(x-I[0],z-I[1]),re=antIsleR(Math.atan2(z-I[1],x-I[0]));let isl=-1e9;
  {const d=ri-re;if(d<14)isl=d<-11?63:d<-6?lerp(63,50,antS(-11,-6,d)):d<-4?49+antN(x*7,z*7):d<3?lerp(48,0,antS(-4,3,d))+2*antN(x*9,z*9)*(1-antS(-4,3,d)):-7*antS(3,13,d);}
  const rs=Math.hypot(x-ANT.STACK[0],z-ANT.STACK[1]);{const as=Math.atan2(z-ANT.STACK[1],x-ANT.STACK[0]),rr=15+3*Math.sin(as*3)+2*Math.sin(as*5+1);if(rs<rr+8)isl=Math.max(isl,(44+(x-ANT.STACK[0])*.18)*antS(rr,rr-9,rs)-2-4*antS(rr,rr+8,rs));}
  const r1=Math.hypot(x+760,z+540);if(r1<200){const pk=Math.max(0,1-r1/180);isl=Math.max(isl,100*pk*pk*(1+.22*antN(x*2.4,z*2.4))+12*antS(180,130,r1)-4);}
  const r2=Math.hypot(x+660,z-400);if(r2<56)isl=Math.max(isl,17*antS(52,20,r2)*(1+.2*antN(x*3,z*3))-3);
  const dh=antSeg(x,z)[0],mask=antS(25,70,Math.hypot(x+210,z+75)),cn=clamp(14*antN(x*1.4,z*1.4)+7*antN(x*3.3+50,z*3.1)+3*antN(x*9,z*9),-2,30)*mask,dW=(antRad(x)-9)-dh,ws=4+Math.max(0,cn);
  const cX=(z<120?400:400+.9*(z-120))+10*antN(z*1.2,x*.5),dM=x-cX;let h=-1e9;
  if(dM>0)h=30*antS(0,45,dM)-(z>60?Math.min(24,(z-60)*.11):0)+(z<-140?Math.min(8,(-140-z)*.04):0)+(dM>220?(dM-220)*.045:0)+16*antN(x*.6,z*.6)*antS(60,220,dM);
  const P=antPlat(x)+1.2*Math.sin(z*.03);let hh;
  if(dW>=0)hh=P;else if(dW>-ws)hh=P-1.2-3.2*(-dW/ws)+1.2*antN(x*5,z*5);else{const q=antS(-(ws+11),-ws,dW);hh=(P-4.4)*(q+.06*Math.sin(q*Math.PI*5));}
  h=Math.max(h,hh);
  if(h<=0){const dd=Math.max(dW+9,dM);h=Math.max(isl,-2-Math.min(14,Math.max(0,-dd)*.1));}else h=Math.max(h,isl);return h;}
const antF=(x,z,rot,y)=>frame(ANT.AX+x,y===undefined?antH(x,z):y,ANT.AZ+z,rot||0);
function antRockMat(){if(MAT.antRock)return MAT.antRock;const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96});
  m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;float ahs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float ans(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(ahs(i),ahs(i+vec2(1,0)),f.x),mix(ahs(i+vec2(0,1)),ahs(i+vec2(1,1)),f.x),f.y);}')
      .replace('#include <color_fragment>','#include <color_fragment>\n{float st=1.-clamp(vWN.y,0.,1.);float n1=ans(vWP.xz*.035)+.5*ans(vWP.xz*.11);float band=.5+.5*sin(vWP.y*1.15+n1*5.);float fine=ans(vec2(vWP.x*.31+vWP.z*.27,vWP.y*1.9));float crack=smoothstep(.62,.7,ans(vec2((vWP.x+vWP.z)*.09,vWP.y*.35)));vec3 rock=vec3(.64,.575,.49)*(.76+.28*band)*(.84+.3*fine)*(1.-.42*crack)*.45;float moss=smoothstep(.55,.75,ans(vWP.xz*.07+vWP.y*.05))*(1.-smoothstep(.5,.85,st));rock=mix(rock,vec3(.3,.36,.18)*.45,moss*.6);diffuseColor.rgb=mix(diffuseColor.rgb,rock,smoothstep(.36,.6,st)*step(.9,vWP.y));}');};
  MAT.antRock=m;return m;}
function antTerrain(G){const AX=ANT.AX,AZ=ANT.AZ,F0=[-980,920,-760,620];
  const mk=(X0,X1,Z0,Z1,S,skip)=>{const nx=Math.round((X1-X0)/S)+1,nz=Math.round((Z1-Z0)/S)+1,ps=new Float32Array(nx*nz*3),cs=new Float32Array(nx*nz*3),id=[];
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=X0+i*S,z=Z0+j*S,k=(j*nx+i)*3;ps[k]=AX+x;ps[k+1]=antH(x,z)-(skip?.3:0);ps[k+2]=AZ+z;}
    for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){if(skip){const xc=X0+(i+.5)*S,zc=Z0+(j+.5)*S;if(xc>F0[0]&&xc<F0[1]&&zc>F0[2]&&zc<F0[3])continue;}const a=j*nx+i;id.push(a,a+nx,a+1,a+1,a+nx,a+nx+1);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(ps,3));geo.setIndex(id);geo.computeVertexNormals();const nr=geo.attributes.normal.array;
    for(let v=0;v<nx*nz;v++){const h=ps[v*3+1],sl=1-nr[v*3+1],x=ps[v*3]-AX,z=ps[v*3+2]-AZ,n=.5+.5*antN(x*3,z*3);let c;
      if(h<-.7)c=[.3,.35,.31];else if(h<.5)c=[.93,.94,.91];else if(h<2.8&&sl<.3)c=[.84,.77,.6];
      else if(sl>.4){const band=.5+.5*Math.sin(h*1.25+antN(x*2,z*2)*3),crack=(((x*.21+z*.17+h*.4)%1)+1)%1<.07?.7:1,k=(.84+.24*band)*crack;c=[.64*k,.57*k,.48*k];}
      else if(sl>.2)c=[.56+.06*n,.53+.04*n,.37];else c=[.34+.16*n,.44+.08*n,.21+.05*n];
      cs[v*3]=c[0]*.45;cs[v*3+1]=c[1]*.45;cs[v*3+2]=c[2]*.45;}
    geo.setAttribute('color',new THREE.BufferAttribute(cs,3));const m=new THREE.Mesh(geo,antRockMat());m.receiveShadow=true;G.add(m);};
  mk(F0[0],F0[1],F0[2],F0[3],5,false);mk(-1600,9000,-6000,6000,80,true);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(49000,60000).rotateX(-Math.PI/2),MAT.antSea);sea.position.set(AX-15500,0,AZ);G.add(sea);
  /* boulders along the cliff feet */
  const pts=[];for(let x=F0[0]+10;x<F0[1]-10;x+=6)for(let z=F0[2]+10;z<F0[3]-10;z+=6){const h=antH(x,z);if(h<-1.4||h>1.3)continue;const hm=Math.max(antH(x+7,z),antH(x-7,z),antH(x,z+7),antH(x,z-7));if(hm<5)continue;const r=Math.abs(Math.sin(x*12.9898+z*78.233)*43758.5453)%1;if(r>.6)continue;pts.push([x+(r-.3)*6,h,z+((r*7)%1-.5)*6,1.2+((r*13)%1)*2.6]);}
  {const im=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x8a8074,roughness:1,flatShading:true}),Math.max(1,pts.length)),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
   pts.forEach((p,i)=>{e.set(p[0]*.3,p[2]*.7,p[0]*.11);q.setFromEuler(e);m4.compose(new THREE.Vector3(AX+p[0],p[1]-.3,AZ+p[2]),q,new THREE.Vector3(p[3]*1.3,p[3]*.8,p[3]));im.setMatrixAt(i,m4);});im.count=pts.length;im.castShadow=true;G.add(im);}
  /* a natural sea arch off the north shore */
  {const rm=new THREE.MeshStandardMaterial({color:0x9a8e7c,roughness:1,flatShading:true}),add=(geo,x,y,z,ry)=>{const m=new THREE.Mesh(geo,rm);m.position.set(AX+x,y,AZ+z);m.rotation.y=ry||0;m.castShadow=true;G.add(m);};
   for(let k=0;k<=16;k++){const s=k/16,an=Math.PI*s,r=8.5-2.6*Math.sin(an),m=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),rm);m.position.set(AX+65-Math.cos(an)*28,Math.sin(an)*25+3,AZ-190+(s-.5)*12);m.rotation.set(k*.7,k*1.3,k*.4);m.scale.set(1,1.15,.9);m.castShadow=true;G.add(m);}add(new THREE.DodecahedronGeometry(12,0),36,1,-197);add(new THREE.DodecahedronGeometry(11,0),95,1,-183);}
  /* far mountains behind the mainland */
  const mtn=(cx,cz,R,H,sd)=>{const nR=10,nA=30,pos=[],col=[],idx=[];for(let i=0;i<=nR;i++)for(let j=0;j<nA;j++){const r=R*i/nR,a=j/nA*TAU,f=1-i/nR,h=H*Math.pow(f,1.3)*(1+.3*Math.sin(a*3+sd)+.18*Math.sin(a*7+sd*2)+.1*Math.sin(a*13+sd))*(1+.15*Math.sin(r*.004+a*5));pos.push(AX+cx+Math.cos(a)*r,h,AZ+cz+Math.sin(a)*r);const k=.5+.16*f;col.push(k*.68,k*.74,k*.8);}
    for(let i=0;i<nR;i++)for(let j=0;j<nA;j++){const a=i*nA+j,b=i*nA+(j+1)%nA,c=(i+1)*nA+j,d=(i+1)*nA+(j+1)%nA;idx.push(a,b,c,b,d,c);}
    const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g2.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g2.setIndex(idx);g2.computeVertexNormals();G.add(new THREE.Mesh(g2,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide})));};
  mtn(8200,-2600,3000,820,1);mtn(9400,-300,3400,1000,2);mtn(8600,2600,2800,700,3);mtn(7600,-5200,3200,950,4);mtn(6800,4800,2600,600,5);}

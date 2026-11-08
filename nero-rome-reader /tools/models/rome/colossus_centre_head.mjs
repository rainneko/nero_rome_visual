// The colossus of the vestibule (version C "long legs" of renders/domus-aurea/proportion-20261028, 2026-10-28) -> assets/models/aurea/colossus.glb.
// Puts the head on the chest's midline, by translation only: the head with its neck, the curls and the crown move 0.65 m to the statue's left
// (+x, the viewer's right from the front) and 0.15 m up. The body's own neck stub follows on a soft falloff (all of it inside 1.6 m of the old
// neck axis, none beyond 3.4 m; from nothing at y 29.3 to all of it at y 31.0), so no torn shell edge opens beside the moved neck.
// The toes and the drape's hem, which the source has in the stone mesh, become bronze (a new primitive on the stone's vertices).
// Materials become the city's (bronze as on the forum's statues, travertine, gold); the flat vertex colours and the unused UVs are dropped and
// the buffer repacked. Nodes, normals and the other geometry are unchanged.
//   node tools/models/rome/colossus_centre_head.mjs <long-legs/rome_colossus_sol.glb> assets/models/aurea/colossus.glb
import fs from 'node:fs';
const [src,out]=process.argv.slice(2),DX=.65,DY=.15,AX=.25,AZ=-1.2,R1=1.6,R2=3.4,Y0=29.3,Y1=31.0;   // AX, AZ: the old neck axis (glTF x, z)
const HEAD=['Sol_Head_Continuous_Neck','Original_A3_Curls_And_Ears','Seven_Ray_Crown'],BODY='Rescue_Shared_Body_Pedestal';
const MATS={rescue_bronze:{name:'bronze',pbrMetallicRoughness:{baseColorFactor:[.214,.1065,.0331,1],metallicFactor:.7,roughnessFactor:.45}},rescue_travertine:{name:'travertine'},'gold.001':{name:'gold'}};
const buf=fs.readFileSync(src),jl=buf.readUInt32LE(12),j=JSON.parse(buf.slice(20,20+jl).toString());let bin=Buffer.from(buf.slice(20+jl+8));
const ss=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},done=new Set();
const move=(mi,w)=>{for(const p of j.meshes[mi].primitives){const ai=p.attributes.POSITION;if(done.has(ai))continue;done.add(ai);
  const a=j.accessors[ai],v=j.bufferViews[a.bufferView],o=(v.byteOffset||0)+(a.byteOffset||0),st=v.byteStride||12,mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(let i=0;i<a.count;i++){const q=o+i*st,c=[0,1,2].map(k=>bin.readFloatLE(q+k*4)),k=w(c);c[0]+=DX*k;c[1]+=DY*k;
    for(let n=0;n<3;n++){bin.writeFloatLE(c[n],q+n*4);const f=bin.readFloatLE(q+n*4);mn[n]=Math.min(mn[n],f);mx[n]=Math.max(mx[n],f);}}
  a.min=mn;a.max=mx;}};
for(const n of j.nodes){if(n.mesh===undefined)continue;
  if(HEAD.includes(n.name))move(n.mesh,()=>1);
  else if(n.name===BODY)move(n.mesh,c=>ss((R2-Math.hypot(c[0]-AX,c[2]-AZ))/(R2-R1))*ss((c[1]-Y0)/(Y1-Y0)));}
if(done.size<4)throw new Error('colossus: expected the head, curls, crown and body nodes in '+src);
// the toes and the drape's hem are the stone mesh's raised part (6.43 -> 6.68 m) over the flat plinth top: give those triangles to the bronze
// (centroid above 6.5 m, inside the plinth's edge; the bolts on the top, up to 6.48 m, stay stone)
{const ti=j.materials.findIndex(m=>m.name==='rescue_travertine'),bi=j.materials.findIndex(m=>m.name==='rescue_bronze'),me=j.meshes[j.nodes.find(n=>n.name===BODY).mesh];
  const p=me.primitives.find(q=>q.material===ti),ia=j.accessors[p.indices],iv=j.bufferViews[ia.bufferView],pa=j.accessors[p.attributes.POSITION],pv=j.bufferViews[pa.bufferView];
  const cs=ia.componentType===5125?4:2,io=(iv.byteOffset||0)+(ia.byteOffset||0),po=(pv.byteOffset||0)+(pa.byteOffset||0),pst=pv.byteStride||12;
  const I=i=>cs===4?bin.readUInt32LE(io+i*cs):bin.readUInt16LE(io+i*cs),Pk=(v,k)=>bin.readFloatLE(po+v*pst+k*4),stone=[],metal=[];
  for(let t=0;t<ia.count;t+=3){const v=[I(t),I(t+1),I(t+2)],c=[0,1,2].map(k=>(Pk(v[0],k)+Pk(v[1],k)+Pk(v[2],k))/3);(c[1]>6.5&&Math.abs(c[0])<5.2&&Math.abs(c[2])<5.2?metal:stone).push(...v);}
  if(!metal.length)throw new Error('colossus: no raised stone under the feet');
  const add=a=>{const b=Buffer.alloc(a.length*cs);a.forEach((v,i)=>cs===4?b.writeUInt32LE(v,i*cs):b.writeUInt16LE(v,i*cs));const o=bin.length;bin=Buffer.concat([bin,b,Buffer.alloc((4-b.length%4)%4)]);
    j.bufferViews.push({buffer:0,byteOffset:o,byteLength:b.length,target:34963});j.accessors.push({bufferView:j.bufferViews.length-1,componentType:ia.componentType,count:a.length,type:'SCALAR'});return j.accessors.length-1;};
  p.indices=add(stone);me.primitives.push({attributes:Object.assign({},p.attributes),indices:add(metal),material:bi});console.log('feet: '+metal.length/3+' triangles from stone to bronze');}
j.materials=j.materials.map(m=>MATS[m.name]?Object.assign({},m,MATS[m.name]):m);
// drop the vertex colours and UVs (no textures), then keep only the buffer views that are still used
for(const m of j.meshes)for(const p of m.primitives)for(const k of Object.keys(p.attributes))if(/^(COLOR|TEXCOORD)_/.test(k))delete p.attributes[k];
const used=[...new Set(j.meshes.flatMap(m=>m.primitives.flatMap(p=>[...Object.values(p.attributes),p.indices].filter(a=>a!==undefined))))].sort((a,b)=>a-b);
const accMap=new Map(used.map((a,i)=>[a,i])),viewMap=new Map(),views=[],parts=[];let off=0;
const accs=used.map(ai=>{const a=Object.assign({},j.accessors[ai]);if(!viewMap.has(a.bufferView)){const v=j.bufferViews[a.bufferView],o=v.byteOffset||0;
    const pad=(4-off%4)%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad;}parts.push(bin.slice(o,o+v.byteLength));
    views.push(Object.assign({},v,{byteOffset:off}));off+=v.byteLength;viewMap.set(a.bufferView,views.length-1);}
  a.bufferView=viewMap.get(a.bufferView);return a;});
for(const m of j.meshes)for(const p of m.primitives){for(const k in p.attributes)p.attributes[k]=accMap.get(p.attributes[k]);if(p.indices!==undefined)p.indices=accMap.get(p.indices);}
const nb=Buffer.concat([...parts,Buffer.alloc((4-off%4)%4)]);j.accessors=accs;j.bufferViews=views;j.buffers=[{byteLength:nb.length}];
let js=Buffer.from(JSON.stringify(j));js=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,32)]);
const h=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
h.write('glTF',0);h.writeUInt32LE(2,4);h.writeUInt32LE(12+8+js.length+8+nb.length,8);jh.writeUInt32LE(js.length,0);jh.write('JSON',4);bh.writeUInt32LE(nb.length,0);bh.write('BIN\0',4);
fs.writeFileSync(out,Buffer.concat([h,jh,js,bh,nb]));console.log(out,(12+16+js.length+nb.length)+' bytes');

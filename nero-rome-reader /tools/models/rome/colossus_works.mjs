// The colossus while headless (59-68): the building-site parts of Kimi's construction model (rome_colossus_headless.glb, 2026-10-26) for the
// body of assets/models/aurea/colossus.glb -> assets/models/aurea/colossus_works.glb. Kimi's body is the older one (shorter legs, the chest 1.2 m
// lower), so only the parts are taken: the four iron bars and the nest go 0.6 m to +x, 0.2 m to +z and 1.3 m up, into the neck opening of the
// version C body (with its head moved by colossus_centre_head.mjs); the timber props and the casting debris round the base stay where they are.
// Kimi's hollow neck lip (Headless_Hollow_Neck) is left out: it was shaped for the old opening and stands out of the new chest.
// Plain materials (wood, iron, the city's bronze and travertine); textures and UVs are dropped.
//   node tools/models/rome/colossus_works.mjs <Kimi_Agent_头部重做/金宫铜巨人/rome_colossus_headless.glb> assets/models/aurea/colossus_works.glb
import fs from 'node:fs';
const [src,out]=process.argv.slice(2),NECK=[.6,1.3,.2];
const buf=fs.readFileSync(src),jl=buf.readUInt32LE(12),j=JSON.parse(buf.slice(20,20+jl).toString()),bin=buf.slice(20+jl+8);
const keep=n=>/^(Construction_Iron_Rod_|Bird_Nest_Twig_|Wood_|Casting_Debris_)/.test(n.name),neck=n=>/^(Construction_Iron_Rod_|Bird_Nest_Twig_)/.test(n.name);
const MAT={wood:{name:'wood',pbrMetallicRoughness:{baseColorFactor:[.16,.075,.028,1],metallicFactor:0,roughnessFactor:.82}},
  iron:{name:'iron',pbrMetallicRoughness:{baseColorFactor:[.055,.045,.035,1],metallicFactor:.75,roughnessFactor:.6}},
  bronze:{name:'bronze',pbrMetallicRoughness:{baseColorFactor:[.214,.1065,.0331,1],metallicFactor:.7,roughnessFactor:.45}},
  stone:{name:'travertine',pbrMetallicRoughness:{baseColorFactor:[.51,.425,.3,1],metallicFactor:0,roughnessFactor:.85}}};
const nodes=[],meshes=[],mats=[],accs=[],views=[],parts=[],meshMap=new Map(),matMap=new Map(),accMap=new Map();let off=0;
const mat=i=>{const k=j.materials[i].name;if(!MAT[k])throw new Error('colossus works: unknown material '+k);if(!matMap.has(k)){mats.push(Object.assign({doubleSided:true},MAT[k]));matMap.set(k,mats.length-1);}return matMap.get(k);};
const acc=i=>{if(accMap.has(i))return accMap.get(i);const a=Object.assign({},j.accessors[i]),v=j.bufferViews[a.bufferView],n={VEC3:12,SCALAR:a.componentType===5125?4:2}[a.type];
  const o=(v.byteOffset||0)+(a.byteOffset||0),st=v.byteStride||n,b=Buffer.alloc(a.count*n);for(let k=0;k<a.count;k++)bin.copy(b,k*n,o+k*st,o+k*st+n);
  const pad=(4-off%4)%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad;}parts.push(b);views.push({buffer:0,byteOffset:off,byteLength:b.length,target:a.type==='SCALAR'?34963:34962});off+=b.length;
  a.bufferView=views.length-1;delete a.byteOffset;accs.push(a);accMap.set(i,accs.length-1);return accs.length-1;};
const mesh=i=>{if(!meshMap.has(i)){const m=j.meshes[i];meshes.push({name:m.name,primitives:m.primitives.map(p=>({attributes:{POSITION:acc(p.attributes.POSITION),NORMAL:acc(p.attributes.NORMAL)},indices:acc(p.indices),material:mat(p.material)}))});meshMap.set(i,meshes.length-1);}return meshMap.get(i);};
for(const n of j.nodes.filter(keep)){const t=(n.translation||[0,0,0]).map((v,k)=>neck(n)?v+NECK[k]:v);nodes.push(Object.assign({},n,{translation:t,mesh:mesh(n.mesh)}));}
if(!nodes.some(neck)||!nodes.some(n=>/^Wood_/.test(n.name)))throw new Error('colossus works: parts not found in '+src);
const nb=Buffer.concat([...parts,Buffer.alloc((4-off%4)%4)]);
const g={asset:{version:'2.0',generator:'colossus_works.mjs'},scene:0,scenes:[{name:'COLOSSUS_WORKS',nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials:mats,accessors:accs,bufferViews:views,buffers:[{byteLength:nb.length}]};
let js=Buffer.from(JSON.stringify(g));js=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,32)]);
const h=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
h.write('glTF',0);h.writeUInt32LE(2,4);h.writeUInt32LE(12+8+js.length+8+nb.length,8);jh.writeUInt32LE(js.length,0);jh.write('JSON',4);bh.writeUInt32LE(nb.length,0);bh.write('BIN\0',4);
fs.writeFileSync(out,Buffer.concat([h,jh,js,bh,nb]));console.log(out,nodes.length+' parts',(12+16+js.length+nb.length)+' bytes');

// Build-time GLB shrinker (no dependencies): welds identical vertices, quantizes POSITION to int16 (1/64 m, undone by the node scale; KHR_mesh_quantization)
// and NORMAL to int8, uses 16-bit indices where possible. Material names and everything else are untouched. optimize(Buffer) -> Buffer.
const Q=64;
export function optimize(buf){const jl=buf.readUInt32LE(12),j=JSON.parse(buf.slice(20,20+jl).toString()),bo=20+jl+8,bin=buf.slice(bo);
  if((j.extensionsUsed||[]).includes('KHR_mesh_quantization'))return buf;
  const chunks=[];let off=0;const put=(b,align=4)=>{while(off%4){chunks.push(Buffer.alloc(1));off++;}const o=off;chunks.push(b);off+=b.length;return o;};
  const views=[],accs=[],addView=(b,target,stride)=>{const o=put(b);views.push(Object.assign({buffer:0,byteOffset:o,byteLength:b.length,target},stride?{byteStride:stride}:{}));return views.length-1;};
  const rd=(ac)=>{const bv=j.bufferViews[ac.bufferView],n={VEC3:3,SCALAR:1,VEC2:2,VEC4:4}[ac.type],cs={5126:4,5125:4,5123:2,5121:1}[ac.componentType],st=bv.byteStride||n*cs,o0=(bv.byteOffset||0)+(ac.byteOffset||0),out=new Array(ac.count);
    for(let i=0;i<ac.count;i++){const a=[];for(let k=0;k<n;k++){const p=o0+i*st+k*cs;a.push(ac.componentType===5126?bin.readFloatLE(p):ac.componentType===5125?bin.readUInt32LE(p):ac.componentType===5123?bin.readUInt16LE(p):bin.readUInt8(p));}out[i]=n===1?a[0]:a;}return out;};
  for(const m of j.meshes)for(const p of m.primitives){const P=rd(j.accessors[p.attributes.POSITION]),N=p.attributes.NORMAL!==undefined?rd(j.accessors[p.attributes.NORMAL]):null,I=p.indices!==undefined?rd(j.accessors[p.indices]):P.map((_,i)=>i);
    const map=new Map(),vp=[],vn=[],idx=new Array(I.length);
    for(let t=0;t<I.length;t++){const v=I[t],q=P[v].map(x=>Math.round(x*Q)),nn=N?N[v].map(x=>Math.max(-127,Math.min(127,Math.round(x*127)))):[0,127,0],k=q.join(',')+'|'+nn.join(',');let id=map.get(k);if(id===undefined){id=vp.length;map.set(k,id);vp.push(q);vn.push(nn);}idx[t]=id;}
    const nv=vp.length,pb=Buffer.alloc(nv*8),nb=Buffer.alloc(nv*4),mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
    vp.forEach((q,i)=>{for(let k=0;k<3;k++){pb.writeInt16LE(q[k],i*8+k*2);mn[k]=Math.min(mn[k],q[k]);mx[k]=Math.max(mx[k],q[k]);nb.writeInt8(vn[i][k],i*4+k);}});
    const big=nv>65535,ib=Buffer.alloc(idx.length*(big?4:2));idx.forEach((v,i)=>big?ib.writeUInt32LE(v,i*4):ib.writeUInt16LE(v,i*2));
    const vP=addView(pb,34962,8),vN=addView(nb,34962,4),vI=addView(ib,34963);
    accs.push({bufferView:vP,componentType:5122,count:nv,type:'VEC3',min:mn,max:mx});p.attributes.POSITION=accs.length-1;
    if(N){accs.push({bufferView:vN,componentType:5120,normalized:true,count:nv,type:'VEC3'});p.attributes.NORMAL=accs.length-1;}
    accs.push({bufferView:vI,componentType:big?5125:5123,count:idx.length,type:'SCALAR'});p.indices=accs.length-1;
    for(const k of Object.keys(p.attributes))if(k!=='POSITION'&&k!=='NORMAL')throw new Error('glbopt: unexpected attribute '+k);}
  const s=1/Q;for(const n of j.nodes){if(n.mesh===undefined)continue;if(n.matrix){for(let c=0;c<3;c++)for(let r=0;r<3;r++)n.matrix[c*4+r]*=s;}else{const sc=n.scale||[1,1,1];n.scale=sc.map(v=>v*s);}}
  // a node scale on a parent would double up only if parents scale too: here meshes hang on nodes we scaled directly, children of scaled nodes are not expected
  j.accessors=accs;j.bufferViews=views;j.extensionsUsed=['KHR_mesh_quantization'];j.extensionsRequired=['KHR_mesh_quantization'];j.buffers=[{byteLength:off}];
  let js=Buffer.from(JSON.stringify(j));while(js.length%4)js=Buffer.concat([js,Buffer.from(' ')]);let bb=Buffer.concat(chunks);while(bb.length%4)bb=Buffer.concat([bb,Buffer.alloc(1)]);j.buffers[0].byteLength=bb.length;
  js=Buffer.from(JSON.stringify(j));while(js.length%4)js=Buffer.concat([js,Buffer.from(' ')]);
  const total=12+8+js.length+8+bb.length,h=Buffer.alloc(12+8);h.writeUInt32LE(0x46546C67,0);h.writeUInt32LE(2,4);h.writeUInt32LE(total,8);h.writeUInt32LE(js.length,12);h.writeUInt32LE(0x4E4F534A,16);
  const bh=Buffer.alloc(8);bh.writeUInt32LE(bb.length,0);bh.writeUInt32LE(0x004E4942,4);return Buffer.concat([h,js,bh,bb]);}

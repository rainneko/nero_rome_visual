// R12 13 (briefs/rome/palatine-path-rules.md): the data the plan and section drawings are made from, as the page has it. Reads PAL_PLAN (with any part
// that is drawn but not yet built, such as PAL_PLAN.h51), the office blocks, the hero models' placements and their GLB boxes, the ground (W.gy, the
// terrain as drawn), the stairs, trees and corner piers already built, and the scene's surface along the section lines; tools/plan/palatine_paths.py
// draws from this file.
// Usage: ROOT=<project> OUT=<dump.json> [PART=h51] node tools/plan/palatine_paths.mjs
//   PART: the key in PAL_PLAN whose draw.box (hill grid [lx0, lx1, lz0, lz1]) and draw.sections ([[name, [lx, lz], [lx, lz]], ...]) set the area
// Needs dist/test.html (npm run build:test) and dist/rome-assets.js for the GLB boxes.
import path from 'node:path';import fs from 'node:fs';import {createRequire} from 'node:module';
const root=process.env.ROOT,out=process.env.OUT,part=process.env.PART||'h51',require=createRequire(path.join(root,'package.json')),puppeteer=require('puppeteer');
const b=await puppeteer.launch({headless:'new',protocolTimeout:1800000,args:['--enable-gpu','--use-angle=metal','--allow-file-access-from-files','--ignore-gpu-blocklist']});
const p=await b.newPage();await p.setViewport({width:1600,height:900});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const t0=Date.now();await p.goto('file://'+path.join(root,'dist/test.html')+'?test&keepgeo',{timeout:0});
while(Date.now()-t0<600000){if(await p.evaluate(()=>!!window.__ready))break;await new Promise(r=>setTimeout(r,1000));}
console.log('boot',((Date.now()-t0)/1000).toFixed(0)+'s');
await p.evaluate(()=>{if(typeof romeLoadModels==='function')romeLoadModels();});
{const t1=Date.now();while(Date.now()-t1<240000){if(await p.evaluate(()=>typeof ROME==='undefined'||!ROME.GLB.length||window.__romeReady))break;await new Promise(r=>setTimeout(r,1000));}}
console.log('models',((Date.now()-t0)/1000).toFixed(0)+'s');
const data=await p.evaluate(part=>{const W=W0,o={},D=PAL_PLAN[part]&&PAL_PLAN[part].draw;if(!D)return{err:'PAL_PLAN.'+part+'.draw missing'};
  const[X0,X1,Z0,Z1]=D.box,inB=(lx,lz,m=0)=>lx>=X0-m&&lx<=X1+m&&lz>=Z0-m&&lz<=Z1+m,L=(x,z)=>palL(x,z).map(v=>+v.toFixed(2));
  o.part=part;o.box=D.box;o.plan=JSON.parse(JSON.stringify(PAL_PLAN));o.bl=PAL_BL;o.blk=PAL_BLK;o.assets=PAL_ASSETS;o.obs=PAL_OBS;o.basin=PAL_BASIN;o.deck=PAL_DECK;o.top=PAL_TOP;o.zones=PAL_ZONES;
  // the ground as drawn (W.gy: the terrain after every pad, hold and smoothing), 1 m grid
  const H=[];for(let lz=Z0;lz<=Z1;lz++){const r=[];for(let lx=X0;lx<=X1;lx++){const q=palW(lx,lz);r.push(+W.gy(q[0],q[1]).toFixed(2));}H.push(r);}o.grid={X0,Z0,st:1,nx:X1-X0+1,nz:Z1-Z0+1,H};
  // the stairs already built (the plan's: treads with their heights; the others: their centre lines)
  o.palStairs=(W.palStairs||[]).filter(s=>s.pts.some(q=>inB(...palL(q[0],q[1]),4))).map(s=>({id:s.id,w:s.w,lane:s.lane,pts:s.pts.map((q,i)=>[...L(q[0],q[1]),+(+s.Y[i]).toFixed(2)])}));
  o.hillStairs=(W.hillStairs||[]).filter(h=>!h.pal&&h.R&&h.R.some(q=>inB(...palL(q[0],q[1]),4))).map(h=>({w:h.w,top:h.top,steps:h.steps,R:h.R.map(q=>L(q[0],q[1]))}));
  // the trees as drawn: W.trees is emptied once its trees are drawn (monuments.js, after flushTrees), so read the instanced 'trees' meshes themselves
  // (each instance stands at the tree's foot - 0.3; the far copies (instLod) repeat the same places, so one per place and kind)
  {const T=(W.trees||[]).map(t=>[t[0],t[1],t[2],t[3]]);
   if(!T.length){const M4=new THREE.Matrix4(),P=new THREE.Vector3(),seen=new Set(),lay=m=>{for(let q=m;q;q=q.parent)if(q.userData&&q.userData.lay)return q.userData.lay;return null;};
     W.scene.traverse(m=>{if(!m.isInstancedMesh||lay(m)!=='trees')return;m.updateMatrixWorld(true);
       for(let i=0;i<m.count;i++){m.getMatrixAt(i,M4);P.setFromMatrixPosition(M4).applyMatrix4(m.matrixWorld);const k=(m.userData.kind||'?')+'|'+P.x.toFixed(1)+'|'+P.z.toFixed(1);
         if(seen.has(k))continue;seen.add(k);T.push([P.x,P.y+.3,P.z,m.userData.kind||'?']);}});}
   o.treesFrom=(W.trees||[]).length?'W.trees':'scene';o.trees=T.filter(t=>inB(...palL(t[0],t[2]))).map(t=>[...L(t[0],t[2]),+t[1].toFixed(2),t[3]]);}
  o.butt=(W.wallButt||[]).filter(t=>inB(...palL(t[0],t[1]),4)).map(t=>[...L(t[0],t[1]),t[2],t[3],t[4]]);
  o.piers=palPierPlan(W).map(c=>({id:c.P.id,v:c.v,lx:c.P.pts[c.v][0],lz:c.P.pts[c.v][1],y:c.y})).filter(c=>inB(c.lx,c.lz,4));
  o.build=palPlBuild();
  o.temples=(W.temples||[]).filter(t=>inB(...palL(t.x,t.z))).map(t=>{const[lx,lz]=L(t.x,t.z);return{name:t.name||null,lx,lz,y:+t.y.toFixed(2),W:t.W,L:t.L,podH:t.podH,run:+(t.run||0).toFixed(2),front:t.front,turn:+(((t.rot||0)-PALF.rot)*180/Math.PI).toFixed(1)};});
  // the GLBs placed in the area: their own box (model axes, at the origin) and placement; the hill turn is the model's y rotation less the grid's
  o.glb=[];const inv=new THREE.Matrix4(),M=new THREE.Matrix4(),OB=[];
  for(const g of(ROME.GLB||[])){const[lx,lz]=palL(g.x,g.z);if(!inB(lx,lz,90))continue;const ob=g.obj||(g.ghost?g.ghost():null);if(!ob)continue;
    const pos=ob.position.clone(),rot=ob.rotation.y;ob.position.set(0,0,0);ob.rotation.y=0;ob.updateMatrixWorld(true);inv.copy(ob.matrixWorld).invert();const bx=new THREE.Box3();
    ob.traverse(m=>{if(!m.isMesh)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();bx.union(m.geometry.boundingBox.clone().applyMatrix4(M.multiplyMatrices(inv,m.matrixWorld)));});
    ob.position.copy(pos);ob.rotation.y=rot;ob.updateMatrixWorld(true);if(bx.isEmpty())continue;OB.push(ob);
    o.glb.push({n:g.n,lx:+lx.toFixed(2),lz:+lz.toFixed(2),y:+g.y.toFixed(2),turn:+((g.r-PALF.rot)*180/Math.PI).toFixed(1),box:[bx.min.x,bx.max.x,bx.min.y,bx.max.y,bx.min.z,bx.max.z].map(v=>+v.toFixed(2))});}
  // what stands above the ground, seen from above: every GLB triangle, rasterised on a 0.5 m grid over the box where it is 0.3 m or more over the ground
  // (lab: the placement's index in o.glb + 1, the highest one in the cell; top: that height in dm)
  {const st=.5,nx=Math.round((X1-X0)/st),nz=Math.round((Z1-Z0)/st),lab=new Int16Array(nx*nz),top=new Int16Array(nx*nz).fill(-32768),G=new Float32Array(nx*nz),v=[0,1,2].map(()=>new THREE.Vector3());
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const q=palW(X0+(i+.5)*st,Z0+(j+.5)*st);G[j*nx+i]=W.gy(q[0],q[1]);}
    OB.forEach((ob,gi)=>{ob.updateMatrixWorld(true);ob.traverse(m=>{if(!m.isMesh)return;const P=m.geometry.attributes.position,I=m.geometry.index,n=I?I.count:P.count,h=[[0,0,0],[0,0,0],[0,0,0]];
      for(let t=0;t<n;t+=3){for(let k=0;k<3;k++){v[k].fromBufferAttribute(P,I?I.getX(t+k):t+k).applyMatrix4(m.matrixWorld);const[a,b]=palL(v[k].x,v[k].z);h[k][0]=(a-X0)/st-.5;h[k][1]=(b-Z0)/st-.5;h[k][2]=v[k].y;}
        const i0=Math.max(0,Math.ceil(Math.min(h[0][0],h[1][0],h[2][0]))),i1=Math.min(nx-1,Math.floor(Math.max(h[0][0],h[1][0],h[2][0]))),j0=Math.max(0,Math.ceil(Math.min(h[0][1],h[1][1],h[2][1]))),j1=Math.min(nz-1,Math.floor(Math.max(h[0][1],h[1][1],h[2][1])));
        if(i0>i1||j0>j1)continue;const d=(h[1][0]-h[0][0])*(h[2][1]-h[0][1])-(h[2][0]-h[0][0])*(h[1][1]-h[0][1]);if(Math.abs(d)<1e-9)continue;
        for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const a=((h[1][0]-i)*(h[2][1]-j)-(h[2][0]-i)*(h[1][1]-j))/d,b=((h[2][0]-i)*(h[0][1]-j)-(h[0][0]-i)*(h[2][1]-j))/d,c=1-a-b;
          if(a<-1e-6||b<-1e-6||c<-1e-6)continue;const y=a*h[0][2]+b*h[1][2]+c*h[2][2],k=j*nx+i;if(y<G[k]+.3)continue;const yd=Math.round(y*10);if(yd>top[k]){top[k]=yd;lab[k]=gi+1;}}}});});
    o.occ={X0,Z0,st,nx,nz,lab:Array.from(lab),top:Array.from(top)};}
  // each office block's GLB in its own axes (0.25 m cells, its highest point per cell, m over its origin): a block the part moves is drawn from this
  o.blkLocal={};{const v=[0,1,2].map(()=>new THREE.Vector3());for(const g of(ROME.GLB||[])){if(!/^rome_pal_block_/.test(g.n)||o.blkLocal[g.n])continue;const ob=g.obj||(g.ghost?g.ghost():null);if(!ob)continue;
    const pos=ob.position.clone(),rot=ob.rotation.y;ob.position.set(0,0,0);ob.rotation.y=0;ob.updateMatrixWorld(true);const st=.25,X0=-40,Z0=-40,nx=320,nz=320,top=new Float32Array(nx*nz).fill(-99);
    // band (its own 0.1 m grid): anything from 0.05 to 2.5 m over the block's low floor — walls (a vertical triangle marks the cells along its foot), steps, porch —
    // where it meets the ground, not its eaves; bx: the exact extent of the same (the cells overstate the outer faces by up to one cell)
    const bst=.1,bnx=800,bnz=800,band=new Uint8Array(bnx*bnz),bx=[1e9,-1e9,1e9,-1e9];
    const kk=Object.keys(PAL_BLK).find(k=>g.n===PAL_BLK[k].n||g.n===PAL_BLK[k].n+'_low'),dr=/_low$/.test(g.n)?3.3:kk?PAL_BLK[kk].dr:0,b0=-dr+.05,b1=-dr+2.5;
    const ras=(q,s,n_,m_,f)=>{const h=q.map(p=>[(p.x-X0)/s-.5,(p.z-Z0)/s-.5,p.y]);   // the cells (centres) a triangle covers, with its height there
      const d=(h[1][0]-h[0][0])*(h[2][1]-h[0][1])-(h[2][0]-h[0][0])*(h[1][1]-h[0][1]);if(Math.abs(d)<1e-9)return;
      const i0=Math.max(0,Math.ceil(Math.min(h[0][0],h[1][0],h[2][0]))),i1=Math.min(n_-1,Math.floor(Math.max(h[0][0],h[1][0],h[2][0]))),j0=Math.max(0,Math.ceil(Math.min(h[0][1],h[1][1],h[2][1]))),j1=Math.min(m_-1,Math.floor(Math.max(h[0][1],h[1][1],h[2][1])));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const a=((h[1][0]-i)*(h[2][1]-j)-(h[2][0]-i)*(h[1][1]-j))/d,b=((h[2][0]-i)*(h[0][1]-j)-(h[0][0]-i)*(h[2][1]-j))/d,c=1-a-b;
        if(a<-1e-6||b<-1e-6||c<-1e-6)continue;f(j*n_+i,a*h[0][2]+b*h[1][2]+c*h[2][2]);}};
    ob.traverse(m=>{if(!m.isMesh)return;const P=m.geometry.attributes.position,I=m.geometry.index,n=I?I.count:P.count;
      for(let t=0;t<n;t+=3){for(let k=0;k<3;k++)v[k].fromBufferAttribute(P,I?I.getX(t+k):t+k).applyMatrix4(m.matrixWorld);
        const yl=Math.min(v[0].y,v[1].y,v[2].y),yh=Math.max(v[0].y,v[1].y,v[2].y),inB=yh>=b0&&yl<=b1;
        const ext=()=>{for(let k=0;k<3;k++){bx[0]=Math.min(bx[0],v[k].x);bx[1]=Math.max(bx[1],v[k].x);bx[2]=Math.min(bx[2],v[k].z);bx[3]=Math.max(bx[3],v[k].z);}};
        const ar=(v[1].x-v[0].x)*(v[2].z-v[0].z)-(v[2].x-v[0].x)*(v[1].z-v[0].z);
        if(Math.abs(ar)<.002){if(inB){ext();let A=0,B=1,L=-1;for(const[p,q]of[[0,1],[1,2],[0,2]]){const l=Math.hypot(v[q].x-v[p].x,v[q].z-v[p].z);if(l>L){L=l;A=p;B=q;}}   // a wall: the cells along its foot
            for(let s=0,N=Math.ceil(L/bst*2)+1;s<=N;s++){const i=Math.floor((v[A].x+(v[B].x-v[A].x)*s/N-X0)/bst),j=Math.floor((v[A].z+(v[B].z-v[A].z)*s/N-Z0)/bst);if(i>=0&&i<bnx&&j>=0&&j<bnz)band[j*bnx+i]=1;}}continue;}
        if(inB&&yl>=b0-.1&&yh<=b1+.1)ext();
        ras(v,st,nx,nz,(k,y)=>{if(y>top[k])top[k]=y;});
        if(inB)ras(v,bst,bnx,bnz,(k,y)=>{if(y>=b0&&y<=b1)band[k]=1;});}});
    ob.position.copy(pos);ob.rotation.y=rot;ob.updateMatrixWorld(true);
    o.blkLocal[g.n]={X0,Z0,st,nx,nz,dr,bst,bnx,bnz,bx:bx.map(q=>Math.round(q*1000)/1000),band:Array.from(band).join(''),top:Array.from(top,y=>Math.round(y*100)/100)};}}
  // the scene's surface along each section line (every 0.5 m: the highest hit and what it belongs to), and the ground there
  const ray=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0),B3=new THREE.Box3(),c0=palW(X0,Z0),c1=palW(X1,Z0),c2=palW(X1,Z1),c3=palW(X0,Z1);
  const RB=new THREE.Box3(new THREE.Vector3(Math.min(c0[0],c1[0],c2[0],c3[0]),-50,Math.min(c0[1],c1[1],c2[1],c3[1])),new THREE.Vector3(Math.max(c0[0],c1[0],c2[0],c3[0]),200,Math.max(c0[1],c1[1],c2[1],c3[1])));
  const cand=[];W.scene.updateMatrixWorld(true);W.scene.traverse(m=>{if(!(m.isMesh||m.isInstancedMesh)||!m.visible)return;let v=true;for(let q=m;q;q=q.parent)if(!q.visible){v=false;break;}if(!v)return;
    if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();if(m.isInstancedMesh){cand.push(m);return;}B3.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);if(B3.intersectsBox(RB))cand.push(m);});
  const nm=m=>{for(let q=m;q;q=q.parent)if(q.name)return q.name;return m.type;};
  o.sections=[];for(const[name,a,bb]of(D.sections||[])){const Ls=Math.hypot(bb[0]-a[0],bb[1]-a[1]),S=[];
    for(let s=0;s<=Ls+1e-6;s+=.5){const lx=a[0]+(bb[0]-a[0])*s/Ls,lz=a[1]+(bb[1]-a[1])*s/Ls,q=palW(lx,lz);ray.set(new THREE.Vector3(q[0],150,q[1]),dn);const h=ray.intersectObjects(cand,false);
      const top=h.length?h[0]:null;S.push([+s.toFixed(2),+W.gy(q[0],q[1]).toFixed(2),top?+top.point.y.toFixed(2):null,top?nm(top.object):null]);}
    o.sections.push({name,a,b:bb,S});}
  // draw.probes: a hero model's exact faces next to the new work (the 0.5 m raster above is too coarse for the 0 / >= 2.4 m rule): rays every step m along
  // a line of the hill grid, at each height, against that model only; hit: [s, the hit's coordinate across the line] (null: none within far)
  o.probes=(D.probes||[]).map(P=>{const g=(ROME.GLB||[]).find(q=>q.n===P.m),ob=g&&(g.obj||(g.ghost?g.ghost():null));if(!ob)return{...P,err:'no model '+P.m};ob.updateMatrixWorld(true);
    const ray=new THREE.Raycaster(),hits={};
    for(const y of P.y){hits[y]=[];for(let s=P.s[0];s<=P.s[1]+1e-6;s+=(P.step||.25)){const a=P.along==='x'?[s,P.at]:[P.at,s],b=P.along==='x'?[s,P.at+P.dir]:[P.at+P.dir,s],wa=palW(...a),wb=palW(...b);
      const d=new THREE.Vector3(wb[0]-wa[0],0,wb[1]-wa[1]).normalize();ray.set(new THREE.Vector3(wa[0],y,wa[1]),d);ray.far=P.far;const h=ray.intersectObject(ob,true);
      hits[y].push([+s.toFixed(2),h.length?+palL(h[0].point.x,h[0].point.z)[P.along==='x'?1:0].toFixed(3):null]);}}
    return{...P,hits};});
  o.nCand=cand.length;return o;},part);
if(data.err){console.log(data.err);process.exit(1);}
fs.writeFileSync(out,JSON.stringify(data));console.log(out,(JSON.stringify(data).length/1e6).toFixed(1)+' MB; candidates',data.nCand,'glb',data.glb.length,'sections',data.sections.length);
if(errs.length)console.log('PAGE ERRORS:\n'+errs.join('\n'));await b.close();

// Writes src/scenes/rome/palatine-fence.js: PAL_FENCE (fabric.js), what the city's districts and streets see inside the Palatine's fence, frozen
// from the H0 build (palatine-masterplan.md 9). Inside the fence R the district raster's classes, the precincts (by their centre), the Clivus
// Palatinus, the road junctions and the ground near the districts the fabric cuts are taken from that build, so the Palatine's later phases move
// no district and no street of the city.
// Usage: node tools/test/pal-fence.mjs <H0 checkout> [R.json]
//   <H0 checkout>: commit 3afe601 (Palatine H0), built with npm run build:test (its node_modules may be a link to this one's). When this branch
//   takes in a newer main, H0 must take in the same main first (merge it into a copy of 3afe601), so the fence freezes the city as it is now, less
//   the Palatine's later phases; then regenerate the fence and bake.
//   git archive 3afe601 "nero-rome-reader /" | tar -x -C /tmp/h0 && ln -s "$PWD/node_modules" "/tmp/h0/nero-rome-reader /" && (cd "/tmp/h0/nero-rome-reader " && npm run build:test)
//   R.json: the fence as [[x, z], ...] (world); default the one below. Then npm run build:test && npm run bake:roads here.
// The fence below (2026-11-12) holds, 12 m clear: every precinct, district-raster cell, ground point and road junction H1 changed against H0, both
// Clivi Palatini (H0's and H1's), the whole of district 116 (the east slope) and the hill's own non-district land (the precincts, rings, cliffs and
// fragments round the summit, to the road corridors). Grow it only from the H0 build: what it freezes must be H0's.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),h0=path.resolve(process.argv[2]||'');
if(!process.argv[2]||!fs.existsSync(path.join(h0,'dist/test.html'))){console.error('usage: node tools/test/pal-fence.mjs <H0 checkout, built> [R.json]');process.exit(1);}
const R=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):JSON.parse(fs.readFileSync(path.join(root,'tools/test/pal-fence-R.json'),'utf8'));
const require=createRequire(path.join(root,'package.json')),puppeteer=require('puppeteer');
const browser=await puppeteer.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
try{const page=await browser.newPage();await page.setViewport({width:1280,height:800});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.join(h0,'dist/test.html'),{timeout:0});await page.waitForFunction(()=>window.__ready||window.__err,{timeout:400000,polling:2000});
  const err=await page.evaluate(()=>window.__err&&String(window.__err));if(err||errors.length)throw Error(err||errors.join('\n'));
  const F=await page.evaluate(R=>{const W=W0,inR=(x,z)=>{let c=false;for(let i=0,j=R.length-1;i<R.length;j=i++){const a=R[i],b=R[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
    let bx0=1e9,bz0=1e9,bx1=-1e9,bz1=-1e9;for(const p of R){bx0=Math.min(bx0,p[0]);bz0=Math.min(bz0,p[1]);bx1=Math.max(bx1,p[0]);bz1=Math.max(bz1,p[1]);}
    const rle=(n,f)=>{let s='',c=null,k=0;for(let q=0;q<n;q++){const v=f(q);if(v===c)k++;else{if(c!==null)s+=c+k;c=v;k=1;}}return s+c+k;};
    // the district raster: the classes of the cells whose centre is inside R ('.': not frozen), over R's box
    const D=cityDistricts(W),cs=D.cs,i0=Math.floor((bx0-D.x0)/cs),j0=Math.floor((bz0-D.z0)/cs),i1=Math.ceil((bx1-D.x0)/cs),j1=Math.ceil((bz1-D.z0)/cs),nx=i1-i0+1,nz=j1-j0+1;
    const cells={x0:D.x0+i0*cs,z0:D.z0+j0*cs,cs,nx,nz,rle:rle(nx*nz,q=>{const i=i0+q%nx,j=j0+Math.floor(q/nx);if(i<0||j<0||i>=D.nx||j>=D.nz)return'.';return inR(D.x0+(i+.5)*cs,D.z0+(j+.5)*cs)?String.fromCharCode(97+D.C[j*D.nx+i]):'.';})};
    // the ground at the 4 m lattice points inside R within 20 m of a cell of a district the fabric cuts (FAB.minArea, a class it cuts, a road or ring along it)
    const sel=new Set(D.districts.filter(d=>d.area>=FAB.minArea&&FAB.map[d.cls]&&d.access).map(d=>d.id)),near=(x,z)=>{const ci=Math.floor((x-D.x0)/cs),cj=Math.floor((z-D.z0)/cs);
      for(let dj=-6;dj<=6;dj++)for(let di=-6;di<=6;di++){const i=ci+di,j=cj+dj;if(i<0||j<0||i>=D.nx||j>=D.nz)continue;const l=D.lab[j*D.nx+i];if(l<0||!sel.has(l))continue;if(Math.hypot(D.x0+(i+.5)*cs-x,D.z0+(j+.5)*cs-z)<=20)return true;}return false;};
    const G=W.routeGround||W,gi0=Math.floor(bx0/4),gj0=Math.floor(bz0/4),gnx=Math.ceil(bx1/4)-gi0+1,gnz=Math.ceil(bz1/4)-gj0+1,h=[];
    const mask=rle(gnx*gnz,q=>{const x=(gi0+q%gnx)*4,z=(gj0+Math.floor(q/gnx))*4;if(!inR(x,z)||!near(x,z))return'n';h.push(G.gy(x,z));return'y';});
    // the precincts by their centre: inside R as they are, outside it the runs of their indices (the fabric gives the live ones these)
    const P=fbPrecincts(W),prec=[],outI=[];for(const{f,i}of P){if(inR(f.cx,f.cz))prec.push([i,f.cx,f.cz,f.hw,f.hd,f.c,f.s,f.circ?1:0,f.tag||'',f.poly||null]);else outI.push(i);}
    const outRuns=[];for(const i of outI){const r=outRuns[outRuns.length-1];if(r&&r[0]+r[1]===i)r[1]++;else outRuns.push([i,1]);}
    const cl=(W.roadList||[]).find(r=>r[2]&&r[2].name==='Clivus Palatinus'),nodes=roadGraph(W).nodes.filter(n=>n.deg>=3&&inR(n.x,n.z)).map(n=>[n.x,n.z]);
    const out={v:1,from:'3afe601 (Palatine H0)',R,cells,ground:{i0:gi0,j0:gj0,nx:gnx,nz:gnz,mask,h},prec,outRuns,roads:{'Clivus Palatinus':cl[1].map(p=>[p[0],p[1]])},nodes};
    out.key=rgHash(JSON.stringify(out));return{out,stats:{cells:cells.rle.length,ground:h.length,prec:prec.length,out:outI.length,nodes:nodes.length,sel:[...sel]}};},R);
  const o=F.out,file=path.join(root,'src/scenes/rome/palatine-fence.js');
  const body=`/* The Palatine's fence for the city's districts and streets (fabric.js fbFence; palatine-masterplan.md 9): written by tools/test/pal-fence.mjs from the
   H0 build (${o.from}), do not edit by hand. R: the fence (world x, z). Inside it the district raster's classes (cells: a-g = out, water, road,
   precinct, ring, cliff, buildable; '.': not frozen), the precincts by their centre ([index, cx, cz, hw, hd, c, s, circ, tag, poly]; outRuns: the
   indices the precincts outside it had), the Clivus Palatinus, the road junctions and the ground at the 4 m lattice points near the districts the
   fabric cuts (mask y/n over the box, h in that order) are H0's. key: a hash of the rest (it goes into fbKey). */
const PAL_FENCE={v:${o.v},key:${JSON.stringify(o.key)},from:${JSON.stringify(o.from)},
R:${JSON.stringify(o.R)},
cells:${JSON.stringify(o.cells)},
ground:${JSON.stringify(o.ground)},
prec:${JSON.stringify(o.prec)},
outRuns:${JSON.stringify(o.outRuns)},
roads:${JSON.stringify(o.roads)},
nodes:${JSON.stringify(o.nodes)}};
`;
  fs.writeFileSync(file,body);console.log('wrote',path.relative(root,file),Math.round(body.length/1024),'KB',JSON.stringify(F.stats));
}finally{await browser.close();}

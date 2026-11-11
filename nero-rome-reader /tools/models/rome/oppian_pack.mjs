// Pack the Oppian halls (the octagon wing of the Golden House) for the page: assets/models/oppian/oppian_s1.glb (state 7), oppian_s3.glb and
// oppian_court.glb (state 8: the halls finished, the inner court's garden and stairs down to the colonnade).
// Source: GPT's models/S1.glb, S3.glb, court.glb (renders/domus-aurea/oppian-model-v2, tools/models/construction/oppian/build_v2.py; v1 had no court).
// Drops the schematic hillside (*site-context: the page has its own ground) and the ground target (*ground-target: the page cuts its terrain to
// court_ground-target.csv instead, oppian-court-ground.js). Files that are not quantized yet are welded and quantized (positions 14 bit, normals 8 bit,
// texture coordinates 12 bit where they fit; KHR_mesh_quantization, which three.js reads); v2 comes quantized. The build gzips them into dist/oppian-assets.js.
// Usage: node tools/models/rome/oppian_pack.mjs [model dir]   (needs Node.js and npm; installs @gltf-transform 4 into a temp folder)
import {execFileSync} from 'node:child_process';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const src=process.argv[2]||path.join(root,'renders/domus-aurea/oppian-model-v2/models'),out=path.join(root,'assets/models/oppian');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'oppian-pack-'));
execFileSync('npm',['i','--prefix',tmp,'--no-audit','--no-fund','@gltf-transform/core@4','@gltf-transform/functions@4','@gltf-transform/extensions@4'],{stdio:'ignore'});
const imp=p=>{const dir=path.join(tmp,'node_modules',p),pk=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8')),e=pk.exports&&pk.exports['.'],f=(e&&(e.import&&(e.import.default||e.import)||e.default))||pk.module||pk.main;return import(pathToFileURL(path.join(dir,typeof f==='string'?f:f.default)).href);};
const {NodeIO}=await imp('@gltf-transform/core'),{prune,dedup,weld,quantize}=await imp('@gltf-transform/functions'),{ALL_EXTENSIONS}=await imp('@gltf-transform/extensions');
fs.mkdirSync(out,{recursive:true});const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
for(const s of['S1','S3','court']){const f=path.join(src,s+'.glb');if(!fs.existsSync(f)){console.error('missing '+f);process.exit(1);}
  const d=await io.read(f);for(const n of d.getRoot().listNodes())if(/site-context|ground-target/.test(n.getName()))n.dispose();
  const q=d.getRoot().listExtensionsUsed().some(e=>e.extensionName==='KHR_mesh_quantization');
  await d.transform(...(q?[prune(),dedup()]:[prune(),dedup(),weld(),quantize({quantizePosition:14,quantizeNormal:8,quantizeTexcoord:12})]));
  const o=path.join(out,'oppian_'+s.toLowerCase()+'.glb');await io.write(o,d);console.log(o,(fs.statSync(f).size/1e6).toFixed(2)+' MB ->',(fs.statSync(o).size/1e6).toFixed(2)+' MB');}
fs.rmSync(tmp,{recursive:true,force:true});

/* Review mode (?review; author, 2026-10-27, after Bertil Chapuis's world preview). A panel that switches the scene's layers by what they are
   (ground, houses, squares, trees ...) with each one's size, and draws the generator's own lines over the 3D view: main road centres, lot outlines,
   the squares by kind (F0-F4 and what stands there), the street centre field the dirt ruts follow, zone edges.
   The lines live in their own scene, drawn after the painterly post-processing (which smeared 1 px lines away).
   Meshes are tagged where they are made (layTag); a layer hides through each mesh's three.js layer mask, so the app's own visible flags (story
   layers, states) are never touched. Shift-click a layer to show it alone. Counts are what the current state draws. */
const REVIEW=/[?&]review/.test(location.search);
const REV_LAYERS=[['ground','地形'],['water','水面'],['streets','街道地面'],['houses','房子'],['squares','小广场'],['stairs','台阶'],['roadDetail','路面细节'],
  ['models','模型'],['columns','柱子'],['trees','树'],['people','人'],['story','故事图层'],['far','城外'],['other','纪念建筑及其他']];
const REV_LINES=[['roads','主路中线','#ff8a3d'],['lots','地块轮廓','#58a8ff'],['faces','小广场 F0–F4','#59e08a'],['field','街心线（车辙）','#ffd84a'],['zones','分区边界','#e05cff']];
const REV_FACE={F0:'#9a9a9a',F1:'#59e08a',F2:'#3fd0e0',F3:'#5b8cff',F4:'#ff7ac8',blocked:'#ff4040'};
const REV_WHAT={tree:'大树祭坛',compitum:'路口神龛',lacus:'水池',temple:'小庙',fountain:'喷泉',garden:'小园林',lane:'双三角'};
const REV_ZONE={dense:'#ff5a5a',mid:'#ffb347',domus:'#7be07b',ware:'#c99a5b'};
const REV={scene:null,off:{},lines:{},objs:{},info:{},stats:null,t:0,ti:0,el:null,labels:[],collapsed:false,blank:null,stTex:null};
const revFmt=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?Math.round(n/1e3)+'k':n>=1e3?(n/1e3).toFixed(1)+'k':String(Math.round(n));
function revSave(){try{localStorage.setItem('nero-review-v1',JSON.stringify({off:REV.off,lines:REV.lines,collapsed:REV.collapsed}));}catch(e){}}
function revLoad(){try{const s=JSON.parse(localStorage.getItem('nero-review-v1')||'null');if(s){REV.off=s.off||{};REV.lines=s.lines||{};REV.collapsed=!!s.collapsed;}}catch(e){}}

// what a mesh is: its own tag or its nearest tagged parent; Antium and Ostia are 'far'; the story layers' untagged pieces are 'story'
function revClass(o){for(let p=o;p&&p!==W0.scene;p=p.parent){if(p.userData.lay)return p.userData.lay;if(p.name==='antiumBase'||p.name==='ostiaBase')return'far';if(p.userData.revStory)return'story';}return'other';}
function revShown(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
// apply the switches to every mesh (new ones too: the GLBs arrive late) and count what is drawn
function revScan(){const S={};for(const[k]of REV_LAYERS)S[k]={tri:0,n:0,copies:0};
  W0.scene.traverse(o=>{if(!o.isMesh)return;const k=o.userData.revK||(o.userData.revK=revClass(o));if(!S[k])return;
    if(REV.off[k]){if(o.layers.mask){o.userData.revMask=o.layers.mask;o.layers.mask=0;}}else if(o.layers.mask===0&&o.userData.revMask!=null){o.layers.mask=o.userData.revMask;}
    if(!revShown(o))return;const g=o.geometry,c=o.isInstancedMesh?o.count:1,t=g?(g.index?g.index.count:g.attributes.position?g.attributes.position.count:0)/3:0;
    S[k].tri+=t*c;S[k].n++;if(o.isInstancedMesh)S[k].copies+=c;});
  // the streets are painted by the terrain shader: switching them off swaps their texture for an empty one
  if(U.uSt){if(!REV.blank){REV.blank=new THREE.DataTexture(new Uint8Array(4),1,1,THREE.RGBAFormat);REV.blank.needsUpdate=true;}
    if(REV.off.streets&&U.uSt.value!==REV.blank){REV.stTex=U.uSt.value;U.uSt.value=REV.blank;}else if(!REV.off.streets&&U.uSt.value===REV.blank&&REV.stTex)U.uSt.value=REV.stTex;}
  REV.stats=S;}
// the meaning behind each layer's size (lots, squares, trees ...)
function revNote(k,s){const W=W0;
  if(k==='houses')return'地块 '+revFmt((W.lotLog||[]).length);
  if(k==='squares'){const n=(W.faceLog||[]).filter(e=>e.kind!=='F0'&&e.kind!=='blocked').length;return n+' 块';}
  if(k==='stairs')return W.nStairs!=null?W.nStairs+' 段':'';
  if(k==='streets'){const S=W.street;if(!S)return'';if(!REV.stArea){const a=[0,0,0,0];for(const v of S.grd)a[v]++;const h=S.cs*S.cs/1e4;REV.stArea=`土 ${Math.round(a[1]*h)} · 石 ${Math.round(a[2]*h)} · 大理石 ${Math.round(a[3]*h)} 公顷`;}return REV.stArea;}
  if(s&&s.copies)return revFmt(s.copies)+' 份';return'';}

/* ---------- the generator's lines ---------- */
function revDrape(arr,cols,P,closed,step,lift,c){const n=P.length,m=closed?n:n-1;
  for(let i=0;i<m;i++){const a=P[i],b=P[(i+1)%n],k=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
    for(let s=0;s<k;s++){const t0=s/k,t1=(s+1)/k,x0=a[0]+(b[0]-a[0])*t0,z0=a[1]+(b[1]-a[1])*t0,x1=a[0]+(b[0]-a[0])*t1,z1=a[1]+(b[1]-a[1])*t1;
      arr.push(x0,W0.gy(x0,z0)+lift,z0,x1,W0.gy(x1,z1)+lift,z1);if(cols)cols.push(c.r,c.g,c.b,c.r,c.g,c.b);}}}
function revLineObj(arr,cols,col,op){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
  if(!cols){const c=new THREE.Color(col),n=arr.length/3;cols=new Float32Array(n*3);for(let i=0;i<n;i++){cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}}g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:op,depthTest:false,depthWrite:false,fog:false,toneMapped:false}));
  m.renderOrder=999;m.frustumCulled=false;m.userData.lay='overlay';return m;}
const REV_BUILD={
  roads(){const W=W0,a=[],C=[],o=new THREE.Color('#ff8a3d'),q=new THREE.Color('#ffd0a0');let km=0;
    for(const[w,P]of W.roadList||[]){revDrape(a,C,P,false,8,.9,o);for(let i=1;i<P.length;i++)km+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1])/1e3;}
    for(const r of W.nobleRoads||[])revDrape(a,C,[r.a,r.b],false,8,.9,q);return{obj:revLineObj(a,C,0,.95),note:`${(W.roadList||[]).length} 条 · ${km.toFixed(1)} km`};},
  lots(){const W=W0,a=[];let n=0;const add=P=>{if(P&&P.length>2){revDrape(a,null,P,true,6,.35);n++;}};
    for(const l of W.lotLog||[])add(l.L);for(const e of W.residentialEnvelopes||[])add(e.polygon);for(const p of W.nobleParcels||[])add(p.polygon);for(const w of W.warehouseLog||[])add(w.polygon);
    return{obj:revLineObj(a,null,'#58a8ff',.75),note:revFmt(n)+' 块'};},
  faces(){const W=W0,a=[],C=[],cnt={};for(const e of W.faceLog||[]){if(!e.P)continue;cnt[e.kind]=(cnt[e.kind]||0)+1;revDrape(a,C,e.P,true,4,.7,new THREE.Color(REV_FACE[e.kind]||'#ffffff'));}
    return{obj:revLineObj(a,C,0,1),note:Object.keys(cnt).sort().map(k=>`${k==='blocked'?'被占':k} ${cnt[k]}`).join(' · ')};},
  // per 10 m cell: the street centre the ruts follow (streets.js T2: doubled-angle direction, centre offset along the normal, rut strength)
  field(){const S=W0.street;if(!S||!S.cen)return{obj:revLineObj([],null,'#ffd84a',1),note:'无'};const{x0,z0,cs,nx,nz,st,cen,nxc,NC}=S,nzc=cen.length/4/nxc,has=new Uint8Array(nxc*nzc);
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(st[j*nx+i])has[Math.floor(j/NC)*nxc+Math.floor(i/NC)]=1;
    const a=[],C=[],hi=new THREE.Color('#ffd84a'),lo=new THREE.Color('#a08a40'),L=NC*cs*.45;let n=0,ruts=0;
    for(let k=0;k<nxc*nzc;k++){if(!has[k])continue;const ic=k%nxc,jc=(k-ic)/nxc,th=.5*Math.atan2(cen[k*4+1]/255*2-1,cen[k*4]/255*2-1),tx=Math.cos(th),tz=Math.sin(th),
        off=(cen[k*4+3]/255*2-1)*8,cx=x0+(ic+.5)*NC*cs-Math.sin(th)*off,cz=z0+(jc+.5)*NC*cs+Math.cos(th)*off,rut=cen[k*4+2]>0;
      revDrape(a,C,[[cx-tx*L,cz-tz*L],[cx+tx*L,cz+tz*L]],false,L*2,.8,rut?hi:lo);n++;if(rut)ruts++;}
    return{obj:revLineObj(a,C,0,.9),note:`${revFmt(n)} 格 · 有车辙 ${revFmt(ruts)}`};},
  // zone edges, sampled every 16 m: each zone's own edge in its colour, 1.5 m inside it (two zones meeting show two lines)
  zones(){const a=[],C=[],seen={},D=16;
    for(const{zone,ext}of W0.blockZones||[]){const nx=Math.ceil((ext[2]-ext[0])/D),nz=Math.ceil((ext[3]-ext[1])/D),K=new Array(nx*nz);
      for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let z=null;try{z=zone(ext[0]+(i+.5)*D,ext[1]+(j+.5)*D);}catch(e){}K[j*nx+i]=z&&z.kind||null;}
      const kd=(i,j)=>i<0||j<0||i>=nx||j>=nz?null:K[j*nx+i];
      for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=K[j*nx+i];if(!k)continue;seen[k]=1;const c=new THREE.Color(REV_ZONE[k]||'#e05cff'),x=ext[0]+i*D,z=ext[1]+j*D,e=1.5;
        if(kd(i-1,j)!==k)revDrape(a,C,[[x+e,z],[x+e,z+D]],false,D,1,c);if(kd(i+1,j)!==k)revDrape(a,C,[[x+D-e,z],[x+D-e,z+D]],false,D,1,c);
        if(kd(i,j-1)!==k)revDrape(a,C,[[x,z+e],[x+D,z+e]],false,D,1,c);if(kd(i,j+1)!==k)revDrape(a,C,[[x,z+D-e],[x+D,z+D-e]],false,D,1,c);}}
    return{obj:revLineObj(a,C,0,.9),note:Object.keys(seen).map(k=>`<i style="color:${REV_ZONE[k]||'#e05cff'}">■</i>${k}`).join(' ')};}};
function revLines(){for(const[k]of REV_LINES){const want=!!REV.lines[k];let L=REV.objs[k];
    if(want&&!L){const t0=performance.now();L=REV.objs[k]=REV_BUILD[k]();L.ms=Math.round(performance.now()-t0);REV.scene.add(L.obj);}
    if(L)L.obj.visible=want;}}

/* ---------- labels on the squares near the view ---------- */
function revLabels(){const box=REV.lab;if(!box)return;const on=!!REV.lines.faces,list=on?(W0.faceLog||[]).filter(e=>e.P):[];const T=view.tgt,R=Math.max(200,view.dist*.9);
  const near=list.map(e=>[Math.hypot(e.c[0]-T.x,e.c[1]-T.z),e]).filter(d=>d[0]<R).sort((p,q)=>p[0]-q[0]).slice(0,40),q=new THREE.Vector3(),Wd=innerWidth,H=innerHeight;
  while(REV.labels.length<near.length){const d=document.createElement('div');d.className='rev-lab';box.appendChild(d);REV.labels.push(d);}
  REV.labels.forEach((d,i)=>{const e=near[i]&&near[i][1];if(!e){d.style.display='none';return;}q.set(e.c[0],W0.gy(e.c[0],e.c[1])+2,e.c[1]).project(camera);
    if(q.z>1||Math.abs(q.x)>1.05||Math.abs(q.y)>1.05){d.style.display='none';return;}const t=(e.kind==='blocked'?'被占':e.kind)+(e.what?' '+(REV_WHAT[e.what]||e.what):'');
    if(d.textContent!==t)d.textContent=t;d.style.borderColor=REV_FACE[e.kind]||'#fff';d.style.display='';d.style.transform=`translate(${((q.x*.5+.5)*Wd).toFixed(1)}px,${((-q.y*.5+.5)*H).toFixed(1)}px) translate(-50%,-50%)`;});}

/* ---------- the panel ---------- */
function revRender(){const el=REV.el;if(!el)return;const S=REV.stats||{};
  const rows=REV_LAYERS.map(([k,n])=>{const s=S[k]||{tri:0,n:0,copies:0},note=revNote(k,s),size=k==='streets'?'':s.n?revFmt(s.tri)+' △':'—';
    return`<label class="rev-row${REV.off[k]?' off':''}" data-k="${k}"><input type="checkbox"${REV.off[k]?'':' checked'}><span class="rev-n">${n}</span><span class="rev-note">${note}</span><span class="rev-c">${size}</span></label>`;}).join('');
  const lines=REV_LINES.map(([k,n,c])=>{const L=REV.objs[k];return`<label class="rev-row" data-l="${k}"><input type="checkbox"${REV.lines[k]?' checked':''}><i class="rev-sw" style="background:${c}"></i><span class="rev-n">${n}</span><span class="rev-note">${L&&REV.lines[k]?L.note:''}</span></label>`;}).join('');
  el.querySelector('.rev-layers').innerHTML=rows;el.querySelector('.rev-lines').innerHTML=lines;}
function revInfo(){const el=REV.el;if(!el)return;const T=view.tgt,r=renderer.info.render;
  el.querySelector('.rev-info').innerHTML=`视点 <b>${Math.round(T.x)}, ${Math.round(T.z)}</b> · 高 ${Math.round(W0.gy(T.x,T.z))} m · 距离 ${Math.round(view.dist)} m<br>本帧 ${revFmt(r.triangles)} 三角形 · ${r.calls} 次绘制`;}
function reviewInit(){revLoad();REV.scene=new THREE.Scene();for(const G of Object.values(W0.layers||{}))G.userData.revStory=1;for(const G of Object.values(W0.preLayers||{}))G.userData.revStory=1;
  for(const o of[typeof skyMesh!=='undefined'&&skyMesh,typeof rain!=='undefined'&&rain,typeof birds!=='undefined'&&birds])if(o)o.userData.lay='env';
  renderer.info.autoReset=false;
  const st=document.createElement('style');st.textContent=`
#rev{position:fixed;top:12px;left:12px;z-index:9000;width:300px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;background:rgba(22,17,13,.86);color:#f1e6cf;
  font:12px/1.45 -apple-system,system-ui,"PingFang SC",sans-serif;font-variant-numeric:tabular-nums;border:1px solid rgba(201,162,78,.35);border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.35)}
#rev header{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:pointer;user-select:none;border-bottom:1px solid rgba(201,162,78,.2)}
#rev header b{flex:1;font-weight:600;letter-spacing:.04em}#rev.collapsed header{border-bottom:0}#rev.collapsed .rev-body{display:none}
#rev .rev-body{padding:6px 10px 10px}#rev h4{margin:8px 0 3px;font-size:11px;font-weight:600;color:#c6b597;letter-spacing:.06em}
#rev .rev-info{color:#c6b597;font-size:11px}#rev .rev-info b{color:#f1e6cf;font-weight:600}
#rev .rev-row{display:grid;grid-template-columns:16px auto 1fr auto;align-items:center;gap:6px;padding:1px 0;cursor:pointer}
#rev .rev-row[data-l]{grid-template-columns:16px 10px auto 1fr}
#rev .rev-row.off .rev-n{color:#8c7f6a;text-decoration:line-through}#rev .rev-row input{margin:0;accent-color:#c9a24e}
#rev .rev-note{color:#9f927c;font-size:11px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#rev .rev-note i{font-style:normal}
#rev .rev-c{color:#e9cf8f;min-width:52px;text-align:right}#rev .rev-sw{width:10px;height:10px;border-radius:2px;display:block}
#rev .rev-tools{display:flex;gap:6px;margin-top:8px}#rev button{font:inherit;font-size:11px;color:#f1e6cf;background:rgba(201,162,78,.16);border:1px solid rgba(201,162,78,.35);border-radius:4px;padding:2px 8px;cursor:pointer}
#rev .rev-hint{color:#8c7f6a;font-size:10.5px;margin-top:6px}
#rev-labs{position:fixed;inset:0;pointer-events:none;z-index:8999;overflow:hidden}
.rev-lab{position:absolute;left:0;top:0;font:11px/1.2 -apple-system,system-ui,"PingFang SC",sans-serif;color:#fff;background:rgba(0,0,0,.6);border:1px solid #fff;border-radius:9px;padding:1px 6px;white-space:nowrap}`;
  document.head.appendChild(st);const lab=document.createElement('div');lab.id='rev-labs';document.body.appendChild(lab);REV.lab=lab;
  const el=document.createElement('div');el.id='rev';if(REV.collapsed)el.classList.add('collapsed');
  el.innerHTML=`<header><b>审查</b><span class="rev-tog">${REV.collapsed?'▸':'▾'}</span></header><div class="rev-body"><div class="rev-info"></div><h4>图层（按住 Shift 点击只看这一层）</h4><div class="rev-layers"></div>
    <h4>生成器的线</h4><div class="rev-lines"></div><div class="rev-tools"><button data-a="all">全部显示</button><button data-a="copy">复制视点坐标</button></div>
    <div class="rev-hint">数量是当前时期画出来的：△ 三角形，份 实例。线穿透建筑显示。</div></div>`;
  document.body.appendChild(el);REV.el=el;
  el.querySelector('header').onclick=()=>{REV.collapsed=!REV.collapsed;el.classList.toggle('collapsed',REV.collapsed);el.querySelector('.rev-tog').textContent=REV.collapsed?'▸':'▾';revSave();};
  el.addEventListener('click',ev=>{const row=ev.target.closest('.rev-row');if(row){ev.preventDefault();
      if(row.dataset.k){const k=row.dataset.k;if(ev.shiftKey){for(const[j]of REV_LAYERS)REV.off[j]=j!==k;}else REV.off[k]=!REV.off[k];revScan();}
      else{const k=row.dataset.l;REV.lines[k]=!REV.lines[k];if(REV.lines[k]&&!REV.objs[k])row.querySelector('.rev-note').textContent='计算中…';setTimeout(()=>{revLines();revRender();},20);}
      revSave();revRender();return;}
    const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.a==='all'){REV.off={};revScan();revSave();revRender();}
    if(b.dataset.a==='copy'){const t=`${Math.round(view.tgt.x)}, ${Math.round(view.tgt.z)}`;try{navigator.clipboard.writeText(t).then(()=>{b.textContent='已复制 '+t;},()=>{b.textContent=t;});}catch(e){b.textContent=t;}setTimeout(()=>b.textContent='复制视点坐标',2500);}});
  ['pointerdown','wheel','keydown'].forEach(t=>el.addEventListener(t,e=>e.stopPropagation()));
  revScan();revLines();revRender();revInfo();}
// every frame after the render: labels every other frame, the readout twice a second, a rescan each second (late GLBs, state changes)
function reviewTick(){const now=performance.now();if(nFrame%2===0)revLabels();
  if(REV.scene.children.some(o=>o.visible)){const ac=renderer.autoClear;renderer.autoClear=false;renderer.setRenderTarget(null);renderer.render(REV.scene,camera);renderer.autoClear=ac;}
  if(now-REV.ti>500){REV.ti=now;revInfo();}renderer.info.reset();
  if(now-REV.t>1000){REV.t=now;revScan();if(!REV.collapsed)revRender();}}

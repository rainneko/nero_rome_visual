/* Antium · scene entry: layers, labels, camera views, and the GLB core assets. Called from buildRomeLayers(W,L).
   Zones (east -> west): gate + guard barracks · lower garden · workshop yard (south-east) · palace tiers 1-2 · upper
   palace · summit court with the observation tower; the side-hall rock north of the upper palace; harbour and town south. */
function buildAntium(W,L){const AX=ANT.AX,AZ=ANT.AZ,R=ANT.ROCK;W.AO=[AX,AZ];W.hA=antH;if(!MAT.antSea)MAT.antSea=waterMat('antsea',[.02,.12,.18],.3);ANT.GLB=[];
  L('antiumBase',0,(g,G)=>{antTerrain(G);antFortress(W,g,G);antIslet(W,g,G);antHarbour(W,g,G);antWorkshop(W,g,G);});
  L('antiumLab',0,(g,G)=>{antWorks(W,g,G);});
  const zs=antSpZ,ap=(n,l,x,z,y,s0,info)=>W.pois.push({n,l,x:AX+x,z:AZ+z,y,s0,s1:99,d:1100,pg:'antium',info});
  const tw=W.antTower,br=W.antBridge;
  ap('安齐奥行宫','Villa Antiatina',60,zs(60),62,0,'【史】尼禄生在安齐奥，这里的皇家别墅沿海岸展开。书中：“皇家行宫沿着悬崖一层一层往上盖，白墙，红瓦，每一层都有一条朝海的长廊。” 沙盘按功能分区：城门与卫营、下层花园、工坊院、两层翼楼台地、主殿、山顶观景台；北面隔着深谷是侧殿岩。');
  ap('城门','日耳曼卫营',300,zs(300),50,0,'海角和陆地相连处唯一的门：一座门楼两座方塔，门洞里是铁栅门。门内北侧是日耳曼卫队的营房。书中：“调两百个最好的日耳曼人去安齐奥，修铁门，设两道哨卡。”');
  ap('下层花园','柏树大道',175,zs(175),40,0,'城门到宫殿之间的花园：柏树大道、花坛、喷泉，北墙下一道长柱廊；临崖的圆形双圈柱廊花园紧贴第二层台地的墙，离东南角的工坊院很远，院子北边和西边砌了一道墙把两处隔开。书中没有写安齐奥的花园，这一区按参考图和罗马别墅的惯例补上。');
  ap('悬崖工坊','石台阶',244,zs(244)+61,46,0,'书中：“悬崖上的工坊已经完全变了样。” 工坊大厅在海角东南角的院子里，门外是石台阶（书中：“一个人坐在工坊大门外的石台阶上吹海风”）。');
  ap('翼楼台地','朝海长廊',33,zs(33),66,0,'第二层是客房和文书翼楼：赭黄灰泥，满铺草坪，种橄榄树。第三层是礼仪翼楼：白灰泥，楼小一圈，铺石庭院里一条长水池，两头立雕像。两层的楼外侧都是朝海的长廊（书中：“每一层都有一条朝海的长廊”）。');
  ap('大理石台阶','登山大道',112,zs(112),44,0,'从城门一路登上主殿：花园、第一层台地、第二层台地、主殿平台，每段台阶两侧立雕像。');
  ap('主殿','回廊与寝殿',-140,zs(-140),80,0,'尼禄的主殿：四角方塔，正中是回廊。书中：“我在回廊正中的青铜祭坛边上，留了一个一指宽的小缺口。” 西侧朝海的一面是寝殿，后来装上了两扇青铜框的玻璃窗。');
  ap('观测塔','引雷铁矛',ANT.SUM[0],ANT.SUM[1],tw?tw[1]+16:110,0,'海角尽头、全宫最高处的大理石观测塔，塔后就是断崖和海。书中：“最高的那一层，原本是先帝们看海用的观景台。现在台子上立着一根三丈高的铁矛，矛尖镀了银。”');
  ap('圆形神庙','福尔图娜',-205,zs(-205)+20,74,0,'观景台旁的小圆庙。【史】安齐奥以福尔图娜神庙和神谕闻名（Fortunae Antiates）。');
  ap('大理石窄桥','仅有一桥相连',br[0]-AX,br[2]-AZ,br[1]+10,0,'书中：“大理石窄桥两侧没有栏杆，下面是几十丈深的黑礁石。” 主殿一头的桥头堡里是铁门：“桥头有铁门，门后站着日耳曼人，二十个，轮班，从不说话。”');
  ap('侧殿·暗室','三面绝壁',R.x,R.z-4,72,0,'书中：“安齐奥靠悬崖那一整座侧殿，给你。三面绝壁，只有一座窄桥连着主宫。” 侧殿西头那间是暗室：“侧殿最里面那间屋子，窗户全用黑羊毛毡钉死了。白天进去，也要点灯。”');
  ap('悬崖马道','一边石墙一边海',150,antWallZ(150,-1)-6,40,0,'书中：“悬崖上有一条马道，沿着岩岬绕半圈，一边是石墙，一边是海。” 墙根下有海神小龛（书中：“墙根底下有一个很小的神龛，供的是海神”），西头是终点的高台。');
  ap('镗床水轮','临海玄武岩',244,zs(244)+antHalfW(244,1)-2,16,1,'崖下临海的玄武岩上：镗床房和水轮，一道石阶贴着崖壁通上工坊院。书中：“在临海的天然玄武岩上就地浇筑了一座重达十吨的基座。高处引来的山泉冲刷着巨大的木制水轮”');
  ap('铅室','大槽房',238,zs(238)+40,40,1,'书中：“工坊后面的空地上，用铅板焊起了一座大槽房”，冒着白烟，工匠们叫它“冥王的锅”。');
  ap('葡萄藤凉亭','老无花果树',254,zs(254)+36,36,1,'书中：“粗糙的凉亭顶上攀爬着密匝的葡萄藤”“亭子旁是一株极老的多花无花果树”');
  ap('安齐奥港','Portus Antiatinus',300,230,14,0,'书中：“岬角的南面是港口，渔船挤在一起，桅杆像一片光秃秃的林子。”【史】尼禄在安齐奥修了新港，两道防波堤。');
  ap('安齐奥镇','城',470,170,30,0,'书中写“城建在一段向海里伸出去的岩岬上”。沙盘把镇子放在海角根部的陆地和港湾边，海角上只有行宫。');
  ap('栈桥','水泥入海',268,130,8,1,'试验水泥方石的木栈桥。');
  const T=ANT.SUM;
  Object.assign(W.views,{antium:{n:'安齐奥全景',pg:'antium',pos:[AX+250,200,AZ+430],tgt:[AX-90,40,AZ-25]},
    antAxis:{n:'从城门望主殿',pg:'antium',pos:[AX+430,120,AZ+60],tgt:[AX-60,52,AZ-6]},
    antTop:{n:'俯瞰海角',pg:'antium',pos:[AX+10,520,AZ+260],tgt:[AX+10,30,AZ-10]},
    antStairs:{n:'大理石台阶',pg:'antium',pos:[AX+150,62,AZ+28],tgt:[AX+40,44,AZ+zs(40)]},
    antTower:{n:'观景台与观测塔',pg:'antium',pos:[AX-120,110,AZ+120],tgt:[AX+T[0],70,AZ+T[1]]},
    antBridge:{n:'窄桥与侧殿',pg:'antium',pos:[AX-20,92,AZ-200],tgt:[AX+br[0]-AX,48,AZ+br[2]-AZ-10]},
    antCoast:{n:'北岸与马道',pg:'antium',pos:[AX+220,80,AZ-260],tgt:[AX+60,32,AZ-60]},
    antMill:{n:'崖下水轮',pg:'antium',pos:[AX+205,34,AZ+zs(244)+150],tgt:[AX+244,9,AZ+zs(244)+94]},
    antPergola:{n:'工坊院',pg:'antium',pos:[AX+320,70,AZ+120],tgt:[AX+244,28,AZ+zs(244)+50]},
    antRoad:{n:'悬崖马道',pg:'antium',pos:[AX+300,55,AZ-110],tgt:[AX+120,30,AZ-55]},
    antGarden:{n:'下层花园',pg:'antium',pos:[AX+330,105,AZ-70],tgt:[AX+170,30,AZ+25]},
    antTiers:{n:'两层翼楼',pg:'antium',pos:[AX+185,105,AZ+175],tgt:[AX+35,45,AZ+zs(35)]},
    antHarbor:{n:'安齐奥港',pg:'antium',pos:[AX+560,150,AZ+620],tgt:[AX+300,4,AZ+260]}});}
/* ---- GLB core assets: lazily loaded from antium-assets.js (window.ANT_GLB = {name: base64}). Each placement in
   ANT.GLB replaces its stand-in. The tower's spear and copper line (materials iron/silver/copper) move to antiumLab:
   the lightning rod is put up in AD 56 (book ch. 13). ---- */
function antAtmo(mt){if(!mt||mt.userData.atmo)return;mt.userData.atmo=1;
  if(mt.name==='gold'){mt.metalness=.35;mt.roughness=.38;mt.color.setRGB(.9,.62,.22);mt.emissive=new THREE.Color(.17,.1,.02);}
  if(mt.name==='water'){mt.transparent=true;mt.opacity=.82;mt.roughness=.05;}
  if(mt.name==='tuff')mt.color.setRGB(.2,.18,.15);if(mt.name==='dark')mt.color.setRGB(.13,.105,.08);
  mt.onBeforeCompile=sh=>{for(const k in U)sh.uniforms[k]=U[k];
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPa;').replace('#include <project_vertex>','#include <project_vertex>\nvWPa=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+GL_NOISE+GL_ATMO+'\nvarying vec3 vWPa;').replace('#include <fog_fragment>','gl_FragColor.rgb=atmo(gl_FragColor.rgb,vWPa);');};
  mt.customProgramCacheKey=()=>'antglb';mt.needsUpdate=true;}
/* a material variant: tint = {material name: [r,g,b] multipliers}; the clones are shared between placements */
function antTint(mt,t){const f=t&&t[mt.name];if(!f)return mt;const C=antTint.c=antTint.c||{},k=mt.uuid+'|'+f.join(',');
  if(!C[k]){const c=mt.clone();c.userData=Object.assign({},mt.userData,{atmo:0});c.color.setRGB(c.color.r*f[0],c.color.g*f[1],c.color.b*f[2]);antAtmo(c);C[k]=c;}return C[k];}
function antPutModels(n,scene){scene.traverse(m=>{if(!m.isMesh)return;m.castShadow=m.receiveShadow=true;antAtmo(m.material);});
  for(const p of ANT.GLB){if(p.n!==n)continue;const Ly=W0.layers[p.layer];if(!Ly)continue;const o=scene.clone(true);o.position.set(ANT.AX+p.x,p.y,ANT.AZ+p.z);o.rotation.y=p.r;if(p.o&&p.o.sc)o.scale.setScalar(p.o.sc);if(p.o&&p.o.tint)o.traverse(q=>{if(q.isMesh)q.material=antTint(q.material,p.o.tint);});Ly.add(o);if(p.stand)p.stand.visible=false;
    if(n==='ant_tower'&&W0.layers.antiumLab){o.updateMatrixWorld(true);const mv=[];o.traverse(m=>{if(m.isMesh&&m.material&&/^(iron|silver|copper)/.test(m.material.name))mv.push(m);});for(const m of mv)W0.layers.antiumLab.attach(m);}}}
function antLoadModels(){if(ANT.loadState||typeof W0==='undefined'||!W0)return;ANT.loadState=1;
  const go=()=>{const D=window.ANT_GLB;if(!D)return;ANT.loadState=2;let left=0;const fin=()=>{if(--left<=0)window.__antReady=true;};
    for(const n of new Set(ANT.GLB.map(p=>p.n))){if(!D[n])continue;left++;try{const bin=Uint8Array.from(atob(D[n]),c=>c.charCodeAt(0)).buffer;new THREE.GLTFLoader().parse(bin,'',gl=>{antPutModels(n,gl.scene);fin();},e=>{console.warn('antium glb',n,e);fin();});}catch(e){console.warn(e);fin();}}
    if(!left)window.__antReady=true;};
  if(window.ANT_GLB){go();return;}window.antAssetsLoaded=go;const s=document.createElement('script');s.src='antium-assets.js';
  s.onerror=()=>{console.warn('antium-assets.js not found: procedural stand-ins stay');window.__antReady=true;};document.head.appendChild(s);}

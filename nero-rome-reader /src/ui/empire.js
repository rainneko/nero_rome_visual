/* ===================== 帝国地图（约公元58年，尼禄在位第四年） ===================== */
const EMPIRE=/*__EMPIRE__*/null;
const EMP_T={S:['元老院行省','#9a6b1f','总督由元老院抽签任命（前执政官或前大法官）。'],I:['皇帝行省','#9a4a25','总督是皇帝派出的使节，手里有军团。'],E:['骑士级总督','#5f6f2e','由骑士阶层的长官或财务官管理。'],M:['莱茵河军区','#7a2e22','莱茵河前线的军区，由军团统帅指挥。'],IT:['意大利','#4a3a2c','罗马城所在，不设行省总督。'],C:['附庸王国','#6a5a92','名义上自治，受罗马影响。'],X:['帝国之外','#6f6f6f','不归罗马管辖。']};
const EMP_P=[
 {id:'italia',zh:'意大利',la:'ITALIA',p:[12.6,42.6],t:'IT',n:'罗马、奥斯提亚、安齐奥、坎帕尼亚都在这里。'},
 {id:'sicilia',zh:'西西里',la:'SICILIA',p:[14.1,37.55],t:'S',n:'产粮。'},
 {id:'sardinia',zh:'撒丁与科西嘉',la:'SARDINIA ET CORSICA',p:[9.0,40.3],t:'E'},
 {id:'tarraconensis',zh:'近西班牙',la:'HISPANIA TARRACONENSIS',p:[-3.2,41.6],t:'I',leg:['第六“胜利”军团','第十“双子”军团'],n:'首府塔拉科。西北山区有金矿。60–68年的总督是加尔巴【史】。'},
 {id:'baetica',zh:'贝提卡',la:'BAETICA',p:[-5.2,37.7],t:'S',n:'银矿、铅矿、橄榄油。首府科尔杜巴。'},
 {id:'lusitania',zh:'卢西塔尼亚',la:'LUSITANIA',p:[-7.6,39.4],t:'I',g:'奥托（约58年起）【史】',n:'首府埃梅里塔。'},
 {id:'narbonensis',zh:'纳博高卢',la:'GALLIA NARBONENSIS',p:[4.3,43.95],t:'S',n:'马西利亚（马赛）在这里。'},
 {id:'aquitania',zh:'阿基坦',la:'AQUITANIA',p:[0.2,45.4],t:'I'},
 {id:'lugdunensis',zh:'卢格敦高卢',la:'GALLIA LUGDUNENSIS',p:[1.2,47.9],t:'I',n:'首府卢格杜努姆（里昂），高卢三省的中心。'},
 {id:'belgica',zh:'比利时高卢',la:'GALLIA BELGICA',p:[4.4,49.7],t:'I'},
 {id:'germinf',zh:'下日耳曼',la:'GERMANIA INFERIOR',p:[5.9,51.45],t:'M',g:'杜比乌斯·阿维图斯（58年接任）【史】',leg:['第一“日耳曼”军团','第五“云雀”军团','第十五“初创”军团','第十六“高卢”军团']},
 {id:'germsup',zh:'上日耳曼',la:'GERMANIA SUPERIOR',p:[7.2,48.5],t:'M',leg:['第四“马其顿”军团','第二十二“初创”军团','第二十一“迅猛”军团']},
 {id:'britannia',zh:'不列颠',la:'BRITANNIA',p:[-1.6,52.1],t:'I',g:'苏埃托尼乌斯·保利努斯（58年接任）【史】',leg:['第二“奥古斯都”军团','第九“西班牙”军团','第十四“双子”军团','第二十军团'],n:'43年起的行省，北边还没征服。产锡和铅。'},
 {id:'raetia',zh:'雷蒂亚',la:'RAETIA',p:[10.6,47.35],t:'E'},
 {id:'noricum',zh:'诺里库姆',la:'NORICUM',p:[14.1,47.25],t:'E',n:'出好铁。'},
 {id:'pannonia',zh:'潘诺尼亚',la:'PANNONIA',p:[17.4,46.5],t:'I',leg:['第十三“双子”军团','第十五“阿波罗”军团']},
 {id:'dalmatia',zh:'达尔马提亚',la:'DALMATIA',p:[17.4,43.9],t:'I',leg:['第十一“克劳狄”军团']},
 {id:'moesia',zh:'默西亚',la:'MOESIA',p:[23.6,43.35],t:'I',leg:['第五“马其顿”军团','第七“克劳狄”军团（约）']},
 {id:'thracia',zh:'色雷斯',la:'THRACIA',p:[25.6,42.0],t:'E',n:'46年起的行省。拜占庭（后来的君士坦丁堡）在它东南角。'},
 {id:'macedonia',zh:'马其顿',la:'MACEDONIA',p:[22.0,40.85],t:'S'},
 {id:'achaea',zh:'亚该亚（希腊）',la:'ACHAEA',p:[22.0,38.25],t:'S',n:'雅典、科林斯在这里。'},
 {id:'asia',zh:'亚细亚',la:'ASIA',p:[28.6,38.7],t:'S',n:'最富的行省之一，首府以弗所。'},
 {id:'bithynia',zh:'比提尼亚与本都',la:'BITHYNIA ET PONTUS',p:[31.4,41.0],t:'S'},
 {id:'galatia',zh:'加拉太',la:'GALATIA',p:[32.6,39.3],t:'I'},
 {id:'lycia',zh:'吕基亚与潘菲利亚',la:'LYCIA ET PAMPHYLIA',p:[30.6,36.75],t:'I'},
 {id:'cappadocia',zh:'卡帕多西亚',la:'CAPPADOCIA',p:[35.9,38.9],t:'I',g:'科尔布罗（东方统帅，54–63年）【史】',leg:['东方野战军：第三“高卢”、第六“铁甲”、第四“斯基泰”军团（58年在亚美尼亚作战）']},
 {id:'syria',zh:'叙利亚',la:'SYRIA',p:[37.4,35.0],t:'I',g:'乌米迪乌斯·夸德拉图斯（50–60年）【史】',leg:['第十“海峡”军团','第十二“闪电”军团'],n:'首府安条克。奇里乞亚东部也归它管。'},
 {id:'judaea',zh:'犹太',la:'IUDAEA',p:[35.0,31.45],t:'E',g:'财务官腓力斯，约58–60年换成非斯都【史】'},
 {id:'aegyptus',zh:'埃及',la:'AEGYPTUS',p:[30.6,27.4],t:'E',g:'长官巴尔比卢斯（55–59年）【史】',leg:['第三“昔兰尼”军团','第二十二“德约塔鲁斯”军团'],n:'罗马的粮仓，皇帝直接管。亚历山大里亚是第二大城。'},
 {id:'cyrenaica',zh:'克里特与昔兰尼',la:'CRETA ET CYRENAICA',p:[21.6,31.9],t:'S'},
 {id:'cyprus',zh:'塞浦路斯',la:'CYPRUS',p:[33.1,35.05],t:'S'},
 {id:'africa',zh:'阿非利加',la:'AFRICA PROCONSULARIS',p:[9.4,35.0],t:'S',leg:['第三“奥古斯都”军团（军团长另由皇帝任命）'],n:'迦太基是首府，产粮。'},
 {id:'mauretaniaC',zh:'毛里塔尼亚（凯撒利亚）',la:'MAURETANIA CAESARIENSIS',p:[2.4,35.4],t:'E'},
 {id:'mauretaniaT',zh:'毛里塔尼亚（廷吉塔纳）',la:'MAURETANIA TINGITANA',p:[-5.6,34.3],t:'E'},
 {id:'armenia',zh:'亚美尼亚',la:'ARMENIA',p:[43.0,40.3],t:'C',n:'罗马和帕提亚争夺的王国。58年科尔布罗攻下阿尔塔沙特【史】。'},
 {id:'parthia',zh:'帕提亚',la:'PARTHIA',p:[44.2,34.6],t:'X',n:'罗马东边的大国，首都泰西封。'},
 {id:'germania',zh:'日耳曼尼亚',la:'GERMANIA MAGNA',p:[11.8,52.4],t:'X',n:'莱茵河以东、多瑙河以北。'},
 {id:'dacia',zh:'达契亚',la:'DACIA',p:[24.6,46.3],t:'X',n:'多瑙河以北，106年才成为行省。'},
 {id:'nabataea',zh:'纳巴泰',la:'NABATAEA',p:[36.3,30.2],t:'C',n:'都城佩特拉。'},
 {id:'caledonia',zh:'喀里多尼亚',la:'CALEDONIA',p:[-4.2,56.4],t:'X'}];
const EMP_CITY=[['罗马',12.49,41.89,2],['奥斯提亚',12.29,41.75,0],['安齐奥',12.62,41.45,0],['亚历山大里亚',29.92,31.2,1],['安条克',36.16,36.2,1],['雅典',23.73,37.98,1],['迦太基',10.32,36.85,1],['塔拉科',1.25,41.12,1],['伦丁尼姆',-0.09,51.51,0],['卢格杜努姆',4.83,45.76,1],['科隆',6.96,50.94,0],['拜占庭',28.98,41.01,0],['以弗所',27.34,37.94,1],['耶路撒冷',35.23,31.78,0],['科林斯',22.88,37.91,0],['马西利亚',5.37,43.3,0],['加的斯',-6.29,36.53,0],['埃梅里塔',-6.34,38.92,0],['科尔杜巴',-4.78,37.88,0],['莱普提斯',14.29,32.64,0],['昔兰尼',21.86,32.82,0],['罗德岛',28.22,36.43,0],['阿尔塔沙特',44.55,39.96,0],['泰西封',44.58,33.09,0],['佩特拉',35.44,30.33,0],['阿奎莱亚',13.37,45.77,0],['叙拉古',15.29,37.07,0],['那不勒斯',14.27,40.85,0]];
const EMP_LEG=[['维特拉',6.45,51.65,'第五“云雀”、第十五“初创”'],['诺瓦伊修姆',6.69,51.2,'第十六“高卢”'],['波恩',7.1,50.73,'第一“日耳曼”'],['莫贡提亚库姆',8.27,50.0,'第四“马其顿”、第二十二“初创”'],['温多尼萨',8.21,47.48,'第二十一“迅猛”'],['卡农图姆',16.86,48.11,'第十五“阿波罗”'],['波埃托维奥',15.87,46.42,'第十三“双子”'],['布尔努姆',16.03,44.02,'第十一“克劳狄”'],['维米纳奇乌姆',21.21,44.74,'第七“克劳狄”（约）'],['厄斯库斯',24.48,43.7,'第五“马其顿”'],['林杜姆',-0.54,53.23,'第九“西班牙”'],['维罗科尼乌姆',-2.65,52.67,'第十四“双子”'],['伊斯卡',-3.53,50.72,'第二“奥古斯都”'],['威尔士边境（约）',-2.9,51.75,'第二十'],['西班牙西北（约）',-5.6,42.4,'第六“胜利”、第十“双子”'],['尼科波利斯',29.95,31.24,'第三“昔兰尼”、第二十二“德约塔鲁斯”'],['阿迈达拉',8.46,35.57,'第三“奥古斯都”'],['叙利亚北部（约）',36.6,36.4,'第十“海峡”、第十二“闪电”'],['科尔布罗军（亚美尼亚）',41.6,39.6,'第三“高卢”、第六“铁甲”、第四“斯基泰”']];
let EMPV=null,EMPD=null;
function empXY(lon,lat){const E=EMPIRE;return[(lon-E.LON0)*E.C*E.K,(E.LAT1-lat)*E.K];}
function buildEmpire(){const E=EMPIRE.D,o=document.createElement('div');o.id='empire';o.hidden=true;
  const st=document.createElement('style');st.textContent=`#empire{position:fixed;inset:0;z-index:70;background:#e9dfc7;display:flex;flex-direction:column;font-family:serif;color:#3b2f24}
#empire .eh{display:flex;align-items:baseline;gap:12px;padding:10px 16px;border-bottom:1px solid #b9a77f}#empire .eh b{font-size:18px}#empire[hidden]{display:none!important}#empire .einfo[hidden]{display:none!important}#empire .epg{display:flex;border:1px solid #9c6b46;border-radius:6px;overflow:hidden}#empire .epg button{font:13px serif;padding:4px 10px;border:0;background:#f6ecd6;color:#3b2f24;cursor:pointer}#empire .epg button+button{border-left:1px solid #c9b48c}#empire .eback{font:14px serif;padding:4px 12px;border:1px solid #9c6b46;border-radius:6px;background:#f6ecd6;color:#3b2f24;cursor:pointer}#empire .eh span{font-size:13px;opacity:.75}#empire .ex{margin-left:auto;font-size:22px;background:none;border:0;cursor:pointer;color:#3b2f24}
#empire svg{flex:1;width:100%;height:100%;cursor:grab;touch-action:none}#empire svg.drag{cursor:grabbing}#empire .pl{cursor:pointer;paint-order:stroke;stroke:#efe7d4;stroke-width:2.2px;stroke-linejoin:round}#empire .pl:hover{text-decoration:underline}
#empire .lg{cursor:pointer}#empire .einfo{position:absolute;right:14px;top:58px;width:min(330px,80vw);background:rgba(250,244,230,.97);border:1px solid #b9a77f;border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.6;box-shadow:0 4px 18px rgba(0,0,0,.18)}
#empire .einfo h4{margin:0;font-size:17px}#empire .einfo .la{font-size:11px;letter-spacing:.08em;opacity:.7}#empire .einfo .tp{display:inline-block;margin:6px 0;padding:1px 8px;border-radius:10px;color:#fff;font-size:12px}
#empire .elegend{position:absolute;left:14px;bottom:34px;background:rgba(250,244,230,.92);border:1px solid #b9a77f;border-radius:8px;padding:8px 10px;font-size:12px;line-height:1.7}#empire .elegend i{display:inline-block;width:12px;height:10px;margin-right:6px;vertical-align:middle;border:1px solid #9c6b46}
#empire .eattr{position:absolute;left:14px;bottom:8px;font-size:11px;opacity:.7}@keyframes empPulse{0%{r:6;opacity:.9}100%{r:26;opacity:0}}#empHL{animation:empPulse 1.6s ease-out infinite}`;document.head.appendChild(st);
  let s=`<svg viewBox="0 0 ${E.W} ${E.H}" xmlns="http://www.w3.org/2000/svg"><rect x="-2000" y="-2000" width="${E.W+4000}" height="${E.H+4000}" fill="#c4d3d0"/><path d="${E.land}" fill="#efe7d4" stroke="#b5aa90" stroke-width=".4"/><path d="${E.lakes}" fill="#c4d3d0"/>
  <path d="${E.ext}" fill="#e6c09a" stroke="#8f5f3c" stroke-width=".9"/><path d="${E.sen}" fill="#f0d998"/><path d="${E.bnd}" fill="none" stroke="#8a6a4a" stroke-width=".5" stroke-dasharray="2 1.6"/><path d="${E.riv}" fill="none" stroke="#6b93a8" stroke-width=".8" stroke-linecap="round"/><g>`;
  for(const[n,lo,la,k]of EMP_CITY){const[x,y]=empXY(lo,la);s+=k===2?`<path d="M${x} ${y-4.5}l1.3 3.2 3.4.2-2.6 2.2.9 3.3-3-1.9-3 1.9.9-3.3-2.6-2.2 3.4-.2z" fill="#8c1d18"/><text x="${x+5}" y="${y-3}" font-size="9" font-weight="bold" fill="#8c1d18">${n}</text>`:`<circle cx="${x}" cy="${y}" r="${k?1.8:1.3}" fill="#3b2f24"/><text x="${x+2.6}" y="${y+2.6}" font-size="${k?6.4:5.4}" fill="#3b2f24">${n}</text>`;}
  s+='</g><g>';EMP_LEG.forEach((L,i)=>{const[x,y]=empXY(L[1],L[2]);s+=`<g class="lg" data-l="${i}"><rect x="${x-2.4}" y="${y-2.4}" width="4.8" height="4.8" fill="#b3261e" stroke="#fff" stroke-width=".6"/><title>${L[0]}：${L[3]}</title></g>`;});
  s+='</g><g>';EMP_P.forEach((p,i)=>{const[x,y]=empXY(p.p[0],p.p[1]);const T=EMP_T[p.t];s+=`<text class="pl" data-p="${i}" x="${x}" y="${y}" text-anchor="middle" font-size="${p.t==='X'||p.t==='C'?8:9.2}" fill="${T[1]}" font-weight="bold">${p.zh}</text><text x="${x}" y="${y+6.4}" text-anchor="middle" font-size="4.6" fill="${T[1]}" opacity=".8" pointer-events="none">${p.la}</text>`;});
  s+=`</g><circle id="empHL" cx="-99" cy="-99" r="6" fill="none" stroke="#b3261e" stroke-width="2"/></svg>`;
  o.innerHTML=`<div class="eh"><button class="eback">← 返回沙盘</button><span class="epg"><button data-pg="rome">罗马</button><button data-pg="antium">安齐奥</button><button data-pg="ostia">奥斯提亚</button></span><b>罗马帝国 · 约公元58年</b><span>尼禄在位第四年。边界和驻地是示意，点地名看详情。</span><button class="ex" aria-label="关闭">×</button></div>${s}<div class="einfo" hidden></div>
  <div class="elegend"><div><i style="background:#f0d998"></i>元老院行省</div><div><i style="background:#e6c09a"></i>皇帝行省与其他属地</div><div><i style="background:#b3261e;border-color:#fff"></i>军团驻地（约）</div><div>地名颜色＝管理方式</div></div>
  <div class="eattr">边界：AWMC geodata（ODbL），以公元117年疆域为底，按公元58年示意删改；海岸与河流：Natural Earth。人名与驻地均为【史】，部分为约数。</div>`;
  document.body.appendChild(o);const svg=o.querySelector('svg');EMPV={x:0,y:0,w:E.W,h:E.H};
  const setV=()=>svg.setAttribute('viewBox',`${EMPV.x} ${EMPV.y} ${EMPV.w} ${EMPV.h}`);EMPD={setV,svg};
  o.querySelector('.ex').onclick=()=>{o.hidden=true;};o.querySelector('.eback').onclick=()=>{o.hidden=true;};o.querySelectorAll('.epg button').forEach(b=>b.onclick=()=>{o.hidden=true;if(typeof setPage==='function')setPage(b.dataset.pg);});document.addEventListener('keydown',e=>{if(e.key==='Escape')o.hidden=true;});
  svg.addEventListener('wheel',e=>{e.preventDefault();const r=svg.getBoundingClientRect(),f=Math.exp(e.deltaY*.0012),mx=EMPV.x+(e.clientX-r.left)/r.width*EMPV.w,my=EMPV.y+(e.clientY-r.top)/r.height*EMPV.h;
    const nw=clamp(EMPV.w*f,120,E.W*1.4);const k=nw/EMPV.w;EMPV.x=mx-(mx-EMPV.x)*k;EMPV.y=my-(my-EMPV.y)*k;EMPV.w=nw;EMPV.h=EMPV.h*k;setV();},{passive:false});
  let dr=null;svg.addEventListener('pointerdown',e=>{if(e.target.closest('.pl,.lg'))return;dr=[e.clientX,e.clientY,EMPV.x,EMPV.y];svg.classList.add('drag');svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!dr)return;const r=svg.getBoundingClientRect();EMPV.x=dr[2]-(e.clientX-dr[0])/r.width*EMPV.w;EMPV.y=dr[3]-(e.clientY-dr[1])/r.height*EMPV.h;setV();});
  svg.addEventListener('pointerup',()=>{dr=null;svg.classList.remove('drag');});
  svg.addEventListener('click',e=>{const t=e.target.closest('.pl');if(t){empShow(EMP_P[+t.dataset.p]);return;}const l=e.target.closest('.lg');if(l){const L=EMP_LEG[+l.dataset.l];empInfo(`<h4>${L[0]}</h4><div class="la">军团驻地 · 约公元58年【史】</div><p>${L[3]}</p>`);}});
  return o;}
function empInfo(h){const b=$('#empire .einfo');b.hidden=false;b.innerHTML=`<button style="float:right;border:0;background:none;font-size:18px;cursor:pointer" aria-label="关闭">×</button>`+h;b.querySelector('button').onclick=()=>b.hidden=true;}
function empShow(p){const T=EMP_T[p.t];empInfo(`<h4>${p.zh}</h4><div class="la">${p.la}</div><span class="tp" style="background:${T[1]}">${T[0]}</span><div style="font-size:12px;opacity:.8">${T[2]}</div>`+(p.g?`<p><b>总督（58年前后）</b>：${p.g}</p>`:'')+(p.leg?`<p><b>军团</b>：${p.leg.join('、')}</p>`:'')+(p.n?`<p>${p.n}</p>`:''));
  const[x,y]=empXY(p.p[0],p.p[1]),h=$('#empHL');if(h){h.setAttribute('cx',x);h.setAttribute('cy',y-3);}}
function openEmpire(id){let o=$('#empire');if(!o)o=buildEmpire();o.hidden=false;const E=EMPIRE.D;
  if(id){const p=EMP_P.find(q=>q.id===id);if(p){const[x,y]=empXY(p.p[0],p.p[1]);EMPV.w=E.W*.42;EMPV.h=E.H*.42;EMPV.x=x-EMPV.w/2;EMPV.y=y-EMPV.h/2;EMPD.setV();empShow(p);}}
  else{EMPV.x=0;EMPV.y=0;EMPV.w=E.W;EMPV.h=E.H;EMPD.setV();}}
function initEmpire(){if(!EMPIRE)return;const pg=$('#pages');if(pg&&!pg.querySelector('[data-page="empire"]')){const b=document.createElement('button');b.dataset.page='empire';b.textContent='帝国';b.onclick=e=>{e.stopPropagation();openEmpire();};pg.appendChild(b);if(!pg.querySelector('[data-page="ostia"]')){const o=document.createElement('button');o.dataset.page='ostia';o.textContent='奥斯提亚';o.onclick=e=>{e.stopPropagation();setPage('ostia');};pg.insertBefore(o,b);}}}

/* ----- the people of the first-person walk (fp.js): looks, roles, where each role may stand, the census ----- */
// A figure stands on y = 0 and faces +z (its left is +x). aC = colour and how much of the instance tint it takes; aP = limb and metal.
// Limbs: 0 body, 1 left leg, 2 right leg, 3 left arm, 4 right arm (these swing), 5 held still, 6 a long hem (sways a little).
// o: body 'toga' | 'tunic' | 'long' | 'mail' | 'cuirass' | 'bare' | 'litter'; hat, hair, long (hair), beard, bald; clav 0 | 1 narrow | 2 broad; prae (purple border);
//    shoe, cloak, wrap (colours); item 'tablets' | 'scroll' | 'vitis' | 'fasces' | 'amphora' | 'yoke' | 'hoe' | 'lamp' | 'satchel' | 'lituus' | 'flute' | 'box' | 'axe' | 'drum' | 'spear' | 'arms' (shield and javelin)
function fpFigure(o){const P=[],Nn=[],C=[],L=[],M=new THREE.Matrix4(),E=new THREE.Euler(),Qq=new THREE.Quaternion(),V=new THREE.Vector3(),S=new THREE.Vector3();
  const put=(geo,pos,rot,scl,col,limb,tint=0,metal=0)=>{const g=geo.index?geo.toNonIndexed():geo;M.compose(V.set(pos[0],pos[1],pos[2]),Qq.setFromEuler(E.set(rot[0],rot[1],rot[2])),S.set(scl[0],scl[1],scl[2]));g.applyMatrix4(M);
    const p=g.attributes.position.array,n=g.attributes.normal.array;for(let i=0;i<p.length;i+=3){P.push(p[i],p[i+1],p[i+2]);Nn.push(n[i],n[i+1],n[i+2]);C.push(col[0],col[1],col[2],tint);L.push(limb,metal);}};
  const done=()=>{const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));
    G.setAttribute('aC',new THREE.Float32BufferAttribute(C,4));G.setAttribute('aP',new THREE.Float32BufferAttribute(L,2));return G;};
  const cyl=(rt,rb,h,n=7,open=true)=>new THREE.CylinderGeometry(rt,rb,h,n,1,open),box=(x,y,z)=>new THREE.BoxGeometry(x,y,z),sph=(r,a=7,b=5)=>new THREE.SphereGeometry(r,a,b),O=[0,0,0],I=[1,1,1];
  const skin=o.skin||[.5,.34,.25],hair=o.hair||[.07,.055,.045],leather=[.12,.08,.055],iron=[.3,.3,.31],bronze=[.5,.36,.15],wood=[.3,.2,.11],white=[.66,.63,.56],purple=[.2,.035,.11],red=[.4,.09,.06],T1=[1,1,1];
  if(o.body==='litter'){   // a litter set down: a couch box with a roof and curtains on two poles, four short legs
    put(box(.8,.14,1.9),[0,.42,0],O,I,wood,0);put(box(.74,.1,1.8),[0,.54,0],O,I,T1,0,1);put(box(.86,.05,1.96),[0,1.42,0],O,I,wood,0);
    for(const sx of[1,-1]){put(cyl(.03,.03,3.4,6,false),[sx*.46,.4,0],[1.5708,0,0],I,wood,0);put(box(.02,.84,1.1),[sx*.41,.98,-.36],O,I,T1,6,1);for(const sz of[1,-1]){put(box(.05,.36,.05),[sx*.36,.18,sz*.86],O,I,wood,0);put(box(.04,.9,.04),[sx*.4,.97,sz*.94],O,I,wood,0);}}
    put(box(.8,.84,.02),[0,.98,-.95],O,I,T1,6,1);return done();}
  // head and neck, hair or a hat
  put(cyl(.05,.055,.1,6),[0,1.45,0],O,I,skin,0);put(sph(.105),[0,1.57,0],O,[.92,1.1,1],skin,0);
  if(o.hat==='helm'||o.hat==='helmT'){put(sph(.125,8,5),[0,1.6,-.005],O,[.95,.92,1.04],bronze,0,0,1);put(box(.21,.03,.07),[0,1.53,-.12],[.5,0,0],I,bronze,0,0,1);for(const s of[1,-1])put(box(.02,.12,.07),[s*.1,1.52,.035],O,I,bronze,0,0,1);
    put(o.hat==='helm'?box(.03,.11,.27):box(.3,.12,.03),[0,1.755,-.01],O,I,[.48,.07,.05],0);}
  else{if(!o.bald)put(sph(.11,7,4),[0,1.6,-.012],O,[.95,.78,1.02],hair,0);if(o.long)put(box(.2,.27,.07),[0,1.46,-.085],O,I,hair,0);}
  if(o.beard)put(box(.13,.09,.05),[0,1.5,.07],O,I,hair,0);
  if(o.hat==='apex'){put(sph(.114,7,4),[0,1.615,-.005],O,[.95,.6,1],[.6,.56,.48],0);put(cyl(.03,.03,.012,7,false),[0,1.7,0],O,I,[.6,.56,.48],0);put(cyl(.006,.012,.13,5,false),[0,1.765,0],O,I,wood,0);}
  if(o.hat==='veil'){const c=o.veil||white,t=o.veilT?1:0;put(sph(.138,8,5),[0,1.59,-.035],O,[1,1.06,1.05],c,0,t);put(box(.27,.32,.07),[0,1.39,-.1],O,I,c,0,t);}
  if(o.hat==='phryg'){put(sph(.118,7,4),[0,1.62,-.01],O,[.95,.8,1],o.veil||red,0);put(sph(.05,5,4),[0,1.72,.045],O,I,o.veil||red,0);}
  const legs=(col,tint,shoe)=>{for(const s of[1,-1]){const l=s>0?1:2;put(cyl(.075,.055,.8,6),[s*.09,.46,0],O,I,col,l,tint);put(box(.09,.07,.24),[s*.09,.035,.045],O,I,shoe||skin,l);}};
  const arm=(s,limb,sleeve,tint)=>{put(cyl(.058,.05,.3,6),[s*.215,1.25,0],[0,0,s*.06],I,sleeve,limb,tint);put(cyl(.046,.04,.3,6),[s*.232,.96,0],[0,0,s*.04],I,skin,limb);put(sph(.045,5,4),[s*.24,.79,0],O,I,skin,limb);};
  // an arm held bent, the forearm level and forward
  const armBent=(s,sleeve,tint)=>{put(cyl(.058,.05,.3,6),[s*.215,1.25,0],[0,0,s*.06],I,sleeve,5,tint);put(cyl(.046,.04,.28,6),[s*.225,1.1,.13],[1.4,0,0],I,skin,5);put(sph(.045,5,4),[s*.225,1.12,.28],O,I,skin,5);};
  const B=o.body,it=o.item;let bentL=false,bentR=false;   // which arms are held (left +x, right -x)
  const stripes=(z,y,h)=>{if(o.clav===2)put(box(.05,h,.012),[-.07,y,z],O,I,purple,0);else if(o.clav===1)for(const x of[-.105,-.045])put(box(.016,h,.012),[x,y,z],O,I,purple,0);};
  const cloak=(c)=>{put(box(.36,.74,.045),[0,1.06,-.145],[.05,0,0],I,c,6);put(box(.43,.06,.24),[0,1.425,-.02],O,I,c,0);};
  if(B==='toga'){   // a toga over a tunic; its white takes the instance tint (a client's is not as white as a senator's)
    for(const s of[1,-1])put(box(.09,.09,.25),[s*.085,.045,.05],O,I,o.shoe||[.2,.06,.045],s>0?1:2);
    put(cyl(.2,.3,.95,9),[0,.52,0],O,[1,1,.78],white,6,1);put(cyl(.18,.2,.46,9),[0,1.21,0],O,[1,1,.74],white,0,1);stripes(.134,1.22,.36);
    put(box(.13,.82,.36),[.04,1.08,0],[0,0,.62],[1,1,1.02],[.72,.69,.62],0,1);put(box(.2,.16,.34),[.17,1.39,0],O,I,[.72,.69,.62],0,1);   // the fold from the left shoulder down to the right hip
    if(o.prae){put(box(.026,.82,.368),[-.021,1.036,0],[0,0,.62],[1,1,1.02],purple,0);put(cyl(.304,.304,.04,9),[0,.07,0],O,[1,1,.78],purple,6);}
    armBent(1,white,1);put(box(.07,.62,.2),[.25,.8,.14],O,I,[.7,.67,.6],5,1);bentL=true;if(o.cloak)cloak(o.cloak);}
  else if(B==='tunic'){   // a belted wool tunic to the knee
    legs(skin,0,o.shoe===0?null:(o.shoe||leather));put(cyl(.175,.155,.56,8),[0,1.16,0],O,[1,1,.7],T1,0,1);put(cyl(.16,.235,.44,8),[0,.72,0],O,[1,1,.72],T1,0,1);put(cyl(.165,.165,.045,8),[0,.93,0],O,[1,1,.72],leather,0);
    for(const x of o.clav===1?[-.06,.06]:[])put(box(.016,.5,.012),[x,1.15,.118],O,I,purple,0);if(o.cloak)cloak(o.cloak);}
  else if(B==='long'){   // a robe to the feet (stola, a priest's robe, a Greek cloak over a long tunic) with a wrap over the left shoulder
    for(const s of[1,-1])put(box(.08,.06,.2),[s*.08,.03,.06],O,I,o.shoe||leather,s>0?1:2);
    put(cyl(.19,.29,.95,9),[0,.52,0],O,[1,1,.78],T1,6,1);put(cyl(.175,.19,.46,9),[0,1.21,0],O,[1,1,.74],T1,0,1);if(o.belt)put(cyl(.19,.19,.04,9),[0,1.0,0],O,[1,1,.74],o.belt,0);
    if(o.wrap){put(box(.12,.8,.35),[.04,1.08,0],[0,0,.62],[1,1,1.02],o.wrap,0);put(box(.2,.15,.33),[.17,1.39,0],O,I,o.wrap,0);put(box(.07,.6,.2),[.25,.8,.14],O,I,o.wrap,5);}}
  else if(B==='mail'||B==='cuirass'){const tun=o.tun||red;legs(o.trou||skin,0,leather);put(cyl(.165,.215,.3,8),[0,.77,0],O,[1,1,.72],B==='cuirass'?[.62,.58,.5]:tun,0);
    put(cyl(.19,.175,.6,8),[0,1.16,0],O,[1,1,.72],B==='mail'?iron:bronze,0,0,1);put(box(.44,.06,.2),[0,1.43,0],O,I,B==='mail'?iron:bronze,0,0,1);put(cyl(.185,.185,.05,8),[0,.9,0],O,[1,1,.72],leather,0);
    if(B==='mail')put(box(.09,.2,.02),[0,.78,.15],O,I,leather,0);
    const side=B==='mail'&&it==='arms'?-1:1;put(box(.05,.5,.03),[side*.2,.78,-.02],[.15,0,0],I,leather,0);put(box(.035,.1,.035),[side*.2,1.07,-.06],[.15,0,0],I,bronze,0,0,1);   // the sword: a soldier's on the right hip, an officer's on the left
    if(o.cloak)cloak(o.cloak);}
  else if(B==='bare'){legs(skin,0,o.shoe===0?null:leather);put(cyl(.18,.165,.56,8),[0,1.16,0],O,[1,1,.7],skin,0);put(cyl(.17,.25,.5,8),[0,.69,0],O,[1,1,.74],[.58,.54,.46],0);put(cyl(.252,.252,.04,8),[0,.46,0],O,[1,1,.74],red,0);put(cyl(.175,.175,.05,8),[0,.94,0],O,[1,1,.72],leather,0);}
  else if(B==='germ'){legs(o.trou||[.26,.21,.15],0,leather);put(cyl(.18,.16,.56,8),[0,1.16,0],O,[1,1,.7],T1,0,1);put(cyl(.165,.22,.36,8),[0,.76,0],O,[1,1,.72],T1,0,1);put(cyl(.17,.17,.05,8),[0,.93,0],O,[1,1,.72],leather,0);
    cloak(o.cloak||[.2,.16,.12]);put(box(.045,.78,.03),[.2,.72,-.02],[.12,0,0],I,leather,0);put(box(.12,.03,.04),[.2,1.1,-.07],O,I,iron,0,0,1);}
  const sleeve=B==='toga'?white:B==='mail'||B==='cuirass'?(o.tun||red):B==='bare'?skin:T1,st=B==='mail'||B==='cuirass'||B==='bare'?0:1,hx=.225,hy=1.12,hz=.28;
  // what is carried
  if(it==='tablets'){armBent(1,sleeve,st);bentL=true;put(box(.035,.2,.15),[.19,1.12,.3],[.2,0,0],I,wood,5);put(box(.03,.19,.14),[.165,1.12,.3],[.2,0,0],I,wood,5);}
  else if(it==='scroll'){if(!bentL)armBent(1,sleeve,st);bentL=true;put(cyl(.022,.022,.24,6,false),[hx,hy+.03,hz+.02],[0,0,1.5708],I,[.7,.66,.54],5);}
  else if(it==='vitis'){if(!bentL)armBent(1,sleeve,st);bentL=true;put(cyl(.013,.016,.78,5,false),[hx,hy+.06,hz+.12],[1.1,0,0],I,[.22,.14,.08],5);}
  else if(it==='lamp'){if(!bentL)armBent(1,sleeve,st);bentL=true;put(box(.09,.05,.16),[hx,hy+.05,hz+.04],O,I,bronze,5,0,1);put(sph(.03,5,4),[hx,hy+.1,hz+.11],O,[1,1.5,1],[2.4,1.7,.7],5);}
  else if(it==='box'){if(!bentL)armBent(1,sleeve,st);armBent(-1,sleeve,st);bentL=bentR=true;put(box(.3,.12,.16),[0,hy+.02,hz+.02],O,I,wood,5);}
  else if(it==='drum'){if(!bentL)armBent(1,sleeve,st);bentL=true;put(cyl(.17,.17,.05,10,false),[hx+.02,hy+.12,hz+.03],[1.5708,0,.3],I,[.62,.5,.32],5);}
  else if(it==='lituus'){if(!bentL)armBent(1,sleeve,st);bentL=true;put(cyl(.012,.012,.52,5,false),[hx,hy+.2,hz],O,I,wood,5);put(box(.075,.022,.022),[hx-.03,hy+.46,hz],O,I,wood,5);put(box(.022,.07,.022),[hx-.066,hy+.42,hz],O,I,wood,5);}
  else if(it==='flute'){armBent(1,sleeve,st);armBent(-1,sleeve,st);bentL=bentR=true;for(const x of[.03,-.03])put(cyl(.009,.012,.42,5,false),[x,1.36,.2],[1.05,0,0],I,wood,5);}
  else if(it==='fasces'){   // the bundle of rods on the left shoulder, bound with red straps; no axe inside the city
    if(!bentL)armBent(1,sleeve,st);bentL=true;const a=.28,cy=Math.cos(a),sy=Math.sin(a);put(cyl(.042,.042,1.3,6,false),[.2,1.5,.02],[a,0,0],I,[.34,.24,.13],5);for(const t of[-.45,-.1,.25,.55])put(cyl(.047,.047,.035,6),[.2,1.5+t*cy,.02+t*sy],[a,0,0],I,red,5);}
  else if(it==='arms'){   // a guard: javelin in the right hand, the oval shield on the left arm
    armBent(-1,sleeve,0);bentR=true;put(cyl(.013,.013,2,5,false),[-.235,1.03,.3],O,I,wood,5);put(cyl(0,.02,.3,5,false),[-.235,2.16,.3],O,I,iron,5,0,1);
    put(cyl(.058,.05,.3,6),[.215,1.25,0],[0,0,.06],I,sleeve,5);put(cyl(.046,.04,.26,6),[.235,1.08,.08],[.9,0,0],I,skin,5);bentL=true;
    put(cyl(1,1,.035,12,false),[.3,1.02,.16],[1.5708,0,.12],[.31,1,.56],[.36,.07,.05],5);put(sph(.07,6,4),[.3,1.02,.2],O,[1,1,.6],bronze,5,0,1);}
  else if(it==='spear'||it==='hoe'){armBent(-1,sleeve,st);bentR=true;put(cyl(.014,.014,it==='hoe'?1.5:2.1,5,false),[-.235,it==='hoe'?.98:1.08,.3],O,I,wood,5);
    if(it==='hoe')put(box(.13,.02,.11),[-.235,1.72,.35],[.5,0,0],I,iron,5,0,1);else put(cyl(0,.026,.34,5,false),[-.235,2.3,.3],O,I,iron,5,0,1);}
  else if(it==='amphora'){   // a jar carried on the right shoulder, steadied with the hand
    put(cyl(.058,.05,.3,6),[-.215,1.25,0],[0,0,-.06],I,sleeve,5,st);put(cyl(.046,.04,.3,6),[-.27,1.43,.04],[0,0,.12],I,skin,5);bentR=true;
    put(cyl(.1,.075,.36,7,false),[-.27,1.62,-.02],[1.5708,0,0],I,[.5,.3,.2],5);put(cyl(.04,.07,.16,6,false),[-.27,1.62,.24],[1.5708,0,0],I,[.5,.3,.2],5);put(cyl(.075,.02,.14,6,false),[-.27,1.62,-.27],[1.5708,0,0],I,[.5,.3,.2],5);}
  else if(it==='yoke'){put(box(1.36,.035,.04),[0,1.455,-.03],O,I,wood,0);for(const s of[1,-1]){put(box(.012,.52,.012),[s*.64,1.19,-.03],O,I,leather,5);put(cyl(.11,.09,.2,7,false),[s*.64,.86,-.03],O,I,wood,5);
      put(cyl(.058,.05,.3,6),[s*.215,1.25,0],[0,0,s*.06],I,sleeve,5,st);put(cyl(.046,.04,.3,6),[s*.3,1.36,0],[0,0,-s*.9],I,skin,5);}bentL=bentR=true;}
  else if(it==='axe'){if(!bentL)armBent(1,sleeve,st);bentL=true;put(cyl(.016,.016,.95,5,false),[.2,1.46,-.08],[-.5,0,0],I,wood,5);put(box(.022,.17,.13),[.2,1.84,-.33],[-.5,0,0],I,iron,5,0,1);}
  else if(it==='satchel'){put(box(.06,.22,.26),[-.21,.92,0],O,I,leather,0);put(box(.03,.62,.03),[-.02,1.2,.13],[0,0,.6],I,leather,0);}
  if(!bentL)arm(1,3,sleeve,st);if(!bentR)arm(-1,4,sleeve,st);return done();}

/* The looks: one instanced mesh each. */
const FP_LOOKS={
  g:{body:'mail',hat:'helm',item:'arms'},gc:{body:'mail',hat:'helmT',item:'vitis'},gt:{body:'cuirass',cloak:[.6,.57,.5],hair:[.1,.08,.06]},pp:{body:'cuirass',cloak:[.42,.07,.06],hair:[.4,.38,.36],item:'scroll'},
  ge:{body:'germ',hair:[.5,.36,.16],long:1,beard:1,item:'spear'},
  sc:{body:'toga',clav:2,prae:1,hair:[.5,.48,.46]},s:{body:'toga',clav:2,hair:[.42,.4,.38]},sy:{body:'toga',clav:2},li:{body:'toga',item:'fasces',shoe:[.12,.08,.055]},
  eq:{body:'toga',clav:1,shoe:[.1,.07,.05]},er:{body:'toga',clav:1,shoe:[.1,.07,.05],cloak:[.2,.1,.3],item:'scroll'},eo:{body:'tunic',clav:1,cloak:[.3,.26,.2],item:'scroll',shoe:[.1,.07,.05]},
  cl:{body:'toga',shoe:[.12,.08,.055]},f:{body:'tunic',item:'tablets'},
  sv:{body:'tunic',shoe:0},sl:{body:'tunic',shoe:0,item:'amphora'},sw:{body:'tunic',shoe:0,item:'yoke'},sg:{body:'tunic',shoe:0,item:'hoe'},sm:{body:'tunic',item:'satchel'},sn:{body:'tunic',shoe:0,item:'lamp'},cf:{body:'tunic',item:'axe',beard:1},
  lt:{body:'litter'},
  pq:{body:'toga',clav:2,prae:1,hat:'veil',veil:[.66,.63,.56],veilT:1,item:'scroll'},pf:{body:'toga',prae:1,hat:'apex',cloak:[.34,.1,.1]},pa:{body:'toga',prae:1,item:'lituus',cloak:[.3,.06,.1]},
  vi:{body:'bare',item:'axe',shoe:0},ca:{body:'tunic',item:'box',hair:[.16,.11,.07]},tb:{body:'tunic',item:'flute'},
  pg:{body:'long',long:1,hat:'phryg',veil:[.5,.4,.08],belt:[.5,.4,.1],item:'drum',hair:[.08,.06,.05]},ps:{body:'long',hat:'phryg',veil:[.36,.08,.1],wrap:[.36,.08,.1],beard:1},
  vv:{body:'long',hat:'veil',veil:[.7,.67,.6],wrap:[.7,.67,.6],belt:[.5,.1,.08]},
  wm:{body:'long',hat:'veil',veil:[.75,.75,.75],veilT:1,wrap:[.3,.2,.34],hair:[.1,.07,.05]},ma:{body:'long',long:1,hair:[.1,.07,.05]},
  gk:{body:'long',beard:1,wrap:[.3,.27,.22],hair:[.3,.28,.26]}};

/* The roles. z: the zones the role may stand and walk in (FPN.zone); n: how many leaders at [morning, day, evening, night];
   w: [look or role of a follower, across, ahead (m; behind is negative)]; b: 'walk' | 'idle' (stands, moves a few paces now and then) | 'stand'; sp: pace (m/s); from: the first year. */
const FP_T={white:[[1,1,1]],dingy:[[.86,.8,.68],[.8,.76,.66],[.9,.86,.76]],wool:[[.62,.56,.45],[.36,.25,.16],[.5,.38,.18],[.28,.33,.2],[.33,.36,.4],[.45,.2,.12],[.55,.5,.42]],
  slave:[[.3,.25,.19],[.36,.3,.22],[.24,.22,.2],[.4,.33,.22]],lady:[[.5,.2,.22],[.2,.32,.4],[.56,.46,.2],[.3,.4,.28],[.5,.36,.5]],gall:[[.6,.42,.06],[.5,.1,.12],[.2,.36,.3]],germ:[[.3,.34,.24],[.4,.24,.16],[.26,.28,.36]]};
const FP_ROLES={
  g:{zh:'禁卫军',la:'cohortes praetoriae',t:'white',sp:1.15,z:'ABPFEI',n:[12,12,12,14],note:'【史】皇帝的卫队，营地在城东北。每天有一个大队到帕拉蒂尼山当值。塔西佗记当值的士兵穿托加、暗佩短剑；这里画的是野战装束（锁子甲、椭圆盾、标枪），为的是好认。'},
  gc:{zh:'百夫长',la:'centurio',t:'white',sp:1.1,z:'ABP',n:[1,1,1,1],note:'【史】禁卫军的百夫长。头盔上的缨是横的，手里是葡萄藤杖（vitis），那是他责打士兵的权力的标志。'},
  gt:{zh:'禁卫军军团长',la:'tribunus cohortis praetoriae',t:'white',sp:1,z:'AB',n:[1,1,0,0],note:'【史】每个禁卫大队由一名军团长统领，骑士阶级出身，多是从百夫长一步步升上来的老兵。'},
  pp:{zh:'禁卫军长官',la:'praefectus praetorio',t:'white',sp:.9,z:'AIP',n:[1,1,0,0],w:[['f',-.5,-1.4]],note:'【史】骑士阶级能做到的最高官职之一，离皇帝最近的武官。尼禄朝前期只有一位，公元62年以后两人并任。'},
  ge:{zh:'日耳曼卫队',la:'Germani corporis custodes',t:'germ',sp:.8,z:'DI',n:[4,4,4,4],b:'idle',pair:1,note:'【史】皇帝的贴身卫兵，从莱茵河口的巴达维人等部族里招来，不是罗马公民，只效忠皇帝本人。长发蓄须，穿长裤。公元68年被伽尔巴解散。'},
  sc:{zh:'执政官',la:'consul',t:'white',sp:.7,z:'ABC',n:[1,0,0,0],w:[['li',0,1.5],['li',0,2.7],['li',0,3.9],['li',0,5.1],['li',0,6.3],['li',0,7.5],['li',0,8.7],['li',0,9.9],['li',0,11.1],['li',0,12.3],['li',0,13.5],['li',0,14.7],['f',-.5,-1.4]],
    note:'【史】镶紫边的托加（toga praetexta）。前面十二名扈从排成一列开路。元首制下执政官已无实权，但仍是元老生涯的顶点，年份也以两位执政官的名字纪年。'},
  sp:{zh:'裁判官',la:'praetor',look:'sc',t:'white',sp:.75,z:'ABC',n:[1,1,0,0],w:[['li',0,1.5],['li',0,2.7]],note:'【史】掌司法的高级官员，镶紫边托加。在城里有两名扈从（出城六名）。'},
  s:{zh:'元老',la:'senator',t:'white',sp:.8,z:'ABC',n:[3,1,2,0],w:[['f',-.5,-1.4]],note:'【史】托加里面是带宽紫条的短袍（latus clavus），脚上是元老的皮靴（calceus）。清晨到宫里问安（salutatio）。元老院有时就在帕拉蒂尼阿波罗神庙的图书馆里开会。'},
  sy:{zh:'年轻元老',la:'quaestorius',t:'white',sp:1.05,z:'ABC',n:[1,0,0,0],w:[['sy',.85,.1]],note:'【史】二十五岁上下做过财务官（quaestor）就进了元老院。其中两位是“皇帝的财务官”，在元老院里替皇帝宣读文书。'},
  li:{zh:'扈从',la:'lictor',t:'dingy',sp:.9,z:'',n:[0,0,0,0],note:'【史】给官员开路的随员，多是释奴出身。左肩扛束棒（fasces）：一捆用红皮带扎起的木棍。在罗马城界以内，束棒里不插斧头。'},
  eo:{zh:'骑士官员',la:'procurator Augusti',t:'wool',sp:1.1,z:'ABPI',n:[2,2,0,0],w:[['f',-.5,-1.3]],note:'【史】骑士阶级替皇帝管事的人：各地的皇室代理官（procurator）、粮务长官（praefectus annonae）、消防长官（praefectus vigilum）。尼禄时宫里的书信、账目、请愿三个局还在释奴手里，骑士接手是以后的事。'},
  er:{zh:'富有的骑士',la:'eques, publicanus',t:'white',sp:.8,z:'ABC',n:[1,1,1,0],w:[['sv',-.5,-1.3],['sv',.5,-1.6]],note:'【史】骑士的资格是四十万塞斯特斯的家产。不少人靠包税（publicani）、放贷和海上贸易发家，比许多元老有钱。窄紫条、金戒指，托加外面罩一件时兴的染色斗篷（lacerna）。'},
  eq:{zh:'骑士',la:'eques Romanus',t:'white',sp:.95,z:'ABC',n:[2,1,0,0],pairs:.4,note:'【史】骑士阶级：短袍上两道窄紫条（angustus clavus），手上金戒指（anulus aureus）。问安时排在元老后面。'},
  cl:{zh:'门客与请愿人',la:'clientes, salutatores',t:'dingy',sp:.9,z:'AB',n:[4,1,0,0],b:'idle',note:'【史】清晨问安必须穿托加。普通公民的托加没有紫条，也不那么白。他们在门外等着被放进去，递请愿书，或者只为露个面。'},
  f:{zh:'释奴',la:'liberti',t:'wool',sp:1.4,z:'ABPIEC',n:[4,5,2,1],note:'【史】获释的奴隶。克劳狄和尼禄两朝，皇帝的书信、账目和请愿都由宫里的释奴经办。束腰短袍，手里是蜡板。'},
  sv:{zh:'随身奴隶',la:'servus, pedisequus',t:'slave',sp:1.2,z:'',n:[0,0,0,0],note:'【史】跟在主人身后的奴隶（pedisequus）。深色粗毛短袍，赤脚。'},
  sl:{zh:'搬运的奴隶',la:'servi Caesaris',t:'slave',sp:1.05,z:'EFI',n:[2,3,1,0],note:'【史】皇室的奴隶（familia Caesaris）有成百上千人，分工极细。这一个肩上扛的是装酒或油的双耳瓶（amphora）。'},
  sw:{zh:'挑水的奴隶',la:'aquarius',t:'slave',sp:1,z:'EFD',n:[1,2,1,0],note:'【史】挑水的（aquarius）。克劳狄水道的一条支线在尼禄时接上了帕拉蒂尼山，但浴室、厨房和花园仍要人一担担送水。'},
  sg:{zh:'园丁',la:'topiarius',t:'slave',sp:.8,z:'D',n:[1,2,1,0],b:'idle',note:'【史】园丁（topiarius）。把黄杨和柏树修剪成形的做法，老普林尼说是奥古斯都时代兴起的。'},
  sm:{zh:'信差',la:'tabellarius',t:'wool',sp:3.1,z:'FBA',n:[1,1,1,0],note:'【史】送信的（tabellarius）。皇帝的文书靠专门的信差和驿站（cursus publicus）传递。'},
  sn:{zh:'执灯的奴隶',la:'lanternarius',t:'slave',sp:1,z:'BPA',n:[0,0,1,2],note:'【史】罗马的街道夜里没有灯。天黑以后出门，前面要有奴隶提着灯（lanternarius）。'},
  lt:{zh:'轿子',la:'lectica',t:'lady',sp:0,z:'AB',n:[1,0,1,0],b:'stand',w:[['lb',.75,1.1],['lb',-.75,1.1],['lb',.75,-1.1],['lb',-.75,-1.1]],note:'【史】有帘子的卧轿（lectica），由轿夫（lecticarii）用肩抬杆子。主人进宫去了，轿子和轿夫在门外等。'},
  lb:{zh:'轿夫',la:'lecticarius',look:'sv',t:'slave',sp:1,z:'',n:[0,0,0,0],note:'【史】轿夫（lecticarius），挑的是身量相当的壮汉，常穿一样的衣服。'},
  cf:{zh:'工匠',la:'faber',t:'slave',sp:1,z:'BFE',n:[0,2,0,0],from:64,note:'【史】公元64年大火烧毁了帕拉蒂尼山上的大片宫室，此后山上到处是重建的工匠（fabri）。'},
  pq:{zh:'十五人祭司团成员',la:'quindecimvir sacris faciundis',t:'white',sp:.6,z:'CM',n:[1,1,0,0],w:[['ca',.7,-.6],['tb',-.7,-.6],['vi',0,-1.9]],note:'【史】十五人祭司团掌管西比尔预言书。奥古斯都把预言书移到了帕拉蒂尼山的阿波罗神庙；大母神这样的外来祭祀也归他们监管。祭司由元老兼任，行祭时把托加拉到头上（capite velato）。'},
  pf:{zh:'弗拉门祭司',la:'flamen',t:'white',sp:.65,z:'C',n:[1,1,0,0],note:'【史】专奉一位神的祭司。头上是带橄榄木尖的皮帽（apex），出门不能不戴；身上披厚羊毛斗篷（laena）。'},
  pa:{zh:'占卜官',la:'augur',t:'white',sp:.65,z:'CB',n:[1,1,0,0],note:'【史】占卜官观察飞鸟来断定神是否允许办某件事。手里是顶端弯曲的占卜杖（lituus）。罗慕路斯占卜建城的地方，相传就在帕拉蒂尼山。'},
  vi:{zh:'宰牲人',la:'victimarius',t:'white',sp:.8,z:'',n:[0,0,0,0],note:'【史】祭祀时牵牲、宰牲的仆役。上身赤裸，腰间系一条镶红边的围裙（limus）。'},
  ca:{zh:'祭童',la:'camillus',t:'wool',sp:.9,z:'',n:[0,0,0,0],sc:.74,note:'【史】祭司身边的男童（camillus），须是父母双全的自由民之子。手里捧香盒（acerra）。'},
  tb:{zh:'吹笛人',la:'tibicen',t:'wool',sp:.9,z:'',n:[0,0,0,0],note:'【史】祭祀时吹双管笛（tibia）的人。笛声是为了盖住不吉利的杂音。'},
  pg:{zh:'大母神的阉祭司',la:'Galli',t:'gall',sp:.9,z:'M',n:[2,3,1,0],pairs:.6,note:'【史】大母神（Magna Mater，库柏勒）的祭司，自阉，留长发，穿彩色长袍，敲手鼓。神庙就在帕拉蒂尼山上（公元前191年落成）。罗马公民不许做这种祭司。'},
  ps:{zh:'弗里吉亚祭司',la:'sacerdos Matris Magnae',t:'gall',sp:.7,z:'M',n:[1,1,0,0],note:'【史】大母神庙的主祭是从弗里吉亚请来的一男一女。头上是弗里吉亚软帽。'},
  vv:{zh:'维斯塔贞女',la:'virgo Vestalis',t:'white',sp:.7,z:'C',n:[1,0,0,0],w:[['li',0,1.6]],note:'【史】六位贞女守护维斯塔的圣火。奥古斯都在帕拉蒂尼自己的宅子里另设了一座维斯塔神龛（公元前12年）。贞女出行有一名扈从开路。'},
  wm:{zh:'贵妇',la:'matrona',t:'lady',sp:.7,z:'CD',n:[0,2,1,0],w:[['ma',-.5,-1.2]],note:'【史】已婚的体面妇女穿长裙（stola），外面裹披肩（palla），出门时把披肩拉到头上。'},
  ma:{zh:'侍女',la:'ancilla',t:'slave',sp:.9,z:'',n:[0,0,0,0],note:'【史】跟着女主人的女奴（ancilla）。'},
  gk:{zh:'希腊学者',la:'philosophus, medicus',t:'dingy',sp:.7,z:'BDPC',n:[1,2,1,0],pairs:.3,note:'【史】蓄须、披希腊外衣（pallium）的是希腊人：哲学家、修辞教师，或者医生。宫里的医生大多是希腊人。'}};

const FPN={list:[],mesh:{},out:[],   // out: places the figures keep out of, tests (x, z) => true pushed by the scenes (palatine.js: the cryptoporticus)
  blob:null,cap:64,rng:RNG(6811),info:{},Z:null,
  init(){if(this.blob)return;for(const k in FP_ROLES){const R=FP_ROLES[k];R.look=R.look||k;this.info[k]=[R.zh,R.la,R.note];}
    const mat=procMat({key:'fpNpc',env:.5,
      vHead:`attribute vec4 aC;attribute vec2 aP;attribute vec4 aN;attribute vec3 aT;varying vec3 vCol;varying float vMt;
vec3 fpRx(vec3 p,float y0,float a){float c=cos(a),s=sin(a);p.y-=y0;p=vec3(p.x,p.y*c-p.z*s,p.y*s+p.z*c);p.y+=y0;return p;}`,
      vBody:`{float sw=sin(aN.x)*aN.y,l=aP.x;vec3 q=transformed,n=objectNormal;
 if(l>.5&&l<1.5){q=fpRx(q,.86,sw*.6);n=fpRx(n,0.,sw*.6);}else if(l>1.5&&l<2.5){q=fpRx(q,.86,-sw*.6);n=fpRx(n,0.,-sw*.6);}
 else if(l>2.5&&l<3.5){q=fpRx(q,1.38,-sw*.5);n=fpRx(n,0.,-sw*.5);}else if(l>3.5&&l<4.5){q=fpRx(q,1.38,sw*.5);n=fpRx(n,0.,sw*.5);}
 else if(l>5.5){q.z+=sw*.07*(1.-smoothstep(.1,1.,q.y));}
 q.y+=abs(cos(aN.x))*.02*aN.y;q.x+=sin(uTime*.8+aN.z*6.3)*.008*q.y*(1.-aN.y);
 transformed=q;objectNormal=n;vCol=aC.rgb*mix(vec3(1.),aT,aC.a);vMt=aP.y;}`,
      fHead:'varying vec3 vCol;varying float vMt;',fSurf:'S.alb=min(vCol,vec3(1.))*(.92+.16*vn2(vWP.xy*9.+vWP.z*7.));S.rough=mix(.88,.5,vMt);S.metal=vMt*.7;S.nw=normalize(vWN);S.useN=1.;'});
    for(const k in FP_LOOKS){const G=fpFigure(FP_LOOKS[k]),n=k==='g'||k==='li'?18:k==='sv'||k==='f'?14:8;G.setAttribute('aN',new THREE.InstancedBufferAttribute(new Float32Array(n*4),4));G.setAttribute('aT',new THREE.InstancedBufferAttribute(new Float32Array(n*3),3));
      const m=layTag(new THREE.InstancedMesh(G,mat,n),'people');m.count=0;m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.userData.cap=n;FP.G.add(m);this.mesh[k]=m;}
    const bg=new THREE.CircleGeometry(1,14);bg.rotateX(-Math.PI/2);
    this.blob=new THREE.InstancedMesh(bg,fxMat({vs:`varying vec2 vQ;varying vec3 vW;void main(){vQ=position.xz;vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
      fs:`varying vec2 vQ;varying vec3 vW;void main(){float a=(1.-smoothstep(.25,1.,length(vQ)))*.42*(1.-uNight*.6);gl_FragColor=vec4(vec3(0.),a);}`}),this.cap+4);
    this.blob.count=0;this.blob.frustumCulled=false;this.blob.renderOrder=2;this.blob.material.polygonOffset=true;this.blob.material.polygonOffsetFactor=-2;this.blob.material.polygonOffsetUnits=-2;layTag(this.blob,'people');FP.G.add(this.blob);},
  clear(){this.list.length=0;for(const k in this.mesh)this.mesh[k].count=0;if(this.blob)this.blob.count=0;},
  count(k){let n=0;for(const a of this.list)if(a.k===k&&(!a.lead||k==='g'))n++;return n;},   // leaders only; of the guard, every man
  /* ---- where on the hill: the zones ----
     A: within 16 m of a main door of the two palaces.  B: the open paved top of the hill.  C: round a temple (M: the Magna Mater's).  D: a garden (green ground in the open).
     E: the service level: under a roof and 2 m or more below the palace floor (substructures, passages, sunk yards).  I: inside a palace at its floor level, or in one of its courts.
     P: under another roof (a portico, a porch).  F: the slopes and stairs below the top.  G: above the palace floors (roofs, wall tops): nobody. */
  plan(){if(this.Z)return this.Z;const Z={pal:[],tem:[],door:[]},A=typeof PAL_ASSETS!=='undefined'?PAL_ASSETS:[];
    for(const a of A){if(/tiberiana|transitoria|domus_augusti/.test(a.n))Z.pal.push(a);else if(/apollo|magna_mater|victoria/.test(a.n))Z.tem.push(a);}
    for(const[n,L]of[['rome_tiberiana',[[0,50],[0,-50]]],['rome_transitoria',[[0,46],[0,-46]]]]){const a=A.find(q=>q.n===n);if(a)for(const[mx,my]of L)Z.door.push(palW(a.lx+mx,a.lz-my));}
    return this.Z=Z;},
  zone(x,z,g){const Z=this.plan(),dx=x-PALF.ox,dz=z-PALF.oz,lx=dx*PALF.c-dz*PALF.s,lz=dx*PALF.s+dz*PALF.c,rd=a=>Math.max(Math.abs(lx-a.lx)-a.hw,Math.abs(lz-a.lz)-a.hd);
    let p=null,pd=1e9;for(const a of Z.pal){const d=rd(a);if(d<pd){pd=d;p=a;}}let t=null,td=1e9;for(const a of Z.tem){const d=rd(a);if(d<td){td=d;t=a;}}
    const c=FPM.cell(x,z),cov=c>=0&&FPM.cov[c],green=c>=0&&FPM.green(c),T=t&&td<14?(/magna/.test(t.n)?'M':'C'):'';
    if(p&&pd<0&&g>p.y+3)return'G';
    if(cov){if(p&&pd<0)return g<p.y-2?'E':'I';return T||'P';}
    if(p&&pd<0)return g<p.y-2?'E':green?'D':'I';
    if(T)return T;for(const d of Z.door)if(Math.hypot(x-d[0],z-d[1])<16)return'A';
    if(green)return'D';return g<47?'F':'B';},
  slot(){if(U.uNight.value>.5)return 3;const t=ENV.tod;return t<.22?3:t<.42?0:t<.68?1:t<.82?2:3;},
  year(){const m=/(\d+)/.exec(STATES[Math.max(0,curS)].t||'');return m?+m[1]:54;},
  mk(k,x,z,y,h){const r=this.rng,R=FP_ROLES[k],T=FP_T[R.t],a={k,look:R.look,x,z,y,h,ph:r()*TAU,amp:0,st:R.b==='stand'?'post':'wait',t:r()*2,tx:R.b==='stand'?h:x,tz:z,sp:R.sp*(.92+.16*r()),seed:r(),tint:T[Math.floor(r()*T.length)],lead:null,ox:0,oz:0,post:false,h0:h,sc:R.sc||1};this.list.push(a);return a;},
  // a straight walk from (x, z) at height y to (tx, tz): every 0.35 m must be standable, each from the one before
  bad(x,z){for(const f of this.out)if(f(x,z))return true;return false;},
  clearWay(x,z,y,tx,tz){const d=Math.hypot(tx-x,tz-z),n=Math.ceil(d/.35);let g=y;for(let i=1;i<=n;i++){const t=i/n;if(this.bad(x+(tx-x)*t,z+(tz-z)*t))return false;g=FPM.stand(x+(tx-x)*t,z+(tz-z)*t,g,.3);if(!(g===g))return false;}return true;},
  // the way there must not cross the service level or a roof, unless the role belongs there
  zoneWay(a,tx,tz,zs){for(let i=1;i<6;i++){const q=this.zone(a.x+(tx-a.x)*i/6,a.z+(tz-a.z)*i/6,a.y);if((q==='E'||q==='G'||q==='M')&&zs.indexOf(q)<0&&!(q==='M'&&zs.indexOf('C')>=0))return false;}return true;},
  target(a){const r=this.rng,R=FP_ROLES[a.k],far=R.b==='idle'?7:26;for(let i=0;i<10;i++){const an=r()*TAU,d=(far-i*far/13)*(.5+.5*r()),tx=a.x+Math.sin(an)*d,tz=a.z+Math.cos(an)*d;if(Math.hypot(tx-FP.x,tz-FP.z)>38)continue;
      if(R.z&&R.z.indexOf(this.zone(tx,tz,a.y))<0)continue;if(R.z&&!this.zoneWay(a,tx,tz,R.z))continue;if(this.clearWay(a.x,a.z,a.y,tx,tz)){a.tx=tx;a.tz=tz;a.st='walk';return true;}}a.st='wait';a.t=1+r()*2;return false;},
  // after each new grid: drop the figures it no longer covers and those whose hour is over, then fill up, role by role, each in its own zones (on the hill only).
  // first: the walker has just arrived, figures may stand in view
  census(first){if(!FPM.ready)return;const r=this.rng,sl=this.slot(),yr=this.year(),quota=k=>{const R=FP_ROLES[k];return R.from&&yr<R.from?0:R.n[sl];};
    const over={};for(const k in FP_ROLES)over[k]=this.count(k)-quota(k);
    this.list=this.list.filter(a=>{const d=Math.hypot(a.x-FP.x,a.z-FP.z);if(d>41||this.bad(a.x,a.z))return false;const g=FPM.stand(a.x,a.z,a.y,.25);if(!(g===g))return false;
      if(!a.lead&&!first&&d>22&&over[a.k]>0){over[a.k]--;return false;}return true;});
    for(let pass=0;pass<3;pass++)this.list=this.list.filter(a=>!a.lead||this.list.indexOf(a.lead)>=0);   // a follower goes with its leader
    if(!FP.onHill(FP.x,FP.z))return;const fx=Math.sin(FP.yaw),fz=Math.cos(FP.yaw);
    // only where the walker could walk to: not a shut court, the top of a hedge or a roof
    const Wk=FPM.walk(FP.x,FP.z,FP.g,6000),ZN=Wk.map(n=>this.zone(n[0],n[1],n[2])),free=(x,z,d=2.2)=>{for(const b of this.list)if(Math.hypot(b.x-x,b.z-z)<d)return false;return true;};
    const have={};for(const q of ZN)have[q]=(have[q]||0)+1;this.zones=have;
    // a place in one of the zones. wall: with a wall at its back and three paces clear in front (a sentry); then [x, z, ground, the wall's bearing]
    const spot=(zs,wall)=>{for(let i=0;i<(wall?200:70);i++){const ni=Math.floor(r()*Wk.length),nd=Wk[ni];if(zs.indexOf(ZN[ni])<0)continue;const x=nd[0],z=nd[1],dx=x-FP.x,dz=z-FP.z,d=Math.hypot(dx,dz);if(d<(first?5:15)||d>36)continue;
        if(!first&&d<24&&(-dx*fx-dz*fz)/d>.45)continue;   // not where the walker is looking (the camera looks along -(sin yaw, cos yaw))
        if(!free(x,z)||this.bad(x,z))continue;const g=FPM.stand(x,z,nd[2],.4);if(!(g===g))continue;if(!wall)return[x,z,g];
        for(let k=0;k<8;k++){const a=k*.7854,sx=Math.sin(a),sz=Math.cos(a);if(FPM.wall(x+sx*1.1,z+sz*1.1,g)&&FPM.at(x+sx*.5,z+sz*.5)<g+.5&&this.clearWay(x,z,g,x-sx*2.4,z-sz*2.4))return[x,z,g,a];}}return null;};
    const room=n=>this.list.length+n<=this.cap,group=(k,p,h)=>{const R=FP_ROLES[k],a=this.mk(k,p[0],p[1],p[2],h);for(const w of R.w||[]){const b=this.mk(w[0],p[0],p[1],p[2],h);b.lead=a;b.ox=w[1];b.oz=w[2];if(R.b==='stand'){b.st='post';}}return a;};
    // the guard first: sentries in pairs at the doors and under the porticoes, then patrols of two
    let tries=0;while(this.count('g')<quota('g')&&tries++<10&&room(2)){let np=0;for(const a of this.list)if(a.post)np++;
      if(np<6){const p=spot('AIPB',true);if(p){const h=p[3]+Math.PI,a=this.mk('g',p[0],p[1],p[2],h);a.post=true;a.st='post';a.tx=h;   // back to the wall, a second man two paces along it
          const sx=Math.cos(p[3])*2.1,sz=-Math.sin(p[3])*2.1,g2=FPM.stand(p[0]+sx,p[1]+sz,p[2],.35);if(g2===g2&&free(p[0]+sx,p[1]+sz)||g2===g2&&this.list.length<3){const b=this.mk('g',p[0]+sx,p[1]+sz,g2,h);b.post=true;b.st='post';b.tx=h;}continue;}}
      const p=spot('BFEPC',false);if(!p)break;const a=this.mk('g',p[0],p[1],p[2],r()*TAU),b=this.mk('g',p[0],p[1],p[2],a.h);b.lead=a;b.ox=.95;b.oz=0;}   // a patrol of two, abreast
    // the rest in a different order each time, so that when the hill is full no role is always the one left out
    const K=Object.keys(FP_ROLES).filter(k=>k!=='g'&&k!=='sc'&&FP_ROLES[k].z);for(let i=K.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[K[i],K[j]]=[K[j],K[i]];}K.unshift('sc');   // the consul's train is the longest: it is placed first
    for(const k of K){const R=FP_ROLES[k],q=quota(k);tries=0;while(this.count(k)<q&&tries++<3){const n=1+(R.w?R.w.length:0);if(!room(n+1))break;const p=spot(R.z,false);if(!p)break;
        const a=group(k,p,r()*TAU);if(R.b==='stand'){a.tx=a.h0;}
        if(R.pair||(R.pairs&&r()<R.pairs)){const b=this.mk(k,p[0],p[1],p[2],a.h);b.lead=a;b.ox=.9;b.oz=.1;}
        if(sl===2&&(k==='s'||k==='er')&&room(1)){const b=this.mk('sn',p[0],p[1],p[2],a.h);b.lead=a;b.ox=.6;b.oz=1.5;}}}   // after dusk a slave with a lamp goes in front
    },
  tick(dt){const r=this.rng,L=this.list;
    for(const a of L){let want=0;
      if(a.lead&&a.st!=='post'){const l=a.lead,c=Math.cos(l.h),s=Math.sin(l.h),tx=l.x+c*a.ox+s*a.oz,tz=l.z-s*a.ox+c*a.oz,dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);
        if(d>.12){const v=Math.min(Math.max(l.sp,a.sp)*1.5,d*2.2),st=Math.min(d,v*dt),nx=a.x+dx/d*st,nz=a.z+dz/d*st,g=FPM.stand(nx,nz,a.y,.25);if(g===g&&Math.hypot(nx-FP.x,nz-FP.z)>.7){a.x=nx;a.z=nz;a.y+=(g-a.y)*Math.min(1,dt*10);a.ph+=st*4.2;want=Math.min(1,v/1.2);}
          a.h=fpTurn(a.h,d>.4?Math.atan2(dx,dz):l.h,dt*4);}else a.h=fpTurn(a.h,l.h,dt*3);}
      else if(a.st==='post'){if(a.lead){if(!a.set){const l=a.lead,c=Math.cos(l.h),s=Math.sin(l.h),nx=l.x+c*a.ox+s*a.oz,nz=l.z-s*a.ox+c*a.oz,g=FPM.stand(nx,nz,a.y,.25);a.set=1;if(g===g){a.x=nx;a.z=nz;a.y=g;}a.h0=a.h=l.h+(a.ox>0?-1.2:1.2);a.tx=a.h0;}}
        a.t-=dt;if(a.t<0){a.t=5+r()*9;a.tx=a.h0+(r()-.5)*.9;}if(a.look!=='lt')a.h=fpTurn(a.h,a.tx,dt*.6);}
      else if(a.st==='wait'){a.t-=dt;if(a.t<=0)this.target(a);}
      else{const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz),R=FP_ROLES[a.k];
        if(d<.35){a.st='wait';a.t=R.b==='idle'?6+r()*16:a.sp<.85?3+r()*7:a.k==='g'?1+r()*2:.6+r()*3.5;}
        else{const hd=Math.atan2(dx,dz);a.h=fpTurn(a.h,hd,dt*3.2);const st=a.sp*dt,nx=a.x+Math.sin(a.h)*st,nz=a.z+Math.cos(a.h)*st,g=FPM.stand(nx,nz,a.y,.28),pd=Math.hypot(nx-FP.x,nz-FP.z);
          let hit=pd<.85&&pd<Math.hypot(a.x-FP.x,a.z-FP.z);if(!hit)for(const b of L)if(b!==a&&b.lead!==a&&a.lead!==b){const bd=Math.hypot(nx-b.x,nz-b.z);if(bd<.6&&bd<Math.hypot(a.x-b.x,a.z-b.z)){hit=true;break;}}
          if(!(g===g)){a.st='wait';a.t=.4+r();}else if(hit){a.t+=dt;if(a.t>2.5){a.st='wait';a.t=.2;}}else{a.x=nx;a.z=nz;a.y+=(g-a.y)*Math.min(1,dt*10);a.ph+=st*4.2;want=Math.min(1.3,a.sp/1.2+.2);a.t=0;}}}
      a.amp+=(want-a.amp)*Math.min(1,dt*6);}
    // draw
    const M=new THREE.Matrix4(),S=new THREE.Vector3(),n={};let nb=0;for(const k in this.mesh)n[k]=0;
    for(const a of L){const m=this.mesh[a.look];if(n[a.look]>=m.userData.cap)continue;const i=n[a.look]++,aN=m.geometry.attributes.aN,aT=m.geometry.attributes.aT;M.makeRotationY(a.h);if(a.sc!==1)M.scale(S.set(a.sc,a.sc,a.sc));M.setPosition(a.x,a.y,a.z);m.setMatrixAt(i,M);
      aN.setXYZW(i,a.ph,a.amp,a.seed,0);aT.setXYZ(i,a.tint[0],a.tint[1],a.tint[2]);
      if(a.look==='lt')M.makeScale(.7,1,1.3);else M.makeScale(.42*a.sc,1,.42*a.sc);M.setPosition(a.x,a.y+.03,a.z);this.blob.setMatrixAt(nb++,M);}
    for(const k in this.mesh){const m=this.mesh[k];if(!m.count&&!n[k])continue;m.count=n[k];m.instanceMatrix.needsUpdate=true;m.geometry.attributes.aN.needsUpdate=true;m.geometry.attributes.aT.needsUpdate=true;}
    this.blob.count=nb;this.blob.instanceMatrix.needsUpdate=true;},
  // the figure the walker is looking at, within 7 m, with nothing as high as the chin in between
  facing(){const dx=-Math.sin(FP.yaw)*Math.cos(FP.pitch),dy=Math.sin(FP.pitch),dz=-Math.cos(FP.yaw)*Math.cos(FP.pitch),ey=FP.y+FPC.EYE;let best=null,bd=7;
    for(const a of this.list){const x=a.x-FP.x,y=a.y+1.2*a.sc-ey,z=a.z-FP.z,d=Math.hypot(x,y,z);if(d>=bd||(x*dx+y*dy+z*dz)/d<=.955)continue;
      let seen=true;for(let n=Math.ceil(d/.3),i=1;i<n;i++)if(FPM.at(FP.x+x*i/n,FP.z+z*i/n)>FP.g+1.45){seen=false;break;}if(seen){bd=d;best=a;}}return best;}};
function fpTurn(h,to,k){let d=to-h;d=Math.atan2(Math.sin(d),Math.cos(d));return h+d*Math.min(1,k);}

/* Antium · scene entry: layers, labels and camera views. Called from buildRomeLayers(W,L). */
function buildAntium(W,L){const AX=ANT.AX,AZ=ANT.AZ,I=ANT.ISL;W.AO=[AX,AZ];W.hA=antH;if(!MAT.antSea)MAT.antSea=waterMat('antsea',[.02,.12,.18],.3);
  L('antiumBase',0,(g,G)=>{antTerrain(G);antFortress(W,g,G);antHarbour(W,g,G);});
  L('antiumLab',0,(g,G)=>{antIslet(W,g,G);antWorks(W,g,G);});
  const ap=(n,l,x,z,y,s0,info)=>W.pois.push({n,l,x:AX+x,z:AZ+z,y,s0,s1:99,d:1100,pg:'antium',info});
  ap('安齐奥行宫','Villa Antiatina',-150,antAxZ(-150),96,0,'海角上的堡垒行宫：三层台地，一层比一层高，沿悬崖砌墙，墙角是方塔。【史】尼禄生在安齐奥，这里的皇家别墅沿海岸展开；这座海角堡垒是书中的样子。');
  ap('观测塔','引雷铁矛',-262,antAxZ(-262)-26,118,0,'行宫最高的大理石观测塔。塔顶立着一根三丈长、尖端镀银的细熟铁矛。');
  ap('城门','海角入口',402,antAxZ(402),52,0,'海角和陆地相连的地方，一座门楼两座方塔。');
  ap('圆形柱廊花园','第一层台地',262,antAxZ(262)+52,44,0,'两圈柱子围成的圆形花园，中间一个圆水池。');
  ap('大理石窄桥','仅有一桥相连',I[0],ANT.BRZ,72,1,'深谷上只有这一道单拱石桥。桥面只容两人并行，两侧没有栏杆。桥头一道铁门，日耳曼卫兵轮班。');
  ap('侧殿暗室','孤岩',I[0],I[1],80,1,'孤岩上的侧殿，窗户全用黑羊毛毡钉死。旁边是铅板焊成的槽房，冒白烟。');
  ap('镗床工棚','水轮',168,158,14,1,'港口边玄武岩上的工棚，十吨水泥基座，山泉顺着崖壁冲水轮。');
  ap('葡萄藤凉亭','老无花果树',236,antAxZ(236)+82,40,1,'工坊后面的凉亭，顶上爬着葡萄藤，旁边一棵老无花果树。');
  ap('悬崖马道','之字形石阶',186,128,22,0,'从港口顺着崖壁折上去的石阶，通到第一层台地。');
  ap('安齐奥港','Portus Antiatinus',360,300,12,0,'海角南边的港湾，两道防波堤围着，渔船的桅杆像一片光秃秃的林子。');
  ap('栈桥','水泥入海',270,255,8,1,'试验水泥方石的木栈桥。');
  const tw=W.antTower||[AX-262,110,AZ-26];
  Object.assign(W.views,{antium:{n:'安齐奥全景',pg:'antium',pos:[AX-700,230,AZ+470],tgt:[AX+20,40,AZ+10]},antTower:{n:'观测塔',pg:'antium',pos:[tw[0]-150,tw[1]+20,tw[2]+120],tgt:[tw[0],tw[1]-20,tw[2]]},
    antBridge:{n:'窄桥与孤岩',pg:'antium',pos:[AX-390,105,AZ-40],tgt:[AX-212,52,AZ-120]},antMill:{n:'港口与镗床',pg:'antium',pos:[AX+60,60,AZ+300],tgt:[AX+175,6,AZ+160]},
    antPergola:{n:'台地与凉亭',pg:'antium',pos:[AX+330,95,AZ+170],tgt:[AX+240,34,AZ+60]},antRoad:{n:'悬崖马道',pg:'antium',pos:[AX+90,60,AZ+230],tgt:[AX+185,18,AZ+130]},antHarbor:{n:'安齐奥港',pg:'antium',pos:[AX+560,150,AZ+620],tgt:[AX+330,4,AZ+300]},
    antCoast:{n:'北岸与海蚀拱',pg:'antium',pos:[AX+140,70,AZ-420],tgt:[AX-60,30,AZ-170]}});}

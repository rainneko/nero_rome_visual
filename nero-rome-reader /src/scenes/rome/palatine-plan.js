/* ================= 帕拉蒂尼山台基方案：东坡和南坡（H1）、北坡（H2；briefs/rome/palatine-masterplan.md 第 3、4 节） =================
   Data only (palatine.js reads it). Hill grid (palW(lx, lz)): +lx ESE, +lz SSW. Every terrace is a closed polygon, as the Capitoline's capPLY and capLOW
   (terraceReserve + terraceEdge); a lower terrace shares an edge with the one above. Levels (section 5 defaults): the east summit rim 55, the belt 42,
   the villa gardens 36 and 30 (the villa model's own two garden steps; the hill platform under them is at 30), the foot 26.
   Edge kinds, one per edge (edge i runs from pts[i] to pts[i+1]):
     'w'  a retaining wall, down to the floor of the terrace below (foot[i]) or, where foot[i] is null, to the ground; where the ground outside is higher
          than the floor the edge is a cut and the wall faces in (palCutWalls);
     's'  shared with a higher terrace or at the level of the ground beyond: no wall of this terrace;
     'r'  on rock (a hero model's rock base): no wall;
     'm'  a villa model's own wall stands there;
     'st' a stair's cheek (the stair builds it);
     'o'  open: a stair's head leaves the terrace there (a lane's mouth, a slot's head), no wall and the floor runs to the edge.
   The east stair (B) runs down the axis of the hemicycle between the two villas; the south stair is the old grand stair (temple-links.js hillStair),
   which now lands on the belt and the foot terraces it crosses. The Clivus Palatinus runs down the ravine east of it (lx 56-104), outside the foot wall.
   H2 (the north slope, towards the Forum and the Via Sacra): a rim at the deck level (51.4) between the Tiberiana and the Transitoria, the belt (42) from
   the Tiberiana's east cliff round to the east belt, with a lane along the Transitoria's rock and the four north houses on it (all turned to face north,
   their gardens 36/30 or, for the courtyard blocks c, a garden terrace 32 under their own 10 m drop), two stair lanes between them, a bastion at the
   north-east corner with the north-east stair (B) in a slot, and the foot (26) along the street with shop arches in its wall. */
const PAL_HEMI={c:[205,-18],R:24,stair:3.6};   // the hemicycle garden: centre on the belt's outer wall line, radius; half the width of the stair slot on its axis
const PAL_PLAN=(()=>{const{c,R,stair}=PAL_HEMI,arc=[],ae=[];
  // the hemicycle: the belt wall bulges out between the villas, 15 degrees a segment; the east stair cuts a slot through it on the axis (lz -18)
  const sx=Math.sqrt(R*R-stair*stair);
  for(let a=-90;a<=90;a+=15){const t=a*Math.PI/180,p=[+(c[0]+R*Math.cos(t)).toFixed(2),+(c[1]+R*Math.sin(t)).toFixed(2)];
    if(a===0){arc.push([c[0]+sx,c[1]-stair],[c[0]+2,c[1]-stair],[c[0]+2,c[1]+stair],[c[0]+sx,c[1]+stair]);ae.push('st','st','st','w');continue;}
    arc.push(p);ae.push('w');}
  const arcIn=arc.filter((p,i)=>!(i>=6&&i<=9)).slice().reverse();   // the foot terrace's inner edge along the arc (the slot is a stair over the foot floor there)
  const plats=[
    {id:'sumE',y:55,pts:[[151,-120],[174,-120],[174,34],[164,52],[90.5,57],[86.3,30],[136,30],[151,-2]],
     edge:['w','w','w','w','r','s','s','r'],foot:[42,42,42,42,null,null,null,null]},   // edge 0: over the north belt's lane (H2)
    {id:'beltE',y:42,pts:[[174,-120],[205,-120],[205,-89],[205,-55],[205,-42],...arc.slice(1,-1),[205,6],[205,19],[205,53],[199,63],[170,80],[130,94],[106,112],[99.3,117.3],[90.5,57],[164,52],[174,34]],
     edge:['s','w','m','w',...ae.slice(0,-1),'w','m','w','w','w','w','w','r','s','s','s'],   // edge 0: shared with the north belt (H2)
     foot:[null,26,null,26,...ae.slice(0,-1).map(k=>k==='w'?26:null),26,null,26,26,26,26,null,null,null,null,null]},
    {id:'footE',y:26,pts:[[205,-120],[233.3,-120],[258.2,-44.9],[227,66.6],[122.3,128.1],[106,112],[130,94],[170,80],[199,63],[205,53],[223.1,53],[223.1,19],[205,19],[205,6],...arcIn.slice(1,-1),[205,-42],[205,-55],[223.1,-55],[223.1,-89],[205,-89]],
     edge:['s','w','w','w','w','s','s','s','s','s','s','s','s',...arcIn.slice(1,-1).map(()=>'s'),'s','s','s','s','s','s'],foot:null},   // edge 0: shared with the north foot (H2)
    // v30a/v30b: 34 m across (lz), as wide as the cut villa's garden walls (the model is +-16.95 m at 30-36), so its side walls stand on the terrace
    {id:'v30a',y:30,pts:[[205,-89],[223.1,-89],[223.1,-55],[205,-55]],edge:['w','w','w','s'],foot:[26,26,26,null]},
    {id:'v30b',y:30,pts:[[205,19],[223.1,19],[223.1,53],[205,53]],edge:['w','w','w','s'],foot:[26,26,26,null]},
    {id:'beltS',y:42,pts:[[-28,152],[-10.8,151],[-10.8,140.2],[54,140.2],[54,158],[-28,158]],edge:['r','r','r','w','w','w'],foot:[null,null,null,null,26,null]},
    {id:'footS',y:26,pts:[[-28,158],[54,158],[54,181],[-28,181]],edge:['s','w','w','w'],foot:null},
    // ---- H2, the north slope ----
    // the rim at the deck level between the Tiberiana's east cliff and the Transitoria's rock: the saddle's deck runs on to its wall over the belt
    {id:'sumN',y:51.4,pts:[[-55.9,-106],[1.9,-106],[2.3,-111.3],[-55.9,-111.3]],edge:['s','r','w','r'],foot:[null,null,42,null]},
    // the north belt: under the rim and the Transitoria's rock a lane (lz -124..-130) behind the four houses; c1, dom_b, c2, dom_a from the west, their
    // fronts at -155.5; the stair lanes G1 (lx 62.5-67) and G3 (134-138.5) open from the lane ('o'); the north-east bastion (lx 177-205, to -145) with
    // the slot of the north-east stair (187.8-194.2); in the west a garden from the rim down to its wall (-124 at the Tiberiana, -155.5 at c1)
    {id:'beltN',y:42,pts:[[-55.9,-111.3],[2.3,-111.3],[3.9,-119.7],[6.7,-124],[16.6,-124.1],[146.5,-125.4],[149.7,-125.4],[151,-120],[174,-120],[205,-120],
       [205,-145],[194.2,-145],[194.2,-121],[187.8,-121],[187.8,-145],[177,-145],[177,-155.5],[170.5,-155.5],[140.5,-155.5],[138.5,-155.5],[138.5,-130],[134,-130],
       [134,-155.5],[102.45,-155.5],[99,-155.5],[69,-155.5],[67,-155.5],[67,-130],[62.5,-130],[62.5,-155.5],[30.95,-155.5],[29.5,-155.5],[-10,-138],[-55.9,-124]],
     edge:['s','r','r','r','r','r','r','s','s','w', 'w','w','o','w','w','w','w','m','w','w','o', 'm','m','w','m','w','w','o','m','m','w','w','w','r'],
     foot:[null,null,null,null,null,null,null,null,null,26, 26,null,null,null,26,26,30,null,30,null,null, null,null,30,null,30,null,null,null,null,32,26,26,null]},
    // the garden terraces: c's 32 (its own lower terrace and covered stair come down to it), the cut villas' 30 (their 36 is the model's)
    {id:'v32a',y:32,pts:[[29.5,-155.5],[62.5,-155.5],[62.5,-161.5],[29.5,-161.5]],edge:['s','w','w','w'],foot:[null,null,26,26]},
    {id:'v30c',y:30,pts:[[67,-155.5],[101,-155.5],[101,-170],[101,-173.6],[67,-173.6],[67,-168.5]],edge:['s','s','w','w','w','w'],foot:[null,null,26,26,26,null]},
    {id:'v32b',y:32,pts:[[101,-155.5],[134,-155.5],[134,-168.5],[134,-170],[101,-170]],edge:['s','w','w','w','w'],foot:[null,null,26,26,30]},
    {id:'v30d',y:30,pts:[[138.5,-155.5],[177,-155.5],[177,-173.6],[138.5,-173.6],[138.5,-168.5]],edge:['s','w','w','w','w'],foot:[null,26,26,26,null]},
    // the north foot: from the east foot round to the Tiberiana's north-east corner; its outer wall along the 20-21 m contour, shop arches in it (shops)
    {id:'footN',y:26,pts:[[205,-120],[233.3,-120],[220,-146],[205,-163],[194.2,-171.5],[194.2,-161],[187.8,-161],[187.8,-176.6],[160,-185],[130,-186],[100,-184],[62,-180],[30,-169],[0,-157],[-30,-146],
       [-57.5,-138],[-56.9,-137.7],[-56,-133.7],[-55.9,-124],[-10,-138],[29.5,-155.5],[29.5,-161.5],[62.5,-161.5],[62.5,-168.5],[67,-168.5],[67,-173.6],
       [101,-173.6],[101,-170],[134,-170],[134,-168.5],[138.5,-168.5],[138.5,-173.6],[177,-173.6],[177,-155.5],[177,-145],[187.8,-145],[194.2,-145],[205,-145]],
     edge:['s','w','w','w','w','o','w','w','w','w','w','w','w','w','w','r','r','r','s','s','s','s','st','st','s','s','s','s','s','st','s','s','s','s','s','st','s','s'],foot:null}];
  for(const P of plats){if(!P.foot)P.foot=P.edge.map(()=>null);if(P.edge.length!==P.pts.length||P.foot.length!==P.pts.length)throw new Error('PAL_PLAN '+P.id+': '+P.pts.length+' points, '+P.edge.length+' edges');}
  return{levels:{summitE:55,belt:42,villa:[36,30],foot:26},plats,hemi:{arc,slot:[[c[0]+2,c[1]-stair],[c[0]+sx,c[1]+stair]]},
    // stairs (hill grid): B the east stair down the hemicycle's axis to the street; P paired flights from the summit rim down to the belt along the summit
    // wall; C stairs along the walls (2.4-3 m); V from each villa's garden platform (30) down to the foot; G the gate flight from the south belt down to the
    // Clivus Palatinus. from/to: the terraces they join ('street', 'summit', 'clivus': the street, the summit plateau, the ramp)
    // legs: [terrace, edge, s0, s1, off]: a run along that edge from s0 to s1 metres (from its first point), off metres outside its line (negative: inside);
    // the stair walks from the first leg's s0 (its head, an opening in that terrace's parapet when top is its floor) down to the floor 'floor' (null: the ground)
    stairs:[
      {id:'eastB',cls:'B',w:6,from:'beltE',to:'street',via:'footE',axis:[[207,-18],[300,-18]]},
      // the paired flights flank the hemicycle (the review of 2026-11-12, after H2-B): each head 14 m off the axis (s 102), down and out along the summit wall
      // towards the villas; the wall between the heads is clear for the string course and the wall fountain on the axis
      {id:'eastPn',cls:'B',w:2.8,from:'summit',to:'beltE',top:55,floor:42,legs:[['sumE',1,88,50,1.9]]},
      {id:'eastPs',cls:'B',w:2.8,from:'summit',to:'beltE',top:55,floor:42,legs:[['sumE',1,116,154,1.9]]},
      {id:'sumS',cls:'C',w:2.6,from:'summit',to:'beltE',top:55,floor:42,legs:[['sumE',3,30,64,1.6]]},   // from the summit rim by the Jupiter Victor temple down to the belt's south arm
      {id:'neC',cls:'C',w:2.6,from:'beltE',to:'footE',top:42,floor:26,legs:[['beltE',1,28,6,1.6],['footE',0,1.6,24,-6]]},   // the second leg 6 m in from the foot wall: clear of the corner pier
      {id:'seC',cls:'C',w:2.6,from:'beltE',to:'footE',top:42,floor:26,legs:[['beltE',23,2,42.4,1.6],['beltE',24,.5,10,1.6]]},
      {id:'v30aV',cls:'C',w:2.4,from:'v30a',to:'footE',top:30,floor:26,legs:[['v30a',1,27,13,1.5]]},
      {id:'v30bV',cls:'C',w:2.4,from:'v30b',to:'footE',top:30,floor:26,legs:[['v30b',1,7,21,1.5]]},
      {id:'clivG',cls:'C',w:2.6,from:'beltS',to:'clivus',top:42,floor:null,legs:[['beltS',3,13,-3,1.6]]},   // north, against the ground rising to the Apollo rock: it meets the ground about lz 140
      {id:'footSlot',cls:'C',w:2.6,from:'footS',to:'clivus',top:26,floor:null,legs:[['footS',1,18,1.5,1.6]]},
      // ---- H2, the north slope ----
      // the north-east stair (B): from the belt's north-east bastion down its slot (axis lx 191) to the foot, across it, and down the cut through the foot
      // terrace (cut: the foot wall steps back to lz -161, where the ground is at the foot's level, so the lower flight keeps to the ground down to the street
      // at lz -188 instead of leaving a 7 m wall and passing over the street); with neP (from the summit's north-east corner down to the belt) it goes from the Via Sacra past the houses to the east palace
      {id:'neB',cls:'B',w:5,from:'beltN',to:'street',via:'footN',axis:[[191,-121.6],[191,-196]],slot:[[187.8,-145],[194.2,-121]],cut:[[187.8,-180],[194.2,-161]]},
      {id:'neP',cls:'B',w:3.2,from:'summit',to:'beltN',top:55,floor:42,legs:[['sumE',0,1.6,25,2],['sumE',1,-2,10,2]]},
      // the stair lanes between the houses (a straight flight from the lane at the back down to the foot, between the courtyard block's drop wall and the
      // villa's belt wall): lane = the ground they take [[x0,z0],[x1,z1]]
      {id:'g1C',cls:'C',w:2.6,from:'beltN',to:'footN',axis:[[64.75,-130.6],[64.75,-180]],lane:[[62.5,-168.5],[67,-130]]},
      {id:'g3C',cls:'C',w:2.6,from:'beltN',to:'footN',axis:[[136.25,-130.6],[136.25,-180]],lane:[[134,-168.5],[138.5,-130]]},
      {id:'sumNC',cls:'C',w:2.6,from:'sumN',to:'beltN',top:51.4,floor:42,legs:[['sumN',2,20,48,1.6]]},
      {id:'beltWC',cls:'C',w:2.6,from:'beltN',to:'footN',top:42,floor:26,legs:[['beltN',31,2,43,1.6]]},   // down the west garden's wall, west from c1's corner
      {id:'v32aV',cls:'C',w:2.4,from:'v32a',to:'footN',top:32,floor:26,legs:[['v32a',2,6,22,1.5]]},
      {id:'v30cV',cls:'C',w:2.4,from:'v30c',to:'footN',top:30,floor:26,legs:[['v30c',3,5,17,1.5]]},
      {id:'v32bV',cls:'C',w:2.4,from:'v32b',to:'footN',top:32,floor:26,legs:[['v32b',3,5,22,1.5]]},
      {id:'v30dV',cls:'C',w:2.4,from:'v30d',to:'footN',top:30,floor:26,legs:[['v30d',2,5,17,1.5]]},
      {id:'footWC',cls:'C',w:2.6,from:'footN',to:'street',top:26,floor:null,legs:[['footN',13,4,22,1.6]]},
      {id:'footMC',cls:'C',w:2.6,from:'footN',to:'street',top:26,floor:null,legs:[['footN',10,3,19,1.6]]}],
    // H2, the west and south-west slopes (palWestSlope): rock below the summit from the Tiberiana's south-west corner round to the Scalae Caci, and a grove on
    // the shelf west of the Magna Mater and on the south-west slope (holm oak, laurel, stone pine: masterplan 2.5); the streets, the stairs, the houses and the
    // models are kept clear in the code
    west:{rock:[[-268,-40],[-217,-40],[-214,40],[-209,58],[-206,150],[-196,168],[-170,182],[-150,190],[-128,188],[-100,186],[-92,214],[-268,214]],
      grove:[[-209,58],[-186,58],[-186,150],[-152,150],[-152,176],[-96,176],[-90,216],[-245,216],[-245,165],[-212,150]],
      // the old rings' footprints at the west foot that H1 registered, kept as open land by palWestReserve (world [x, z, hw, hd, cos, sin], exactly as H1 had
      // them): the ten of the lowest ring (level 16) that lay outside the fence (PAL_FENCE), so the districts and streets outside it see what they saw at H1,
      // and every one that the house grid west of the hill in monuments.js can reach: that grid runs one dice stream over four zones, so a house it gains
      // here would shift every house after it, out to x -330, z -255 (outside the fence and the hill's terrain patch)
      ringLand:[
        [-138.424986333213,279.8326260402098,4.533963719669946,7.29999999999994,0.07193237350466357,0.9974095115056731],[-137.96865855276025,272.93999054070446,4.533665687907893,6.999999999999943,0.09313093415309881,0.9956538701294598],[-137.26941813295122,266.0673306888672,4.530846286807108,6.999999999999943,0.15999252664478456,0.9871182256537552],
        [-136.0792103643886,259.267547516044,4.54121860426108,6.699999999999946,0.2372240612965904,0.9714549627965012],[-134.19122382552288,252.59629212097332,4.523644187989327,6.699999999999946,0.23449300497634354,0.9721178069643435],[-132.00533159993356,246.03131105744802,4.541681132399798,6.999999999999943,0.33383628532234155,0.9426310702508062],
        [-152.48215142811176,315.2659740043291,4.716897845751988,5.499999999999957,0.021891733779828546,0.9997603472793433],[-152.1231749379354,307.9648536890074,4.727650275196558,6.399999999999949,-0.13792730847816861,0.9904423544941766],[-152.87948320140353,300.71043047999126,4.733018687745686,6.999999999999943,-0.11803195317758472,0.993009797549392],
        [-153.32230713569317,293.43954182523964,4.718191001997377,6.999999999999943,-0.013246155219154804,0.9999122658373134],[-153.24381802384252,286.15976456493104,4.720038258672116,6.999999999999943,0.03269635653720817,0.9994653311992326],[-152.89208554897175,278.8845894133299,4.721207731886471,6.999999999999943,0.06377049278151213,0.9979645906796508],
        [-152.32935474360062,271.62112779172287,4.721634180201178,6.999999999999943,0.09109708867924467,0.9958420158007825],[-151.42335901738753,264.39835422855356,4.718889308797605,6.999999999999943,0.1573674672513954,0.9875401157679019],[-149.84647822095906,257.28190472020617,4.728755762576613,6.999999999999943,0.23242249208772206,0.9726149213186752],
        [-147.9639845257049,250.2330751243871,4.711672178567374,7.29999999999994,0.2311813910024292,0.9729106662249016],[-146.02050234288757,243.24153413117324,4.72826678959569,7.29999999999994,0.3269824228784983,0.9450304202132896],[-143.19621227667673,236.4797222223503,4.746030677811387,7.29999999999994,0.4057020480150047,0.9140053874219948],
        [-140.1737934209108,229.8299203699977,4.774595779123592,7.29999999999994,0.47766410732643366,0.8785425434047239],[-136.69156360341935,223.3783314477113,4.727528789486197,6.999999999999943,0.4794837796229089,0.8775507421673858],[-132.69850623716997,217.1870411549837,4.737664070559807,6.999999999999943,0.5313210756621828,0.8471705345189839],
        [-130.32737946729725,383.64301237926304,4.80716855364353,7.5999999999999375,-0.604786150812904,0.7963879153935671],[-135.13046702289256,377.74495064272907,4.835871882057582,7.29999999999994,-0.5805848848235635,0.8141997245850735],[-139.6926650950447,371.62361279106733,4.8654749298048205,6.999999999999943,-0.5566971529574991,0.8307155228410114],
        [-144.52294570124792,365.4118324981988,4.949549066282962,6.699999999999946,-0.5624106013014567,0.8268580987955152],[-149.75046707407313,359.1147498549069,5.048746188060381,6.099999999999952,-0.5743216267496252,0.818629750893323],[-154.8159373239307,352.6076785921755,4.992486524454229,5.19999999999996,-0.49999912824959997,0.8660259070891818],
        [-158.68654862788418,345.7137192216325,4.956120120145828,4.599999999999966,-0.42964963801646505,0.9029956747140712],[-161.38166951240464,338.52387853869783,4.899211591420735,4.599999999999966,-0.3230413194751378,0.946384861413031],[-162.74836611490537,331.091512395285,4.903808016276253,5.19999999999996,-0.2759739856022923,0.9611651051046255],
        [-163.78531595390024,323.5901873428022,4.9492732907756665,6.399999999999949,-0.2806141136459519,0.9598206703456104],[-165.1916619070932,316.07893154569723,5.006345719692956,7.5999999999999375,-0.2973891719315725,0.9547563460998065],[-166.99284335601058,308.53711269592463,4.944486507966014,8.199999999999932,-0.1742646091047122,0.9846988605729072],
        [-168.14484425577558,300.9163199076595,4.934124716610125,7.899999999999935,-0.08506212591772336,0.9963756494085739],[-168.534227314205,293.2476008555645,4.948896296833624,7.899999999999935,-0.08082296871164014,0.9967284724179586],[-168.7319983821884,285.56229481672426,4.937793012622244,8.199999999999932,0.01576177098121152,0.9998757755719136],
        [-168.43094289846906,277.8800428805273,4.939902843929286,8.199999999999932,0.059553153606889155,0.9982251358764085],[-167.854497436726,270.20970356984355,4.937821656888255,8.199999999999932,0.12788846770279894,0.991788556008099],[-166.7619946449114,262.600476223466,4.947472024350455,7.899999999999935,0.20162375741547045,0.9794630470036465],
        [-164.94745446220514,255.1036826726609,4.931041782692654,7.899999999999935,0.20209835269690749,0.9793652310742894],[-162.95852789470666,247.67703340300113,4.946157058610435,8.199999999999932,0.29486364828064354,0.9555393392857402],[-160.48937308520564,240.38006711967353,4.94302529396938,8.199999999999932,0.3364522834211857,0.941700515546567],
        [-157.76352515064542,233.19200382470132,4.9312307020722335,8.199999999999932,0.36550205994602963,0.9308105307608037],[-154.8395170615642,226.11105767399607,4.936656123471353,8.199999999999932,0.4258345135006914,0.9048010649372764],[-151.44823424184645,219.22906003129867,4.991717052557346,7.899999999999935,0.5231490925427468,0.8522411788758512],
        [-147.24358543583043,212.67609576224842,4.953718223212308,7.5999999999999375,0.533125735646382,0.846036021686727],[-143.00662931243752,206.23577129125619,4.887335791241682,7.899999999999935,0.521774354755573,0.853083537948896],[-138.93453169177232,199.84909401036379,4.925747851569497,7.899999999999935,0.5979197480483806,0.8015559711547042],
        [-134.23404550785793,193.80782178533946,4.91709839473924,7.5999999999999375,0.6326474622331666,0.7744399192512832],[-132.84940911096325,407.7764037721388,5.008820399038918,10.899999999999906,-0.6694038180334942,0.7428987336119106],[-138.05637278152005,401.95524532187653,5.020132256324965,10.599999999999909,-0.6353049492036191,0.7722613686553192],
        [-143.00622130832562,395.88657326238945,5.046096696987875,10.599999999999909,-0.609765273925764,0.7925820529852022],[-147.78511578700332,389.617559339771,5.075227764054624,10.599999999999909,-0.5861222648072952,0.810222617986666],[-152.40983710780273,383.16245010529997,5.105067099218383,10.599999999999909,-0.5626392295311581,0.8267025446873771],
        [-156.87987725883767,376.5274153526193,5.135075788244015,10.599999999999909,-0.5388840710274099,0.8423799368414027],[-161.1904669875337,369.7167589478798,5.165136101067088,10.599999999999909,-0.5147612982691476,0.8573335440797016],[-165.33583752258653,362.73447011070897,5.195222524377551,10.599999999999909,-0.490261711145818,0.8715752718981732],
        [-177.66464811879084,228.73710055258547,5.259737534658539,11.799999999999898,0.38760104179232574,0.9218272248103241],[-174.3284928843174,221.21815548268629,5.309589408029596,11.4999999999999,0.48232208873291343,0.8759939513035004],[-170.29550730196237,213.96452666144808,5.305657077845307,11.199999999999903,0.5229061527625515,0.8523902600353123],
        [-166.10517176078238,206.86151074023917,5.282861104096064,10.899999999999906,0.5506263514783049,0.8347518320181695],[-161.46775615676333,200.01864333749037,5.254713286555649,10.599999999999909,0.5749252033388332,0.8182059707468538],[-156.60327335803,193.38079382194908,5.225122096546099,10.599999999999909,0.59805650948156,0.801453935960597],
        [-151.57158378448463,186.93671270308383,5.195157273544086,10.599999999999909,0.6205545872038214,0.7841632510519062],[-146.39256255572533,180.68596271735868,5.165107033779893,10.599999999999909,0.6425355134056574,0.766255906347565],[-141.07613634005813,174.6306505915977,5.135048666186391,10.599999999999909,0.6640134419464321,0.7477206356082813],
        [-135.62978761273112,168.77335912559855,5.105003025671988,10.599999999999909,0.684977858910452,0.72856388381696]
      ]},
    // R8: the Domus Tiberiana's north-west stair (tiberiana-v2: its foot at the rock's hem, the north edge of its lowest tread, 3.6 m wide, facing north):
    // a walk of low steps from there to the Vicus Tuscus (palR8Walk)
    r8:{foot:[-214.3,-139.9],y:9.65,w:3.6},
    // shop arches in the north foot wall, towards the Via Sacra (masterplan 2.5): edge -> [s0, s1] along it; the ground in front is levelled and paved
    shops:{footN:{7:[5,26],8:[3,27],9:[3,27],10:[22,35],11:[3,31],12:[3,29]}},
    // the villas: the cut models, each with its own flights (house 42, garden 36, garden 30); their entrance is on the belt street behind them
    villas:[{n:'rome_domus_a_belt',lx:202.6,lz:-72,turn:90,y:42,plat:'beltE',gardens:'v30a'},{n:'rome_domus_b_belt',lx:202.6,lz:36,turn:90,y:42,plat:'beltE',gardens:'v30b'},
      {n:'rome_domus_b_belt',lx:84,lz:-153.1,turn:180,y:42,plat:'beltN',gardens:'v30c'},{n:'rome_domus_a_belt',lx:155.5,lz:-153.1,turn:180,y:42,plat:'beltN',gardens:'v30d'}],   // H2: the north houses 2 and 4
    fountains:[{n:'hemicycle',plat:'beltE',at:[174,-18],wall:'sumE'}],
    // the Clivus Palatinus down the ravine east of the south terraces: hillRoute from top to bot (zigzags within half of that axis), led in from head and on to the tail
    // (the old foot at the Circus); every point east of lx 57 until lz 205 (outside the foot walls)
    clivus:{head:[57,147],top:[78,149],bot:[78,212],half:19,tail:[[66,227],[54,240]]},
    // the H1 ground: east and south-east, and the south (the ravine between them is outside the foot wall); H2: the north. Used by the checks and to drop the old rings.
    zones:[[[151,-120],[233.3,-120],[258.2,-44.9],[227,66.6],[122.3,128.1],[106,112],[99.3,117.3],[86.3,30],[136,30],[151,-2]],
      [[-28,152],[-10.8,151],[-10.8,140.2],[54,140.2],[54,181],[-28,181]],
      // H2: the north slope, from the deck's edge and the Transitoria's rock to the north foot wall
      [[-55.9,-106],[1.9,-106],[2.3,-111.3],[3.9,-119.7],[6.7,-124],[146.5,-125.4],[151,-120],[233.3,-120],[220,-146],[205,-163],[186,-178],[160,-185],[130,-186],
       [100,-184],[62,-180],[30,-169],[0,-157],[-30,-146],[-57.5,-138],[-56,-133.7]]],
    rayCut:[-42,208]};   // palTerraces: no rays (old rings) between these angles (deg from C=[20,-15]). H1 cut -26..106 (the east and south slopes); H2 cuts the
                         // rest: the west and south-west slopes are rock and grove (palWestSlope, the author's default of 2026-11-12), and the north-east rings
                         // below the north foot wall go too (outside the foot walls the slope is natural, R5). No ring is left.
})();

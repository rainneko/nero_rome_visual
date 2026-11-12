/* ================= 帕拉蒂尼山台基方案：东坡和南坡（H1，briefs/rome/palatine-masterplan.md 第 3、4 节） =================
   Data only (palatine.js reads it). Hill grid (palW(lx, lz)): +lx ESE, +lz SSW. Every terrace is a closed polygon, as the Capitoline's capPLY and capLOW
   (terraceReserve + terraceEdge); a lower terrace shares an edge with the one above. Levels (section 5 defaults): the east summit rim 55, the belt 42,
   the villa gardens 36 and 30 (the villa model's own two garden steps; the hill platform under them is at 30), the foot 26.
   Edge kinds, one per edge (edge i runs from pts[i] to pts[i+1]):
     'w'  a retaining wall, down to the floor of the terrace below (foot[i]) or, where foot[i] is null, to the ground; where the ground outside is higher
          than the floor the edge is a cut and the wall faces in (palCutWalls);
     's'  shared with a higher terrace or at the level of the ground beyond: no wall of this terrace;
     'r'  on rock (a hero model's rock base): no wall;
     'm'  a villa model's own wall stands there;
     'st' a stair's cheek (the stair builds it).
   The east stair (B) runs down the axis of the hemicycle between the two villas; the south stair is the old grand stair (temple-links.js hillStair),
   which now lands on the belt and the foot terraces it crosses. The Clivus Palatinus runs down the ravine east of it (lx 56-104), outside the foot wall. */
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
     edge:['w','w','w','w','r','s','s','r'],foot:[null,42,42,42,null,null,null,null]},
    {id:'beltE',y:42,pts:[[174,-120],[205,-120],[205,-89],[205,-55],[205,-42],...arc.slice(1,-1),[205,6],[205,19],[205,53],[199,63],[170,80],[130,94],[106,112],[99.3,117.3],[90.5,57],[164,52],[174,34]],
     edge:['w','w','m','w',...ae.slice(0,-1),'w','m','w','w','w','w','w','r','s','s','s'],
     foot:[null,26,null,26,...ae.slice(0,-1).map(k=>k==='w'?26:null),26,null,26,26,26,26,null,null,null,null,null]},
    {id:'footE',y:26,pts:[[205,-120],[233.3,-120],[258.2,-44.9],[227,66.6],[122.3,128.1],[106,112],[130,94],[170,80],[199,63],[205,53],[223.1,53],[223.1,19],[205,19],[205,6],...arcIn.slice(1,-1),[205,-42],[205,-55],[223.1,-55],[223.1,-89],[205,-89]],
     edge:['w','w','w','w','w','s','s','s','s','s','s','s','s',...arcIn.slice(1,-1).map(()=>'s'),'s','s','s','s','s','s'],foot:null},
    // v30a/v30b: 34 m across (lz), as wide as the cut villa's garden walls (the model is +-16.95 m at 30-36), so its side walls stand on the terrace
    {id:'v30a',y:30,pts:[[205,-89],[223.1,-89],[223.1,-55],[205,-55]],edge:['w','w','w','s'],foot:[26,26,26,null]},
    {id:'v30b',y:30,pts:[[205,19],[223.1,19],[223.1,53],[205,53]],edge:['w','w','w','s'],foot:[26,26,26,null]},
    {id:'beltS',y:42,pts:[[-28,152],[-10.8,151],[-10.8,140.2],[54,140.2],[54,158],[-28,158]],edge:['r','r','r','w','w','w'],foot:[null,null,null,null,26,null]},
    {id:'footS',y:26,pts:[[-28,158],[54,158],[54,181],[-28,181]],edge:['s','w','w','w'],foot:null}];
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
      {id:'footSlot',cls:'C',w:2.6,from:'footS',to:'clivus',top:26,floor:null,legs:[['footS',1,18,1.5,1.6]]}],
    // the villas: the cut models, each with its own flights (house 42, garden 36, garden 30); their entrance is on the belt street behind them
    villas:[{n:'rome_domus_a_belt',lx:202.6,lz:-72,turn:90,y:42,plat:'beltE',gardens:'v30a'},{n:'rome_domus_b_belt',lx:202.6,lz:36,turn:90,y:42,plat:'beltE',gardens:'v30b'}],
    fountains:[{n:'hemicycle',plat:'beltE',at:[174,-18],wall:'sumE'}],
    // the Clivus Palatinus down the ravine east of the south terraces: hillRoute from top to bot (zigzags within half of that axis), led in from head and on to the tail
    // (the old foot at the Circus); every point east of lx 57 until lz 205 (outside the foot walls)
    clivus:{head:[57,147],top:[78,149],bot:[78,212],half:19,tail:[[66,227],[54,240]]},
    // the H1 ground: east and south-east, and the south (the ravine between them is outside the foot wall). Used by the checks and to drop the old rings.
    zones:[[[151,-120],[233.3,-120],[258.2,-44.9],[227,66.6],[122.3,128.1],[106,112],[99.3,117.3],[86.3,30],[136,30],[151,-2]],
      [[-28,152],[-10.8,151],[-10.8,140.2],[54,140.2],[54,181],[-28,181]]],
    rayCut:[-26,106]};   // palTerraces: no rays (old rings) between these angles (deg from C=[20,-15]): the east and south slopes and the ravine between them;
                         // north of -26 deg only the rings inside the zones (+6 m) go, so the north-east slope (H2) and the streets beyond it stay as they were
})();

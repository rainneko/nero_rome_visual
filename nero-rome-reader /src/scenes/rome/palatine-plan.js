/* ================= 帕拉蒂尼山台基方案：东坡和南坡（H1）、北坡（H2；briefs/rome/palatine-masterplan.md 第 3、4 节） =================
   Data only (palatine.js reads it). Hill grid (palW(lx, lz)): +lx ESE, +lz SSW. Every terrace is a closed polygon, as the Capitoline's capPLY and capLOW
   (terraceReserve + terraceEdge); a lower terrace shares an edge with the one above. Levels (section 5 defaults): the east summit rim 55, the belt 42,
   the villa gardens 36 and 30 (R10 乙, round 4: the house model keeps only its garden T1 at 38.6; under it the system's 36 and a 30 strip), the foot 26.
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
  // H2 rows: [lx, lz, edge kind, foot] per point (the edge runs from that point to the next)
  const rows=R=>({pts:R.map(r=>[r[0],r[1]]),edge:R.map(r=>r[2]),foot:R.map(r=>r[3]??null)});
  // 图四: the exedra in the gate platform's front wall, on the east palace's axis (lx 73.3), radius 4, 15-degree facets into the platform
  const gArc=[];for(let a=15;a<=165;a+=15){const t=a*Math.PI/180;gArc.push([+(73.3+4*Math.cos(t)).toFixed(2),+(-155.5+4*Math.sin(t)).toFixed(2)]);}
  const plats=[
    {id:'sumE',y:55,pts:[[151,-120],[174,-120],[174,34],[164,52],[90.5,57],[86.3,30],[136,30],[151,-2],[151,-30.5]],
     edge:['w','w','w','w','r','s','s','r','w'],foot:[42,42,42,42,null,null,null,null,51.76]},   // edge 0: over the north belt's lane (H2); edge 8: over the slot's fill (图五)
    // 图五 (the review of 2026-11-13): the slot between the Transitoria's terrace B (its east wall, lx 141.3) and the summit rim, from B's north wall line
    // to the courtyard block c's north wall (-30.5), filled level with B's paving (51.82); a wall down to the belt on the north, the summit's wall (3.2 m)
    // on the east with a stair along it (tbE)
    {id:'sumTB',y:51.76,...rows([[141.3,-121.1,'w'],[150.74,-121.1,'w'],[151,-120,'s'],[151,-30.5,'m'],[141.3,-30.5,'m']])},
    {id:'beltE',y:42,pts:[[174,-120],[205,-120],[205,-89],[205,-87],[205,-57],[205,-55],[205,-42],...arc.slice(1,-1),[205,6],[205,19],[205,21],[205,51],[205,53],[199,63],[170,80],[130,94],[106,112],[99.3,117.3],[90.5,57],[164,52],[174,34]],
     edge:['s','w','w','m','w','w',...ae.slice(0,-1),'w','w','m','w','w','w','w','w','w','r','s','s','s'],   // edge 0: shared with the north belt (H2); R10: the 2 m either side of a house's T1 (model x +-15) a wall down to its 36
     foot:[null,26,36,null,36,26,...ae.slice(0,-1).map(k=>k==='w'?26:null),26,36,null,36,26,26,26,26,null,null,null,null,null]},
    {id:'footE',y:26,pts:[[205,-120],[233.3,-120],[258.2,-44.9],[227,66.6],[122.3,128.1],[106,112],[130,94],[170,80],[199,63],[205,53],[227.6,53],[227.6,19],[205,19],[205,6],...arcIn.slice(1,-1),[205,-42],[205,-55],[227.6,-55],[227.6,-89],[205,-89]],
     edge:['s','w','w','w','w','s','s','s','s','s','s','s','s',...arcIn.slice(1,-1).map(()=>'s'),'s','s','s','s','s','s'],foot:null},   // edge 0: shared with the north foot (H2)
    // R10 乙 (round 4, the reviewer's decision of 2026-11-14): the house model ends at its garden T1 (38.6) and W1 (2.6 m, its outer face model y -14.5);
    // under it the system's terrace at 36 (34 m across, its T1 side walls at model x +-15 stand on it; the W1 stairs, palVillaW1, come down onto it), then
    // a 4.5 m strip at 30 in front, walls 36->30 and 30->26. The side walls of the 36 go down to the foot (26): 10 m, 1 m over R2 (flagged to the reviewer)
    {id:'v36a',y:36,pts:[[205,-89],[223.1,-89],[223.1,-55],[205,-55]],edge:['w','w','w','s'],foot:[26,30,26,null]},
    {id:'v30a',y:30,pts:[[223.1,-89],[227.6,-89],[227.6,-55],[223.1,-55]],edge:['w','w','w','s'],foot:[26,26,26,null]},
    {id:'v36b',y:36,pts:[[205,19],[223.1,19],[223.1,53],[205,53]],edge:['w','w','w','s'],foot:[26,30,26,null]},
    {id:'v30b',y:30,pts:[[223.1,19],[227.6,19],[227.6,53],[223.1,53]],edge:['w','w','w','s'],foot:[26,26,26,null]},
    {id:'beltS',y:42,pts:[[-28,152],[-10.8,151],[-10.8,140.2],[36.5,140.2],[54,140.2],[54,158],[-28,158]],edge:['r','r','r','s','w','w','w'],foot:[null,null,null,null,null,26,null]},
    // 图一 (the review of 2026-11-13): the hollow between the Apollo's lower south wall and the belt filled to the belt's level, walled where the ground is
    // lower, planted; the planned stair from the opening in the Apollo's lower terrace comes down through it to the belt (palApolloS)
    {id:'gApS',y:42,...rows([[36.5,129.3,'m'],[54,129.3,'w'],[54,140.2,'s'],[36.5,140.2,'w']])},
    // 图七 east, option 甲 (the review of 2026-11-13): the walk at 42 along the foot of the Victoria's rock from the Magna Mater's east stair (palMMEast) to the
    // Scalae Caci forecourt (PAL_SC.land), 3-3.5 m between its walls, a wall with its parapet on the south; open where the stair comes down and onto the forecourt
    {id:'beltMM',y:42,tl:false,...rows([[-140,164.1,'o'],[-134.6,164.1,'w'],[-133.4,165.1,'w'],[-118,165.1,'w'],[-118,166,'o'],[-120.5,166,'o'],[-120.5,168.1,'w'],[-126,168.6,'w'],[-140,168.6,'w']])},
    // 图三 (the review of 2026-11-13): the lane between the Tiberiana's south range and the courtyard block b (lz 29.5), level at the palace's outside ground
    // (54.85), paved; on the south its paving runs on to b's back wall (round 4, b_flat: no cut wall there, palBBack; b's back stair comes down onto it); at both ends a stair up (palTibLane) to the paved strips beside b
    {id:'sumL',y:54.79,...rows([[-165.5,20,'m'],[-94.5,20,'w'],[-94.5,29.5,'w'],[-95.4,29.5,'o'],[-98.2,29.5,'w'],[-161.8,29.5,'o'],[-164.6,29.5,'w'],[-165.5,29.5,'w']])},
    // the lane's end stairs' heads (round 4, option 甲 of 14_lane_b, the review of 2026-11-15): a floor of its own at each head, its paving flush with the stair's top
    // (the plateau there, PAL_LANE_TOE.plateau, + 0.13: east 56.88, west 57.43), from the end of the stair's 2.5 m apron (lz 35.8, 36.9) to lz 46, 4.5 m out from its axis on the side away from block b;
    // on b's side it stops at the stair's cheek, a low wall down to the strip along b's end (held at b's floor, palBfHold), so b's end walls stand on its level
    // plaza: its open edges are on the paved plaza in front of b, which meets the streets 9-11 m south (for __palReach)
    {id:'tlE',y:56.82,plaza:true,...rows([[-98.2,35.8,'o'],[-95.4,35.8,'w'],[-92.3,35.8,'s'],[-92.3,46,'s'],[-98.2,46,'w']])},
    {id:'tlW',y:57.37,plaza:true,...rows([[-161.8,36.9,'o'],[-164.6,36.9,'s'],[-167.7,36.9,'s'],[-167.7,46,'s'],[-161.8,46,'w']])},
    {id:'footS',y:26,pts:[[-28,158],[54,158],[54,181],[-28,181]],edge:['s','w','w','w'],foot:null},
    // ---- H2, the north slope ----
    // the rim at the deck level between the Tiberiana's east cliff and the Transitoria's rock: the saddle's deck runs on to its wall over the belt
    {id:'sumN',y:51.4,pts:[[-55.9,-106],[1.9,-106],[2.3,-111.3],[-55.9,-111.3]],edge:['s','r','w','r'],foot:[null,null,42,null]},
    // the north belt: under the rim and the Transitoria's rock a lane (lz -124..-130) behind the houses; from the west c1, dom_b, the east palace's gate
    // platform on its axis (lx 73.3; 图四, the review of 2026-11-13: the house that stood in front of the gate moved to c1's place, c1 into the west
    // garden, nothing pulled down), the belt garden, c2, dom_a; their fronts at -155.5; the stair lane G3 (134-138.5) opens from the lane ('o'); the
    // north-east bastion (lx 177-205, to -145) with the slot of the north-east stair (187.8-194.2); in the west a garden from the rim down to its wall
    // (-124 at the Tiberiana, -155.5 at c1). The gate platform's front wall (42 over the gate garden's 39) has a semicircular exedra on the axis (gArc,
    // radius 4) with the wall fountain (palGateN), and the two upper flights gUW, gUE run down along it from the platform's corners to the exedra.
    {id:'beltN',y:42,...rows([[-55.9,-111.3,'s'],[2.3,-111.3,'r'],[3.9,-119.7,'r'],[6.7,-124,'r'],[16.6,-124.1,'r'],[146.5,-125.4,'r'],[149.7,-125.4,'r'],[151,-120,'s'],[174,-120,'s'],
       [205,-120,'w',26],[205,-145,'w',26],[194.2,-145,'w'],[194.2,-121,'o'],[187.8,-121,'w'],[187.8,-145,'w',26],[177,-145,'w',26],[177,-155.5,'w',36],[170.5,-155.5,'m'],[140.5,-155.5,'w',36],
       [138.5,-155.5,'w'],[138.5,-130,'o'],[134,-130,'m'],[134,-155.5,'w',36],[102.45,-155.5,'w',36],[101,-155.5,'w',34],[85.35,-155.5,'w',39],[77.3,-155.5,'w',39],...gArc.map(p=>[...p,'w',39]),
       [69.3,-155.5,'w',39],[61.25,-155.5,'w',36],[59.3,-155.5,'m'],[29.3,-155.5,'w',36],[27.35,-155.5,'w',36],[-4.2,-155.5,'w',36],[-5.65,-155.5,'w',26],[-55.9,-124,'r']]),
       // the west garden's plane rows and beds are laid from its wall line as it was before 图四 (round 3) moved c1 in and widened the garden down the
       // slope (round 4: c1 takes only its own ground; the trees beside and behind it stay where they were); the strip the widening added gets a row
       // along the new wall where it clears them (palPlatPlant)
       guide:[[29.5,-155.5],[-10,-138],[-55.9,-124]]},
    // the garden terraces (R10 乙, round 4): one 36 terrace under c1 (a flat block now: its garden edge on the belt's wall) and house b (its T1 and W1 stairs),
    // and in front of it a 3 m strip at 30, planted (a hedge bed and cypresses; no walking: the foot terrace is only 7 m deep under house b, the reviewer's
    // choice); its foot wall stays where it was. v36n is reached from house b's W1 stairs
    {id:'v36n',y:36,...rows([[-5.65,-155.5,'s'],[27.35,-155.5,'s'],[61.25,-155.5,'s'],[61.25,-170.3,'w',34],[61.25,-173.6,'w',30],[27.35,-173.6,'w',30],[27.35,-161.5,'w',30],[-5.65,-161.5,'w',26]])},
    // the corner-pier pilot (round 4, 2026-11-15): v30n's outer corner cut on a line 2.6 m out from v36n's NW pier's centre, inside its face, so the strip ends
    // on the pier where the 30.6 pier stood (edge kind 'm': it ends on a structure, no wall, no pier, the ground not blended to it; PAL_PIER_PILOT)
    {id:'v30n',y:30,walk:false,tl:false,plant:'strip',...rows([[-5.65,-161.5,'s'],[27.35,-161.5,'s'],[27.35,-173.6,'s'],[61.25,-173.6,'w',26],[61.25,-176.6,'w',26],[26.65,-176.6,'m'],[24.35,-174.3,'w',26],[24.35,-164.5,'w',26],[-5.65,-164.5,'w',26]])},
    // 图四: the gate garden (39) under the gate platform: the exedra in the platform's front wall, the slot of the central flight (palGateN, 39 down to 34,
    // towards the exedra) from its head ('o', -157.3) to its front wall; the terrace 34 below it, on to the east under the belt garden; from 34 the two
    // lower flights gLW, gLE run out along the garden walls down to the foot (26)
    {id:'g39',y:39,...rows([[61.25,-155.5,'s'],[69.3,-155.5,'s'],...gArc.slice().reverse().map(p=>[...p,'s']),[77.3,-155.5,'s'],[85.35,-155.5,'w',34],[85.35,-170.3,'w',34],[76.3,-170.3,'w',34],
       [76.3,-157.3,'o'],[70.3,-157.3,'w',34],[70.3,-170.3,'w',34],[61.25,-170.3,'w',36]])},
    {id:'g34',y:34,...rows([[61.25,-170.3,'s'],[70.3,-170.3,'s'],[76.3,-170.3,'s'],[85.35,-170.3,'s'],[85.35,-155.5,'s'],[101,-155.5,'s'],[101,-170,'w',30],[101,-173.6,'w',26],[61.25,-173.6,'s']])},
    // under c3 (flat) and house a: 36 terraces, then 30 strips (4.5 m under c3; 4 m under house a, where the foot wall comes in to -180 at its east end)
    {id:'v36p',y:36,pts:[[101,-155.5],[134,-155.5],[134,-168.5],[134,-170],[101,-170]],edge:['s','w','w','w','w'],foot:[null,null,26,30,34]},
    {id:'v30p',y:30,...rows([[101,-170,'s'],[134,-170,'w',26],[134,-174.5,'w',26],[101,-174.5,'w',26],[101,-173.6,'s']])},
    {id:'v36q',y:36,pts:[[138.5,-155.5],[177,-155.5],[177,-173.6],[138.5,-173.6],[138.5,-168.5]],edge:['s','w','w','w','w'],foot:[null,26,30,26,null]},
    {id:'v30q',y:30,...rows([[138.5,-173.6,'s'],[177,-173.6,'w',26],[177,-177.6,'w',26],[138.5,-177.6,'w',26]])},
    // the north foot: from the east foot round to the Tiberiana's north-east corner; its outer wall along the 20-21 m contour (图四: out to the 15 m one under
    // c1 and dom_b, lx -35..62, where the belt and the gardens came down the slope), shop arches in it (shops)
    // (the corner-pier pilot, round 4: round v30n's cut corner, 24.35/-174.3 to 26.65/-176.6, as v30n has it, so its floor reaches the pier's face; it left a pit before)
    {id:'footN',y:26,...rows([[205,-120,'s'],[233.3,-120,'w'],[220,-146,'w'],[205,-163,'w'],[194.2,-171.5,'w'],[194.2,-161,'o'],[187.8,-161,'w'],[187.8,-176.6,'w'],[160,-185,'w'],[130,-186,'w'],
       [100,-184,'w'],[62,-181,'w'],[26,-180.5,'w'],[-8,-167,'w'],[-35,-150,'w'],[-57.5,-138,'r'],[-56.9,-137.7,'r'],[-56,-133.7,'r'],[-55.9,-124,'s'],[-5.65,-155.5,'s'],[-5.65,-164.5,'s'],
       [24.35,-164.5,'s'],[24.35,-174.3,'s'],[26.65,-176.6,'s'],[61.25,-176.6,'s'],[61.25,-173.6,'s'],[101,-173.6,'s'],[101,-174.5,'s'],[134,-174.5,'s'],[134,-168.5,'st'],[138.5,-168.5,'s'],[138.5,-177.6,'s'],[177,-177.6,'s'],[177,-155.5,'s'],[177,-145,'s'],
       [187.8,-145,'st'],[194.2,-145,'s'],[205,-145,'s']])}];
  // ---- round 4, H5.1: the hollow south of the east palace (22_h51v3; the author 2026-11-15 "可以，按第三版建", relayed by the reviewer) ----
  // A system terrace at 51.76 (h51) from terrace B's south edge (lz -5.1; B's paving 51.82, flush) to the summit rim, which takes a solid piece north-west
  // (lx 100-149.6, lz 0.5-30; sumE's outline below) so the Jupiter Victor temple stands on 55. Along B's south edge a 5.6 m lane (lz -5.1..0.5; the rim's
  // wall on its south, flush with the temple podium's back) ends at an end wall (lx 139.8-141, a niche in it) in front of the flat block c@156's west wall.
  // Two levels of way: 51.76 along the lane and north along c@156's west wall to sumTB, level; 55 by the stair on the lane's south wall (h51L) up to the
  // rim. d@34 and d@75 turned round and 1.5 m south, the low variant (floors 51.76 and 55.06); a planting bed at c@156's north foot (sumTB + 0.5).
  // Drawn first from these tables (R12 13: tools/plan/palatine_paths.py); built when on (after the review; anything to be removed: close-ups first, R9).
  // stairs: as the plan's (palPlatStairs); remap: legs of existing stairs whose edge index moves with sumE's new outline
  // Where the drawings (round 4, 25_h51_build) showed v3 could not be built as drawn, these tables differ from it, each marked 【改】 (for the review):
  //  【改1】 the south edge at lz 22.5, not 24: the d_low GLB turned round stands with its back wall at 22.5 (its walls, probed: back z -13, sides +-17 /
  //         +-15 in its own axes), so at 24 a 1.5 m slot would be left behind both blocks; the edges between and beside them follow (the notch's west side
  //         at d@75's side wall, lx 92)
  //  【改2】 the stairs at lx 13 and 54.5 up to the paved strip in front of the Apollo: the Apollo's platform foot is at lz 25-27 (ground 54.0-54.9
  //         between), so they run north, down into the hollow along d@34's side walls (flights between walls, palFlight), from a pad at a fixed level
  //         (R12 15.4) on the strip; 13 steps, not 15
  //  【改3】 no 6 m corner pier at the rim's three new corners (lx 92 and 100 on lz 30, lx 100 on lz 0.5; palPierPlan would put them there): at lz 0.5 it
  //         would stand 4.3 m out into the 5.6 m lane, at lz 30 the two would overlap each other and the notch's wall; the coping and parapet turn
  //  【改4】 the planting bed ends at the existing corner pier at the rim's corner lx 151, lz -30.5 (its face lx 147.94), not at lx 151
  //  【改5】 the wall stairs with the generator's sizes (R12 15.2): 16 risers of 0.2025 on 0.38 treads (8 + 8, 28.1 deg), not v3's 18 of 0.18 on 0.30
  //  【改6】 the end wall and the bed meet c@156 at its plinth as the GLB has it (0.1 m band raster, palatine_paths.mjs): its west face lx 140.91, so the
  //         end wall is 1.11 m thick, not 1.2; its north face lz -29.09, its corner pilaster to lx 141.5, where the bed starts
  //  Open (not built until decided): the d_low is 28.17 m deep (back z -13, porch steps to z 15.17); between B's colonnade step (lz -5.506) and the
  //  Apollo's buttresses (lz 24.80, their caps 24.66) that leaves no place for it with 0 or >= 2.4 m at both ends (R12 4); alt.a below is the proposal
  const h51={on:false,
    plats:[{id:'h51',y:51.76,...rows([[10,-5.1,'s'],[139.8,-5.1,'s'],[139.8,.5,'s'],[100,.5,'s'],[100,30,'s'],[92,30,'w'],[92,22.5,'m'],[58,22.5,'w'],[53.96,22.5,'st'],[51,22.5,'m'],
      [17,22.5,'st'],[14.04,22.5,'w'],[10,22.5,'o']])}],
    sumE:rows([[151,-120,'w',42],[174,-120,'w',42],[174,34,'w',42],[164,52,'w',42],[90.5,57,'r'],[86.3,30,'s'],[92,30,'w',51.76],[100,30,'w',51.76],[100,.5,'w',51.76],[139.8,.5,'s'],
      [141,.5,'m'],[141,1,'m'],[149.6,1,'m'],[151,-2,'r'],[151,-30.5,'w',51.76]]),
    stairs:[{id:'h51E',cls:'C',w:2.4,from:'sumE',to:'h51',top:55,floor:51.76,legs:[['sumE',7,8,18,1.3]]},     // down the lx 100 wall from the rim, north
            {id:'h51L',cls:'C',w:1.8,from:'sumE',to:'h51',top:55,floor:51.76,legs:[['sumE',8,39.8,29,1]]}],   // down the lane's south wall from its east end, west
    // 【改2】 straight flights from the strip's pads (pads) north down into the hollow; the side towards the block has no cheek of its own (its wall is there)
    flights:[{id:'h51Gw',cls:'C',w:2.6,from:'apS1',to:'h51',top:54.3,floor:51.76,axis:[[15.7,22.5],[15.7,16]],head:0,cheeks:[-1]},
             {id:'h51Gm',cls:'C',w:2.6,from:'apS2',to:'h51',top:54.3,floor:51.76,axis:[[52.3,22.5],[52.3,16]],head:0,cheeks:[1]}],
    // solid paved blocks (R12 15.5; the ground there 53.7-54.4), faces from draw.probes: apS1 to the Apollo buttress at lx 15-17 (its face lz 24.797:
    // touching); apS2 fills the slot between the buttresses at lx 46.25-48.65 and 56.65-59.05, to their sides and the platform's plinth (lz 27.075), and
    // apS2e (the same paving) the strip from there to d@75's corner (lx 58), so nothing is left between them narrower than 2.4 m
    pads:[{id:'apS1',y:54.3,box:[14.04,17,22.5,24.797]},{id:'apS2',y:54.3,box:[48.65,56.65,22.5,27.075]},{id:'apS2e',y:54.3,box:[56.65,58,22.5,24.797]}],
    piers:{drop:[['sumE',6],['sumE',7],['sumE',8]]},   // 【改3】
    remap:{tbE:[['sumE',14,81.5,66,1.4]]},
    blocks:{was:[['d',34,8,0,61.4],['d',75,8,0,61.4]],now:[['d',34,9.5,180,55.06,1],['d',75,9.5,180,55.06,1]]},
    jv:{y:55},   // the temple's podium on the rim's floor (palStrips: was the highest ground under it + 0.3, 54.43)
    end:{x0:139.8,x1:140.91,z0:-5.1,z1:.5,top:55,niche:{z:-3.2,w:2,d:1,sill:.6,h:1.6}},   // 【改6】
    bed:{x0:141.5,x1:147.9,z0:-30.5,z1:-29.09,h:.5,on:'sumTB'},   // 【改4】【改6】
    basin:{x:10,z0:-5.1,z1:22.5,top:51.76,floor:51.4},   // the saddle's east wall there becomes two steps down to its deck
    // the 51.76 way north (the reviewer, 11-15): on the clear walk between the Transitoria's pilasters (138.57 at their foot) and c@156's west face
    // (140.91), not through the pilasters; section E on it
    // G: the 51.76 line the drawings had along the lane (lz -2.3) across both blocks; H: along B's colonnade step, where alt b puts the lane
    draw:{box:[-25,180,-45,60],sections:[['A',[113,-42],[113,55]],['B',[-20,10],[175,10]],['C',[90,-2.3],[168,-2.3]],['D',[146,-42],[146,35]],['E',[139.7,35],[139.7,-45]],['F',[52.3,-10],[52.3,32]],
      ['G',[10,-2.3],[95,-2.3]],['H',[8,-3.7],[100,-3.7]]],
      routes:[{lv:51.76,pts:[[4,9],[12,-2.3],[137.3,-2.3],[137.3,-6],[139.7,-8.4],[139.7,-42]]},{lv:55,pts:[[131,-.5],[139,-.5],[139,2.5],[146,3.5],[152,9]]},{lv:55,pts:[[98.7,12],[98.7,23],[103,24.5]]},
              // 54.3: up h51Gw / h51Gm to the strip behind the blocks; west onto the slope, east down the existing ground (53.8 at lx 72, 51.8 at lx 84-92)
              {lv:54.3,pts:[[15.7,15],[15.7,23.65],[86,23.65]]},{lv:54.3,pts:[[52.3,15],[52.3,23.65]]},{lv:54.3,pts:[[15.7,23.65],[6,23.65]]}],
      // exact faces of hero models next to the new work (rays every step m along the line, in the model only): x/z the line, dir the side the rays go to,
      // y the heights (the first: the foot, which the overlap and gap checks use; the others: clear width above it)
      probes:[{id:'B 南柱廊台基',m:'rome_transitoria',along:'x',s:[10,100],step:.1,at:0,dir:-1,y:[51.95],far:8},
              {id:'阿波罗扶垛',m:'rome_apollo',along:'x',s:[0,100],step:.1,at:18,dir:1,y:[54.8,56.3],far:12},
              {id:'阿波罗东头',m:'rome_apollo',along:'z',s:[24,32],step:.1,at:95,dir:-1,y:[52.2],far:12},
              // the reviewer, 11-15: the 51.76 way north (lx 139.7) is measured at the Transitoria's foot (its 56 m cornice over the way is no obstacle)
              {id:'Transitoria 东面',m:'rome_transitoria',along:'z',s:[-44,-4],step:.1,at:141.5,dir:-1,y:[52.3],far:9.5}],   // over its own 52.04 slab (to lx 140.89), which is floor
      // R12 12's register (the reviewer, 11-15): where a way narrows under 2.4 m inside box and every such run is shorter than len m and at least min m wide,
      // it passes as this exception (the route check samples every 0.1 m there)
      exc:[{id:'137.3 壁柱',box:[135,142,-44,-4],min:2.3,len:1,rule:'R12 第 12 节例外：Transitoria 壁柱处局部收窄，长 < 1 m，净宽 ≥ 2.3',
            // the reviewer 11-16: the rays (29_h51_r9, cpil) where the raster reads c@156's corner into the run: at the feet (52.3, 53) nothing east within 5 m;
            // at 54 c@156's wall (its foot 53.8) from 138.54 to 141.0, so 2.458 clear
            rays:[{box:[137,142,-28.8,-28.0],w:2.458,src:'射线（29 cpil）：脚下 52.3 / 53 东边 5 m 内空；54 处 c@156 墙身（底 53.8）138.54 → 141.0'}]}]},
    // proposals drawn beside the tables (palatine_paths.py ALT=<key>): a: the d_low's porch brought in to z <= 14.76 (a GLB change for the villa session)
    // and both blocks 1.25 m south (lz 9.25), not 1.5: the porch's foot meets B's colonnade step (-5.51), the back wall at 22.25 leaves 2.41 m under the
    // buttresses' caps (2.55 at their foot); everything on the old line lz 22.5 moves with it
    // b (round 4, 27_h51_route): what a leaves on the line lz -2.3 is the blocks themselves (their archive and the ramp's wing wall stand on it), and
    // in front of them only the street-foot ledge (1.26 m, three foot rocks on it) up to B's colonnade step: no way through at 51.76. So both blocks
    // 2.406 m further south (lz 11.656): their back walls on the Apollo buttress caps' line (24.656; 0.14 m to the buttresses below the caps, R12 7:
    // touching); the GLB as the villa session changed it (11-15: the three foot rocks gone, the 2 m and 1 m slots walled flush with the wing walls; 11-16: the pit at the ramp's foot
    // filled to the foot's paving, and both blocks set 0.06 higher, so the ramp's foot is h51's paving, 51.82: h51 no longer runs over a foot ledge); the lane between B's step (-5.506) and the
    // archive's arcade (-1.844) or the wing walls' ends (-2.344) at least 3.16 m, level. The 54.3 strip behind the blocks is gone with them (h51Gw,
    // h51Gm and their pads not needed); the slots between the buttresses behind the blocks are solid paved fills (R12 15.5); the pocket east of d@75
    // between its back, the Apollo's east end and the rim's lz 30 edge joins h51 (so the notch's west wall at lx 92 goes, and with it decision 3's opening)
    alt:{a:{blocks:[['d',34,9.25,180,55.06,1],['d',75,9.25,180,55.06,1]],clip:{rome_pal_block_d_low:{z1:14.76}},shiftZ:[22.5,22.25],
            // the ways round if a is kept (drawn dashed on a's plan; neither is in the tables): i on B's stylobate between its step and the column bases,
            // ii up to the 54.3 strip by h51Gw, along under the caps, down a new 13-step flight behind d@75 and in through an opening in the notch's west wall
            extra:[{pts:[[10,-6.65],[137,-6.65]],c:'r',dy:-.6,label:'替代 i：上柱廊台基 52.04 走：柱础间净 2.29，喷泉处 0–1.7，走不通'},
                   {pts:[[15.7,23.45],[86,23.45],[89,27],[92,27],[92,8],[96,0],[100,-2.3]],c:'p',dy:3.2,label:'替代 ii：54.3 绕行：h51Gw 上 13 级 → 帽下条子 2.41 → d@75 后新做 13 级下 → lx 92 开口；±2.54 m、26 级'}],
            note:'d_low 门廊收到局部 z ≤ 14.76（别墅会话改 GLB），两座 d 南移 1.25 m（lz 9.25）'},
         b:{blocks:[['d',34,11.656,180,55.12,1],['d',75,11.656,180,55.12,1]],   // 11-16 (the reviewer, R11): both raised 0.06 (low floor 51.82 = h51's paving), the villa session's GLB with the pit before the ramp's foot filled
            plats:[{id:'h51',y:51.76,...rows([[10,-5.1,'s'],[139.8,-5.1,'s'],[139.8,.5,'s'],[100,.5,'s'],[100,30,'s'],[86.3,30,'s'],[86.49,31.25,'m'],[83.55,31.25,'m'],
              [83.55,28.25,'m'],[85.41,28.25,'m'],[85.41,25.59,'w'],[85.41,24.656,'m'],[58,24.656,'w'],[51,24.656,'m'],[17,24.656,'w'],[10,24.656,'w'],[10,22.5,'o']])}],
            sumE:rows([[151,-120,'w',42],[174,-120,'w',42],[174,34,'w',42],[164,52,'w',42],[90.5,57,'r'],[86.49,31.25,'w',51.76],[86.3,30,'w',51.76],[100,30,'w',51.76],
              [100,.5,'w',51.76],[139.8,.5,'s'],[141,.5,'m'],[141,1,'m'],[149.6,1,'m'],[151,-2,'r'],[151,-30.5,'w',51.76]]),
            flights:[],
            piers:{drop:[['sumE',6],['sumE',7],['sumE',8]],abut:[['sumE',5]]},   // the three new corners: 0.56 m end piers; @5 runs into the Apollo's east face
            // solid paved fills (R12 15.5) from the blocks' backs / h51's south edge to the Apollo's plinth (draw.probes), between its buttresses
            pads:[{id:'apF1',y:54.3,box:[10,15,24.656,27.075],fill:1},{id:'apF2',y:54.3,box:[17.3,25.4,24.656,27.075],fill:1},{id:'apF3',y:54.3,box:[27.7,35.8,24.656,27.075],fill:1},
                  {id:'apF4',y:54.3,box:[38.2,46.3,24.656,27.075],fill:1},{id:'apF5',y:54.3,box:[48.6,56.7,24.656,27.075],fill:1},{id:'apF6',y:54.3,box:[59,67.2,24.656,27.075],fill:1},
                  {id:'apF7',y:54.3,box:[69.5,77.6,24.656,27.075],fill:1},{id:'apF8',y:54.3,box:[79.9,82.6,24.656,27.0],fill:1},{id:'apF9',y:54.3,box:[82.6,85.41,24.656,25.594],fill:1}],
            routes:[{lv:51.76,pts:[[4,9],[12,-3.7],[96,-3.7],[100,-2.3],[137.3,-2.3],[137.3,-6],[139.7,-8.4],[139.7,-42]]},{lv:55,pts:[[131,-.5],[139,-.5],[139,2.5],[146,3.5],[152,9]]},
                    {lv:55,pts:[[98.7,12],[98.7,23],[103,24.5]]},{lv:51.76,pts:[[54.5,-3.7],[54.5,22]]},{lv:51.76,pts:[[96,0],[96,27],[87,27]]}],
            // the court between the blocks stays a court (the reviewer, 11-15): its south end, the wall against apF5, gets a niche on its axis as the
            // lane's end wall has (h51.end.niche), so it reads as the court's end and not as a way cut off; no new asset
            niches:[{id:'中院尽端壁龛',x:54.5,z:24.656,dir:1,w:2,d:1,sill:.6,h:1.6,on:51.76}],
            // the reviewer 11-16: where the lx 139.7 way goes onto the Transitoria's own 52.04 platform (B's step, lz -5.506) it takes one riser of 0.22
            // (h51's paving 51.82); the platform's east edge at lx 140.89 is the same 0.22 down. Both are the model's own edges: left as they are, marked
            marks:[{at:[137.3,-5.506],label:'一级 0.22：51.82 → Transitoria 平台 52.04（台 B 台阶沿，模型自带，原样）',dy:1.0},
                   {line:[[140.89,-5.5],[140.89,-42]],label:'平台东沿 0.22（模型自带）',dy:-1.2}],
            note:'两座 d 南移到 lz 11.656（背墙贴阿波罗帽线），别墅会话的新 d_low（去三块脚石、两槽封平）；巷沿柱廊台基，净宽 ≥ 3.16、平；54.3 并掉；中院留作院子，尽端壁龛'}}};
  // b2 (round 4, 32_h51_west_end; the author 11-16: the saddle's big stair, east wall and rim promenade stay as they are, not pulled down, not repaired):
  // b with h51's west edge on the promenade's east edge (lx 17) and no steps down to the saddle (basin gone). Under that edge, from B's step (lz -5.506) to
  // d@34's tuff block (7.240), a wall up to the promenade (W17: 0.4 thick, top 56.45 like the saddle wall's coping, the promenade's slab on it; over the
  // tuff block it goes on from the block's top 55.47 to 10.384, where d@34's own west wall starts). The 2 m pocket between W17 and d@34's wing wall
  // (lx 19.0, its north end -2.360, its top 55.12) is filled solid to the wing's top. South of 10.384 d@34's west wall is on lx 17.00 (its pilasters 0.2,
  // plinth 0.09 and band 0.07 proud of it). h51 no longer reaches lx 10-17: apF1 (under the promenade) and the overlap with the H2 support block go.
  // Both blocks 0.016 further north (lz 11.640, the reviewer 11-16): the back wall's brick face (z -13.01) was 0.016 over the buttress caps' north face
  // (24.650, not 24.656); now flush with it, the pilasters 0.010 clear. The lane's narrowest 3.16 -> 3.146.
  h51.alt.b2=Object.assign({},h51.alt.b,{basin:null,blocks:[['d',34,11.640,180,55.12,1],['d',75,11.640,180,55.12,1]],
    plats:[{id:'h51',y:51.76,...rows([[17,-5.1,'s'],[139.8,-5.1,'s'],[139.8,.5,'s'],[100,.5,'s'],[100,30,'s'],[86.3,30,'s'],[86.49,31.25,'m'],[83.55,31.25,'m'],
      [83.55,28.25,'m'],[85.41,28.25,'m'],[85.41,25.59,'w'],[85.41,24.656,'m'],[58,24.656,'w'],[51,24.656,'m'],[17,24.656,'m']])}],
    pads:[{id:'W17',y:56.45,box:[16.6,17,-5.506,7.240],fill:1},{id:'袋填',y:55.12,box:[17,19,-2.360,7.240],fill:1},...h51.alt.b.pads.filter(p=>p.id!=='apF1')],
    routes:[{lv:51.76,pts:[[18,-3.7],[96,-3.7],[100,-2.3],[137.3,-2.3],[137.3,-6],[139.7,-8.4],[139.7,-42]]},...h51.alt.b.routes.slice(1)],
    // the five trees under the promenade's slab (3.1-3.7 m below it, their crowns through it): two broadleaf, a shrub, two flower beds.
    // The author approved taking them away on 11-16 (R9, after 32's 04 close-up; only these five, not the beds at the east wall's foot or under the
    // slab's north end). They go when the h51 platform is built, not before: the scene keeps them until then, and the build has to take them out by these points.
    treesOut:{ok:'作者 11-16 批准去掉（R9 已过，32 号 04 近景红叉 5 处）；建 h51 平台时一起从场景去掉，之前场景不动',
      why:'散步道板下，离板 3.1–3.7 m，树冠穿出散步道',
      at:[[11.87,-1.12],[12.49,5.54],[12.84,2.31],[11.69,9.05],[13.99,7.04]]},
    note:'b 的西端改法：鞍部三样原样；h51 西边线退到散步道东沿 lx 17，不做下鞍部的两级；散步道东沿下补墙 W17（顶 56.45）；d@34 西翼外 2 m 袋形空当实心填到翼墙顶 55.12；apF1 去掉；两座 d 北移 0.016 到 lz 11.640（背墙砖面贴扶垛帽北面 24.650）'});
  // the trees of the planting on the plateau strips (palBasins) that b2 moves (32's checker, ALT=b2: go: on new work; reseat: on ground whose level only
  // changes, set again at the new floor, y the floor's level): taken from its lists by their place, so the planting's dice stay as they are
  h51.alt.b2.trees={go:[[106.5,-4.25],[127.78,-4.88],[82.99,23.5],[59.5,23.5],[75.99,23.5],[95.96,2.12],[99.44,-4.73],[99.08,9.57],[96.56,5.92],[110.54,-4.84],[137.4,-1.46],[91.16,23.5],[116.34,-4.17],[127.64,-1.8],[131.79,-1.1],[68.09,23.5],[96,-4.66],[95.93,-1.19],[126.77,1.87]],
    reseat:[[127.69,19.93,55],[131.81,26.53,55],[134.04,19.43,55],[127.92,9.86,55],[128.89,16.41,55],[131.64,11.8,55],[128.3,6.11,55],[127.72,27.12,55],[131.37,5.22,55],[134.97,2.69,55],[130.98,10.23,55],[124.98,10.54,55],[131.59,9.22,55],[131.3,12.4,55],[130.76,22.28,55],[134.35,23.66,55],[102.19,4.68,55],[124.82,9.04,55],[127.33,13.2,55],[130.28,16.78,55]]};
  // round 4, 11-16: H5.1 built as b2 (the author, in the build session: "好 你开始吧", after 32_h51_west_end; the five trees under the promenade, the
  // author's word relayed by the reviewer 11-16): b2's whole tables take the part's place
  h51.on=true;h51.use='b2';for(const k of['plats','sumE','pads','flights','piers','niches','basin','routes','trees','treesOut','note'])if(k in h51.alt.b2)h51[k]=h51.alt.b2[k];
  h51.blocks={was:h51.blocks.was,now:h51.alt.b2.blocks};   // (was: where they stood; now: palatine.js PAL_BL)
  if(h51.on){const i=plats.findIndex(P=>P.id==='sumE');Object.assign(plats[i],h51.sumE);plats.push(...h51.plats);}
  for(const P of plats){if(!P.foot)P.foot=P.edge.map(()=>null);if(P.edge.length!==P.pts.length||P.foot.length!==P.pts.length)throw new Error('PAL_PLAN '+P.id+': '+P.pts.length+' points, '+P.edge.length+' edges');}
  // dips: the ground dipped to the floor this far (m) outside a walled edge, where 1 m is too narrow for the 3 m terrain mesh (it climbed through the paving):
  // the lane south of the Tiberiana against block b, whose walls go down to 51.4 (图三)
  // h51 (b2): the court's end wall and the short one at d@75's corner (the fills behind them, 54.3), and W17 (the gap under the promenade, 52.4-53): the
  // 3 m mesh rose through the paving along them (round 4, the build's close-ups); held after the smoothing too (palPlatPost). 2 m, not more: behind the
  // court's end the Apollo's plinth stands from 27.075. 6-8: the pocket east of d@75 against the Apollo's east end (1 m)
  const PLAN={levels:{summitE:55,belt:42,villa:[36,30],foot:26},dips:Object.assign({sumL:{4:4}},h51.on?{h51:{6:1,7:1,8:1,10:2,12:2,14:2}}:{}),plats,hemi:{arc,slot:[[c[0]+2,c[1]-stair],[c[0]+sx,c[1]+stair]]},
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
      {id:'seC',cls:'C',w:2.6,from:'beltE',to:'footE',top:42,floor:26,legs:[['beltE',27,2,42.4,1.6],['beltE',28,.5,10,1.6]]},
      // R10 乙: from each house's 36 down along its front onto the 30 strip, and from the strip along its front down to the foot
      {id:'v36aV',cls:'C',w:2.4,from:'v36a',to:'v30a',top:36,floor:30,legs:[['v36a',1,31,16,1.5]]},
      {id:'v30aV',cls:'C',w:2.4,from:'v30a',to:'footE',top:30,floor:26,legs:[['v30a',1,14,3,1.5]]},
      {id:'v36bV',cls:'C',w:2.4,from:'v36b',to:'v30b',top:36,floor:30,legs:[['v36b',1,3,18,1.5]]},
      {id:'v30bV',cls:'C',w:2.4,from:'v30b',to:'footE',top:30,floor:26,legs:[['v30b',1,20,31,1.5]]},
      {id:'clivG',cls:'C',w:2.6,from:'beltS',to:'clivus',top:42,floor:null},   // a switchback down to the Clivus' head, built by palClivG (palatine-h1.js); was one leg north along the wall that met the rising ground at lz 142.5, 4.7 m short of the road's head and 3.4 m above it
      {id:'footSlot',cls:'C',w:2.6,from:'footS',to:'clivus',top:26,floor:null,legs:[['footS',1,18,1.5,1.6]]},
      // ---- H2, the north slope ----
      // the north-east stair (B): from the belt's north-east bastion down its slot (axis lx 191) to the foot, across it, and down the cut through the foot
      // terrace (cut: the foot wall steps back to lz -161, where the ground is at the foot's level, so the lower flight keeps to the ground down to the street
      // at lz -188 instead of leaving a 7 m wall and passing over the street); with neP (from the summit's north-east corner down to the belt) it goes from the Via Sacra past the houses to the east palace
      {id:'neB',cls:'B',w:5,from:'beltN',to:'street',via:'footN',axis:[[191,-121.6],[191,-196]],slot:[[187.8,-145],[194.2,-121]],cut:[[187.8,-180],[194.2,-161]]},
      {id:'neP',cls:'B',w:3.2,from:'summit',to:'beltN',top:55,floor:42,legs:[['sumE',0,1.6,25,2],['sumE',1,-2,10,2]]},
      // the stair lanes between the houses (a straight flight from the lane at the back down to the foot, between the courtyard block's drop wall and the
      // villa's belt wall): lane = the ground they take [[x0,z0],[x1,z1]]
      {id:'g3C',cls:'C',w:2.6,from:'beltN',to:'footN',axis:[[136.25,-130.6],[136.25,-180]],lane:[[134,-168.5],[138.5,-130]]},
      {id:'sumNC',cls:'C',w:2.6,from:'sumN',to:'beltN',top:51.4,floor:42,legs:[['sumN',2,20,48,1.6]]},
      {id:'beltWC',cls:'C',w:2.6,from:'beltN',to:'footN',top:42,floor:26,legs:[['beltN',44,2,52,1.6]]},   // down the west garden's wall, west from c1's corner
      // R10 乙: v36n's strip is planted (no stair down from it); v36n is reached from house b (its W1 flights). No way from the gate garden: between g39's
      // west wall and house b's T1 there are 1.95 m, and the T1's corner piers (1.4 m out) close it. Under c3 and house a: 36 down onto the strip, the strip
      // down to the foot
      {id:'v36pV',cls:'C',w:2.4,from:'v36p',to:'v30p',top:36,floor:30,legs:[['v36p',3,2,17,1.5]]},
      {id:'v30pV',cls:'C',w:2.4,from:'v30p',to:'footN',top:30,floor:26,legs:[['v30p',2,14,26,1.5]]},
      {id:'v36qV',cls:'C',w:2.4,from:'v36q',to:'v30q',top:36,floor:30,legs:[['v36q',2,4,19,1.5]]},
      {id:'v30qV',cls:'C',w:2.4,from:'v30q',to:'footN',top:30,floor:26,legs:[['v30q',2,20,32,1.5]]},
      // 图四: the gate stairs. Upper: from the gate platform's corners down along its front wall to the exedra (42 to 39); lower: from the terrace 34
      // out along the garden walls to the foot (34 to 26). The grand stair up to the palace and the central flight are palGateN's (palatine-h1.js).
      {id:'tbE',cls:'C',w:2.6,from:'sumE',to:'sumTB',top:55,floor:51.76,legs:[['sumE',8,81.5,66,1.4]]},   // 图五: from the summit rim down along its west wall into the slot's fill
      {id:'gUE',cls:'B',w:2.8,from:'beltN',to:'g39',top:42,floor:39,pave:.08,legs:[['beltN',25,0,8.05,1.4]]},
      {id:'gUW',cls:'B',w:2.8,from:'beltN',to:'g39',top:42,floor:39,pave:.08,legs:[['beltN',38,8.05,0,1.4]]},
      {id:'gLE',cls:'B',w:2.8,from:'g34',to:'footN',top:34,floor:26,legs:[['g34',7,21.7,0,1.5]]},
      {id:'gLW',cls:'B',w:2.8,from:'g34',to:'footN',top:34,floor:26,bridge:true,legs:[['g34',7,33.7,39.75,4.5],['v30n',4,0,22,1.5]]},   // R10 乙: 3 m further out, along the planted strip's wall (a landing from g34's wall out to its head)
      {id:'footWC',cls:'C',w:2.6,from:'footN',to:'street',top:26,floor:null,legs:[['footN',13,2,30,1.6]]},   // 图四: the foot wall here is 11 m now (out to the 15 m contour)
      {id:'footMC',cls:'C',w:2.6,from:'footN',to:'street',top:26,floor:null,legs:[['footN',10,3,19,1.6]]}],
    // H2, the west and south-west slopes (palWestSlope): the viewing terrace with its portico (level 30, towards the Tiber and the Capitoline) and the rings
    // above and below it (37, 23) as they were before H2, closed at both ends (the review of 2026-11-13: the author wants them kept); planting, not rock, on
    // the slope from the Tiberiana's south-west corner round to the Scalae Caci ('rock': the name of that area, kept: the open land and the checks use it),
    // and a grove on the shelf west of the Magna Mater and on the south-west slope (holm oak, laurel, stone pine: masterplan 2.5); the streets, the stairs,
    // the houses and the models are kept clear in the code
    // rings: the old rings (palTerraces) kept on these levels between these angles (deg from C=[20,-15]); 128: not the stub of 23 on the south slope (106-111)
    west:{rings:{lv:[37,30,23],a:[128,178]},
      // the stairs between them (palWestStairs): 37 down to 30 from the south end of 37 (its flight past that end onto 30's floor, so the portico on 30
      // starts at 37's end), 30 down to 23 from the south end of 30's north stretch (segments from 125) along its wall onto 23's floor. k: the segments of
      // that ring the stair belongs to, end/dir/head/off as palWestStairs reads them
      stairs:[{id:'w37',top:37,floor:30,k:[0,999],end:'A',dir:-1,head:[0,1.6],off:2,w:2.6},
              {id:'w30',top:30,floor:23,k:[125,999],end:'A',dir:1,head:[2,3.6],off:2,w:2.6,walk:5}],   // walk: a landing from the foot 5 m out onto 23's floor
      // R11 2 (the author's circles on the Magna Mater's stair, m2a/m2b, 2026-11-14): the hill stairs whose openings in these rings follow it (palTerraceWalls):
      // the opening no wider than the flight and its cheeks, its piers no higher than the parapet (no statue or tripod on them), and a wall the stair
      // passes at another level stays closed. The Scalae Caci (hill@-90,388: four statue and tripod piers where it goes through 30 and 23) waits for the
      // author's word (R9: they would go)
      r11:['temple:众神之母神庙（库柏勒）'],
      // option 甲 of the buried treads (the reviewer, 2026-11-14): the stairs whose footprint goes into the ground mask (the terrain not drawn over the
      // treads, the cheeks raised as retaining walls; hillStair, R.mask). A pilot on this one stair (68 of its 114 treads were under the 3 m grid's ground)
      mask:['temple:众神之母神庙（库柏勒）'],
      rock:[[-268,-40],[-217,-40],[-214,40],[-209,58],[-206,150],[-196,168],[-170,182],[-150,190],[-128,188],[-100,186],[-92,214],[-268,214]],
      grove:[[-209,58],[-194.5,58],[-194.5,150],[-160.5,150],[-152,176],[-96,176],[-90,216],[-245,216],[-245,165],[-212,150]],
      // the slope behind the viewing terrace's north stretch, from the end of 37 up to the Tiberiana's rock: a strip and clumps, not a carpet (palWestSlope)
      loose:[[-240,30],[-213,30],[-211,62],[-222,64],[-236,66],[-240,60]],
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
    // the villas: the cut models (R10 乙: house 42, its garden T1 38.6 with W1 down to the system's 36; palVillaW1 the two flights from W1's opening); their entrance is on the belt street behind them
    villas:[{n:'rome_domus_a_belt',lx:202.6,lz:-72,turn:90,y:42,plat:'beltE',gardens:'v36a'},{n:'rome_domus_b_belt',lx:202.6,lz:36,turn:90,y:42,plat:'beltE',gardens:'v36b'},
      {n:'rome_domus_b_belt',lx:44.3,lz:-153.1,turn:180,y:42,plat:'beltN',gardens:'v36n'},{n:'rome_domus_a_belt',lx:155.5,lz:-153.1,turn:180,y:42,plat:'beltN',gardens:'v36q'}],   // H2: the north houses 2 and 4
    fountains:[{n:'hemicycle',plat:'beltE',at:[174,-18],wall:'sumE'}],
    // the Clivus Palatinus down the ravine east of the south terraces: hillRoute from top to bot (zigzags within half of that axis), led in from head and on to the tail
    // (the old foot at the Circus); every point east of lx 57 until lz 205 (outside the foot walls)
    clivus:{head:[57,147],top:[78,149],bot:[78,212],half:19,tail:[[66,227],[54,240]]},
    // the H1 ground: east and south-east, and the south (the ravine between them is outside the foot wall); H2: the north. Used by the checks and to drop the old rings.
    zones:[[[151,-120],[233.3,-120],[258.2,-44.9],[227,66.6],[122.3,128.1],[106,112],[99.3,117.3],[86.3,30],[136,30],[151,-2]],
      [[-28,152],[-10.8,151],[-10.8,140.2],[54,140.2],[54,181],[-28,181]],
      // H2: the north slope, from the deck's edge and the Transitoria's rock to the north foot wall
      [[-55.9,-106],[1.9,-106],[2.3,-111.3],[3.9,-119.7],[6.7,-124],[146.5,-125.4],[151,-120],[233.3,-120],[220,-146],[205,-163],[186,-178],[160,-185],[130,-186],
       [100,-184],[62,-181],[26,-180.5],[-8,-167],[-35,-150],[-57.5,-138],[-56,-133.7]]],
    rayCut:[-42,208],h51};   // palTerraces: no rays (old rings) between these angles (deg from C=[20,-15]). H1 cut -26..106 (the east and south slopes); H2 cuts the
                         // rest: the north-east rings below the north foot wall go (outside the foot walls the slope is natural, R5), and on the west slope
                         // only the three rings in west.rings stay (the review of 2026-11-13).
  if(h51.on){PLAN.stairs.push(...h51.stairs);for(const S of PLAN.stairs)if(h51.remap[S.id])S.legs=h51.remap[S.id];}   // H5.1 built: its stairs, and the legs on sumE's renumbered edges
  return PLAN;
})();

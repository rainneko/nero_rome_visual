/* Small civic focal points in genuine gaps between the central infill houses.
   Called after fillCentralHousing and before buildStreets. */
function fillPocketSquares(W){
  const homes=W.housingGapHomes||[];if(!homes.length||!W.foot||!W.gy)return;
  const g=new GB(1<<15),water=W.poolG,placed=[],seed=RNG(241024),rot=-30*DEG,c=Math.cos(rot),s=Math.sin(rot);
  const world=(u,v)=>[u*c+v*s,-u*s+v*c],nearHome=(x,z)=>homes.some(h=>Math.hypot(h.x-x,h.z-z)<58);
  const candidates=[];
  // A jittered 50 m lattice keeps the interventions legible and prevents scatter.
  for(let u=-700;u<=1700;u+=50)for(let v=-950;v<=1000;v+=50){
    const q=world(u+(seed()-.5)*12,v+(seed()-.5)*12);candidates.push(q);
  }
  candidates.sort((a,b)=>hash2(a[0],a[1])-hash2(b[0],b[1]));
  for(const[x,z]of candidates){
    if(placed.length>=20)break;
    if(!housingCore(x,z)||!nearHome(x,z)||palFilled(x,z)||dCity(x,z)<.42)continue;
    if(placed.some(p=>Math.hypot(p.x-x,p.z-z)<50))continue;
    const angle=rot+(seed()-.5)*.22;
    // Try a generous square first, then reduce it until the real footprint fits.
    // Keep the same compact square dimensions on both axes.
    let size=0,hw=0,hd=0,lo=Infinity,hi=-Infinity;
    for(const trial of[22,18,14,10,8]){
      const h=trial/2;
      // One metre clear walking margin; roads, buildings, monuments and reserved
      // open parks are all represented by the strict Foot collision map.
      if(W.foot.hits(x,z,h+1,h+1,angle,0))continue;
      let mn=Infinity,mx=-Infinity;const S=frame(x,0,z,angle);
      for(let iz=-2;iz<=2;iz++)for(let ix=-2;ix<=2;ix++){
        const p=S.p(ix*h/2,0,iz*h/2),ground=W.gy(p[0],p[2]);mn=Math.min(mn,ground);mx=Math.max(mx,ground);
      }
      if(!Number.isFinite(mn)||mx-mn>.8)continue;
      size=trial;hw=hd=h;lo=mn;hi=mx;break;
    }
    if(!size)continue;
    // Ensure the set has both focal types whenever at least two squares fit.
    const kind=!placed.some(p=>p.type==='fountain')?'fountain':!placed.some(p=>p.type==='altar')?'altar':seed()<.84?'fountain':'altar';
    const y=hi+.04,F=frame(x,y,z,angle),stone=2,shade=6;
    // Pale, compact stone paving: a single batch, sized to remain a pocket square.
    g.set(stone,.43,0,0);box(g,F,0,-.04,0,hw,.16,hd,31);
    if(kind==='fountain'){
      const rad=Math.min(2.1,Math.min(hw,hd)*.22),fy=.04;
      g.set(shade,.46);lathe(g,F,0,fy,0,[[rad,0],[rad,.22],[rad-.22,.22],[rad-.22,.08]],20);
      g.set(stone,.48);lathe(g,F,0,fy+.22,0,[[.58,.0],[.48,.42],[.27,.48],[.18,.78],[.52,.82],[.64,.94],[.58,1.04],[0,1.04]],16);
      if(water){const disc=[];for(let i=0;i<20;i++){const a=i*Math.PI*2/20;disc.push(F.p(Math.cos(a)*(rad-.24),fy+.18,Math.sin(a)*(rad-.24)));}water.set(0,.5);water.poly(disc,[0,1,0]);}
    }else{
      // A modest household-cult scale altar, subordinate to the street fountains.
      const a=Math.min(1.25,hw*.22,hd*.22);g.set(shade,.4);box(g,F,0,.03,0,a,.52,a*.72,31);
      g.set(stone,.5);box(g,F,0,.55,0,a+.18,.13,a*.72+.18,31);
      g.set(shade,.48);lathe(g,F,0,.68,0,[[.3,0],[.23,.75],[0,.94]],8);
    }
    // Preserve the entire stone walking surface for street rasterization.
    W.foot.add(x,z,hw,hd,angle,'pocket-square');
    placed.push({x,z,y,size:[hw*2,hd*2],type:kind,slope:hi-lo});
  }
  const mesh=layTag(g.mesh(MAT.city),'squares');if(mesh){mesh.name='central_pocket_square_features';W.scene.add(mesh);}
  W.pocketSquares=placed;
}

# Temple of Jupiter Optimus Maximus (Capitoline) - shared geometry description.
# Blender coordinates: Z up, front of the temple toward -Y (becomes +Z in glTF).
import math
def build(B):
    MAR,STO,GOLD,DARK,BLUE,TILE,TILE2,BRZ='marble','stone','gold','dark','tympanum','tile','tile2','bronze'
    # podium with base moulding, die and crown
    B.box(0,0,-7,51.6,63.6,7,STO);B.box(0,0,0,51.6,63.6,.5,STO);B.box(0,0,.5,50,62,4.1,STO);B.box(0,0,4.6,51,63,.3,MAR);B.box(0,0,4.9,51.4,63.4,.12,MAR)
    for i in range(22):y0=-41.2+i*.46;B.box(0,(y0-31.8)/2,i*.232,17,-31.8-y0,.232,STO)
    for s in(1,-1):
        B.box(s*11.3,-36.5,-1,5.6,10.6,6.1,STO);B.box(s*11.3,-36.5,5.1,5.9,10.9,.32,MAR)
        B.box(s*11.3,-40.2,5.42,2.0,2.0,1.4,MAR);B.frustum(s*11.3,-40.2,6.82,.42,2.4,GOLD,10,.3);B.box(s*11.3,-40.2,9.2,.45,.45,.45,GOLD)
    # Corinthian columns: Attic base, fluted shaft, two rows of acanthus, corner volutes, abacus
    def column(x,y):
        B.box(x,y,5.02,2.5,2.5,.3,MAR);B.frustum(x,y,5.32,1.15,.28,MAR,20);B.frustum(x,y,5.6,.98,.18,MAR,20);B.frustum(x,y,5.78,1.07,.22,MAR,20)
        B.star(x,y,6.0,.95,11.6,MAR,24,.07,.81);B.frustum(x,y,17.6,.88,.15,MAR,16)
        B.frustum(x,y,17.75,.82,1.75,MAR,16,1.12)
        for k in range(8):
            a=k/8*2*math.pi;B.boxr(x+math.cos(a)*.86,y+math.sin(a)*.86,17.8,.5,.12,.85,MAR,a+math.pi/2,.32)
            a2=a+math.pi/8;B.boxr(x+math.cos(a2)*.96,y+math.sin(a2)*.96,18.4,.48,.12,.8,MAR,a2+math.pi/2,.4)
        for k in range(4):
            a=math.pi/4+k*math.pi/2;B.box(x+math.cos(a)*1.18,y+math.sin(a)*1.18,19.05,.42,.42,.42,MAR)
        B.box(x,y,19.5,2.75,2.75,.35,MAR)
    for y in(-28.5,-21.5,-14.5):
        for x in(-21,-12.6,-4.2,4.2,12.6,21):column(x,y)
    for s in(1,-1):
        for y in(-7.5,-.5,6.5,13.5,20.5,27.5):column(s*21,y)
    # three cellae, pilasters on the side walls, gilded bronze doors, closed back wall
    B.box(0,9.75,5,34,39.5,14.85,MAR);B.box(0,30,5,46,1.8,14.85,MAR)
    for s in(1,-1):
        for y in range(-8,30,4):B.box(s*17.25,y,5,.5,.9,14.85,MAR)
    for x,w,h in((-11,4.5,9),(0,6,11),(11,4.5,9)):B.box(x,-10.08,5,w+.9,.12,h+.7,GOLD);B.box(x,-10.16,5,w,.12,h,BRZ);B.box(x,-10.24,5+h*.5,w*.9,.08,.12,GOLD);B.box(x,-10.24,5,.12,.08,h,GOLD)
    # entablature: three fasciae, frieze with gilded reliefs, dentils, modillions, corona, sima
    B.box(0,-.75,19.85,46.6,61,.42,MAR);B.box(0,-.75,20.27,46.8,61.2,.42,MAR);B.box(0,-.75,20.69,47,61.4,.46,MAR);B.box(0,-.75,21.15,46.6,61,1.25,MAR)
    x=-21.5
    while x<=21.6:B.box(x,-31.3,21.4,1.2,.12,.7,GOLD);x+=2.2
    y=-29
    while y<=29.1:
        for s in(1,-1):B.box(s*23.35,y,21.4,.12,1.2,.7,GOLD)
        y+=2.2
    x=-23.4
    while x<=23.45:B.box(x,-31.15,22.4,.22,.3,.22,MAR);x+=.5
    y=-30.6
    while y<=29.1:
        for s in(1,-1):B.box(s*23.75,y,22.4,.3,.22,.22,MAR)
        y+=.5
    x=-23.3
    while x<=23.35:B.box(x,-31.55,22.42,.38,.8,.24,MAR);x+=1.5
    B.box(0,-.75,22.62,48.4,62.8,.55,MAR);B.box(0,-.75,23.17,48.8,63.2,.25,MAR)
    # roof: terracotta pan tiles with cover-tile ridges running eave to ridge, ridge cap, antefixes
    ze,zr,hw=23.42,30.42,24.4
    B.prism([(-hw,ze),(0,zr),(0,zr+.3),(-hw,ze+.3)],-31.9,30.9,TILE);B.prism([(hw,ze),(hw,ze+.3),(0,zr+.3),(0,zr)],-31.9,30.9,TILE)
    y=-31.55
    while y<=30.5:
        B.prism([(-hw,ze+.3),(0,zr+.3),(0,zr+.5),(-hw,ze+.5)],y,y+.24,TILE2);B.prism([(hw,ze+.3),(hw,ze+.5),(0,zr+.5),(0,zr+.3)],y,y+.24,TILE2)
        y+=.78
    B.box(0,-.5,zr+.25,.8,62.6,.5,TILE2)
    y=-31.2
    while y<=30.4:
        for s in(1,-1):B.box(s*(hw+.05),y,ze-.1,.16,.34,.55,MAR)
        y+=1.56
    # pediments: blue tympanum, marble raking cornices, gilded sculpture group on the front
    for yy,sculpt in((-31.5,True),(30.3,False)):
        B.prism([(-23.2,ze+.1),(23.2,ze+.1),(0,zr-.6)],yy,yy+.45,BLUE)
        B.prism([(-hw-.1,ze-.05),(-23.0,ze-.05),(0,zr-.4),(0,zr+.35)],yy-.55,yy+.65,MAR);B.prism([(hw+.1,ze-.05),(0,zr+.35),(0,zr-.4),(23.0,ze-.05)],yy-.55,yy+.65,MAR)
        if sculpt:
            B.box(0,yy-.35,ze+.2,2.6,.9,2.2,GOLD);B.frustum(0,yy-.3,ze+2.4,.75,2.0,GOLD,12,.55);B.frustum(0,yy-.3,ze+4.4,.42,.7,GOLD,10,.3)
            for k in range(1,9):
                for s2 in(1,-1):
                    xk=s2*(1.9+k*2.35);top=(1-abs(xk)/23.2)*6.2
                    if top<1.4:B.boxr(xk,yy-.3,ze+.2,2.4,.7,.75,GOLD,0,0);B.frustum(xk+s2*1.1,yy-.3,ze+.9,.3,.5,GOLD,8,.24)
                    else:
                        h=top-.75;B.frustum(xk,yy-.3,ze+.2,.42,h,GOLD,10,.34);B.frustum(xk,yy-.3,ze+.2+h,.27,.55,GOLD,8,.22)
    # apex quadriga with charioteer, winged Victories on the corners, statues along the eaves
    for hx in(-1.9,-.65,.65,1.9):
        B.box(hx,-33.4,zr+1.15,.7,2.4,1.0,GOLD);B.boxr(hx,-34.5,zr+1.9,.42,.5,1.2,GOLD,0,.6)
        for lx,ly in((-.22,-.85),(.22,-.85),(-.22,.85),(.22,.85)):B.box(hx+lx,-33.4+ly,zr+.05,.16,.16,1.12,GOLD)
    B.box(0,-31.3,zr+.2,3.2,1.8,1.5,GOLD);B.frustum(0,-31.3,zr+1.7,.45,2.4,GOLD,12,.32);B.box(0,-31.3,zr+4.1,.5,.5,.5,GOLD)
    for s in(1,-1):
        for yy in(-31.4,30.4):
            B.box(s*23.9,yy,ze+.3,1.4,1.4,.5,MAR);B.frustum(s*23.9,yy,ze+.8,.45,2.5,GOLD,10,.3)
            for w in(1,-1):B.boxr(s*23.9+w*.55,yy+.3,ze+2.0,.9,.1,1.5,GOLD,0,w*.5)
        for yy in(-20,-10,0,10,20):B.box(s*23.9,yy,ze+.25,1,1,.4,MAR);B.frustum(s*23.9,yy,ze+.65,.38,2.1,GOLD,10,.28)

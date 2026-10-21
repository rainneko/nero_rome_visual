# Curia Julia (Augustan senate house, Nero's time). Blender coords: Z up, front toward -Y (becomes +Z in glTF).
import math
def build(B):
    ST,BR,MAR,BRZ,TILE,TILE2,STU,GOLD='stone','brick','marble','bronze','tile','tile2','stucco','gold'
    w,d,H=18.0,27.0,20.0;yf=-d/2
    B.box(0,0,-6,w+3.2,d+3.2,6,ST);B.box(0,0,0,w+2.6,d+2.6,.6,MAR);B.box(0,-2.2,.6,w+1.8,d+6.2,.6,MAR)
    for i in range(6):B.box(0,yf-6.2-(5-i)*.4+.2-.2,i*.2,9.5,.4*(i+1),.2,MAR)
    B.box(0,0,1.2,w,d,H-1.2,BR)
    B.box(0,yf-.06,1.2,w+.24,.14,H-1.2,STU)
    for s in(1,-1):B.box(s*(w/2-.65),yf-.2,1.2,1.3,.32,H-1.2,STU)
    for y in(-12,-6,0,6,12):
        for s in(1,-1):B.box(s*(w/2+.32),y,1.2,.64,1.3,H-3.2,BR)
    B.box(0,yf-.18,1.2,4.6,.16,8.0,MAR);B.box(0,yf-.27,1.2,3.6,.14,7.2,BRZ)
    for zz in(2.6,4.4,6.2):B.box(0,yf-.36,zz,3.4,.06,.1,GOLD)
    B.box(0,yf-.36,1.2,.1,.06,7.2,GOLD)
    for x in(-5,0,5):
        B.box(x,yf-.16,11.2,3.3,.14,5.6,MAR);B.box(x,yf-.25,11.5,2.6,.12,4.9,BRZ)
        B.prism([(x+1.3*math.cos(a*math.pi/10),16.4+1.3*math.sin(a*math.pi/10)) for a in range(11)],yf-.33,yf-.17,BRZ)
        B.box(x,yf-.33,11.5,.1,.06,4.9,MAR);B.box(x,yf-.33,13.9,2.6,.06,.1,MAR)
    for y in(-9,-3,3,9):
        for s in(1,-1):B.box(s*(w/2+.05),y,14.0,.14,2.4,3.4,BRZ);B.box(s*(w/2+.1),y,13.8,.2,2.9,.25,MAR)
    # front porch: four Corinthian columns, entablature, terrace parapet
    for x in(-7.2,-2.4,2.4,7.2):
        yc=yf-4.6;B.box(x,yc,1.2,1.4,1.4,.32,MAR);B.frustum(x,yc,1.52,.6,.22,MAR,16);B.star(x,yc,1.74,.52,6.6,MAR,20,.06,.44)
        B.frustum(x,yc,8.34,.46,.9,MAR,14,.66);B.box(x,yc,9.24,1.5,1.5,.28,MAR)
    B.box(0,yf-2.35,9.52,w+.6,5.3,.55,MAR);B.box(0,yf-2.35,10.07,w+.9,5.6,.4,MAR);B.box(0,yf-2.35,10.47,w+.3,5.0,.25,TILE)
    B.box(0,yf-4.95,10.72,w+.3,.25,.9,MAR)
    for x in range(-8,9,2):B.box(x,yf-4.95,10.72,.22,.3,.9,MAR)
    # cornice, pediment, roof with cover tiles running eave to ridge
    B.box(0,0,H,w+.8,d+.8,.6,MAR);B.box(0,0,H+.6,w+1.2,d+1.2,.35,MAR)
    ze=H+.95;hw=w/2+.75;zr=ze+hw*math.tan(math.radians(18))
    for yy in(yf-.55,-yf+.15):
        B.prism([(-hw+.4,ze),(hw-.4,ze),(0,zr-.45)],yy,yy+.4,STU)
        B.prism([(-hw-.15,ze-.05),(-hw+.6,ze-.05),(0,zr-.3),(0,zr+.35)],yy-.25,yy+.65,MAR);B.prism([(hw+.15,ze-.05),(0,zr+.35),(0,zr-.3),(hw-.6,ze-.05)],yy-.25,yy+.65,MAR)
    B.prism([(-hw,ze),(0,zr),(0,zr+.28),(-hw,ze+.28)],yf-.6,-yf+.6,TILE);B.prism([(hw,ze),(hw,ze+.28),(0,zr+.28),(0,zr)],yf-.6,-yf+.6,TILE)
    y=yf-.45
    while y<=-yf+.4:
        B.prism([(-hw,ze+.28),(0,zr+.28),(0,zr+.46),(-hw,ze+.46)],y,y+.22,TILE2);B.prism([(hw,ze+.28),(hw,ze+.46),(0,zr+.46),(0,zr+.28)],y,y+.22,TILE2)
        y+=.72
    B.box(0,0,zr+.2,.7,d+1.1,.45,TILE2)
    B.box(0,yf-.6,zr+.35,1.1,.9,.9,MAR);B.frustum(0,yf-.6,zr+1.25,.32,1.7,GOLD,10,.26)
    for s in(1,-1):B.box(s*(hw-.3),yf-.6,ze+.3,.9,.9,.7,MAR);B.frustum(s*(hw-.3),yf-.6,ze+1.0,.28,1.4,GOLD,10,.22)

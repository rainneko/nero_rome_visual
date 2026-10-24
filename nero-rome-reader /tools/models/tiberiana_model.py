# Domus Tiberiana (Palatine) - shared geometry description. Blender coords: Z up, front (toward the Forum) at -Y.
import math
def build(B):
    PL,MA,ST,RF,GO,VO,RD='plaster','marble','stone','roof','gold','void','red'
    W2,D2,cx,cy=65,50,32,22            # outer half sizes, court half sizes
    g1,f1,f2=6.2,10.9,15.6             # ground floor top, first floor top, second floor top
    wings=[(0,-(D2+cy)/2,2*W2,D2-cy),(0,(D2+cy)/2,2*W2,D2-cy),(-(W2+cx)/2,0,W2-cx,2*cy),((W2+cx)/2,0,W2-cx,2*cy)]
    for x,y,sx,sy in wings:
        B.box(x,y,-.4,sx+.3,sy+.3,g1+.4,ST);B.box(x,y,g1,sx,sy,f2-g1,PL)
        B.box(x,y,f2-.65,sx+.12,sy+.12,.6,RD);B.box(x,y,f2-.05,sx+.7,sy+.7,.75,MA)
    # roofs: gable along each wing, ridge caps
    def gable(x,y,sx,sy,alongX,h=4.2):
        z0=f2+.7
        if alongX:B.prism([(-sy/2-.4,z0),(sy/2+.4,z0),(0,z0+h)],-sx/2-.4,sx/2+.4,RF,axis='x',ox=x,oy=y);B.box(x,y,z0+h-.1,sx+.6,.5,.35,MA)
        else:B.prism([(-sx/2-.4,z0),(sx/2+.4,z0),(0,z0+h)],-sy/2-.4,sy/2+.4,RF,axis='y',ox=x,oy=y);B.box(x,y,z0+h-.1,.5,sy+.6,.35,MA)
    gable(0,-(D2+cy)/2,2*W2,D2-cy,True);gable(0,(D2+cy)/2,2*W2,D2-cy,True);gable(-(W2+cx)/2,0,W2-cx,2*cy,False);gable((W2+cx)/2,0,W2-cx,2*cy,False)
    # facade bays: pilasters, framed windows with pediments on the piano nobile, lintels above
    def facade(x0,y0,dx,dy,length,nx,ny,frames=True):
        n=int(length/6.5);step=length/n
        for i in range(n+1):
            t=-length/2+i*step;px,py=x0+dx*t,y0+dy*t;B.box(px+nx*.18,py+ny*.18,g1,.9 if dx else .36,.36 if dx else .9,f2-g1-.65,MA)
        for i in range(n):
            t=-length/2+(i+.5)*step;px,py=x0+dx*t+nx*.06,y0+dy*t+ny*.06;wx,wy=(1.7,.12) if dx else (.12,1.7)
            B.box(px,py,g1+1.0,wx,wy,2.7,VO);B.box(px,py,f1+.8,wx*.95 if dx else .12,wy*.95 if dy else .12,2.3,VO)
            if frames:
                fx,fy=(2.2,.2) if dx else (.2,2.2);B.box(px+nx*.04,py+ny*.04,g1+3.75,fx,fy,.18,MA);B.box(px+nx*.04,py+ny*.04,f1+3.15,fx,fy,.16,MA)
                B.prismN(px+nx*.12,py+ny*.12,g1+3.95,2.5,.8,dx!=0,MA)
            B.box(px,py,.5,wx*.8 if dx else .12,wy*.8 if dy else .12,3.6,VO)
    facade(0,-D2,1,0,2*W2,0,-1);facade(0,D2,1,0,2*W2,0,1,False);facade(-W2,0,0,1,2*D2,-1,0);facade(W2,0,0,1,2*D2,1,0)
    facade(0,-cy,1,0,2*cx,0,1,False);facade(0,cy,1,0,2*cx,0,-1,False);facade(-cx,0,0,1,2*cy,1,0,False);facade(cx,0,0,1,2*cy,-1,0,False)
    # front portico (ground floor) with terrace and balustrade
    n=30
    for i in range(n+1):
        x=-W2+2+i*(2*W2-4)/n
        if abs(x)<12:continue
        B.frustum(x,-D2-3.4,0,.62,.4,MA,12);B.frustum(x,-D2-3.4,.4,.5,5.0,MA,12,.43);B.box(x,-D2-3.4,5.4,1.2,1.2,.3,MA)
    B.box(0,-D2-1.9,5.7,2*W2,3.8,.9,MA);B.box(0,-D2-1.9,-.4,2*W2,4.2,.45,ST)
    x=-W2+1
    while x<=W2-1:B.box(x,-D2-3.55,6.6,.16,.16,.9,MA);x+=1.1
    B.box(0,-D2-3.55,7.5,2*W2,.3,.16,MA)
    # central propylon: temple front with pediment, red tympanum, gilded quadriga
    for x in(-9.5,-5.7,-1.9,1.9,5.7,9.5):B.frustum(x,-D2-7,0,.95,.5,MA,14);B.frustum(x,-D2-7,.5,.78,10.3,MA,14,.68);B.frustum(x,-D2-7,10.8,.7,1,MA,12,1.0);B.box(x,-D2-7,11.8,2,2,.3,MA)
    B.box(0,-D2-4.4,12.1,24,7.6,1.5,MA);B.prism([(-12.3,13.6),(12.3,13.6),(0,17.4)],-D2-8.3,-D2-.8,MA,axis='y0');B.prism([(-10.8,13.9),(10.8,13.9),(0,16.6)],-D2-8.45,-D2-8.25,RD,axis='y0')
    for i in range(4):B.box(0,-D2-8.6-i*.45,0,24-i*.6,.45,.9-i*.22,ST)
    B.box(0,-D2-7.6,17.4,2.6,1.6,1.2,GO);B.frustum(0,-D2-7.6,18.6,.4,2.2,GO,10,.28)
    for s in(1,-1):B.frustum(s*12,-D2-8.0,13.6,.42,2.4,GO,10,.3)
    # top-floor loggia on the front wing: colonnade in front of a set-back wall
    x=-W2+3
    while x<=W2-3:
        if abs(x)>12.5:B.frustum(x,-D2-.25,f1+.05,.3,4.4,MA,10,.26)
        x+=3.25
    # peristyle around the court with lean-to roof
    for xs in range(-int(cx-3),int(cx-2),4):
        for s in(1,-1):B.frustum(xs,s*(cy-2.6),0,.38,5.4,MA,12,.33)
    for ys in range(-int(cy-6),int(cy-5),4):
        for s in(1,-1):B.frustum(s*(cx-2.6),ys,0,.38,5.4,MA,12,.33)
    for s in(1,-1):
        B.prism([(s*(cy-3.1),5.5),(s*(cy+.1),7.1),(s*(cy+.1),7.4),(s*(cy-3.1),5.8)],-cx,cx,RF,axis='x',ox=0,oy=0)
        B.prism([(s*(cx-3.1),5.5),(s*(cx+.1),7.1),(s*(cx+.1),7.4),(s*(cx-3.1),5.8)],-cy,cy,RF,axis='y',ox=0,oy=0)
    # gilded statues on the front parapet corners and along the front
    for x in(-W2,-39,-26,26,39,W2):B.box(x,-D2,f2+.7,1.1,1.1,.5,MA);B.frustum(x,-D2,f2+1.2,.38,2.2,GO,10,.27)

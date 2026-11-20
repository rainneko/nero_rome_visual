import json,sys,collections
d=json.load(open(sys.argv[1])); byid={r['id']:r for r in d['rooms']}
D="""
N01-N09 N01-N02 N01-N03 N09-P01 N04-N02 N05-N03 N06-N04 N06-N07 N07-N08 N08-W01 W01-P03 N10-P01 N11-P01
W02-P03 W03-W02 W04-P03 S02-P02 S12-S02 S12-S11 S11-S10 S13-S04 S04-S05 S05-S06 S06-S01 S07-S06 S07-S01 S01-P02
S03-S01 S03-S08 S09-S08 S14-S03 S14-S15 S14-S16 S15-S16
E01-P04 E01-T1 T1-E04 E04-E04a E04a-P04 E04-E05 E02-E02a E02a-P04 E02-E03 N14-E03 N14-N13 N13-N12 N12-N05
P01-P03 P01-P04 P02-P03 P02-P04 P01-P05 P02-P05 P03-P05 P04-P05
B05-B01 B03-B01 B04-B01 B02-B01
2E04-2T 2T-2E02 2E04-2S15 2E04-2E04a 2E04a-2S14 2T-2E01 2E01-2P04 2E02-2E02a 2E02a-2P04 2E02-2E03 2E04-2E05
2S15-2S14 2S16-2S14 2S15-2S16 2S03-2S14 2S03-2P02 2S01-2P02 2S01-2S04 2S02-2P02
2N09-2N01 2N09-2P01 2N10-2P01 2N11-2P01 2N06-2N01 2N06-2N07 2N07-2N08 2N12-2N01 2N12-2N13 2N13-2N14 2N14-2E03
2P01-2P04 2P02-2P04
"""
V="N04~2N01 N05~2N01 S08~2S04 S14~2S14 2S01~3S1 P05~B05 2T~3T"   # vertical links (stairs, lift)
def touch(a,b):
    a=byid[a]; b=byid[b]
    if a['floor']!=b['floor']: return 'floor'
    if a['x1']==b['x0'] or b['x1']==a['x0']:
        if min(a['y1'],b['y1'])-max(a['y0'],b['y0'])>=1.2: return None
    if a['y1']==b['y0'] or b['y1']==a['y0']:
        if min(a['x1'],b['x1'])-max(a['x0'],b['x0'])>=1.2: return None
    return 'no shared wall'
g=collections.defaultdict(set); n=0
for p in D.split():
    a,b=p.split('-'); 
    for k in (a,b):
        if k not in byid: print('UNKNOWN',k)
    e=touch(a,b)
    if e: print('BAD',p,e)
    g[a].add(b); g[b].add(a); n+=1
for p in V.split():
    a,b=p.split('~'); g[a].add(b); g[b].add(a)
seen=set(); st=['N01']
while st:
    x=st.pop()
    if x in seen: continue
    seen.add(x); st+=list(g[x])
miss=[r['id']+r['zh'] for r in d['rooms'] if r['id'] not in seen]
print('doors',n,'rooms reached',len(seen),'of',len(d['rooms']),'missing',miss)
deg1=[k for k in byid if len(g[k])==0]; print('no door',deg1)

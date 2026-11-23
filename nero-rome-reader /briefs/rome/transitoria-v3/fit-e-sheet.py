# In-scene check sheet for the bedroom 2E04 (GPT's rome_tr_fit_2E04 in the east pack, with this session's alcove walls).
# Left column: GPT's preview renders (renders/rome_tr_fit_2E04, git-ignored); right: the same cameras in the scene (shots/tr-bed, job shots/tr-fit/job-bed.json).
# Run: ~/opt/anaconda3/bin/python briefs/rome/transitoria-v3/fit-e-sheet.py
from PIL import Image, ImageDraw, ImageFont
import os
R = os.path.join(os.path.dirname(__file__), '../../..')
F = lambda n, b=False: ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', n, index=1 if b else 0)
W, H, PAD, CAP = 960, 540, 16, 44
def pic(p):
    p = os.path.join(R, p)
    return Image.open(p).convert('RGB').resize((W, H)) if os.path.exists(p) else None
ROWS = [(('renders/rome_tr_fit_2E04/cam1-from-north-door.png', 'shots/tr-bed/2E04-cam1-north-door.png'), '① 寝殿 · 从北门进来（cam1 同机位）',
         [(40, 470, 'GPT 的单件预览：没有墙')], [(380, 330, '日间榻、小几、折凳'), (700, 330, '火盆'), (330, 120, '壁龛：束帘 + 拱口'), (560, 150, '柜')]),
        (('renders/rome_tr_fit_2E04/cam2-to-alcove.png', 'shots/tr-bed/2E04-cam2-to-alcove.png'), '② 寝殿 · 正对壁龛（cam2 同机位）',
         [], [(300, 60, '帘杆和两束帘，中间净宽 2.19 m'), (560, 300, '龛里：床、脚凳'), (40, 330, '隔墙和拱是这边加的，墙裙是墙自己的下段')]),
        ((None, 'shots/tr-bed/2E04-in-alcove.png'), '③ 壁龛里面 · 床、脚凳、灯架、衣箱', [], [(120, 60, '龛里用深色的墙和矮顶压暗（屋里没有影子，只能靠颜色）')]),
        ((None, 'shots/tr-bed/2E04-from-west-door.png'), '④ 寝殿 · 从西门往东看', [], [(480, 330, '东墙现在只有一扇门（两扇落地门要改外壳，另问作者）')]),
        ((None, 'shots/tr-bed/2E04-washstand.png'), '⑤ 西北角 · 盥洗架', [], [(120, 60, '盆里是静水（slot_water_1，圆片，半径 0.218 m）')])]
img = Image.new('RGB', (PAD * 3 + W * 2, 110 + len(ROWS) * (H + CAP + PAD) + 130), (28, 25, 22)); d = ImageDraw.Draw(img)
d.text((PAD, 14), '东宫 · 二层寝殿 2E04 试摆：GPT 预览（左）和场景内（右）', font=F(30, True), fill=(255, 240, 200))
d.text((PAD, 62), '第一人称，58 年，上午。陈设是 GPT 做的（8,632 面）；壁龛的隔墙、拱、矮顶和踏步是这边加的。样子都是【设】。', font=F(21), fill=(230, 224, 214))
for i, (ps, cap, la, lb) in enumerate(ROWS):
    y = 110 + i * (H + CAP + PAD)
    for j, (p, labs, tag) in enumerate(((ps[0], la, 'GPT 预览'), (ps[1], lb, '场景内'))):
        x = PAD + j * (W + PAD); im = pic(p) if p else None
        if im: img.paste(im, (x, y))
        else:
            d.rectangle((x, y, x + W, y + H), fill=(40, 36, 32)); d.text((x + 330, y + 250), '（单件预览没有这个机位）', font=F(22), fill=(150, 142, 130)); labs = []
        for lx, ly, t in ([(W - 130, 12, tag)] if im else []) + labs:
            b = d.textbbox((0, 0), t, font=F(20, True)); d.rectangle((x + lx - 6, y + ly - 4, x + lx + b[2] + 6, y + ly + b[3] + 8), fill=(20, 18, 16)); d.text((x + lx, y + ly), t, font=F(20, True), fill=(255, 226, 120))
    d.text((PAD, y + H + 8), cap, font=F(20), fill=(230, 224, 214))
y = 110 + len(ROWS) * (H + CAP + PAD) + 6
for k, t in enumerate(['【书】“宫里东边那座塔，塔里装了一只吊笼：钢丝绳，一只配重的水箱，他从寝殿那一层直接升到塔顶。”（第11份改写稿 1425 行）——寝殿和塔同层，这里只摆寝殿。',
                       '主间加了一层素灰泥的平天花（净高 4.7 m），不再露红色的屋顶底面；床龛的矮木顶不变。还没做的：东墙两扇落地门（改外壳，另算）；壁画和地面拼花（另算）。',
                       '平面改动：2E04 通南边 2S15 的门取消（壁龛占了那面墙），2S15 改叫“晨间起居·观景房”，82 间房仍然全部走得到。']):
    d.text((PAD, y + k * 36), t, font=F(21), fill=(230, 224, 214))
img.save(os.path.join(os.path.dirname(__file__), 'fit-e-in-scene.png')); print('saved', img.size)

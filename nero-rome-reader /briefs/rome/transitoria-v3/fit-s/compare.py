# Before / after, same cameras: the dining room's water and cloth, the kitchen without passers-by (高级审查监督员's three notes, 2026-11-22).
# Sources: shots/tr-fit (before) and shots/tr-fit2 (after), both shots/tr-fit/job.json. Run: ~/opt/anaconda3/bin/python briefs/rome/transitoria-v3/fit-s/compare.py
from PIL import Image, ImageDraw, ImageFont
import os
R = os.path.join(os.path.dirname(__file__), '../../../..')
F = lambda n, b=False: ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', n, index=1 if b else 0)
W, H, PAD, CAP = 960, 540, 16, 44
ROWS = [('S01-a-north-arch', '① 餐厅 · 从北面大拱进来', [(40, 420, '水槽：天蓝'), (330, 150, '西组：亮蓝')], [(40, 420, '水槽：和水景套装同一种深色水，屋里少映天'), (300, 150, '西组：褪色的暗紫；中组：深红')]),
        ('S01-b-water-stair', '② 餐厅 · 西头的水阶和榻', [(700, 600 - 140, '亮蓝的水')], [(660, 600 - 140, '深色的水'), (300, 330, '垫子不再发亮')]),
        ('S01-c-from-east', '③ 餐厅 · 从东头往西看（东组是黄的）', [], [(120, 420, '黄也压暗了一点')]),
        ('S09-b', '⑥ 厨房 · 从东北角看', [(430, 300, '两个近卫和一个仆役站在灶前'), (560, 430, '鱼：亮蓝')], [(380, 300, '路人和近卫不再进厨房和餐厅'), (560, 430, '鱼：银灰')]),
        (('shots/tr-water/labrum14-now', 'shots/tr-fit2/labrum14'), '⑦ 浴区 · 屋里那只圆水盆（水景套装里的，一起改）', [(40, 420, '盆里的水映着天，发亮')], [(40, 420, '和餐厅水槽一样压暗')])]
img = Image.new('RGB', (PAD * 3 + W * 2, 110 + len(ROWS) * (H + CAP + PAD) + 90), (28, 25, 22)); d = ImageDraw.Draw(img)
d.text((PAD, 14), '东宫 · 餐厅和厨房试摆：改前（左）改后（右），同机位', font=F(30, True), fill=(255, 240, 200))
d.text((PAD, 62), '第一人称，58 年，上午。只改了场景这边：水的反光、布料颜色（蓝布改成褪色的紫，项目规矩不用蓝布）、路人禁区。GPT 的模型没动。样子都是【设】。', font=F(21), fill=(230, 224, 214))
for i, (k, cap, la, lb) in enumerate(ROWS):
    y = 110 + i * (H + CAP + PAD)
    for j, (dr, labs, tag) in enumerate((('shots/tr-fit', la, '改前'), ('shots/tr-fit2', lb, '改后'))):
        x = PAD + j * (W + PAD); img.paste(Image.open(os.path.join(R, (dr + '/' + k if isinstance(k, str) else k[j]) + '.png')).convert('RGB').resize((W, H)), (x, y))
        for lx, ly, t in [(W - 90, 12, tag)] + labs:
            b = d.textbbox((0, 0), t, font=F(20, True)); d.rectangle((x + lx - 6, y + ly - 4, x + lx + b[2] + 6, y + ly + b[3] + 8), fill=(20, 18, 16)); d.text((x + lx, y + ly), t, font=F(20, True), fill=(255, 226, 120))
    d.text((PAD, y + H + 8), cap, font=F(20), fill=(230, 224, 214))
y = 110 + len(ROWS) * (H + CAP + PAD) + 6
d.text((PAD, y), '没改的：墙上的壁画和地面拼花（另算）；狮口的水和跌水（第 7 项）。', font=F(21), fill=(230, 224, 214))
d.text((PAD, y + 36), '禁区按房间平面划，所以餐厅上层回廊和厨房楼上那一格也不进路人。', font=F(21), fill=(230, 224, 214))
img.save(os.path.join(os.path.dirname(__file__), 'before-after.png')); print('saved', img.size)

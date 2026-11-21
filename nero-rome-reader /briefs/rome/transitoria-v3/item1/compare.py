# Item 1: the three door changes for the two kitchens (masterplan v3 B9), before / after, from shots/tr-05/ (first person, 58 AD).
# Run from the project folder: ~/opt/anaconda3/bin/python briefs/rome/transitoria-v3/item1/compare.py
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', '..', '..', '..', 'shots', 'tr-05')
def F(n, b=False): return ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', n, index=1 if b else 0)
W, H, PAD, CAP = 960, 540, 16, 44
def tag(d, x, y, s, col=(255, 236, 120), size=22):
    f = F(size, True); b = d.textbbox((0, 0), s, font=f); d.rectangle([x - 6, y - 4, x + b[2] + 6, y + b[3] + 8], fill=(20, 18, 16)); d.text((x, y), s, font=f, fill=col)
ROWS = [('doorS09S03', '① 备餐间 S03 朝南看：新开一个门（1.2 × 2.2 m）通大厨房 S09。菜从这里出来，不经过客人走的廊。',
         [(150, 200, '一面实墙', 0), (540, 200, '新开的门，里面是大厨房', 1), (420, 250, '（灶台和案子是占位的方块，等正式模型）', 1)]),
        ('doorS04S02', '② 冬季小餐室 S02 朝南看：新开一个门通酒窖 S04，小厨房的菜从这里上。', [(150, 200, '一面实墙', 0), (560, 200, '新开的门，通酒窖', 1)]),
        ('doorS07S08', '④ 仆役·试毒间 S07 朝东看：新开一个小门通南楼梯间，货从南门进来经这里到大厨房，从梯的歇台底下过。', [(150, 200, '一面实墙', 0), (560, 200, '新开的小门', 1)]),
        ('doorS05S06', '③ 南门厅 S06 朝西看：小厨房 S05 原来朝门厅开的门封掉，客人进餐厅的门厅里不再有厨房的门。', [(150, 200, '原来的门，通小厨房', 0), (560, 200, '封成墙了', 1)])]
can = Image.new('RGB', (PAD * 3 + W * 2, 110 + len(ROWS) * (H + CAP + PAD) + 70), (30, 26, 24)); d = ImageDraw.Draw(can)
d.text((PAD, 14), '东宫 · 两间厨房改的四个门（第 1 项，总规划 B9）', font=F(30, True), fill=(255, 240, 200))
d.text((PAD, 62), '第一人称，58 年，上午。左边是现在的网页，右边是改后。都是室内隔墙，从外面看不到。', font=F(20), fill=(230, 224, 214))
for r, (name, cap, marks) in enumerate(ROWS):
    y = 110 + r * (H + CAP + PAD)
    for c, (suf, lab) in enumerate((('before', '改前'), ('after', '改后'))):
        x = PAD + c * (W + PAD); can.paste(Image.open(os.path.join(SRC, '%s-%s.png' % (name, suf))).convert('RGB').resize((W, H)), (x, y))
        tag(d, x + 12, y + H - 44, lab, (255, 255, 255) if c == 0 else (150, 240, 150))
        for (mx, my, s, side) in marks:
            if side == c: tag(d, x + mx, y + my, s)
    d.text((PAD, y + H + 8), cap, font=F(21), fill=(230, 224, 214))
d.text((PAD, can.size[1] - 56), '南墙的出烟口另见 kitchen-vent-before-after.png。', font=F(21, True), fill=(255, 236, 120))
can.save(os.path.join(HERE, 'kitchen-doors-before-after.png')); print('saved')

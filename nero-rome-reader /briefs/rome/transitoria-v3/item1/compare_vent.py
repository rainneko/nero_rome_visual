# Item 1: the great kitchen's smoke outlet, before / after, from shots/tr-05/ (first person, 58 AD).
# Run from the project folder: ~/opt/anaconda3/bin/python briefs/rome/transitoria-v3/item1/compare_vent.py
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', '..', '..', '..', 'shots', 'tr-05')
def F(n, b=False): return ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', n, index=1 if b else 0)
W, H, PAD, CAP = 960, 540, 16, 44
def tag(d, x, y, s, col=(255, 236, 120), size=22):
    f = F(size, True); b = d.textbbox((0, 0), s, font=f); d.rectangle([x - 6, y - 4, x + b[2] + 6, y + b[3] + 8], fill=(20, 18, 16)); d.text((x, y), s, font=f, fill=col)
ROWS = [('vent-out', '① 站在南侧台地上抬头看大厨房的南墙（二层是南敞廊）。', [(330, 330, '一面光墙', 0), (520, 300, '出烟口：1.6 × 1.0 m，离地 5.1 m', 1), (520, 350, '石框、深色底、五条横百叶', 1)]),
        ('vent-in', '② 站在大厨房里抬头看南墙。', [(380, 300, '一面光墙', 0), (540, 330, '同一个出烟口，从屋里看', 1)])]
can = Image.new('RGB', (PAD * 3 + W * 2, 110 + len(ROWS) * (H + CAP + PAD) + 104), (30, 26, 24)); d = ImageDraw.Draw(can)
d.text((PAD, 14), '东宫 · 大厨房南墙的出烟口（第 1 项，总规划 B9）', font=F(30, True), fill=(255, 240, 200))
d.text((PAD, 62), '第一人称，58 年，上午。左边是现在的网页，右边是改后。【史】罗马厨房没有烟囱，烟从墙高处的洞出去；位置和样子是【设】。', font=F(20), fill=(230, 224, 214))
for r, (name, cap, marks) in enumerate(ROWS):
    y = 110 + r * (H + CAP + PAD)
    for c, (suf, lab) in enumerate((('before', '改前'), ('after', '改后'))):
        x = PAD + c * (W + PAD); can.paste(Image.open(os.path.join(SRC, '%s-%s.png' % (name, suf))).convert('RGB').resize((W, H)), (x, y))
        tag(d, x + 12, y + H - 44, lab, (255, 255, 255) if c == 0 else (150, 240, 150))
        for (mx, my, s, side) in marks:
            if side == c: tag(d, x + mx, y + my, s)
    d.text((PAD, y + H + 8), cap, font=F(21), fill=(230, 224, 214))
d.text((PAD, can.size[1] - 90), '只在第一人称走路时显示；从空中看、读书时看，外观和原来一样（外壳模型没有改）。', font=F(21, True), fill=(255, 236, 120))
d.text((PAD, can.size[1] - 54), '它是嵌在墙上的一块板，不是真的洞。下次重建外壳（第 2 项）时改成真的洞。屋里那两个近卫是走进来的路人，另记。', font=F(21), fill=(230, 224, 214))
can.save(os.path.join(HERE, 'kitchen-vent-before-after.png')); print('saved')

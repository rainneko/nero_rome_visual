# Item 0.5 ("walk in"): annotated before / after pictures from shots/tr-05/ (first person, 58 AD).
# Run from the project folder: ~/opt/anaconda3/bin/python briefs/rome/transitoria-v3/item05/compare.py
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', '..', '..', '..', 'shots', 'tr-05')
def F(n, b=False): return ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', n, index=1 if b else 0)
W, H, PAD, CAP = 960, 540, 16, 44
def tag(d, x, y, s, col=(255, 236, 120), size=22):
    f = F(size, True); b = d.textbbox((0, 0), s, font=f); d.rectangle([x - 6, y - 4, x + b[2] + 6, y + b[3] + 8], fill=(20, 18, 16)); d.text((x, y), s, font=f, fill=col)
def sheet(out, title, note, rows):
    can = Image.new('RGB', (PAD * 3 + W * 2, 110 + len(rows) * (H + CAP + PAD) + 70), (30, 26, 24)); d = ImageDraw.Draw(can)
    d.text((PAD, 14), title, font=F(30, True), fill=(255, 240, 200)); d.text((PAD, 62), note, font=F(20), fill=(230, 224, 214))
    for r, (name, cap, marks) in enumerate(rows):
        y = 110 + r * (H + CAP + PAD)
        for c, (suf, lab) in enumerate((('before', '改前：门扇关着'), ('after', '改后：门开着'))):
            x = PAD + c * (W + PAD); can.paste(Image.open(os.path.join(SRC, '%s-%s.png' % (name, suf))).convert('RGB').resize((W, H)), (x, y))
            tag(d, x + 12, y + H - 44, lab, (255, 255, 255) if c == 0 else (150, 240, 150))
            for (mx, my, s, side) in marks:
                if side == c: tag(d, x + mx, y + my, s)
        d.text((PAD, y + H + 8), cap, font=F(21), fill=(230, 224, 214))
    d.text((PAD, can.size[1] - 56), '只在第一人称走路时这样显示；从空中看、读书时看，外观和原来一样（外壳模型没有改）。', font=F(21, True), fill=(255, 236, 120))
    can.save(os.path.join(HERE, out)); print('saved', out)
sheet('gates-before-after.png', '东宫 · 北门、南门白天开着（第 0.5 项“走得进”）', '第一人称，58 年，上午。左边是现在的网页，右边是改后。',
      [('gateN-out', '北门（正门），站在门前平台上朝里看。改前要贴近了点右键才穿得过去；改后直接走进门厅，看得到引见厅的拱门。',
        [(280, 250, '一整块木门板', 0), (560, 150, '看得到门厅和里面的拱门', 1), (40, 60, '门廊的四根柱、墙、红色腰线都没动', 1)]),
       ('gateS-out', '南门，站在南侧台地上朝里看。',
        [(330, 300, '木门板', 0), (560, 250, '一直看得到庭园那头', 1)]),
       ('gateN-in', '北门，站在门厅里朝外看。',
        [(330, 250, '门洞是一片灰', 0), (520, 60, '看得到门廊的柱子和山下的城', 1)])])
im = Image.open(os.path.join(SRC, 'pier-2N01.png')).convert('RGB'); can = Image.new('RGB', (im.size[0], im.size[1] + 92), (30, 26, 24)); can.paste(im, (0, 0)); d = ImageDraw.Draw(can)
tag(d, 420, 420, '新加的灰泥墙垛（9.9×2.3 m，高 2 m）'); tag(d, 420, 470, '里面包着顶进来的门廊屋顶，人走不上去了')
d.text((16, im.size[1] + 10), '东宫 · 二层北敞廊正中（改后）', font=F(24, True), fill=(255, 240, 200))
d.text((16, im.size[1] + 50), '临时做法，只在室内包里。根治要把门廊往外挪 2.4 m（动外壳外观），并入第 2 项，届时先出前后对比。', font=F(20), fill=(230, 224, 214))
can.save(os.path.join(HERE, 'pier-2N01.png')); print('saved pier')

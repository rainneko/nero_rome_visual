# The water kit in the scene: the old garden basins before / after, and the new places. Pictures from shots/tr-water/ (first person, 58 AD).
# Run from the project folder: ~/opt/anaconda3/bin/python briefs/rome/transitoria-v3/water-kit/compare.py
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', '..', '..', '..', 'shots', 'tr-water')
def F(n, b=False): return ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', n, index=1 if b else 0)
W, H, PAD, CAP = 960, 540, 16, 44
def tag(d, x, y, s, col=(255, 236, 120), size=22):
    f = F(size, True); b = d.textbbox((0, 0), s, font=f); d.rectangle([x - 6, y - 4, x + b[2] + 6, y + b[3] + 8], fill=(20, 18, 16)); d.text((x, y), s, font=f, fill=col)
def pic(n): return Image.open(os.path.join(SRC, n + '.png')).convert('RGB').resize((W, H))

# sheet 1: the two old basins (an accepted look: the author decides)
ROWS = [('basinW7', '① 站在庭园西北草地南边的砾石路上，看北边那只水盆（水路图 7 号；南边的 8 号是同样的一对）。', [(250, 70, '现有：平盆，正中一尊立像', 0), (240, 70, '换成：圆盆泉，矮柱托一只浅盘，盘心铜喷嘴', 1)]),
        ('basinW7-far', '② 站在西廊里往庭园看同一只水盆。', [(330, 330, '现有的平盆和立像', 0), (330, 330, '圆盆泉', 1)])]
can = Image.new('RGB', (PAD * 3 + W * 2, 110 + len(ROWS) * (H + CAP + PAD) + 140), (30, 26, 24)); d = ImageDraw.Draw(can)
d.text((PAD, 14), '东宫 · 庭园西侧两只水盆换成圆盆泉（水景小件套装 W2）· 作者已同意', font=F(30, True), fill=(255, 240, 200))
d.text((PAD, 62), '第一人称，58 年，上午。左边是现在的网页，右边是换了以后。同一个站位、同一个方向。样子是【设】，没有遗址依据。', font=F(21), fill=(230, 224, 214))
for r, (name, cap, marks) in enumerate(ROWS):
    y = 110 + r * (H + CAP + PAD)
    for c, (suf, lab) in enumerate((('now', '现在'), ('new', '换了以后'))):
        x = PAD + c * (W + PAD); can.paste(pic('%s-%s' % (name, suf)), (x, y)); tag(d, x + 12, y + H - 44, lab, (255, 255, 255) if c == 0 else (150, 240, 150))
        for (mx, my, s, side) in marks:
            if side == c: tag(d, x + mx, y + my, s)
    d.text((PAD, y + H + 8), cap, font=F(21), fill=(230, 224, 214))
y = can.size[1] - 126
d.text((PAD, y), '作者 2026-11-22 已同意换：第一人称走路时默认就是右边的样子；网址后面加 ?trbasin=old 可以看旧的。', font=F(21, True), fill=(255, 236, 120))
d.text((PAD, y + 36), '换了以后上盘和下池都有静水面（和旧平盆同一种水）；喷嘴的水柱和盘沿落下来的水是第 7 项统一加。立像会拿掉。', font=F(21), fill=(230, 224, 214))
d.text((PAD, y + 72), '从空中看要等下次重建外壳才会变；在那以前空中看到的还是旧的平盆。画面里走动的人是场景里的路人。', font=F(21), fill=(230, 224, 214))
can.save(os.path.join(HERE, 'basins-before-after.png'))

# sheet 2: the new places (nothing stood there before)
NEW = [('basinE9', '庭园东北草地 · 圆盆泉 W2（9 号；东南草地的 10 号是同样的一只）', [(400, 150, '新加的圆盆泉', 1)]),
       ('garden-east', '从东廊看庭园东南草地 · 圆盆泉 W2（10 号）', [(560, 330, '圆盆泉，在两棵柏树之间', 1)]),
       ('wall12-13', '站在庭园北边看北廊的后墙 · 两个壁泉 W1（12、13 号），在引见厅大拱的两侧', [(20, 250, '壁泉 12 号', 1), (700, 250, '壁泉 13 号', 1), (360, 120, '引见厅的大拱', 0)]),
       ('wall13', '北廊里走近看东边的壁泉 W1（13 号）', [(430, 60, '小檐，两根黄大理石小柱', 1), (500, 440, '半圆石座，小盆里有水', 1)]),
       ('tazza5', '下沉水庭 · 十二柱亭正中的大水盘 W4（5 号）', [(470, 330, '大水盘，脚下三级圆台阶', 1)]),
       ('spout4', '下沉水庭 · 长水池的进水口 W5（4 号，南北各一个）', [(500, 250, '铜狮面出水口，在喷泉墙的池沿上', 1)]),
       ('outlet21', '东侧下层台上 · 上层台挡墙上的出水口 W5（21 号）', [(380, 370, '铜狮面出水口：全宫的水从这里排出去', 1)]),
       ('labrum14', '浴室热水厅 · 高脚水盘 W3（斑岩）', [(330, 220, '斑岩高脚水盘', 1), (560, 470, '两个近卫是走进来的路人', 0)])]
cols = 2; rows = (len(NEW) + 1) // 2
can = Image.new('RGB', (PAD * 3 + W * 2, 110 + rows * (H + CAP + PAD) + 140), (30, 26, 24)); d = ImageDraw.Draw(can)
d.text((PAD, 14), '东宫 · 水景小件套装摆进场景：新加的九处（这些地方原来什么都没有）', font=F(30, True), fill=(255, 240, 200))
d.text((PAD, 62), '第一人称，58 年，上午。盆里、盘里已有静水面；喷出来、落下来的流水是第 7 项统一加。编号是水路图 plan-v3-water.png 上的号。样子都是【设】。', font=F(21), fill=(230, 224, 214))
for i, (name, cap, marks) in enumerate(NEW):
    x = PAD + (i % 2) * (W + PAD); y = 110 + (i // 2) * (H + CAP + PAD); can.paste(pic(name + '-now'), (x, y))
    for (mx, my, s, hl) in marks: tag(d, x + mx, y + my, s, (255, 236, 120) if hl else (255, 255, 255))
    d.text((x, y + H + 8), '%s %s' % ('①②③④⑤⑥⑦⑧'[i], cap), font=F(20), fill=(230, 224, 214))
y = can.size[1] - 126
d.text((PAD, y), '只在第一人称走到 60 m 以内时显示；从空中看、读书时看，和原来一样。低档和手机档不加载。', font=F(21, True), fill=(255, 236, 120))
d.text((PAD, y + 36), '还没摆的（地方还没建）：水梯两侧的阶梯跌水、石榴小院的井栏、两间凉室的水盘、浴室三池的进水口。', font=F(21), fill=(230, 224, 214))
d.text((PAD, y + 72), '没有摆的：北面大阶正中墙上的壁泉。那里现在立着一尊已验收的雕像，要挪它得先问作者。', font=F(21), fill=(230, 224, 214))
can.save(os.path.join(HERE, 'new-places.png')); print('saved')

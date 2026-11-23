# The dining room (S01) and the great kitchen (S09) with GPT's furnishings, in the scene: one labelled sheet.
# Sources: shots/tr-fit/*.png (shots/tr-fit/job.json through shots/tr-05/walk.mjs). Run: ~/opt/anaconda3/bin/python briefs/rome/transitoria-v3/fit-s/sheet.py
from PIL import Image, ImageDraw, ImageFont
import os
R = os.path.join(os.path.dirname(__file__), '../../../..'); S = os.path.join(R, 'shots/tr-fit')
F = lambda n, b=False: ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', n, index=1 if b else 0)
W, H, PAD, CAP = 960, 540, 16, 44
PICS = [('S01-a-north-arch', '① 餐厅 · 从北面大拱进来：三组榻，一条水槽从西头流到东头', [(300, 150, '西组（蓝）和中组（红）'), (40, 330, '水槽，圆桌跨在槽上')]),
        ('S01-b-water-stair', '② 餐厅 · 西头的水阶：狮口出水，落五级，流进榻下的槽', [(620, 90, '小山花，两根黄石柱'), (640, 330, '五级水阶（流水第 7 项加）')]),
        ('S01-c-from-east', '③ 餐厅 · 从东头往西看：东组（黄）朝西开口', [(120, 420, '东组三张榻'), (700, 150, '南面大拱')]),
        ('S01-d-table', '④ 餐厅 · 走近看中组的圆桌', [(330, 190, '白石圆桌，铜兽足，桌上果盘、杯、壶')]),
        ('S09-a', '⑤ 厨房 · 从西北角看：长灶台、大案、石水槽、柴堆', [(520, 260, '长灶台，五个柴洞'), (300, 390, '大案：砧板、鱼、臼'), (60, 250, '柴堆和两只筐')]),
        ('S09-b', '⑥ 厨房 · 从东北角看：南墙木杆挂炊具，西墙挂肉', [(250, 235, '木杆上七件炊具'), (500, 230, '西墙：两扇肉、蒜、香草'), (640, 330, '罐架')]),
        ('S09-c', '⑦ 厨房 · 东墙：烤炉、木铲、柴堆、石水槽', [(20, 330, '烤炉'), (520, 300, '石水槽和铜出水嘴')]),
        ('S09-d', '⑧ 厨房 · 灶台近看：三脚上的铜锅，柴洞里有柴', [(330, 60, '两个近卫是走进来的路人')])]
rows = (len(PICS) + 1) // 2
img = Image.new('RGB', (PAD * 3 + W * 2, 110 + rows * (H + CAP + PAD) + 130), (28, 25, 22)); d = ImageDraw.Draw(img)
d.text((PAD, 14), '东宫 · 水榭餐厅 S01 和大厨房 S09 的陈设，摆进场景以后（第一人称）', font=F(30, True), fill=(255, 240, 200))
d.text((PAD, 62), '58 年，上午。模型是 GPT 照工单做的：餐厅 7,834 面，厨房 14,622 面。样子都是【设】。【书】餐厅：无；厨房的封泥酒罐取“酒是封着泥运来的”一句。', font=F(20), fill=(230, 224, 214))
for i, (k, cap, labs) in enumerate(PICS):
    x = PAD + (i % 2) * (W + PAD); y = 110 + (i // 2) * (H + CAP + PAD)
    im = Image.open(os.path.join(S, k + '.png')).resize((W, H)); img.paste(im, (x, y))
    for lx, ly, t in labs:
        b = d.textbbox((0, 0), t, font=F(20, True)); d.rectangle((x + lx - 6, y + ly - 4, x + lx + b[2] + 6, y + ly + b[3] + 8), fill=(20, 18, 16)); d.text((x + lx, y + ly), t, font=F(20, True), fill=(255, 236, 120))
    d.text((x, y + H + 8), cap, font=F(20), fill=(230, 224, 214))
y = 110 + rows * (H + CAP + PAD) + 6
d.text((PAD, y), '只在第一人称走进南翼时加载；人在哪间屋，才显示哪间屋和相通的屋。低档和手机档不加载。', font=F(21, True), fill=(255, 236, 120))
d.text((PAD, y + 36), '餐厅的池里、槽里已有静水面；狮口的水、五级跌水是第 7 项统一加。厨房的石水槽是空的（工单没要水面）。', font=F(21), fill=(230, 224, 214))
d.text((PAD, y + 72), '还没做：墙上的壁画和地面的拼花（现在是素墙、黄墙裙）；路人会走进屋里站着。', font=F(21), fill=(230, 224, 214))
img.save(os.path.join(os.path.dirname(__file__), 'in-scene.png')); print('saved', img.size)

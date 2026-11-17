#!/usr/bin/env python3
"""Domus Tiberiana v2: the palace above the platform as DATA (rooms per floor, roof blocks), checked, then written as
   tools/models/rome/tiberiana_plan.json   (the model script and, later, Unity read this)
   briefs/rome/plans/tiberiana-plan.html   (the drawings: each floor, the roofs, and the floors taken apart)
Model axes: x east, y north (the front, toward the Forum), z up; origin = the centre of the platform top (page: 54.8 m).
The building is 130 x 100 m: x -65..65, y -50..50. Run: python3 tools/plan/tiberiana_plan.py   (standard library only)"""
import json, os, html
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
X0, X1, Y0, Y1 = -65.0, 65.0, -50.0, 50.0
Z = {'B1': -4.0, 'F1': 0.0, 'F2': 6.5, 'F3': 11.0}            # floor levels
HT = {'B1': 3.4, 'F1': 6.5, 'F2': 4.5, 'F3': 3.8}             # floor to floor
PITCH = 0.40                                                   # roof rise per metre of run (about 22 degrees)
TYPES = {  # key: (label, colour)
    'state': ('朝仪·接待', '#d4a72c'), 'office': ('文书·档案', '#6f8fb0'), 'private': ('皇帝私邸', '#8e63b0'),
    'family': ('内眷·客房', '#d48aa6'), 'dining': ('宴饮', '#d0603f'), 'service': ('厨房·仓储·仆役', '#9a8a74'),
    'guard': ('卫兵', '#5f7078'), 'bath': ('浴室', '#45aeb0'), 'sacred': ('祖先·神龛', '#e09a1a'),
    'garden': ('花园（露天）', '#74b860'), 'court': ('铺地院（露天）', '#b9c79a'), 'portico': ('柱廊·敞廊', '#e3d6b4'),
    'corridor': ('走廊·过道', '#efe8d6'), 'stair': ('楼梯', '#a9a9a9'), 'terrace': ('屋顶露台', '#f0c48c')}
R = []
def r(fl, i, zh, la, x0, y0, x1, y1, t, note=''):
    R.append(dict(floor=fl, id=i, zh=zh, la=la, x0=x0, y0=y0, x1=x1, y1=y1, type=t, note=note))

# ---------------------------------------------------------------- F1 (z 0, 6.5 m floor to floor)
# north block: porch, state atrium, tablinum
r('F1','N01','门厅','vestibulum',-6,44,6,50,'state','北门正对广场，门外是四柱山花门廊。【史】宅第正面加山花（fastigium）是元老院授给凯撒的荣誉（苏维托尼乌斯《凯撒传》81；普鲁塔克《凯撒传》63）')
r('F1','N02','近卫值房','statio',-16,44,-6,50,'guard')
r('F1','N03','门房·唱名官','cella ostiarii',6,44,16,50,'service')
r('F1','N04','西主楼梯','scalae',-27,44,-16,50,'stair','上二层观景长廊')
r('F1','N05','东主楼梯','scalae',16,44,27,50,'stair')
r('F1','N06','朝会中庭','atrium',-13,30,13,44,'state','科林斯式中庭：屋顶四面向内坡，中央天井 11×6 m，十根柱围着蓄水池（impluvium）。晨间问安（salutatio）在这里；高 8.5 m。【史】维特鲁威 6.3.1 的科林斯式中庭')
r('F1','N07','候见厅','',-27,37,-13,44,'state')
r('F1','N08','书记房','',-27,30,-13,37,'office','宫里随侍的书记。【书】秘书处不在宫里：“直接揣着印章下山，大步走进了位于帕拉蒂尼山侧翼的帝国财务秘书处”，放在北坡腰台的办公院')
r('F1','N09','账簿房','',13,37,27,44,'office','宫内日用账。【书】核销房在秘书处里，不在宫里')
r('F1','N10','文书库','',13,30,27,37,'office','【书】金库在“山腹深处”，要骑马去，不在宫里')
r('F1','N11','书房·觐见室','tablinum',-7,22,7,30,'state','在中庭和花园之间，两面敞开。【书】“批完公文”')
r('F1','N12','西过道','fauces',-10,22,-7,30,'corridor')
r('F1','N13','东过道','fauces',7,22,10,30,'corridor')
r('F1','N14','冬季餐室','triclinium hibernum',-27,22,-10,30,'dining')
r('F1','N15','藏书室','bibliotheca',10,22,27,30,'office')
# the peristyle (outer 54 x 38; the garden 45 x 29 = 150 x 100 Roman feet)
r('F1','P01','北柱廊','porticus',-27,17.5,27,22,'portico','两层：上层是二层的走廊')
r('F1','P02','南柱廊','porticus',-27,-16,27,-11.5,'portico')
r('F1','P03','西柱廊','porticus',-27,-11.5,-22.5,17.5,'portico','两层：上层是二层的走廊')
r('F1','P04','东柱廊','porticus',22.5,-11.5,27,17.5,'portico')
r('F1','P05','柱廊花园','viridarium',-22.5,-11.5,22.5,17.5,'garden','【史】中央柱廊院 100×150 罗马尺（约 29.6×44.4 m），水池内壁方龛和半圆龛交替；院下有一圈小暗廊（Tomei、Macaulay）。【书】“尼禄正斜躺在阴凉的柱廊凉亭里，脚边趴着只打盹的猎豹”')
# south block: a double row of rooms with the broad corridor between them
r('F1','S01','花园厅','oecus',-8,-27,8,-16,'state','朝北向花园敞开的大厅')
r('F1','S02','日间小室','cubiculum diurnum',-18,-27,-8,-16,'family')
r('F1','S03','日间小室','cubiculum diurnum',-27,-27,-18,-16,'family')
r('F1','S04','画室','pinacotheca',8,-27,18,-16,'state')
r('F1','S05','家神龛室','sacrarium',18,-27,27,-16,'sacred')
r('F1','C01','大回廊','ambulacrum',-65,-32,65,-27,'corridor','贯通东西 130 m，宽 5 m，大理石地面；西端是侧门，东端通鞍部。【史】柱廊院以南是“中间隔着一条宽走廊的两排房间”。【书】“传令的近卫军军官在长长的回廊里往来奔跑”')
r('F1','S06','南门厅','porta meridiana',-4,-44,4,-32,'state','通帕拉蒂尼广场')
r('F1','S07','卫兵室','statio',-13,-44,-4,-32,'guard')
r('F1','S08','兵器库','armamentarium',-27,-44,-13,-32,'guard')
r('F1','S09','卫兵室','statio',4,-44,13,-32,'guard')
r('F1','S10','军官室','',13,-44,27,-32,'guard','【史·待核】西南面柱廊后的一排房间里有近卫军的涂鸦，年代晚于尼禄')
r('F1','S11','南柱廊','porticus meridiana',-39,-50,44,-44,'portico','【史】西南面是一道柱廊，后面一排房间')
# west block: the emperor's own quarter (south-west), the family rooms, the old house, the bath
r('F1','W02a','私邸门厅','',-65,-38,-53,-32,'private')
r('F1','W02b','暗阁（密室）','',-65,-46,-53,-38,'private','塔楼底层，寝殿正下方，私用楼梯相通。厚石墙，没有窗；东墙两扇带闩的实心厚门开向天井，冬夜的风从这里灌进来。里面一张铺红天鹅绒的石榻，一盏牛油灯。【书】“帕拉蒂尼山内殿暗阁”“尼禄反手关上那两扇实心的厚门”；作者 2026-11-14：密室和暗阁是同一间')
r('F1','W02c','私用楼梯','scalae',-65,-50,-53,-46,'stair')
r('F1','W03','天井','',-53,-44,-39,-32,'court','石板铺地，靠西 5×5 m 土池里是那棵老无花果树，离寝殿的东窗 5.5 m。【书】“砸在天井院落平整的石板上，砸在窗外那棵老无花果树宽大的叶片上”')
r('F1','W04','衣帽库·寝侍','vestiarium',-53,-50,-39,-44,'private')
r('F1','W05','私人餐室','triclinium',-39,-44,-27,-32,'private','朝西向天井开门')
r('F1','W06','夜值房','',-65,-27,-53,-18,'service','单层平顶，屋顶就是二层的露台')
r('F1','W07a','内眷厅','oecus',-65,-18,-53,-7,'family')
r('F1','W07b','内眷寝室','cubicula',-65,-7,-53,4,'family')
r('F1','W08','西侧偏殿','',-65,4,-53,20,'state','单层高厅，东面三道门开向小庭院。【书】偏殿：整个西翼（殿、小庭院、回廊）统称偏殿，这一间是殿，审人、对账都在这里')
r('F1','W09','偏殿前室','',-65,20,-53,28,'state','下地下浴室的楼梯在这里')
r('F1','W11','偏殿库房','',-65,28,-53,34,'service')
r('F1','W12','粮仓','horreum',-65,34,-53,50,'service')
r('F1','W19','祖宅书房','tablinum vetus',-53,-27,-39,-18,'sacred','单层人字顶，西山尖正对露台。山尖上立着那只缺了半边翅膀的旧陶鹰，从露台沿回廊的平顶可以踩上瓦面。【书】')
r('F1','W20','过道','',-53,-18,-39,-14,'corridor')
r('F1','W13','祖宅中庭','atrium vetus',-53,-14,-39,2,'sacred','克劳狄家的老宅中庭，供祖先面具。【史】平台西端下面压着一座共和时期的高台基宅')
r('F1','W16','过道','',-53,2,-39,6,'corridor')
r('F1','W14','西侧偏殿小庭院','',-53,6,-39,28,'court','铺地小院，东北角一棵石榴树；沿西、北两边一道单层柱廊，从大回廊走到院边（【书】“看见我抱着账册从回廊经过”）。【书】“宫殿西侧偏殿的小庭院，角落一棵石榴树”（网页现有标签的原话；第三卷《雨》）')
r('F1','W17','厕所','latrina',-53,28,-39,34,'service')
r('F1','W15','杂役院','',-53,34,-39,44,'court')
r('F1','W18','值事房','officia',-53,44,-39,50,'office')
r('F1','W21','西楼梯','scalae',-39,-27,-27,-16,'stair')
r('F1','W23','寝室','cubiculum',-39,-16,-27,-6,'family')
r('F1','W22','西敞厅','exedra',-39,-6,-27,6,'state','朝东向花园敞开')
r('F1','W24','寝室','cubiculum',-39,6,-27,14,'family')
r('F1','W25','餐室','triclinium',-39,14,-27,22,'dining')
r('F1','W26','抄写室','librarii',-39,22,-27,36,'office')
r('F1','W27','过道','',-39,36,-27,44,'corridor')
r('F1','W28','值事房','officium',-39,44,-27,50,'office')
# east block: the banquet hall with its service, the kitchen, the fish-pond garden
r('F1','E19','赫尔墨斯小厅','diaeta Hermaeum',32,-44,44,-32,'private','朝东向鱼池园敞开，四角攒尖顶。【史】苏维托尼乌斯《克劳狄传》10：公元 41 年克劳狄先躲进名叫 Hermaeum 的小厅，再躲到旁边露台（solarium）的门帘后面')
r('F1','E20','过道·楼梯','',27,-44,32,-32,'stair','上南立面二层')
r('F1','E18','鱼池园','vivarium',44,-50,65,-32,'garden','椭圆鱼池 16×8 m，沿路立赫尔墨斯柱。【史】平台东南角有一座露天的椭圆养鱼池')
r('F1','E05','东楼梯','scalae',27,-27,39,-16,'stair')
r('F1','E02','乐工·侍者候场','',27,-16,39,-6,'service')
r('F1','E01','宴会前厅','procoeton',27,-6,39,6,'dining','西接花园东柱廊，东进大宴会厅')
r('F1','E03','备酒间','',27,6,39,14,'service')
r('F1','E04','备餐间','',27,14,39,22,'service')
r('F1','E13','食品库','cella penaria',27,22,39,34,'service')
r('F1','E14','酒窖','apotheca',27,34,39,44,'service')
r('F1','E16a','总管室','procurator',27,44,39,50,'office')
r('F1','E06','备餐走廊','',39,-27,44,44,'corridor','厨房到宴会厅的仆役通道，平顶')
r('F1','E16b','甜酒工坊','',39,44,52,50,'service','厨院北头，背阴。【书】“后厨和内廷专设的甜酒工坊”“我站在天井当中”')
r('F1','E07','大宴会厅','cenatio',44,-27,60,15,'dining','16×42 m，中厅通高 14.5 m。两排柱把厅分成中厅和两条侧廊，中厅高出侧廊，高处开一排拱窗；檐下一道金饰带。【书】“屋子很长，两边一排一排的柱子，柱子上缠着金箔”“屋顶很高，顶上开着一个方口，能看见夜空。”：中厅屋脊正中开一个 3×3 m 的方口。【史】维特鲁威 6.3.9 的埃及式厅：两层柱，上层柱间开窗')
r('F1','E11','后厨','culina',44,15,60,27,'service','【书】后厨。没有烟囱，屋脊上开通气口')
r('F1','E12','厨院','',44,27,60,44,'court')
r('F1','E16c','角卫房·下花园的楼梯','excubitorium',52,44,65,50,'guard','楼梯下到北面台地花园')
r('F1','E09','东廊','porticus orientalis',60,-27,65,34,'portico')
r('F1','E10','尼禄长廊入口','ostium cryptoporticus',60,34,65,40,'corridor','【史】东侧长 130 m 的尼禄长廊（cryptoporticus）从这里出去，通东宫')
r('F1','E17','厕所','latrina',60,40,65,44,'service')
# ---------------------------------------------------------------- F2 (z 6.5, 4.5 m)
r('F2','L01','观景长廊','loggia',-27,44,27,50,'portico','朝北俯瞰广场的敞廊，54 m 长')
r('F2','2N07','客房','hospitium',-27,37,-13,44,'family')
r('F2','2N08','誊抄室','',-27,30,-13,37,'office')
r('F2','2N09','客房','hospitium',13,37,27,44,'family')
r('F2','2N10','档案上层','',13,30,27,37,'office')
r('F2','2N11','议事厅','consilium',-10,22,10,30,'state','南窗俯瞰花园')
r('F2','2N14','图籍室','',-27,22,-10,30,'office')
r('F2','2N15','藏书上层','',10,22,27,30,'office')
r('F2','2P01','北上层廊','pergula',-27,17.5,27,22,'portico')
r('F2','2P03','西上层廊','pergula',-27,-11.5,-22.5,17.5,'portico')
r('F2','2S01','上层餐室','cenatio superior',-8,-27,8,-16,'dining','北窗俯瞰花园')
r('F2','2S02','客房','',-18,-27,-8,-16,'family')
r('F2','2S03','客房','',-27,-27,-18,-16,'family')
r('F2','2S04','客房','',8,-27,18,-16,'family')
r('F2','2S05','客房','',18,-27,27,-16,'family')
r('F2','2S06','南门楼上厅','',-4,-44,4,-32,'state','南窗对着宫前广场')
r('F2','2S07','军官宿舍','',-13,-44,-4,-32,'guard')
r('F2','2S08','卫队宿舍','',-27,-44,-13,-32,'guard')
r('F2','2S09','军官宿舍','',4,-44,13,-32,'guard')
r('F2','2S10','卫队宿舍','',13,-44,27,-32,'guard')
r('F2','2E20','楼梯','',27,-44,32,-32,'stair')
r('F2','2W05','私人起居室','',-39,-44,-27,-32,'private','在私人餐室楼上，西窗对着天井')
r('F2','2T1','前室','procoeton',-65,-36,-53,-32,'private','北门直通露台')
r('F2','2T2','寝殿（内殿）','cubiculum',-65,-46,-53,-36,'private','卧榻在南头，石案在北头：书里同一间屋先后叫寝殿、内殿、书房。东窗对着天井里的无花果树，西窗望台伯河。东南角一道挂紫绒帷幔的小拱门通“我”的屋子。【书】')
r('F2','2W04','“我”的屋子','',-53,-50,-39,-44,'private','【书】“就在他寝殿隔壁。”“穿过一道挂着厚重紫绒帷幔的小拱门，就是他的卧榻。”北窗对着天井')
r('F2','2T3','私用楼梯','scalae',-65,-50,-53,-46,'stair')
r('F2','SOL','屋顶露台','solarium',-65,-32,-53,-18,'terrace','铺地平顶，四周矮墙，立杆可张遮阳篷。【书】“我在寝殿旁边的屋顶露台上找到了尼禄”。【史】宫里有专管露台遮阳篷的人（praepositus velariorum）')
r('F2','2W07a','内眷寝室','',-65,-18,-53,-7,'family')
r('F2','2W07b','内眷寝室','',-65,-7,-53,4,'family')
r('F2','2W12','阁仓','',-65,34,-53,50,'service')
r('F2','2W18','值事房上层','',-53,44,-39,50,'office')
r('F2','2W21','西楼梯','scalae',-39,-27,-27,-16,'stair')
r('F2','2W23','寝室','',-39,-16,-27,-6,'family')
r('F2','2W22','起居室','',-39,-6,-27,6,'family')
r('F2','2W24','寝室','',-39,6,-27,14,'family')
r('F2','2W25','寝室','',-39,14,-27,22,'family')
r('F2','2W26','抄写室上层','',-39,22,-27,36,'office')
r('F2','2W27','过道','',-39,36,-27,44,'corridor')
r('F2','2W28','值事房上层','',-39,44,-27,50,'office')
r('F2','2E05','东楼梯','scalae',27,-27,39,-16,'stair')
r('F2','2E02','乐工室','',27,-16,39,-6,'service')
r('F2','2E01','乐工楼座','pergula',27,-6,39,6,'dining','朝宴会厅开窗')
r('F2','2E03','仆役寝室','',27,6,39,14,'service')
r('F2','2E04','仆役寝室','',27,14,39,22,'service')
r('F2','2E13','仆役寝室','',27,22,39,34,'service')
r('F2','2E14','库房上层','',27,34,39,44,'service')
r('F2','2E16a','总管寝室','',27,44,39,50,'office')
r('F2','2E16b','仆役房上层','',39,44,52,50,'service')
r('F2','2E16c','角卫房上层','',52,44,65,50,'guard')
# ---------------------------------------------------------------- F3 (z 11.0, 3.8 m): only the tower and the frontispiece
r('F3','3T1','顶层书斋','diaeta',-65,-46,-53,-32,'private','【史】小普林尼《书信》2.17.12–13：塔楼上下各有居室')
r('F3','3T2','私用楼梯','scalae',-65,-50,-53,-46,'stair')
r('F3','3N1','望台','',-6,44,6,50,'state','正面山花，12 m 宽')
# ---------------------------------------------------------------- B1 (z -4): the small cryptoporticus under the peristyle walks
r('B1','B01','秘密回廊（北）','cryptoporticus',-27,17.5,27,22,'corridor','【书】秘密回廊。【史】柱廊院下有一圈小暗廊；从东南角的楼梯下去')
r('B1','B02','秘密回廊（南）','cryptoporticus',-27,-16,27,-11.5,'corridor')
r('B1','B03','秘密回廊（西）','cryptoporticus',-27,-11.5,-22.5,17.5,'corridor')
r('B1','B04','秘密回廊（东）','cryptoporticus',22.5,-11.5,27,17.5,'corridor')
r('B1','B05','地下浴室·热水厅','caldarium',-65,4,-53,13,'bath','【书】地下浴室。在西侧偏殿下面，平台西墙上开三扇拱窗采光。【史】维特鲁威 5.10.1：浴室朝冬季日落的方向；尼禄东宫的遗存也是一处下沉的水庭')
r('B1','B06','地下浴室·温水厅','tepidarium',-65,13,-53,20,'bath')
r('B1','B07','地下浴室·更衣和冷水池','apodyterium',-65,20,-53,28,'bath','楼梯从上面的偏殿前室下来')
r('B1','B08','炉房·柴库','praefurnium',-65,28,-53,34,'service','烟从平台西墙上的一个小口排出')
r('B1','B09','连廊','',-53,6,-27,10,'corridor','从秘密回廊西段通到地下浴室')

# ---------------------------------------------------------------- roof blocks (the massing): every roofed square metre belongs to exactly one
M = []
def m(i, x0, y0, x1, y1, st, eaves, roof, ridge='', note='', over=''):
    M.append(dict(id=i, x0=x0, y0=y0, x1=x1, y1=y1, storeys=st, eaves=eaves, roof=roof, ridge=ridge, note=note, over=over))
m('M01',-53,44,65,50,2,11.0,'gable','EW','北立面一排，东端收成四坡')
m('M02',-6,44,6,50,3,14.8,'gable','NS','望台，北面山花',over='M01')
m('M03',-13,30,13,44,1,8.5,'compluviate','', '朝会中庭，天井 [-5.5,34,5.5,40]')
m('M04',-27,30,-13,44,2,11.0,'hip','EW')
m('M05',13,30,27,44,2,11.0,'hip','EW')
m('M06',-27,22,27,30,2,11.0,'gable','EW')
m('M07',-27,-27,27,-16,2,11.0,'gable','EW')
m('M08',-53,-32,65,-27,1,6.9,'flat','', '大回廊：筒拱上做平顶，四周矮墙')
m('M09',-39,-44,32,-32,2,11.0,'gable','EW','南立面两层，对着宫前广场；正中 8 m 宽的门楼高出 1.2 m，朝南一个山花')
m('M10',-39,-50,44,-44,1,6.0,'lean','S','南柱廊，檐口 4.8')
m('M11',32,-44,44,-32,1,7.5,'pyramid','', '赫尔墨斯小厅')
m('M12',-65,-50,-53,-32,3,14.8,'hip','NS','尼禄的塔楼')
m('M13',-53,-50,-39,-44,2,11.0,'lean','S','两层，檐口 9.7')
m('M14',-65,-32,-53,-18,1,6.5,'flat','', '屋顶露台：矮墙 1.0 m，六根遮阳篷立杆')
m('M15',-53,-27,-39,-18,1,6.5,'gable','EW','西山尖立陶鹰（-53, -22.5）')
m('M16',-65,-18,-53,4,2,11.0,'gable','NS','南端收成四坡')
m('M17',-65,4,-53,34,1,7.5,'gable','NS','西侧偏殿：单层高厅，北端山墙接西北角楼')
m('M18',-65,34,-53,50,2,11.0,'hip','NS')
m('M19',-53,-14,-39,2,1,6.5,'compluviate','', '祖宅中庭，天井 [-48,-8,-44,-4]')
m('M20a',-53,-18,-39,-14,1,6.0,'flat','')
m('M20b',-53,2,-39,6,1,6.0,'flat','')
m('M21',-53,28,-39,34,1,6.0,'lean','N','檐口 4.8')
m('M22',-39,-27,-27,44,2,11.0,'gable','NS')
m('M23',27,-27,39,44,2,11.0,'gable','NS')
m('M24',39,-27,44,44,1,6.0,'flat','', '备餐走廊')
m('M25',47.5,-27,56.5,15,2,14.5,'gable','NS','宴会厅中厅：南北两面山花，高窗，檐下金饰带')
m('M25w',44,-27,47.5,15,1,7.9,'lean','W','宴会厅西侧廊，檐口 6.5')
m('M25e',56.5,-27,60,15,1,7.9,'lean','E','宴会厅东侧廊，檐口 6.5')
m('M26',44,15,60,27,1,6.5,'gable','EW','厨房，屋脊通气口')
m('M27a',60,-27,65,34,1,6.5,'lean','E','东廊，檐口 4.8')
m('M27b',60,34,65,44,1,6.0,'lean','E','檐口 4.8')
m('M28n',-27,17.5,27,22,2,10.4,'lean','S','北柱廊两层，檐口 9.6')
m('M28w',-27,-11.5,-22.5,17.5,2,10.4,'lean','E','西柱廊两层，檐口 9.6')
m('M28s',-27,-16,27,-11.5,1,5.8,'lean','N','南柱廊单层，檐口 4.8')
m('M28e',22.5,-11.5,27,17.5,1,5.8,'lean','W','东柱廊单层，檐口 4.8')
OPEN = ['P05', 'W03', 'W14', 'W15', 'E12', 'E18']               # W14 is the pomegranate court of the west side hall               # F1 rooms open to the sky
FEATURES = [  # things the model and the page place by these numbers
    dict(id='pool', zh='水池（方龛、半圆龛交替）', kind='rect', x0=-15, y0=4, x1=15, y1=13),
    dict(id='tholos', zh='柱廊凉亭（八柱圆亭）', kind='circle', x=0, y=-4, r=4),
    dict(id='basin', zh='圆水盆', kind='circle', x=-18, y=-5, r=2.5),
    dict(id='impluvium', zh='中庭蓄水池', kind='rect', x0=-5.5, y0=34, x1=5.5, y1=40),
    dict(id='impluvium2', zh='祖宅蓄水池', kind='rect', x0=-48, y0=-8, x1=-44, y1=-4),
    dict(id='fig', zh='老无花果树（5×5 m 土池）', kind='rect', x0=-50, y0=-40.5, x1=-45, y1=-35.5),
    dict(id='pome', zh='石榴树（3×3 m 土池）', kind='rect', x0=-42.5, y0=24.5, x1=-39.5, y1=27.5),
    dict(id='fishpond', zh='椭圆鱼池', kind='ellipse', x=54.5, y=-41, rx=8, ry=4),
    dict(id='eagle', zh='缺翅陶鹰', kind='point', x=-53, y=-22.5, z=8.3),
    dict(id='doorN', zh='北门（正门）', kind='door', x=0, y=50, side='N'),
    dict(id='doorW', zh='侧门', kind='door', x=-65, y=-29.5, side='W'),
    dict(id='doorS', zh='南门', kind='door', x=0, y=-50, side='S'),
    dict(id='doorE', zh='东门（通鞍部）', short='东门', kind='door', x=65, y=-29.5, side='E'),
    dict(id='doorNW', zh='杂役院西北门', short='西北门', kind='door', x=-46, y=50, side='N'),
    dict(id='doorC', zh='尼禄长廊入口', short='长廊口', kind='door', x=65, y=35.3, side='E')]

# ---------------------------------------------------------------- checks
def area(a): return (a['x1'] - a['x0']) * (a['y1'] - a['y0'])
def inter(a, b): return max(0.0, min(a['x1'], b['x1']) - max(a['x0'], b['x0'])) * max(0.0, min(a['y1'], b['y1']) - max(a['y0'], b['y0']))
def inside(a, b): return a['x0'] >= b['x0'] - 1e-6 and a['x1'] <= b['x1'] + 1e-6 and a['y0'] >= b['y0'] - 1e-6 and a['y1'] <= b['y1'] + 1e-6
errs = []; byid = {q['id']: q for q in R}
assert len(byid) == len(R), 'duplicate room id'
for q in R:
    if not (X0 <= q['x0'] < q['x1'] <= X1 and Y0 <= q['y0'] < q['y1'] <= Y1): errs.append('out of bounds: ' + q['id'])
    if q['type'] not in TYPES: errs.append('unknown type: ' + q['id'])
for fl in Z:
    L = [q for q in R if q['floor'] == fl]
    for i, a in enumerate(L):
        for b in L[i + 1:]:
            if inter(a, b) > 0.01: errs.append('overlap on %s: %s / %s' % (fl, a['id'], b['id']))
A1 = sum(area(q) for q in R if q['floor'] == 'F1')
if abs(A1 - 13000) > 0.01: errs.append('F1 does not fill 130 x 100: %.1f' % A1)
for i, a in enumerate(M):
    for b in M[i + 1:]:
        if inter(a, b) > 0.01 and b['over'] != a['id'] and a['over'] != b['id']: errs.append('roof blocks overlap: %s / %s' % (a['id'], b['id']))
AO = sum(area(byid[k]) for k in OPEN); AM = sum(area(q) for q in M if not q['over'])
if abs(AO + AM - 13000) > 0.01: errs.append('roofs + open courts do not fill the plan: %.1f + %.1f' % (AM, AO))
for q in M:
    w, d = q['x1'] - q['x0'], q['y1'] - q['y0']
    span = d if q['ridge'] == 'EW' else w if q['ridge'] == 'NS' else min(w, d)
    lim = {'gable': 14, 'hip': 14, 'lean': 7, 'pyramid': 12, 'compluviate': 99, 'flat': 99, 'vault': 12}[q['roof']]
    if q['roof'] == 'lean': span = d if q['ridge'] in 'NS' else w
    if span > lim + 1e-6: errs.append('roof span %.1f over %d m: %s' % (span, lim, q['id']))
    q['span'] = span
    q['ridge_z'] = round(q['eaves'] + (span / 2 * PITCH if q['roof'] in ('gable', 'hip', 'pyramid') else 0), 2)
for q in R:      # an upper room must stand on a block that is tall enough
    if q['floor'] in ('F2', 'F3'):
        need = 2 if q['floor'] == 'F2' else 3
        ok = any(inside(q, b) and (b['storeys'] >= need or (q['type'] == 'terrace' and b['roof'] == 'flat')) for b in M)
        if not ok: errs.append('%s room %s has no block of %d storeys under it' % (q['floor'], q['id'], need))
if errs:
    print('\n'.join(errs)); raise SystemExit(1)
print('checks pass: %d rooms (F1 %d, F2 %d, F3 %d, B1 %d), %d roof blocks, roofed %.0f m2, open %.0f m2' % (
    len(R), *[sum(1 for q in R if q['floor'] == f) for f in ('F1', 'F2', 'F3', 'B1')], len(M), AM, AO))

plan = dict(name='rome_tiberiana', version=2, units='m', axes='x east, y north (front, Forum side), z up; origin = centre of the platform top',
            size=[130, 100], levels=Z, floor_heights=HT, roof_pitch=PITCH,
            types={k: dict(zh=v[0], colour=v[1]) for k, v in TYPES.items()}, rooms=R, roof_blocks=M, open_courts=OPEN, features=FEATURES)
out = os.path.join(ROOT, 'tools', 'models', 'rome', 'tiberiana_plan.json')
json.dump(plan, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', os.path.relpath(out, ROOT))

# ================================================================ drawings
S = 6.0; MG = 52
def px(x): return MG + (x - X0) * S
def py(y): return MG + (Y1 - y) * S
def esc(s): return html.escape(s, quote=True)
def frame(inner, title):
    w, h = 130 * S + 2 * MG, 100 * S + 2 * MG
    edge = ('<text x="%g" y="20" class="edge" text-anchor="middle">北 · 罗马广场（正面）</text><text x="%g" y="%g" class="edge" text-anchor="middle">南 · 帕拉蒂尼广场</text>'
            '<text transform="translate(18,%g) rotate(-90)" class="edge" text-anchor="middle">西 · 韦拉布鲁姆、台伯河</text><text transform="translate(%g,%g) rotate(90)" class="edge" text-anchor="middle">东 · 鞍部、尼禄长廊</text>'
            % (w / 2, w / 2, h - 10, h / 2, w - 18, h / 2))
    bar = '<g transform="translate(%g,%g)"><path d="M0 0h%gv-5h-%gz" fill="#333"/><path d="M%g 0h%gv-5h-%gz" fill="#fff" stroke="#333"/><text x="0" y="13" class="tiny">0</text><text x="%g" y="13" class="tiny">10</text><text x="%g" y="13" class="tiny">20 m</text></g>' % (
        MG, h - 30, 10 * S, 10 * S, 10 * S, 10 * S, 10 * S, 10 * S - 6, 20 * S - 6)
    return '<svg viewBox="0 0 %g %g" role="img" aria-label="%s"><rect x="%g" y="%g" width="%g" height="%g" class="plate"/>%s%s%s</svg>' % (w, h, esc(title), px(X0), py(Y1), 130 * S, 100 * S, inner, edge, bar)
def label(q, cls=''):
    w, h = (q['x1'] - q['x0']) * S, (q['y1'] - q['y0']) * S; cx, cy = px((q['x0'] + q['x1']) / 2), py((q['y0'] + q['y1']) / 2); n = len(q['zh'])
    if q['id'] in ('P05', 'N06', 'W13', 'E18'): cy = py(q['y1']) + 17
    if w >= n * 11.5 + 6 and h >= 30: return '<text x="%g" y="%g" class="nm %s">%s</text><text x="%g" y="%g" class="rid %s">%s</text>' % (cx, cy - 1, cls, esc(q['zh']), cx, cy + 12, cls, q['id'])
    if h >= n * 11.5 + 18 and w >= 16: return '<text transform="translate(%g,%g)" class="nm vert %s">%s</text><text x="%g" y="%g" class="rid %s">%s</text>' % (cx, cy - 8, cls, esc(q['zh']), cx, py(q['y0']) - 5, cls, q['id'])
    if w >= 22 and h >= 13: return '<text x="%g" y="%g" class="rid %s">%s</text>' % (cx, cy + 4, cls, q['id'])
    return ''
def room_rect(q, extra=''):
    tip = '%s %s%s｜%s｜%g × %g m%s' % (q['id'], q['zh'], ('（' + q['la'] + '）') if q['la'] else '', TYPES[q['type']][0], q['x1'] - q['x0'], q['y1'] - q['y0'], ('｜' + q['note']) if q['note'] else '')
    return '<g class="room" data-id="%s"><title>%s</title><rect x="%g" y="%g" width="%g" height="%g" fill="%s" %s/>%s</g>' % (
        q['id'], esc(tip), px(q['x0']), py(q['y1']), (q['x1'] - q['x0']) * S, (q['y1'] - q['y0']) * S, TYPES[q['type']][1], extra, label(q))
def feat(fl):
    o = []
    for f in FEATURES:
        if f['kind'] == 'door':
            if fl != 'F1': continue
            x, y = px(f['x']), py(f['y']); dx, dy = {'N': (0, -1), 'S': (0, 1), 'W': (-1, 0), 'E': (1, 0)}[f['side']]
            o.append('<path d="M%g %gL%g %gL%g %gZ" class="door"><title>%s</title></path>' % (x + dx * 16, y + dy * 16, x - dy * 8 + dx * 2, y + dx * 8 + dy * 2, x + dy * 8 + dx * 2, y - dx * 8 + dy * 2, esc(f['zh'])))
            if dx: o.append('<text x="%g" y="%g" class="tiny" text-anchor="middle">%s</text>' % (x + dx * 26, y - 12, esc(f.get('short', f['zh']))))
        elif fl == 'F1' and f['kind'] == 'rect':
            cls = 'tree' if f['id'] in ('fig', 'pome') else 'water'
            o.append('<rect x="%g" y="%g" width="%g" height="%g" class="%s"><title>%s</title></rect>' % (px(f['x0']), py(f['y1']), (f['x1'] - f['x0']) * S, (f['y1'] - f['y0']) * S, cls, esc(f['zh'])))
        elif fl == 'F1' and f['kind'] == 'circle':
            o.append('<circle cx="%g" cy="%g" r="%g" class="%s"><title>%s</title></circle>' % (px(f['x']), py(f['y']), f['r'] * S, 'water' if f['id'] == 'basin' else 'pav', esc(f['zh'])))
        elif fl == 'F1' and f['kind'] == 'ellipse':
            o.append('<ellipse cx="%g" cy="%g" rx="%g" ry="%g" class="water"><title>%s</title></ellipse>' % (px(f['x']), py(f['y']), f['rx'] * S, f['ry'] * S, esc(f['zh'])))
        elif f['kind'] == 'point' and fl in ('F2', 'ROOF'):
            o.append('<path d="M%g %gl6 10h-12z" class="eagle"><title>%s</title></path><text x="%g" y="%g" class="tiny">陶鹰</text>' % (px(f['x']), py(f['y']) - 6, esc(f['zh']), px(f['x']) + 8, py(f['y']) + 4))
    return ''.join(o)
def floor_svg(fl):
    o = []
    if fl != 'F1':   # what is below, faint: the lower roofs you look down on
        for q in R:
            if q['floor'] == 'F1': o.append('<rect x="%g" y="%g" width="%g" height="%g" class="%s"/>' % (px(q['x0']), py(q['y1']), (q['x1'] - q['x0']) * S, (q['y1'] - q['y0']) * S, 'ghost open' if q['id'] in OPEN else 'ghost'))
    for q in R:
        if q['floor'] == fl: o.append(room_rect(q, 'class="open"' if q['id'] in OPEN else ''))
    o.append(feat(fl))
    return frame(''.join(o), {'F1': '一层', 'F2': '二层', 'F3': '三层', 'B1': '地下'}[fl])
ROOFCOL = {'gable': '#c8623f', 'hip': '#c8623f', 'lean': '#d17a55', 'pyramid': '#c8623f', 'compluviate': '#bd5a3a', 'flat': '#dccba6', 'vault': '#cdbda6'}
ROOFZH = {'gable': '人字顶', 'hip': '四坡顶', 'lean': '单坡披檐', 'pyramid': '攒尖顶', 'compluviate': '内坡天井顶', 'flat': '平顶', 'vault': '筒拱顶'}
def roof_svg():
    o = []
    for k in OPEN:
        q = byid[k]; o.append('<rect x="%g" y="%g" width="%g" height="%g" fill="%s" class="open"><title>%s（露天）</title></rect>' % (px(q['x0']), py(q['y1']), (q['x1'] - q['x0']) * S, (q['y1'] - q['y0']) * S, TYPES[q['type']][1], esc(q['zh'])))
    for b in sorted(M, key=lambda b: b['eaves']):
        x0, y0, x1, y1 = px(b['x0']), py(b['y1']), px(b['x1']), py(b['y0']); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; w, h = x1 - x0, y1 - y0
        tip = '%s｜%s｜%d 层｜檐口 %.1f m%s｜%s' % (b['id'], ROOFZH[b['roof']], b['storeys'], b['eaves'], ('，屋脊 %.1f m' % b['ridge_z']) if b['ridge_z'] > b['eaves'] else '', b['note'])
        g = ['<g class="rb"><title>%s</title><rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>' % (esc(tip), x0, y0, w, h, ROOFCOL[b['roof']])]
        if b['roof'] == 'gable': g.append('<path class="ridge" d="M%g %gL%g %g"/>' % ((x0, cy, x1, cy) if b['ridge'] == 'EW' else (cx, y0, cx, y1)))
        elif b['roof'] == 'hip':
            if b['ridge'] == 'EW': k = h / 2; g.append('<path class="ridge" d="M%g %gL%g %gM%g %gL%g %gL%g %gM%g %gL%g %gL%g %g"/>' % (x0 + k, cy, x1 - k, cy, x0, y0, x0 + k, cy, x0, y1, x1, y0, x1 - k, cy, x1, y1))
            else: k = w / 2; g.append('<path class="ridge" d="M%g %gL%g %gM%g %gL%g %gL%g %gM%g %gL%g %gL%g %g"/>' % (cx, y0 + k, cx, y1 - k, x0, y0, cx, y0 + k, x1, y0, x0, y1, cx, y1 - k, x1, y1))
        elif b['roof'] == 'pyramid': g.append('<path class="ridge" d="M%g %gL%g %gM%g %gL%g %g"/>' % (x0, y0, x1, y1, x1, y0, x0, y1))
        elif b['roof'] == 'compluviate':
            ow, oh = min(8 * S, w * .34), min(5 * S, h * .36); g.append('<rect x="%g" y="%g" width="%g" height="%g" class="hole"/><path class="ridge" d="M%g %gL%g %gM%g %gL%g %gM%g %gL%g %gM%g %gL%g %g"/>' % (
                cx - ow / 2, cy - oh / 2, ow, oh, x0, y0, cx - ow / 2, cy - oh / 2, x1, y0, cx + ow / 2, cy - oh / 2, x0, y1, cx - ow / 2, cy + oh / 2, x1, y1, cx + ow / 2, cy + oh / 2))
        elif b['roof'] == 'lean':
            dx, dy = {'N': (0, -1), 'S': (0, 1), 'W': (-1, 0), 'E': (1, 0)}[b['ridge']]; n = max(1, int((w if dy else h) / 70))
            for i in range(n):
                t = (i + .5) / n; ax, ay = (x0 + w * t, cy) if dy else (cx, y0 + h * t); L = min(9, (h if dy else w) * .32)
                g.append('<path class="arrow" d="M%g %gL%g %gM%g %gL%g %gL%g %g"/>' % (ax - dx * L, ay - dy * L, ax + dx * L, ay + dy * L, ax + dx * L - dx * 4 - dy * 3, ay + dy * L - dy * 4 + dx * 3, ax + dx * L, ay + dy * L, ax + dx * L - dx * 4 + dy * 3, ay + dy * L - dy * 4 - dx * 3))
        elif b['roof'] == 'vault':
            for i in range(1, 6): g.append('<path class="ridge thin" d="M%g %gL%g %g"/>' % (x0, y0 + h * i / 6, x1, y0 + h * i / 6))
        if w > 44 and h > 16: g.append('<text x="%g" y="%g" class="rid">%s %.4g</text>' % (cx, cy + (14 if b['roof'] in ('gable', 'hip') and b['ridge'] == 'EW' else 4), b['id'], b['eaves']))
        elif h > 60 and w > 14: g.append('<text transform="translate(%g,%g) rotate(-90)" class="rid">%s %.4g</text>' % (cx + (11 if b['ridge'] == 'NS' and b['roof'] in ('gable', 'hip') else 4), cy, b['id'], b['eaves']))
        o.append(''.join(g) + '</g>')
    o.append(feat('ROOF'))
    return frame(''.join(o), '屋顶')
# ---- the floors taken apart: a view from the south-east, each level its own group
AS = 4.3
def ap(x, y, z): return (0.866 * (x + y) * AS, -(0.5 * (y - x) + z) * AS)
def poly(P, cls, fill=None, tip=None): return '<polygon points="%s" class="%s"%s>%s</polygon>' % (' '.join('%.1f,%.1f' % p for p in P), cls, (' fill="%s"' % fill) if fill else '', ('<title>%s</title>' % esc(tip)) if tip else '')
def shade(c, k):
    v = [int(c[i:i + 2], 16) for i in (1, 3, 5)]; return '#%02x%02x%02x' % tuple(max(0, min(255, int(a * k))) for a in v)
def axo_floor(fl):
    z = Z[fl]; o = []; wh = 1.7
    for q in sorted((q for q in R if q['floor'] == fl), key=lambda q: -((q['y0'] + q['y1']) / 2 - (q['x0'] + q['x1']) / 2)):
        c = TYPES[q['type']][1]; x0, y0, x1, y1 = q['x0'], q['y0'], q['x1'], q['y1']
        o.append(poly([ap(x0, y0, z), ap(x1, y0, z), ap(x1, y1, z), ap(x0, y1, z)], 'pl', c, '%s %s' % (q['id'], q['zh'])))
        if q['id'] not in OPEN and q['type'] not in ('terrace',):
            o.append(poly([ap(x0, y1, z), ap(x1, y1, z), ap(x1, y1, z + wh), ap(x0, y1, z + wh)], 'wl', shade('#f3ead8', .97)))
            o.append(poly([ap(x0, y0, z), ap(x0, y1, z), ap(x0, y1, z + wh), ap(x0, y0, z + wh)], 'wl', shade('#f3ead8', .86)))
    return ''.join(o)
def axo_roof():
    o = []
    for b in sorted(M, key=lambda b: (-((b['y0'] + b['y1']) / 2 - (b['x0'] + b['x1']) / 2), b['eaves'])):
        x0, y0, x1, y1, e, rz = b['x0'], b['y0'], b['x1'], b['y1'], b['eaves'], b['ridge_z']; c = ROOFCOL[b['roof']]; xc, yc = (x0 + x1) / 2, (y0 + y1) / 2; t = '%s %s' % (b['id'], ROOFZH[b['roof']])
        if b['roof'] in ('gable', 'hip'):
            k = (min(x1 - x0, y1 - y0) / 2) if b['roof'] == 'hip' else 0
            if b['ridge'] == 'EW':
                a, d = (x0 + k, yc, rz), (x1 - k, yc, rz)
                o.append(poly([ap(x0, y1, e), ap(x1, y1, e), ap(*d), ap(*a)], 'rf', shade(c, .8), t)); o.append(poly([ap(x0, y0, e), ap(x1, y0, e), ap(*d), ap(*a)], 'rf', c, t))
                o.append(poly([ap(x1, y0, e), ap(x1, y1, e), ap(*d)], 'rf', shade(c if k else '#f3ead8', .9), t))
            else:
                a, d = (xc, y0 + k, rz), (xc, y1 - k, rz)
                o.append(poly([ap(x0, y0, e), ap(x0, y1, e), ap(*d), ap(*a)], 'rf', shade(c, .8), t)); o.append(poly([ap(x1, y0, e), ap(x1, y1, e), ap(*d), ap(*a)], 'rf', c, t))
                o.append(poly([ap(x0, y0, e), ap(x1, y0, e), ap(*a)], 'rf', shade(c if k else '#f3ead8', .9), t))
        elif b['roof'] == 'pyramid':
            top = (xc, yc, rz)
            for P, kk in (([(x0, y1, e), (x1, y1, e), top], .8), ([(x0, y0, e), (x0, y1, e), top], .75), ([(x1, y0, e), (x1, y1, e), top], 1), ([(x0, y0, e), (x1, y0, e), top], .92)): o.append(poly([ap(*p) for p in P], 'rf', shade(c, kk), t))
        elif b['roof'] == 'lean':
            lo = e - (b['span'] * 0.24); zz = {'S': (lo, lo, e, e), 'N': (e, e, lo, lo), 'E': (e, lo, lo, e), 'W': (lo, e, e, lo)}[b['ridge']]
            o.append(poly([ap(x0, y0, zz[0]), ap(x1, y0, zz[1]), ap(x1, y1, zz[2]), ap(x0, y1, zz[3])], 'rf', shade(c, .95), t))
        elif b['roof'] == 'compluviate':
            hx, hy = min(4, (x1 - x0) * .17), min(2.5, (y1 - y0) * .18); lo = e - 1.4
            I = [(xc - hx, yc - hy, lo), (xc + hx, yc - hy, lo), (xc + hx, yc + hy, lo), (xc - hx, yc + hy, lo)]; O = [(x0, y0, e), (x1, y0, e), (x1, y1, e), (x0, y1, e)]
            for i, kk in ((2, .8), (3, .75), (1, 1), (0, .92)): j = (i + 1) % 4; o.append(poly([ap(*O[i]), ap(*O[j]), ap(*I[j]), ap(*I[i])], 'rf', shade(c, kk), t))
        else:
            o.append(poly([ap(x0, y0, e), ap(x1, y0, e), ap(x1, y1, e), ap(x0, y1, e)], 'rf', c, t))
    return ''.join(o)
def axo_svg():
    gap = 24.0; lv = [('F1', 1), ('F2', 2), ('F3', 3)]
    w = 0.866 * 230 * AS + 40; top = (0.5 * 115 + 19 + 3 * gap) * AS + 12; bot = 0.5 * 115 * AS + 12
    g = ['<g class="lv" style="--i:%d" data-fl="%s">%s</g>' % (i - 1, fl, axo_floor(fl)) for fl, i in lv]
    g.append('<g class="lv" style="--i:3" data-fl="ROOF">%s</g>' % axo_roof())
    return '<svg id="axo" viewBox="%g %g %g %g" style="--gap:%gpx" role="img" aria-label="分层拆开图">%s</svg>' % (-w / 2, -top, w, top + bot, gap * AS, ''.join(g))

def table():
    o = ['<table><thead><tr><th>编号</th><th>名称</th><th>拉丁名</th><th>功能</th><th>尺寸 (m)</th><th>依据与备注</th></tr></thead><tbody>']
    for fl, zh in (('F1', '一层（地面 0，层高 6.5 m）'), ('F2', '二层（地面 +6.5，层高 4.5 m）'), ('F3', '三层（地面 +11.0，层高 3.8 m）'), ('B1', '地下（-4.0）')):
        o.append('<tr class="fl"><td colspan="6">%s</td></tr>' % zh)
        for q in R:
            if q['floor'] == fl: o.append('<tr><td>%s</td><td><i style="background:%s"></i>%s</td><td class="la">%s</td><td>%s</td><td>%g × %g</td><td>%s</td></tr>' % (
                q['id'], TYPES[q['type']][1], esc(q['zh']), esc(q['la']), TYPES[q['type']][0], q['x1'] - q['x0'], q['y1'] - q['y0'], esc(q['note'])))
    return ''.join(o) + '</tbody></table>'
legend = ''.join('<span><i style="background:%s"></i>%s</span>' % (v[1], v[0]) for v in TYPES.values())
PAGE = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>提比略宫 · 分层功能平面</title><style>
:root{--ink:#2b2622;--mut:#6f665c;--line:#3a322b;--bg:#faf7f1;--card:#fff;--acc:#8a2f1d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,"PingFang SC","Hiragino Sans GB","Noto Sans SC",sans-serif}
main{max-width:1060px;margin:0 auto;padding:20px 16px 60px}h1{font-size:22px;margin:4px 0 2px}p.sub{color:var(--mut);margin:0 0 14px}
.tabs{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.tabs button{font:inherit;padding:6px 14px;border:1px solid #cfc6b8;background:var(--card);border-radius:999px;cursor:pointer;color:var(--ink)}
.tabs button[aria-selected=true]{background:var(--acc);border-color:var(--acc);color:#fff}
.pane{display:none;background:var(--card);border:1px solid #e2dacd;border-radius:10px;padding:8px}.pane.on{display:block}svg{width:100%;height:auto;display:block}
.plate{fill:#f4efe6;stroke:var(--line);stroke-width:2.4}.room rect{stroke:var(--line);stroke-width:1.1}.room:hover rect{stroke:#000;stroke-width:2.6}.open{stroke-dasharray:5 3}
.ghost{fill:#e9e2d6;stroke:#d5ccbd;stroke-width:.6}.ghost.open{fill:#e3ecd9}
text{font:11px -apple-system,"PingFang SC","Hiragino Sans GB",sans-serif;fill:#1d1916;pointer-events:none}.nm{text-anchor:middle;font-size:11.5px;font-weight:600}.rid{text-anchor:middle;font-size:9.5px;fill:#3d362f}
.vert{writing-mode:vertical-rl;text-anchor:middle}.edge{font-size:12.5px;fill:var(--mut)}.tiny{font-size:10px;fill:var(--mut)}
.water{fill:#7fc4e8;stroke:#2e7fa8;stroke-width:1}.pav{fill:#e9b9a0;stroke:#8a2f1d;stroke-width:1.2}.tree{fill:#3f8f3a;stroke:#225a20}.door{fill:var(--acc)}.eagle{fill:#5a2d14}
.rb rect{stroke:var(--line);stroke-width:1.1}.ridge{stroke:#5e2414;stroke-width:1.6;fill:none}.ridge.thin{stroke-width:.7}.arrow{stroke:#5e2414;stroke-width:1.2;fill:none}.hole{fill:#f4efe6;stroke:#5e2414}
.pl{stroke:#3a322b;stroke-width:.5}.wl{stroke:#b9ad9a;stroke-width:.4}.rf{stroke:#6b2a18;stroke-width:.5}
#axo .lv{transform:translateY(calc(var(--i) * var(--k,1) * var(--gap) * -1));transition:transform .15s}
.ctl{display:flex;flex-wrap:wrap;gap:14px;align-items:center;padding:6px 8px;color:var(--mut)}.ctl input[type=range]{width:240px}.ctl label{display:flex;gap:5px;align-items:center}
.legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:12px 2px;font-size:13px}i{display:inline-block;width:12px;height:12px;border:1px solid #0003;border-radius:2px;margin-right:5px;vertical-align:-1px}
.note{background:#fff;border:1px solid #e2dacd;border-left:4px solid var(--acc);border-radius:6px;padding:10px 14px;margin:12px 0}.note ul{margin:4px 0;padding-left:20px}
table{border-collapse:collapse;width:100%;font-size:13px;background:#fff}th,td{border-bottom:1px solid #ebe4d8;padding:5px 8px;text-align:left;vertical-align:top}th{position:sticky;top:0;background:#f1ebe0}
tr.fl td{background:#f6f0e4;font-weight:700}td.la{font-style:italic;color:var(--mut)}.wrap{overflow-x:auto;border:1px solid #e2dacd;border-radius:10px}
</style></head><body><main>
<h1>提比略宫（尼禄的皇宫）· 分层功能平面</h1>
<p class="sub">方案 v2，2026-11-11。平台 130 × 100 m，正面朝北对着罗马广场。把鼠标放到房间上看名称、尺寸和依据。数据文件：<code>tools/models/rome/tiberiana_plan.json</code></p>
<div class="note"><b>这一版定下的规矩</b><ul>
<li>最高三层，只有两处到三层：西南角尼禄的塔楼和北面正中的望台。其余两层或一层。</li>
<li>一层做高：6.5 m；二层 4.5 m；三层 3.8 m。朝会中庭 8.5 m，大宴会厅中厅 14.5 m。</li>
<li>屋顶按一排房一条脊拆开：每条人字顶跨度不超过 14 m（现在的模型是 28–33 m 一整片）。柱廊用单坡披檐，中庭用内坡天井顶，露台和回廊是平顶，浴室是筒拱。坡度约 22°。</li>
<li>没有烟囱，没有老虎窗。采光靠院子、天井、高侧窗和二层的普通窗。</li>
<li>六个露天院子把大体量切开：柱廊花园、天井（无花果树）、西侧偏殿小庭院（石榴树）、杂役院、厨院、鱼池园。</li>
<li>小说点名的房间都有位置：寝殿（内殿）和隔壁“我”的屋子、暗阁（密室）、屋顶露台、大餐厅、西侧偏殿和小庭院、后厨、甜酒工坊、地下浴室、秘密回廊。秘书处、核销房、金库不在宫里。“内殿”指西南角塔楼这一组：楼下暗阁，楼上寝殿。</li></ul></div>
<div class="tabs" role="tablist">__TABS__</div>
__PANES__
<div class="legend">__LEGEND__</div>
<h2 style="font-size:17px;margin:22px 0 8px">房间表</h2><div class="wrap">__TABLE__</div>
</main><script>
const tabs=[...document.querySelectorAll('.tabs button')],panes=[...document.querySelectorAll('.pane')];
tabs.forEach((b,i)=>b.onclick=()=>{tabs.forEach((t,j)=>t.setAttribute('aria-selected',i===j));panes.forEach((p,j)=>p.classList.toggle('on',i===j));});
const ax=document.getElementById('axo'),k=document.getElementById('k');if(k){const f=()=>ax.style.setProperty('--k',k.value);k.oninput=f;f();}
document.querySelectorAll('.ctl input[type=checkbox]').forEach(c=>c.onchange=()=>{ax.querySelector('[data-fl="'+c.value+'"]').style.display=c.checked?'':'none';});
</script></body></html>'''
names = [('拆开看', None), ('一层', 'F1'), ('二层', 'F2'), ('三层', 'F3'), ('屋顶', 'ROOF'), ('地下', 'B1')]
tabs = ''.join('<button role="tab" aria-selected="%s">%s</button>' % ('true' if i == 0 else 'false', n) for i, (n, _) in enumerate(names))
ctl = '<div class="ctl"><label>拆开 <input id="k" type="range" min="0" max="1" step="0.01" value="1"> 合上</label>' + ''.join(
    '<label><input type="checkbox" value="%s" checked>%s</label>' % (v, n) for n, v in (('屋顶', 'ROOF'), ('三层', 'F3'), ('二层', 'F2'), ('一层', 'F1'))) + '<span>从东南往西北看；房间只画了后面两道矮墙</span></div>'
ctl = ctl.replace('拆开 <input', '合上 <input').replace('> 合上</label>', '> 拆开</label>')
panes = ''.join('<div class="pane%s">%s</div>' % (' on' if i == 0 else '', (ctl + axo_svg()) if v is None else roof_svg() if v == 'ROOF' else floor_svg(v)) for i, (n, v) in enumerate(names))
page = PAGE.replace('__TABS__', tabs).replace('__PANES__', panes).replace('__LEGEND__', legend).replace('__TABLE__', table())
out2 = os.path.join(ROOT, 'briefs', 'rome', 'plans', 'tiberiana-plan.html'); open(out2, 'w', encoding='utf-8').write(page); print('wrote', os.path.relpath(out2, ROOT), len(page), 'bytes')

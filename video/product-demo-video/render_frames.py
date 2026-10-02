from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

ROOT = Path(__file__).parent
FRAME_DIR = ROOT / "work" / "frames"
FRAME_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1920, 1080
BG = "#E9E8E2"
SURFACE = "#FBFAF7"
SOFT = "#F2F0EA"
INK = "#18211E"
MUTED = "#65706B"
LINE = "#D8D7CF"
GREEN = "#284C43"
GREEN_DARK = "#173A33"
GREEN_SOFT = "#E4ECE8"
BRONZE = "#8A6033"
BRONZE_SOFT = "#F3EBDD"
SLATE = "#536B78"
ALERT = "#9A6C30"

FONT_PATH = "/System/Library/Fonts/STHeiti Medium.ttc"


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


F12, F14, F16, F18, F20, F24, F28, F34, F44, F64 = [font(x) for x in (12,14,16,18,20,24,28,34,44,64)]


def rr(d, box, r, fill, outline=None, width=1):
    d.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)


def wrap(d, text, f, max_width):
    lines, current = [], ""
    for ch in text:
        test = current + ch
        if d.textlength(test, font=f) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = ch
    if current:
        lines.append(current)
    return lines


def paragraph(d, xy, text, f, fill, max_width, spacing=8, max_lines=3):
    x, y = xy
    lines = wrap(d, text, f, max_width)[:max_lines]
    for line in lines:
        d.text((x, y), line, font=f, fill=fill)
        y += f.size + spacing
    return y


def label(d, x, y, text, color=GREEN, fill=GREEN_SOFT):
    tw = d.textlength(text, font=F14)
    rr(d, (x, y, x+tw+22, y+30), 15, fill)
    d.text((x+11, y+7), text, font=F14, fill=color)


def avatar(d, x, y, char, color):
    rr(d, (x, y, x+48, y+48), 13, color)
    bbox = d.textbbox((0,0), char, font=F18)
    d.text((x+24-(bbox[2]-bbox[0])/2, y+24-(bbox[3]-bbox[1])/2-2), char, font=F18, fill="white")


def message(d, y, who, char, source, text, color=GREEN, kind="human", accent=None):
    x0 = 165
    d.text((x0, y+8), source, font=F12, fill=MUTED)
    avatar(d, x0+88, y, char, color)
    bx = x0+150
    bh = 100 if len(text) < 50 else 126
    fill = SURFACE
    outline = LINE
    if kind == "ai":
        fill, outline = "#F1F6F3", "#ABC2B7"
    elif kind == "metric":
        fill, outline = "#F8F1E7", "#D8C5A7"
    elif kind == "decision":
        fill, outline = "#EEF5F1", "#92B2A3"
    rr(d, (bx, y, 1222, y+bh), 14, fill, outline, 2)
    d.text((bx+20, y+15), who, font=F16, fill=GREEN_DARK if kind in ("ai","decision") else INK)
    if accent:
        label(d, 1090, y+12, accent)
    paragraph(d, (bx+20, y+47), text, F18, "#2E3834", 790, 7, 3)
    return y+bh+16


def output_card(d, y, eyebrow, title, body, tone="normal"):
    x1, x2 = 1292, 1878
    fill, outline, icon_fill, icon = SURFACE, LINE, GREEN_SOFT, "✦"
    if tone == "green":
        fill, outline, icon = "#EFF5F1", "#A6BDB2", "✓"
    elif tone == "bronze":
        fill, outline, icon_fill, icon = "#F8F1E6", "#D4B990", BRONZE_SOFT, "!"
    rr(d, (x1, y, x2, y+150), 16, fill, outline, 2)
    rr(d, (x1+20, y+20, x1+68, y+68), 12, icon_fill)
    d.text((x1+36, y+29), icon, font=F18, fill=GREEN if tone != "bronze" else ALERT)
    d.text((x1+84, y+21), eyebrow.upper(), font=F12, fill=GREEN)
    d.text((x1+84, y+45), title, font=F20, fill=INK)
    paragraph(d, (x1+20, y+88), body, F14, MUTED, 540, 5, 2)
    return y+164


def base_ui(title, stage, stage_title, date="今天 09:02"):
    im = Image.new("RGB", (W,H), BG)
    d = ImageDraw.Draw(im)
    rr(d, (20,18,W-20,H-22), 24, SURFACE, LINE, 2)
    d.rectangle((20,18,118,H-22), fill=SOFT)
    d.line((118,18,118,H-22), fill=LINE, width=2)
    # brand
    rr(d,(49,45,89,85),11,SURFACE,GREEN,2)
    for x,h in ((61,12),(69,22),(77,16)):
        d.rounded_rectangle((x,65-h/2,x+3,65+h/2),2,fill=GREEN)
    # stages
    for i,yy in enumerate((166,244,322),1):
        active = i==stage
        rr(d,(43,yy,95,yy+52),13,GREEN if active else "#E5E3DD")
        d.text((57,yy+15),f"0{i}",font=F14,fill="white" if active else MUTED)
    avatar(d,50,920,"孙",GREEN)
    # center and right split
    d.line((1250,18,1250,H-22),fill=LINE,width=2)
    d.line((118,103,1900,103),fill=LINE,width=2)
    d.text((155,42),"DISCUSSION SPACE",font=F12,fill=GREEN)
    d.text((155,65),title,font=F24,fill=INK)
    d.text((430,70),date,font=F14,fill=MUTED)
    d.ellipse((1083,59,1095,71),fill=GREEN)
    d.text((1103,56),"AI 实时整理已开启",font=F14,fill=MUTED)
    rr(d,(1164,44,1227,82),10,GREEN)
    d.text((1178,55),"演示",font=F14,fill="white")
    d.text((1287,42),"LIVE SYNTHESIS",font=F12,fill=GREEN)
    d.text((1287,66),"AI 实时整理",font=F24,fill=INK)
    d.text((155,126),f"第{stage}段",font=F12,fill=BRONZE)
    d.text((155,151),stage_title,font=F28,fill=INK)
    d.line((118,196,1250,196),fill=LINE,width=2)
    # composer
    d.line((118,938,1250,938),fill=LINE,width=2)
    rr(d,(155,960,1025,1016),12,SURFACE,"#C5C7C0",2)
    d.text((177,978),"发送消息，或 @织见机器人 邀请 AI 参与",font=F16,fill=MUTED)
    rr(d,(1040,960,1135,1016),12,GREEN_SOFT)
    d.text((1052,978),"@ 机器人",font=F14,fill=GREEN)
    rr(d,(1147,960,1227,1016),12,GREEN)
    d.text((1164,978),"语音",font=F14,fill="white")
    return im,d


def title_frame(main, sub, kicker="织见 · 多模态决策记忆"):
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    # subtle blocks
    rr(d,(100,80,1820,1000),40,SURFACE,LINE,2)
    d.text((160,145),kicker,font=F20,fill=GREEN)
    paragraph(d,(160,285),main,F64,INK,1420,22,3)
    paragraph(d,(165,570),sub,F28,MUTED,1120,16,4)
    # decorative timeline
    d.line((1450,220,1450,830),fill="#B8C6BF",width=4)
    for y,c in ((290,GREEN),(450,BRONZE),(610,SLATE),(770,GREEN)):
        d.ellipse((1437,y-13,1463,y+13),fill=SURFACE,outline=c,width=5)
        rr(d,(1500,y-35,1710,y+35),16,GREEN_SOFT if c==GREEN else SOFT)
    return im


def pain_frame():
    im=title_frame("讨论散落在不同地方", "群聊、会议、文件和线下交流各自留下碎片。最后的决定还在，形成决定的过程却消失了。", "问题从这里开始")
    d=ImageDraw.Draw(im)
    items=[("群聊","零散观点",GREEN),("会议","关键转折",SLATE),("文件","用户证据",BRONZE),("线下","补充意见","#766B83")]
    for i,(a,b,c) in enumerate(items):
        x=170+i*285; y=760+(i%2)*55
        rr(d,(x,y,x+240,y+88),18,SOFT,LINE,2)
        d.ellipse((x+18,y+25,x+50,y+57),fill=c)
        d.text((x+65,y+17),a,font=F18,fill=INK); d.text((x+65,y+48),b,font=F14,fill=MUTED)
    return im


def timeline_frame():
    im,d=base_ui("产品方向讨论",1,"所有想法按发生顺序进入这里")
    y=232
    y=message(d,y,"孙宇杰","孙","09:02 · 群聊","第一版先做网页还是小程序？今天把理由、风险和判断条件谈清楚。")
    y=message(d,y,"张轩灏","张","09:05 · 线上语音","网页上线更快，可以先验证核心流程。",SLATE)
    y=message(d,y,"卢格妤","卢","09:08 · 文件","9 月用户访谈摘录.pdf 已进入讨论上下文。",BRONZE)
    output_card(d,132,"统一时间线","来源清晰，不会混淆","群聊 · 线上语音 · 文件 · 线下补充", "green")
    output_card(d,296,"上下文关联","围绕同一个问题展开","保留成员、时间、来源和引用关系")
    return im


def product_frame(scene):
    stage = 1 if scene <= 6 else (2 if scene <= 11 else 3)
    date = "三天后" if stage==3 else "今天 09:02"
    title = ["","讨论发生时，AI 同步抓住重点","AI 进入讨论，把分歧变成决定","条件变化时，自动提醒复核"][stage]
    im,d=base_ui("产品方向讨论",stage,title,date)
    y=222
    # Stage 1 progressively grows
    if scene>=3:
        y=message(d,y,"孙宇杰","孙","09:02 · 群聊","第一版到底先做网页，还是直接做微信小程序？")
    if scene>=4:
        y=message(d,y,"张轩灏","张","09:05 · 线上语音","网页开发快，可以先验证团队是否愿意持续使用。",SLATE)
    if scene>=5:
        y=message(d,y,"卢格妤","卢","09:08 · 文件","访谈显示团队需要完整上下文，但网页可能增加入口成本。",BRONZE)
    if scene==6:
        y=message(d,y,"织见机器人","AI","09:11 · AI 整理","已识别 1 个议题、1 项共识和 1 个关键分歧。",GREEN,"ai")
        oy=132
        oy=output_card(d,oy,"议题","第一版入口选择","网页 Demo 与微信小程序，哪一个更适合当前验证？")
        oy=output_card(d,oy,"初步共识","先验证核心流程","讨论整合与结构化决策必须先证明价值。","green")
        output_card(d,oy,"关键分歧","验证速度 vs. 入口成本","网页上线快，但可能带来进入流失。","bronze")
    elif scene==3:
        output_card(d,132,"议题","第一版入口选择","正在从群聊中识别讨论主线……")
    elif scene==4:
        output_card(d,132,"观点","先做网页 Demo","理由：上线快，适合验证核心流程。","green")
    elif scene==5:
        output_card(d,132,"证据","用户访谈已关联","7/10 团队需要反复补充上下文。")
        output_card(d,296,"风险","网页入口成本","独立页面可能造成用户流失。","bronze")
    # stage 2
    if scene>=7 and scene<=11:
        y=222
        y=message(d,y,"孙宇杰","孙","09:14 · 群聊","@织见机器人 根据当前讨论，给一个可验证的推进方案。")
        if scene>=8:
            y=message(d,y,"织见机器人","AI","09:15 · AI 建议","先做网页 Demo；若完成讨论率低于 30%，重新评估微信入口。",GREEN,"ai","方案")
        if scene>=9:
            y=message(d,y,"卢格妤","卢","09:17 · 反方意见","独立网页可能带来明显的入口流失，这条风险必须保留。",BRONZE)
        if scene>=10:
            y=message(d,y,"孙宇杰","孙","09:20 · 决策确认","三人确认：先做网页，张轩灏负责，7 天后看完成率。",GREEN,"decision")
        if scene==7:
            output_card(d,132,"正在分析","读取完整讨论上下文","AI 直接在群里参与，不另开孤立聊天框。")
        elif scene==8:
            output_card(d,132,"建议方案","先做网页 Demo","目标：7 天内跑通完整讨论流程。","green")
            output_card(d,296,"复核条件","完成讨论率低于 30%","条件触发时，重新评估微信入口。","bronze")
        elif scene==9:
            output_card(d,132,"反方意见","入口流失风险","异议作为决策档案的一部分永久保留。","bronze")
        else:
            output_card(d,132,"D-001 · 已确认","先做网页 Demo","负责人：张轩灏｜期限：7 天","green")
            output_card(d,296,"成立条件","完成讨论率 ≥ 30%","低于阈值时，团队必须重新讨论。")
            output_card(d,460,"引用依据","每项都能回到原话","群聊 2 条 · 语音 1 条 · 文件 1 份")
    # stage 3
    if scene>=12:
        y=222
        y=message(d,y,"卢格妤","卢","三天后 10:03 · 群聊","当时为什么决定先做网页？现在是否应该改做小程序？",BRONZE)
        if scene>=13:
            y=message(d,y,"织见机器人","AI","10:04 · 决策档案","D-001：依据、反方意见、负责人和成立条件均已保存。",GREEN,"ai")
        if scene>=14:
            y=message(d,y,"张轩灏","张","10:06 · 新数据","100 人收到邀请，24 人完成讨论，完成率 24%。",SLATE,"metric")
        if scene>=15:
            y=message(d,y,"织见机器人","AI","10:07 · AI 提醒","24% 已低于 30% 的复核线，建议重新讨论 D-001。",GREEN,"ai")
        if scene==12:
            output_card(d,132,"决策档案","正在打开 D-001","无需重新翻找几十页聊天记录。")
        elif scene==13:
            output_card(d,132,"D-001","为什么先做网页","开发快｜反方：入口流失","green")
            output_card(d,296,"成立条件","完成讨论率 ≥ 30%","负责人：张轩灏｜7 天后复核")
            output_card(d,460,"完整依据","每个结论都能解释","3 条依据 · 1 条反方意见 · 2 个条件")
        elif scene==14:
            output_card(d,132,"新证据","完成讨论率 24%","100 人收到邀请，24 人完成。","bronze")
            output_card(d,296,"正在复核","对照 D-001 条件","检测到新的量化证据……")
        else:
            output_card(d,132,"复核已触发","D-001 需要重新讨论","24% ＜ 30%｜等待团队复核","bronze")
            output_card(d,296,"历史仍保留","决定不会被粗暴覆盖","原始依据与新变化同时可见。","green")
    return im


def export_frame():
    im,d=base_ui("模型与数据控制",2,"AI 可以替换，团队记忆始终属于团队")
    d.text((180,250),"选择团队自己的 AI",font=F34,fill=INK)
    paragraph(d,(180,310),"支持自定义 API，也可以把完整、结构化的讨论上下文导出给其他模型。",F24,MUTED,880,12,3)
    providers=[("自定义 API","已连接",GREEN),("OpenAI","可选",SLATE),("其他模型","导出上下文",BRONZE)]
    y=470
    for name,state,c in providers:
        rr(d,(180,y,1110,y+100),18,SURFACE,LINE,2)
        d.ellipse((215,y+35,245,y+65),fill=c)
        d.text((270,y+23),name,font=F24,fill=INK)
        d.text((270,y+58),state,font=F16,fill=MUTED)
        y+=120
    output_card(d,150,"团队资产","不被单一模型锁定","保留的是讨论上下文、决策结构和历史记忆。","green")
    output_card(d,314,"标准导出","上下文可以带走","时间线、引用关系和决策字段完整输出。")
    return im


def pillars_frame():
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    d.text((150,110),"织见现阶段只做三件事",font=F44,fill=INK)
    d.text((152,175),"把讨论变成团队可以长期使用的决策记忆",font=F24,fill=MUTED)
    cards=[("01","统一时间线","群聊、会议、文件与线下讨论，来源清晰地进入同一条时间线。",GREEN),
           ("02","结构化决策","结论、依据、反方意见、负责人、成立条件和复核触发器。",BRONZE),
           ("03","原生 AI 参与","在群里直接 @AI，支持自定义 API，也支持完整上下文导出。",SLATE)]
    for i,(no,t,b,c) in enumerate(cards):
        x=150+i*555
        rr(d,(x,290,x+500,820),28,SURFACE,LINE,2)
        rr(d,(x+35,330,x+103,398),20,c)
        d.text((x+53,350),no,font=F20,fill="white")
        d.text((x+35,450),t,font=F34,fill=INK)
        paragraph(d,(x+35,525),b,F20,MUTED,420,14,6)
        d.line((x+35,745,x+465,745),fill=LINE,width=2)
        d.text((x+35,775),"织见 PRODUCT PRINCIPLE",font=F12,fill=c)
    return im


frames=[]
frames.append(title_frame("让每个决定，都能找到来路", "三分钟产品演示｜多模态时间线 · 结构化决策 · 原生 AI 参与"))
frames.append(pain_frame())
frames.append(timeline_frame())
for s in range(3,16): frames.append(product_frame(s))
frames.append(export_frame())
frames.append(pillars_frame())
frames.append(title_frame("让团队记住为什么", "从零散讨论，到一个可解释、可执行、可复核的决定。", "织见 · PRODUCT DEMO"))

assert len(frames)==19
for i,im in enumerate(frames):
    im.save(FRAME_DIR/f"scene-{i:02d}.png",quality=95)
print(f"rendered {len(frames)} frames to {FRAME_DIR}")

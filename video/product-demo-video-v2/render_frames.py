from pathlib import Path
from PIL import Image, ImageDraw
import importlib.util

ROOT=Path(__file__).parent
FRAME_DIR=ROOT/'work'/'frames'
FRAME_DIR.mkdir(parents=True,exist_ok=True)
helper_path=ROOT.parent/'product-demo-video'/'render_frames.py'
spec=importlib.util.spec_from_file_location('zhijian_v1_renderer',helper_path)
h=importlib.util.module_from_spec(spec); spec.loader.exec_module(h)

PURPLE='#766B83'

def meeting_badge(d,x,y,state='会议进行中'):
    h.rr(d,(x,y,x+205,y+48),14,'#EEE9F1','#D5CDDD',2)
    d.ellipse((x+15,y+18,x+27,y+30),fill=PURPLE)
    d.text((x+39,y+14),state,font=h.F14,fill=PURPLE)

def meeting_product(scene):
    if scene<=8:
        im,d=h.base_ui('产品方向讨论',1,'群聊发起，会议展开，内容回到同一条时间线')
        y=222
        y=h.message(d,y,'孙宇杰','孙','09:02 · 产品方向群','第一版先做网页还是小程序？文字里说不清，9:30 开产品同步会。')
        if scene>=4:
            y=h.message(d,y,'产品同步会','会','09:30 · 线上会议','孙宇杰、卢格妤、张轩灏已加入；自动转写和说话人识别开启。',PURPLE)
            meeting_badge(d,980,346)
        if scene>=5:
            y=h.message(d,y,'张轩灏','张','09:34 · 会议转写','网页开发快，可以先验证团队是否愿意持续使用。',h.SLATE)
        if scene>=6:
            y=h.message(d,y,'卢格妤','卢','09:38 · 会议转写','网页会增加进入成本；这条反方意见必须保留。',h.BRONZE)
        if scene>=7:
            y=h.message(d,y,'卢格妤','卢','09:42 · 会议共享文件','9 月用户访谈摘录：入口切换会降低参与意愿。',h.BRONZE)
        if scene>=8:
            # Keep the final meeting summary visible within the viewport.
            h.rr(d,(315,790,1222,900),14,'#F3EFF5','#CFC5D7',2)
            d.text((338,812),'会议结束 · 18:24',font=h.F18,fill=PURPLE)
            d.text((338,848),'完整转写、关键片段与共享文件已回到原讨论时间线',font=h.F18,fill=h.INK)
        if scene==3:
            h.output_card(d,132,'群聊议题','第一版入口选择','网页 Demo 与微信小程序，哪一个更适合当前验证？')
        elif scene==4:
            h.output_card(d,132,'会议接入','继续同一个讨论','自动关联 09:02 的群聊议题，不新建孤立纪要。','green')
            h.output_card(d,296,'会议状态','转写正在进行','3 位成员 · 说话人识别已开启')
        elif scene==5:
            h.output_card(d,132,'会议观点','先验证核心流程','支持理由：网页上线快，适合先验证。','green')
        elif scene==6:
            h.output_card(d,132,'会议分歧','验证速度 vs. 入口成本','反方意见会随决策永久保留。','bronze')
        elif scene==7:
            h.output_card(d,132,'会议证据','文件已关联发言','共享材料与 09:38 的观点建立引用关系。')
        else:
            h.output_card(d,132,'会议小结','1 项共识 · 1 个分歧','还需要设定可以推翻方案的客观条件。','green')
            h.output_card(d,296,'已回到时间线','会议不是孤立纪要','转写 4 段 · 文件 1 份 · 引用关系完整')
        return im

    if scene<=12:
        im,d=h.base_ui('产品方向讨论',2,'会后回到群聊，把跨场景上下文变成决定')
        y=222
        y=h.message(d,y,'孙宇杰','孙','10:06 · 产品方向群','@织见机器人 结合群聊、会议转写和访谈文件，给一个可验证的方案。')
        if scene>=10:
            y=h.message(d,y,'织见机器人','AI','10:07 · 人工智能建议','先做网页；完成讨论率低于 30% 时，重新评估微信入口。',h.GREEN,'ai')
        if scene>=11:
            y=h.message(d,y,'卢格妤','卢','10:09 · 产品方向群','同意，但保留我在会议里的入口流失意见，并引用访谈文件。',h.BRONZE)
        if scene>=12:
            y=h.message(d,y,'孙宇杰','孙','10:12 · 决策确认','三人确认 D-001：网页先行；张轩灏负责；复核线为 30%。',h.GREEN,'decision')
        if scene==9:
            h.output_card(d,132,'正在分析','读取跨场景上下文','群聊 2 条 · 会议记录 4 段 · 共享文件 1 份')
        elif scene==10:
            h.output_card(d,132,'决策候选','网页先行 + 明确复核线','获得速度优势，也保留客观推翻条件。','green')
            h.output_card(d,296,'复核条件','完成讨论率低于 30%','触发后重新评估微信入口。','bronze')
        elif scene==11:
            h.output_card(d,132,'反方意见','会议原话已引用','会议 09:38 +《9 月用户访谈摘录》','bronze')
        else:
            h.output_card(d,132,'D-001 · 已确认','先做网页 Demo','负责人：张轩灏｜期限：7 天','green')
            h.output_card(d,296,'跨场景依据','每项都能回到原话','群聊 2 条 · 会议 3 段 · 文件 1 份')
        return im

    im,d=h.base_ui('产品方向讨论',3,'新数据出现时，回到会议原话并触发复核','三天后')
    y=222
    y=h.message(d,y,'卢格妤','卢','三天后 10:03 · 群聊','当时为什么选择网页？我记得会议里也有人担心入口问题。',h.BRONZE)
    if scene>=13:
        y=h.message(d,y,'织见机器人','AI','10:04 · 决策档案','支持依据来自会议 09:34；反方意见来自会议 09:38。',h.GREEN,'ai')
    if scene>=14:
        y=h.message(d,y,'张轩灏','张','10:06 · 新数据','100 人收到邀请，24 人完成讨论，完成率 24%。',h.SLATE,'metric')
    if scene>=15:
        y=h.message(d,y,'织见机器人','AI','10:07 · 复核提醒','24% 已低于 30% 的复核线，建议重新讨论 D-001。',h.GREEN,'ai')
    if scene==13:
        h.output_card(d,132,'D-001','决定能回到会议原话','2 条群聊 · 3 段会议引用 · 1 份文件','green')
        h.output_card(d,296,'反方意见','入口流失风险','来源：卢格妤在产品同步会的 09:38 发言')
    elif scene==14:
        h.output_card(d,132,'新证据','完成讨论率 24%','100 人收到邀请，24 人完成。','bronze')
        h.output_card(d,296,'正在复核','对照 D-001 条件','检测到新的量化证据……')
    else:
        h.output_card(d,132,'复核已触发','D-001 需要重新讨论','24% ＜ 30%｜等待团队复核','bronze')
        h.output_card(d,296,'历史仍保留','会议依据不会消失','原始讨论和新变化同时可见。','green')
    return im

def context_frame():
    im=h.title_frame('从群聊，到会议，再回到群聊','同一个问题沿时间推进。每次切换场景，成员、时间、原话和引用关系都被保留下来。','连续上下文，而不是三份记录')
    d=ImageDraw.Draw(im)
    items=[('09:02','群聊提出问题',h.GREEN),('09:30','进入产品同步会',PURPLE),('09:42','会议共享文件',h.BRONZE),('10:06','会后回到群聊',h.SLATE)]
    x=155
    for i,(tm,txt,c) in enumerate(items):
        h.rr(d,(x,755,x+350,855),20,h.SURFACE,h.LINE,2)
        d.text((x+25,777),tm,font=h.F18,fill=c); d.text((x+25,813),txt,font=h.F18,fill=h.INK)
        if i<len(items)-1:
            d.line((x+350,805,x+405,805),fill='#AFB8B3',width=4)
        x+=405
    return im

def export_dialog_frame():
    im,d=h.base_ui('产品方向讨论',2,'会后回到群聊，把跨场景上下文变成决定')
    h.message(d,240,'孙宇杰','孙','10:12 · 决策确认','D-001 已由三人确认。现在把整场讨论带走。',h.GREEN,'decision')
    h.rr(d,(940,42,1218,88),10,h.GREEN)
    d.text((961,50),'导出上下文  ↗',font=h.F20,fill='white')
    d.rectangle((0,0,1920,1080),fill=(24,33,30,90)) if im.mode=='RGBA' else None
    h.rr(d,(370,118,1550,855),24,h.SURFACE,h.GREEN,3)
    d.text((424,151),'OPEN CONTEXT',font=h.F18,fill=h.GREEN)
    d.text((424,193),'带走这场讨论',font=h.F44,fill=h.INK)
    d.text((424,273),'群聊、会议原话、共享文件和决策，按原顺序保留。',font=h.F24,fill=h.MUTED)
    h.rr(d,(422,335,1498,673),14,'#F7F8F4',h.LINE,2)
    d.text((450,358),'Markdown 预览 · 14 条记录 · 1 项决策',font=h.F20,fill=h.GREEN)
    lines=[
      '# 产品方向讨论',
      'E001 · 09:02 · 产品方向群 · 孙宇杰',
      'E003 · 09:34 · 产品同步会 · 张轩灏',
      'E004 · 09:38 · 产品同步会 · 卢格妤',
      'E005 · 09:42 · 会议共享文件 · 访谈摘录.pdf',
      'D-001 · 结论 / 依据 / 反方意见 / 复核条件',
    ]
    for i,line in enumerate(lines): d.text((452,409+i*40),line,font=h.F20,fill=h.INK if i<2 else h.MUTED)
    h.rr(d,(700,721,1050,791),12,h.SURFACE,h.GREEN,2)
    d.text((743,739),'下载 JSON',font=h.F24,fill=h.GREEN)
    h.rr(d,(1070,721,1500,791),12,h.GREEN)
    d.text((1102,739),'下载 Markdown',font=h.F24,fill='white')
    return im

def export_file_frame():
    im=Image.new('RGB',(1920,1080),h.BG); d=ImageDraw.Draw(im)
    h.rr(d,(78,45,1842,1025),26,h.SURFACE,h.LINE,2)
    d.text((136,95),'织见-产品方向讨论-demo.md',font=h.F28,fill=h.GREEN)
    d.text((136,154),'一份人能读、模型也能读的讨论记录',font=h.F44,fill=h.INK)
    d.text((136,232),'不只有结论：每条消息保留时间、来源、发言人和原文。',font=h.F24,fill=h.MUTED)
    h.rr(d,(132,304,1785,873),18,'#F7F8F4',h.LINE,2)
    d.text((180,347),'# 产品方向讨论',font=h.F28,fill=h.GREEN)
    rows=[
      ('E001','09:02 · 产品方向群','孙宇杰：第一版先做网页还是小程序？'),
      ('E003','09:34 · 产品同步会','张轩灏：网页能更快验证核心流程。'),
      ('E004','09:38 · 产品同步会','卢格妤：网页可能增加进入成本。'),
      ('E005','09:42 · 会议共享文件','9 月用户访谈摘录.pdf · 关联 E004'),
    ]
    for i,(ref,meta,body) in enumerate(rows):
      y=415+i*86
      d.text((180,y),ref,font=h.F20,fill=h.BRONZE)
      d.text((305,y),meta,font=h.F20,fill=h.GREEN)
      d.text((725,y),body,font=h.F20,fill=h.INK)
      if i<3:d.line((180,y+58,1735,y+58),fill=h.LINE,width=2)
    h.rr(d,(165,785,1750,850),10,h.GREEN_SOFT)
    d.text((188,800),'D-001 结论 · 依据 E003/E005 · 反方意见 E004 · 复核线 30%',font=h.F20,fill=h.GREEN_DARK)
    return im

frames=[]
frames.append(h.title_frame('会议说清的事，回到群聊','三分钟看懂织见：接回会议、带走上下文、让 AI 在群里参与','织见 · 讨论与决策记忆'))
frames.append(h.pain_frame())
frames.append(context_frame())
for s in range(3,16): frames.append(meeting_product(s))
frames.append(export_dialog_frame())
frames.append(export_file_frame())
frames.append(h.title_frame('不只记住结论，也带走来路','会议原话回到群聊；上下文可导出；AI 在原讨论里参与。','织见 · PRODUCT DEMO'))
assert len(frames)==19
for i,im in enumerate(frames): im.save(FRAME_DIR/f'scene-{i:02d}.png',quality=95)
print('rendered',len(frames),'frames')

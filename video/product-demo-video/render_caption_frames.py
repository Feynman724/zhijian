from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT=Path(__file__).parent
WORK=ROOT/'work'
OUT=WORK/'caption-frames'
OUT.mkdir(parents=True,exist_ok=True)
segments=json.loads((WORK/'segments.json').read_text())
font=ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc',40)

def wrap(draw,text,max_width):
    lines=[]; cur=''
    for ch in text:
        if draw.textlength(cur+ch,font=font)<=max_width:
            cur+=ch
        else:
            lines.append(cur); cur=ch
    if cur: lines.append(cur)
    return lines

for i,seg in enumerate(segments):
    src=WORK/'frames'/f"scene-{seg['scene']:02d}.png"
    im=Image.open(src).convert('RGBA')
    layer=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
    lines=wrap(d,seg['text'],1440)
    line_h=54; box_h=42+len(lines)*line_h
    y=1080-box_h-24
    d.rounded_rectangle((170,y,1750,1056),radius=20,fill=(24,33,30,210),outline=(255,255,255,35),width=1)
    ty=y+21
    for line in lines:
        bbox=d.textbbox((0,0),line,font=font)
        tw=bbox[2]-bbox[0]
        d.text(((1920-tw)/2,ty),line,font=font,fill=(255,255,255,255),stroke_width=1,stroke_fill=(14,22,19,180))
        ty+=line_h
    Image.alpha_composite(im,layer).convert('RGB').save(OUT/f'caption-{i:03d}.png',quality=95)
print('rendered',len(segments),'caption frames')

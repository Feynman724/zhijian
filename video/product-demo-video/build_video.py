from pathlib import Path
import json, subprocess, wave, math
import numpy as np

ROOT=Path(__file__).parent
WORK=ROOT/'work'
AUDIO=WORK/'audio'
CLIPS=WORK/'clips'
CLIPS.mkdir(parents=True,exist_ok=True)
segments=json.loads((WORK/'segments.json').read_text())
PAUSE=0.33
INTRO=2.0
OUTRO=2.0
SR=48000

def run(cmd):
    print('RUN', ' '.join(map(str,cmd[:7])), '...', flush=True)
    subprocess.run([str(x) for x in cmd],check=True)

def ass_time(t):
    h=int(t//3600); t-=h*3600
    m=int(t//60); t-=m*60
    return f'{h}:{m:02d}:{t:05.2f}'

def srt_time(t):
    ms=round(t*1000); h=ms//3600000; ms%=3600000; m=ms//60000; ms%=60000; s=ms//1000; ms%=1000
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'

# Convert voice segments to a shared format.
for i,_ in enumerate(segments):
    src=AUDIO/f'{i:03d}.aiff'; dst=AUDIO/f'{i:03d}.wav'
    run(['ffmpeg','-y','-loglevel','error','-i',src,'-ar',SR,'-ac',2,'-c:a','pcm_s16le',dst])

for name,dur in [('pause',PAUSE),('intro',INTRO),('outro',OUTRO)]:
    run(['ffmpeg','-y','-loglevel','error','-f','lavfi','-i',f'anullsrc=r={SR}:cl=stereo','-t',dur,'-c:a','pcm_s16le',AUDIO/f'{name}.wav'])

# Build narration and timecode files.
concat=[f"file '{(AUDIO/'intro.wav').as_posix()}'"]
ass_lines=[]; srt_lines=[]; t=INTRO
scene_durations=[0.0]*19
scene_durations[0]+=INTRO
for i,seg in enumerate(segments):
    wav=(AUDIO/f'{i:03d}.wav').resolve()
    concat.append(f"file '{wav.as_posix()}'")
    start=t; end=t+seg['duration']
    text=seg['text'].replace('\n',' ').replace('{','（').replace('}','）')
    ass_lines.append(f'Dialogue: 0,{ass_time(start)},{ass_time(end)},Default,,0,0,0,,{text}')
    srt_lines += [str(i+1), f'{srt_time(start)} --> {srt_time(end)}', text, '']
    t=end
    concat.append(f"file '{(AUDIO/'pause.wav').resolve().as_posix()}'")
    t+=PAUSE
    scene_durations[seg['scene']]+=seg['duration']+PAUSE
concat.append(f"file '{(AUDIO/'outro.wav').resolve().as_posix()}'")
scene_durations[18]+=OUTRO
(WORK/'audio-concat.txt').write_text('\n'.join(concat))
run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',WORK/'audio-concat.txt','-c','copy',WORK/'narration.wav'])

ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Heiti SC,40,&H00FFFFFF,&H000000FF,&H00233630,&HC0222D29,0,0,0,0,100,100,1,0,3,1,0,2,160,160,48,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''+ '\n'.join(ass_lines)+'\n'
(ROOT/'织见三分钟产品演示.ass').write_text(ass)
(ROOT/'织见三分钟产品演示.srt').write_text('\n'.join(srt_lines))

# Generate a restrained ambient soundtrack.
total=t+OUTRO
n=int(total*SR)
music=np.zeros((n,2),dtype=np.float32)
chords=[(130.81,164.81,196.00),(110.00,130.81,164.81),(87.31,110.00,130.81),(98.00,123.47,146.83)]
block=12.0
for bi,start in enumerate(np.arange(0,total,block)):
    length=min(block,total-start); count=int(length*SR); tt=np.arange(count,dtype=np.float32)/SR
    env=np.minimum(1,tt/2.2)*np.minimum(1,(length-tt)/2.2)
    mono=np.zeros(count,dtype=np.float32)
    for j,f in enumerate(chords[bi%len(chords)]):
        mono += (0.31-j*0.035)*np.sin(2*np.pi*f*tt + j*.7)
        mono += 0.055*np.sin(2*np.pi*f*2*tt + j*.4)
    pulse=(0.78+0.22*np.sin(2*np.pi*tt/4.0))
    mono*=env*pulse*0.24
    st=int(start*SR); music[st:st+count,0]+=mono
    music[st:st+count,1]+=np.roll(mono,int(.012*SR))
fade=int(3*SR)
music[:fade]*=np.linspace(0,1,fade)[:,None]
music[-fade:]*=np.linspace(1,0,fade)[:,None]
music=np.clip(music,-.95,.95)
with wave.open(str(WORK/'music.wav'),'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((music*32767).astype('<i2').tobytes())

# Build lightly animated scene clips.
for i,dur in enumerate(scene_durations):
    frames=max(1,round(dur*30))
    z="min(zoom+0.000018,1.014)" if i%2==0 else "min(zoom+0.000014,1.011)"
    run(['ffmpeg','-y','-loglevel','error','-loop','1','-i',WORK/'frames'/f'scene-{i:02d}.png','-vf',f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1920x1080:fps=30,format=yuv420p",'-frames:v',frames,'-c:v','libx264','-preset','veryfast','-crf','20',CLIPS/f'{i:02d}.mp4'])

video_concat=[]
for i in range(19): video_concat.append(f"file '{(CLIPS/f'{i:02d}.mp4').resolve().as_posix()}'")
(WORK/'video-concat.txt').write_text('\n'.join(video_concat))
run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',WORK/'video-concat.txt','-c','copy',WORK/'silent.mp4'])

# Mix voice and music, burn subtitles, and create the final delivery file.
ass_path=(ROOT/'织见三分钟产品演示.ass').resolve().as_posix().replace(':','\\:').replace("'","\\'")
run(['ffmpeg','-y','-loglevel','error','-i',WORK/'silent.mp4','-i',WORK/'narration.wav','-i',WORK/'music.wav','-filter_complex','[1:a]volume=1.22[voice];[2:a]volume=0.16[bg];[voice][bg]amix=inputs=2:duration=shortest:normalize=0[a]','-vf',f"subtitles='{ass_path}'",'-map','0:v','-map','[a]','-c:v','libx264','-preset','medium','-crf','18','-c:a','aac','-b:a','192k','-movflags','+faststart','-shortest',ROOT/'织见三分钟产品演示.mp4'])
print('DONE',ROOT/'织见三分钟产品演示.mp4', 'duration',round(total,2),flush=True)

from pathlib import Path
import json, subprocess, wave
import numpy as np

ROOT=Path(__file__).parent
WORK=ROOT/'work'; AUDIO=WORK/'audio'; SR=48000
segments=json.loads((WORK/'segments.json').read_text())
INTRO=2.0; OUTRO=2.0; TARGET=180.0
spoken=sum(segment['duration'] for segment in segments)
PAUSE=max(.06,min(.7,(TARGET-INTRO-OUTRO-spoken)/len(segments)))

def run(cmd): subprocess.run([str(x) for x in cmd],check=True)
def srt_time(t):
    ms=round(t*1000); h=ms//3600000; ms%=3600000; m=ms//60000; ms%=60000; s=ms//1000; ms%=1000
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'

for name,dur in [('pause',PAUSE),('intro',INTRO),('outro',OUTRO)]:
    run(['ffmpeg','-y','-loglevel','error','-f','lavfi','-i',f'anullsrc=r={SR}:cl=stereo','-t',dur,'-c:a','pcm_s16le',AUDIO/f'{name}.wav'])

concat=[f"file '{(AUDIO/'intro.wav').resolve().as_posix()}'"]
srt=[]; t=INTRO
for i,seg in enumerate(segments):
    concat.append(f"file '{(AUDIO/f'{i:03d}.wav').resolve().as_posix()}'")
    start=t; end=t+seg['duration']; text=seg['text']
    srt += [str(i+1),f'{srt_time(start)} --> {srt_time(end)}',text,'']
    t=end
    concat.append(f"file '{(AUDIO/'pause.wav').resolve().as_posix()}'")
    t+=PAUSE
concat.append(f"file '{(AUDIO/'outro.wav').resolve().as_posix()}'")
total=t+OUTRO
(WORK/'audio-concat.txt').write_text('\n'.join(concat))
(ROOT/'织见三分钟产品演示_v4.srt').write_text('\n'.join(srt))
run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',WORK/'audio-concat.txt','-c','copy',WORK/'narration.wav'])

n=int(total*SR); music=np.zeros((n,2),dtype=np.float32)
chords=[(130.81,164.81,196.00),(110.00,130.81,164.81),(87.31,110.00,130.81),(98.00,123.47,146.83)]
block=12.0
for bi,start in enumerate(np.arange(0,total,block)):
    length=min(block,total-start); count=int(length*SR); tt=np.arange(count,dtype=np.float32)/SR
    env=np.minimum(1,tt/2.2)*np.minimum(1,(length-tt)/2.2)
    mono=np.zeros(count,dtype=np.float32)
    for j,f in enumerate(chords[bi%4]):
        mono+=(0.30-j*.035)*np.sin(2*np.pi*f*tt+j*.7)
        mono+=.05*np.sin(2*np.pi*f*2*tt+j*.4)
    mono*=env*(.78+.22*np.sin(2*np.pi*tt/4))*.22
    st=int(start*SR); music[st:st+count,0]+=mono; music[st:st+count,1]+=np.roll(mono,int(.012*SR))
fade=int(3*SR); music[:fade]*=np.linspace(0,1,fade)[:,None]; music[-fade:]*=np.linspace(1,0,fade)[:,None]
with wave.open(str(WORK/'music.wav'),'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(music,-.95,.95)*32767).astype('<i2').tobytes())

print(f'total={total:.3f}s spoken={spoken:.3f}s pause={PAUSE:.3f}s segments={len(segments)}')

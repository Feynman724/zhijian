from pathlib import Path
import asyncio
import json
import subprocess

import edge_tts

ROOT = Path(__file__).parent
AUDIO = ROOT / "work" / "audio"
AUDIO.mkdir(parents=True, exist_ok=True)

VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "+25%"
PITCH = "-2Hz"

paragraphs = [
    paragraph.strip().replace("\n", "")
    for paragraph in (ROOT / "narration.txt").read_text().split("\n\n")
    if paragraph.strip()
]


async def render_voice():
    segments = []
    for index, text in enumerate(paragraphs):
        output = AUDIO / f"{index:03d}.mp3"
        speech = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await speech.save(str(output))
        wav_output = AUDIO / f"{index:03d}.wav"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-loglevel",
                "error",
                "-i",
                str(output),
                "-af",
                "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-48dB,apad=pad_dur=0.15",
                "-ar",
                "48000",
                "-ac",
                "2",
                "-c:a",
                "pcm_s16le",
                str(wav_output),
            ],
            check=True,
        )
        duration = float(
            subprocess.check_output(
                [
                    "ffprobe",
                    "-v",
                    "error",
                    "-show_entries",
                    "format=duration",
                    "-of",
                    "csv=p=0",
                    str(wav_output),
                ],
                text=True,
            )
        )
        segments.append(
            {"scene": index, "text": text, "duration": round(duration, 3)}
        )

    (ROOT / "work" / "segments.json").write_text(
        json.dumps(segments, ensure_ascii=False, indent=2)
    )
    total = sum(segment["duration"] for segment in segments)
    print(
        f"voice={VOICE} rate={RATE} segments={len(segments)} "
        f"spoken_duration={total:.2f}s"
    )


asyncio.run(render_voice())

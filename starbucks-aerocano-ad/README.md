# Iced Aerocano — motion graphics spot (9:16)

A ~24s vertical (1080×1920, 30fps) hype ad for Starbucks' Iced Aerocano, with an energetic
Egyptian-Arabic male voiceover, a synthesized EDM track (124 BPM) and flat, modern motion graphics.
Every frame is drawn in code (`film.js`) and every sound is synthesized (`song.js`); both read
the same timeline in `score.js`, so cuts, ice-cube clinks, the countdown and the drop land on the beat.

Final file: `out/starbucks-aerocano-ad.mp4`

| time | scene | voiceover |
|---|---|---|
| 0–4s | "جديد!" slams in | استنى! فيه حاجة جديدة نزلت! |
| 4–8s | espresso whipped with air (air meter) | إسبريسو متخفّق بالهوا... ناعم زي القطيفة! |
| 8–12s | ice drops on the beat, foam cascades in | على تلج... ساقع... وطعمه جامد! |
| 12–14s | 3·2·1, a held breath of silence | جهّز نفسك! |
| 14–20s | AEROCANO drop, feature chips | إيروكانو! · القهوة اللي هتقلب يومك! |
| 20–24s | end card | إيروكانو من ستاربكس! جرّبه النهارده! |

## Rebuild

```bash
pip install piper-tts
mkdir -p tools/voices && cd tools/voices
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/ar/ar_JO/kareem/medium/ar_JO-kareem-medium.onnx
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/ar/ar_JO/kareem/medium/ar_JO-kareem-medium.onnx.json
cd ../..
PATH=$PWD/tools/bin:$PATH PIPER_MODEL=$PWD/tools/voices/ar_JO-kareem-medium.onnx node song.js
CHROME_PATH=$PWD/tools/bin/chrome-nosandbox node engine/render.js video   # or your own Chrome
node engine/render.js mux
```

`tools/bin/piper` wraps piper with a faster, punchier "announcer" chain (deeper pitch, EQ,
compression). To use a real voice actor instead, record the lines above and replace the
`Voice.speak` call in `song.js` with `MIX.loadAudio`.

Notes: this is a concept/spec piece. It uses no official Starbucks logo artwork (the cup carries
a plain "A" roundel); add official brand assets only if you are authorised to. Fonts: Cairo
(OFL, `assets/fonts`), Inter (OFL, `engine/fonts`).

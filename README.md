# 🎬 Cenima — Cinematic Portrait Video Maker

Turn **one portrait photo** into a **vertical 9:16 cinematic video** (1080×1920 MP4) that is ready to post on **Instagram Reels** and **TikTok**. It runs on free tools (Python + FFmpeg), and you can use it **from your phone's browser**.

What you get:

- 🎥 **Smooth camera moves.** A slow push-in, a sideways slide and a final close-up, with eased motion so nothing jerks.
- 🌫️ **Parallax-style depth.** Floating out-of-focus bokeh moves faster than the photo, like a foreground layer. Square or landscape photos get a true two-layer parallax (sharp photo over a blurred background that moves at half speed).
- 🎨 **Cinematic colour grading.** Five looks: Teal & Orange, Warm Film, Moody, Natural, and Black & White.
- 🎞️ **Realistic film grain** that changes every frame and is strongest in the midtones, like real film.
- ☀️ **Light leaks.** Warm light drifts in from the frame edges.
- ✨ **Smooth transitions.** The camera glides between shots under a warm light flash (or a dip to black), with a fade in at the start and a fade out at the end.
- 📱 **Reels/TikTok-ready MP4:** 1080×1920, H.264 High profile, 30 fps, BT.709 colour, AAC audio, fast-start. You can add your own music.

---

## 🙂 Your face is never changed

This project does **not** use AI to redraw or animate the face. It works like a film camera moving over a printed photo:

| What happens | Why the face stays identical |
|---|---|
| Camera zoom/slide/tiny roll | Only a *uniform* scale and shift (a "similarity transform"). Width and height always scale by exactly the same amount, so nothing is stretched, bent or warped. The automated tests check this on every frame. |
| Colour grading | Changes colours only, never moves a pixel. **Skin is protected:** skin keeps its original hue and saturation and only gets the look's contrast. The tests check that skin hue stays within about 3°. |
| Light leaks and bokeh | These are faded out over the face, so they never cover the eyes, nose or lips. The only exception is the short flash during a transition. |
| Face detection | Used **only** to aim the camera at the face. It never edits the face. |

Your face shape, eyes, nose, lips, skin tone, hairstyle and every distinguishing feature come straight from your photo.

> Want the person to actually *move* (blink, smile, turn their head)? That needs an AI video service. See **[AI animation options](docs/AI_ANIMATION.md)**, which also covers API keys and the identity risks. It is optional and not needed for anything above.

---

## 🚀 Pick the way that suits you

| | You need | Best for |
|---|---|---|
| **A. Google Colab** | Just a phone or computer browser and a Google account | 👉 **Easiest. No installing.** |
| **B. GitHub Codespaces** | Just a phone or computer browser and a GitHub account | Using the nice upload/download web app with no computer |
| **C. Your own computer** | A Windows, Mac or Linux computer (your phone can then connect to it) | Making lots of videos quickly |

---

### A. Google Colab (easiest, works on a phone)

1. Open **https://colab.research.google.com** in your browser and sign in with Google.
2. Tap **File → Open notebook → GitHub**. Type `zeusmess/Cenima` and open **`colab/Cinematic_Portrait.ipynb`**.
   - If the repository is **public**, you can also use this direct link:
     `https://colab.research.google.com/github/zeusmess/Cenima/blob/main/colab/Cinematic_Portrait.ipynb`
3. Run the cells **from top to bottom** by tapping the ▶️ button on each one. Wait for a green ✓ before going to the next.
   1. **Set up:** downloads the project (about 1 minute). If Colab says *"Warning: this notebook was not authored by Google"*, tap **Run anyway**.
   2. **Upload your portrait:** tap **Choose files** and pick your photo from your gallery.
   3. **Choose a style:** change the options if you like, then run the cell. It takes 1–3 minutes.
   4. **Watch it:** preview the video right in the page.
   5. **Download:** saves the MP4 to your phone or computer (see [Saving the video](#-saving-the-finished-video) below).

> **Private repository?** The set-up cell can't download a private repo. Either make the repo public (GitHub → Settings → General → Danger Zone → Change visibility), or use option B, which works with private repos.

### B. GitHub Codespaces (web app, works on a phone)

Codespaces gives you a free computer in the cloud that runs the web app. Free accounts include a monthly allowance of free hours.

1. On your phone, open **github.com/zeusmess/Cenima** in the browser (not the GitHub app). If the page looks cut down, use your browser menu and choose **"Desktop site"**.
2. Tap the green **`<> Code`** button → **Codespaces** tab → **Create codespace on main**.
3. Wait 2–3 minutes while it sets up. Everything installs automatically.
4. In the **Terminal** at the bottom, type the command below and press Enter:
   ```bash
   python app.py
   ```
5. A pop-up says *"Your application running on port 5000 is available"*. Tap **Open in Browser**. If you miss it, open the **Ports** tab and tap the 🌐 globe icon next to port 5000.
6. Use the app (see [Using the web app](#-using-the-web-app)).
7. When you're done, stop the codespace so it doesn't use up your free hours: **github.com/codespaces → ⋯ → Stop codespace**.

### C. Your own computer (phone connects over Wi-Fi)

**One-time setup**

1. Install **Python 3.10 or newer** from https://www.python.org/downloads/.
   On Windows, tick ✅ **"Add python.exe to PATH"** in the installer.
2. Download this project: on GitHub tap **`<> Code` → Download ZIP**, then unzip it. If you know git, use `git clone` instead.
3. Open a terminal in the project folder:
   - **Windows:** open the folder, click the address bar, type `cmd`, press Enter.
   - **Mac:** right-click the folder → *New Terminal at Folder*.
4. Install the requirements (this also installs FFmpeg automatically):
   ```bash
   python -m pip install -r requirements.txt
   ```
   On Mac/Linux, use `python3` if `python` doesn't work.

**Every time**

1. Start the app:
   ```bash
   python app.py
   ```
2. It prints two addresses, for example:
   ```
   On this computer:  http://localhost:5000
   On your phone (same Wi-Fi):  http://192.168.1.23:5000
   ```
3. On your **phone**, connect to the **same Wi-Fi** and type the second address into the browser.
   If it doesn't load, your computer's firewall is probably blocking it. Allow Python through the firewall when Windows asks, or use option A or B.
4. Press **Ctrl + C** in the terminal to stop the app.

---

## 📱 Using the web app

1. **Step 1 · Your photo:** tap the box and pick a portrait from your gallery, or take a new photo.
2. **Step 2 · Style:** choose the colour grade, the camera movement and the length. **More options** has the transition type, grain, light leaks, bokeh, the ending and optional music.
3. Tap **Create my video**. A progress bar appears. **Keep the page open.** A 10-second video takes about 1–3 minutes.
4. **Step 4 · Download:** watch the preview, then tap **Download MP4**.
5. **Caption & hashtags (optional):** with a free AI key set up, tap **Write caption** to get a ready-to-paste caption and hashtags. See **[AI captions](docs/AI_CAPTIONS.md)**.

## 💾 Saving the finished video

- **iPhone (Safari):** tap **Download MP4**, then **Download** in the pop-up. Open the **Files** app → **Downloads**, tap the video, tap the share icon and choose **Save Video**. It now appears in **Photos**.
  *In Colab:* the file goes to Files → Downloads. Save it to Photos the same way.
- **Android (Chrome):** tap **Download MP4**. The video goes to your **Downloads** folder and usually shows up in your **Gallery / Google Photos** under *Downloads*.
- **Computer:** the file lands in your Downloads folder.

## 📤 Posting to Instagram Reels / TikTok

The MP4 already has the right size (1080×1920) and format. Just upload it:

- **Instagram:** **+** → **Reel** → pick the video → add music/text in Instagram if you like → **Share**.
- **TikTok:** **+** → **Upload** → pick the video → **Next** → **Post**.

Tip: choose **Ending → No fade** in the app (or `--no-fade-out` on the command line) if you want the video to loop smoothly.

---

## 💻 Command line (optional)

If you are comfortable with a terminal (option B or C):

```bash
python make_video.py my_photo.jpg
```

The video is saved to `output/my_photo_cinematic.mp4`. Some examples:

```bash
# 15 seconds, warm look, with music
python make_video.py me.jpg --duration 15 --look warm_film --music song.mp3

# one long push-in, no grain, best quality
python make_video.py me.jpg --motion push --grain 0 --quality high -o reel.mp4

# see every option
python make_video.py --help
```

| Option | Choices (default first) | What it does |
|---|---|---|
| `--look` | `teal_orange`, `warm_film`, `moody`, `natural`, `noir` | Colour grade (`noir` = black & white) |
| `--motion` | `story`, `push` | Three shots (wide → medium → close-up) or one slow push-in |
| `--transition` | `leak`, `glide`, `dip` | How shots join: camera glide + light flash, glide only, or dip to black |
| `--duration` | `10` (3–60) | Length in seconds |
| `--grain` / `--leaks` / `--bokeh` | `0.5` / `0.5` / `0.4` (0–1) | Effect strengths. `0` turns an effect off |
| `--fit` | `auto`, `fill`, `layered` | `fill` crops to 9:16 around the face. `layered` puts the photo over a blurred background. `auto` picks `fill` for portrait photos and `layered` for square or wide ones |
| `--music` | file path | Adds music. It is faded out at the end and padded with silence if it's too short |
| `--no-fade-out` | | Don't fade to black at the end |
| `--fps` | `30`, `24`, `25`, `60` | Frame rate |
| `--quality` | `standard`, `fast`, `high` | Encoding speed vs. file quality |
| `--seed` | `7` | Change it for a different light-leak/grain pattern |

## 📸 Tips for the best result

- Use a **sharp, well-lit** photo, ideally from the original camera rather than a screenshot or a WhatsApp copy, which is compressed.
- **Portrait (tall) photos** fill the screen best. Photos at least **1500 px tall** stay crisp in the close-up. The camera automatically zooms less on small photos so they don't get blurry.
- Leave some space around the head. The camera needs room to move.
- **iPhone HEIC photos:** Safari usually converts them to JPG automatically when you upload. If you get an error, install the optional HEIC support with `pip install pillow-heif`, or export the photo as JPG.

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `python` is not recognized | Reinstall Python and tick **"Add python.exe to PATH"**, or try `py` (Windows) or `python3` (Mac/Linux). |
| `FFmpeg was not found` | Run `python -m pip install imageio-ffmpeg`. It includes FFmpeg. |
| `No module named cv2 / flask / numpy` | Run `python -m pip install -r requirements.txt` again. |
| The phone can't open the address | Make sure the phone and computer are on the **same Wi-Fi**, and allow Python through the firewall. Or use option A or B. |
| "No face was detected" | The video is still made. The camera assumes the face is in the upper middle. A clearer, front-facing photo helps. |
| The camera isn't centred on the face | Crop the photo so the person is more central, or use `--motion push`. |
| Rendering is slow | Use `--quality fast` or a shorter `--duration`. Codespaces and Colab are slower than a modern laptop. |

## ✅ Running the tests

```bash
python -m pip install pytest
python -m pytest -q
```

The tests:

- render real MP4s and check them (1080×1920, H.264 High, yuv420p, 30 fps, AAC audio)
- check that a perfectly round "face" stays round in every frame
- check that skin hue is preserved by every colour look
- check that the camera never stretches the image or shows black borders
- check that music works
- run the full web-app upload → render → download flow

## 🗂️ Project structure

```
app.py                       Mobile web app (upload → render → download)
make_video.py                Command-line tool
templates/index.html         The web page
cinematic/
  render.py                  Main pipeline: photo → frames → FFmpeg → MP4
  camera.py                  Camera moves (similarity transforms only)
  looks.py                   Colour grades + skin-tone protection + vignette
  effects.py                 Film grain, light leaks, bokeh
  face.py                    Face detection (used for framing only)
  ffmpeg_tools.py            Finds FFmpeg and sets Reels/TikTok encoding options
  captions.py                Optional AI caption + hashtags (free LLM APIs)
colab/Cinematic_Portrait.ipynb   Google Colab notebook
docs/AI_ANIMATION.md         Optional AI animation services and API keys
docs/AI_CAPTIONS.md          Optional free AI captions: keys, providers, privacy
tests/                       Automated tests
.devcontainer/               Auto-setup for GitHub Codespaces
```

## 🔒 Privacy

Everything runs on your own computer, codespace or Colab session. Photos are **not** sent to any AI service. The only exception is the optional [AI caption](docs/AI_CAPTIONS.md) feature, and only if you set it up and tick *Let the AI see my photo*. The web app deletes uploaded photos as soon as the video is made, and clears out finished videos older than 3 hours whenever a new video is started. The web app is meant for personal use on your own network, not as a public website.

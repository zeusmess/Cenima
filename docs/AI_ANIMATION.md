# AI animation: options, API keys and identity risks

**You don't need anything on this page.** The main project makes a finished cinematic video with free tools only (Python + FFmpeg) and never changes the face.

This page is for people who want the person in the photo to **actually move**: blink, smile, breathe, turn their head, or have their hair move in the wind. A still photo doesn't contain that motion, so a program has to *invent* new frames. Today that means an **AI video model**, usually run by an online service that needs an **API key** and costs money.

## ⚠️ The trade-off: realism vs. identity

AI animation models **redraw the face** in every frame. Even the good ones can slightly change:

- the face shape, eye shape and spacing, nose and lips
- skin tone and texture (they often smooth or "beautify")
- hairline, hairstyle and small features such as moles, scars and freckles

This is the opposite of this project's main promise ("do not distort or regenerate the face"). So the default pipeline doesn't use AI animation. If you use it, **check every result closely** and throw away clips where the person no longer looks like themselves.

## Your options

| Option | What it does | Cost / key | Identity risk |
|---|---|---|---|
| **1. This project (default)** | Camera moves, grading, grain, leaks, transitions | Free, no key | **None.** Face pixels are never redrawn |
| **2. Online image-to-video services** | Generate a 5–10 s clip of the person moving from your photo and a text prompt | Paid credits. API access needs an **API key** | Medium to high. Results vary per clip |
| **3. Open-source portrait animation (self-run)** | Open-source tools that drive a face photo with a "driving" video of someone else's expressions. Usually run on Colab with a GPU | Free, but needs a GPU and technical skill | Medium. Usually keeps identity better than full video generation, but it still redraws the face |
| **4. Depth-based 3D photo (2.5D)** | AI estimates depth and moves the camera "through" the photo for strong parallax | Free open-source models, needs extra setup | Low to medium. Edges of the head and hair can stretch or smear |

**Option 2: online services.** Well-known image-to-video providers include Runway, Kling, Luma (Dream Machine), Google Veo (through Google's Gemini API / Vertex AI) and similar platforms. Prices, models and API terms change often, so check each provider's current website. Most can be used **in their own website or app without any code**. That is the easiest way for beginners: upload your photo there, download the clip, and then run that clip through a normal video editor.

**Option 3: open-source portrait animation.** Search for "portrait animation" or "talking head" projects that come with a Google Colab notebook. Read the licence of each one before using it.

**Option 4: depth-based 3D photo.** Uses depth-estimation models (for example the MiDaS or Depth Anything families) together with "3D photo inpainting" techniques.

### Suggested workflow if you do use AI

1. Make the AI clip (option 2 or 3) from your portrait, with a calm prompt such as: *"subtle natural breathing, slight smile, gentle hair movement, static camera, keep the face identical"*. Small motion = fewer identity changes.
2. Compare it with the original photo frame by frame. Look at the eyes, nose, lips, skin tone and hairline.
3. Use this project's look in an editor. Or keep the AI clip short and use this project's video for the rest of your Reel, with a cut between them.

## 🔑 How API keys work (if you choose an online API)

An **API key** is a secret password that lets a program use your paid account. Anyone who has it can spend your credits.

1. Create an account with the provider and add a payment method or credits.
2. Find the **API** or **Developer** section of your account settings and click **Create API key**. Copy it straight away; it's often shown only once.
3. Store it as a **secret**, never inside your code:
   - **Your computer:** set an environment variable, e.g. `export VIDEO_API_KEY="..."` (Mac/Linux) or `setx VIDEO_API_KEY "..."` (Windows, then open a new terminal).
   - **Google Colab:** click the 🔑 **Secrets** icon in the left sidebar, add `VIDEO_API_KEY`, and read it with
     `from google.colab import userdata; key = userdata.get("VIDEO_API_KEY")`.
   - **GitHub Codespaces:** GitHub → **Settings → Codespaces → Secrets → New secret**. It appears as an environment variable in your codespace.
4. **Never** paste a key into a file you commit to GitHub, a screenshot or a chat. If a key leaks, delete it in the provider's dashboard and create a new one.
5. Set a **spending limit** in the provider's dashboard if it offers one.

## Consent and platform rules

Only animate photos of yourself or of people who have agreed to it. Instagram and TikTok ask creators to **label realistic AI-generated or AI-altered content**. Use the platform's "AI-generated" label when you post AI-animated clips.

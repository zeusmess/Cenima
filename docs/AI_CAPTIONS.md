# AI captions & hashtags (optional, free)

**You don't need this to make videos.** It adds a **Write caption** button under the finished video. The button asks a free AI text model to write a short Reels/TikTok caption and a line of hashtags. It never touches the video or your face.

The free providers come from **[Awesome Free LLM APIs](https://github.com/mnfst/awesome-free-llm-apis)**, a list of LLM APIs with permanent free tiers. Most of them use the same "OpenAI-compatible" format, so any of them works here.

> These are **text** models. None of them can make video or animate a face. For that, see [AI animation options](AI_ANIMATION.md).

## 1. Get a free key (no credit card)

Pick **one**. Google Gemini is the easiest, and it can also look at the photo.

| Provider | Get a key | Set this variable | Can see the photo? |
|---|---|---|---|
| **Google Gemini** (recommended) | https://aistudio.google.com/app/apikey | `GEMINI_API_KEY` | Yes |
| Groq | https://console.groq.com/keys | `GROQ_API_KEY` | No |
| OpenRouter (`:free` models) | https://openrouter.ai/keys | `OPENROUTER_API_KEY` | No |
| Mistral AI | https://console.mistral.ai/api-keys | `MISTRAL_API_KEY` | Yes |

If you set more than one, the app uses the first one in this table.

**Another provider from the list?** Set all three:

```bash
export LLM_API_KEY="..."
export LLM_BASE_URL="https://api.example.com/v1"   # the provider's "Base URL" from the list
export LLM_MODEL="model-id"                         # a model ID from the list
export LLM_VISION=1                                 # only if that model accepts images
```

`LLM_MODEL` on its own changes the model of the providers in the table, for example `LLM_MODEL=gemini-2.5-flash-lite`.

## 2. Give the key to the app

Treat the key like a password. Never put it in a file you commit to GitHub.

- **Your computer:** `export GEMINI_API_KEY="..."` (Mac/Linux) or `setx GEMINI_API_KEY "..."` (Windows, then open a new terminal). Then run `python app.py` again.
- **GitHub Codespaces:** GitHub → **Settings → Codespaces → Secrets → New secret**, name it `GEMINI_API_KEY`, and allow this repository. Restart the codespace.
- **Google Colab:** click the 🔑 **Secrets** icon in the left sidebar, add `GEMINI_API_KEY`, and switch on **Notebook access**. Then run the optional step 6 in the notebook.

When the key is found, the **Caption & hashtags** part shows up under the finished video. Without a key, that spot shows a short tip instead.

## 3. Use it

1. Make your video as usual.
2. Under **Caption & hashtags**, type what the video is about (optional), for example *"birthday, Cairo at sunset"*, and pick the platform.
3. Tap **Write caption**, then **Copy caption** and paste it into Instagram or TikTok.

Tap **Write caption** again for a different version. Always read it before you post.

## Privacy

- By default, the app sends **only text**: your description, the platform and the name of the colour look.
- Your photo is sent **only if you tick "Let the AI see my photo"**. The app sends a small copy of it (768 px), and only to providers that accept images. It deletes its own copy straight away.
- Free tiers often let the provider use your requests to improve their products (Google and Mistral say so). Leave the photo box unticked if that worries you, and only use photos of yourself or of people who have agreed.

## Limits

Free tiers have rate limits, for example about 15 requests per minute on Gemini Flash. If you see *"The free limit was reached"*, wait a minute. Providers change their free models often. If a model stops working, set `LLM_MODEL` to a current one from the list.

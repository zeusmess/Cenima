"""Optional: write a Reels/TikTok caption and hashtags with a free LLM API.

This never touches the video. It sends a short text request (and, only if you
allow it, a small copy of the photo) to an OpenAI-compatible chat API and
returns the text it writes back.

Set ONE of these environment variables (free keys, no credit card):

    GEMINI_API_KEY      https://aistudio.google.com/app/apikey   (can see the photo)
    GROQ_API_KEY        https://console.groq.com/keys
    OPENROUTER_API_KEY  https://openrouter.ai/keys
    MISTRAL_API_KEY     https://console.mistral.ai/api-keys      (can see the photo)

Or any other OpenAI-compatible provider (see
https://github.com/mnfst/awesome-free-llm-apis) with:

    LLM_API_KEY, LLM_BASE_URL, LLM_MODEL   (and LLM_VISION=1 if it accepts images)

LLM_MODEL also overrides the model of the presets above.
"""

from __future__ import annotations

import base64
import io
import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass

from PIL import Image, ImageOps


@dataclass(frozen=True)
class Provider:
    name: str
    key_env: str
    base_url: str
    model: str
    vision: bool


# Checked in this order; the first one with a key set is used.
PRESETS = (
    Provider("Google Gemini", "GEMINI_API_KEY",
             "https://generativelanguage.googleapis.com/v1beta/openai", "gemini-2.5-flash", True),
    Provider("Groq", "GROQ_API_KEY",
             "https://api.groq.com/openai/v1", "openai/gpt-oss-20b", False),
    Provider("OpenRouter", "OPENROUTER_API_KEY",
             "https://openrouter.ai/api/v1", "google/gemma-4-31b-it:free", False),
    Provider("Mistral AI", "MISTRAL_API_KEY",
             "https://api.mistral.ai/v1", "mistral-small-latest", True),
)

PLATFORMS = {"instagram": "Instagram Reels", "tiktok": "TikTok"}
MAX_DESCRIPTION = 300
TIMEOUT = 60  # seconds


class CaptionError(RuntimeError):
    """A problem worth showing to the user as-is."""


def find_provider(env: dict | None = None) -> tuple[Provider, str] | None:
    """The provider to use and its key, or None when no key is set."""
    env = os.environ if env is None else env
    model = env.get("LLM_MODEL", "").strip()
    if env.get("LLM_API_KEY", "").strip():
        base = env.get("LLM_BASE_URL", "").strip()
        if not base or not model:
            raise CaptionError("LLM_API_KEY is set, so LLM_BASE_URL and LLM_MODEL are needed too.")
        vision = env.get("LLM_VISION", "0").strip() == "1"
        return Provider("Custom", "LLM_API_KEY", base, model, vision), env["LLM_API_KEY"].strip()
    for preset in PRESETS:
        key = env.get(preset.key_env, "").strip()
        if key:
            if model:
                preset = Provider(preset.name, preset.key_env, preset.base_url, model, preset.vision)
            return preset, key
    return None


def _photo_data_url(photo_path: str, size: int = 768) -> str:
    """A small JPEG copy of the photo: enough for the model, quick to send."""
    with Image.open(photo_path) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        img.thumbnail((size, size))
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=85)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def build_messages(description: str, look_label: str, platform: str,
                   photo_url: str | None = None) -> list[dict]:
    platform_name = PLATFORMS.get(platform, PLATFORMS["instagram"])
    system = (
        "You write short, natural social media captions for cinematic portrait videos. "
        "Reply with exactly two parts and nothing else: first the caption (1-2 sentences, "
        "at most 150 characters, at most 2 emoji), then a blank line, then 8-12 relevant "
        "hashtags on one line. Do not invent names, places or facts the user did not give. "
        "Do not describe or judge the person's body or face. Write in the user's language.")
    details = [f"Platform: {platform_name}.", f"Colour look of the video: {look_label}."]
    if description:
        details.append(f"What the video is about, in the user's words: {description}")
    else:
        details.append("The user gave no description; keep it general and moody.")
    text = "\n".join(details)
    if photo_url:
        content: str | list = [{"type": "text", "text": text + "\nThe photo used is attached."},
                               {"type": "image_url", "image_url": {"url": photo_url}}]
    else:
        content = text
    return [{"role": "system", "content": system}, {"role": "user", "content": content}]


def _error_detail(exc: urllib.error.HTTPError) -> str:
    """The provider's own error message (e.g. Gemini's "API key not valid"), shortened."""
    try:
        body = json.loads(exc.read().decode("utf-8", "replace"))
    except (OSError, ValueError):
        return ""
    if isinstance(body, list) and body:  # Gemini wraps the error in a list
        body = body[0]
    error = body.get("error") if isinstance(body, dict) else None
    message = error.get("message") if isinstance(error, dict) else error
    return " ".join(str(message).split())[:200] if message else ""


def _post(url: str, key: str, payload: dict) -> dict:
    request = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"), method="POST",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            raise CaptionError("The API key was refused. Check it in the provider's dashboard.") from exc
        if exc.code == 429:
            raise CaptionError("The free limit was reached. Wait a minute and try again.") from exc
        detail = _error_detail(exc)
        raise CaptionError(f"The AI service returned an error (HTTP {exc.code})"
                           + (f": {detail}" if detail else ".")) from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise CaptionError("Could not reach the AI service. Check the internet connection.") from exc


def write_caption(description: str = "", look_label: str = "", platform: str = "instagram",
                  photo_path: str | None = None, env: dict | None = None, post=_post) -> dict:
    """Ask the configured LLM for a caption. Returns {"text", "provider", "used_photo"}."""
    found = find_provider(env)
    if not found:
        raise CaptionError("No AI key is set up. See docs/AI_CAPTIONS.md.")
    provider, key = found
    description = " ".join(description.split())[:MAX_DESCRIPTION]
    photo_url = _photo_data_url(photo_path) if photo_path and provider.vision else None

    data = post(provider.base_url.rstrip("/") + "/chat/completions", key, {
        "model": provider.model,
        "messages": build_messages(description, look_label, platform, photo_url),
        "temperature": 0.8,
        "max_tokens": 1024,  # reasoning models spend part of this before answering
    })
    try:
        text = data["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError, TypeError) as exc:
        raise CaptionError("The AI service sent back an answer this app does not understand.") from exc
    text = text.strip()
    if not text:
        raise CaptionError("The AI service sent back an empty answer. Try again.")
    return {"text": text, "provider": provider.name, "used_photo": photo_url is not None}

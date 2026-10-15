"""AI caption feature, tested offline with a fake HTTP call.  Run with:  python -m pytest -q"""

from __future__ import annotations

import io
import os
import sys

import pytest
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from cinematic import captions  # noqa: E402
from cinematic.captions import CaptionError, find_provider, write_caption  # noqa: E402


def fake_post(reply="Golden hour, slowed down. ✨\n\n#cinematic #portrait"):
    calls = []

    def post(url, key, payload):
        calls.append((url, key, payload))
        return {"choices": [{"message": {"content": reply}}]}
    return post, calls


def test_no_key_means_no_provider():
    assert find_provider({}) is None
    with pytest.raises(CaptionError):
        write_caption(env={})


def test_preset_order_and_model_override():
    provider, key = find_provider({"GROQ_API_KEY": "g", "GEMINI_API_KEY": "k"})
    assert provider.name == "Google Gemini" and key == "k"
    provider, _ = find_provider({"GROQ_API_KEY": "g", "LLM_MODEL": "other"})
    assert provider.name == "Groq" and provider.model == "other"


def test_custom_provider_needs_url_and_model():
    with pytest.raises(CaptionError):
        find_provider({"LLM_API_KEY": "x"})
    provider, _ = find_provider({"LLM_API_KEY": "x", "LLM_BASE_URL": "https://h/v1",
                                 "LLM_MODEL": "m", "LLM_VISION": "1"})
    assert provider.vision and provider.model == "m"


def test_text_only_request(tmp_path):
    post, calls = fake_post()
    photo = tmp_path / "p.jpg"
    Image.new("RGB", (40, 60), (200, 150, 120)).save(photo)
    result = write_caption("birthday  in\nCairo", "Warm Film", "tiktok",
                           photo_path=str(photo), env={"GROQ_API_KEY": "g"}, post=post)
    url, key, payload = calls[0]
    assert url == "https://api.groq.com/openai/v1/chat/completions" and key == "g"
    user = payload["messages"][1]["content"]
    assert isinstance(user, str), "Groq preset is text-only, so the photo must not be sent"
    assert "birthday in Cairo" in user and "TikTok" in user and "Warm Film" in user
    assert result == {"text": "Golden hour, slowed down. ✨\n\n#cinematic #portrait",
                      "provider": "Groq", "used_photo": False}


def test_photo_sent_small_to_vision_provider(tmp_path):
    post, calls = fake_post()
    photo = tmp_path / "big.png"
    Image.new("RGB", (3000, 4000), (10, 20, 30)).save(photo)
    result = write_caption(photo_path=str(photo), env={"GEMINI_API_KEY": "k"}, post=post)
    parts = calls[0][2]["messages"][1]["content"]
    data_url = parts[1]["image_url"]["url"]
    assert data_url.startswith("data:image/jpeg;base64,")
    import base64
    img = Image.open(io.BytesIO(base64.b64decode(data_url.split(",", 1)[1])))
    assert max(img.size) == 768
    assert result["used_photo"]


def test_empty_or_odd_answers_raise():
    for reply in ("", None):
        post, _ = fake_post(reply)
        with pytest.raises(CaptionError):
            write_caption(env={"GEMINI_API_KEY": "k"}, post=post)
    with pytest.raises(CaptionError):
        write_caption(env={"GEMINI_API_KEY": "k"}, post=lambda *a: {"error": "x"})


def test_web_endpoint(monkeypatch):
    import app as web
    seen = {}

    def fake_write_caption(**kwargs):
        seen.update(kwargs)
        assert kwargs["photo_path"] and os.path.isfile(kwargs["photo_path"])
        return {"text": "hi", "provider": "Fake", "used_photo": True}
    monkeypatch.setattr(web, "write_caption", fake_write_caption)

    buf = io.BytesIO()
    Image.new("RGB", (20, 20)).save(buf, "JPEG")
    buf.seek(0)
    client = web.app.test_client()
    response = client.post("/api/caption", data={
        "description": "x", "platform": "nope", "look": "warm_film", "use_photo": "1",
        "photo": (buf, "me.jpg")}, content_type="multipart/form-data")
    assert response.status_code == 200 and response.get_json()["text"] == "hi"
    assert seen["platform"] == "instagram" and seen["look_label"].startswith("Warm Film")
    assert not os.path.exists(seen["photo_path"]), "the uploaded copy must be deleted"

    monkeypatch.setattr(web, "write_caption",
                        lambda **k: (_ for _ in ()).throw(CaptionError("No AI key")))
    response = client.post("/api/caption", data={})
    assert response.status_code == 502 and response.get_json()["error"] == "No AI key"


def test_page_shows_tip_or_caption_section(monkeypatch):
    import app as web
    for name in [p.key_env for p in captions.PRESETS] + ["LLM_API_KEY"]:
        monkeypatch.delenv(name, raising=False)
    client = web.app.test_client()
    html = client.get("/").get_data(as_text=True)
    assert "docs/AI_CAPTIONS.md" in html and 'id="captionGo"' not in html

    monkeypatch.setenv("GEMINI_API_KEY", "k")
    html = client.get("/").get_data(as_text=True)
    assert 'id="captionGo"' in html and 'id="captionPhoto"' in html

    monkeypatch.delenv("GEMINI_API_KEY")
    monkeypatch.setenv("GROQ_API_KEY", "g")
    html = client.get("/").get_data(as_text=True)
    assert 'id="captionGo"' in html and 'id="captionPhoto"' not in html

    monkeypatch.setenv("LLM_API_KEY", "x")  # set, but no LLM_BASE_URL / LLM_MODEL
    html = client.get("/").get_data(as_text=True)
    assert "LLM_BASE_URL and LLM_MODEL are needed" in html and 'id="captionGo"' not in html

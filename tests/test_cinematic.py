"""Run with:  python -m pytest -q"""

from __future__ import annotations

import io
import os
import subprocess
import sys

import cv2
import numpy as np
import pytest
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from cinematic import Settings, render_video  # noqa: E402
from cinematic import camera  # noqa: E402
from cinematic.face import FaceBox  # noqa: E402
from cinematic.ffmpeg_tools import find_ffmpeg  # noqa: E402
from cinematic.looks import LOOKS, apply_look  # noqa: E402

SKIN = (224, 172, 140)


def make_portrait(path: str, size=(1200, 1600)) -> None:
    """A synthetic 'portrait': gradient background and a perfectly round,
    skin-coloured disc where a face would be (to measure distortion)."""
    w, h = size
    y, x = np.mgrid[0:h, 0:w]
    img = np.zeros((h, w, 3), np.uint8)
    img[..., 0] = 40 + 80 * x / w
    img[..., 1] = 60 + 60 * y / h
    img[..., 2] = 110
    cx, cy, r = w // 2, int(h * 0.36), int(w * 0.16)
    cv2.circle(img, (cx, cy), r, SKIN, -1, lineType=cv2.LINE_AA)
    Image.fromarray(img).save(path, quality=95)


def video_frames(path: str):
    cap = cv2.VideoCapture(path)
    frames = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    cap.release()
    return frames


def probe(path: str) -> str:
    out = subprocess.run([find_ffmpeg(), "-hide_banner", "-i", path],
                         capture_output=True, text=True)
    return out.stderr


@pytest.fixture(scope="module")
def portrait(tmp_path_factory) -> str:
    path = str(tmp_path_factory.mktemp("img") / "portrait.jpg")
    make_portrait(path)
    return path


@pytest.mark.parametrize("motion", ["story", "push"])
def test_camera_is_always_distortion_free(motion):
    """Every frame uses one uniform scale (no stretch, no shear)."""
    shots = camera.plan_shots(motion, 10, 0.5, 0.36, 0.2, 1.6, 0.8)
    for shot in shots:
        for u in np.linspace(0, 1, 25):
            st = camera.interpolate(shot.start, shot.end, u)
            m = camera.similarity_matrix(st, 1500, 2667, 1080, 1920)
            assert camera.is_similarity(m)
            # The view never leaves the photo (no black borders).
            corners = np.array([[0, 0], [1080, 0], [0, 1920], [1080, 1920]], float)
            inv = cv2.invertAffineTransform(m)
            src = corners @ inv[:, :2].T + inv[:, 2]
            assert (src[:, 0] >= -0.5).all() and (src[:, 0] <= 1500.5).all()
            assert (src[:, 1] >= -0.5).all() and (src[:, 1] <= 2667.5).all()


@pytest.mark.parametrize("look", [k for k, v in LOOKS.items() if not v.mono])
def test_grading_keeps_skin_hue(look):
    img = np.zeros((400, 300, 3), np.uint8)
    img[:] = (30, 60, 90)
    img[100:250, 80:220] = SKIN
    face = FaceBox(80, 100, 140, 150, True)
    out = (apply_look(img, LOOKS[look], face) * 255).round().astype(np.uint8)
    hue_in = cv2.cvtColor(img[150:200, 120:180], cv2.COLOR_RGB2HSV_FULL)[..., 0].mean()
    hue_out = cv2.cvtColor(out[150:200, 120:180], cv2.COLOR_RGB2HSV_FULL)[..., 0].mean()
    # HSV_FULL hue is 0..255 for 360 degrees; allow ~3 degrees.
    assert abs(hue_in - hue_out) < 2.2, (hue_in, hue_out)


def test_render_mp4_for_reels(portrait, tmp_path):
    out = str(tmp_path / "reel.mp4")
    result = render_video(portrait, out, Settings(duration=4, quality="fast"))
    assert os.path.getsize(out) > 50_000
    assert result.frames == 120

    info = probe(out)
    assert "Video: h264 (High)" in info
    assert "yuv420p" in info and "1080x1920" in info
    assert "30 fps" in info
    assert "Audio: aac" in info

    frames = video_frames(out)
    assert len(frames) == 120
    assert frames[0].shape == (1920, 1080, 3)
    assert frames[0].mean() < 30          # starts from black (fade in)
    assert frames[60].mean() > 50         # real picture in the middle
    # Consecutive frames differ: the camera is moving.
    assert np.abs(frames[40].astype(int) - frames[41].astype(int)).mean() > 0.3


def test_face_disc_stays_round(portrait, tmp_path):
    """End-to-end check that the 'face' is never stretched in the video."""
    out = str(tmp_path / "clean.mp4")
    render_video(portrait, out, Settings(duration=4, look="natural", grain=0, light_leaks=0,
                                         bokeh=0, fade_in=False, fade_out=False,
                                         quality="fast"))
    for frame in video_frames(out)[::15]:
        hsv = cv2.cvtColor(frame, cv2.COLOR_RGB2HSV)
        mask = cv2.inRange(hsv, (0, 50, 120), (25, 200, 255))
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        disc = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(disc)
        assert w > 100
        assert abs(w / h - 1.0) < 0.03, (w, h)


def test_landscape_photo_uses_layers(tmp_path):
    path = str(tmp_path / "wide.jpg")
    make_portrait(path, size=(1800, 1200))
    out = str(tmp_path / "wide.mp4")
    result = render_video(path, out, Settings(duration=3, motion="push", quality="fast"))
    assert result.fit == "layered"
    assert len(video_frames(out)) == 90


def test_music_is_used(portrait, tmp_path):
    music = str(tmp_path / "tone.wav")
    subprocess.run([find_ffmpeg(), "-v", "error", "-f", "lavfi", "-i",
                    "sine=frequency=440:duration=2", music], check=True)
    out = str(tmp_path / "music.mp4")
    render_video(portrait, out, Settings(duration=3, music=music, quality="fast"))
    info = probe(out)
    assert "Audio: aac" in info and "Duration: 00:00:03" in info


def test_bad_settings_are_rejected(portrait, tmp_path):
    with pytest.raises(ValueError):
        render_video(portrait, str(tmp_path / "x.mp4"), Settings(duration=100))
    with pytest.raises(ValueError):
        render_video(portrait, str(tmp_path / "x.mp4"), Settings(look="nope"))


def test_not_an_image(tmp_path):
    bad = tmp_path / "bad.jpg"
    bad.write_text("hello")
    with pytest.raises(ValueError):
        render_video(str(bad), str(tmp_path / "x.mp4"), Settings(duration=3))


def test_web_app_flow(portrait, monkeypatch):
    import app as webapp

    client = webapp.app.test_client()
    assert client.get("/").status_code == 200

    with open(portrait, "rb") as fh:
        data = {"photo": (io.BytesIO(fh.read()), "me.jpg"), "duration": "5",
                "look": "warm_film", "motion": "push"}
    resp = client.post("/api/render", data=data, content_type="multipart/form-data")
    assert resp.status_code == 200, resp.get_json()
    job_id = resp.get_json()["job_id"]

    import time
    for _ in range(240):
        job = client.get(f"/api/jobs/{job_id}").get_json()
        if job["status"] in ("done", "error"):
            break
        time.sleep(0.5)
    assert job["status"] == "done", job

    video = client.get(job["download_url"])
    assert video.status_code == 200
    assert video.mimetype == "video/mp4"
    assert "attachment" in video.headers["Content-Disposition"]
    assert len(video.data) > 50_000

    missing = client.post("/api/render", data={}, content_type="multipart/form-data")
    assert missing.status_code == 400

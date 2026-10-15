#!/usr/bin/env python3
"""Mobile-friendly web app: upload a portrait, get a cinematic video back.

Run it with:
    python app.py

Then open the address it prints (on this computer, or on your phone if it is
on the same Wi-Fi). This is meant for personal use, not for the open internet.
"""

from __future__ import annotations

import os
import socket
import threading
import time
import uuid

from flask import Flask, abort, jsonify, render_template, request, send_file

from cinematic import LOOKS, Settings, render_video
from cinematic.captions import PLATFORMS, CaptionError, find_provider, write_caption

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WORK_DIR = os.path.join(BASE_DIR, "work")
UPLOAD_DIR = os.path.join(WORK_DIR, "uploads")
OUTPUT_DIR = os.path.join(WORK_DIR, "outputs")
KEEP_FILES_FOR = 3 * 60 * 60  # seconds; old uploads/videos are deleted after this

PHOTO_TYPES = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".bmp", ".tif", ".tiff"}
MUSIC_TYPES = {".mp3", ".m4a", ".aac", ".wav", ".ogg"}

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 60 * 1024 * 1024  # 60 MB per upload

jobs: dict[str, dict] = {}
jobs_lock = threading.Lock()
render_slot = threading.Semaphore(1)  # one video at a time keeps small machines happy


def _cleanup_old_files() -> None:
    now = time.time()
    for folder in (UPLOAD_DIR, OUTPUT_DIR):
        for name in os.listdir(folder):
            path = os.path.join(folder, name)
            try:
                if now - os.path.getmtime(path) > KEEP_FILES_FOR:
                    os.remove(path)
            except OSError:
                pass
    with jobs_lock:
        for job_id in [j for j, job in jobs.items() if now - job["created"] > KEEP_FILES_FOR]:
            jobs.pop(job_id, None)


def _update(job_id: str, **fields) -> None:
    with jobs_lock:
        jobs[job_id].update(fields)


def _run_job(job_id: str, photo: str, output: str, settings: Settings) -> None:
    _update(job_id, status="queued", message="Waiting for the previous video to finish")
    with render_slot:
        _update(job_id, status="rendering", message="Starting")
        try:
            result = render_video(
                photo, output, settings,
                progress=lambda frac, msg: _update(job_id, progress=round(frac, 3), message=msg))
            note = "" if result.face_detected else (
                "No face was detected, so the camera assumed it is in the upper middle.")
            _update(job_id, status="done", progress=1.0, message="Your video is ready!",
                    note=note, seconds=round(result.seconds))
        except Exception as exc:  # show any problem to the user instead of hanging
            _update(job_id, status="error", message=str(exc))
        finally:
            for path in (photo, settings.music):
                if path:
                    try:
                        os.remove(path)
                    except OSError:
                        pass


def _number(name: str, default: float, lo: float, hi: float) -> float:
    try:
        value = float(request.form.get(name, default))
    except ValueError:
        value = default
    return min(hi, max(lo, value))


@app.get("/")
def index():
    provider, error = None, ""
    try:
        found = find_provider()
        provider = found[0] if found else None
    except CaptionError as exc:  # a key is set but the setup is incomplete
        error = str(exc)
    return render_template("index.html", looks=LOOKS, caption_provider=provider,
                           caption_error=error)


@app.post("/api/caption")
def caption():
    look = request.form.get("look", "")
    platform = request.form.get("platform", "instagram")
    photo_path = None
    photo = request.files.get("photo")
    if request.form.get("use_photo") == "1" and photo and photo.filename:
        ext = os.path.splitext(photo.filename)[1].lower() or ".jpg"
        if ext not in PHOTO_TYPES:
            return jsonify(error="Please upload a JPG or PNG photo."), 400
        photo_path = os.path.join(UPLOAD_DIR, f"caption_{uuid.uuid4().hex[:12]}{ext}")
        photo.save(photo_path)
    try:
        result = write_caption(
            description=request.form.get("description", ""),
            look_label=LOOKS[look].label if look in LOOKS else "",
            platform=platform if platform in PLATFORMS else "instagram",
            photo_path=photo_path)
    except CaptionError as exc:
        return jsonify(error=str(exc)), 502
    except Exception:  # e.g. a photo Pillow cannot open
        return jsonify(error="Could not write a caption."), 500
    finally:
        if photo_path:
            try:
                os.remove(photo_path)
            except OSError:
                pass
    return jsonify(result)


@app.post("/api/render")
def start_render():
    _cleanup_old_files()

    photo = request.files.get("photo")
    if not photo or not photo.filename:
        return jsonify(error="Please choose a photo first."), 400
    ext = os.path.splitext(photo.filename)[1].lower() or ".jpg"
    if ext not in PHOTO_TYPES:
        return jsonify(error="Please upload a JPG or PNG photo."), 400

    job_id = uuid.uuid4().hex[:12]
    photo_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")
    photo.save(photo_path)

    music_path = None
    music = request.files.get("music")
    if music and music.filename:
        mext = os.path.splitext(music.filename)[1].lower()
        if mext not in MUSIC_TYPES:
            os.remove(photo_path)
            return jsonify(error="Music must be an MP3, M4A, AAC, WAV or OGG file."), 400
        music_path = os.path.join(UPLOAD_DIR, f"{job_id}_music{mext}")
        music.save(music_path)

    look = request.form.get("look", "teal_orange")
    motion = request.form.get("motion", "story")
    transition = request.form.get("transition", "leak")
    settings = Settings(
        duration=_number("duration", 10, 5, 30),
        look=look if look in LOOKS else "teal_orange",
        motion=motion if motion in ("story", "push") else "story",
        transition=transition if transition in ("leak", "glide", "dip") else "leak",
        grain=_number("grain", 0.5, 0, 1),
        light_leaks=_number("leaks", 0.5, 0, 1),
        bokeh=_number("bokeh", 0.4, 0, 1),
        fade_out=request.form.get("fade_out", "1") == "1",
        music=music_path,
        quality="standard",
    )

    output_name = f"cinematic_{job_id}.mp4"
    with jobs_lock:
        jobs[job_id] = dict(status="queued", progress=0.0, message="Queued", note="",
                            created=time.time(), file=output_name)
    threading.Thread(target=_run_job, daemon=True,
                     args=(job_id, photo_path, os.path.join(OUTPUT_DIR, output_name),
                           settings)).start()
    return jsonify(job_id=job_id)


@app.get("/api/jobs/<job_id>")
def job_status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
        if not job:
            return jsonify(error="This job was not found (it may have expired)."), 404
        data = {k: v for k, v in job.items() if k != "created"}
    if data["status"] == "done":
        data["video_url"] = f"/video/{job_id}"
        data["download_url"] = f"/video/{job_id}?download=1"
    return jsonify(data)


@app.get("/video/<job_id>")
def video(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if not job or job["status"] != "done":
        abort(404)
    path = os.path.join(OUTPUT_DIR, job["file"])
    if not os.path.isfile(path):
        abort(404)
    return send_file(path, mimetype="video/mp4", conditional=True,
                     as_attachment=request.args.get("download") == "1",
                     download_name="cinematic_portrait.mp4")


@app.errorhandler(413)
def too_large(_):
    return jsonify(error="That file is too big (limit 60 MB)."), 413


def _lan_ip() -> str | None:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))
            return s.getsockname()[0]
    except OSError:
        return None


def main() -> None:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    port = int(os.environ.get("PORT", "5000"))
    print("\n  Cinematic Portrait is running!")
    print(f"  On this computer:  http://localhost:{port}")
    ip = _lan_ip()
    if ip:
        print(f"  On your phone (same Wi-Fi):  http://{ip}:{port}")
    print("  Press Ctrl+C to stop.\n")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)


os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

if __name__ == "__main__":
    main()

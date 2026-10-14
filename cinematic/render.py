"""Turn one portrait photo into a 1080x1920 cinematic MP4.

Pipeline (per video):
  1. Load the photo (fixing phone rotation) and find the face.
  2. Build a 9:16 "canvas": crop around the face, or - for wide photos -
     place the photo over a blurred copy of itself (two depth layers).
  3. Colour-grade the canvas once, protecting skin tones.
Pipeline (per frame):
  4. Move the virtual camera (uniform zoom/shift/tiny roll only).
  5. Add light leaks, bokeh, vignette and film grain.
  6. Send the frame to FFmpeg, which encodes the MP4.
"""

from __future__ import annotations

import math
import os
import subprocess
import tempfile
import time
from dataclasses import dataclass, field
from typing import Callable

import cv2
import numpy as np
from PIL import Image, ImageOps

from . import camera
from .effects import Bokeh, FilmGrain, LightLeaks, overlay_layers, screen
from .face import FaceBox, detect_face
from .ffmpeg_tools import build_encode_command, find_ffmpeg
from .looks import DEFAULT_LOOK, LOOKS, apply_look, vignette_mask

OUT_W, OUT_H = 1080, 1920
TARGET_ASPECT = OUT_W / OUT_H

ProgressFn = Callable[[float, str], None]


@dataclass
class Settings:
    duration: float = 10.0          # seconds (3 - 60)
    fps: int = 30
    look: str = DEFAULT_LOOK        # see looks.LOOKS
    motion: str = "story"           # "story" (3 shots) or "push" (one long push-in)
    transition: str = "leak"        # "leak" (glide + light flash), "glide" or "dip"
    fit: str = "auto"               # "auto", "fill" (crop) or "layered" (blurred background)
    grain: float = 0.5              # 0 - 1
    light_leaks: float = 0.5        # 0 - 1
    bokeh: float = 0.4              # 0 - 1
    fade_in: bool = True
    fade_out: bool = True
    music: str | None = None        # optional audio file
    quality: str = "standard"       # "fast", "standard" or "high"
    seed: int = 7

    def validate(self) -> None:
        if not 3 <= self.duration <= 60:
            raise ValueError("duration must be between 3 and 60 seconds")
        if self.fps not in (24, 25, 30, 60):
            raise ValueError("fps must be 24, 25, 30 or 60")
        if self.look not in LOOKS:
            raise ValueError(f"look must be one of: {', '.join(LOOKS)}")
        if self.motion not in ("story", "push"):
            raise ValueError("motion must be 'story' or 'push'")
        if self.transition not in ("leak", "glide", "dip"):
            raise ValueError("transition must be 'leak', 'glide' or 'dip'")
        if self.fit not in ("auto", "fill", "layered"):
            raise ValueError("fit must be 'auto', 'fill' or 'layered'")
        for name in ("grain", "light_leaks", "bokeh"):
            if not 0 <= getattr(self, name) <= 1:
                raise ValueError(f"{name} must be between 0 and 1")
        if self.music and not os.path.isfile(self.music):
            raise ValueError(f"music file not found: {self.music}")


@dataclass
class RenderResult:
    output_path: str
    frames: int
    seconds: float
    face_detected: bool
    fit: str
    info: dict = field(default_factory=dict)


# --------------------------------------------------------------------------
# Loading and canvas preparation
# --------------------------------------------------------------------------

def load_image(path: str) -> np.ndarray:
    """Load any common photo format as RGB uint8, respecting phone rotation."""
    try:  # iPhone HEIC photos, if the optional plugin is installed
        from pillow_heif import register_heif_opener

        register_heif_opener()
    except ImportError:
        pass
    try:
        img = Image.open(path)
        img = ImageOps.exif_transpose(img)
    except Exception as exc:
        raise ValueError(
            f"Could not open the image ({exc}). Please use a JPG or PNG photo."
        ) from exc
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGBA", img.size, (0, 0, 0, 255))
        img = Image.alpha_composite(bg, img)
    img = img.convert("RGB")
    if min(img.size) < 200:
        raise ValueError("The photo is too small. Please use a photo at least 720 px wide.")
    return np.asarray(img).copy()


def _resize(img: np.ndarray, w: int, h: int) -> np.ndarray:
    shrinking = w < img.shape[1]
    return cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA if shrinking
                      else cv2.INTER_LANCZOS4)


def _crop_box(src_w: int, src_h: int, face: FaceBox) -> tuple[int, int, int, int]:
    """Largest 9:16 box inside the photo, positioned to frame the face."""
    if src_w / src_h > TARGET_ASPECT:
        h = src_h
        w = int(round(h * TARGET_ASPECT))
    else:
        w = src_w
        h = int(round(w / TARGET_ASPECT))
    x = int(round(face.cx - w / 2))
    y = int(round(face.cy - h * 0.38))  # face a bit above the middle
    x = min(max(x, 0), src_w - w)
    y = min(max(y, 0), src_h - h)
    return x, y, w, h


@dataclass
class Canvas:
    fg: np.ndarray                 # float32 RGB 0..1 (graded)
    alpha: np.ndarray | None       # float32 0..1, only for the layered mode
    bg: np.ndarray | None          # float32 RGB, only for the layered mode
    face: FaceBox                  # in canvas pixels
    max_zoom: float
    fit: str

    @property
    def w(self) -> int:
        return self.fg.shape[1]

    @property
    def h(self) -> int:
        return self.fg.shape[0]


def prepare_canvas(rgb: np.ndarray, face: FaceBox, settings: Settings) -> Canvas:
    src_h, src_w = rgb.shape[:2]
    look = LOOKS[settings.look]

    fit = settings.fit
    if fit == "auto":
        # Portrait photos (incl. 3:4 and 4:5 phone photos) fill the frame;
        # square/landscape photos get the layered treatment so nobody is cut off.
        fit = "fill" if src_w / src_h <= 0.85 else "layered"

    if fit == "fill":
        x, y, w, h = _crop_box(src_w, src_h, face)
        # Zoom as far as the photo's resolution allows while staying sharp.
        max_zoom = float(np.clip(h / OUT_H * 1.3, 1.25, 1.9))
        ch = int(round(OUT_H * max_zoom))
        cw = int(round(ch * TARGET_ASPECT))
        s = cw / w
        crop = _resize(rgb[y:y + h, x:x + w], cw, ch)
        cface = face.shifted_scaled(-x, -y, s)
        graded = apply_look(crop, look, cface)
        return Canvas(graded, None, None, cface, max_zoom, fit)

    # Layered mode: sharp photo in front, blurred copy behind.
    fit_h_by_w = src_h * TARGET_ASPECT / src_w  # photo height on canvas if it fills the width
    fg_frac = min(1.0, fit_h_by_w)  # fraction of canvas height used by the photo
    max_zoom = float(np.clip(src_h / (OUT_H * fg_frac) * 1.3, 1.2, 1.7))
    ch = int(round(OUT_H * max_zoom))
    cw = int(round(ch * TARGET_ASPECT))

    fw = cw
    fh = int(round(src_h * cw / src_w))
    if fh > ch:  # (only for unusual shapes)
        fh = ch
        fw = int(round(src_w * ch / src_h))
    fx, fy = (cw - fw) // 2, (ch - fh) // 2
    s = fw / src_w

    photo = _resize(rgb, fw, fh)
    pface = face.shifted_scaled(0, 0, s)
    photo_graded = apply_look(photo, look, pface)

    fg = np.zeros((ch, cw, 3), np.float32)
    fg[fy:fy + fh, fx:fx + fw] = photo_graded
    alpha = np.zeros((ch, cw), np.float32)
    alpha[fy:fy + fh, fx:fx + fw] = 1.0
    feather = max(1, int(cw * 0.002)) * 2 + 1
    alpha = cv2.GaussianBlur(alpha, (feather, feather), 0)

    # Background: cover-crop, heavily blurred, darker and a bit desaturated.
    bx, by, bw, bh = _crop_box(src_w, src_h, face)
    small = _resize(rgb[by:by + bh, bx:bx + bw], cw // 6, ch // 6)
    small = apply_look(small, look, None)
    small = cv2.GaussianBlur(small, (0, 0), small.shape[1] * 0.04)
    grey = small.mean(axis=2, keepdims=True)
    small = (grey + (small - grey) * 0.7) * 0.55
    bg = cv2.resize(small, (cw, ch), interpolation=cv2.INTER_CUBIC)
    # Soft shadow under the photo for depth.
    shadow = cv2.GaussianBlur(alpha, (0, 0), cw * 0.02)
    bg *= (1.0 - 0.45 * shadow)[..., None]

    cface = FaceBox(pface.x + fx, pface.y + fy, pface.w, pface.h, face.detected)
    return Canvas(fg, alpha, bg, cface, max_zoom, fit)


# --------------------------------------------------------------------------
# Frame rendering
# --------------------------------------------------------------------------

def _warp(img: np.ndarray, m: np.ndarray, interp: int = cv2.INTER_CUBIC) -> np.ndarray:
    return cv2.warpAffine(img, m, (OUT_W, OUT_H), flags=interp, borderMode=cv2.BORDER_REFLECT)


def render_shot(canvas: Canvas, state: camera.CameraState) -> tuple[np.ndarray, np.ndarray]:
    """Render one camera view. Returns (frame, matrix)."""
    m = camera.similarity_matrix(state, canvas.w, canvas.h, OUT_W, OUT_H)
    frame = _warp(canvas.fg, m)
    if canvas.bg is not None:
        # Background layer moves about half as much as the photo -> parallax.
        bg_state = camera.CameraState(
            cx=0.5 + (state.cx - 0.5) * 0.5,
            cy=0.5 + (state.cy - 0.5) * 0.5,
            zoom=1.05 + (state.zoom - 1.0) * 0.45,
            rot=state.rot * 0.5,
        )
        bm = camera.similarity_matrix(bg_state, canvas.w, canvas.h, OUT_W, OUT_H)
        bg = _warp(canvas.bg, bm, cv2.INTER_LINEAR)
        a = _warp(canvas.alpha, m, cv2.INTER_LINEAR)[..., None]
        frame = frame * a + bg * (1.0 - a)
    return frame, m


def _state_at(shot: camera.Shot, t: float, seed: int) -> camera.CameraState:
    u = (t - shot.t0) / max(1e-6, shot.t1 - shot.t0)
    st = camera.interpolate(shot.start, shot.end, camera.ease_in_out(u))
    dx, dy, dr = camera.float_offset(t, 0.0035 / st.zoom, seed)
    return camera.CameraState(st.cx + dx, st.cy + dy, st.zoom, st.rot + dr)


def render_video(input_path: str, output_path: str, settings: Settings | None = None,
                 progress: ProgressFn | None = None) -> RenderResult:
    settings = settings or Settings()
    settings.validate()
    progress = progress or (lambda frac, msg: None)
    started = time.time()

    progress(0.0, "Loading photo")
    rgb = load_image(input_path)
    face = detect_face(rgb)

    progress(0.03, "Colour grading")
    canvas = prepare_canvas(rgb, face, settings)
    del rgb

    fps, duration = settings.fps, settings.duration
    n_frames = int(round(fps * duration))
    trans = min(1.0, duration / 8)

    face_cx, face_cy = canvas.face.cx / canvas.w, canvas.face.cy / canvas.h
    face_h = canvas.face.h / canvas.h
    shots = camera.plan_shots(settings.motion, duration, face_cx, face_cy, face_h,
                              canvas.max_zoom, trans)
    cut_times = [s.t0 + trans / 2 for s in shots[1:]]

    look = LOOKS[settings.look]
    vignette = cv2.merge([vignette_mask(OUT_W, OUT_H, look.vignette)] * 3)
    grain = FilmGrain(OUT_W, OUT_H, settings.grain * 0.075, settings.seed)
    leaks = LightLeaks(OUT_W, OUT_H, settings.light_leaks * 0.55, settings.seed,
                       cut_times if settings.transition == "leak" else [], duration)
    bokeh = Bokeh(OUT_W, OUT_H, settings.bokeh * 0.35, settings.seed)

    ffmpeg = find_ffmpeg()
    cmd = build_encode_command(ffmpeg, output_path, OUT_W, OUT_H, fps, duration,
                               settings.music, settings.quality)
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    errlog = tempfile.TemporaryFile()
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=errlog)

    try:
        for i in range(n_frames):
            t = i / fps

            # Which shot(s) are on screen right now?
            active = [s for s in shots if s.t0 - 1e-9 <= t <= s.t1 + 1e-9] or [shots[-1]]
            main = active[-1]
            state = _state_at(main, t, settings.seed)
            fade_between = 1.0
            if len(active) > 1:
                prev_state = _state_at(active[0], t, settings.seed)
                u = camera.ease_in_out((t - main.t0) / trans)
                if settings.transition == "dip":
                    # Dip to black: old shot fades out, then the new one fades in.
                    state = prev_state if u < 0.5 else state
                    fade_between = abs(1.0 - 2.0 * u)
                else:
                    # Glide: the camera itself flies from one framing to the next.
                    # Only one image is ever shown, so there is no double-exposed face.
                    state = camera.interpolate(prev_state, state, u)
            frame, m = render_shot(canvas, state)

            # Where is the face in this frame? (used to keep effects off it)
            fx = (m[0, 0] * canvas.face.cx + m[0, 1] * canvas.face.cy + m[0, 2]) / OUT_W
            fy = (m[1, 0] * canvas.face.cx + m[1, 1] * canvas.face.cy + m[1, 2]) / OUT_H
            fr = canvas.face.h * math.hypot(m[0, 0], m[0, 1]) / OUT_W * 0.75

            light = overlay_layers([
                bokeh.layer(t, state.cx - 0.5, state.cy - 0.5, state.zoom, (fx, fy), fr),
                leaks.layer(t, (fx, fy), fr),
            ], OUT_W, OUT_H)
            if light is not None:
                frame = screen(frame, light)

            frame = grain.apply(cv2.multiply(frame, vignette))

            fade = fade_between
            if settings.fade_in:
                fade *= camera.ease_out(t / 0.6)
            if settings.fade_out:
                fade *= camera.ease_in_out((duration - t) / 0.8)
            # Remove negatives first, then scale to 0..255 with rounding and
            # clipping in one fast step (convertScaleAbs would mirror negatives).
            out = cv2.convertScaleAbs(cv2.max(frame, 0.0), alpha=255.0 * fade)
            proc.stdin.write(out.tobytes())

            if i % 5 == 0:
                progress(0.05 + 0.93 * i / n_frames, f"Rendering frame {i + 1} of {n_frames}")

        proc.stdin.close()
        progress(0.98, "Finishing the MP4")
        code = proc.wait()
    except BrokenPipeError:
        code = proc.wait()
    except BaseException:
        proc.kill()
        proc.wait()
        raise

    if code != 0:
        errlog.seek(0)
        msg = errlog.read().decode(errors="replace").strip()[-2000:]
        raise RuntimeError(f"FFmpeg failed (exit code {code}):\n{msg}")
    errlog.close()

    progress(1.0, "Done")
    return RenderResult(
        output_path=output_path,
        frames=n_frames,
        seconds=time.time() - started,
        face_detected=face.detected,
        fit=canvas.fit,
        info={"max_zoom": round(canvas.max_zoom, 3), "shots": len(shots)},
    )

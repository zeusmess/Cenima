"""Virtual camera moves (push-in, drift, gentle float) over a still photo.

The camera only ever applies a *similarity* transform to the photo: one
uniform scale, a tiny rotation and a shift. Width and height are always
scaled by exactly the same amount and nothing is bent or warped, so the
face keeps its exact proportions in every frame.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class CameraState:
    cx: float    # view centre, 0..1 across the canvas
    cy: float    # view centre, 0..1 down the canvas
    zoom: float  # 1 = whole canvas visible, 2 = half of it
    rot: float = 0.0  # degrees (kept tiny)


@dataclass(frozen=True)
class Shot:
    start: CameraState
    end: CameraState
    t0: float  # seconds
    t1: float


def ease_in_out(u: float) -> float:
    u = min(1.0, max(0.0, u))
    return u * u * u * (u * (u * 6 - 15) + 10)  # smootherstep: no jerk at either end


def ease_out(u: float) -> float:
    u = min(1.0, max(0.0, u))
    return 1 - (1 - u) ** 3


def interpolate(a: CameraState, b: CameraState, u: float) -> CameraState:
    # Interpolating the *view size* (1/zoom) keeps the motion steady and
    # guarantees that if both ends fit inside the photo, so does the middle.
    inv = (1 / a.zoom) + ((1 / b.zoom) - (1 / a.zoom)) * u
    return CameraState(
        cx=a.cx + (b.cx - a.cx) * u,
        cy=a.cy + (b.cy - a.cy) * u,
        zoom=1 / inv,
        rot=a.rot + (b.rot - a.rot) * u,
    )


def float_offset(t: float, amount: float, seed: int) -> tuple[float, float, float]:
    """Slow, smooth 'breathing' drift like a camera on a slider/gimbal."""
    rng = np.random.default_rng(seed)
    ph = rng.uniform(0, 2 * math.pi, 6)
    dx = (math.sin(t * 0.37 + ph[0]) + 0.5 * math.sin(t * 0.83 + ph[1])) / 1.5
    dy = (math.sin(t * 0.29 + ph[2]) + 0.5 * math.sin(t * 0.71 + ph[3])) / 1.5
    dr = (math.sin(t * 0.23 + ph[4]) + 0.5 * math.sin(t * 0.61 + ph[5])) / 1.5
    return dx * amount, dy * amount, dr * amount * 60  # rotation in degrees


def plan_shots(style: str, duration: float, face_cx: float, face_cy: float,
               face_h: float, max_zoom: float, transition: float) -> list[Shot]:
    """Create the camera moves. Face position/size are 0..1 of the canvas."""
    def clampz(z: float) -> float:
        return float(min(max_zoom, max(1.0, z)))

    if style == "push":
        # One continuous, slow push-in toward the face.
        z_end = clampz(min(1.45, 0.24 / max(face_h, 1e-3)))
        return [Shot(
            CameraState(0.5, 0.5, 1.0, 0.25),
            CameraState(face_cx, face_cy + 0.08 / z_end, z_end, -0.25),
            0.0, duration,
        )]

    # "story": three shots joined by light-leak transitions.
    z_med = clampz(0.24 / max(face_h, 1e-3))
    z_close = clampz(max(z_med * 1.18, 0.32 / max(face_h, 1e-3)))
    z_med = clampz(min(z_med, z_close / 1.12))
    z_wide_end = clampz(min(1.12, z_med))

    third = (duration + 2 * transition) / 3
    a_end = third
    b_start = a_end - transition
    b_end = b_start + third
    c_start = b_end - transition

    def toward_face(amount: float) -> tuple[float, float]:
        return (0.5 + (face_cx - 0.5) * amount, 0.5 + (face_cy - 0.5) * amount)

    wide_end = toward_face(0.35)
    drift = 0.05 / z_med
    face_y_med = face_cy + 0.07 / z_med
    face_y_close = face_cy + 0.06 / z_close

    return [
        # 1. Wide establishing shot, slow push toward the face.
        Shot(CameraState(0.5, 0.5, 1.0, 0.3),
             CameraState(*wide_end, z_wide_end, -0.2), 0.0, a_end),
        # 2. Medium shot sliding sideways (gives a parallax-like feel).
        Shot(CameraState(face_cx - drift, face_y_med, z_med, -0.4),
             CameraState(face_cx + drift, face_y_med, z_med * 1.04, 0.3), b_start, b_end),
        # 3. Close-up: slow push in on the face, then settle.
        Shot(CameraState(face_cx, face_y_close + 0.02, z_close / 1.12, 0.2),
             CameraState(face_cx, face_y_close, z_close, 0.0), c_start, duration),
    ]


def similarity_matrix(state: CameraState, canvas_w: int, canvas_h: int,
                      out_w: int, out_h: int) -> np.ndarray:
    """2x3 matrix mapping canvas pixels -> output pixels (no distortion).

    The view is clamped so it always stays inside the canvas (no black edges).
    """
    theta = math.radians(state.rot)
    c, s = abs(math.cos(theta)), abs(math.sin(theta))

    zoom = max(1.0, state.zoom)
    scale = zoom * out_w / canvas_w
    # Half-size of the (possibly rotated) view, measured on the canvas.
    hx = (out_w / 2 * c + out_h / 2 * s) / scale
    hy = (out_w / 2 * s + out_h / 2 * c) / scale
    fit = max(hx / (canvas_w / 2), hy / (canvas_h / 2))
    if fit > 1.0:  # zoom in just enough to hide the corners
        scale *= fit
        hx /= fit
        hy /= fit

    px = min(max(state.cx * canvas_w, hx), canvas_w - hx)
    py = min(max(state.cy * canvas_h, hy), canvas_h - hy)

    cos_t, sin_t = math.cos(theta), math.sin(theta)
    a, b = scale * cos_t, -scale * sin_t
    d, e = scale * sin_t, scale * cos_t
    tx = out_w / 2 - (a * px + b * py)
    ty = out_h / 2 - (d * px + e * py)
    return np.array([[a, b, tx], [d, e, ty]], dtype=np.float64)


def is_similarity(m: np.ndarray, tol: float = 1e-9) -> bool:
    """True if the matrix scales X and Y equally and has no shear."""
    a, b, d, e = m[0, 0], m[0, 1], m[1, 0], m[1, 1]
    return abs(a - e) < tol and abs(b + d) < tol

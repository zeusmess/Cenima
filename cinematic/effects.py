"""Film grain, light leaks and floating bokeh.

These are *overlays*: they are blended on top of the frame like light hitting
the lens. Light leaks and bokeh are faded out over the face so they never
cover the person's features (except briefly during a flash transition).
"""

from __future__ import annotations

import math

import cv2
import numpy as np

LEAK_COLORS = np.array([
    (1.00, 0.45, 0.12),  # amber
    (1.00, 0.25, 0.20),  # red-orange
    (1.00, 0.70, 0.35),  # gold
    (0.95, 0.30, 0.45),  # warm magenta
], dtype=np.float32)


def screen(base: np.ndarray, layer: np.ndarray) -> np.ndarray:
    """'Screen' blend: brightens like extra light, never clips harshly.

    Same as 1 - (1 - base) * (1 - layer), written as base + layer - base * layer
    (OpenCV's array functions are much faster than plain numpy here).
    """
    return cv2.add(base, cv2.subtract(layer, cv2.multiply(base, layer)))


class FilmGrain:
    """Organic, luminance-aware grain that changes every frame."""

    def __init__(self, width: int, height: int, strength: float, seed: int):
        self.w, self.h = width, height
        self.strength = strength
        cv2.setRNGSeed(seed)
        # Grain is generated at a lower resolution and enlarged, which makes
        # soft 'clumps' like real film instead of sharp digital noise.
        self.gw, self.gh = width // 2, height // 2

    def apply(self, frame: np.ndarray) -> np.ndarray:
        if self.strength <= 0:
            return frame
        small = np.empty((self.gh, self.gw), np.float32)
        cv2.randn(small, 0.0, 1.0)
        noise = cv2.resize(small, (self.w, self.h), interpolation=cv2.INTER_CUBIC)
        lum = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        # Film grain is most visible in the midtones, least in deep blacks/whites.
        weight = cv2.multiply(lum, 1.0 - lum)
        weight = cv2.addWeighted(weight, 2.6 * self.strength, weight, 0, 0.35 * self.strength)
        noise = cv2.multiply(noise, weight)
        return cv2.add(frame, cv2.merge([noise, noise, noise]))


def face_safe_mask(w: int, h: int, face_xy: tuple[float, float], face_r: float) -> np.ndarray:
    """1 over the face, fading to 0 away from it. Small resolution is fine."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    fx, fy = face_xy[0] * w, face_xy[1] * h
    r = max(face_r * w, 1.0)
    d = np.sqrt(((xx - fx) / r) ** 2 + ((yy - fy) / (r * 1.25)) ** 2)
    return np.clip(1.6 - d, 0.0, 1.0)


class LightLeaks:
    """Warm, drifting light leaks entering from the frame edges."""

    def __init__(self, width: int, height: int, strength: float, seed: int,
                 bursts: list[float], duration: float):
        self.w, self.h = width, height
        self.strength = strength
        self.bursts = bursts
        self.duration = duration
        self.lw, self.lh = max(8, width // 8), max(8, height // 8)
        rng = np.random.default_rng(seed + 101)
        self.blobs = []
        for i in range(4):
            side = i % 2  # alternate left / right edge
            self.blobs.append(dict(
                x=(-0.15 if side == 0 else 1.15) + rng.uniform(-0.05, 0.05),
                y=rng.uniform(0.1, 0.9),
                r=rng.uniform(0.45, 0.8),
                ax=rng.uniform(0.08, 0.2), ay=rng.uniform(0.1, 0.25),
                f=rng.uniform(0.15, 0.35), ph=rng.uniform(0, 2 * math.pi),
                color=LEAK_COLORS[rng.integers(0, len(LEAK_COLORS))],
                amp=rng.uniform(0.5, 1.0),
            ))
        self.yy, self.xx = np.mgrid[0:self.lh, 0:self.lw].astype(np.float32)
        self.xx /= self.lw
        self.yy = self.yy / self.lh * (height / width)  # keep blobs round

    def burst(self, t: float) -> float:
        """0..1: how strong the transition 'flash' is at time t."""
        return max([math.exp(-((t - b) / 0.32) ** 2) for b in self.bursts] + [0.0])

    def layer(self, t: float, face_xy: tuple[float, float], face_r: float) -> np.ndarray | None:
        """Low-resolution leak layer (the caller enlarges it)."""
        if self.strength <= 0:
            return None
        aspect = self.h / self.w
        out = np.zeros((self.lh, self.lw, 3), dtype=np.float32)
        flash = self.burst(t)
        for b in self.blobs:
            bx = b["x"] + b["ax"] * math.sin(t * b["f"] * 2 * math.pi / 3 + b["ph"])
            by = (b["y"] + b["ay"] * math.cos(t * b["f"] * 2 * math.pi / 4 + b["ph"])) * aspect
            # During a transition the leaks swell and sweep into the frame.
            r = b["r"] * (1.0 + 0.9 * flash)
            bx = bx + (0.5 - bx) * 0.45 * flash
            pulse = 0.55 + 0.45 * math.sin(t * b["f"] * 2 * math.pi + b["ph"])
            g = np.exp(-(((self.xx - bx) ** 2 + (self.yy - by) ** 2) / (r * r)) * 2.2)
            out += g[..., None] * b["color"] * (b["amp"] * pulse)

        intensity = self.strength * (0.45 + 1.4 * flash)
        # Protect the face, except during the short transition flash.
        safe = face_safe_mask(self.lw, self.lh, face_xy, face_r)
        out *= (1.0 - safe * 0.9 * (1.0 - flash))[..., None] * intensity
        # Fade the leaks in after the opening and keep them calm at the very end.
        out *= min(1.0, t / 0.8) * min(1.0, max(0.0, (self.duration - t) / 0.6))
        return np.clip(out, 0, 1)


def overlay_layers(layers: list[np.ndarray | None], width: int, height: int) -> np.ndarray | None:
    """Combine low-res light layers and enlarge them to full size once."""
    layers = [layer for layer in layers if layer is not None]
    if not layers:
        return None
    lw, lh = max(layer.shape[1] for layer in layers), max(layer.shape[0] for layer in layers)
    combined = None
    for layer in layers:
        if layer.shape[:2] != (lh, lw):
            layer = cv2.resize(layer, (lw, lh), interpolation=cv2.INTER_LINEAR)
        combined = layer if combined is None else screen(combined, layer)
    return cv2.resize(combined, (width, height), interpolation=cv2.INTER_LINEAR)


class Bokeh:
    """Soft out-of-focus light specks drifting in the foreground.

    They move faster than the photo and in the opposite direction to the
    camera, which reads to the eye as depth (a parallax effect) without
    touching the person at all.
    """

    def __init__(self, width: int, height: int, strength: float, seed: int):
        self.w, self.h = width, height
        self.strength = strength
        self.scale = 4
        tw, th = int(width * 1.6) // self.scale, int(height * 1.6) // self.scale
        rng = np.random.default_rng(seed + 202)
        tex = np.zeros((th, tw, 3), dtype=np.float32)
        for _ in range(28):
            r = int(rng.uniform(4, 16))
            x, y = int(rng.uniform(0, tw)), int(rng.uniform(0, th))
            color = (1.0, rng.uniform(0.75, 0.95), rng.uniform(0.5, 0.8))
            cv2.circle(tex, (x, y), r, color, -1, lineType=cv2.LINE_AA)
            cv2.circle(tex, (x, y), r, tuple(c * 1.3 for c in color), 1, lineType=cv2.LINE_AA)
        self.tex = cv2.GaussianBlur(tex, (0, 0), 1.6) * rng.uniform(0.6, 1.0)
        self.tw, self.th = tw, th

    def layer(self, t: float, cam_dx: float, cam_dy: float, zoom: float,
              face_xy: tuple[float, float], face_r: float) -> np.ndarray | None:
        """Quarter-resolution bokeh layer (the caller enlarges it)."""
        if self.strength <= 0:
            return None
        sw, sh = self.w // self.scale, self.h // self.scale
        # Foreground layer: moves ~2x the camera motion, plus a slow upward float.
        ox = (self.tw - sw) / 2 - cam_dx * sw * 2.0
        oy = (self.th - sh) / 2 - cam_dy * sh * 2.0 - t * sh * 0.012
        z = 1.0 + (zoom - 1.0) * 0.6
        # Scale around the centre of the visible window.
        m = np.array([[z, 0, sw / 2 - z * (ox + sw / 2)],
                      [0, z, sh / 2 - z * (oy + sh / 2)]], dtype=np.float32)
        small = cv2.warpAffine(self.tex, m, (sw, sh), flags=cv2.INTER_LINEAR,
                               borderMode=cv2.BORDER_REFLECT)
        safe = face_safe_mask(sw, sh, face_xy, face_r * 1.2)
        small *= ((1.0 - safe) * self.strength)[..., None]
        return small

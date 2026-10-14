"""Cinematic colour grading ("looks") with skin-tone protection.

Every look is a per-pixel colour transform: it never moves pixels, so the
shape of the face cannot change. On top of that, skin areas keep their
original hue and saturation and only receive the look's brightness/contrast,
so skin tone stays true to the photo.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .face import FaceBox


@dataclass(frozen=True)
class Look:
    label: str
    lift: tuple[float, float, float] = (0.0, 0.0, 0.0)   # tint the shadows
    gamma: tuple[float, float, float] = (1.0, 1.0, 1.0)  # tint the midtones
    gain: tuple[float, float, float] = (1.0, 1.0, 1.0)   # tint the highlights
    contrast: float = 0.0      # 0 = none, 1 = strong S-curve
    saturation: float = 1.0
    fade: float = 0.0          # lifts the black point for a filmic matte look
    vignette: float = 0.25     # darkens the frame corners
    mono: bool = False
    skin_protect: float = 0.8  # 0 = grade skin fully, 1 = keep original skin colour


LOOKS: dict[str, Look] = {
    "teal_orange": Look(
        label="Teal & Orange (blockbuster)",
        lift=(-0.025, 0.005, 0.035), gamma=(1.0, 1.0, 0.98), gain=(1.05, 1.0, 0.93),
        contrast=0.35, saturation=0.92, fade=0.03, vignette=0.32,
    ),
    "warm_film": Look(
        label="Warm Film (golden hour)",
        lift=(0.02, 0.01, -0.01), gamma=(1.04, 1.0, 0.95), gain=(1.04, 1.0, 0.9),
        contrast=0.25, saturation=0.95, fade=0.06, vignette=0.28,
    ),
    "moody": Look(
        label="Moody (dark & cool)",
        lift=(-0.01, 0.0, 0.02), gamma=(0.95, 0.97, 1.0), gain=(0.98, 1.0, 1.02),
        contrast=0.5, saturation=0.8, fade=0.02, vignette=0.42,
    ),
    "natural": Look(
        label="Natural (subtle)",
        contrast=0.15, saturation=1.0, fade=0.015, vignette=0.2, skin_protect=0.9,
    ),
    "noir": Look(
        label="Black & White (classic film)",
        contrast=0.45, fade=0.03, vignette=0.38, mono=True, skin_protect=0.0,
    ),
}

DEFAULT_LOOK = "teal_orange"


def _luma(rgb: np.ndarray) -> np.ndarray:
    return rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722


def _tone(x: np.ndarray, look: Look) -> np.ndarray:
    """Contrast S-curve + matte fade, applied to values in 0..1."""
    if look.contrast:
        s = x * x * (3.0 - 2.0 * x)  # smoothstep = gentle S-curve
        x = x + (s - x) * look.contrast
    if look.fade:
        x = look.fade + x * (1.0 - look.fade)
    return x


def _channel_lut(look: Look, ch: int) -> np.ndarray:
    x = np.linspace(0.0, 1.0, 256, dtype=np.float32)
    y = x + look.lift[ch] * (1.0 - x)              # lift: affects shadows most
    y = np.clip(y, 0, 1) ** (1.0 / look.gamma[ch])  # gamma: midtones
    y = y * look.gain[ch]                          # gain: highlights
    return np.clip(_tone(np.clip(y, 0, 1), look), 0, 1).astype(np.float32)


def skin_mask(rgb_u8: np.ndarray, face: FaceBox | None) -> np.ndarray:
    """Soft 0..1 mask of skin-coloured pixels, strongest around the face."""
    import cv2

    h, w = rgb_u8.shape[:2]
    ycrcb = cv2.cvtColor(rgb_u8, cv2.COLOR_RGB2YCrCb)
    # A widely used skin range in YCrCb; it works across skin tones because
    # it looks at colour (Cr/Cb), not brightness (Y).
    mask = cv2.inRange(ycrcb, (0, 133, 77), (255, 180, 130)).astype(np.float32) / 255.0
    blur = max(3, int(min(h, w) * 0.01) | 1)
    mask = cv2.GaussianBlur(mask, (blur, blur), 0)

    if face is not None:
        # Boost protection in a soft ellipse covering the face and neck.
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        rx, ry = face.w * 1.1, face.h * 1.6
        d = ((xx - face.cx) / rx) ** 2 + ((yy - (face.cy + face.h * 0.25)) / ry) ** 2
        near_face = np.clip(1.5 - d, 0, 1)
        mask = np.maximum(mask * 0.6, mask * near_face)
        # Inside the core face area, protect even pixels that fell just
        # outside the skin colour range (shadows, freckles, make-up).
        core = np.clip(1.2 - (((xx - face.cx) / (face.w * 0.6)) ** 2 +
                              ((yy - face.cy) / (face.h * 0.7)) ** 2), 0, 1)
        mask = np.maximum(mask, core * 0.85)
    return np.clip(mask, 0, 1)


def apply_look(rgb_u8: np.ndarray, look: Look, face: FaceBox | None) -> np.ndarray:
    """Grade an RGB uint8 image. Returns float32 RGB in 0..1."""
    src = rgb_u8.astype(np.float32) / 255.0
    graded = np.empty_like(src)
    for ch in range(3):
        graded[..., ch] = _channel_lut(look, ch)[rgb_u8[..., ch]]

    y = _luma(graded)
    if look.mono:
        return np.repeat(y[..., None], 3, axis=2)

    if look.saturation != 1.0:
        graded = y[..., None] + (graded - y[..., None]) * look.saturation
        graded = np.clip(graded, 0, 1)

    if look.skin_protect > 0:
        # Skin version: original colours, scaled to the graded brightness.
        # Hue and saturation of the skin stay exactly as in the photo.
        src_y = np.maximum(_luma(src), 1e-4)
        target_y = _tone(src_y, look)
        skin = np.clip(src * (target_y / src_y)[..., None], 0, 1)
        m = (skin_mask(rgb_u8, face) * look.skin_protect)[..., None]
        graded = graded * (1.0 - m) + skin * m

    return graded.astype(np.float32)


def vignette_mask(width: int, height: int, strength: float) -> np.ndarray:
    """Lens-style vignette multiplier (1 in the centre, darker corners)."""
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    nx = (xx - width / 2) / (width / 2)
    ny = (yy - height / 2) / (height / 2)
    r = np.sqrt(nx * nx * 0.9 + ny * ny * 0.6)
    t = np.clip((r - 0.45) / (1.25 - 0.45), 0, 1)
    t = t * t * (3 - 2 * t)
    return (1.0 - strength * t).astype(np.float32)

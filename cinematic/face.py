"""Find where the face is, so the camera can frame it.

Face detection is used ONLY to decide where to point the virtual camera and
which area to protect from colour shifts and light leaks. The face pixels are
never edited, warped, or regenerated.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass
class FaceBox:
    x: float  # left, in pixels
    y: float  # top, in pixels
    w: float
    h: float
    detected: bool  # False when we fell back to a best guess

    @property
    def cx(self) -> float:
        return self.x + self.w / 2

    @property
    def cy(self) -> float:
        return self.y + self.h / 2

    def shifted_scaled(self, dx: float, dy: float, scale: float) -> "FaceBox":
        return FaceBox((self.x + dx) * scale, (self.y + dy) * scale,
                       self.w * scale, self.h * scale, self.detected)


def guess_face(width: int, height: int) -> FaceBox:
    """Typical portrait composition: face centred, in the upper part."""
    size = min(width, height) * 0.32
    return FaceBox(width / 2 - size / 2, height * 0.36 - size / 2, size, size, False)


def detect_face(rgb: np.ndarray) -> FaceBox:
    """Return the largest face in the image, or a sensible guess."""
    height, width = rgb.shape[:2]
    try:
        import cv2

        cv2.CascadeClassifier  # removed in OpenCV 5; we need OpenCV 4.x
    except (ImportError, AttributeError):
        return guess_face(width, height)

    # Detect on a small copy: faster and just as accurate for framing.
    scale = min(1.0, 800 / max(width, height))
    small = cv2.resize(rgb, (max(1, int(width * scale)), max(1, int(height * scale))),
                       interpolation=cv2.INTER_AREA)
    gray = cv2.equalizeHist(cv2.cvtColor(small, cv2.COLOR_RGB2GRAY))
    min_side = max(24, int(min(gray.shape) * 0.08))

    # alt2 makes fewer mistakes, so it goes first. Among several candidates
    # we keep the one the detector is most confident about.
    for name in ("haarcascade_frontalface_alt2.xml", "haarcascade_frontalface_default.xml",
                 "haarcascade_profileface.xml"):
        cascade = cv2.CascadeClassifier(cv2.data.haarcascades + name)
        if cascade.empty():
            continue
        boxes, _, weights = cascade.detectMultiScale3(
            gray, scaleFactor=1.1, minNeighbors=6, minSize=(min_side, min_side),
            outputRejectLevels=True)
        if len(boxes):
            best = int(np.argmax(np.asarray(weights).ravel()))
            x, y, w, h = boxes[best]
            return FaceBox(x / scale, y / scale, w / scale, h / scale, True)

    return guess_face(width, height)

"""Find a working FFmpeg binary and build the encoder command."""

from __future__ import annotations

import os
import shutil
import subprocess


class FFmpegNotFoundError(RuntimeError):
    pass


def find_ffmpeg() -> str:
    """Return the path to an ffmpeg executable.

    Search order:
      1. the FFMPEG_BINARY environment variable
      2. `ffmpeg` on the system PATH
      3. the static binary bundled with the `imageio-ffmpeg` pip package
    """
    env = os.environ.get("FFMPEG_BINARY")
    if env and os.path.exists(env):
        return env

    on_path = shutil.which("ffmpeg")
    if on_path:
        return on_path

    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:  # pragma: no cover - depends on the machine
        pass

    raise FFmpegNotFoundError(
        "FFmpeg was not found. Install it with `pip install imageio-ffmpeg` "
        "(easiest), or install FFmpeg from https://ffmpeg.org/download.html "
        "and make sure the `ffmpeg` command works in your terminal."
    )


def ffmpeg_version(ffmpeg: str | None = None) -> str:
    ffmpeg = ffmpeg or find_ffmpeg()
    out = subprocess.run([ffmpeg, "-version"], capture_output=True, text=True, check=True)
    return out.stdout.splitlines()[0] if out.stdout else "unknown"


QUALITY_PRESETS = {
    # name: (x264 preset, crf)
    "fast": ("veryfast", 21),
    "standard": ("medium", 19),
    "high": ("slow", 18),
}


def build_encode_command(
    ffmpeg: str,
    output_path: str,
    width: int,
    height: int,
    fps: int,
    duration: float,
    music_path: str | None = None,
    quality: str = "standard",
) -> list[str]:
    """FFmpeg command that reads raw RGB frames on stdin and writes an MP4.

    The settings follow the Instagram Reels / TikTok upload recommendations:
    H.264 High profile, yuv420p, BT.709 colour, AAC stereo audio, and the
    `faststart` flag so the video starts playing before it fully downloads.
    """
    preset, crf = QUALITY_PRESETS.get(quality, QUALITY_PRESETS["standard"])

    cmd = [
        ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
        # Input 0: our rendered frames.
        "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{width}x{height}", "-r", str(fps), "-i", "pipe:0",
    ]

    if music_path:
        # Input 1: the user's music, padded with silence if it is too short,
        # and faded out at the end of the video.
        fade_len = min(2.0, duration / 4)
        cmd += ["-i", music_path]
        audio_filter = f"apad,afade=t=out:st={duration - fade_len:.3f}:d={fade_len:.3f}"
    else:
        # Input 1: silence. Some apps handle videos with an audio track better.
        cmd += ["-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000"]
        audio_filter = "anull"

    cmd += [
        "-map", "0:v:0", "-map", "1:a:0",
        "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
        "-af", audio_filter,
        "-c:v", "libx264", "-preset", preset, "-tune", "grain", "-crf", str(crf),
        "-maxrate", "16M", "-bufsize", "32M",
        "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-g", str(fps * 2),
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-color_range", "tv",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        "-t", f"{duration:.3f}",
        "-movflags", "+faststart",
        output_path,
    ]
    return cmd

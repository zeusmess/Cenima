#!/usr/bin/env python3
"""Command-line tool: turn a portrait photo into a cinematic vertical video.

Example:
    python make_video.py my_photo.jpg
    python make_video.py my_photo.jpg -o reel.mp4 --look warm_film --duration 12
"""

from __future__ import annotations

import argparse
import os
import sys

from cinematic import LOOKS, Settings, render_video


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Make a 1080x1920 cinematic video (Reels/TikTok) from a portrait photo.")
    parser.add_argument("photo", help="path to your portrait photo (JPG or PNG)")
    parser.add_argument("-o", "--output", help="output MP4 path (default: output/<photo>_cinematic.mp4)")
    parser.add_argument("--duration", type=float, default=10, help="length in seconds, 3-60 (default 10)")
    parser.add_argument("--fps", type=int, default=30, choices=[24, 25, 30, 60])
    parser.add_argument("--look", default="teal_orange", choices=list(LOOKS),
                        help="colour grade (default teal_orange)")
    parser.add_argument("--motion", default="story", choices=["story", "push"],
                        help="story = 3 shots with transitions, push = one slow push-in")
    parser.add_argument("--transition", default="leak", choices=["leak", "glide", "dip"],
                        help="leak = camera glide + warm light flash, glide = glide only, "
                             "dip = dip to black")
    parser.add_argument("--fit", default="auto", choices=["auto", "fill", "layered"],
                        help="fill = crop to 9:16, layered = photo over blurred background")
    parser.add_argument("--grain", type=float, default=0.5, help="film grain 0-1 (default 0.5)")
    parser.add_argument("--leaks", type=float, default=0.5, help="light leaks 0-1 (default 0.5)")
    parser.add_argument("--bokeh", type=float, default=0.4, help="floating bokeh 0-1 (default 0.4)")
    parser.add_argument("--music", help="optional music file (mp3/m4a/wav)")
    parser.add_argument("--no-fade-out", action="store_true", help="don't fade to black at the end")
    parser.add_argument("--quality", default="standard", choices=["fast", "standard", "high"])
    parser.add_argument("--seed", type=int, default=7, help="change for different leak/grain patterns")
    args = parser.parse_args(argv)

    if not os.path.isfile(args.photo):
        print(f"Error: photo not found: {args.photo}", file=sys.stderr)
        return 1

    output = args.output or os.path.join(
        "output", os.path.splitext(os.path.basename(args.photo))[0] + "_cinematic.mp4")

    settings = Settings(
        duration=args.duration, fps=args.fps, look=args.look, motion=args.motion,
        transition=args.transition, fit=args.fit, grain=args.grain,
        light_leaks=args.leaks, bokeh=args.bokeh, music=args.music,
        fade_out=not args.no_fade_out, quality=args.quality, seed=args.seed,
    )

    def show(frac: float, msg: str) -> None:
        bar = "#" * int(frac * 30)
        print(f"\r[{bar:<30}] {frac * 100:5.1f}%  {msg:<40}", end="", flush=True)

    try:
        result = render_video(args.photo, output, settings, progress=show)
    except (ValueError, RuntimeError) as exc:
        print(f"\nError: {exc}", file=sys.stderr)
        return 1

    print()
    print(f"Done in {result.seconds:.0f}s -> {result.output_path}")
    if not result.face_detected:
        print("Note: no face was detected, so the camera assumed the face is in the "
              "upper middle of the photo.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

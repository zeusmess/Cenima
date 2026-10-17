#!/usr/bin/env python3
"""Build the CrazyGames upload packages for Twinsight from game/index.html.

  python3 tools/build_crazygames.py               # build both packages
  python3 tools/build_crazygames.py --fetch-fonts # re-download the font files first

Two packages are written to dist/:
  twinsight-crazygames-basic.zip  first submission (Basic Launch): SDK events only, no ads
  twinsight-crazygames-full.zip   after CrazyGames selects the game for Full Launch: ads + progress save

Each package is a flat folder with index.html at its root, self-hosted fonts and
relative paths only, as the CrazyGames technical requirements ask.
"""
import argparse
import re
import shutil
import sys
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "game" / "index.html"
FONTS = ROOT / "game" / "fonts"
DIST = ROOT / "dist"

FONT_CSS = ("https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700"
            "&family=Unbounded:wght@400;600;800&display=swap")
LICENSES = {
    "OFL-Alexandria.txt": "https://raw.githubusercontent.com/google/fonts/main/ofl/alexandria/OFL.txt",
    "OFL-Unbounded.txt": "https://raw.githubusercontent.com/google/fonts/main/ofl/unbounded/OFL.txt",
}
KEEP_SUBSETS = {"arabic", "latin", "latin-ext"}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
SDK_TAG = '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def fetch_fonts():
    """Download the woff2 files the game uses and write game/fonts/fonts.css with relative URLs."""
    FONTS.mkdir(parents=True, exist_ok=True)
    css = fetch(FONT_CSS).decode("utf-8")
    blocks = re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})", css, re.S)
    out, saved = [], {}
    for subset, block in blocks:
        if subset not in KEEP_SUBSETS:
            continue
        family = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        url = re.search(r"url\((https://[^)]+\.woff2)\)", block).group(1)
        if url not in saved:
            name = f"{family.lower()}-{subset}-{len(saved)}.woff2"
            (FONTS / name).write_bytes(fetch(url))
            saved[url] = name
        out.append(f"/* {family} · {subset} */\n" + block.replace(url, saved[url]))
    (FONTS / "fonts.css").write_text("\n".join(out) + "\n", encoding="utf-8")
    for name, url in LICENSES.items():
        (FONTS / name).write_bytes(fetch(url))
    print(f"fonts: {len(saved)} files, {len(out)} @font-face rules")


def page_html(target, with_sdk):
    """game/index.html with self-hosted fonts and the given build target (and the CrazyGames SDK if asked)."""
    if not (FONTS / "fonts.css").exists():
        fetch_fonts()
    html = SRC.read_text(encoding="utf-8")
    links = re.compile(r'<link rel="preconnect"[^>]*>\n<link rel="preconnect"[^>]*>\n<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>')
    if not links.search(html):
        sys.exit("build: the Google Fonts <link> lines were not found in game/index.html")
    html = links.sub('<link rel="stylesheet" href="fonts/fonts.css">' + ("\n" + SDK_TAG if with_sdk else ""), html, count=1)
    meta = '<meta name="twinsight-target" content="web">'
    if meta not in html:
        sys.exit("build: the twinsight-target <meta> was not found in game/index.html")
    html = html.replace(meta, f'<meta name="twinsight-target" content="{target}">')
    return html.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")


def write_page(out, html):
    """Write index.html and the font files into a fresh folder."""
    if out.exists():
        shutil.rmtree(out)
    (out / "fonts").mkdir(parents=True)
    (out / "index.html").write_text(html, encoding="utf-8")
    for f in sorted(FONTS.iterdir()):
        if f.suffix in {".woff2", ".css", ".txt"}:
            shutil.copy2(f, out / "fonts" / f.name)


def build(target):
    name = "basic" if target == "cg-basic" else "full"
    out = DIST / f"crazygames-{name}"
    write_page(out, page_html(target, with_sdk=True))

    zpath = DIST / f"twinsight-crazygames-{name}.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(out.rglob("*")):
            if f.is_file():
                z.write(f, f.relative_to(out).as_posix())
    files = sum(1 for f in out.rglob("*") if f.is_file())
    size = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
    print(f"{zpath.relative_to(ROOT)}: {files} files, {size / 1024:.0f} KB unpacked")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--fetch-fonts", action="store_true", help="download the font files into game/fonts first")
    args = ap.parse_args()
    if args.fetch_fonts or not (FONTS / "fonts.css").exists():
        fetch_fonts()
    DIST.mkdir(exist_ok=True)
    build("cg-basic")
    build("cg-full")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the Android APK for Twinsight: a full-screen WebView app that serves the game from its own assets.

  ANDROID_HOME=/path/to/android-sdk python3 tools/build_apk.py

Needs a JDK (javac, keytool) and an Android SDK with build-tools (aapt2, d8, zipalign, apksigner) and
platforms/android-36. No Gradle and no extra libraries.

The APK is signed with android/twinsight-release.keystore, created on the first build together with
android/twinsight-release.password. Neither file is committed. Keep both safe: every later version of the
app must be signed with the same key, or Android refuses to install it over the old one.
"""
import os
import secrets
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_crazygames import page_html, write_page  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "android"
BUILD = ROOT / "build" / "apk"
DIST = ROOT / "dist"
KEYSTORE = APP / "twinsight-release.keystore"
PASSFILE = APP / "twinsight-release.password"
ALIAS = "twinsight"
VERSION_CODE = 3
VERSION_NAME = "1.1.1"
MIN_SDK = 24
TARGET_SDK = 36


def sdk_paths():
    home = os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT")
    if not home:
        sys.exit("build_apk: set ANDROID_HOME to your Android SDK folder")
    home = Path(home)
    android_jar = home / "platforms" / f"android-{TARGET_SDK}" / "android.jar"
    if not android_jar.exists():
        sys.exit(f"build_apk: {android_jar} not found (install platforms;android-{TARGET_SDK})")
    tools = sorted(d for d in (home / "build-tools").iterdir() if (d / "aapt2").exists())
    if not tools:
        sys.exit("build_apk: no build-tools folder with aapt2 found")
    return android_jar, tools[-1]


def run(*cmd, env=None):
    print("$", " ".join(Path(str(c)).name if i == 0 else str(c) for i, c in enumerate(cmd[:2])), "…")
    subprocess.run([str(c) for c in cmd], check=True, env=env)


def keystore_password():
    if KEYSTORE.exists() and PASSFILE.exists():
        return PASSFILE.read_text().strip()
    if KEYSTORE.exists():
        sys.exit(f"build_apk: {KEYSTORE.name} exists but {PASSFILE.name} is missing")
    password = secrets.token_urlsafe(18)
    env = dict(os.environ, TWINSIGHT_KS_PASS=password)
    run("keytool", "-genkeypair", "-keystore", KEYSTORE, "-storetype", "PKCS12", "-alias", ALIAS,
        "-keyalg", "RSA", "-keysize", "4096", "-validity", "10000",
        "-storepass:env", "TWINSIGHT_KS_PASS", "-keypass:env", "TWINSIGHT_KS_PASS",
        "-dname", "CN=Twinsight, O=zeusmess, C=EG", env=env)
    PASSFILE.write_text(password + "\n")
    os.chmod(PASSFILE, 0o600)
    return password


def main():
    android_jar, bt = sdk_paths()
    if BUILD.exists():
        shutil.rmtree(BUILD)
    assets = BUILD / "assets"
    write_page(assets, page_html("apk", with_sdk=False))

    res_zip, unsigned, gen = BUILD / "res.zip", BUILD / "unsigned.apk", BUILD / "gen"
    run(bt / "aapt2", "compile", "--dir", APP / "res", "-o", res_zip)
    run(bt / "aapt2", "link", "-o", unsigned, "-I", android_jar, "--manifest", APP / "AndroidManifest.xml",
        "-A", assets, "--java", gen, "--min-sdk-version", MIN_SDK, "--target-sdk-version", TARGET_SDK,
        "--version-code", VERSION_CODE, "--version-name", VERSION_NAME, res_zip)

    classes, dex = BUILD / "classes", BUILD / "dex"
    sources = sorted(str(p) for p in (APP / "src").rglob("*.java")) + sorted(str(p) for p in gen.rglob("*.java"))
    # core-lambda-stubs.jar supplies the lambda bootstrap that android.jar leaves out.
    boot = os.pathsep.join(str(p) for p in (android_jar, bt / "core-lambda-stubs.jar") if p.exists())
    run("javac", "-source", "8", "-target", "8", "-Xlint:-options", "-encoding", "UTF-8",
        "-bootclasspath", boot, "-d", classes, *sources)
    dex.mkdir()
    run(bt / "d8", "--release", "--min-api", MIN_SDK, "--lib", android_jar, "--output", dex,
        *sorted(str(p) for p in classes.rglob("*.class")))
    with zipfile.ZipFile(unsigned, "a", zipfile.ZIP_DEFLATED) as z:
        z.write(dex / "classes.dex", "classes.dex")

    aligned = BUILD / "aligned.apk"
    run(bt / "zipalign", "-p", "-f", "4", unsigned, aligned)
    env = dict(os.environ, TWINSIGHT_KS_PASS=keystore_password())
    DIST.mkdir(exist_ok=True)
    out = DIST / f"twinsight-{VERSION_NAME}.apk"
    run(bt / "apksigner", "sign", "--ks", KEYSTORE, "--ks-key-alias", ALIAS,
        "--ks-pass", "env:TWINSIGHT_KS_PASS", "--key-pass", "env:TWINSIGHT_KS_PASS",
        "--v4-signing-enabled", "false", "--out", out, aligned, env=env)
    run(bt / "apksigner", "verify", out)
    # dist/twinsight.apk is the permanent download link: always the latest version.
    shutil.copy2(out, DIST / "twinsight.apk")
    print(f"{out.relative_to(ROOT)}: {out.stat().st_size / 1024:.0f} KB (also dist/twinsight.apk)")


if __name__ == "__main__":
    main()

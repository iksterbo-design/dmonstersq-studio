"""Sync the web app into the Android project + generate launcher icons.

Run this after editing index.html / worklets.js / sw.js:

    python sync_android_assets.py

It copies the web files into android/app/src/main/assets/www/ and renders
Android launcher icons at every density.
"""
import os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from make_icons import render, write_png          # noqa: E402

WEB_FILES = ["index.html", "worklets.js", "manifest.webmanifest", "sw.js"]
WWW = os.path.join(HERE, "android", "app", "src", "main", "assets", "www")
RES = os.path.join(HERE, "android", "app", "src", "main", "res")

def main():
    # 1. web app
    os.makedirs(WWW, exist_ok=True)
    for f in WEB_FILES:
        src = os.path.join(HERE, f)
        if not os.path.exists(src):
            print("  !! missing", f)
            continue
        shutil.copy2(src, os.path.join(WWW, f))
        print("  copied", f, "->", os.path.relpath(os.path.join(WWW, f), HERE))
    shutil.copytree(os.path.join(HERE, "icons"), os.path.join(WWW, "icons"), dirs_exist_ok=True)
    print("  copied icons/ ->", os.path.relpath(os.path.join(WWW, "icons"), HERE))

    # 2. launcher icons (maskable = full-bleed, Android applies its own mask)
    densities = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
    for d, size in densities.items():
        out = os.path.join(RES, "mipmap-" + d)
        os.makedirs(out, exist_ok=True)
        write_png(os.path.join(out, "ic_launcher.png"), render(size, True), size)
        print("  rendered mipmap-%s/ic_launcher.png (%dpx)" % (d, size))

    print("\nAndroid assets synced.")

if __name__ == "__main__":
    main()

# D MONSTERS Q STUDIO

A **30-tool multitrack audio mixing & editing studio** that runs entirely in the browser.
No upload, no account, no server — all audio is processed on-device with the **Web Audio API**.

---

## ⚠️ Read this first: how F-Droid actually works

**You cannot upload an APK to F-Droid.** F-Droid is not an app store like Google Play — it is a
catalogue of apps that its own build servers compile **from source**. There is no "submit my APK"
button. Two real paths exist:

| Path | What you do | Effort | Result |
|---|---|---|---|
| **A. Mainline F-Droid** | Publish the full source (FOSS licence) + submit a metadata recipe via merge request to [fdroiddata](https://gitlab.com/fdroid/fdroiddata). F-Droid builds it themselves. | High (weeks of review, must build with *their* toolchain) | App appears in the official F-Droid app for everyone |
| **B. Self-hosted repo** | You build the APK, run `fdroid update`, host the repo on any static host, then on the phone: **F-Droid → Settings → Repositories → Add** your URL. | Low (a few hours, no approval needed) | Only you/anyone who adds your repo |

The recipe for path A is already in this repo at
[`fdroid/metadata/com.dmonstersq.studio.yml`](fdroid/metadata/com.dmonstersq.studio.yml).

### But honestly — for *your own phone*, you don't need F-Droid at all.

F-Droid is a distribution channel for other people. To just **use** this app on your Android,
you have three much easier options, best first:

---

## Option 1 — PWA: install straight from Chrome (recommended, 5 minutes)

This is the best fit for a Web Audio app. It installs like a real app, runs fullscreen, works
**offline**, and auto-updates. No APK, no sideloading, no F-Droid.

**1. Put the files online** (PWAs must be served over `https://` to be installable):

```bash
cd dmonstersq-studio
git init && git add -A && git commit -m "DMQ Studio v3"
git branch -M main
git remote add origin https://github.com/iksterbo-design/dmonstersq-studio.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: `main` / root → Save**.
Your URL becomes `https://iksterbo-design.github.io/dmonstersq-studio/`.

**2. On your Android phone:**

- Open that URL in **Chrome**
- Tap the **⋮** menu → **Add to Home screen** / **Install app**
  (or tap the **📲 Install** button that appears in the app header)
- Done — it now has an icon, opens fullscreen with no browser UI, and works with **no internet**

> **No GitHub?** Any static host works: Netlify Drop (drag-and-drop), Cloudflare Pages,
> Vercel, GitLab Pages, or your own webspace. HTTPS is required.

---

## Option 2 — Build an APK (no Java/SDK needed on your PC)

There are now **two** ways to get a real APK, and a native Android project already exists
in [`android/`](android/).

### 2a. Build the native Android app (this is what F-Droid will build)

The `android/` folder is a complete Gradle project. `MainActivity` is a hardened WebView that
serves the bundled web app through `WebViewAssetLoader` at
`https://appassets.androidplatform.net/assets/www/index.html` — a **secure origin**, which is
what makes `AudioWorklet`, `getUserMedia` (mic) and the service worker behave exactly like on
the web. There is **no INTERNET permission**: nothing leaves the device.

```bash
python sync_android_assets.py      # copy index.html/worklets.js/icons into the project
cd android && gradle assembleDebug  # -> app/build/outputs/apk/debug/app-debug.apk
```

`app-debug.apk` is debug-signed, so it installs directly on your phone.

#### Signing a release build

The release build is **unsigned by default** (that's what F-Droid wants — their buildserver
signs with its own key). To sign it yourself:

**Locally**
```bash
keytool -genkeypair -v -keystore dmq-release.jks \
  -alias dmq -keyalg RSA -keysize 2048 -validity 10000
cp android/keystore.properties.example android/keystore.properties   # then edit it
cd android && gradle assembleRelease
# -> app/build/outputs/apk/release/app-release.apk   (signed)
```

**In CI** — add these four repository secrets (**Settings → Secrets → Actions**):

| Secret | Value |
|---|---|
| `DMQ_KEYSTORE_B64` | your `.jks` base64-encoded: `base64 -w0 dmq-release.jks` |
| `DMQ_STORE_PASSWORD` | keystore password |
| `DMQ_KEY_ALIAS` | key alias (`dmq`) |
| `DMQ_KEY_PASSWORD` | key password |

The workflow auto-detects them; with no secrets it still builds, just unsigned.
`keystore.properties`, `*.jks` and `*.keystore` are in `.gitignore` — **never commit them.**

**Don't have Java/SDK?** The included GitHub Actions workflow builds it in the cloud —
push the repo, then **Actions → Build Android APK → Run workflow**, and download the
`dmq-studio-apk` artifact.

### 2b. Zero-tooling alternative: PWABuilder

Host the app (Option 1 step 1), then paste the URL into **[pwabuilder.com](https://www.pwabuilder.com)**
→ Android → download a signed APK. This wraps it in a Trusted Web Activity instead of a
bundled WebView.

---

## Option 3 — F-Droid self-hosted repo

Once you have a signed APK (Option 2):

```bash
# on a Linux box / WSL / Docker
pip install fdroidserver
mkdir -p repo && cp app-release-signed.apk repo/
fdroid init                     # creates config.yml — set repo_url to your host
fdroid update --create-metadata
fdroid server update            # or just commit + push the ./repo and ./metadata dirs
```

Host the resulting `repo/` + `index-v1.jar` on GitHub Pages, then on the phone:

> **F-Droid → Settings → Repositories → ➕ → `https://iksterbo-design.github.io/dmq-fdroid/repo`**

F-Droid will now show **DMQ Studio** and offer updates. This is the DIY route and needs nobody's approval.

> ⚠️ Self-hosted repos are **not** vetted by F-Droid. F-Droid shows a warning; that's expected.

---

## Testing on your phone right now (LAN, no hosting)

```bash
cd dmonstersq-studio
python serve.py            # prints a http://192.168.x.x:8000 URL
```

Open that URL on your phone (same Wi-Fi). Everything works, but **installing** as a PWA needs
HTTPS, so use Options 1–3 for the real install.

---

## The 31 tools

**Per-track FX (1–9, 23, 24, 31)**
`1` 3-band EQ · `2` Low/high-pass filter · `3` Drive/distortion · `4` Compressor ·
`5` Tremolo · `6` Auto-pan · `7` Reverb send · `8` Delay/echo send · `9` Pitch/speed ·
`23` Noise gate · `24` Input trim · `31` Bitcrusher

**Per-track edits (10–14, 25, 27, 28)**
`10` Reverse · `11` Normalize · `12` Duplicate · `13` Split at playhead · `14` Live level meter ·
`25` Trim silence · `27` Quick fade in/out · `28` Track colour labels

**Global (15–18, 21, 22, 26, 29, 30)**
`15` Metronome · `16` Loop region · `17` Master limiter · `18` Spectrum analyser ·
`21` Master 3-band EQ · `22` Master high-pass · `26` Auto-level all tracks ·
`29` Bypass all FX (A/B) · `30` Tap tempo

**Workflow (19, 20)**
`19` Undo/redo (60 steps) · `20` Save/load project (audio embedded) + microphone recording

Plus: **multi-file import**, drag & drop, click-to-seek, keyboard shortcuts.

### AudioWorklet DSP

Tools `23`, `31` and the master limiter are **not** implemented with plain JS — they are
`AudioWorkletProcessor`s in [`worklets.js`](worklets.js) running on the **audio render thread**:

| Processor | What it does |
|---|---|
| `dmq-gate` | Peak envelope follower with attack / hold / release / range, per-sample |
| `dmq-crusher` | Bit-depth quantisation + sample-rate reduction with dry/wet mix |
| `dmq-limiter` | Brickwall limiter — instant attack, smooth release, dB ceiling |

If a browser lacks `AudioWorklet`, the app detects it and transparently falls back to a
`GainNode` gate and a `DynamicsCompressor` limiter, so nothing breaks.

---

## Files

```
dmonstersq-studio/
├── index.html                  # the whole app (single file, no build step)
├── worklets.js                 # AudioWorklet DSP (gate / crusher / limiter)
├── manifest.webmanifest        # PWA manifest
├── sw.js                       # service worker (network-first HTML, cache-first assets)
├── icons/                      # 192 / 512 / maskable 512 PNGs
├── make_icons.py               # regenerates the icons (stdlib only)
├── sync_android_assets.py      # copies the web app into the Android project
├── serve.py                    # tiny LAN test server
├── android/                    # REAL Android (Gradle) project -> builds an APK
│   ├── settings.gradle · build.gradle · gradle.properties
│   └── app/
│       ├── build.gradle · proguard-rules.pro
│       └── src/main/
│           ├── AndroidManifest.xml
│           ├── java/com/dmonstersq/studio/MainActivity.java
│           ├── assets/www/     # the bundled web app (offline)
│           └── res/            # strings, theme, mipmap launcher icons
├── twa-manifest.json           # alternative: Bubblewrap TWA config
├── fdroid/metadata/            # F-Droid recipe (path A)
└── .github/workflows/          # cloud APK builds (Gradle + TWA)
```

## Privacy

Everything is local. Files are read with the File API, decoded in-memory, processed by the Web
Audio API and rendered offline. Nothing is ever transmitted. The service worker only caches this
app's own files. There is no analytics, no telemetry, no network code at all.

## Licence

MIT — see [LICENSE](LICENSE). (F-Droid-friendly; swap to GPL-3.0 if you prefer copyleft.)

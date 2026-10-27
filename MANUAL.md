# D MONSTERS Q STUDIO — User Manual

Version: 131-tool build (31 core + 100 DJ tools) · Offline · No account · No upload

---

## 1. What it is
A multitrack audio mixing & editing studio that runs 100% in your browser (or in the Android WebView shell). All audio is processed on-device with the Web Audio API. Works offline after first load.

## 2. Install

### Option A — PWA (recommended, 5 min)
1. Host the files on any HTTPS static host (GitHub Pages, Netlify, Cloudflare Pages, Vercel).
2. Open the URL in Chrome on your phone.
3. Tap ⋮ → **Add to Home screen** / **Install app** (or the 📲 Install button in the header).
4. Runs fullscreen, offline, auto-updates.

### Option B — Android APK
Build from the `android/` folder with Gradle, or use the supplied `DMQ-Studio.apk`.
Install (sideload) and allow microphone permission if you want recording.

### Option C — Local test
`python serve.py` → open the printed LAN URL on your phone (testing only; PWA install needs HTTPS).

## 3. First run
- App opens with 2 empty tracks. Tap **＋ Files** to import audio (wav/mp3/ogg) or **＋ Track** to add tracks.
- Drag-and-drop audio files onto a track waveform area (desktop).
- Tap a track's waveform to seek the playhead.

## 4. Transport
| Control | Action |
|---|---|
| ▶ Play | Start playback |
| ⏸ Pause | Pause |
| ⏹ Stop | Stop & rewind |
| Time display | Current position |
| Master meter | Output level |

Keyboard (desktop): **Space** play/pause · **Ctrl+Z** undo · **Ctrl+Y** redo.

## 5. Tracks
Each track has: name, color (tool 28), volume, pan, mute (M), solo (S), meter (tool 14).
Buttons per track:
- ↗ Quick fade-in · ↘ Quick fade-out (tool 27)
- ⇥ Trim silence (tool 25)
- ⧉ Duplicate (tool 12) · ⇄ Reverse (tool 10) · ⤒ Normalize (tool 11) · ✂ Split at playhead (tool 13)
- **FX ▾** opens the per-track FX rack (tools 1–9, 23, 24)

## 6. Per-track FX rack (tools 1–9, 23, 24, 31)
EQ low/mid/high · Filter (type + freq) · Drive · Compressor (threshold/ratio) · Tremolo · Auto-pan · Reverb send · Delay send · Pitch · Noise gate (23) · Input trim (24) · Bitcrusher (31).

## 7. Global controls
- **MASTER FX** (tools 21, 22): Master EQ low/mid/high + high-pass filter.
- **MASTER vol**: overall output.
- **🥁 Metronome** (tool 15): ON/OFF, BPM, TAP tempo (tool 30).
- **🔁 Loop** (tool 16): set start/end, toggle.
- **LIM** (tool 17): limiter on/off.
- **SPEC** (tool 18): spectrum analyzer.
- **BYPASS** (tool 29): bypass all track FX.
- **AUTO LVL** (tool 26): auto-level all tracks.
- **Undo/Redo** (tool 19) · **Save/Load** (tool 20) · **Rec** (mic record).

## 8. Export
**⬇ WAV** renders the full mix to a WAV file and downloads it.

## 9. DJ Tools (100 tools)
Tap **🎧 DJ TOOLS** in the header to open the panel. Tools are grouped into 10 sets:

1. **BEATMATCH** — Sync, Tap Tempo, BPM Detect, Beat Grid, Phase Align, Nudge ±, Pitch Bend ±, Key Lock.
2. **CUE & LOOP** — Cue Set, Cue Jump, Hot Cues A/B/C, Loop In/Out, Loop Roll, Reloop, Slip Mode.
3. **PERFORMANCE** — Scratch, Vinyl Brake, Spinback, Transform, Stutter, Gate Chop, Beat Repeat, Rolls 1/4, 1/8, 1/16.
4. **FX THROWS** — Filter Sweep, Delay Throw, Reverb Wash, Flanger/Phaser Sweep, Echo Out, Risers, Drops, Build-Up, Breakdown.
5. **SAMPLER** — Pads 1–10 trigger samples.
6. **EQ & FILTER** — Low/Mid/High Kill, Low Boost, Filter Open/Close, Notch Sweep, Bandpass, HP/LP Sweep.
7. **DYNAMICS** — Pump, Sidechain, Comp Boost, Limiter Slam, Transient Shaper, Glue, Punch, Sustain, Gate, Expander.
8. **SPATIAL** — Stereo Width, Mono, Pan L/R, Auto Pan, Haas, Hall/Plate Reverb, Ping-Pong/Tape Delay.
9. **VOCAL** — Vocal Cut/Boost, De-Esser, Pitch Correct, Harmonizer, Vocoder, Talkover Duck, Radio/Telephone/Megaphone.
10. **MASTERING** — Loudness, True Peak, Stereo Imager, Multiband, Final EQ/Comp, Dither, Fade In/Out, Export Cue.

Tap any tool button to toggle it ON/OFF. Active tools highlight teal.

## 10. Motorola & older phones
- The app auto-detects constrained devices and enables a low-perf mode (reduced analyser cost, touch-friendly controls, polyfills).
- Keep Chrome updated for best Web Audio support; older WebView may disable AudioWorklet (automatic fallbacks keep working).
- If audio stutters: close other apps, reduce track count, disable spectrum (SPEC), turn off limiter.
- Use headphones for monitoring; avoid Bluetooth latency for live use.
- On very old devices, use the PWA (Option A) instead of the APK for better updates.

## 11. Troubleshooting
- **No sound**: tap the page once (browsers require a user gesture to start AudioContext); check master volume; unmute tracks.
- **Mic record fails**: grant microphone permission; reload the app after granting.
- **Install button missing**: needs HTTPS (PWA) or use the APK.
- **Export empty**: ensure at least one track has audio and is not muted.
- **UI too small**: rotate to landscape or use a tablet; controls are touch-optimized.

## 12. Credits & license
MIT License. Built with the Web Audio API. No data leaves your device.

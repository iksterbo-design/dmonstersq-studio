# DMQ Overlay

A transparent, always-on-top, **click-through** desktop overlay. Draws a crosshair,
a clock, a session timer and an optional text label on top of whatever you're doing.

```
Double-click:  Run Overlay.bat
Hotkeys:       Ctrl+Alt+C  toggle crosshair
               Ctrl+Alt+H  hide / show the whole overlay
               Ctrl+Alt+S  settings window
               Ctrl+Alt+Q  quit
```

Settings are saved to `overlay-config.json` next to the script.

---

## ⚠️ Read this first — what this is and isn't

**What it is:** a separate window that floats above everything and draws on top of it.
It is a *dumb drawing surface*.

**What it is NOT — and never will be:**

| | |
|---|---|
| ❌ Injects a DLL into a game | No `CreateRemoteThread`, no manual mapping |
| ❌ Hooks DirectX / Vulkan / OpenGL | No `IDXGISwapChain::Present` hook |
| ❌ Reads another process's memory | No `ReadProcessMemory`, no handles |
| ❌ Knows anything on your screen | No screen capture, no pixel reading |
| ❌ Talks to the network | Zero network code |

That restraint is the entire point. The moment an overlay injects or hooks, it becomes
a cheat and anti-cheat will (rightly) ban it. This one doesn't, which is what keeps it
in the same category as Discord's overlay, MSI Afterburner or the Xbox Game Bar.

## Honest risk note

Even a non-injecting topmost window is *not guaranteed* to be ignored by aggressive
kernel anti-cheat. I'm not going to pretend otherwise. If you want zero risk:

- Use it in games that explicitly allow overlays
- Use it on the desktop / in single-player
- Or don't use it in competitive multiplayer at all

A crosshair is cosmetic — the game already draws its own. This adds nothing you
couldn't see otherwise, so it gives you no competitive advantage. But the call is yours.

---

## Requirements

- **Windows** (uses Win32 `SetWindowLong` / `RegisterHotKey` via `ctypes`)
- **Python 3.8+** with `tkinter` (bundled with the official installer)
- No pip packages — standard library only

## Setup

```bat
Run Overlay.bat
```

If Python isn't found, install it from [python.org](https://www.python.org/downloads/)
and tick **"Add python.exe to PATH"**.

## Using it over a game

1. Set the game to **Borderless Windowed** (not exclusive fullscreen).
   A topmost window *cannot* draw over exclusive fullscreen — that mode hands the
   whole display to the game. Borderless is required for any overlay.
2. Launch the overlay (`Run Overlay.bat`).
3. Press **Ctrl+Alt+S** to tune the crosshair so it lines up with your game's.

## Configuration

Edit `overlay-config.json`, or use the settings window (**Ctrl+Alt+S**):

| Key | Meaning |
|---|---|
| `crosshair` | on / off |
| `style` | `cross` · `dot` · `circle` · `crossdot` · `tstyle` |
| `size` | arm length in px |
| `gap` | centre gap in px |
| `thickness` | line width in px |
| `color` / `outline` | fill and outline colours |
| `offset_x` / `offset_y` | nudge the crosshair off screen centre |
| `show_clock` / `show_timer` | HUD elements |
| `label` / `label_x` / `label_y` | your own text on screen |
| `opacity` | 0.0 – 1.0 |
| `hotkeys` | rebind any of the four actions |

Hotkey syntax: `ctrl+alt+c`, `ctrl+shift+1`, `alt+f1` — modifiers are
`ctrl`, `alt`, `shift`, `win`, plus a letter or digit.

## Self-test

```bat
python overlay.pyw --selftest
```

Creates the window, draws a few frames, reports how many hotkeys registered, and exits.

## Files

```
overlay/
├── overlay.pyw            the app (rename to .py if you prefer a console)
├── Run Overlay.bat        double-click launcher
├── overlay-config.json    created on first run
└── README.md              this file
```

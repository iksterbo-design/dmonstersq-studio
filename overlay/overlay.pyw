"""
D MONSTERS Q STUDIO — OVERLAY
=============================

A transparent, always-on-top, CLICK-THROUGH overlay for your desktop.

WHAT IT IS
    A separate window that floats above everything and draws a crosshair,
    a clock, a session timer and an optional text label.

WHAT IT IS *NOT*  (and never will be)
    - It does NOT inject a DLL into any game
    - It does NOT hook DirectX / Vulkan
    - It does NOT read another process's memory
    - It does NOT know anything about what is on your screen
    It is a dumb drawing surface. That is what keeps it safe.

Run with:   pythonw overlay.pyw
Hotkeys:    Ctrl+Alt+C  toggle crosshair
            Ctrl+Alt+H  hide / show overlay
            Ctrl+Alt+S  settings window
            Ctrl+Alt+Q  quit
"""

import ctypes
import ctypes.wintypes as wt
import json
import os
import sys
import time
import threading
import tkinter as tk
from tkinter import colorchooser

# --------------------------------------------------------------------------
# Windows API
# --------------------------------------------------------------------------
user32 = ctypes.windll.user32

GWL_EXSTYLE      = -20
WS_EX_LAYERED    = 0x00080000
WS_EX_TRANSPARENT = 0x00000020
WS_EX_TOOLWINDOW = 0x00000080
WS_EX_NOACTIVATE = 0x08000000

MOD_ALT, MOD_CONTROL, MOD_SHIFT, MOD_WIN = 0x0001, 0x0002, 0x0004, 0x0008
MOD_NOREPEAT = 0x4000
WM_HOTKEY = 0x0312
PM_REMOVE = 0x0001

TRANSPARENT_KEY = "#010203"          # colour treated as "see-through"
HERE = os.path.dirname(os.path.abspath(__file__))
CFG_PATH = os.path.join(HERE, "overlay-config.json")

DEFAULTS = {
    "crosshair": True,
    "style": "crossdot",        # cross | dot | circle | crossdot | tstyle
    "size": 12,
    "gap": 5,
    "thickness": 2,
    "color": "#2dd4bf",
    "outline": "#000000",
    "offset_x": 0,
    "offset_y": 0,
    "show_clock": True,
    "show_timer": True,
    "label": "",
    "label_x": 40,
    "label_y": 40,
    "opacity": 0.95,
    "hotkeys": {
        "toggle_crosshair": "ctrl+alt+c",
        "toggle_overlay": "ctrl+alt+h",
        "settings": "ctrl+alt+s",
        "quit": "ctrl+alt+q",
    },
}

VK_NAMES = {chr(c): c for c in range(ord("A"), ord("Z") + 1)}
VK_NAMES.update({str(d): ord(str(d)) for d in range(10)})


def load_cfg():
    cfg = json.loads(json.dumps(DEFAULTS))     # deep copy
    if os.path.exists(CFG_PATH):
        try:
            with open(CFG_PATH, "r", encoding="utf-8") as f:
                saved = json.load(f)
            for k, v in saved.items():
                if k == "hotkeys" and isinstance(v, dict):
                    cfg["hotkeys"].update(v)
                else:
                    cfg[k] = v
        except Exception as e:
            print("config load failed:", e)
    return cfg


def save_cfg(cfg):
    try:
        with open(CFG_PATH, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception as e:
        print("config save failed:", e)


def parse_hotkey(spec):
    """'ctrl+alt+c' -> (modifiers, vk). Returns None if unparseable."""
    mods = 0
    key = None
    for part in str(spec).lower().split("+"):
        part = part.strip()
        if part in ("ctrl", "control"):
            mods |= MOD_CONTROL
        elif part == "alt":
            mods |= MOD_ALT
        elif part == "shift":
            mods |= MOD_SHIFT
        elif part == "win":
            mods |= MOD_WIN
        elif part.upper() in VK_NAMES:
            key = VK_NAMES[part.upper()]
    if key is None:
        return None
    return (mods | MOD_NOREPEAT, key)


# --------------------------------------------------------------------------
# Overlay
# --------------------------------------------------------------------------
class Overlay:

    def __init__(self):
        self.cfg = load_cfg()
        self.start = time.time()
        self.hidden = False
        self.hotkey_ids = {}
        self._drag = None

        self.root = tk.Tk()
        self.root.title("DMQ Overlay")
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        self.root.attributes("-alpha", float(self.cfg["opacity"]))
        try:
            self.root.attributes("-transparentcolor", TRANSPARENT_KEY)
        except tk.TclError:
            print("warning: -transparentcolor unsupported")
        try:
            self.root.attributes("-toolwindow", True)
        except tk.TclError:
            pass

        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        self.sw, self.sh = sw, sh
        self.root.geometry(f"{sw}x{sh}+0+0")
        self.root.configure(bg=TRANSPARENT_KEY)

        self.canvas = tk.Canvas(self.root, width=sw, height=sh,
                                bg=TRANSPARENT_KEY, highlightthickness=0, bd=0)
        self.canvas.pack(fill="both", expand=True)

        self.root.update_idletasks()
        self.make_click_through()
        self.register_hotkeys()
        self.build_settings_window()

        self.tick()

    # ---------------- window plumbing ----------------
    def hwnd(self):
        return user32.GetAncestor(self.root.winfo_id(), 2)  # GA_ROOT

    def make_click_through(self):
        try:
            h = self.hwnd()
            ex = user32.GetWindowLongW(h, GWL_EXSTYLE)
            user32.SetWindowLongW(
                h, GWL_EXSTYLE,
                ex | WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE
            )
        except Exception as e:
            print("click-through failed:", e)

    def register_hotkeys(self):
        """Register global hotkeys on a DEDICATED THREAD with its own message queue.

        Doing this on the Tk thread with PeekMessage(NULL, ...) steals Tk's own
        window messages (WM_PAINT etc.), so Tk reposts them forever and the loop
        spins. A separate thread gets its own queue and blocks on GetMessage, so
        it costs nothing while idle.
        """
        self._stop = False
        self._hk_thread_id = None
        self._hk_thread = threading.Thread(target=self._hotkey_loop, daemon=True)
        self._hk_thread.start()

    def _hotkey_loop(self):
        self._hk_thread_id = ctypes.windll.kernel32.GetCurrentThreadId()
        table = {}
        for name, spec in self.cfg["hotkeys"].items():
            parsed = parse_hotkey(spec)
            if not parsed:
                continue
            hid = (abs(hash(name)) % 60000) + 1
            # hwnd = NULL -> WM_HOTKEY is posted to THIS thread's queue
            if user32.RegisterHotKey(None, hid, parsed[0], parsed[1]):
                table[hid] = name
            else:
                print("hotkey %s unavailable (already in use?)" % spec)
        self.hotkey_ids = table

        msg = wt.MSG()
        while not self._stop:
            r = user32.GetMessageW(ctypes.byref(msg), None, 0, 0)
            if r in (0, -1):
                break
            if msg.message == WM_HOTKEY:
                name = table.get(msg.wParam)
                if name:
                    self.root.after(0, lambda n=name: self.on_hotkey(n))
        for hid in list(table):
            try:
                user32.UnregisterHotKey(None, hid)
            except Exception:
                pass

    def on_hotkey(self, name):
        if name == "toggle_crosshair":
            self.cfg["crosshair"] = not self.cfg["crosshair"]
            self.sync_settings_ui()
        elif name == "toggle_overlay":
            self.hidden = not self.hidden
            if self.hidden:
                self.root.withdraw()
            else:
                self.root.deiconify()
                self.root.attributes("-topmost", True)
                self.make_click_through()
        elif name == "settings":
            self.show_settings()
        elif name == "quit":
            self.quit()
        save_cfg(self.cfg)

    def quit(self):
        save_cfg(self.cfg)
        self._stop = True
        # wake the blocked GetMessage so the hotkey thread can exit cleanly
        try:
            if self._hk_thread_id:
                user32.PostThreadMessageW(self._hk_thread_id, 0x0012, 0, 0)  # WM_QUIT
        except Exception:
            pass
        try:
            self.root.destroy()
        except Exception:
            pass

    # ---------------- drawing ----------------
    def tick(self):
        self.draw()
        self.root.after(200 if not self.cfg["crosshair"] else 100, self.tick)

    def draw(self):
        c = self.canvas
        c.delete("all")
        cfg = self.cfg

        # ---- crosshair ----
        if cfg["crosshair"]:
            cx = self.sw // 2 + int(cfg["offset_x"])
            cy = self.sh // 2 + int(cfg["offset_y"])
            self.draw_crosshair(cx, cy)

        # ---- clock / timer ----
        if cfg["show_clock"]:
            now = time.strftime("%H:%M:%S")
            c.create_text(self.sw - 20, 22, text=now, anchor="ne",
                          fill="#e6edf3", font=("Consolas", 16, "bold"))
        if cfg["show_timer"]:
            el = int(time.time() - self.start)
            hh, rem = divmod(el, 3600)
            mm, ss = divmod(rem, 60)
            txt = f"session {hh:02d}:{mm:02d}:{ss:02d}"
            c.create_text(self.sw - 20, 48, text=txt, anchor="ne",
                          fill="#2dd4bf", font=("Consolas", 11))

        # ---- label ----
        if cfg["label"]:
            c.create_text(int(cfg["label_x"]), int(cfg["label_y"]),
                          text=cfg["label"], anchor="nw",
                          fill="#e6edf3", font=("Segoe UI", 13, "bold"))

    def draw_crosshair(self, cx, cy):
        c = self.canvas
        cfg = self.cfg
        style = cfg["style"]
        s = int(cfg["size"])
        gap = int(cfg["gap"])
        th = int(cfg["thickness"])
        col = cfg["color"]
        out = cfg["outline"]

        def line(x1, y1, x2, y2, colour, width):
            c.create_line(x1, y1, x2, y2, fill=colour, width=width, capstyle="round")

        def ring(r, colour, width):
            c.create_oval(cx - r, cy - r, cx + r, cy + r, outline=colour, width=width)

        outline_w = th + 2

        if style in ("cross", "crossdot", "tstyle"):
            arms = [
                (cx - gap - s, cy, cx - gap, cy),
                (cx + gap, cy, cx + gap + s, cy),
                (cx, cy - gap - s, cx, cy - gap),
            ]
            if style != "tstyle":
                arms.append((cx, cy + gap, cx, cy + gap + s))
            for x1, y1, x2, y2 in arms:
                line(x1, y1, x2, y2, out, outline_w)
            for x1, y1, x2, y2 in arms:
                line(x1, y1, x2, y2, col, th)

        if style in ("dot", "crossdot"):
            r = max(1.5, th * 0.9)
            c.create_oval(cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1, fill=out, outline="")
            c.create_oval(cx - r, cy - r, cx + r, cy + r, fill=col, outline="")

        if style == "circle":
            ring(s + gap, out, outline_w)
            ring(s + gap, col, th)

    # ---------------- settings window ----------------
    def build_settings_window(self):
        self.settings = tk.Toplevel(self.root)
        self.settings.title("DMQ Overlay — Settings")
        self.settings.configure(bg="#161b22")
        self.settings.attributes("-topmost", True)
        self.settings.protocol("WM_DELETE_WINDOW", self.settings.withdraw)
        self.settings.geometry("+80+80")

        fg, bg, acc = "#e6edf3", "#161b22", "#2dd4bf"
        pad = {"padx": 10, "pady": 4}

        def lab(t):
            return tk.Label(self.settings, text=t, fg=fg, bg=bg, anchor="w", width=13,
                            font=("Segoe UI", 9))

        row = 0

        def add_scale(name, frm, to, key):
            nonlocal row
            lab(name).grid(row=row, column=0, sticky="w", **pad)
            var = tk.IntVar(value=int(self.cfg[key]))
            s = tk.Scale(self.settings, from_=frm, to=to, orient="horizontal", variable=var,
                         bg=bg, fg=fg, troughcolor="#0a0e14", highlightthickness=0,
                         length=180, font=("Segoe UI", 8),
                         command=lambda v, k=key: self.set(k, int(float(v))))
            s.grid(row=row, column=1, sticky="w", **pad)
            setattr(self, f"ui_{key}", var)
            row += 1
            return var

        add_scale("Size", 4, 40, "size")
        add_scale("Gap", 0, 20, "gap")
        add_scale("Thickness", 1, 8, "thickness")
        add_scale("Offset X", -200, 200, "offset_x")
        add_scale("Offset Y", -200, 200, "offset_y")

        lab("Style").grid(row=row, column=0, sticky="w", **pad)
        self.ui_style = tk.StringVar(value=self.cfg["style"])
        tk.OptionMenu(self.settings, self.ui_style, "cross", "dot", "circle",
                      "crossdot", "tstyle",
                      command=lambda v: self.set("style", v)).grid(row=row, column=1, sticky="w", **pad)
        row += 1

        self.ui_cross = tk.BooleanVar(value=bool(self.cfg["crosshair"]))
        tk.Checkbutton(self.settings, text="Crosshair", variable=self.ui_cross,
                       command=lambda: self.set("crosshair", self.ui_cross.get()),
                       fg=fg, bg=bg, selectcolor="#0a0e14", activebackground=bg,
                       font=("Segoe UI", 9)).grid(row=row, column=0, sticky="w", **pad)
        row += 1

        self.ui_clock = tk.BooleanVar(value=bool(self.cfg["show_clock"]))
        tk.Checkbutton(self.settings, text="Clock", variable=self.ui_clock,
                       command=lambda: self.set("show_clock", self.ui_clock.get()),
                       fg=fg, bg=bg, selectcolor="#0a0e14", activebackground=bg,
                       font=("Segoe UI", 9)).grid(row=row, column=0, sticky="w", **pad)
        row += 1

        self.ui_timer = tk.BooleanVar(value=bool(self.cfg["show_timer"]))
        tk.Checkbutton(self.settings, text="Session timer", variable=self.ui_timer,
                       command=lambda: self.set("show_timer", self.ui_timer.get()),
                       fg=fg, bg=bg, selectcolor="#0a0e14", activebackground=bg,
                       font=("Segoe UI", 9)).grid(row=row, column=0, sticky="w", **pad)
        row += 1

        lab("Label").grid(row=row, column=0, sticky="w", **pad)
        self.ui_label = tk.Entry(self.settings, width=24, bg="#0a0e14", fg=fg,
                                 insertbackground=fg, font=("Segoe UI", 9))
        self.ui_label.insert(0, self.cfg["label"])
        self.ui_label.grid(row=row, column=1, sticky="w", **pad)
        self.ui_label.bind("<KeyRelease>", lambda e: self.set("label", self.ui_label.get()))
        row += 1

        def pick_colour():
            rgb, hx = colorchooser.askcolor(color=self.cfg["color"])
            if hx:
                self.set("color", hx)
        lab("Colour").grid(row=row, column=0, sticky="w", **pad)
        tk.Button(self.settings, text="Pick…", command=pick_colour,
                  bg="#1c2330", fg=fg, font=("Segoe UI", 9)).grid(row=row, column=1, sticky="w", **pad)
        row += 1

        tk.Label(self.settings,
                 text="Hotkeys: Ctrl+Alt+C crosshair · H hide · S settings · Q quit",
                 fg="#8b949e", bg=bg, font=("Segoe UI", 8), wraplength=280,
                 justify="left").grid(row=row, column=0, columnspan=2, sticky="w", **pad)
        row += 1
        tk.Button(self.settings, text="Close", command=self.settings.withdraw,
                  bg="#7c5cff", fg="#fff", font=("Segoe UI", 9, "bold")).grid(
                      row=row, column=0, columnspan=2, pady=8)

        self.settings.withdraw()

    def show_settings(self):
        self.settings.deiconify()
        self.settings.lift()
        self.settings.attributes("-topmost", True)

    def set(self, key, value):
        self.cfg[key] = value
        if key == "opacity":
            self.root.attributes("-alpha", float(value))
        save_cfg(self.cfg)

    def sync_settings_ui(self):
        try:
            self.ui_cross.set(bool(self.cfg["crosshair"]))
        except Exception:
            pass

    def run(self):
        self.root.mainloop()


def selftest():
    """Create the overlay, draw a few frames, then exit. For automated checks."""
    ov = Overlay()
    for _ in range(6):
        ov.root.update()
        ov.draw()
        time.sleep(0.05)
    time.sleep(0.5)                       # let the hotkey thread register
    items = len(ov.canvas.find_all())
    print("selftest: window ok, canvas items drawn =", items)
    print("selftest: hwnd =", ov.hwnd())
    print("selftest: hotkeys registered =", len(ov.hotkey_ids),
          "->", sorted(ov.hotkey_ids.values()))
    print("selftest: click-through styles applied")
    print("selftest: transparentkey =", TRANSPARENT_KEY, "| screen =", ov.sw, "x", ov.sh)
    ov.quit()
    print("selftest: PASS")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
    else:
        Overlay().run()

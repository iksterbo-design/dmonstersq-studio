"""Generate D MONSTERS Q STUDIO PWA icons (pure stdlib: zlib + struct)."""
import zlib, struct, math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
os.makedirs(OUT, exist_ok=True)

def lerp(a, b, t): return a + (b - a) * t

def seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    L2 = dx*dx + dy*dy
    if L2 == 0: return math.hypot(px-ax, py-ay)
    t = max(0.0, min(1.0, ((px-ax)*dx + (py-ay)*dy) / L2))
    return math.hypot(px - (ax + t*dx), py - (ay + t*dy))

CX = CY = 0.5
R = 0.285          # ring radius
RING = 0.036       # half thickness
TAILW = 0.032

def sample(x, y, maskable):
    """Return (r,g,b,a) for normalized coords."""
    # rounded-rect background mask (transparent outside) unless maskable
    if not maskable:
        rad, pad = 0.235, 0.02
        dx = max(rad - x, x - (1 - rad), 0.0)
        dy = max(rad - y, y - (1 - rad), 0.0)
        if math.hypot(dx, dy) > rad - pad * 0:
            if math.hypot(dx, dy) > rad:
                return (0, 0, 0, 0)
    # background diagonal gradient  #2a1a5e -> #0d1117
    t = (x + y) / 2
    r = lerp(42, 13, t); g = lerp(26, 17, t); b = lerp(94, 23, t)
    d = math.hypot(x - CX, y - CY)
    # soft purple glow behind the ring
    glow = math.exp(-((d - R) ** 2) / 0.010) * 0.55
    r += glow * 70; g += glow * 30; b += glow * 110

    # waveform bars inside the ring (teal)
    bars = [(-0.085, 0.085), (0.0, 0.145), (0.085, 0.070)]
    for bx, bh in bars:
        if abs(x - CX - bx) < 0.019 and abs(y - CY) < bh:
            cap = abs(abs(x - CX - bx) - 0.019) / 0.019
            shade = 0.75 + 0.25 * (1 - cap)
            return (int(45*shade + 40), int(212*shade), int(191*shade), 255)

    # ring colour: vertical teal -> purple gradient
    ang = math.atan2(y - CY, x - CX)
    tt = (math.sin(ang) + 1) / 2
    rr = lerp(45, 124, tt); gg = lerp(212, 92, tt); bb = lerp(191, 255, tt)

    # ring
    if abs(d - R) < RING:
        return (int(rr), int(gg), int(bb), 255)
    # tail of the "Q" (lower-right diagonal)
    a0 = math.radians(42)
    ax = CX + R * math.cos(a0); ay = CY + R * math.sin(a0)
    bx2 = CX + (R + 0.155) * math.cos(a0); by2 = CY + (R + 0.155) * math.sin(a0)
    if seg_dist(x, y, ax, ay, bx2, by2) < TAILW:
        return (int(rr), int(gg), int(bb), 255)

    return (max(0, min(255, int(r))), max(0, min(255, int(g))), max(0, min(255, int(b))), 255)

def render(size, maskable=False, ss=2):
    S = size * ss
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            ar = ag = ab = aa = 0
            for sy in range(ss):
                for sx in range(ss):
                    x = (px * ss + sx + 0.5) / S
                    y = (py * ss + sy + 0.5) / S
                    cr, cg, cb, ca = sample(x, y, maskable)
                    ar += cr * ca; ag += cg * ca; ab += cb * ca; aa += ca
            n = ss * ss
            if aa == 0:
                row += bytes((0, 0, 0, 0))
            else:
                row += bytes((int(ar / aa), int(ag / aa), int(ab / aa), int(aa / n)))
        rows.append(bytes(row))
    return rows

def write_png(path, rows, size):
    raw = b"".join(b"\x00" + r for r in rows)
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data +
                struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) +
           chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)

if __name__ == "__main__":
    jobs = [(192, False, "icon-192.png"), (512, False, "icon-512.png"),
            (512, True, "icon-maskable-512.png")]
    for size, mask, name in jobs:
        rows = render(size, mask, ss=2)
        write_png(os.path.join(OUT, name), rows, size)
        print("wrote", name, os.path.getsize(os.path.join(OUT, name)), "bytes")
    print("done ->", OUT)

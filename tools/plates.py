"""
Backdrop plates for the Ghumakkaad landing page.

These are graded colour plates, not photographs and not pretending to be.
Each one is the light of its scene: layered gradients, atmospheric haze
bands, a little grain. They ship from the site's own origin as the poster
on each video, so the first screen has depth and warmth the instant it
paints instead of a black rectangle while a clip negotiates its way over
the network.

Regenerate with:

    python3 tools/plates.py public/backdrop

Requires Pillow and numpy (pip install pillow numpy). Only needed if you
want to change the colours; the four files are committed.

Each plate is the poster on its scene's video, so it is what a reader
sees for the moment before footage arrives, and what they keep seeing if
it never does. Edit the colour stops in the four functions at the bottom.
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

W, H = 1600, 900
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
U = XX / W          # 0..1 across
V = YY / H          # 0..1 down


def radial(cx, cy, rx, ry, falloff=1.0):
    """Soft elliptical pool of light centred on (cx, cy) in 0..1 space."""
    d = np.sqrt(((U - cx) / rx) ** 2 + ((V - cy) / ry) ** 2)
    return np.clip(1.0 - d, 0.0, 1.0) ** falloff


def vertical(stops):
    """Vertical gradient from (position, rgb) stops."""
    pos = np.array([p for p, _ in stops], dtype=np.float32)
    cols = np.array([c for _, c in stops], dtype=np.float32)
    out = np.empty((H, W, 3), dtype=np.float32)
    col = np.stack([np.interp(V[:, 0], pos, cols[:, i]) for i in range(3)], axis=-1)
    out[:] = col[:, None, :]
    return out


def add_light(base, mask, rgb, peak):
    """Additive light. `peak` is how many 0-255 units the pool adds where
    the mask is full, so a value is readable as brightness rather than
    being multiplied by an already-0-255 colour and clipping to white."""
    return base + mask[..., None] * (np.array(rgb, dtype=np.float32) / 255.0) * peak


def haze(base, centre, thickness, rgb, strength):
    """A horizontal band of atmosphere, the thing that reads as distance."""
    band = np.exp(-((V - centre) ** 2) / (2 * thickness ** 2))
    return add_light(base, band, rgb, strength)


def stars(base, count, seed, ymax=0.62):
    rng = np.random.default_rng(seed)
    layer = np.zeros((H, W), dtype=np.float32)
    xs = rng.integers(0, W, count)
    ys = (rng.random(count) ** 1.7 * ymax * H).astype(int)
    mag = rng.random(count) ** 3.2
    for x, y, m in zip(xs, ys, mag):
        layer[y, x] = 0.55 + m * 0.9
    img = Image.fromarray((np.clip(layer, 0, 1) * 255).astype(np.uint8))
    img = img.filter(ImageFilter.GaussianBlur(0.7))
    return add_light(base, np.asarray(img, dtype=np.float32) / 255.0, (205, 214, 235), 150)


def streaks(base, count, seed, rgb, strength, y0=0.68, y1=0.99):
    """Long soft horizontal smears: headlights and wet tarmac."""
    rng = np.random.default_rng(seed)
    layer = np.zeros((H, W), dtype=np.float32)
    for _ in range(count):
        y = int(rng.uniform(y0, y1) * H)
        x = rng.uniform(0.04, 0.96) * W
        length = rng.uniform(0.05, 0.30) * W
        amp = rng.uniform(0.25, 1.0)
        xs = np.arange(max(0, int(x - length)), min(W, int(x + length)))
        if not len(xs):
            continue
        prof = np.exp(-((xs - x) ** 2) / (2 * (length / 2.4) ** 2)) * amp
        layer[y, xs] = np.maximum(layer[y, xs], prof)
    img = Image.fromarray((np.clip(layer, 0, 1) * 255).astype(np.uint8))
    img = img.filter(ImageFilter.GaussianBlur(radius=5))
    return add_light(base, np.asarray(img, dtype=np.float32) / 255.0, rgb, strength)


def dunes(base, seed, shade):
    """Stacked soft ridges. They darken what is behind them, the way a dune
    shoulder does, rather than being painted on in their own colour."""
    rng = np.random.default_rng(seed)
    layer = np.zeros((H, W), dtype=np.float32)
    for i in range(5):
        base_y = 0.58 + i * 0.085
        freq = rng.uniform(1.1, 2.6)
        phase = rng.uniform(0, 6.28)
        amp = rng.uniform(0.012, 0.03)
        ridge = base_y + np.sin(U[0] * freq * 6.28 + phase) * amp
        for x in range(W):
            y = int(np.clip(ridge[x], 0, 0.999) * H)
            layer[y:, x] = np.maximum(layer[y:, x], 0.20 + i * 0.055)
    img = Image.fromarray((np.clip(layer, 0, 1) * 255).astype(np.uint8))
    img = img.filter(ImageFilter.GaussianBlur(radius=16))
    m = np.asarray(img, dtype=np.float32)[..., None] / 255.0
    return base * (1.0 - m * shade)


def finish(base, grain=1.2, vignette=0.42, seed=7):
    """A whisper of grain, and a vignette.

    Grain used to be set around 7 here, to stop the gradients reading as
    CSS. That was the wrong place for it. Grain is high-frequency noise,
    which is precisely what WebP cannot encode: it accounted for 97% of
    the file size (282KB against 9KB) and the encoder turned it into
    visible blocks and banding across the sky. The page already lays an
    animated grain over everything on its own fixed layer, so the texture
    is still there, and these files stay smooth and small."""
    rng = np.random.default_rng(seed)
    n = rng.normal(0.0, grain, (H, W, 1)).astype(np.float32)
    n = n + rng.normal(0.0, grain * 0.55, (H, W, 3)).astype(np.float32)
    base = base + n
    d = np.sqrt(((U - 0.5) / 0.78) ** 2 + ((V - 0.46) / 0.86) ** 2)
    base = base * (1.0 - np.clip(d - 0.55, 0, 1) ** 1.5 * vignette)[..., None]
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")


# ---------------------------------------------------------------- plates

def night():
    """Leaving in the dark: sodium light pooling on the road ahead."""
    b = vertical([(0.00, (9, 11, 22)), (0.34, (16, 18, 32)),
                  (0.66, (28, 22, 26)), (1.00, (14, 11, 12))])
    b = stars(b, 520, seed=11)
    b = haze(b, 0.60, 0.085, (150, 132, 190), 20)
    b = add_light(b, radial(0.50, 1.06, 0.52, 0.44, 1.6), (198, 126, 34), 74)
    b = add_light(b, radial(0.50, 1.02, 0.22, 0.20, 2.2), (255, 186, 88), 46)
    b = add_light(b, radial(0.80, 0.10, 0.46, 0.32, 2.2), (120, 150, 235), 22)
    b = streaks(b, 26, seed=3, rgb=(214, 150, 62), strength=34)
    return finish(b, seed=21)


def road():
    """Still moving, warmer, the highway under headlights."""
    b = vertical([(0.00, (13, 12, 18)), (0.40, (24, 19, 20)),
                  (0.74, (44, 30, 18)), (1.00, (20, 14, 10))])
    b = haze(b, 0.66, 0.10, (190, 140, 96), 22)
    b = add_light(b, radial(0.50, 1.04, 0.62, 0.42, 1.6), (214, 138, 40), 80)
    b = add_light(b, radial(0.44, 0.99, 0.18, 0.14, 2.4), (255, 206, 132), 52)
    b = streaks(b, 40, seed=5, rgb=(232, 168, 74), strength=44, y0=0.62)
    return finish(b, seed=33)


def sand():
    """Thar at the end of the afternoon."""
    b = vertical([(0.00, (46, 30, 26)), (0.30, (96, 52, 26)),
                  (0.56, (150, 82, 30)), (0.78, (92, 48, 18)), (1.00, (40, 22, 10))])
    b = haze(b, 0.55, 0.065, (250, 196, 120), 30)
    b = add_light(b, radial(0.62, 0.54, 0.22, 0.14, 2.6), (255, 208, 128), 62)
    b = dunes(b, seed=9, shade=0.46)
    return finish(b, vignette=0.36, seed=44)


def dawn():
    """Home, and the sun coming up behind the bus."""
    b = vertical([(0.00, (22, 20, 40)), (0.26, (60, 34, 44)),
                  (0.54, (132, 66, 32)), (0.80, (176, 96, 34)), (1.00, (64, 32, 14))])
    b = haze(b, 0.72, 0.085, (250, 186, 116), 28)
    b = add_light(b, radial(0.50, 0.86, 0.32, 0.21, 2.2), (255, 196, 106), 66)
    b = add_light(b, radial(0.50, 0.90, 0.10, 0.065, 2.8), (255, 236, 190), 58)
    return finish(b, vignette=0.34, seed=55)


PLATES = {"night": night, "road": road, "sand": sand, "dawn": dawn}

if __name__ == "__main__":
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for name, fn in PLATES.items():
        img = fn()
        p = os.path.join(out, f"{name}.webp")
        img.save(p, "WEBP", quality=88, method=6)
        print(f"  {name:6} {os.path.getsize(p)/1024:6.1f} KB  {img.size[0]}x{img.size[1]}")

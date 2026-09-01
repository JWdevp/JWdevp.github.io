#!/usr/bin/env python3
"""Turn public/images/final.mp4 into the hero character's sprite sheet.

Run this only to regenerate the assets; the output is committed, so a normal
checkout needs none of these tools.

    pip install pillow numpy scipy
    python3 scripts/build-character.py            # needs ffmpeg on PATH

Output:
    public/character/sprite.webp                     one sheet with every pose
    src/components/Character/manifest.json           sheet geometry, per-pose
                                                     gaze, cursor lookup grid

Why a sprite sheet of poses rather than the video itself: the character has to
answer the cursor, which means random access to a pose, and `video.currentTime`
seeking stutters badly under that. Poses also let the background be removed
properly — see `matte()` below.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public' / 'images' / 'final.mp4'
OUT_DIR = ROOT / 'public' / 'character'
# The manifest is small and the app needs it before the first paint, so it is
# bundled from src/ rather than fetched at runtime.
MANIFEST = ROOT / 'src' / 'components' / 'Character' / 'manifest.json'

# --- matte ----------------------------------------------------------------
BORDER = 26            # frame edge that is certainly backdrop
BOTTOM_CLEAR = 260     # bottom corners the shoulders never reach
POLY_DEGREE = 3
BAND = 3               # half-width of the soft edge, px
D_SOLID = 26.0         # distance from the backdrop that is certainly subject
D_WEAK = 11.0          # hysteresis floor; the border residual peaks near 8.5
D_EDGE = 6.0

# --- output ---------------------------------------------------------------
POSES = 48             # distinct head poses kept
SPRITE_WIDTH = 520     # px per pose in the sheet
QUALITY = 78
GUTTER = 8
PAD = 16               # source rows replicated below the crop, so the resize
                       # samples the bust instead of the empty gutter
BOTTOM_PAD = 12        # rows added under the frame while matting, so the
                       # morphology never mistakes the cut for background             # transparent margin around every pose in the sheet.
                       # Without it, lossy compression and sub-pixel sampling
                       # drag a sliver of the neighbouring pose into the window,
                       # which reads as a lit rectangle around the character on
                       # a dark page.
GRID = 33              # cursor lookup grid resolution, per axis
# The pose cloud is L-shaped: the subject never looks up-and-right, so that
# corner of the cursor plane has to be approximated. Plain nearest-neighbour
# trades horizontal error for vertical one-for-one and lands on an up-LEFT
# pose there, which reads as looking the wrong way. Horizontal gaze is much
# more legible than vertical, so weight x harder and let the vertical give.
GAZE_WEIGHT_X = 2.5

# --- gaze tracking --------------------------------------------------------
EYE_ROI = (215, 272, 592, 790)   # y0, y1, x0, x1 in the 1280x720 source
EYE_SPLIT = 690
PUPIL_DARK = 110


def run_ffmpeg(dst: Path) -> None:
    exe = shutil.which('ffmpeg') or ''
    if not exe:
        sys.exit('ffmpeg not found on PATH — needed only to regenerate assets.')
    subprocess.run(
        [exe, '-v', 'error', '-i', str(SOURCE), '-vsync', '0', str(dst / 'f%04d.png')],
        check=True,
    )


def background_plate(im):
    """The backdrop is a smooth gradient; fit it from the edges so it can be
    extrapolated behind the subject."""
    h, w, _ = im.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xn, yn = xx / w, yy / h
    sel = np.zeros((h, w), bool)
    sel[:BORDER] = True
    sel[:, :BORDER] = True
    sel[:, -BORDER:] = True
    # The shoulders leave frame between roughly x=320 and x=960, so the bottom
    # corners are backdrop too. Fitted without them the model extrapolates the
    # lower half badly and the matte floods the whole bottom of the picture.
    sel[-BORDER * 3:, :BOTTOM_CLEAR] = True
    sel[-BORDER * 3:, -BOTTOM_CLEAR:] = True
    terms = [xn ** i * yn ** j
             for i in range(POLY_DEGREE + 1)
             for j in range(POLY_DEGREE + 1 - i)]
    A = np.stack([t[sel] for t in terms], 1)
    full = np.stack([t.ravel() for t in terms], 1)
    out = np.empty_like(im)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, im[..., c][sel], rcond=None)
        out[..., c] = (full @ coef).reshape(h, w)
    return out


def _leaked(mask):
    """The subject reaches the bottom edge and no other; anything else means the
    silhouette has escaped into the backdrop."""
    return mask[0].any() or mask[:, 0].any() or mask[:, -1].any()


def silhouette(d, noise):
    """One filled region for the subject.

    Hysteresis rather than a single cut: the cream sweater comes within ~8 of
    the backdrop along one shoulder, which a single threshold chews into a
    staircase. Seeding on the confident interior and growing through a weak
    threshold recovers that edge. The weak level rides on the frame's own noise
    floor because the opening frames fade in and fit several units worse.
    """
    strong = d > D_SOLID
    weak_level = max(D_WEAK, noise + 2.5)
    while True:
        core = ndi.binary_propagation(strong, mask=d > weak_level)
        if not _leaked(core) or weak_level > D_SOLID:
            break
        weak_level += 2.0
    core = ndi.binary_closing(core, np.ones((9, 9)))
    lab, n = ndi.label(core)
    if n:
        sizes = ndi.sum(core, lab, range(1, n + 1))
        core = lab == (np.argmax(sizes) + 1)
    core = ndi.binary_fill_holes(core)
    core[-1] = ndi.binary_closing(core[-1], np.ones(25))
    core = ndi.binary_fill_holes(core)
    return ndi.binary_closing(core, np.ones((5, 5)))


def matte(path):
    """RGB with the backdrop unmixed out, plus alpha."""
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    bg = background_plate(im)
    d = np.linalg.norm(im - bg, axis=2)
    ring = np.concatenate([d[:60].ravel(), d[:, :110].ravel(), d[:, -110:].ravel()])

    # The bust runs off the bottom of frame, but every morphology step below
    # treats outside-the-array as background and would erode it away there,
    # leaving a soft line across the cut. Extend downward first, trim after.
    im, bg, d = (np.vstack([a, np.repeat(a[-1:], BOTTOM_PAD, axis=0)]) for a in (im, bg, d))
    sil = silhouette(d, float(np.percentile(ring, 99.9)))

    inner = ndi.binary_erosion(sil, np.ones((3, 3)), iterations=BAND)
    outer = ndi.binary_dilation(sil, np.ones((3, 3)), iterations=1)
    alpha = np.zeros(d.shape, np.float32)
    alpha[inner] = 1.0
    band = outer & ~inner
    alpha[band] = np.clip((d[band] - D_EDGE) / (D_SOLID - D_EDGE), 0, 1)
    alpha = ndi.gaussian_filter(alpha, 0.7)
    alpha[inner] = 1.0
    alpha[~outer] = 0.0

    # Unmix: pull the pale backdrop out of the soft edge so it cannot survive as
    # a light fringe once the character sits on a dark page.
    a = np.clip(alpha, 1e-3, 1)[..., None]
    fg = np.clip((im - (1 - a) * bg) / a, 0, 255)
    return fg[:-BOTTOM_PAD].astype(np.uint8), (alpha[:-BOTTOM_PAD] * 255).astype(np.uint8)


def _pupil(lum, x0, x1):
    sub = lum[:, x0:x1]
    m = sub < PUPIL_DARK
    if m.sum() < 12:
        m = sub < np.percentile(sub, 4)
    ys, xs = np.nonzero(m)
    w = (PUPIL_DARK - sub[ys, xs]).clip(1)
    return (xs * w).sum() / w.sum() + x0, (ys * w).sum() / w.sum()


def gaze(path):
    """Where this frame is looking, read off the pupils. Their position in frame
    carries the head turn and the eye turn together, which is the whole signal."""
    a = np.asarray(Image.open(path).convert('L')).astype(np.float32)
    y0, y1, x0, x1 = EYE_ROI
    lum = a[y0:y1, x0:x1]
    lx, ly = _pupil(lum, 0, EYE_SPLIT - x0)
    rx, ry = _pupil(lum, EYE_SPLIT - x0, x1 - x0)
    return (lx + rx) / 2 + x0, (ly + ry) / 2 + y0


def pick_poses(g, n):
    """Farthest-point sampling over the gaze cloud: an even spread of directions
    rather than n consecutive frames, which would all look the same."""
    pts = (g - g.mean(0)) / g.std(0)
    chosen = [int(np.argmin(np.linalg.norm(pts, axis=1)))]   # the neutral pose first
    dist = np.linalg.norm(pts - pts[chosen[0]], axis=1)
    while len(chosen) < n:
        k = int(np.argmax(dist))
        chosen.append(k)
        dist = np.minimum(dist, np.linalg.norm(pts - pts[k], axis=1))
    return chosen


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--poses', type=int, default=POSES)
    ap.add_argument('--width', type=int, default=SPRITE_WIDTH)
    ap.add_argument('--quality', type=int, default=QUALITY)
    args = ap.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        print('extracting frames…')
        run_ffmpeg(tmp)
        frames = sorted(tmp.glob('*.png'))
        print(f'  {len(frames)} frames')

        print('reading gaze…')
        g = np.array([gaze(f) for f in frames])

        idx = pick_poses(g, args.poses)
        print(f'selected {len(idx)} poses')

        print('matting…')
        mattes = {i: matte(frames[i]) for i in sorted(set(idx))}

        # One crop for every pose, so nothing shifts between them.
        x0 = y0 = 10 ** 9
        x1 = y1 = -1
        for _, al in mattes.values():
            ys, xs = np.nonzero(al > 6)
            x0, x1 = min(x0, xs.min()), max(x1, xs.max())
            y0, y1 = min(y0, ys.min()), max(y1, ys.max())
        print(f'  crop x {x0}..{x1}  y {y0}..{y1}')

        pw = args.width                                   # pose, before the gutter
        ph = round((y1 - y0 + 1) * pw / (x1 - x0 + 1))
        cw, ch = pw + GUTTER * 2, ph + GUTTER * 2         # cell, what CSS shows
        cols = 8
        rows = (len(idx) + cols - 1) // cols
        sheet = Image.new('RGBA', (cols * cw, rows * ch), (0, 0, 0, 0))
        pad_h = round(PAD * pw / (x1 - x0 + 1))
        for n, i in enumerate(idx):
            fg, al = mattes[i]
            box = np.dstack([fg, al])[y0:y1 + 1, x0:x1 + 1]
            box = np.vstack([box, np.repeat(box[-1:], PAD, axis=0)])
            tile = Image.fromarray(box, 'RGBA') \
                        .resize((pw, ph + pad_h), Image.LANCZOS) \
                        .crop((0, 0, pw, ph))
            sheet.paste(tile, ((n % cols) * cw + GUTTER, (n // cols) * ch + GUTTER))

        sprite = OUT_DIR / 'sprite.webp'
        sheet.save(sprite, 'WEBP', quality=args.quality, method=6)

        # Normalise gaze to -1..1 so the runtime never sees pixel coordinates.
        sel = g[idx]
        lo, hi = g.min(0), g.max(0)
        mid, half = (lo + hi) / 2, (hi - lo) / 2
        norm = (sel - mid) / half
        norm[:, 1] *= -1          # image y grows downward; up should be +1

        # Bake the cursor lookup: for each cell of the cursor plane, the pose
        # whose gaze matches best. Done here so the runtime is one array read.
        ax = np.linspace(-1, 1, GRID)
        # Rows run top-down, like screen rows: row 0 is the cursor at the top of
        # its range (gaze y = +1, looking up). The runtime reads it the same way.
        lookup = []
        for gy in ax[::-1]:
            row = []
            for gx in ax:
                d2 = GAZE_WEIGHT_X * (norm[:, 0] - gx) ** 2 + (norm[:, 1] - gy) ** 2
                row.append(int(np.argmin(d2)))
            lookup.append(row)

        manifest = {
            'sprite': 'sprite.webp',
            'frameWidth': cw,
            'frameHeight': ch,
            'columns': cols,
            'rows': rows,
            'count': len(idx),
            'neutral': 0,
            'gaze': [[round(float(a), 4), round(float(b), 4)] for a, b in norm],
            'lookupSize': GRID,
            'lookup': lookup,
            'source': 'images/final.mp4',
        }
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(json.dumps(manifest))

        kb = sprite.stat().st_size / 1024
        print(f'wrote {sprite.relative_to(ROOT)}  {kb:.0f} KB  '
              f'({cols}x{rows} cells of {cw}x{ch}, pose {pw}x{ph})')
        print(f'wrote {MANIFEST.relative_to(ROOT)}')


if __name__ == '__main__':
    main()

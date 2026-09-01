#!/usr/bin/env python3
"""Turn public/images/final.mp4 into the hero character's frame sheet.

Run this only to regenerate the assets; the output is committed, so a normal
checkout needs none of these tools.

    pip install pillow numpy scipy
    python3 scripts/build-character.py            # needs ffmpeg on PATH

Output:
    public/character/frames.webp                 the clip, in order, one sheet
    public/character/still.webp                  one frame, for touch devices
    src/components/Character/manifest.json       sheet geometry + per-frame gaze

The frames are kept IN THE ORDER THEY WERE FILMED, evenly spaced through the
clip. That is the whole point: the runtime walks the sheet one frame at a time,
so what it shows is the movement that was actually recorded, not a cut between
two unrelated poses. Picking N spread-out "poses" by how they look, as an
earlier version did, made every change of direction a visible jump — adjacent
recorded frames differ by ~1.6/255 mean, poses chosen that way by ~10.

Why a sheet rather than the video itself: driving `video.currentTime` from an
animation frame does not work. Seeks are asynchronous and coalesce, so the
element presents a fraction of the frames asked for; a sheet is one decode and
then a transform per frame, which is exact and costs nothing.
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
# One CONTIGUOUS stretch of the clip is kept, at full frame rate.
#
# Contiguous is the whole point. The cursor picks the frame that looks nearest
# to it, and two frames that look in similar directions have to be similar
# pictures or the change between them reads as a cut. Within one unbroken pass
# of the recording they are: neighbouring cursor positions land on frames a few
# hundredths of a second apart. Sampled across the whole clip they are not —
# the same direction recurs several times with the body in a different place,
# and crossing between those recurrences is what pops.
#
# The window is chosen below by how well it covers the nine directions, not by
# hand. SEGMENT is its length in source frames; the search picks where it goes.
SEGMENT = 72
SPRITE_WIDTH = 400     # px per frame in the sheet
QUALITY = 72
GUTTER = 8
PAD = 16               # source rows replicated below the crop, so the resize
                       # samples the bust instead of the empty gutter
BOTTOM_PAD = 12        # rows added under the frame while matting, so the
                       # morphology never mistakes the cut for background             # transparent margin around every pose in the sheet.
                       # Without it, lossy compression and sub-pixel sampling
                       # drag a sliver of the neighbouring pose into the window,
                       # which reads as a lit rectangle around the character on
                       # a dark page.
# The gaze cloud is L-shaped: the subject never looks up-and-right, so that
# corner of the cursor plane has to be approximated. Weighing both axes equally
# lands on an up-LEFT frame there, which reads as looking the wrong way.
# Horizontal gaze is much more legible than vertical, so the runtime weights x
# harder and lets the vertical give. Shipped in the manifest, applied there.
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


# The nine directions the window has to be able to answer, in normalised gaze.
DIRECTIONS = [(-1, 1), (0, 1), (1, 1), (-1, 0), (0, 0), (1, 0), (-1, -1), (0, -1), (1, -1)]


def pick_frames(norm, length):
    """The contiguous run of `length` frames that answers the nine directions
    best, as a list of source frame indices.

    Contiguous, so every frame in it belongs to one unbroken pass of the
    recording and any two are a plausible pair to cut between. Chosen by
    coverage rather than by hand, so re-running this on a different take still
    picks a sensible window.

    The clip revisits every direction several times, so a window this short
    loses almost nothing: the corner the subject never looks at is missing from
    the whole recording, not from the window."""
    total = len(norm)
    length = min(length, total)
    best, where = None, 0
    for start in range(total - length + 1):
        win = norm[start:start + length]
        errs = [
            np.sqrt(np.min(GAZE_WEIGHT_X * (win[:, 0] - dx) ** 2 + (win[:, 1] - dy) ** 2))
            for dx, dy in DIRECTIONS
        ]
        # Mean keeps the window broadly useful, max stops it abandoning one
        # direction entirely to be slightly better at the rest.
        cost = float(np.mean(errs)) + float(np.max(errs))
        if best is None or cost < best:
            best, where = cost, start
    return list(range(where, where + length))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--segment', type=int, default=SEGMENT)
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

        # Normalise to -1..1 across the WHOLE clip, before choosing the window,
        # so the window is judged against the full range the subject ever
        # reaches rather than against its own.
        lo, hi = g.min(0), g.max(0)
        mid, half = (lo + hi) / 2, (hi - lo) / 2
        norm_all = (g - mid) / half
        norm_all[:, 1] *= -1      # image y grows downward; up should be +1

        idx = pick_frames(norm_all, args.segment)
        print(f'window: source frames {idx[0]}..{idx[-1]} of {len(frames)}')
        for (dx, dy), name in zip(DIRECTIONS, (
                'TOP-LEFT', 'TOP-CENTER', 'TOP-RIGHT', 'CENTER-LEFT', 'CENTER',
                'CENTER-RIGHT', 'BOTTOM-LEFT', 'BOTTOM-CENTER', 'BOTTOM-RIGHT')):
            win = norm_all[idx]
            k = int(np.argmin(GAZE_WEIGHT_X * (win[:, 0] - dx) ** 2 + (win[:, 1] - dy) ** 2))
            print(f'  {name:<14} {win[k][0]:+.2f} {win[k][1]:+.2f}')

        print('matting…')
        mattes = {i: matte(frames[i]) for i in sorted(set(idx))}

        # One crop for every frame, so nothing shifts between them.
        x0 = y0 = 10 ** 9
        x1 = y1 = -1
        for _, al in mattes.values():
            ys, xs = np.nonzero(al > 6)
            x0, x1 = min(x0, xs.min()), max(x1, xs.max())
            y0, y1 = min(y0, ys.min()), max(y1, ys.max())
        print(f'  crop x {x0}..{x1}  y {y0}..{y1}')

        pw = args.width                                   # frame, before the gutter
        ph = round((y1 - y0 + 1) * pw / (x1 - x0 + 1))
        cw, ch = pw + GUTTER * 2, ph + GUTTER * 2         # cell, what CSS shows
        # Roughly square sheet: a long thin one wastes more of the browser's
        # maximum texture dimension than it needs to.
        cols = max(1, round((len(idx) * ch / cw) ** 0.5))
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

        sprite = OUT_DIR / 'frames.webp'
        sheet.save(sprite, 'WEBP', quality=args.quality, method=6)

        # Rescale to what THIS window can actually do. The normalisation above
        # spans the whole clip, but the window is one pass of it and does not
        # reach as far in every direction — here it stops at -0.68 on the left
        # against +1.00 on the right. Left as it was, the cursor's full travel
        # to the left asked for a look the sheet does not contain, and the
        # character simply never got there: it never looked down-left.
        #
        # Each side is scaled on its own, around zero rather than around the
        # range's midpoint, so full deflection reaches the furthest frame there
        # is while a cursor at rest still picks the frame looking straight
        # ahead — recentring on the midpoint would have left it glancing left.
        norm = norm_all[idx].copy()
        for axis in (0, 1):
            for side in (-1, 1):
                on = np.sign(norm[:, axis]) == side
                if not on.any():
                    continue
                reach = np.abs(norm[on, axis]).max()
                if reach > 0:
                    norm[on, axis] /= reach

        # The frame closest to looking straight ahead. Where the character rests,
        # and the only frame a touch device ever needs.
        neutral = int(np.argmin(GAZE_WEIGHT_X * norm[:, 0] ** 2 + norm[:, 1] ** 2))

        # A touch device cannot track a cursor, so it never loads the sheet —
        # which is also what keeps the sheet's size off the mobile budget.
        still = OUT_DIR / 'still.webp'
        n = neutral
        sheet.crop(((n % cols) * cw, (n // cols) * ch,
                    (n % cols) * cw + cw, (n // cols) * ch + ch)) \
             .save(still, 'WEBP', quality=args.quality + 8, method=6)

        manifest = {
            'sprite': 'frames.webp',
            'still': 'still.webp',
            'frameWidth': cw,
            'frameHeight': ch,
            'columns': cols,
            'rows': rows,
            'count': len(idx),
            'neutral': neutral,
            'gazeWeightX': GAZE_WEIGHT_X,
            'gaze': [[round(float(a), 4), round(float(b), 4)] for a, b in norm],
            'source': 'images/final.mp4',
        }
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(json.dumps(manifest))

        mp = cols * cw * rows * ch / 1e6
        print(f'wrote {sprite.relative_to(ROOT)}  {sprite.stat().st_size / 1024:.0f} KB  '
              f'({cols}x{rows} cells of {cw}x{ch}, frame {pw}x{ph}, {mp:.1f} MP)')
        print(f'wrote {still.relative_to(ROOT)}  {still.stat().st_size / 1024:.0f} KB  '
              f'(frame {neutral})')
        print(f'wrote {MANIFEST.relative_to(ROOT)}')


if __name__ == '__main__':
    main()

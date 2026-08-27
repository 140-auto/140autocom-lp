#!/usr/bin/env python3
"""Convert a version's scene renders into web assets.

Usage: pack-scenes.py <version>   |   pack-scenes.py sheet <png>...

§1.7 budgets the first poster frame under 100KB, so scenes ship as webp at a
sane display width rather than the 2k, ~6MB PNGs Higgsfield returns.

Portrait variants land under /port so the page serves a native 9:16 render on
phones rather than centre-cropping the landscape one (§1.7: "the portrait chain
is not a port").
"""
import pathlib

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent


def enforce_colour_law(im: Image.Image, cap: bool = True) -> Image.Image:
    """§1.3 / §7 item 4: `#18CB96` green is the ONLY saturated colour in the
    rendered world.

    Image models will not honour that reliably in EITHER direction, so the law is
    enforced here rather than by re-rolling until a render happens to comply:

    * outside the green band, saturation is capped — the renders come back with
      pink brake lights and amber indicators;
    * inside it, saturation is pushed UP to the target. Measured across the
      character sheet, the model lands Amin between S=25% and S=59% against
      #18CB96's S=88%; it under-saturates every time and no amount of prompting
      moved it. Correcting here makes the paint exact and identical in every
      scene instead of approximately right in each one separately.
    """
    hsv = np.asarray(im.convert("HSV"), dtype=np.float32)
    h, sat = hsv[..., 0], hsv[..., 1]

    # PIL packs hue into 0-255. #18CB96 sits at ~165 degrees -> ~117.
    GREEN, HALF_WIDTH = 117.0, 26.0
    dist = np.abs(((h - GREEN + 128.0) % 256.0) - 128.0)

    # 1.0 inside the green band, falling to 0.0 outside it, with a soft edge so
    # nothing bands or posterises at the boundary.
    keep = np.clip(1.0 - (dist - HALF_WIDTH) / 18.0, 0.0, 1.0)

    # §1.3 bans SATURATED colour outside the green, not colour itself. So
    # non-green hues are CLAMPED to a low ceiling rather than multiplied down:
    # the dusty warm haze that makes these read as Egypt passes through
    # untouched, while genuinely saturated things (pink brake lights, amber
    # indicators) get pulled to the ceiling. A flat multiplier killed the warmth
    # along with the violations and left the world lifeless.
    CEILING = 46.0  # of 255
    capped = np.minimum(sat, CEILING)

    # Inside the band, gain the saturation so the band's MEDIAN lands on target.
    # A median-derived gain rather than a flat assignment keeps Amin's shading —
    # lit panels stay lighter than shadowed ones — where forcing every green
    # pixel to one value would flatten him into a sticker.
    TARGET_SAT, TARGET_HUE = 225.0, 115.0  # #18CB96 in PIL's 0-255 HSV

    # PAINT_FLOOR separates Amin's actual paint from greenish compression noise
    # in the grey. Without it the gain lands on that noise too and speckles the
    # road and the buildings with visible teal — the gain is large (3-4x), so a
    # noise pixel at S=8 comes out at S=30, which reads. The floor also keeps the
    # noise out of the median, since including it inflates the gain further.
    PAINT_FLOOR = 40.0
    paint = (keep > 0.5) & (sat > PAINT_FLOOR)
    if paint.sum() > 500:
        gain = TARGET_SAT / max(float(np.median(sat[paint])), 1.0)
        # Ramp the boost in by how saturated the pixel already is, so paint gets
        # the full correction and anything near-grey is left alone.
        strength = np.clip((sat - PAINT_FLOOR) / 30.0, 0.0, 1.0)
        boosted = np.clip(sat + (sat * gain - sat) * strength, 0.0, 255.0)
        # nudge the band's hue onto the exact brand green, shortest way round
        delta = ((TARGET_HUE - h + 128.0) % 256.0) - 128.0
        hsv[..., 0] = (h + delta * keep * strength * 0.8) % 256.0
    else:
        boosted = sat

    # `cap=False` for character-sheet correction: the sheet is a studio shot
    # whose only non-green saturation is Amin's own warm brown irises, and
    # capping those greys out the eyes — the one feature carrying his character.
    outside = capped if cap else sat
    hsv[..., 1] = boosted * keep + outside * (1.0 - keep)
    return Image.fromarray(hsv.astype(np.uint8), "HSV").convert("RGB")


def correct_sheet(path: pathlib.Path) -> None:
    """Put a character-sheet render on-spec IN PLACE.

    The sheet ships nowhere, but it is the reference every scene render is
    conditioned on, so an off-spec green there propagates into all of them. The
    scene pack pass corrects the output too; this corrects the input.
    """
    enforce_colour_law(Image.open(path).convert("RGB"), cap=False).save(path)
    print(f"corrected {path.name}")


# §1.7: "First poster frame under 100KB." b0 is that frame, so it is quality-
# stepped down until it fits rather than being allowed to ship over budget.
POSTER_BUDGET_KB = {"b0": 100}


def pack(src_dir: pathlib.Path, out_dir: pathlib.Path, width: int, quality: int = 82) -> None:
    if not src_dir.is_dir():
        return
    out_dir.mkdir(parents=True, exist_ok=True)
    for src in sorted(src_dir.glob("*.png")):
        im = Image.open(src).convert("RGB")
        h = round(im.height * width / im.width)
        # Resize FIRST, then enforce. Resampling blends Amin's saturated green
        # with the grey around him and lands the intermediate pixels outside the
        # band, so correcting before the resize leaves a saturated halo on his
        # outline in the file that actually ships.
        im = enforce_colour_law(im.resize((width, h), Image.LANCZOS))
        dest = out_dir / f"{src.stem}.webp"
        budget = POSTER_BUDGET_KB.get(src.stem)
        q = quality
        while True:
            im.save(dest, "WEBP", quality=q, method=6)
            kb = dest.stat().st_size / 1024
            if budget is None or kb <= budget or q <= 40:
                break
            q -= 6
        flag = ""
        if budget and kb > budget:
            flag = f"  <-- OVER {budget}KB budget"
        elif budget:
            flag = f"  (q{q}, under {budget}KB budget)"
        print(f"{src.stem:<5} {im.width}x{h:<5} {kb:6.0f} KB{flag}")


if __name__ == "__main__":
    import sys

    # `pack-scenes.py sheet <png>...` corrects character-sheet renders in place;
    # with no arguments it packs the scene renders into web assets.
    if len(sys.argv) > 2 and sys.argv[1] == "sheet":
        for arg in sys.argv[2:]:
            correct_sheet(pathlib.Path(arg))
    else:
        # Assets are namespaced per version. Two films ship side by side and both
        # number their beats from b0, so a shared output directory means whichever
        # packs second silently overwrites the other.
        version = sys.argv[1] if len(sys.argv) > 1 else "lp4"
        out = ROOT / "public/lp" / version / "scenes"
        pack(ROOT / "render" / version / "land", out, 1920)
        pack(ROOT / "render" / version / "port", out / "port", 1080)

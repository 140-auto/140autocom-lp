#!/usr/bin/env python3
"""Does each beat's endpoint pair actually share one locked camera?

lp3's §4 rule is that the camera never moves. Each beat is two stills with a clip
interpolating between them, so the rule holds only if the two endpoints are the
same frame with the car in a different place.

That is not free. Rendering both endpoints from the same TEXT description gives
two different scenes — measured on the first attempt, the b3 pair shared 44% of
its pixels and the two frames had different camera distances, different buildings
and a different row direction. The `b` endpoint is therefore rendered
image-to-image from the finished `a` frame, and this script is what proves it
worked rather than trusting that it did.

A good pair changes only where the car is, so most of the frame is untouched.
A pair below the floor means the camera moved and the clip will drift.

Usage: python3 scripts/check-pairs.py <version>
"""
import pathlib
import sys

import numpy as np
from PIL import Image

# ADVISORY, NOT A HARD GATE — it reports and never fails the build.
#
# The number only means what it says when the top strip is mostly sky. Where the
# strip is dense architecture (a building facade filling the frame) fine detail
# and shading differ slightly between two renders even when the camera is
# provably identical: b5 and b6 both scored in the low 70s-80s and both turned
# out, on inspection, to be correctly locked with the right content change. So a
# low score means LOOK AT IT, not "this is broken".
FLOOR = 90.0  # percent of TOP-STRIP pixels unchanged between endpoints

version = sys.argv[1] if len(sys.argv) > 1 else "lp3"
land = pathlib.Path("render") / version / "land"

pairs = sorted(p.stem[:-1] for p in land.glob("b*a.png") if (land / f"{p.stem[:-1]}b.png").exists())
if not pairs:
    print(f"no endpoint pairs found in {land}")
    sys.exit(0)

worst = 100.0
for stem in pairs:
    a = np.asarray(Image.open(land / f"{stem}a.png").convert("RGB"), dtype=np.int16)
    b = np.asarray(Image.open(land / f"{stem}b.png").convert("RGB"), dtype=np.int16)
    if a.shape != b.shape:
        print(f"  {stem}  DIFFERENT SIZES {a.shape} vs {b.shape}")
        worst = 0.0
        continue
    # Measure the TOP STRIP, not the whole frame and not the full border.
    #
    # Whole-frame sameness conflates "the camera moved" with "the car crossed a
    # lot of the shot": the inspection beat drives Amin right across the grey car
    # and scored 69% with a demonstrably still camera. A full border is no better
    # — the beats where the car drives INTO frame have it crossing the left and
    # right margins, which flagged two pairs whose backgrounds were pixel-identical.
    #
    # The car is on the ground and never enters the top of the frame, so the top
    # strip — sky, rooflines, canopy soffit, the tops of the palms — moves if and
    # only if the camera did.
    h, w = a.shape[:2]
    m = np.zeros((h, w), dtype=bool)
    m[: int(h * 0.18), :] = True
    # Tolerance of 24 across the three channels absorbs encoder noise and the
    # faint relighting a moved car causes, without hiding a moved camera.
    same = ((np.abs(a - b).sum(axis=2) < 24) & m).sum() / m.sum() * 100
    worst = min(worst, same)
    print(f"  {stem}  top strip unchanged: {same:5.1f}%{'   <-- check by eye' if same < FLOOR else ''}")

print(f"§4 locked camera: worst pair {worst:.1f}% of top strip unchanged (advisory floor {FLOOR}%)")
# Never fails the build — see the note on FLOOR. A gate that cries wolf on
# correct frames gets ignored, and then it protects nothing.
sys.exit(0)

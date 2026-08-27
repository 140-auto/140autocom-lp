#!/usr/bin/env python3
"""§7 item 4: no saturated colour other than #18CB96 in any rendered frame.

Two gates matter and both were learned the hard way:

* **Value gate.** HSV saturation is a ratio, so a near-black shadow pixel like
  rgb(5,4,7) reports ~43% "saturation" while being visually pure black. Without
  a V floor the check flags thousands of shadow pixels and tells you nothing.
* **Encoder tolerance.** The law clamps non-green saturation to 46/255 before
  encoding; lossy WebP then drifts chroma by roughly 10/255. The threshold sits
  well above that so the check measures the picture, not the codec.

What survives both gates is a genuinely saturated non-green pixel — a pink brake
light or an amber indicator, the things §1.3 actually bans.
"""
import pathlib
import sys

import numpy as np
from PIL import Image

GREEN, BAND = 117.0, 44.0  # #18CB96 in PIL hue, and the band edge the law uses
# 35% brightness. HSV saturation is a ratio, so it explodes toward the bottom of
# the range: rgb(5,4,7) reports 43% and rgb(66,52,39) reports 41%, and both read
# as black or as dark warm shadow, never as colour. Above this floor the number
# means what it says.
VALUE_FLOOR = 90.0
SATURATED = 102.0          # 40% — unmistakably a colour, not warm neutral
# Counted in PIXELS, not percent: a percentage budget hides the difference
# between one stray encoder artefact and a visible object. Eight pixels in a
# 2.5-megapixel frame cannot be a brake light; anything that is will run to
# thousands.
BUDGET_PX = 8

version = sys.argv[1] if len(sys.argv) > 1 else "lp4"
root = pathlib.Path("public/lp") / version / "scenes"
# Both chains are rendered independently (§1.7), so both are checked — a portrait
# frame can carry a violation the landscape one does not.
scenes = [("land", p) for p in sorted(root.glob("*.webp"))]
scenes += [("port", p) for p in sorted((root / "port").glob("*.webp"))]
worst = 0
for chain, src in scenes:
    hsv = np.asarray(Image.open(src).convert("HSV")).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    outside = (np.abs(((h - GREEN + 128.0) % 256.0) - 128.0) > BAND) & (v > VALUE_FLOOR)
    n = int(((s > SATURATED) & outside).sum())
    worst = max(worst, n)
    print(f"  {chain} {src.stem:<5} saturated non-green: {n:>6} px{'  <-- OVER' if n > BUDGET_PX else ''}")

if not scenes:
    sys.exit("no packed scenes found")
print(f"§7.4 colour law: worst frame {worst} px (budget {BUDGET_PX})")
sys.exit(worst > BUDGET_PX)

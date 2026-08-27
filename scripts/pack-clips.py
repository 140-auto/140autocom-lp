#!/usr/bin/env python3
"""Put lp4's camera clips under the same colour law as the stills (§1.3 / §7.4).

The generator returns Amin between S=69% and S=83% against #18CB96's 88%, and —
worse — it DRIFTS inside a single clip: measured across `order.mp4`, his paint
climbs from 69% to 83% over five seconds. §1.2 allows one paint, so a clip whose
green changes during the shot is a defect even where each individual frame looks
fine. Correcting frame by frame fixes the drift and the offset together, and
makes the clip's green identical to the stills it cross-dissolves with.

Usage: python3 scripts/pack-clips.py <version> <name> [name...]
"""
import pathlib
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import importlib.util

_spec = importlib.util.spec_from_file_location(
    "packscenes", pathlib.Path(__file__).resolve().parent / "pack-scenes.py"
)
_ps = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_ps)

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSION = sys.argv[1] if len(sys.argv) > 1 else "lp4"
SRC = ROOT / "render" / VERSION / "clips"
OUT = ROOT / "public/lp" / VERSION / "clips"


def pack(name: str) -> None:
    src = SRC / f"{name}.src.mp4"
    if not src.exists():
        print(f"{name}: no source clip")
        return
    work = pathlib.Path(tempfile.mkdtemp())
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), str(work / "f%05d.png")],
            check=True,
        )
        frames = sorted(work.glob("f*.png"))
        for f in frames:
            _ps.enforce_colour_law(Image.open(f).convert("RGB")).save(f)
        OUT.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error",
                "-framerate", "24", "-i", str(work / "f%05d.png"),
                "-an", "-c:v", "libx264", "-crf", "23", "-preset", "slow",
                # lp4 shipped two clips at ~1.5MB. lp3 ships six, so the encode is
                # tightened and capped at 1280 wide to keep the total near lp4's
                # rather than tripling it on an Egyptian mobile network (§7).
                "-vf", "scale='min(1280,iw)':-2",
                # keyframe every ~8 frames: scrubbing seeks to arbitrary times, and
                # a sparse GOP makes each seek decode a long run of frames, which is
                # what turns a scrubbed clip to treacle on a phone
                "-g", "8", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                str(OUT / f"{name}.mp4"),
            ],
            check=True,
        )
        kb = (OUT / f"{name}.mp4").stat().st_size / 1024
        print(f"{name:<6} {len(frames):>3} frames  {kb:6.0f} KB")
    finally:
        shutil.rmtree(work, ignore_errors=True)


names = sys.argv[2:] or sorted(p.name[: -len(".src.mp4")] for p in SRC.glob("*.src.mp4"))
if not names:
    print(f"no source clips in {SRC}")
for arg in names:
    pack(arg)

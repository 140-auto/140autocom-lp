#!/bin/bash
# Scene clips. Usage: bash scripts/render-video.sh <version> <name> [name...]
#
# Endpoint pairs come from render/<version>/prompts/video/<name>.frames — one
# line naming the start still and optionally the end still. A per-beat pair with
# IDENTICAL framing is what pins a locked-off camera: the generator has nowhere
# to drift to. lp3 relies on that for every beat; lp4 used it for one.
#
# kling3_0 rather than seedance: ~5x cheaper per second and it still exposes both
# start_image AND end_image, which is what frame-locks a seam. NOTE sound
# defaults to ON, so --sound off is not optional (§1.1: no audio anywhere).
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
V="${1:?usage: render-video.sh <version> <name> [name...]}"; shift
L="$ROOT/render/$V/land"
P="$ROOT/render/$V/prompts/video"
OUT="$ROOT/render/$V/clips"
mkdir -p "$OUT" "$ROOT/public/lp/$V/clips"

# Endpoint stills per clip, read from <name>.frames rather than a case statement
# — with seven clips a case statement is a list to forget to update.
# Format: one line, "b2a b2b" for a pair or "b5" for a single start frame.
frames_for() {
  [ -f "$P/$1.frames" ] || return 0
  # shellcheck disable=SC2046  # deliberate word split: the file holds 1 or 2 stems
  set -- $(cat "$P/$1.frames")
  printf -- '--start-image %s/%s.png' "$L" "$1"
  [ $# -ge 2 ] && printf -- ' --end-image %s/%s.png' "$L" "$2"
}

for n in "$@"; do
  if [ ! -s "$P/$n.txt" ]; then
    echo "$n: no prompt at $P/$n.txt — skipping" >&2
    continue
  fi
  # Both endpoint stills must exist: a clip generated without its end frame is
  # not interpolating between two locked frames, it is inventing the second half.
  miss=""
  for f in $(cat "$P/$n.frames" 2>/dev/null); do
    [ -s "$L/$f.png" ] || miss="$miss $f"
  done
  if [ -n "$miss" ]; then
    echo "$n: missing endpoint still(s):$miss — render those first" >&2
    continue
  fi
  rm -f "$OUT/$n.json" "$OUT/$n.src.mp4"
  echo "launching $n"
  # Retry the transport only, exactly as render-scenes.sh does: a 503 returns
  # instantly, writes an empty result and burns the batch slot. A real job
  # failure comes back as a completed job and must not be resubmitted.
  (
    for attempt in 1 2 3; do
      higgsfield generate create kling3_0 \
        --prompt "$(cat "$P/$n.txt")" \
        $(frames_for "$n") \
        --mode std --duration 5 --sound off --aspect_ratio 16:9 \
        --wait --wait-timeout 20m --json \
        > "$OUT/$n.json" 2> "$OUT/$n.err"
      [ -s "$OUT/$n.json" ] && break
      grep -qE '50[0-9]|timeout|ECONN|socket hang up' "$OUT/$n.err" || break
      echo "$n: transport error, retry $attempt" >&2
      sleep 10
    done
  ) &
  sleep 2
done
wait

for n in "$@"; do
  [ -s "$OUT/$n.json" ] || { echo "$n: no result (check $n.err)"; continue; }
  u=$(python3 -c "import json;print(json.load(open('$OUT/$n.json'))[0]['result_url'])" 2>/dev/null) || continue
  curl -sS -o "$OUT/$n.src.mp4" "$u" || continue

  # §1.7's encode. -an because the page must carry no audio track at all, not
  # merely a muted one. -g 8 puts a keyframe every ~8 frames: scrubbing seeks to
  # arbitrary times, and a sparse GOP makes every seek decode a long run of
  # frames, which is what makes a scrubbed clip feel like treacle on a phone.
  # lp4 shipped two clips at ~1.5MB each. lp3 ships six, so the encode is
  # tightened — crf 23 and a 1280 cap — to keep the total near lp4's rather than
  # tripling it on an Egyptian mobile network (§7).
  ffmpeg -y -loglevel error -i "$OUT/$n.src.mp4" \
    -an -c:v libx264 -crf 23 -preset slow -g 8 -pix_fmt yuv420p \
    -vf "scale='min(1280,iw)':-2" \
    -movflags +faststart "$ROOT/public/lp/$V/clips/$n.mp4"
  echo "$n.mp4 $(du -h "$ROOT/public/lp/$V/clips/$n.mp4" | cut -f1)"
done
echo "batch done"

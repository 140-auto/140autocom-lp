#!/bin/bash
# Amin character sheet renders. Usage: bash scripts/render-amin.sh <view> [view...]
# Views are the files in render/amin/views/ — run build-amin-prompts.sh first.
# Output lands in render/amin/s-<view>.png.
#
# bash 3.2 safe. The plan caps CONCURRENT JOBS — batch in THREES; a fourth
# concurrent job comes back concurrent_jobs_limit and is lost.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
A="$ROOT/render/amin"
B="$ROOT/brand-assets/amin"

# s-front is the MASTER (revised 25 Aug 2026). It changed from n-rear-3q for two
# reasons: the character became a sedan, and lp3 is a locked-off FRONTAL film, so
# the hero view — the one every other view must match — is now the front, not the
# back. It is the roll that came back with the grille correctly forming the mouth
# and no grin creased into the bumper, colour-corrected onto #18CB96 by
# `pack-scenes.py sheet`.
BODY="$A/s-front.png"

refs_for() {
  case "$1" in
    # Rear views get the OVERHEAD master, never the front one. The master is now
    # a front three-quarter (lp3 is a frontal film), and handing a front view to
    # a rear beat is precisely what grew a face on Amin's tailgate before. The
    # overhead still carries the body, the proportions and the stripe placement —
    # everything a rear view needs to match — with the face almost edge-on.
    rear|rear-3q) echo "$A/s-top.png" ;;
    # Everything else gets the front master: it is the one roll whose grille
    # forms the mouth and whose bumper is clean. Every earlier reference carried
    # the grin and copied it through without fail — see build-amin-prompts.sh.
    *) echo "$BODY" ;;
  esac
}

for v in "$@"; do
  args=""
  for f in $(refs_for "$v"); do args="$args --image-references $f"; done
  echo "launching n-$v"
  nohup higgsfield generate create nano_banana_pro \
    --prompt "$(cat "$A/n-$v.txt")" \
    $args --aspect_ratio 3:2 --resolution 2k \
    --wait --wait-timeout 15m --json \
    > "$A/s-$v.json" 2> "$A/s-$v.err" &
  sleep 2
done
wait
# Presigned result URLs expire, so the fetch is part of the render rather than a
# step someone has to remember (same as render-lp4.sh).
for v in "$@"; do
  [ -s "$A/s-$v.json" ] || { echo "s-$v: no result (check s-$v.err)"; continue; }
  u=$(python3 -c "import json;print(json.load(open('$A/s-$v.json'))[0]['result_url'])" 2>/dev/null) || continue
  curl -sS -o "$A/s-$v.png" "$u" && echo "s-$v.png $(du -h "$A/s-$v.png" | cut -f1)"
done
# Put the sheet on-spec: the model under-saturates every time, and the sheet is
# the reference every scene render is conditioned on (§1.2).
python3 "$(dirname "$0")/pack-scenes.py" sheet $(for v in "$@"; do echo "$A/s-$v.png"; done)

echo "batch done"

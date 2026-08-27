#!/bin/bash
# Scene renders. Usage: bash scripts/render-scenes.sh <version> <land|port> <beat> [beat...]
#
# bash 3.2 safe (macOS ships it) — no associative arrays, no mapfile.
# The plan caps CONCURRENT JOBS — batch in THREES. Four came back
# concurrent_jobs_limit and that job is simply lost, so the cap in practice is
# lower than the 4 this script used to assume.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
V="${1:?usage: render-scenes.sh <version> <land|port> <beat>...}"; shift
P="$ROOT/render/$V/prompts"
MODE="$1"; shift
case "$MODE" in
  land) AR="3:2"; OUT="$ROOT/render/$V/land" ;;
  port) AR="9:16"; OUT="$ROOT/render/$V/port" ;;
  *) echo "mode must be land|port"; exit 1 ;;
esac
mkdir -p "$OUT"

# Reference pack per beat, read from render/<version>/prompts/scenes/b<beat>.refs
# — one repo-relative path per line. A file rather than a case statement so the
# pack lives next to the prompt it belongs to.
#
# The packs list Amin's locked sheet, colour-corrected to #18CB96 by
# `pack-scenes.py sheet`, plus any location photo. The photo supplies layout and
# landmarks only, never realism — the style preamble governs the look.
#
# WHICH views to list matters. The sheet is what holds Amin consistent across
# scenes, but hand a chase-cam beat a front view and a face grows on his
# tailgate. Pass the views the beat actually shows.
refs_for() {
  f="$P/scenes/b$1.refs"
  [ -f "$f" ] || { echo "$ROOT/render/amin/s-front.png"; return 0; }
  while read -r line; do
    [ -z "$line" ] && continue
    # In port mode, skip any reference that is a LANDSCAPE frame of this film.
    # Those entries exist to pin an endpoint pair's camera for a clip; there is
    # no portrait clip chain, and handing a 3:2 frame to a 9:16 recompose just
    # reimposes the wide framing.
    case "$MODE:$line" in port:render/*/land/*) continue ;; esac
    printf '%s/%s ' "$ROOT" "$line"
  done < "$f"
}

# Prompt for this beat in this mode. A port twin exists for closing endpoints,
# which are text-to-image in portrait rather than image-to-image (see
# build-lp-prompts.sh).
prompt_for() {
  [ "$MODE" = "port" ] && [ -s "$P/port/b$1.txt" ] && { echo "$P/port/b$1.txt"; return 0; }
  echo "$P/b$1.txt"
}

for b in "$@"; do
  # Refuse rather than pay for nothing. A missing prompt file used to send an
  # EMPTY prompt to the API, which is billed and comes back useless — one lost
  # credit to a caller that word-split its beat list wrong.
  SRC="$(prompt_for "$b")"
  if [ ! -s "$SRC" ]; then
    echo "b$b: no prompt at $SRC — skipping" >&2
    continue
  fi
  # Clear any previous result FIRST. The fetch loop below reads b<beat>.json for
  # its URL, so a leftover json from a discarded render gets re-downloaded over
  # the new frame — deleting just the png is not enough, and the stale image
  # looks like a fresh one.
  # A closing endpoint is rendered IMAGE-TO-IMAGE from its opening frame, so the
  # opening must already exist. Refuse rather than render a `b` from text, which
  # is what produced two endpoints with entirely different cameras.
  missing=""
  for line in $(refs_for "$b"); do
    [ -s "$line" ] || missing="$missing $line"
  done
  if [ -n "$missing" ]; then
    echo "b$b: missing reference(s):$missing — render those first" >&2
    continue
  fi

  rm -f "$OUT/b$b.json" "$OUT/b$b.png"
  args=""
  for f in $(refs_for "$b"); do args="$args --image-references $f"; done
  echo "launching b$b ($MODE, $AR)"
  # §1.7: "the portrait chain is not a port; build it in parallel." Same scene,
  # recomposed for a tall frame rather than the wide one cropped.
  PROMPT="$(cat "$SRC")"
  [ "$MODE" = "port" ] && PROMPT="$PROMPT

$(cat "$P/_portrait.txt")"
  # Retry transient API failures. A 503 comes back in under a second, writes an
  # empty result and consumes the batch slot exactly as a real render would —
  # three of them in a row cost more wall-clock than the renders did. Only the
  # transport is retried: an `nsfw` rejection or a genuine job failure is
  # returned as a completed job and must NOT be resubmitted.
  (
    for attempt in 1 2 3; do
      higgsfield generate create nano_banana_pro \
        --prompt "$PROMPT" \
        $args --aspect_ratio "$AR" --resolution 2k \
        --wait --wait-timeout 15m --json \
        > "$OUT/b$b.json" 2> "$OUT/b$b.err"
      [ -s "$OUT/b$b.json" ] && break
      grep -qE '50[0-9]|timeout|ECONN|socket hang up' "$OUT/b$b.err" || break
      echo "b$b: transport error, retry $attempt" >&2
      sleep 10
    done
  ) &
  sleep 2
done
wait

# Pull the finished PNGs down. Presigned result URLs expire, so this runs as part
# of the render rather than as a step someone has to remember.
for b in "$@"; do
  [ -s "$OUT/b$b.json" ] || { echo "b$b: no result (check b$b.err)"; continue; }
  u=$(python3 -c "import json;print(json.load(open('$OUT/b$b.json'))[0]['result_url'])" 2>/dev/null) || continue
  # --retry and -f: a silently truncated PNG is worse than a missing one, and
  # one arrived that way. Verified before it is allowed to count as a frame.
  if curl -fsS --retry 3 --retry-all-errors -o "$OUT/b$b.png" "$u" &&
     python3 -c "import sys;from PIL import Image;im=Image.open(sys.argv[1]);im.load()" "$OUT/b$b.png" 2>/dev/null; then
    echo "b$b.png $(du -h "$OUT/b$b.png" | cut -f1)"
  else
    rm -f "$OUT/b$b.png"; echo "b$b: download incomplete or corrupt — re-run this beat" >&2
  fi
done
echo "batch done"

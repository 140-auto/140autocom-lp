#!/bin/bash
# Rebuild render/<version>/prompts/b*.txt from their three parts.
# Usage: bash scripts/build-lp-prompts.sh <version>
#
# The style preamble must be BYTE-IDENTICAL in every scene prompt (scroll-world's
# cohesion rule) and the character block must be identical too, or Amin drifts.
# Assembling them here is what guarantees that; hand-editing eight files does not.
set -eu
V="${1:?usage: build-lp-prompts.sh <version>}"
P="$(cd "$(dirname "$0")/../render/$V/prompts" && pwd)"
# A `.pair` file is one beat rendered as TWO endpoint stills for a clip to
# interpolate between. The shared scene body is written once and the only
# difference between the two is a single position line, so the two frames CANNOT
# drift into different framings — which is what pins lp3's locked-off camera:
# the generator has nowhere to move the camera to. Format:
#
#     <shared scene description>
#     @@A@@ where the subject is at the start
#     @@B@@ where the subject is at the end
#
# expands to scenes/<beat>a.txt and scenes/<beat>b.txt.
for f in "$P"/scenes/*.pair; do
  [ -e "$f" ] || continue
  b="$(basename "$f" .pair)"
  body="$(grep -v '^@@[AB]@@' "$f")"
  # The `a` endpoint is rendered from text. The `b` endpoint is rendered
  # IMAGE-TO-IMAGE from the finished `a` frame, because two independent
  # text-to-image rolls of the same description do NOT reproduce the same scene
  # — tried it, and the two endpoints came back with different camera distances,
  # different buildings and a different row direction. Describing a locked
  # camera twice does not lock it; handing the model the actual first frame does.
  { printf '%s\n\n' "$body"; sed -n "s/^@@A@@ //p" "$f"; } > "$P/scenes/${b}a.txt"
  {
    printf '%s\n\n' "$body"
    sed -n "s/^@@B@@ //p" "$f"
  } > "$P/scenes/${b}b.txt"
  # The PORTRAIT chain has no clips (§1.7 builds no 9:16 video), so a closing
  # endpoint there is not one half of a pair — it is a frame in its own right.
  # Rendering it image-to-image from the LANDSCAPE opening would hand a 3:2
  # reference to a 9:16 recompose and drag the wide framing back in, which is
  # the one thing _portrait.txt exists to prevent. So port gets a text-to-image
  # twin, and render-scenes.sh prefers it in port mode.
  mkdir -p "$P/port"
  { printf '%s\n\n' "$body"; sed -n "s/^@@B@@ //p" "$f"; } > "$P/port/${b}b.body"
  echo "expanded $b.pair -> ${b}a.txt ${b}b.txt (+ port/${b}b)"
done

# port bodies get the same style + character preamble, never _match.txt
for s in "$P"/port/*.body; do
  [ -e "$s" ] || continue
  b="$(basename "$s" .body)"
  cat "$P/_style.txt" > "$P/port/$b.txt"
  printf '\n' >> "$P/port/$b.txt"
  cat "$P/_amin.txt" >> "$P/port/$b.txt"
  printf '\n' >> "$P/port/$b.txt"
  cat "$s" >> "$P/port/$b.txt"
  rm -f "$s"
done

for s in "$P"/scenes/*.txt; do
  b="$(basename "$s")"
  # A closing endpoint leads with _match.txt: it has to outweigh everything
  # else, so it goes FIRST, ahead of the style and character blocks.
  case "$b" in
    *b.txt) [ -f "$P/_match.txt" ] && { cat "$P/_match.txt" > "$P/$b"; printf '\n' >> "$P/$b"; cat "$P/_style.txt" >> "$P/$b"; } || cat "$P/_style.txt" > "$P/$b" ;;
    *) cat "$P/_style.txt" > "$P/$b" ;;
  esac
  printf '\n' >> "$P/$b"
  cat "$P/_amin.txt" >> "$P/$b"
  printf '\n' >> "$P/$b"
  cat "$s" >> "$P/$b"
  echo "built $b"
done

#!/bin/bash
# Rebuild render/amin/n-*.txt from _char.txt + views/*.txt.
#
# Same reason build-lp-prompts.sh exists for scenes: the character block must be
# BYTE-IDENTICAL in every view or Amin drifts between them, and the sheet is the
# reference every scene render is conditioned on — so drift here propagates into
# the whole film. Assembling guarantees it; hand-editing six files does not.
# THE BUMPER GRIN, and why _char.txt is shaped the way it is.
#
# §1.2 forbids "a painted or moulded grin on smooth bumper bodywork" — it is one
# of the three things breaking the Lightning McQueen resemblance. The generator
# draws it anyway: prompted with a cartoon car that smiles, it creases a smile
# into the blank bumper below the grille every time. Three escalating
# prohibitions in a row failed, including one in caps calling it the most
# important rule in the prompt. Negation does not work on this.
#
# What worked was removing the real estate. _char.txt's FRONT END GEOMETRY block
# states that the grille and the number plate together occupy the whole nose, so
# there is no smooth painted region left for a grin to live on. Same instinct as
# the rest of this pipeline: enforce by construction, not by asking.
#
# It is still not deterministic. Rolls of the identical prompt come back both
# correct and wrong, which is exactly why a sheet gets locked and every scene is
# then conditioned on it. Re-roll a view until the grille is a crescent and the
# bumper is blank; do not accept one that is nearly right.
set -eu
A="$(cd "$(dirname "$0")/../render/amin" && pwd)"
for v in "$A"/views/*.txt; do
  n="$(basename "$v" .txt)"
  cat "$A/_char.txt" > "$A/n-$n.txt"
  printf '\n' >> "$A/n-$n.txt"
  cat "$v" >> "$A/n-$n.txt"
  echo "built n-$n.txt"
done

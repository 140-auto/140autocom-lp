#!/bin/bash
# §7 acceptance run for one landing-page version. Needs `pnpm dev` up on :3000.
# Usage: bash scripts/accept-lp.sh <version>
#
# Four §7 gates are NOT checkable here and need eyes on the frames:
#   * the version's camera rule (lp3 requires one eyeline across every scene);
#   * Amin matching the locked character sheet, and no face on any other vehicle;
#   * faults-before-merits reading correctly in the inspection beat;
#   * cadence — whether the seams read as cuts or dissolves.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
V="${1:?usage: accept-lp.sh <version>}"
PORT="${PORT:-3000}"
URL="http://localhost:$PORT/$V"
# next-intl serialises the WHOLE ar.json catalogue into the RSC payload, so
# grepping the raw response finds every string in the file whether or not it was
# rendered — §7.2, §7.9 and §7.10 all reported green vacuously. Strip the script
# blocks first so the greps below measure the actual DOM.
HTML=$(curl -sS "$URL" | perl -0777 -pe 's{<script\b.*?</script>}{}gis')

say() { printf '%-42s %s\n' "$1" "$2"; }

say "§7.1  audio elements:"        "$(grep -c '<audio' <<<"$HTML")"
say "§7.2  CTA in server HTML:"    "$(grep -c 'شوف العربيات' <<<"$HTML")"
# §1.6's honesty beat is required in EVERY version but each states it in its own
# words, so the expected string is read from the catalogue rather than hardcoded
# — a hardcoded lp4 line silently passes 0/0 on any other version.
HONESTY=$(node -e 'console.log(require("./messages/ar.json").Common.honesty)')
say "§7.10 honesty beat present:"   "$(grep -cF "$HONESTY" <<<"$HTML") ($HONESTY)"

# §1.4 is a SUBSTITUTION rule: say قسّط, never موّل. Grepping for قسّط scores 0/0
# on copy that legitimately uses the noun القسط — vacuous. The rule that can
# actually fail is the presence of موّل, so that is what gets asserted.
say "§7.11 موّل absent (0=pass):"   "$(grep -o 'موّل' messages/ar.json | wc -l | tr -d ' ')"
say "§7.11 prohibited terms:"      "$(grep -oE 'مضمون|فوري|احجز دلوقتي' messages/ar.json | tr '\n' ' ')"

# §7.9 must prove REAL rows reached the page, not that a file exists — so it
# reads a model name out of the snapshot and greps the served HTML for it.
MODEL=$(node -e 'console.log(require("./lib/listings-snapshot.json")[0].model_name)')
say "§7.9  listings in server HTML:"  "$(grep -c "$MODEL" <<<"$HTML") x $MODEL"

# §1.1 forbids audio outright, so this checks the FILES have no audio stream —
# a `muted` attribute is a display setting, not the absence of a track.
say "§1.1  clip audio streams:"     "$(for f in public/lp/$V/clips/*.mp4; do ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$f"; done 2>/dev/null | wc -l | tr -d ' ')"
# §1.7: "Two render chains required. The portrait chain is not a port."
say "§1.7  landscape / portrait:"   "$(ls public/lp/$V/scenes/*.webp 2>/dev/null | wc -l | tr -d ' ') / $(ls public/lp/$V/scenes/port/*.webp 2>/dev/null | wc -l | tr -d ' ') scenes"
# Seven clips rather than lp4's two, so total weight is worth watching (§7's
# mid-range-Android-on-an-Egyptian-network gate).
say "§1.7  clip payload:"           "$(du -ch public/lp/$V/clips/*.mp4 2>/dev/null | tail -1 | cut -f1) across $(ls public/lp/$V/clips/*.mp4 2>/dev/null | wc -l | tr -d ' ') clips"
say "§7.14 prod app untouched:"    "$(git -C /Users/ezzat/140Auto/140autocom status --porcelain 2>/dev/null | wc -l | tr -d ' ') modified"

echo
python3 scripts/check-colour-law.py "$V"
python3 scripts/check-pairs.py "$V"
node scripts/check-logical-props.mjs
pnpm lint:copy
pnpm exec tsc --noEmit && echo "typecheck clean"

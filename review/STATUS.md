# lp4 — status after the rebuild

## What changed, against your four points

1. **The `247,860`** is now Amin's **number plate**, front and rear, in every beat.
   An odometer is an interior instrument and this film never goes inside the car,
   so it moved to the one exterior surface that already carries a number.
2. **Amin** rebuilt: windshield eyes, the grille *is* the mouth, "140 Auto" small
   on bonnet and both front doors. `lp-concepts.md` §1.2 amended from subtraction
   to substitution, with the IP reasoning recorded.
3. **The gate copy** now names the bank, and the scene was re-rendered from a
   desert toll booth into a formal checkpoint with a manned booth.
4. **"المكان فاضي. اركن." removed.** §5 gives that beat no copy; the shot now
   yields the empty bay instead of Amin occupying it.

## Assets

| | landscape | portrait (native 9:16) |
|---|---|---|
| scenes | 8 | 8 |
| clips | 2 (`order`, `gate`) | 0 — see below |

Locked character sheet: `render/amin/n-{front-3q,rear,rear-3q,profile-left}.png`.

## Verified, not assumed

- Zero `<audio>`; both clips have **no audio stream at all**, not merely muted.
- CTA in server HTML before any scene image, and visible at every scroll position.
- Honesty beat verbatim; موّل absent; no prohibited terms.
- Colour law: worst frame **1 saturated non-green pixel of 2.5M**.
  Amin's paint holds H≈160 / S≈88–91% across all 16 stills and both clips.
- `video.seekable.end(0) = 5.04` — the blob path works; `currentTime` tracks scroll.
- Phone viewport serves `/lp/scenes/port/*`, fetches no clip, no horizontal scroll.
- First poster 92KB landscape / 86KB portrait, both under §1.7's 100KB.
- Production app at `/Users/ezzat/140Auto/140autocom`: 0 modified files.

Run it yourself: `bash scripts/accept-lp4.sh` (needs `pnpm dev` up).

## Known gaps — stated rather than hidden

- **No portrait video.** Budget covered one video chain. Phones get the native
  9:16 *still* on the two filmed beats, never a cropped 16:9 clip.
- **`render/lp4/port/b6.png` drifted** — the arrival beat's portrait render came
  back with a rounded 2-door body and oversized door lettering instead of the
  locked hatchback. It ships; it is the weakest frame in the set and wants a
  re-roll (2 credits).
- **The seller fork** (§5 scene 3) is signposted but not branched; the engine
  chain is linear.
- **§7.12** — portrait chain on a mid-range Android on an Egyptian network is
  untested, and cannot be tested from here.
- **lp1–lp3** not started. Roughly 60–70 credits each for stills alone.

**13 credits remain.**

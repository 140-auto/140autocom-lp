# brand-assets

## logo/
| File | What it is |
|---|---|
| `140auto-lockup.svg` | Full lockup — green arrow mark + "140 Auto" wordmark in black |
| `140auto-mark.svg` | Mark alone — the green arrow-into-bar glyph |

Both are 375×375 viewBox with a white background rect. Per lp-concepts §1.2 these are
**composited as vectors in post, never generated into a render**.

## amin/

Prefix tells you how the file relates to the §1.2 revision spec.

### `near-spec-*` — closest to the revised character (use these as references)
Matte paint, wordmark-only branding, no numerals, neutral wheels, no rear wing on most.

| File | View |
|---|---|
| `near-spec-front-3q-wordmark-teal.jpeg` | front three-quarter, matte teal, silver wheels, no wing |
| `near-spec-low-angle-wordmark.jpeg` | low angle, wordmark only, no wing |
| `near-spec-front-3q-wordmark-angled.jpeg` | front three-quarter, steeper angle |
| `near-spec-rear-3q-wordmark-glossy.jpeg` | rear three-quarter — the only clean rear view |
| `near-spec-front-3q-xmark-livery.jpeg` | matte, but carries a large X-mark side livery |

### `offspec-*` — the current sports-coupe design
Rear wing, racing stripes, oversized `140` numerals, eyes in the windshield, glossy paint.
Every one of these contradicts §1.2. Kept for reference only.

### `sheet-*` — multi-view character sheets
`sheet-labelled-original-design.jpeg` and `sheet-labelled-side-rear-hero.jpeg` are the most
complete (hero, side, rear 3/4, top-down, wheel detail, expression).
`sheet-muscle-variant-action.jpeg` is a different body style entirely (muscle car, blue eyes).

### `reject-mcqueen-95-lightning.jpeg`
Carries race number **95** and a lightning bolt — Lightning McQueen's livery.
**Do not pass this to any generator.** See the IP note below.

### `duplicate-of-*`
Byte-identical to `near-spec-front-3q-xmark-livery.jpeg`. Kept rather than deleted; safe to remove.

### `video-*.mp4`
| File | Source | Format |
|---|---|---|
| `video-veo-portrait-a.mp4` | Veo (watermarked) | 720×1280, 8s |
| `video-veo-portrait-b.mp4` | Veo (watermarked) | 720×1280, 8s |
| `video-kling-portrait.mp4` | KlingAI 3.0 (watermarked) | 828×1108, 5s |

All three carry visible generator watermarks — reference only, not shippable.

## Compliance note

§1.2 says "The mascot design is being revised. Build to this spec, not to the existing
reference images." The existing design contradicts **every** row of that table:

| §1.2 requirement | Existing design |
|---|---|
| Everyday Egyptian sedan or hatchback | sports coupe |
| Rear wing: none | prominent rear wing |
| Livery: none, no numerals | racing stripes + large `140` numerals |
| Eyes at the headlights | eyes in the windshield |
| Matte, single flat green | glossy, multi-tone |
| Wordmark only, applied small | large multicolour hood badge |
| Odometer visible, high reading | no odometer anywhere |

**IP risk:** the silhouette, windshield eyes and smiling front bumper read as Lightning
McQueen (Pixar *Cars*), and `reject-mcqueen-95-lightning.jpeg` reproduces his race number and
bolt outright. Every §1.2 change — hatchback body, no wing, no livery, no numerals, eyes moved
to the headlights, matte paint — moves away from that resemblance. Worth stating plainly to
the board rather than discovering later.

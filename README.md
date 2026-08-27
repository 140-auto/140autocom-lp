# 140auto — landing page concepts

Board-review build. Four landing-page concepts were specified in
[`lp-concepts.md`](lp-concepts.md); **two are built** and live at their own
routes:

| Route | Version | Idea |
|---|---|---|
| `/lp3` | **احنا بنعمل ده كله** | A capability montage. Nine locked frames that only ever cut, each built in depth planes that travel at different rates against scroll. |
| `/lp4` | **من غير لف ودوران** | One unbroken chase-cam that never cuts and never stops moving. |

They are a deliberate pair — *cutting versus continuity* — and are meant to be
presented together. Versions 1 and 2 are concept-only and exist in the spec
alone.

`/` is a holding page. Every CTA in both films points there because in
production that is the browse page; this build has no browse page behind it, so
the route exists to stop those clicks landing on a 404.

## Running it

```bash
pnpm install
pnpm dev          # http://localhost:3000/lp3
```

Nothing else is needed. There is **no database and no S3 at runtime** — the
live-listing handoff reads a committed snapshot fixture
(`lib/listings-snapshot.json`) with local cover images, so no environment
variables are required to run or build this repo.

## Checks

```bash
pnpm build        # must pass; 9 routes prerender
pnpm lint:rtl     # no physical direction utilities — RTL is the default locale
pnpm lint:copy    # §1.4 prohibited terms, the honesty beat, beat weighting
bash scripts/accept-lp.sh lp3   # the full §7 acceptance run (needs pnpm dev up)
```

`accept-lp.sh` covers what a page scrape can see; four §7 items still need eyes
on the frames and are listed at the top of that script.

## What is and is not in this repo

**Tracked:** the app, the spec, the prompt sources under `render/**/prompts/`
(~560 KB of `.txt`, `.pair`, `.refs`, `.frames`), and the packed web assets
under `public/lp/` — the webp frames and mp4 clips that actually ship.

**Not tracked:** `render/**` output. That is ~420 MB of 2k PNGs, job JSON and
generator error logs — the *output* of the pipeline, not its source. The
prompts plus `scripts/` are what regenerate it:

```bash
bash scripts/build-lp-prompts.sh lp3          # assemble prompts from their parts
bash scripts/render-scenes.sh lp3 land 4a     # render a beat (3 concurrent max)
bash scripts/render-video.sh lp3 b4           # interpolate a clip between endpoints
python3 scripts/pack-scenes.py lp3            # PNG -> webp, enforce the colour law
python3 scripts/pack-clips.py lp3             # mp4 -> colour-corrected, silent
```

`scripts/snapshot-listings.mjs` is the one script that needs credentials; it
reads the **sibling production app's** `.env.local`, which lives outside this
tree and is never committed. It only needs running to refresh the fixture.

**Deliberately excluded:** `brand-assets/amin/reject-mcqueen-95-lightning.jpeg`.
§1.2 of the spec quarantines it as the one asset reproducing a race number and
lightning bolt outright, and passes it to no generator — so it is not committed
either.

## Reading the spec

`lp-concepts.md` is the governing document and the code is written against it by
section number. The rules that shape almost every file:

- **§1.1** Amin is a car and only does things a car can do.
- **§1.2** One character sheet. All logos and wordmarks composited in post.
- **§1.3** `#18CB96` is the only saturated colour in the rendered world; no
  legible text is ever generated into a frame (paper is the one exception, and
  it carries illegible cursive).
- **§1.5** The primary CTA is server HTML before any media, and is the only
  green interactive element on the page.
- **§1.6** ~70/20/10 buyer/seller/financing, carried by scroll distance.
- **§1.7** Two render chains at 16:9 and 9:16; the portrait chain is composed
  for the phone, never cropped from the wide frame. Silent throughout.

Amendments are dated in place, with the reason. Where a version deviates, the
deviation is recorded rather than hidden — see the known deviations in
`scripts/check-copy-gate.mjs`.

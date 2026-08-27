# 140auto.com — Landing Page Concepts: Build Specification

**Purpose:** build four separate landing page versions, one per concept, for board review.
Each version is a standalone page at its own route. All four share the requirements in §1.

**Status:** requirements. Version 1.0, 12 August 2026.

---

## 1. Shared requirements (all four versions)

### 1.1 The mascot: Amin

Working name, placeholder.

**What he is:** the 140auto mascot, an animated car. Within the world of the films, **Amin is
himself a used car.** He has been bought and sold before — he knows the transaction from the
inside, which is why he is trusted to guide it.

**Revised 25 August 2026 — the visible odometer is dropped.** Earlier versions of this section
required a high odometer reading rendered on Amin in every scene, and §7 carried a matching
acceptance line. Neither survives. The number was doing no work the character does not already
do: it was a small, easily-missed detail carrying a point the copy makes plainly, and it pushed
every frame toward a weariness that Version 3 in particular cannot afford. Amin's history stays
in the writing, not on his bodywork.

**Behavioural rule, required in every version:** Amin always gives the bad news before the good
news. Where he presents a car, he presents its faults first.

**Physical constraints.** Amin is a car and must only do things a car can do. He drives, parks,
positions himself, uses his headlights, keeps pace, leads, pulls aside. He does not enter buildings,
hold objects, walk, or gesture with anything other than movement and light.

**Inspection is performed with headlights.** Wherever a version calls for Amin to assess a car, he
drives a slow circle around it and his headlight sweep reveals the faults as on-screen annotations.
Do not stage inspections with people, clipboards or tools. **Version 3 carries a documented exception
to the second sentence — see §4.** The rule stands unchanged for Versions 1, 2 and 4.

**NO AUDIO.** Amin does not speak aloud anywhere on the landing page. There is no voiceover, no
dialogue track, no music, and no sound of any kind on any of the four versions. Every line
attributed to Amin appears as typeset on-screen copy, synced to scroll position. Voice is out of
scope for the website and will be produced separately for video and social.

### 1.2 Character design requirements

The mascot design is being revised. Build to this spec, not to the existing reference images.

**Revised 24 August 2026 — substitute, don't subtract.** The first pass of this table removed
every distinctive feature at once (windshield eyes, the smile, the livery, the numerals, the hood
badge, the coupe body, the gloss) and what was left rendered as a generic green hatchback with no
identity. The IP concern behind those removals is real — see the note at the end of this section —
but erasure was the wrong instrument. The resemblance is broken by *replacing* borrowed signifiers
with owned ones, not by deleting the character.

**Revised 25 August 2026 — sedan, stripes, and a cheerful face.** Four rows change. The body
becomes a sedan, a white stripe pair goes on, the expression brightens, and the odometer row
goes away with §1.1's requirement. The driver of the change is Version 3, which is an upbeat
capability spot and cannot be fronted by a weary car — but the change is global, not
per-version, because §1.2 permits exactly one character sheet.

| Attribute | Requirement |
|---|---|
| Body class | **Everyday Egyptian four-door sedan.** Three-box, modest boot, tall practical roofline, short overhangs, upright windows. Humble and familiar. Emphatically not a sports coupe. |
| Rear wing | None. |
| Livery | **One pair of thin flat-white stripes**, centred, running bonnet → roof → boot. Flat white, even width, no taper, no outline, no gradient. Nothing else: no numerals, no flag graphics, no side decals. |
| Eyes | **Large and expressive, inside the windshield.** Warm dark irises, **bright, alert and cheerful**. Headlamps are plain lamps and never faces. |
| Mouth | **The grille is the mouth** — a real recessed slatted grille whose outline curves into a closed-mouth smile. Never a painted or moulded grin on smooth bumper bodywork. The smile stays closed; the warmth comes from the eyes and the stance. |
| Paint | Matte, single flat `#18CB96` under the white stripe pair. Not metallic, not glossy, not pastel. |
| Wheels | One design across all scenes and all versions. Plain five-spoke steel. |
| Branding on the car | Wordmark only, applied small — bonnet and both front doors. No numerals. |

**Character sheet must be locked before any scene is rendered:** front, rear, both profiles, top,
three-quarter both sides, plus an expression set. One geometry, one paint, one stripe placement,
one wheel design, one eye colour.

**Version 4's rendered chain predates this revision** and shows the green hatchback with no
stripes. It is not being re-rendered now. The board sees the mismatch; the doc records that it is
scheduled, not intended. Versions 1 and 2 are concept-only and cost nothing.

**The render prompt bases in `render/amin/` are stale** and contradict this table on two counts
beyond the sedan change: they place the eyes *in the headlamps* rather than the windshield, and
they specify a "slightly weary" expression. `_base_sedan.txt` is the right starting point for
the new base, but the eyes, the expression and the stripes must all be corrected before anything
is generated.

**All logos and wordmarks are composited as vectors in post.** Never generated into a render — with
one carve-out: **Amin's own body wordmark is rendered in.** He turns through 3D space across every
scene of a version, so a vector composite would have to be re-anchored per frame and would drift.
Every other logo, including the mark on any surface that is not Amin, stays in post.

**Why this is far enough from Lightning McQueen.** The resemblance is a bundle of four things:
sports-coupe silhouette, windshield eyes, a painted grin on a smooth bumper, and large race
numerals. This spec breaks three of them independently — the body is an upright everyday sedan,
the mouth is real grille hardware, and there are no numerals anywhere on the car. The white
stripes reintroduce a livery, which the 24 August pass had removed; that removal was one break
too many and it is not needed. A stripe pair is the most generic marking a car can carry and is
nothing like a lightning bolt over a race number. Windshield eyes alone are not ownable by
anyone; the convention predates *Cars* by decades
(Thomas the Tank Engine, Herbie, Brum). The one asset in `brand-assets/amin/` that reproduces his
race number and bolt outright is quarantined and passed to no generator.

### 1.3 Visual system

- **Text in renders:** nothing legible is ever generated into a frame — no letters, no words, no
  numerals, no signage lettering, no logos. Every sign, board and panel renders blank and any real
  wording is composited in post (§1.2). **One exception, added 26 August 2026:** paper. Sheets,
  forms and documents render covered in dense illegible cursive scribble — looped pen strokes,
  ruled boxes, a signature-like flourish — which spells nothing in any alphabet. The reason is that
  a blank page does not read as a document, it reads as a rendering fault, and the film has a beat
  whose whole subject is paperwork. A blank sheet is now a defect, not the target.
- **Colour law:** `#18CB96` green is the only saturated colour in the rendered world. Everything
  else uses `#0F172A` navy, `#1F2933` dark gray, `#F4F6F8` paper, `#6B7280` medium gray. Amin is
  green. The signal is green. Nothing else is.
- Green surfaces carry navy text. Never white text on green.
- Green text, where it must be read, is `#0C7A5B`.
- Radius `0.5rem` everywhere. Hairline borders, no shadows on cards.
- Typography: IBM Plex Sans Arabic for Arabic and body. League Spartan for English headlines and all
  figures. Figures use `tabular-nums` and Western digits in both locales.
- All locations must be recognisably Egyptian.

### 1.4 Copy

- Arabic-first, Egyptian dialect. English is a translation.
- Use **قسّط**, never **موّل**.
- Prohibited in all copy: مضمون, فوري, احجز دلوقتي, countdowns, scarcity claims, any promise of
  approval.

### 1.5 CTA

1. Primary CTA **شوف العربيات** / *Browse cars* renders in the hero as server-side HTML, before any
   media loads. If the video never loads, the page still functions.
2. On first scroll it docks: bottom-centre on mobile, top-right on desktop. It remains visible for
   the entire scroll.
3. It is the only green interactive element on the page.
4. Secondary CTA **اعرض عربيتك، ببلاش** / *List your car, free* appears at the seller beat and on
   the end card only.

### 1.6 Required beats in every version

- **Audience weighting:** approximately 70% buyer content, 20% seller content, 10% financing.
- **The handoff:** one beat where the rendered world dissolves into real live listing cards pulled
  from the database. Required in all four.
- **The honesty beat:** *احنا بنجهّز ملفك للبنك. القرار قرارهم.* / *We prepare your file for the
  bank. The decision is theirs.* Required in all four, at or near the peak of the film.
- **The third road:** financing is shown as a route 140auto travels on the visitor's behalf. The
  visitor is never asked to engage with a financing institution on this page.

### 1.7 Technical

- Built with **scroll-world** (github.com/oso95/scroll-world) as a client island inside the existing
  Next.js app.
- **Two render chains required: 16:9 and 9:16.** The portrait chain is not a port; build it in
  parallel.
- Silent. No audio element on the page.
- `prefers-reduced-motion`: a designed static narrative covering the same beats, not a blank page.
- Hero HTML and CTA interactive before any media request. First poster frame under 100KB. Video
  chain lazy-loaded per scene, never as a single file. If the first scene has not loaded within
  budget, fall back permanently to the reduced-motion narrative.
- Camera direction and Amin's travel direction are fixed and identical in both locales. Do not
  mirror the flight for RTL.
- Each version deploys to its own route. Do not modify the existing `/` browse page.

---

## 2. Version 1 — الملتقى / The Junction

**Target:** two roads you did not know were connected turn out to meet, and the meeting point is the
logo.

**Structure:** buyer road and seller road run in parallel and converge.

**Required reveal:** Amin appears on the buyer road and on the seller road. The viewer should read
them as two separate cars until the junction, where it resolves that it was the same car doing both
jobs.

### Scenes

| # | On screen | On-screen copy (AR) | (EN) |
|---|---|---|---|
| 0 | Hero. The junction seen from above, third road under fog. CTA renders here. | الملتقى | The junction |
| 1 | **Buyer road.** A man walking home at night past a row of parked cars he cannot afford. Amin drives alongside him at walking pace, keeping level, not overtaking. | مش هنسألك عايز عربية إيه. هنسألك تقدر تدفع كام في الشهر. | We won't ask which car you want. We'll ask what you can pay monthly. |
| 2 | **Seller road.** A car under a dust cover outside a building. A للبيع sign with a phone number. Amin parks opposite, headlights on the sign. Nobody calls. | العربية معروضة من شهور. التليفون مرنش. | Listed for months. The phone never rang. |
| 3 | Camera rises. Both roads point at the same place. **HANDOFF: the junction surface becomes the live listing grid.** | الاتنين محتاجين بعض ومش عارفين. | Both need each other and neither knows it. |
| 4 | **Inspection.** Amin drives a slow circle around a car. His headlight sweep reveals faults as annotations. Faults appear before the good points. | نضيفة. بس عدادها عالي، وده بيبان في السعر. | Clean. But the mileage is high, and that shows in the price. |
| 5 | **Third road.** Amin drives alone into the fogged road. Institutions are never shown. | الطريق ده علينا. بس القرار مش بإيدنا. | This road is ours. The decision is not. |
| 6 | The three roads meet. The mark forms out of the road geometry. Two cars leave together. | — | — |
| 7 | End card. Both CTAs. Trust statement. | — | — |

**Rendered scenes: 7.** Isometric dioramas, tilt-shift. The two roads must be distinguishable at a
glance without labels.

---

## 3. Version 2 — العربية اللي استنّت / The Waiting Car

**Target:** a car has been sitting unsold for months, a man across town cannot buy one, and they
would never have found each other.

**Structure:** two entrances, one junction. Cross-cut two stories.

**Required recurring element:** the price sticker on the waiting car's windscreen is the only white
object in frame, and the number on it is oversized. The turn of the film is the moment that number
divides.

### Scenes

| # | On screen | On-screen copy (AR) | (EN) |
|---|---|---|---|
| 0 | Hero. Amin parked at night beside one other car in an empty lot. Two used cars, one already sold once. CTA renders here. | في عربية مستنية، وفي حد مستني. | A car is waiting. So is someone else. |
| 1 | **The car.** A dusty lot on a desert road. One continuous move, light cycling morning to evening. People arrive, read the sticker, leave. The owner lowers the price twice. Nothing. | المشكلة مش في العربية. | The problem isn't the car. |
| 2 | **The man.** Across the city. Salary in, salary out. He can pay every month. He cannot pay once. | يقدر يدفع كل شهر. مش يقدر يدفع مرة واحدة. | He can pay every month. He can't pay once. |
| 3 | **The number divides.** The figure on the windscreen splits into a small figure, repeated. **HANDOFF: the lot fills with real listing cards, each carrying a real monthly figure.** | خُد الرقم الكبير، اقسمه. | Take the big number. Divide it. |
| 4 | **Inspection.** Amin circles the waiting car, headlight sweep, faults annotated first. The line is his own — he has been sold before (§1.1) — and it is written, never rendered on his body. | أنا عارف إحساس اللي عداده عالي. | I know what a high odometer feels like. |
| 5 | **Third road.** The file goes out. No resolution shown yet. | بنجهّز ملفك للبنك. القرار قرارهم. | We prepare your file. The decision is theirs. |
| 6 | Headlights sweep the lot. The gate opens. Someone has come. | — | — |
| 7 | The drive out, the arrival, a doorway, keys. Amin stays at the kerb and does not follow. | — | — |
| 8 | End card. Both CTAs. Trust statement. | — | — |

**Rendered scenes: 7.** Cinematic three-quarter and low angles, not isometric. Cold in the middle,
warm at both ends. The lot must read as a real Egyptian معرض on a ring road.

---

## 4. Version 3 — احنا بنعمل ده كله / Everything We Do

**Target:** an upbeat sixty-second spot in scroll form. Not a story — a list. The visitor reaches
the end able to name what 140auto does, in order, without having followed anyone's story.

**Structure:** rapid-fire capability montage. One capability per beat, one locked frame per beat,
a hard cut between, a green tick on every one. The cadence is the design.

**Origin of the voice.** This version is written from what the accounts are already saying.
Instagram and Facebook both refuse scraping, so ~35 posts and reels from `@140auto` and
`facebook.com/140autoo` (Feb–Aug 2026) were read through the search index. The register is
consistent and it is not narrative: «اختار عربيتك وسيب الباقي علينا» · «مهما كانت الحالة والمقدم
والتمويل احنا هنخلص لك كل حاجة في أسرع وقت» · «بنخلص كل حاجة وانت قاعد في بيتك وبنسلمك المفتاح» ·
«شغلتنا نطمنك، نجاوب على أسئلتك قبل ما تسألها» · «السعر العادل للي بيبيع وللي بيشتري». The copy
system follows their caption grammar exactly: **first-person-plural, verb first** — بندوّر،
بنفحص، بنقارن، بنجهّز، بنبيع، بنوصّل.

**Required headline.** «هتشتري عربيتك اونلاين مع 140 Auto» is proven copy — it has already
converted real clients — and it leads the page. It is the hero headline and it returns as the
end-card tagline, bookending the spot. Set the brand as the wordmark **140 Auto**, not «١٤٠ اوتو»,
so it reads identically to every other surface (§1.2). The spoken and social form is unaffected.

**Not carried over from social:** the sign-off «مستني إيه؟ يلا كلم دلوقتي». §1.4 prohibits
احجز دلوقتي and urgency devices, and the page carries no phone CTA for it to serve.

**Required camera rule — this version's signature. Revised 26 August 2026.** The rule used to be
"the camera never moves. Not a pan, not a push, not a rise, in any beat." It is replaced, because
in practice it produced a slideshow: seven of nine beats were a single flat image that did not
change at all while the visitor scrolled past it, and the accumulating tick column was the only
thing on screen with any life in it. A rule whose faithful execution is boring is the wrong rule.

What survives is the FRAMING discipline, which was always the valuable half: every beat is
composed square-on, frontal, symmetrical, product-lit, at one eyeline height, so the cuts snap.
The camera still never pans, never rises and never chases.

What changes is that the world is now built in DEPTH PLANES that travel at different rates against
scroll — far sky and skyline slowest, the subject in the middle, near ground fastest, atmosphere
faster still. The effect is parallax, not a camera move: the framing at the end of a beat is the
framing at the start. Amplitudes are small. This is depth, not a swoop.

> The pairing with Version 4 stands but its axis moves. It was *static versus moving*, which no
> longer distinguishes them. It is now **continuity versus cutting: Version 4 is one unbroken
> camera that never cuts; Version 3 is nine locked frames that only ever cut.** Present them to
> the board as the pair they are.

**Required accumulation:** each capability, once performed, drops a green tick into a fixed column
at the frame edge. The column is the only thing that carries across cuts, and it completes — every
beat earns its tick, the financing beat included, where the tick is for the work we do and the
copy says plainly what is not ours to promise.

**Carve-out from §1.1 — Version 3 stages its inspection with a person.** §1.1 bans people,
clipboards and tools from an inspection, and that ban holds everywhere else. It does not hold here,
and the reason is that Version 3 is not telling a story about Amin — it is listing what the company
does. «بنفحص» is a claim about a service a real engineer performs, it is the claim that most needs
to be believed, and the accounts this version's voice was taken from show that engineer in almost
every inspection reel. Staged with headlights alone the beat rendered as two cars nose to nose in a
car park and read as nothing at all.

The exception is narrow and does not travel:

- **One person, in this beat only.** No other scene in Version 3 contains a human figure, and no
  other version contains one anywhere.
- **He is a technician, not a character.** Calm, unhurried, doing his job. He never speaks, never
  points, never reacts, and is never alarmed — §4's tone rule governs him as it governs the frame.
- **Amin still performs the inspection.** He drives his slow circle and his headlight sweep still
  carries the annotations. The engineer is present at the work, not a substitute for it, and §1.1's
  faults-before-merits rule is untouched.
- **The colour law reaches him.** Plain dark navy overalls, no branding, no lettering, no
  high-visibility colour (§1.3).

**Required tone rule:** every frame is daylight, early morning at the hero through golden hour at
the close. No night, no dust, no rain, no clutter, no broken thing, no roadside chaos. Where a
beat must surface a problem — the inspection — it is staged as a service performed brightly, never
as a warning. The cautionary register belongs to Versions 2 and 4.

### Scenes

| # | On screen | On-screen copy (AR) | (EN) |
|---|---|---|---|
| 0 | Hero. Locked frontal. Amin parked square to camera on clean tarmac, early morning, nothing else in frame. CTA renders here. Kicker: احنا بنعمل ده كله. | هتشتري عربيتك اونلاين مع 140 Auto. | You'll buy your car online with 140 Auto. |
| 1 | **بندوّرلك.** A bright strip of معارض, head-on. Amin travels the strip; the cars he passes stay neutral; one PLINTH lights green as he draws level and stops — the light is on the plinth and the ground, never on the car, which stays grey like the rest. Tick 1. | قوللنا مواصفات العربية اللي عاوزها، واحنا اللي نلف عليها. | Tell us the spec you want and we'll do the looking. |
| 2 | **بنفحص.** A clean car square to camera in an enclosed lit service bay, on an inspection platform. One inspection engineer stands at its front wing with a tablet (carve-out above). Amin drives one slow circle; the headlight sweep annotates and the bonnet comes open. Faults appear first, merits after (§1.1), delivered as confident service rather than caution. Tick 2. | بنقولك العيب الأول، والميزة بعديه. | We tell you the fault first, then the merit. |
| 3 | **The screen.** Amin rolls into an open plaza and parks facing one enormous blank outdoor display, seen from directly behind him so the visitor is looking over him at it. No copy, no tick. | — | — |
| 4 | **HANDOFF (§1.6): the display fills with the live listing grid**, and Amin sits below it studying the stock. No copy, no tick. | — | — |
| 5 | **بنجهّز الورق.** The third road. Amin parked square to camera on clean open tarmac, nothing else in frame; beside him a neat tower of paper builds from a few sheets to roof height across the beat. Every sheet is covered in illegible cursive (§1.3), so it plainly reads as filed work. Tick 5 lands on بنجهّز, not on approval. | احنا بنجهّز ملفك للبنك. القرار قرارهم. | We prepare your file for the bank. The decision is theirs. |
| 6 | **بنشوفلك أحسن قسط.** The strip returns, seen from behind Amin as he travels it, every car now carrying its monthly figure on the panel above it — composited, never generated (§1.3). Tick 6. | بنحاول نجيبلك أحسن مقدم وقسط يناسبك. | We try to get you the best down payment and instalment for you. |
| 7 | **بنبيع عربيتك.** Seller beat — the secondary CTA appears here (§1.5). A clean car in a driveway with a للبيع sign, head-on, midday. The word is composited onto the blank card the render leaves in the windscreen. Amin arrives; the sign comes down. Tick 7. | عربيتك القديمة شغلنا كمان. | Your old car is our job too. |
| 8 | **بنوصّلها لحد عندك.** A residential door, head-on, golden hour. Amin leads a car in and pulls aside short of the door, yielding the frame to it. Tick 8. | بنوصّلها لحد عندك، وانت في مكانك. | We bring it to your door, without you leaving your seat. |
| 9 | End card, over a closing render — a full, warm, late-afternoon avenue lined with cars, Amin parked square to camera in the middle of it. The completed tick column. Both CTAs and the trust statement, and the headline returns above the tagline. | هتشتري عربيتك اونلاين مع 140 Auto. / اختار عربيتك، وسيب الباقي علينا. | You'll buy your car online with 140 Auto. / Pick your car, leave the rest to us. |

**The instalment beat follows the paperwork beat, revised 26 August 2026.** It
used to sit before the handoff and was titled «بنقارن بالقسط» — compare by
instalment. Both were wrong. What a buyer can pay per month is settled by their
file and by the bank's answer to it, not by the car they happen to be looking
at, so a claim about getting them a good instalment placed before the file
exists is a claim about the wrong thing. It moves after «بنجهّز الورق» and
becomes an attempt rather than a comparison. It stays classed as BUYER content
for §1.6's weighting: searching by instalment is a buying tool, not the
financing route the third road means.

**The handoff is staged across two beats, not one, and it is diegetic.** Presented as cards laid
straight over the scene it was indistinguishable from the real browse page and visitors tried to
click it. It is not clickable, so it must not invite the attempt: it is shown on a screen that
exists inside the world, with Amin parked in front of it choosing from it. That also gives the
version its only wide establishing move — everything else is a locked frontal.

**The end card is a rendered frame, not a field of paper.** It is the last thing seen and the most
remembered, and a paragraph floating in a screen-height empty section is the weakest frame in the
film. It carries the closing render full-bleed with the paper feathered in from the reading side.

**Rendered scenes: 9** — six capability beats, the screen the handoff plays on, the hero, and the
closing frame. Each ships as a still and as a scroll-scrubbed clip; the clip carries the subject
motion the depth planes cannot. Locked-off frontal poster frames, product-lit, symmetrical, bright
throughout. Not isometric (Version 1), not cinematic three-quarter (Version 2), not chase-cam
(Version 4).

**Audience weighting (§1.6) is carried by scroll distance, not scene count.** Scene count alone
reads 56/11/11, so the beat table must be authored with scroll weights that land on 70/20/10 —
which, with the handoff split across two beats, means the seller and financing beats are NOT the
shortest ones. The seller beat is the longest in the film. `check-copy-gate.mjs` asserts the split
and the current table lands 71/19/10.

---

## 5. Version 4 — من غير لف ودوران / One Long Test Drive

**Target:** one unbroken drive where the road cleans itself up around you.

**Structure:** forking scroll. A single continuous drive with a mid-film exit ramp for sellers.
Both branches rejoin at the end.

**Camera resolved (24 August 2026):** this section previously specified both a "first-person
drive" and a "chase-cam", which are different cameras. It is a **chase-cam** — Amin is the guide
and must be on screen to guide, which a first-person camera cannot do. The consequence is that
copy must never address the visitor as the one driving.

**Required:** the camera never cuts and never leaves the road. The world reorganises around the road
rather than the camera moving between worlds. The chaos-to-order transition must be gradual enough
that no single frame can be identified as the change.

**Required shot:** Amin passes a group of سماسرة waving at roadside traffic without slowing and
without any accompanying copy.

### Scenes

| # | On screen | On-screen copy (AR) | (EN) |
|---|---|---|---|
| 0 | Hero. Behind Amin in stopped traffic, brake lights. CTA renders here. | الطريق لعربيتك، من غير لف ودوران. | The road to your car, without the runaround. |
| 1 | **Gridlock.** Handwritten للبيع signs, brokers at the roadside, nothing comparable to anything. Amin passes the brokers without slowing. | كله بيقولك اشتري. محدش بيقولك تقدر على إيه. | Everyone tells you to buy. Nobody tells you what you can afford. |
| 2 | **The road orders itself.** Roadside chaos resolves into clean lit gantries, each carrying a car and a monthly figure. **HANDOFF: the gantries become real listing cards.** | ابحث بالمقدم والقسط. | Search by down payment and installment. |
| 3 | **The fork.** An exit ramp signed for sellers. Amin indicates it and continues. Taking it opens the seller branch; staying on continues the buyer road. | عندك عربية تبيعها؟ المخرج ده ليك. | Selling a car? This exit is yours. |
| 4 | **Inspection bay.** A lit bay at the roadside. Nothing joins the road without passing through it. Amin headlight-sweeps a car, faults first. | محدش بيدخل الطريق من غير ما يعدّي من هنا. | Nothing joins this road without coming through here. |
| 5 | **The gate.** An institutional checkpoint — formal masonry, a manned booth, a barrier that visibly belongs to somebody. It is the bank's gate, not 140auto's. The file was lodged before arrival. It lifts. | ملفك وصل البنك قبلك. البوابة دي بتاعتهم، مش بتاعتنا. | Your file reached the bank before you did. This gate is theirs, not ours. |
| 6 | The road rises, the city opens at golden hour, then an exit ramp into a neighbourhood and a parking space. Amin pulls up **short of** an empty marked bay, angled aside, yielding it to the camera. | — | — |
| 7 | End card. Both CTAs. Trust statement. | — | — |

**Rendered scenes: 6, plus a 2-scene seller branch.** Chase-cam, road level, shallow focus. Not
isometric.

---

## 6. Deliverables per version

1. Locked character sheet applied consistently across every scene (§1.2).
2. Rendered scene chain, 16:9 and 9:16.
3. Scroll-scrubbed page at its own route, silent, with docked CTA (§1.5).
4. Live listing handoff wired to real data (§1.6).
5. Reduced-motion static narrative covering the same beats.
6. Arabic and English builds.

## 7. Acceptance checklist

- [ ] No audio element anywhere on the page.
- [ ] Primary CTA visible and clickable before any media loads.
- [ ] Primary CTA visible at every scroll position after the hero.
- [ ] No saturated colour other than `#18CB96` in any rendered frame.
- [ ] No white text on green anywhere.
- [ ] Amin performs no action a car cannot perform.
- [ ] Amin's body matches the locked character sheet in every scene: sedan, white stripe pair,
      windshield eyes, closed grille smile.
- [ ] All faults presented before merits in every inspection beat.
- [ ] Handoff beat renders real listings from the database.
- [ ] Honesty beat present and unmodified.
- [ ] No prohibited copy terms (§1.4).
- [ ] Portrait chain tested on a mid-range Android on an Egyptian mobile network.
- [ ] Reduced-motion narrative reaches the same end card.
- [ ] Existing `/` browse page unmodified.
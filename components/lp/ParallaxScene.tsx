"use client";

import { SceneMedia } from "@/components/lp/SceneMedia";
import { useCoverRect } from "@/lib/use-cover-rect";
import { usePortrait, useReducedMotion } from "@/lib/use-orientation";

/**
 * §4's depth planes, revised 26 August 2026.
 *
 * The old camera rule ("never a pan, not a push, not a rise") was executed
 * faithfully and produced a slideshow: seven of nine beats were one flat image
 * that did not change at all while the visitor scrolled past it. The framing
 * discipline survives — every beat is still square-on, level, at one eyeline,
 * and the framing at the end of a beat is the framing at the start. What is new
 * is that the world is built in PLANES that travel at different rates, so the
 * ground slides against the skyline and the frame reads as having depth.
 *
 * This is parallax, not a camera move. Amplitudes are a few percent of the
 * viewport. If it reads as a swoop it is turned up too far.
 */

/** Plane rates, as multiples of the beat's `amp`. Far moves least, air most. */
const FAR = 0.35;
const MID = 1;
const NEAR = 1.9;
const AIR = 2.8;

/** Half-width of the feather across the horizon seam, in fractions of height. */
const FEATHER = 0.07;

const DEFAULTS = { horizon: 0.58, amp: 0.045 };

/** The picture itself, for placing composited labels in the render's own space. */
const FULL_FRAME = { x: 0, y: 0, w: 1, h: 1 };

export function ParallaxScene({
	progress,
	still,
	stillPortrait,
	clip,
	parallax,
	alt = "",
	overlay,
}: {
	/** Eased 0..1 position within this beat. */
	progress: number;
	still: string;
	stillPortrait?: string;
	clip?: string;
	parallax?: { horizon: number; amp: number };
	alt?: string;
	/**
	 * Type and marks composited onto the frame — the instalment figures, the
	 * للبيع sign, the inspection annotations. Carried on the MIDDLE plane with
	 * the same transform as the base plate, so a label pointing at something in
	 * the scene keeps pointing at it while the planes travel.
	 */
	overlay?: import("react").ReactNode;
}) {
	const { horizon, amp } = parallax ?? DEFAULTS;

	const reduce = useReducedMotion();
	// Same test SceneMedia uses to decide whether a clip is in play at all.
	// Three video elements per beat is far too much for a phone, so the depth
	// split is the STILL path's treatment; a clip beat gets whole-frame parallax
	// and relies on its own subject motion for life.
	const portrait = usePortrait();
	const playing = Boolean(clip) && !reduce && !portrait;

	// Zero at the beat's midpoint so a beat arrives and leaves symmetrically
	// rather than drifting steadily in one direction across the whole film.
	const p = reduce ? 0 : progress - 0.5;
	const shift = (rate: number) => `translate3d(0, ${(-p * amp * rate * 100).toFixed(3)}vh, 0)`;

	// Enough scale to cover the furthest a plane travels, and not a pixel more.
	// `p` runs +/- 0.5, so the fastest scene plane moves `amp * NEAR * 0.5` of
	// the viewport each way; growing the image by that much at top and bottom
	// hides the edge. The first version of this line over-scaled by a factor of
	// two and a half and quietly cropped a quarter off every frame — Amin came
	// out filling half the picture on beats composed to hold him at mid
	// distance.
	const bleed = 1 + amp * NEAR;

	// The whole frame, in viewport pixels. Three possible aspects reach the
	// screen and they are all different: the landscape stills pack at 3:2, the
	// portrait chain at 9:16, and the clips come back from the generator at
	// 16:9. Using the still's number while a clip was playing put every
	// composited label a few percent out — which is a lot when the label is
	// meant to sit on a specific panel.
	const imageBox = useCoverRect(
		playing ? 16 / 9 : portrait ? 1080 / 1935 : 1920 / 1288,
		FULL_FRAME,
	);

	const band = (from: "far" | "near") =>
		from === "far"
			? `linear-gradient(to bottom, #000 0%, #000 ${((horizon - FEATHER) * 100).toFixed(1)}%, transparent ${((horizon + FEATHER) * 100).toFixed(1)}%)`
			: `linear-gradient(to bottom, transparent ${((horizon - FEATHER) * 100).toFixed(1)}%, #000 ${((horizon + FEATHER) * 100).toFixed(1)}%, #000 100%)`;

	const plate = (mask: string | undefined, rate: number, key: string) => (
		<picture key={key}>
			{stillPortrait ? <source media="(orientation: portrait)" srcSet={stillPortrait} /> : null}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={still}
				alt={mask ? "" : alt}
				aria-hidden={mask ? true : undefined}
				decoding="async"
				className="absolute inset-0 h-full w-full object-cover will-change-transform"
				style={{
					transform: `${shift(rate)} scale(${bleed})`,
					WebkitMaskImage: mask,
					maskImage: mask,
				}}
			/>
		</picture>
	);

	return (
		<div className="absolute inset-0 overflow-hidden bg-(--color-bg)">
			{playing ? (
				// One plane. SceneMedia owns the blob loading, the seek coalescing
				// and the iOS priming; wrapping it is all that is wanted here.
				<div className="absolute inset-0 will-change-transform" style={{ transform: `${shift(MID)} scale(${bleed})` }}>
					<SceneMedia progress={progress} still={still} stillPortrait={stillPortrait} clip={clip} alt={alt} push={0} />
				</div>
			) : (
				<>
					{/* Base at the middle rate, so a gap can never open at the seam
					    even if the two masked plates drift apart. */}
					{plate(undefined, MID, "base")}
					{plate(band("far"), FAR, "far")}
					{plate(band("near"), NEAR, "near")}
				</>
			)}

			{overlay && imageBox ? (
				// Positioned to where object-cover actually put the picture, so a
				// percentage in a label is a percentage OF THE RENDER — the same
				// number that was measured off the file. Inside the container it
				// meant something different at every viewport aspect.
				<div
					className="absolute will-change-transform"
					style={{
						left: imageBox.left,
						top: imageBox.top,
						width: imageBox.width,
						height: imageBox.height,
						transform: shift(MID),
					}}
				>
					{overlay}
				</div>
			) : null}

			{/* A near-ground plane, travelling faster than the picture behind it.
			    On a STILL beat the masked plates above already separate ground from
			    skyline; on a CLIP beat they cannot — a second and third video
			    element per beat is far more than a phone will carry — so the depth
			    cue down here has to be drawn rather than photographed. It is a
			    ground-hugging wash of the paper token, which is what the far end of
			    a bright Cairo street actually looks like. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 will-change-transform"
				style={{
					transform: shift(NEAR),
					background: `linear-gradient(to top, color-mix(in srgb, var(--color-bg) 34%, transparent) 0%, color-mix(in srgb, var(--color-bg) 10%, transparent) ${((1 - horizon) * 55).toFixed(0)}%, transparent ${((1 - horizon) * 100).toFixed(0)}%)`,
				}}
			/>

			{/* Atmosphere: the fastest of the scene planes and the only one that is
			    not a photograph. A pale bloom sitting on the horizon and a soft
			    vignette — §1.3's paper token, so it warms the frame without
			    introducing a colour. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 will-change-transform"
				style={{
					transform: shift(AIR),
					// Kept deliberately faint. At the strength this first shipped
					// with it read as fog rather than as air and washed the
					// buildings out of every frame — §4's tone rule wants bright and
					// clean, and a veil is neither.
					background: `radial-gradient(100% 45% at 50% ${(horizon * 100).toFixed(0)}%, color-mix(in srgb, var(--color-bg) 20%, transparent) 0%, transparent 70%),
						radial-gradient(115% 85% at 50% 48%, transparent 62%, color-mix(in srgb, var(--color-text) 7%, transparent) 100%)`,
				}}
			/>
		</div>
	);
}

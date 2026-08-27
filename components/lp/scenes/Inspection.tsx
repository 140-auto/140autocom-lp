"use client";

import { usePortrait } from "@/lib/use-orientation";

/**
 * The §1.1 inspection overlay: Amin circles a car and his HEADLIGHT SWEEP
 * reveals faults as on-screen annotations. The bay, the cars and the light are
 * a rendered scene underneath; this draws only the annotations, which have to
 * be typeset and exact.
 *
 * §1.2's behavioural rule and §7's checklist both require faults before merits.
 * That is enforced structurally: the sweep owns the first 65% of the beat and
 * merits cannot begin until it completes, so a caller cannot reorder them into
 * the wrong sequence by editing a list.
 */

const PAPER = "#F4F6F8";
const INK = "#0F172A";
const GREEN = "#18CB96";

export type Annotation = {
	/** Position in percent of the LANDSCAPE frame. */
	at: [number, number];
	/**
	 * Position in percent of the PORTRAIT frame. §1.7 builds the 9:16 chain as
	 * its own composition rather than a crop, so the wing an annotation points
	 * at is somewhere else entirely — without this the notes floated in the sky
	 * on a phone. Falls back to `at` when a caller has not measured it.
	 */
	atPortrait?: [number, number];
	text: string;
};

const SWEEP_END = 0.65;

export function InspectionNotes({
	progress,
	faults,
	merits = [],
}: {
	progress: number;
	faults: Annotation[];
	merits?: Annotation[];
}) {
	const sweep = Math.min(1, progress / SWEEP_END);
	const meritT = Math.max(0, (progress - SWEEP_END) / (1 - SWEEP_END));

	const reveal = (list: Annotation[], t: number, i: number) => {
		const step = 1 / Math.max(1, list.length);
		return Math.max(0, Math.min(1, (t - i * step) / step));
	};

	return (
		<div className="pointer-events-none absolute inset-0">
			{faults.map((f, i) => (
				<Note key={f.text} note={f} opacity={reveal(faults, sweep, i)} tone="fault" />
			))}
			{merits.map((m, i) => (
				<Note key={m.text} note={m} opacity={reveal(merits, meritT, i)} tone="merit" />
			))}
		</div>
	);
}

function Note({
	note,
	opacity,
	tone,
}: {
	note: Annotation;
	opacity: number;
	tone: "fault" | "merit";
}) {
	const portrait = usePortrait();
	if (opacity <= 0.01) return null;
	const [x, y] = (portrait && note.atPortrait) || note.at;
	// Green marks the merit rather than colouring its text — green is a signal,
	// never body ink (§1.3).
	const marker = tone === "merit" ? GREEN : INK;

	return (
		<div
			className="absolute flex flex-col items-center"
			style={{
				// Physical `left`: annotations point at the rendered car, and §1.7
				// forbids mirroring the scene for RTL.
				left: `${x}%`,
				top: `${y}%`,
				transform: "translate(-50%, -100%)",
				opacity,
				transition: "opacity 140ms linear",
			}}
		>
			{/* A paper chip, not bare paper-coloured ink. The original was white
			    text with a dark glow behind it, which works over lp4's dusk bay
			    and vanishes over lp3's: §4 requires every frame to be bright
			    daylight, so the annotations sit on the palest ground in the film
			    and need their own. §1.3's navy-on-paper, hairline, no shadow. */}
			<span
				className="whitespace-nowrap rounded-(--radius) border px-2 py-1 text-[clamp(0.85rem,1.4vw,1.05rem)] font-semibold"
				style={{ color: INK, background: PAPER, borderColor: "rgba(15,23,42,0.12)" }}
			>
				{note.text}
			</span>
			<span className="mt-1 block h-8 w-px" style={{ background: marker, opacity: 0.8 }} />
			<span className="block h-2 w-2 rounded-full" style={{ background: marker }} />
		</div>
	);
}

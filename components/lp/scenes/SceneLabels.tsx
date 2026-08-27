"use client";

import { monthly } from "@/components/lp/ListingHandoff";
import { usePortrait } from "@/lib/use-orientation";
import snapshot from "@/lib/listings-snapshot.json";

/**
 * Type composited onto surfaces the render deliberately left blank.
 *
 * §1.3 keeps legible text out of every generated frame — the model cannot spell
 * Arabic and a hallucinated word on a sign is worse than no word at all — so
 * signs and panels render empty and the wording is laid over them here. That is
 * the same rule §1.2 applies to logos.
 *
 * Positions are percentages of the frame so they track it at any size. They are
 * approximate by nature: scenes are drawn with `object-cover`, so how much of
 * the frame is cropped moves with the viewport. Both labels sit well inside the
 * safe middle of their frame for that reason.
 */

/**
 * The instalment beat. §4 always asked for "every car now carrying a monthly
 * figure" and the render could never deliver it, so the gantry panels above the
 * row have been blank since the first pass — which is most of why the beat read
 * as empty.
 *
 * The figures are real: the same `monthly()` arithmetic the handoff grid uses,
 * on real snapshot prices. §1.4 forbids promising anything, so this is a
 * division of an asking price and never an offer, a rate or an approval — and
 * no down-payment figure appears, because inventing one would be inventing a
 * policy.
 */
// Measured against the CLIP's framing, not the still's. Desktop always plays
// the clip on this beat, and kling returns 16:9 where the still packs at 3:2,
// so the two are not the same picture.
const PANELS: [number, number][] = [
	[17, 22],
	[53, 25],
	[76, 27],
];
/** The 9:16 render composes the row closer and shorter, not cropped (§1.7). */
const PANELS_PORTRAIT: [number, number][] = [
	[26, 40],
	[54, 42],
	[78, 44],
];

export function PriceTags({ progress }: { progress: number }) {
	const panels = usePortrait() ? PANELS_PORTRAIT : PANELS;
	const rows = snapshot.slice(0, panels.length);
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden>
			{rows.map((l, i) => {
				const [x, y] = panels[i];
				// staggered, so the row reads left to right rather than all at once
				const t = Math.max(0, Math.min(1, (progress - i * 0.12) / 0.3));
				if (t <= 0.01) return null;
				return (
					<div
						key={l.id}
						className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-(--radius) border border-(--color-hairline) bg-(--color-surface)/92 px-2 py-1 text-center"
						style={{ left: `${x}%`, top: `${y}%`, opacity: t }}
					>
						<span className="font-(family-name:--font-display-latin) text-caption font-semibold tabular-nums text-(--color-accent-ink)">
							{monthly(l.price).toLocaleString("en-US")}
						</span>
						<span className="ms-1 text-micro text-(--color-text-muted)">جنيه/شهر</span>
					</div>
				);
			})}
		</div>
	);
}

/**
 * The seller beat. §4 scene 5 calls for "a handwritten للبيع sign" in the
 * waiting car's windscreen and the render gives us a blank white card, which
 * reads as a missing texture rather than as a for-sale notice.
 *
 * Rotated a degree and a half to sit on the windscreen's rake instead of
 * floating flat on the glass.
 */
export function ForSaleSign({ label, progress }: { label: string; progress: number }) {
	const portrait = usePortrait();
	// §4: "Amin arrives; the sign comes down." It is up for the first half of the
	// beat and gone by the end, which is the whole point of the scene.
	const gone = Math.max(0, Math.min(1, (progress - 0.55) / 0.25));
	const [x, y] = portrait ? [66, 57] : [29.5, 51.5];
	if (gone >= 1) return null;
	return (
		<div
			className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
			style={{
				left: `${x}%`,
				top: `${y}%`,
				opacity: 1 - gone,
				transform: `translate(-50%, -50%) rotate(-1.5deg) translateY(${(gone * 4).toFixed(2)}%)`,
			}}
			aria-hidden
		>
			<span className="text-[clamp(0.8rem,1.9vw,1.45rem)] font-bold text-(--color-text)">{label}</span>
		</div>
	);
}
